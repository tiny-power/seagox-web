<template>
    <div class="document-page">
        <el-form :inline="true" class="filter-form" @submit.native.prevent>
            <el-form-item>
                <el-input
                    v-model.trim="keyword"
                    clearable
                    placeholder="文件夹或文件名称"
                    @keyup.enter.native="queryChildren"
                    @clear="queryChildren"
                ></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="queryChildren">查询</el-button>
                <el-button icon="el-icon-refresh-left" @click="resetSearch">重置</el-button>
                <el-button
                    type="primary"
                    icon="el-icon-folder-add"
                    v-permission="'disk:addFolder'"
                    @click="showFolderDialog"
                    >新增文件夹</el-button
                >
                <el-upload
                    class="upload-button"
                    action=""
                    :show-file-list="false"
                    :http-request="uploadFile"
                    v-permission="'disk:upload'"
                >
                    <el-button type="primary" icon="el-icon-upload2">上传文件</el-button>
                </el-upload>
            </el-form-item>
        </el-form>
        <div class="breadcrumb-row">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <a @click="openRoot">知识库</a>
                </el-breadcrumb-item>
                <el-breadcrumb-item v-for="item in breadcrumb" :key="item.id">
                    <a @click="openBreadcrumb(item)">{{ item.name }}</a>
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="table-wrapper">
            <el-table
                class="project-data-table rounded-table"
                :data="tableData"
                :row-style="{ cursor: 'pointer' }"
                border
                highlight-current-row
                stripe
                height="100%"
                @row-dblclick="openRow"
            >
                <el-table-column label="名称" min-width="260" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <div class="file-name-cell">
                            <img class="file-icon" :src="fileIcon(scope.row)" />
                            <el-link type="primary" :underline="false" @click="openRow(scope.row)">{{
                                scope.row.name
                            }}</el-link>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="类型" width="110" align="center" :formatter="typeFormatter"></el-table-column>
                <el-table-column label="大小" width="120" align="center" :formatter="sizeFormatter"></el-table-column>
                <el-table-column prop="updatedAt" label="更新时间" width="180" align="center"></el-table-column>
                <el-table-column label="操作" width="240" align="center" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="previewFile(scope.row)" v-if="scope.row.type !== 1"
                            >打开</el-button
                        >
                        <el-divider direction="vertical" v-if="scope.row.type !== 1"></el-divider>
                        <el-button
                            type="text"
                            size="small"
                            v-permission="'disk:edit'"
                            @click="showRenameDialog(scope.row)"
                            >重命名</el-button
                        >
                        <el-divider direction="vertical"></el-divider>
                        <el-button
                            type="text"
                            size="small"
                            v-permission="'disk:delete'"
                            @click="deleteSubmit(scope.row)"
                            >删除</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-dialog title="新增文件夹" width="420px" :visible.sync="folderVisible" :close-on-click-modal="false">
            <el-form :model="folderForm" :rules="formRules" ref="folderForm" label-width="55px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model.trim="folderForm.name" placeholder="请输入文件夹名称"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="folderVisible = false">取消</el-button>
                <el-button type="primary" @click="insertFolder">确定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="重命名" width="420px" :visible.sync="renameVisible" :close-on-click-modal="false">
            <el-form :model="renameForm" :rules="formRules" ref="renameForm" label-width="80px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model.trim="renameForm.name" placeholder="请输入名称"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="renameVisible = false">取消</el-button>
                <el-button type="primary" @click="renameSubmit">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            keyword: '',
            currentFolder: null,
            breadcrumb: [],
            tableData: [],
            folderVisible: false,
            renameVisible: false,
            folderForm: {
                name: ''
            },
            renameForm: {
                id: '',
                name: ''
            },
            formRules: {
                name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
            },
            iconMap: {
                1: require('@/assets/fileType/folder.svg'),
                2: require('@/assets/fileType/image.svg'),
                3: require('@/assets/fileType/word.svg'),
                4: require('@/assets/fileType/excel.svg'),
                5: require('@/assets/fileType/ppt.svg'),
                6: require('@/assets/fileType/pdf.svg'),
                7: require('@/assets/fileType/zip.svg'),
                8: require('@/assets/fileType/txt.svg'),
                9: require('@/assets/fileType/document.svg'),
                10: require('@/assets/fileType/video.svg'),
                11: require('@/assets/fileType/other.svg'),
                12: require('@/assets/fileType/cad.svg')
            }
        }
    },
    created() {
        this.queryChildren()
    },
    methods: {
        async queryChildren() {
            const params = {
                companyId: localStorage.getItem('companyId'),
                parentId: this.keyword ? null : this.currentFolder && this.currentFolder.id,
                keyword: this.keyword
            }
            const res = await this.$axios.get('disk/queryChildren', { params })
            if (res.data.code === 200) {
                this.tableData = res.data.data || []
            }
        },
        resetSearch() {
            this.keyword = ''
            this.queryChildren()
        },
        showFolderDialog() {
            this.folderForm.name = ''
            this.folderVisible = true
            this.$nextTick(() => this.$refs.folderForm && this.$refs.folderForm.clearValidate())
        },
        insertFolder() {
            this.$refs.folderForm.validate(async valid => {
                if (!valid) return
                const params = {
                    companyId: localStorage.getItem('companyId'),
                    userId: localStorage.getItem('userId'),
                    parentId: this.currentFolder && this.currentFolder.id,
                    name: this.folderForm.name
                }
                const res = await this.$axios.post('disk/insertFolder', params)
                if (res.data.code === 200) {
                    this.$message.success('新增成功')
                    this.folderVisible = false
                    this.queryChildren()
                }
            })
        },
        async uploadFile(option) {
            const loading = this.$loading({ text: '上传中' })
            try {
                const formData = new FormData()
                formData.append('file', option.file)
                const uploadRes = await this.$axios.post('upload/putObject/oss', formData)
                if (uploadRes.data.code !== 200) {
                    loading.close()
                    return
                }
                const saveRes = await this.$axios.post('disk/insertFile', {
                    companyId: localStorage.getItem('companyId'),
                    userId: localStorage.getItem('userId'),
                    parentId: this.currentFolder && this.currentFolder.id,
                    name: option.file.name,
                    url: uploadRes.data.data,
                    size: option.file.size,
                    type: this.getFileType(option.file.name)
                })
                loading.close()
                if (saveRes.data.code === 200) {
                    this.$message.success('上传成功')
                    this.queryChildren()
                }
            } catch (error) {
                loading.close()
                this.$message.error('上传失败')
            }
        },
        showRenameDialog(row) {
            this.renameForm = {
                id: row.id,
                name: row.name
            }
            this.renameVisible = true
            this.$nextTick(() => this.$refs.renameForm && this.$refs.renameForm.clearValidate())
        },
        renameSubmit() {
            this.$refs.renameForm.validate(async valid => {
                if (!valid) return
                const res = await this.$axios.post('disk/update', {
                    companyId: localStorage.getItem('companyId'),
                    userId: localStorage.getItem('userId'),
                    id: this.renameForm.id,
                    name: this.renameForm.name
                })
                if (res.data.code === 200) {
                    this.$message.success('更新成功')
                    this.renameVisible = false
                    this.queryChildren()
                }
            })
        },
        deleteSubmit(row) {
            this.$confirm('确定删除「' + row.name + '」吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await this.$axios.post('disk/delete/' + row.id, {
                    companyId: localStorage.getItem('companyId')
                })
                if (res.data.code === 200) {
                    this.$message.success('删除成功')
                    this.queryChildren()
                }
            })
        },
        openRow(row) {
            if (row.type === 1) {
                this.currentFolder = row
                this.breadcrumb.push(row)
                this.keyword = ''
                this.queryChildren()
            } else {
                this.previewFile(row)
            }
        },
        openRoot() {
            this.currentFolder = null
            this.breadcrumb = []
            this.keyword = ''
            this.queryChildren()
        },
        openBreadcrumb(item) {
            const index = this.breadcrumb.findIndex(row => row.id === item.id)
            this.breadcrumb = this.breadcrumb.slice(0, index + 1)
            this.currentFolder = item
            this.keyword = ''
            this.queryChildren()
        },
        previewFile(row) {
            if (!row.url) {
                return
            }
            if (this.isCadFile(row)) {
                this.previewCadFile(row)
                return
            }
            window.open(row.url, '_blank')
        },
        previewCadFile(row) {
            window.open(this.getCadPreviewUrl(row), '_blank')
        },
        isCadFile(row) {
            const suffix = this.getFileSuffix(row.name || row.url || '')
            return row.type === 12 || ['dwg', 'dxf', 'dwt'].includes(suffix)
        },
        fileIcon(row) {
            return this.iconMap[row.type] || this.iconMap[11]
        },
        typeFormatter(row) {
            const map = {
                1: '文件夹',
                2: '图片',
                3: 'Word',
                4: 'Excel',
                5: 'PPT',
                6: 'PDF',
                7: '压缩文件',
                8: 'TXT',
                9: '文档',
                10: '视频',
                11: '其他',
                12: 'CAD'
            }
            return map[row.type] || '其他'
        },
        sizeFormatter(row) {
            if (row.type === 1) {
                return '-'
            }
            const size = Number(row.size || 0)
            if (size < 1024) {
                return size + 'B'
            }
            if (size < 1024 * 1024) {
                return (size / 1024).toFixed(1) + 'KB'
            }
            return (size / 1024 / 1024).toFixed(1) + 'MB'
        },
        getFileType(filename) {
            const suffix = this.getFileSuffix(filename)
            if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(suffix)) return 2
            if (['doc', 'docx'].includes(suffix)) return 3
            if (['xls', 'xlsx'].includes(suffix)) return 4
            if (['ppt', 'pptx'].includes(suffix)) return 5
            if (suffix === 'pdf') return 6
            if (['zip', 'rar', '7z', 'tar', 'gz'].includes(suffix)) return 7
            if (suffix === 'txt') return 8
            if (['md', 'rtf', 'ofd'].includes(suffix)) return 9
            if (['mp4', 'avi', 'mov', 'wmv', 'mkv'].includes(suffix)) return 10
            if (['dwg', 'dxf', 'dwt'].includes(suffix)) return 12
            return 11
        },
        getFileSuffix(filename) {
            const cleanName = String(filename || '').split('?')[0]
            const lastSeparatorIndex = Math.max(cleanName.lastIndexOf('/'), cleanName.lastIndexOf('\\'))
            const basename = cleanName.slice(lastSeparatorIndex + 1)
            const dotIndex = basename.lastIndexOf('.')
            if (dotIndex === -1) {
                return ''
            }
            return basename
                .slice(dotIndex + 1)
                .split('#')[0]
                .toLowerCase()
        },
        getCadPreviewUrl(row) {
            const baseUrl = process.env.BASE_URL || '/'
            const params = new URLSearchParams({
                src: row.url,
                name: row.name || 'CAD预览',
                id: String(row.id || Date.now())
            })
            return baseUrl.replace(/\/?$/, '/') + 'cad-preview.html?' + params.toString()
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

.filter-form .el-input {
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

.upload-button {
    display: inline-block;
    margin-left: 10px;
    margin-right: 10px;
}

.breadcrumb-row {
    display: flex;
    align-items: center;
    min-height: 24px;
    padding: 0 0 8px;
    flex: none;
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

.file-name-cell {
    display: flex;
    align-items: center;
}

.file-icon {
    width: 28px;
    height: 28px;
    margin-right: 10px;
}

::v-deep .project-data-table .el-table__cell {
    text-align: center;
}

</style>
