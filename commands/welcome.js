import db from '../lib/db.js'
import { isGroup } from '../lib/permissions.js'

export default {
  name: 'welcome',
  aliases: ['bienvenida', 'welcome'],
  description: 'Configura los mensajes de bienvenida/despedida',
  minRank: 'admin',
  groupOnly: true,

  async run({ sock, msg, from, args }) {
    if (!isGroup(from)) {
      return await sock.sendMessage(from, {
        text: '❌ Este comando solo funciona en grupos.'
      }, { quoted: msg })
    }

    const subcommand = args[0]?.toLowerCase()

    if (!subcommand) {
      const welcomeOn = db.getGroupSetting(from, 'welcome', false)
      const byeOn = db.getGroupSetting(from, 'bye', false)
      const welcomeText = db.getGroupSetting(from, 'welcomeText', '')
      const byeText = db.getGroupSetting(from, 'byeText', '')

      return await sock.sendMessage(from, {
        text: `⚙️ *Configuración de bienvenida*\n\n👋 Bienvenida: *${welcomeOn ? 'ON' : 'OFF'}*\n👋 Despedida: *${byeOn ? 'ON' : 'OFF'}*\n\n📝 Texto bienvenida: ${welcomeText || '(por defecto)'}\n📝 Texto despedida: ${byeText || '(por defecto)'}\n\n*Uso:*\n• *.welcome on* / *.welcome off*\n• *.welcome bye on* / *.welcome bye off*\n• *.welcome set <texto>* (usa @user para mencionar)\n• *.welcome setbye <texto>*`
      }, { quoted: msg })
    }

    if (subcommand === 'on') {
      db.setGroupSetting(from, 'welcome', true)
      return await sock.sendMessage(from, {
        text: '✅ Bienvenida *ACTIVADA*'
      }, { quoted: msg })
    }

    if (subcommand === 'off') {
      db.setGroupSetting(from, 'welcome', false)
      return await sock.sendMessage(from, {
        text: '❌ Bienvenida *DESACTIVADA*'
      }, { quoted: msg })
    }

    if (subcommand === 'bye' && args[1]) {
      const val = args[1].toLowerCase() === 'on'
      db.setGroupSetting(from, 'bye', val)
      return await sock.sendMessage(from, {
        text: `${val ? '✅' : '❌'} Despedida *${val ? 'ACTIVADA' : 'DESACTIVADA'}*`
      }, { quoted: msg })
    }

    if (subcommand === 'set') {
      const text = args.slice(1).join(' ')
      if (!text) {
        return await sock.sendMessage(from, {
          text: '❌ Escribe el texto después de *.welcome set*'
        }, { quoted: msg })
      }
      db.setGroupSetting(from, 'welcomeText', text)
      return await sock.sendMessage(from, {
        text: `✅ Texto de bienvenida actualizado:\n\n${text}`
      }, { quoted: msg })
    }

    if (subcommand === 'setbye') {
      const text = args.slice(1).join(' ')
      if (!text) {
        return await sock.sendMessage(from, {
          text: '❌ Escribe el texto después de *.welcome setbye*'
        }, { quoted: msg })
      }
      db.setGroupSetting(from, 'byeText', text)
      return await sock.sendMessage(from, {
        text: `✅ Texto de despedida actualizado:\n\n${text}`
      }, { quoted: msg })
    }

    return await sock.sendMessage(from, {
      text: '❌ Subcomando no reconocido. Usa *.welcome* para ver las opciones.'
    }, { quoted: msg })
  }
}
