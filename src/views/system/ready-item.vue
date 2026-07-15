<template>
    <div class="document-page">
        <el-form label-width="60px" :inline="true" :model="searchContent" class="filter-form" @submit.native.prevent>
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
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
                <el-button type="primary" plain icon="el-icon-check" @click="handleBatch">提交</el-button>
            </el-form-item>
        </el-form>
        <div class="table-wrapper">
            <!--列表-->
            <el-table
                class="project-data-table rounded-table"
                :data="tableData"
                border
                stripe
                @row-dblclick="goDetail"
                row-key="id"
                :row-style="{ cursor: 'pointer' }"
                @selection-change="handleSelectionChange"
                height="100%"
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
        </div>
        <!--分页-->
        <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :page-size="pageSize"
            :current-page="pageNo"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
        />
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
            this.$axios.get('flow/queryByPage', { params: { pageNo: 1, pageSize: 999 } }).then(res => {
                if (res.data.code === 200) {
                    this.businessTypeOptions = this.buildBusinessTypeOptions(res.data.data.list)
                }
            })
        },
        buildBusinessTypeOptions(list) {
            return list.map(item => {
                return {
                    id: item.businessType,
                    name: this.businessTypeFormatter(item)
                }
            })
        },
        businessTypeFormatter(item) {
            if (item.businessType === 'leave_request') {
                return '请假单'
            }
            return item.name || item.businessType
        },
        goDetail(row) {
            if (row.businessType !== 'leave_request') {
                this.$router.push({
                    path: '/flowDisplay',
                    query: {
                        businessKey: row.businessKey,
                        businessType: row.businessType,
                        title: row.name
                    }
                })
                return
            }
            this.$router.push({
                path: '/leaveDetail',
                query: {
                    businessKey: row.businessKey,
                    businessType: row.businessType,
                    title: row.name,
                    messageId: row.id,
                    source: 'ready'
                }
            })
        },
        queryByPage() {
            let params = {
                pageNo: this.pageNo,
                pageSize: this.pageSize,
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
            this.pageNo = 1
            this.queryByPage()
        },
        handleCurrentChange(pageNo) {
            this.pageNo = pageNo
            this.queryByPage()
        },
        handleSizeChange(pageSize) {
            this.pageSize = pageSize
            this.pageNo = 1
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

.rounded-table {
    border-radius: 8px;
    overflow: hidden;
}

::v-deep .project-data-table .el-table__cell {
    text-align: center;
}

::v-deep .el-dialog__body {
    padding: 10px 20px 0px 20px;
}
</style>
