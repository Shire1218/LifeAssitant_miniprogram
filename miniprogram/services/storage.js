const { callCloud, uploadFile, downloadFile } = require('./cloud')
const localStorage = require('../utils/storage')

const STORAGE_CACHE_KEY = 'cloud_cache_enabled'

const cloudStorage = {
  async get(key, params = {}) {
    try {
      const result = await callCloud(`get${capitalize(key)}`, params)
      localStorage.set(`${key}_cache`, result.data)
      return result.data
    } catch (err) {
      console.warn(`云端获取 ${key} 失败，使用本地缓存:`, err)
      return localStorage.get(`${key}_cache`) || []
    }
  },

  async set(key, data, id) {
    try {
      const dataKey = `${capitalize(key)}Data`
      const idKey = `${capitalize(key)}Id`
      const params = { [dataKey]: data }
      if (id) params[idKey] = id

      const result = await callCloud(`save${capitalize(key)}`, params)
      const cache = localStorage.get(`${key}_cache`) || []

      if (id) {
        const index = cache.findIndex(item => item._id === id || item.id === id)
        if (index > -1) {
          cache[index] = { ...cache[index], ...data }
        }
      } else {
        cache.unshift(data)
      }
      localStorage.set(`${key}_cache`, cache)

      return result
    } catch (err) {
      console.warn(`云端保存 ${key} 失败，保存到本地:`, err)
      const cache = localStorage.get(`${key}_cache`) || []
      if (id) {
        const index = cache.findIndex(item => item._id === id || item.id === id)
        if (index > -1) {
          cache[index] = { ...cache[index], ...data }
        }
      } else {
        cache.unshift(data)
      }
      localStorage.set(`${key}_cache`, cache)
      throw err
    }
  },

  async remove(key, id) {
    try {
      const deleteFunc = `delete${capitalize(key)}`
      await callCloud(deleteFunc, { [`${key.slice(0, -1) + 'Id'}`]: id })

      const cache = localStorage.get(`${key}_cache`) || []
      const filtered = cache.filter(item => item._id !== id && item.id !== id)
      localStorage.set(`${key}_cache`, filtered)

      return { success: true }
    } catch (err) {
      console.warn(`云端删除 ${key} 失败，从本地缓存删除:`, err)
      const cache = localStorage.get(`${key}_cache`) || []
      const filtered = cache.filter(item => item._id !== id && item.id !== id)
      localStorage.set(`${key}_cache`, filtered)
      throw err
    }
  },

  async uploadImage(filePath, folder = 'default') {
    return uploadFile(filePath, folder)
  },

  async downloadFile(fileID) {
    return downloadFile(fileID)
  },

  clearCache(key) {
    if (key) {
      localStorage.remove(`${key}_cache`)
    } else {
      localStorage.clear()
    }
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

module.exports = cloudStorage
