const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${[year, month, day].map(formatNumber).join('-')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const formatMoney = num => {
  if (num === null || num === undefined) return '0.00'
  return Number(num).toFixed(2)
}

const getMonthRange = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  return {
    firstDay: formatDate(firstDay),
    lastDay: formatDate(lastDay),
    year,
    month: month + 1
  }
}

const getToday = () => {
  return formatDate(new Date())
}

const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate()
}

const getFirstDayOfWeek = (date) => {
  const day = date.getDay()
  const diff = date.getDate() - day
  return new Date(date.getFullYear(), date.getMonth(), diff)
}

const isSameDay = (date1, date2) => {
  return formatDate(new Date(date1)) === formatDate(new Date(date2))
}

const relativeTime = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return formatDate(date)
}

module.exports = {
  formatTime,
  formatDate,
  formatNumber,
  formatMoney,
  getMonthRange,
  getToday,
  getDaysInMonth,
  getFirstDayOfWeek,
  isSameDay,
  relativeTime
}
