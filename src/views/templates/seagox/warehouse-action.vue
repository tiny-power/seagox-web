<template>
    <div style="display:inline-block;">
        <el-button type="text" size="small" @click="handleSubmit" v-if="row.orderProductStatus == 0">入库</el-button>
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
        handleSubmit() {
            let params = {
                id: this.row.orderProductId
            }
            this.$axios.post('cloud/order/changeProductStatusById', params).then(res => {
                if (res.data.code == 200) {
                    this.$message.success('入库成功')
                    this.row.orderProductStatus = 1
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
