<template>
  <div class="sensor-management">
    <el-card class="sensor-list">
      <template #header>
        <div class="card-header">
          <span>传感器管理</span>
          <el-button type="primary" size="small" @click="openDialog('add')">添加传感器</el-button>
        </div>
      </template>
      <el-table
        :data="sensors"
        style="width: 100%"
        height="400"
        border
        :default-sort="{ prop: 'id', order: 'ascending' }"
      >
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="latitude" label="纬度" />
        <el-table-column prop="longitude" label="经度" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'danger'">
              {{ scope.row.status ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button type="text" size="small" @click="openDialog('edit', scope.row)">编辑</el-button>
            <el-button type="text" size="small" @click="deleteSensor(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
      <el-form :model="currentSensor" label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="currentSensor.name" />
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="currentSensor.type" />
        </el-form-item>
        <el-form-item label="纬度">
          <el-input v-model="currentSensor.latitude" />
        </el-form-item>
        <el-form-item label="经度">
          <el-input v-model="currentSensor.longitude" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="currentSensor.status" active-text="在线" inactive-text="离线" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'SensorManagement',
  setup() {
    const store = useStore()
    const dialogVisible = ref(false)
    const dialogTitle = ref('')
    const currentSensor = ref({
      id: null,
      name: '',
      type: '',
      latitude: '',
      longitude: '',
      status: true
    })

    const openDialog = (action, sensor = null) => {
      if (action === 'add') {
        dialogTitle.value = '添加传感器'
        currentSensor.value = {
          id: null,
          name: '',
          type: '',
          latitude: '',
          longitude: '',
          status: true
        }
      } else if (action === 'edit') {
        dialogTitle.value = '编辑传感器'
        currentSensor.value = { ...sensor }
      }
      dialogVisible.value = true
    }

    const handleSave = async () => {
      if (currentSensor.value.id) {
        // 更新传感器
        await store.dispatch('sensor/updateSensor', currentSensor.value)
      } else {
        // 添加传感器
        await store.dispatch('sensor/addSensor', currentSensor.value)
      }
      dialogVisible.value = false
      await store.dispatch('sensor/fetchSensors')
    }

    const deleteSensor = async (id) => {
      await store.dispatch('sensor/deleteSensor', id)
      await store.dispatch('sensor/fetchSensors')
    }

    return {
      sensors: store.state.sensor.sensors,
      dialogVisible,
      dialogTitle,
      currentSensor,
      openDialog,
      handleSave,
      deleteSensor
    }
  }
}
</script>

<style scoped>
.sensor-management {
  padding: 20px;
}

.sensor-list {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 