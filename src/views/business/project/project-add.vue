<template>
    <div class="project-page" v-loading="loading">
        <div class="section-title">基本信息</div>
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-form-item label="项目编号" prop="code">
                        <el-input v-model="form.code" clearable />
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="项目名称" prop="name">
                        <el-input v-model="form.name" clearable />
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="项目地址" prop="address">
                        <el-input v-model="form.address" clearable />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-form-item label="业主姓名" prop="ownerName">
                        <el-input v-model="form.ownerName" clearable />
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="联系电话" prop="ownerPhone">
                        <el-input v-model="form.ownerPhone" clearable />
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="预算金额">
                        <el-input-number v-model="form.budgetAmount" :min="0" :precision="2" :controls="false" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-form-item label="计划开始" prop="plannedStartDate">
                        <el-date-picker v-model="form.plannedStartDate" value-format="yyyy-MM-dd" type="date" />
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="计划结束" prop="plannedEndDate">
                        <el-date-picker v-model="form.plannedEndDate" value-format="yyyy-MM-dd" type="date" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="20"
                ><el-col :span="8"
                    ><el-form-item label="封面" prop="cover">
                        <div class="cover-field" :class="{ 'has-cover': form.cover }">
                            <el-upload
                                class="cover-uploader"
                                action=""
                                accept="image/*"
                                list-type="picture-card"
                                :file-list="coverFileList"
                                :limit="1"
                                :before-upload="beforeCoverUpload"
                                :http-request="uploadCover"
                                :on-preview="previewCover"
                                :on-remove="removeCover"
                            >
                                <i v-if="!coverUploading" class="el-icon-plus" />
                                <i v-else class="el-icon-loading" />
                            </el-upload>
                        </div>
                    </el-form-item></el-col
                ><el-col v-if="form.status === 3" :span="16"
                    ><el-form-item label="暂停原因"><el-input v-model="form.pauseReason" /></el-form-item></el-col
                ><el-col v-if="form.status === 7" :span="16"
                    ><el-form-item label="取消原因"><el-input v-model="form.cancelReason" /></el-form-item></el-col
            ></el-row>
        </el-form>
        <el-tabs v-model="activeTab">
            <el-tab-pane name="roles"
                ><span slot="label"><span class="required-mark">*</span>项目角色</span>
                <div class="tab-tools">
                    <el-button size="small" type="primary" plain icon="el-icon-plus" @click="openUserDialog"
                        >选择成员</el-button
                    >
                </div>
                <el-table class="project-data-table" :data="members" border
                    ><el-table-column type="index" label="序号" width="60" align="center" />
                    <el-table-column label="姓名" align="center" min-width="150"
                        ><template slot-scope="s"
                            ><span class="member-name">{{ userName(s.row.userId) }}</span></template
                        ></el-table-column
                    ><el-table-column label="手机号" align="center" min-width="160"
                        ><template slot-scope="s">{{ userPhone(s.row.userId) }}</template></el-table-column
                    ><el-table-column label="项目角色" align="center" min-width="200"
                        ><template slot-scope="s"
                            ><el-select v-model="s.row.roleCode"
                                ><el-option
                                    v-for="r in roleOptions"
                                    :key="r.value"
                                    :label="r.label"
                                    :value="r.value" /></el-select></template></el-table-column
                    ><el-table-column label="状态" align="center" width="130"
                        ><template slot-scope="s"
                            ><el-select v-model="s.row.status"
                                ><el-option label="有效" :value="1" /><el-option
                                    label="无效"
                                    :value="2" /></el-select></template></el-table-column
                    ><el-table-column label="操作" width="80" align="center"
                        ><template slot-scope="s"
                            ><el-button type="text" class="danger" @click="members.splice(s.$index, 1)"
                                >删除</el-button
                            ></template
                        ></el-table-column
                    ></el-table
                ></el-tab-pane
            >
            <el-tab-pane name="stages">
                <span slot="label"><span class="required-mark">*</span>项目阶段</span>
                <div class="tab-tools">
                    <el-button size="small" type="primary" plain icon="el-icon-plus" @click="stages.push(newStage())">
                        添加阶段
                    </el-button>
                </div>
                <el-table class="project-data-table" :data="stages" border>
                    <el-table-column type="index" label="序号" width="60" align="center" />
                    <el-table-column label="流程类型" align="center" min-width="150">
                        <template slot-scope="scope">
                            <el-select v-model="scope.row.flowType">
                                <el-option
                                    v-for="item in flowTypeOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="阶段名称" align="center" min-width="180">
                        <template slot-scope="scope">
                            <el-input v-model="scope.row.stageName" placeholder="请输入阶段名称" />
                        </template>
                    </el-table-column>
                    <el-table-column align="center" min-width="170">
                        <template slot="header"><span class="required-mark">*</span>计划开始日期</template>
                        <template slot-scope="scope">
                            <el-date-picker
                                v-model="scope.row.plannedStartDate"
                                value-format="yyyy-MM-dd"
                                type="date"
                                placeholder="请选择日期"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column align="center" min-width="170">
                        <template slot="header"><span class="required-mark">*</span>计划完成日期</template>
                        <template slot-scope="scope">
                            <el-date-picker
                                v-model="scope.row.plannedEndDate"
                                value-format="yyyy-MM-dd"
                                type="date"
                                placeholder="请选择日期"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column label="前置阶段" align="center" min-width="200">
                        <template slot-scope="scope">
                            <el-select
                                v-model="scope.row.predecessorKeys"
                                multiple
                                collapse-tags
                                placeholder="请选择前置阶段"
                            >
                                <el-option
                                    v-for="stage in stages"
                                    :key="stage.key"
                                    :label="stage.stageName || '未命名阶段'"
                                    :value="stage.key"
                                    :disabled="stage.key === scope.row.key"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150" align="center">
                        <template slot-scope="scope">
                            <el-button type="text" @click="openInspectionDialog(scope.$index)">验收项目</el-button>
                            <el-button type="text" class="danger" @click="removeStage(scope.$index)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
        <el-dialog
            title="阶段验收条目"
            :visible.sync="inspectionDialogVisible"
            width="620px"
            append-to-body
            @closed="closeInspectionDialog"
        >
            <div class="inspection-dialog-toolbar">
                <el-button size="small" type="primary" plain icon="el-icon-plus" @click="addInspectionItem">
                    新增条目
                </el-button>
            </div>
            <el-table :data="inspectionItemsDraft" border>
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column label="名称">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.name" placeholder="请输入验收条目名称" />
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="80" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" class="danger" @click="inspectionItemsDraft.splice(scope.$index, 1)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <span slot="footer">
                <el-button @click="inspectionDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmInspectionItems">确定</el-button>
            </span>
        </el-dialog>
        <el-dialog
            title="选择系统用户"
            :visible.sync="userDialogVisible"
            width="720px"
            append-to-body
            @closed="clearUserSelection"
        >
            <div class="user-dialog-toolbar">
                <el-input
                    v-model="userQuery.name"
                    size="small"
                    clearable
                    placeholder="请输入用户姓名"
                    @keyup.enter.native="searchUsers"
                />
                <el-button size="small" type="primary" @click="searchUsers">查询</el-button>
            </div>
            <el-table
                class="project-data-table"
                ref="userTable"
                v-loading="userLoading"
                :data="userRows"
                :row-key="row => row.id"
                border
                stripe
                @selection-change="changeUserSelection"
            >
                <el-table-column
                    type="selection"
                    width="55"
                    align="center"
                    :selectable="canSelectUser"
                    reserve-selection
                />
                <el-table-column prop="name" label="姓名" min-width="140" />
                <el-table-column prop="account" label="账号" min-width="160" />
                <el-table-column prop="phone" label="手机号" min-width="130" />
                <el-table-column label="状态" width="100" align="center">
                    <template slot-scope="scope">{{ scope.row.status === 1 ? '启用' : '禁用' }}</template>
                </el-table-column>
            </el-table>
            <el-pagination
                background
                layout="total, prev, pager, next"
                :total="userTotal"
                :page-size="userQuery.pageSize"
                :current-page="userQuery.pageNo"
                @current-change="changeUserPage"
            />
            <span slot="footer">
                <el-button @click="userDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmUser">确定</el-button>
            </span>
        </el-dialog>
        <div class="footer">
            <el-button @click="close">取消</el-button
            ><el-button type="primary" :loading="saving" @click="submit">创建项目</el-button>
        </div>
    </div>
</template>
<script>
import flowTemplates from '@/assets/flow.json'

export default {
    data() {
        return {
            loading: false,
            saving: false,
            coverUploading: false,
            activeTab: 'roles',
            users: [],
            members: [],
            stages: [],
            inspectionDialogVisible: false,
            inspectionStageIndex: -1,
            inspectionItemsDraft: [],
            userDialogVisible: false,
            userLoading: false,
            userRows: [],
            userTotal: 0,
            selectedUsers: [],
            userQuery: {
                pageNo: 1,
                pageSize: 10,
                name: ''
            },
            form: {
                id: null,
                code: '',
                cover: '',
                name: '',
                address: '',
                ownerName: '',
                ownerPhone: '',
                budgetAmount: 0,
                status: 1,
                currentPhase: 1,
                healthStatus: 1,
                pauseReason: '',
                cancelReason: '',
                plannedStartDate: '',
                plannedEndDate: ''
            },
            rules: {
                cover: [{ required: true, message: '请上传封面', trigger: 'change' }],
                code: [{ required: true, message: '请输入项目编号', trigger: 'blur' }],
                name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
                address: [{ required: true, message: '请输入项目地址', trigger: 'blur' }],
                ownerName: [{ required: true, message: '请输入业主姓名', trigger: 'blur' }],
                ownerPhone: [{ required: true, message: '请输入业主联系电话', trigger: 'blur' }],
                status: [{ required: true, message: '请选择状态', trigger: 'change' }],
                plannedStartDate: [{ required: true, message: '请选择计划开始日期', trigger: 'change' }],
                plannedEndDate: [{ required: true, message: '请选择计划结束日期', trigger: 'change' }]
            },
            statusOptions: [
                { label: '待启动', value: 1 },
                { label: '进行中', value: 2 },
                { label: '暂停', value: 3 },
                { label: '已交付', value: 4 },
                { label: '售后中', value: 5 },
                { label: '已完结', value: 6 },
                { label: '已取消', value: 7 }
            ],
            flowTypeOptions: [
                { label: '设计', value: 1 },
                { label: '土建', value: 2 },
                { label: '精装', value: 3 }
            ],
            roleOptions: [
                { label: '设计师', value: 1 },
                { label: '设计助理', value: 2 },
                { label: '土建项目经理', value: 3 },
                { label: '精装项目经理', value: 4 },
                { label: '施工员', value: 5 },
                { label: '质检员', value: 6 },
                { label: '成控人员', value: 7 },
                { label: '财务人员', value: 8 },
                { label: '管理层', value: 9 },
                { label: '业主', value: 10 },
                { label: '业主家属', value: 11 }
            ]
        }
    },
    created() {
        this.loadUsers()
        this.initStagesFromFlow()
    },
    computed: {
        coverFileList() {
            return this.form.cover ? [{ name: '项目封面', url: this.form.cover }] : []
        }
    },
    methods: {
        newStage() {
            let key = 'stage_' + Date.now() + '_' + Math.random()
            return {
                key,
                stageName: '',
                flowType: 2,
                sortOrder: this.stages.length + 1,
                status: 1,
                managerUserId: null,
                plannedStartDate: '',
                plannedEndDate: '',
                progressPercent: 0,
                allowParallel: 0,
                remark: '',
                predecessorKeys: [],
                inspectionItems: []
            }
        },
        initStagesFromFlow() {
            this.stages = flowTemplates.reduce((stages, module) => {
                let moduleStages = module.stages || []
                moduleStages.forEach(stage => {
                    stages.push(this.newStageFromTemplate(module, stage, stages.length))
                })
                return stages
            }, [])
        },
        newStageFromTemplate(module, template, index) {
            let stage = this.newStage()
            stage.key = 'stage_template_' + module.value + '_' + index
            stage.flowType = module.value
            stage.stageName = template.stageName
            stage.sortOrder = index + 1
            stage.remark = template.trigger || ''
            stage.inspectionItems = (template.inspectionItems || []).map(item => ({
                name: item.name,
                status: item.status
            }))
            return stage
        },
        openInspectionDialog(stageIndex) {
            this.inspectionStageIndex = stageIndex
            this.inspectionItemsDraft = (this.stages[stageIndex].inspectionItems || []).map(item => ({ ...item }))
            this.inspectionDialogVisible = true
        },
        addInspectionItem() {
            this.inspectionItemsDraft.push({ name: '', status: 0 })
        },
        confirmInspectionItems() {
            if (this.inspectionItemsDraft.some(item => !item.name || !item.name.trim())) {
                return this.$message.warning('请填写验收条目名称')
            }
            this.$set(this.stages[this.inspectionStageIndex], 'inspectionItems', this.inspectionItemsDraft)
            this.inspectionDialogVisible = false
        },
        closeInspectionDialog() {
            this.inspectionStageIndex = -1
            this.inspectionItemsDraft = []
        },
        removeStage(i) {
            let removedKey = this.stages[i].key
            this.stages.splice(i, 1)
            this.stages.forEach(stage => {
                stage.predecessorKeys = (stage.predecessorKeys || []).filter(key => key !== removedKey)
            })
            this.stages.forEach((s, n) => (s.sortOrder = n + 1))
        },
        beforeCoverUpload(file) {
            if (!file.type || file.type.indexOf('image/') !== 0) {
                this.$message.error('只能上传图片文件')
                return false
            }
            if (file.size / 1024 / 1024 > 5) {
                this.$message.error('封面图片大小不能超过5MB')
                return false
            }
            return true
        },
        async uploadCover(options) {
            let formData = new FormData()
            formData.append('file', options.file)
            this.coverUploading = true
            try {
                let response = await this.$axios.post('upload/putObject/oss', formData)
                if (response.data.code === 200) {
                    this.form.cover = response.data.data
                    this.$nextTick(() => this.$refs.form && this.$refs.form.validateField('cover'))
                    this.$message.success('封面上传成功')
                } else {
                    this.$message.error(response.data.message)
                }
            } catch (error) {
                this.$message.error('封面上传失败')
            } finally {
                this.coverUploading = false
            }
        },
        previewCover(file) {
            if (file.url) {
                window.open(file.url, '_blank')
            }
        },
        removeCover() {
            this.form.cover = ''
            this.$nextTick(() => this.$refs.form && this.$refs.form.validateField('cover'))
        },
        async loadUsers() {
            let r = await this.$axios.get('user/queryByPage', {
                params: { pageNo: 1, pageSize: 999, searchCompanyId: localStorage.getItem('companyId') }
            })
            if (r.data.code === 200) this.users = r.data.data.list
        },
        userName(userId) {
            let user = this.users.find(item => item.id === userId)
            return user ? user.name : '-'
        },
        userPhone(userId) {
            let user = this.users.find(item => item.id === userId)
            return user && user.phone ? user.phone : '-'
        },
        openUserDialog() {
            this.userDialogVisible = true
            this.userQuery.pageNo = 1
            this.clearUserSelection()
            this.loadDialogUsers()
        },
        async loadDialogUsers() {
            this.userLoading = true
            let r = await this.$axios.get('user/queryByPage', {
                params: {
                    pageNo: this.userQuery.pageNo,
                    pageSize: this.userQuery.pageSize,
                    searchCompanyId: localStorage.getItem('companyId'),
                    name: this.userQuery.name
                }
            })
            this.userLoading = false
            if (r.data.code === 200) {
                this.userRows = r.data.data.list
                this.userTotal = r.data.data.total
            }
        },
        searchUsers() {
            this.userQuery.pageNo = 1
            this.clearUserSelection()
            this.loadDialogUsers()
        },
        changeUserPage(pageNo) {
            this.userQuery.pageNo = pageNo
            this.loadDialogUsers()
        },
        canSelectUser(row) {
            return !this.members.some(item => item.userId === row.id)
        },
        changeUserSelection(rows) {
            this.selectedUsers = rows
        },
        clearUserSelection() {
            this.selectedUsers = []
            this.$nextTick(() => {
                if (this.$refs.userTable) this.$refs.userTable.clearSelection()
            })
        },
        confirmUser() {
            if (!this.selectedUsers.length) return this.$message.warning('请选择系统用户')
            let addedCount = 0
            this.selectedUsers.forEach(selectedUser => {
                if (this.members.some(item => item.userId === selectedUser.id)) return
                if (!this.users.some(item => item.id === selectedUser.id)) this.users.push(selectedUser)
                this.members.push({ userId: selectedUser.id, roleCode: '', status: 1 })
                addedCount++
            })
            if (!addedCount) {
                return this.$message.warning('所选用户已添加到项目角色')
            }
            this.userDialogVisible = false
            this.$message.success(`已添加${addedCount}位成员`)
        },

        submit() {
            this.$refs.form.validate(async valid => {
                if (!valid) return
                if (!this.members.length) {
                    this.activeTab = 'roles'
                    return this.$message.warning('请至少添加一个项目角色')
                }
                if (this.members.some(x => !x.userId || !x.roleCode)) return this.$message.warning('请完善项目角色信息')
                if (!this.stages.length) {
                    this.activeTab = 'stages'
                    return this.$message.warning('请至少添加一个项目阶段')
                }
                if (this.stages.some(x => !x.stageName || !x.flowType))
                    return this.$message.warning('请完善项目阶段信息')
                if (this.stages.some(x => !x.plannedStartDate || !x.plannedEndDate)) {
                    this.activeTab = 'stages'
                    return this.$message.warning('请填写项目阶段计划开始日期和计划完成日期')
                }
                if (this.stages.some(x => x.inspectionItems.some(i => !i.name)))
                    return this.$message.warning('请填写阶段验收条目')
                this.saving = true
                let payload = { project: this.form, members: this.members, stages: this.stages }
                let url = 'project/insert'
                let r = await this.$axios.post(url, { projectData: JSON.stringify(payload) })
                this.saving = false
                if (r.data.code === 200) {
                    this.$message.success('新增成功')
                    this.close()
                } else this.$message.error(r.data.message)
            })
        },
        close() {
            this.$store.commit('worktabRemove', this.$route.fullPath)
            this.$router.push('/project')
        }
    }
}
</script>
<style scoped>
.project-page {
    padding: 20px 24px 80px;
}
.section-title {
    font-size: 16px;
    font-weight: 600;
    border-left: 3px solid #409eff;
    padding-left: 10px;
    margin-bottom: 20px;
}
.el-select,
.el-date-editor,
.el-input-number {
    width: 100%;
}
.tab-tools {
    margin-top: 1px;
    margin-bottom: 12px;
    text-align: right;
}
.member-name {
    color: #303133;
}
::v-deep .project-data-table .el-table__cell {
    text-align: center;
}
::v-deep .project-data-table .el-input__inner {
    text-align: center;
}
.cover-field {
    position: relative;
    width: 120px;
    height: 120px;
    overflow: hidden;
}
::v-deep .cover-uploader {
    position: absolute;
    top: 0;
    left: 0;
    width: 120px;
    height: 120px;
}
::v-deep .cover-uploader .el-upload--picture-card,
::v-deep .cover-uploader .el-upload-list--picture-card .el-upload-list__item {
    width: 120px;
    height: 120px;
    line-height: 120px;
    vertical-align: top;
}
::v-deep .cover-uploader .el-upload-list--picture-card {
    display: block;
    height: 120px;
    line-height: 0;
}
::v-deep .cover-uploader .el-upload-list--picture-card .el-list-enter-active,
::v-deep .cover-uploader .el-upload-list--picture-card .el-list-leave-active {
    transition: none;
}
::v-deep .cover-uploader .el-upload-list--picture-card .el-upload-list__item {
    margin: 0;
    transition: none;
}
::v-deep .cover-uploader .el-upload-list--picture-card .el-upload-list__item-thumbnail {
    width: 120px;
    height: 120px;
    object-fit: cover;
}
.cover-field:not(.has-cover) ::v-deep .cover-uploader .el-upload-list {
    display: none;
}
.has-cover ::v-deep .cover-uploader .el-upload--picture-card {
    display: none;
}
::v-deep .cover-uploader .el-upload-list__item-actions {
    line-height: 120px;
}
::v-deep .cover-uploader .el-upload-list__item-actions span {
    line-height: 1;
    vertical-align: middle;
}
.user-dialog-toolbar {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-bottom: 12px;
}
.user-dialog-toolbar .el-input {
    width: 220px;
}
.el-dialog .el-pagination {
    margin-top: 14px;
    text-align: right;
}
.el-tabs {
    margin-top: 8px;
}
.required-mark {
    margin-right: 3px;
    color: #f56c6c;
}
.inspection-dialog-toolbar {
    margin-bottom: 12px;
    text-align: right;
}
.footer {
    position: fixed;
    z-index: 10;
    left: 200px;
    right: 0;
    bottom: 0;
    padding: 12px 24px;
    background: #fff;
    border-top: 1px solid #ebeef5;
    text-align: right;
}
.danger {
    color: #f56c6c;
}
</style>
