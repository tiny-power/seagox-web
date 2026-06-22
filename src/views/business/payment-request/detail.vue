<template>
    <div class="detail-page">
        <el-card v-loading="loading" shadow="never">
            <div slot="header" class="card-header"><span>请款单详情</span></div>
            <el-descriptions v-if="record.id" :column="2" border>
                <el-descriptions-item label="项目名称">{{ formatValue(record.projectName) }}</el-descriptions-item>
                <el-descriptions-item label="项目编号">{{ formatValue(record.projectCode) }}</el-descriptions-item>
                <el-descriptions-item label="申请人">{{ formatValue(record.applicantName) }}</el-descriptions-item>
                <el-descriptions-item label="请款金额">{{ formatMoney(record.amount) }}</el-descriptions-item>
                <el-descriptions-item label="状态">{{ formatPaymentStatus(record.status) }}</el-descriptions-item>
                <el-descriptions-item label="请款事由" :span="2">{{ formatValue(record.reason) }}</el-descriptions-item>
                <el-descriptions-item label="附件" :span="2">
                    <pre class="json-content">{{ formatJson(record.attachments) }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="提交时间">{{ formatValue(record.submitTime) }}</el-descriptions-item>
                <el-descriptions-item label="创建人">{{ formatValue(record.createdByName) }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ formatValue(record.createdAt) }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ formatValue(record.updatedAt) }}</el-descriptions-item>
            </el-descriptions>
            <el-empty v-else-if="!loading" description="暂无详情数据" />
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        return { loading: false, record: {} }
    },
    created() {
        this.load()
    },
    methods: {
        formatValue(value) {
            return value === null || value === undefined || value === '' ? '-' : value
        },
        formatBoolean(value) {
            if (value === null || value === undefined || value === '') return '-'
            return Number(value) === 1 ? '是' : '否'
        },
        formatMoney(value) {
            if (value === null || value === undefined || value === '') return '-'
            return '¥' + Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        },
        formatPaymentStatus(value) {
            if (value === null || value === undefined || value === '') return '-'
            switch (String(value)) {
                case '0':
                    return '草稿'
                case '1':
                    return '审批中'
                case '2':
                    return '已撤销'
                case '3':
                    return '已通过'
                case '4':
                    return '已驳回'
                default:
                    return value
            }
        },
        formatJson(value) {
            if (value === null || value === undefined || value === '') return '-'
            try {
                let data = typeof value === 'string' ? JSON.parse(value) : value
                return JSON.stringify(data, null, 2)
            } catch (e) {
                return String(value)
            }
        },
        async load() {
            if (!this.$route.query.id) return
            this.loading = true
            try {
                let response = await this.$axios.get('paymentRequest/queryById/' + this.$route.query.id)
                if (response.data.code === 200) this.record = response.data.data || {}
                else this.$message.error(response.data.message || '查询失败')
            } finally {
                this.loading = false
            }
        }
    }
}
</script>

<style scoped>
.detail-page {
    padding: 20px;
}
.card-header {
    font-size: 16px;
    font-weight: 600;
}
.json-content {
    max-height: 360px;
    margin: 0;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-all;
    font-family: inherit;
    line-height: 1.6;
}
</style>
