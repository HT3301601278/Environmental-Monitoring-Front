<template>
  <div class="realtime-data">
    <!-- 传感器选择 -->
    <el-card class="sensor-select">
      <template #header>
        <div class="card-header">
          <span>传感器选择</span>
        </div>
      </template>
      <el-select 
        v-model="selectedSensor" 
        placeholder="请选择传感器"
        @change="handleSensorChange"
        style="width: 100%">
        <el-option
          v-for="sensor in sensors"
          :key="sensor.id"
          :label="sensor.name"
          :value="sensor.id">
          <span>{{ sensor.name }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">
            {{ sensor.type }}
          </span>
        </el-option>
      </el-select>
    </el-card>

    <!-- 数据展示区域 - 仅在选择传感器后显示 -->
    <template v-if="selectedSensor">
      <el-row :gutter="20" class="data-display">
        <!-- 仪表盘展示 -->
        <el-col :span="12">
          <el-card>
            <gauge-chart
              :value="gaugeData.value"
              :title="gaugeData.title"
              :min="gaugeData.min"
              :max="gaugeData.max"
            />
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="chart-container">
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
      <el-row :gutter="20" class="table-container">
        <el-col :span="24">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>实时数据</span>
              </div>
            </template>
            <el-table :data="tableData" style="width: 100%">
              <el-table-column prop="timestamp" label="时间" width="180">
                <template #default="scope">
                  {{ formatTime(scope.row.timestamp) }}
                </template>
              </el-table-column>
              <el-table-column prop="value" :label="currentSensorType" />
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useStore } from 'vuex'
import GaugeChart from '@/components/charts/GaugeChart.vue'
import LineChart from '@/components/charts/LineChart.vue'
import moment from 'moment'

export default {
  name: 'RealTimeData',
  components: {
    GaugeChart,
    LineChart
  },
  setup() {
    const store = useStore()
    const selectedSensor = ref(null)
    const chartData = ref([])
    const tableData = ref([])
    let timer = null

    // 获取传感器列表
    const sensors = computed(() => store.state.sensor.sensors)
    const currentSensor = computed(() => 
      sensors.value.find(s => s.id === selectedSensor.value)
    )
    const currentSensorType = computed(() => 
      currentSensor.value ? currentSensor.value.type : ''
    )

    // 仪表盘数据配置
    const gaugeData = computed(() => {
      const configs = {
        '温度': { min: -20, max: 50, unit: '℃' },
        '湿度': { min: 0, max: 100, unit: '%' },
        '光强': { min: 0, max: 1000, unit: 'lux' },
        '风速': { min: 0, max: 30, unit: 'm/s' },
        '风向': { min: 0, max: 360, unit: '°' }
      }
      const type = currentSensorType.value
      const config = configs[type] || { min: 0, max: 100, unit: '' }
      
      return {
        title: `${type}(${config.unit})`,
        value: tableData.value[0]?.value || 0,
        min: config.min,
        max: config.max
      }
    })

    // 处理传感器选择变化
    const handleSensorChange = (sensorId) => {
      if (timer) {
        clearInterval(timer)
      }
      chartData.value = []
      tableData.value = []
      if (sensorId) {
        startRealTimeUpdate(sensorId)
      }
    }

    // 获取实时数据
    const fetchRealTimeData = async (sensorId) => {
      try {
        await store.dispatch('sensor/fetchRealTimeData', sensorId)
        const data = store.state.sensor.realTimeData
        if (data) {
          updateDisplayData(data)
        }
      } catch (error) {
        console.error('获取实时数据失败:', error)
      }
    }

    // 更新显示数据
    const updateDisplayData = (data) => {
      // 更新表格数据
      if (tableData.value.length > 10) {
        tableData.value = tableData.value.slice(0, 9)
      }
      tableData.value.unshift(data)

      // 更新趋势图数据
      if (chartData.value.length > 50) {
        chartData.value = chartData.value.slice(-49)
      }
      chartData.value.push([
        new Date(data.timestamp).getTime(),
        data.value
      ])
    }

    // 开始定时更新
    const startRealTimeUpdate = (sensorId) => {
      fetchRealTimeData(sensorId) // 立即获取一次数据
      timer = setInterval(() => fetchRealTimeData(sensorId), 5000) // 每5秒更新一次
    }

    // 格式化时间
    const formatTime = (timestamp) => {
      return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
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
      sensors,
      selectedSensor,
      currentSensorType,
      gaugeData,
      chartData,
      tableData,
      handleSensorChange,
      formatTime
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