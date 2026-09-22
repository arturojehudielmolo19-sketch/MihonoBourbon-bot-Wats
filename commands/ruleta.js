import db from '../lib/db.js'

export default {
  name: 'ruleta',
  aliases: ['roulette', 'apostar'],
  description: 'Apuesta dinero en la ruleta',
  usage: '.ruleta <cantidad> [color]',

  async run({ sock, msg, from, sender, args }) {
    const amount = parseInt(args[0])
    const simbolo = db.getMonedaSimbolo()
    const moneda = db.getMonedaNombre()

    if (!amount || amount <= 0) {
      return await sock.sendMessage(from, {
        text: `❌ Uso: *.ruleta <cantidad>*\nEjemplo: *.ruleta 100*`
      }, { quoted: msg })
    }

    // Cooldown de apuestas
    const config = db.economyConfig.apuestas || {}
    const cooldownSeg = config.cooldownSegundos || 0
    const lastBet = db.getCooldown(from, sender, 'Bet')
    const now = Date.now()

    if (cooldownSeg > 0 && now - lastBet < cooldownSeg * 1000) {
      const remaining = Math.ceil((cooldownSeg * 1000 - (now - lastBet)) / 1000)
      return await sock.sendMessage(from, {
        text: `🎰 Espera *${remaining}s* antes de volver a apostar.`
      }, { quoted: msg })
    }

    const balance = db.getMoney(from, sender)
    if (balance < amount) {
      return await sock.sendMessage(from, {
        text: `💸 No tienes suficiente dinero.\n\n💰 Tu saldo: *${simbolo} ${balance.toLocaleString('es-MX')}* ${moneda}`
      }, { quoted: msg })
    }

    const ruleta = [
      { color: '🔴 ROJO', mult: 2, prob: 0.475 },
      { color: '⚫ NEGRO', mult: 2, prob: 0.475 },
      { color: '🟢 VERDE', mult: 14, prob: 0.05 }
    ]

    const random = Math.random()
    let resultado
    let acumulado = 0
    for (const r of ruleta) {
      acumulado += r.prob
      if (random < acumulado) {
        resultado = r
        break
      }
    }
    if (!resultado) resultado = ruleta[0]

    const apuestaUsuario = args[1]?.toLowerCase() || 'rojo'
    const apuestaColor = {
      rojo: '🔴 ROJO',
      red: '🔴 ROJO',
      negro: '⚫ NEGRO',
      black: '⚫ NEGRO',
      verde: '🟢 VERDE',
      green: '🟢 VERDE'
    }[apuestaUsuario] || '🔴 ROJO'

    const gano = apuestaColor === resultado.color
    const senderNumber = sender.split('@')[0]

    db.setCooldown(from, sender, 'Bet', now)

    if (gano) {
      const ganancia = amount * (resultado.mult - 1)
      db.addMoney(from, sender, ganancia)
      const total = db.getMoney(from, sender)

      await sock.sendMessage(from, {
        text: `🎰 *RULETA*\n\n@${senderNumber} apostó *${simbolo} ${amount.toLocaleString('es-MX')}* a *${apuestaColor}*\n\n🎯 Salió: *${resultado.color}*\n\n🎉 ¡GANASTE *${simbolo} ${ganancia.toLocaleString('es-MX')}* ${moneda}!\n💳 Total: *${simbolo} ${total.toLocaleString('es-MX')}*`,
        mentions: [sender]
      }, { quoted: msg })
    } else {
      db.addMoney(from, sender, -amount)
      const total = db.getMoney(from, sender)

      await sock.sendMessage(from, {
        text: `🎰 *RULETA*\n\n@${senderNumber} apostó *${simbolo} ${amount.toLocaleString('es-MX')}* a *${apuestaColor}*\n\n🎯 Salió: *${resultado.color}*\n\n😢 Perdiste *${simbolo} ${amount.toLocaleString('es-MX')}* ${moneda}.\n💳 Total: *${simbolo} ${total.toLocaleString('es-MX')}*`,
        mentions: [sender]
      }, { quoted: msg })
    }
  }
}
