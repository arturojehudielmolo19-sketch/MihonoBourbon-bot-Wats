import db from '../lib/db.js'

export default {
  name: 'retirar',
  aliases: ['ret', 'withdraw'],
  description: 'Retira dinero del banco al efectivo',
  usage: '.retirar <cantidad|all>',

  async run({ sock, msg, from, sender, args }) {
    const amount = args[0]?.toLowerCase()

    if (!amount) {
      return await sock.sendMessage(from, {
        text: '❌ Uso: *.retirar <cantidad>* o *.retirar all*'
      }, { quoted: msg })
    }

    const bank = db.getBank(sender)

    if (bank <= 0) {
      return await sock.sendMessage(from, {
        text: '🏦 No tienes dinero en el banco.'
      }, { quoted: msg })
    }

    let retiro
    if (amount === 'all' || amount === 'todo') {
      retiro = bank
    } else {
      retiro = parseInt(amount)
      if (!retiro || retiro <= 0) {
        return await sock.sendMessage(from, {
          text: '❌ Cantidad inválida.'
        }, { quoted: msg })
      }
      if (retiro > bank) {
        return await sock.sendMessage(from, {
          text: `🏦 Solo tienes *$${bank}* en el banco.`
        }, { quoted: msg })
      }
    }

    db.addBank(sender, -retiro)
    db.addMoney(sender, retiro)

    const senderNumber = sender.split('@')[0]

    await sock.sendMessage(from, {
      text: `💵 *RETIRO EXITOSO*\n\n@${senderNumber} retiró *$${retiro}*\n\n💵 Efectivo: *$${db.getMoney(sender)}*\n🏦 Banco: *$${db.getBank(sender)}*`,
      mentions: [sender]
    }, { quoted: msg })
  }
}
