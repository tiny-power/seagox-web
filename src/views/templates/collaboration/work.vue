<template>
    <!-- 我的工作 -->
    <div class="work" style="height: 100%; box-sizing: border-box">
        <el-card style="height: 100%">
            <div slot="header">
                <span>我的工作</span>
                <el-link type="primary" style="float: right" @click="handleWorkMore">更多</el-link>
            </div>
            <div style="margin: -20px">
                <el-tabs v-model="activeName">
                    <el-tab-pane :label="'待办事项（' + todoTotal + '）'" name="todoItem">
                        <el-table
                            :data="todoItem"
                            :show-header="false"
                            empty-text="暂无待办事项"
                            @row-dblclick="handleEvent"
                            :row-style="{ cursor: 'pointer' }"
                            :height="height - 86"
                        >
                            <el-table-column property="name" show-overflow-tooltip>
                                <template slot-scope="scope">
                                    <span v-if="scope.row.returnNumber > 2" style="color: #ef0022">{{
                                        scope.row.name
                                    }}</span>
                                    <span v-else>{{ scope.row.name }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column property="assigneeName" align="right"></el-table-column>
                            <el-table-column property="createTime"></el-table-column>
                        </el-table>
                    </el-tab-pane>
                    <el-tab-pane :label="'待发事项（' + readyTotal + '）'" name="readyItem">
                        <el-table
                            :data="readyItem"
                            :show-header="false"
                            empty-text="暂无待发事项"
                            @row-dblclick="handleEvent"
                            :row-style="{ cursor: 'pointer' }"
                            :height="height - 86"
                        >
                            <el-table-column property="name" show-overflow-tooltip></el-table-column>
                            <el-table-column property="createTime" align="center"></el-table-column>
                        </el-table>
                    </el-tab-pane>
                    <el-tab-pane :label="'已办事项（' + doneTotal + '）'" name="doneItem">
                        <el-table
                            :data="doneItem"
                            :show-header="false"
                            empty-text="暂无已办事项"
                            @row-dblclick="handleEvent"
                            :row-style="{ cursor: 'pointer' }"
                            :height="height - 86"
                        >
                            <el-table-column property="name" show-overflow-tooltip></el-table-column>
                            <el-table-column property="assigneeName" align="right"></el-table-column>
                            <el-table-column property="endTime" align="center"></el-table-column>
                        </el-table>
                    </el-tab-pane>
                    <el-tab-pane :label="'抄送事项（' + copyTotal + '）'" name="copyItem">
                        <el-table
                            :data="copyItem"
                            :show-header="false"
                            empty-text="暂无抄送事项"
                            @row-dblclick="handleEvent"
                            :row-style="{ cursor: 'pointer' }"
                            :height="height - 86"
                        >
                            <el-table-column property="name" show-overflow-tooltip></el-table-column>
                            <el-table-column property="assigneeName" align="right"></el-table-column>
                            <el-table-column property="createTime" align="center"></el-table-column>
                        </el-table>
                    </el-tab-pane>
                    <el-tab-pane :label="'我发起的（' + selfTotal + '）'" name="selfItem">
                        <el-table
                            :data="selfItem"
                            :show-header="false"
                            empty-text="暂无我发起的"
                            @row-dblclick="handleEvent"
                            :row-style="{ cursor: 'pointer' }"
                            :height="height - 86"
                        >
                            <el-table-column property="name" show-overflow-tooltip></el-table-column>
                            <el-table-column property="createTime" align="center"></el-table-column>
                        </el-table>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </el-card>
    </div>
</template>
<script>
export default {
    props: ['height'],
    data() {
        return {
            activeName: 'todoItem',
            todoItem: [],
            todoTotal: 0,
            doneItem: [],
            doneTotal: 0,
            copyItem: [],
            copyTotal: 0,
            selfItem: [],
            selfTotal: 0,
            readyItem: [],
            readyTotal: 0
        }
    },
    mounted() {
        this.queryTodoItem()
        this.queryDoneItem()
        this.queryCopyItem()
        this.querySelfItem()
        this.queryReadyItem()
    },
    methods: {
        async queryTodoItem() {
            let res = await this.$axios.get('flow/queryTodoItem')
            if (res.data.code === 200) {
                this.todoItem = res.data.data.list
                this.todoTotal = res.data.data.total
            }
        },
        async queryDoneItem() {
            let res = await this.$axios.get('flow/queryDoneItem')
            if (res.data.code === 200) {
                this.doneItem = res.data.data.list
                this.doneTotal = res.data.data.total
            }
        },
        async queryCopyItem(object) {
            let res = await this.$axios.get('flow/queryCopyItem')
            if (res.data.code === 200) {
                this.copyItem = res.data.data.list
                this.copyTotal = res.data.data.total
            }
        },
        async querySelfItem(object) {
            let res = await this.$axios.get('flow/querySelfItem')
            if (res.data.code === 200) {
                this.selfItem = res.data.data.list
                this.selfTotal = res.data.data.total
            }
        },
        async queryReadyItem(object) {
            let res = await this.$axios.get('flow/queryReadyItem')
            if (res.data.code === 200) {
                this.readyItem = res.data.data.list
                this.readyTotal = res.data.data.total
            }
        },
        handleEvent(row) {
            this.$router.push({
                path: '/handleCustomForm',
                query: {
                    id: row.businessKey,
                    formId: row.businessType,
                    title: row.name
                }
            })
        },
        handleWorkMore() {
            this.$router.push({
                path: '/' + this.activeName
            })
        }
    }
}
</script>
<style scoped></style>
