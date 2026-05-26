# backend 目录说明

此目录用于存放后端相关代码（如 API 服务、数据库配置等）。

当前项目为纯前端本地存储方案，暂无后端代码。
后续如需开发后端服务，可在此目录下创建。

## 推荐结构
```
backend/
├── src/
│   ├── controllers/  # 控制器
│   ├── models/       # 数据模型
│   ├── routes/       # 路由配置
│   ├── middleware/   # 中间件
│   ├── utils/        # 工具函数
│   └── app.js        # 入口文件
├── config/           # 配置文件
├── package.json
└── README.md
```
