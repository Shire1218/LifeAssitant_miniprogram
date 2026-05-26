const storage = require('../../utils/storage')
const { getToday } = require('../../utils/time')
const { showToast, showConfirm, generateId, pickImage } = require('../../utils/common')

const MEAL_TYPES = [
  { key: 'breakfast', label: '早餐', emoji: '🌅' },
  { key: 'lunch', label: '午餐', emoji: '☀️' },
  { key: 'dinner', label: '晚餐', emoji: '🌙' },
  { key: 'snack', label: '加餐', emoji: '🍪' }
]

Page({
  data: {
    diets: [],
    todayDiets: [],
    currentMeals: [],
    currentMealType: { emoji: '🌅', label: '早餐' },
    selectedDate: getToday(),
    mealTypes: MEAL_TYPES,
    activeMealTab: 'breakfast',
    showAddModal: false,
    form: {
      mealType: 'breakfast',
      detail: '',
      images: [],
      date: getToday()
    }
  },

  onLoad() {
    this.loadDiets()
  },

  onShow() {
    this.loadDiets()
  },

  loadDiets() {
    const diets = storage.get('diets') || []
    const todayDiets = diets.filter(d => d.date === getToday())
    const currentMeals = todayDiets.filter(d => d.mealType === this.data.activeMealTab)
    const currentMealType = this.data.mealTypes.find(t => t.key === this.data.activeMealTab) || MEAL_TYPES[0]
    this.setData({ diets, todayDiets, currentMeals, currentMealType })
  },

  getMealsByType(type) {
    return this.data.todayDiets.filter(d => d.mealType === type)
  },

  changeDate(e) {
    this.setData({ selectedDate: e.detail.value })
  },

  switchMealTab(e) {
    const mealType = e.currentTarget.dataset.meal
    const currentMeals = this.data.todayDiets.filter(d => d.mealType === mealType)
    const currentMealType = this.data.mealTypes.find(t => t.key === mealType) || MEAL_TYPES[0]
    this.setData({ activeMealTab: mealType, currentMeals, currentMealType })
  },

  openAddModal() {
    this.setData({
      showAddModal: true,
      form: {
        mealType: this.data.activeMealTab,
        detail: '',
        images: [],
        date: this.data.selectedDate
      }
    })
  },

  closeAddModal() {
    this.setData({ showAddModal: false })
  },

  onModalTap() {},
  preventMove() {},

  inputDetail(e) {
    this.setData({ 'form.detail': e.detail.value })
  },

  changeMealTypeForm(e) {
    const mealType = e.currentTarget.dataset.meal
    this.setData({ 'form.mealType': mealType })
  },

  async chooseImage() {
    const images = await pickImage(9 - this.data.form.images.length)
    if (images.length > 0) {
      this.setData({
        'form.images': [...this.data.form.images, ...images]
      })
    }
  },

  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = [...this.data.form.images]
    images.splice(index, 1)
    this.setData({ 'form.images': images })
  },

  async saveDiet() {
    const { form } = this.data
    if (!form.detail) {
      showToast('请输入饮食详情')
      return
    }
    let diets = storage.get('diets') || []
    const newDiet = {
      id: generateId(),
      mealType: form.mealType,
      detail: form.detail,
      images: form.images,
      date: this.data.selectedDate,
      createTime: new Date().getTime()
    }
    diets.push(newDiet)
    storage.set('diets', diets)
    showToast('添加成功', 'success')
    this.closeAddModal()
    this.loadDiets()
  },

  async deleteDiet(e) {
    const diet = e.currentTarget.dataset.diet
    const confirmed = await showConfirm('确定要删除这条饮食记录吗？')
    if (!confirmed) return
    let diets = storage.get('diets') || []
    diets = diets.filter(d => d.id !== diet.id)
    storage.set('diets', diets)
    showToast('删除成功', 'success')
    this.loadDiets()
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url
    const diet = this.data.todayDiets.find(d => d.images && d.images.includes(url))
    wx.previewImage({ current: url, urls: diet ? diet.images : [url] })
  },

  goToQuickMeal() {
    wx.navigateTo({ url: '/pages/diet/quickmeal' })
  }
})
