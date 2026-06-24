<template>
    <div v-loading="loading" class="detail-page">
            <el-descriptions v-if="record.id" class="detail-descriptions" :column="2" border>
                <el-descriptions-item label="项目名称">{{ formatValue(record.projectName) }}</el-descriptions-item>
                <el-descriptions-item label="项目编号">{{ formatValue(record.projectCode) }}</el-descriptions-item>
                <el-descriptions-item label="材料名称">{{ formatValue(record.name) }}</el-descriptions-item>
                <el-descriptions-item label="到场时间">{{ formatValue(record.arrivalAt) }}</el-descriptions-item>
                <el-descriptions-item label="登记人">{{ formatValue(record.createdByName) }}</el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">{{ formatValue(record.remark) }}</el-descriptions-item>
                <el-descriptions-item label="照片" :span="2">
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
                <el-descriptions-item label="登记时间">{{ formatValue(record.createdAt) }}</el-descriptions-item>
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
        attachmentImages() {
            return this.parseAttachments(this.record.attachments)
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
        parseAttachments(value) {
            return parseAttachmentArray(value)
        },
        async load() {
            if (!this.$route.query.id) return
            this.loading = true
            try {
                let response = await this.$axios.get('materialArrival/queryById/' + this.$route.query.id)
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
