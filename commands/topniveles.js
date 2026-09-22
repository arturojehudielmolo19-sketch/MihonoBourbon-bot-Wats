import db from '../lib/db.js'
import { isGroup } from '../lib/permissions.js'

export default {
  name: 'topniveles',
  aliases: ['toplevel', 'topxp', 'niveles'],
  description: 'Ranking de niveles del grupo',

  async run({ sock, msg, from }) {
    const nivelesChat = db.levels[from] || {}

    let entries = Object.entries(nivelesChat)
      .map(([jid, data]) => ({
        jid,
        level: data.level || 1,
        xp: data.xp || 0,
        messages: data.messages || 0
      }))
      .filter(e => e.xp > 0)
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10)

    if (entries.length === 0) {
      return await sock.sendMessage(from, {
        text: '⚠️ Nadie tiene XP todavía en este chat.'
      }, { quoted: msg })
    }

    let listado = `🏆 *TOP 10 NIVELES*${isGroup(from) ? ' (del grupo)' : ''}\n\n`
    const mentions = []

    entries.forEach((e, i) => {
      const numero = e.jid.split('@')[0]
      const medalla = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
      listado += `${medalla} @${numero} → *Nivel ${e.level}* (${e.xp} XP)\n`
      mentions.push(e.jid)
    })

    await sock.sendMessage(from, {
      text: listado,
      mentions
    }, { quoted: msg })
  }
}
