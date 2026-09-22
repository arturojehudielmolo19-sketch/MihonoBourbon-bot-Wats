import db from '../lib/db.js'

export default {
  name: 'depositar',
  aliases: ['dep', 'deposit'],
  description: 'Deposita dinero en el banco',
  usage: '.depositar <cantidad|all>',

  async run({ sock, msg, from, sender, args }) {
    const amount = args[0]?.toLowerCase()
    const simbolo = db.getMonedaSimbolo()
    const moneda = db.getMonedaNombre()

    if (!amount) {
      return await sock.sendMessage(from, {
        text: '❌ Uso: *.depositar <cantidad>* o *.depositar all*'
      }, { quoted: msg })
    }

    const cash = db.getMoney(from, sender)

    if (cash <= 0) {
      return await sock.sendMessage(from, {
        text: '💸 No tienes efectivo para depositar.'
      }, { quoted: msg })
    }

    let deposito
    if (amount === 'all' || amount === 'todo') {
      deposito = cash
    } else {
      deposito = parseInt(amount)
      if (!deposito || deposito <= 0) {
        return await sock.sendMessage(from, { text: '❌ Cantidad inválida.' }, { quoted: msg })
      }
      if (deposito > cash) {
        return await sock.sendMessage(from, {
          text: `💸 Solo tienes *${simbolo} ${cash.toLocaleString('es-MX')}* en efectivo.`
        }, { quoted: msg })
      }
    }

    db.addMoney(from, sender, -deposito)
    db.addBank(from, sender, deposito)

    const senderNumber = sender.split('@')[0]

    await sock.sendMessage(from, {
      text: `🏦 *DEPÓSITO EXITOSO*\n\n@${senderNumber} depositó *${simbolo} ${deposito.toLocaleString('es-MX')}* ${moneda}\n\n💵 Efectivo: *${simbolo} ${db.getMoney(from, sender).toLocaleString('es-MX')}*\n🏦 Banco: *${simbolo} ${db.getBank(from, sender).toLocaleString('es-MX')}*`,
      mentions: [sender]
    }, { quoted: msg })
  }
}
