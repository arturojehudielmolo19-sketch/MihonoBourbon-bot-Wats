import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import db from '../lib/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const itemsPath = path.join(__dirname, '..', 'data', 'items.json')

export default {
  name: 'usar',
  aliases: ['use', 'activar'],
  description: 'Usa un item de tu inventario',
  usage: '.usar <id>',

  async run({ sock, msg, from, sender, args, usedPrefix = '.' }) {
    const itemId = args[0]?.toLowerCase()

    if (!itemId) {
      return await sock.sendMessage(from, {
        text: `❌ Uso: *${usedPrefix}usar <id>*\n\n_Mira tu inventario con_ *${usedPrefix}inv*`
      }, { quoted: msg })
    }

    const itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf8'))
    const item = itemsData.items[itemId]

    if (!item) {
      return await sock.sendMessage(from, {
        text: `❌ El item *${itemId}* no existe.`
      }, { quoted: msg })
    }

    if (!item.usable) {
      return await sock.sendMessage(from, {
        text: `❌ Ese item no se puede usar.`
      }, { quoted: msg })
    }

    const count = db.getItemCount(sender, itemId)
    if (count < 1) {
      return await sock.sendMessage(from, {
        text: `❌ No tienes *${item.nombre}* en tu inventario.\n\n_Compra con_ *${usedPrefix}comprar ${itemId}*`
      }, { quoted: msg })
    }

    const senderNumber = sender.split('@')[0]
    const simbolo = db.getMonedaSimbolo()
    const moneda = db.getMonedaNombre()

    // Aplicar efecto según el item
    switch (item.efecto) {
      case 'doble_work':
        db.setEffect(sender, 'doble_work', item.duracionMs)
        db.removeItem(sender, itemId)
        await sock.sendMessage(from, {
          text: `🍀 @${senderNumber} usó *${item.nombre}*\n\n✨ Tu próximo *.work* dará *doble dinero*\n⏱️ Dura 10 minutos`,
          mentions: [sender]
        }, { quoted: msg })
        break

      case 'escudo':
        db.setEffect(sender, 'escudo', item.duracionMs)
        db.removeItem(sender, itemId)
        await sock.sendMessage(from, {
          text: `🛡️ @${senderNumber} activó el *${item.nombre}*\n\n✨ Estás protegido de *1 robo*\n⏱️ Dura 1 hora`,
          mentions: [sender]
        }, { quoted: msg })
        break

      case 'recarga':
        // Resetear cooldowns
        db.setCooldown(from, sender, 'Work', 0)
        db.setCooldown(from, sender, 'Fish', 0)
        db.setCooldown(from, sender, 'Mine', 0)
        db.setCooldown(from, sender, 'Hunt', 0)
        db.removeItem(sender, itemId)
        await sock.sendMessage(from, {
          text: `⚡ @${senderNumber} usó *${item.nombre}*\n\n✨ Todos tus cooldowns fueron reseteados\n_¡A trabajar!_ 💪`,
          mentions: [sender]
        }, { quoted: msg })
        break

      case 'xp_500':
        db.addXP(from, sender, 500)
        db.removeItem(sender, itemId)
        await sock.sendMessage(from, {
          text: `💊 @${senderNumber} usó *${item.nombre}*\n\n✨ Ganaste *500 XP*\n📊 Usa *.nivel* para ver tu progreso`,
          mentions: [sender]
        }, { quoted: msg })
        break

      case 'dado_cargado':
        db.setEffect(sender, 'dado_cargado', item.duracionMs)
        db.removeItem(sender, itemId)
        await sock.sendMessage(from, {
          text: `🎲 @${senderNumber} usó *${item.nombre}*\n\n✨ Tu próxima *.ruleta* ganará seguro\n⏱️ Dura 10 minutos`,
          mentions: [sender]
        }, { quoted: msg })
        break

      case 'random_item': {
        // Elegir item aleatorio (excluyendo el mismo)
        const itemsArray = Object.values(itemsData.items).filter(i => i.id !== 'caja_misteriosa')
        const randomItem = itemsArray[Math.floor(Math.random() * itemsArray.length)]
        db.addItem(sender, randomItem.id, 1)
        db.removeItem(sender, itemId)

        await sock.sendMessage(from, {
          text: `🎁 @${senderNumber} abrió la *${item.nombre}*\n\n✨ Obtuviste: ${randomItem.emoji} *${randomItem.nombre}*\n\n📦 Revisa tu inventario con *.inv*`,
          mentions: [sender]
        }, { quoted: msg })
        break
      }

      default:
        await sock.sendMessage(from, {
          text: `❌ Ese item no tiene efecto configurado.`
        }, { quoted: msg })
    }
  }
}
