const { callCloud } = require('./cloud')

const noteService = {
  getNotes(params = {}) {
    return callCloud('getNotes', params)
  },

  saveNote(noteData, noteId) {
    return callCloud('saveNote', { noteId, noteData })
  },

  deleteNote(noteId) {
    return callCloud('deleteNote', { noteId })
  }
}

module.exports = noteService
