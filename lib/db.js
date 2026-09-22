import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'data')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

function load(file, defaultValue = {}) {
  const filePath = path.join(dataDir, file)
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2))
    return defaultValue
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return defaultValue
  }
}

function save(file, data) {
  const filePath = path.join(dataDir, file)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

export const db = {
  warns: load('warns.json', {}),
  groupSettings: load('groups.json', {}),
  users: load('users.json', {}),
  ranks: load('ranks.json', {}),
  globalBans: load('bans.json', {}),
  economy: load('economy.json', {}),
  changelog: load('changelog.json', { versions: [] }),
  profiles: load('profiles.json', {}),
  levels: load('levels.json', {}),
  daily: load('daily.json', {}),
  lottery: load('lottery.json', {}),
  inventories: load('inventories.json', {}),
  activeEffects: load('effects.json', {}),
  economyConfig: load('economy-config.json', {
    moneda: { nombre: 'Mihonos', nombreSingular: 'Mihono', simbolo: '🪙' },
    work: {
      cooldownMinutos: 5,
      probabilidadExito: 0.7,
      gananciaMin: 80,
      gananciaMax: 250,
      perdidaMin: 20,
      perdidaMax: 100
    },
    pescar: {
      cooldownMinutos: 3,
      probabilidadNada: 0.3,
      basuraProbabilidad: 0.15,
      basuraPerdidaMin: 10,
      basuraPerdidaMax: 50
    },
    robar: {
      cooldownMinutos: 5,
      probabilidadExito: 0.4,
      multaFallidaPorcentaje: 0.15
    },
    apuestas: { cooldownSegundos: 0 }
  }),

  saveWarns() { save('warns.json', this.warns) },
  saveGroups() { save('groups.json', this.groupSettings) },
  saveUsers() { save('users.json', this.users) },
  saveRanks() { save('ranks.json', this.ranks) },
  saveBans() { save('bans.json', this.globalBans) },
  saveEconomy() { save('economy.json', this.economy) },
  saveChangelog() { save('changelog.json', this.changelog) },
  saveProfiles() { save('profiles.json', this.profiles) },
  saveLevels() { save('levels.json', this.levels) },
  saveDaily() { save('daily.json', this.daily) },
  saveLottery() { save('lottery.json', this.lottery) },
  saveInventories() { save('inventories.json', this.inventories) },
  saveEffects() { save('effects.json', this.activeEffects) },
  saveEconomyConfig() { save('economy-config.json', this.economyConfig) },

  // ---- WARNS ----
  getWarns(groupId, userId) {
    return this.warns[groupId]?.[userId] || []
  },
  addWarn(groupId, userId, reason) {
    if (!this.warns[groupId]) this.warns[groupId] = {}
    if (!this.warns[groupId][userId]) this.warns[groupId][userId] = []
    this.warns[groupId][userId].push({
      reason,
      date: new Date().toISOString()
    })
    this.saveWarns()
    return this.warns[groupId][userId].length
  },
  clearWarns(groupId, userId) {
    if (this.warns[groupId]?.[userId]) {
      delete this.warns[groupId][userId]
      this.saveWarns()
    }
  },

  // ---- CONFIG DE GRUPO ----
  getGroupSetting(groupId, key, defaultValue = false) {
    return this.groupSettings[groupId]?.[key] ?? defaultValue
  },
  setGroupSetting(groupId, key, value) {
    if (!this.groupSettings[groupId]) this.groupSettings[groupId] = {}
    this.groupSettings[groupId][key] = value
    this.saveGroups()
  },

  // ---- RANGOS ----
  getRank(userId) {
    return this.ranks[userId] || 'user'
  },
  setRank(userId, rank) {
    if (rank === 'user') {
      delete this.ranks[userId]
    } else {
      this.ranks[userId] = rank
    }
    this.saveRanks()
  },
  rankLevel(rank) {
    const levels = { user: 0, admin: 1, superadmin: 2, owner: 3 }
    return levels[rank] ?? 0
  },
  isAtLeast(userId, minRank) {
    return this.rankLevel(this.getRank(userId)) >= this.rankLevel(minRank)
  },

  // ---- BANS GLOBALES ----
  isBanned(userId) {
    return !!this.globalBans[userId]
  },
  ban(userId, reason) {
    this.globalBans[userId] = {
      reason: reason || 'Sin razón',
      date: new Date().toISOString()
    }
    this.saveBans()
  },
  unban(userId) {
    delete this.globalBans[userId]
    this.saveBans()
  },

  // ---- ECONOMÍA ----
  _ensureEconomy(chatId, userId) {
    if (!this.economy[chatId]) this.economy[chatId] = {}
    if (!this.economy[chatId][userId]) {
      this.economy[chatId][userId] = { money: 0, bank: 0 }
    }
    return this.economy[chatId][userId]
  },
  getMoney(chatId, userId) {
    return this.economy[chatId]?.[userId]?.money ?? 0
  },
  setMoney(chatId, userId, amount) {
    const data = this._ensureEconomy(chatId, userId)
    data.money = Math.max(0, Math.floor(amount))
    this.saveEconomy()
  },
  addMoney(chatId, userId, amount) {
    const current = this.getMoney(chatId, userId)
    this.setMoney(chatId, userId, current + amount)
  },
  getBank(chatId, userId) {
    return this.economy[chatId]?.[userId]?.bank ?? 0
  },
  setBank(chatId, userId, amount) {
    const data = this._ensureEconomy(chatId, userId)
    data.bank = Math.max(0, Math.floor(amount))
    this.saveEconomy()
  },
  addBank(chatId, userId, amount) {
    const current = this.getBank(chatId, userId)
    this.setBank(chatId, userId, current + amount)
  },
  getTotal(chatId, userId) {
    return this.getMoney(chatId, userId) + this.getBank(chatId, userId)
  },
  getCooldown(chatId, userId, type) {
    return this.economy[chatId]?.[userId]?.[`last${type}`] ?? 0
  },
  setCooldown(chatId, userId, type, timestamp) {
    const data = this._ensureEconomy(chatId, userId)
    data[`last${type}`] = timestamp
    this.saveEconomy()
  },

  // ---- CONFIG DE ECONOMÍA ----
  getEconomyConfig(section, key) {
    return this.economyConfig[section]?.[key]
  },
  setEconomyConfig(section, key, value) {
    if (!this.economyConfig[section]) this.economyConfig[section] = {}
    this.economyConfig[section][key] = value
    this.saveEconomyConfig()
  },

  // ---- HELPERS DE MONEDA ----
  formatMoney(amount) {
    const m = this.economyConfig.moneda
    return `${m.simbolo} ${amount.toLocaleString('es-MX')} ${m.nombre}`
  },
  getMonedaSingular() {
    return this.economyConfig.moneda.nombreSingular
  },
  getMonedaNombre() {
    return this.economyConfig.moneda.nombre
  },
  getMonedaSimbolo() {
    return this.economyConfig.moneda.simbolo
  },

  // ---- PERFILES ----
  getProfile(userId) {
    if (!this.profiles[userId]) {
      this.profiles[userId] = {
        nombre: null,
        genero: null,
        edad: null,
        bio: null,
        fechaRegistro: new Date().toISOString()
      }
      this.saveProfiles()
    }
    return this.profiles[userId]
  },
  setProfileField(userId, field, value) {
    const profile = this.getProfile(userId)
    profile[field] = value
    this.saveProfiles()
  },

  // ---- NIVELES / XP ----
  _ensureLevel(chatId, userId) {
    if (!this.levels[chatId]) this.levels[chatId] = {}
    if (!this.levels[chatId][userId]) {
      this.levels[chatId][userId] = { xp: 0, level: 1, messages: 0 }
    }
    return this.levels[chatId][userId]
  },
  getLevelData(chatId, userId) {
    return this._ensureLevel(chatId, userId)
  },
  addXP(chatId, userId, amount) {
    const data = this._ensureLevel(chatId, userId)
    data.xp += amount
    data.messages += 1
    let newLevel = 1
    while (data.xp >= newLevel * (newLevel + 1) * 50) {
      newLevel++
    }
    const leveledUp = newLevel > data.level
    const oldLevel = data.level
    data.level = newLevel
    this.saveLevels()
    return { leveledUp, oldLevel, newLevel }
  },
  getXPForNextLevel(level) {
    return level * (level + 1) * 50
  },

  // ---- DAILY ----
  getDailyData(userId) {
    if (!this.daily[userId]) {
      this.daily[userId] = { lastDaily: 0, streak: 0 }
    }
    return this.daily[userId]
  },
  setDailyData(userId, data) {
    this.daily[userId] = data
    this.saveDaily()
  },

  // ---- LOTERÍA ----
  _ensureLottery(chatId) {
    if (!this.lottery[chatId]) {
      this.lottery[chatId] = { pot: 0, tickets: {}, lastDraw: 0 }
    }
    return this.lottery[chatId]
  },
  getLottery(chatId) {
    return this._ensureLottery(chatId)
  },
  saveLotteryData(chatId) {
    this.saveLottery()
  },

  // ---- INVENTARIO ----
  getInventory(userId) {
    if (!this.inventories[userId]) {
      this.inventories[userId] = { items: {} }
    }
    return this.inventories[userId]
  },
  addItem(userId, itemId, count = 1) {
    const inv = this.getInventory(userId)
    if (!inv.items[itemId]) inv.items[itemId] = 0
    inv.items[itemId] += count
    this.saveInventories()
    return inv.items[itemId]
  },
  removeItem(userId, itemId, count = 1) {
    const inv = this.getInventory(userId)
    if (!inv.items[itemId] || inv.items[itemId] < count) return false
    inv.items[itemId] -= count
    if (inv.items[itemId] <= 0) delete inv.items[itemId]
    this.saveInventories()
    return true
  },
  getItemCount(userId, itemId) {
    const inv = this.getInventory(userId)
    return inv.items[itemId] || 0
  },

  // ---- EFECTOS ACTIVOS ----
  setEffect(userId, efecto, duracionMs) {
    if (!this.activeEffects[userId]) this.activeEffects[userId] = {}
    this.activeEffects[userId][efecto] = Date.now() + duracionMs
    this.saveEffects()
  },
  hasEffect(userId, efecto) {
    const expira = this.activeEffects[userId]?.[efecto]
    if (!expira) return false
    if (Date.now() > expira) {
      delete this.activeEffects[userId][efecto]
      this.saveEffects()
      return false
    }
    return true
  },
  consumeEffect(userId, efecto) {
    if (this.activeEffects[userId]?.[efecto]) {
      delete this.activeEffects[userId][efecto]
      this.saveEffects()
      return true
    }
    return false
  },
  clearExpiredEffects(userId) {
    if (!this.activeEffects[userId]) return
    const now = Date.now()
    for (const [efecto, expira] of Object.entries(this.activeEffects[userId])) {
      if (now > expira) {
        delete this.activeEffects[userId][efecto]
      }
    }
    this.saveEffects()
  }
}

export default db
