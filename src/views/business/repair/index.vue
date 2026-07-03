<template>
    <div class="document-page">
        <el-form :inline="true" :model="query" class="filter-form" @submit.native.prevent>
            <el-form-item label="项目">
                <el-select v-model="query.projectId" clearable filterable remote :remote-method="loadProjects"
                    placeholder="请选择项目">
                    <el-option v-for="item in projectOptions" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="状态">
                <el-select v-model="query.status" clearable placeholder="请选择状态">
                    <el-option v-for="item in statusOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="关键词">
                <el-input v-model.trim="query.keyword" clearable placeholder="类型/描述" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
                <el-button icon="el-icon-refresh" @click="reset">重置</el-button>
            </el-form-item>
        </el-form>

        <div class="table-wrapper">
            <el-table class="rounded-table" v-loading="loading" :data="rows" :row-style="{ cursor: 'pointer' }"
                height="100%" border stripe @row-dblclick="openDetail">
                <el-table-column type="index" label="序号" width="55" align="center" />
                <el-table-column prop="projectName" label="项目名称" min-width="160" show-overflow-tooltip />
                <el-table-column prop="type" label="报修类型" width="120" align="center" />
                <el-table-column prop="location" label="位置" width="100" align="center" />
                <el-table-column prop="description" label="问题描述" min-width="220" show-overflow-tooltip />
                <el-table-column prop="contact" label="联系人" width="100" align="center" />
                <el-table-column prop="repairMemberName" label="维修人员" width="110" align="center">
                    <template slot-scope="scope">{{ scope.row.repairMemberName || '待指派' }}</template>
                </el-table-column>
                <el-table-column prop="statusText" label="状态" width="100" align="center">
                    <template slot-scope="scope">
                        <el-tag size="small" :type="statusType(scope.row.status)">{{ scope.row.statusText || '-'
                            }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="repairAt" label="报修时间" width="170" align="center" />
            </el-table>
        </div>
        <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total"
            :current-page="query.pageNo" :page-size="query.pageSize" :page-sizes="[10, 20, 50, 100]"
            @current-change="pageChange" @size-change="sizeChange" />

        <el-dialog title="报修详情" :visible.sync="detailVisible" width="820px">
            <div v-if="detail">
                <div class="detail-row"><span>报修单号</span><b>{{ detail.repairNo || '-' }}</b></div>
                <div class="detail-row"><span>项目名称</span><b>{{ detail.projectName || '-' }}</b></div>
                <div class="detail-row"><span>报修类型</span><b>{{ detail.type }}</b></div>
                <div class="detail-row"><span>报修位置</span><b>{{ detail.location }}</b></div>
                <div class="detail-row"><span>问题描述</span><b>{{ detail.description }}</b></div>
                <div class="detail-row"><span>联系人</span><b>{{ detail.contact }} / {{ detail.contactNumber }}</b></div>
                <div class="detail-row"><span>维修人员</span><b>{{ detail.repairMemberName || '待指派' }}</b></div>
                <div class="detail-row"><span>预计上门</span><b>{{ detail.expectedVisitAt || '-' }}</b></div>
                <div class="detail-row"><span>报修时间</span><b>{{ detail.repairAt || '-' }}</b></div>
                <div class="detail-row"><span>完成时间</span><b>{{ detail.completeAt || '-' }}</b></div>
                <div class="detail-row"><span>状态</span><b>{{ detail.statusText || '-' }}</b></div>
                <div class="detail-row"><span>维修说明</span><b>{{ detail.repairResult || '-' }}</b></div>
                <attachment-block title="维修前附件" :files="parseAttachments(detail.beforeAttachments)" />
                <attachment-block title="维修后附件" :files="parseAttachments(detail.afterAttachments)" />
            </div>
        </el-dialog>
    </div>
</template>

<script>
const AttachmentBlock = {
    props: { title: String, files: Array },
    methods: {
        isImage(file) {
            return file && ((file.type || '').indexOf('image/') === 0 || /\.(png|jpe?g|gif|webp|bmp)$/i.test(file.url || ''))
        },
        imageUrls(files) {
            return (files || []).filter(this.isImage).map(file => file.url)
        },
        formatSize(size) {
            const value = Number(size)
            if (!value) return '-'
            if (value < 1024) return `${value}B`
            if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)}KB`
            return `${(value / 1024 / 1024).toFixed(1)}MB`
        }
    },
    template: `
        <div class="attachment-block">
            <div class="attachment-title">{{ title }}</div>
            <div class="attachment-list" v-if="files && files.length">
                <div class="attachment-item" v-for="file in files" :key="file.url">
                    <el-image
                        v-if="isImage(file)"
                        class="attachment-thumb"
                        :src="file.url"
                        :preview-src-list="imageUrls(files)"
                        fit="cover"
                    />
                    <i v-else class="el-icon-document attachment-icon"></i>
                    <div class="attachment-info">
                        <a :href="file.url" target="_blank" class="attachment-name">{{ file.name || '附件' }}</a>
                        <span>{{ file.type || '-' }}</span>
                        <span>{{ formatSize(file.size) }}</span>
                    </div>
                </div>
            </div>
            <el-empty v-else description="暂无附件"></el-empty>
        </div>
    `
}

export default {
    components: { AttachmentBlock },
    data() {
        return {
            loading: false,
            rows: [],
            total: 0,
            query: this.createQuery(),
            projectOptions: [],
            detailVisible: false,
            detail: null,
            statusOptions: [
                { value: 1, label: '待派单' },
                { value: 2, label: '处理中' },
                { value: 3, label: '待验收' },
                { value: 4, label: '已完成' },
                { value: 5, label: '已取消' }
            ]
        }
    },
    created() {
        this.loadProjects()
        this.load()
    },
    methods: {
        createQuery() {
            return { pageNo: 1, pageSize: 10, projectId: '', status: '', keyword: '' }
        },
        statusType(status) {
            return { 2: 'primary', 3: 'warning', 4: 'success', 5: 'danger' }[Number(status)] || 'info'
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
        async loadProjects(name) {
            const response = await this.$axios.get('project/queryByPage', { params: { pageNo: 1, pageSize: 50, name: name || '' } })
            if (response.data.code === 200) this.projectOptions = (response.data.data || {}).list || []
        },
        async load() {
            this.loading = true
            try {
                const response = await this.$axios.get('repair/queryByPage', { params: this.query })
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
            const response = await this.$axios.get(`repair/queryById/${row.id}`)
            if (response.data.code === 200) {
                this.detail = response.data.data || row
                this.detailVisible = true
            } else this.$message.error(response.data.message || '详情查询失败')
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

.detail-row {
    display: flex;
    line-height: 24px;
    margin-bottom: 10px;
}

.detail-row span {
    width: 90px;
    color: #909399;
    flex: none;
}

.detail-row b {
    color: #303133;
    font-weight: 500;
}

.attachment-block {
    margin-top: 14px;
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

.attachment-thumb {
    width: 44px;
    height: 44px;
    border-radius: 4px;
    flex: none;
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
