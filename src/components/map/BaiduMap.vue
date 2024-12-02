<template>
  <div class="map-container">
    <div id="map" ref="mapContainer"></div>
    <div class="map-controls">
      <el-button type="primary" round @click="locateCurrentPosition">
        <el-icon><Location /></el-icon>
        定位
      </el-button>
    </div>
  </div>
</template>

<script>
import {onMounted, ref} from 'vue'
import {useStore} from 'vuex'
import {addMarker, initMap} from '@/utils/mapUtils'

export default {
  name: 'BaiduMap',
  setup() {
    const store = useStore()
    const mapContainer = ref(null)
    let map = null

    const locateCurrentPosition = () => {
      const geolocation = new BMap.Geolocation()
      geolocation.getCurrentPosition(function(r) {
        if (this.getStatus() == BMAP_STATUS_SUCCESS) {
          const point = r.point
          map.centerAndZoom(point, 15)
          const marker = new BMap.Marker(point)
          map.addOverlay(marker)
          marker.setAnimation(BMAP_ANIMATION_BOUNCE)

          // 添加信息窗口
          const infoWindow = new BMap.InfoWindow("当前位置")
          marker.addEventListener("click", function() {
            map.openInfoWindow(infoWindow, point)
          })
        } else {
          ElMessage.error('定位失败：' + this.getStatus())
        }
      }, {
        enableHighAccuracy: true
      })
    }

    onMounted(async () => {
      try {
        // 初始化地图
        map = await initMap('map')

        // 获取传感器数据
        await store.dispatch('sensor/fetchSensors')
        const sensors = store.state.sensor.sensors

        // 确保sensors存在且是数组再进行遍历
        if (sensors && Array.isArray(sensors)) {
          sensors.forEach(sensor => {
            // 确保传感器有经纬度数据
            if (sensor.longitude && sensor.latitude) {
              const point = new BMap.Point(sensor.longitude, sensor.latitude)
              addMarker(map, point, sensor)
            }
          })

          // 如果有传感器数据，将地图中心设置为第一个传感器的位置
          if (sensors.length > 0 && sensors[0].longitude && sensors[0].latitude) {
            const firstPoint = new BMap.Point(sensors[0].longitude, sensors[0].latitude)
            map.centerAndZoom(firstPoint, 15)
          } else {
            // 如果没有传感器数据，默认定位到当前位置
            const geolocation = new BMap.Geolocation()
            geolocation.getCurrentPosition(function(r) {
              if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                const point = r.point
                map.centerAndZoom(point, 15)
                const marker = new BMap.Marker(point)
                map.addOverlay(marker)
                marker.setAnimation(BMAP_ANIMATION_BOUNCE)

                // 添加信息窗口
                const infoWindow = new BMap.InfoWindow("当前位置")
                marker.addEventListener("click", function() {
                  map.openInfoWindow(infoWindow, point)
                })
              } else {
                // 如果定位失败，默认定位到武汉
                const defaultPoint = new BMap.Point(114.2857, 30.5866)
                map.centerAndZoom(defaultPoint, 12)
                ElMessage.error('定位失败，显示默认位置')
              }
            }, {
              enableHighAccuracy: true
            })
          }
        }
      } catch (error) {
        console.error('地图初始化失败:', error)
      }
    })

    return {
      mapContainer,
      locateCurrentPosition
    }
  }
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

#map {
  width: 100%;
  height: 100%;
  min-height: 600px;
}

.map-controls {
  position: absolute;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
}

.map-controls .el-button {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.map-controls .el-button:hover {
  transform: scale(1.05);
  transition: transform 0.2s;
}
</style>
