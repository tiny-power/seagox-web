<template>
    <div class="document-page">
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
                <el-form-item label="问题标题">
                    <el-input
                        v-model.trim="query.keyword"
                        clearable
                        placeholder="请输入问题标题"
                        @keyup.enter.native="search"
                    />
                </el-form-item>
                <el-form-item label="问题来源">
                    <el-select v-model="query.sourceType" clearable placeholder="请选择问题来源">
                        <el-option label="施工日志" :value="1" />
                        <el-option label="验收单" :value="2" />
                        <el-option label="交接单" :value="3" />
                    </el-select>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="query.status" clearable placeholder="请选择状态">
                        <el-option label="待整改" :value="1" />
                        <el-option label="整改中" :value="2" />
                        <el-option label="待复验" :value="3" />
                        <el-option label="已关闭" :value="4" />
                    </el-select>
                </el-form-item>
                <el-form-item
                    ><el-button type="primary" icon="el-icon-search" @click="search">查询</el-button
                    ><el-button icon="el-icon-refresh" @click="reset">重置</el-button></el-form-item
                >
            </el-form>
            <div class="table-wrapper">
            <el-table
                class="rounded-table"
                v-loading="loading"
                :data="rows"
                :row-style="{ cursor: 'pointer' }"
                height="100%"
                border
                stripe
                @row-dblclick="view"
            >
                <el-table-column type="index" label="序号" width="55" align="center" />
                <el-table-column
                    prop="title"
                    label="问题标题"
                    min-width="190"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatValue(scope.row.title) }}</template>
                </el-table-column>
                <el-table-column
                    prop="projectName"
                    label="项目名称"
                    min-width="160"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatValue(scope.row.projectName) }}</template>
                </el-table-column>
                <el-table-column
                    prop="sourceType"
                    label="问题来源"
                    width="110"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatSourceType(scope.row.sourceType) }}</template>
                </el-table-column>
                <el-table-column
                    prop="reportedByName"
                    label="发现人"
                    width="100"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatValue(scope.row.reportedByName) }}</template>
                </el-table-column>
                <el-table-column
                    prop="rectificationUserName"
                    label="整改责任人"
                    width="110"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatValue(scope.row.rectificationUserName) }}</template>
                </el-table-column>
                <el-table-column
                    prop="rectificationDeadline"
                    label="整改截止时间"
                    width="170"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatValue(scope.row.rectificationDeadline) }}</template>
                </el-table-column>
                <el-table-column
                    prop="status"
                    label="状态"
                    width="100"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatIssueStatus(scope.row.status) }}</template>
                </el-table-column>
            </el-table>
            </div>
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
                keyword: '',
                sourceType: '',
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
                keyword: '',
                sourceType: '',
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
        formatSourceType(value) {
            if (value === null || value === undefined || value === '') return '-'
            switch (String(value)) {
                case '1':
                    return '施工日志'
                case '2':
                    return '验收单'
                case '3':
                    return '交接单'
                default:
                    return value
            }
        },
        formatIssueStatus(value) {
            if (value === null || value === undefined || value === '') return '-'
            switch (String(value)) {
                case '1':
                    return '待整改'
                case '2':
                    return '整改中'
                case '3':
                    return '待复验'
                case '4':
                    return '已关闭'
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
                let response = await this.$axios.get('issueTicket/queryByPage', { params: this.buildParams() })
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
            this.$router.push({ path: '/issueTicketDetail', query: { id: row.id } })
        }
    }
}
</script>

<style scoped>
.document-page {
    padding: 20px;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
.filter-form {
    margin-bottom: 4px;
    flex: none;
}
.filter-form .el-input,
.filter-form .el-select {
    width: 170px;
}
.filter-form .el-date-editor {
    width: 250px;
}
.rounded-table {
    border-radius: 8px;
    overflow: hidden;
}
.table-wrapper {
    flex: 1;
    min-height: 0;
    overflow: hidden;
}
.el-pagination {
    margin-top: 16px;
    text-align: right;
    flex: none;
}
</style>
