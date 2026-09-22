import db from '../lib/db.js'

const COOLDOWN = 6 * 60 * 1000 // 6 minutos

const ANIMALES = [
  { nombre: '🐭 Ratón', valor: 25, rareza: 'común' },
  { nombre: '🐰 Conejo', valor: 60, rareza: 'común' },
  { nombre: '🐦 Pájaro', valor: 80, rareza: 'común' },
  { nombre: '🦌 Ciervo', valor: 150, rareza: 'poco común' },
  { nombre: '🦊 Zorro', valor: 200, rareza: 'poco común' },
  { nombre: '🐗 Jabalí', valor: 250, rareza: 'raro' },
  { nombre: '🐺 Lobo', valor: 400, rareza: 'raro' },
  { nombre: '🐻 Oso', valor: 700, rareza: 'épico' },
  { nombre: '🦁 León', valor: 1200, rareza: 'épico' },
  { nombre: '🐉 Dragón', valor: 5000, rareza: 'legendario' }
]

export default {
  name: 'cazar',
  aliases: ['hunt', 'caza'],
  description: 'Cazar para ganar dinero',

  async run({ sock, msg, from, sender }) {
    const lastHunt = db.getCooldown(from, sender, 'Hunt')
    const now = Date.now()
    const simbolo = db.getMonedaSimbolo()
    const moneda = db.getMonedaNombre()

    if (now - lastHunt < COOLDOWN) {
      const remaining = COOLDOWN - (now - lastHunt)
      const min = Math.floor(remaining / 60000)
      const seg = Math.floor((remaining % 60000) / 1000)
      return await sock.sendMessage(from, {
        text: `🏹 Tus piernas están cansadas. Descansa *${min}m ${seg}s*.`
      }, { quoted: msg })
    }

    db.setCooldown(from, sender, 'Hunt', now)

    // 25% de no cazar nada
    if (Math.random() < 0.25) {
      return await sock.sendMessage(from, {
        text: '🏹 Los animales te escucharon y huyeron. No cazaste nada.'
      }, { quoted: msg })
    }

    // 10% de accidente (pierdes dinero)
    if (Math.random() < 0.1) {
      const perdida = Math.min(Math.floor(Math.random() * 100) + 50, db.getMoney(from, sender))
      db.addMoney(from, sender, -perdida)
      const total = db.getMoney(from, sender)
      const senderNumber = sender.split('@')[0]

      return await sock.sendMessage(from, {
        text: `💥 @${senderNumber} se tropezó mientras cazaba\n\n💸 Perdiste: *${simbolo} ${perdida.toLocaleString('es-MX')}* ${moneda}\n💳 Total: *${simbolo} ${total.toLocaleString('es-MX')}*`,
        mentions: [sender]
      }, { quoted: msg })
    }

    // Distribución de animales
    const random = Math.random()
    let animal

    if (random < 0.55) {
      const comunes = ANIMALES.filter(a => a.rareza === 'común')
      animal = comunes[Math.floor(Math.random() * comunes.length)]
    } else if (random < 0.80) {
      const pocoComunes = ANIMALES.filter(a => a.rareza === 'poco común')
      animal = pocoComunes[Math.floor(Math.random() * pocoComunes.length)]
    } else if (random < 0.95) {
      const raros = ANIMALES.filter(a => a.rareza === 'raro')
      animal = raros[Math.floor(Math.random() * raros.length)]
    } else if (random < 0.99) {
      const epicos = ANIMALES.filter(a => a.rareza === 'épico')
      animal = epicos[Math.floor(Math.random() * epicos.length)]
    } else {
      animal = ANIMALES.find(a => a.rareza === 'legendario')
    }

    db.addMoney(from, sender, animal.valor)
    const total = db.getMoney(from, sender)
    const senderNumber = sender.split('@')[0]

    await sock.sendMessage(from, {
      text: `🏹 @${senderNumber} cazó: *${animal.nombre}*\n\n⭐ Rareza: *${animal.rareza}*\n💰 Valor: *${simbolo} ${animal.valor.toLocaleString('es-MX')}* ${moneda}\n💳 Total: *${simbolo} ${total.toLocaleString('es-MX')}*`,
      mentions: [sender]
    }, { quoted: msg })
  }
}
