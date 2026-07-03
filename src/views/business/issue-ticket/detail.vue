<template>
    <div v-loading="loading" class="detail-page">
        <template v-if="record.id">
            <div class="detail-section">
                <div class="field-grid">
                    <div class="field-card">
                        <div class="field-label">问题标题</div>
                        <div class="field-value">{{ formatValue(record.title) }}</div>
                    </div>
                    <div class="field-card">
                        <div class="field-label">项目名称</div>
                        <div class="field-value">{{ formatValue(record.projectName) }}</div>
                    </div>
                    <div class="field-card full">
                        <div class="field-label">问题描述</div>
                        <div class="field-value multiline">{{ formatValue(record.description) }}</div>
                    </div>
                    <div class="field-card">
                        <div class="field-label">负责人</div>
                        <div class="field-value">{{ formatValue(record.assigneeName) }}</div>
                    </div>
                    <div class="field-card">
                        <div class="field-label">截止日期</div>
                        <div class="field-value">{{ formatDateOnly(record.dueDate) }}</div>
                    </div>
                    <div class="field-card full">
                        <div class="field-label">现场照片 / 视频</div>
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
                        <span v-else class="empty-value">-</span>
                    </div>
                </div>
            </div>

            <div class="detail-section timeline-section">
                <div class="section-title">历史记录</div>
                <el-empty v-if="!historyLogs.length" description="暂无历史记录" />
                <div v-else class="timeline">
                    <div
                        v-for="(item, index) in historyLogs"
                        :key="item.id"
                        class="timeline-item"
                        :class="{ first: index === 0, last: index === historyLogs.length - 1 }"
                    >
                        <div class="timeline-rail">
                            <div class="timeline-line"></div>
                            <div class="timeline-dot"></div>
                        </div>
                        <div class="timeline-content">
                            <div class="timeline-summary">{{ item.summary }}</div>
                            <div v-if="item.description" class="timeline-description">{{ item.description }}</div>
                            <div v-if="item.attachments.length" class="photo-wall timeline-attachments">
                                <div v-for="(attachment, attachmentIndex) in item.attachments" :key="attachment.url + attachmentIndex" class="attachment-item">
                                    <el-image v-if="isImage(attachment)" class="photo-item" :src="attachment.url" :preview-src-list="item.previewImages" fit="cover">
                                        <div slot="error" class="image-error"><i class="el-icon-picture-outline"></i></div>
                                    </el-image>
                                    <a v-else class="file-icon" :href="attachment.url" target="_blank"><i class="el-icon-document"></i></a>
                                    <div class="attachment-info">
                                        <a :href="attachment.url" target="_blank" :title="attachment.name">{{ attachment.name }}</a>
                                        <span>{{ formatAttachmentMeta(attachment) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <el-empty v-else-if="!loading" description="暂无详情数据" />
    </div>
</template>

<script>
import { parseAttachmentArray } from '@/utils/attachments'

const ACTION_TEXT = {
    activated: '激活',
    assigned: '指派',
    confirmed: '确认',
    closed: '关闭',
    edited: '编辑',
    resolved: '解决'
}

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
        historyLogs() {
            let logs = Array.isArray(this.record.operationLogs) ? this.record.operationLogs : []
            return logs.map(log => {
                let extra = this.parseExtra(log.extra)
                let attachments = this.parseAttachments(extra.attachments)
                let actor = log.actorName || log.actor_name || '未知人员'
                let createdAt = log.createdAt || log.created_at || ''
                let assigneeName = extra.assigneeName || extra.assignee_name || extra.assignee || ''
                let resolution = extra.resolution || ''
                let isCreate = log.action === 'activated' && !Object.keys(extra).length
                let actionText = isCreate ? '创建' : (ACTION_TEXT[log.action] || log.action || '操作')
                let summary = `${this.formatDateTime(createdAt)}, 由 ${actor} ${actionText}。`

                if (log.action === 'assigned' && assigneeName) {
                    summary = `${this.formatDateTime(createdAt)}, 由 ${actor} 指派给 ${assigneeName}。`
                } else if (log.action === 'resolved') {
                    summary = resolution
                        ? `${this.formatDateTime(createdAt)}, 由 ${actor} 解决，方案为 ${resolution} 。`
                        : `${this.formatDateTime(createdAt)}, 由 ${actor} 解决。`
                }

                return {
                    id: String(log.id || `${log.action}-${createdAt}`),
                    summary,
                    description: isCreate ? '' : (log.comment || ''),
                    attachments,
                    previewImages: attachments.filter(this.isImage).map(item => item.url)
                }
            })
        }
    },
    created() {
        this.load()
    },
    methods: {
        formatValue(value) {
            return value === null || value === undefined || value === '' ? '-' : value
        },
        formatDateOnly(value) {
            if (value === null || value === undefined || value === '') return '-'
            return String(value).split(' ')[0]
        },
        formatDateTime(value) {
            if (value === null || value === undefined || value === '') return '-'
            return String(value).replace('T', ' ').slice(0, 19)
        },
        parseExtra(value) {
            if (!value) return {}
            if (typeof value === 'object') return value
            try {
                return JSON.parse(value)
            } catch (error) {
                return {}
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
    box-sizing: border-box;
    height: 100%;
    padding: 20px;
    overflow: auto;
    background: #f5f7fa;
}
.detail-section {
    margin-bottom: 16px;
    padding: 18px;
    border-radius: 8px;
    background: #fff;
}
.field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
}
.field-card {
    min-width: 0;
    padding: 14px;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    background: #fff;
}
.field-card.full {
    grid-column: 1 / -1;
}
.field-label {
    margin-bottom: 8px;
    color: #606266;
    font-size: 13px;
}
.field-value {
    color: #303133;
    font-size: 14px;
    line-height: 22px;
    word-break: break-word;
}
.field-value.multiline {
    min-height: 22px;
    white-space: pre-wrap;
}
.section-title {
    margin-bottom: 14px;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
}
.timeline {
    padding: 2px 0;
}
.timeline-item {
    position: relative;
    display: flex;
    min-height: 62px;
}
.timeline-rail {
    position: relative;
    width: 26px;
    flex: none;
}
.timeline-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 7px;
    width: 2px;
    background: #dcdfe6;
}
.timeline-item.first .timeline-line {
    top: 9px;
}
.timeline-item.last .timeline-line {
    bottom: calc(100% - 9px);
}
.timeline-dot {
    position: absolute;
    top: 5px;
    left: 3px;
    width: 10px;
    height: 10px;
    border: 2px solid #409eff;
    border-radius: 50%;
    background: #fff;
}
.timeline-content {
    flex: 1;
    min-width: 0;
    padding: 0 0 18px 2px;
}
.timeline-summary {
    color: #303133;
    font-size: 14px;
    line-height: 22px;
    word-break: break-word;
}
.timeline-description {
    margin-top: 8px;
    color: #606266;
    line-height: 22px;
    white-space: pre-wrap;
    word-break: break-word;
}
.timeline-attachments {
    margin-top: 10px;
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
.attachment-info span,
.empty-value {
    color: #909399;
    font-size: 12px;
}
.attachment-info span {
    overflow: hidden;
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
@media (max-width: 900px) {
    .field-grid {
        grid-template-columns: 1fr;
    }
}
</style>
