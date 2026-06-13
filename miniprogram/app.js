const config = require('./config')

App({
  globalData: {
    themeColor: '#1677ff',
    incomeColor: '#52c41a',
    expenseColor: '#f5222d',
    auxiliaryColor: '#faad14'
  },

  onLaunch() {
    this.initCloud()
    this.initStorage()
  },

  initCloud() {
    if (wx.cloud) {
      wx.cloud.init({
        env: config.cloudEnv,
        traceUser: true
      })
      console.log('云开发初始化成功')
    } else {
      console.error('请使用基础库 2.2.3+ 以使用云开发')
    }
  },

  initStorage() {
    const keys = ['bills', 'schedules', 'diets']
    keys.forEach(key => {
      if (!wx.getStorageSync(key)) {
        wx.setStorageSync(key, [])
      }
    })
  }
})
