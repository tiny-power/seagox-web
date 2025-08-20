<template>
    <div style="display:inline-block;">
        <el-button type="text" size="small" @click="handleButtom('start')" v-if="row.status == 0 || row.status == 2">开始</el-button>
        <el-button type="text" size="small" @click="handleButtom('close')" v-if="row.status == 3 || row.status == 4">关闭</el-button>
        <el-button type="text" size="small" @click="handleButtom('complete')" v-if="row.status == 0 || row.status == 1 || row.status == 2">完成</el-button>
        <el-button type="text" size="small" @click="handleButtom('activate')" v-if="row.status == 5">激活</el-button>
        <el-button type="text" size="small" @click="handleButtom('stop')" v-if="row.status == 1">暂停</el-button>
    </div>
</template>

<script>
export default {
    props: {
        row: {
            type: Object
        }
    },
    data() {
        return {
            
        }
    },
    methods: {
        handleButtom(type) {
            let params = {
                id: this.row.id
            }
            if(type === 'start') {
                params.status = 1
            } else if (type === 'complete') {
                params.status = 3
            } else if (type === 'close') {
                params.status = 5
            } else if (type === 'activate') {
                params.status = 1
            } else if (type === 'stop') {
                params.status = 2
            }
            this.$axios.post('cloud/project/changeTaskStatusById', params).then(res => {
                if (res.data.code == 200) {
                    this.$message.success('操作成功')
                    this.row.status = params.status
                } else {
                    this.$message.error(res.data.message)
                }
            })
        }
    }
}
</script>

<style scoped>

</style>
