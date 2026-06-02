const { callCloud } = require('./cloud')

const billService = {
  getBills(params = {}) {
    return callCloud('getBills', params)
  },

  saveBill(billData, billId) {
    return callCloud('saveBill', { billId, billData })
  },

  deleteBill(billId) {
    return callCloud('deleteBill', { billId })
  },

  batchDelete(billIds) {
    return callCloud('deleteBill', { billIds })
  }
}

module.exports = billService
