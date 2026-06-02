const { callCloud } = require('./cloud')

const scheduleService = {
  getSchedules(params = {}) {
    return callCloud('getSchedules', params)
  },

  saveSchedule(scheduleData, scheduleId) {
    return callCloud('saveSchedule', { scheduleId, scheduleData })
  },

  deleteSchedule(scheduleId) {
    return callCloud('deleteSchedule', { scheduleId })
  }
}

module.exports = scheduleService
