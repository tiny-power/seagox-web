<template>
    <div class="document-page">
            <el-form :inline="true" :model="query" class="filter-form" @submit.native.prevent>
                <el-form-item label="项目编号">
                    <el-input v-model.trim="query.code" clearable placeholder="请输入项目编号" />
                </el-form-item>
                <el-form-item label="项目名称">
                    <el-input v-model.trim="query.name" clearable placeholder="请输入项目名称" />
                </el-form-item>
                <el-form-item label="项目状态">
                    <el-select v-model="query.status" clearable placeholder="请选择项目状态">
                        <el-option
                            v-for="item in statuses"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
                    <el-button icon="el-icon-refresh-left" @click="resetSearch">重置</el-button>
                    <el-button type="primary" icon="el-icon-plus" @click="$router.push('/projectAdd')"
                        >新增</el-button
                    >
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
                label="状态"
                width="110"
                align="center"
                ><template slot-scope="s">{{ statusLabel(s.row.status) }}</template></el-table-column
            ><el-table-column prop="plannedStartDate" label="计划开始" width="120" align="center" /><el-table-column
                prop="plannedEndDate"
                label="计划结束"
                width="120"
                align="center"
            /><el-table-column label="操作" width="190" fixed="right" align="center"
                ><template slot-scope="s"
                    ><el-button type="text" @click="$router.push({ path: '/projectEdit', query: { id: s.row.id } })"
                        >编辑</el-button
                    ><el-button v-if="Number(s.row.status) === 1" type="text" @click="start(s.row)">启动</el-button
                    ><el-button type="text" class="danger" @click="remove(s.row)">删除</el-button></template
                ></el-table-column
            ></el-table
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
            query: { pageNo: 1, pageSize: 10, code: '', name: '', status: '' },
            statuses: [
                { label: '待启动', value: 1 },
                { label: '进行中', value: 2 },
                { label: '暂停', value: 3 },
                { label: '已交付', value: 4 },
                { label: '售后中', value: 5 },
                { label: '已完结', value: 6 },
                { label: '已取消', value: 7 }
            ]
        }
    },
    created() {
        this.load()
    },
    methods: {
        statusLabel(v) {
            let x = this.statuses.find(i => i.value === Number(v))
            return x ? x.label : v
        },
        async load() {
            this.loading = true
            try {
                let r = await this.$axios.get('project/queryByPage', { params: this.query })
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
            this.query.status = ''
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
        },
        start(row) {
            this.$confirm('确认启动项目“' + row.name + '”吗？', '提示', { type: 'warning' }).then(async () => {
                let r = await this.$axios.post('project/start/' + row.id)
                if (r.data.code === 200) {
                    this.$message.success('启动成功')
                    this.load()
                } else this.$message.error(r.data.message)
            })
        },
        remove(row) {
            this.$confirm('确认删除项目“' + row.name + '”吗？', '提示', { type: 'warning' }).then(async () => {
                let r = await this.$axios.post('project/delete/' + row.id)
                if (r.data.code === 200) {
                    this.$message.success('删除成功')
                    this.load()
                } else this.$message.error(r.data.message)
            })
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
.danger {
    color: #f56c6c;
}
</style>
