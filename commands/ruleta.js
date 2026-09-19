import db from '../lib/db.js'

export default {
  name: 'ruleta',
  aliases: ['roulette', 'apostar'],
  description: 'Apuesta dinero en la ruleta',
  usage: '.ruleta <cantidad>',

  async run({ sock, msg, from, sender, args }) {
    const amount = parseInt(args[0])

    if (!amount || amount <= 0) {
      return await sock.sendMessage(from, {
        text: '❌ Uso: *.ruleta <cantidad>*\nEjemplo: *.ruleta 100*'
      }, { quoted: msg })
    }

    const balance = db.getMoney(sender)
    if (balance < amount) {
      return await sock.sendMessage(from, {
        text: `💸 No tienes suficiente dinero.\n\n💰 Tu saldo: *$${balance}*`
      }, { quoted: msg })
    }

    // 3 opciones: rojo (rojo), negro (negro), verde (verde - más raro)
    const ruleta = [
      { color: '🔴 ROJO', mult: 2, prob: 0.475 },
      { color: '⚫ NEGRO', mult: 2, prob: 0.475 },
      { color: '🟢 VERDE', mult: 14, prob: 0.05 }
    ]

    // Elegir resultado según probabilidades
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

    // Elegir la apuesta del usuario (rojo por defecto)
    const apuestaUsuario = args[1]?.toLowerCase() || 'rojo'

    // Mapeo de apuesta a color
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

    if (gano) {
      const ganancia = amount * (resultado.mult - 1)
      db.addMoney(sender, ganancia)
      const total = db.getMoney(sender)

      await sock.sendMessage(from, {
        text: `🎰 *RULETA*\n\n@${senderNumber} apostó *$${amount}* a *${apuestaColor}*\n\n🎯 Salió: *${resultado.color}*\n\n🎉 ¡GANASTE *$${ganancia}*!\n💳 Total: *$${total}*`,
        mentions: [sender]
      }, { quoted: msg })
    } else {
      db.addMoney(sender, -amount)
      const total = db.getMoney(sender)

      await sock.sendMessage(from, {
        text: `🎰 *RULETA*\n\n@${senderNumber} apostó *$${amount}* a *${apuestaColor}*\n\n🎯 Salió: *${resultado.color}*\n\n😢 Perdiste *$${amount}*.\n💳 Total: *$${total}*`,
        mentions: [sender]
      }, { quoted: msg })
    }
  }
}
