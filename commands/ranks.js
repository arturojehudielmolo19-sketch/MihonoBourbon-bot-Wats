import db from '../lib/db.js'

export default {
  name: 'ranks',
  aliases: ['rangos', 'lista'],
  description: 'Muestra los rangos del bot',

  async run({ sock, msg, from }) {
    const ranks = db.ranks

    if (Object.keys(ranks).length === 0) {
      return await sock.sendMessage(from, {
        text: '⚠️ No hay rangos asignados todavía.'
      }, { quoted: msg })
    }

    let listado = '👑 *RANGOS DEL BOT*\n\n'
    for (const [jid, rank] of Object.entries(ranks)) {
      const numero = jid.split('@')[0]
      listado += `• @${numero} → *${rank}*\n`
    }

    await sock.sendMessage(from, {
      text: listado,
      mentions: Object.keys(ranks)
    }, { quoted: msg })
  }
}
