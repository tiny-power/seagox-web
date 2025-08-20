<template>
    <div>
        <div class="searchView" style="padding-top: 10px">
            <el-form label-width="60px" :inline="true" size="medium">
                <el-form-item label="标题">
                    <el-input v-model="searchContent.title" placeholder="请输入标题" clearable> </el-input>
                </el-form-item>
                <el-form-item label="类别">
                    <el-select
                        v-model="searchContent.businessType"
                        multiple
                        clearable
                        placeholder="请选择类别"
                        filterable
                        collapse-tags
                    >
                        <el-option
                            v-for="item in businessTypeOptions"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" @click.native="handleSearch">查询</el-button>
                    <el-button type="primary" plain icon="el-icon-check" @click.native="handleBatch">提交</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="table">
            <!--列表-->
            <el-table
                :data="tableData"
                border
                stripe
                @row-dblclick="goDetail"
                row-key="id"
                :row-style="{ cursor: 'pointer' }"
                @selection-change="handleSelectionChange"
                :height="clientHeight - 205"
            >
                <el-table-column type="selection" width="55"> </el-table-column>
                <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
                <el-table-column prop="name" label="标题" align="center" show-overflow-tooltip></el-table-column>
                <el-table-column
                    prop="createTime"
                    label="创建时间"
                    align="center"
                    show-overflow-tooltip
                ></el-table-column>
            </el-table>
            <!--分页-->
            <div class="pagination">
                <el-pagination
                    background
                    @current-change="handleCurrentChange"
                    layout="total, prev, pager, next"
                    :page-size="pageSize"
                    :current-page.sync="pageNo"
                    :total="total"
                >
                </el-pagination>
            </div>
        </div>
        <el-dialog title="提交提示" width="550px" :visible.sync="validVisible" :close-on-click-modal="false">
            <div style="padding-bottom: 15px; max-height: 300px; overflow: auto">
                <div>
                    处理成功数：<span style="color: #2ba471; font-weight: bold; font-size: 16px">{{ successNum }}</span
                    >;处理失败数：<span style="color: #d54941; font-weight: bold; font-size: 16px">{{ errorNum }}</span>
                </div>
                <div
                    v-for="(item, index) in failList"
                    :key="index"
                    style="color: #f56c6c; font-size: 16px; margin-top: 10px; max-height: 300px; overflow: auto"
                >
                    {{ index + 1 + '、' }} {{ item }}
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="validVisible = false">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            clientHeight: document.documentElement.clientHeight || document.body.clientHeight,
            searchContent: {
                title: '',
                businessType: []
            },
            tableData: [],
            pageNo: 1,
            pageSize: 10,
            total: 0,
            businessTypeOptions: [],
            multipleSelection: [],
            validVisible: false,
            successNum: 0,
            errorNum: 0,
            failList: []
        }
    },
    mounted() {
        this.queryByPage()
        this.queryBusinessTypes()
    },
    methods: {
        queryBusinessTypes() {
            this.$axios.get('form/queryBusinessTypes').then(res => {
                if (res.data.code === 200) {
                    this.businessTypeOptions = res.data.data
                }
            })
        },
        goDetail(row) {
            this.$router.push({
                path: '/handleCustomForm',
                query: {
                    id: row.businessKey,
                    formId: row.businessType,
                    title: '事项详情'
                }
            })
        },
        queryByPage() {
            let params = {
                pageNo: this.pageNo,
                name: this.searchContent.title,
                businessTypeStr: this.searchContent.businessType.join(',')
            }
            this.$axios.get('flow/queryReadyItem', { params }).then(res => {
                if (res.data.code === 200) {
                    this.tableData = res.data.data.list
                    this.total = res.data.data.total
                    this.pageSize = res.data.data.pageSize
                } else {
                    this.$message.error(res.data.message)
                }
            })
        },
        handleSearch() {
            this.queryByPage()
        },
        handleCurrentChange() {
            this.queryByPage()
        },
        handleSelectionChange(val) {
            this.multipleSelection = val
        },
        handleBatch() {
            if (this.multipleSelection.length === 0) {
                this.$message.warning('请至少选择一条数据')
                return
            }
            let params = {
                batchData: JSON.stringify(this.multipleSelection)
            }
            this.$axios.post('flow/batchSubmit', params).then(res => {
                if (res.data.code === 200) {
                    this.pageNo = 1
                    this.queryByPage()
                    this.validVisible = true
                    this.successNum = res.data.data.successNum
                    this.errorNum = res.data.data.errorNum
                    this.failList = res.data.data.failList
                } else {
                    this.$message.error(res.data.message)
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
