<template>
    <div v-loading="loading" class="detail-page">
            <el-descriptions v-if="record.id" class="detail-descriptions" :column="2" border>
                <el-descriptions-item label="问题标题">{{ formatValue(record.title) }}</el-descriptions-item>
                <el-descriptions-item label="项目名称">{{ formatValue(record.projectName) }}</el-descriptions-item>
                <el-descriptions-item label="问题来源">{{ formatSourceType(record.sourceType) }}</el-descriptions-item>
                <el-descriptions-item label="来源单据ID">{{ formatValue(record.sourceId) }}</el-descriptions-item>
                <el-descriptions-item label="问题描述" :span="2">{{
                    formatValue(record.description)
                }}</el-descriptions-item>
                <el-descriptions-item label="问题附件" :span="2">
                    <div v-if="issueAttachmentList.length" class="photo-wall">
                        <div v-for="(item, index) in issueAttachmentList" :key="item.url + index" class="attachment-item">
                            <el-image v-if="isImage(item)" class="photo-item" :src="item.url" :preview-src-list="issuePreviewImages" fit="cover">
                                <div slot="error" class="image-error"><i class="el-icon-picture-outline"></i></div>
                            </el-image>
                            <a v-else class="file-icon" :href="item.url" target="_blank"><i class="el-icon-document"></i></a>
                            <div class="attachment-info">
                                <a :href="item.url" target="_blank" :title="item.name">{{ item.name }}</a>
                                <span>{{ formatAttachmentMeta(item) }}</span>
                            </div>
                        </div>
                    </div>
                    <span v-else>-</span>
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
                    <div v-if="rectificationAttachmentList.length" class="photo-wall">
                        <div v-for="(item, index) in rectificationAttachmentList" :key="item.url + index" class="attachment-item">
                            <el-image v-if="isImage(item)" class="photo-item" :src="item.url" :preview-src-list="rectificationPreviewImages" fit="cover">
                                <div slot="error" class="image-error"><i class="el-icon-picture-outline"></i></div>
                            </el-image>
                            <a v-else class="file-icon" :href="item.url" target="_blank"><i class="el-icon-document"></i></a>
                            <div class="attachment-info">
                                <a :href="item.url" target="_blank" :title="item.name">{{ item.name }}</a>
                                <span>{{ formatAttachmentMeta(item) }}</span>
                            </div>
                        </div>
                    </div>
                    <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="复验人">{{ formatValue(record.reviewUserName) }}</el-descriptions-item>
                <el-descriptions-item label="复验结果">{{
                    formatReviewResult(record.reviewResult)
                }}</el-descriptions-item>
                <el-descriptions-item label="复验说明" :span="2">{{
                    formatValue(record.reviewRemark)
                }}</el-descriptions-item>
                <el-descriptions-item label="复验附件" :span="2">
                    <div v-if="reviewAttachmentList.length" class="photo-wall">
                        <div v-for="(item, index) in reviewAttachmentList" :key="item.url + index" class="attachment-item">
                            <el-image v-if="isImage(item)" class="photo-item" :src="item.url" :preview-src-list="reviewPreviewImages" fit="cover">
                                <div slot="error" class="image-error"><i class="el-icon-picture-outline"></i></div>
                            </el-image>
                            <a v-else class="file-icon" :href="item.url" target="_blank"><i class="el-icon-document"></i></a>
                            <div class="attachment-info">
                                <a :href="item.url" target="_blank" :title="item.name">{{ item.name }}</a>
                                <span>{{ formatAttachmentMeta(item) }}</span>
                            </div>
                        </div>
                    </div>
                    <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="复验时间">{{ formatValue(record.reviewedAt) }}</el-descriptions-item>
                <el-descriptions-item label="关闭人">{{ formatValue(record.closedByName) }}</el-descriptions-item>
                <el-descriptions-item label="关闭时间">{{ formatValue(record.closedAt) }}</el-descriptions-item>
                <el-descriptions-item label="状态">{{ formatIssueStatus(record.status) }}</el-descriptions-item>
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
        issueAttachmentList() {
            return this.parseAttachments(this.record.issueAttachments)
        },
        issuePreviewImages() {
            return this.issueAttachmentList.filter(this.isImage).map(item => item.url)
        },
        rectificationAttachmentList() {
            return this.parseAttachments(this.record.rectificationAttachments)
        },
        rectificationPreviewImages() {
            return this.rectificationAttachmentList.filter(this.isImage).map(item => item.url)
        },
        reviewAttachmentList() {
            return this.parseAttachments(this.record.reviewAttachments)
        },
        reviewPreviewImages() {
            return this.reviewAttachmentList.filter(this.isImage).map(item => item.url)
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
        parseAttachments(value) {
            return parseAttachmentArray(value)
        },
        isImage(item) {
            let type = String(item.type || '').toLowerCase()
            let path = String(item.name || item.url || '').toLowerCase().split('?')[0]
            return type.indexOf('image/') === 0 || /\.(png|jpe?g|gif|webp|bmp)$/.test(path)
        },
        formatAttachmentMeta(item) {
            let parts = []
            if (item.type) parts.push(item.type)
            if (item.size !== '' && item.size !== null && item.size !== undefined) {
                let size = Number(item.size)
                if (!Number.isNaN(size)) {
                    if (size >= 1024 * 1024) parts.push((size / 1024 / 1024).toFixed(2) + ' MB')
                    else if (size >= 1024) parts.push((size / 1024).toFixed(2) + ' KB')
                    else parts.push(size + ' B')
                } else parts.push(String(item.size))
            }
            return parts.join(' · ') || '附件'
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
.detail-descriptions {
    border-radius: 8px;
    overflow: hidden;
}
.photo-wall {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}
.attachment-item {
    width: 140px;
    min-width: 0;
}
.photo-item {
    width: 140px;
    height: 120px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    background: #f5f7fa;
}
.file-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 140px;
    height: 120px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    color: #909399;
    background: #f5f7fa;
    font-size: 40px;
}
.attachment-info {
    display: flex;
    flex-direction: column;
    margin-top: 6px;
    line-height: 20px;
}
.attachment-info a {
    overflow: hidden;
    color: #409eff;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.attachment-info span {
    overflow: hidden;
    color: #909399;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.image-error {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #c0c4cc;
    font-size: 28px;
}
</style>
