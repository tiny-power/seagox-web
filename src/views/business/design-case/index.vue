<template>
    <div class="document-page design-case-page">
        <el-form :inline="true" :model="query" class="filter-form" @submit.native.prevent>
            <el-form-item label="关键词">
                <el-input
                    v-model.trim="query.keyword"
                    clearable
                    placeholder="标题/省/城市"
                    @keyup.enter.native="search"
                    @clear="search"
                />
            </el-form-item>
            <el-form-item label="状态">
                <el-select v-model="query.status" clearable placeholder="全部">
                    <el-option
                        v-for="item in statusOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="风格">
                <el-select v-model="query.styles" multiple collapse-tags clearable placeholder="全部">
                    <el-option v-for="item in styleOptions" :key="item" :label="item" :value="item" />
                </el-select>
            </el-form-item>
            <el-form-item label="地区">
                <el-select v-model="query.regions" multiple collapse-tags clearable placeholder="全部">
                    <el-option v-for="item in regionOptions" :key="item" :label="item" :value="item" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
                <el-button icon="el-icon-refresh-left" @click="reset">重置</el-button>
                <el-button type="primary" icon="el-icon-plus" @click="add">新增</el-button>
            </el-form-item>
        </el-form>
        <div class="table-wrapper">
            <el-table
                v-loading="loading"
                class="rounded-table"
                :data="rows"
                height="100%"
                border
                stripe
                :row-style="{ cursor: 'pointer' }"
                @row-dblclick="view"
            >
                <el-table-column type="index" label="序号" width="55" align="center" />
                <el-table-column label="封面" width="110" align="center">
                    <template slot-scope="scope">
                        <el-image class="cover-thumb" :src="scope.row.coverUrl" fit="cover">
                            <div slot="error" class="image-error"><i class="el-icon-picture-outline"></i></div>
                        </el-image>
                    </template>
                </el-table-column>
                <el-table-column prop="title" label="案例标题" min-width="180" show-overflow-tooltip />
                <el-table-column label="城市" width="150" align="center">
                    <template slot-scope="scope">{{ scope.row.provinceName }}.{{ scope.row.cityName }}</template>
                </el-table-column>
                <el-table-column label="风格" min-width="160" align="center">
                    <template slot-scope="scope">
                        <el-tag
                            v-for="item in parseArray(scope.row.styleList)"
                            :key="item"
                            size="mini"
                            class="tag-item"
                            >{{ item }}</el-tag
                        >
                    </template>
                </el-table-column>
                <el-table-column prop="regionText" label="地区" width="90" align="center" />
                <el-table-column prop="buildingArea" label="面积(m²)" width="100" align="center" />
                <el-table-column prop="floorCount" label="层数" width="80" align="center" />
                <el-table-column prop="roofType" label="屋顶" width="90" align="center" />
                <el-table-column prop="sort" label="排序" width="80" align="center" />
                <el-table-column label="状态" width="90" align="center">
                    <template slot-scope="scope">
                        <el-tag :type="statusTag(scope.row.status)" size="mini">{{
                            statusText(scope.row.status)
                        }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="updatedAt" label="更新时间" width="170" align="center" />
                <el-table-column label="操作" width="170" align="center" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="view(scope.row)">查看</el-button>
                        <el-divider direction="vertical" />
                        <el-button type="text" size="small" @click="edit(scope.row)">编辑</el-button>
                        <el-divider direction="vertical" />
                        <el-button type="text" size="small" class="danger-text" @click="remove(scope.row)"
                            >删除</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :current-page="query.pageNo"
            :page-size="query.pageSize"
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
            query: this.createQuery(),
            styleOptions: ['简约', '轻奢', '田园', '新中式', '法式'],
            regionOptions: ['东北', '华北', '华东', '华中', '西北', '西南', '华南'],
            statusOptions: [
                { label: '草稿', value: 0 },
                { label: '已发布', value: 1 },
                { label: '已下架', value: 2 }
            ]
        }
    },
    created() {
        this.load()
    },
    methods: {
        createQuery() {
            return { pageNo: 1, pageSize: 10, keyword: '', status: '', styles: [], regions: [] }
        },
        buildParams() {
            return {
                pageNo: this.query.pageNo,
                pageSize: this.query.pageSize,
                keyword: this.query.keyword,
                status: this.query.status,
                styles: (this.query.styles || []).join(','),
                regions: (this.query.regions || []).join(',')
            }
        },
        parseArray(value) {
            if (Array.isArray(value)) return value
            if (!value) return []
            try {
                return JSON.parse(value) || []
            } catch (error) {
                return []
            }
        },
        statusText(value) {
            let item = this.statusOptions.find(option => option.value === Number(value))
            return item ? item.label : '-'
        },
        statusTag(value) {
            if (Number(value) === 1) return 'success'
            if (Number(value) === 2) return 'info'
            return 'warning'
        },
        async load() {
            this.loading = true
            try {
                let response = await this.$axios.get('designCase/queryByPage', { params: this.buildParams() })
                if (response.data.code === 200) {
                    let data = response.data.data || {}
                    this.rows = data.list || []
                    this.total = data.total || 0
                } else this.$message.error(response.data.message || '查询失败')
            } finally {
                this.loading = false
            }
        },
        search() {
            this.query.pageNo = 1
            this.load()
        },
        reset() {
            this.query = this.createQuery()
            this.load()
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
        add() {
            this.$router.push('/designCaseAdd')
        },
        edit(row) {
            this.$router.push({ path: '/designCaseEdit', query: { id: row.id } })
        },
        view(row) {
            this.$router.push({ path: '/designCaseDetail', query: { id: row.id } })
        },
        remove(row) {
            this.$confirm('确认删除该案例？', '提示', { type: 'warning' }).then(async () => {
                const response = await this.$axios.post('designCase/delete/' + row.id)
                if (response.data.code === 200) {
                    this.$message.success('删除成功')
                    this.load()
                } else this.$message.error(response.data.message || '删除失败')
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
.rounded-table {
    border-radius: 8px;
    overflow: hidden;
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
.cover-thumb {
    width: 78px;
    height: 56px;
    border-radius: 4px;
    background: #f5f7fa;
}
.image-error {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #c0c4cc;
    font-size: 22px;
}
.tag-item {
    margin: 2px 4px 2px 0;
}
.danger-text {
    color: #f56c6c;
}
</style>
