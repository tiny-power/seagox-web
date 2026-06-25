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
                <el-button type="primary" icon="el-icon-plus" @click="openForm()">新增</el-button>
            </el-form-item>
        </el-form>
        <div class="table-wrapper">
            <el-table class="rounded-table" v-loading="loading" :data="rows" height="100%" border stripe>
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
                <el-table-column label="操作" width="440" align="center" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="openDetail(scope.row)">版本记录</el-button>
                        <el-button type="text" size="small" @click="openForm(scope.row)">编辑</el-button>
                        <el-button type="text" size="small" @click="submit(scope.row)" v-if="scope.row.status === 1"
                            >提交</el-button
                        >
                        <el-button type="text" size="small" @click="confirm(scope.row)" v-if="scope.row.status === 2"
                            >确认</el-button
                        >
                        <el-button type="text" size="small" @click="openFreeze(scope.row)" v-if="scope.row.status === 3"
                            >冻结</el-button
                        >
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
                        <el-button type="text" size="small" @click="remove(scope.row)" v-if="scope.row.status !== 6"
                            >删除</el-button
                        >
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

        <el-dialog :title="form.id ? '编辑方案设计' : '新增方案设计'" :visible.sync="formVisible" width="720px">
            <el-form ref="form" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="所属项目" prop="projectId">
                    <el-select
                        v-model="form.projectId"
                        clearable
                        filterable
                        remote
                        :remote-method="loadProjects"
                        class="form-control"
                        placeholder="请选择项目"
                    >
                        <el-option v-for="item in projectOptions" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="版本" prop="version">
                    <el-input v-model.trim="form.version" maxlength="255" placeholder="请输入版本，如 V1.0" />
                </el-form-item>
                <el-form-item label="效果图" prop="attachments">
                    <el-upload
                        action=""
                        list-type="picture-card"
                        :file-list="fileList"
                        :http-request="uploadImage"
                        :on-remove="removeImage"
                    >
                        <i class="el-icon-plus"></i>
                    </el-upload>
                </el-form-item>
                <el-form-item label="方案说明" prop="solutionExplanation">
                    <el-input
                        v-model="form.solutionExplanation"
                        type="textarea"
                        :rows="4"
                        maxlength="1000"
                        show-word-limit
                    />
                </el-form-item>
                <el-form-item label="修改注释">
                    <el-input v-model="form.annotation" type="textarea" :rows="3" maxlength="1000" show-word-limit />
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="formVisible = false">取消</el-button>
                <el-button type="primary" :loading="saving" @click="save">保存</el-button>
            </span>
        </el-dialog>

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

        <el-dialog title="冻结方案" :visible.sync="freezeVisible" width="520px">
            <el-form label-width="100px">
                <el-form-item label="签字文件">
                    <el-input v-model="signatureUrl" maxlength="500" placeholder="请输入签字文件地址" />
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="freezeVisible = false">取消</el-button>
                <el-button type="primary" :loading="acting" @click="freeze">确认</el-button>
            </span>
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
            <el-input
                v-model="messageText"
                type="textarea"
                :rows="3"
                maxlength="500"
                show-word-limit
                placeholder="请输入留言"
            />
            <span slot="footer">
                <el-button @click="messageVisible = false">关闭</el-button>
                <el-button type="primary" :loading="acting" @click="addMessage">提交留言</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            loading: false,
            saving: false,
            acting: false,
            projectLoading: false,
            rows: [],
            total: 0,
            projectOptions: [],
            query: this.createQuery(),
            formVisible: false,
            form: this.createForm(),
            fileList: [],
            detailVisible: false,
            detailLoading: false,
            detailVersions: [],
            activeRow: null,
            freezeVisible: false,
            signatureUrl: '',
            defrostVisible: false,
            defrostExplanation: '',
            messageVisible: false,
            messages: [],
            messageText: '',
            statusOptions: [
                { value: 1, label: '待提交' },
                { value: 2, label: '待确认' },
                { value: 3, label: '已确认' },
                { value: 4, label: '已冻结' },
                { value: 5, label: '解冻中' },
                { value: 6, label: '已完成' }
            ],
            rules: {
                projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
                version: [{ required: true, message: '请输入版本', trigger: 'blur' }],
                attachments: [{ required: true, message: '请上传效果图', trigger: 'change' }],
                solutionExplanation: [{ required: true, message: '请输入方案说明', trigger: 'blur' }]
            }
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
        createForm() {
            return { id: '', projectId: '', version: 'V1.0', attachments: [], solutionExplanation: '', annotation: '' }
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
        syncFileList() {
            this.fileList = this.form.attachments.map((item, index) => ({
                name: item.name || `效果图-${index + 1}`,
                url: item.url,
                response: item
            }))
        },
        buildPayload() {
            return {
                ...this.form,
                version: String(this.form.version || '').replace(/^[vV]/, '').split('.')[0] || 1,
                attachments: JSON.stringify(this.form.attachments),
                userId: localStorage.getItem('userId')
            }
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
        openForm(row) {
            this.form = row
                ? {
                      id: row.id,
                      projectId: row.projectId,
                      version: this.nextEditableVersion(row),
                      attachments: this.parseAttachments(row.attachments),
                      solutionExplanation: row.solutionExplanation,
                      annotation: row.annotation || ''
                  }
                : this.createForm()
            this.syncFileList()
            this.formVisible = true
            this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
        },
        nextEditableVersion(row) {
            const version = Number(row.version) || 1
            return row.status === 1 && row.defrostExplanation ? version + 1 : version
        },
        async uploadImage(option) {
            const formData = new FormData()
            formData.append('file', option.file)
            const response = await this.$axios.post('upload/putObject/oss', formData)
            if (response.data.code !== 200) {
                this.$message.error(response.data.message || '上传失败')
                return
            }
            const item = {
                name: option.file.name,
                type: option.file.type,
                url: response.data.data,
                size: option.file.size
            }
            this.form.attachments.push(item)
            this.syncFileList()
            this.$refs.form && this.$refs.form.validateField('attachments')
        },
        removeImage(file) {
            this.form.attachments = this.form.attachments.filter(item => item.url !== file.url)
            this.syncFileList()
        },
        save() {
            this.$refs.form.validate(async valid => {
                if (!valid) return
                this.saving = true
                try {
                    const response = await this.$axios.post('solutionDesign/save', this.buildPayload())
                    if (response.data.code === 200) {
                        this.$message.success('保存成功')
                        this.formVisible = false
                        this.load()
                    } else this.$message.error(response.data.message || '保存失败')
                } finally {
                    this.saving = false
                }
            })
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
        submit(row) {
            this.postAction(`solutionDesign/submit/${row.id}`, '提交成功')
        },
        confirm(row) {
            this.postAction(`solutionDesign/confirm/${row.id}`, '确认成功')
        },
        openFreeze(row) {
            this.activeRow = row
            this.signatureUrl = row.signatureUrl || ''
            this.freezeVisible = true
        },
        async freeze() {
            if (!this.signatureUrl) return this.$message.warning('请输入签字文件地址')
            this.acting = true
            try {
                const response = await this.$axios.post(`solutionDesign/freeze/${this.activeRow.id}`, {
                    signatureUrl: this.signatureUrl,
                    userId: localStorage.getItem('userId')
                })
                if (response.data.code === 200) {
                    this.$message.success('冻结成功')
                    this.freezeVisible = false
                    this.load()
                } else this.$message.error(response.data.message || '冻结失败')
            } finally {
                this.acting = false
            }
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
        remove(row) {
            this.$confirm('确认删除该方案设计吗？', '提示', { type: 'warning' })
                .then(() => this.postAction(`solutionDesign/delete/${row.id}`, '删除成功'))
                .catch(() => {})
        },
        async openMessage(row) {
            this.activeRow = row
            this.messageText = ''
            this.messageVisible = true
            const response = await this.$axios.get('leaveMessage/queryByPage', {
                params: { pageNo: 1, pageSize: 100, projectId: row.projectId, type: 1 }
            })
            this.messages = response.data.code === 200 ? (response.data.data || {}).list || [] : []
        },
        async addMessage() {
            if (!this.messageText) return this.$message.warning('请输入留言')
            this.acting = true
            try {
                const response = await this.$axios.post('leaveMessage/insert', {
                    projectId: this.activeRow.projectId,
                    projectMemberId: localStorage.getItem('projectMemberId') || 0,
                    type: 1,
                    remark: this.messageText,
                    userId: localStorage.getItem('userId')
                })
                if (response.data.code === 200) {
                    this.$message.success('留言成功')
                    this.openMessage(this.activeRow)
                } else this.$message.error(response.data.message || '留言失败')
            } finally {
                this.acting = false
            }
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
