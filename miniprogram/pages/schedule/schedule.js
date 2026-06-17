const storage = require('../../utils/storage')
const { formatDate, getToday, getDaysInMonth } = require('../../utils/time')
const { showToast, showConfirm, generateId, sortBy } = require('../../utils/common')

Page({
  data: {
    schedules: [],
    daySchedules: [],
    currentYear: 0,
    currentMonth: 0,
    selectedDate: getToday(),
    calendarDays: [],
    scheduleDates: [],
    showAddModal: false,
    editingSchedule: null,
    priorityOptions: [
      { value: 'high', label: '高', color: '#ff4d4f' },
      { value: 'medium', label: '中', color: '#faad14' },
      { value: 'low', label: '低', color: '#52c41a' }
    ],
    form: {
      title: '',
      startTime: '',
      endTime: '',
      location: '',
      note: '',
      remind: false,
      priority: 'medium'
    }
  },

  onLoad() {
    const now = new Date()
    this.setData({
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth()
    })
    this.loadSchedules()
    this.initCalendar()
  },

  onShow() {
    this.loadSchedules()
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ active: 1 })
    }
  },

  loadSchedules() {
    const schedules = storage.get('schedules') || []
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const sorted = schedules.sort((a, b) => {
      const timeA = a.startTime || ''
      const timeB = b.startTime || ''
      if (timeA !== timeB) return timeA.localeCompare(timeB)
      const pA = priorityOrder[a.priority] !== undefined ? priorityOrder[a.priority] : 1
      const pB = priorityOrder[b.priority] !== undefined ? priorityOrder[b.priority] : 1
      return pA - pB
    })
    const scheduleDates = [...new Set(sorted.map(s => s.date))]
    const daySchedules = sorted.filter(s => s.date === this.data.selectedDate)
    this.setData({
      schedules: sorted,
      daySchedules,
      scheduleDates
    })
    this.updateCalendar()
  },

  initCalendar() {
    const year = this.data.currentYear
    const month = this.data.currentMonth
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = getDaysInMonth(year, month + 1)

    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', date: '', empty: true, isToday: false, isSelected: false, hasSchedule: false, idx: 'e' + i })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({
        day: i,
        date: dateStr,
        empty: false,
        isToday: dateStr === getToday(),
        isSelected: dateStr === this.data.selectedDate,
        hasSchedule: this.data.scheduleDates.includes(dateStr),
        idx: dateStr
      })
    }

    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    this.setData({
      calendarDays: days,
      currentMonthText: `${year}年 ${monthNames[month]}`
    })
  },

  updateCalendar() {
    const days = this.data.calendarDays.map(day => {
      if (day.date) {
        return {
          ...day,
          hasSchedule: this.data.scheduleDates.includes(day.date)
        }
      }
      return day
    })
    this.setData({ calendarDays: days })
  },

  prevMonth() {
    let year = this.data.currentYear
    let month = this.data.currentMonth
    month--
    if (month < 0) {
      month = 11
      year--
    }
    this.setData({ currentYear: year, currentMonth: month })
    this.initCalendar()
  },

  nextMonth() {
    let year = this.data.currentYear
    let month = this.data.currentMonth
    month++
    if (month > 11) {
      month = 0
      year++
    }
    this.setData({ currentYear: year, currentMonth: month })
    this.initCalendar()
  },

  selectDate(e) {
    const date = e.currentTarget.dataset.date
    if (!date) return
    const daySchedules = this.data.schedules.filter(s => s.date === date)
    this.setData({ selectedDate: date, daySchedules })
    const days = this.data.calendarDays.map(d => {
      return { ...d, isSelected: d.date === date }
    })
    this.setData({ calendarDays: days })
  },

  getDaySchedules() {
    return this.data.schedules.filter(s => s.date === this.data.selectedDate)
  },

  openAddModal() {
    this.setData({
      showAddModal: true,
      editingSchedule: null,
      form: {
        title: '',
        startTime: '',
        endTime: '',
        location: '',
        note: '',
        remind: false,
        date: this.data.selectedDate,
        priority: 'medium'
      }
    })
  },

  closeAddModal() {
    this.setData({ showAddModal: false, editingSchedule: null })
  },

  editSchedule(e) {
    const schedule = e.currentTarget.dataset.schedule
    this.setData({
      showAddModal: true,
      editingSchedule: schedule,
      form: {
        title: schedule.title,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        location: schedule.location,
        note: schedule.note,
        remind: schedule.remind,
        date: schedule.date,
        priority: schedule.priority || 'medium'
      }
    })
  },

  inputTitle(e) {
    this.setData({ 'form.title': e.detail.value })
  },

  inputLocation(e) {
    this.setData({ 'form.location': e.detail.value })
  },

  inputNote(e) {
    this.setData({ 'form.note': e.detail.value })
  },

  changeStartTime(e) {
    this.setData({ 'form.startTime': e.detail.value })
  },

  changeEndTime(e) {
    this.setData({ 'form.endTime': e.detail.value })
  },

  changeDate(e) {
    this.setData({ 'form.date': e.detail.value })
  },

  toggleRemind() {
    this.setData({ 'form.remind': !this.data.form.remind })
  },

  selectPriority(e) {
    const priority = e.currentTarget.dataset.priority
    this.setData({ 'form.priority': priority })
  },

  checkTimeConflict(form, editingId) {
    if (!form.startTime || !form.endTime || !form.date) return null
    const schedules = storage.get('schedules') || []
    for (const s of schedules) {
      if (s.id === editingId) continue
      if (s.date !== form.date || !s.startTime || !s.endTime) continue
      if (form.startTime < s.endTime && s.startTime < form.endTime) {
        return s
      }
    }
    return null
  },

  async saveSchedule() {
    const { form, editingSchedule } = this.data

    if (!form.title) {
      showToast('请输入日程标题')
      return
    }

    if (!form.date) {
      showToast('请选择日期')
      return
    }

    if (!form.startTime) {
      showToast('请选择开始时间')
      return
    }

    if (form.endTime && form.startTime >= form.endTime) {
      showToast('开始时间不能晚于结束时间')
      return
    }

    const conflict = this.checkTimeConflict(form, editingSchedule ? editingSchedule.id : null)
    if (conflict) {
      showToast(`与「${conflict.title}」(${conflict.startTime}-${conflict.endTime}) 时间冲突`)
      return
    }

    let schedules = storage.get('schedules') || []

    if (editingSchedule) {
      schedules = schedules.map(s => {
        if (s.id === editingSchedule.id) {
          return {
            ...s,
            title: form.title,
            date: form.date,
            startTime: form.startTime,
            endTime: form.endTime,
            location: form.location,
            note: form.note,
            remind: form.remind,
            priority: form.priority,
            updateTime: new Date().getTime()
          }
        }
        return s
      })
      showToast('修改成功', 'success')
    } else {
      const newSchedule = {
        id: generateId(),
        title: form.title,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location,
        note: form.note,
        remind: form.remind,
        priority: form.priority,
        completed: false,
        createTime: new Date().getTime(),
        updateTime: new Date().getTime()
      }
      schedules.push(newSchedule)
      showToast('添加成功', 'success')
    }

    schedules = sortBy(schedules, 'startTime', false)
    storage.set('schedules', schedules)
    this.closeAddModal()
    this.loadSchedules()
  },

  async deleteSchedule(e) {
    const schedule = e.currentTarget.dataset.schedule
    const confirmed = await showConfirm('确定要删除这条日程吗？')
    if (!confirmed) return

    let schedules = storage.get('schedules') || []
    schedules = schedules.filter(s => s.id !== schedule.id)
    storage.set('schedules', schedules)
    showToast('删除成功', 'success')
    this.loadSchedules()
  },

  async toggleComplete(e) {
    const schedule = e.currentTarget.dataset.schedule
    let schedules = storage.get('schedules') || []
    schedules = schedules.map(s => {
      if (s.id === schedule.id) {
        return { ...s, completed: !s.completed }
      }
      return s
    })
    storage.set('schedules', schedules)
    this.loadSchedules()
  },

  onModalTap() {},

  preventMove() {}
})
