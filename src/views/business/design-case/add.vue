<template>
    <div class="design-case-form-page">
        <el-form ref="form" :model="form" :rules="rules" label-width="96px">
            <el-form-item label="案例标题" prop="title">
                <el-input v-model.trim="form.title" maxlength="200" show-word-limit />
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
            <el-row :gutter="16">
                <el-col :span="12">
                    <el-form-item label="风格" prop="styleList">
                        <el-select v-model="form.styleList" multiple placeholder="请选择风格" class="full-width">
                            <el-option v-for="item in styleOptions" :key="item" :label="item" :value="item" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="地区" prop="regionText">
                        <el-select v-model="form.regionText" placeholder="请选择地区" class="full-width">
                            <el-option v-for="item in regionOptions" :key="item" :label="item" :value="item" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="16">
                <el-col :span="12">
                    <el-form-item label="省名称" prop="provinceName">
                        <el-input v-model.trim="form.provinceName" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="城市名称" prop="cityName">
                        <el-input v-model.trim="form.cityName" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="16">
                <el-col :span="8">
                    <el-form-item label="建筑面积" prop="buildingArea">
                        <el-input-number
                            v-model="form.buildingArea"
                            :min="0"
                            :precision="2"
                            :controls="false"
                            class="full-width"
                        />
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="层数" prop="floorCount">
                        <el-input-number
                            v-model="form.floorCount"
                            :min="1"
                            :precision="0"
                            :controls="false"
                            class="full-width"
                        />
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="屋顶" prop="roofType">
                        <el-select v-model="form.roofType" placeholder="请选择屋顶" class="full-width">
                            <el-option v-for="item in roofOptions" :key="item" :label="item" :value="item" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="16">
                <el-col :span="8">
                    <el-form-item label="特殊标签">
                        <el-select
                            v-model="form.specialList"
                            multiple
                            allow-create
                            filterable
                            default-first-option
                            class="full-width"
                        >
                            <el-option v-for="item in specialOptions" :key="item" :label="item" :value="item" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="状态" prop="status">
                        <el-select v-model="form.status" class="full-width">
                            <el-option
                                v-for="item in statusOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="排序">
                        <el-input-number v-model="form.sort" :precision="0" class="full-width sort-input" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item label="案例简介" prop="summary">
                <quill-editor
                    ref="editor"
                    v-model="form.summary.delta"
                    height="420px"
                    placeholder="请输入案例简介"
                    @html-change="handleHtmlChange"
                />
            </el-form-item>
            <el-form-item>
                <el-button @click="$router.back()">返回</el-button>
                <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
            </el-form-item>
        </el-form>
        <el-dialog :visible.sync="coverPreviewVisible" append-to-body>
            <img class="cover-preview-image" :src="coverPreviewUrl" />
        </el-dialog>
    </div>
</template>

<script>
import QuillEditor from '@/views/components/quill/editor'

const emptyDelta = () => ({ ops: [{ insert: '\n' }] })

export default {
    components: { QuillEditor },
    data() {
        return {
            saving: false,
            coverFileList: [],
            coverPreviewVisible: false,
            coverPreviewUrl: '',
            form: {
                title: '',
                coverUrl: '',
                summary: { delta: emptyDelta(), html: '' },
                styleList: [],
                regionText: '',
                provinceName: '',
                cityName: '',
                buildingArea: undefined,
                floorCount: undefined,
                roofType: '',
                specialList: [],
                status: 0,
                sort: 0
            },
            styleOptions: ['简约', '轻奢', '田园', '新中式', '法式'],
            regionOptions: ['东北', '华北', '华东', '华中', '西北', '西南', '华南'],
            roofOptions: ['平顶', '坡顶'],
            specialOptions: ['坡地', '紧贴邻居'],
            statusOptions: [
                { label: '草稿', value: 0 },
                { label: '已发布', value: 1 },
                { label: '已下架', value: 2 }
            ],
            rules: {
                title: [{ required: true, message: '请输入案例标题', trigger: 'blur' }],
                coverUrl: [{ required: true, message: '请上传封面图片', trigger: 'change' }],
                styleList: [{ required: true, message: '请选择风格', trigger: 'change' }],
                regionText: [{ required: true, message: '请选择地区', trigger: 'change' }],
                provinceName: [{ required: true, message: '请输入省名称', trigger: 'blur' }],
                cityName: [{ required: true, message: '请输入城市名称', trigger: 'blur' }],
                buildingArea: [{ required: true, message: '请输入建筑面积', trigger: 'blur' }],
                floorCount: [{ required: true, message: '请输入层数', trigger: 'blur' }],
                roofType: [{ required: true, message: '请选择屋顶类型', trigger: 'change' }],
                status: [{ required: true, message: '请选择状态', trigger: 'change' }],
                summary: [
                    {
                        required: true,
                        validator: (rule, value, callback) => this.validateSummary(callback),
                        trigger: 'change'
                    }
                ]
            }
        }
    },
    methods: {
        handleHtmlChange(html) {
            this.form.summary.html = html
        },
        validateSummary(callback) {
            const text = this.$refs.editor && this.$refs.editor.quill ? this.$refs.editor.quill.getText().trim() : ''
            if (!text && !/img/i.test(this.form.summary.html || '')) callback(new Error('请输入案例简介'))
            else callback()
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
                    const response = await this.$axios.post('designCase/insert', {
                        ...this.form,
                        summary: JSON.stringify(this.form.summary),
                        styleList: JSON.stringify(this.form.styleList || []),
                        specialList: JSON.stringify(this.form.specialList || [])
                    })
                    if (response.data.code === 200) {
                        this.$message.success('保存成功')
                        this.$router.push('/designCase')
                    } else this.$message.error(response.data.message || '保存失败')
                } finally {
                    this.saving = false
                }
            })
        }
    }
}
</script>

<style scoped>
.design-case-form-page {
    padding: 20px;
}
::v-deep .cover-wall-full .el-upload--picture-card {
    display: none;
}
.cover-preview-image {
    display: block;
    width: 100%;
}
.full-width {
    width: 100%;
}
::v-deep .sort-input .el-input__inner {
    text-align: center;
}
</style>
