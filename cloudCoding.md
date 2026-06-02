# 云开发适配开发计划书

## 一、项目概述

将现有基于 `wx.Storage` 的本地存储方案改造为微信云开发模式，利用云数据库和云函数实现数据云端存储、多端同步和离线缓存。

---

## 二、现状分析

### 2.1 已完成的准备工作

| 序号 | 项目 | 状态 |
|------|------|------|
| 1 | 云开发环境开通 | ✅ |
| 2 | 7个数据库集合创建 | ✅ |
| 3 | 集合权限和索引配置 | ✅ |
| 4 | 项目配置（project.config.json、app.json、app.js） | ✅ |
| 5 | 10个云函数代码 | ✅ |
| 6 | 6个服务层代码 | ✅ |
| 7 | 隐私保护（config.js + .gitignore） | ✅ |

### 2.2 需要改造的页面

| 页面 | 文件 | 使用的存储 | 改造复杂度 |
|------|------|------------|------------|
| 账单页 | `pages/bill/bill.js` | `storage.get/set('bills')` | ⭐⭐⭐ 高 |
| 统计页 | `pages/stat/stat.js` | `storage.get('bills')` | ⭐⭐ 中 |
| 日程页 | `pages/schedule/schedule.js` | `storage.get/set('schedules')` | ⭐⭐⭐ 高 |
| 饮食页 | `pages/diet/diet.js` | `storage.get/set('diets')` | ⭐⭐ 中 |
| 快捷餐页 | `pages/diet/quickmeal.js` | `storage.get/set('quickMeals')` | ⭐ 低 |
| 笔记列表页 | `pages/note/note.js` | `storage.get/set('notes')` | ⭐⭐ 中 |
| 笔记详情页 | `pages/note/detail.js` | `storage.get('notes')` | ⭐ 低 |

---

## 三、改造策略

### 3.1 核心原则

1. **保持UI和样式不变** - 只修改数据层逻辑
2. **渐进式改造** - 逐个模块改造，每完成一个模块即测试
3. **离线优先** - 云端失败时自动降级到本地缓存
4. **API兼容** - 服务层接口尽量保持与原有 storage 一致

### 3.2 数据流设计

```
页面操作
   ↓
服务层（billService / scheduleService / dietService / noteService）
   ↓
云函数调用（wx.cloud.callFunction）
   ↓
云数据库（增删改查）
   ↓
返回数据 → 更新页面
   ↓
本地缓存更新（storage.set(`${key}_cache`, data)）
```

### 3.3 离线降级策略

```javascript
// 读取数据：优先云端，失败时降级本地
async loadData() {
  try {
    const data = await billService.getBills()
    this.setData({ bills: data })
  } catch (err) {
    const cache = storage.get('bills_cache') || []
    this.setData({ bills: cache })
    showToast('网络异常，显示本地缓存数据', 'none')
  }
}

// 保存数据：优先云端，失败时保存到本地
async saveData(data) {
  try {
    await billService.saveBill(data)
    showToast('保存成功')
  } catch (err) {
    const cache = storage.get('bills_cache') || []
    cache.unshift(data)
    storage.set('bills_cache', cache)
    showToast('网络异常，已保存到本地')
  }
}
```

---

## 四、详细改造计划

### 阶段一：账单模块改造（核心模块）

#### 4.1.1 改造文件
- `miniprogram/pages/bill/bill.js`

#### 4.1.2 改造点

| 改造点 | 原代码 | 新代码 |
|--------|--------|--------|
| 引入服务 | `require('../../utils/storage')` | `require('../../services/billService')` |
| 加载数据 | `storage.get('bills')` | `await billService.getBills({ skip: 0, limit: 200 })` |
| 保存账单 | `storage.set('bills', bills)` | `await billService.saveBill(billData, billId)` |
| 删除账单 | `storage.set('bills', bills)` | `await billService.deleteBill(billId)` |
| 批量删除 | `storage.set('bills', bills)` | `await billService.batchDelete(billIds)` |

#### 4.1.3 数据格式变化

```javascript
// 改造前（本地数组操作）
let bills = storage.get('bills') || []
bills.push(newBill)
storage.set('bills', bills)

// 改造后（云函数调用）
const newBill = {
  type: form.type,
  tag: form.tag,
  amount: Number(form.amount),
  note: form.note,
  date: form.date
}
await billService.saveBill(newBill)
```

#### 4.1.4 注意事项
- 云数据库返回的 `_id` 替代原有的 `id` 字段
- 需要在保存时处理 `_id` 和 `id` 的映射
- 分页查询替代全量加载

---

### 阶段二：日程模块改造

#### 4.2.1 改造文件
- `miniprogram/pages/schedule/schedule.js`

#### 4.2.2 改造点

| 改造点 | 原代码 | 新代码 |
|--------|--------|--------|
| 引入服务 | `require('../../utils/storage')` | `require('../../services/scheduleService')` |
| 加载数据 | `storage.get('schedules')` | `await scheduleService.getSchedules({ date: selectedDate })` |
| 保存日程 | `storage.set('schedules', schedules)` | `await scheduleService.saveSchedule(scheduleData, scheduleId)` |
| 切换完成状态 | `storage.set('schedules', schedules)` | `await scheduleService.saveSchedule({ completed: !completed }, scheduleId)` |

#### 4.2.3 注意事项
- 日历视图需要按日期查询，利用云数据库索引
- 完成状态切换使用部分更新

---

### 阶段三：饮食模块改造

#### 4.3.1 改造文件
- `miniprogram/pages/diet/diet.js`
- `miniprogram/pages/diet/quickmeal.js`

#### 4.3.2 改造点

| 改造点 | 原代码 | 新代码 |
|--------|--------|--------|
| 引入服务 | `require('../../utils/storage')` | `require('../../services/dietService')` |
| 加载数据 | `storage.get('diets')` | `await dietService.getDiets({ date: getToday() })` |
| 保存记录 | `storage.set('diets', diets)` | `await dietService.saveDiet(dietData, dietId)` |
| 删除记录 | `storage.set('diets', diets)` | `await dietService.deleteDiet(dietId)` |

#### 4.3.3 注意事项
- 饮食模板（FOOD_DATABASE）保持为常量，不存入数据库
- 快捷餐食（quickMeals）可考虑存入云数据库或保持本地

---

### 阶段四：笔记模块改造

#### 4.4.1 改造文件
- `miniprogram/pages/note/note.js`
- `miniprogram/pages/note/detail.js`

#### 4.4.2 改造点

| 改造点 | 原代码 | 新代码 |
|--------|--------|--------|
| 引入服务 | `require('../../utils/storage')` | `require('../../services/noteService')` |
| 加载数据 | `storage.get('notes')` | `await noteService.getNotes()` |
| 保存笔记 | `storage.set('notes', notes)` | `await noteService.saveNote(noteData, noteId)` |
| 删除笔记 | `storage.set('notes', notes)` | `await noteService.deleteNote(noteId)` |

#### 4.4.3 注意事项
- 富文本内容（Delta格式）直接存储到云数据库
- 草稿保存保持本地 storage（draftKey）
- 图片上传使用 `uploadImage` 云函数

---

### 阶段五：统计页改造

#### 4.5.1 改造文件
- `miniprogram/pages/stat/stat.js`

#### 4.5.2 改造点

| 改造点 | 原代码 | 新代码 |
|--------|--------|--------|
| 引入服务 | `require('../../utils/storage')` | `require('../../services/billService')` |
| 加载数据 | `storage.get('bills')` | `await billService.getBills({ dateStart, dateEnd })` |

#### 4.5.3 注意事项
- 统计页只读取账单数据，不涉及写入
- 利用云数据库的日期范围查询替代本地过滤

---

## 五、实施步骤

### 第1步：账单模块改造
- [ ] 修改 `bill.js` 引入 `billService`
- [ ] 改造 `loadBills()` 方法
- [ ] 改造 `saveBill()` 方法
- [ ] 改造 `deleteBill()` 方法
- [ ] 改造 `batchDelete()` 方法
- [ ] 添加加载状态和错误处理
- [ ] 测试验证

### 第2步：统计页改造
- [ ] 修改 `stat.js` 引入 `billService`
- [ ] 改造数据加载方法
- [ ] 测试验证

### 第3步：日程模块改造
- [ ] 修改 `schedule.js` 引入 `scheduleService`
- [ ] 改造 `loadSchedules()` 方法
- [ ] 改造 `saveSchedule()` 方法
- [ ] 改造 `toggleComplete()` 方法
- [ ] 添加加载状态和错误处理
- [ ] 测试验证

### 第4步：饮食模块改造
- [ ] 修改 `diet.js` 引入 `dietService`
- [ ] 改造数据加载和保存方法
- [ ] 修改 `quickmeal.js` 引入 `dietService`
- [ ] 测试验证

### 第5步：笔记模块改造
- [ ] 修改 `note.js` 引入 `noteService`
- [ ] 改造数据加载和保存方法
- [ ] 修改 `detail.js` 引入 `noteService`
- [ ] 测试验证

### 第6步：全局优化
- [ ] 添加全局加载状态组件
- [ ] 添加网络状态检测
- [ ] 优化离线缓存策略
- [ ] 添加数据同步提示

---

## 六、数据迁移方案

### 6.1 迁移策略

采用**渐进式迁移**，用户首次使用云开发版本时自动迁移本地数据：

```javascript
// app.js 中添加迁移逻辑
async migrateLocalData() {
  const migrated = wx.getStorageSync('cloud_migrated')
  if (migrated) return

  try {
    const localBills = storage.get('bills') || []
    const localSchedules = storage.get('schedules') || []
    const localDiets = storage.get('diets') || []
    const localNotes = storage.get('notes') || []

    // 批量上传到云端
    for (const bill of localBills) {
      await billService.saveBill(bill)
    }
    // ... 其他数据同理

    wx.setStorageSync('cloud_migrated', true)
    showToast('数据迁移完成')
  } catch (err) {
    console.error('数据迁移失败:', err)
  }
}
```

### 6.2 迁移检查清单

- [ ] 迁移前备份本地数据
- [ ] 逐条上传到云数据库
- [ ] 验证云端数据完整性
- [ ] 标记迁移完成状态
- [ ] 提供迁移失败回滚机制

---

## 七、测试计划

### 7.1 功能测试

| 测试项 | 测试内容 | 预期结果 |
|--------|----------|----------|
| 账单CRUD | 新增、编辑、删除、批量删除 | 数据正确同步到云端 |
| 日程CRUD | 新增、编辑、删除、完成切换 | 数据正确同步到云端 |
| 饮食CRUD | 新增、编辑、删除 | 数据正确同步到云端 |
| 笔记CRUD | 新增、编辑、删除 | 数据正确同步到云端 |
| 统计查询 | 月度/年度统计 | 数据准确 |

### 7.2 异常测试

| 测试项 | 测试内容 | 预期结果 |
|--------|----------|----------|
| 断网操作 | 关闭网络后操作 | 数据保存到本地缓存 |
| 弱网操作 | 模拟慢速网络 | 显示加载状态，不卡顿 |
| 重复操作 | 快速连续点击保存 | 不产生重复数据 |
| 数据冲突 | 多设备同时修改 | 以最新时间为准 |

### 7.3 性能测试

| 测试项 | 测试内容 | 预期结果 |
|--------|----------|----------|
| 大量数据 | 1000+条账单 | 加载时间 < 2秒 |
| 分页加载 | 每次加载50条 | 流畅无卡顿 |
| 缓存命中 | 断网后打开 | 立即显示缓存数据 |

---

## 八、注意事项

### 8.1 字段映射

| 本地字段 | 云数据库字段 | 说明 |
|----------|--------------|------|
| `id` | `_id` | 云数据库自动生成 |
| - | `_openid` | 自动关联用户 |

### 8.2 不修改的内容

- 所有 `.wxml` 文件（页面结构）
- 所有 `.wxss` 文件（页面样式）
- `utils/storage.js`（保留作为离线缓存）
- `utils/common.js`（工具函数）
- `utils/time.js`（时间工具）
- 饮食模板数据（FOOD_DATABASE）

### 8.3 风险提示

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| 云函数冷启动 | 首次请求慢 | 保持云函数活跃 |
| 网络不稳定 | 操作失败 | 离线缓存降级 |
| 数据迁移失败 | 数据丢失 | 迁移前备份 |
| 云开发额度限制 | 超出后付费 | 监控用量 |

---

## 九、时间估算

| 阶段 | 预估时间 |
|------|----------|
| 账单模块改造 | 2-3小时 |
| 统计页改造 | 1小时 |
| 日程模块改造 | 2-3小时 |
| 饮食模块改造 | 1-2小时 |
| 笔记模块改造 | 1-2小时 |
| 数据迁移方案 | 1-2小时 |
| 测试与优化 | 2-3小时 |
| **总计** | **10-14小时** |

---

## 十、后续优化方向

| 方向 | 说明 | 优先级 |
|------|------|--------|
| 用户登录 | 微信授权登录，绑定用户信息 | P2 |
| 数据导出 | 导出Excel/PDF | P3 |
| 消息推送 | 日程提醒、账单提醒 | P3 |
| 多端同步 | 支持H5/APP访问 | P3 |
| 数据分析 | 更丰富的统计图表 | P3 |
