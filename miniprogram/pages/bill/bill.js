const storage = require('../../utils/storage')
const { formatMoney, getMonthRange, getToday } = require('../../utils/time')
const { showToast, showConfirm, generateId, groupBy, sortBy, sumBy } = require('../../utils/common')

const EXPENSE_TAGS = ['交通', '餐饮', '日用', '购物', '娱乐', '医疗', '教育', '其他']
const INCOME_TAGS = ['工资', '奖金', '红包', '兼职', '其他']

Page({
  data: {
    bills: [],
    type: 'expense',
    expenseTags: EXPENSE_TAGS,
    incomeTags: INCOME_TAGS,
    monthTotal: { income: 0, expense: 0, balance: 0 },
    groupedBills: [],
    currentMonth: '',
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
    batchMode: false
  },

  onLoad() {
    this.loadBills()
  },

  onShow() {
    this.loadBills()
  },

  onPullDownRefresh() {
    this.loadBills()
    wx.stopPullDownRefresh()
  },

  loadBills() {
    const bills = storage.get('bills') || []
    const sortedBills = sortBy(bills, 'createTime', true)
    const monthRange = getMonthRange(new Date())
    const currentMonth = `${monthRange.year}年${monthRange.month}月`

    const monthBills = sortedBills.filter(bill => {
      const billMonth = bill.date.substring(0, 7)
      return billMonth === `${monthRange.year}-${String(monthRange.month).padStart(2, '0')}`
    })

    const income = sumBy(monthBills.filter(b => b.type === 'income'), 'amount')
    const expense = sumBy(monthBills.filter(b => b.type === 'expense'), 'amount')

    const grouped = this.groupBillsByDate(sortedBills)

    this.setData({
      bills: sortedBills,
      groupedBills: grouped,
      monthTotal: {
        income: formatMoney(income),
        expense: formatMoney(expense),
        balance: formatMoney(income - expense)
      },
      currentMonth
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
    const date = new Date(dateStr)
    const today = getToday()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateStr === today) return '今天'
    if (dateStr === formatDate(yesterday)) return '昨天'

    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${weekDays[date.getDay()]} ${date.getMonth() + 1}月${date.getDate()}日`
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
  }
})

function formatDate(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
