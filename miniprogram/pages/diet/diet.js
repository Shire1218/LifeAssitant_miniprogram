const storage = require('../../utils/storage')
const { getToday } = require('../../utils/time')
const { showConfirm, generateId } = require('../../utils/common')

const FOOD_CATEGORIES = [
  { key: 'hotpot', label: '火锅', icon: '🍲', color: '#ff4d4f' },
  { key: 'bbq', label: '烤肉', icon: '🥩', color: '#fa8c16' },
  { key: 'xiangcai', label: '湘菜', icon: '🌶️', color: '#f5222d' },
  { key: 'sichuan', label: '川菜', icon: '🔥', color: '#eb2f96' },
  { key: 'guangdong', label: '粤菜', icon: '🥟', color: '#faad14' },
  { key: 'jiangsu', label: '苏菜', icon: '🐟', color: '#13c2c2' },
  { key: 'western', label: '西餐', icon: '🍝', color: '#722ed1' },
  { key: 'japanese', label: '日料', icon: '🍣', color: '#2f54eb' },
  { key: 'fastfood', label: '快餐', icon: '🍔', color: '#1677ff' },
  { key: 'dessert', label: '甜品', icon: '🍰', color: '#eb2f96' },
  { key: 'drink', label: '饮品', icon: '🧋', color: '#52c41a' },
  { key: 'snack', label: '小吃', icon: '🍢', color: '#fa8c16' }
]

const FOOD_DATABASE = {
  hotpot: [], bbq: [], xiangcai: [], sichuan: [],
  guangdong: [], jiangsu: [], western: [], japanese: [],
  fastfood: [], dessert: [], drink: [], snack: []
}

const MEAL_TYPES = [
  { key: 'breakfast', label: '早餐', emoji: '🌅' },
  { key: 'lunch', label: '午餐', emoji: '☀️' },
  { key: 'dinner', label: '晚餐', emoji: '🌙' },
  { key: 'snack', label: '加餐', emoji: '🍪' }
]

// 餐类标签映射
const MEAL_LABEL_MAP = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐'
}

Page({
  data: {
    statusBarHeight: 20,
    foodCategories: FOOD_CATEGORIES,
    foodDatabase: FOOD_DATABASE,
    activeCategory: 'hotpot',
    activeCategoryName: '火锅',
    activeCategoryIcon: '🍲',
    searchKeyword: '',
    filteredFoods: [],
    cartItems: [],
    cartTotalQty: 0,
    selectedMealType: 'lunch',
    diets: [],
    todayDiets: [],
    selectedDate: getToday(),
    mealTypes: MEAL_TYPES,
    showCart: false,
    showCheckout: false,
    checkoutMealType: 'lunch',
    currentPage: 'select',
    // 菜品 CRUD
    showFoodModal: false,
    foodModalTitle: '新增菜品',
    editingFoodId: null,
    categoryNames: FOOD_CATEGORIES.map(c => c.label),
    formCatIndex: 0,
    formName: '',
    formCat: '',
    // Toast
    showToast: false,
    toastMsg: ''
  },

  onLoad() {
    try {
      const sysInfo = wx.getSystemInfoSync()
      this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 })
    } catch (e) {}
    this.loadDiets()
    this.filterFoods()
  },

  onShow() {
    this.loadDiets()
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ active: 2 })
    }
  },

  // ========== 数据加载 ==========

  loadDiets() {
    const diets = storage.get('diets') || []
    const selectedDate = this.data.selectedDate
    const filteredDiets = diets
      .filter(d => d.date === selectedDate)
      .map(d => ({ ...d, mealLabel: MEAL_LABEL_MAP[d.mealType] || d.mealType }))
    this.setData({ diets, todayDiets: filteredDiets })
  },

  // ========== 页面切换 ==========

  switchPage(e) {
    const page = e.currentTarget.dataset.page
    this.setData({ currentPage: page })
  },

  // ========== 餐类切换 ==========

  switchMealType(e) {
    const mealType = e.currentTarget.dataset.meal
    this.setData({ selectedMealType: mealType })
  },

  // ========== 分类切换 ==========

  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    const cat = FOOD_CATEGORIES.find(c => c.key === category)
    this.setData({
      activeCategory: category,
      activeCategoryName: cat ? cat.label : category,
      activeCategoryIcon: cat ? cat.icon : '',
      searchKeyword: ''
    })
    this.filterFoods()
  },

  // ========== 搜索 ==========

  onSearchInput(e) {
    const searchKeyword = e.detail.value
    this.setData({ searchKeyword })
    this.filterFoods()
  },

  clearSearch() {
    this.setData({ searchKeyword: '' })
    this.filterFoods()
  },

  filterFoods() {
    const { activeCategory, foodDatabase, searchKeyword } = this.data
    let foods = foodDatabase[activeCategory] || []
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase()
      foods = foods.filter(f => f.name.toLowerCase().includes(kw) || (f.category && f.category.includes(kw)))
    }
    this.setData({ filteredFoods: foods })
  },

  // ========== 购物车操作 ==========

  addToCart(e) {
    const food = e.currentTarget.dataset.food
    const cartItems = [...this.data.cartItems]
    const existIdx = cartItems.findIndex(c => c.id === food.id)
    if (existIdx > -1) {
      cartItems[existIdx].quantity += 1
    } else {
      cartItems.push({ ...food, quantity: 1 })
    }
    this.setData({ cartItems })
    this.updateCartQty()
    this.showToast('已加入购物车')
  },

  removeFromCart(e) {
    const foodId = e.currentTarget.dataset.id
    let cartItems = [...this.data.cartItems]
    const idx = cartItems.findIndex(c => c.id === foodId)
    if (idx > -1) {
      if (cartItems[idx].quantity > 1) {
        cartItems[idx].quantity -= 1
      } else {
        cartItems.splice(idx, 1)
      }
    }
    this.setData({ cartItems })
    this.updateCartQty()
  },

  increaseCart(e) {
    const foodId = e.currentTarget.dataset.id
    const cartItems = [...this.data.cartItems]
    const idx = cartItems.findIndex(c => c.id === foodId)
    if (idx > -1) {
      cartItems[idx].quantity += 1
    }
    this.setData({ cartItems })
    this.updateCartQty()
  },

  updateCartQty() {
    const totalQty = this.data.cartItems.reduce((s, c) => s + c.quantity, 0)
    this.setData({ cartTotalQty: totalQty })
  },

  clearCart() {
    this.setData({ cartItems: [], cartTotalQty: 0 })
    this.showToast('购物车已清空')
  },

  toggleCart() {
    this.setData({ showCart: !this.data.showCart, showCheckout: false })
  },

  closeAllSheets() {
    this.setData({ showCart: false, showCheckout: false })
  },

  // ========== 结算流程 ==========

  openCheckout() {
    if (this.data.cartItems.length === 0) {
      this.showToast('购物车为空，请先选择菜品')
      return
    }
    this.setData({
      showCheckout: true,
      showCart: false,
      checkoutMealType: this.data.selectedMealType
    })
  },

  selectCheckoutMeal(e) {
    this.setData({ checkoutMealType: e.currentTarget.dataset.meal })
  },

  async submitOrder() {
    if (this.data.cartItems.length === 0) {
      this.showToast('购物车为空，请先选择菜品')
      return
    }

    const mealType = this.data.checkoutMealType
    const mealLabel = MEAL_LABEL_MAP[mealType] || mealType
    const totalQty = this.data.cartItems.reduce((s, c) => s + c.quantity, 0)

    let diets = storage.get('diets') || []

    this.data.cartItems.forEach(item => {
      const qty = item.quantity
      const newDiet = {
        id: generateId(),
        mealType: mealType,
        mealLabel: mealLabel,
        detail: `${item.name} x${qty}`,
        images: [],
        date: this.data.selectedDate,
        createTime: new Date().getTime()
      }
      diets.push(newDiet)
    })

    storage.set('diets', diets)
    this.setData({ cartItems: [], cartTotalQty: 0, showCheckout: false })
    this.loadDiets()
    this.showToast(`已添加到${mealLabel}，共 ${totalQty} 件`)
    setTimeout(() => {
      this.setData({ currentPage: 'record' })
    }, 600)
  },

  // ========== 饮食记录 ==========

  async deleteDiet(e) {
    const diet = e.currentTarget.dataset.diet
    const confirmed = await showConfirm('确定要删除这条饮食记录吗？')
    if (!confirmed) return
    let diets = storage.get('diets') || []
    diets = diets.filter(d => d.id !== diet.id)
    storage.set('diets', diets)
    this.showToast('删除成功')
    this.loadDiets()
  },

  changeDate(e) {
    this.setData({ selectedDate: e.detail.value })
    this.loadDiets()
  },

  // ========== 菜品 CRUD ==========

  openAddModal() {
    const catIdx = this.data.categoryNames.indexOf(this.data.activeCategoryName)
    this.setData({
      showFoodModal: true,
      foodModalTitle: '新增菜品',
      editingFoodId: null,
      formCatIndex: catIdx >= 0 ? catIdx : 0,
      formCat: this.data.activeCategoryName,
      formName: ''
    })
  },

  openEditModal(e) {
    const food = e.currentTarget.dataset.food
    const catIdx = this.data.categoryNames.indexOf(food.category || '')
    this.setData({
      showFoodModal: true,
      foodModalTitle: '编辑菜品',
      editingFoodId: food.id,
      formCatIndex: catIdx >= 0 ? catIdx : 0,
      formName: food.name || '',
      formCat: food.category || ''
    })
  },

  closeFoodModal() {
    this.setData({ showFoodModal: false, editingFoodId: null })
  },

  saveFood() {
    const name = (this.data.formName || '').trim()
    if (!name) {
      this.showToast('请输入菜品名称')
      return
    }

    const cat = (this.data.formCat || '').trim() || '其他'
    const foodDatabase = { ...this.data.foodDatabase }
    const activeCategory = this.data.activeCategory

    if (this.data.editingFoodId) {
      const foods = [...(foodDatabase[activeCategory] || [])]
      const idx = foods.findIndex(f => f.id === this.data.editingFoodId)
      if (idx > -1) {
        foods[idx] = { ...foods[idx], name, category: cat }
        foodDatabase[activeCategory] = foods
      }
      this.setData({ foodDatabase })
      this.filterFoods()
      this.showToast('菜品已更新')
    } else {
      const newFood = {
        id: 'custom_' + Date.now(),
        name,
        category: cat
      }
      const foods = [...(foodDatabase[activeCategory] || [])]
      foods.push(newFood)
      foodDatabase[activeCategory] = foods
      this.setData({ foodDatabase })
      this.filterFoods()
      this.showToast('菜品已添加')
    }

    this.closeFoodModal()
  },

  deleteFood(e) {
    const food = e.currentTarget.dataset.food
    const foodDatabase = { ...this.data.foodDatabase }
    const activeCategory = this.data.activeCategory
    const foods = [...(foodDatabase[activeCategory] || [])]
    const idx = foods.findIndex(f => f.id === food.id)
    if (idx > -1) {
      foods.splice(idx, 1)
      foodDatabase[activeCategory] = foods
      this.setData({ foodDatabase })
      this.filterFoods()
      this.showToast(food.name + ' 已删除')
    }
  },

  // ========== 表单输入处理 ==========

  onFormNameInput(e) { this.setData({ formName: e.detail.value }) },
  onFormCatChange(e) {
    const idx = e.detail.value
    this.setData({ formCatIndex: idx, formCat: this.data.categoryNames[idx] })
  },

  // ========== Toast ==========

  showToast(msg) {
    this.setData({ showToast: true, toastMsg: msg })
    if (this._toastTimer) clearTimeout(this._toastTimer)
    this._toastTimer = setTimeout(() => {
      this.setData({ showToast: false })
    }, 1800)
  },

  // ========== 工具方法 ==========

  onModalTap() {},
  preventMove() {}
})
