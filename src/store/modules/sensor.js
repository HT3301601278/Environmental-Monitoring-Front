import api from '@/api'
import { ElMessage } from 'element-plus'

export default {
  namespaced: true,
  state: {
    sensors: [],
    currentSensor: null,
    realTimeData: null,
    historicalData: []
  },
  mutations: {
    SET_SENSORS(state, sensors) {
      state.sensors = sensors
    },
    SET_CURRENT_SENSOR(state, sensor) {
      state.currentSensor = sensor
    },
    SET_REALTIME_DATA(state, data) {
      state.realTimeData = data
    },
    SET_HISTORICAL_DATA(state, data) {
      state.historicalData = data
    }
  },
  actions: {
    async fetchSensors({ commit }) {
      try {
        const response = await api.get('/api/sensors')
        if (response && response.data) {
          commit('SET_SENSORS', response.data)
        }
      } catch (error) {
        ElMessage.error('获取传感器列表失败')
        console.error('获取传感器列表失败:', error)
        throw error
      }
    },
    async fetchRealTimeData({ commit }, sensorId) {
      try {
        const response = await api.get(`/api/sensors/${sensorId}/realtime`)
        if (response.data) {
          commit('SET_REALTIME_DATA', response.data.data)
        }
      } catch (error) {
        ElMessage.error('获取实时数据失败')
        console.error('获取实时数据失败:', error)
      }
    },
    async fetchHistoricalData({ commit }, { sensorId, startTime, endTime, page = 0, size = 10 }) {
      try {
        const response = await api.get('/api/data/history', {
          params: {
            sensorId,
            startTime,
            endTime,
            page,
            size
          }
        })
        if (response.data) {
          commit('SET_HISTORICAL_DATA', response.data.data)
        }
      } catch (error) {
        ElMessage.error('获取历史数据失败')
        console.error('获取历史数据失败:', error)
      }
    },
    async addSensor({ dispatch }, sensor) {
      try {
        await api.post('/api/sensors', sensor)
        ElMessage.success('传感器添加成功')
        await dispatch('fetchSensors')
      } catch (error) {
        ElMessage.error('传感器添加失败')
        console.error('添加传感器失败:', error)
      }
    },
    async updateSensor({ dispatch }, sensor) {
      try {
        await api.put(`/api/sensors/${sensor.id}`, sensor)
        ElMessage.success('传感器更新成功')
        await dispatch('fetchSensors')
      } catch (error) {
        ElMessage.error('传感器更新失败')
        console.error('更新传感器失败:', error)
      }
    },
    async deleteSensor({ dispatch }, id) {
      try {
        await api.delete(`/api/sensors/${id}`)
        ElMessage.success('传感器删除成功')
        await dispatch('fetchSensors')
      } catch (error) {
        ElMessage.error('传感器删除失败')
        console.error('删除传感器失败:', error)
      }
    },
    async updateSensorLocation({ dispatch }, { id, latitude, longitude }) {
      try {
        await api.put(`/api/map/sensors/${id}/location`, { latitude, longitude })
        ElMessage.success('位置更新成功')
        await dispatch('fetchSensors')
      } catch (error) {
        ElMessage.error('位置更新失败')
        console.error('更新传感器位置失败:', error)
      }
    }
  }
} 