const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const { filePath, folder = 'default' } = event

  try {
    const timestamp = Date.now()
    const ext = filePath.split('.').pop()
    const cloudPath = `${folder}/${timestamp}.${ext}`

    const result = await cloud.uploadFile({
      cloudPath,
      filePath
    })

    return {
      success: true,
      fileID: result.fileID,
      message: '上传成功'
    }
  } catch (err) {
    console.error('uploadImage error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
