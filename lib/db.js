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

  saveWarns() {
    save('warns.json', this.warns)
  },
  saveGroups() {
    save('groups.json', this.groupSettings)
  },
  saveUsers() {
    save('users.json', this.users)
  },
  saveRanks() {
    save('ranks.json', this.ranks)
  },
  saveBans() {
    save('bans.json', this.globalBans)
  },
  saveEconomy() {
    save('economy.json', this.economy)
  },
  saveChangelog() {
    save('changelog.json', this.changelog)
  },

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

  getGroupSetting(groupId, key, defaultValue = false) {
    return this.groupSettings[groupId]?.[key] ?? defaultValue
  },
  setGroupSetting(groupId, key, value) {
    if (!this.groupSettings[groupId]) this.groupSettings[groupId] = {}
    this.groupSettings[groupId][key] = value
    this.saveGroups()
  },

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

  getMoney(userId) {
    return this.economy[userId]?.money ?? 0
  },
  setMoney(userId, amount) {
    if (!this.economy[userId]) this.economy[userId] = {}
    this.economy[userId].money = Math.max(0, Math.floor(amount))
    this.saveEconomy()
  },
  addMoney(userId, amount) {
    const current = this.getMoney(userId)
    this.setMoney(userId, current + amount)
  },
  getCooldown(userId, type) {
    return this.economy[userId]?.[`last${type}`] ?? 0
  },
  setCooldown(userId, type, timestamp) {
    if (!this.economy[userId]) this.economy[userId] = {}
    this.economy[userId][`last${type}`] = timestamp
    this.saveEconomy()
  },

  getBank(userId) {
    return this.economy[userId]?.bank ?? 0
  },
  setBank(userId, amount) {
    if (!this.economy[userId]) this.economy[userId] = {}
    this.economy[userId].bank = Math.max(0, Math.floor(amount))
    this.saveEconomy()
  },
  addBank(userId, amount) {
    const current = this.getBank(userId)
    this.setBank(userId, current + amount)
  },
  getTotal(userId) {
    return this.getMoney(userId) + this.getBank(userId)
  }
}

export default db
