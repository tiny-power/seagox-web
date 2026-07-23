<template>
    <div class="knowledge-page">
        <el-form :inline="true" :model="query" class="filter-form" @submit.native.prevent>
            <el-form-item label="关键词">
                <el-input
                    v-model.trim="query.keyword"
                    clearable
                    placeholder="标题/分类"
                    @keyup.enter.native="search"
                    @clear="search"
                />
            </el-form-item>
            <el-form-item label="状态">
                <el-select v-model="query.status" clearable placeholder="全部">
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
                <el-button icon="el-icon-refresh-left" @click="reset">重置</el-button>
                <el-button v-permission="'knowledge:add'" type="primary" icon="el-icon-plus" @click="add"
                    >新增</el-button
                >
            </el-form-item>
        </el-form>

        <div class="table-wrapper">
            <el-table v-loading="loading" :data="rows" height="100%" border stripe>
                <el-table-column type="index" label="序号" width="55" align="center" />
                <el-table-column label="封面" width="110" align="center">
                    <template slot-scope="scope">
                        <el-image class="cover-thumb" :src="scope.row.coverUrl" fit="cover">
                            <div slot="error" class="image-error"><i class="el-icon-picture-outline"></i></div>
                        </el-image>
                    </template>
                </el-table-column>
                <el-table-column prop="title" label="标题" min-width="220" show-overflow-tooltip />
                <el-table-column prop="category" label="分类" width="120" align="center" show-overflow-tooltip />
                <el-table-column prop="videoAccountId" label="视频号账号ID" min-width="150" show-overflow-tooltip />
                <el-table-column prop="videoId" label="视频ID" min-width="180" show-overflow-tooltip />
                <el-table-column prop="sort" label="排序" width="80" align="center" />
                <el-table-column label="状态" width="90" align="center">
                    <template slot-scope="scope">
                        <el-tag :type="Number(scope.row.status) === 1 ? 'success' : 'info'" size="mini">
                            {{ statusText(scope.row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="updateTime" label="更新时间" width="170" align="center" />
                <el-table-column label="操作" width="150" align="center" fixed="right">
                    <template slot-scope="scope">
                        <el-button v-permission="'knowledge:edit'" type="text" size="small" @click="edit(scope.row)"
                            >编辑</el-button
                        >
                        <el-divider direction="vertical" />
                        <el-button
                            v-permission="'knowledge:delete'"
                            type="text"
                            size="small"
                            class="danger-text"
                            @click="remove(scope.row)"
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

        <el-dialog
            :title="form.id ? '编辑科普内容' : '新增科普内容'"
            :visible.sync="dialogVisible"
            width="640px"
            append-to-body
        >
            <el-form ref="form" :model="form" :rules="rules" label-width="110px">
                <el-form-item label="标题" prop="title">
                    <el-input v-model.trim="form.title" maxlength="1000" show-word-limit placeholder="请输入标题" />
                </el-form-item>
                <el-form-item label="分类" prop="category">
                    <el-input v-model.trim="form.category" maxlength="50" placeholder="请输入分类" />
                </el-form-item>
                <el-form-item label="封面图片" prop="coverUrl">
                    <el-upload
                        action=""
                        list-type="picture-card"
                        :class="{ 'cover-wall-full': coverFileList.length >= 1 }"
                        :file-list="coverFileList"
                        :limit="1"
                        :http-request="uploadCover"
                        :on-preview="previewCover"
                        :on-remove="removeCover"
                        :on-exceed="coverExceed"
                        accept="image/*"
                    >
                        <i class="el-icon-plus"></i>
                    </el-upload>
                </el-form-item>
                <el-form-item label="视频号账号ID" prop="videoAccountId">
                    <el-input v-model.trim="form.videoAccountId" maxlength="100" placeholder="请输入视频号账号ID" />
                </el-form-item>
                <el-form-item label="视频ID" prop="videoId">
                    <el-input v-model.trim="form.videoId" maxlength="255" placeholder="请输入视频号视频ID" />
                </el-form-item>
                <el-row :gutter="16">
                    <el-col :span="12">
                        <el-form-item label="排序">
                            <el-input-number v-model="form.sort" :precision="0" class="full-width" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="状态" prop="status">
                            <el-select v-model="form.status" class="full-width" placeholder="请选择状态">
                                <el-option
                                    v-for="item in statusOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <span slot="footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
            </span>
        </el-dialog>

        <el-dialog :visible.sync="coverPreviewVisible" append-to-body>
            <img class="cover-preview-image" :src="coverPreviewUrl" />
        </el-dialog>
    </div>
</template>

<script>
const createForm = () => ({
    id: '',
    category: '',
    title: '',
    coverUrl: '',
    videoId: '',
    videoAccountId: '',
    sort: 0,
    status: 1
})

export default {
    data() {
        return {
            loading: false,
            saving: false,
            rows: [],
            total: 0,
            query: this.createQuery(),
            dialogVisible: false,
            coverFileList: [],
            coverPreviewVisible: false,
            coverPreviewUrl: '',
            form: createForm(),
            statusOptions: [
                { label: '下架', value: 0 },
                { label: '上架', value: 1 }
            ],
            rules: {
                title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
                category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
                coverUrl: [{ required: true, message: '请上传封面图片', trigger: 'change' }],
                videoId: [{ required: true, message: '请输入视频号视频ID', trigger: 'blur' }],
                videoAccountId: [{ required: true, message: '请输入视频号账号ID', trigger: 'blur' }],
                status: [{ required: true, message: '请选择状态', trigger: 'change' }]
            }
        }
    },
    created() {
        this.load()
    },
    methods: {
        createQuery() {
            return { pageNo: 1, pageSize: 10, keyword: '', status: '' }
        },
        buildParams() {
            return {
                pageNo: this.query.pageNo,
                pageSize: this.query.pageSize,
                keyword: this.query.keyword,
                status: this.query.status
            }
        },
        statusText(value) {
            const item = this.statusOptions.find(option => option.value === Number(value))
            return item ? item.label : '-'
        },
        async load() {
            this.loading = true
            try {
                const response = await this.$axios.get('knowledge/queryByPage', { params: this.buildParams() })
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
        add() {
            this.form = createForm()
            this.coverFileList = []
            this.dialogVisible = true
            this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
        },
        edit(row) {
            this.form = Object.assign(createForm(), row)
            this.coverFileList = row.coverUrl ? [{ name: row.title || '封面图片', url: row.coverUrl }] : []
            this.dialogVisible = true
            this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
        },
        async uploadCover(option) {
            const loading = this.$loading({ text: '上传中' })
            try {
                const formData = new FormData()
                formData.append('file', option.file)
                const response = await this.$axios.post('upload/putObject/oss', formData)
                if (response.data.code === 200) {
                    this.form.coverUrl = response.data.data
                    this.coverFileList = [{ name: option.file.name, url: response.data.data }]
                    this.$refs.form && this.$refs.form.validateField('coverUrl')
                    this.$message.success('上传成功')
                } else this.$message.error(response.data.message || '上传失败')
            } finally {
                loading.close()
            }
        },
        previewCover(file) {
            this.coverPreviewUrl = file.url
            this.coverPreviewVisible = true
        },
        removeCover() {
            this.form.coverUrl = ''
            this.coverFileList = []
            this.$refs.form && this.$refs.form.validateField('coverUrl')
        },
        coverExceed() {
            this.$message.warning('封面图片只能上传一张')
        },
        submit() {
            this.$refs.form.validate(async valid => {
                if (!valid) return
                this.saving = true
                try {
                    const url = this.form.id ? 'knowledge/update' : 'knowledge/insert'
                    const response = await this.$axios.post(url, this.form)
                    if (response.data.code === 200) {
                        this.$message.success('保存成功')
                        this.dialogVisible = false
                        this.load()
                    } else this.$message.error(response.data.message || '保存失败')
                } finally {
                    this.saving = false
                }
            })
        },
        remove(row) {
            this.$confirm('确认删除该科普内容？', '提示', { type: 'warning' }).then(async () => {
                const response = await this.$axios.post('knowledge/delete/' + row.id)
                if (response.data.code === 200) {
                    this.$message.success('删除成功')
                    this.load()
                } else this.$message.error(response.data.message || '删除失败')
            })
        }
    }
}
</script>

<style scoped>
.knowledge-page {
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
.cover-thumb {
    width: 78px;
    height: 56px;
    border-radius: 4px;
    overflow: hidden;
    background: #f4f6f8;
}
.image-error {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a8b0bd;
    background: #f4f6f8;
}
.danger-text {
    color: #f56c6c;
}
.full-width {
    width: 100%;
}
.cover-preview-image {
    display: block;
    max-width: 100%;
    margin: 0 auto;
}
::v-deep .cover-wall-full .el-upload--picture-card {
    display: none;
}
</style>
