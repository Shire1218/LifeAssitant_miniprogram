const storage = require('../../utils/storage')
const { formatMoney } = require('../../utils/time')
const { groupBy, sumBy } = require('../../utils/common')

const CHART_COLORS = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb']

function getYearList() {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let y = currentYear; y >= currentYear - 10; y--) {
    years.push(y)
  }
  return years
}

function getMonthList() {
  const months = []
  for (let m = 1; m <= 12; m++) {
    months.push(m)
  }
  return months
}

Page({
  data: {
    bills: [],
    timeRange: 'month',
    statType: 'expense',
    selectedYear: 0,
    selectedMonth: 0,
    selectedYearIndex: 0,
    yearList: [],
    monthList: [],
    chartData: [],
    totalAmount: 0,
    legendList: []
  },

  onLoad() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const yearList = getYearList()
    const yearIndex = yearList.indexOf(year)
    this.setData({
      selectedYear: year,
      selectedMonth: month,
      selectedYearIndex: yearIndex >= 0 ? yearIndex : 0,
      yearList: yearList,
      monthList: getMonthList()
    })
    this.loadBills()
  },

  onShow() {
    this.loadBills()
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ active: 1 })
    }
  },

  loadBills() {
    const bills = storage.get('bills') || []
    this.setData({ bills }, () => {
      this.computeStats()
    })
  },

  switchRange(e) {
    const range = e.currentTarget.dataset.range
    this.setData({ timeRange: range })
    this.computeStats()
  },

  switchType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ statType: type }, () => {
      this.computeStats()
    })
  },

  changeYear(e) {
    const yearIndex = Number(e.detail.value)
    if (isNaN(yearIndex) || yearIndex < 0 || yearIndex >= this.data.yearList.length) {
      return
    }
    const year = this.data.yearList[yearIndex]
    if (!year || year < 1900 || year > 2100) {
      return
    }
    this.setData({ selectedYearIndex: yearIndex, selectedYear: year }, () => {
      this.computeStats()
    })
  },

  changeMonth(e) {
    const monthIndex = Number(e.detail.value)
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex >= this.data.monthList.length) {
      return
    }
    const month = this.data.monthList[monthIndex]
    if (!month || month < 1 || month > 12) {
      return
    }
    this.setData({ selectedMonth: month }, () => {
      this.computeStats()
    })
  },

  computeStats() {
    const { bills, timeRange, statType, selectedYear, selectedMonth } = this.data

    let filtered = []
    if (timeRange === 'year') {
      filtered = bills.filter(b => b.date.substring(0, 4) === String(selectedYear))
    } else {
      const targetMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
      filtered = bills.filter(b => b.date.substring(0, 7) === targetMonth)
    }

    const typeBills = filtered.filter(b => b.type === statType)
    const grouped = groupBy(typeBills, 'tag')

    const chartData = []
    const legendList = []
    let total = 0

    Object.keys(grouped).forEach(tag => {
      const amount = sumBy(grouped[tag], 'amount')
      total += amount
    })

    const sortedTags = Object.keys(grouped).sort((a, b) => {
      return sumBy(grouped[b], 'amount') - sumBy(grouped[a], 'amount')
    })

    sortedTags.forEach((tag, index) => {
      const amount = sumBy(grouped[tag], 'amount')
      const percent = total > 0 ? (amount / total * 100) : 0
      chartData.push({
        name: tag,
        value: amount,
        percent: percent.toFixed(1),
        color: CHART_COLORS[index % CHART_COLORS.length]
      })
      legendList.push({
        name: tag,
        value: formatMoney(amount),
        percent: percent.toFixed(1) + '%',
        color: CHART_COLORS[index % CHART_COLORS.length]
      })
    })

    this.setData({
      chartData,
      totalAmount: formatMoney(total),
      legendList
    })

    setTimeout(() => {
      this.drawPieChart()
    }, 100)
  },

  drawPieChart() {
    const { chartData } = this.data
    if (chartData.length === 0) return

    const query = wx.createSelectorQuery()
    query.select('#pieCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) return
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const dpr = wx.getSystemInfoSync().pixelRatio
      canvas.width = res[0].width * dpr
      canvas.height = res[0].height * dpr
      ctx.scale(dpr, dpr)

      const width = res[0].width
      const height = res[0].height
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) / 2 - 10

      let startAngle = -Math.PI / 2
      chartData.forEach(item => {
        const sliceAngle = (item.percent / 100) * 2 * Math.PI
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
        ctx.closePath()
        ctx.fillStyle = item.color
        ctx.fill()

        const midAngle = startAngle + sliceAngle / 2
        const labelRadius = radius + 20
        const labelX = centerX + Math.cos(midAngle) * labelRadius
        const labelY = centerY + Math.sin(midAngle) * labelRadius

        ctx.fillStyle = '#333333'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(item.name, labelX, labelY)
        ctx.fillText(item.percent + '%', labelX, labelY + 14)

        startAngle += sliceAngle
      })
    })
  },

  onReady() {
    setTimeout(() => {
      this.drawPieChart()
    }, 300)
  }
})
