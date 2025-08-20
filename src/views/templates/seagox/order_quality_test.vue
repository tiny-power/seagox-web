<template>
    <div style="background: white; width: 100%"> 
        <el-table
            :data="tableData"
            max-height="560px"
            style="width: 100%"
            border
        >
            <el-table-column fixed align="center" label="序号" type="index" width="50"></el-table-column>
            <el-table-column align="center" label="质检编号" prop="code"></el-table-column>
            <el-table-column align="center" label="质检来源" prop="source" :formatter="formatterSource"></el-table-column>
            <el-table-column align="center" label="任务名称" prop="taskName"></el-table-column>
            <el-table-column align="center" label="质检负责人" prop="chargeName"></el-table-column>
            <el-table-column align="center" label="质检时间" prop="zjsj"></el-table-column>
        </el-table>
    </div>
</template>

<script>
export default {
    data() {
        return {
            tableData: []
        }
    },
    created() {
        if (this.$router.currentRoute.query.id) {
            this.queryByPage()
        }
    },
    methods: {
        async queryByPage() {
            let params = {
                orderId: this.$router.currentRoute.query.id,
            }
            let res = await this.$axios.get('cloud/qualityTest/selectList', {params})
            if (res.data.code == 200) {
                this.tableData = res.data.data
            }
        },
        formatterSource(row) {
            if(row.source == 0) {
                return '生产'
            } else if (row.status == 1) {
                return '采购'
            } else {
                return '未知'
            }
        }
    }
}
</script>

<style scoped>

</style>
