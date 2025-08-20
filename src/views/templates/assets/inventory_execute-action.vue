<template>
    <div style="display: inline-block">
        <el-button type="text" size="small" @click="handleSubmit" v-if="row.status == 1">提交</el-button>
        <el-button type="text" size="small" @click="showExecuteDialog" v-if="row.status == 2">盘点结果执行</el-button>
        <el-dialog title="盘点结果执行" width="550px" :visible.sync="dialogVisible" :close-on-click-modal="false">
            <div>
                <el-checkbox-group
                    v-model="checkList"
                    style="display: flex; flex-direction: column; align-items: flex-start"
                >
                    <el-checkbox label="1">无盈亏资产变动内容自动更新资产信息</el-checkbox>
                    <el-checkbox label="2" style="margin-top: 10px">盘亏资产自动报废</el-checkbox>
                    <el-checkbox label="3" style="margin-top: 10px">盘盈资产主动新增入库</el-checkbox>
                </el-checkbox-group>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleExecute">确定执行</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    props: {
        row: {
            type: Object
        }
    },
    data() {
        return {
            dialogVisible: false,
            checkList: []
        }
    },
    methods: {
        handleSubmit() {
            let params = {
                id: this.row.id,
                status: 2
            }
            this.$axios.post('inventory/updateInventoryPlan', params).then(res => {
                if (res.data.code == 200) {
                    this.$message.success('提交成功')
                    this.row.status = 2
                } else {
                    this.$message.error(res.data.message)
                }
            })
        },
        showExecuteDialog() {
            this.checkList = []
            this.dialogVisible = true
        },
        handleExecute() {
            let params = {
                id: this.row.id,
                status: 3,
                checkStr: this.checkList.toString()
            }
            this.$axios.post('inventory/updateInventoryPlan', params).then(res => {
                if (res.data.code == 200) {
                    this.$message.success('提交成功')
                    this.row.status = 2
                } else {
                    this.$message.error(res.data.message)
                }
            })
        }
    }
}
</script>

<style scoped></style>
