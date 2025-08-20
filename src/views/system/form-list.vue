<template>
    <div>
        <div
            style="
                display: flex;
                align-items: center;
                box-sizing: border-box;
                padding: 4px 10px;
                border-bottom: 1px solid #e3e7ee;
                width: 100%;
                height: 42px;
            "
        >
            <div style="font-size: 16px">
                <span style="font-weight: bold; color: #3a6cfa; width: 6px; background: #3a6cfa">|</span>
                {{ title }}
            </div>
            <div style="flex: 1; text-align: right">
                <el-button
                    type="text"
                    icon="el-icon-plus"
                    @click="showAddDialog"
                    size="small"
                    v-permission="form.mark + ':add'"
                    style="color: #000; font-weight: 400"
                    >新增</el-button
                >
                <el-button
                    type="text"
                    icon="el-icon-delete"
                    @click="deleteSubmit"
                    size="small"
                    v-permission="form.mark + ':delete'"
                    style="color: #000; font-weight: 400"
                    >删除</el-button
                >
                <el-button
                    type="text"
                    icon="el-icon-download"
                    @click="handleExport"
                    size="small"
                    v-permission="form.mark + ':export'"
                    style="color: #000; font-weight: 400"
                    >导出</el-button
                >
                <el-button
                    type="text"
                    icon="el-icon-upload2"
                    @click="handleImport"
                    size="small"
                    v-permission="form.mark + ':import'"
                    style="color: #000; font-weight: 400"
                    >导入</el-button
                >
                <component :is="buttonComponent" v-if="buttonComponent" />
                <el-button
                    type="text"
                    icon="el-icon-setting"
                    size="small"
                    style="color: #000; font-weight: 400; margin-left: 10px"
                    @click="showConfigDialog"
                    >列设置</el-button
                >
            </div>
        </div>
        <div :style="{ height: height - 192 + 'px', overflow: 'auto' }">
            <div class="searchView" v-if="searchJsonList.length != 0" ref="searchView">
                <el-form label-width="75px" :inline="true" size="medium" style="flex: 1">
                    <el-form-item
                        :label="item.desc"
                        v-for="(item, index) in moreFlag ? searchJsonList : searchJsonList.slice(0, 4)"
                        :key="index"
                    >
                        <el-input
                            v-model="item.value"
                            :placeholder="item.placeholder ? item.placeholder : '请输入' + item.desc"
                            clearable
                            v-if="item.type === 'input'"
                        >
                        </el-input>
                        <el-select
                            v-model="item.value"
                            :placeholder="item.placeholder ? item.placeholder : '请选择' + item.desc"
                            clearable
                            filterable
                            collapse-tags
                            :multiple="item.multiple"
                            v-if="item.type === 'select'"
                        >
                            <el-option
                                v-for="item in item.options"
                                :key="item.code"
                                :label="item.name"
                                :value="item.code"
                            >
                            </el-option>
                        </el-select>
                        <el-cascader
                            v-model="item.value"
                            :placeholder="item.placeholder ? item.placeholder : '请选择' + item.desc"
                            clearable
                            filterable
                            collapse-tags
                            :props="{ value: 'code', label: 'name', emitPath: false, multiple: item.multiple }"
                            :options="item.options"
                            v-if="item.type === 'cascader'"
                        >
                        </el-cascader>
                        <el-date-picker
                            v-model="item.value"
                            :type="item.dateType.split('|')[0]"
                            :value-format="item.dateType.split('|')[1]"
                            align="center"
                            :placeholder="item.placeholder ? item.placeholder : '请选择' + item.desc"
                            clearable
                            v-if="item.type === 'datePicker'"
                        >
                        </el-date-picker>
                        <component
                            :is="searchComponent[item.field]"
                            :property="item"
                            v-if="item.type === 'custom' && searchComponent[item.field]"
                        />
                    </el-form-item>
                </el-form>
                <div :style="{ width: searchJsonList.length > 4 ? '270px' : '180px' }">
                    <el-button size="medium" type="primary" icon="el-icon-search" @click.native="handleSearch"
                        >查询</el-button
                    >
                    <el-button size="medium" icon="el-icon-refresh" @click="resetForm">重置</el-button>
                    <el-button
                        size="medium"
                        :icon="moreFlag ? 'el-icon-caret-bottom' : 'el-icon-caret-left'"
                        v-if="searchJsonList.length > 4"
                        @click="moreFlag = !moreFlag"
                        >{{ moreFlag ? '收缩' : '展开' }}</el-button
                    >
                </div>
            </div>
            <!--列表-->
            <el-table
                ref="multipleTable"
                :data="tableData"
                row-key="id"
                @selection-change="handleSelectionChange"
                @row-dblclick="handleRowDblclick"
                :span-method="
                    ({ row, column, rowIndex, columnIndex }) => spanMethod({ row, column, rowIndex, columnIndex }, rect)
                "
                :show-summary="showSummary"
                :summary-method="getSummaries"
                :row-style="rowStyleEvent"
                :height="searchJsonList.length == 0 ? height - 192 : height - 250"
            >
                <div slot="empty"><el-empty description="没有数据"></el-empty></div>
                <el-table-column width="50" type="selection" align="center" :reserve-selection="true"></el-table-column>
                <el-table-column width="55" align="center" label="序号">
                    <template slot-scope="scope">
                        {{ scope.$index + 1 }}
                    </template>
                </el-table-column>
                <table-column v-for="(item, index) in tableColumn" :key="index" :element="item" />
                <el-table-column label="操作" align="center" v-if="actionComponent">
                    <template slot-scope="scope">
                        <component :is="actionComponent" v-if="actionComponent" :row="scope.row" />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!--分页-->
        <div class="pagination">
            <el-pagination
                background
                @current-change="handleCurrentChange"
                @size-change="handleCurrentChange"
                layout="total, sizes, prev, pager, next, jumper"
                :current-page.sync="pageNo"
                :page-size.sync="pageSize"
                :page-sizes="[10, 20, 30, 50, 100]"
                :total="total"
            >
            </el-pagination>
        </div>
        <el-dialog title="配置栏目" width="750px" :visible.sync="addConfigVisible" :close-on-click-modal="false">
            <el-table
                :data="tableHeaderConfig"
                border
                row-key="id"
                :tree-props="{ children: 'children' }"
                :max-height="450"
                :cell-class-name="tableCellClassName"
                @cell-click="clickCell"
            >
                <el-table-column type="index" label="序号" width="50" align="center">
                    <template slot-scope="scope">
                        <span>{{ scope.$index + 1 }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="label" label="标题" align="center"></el-table-column>
                <el-table-column prop="display" label="显示" align="center">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.display" :active-value="1" :inactive-value="2" />
                    </template>
                </el-table-column>
                <el-table-column prop="width" label="列宽" align="center">
                    <template slot-scope="scope">
                        <el-input-number
                            v-if="scope.row.index === activeCellIndex[0] && scope.column.index === activeCellIndex[1]"
                            v-model="scope.row.width"
                            :min="80"
                            placeholder="至少80"
                            :controls="false"
                        ></el-input-number>
                        <div v-else>
                            <div v-if="!scope.row.width">-</div>
                            <div v-else>{{ scope.row.width }}</div>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
            <div slot="footer" class="dialog-footer">
                <el-button @click="addConfigVisible = false">取消</el-button>
                <el-button type="primary" @click="configSubmit">确定</el-button>
            </div>
        </el-dialog>
        <el-dialog title="验证提示" width="550px" :visible.sync="validVisible" :close-on-click-modal="false">
            <div style="padding-bottom: 15px; max-height: 300px; overflow: auto">
                <div v-for="(item, index) in failList" :key="index" style="color: #f56c6c; font-size: 16px">
                    {{ index + 1 + '、' }} {{ item }}
                </div>
            </div>
        </el-dialog>
        <!--打印模板-->
        <el-dialog title="数据导入" width="580px" :visible.sync="importVisible" :close-on-click-modal="false">
            <div style="color: #7d7e80; font-size: 13px">
                <div style="background: #f1f3f7; border-radius: 8px; padding: 8px 8px; margin-top: -5px">
                    <div style="display: flex; align-items: center; line-height: 30px">
                        <div
                            style="background: #3a6cfa; width: 6px; height: 6px; border-radius: 50%; margin-right: 5px"
                        >
                            &nbsp;
                        </div>
                        <div>为保证导入数据顺利，请规范填写数据</div>
                    </div>
                    <div style="display: flex; align-items: center; line-height: 30px">
                        <div
                            style="background: #3a6cfa; width: 6px; height: 6px; border-radius: 50%; margin-right: 5px"
                        >
                            &nbsp;
                        </div>
                        <div>请勿修改表格标题，防止导入失败。</div>
                    </div>
                    <div style="display: flex; align-items: center; line-height: 30px">
                        <div
                            style="background: #3a6cfa; width: 6px; height: 6px; border-radius: 50%; margin-right: 5px"
                        >
                            &nbsp;
                        </div>
                        <div>当有多张工作表（sheet）时，只导入第一张工作表</div>
                    </div>
                </div>
                <div
                    style="
                        background: #f1f3f7;
                        border-radius: 8px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        margin-top: 15px;
                        height: 200px;
                    "
                >
                    <el-upload
                        ref="upload"
                        drag
                        :limit="1"
                        :action="action"
                        :show-file-list="false"
                        accept=".xlsx,.xls"
                        :headers="headers"
                        :before-upload="beforeUpload"
                        :on-success="successHandle"
                        :data="importParams"
                    >
                        <i class="el-icon-upload" style="color: #3a6cfa"></i>
                        <div class="el-upload__text" style="color: #000">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__text" style="margin-top: 10px" @click.stop="handleDownImportTemplate">
                            <em><i class="el-icon-download">下载表单数据模版</i></em>
                        </div>
                    </el-upload>
                </div>
                <div style="margin-top: 10px; padding-bottom: 15px">
                    <div style="display: flex; align-items: center; line-height: 24px">
                        <div
                            style="background: #3a6cfa; width: 6px; height: 6px; border-radius: 50%; margin-right: 5px"
                        >
                            &nbsp;
                        </div>
                        <div>请上传.xlsx、.xls格式文件;</div>
                    </div>
                    <div style="display: flex; align-items: center; line-height: 24px">
                        <div
                            style="background: #3a6cfa; width: 6px; height: 6px; border-radius: 50%; margin-right: 5px"
                        >
                            &nbsp;
                        </div>
                        <div>上传的文件大小不可超过10M;</div>
                    </div>
                </div>
            </div>
        </el-dialog>
        <dialog-form ref="dialogForm" />
    </div>
</template>

<script>
import Sortable from 'sortablejs'
import TableColumn from '@/views/components/form/table-column'
import md5 from 'md5'
import dialogForm from '@/views/components/form/dialog-form'
export default {
    components: {
        TableColumn,
        dialogForm
    },
    data() {
        return {
            title: this.$route.query.title,
            action: this.$axios.defaults.baseURL + '/form/import',
            headers: { Authorization: localStorage.getItem('Authorization') },
            height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
            importParams: {
                id: ''
            },
            searchJsonList: [],
            tableData: [],
            pageNo: 1,
            pageSize: 30,
            total: 0,
            tableColumn: [],
            form: {},
            addConfigVisible: false,
            tableHeaderConfig: [],
            rect: {
                needMergeArr: [],
                rowMergeArrs: []
            },
            showSummary: false,
            summaryData: {},
            multipleSelection: [],
            validVisible: false,
            failList: [],
            jsApi: { fields: {}, methods: {} },
            buttonComponent: null,
            actionComponent: null,
            activeCellIndex: -1,
            searchComponent: {},
            activatedFlag: false,
            moreFlag: false,
            importVisible: false,
            workbook: {},
            load: null
        }
    },
    computed: {
        mark() {
            return localStorage.getItem('mark')
        }
    },
    created() {
        let timestamp = Date.now()
        this.headers.Sign = md5(
            'form/import?id=' +
                this.$route.query.id +
                '&timestamp=' +
                timestamp +
                '&key=yVwlsbIrY3q22EnoYYM4nR5zqTmqed05'
        ).toUpperCase()
        this.headers.Timestamp = timestamp
        this.queryById(1)
    },
    activated() {
        if (this.activatedFlag) {
            this.$refs.multipleTable.clearSelection()
            this.queryById(2)
        }
    },
    mounted() {
        this.$bus.$on('updateTable', () => {
            this.activatedFlag = true
        })
    },
    beforeDestroy() {
        this.$bus.$off('updateTable')
    },
    methods: {
        async queryById(type) {
            var search = {}
            for (var i = 0; i < this.searchJsonList.length; i++) {
                if (Array.isArray(this.searchJsonList[i].value)) {
                    search[this.searchJsonList[i].field] = this.searchJsonList[i].value.toString()
                } else {
                    search[this.searchJsonList[i].field] = this.searchJsonList[i].value
                        ? this.searchJsonList[i].value
                        : ''
                }
            }
            const params = {
                id: this.$route.query.id,
                pageNo: this.pageNo,
                pageSize: this.pageSize,
                search: JSON.stringify(search)
            }
            let res = await this.$axios.post('form/queryListById', params)
            if (res.data.code == 200) {
                this.form = res.data.data
                try {
                    this.buttonComponent = require(`@/views/templates/${this.mark}/${this.form.mark}-button`).default
                } catch (error) {}
                try {
                    this.actionComponent = require(`@/views/templates/${this.mark}/${this.form.mark}-action`).default
                } catch (error) {}
                if (type === 1) {
                    this.workbook = res.data.data.workbook
                    this.searchJsonList = res.data.data.options.searchColumn
                    for (let index in this.searchJsonList) {
                        let item = this.searchJsonList[index]
                        if (item.type == 'custom') {
                            try {
                                this.searchComponent[item.field] =
                                    require(`@/views/templates/${this.mark}/${this.form.mark}_${item.field}`).default
                            } catch (error) {}
                        }
                    }
                    this.jsApi = this.utils.resolveScript(res.data.data.options.javascript)
                    for (let key in this.jsApi.methods) {
                        this.utils.addFunc(this, key, this.jsApi.methods[key].params, this.jsApi.methods[key].body)
                    }
                    for (let key in this.jsApi.fields) {
                        this[key] = this.jsApi.fields[key]
                    }
                    this.execMounted()
                }
                this.importParams.id = this.$route.query.id
                this.tableColumn = res.data.data.options.tableColumn
                let tableHeaderConfig = JSON.parse(JSON.stringify(res.data.data.options.tableColumnConfig))
                for (let i = 0; i < tableHeaderConfig.length; i++) {
                    if (!tableHeaderConfig[i].display) {
                        tableHeaderConfig[i].display = 1
                    }
                }
                this.tableHeaderConfig = tableHeaderConfig
                this.tableData = res.data.data.tableData.list
                this.total = res.data.data.tableData.total

                let needMergeArr = []
                let summaryColumns = []

                this.tableHeaderIterator(this.tableColumn, needMergeArr, summaryColumns)
                this.rect.needMergeArr = needMergeArr
                this.rect.rowMergeArrs = this.rowMergeHandle(needMergeArr, this.tableData)
                this.showSummary = summaryColumns.length > 0
                this.summaryData = res.data.data.summaryData
            } else {
                this.$message.error(res.data.message)
            }
        },
        execMounted() {
            if (this.jsApi.methods.hasOwnProperty('mounted')) {
                this.mounted()
            }
        },
        spanMethod({ row, column, rowIndex, columnIndex }, rect) {
            if (rect.needMergeArr.indexOf(column.property) > -1) {
                return this.mergeAction(column.property, rowIndex, column, rect)
            }
        },
        mergeAction(val, rowIndex, colData, rect) {
            let _row = rect.rowMergeArrs[val].rowArr[rowIndex]
            let _col = _row > 0 ? 1 : 0
            return [_row, _col]
        },
        rowMergeHandle(arr, data) {
            if (!Array.isArray(arr) && !arr.length) return false
            if (!Array.isArray(data) && !data.length) return false
            let needMerge = {}
            arr.forEach(i => {
                needMerge[i] = {
                    rowArr: [],
                    rowMergeNum: 0
                }
                data.forEach((item, index) => {
                    if (index === 0) {
                        needMerge[i].rowArr.push(1)
                        needMerge[i].rowMergeNum = 0
                    } else {
                        if (item[i] === data[index - 1][i]) {
                            needMerge[i].rowArr[needMerge[i].rowMergeNum] += 1
                            needMerge[i].rowArr.push(0)
                        } else {
                            needMerge[i].rowArr.push(1)
                            needMerge[i].rowMergeNum = index
                        }
                    }
                })
            })
            return needMerge
        },
        tableHeaderIterator(tree, needMergeArr, summaryColumns) {
            tree.forEach(node => {
                if (node.summary == 1) {
                    needMergeArr.push(node.prop)
                }
                if (node.total == 1) {
                    summaryColumns.push(node.prop)
                }
                node.children && this.tableHeaderIterator(node.children, needMergeArr, summaryColumns)
            })
        },
        handleCurrentChange(val) {
            this.queryById(2)
        },
        handleSearch() {
            this.queryById(2)
        },
        showConfigDialog() {
            this.addConfigVisible = true
            this.$nextTick(() => {
                const tbody = document.querySelector('.el-dialog .el-table__body-wrapper tbody')
                const that = this
                Sortable.create(tbody, {
                    onEnd({ newIndex, oldIndex }) {
                        const currRow = that.tableHeaderConfig.splice(oldIndex, 1)[0]
                        that.tableHeaderConfig.splice(newIndex, 0, currRow)
                    }
                })
            })
        },
        configSubmit() {
            const params = {
                options: JSON.stringify(this.tableHeaderConfig),
                formId: this.$route.query.id
            }
            this.$axios.post('tableColumnConfig/insertOrUpdate', params).then(res => {
                if (res.data.code == 200) {
                    this.addConfigVisible = false
                    this.$router.go(0)
                } else {
                    this.$message.error(res.data.message)
                }
            })
        },
        showAddDialog() {
            if (this.expanded === 'dialog') {
                this.$refs.dialogForm.showDialog('新增', this.workbook)
            } else {
                this.$router.push({
                    path: '/handleCustomForm',
                    query: {
                        formId: this.$route.query.id,
                        title: this.$route.query.title,
                        time: new Date().getTime()
                    }
                })
            }
        },
        deleteSubmit() {
            let businessKeys = []
            for (let i = 0; i < this.multipleSelection.length; i++) {
                businessKeys.push(this.multipleSelection[i].id)
            }
            if (this.multipleSelection.length === 0) {
                this.$message.error('请选择要删除的数据')
            } else {
                this.$confirm('亲，确认要删除吗？', '提示', { type: 'warning' }).then(() => {
                    var params = {
                        businessType: this.$route.query.id,
                        businessKeys: businessKeys.toString()
                    }
                    this.$axios.post('form/deleteCustom', params).then(res => {
                        if (res.data.code == 200) {
                            this.$message.success('删除成功')
                            this.queryById(2)
                            this.multipleSelection = []
                        } else {
                            this.$message.error(res.data.message)
                        }
                    })
                })
            }
        },
        handleExport() {
            var search = {}
            for (var i = 0; i < this.searchJsonList.length; i++) {
                if (Array.isArray(this.searchJsonList[i].value)) {
                    search[this.searchJsonList[i].field] = this.searchJsonList[i].value.toString()
                } else {
                    search[this.searchJsonList[i].field] = this.searchJsonList[i].value
                        ? this.searchJsonList[i].value
                        : ''
                }
            }
            let load = this.$loading({
                lock: true,
                text: '正在导出...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            })
            let fileName = this.$route.query.title + '.xlsx'
            let params = {
                id: this.$route.query.id,
                search: JSON.stringify(search),
                companyId: localStorage.getItem('companyId'),
                userId: localStorage.getItem('userId')
            }
            this.$axios.post('form/export', params, { responseType: 'blob' }).then(res => {
                let content = res.data
                let blob = new Blob([content])
                if ('download' in document.createElement('a')) {
                    // 非IE下载
                    let elink = document.createElement('a')
                    elink.download = fileName
                    elink.style.display = 'none'
                    elink.href = URL.createObjectURL(blob)
                    document.body.appendChild(elink)
                    elink.click()
                    URL.revokeObjectURL(elink.href) // 释放URL 对象
                    document.body.removeChild(elink)
                } else {
                    // IE10+下载
                    navigator.msSaveBlob(blob, fileName)
                }
                load.close()
            })
        },
        beforeUpload(file) {
            const suffix = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase()
            if (suffix != 'xlsx' && suffix != 'xls') {
                this.$message.error(`只能选择excel文件`)
                return false
            }
            this.load = this.$loading({
                lock: true,
                text: '导入中...'
            })
            return true
        },
        successHandle(res, file, fileList) {
            if (res.code === 200) {
                this.$message.success('导入成功')
                this.importVisible = false
                this.queryById(1)
            } else if (res.code === 10012) {
                this.failList = res.data
                this.validVisible = true
            } else {
                this.$message.error(res.message)
            }
            this.load.close()
            this.$refs.upload.clearFiles()
        },
        handleImport() {
            this.importVisible = true
        },
        handleDownImportTemplate() {
            let fileName = this.form.name
            let params = {
                id: this.$route.query.id
            }
            this.$axios.post('form/download', params, { responseType: 'blob' }).then(res => {
                let content = res.data
                let blob = new Blob([content])
                if ('download' in document.createElement('a')) {
                    // 非IE下载
                    let elink = document.createElement('a')
                    elink.download = fileName + '.xlsx'
                    elink.style.display = 'none'
                    elink.href = URL.createObjectURL(blob)
                    document.body.appendChild(elink)
                    elink.click()
                    URL.revokeObjectURL(elink.href) // 释放URL 对象
                    document.body.removeChild(elink)
                } else {
                    // IE10+下载
                    navigator.msSaveBlob(blob, fileName + '.xlsx')
                }
            })
        },
        getSummaries(param) {
            const { columns, data } = param
            const sums = []
            columns.forEach((column, index) => {
                if (index === 0) {
                    sums[index] = '合计'
                }
                if (this.summaryData.hasOwnProperty(column.property)) {
                    sums[index] = parseFloat(this.summaryData[column.property]).toLocaleString('zh')
                }
            })
            return sums
        },
        handleSelectionChange(val) {
            this.multipleSelection = val
        },
        resetForm() {
            for (let i = 0; i < this.searchJsonList.length; i++) {
                let item = this.searchJsonList[i]
                if (Array.isArray(item.value)) {
                    item.value = []
                } else {
                    item.value = ''
                }
                this.$set(this.searchJsonList, i, item)
            }
        },
        rowStyleEvent({ row, rowIndex }) {
            if (this.jsApi.methods.hasOwnProperty('rowStyle')) {
                let style = this.rowStyle(row, rowIndex)
                style['cursor'] = 'pointer'
                return style
            } else {
                return {
                    cursor: 'pointer'
                }
            }
        },
        handleRowDblclick(row, column, event) {
            if (this.expanded === 'dialog') {
                this.$refs.dialogForm.showDialog('编辑', this.workbook, row)
            } else {
                if (this.jsApi.methods.hasOwnProperty('rowDblclick')) {
                    this.rowDblclick(row, column, event)
                } else {
                    this.$router.push({
                        path: '/handleCustomForm',
                        query: {
                            formId: this.$route.query.id,
                            id: row.id,
                            title: this.$route.query.title + '详情'
                        }
                    })
                }
            }
        },
        tableCellClassName({ row, column, rowIndex, columnIndex }) {
            row.index = rowIndex
            column.index = columnIndex
        },
        clickCell(row, column) {
            this.activeCellIndex = [row.index, column.index]
        }
    }
}
</script>

<style scoped>
::v-deep .el-upload-dragger {
    background-color: transparent !important;
    border: none;
}
::v-deep .el-dialog__body {
    padding: 10px 20px 0px 20px;
}
</style>
