const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { dietId, dietData } = event

  try {
    const now = Date.now()

    if (dietId) {
      const result = await db.collection('diets').doc(dietId).update({
        data: {
          ...dietData,
          updateTime: now
        }
      })

      return {
        success: true,
        message: '更新成功',
        data: result
      }
    } else {
      const result = await db.collection('diets').add({
        data: {
          ...dietData,
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
    console.error('saveDiet error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
