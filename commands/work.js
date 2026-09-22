import db from '../lib/db.js'

export default {
  name: 'work',
  aliases: ['trabajar', 'chamba', 'curro'],
  description: 'Trabaja para ganar (o perder) dinero',

  async run({ sock, msg, from, sender }) {
    const config = db.economyConfig.work
    const COOLDOWN = config.cooldownMinutos * 60 * 1000

    const lastWork = db.getCooldown(from, sender, 'Work')
    const now = Date.now()

    if (now - lastWork < COOLDOWN) {
      const remaining = COOLDOWN - (now - lastWork)
      const min = Math.floor(remaining / 60000)
      const seg = Math.floor((remaining % 60000) / 1000)
      return await sock.sendMessage(from, {
        text: `😴 Estás cansado. Descansa *${min}m ${seg}s* antes de volver a trabajar.`
      }, { quoted: msg })
    }

    const trabajos = [
      { nombre: 'programador', emoji: '💻' },
      { nombre: 'streamer', emoji: '🎮' },
      { nombre: 'diseñador', emoji: '🎨' },
      { nombre: 'chef', emoji: '👨‍🍳' },
      { nombre: 'mecánico', emoji: '🔧' },
      { nombre: 'profesor', emoji: '📚' },
      { nombre: 'youtuber', emoji: '📹' },
      { nombre: 'vendedor', emoji: '🛒' },
      { nombre: 'doctor', emoji: '🩺' },
      { nombre: 'músico', emoji: '🎸' },
      { nombre: 'taxista', emoji: '🚕' },
      { nombre: 'mesero', emoji: '🍽️' }
    ]

    const trabajo = trabajos[Math.floor(Math.random() * trabajos.length)]
    const exito = Math.random() < config.probabilidadExito
    const senderNumber = sender.split('@')[0]
    const simbolo = db.getMonedaSimbolo()
    const moneda = db.getMonedaNombre()

    db.setCooldown(from, sender, 'Work', now)

    if (exito) {
      let pago = Math.floor(Math.random() * (config.gananciaMax - config.gananciaMin + 1)) + config.gananciaMin
      let extra = ''

      if (db.hasEffect(sender, 'doble_work')) {
        pago = pago * 2
        db.consumeEffect(sender, 'doble_work')
        extra = '\n🍀 *¡Trébol activado! Ganancia duplicada*'
      }

      db.addMoney(from, sender, pago)
      const total = db.getMoney(from, sender)

      const texto = `${trabajo.emoji} @${senderNumber} trabajó como *${trabajo.nombre}*${extra}\n\n💰 Ganaste: *${simbolo} ${pago.toLocaleString('es-MX')}* ${moneda}\n💳 Total: *${simbolo} ${total.toLocaleString('es-MX')}*`

      await sock.sendMessage(from, {
        text: texto,
        mentions: [sender]
      }, { quoted: msg })
    } else {
      const perdida = Math.floor(Math.random() * (config.perdidaMax - config.perdidaMin + 1)) + config.perdidaMin
      const perdidaReal = Math.min(perdida, db.getMoney(from, sender))

      db.addMoney(from, sender, -perdidaReal)
      const total = db.getMoney(from, sender)

      const razones = [
        'llegaste tarde y te descontaron',
        'rompiste algo y tuviste que pagar',
        'tu jefe te multó por holgazanear',
        'el cliente no pagó',
        'tuviste un accidente laboral',
        'se te cayó el café encima del equipo'
      ]
      const razon = razones[Math.floor(Math.random() * razones.length)]

      const texto = `${trabajo.emoji} @${senderNumber} trabajó como *${trabajo.nombre}* pero *${razon}*\n\n💸 Perdiste: *${simbolo} ${perdidaReal.toLocaleString('es-MX')}* ${moneda}\n💳 Total: *${simbolo} ${total.toLocaleString('es-MX')}*`

      await sock.sendMessage(from, {
        text: texto,
        mentions: [sender]
      }, { quoted: msg })
    }
  }
}
