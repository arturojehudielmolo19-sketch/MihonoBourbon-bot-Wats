import db from '../lib/db.js'
import { getTarget, isGroup } from '../lib/permissions.js'

export default {
  name: 'nivel',
  aliases: ['level', 'lvl', 'xp'],
  description: 'Muestra tu nivel y XP',

  async run({ sock, msg, from, sender }) {
    const target = getTarget(msg) || sender
    const targetNumber = target.split('@')[0]

    const data = db.getLevelData(from, target)
    const xpActual = data.xp
    const nivelActual = data.level
    const xpSiguiente = db.getXPForNextLevel(nivelActual)
    const xpAnterior = nivelActual === 1 ? 0 : db.getXPForNextLevel(nivelActual - 1)

    const xpEnNivel = xpActual - xpAnterior
    const xpNecesario = xpSiguiente - xpAnterior
    const porcentaje = Math.floor((xpEnNivel / xpNecesario) * 100)

    // Barra de progreso
    const bloquesTotales = 10
    const bloquesLlenos = Math.floor((porcentaje / 100) * bloquesTotales)
    const barra = '█'.repeat(bloquesLlenos) + '░'.repeat(bloquesTotales - bloquesLlenos)

    await sock.sendMessage(from, {
      text: `📊 *NIVEL DE @${targetNumber}*\n\n🎯 Nivel: *${nivelActual}*\n📈 XP: *${xpActual.toLocaleString('es-MX')}*\n💬 Mensajes: *${data.messages.toLocaleString('es-MX')}*\n\n*Progreso al nivel ${nivelActual + 1}*\n${barra} *${porcentaje}%*\n_${xpEnNivel}/${xpNecesario} XP_`,
      mentions: [target]
    }, { quoted: msg })
  }
}
