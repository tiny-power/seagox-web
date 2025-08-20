<template>
    <el-dialog
        title="人员选择"
        width="750px"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        append-to-body
    >
        <el-row :gutter="20">
            <el-col :span="12">
                <el-row style="height: 400px; border: 1px solid #ccc; border-radius: 6px; padding-top: 10px">
                    <el-tree
                        :data="deptTreeData"
                        default-expand-all
                        :expand-on-click-node="false"
                        style="height: 100%; overflow: auto"
                        node-key="id"
                        ref="left"
                        @node-click="handleNodeClick"
                        :filter-node-method="filterNode"
                    >
                        <div slot-scope="{ node, data }">
                            <i
                                class="el-icon-folder-opened"
                                style="margin-right: 2px"
                                v-if="!node.isLeaf && node.expanded"
                            ></i>
                            <i
                                class="el-icon-folder"
                                style="margin-right: 2px"
                                v-if="!node.isLeaf && !node.expanded"
                            ></i>
                            <i class="el-icon-folder" style="margin-right: 2px" v-if="node.isLeaf && data.alias"></i>
                            <i
                                class="el-icon-document"
                                style="margin-right: 2px"
                                v-if="node.isLeaf && data.companyName"
                            ></i>
                            {{ data.label }}
                        </div>
                    </el-tree>
                </el-row>
            </el-col>
            <el-col :span="12" style="height: 400px; border: 1px solid #ccc; border-radius: 6px; padding: 0px">
                <el-table
                    :data="gridData"
                    :show-header="false"
                    height="400"
                    highlight-current-row
                    @row-dblclick="rowDblClick"
                >
                    <el-table-column property="name">
                        <template slot-scope="scope">
                            <div style="padding-left: 10px">{{ scope.row.name }}</div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
    </el-dialog>
</template>

<script>
export default {
    data() {
        return {
            dialogVisible: false,
            deptTreeData: [],
            gridData: [],
            field: '',
            companyId: ''
        }
    },
    created() {
        this.queryDepartment()
    },
    methods: {
        async queryDepartment() {
            let params = { isAll: false }
            let res = await this.$axios.get('company/queryAllAndDept', { params })
            if (res.data.code == 200) {
                this.deptTreeData = res.data.data
            }
        },
        showDialog(field) {
            this.field = field
            this.dialogVisible = true
        },
        handleNodeClick(data, node) {
            if (data.type === 'company') {
                //公司
                this.queryByCompanyId(data.id)
            } else if (data.type === 'department') {
                //部门
                this.queryByDeptId(data.id)
            }
        },
        async queryByDeptId(id) {
            let res = await this.$axios.get('user/queryByDeptId?deptId=' + id)
            if (res.data.code == 200) {
                this.gridData = res.data.data
            }
        },
        async queryByCompanyId(id) {
            let res = await this.$axios.get('user/queryUserByCompanyId?companyId=' + id)
            if (res.data.code == 200) {
                this.gridData = res.data.data
            }
        },
        rowDblClick(row, column, event) {
            this.dialogVisible = false
            this.$emit('confirm', this.field, String(row.id))
        },
        filterNode(value, data) {
            if (!value) return true
            return data.label.indexOf(value) !== -1
        }
    }
}
</script>
<style scoped>
::v-deep .el-dialog__body {
    padding: 10px 20px 15px 20px;
}
</style>
