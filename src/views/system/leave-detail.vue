<template>
    <div class="leave-detail-page">
        <div class="detail-header">
            <div class="header-left">
                <el-button type="text" icon="el-icon-arrow-left" @click="goBack">返回</el-button>
                <span class="detail-title">{{ displayTitle }}</span>
            </div>
            <el-button type="primary" plain size="small" icon="el-icon-share" @click="handleProcess">流程查看</el-button>
        </div>

        <el-tabs v-model="activeTab" class="detail-tabs">
            <el-tab-pane label="表单详情" name="form">
                <div class="detail-section" v-loading="loading">
                    <el-form label-width="90px" size="medium">
                        <el-row :gutter="16">
                            <el-col :span="8">
                                <el-form-item label="申请人">
                                    <el-input :value="leaveForm.applicantName" disabled></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="请假类型">
                                    <el-input :value="leaveTypeFormatter(leaveForm.leaveType)" disabled></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="状态">
                                    <el-tag size="medium" :type="statusTagType(leaveForm.status)">
                                        {{ statusFormatter(leaveForm.status) }}
                                    </el-tag>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="开始时间">
                                    <el-input :value="leaveForm.startTime" disabled></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="结束时间">
                                    <el-input :value="leaveForm.endTime" disabled></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="时长(天)">
                                    <el-input :value="leaveForm.duration" disabled></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="提交时间">
                                    <el-input :value="leaveForm.submitTime" disabled></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="创建时间">
                                    <el-input :value="leaveForm.createTime" disabled></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="24">
                                <el-form-item label="请假事由">
                                    <el-input type="textarea" :rows="5" :value="leaveForm.reason" disabled></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>

                    <div class="approval-section" v-if="canApprove">
                        <div class="section-title">流程审批</div>
                        <el-form :model="approvalForm" label-width="90px" size="medium">
                            <el-form-item label="审批结果">
                                <el-radio-group v-model="approvalForm.approved">
                                    <el-radio :label="true">同意</el-radio>
                                    <el-radio :label="false">不同意</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item label="驳回节点" v-if="!approvalForm.approved">
                                <el-select v-model="approvalForm.rejectNode" placeholder="请选择驳回节点">
                                    <el-option
                                        v-for="item in rejectNodeList"
                                        :key="item.id"
                                        :label="item.label"
                                        :value="item.id"
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="处理意见">
                                <el-input
                                    type="textarea"
                                    :rows="4"
                                    v-model.trim="approvalForm.comment"
                                    placeholder="请输入处理意见"
                                ></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" :loading="approving" @click="handleApprove">提交审批</el-button>
                            </el-form-item>
                        </el-form>
                    </div>

                    <div class="approval-section" v-if="canSubmit">
                        <div class="section-title">流程提交</div>
                        <el-button type="primary" icon="el-icon-check" :loading="submitting" @click="handleSubmit"
                            >提交审批</el-button
                        >
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="审批记录" name="process">
                <el-table :data="processData" border stripe :height="tableHeight" v-loading="processLoading">
                    <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
                    <el-table-column prop="label" label="节点名称" align="center" show-overflow-tooltip></el-table-column>
                    <el-table-column
                        prop="nodeStatus"
                        label="节点状态"
                        align="center"
                        :formatter="nodeStatusFormatter"
                    ></el-table-column>
                    <el-table-column prop="name" label="执行人" align="center" show-overflow-tooltip></el-table-column>
                    <el-table-column prop="remark" label="审批意见" align="center" show-overflow-tooltip></el-table-column>
                    <el-table-column
                        prop="status"
                        label="状态"
                        align="center"
                        :formatter="processStatusFormatter"
                    ></el-table-column>
                    <el-table-column prop="startTime" label="接收时间" align="center" width="150"></el-table-column>
                    <el-table-column prop="endTime" label="审核时间" align="center" width="150"></el-table-column>
                    <el-table-column prop="consuming" label="耗时(分钟)" align="center" width="110"></el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
export default {
    data() {
        return {
            activeTab: 'form',
            loading: false,
            processLoading: false,
            approving: false,
            submitting: false,
            tableHeight: window.innerHeight - 230,
            leaveForm: {},
            processData: [],
            approvalForm: {
                approved: true,
                comment: '',
                rejectNode: 'start'
            },
            rejectNodeList: [{ id: 'start', label: '重新提交审批时，按审批流程从头开始审批' }],
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
            ]
        }
    },
    computed: {
        businessType() {
            return this.$route.query.businessType || 'leave_request'
        },
        businessKey() {
            return this.$route.query.businessKey || this.$route.query.id
        },
        source() {
            return this.$route.query.source || 'view'
        },
        canApprove() {
            return this.source === 'todo' && this.businessType === 'leave_request'
        },
        canSubmit() {
            return this.source === 'ready' && this.businessType === 'leave_request'
        },
        displayTitle() {
            if (this.$route.query.title) {
                return this.$route.query.title
            }
            if (this.leaveForm.applicantName) {
                return '请假单-' + this.leaveForm.applicantName
            }
            return '请假单详情'
        }
    },
    created() {
        this.queryDetail()
        this.queryProcessInfo()
    },
    mounted() {
        window.addEventListener('resize', this.setTableHeight)
        this.setTableHeight()
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.setTableHeight)
    },
    methods: {
        setTableHeight() {
            this.tableHeight = Math.max(240, window.innerHeight - 230)
        },
        async queryDetail() {
            if (this.businessType !== 'leave_request') {
                this.$message.warning('暂不支持该类别的表单详情')
                return
            }
            this.loading = true
            const res = await this.$axios.get('leave/queryById/' + this.businessKey)
            this.loading = false
            if (res.data.code === 200) {
                this.leaveForm = res.data.data || {}
            } else {
                this.$message.error(res.data.message)
            }
        },
        async queryProcessInfo() {
            this.processLoading = true
            const params = {
                businessType: this.businessType,
                businessKey: this.businessKey
            }
            const res = await this.$axios.post('flow/processInfo', params)
            this.processLoading = false
            if (res.data.code === 200) {
                this.processData = res.data.data || []
            }
        },
        async handleApprove() {
            if (!this.approvalForm.approved && !this.approvalForm.rejectNode) {
                this.$message.warning('请选择驳回节点')
                return
            }
            this.approving = true
            const params = {
                companyId: localStorage.getItem('companyId'),
                userId: localStorage.getItem('userId'),
                approved: this.approvalForm.approved,
                comment: this.approvalForm.comment,
                rejectNode: this.approvalForm.rejectNode || 'start',
                batchData: JSON.stringify([
                    {
                        businessType: this.businessType,
                        businessKey: this.businessKey,
                        name: this.displayTitle
                    }
                ])
            }
            const res = await this.$axios.post('flow/batchApprove', params)
            this.approving = false
            if (res.data.code === 200) {
                const result = res.data.data || {}
                if (result.errorNum > 0) {
                    this.$message.warning((result.failList || []).join('；') || '审批失败')
                    return
                }
                this.$message.success('审批完成')
                this.goBack()
            } else {
                this.$message.error(res.data.message)
            }
        },
        async handleSubmit() {
            this.submitting = true
            const params = {
                batchData: JSON.stringify([
                    {
                        id: this.$route.query.messageId,
                        businessType: this.businessType,
                        businessKey: this.businessKey,
                        name: this.displayTitle
                    }
                ])
            }
            const res = await this.$axios.post('flow/batchSubmit', params)
            this.submitting = false
            if (res.data.code === 200) {
                const result = res.data.data || {}
                if (result.errorNum > 0) {
                    this.$message.warning((result.failList || []).join('；') || '提交失败')
                    return
                }
                this.$message.success('提交成功')
                this.goBack()
            } else {
                this.$message.error(res.data.message)
            }
        },
        handleProcess() {
            this.$router.push({
                path: '/flowDisplay',
                query: {
                    businessKey: this.businessKey,
                    businessType: this.businessType,
                    title: this.displayTitle
                }
            })
        },
        goBack() {
            this.$router.go(-1)
        },
        leaveTypeFormatter(value) {
            const item = this.leaveTypeOptions.find(item => item.value === value)
            return item ? item.label : ''
        },
        statusFormatter(value) {
            const item = this.statusOptions.find(item => item.value === value)
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
        nodeStatusFormatter(row) {
            if (row.nodeStatus === 0) {
                return '待办'
            } else if (row.nodeStatus === 1) {
                return '通过'
            } else if (row.nodeStatus === 2) {
                return '不通过'
            } else if (row.nodeStatus === 3) {
                return '完成'
            } else if (row.nodeStatus === 4) {
                return '终止'
            }
            return '未知'
        },
        processStatusFormatter(row) {
            if (row.status === 0) {
                return '待办'
            } else if (row.status === 1) {
                return '同意'
            } else if (row.status === 2) {
                return '拒绝'
            } else if (row.status === 3) {
                return '已阅'
            } else if (row.status === 4) {
                return '撤回'
            } else if (row.status === 5) {
                return '挂起'
            } else if (row.status === 6) {
                return '激活'
            }
            return '未知'
        }
    }
}
</script>

<style scoped>
.leave-detail-page {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: #fff;
}

.detail-header {
    height: 54px;
    padding: 0 16px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
}

.header-left {
    display: flex;
    align-items: center;
    min-width: 0;
}

.detail-title {
    margin-left: 10px;
    font-size: 16px;
    font-weight: bold;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.detail-tabs {
    flex: 1;
    min-height: 0;
    padding: 0 16px;
}

.detail-section {
    padding-top: 10px;
    overflow-x: hidden;
}

.approval-section {
    margin-top: 8px;
    padding-top: 18px;
    border-top: 1px solid #ebeef5;
}

.section-title {
    margin-bottom: 16px;
    font-size: 15px;
    font-weight: bold;
    color: #303133;
}

::v-deep .el-tabs__content {
    height: calc(100% - 55px);
    overflow-y: auto;
    overflow-x: hidden;
}

::v-deep .detail-section .el-row {
    margin-left: 0 !important;
    margin-right: 0 !important;
}
</style>
