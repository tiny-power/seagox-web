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
                <el-form-item label="状态">
                    <el-select v-model="query.status" clearable placeholder="请选择状态">
                        <el-option label="激活" :value="1" />
                        <el-option label="已解决" :value="2" />
                        <el-option label="已关闭" :value="3" />
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
                    prop="createdByName"
                    label="创建人"
                    width="100"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatValue(scope.row.createdByName) }}</template>
                </el-table-column>
                <el-table-column
                    prop="assigneeName"
                    label="负责人"
                    width="110"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatValue(scope.row.assigneeName) }}</template>
                </el-table-column>
                <el-table-column
                    prop="dueDate"
                    label="截止日期"
                    width="120"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatValue(scope.row.dueDate) }}</template>
                </el-table-column>
                <el-table-column
                    prop="resolution"
                    label="解决方案"
                    width="130"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatValue(scope.row.resolution) }}</template>
                </el-table-column>
                <el-table-column
                    prop="confirmed"
                    label="确认状态"
                    width="100"
                    align="center"
                    header-align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatConfirmed(scope.row.confirmed) }}</template>
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
        formatIssueStatus(value) {
            if (value === null || value === undefined || value === '') return '-'
            switch (String(value)) {
                case '1':
                    return '激活'
                case '2':
                    return '已解决'
                case '3':
                    return '已关闭'
                default:
                    return value
            }
        },
        formatConfirmed(value) {
            if (value === null || value === undefined || value === '') return '-'
            return Number(value) === 1 ? '已确认' : '未确认'
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
    padding: 12px;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
.filter-form {
    margin-bottom: 12px;
    flex: none;
}
.filter-form .el-input,
.filter-form .el-select {
    width: 170px;
}
.filter-form .el-date-editor {
    width: 250px;
}
::v-deep .filter-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 10px;
    row-gap: 12px;
}

::v-deep .filter-form .el-form-item {
    margin-bottom: 0;
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
