<template>
  <div class="realtime-data">
    <!-- 传感器选择区域优化 -->
    <el-row :gutter="20" class="sensor-select-row">
      <el-col :span="8">
        <el-card class="sensor-select-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><Monitor /></el-icon>
                传感器选择
              </span>
            </div>
          </template>
          <el-select
            v-model="selectedSensor"
            placeholder="请选择传感器"
            @change="handleSensorChange"
            class="sensor-select"
            size="large">
            <el-option
              v-for="sensor in sensors"
              :key="sensor.id"
              :label="sensor.name"
              :value="sensor.id">
              <div class="sensor-option">
                <el-icon><Cpu /></el-icon>
                <span class="sensor-name">{{ sensor.name }}</span>
                <el-tag size="small" :type="sensor.status ? 'success' : 'danger'" class="sensor-type">
                  {{ sensor.type }}
                </el-tag>
              </div>
            </el-option>
          </el-select>
        </el-card>
      </el-col>

      <!-- 当前传感器状态卡片 -->
      <el-col :span="16" v-if="selectedSensor">
        <el-card class="status-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><InfoFilled /></el-icon>
                传感器状态
              </span>
              <el-tag :type="currentSensor?.status ? 'success' : 'danger'" class="status-tag">
                {{ currentSensor?.status ? '在线' : '离线' }}
              </el-tag>
            </div>
          </template>
          <el-row :gutter="20" class="status-content">
            <el-col :span="8" class="status-item">
              <div class="status-label">传感器名称</div>
              <div class="status-value">{{ currentSensor?.name }}</div>
            </el-col>
            <el-col :span="8" class="status-item">
              <div class="status-label">传感器类型</div>
              <div class="status-value">{{ currentSensor?.type }}</div>
            </el-col>
            <el-col :span="8" class="status-item">
              <div class="status-label">当前数值</div>
              <div class="status-value highlight">{{ formatValue(tableData[0]?.value) }}</div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据展示区域 -->
    <template v-if="selectedSensor">
      <el-row :gutter="20" class="data-display">
        <!-- 仪表盘展示 -->
        <el-col :span="8">
          <el-card class="gauge-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="header-title">
                  <el-icon><DataLine /></el-icon>
                  实时仪表
                </span>
              </div>
            </template>
            <gauge-chart
              :value="gaugeData.value"
              :title="gaugeData.title"
              :min="gaugeData.min"
              :max="gaugeData.max"
              height="300px"
            />
          </el-card>
        </el-col>

        <!-- 趋势图展示 -->
        <el-col :span="16">
          <el-card class="trend-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="header-title">
                  <el-icon><TrendCharts /></el-icon>
                  实时趋势
                </span>
              </div>
            </template>
            <line-chart :data="chartData" height="300px" />
          </el-card>
        </el-col>
      </el-row>

      <!-- 实时表格 -->
      <el-card class="history-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="header-title">
              <el-icon><List /></el-icon>
              实时表格
            </span>
          </div>
        </template>
        <el-table 
          :data="tableData" 
          style="width: 100%" 
          border 
          stripe
          size="large"
          :header-cell-style="{
            background: '#f5f7fa',
            color: '#606266',
            fontWeight: 'bold'
          }">
          <el-table-column prop="timestamp" label="时间" width="180" fixed>
            <template #default="scope">
              {{ formatTime(scope.row.timestamp) }}
            </template>
          </el-table-column>
          <el-table-column :label="currentSensorType">
            <template #default="scope">
              <span class="value-cell">{{ formatValue(scope.row.value) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag 
                :type="scope.row.status ? 'success' : 'danger'"
                size="small"
                effect="dark">
                {{ scope.row.status ? '正常' : '异常' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>
  </div>
</template>

<script>
import {computed, onMounted, ref} from 'vue'
import {useStore} from 'vuex'
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
      // 清空所有数据
      chartData.value = []
      tableData.value = []

      if (sensorId) {
        try {
          // 固定查询时间范围
          const params = {
            sensorId,
            startTime: '2000-01-01T00:00:00',
            endTime: '2100-12-31T00:00:00',
            page: 0,
            size: 1000
          }

          const response = await store.dispatch('sensor/fetchHistoricalData', params)

          // 更新图表和表格数据
          if (response?.data?.content) {
            const historyData = response.data.content

            if (Array.isArray(historyData) && historyData.length > 0) {
              // 按时间升序排序用于图表显示
              chartData.value = [...historyData]
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .map(item => [
                  new Date(item.timestamp).getTime(),
                  parseFloat(item.value)
                ])

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

              console.log('Data updated successfully')
            } else {
              console.warn('No valid historical data received')
            }
          }
        } catch (error) {
          console.error('切换传感器失败:', error)
          ElMessage.error('获取历史数据失败')
        }
      }
    }

    // 格式化时间
    const formatTime = (timestamp) => {
      return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
    }

    onMounted(async () => {
      await store.dispatch('sensor/fetchSensors')
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
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.sensor-select-row {
  margin-bottom: 20px;
}

.sensor-select-card, .status-card, .gauge-card, .trend-card, .history-card {
  border-radius: 8px;
  transition: all 0.3s;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.sensor-select {
  width: 100%;
}

.sensor-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sensor-name {
  flex: 1;
}

.sensor-type {
  margin-left: auto;
}

.status-content {
  padding: 10px 0;
}

.status-item {
  text-align: center;
  border-right: 1px solid #ebeef5;
}

.status-item:last-child {
  border-right: none;
}

.status-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.status-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.status-value.highlight {
  color: #409eff;
  font-size: 20px;
}

.data-display {
  margin-bottom: 20px;
}

.value-cell {
  font-family: monospace;
  font-size: 14px;
  color: #409eff;
}

/* 添加响应式布局 */
@media screen and (max-width: 1200px) {
  .sensor-select-row > .el-col {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .data-display > .el-col {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style>
