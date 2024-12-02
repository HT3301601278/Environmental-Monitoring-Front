<template>
  <div ref="chartContainer" :style="{ height: height, width: width }"></div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
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

    const updateChart = () => {
      if (!chart) return

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const data = params[0];
            return `${moment(data.value[0]).format('HH:mm:ss')}<br/>
                    ${data.marker} ${data.value[1]}`
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
              const now = moment();
              const time = moment(value);
              const diff = now.diff(time, 'seconds');
              
              if (diff < 60) {
                return `${diff}秒前`;
              } else if (diff < 3600) {
                return `${Math.floor(diff / 60)}分钟前`;
              } else {
                return time.format('HH:mm:ss');
              }
            },
            interval: 0,  // 显示所有标签
            rotate: 30    // 标签旋转30度，防止重叠
          },
          splitLine: {
            show: false
          },
          // 设置时间轴的最小间隔为5秒
          minInterval: 5000,
          // 设置时间轴的最大值为当前时间，最小值为10分钟前
          max: function() {
            return new Date().getTime();
          },
          min: function() {
            return new Date().getTime() - 10 * 60 * 1000;
          }
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '20%'],  // 增加上下边界间隔
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        series: [{
          name: '数值',
          type: 'line',
          showSymbol: false,
          data: props.data,
          smooth: true,
          animation: true,
          animationDuration: 300,
          areaStyle: {
            opacity: 0.1
          }
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