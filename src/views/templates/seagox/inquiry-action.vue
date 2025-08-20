<template>
    <div style="display:inline-block;">
        <el-button type="text" size="small" @click="handleButton">转为销售订单</el-button>
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
        handleButton() {
            this.$router.push({
                path: '/handleCustomForm',
                query: {
                    inquiryId: this.row.id,
                    formId: 4,
                    title: '销售订单',
                    time: Date.now()
                }
            })
        }
    }
}
</script>

<style scoped>

</style>
