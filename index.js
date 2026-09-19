import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { isGroup, isAdmin } from './lib/permissions.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const logger = pino({ level: 'silent' })

const PREFIXES = ['.', '/', '#', '!']
const PREFIX = '.'

const commands = new Map()

async function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands')

  if (!fs.existsSync(commandsPath)) {
    console.log('⚠️ No existe la carpeta commands/')
    return
  }

  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))

  for (const file of files) {
    try {
      const filePath = path.join(commandsPath, file)
      const module = await import(`file://${filePath}`)
      const command = module.default

      if (command?.name) {
        commands.set(command.name, command)
        if (command.aliases) {
          for (const alias of command.aliases) {
            commands.set(alias, command)
          }
        }
        console.log(`✅ Comando cargado: ${command.name}`)
      }
    } catch (e) {
      console.error(`❌ Error cargando ${file}:`, e.message)
    }
  }

  console.log(`📦 Total de comandos: ${commands.size}\n`)
}

async function setupGroupEvents(sock) {
  const { default: db } = await import('./lib/db.js')

  sock.ev.on('group-participants.update', async (update) => {
    const { id: groupId, participants, action } = update

    try {
      const metadata = await sock.groupMetadata(groupId)
      const groupName = metadata.subject

      for (const participantData of participants) {
        const participant = typeof participantData === 'string'
          ? participantData
          : (participantData.phoneNumber || participantData.id)
        const userNumber = participant.split('@')[0]

        if (action === 'add') {
          const welcomeOn = db.getGroupSetting(groupId, 'welcome', false)
          if (!welcomeOn) continue

          const customText = db.getGroupSetting(groupId, 'welcomeText', '')
          const text = customText
            ? customText.replace(/@user/g, `@${userNumber}`).replace(/@group/g, groupName)
            : `👋 ¡Bienvenido/a @${userNumber}!\n\n🎉 Gracias por unirte a *${groupName}*.`

          await sock.sendMessage(groupId, {
            text,
            mentions: [participant]
          })
        }

        if (action === 'remove') {
          const byeOn = db.getGroupSetting(groupId, 'bye', false)
          if (!byeOn) continue

          const customText = db.getGroupSetting(groupId, 'byeText', '')
          const text = customText
            ? customText.replace(/@user/g, `@${userNumber}`).replace(/@group/g, groupName)
            : `👋 *@${userNumber}* ha salido del grupo.`

          await sock.sendMessage(groupId, {
            text,
            mentions: [participant]
          })
        }
      }
    } catch (e) {
      console.error('Error en group-participants.update:', e.message)
    }
  })
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')
  const { version } = await fetchLatestBaileysVersion()

  console.log(`🚀 Iniciando bot con Baileys v${version.join('.')}`)

  const sock = makeWASocket({
    version,
    logger,
    auth: state,
    printQRInTerminal: false
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('\n📱 Escanea este QR con WhatsApp:\n')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const shouldReconnect =
        new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('❌ Conexión cerrada. Reconectar:', shouldReconnect)
      if (shouldReconnect) startBot()
    } else if (connection === 'open') {
      console.log('✅ Bot conectado a WhatsApp\n')
    }
  })

  await setupGroupEvents(sock)

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    const msg = messages[0]
    if (!msg.message) return

    const from = msg.key.remoteJid

    const sender =
      msg.key.participant ||
      msg.participant ||
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      msg.key.remoteJidAlt ||
      msg.key.remoteJid

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    // Detectar prefijo
    const usedPrefix = PREFIXES.find(p => text.startsWith(p))
    if (msg.key.fromMe && !usedPrefix) return
    if (!usedPrefix) return

    const { default: db } = await import('./lib/db.js')

    if (db.isBanned(sender) && sender !== sock.user?.id) {
      return
    }

    // ---- ANTILINK ----
    if (isGroup(from)) {
      const antilinkOn = db.getGroupSetting(from, 'antilink', false)
      if (antilinkOn) {
        const hasLink = /(https?:\/\/|www\.|chat\.whatsapp\.com|t\.me\/)/i.test(text)
        const senderIsAdmin = await isAdmin(sock, from, sender)
        if (hasLink && !senderIsAdmin) {
          try {
            await sock.sendMessage(from, { delete: msg.key })
            await sock.sendMessage(from, {
              text: `🔗 @${sender.split('@')[0]} los links están prohibidos.`,
              mentions: [sender]
            })
          } catch (e) {
            console.error('Antilink error:', e.message)
          }
          return
        }
      }
    }

    const args = text.slice(usedPrefix.length).trim().split(/\s+/)
    const commandName = args.shift().toLowerCase()

    const command = commands.get(commandName)
    if (!command) return

    if (command.minRank && !db.isAtLeast(sender, command.minRank)) {
      return await sock.sendMessage(from, {
        text: `❌ Este comando requiere rango *${command.minRank}* o superior.`
      }, { quoted: msg })
    }

    console.log(`⚡ Ejecutando: ${commandName} | de: ${sender} | rango: ${db.getRank(sender)}`)

    try {
      await command.run({ sock, msg, from, args, text, sender, usedPrefix })
    } catch (e) {
      console.error(`❌ Error en ${commandName}:`, e)
      await sock.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: msg })
    }
  })
}

await loadCommands()
startBot()
