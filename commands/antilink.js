import db from '../lib/db.js'
import { isGroup } from '../lib/permissions.js'

export default {
  name: 'antilink',
  aliases: ['antienlaces'],
  description: 'Activa/desactiva el borrado automático de links',
  minRank: 'admin',
  groupOnly: true,

  async run({ sock, msg, from, args }) {
    if (!isGroup(from)) {
      return await sock.sendMessage(from, {
        text: '❌ Este comando solo funciona en grupos.'
      }, { quoted: msg })
    }

    const option = args[0]?.toLowerCase()

    if (!option || !['on', 'off', 'true', 'false'].includes(option)) {
      const estado = db.getGroupSetting(from, 'antilink', false)
      return await sock.sendMessage(from, {
        text: `🔗 *Antilink* está actualmente *${estado ? 'ACTIVADO' : 'DESACTIVADO'}*.\n\nUso: *.antilink on* o *.antilink off*`
      }, { quoted: msg })
    }

    const value = option === 'on' || option === 'true'
    db.setGroupSetting(from, 'antilink', value)

    await sock.sendMessage(from, {
      text: `✅ *Antilink ${value ? 'ACTIVADO' : 'DESACTIVADO'}*\n\n${value ? 'Los links serán eliminados automáticamente.' : 'Los links ya no serán eliminados.'}`
    }, { quoted: msg })
  }
}
