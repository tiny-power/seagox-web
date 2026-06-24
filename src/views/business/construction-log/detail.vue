<template>
    <div v-loading="loading" class="detail-page">
            <el-descriptions v-if="record.id" class="detail-descriptions" :column="2" border>
                <el-descriptions-item label="项目名称">{{ formatValue(record.projectName) }}</el-descriptions-item>
                <el-descriptions-item label="项目编号">{{ formatValue(record.projectCode) }}</el-descriptions-item>
                <el-descriptions-item label="项目阶段">{{ formatValue(record.stageName) }}</el-descriptions-item>
                <el-descriptions-item label="日志日期">{{ formatDate(record.logDate) }}</el-descriptions-item>
                <el-descriptions-item label="填写人">{{ formatValue(record.filledByName) }}</el-descriptions-item>
                <el-descriptions-item label="预计完成时间">{{
                    formatDate(record.expectedCompletionAt)
                }}</el-descriptions-item>
                <el-descriptions-item label="今日工作内容" :span="2">{{
                    formatValue(record.currentProgressSummary)
                }}</el-descriptions-item>
                <el-descriptions-item label="存在现场问题">{{ formatBoolean(record.hasIssue) }}</el-descriptions-item>
                <el-descriptions-item label="状态">{{ formatConstructionStatus(record.status) }}</el-descriptions-item>
                <el-descriptions-item label="明日计划" :span="2">{{
                    formatValue(record.nextDayPlan)
                }}</el-descriptions-item>
                <el-descriptions-item label="需要协调事项" :span="2">
                    <pre class="json-content">{{ formatJson(record.siteIssues) }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="配合人员" :span="2">
                    <div v-if="assistantList.length" class="assistant-list">
                        <el-tag v-for="(item, index) in assistantList" :key="index" size="small" effect="plain">
                            {{ item }}
                        </el-tag>
                    </div>
                    <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="附件" :span="2">
                    <div v-if="attachmentImages.length" class="photo-wall">
                        <el-image
                            v-for="(item, index) in attachmentImages"
                            :key="item.url + index"
                            class="photo-item"
                            :src="item.url"
                            :preview-src-list="previewImages"
                            fit="cover"
                        >
                            <div slot="error" class="image-error">
                                <i class="el-icon-picture-outline"></i>
                            </div>
                        </el-image>
                    </div>
                    <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="提交时间">{{ formatValue(record.submittedAt) }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ formatValue(record.createdAt) }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ formatValue(record.updatedAt) }}</el-descriptions-item>
            </el-descriptions>
            <el-empty v-else-if="!loading" description="暂无详情数据" />
    </div>
</template>

<script>
import { parseAttachmentArray } from '@/utils/attachments'

export default {
    data() {
        return { loading: false, record: {} }
    },
    computed: {
        assistantList() {
            return this.parseAssistants(this.record.assistants || this.record.contacts)
        },
        attachmentImages() {
            return this.parseAttachments(this.record.attachments || this.record.photos)
        },
        previewImages() {
            return this.attachmentImages.map(item => item.url)
        }
    },
    created() {
        this.load()
    },
    methods: {
        formatValue(value) {
            return value === null || value === undefined || value === '' ? '-' : value
        },
        formatDate(value) {
            if (value === null || value === undefined || value === '') return '-'
            return String(value).substring(0, 10)
        },
        formatBoolean(value) {
            if (value === null || value === undefined || value === '') return '-'
            return Number(value) === 1 ? '是' : '否'
        },
        formatMoney(value) {
            if (value === null || value === undefined || value === '') return '-'
            return '¥' + Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        },
        formatConstructionStatus(value) {
            if (value === null || value === undefined || value === '') return '-'
            switch (String(value)) {
                case '1':
                    return '已提交'
                case '2':
                    return '草稿'
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
        parseJsonValue(value) {
            if (value === null || value === undefined || value === '') return null
            if (typeof value !== 'string') return value
            try {
                return JSON.parse(value)
            } catch (e) {
                return value
            }
        },
        parseAssistants(value) {
            let data = this.parseJsonValue(value)
            if (data === null || data === undefined || data === '') return []
            if (!Array.isArray(data)) data = [data]
            return data
                .map(item => {
                    if (item === null || item === undefined || item === '') return ''
                    if (typeof item === 'string') return item
                    return item.name || item.userName || item.nickName || item.realName || item.label || item.value || ''
                })
                .filter(Boolean)
        },
        parseAttachments(value) {
            return parseAttachmentArray(value)
        },
        async load() {
            if (!this.$route.query.id) return
            this.loading = true
            try {
                let response = await this.$axios.get('constructionLog/queryById/' + this.$route.query.id)
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
.detail-descriptions {
    border-radius: 8px;
    overflow: hidden;
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
.assistant-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
.photo-wall {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}
.photo-item {
    width: 120px;
    height: 120px;
    border: 1px solid #ebeef5;
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
    font-size: 26px;
}
</style>
