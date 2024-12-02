<template>
  <div ref="chartContainer" :style="{ height: height, width: width }"></div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
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
      const option = {
        title: {
          text: props.title,
          left: 'center'
        },
        series: [{
          type: 'gauge',
          min: props.min,
          max: props.max,
          detail: {
            formatter: '{value}'
          },
          data: [{
            value: props.value
          }]
        }]
      }
      chart.setOption(option)
    }

    watch(() => props.value, () => {
      updateChart()
    })

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