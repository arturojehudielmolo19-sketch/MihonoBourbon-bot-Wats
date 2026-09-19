import db from '../lib/db.js'
import { isGroup, getTarget } from '../lib/permissions.js'

export default {
  name: 'ban',
  aliases: ['expulsar', 'echar'],
  description: 'Expulsa a un usuario del grupo',
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

    // No banear a alguien con rango mayor o igual
    if (db.isAtLeast(target, 'admin') && target !== sender) {
      return await sock.sendMessage(from, {
        text: `❌ No puedo expulsar a un *${db.getRank(target)}*.`
      }, { quoted: msg })
    }

    const reason = args.join(' ') || 'Sin razón especificada'
    const targetNumber = target.split('@')[0]

    try {
      await sock.groupParticipantsUpdate(from, [target], 'remove')
      await sock.sendMessage(from, {
        text: `🚫 *@${targetNumber}* fue expulsado.\n\n📝 *Razón:* ${reason}`,
        mentions: [target]
      }, { quoted: msg })
    } catch (e) {
      await sock.sendMessage(from, {
        text: `❌ No pude expulsar a @${targetNumber}.\n\n💡 Razón: ${e.message}\n\n_Asegúrate de que el bot sea admin._`,
        mentions: [target]
      }, { quoted: msg })
    }
  }
}
