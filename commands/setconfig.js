import db from '../lib/db.js'

const CAMPOS_VALIDOS = {
  'moneda.nombre': 'string',
  'moneda.nombreSingular': 'string',
  'moneda.simbolo': 'string',
  'work.cooldownMinutos': 'number',
  'work.probabilidadExito': 'number',
  'work.gananciaMin': 'number',
  'work.gananciaMax': 'number',
  'work.perdidaMin': 'number',
  'work.perdidaMax': 'number',
  'pescar.cooldownMinutos': 'number',
  'pescar.probabilidadNada': 'number',
  'pescar.basuraProbabilidad': 'number',
  'pescar.basuraPerdidaMin': 'number',
  'pescar.basuraPerdidaMax': 'number',
  'robar.cooldownMinutos': 'number',
  'robar.probabilidadExito': 'number',
  'robar.multaFallidaPorcentaje': 'number',
  'apuestas.cooldownSegundos': 'number'
}

export default {
  name: 'setconfig',
  aliases: ['config', 'seteconomia'],
  description: 'Configura los parámetros de la economía (solo owner)',
  minRank: 'owner',
  usage: '.setconfig <campo> <valor>',

  async run({ sock, msg, from, args, usedPrefix = '.' }) {
    const campo = args[0]
    const valor = args.slice(1).join(' ')

    // Sin argumentos: mostrar config actual
    if (!campo) {
      const config = db.economyConfig

      let texto = `⚙️ *CONFIGURACIÓN DE ECONOMÍA*\n\n`

      texto += `🥕 *MONEDA*\n`
      texto += `• moneda.nombre = ${config.moneda.nombre}\n`
      texto += `• moneda.nombreSingular = ${config.moneda.nombreSingular}\n`
      texto += `• moneda.simbolo = ${config.moneda.simbolo}\n\n`

      texto += `💼 *WORK*\n`
      texto += `• work.cooldownMinutos = ${config.work.cooldownMinutos}\n`
      texto += `• work.probabilidadExito = ${config.work.probabilidadExito}\n`
      texto += `• work.gananciaMin = ${config.work.gananciaMin}\n`
      texto += `• work.gananciaMax = ${config.work.gananciaMax}\n`
      texto += `• work.perdidaMin = ${config.work.perdidaMin}\n`
      texto += `• work.perdidaMax = ${config.work.perdidaMax}\n\n`

      texto += `🎣 *PESCAR*\n`
      texto += `• pescar.cooldownMinutos = ${config.pescar.cooldownMinutos}\n`
      texto += `• pescar.probabilidadNada = ${config.pescar.probabilidadNada}\n`
      texto += `• pescar.basuraProbabilidad = ${config.pescar.basuraProbabilidad}\n\n`

      texto += `🦹 *ROBAR*\n`
      texto += `• robar.cooldownMinutos = ${config.robar.cooldownMinutos}\n`
      texto += `• robar.probabilidadExito = ${config.robar.probabilidadExito}\n`
      texto += `• robar.multaFallidaPorcentaje = ${config.robar.multaFallidaPorcentaje}\n\n`

      texto += `🎰 *APUESTAS*\n`
      texto += `• apuestas.cooldownSegundos = ${config.apuestas?.cooldownSegundos ?? 0}\n\n`

      texto += `_Uso:_ *${usedPrefix}setconfig <campo> <valor>*\n`
      texto += `_Ejemplo:_ *${usedPrefix}setconfig work.cooldownMinutos 10*`

      return await sock.sendMessage(from, { text: texto }, { quoted: msg })
    }

    // Validar campo
    if (!CAMPOS_VALIDOS[campo]) {
      return await sock.sendMessage(from, {
        text: `❌ Campo inválido: *${campo}*\n\nUsa *${usedPrefix}setconfig* para ver los campos disponibles.`
      }, { quoted: msg })
    }

    if (!valor) {
      return await sock.sendMessage(from, {
        text: `❌ Falta el valor.\n\n_Ejemplo:_ *${usedPrefix}setconfig ${campo} <valor>*`
      }, { quoted: msg })
    }

    const tipo = CAMPOS_VALIDOS[campo]
    const [seccion, key] = campo.split('.')

    let valorFinal = valor

    if (tipo === 'number') {
      valorFinal = parseFloat(valor)
      if (isNaN(valorFinal)) {
        return await sock.sendMessage(from, {
          text: `❌ El valor debe ser un número.`
        }, { quoted: msg })
      }
    }

    // Validaciones especiales
    if (campo.includes('probabilidad') && (valorFinal < 0 || valorFinal > 1)) {
      return await sock.sendMessage(from, {
        text: `❌ Las probabilidades deben estar entre 0 y 1.`
      }, { quoted: msg })
    }

    db.setEconomyConfig(seccion, key, valorFinal)

    await sock.sendMessage(from, {
      text: `✅ Configuración actualizada:\n\n*${campo}* = *${valorFinal}*`
    }, { quoted: msg })
  }
}
