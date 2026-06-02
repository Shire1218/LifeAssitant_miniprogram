const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { date, dateStart, dateEnd, skip = 0, limit = 100 } = event

  try {
    const where = {}
    if (date) {
      where.date = date
    } else if (dateStart || dateEnd) {
      where.date = {}
      if (dateStart) where.date['>='] = dateStart
      if (dateEnd) where.date['<='] = dateEnd
    }

    const result = await db.collection('schedules')
      .where(where)
      .orderBy('startTime', 'asc')
      .skip(skip)
      .limit(limit)
      .get()

    return {
      success: true,
      data: result.data,
      total: result.data.length
    }
  } catch (err) {
    console.error('getSchedules error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
