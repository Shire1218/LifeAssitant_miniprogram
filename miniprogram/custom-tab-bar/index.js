Component({
  data: {
    active: 0,
    list: [
      { pagePath: '/pages/bill/bill', text: '账本' },
      { pagePath: '/pages/stat/stat', text: '统计' },
      { pagePath: '/pages/schedule/schedule', text: '日程' },
      { pagePath: '/pages/diet/diet', text: '饮食' }
    ]
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({ url })
    }
  }
})