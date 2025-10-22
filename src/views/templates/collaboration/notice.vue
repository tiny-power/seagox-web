<template>
    <!-- 通知 -->
    <div class="work" style="height: 100%; box-sizing: border-box">
        <el-card style="height: 100%">
            <div slot="header">
                <span>通知</span>
                <el-link type="primary" style="float: right" @click="handleWorkMore">更多</el-link>
            </div>
            <div style="margin: -20px">
                <el-table
                    :data="todoItem"
                    :show-header="false"
                    empty-text="暂无数据"
                    @row-dblclick="handleEvent"
                    :row-style="{ cursor: 'pointer' }"
                    :height="height - 86"
                >
                    <el-table-column property="name" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <span v-if="scope.row.returnNumber > 2" style="color: #ef0022">{{ scope.row.name }}</span>
                            <span v-else>{{ scope.row.name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column property="assigneeName" align="right"></el-table-column>
                    <el-table-column property="createTime"></el-table-column>
                </el-table>
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
