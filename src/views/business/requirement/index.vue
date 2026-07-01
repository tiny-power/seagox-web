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
                    <el-option v-for="item in projectOptions" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="状态">
                <el-select v-model="query.status" clearable placeholder="请选择状态">
                    <el-option label="待提交" :value="1" />
                    <el-option label="待审核" :value="2" />
                    <el-option label="已完成" :value="3" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
                <el-button icon="el-icon-refresh" @click="reset">重置</el-button>
            </el-form-item>
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
                @row-dblclick="viewDetail"
            >
                <el-table-column type="index" label="序号" width="55" align="center" />
                <el-table-column
                    prop="projectName"
                    label="项目名称"
                    min-width="180"
                    align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatValue(scope.row.projectName) }}</template>
                </el-table-column>
                <el-table-column prop="style" label="风格偏好" min-width="150" align="center" show-overflow-tooltip />
                <el-table-column prop="budget" label="预算范围" min-width="140" align="center" show-overflow-tooltip />
                <el-table-column prop="member" label="家庭成员" min-width="160" align="center" show-overflow-tooltip />
                <el-table-column prop="statusText" label="状态" width="100" align="center">
                    <template slot-scope="scope">
                        <el-tag size="small" :type="statusType(scope.row.status)">{{
                            formatValue(scope.row.statusText)
                        }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="signedAt" label="签字时间" width="170" align="center" show-overflow-tooltip>
                    <template slot-scope="scope">{{ formatValue(scope.row.signedAt) }}</template>
                </el-table-column>
                <el-table-column prop="updatedAt" label="更新时间" width="170" align="center" show-overflow-tooltip>
                    <template slot-scope="scope">{{ formatValue(scope.row.updatedAt) }}</template>
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

        <el-dialog title="需求沟通详情" :visible.sync="detailVisible" width="720px">
            <el-descriptions v-if="detail" :column="2" border>
                <el-descriptions-item label="项目名称">{{ formatValue(detail.projectName) }}</el-descriptions-item>
                <el-descriptions-item label="状态">{{ formatValue(detail.statusText) }}</el-descriptions-item>
                <el-descriptions-item label="风格偏好">{{ formatValue(detail.style) }}</el-descriptions-item>
                <el-descriptions-item label="预算范围">{{ formatValue(detail.budget) }}</el-descriptions-item>
                <el-descriptions-item label="家庭成员">{{ formatValue(detail.member) }}</el-descriptions-item>
                <el-descriptions-item label="签字时间">{{ formatValue(detail.signedAt) }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ formatValue(detail.updatedAt) }}</el-descriptions-item>
                <el-descriptions-item label="签字文件">
                    <a v-if="detail.signatureUrl" :href="detail.signatureUrl" target="_blank">打开签字文件</a>
                    <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="特殊需求" :span="2">{{
                    formatValue(detail.mark)
                }}</el-descriptions-item>
            </el-descriptions>
        </el-dialog>
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
            query: this.createQuery(),
            detailVisible: false,
            detail: null
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
                status: ''
            }
        },
        formatValue(value) {
            return value === null || value === undefined || value === '' ? '-' : value
        },
        statusType(status) {
            if (Number(status) === 3) return 'success'
            if (Number(status) === 2) return 'warning'
            return 'info'
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
                } else {
                    this.$message.error(response.data.message || '项目查询失败')
                }
            } finally {
                this.projectLoading = false
            }
        },
        async load() {
            this.loading = true
            try {
                let response = await this.$axios.get('requirement/queryByPage', { params: this.query })
                if (response.data.code === 200) {
                    let data = response.data.data || {}
                    this.rows = data.list || []
                    this.total = data.total || 0
                } else {
                    this.$message.error(response.data.message || '查询失败')
                }
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
        viewDetail(row) {
            this.detail = row
            this.detailVisible = true
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
