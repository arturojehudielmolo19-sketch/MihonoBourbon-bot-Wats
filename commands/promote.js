import { isGroup, getTarget } from '../lib/permissions.js'

export default {
  name: 'promote',
  aliases: ['ascender', 'daradmin'],
  description: 'Hace admin del grupo a un usuario',
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

    const targetNumber = target.split('@')[0]

    try {
      await sock.groupParticipantsUpdate(from, [target], 'promote')
      await sock.sendMessage(from, {
        text: `👑 *@${targetNumber}* ahora es admin del grupo.`,
        mentions: [target]
      }, { quoted: msg })
    } catch (e) {
      await sock.sendMessage(from, {
        text: `❌ No pude ascender a @${targetNumber}.\n\n💡 ${e.message}`,
        mentions: [target]
      }, { quoted: msg })
    }
  }
}
