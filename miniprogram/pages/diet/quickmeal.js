const storage = require('../../utils/storage')
const { getToday } = require('../../utils/time')
const { showToast, showConfirm, generateId } = require('../../utils/common')

const DEFAULT_MEALS = {
  breakfast: [
    { id: 'd1', name: '豆浆+油条', category: '中式', price: 0 },
    { id: 'd2', name: '小米粥+包子', category: '中式', price: 0 },
    { id: 'd3', name: '鸡蛋+牛奶+面包', category: '西式', price: 0 },
    { id: 'd4', name: '燕麦片+牛奶', category: '西式', price: 0 },
    { id: 'd5', name: '煎饼果子', category: '中式', price: 0 },
    { id: 'd6', name: '馄饨+茶叶蛋', category: '中式', price: 0 }
  ],
  lunch: [
    { id: 'd7', name: '红烧肉+米饭', category: '家常菜', price: 0 },
    { id: 'd8', name: '宫保鸡丁+米饭', category: '家常菜', price: 0 },
    { id: 'd9', name: '番茄炒蛋+米饭', category: '家常菜', price: 0 },
    { id: 'd10', name: '牛肉面', category: '面食', price: 0 },
    { id: 'd11', name: '黄焖鸡米饭', category: '快餐', price: 0 },
    { id: 'd12', name: '麻辣烫', category: '快餐', price: 0 },
    { id: 'd13', name: '盖浇饭', category: '快餐', price: 0 },
    { id: 'd14', name: '饺子', category: '面食', price: 0 }
  ],
  dinner: [
    { id: 'd15', name: '清蒸鱼+蔬菜+米饭', category: '家常菜', price: 0 },
    { id: 'd16', name: '紫菜蛋花汤+馒头', category: '家常菜', price: 0 },
    { id: 'd17', name: '炒面', category: '面食', price: 0 },
    { id: 'd18', name: '火锅', category: '聚餐', price: 0 },
    { id: 'd19', name: '沙拉+鸡胸肉', category: '轻食', price: 0 },
    { id: 'd20', name: '粥+小菜', category: '清淡', price: 0 }
  ],
  snack: [
    { id: 'd21', name: '水果拼盘', category: '水果', price: 0 },
    { id: 'd22', name: '坚果混合', category: '坚果', price: 0 },
    { id: 'd23', name: '酸奶', category: '乳制品', price: 0 },
    { id: 'd24', name: '饼干+咖啡', category: '下午茶', price: 0 },
    { id: 'd25', name: '薯片', category: '零食', price: 0 },
    { id: 'd26', name: '冰淇淋', category: '甜品', price: 0 }
  ]
}

const MEAL_TYPES = [
  { key: 'breakfast', label: '早餐', emoji: '🌅' },
  { key: 'lunch', label: '午餐', emoji: '☀️' },
  { key: 'dinner', label: '晚餐', emoji: '🌙' },
  { key: 'snack', label: '加餐', emoji: '🍪' }
]

Page({
  data: {
    quickMeals: {},
    mealTypes: MEAL_TYPES,
    activeMealTab: 'breakfast',
    showEditModal: false,
    editingItem: null,
    form: { name: '', category: '', price: '' }
  },

  onLoad() {
    this.loadQuickMeals()
  },

  loadQuickMeals() {
    let quickMeals = storage.get('quickMeals')
    if (!quickMeals) {
      quickMeals = DEFAULT_MEALS
      storage.set('quickMeals', quickMeals)
    }
    this.setData({ quickMeals })
  },

  switchMealTab(e) {
    const mealType = e.currentTarget.dataset.meal
    this.setData({ activeMealTab: mealType })
  },

  getCurrentMeals() {
    return this.data.quickMeals[this.data.activeMealTab] || []
  },

  openAddModal() {
    this.setData({
      showEditModal: true,
      editingItem: null,
      form: { name: '', category: '', price: '' }
    })
  },

  closeEditModal() {
    this.setData({ showEditModal: false, editingItem: null })
  },

  onModalTap() {},
  preventMove() {},

  openEditModal(e) {
    const item = e.currentTarget.dataset.item
    this.setData({
      showEditModal: true,
      editingItem: item,
      form: { name: item.name, category: item.category, price: String(item.price) }
    })
  },

  inputName(e) {
    this.setData({ 'form.name': e.detail.value })
  },

  inputCategory(e) {
    this.setData({ 'form.category': e.detail.value })
  },

  inputPrice(e) {
    this.setData({ 'form.price': e.detail.value })
  },

  saveItem() {
    const { form, editingItem, activeMealTab } = this.data
    if (!form.name) {
      showToast('请输入名称')
      return
    }
    let quickMeals = { ...this.data.quickMeals }
    const meals = [...(quickMeals[activeMealTab] || [])]

    if (editingItem) {
      const idx = meals.findIndex(m => m.id === editingItem.id)
      if (idx > -1) {
        meals[idx] = { ...meals[idx], name: form.name, category: form.category, price: Number(form.price) || 0 }
      }
    } else {
      meals.push({ id: generateId(), name: form.name, category: form.category, price: Number(form.price) || 0 })
    }

    quickMeals[activeMealTab] = meals
    storage.set('quickMeals', quickMeals)
    this.setData({ quickMeals })
    this.closeEditModal()
    showToast(editingItem ? '修改成功' : '添加成功', 'success')
  },

  async deleteItem(e) {
    const item = e.currentTarget.dataset.item
    const confirmed = await showConfirm('确定要删除这个项目吗？')
    if (!confirmed) return

    const { activeMealTab } = this.data
    let quickMeals = { ...this.data.quickMeals }
    quickMeals[activeMealTab] = quickMeals[activeMealTab].filter(m => m.id !== item.id)
    storage.set('quickMeals', quickMeals)
    this.setData({ quickMeals })
    showToast('删除成功', 'success')
  },

  async selectMeal(e) {
    const meal = e.currentTarget.dataset.item
    let diets = storage.get('diets') || []
    const newDiet = {
      id: generateId(),
      mealType: this.data.activeMealTab,
      detail: meal.name,
      images: [],
      date: getToday(),
      createTime: new Date().getTime()
    }
    diets.push(newDiet)
    storage.set('diets', diets)
    showToast('已添加到饮食记录', 'success')
  },

  goBack() {
    wx.navigateBack()
  }
})
