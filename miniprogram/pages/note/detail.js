const storage = require('../../utils/storage')
const { formatDate, formatTime } = require('../../utils/time')

Page({
  data: {
    note: null,
    contentHtml: ''
  },

  onLoad(options) {
    if (options.id) {
      this.loadNote(options.id)
    }
  },

  loadNote(id) {
    const notes = storage.get('notes') || []
    const note = notes.find(n => n.id === id)
    if (note) {
      let contentObj = null
      try {
        contentObj = JSON.parse(note.content)
      } catch (e) {
        contentObj = null
      }

      let htmlContent = ''
      if (contentObj && contentObj.ops) {
        htmlContent = this.deltaToHtml(contentObj.ops)
      }

      this.setData({
        note: {
          ...note,
          dateStr: formatDate(new Date(note.createTime)),
          timeStr: formatTime(new Date(note.createTime))
        },
        contentHtml: htmlContent
      })
    } else {
      wx.showToast({ title: '随笔不存在', icon: 'none' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  deltaToHtml(ops) {
    let html = ''
    for (let op of ops) {
      let text = op.insert || ''
      if (typeof text === 'string' && text.trim()) {
        let attrs = ''
        if (op.attributes) {
          if (op.attributes.bold) attrs += 'font-weight: bold;'
          if (op.attributes.italic) attrs += 'font-style: italic;'
          if (op.attributes.underline) attrs += 'text-decoration: underline;'
          if (op.attributes.color) attrs += `color: ${op.attributes.color};`
          if (op.attributes.bgcolor) attrs += `background-color: ${op.attributes.bgcolor};`
          if (op.attributes.header) {
            const sizes = { 1: '36rpx', 2: '32rpx', 3: '28rpx' }
            attrs += `font-size: ${sizes[op.attributes.header] || '28rpx'}; font-weight: 600;`
          }
          if (op.attributes.align) attrs += `text-align: ${op.attributes.align};`
        }
        html += `<div style="${attrs}">${text}</div>`
      } else if (op.insert && typeof op.insert === 'object' && op.insert.image) {
        html += `<image src="${op.insert.image}" mode="widthFix" style="width: 100%; margin: 16rpx 0;" />`
      }
    }
    return html
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({ current: url, urls: [url] })
  },

  goBack() {
    wx.navigateBack()
  }
})
