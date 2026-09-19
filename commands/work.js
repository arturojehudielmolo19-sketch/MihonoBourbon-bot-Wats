import db from '../lib/db.js'

const COOLDOWN = 1000 * 60 * 5 // 5 minutos

const trabajos = [
  { nombre: 'programador', pago: [80, 200] },
  { nombre: 'streamer', pago: [50, 300] },
  { nombre: 'diseñador', pago: [70, 180] },
  { nombre: 'chef', pago: [60, 150] },
  { nombre: 'mecánico', pago: [50, 140] },
  { nombre: 'profesor', pago: [80, 170] },
  { nombre: 'youtuber', pago: [40, 250] },
  { nombre: 'vendedor', pago: [60, 160] }
]

export default {
  name: 'work',
  aliases: ['trabajar', 'chamba'],
  description: 'Trabaja para ganar dinero',

  async run({ sock, msg, from, sender }) {
    const lastWork = db.getCooldown(sender, 'Work')
    const now = Date.now()

    if (now - lastWork < COOLDOWN) {
      const remaining = COOLDOWN - (now - lastWork)
      const min = Math.floor(remaining / 60000)
      const seg = Math.floor((remaining % 60000) / 1000)
      return await sock.sendMessage(from, {
        text: `😴 Estás cansado. Descansa *${min}m ${seg}s* antes de volver a trabajar.`
      }, { quoted: msg })
    }

    const trabajo = trabajos[Math.floor(Math.random() * trabajos.length)]
    const pago = Math.floor(Math.random() * (trabajo.pago[1] - trabajo.pago[0] + 1)) + trabajo.pago[0]

    db.addMoney(sender, pago)
    db.setCooldown(sender, 'Work', now)

    const total = db.getMoney(sender)
    const senderNumber = sender.split('@')[0]

    await sock.sendMessage(from, {
      text: `💼 @${senderNumber} trabajó como *${trabajo.nombre}*\n\n💰 Ganaste: *$${pago}*\n💳 Total: *$${total}*`,
      mentions: [sender]
    }, { quoted: msg })
  }
}
