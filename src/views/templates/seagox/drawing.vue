<template>
    <el-container :style="'height:' + (clientHeight - 110) + 'px'">
        <el-aside width="320px" style="padding: 15px; border-right: 5px solid #f0f2f5">
            <el-input placeholder="搜索" size="small" v-model="filterText" style="margin-bottom: 10px"></el-input>
            <el-tree
                :data="treeData"
                :props="defaultProps"
                :filter-node-method="filterNode"
                ref="tree"
                default-expand-all
                highlight-current
                @node-click="handleNodeClick"
                style="color: #333"
                @node-contextmenu="handleContextMenu"
                :expand-on-click-node="false"
            >
                <span slot-scope="{ node, data }" style="display: flex; align-items: center">
                    <i
                        class="el-icon-s-platform"
                        style="font-size: 22px; margin-right: 5px; color: #909399"
                        v-if="data.type === 'root'"
                    ></i>
                    <img
                        style="width: 24px; height: 24px; margin-right: 5px"
                        src="@/assets/fileType/folder.svg"
                        v-else
                    />
                    <span style="font-size: 14px">{{ node.label }}</span>
                </span>
            </el-tree>
        </el-aside>
        <el-main>
            <div class="toolView">
                <el-upload
                    style="display: inline; margin-right: 5px"
                    :action="action"
                    :show-file-list="false"
                    multiple
                    :headers="headers"
                    :before-upload="beforeUpload"
                    :on-success="successHandle"
                    :data="uploadParams"
                    v-if="currentNode && currentNode.id"
                >
                    <el-button type="text" icon="el-icon-upload2" size="small" style="color: #333">导入</el-button>
                </el-upload>
                <el-button type="text" icon="el-icon-download" size="small" style="color: #333" @click="handleExport"
                    >导出</el-button
                >
                <el-button type="text" icon="el-icon-delete" size="small" style="color: #333" @click="handleDelete"
                    >删除</el-button
                >
            </div>
            <el-table
                :data="tableData"
                :height="clientHeight - 150"
                style="width: 100%"
                @selection-change="handleSelectionChange"
                @current-change="handleCurrentChange"
            >
                <el-table-column type="selection" width="50" align="center"></el-table-column>
                <el-table-column prop="name" label="文档名称"></el-table-column>
                <el-table-column prop="version" width="80" label="版本" align="center"></el-table-column>
                <el-table-column
                    prop="size"
                    width="100"
                    label="大小"
                    align="center"
                    :formatter="formatBytes"
                ></el-table-column>
                <el-table-column
                    prop="type"
                    width="100"
                    label="文件类型"
                    align="center"
                    show-overflow-tooltip
                ></el-table-column>
                <el-table-column prop="updateTime" width="150" label="修改时间" align="center"></el-table-column>
            </el-table>
            <!-- <el-tabs
                type="border-card"
                :style="{ height: (clientHeight - 150) / 2 + 'px' }"
                @tab-click="tabClick"
                v-model="activeName"
            >
                <el-tab-pane label="常规" name="常规">
                    <el-form :model="currentRow" label-width="80px" size="medium">
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="文件名称">
                                    <el-input v-model="currentRow.name" disabled></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="版本">
                                    <el-input v-model="currentRow.version" disabled></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="大小">
                                    <el-input v-model="currentRow.size" disabled></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="文件类型">
                                    <el-input v-model="currentRow.type" disabled></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="创建时间">
                                    <el-input v-model="currentRow.createTime" disabled></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="创建用户">
                                    <el-input v-model="currentRow.userName" disabled></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="修改时间">
                                    <el-input v-model="currentRow.updateTime" disabled></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="检出用户">
                                    <el-input v-model="currentRow.detection" disabled></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </el-tab-pane>
                <el-tab-pane label="历史版本" name="历史版本">
                    <el-table :data="historyData" style="width: 100%" border>
                        <el-table-column prop="version" label="版本" align="center"></el-table-column>
                        <el-table-column prop="userName" label="修改用户" align="center"></el-table-column>
                        <el-table-column prop="createTime" label="修改时间" align="center"></el-table-column>
                        <el-table-column
                            prop="size"
                            label="大小"
                            align="center"
                            :formatter="formatBytes"
                        ></el-table-column>
                        <el-table-column prop="remark" label="版本备注" align="center"></el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane
                    label="浏览"
                    name="浏览"
                    v-if="
                        currentRow &&
                        (currentRow.type === 'doc' ||
                            currentRow.type === 'docx' ||
                            currentRow.type === 'xls' ||
                            currentRow.type === 'xlsx' ||
                            currentRow.type === 'ppt' ||
                            currentRow.type === 'pdf')
                    "
                >
                </el-tab-pane>
            </el-tabs> -->
        </el-main>
        <el-dialog title="文件属性" width="500px" :visible.sync="formVisible" :close-on-click-modal="false">
            <el-form :model="form" label-width="60px" :rules="formRules" ref="form">
                <el-form-item label="名称" prop="name">
                    <el-input v-model.trim="form.name" clearable placeholder="请输入名称"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="formVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">确认</el-button>
            </div>
        </el-dialog>
        <div id="contextMenu" class="contextMenu">
            <div style="line-height: 36px; padding: 0 12px; cursor: pointer" @click="handleFolder('new')">
                新建文件夹
            </div>
            <div
                style="line-height: 36px; padding: 0 12px; cursor: pointer"
                @click="handleFolder('edit')"
                v-if="currentNode && currentNode.id"
            >
                文件属性
            </div>
            <div
                style="line-height: 36px; padding: 0 12px; cursor: pointer"
                @click="handleFolder('delete')"
                v-if="currentNode && currentNode.id"
            >
                删除
            </div>
        </div>
    </el-container>
</template>
<script>
import md5 from 'md5'
export default {
    data() {
        return {
            action: this.$axios.defaults.baseURL + '/cloud/drawing/upload',
            headers: {
                Authorization: localStorage.getItem('Authorization')
            },
            uploadParams: {},
            clientHeight: document.documentElement.clientHeight || document.body.clientHeight,
            treeData: [],
            defaultProps: {
                children: 'children',
                label: 'name'
            },
            filterText: '',
            tableData: [],
            currentNode: null,
            formVisible: false,
            form: {
                name: ''
            },
            formRules: {
                name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
            },
            contextType: '',
            multipleSelection: [],
            currentRow: {},
            historyData: [],
            activeName: '常规'
        }
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val)
        }
    },
    created() {
        let timestamp = Date.now()
        this.headers.Sign = md5(
            'cloud/upload/drawingUpload?timestamp=' + timestamp + '&key=yVwlsbIrY3q22EnoYYM4nR5zqTmqed05'
        ).toUpperCase()
        this.headers.Timestamp = timestamp
    },
    mounted() {
        this.queryByCompanyId()
    },
    methods: {
        async queryVersionListBySerial(serial) {
            let params = {
                serial: serial
            }
            let res = await this.$axios.get('cloud/drawing/queryVersionListBySerial', { params })
            if (res.data.code == 200) {
                this.historyData = res.data.data
            }
        },
        async queryByCompanyId() {
            let params = {
                type: 'folder'
            }
            let res = await this.$axios.get('cloud/drawing/queryByCompanyId', { params })
            if (res.data.code == 200) {
                this.treeData = [
                    {
                        name: '图纸管理',
                        children: res.data.data,
                        type: 'root'
                    }
                ]
            }
        },
        async queryListBycatalogId(catalogId) {
            let params = {
                parentId: catalogId,
                status: 0
            }
            let res = await this.$axios.get('cloud/drawing/queryListBycatalogId', { params })
            if (res.data.code == 200) {
                this.tableData = res.data.data
            }
        },
        filterNode(value, data) {
            if (!value) return true
            return data.name.indexOf(value) !== -1
        },
        handleNodeClick(data) {
            const contextMenu = document.getElementById('contextMenu')
            contextMenu.style.display = 'none'
            this.currentNode = data
            this.activeName = '常规'
            this.currentRow = JSON.parse(JSON.stringify(data))
            this.currentRow.size = this.utils.formatBytes(this.currentRow.size)
            this.queryVersionListBySerial(data.serial)
            if (data.id) {
                this.queryListBycatalogId(this.currentNode.id)
            } else {
                this.tableData = []
            }
        },
        handleContextMenu(event, data, node, element) {
            event.preventDefault()
            const contextMenu = document.getElementById('contextMenu')
            contextMenu.style.display = 'block'
            contextMenu.style.left = `${event.clientX}px`
            contextMenu.style.top = event.clientY + 10 + `px`
            this.currentNode = data
        },
        handleFolder(type) {
            const contextMenu = document.getElementById('contextMenu')
            contextMenu.style.display = 'none'
            this.contextType = type
            if (type === 'new') {
                this.form = Object.assign({}, { name: '' })
                this.formVisible = true
                if (this.$refs.form) {
                    this.$refs.form.resetFields()
                }
            } else if (type === 'edit') {
                this.form = Object.assign({}, { name: this.currentNode.name })
                this.formVisible = true
                if (this.$refs.form) {
                    this.$refs.form.resetFields()
                }
            } else if (type === 'delete') {
                this.$confirm('亲，确认要删除吗？', '提示', { type: 'warning' }).then(() => {
                    this.$axios.post('cloud/drawing/deleteById', { id: this.currentNode.id }).then(res => {
                        if (res.data.code == 200) {
                            this.$message.success('删除成功')
                            this.queryByCompanyId()
                        } else {
                            this.$message.error(res.data.message)
                        }
                    })
                })
            }
        },
        handleSubmit() {
            if (this.contextType === 'new') {
                let params = {
                    parentId: this.currentNode.id,
                    name: this.form.name
                }
                this.$refs.form.validate(valid => {
                    if (valid) {
                        this.$axios.post('cloud/drawing/insert', params).then(res => {
                            if (res.data.code == 200) {
                                this.$message.success('新建成功')
                                this.formVisible = false
                                const contextMenu = document.getElementById('contextMenu')
                                contextMenu.style.display = 'none'
                                this.queryByCompanyId()
                            } else {
                                this.$message.error(res.data.message)
                            }
                        })
                    }
                })
            } else if (this.contextType === 'edit') {
                let params = {
                    id: this.currentNode.id,
                    name: this.form.name
                }
                this.$refs.form.validate(valid => {
                    if (valid) {
                        this.$axios.post('cloud/drawing/updateById', params).then(res => {
                            if (res.data.code == 200) {
                                this.$message.success('修改成功')
                                this.formVisible = false
                                this.queryByCompanyId()
                            } else {
                                this.$message.error(res.data.message)
                            }
                        })
                    }
                })
            }
        },
        beforeUpload(file) {
            if (file.size / (1024 * 1024) > 200) {
                this.$message.error('文档大小不能大于200MB')
                return false
            }
            this.uploadParams.id = this.currentNode.id
            return true
        },
        successHandle(res, file, fileList) {
            if (res.code === 200) {
                this.$message.success('导入成功')
                this.queryListBycatalogId(this.currentNode.id)
            } else {
                this.$message.error(res.message)
            }
        },
        formatBytes(data) {
            return this.utils.formatBytes(data.size)
        },
        handleSelectionChange(val) {
            this.multipleSelection = val
        },
        handleExport() {
            if (this.multipleSelection.length === 0) {
                this.$message.warning('请选择要导出的文件')
            } else if (this.multipleSelection.length === 1) {
                let params = {
                    url: this.multipleSelection[0].url,
                    fileName: this.multipleSelection[0].name
                }
                this.$axios.post('upload/download', params, { responseType: 'blob' }).then(res => {
                    let content = res.data
                    let blob = new Blob([content])
                    if ('download' in document.createElement('a')) {
                        // 非IE下载
                        let elink = document.createElement('a')
                        elink.download = this.multipleSelection[0].name
                        elink.style.display = 'none'
                        elink.href = URL.createObjectURL(blob)
                        document.body.appendChild(elink)
                        elink.click()
                        URL.revokeObjectURL(elink.href) // 释放URL 对象
                        document.body.removeChild(elink)
                    } else {
                        // IE10+下载
                        navigator.msSaveBlob(blob, this.multipleSelection[0].name)
                    }
                })
            } else {
                this.$message.warning('只能选择一份文件')
            }
        },
        handleDelete() {
            if (this.multipleSelection.length === 0) {
                this.$message.warning('请选择要删除的文件')
                return
            }
            let ids = []
            for (let i = 0; i < this.multipleSelection.length; i++) {
                if (this.multipleSelection[i].detection) {
                    this.$message.warning('检出文件不能删除')
                    return
                }
                ids.push(this.multipleSelection[i].id)
            }
            let params = {
                ids: ids.toString()
            }
            this.$axios.post('cloud/drawing/deleteByIds', params).then(res => {
                if (res.data.code == 200) {
                    this.$message.success('删除成功')
                    this.queryListBycatalogId(this.currentNode.id)
                } else {
                    this.$message.error(res.data.message)
                }
            })
        },
        handleCurrentChange(val) {
            this.activeName = '常规'
            this.currentRow = JSON.parse(JSON.stringify(val))
            this.currentRow.size = this.utils.formatBytes(this.currentRow.size)
            this.queryVersionListBySerial(val.serial)
        },
        tabClick(val) {
            if (val.label === '浏览') {
                if (this.currentRow.type === 'pdf') {
                    window.open(this.currentRow.url, '_blank')
                } else {
                    window.open('https://view.officeapps.live.com/op/view.aspx?src=' + this.currentRow.url, '_blank')
                }
            }
        }
    }
}
</script>
<style scoped>
::v-deep .el-tree-node__expand-icon {
    color: #333;
}
::v-deep .el-tree-node__expand-icon.is-leaf {
    color: transparent;
}
::v-deep .el-main {
    padding: 0px;
}
.contextMenu {
    display: none;
    position: absolute;
    background-color: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    font-size: 12px;
    color: #333;
    text-align: center;
}
.contextMenu div:hover {
    background-color: #ebf0ff;
}
</style>
