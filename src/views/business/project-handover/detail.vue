<template>
    <div v-loading="loading" class="detail-page">
            <el-descriptions v-if="record.id" class="detail-descriptions" :column="2" border>
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
                <el-descriptions-item v-if="assistantList.length" label="配合人员" :span="2">
                    <div class="assistant-list">
                        <el-tag v-for="(item, index) in assistantList" :key="index" size="small" effect="plain">
                            {{ item }}
                        </el-tag>
                    </div>
                </el-descriptions-item>
                <el-descriptions-item label="交接内容" :span="2">{{
                    formatValue(record.handoverContent)
                }}</el-descriptions-item>
                <el-descriptions-item label="移交方签字文件" :span="2">
                    <div v-if="handoverSignatureImages.length" class="photo-wall">
                        <el-image
                            v-for="(item, index) in handoverSignatureImages"
                            :key="item.url + index"
                            class="photo-item"
                            :src="item.url"
                            :preview-src-list="handoverSignaturePreviewImages"
                            fit="cover"
                        >
                            <div slot="error" class="image-error">
                                <i class="el-icon-picture-outline"></i>
                            </div>
                        </el-image>
                    </div>
                    <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="接收方签字文件" :span="2">
                    <div v-if="receiverSignatureImages.length" class="photo-wall">
                        <el-image
                            v-for="(item, index) in receiverSignatureImages"
                            :key="item.url + index"
                            class="photo-item"
                            :src="item.url"
                            :preview-src-list="receiverSignaturePreviewImages"
                            fit="cover"
                        >
                            <div slot="error" class="image-error">
                                <i class="el-icon-picture-outline"></i>
                            </div>
                        </el-image>
                    </div>
                    <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="移交方签字时间">{{
                    formatValue(record.handoverSignedAt)
                }}</el-descriptions-item>
                <el-descriptions-item label="接收方签字时间">{{
                    formatValue(record.receiverSignedAt)
                }}</el-descriptions-item>
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
            return this.parseAssistants(this.record.assistants || this.record.contacts || this.record.cooperators)
        },
        attachmentImages() {
            return this.parseAttachments(this.record.attachment || this.record.attachments)
        },
        previewImages() {
            return this.attachmentImages.map(item => item.url)
        },
        handoverSignatureImages() {
            return this.parseAttachments(
                this.getFirstAvailable([
                    this.record.handoverSignatureUrl,
                    this.record.handover_signature_url,
                    this.record.handoverSignature,
                    this.record.handoverSignUrl,
                    this.record.handoverSignaturePath
                ])
            )
        },
        handoverSignaturePreviewImages() {
            return this.handoverSignatureImages.map(item => item.url)
        },
        receiverSignatureImages() {
            return this.parseAttachments(
                this.getFirstAvailable([
                    this.record.receiverSignatureUrl,
                    this.record.receiver_signature_url,
                    this.record.receiverSignature,
                    this.record.receiverSignUrl,
                    this.record.receiverSignaturePath
                ])
            )
        },
        receiverSignaturePreviewImages() {
            return this.receiverSignatureImages.map(item => item.url)
        }
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
        parseJsonValue(value) {
            if (value === null || value === undefined || value === '') return null
            if (typeof value !== 'string') return value
            try {
                return JSON.parse(value)
            } catch (e) {
                return value
            }
        },
        getFirstAvailable(values) {
            return values.find(value => value !== null && value !== undefined && value !== '')
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
