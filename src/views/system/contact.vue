<template>
    <div>
        <el-container :style="'height:' + (clientHeight - 105) + 'px'">
            <el-aside width="280px" class="aside" style="padding-left: 15px; padding-top: 15px">
                <el-input placeholder="搜索" size="small" v-model="filterText" style="margin-bottom: 10px"></el-input>
                <el-scrollbar :style="'height:' + (clientHeight - 165) + 'px'">
                    <el-tree
                        :data="deptData"
                        default-expand-all
                        highlight-current
                        @node-click="handleNodeClick"
                        :expand-on-click-node="false"
                        ref="tree"
                        :filter-node-method="filterNode"
                        @node-contextmenu="handleContextMenu"
                    >
                        <span
                            slot-scope="{ node, data }"
                            style="width: 100%"
                            @mouseenter="mouseenter(data)"
                            @mouseleave="mouseleave(data)"
                        >
                            <span class="limit-width-label">
                                {{ data.code + ' ' + node.label }}
                            </span>
                        </span>
                    </el-tree>
                </el-scrollbar>
            </el-aside>
            <el-main>
                <div class="toolView">
                    <el-button
                        type="text"
                        icon="el-icon-plus"
                        v-permission="'user:add'"
                        @click="showAddDialog"
                        size="small"
                        >新增
                    </el-button>
                    <el-upload
                        style="display: inline; margin-left: 10px; margin-right: 10px"
                        :action="action"
                        :show-file-list="false"
                        accept=".xlsx,.xls"
                        :headers="headers"
                        :before-upload="beforeUpload"
                        :on-success="successHandle"
                    >
                        <el-button size="small" type="text" icon="el-icon-upload2" v-permission="'user:import'"
                            >导入</el-button
                        >
                    </el-upload>
                    <el-button
                        type="text"
                        icon="el-icon-download"
                        v-permission="'user:download'"
                        @click="downloadTemplate('userModel.xlsx')"
                        size="small"
                        >下载模版
                    </el-button>
                    <el-button
                        type="text"
                        icon="el-icon-download"
                        v-permission="'user:export'"
                        @click="downloadUser"
                        size="small"
                        >导出
                    </el-button>
                </div>
                <div class="searchView">
                    <el-form label-width="60px" :inline="true" size="medium">
                        <el-form-item label="姓名">
                            <el-input v-model="searchForm.name" clearable placeholder="请输入姓名"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" icon="el-icon-search" @click.native="handleSearch"
                                >查询</el-button
                            >
                        </el-form-item>
                    </el-form>
                </div>
                <div class="table">
                    <!--列表-->
                    <el-table :data="tableData" border highlight-current-row stripe>
                        <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
                        <el-table-column prop="account" label="账号" align="center"></el-table-column>
                        <el-table-column prop="name" label="姓名" align="center"></el-table-column>
                        <el-table-column
                            prop="sex"
                            label="性别"
                            align="center"
                            :formatter="sexFormatter"
                        ></el-table-column>
                        <el-table-column prop="phone" label="手机号" align="center"></el-table-column>
                        <el-table-column
                            prop="roleNames"
                            label="拥有角色"
                            align="center"
                            show-overflow-tooltip
                        ></el-table-column>
                        <el-table-column prop="position" label="职位" align="center"></el-table-column>
                        <el-table-column prop="sort" label="排序" align="center"></el-table-column>
                        <el-table-column
                            prop="status"
                            label="状态"
                            align="center"
                            :formatter="statusFormatter"
                        ></el-table-column>
                        <el-table-column label="操作" align="center" width="165" v-if="userOperate">
                            <template slot-scope="scope">
                                <el-button
                                    type="text"
                                    size="small"
                                    @click="showEditDialog(scope.row)"
                                    v-permission="'user:edit'"
                                    >编辑
                                </el-button>
                                <el-divider direction="vertical" v-if="editVertical"></el-divider>
                                <el-button
                                    type="text"
                                    size="small"
                                    @click="deleteSubmit(scope.row)"
                                    v-permission="'user:delete'"
                                    >删除
                                </el-button>
                                <el-divider direction="vertical" v-if="deleteVertical"></el-divider>
                                <el-button
                                    type="text"
                                    size="small"
                                    @click="showResetDialog(scope.row)"
                                    v-permission="'user:reset'"
                                    >重置密码
                                </el-button>
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
            </el-main>
        </el-container>
        <!--新增部门界面-->
        <el-dialog title="新增" width="750px" :visible.sync="addDeptFormVisible" :close-on-click-modal="false">
            <el-form :model="addDeptForm" label-width="80px" :rules="formRules" ref="addDeptForm">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="名称" prop="name">
                            <el-input v-model.trim="addDeptForm.name" placeholder="请输入名称"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="上级部门" prop="parentId">
                            <el-cascader
                                v-model="addDeptForm.parentId"
                                :options="parentDeptData"
                                :props="{ checkStrictly: true, emitPath: false }"
                                clearable
                                placeholder="请选择上级"
                            >
                            </el-cascader>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="部门主管" prop="directorValue">
                            <el-select
                                v-model="addDeptForm.directorValue"
                                multiple
                                filterable
                                placeholder="请选择部门主管"
                            >
                                <el-option
                                    v-for="item in userOptions"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id"
                                >
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="分管领导" prop="chargeLeaderValue">
                            <el-select
                                v-model="addDeptForm.chargeLeaderValue"
                                multiple
                                filterable
                                placeholder="请选择分管领导"
                            >
                                <el-option
                                    v-for="item in userOptions"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id"
                                >
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <!-- <el-col :span="12">
                        <el-form-item label="排序号" prop="sort">
                            <el-input-number v-model="addDeptForm.sort" placeholder="请输入排序号"></el-input-number>
                        </el-form-item>
                    </el-col> -->
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="addDeptFormVisible = false">取消</el-button>
                <el-button type="primary" @click="addDeptSubmit">提交</el-button>
            </div>
        </el-dialog>
        <!--编辑部门界面-->
        <el-dialog title="编辑" width="750px" :visible.sync="editDeptFormVisible" :close-on-click-modal="false">
            <el-form :model="editDeptForm" label-width="80px" :rules="formRules" ref="editDeptForm">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="名称" prop="name">
                            <el-input v-model.trim="editDeptForm.name" placeholder="请输入名称"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="上级部门" prop="parentId">
                            <el-cascader
                                v-model="editDeptForm.parentId"
                                :options="parentDeptData"
                                :props="{ checkStrictly: true, emitPath: false }"
                                clearable
                                placeholder="请选择上级"
                            >
                            </el-cascader>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="部门主管" prop="directorValue">
                            <el-select
                                v-model="editDeptForm.directorValue"
                                multiple
                                filterable
                                placeholder="请选择部门主管"
                            >
                                <el-option
                                    v-for="item in tableData"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="String(item.id)"
                                >
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="分管领导" prop="chargeLeaderValue">
                            <el-select
                                v-model="editDeptForm.chargeLeaderValue"
                                multiple
                                filterable
                                placeholder="请选择分管领导"
                            >
                                <el-option
                                    v-for="item in userOptions"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="String(item.id)"
                                >
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <!-- <el-col :span="12">
                        <el-form-item label="排序号" prop="sort">
                            <el-input-number v-model="editDeptForm.sort" placeholder="请输入排序号"></el-input-number>
                        </el-form-item>
                    </el-col> -->
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="editDeptFormVisible = false">取消</el-button>
                <el-button type="primary" @click="editDeptSubmit">提交</el-button>
            </div>
        </el-dialog>
        <!--重置密码-->
        <el-dialog title="重置密码" width="500px" :visible.sync="resetFormVisible" :close-on-click-modal="false">
            <el-form :model="resetForm" label-width="80px" :rules="formRules" ref="resetForm">
                <el-form-item label="新密码" prop="password">
                    <el-input v-model="resetForm.password" placeholder="请输入新密码" clearable></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetFormVisible = false">取消</el-button>
                <el-button type="primary" @click="resetSubmit">确定</el-button>
            </div>
        </el-dialog>
        <div id="contextMenu" class="contextMenu">
            <div><i class="el-icon-plus" @click="handleCommand('add')" v-permission="'dept:add'"> 新增</i></div>
            <div>
                <i class="el-icon-download" @click="handleCommand('download')" v-permission="'dept:download'">
                    下载模版</i
                >
            </div>
            <div>
                <el-upload
                    style="display: inline; margin-left: 10px; margin-right: 10px"
                    :action="actionDetartment"
                    :show-file-list="false"
                    accept=".xlsx,.xls"
                    :headers="headersDetartment"
                    :before-upload="beforeUpload"
                    :on-success="successDepartmentHandle"
                >
                    <i class="el-icon-upload2" v-permission="'dept:import'">导入</i>
                </el-upload>
            </div>
            <div>
                <i
                    class="el-icon-edit"
                    @click="handleCommand('edit')"
                    v-permission="'dept:edit'"
                    v-if="currentNode && currentNode.depart != 'false'"
                >
                    编辑</i
                >
            </div>
            <div>
                <i
                    class="el-icon-delete"
                    @click="handleCommand('delete')"
                    v-permission="'dept:delete'"
                    v-if="currentNode && currentNode.depart != 'false'"
                >
                    删除</i
                >
            </div>
        </div>
    </div>
</template>

<script>
import md5 from 'md5'
export default {
    data() {
        return {
            action: this.$axios.defaults.baseURL + '/user/import',
            headers: {
                Authorization: localStorage.getItem('Authorization')
            },
            actionDetartment: this.$axios.defaults.baseURL + '/department/import',
            headersDetartment: {
                Authorization: localStorage.getItem('Authorization')
            },
            clientHeight: document.documentElement.clientHeight || document.body.clientHeight,
            deptData: [],
            userOptions: [],
            parentDeptData: [],
            addDeptFormVisible: false,
            addDeptForm: {
                name: '',
                parentId: '',
                directorValue: [],
                chargeLeaderValue: [],
                sort: ''
            },
            editDeptFormVisible: false,
            editDeptForm: {
                id: '',
                name: '',
                parentId: '',
                directorValue: [],
                chargeLeaderValue: [],
                sort: ''
            },
            tableData: [],
            pageNo: 1,
            total: 0,
            formRules: {
                name: [
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    { max: 10, message: '长度最多10个字符', trigger: 'blur' }
                ],
                account: [
                    { required: true, message: '请输入账号', trigger: 'blur' },
                    { min: 2, message: '长度至少2个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    {
                        pattern: /(?=.*[a-z])(?=.*\d)(?=.*[^a-z0-9])[\S]{8,}/i,
                        message: '密码必须包含字母、数字和特殊字符，且长度至少8位',
                        trigger: 'blur'
                    }
                ],
                sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
                departmentId: [{ required: true, message: '请选择部门', trigger: 'change' }],
                sort: [{ required: true, message: '请输入排序号', trigger: 'blur' }]
            },
            searchForm: {
                companyId: localStorage.getItem('companyId'),
                departmentId: '',
                name: ''
            },
            resetFormVisible: false,
            resetForm: {
                id: '',
                password: ''
            },
            currentNode: undefined,
            userOperate: false,
            editVertical: false,
            deleteVertical: false,
            currentTreeNode: [],
            exportCompanyId: undefined,
            exportDepartmentId: undefined,
            filterText: ''
        }
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val)
        }
    },
    created() {
        let timestamp = Date.now()
        this.headers.Sign = md5(
            'user/import?timestamp=' + timestamp + '&key=yVwlsbIrY3q22EnoYYM4nR5zqTmqed05'
        ).toUpperCase()
        this.headers.Timestamp = timestamp

        this.headersDetartment.Sign = md5(
            'department/import?timestamp=' + timestamp + '&key=yVwlsbIrY3q22EnoYYM4nR5zqTmqed05'
        ).toUpperCase()
        this.headersDetartment.Timestamp = timestamp

        let permissionsList = localStorage.getItem('permissions')

        if (
            permissionsList.indexOf('user:edit') != -1 ||
            permissionsList.indexOf('user:delete') != -1 ||
            permissionsList.indexOf('user:reset') != -1
        ) {
            this.userOperate = true
        } else {
            this.userOperate = false
        }
        if (
            permissionsList.indexOf('user:edit') != -1 &&
            (permissionsList.indexOf('user:delete') != -1 || permissionsList.indexOf('user:reset') != -1)
        ) {
            this.editVertical = true
        } else {
            this.editVertical = false
        }
        if (
            permissionsList.indexOf('user:reset') != -1 &&
            (permissionsList.indexOf('user:delete') != -1 || permissionsList.indexOf('user:edit') != -1)
        ) {
            this.deleteVertical = true
        } else {
            this.deleteVertical = false
        }
        this.queryDept()
        this.queryParentByCompanyId()
        this.queryUser()
        this.queryRoleByCompanyId()
        this.queryByPage()
    },
    methods: {
        filterNode(value, data) {
            if (!value) return true
            return data.name.indexOf(value) !== -1
        },
        mouseenter(data) {
            this.$set(data, 'show', true)
            this.currentTreeNode = data
        },
        mouseleave(data) {
            this.$set(data, 'show', false)
        },
        async queryDept() {
            let params = { isAll: false }
            let res = await this.$axios.get('company/queryAllAndDept', { params })
            if (res.data.code == 200) {
                this.deptData = res.data.data
            }
        },
        async queryUser() {
            let res = await this.$axios.get('user/queryAll')
            if (res.data.code == 200) {
                this.userOptions = res.data.data
            }
        },
        async queryParentByCompanyId() {
            let params = {
                searchCompanyId: localStorage.getItem('companyId')
            }
            let res = await this.$axios.get('department/queryByCompanyId', { params })
            if (res.data.code == 200) {
                this.parentDeptData = res.data.data
            }
        },
        async queryRoleByCompanyId() {
            let res = await this.$axios.get('role/queryAll')
            if (res.data.code == 200) {
                this.roleOptions = res.data.data
            }
        },
        handleNodeClick(row) {
            if (row) {
                this.currentNode = row
                if (row.type === 'company') {
                    this.searchForm.companyId = row.value
                    this.searchForm.departmentId = ''
                } else if (row.type === 'department') {
                    this.searchForm.companyId = row.companyId
                    this.searchForm.departmentId = row.id
                }
                this.pageNo = 1
                this.queryByPage()
            }
        },
        handleContextMenu(event, data, node, element) {
            event.preventDefault()
            const contextMenu = document.getElementById('contextMenu')
            contextMenu.style.display = 'block'
            contextMenu.style.left = `${event.clientX}px`
            contextMenu.style.top = event.clientY + 10 + `px`
            this.currentNode = data
        },
        queryByPage() {
            const params = {
                pageNo: this.pageNo,
                searchCompanyId: this.searchForm.companyId,
                departmentId: this.searchForm.departmentId,
                name: this.searchForm.name
            }
            this.$axios.get('user/queryByPage', { params }).then(res => {
                if (res.data.code == 200) {
                    this.tableData = res.data.data.list
                    this.total = res.data.data.total
                }
            })
        },
        handleSearch() {
            this.pageNo = 1
            this.queryByPage()
        },
        handleCurrentChange(val) {
            this.queryByPage()
        },
        showAddDeptDialog() {
            this.addDeptFormVisible = true
            if (this.$refs.addDeptForm) {
                this.$refs.addDeptForm.resetFields()
            }
        },
        addDeptSubmit() {
            var params = {
                name: this.addDeptForm.name,
                parentId: this.addDeptForm.parentId,
                director: this.addDeptForm.directorValue.toString(),
                chargeLeader: this.addDeptForm.chargeLeaderValue.toString(),
                sort: this.addDeptForm.sort
            }
            this.$refs.addDeptForm.validate(valid => {
                if (valid) {
                    this.$axios.post('department/insert', params).then(res => {
                        if (res.data.code == 200) {
                            this.$message.success('新增成功')
                            this.addDeptFormVisible = false
                            this.queryDept()
                        } else {
                            this.$message.error(res.data.message)
                        }
                    })
                }
            })
        },
        editDeptSubmit() {
            if (this.editDeptForm.id != this.editDeptForm.parentId) {
                var params = {
                    id: this.editDeptForm.id,
                    name: this.editDeptForm.name,
                    parentId: this.editDeptForm.parentId,
                    director: this.editDeptForm.directorValue.toString(),
                    chargeLeader: this.editDeptForm.chargeLeaderValue.toString(),
                    sort: this.editDeptForm.sort
                }
                this.$refs.editDeptForm.validate(valid => {
                    if (valid) {
                        this.$axios.post('department/update', params).then(res => {
                            if (res.data.code == 200) {
                                this.$message.success('修改成功')
                                this.editDeptFormVisible = false
                                if (this.editDeptForm.id == this.currentNode.id) {
                                    //当前选中为修改项时
                                    this.currentNode = this.editDeptForm
                                }
                                this.queryDept()
                            } else {
                                this.$message.error(res.data.message)
                            }
                        })
                    }
                })
            } else {
                this.$message.error('不能选择自己为上级部门')
            }
        },
        deleteDeptSubmit(row) {
            if (this.searchForm.departmentId) {
                this.$confirm('亲，确认要删除吗？', '提示', { type: 'warning' }).then(() => {
                    this.$axios.post('department/delete/' + row.id, {}).then(res => {
                        if (res.data.code == 200) {
                            this.$message.success('删除成功')
                            this.queryDept()
                        } else {
                            this.$message.error(res.data.message)
                        }
                    })
                })
            } else {
                this.$message.error('请选择部门')
            }
        },
        sexFormatter(obj) {
            if (obj.sex === 1) {
                return '男'
            } else if (obj.sex === 2) {
                return '女'
            } else {
                return '未知'
            }
        },
        statusFormatter(obj) {
            if (obj.status === 1) {
                return '启用'
            } else {
                return '禁用'
            }
        },
        //显示用户新增界面
        showAddDialog() {
            this.$router.push({
                path: '/userAdd'
            })
        },
        //显示用户编辑界面
        showEditDialog(row) {
            this.$router.push({
                path: '/userEdit',
                query: {
                    id: row.id
                }
            })
        },
        deleteSubmit(row) {
            this.$confirm('亲，确认要删除吗？', '提示', { type: 'warning' }).then(() => {
                this.$axios.post('user/delete/' + row.id, {}).then(res => {
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
        showResetDialog(row) {
            this.resetFormVisible = true
            if (this.$refs.resetForm) {
                this.$refs.resetForm.resetFields()
            }
            this.resetForm = {
                id: row.id,
                password: ''
            }
        },
        resetSubmit() {
            this.$refs.resetForm.validate(valid => {
                if (valid) {
                    this.$axios.post('user/resetPassword', this.resetForm).then(res => {
                        if (res.data.code == 200) {
                            this.$message.success('重置成功')
                            this.resetFormVisible = false
                        } else {
                            this.$message.error(res.data.message)
                        }
                    })
                }
            })
        },
        beforeUpload(file) {
            const suffix = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase()
            if (suffix != 'xlsx' && suffix != 'xls') {
                this.$message.error(`只能选择excel文件`)
                return false
            }
            return true
        },
        successHandle(res, file, fileList) {
            if (res.code === 200) {
                this.$notify({
                    title: '导入成功',
                    message: '默认密码:Test_1234',
                    type: 'success',
                    duration: 0
                })
                this.queryByPage()
            } else {
                this.$message.error(res.message)
            }
        },
        successDepartmentHandle(res, file, fileList) {
            if (res.code === 200) {
                this.$message.success('导入成功')
                this.queryDept()
            } else {
                this.$message.error(res.message)
            }
        },
        downloadTemplate(templateName) {
            let params = {
                templateName: templateName
            }
            this.$axios.post('upload/downloadTemplate', params, { responseType: 'blob' }).then(res => {
                let content = res.data
                let blob = new Blob([content])
                if ('download' in document.createElement('a')) {
                    // 非IE下载
                    let elink = document.createElement('a')
                    elink.download = templateName
                    elink.style.display = 'none'
                    elink.href = URL.createObjectURL(blob)
                    document.body.appendChild(elink)
                    elink.click()
                    URL.revokeObjectURL(elink.href) // 释放URL 对象
                    document.body.removeChild(elink)
                } else {
                    // IE10+下载
                    navigator.msSaveBlob(blob, templateName)
                }
            })
        },
        downloadUser() {
            this.exportCompanyId = this.searchForm.companyId
            this.exportDepartmentId = this.searchForm.departmentId
            let params = {
                exportCompanyId: this.exportCompanyId,
                exportDepartmentId: this.exportDepartmentId
            }
            this.$axios.post('user/export', params, { responseType: 'blob' }).then(res => {
                let content = res.data
                let blob = new Blob([content])
                if ('download' in document.createElement('a')) {
                    // 非IE下载
                    let elink = document.createElement('a')
                    elink.download = '用户列表.xlsx'
                    elink.style.display = 'none'
                    elink.href = URL.createObjectURL(blob)
                    document.body.appendChild(elink)
                    elink.click()
                    URL.revokeObjectURL(elink.href) // 释放URL 对象
                    document.body.removeChild(elink)
                } else {
                    // IE10+下载
                    navigator.msSaveBlob(blob, '用户列表.xlsx')
                }
            })
        },
        handleCommand(type) {
            const contextMenu = document.getElementById('contextMenu')
            contextMenu.style.display = 'none'
            if (type === 'add') {
                this.addDeptFormVisible = true
                if (this.$refs.addDeptForm) {
                    this.$refs.addDeptForm.resetFields()
                }
            } else if (type === 'edit') {
                this.editDeptForm = Object.assign({}, this.currentNode)
                this.editDeptFormVisible = true
                if (this.$refs.editDeptForm) {
                    this.$refs.editDeptForm.resetFields()
                }
                if (this.editDeptForm.director) {
                    this.$set(this.editDeptForm, 'directorValue', this.editDeptForm.director.split(','))
                } else {
                    this.$set(this.editDeptForm, 'directorValue', [])
                }
                if (this.editDeptForm.chargeLeader) {
                    this.$set(this.editDeptForm, 'chargeLeaderValue', this.editDeptForm.chargeLeader.split(','))
                } else {
                    this.$set(this.editDeptForm, 'chargeLeaderValue', [])
                }
                if (this.editDeptForm.parentCode) {
                    let code = this.editDeptForm.code
                    let parentCode = this.editDeptForm.parentCode
                    this.editDeptForm.code = code.substring(parentCode.length, code.length)
                }
            } else if (type === 'delete') {
                this.deleteDeptSubmit(this.currentNode)
            } else if (type === 'download') {
                this.downloadTemplate('departmentModel.xlsx')
            }
        }
    }
}
</script>
<style scoped>
::v-deep .el-dialog__body {
    padding: 10px 20px 0px 20px;
}
::v-deep .el-input-number .el-input__inner {
    text-align: center;
}
::v-deep .el-main {
    border-left: 1px solid #e5e9f2;
    padding: 0px;
    margin-left: 15px;
}

::v-deep .el-table__body tr.current-row td:not(.is-center) {
    border-top-left-radius: 8px !important;
    border-bottom-left-radius: 8px !important;
}

::v-deep .el-aside .el-table__body tr.current-row .is-center {
    border-top-right-radius: 8px !important;
    border-bottom-right-radius: 8px !important;
}

::v-deep .aside .el-table td {
    border-bottom: 0px solid #ebeef5;
}

.limit-width-label {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
    font-size: 13px;
    line-height: 13px;
}

::-webkit-scrollbar {
    width: 4px;
    height: 4px;
}

::-webkit-scrollbar-thumb {
    width: 4px;
    background: #7d7d7d;
}

::-webkit-scrollbar-track {
    width: 4px;
    background: #eee;
}

.contextMenu {
    display: none;
    position: absolute;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    font-size: 12px;
    color: #333;
    text-align: center;
    width: 80px;
}
.contextMenu div {
    line-height: 32px;
    cursor: pointer;
}

.contextMenu div:hover {
    background: #ebf0ff;
}
</style>
