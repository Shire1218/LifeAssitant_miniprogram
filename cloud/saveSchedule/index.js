const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { scheduleId, scheduleData } = event

  try {
    const now = Date.now()

    if (scheduleId) {
      const result = await db.collection('schedules').doc(scheduleId).update({
        data: {
          ...scheduleData,
          updateTime: now
        }
      })

      return {
        success: true,
        message: '更新成功',
        data: result
      }
    } else {
      const result = await db.collection('schedules').add({
        data: {
          ...scheduleData,
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
    console.error('saveSchedule error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
