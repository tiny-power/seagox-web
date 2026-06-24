<template>
    <div v-loading="loading" class="detail-page">
            <el-descriptions v-if="record.id" class="detail-descriptions" :column="2" border>
                <el-descriptions-item label="项目名称">{{ formatValue(record.projectName) }}</el-descriptions-item>
                <el-descriptions-item label="项目编号">{{ formatValue(record.projectCode) }}</el-descriptions-item>
                <el-descriptions-item label="项目阶段">{{ formatValue(record.stageName) }}</el-descriptions-item>
                <el-descriptions-item label="计划验收时间">{{
                    formatValue(record.planInspectionTime)
                }}</el-descriptions-item>
                <el-descriptions-item label="状态">{{ formatInspectionStatus(record.status) }}</el-descriptions-item>
                <el-descriptions-item label="通过时间">{{ formatValue(record.passedAt) }}</el-descriptions-item>
                <el-descriptions-item label="验收条目" :span="2">
                    <div v-if="inspectionItemList.length" class="item-list">
                        <div v-for="(item, index) in inspectionItemList" :key="item.id + '-' + index" class="item-row">
                            <span class="item-index">{{ index + 1 }}</span>
                            <span class="item-title">{{ item.title }}</span>
                            <el-tag size="mini" :type="getItemStatusType(item.status)" effect="plain">
                                {{ formatItemStatus(item.status, item.statusText) }}
                            </el-tag>
                        </div>
                    </div>
                    <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="现场照片" :span="2">
                    <div v-if="sitePhotoList.length" class="photo-wall">
                        <el-image
                            v-for="(item, index) in sitePhotoList"
                            :key="item.url + index"
                            class="photo-item"
                            :src="item.url"
                            :preview-src-list="sitePhotoPreviewImages"
                            fit="cover"
                        >
                            <div slot="error" class="image-error">
                                <i class="el-icon-picture-outline"></i>
                            </div>
                        </el-image>
                    </div>
                    <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="参与人员" :span="2">
                    <div v-if="participantList.length" class="tag-list">
                        <el-tag v-for="(item, index) in participantList" :key="index" size="small" effect="plain">
                            {{ item }}
                        </el-tag>
                    </div>
                    <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="签字信息" :span="2">
                    <div v-if="signatureList.length" class="signature-list">
                        <div v-for="(item, index) in signatureList" :key="item.name + index" class="signature-row">
                            <div class="signature-info">
                                <span class="signature-name">{{ item.name }}</span>
                                <span class="signature-role">{{ item.role }}</span>
                                <span v-if="item.signedAt" class="signature-time">{{ item.signedAt }}</span>
                            </div>
                            <el-image
                                v-if="item.url"
                                class="signature-image"
                                :src="item.url"
                                :preview-src-list="signaturePreviewImages"
                                fit="cover"
                            >
                                <div slot="error" class="image-error">
                                    <i class="el-icon-picture-outline"></i>
                                </div>
                            </el-image>
                        </div>
                    </div>
                    <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="验收意见" :span="2">{{
                    formatValue(record.acceptanceComments)
                }}</el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">{{ formatValue(record.remark) }}</el-descriptions-item>
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
        inspectionItemList() {
            return this.parseInspectionItems(this.record.inspectionItems || this.record.items)
        },
        sitePhotoList() {
            return this.parseAttachments(this.record.sitePhotos || this.record.photos)
        },
        sitePhotoPreviewImages() {
            return this.sitePhotoList.map(item => item.url)
        },
        participantList() {
            return this.parsePeople(this.record.participants)
        },
        signatureList() {
            return this.parseSignatures(this.record.signatures)
        },
        signaturePreviewImages() {
            return this.signatureList.filter(item => item.url).map(item => item.url)
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
        formatInspectionStatus(value) {
            if (value === null || value === undefined || value === '') return '-'
            switch (String(value)) {
                case '1':
                    return '待验收'
                case '2':
                    return '验收中'
                case '3':
                    return '已完成'
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
        toArray(value) {
            let data = this.parseJsonValue(value)
            if (data === null || data === undefined || data === '') return []
            return Array.isArray(data) ? data : [data]
        },
        getPersonName(item) {
            if (item === null || item === undefined || item === '') return ''
            if (typeof item === 'string') return item
            return item.name || item.userName || item.nickName || item.realName || item.label || item.value || ''
        },
        parsePeople(value) {
            return this.toArray(value).map(item => {
                if (typeof item === 'string') return item
                let name = this.getPersonName(item)
                return item.role && name ? name + '（' + item.role + '）' : name
            }).filter(Boolean)
        },
        parseInspectionItems(value) {
            return this.toArray(value).map((item, index) => {
                if (typeof item === 'string') {
                    return { id: item, title: item, status: '', statusText: '' }
                }
                let title = item.title || item.label || item.name || item.inspectionName || item.value || ''
                return {
                    id: item.id || item.value || title || index + 1,
                    title: title || '-',
                    status: item.status,
                    statusText: item.statusText
                }
            }).filter(item => item.title)
        },
        parseAttachments(value) {
            return parseAttachmentArray(value)
        },
        parseSignatures(value) {
            return this.toArray(value).map((item, index) => {
                if (typeof item === 'string') {
                    return { name: '签字人' + (index + 1), role: '验收人', signedAt: '', url: item }
                }
                return {
                    name: this.getPersonName(item) || '签字人' + (index + 1),
                    role: item.role || '验收人',
                    signedAt: item.signedAt || item.time || item.signatureTime || '',
                    url: item.signaturePath || item.path || item.url || item.fileUrl || ''
                }
            })
        },
        formatItemStatus(value, statusText) {
            if (statusText) return statusText
            if (value === null || value === undefined || value === '') return '待验收'
            switch (String(value)) {
                case 'completed':
                case '3':
                    return '已完成'
                case 'passed':
                    return '已通过'
                case 'rectifying':
                    return '待整改'
                case 'checking':
                case 'processing':
                case '2':
                    return '验收中'
                case 'pending':
                case '1':
                default:
                    return '待验收'
            }
        },
        getItemStatusType(value) {
            switch (String(value)) {
                case 'completed':
                case 'passed':
                case '3':
                    return 'success'
                case 'rectifying':
                    return 'warning'
                case 'checking':
                case 'processing':
                case '2':
                    return ''
                default:
                    return 'info'
            }
        },
        async load() {
            if (!this.$route.query.id) return
            this.loading = true
            try {
                let response = await this.$axios.get('inspection/queryById/' + this.$route.query.id)
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
    padding: 12px;
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
.item-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.item-row {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 30px;
}
.item-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    color: #606266;
    background: #f0f2f5;
    font-size: 12px;
    font-weight: 600;
    flex: none;
}
.item-title {
    min-width: 0;
    flex: 1;
    color: #303133;
}
.tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
.photo-wall {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}
.photo-item,
.signature-image {
    width: 120px;
    height: 120px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    background: #f5f7fa;
}
.signature-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.signature-row {
    display: flex;
    align-items: center;
    gap: 16px;
}
.signature-info {
    display: flex;
    flex-direction: column;
    min-width: 160px;
    line-height: 1.7;
}
.signature-name {
    color: #303133;
    font-weight: 600;
}
.signature-role,
.signature-time {
    color: #909399;
    font-size: 12px;
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
