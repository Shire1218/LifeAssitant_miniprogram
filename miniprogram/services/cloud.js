const callCloud = (name, data = {}) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        if (res.result && res.result.success) {
          resolve(res.result)
        } else {
          reject(res.result || { error: '云函数调用失败' })
        }
      },
      fail: (err) => {
        console.error(`云函数 ${name} 调用失败:`, err)
        reject(err)
      }
    })
  })
}

const uploadFile = (filePath, folder = 'default') => {
  return new Promise((resolve, reject) => {
    wx.cloud.uploadFile({
      cloudPath: `${folder}/${Date.now()}_${filePath.split('/').pop()}`,
      filePath,
      success: (res) => {
        resolve(res.fileID)
      },
      fail: (err) => {
        console.error('文件上传失败:', err)
        reject(err)
      }
    })
  })
}

const downloadFile = (fileID) => {
  return new Promise((resolve, reject) => {
    wx.cloud.downloadFile({
      fileID,
      success: (res) => {
        resolve(res.tempFilePath)
      },
      fail: (err) => {
        console.error('文件下载失败:', err)
        reject(err)
      }
    })
  })
}

module.exports = {
  callCloud,
  uploadFile,
  downloadFile
}
