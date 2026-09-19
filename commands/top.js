import db from '../lib/db.js'
import { isGroup } from '../lib/permissions.js'

export default {
  name: 'top',
  aliases: ['ranking', 'ricos', 'leaderboard'],
  description: 'Ranking de los más ricos del grupo',

  async run({ sock, msg, from }) {
    let jidsPermitidos = null

    // Si es grupo, solo mostrar usuarios del grupo
    if (isGroup(from)) {
      try {
        const metadata = await sock.groupMetadata(from)
        jidsPermitidos = new Set(
          metadata.participants.flatMap(p => {
            const ids = []
            if (typeof p === 'string') {
              ids.push(p)
            } else {
              if (p.id) ids.push(p.id)
              if (p.phoneNumber) ids.push(p.phoneNumber)
              // Convertir @lid a @s.whatsapp.net si es posible
              if (p.id?.endsWith('@lid') && p.phoneNumber) {
                ids.push(p.phoneNumber)
              }
            }
            return ids
          })
        )
      } catch (e) {
        console.error('Error obteniendo metadata:', e.message)
      }
    }

    const economy = db.economy
    let entries = Object.entries(economy)
      .map(([jid, data]) => ({
        jid,
        total: (data.money || 0) + (data.bank || 0)
      }))
      .filter(e => e.total > 0)

    // Si es grupo, filtrar solo a los que están en el grupo
    if (jidsPermitidos) {
      entries = entries.filter(e => jidsPermitidos.has(e.jid))
    }

    entries = entries.sort((a, b) => b.total - a.total).slice(0, 10)

    if (entries.length === 0) {
      return await sock.sendMessage(from, {
        text: '⚠️ Nadie del grupo tiene dinero todavía.\n\n_Usa *.work* o *.pescar* para empezar a ganar._'
      }, { quoted: msg })
    }

    let listado = `🏆 *TOP 10 MÁS RICOS*${isGroup(from) ? ' (del grupo)' : ''}\n\n`
    const mentions = []

    entries.forEach((e, i) => {
      const numero = e.jid.split('@')[0]
      const medalla = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
      listado += `${medalla} @${numero} → *$${e.total.toLocaleString('es-MX')}*\n`
      mentions.push(e.jid)
    })

    await sock.sendMessage(from, {
      text: listado,
      mentions
    }, { quoted: msg })
  }
}
