<template>
    <div style="display:inline-block;margin-left:15px;">
        <el-button type="text" size="small" icon="el-icon-plus" style="color: #000; font-weight: 400" @click="handleButton('in')">新增入库单</el-button>
        <el-button type="text" size="small" icon="el-icon-minus" style="color: #000; font-weight: 400" @click="handleButton('out')">新增出库单</el-button>
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
        handleButton(type) {
            if(type === 'in') {
                this.$router.push({
                    path: '/handleCustomForm',
                    query: {
                        formId: 18,
                        title: '入库单',
                        time: Date.now()
                    }
                })
            } else if (type === 'out') {
                this.$router.push({
                    path: '/handleCustomForm',
                    query: {
                        formId: 19,
                        title: ' 出库单',
                        time: Date.now()
                    }
                })
            }
        }
    }
}
</script>

<style scoped>

</style>
