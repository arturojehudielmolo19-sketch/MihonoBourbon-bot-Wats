import db from '../lib/db.js'
import { isGroup } from '../lib/permissions.js'

export default {
  name: 'top',
  aliases: ['ranking', 'ricos', 'leaderboard'],
  description: 'Ranking de los más ricos del grupo',

  async run({ sock, msg, from }) {
    const economiaChat = db.economy[from] || {}

    let entries = Object.entries(economiaChat)
      .map(([jid, data]) => ({
        jid,
        total: (data.money || 0) + (data.bank || 0)
      }))
      .filter(e => e.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    if (entries.length === 0) {
      return await sock.sendMessage(from, {
        text: '⚠️ Nadie tiene dinero todavía en este chat.\n\n_Usa *.work* o *.pescar* para empezar a ganar._'
      }, { quoted: msg })
    }

    const simbolo = db.getMonedaSimbolo()
    const moneda = db.getMonedaNombre()

    let listado = `🏆 *TOP 10 MÁS RICOS*${isGroup(from) ? ' (del grupo)' : ''}\n\n`
    const mentions = []

    entries.forEach((e, i) => {
      const numero = e.jid.split('@')[0]
      const medalla = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
      listado += `${medalla} @${numero} → *${simbolo} ${e.total.toLocaleString('es-MX')}*\n`
      mentions.push(e.jid)
    })

    listado += `\n_Total en ${moneda}_`

    await sock.sendMessage(from, {
      text: listado,
      mentions
    }, { quoted: msg })
  }
}
