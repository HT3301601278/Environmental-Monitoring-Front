<template>
  <div class="map-view">
    <baidu-map></baidu-map>
  </div>
</template>

<script>
import BaiduMap from '@/components/map/BaiduMap.vue'

export default {
  name: 'MapView',
  components: {
    BaiduMap
  }
}
</script>

<style scoped>
.map-view {
  height: 100%;
  padding: 20px;
}
</style> 