# Cake Admin - 运营管理后台

基于 cake-h5 项目的运营管理后台前端，使用 React 19 + Ant Design 6 构建。

## 技术栈

- **前端框架**: React 19 + TypeScript
- **UI 组件库**: Ant Design 6 (antd6)
- **构建工具**: Vite 6
- **状态管理**: Zustand
- **路由**: React Router 7
- **HTTP 客户端**: Axios
- **CSS 方案**: UnoCSS + Ant Design 主题定制

## 功能模块

### 已实现

- **数据看板**: 核心指标展示、品牌列表、热门商品
- **品牌管理**: 品牌 CRUD、搜索筛选、状态管理
- **商品管理**: 商品列表、详情编辑、多维度筛选
- **门店管理**: 门店列表（需后端支持）
- **用户管理**: 用户列表、详情查看（需后端支持）
- **百科管理**: 词条 CRUD、分类筛选（需后端支持）
- **标签管理**: 标签 CRUD、分组管理（需后端支持）
- **系统设置**: 基本设置、通知配置

### 待实现

- 完整的权限控制系统
- 数据统计图表
- 批量操作功能
- 导入导出功能

## 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

访问 http://localhost:3001

### 构建生产版本

```bash
npm run build
# 或
pnpm build
```

## 项目结构

```
cake-admin/
├── src/
│   ├── api/                    # API 接口层
│   ├── components/            # 通用组件
│   ├── hooks/                 # 自定义 Hooks
│   ├── pages/                 # 页面视图
│   ├── router/                # 路由配置
│   ├── stores/                # 状态管理
│   ├── styles/                # 全局样式
│   ├── types/                 # 类型定义
│   ├── utils/                 # 工具函数
│   ├── App.tsx                # 应用入口
│   └── main.tsx               # 主入口
├── public/                    # 静态资源
├── .env.development           # 开发环境变量
├── .env.production            # 生产环境变量
├── uno.config.ts              # UnoCSS 配置
├── vite.config.ts             # Vite 配置
└── package.json               # 项目配置
```

## API 接口

后台接口基于 cake-h5 已有接口，部分接口需要后端新增支持：

### 已有接口

- `GET /api/brands` - 品牌列表
- `GET /api/brands/schedule` - 放号日程
- `GET /api/products` - 商品列表
- `GET /api/products/[id]` - 商品详情

### 需要新增的接口

详见 `src/api/` 目录下的接口定义文件。

## 默认账号

- 用户名: `admin`
- 密码: `admin123`

## 开发说明

1. 项目使用 UnoCSS 作为原子化 CSS 方案
2. 状态管理使用 Zustand，支持持久化
3. 请求拦截器已配置统一的错误处理
4. 路由配置支持嵌套布局

## 注意事项

1. 部分功能需要后端接口支持才能正常使用
2. 开发服务器默认端口为 3001，API 代理到 3000
3. 请确保 cake-h5 后端服务已启动
