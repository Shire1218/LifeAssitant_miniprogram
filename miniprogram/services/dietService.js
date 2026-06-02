const { callCloud } = require('./cloud')

const dietService = {
  getDiets(params = {}) {
    return callCloud('getDiets', params)
  },

  saveDiet(dietData, dietId) {
    return callCloud('saveDiet', { dietId, dietData })
  },

  deleteDiet(dietId) {
    return callCloud('deleteDiet', { dietId })
  }
}

module.exports = dietService
