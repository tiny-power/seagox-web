<template>
    <div class="leave-page" ref="page">
        <div class="toolView">
            <el-button type="text" icon="el-icon-plus" @click="showAddDialog" size="small" v-permission="'leave:add'"
                >新增</el-button
            >
            <el-upload
                style="display: inline; margin-left: 10px; margin-right: 10px"
                :action="action"
                :show-file-list="false"
                accept=".xlsx,.xls"
                :headers="headers"
                :before-upload="beforeUpload"
                :on-success="successHandle"
            >
                <el-button size="small" type="text" icon="el-icon-upload2" v-permission="'leave:import'"
                    >导入</el-button
                >
            </el-upload>
            <el-button
                type="text"
                icon="el-icon-download"
                v-permission="'leave:download'"
                @click="downloadTemplate('leaveModel.xlsx')"
                size="small"
                >下载模版</el-button
            >
            <el-button
                type="text"
                icon="el-icon-download"
                v-permission="'leave:export'"
                @click="downloadLeave"
                size="small"
                >导出</el-button
            >
        </div>
        <div class="searchView">
            <el-form label-width="70px" :inline="true" size="medium">
                <el-form-item label="申请人">
                    <el-input v-model.trim="searchForm.applicantName" clearable placeholder="请输入申请人"></el-input>
                </el-form-item>
                <el-form-item label="类型">
                    <el-select v-model="searchForm.leaveType" clearable placeholder="请选择类型">
                        <el-option
                            v-for="item in leaveTypeOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="searchForm.status" clearable placeholder="请选择状态">
                        <el-option
                            v-for="item in statusOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="时间">
                    <el-date-picker
                        v-model="searchForm.dateRange"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        value-format="yyyy-MM-dd"
                    ></el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" @click.native="handleSearch">查询</el-button>
                    <el-button icon="el-icon-refresh-left" @click.native="resetSearch">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="table leave-table" ref="tableBox">
            <el-table :data="tableData" border highlight-current-row stripe :height="tableHeight" @row-dblclick="goDetail">
                <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
                <el-table-column prop="applicantName" label="申请人" align="center" width="100"></el-table-column>
                <el-table-column
                    prop="leaveType"
                    label="类型"
                    align="center"
                    width="90"
                    :formatter="leaveTypeFormatter"
                ></el-table-column>
                <el-table-column prop="startTime" label="开始时间" align="center" width="160"></el-table-column>
                <el-table-column prop="endTime" label="结束时间" align="center" width="160"></el-table-column>
                <el-table-column prop="duration" label="时长(天)" align="center" width="90"></el-table-column>
                <el-table-column prop="reason" label="事由" align="center" show-overflow-tooltip></el-table-column>
                <el-table-column label="状态" align="center" width="90">
                    <template slot-scope="scope">
                        <el-tag size="small" :type="statusTagType(scope.row.status)">
                            {{ statusFormatter(scope.row) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="submitTime" label="提交时间" align="center" width="160"></el-table-column>
                <el-table-column prop="createTime" label="创建时间" align="center" width="160"></el-table-column>
                <el-table-column label="操作" align="center" width="260">
                    <template slot-scope="scope">
                        <el-button
                            type="text"
                            size="small"
                            @click="showEditDialog(scope.row)"
                            v-if="canEdit(scope.row)"
                            v-permission="'leave:edit'"
                            >编辑</el-button
                        >
                        <el-divider
                            direction="vertical"
                            v-if="canEdit(scope.row) && (canSubmit(scope.row) || canDelete(scope.row) || scope.row.status !== 0)"
                        ></el-divider>
                        <el-button
                            type="text"
                            size="small"
                            @click="submitRow(scope.row)"
                            v-if="canSubmit(scope.row)"
                            v-permission="'leave:submit'"
                            >提交</el-button
                        >
                        <el-divider
                            direction="vertical"
                            v-if="canSubmit(scope.row) && (canDelete(scope.row) || scope.row.status !== 0)"
                        ></el-divider>
                        <el-button
                            type="text"
                            size="small"
                            @click="cancelRow(scope.row)"
                            v-if="scope.row.status === 1"
                            v-permission="'leave:cancel'"
                            >撤销</el-button
                        >
                        <el-divider direction="vertical" v-if="scope.row.status === 1"></el-divider>
                        <el-button
                            type="text"
                            size="small"
                            @click="deleteSubmit(scope.row)"
                            v-if="canDelete(scope.row)"
                            v-permission="'leave:delete'"
                            >删除</el-button
                        >
                        <el-divider direction="vertical" v-if="canDelete(scope.row) && scope.row.status !== 0"></el-divider>
                        <el-button type="text" size="small" @click="handleProcess(scope.row)" v-if="scope.row.status !== 0"
                            >流程查看</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>
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
        <el-dialog :title="dialogTitle" width="760px" :visible.sync="formVisible" :close-on-click-modal="false">
            <el-form :model="form" label-width="90px" :rules="formRules" ref="form">
                <el-row :gutter="16">
                    <el-col :span="12">
                        <el-form-item label="申请人">
                            <el-input v-model="form.applicantName" disabled></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="请假类型" prop="leaveType">
                            <el-select v-model="form.leaveType" placeholder="请选择请假类型">
                                <el-option
                                    v-for="item in leaveTypeOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="请假时间" prop="leaveTime">
                            <el-date-picker
                                v-model="form.leaveTime"
                                type="datetimerange"
                                range-separator="至"
                                start-placeholder="开始时间"
                                end-placeholder="结束时间"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                style="width: 100%"
                            ></el-date-picker>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="时长(天)" prop="duration">
                            <el-input-number
                                v-model="form.duration"
                                :min="0.5"
                                :precision="1"
                                :step="0.5"
                                controls-position="right"
                                style="width: 100%"
                            ></el-input-number>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="请假事由" prop="reason">
                            <el-input
                                type="textarea"
                                v-model.trim="form.reason"
                                :rows="4"
                                maxlength="500"
                                show-word-limit
                                placeholder="请输入请假事由"
                            ></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="formVisible = false">取消</el-button>
                <el-button type="primary" @click="formSubmit">提交</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import md5 from 'md5'

export default {
    data() {
        return {
            action: this.$axios.defaults.baseURL + '/leave/import',
            headers: {
                Authorization: localStorage.getItem('Authorization')
            },
            tableHeight: 300,
            tableData: [],
            pageNo: 1,
            total: 0,
            searchForm: {
                applicantName: '',
                leaveType: '',
                status: '',
                dateRange: []
            },
            formVisible: false,
            dialogTitle: '新增',
            formType: 'add',
            form: {
                id: '',
                companyId: '',
                applicantId: '',
                applicantName: '',
                leaveType: '',
                leaveTime: [],
                duration: 1,
                reason: ''
            },
            leaveTypeOptions: [
                { value: 1, label: '事假' },
                { value: 2, label: '病假' },
                { value: 3, label: '年假' },
                { value: 4, label: '调休' },
                { value: 5, label: '婚假' },
                { value: 6, label: '产假' },
                { value: 7, label: '丧假' },
                { value: 8, label: '其他' }
            ],
            statusOptions: [
                { value: 0, label: '草稿' },
                { value: 1, label: '审批中' },
                { value: 2, label: '已撤销' },
                { value: 3, label: '已通过' },
                { value: 4, label: '已驳回' }
            ],
            formRules: {
                leaveType: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
                leaveTime: [{ required: true, message: '请选择请假时间', trigger: 'change' }],
                duration: [{ required: true, message: '请填写请假时长', trigger: 'blur' }],
                reason: [{ required: true, message: '请输入请假事由', trigger: 'blur' }]
            }
        }
    },
    created() {
        let timestamp = Date.now()
        this.headers.Sign = md5(
            'leave/import?timestamp=' + timestamp + '&key=yVwlsbIrY3q22EnoYYM4nR5zqTmqed05'
        ).toUpperCase()
        this.headers.Timestamp = timestamp
        this.queryByPage()
    },
    mounted() {
        this.setTableHeight()
        window.addEventListener('resize', this.setTableHeight)
    },
    activated() {
        this.setTableHeight()
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.setTableHeight)
    },
    methods: {
        setTableHeight() {
            this.$nextTick(() => {
                const page = this.$refs.page
                const tableBox = this.$refs.tableBox
                if (!page || !tableBox) {
                    return
                }
                const pagination = tableBox.querySelector('.pagination')
                const pageRect = page.getBoundingClientRect()
                const tableRect = tableBox.getBoundingClientRect()
                const paginationHeight = pagination ? pagination.offsetHeight : 0
                const availableHeight = pageRect.bottom - tableRect.top - paginationHeight - 1
                this.tableHeight = Math.max(120, Math.floor(availableHeight))
            })
        },
        async queryByPage() {
            const params = {
                pageNo: this.pageNo,
                companyId: localStorage.getItem('companyId'),
                applicantName: this.searchForm.applicantName,
                leaveType: this.searchForm.leaveType,
                status: this.searchForm.status
            }
            if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
                params.startTime = this.searchForm.dateRange[0] + ' 00:00:00'
                params.endTime = this.searchForm.dateRange[1] + ' 23:59:59'
            }
            const res = await this.$axios.get('leave/queryByPage', { params })
            if (res.data.code == 200) {
                this.tableData = res.data.data.list
                this.total = res.data.data.total
                this.setTableHeight()
            }
        },
        handleSearch() {
            this.pageNo = 1
            this.setTableHeight()
            this.queryByPage()
        },
        resetSearch() {
            this.searchForm = {
                applicantName: '',
                leaveType: '',
                status: '',
                dateRange: []
            }
            this.handleSearch()
        },
        handleCurrentChange(val) {
            this.queryByPage()
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
                this.$message.success('导入成功')
                this.queryByPage()
            } else {
                this.$message.error(res.message)
            }
        },
        downloadTemplate(templateName) {
            let params = {
                templateName: templateName
            }
            this.$axios.post('upload/downloadTemplate', params, { responseType: 'blob' }).then(res => {
                this.downloadBlob(res.data, templateName)
            })
        },
        downloadLeave() {
            let params = {
                exportCompanyId: localStorage.getItem('companyId'),
                exportApplicantName: this.searchForm.applicantName,
                exportLeaveType: this.searchForm.leaveType,
                exportStatus: this.searchForm.status
            }
            if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
                params.exportStartTime = this.searchForm.dateRange[0] + ' 00:00:00'
                params.exportEndTime = this.searchForm.dateRange[1] + ' 23:59:59'
            }
            this.$axios.post('leave/export', params, { responseType: 'blob' }).then(res => {
                this.downloadBlob(res.data, '请假单列表.xlsx')
            })
        },
        downloadBlob(content, fileName) {
            let blob = new Blob([content])
            if ('download' in document.createElement('a')) {
                let elink = document.createElement('a')
                elink.download = fileName
                elink.style.display = 'none'
                elink.href = URL.createObjectURL(blob)
                document.body.appendChild(elink)
                elink.click()
                URL.revokeObjectURL(elink.href)
                document.body.removeChild(elink)
            } else {
                navigator.msSaveBlob(blob, fileName)
            }
        },
        showAddDialog() {
            this.formType = 'add'
            this.dialogTitle = '新增'
            this.form = {
                id: '',
                companyId: localStorage.getItem('companyId'),
                applicantId: localStorage.getItem('userId'),
                applicantName: localStorage.getItem('name'),
                leaveType: '',
                leaveTime: [],
                duration: 1,
                reason: ''
            }
            this.formVisible = true
            this.$nextTick(() => {
                this.$refs.form && this.$refs.form.clearValidate()
            })
        },
        showEditDialog(row) {
            this.formType = 'edit'
            this.dialogTitle = '编辑'
            this.form = {
                id: row.id,
                companyId: row.companyId,
                applicantId: row.applicantId,
                applicantName: row.applicantName,
                leaveType: row.leaveType,
                leaveTime: [row.startTime, row.endTime],
                duration: Number(row.duration),
                reason: row.reason
            }
            this.formVisible = true
            this.$nextTick(() => {
                this.$refs.form && this.$refs.form.clearValidate()
            })
        },
        formSubmit() {
            this.$refs.form.validate(async valid => {
                if (!valid) {
                    return
                }
                const params = this.buildFormParams()
                const url = this.formType === 'add' ? 'leave/insert' : 'leave/update'
                const res = await this.$axios.post(url, params)
                if (res.data.code == 200) {
                    this.$message.success('保存成功')
                    this.formVisible = false
                    this.queryByPage()
                }
            })
        },
        buildFormParams() {
            return {
                id: this.form.id,
                companyId: this.form.companyId,
                applicantId: this.form.applicantId,
                leaveType: this.form.leaveType,
                startTime: this.form.leaveTime[0],
                endTime: this.form.leaveTime[1],
                duration: this.form.duration,
                reason: this.form.reason
            }
        },
        submitRow(row) {
            this.$confirm('确定提交该请假单吗？', '提示', {
                type: 'warning'
            }).then(async () => {
                const res = await this.$axios.post('leave/submit/' + row.id, {})
                if (res.data.code == 200) {
                    this.$message.success('提交成功')
                    this.queryByPage()
                } else {
                    this.$message.warning(res.data.message || '提交失败')
                }
            })
        },
        cancelRow(row) {
            this.$confirm('确定撤销该请假单吗？', '提示', {
                type: 'warning'
            }).then(async () => {
                const res = await this.$axios.post('leave/cancel/' + row.id, {})
                if (res.data.code == 200) {
                    this.$message.success('撤销成功')
                    this.queryByPage()
                }
            })
        },
        deleteSubmit(row) {
            this.$confirm('确认删除该请假单吗？', '提示', {
                type: 'warning'
            }).then(async () => {
                const res = await this.$axios.post('leave/delete/' + row.id, {})
                if (res.data.code == 200) {
                    this.$message.success('删除成功')
                    this.queryByPage()
                }
            })
        },
        handleProcess(row) {
            this.$router.push({
                path: '/flowDisplay',
                query: {
                    businessKey: row.id,
                    businessType: 'leave_request',
                    title: '请假单-' + row.id
                }
            })
        },
        goDetail(row) {
            this.$router.push({
                path: '/leaveDetail',
                query: {
                    businessKey: row.id,
                    businessType: 'leave_request',
                    title: '请假单-' + (row.applicantName || row.id),
                    source: 'view'
                }
            })
        },
        leaveTypeFormatter(row) {
            const item = this.leaveTypeOptions.find(item => item.value === row.leaveType)
            return item ? item.label : ''
        },
        statusFormatter(row) {
            const item = this.statusOptions.find(item => item.value === row.status)
            return item ? item.label : ''
        },
        statusTagType(status) {
            if (status === 1) {
                return 'warning'
            }
            if (status === 2) {
                return 'info'
            }
            if (status === 3) {
                return 'success'
            }
            if (status === 4) {
                return 'danger'
            }
            return 'warning'
        },
        canEdit(row) {
            return row.status === 0 || row.status === 2 || row.status === 4
        },
        canSubmit(row) {
            return row.status === 0 || row.status === 2 || row.status === 4
        },
        canDelete(row) {
            return row.status === 0 || row.status === 2 || row.status === 4
        }
    }
}
</script>
<style scoped>
.leave-page {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.leave-table {
    flex: 1;
    min-height: 0;
}

.leave-table ::v-deep .el-table__body tr {
    cursor: pointer;
}
</style>
