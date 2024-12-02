<template>
  <div ref="chartContainer" :style="{ height: height, width: width }"></div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'LineChart',
  props: {
    data: {
      type: Array,
      required: true
    },
    height: {
      type: String,
      default: '300px'
    },
    width: {
      type: String,
      default: '100%'
    }
  },
  setup(props) {
    const chartContainer = ref(null)
    let chart = null
    let resizeObserver = null

    const initChart = () => {
      if (chart) {
        chart.dispose()
      }
      
      // 确保容器已经挂载
      if (!chartContainer.value) return
      
      chart = echarts.init(chartContainer.value)
      updateChart()
    }

    const updateChart = () => {
      if (!chart) return

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'time',
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '100%']
        },
        series: [{
          name: '数值',
          type: 'line',
          data: props.data,
          smooth: true,
          animation: true,
          animationDuration: 300
        }]
      }
      
      try {
        chart.setOption(option, true)
      } catch (error) {
        console.error('更新图表失败:', error)
      }
    }

    watch(() => props.data, () => {
      if (props.data && props.data.length > 0) {
        nextTick(() => updateChart())
      }
    }, { deep: true })

    onMounted(() => {
      // 使用 ResizeObserver 替代 window.resize
      resizeObserver = new ResizeObserver(() => {
        if (chart) {
          chart.resize()
        }
      })
      
      if (chartContainer.value) {
        resizeObserver.observe(chartContainer.value)
      }
      
      nextTick(() => initChart())
    })

    onUnmounted(() => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      if (chart) {
        chart.dispose()
      }
    })

    return {
      chartContainer
    }
  }
}
</script> 