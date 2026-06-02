const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { skip = 0, limit = 100 } = event

  try {
    const result = await db.collection('notes')
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(limit)
      .get()

    return {
      success: true,
      data: result.data,
      total: result.data.length
    }
  } catch (err) {
    console.error('getNotes error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
