<template>
    <el-dialog title="请选择" width="680px" :visible.sync="dialogVisible" :close-on-click-modal="false" append-to-body>
        <el-row style="margin-top: 10px">
            <el-col :span="11">
                <el-row
                    style="height: 223px; border: 1px solid #ccc; border-radius: 4px; padding-top: 10px"
                    class="tree-container"
                >
                    <el-tree
                        ref="tree"
                        class="tree"
                        :data="deptTreeData"
                        default-expand-all
                        @node-click="handleNodeClick"
                        :expand-on-click-node="false"
                        style="height: 100%; overflow: auto"
                        :indent="0"
                        highlight-current
                    >
                        <span class="custom-tree-node" slot-scope="{ node, data }">
                            <i
                                class="el-icon-folder-opened"
                                style="margin-right: 2px; color: #e6a23c"
                                v-if="!node.isLeaf && node.expanded"
                            ></i>
                            <i
                                class="el-icon-folder"
                                style="margin-right: 2px; color: #e6a23c"
                                v-if="!node.isLeaf && !node.expanded"
                            ></i>
                            <i
                                class="el-icon-folder"
                                style="margin-right: 2px; color: #e6a23c"
                                v-if="node.isLeaf && data.alias"
                            ></i>
                            <i
                                class="el-icon-document"
                                style="margin-left: 6px; margin-right: 2px; color: #e6a23c"
                                v-if="node.isLeaf && data.companyName"
                            ></i>
                            {{ data.label }}
                        </span>
                    </el-tree>
                </el-row>
                <el-row style="height: 223px; border: 1px solid #ccc; border-radius: 4px; margin-top: 4px">
                    <el-table
                        :data="unCheckedGridData"
                        :show-header="false"
                        height="223px"
                        ref="unCheckedGrid"
                        @selection-change="handleUnCheckSelectionChange"
                    >
                        <el-table-column type="selection" width="55" align="center"></el-table-column>
                        <el-table-column property="name"></el-table-column>
                    </el-table>
                </el-row>
            </el-col>
            <el-col :span="2" style="height: 450px; text-align: center; line-height: 225px">
                <el-row>
                    <el-button type="primary" size="small" icon="el-icon-right" circle @click="handleRight"></el-button>
                    <br />
                    <el-button type="primary" size="small" icon="el-icon-back" circle @click="handleLeft"></el-button>
                </el-row>
            </el-col>
            <el-col :span="11" style="height: 450; border: 1px solid #ccc; border-radius: 4px">
                <el-table
                    :data="checkedGridData"
                    :show-header="false"
                    height="450"
                    highlight-current-row
                    ref="checkedGrid"
                    @selection-change="handleCheckSelectionChange"
                >
                    <el-table-column type="selection" width="55" align="center"></el-table-column>
                    <el-table-column property="name"></el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <div slot="footer" style="display: flex; align-items: center">
            <div style="width: 220px; text-align: left">
                <el-radio-group v-model="flowType">
                    <el-radio :label="1">并发</el-radio>
                    <el-radio :label="0">串发</el-radio>
                    <el-radio :label="2" v-if="isCountersignature">会签</el-radio>
                </el-radio-group>
            </div>
            <div class="dialog-footer" style="flex: 1">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleDetermine">确 定</el-button>
            </div>
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
            currentNode: null,
            flowType: 1,
            isCountersignature: false
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
        showDialog(value, isCountersignature) {
            this.isCountersignature = isCountersignature
            this.flowType = 1
            this.unCheckedGridData = []
            this.checkedGridData = JSON.parse(JSON.stringify(value))
            this.dialogVisible = true
        },
        handleNodeClick(data, node) {
            this.currentNode = data
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
                    if (this.checkedMultipleSelection[i].value == this.checkedGridData[j].value) {
                        this.checkedGridData.splice(j, 1)
                        break
                    }
                }
            }
        },
        handleRight() {
            if (this.unCheckedMultipleSelection.length == 0) {
                if (this.currentNode) {
                    if (this.currentNode.type === 'company') {
                        //公司
                        let flag = true
                        for (let j = 0; j < this.checkedGridData.length; j++) {
                            if (
                                this.currentNode.value == this.checkedGridData[j].value &&
                                this.checkedGridData[j].type === 'company'
                            ) {
                                flag = false
                                break
                            }
                        }
                        if (flag) {
                            this.checkedGridData.push({
                                type: 'company',
                                name: this.currentNode.name,
                                value: this.currentNode.value
                            })
                        }
                    } else if (this.currentNode.type === 'department') {
                        //部门
                        let flag = true
                        for (let j = 0; j < this.checkedGridData.length; j++) {
                            if (
                                this.currentNode.value == this.checkedGridData[j].value &&
                                this.checkedGridData[j].type === 'department'
                            ) {
                                flag = false
                                break
                            }
                        }
                        if (flag) {
                            this.checkedGridData.push({
                                type: 'department',
                                name: this.currentNode.name,
                                value: this.currentNode.value
                            })
                        }
                    }
                }
            } else {
                for (let i = 0; i < this.unCheckedMultipleSelection.length; i++) {
                    let node = this.unCheckedMultipleSelection[i]
                    let flag = true
                    for (let j = 0; j < this.checkedGridData.length; j++) {
                        if (node.id == this.checkedGridData[j].value && this.checkedGridData[j].type === 'user') {
                            flag = false
                            break
                        }
                    }
                    if (flag) {
                        this.checkedGridData.push({
                            type: 'user',
                            name: node.name,
                            value: node.id,
                            companyId: node.companyId
                        })
                    }
                }
            }
        },
        handleDetermine() {
            if (this.checkedGridData.length <= 0) {
                this.$message.error('您没有选择用户')
                return
            }
            this.$emit('confirm', this.flowType, this.checkedGridData)
            this.dialogVisible = false
        }
    }
}
</script>
<style scoped>
::v-deep .el-dialog__body {
    padding: 0px 20px;
}
.tree /deep/ .el-tree-node {
    position: relative;
    padding-left: 16px;
}

.tree /deep/ .el-tree-node__children {
    padding-left: 16px;
}

.tree /deep/ .el-tree-node :last-child:before {
    height: 38px;
}

.tree /deep/ .el-tree > .el-tree-node:before {
    border-left: none;
}

.tree-container /deep/ .el-tree > .el-tree-node:after {
    border-top: none;
}

.tree /deep/ .el-tree-node:before {
    content: '';
    left: -4px;
    position: absolute;
    right: auto;
    border-width: 1px;
}

.tree /deep/ .el-tree-node:after {
    content: '';
    left: -4px;
    position: absolute;
    right: auto;
    border-width: 1px;
}
.tree /deep/ .el-tree-node__expand-icon.is-leaf {
    display: none;
}

.tree /deep/ .el-tree-node:before {
    border-left: 1px dashed #b8b9bb;
    bottom: 0px;
    height: 100%;
    top: -26px;
    width: 1px;
}

.tree /deep/ .el-tree-node:after {
    border-top: 1px dashed #b8b9bb;
    height: 20px;
    top: 12px;
    width: 24px;
}
</style>
