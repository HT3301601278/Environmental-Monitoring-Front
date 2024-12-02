<template>
  <el-container class="app-container">
    <el-aside width="200px">
      <el-menu
        :router="true"
        class="el-menu-vertical"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b">
        <el-menu-item index="/">
          <el-icon><location /></el-icon>
          <span>地图监控</span>
        </el-menu-item>
        <el-menu-item index="/realtime">
          <el-icon><data-line /></el-icon>
          <span>实时数据</span>
        </el-menu-item>
        <el-menu-item index="/history">
          <el-icon><histogram /></el-icon>
          <span>历史数据</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>环境监测系统</el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
// 添加 ResizeObserver 防抖处理
const debounce = (fn, delay) => {
  let timer
  return (...args) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

const _ResizeObserver = window.ResizeObserver
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback) {
    callback = debounce(callback, 200)
    super(callback)
  }
}
</script>

<style>
.app-container {
  height: 100vh;
}

.el-header {
  background-color: #545c64;
  color: white;
  line-height: 60px;
  text-align: center;
  font-size: 20px;
}

.el-aside {
  background-color: #545c64;
}

.el-menu-vertical {
  border-right: none;
}
</style>
