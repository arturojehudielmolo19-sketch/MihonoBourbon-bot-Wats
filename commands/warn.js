import db from '../lib/db.js'
import { isAdmin, isBotAdmin, isGroup, getTarget } from '../lib/permissions.js'

export default {
  name: 'warn',
  aliases: ['advertir', 'w'],
  description: 'Advierte a un usuario (3 warns = expulsión)',
  adminOnly: true,
  groupOnly: true,

  async run({ sock, msg, from, args, sender }) {
    // Verificar que sea grupo
    if (!isGroup(from)) {
      return await sock.sendMessage(from, {
        text: '❌ Este comando solo funciona en grupos.'
      }, { quoted: msg })
    }

    // Verificar que quien manda sea admin
    if (!(await isAdmin(sock, from, sender))) {
      return await sock.sendMessage(from, {
        text: '❌ Solo los *admins* pueden usar este comando.'
      }, { quoted: msg })
    }

    // Obtener el objetivo
    const target = getTarget(msg)
    if (!target) {
      return await sock.sendMessage(from, {
        text: '❌ Menciona a alguien o responde a su mensaje con *.warn*.'
      }, { quoted: msg })
    }

    // No se puede advertir a un admin
    if (await isAdmin(sock, from, target)) {
      return await sock.sendMessage(from, {
        text: '❌ No puedo advertir a un *admin*.'
      }, { quoted: msg })
    }

    const reason = args.join(' ') || 'Sin razón especificada'
    const count = db.addWarn(from, target, reason)
    const targetNumber = target.split('@')[0]
    const MAX_WARNS = 3

    if (count >= MAX_WARNS) {
      try {
        await sock.groupParticipantsUpdate(from, [target], 'remove')
        db.clearWarns(from, target)
        await sock.sendMessage(from, {
          text: `🚫 *@${targetNumber}* fue expulsado por acumular ${MAX_WARNS} advertencias.\n\n📝 *Última razón:* ${reason}`,
          mentions: [target]
        }, { quoted: msg })
      } catch (e) {
        await sock.sendMessage(from, {
          text: `❌ No pude expulsar a @${targetNumber}: ${e.message}`,
          mentions: [target]
        }, { quoted: msg })
      }
    } else {
      await sock.sendMessage(from, {
        text: `⚠️ *Advertencia ${count}/${MAX_WARNS}*\n\n👤 Usuario: @${targetNumber}\n📝 Razón: ${reason}\n\n_Al llegar a ${MAX_WARNS} será expulsado._`,
        mentions: [target]
      }, { quoted: msg })
    }
  }
}
