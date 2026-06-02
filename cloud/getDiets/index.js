const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { date, mealType, dateStart, dateEnd, skip = 0, limit = 100 } = event

  try {
    const where = {}
    if (date) {
      where.date = date
    } else if (dateStart || dateEnd) {
      where.date = {}
      if (dateStart) where.date['>='] = dateStart
      if (dateEnd) where.date['<='] = dateEnd
    }
    if (mealType) {
      where.mealType = mealType
    }

    const result = await db.collection('diets')
      .where(where)
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
    console.error('getDiets error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
