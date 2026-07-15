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
                    <el-option
                        v-for="item in statusOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
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
                <el-table-column
                    prop="projectName"
                    label="项目名称"
                    min-width="180"
                    align="center"
                    show-overflow-tooltip
                />
                <el-table-column label="版本" width="100" align="center">
                    <template slot-scope="scope">{{ versionLabel(scope.row.version) }}</template>
                </el-table-column>
                <el-table-column
                    prop="solutionExplanation"
                    label="方案说明"
                    min-width="220"
                    align="center"
                    show-overflow-tooltip
                />
                <el-table-column prop="statusText" label="状态" width="100" align="center">
                    <template slot-scope="scope">
                        <el-tag size="small" :type="statusType(scope.row.status)">{{
                            scope.row.statusText || '-'
                        }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="updatedAt" label="更新时间" width="170" align="center" />
                <el-table-column label="操作" width="300" align="center" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="openDetail(scope.row)">版本记录</el-button>
                        <el-button
                            type="text"
                            size="small"
                            @click="openDefrost(scope.row)"
                            v-if="scope.row.status === 4"
                            >解冻</el-button
                        >
                        <el-button type="text" size="small" @click="complete(scope.row)" v-if="scope.row.status === 4"
                            >完成</el-button
                        >
                        <el-button
                            type="text"
                            size="small"
                            @click="approveDefrost(scope.row)"
                            v-if="scope.row.status === 5"
                            >同意解冻</el-button
                        >
                        <el-button
                            type="text"
                            size="small"
                            @click="rejectDefrost(scope.row)"
                            v-if="scope.row.status === 5"
                            >拒绝解冻</el-button
                        >
                        <el-button type="text" size="small" @click="openMessage(scope.row)">留言</el-button>
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

        <el-dialog title="版本记录" :visible.sync="detailVisible" width="860px">
            <div v-loading="detailLoading" class="version-dialog">
                <el-empty v-if="!detailVersions.length && !detailLoading" description="暂无版本记录"></el-empty>
                <div class="version-record" v-for="item in detailVersions" :key="item.id">
                    <div class="version-record__head">
                        <span class="version-record__title">{{ versionLabel(item.version) }}</span>
                        <span class="version-record__time">{{ item.updatedAt || item.createdAt || '-' }}</span>
                    </div>
                    <div class="version-record__content">
                        <div class="detail-row">
                            <span class="detail-label">方案说明</span>
                            <span class="detail-value">{{ item.solutionExplanation || '-' }}</span>
                        </div>
                        <div class="detail-row" v-if="item.annotation">
                            <span class="detail-label">修改注释</span>
                            <span class="detail-value">{{ item.annotation }}</span>
                        </div>
                        <div class="detail-row" v-if="item.defrostExplanation">
                            <span class="detail-label">解冻说明</span>
                            <span class="detail-value">{{ item.defrostExplanation }}</span>
                        </div>
                        <div class="detail-row" v-if="item.signatureUrl">
                            <span class="detail-label">签字文件</span>
                            <a class="detail-link" :href="item.signatureUrl" target="_blank">打开签字文件</a>
                        </div>
                        <div class="attachment-list">
                            <div class="attachment-item" v-for="file in parseAttachments(item.attachments)" :key="file.url">
                                <el-image
                                    v-if="isImage(file)"
                                    class="attachment-thumb"
                                    :src="file.url"
                                    :preview-src-list="imageUrls(item.attachments)"
                                    fit="cover"
                                />
                                <div v-else class="attachment-file">
                                    <i class="el-icon-document"></i>
                                </div>
                                <div class="attachment-info">
                                    <a :href="file.url" target="_blank" class="attachment-name">{{ file.name || '附件' }}</a>
                                    <span>{{ file.type || '-' }}</span>
                                    <span>{{ formatSize(file.size) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>

        <el-dialog title="申请解冻" :visible.sync="defrostVisible" width="520px">
            <el-form label-width="100px">
                <el-form-item label="解冻说明">
                    <el-input v-model="defrostExplanation" type="textarea" :rows="4" maxlength="1000" show-word-limit />
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="defrostVisible = false">取消</el-button>
                <el-button type="primary" :loading="acting" @click="applyDefrost">提交</el-button>
            </span>
        </el-dialog>

        <el-dialog title="留言" :visible.sync="messageVisible" width="640px">
            <div class="message-list">
                <div class="message-item" v-for="item in messages" :key="item.id">
                    <div class="message-meta">
                        {{ item.userName || '-' }} · {{ item.roleName || '-' }} · {{ item.createdAt || '-' }}
                    </div>
                    <div class="message-content">{{ item.remark }}</div>
                </div>
                <el-empty v-if="!messages.length" description="暂无留言"></el-empty>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            loading: false,
            acting: false,
            projectLoading: false,
            rows: [],
            total: 0,
            projectOptions: [],
            query: this.createQuery(),
            detailVisible: false,
            detailLoading: false,
            detailVersions: [],
            activeRow: null,
            defrostVisible: false,
            defrostExplanation: '',
            messageVisible: false,
            messages: [],
            statusOptions: [
                { value: 1, label: '待提交' },
                { value: 2, label: '待确认' },
                { value: 3, label: '已确认' },
                { value: 4, label: '已冻结' },
                { value: 5, label: '解冻中' },
                { value: 6, label: '已完成' }
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
        statusType(status) {
            return { 2: 'warning', 3: 'primary', 4: 'success', 5: 'warning', 6: 'success' }[Number(status)] || 'info'
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
        isImage(file) {
            const type = (file && file.type) || ''
            const url = (file && file.url) || ''
            return type.indexOf('image/') === 0 || /\.(png|jpe?g|gif|webp|bmp)$/i.test(url)
        },
        imageUrls(attachments) {
            return this.parseAttachments(attachments)
                .filter(item => this.isImage(item))
                .map(item => item.url)
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
                const response = await this.$axios.get('solutionDesign/queryByPage', { params: this.query })
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
                const response = await this.$axios.get(`solutionDesign/queryById/${row.id}`)
                if (response.data.code === 200) {
                    const data = response.data.data || {}
                    this.detailVersions = data.details || []
                } else this.$message.error(response.data.message || '详情查询失败')
            } finally {
                this.detailLoading = false
            }
        },
        postAction(url, successText) {
            this.acting = true
            return this.$axios
                .post(url, { userId: localStorage.getItem('userId') })
                .then(response => {
                    if (response.data.code === 200) {
                        this.$message.success(successText)
                        this.load()
                    } else this.$message.error(response.data.message || '操作失败')
                })
                .finally(() => {
                    this.acting = false
                })
        },
        openDefrost(row) {
            this.activeRow = row
            this.defrostExplanation = row.defrostExplanation || ''
            this.defrostVisible = true
        },
        async applyDefrost() {
            if (!this.defrostExplanation) return this.$message.warning('请输入解冻说明')
            this.acting = true
            try {
                const response = await this.$axios.post(`solutionDesign/applyDefrost/${this.activeRow.id}`, {
                    defrostExplanation: this.defrostExplanation,
                    userId: localStorage.getItem('userId')
                })
                if (response.data.code === 200) {
                    this.$message.success('申请成功')
                    this.defrostVisible = false
                    this.load()
                } else this.$message.error(response.data.message || '申请失败')
            } finally {
                this.acting = false
            }
        },
        approveDefrost(row) {
            this.postAction(`solutionDesign/approveDefrost/${row.id}`, '已同意解冻')
        },
        rejectDefrost(row) {
            this.postAction(`solutionDesign/rejectDefrost/${row.id}`, '已拒绝解冻')
        },
        complete(row) {
            this.postAction(`solutionDesign/complete/${row.id}`, '方案已完成')
        },
        async openMessage(row) {
            this.activeRow = row
            this.messageVisible = true
            const response = await this.$axios.get('leaveMessage/queryByPage', {
                params: { pageNo: 1, pageSize: 100, projectId: row.projectId, type: 1 }
            })
            this.messages = response.data.code === 200 ? (response.data.data || {}).list || [] : []
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
.message-list {
    max-height: 320px;
    overflow-y: auto;
    margin-bottom: 12px;
}
.message-item {
    padding: 10px 0;
    border-bottom: 1px solid #ebeef5;
}
.message-meta {
    color: #909399;
    font-size: 12px;
    margin-bottom: 6px;
}
.message-content {
    color: #303133;
    line-height: 1.6;
}
.version-dialog {
    min-height: 160px;
}
.version-record {
    padding: 14px 0;
    border-bottom: 1px solid #ebeef5;
}
.version-record:last-child {
    border-bottom: 0;
}
.version-record__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}
.version-record__title {
    color: #303133;
    font-size: 15px;
    font-weight: 600;
}
.version-record__time {
    color: #909399;
    font-size: 12px;
}
.detail-row {
    display: flex;
    margin-bottom: 8px;
    color: #606266;
    line-height: 1.6;
}
.detail-label {
    flex: none;
    width: 72px;
    color: #909399;
}
.detail-value {
    flex: 1;
    word-break: break-word;
}
.detail-link,
.attachment-name {
    color: #409eff;
    text-decoration: none;
}
.attachment-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 10px;
    margin-top: 10px;
}
.attachment-item {
    display: flex;
    min-width: 0;
    padding: 8px;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    background: #fafafa;
}
.attachment-thumb,
.attachment-file {
    flex: none;
    width: 54px;
    height: 54px;
    border-radius: 4px;
    overflow: hidden;
}
.attachment-file {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 26px;
    background: #f0f2f5;
}
.attachment-info {
    display: flex;
    flex: 1;
    min-width: 0;
    flex-direction: column;
    justify-content: center;
    margin-left: 8px;
    color: #909399;
    font-size: 12px;
    line-height: 1.6;
}
.attachment-name {
    overflow: hidden;
    color: #303133;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
