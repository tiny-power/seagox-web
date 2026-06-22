<template>
    <div class="detail-page">
        <el-card v-loading="loading" shadow="never">
            <div slot="header" class="card-header"><span>交接单详情</span></div>
            <el-descriptions v-if="record.id" :column="2" border>
                <el-descriptions-item label="项目名称">{{ formatValue(record.projectName) }}</el-descriptions-item>
                <el-descriptions-item label="项目编号">{{ formatValue(record.projectCode) }}</el-descriptions-item>
                <el-descriptions-item label="交接类型">{{
                    formatHandoverType(record.handoverType)
                }}</el-descriptions-item>
                <el-descriptions-item label="交接时间">{{ formatValue(record.handoverTime) }}</el-descriptions-item>
                <el-descriptions-item label="移交负责人">{{
                    formatValue(record.handoverUserName)
                }}</el-descriptions-item>
                <el-descriptions-item label="接收负责人">{{
                    formatValue(record.receiverUserName)
                }}</el-descriptions-item>
                <el-descriptions-item label="交接内容" :span="2">{{
                    formatValue(record.handoverContent)
                }}</el-descriptions-item>
                <el-descriptions-item label="移交方签字文件" :span="2">{{
                    formatValue(record.handoverSignatureUrl)
                }}</el-descriptions-item>
                <el-descriptions-item label="接收方签字文件" :span="2">{{
                    formatValue(record.receiverSignatureUrl)
                }}</el-descriptions-item>
                <el-descriptions-item label="移交方签字时间">{{
                    formatValue(record.handoverSignedAt)
                }}</el-descriptions-item>
                <el-descriptions-item label="接收方签字时间">{{
                    formatValue(record.receiverSignedAt)
                }}</el-descriptions-item>
                <el-descriptions-item label="附件" :span="2">
                    <pre class="json-content">{{ formatJson(record.attachment) }}</pre>
                </el-descriptions-item>
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
        formatHandoverType(value) {
            if (value === null || value === undefined || value === '') return '-'
            switch (String(value)) {
                case '1':
                    return '设计→土建'
                case '2':
                    return '设计→精装'
                case '3':
                    return '土建→精装'
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
                let response = await this.$axios.get('projectHandover/queryById/' + this.$route.query.id)
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
