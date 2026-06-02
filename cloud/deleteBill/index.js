const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { billId, billIds = [] } = event

  try {
    const ids = billIds.length > 0 ? billIds : (billId ? [billId] : [])

    if (ids.length === 0) {
      return {
        success: false,
        error: '未指定要删除的账单'
      }
    }

    const promises = ids.map(id => db.collection('bills').doc(id).remove())
    await Promise.all(promises)

    return {
      success: true,
      message: `已删除 ${ids.length} 条账单`,
      count: ids.length
    }
  } catch (err) {
    console.error('deleteBill error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
