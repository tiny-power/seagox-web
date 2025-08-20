<template>
    <div>
        <el-dialog
            title="请选择"
            width="1000px"
            append-to-body
            :visible.sync="dialogVisible"
            :close-on-click-modal="false"
        >
            <div
                style="
                    margin-top: -10px;
                    border-radius: 8px;
                    border: 1px solid #e3e7ee;
                    background: #f4f6fa;
                    padding: 10px 0px;
                "
            >
                <div class="searchView" v-if="searchJsonList.length != 0" ref="searchView" style="margin-left: 10px">
                    <el-form label-width="75px" :inline="true" size="medium" style="flex: 1">
                        <el-form-item
                            :label="item.desc"
                            v-for="(item, index) in moreFlag ? searchJsonList : searchJsonList.slice(0, 3)"
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
                    <div style="width: 135px">
                        <el-button size="medium" type="primary" icon="el-icon-search" @click.native="handleSearch"
                            >查询</el-button
                        >
                        <i
                            :class="moreFlag ? 'el-icon-caret-bottom' : 'el-icon-caret-left'"
                            v-if="searchJsonList.length > 3"
                            @click="moreFlag = !moreFlag"
                            style="margin-left: 7px; font-size: 12px; cursor: pointer; color: #3a6cfa"
                            >{{ moreFlag ? '收缩' : '展开' }}</i
                        >
                    </div>
                </div>
                <div class="table">
                    <!--列表-->
                    <el-table
                        ref="multipleTable"
                        :data="tableData"
                        row-key="id"
                        @selection-change="handleSelectionChange"
                        @row-dblclick="cellDBClick"
                        max-height="360"
                        border
                    >
                        <div slot="empty"><el-empty description="没有数据"></el-empty></div>
                        <el-table-column
                            width="50"
                            type="selection"
                            align="center"
                            :reserve-selection="true"
                            v-if="multiple"
                        ></el-table-column>
                        <el-table-column width="55" align="center" label="序号">
                            <template slot-scope="scope">
                                {{ scope.$index + 1 }}
                            </template>
                        </el-table-column>
                        <table-column v-for="(item, index) in tableColumn" :key="index" :element="item" />
                    </el-table>
                    <!--分页-->
                    <div class="pagination">
                        <el-pagination
                            background
                            @current-change="handleCurrentChange"
                            layout="total, sizes, prev, pager, next"
                            :current-page.sync="pageNo"
                            :total="total"
                        >
                        </el-pagination>
                    </div>
                </div>
            </div>
            <span slot="footer" class="dialog-footer" v-if="multiple">
                <el-button size="medium" @click="dialogVisible = false">取 消</el-button>
                <el-button size="medium" type="primary" @click="handleConfirm">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import tableColumn from '@/views/components/form/table-column'
export default {
    components: {
        tableColumn
    },
    data() {
        return {
            moreFlag: false,
            dialogVisible: false,
            searchJsonList: [],
            tableData: [],
            pageNo: 1,
            pageSize: 10,
            total: 0,
            tableColumn: [],
            parameter: {},
            multipleSelection: [],
            multiple: false,
            source: ''
        }
    },
    methods: {
        async queryById(first) {
            let search = {}
            for (let i = 0; i < this.searchJsonList.length; i++) {
                if (Array.isArray(this.searchJsonList[i].value)) {
                    search[this.searchJsonList[i].field] = this.searchJsonList[i].value.toString()
                } else {
                    search[this.searchJsonList[i].field] = this.searchJsonList[i].value
                        ? this.searchJsonList[i].value
                        : ''
                }
            }
            search = Object.assign(search, this.parameter)
            let params = {
                id: this.source,
                pageNo: this.pageNo,
                pageSize: this.pageSize,
                search: JSON.stringify(search)
            }
            let res = await this.$axios.post('form/queryListById', params)
            if (res.data.code == 200) {
                if (first) {
                    this.searchJsonList = res.data.data.options.searchColumn
                }
                this.tableColumn = res.data.data.options.tableColumn
                this.tableData = res.data.data.tableData.list
                this.total = res.data.data.tableData.total
            }
        },
        handleCurrentChange(val) {
            this.queryById(false)
        },
        handleSearch() {
            this.queryById(false)
        },
        showDialog(source, multiple, parameter) {
            this.source = source
            this.parameter = parameter || {}
            this.multiple = multiple
            this.queryById(true)
            this.dialogVisible = true
            this.$nextTick(() => {
                this.$refs.multipleTable.clearSelection()
            })
        },
        cellDBClick(row, column, cell, event) {
            if (!this.multiple) {
                this.$emit('confirm', row)
                this.dialogVisible = false
            }
        },
        handleSelectionChange(val) {
            this.multipleSelection = val
        },
        handleConfirm() {
            this.$emit('confirm', this.multipleSelection)
            this.dialogVisible = false
        }
    }
}
</script>

<style scoped>
.searchView {
    padding: 0px;
}
::v-deep .el-dialog__body {
    padding: 15px 10px;
}
</style>
