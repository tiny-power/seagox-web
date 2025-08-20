<template>
    <div style="background: white; width: 100%"> 
        <el-table
            :data="tableData"
            max-height="560px"
            style="width: 100%"
            border
        >
            <el-table-column fixed align="center" label="序号" type="index" width="50"></el-table-column>
            <el-table-column align="center" label="入库类别" prop="category" :formatter="formatterCategory"></el-table-column>
            <el-table-column align="center" label="入库单号" prop="code"></el-table-column>
            <el-table-column align="center" label="负责人" prop="chargeName"></el-table-column>
            <el-table-column align="center" label="入库时间" prop="rksj"></el-table-column>
            <el-table-column align="center" label="备注" prop="remark"></el-table-column>
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
            let res = await this.$axios.get('cloud/inInventory/queryByOrderId', {params})
            if (res.data.code == 200) {
                this.tableData = res.data.data
            }
        },
        formatterCategory(row) {
            if(row.category == 0) {
                return '采购入库'
            } else if (row.category == 1) {
                return '质检入库'
            } else {
                return '未知'
            }
        }
    }
}
</script>

<style scoped>

</style>
