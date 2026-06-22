<template>
  <div class="document-page">
    <el-card shadow="never">
      <div slot="header" class="card-header">
        <span>{{ config.title }}</span>
      </div>
      <el-form
        :inline="true"
        :model="query"
        class="filter-form"
        @submit.native.prevent
      >
        <el-form-item
          v-for="item in config.filters"
          :key="item.prop"
          :label="item.label"
        >
          <el-select
            v-if="item.type === 'select'"
            v-model="query[item.prop]"
            clearable
            filterable
            :placeholder="'请选择' + item.label"
          >
            <el-option
              v-for="option in item.options"
              :key="option.value"
              v-bind="option"
            />
          </el-select>
          <el-date-picker
            v-else-if="item.type === 'daterange'"
            v-model="query[item.prop]"
            type="daterange"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
          <el-input
            v-else
            v-model.trim="query[item.prop]"
            clearable
            :placeholder="'请输入' + item.label"
            @keyup.enter.native="search"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="search"
            >查询</el-button
          >
          <el-button icon="el-icon-refresh" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table
        v-loading="loading"
        :data="rows"
        :row-style="{ cursor: 'pointer' }"
        border
        stripe
        @row-dblclick="view"
      >
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column
          v-for="column in config.columns"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          align="center"
          header-align="center"
          show-overflow-tooltip
        >
          <template slot-scope="scope">{{
            display(scope.row[column.prop], column)
          }}</template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :current-page="query.pageNo"
        :page-size="query.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        @current-change="pageChange"
        @size-change="sizeChange"
      />
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
    return { loading: false, rows: [], total: 0, query: this.createQuery() };
  },
  created() {
    this.load();
  },
  methods: {
    createQuery() {
      let query = { pageNo: 1, pageSize: 10 };
      this.config.filters.forEach((item) =>
        this.$set(query, item.prop, item.type === "daterange" ? [] : "")
      );
      return query;
    },
    display(value, definition) {
      return displayValue(value, definition);
    },
    buildParams() {
      let params = { ...this.query };
      let dateFilter = this.config.filters.find(
        (item) => item.type === "daterange"
      );
      if (dateFilter) {
        let range = params[dateFilter.prop] || [];
        params.startDate = range[0] || "";
        params.endDate = range[1] || "";
        delete params[dateFilter.prop];
      }
      return params;
    },
    async load() {
      this.loading = true;
      try {
        let response = await this.$axios.get(this.config.api + "/queryByPage", {
          params: this.buildParams(),
        });
        if (response.data.code === 200) {
          let data = response.data.data || {};
          this.rows = data.list || [];
          this.total = data.total || 0;
        } else {
          this.$message.error(response.data.message || "查询失败");
        }
      } finally {
        this.loading = false;
      }
    },
    search() {
      this.query.pageNo = 1;
      this.load();
    },
    reset() {
      this.query = this.createQuery();
      this.load();
    },
    pageChange(pageNo) {
      this.query.pageNo = pageNo;
      this.load();
    },
    sizeChange(pageSize) {
      this.query.pageSize = pageSize;
      this.query.pageNo = 1;
      this.load();
    },
    view(row) {
      this.$router.push({
        path: this.config.detailPath,
        query: { id: row.id },
      });
    },
  },
};
</script>

<style scoped>
.document-page {
  padding: 20px;
}
.card-header {
  font-size: 16px;
  font-weight: 600;
}
.filter-form {
  margin-bottom: 4px;
}
.filter-form .el-input,
.filter-form .el-select {
  width: 170px;
}
.filter-form .el-date-editor {
  width: 250px;
}
.el-pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
