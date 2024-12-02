<template>
  <div ref="chartContainer" :style="{ height: height, width: width }"></div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'GaugeChart',
  props: {
    value: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    height: {
      type: String,
      default: '300px'
    },
    width: {
      type: String,
      default: '100%'
    },
    axisLabel: {
      type: Object,
      default: () => ({})
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
        title: {
          text: props.title,
          left: 'center'
        },
        series: [{
          type: 'gauge',
          min: props.min,
          max: props.max,
          axisLabel: props.axisLabel || {},
          detail: {
            formatter: function(value) {
              if (props.title.includes('风向')) {
                const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
                const index = Math.floor(((value / 100 * 360 + 22.5) % 360) / 45)
                return directions[index]
              }
              return value
            }
          },
          data: [{
            value: props.value
          }]
        }]
      }
      
      try {
        chart.setOption(option, true)
      } catch (error) {
        console.error('更新图表失败:', error)
      }
    }

    watch(() => props.value, () => {
      nextTick(() => updateChart())
    })

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