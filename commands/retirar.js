import db from '../lib/db.js'

export default {
  name: 'retirar',
  aliases: ['ret', 'withdraw'],
  description: 'Retira dinero del banco',
  usage: '.retirar <cantidad|all>',

  async run({ sock, msg, from, sender, args }) {
    const amount = args[0]?.toLowerCase()
    const simbolo = db.getMonedaSimbolo()
    const moneda = db.getMonedaNombre()

    if (!amount) {
      return await sock.sendMessage(from, {
        text: '❌ Uso: *.retirar <cantidad>* o *.retirar all*'
      }, { quoted: msg })
    }

    const bank = db.getBank(from, sender)

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
        return await sock.sendMessage(from, { text: '❌ Cantidad inválida.' }, { quoted: msg })
      }
      if (retiro > bank) {
        return await sock.sendMessage(from, {
          text: `🏦 Solo tienes *${simbolo} ${bank.toLocaleString('es-MX')}* en el banco.`
        }, { quoted: msg })
      }
    }

    db.addBank(from, sender, -retiro)
    db.addMoney(from, sender, retiro)

    const senderNumber = sender.split('@')[0]

    await sock.sendMessage(from, {
      text: `💵 *RETIRO EXITOSO*\n\n@${senderNumber} retiró *${simbolo} ${retiro.toLocaleString('es-MX')}* ${moneda}\n\n💵 Efectivo: *${simbolo} ${db.getMoney(from, sender).toLocaleString('es-MX')}*\n🏦 Banco: *${simbolo} ${db.getBank(from, sender).toLocaleString('es-MX')}*`,
      mentions: [sender]
    }, { quoted: msg })
  }
}
