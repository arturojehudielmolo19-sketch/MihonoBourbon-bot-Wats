import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import db from '../lib/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const itemsPath = path.join(__dirname, '..', 'data', 'items.json')

export default {
  name: 'tienda',
  aliases: ['shop', 'store', 'items'],
  description: 'Muestra la tienda de items',

  async run({ sock, msg, from, usedPrefix = '.' }) {
    const itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf8'))
    const items = Object.values(itemsData.items)
    const simbolo = db.getMonedaSimbolo()
    const moneda = db.getMonedaNombre()

    let texto = `╭━━━〔 🛒 *TIENDA* 〕━━━╮\n┃\n`

    for (const item of items) {
      texto += `┃ ${item.emoji} *${item.nombre}*\n`
      texto += `┃ 💰 *${simbolo} ${item.precio.toLocaleString('es-MX')}* ${moneda}\n`
      texto += `┃ _${item.descripcion}_\n┃\n`
    }

    texto += `╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n`
    texto += `_Compra con:_ *${usedPrefix}comprar <id>*\n`
    texto += `_Ejemplo:_ *${usedPrefix}comprar trebol*`

    await sock.sendMessage(from, { text: texto }, { quoted: msg })
  }
}
