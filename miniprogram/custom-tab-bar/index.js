Component({
  data: {
    active: 0,
    list: [
      {
        pagePath: '/pages/bill/bill',
        text: '账本',
        iconPath: '/static/bar/bill_inactive.png',
        selectedIconPath: '/static/bar/bill.png'
      },
      {
        pagePath: '/pages/schedule/schedule',
        text: '日程',
        iconPath: '/static/bar/schedule_inactive.png',
        selectedIconPath: '/static/bar/schedule.png'
      },
      {
        pagePath: '/pages/diet/diet',
        text: '饮食',
        iconPath: '/static/bar/diet_inactive.png',
        selectedIconPath: '/static/bar/diet.png'
      }
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