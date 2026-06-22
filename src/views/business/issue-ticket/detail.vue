<template>
    <div class="detail-page">
        <el-card v-loading="loading" shadow="never">
            <div slot="header" class="card-header"><span>问题单详情</span></div>
            <el-descriptions v-if="record.id" :column="2" border>
                <el-descriptions-item label="问题标题">{{ formatValue(record.title) }}</el-descriptions-item>
                <el-descriptions-item label="项目名称">{{ formatValue(record.projectName) }}</el-descriptions-item>
                <el-descriptions-item label="问题来源">{{ formatSourceType(record.sourceType) }}</el-descriptions-item>
                <el-descriptions-item label="来源单据ID">{{ formatValue(record.sourceId) }}</el-descriptions-item>
                <el-descriptions-item label="问题描述" :span="2">{{
                    formatValue(record.description)
                }}</el-descriptions-item>
                <el-descriptions-item label="问题附件" :span="2">
                    <pre class="json-content">{{ formatJson(record.issueAttachments) }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="发现人">{{ formatValue(record.reportedByName) }}</el-descriptions-item>
                <el-descriptions-item label="发现时间">{{ formatValue(record.reportedAt) }}</el-descriptions-item>
                <el-descriptions-item label="分配人">{{ formatValue(record.assignedByName) }}</el-descriptions-item>
                <el-descriptions-item label="分配时间">{{ formatValue(record.assignedAt) }}</el-descriptions-item>
                <el-descriptions-item label="整改责任人">{{
                    formatValue(record.rectificationUserName)
                }}</el-descriptions-item>
                <el-descriptions-item label="整改截止时间">{{
                    formatValue(record.rectificationDeadline)
                }}</el-descriptions-item>
                <el-descriptions-item label="整改次数">{{
                    formatValue(record.rectificationCount)
                }}</el-descriptions-item>
                <el-descriptions-item label="整改提交时间">{{
                    formatValue(record.rectificationSubmittedAt)
                }}</el-descriptions-item>
                <el-descriptions-item label="整改说明" :span="2">{{
                    formatValue(record.rectificationDescription)
                }}</el-descriptions-item>
                <el-descriptions-item label="整改附件" :span="2">
                    <pre class="json-content">{{ formatJson(record.rectificationAttachments) }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="复验人">{{ formatValue(record.reviewUserName) }}</el-descriptions-item>
                <el-descriptions-item label="复验结果">{{
                    formatReviewResult(record.reviewResult)
                }}</el-descriptions-item>
                <el-descriptions-item label="复验说明" :span="2">{{
                    formatValue(record.reviewRemark)
                }}</el-descriptions-item>
                <el-descriptions-item label="复验附件" :span="2">
                    <pre class="json-content">{{ formatJson(record.reviewAttachments) }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="复验时间">{{ formatValue(record.reviewedAt) }}</el-descriptions-item>
                <el-descriptions-item label="关闭人">{{ formatValue(record.closedByName) }}</el-descriptions-item>
                <el-descriptions-item label="关闭时间">{{ formatValue(record.closedAt) }}</el-descriptions-item>
                <el-descriptions-item label="状态">{{ formatIssueStatus(record.status) }}</el-descriptions-item>
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
        formatSourceType(value) {
            if (value === null || value === undefined || value === '') return '-'
            switch (String(value)) {
                case '1':
                    return '施工日志'
                case '2':
                    return '验收单'
                case '3':
                    return '交接单'
                default:
                    return value
            }
        },
        formatReviewResult(value) {
            if (value === null || value === undefined || value === '') return '-'
            switch (String(value)) {
                case '1':
                    return '通过'
                case '2':
                    return '不通过'
                default:
                    return value
            }
        },
        formatIssueStatus(value) {
            if (value === null || value === undefined || value === '') return '-'
            switch (String(value)) {
                case '1':
                    return '待整改'
                case '2':
                    return '整改中'
                case '3':
                    return '待复验'
                case '4':
                    return '已关闭'
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
                let response = await this.$axios.get('issueTicket/queryById/' + this.$route.query.id)
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
