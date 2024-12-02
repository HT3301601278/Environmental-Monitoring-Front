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
      <!-- 仪表盘展示区域 -->
      <el-row :gutter="20" class="data-display">
        <el-col :span="8">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>实时仪表</span>
              </div>
            </template>
            <gauge-chart
              :value="gaugeData.value"
              :title="gaugeData.title"
              :min="gaugeData.min"
              :max="gaugeData.max"
            />
          </el-card>
        </el-col>
        
        <!-- 当前值和状态展示 -->
        <el-col :span="16">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>传感器信息</span>
              </div>
            </template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="传感器名称">
                {{ currentSensor?.name }}
              </el-descriptions-item>
              <el-descriptions-item label="传感器类型">
                {{ currentSensor?.type }}
              </el-descriptions-item>
              <el-descriptions-item label="当前数值">
                {{ formatValue(tableData[0]?.value) }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="currentSensor?.status ? 'success' : 'danger'">
                  {{ currentSensor?.status ? '在线' : '离线' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>

      <!-- 趋势图展示 -->
      <el-row :gutter="20" class="chart-container">
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
                <span>历史记录</span>
              </div>
            </template>
            <el-table :data="tableData" style="width: 100%" border stripe>
              <el-table-column prop="timestamp" label="时间" width="180">
                <template #default="scope">
                  {{ formatTime(scope.row.timestamp) }}
                </template>
              </el-table-column>
              <el-table-column :label="currentSensorType">
                <template #default="scope">
                  {{ formatValue(scope.row.value) }}
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status ? 'success' : 'info'" size="small">
                    {{ scope.row.status ? '正常' : '异常' }}
                  </el-tag>
                </template>
              </el-table-column>
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

    // 在 setup 函数内添加风向转换函数
    const convertWindDirection = (value) => {
      // 将0-100映射到0-360度
      const degree = (value / 100) * 360
      
      // 将360度划分为8个方向
      // 每个方向占45度，从北方向开始顺时针
      const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
      
      // 计算对应的方向索引
      // 加22.5度是为了让每个方向的范围以正方向为中心
      let index = Math.floor(((degree + 22.5) % 360) / 45)
      
      // 返回对应的方向
      return directions[index]
    }

    // 修改 formatValue 函数
    const formatValue = (value) => {
      if (value === undefined || value === null) return '-'
      
      const configs = {
        '温度': { unit: '℃', decimals: 1 },
        '湿度': { unit: '%', decimals: 1 },
        '光强': { unit: 'lux', decimals: 0 },
        '风速': { unit: 'm/s', decimals: 1 },
        '风向': { 
          format: (val) => convertWindDirection(val),
          unit: '' 
        }
      }
      
      const config = configs[currentSensorType.value] || { unit: '', decimals: 0 }
      
      // 如果是风向，使用特殊的格式化方法
      if (currentSensorType.value === '风向') {
        return config.format(value)
      }
      
      // 其他类型的数据保持原来的格式化方式
      return `${Number(value).toFixed(config.decimals || 0)} ${config.unit || ''}`
    }

    // 修改仪表盘数据配置中的风向配置
    const gaugeData = computed(() => {
      const configs = {
        '温度': { min: -20, max: 50, unit: '℃' },
        '湿度': { min: 0, max: 100, unit: '%' },
        '光强': { min: 0, max: 1000, unit: 'lux' },
        '风速': { min: 0, max: 30, unit: 'm/s' },
        '风向': { 
          min: 0, 
          max: 100, 
          unit: '',
          axisLabel: {
            formatter: function(value) {
              return convertWindDirection(value)
            }
          }
        }
      }
      
      // 获取当前传感器类型
      const type = currentSensor.value?.type || ''
      const config = configs[type] || { min: 0, max: 100, unit: '' }
      
      // 获取最新的数值
      const latestValue = tableData.value[0]?.value || 0
      
      return {
        title: type ? `${type}${config.unit ? `(${config.unit})` : ''}` : '',
        value: latestValue,
        min: config.min,
        max: config.max,
        axisLabel: config.axisLabel
      }
    })

    // 处理传感器选择变化
    const handleSensorChange = async (sensorId) => {
      if (timer) {
        clearInterval(timer)
      }
      
      // 清空所有数据
      chartData.value = []
      tableData.value = []
      
      if (sensorId) {
        try {
          // 固定查询时间
          const startTime = '2000-01-01T00:00:00'
          const endTime = '2100-12-31T00:00:00'
          
          const response = await store.dispatch('sensor/fetchHistoricalData', {
            sensorId,
            startTime,
            endTime,
            page: 0,
            size: 1000
          })
          
          // 更新图表数据
          if (response?.data?.content) {
            const historyData = response.data.content
            
            // 确保数据是有效的
            if (Array.isArray(historyData) && historyData.length > 0) {
              // 按时间升序排序用于图表显示
              const sortedChartData = [...historyData]
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .map(item => [
                  new Date(item.timestamp).getTime(),
                  parseFloat(item.value)
                ])
              
              chartData.value = sortedChartData
              
              // 按时间降序排序用于表格显示
              tableData.value = [...historyData]
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map(item => ({
                  timestamp: item.timestamp,
                  value: parseFloat(item.value),
                  status: item.sensor.status,
                  sensorName: item.sensor.name,
                  type: item.sensor.type
                }))
                
              console.log('Chart data:', chartData.value) // 调试用
            } else {
              console.warn('No valid historical data received')
            }
          }
          
          // 开始实时更新
          startRealTimeUpdate(sensorId)
        } catch (error) {
          console.error('切换传感器失败:', error)
          ElMessage.error('获取历史数据失败')
        }
      }
    }

    // 获取实时数据
    const fetchRealTimeData = async (sensorId) => {
      try {
        await store.dispatch('sensor/fetchRealTimeData', sensorId)
        const response = store.state.sensor.realTimeData
        if (response && response.data) {
          updateDisplayData(response.data)
        }
      } catch (error) {
        console.error('获取实时数据失败:', error)
      }
    }

    // 更新显示数据
    const updateDisplayData = (data) => {
      if (!data) return

      // 更新表格数据
      const newTableData = {
        timestamp: data.timestamp,
        value: parseFloat(data.value),
        status: true,
        sensorName: data.sensorName,
        type: data.type
      }
      
      tableData.value = [newTableData, ...tableData.value.slice(0, 9)]

      // 更新趋势图数据
      const newChartData = [
        new Date(data.timestamp).getTime(),
        parseFloat(data.value)
      ]
      
      // 添加新数据点，并保持时间窗口为7天
      const oneWeekAgo = moment().subtract(7, 'days').valueOf()
      chartData.value = [...chartData.value, newChartData]
        .filter(point => point[0] >= oneWeekAgo)
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
      currentSensor,
      currentSensorType,
      gaugeData,
      chartData,
      tableData,
      handleSensorChange,
      formatTime,
      formatValue
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

.el-descriptions {
  margin: 20px 0;
}
</style> 