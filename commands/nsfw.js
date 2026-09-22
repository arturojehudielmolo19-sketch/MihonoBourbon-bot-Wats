import db from '../lib/db.js'
import { isGroup } from '../lib/permissions.js'

export default {
  name: 'nsfw',
  aliases: ['nsfwconfig', '+18', 'adult'],
  description: 'Activa/desactiva comandos +18 (solo admin)',
  groupOnly: true,

  async run({ sock, msg, from, args, sender, usedPrefix = '.' }) {
    if (!isGroup(from)) {
      return await sock.sendMessage(from, {
        text: '❌ Este comando solo funciona en grupos.'
      }, { quoted: msg })
    }

    const subcommand = args[0]?.toLowerCase()

    // Sin argumentos: mostrar estado
    if (!subcommand) {
      const activo = db.getGroupSetting(from, 'nsfw', false)
      return await sock.sendMessage(from, {
        text: `🔞 *CONTENIDO +18*\n\nEstado: *${activo ? '✅ ACTIVADO' : '❌ DESACTIVADO'}*\n\n*Uso:*\n• *${usedPrefix}nsfw on* ── Activar (solo admin)\n• *${usedPrefix}nsfw off* ── Desactivar (solo admin)\n• *${usedPrefix}nsfw menu* ── Ver comandos disponibles\n\n⚠️ *Solo contenido sugerente, no explícito.*`
      }, { quoted: msg })
    }

    // Verificar permisos
    const esAdmin = db.isAtLeast(sender, 'admin')
    const adminsWa = await (async () => {
      try {
        const metadata = await sock.groupMetadata(from)
        const p = metadata.participants.find(x => (x.id || x) === sender)
        return p?.admin === 'admin' || p?.admin === 'superadmin'
      } catch { return false }
    })()

    if (!esAdmin && !adminsWa) {
      return await sock.sendMessage(from, {
        text: '❌ Solo los *admins* pueden activar/desactivar esto.'
      }, { quoted: msg })
    }

    // ON
    if (subcommand === 'on') {
      db.setGroupSetting(from, 'nsfw', true)
      return await sock.sendMessage(from, {
        text: `🔞 *MODO +18 ACTIVADO*\n\n⚠️ Este grupo ahora tiene acceso a comandos con contenido sugerente.\n\n• Usa *${usedPrefix}nsfw menu* para ver los comandos.\n• Solo contenido *sugerente*, no explícito.\n• Usa *${usedPrefix}nsfw off* para desactivarlo.`
      }, { quoted: msg })
    }

    // OFF
    if (subcommand === 'off') {
      db.setGroupSetting(from, 'nsfw', false)
      return await sock.sendMessage(from, {
        text: '✅ *MODO +18 DESACTIVADO*\n\nLos comandos +18 ya no están disponibles en este grupo.'
      }, { quoted: msg })
    }

    // MENU
    if (subcommand === 'menu') {
      const activo = db.getGroupSetting(from, 'nsfw', false)
      if (!activo) {
        return await sock.sendMessage(from, {
          text: `❌ El modo +18 está desactivado en este grupo.\n\nUn admin puede activarlo con *${usedPrefix}nsfw on*.`
        }, { quoted: msg })
      }

      return await sock.sendMessage(from, {
        text: `🔞 *COMANDOS +18 DISPONIBLES*\n\n• *${usedPrefix}waifu* ── Waifu aleatoria\n• *${usedPrefix}neko* ── Neko aleatoria\n• *${usedPrefix}nsfwrandom* ── Imagen aleatoria\n\n⚠️ Solo contenido *sugerente*, no explícito.`
      }, { quoted: msg })
    }

    return await sock.sendMessage(from, {
      text: `❌ Subcomando no reconocido.\n\nUsa *${usedPrefix}nsfw* para ver las opciones.`
    }, { quoted: msg })
  }
}
