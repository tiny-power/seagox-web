<template>
    <div>
        <div class="toolView">
            <el-button type="text" icon="el-icon-message" @click="settingMessage" size="small"
                >全部标志为已读</el-button
            >
        </div>
        <div class="table">
            <!--列表-->
            <el-table
                :data="tableData"
                border
                highlight-current-row
                stripe
                @row-dblclick="handleNodeClick"
                :height="clientHeight - 185"
            >
                <el-table-column type="index" label="#" width="50" align="center"></el-table-column>
                <el-table-column prop="name" label="发起人" align="center"></el-table-column>
                <el-table-column prop="title" label="消息内容" align="center">
                    <template slot-scope="scope">
                        <i v-if="scope.row.classify == '3'" class="el-icon-warning" style="color: red"></i>
                        <i v-if="scope.row.classify == '2'" class="el-icon-warning" style="color: #e6a23c"></i>
                        <span v-if="scope.row.type == 2" v-html="scope.row.title"></span>
                        <span v-else>{{ scope.row.title }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="发送时间" align="center"></el-table-column>
                <el-table-column
                    prop="status"
                    label="状态"
                    align="center"
                    :formatter="statusFormatter"
                ></el-table-column>
            </el-table>
            <!--分页-->
            <div class="pagination">
                <el-pagination
                    background
                    @current-change="handleCurrentChange"
                    layout="total, prev, pager, next"
                    :current-page.sync="pageNo"
                    :total="total"
                >
                </el-pagination>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            clientHeight: document.documentElement.clientHeight || document.body.clientHeight,
            tableData: [],
            pageNo: 1,
            total: 0
        }
    },
    created() {
        this.queryByPage()
    },
    methods: {
        async queryByPage() {
            const params = {
                pageNo: this.pageNo
            }
            let res = await this.$axios.get('message/queryByPage', { params })
            if (res.data.code == 200) {
                this.tableData = res.data.data.list
                this.total = res.data.data.total
            }
        },
        // 翻页
        handleCurrentChange(val) {
            this.queryByPage()
        },
        async settingMessage() {
            let res = await this.$axios.post('message/updateAll', {})
            if (res.data.code == 200) {
                this.$message.success('设置成功')
                this.queryByPage()
            }
        },
        statusFormatter(row) {
            if (row.status === 0) {
                return '未读'
            } else {
                return '已读'
            }
        },
        handleNodeClick(row, column, event) {
            const params = {
                id: row.id
            }
            this.$axios.post('message/update', params).then(res => {
                if (res.data.code == 200) {
                    if (row.type == 1) {
                        //暂存数据
                        this.$router.push({
                            path: '/handleCustomForm',
                            query: {
                                id: row.businessKey,
                                formId: row.businessType,
                                title: '事项详情'
                            }
                        })
                    }
                }
            })
        }
    }
}
</script>
