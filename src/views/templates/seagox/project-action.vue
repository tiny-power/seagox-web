<template>
    <div style="display:inline-block;">
        <el-button type="text" size="small" @click="handleButtom('start')" v-if="row.status == 0">开始</el-button>
        <el-button type="text" size="small" @click="handleButtom('suspend')" v-if="row.status == 0 || row.status == 1">挂起</el-button>
        <el-button type="text" size="small" @click="handleButtom('activate')" v-if="row.status == 2 || row.status == 3">激活</el-button>
        <el-button type="text" size="small" @click="handleButtom('close')" v-if="row.status == 0 || row.status == 2 || row.status == 1">关闭</el-button>
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
            } else if (type === 'suspend') {
                params.status = 2
            } else if (type === 'activate') {
                params.status = 1
            } else if (type === 'close') {
                params.status = 3
            }
            this.$axios.post('cloud/project/changeStatusById', params).then(res => {
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
