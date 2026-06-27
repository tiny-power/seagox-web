<template>
    <div class="document-page">
            <el-form :inline="true" :model="query" class="filter-form" @submit.native.prevent>
                <el-form-item label="项目编号">
                    <el-input v-model.trim="query.code" clearable placeholder="请输入项目编号" />
                </el-form-item>
                <el-form-item label="项目名称">
                    <el-input v-model.trim="query.name" clearable placeholder="请输入项目名称" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
                    <el-button icon="el-icon-refresh-left" @click="resetSearch">重置</el-button>
                </el-form-item>
            </el-form>
        <div class="table-wrapper">
        <el-table class="project-data-table rounded-table" v-loading="loading" :data="rows" height="100%" border stripe
            ><el-table-column type="index" width="55" label="序号" align="center" /><el-table-column
                prop="code"
                label="项目编号"
                align="center"
                min-width="120"
            /><el-table-column prop="name" label="项目名称" min-width="180" align="center" /><el-table-column
                prop="address"
                label="项目地址"
                align="center"
                min-width="200"
                show-overflow-tooltip
            /><el-table-column prop="budgetAmount" label="预算金额" width="130" align="center" /><el-table-column
                label="已使用"
                width="130"
                align="center"
                ><template slot-scope="s">{{ formatAmount(usedAmount(s.row)) }}</template></el-table-column
            ><el-table-column
                label="预算使用率"
                width="130"
                align="center"
                ><template slot-scope="s">{{ usageRateText(s.row) }}</template></el-table-column
            ><el-table-column
                label="成本预警"
                width="150"
                align="center"
                ><template slot-scope="s"
                    ><el-tag :type="warningType(s.row)" effect="plain">{{ warningLabel(s.row) }}</el-tag></template
                ></el-table-column
            ><el-table-column prop="plannedStartDate" label="计划开始" width="120" align="center" /><el-table-column
                prop="plannedEndDate"
                label="计划结束"
                width="120"
                align="center" /></el-table
        >
        </div>
        <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :page-size="query.pageSize"
            :current-page="query.pageNo"
            :page-sizes="[10, 20, 50, 100]"
            @current-change="pageChange"
            @size-change="sizeChange"
        />
    </div>
</template>
<script>
export default {
    data() {
        return {
            loading: false,
            rows: [],
            total: 0,
            query: { pageNo: 1, pageSize: 10, code: '', name: '' }
        }
    },
    created() {
        this.load()
    },
    methods: {
        toNumber(value) {
            let amount = Number(value)
            return Number.isFinite(amount) ? amount : 0
        },
        usedAmount(row) {
            return this.toNumber(
                row.usedAmount || row.usedBudgetAmount || row.usedBudget || row.actualAmount || row.costAmount
            )
        },
        budgetAmount(row) {
            return this.toNumber(row.budgetAmount)
        },
        usageRate(row) {
            let budgetAmount = this.budgetAmount(row)
            if (budgetAmount <= 0) {
                return 0
            }
            return (this.usedAmount(row) / budgetAmount) * 100
        },
        usageRateText(row) {
            return this.usageRate(row).toFixed(2) + '%'
        },
        formatAmount(value) {
            return this.toNumber(value).toFixed(2)
        },
        warningLevel(row) {
            let rate = this.usageRate(row)
            if (rate > 100) return 'over'
            if (rate >= 90) return 'danger'
            if (rate >= 70) return 'warning'
            return 'normal'
        },
        warningType(row) {
            let level = this.warningLevel(row)
            if (level === 'over' || level === 'danger') return 'danger'
            if (level === 'warning') return 'warning'
            return 'success'
        },
        warningLabel(row) {
            let level = this.warningLevel(row)
            if (level === 'over') return '超预算预警'
            if (level === 'danger') return '红色预警'
            if (level === 'warning') return '黄色预警'
            return '正常'
        },
        async load() {
            this.loading = true
            try {
                let r = await this.$axios.get('finance/queryByPage', { params: this.query })
                if (r.data.code === 200) {
                    this.rows = r.data.data.list
                    this.total = r.data.data.total
                }
            } finally {
                this.loading = false
            }
        },
        search() {
            this.query.pageNo = 1
            this.load()
        },
        resetSearch() {
            this.query.code = ''
            this.query.name = ''
            this.search()
        },
        pageChange(pageNo) {
            this.query.pageNo = pageNo
            this.load()
        },
        sizeChange(pageSize) {
            this.query.pageSize = pageSize
            this.query.pageNo = 1
            this.load()
        }
    }
}
</script>
<style scoped>
.document-page {
    padding: 20px 12px 12px 12px;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
.filter-form {
    margin-bottom: 4px;
    flex: none;
}
.filter-form .el-input,
.filter-form .el-select {
    width: 170px;
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
.table-wrapper {
    flex: 1;
    min-height: 0;
    overflow: hidden;
}
::v-deep .project-data-table .el-table__cell {
    text-align: center;
}
</style>
