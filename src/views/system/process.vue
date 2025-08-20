<template>
    <el-table :data="processData" :span-method="objectSpanMethod" border stripe :height="height-220">
        <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
        <el-table-column prop="label" label="节点名称" align="center"></el-table-column>
        <el-table-column prop="nodeStatus" label="节点状态" align="center" :formatter="typeFormat"></el-table-column>
        <el-table-column prop="name" label="执行人" align="center"></el-table-column>
        <el-table-column prop="remark" label="审批意见" align="center"></el-table-column>
        <el-table-column prop="status" label="状态" align="center" :formatter="statusFormat"></el-table-column>
        <el-table-column prop="startTime" label="接收时间" align="center" width="150"></el-table-column>
        <el-table-column prop="endTime" label="审核时间" align="center" width="150"></el-table-column>
        <el-table-column prop="consuming" label="耗时(分钟)" align="center"></el-table-column>
    </el-table>
</template>
<script>
export default {
    data() {
        return {
            height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
            processData: [],
            spanArr: [],
            colFields: ['index', 'label', 'nodeStatus', 'name', 'remark', 'status', 'startTime', 'endTime', 'consuming']
        }
    },
    created() {
        this.queryProcessInfo()
    },
    methods: {
        async queryProcessInfo() {
            var params = {
                businessType: this.$route.query.formId,
                businessKey: this.$route.query.id
            }
            let res = await this.$axios.post('flow/processInfo', params)
            if (res.data.code === 200) {
                this.processData = res.data.data
                this.getSpanArr()
            }
        },
        getSpanArr() {
            for (let i = 0; i < this.processData.length; i++) {
                let row = i
                if (row === 0) {
                    for (let j = 0; j < this.colFields.length; j++) {
                        this.spanArr[i * this.colFields.length + j] = {
                            rowspan: 1,
                            colspan: 1
                        }
                    }
                } else {
                    for (let j = 0; j < this.colFields.length; j++) {
                        if (this.processData[row][this.colFields[j]] === this.processData[row - 1][this.colFields[j]]) {
                            let beforeItem = this.spanArr[(row - 1) * this.colFields.length + j]
                            this.spanArr[row * this.colFields.length + j] = {
                                rowspan: 1 + beforeItem.rowspan,
                                colspan: 1
                            }
                            beforeItem.rowspan = 0
                            beforeItem.colspan = 0
                        } else {
                            this.spanArr[row * this.colFields.length + j] = {
                                rowspan: 1,
                                colspan: 1
                            }
                        }
                    }
                }
            }
            let stack = []
            for (let i = 0; i < this.colFields.length; i++) {
                for (let j = 0; j < this.processData.length; j++) {
                    if (j === 0) {
                        if (this.spanArr[j * this.colFields.length + i].rowspan === 0) {
                            stack.push(this.spanArr[j * this.colFields.length + i])
                        }
                    } else {
                        if (this.spanArr[j * this.colFields.length + i].rowspan === 0) {
                            stack.push(this.spanArr[j * this.colFields.length + i])
                        } else {
                            stack.push(this.spanArr[j * this.colFields.length + i])
                            while (stack.length > 0) {
                                let pop = stack.pop()
                                let len = stack.length
                                this.spanArr[(j - len) * this.colFields.length + i] = pop
                            }
                        }
                    }
                }
            }
        },
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 1) {
                return this.spanArr[rowIndex * this.colFields.length + columnIndex]
            }
            if (columnIndex === 2) {
                return this.spanArr[rowIndex * this.colFields.length + columnIndex]
            }
        },
        typeFormat(row) {
            // 状态(0:活动;1:通过;2:不通过;3:完成;4:终止;)
            if (row.nodeStatus === 0) {
                return '待办'
            } else if (row.nodeStatus === 1) {
                return '通过'
            } else if (row.nodeStatus === 2) {
                return '不通过'
            } else if (row.nodeStatus === 3) {
                return '完成'
            } else if (row.nodeStatus === 4) {
                return '终止'
            }
            return '未知'
        },
        statusFormat(row) {
            // 状态(0:待办;1:同意;2:拒绝;3:已阅;4:撤回;5:挂起;6:激活;)
            if (row.status === 0) {
                return '待办'
            } else if (row.status === 1) {
                return '同意'
            } else if (row.status === 2) {
                return '拒绝'
            } else if (row.status === 3) {
                return '已阅'
            } else if (row.status === 4) {
                return '撤回'
            } else if (row.status === 5) {
                return '挂起'
            } else if (row.status === 6) {
                return '激活'
            }
            return '未知'
        }
    }
}
</script>
<style scoped></style>
