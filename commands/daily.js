import db from '../lib/db.js'

const COOLDOWN = 24 * 60 * 60 * 1000 // 24 horas

export default {
  name: 'daily',
  aliases: ['diario', 'reclamar'],
  description: 'Reclama tu recompensa diaria',

  async run({ sock, msg, from, sender }) {
    const daily = db.getDailyData(sender)
    const now = Date.now()
    const simbolo = db.getMonedaSimbolo()
    const moneda = db.getMonedaNombre()

    const elapsed = now - daily.lastDaily

    if (elapsed < COOLDOWN) {
      const remaining = COOLDOWN - elapsed
      const horas = Math.floor(remaining / (60 * 60 * 1000))
      const min = Math.floor((remaining % (60 * 60 * 1000)) / 60000)
      return await sock.sendMessage(from, {
        text: `⏰ Ya reclamaste tu recompensa hoy.\n\nVuelve en *${horas}h ${min}m*.\n\n🔥 Racha actual: *${daily.streak} días*`
      }, { quoted: msg })
    }

    // Verificar si mantiene la racha
    const mantenerRacha = elapsed < COOLDOWN * 2 // Si reclama antes de 48h, mantiene racha
    const nuevaRacha = mantenerRacha ? daily.streak + 1 : 1

    // Recompensa base + bonus por racha
    const base = 500
    const bonusRacha = Math.min(nuevaRacha * 50, 1000) // Máximo 1000 de bonus
    const total = base + bonusRacha

    db.addMoney(from, sender, total)
    db.setDailyData(sender, {
      lastDaily: now,
      streak: nuevaRacha
    })

    const senderNumber = sender.split('@')[0]

    let texto = `🎁 *RECOMPENSA DIARIA*\n\n@${senderNumber} reclamó su recompensa\n\n`
    texto += `💰 Base: *${simbolo} ${base.toLocaleString('es-MX')}*\n`
    if (bonusRacha > 0) {
      texto += `🔥 Bonus racha (${nuevaRacha} días): *+${simbolo} ${bonusRacha.toLocaleString('es-MX')}*\n`
    }
    texto += `\n💎 *Total: ${simbolo} ${total.toLocaleString('es-MX')}* ${moneda}`

    if (nuevaRacha === 7) {
      texto += `\n\n🎉 *¡7 días seguidos! Sigue así* 🚀`
    } else if (nuevaRacha === 30) {
      texto += `\n\n🏆 *¡30 días seguidos! Eres leyenda* 👑`
    }

    await sock.sendMessage(from, {
      text: texto,
      mentions: [sender]
    }, { quoted: msg })
  }
}
