<template>
    <div style="background: white; width: 100%">
        <el-table
            :data="tableData"
            max-height="560px"
            style="width: 100%"
            border
            row-key="id"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
            <el-table-column fixed align="center" label="序号" type="index" width="50"></el-table-column>
            <el-table-column align="center" label="任务名称" prop="name"></el-table-column>
            <el-table-column
                align="center"
                label="任务状态"
                prop="status"
                :formatter="formatterStatus"
            ></el-table-column>
            <el-table-column align="center" label="任务类型" prop="type" :formatter="formatterType"></el-table-column>
            <el-table-column align="center" label="负责人" prop="chargeName"></el-table-column>
            <el-table-column align="center" label="预计开始日期" prop="start_date"></el-table-column>
            <el-table-column align="center" label="预计结束日期" prop="end_date"></el-table-column>
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
                orderId: this.$router.currentRoute.query.id
            }
            let res = await this.$axios.get('cloud/task/queryByPage', { params })
            if (res.data.code == 200) {
                this.tableData = res.data.data
            }
        },
        formatterStatus(row) {
            if (row.status == 0) {
                return '未开始'
            } else if (row.status == 1) {
                return '进行中'
            } else if (row.status == 2) {
                return '已暂停'
            } else if (row.status == 3) {
                return '已完成'
            } else if (row.status == 4) {
                return '已取消'
            } else if (row.status == 5) {
                return '已关闭'
            } else {
                return '未知'
            }
        },
        formatterType(row) {
            if (row.type == 0) {
                return '设计'
            } else if (row.type == 1) {
                return '生产'
            } else {
                return '未知'
            }
        }
    }
}
</script>

<style scoped></style>
