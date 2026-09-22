import db from '../lib/db.js'

const TICKET_PRICE = 100
const DRAW_INTERVAL = 30 * 60 * 1000 // 30 minutos
const MIN_TICKETS = 3

export default {
  name: 'loteria',
  aliases: ['lottery', 'loto'],
  description: 'Compra boletos de lotería',
  usage: '.loteria <cantidad>',

  async run({ sock, msg, from, sender, args }) {
    const cantidad = parseInt(args[0]) || 1
    const simbolo = db.getMonedaSimbolo()
    const moneda = db.getMonedaNombre()
    const senderNumber = sender.split('@')[0]

    if (cantidad < 1 || cantidad > 100) {
      return await sock.sendMessage(from, {
        text: `❌ Debes comprar entre 1 y 100 boletos.\n\n_Uso:_ *.loteria <cantidad>*`
      }, { quoted: msg })
    }

    const costo = cantidad * TICKET_PRICE
    const saldo = db.getMoney(from, sender)

    if (saldo < costo) {
      return await sock.sendMessage(from, {
        text: `💸 No tienes suficiente dinero.\n\n💰 Costo: *${simbolo} ${costo.toLocaleString('es-MX')}* ${moneda}\n💳 Tu saldo: *${simbolo} ${saldo.toLocaleString('es-MX')}*`
      }, { quoted: msg })
    }

    const loteria = db.getLottery(from)

    // Agregar boletos
    if (!loteria.tickets[sender]) loteria.tickets[sender] = 0
    loteria.tickets[sender] += cantidad
    loteria.pot += costo

    db.setMoney(from, sender, saldo - costo)
    db.saveLotteryData(from)

    const totalBoletos = Object.values(loteria.tickets).reduce((a, b) => a + b, 0)
    const misBoletos = loteria.tickets[sender]

    await sock.sendMessage(from, {
      text: `🎟️ @${senderNumber} compró *${cantidad} boleto(s)*\n\n💸 Costo: *${simbolo} ${costo.toLocaleString('es-MX')}* ${moneda}\n🎰 Pozo actual: *${simbolo} ${loteria.pot.toLocaleString('es-MX')}*\n📊 Total de boletos: *${totalBoletos}*\n🎯 Tus boletos: *${misBoletos}*\n\n_El sorteo se hace cuando hay ${MIN_TICKETS}+ boletos y pasan 30 min desde el último._`,
      mentions: [sender]
    }, { quoted: msg })

    // Verificar si hay que hacer sorteo
    const now = Date.now()
    const tiempoDesdeSorteo = now - (loteria.lastDraw || 0)

    if (totalBoletos >= MIN_TICKETS && tiempoDesdeSorteo >= DRAW_INTERVAL) {
      await hacerSorteo(sock, from, loteria, db, simbolo, moneda)
    }
  }
}

async function hacerSorteo(sock, from, loteria, db, simbolo, moneda) {
  // Crear lista de boletos (un número por cada boleto)
  const todosLosBoletos = []
  for (const [userId, count] of Object.entries(loteria.tickets)) {
    for (let i = 0; i < count; i++) {
      todosLosBoletos.push(userId)
    }
  }

  if (todosLosBoletos.length === 0) return

  // Elegir ganador
  const ganador = todosLosBoletos[Math.floor(Math.random() * todosLosBoletos.length)]
  const premio = loteria.pot
  const ganadorNumber = ganador.split('@')[0]

  // Dar premio
  db.addMoney(from, ganador, premio)

  // Resetear lotería
  loteria.pot = 0
  loteria.tickets = {}
  loteria.lastDraw = Date.now()
  db.saveLotteryData(from)

  await sock.sendMessage(from, {
    text: `🎉 *¡SORTEO DE LOTERÍA!* 🎉\n\n🎟️ Boletos totales: *${todosLosBoletos.length}*\n\n🏆 *GANADOR:* @${ganadorNumber}\n\n💰 Premio: *${simbolo} ${premio.toLocaleString('es-MX')}* ${moneda}\n\n_¡Felicidades!_ 🎊`,
    mentions: [ganador]
  })
}
