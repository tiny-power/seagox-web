<template>
    <el-dialog
        title="单位选择"
        width="750px"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        append-to-body
    >
        <el-row :gutter="10">
            <el-col :span="11">
                <el-row style="height: 400px; border: 1px solid #ccc; border-radius: 6px; padding-top: 10px">
                    <el-tree
                        :data="companyTreeData"
                        default-expand-all
                        :expand-on-click-node="false"
                        style="height: 100%; overflow: auto"
                        show-checkbox
                        node-key="id"
                        @check-change="handleCheckChange"
                        :filter-node-method="filterNode"
                        ref="left"
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
            <el-col :span="2" style="height: 400px; text-align: center; line-height: 200px">
                <el-row>
                    <el-button
                        type="primary"
                        icon="el-icon-right"
                        circle
                        @click="handleRight"
                        :disabled="rightDisabled"
                    ></el-button>
                    <br />
                    <el-button
                        type="primary"
                        icon="el-icon-back"
                        circle
                        @click="handleLeft"
                        :disabled="leftDisabled"
                    ></el-button>
                </el-row>
            </el-col>
            <el-col :span="11" style="height: 400px; border: 1px solid #ccc; border-radius: 6px; padding: 0px">
                <el-table
                    :data="checkedGridData"
                    height="400"
                    highlight-current-row
                    @selection-change="handleSelectionChange"
                >
                    <div slot="empty"><el-empty description="请从左边选择数据"></el-empty></div>
                    <el-table-column type="selection" width="55" align="center"></el-table-column>
                    <el-table-column property="name" label="公司名称"></el-table-column>
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
            companyTreeData: [],
            checkedGridData: [],
            rightDisabled: true,
            leftDisabled: true,
            multipleSelection: [],
            field: ''
        }
    },
    created() {
        // this.queryCompany()
    },
    methods: {
        // async queryCompany() {
        //     let res = await this.$axios.get('company/queryAllNoTree')
        //     if (res.data.code == 200) {
        //         this.companyTreeData = res.data.data
        //     }
        // },
        showDialog(field, value) {
            this.field = field
            this.dialogVisible = true
            this.$nextTick(() => {
                this.$refs.left.setCheckedKeys(value)
                this.checkedGridData = this.$refs.left.getCheckedNodes()
            })
        },
        handleCheckChange(data, checked, indeterminate) {
            if (this.$refs.left.getCheckedKeys().length > 0) {
                this.rightDisabled = false
            } else {
                this.rightDisabled = true
            }
        },
        handleRight() {
            let checkedNodes = this.$refs.left.getCheckedNodes()
            for (let i = 0; i < checkedNodes.length; i++) {
                let node = checkedNodes[i]
                if (node.id) {
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
            }
        },
        handleSelectionChange(val) {
            this.multipleSelection = val
            if (val.length > 0) {
                this.leftDisabled = false
            } else {
                this.leftDisabled = true
            }
        },
        handleLeft() {
            for (let i = 0; i < this.multipleSelection.length; i++) {
                let selectNode = this.multipleSelection[i]
                for (let j = 0; j < this.checkedGridData.length; j++) {
                    if (selectNode.id == this.checkedGridData[j].id) {
                        this.checkedGridData.splice(j, 1)
                        break
                    }
                }
            }
            this.$refs.left.setCheckedNodes(this.checkedGridData)
        },
        handleDetermine() {
            let result = []
            for (let j = 0; j < this.checkedGridData.length; j++) {
                result.push(String(this.checkedGridData[j].id))
            }
            this.$emit('confirm', this.field, result)
            this.dialogVisible = false
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
    padding: 10px 20px;
}
</style>
