import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import db from '../lib/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const itemsPath = path.join(__dirname, '..', 'data', 'items.json')

export default {
  name: 'comprar',
  aliases: ['buy', 'compra'],
  description: 'Compra un item de la tienda',
  usage: '.comprar <id>',

  async run({ sock, msg, from, sender, args, usedPrefix = '.' }) {
    const itemId = args[0]?.toLowerCase()

    if (!itemId) {
      return await sock.sendMessage(from, {
        text: `❌ Uso: *${usedPrefix}comprar <id>*\n\n_Mira la tienda con_ *${usedPrefix}tienda*`
      }, { quoted: msg })
    }

    const itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf8'))
    const item = itemsData.items[itemId]

    if (!item) {
      return await sock.sendMessage(from, {
        text: `❌ El item *${itemId}* no existe.\n\n_Mira la tienda con_ *${usedPrefix}tienda*`
      }, { quoted: msg })
    }

    const saldo = db.getMoney(from, sender)
    const simbolo = db.getMonedaSimbolo()
    const moneda = db.getMonedaNombre()

    if (saldo < item.precio) {
      return await sock.sendMessage(from, {
        text: `💸 No tienes suficiente dinero.\n\n${item.emoji} *${item.nombre}*\n💰 Precio: *${simbolo} ${item.precio.toLocaleString('es-MX')}* ${moneda}\n💳 Tu saldo: *${simbolo} ${saldo.toLocaleString('es-MX')}*`
      }, { quoted: msg })
    }

    // Cobrar y agregar al inventario
    db.addMoney(from, sender, -item.precio)
    db.addItem(sender, itemId, 1)

    const senderNumber = sender.split('@')[0]
    const nuevoSaldo = db.getMoney(from, sender)
    const cantidadTotal = db.getItemCount(sender, itemId)

    await sock.sendMessage(from, {
      text: `✅ *¡COMPRA EXITOSA!*\n\n${item.emoji} @${senderNumber} compró *${item.nombre}*\n\n💰 Costo: *${simbolo} ${item.precio.toLocaleString('es-MX')}* ${moneda}\n💳 Nuevo saldo: *${simbolo} ${nuevoSaldo.toLocaleString('es-MX')}*\n📦 Cantidad: *${cantidadTotal}x*\n\n_Uso:_ *${usedPrefix}usar ${itemId}*`,
      mentions: [sender]
    }, { quoted: msg })
  }
}
