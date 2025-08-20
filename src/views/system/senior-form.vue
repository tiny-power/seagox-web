<template>
    <div class="container">
        <table border="1" bordercolor="#fff" cellpadding="0" cellspacing="0" class="content">
            <tbody id="tbody" class="tbody">
                <tr v-for="(tr, tr_index) in tableData" :key="tr_index">
                    <td
                        v-for="(td, td_index) in tr"
                        :key="td_index"
                        :colspan="td.colspan"
                        :rowspan="td.rowspan"
                        :style="[td.style]"
                    >
                        <div v-if="!td.type" v-html="td.text" />
                        <div v-else-if="td.type === 'text'">
                            <el-input
                                v-show="state[td.field].behavior != 'HIDDEN'"
                                v-model="state[td.field].value"
                                :disabled="state[td.field].behavior === 'DISABLED'"
                                :maxlength="state[td.field].maxlength"
                                :placeholder="
                                    state[td.field].behavior === 'DISABLED' ? '' : state[td.field].placeholder
                                "
                                clearable
                                :type="state[td.field].inputType"
                                @input="handleEvent('input', td.field, $event)"
                            ></el-input>
                            <div v-show="state[td.field].behavior === 'HIDDEN'">******</div>
                        </div>
                        <div v-else-if="td.type === 'number'" style="text-align: left">
                            <el-input-number
                                v-show="state[td.field].behavior != 'HIDDEN'"
                                v-model="state[td.field].value"
                                :controls="false"
                                :disabled="state[td.field].behavior === 'DISABLED'"
                                :placeholder="
                                    state[td.field].behavior === 'DISABLED' ? '' : state[td.field].placeholder
                                "
                                :precision="state[td.field].precision || 0"
                                v-thousandsSeparators="{
                                    thousandsSeparators: state[td.field].thousandsSeparators,
                                    precision: state[td.field].precision || 0
                                }"
                                clearable
                                @blur="handleEvent('blur', td.field, $event)"
                                @change="handleEvent('change', td.field, $event)"
                                @mousewheel.native.prevent
                            ></el-input-number>
                            <div v-show="state[td.field].behavior === 'HIDDEN'">******</div>
                        </div>
                        <div v-else-if="td.type === 'radio'" style="padding-left: 15px; padding-top: 10px">
                            <el-radio-group
                                v-show="state[td.field].behavior != 'HIDDEN'"
                                v-model="state[td.field].value"
                                :disabled="state[td.field].behavior === 'DISABLED'"
                                @change="handleEvent('change', td.field, $event)"
                            >
                                <el-radio
                                    v-for="(item, index) in state[td.field].dataSource"
                                    :key="index"
                                    :disabled="item.status == 0"
                                    :label="item.code"
                                >
                                    {{ item.name }}
                                </el-radio>
                            </el-radio-group>
                            <div v-show="state[td.field].behavior === 'HIDDEN'">******</div>
                        </div>
                        <div v-else-if="td.type === 'checkbox'" style="padding-left: 15px; padding-top: 10px">
                            <el-checkbox-group
                                v-show="state[td.field].behavior != 'HIDDEN'"
                                v-model="state[td.field].value"
                                :disabled="state[td.field].behavior === 'DISABLED'"
                                @change="handleEvent('change', td.field, $event)"
                            >
                                <el-checkbox
                                    v-for="(item, index) in state[td.field].dataSource"
                                    :key="index"
                                    :disabled="item.status == 0"
                                    :label="item.code"
                                >
                                    {{ item.name }}
                                </el-checkbox>
                            </el-checkbox-group>
                            <div v-show="state[td.field].behavior === 'HIDDEN'">******</div>
                        </div>
                        <div v-else-if="td.type === 'select'">
                            <el-select
                                v-show="state[td.field].behavior != 'HIDDEN'"
                                v-model="state[td.field].value"
                                :disabled="state[td.field].behavior === 'DISABLED'"
                                :multiple="state[td.field].multiple"
                                :placeholder="
                                    state[td.field].behavior === 'DISABLED' ? '' : state[td.field].placeholder
                                "
                                clearable
                                filterable
                                @change="handleEvent('change', td.field, $event)"
                            >
                                <el-option
                                    v-for="item in state[td.field].dataSource"
                                    :key="item.value"
                                    :disabled="item.status == 0"
                                    :label="item.name"
                                    :value="item.code"
                                ></el-option>
                            </el-select>
                            <div v-show="state[td.field].behavior === 'HIDDEN'">******</div>
                        </div>
                        <div v-else-if="td.type === 'cascader'">
                            <el-cascader
                                v-show="state[td.field].behavior != 'HIDDEN'"
                                v-model="state[td.field].value"
                                :disabled="state[td.field].behavior === 'DISABLED'"
                                :placeholder="
                                    state[td.field].behavior === 'DISABLED' ? '' : state[td.field].placeholder
                                "
                                clearable
                                filterable
                                :show-all-levels="false"
                                :props="{ value: 'code', label: 'name', emitPath: false }"
                                :options="state[td.field].dataSource"
                                @change="handleEvent('change', td.field, $event)"
                            >
                            </el-cascader>
                            <div v-show="state[td.field].behavior === 'HIDDEN'">******</div>
                        </div>
                        <div v-else-if="td.type === 'switch'">
                            <el-switch
                                v-show="state[td.field].behavior != 'HIDDEN'"
                                v-model="state[td.field].value"
                                :active-value="state[td.field].activeValue"
                                :disabled="state[td.field].behavior === 'DISABLED'"
                                :inactive-value="state[td.field].inactiveValue"
                                @change="handleEvent('change', td.field, $event)"
                            ></el-switch>
                            <div v-show="state[td.field].behavior === 'HIDDEN'">******</div>
                        </div>
                        <div v-else-if="td.type === 'datePicker'">
                            <el-date-picker
                                v-show="state[td.field].behavior != 'HIDDEN'"
                                v-model="state[td.field].value"
                                :disabled="state[td.field].behavior === 'DISABLED'"
                                :placeholder="
                                    state[td.field].behavior === 'DISABLED' ? '' : state[td.field].placeholder
                                "
                                :type="state[td.field].dateType"
                                :value-format="state[td.field].valueFormat"
                                align="center"
                                clearable
                                @change="handleEvent('change', td.field, $event)"
                            >
                            </el-date-picker>
                            <div v-show="state[td.field].behavior === 'HIDDEN'">******</div>
                        </div>
                        <div v-else-if="td.type === 'upload'">
                            <el-upload
                                v-if="state[td.field].behavior != 'DISABLED'"
                                :ref="td.field"
                                :action="action"
                                :before-upload="
                                    file => {
                                        return beforeFileUpload(file, state[td.field])
                                    }
                                "
                                :file-list="state[td.field].value"
                                :headers="headers"
                                :on-success="
                                    (res, file, fileList) => {
                                        return handleFileSuccess(res, file, fileList, td)
                                    }
                                "
                                :show-file-list="false"
                                multiple
                                style="margin: 10px"
                            >
                                <el-button icon="el-icon-upload2" size="small" plain round type="primary"
                                    >上传</el-button
                                >
                            </el-upload>
                            <el-table :data="state[td.field].value" border max-height="300" stripe>
                                <el-table-column align="center" label="序号" type="index" width="55"></el-table-column>
                                <el-table-column align="center" label="文件名" prop="name"></el-table-column>
                                <el-table-column
                                    :formatter="formatBytes"
                                    align="center"
                                    label="大小"
                                    prop="size"
                                ></el-table-column>
                                <el-table-column align="center" label="操作" width="150">
                                    <template slot-scope="scope">
                                        <i
                                            v-if="
                                                scope.row.type === 'image' ||
                                                scope.row.type === 'tif' ||
                                                scope.row.type === 'pdf'
                                            "
                                            class="el-icon-view"
                                            style="font-size: 16px; cursor: pointer"
                                            @click="handleFilePreview(scope.row, td.field)"
                                        ></i>
                                        <i
                                            class="el-icon-download"
                                            style="
                                                font-size: 16px;
                                                margin-left: 10px;
                                                margin-right: 10px;
                                                cursor: pointer;
                                            "
                                            @click="handleFileDownload(scope.row)"
                                        ></i>
                                        <i
                                            v-if="td.behavior != 'DISABLED'"
                                            class="el-icon-delete"
                                            style="font-size: 16px; cursor: pointer"
                                            @click="handleFileRemove(scope.$index, td.field)"
                                        ></i>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                        <div v-else-if="td.type === 'editor'">
                            <editor
                                :id="td.field"
                                :height="td.style.height"
                                style="overflow: auto"
                                v-model="state[td.field].value"
                                :enable="state[td.field].behavior != 'DISABLED'"
                                :placeholder="
                                    state[td.field].behavior === 'DISABLED' ? '' : state[td.field].placeholder
                                "
                            >
                            </editor>
                        </div>
                        <div v-else-if="td.type === 'bill'">
                            <el-input
                                v-show="state[td.field].behavior != 'HIDDEN'"
                                v-model="state[td.field].value"
                                :disabled="state[td.field].behavior === 'DISABLED'"
                                :placeholder="
                                    state[td.field].behavior === 'DISABLED' ? '' : state[td.field].placeholder
                                "
                                clearable
                            ></el-input>
                            <div v-show="state[td.field].behavior === 'HIDDEN'">******</div>
                        </div>
                        <div v-else-if="td.type === 'picture'" style="padding: 10px; text-align: left">
                            <el-upload
                                v-if="!state[td.field].multiple"
                                :action="action"
                                :before-upload="
                                    file => {
                                        return beforeFileUpload(file, state[td.field])
                                    }
                                "
                                :class="td.behavior === 'DISABLED' ? 'upload-disabled' : ''"
                                :disabled="state[td.field].behavior === 'DISABLED'"
                                :headers="headers"
                                :on-preview="
                                    file => {
                                        return handleFilePreview(file, td.field)
                                    }
                                "
                                :on-success="
                                    (res, file, fileList) => {
                                        return handleFileSuccess(res, file, fileList, td)
                                    }
                                "
                                :show-file-list="false"
                                class="avatar-uploader"
                                drag
                            >
                                <el-image
                                    v-if="state[td.field].value.length != 0"
                                    :src="state[td.field].value[0].url"
                                    class="avatar"
                                    lazy
                                ></el-image>
                                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                            </el-upload>
                            <el-upload
                                v-else
                                :ref="td.field"
                                :action="action"
                                :before-upload="
                                    file => {
                                        return beforeFileUpload(file, state[td.field])
                                    }
                                "
                                :class="state[td.field].behavior === 'DISABLED' ? 'upload-disabled' : ''"
                                :disabled="state[td.field].behavior === 'DISABLED'"
                                :file-list="state[td.field].value"
                                :headers="headers"
                                :on-success="
                                    (res, file, fileList) => {
                                        return handleFileSuccess(res, file, fileList, td)
                                    }
                                "
                                list-type="picture-card"
                                multiple
                                drag
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
                                    <img
                                        v-else
                                        class="el-upload-list__item-thumbnail"
                                        src="@/assets/fileType/other.svg"
                                    />
                                    <span class="el-upload-list__item-actions">
                                        <span
                                            v-if="file.type === 'image' || file.type === 'tif' || file.type === 'pdf'"
                                            class="el-upload-list__item-preview"
                                            @click="handleFilePreview(file, td.field)"
                                        >
                                            <i class="el-icon-view"></i>
                                        </span>
                                        <span class="el-upload-list__item-delete" @click="handleFileDownload(file)">
                                            <i class="el-icon-download"></i>
                                        </span>
                                        <span
                                            v-if="td.behavior != 'DISABLED'"
                                            class="el-upload-list__item-delete"
                                            @click="handleFileRemove(file, td.field)"
                                        >
                                            <i class="el-icon-delete"></i>
                                        </span>
                                    </span>
                                </div>
                            </el-upload>
                        </div>
                        <div v-else-if="td.type === 'department'" class="inside-input">
                            <el-select
                                v-show="state[td.field].behavior != 'HIDDEN'"
                                v-model="state[td.field].value"
                                :disabled="state[td.field].behavior === 'DISABLED'"
                                :multiple="state[td.field].multiple"
                                :placeholder="
                                    state[td.field].behavior === 'DISABLED' ? '' : state[td.field].placeholder
                                "
                                clearable
                                @change="handleEvent('change', td.field, $event)"
                            >
                                <el-option
                                    v-for="item in state[td.field].dataSource"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                            <i
                                v-show="state[td.field].behavior === 'NORMAL'"
                                class="el-icon-more iconE"
                                @click="handleDeptDynamicDialog(td.field, state[td.field].multiple)"
                            ></i>
                            <div v-show="state[td.field].behavior === 'HIDDEN'">******</div>
                        </div>
                        <div v-else-if="td.type === 'member'" class="inside-input">
                            <el-select
                                v-show="state[td.field].behavior != 'HIDDEN'"
                                v-model="state[td.field].value"
                                :disabled="state[td.field].behavior === 'DISABLED'"
                                :multiple="state[td.field].multiple"
                                :placeholder="
                                    state[td.field].behavior === 'DISABLED' ? '' : state[td.field].placeholder
                                "
                                clearable
                                @change="handleEvent('change', td.field, $event)"
                            >
                                <el-option
                                    v-for="item in state[td.field].dataSource"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                            <i
                                v-show="state[td.field].behavior === 'NORMAL'"
                                class="el-icon-more iconE"
                                @click="handleMemberDynamicDialog(td.field, state[td.field].multiple)"
                            ></i>
                            <div v-show="state[td.field].behavior === 'HIDDEN'">******</div>
                        </div>
                        <div v-else-if="td.type === 'company'" :class="{ 'inside-input': state[td.field].multiple }">
                            <el-select
                                v-show="state[td.field].behavior != 'HIDDEN'"
                                v-model="state[td.field].value"
                                :disabled="state[td.field].behavior === 'DISABLED'"
                                :multiple="state[td.field].multiple"
                                :placeholder="
                                    state[td.field].behavior === 'DISABLED' ? '' : state[td.field].placeholder
                                "
                                filterable
                                clearable
                                @change="handleEvent('change', td.field, $event)"
                            >
                                <el-option
                                    v-for="item in state[td.field].dataSource"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                            <i
                                v-show="state[td.field].behavior === 'NORMAL' && state[td.field].multiple"
                                class="el-icon-more iconE"
                                @click="handleCompanyDynamicDialog(td.field, state[td.field].multiple)"
                            ></i>
                            <div v-show="state[td.field].behavior === 'HIDDEN'">******</div>
                        </div>
                        <div v-else-if="td.type === 'business'" class="inside-input">
                            <el-select
                                v-show="state[td.field].behavior != 'HIDDEN'"
                                :ref="td.field"
                                v-model="state[td.field].value"
                                :disabled="state[td.field].behavior === 'DISABLED'"
                                :placeholder="
                                    state[td.field].behavior === 'DISABLED' ? '' : state[td.field].placeholder
                                "
                                clearable
                                @change="handleEvent('change', td.field, $event)"
                                @visible-change="visibleChange(td.field, state[td.field])"
                            >
                                <el-option
                                    v-for="item in state[td.field].dataSource"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                            <i
                                v-show="state[td.field].behavior === 'NORMAL'"
                                class="el-icon-more iconE"
                                @click="handleBusinessDialog(td.field, state[td.field])"
                            ></i>
                            <div v-show="state[td.field].behavior === 'HIDDEN'">******</div>
                        </div>
                        <div v-else-if="td.type === 'custom'">
                            <component :ref="td.name" :is="td.component" v-if="td.component" />
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <excel-dept ref="excelDept" @confirm="deptConfirm" />
        <excel-multiple-dept ref="excelMultipleDept" @confirm="deptConfirm" />
        <excel-member ref="excelMember" @confirm="memberConfirm" />
        <excel-multiple-member ref="excelMultipleMember" @confirm="memberConfirm" />
        <excel-multiple-company ref="excelMultipleCompany" @confirm="companyConfirm" />
        <excel-business ref="excelBusiness" @confirm="businessConfirm" />
        <el-image-viewer
            v-if="previewDialogVisible"
            :on-close="closeViewer"
            :url-list="previewSrcList"
            :zIndex="9999"
        />
    </div>
</template>

<script>
import md5 from 'md5'
import excelDept from '@/views/components/form/dept'
import excelMultipleDept from '@/views/components/form/multiple-dept'
import excelMember from '@/views/components/form/member'
import excelMultipleMember from '@/views/components/form/multiple-member'
import excelMultipleCompany from '@/views/components/form/multiple-company'
import excelBusiness from '@/views/system/senior-business'
import { Image } from 'element-ui'
import editor from '@/views/components/quill/editor'

export default {
    components: {
        excelDept,
        excelMultipleDept,
        excelMember,
        excelMultipleMember,
        excelMultipleCompany,
        excelBusiness,
        ElImageViewer: Image.components.ImageViewer,
        editor
    },
    props: {
        behavior: {
            type: String,
            default: 'NORMAl'
        },
        formCofig: {
            type: Object,
            default: () => {}
        },
        formModel: {
            type: Object,
            default: () => {}
        },
        disabled: {
            type: Array,
            default: () => []
        },
        hidden: {
            type: Array,
            default: () => []
        },
        editable: {
            type: Array,
            default: () => []
        },
        stageButton: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        formCofig: {
            handler(newVal) {
                this.loadView()
            },
            immediate: false,
            deep: true
        }
    },
    data() {
        return {
            property: {},
            action: this.$axios.defaults.baseURL + '/upload/putObject/oss',
            headers: {
                Authorization: window.localStorage.getItem('Authorization')
            },
            tableData: [],
            rules: {},
            previewDialogVisible: false,
            previewSrcList: [],
            jsApi: { fields: {}, methods: {} },
            state: {}
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
            'upload/putObject/oss?timestamp=' + timestamp + '&key=yVwlsbIrY3q22EnoYYM4nR5zqTmqed05'
        ).toUpperCase()
        this.headers.Timestamp = timestamp
        this.loadView()
    },
    methods: {
        //字典详情数据
        async querydicDetail(field, source) {
            let res = await this.$axios.get('dicDetail/queryDisplay?classifyId=' + source)
            if (res.data.code === 200) {
                this.$set(this.state[field], 'dataSource', res.data.data)
            }
        },
        //部门或成员数据
        async queryDynamic(field, type) {
            let res = await this.$axios.get('form/queryDynamic?path=' + type + '&type=list')
            if (res.data.code === 200) {
                var options = []
                for (var l = 0; l < res.data.data.length; l++) {
                    options.push({
                        id: res.data.data[l].id,
                        label: res.data.data[l].name,
                        value: String(res.data.data[l].id)
                    })
                }
                this.$set(this.state[field], 'dataSource', options)
            }
        },
        //查询业务数据
        async queryBusinessData(field, attribute) {
            let params = {
                formId: attribute.source,
                value: attribute.value.toString()
            }
            let res = await this.$axios.post('form/queryOptions', params)
            if (res.data.code === 200) {
                var options = []
                options.push({
                    label: res.data.data[attribute.showField],
                    value: String(res.data.data.id)
                })
                this.$set(this.state[field], 'dataSource', options)
            }
        },
        //单据编号
        async queryBill(field, serial) {
            let params = {
                formId: this.$route.query.formId,
                field: field,
                serial: serial
            }

            let res = await this.$axios.post('form/queryBill', params)
            if (res.data.code === 200) {
                this.$set(this.state[field], 'value', res.data.data)
            } else {
                this.$message.error(res.data.message)
            }
        },
        execMounted() {
            if (this.jsApi.methods.hasOwnProperty('mounted')) {
                this.$nextTick(() => {
                    this.mounted()
                })
            }
        },
        //初始化
        loadView() {
            this.tableData = []

            var workbook = this.formCofig

            this.jsApi = this.utils.resolveScript(this.formCofig.javascript)
            for (let key in this.jsApi.methods) {
                this.utils.addFunc(this, key, this.jsApi.methods[key].params, this.jsApi.methods[key].body)
            }
            for (let key in this.jsApi.fields) {
                this[key] = this.jsApi.fields[key]
            }
            this.execMounted()
            var row = workbook.row
            var col = workbook.col
            var module = workbook.module
            var rows = workbook.data.rows
            var cols = workbook.data.cols
            var rowHeight = 32
            var colWidth = 120
            var styles = workbook.data.styles
            var merges = workbook.data.merges

            for (let i = 0; i < row; i++) {
                var cells = {}
                if (rows[i]) {
                    cells = rows[i].cells
                }
                var tr = []
                for (var j = 0; j < col; j++) {
                    var cell = cells[j] || {}
                    var td = {
                        rowspan: 1,
                        colspan: 1,
                        style: { width: colWidth + 'px', height: rowHeight + 'px' }
                    }
                    if (rows[i] && rows[i].height) {
                        td.style.height = rows[i].height + 'px'
                    }
                    if (cols[j] && cols[j].width) {
                        td.style.width = cols[j].width + 'px'
                    }
                    td = this.utils.handleMerge(merges, i, j, td)
                    if (td.rowspan != 0 && td.colspan != 0) {
                        td.style['border'] = 'solid 1px #8E8E8E'
                        let attribute = {}
                        if (cell.key && module[cell.key]) {
                            var property = module[cell.key]
                            td.type = property.type
                            attribute.type = property.type
                            td.key = cell.key
                            if (td.type === 'text') {
                                //输入框
                                td.field = property.field

                                attribute.value = ''
                                attribute.placeholder = property.placeholder
                                attribute.maxlength = property.maxlength
                                attribute.required = property.required
                                attribute.defaultValue = property.defaultValue
                                attribute.disabled = property.disabled
                                attribute.inputType = property.inputType
                                if (property.disabled) {
                                    this.disabled.push(property.field)
                                }
                                // 验证规则
                                let rules = []
                                if (property.required) {
                                    rules.push({ required: true, message: property.placeholder })
                                }
                                if (property.maxlength) {
                                    rules.push({
                                        max: '长度最多' + property.maxlength + '个字符',
                                        message: property.placeholder
                                    })
                                }
                                attribute.rules = rules
                                if (this.formModel[property.field] == null || this.formModel[property.field] === '') {
                                    attribute.value = property.defaultValue
                                } else {
                                    attribute.value = this.formModel[property.field]
                                }
                            } else if (td.type === 'number') {
                                //数字
                                td.field = property.field

                                attribute.value = ''
                                attribute.placeholder = property.placeholder
                                attribute.thousandsSeparators = property.thousandsSeparators
                                attribute.precision = property.precision
                                attribute.required = property.required
                                attribute.defaultValue = property.defaultValue
                                attribute.disabled = property.disabled
                                if (property.disabled) {
                                    this.disabled.push(property.field)
                                }
                                // 验证规则
                                let rules = []
                                if (property.required) {
                                    rules.push({ required: true, message: property.placeholder })
                                }
                                attribute.rules = rules
                                if (this.formModel[property.field] == null || this.formModel[property.field] === '') {
                                    attribute.value = property.defaultValue
                                } else {
                                    attribute.value = this.formModel[property.field]
                                }
                            } else if (td.type === 'radio') {
                                //单选框
                                td.field = property.field

                                attribute.value = ''
                                attribute.required = property.required
                                attribute.defaultValue = property.defaultValue
                                attribute.disabled = property.disabled
                                if (property.disabled) {
                                    this.disabled.push(property.field)
                                }
                                // 验证规则
                                let rules = []
                                if (property.required) {
                                    rules.push({ required: true, message: property.placeholder })
                                }
                                attribute.rules = rules
                                if (this.formModel[property.field] == null || this.formModel[property.field] === '') {
                                    attribute.value = property.defaultValue
                                } else {
                                    attribute.value = String(this.formModel[property.field])
                                }
                                this.querydicDetail(property.field, property.source)
                            } else if (td.type === 'checkbox') {
                                //多选框
                                td.field = property.field

                                attribute.value = []
                                attribute.required = property.required
                                attribute.defaultValue = property.defaultValue
                                attribute.disabled = property.disabled
                                if (property.disabled) {
                                    this.disabled.push(property.field)
                                }
                                // 验证规则
                                let rules = []
                                if (property.required) {
                                    rules.push({ required: true, message: property.placeholder })
                                }
                                attribute.rules = rules
                                if (this.formModel[td.field]) {
                                    attribute.value = String(this.formModel[td.field]).split(',')
                                } else {
                                    attribute.value = property.defaultValue
                                }
                                this.querydicDetail(property.field, property.source)
                            } else if (td.type === 'select') {
                                //下拉选择
                                td.field = property.field

                                attribute.required = property.required
                                attribute.placeholder = property.placeholder
                                attribute.multiple = property.multiple
                                attribute.defaultValue = property.defaultValue
                                attribute.disabled = property.disabled
                                if (property.disabled) {
                                    this.disabled.push(property.field)
                                }
                                // 验证规则
                                let rules = []
                                if (property.required) {
                                    rules.push({ required: true, message: property.placeholder })
                                }
                                attribute.rules = rules
                                if (property.multiple) {
                                    if (this.formModel[property.field]) {
                                        attribute.value = String(this.formModel[td.field]).split(',')
                                    } else {
                                        attribute.value = property.defaultValue
                                    }
                                } else {
                                    if (
                                        this.formModel[property.field] == null ||
                                        this.formModel[property.field] === ''
                                    ) {
                                        attribute.value = property.defaultValue
                                    } else {
                                        attribute.value = String(this.formModel[property.field])
                                    }
                                }
                                this.querydicDetail(property.field, property.source)
                            } else if (td.type === 'cascader') {
                                //级联选择
                                td.field = property.field

                                attribute.required = property.required
                                attribute.placeholder = property.placeholder
                                attribute.disabled = property.disabled
                                if (property.disabled) {
                                    this.disabled.push(property.field)
                                }
                                // 验证规则
                                let rules = []
                                if (property.required) {
                                    rules.push({ required: true, message: property.placeholder })
                                }
                                attribute.rules = rules
                                if (this.formModel[property.field]) {
                                    attribute.value = String(this.formModel[td.field])
                                }
                                this.querydicDetail(property.field, property.source)
                            } else if (td.type === 'switch') {
                                //开关组件
                                td.field = property.field

                                attribute.activeValue = property.activeValue.toString() || '1'
                                attribute.inactiveValue = property.inactiveValue.toString() || '0'
                            } else if (td.type === 'datePicker') {
                                //日期选择
                                td.field = property.field

                                attribute.dateType = property.dateType ? property.dateType.split('|')[0] : 'date'
                                attribute.valueFormat = property.dateType
                                    ? property.dateType.split('|')[1]
                                    : 'yyyy-MM-dd'
                                attribute.placeholder = property.placeholder
                                attribute.required = property.required
                                attribute.disabled = property.disabled
                                if (property.disabled) {
                                    this.disabled.push(property.field)
                                }
                                // 验证规则
                                let rules = []
                                if (property.required) {
                                    rules.push({ required: true, message: property.placeholder })
                                }
                                attribute.rules = rules
                                if (this.formModel[td.field]) {
                                    attribute.value = this.utils.formatter(
                                        'date',
                                        new Date(this.formModel[td.field]),
                                        attribute.valueFormat
                                    )
                                } else {
                                    if (property.isCurrent) {
                                        attribute.value = this.utils.formatter(
                                            'date',
                                            new Date(),
                                            attribute.valueFormat
                                        )
                                    } else {
                                        if (property.defaultValue) {
                                            attribute.value = property.defaultValue.toString()
                                        }
                                    }
                                }
                            } else if (td.type === 'upload') {
                                td.field = property.field

                                attribute.placeholder = property.placeholder
                                attribute.required = property.required
                                attribute.accept = property.accept
                                attribute.minValue = property.minValue
                                attribute.maxValue = property.maxValue
                                attribute.disabled = property.disabled
                                if (property.disabled) {
                                    this.disabled.push(property.field)
                                }
                                // 验证规则
                                let rules = []
                                if (property.required) {
                                    rules.push({ required: true, message: property.placeholder })
                                }
                                attribute.rules = rules
                                if (this.formModel[td.field]) {
                                    attribute.value = JSON.parse(this.formModel[td.field])
                                } else {
                                    attribute.value = []
                                }
                            } else if (td.type === 'business') {
                                //业务组件
                                td.field = property.field

                                attribute.required = property.required
                                attribute.placeholder = property.placeholder
                                attribute.source = property.source
                                attribute.showField = property.showField
                                attribute.disabled = property.disabled
                                if (property.disabled) {
                                    this.disabled.push(property.field)
                                }
                                // 验证规则
                                let rules = []
                                if (property.required) {
                                    rules.push({ required: true, message: property.placeholder })
                                }
                                attribute.rules = rules
                                if (this.formModel[td.field]) {
                                    attribute.value = String(this.formModel[td.field])
                                    this.queryBusinessData(property.field, attribute)
                                }
                            } else if (td.type === 'editor') {
                                td.field = property.field

                                attribute.required = property.required
                                attribute.placeholder = property.placeholder
                                attribute.disabled = property.disabled
                                if (property.disabled) {
                                    this.disabled.push(property.field)
                                }
                                // 验证规则
                                let rules = []
                                if (property.required) {
                                    rules.push({ required: true, message: property.placeholder })
                                }
                                attribute.rules = rules
                                if (this.formModel[td.field]) {
                                    attribute.value = JSON.parse(this.formModel[td.field])
                                } else {
                                    attribute.value = {}
                                }
                            } else if (td.type === 'bill') {
                                //单据组件
                                td.field = property.field

                                attribute.placeholder = property.placeholder
                                attribute.required = property.required
                                attribute.disabled = property.disabled
                                if (property.disabled) {
                                    this.disabled.push(property.field)
                                }
                                // 验证规则
                                let rules = []
                                if (property.required) {
                                    rules.push({ required: true, message: property.placeholder })
                                }
                                attribute.rules = rules
                                if (!this.formModel[td.field]) {
                                    this.queryBill(property.field, property.serial)
                                } else {
                                    attribute.value = this.formModel[td.field]
                                }
                            } else if (td.type === 'picture') {
                                //图片上传
                                td.field = property.field

                                attribute.placeholder = property.placeholder
                                attribute.required = property.required
                                attribute.multiple = property.multiple
                                attribute.minValue = property.minValue
                                attribute.maxValue = property.maxValue
                                attribute.accept = property.accept
                                attribute.disabled = property.disabled
                                if (property.disabled) {
                                    this.disabled.push(property.field)
                                }
                                // 验证规则
                                let rules = []
                                if (property.required) {
                                    rules.push({ required: true, message: property.placeholder })
                                }
                                attribute.rules = rules
                                if (this.formModel[td.field]) {
                                    attribute.value = JSON.parse(this.formModel[td.field])
                                } else {
                                    attribute.value = []
                                }
                            } else if (td.type === 'department') {
                                //部门组件
                                td.field = property.field

                                attribute.required = property.required
                                attribute.placeholder = property.placeholder
                                attribute.multiple = property.multiple
                                attribute.disabled = property.disabled
                                if (property.disabled) {
                                    this.disabled.push(property.field)
                                }
                                // 验证规则
                                let rules = []
                                if (property.required) {
                                    rules.push({ required: true, message: property.placeholder })
                                }
                                attribute.rules = rules
                                if (this.formModel[td.field]) {
                                    if (property.multiple) {
                                        attribute.value = String(this.formModel[td.field]).split(',')
                                    } else {
                                        attribute.value = String(this.formModel[td.field])
                                    }
                                } else {
                                    if (property.multiple) {
                                        if (property.defaultValue) {
                                            attribute.value = [String(localStorage.getItem('departmentId'))]
                                        } else {
                                            attribute.value = []
                                        }
                                    } else {
                                        if (property.defaultValue) {
                                            attribute.value = String(localStorage.getItem('departmentId'))
                                        }
                                    }
                                }
                                this.queryDynamic(td.field, td.type)
                            } else if (td.type === 'member') {
                                //成员组件
                                td.field = property.field

                                attribute.required = property.required
                                attribute.placeholder = property.placeholder
                                attribute.multiple = property.multiple
                                attribute.disabled = property.disabled
                                if (property.disabled) {
                                    this.disabled.push(property.field)
                                }
                                // 验证规则
                                let rules = []
                                if (property.required) {
                                    rules.push({ required: true, message: property.placeholder })
                                }
                                attribute.rules = rules
                                if (this.formModel[td.field]) {
                                    if (property.multiple) {
                                        attribute.value = String(this.formModel[td.field]).split(',')
                                    } else {
                                        attribute.value = String(this.formModel[td.field])
                                    }
                                } else {
                                    if (property.multiple) {
                                        if (property.defaultValue) {
                                            attribute.value = [String(localStorage.getItem('userId'))]
                                        } else {
                                            attribute.value = []
                                        }
                                    } else {
                                        if (property.defaultValue) {
                                            attribute.value = String(localStorage.getItem('userId'))
                                        }
                                    }
                                }
                                this.queryDynamic(td.field, td.type)
                            } else if (td.type === 'company') {
                                //公司组件
                                td.field = property.field

                                attribute.required = property.required
                                attribute.placeholder = property.placeholder
                                attribute.multiple = property.multiple
                                attribute.disabled = property.disabled
                                if (property.disabled) {
                                    this.disabled.push(property.field)
                                }
                                // 验证规则
                                let rules = []
                                if (property.required) {
                                    rules.push({ required: true, message: property.placeholder })
                                }
                                attribute.rules = rules
                                if (this.formModel[td.field]) {
                                    if (property.multiple) {
                                        attribute.value = String(this.formModel[td.field]).split(',')
                                    } else {
                                        attribute.value = String(this.formModel[td.field])
                                    }
                                } else {
                                    if (property.multiple) {
                                        if (property.current) {
                                            attribute.value = [String(localStorage.getItem('companyId'))]
                                        } else {
                                            attribute.value = []
                                        }
                                    } else {
                                        if (property.defaultValue) {
                                            attribute.value = String(localStorage.getItem('companyId'))
                                        }
                                    }
                                }
                                this.queryDynamic(td.field, td.type)
                            } else if (td.type === 'custom') {
                                // 自定义组件
                                td.name = property.name
                                try {
                                    td.component = require(`@/views/templates/${this.mark}/${td.name}`).default
                                } catch (error) {}
                            }
                            if (td.field) {
                                attribute.behavior = this.behavior
                                //可编辑、禁用、隐藏处理
                                // 优先级 可编辑==>>禁用==>>隐藏 READONLY
                                //可编辑
                                let indexEditable = this.editable.includes(td.field)
                                if (indexEditable) {
                                    attribute.behavior = 'NORMAL'
                                }
                                //禁用
                                let indexDisabled = this.disabled.includes(td.field)
                                if (indexDisabled) {
                                    attribute.behavior = 'DISABLED'
                                }
                                //隐藏
                                let indexHidden = this.hidden.includes(td.field)
                                if (indexHidden) {
                                    attribute.behavior = 'HIDDEN'
                                }
                                this.$set(this.state, td.field, attribute)
                            }
                        } else {
                            // 纯文本
                            td.text = cell.text || '&nbsp;'
                            td.text = td.text.replace('*', '<span style="color:#f56c6c;">*</span>')
                        }
                        td = this.utils.getStyles(cell, td, styles)

                        if (td.field) {
                            td.style['text-align'] = 'left'
                            if (attribute.behavior === 'DISABLED') {
                                td.style['background-color'] = '#f5f7fa'
                            } else {
                                td.style['background-color'] = '#fff'
                            }
                        }
                        tr.push(td)
                    }
                }
                this.tableData.push(tr)
            }
        },
        handleEvent(event, field, value) {
            if (this.jsApi.methods.hasOwnProperty('modelEvent')) {
                this.modelEvent(event, field, value)
            }
        },
        //附件文件单位格式化
        formatBytes(bytes) {
            return this.utils.formatBytes(bytes.size)
        },
        // 文件上传之前
        beforeFileUpload(file, td) {
            const suffix = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase()
            if (td.minValue) {
                if (file.size / (1024 * 1024) < td.minValue) {
                    this.$message.error('文档大小至少' + td.minValue + 'MB')
                    return false
                }
            }
            if (td.maxValue) {
                if (file.size / (1024 * 1024) > td.maxValue) {
                    this.$message.error('文档大小不能超过' + td.maxValue + 'MB')
                    return false
                }
            }
            if (td.accept && td.accept.length > 0) {
                if (!td.accept.includes(suffix)) {
                    this.$message.error('该文件类型不支持上传，请联系管理员进行配置！')
                    return false
                }
            }
            return true
        },
        // 文件上传成功
        handleFileSuccess(res, file, fileList, td) {
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
                this.state[td.field].value = JSON.parse(JSON.stringify(fileArray))
            } else {
                let fileList = this.$refs[td.field][0].uploadFiles
                let index = fileList.findIndex(fileItem => {
                    return fileItem.url === file.url
                })
                fileList.splice(index, 1)
                this.$message.error(res.message)
            }
        },
        // 文件删除
        handleFileRemove(index, field) {
            this.state[field].value.splice(index, 1)
        },
        // 文件预览
        handleFilePreview(file, field) {
            if (file.type === 'image') {
                let previewSrcList = this.state[field].value.map(item => item.url)
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
        visibleChange(field, attribute) {
            this.$refs[field][0].blur()
            let parameter = {}
            if (this.jsApi.methods.hasOwnProperty('businessParameter')) {
                parameter = this.businessParameter()
            }
            this.$refs.excelBusiness.showDialog(field, attribute, parameter)
        },
        //业务应用弹窗
        handleBusinessDialog(field, attribute) {
            let parameter = {}
            if (this.jsApi.methods.hasOwnProperty('businessParameter')) {
                parameter = this.businessParameter()
            }
            this.$refs.excelBusiness.showDialog(field, attribute, parameter)
        },
        //业务应用确认处理
        businessConfirm(field, value, attribute) {
            if (field.includes('.')) {
            } else {
                this.handleEvent('change', field, value)
                this.$set(this.state[field], 'value', String(value.id))
                this.queryBusinessData(field, attribute)
            }
        },
        //部门组件弹窗
        handleDeptDynamicDialog(field, multiple) {
            if (multiple) {
                this.$refs.excelMultipleDept.showDialog(field, this.state[field].value)
            } else {
                this.$refs.excelDept.showDialog(field)
            }
        },
        //部门组件确定处理
        deptConfirm(field, value) {
            this.handleEvent('change', field, value)
            this.$set(this.state[field], 'value', value)
        },
        //单位组件弹窗
        handleCompanyDynamicDialog(field, multiple) {
            if (multiple) {
                this.$refs.excelMultipleCompany.showDialog(field, this.state[field].value)
            }
        },
        //单位组件确定处理
        companyConfirm(field, value) {
            this.$set(this.state[field], 'value', value)
        },
        //成员组件弹窗
        handleMemberDynamicDialog(field, multiple) {
            if (multiple) {
                this.$refs.excelMultipleMember.showDialog(field, this.state[field].value, this.state[field].dataSource)
            } else {
                this.$refs.excelMember.showDialog(field)
            }
        },
        //成员组件确定处理
        memberConfirm(field, value) {
            this.handleEvent('change', field, value)
            this.$set(this.state[field], 'value', value)
        },
        //表单验证
        validate() {
            for (let key in this.state) {
                let attribute = this.state[key]
                let type = attribute.type
                let multiple = attribute.multiple
                let value = attribute.value
                for (let i = 0; i < attribute.rules.length; i++) {
                    let rule = attribute.rules[i]
                    if (rule.required) {
                        if (
                            type === 'text' ||
                            type === 'number' ||
                            type === 'radio' ||
                            type === 'datePicker' ||
                            type === 'bill' ||
                            type === 'business' ||
                            type === 'cascader'
                        ) {
                            if (value == null || value === '') {
                                this.$message.error(rule.message)
                                return false
                            }
                        } else if (type === 'checkbox') {
                            if (value.length === 0) {
                                this.$message.error(rule.message)
                                return false
                            }
                        } else if (
                            type === 'select' ||
                            type === 'department' ||
                            type === 'member' ||
                            type === 'company'
                        ) {
                            if (multiple) {
                                if (value.length === 0) {
                                    this.$message.error(rule.message)
                                    return false
                                }
                            } else {
                                if (value == null || value === '') {
                                    this.$message.error(rule.message)
                                    return false
                                }
                            }
                        } else if (type === 'picture' || type === 'upload' || type === 'area') {
                            if (value.length === 0) {
                                this.$message.error(rule.message)
                                return false
                            }
                        } else if (type === 'editor') {
                            var editor = JSON.stringify(value)
                            if (editor == '{}') {
                                this.$message.error(rule.message)
                                return false
                            }
                        }
                    }
                }
            }
            return true
        },
        setState(field, value) {
            this.$set(this.state[field], 'value', value)
        },
        setStates(formModel) {
            let state = this.state
            for (let key in state) {
                if (formModel[key]) {
                    let attribute = state[key]
                    if (attribute.type === 'picture' || attribute.type === 'upload') {
                        state[key].value = JSON.parse(formModel[key])
                    } else if (attribute.type === 'business') {
                        attribute.value = String(formModel[key])
                        this.queryBusinessData(key, attribute)
                    } else {
                        state[key].value = String(formModel[key])
                    }
                }
            }
            this.state = state
        }
    }
}
</script>

<style scoped>
.container {
    background: #fff;
    margin-right: 10px;
}

.content {
    width: 100%;
    border-collapse: collapse;
}

.tbody {
    font-size: 12px;
}

::v-deep .el-upload-dragger {
    width: 146px;
    height: 146px;
    border: none;
}
::v-deep .el-textarea__inner {
    border: none;
}

::v-deep .el-input__inner {
    border: none;
    border-radius: 0px;
}

::v-deep .el-date-editor.el-input {
    width: 100%;
}

::v-deep .el-date-editor--daterange.el-input__inner {
    width: 100%;
}
::v-deep .el-table__header tr {
    height: 36px;
}

::v-deep .el-table thead th {
    font-size: 13px;
    background: #fafafa !important;
    color: #333;
}

::v-deep .el-table__row {
    font-size: 13px;
    height: 36px;
}

::v-deep .el-table td {
    padding: 0px 0 !important;
}

::v-deep .el-table .cell {
    padding: 0px !important;
}

::v-deep .el-table--border td:first-child .cell {
    padding: 0px;
}

.inside-input {
    position: relative;
}

.inside-input .iconE {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    cursor: pointer;
    color: #c0c4cc;
    font-size: 14px;
}

::v-deep .inside-input .el-input--suffix .el-input__inner {
    padding-right: 48px;
}

::v-deep .inside-input .el-select .el-input__suffix .el-icon-arrow-up {
    display: none;
}

::v-deep .inside-input .el-select .el-input__suffix .el-icon-circle-close {
    position: absolute;
    top: 55%;
    right: 18px;
    transform: translateY(-50%);
    color: #c0c4cc;
    font-size: 14px;
}

.tableAdd {
    top: 30px;
    left: -20px;
    font-size: 18px;
    margin-right: 4px;
}

.tableDel {
    top: 30px;
    right: -20px;
    font-size: 18px;
    color: red;
    margin-left: 4px;
}

::v-deep .input .el-input__inner {
    height: 100%;
}

::v-deep .el-input.is-disabled .el-input__inner {
    background-color: #f5f7fa;
    border-color: #e4e7ed;
    color: #000;
}

::v-deep .el-textarea.is-disabled .el-textarea__inner {
    background-color: #f5f7fa;
    border-color: #e4e7ed;
    color: #000;
}

::v-deep .el-switch.is-disabled {
    opacity: 0.8;
}

::v-deep .el-radio__input.is-disabled + span.el-radio__label {
    color: #333;
}

::v-deep .el-radio__label {
    font-size: 13px;
}

::v-deep .el-table {
    width: 100%;
}

::v-deep .el-table__header-wrapper table {
    width: 100% !important;
}

::v-deep .el-table__body-wrapper table {
    width: 100% !important;
}

::v-deep .el-table__body {
    table-layout: auto;
}

::v-deep .el-table__footer {
    table-layout: auto;
    height: 36px;
}

::v-deep .el-table__header {
    table-layout: auto;
}

::v-deep .el-table--border {
    border-top: 0px !important;
    border-bottom: 0px !important;
}

::v-deep .el-tag {
    margin-right: 10px;
    margin-top: 10px;
}

::v-deep .el-input-number .el-input__inner {
    text-align: left;
}

::v-deep .el-upload-list--picture-card .el-upload-list__item {
    margin-bottom: 0px;
}

::v-deep .upload-disabled .el-upload--picture-card {
    display: none;
}

.el-textarea ::-webkit-input-placeholder {
    color: #c0c4cc;
    font-family: auto;
}

.el-textarea ::-ms-input-placeholder {
    color: #c0c4cc;
    font-family: auto;
}

.el-textarea ::-moz-input-placeholder {
    color: #c0c4cc;
    font-family: auto;
}

.el-textarea :-moz-input-placeholder {
    color: #c0c4cc;
    font-family: auto;
}
</style>
