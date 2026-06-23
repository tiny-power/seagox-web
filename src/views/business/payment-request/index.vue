<template>
    <div class="document-page">
        <el-card shadow="never">
            <div slot="header" class="card-header"><span>请款单</span></div>
            <el-form :inline="true" :model="query" class="filter-form" @submit.native.prevent>
                <el-form-item label="项目名称">
                    <el-select
                        v-model="query.projectId"
                        clearable
                        filterable
                        remote
                        :remote-method="loadProjects"
                        :loading="projectLoading"
                        placeholder="请选择项目"
                    >
                        <el-option
                            v-for="item in projectOptions"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="申请人">
                    <el-input
                        v-model.trim="query.applicantName"
                        clearable
                        placeholder="请输入申请人"
                        @keyup.enter.native="search"
                    />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="query.status" clearable placeholder="请选择状态">
                        <el-option label="草稿" :value="0" />
                        <el-option label="审批中" :value="1" />
                        <el-option label="已撤销" :value="2" />
                        <el-option label="已通过" :value="3" />
                        <el-option label="已驳回" :value="4" />
                    </el-select>
                </el-form-item>
                <el-form-item
                    ><el-button type="primary" icon="el-icon-search" @click="search">查询</el-button
                    ><el-button icon="el-icon-refresh" @click="reset">重置</el-button></el-form-item
                >
            </el-form>
            <el-table
                v-loading="loading"
                :data="rows"
                :row-style="{ cursor: 'pointer' }"
                border
                stripe
                @row-dblclick="view"
            >
                <el-table-column type="index" label="序号" width="55" align="center" />
                <el-table-column
                    prop="projectName"
                    label="项目名称"
                    min-width="180"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatValue(scope.row.projectName) }}</template>
                </el-table-column>
                <el-table-column
                    prop="applicantName"
                    label="申请人"
                    width="120"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatValue(scope.row.applicantName) }}</template>
                </el-table-column>
                <el-table-column
                    prop="amount"
                    label="请款金额"
                    width="140"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatMoney(scope.row.amount) }}</template>
                </el-table-column>
                <el-table-column
                    prop="reason"
                    label="请款事由"
                    min-width="220"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatValue(scope.row.reason) }}</template>
                </el-table-column>
                <el-table-column
                    prop="status"
                    label="状态"
                    width="100"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatPaymentStatus(scope.row.status) }}</template>
                </el-table-column>
                <el-table-column
                    prop="submitTime"
                    label="提交时间"
                    width="170"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatValue(scope.row.submitTime) }}</template>
                </el-table-column>
                <el-table-column
                    prop="createdAt"
                    label="创建时间"
                    width="170"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatValue(scope.row.createdAt) }}</template>
                </el-table-column>
            </el-table>
            <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                :current-page="query.pageNo"
                :page-size="query.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                @current-change="pageChange"
                @size-change="sizeChange"
            />
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            loading: false,
            projectLoading: false,
            projectOptions: [],
            rows: [],
            total: 0,
            query: {
                pageNo: 1,
                pageSize: 10,
                projectId: '',
                applicantName: '',
                status: ''
            }
        }
    },
    created() {
        this.loadProjects()
        this.load()
    },
    methods: {
        createQuery() {
            return {
                pageNo: 1,
                pageSize: 10,
                projectId: '',
                applicantName: '',
                status: ''
            }
        },
        formatValue(value) {
            return value === null || value === undefined || value === '' ? '-' : value
        },
        formatBoolean(value) {
            if (value === null || value === undefined || value === '') return '-'
            return Number(value) === 1 ? '是' : '否'
        },
        formatMoney(value) {
            if (value === null || value === undefined || value === '') return '-'
            return '¥' + Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        },
        formatPaymentStatus(value) {
            if (value === null || value === undefined || value === '') return '-'
            switch (String(value)) {
                case '0':
                    return '草稿'
                case '1':
                    return '审批中'
                case '2':
                    return '已撤销'
                case '3':
                    return '已通过'
                case '4':
                    return '已驳回'
                default:
                    return value
            }
        },
        buildParams() {
            return { ...this.query }
        },
        async loadProjects(name) {
            this.projectLoading = true
            try {
                let response = await this.$axios.get('project/queryByPage', {
                    params: { pageNo: 1, pageSize: 50, name: name || '' }
                })
                if (response.data.code === 200) {
                    let data = response.data.data || {}
                    this.projectOptions = data.list || []
                } else this.$message.error(response.data.message || '项目查询失败')
            } finally {
                this.projectLoading = false
            }
        },
        async load() {
            this.loading = true
            try {
                let response = await this.$axios.get('paymentRequest/queryByPage', { params: this.buildParams() })
                if (response.data.code === 200) {
                    let data = response.data.data || {}
                    this.rows = data.list || []
                    this.total = data.total || 0
                } else this.$message.error(response.data.message || '查询失败')
            } finally {
                this.loading = false
            }
        },
        search() {
            this.query.pageNo = 1
            this.load()
        },
        reset() {
            this.query = this.createQuery()
            this.load()
        },
        pageChange(pageNo) {
            this.query.pageNo = pageNo
            this.load()
        },
        sizeChange(pageSize) {
            this.query.pageSize = pageSize
            this.query.pageNo = 1
            this.load()
        },
        view(row) {
            this.$router.push({ path: '/paymentRequestDetail', query: { id: row.id } })
        }
    }
}
</script>

<style scoped>
.document-page {
    padding: 20px;
}
.card-header {
    font-size: 16px;
    font-weight: 600;
}
.filter-form {
    margin-bottom: 4px;
}
.filter-form .el-input,
.filter-form .el-select {
    width: 170px;
}
.filter-form .el-date-editor {
    width: 250px;
}
.el-pagination {
    margin-top: 16px;
    text-align: right;
}
</style>
