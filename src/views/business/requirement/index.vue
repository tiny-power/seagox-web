<template>
    <div class="document-page">
        <el-form :inline="true" :model="query" class="filter-form" @submit.native.prevent>
            <el-form-item label="项目名称">
                <el-select
                    v-model="query.projectId"
                    clearable
                    filterable
                    remote
                    :remote-method="loadProjects"
                    :loading="projectLoading"
                    placeholder="请选择项目"
                >
                    <el-option v-for="item in projectOptions" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="状态">
                <el-select v-model="query.status" clearable placeholder="请选择状态">
                    <el-option label="待提交" :value="1" />
                    <el-option label="待审核" :value="2" />
                    <el-option label="已完成" :value="3" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
                <el-button icon="el-icon-refresh" @click="reset">重置</el-button>
                <el-button type="primary" icon="el-icon-plus" @click="openForm()">新增</el-button>
            </el-form-item>
        </el-form>
        <div class="table-wrapper">
            <el-table class="rounded-table" v-loading="loading" :data="rows" height="100%" border stripe>
                <el-table-column type="index" label="序号" width="55" align="center" />
                <el-table-column
                    prop="projectName"
                    label="项目名称"
                    min-width="180"
                    align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">{{ formatValue(scope.row.projectName) }}</template>
                </el-table-column>
                <el-table-column prop="style" label="风格偏好" min-width="150" align="center" show-overflow-tooltip />
                <el-table-column prop="budget" label="预算范围" min-width="140" align="center" show-overflow-tooltip />
                <el-table-column prop="member" label="家庭成员" min-width="160" align="center" show-overflow-tooltip />
                <el-table-column prop="statusText" label="状态" width="100" align="center">
                    <template slot-scope="scope">
                        <el-tag size="small" :type="statusType(scope.row.status)">{{
                            formatValue(scope.row.statusText)
                        }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="signedAt" label="签字时间" width="170" align="center" show-overflow-tooltip>
                    <template slot-scope="scope">{{ formatValue(scope.row.signedAt) }}</template>
                </el-table-column>
                <el-table-column prop="updatedAt" label="更新时间" width="170" align="center" show-overflow-tooltip>
                    <template slot-scope="scope">{{ formatValue(scope.row.updatedAt) }}</template>
                </el-table-column>
                <el-table-column label="操作" width="280" align="center" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="openForm(scope.row)">编辑</el-button>
                        <el-button type="text" size="small" @click="submit(scope.row)" v-if="scope.row.status !== 3"
                            >提交</el-button
                        >
                        <el-button type="text" size="small" @click="openSign(scope.row)" v-if="scope.row.status === 2"
                            >签字</el-button
                        >
                        <el-button type="text" size="small" @click="remove(scope.row)" v-if="scope.row.status !== 3"
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

        <el-dialog :title="form.id ? '编辑需求沟通' : '新增需求沟通'" :visible.sync="formVisible" width="620px">
            <el-form ref="form" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="所属项目" prop="projectId">
                    <el-select
                        v-model="form.projectId"
                        clearable
                        filterable
                        remote
                        :remote-method="loadProjects"
                        :loading="projectLoading"
                        placeholder="请选择项目"
                        class="form-control"
                    >
                        <el-option v-for="item in projectOptions" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="风格偏好" prop="style">
                    <el-input v-model="form.style" maxlength="255" placeholder="请输入风格偏好" />
                </el-form-item>
                <el-form-item label="预算范围" prop="budget">
                    <el-input v-model="form.budget" maxlength="255" placeholder="请输入预算范围" />
                </el-form-item>
                <el-form-item label="家庭成员" prop="member">
                    <el-input v-model="form.member" maxlength="255" placeholder="请输入家庭成员" />
                </el-form-item>
                <el-form-item label="特殊需求">
                    <el-input
                        v-model="form.mark"
                        type="textarea"
                        :rows="4"
                        maxlength="500"
                        show-word-limit
                        placeholder="请输入特殊需求"
                    />
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="formVisible = false">取消</el-button>
                <el-button type="primary" :loading="saving" @click="save">保存</el-button>
            </span>
        </el-dialog>

        <el-dialog title="签字确认" :visible.sync="signVisible" width="520px">
            <el-form label-width="100px">
                <el-form-item label="签字文件">
                    <el-input v-model="signatureUrl" maxlength="500" placeholder="请输入签字文件地址" />
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="signVisible = false">取消</el-button>
                <el-button type="primary" :loading="signing" @click="sign">确认</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            loading: false,
            saving: false,
            signing: false,
            projectLoading: false,
            projectOptions: [],
            rows: [],
            total: 0,
            query: this.createQuery(),
            formVisible: false,
            form: this.createForm(),
            signVisible: false,
            signRow: null,
            signatureUrl: '',
            rules: {
                projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
                style: [{ required: true, message: '请输入风格偏好', trigger: 'blur' }],
                budget: [{ required: true, message: '请输入预算范围', trigger: 'blur' }],
                member: [{ required: true, message: '请输入家庭成员', trigger: 'blur' }]
            }
        }
    },
    created() {
        this.loadProjects()
        this.load()
    },
    methods: {
        createQuery() {
            return {
                pageNo: 1,
                pageSize: 10,
                projectId: '',
                status: ''
            }
        },
        createForm() {
            return {
                id: '',
                projectId: '',
                style: '',
                budget: '',
                member: '',
                mark: ''
            }
        },
        formatValue(value) {
            return value === null || value === undefined || value === '' ? '-' : value
        },
        statusType(status) {
            if (Number(status) === 3) return 'success'
            if (Number(status) === 2) return 'warning'
            return 'info'
        },
        async loadProjects(name) {
            this.projectLoading = true
            try {
                let response = await this.$axios.get('project/queryByPage', {
                    params: { pageNo: 1, pageSize: 50, name: name || '' }
                })
                if (response.data.code === 200) {
                    let data = response.data.data || {}
                    this.projectOptions = data.list || []
                } else {
                    this.$message.error(response.data.message || '项目查询失败')
                }
            } finally {
                this.projectLoading = false
            }
        },
        async load() {
            this.loading = true
            try {
                let response = await this.$axios.get('requirement/queryByPage', { params: this.query })
                if (response.data.code === 200) {
                    let data = response.data.data || {}
                    this.rows = data.list || []
                    this.total = data.total || 0
                } else {
                    this.$message.error(response.data.message || '查询失败')
                }
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
        openForm(row) {
            this.form = row
                ? {
                      id: row.id,
                      projectId: row.projectId,
                      style: row.style,
                      budget: row.budget,
                      member: row.member,
                      mark: row.mark
                  }
                : this.createForm()
            this.formVisible = true
            this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
        },
        save() {
            this.$refs.form.validate(async valid => {
                if (!valid) return
                this.saving = true
                try {
                    let response = await this.$axios.post('requirement/save', {
                        ...this.form,
                        userId: localStorage.getItem('userId')
                    })
                    if (response.data.code === 200) {
                        this.$message.success('保存成功')
                        this.formVisible = false
                        this.load()
                    } else {
                        this.$message.error(response.data.message || '保存失败')
                    }
                } finally {
                    this.saving = false
                }
            })
        },
        submit(row) {
            this.$confirm('确认提交该需求沟通给业主审核吗？', '提示', { type: 'warning' })
                .then(async () => {
                    let response = await this.$axios.post(`requirement/submit/${row.id}`, {
                        userId: localStorage.getItem('userId')
                    })
                    if (response.data.code === 200) {
                        this.$message.success('提交成功')
                        this.load()
                    } else {
                        this.$message.error(response.data.message || '提交失败')
                    }
                })
                .catch(() => {})
        },
        openSign(row) {
            this.signRow = row
            this.signatureUrl = row.signatureUrl || ''
            this.signVisible = true
        },
        async sign() {
            if (!this.signatureUrl) {
                this.$message.warning('请输入签字文件地址')
                return
            }
            this.signing = true
            try {
                let response = await this.$axios.post(`requirement/sign/${this.signRow.id}`, {
                    signatureUrl: this.signatureUrl,
                    userId: localStorage.getItem('userId')
                })
                if (response.data.code === 200) {
                    this.$message.success('签字成功')
                    this.signVisible = false
                    this.load()
                } else {
                    this.$message.error(response.data.message || '签字失败')
                }
            } finally {
                this.signing = false
            }
        },
        remove(row) {
            this.$confirm('确认删除该需求沟通吗？', '提示', { type: 'warning' })
                .then(async () => {
                    let response = await this.$axios.post(`requirement/delete/${row.id}`)
                    if (response.data.code === 200) {
                        this.$message.success('删除成功')
                        this.load()
                    } else {
                        this.$message.error(response.data.message || '删除失败')
                    }
                })
                .catch(() => {})
        }
    }
}
</script>

<style scoped>
.document-page {
    padding: 20px;
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
.form-control {
    width: 100%;
}
</style>
