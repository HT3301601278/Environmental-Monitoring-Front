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

    <el-card v-if="hasData" class="chart-card">
      <template #header>
        <div class="card-header">
          <span>历史数据趋势</span>
          <el-radio-group v-model="currentMetric" size="small">
            <el-radio-button label="temperature">温度</el-radio-button>
            <el-radio-button label="humidity">湿度</el-radio-button>
            <el-radio-button label="light">光照</el-radio-button>
            <el-radio-button label="windSpeed">风速</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <line-chart :data="chartData" height="400px" />
    </el-card>

    <el-card v-if="hasData" class="table-card">
      <template #header>
        <div class="card-header">
          <span>历史数据列表</span>
          <el-button type="primary" size="small" @click="exportData">导出数据</el-button>
        </div>
      </template>
      <el-table
        :data="tableData"
        style="width: 100%"
        height="400"
        border
        :default-sort="{ prop: 'timestamp', order: 'descending' }"
      >
        <el-table-column prop="timestamp" label="时间" sortable width="180">
          <template #default="scope">
            {{ formatTime(scope.row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column prop="temperature" label="温度(℃)" sortable />
        <el-table-column prop="humidity" label="湿度(%)" sortable />
        <el-table-column prop="light" label="光照(lux)" sortable />
        <el-table-column prop="windSpeed" label="风速(m/s)" sortable />
        <el-table-column prop="windDirection" label="风向" />
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import LineChart from '@/components/charts/LineChart.vue'
import moment from 'moment'

export default {
  name: 'HistoryData',
  components: {
    LineChart
  },
  setup() {
    const store = useStore()
    const queryForm = ref({
      sensorId: null,
      timeRange: null
    })
    const currentMetric = ref('temperature')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const defaultTime = [
      new Date(2000, 1, 1, 0, 0, 0),
      new Date(2000, 2, 1, 23, 59, 59)
    ]

    const hasData = computed(() => store.state.sensor.historicalData.length > 0)
    
    const chartData = computed(() => {
      return store.state.sensor.historicalData.map(item => [
        new Date(item.timestamp).getTime(),
        item[currentMetric.value]
      ])
    })

    const tableData = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return store.state.sensor.historicalData.slice(start, end)
    })

    const handleQuery = async () => {
      if (!queryForm.value.sensorId || !queryForm.value.timeRange) {
        ElMessage.warning('请选择查询条件')
        return
      }

      const [startTime, endTime] = queryForm.value.timeRange
      await store.dispatch('sensor/fetchHistoricalData', {
        sensorId: queryForm.value.sensorId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      })
      
      total.value = store.state.sensor.historicalData.length
      currentPage.value = 1
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
      currentPage.value = 1
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
    }

    const formatTime = (timestamp) => {
      return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
    }

    const exportData = () => {
      const data = store.state.sensor.historicalData
      const headers = ['时间', '温度(℃)', '湿度(%)', '光照(lux)', '风速(m/s)', '风向']
      const csvContent = [
        headers.join(','),
        ...data.map(row => [
          formatTime(row.timestamp),
          row.temperature,
          row.humidity,
          row.light,
          row.windSpeed,
          row.windDirection
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `历史数据_${formatTime(new Date())}.csv`
      link.click()
    }

    return {
      queryForm,
      currentMetric,
      currentPage,
      pageSize,
      total,
      defaultTime,
      hasData,
      chartData,
      tableData,
      sensors: computed(() => store.state.sensor.sensors),
      handleQuery,
      handleSizeChange,
      handleCurrentChange,
      formatTime,
      exportData
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style> 