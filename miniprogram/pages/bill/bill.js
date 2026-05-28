const storage = require('../../utils/storage')
const { formatMoney, getToday, getYearRange, getMonthRange } = require('../../utils/time')
const { showToast, showConfirm, generateId, groupBy, sortBy, sumBy } = require('../../utils/common')

const EXPENSE_TAGS = ['交通', '餐饮', '日用', '购物', '娱乐', '医疗', '教育', '其他']
const INCOME_TAGS = ['工资', '奖金', '红包', '兼职', '其他']

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
    type: 'expense',
    expenseTags: EXPENSE_TAGS,
    incomeTags: INCOME_TAGS,
    summaryType: 'month',
    selectedYear: 0,
    selectedMonth: 0,
    selectedYearIndex: 0,
    yearList: [],
    monthList: [],
    monthTotal: { income: 0, expense: 0, balance: 0 },
    yearTotal: { income: 0, expense: 0, balance: 0 },
    groupedBills: [],
    currentMonth: '',
    currentYear: '',
    showAddModal: false,
    editingBill: null,
    form: {
      type: 'expense',
      tag: '餐饮',
      amount: '',
      note: '',
      date: ''
    },
    selectedTags: [],
    batchMode: false,
    fabTop: 0,
    fabRight: 40,
    fabStyle: '',
    isDragging: false,
    touchStartX: 0,
    touchStartY: 0,
    fabStartTop: 0,
    fabStartRight: 0
  },

  onLoad() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const yearList = getYearList()
    const yearIndex = yearList.indexOf(year)
    const systemInfo = wx.getSystemInfoSync()
    const windowHeight = systemInfo.windowHeight
    const safeBottom = systemInfo.safeArea ? (systemInfo.windowHeight - systemInfo.safeArea.bottom) : 0
    const tabBarHeight = 60
    const fabSize = 60
    const minTop = windowHeight * 0.5
    const maxTop = windowHeight - fabSize - safeBottom - tabBarHeight - 20
    const defaultTop = Math.max(minTop, Math.min(maxTop, windowHeight * 0.65))

    this.setData({
      selectedYear: year,
      selectedMonth: month,
      selectedYearIndex: yearIndex >= 0 ? yearIndex : 0,
      yearList: yearList,
      monthList: getMonthList(),
      fabTop: defaultTop,
      fabRight: 40,
      fabStyle: `top:${defaultTop}px;right:40px;`
    })
    this.loadBills()
  },

  onShow() {
    this.loadBills()
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ active: 0 })
    }
  },

  onPullDownRefresh() {
    this.loadBills()
    wx.stopPullDownRefresh()
  },

  switchSummaryType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ summaryType: type })
    this.computeSummary()
  },

  changeYear(e) {
    const yearIndex = Number(e.detail.value)
    const year = this.data.yearList[yearIndex]
    this.setData({ selectedYearIndex: yearIndex, selectedYear: year }, () => {
      this.computeSummary()
    })
  },

  changeMonth(e) {
    const monthIndex = Number(e.detail.value)
    const month = this.data.monthList[monthIndex]
    this.setData({ selectedMonth: month }, () => {
      this.computeSummary()
    })
  },

  loadBills() {
    const bills = storage.get('bills') || []
    const sortedBills = sortBy(bills, 'createTime', true)
    this.setData({ bills: sortedBills }, () => {
      this.computeSummary()
    })
  },

  computeSummary() {
    const { bills, summaryType, selectedYear, selectedMonth } = this.data

    const monthRange = getMonthRange(new Date())
    const currentMonth = `${monthRange.year}年${monthRange.month}月`
    const monthBills = bills.filter(bill => {
      const billMonth = bill.date.substring(0, 7)
      return billMonth === `${monthRange.year}-${String(monthRange.month).padStart(2, '0')}`
    })
    const monthIncome = sumBy(monthBills.filter(b => b.type === 'income'), 'amount')
    const monthExpense = sumBy(monthBills.filter(b => b.type === 'expense'), 'amount')

    const yearRange = getYearRange(new Date())
    const currentYear = `${yearRange.year}年`
    const yearBills = bills.filter(bill => {
      const billYear = bill.date.substring(0, 4)
      return billYear === String(yearRange.year)
    })
    const yearIncome = sumBy(yearBills.filter(b => b.type === 'income'), 'amount')
    const yearExpense = sumBy(yearBills.filter(b => b.type === 'expense'), 'amount')

    let filteredBills = []
    if (summaryType === 'month') {
      const targetMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
      filteredBills = bills.filter(bill => bill.date.substring(0, 7) === targetMonth)
    } else {
      filteredBills = bills.filter(bill => bill.date.substring(0, 4) === String(selectedYear))
    }

    const grouped = this.groupBillsByDate(filteredBills)

    const displayIncome = sumBy(filteredBills.filter(b => b.type === 'income'), 'amount')
    const displayExpense = sumBy(filteredBills.filter(b => b.type === 'expense'), 'amount')

    this.setData({
      groupedBills: grouped,
      monthTotal: {
        income: formatMoney(displayIncome),
        expense: formatMoney(displayExpense),
        balance: formatMoney(displayIncome - displayExpense)
      },
      yearTotal: {
        income: formatMoney(displayIncome),
        expense: formatMoney(displayExpense),
        balance: formatMoney(displayIncome - displayExpense)
      },
      currentMonth,
      currentYear
    })
  },

  groupBillsByDate(bills) {
    const grouped = groupBy(bills, 'date')
    const result = Object.keys(grouped)
      .sort((a, b) => b.localeCompare(a))
      .map(date => ({
        date,
        dateText: this.formatDateText(date),
        items: sortBy(grouped[date], 'createTime', true),
        dayIncome: formatMoney(sumBy(grouped[date].filter(b => b.type === 'income'), 'amount')),
        dayExpense: formatMoney(sumBy(grouped[date].filter(b => b.type === 'expense'), 'amount'))
      }))
    return result
  },

  formatDateText(dateStr) {
    const parts = dateStr.split('-')
    const year = parts[0]
    const month = parts[1]
    const day = parts[2]
    return `${year}年${month}月${day}日`
  },

  switchType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      'form.type': type,
      'form.tag': type === 'expense' ? '餐饮' : '工资'
    })
  },

  selectTag(e) {
    const tag = e.currentTarget.dataset.tag
    this.setData({ 'form.tag': tag })
  },

  inputAmount(e) {
    this.setData({ 'form.amount': e.detail.value })
  },

  inputNote(e) {
    this.setData({ 'form.note': e.detail.value })
  },

  changeDate(e) {
    this.setData({ 'form.date': e.detail.value })
  },

  openAddModal() {
    this.setData({
      showAddModal: true,
      editingBill: null,
      form: {
        type: 'expense',
        tag: '餐饮',
        amount: '',
        note: '',
        date: getToday()
      }
    })
  },

  closeAddModal() {
    this.setData({ showAddModal: false, editingBill: null })
  },

  editBill(e) {
    const bill = e.currentTarget.dataset.bill
    this.setData({
      showAddModal: true,
      editingBill: bill,
      form: {
        type: bill.type,
        tag: bill.tag,
        amount: String(bill.amount),
        note: bill.note,
        date: bill.date
      }
    })
  },

  async saveBill() {
    const { form, editingBill } = this.data

    if (!form.amount || Number(form.amount) <= 0) {
      showToast('请输入有效金额')
      return
    }

    if (!form.date) {
      showToast('请选择日期')
      return
    }

    let bills = storage.get('bills') || []

    if (editingBill) {
      bills = bills.map(b => {
        if (b.id === editingBill.id) {
          return {
            ...b,
            type: form.type,
            tag: form.tag,
            amount: Number(form.amount),
            note: form.note,
            date: form.date,
            updateTime: new Date().getTime()
          }
        }
        return b
      })
      showToast('修改成功', 'success')
    } else {
      const newBill = {
        id: generateId(),
        type: form.type,
        tag: form.tag,
        amount: Number(form.amount),
        note: form.note,
        date: form.date,
        createTime: new Date().getTime(),
        updateTime: new Date().getTime()
      }
      bills.unshift(newBill)
      showToast('添加成功', 'success')
    }

    storage.set('bills', bills)
    this.closeAddModal()
    this.loadBills()
  },

  async deleteBill(e) {
    const bill = e.currentTarget.dataset.bill
    const confirmed = await showConfirm('确定要删除这条账单吗？')
    if (!confirmed) return

    let bills = storage.get('bills') || []
    bills = bills.filter(b => b.id !== bill.id)
    storage.set('bills', bills)
    showToast('删除成功', 'success')
    this.loadBills()
  },

  toggleBatchMode() {
    this.setData({
      batchMode: !this.data.batchMode,
      selectedTags: []
    })
  },

  onBillTap(e) {
    if (this.data.batchMode) return
    const bill = e.currentTarget.dataset.bill
    this.editBill(e)
  },

  onModalTap() {},

  preventMove() {},

  selectBill(e) {
    const id = e.currentTarget.dataset.id
    const selected = [...this.data.selectedTags]
    const index = selected.indexOf(id)
    if (index > -1) {
      selected.splice(index, 1)
    } else {
      selected.push(id)
    }
    this.setData({ selectedTags: selected })
  },

  async batchDelete() {
    if (this.data.selectedTags.length === 0) {
      showToast('请选择要删除的账单')
      return
    }

    const confirmed = await showConfirm(`确定要删除选中的 ${this.data.selectedTags.length} 条账单吗？`)
    if (!confirmed) return

    let bills = storage.get('bills') || []
    bills = bills.filter(b => !this.data.selectedTags.includes(b.id))
    storage.set('bills', bills)
    showToast(`已删除 ${this.data.selectedTags.length} 条账单`, 'success')
    this.setData({ batchMode: false, selectedTags: [] })
    this.loadBills()
  },

  onFabTouchStart(e) {
    const touch = e.touches[0]
    this.setData({
      isDragging: false,
      touchStartX: touch.clientX,
      touchStartY: touch.clientY,
      fabStartTop: this.data.fabTop,
      fabStartRight: this.data.fabRight
    })
  },

  onFabTouchMove(e) {
    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - this.data.touchStartX)
    const deltaY = Math.abs(touch.clientY - this.data.touchStartY)

    if (deltaX > 5 || deltaY > 5) {
      this.setData({ isDragging: true })
    }

    const systemInfo = wx.getSystemInfoSync()
    const windowHeight = systemInfo.windowHeight
    const windowWidth = systemInfo.windowWidth
    const safeBottom = systemInfo.safeArea ? (systemInfo.windowHeight - systemInfo.safeArea.bottom) : 0
    const tabBarHeight = 60
    const fabSize = 60
    const minTop = windowHeight * 0.5
    const maxTop = windowHeight - fabSize - safeBottom - tabBarHeight - 20
    const minRight = windowWidth * 0.5

    let newTop = this.data.fabStartTop + (touch.clientY - this.data.touchStartY)
    let newRight = this.data.fabStartRight - (touch.clientX - this.data.touchStartX)

    newTop = Math.max(minTop, Math.min(maxTop, newTop))
    newRight = Math.max(0, Math.min(minRight, newRight))

    this.setData({
      fabTop: newTop,
      fabRight: newRight,
      fabStyle: `top:${newTop}px;right:${newRight}px;`
    })
  },

  onFabTouchEnd(e) {
    if (this.data.isDragging) {
      return
    }
    this.openAddModal()
  }
})
