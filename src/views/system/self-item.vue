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
                height="100%"
            >
                <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
                <el-table-column prop="name" label="标题" align="center" show-overflow-tooltip></el-table-column>
                <el-table-column
                    prop="assigneeName"
                    label="当前待办人"
                    align="center"
                    show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                    prop="createTime"
                    label="发起时间"
                    align="center"
                    show-overflow-tooltip
                ></el-table-column>
                <el-table-column label="操作" align="center" width="120" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="handleProcess(scope.row)">流程查看</el-button>
                    </template>
                </el-table-column>
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
            businessTypeOptions: []
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
                this.handleProcess(row)
                return
            }
            this.$router.push({
                path: '/leaveDetail',
                query: {
                    businessKey: row.businessKey,
                    businessType: row.businessType,
                    title: row.name,
                    source: 'self'
                }
            })
        },
        // 流程查看
        handleProcess(row) {
            this.$router.push({
                path: '/flowDisplay',
                query: {
                    businessKey: row.businessKey,
                    businessType: row.businessType,
                    title: row.name
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
            this.$axios.get('flow/querySelfItem', { params }).then(res => {
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
</style>
