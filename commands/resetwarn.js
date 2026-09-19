import db from '../lib/db.js'
import { isGroup, getTarget } from '../lib/permissions.js'

export default {
  name: 'resetwarn',
  aliases: ['clearwarns', 'limpiarwarns'],
  description: 'Borra todas las advertencias de un usuario',
  minRank: 'admin',
  groupOnly: true,

  async run({ sock, msg, from }) {
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

    db.clearWarns(from, target)
    const targetNumber = target.split('@')[0]

    await sock.sendMessage(from, {
      text: `✅ Todas las advertencias de @${targetNumber} han sido eliminadas.`,
      mentions: [target]
    }, { quoted: msg })
  }
}
