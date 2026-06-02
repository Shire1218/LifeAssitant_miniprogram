const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { billId, billData } = event

  try {
    const now = Date.now()

    if (billId) {
      const result = await db.collection('bills').doc(billId).update({
        data: {
          ...billData,
          updateTime: now
        }
      })

      return {
        success: true,
        message: '更新成功',
        data: result
      }
    } else {
      const result = await db.collection('bills').add({
        data: {
          ...billData,
          createTime: now,
          updateTime: now
        }
      })

      return {
        success: true,
        message: '添加成功',
        data: result
      }
    }
  } catch (err) {
    console.error('saveBill error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
