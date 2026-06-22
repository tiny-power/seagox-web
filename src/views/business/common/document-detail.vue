<template>
  <div class="detail-page">
    <el-card v-loading="loading" shadow="never">
      <div slot="header" class="card-header">
        <span>{{ config.title }}详情</span>
      </div>
      <el-descriptions v-if="record.id" :column="2" border>
        <el-descriptions-item
          v-for="item in config.fields"
          :key="item.prop"
          :label="item.label"
          :span="item.span || 1"
        >
          <pre v-if="item.type === 'json'" class="json-content">{{
            formatJson(record[item.prop])
          }}</pre>
          <span v-else>{{ display(record[item.prop], item) }}</span>
        </el-descriptions-item>
      </el-descriptions>
      <el-empty v-else-if="!loading" description="暂无详情数据" />
    </el-card>
  </div>
</template>

<script>
import { displayValue } from "./document-config";

export default {
  props: {
    config: { type: Object, required: true },
  },
  data() {
    return { loading: false, record: {} };
  },
  created() {
    this.load();
  },
  methods: {
    display(value, definition) {
      return displayValue(value, definition);
    },
    formatJson(value) {
      if (value === null || value === undefined || value === "") return "-";
      try {
        let data = typeof value === "string" ? JSON.parse(value) : value;
        return JSON.stringify(data, null, 2);
      } catch (e) {
        return String(value);
      }
    },
    async load() {
      if (!this.$route.query.id) return;
      this.loading = true;
      try {
        let response = await this.$axios.get(
          this.config.api + "/queryById/" + this.$route.query.id
        );
        if (response.data.code === 200) this.record = response.data.data || {};
        else this.$message.error(response.data.message || "查询失败");
      } finally {
        this.loading = false;
      }
    },
  },
};
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
