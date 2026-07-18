<template>
    <div v-loading="loading" class="design-case-detail-page">
        <template v-if="record.id">
            <el-image class="detail-cover" :src="record.coverUrl" fit="cover" />
            <el-descriptions :column="3" border>
                <el-descriptions-item label="案例标题" :span="3">{{ record.title }}</el-descriptions-item>
                <el-descriptions-item label="城市"
                    >{{ record.provinceName }}.{{ record.cityName }}</el-descriptions-item
                >
                <el-descriptions-item label="地区">{{ record.regionText }}</el-descriptions-item>
                <el-descriptions-item label="屋顶">{{ record.roofType }}</el-descriptions-item>
                <el-descriptions-item label="风格" :span="3">
                    <el-tag v-for="item in parseArray(record.styleList)" :key="item" size="mini" class="tag-item">{{
                        item
                    }}</el-tag>
                </el-descriptions-item>
            </el-descriptions>
            <div class="ql-snow">
                <div class="ql-editor detail-rich" v-html="summaryHtml"></div>
            </div>
        </template>
    </div>
</template>

<script>
import 'quill/dist/quill.snow.css'

export default {
    data() {
        return { loading: false, record: {} }
    },
    computed: {
        summaryHtml() {
            const value = this.record.summary
            if (!value) return ''
            try {
                const data = typeof value === 'string' ? JSON.parse(value) : value
                return data.html || ''
            } catch (error) {
                return value
            }
        }
    },
    created() {
        this.load()
    },
    methods: {
        parseArray(value) {
            if (Array.isArray(value)) return value
            if (!value) return []
            try {
                return JSON.parse(value) || []
            } catch (error) {
                return []
            }
        },
        async load() {
            if (!this.$route.query.id) return
            this.loading = true
            try {
                const response = await this.$axios.get('designCase/queryById/' + this.$route.query.id)
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
.design-case-detail-page {
    display: grid;
    gap: 16px;
    padding: 20px;
}
.detail-cover {
    width: 100%;
    height: 300px;
    border-radius: 6px;
}
.tag-item {
    margin-right: 6px;
}
.detail-rich {
    min-height: 260px;
    padding: 0;
}
</style>
