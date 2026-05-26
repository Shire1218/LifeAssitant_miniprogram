const storage = require('../../utils/storage')
const { formatDate, formatTime, getToday } = require('../../utils/time')
const { showToast, showConfirm, generateId, sortBy, pickImage } = require('../../utils/common')

Page({
  data: {
    notes: [],
    showAddModal: false,
    editingNote: null,
    noteTitle: '',
    noteContent: '',
    draftKey: 'note_draft'
  },

  onLoad() {
    this.loadNotes()
    this.loadDraft()
  },

  onUnload() {
    this.saveDraft()
  },

  loadNotes() {
    const notes = storage.get('notes') || []
    const sorted = sortBy(notes, 'createTime', true)
    const notesWithTime = sorted.map(note => ({
      ...note,
      createTimeStr: formatTime(new Date(note.createTime)),
      dateStr: formatDate(new Date(note.createTime))
    }))
    this.setData({ notes: notesWithTime })
  },

  loadDraft() {
    const draft = storage.get(this.data.draftKey)
    if (draft) {
      this.setData({
        noteTitle: draft.title || '',
        noteContent: draft.content || ''
      })
    }
  },

  saveDraft() {
    if (this.data.noteTitle || this.data.noteContent) {
      storage.set(this.data.draftKey, {
        title: this.data.noteTitle,
        content: this.data.noteContent,
        time: new Date().getTime()
      })
    }
  },

  clearDraft() {
    storage.remove(this.data.draftKey)
    this.setData({ noteTitle: '', noteContent: '' })
  },

  inputTitle(e) {
    this.setData({ noteTitle: e.detail.value })
    this.debounceSaveDraft()
  },

  editorReady(e) {
    this.editorCtx = e.detail
  },

  onEditorChange(e) {
    this.debounceSaveDraft()
  },

  debounceSaveDraft: (() => {
    let timer = null
    return function () {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        this.saveDraft()
      }, 1000)
    }
  })(),

  formatBold() {
    this.editorCtx.format('bold')
  },

  formatItalic() {
    this.editorCtx.format('italic')
  },

  formatUnderline() {
    this.editorCtx.format('underline')
  },

  formatHeader(e) {
    const value = e.currentTarget.dataset.value
    this.editorCtx.format('header', value)
  },

  formatAlign(e) {
    const value = e.currentTarget.dataset.value
    this.editorCtx.format('align', value)
  },

  formatList() {
    this.editorCtx.format('list', 'checked')
  },

  formatOrderedList() {
    this.editorCtx.format('list', 'ordered')
  },

  formatColor(e) {
    const color = e.currentTarget.dataset.color
    this.editorCtx.format('color', color)
  },

  formatBgColor(e) {
    const color = e.currentTarget.dataset.color
    this.editorCtx.format('bgcolor', color)
  },

  async insertImage() {
    const images = await pickImage(9)
    if (images.length > 0) {
      images.forEach(img => {
        this.editorCtx.insertImage({
          src: img,
          alt: '图片',
          width: '100%',
          success: () => {
            console.log('图片插入成功')
          }
        })
      })
    }
  },

  openAddModal() {
    this.setData({
      showAddModal: true,
      editingNote: null,
      noteTitle: '',
      noteContent: ''
    })
  },

  closeAddModal() {
    this.setData({ showAddModal: false, editingNote: null })
  },

  editNote(e) {
    const note = e.currentTarget.dataset.note
    this.setData({
      showAddModal: true,
      editingNote: note,
      noteTitle: note.title,
      noteContent: note.content
    })
  },

  async saveNote() {
    if (!this.data.noteTitle) {
      showToast('请输入标题')
      return
    }

    const editorCtx = this.editorCtx
    editorCtx.getDelta({
      success: (res) => {
        const content = res.delta ? JSON.stringify(res.delta) : ''
        const ops = res.delta ? res.delta.ops : []

        let firstImage = ''
        for (let op of ops) {
          if (op.insert && op.insert.image) {
            firstImage = op.insert.image
            break
          }
        }

        let plainText = ''
        for (let op of ops) {
          if (typeof op.insert === 'string') {
            plainText += op.insert
          }
        }

        let notes = storage.get('notes') || []

        if (this.data.editingNote) {
          notes = notes.map(n => {
            if (n.id === this.data.editingNote.id) {
              return {
                ...n,
                title: this.data.noteTitle,
                content: content,
                plainText: plainText.substring(0, 100),
                firstImage: firstImage,
                updateTime: new Date().getTime()
              }
            }
            return n
          })
          showToast('修改成功', 'success')
        } else {
          const newNote = {
            id: generateId(),
            title: this.data.noteTitle,
            content: content,
            plainText: plainText.substring(0, 100),
            firstImage: firstImage,
            createTime: new Date().getTime(),
            updateTime: new Date().getTime()
          }
          notes.unshift(newNote)
          showToast('保存成功', 'success')
        }

        storage.set('notes', notes)
        this.closeAddModal()
        this.clearDraft()
        this.loadNotes()
      }
    })
  },

  async deleteNote(e) {
    const note = e.currentTarget.dataset.note
    const confirmed = await showConfirm('确定要删除这篇随笔吗？')
    if (!confirmed) return

    let notes = storage.get('notes') || []
    notes = notes.filter(n => n.id !== note.id)
    storage.set('notes', notes)
    showToast('删除成功', 'success')
    this.loadNotes()
  },

  viewNoteDetail(e) {
    const note = e.currentTarget.dataset.note
    wx.navigateTo({
      url: `/pages/note/detail?id=${note.id}`
    })
  }
})
