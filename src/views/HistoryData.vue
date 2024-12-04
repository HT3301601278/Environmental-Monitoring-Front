<template>
  <div class="history-data">
    <el-card class="query-form">
      <template #header>
        <div class="card-header">
          <span>历史数据查询</span>
        </div>
      </template>

      <el-form :model="queryForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="传感器">
              <el-select v-model="queryForm.sensorId" placeholder="请选择传感器">
                <el-option
                  v-for="sensor in sensors"
                  :key="sensor.id"
                  :label="sensor.name"
                  :value="sensor.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="queryForm.timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                :default-time="defaultTime"
              />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="handleQuery">查询</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card v-if="queryForm.sensorId" class="realtime-card">
      <template #header>
        <div class="card-header">
          <span>实时数据</span>
          <el-button type="primary" size="small" @click="fetchRealTimeData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="data-item">
            <div class="label">传感器名称</div>
            <div class="value">{{ realTimeData?.sensorName || '-' }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="data-item">
            <div class="label">传感器类型</div>
            <div class="value">{{ realTimeData?.type || '-' }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="data-item">
            <div class="label">当前数值</div>
            <div class="value highlight">{{ formatValue(realTimeData?.value) }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="data-item">
            <div class="label">更新时间</div>
            <div class="value">{{ formatTime(realTimeData?.timestamp) || '-' }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card v-if="hasData" class="chart-card">
      <template #header>
        <div class="card-header">
          <span>历史数据趋势</span>
        </div>
      </template>
      <line-chart :data="chartData" height="400px" />
    </el-card>

    <el-card v-if="hasData" class="table-card">
      <template #header>
        <div class="card-header">
          <span>历史数据列表</span>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column prop="value" label="数值" width="180" />
        <el-table-column prop="sensorName" label="传感器" />
        <el-table-column prop="type" label="类型" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import LineChart from '@/components/charts/LineChart.vue'
import moment from 'moment'
import api from '@/api'

export default {
  name: 'HistoryData',
  components: {
    LineChart
  },
  setup() {
    const store = useStore()
    const queryForm = ref({
      sensorId: '',
      timeRange: null
    })
    const hasData = ref(false)
    const chartData = ref([])
    const tableData = ref([])
    const defaultTime = [
      new Date(2000, 0, 1, 0, 0, 0),
      new Date(2000, 0, 1, 23, 59, 59)
    ]
    const realTimeData = ref(null)

    // 处理查询
    const handleQuery = async () => {
      if (!queryForm.value.sensorId || !queryForm.value.timeRange) {
        ElMessage.warning('请选择查询条件')
        return
      }

      const [startTime, endTime] = queryForm.value.timeRange
      try {
        const result = await store.dispatch('sensor/fetchHistoricalData', {
          sensorId: queryForm.value.sensorId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          page: 0,
          size: 1000
        })

        const historyData = store.state.sensor.historicalData
        if (historyData?.content && Array.isArray(historyData.content)) {
          if (historyData.content.length > 0) {
            hasData.value = true
            
            // 处理图表数据
            chartData.value = historyData.content
              .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
              .map(item => [
                new Date(item.timestamp).getTime(),
                parseFloat(item.value)
              ])

            // 处理表格数据
            tableData.value = historyData.content
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map(item => ({
                timestamp: item.timestamp,
                value: parseFloat(item.value),
                sensorName: item.sensor.name,
                type: item.sensor.type
              }))
          } else {
            hasData.value = false
            ElMessage.warning('暂无历史数据')
          }
        }
      } catch (error) {
        console.error('查询历史数据失败:', error)
        ElMessage.error('查询历史数据失败')
      }
    }

    // 格式化时间
    const formatTime = (timestamp) => {
      return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
    }

    // 添加获取实时数据的方法
    const fetchRealTimeData = async () => {
      if (!queryForm.value.sensorId) {
        ElMessage.warning('请先选择传感器')
        return
      }

      try {
        const response = await api.get(`/api/sensors/${queryForm.value.sensorId}/realtime`)
        if (response?.data) {
          realTimeData.value = response.data
        }
      } catch (error) {
        console.error('获取实时数据失败:', error)
        ElMessage.error('获取实时数据失败')
      }
    }

    // 添加值格式化方法
    const formatValue = (value) => {
      if (value === undefined || value === null) return '-'

      const configs = {
        '温度': { unit: '℃', decimals: 1 },
        '湿度': { unit: '%', decimals: 1 },
        '光强': { unit: 'lux', decimals: 0 },
        '风速': { unit: 'm/s', decimals: 1 },
        '风向': {
          format: (val) => {
            const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
            const index = Math.floor(((val / 100 * 360 + 22.5) % 360) / 45)
            return directions[index]
          }
        }
      }

      const config = configs[realTimeData.value?.type] || { unit: '', decimals: 0 }

      if (realTimeData.value?.type === '风向') {
        return config.format(value)
      }

      return `${Number(value).toFixed(config.decimals || 0)} ${config.unit || ''}`
    }

    // 监听传感器选择变化，自动获取实时数据
    watch(() => queryForm.value.sensorId, (newVal) => {
      if (newVal) {
        fetchRealTimeData()
      } else {
        realTimeData.value = null
      }
    })

    return {
      queryForm,
      hasData,
      chartData,
      tableData,
      defaultTime,
      sensors: computed(() => store.state.sensor.sensors),
      handleQuery,
      formatTime,
      realTimeData,
      fetchRealTimeData,
      formatValue
    }
  }
}
</script>

<style scoped>
.history-data {
  padding: 20px;
}

.query-form {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.realtime-card {
  margin-bottom: 20px;
}

.data-item {
  text-align: center;
  padding: 10px;
  border-right: 1px solid #ebeef5;
}

.data-item:last-child {
  border-right: none;
}

.data-item .label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.data-item .value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.data-item .value.highlight {
  color: #409eff;
  font-size: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
