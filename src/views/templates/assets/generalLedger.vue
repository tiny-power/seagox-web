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
                资产总账表
            </div>
            <div style="flex: 1; text-align: right">
                <el-button
                    type="text"
                    icon="el-icon-download"
                    @click="handleExport"
                    size="small"
                    style="color: #000; font-weight: 400"
                    >导出</el-button
                >
            </div>
        </div>
        <div :style="{ height: clientHeight - 150 + 'px', overflow: 'auto' }">
            <div class="searchView" style="padding-top: 10px">
                <el-form label-width="70px" :inline="true" size="medium" style="flex: 1">
                    <el-form-item label="日期范围">
                        <el-date-picker
                            v-model="searchContent.dateRange"
                            type="daterange"
                            range-separator="-"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            value-format="yyyy-MM-dd"
                            :clearable="false"
                        >
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="资产分类">
                        <el-cascader
                            v-model="searchContent.typeArray"
                            placeholder="请选择资产分类"
                            clearable
                            filterable
                            :show-all-levels="false"
                            :props="{ value: 'code', label: 'name', emitPath: false, multiple: true }"
                            :options="typeOptions"
                            collapse-tags
                        >
                        </el-cascader>
                    </el-form-item>
                    <el-form-item label="单位名称">
                        <el-cascader
                            v-model="searchContent.agencyArray"
                            placeholder="请选择单位名称"
                            clearable
                            filterable
                            :show-all-levels="false"
                            :props="{ value: 'id', label: 'name', emitPath: false, multiple: true }"
                            :options="companyOptions"
                            collapse-tags
                        >
                        </el-cascader>
                    </el-form-item>
                    <el-form-item label="使用部门">
                        <el-cascader
                            v-model="searchContent.userDeptArray"
                            placeholder="请选择使用部门"
                            clearable
                            filterable
                            :show-all-levels="false"
                            :props="{ value: 'id', label: 'name', emitPath: false, multiple: true }"
                            :options="deptOptions"
                            collapse-tags
                        >
                        </el-cascader>
                    </el-form-item>
                    <el-form-item label="管理部门" v-if="moreFlag">
                        <el-cascader
                            v-model="searchContent.managerDeptArray"
                            placeholder="请选择管理部门"
                            clearable
                            filterable
                            :show-all-levels="false"
                            :props="{ value: 'id', label: 'name', emitPath: false, multiple: true }"
                            :options="deptOptions"
                            collapse-tags
                        >
                        </el-cascader>
                    </el-form-item>
                </el-form>
                <div :style="{ width: '270px' }">
                    <el-button size="medium" type="primary" icon="el-icon-search" @click.native="handleSearch"
                        >查询</el-button
                    >
                    <el-button size="medium" icon="el-icon-refresh" @click="resetForm">重置</el-button>
                    <el-button
                        size="medium"
                        :icon="moreFlag ? 'el-icon-caret-bottom' : 'el-icon-caret-left'"
                        @click="moreFlag = !moreFlag"
                        >{{ moreFlag ? '收缩' : '展开' }}</el-button
                    >
                </div>
            </div>
            <div class="table">
                <!--列表-->
                <el-table
                    :data="tableData"
                    border
                    stripe
                    row-key="id"
                    :row-style="{ cursor: 'pointer' }"
                    :height="clientHeight - 210"
                >
                    <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
                    <el-table-column prop="name" label="资产分类" align="center"></el-table-column>
                    <el-table-column prop="name" label="期初" align="center">
                        <el-table-column prop="name" label="数量/面积" align="center"></el-table-column>
                        <el-table-column prop="name" label="原值" align="center"></el-table-column>
                        <el-table-column prop="name" label="累计折旧" align="center"></el-table-column>
                        <el-table-column prop="name" label="净值" align="center"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="name" label="本期增加" align="center">
                        <el-table-column prop="name" label="数量/面积" align="center"></el-table-column>
                        <el-table-column prop="name" label="原值" align="center"></el-table-column>
                        <el-table-column prop="name" label="合计折旧" align="center"></el-table-column>
                        <el-table-column prop="name" label="计提折旧" align="center"></el-table-column>
                        <el-table-column prop="name" label="补提折旧" align="center"></el-table-column>
                        <el-table-column prop="name" label="冲减折旧" align="center"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="name" label="本期减少" align="center">
                        <el-table-column prop="name" label="数量/面积" align="center"></el-table-column>
                        <el-table-column prop="name" label="原值" align="center"></el-table-column>
                        <el-table-column prop="name" label="累计折旧" align="center"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="name" label="期末" align="center">
                        <el-table-column prop="name" label="数量/面积" align="center"></el-table-column>
                        <el-table-column prop="name" label="原值" align="center"></el-table-column>
                        <el-table-column prop="name" label="累计折旧" align="center"></el-table-column>
                        <el-table-column prop="name" label="净值" align="center"></el-table-column>
                    </el-table-column>
                </el-table>
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
                dateRange: [],
                typeArray: [],
                agencyArray: [],
                userDeptArray: [],
                managerDeptArray: []
            },
            tableData: [],
            moreFlag: false,
            typeOptions: [],
            companyOptions: [],
            deptOptions: []
        }
    },
    created() {
        this.searchContent.dateRange = [
            this.dayjs().startOf('month').format('YYYY-MM-DD'),
            this.dayjs().format('YYYY-MM-DD')
        ]
    },
    mounted() {
        this.queryByPage()
        this.queryCompany()
        this.queryDicDetail(17)
        this.queryDeptData()
    },
    methods: {
        queryByPage() {
            let params = {
                dateRange: this.searchContent.dateRange.toString(),
                typeArray: this.searchContent.typeArray.toString(),
                agencyArray: this.searchContent.agencyArray.toString(),
                userDeptArray: this.searchContent.userDeptArray.toString(),
                managerDeptArray: this.searchContent.managerDeptArray.toString()
            }
            console.log(params)
            // this.$axios.get('flow/queryCopyItem', { params }).then(res => {
            //     if (res.data.code === 200) {
            //         this.tableData = res.data.data.list
            //         this.total = res.data.data.total
            //         this.pageSize = res.data.data.pageSize
            //     } else {
            //         this.$message.error(res.data.message)
            //     }
            // })
        },
        async queryCompany() {
            let res = await this.$axios.get('company/queryAll')
            if (res.data.code === 200) {
                this.companyOptions = res.data.data
            }
        },
        async queryDicDetail(classifyId) {
            let res = await this.$axios.get('dicDetail/queryDisplay?classifyId=' + classifyId)
            if (res.data.code === 200) {
                this.typeOptions = res.data.data
            }
        },
        async queryDeptData() {
            let params = {
                searchCompanyId: localStorage.getItem('companyId')
            }
            let res = await this.$axios.get('department/queryByCompanyId', { params })
            if (res.data.code === 200) {
                this.deptOptions = res.data.data
            }
        },
        handleSearch() {
            this.queryByPage()
        },
        resetForm() {},
        handleExport() {},
        goDetail(row) {
            this.$router.push({
                path: '/handleCustomForm',
                query: {
                    id: row.businessKey,
                    formId: row.businessType,
                    title: row.name
                }
            })
        }
    }
}
</script>
<style scoped>
::v-deep .el-date-editor {
    width: 250px !important;
}
::v-deep .el-cascader__tags {
    flex-wrap: nowrap;
    overflow: hidden;
}
</style>
