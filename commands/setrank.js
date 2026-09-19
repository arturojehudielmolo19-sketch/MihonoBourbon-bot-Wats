import db from '../lib/db.js'
import { isGroup, getTarget } from '../lib/permissions.js'

const VALID_RANKS = ['user', 'admin', 'superadmin']

export default {
  name: 'setrank',
  aliases: ['rango', 'darango'],
  description: 'Asigna un rango del bot a un usuario',
  minRank: 'superadmin',
  groupOnly: true,

  async run({ sock, msg, from, args }) {
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

    const rank = args[0]?.toLowerCase()
    if (!rank || !VALID_RANKS.includes(rank)) {
      return await sock.sendMessage(from, {
        text: `❌ Rangos válidos: ${VALID_RANKS.join(', ')}\n\nEjemplo: *.setrank admin @usuario*`
      }, { quoted: msg })
    }

    db.setRank(target, rank)
    const targetNumber = target.split('@')[0]

    await sock.sendMessage(from, {
      text: `✅ *@${targetNumber}* ahora tiene rango *${rank}*.`,
      mentions: [target]
    }, { quoted: msg })
  }
}
