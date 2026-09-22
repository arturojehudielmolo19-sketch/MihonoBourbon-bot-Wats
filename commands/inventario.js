import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import db from '../lib/db.js'
import { getTarget } from '../lib/permissions.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const itemsPath = path.join(__dirname, '..', 'data', 'items.json')

export default {
  name: 'inventario',
  aliases: ['inv', 'inventory', 'mochila'],
  description: 'Muestra tu inventario o el de alguien',

  async run({ sock, msg, from, sender, usedPrefix = '.' }) {
    const target = getTarget(msg) || sender
    const targetNumber = target.split('@')[0]

    const inv = db.getInventory(target)
    const itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf8'))

    const items = Object.entries(inv.items).filter(([, count]) => count > 0)

    if (items.length === 0) {
      return await sock.sendMessage(from, {
        text: `📦 *@${targetNumber}* no tiene items en su inventario.\n\n_Visita la tienda con_ *${usedPrefix}tienda*`,
        mentions: [target]
      }, { quoted: msg })
    }

    let texto = `╭━━━〔 🎒 *INVENTARIO* 〕━━━╮\n┃\n`
    texto += `┃ 👤 @${targetNumber}\n┃\n`

    for (const [itemId, count] of items) {
      const item = itemsData.items[itemId]
      if (item) {
        texto += `┃ ${item.emoji} *${item.nombre}* x${count}\n`
      }
    }

    texto += `┃\n╰━━━━━━━━━━━━━━━━━━━━━╯\n\n`
    texto += `_Usa_ *${usedPrefix}usar <id>* _para activar un item_`

    await sock.sendMessage(from, {
      text: texto,
      mentions: [target]
    }, { quoted: msg })
  }
}
