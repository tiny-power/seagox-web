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
                    <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
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
                height="100%"
                border
                stripe
                @row-dblclick="openDetail"
            >
                <el-table-column type="index" label="序号" width="55" align="center" />
                <el-table-column prop="projectName" label="项目名称" min-width="180" align="center" show-overflow-tooltip />
                <el-table-column label="版本" width="100" align="center">
                    <template slot-scope="scope">{{ versionLabel(scope.row.version) }}</template>
                </el-table-column>
                <el-table-column prop="solutionExplanation" label="修改说明" min-width="220" align="center" show-overflow-tooltip />
                <el-table-column label="确认状态" width="260" align="center">
                    <template slot-scope="scope">
                        <span>{{ confirmText(scope.row.confirmMembers) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="statusText" label="状态" width="100" align="center">
                    <template slot-scope="scope">
                        <el-tag size="small" :type="statusType(scope.row.status)">{{ scope.row.statusText || '-' }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="updatedAt" label="更新时间" width="170" align="center" />
                <el-table-column label="操作" width="120" align="center" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="openDetail(scope.row)">版本记录</el-button>
                    </template>
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

        <el-dialog title="版本记录" :visible.sync="detailVisible" width="900px">
            <div v-loading="detailLoading" class="version-dialog">
                <el-empty v-if="!detailVersions.length && !detailLoading" description="暂无版本记录"></el-empty>
                <div class="version-record" v-for="item in detailVersions" :key="item.id">
                    <div class="version-record__head">
                        <span class="version-record__title">{{ versionLabel(item.version) }}</span>
                        <span class="version-record__time">{{ item.updatedAt || item.createdAt || '-' }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">修改说明</span>
                        <span class="detail-value">{{ item.solutionExplanation || '-' }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">确认状态</span>
                        <span class="detail-value">{{ confirmText(item.confirmMembers) }}</span>
                    </div>
                    <div class="attachment-group" v-for="category in categories" :key="category.key">
                        <div class="attachment-title">{{ category.label }}</div>
                        <div class="attachment-list">
                            <div class="attachment-item" v-for="file in parseAttachments(item[category.key])" :key="file.url">
                                <i class="el-icon-document attachment-icon"></i>
                                <div class="attachment-info">
                                    <a :href="file.url" target="_blank" class="attachment-name">{{ file.name || '附件' }}</a>
                                    <span>{{ file.type || '-' }}</span>
                                    <span>{{ formatSize(file.size) }}</span>
                                </div>
                            </div>
                            <el-empty v-if="!parseAttachments(item[category.key]).length" description="暂无附件"></el-empty>
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            loading: false,
            projectLoading: false,
            rows: [],
            total: 0,
            projectOptions: [],
            query: this.createQuery(),
            detailVisible: false,
            detailLoading: false,
            detailVersions: [],
            categories: [
                { key: 'architectureAttachments', label: '建筑设计附件' },
                { key: 'structureAttachments', label: '结构设计附件' },
                { key: 'decorationAttachments', label: '精装图纸附件' },
                { key: 'procurementAttachments', label: '主材及软装采购方案附件' }
            ],
            statusOptions: [
                { value: 1, label: '待提交' },
                { value: 2, label: '待确认' },
                { value: 3, label: '已归档' }
            ]
        }
    },
    created() {
        this.loadProjects()
        this.load()
    },
    methods: {
        createQuery() {
            return { pageNo: 1, pageSize: 10, projectId: '', status: '' }
        },
        createConfirmMembers() {
            return {
                owner: { confirmed: false, confirmedAt: '' },
                builder: { confirmed: false, confirmedAt: '' }
            }
        },
        statusType(status) {
            return { 2: 'warning', 3: 'success' }[Number(status)] || 'info'
        },
        versionLabel(version) {
            return Number(version) > 0 ? `V${Number(version)}.0` : '-'
        },
        parseAttachments(value) {
            if (Array.isArray(value)) return value
            if (!value) return []
            try {
                const data = JSON.parse(value)
                return Array.isArray(data) ? data : []
            } catch (error) {
                return []
            }
        },
        parseConfirmMembers(value) {
            if (!value) return this.createConfirmMembers()
            try {
                const data = typeof value === 'string' ? JSON.parse(value) : value
                return {
                    owner: Object.assign({ confirmed: false, confirmedAt: '' }, data.owner || {}),
                    builder: Object.assign({ confirmed: false, confirmedAt: '' }, data.builder || {})
                }
            } catch (error) {
                return this.createConfirmMembers()
            }
        },
        confirmText(value) {
            const data = this.parseConfirmMembers(value)
            const ownerName = data.owner && data.owner.name ? `(${data.owner.name})` : ''
            const builderName = data.builder && data.builder.name ? `(${data.builder.name})` : ''
            const owner = data.owner && data.owner.confirmed ? `业主${ownerName}已确认` : `业主${ownerName}待确认`
            const builder = data.builder && data.builder.confirmed ? `施工${builderName}已确认` : `施工${builderName}待确认`
            return `${owner} / ${builder}`
        },
        formatSize(size) {
            const value = Number(size)
            if (!value) return '-'
            if (value < 1024) return `${value}B`
            if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)}KB`
            return `${(value / 1024 / 1024).toFixed(1)}MB`
        },
        async loadProjects(name) {
            this.projectLoading = true
            try {
                const response = await this.$axios.get('project/queryByPage', {
                    params: { pageNo: 1, pageSize: 50, name: name || '' }
                })
                if (response.data.code === 200) this.projectOptions = (response.data.data || {}).list || []
                else this.$message.error(response.data.message || '项目查询失败')
            } finally {
                this.projectLoading = false
            }
        },
        async load() {
            this.loading = true
            try {
                const response = await this.$axios.get('constructionDrawing/queryByPage', { params: this.query })
                if (response.data.code === 200) {
                    const data = response.data.data || {}
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
        async openDetail(row) {
            this.detailVisible = true
            this.detailLoading = true
            this.detailVersions = []
            try {
                const response = await this.$axios.get(`constructionDrawing/queryById/${row.id}`)
                if (response.data.code === 200) {
                    const data = response.data.data || {}
                    this.detailVersions = data.details || []
                } else this.$message.error(response.data.message || '详情查询失败')
            } finally {
                this.detailLoading = false
            }
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
.form-control {
    width: 100%;
}
.version-dialog {
    min-height: 160px;
}
.version-record {
    border: 1px solid #ebeef5;
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 12px;
}
.version-record__head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
}
.version-record__title {
    font-weight: 600;
    color: #303133;
}
.version-record__time {
    color: #909399;
    font-size: 12px;
}
.detail-row {
    display: flex;
    margin-bottom: 10px;
    line-height: 22px;
}
.detail-label {
    width: 80px;
    color: #909399;
    flex: none;
}
.detail-value {
    color: #303133;
    flex: 1;
}
.attachment-group {
    margin-top: 12px;
}
.attachment-title {
    font-weight: 600;
    margin-bottom: 8px;
}
.attachment-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 10px;
}
.attachment-item {
    display: flex;
    gap: 10px;
    padding: 10px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
}
.attachment-icon {
    font-size: 28px;
    color: #409eff;
}
.attachment-info {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: #909399;
}
.attachment-name {
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
