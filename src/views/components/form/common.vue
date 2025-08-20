<template>
    <el-dialog
        title="人员选择"
        width="680px"
        top="5vh"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        append-to-body
    >
        <el-form :model="form" :rules="rules" ref="form">
            <el-form-item prop="name">
                <el-input v-model.trim="form.label" clearable placeholder="请输入节点名称"></el-input>
            </el-form-item>
            <el-form-item style="margin-top: -15px">
                <el-row>
                    <el-col :span="10">
                        <el-row style="height: 200px; border: 1px solid #ccc; padding-top: 10px" class="tree-container">
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
                        <el-row style="height: 200px; border: 1px solid #ccc; margin-top: 2px">
                            <el-table
                                :data="unCheckedGridData"
                                :show-header="false"
                                height="200px"
                                ref="unCheckedGrid"
                                @selection-change="handleUnCheckSelectionChange"
                            >
                                <el-table-column type="selection" width="55" align="center"></el-table-column>
                                <el-table-column property="name"></el-table-column>
                            </el-table>
                        </el-row>
                    </el-col>
                    <el-col :span="4" style="height: 400px; text-align: center; line-height: 200px">
                        <el-row>
                            <el-button type="primary" icon="el-icon-right" circle @click="handleRight"></el-button>
                            <br />
                            <el-button type="primary" icon="el-icon-back" circle @click="handleLeft"></el-button>
                        </el-row>
                    </el-col>
                    <el-col :span="10" style="height: 400px; border: 1px solid #ccc">
                        <el-table
                            :data="checkedGridData"
                            :show-header="false"
                            height="400"
                            highlight-current-row
                            ref="checkedGrid"
                            @selection-change="handleCheckSelectionChange"
                        >
                            <el-table-column type="selection" width="55" align="center"></el-table-column>
                            <el-table-column property="name"></el-table-column>
                        </el-table>
                    </el-col>
                </el-row>
            </el-form-item>
            <el-form-item v-if="form.type === 'userTask'" style="margin-top: -20px">
                <div>多人审批时采用的审批方式</div>
                <el-radio-group v-model="form.way">
                    <el-radio :label="1">或签(一名审批人同意或拒绝即可)</el-radio>
                    <el-radio :label="2">会签(须所有人同意)</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
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
            currentNode: null,
            form: {
                name: ''
            },
            rules: {}
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
        showDialog(value) {
            this.unCheckedGridData = []
            this.checkedGridData = value.value || []
            this.dialogVisible = true
            this.form = value
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
            this.$set(this.form, 'value', this.checkedGridData)
            this.$emit('confirm', this.form)
            this.dialogVisible = false
        }
    }
}
</script>
<style scoped>
::v-deep .el-dialog__footer {
    margin-top: -45px;
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
