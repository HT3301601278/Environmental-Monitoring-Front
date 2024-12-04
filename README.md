# 环境监测系统前端项目

## 项目简介

这是一个基于 Vue 3 + Element Plus 开发的环境监测系统前端项目。该系统主要用于实时监控和展示各类环境传感器数据,包括温度、湿度、光照、风速、风向等环境参数。

## 技术栈

- Vue 3 - 前端框架
- Vuex 4 - 状态管理
- Vue Router 4 - 路由管理  
- Element Plus - UI组件库
- ECharts - 图表可视化
- Axios - HTTP请求
- Moment.js - 时间处理
- 百度地图 JavaScript API - 地图功能

## 项目结构

```
src/
├── api/                    # API 接口封装
│   └── index.js           # axios实例和拦截器配置
├── assets/                 # 静态资源
├── components/            # 公共组件
│   ├── charts/           # 图表组件
│   │   ├── GaugeChart.vue # 仪表盘组件
│   │   └── LineChart.vue  # 折线图组件
│   └── map/              # 地图组件
│       └── BaiduMap.vue   # 百度地图组件
├── router/                # 路由配置
│   └── index.js          # 路由定义
├── store/                 # Vuex状态管理
│   ├── index.js          # store入口
│   └── modules/          # store模块
│       └── sensor.js     # 传感器相关状态管理
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

### 1. 地图监控模块 (MapView.vue)
- 基于百度地图展示传感器分布
- 支持传感器位置实时定位
- 支持添加、删除、移动传感器
- 支持查看传感器详细信息

### 2. 实时数据模块 (RealTimeData.vue)
- 支持选择不同传感器查看数据
- 多种数据可视化方式:
  - 仪表盘实时展示
  - 折线图趋势展示
  - 表格数据展示
- 支持不同类型传感器的数据格式化:
  - 温度 (℃)
  - 湿度 (%)
  - 光强 (lux)
  - 风速 (m/s)
  - 风向 (八方位)

### 3. 历史数据模块 (HistoryData.vue)
- 支持按时间范围查询历史数据
- 支持数据趋势图展示
- 支持历史数据表格展示和导出

## 组件设计

### 1. 图表组件 (charts/)

#### GaugeChart.vue (仪表盘组件)
- 属性配置:
  - value: 当前值
  - title: 标题
  - min/max: 量程范围
  - height/width: 尺寸
- 特性:
  - 支持自定义刻度标签
  - 支持风向特殊显示
  - 响应式调整

#### LineChart.vue (折线图组件)
- 属性配置:
  - data: 时序数据
  - height/width: 尺寸
- 特性:
  - 自动时间轴格式化
  - 支持缩放和拖拽
  - 响应式调整
  - 支持风向数据特殊处理

### 2. 地图组件 (map/BaiduMap.vue)
- 功能特性:
  - 地图初始化和控件配置
  - 传感器标记管理
  - 位置选择和编辑
  - 信息窗口定制
  - 右键菜单支持

## 状态管理设计 (Vuex)

### sensor模块 (store/modules/sensor.js)
- 状态:
  - sensors: 传感器列表
  - currentSensor: 当前选中传感器
  - realTimeData: 实时数据
  - historicalData: 历史数据
- 操作:
  - 传感器CRUD
  - 实时数据获取
  - 历史数据查询
  - 位置更新

## API 接口设计 (api/index.js)

- 基础配置:
  - baseURL: 'http://localhost:8080'
  - timeout: 5000ms
- 拦截器配置:
  - 请求拦截器
  - 响应拦截器
- 主要接口:
  - 传感器管理接口
  - 实时数据接口
  - 历史数据接口

## 项目运行

```bash
# 安装依赖
npm install

# 开发环境运行
npm run serve

# 生产环境构建
npm run build
```

## 开发注意事项

1. 百度地图相关:
   - 需要申请百度地图开发者密钥
   - 需要在index.html中引入百度地图JS API

2. 数据格式化:
   - 不同类型传感器数据有不同的单位和精度要求
   - 风向数据需要特殊处理(0-100映射到八个方向)

3. 性能优化:
   - 使用 ResizeObserver 进行图表自适应
   - 大量数据时注意分页处理
   - 添加必要的数据加载状态