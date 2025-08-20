<template>
    <el-dialog :title="title" width="750px" :visible.sync="dialogVisible" :close-on-click-modal="false" append-to-body>
        <el-form :model="formModel" label-width="80px" :rules="rules" ref="formModel">
            <el-row>
                <el-col :span="item.span" v-for="(item, index) in fieldOptions" :key="index">
                    <el-form-item :label="item.label" :prop="item.field">
                        <!-- company、department、member、business -->
                        <el-input
                            v-model="formModel[item.field]"
                            clearable
                            :placeholder="item.placeholder"
                            :disabled="item.disabled"
                            :type="item.inputType"
                            :rows="3"
                            v-if="item.type === 'text'"
                        ></el-input>
                        <el-input-number
                            v-model="formModel[item.field]"
                            :controls="false"
                            :disabled="item.disabled"
                            :placeholder="item.placeholder"
                            :precision="item.precision || 0"
                            v-thousandsSeparators="{
                                thousandsSeparators: item.thousandsSeparators,
                                precision: item.precision || 0
                            }"
                            clearable
                            @mousewheel.native.prevent
                            v-else-if="item.type === 'number'"
                        ></el-input-number>
                        <el-radio-group
                            v-model="formModel[item.field]"
                            :disabled="item.disabled"
                            v-else-if="item.type === 'radio'"
                        >
                            <el-radio
                                v-for="(item, index) in item.options"
                                :key="index"
                                :disabled="item.disabled"
                                :label="item.value"
                            >
                                {{ item.label }}
                            </el-radio>
                        </el-radio-group>
                        <el-checkbox-group
                            v-model="formModel[item.field]"
                            :disabled="item.disabled"
                            v-else-if="item.type === 'checkbox'"
                        >
                            <el-checkbox
                                v-for="(item, index) in item.options"
                                :key="index"
                                :disabled="item.disabled"
                                :label="item.value"
                            >
                                {{ item.label }}
                            </el-checkbox>
                        </el-checkbox-group>
                        <el-select
                            v-model="formModel[item.field]"
                            clearable
                            filterable
                            :placeholder="item.placeholder"
                            :disabled="item.disabled"
                            :multiple="item.multiple"
                            collapse-tags
                            v-else-if="item.type === 'select'"
                        >
                            <el-option
                                v-for="item in item.options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled"
                            >
                            </el-option
                        ></el-select>
                        <el-cascader
                            v-model="formModel[item.field]"
                            :disabled="item.disabled"
                            :placeholder="item.placeholder"
                            clearable
                            filterable
                            :show-all-levels="false"
                            :props="{ value: 'value', label: 'label', emitPath: false }"
                            :options="item.options"
                            v-else-if="item.type === 'cascader'"
                        >
                        </el-cascader>
                        <el-switch
                            v-model="formModel[item.field]"
                            :active-value="item.activeValue"
                            :disabled="item.disabled"
                            :inactive-value="item.inactiveValue"
                            v-else-if="item.type === 'switch'"
                        ></el-switch>
                        <el-date-picker
                            v-model="formModel[item.field]"
                            clearable
                            :placeholder="item.placeholder"
                            :disabled="item.disabled"
                            :type="item.dateType"
                            :value-format="item.dataFormat"
                            align="center"
                            v-else-if="item.type === 'datePicker'"
                        ></el-date-picker>
                        <el-upload
                            :ref="item.field"
                            :action="action"
                            :before-upload="
                                file => {
                                    return beforeFileUpload(file, item)
                                }
                            "
                            :file-list="formModel[item.field]"
                            :headers="headers"
                            :on-success="
                                (res, file, fileList) => {
                                    return handleFileSuccess(res, file, fileList, item.field)
                                }
                            "
                            list-type="picture-card"
                            :multiple="item.multiple"
                            v-else-if="item.type === 'picture' || item.type === 'upload'"
                        >
                            <i class="el-icon-plus"></i>
                            <div slot="file" slot-scope="{ file }">
                                <img
                                    v-if="file.type === 'image'"
                                    :src="
                                        file.url +
                                        '?x-oss-process=image/resize,w_148,h_148/auto-orient,1/quality,q_90/format,jpg'
                                    "
                                    class="el-upload-list__item-thumbnail"
                                    style="width: 148px; height: 148px"
                                />
                                <img
                                    v-else-if="file.type === 'tif'"
                                    class="el-upload-list__item-thumbnail"
                                    src="@/assets/fileType/tif.svg"
                                />
                                <img
                                    v-else-if="file.type === 'txt'"
                                    class="el-upload-list__item-thumbnail"
                                    src="@/assets/fileType/txt.svg"
                                />
                                <img
                                    v-else-if="file.type === 'excel'"
                                    class="el-upload-list__item-thumbnail"
                                    src="@/assets/fileType/excel.svg"
                                />
                                <img
                                    v-else-if="file.type === 'word'"
                                    class="el-upload-list__item-thumbnail"
                                    src="@/assets/fileType/word.svg"
                                />
                                <img
                                    v-else-if="file.type === 'pdf'"
                                    class="el-upload-list__item-thumbnail"
                                    src="@/assets/fileType/pdf.svg"
                                />
                                <img
                                    v-else-if="file.type === 'ppt'"
                                    class="el-upload-list__item-thumbnail"
                                    src="@/assets/fileType/ppt.svg"
                                />
                                <img
                                    v-else-if="file.type === 'video'"
                                    class="el-upload-list__item-thumbnail"
                                    src="@/assets/fileType/video.svg"
                                />
                                <img
                                    v-else-if="file.type === 'zip'"
                                    class="el-upload-list__item-thumbnail"
                                    src="@/assets/fileType/zip.svg"
                                />
                                <img
                                    v-else-if="file.type === 'ofd'"
                                    class="el-upload-list__item-thumbnail"
                                    src="@/assets/fileType/ofd.svg"
                                />
                                <img
                                    v-else-if="file.type === 'rtf'"
                                    class="el-upload-list__item-thumbnail"
                                    src="@/assets/fileType/rtf.svg"
                                />
                                <img v-else class="el-upload-list__item-thumbnail" src="@/assets/fileType/other.svg" />
                                <span class="el-upload-list__item-actions">
                                    <span
                                        v-if="file.type === 'image' || file.type === 'tif' || file.type === 'pdf'"
                                        class="el-upload-list__item-preview"
                                        @click="handleFilePreview(file, item.field)"
                                    >
                                        <i class="el-icon-view"></i>
                                    </span>
                                    <span class="el-upload-list__item-delete" @click="handleFileDownload(file)">
                                        <i class="el-icon-download"></i>
                                    </span>
                                    <span
                                        class="el-upload-list__item-delete"
                                        @click="handleFileRemove(file, item.field)"
                                    >
                                        <i class="el-icon-delete"></i>
                                    </span>
                                </span>
                            </div>
                        </el-upload>
                        <editor
                            :id="item.field"
                            :height="300"
                            style="overflow: auto"
                            v-model="formModel[item.field]"
                            :placeholder="itemplaceholder"
                            v-else-if="item.type === 'editor'"
                        >
                        </editor>
                        <el-input
                            v-model="formModel[item.field]"
                            clearable
                            :placeholder="item.placeholder"
                            :disabled="item.disabled"
                            v-else-if="item.type === 'bill'"
                        ></el-input>
                        <el-select
                            v-model="formModel[item.field]"
                            clearable
                            filterable
                            :placeholder="item.placeholder"
                            :disabled="item.disabled"
                            :multiple="item.multiple"
                            collapse-tags
                            v-else-if="item.type === 'business'"
                        >
                            <el-option
                                v-for="item in item.options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled"
                            >
                            </el-option
                        ></el-select>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">提交</el-button>
        </div>
        <el-image-viewer
            v-if="previewDialogVisible"
            :on-close="closeViewer"
            :url-list="previewSrcList"
            :zIndex="9999"
        />
        <tiny-business ref="tinyBusiness" @confirm="handleConfirm" />
    </el-dialog>
</template>

<script>
import md5 from 'md5'
import { Image } from 'element-ui'
import editor from '@/views/components/quill/editor'
import tinyBusiness from '@/views/components/form/tiny-business'
export default {
    components: {
        ElImageViewer: Image.components.ImageViewer,
        editor,
        tinyBusiness
    },
    data() {
        return {
            action: this.$axios.defaults.baseURL + '/upload/putObject/oss',
            headers: {
                Authorization: window.localStorage.getItem('Authorization')
            },
            title: '',
            dialogVisible: false,
            formModel: {},
            rules: {},
            fieldOptions: [],
            property: {},
            firstFlag: true,
            previewDialogVisible: false,
            previewSrcList: []
        }
    },
    created() {
        let timestamp = Date.now()
        this.headers.Sign = md5(
            'upload/putObject/oss?timestamp=' + timestamp + '&key=yVwlsbIrY3q22EnoYYM4nR5zqTmqed05'
        ).toUpperCase()
        this.headers.Timestamp = timestamp
    },
    methods: {
        showDialog(title, workbook, row) {
            this.title = title
            if (row) {
                this.formModel = JSON.parse(JSON.stringify(row))
            } else {
                this.formModel = {}
            }
            if (this.firstFlag) {
                let rows = workbook.data.rows
                let keyList = []
                for (let keyRow in rows) {
                    let row = rows[keyRow]
                    let cells = row.cells
                    for (let keyCell in cells) {
                        let cell = cells[keyCell]
                        if (cell.hasOwnProperty('key')) {
                            keyList.push(cell.key)
                        }
                    }
                }
                let module = workbook.module
                let fieldOptions = []
                for (let key in module) {
                    let item = module[key]
                    if (item.type === 'datePicker') {
                        let dateType = item.dateType.split('|')
                        item.dateType = dateType[0]
                        item.dataFormat = dateType[1]
                    }
                    item.sort = keyList.indexOf(key)
                    if (item.type != 'custom') {
                        fieldOptions.push(item)
                    }
                }
                fieldOptions = fieldOptions.sort((a, b) => (a.sort ? a.sort : 0) - (b.sort ? b.sort : 0))
                for (let i = 0; i < fieldOptions.length; i++) {
                    let item = fieldOptions[i]
                    item.span = 12
                    if (item.type === 'text') {
                        if (!this.formModel.hasOwnProperty(item.field)) {
                            if (item.defaultValue) {
                                this.$set(this.formModel, item.field, item.defaultValue)
                            }
                        }
                        if (item.required) {
                            this.$set(this.rules, item.field, [{ required: true, message: item.placeholder }])
                        }
                        if (item.inputType === 'textarea') {
                            item.span = 24
                        }
                    } else if (item.type === 'number') {
                        if (!this.formModel.hasOwnProperty(item.field)) {
                            if (item.defaultValue) {
                                this.$set(this.formModel, item.field, item.defaultValue)
                            } else {
                                if (item.defaultValue === 0) {
                                    this.$set(this.formModel, item.field, 0)
                                } else {
                                    this.$set(this.formModel, item.field, undefined)
                                }
                            }
                        }
                        if (item.required) {
                            this.$set(this.rules, item.field, [{ required: true, message: item.placeholder }])
                        }
                    } else if (item.type === 'radio') {
                        if (!this.formModel.hasOwnProperty(item.field)) {
                            if (item.defaultValue) {
                                this.$set(this.formModel, item.field, String(item.defaultValue))
                                this.handleChangeRule(item)
                            } else {
                                this.$set(this.formModel, item.field, '')
                            }
                        }
                        if (item.required) {
                            this.$set(this.rules, item.field, [{ required: true, message: item.placeholder }])
                        }
                        this.queryDicDetail(item, i)
                    } else if (item.type === 'checkbox') {
                        if (!this.formModel.hasOwnProperty(item.field)) {
                            if (item.defaultValue) {
                                this.$set(this.formModel, item.field, item.defaultValue)
                                this.handleChangeRule(item)
                            } else {
                                this.$set(this.formModel, item.field, [])
                            }
                        } else {
                            this.$set(this.formModel, item.field, JSON.parse(this.formModel[item.field]))
                        }
                        if (item.required) {
                            this.$set(this.rules, item.field, [
                                { type: 'array', required: true, message: item.placeholder }
                            ])
                        }
                        this.queryDicDetail(item, i)
                    } else if (item.type === 'select') {
                        if (!this.formModel.hasOwnProperty(item.field)) {
                            if (item.defaultValue) {
                                this.$set(this.formModel, item.field, item.defaultValue)
                                this.handleChangeRule(item)
                            } else {
                                if (item.multiple) {
                                    this.$set(this.formModel, item.field, [])
                                } else {
                                    this.$set(this.formModel, item.field, '')
                                }
                            }
                        } else {
                            this.$set(this.formModel, item.field, String(this.formModel[item.field]))
                        }
                        if (item.required) {
                            if (item.multiple) {
                                this.$set(this.rules, item.field, [
                                    { type: 'array', required: true, message: item.placeholder }
                                ])
                            } else {
                                this.$set(this.rules, item.field, [{ required: true, message: item.placeholder }])
                            }
                        }
                        this.queryDicDetail(item, i)
                    } else if (item.type === 'cascader') {
                        if (!this.formModel.hasOwnProperty(item.field)) {
                            if (item.defaultValue) {
                                this.$set(this.formModel, item.field, item.defaultValue)
                                this.handleChangeRule(item)
                            } else {
                                if (item.multiple) {
                                    this.$set(this.formModel, item.field, [])
                                } else {
                                    this.$set(this.formModel, item.field, '')
                                }
                            }
                        } else {
                            this.$set(this.formModel, item.field, String(this.formModel[item.field]))
                        }
                        if (item.required) {
                            if (item.multiple) {
                                this.$set(this.rules, item.field, [
                                    { type: 'array', required: true, message: item.placeholder }
                                ])
                            } else {
                                this.$set(this.rules, item.field, [{ required: true, message: item.placeholder }])
                            }
                        }
                        this.queryDicDetail(item, i)
                    } else if (item.type === 'switch') {
                        if (!this.formModel.hasOwnProperty(item.field)) {
                            if (item.defaultValue) {
                                this.$set(this.formModel, item.field, item.defaultValue)
                                this.handleChangeRule(item)
                            } else {
                                if (item.defaultValue === 0) {
                                    this.$set(this.formModel, item.field, item.defaultValue)
                                }
                            }
                        }
                    } else if (item.type === 'datePicker') {
                        if (!this.formModel.hasOwnProperty(item.field)) {
                            if (item.defaultsCurrent) {
                                let currentDate = new Date()
                                let year = currentDate.getFullYear()
                                let month =
                                    currentDate.getMonth() + 1 < 10
                                        ? '0' + (currentDate.getMonth() + 1)
                                        : currentDate.getMonth() + 1
                                let day =
                                    currentDate.getDate() < 10 ? '0' + currentDate.getDate() : currentDate.getDate()
                                let hours =
                                    currentDate.getHours() < 10 ? '0' + currentDate.getHours() : currentDate.getHours()
                                let minutes =
                                    currentDate.getMinutes() < 10
                                        ? '0' + currentDate.getMinutes()
                                        : currentDate.getMinutes()
                                let seconds =
                                    currentDate.getSeconds() < 10
                                        ? '0' + currentDate.getSeconds()
                                        : currentDate.getSeconds()
                                if (item.dateType === 'year') {
                                    this.$set(this.formModel, item.field, year)
                                } else if (item.dateType === 'month') {
                                    this.$set(this.formModel, item.field, year + '-' + month)
                                } else if (item.dateType === 'date') {
                                    this.$set(this.formModel, item.field, year + '-' + month + '-' + day)
                                } else if (item.dateType === 'datetime') {
                                    this.$set(
                                        this.formModel,
                                        item.field,
                                        year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
                                    )
                                }
                            } else {
                                this.$set(this.formModel, item.field, '')
                            }
                        } else {
                            if (item.dataFormat === 'yyyy-MM-dd HH:mm') {
                                this.$set(
                                    this.formModel,
                                    item.field,
                                    this.formModel[item.field].substring(0, 16).replace('T', ' ')
                                )
                            }
                        }
                        if (item.required) {
                            this.$set(this.rules, item.field, [{ required: true, message: item.placeholder }])
                        }
                    } else if (item.type === 'picture') {
                        item.span = 24
                        if (this.formModel.hasOwnProperty(item.field)) {
                            if (this.formModel[item.field] instanceof Array) {
                                this.$set(this.formModel, item.field, this.formModel[item.field])
                            } else {
                                this.$set(this.formModel, item.field, JSON.parse(this.formModel[item.field]))
                            }
                        } else {
                            this.$set(this.formModel, item.field, [])
                        }
                        if (item.required) {
                            this.$set(this.rules, item.field, [
                                { type: 'array', required: true, message: item.placeholder }
                            ])
                        }
                    } else if (item.type === 'upload') {
                        item.span = 24
                        if (!this.formModel.hasOwnProperty(item.field)) {
                            this.$set(this.formModel, item.field, [])
                        } else {
                            if (this.formModel[item.field] instanceof Array) {
                                this.$set(this.formModel, item.field, this.formModel[item.field])
                            } else {
                                this.$set(this.formModel, item.field, JSON.parse(this.formModel[item.field]))
                            }
                        }
                        if (item.required) {
                            this.$set(this.rules, item.field, [
                                { type: 'array', required: true, message: item.placeholder }
                            ])
                        }
                    } else if (item.type === 'editor') {
                        item.span = 24
                        if (this.formModel.hasOwnProperty(item.field)) {
                            if (this.formModel[item.field]) {
                                this.$set(this.formModel, item.field, this.formModel[item.field])
                            } else {
                                this.$set(this.formModel, item.field, { ops: [{ insert: ' \n' }] })
                            }
                        }
                        if (item.required) {
                            this.$set(this.rules, item.field, [{ required: true, message: item.placeholder }])
                        }
                    } else if (item.type === 'bill') {
                        if (!this.formModel.hasOwnProperty(item.field)) {
                            this.queryBill(item.field, item.serial)
                        }
                        if (item.required) {
                            this.$set(this.rules, item.field, [{ required: true, message: item.placeholder }])
                        }
                    } else if (item.type === 'company') {
                    } else if (item.type === 'department') {
                        if (this.formModel.hasOwnProperty(item.field)) {
                            if (item.multiple) {
                                this.$set(this.formModel, item.field, String(this.formModel[item.field]).split(','))
                            }
                        } else {
                            if (item.multiple) {
                                if (item.defaultValue) {
                                    this.$set(this.formModel, item.field, [
                                        String(localStorage.getItem('departmentId'))
                                    ])
                                } else {
                                    this.$set(this.formModel, item.field, [])
                                }
                            } else {
                                if (item.defaultValue) {
                                    this.$set(this.formModel, item.field, String(localStorage.getItem('departmentId')))
                                }
                            }
                        }
                        if (item.required) {
                            if (item.multiple) {
                                this.$set(this.rules, item.field, [
                                    { type: 'array', required: true, message: item.placeholder }
                                ])
                            } else {
                                this.$set(this.rules, item.field, [{ required: true, message: item.placeholder }])
                            }
                        }
                        this.queryDynamic(item, i)
                    } else if (item.type === 'member') {
                        if (this.formModel.hasOwnProperty(item.field)) {
                            if (item.multiple) {
                                this.$set(this.formModel, item.field, String(this.formModel[item.field]).split(','))
                            }
                        } else {
                            if (item.multiple) {
                                if (item.defaultValue) {
                                    this.$set(this.formModel, item.field, [String(localStorage.getItem('userId'))])
                                } else {
                                    this.$set(this.formModel, item.field, [])
                                }
                            } else {
                                if (item.defaultValue) {
                                    this.$set(this.formModel, item.field, String(localStorage.getItem('userId')))
                                }
                            }
                        }
                        if (item.required) {
                            if (item.multiple) {
                                this.$set(this.rules, item.field, [
                                    { type: 'array', required: true, message: item.placeholder }
                                ])
                            } else {
                                this.$set(this.rules, item.field, [{ required: true, message: item.placeholder }])
                            }
                        }
                        this.queryDynamic(item, i)
                    } else if (item.type === 'business') {
                        item.options = []
                        if (this.formModel.hasOwnProperty(item.field)) {
                            if (item.multiple) {
                                this.$set(this.formModel, item.field, String(this.formModel[item.field]).split(','))
                            }
                            this.queryBusinessData(item, i)
                        } else {
                            if (item.multiple) {
                                this.$set(this.formModel, item.field, [])
                            }
                        }
                        if (item.required) {
                            if (item.multiple) {
                                this.$set(this.rules, item.field, [
                                    { type: 'array', required: true, message: item.placeholder }
                                ])
                            } else {
                                this.$set(this.rules, item.field, [{ required: true, message: item.placeholder }])
                            }
                        }
                    }
                    this.$set(this.property, item.field, item)
                }
                this.fieldOptions = fieldOptions
                this.firstFlag = false
            }
            this.dialogVisible = true
            if (this.$refs.formModel) {
                this.$refs.formModel.resetFields()
            }
        },
        async queryBill(field, serial) {
            let params = {
                formId: this.$route.query.id,
                field: field,
                serial: serial
            }
            let res = await this.$axios.post('form/queryBill', params)
            if (res.data.code === 200) {
                this.$set(this.formModel, field, res.data.data)
            } else {
                this.$message.error(res.data.message)
            }
        },
        async queryDicDetail(obj, index) {
            let res = await this.$axios.get('dicDetail/queryDisplay?classifyId=' + obj.source)
            if (res.data.code === 200) {
                let item = this.fieldOptions[index]
                var options = []
                for (var i = 0; i < res.data.data.length; i++) {
                    options.push({
                        label: res.data.data[i].name,
                        value: String(res.data.data[i].code),
                        disabled: res.data.data[i].status != 1
                    })
                }
                item.options = options
                this.$set(this.fieldOptions, index, item)
            }
        },
        async queryBusinessData(obj, index) {
            let params = {
                formId: obj.source,
                value: this.formModel[item.field].toString()
            }
            let res = await this.$axios.post('form/queryOptions', params)
            if (res.data.code === 200) {
                let item = this.fieldOptions[index]
                var options = []
                options.push({
                    label: res.data.data[attribute.showField],
                    value: String(res.data.data.id)
                })
                item.options = options
                this.$set(this.fieldOptions, index, item)
            }
        },
        async queryDynamic(obj, index) {
            let res = await this.$axios.get('form/queryDynamic?path=' + obj.type + '&type=list')
            if (res.data.code === 200) {
                let item = this.fieldOptions[index]
                var options = []
                for (var i = 0; i < res.data.data.length; i++) {
                    options.push({
                        id: res.data.data[i].id,
                        label: res.data.data[i].name,
                        value: String(res.data.data[i].id)
                    })
                }
                item.options = options
                this.$set(this.fieldOptions, index, item)
            }
        },
        // 文件上传之前
        beforeFileUpload(file, item) {
            const suffix = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase()
            if (item.minValue) {
                if (file.size / (1024 * 1024) < item.minValue) {
                    this.$message.error('文档大小至少' + item.minValue + 'MB')
                    return false
                }
            }
            if (item.maxValue) {
                if (file.size / (1024 * 1024) > item.maxValue) {
                    this.$message.error('文档大小不能超过' + item.maxValue + 'MB')
                    return false
                }
            }
            if (item.accept && item.accept.length > 0) {
                if (!item.accept.includes(suffix)) {
                    this.$message.error('该文件类型不支持上传，请联系管理员进行配置！')
                    return false
                }
            }
            return true
        },
        // 文件上传成功
        handleFileSuccess(res, file, fileList, field) {
            if (res.code === 200) {
                let fileArray = JSON.parse(JSON.stringify(fileList))
                let suffix = ''
                let fileType = ''
                try {
                    const flieArr = file.name.split('.')
                    suffix = flieArr[flieArr.length - 1]
                } catch (err) {}
                if (suffix) {
                    suffix = suffix.toLocaleLowerCase()
                    fileType = this.utils.getFileType(suffix)
                    file.type = fileType
                    file.url = res.data
                }
                let index = (fileArray || []).findIndex(item => item.uid === file.uid)

                fileArray[index] = {
                    type: fileType,
                    name: file.name,
                    size: file.size,
                    url: res.data
                }
                this.formModel[field] = JSON.parse(JSON.stringify(fileArray))
            } else {
                let fileList = this.$refs[field][0].uploadFiles
                let index = fileList.findIndex(fileItem => {
                    return fileItem.url === file.url
                })
                fileList.splice(index, 1)
                this.$message.error(res.message)
            }
        },
        // 文件删除
        handleFileRemove(index, field) {
            this.formModel[field].splice(index, 1)
        },
        // 文件预览
        handleFilePreview(file, field) {
            if (file.type === 'image') {
                let previewSrcList = []
                for (let i = 0; i < this.formModel[field].length; i++) {
                    let item = this.formModel[field][i]
                    if (item.type === 'image') {
                        previewSrcList.push(item.url)
                    }
                }

                let index = previewSrcList.indexOf(file.url)
                for (let i = 0; i < index; i++) {
                    previewSrcList.push(previewSrcList.shift())
                }
                this.previewSrcList = previewSrcList
                this.previewDialogVisible = true
            } else if (
                file.type === 'pdf' ||
                file.type === 'tif' ||
                file.type === 'ofd' ||
                file.type === 'word' ||
                file.type === 'txt' ||
                file.type === 'rtf' ||
                file.type === 'ppt' ||
                file.type === 'excel'
            ) {
                window.open(
                    this.$axios.defaults.baseURL +
                        '/auth/preview?url=' +
                        encodeURIComponent(file.url) +
                        '&fileName=' +
                        encodeURIComponent(file.name)
                )
            }
        },
        //关闭图片预览
        closeViewer() {
            this.previewDialogVisible = false
        },
        // 文件下载
        handleFileDownload(file) {
            let params = {
                url: file.url,
                fileName: file.name
            }
            this.$axios.post('upload/download', params, { responseType: 'blob' }).then(res => {
                let content = res.data
                let blob = new Blob([content])
                if ('download' in document.createElement('a')) {
                    // 非IE下载
                    let elink = document.createElement('a')
                    elink.download = file.name
                    elink.style.display = 'none'
                    elink.href = URL.createObjectURL(blob)
                    document.body.appendChild(elink)
                    elink.click()
                    URL.revokeObjectURL(elink.href) // 释放URL 对象
                    document.body.removeChild(elink)
                } else {
                    // IE10+下载
                    navigator.msSaveBlob(blob, file.name)
                }
            })
        },
        handleBusinessDialog(formId) {
            this.$refs.tinyBusiness.showDialog(formId, false, {})
        },
        handleConfirm(data) {},
        handleSubmit() {
            this.$refs.formModel.validate(valid => {
                if (valid) {
                    let params = {
                        _type: 'submit',
                        _formId: this.$route.query.id,
                        id: this.formModel.id
                    }
                    if (this.$parent.jsApi.methods.hasOwnProperty('extraParameter')) {
                        params = Object.assign(params, this.$parent.extraParameter())
                    }
                    if (this.$parent.jsApi.methods.hasOwnProperty('validateRule')) {
                        let result = this.$parent.validateRule()
                        if (!result) {
                            return
                        }
                    }
                    for (let field in this.formModel) {
                        let value = this.formModel[field]
                        let item = this.property[field]
                        if (this.property.hasOwnProperty(field)) {
                            if (item.multiple) {
                                if (
                                    item.type === 'select' ||
                                    item.type === 'company' ||
                                    item.type === 'department' ||
                                    item.type === 'member'
                                ) {
                                    params[field] = value.toString()
                                }
                            } else if (item.type === 'checkbox' || item.type === 'cascader') {
                                if (value) {
                                    params[field] = value.toString()
                                }
                            } else if (item.type === 'picture' || item.type === 'upload' || item.type === 'editor') {
                                params[field] = JSON.stringify(value)
                            } else {
                                params[field] = value
                            }
                        }
                    }
                    let insertUrl = 'form/insertCustom'
                    let updateUrl = 'form/updateCustom'
                    if (this.$parent.jsApi.methods.hasOwnProperty('baseUrl')) {
                        let result = this.$parent.baseUrl()
                        if (result.insertUrl) {
                            insertUrl = result.insertUrl
                        }
                        if (result.updateUrl) {
                            updateUrl = result.updateUrl
                        }
                    }
                    if (this.formModel.id) {
                        this.$axios.post(updateUrl, params).then(res => {
                            if (res.data.code == 200) {
                                this.$message.success('提交成功')
                                this.$parent.queryById(2)
                                this.dialogVisible = false
                            } else {
                                this.$message.error(res.data.message)
                            }
                        })
                    } else {
                        this.$axios.post(insertUrl, params).then(res => {
                            if (res.data.code == 200) {
                                this.$message.success('提交成功')
                                this.$parent.queryById(2)
                                this.dialogVisible = false
                            } else {
                                this.$message.error(res.data.message)
                            }
                        })
                    }
                }
            })
        }
    }
}
</script>
<style scoped>
::v-deep .el-dialog__body {
    padding: 10px 20px 0px 20px;
}
</style>
