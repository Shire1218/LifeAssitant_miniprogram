const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { noteId, noteData } = event

  try {
    const now = Date.now()

    if (noteId) {
      const result = await db.collection('notes').doc(noteId).update({
        data: {
          ...noteData,
          updateTime: now
        }
      })

      return {
        success: true,
        message: '更新成功',
        data: result
      }
    } else {
      const result = await db.collection('notes').add({
        data: {
          ...noteData,
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
    console.error('saveNote error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
