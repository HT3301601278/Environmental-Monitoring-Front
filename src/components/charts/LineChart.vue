<template>
  <div ref="chartContainer" :style="{ height: height, width: width }"></div>
</template>

<script>
import {nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import * as echarts from 'echarts'
import moment from 'moment'

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

    // 添加风向转换函数
    const convertWindDirection = (value) => {
      // 将0-100映射到0-360度
      const degree = (value / 100) * 360

      // 将360度划分为8个方向
      // 每个方向占45度，从北方向开始顺时针
      const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']

      // 计算对应的方向索引
      let index = Math.floor(((degree + 22.5) % 360) / 45)

      return directions[index]
    }

    const updateChart = () => {
      if (!chart) return

      // 添加数据验证和调试信息
      console.log('Updating chart with data:', props.data)

      if (!props.data || !Array.isArray(props.data) || props.data.length === 0) {
        console.warn('No valid data for chart')
        chart.setOption({
          title: {
            text: '暂无数据',
            left: 'center',
            top: 'center'
          }
        })
        return
      }

      // 检查是否是风向数据
      const isWindDirection = document.title.includes('风向') ||
                             document.querySelector('.el-card__header')?.textContent.includes('风向')

      // 计算数据的时间范围
      const timestamps = props.data.map(item => item[0])
      const minTime = Math.min(...timestamps)
      const maxTime = Math.max(...timestamps)

      console.log('Time range:', { minTime, maxTime })

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const data = params[0];
            const value = isWindDirection ? convertWindDirection(data.value[1]) : data.value[1]
            return `${moment(data.value[0]).format('YYYY-MM-DD HH:mm:ss')}<br/>
                    ${data.marker} ${value}`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'time',
          boundaryGap: false,
          axisLabel: {
            formatter: function(value) {
              return moment(value).format('MM-DD HH:mm')
            },
            interval: 'auto',
            rotate: 30
          },
          splitLine: {
            show: false
          },
          min: minTime,
          max: maxTime
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '20%'],
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          },
          // 为风向数据设置固定刻度
          ...(isWindDirection ? {
            min: 0,
            max: 100,
            interval: 12.5, // 将0-100等分为8份
            axisLabel: {
              formatter: function(value) {
                return convertWindDirection(value)
              }
            },
            axisLine: { show: true },
            axisTick: { show: true }
          } : {})
        },
        series: [{
          name: '数值',
          type: 'line',
          showSymbol: true,
          symbolSize: 6,
          data: props.data,
          smooth: true,
          animation: true,
          animationDuration: 300,
          areaStyle: {
            opacity: 0.1
          },
          // 为风向数据添加特殊标记
          ...(isWindDirection ? {
            markLine: {
              silent: true,
              symbol: 'none',
              lineStyle: {
                type: 'dashed',
                color: '#ccc'
              },
              data: [
                { yAxis: 12.5 },
                { yAxis: 25 },
                { yAxis: 37.5 },
                { yAxis: 50 },
                { yAxis: 62.5 },
                { yAxis: 75 },
                { yAxis: 87.5 }
              ]
            }
          } : {})
        }]
      }

      try {
        chart.setOption(option, true)
        console.log('Chart updated successfully')
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
