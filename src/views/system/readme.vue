<template>
    <div class="dashboard-page" v-loading="loading">
        <div class="metric-grid">
            <el-card class="metric-card" v-for="item in metrics" :key="item.type" shadow="never">
                <div class="metric-icon" :class="'metric-icon-' + item.type">
                    <i :class="metricIcon(item.type)"></i>
                </div>
                <div class="metric-main">
                    <div class="metric-title">{{ item.title }}</div>
                    <div class="metric-value">
                        <span>{{ item.value }}</span>
                        <em>{{ item.unit }}</em>
                    </div>
                    <div class="metric-compare">
                        <span>较上月</span>
                        <strong :class="{ negative: item.compare < 0 }">{{ formatCompare(item.compare) }}</strong>
                    </div>
                </div>
            </el-card>
        </div>

        <div class="dashboard-grid">
            <el-card class="panel health-panel" shadow="never">
                <div class="panel-head">
                    <h3>项目健康分布</h3>
                </div>
                <div class="health-body">
                    <div ref="healthChart" class="health-chart"></div>
                </div>
            </el-card>

            <el-card class="panel warning-panel" shadow="never">
                <div class="panel-head">
                    <h3>节点逾期预警 <span>（近7天）</span></h3>
                    <button type="button" @click="go('/inspection')">更多 <i class="el-icon-arrow-right"></i></button>
                </div>
                <div class="table-list" v-if="overdueWarnings.length">
                    <div class="table-row" v-for="(item, index) in overdueWarnings" :key="index">
                        <div class="project-name">{{ item.projectName }}</div>
                        <div class="node-name">{{ item.nodeName }}</div>
                        <div class="danger-text">逾期{{ item.overdueDays }}天</div>
                    </div>
                </div>
                <div class="empty-block" v-else>暂无逾期预警</div>
            </el-card>

            <el-card class="panel log-panel" shadow="never">
                <div class="panel-head">
                    <h3>施工日志填写率 <span>（近7天）</span></h3>
                </div>
                <el-table
                    class="log-table"
                    :data="constructionLogReport.lateItems"
                    :empty-text="constructionLogReport.expected ? '暂无未及时填报' : '暂无应填报人员'"
                    size="medium"
                    border
                    max-height="220"
                >
                    <el-table-column prop="projectName" label="项目" min-width="130" align="center" header-align="center" show-overflow-tooltip/>
                    <el-table-column label="人员" min-width="120" align="center" header-align="center" show-overflow-tooltip>
                        <template slot-scope="scope">
                            {{ scope.row.userName }} · {{ scope.row.roleName }}
                        </template>
                    </el-table-column>
                    <el-table-column label="填报情况" width="130" align="center" header-align="center">
                        <template slot-scope="scope">
                            {{ scope.row.submitted }}/{{ scope.row.expected }}（{{ scope.row.rate }}%）
                        </template>
                    </el-table-column>
                    <el-table-column prop="lastLateDate" label="最近未填" width="110" align="center" header-align="center" />
                </el-table>
            </el-card>

            <el-card class="panel reminder-panel" shadow="never">
                <div class="panel-head">
                    <h3>今日待办提醒</h3>
                </div>
                <div class="reminder-list">
                    <div class="reminder-row" v-for="(item, index) in reminders" :key="index">
                        <span class="reminder-dot" :class="'dot-' + item.color"></span>
                        <span>{{ item.text }}</span>
                    </div>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            loading: false,
            healthChart: null,
            metrics: [],
            health: {
                total: 0,
                items: []
            },
            overdueWarnings: [],
            constructionLogReport: {
                rate: 0,
                submitted: 0,
                expected: 0,
                lateItems: []
            },
            reminders: []
        }
    },
    mounted() {
        this.loadDashboard()
        window.addEventListener('resize', this.resizeCharts)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeCharts)
        if (this.healthChart) this.healthChart.dispose()
    },
    methods: {
        loadDashboard() {
            this.loading = true
            this.$axios
                .get('dashboard/home', {
                    params: {
                        companyId: localStorage.getItem('companyId'),
                        userId: localStorage.getItem('userId')
                    }
                })
                .then(response => {
                    if (response.data.code === 200) {
                        this.applyDashboard(response.data.data || {})
                    } else {
                        this.$message.error(response.data.message || '首页数据加载失败')
                    }
                })
                .catch(() => {
                    this.$message.error('首页数据加载失败')
                })
                .finally(() => {
                    this.loading = false
                })
        },
        applyDashboard(data) {
            this.metrics = data.metrics || []
            this.health = Object.assign({ total: 0, items: [] }, data.health || {})
            this.overdueWarnings = data.overdueWarnings || []
            this.constructionLogReport = Object.assign(
                { rate: 0, submitted: 0, expected: 0, lateItems: [] },
                data.constructionLogReport || {}
            )
            this.reminders = data.reminders || []
            this.$nextTick(() => {
                this.renderHealthChart()
            })
        },
        renderHealthChart() {
            if (!this.$refs.healthChart) return
            if (!this.healthChart) this.healthChart = this.$echarts.init(this.$refs.healthChart)
            const items = this.health.items || []
            this.healthChart.setOption({
                tooltip: { trigger: 'item' },
                legend: {
                    top: 0,
                    left: 'center',
                    itemWidth: 12,
                    itemHeight: 12,
                    textStyle: {
                        color: '#111827',
                        fontSize: 14
                    }
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['48%', '70%'],
                        center: ['50%', '58%'],
                        avoidLabelOverlap: true,
                        label: {
                            show: true,
                            formatter: '{d}%',
                            color: '#111827',
                            fontSize: 14,
                            fontWeight: 700
                        },
                        labelLine: {
                            show: true,
                            length: 10,
                            length2: 6
                        },
                        data: items.map(item => ({
                            name: item.name,
                            value: item.value,
                            itemStyle: { color: item.color }
                        }))
                    }
                ]
            })
        },
        resizeCharts() {
            if (this.healthChart) this.healthChart.resize()
        },
        metricIcon(type) {
            const icons = {
                building: 'el-icon-office-building',
                new: 'el-icon-document-checked',
                warning: 'el-icon-warning-outline',
                approval: 'el-icon-finished'
            }
            return icons[type] || 'el-icon-data-analysis'
        },
        formatCompare(value) {
            const number = Number(value || 0)
            return (number >= 0 ? '+' : '') + number
        },
        go(path) {
            this.$router.push(path)
        }
    }
}
</script>

<style scoped>
.dashboard-page {
    min-height: 100%;
    padding: 18px;
    box-sizing: border-box;
    background: #f5f7fb;
    color: #0f172a;
}

.metric-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(180px, 1fr));
    gap: 22px;
}

.metric-card {
    min-height: 146px;
    border-color: #e8edf5;
    border-radius: 8px;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
}

.metric-card ::v-deep .el-card__body {
    min-height: 146px;
    display: flex;
    align-items: center;
    padding: 28px 26px;
    box-sizing: border-box;
}

.metric-icon {
    width: 74px;
    height: 74px;
    flex: 0 0 74px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 38px;
}

.metric-icon-building {
    color: #1463f3;
    background: #eaf2ff;
}

.metric-icon-new {
    color: #08a86a;
    background: #e8f9f2;
}

.metric-icon-warning {
    color: #f5222d;
    background: #fff0ed;
}

.metric-icon-approval {
    color: #0b91a7;
    background: #e8f7fb;
}

.metric-main {
    min-width: 0;
    margin-left: 28px;
}

.metric-title {
    color: #111827;
    font-size: 22px;
    font-weight: 700;
    line-height: 32px;
}

.metric-value {
    display: flex;
    align-items: baseline;
    margin-top: 8px;
}

.metric-value span {
    font-size: 46px;
    line-height: 54px;
    font-weight: 700;
    letter-spacing: 0;
}

.metric-value em {
    margin-left: 12px;
    color: #111827;
    font-size: 22px;
    font-style: normal;
}

.metric-compare {
    margin-top: 16px;
    color: #64748b;
    font-size: 18px;
    line-height: 26px;
}

.metric-compare strong {
    margin-left: 10px;
    color: #0ead69;
    font-size: 20px;
}

.metric-compare strong.negative {
    color: #ef4444;
}

.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 18px;
    margin-top: 18px;
}

.panel {
    position: relative;
    min-height: 240px;
    border-color: #e8edf5;
    border-radius: 8px;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
    overflow: hidden;
}

.panel ::v-deep .el-card__body {
    min-height: 240px;
    padding: 24px 24px 20px;
    box-sizing: border-box;
}

.health-panel {
    grid-column: span 3;
    min-height: 368px;
}

.health-panel ::v-deep .el-card__body {
    min-height: 368px;
}

.warning-panel {
    grid-column: span 3;
    min-height: 368px;
}

.warning-panel ::v-deep .el-card__body {
    min-height: 368px;
}

.log-panel,
.reminder-panel {
    grid-column: span 3;
}

.panel-head {
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.panel-head h3 {
    margin: 0;
    color: #111827;
    font-size: 22px;
    line-height: 34px;
    font-weight: 700;
}

.panel-head h3 span {
    color: #53637a;
    font-size: 18px;
    font-weight: 500;
}

.panel-head button {
    border: none;
    background: transparent;
    color: #0b63ff;
    cursor: pointer;
    font-size: 18px;
    line-height: 28px;
    padding: 0;
}

.health-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 260px;
}

.health-chart {
    width: 300px;
    height: 280px;
    flex: 0 0 280px;
}

.table-list {
    border-top: 1px solid #e5eaf2;
}

.table-row {
    display: grid;
    align-items: center;
    border-bottom: 1px solid #e5eaf2;
    color: #172033;
    font-size: 20px;
    line-height: 28px;
    font-weight: 600;
}

.table-row {
    grid-template-columns: minmax(180px, 1fr) minmax(160px, 0.9fr) 110px;
    min-height: 76px;
}

.project-name,
.node-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.node-name {
    color: #344258;
    font-weight: 500;
}

.danger-text {
    color: #ff1f1f;
    text-align: right;
}

.log-table {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
}

.log-table ::v-deep .el-table__header th {
    color: #64748b;
    font-weight: 600;
    background: #f8fafc;
}

.log-table ::v-deep .el-table__header th:first-child {
    border-top-left-radius: 8px;
}

.log-table ::v-deep .el-table__header th:last-child {
    border-top-right-radius: 8px;
}

.log-table ::v-deep .el-table__body-wrapper {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
}

.log-table ::v-deep .el-table__body td {
    color: #172033;
    font-size: 15px;
}

.reminder-list {
    margin-top: 20px;
}

.reminder-row {
    display: flex;
    align-items: center;
    min-height: 46px;
    color: #344258;
    font-size: 18px;
    line-height: 28px;
}

.reminder-dot {
    width: 9px;
    height: 9px;
    flex: 0 0 9px;
    border-radius: 50%;
    margin-right: 14px;
}

.dot-red {
    background: #ff2d2d;
}

.dot-orange {
    background: #f59e0b;
}

.dot-blue {
    background: #1264f6;
}

.dot-green {
    background: #10b981;
}

.dot-gray {
    background: #9aa8bc;
}

.empty-block {
    height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 18px;
}

@media (max-width: 1280px) {
    .metric-grid {
        grid-template-columns: repeat(2, minmax(220px, 1fr));
    }
    .dashboard-grid {
        grid-template-columns: 1fr;
    }
    .health-panel,
    .warning-panel {
        grid-column: auto;
    }
    .log-panel,
    .reminder-panel {
        grid-column: auto;
    }
}
</style>
