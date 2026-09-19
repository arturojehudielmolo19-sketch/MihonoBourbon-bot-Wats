import db from '../lib/db.js'
import { isGroup, getTarget } from '../lib/permissions.js'

export default {
  name: 'warns',
  aliases: ['advertencias', 'verwarns'],
  description: 'Muestra las advertencias de un usuario',
  groupOnly: true,

  async run({ sock, msg, from, sender }) {
    if (!isGroup(from)) {
      return await sock.sendMessage(from, {
        text: '❌ Este comando solo funciona en grupos.'
      }, { quoted: msg })
    }

    const target = getTarget(msg) || sender
    const warns = db.getWarns(from, target)
    const targetNumber = target.split('@')[0]

    if (warns.length === 0) {
      return await sock.sendMessage(from, {
        text: `✅ @${targetNumber} no tiene advertencias.`,
        mentions: [target]
      }, { quoted: msg })
    }

    let listado = `⚠️ *Advertencias de @${targetNumber}* (${warns.length}/3)\n\n`
    warns.forEach((w, i) => {
      const fecha = new Date(w.date).toLocaleDateString('es-MX')
      listado += `*${i + 1}.* ${w.reason}\n   _${fecha}_\n\n`
    })

    await sock.sendMessage(from, {
      text: listado,
      mentions: [target]
    }, { quoted: msg })
  }
}
