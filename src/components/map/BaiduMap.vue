<template>
  <div class="map-container">
    <div id="map" ref="mapContainer"></div>
    <div class="map-controls">
      <el-button-group>
        <el-button type="primary" @click="locateCurrentPosition">
          <el-icon><Location /></el-icon>
          定位
        </el-button>
        <el-button type="success" @click="startAddSensor">
          <el-icon><Plus /></el-icon>
          添加传感器
        </el-button>
      </el-button-group>
    </div>

    <el-dialog
      v-model="addSensorDialogVisible"
      title="添加传感器"
      width="30%">
      <el-form :model="newSensor" label-width="100px">
        <el-form-item label="传感器名称">
          <el-input v-model="newSensor.name" />
        </el-form-item>
        <el-form-item label="传感器类型">
          <el-select v-model="newSensor.type">
            <el-option label="温度" value="温度" />
            <el-option label="湿度" value="湿度" />
            <el-option label="光强" value="光强" />
            <el-option label="风速" value="风速" />
            <el-option label="风向" value="风向" />
          </el-select>
        </el-form-item>
        <el-form-item label="经度">
          <el-input v-model="newSensor.longitude" disabled />
        </el-form-item>
        <el-form-item label="纬度">
          <el-input v-model="newSensor.latitude" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addSensorDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddSensor">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {onMounted, ref} from 'vue'
import {useStore} from 'vuex'
import {ElMessage} from 'element-plus'
import {addMarker, initMap} from '@/utils/mapUtils'

export default {
  name: 'BaiduMap',
  setup() {
    const store = useStore()
    const mapContainer = ref(null)
    const addSensorDialogVisible = ref(false)
    const isAddingMode = ref(false)
    let map = null
    let markers = []

    const newSensor = ref({
      name: '',
      type: '',
      longitude: '',
      latitude: ''
    })

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

    // 开始添加传感器模式
    const startAddSensor = () => {
      isAddingMode.value = true
      ElMessage.info('请在地图上点击选择传感器位置')
      
      // 添加地图点击事件
      map.addEventListener('click', handleMapClick)
    }

    // 处理地图点击
    const handleMapClick = (e) => {
      if (isAddingMode.value) {
        newSensor.value.longitude = e.point.lng
        newSensor.value.latitude = e.point.lat
        addSensorDialogVisible.value = true
        isAddingMode.value = false
        map.removeEventListener('click', handleMapClick)
      }
    }

    // 确认添加传感器
    const confirmAddSensor = async () => {
      try {
        await store.dispatch('sensor/addSensor', newSensor.value)
        addSensorDialogVisible.value = false
        await refreshMarkers()
        ElMessage.success('传感器添加成功')
      } catch (error) {
        ElMessage.error('添加传感器失败')
      }
    }

    // 刷新地图标记
    const refreshMarkers = async () => {
      // 清除现有标记
      markers.forEach(marker => map.removeOverlay(marker))
      markers = []

      // 重新加载传感器数据
      await store.dispatch('sensor/fetchSensors')
      const sensors = store.state.sensor.sensors

      // 添加新标记
      sensors.forEach(sensor => {
        if (sensor.longitude && sensor.latitude) {
          const point = new BMap.Point(sensor.longitude, sensor.latitude)
          const marker = addMarker(map, point, sensor)
          markers.push(marker)
        }
      })
    }

    // 修改原有的 addMarker 函数，添加右键菜单
    const addMarker = (map, point, data) => {
      const marker = new BMap.Marker(point, {
        enableDragging: true,  // 启用拖拽
        enableClicking: true
      })
      
      map.addOverlay(marker)

      // 添加拖拽结束事件
      marker.addEventListener('dragend', async (e) => {
        try {
          await store.dispatch('sensor/updateSensorLocation', {
            id: data.id,
            latitude: e.point.lat,
            longitude: e.point.lng
          })
          ElMessage.success('位置更新成功')
        } catch (error) {
          ElMessage.error('位置更新失败')
          // 恢复原位置
          marker.setPosition(point)
        }
      })

      // 添加右键菜单
      const menu = new BMap.ContextMenu()
      menu.addItem(new BMap.MenuItem('删除传感器', async function() {
        try {
          await store.dispatch('sensor/deleteSensor', data.id)
          map.removeOverlay(marker)
          ElMessage.success('传感器删除成功')
        } catch (error) {
          ElMessage.error('删除传感器失败')
        }
      }))
      
      marker.addContextMenu(menu)

      // 添加信息窗口
      const infoWindow = new BMap.InfoWindow(`
        <div>
          <h4>${data.name}</h4>
          <p>类型：${data.type}</p>
          <p>状态：${data.status ? '在线' : '离线'}</p>
          <p>经度：${data.longitude}</p>
          <p>纬度：${data.latitude}</p>
        </div>
      `)
      
      marker.addEventListener('click', () => {
        map.openInfoWindow(infoWindow, point)
      })

      return marker
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
      addSensorDialogVisible,
      newSensor,
      startAddSensor,
      confirmAddSensor,
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
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.map-controls .el-button {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.map-controls .el-button:hover {
  transform: scale(1.05);
  transition: transform 0.2s;
}
</style>
