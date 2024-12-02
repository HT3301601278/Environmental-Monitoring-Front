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
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
