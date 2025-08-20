<template>
    <div>
        <div style="background: #fff; font-size: 18px; text-align: left; padding: 5px">上次申请</div>
        <el-table :data="tableData" stripe border>
            <el-table-column fixed align="center" label="序号" type="index" width="50"></el-table-column>
            <el-table-column prop="goods" label="物品名称" align="center"> </el-table-column>
            <el-table-column prop="quantity" label="数量" align="center"> </el-table-column>
            <el-table-column prop="unit" label="单位" align="center" :formatter="formatterUnit"> </el-table-column>
            <el-table-column prop="remark" label="备注" align="center"> </el-table-column>
        </el-table>
    </div>
</template>

<script>
export default {
    data() {
        return {
            tableData: [],
            unitMap: {}
        }
    },
    created() {
        this.querydicDetail()
        if (this.$router.currentRoute.query.id) {
            this.queryLastTime(this.$parent.formModel.dept_name)
        }
    },
    methods: {
        async querydicDetail() {
            let params = {
                name: '单位'
            }
            let res = await this.$axios.get('dicClassify/queryByName', { params })
            if (res.data.code === 200) {
                let unitMap = {}
                for (let i = 0; i < res.data.data.length; i++) {
                    let item = res.data.data[i]
                    unitMap[item.code] = item.name
                }
                this.unitMap = unitMap
            }
        },
        async queryLastTime(deptName) {
            let params = {
                id: this.$router.currentRoute.query.id,
                deptName: deptName
            }
            let res = await this.$axios.get('cloud/outbill/queryLastTime', { params })
            if (res.data.code === 200) {
                this.tableData = res.data.data
            }
        },
        formatterUnit(data) {
            return this.unitMap[data.unit]
        }
    }
}
</script>

<style scoped></style>
