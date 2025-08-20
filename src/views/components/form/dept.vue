<template>
    <div>
        <el-dialog
            title="请选择部门"
            width="750px"
            append-to-body
            :visible.sync="formVisible"
            :close-on-click-modal="false"
        >
            <el-table
                :data="tableData"
                @row-dblclick="rowDblclick"
                border
                default-expand-all
                highlight-current-row
                row-key="id"
                style="z-index: 2000"
                max-height="480"
                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            >
                <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
                <el-table-column property="name" label="名称" align="center"></el-table-column>
            </el-table>
            <div slot="footer" class="dialog-footer"></div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            formVisible: false,
            tableData: [],
            field: ''
        }
    },
    created() {
        this.queryDeptData()
    },
    methods: {
        async queryDeptData() {
            let params = {
                searchCompanyId: localStorage.getItem('companyId')
            }
            let res = await this.$axios.get('department/queryByCompanyId', { params })
            if (res.data.code === 200) {
                this.tableData = res.data.data
            }
        },
        showDialog(field) {
            this.field = field
            this.formVisible = true
        },
        rowDblclick(row, column, event) {
            this.formVisible = false
            this.$emit('confirm', this.field, String(row.id))
        }
    }
}
</script>
<style scoped>
::v-deep .el-dialog__body {
    padding: 10px 20px;
}
</style>
