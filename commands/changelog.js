import db from '../lib/db.js'

const CURRENT_VERSION = '1.8'

export default {
  name: 'changelog',
  aliases: ['novedades', 'version', 'actualizaciones', 'update'],
  description: 'Muestra el historial de cambios del bot',

  async run({ sock, msg, from, args }) {
    const versions = db.changelog.versions || []

    if (versions.length === 0) {
      return await sock.sendMessage(from, {
        text: '⚠️ No hay changelog disponible.'
      }, { quoted: msg })
    }

    // Si piden una versión específica
    if (args[0]) {
      const versionBuscada = args[0].replace(/^v/i, '')
      const versionData = versions.find(v => v.version === versionBuscada)

      if (!versionData) {
        return await sock.sendMessage(from, {
          text: `❌ No encontré la versión *${args[0]}*.`
        }, { quoted: msg })
      }

      let texto = `📋 *VERSIÓN ${versionData.version}*\n`
      texto += `📅 ${versionData.date}\n`
      texto += `✨ *${versionData.title}*\n\n`
      versionData.changes.forEach(c => {
        texto += `• ${c}\n`
      })

      return await sock.sendMessage(from, { text: texto }, { quoted: msg })
    }

    // Mostrar todas las versiones (resumidas)
    let texto = `📋 *CHANGELOG*\n`
    texto += `🔖 Versión actual: *v${CURRENT_VERSION}*\n\n`

    // Ordenar de más reciente a más antigua
    const ordenadas = [...versions].sort((a, b) => {
      return parseFloat(b.version) - parseFloat(a.version)
    })

    // Mostrar máximo las últimas 3 versiones
    const mostrar = ordenadas.slice(0, 3)

    mostrar.forEach((v, index) => {
      texto += `━━━━━━━━━━━━━━━━━━━━\n`
      texto += `🔖 *v${v.version}* ── ${v.title}\n`
      texto += `📅 ${v.date}\n\n`
      v.changes.forEach(c => {
        texto += `${c}\n`
      })
      texto += `\n`
    })

    if (ordenadas.length > 3) {
      texto += `_...y ${ordenadas.length - 3} versiones anteriores más._\n`
      texto += `_Usa *.changelog <versión>* para ver una específica._`
    }

    await sock.sendMessage(from, { text: texto }, { quoted: msg })
  }
}
