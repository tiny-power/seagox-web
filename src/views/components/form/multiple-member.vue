<template>
    <el-dialog
        title="人员选择"
        width="750px"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        append-to-body
    >
        <el-row :gutter="10">
            <el-col :span="11">
                <el-row style="height: 245px; border: 1px solid #ccc; border-radius: 6px; padding-top: 10px">
                    <el-tree
                        :data="deptTreeData"
                        default-expand-all
                        @node-click="handleNodeClick"
                        :expand-on-click-node="false"
                        style="height: 100%; overflow: auto"
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
                <el-row style="height: 245px; border: 1px solid #ccc; border-radius: 6px; margin-top: 8px">
                    <el-table
                        :data="unCheckedGridData"
                        :show-header="false"
                        height="245"
                        ref="unCheckedGrid"
                        @selection-change="handleUnCheckSelectionChange"
                    >
                        <el-table-column type="selection" width="55" align="center"></el-table-column>
                        <el-table-column property="name"></el-table-column>
                    </el-table>
                </el-row>
            </el-col>
            <el-col :span="2" style="height: 400px; text-align: center; line-height: 200px">
                <el-row>
                    <el-button type="primary" icon="el-icon-right" circle @click="handleRight"></el-button>
                    <br />
                    <el-button type="primary" icon="el-icon-back" circle @click="handleLeft"></el-button>
                </el-row>
            </el-col>
            <el-col :span="11" style="height: 500px; border: 1px solid #ccc; border-radius: 6px; padding: 0px">
                <el-table
                    :data="checkedGridData"
                    height="500"
                    highlight-current-row
                    ref="checkedGrid"
                    @selection-change="handleCheckSelectionChange"
                >
                    <div slot="empty"><el-empty description="请从左边选择数据"></el-empty></div>
                    <el-table-column type="selection" width="55" align="center"></el-table-column>
                    <el-table-column property="name" label="姓名"></el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="handleDetermine">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>
export default {
    data() {
        return {
            dialogVisible: false,
            deptTreeData: [],
            unCheckedGridData: [],
            checkedGridData: [],
            unCheckedMultipleSelection: [],
            checkedMultipleSelection: [],
            field: ''
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
        async queryByDeptId(id) {
            let res = await this.$axios.get('user/queryByDeptId?deptId=' + id)
            if (res.data.code == 200) {
                this.unCheckedGridData = res.data.data
            }
        },
        async queryByCompanyId(id) {
            let res = await this.$axios.get('user/queryUserByCompanyId?companyId=' + id)
            if (res.data.code == 200) {
                this.unCheckedGridData = res.data.data
            }
        },
        showDialog(field, value, dataSource) {
            this.field = field
            this.unCheckedGridData = []
            this.dialogVisible = true
            this.$nextTick(() => {
                if (value.length > 0) {
                    let checkedGridData = []
                    for (let i = 0; i < dataSource.length; i++) {
                        let result = value.find(item => item == dataSource[i].id)
                        if (result) {
                            checkedGridData.push({
                                id: dataSource[i].id,
                                name: dataSource[i].label
                            })
                        }
                    }
                    this.checkedGridData = checkedGridData
                }
            })
        },
        handleNodeClick(data, node) {
            this.unCheckedGridData = []
            if (data.type === 'company') {
                //公司
                this.queryByCompanyId(data.id)
            } else if (data.type === 'department') {
                //部门
                this.queryByDeptId(data.id)
            }
        },
        handleUnCheckSelectionChange(val) {
            this.unCheckedMultipleSelection = val
        },
        handleCheckSelectionChange(val) {
            this.checkedMultipleSelection = val
        },
        handleLeft() {
            for (var i = 0; i < this.checkedMultipleSelection.length; i++) {
                for (let j = 0; j < this.checkedGridData.length; j++) {
                    if (this.checkedMultipleSelection[i].id == this.checkedGridData[j].id) {
                        this.checkedGridData.splice(j, 1)
                        break
                    }
                }
            }
        },
        handleRight() {
            for (let i = 0; i < this.unCheckedMultipleSelection.length; i++) {
                let node = this.unCheckedMultipleSelection[i]
                let flag = true
                for (let j = 0; j < this.checkedGridData.length; j++) {
                    if (node.id == this.checkedGridData[j].id) {
                        flag = false
                        break
                    }
                }
                if (flag) {
                    this.checkedGridData.push(node)
                }
            }
        },
        handleDetermine() {
            let result = []
            for (let j = 0; j < this.checkedGridData.length; j++) {
                result.push(String(this.checkedGridData[j].id))
            }
            this.$emit('confirm', this.field, result)
            this.dialogVisible = false
        }
    }
}
</script>
<style scoped>
::v-deep .el-dialog__body {
    padding: 10px 20px 15px 20px;
}
</style>
