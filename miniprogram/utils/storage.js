const STORAGE_PREFIX = 'life_assist_'

const storage = {
  get(key) {
    try {
      const value = wx.getStorageSync(STORAGE_PREFIX + key)
      return value ? JSON.parse(value) : null
    } catch (e) {
      console.error('storage get error:', e)
      return null
    }
  },

  set(key, value) {
    try {
      wx.setStorageSync(STORAGE_PREFIX + key, JSON.stringify(value))
      return true
    } catch (e) {
      console.error('storage set error:', e)
      return false
    }
  },

  remove(key) {
    try {
      wx.removeStorageSync(STORAGE_PREFIX + key)
      return true
    } catch (e) {
      console.error('storage remove error:', e)
      return false
    }
  },

  clear() {
    try {
      wx.clearStorageSync()
      return true
    } catch (e) {
      console.error('storage clear error:', e)
      return false
    }
  }
}

module.exports = storage
