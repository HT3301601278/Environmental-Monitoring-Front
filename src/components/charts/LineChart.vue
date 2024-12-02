<template>
  <div ref="chartContainer" :style="{ height: height, width: width }"></div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
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

    const initChart = () => {
      if (chart) {
        chart.dispose()
      }
      chart = echarts.init(chartContainer.value)
      updateChart()
    }

    const updateChart = () => {
      if (!chart) return

      requestAnimationFrame(() => {
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
        chart.setOption(option, true)
      })
    }

    watch(() => props.data, () => {
      if (props.data && props.data.length > 0) {
        updateChart()
      }
    }, { deep: true })

    onMounted(() => {
      initChart()
      window.addEventListener('resize', initChart)
    })

    onUnmounted(() => {
      if (chart) {
        chart.dispose()
      }
      window.removeEventListener('resize', initChart)
    })

    return {
      chartContainer
    }
  }
}
</script> 