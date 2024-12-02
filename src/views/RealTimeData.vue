<template>
  <div class="realtime-data">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="sensor-select">
          <template #header>
            <div class="card-header">
              <span>传感器选择</span>
            </div>
          </template>
          <el-select v-model="currentSensorId" placeholder="请选择传感器" @change="handleSensorChange">
            <el-option
              v-for="sensor in sensors"
              :key="sensor.id"
              :label="sensor.name"
              :value="sensor.id"
            />
          </el-select>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="data-display" v-if="currentSensorId">
      <!-- 仪表盘展示 -->
      <el-col :span="8" v-for="(gauge, index) in gaugeData" :key="index">
        <el-card>
          <gauge-chart
            :value="gauge.value"
            :title="gauge.title"
            :min="gauge.min"
            :max="gauge.max"
          />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-container" v-if="currentSensorId">
      <!-- 趋势图展示 -->
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>实时趋势</span>
            </div>
          </template>
          <line-chart :data="chartData" height="400px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-row :gutter="20" class="table-container" v-if="currentSensorId">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>实时数据</span>
            </div>
          </template>
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="timestamp" label="时间" width="180" />
            <el-table-column prop="temperature" label="温度(℃)" />
            <el-table-column prop="humidity" label="湿度(%)" />
            <el-table-column prop="light" label="光照(lux)" />
            <el-table-column prop="windSpeed" label="风速(m/s)" />
            <el-table-column prop="windDirection" label="风向" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import GaugeChart from '@/components/charts/GaugeChart.vue'
import LineChart from '@/components/charts/LineChart.vue'

export default {
  name: 'RealTimeData',
  components: {
    GaugeChart,
    LineChart
  },
  setup() {
    const store = useStore()
    const currentSensorId = ref(null)
    const chartData = ref([])
    const tableData = ref([])
    let timer = null

    const gaugeData = ref([
      { title: '温度', value: 0, min: -20, max: 50 },
      { title: '湿度', value: 0, min: 0, max: 100 },
      { title: '光照', value: 0, min: 0, max: 100000 }
    ])

    const handleSensorChange = async (sensorId) => {
      clearInterval(timer)
      await fetchRealTimeData(sensorId)
      startRealTimeUpdate(sensorId)
    }

    const fetchRealTimeData = async (sensorId) => {
      await store.dispatch('sensor/fetchRealTimeData', sensorId)
      updateDisplayData()
    }

    const updateDisplayData = () => {
      const data = store.state.sensor.realTimeData
      if (!data) return

      // 更新仪表盘数据
      gaugeData.value[0].value = data.temperature
      gaugeData.value[1].value = data.humidity
      gaugeData.value[2].value = data.light

      // 更新趋势图数据
      const now = new Date().getTime()
      chartData.value.push([now, data.temperature])
      if (chartData.value.length > 100) {
        chartData.value.shift()
      }

      // 更新表格数据
      tableData.value.unshift({
        timestamp: new Date().toLocaleString(),
        temperature: data.temperature,
        humidity: data.humidity,
        light: data.light,
        windSpeed: data.windSpeed,
        windDirection: data.windDirection
      })
      if (tableData.value.length > 10) {
        tableData.value.pop()
      }
    }

    const startRealTimeUpdate = (sensorId) => {
      timer = setInterval(() => {
        fetchRealTimeData(sensorId)
      }, 5000) // 每5秒更新一次
    }

    onMounted(async () => {
      await store.dispatch('sensor/fetchSensors')
    })

    onUnmounted(() => {
      if (timer) {
        clearInterval(timer)
      }
    })

    return {
      currentSensorId,
      sensors: store.state.sensor.sensors,
      gaugeData,
      chartData,
      tableData,
      handleSensorChange
    }
  }
}
</script>

<style scoped>
.realtime-data {
  padding: 20px;
}

.sensor-select {
  margin-bottom: 20px;
}

.data-display {
  margin-bottom: 20px;
}

.chart-container {
  margin-bottom: 20px;
}

.table-container {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 