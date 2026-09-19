import db from '../lib/db.js'

const COOLDOWN = 1000 * 60 * 3 // 3 minutos

const peces = [
  { nombre: '🐟 Sardina', valor: 30, rareza: 'común' },
  { nombre: '🐠 Pez payaso', valor: 80, rareza: 'común' },
  { nombre: '🐡 Pez globo', valor: 120, rareza: 'poco común' },
  { nombre: '🦐 Camarón', valor: 50, rareza: 'común' },
  { nombre: '🦀 Cangrejo', valor: 150, rareza: 'poco común' },
  { nombre: '🦑 Calamar', valor: 180, rareza: 'raro' },
  { nombre: '🐙 Pulpo', valor: 220, rareza: 'raro' },
  { nombre: '🦈 Tiburón', valor: 500, rareza: 'épico' },
  { nombre: '🐋 Ballena', valor: 1000, rareza: 'legendario' },
  { nombre: '👟 Zapato viejo', valor: 5, rareza: 'basura' },
  { nombre: '🥫 Lata vacía', valor: 3, rareza: 'basura' }
]

export default {
  name: 'pescar',
  aliases: ['fish', 'pesca'],
  description: 'Pesca para ganar dinero',

  async run({ sock, msg, from, sender }) {
    const lastFish = db.getCooldown(sender, 'Fish')
    const now = Date.now()

    if (now - lastFish < COOLDOWN) {
      const remaining = COOLDOWN - (now - lastFish)
      const min = Math.floor(remaining / 60000)
      const seg = Math.floor((remaining % 60000) / 1000)
      return await sock.sendMessage(from, {
        text: `🎣 Tu caña está en el agua. Espera *${min}m ${seg}s*.`
      }, { quoted: msg })
    }

    // 70% de pescar algo, 30% de no pescar nada
    if (Math.random() < 0.3) {
      db.setCooldown(sender, 'Fish', now)
      return await sock.sendMessage(from, {
        text: '🎣 No pescaste nada esta vez. ¡Sigue intentando!'
      }, { quoted: msg })
    }

    // Pescar algo - la mayoría son comunes, los raros son raros
    const random = Math.random()
    let pez
    if (random < 0.60) {
      // 60% comunes
      const comunes = peces.filter(p => p.rareza === 'común' || p.rareza === 'basura')
      pez = comunes[Math.floor(Math.random() * comunes.length)]
    } else if (random < 0.85) {
      // 25% poco comunes
      const pocoComunes = peces.filter(p => p.rareza === 'poco común')
      pez = pocoComunes[Math.floor(Math.random() * pocoComunes.length)]
    } else if (random < 0.97) {
      // 12% raros
      const raros = peces.filter(p => p.rareza === 'raro')
      pez = raros[Math.floor(Math.random() * raros.length)]
    } else if (random < 0.995) {
      // 2.5% épicos
      pez = peces.find(p => p.rareza === 'épico')
    } else {
      // 0.5% legendarios
      pez = peces.find(p => p.rareza === 'legendario')
    }

    db.addMoney(sender, pez.valor)
    db.setCooldown(sender, 'Fish', now)

    const total = db.getMoney(sender)
    const senderNumber = sender.split('@')[0]

    await sock.sendMessage(from, {
      text: `🎣 @${senderNumber} pescó: *${pez.nombre}*\n\n⭐ Rareza: *${pez.rareza}*\n💰 Valor: *$${pez.valor}*\n💳 Total: *$${total}*`,
      mentions: [sender]
    }, { quoted: msg })
  }
}
