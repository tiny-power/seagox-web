<template>
    <div>
        <div class="searchView" style="padding-top: 10px">
            <el-form label-width="60px" :inline="true" size="medium">
                <el-form-item label="标题">
                    <el-input v-model="searchContent.title" placeholder="请输入标题" clearable> </el-input>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select
                        v-model="searchContent.statusData"
                        multiple
                        clearable
                        @change="statusChange"
                        placeholder="请选择状态"
                        filterable
                    >
                        <el-option
                            v-for="item in statusOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="类别">
                    <el-select
                        v-model="searchContent.businessType"
                        multiple
                        clearable
                        placeholder="请选择类别"
                        filterable
                        collapse-tags
                    >
                        <el-option
                            v-for="item in businessTypeOptions"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" @click.native="handleSearch">查询</el-button>
                    <el-button type="primary" plain icon="el-icon-check" @click.native="showBatchDialog"
                        >批量审批</el-button
                    >
                </el-form-item>
            </el-form>
        </div>
        <div class="table">
            <!--列表-->
            <el-table
                ref="multipleTable"
                :data="tableData"
                border
                stripe
                @row-dblclick="goDetail"
                :cell-style="cellStyle"
                row-key="id"
                @selection-change="handleSelectionChange"
                :height="clientHeight - 205"
            >
                <el-table-column type="selection" width="55"> </el-table-column>
                <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
                <el-table-column prop="name" label="标题" align="center" show-overflow-tooltip></el-table-column>
                <el-table-column
                    prop="assigneeName"
                    label="发起人"
                    align="center"
                    show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                    prop="createTime"
                    label="提交时间"
                    align="center"
                    show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                    prop="status"
                    label="状态"
                    align="center"
                    :formatter="statusFormatter"
                    show-overflow-tooltip
                ></el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="handleProcess(scope.row)">流程查看</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!--分页-->
            <div class="pagination">
                <el-pagination
                    background
                    @current-change="handleCurrentChange"
                    layout="total, prev, pager, next"
                    :page-size="pageSize"
                    :current-page.sync="pageNo"
                    :total="total"
                >
                </el-pagination>
            </div>
        </div>
        <!--流程审批-->
        <el-dialog title="审批" width="500px" :visible.sync="approvalVisible" :close-on-click-modal="false">
            <el-form :model="handleForm" label-width="0px" ref="approvalForm">
                <el-form-item>
                    <el-radio-group v-model="handleForm.approved">
                        <el-radio :label="true">同意</el-radio>
                        <el-radio :label="false">不同意</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item style="margin-top: -20px">
                    <el-input type="textarea" :rows="10" placeholder="请输入处理意见" v-model="handleForm.comment">
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="handleForm.rejectNode" v-if="!handleForm.approved">
                        <el-option v-for="item in rejectNodeList" :key="item.id" :label="item.label" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="approvalVisible = false">取消</el-button>
                <el-button type="primary" @click="handleBatch">提交</el-button>
            </div>
        </el-dialog>
        <el-dialog title="审批提示" width="550px" :visible.sync="validVisible" :close-on-click-modal="false">
            <div style="padding-bottom: 15px; max-height: 300px; overflow: auto">
                <div>
                    处理成功数：<span style="color: #2ba471; font-weight: bold; font-size: 16px">{{ successNum }}</span
                    >;处理失败数：<span style="color: #d54941; font-weight: bold; font-size: 16px">{{ errorNum }}</span>
                </div>
                <div
                    v-for="(item, index) in failList"
                    :key="index"
                    style="color: #f56c6c; font-size: 16px; margin-top: 10px; max-height: 300px; overflow: auto"
                >
                    {{ index + 1 + '、' }} {{ item }}
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="validVisible = false">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            clientHeight: document.documentElement.clientHeight || document.body.clientHeight,
            statusOptions: [
                {
                    value: 0,
                    label: '待审'
                },
                {
                    value: 2,
                    label: '驳回'
                },
                {
                    value: 3,
                    label: '撤回'
                }
            ],
            searchContent: {
                title: '',
                statusData: [],
                businessType: []
            },
            tableData: [],
            pageNo: 1,
            total: 0,
            pageSize: 10,
            businessTypeOptions: [],
            multipleSelection: [],
            approvalVisible: false,
            handleForm: { approved: true, comment: '', rejectNode: '' },
            rejectNodeList: [{ id: 'start', label: '重新提交审批时，按审批流程从头开始审批' }],
            validVisible: false,
            successNum: 0,
            errorNum: 0,
            failList: []
        }
    },

    mounted() {
        this.queryByPage()
        this.queryBusinessTypes()
    },
    methods: {
        cellStyle(column) {
            if (column.columnIndex === 0 && column.row.returnNumber > 2) {
                return {
                    cursor: 'pointer',
                    color: '#ef0022 !important'
                }
            } else {
                return {
                    cursor: 'pointer'
                }
            }
        },
        statusFormatter(obj) {
            if (obj.status === 0) {
                return '待审'
            } else if (obj.status === 2) {
                return '驳回'
            } else {
                return '撤回'
            }
        },
        statusChange(val) {
            this.searchContent.status = val
        },
        goDetail(row) {
            this.$router.push({
                path: '/handleCustomForm',
                query: {
                    id: row.businessKey,
                    formId: row.businessType,
                    title: row.name
                }
            })
        },
        // 流程查看
        handleProcess(row) {
            this.$router.push({
                path: '/flowDisplay',
                query: {
                    businessKey: row.businessKey,
                    businessType: row.businessType,
                    title: row.name
                }
            })
        },
        queryByPage() {
            let params = {
                pageNo: this.pageNo,
                name: this.searchContent.title,
                statusStr: this.searchContent.statusData.join(','),
                businessTypeStr: this.searchContent.businessType.join(',')
            }
            this.$axios.get('flow/queryTodoItem', { params }).then(res => {
                if (res.data.code === 200) {
                    this.tableData = res.data.data.list
                    this.total = res.data.data.total
                } else {
                    this.$message.error(res.data.message)
                }
            })
        },
        handleSearch() {
            this.queryByPage()
        },
        handleCurrentChange() {
            this.queryByPage()
        },
        queryBusinessTypes() {
            this.$axios.get('form/queryBusinessTypes').then(res => {
                if (res.data.code === 200) {
                    this.businessTypeOptions = res.data.data
                }
            })
        },
        handleSelectionChange(val) {
            this.multipleSelection = val
        },
        showBatchDialog() {
            if (this.multipleSelection.length === 0) {
                this.$message.warning('请至少选择一条数据')
                return
            }
            this.approvalVisible = true
            if (this.$refs.handleForm) {
                this.$refs.handleForm.resetFields()
            }
        },
        handleBatch() {
            let params = {
                approved: this.handleForm.approved,
                comment: this.handleForm.comment,
                rejectNode: 'start',
                batchData: JSON.stringify(this.multipleSelection)
            }
            this.$axios.post('flow/batchApprove', params).then(res => {
                if (res.data.code === 200) {
                    this.pageNo = 1
                    this.queryByPage()
                    this.validVisible = true
                    this.successNum = res.data.data.successNum
                    this.errorNum = res.data.data.errorNum
                    this.failList = res.data.data.failList
                } else {
                    this.$message.error(res.data.message)
                }
            })
        }
    }
}
</script>
<style scoped>
::v-deep .el-dialog__body {
    padding: 10px 20px 0px 20px;
}
</style>
