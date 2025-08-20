<template>
    <grid-layout
        :layout.sync="layout"
        :col-num="24"
        :row-height="6"
        :is-draggable="false"
        :is-resizable="false"
        :is-mirrored="false"
        :responsive="false"
        :vertical-compact="false"
        :margin="[12, 0]"
        :use-css-transforms="true"
    >
        <grid-item
            v-for="(item, index) in layout"
            :x="item.x"
            :y="item.y"
            :w="item.w"
            :h="item.h"
            :i="item.i"
            :maxH="item.maxH"
            :key="index"
        >
            <!-- container -->
            <div
                :id="item.i"
                v-if="item.type === 'container'"
                :style="[
                    {
                        height: '100%'
                    },
                    customStyles(item.styles)
                ]"
            >
                <gauge-show-component v-if="item.children" :layout="item.children" @handleEvent="handleEvent" />
            </div>
            <!-- listView -->
            <div
                :id="item.i"
                v-if="item.type === 'listView'"
                :style="[
                    {
                        height: '100%'
                    },
                    customStyles(item.styles)
                ]"
            >
                <gauge-show-component v-if="item.children" :layout="item.children" @handleEvent="handleEvent" />
            </div>
            <!-- card -->
            <div :id="item.i" v-else-if="item.type === 'card'" style="height: 100%">
                <el-card
                    :style="[
                        {
                            height: '100%'
                        },
                        customStyles(item.styles)
                    ]"
                >
                    <div slot="header">
                        <span>{{ item.title }}</span>
                    </div>
                    <gauge-show-component v-if="item.children" :layout="item.children" @handleEvent="handleEvent" />
                </el-card>
            </div>
            <!-- text -->
            <div
                :id="item.i"
                v-else-if="item.type === 'text'"
                :style="[
                    {
                        display: 'flex',
                        height: '100%',
                        overflow: 'auto'
                    },
                    customStyles(item.styles)
                ]"
            >
                {{ item.text }}
            </div>
            <!-- image -->
            <div :id="item.i" v-else-if="item.type === 'image'" style="height: 100%">
                <el-image
                    :src="item.src"
                    :fit="item.fit"
                    :style="[{ width: '100%', height: '100%' }, customStyles(item.styles)]"
                    @click="handleEvent('click', item)"
                ></el-image>
            </div>
            <!-- tabs -->
            <div :id="item.i" v-else-if="item.type === 'tabs'" style="height: 100%">
                <el-tabs
                    type="border-card"
                    :style="[{ height: '100%' }, customStyles(item.styles)]"
                    v-model="item.selectedTab"
                >
                    <el-tab-pane v-for="(tab, index) in item.tabs" :key="index" :label="tab.name" :name="tab.name">
                        <div :style="{ height: item.h * 6 - 39 + 'px' }">
                            <gauge-show-component :layout="tab.children" @handleEvent="handleEvent" />
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
            <!-- chart -->
            <div
                v-else-if="item.type === 'chart'"
                :style="[
                    {
                        height: '100%',
                        'padding-top': '15px',
                        'box-sizing': 'border-box'
                    },
                    customStyles(item.styles)
                ]"
            >
                <div :id="item.i" style="height: 100%" v-if="item.data && item.hasData"></div>
                <el-empty
                    :image-size="200"
                    style="height: 100%; background: #fff; color: #5e6d82"
                    description="暂无数据"
                    v-if="item.data && !item.hasData"
                ></el-empty>
            </div>
            <!-- 按钮 -->
            <div
                v-else-if="item.type === 'button'"
                :style="[
                    {
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        'justify-content': 'center',
                        'align-items': 'center'
                    },
                    customStyles(item.styles)
                ]"
                @click="handleEvent('click', item)"
            >
                {{ item.text }}
            </div>
            <!-- 链接 -->
            <div
                v-else-if="item.type === 'link'"
                :style="[customStyles(item.styles)]"
                @click="handleEvent('click', item)"
            >
                {{ item.text }}
            </div>
            <!-- 输入框 -->
            <div
                v-else-if="item.type === 'input'"
                :class="[
                    'el-form-item',
                    item.labelPosition === 'top'
                        ? 'el-form--label-top'
                        : item.labelPosition === 'right'
                        ? 'el-form--label-right'
                        : 'el-form--label-left',
                    item.required ? 'is-required' : ''
                ]"
            >
                <label
                    class="el-form-item__label"
                    :style="{
                        width: item.labelPosition === 'top' ? '' : item.labelWidth,
                        'line-height': item.labelPosition === 'top' ? '26px' : '40px'
                    }"
                    >{{ item.label }}</label
                >
                <div
                    class="el-form-item__content"
                    :style="{ 'margin-left': item.labelPosition === 'top' ? '' : item.labelWidth }"
                >
                    <el-input
                        :type="item.dataType"
                        size="medium"
                        v-model="item.value"
                        :placeholder="item.placeholder"
                        :show-password="item.dataType === 'password'"
                        clearable
                        resize="none"
                        :rows="5"
                    ></el-input>
                </div>
            </div>
            <!-- 单选选择器 -->
            <div
                v-else-if="item.type === 'select'"
                :class="[
                    'el-form-item',
                    item.labelPosition === 'top'
                        ? 'el-form--label-top'
                        : item.labelPosition === 'right'
                        ? 'el-form--label-right'
                        : 'el-form--label-left',
                    item.required ? 'is-required' : ''
                ]"
            >
                <label
                    class="el-form-item__label"
                    :style="{
                        width: item.labelPosition === 'top' ? '' : item.labelWidth,
                        'line-height': item.labelPosition === 'top' ? '26px' : '40px'
                    }"
                    >{{ item.label }}</label
                >
                <div
                    class="el-form-item__content"
                    :style="{ 'margin-left': item.labelPosition === 'top' ? '' : item.labelWidth }"
                >
                    <el-select
                        size="medium"
                        v-model="item.value"
                        :placeholder="item.placeholder"
                        @change="handleEvent('change', item)"
                        filterable
                        clearable
                    >
                        <el-option
                            v-for="option in item.data"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                        >
                        </el-option>
                    </el-select>
                </div>
            </div>
            <!-- 多选选择器 -->
            <div
                v-else-if="item.type === 'multiSelect'"
                :class="[
                    'el-form-item',
                    item.labelPosition === 'top'
                        ? 'el-form--label-top'
                        : item.labelPosition === 'right'
                        ? 'el-form--label-right'
                        : 'el-form--label-left',
                    item.required ? 'is-required' : ''
                ]"
            >
                <label
                    class="el-form-item__label"
                    :style="{
                        width: item.labelPosition === 'top' ? '' : item.labelWidth,
                        'line-height': item.labelPosition === 'top' ? '26px' : '40px'
                    }"
                    >{{ item.label }}</label
                >
                <div
                    class="el-form-item__content"
                    :style="{ 'margin-left': item.labelPosition === 'top' ? '' : item.labelWidth }"
                >
                    <el-select
                        size="medium"
                        v-model="item.value"
                        :placeholder="item.placeholder"
                        @change="handleEvent('change', item)"
                        multiple
                        filterable
                        clearable
                    >
                        <el-option
                            v-for="option in item.data"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                        >
                        </el-option>
                    </el-select>
                </div>
            </div>
            <!-- 日期选择器 -->
            <div
                v-else-if="item.type === 'datePicker'"
                :class="[
                    'el-form-item',
                    item.labelPosition === 'top'
                        ? 'el-form--label-top'
                        : item.labelPosition === 'right'
                        ? 'el-form--label-right'
                        : 'el-form--label-left',
                    item.required ? 'is-required' : ''
                ]"
            >
                <label
                    class="el-form-item__label"
                    :style="{
                        width: item.labelPosition === 'top' ? '' : item.labelWidth,
                        'line-height': item.labelPosition === 'top' ? '26px' : '40px'
                    }"
                    >{{ item.label }}</label
                >
                <div
                    class="el-form-item__content"
                    :style="{ 'margin-left': item.labelPosition === 'top' ? '' : item.labelWidth }"
                >
                    <el-date-picker
                        :type="item.dateFormat"
                        :value-format="item.valueFormat"
                        size="medium"
                        align="center"
                        v-model="item.value"
                        :placeholder="item.placeholder"
                        @change="handleEvent('change', item)"
                    ></el-date-picker>
                </div>
            </div>
            <!-- 时间选择器 -->
            <div
                v-else-if="item.type === 'timePicker'"
                :class="[
                    'el-form-item',
                    item.labelPosition === 'top'
                        ? 'el-form--label-top'
                        : item.labelPosition === 'right'
                        ? 'el-form--label-right'
                        : 'el-form--label-left',
                    item.required ? 'is-required' : ''
                ]"
            >
                <label
                    class="el-form-item__label"
                    :style="{
                        width: item.labelPosition === 'top' ? '' : item.labelWidth,
                        'line-height': item.labelPosition === 'top' ? '26px' : '40px'
                    }"
                    >{{ item.label }}</label
                >
                <div
                    class="el-form-item__content"
                    :style="{ 'margin-left': item.labelPosition === 'top' ? '' : item.labelWidth }"
                >
                    <el-time-picker
                        size="medium"
                        align="center"
                        v-model="item.value"
                        :placeholder="item.placeholder"
                        @change="handleEvent('change', item)"
                    ></el-time-picker>
                </div>
            </div>
            <!-- 单选级联选择器 -->
            <div
                v-else-if="item.type === 'cascader'"
                :class="[
                    'el-form-item',
                    item.labelPosition === 'top'
                        ? 'el-form--label-top'
                        : item.labelPosition === 'right'
                        ? 'el-form--label-right'
                        : 'el-form--label-left',
                    item.required ? 'is-required' : ''
                ]"
            >
                <label
                    class="el-form-item__label"
                    :style="{
                        width: item.labelPosition === 'top' ? '' : item.labelWidth,
                        'line-height': item.labelPosition === 'top' ? '26px' : '40px'
                    }"
                    >{{ item.label }}</label
                >
                <div
                    class="el-form-item__content"
                    :style="{ 'margin-left': item.labelPosition === 'top' ? '' : item.labelWidth }"
                >
                    <el-cascader
                        size="medium"
                        v-model="item.value"
                        :options="item.data"
                        :props="{ checkStrictly: true, emitPath: false }"
                        :placeholder="item.placeholder"
                        @change="handleEvent('change', item)"
                        filterable
                        clearable
                    ></el-cascader>
                </div>
            </div>
            <!-- 多选级联选择器 -->
            <div
                v-else-if="item.type === 'multiCascader'"
                :class="[
                    'el-form-item',
                    item.labelPosition === 'top'
                        ? 'el-form--label-top'
                        : item.labelPosition === 'right'
                        ? 'el-form--label-right'
                        : 'el-form--label-left',
                    item.required ? 'is-required' : ''
                ]"
            >
                <label
                    class="el-form-item__label"
                    :style="{
                        width: item.labelPosition === 'top' ? '' : item.labelWidth,
                        'line-height': item.labelPosition === 'top' ? '26px' : '40px'
                    }"
                    >{{ item.label }}</label
                >
                <div
                    class="el-form-item__content"
                    :style="{ 'margin-left': item.labelPosition === 'top' ? '' : item.labelWidth }"
                >
                    <el-cascader
                        size="medium"
                        v-model="item.value"
                        :options="item.data"
                        :props="{ multiple: true }"
                        :placeholder="item.placeholder"
                        @change="handleEvent('change', item)"
                        collapse-tags
                        filterable
                        clearable
                    ></el-cascader>
                </div>
            </div>
            <!-- 单选器 -->
            <div
                v-else-if="item.type === 'radio'"
                :class="[
                    'el-form-item',
                    item.labelPosition === 'top'
                        ? 'el-form--label-top'
                        : item.labelPosition === 'right'
                        ? 'el-form--label-right'
                        : 'el-form--label-left',
                    item.required ? 'is-required' : ''
                ]"
            >
                <label
                    class="el-form-item__label"
                    :style="{
                        width: item.labelPosition === 'top' ? '' : item.labelWidth,
                        'line-height': item.labelPosition === 'top' ? '26px' : '40px'
                    }"
                    >{{ item.label }}</label
                >
                <div
                    class="el-form-item__content"
                    :style="{ 'margin-left': item.labelPosition === 'top' ? '' : item.labelWidth }"
                >
                    <el-radio-group v-model="item.value" @change="handleEvent('change', item)">
                        <el-radio v-for="option in item.data" :key="option.value" :label="option.value">
                            {{ option.label }}
                        </el-radio>
                    </el-radio-group>
                </div>
            </div>
            <!-- 多选器 -->
            <div
                v-else-if="item.type === 'checkbox'"
                :class="[
                    'el-form-item',
                    item.labelPosition === 'top'
                        ? 'el-form--label-top'
                        : item.labelPosition === 'right'
                        ? 'el-form--label-right'
                        : 'el-form--label-left',
                    item.required ? 'is-required' : ''
                ]"
            >
                <label
                    class="el-form-item__label"
                    :style="{
                        width: item.labelPosition === 'top' ? '' : item.labelWidth,
                        'line-height': item.labelPosition === 'top' ? '26px' : '40px'
                    }"
                    >{{ item.label }}</label
                >
                <div
                    class="el-form-item__content"
                    :style="{ 'margin-left': item.labelPosition === 'top' ? '' : item.labelWidth }"
                >
                    <el-checkbox-group v-model="item.value" @change="handleEvent('change', item)">
                        <el-checkbox v-for="option in item.data" :key="option.value" :label="option.value">
                            {{ option.label }}
                        </el-checkbox>
                    </el-checkbox-group>
                </div>
            </div>
            <!-- 开关  -->
            <div
                v-else-if="item.type === 'switch'"
                :class="[
                    'el-form-item',
                    item.labelPosition === 'top'
                        ? 'el-form--label-top'
                        : item.labelPosition === 'right'
                        ? 'el-form--label-right'
                        : 'el-form--label-left',
                    item.required ? 'is-required' : ''
                ]"
            >
                <label
                    class="el-form-item__label"
                    :style="{
                        width: item.labelPosition === 'top' ? '' : item.labelWidth,
                        'line-height': item.labelPosition === 'top' ? '26px' : '40px'
                    }"
                    >{{ item.label }}</label
                >
                <div
                    class="el-form-item__content"
                    :style="{
                        'margin-left': item.labelPosition === 'top' ? '' : item.labelWidth,
                        'line-height': '32px'
                    }"
                >
                    <el-switch
                        v-model="item.value"
                        :inactive-value="item.inactiveValue"
                        :active-value="item.activeValue"
                        @change="handleEvent('change', item)"
                    ></el-switch>
                </div>
            </div>
            <!-- 评分  -->
            <div
                v-else-if="item.type === 'rate'"
                :class="[
                    'el-form-item',
                    item.labelPosition === 'top'
                        ? 'el-form--label-top'
                        : item.labelPosition === 'right'
                        ? 'el-form--label-right'
                        : 'el-form--label-left',
                    item.required ? 'is-required' : ''
                ]"
            >
                <label
                    class="el-form-item__label"
                    :style="{
                        width: item.labelPosition === 'top' ? '' : item.labelWidth,
                        'line-height': item.labelPosition === 'top' ? '26px' : '40px'
                    }"
                    >{{ item.label }}</label
                >
                <div
                    class="el-form-item__content"
                    :style="{
                        'margin-left': item.labelPosition === 'top' ? '' : item.labelWidth,
                        'line-height': '32px',
                        'margin-top': '10px'
                    }"
                >
                    <el-rate v-model="item.value" @change="handleEvent('change', item)"></el-rate>
                </div>
            </div>
            <!-- 滑块  -->
            <div
                v-else-if="item.type === 'slider'"
                :class="[
                    'el-form-item',
                    item.labelPosition === 'top'
                        ? 'el-form--label-top'
                        : item.labelPosition === 'right'
                        ? 'el-form--label-right'
                        : 'el-form--label-left',
                    item.i === currentIndex ? 'grid-item-checked' : 'grid-item-unchecked',
                    item.required ? 'is-required' : ''
                ]"
            >
                <label
                    class="el-form-item__label"
                    :style="{
                        width: item.labelPosition === 'top' ? '' : item.labelWidth,
                        'line-height': item.labelPosition === 'top' ? '26px' : '40px'
                    }"
                    >{{ item.label }}</label
                >
                <div
                    class="el-form-item__content"
                    :style="{ 'margin-left': item.labelPosition === 'top' ? '' : item.labelWidth }"
                >
                    <el-slider v-model="item.value" @change="handleEvent('change', item)"></el-slider>
                </div>
            </div>
            <!-- 进度条  -->
            <div v-else-if="item.type === 'progress'" :class="[]">
                <el-progress :text-inside="true" :stroke-width="24" :percentage="item.value"></el-progress>
            </div>
            <!-- 分割线  -->
            <div v-else-if="item.type === 'divider'" :class="[]">
                <el-divider :direction="item.direction"></el-divider>
            </div>
            <!-- 文件上传 -->
            <div
                v-else-if="item.type === 'upload'"
                :class="[
                    'el-form-item',
                    item.labelPosition === 'top'
                        ? 'el-form--label-top'
                        : item.labelPosition === 'right'
                        ? 'el-form--label-right'
                        : 'el-form--label-left',
                    item.required ? 'is-required' : ''
                ]"
            >
                <label
                    class="el-form-item__label"
                    :style="{
                        width: item.labelPosition === 'top' ? '' : item.labelWidth,
                        'line-height': item.labelPosition === 'top' ? '26px' : '40px'
                    }"
                    >{{ item.label }}</label
                >
                <div
                    class="el-form-item__content"
                    :style="{ 'margin-left': item.labelPosition === 'top' ? '' : item.labelWidth }"
                >
                    <el-upload
                        :ref="item.i"
                        :action="action"
                        :headers="headers"
                        multiple
                        :show-file-list="false"
                        :file-list="item.value"
                        :before-upload="
                            file => {
                                return beforeFileUpload(file, item)
                            }
                        "
                        :on-success="
                            (res, file, fileList) => {
                                return handleFileSuccess(res, file, fileList, item)
                            }
                        "
                    >
                        <el-button size="medium" icon="el-icon-upload2" plain round type="primary"> 上传</el-button>
                    </el-upload>
                    <el-table :data="item.value" :height="item.h * 6 - 60" border stripe style="margin-top: 10px">
                        <el-table-column type="index" label="#" width="50" align="center"></el-table-column>
                        <el-table-column prop="name" label="文件名" align="center"></el-table-column>
                        <el-table-column
                            prop="size"
                            label="大小"
                            align="center"
                            :formatter="formatBytes"
                        ></el-table-column>
                        <el-table-column label="操作" align="center">
                            <template slot-scope="scope">
                                <i
                                    class="el-icon-download"
                                    style="font-size: 16px; margin-left: 10px; margin-right: 10px"
                                    @click="handleFileDownload(scope.row)"
                                ></i>
                                <i
                                    class="el-icon-delete"
                                    style="font-size: 16px"
                                    @click="handleFileRemove(scope.row, item)"
                                ></i>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
            <!-- 富文本 -->
            <div v-else-if="item.type === 'richText'">
                <editor
                    :ref="item.i"
                    :id="item.i + Date.now()"
                    v-model="item.value"
                    :placeholder="item.placeholder"
                    :height="item.h * 6 - 56 + 'px'"
                >
                </editor>
            </div>
            <!-- 表格 -->
            <div v-else-if="item.type === 'table'">
                <el-table
                    stripe
                    border
                    :data="item.data"
                    style="width: 100%"
                    :height="item.showPagination ? item.h * 6 - 86 : item.h * 6 - 26"
                    :show-header="item.showHeader"
                    @row-dblclick="(row, column, event) => handleEvent('rowDblclick', item, row)"
                >
                    >
                    <el-table-column
                        type="selection"
                        width="50"
                        align="center"
                        v-if="item.allowMultiRowSelect"
                    ></el-table-column>
                    <custom-table-column v-for="(column, index) in item.columns" :key="index" :column="column" />
                </el-table>
                <!--分页-->
                <div class="pagination" v-if="item.showPagination">
                    <el-pagination
                        background
                        layout="total, prev, pager, next"
                        :current-page.sync="item.pageNo"
                        :total="item.total"
                        @current-change="handleEvent('pageChange', item)"
                    >
                    </el-pagination>
                </div>
            </div>
            <!-- 对话框 -->
            <div v-else-if="item.type === 'modal'">
                <el-dialog :title="item.title" :width="item.width" :visible.sync="item.isVisible" append-to-body>
                    <span>这是一段信息</span>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="item.isVisible = false">取 消</el-button>
                        <el-button type="primary" @click="item.isVisible = false">确 定</el-button>
                    </span>
                </el-dialog>
            </div>
            <!-- 签名 -->
            <div
                v-else-if="item.type === 'signature'"
                :style="[
                    {
                        padding: '4px',
                        'box-sizing': 'border-box'
                    },
                    customStyles(item.styles)
                ]"
                @click="handleEvent('click', item)"
            >
                <canvas :id="item.i" :height="item.h * 6 - 24"></canvas>
            </div>
            <!-- 树 -->
            <div v-else-if="item.type === 'tree'">
                <el-tree :data="item.data" style="height: 100%; overflow: auto"></el-tree>
            </div>
            <!-- 自定义控件 -->
            <div
                v-else-if="item.type === 'custom'"
                :style="[
                    {
                        'box-sizing': 'border-box'
                    },
                    customStyles(item.styles)
                ]"
            >
                <component :is="item.component" v-if="item.component" :height="item.h * 6"></component>
            </div>
        </grid-item>
    </grid-layout>
</template>

<script>
import md5 from 'md5'
import VueGridLayout from 'vue-grid-layout'
import editor from '@/views/components/quill/editor'
import customTableColumn from '@/views/components/gauge/custom-table-column'
import { fabric } from 'fabric'
export default {
    name: 'gauge-show-component',
    props: {
        layout: {
            type: Array,
            default: () => {
                return []
            }
        }
    },
    components: {
        GridLayout: VueGridLayout.GridLayout,
        GridItem: VueGridLayout.GridItem,
        editor,
        customTableColumn
    },
    data() {
        return {
            action: this.$axios.defaults.baseURL + '/upload/putObject/oss',
            headers: {
                Authorization: window.localStorage.getItem('Authorization')
            },
            canvas: null
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
        customStyles(styles) {
            return styles
        },
        handleEvent(type, params, row) {
            if (params.type === 'signature') {
                this.initfreeDraw(params)
            }
            this.$emit('handleEvent', type, params, row)
        },
        initfreeDraw(item) {
            var parentWidth = document.getElementById(item.i).parentNode.getBoundingClientRect().width
            document.getElementById(item.i).width = parentWidth - 12
            this.canvas = new fabric.Canvas(item.i)
            this.canvas.backgroundColor = '#fff'
            this.canvas.isDrawingMode = true
            this.canvas.freeDrawingBrush.color = '#000'
            this.canvas.freeDrawingBrush.width = 3
            this.canvas.renderAll()
        },
        // 单位格式化
        formatBytes(bytes) {
            this.utils.formatBytes(bytes)
        },
        // 文件上传之前
        beforeFileUpload(file, element) {
            return true
        },
        // 文件上传成功
        handleFileSuccess(res, file, fileList, element) {
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
                element.value = JSON.parse(JSON.stringify(fileArray))
            } else {
                let index = element.value.findIndex(fileItem => {
                    return fileItem.url === file.url
                })
                fileList.splice(index, 1)
                this.$message.error(res.message)
            }
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
        // 文件删除
        handleFileRemove(file, element) {
            let fileList = this.$refs[element.i][0].uploadFiles
            let index = fileList.findIndex(fileItem => {
                return fileItem.url === file.url
            })
            fileList.splice(index, 1)
            let fileArray = []
            for (let i = 0; i < fileList.length; i++) {
                let item = fileList[i]
                fileArray.push({
                    type: item.type,
                    name: item.name,
                    size: item.size,
                    url: item.url
                })
            }
            element.value = fileArray
        }
    }
}
</script>

<style scoped>
::v-deep .el-scrollbar__wrap {
    overflow-x: hidden !important;
}
::v-deep .work .el-tabs__nav {
    transform: translateX(15px) !important;
}
::v-deep .el-tabs--border-card > .el-tabs__content {
    padding: 0px;
}
::v-deep .el-card {
    border-radius: 4px !important;
}
::-webkit-scrollbar {
    width: 4px;
    height: 4px;
}
::-webkit-scrollbar-thumb {
    width: 4px;
    background: #7d7d7d;
}
::-webkit-scrollbar-track {
    width: 4px;
    background: #eee;
}
</style>
