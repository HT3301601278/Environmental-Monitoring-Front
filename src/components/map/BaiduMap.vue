<template>
  <div class="map-container">
    <div id="map" ref="mapContainer"></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { initMap, addMarker } from '@/utils/mapUtils'

export default {
  name: 'BaiduMap',
  setup() {
    const store = useStore()
    const mapContainer = ref(null)
    let map = null
    
    onMounted(async () => {
      // 初始化地图
      map = await initMap('map')
      
      // 获取传感器数据
      await store.dispatch('sensor/fetchSensors')
      const sensors = store.state.sensor.sensors
      
      // 添加传感器标记
      sensors.forEach(sensor => {
        const point = new BMap.Point(sensor.longitude, sensor.latitude)
        addMarker(map, point, sensor)
      })
    })
    
    return {
      mapContainer
    }
  }
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}

#map {
  width: 100%;
  height: 100%;
  min-height: 600px;
}
</style> 