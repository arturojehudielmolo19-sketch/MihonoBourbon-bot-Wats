import db from '../lib/db.js'

const COOLDOWN = 8 * 60 * 1000 // 8 minutos

const MINERALES = [
  { nombre: '🪨 Piedra', valor: 20, rareza: 'común' },
  { nombre: '⛏️ Carbón', valor: 50, rareza: 'común' },
  { nombre: '🔶 Cobre', valor: 80, rareza: 'común' },
  { nombre: '⚙️ Hierro', valor: 120, rareza: 'poco común' },
  { nombre: '🥈 Plata', valor: 200, rareza: 'poco común' },
  { nombre: '🥇 Oro', valor: 400, rareza: 'raro' },
  { nombre: '💎 Diamante', valor: 800, rareza: 'raro' },
  { nombre: '🔮 Esmeralda', valor: 1200, rareza: 'épico' },
  { nombre: '💠 Zafiro', valor: 1500, rareza: 'épico' },
  { nombre: '🌟 Estrella', valor: 5000, rareza: 'legendario' }
]

export default {
  name: 'minar',
  aliases: ['mine', 'mina', 'mineria'],
  description: 'Minar para ganar dinero',

  async run({ sock, msg, from, sender }) {
    const lastMine = db.getCooldown(from, sender, 'Mine')
    const now = Date.now()
    const simbolo = db.getMonedaSimbolo()
    const moneda = db.getMonedaNombre()

    if (now - lastMine < COOLDOWN) {
      const remaining = COOLDOWN - (now - lastMine)
      const min = Math.floor(remaining / 60000)
      const seg = Math.floor((remaining % 60000) / 1000)
      return await sock.sendMessage(from, {
        text: `⛏️ Estás agotado de tanto minar. Descansa *${min}m ${seg}s*.`
      }, { quoted: msg })
    }

    db.setCooldown(from, sender, 'Mine', now)

    // 20% de no encontrar nada
    if (Math.random() < 0.2) {
      return await sock.sendMessage(from, {
        text: '⛏️ Picaste y picaste pero no encontraste nada. ¡Sigue intentando!'
      }, { quoted: msg })
    }

    // Distribución de minerales
    const random = Math.random()
    let mineral

    if (random < 0.55) {
      const comunes = MINERALES.filter(m => m.rareza === 'común')
      mineral = comunes[Math.floor(Math.random() * comunes.length)]
    } else if (random < 0.80) {
      const pocoComunes = MINERALES.filter(m => m.rareza === 'poco común')
      mineral = pocoComunes[Math.floor(Math.random() * pocoComunes.length)]
    } else if (random < 0.95) {
      const raros = MINERALES.filter(m => m.rareza === 'raro')
      mineral = raros[Math.floor(Math.random() * raros.length)]
    } else if (random < 0.99) {
      const epicos = MINERALES.filter(m => m.rareza === 'épico')
      mineral = epicos[Math.floor(Math.random() * epicos.length)]
    } else {
      mineral = MINERALES.find(m => m.rareza === 'legendario')
    }

    db.addMoney(from, sender, mineral.valor)
    const total = db.getMoney(from, sender)
    const senderNumber = sender.split('@')[0]

    await sock.sendMessage(from, {
      text: `⛏️ @${senderNumber} minó y encontró: *${mineral.nombre}*\n\n⭐ Rareza: *${mineral.rareza}*\n💰 Valor: *${simbolo} ${mineral.valor.toLocaleString('es-MX')}* ${moneda}\n💳 Total: *${simbolo} ${total.toLocaleString('es-MX')}*`,
      mentions: [sender]
    }, { quoted: msg })
  }
}
