import db from '../lib/db.js'
import { isGroup, getTarget } from '../lib/permissions.js'

export default {
  name: 'unwarn',
  aliases: ['delwarn', 'quitarwarn'],
  description: 'Quita una advertencia a un usuario',
  minRank: 'admin',
  groupOnly: true,

  async run({ sock, msg, from, args, sender }) {
    if (!isGroup(from)) {
      return await sock.sendMessage(from, {
        text: '❌ Este comando solo funciona en grupos.'
      }, { quoted: msg })
    }

    const target = getTarget(msg)
    if (!target) {
      return await sock.sendMessage(from, {
        text: '❌ Menciona a alguien o responde a su mensaje.'
      }, { quoted: msg })
    }

    const warns = db.getWarns(from, target)
    if (warns.length === 0) {
      return await sock.sendMessage(from, {
        text: '❌ Ese usuario no tiene advertencias.'
      }, { quoted: msg })
    }

    // Quitar la última advertencia
    warns.pop()
    if (warns.length === 0) {
      db.clearWarns(from, target)
    } else {
      db.warns[from][target] = warns
      db.saveWarns()
    }

    const targetNumber = target.split('@')[0]
    await sock.sendMessage(from, {
      text: `✅ Advertencia eliminada a @${targetNumber}\n\n⚠️ Ahora tiene *${warns.length}/3* advertencias.`,
      mentions: [target]
    }, { quoted: msg })
  }
}
