<template>
    <div>
        <div class="searchView" style="padding-top: 10px">
            <el-form label-width="80px" :inline="true" size="medium">
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
                <el-form-item label="待办人">
                    <el-input v-model="searchContent.todoPerson" placeholder="请输入待办人" clearable> </el-input>
                </el-form-item>
                <el-form-item label="处理时间">
                    <el-date-picker
                        v-model="searchContent.date"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        type="datetimerange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        unlink-panels
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" @click.native="handleSearch">查询</el-button>
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
                :row-style="{ cursor: 'pointer' }"
                :height="clientHeight - 205"
            >
                <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
                <el-table-column prop="name" label="标题" align="center" show-overflow-tooltip></el-table-column>
                <el-table-column
                    prop="assigneeName"
                    label="发起人"
                    align="center"
                    show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                    prop="createTime"
                    label="发起时间"
                    align="center"
                    show-overflow-tooltip
                ></el-table-column>
                <el-table-column prop="endTime" label="处理时间" align="center" show-overflow-tooltip></el-table-column>
                <el-table-column
                    prop="currentToDoPersons"
                    label="当前待办人"
                    align="center"
                    show-overflow-tooltip
                ></el-table-column>

                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="handleProcess(scope.row)">流程查看</el-button>
                    </template>
                </el-table-column>
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
    </div>
</template>
<script>
export default {
    data() {
        return {
            clientHeight: document.documentElement.clientHeight || document.body.clientHeight,
            searchContent: {
                title: '',
                businessType: [],
                date: [],
                todoPerson: ''
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
                    title: row.name
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
                name: this.searchContent.title,
                businessTypeStr: this.searchContent.businessType.join(','),
                todoPerson: this.searchContent.todoPerson
            }
            if (
                this.searchContent.date !== undefined &&
                this.searchContent.date !== null &&
                this.searchContent.date.length > 0
            ) {
                params.startTime = this.searchContent.date[0]
                params.endTime = this.searchContent.date[1]
            }
            this.$axios.get('flow/queryDoneItem', { params }).then(res => {
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
        }
    }
}
</script>
