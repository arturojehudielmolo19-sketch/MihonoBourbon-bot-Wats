import db from '../lib/db.js'

export default {
  name: 'depositar',
  aliases: ['dep', 'deposit'],
  description: 'Deposita dinero en el banco (a salvo de robos)',
  usage: '.depositar <cantidad|all>',

  async run({ sock, msg, from, sender, args }) {
    const amount = args[0]?.toLowerCase()

    if (!amount) {
      return await sock.sendMessage(from, {
        text: '❌ Uso: *.depositar <cantidad>* o *.depositar all*'
      }, { quoted: msg })
    }

    const cash = db.getMoney(sender)

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
        return await sock.sendMessage(from, {
          text: '❌ Cantidad inválida.'
        }, { quoted: msg })
      }
      if (deposito > cash) {
        return await sock.sendMessage(from, {
          text: `💸 Solo tienes *$${cash}* en efectivo.`
        }, { quoted: msg })
      }
    }

    db.addMoney(sender, -deposito)
    db.addBank(sender, deposito)

    const senderNumber = sender.split('@')[0]

    await sock.sendMessage(from, {
      text: `🏦 *DEPÓSITO EXITOSO*\n\n@${senderNumber} depositó *$${deposito}*\n\n💵 Efectivo: *$${db.getMoney(sender)}*\n🏦 Banco: *$${db.getBank(sender)}*`,
      mentions: [sender]
    }, { quoted: msg })
  }
}
