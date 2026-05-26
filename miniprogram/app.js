App({
  globalData: {
    themeColor: '#1677ff',
    incomeColor: '#52c41a',
    expenseColor: '#f5222d',
    auxiliaryColor: '#faad14'
  },

  onLaunch() {
    this.initStorage()
  },

  initStorage() {
    const keys = ['bills', 'schedules', 'diets', 'notes']
    keys.forEach(key => {
      if (!wx.getStorageSync(key)) {
        wx.setStorageSync(key, [])
      }
    })
  }
})
