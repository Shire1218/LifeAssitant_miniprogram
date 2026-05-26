const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

const showToast = (title, icon = 'none') => {
  wx.showToast({
    title,
    icon,
    duration: 2000
  })
}

const showConfirm = (content, title = '提示') => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success(res) {
        resolve(res.confirm)
      }
    })
  })
}

const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  })
}

const hideLoading = () => {
  wx.hideLoading()
}

const debounce = (fn, delay = 300) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

const throttle = (fn, delay = 300) => {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

const groupBy = (arr, key) => {
  return arr.reduce((groups, item) => {
    const group = key instanceof Function ? key(item) : item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

const sortBy = (arr, key, desc = false) => {
  return [...arr].sort((a, b) => {
    const valA = key instanceof Function ? key(a) : a[key]
    const valB = key instanceof Function ? key(b) : b[key]
    return desc ? (valB > valA ? 1 : -1) : (valA > valB ? 1 : -1)
  })
}

const sumBy = (arr, key) => {
  return arr.reduce((sum, item) => {
    const val = key instanceof Function ? key(item) : item[key]
    return sum + (Number(val) || 0)
  }, 0)
}

const pickImage = (count = 9) => {
  return new Promise((resolve) => {
    wx.chooseMedia({
      count,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        resolve(res.tempFiles.map(file => file.tempFilePath))
      },
      fail() {
        resolve([])
      }
    })
  })
}

module.exports = {
  generateId,
  showToast,
  showConfirm,
  showLoading,
  hideLoading,
  debounce,
  throttle,
  groupBy,
  sortBy,
  sumBy,
  pickImage
}
