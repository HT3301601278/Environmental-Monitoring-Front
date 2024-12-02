import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'map',
    component: () => import('../views/MapView.vue')
  },
  {
    path: '/realtime',
    name: 'realtime',
    component: () => import('../views/RealTimeData.vue')
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('../views/HistoryData.vue')
  },
  {
    path: '/sensor-management',
    name: 'sensor-management',
    component: () => import('../views/SensorManagement.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
