<template>
    <div>
        <div class="toolView">
            <el-button type="text" icon="el-icon-plus" @click="showAddDialog" size="small" v-permission="'role:add'"
                >新增</el-button
            >
        </div>
        <div class="table">
            <!--列表-->
            <el-table :data="tableData" border highlight-current-row stripe :height="clientHeight - 185">
                <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
                <el-table-column prop="name" label="名称" align="center"></el-table-column>
                <el-table-column prop="createTime" label="创建时间" align="center"></el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-button
                            type="text"
                            size="small"
                            @click="showEditDialog(scope.row)"
                            v-permission="'role:edit'"
                            >编辑</el-button
                        >
                        <el-divider direction="vertical"></el-divider>
                        <el-button
                            type="text"
                            size="small"
                            @click="deleteSubmit(scope.row)"
                            v-permission="'role:delete'"
                            >删除</el-button
                        >
                        <el-divider direction="vertical"></el-divider>
                        <el-button
                            type="text"
                            size="small"
                            @click="handleMemberDialog(scope.row)"
                            v-permission="'role:authorize'"
                            >授权</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>
            <!--分页-->
            <div class="pagination">
                <el-pagination
                    background
                    @current-change="handleCurrentChange"
                    layout="total, prev, pager, next"
                    :current-page.sync="pageNo"
                    :total="total"
                >
                </el-pagination>
            </div>
        </div>
        <!--新增界面-->
        <el-dialog title="新增" width="550px" :visible.sync="addFormVisible" :close-on-click-modal="false">
            <el-form :model="addForm" label-width="60px" :rules="formRules" ref="addForm">
                <el-form-item label="名称" prop="name">
                    <el-input v-model.trim="addForm.name" clearable placeholder="请输入名称"></el-input>
                </el-form-item>
                <el-form-item label="菜单" prop="path" style="max-height: 400px; overflow: auto">
                    <el-tabs v-model="activeName" @tab-click="handleTabClick">
                        <el-tab-pane label="PC端" name="pc">
                            <el-tree
                                ref="pcTree"
                                :data="pcMenuData"
                                show-checkbox
                                node-key="id"
                                style="margin-top: 15px"
                                check-strictly
                                @check="handleCheck"
                            >
                                <div slot-scope="{ node, data }">
                                    {{ data.name }}
                                </div>
                            </el-tree>
                        </el-tab-pane>
                        <el-tab-pane label="移动端" name="mobile">
                            <el-tree
                                ref="mobileTree"
                                :data="mobileMenuData"
                                show-checkbox
                                node-key="id"
                                style="margin-top: 15px"
                                check-strictly
                                @check="handleCheck"
                            >
                                <div slot-scope="{ node, data }">
                                    {{ data.name }}
                                </div>
                            </el-tree>
                        </el-tab-pane>
                    </el-tabs>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click="addSubmit">提交</el-button>
            </div>
        </el-dialog>
        <!--编辑界面-->
        <el-dialog title="编辑" width="550px" :visible.sync="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="60px" :rules="formRules" ref="editForm">
                <el-form-item label="名称" prop="name">
                    <el-input v-model.trim="editForm.name" clearable placeholder="请输入名称"></el-input>
                </el-form-item>
                <el-form-item label="菜单" prop="path" style="max-height: 400px; overflow: auto">
                    <el-tabs v-model="activeName" @tab-click="handleTabClick">
                        <el-tab-pane label="PC端" name="pc">
                            <el-tree
                                ref="pcTree"
                                :data="pcMenuData"
                                show-checkbox
                                node-key="id"
                                style="margin-top: 15px"
                                check-strictly
                                @check="handleCheck"
                            >
                                <div slot-scope="{ node, data }">
                                    {{ data.name }}
                                </div>
                            </el-tree>
                        </el-tab-pane>
                        <el-tab-pane label="移动端" name="mobile">
                            <el-tree
                                ref="mobileTree"
                                :data="mobileMenuData"
                                show-checkbox
                                node-key="id"
                                style="margin-top: 15px"
                                check-strictly
                                @check="handleCheck"
                            >
                                <div slot-scope="{ node, data }">
                                    {{ data.name }}
                                </div>
                            </el-tree>
                        </el-tab-pane>
                    </el-tabs>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click="editSubmit">提交</el-button>
            </div>
        </el-dialog>
        <el-dialog
            title="人员选择"
            v-loading="loading"
            width="750px"
            :visible.sync="dialogVisible"
            :close-on-click-modal="false"
            append-to-body
        >
            <el-row>
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
                                <i
                                    class="el-icon-folder"
                                    style="margin-right: 2px"
                                    v-if="node.isLeaf && data.alias"
                                ></i>
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
                <el-col :span="11" style="height: 500px; border: 1px solid #ccc; border-radius: 6px">
                    <el-table
                        :data="checkedGridData"
                        :show-header="false"
                        height="500"
                        highlight-current-row
                        ref="checkedGrid"
                        @selection-change="handleCheckSelectionChange"
                    >
                        <el-table-column type="selection" width="55" align="center"></el-table-column>
                        <el-table-column property="name"></el-table-column>
                    </el-table>
                </el-col>
            </el-row>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleDetermine">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            clientHeight: document.documentElement.clientHeight || document.body.clientHeight,
            tableData: [],
            pageNo: 1,
            total: 0,
            addFormVisible: false,
            addForm: {
                name: '',
                path: ''
            },
            loading: false,
            editFormVisible: false,
            editForm: {
                id: '',
                name: '',
                path: ''
            },
            formRules: {
                name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
                path: [{ required: true, message: '请选择菜单权限', trigger: 'blur' }]
            },
            pcMenuData: [],
            mobileMenuData: [],
            dialogVisible: false,
            deptTreeData: [],
            unCheckedGridData: [],
            checkedGridData: [],
            unCheckedMultipleSelection: [],
            checkedMultipleSelection: [],
            type: '',
            field: '',
            memberPptions: [],
            roleId: '',
            activeName: 'pc',
            pcTreeArray: [],
            mobileTreeArray: []
        }
    },
    mounted() {
        this.queryByPage()
        this.queryPcMenu()
        this.queryMobileMenu()
        this.queryDepartment()
        this.queryMember()
    },
    methods: {
        async queryPcMenu() {
            let params = {
                classify: 1,
                status: 1
            }
            let res = await this.$axios.get('menu/queryByCompanyId', { params })
            if (res.data.code == 200) {
                this.pcMenuData = res.data.data
            }
        },
        async queryMobileMenu() {
            let params = {
                classify: 2,
                status: 1
            }
            let res = await this.$axios.get('menu/queryByCompanyId', { params })
            if (res.data.code == 200) {
                this.mobileMenuData = res.data.data
            }
        },
        // 成员数据
        async queryMember() {
            let res = await this.$axios.get('form/queryDynamic?path=member&type=list')
            if (res.data.code === 200) {
                var options = []
                for (var i = 0; i < res.data.data.length; i++) {
                    options.push({
                        id: res.data.data[i].id,
                        label: res.data.data[i].name,
                        value: String(res.data.data[i].id)
                    })
                }
                this.memberPptions = options
            }
        },
        handleMemberDialog(row) {
            this.roleId = row.id
            const params = {
                roleId: row.id
            }
            this.$axios.get('user/queryUserIdByRoleId', { params }).then(res => {
                if (res.data.code == 200) {
                    this.showDialog('default', 'toUserIds', this.memberPptions, res.data.data)
                } else {
                    this.$message.error(res.data.message)
                }
            })
        },
        queryByPage() {
            const params = {
                pageNo: this.pageNo
            }
            this.$axios.get('role/queryByPage', { params }).then(res => {
                if (res.data.code == 200) {
                    this.tableData = res.data.data.list
                    this.total = res.data.data.total
                }
            })
        },
        // 翻页
        handleCurrentChange(val) {
            this.queryByPage()
        },
        //显示新增界面
        showAddDialog() {
            this.addFormVisible = true
            if (this.$refs.addForm) {
                this.$refs.addForm.resetFields()
            }
            this.$nextTick(() => {
                this.$refs.pcTree.setCheckedKeys([])
            })
        },
        //新增
        addSubmit() {
            let pcTreeArray = this.pcTreeArray
            let mobileTreeArray = this.mobileTreeArray
            if (this.activeName === 'pc') {
                pcTreeArray = this.$refs.pcTree.getCheckedKeys()
            } else if (this.activeName === 'mobile') {
                mobileTreeArray = this.$refs.mobileTree.getCheckedKeys()
            }
            this.addForm.path = pcTreeArray.concat(mobileTreeArray).toString()
            this.$refs.addForm.validate(valid => {
                if (valid) {
                    this.$axios.post('role/insert', this.addForm).then(res => {
                        if (res.data.code == 200) {
                            this.$message.success('新增成功')
                            this.addFormVisible = false
                            this.queryByPage()
                        } else {
                            this.$message.error(res.data.message)
                        }
                    })
                }
            })
        },
        //显示编辑界面
        showEditDialog(row) {
            this.editForm = Object.assign({}, row)
            this.editFormVisible = true
            if (this.$refs.editForm) {
                this.$refs.editForm.resetFields()
            }
            this.$nextTick(() => {
                let checkedArr = this.editForm.path.split(',')
                this.$refs.pcTree.setCheckedKeys([])
                checkedArr.forEach(value => {
                    this.$refs.pcTree.setChecked(value, true, false)
                })
                this.$refs.mobileTree.setCheckedKeys([])
                checkedArr.forEach(value => {
                    this.$refs.mobileTree.setChecked(value, true, false)
                })
            })
        },
        //编辑
        editSubmit() {
            let pcTreeArray = this.pcTreeArray
            let mobileTreeArray = this.mobileTreeArray
            if (this.activeName === 'pc') {
                pcTreeArray = this.$refs.pcTree.getCheckedKeys()
            } else if (this.activeName === 'mobile') {
                mobileTreeArray = this.$refs.mobileTree.getCheckedKeys()
            }
            this.editForm.path = pcTreeArray.concat(mobileTreeArray).toString()
            this.$refs.editForm.validate(valid => {
                if (valid) {
                    this.$axios.post('role/update', this.editForm).then(res => {
                        if (res.data.code == 200) {
                            this.$message.success('修改成功')
                            this.editFormVisible = false
                            this.queryByPage()
                        } else {
                            this.$message.error(res.data.message)
                        }
                    })
                }
            })
        },
        deleteSubmit(row) {
            this.$confirm('亲，确认要删除吗？', '提示', { type: 'warning' }).then(() => {
                this.$axios.post('role/delete/' + row.id, {}).then(res => {
                    if (res.data.code == 200) {
                        this.$message.success('删除成功')
                        this.pageNo = 1
                        this.queryByPage()
                    } else {
                        this.$message.error(res.data.message)
                    }
                })
            })
        },
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
        showDialog(type, field, options, value) {
            this.type = type
            this.field = field
            this.unCheckedGridData = []
            this.dialogVisible = true
            this.$nextTick(() => {
                if (value.length > 0) {
                    let checkedGridData = []
                    for (let i = 0; i < options.length; i++) {
                        let result = value.find(item => item == options[i].id)
                        if (result) {
                            checkedGridData.push({
                                id: options[i].id,
                                name: options[i].label
                            })
                        }
                    }
                    this.checkedGridData = checkedGridData
                } else {
                    this.checkedGridData = []
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
                result.push(this.checkedGridData[j].id)
            }
            let param = {
                userIds: result.toString(),
                roleId: this.roleId
            }
            this.$axios.post('role/authorize', param).then(res => {
                if (res.data.code == 200) {
                    this.$message.success('授权成功')
                    this.dialogVisible = false
                } else {
                    this.$message.error(res.data.message)
                }
            })
            this.$emit('confirm', this.type, this.field, result)
        },
        handleCheck(data) {
            let node = null
            if (this.activeName === 'pc') {
                node = this.$refs.pcTree.getNode(data.id)
            } else if (this.activeName === 'mobile') {
                node = this.$refs.mobileTree.getNode(data.id)
            }
            if (node.checked) {
                this.setParentNode(node)
                this.setChildNode(node, true)
            } else {
                this.setChildNode(node, false)
            }
        },
        setParentNode(node) {
            if (node.parent) {
                for (const key in node) {
                    if (key === 'parent') {
                        node[key].checked = true
                        let indeterminate = false
                        let childNodes = node[key].childNodes
                        for (let i = 0; i < childNodes.length; i++) {
                            if (!childNodes[i].checked) {
                                indeterminate = true
                                break
                            }
                        }
                        node[key].indeterminate = indeterminate
                        this.setParentNode(node[key])
                    }
                }
            }
        },
        setChildNode(node, checked) {
            let childNodes = node.childNodes
            for (let i = 0; i < childNodes.length; i++) {
                let childNode = childNodes[i]
                childNode.checked = checked
                if (childNode.childNodes.length > 0) {
                    this.setChildNode(childNode, checked)
                }
            }
        },
        handleTabClick(tab, event) {
            this.pcTreeArray = this.$refs.pcTree.getCheckedKeys()
            this.mobileTreeArray = this.$refs.mobileTree.getCheckedKeys()
        }
    }
}
</script>
<style scoped>
::v-deep .el-dialog__body {
    padding: 10px 20px 0px 20px;
}
</style>
