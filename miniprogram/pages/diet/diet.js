const storage = require('../../utils/storage')
const { getToday } = require('../../utils/time')
const { showToast, showConfirm, generateId } = require('../../utils/common')

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
  hotpot: [
    { id: 'hp1', name: '牛油锅底', category: '锅底', calories: 800, protein: 12, fat: 72, carbs: 20, portion: '1份', price: 38 },
    { id: 'hp2', name: '清汤锅底', category: '锅底', calories: 120, protein: 8, fat: 4, carbs: 12, portion: '1份', price: 28 },
    { id: 'hp3', name: '番茄锅底', category: '锅底', calories: 200, protein: 6, fat: 2, carbs: 38, portion: '1份', price: 32 },
    { id: 'hp4', name: '麻辣锅底', category: '锅底', calories: 650, protein: 10, fat: 58, carbs: 18, portion: '1份', price: 35 },
    { id: 'hp5', name: '肥牛卷', category: '肉类', calories: 350, protein: 28, fat: 26, carbs: 0, portion: '200g', price: 48 },
    { id: 'hp6', name: '羊肉卷', category: '肉类', calories: 320, protein: 26, fat: 24, carbs: 0, portion: '200g', price: 45 },
    { id: 'hp7', name: '毛肚', category: '荤菜', calories: 72, protein: 14, fat: 0.5, carbs: 3, portion: '150g', price: 32 },
    { id: 'hp8', name: '鸭肠', category: '荤菜', calories: 85, protein: 16, fat: 2, carbs: 0, portion: '150g', price: 28 },
    { id: 'hp9', name: '虾滑', category: '海鲜', calories: 120, protein: 22, fat: 2, carbs: 4, portion: '200g', price: 38 },
    { id: 'hp10', name: '鱼片', category: '海鲜', calories: 100, protein: 20, fat: 1.5, carbs: 0, portion: '200g', price: 35 },
    { id: 'hp11', name: '豆腐', category: '素菜', calories: 80, protein: 8, fat: 4, carbs: 2, portion: '200g', price: 12 },
    { id: 'hp12', name: '金针菇', category: '素菜', calories: 26, protein: 2.6, fat: 0.1, carbs: 4.5, portion: '200g', price: 10 },
    { id: 'hp13', name: '生菜', category: '素菜', calories: 15, protein: 1.3, fat: 0.3, carbs: 2.3, portion: '250g', price: 8 },
    { id: 'hp14', name: '土豆片', category: '素菜', calories: 77, protein: 2, fat: 0.1, carbs: 17, portion: '200g', price: 10 },
    { id: 'hp15', name: '宽粉', category: '主食', calories: 340, protein: 0.4, fat: 0.1, carbs: 84, portion: '200g', price: 12 },
    { id: 'hp16', name: '手打牛肉丸', category: '丸类', calories: 250, protein: 20, fat: 18, carbs: 4, portion: '150g', price: 28 }
  ],
  bbq: [
    { id: 'bbq1', name: '五花肉', category: '肉类', calories: 450, protein: 22, fat: 40, carbs: 0, portion: '200g', price: 42 },
    { id: 'bbq2', name: '牛肉串', category: '肉类', calories: 280, protein: 28, fat: 18, carbs: 2, portion: '200g', price: 38 },
    { id: 'bbq3', name: '羊肉串', category: '肉类', calories: 300, protein: 26, fat: 22, carbs: 0, portion: '200g', price: 35 },
    { id: 'bbq4', name: '鸡翅', category: '禽类', calories: 260, protein: 20, fat: 18, carbs: 2, portion: '200g', price: 28 },
    { id: 'bbq5', name: '烤鱿鱼', category: '海鲜', calories: 150, protein: 24, fat: 4, carbs: 2, portion: '200g', price: 32 },
    { id: 'bbq6', name: '烤茄子', category: '素菜', calories: 60, protein: 1.5, fat: 3, carbs: 8, portion: '1份', price: 12 },
    { id: 'bbq7', name: '烤玉米', category: '素菜', calories: 150, protein: 4, fat: 2, carbs: 30, portion: '1根', price: 10 },
    { id: 'bbq8', name: '烤韭菜', category: '素菜', calories: 36, protein: 2.2, fat: 0.4, carbs: 6, portion: '150g', price: 8 },
    { id: 'bbq9', name: '蒜蓉扇贝', category: '海鲜', calories: 120, protein: 18, fat: 3, carbs: 6, portion: '3只', price: 36 },
    { id: 'bbq10', name: '烤馒头片', category: '主食', calories: 250, protein: 6, fat: 8, carbs: 40, portion: '4片', price: 10 },
    { id: 'bbq11', name: '烤蘑菇', category: '素菜', calories: 30, protein: 3, fat: 0.5, carbs: 5, portion: '150g', price: 10 },
    { id: 'bbq12', name: '培根卷', category: '肉类', calories: 380, protein: 18, fat: 34, carbs: 2, portion: '150g', price: 32 }
  ],
  xiangcai: [
    { id: 'xc1', name: '剁椒鱼头', category: '招牌', calories: 280, protein: 32, fat: 14, carbs: 6, portion: '1份', price: 58 },
    { id: 'xc2', name: '辣椒炒肉', category: '热菜', calories: 350, protein: 24, fat: 26, carbs: 6, portion: '1份', price: 38 },
    { id: 'xc3', name: '农家小炒肉', category: '热菜', calories: 380, protein: 22, fat: 30, carbs: 4, portion: '1份', price: 35 },
    { id: 'xc4', name: '湘西外婆菜', category: '素菜', calories: 120, protein: 3, fat: 8, carbs: 10, portion: '1份', price: 18 },
    { id: 'xc5', name: '永州血鸭', category: '招牌', calories: 320, protein: 26, fat: 22, carbs: 4, portion: '1份', price: 48 },
    { id: 'xc6', name: '腊味合蒸', category: '招牌', calories: 400, protein: 28, fat: 32, carbs: 4, portion: '1份', price: 45 },
    { id: 'xc7', name: '酸辣鸡杂', category: '热菜', calories: 280, protein: 22, fat: 18, carbs: 6, portion: '1份', price: 32 },
    { id: 'xc8', name: '臭豆腐', category: '小吃', calories: 180, protein: 8, fat: 12, carbs: 12, portion: '6块', price: 15 },
    { id: 'xc9', name: '粉蒸肉', category: '热菜', calories: 420, protein: 24, fat: 30, carbs: 16, portion: '1份', price: 38 },
    { id: 'xc10', name: '擂辣椒皮蛋', category: '凉菜', calories: 100, protein: 6, fat: 7, carbs: 6, portion: '1份', price: 16 },
    { id: 'xc11', name: '湘味红烧肉', category: '招牌', calories: 480, protein: 20, fat: 42, carbs: 8, portion: '1份', price: 42 },
    { id: 'xc12', name: '米饭', category: '主食', calories: 116, protein: 2.5, fat: 0.3, carbs: 25, portion: '1碗', price: 3 }
  ],
  sichuan: [
    { id: 'sc1', name: '麻婆豆腐', category: '热菜', calories: 180, protein: 10, fat: 12, carbs: 8, portion: '1份', price: 22 },
    { id: 'sc2', name: '水煮鱼', category: '招牌', calories: 320, protein: 30, fat: 20, carbs: 6, portion: '1份', price: 52 },
    { id: 'sc3', name: '回锅肉', category: '热菜', calories: 400, protein: 22, fat: 34, carbs: 6, portion: '1份', price: 35 },
    { id: 'sc4', name: '宫保鸡丁', category: '热菜', calories: 300, protein: 24, fat: 18, carbs: 10, portion: '1份', price: 32 },
    { id: 'sc5', name: '夫妻肺片', category: '凉菜', calories: 160, protein: 16, fat: 10, carbs: 4, portion: '1份', price: 28 },
    { id: 'sc6', name: '担担面', category: '主食', calories: 380, protein: 10, fat: 16, carbs: 50, portion: '1碗', price: 15 },
    { id: 'sc7', name: '辣子鸡', category: '招牌', calories: 350, protein: 28, fat: 22, carbs: 8, portion: '1份', price: 38 },
    { id: 'sc8', name: '蒜泥白肉', category: '凉菜', calories: 280, protein: 20, fat: 22, carbs: 4, portion: '1份', price: 26 },
    { id: 'sc9', name: '川北凉粉', category: '小吃', calories: 140, protein: 3, fat: 6, carbs: 18, portion: '1份', price: 12 },
    { id: 'sc10', name: '蛋炒饭', category: '主食', calories: 350, protein: 10, fat: 14, carbs: 46, portion: '1份', price: 12 },
    { id: 'sc11', name: '酸菜鱼', category: '招牌', calories: 260, protein: 28, fat: 14, carbs: 6, portion: '1份', price: 45 },
    { id: 'sc12', name: '红糖糍粑', category: '甜品', calories: 220, protein: 3, fat: 8, carbs: 36, portion: '4块', price: 16 }
  ],
  guangdong: [
    { id: 'gd1', name: '白切鸡', category: '招牌', calories: 260, protein: 24, fat: 16, carbs: 0, portion: '1份', price: 38 },
    { id: 'gd2', name: '烧鹅', category: '招牌', calories: 350, protein: 22, fat: 28, carbs: 2, portion: '1份', price: 45 },
    { id: 'gd3', name: '虾饺', category: '点心', calories: 180, protein: 14, fat: 8, carbs: 16, portion: '4只', price: 22 },
    { id: 'gd4', name: '肠粉', category: '点心', calories: 150, protein: 6, fat: 4, carbs: 24, portion: '1份', price: 12 },
    { id: 'gd5', name: '叉烧', category: '烧味', calories: 320, protein: 24, fat: 18, carbs: 14, portion: '1份', price: 35 },
    { id: 'gd6', name: '煲仔饭', category: '主食', calories: 420, protein: 18, fat: 16, carbs: 52, portion: '1份', price: 28 },
    { id: 'gd7', name: '老火靓汤', category: '汤品', calories: 80, protein: 8, fat: 4, carbs: 4, portion: '1盅', price: 25 },
    { id: 'gd8', name: '豉汁蒸排骨', category: '点心', calories: 220, protein: 18, fat: 14, carbs: 6, portion: '1份', price: 20 },
    { id: 'gd9', name: '干炒牛河', category: '主食', calories: 380, protein: 14, fat: 14, carbs: 50, portion: '1份', price: 18 },
    { id: 'gd10', name: '蜜汁叉烧饭', category: '主食', calories: 450, protein: 22, fat: 16, carbs: 54, portion: '1份', price: 25 },
    { id: 'gd11', name: '菠萝包', category: '点心', calories: 260, protein: 5, fat: 10, carbs: 38, portion: '1个', price: 8 },
    { id: 'gd12', name: '杨枝甘露', category: '甜品', calories: 180, protein: 2, fat: 6, carbs: 30, portion: '1杯', price: 18 }
  ],
  jiangsu: [
    { id: 'js1', name: '松鼠鳜鱼', category: '招牌', calories: 320, protein: 28, fat: 16, carbs: 18, portion: '1份', price: 68 },
    { id: 'js2', name: '红烧狮子头', category: '招牌', calories: 380, protein: 22, fat: 28, carbs: 12, portion: '2个', price: 38 },
    { id: 'js3', name: '盐水鸭', category: '招牌', calories: 240, protein: 22, fat: 14, carbs: 0, portion: '1份', price: 35 },
    { id: 'js4', name: '清炒虾仁', category: '热菜', calories: 160, protein: 22, fat: 6, carbs: 4, portion: '1份', price: 38 },
    { id: 'js5', name: '糖醋排骨', category: '热菜', calories: 350, protein: 20, fat: 20, carbs: 20, portion: '1份', price: 32 },
    { id: 'js6', name: '大煮干丝', category: '热菜', calories: 120, protein: 12, fat: 4, carbs: 8, portion: '1份', price: 22 },
    { id: 'js7', name: '蟹粉豆腐', category: '热菜', calories: 200, protein: 16, fat: 12, carbs: 6, portion: '1份', price: 35 },
    { id: 'js8', name: '扬州炒饭', category: '主食', calories: 400, protein: 14, fat: 14, carbs: 54, portion: '1份', price: 18 },
    { id: 'js9', name: '阳春面', category: '主食', calories: 220, protein: 7, fat: 4, carbs: 40, portion: '1碗', price: 10 },
    { id: 'js10', name: '桂花糖藕', category: '甜品', calories: 180, protein: 2, fat: 0.5, carbs: 42, portion: '1份', price: 15 },
    { id: 'js11', name: '南京烤鸭', category: '招牌', calories: 300, protein: 24, fat: 20, carbs: 4, portion: '1份', price: 32 },
    { id: 'js12', name: '鸡汤小馄饨', category: '主食', calories: 200, protein: 12, fat: 8, carbs: 22, portion: '1碗', price: 15 }
  ],
  western: [
    { id: 'w1', name: '牛排（西冷）', category: '主菜', calories: 420, protein: 38, fat: 28, carbs: 0, portion: '250g', price: 88 },
    { id: 'w2', name: '牛排（菲力）', category: '主菜', calories: 350, protein: 40, fat: 20, carbs: 0, portion: '200g', price: 108 },
    { id: 'w3', name: '意大利面', category: '主食', calories: 380, protein: 14, fat: 12, carbs: 54, portion: '1份', price: 38 },
    { id: 'w4', name: '凯撒沙拉', category: '凉菜', calories: 150, protein: 8, fat: 10, carbs: 8, portion: '1份', price: 28 },
    { id: 'w5', name: '奶油蘑菇汤', category: '汤品', calories: 200, protein: 6, fat: 14, carbs: 14, portion: '1碗', price: 22 },
    { id: 'w6', name: '披萨（玛格丽特）', category: '主食', calories: 520, protein: 20, fat: 22, carbs: 60, portion: '1个', price: 45 },
    { id: 'w7', name: '汉堡', category: '主食', calories: 450, protein: 26, fat: 24, carbs: 32, portion: '1个', price: 32 },
    { id: 'w8', name: '炸薯条', category: '小吃', calories: 320, protein: 4, fat: 16, carbs: 42, portion: '1份', price: 15 },
    { id: 'w9', name: '烤鸡', category: '主菜', calories: 380, protein: 32, fat: 24, carbs: 0, portion: '1只', price: 55 },
    { id: 'w10', name: '洋葱圈', category: '小吃', calories: 220, protein: 3, fat: 12, carbs: 26, portion: '1份', price: 18 },
    { id: 'w11', name: '提拉米苏', category: '甜品', calories: 280, protein: 5, fat: 16, carbs: 28, portion: '1份', price: 28 },
    { id: 'w12', name: '红酒炖牛肉', category: '主菜', calories: 400, protein: 30, fat: 24, carbs: 12, portion: '1份', price: 68 }
  ],
  japanese: [
    { id: 'jp1', name: '三文鱼刺身', category: '刺身', calories: 200, protein: 22, fat: 12, carbs: 0, portion: '150g', price: 48 },
    { id: 'jp2', name: '金枪鱼刺身', category: '刺身', calories: 150, protein: 28, fat: 3, carbs: 0, portion: '150g', price: 55 },
    { id: 'jp3', name: '寿司拼盘', category: '寿司', calories: 350, protein: 18, fat: 8, carbs: 52, portion: '8贯', price: 58 },
    { id: 'jp4', name: '拉面', category: '主食', calories: 450, protein: 20, fat: 18, carbs: 54, portion: '1碗', price: 35 },
    { id: 'jp5', name: '天妇罗', category: '炸物', calories: 320, protein: 12, fat: 18, carbs: 30, portion: '1份', price: 38 },
    { id: 'jp6', name: '鳗鱼饭', category: '主食', calories: 480, protein: 26, fat: 20, carbs: 52, portion: '1份', price: 45 },
    { id: 'jp7', name: '照烧鸡排饭', category: '主食', calories: 420, protein: 24, fat: 16, carbs: 46, portion: '1份', price: 32 },
    { id: 'jp8', name: '味噌汤', category: '汤品', calories: 40, protein: 3, fat: 1, carbs: 6, portion: '1碗', price: 8 },
    { id: 'jp9', name: '章鱼小丸子', category: '小吃', calories: 220, protein: 8, fat: 10, carbs: 26, portion: '6个', price: 18 },
    { id: 'jp10', name: '日式炸鸡', category: '炸物', calories: 280, protein: 18, fat: 18, carbs: 10, portion: '6块', price: 25 },
    { id: 'jp11', name: '抹茶冰淇淋', category: '甜品', calories: 160, protein: 3, fat: 8, carbs: 20, portion: '1球', price: 15 },
    { id: 'jp12', name: '玉子烧', category: '小吃', calories: 120, protein: 8, fat: 8, carbs: 4, portion: '1份', price: 12 }
  ],
  fastfood: [
    { id: 'ff1', name: '黄焖鸡米饭', category: '套餐', calories: 520, protein: 28, fat: 20, carbs: 56, portion: '1份', price: 22 },
    { id: 'ff2', name: '红烧牛肉面', category: '面食', calories: 450, protein: 22, fat: 16, carbs: 54, portion: '1碗', price: 20 },
    { id: 'ff3', name: '宫保鸡丁饭', category: '套餐', calories: 480, protein: 24, fat: 18, carbs: 52, portion: '1份', price: 18 },
    { id: 'ff4', name: '番茄炒蛋饭', category: '套餐', calories: 420, protein: 16, fat: 14, carbs: 54, portion: '1份', price: 15 },
    { id: 'ff5', name: '麻辣烫', category: '自选', calories: 380, protein: 18, fat: 16, carbs: 40, portion: '1份', price: 25 },
    { id: 'ff6', name: '盖浇饭', category: '套餐', calories: 450, protein: 20, fat: 16, carbs: 54, portion: '1份', price: 16 },
    { id: 'ff7', name: '炒饭', category: '主食', calories: 400, protein: 12, fat: 14, carbs: 54, portion: '1份', price: 12 },
    { id: 'ff8', name: '炒面', category: '主食', calories: 420, protein: 12, fat: 16, carbs: 56, portion: '1份', price: 12 },
    { id: 'ff9', name: '饺子', category: '面食', calories: 350, protein: 16, fat: 14, carbs: 40, portion: '15只', price: 15 },
    { id: 'ff10', name: '煎饼果子', category: '小吃', calories: 320, protein: 12, fat: 14, carbs: 38, portion: '1个', price: 8 },
    { id: 'ff11', name: '肉夹馍', category: '小吃', calories: 380, protein: 16, fat: 20, carbs: 34, portion: '1个', price: 10 },
    { id: 'ff12', name: '兰州拉面', category: '面食', calories: 380, protein: 18, fat: 12, carbs: 48, portion: '1碗', price: 14 }
  ],
  dessert: [
    { id: 'ds1', name: '提拉米苏', category: '蛋糕', calories: 280, protein: 5, fat: 16, carbs: 28, portion: '1份', price: 28 },
    { id: 'ds2', name: '草莓蛋糕', category: '蛋糕', calories: 320, protein: 5, fat: 14, carbs: 42, portion: '1份', price: 25 },
    { id: 'ds3', name: '巧克力慕斯', category: '慕斯', calories: 260, protein: 4, fat: 16, carbs: 26, portion: '1份', price: 22 },
    { id: 'ds4', name: '芒果布丁', category: '布丁', calories: 150, protein: 3, fat: 4, carbs: 26, portion: '1份', price: 15 },
    { id: 'ds5', name: '冰淇淋（三球）', category: '冰淇淋', calories: 240, protein: 4, fat: 12, carbs: 28, portion: '3球', price: 20 },
    { id: 'ds6', name: '蛋挞', category: '烘焙', calories: 180, protein: 4, fat: 10, carbs: 18, portion: '2个', price: 12 },
    { id: 'ds7', name: '马卡龙', category: '法式', calories: 120, protein: 2, fat: 6, carbs: 14, portion: '1个', price: 15 },
    { id: 'ds8', name: '红豆双皮奶', category: '甜品', calories: 160, protein: 5, fat: 6, carbs: 22, portion: '1份', price: 15 },
    { id: 'ds9', name: '杨枝甘露', category: '港式', calories: 180, protein: 2, fat: 6, carbs: 30, portion: '1杯', price: 18 },
    { id: 'ds10', name: '芋圆烧仙草', category: '台式', calories: 220, protein: 3, fat: 4, carbs: 44, portion: '1杯', price: 16 },
    { id: 'ds11', name: '班戟', category: '港式', calories: 200, protein: 4, fat: 8, carbs: 26, portion: '2个', price: 18 },
    { id: 'ds12', name: '舒芙蕾', category: '法式', calories: 240, protein: 5, fat: 10, carbs: 32, portion: '1份', price: 25 }
  ],
  drink: [
    { id: 'dr1', name: '珍珠奶茶', category: '奶茶', calories: 280, protein: 2, fat: 8, carbs: 50, portion: '1杯', price: 15 },
    { id: 'dr2', name: '鲜榨橙汁', category: '果汁', calories: 110, protein: 1.5, fat: 0.3, carbs: 24, portion: '1杯', price: 18 },
    { id: 'dr3', name: '冰美式', category: '咖啡', calories: 10, protein: 0.2, fat: 0, carbs: 2, portion: '1杯', price: 18 },
    { id: 'dr4', name: '拿铁', category: '咖啡', calories: 150, protein: 6, fat: 6, carbs: 16, portion: '1杯', price: 22 },
    { id: 'dr5', name: '柠檬水', category: '饮品', calories: 60, protein: 0.3, fat: 0, carbs: 14, portion: '1杯', price: 8 },
    { id: 'dr6', name: '芒果冰沙', category: '冰沙', calories: 200, protein: 1, fat: 0.5, carbs: 48, portion: '1杯', price: 16 },
    { id: 'dr7', name: '西瓜汁', category: '果汁', calories: 80, protein: 1, fat: 0.2, carbs: 18, portion: '1杯', price: 12 },
    { id: 'dr8', name: '椰汁', category: '饮品', calories: 100, protein: 1, fat: 0.5, carbs: 22, portion: '1杯', price: 10 },
    { id: 'dr9', name: '果茶', category: '茶饮', calories: 120, protein: 0.5, fat: 0, carbs: 28, portion: '1杯', price: 14 },
    { id: 'dr10', name: '豆浆', category: '饮品', calories: 80, protein: 6, fat: 4, carbs: 6, portion: '1杯', price: 6 },
    { id: 'dr11', name: '酸奶', category: '乳制品', calories: 120, protein: 4, fat: 3, carbs: 18, portion: '1杯', price: 10 },
    { id: 'dr12', name: '气泡水', category: '饮品', calories: 0, protein: 0, fat: 0, carbs: 0, portion: '1杯', price: 8 }
  ],
  snack: [
    { id: 'sn1', name: '烤冷面', category: '街头', calories: 280, protein: 8, fat: 12, carbs: 36, portion: '1份', price: 10 },
    { id: 'sn2', name: '臭豆腐', category: '街头', calories: 180, protein: 8, fat: 12, carbs: 12, portion: '6块', price: 12 },
    { id: 'sn3', name: '炸串', category: '街头', calories: 320, protein: 14, fat: 22, carbs: 20, portion: '10串', price: 15 },
    { id: 'sn4', name: '煎饼果子', category: '街头', calories: 320, protein: 12, fat: 14, carbs: 38, portion: '1个', price: 8 },
    { id: 'sn5', name: '肉夹馍', category: '小吃', calories: 380, protein: 16, fat: 20, carbs: 34, portion: '1个', price: 10 },
    { id: 'sn6', name: '凉皮', category: '小吃', calories: 200, protein: 5, fat: 8, carbs: 30, portion: '1份', price: 10 },
    { id: 'sn7', name: '锅巴', category: '零食', calories: 220, protein: 4, fat: 10, carbs: 30, portion: '1包', price: 6 },
    { id: 'sn8', name: '辣条', category: '零食', calories: 300, protein: 6, fat: 18, carbs: 32, portion: '1包', price: 3 },
    { id: 'sn9', name: '糖葫芦', category: '街头', calories: 180, protein: 1, fat: 0.5, carbs: 42, portion: '1串', price: 8 },
    { id: 'sn10', name: '花甲粉', category: '街头', calories: 160, protein: 12, fat: 4, carbs: 22, portion: '1份', price: 15 },
    { id: 'sn11', name: '锅贴', category: '小吃', calories: 260, protein: 12, fat: 12, carbs: 28, portion: '8个', price: 12 },
    { id: 'sn12', name: '春卷', category: '小吃', calories: 200, protein: 5, fat: 10, carbs: 24, portion: '4个', price: 10 }
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
    foodCategories: FOOD_CATEGORIES,
    foodDatabase: FOOD_DATABASE,
    activeCategory: 'hotpot',
    searchKeyword: '',
    filteredFoods: [],
    cartItems: [],
    selectedMealType: 'lunch',
    diets: [],
    todayDiets: [],
    selectedDate: getToday(),
    mealTypes: MEAL_TYPES,
    showCart: false,
    showFoodDetail: false,
    selectedFood: null,
    foodPortion: 1,
    totalCalories: 0,
    totalProtein: 0,
    totalFat: 0,
    totalCarbs: 0
  },

  onLoad() {
    this.loadDiets()
    this.filterFoods()
  },

  onShow() {
    this.loadDiets()
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ active: 3 })
    }
  },

  loadDiets() {
    const diets = storage.get('diets') || []
    const todayDiets = diets.filter(d => d.date === getToday())
    this.setData({ diets, todayDiets })
    this.calcTodayNutrition()
  },

  calcTodayNutrition() {
    let totalCalories = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0
    this.data.todayDiets.forEach(d => {
      if (d.calories) totalCalories += d.calories
      if (d.protein) totalProtein += d.protein
      if (d.fat) totalFat += d.fat
      if (d.carbs) totalCarbs += d.carbs
    })
    this.setData({ totalCalories, totalProtein, totalFat, totalCarbs })
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ activeCategory: category, searchKeyword: '' })
    this.filterFoods()
  },

  onSearchInput(e) {
    const searchKeyword = e.detail.value
    this.setData({ searchKeyword })
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
    this.updateCartTotal()
    showToast('已加入购物车', 'success')
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
    this.updateCartTotal()
  },

  increaseCart(e) {
    const foodId = e.currentTarget.dataset.id
    const cartItems = [...this.data.cartItems]
    const idx = cartItems.findIndex(c => c.id === foodId)
    if (idx > -1) {
      cartItems[idx].quantity += 1
    }
    this.setData({ cartItems })
    this.updateCartTotal()
  },

  updateCartTotal() {
    let total = 0
    this.data.cartItems.forEach(c => {
      total += (c.price || 0) * c.quantity
    })
    this.setData({ cartTotal: total })
  },

  clearCart() {
    this.setData({ cartItems: [], cartTotal: 0 })
  },

  toggleCart() {
    this.setData({ showCart: !this.data.showCart })
  },

  viewFoodDetail(e) {
    const food = e.currentTarget.dataset.food
    this.setData({
      showFoodDetail: true,
      selectedFood: food,
      foodPortion: 1
    })
  },

  closeFoodDetail() {
    this.setData({ showFoodDetail: false, selectedFood: null, foodPortion: 1 })
  },

  changePortion(e) {
    const step = e.currentTarget.dataset.step
    let portion = this.data.foodPortion + step
    if (portion < 0.5) portion = 0.5
    if (portion > 5) portion = 5
    this.setData({ foodPortion: portion })
  },

  addToCartFromDetail() {
    const food = { ...this.data.selectedFood }
    const cartItems = [...this.data.cartItems]
    const existIdx = cartItems.findIndex(c => c.id === food.id)
    if (existIdx > -1) {
      cartItems[existIdx].quantity += this.data.foodPortion
    } else {
      cartItems.push({ ...food, quantity: this.data.foodPortion })
    }
    this.setData({ cartItems, showFoodDetail: false, selectedFood: null, foodPortion: 1 })
    this.updateCartTotal()
    showToast('已加入购物车', 'success')
  },

  switchMealType(e) {
    const mealType = e.currentTarget.dataset.meal
    this.setData({ selectedMealType: mealType })
  },

  async submitOrder() {
    if (this.data.cartItems.length === 0) {
      showToast('购物车为空，请先选择菜品')
      return
    }

    const confirmed = await showConfirm(`确认下单？共 ${this.data.cartItems.reduce((s, c) => s + c.quantity, 0)} 道菜，合计 ¥${this.data.cartTotal || 0}`)
    if (!confirmed) return

    let diets = storage.get('diets') || []
    let totalCalories = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0

    this.data.cartItems.forEach(item => {
      const qty = item.quantity
      const newDiet = {
        id: generateId(),
        mealType: this.data.selectedMealType,
        detail: `${item.name} x${qty} (${item.portion})`,
        images: [],
        date: this.data.selectedDate,
        calories: Math.round((item.calories || 0) * qty),
        protein: Math.round((item.protein || 0) * qty * 10) / 10,
        fat: Math.round((item.fat || 0) * qty * 10) / 10,
        carbs: Math.round((item.carbs || 0) * qty * 10) / 10,
        price: (item.price || 0) * qty,
        createTime: new Date().getTime()
      }
      diets.push(newDiet)
      totalCalories += newDiet.calories
      totalProtein += newDiet.protein
      totalFat += newDiet.fat
      totalCarbs += newDiet.carbs
    })

    storage.set('diets', diets)
    this.setData({ cartItems: [], cartTotal: 0, showCart: false })
    this.loadDiets()
    showToast(`下单成功！总热量 ${totalCalories}kcal`, 'success')
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

  changeDate(e) {
    this.setData({ selectedDate: e.detail.value })
  },

  onModalTap() {},
  preventMove() {}
})
