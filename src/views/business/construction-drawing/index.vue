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
                <el-button type="primary" icon="el-icon-plus" @click="openForm()">新增</el-button>
            </el-form-item>
        </el-form>
        <div class="table-wrapper">
            <el-table class="rounded-table" v-loading="loading" :data="rows" height="100%" border stripe>
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
                <el-table-column label="操作" width="380" align="center" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="openDetail(scope.row)">版本记录</el-button>
                        <el-button type="text" size="small" @click="openForm(scope.row)" v-if="scope.row.status !== 3">编辑</el-button>
                        <el-button type="text" size="small" @click="submit(scope.row)" v-if="scope.row.status !== 3">提交</el-button>
                        <el-button type="text" size="small" @click="confirmRead(scope.row, 'owner')" v-if="scope.row.status === 2">业主确认</el-button>
                        <el-button type="text" size="small" @click="confirmRead(scope.row, 'builder')" v-if="scope.row.status === 2">施工确认</el-button>
                        <el-button type="text" size="small" @click="cancelArchive(scope.row)" v-if="scope.row.status === 3">取消归档</el-button>
                        <el-button type="text" size="small" @click="remove(scope.row)" v-if="scope.row.status !== 3">删除</el-button>
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

        <el-dialog :title="form.id ? '编辑施工图出图' : '新增施工图出图'" :visible.sync="formVisible" width="820px">
            <el-form ref="form" :model="form" :rules="rules" label-width="150px">
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
                    <el-input v-model.trim="form.version" maxlength="50" placeholder="请输入版本，如 V1.0" />
                </el-form-item>
                <el-form-item label="施工确认人员" prop="confirmMembers.builder.memberId">
                    <el-select
                        v-model="form.confirmMembers.builder.memberId"
                        class="form-control"
                        clearable
                        filterable
                        remote
                        :remote-method="loadUsers"
                        placeholder="请选择施工确认人员"
                        @change="value => selectConfirmMember('builder', value)"
                    >
                        <el-option v-for="item in userOptions" :key="item.id" :label="userLabel(item)" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="业主确认人员" prop="confirmMembers.owner.memberId">
                    <el-select
                        v-model="form.confirmMembers.owner.memberId"
                        class="form-control"
                        clearable
                        filterable
                        remote
                        :remote-method="loadUsers"
                        placeholder="请选择业主确认人员"
                        @change="value => selectConfirmMember('owner', value)"
                    >
                        <el-option v-for="item in userOptions" :key="item.id" :label="userLabel(item)" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item
                    v-for="category in categories"
                    :key="category.key"
                    :label="category.label"
                    :prop="category.key"
                >
                    <el-upload
                        action=""
                        multiple
                        :file-list="fileLists[category.key]"
                        :http-request="option => uploadFile(option, category.key)"
                        :on-remove="file => removeFile(file, category.key)"
                    >
                        <el-button size="small" type="primary" icon="el-icon-upload2">上传附件</el-button>
                    </el-upload>
                </el-form-item>
                <el-form-item label="修改说明">
                    <el-input v-model="form.solutionExplanation" type="textarea" :rows="4" maxlength="1000" show-word-limit />
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="formVisible = false">取消</el-button>
                <el-button type="primary" :loading="saving" @click="save">保存</el-button>
            </span>
        </el-dialog>

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
            saving: false,
            acting: false,
            projectLoading: false,
            userOptions: [],
            rows: [],
            total: 0,
            projectOptions: [],
            query: this.createQuery(),
            formVisible: false,
            form: this.createForm(),
            fileLists: this.createFileLists(),
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
            ],
            rules: {
                projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
                version: [{ required: true, message: '请输入版本', trigger: 'blur' }],
                'confirmMembers.builder.memberId': [{ required: true, message: '请选择施工确认人员', trigger: 'change' }],
                'confirmMembers.owner.memberId': [{ required: true, message: '请选择业主确认人员', trigger: 'change' }],
                architectureAttachments: [{ required: true, message: '请上传建筑设计附件', trigger: 'change' }],
                structureAttachments: [{ required: true, message: '请上传结构设计附件', trigger: 'change' }],
                decorationAttachments: [{ required: true, message: '请上传精装图纸附件', trigger: 'change' }],
                procurementAttachments: [{ required: true, message: '请上传主材及软装采购方案附件', trigger: 'change' }]
            }
        }
    },
    created() {
        this.loadProjects()
        this.loadUsers()
        this.load()
    },
    methods: {
        createQuery() {
            return { pageNo: 1, pageSize: 10, projectId: '', status: '' }
        },
        createForm() {
            return {
                id: '',
                projectId: '',
                version: 'V1.0',
                architectureAttachments: [],
                structureAttachments: [],
                decorationAttachments: [],
                procurementAttachments: [],
                confirmMembers: this.createConfirmMembers(),
                solutionExplanation: ''
            }
        },
        createConfirmMembers() {
            return {
                owner: { confirmed: false, confirmedAt: '' },
                builder: { confirmed: false, confirmedAt: '' }
            }
        },
        createFileLists() {
            return {
                architectureAttachments: [],
                structureAttachments: [],
                decorationAttachments: [],
                procurementAttachments: []
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
        userName(user) {
            return user.userName || user.name || ''
        },
        userRole(user) {
            return user.position || user.roleName || user.role || ''
        },
        userPhone(user) {
            return user.phone || user.mobile || ''
        },
        userLabel(user) {
            const role = this.userRole(user)
            return role ? `${this.userName(user)}（${role}）` : this.userName(user)
        },
        normalizeUser(user) {
            return {
                id: user.id || user.userId,
                userId: user.userId || user.id,
                name: this.userName(user),
                role: this.userRole(user),
                avatar: user.avatar || '',
                phone: this.userPhone(user)
            }
        },
        mergeConfirmUserOptions(confirmMembers) {
            const additions = ['builder', 'owner']
                .map(roleKey => confirmMembers[roleKey])
                .filter(item => item && item.memberId && item.name && !this.userOptions.some(user => String(user.id) === String(item.memberId)))
                .map(item => ({ id: item.memberId, userId: item.userId, name: item.name, role: item.role, avatar: item.avatar, phone: item.phone }))
            if (additions.length) this.userOptions = this.userOptions.concat(additions)
        },
        selectConfirmMember(roleKey, value) {
            const user = this.userOptions.find(item => String(item.id) === String(value))
            if (!user) {
                this.$set(this.form.confirmMembers, roleKey, { confirmed: false, confirmedAt: '' })
                return
            }
            const member = this.normalizeUser(user)
            this.$set(this.form.confirmMembers, roleKey, Object.assign({}, this.form.confirmMembers[roleKey], {
                memberId: member.id,
                userId: member.userId,
                name: member.name,
                role: member.role,
                avatar: member.avatar,
                phone: member.phone,
                confirmed: false,
                confirmedAt: ''
            }))
        },
        formatSize(size) {
            const value = Number(size)
            if (!value) return '-'
            if (value < 1024) return `${value}B`
            if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)}KB`
            return `${(value / 1024 / 1024).toFixed(1)}MB`
        },
        syncFileLists() {
            const fileLists = this.createFileLists()
            this.categories.forEach(category => {
                fileLists[category.key] = this.form[category.key].map(file => ({
                    name: file.name || '附件',
                    url: file.url,
                    response: file
                }))
            })
            this.fileLists = fileLists
        },
        buildPayload() {
            return {
                id: this.form.id,
                projectId: this.form.projectId,
                version: String(this.form.version || '').replace(/^[vV]/, '').split('.')[0] || 1,
                architectureAttachments: JSON.stringify(this.form.architectureAttachments),
                structureAttachments: JSON.stringify(this.form.structureAttachments),
                decorationAttachments: JSON.stringify(this.form.decorationAttachments),
                procurementAttachments: JSON.stringify(this.form.procurementAttachments),
                solutionExplanation: this.form.solutionExplanation,
                confirmMembers: JSON.stringify(this.form.confirmMembers),
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
        async loadUsers(name) {
            const response = await this.$axios.get('user/queryByPage', {
                params: { pageNo: 1, pageSize: 50, companyId: localStorage.getItem('companyId'), name: name || '' }
            })
            if (response.data.code === 200) this.userOptions = (response.data.data || {}).list || []
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
        },
        openForm(row) {
            this.form = row
                ? {
                      id: row.id,
                      projectId: row.projectId,
                      version: this.versionLabel(row.version),
                      architectureAttachments: this.parseAttachments(row.architectureAttachments),
                      structureAttachments: this.parseAttachments(row.structureAttachments),
                      decorationAttachments: this.parseAttachments(row.decorationAttachments),
                      procurementAttachments: this.parseAttachments(row.procurementAttachments),
                      confirmMembers: this.parseConfirmMembers(row.confirmMembers),
                      solutionExplanation: row.solutionExplanation || ''
                  }
                : this.createForm()
            this.mergeConfirmUserOptions(this.form.confirmMembers)
            this.syncFileLists()
            this.formVisible = true
            this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
        },
        async uploadFile(option, key) {
            const formData = new FormData()
            formData.append('file', option.file)
            const response = await this.$axios.post('upload/putObject/oss', formData)
            if (response.data.code !== 200) {
                this.$message.error(response.data.message || '上传失败')
                return
            }
            this.form[key].push({
                name: option.file.name,
                type: option.file.type || 'application/octet-stream',
                url: response.data.data,
                size: option.file.size
            })
            this.syncFileLists()
            this.$refs.form && this.$refs.form.validateField(key)
        },
        removeFile(file, key) {
            this.form[key] = this.form[key].filter(item => item.url !== file.url)
            this.syncFileLists()
        },
        save() {
            this.$refs.form.validate(async valid => {
                if (!valid) return
                this.saving = true
                try {
                    const response = await this.$axios.post('constructionDrawing/save', this.buildPayload())
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
        postAction(url, successText, data = {}) {
            this.acting = true
            return this.$axios
                .post(url, Object.assign({ userId: localStorage.getItem('userId') }, data))
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
            this.postAction(`constructionDrawing/submit/${row.id}`, '提交成功')
        },
        confirmRead(row, roleKey) {
            this.postAction(`constructionDrawing/confirmRead/${row.id}`, '确认成功', { roleKey })
        },
        cancelArchive(row) {
            this.$confirm('确认取消该施工图归档吗？', '提示', { type: 'warning' })
                .then(() => this.postAction(`constructionDrawing/cancelArchive/${row.id}`, '已取消归档'))
                .catch(() => {})
        },
        remove(row) {
            this.$confirm('确认删除该施工图出图吗？', '提示', { type: 'warning' })
                .then(() => this.postAction(`constructionDrawing/delete/${row.id}`, '删除成功'))
                .catch(() => {})
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
