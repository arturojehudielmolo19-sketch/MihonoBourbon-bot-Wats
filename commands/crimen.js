import db from '../lib/db.js'

const COOLDOWN = 15 * 60 * 1000 // 15 minutos

const CRIMENES = [
  { nombre: 'Robar una tienda', emoji: '🏪', exito: 0.5, min: 500, max: 1500 },
  { nombre: 'Asaltar un banco', emoji: '🏦', exito: 0.3, min: 1000, max: 5000 },
  { nombre: 'Hackear una cuenta', emoji: '💻', exito: 0.6, min: 300, max: 1200 },
  { nombre: 'Vender cosas robadas', emoji: '📦', exito: 0.7, min: 200, max: 800 },
  { nombre: 'Estafa piramidal', emoji: '📈', exito: 0.4, min: 800, max: 3000 },
  { nombre: 'Contrabando', emoji: '🚢', exito: 0.35, min: 1000, max: 4000 }
]

export default {
  name: 'crimen',
  aliases: ['crime', 'delinquir'],
  description: 'Comete un crimen (alto riesgo, alta recompensa)',

  async run({ sock, msg, from, sender }) {
    const lastCrime = db.getCooldown(from, sender, 'Crime')
    const now = Date.now()
    const simbolo = db.getMonedaSimbolo()
    const moneda = db.getMonedaNombre()

    if (now - lastCrime < COOLDOWN) {
      const remaining = COOLDOWN - (now - lastCrime)
      const min = Math.floor(remaining / 60000)
      const seg = Math.floor((remaining % 60000) / 1000)
      return await sock.sendMessage(from, {
        text: `🚔 La policía está patrullando. Espera *${min}m ${seg}s* antes de otro crimen.`
      }, { quoted: msg })
    }

    db.setCooldown(from, sender, 'Crime', now)

    const crimen = CRIMENES[Math.floor(Math.random() * CRIMENES.length)]
    const exito = Math.random() < crimen.exito
    const senderNumber = sender.split('@')[0]

    if (exito) {
      const ganancia = Math.floor(Math.random() * (crimen.max - crimen.min + 1)) + crimen.min
      db.addMoney(from, sender, ganancia)
      const total = db.getMoney(from, sender)

      await sock.sendMessage(from, {
        text: `${crimen.emoji} *¡CRIMEN EXITOSO!*\n\n@${senderNumber} logró: *${crimen.nombre}*\n\n💰 Ganaste: *${simbolo} ${ganancia.toLocaleString('es-MX')}* ${moneda}\n💳 Total: *${simbolo} ${total.toLocaleString('es-MX')}*`,
        mentions: [sender]
      }, { quoted: msg })
    } else {
      // Multa + posible carcel
      const multa = Math.min(
        Math.floor(Math.random() * 1000) + 300,
        db.getMoney(from, sender)
      )
      db.addMoney(from, sender, -multa)
      const total = db.getMoney(from, sender)

      await sock.sendMessage(from, {
        text: `🚔 *¡TE ATRAPARON!*\n\n@${senderNumber} intentó: *${crimen.nombre}* pero la policía lo arrestó.\n\n💸 Multa: *${simbolo} ${multa.toLocaleString('es-MX')}* ${moneda}\n💳 Total: *${simbolo} ${total.toLocaleString('es-MX')}*`,
        mentions: [sender]
      }, { quoted: msg })
    }
  }
}
