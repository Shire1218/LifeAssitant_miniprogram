const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const { type, tag, dateStart, dateEnd, skip = 0, limit = 100, sortBy = 'createTime', desc = true } = event

  try {
    const where = {}
    if (type) where.type = type
    if (tag) where.tag = tag
    if (dateStart || dateEnd) {
      where.date = {}
      if (dateStart) where.date['>='] = dateStart
      if (dateEnd) where.date['<='] = dateEnd
    }

    const orderBy = desc ? 'desc' : 'asc'
    const result = await db.collection('bills')
      .where(where)
      .orderBy(sortBy, orderBy)
      .skip(skip)
      .limit(limit)
      .get()

    return {
      success: true,
      data: result.data,
      total: result.data.length
    }
  } catch (err) {
    console.error('getBills error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
