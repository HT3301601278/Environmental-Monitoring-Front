# 环境监测系统

## 项目简介

这是一个基于 Vue 3 + Element Plus 开发的环境监测系统前端项目。系统主要功能包括地图监控、实时数据展示和历史数据查询等功能,用于环境数据的可视化展示和监控。

## 技术栈

- Vue 3
- Vuex 4
- Vue Router 4
- Element Plus
- ECharts 5
- Axios
- Moment.js
- 百度地图 API

## 项目结构

```
src/
├── api/                    # API 接口封装
│   └── index.js           # axios 实例和拦截器配置
├── assets/                 # 静态资源
├── components/            # 公共组件
│   ├── charts/           # 图表组件
│   │   ├── GaugeChart.vue # 仪表盘组件
│   │   └── LineChart.vue  # 折线图组件
│   └── map/              # 地图组件
│       └── BaiduMap.vue   # 百度地图组件
├── router/                # 路由配置
│   └── index.js
├── store/                 # Vuex 状态管理
│   ├── index.js          # store 入口
│   └── modules/          # store 模块
│       └── sensor.js     # 传感器数据模块
├── utils/                 # 工具函数
│   └── mapUtils.js       # 地图相关工具函数
├── views/                 # 页面组件
│   ├── MapView.vue       # 地图监控页面
│   ├── RealTimeData.vue  # 实时数据页面
│   └── HistoryData.vue   # 历史数据页面
├── App.vue               # 根组件
└── main.js              # 入口文件
```

## 核心功能模块

### 1. 地图监控 (MapView.vue)

- 基于百度地图 API 实现
- 支持传感器位置展示
- 支持地图定位功能
- 点击传感器可查看详细信息

### 2. 实时数据 (RealTimeData.vue)

- 支持传感器选择
- 数据展示包括:
  - 实时仪表盘
  - 传感器基本信息
  - 实时趋势图
  - 历史记录表格
- 自动定时更新数据(5秒/次)

### 3. 历史数据 (HistoryData.vue)

- 支持按时间范围查询
- 支持传感器筛选
- 数据展示方式:
  - 趋势图表
  - 数据列表
- 支持分页查询
- 支持数据导出

## 组件说明

### 图表组件

1. GaugeChart.vue (仪表盘组件)

- 支持自定义数值范围
- 支持自定义标题
- 支持特殊数据类型(如风向)的显示
- 自适应容器大小

2. LineChart.vue (折线图组件)

- 支持时间序列数据展示
- 支持自动缩放
- 支持数据提示
- 支持特殊数据类型的显示转换

### 地图组件 (BaiduMap.vue)

- 支持地图初始化
- 支持标记点添加
- 支持信息窗口
- 支持定位功能

## 状态管理

项目使用 Vuex 进行状态管理,主要包含以下功能:

- 传感器列表管理
- 实时数据获取
- 历史数据查询
- 传感器状态更新

## API 封装

使用 axios 进行 API 请求封装:

- 统一的请求配置
- 请求/响应拦截器
- 错误处理
- 接口统一管理

## 开发指南

### 环境要求

- Node.js >= 14.0.0
- npm >= 6.14.0

### 项目设置

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run serve

# 构建生产版本
npm run build
```

### 开发注意事项

1. 组件开发

- 遵循 Vue 3 组合式 API 规范
- 保持组件的单一职责
- 注意性能优化

2. 数据处理

- 合理使用 computed 属性
- 注意数据验证和错误处理
- 大数据量场景注意性能优化

3. 样式开发

- 使用 scoped 样式隔离
- 遵循 Element Plus 设计规范
- 注意响应式布局

## 部署说明

1. 构建项目

```bash
npm run build
```

2. 部署配置

- 确保后端 API 地址配置正确
- 配置正确的百度地图 API 密钥
- 根据需要调整 axios 超时时间

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

[MIT License](LICENSE)