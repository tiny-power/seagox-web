<template>
    <div style="background: white; width: 100%; text-align: left; box-sizing: border-box; padding-bottom: 10px">
        <el-radio-group v-model="tabPosition" size="medium" style="margin: 10px">
            <el-radio-button label="not">未盘点({{ notTableData.length }})</el-radio-button>
            <el-radio-button label="without">无盈亏({{ withoutTableData.length }})</el-radio-button>
            <el-radio-button label="profit">盘盈({{ profitTableData.length }})</el-radio-button>
            <el-radio-button label="lose">盘亏({{ loseTableData.length }})</el-radio-button>
        </el-radio-group>
        <div>
            <!-- <div style="text-align: left">
                <el-button style="margin: 5px" type="primary" size="medium" @click="batchUploadPicture"
                    >批量上传图片</el-button
                >
            </div> -->
            <el-form size="small" v-if="tabPosition === 'not'">
                <el-table :data="notTableData" max-height="560px" style="width: calc(100% - 2px)" border>
                    <el-table-column fixed align="center" label="序号" type="index" width="50"></el-table-column>
                    <el-table-column prop="code" align="center" label="资产编码"> </el-table-column>
                    <el-table-column prop="name" align="center" label="资产名称"> </el-table-column>
                    <el-table-column prop="status" align="center" label="盘点结果" :formatter="statusFormatter">
                    </el-table-column>
                    <el-table-column prop="num" align="center" label="盘前总数"> </el-table-column>
                    <el-table-column
                        prop="assetsStatus"
                        align="center"
                        label="资产状态"
                        :formatter="assetsStatusFormatter"
                    >
                    </el-table-column>
                    <el-table-column prop="useName" align="center" label="使用人"> </el-table-column>
                    <el-table-column prop="position" align="center" label="资产位置" :formatter="positionFormatter">
                    </el-table-column>
                    <el-table-column align="center" label="实盘数量">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input-number
                                    v-model="scope.row.actualNum"
                                    :controls="false"
                                    :min="0"
                                    placeholder="请输入实盘数量"
                                ></el-input-number>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="132" fixed="right" v-if="status == 1">
                        <template slot-scope="scope">
                            <el-button type="text" @click="handleInventory(2, scope.$index, scope.row)" size="small"
                                >无盈亏</el-button
                            >
                            <el-button type="text" @click="handleInventory(3, scope.$index, scope.row)" size="small"
                                >盘盈</el-button
                            >
                            <el-button type="text" @click="handleInventory(4, scope.$index, scope.row)" size="small"
                                >盘亏</el-button
                            >
                        </template>
                    </el-table-column>
                </el-table>
            </el-form>
            <el-form size="small" v-if="tabPosition === 'without'">
                <el-table :data="withoutTableData" max-height="560px" style="width: calc(100% - 2px)" border>
                    <el-table-column fixed align="center" label="序号" type="index" width="50"></el-table-column>
                    <el-table-column prop="code" align="center" label="资产编码"> </el-table-column>
                    <el-table-column prop="name" align="center" label="资产名称"> </el-table-column>
                    <el-table-column prop="status" align="center" label="盘点结果" :formatter="statusFormatter">
                    </el-table-column>
                    <el-table-column prop="num" align="center" label="盘前总数"> </el-table-column>
                    <el-table-column
                        prop="assetsStatus"
                        align="center"
                        label="资产状态"
                        :formatter="assetsStatusFormatter"
                    >
                    </el-table-column>
                    <el-table-column prop="useName" align="center" label="使用人"> </el-table-column>
                    <el-table-column prop="position" align="center" label="资产位置" :formatter="positionFormatter">
                    </el-table-column>
                    <el-table-column align="center" label="实盘数量">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input-number
                                    v-model="scope.row.actualNum"
                                    :controls="false"
                                    :min="0"
                                    placeholder="请输入实盘数量"
                                ></el-input-number>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="132" fixed="right" v-if="status == 1">
                        <template slot-scope="scope">
                            <el-button type="text" @click="handleInventory(2, scope.$index, scope.row)" size="small"
                                >无盈亏</el-button
                            >
                            <el-button type="text" @click="handleInventory(3, scope.$index, scope.row)" size="small"
                                >盘盈</el-button
                            >
                            <el-button type="text" @click="handleInventory(4, scope.$index, scope.row)" size="small"
                                >盘亏</el-button
                            >
                        </template>
                    </el-table-column>
                </el-table>
            </el-form>
            <el-form size="small" v-if="tabPosition === 'profit'">
                <el-table :data="profitTableData" max-height="560px" style="width: calc(100% - 2px)" border>
                    <el-table-column fixed align="center" label="序号" type="index" width="50"></el-table-column>
                    <el-table-column prop="code" align="center" label="资产编码"> </el-table-column>
                    <el-table-column prop="name" align="center" label="资产名称"> </el-table-column>
                    <el-table-column prop="status" align="center" label="盘点结果" :formatter="statusFormatter">
                    </el-table-column>
                    <el-table-column prop="num" align="center" label="盘前总数"> </el-table-column>
                    <el-table-column
                        prop="assetsStatus"
                        align="center"
                        label="资产状态"
                        :formatter="assetsStatusFormatter"
                    >
                    </el-table-column>
                    <el-table-column prop="useName" align="center" label="使用人"> </el-table-column>
                    <el-table-column prop="position" align="center" label="资产位置" :formatter="positionFormatter">
                    </el-table-column>
                    <el-table-column align="center" label="实盘数量">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input-number
                                    v-model="scope.row.actualNum"
                                    :controls="false"
                                    :min="0"
                                    placeholder="请输入实盘数量"
                                ></el-input-number>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="132" fixed="right" v-if="status == 1">
                        <template slot-scope="scope">
                            <el-button type="text" @click="handleInventory(2, scope.$index, scope.row)" size="small"
                                >无盈亏</el-button
                            >
                            <el-button type="text" @click="handleInventory(3, scope.$index, scope.row)" size="small"
                                >盘盈</el-button
                            >
                            <el-button type="text" @click="handleInventory(4, scope.$index, scope.row)" size="small"
                                >盘亏</el-button
                            >
                        </template>
                    </el-table-column>
                </el-table>
            </el-form>
            <el-form size="small" v-if="tabPosition === 'lose'">
                <el-table :data="loseTableData" max-height="560px" style="width: calc(100% - 2px)" border>
                    <el-table-column fixed align="center" label="序号" type="index" width="50"></el-table-column>
                    <el-table-column prop="code" align="center" label="资产编码"> </el-table-column>
                    <el-table-column prop="name" align="center" label="资产名称"> </el-table-column>
                    <el-table-column prop="status" align="center" label="盘点结果" :formatter="statusFormatter">
                    </el-table-column>
                    <el-table-column prop="num" align="center" label="盘前总数"> </el-table-column>
                    <el-table-column
                        prop="assetsStatus"
                        align="center"
                        label="资产状态"
                        :formatter="assetsStatusFormatter"
                    >
                    </el-table-column>
                    <el-table-column prop="useName" align="center" label="使用人"> </el-table-column>
                    <el-table-column prop="position" align="center" label="资产位置" :formatter="positionFormatter">
                    </el-table-column>
                    <el-table-column align="center" label="实盘数量">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input-number
                                    v-model="scope.row.actualNum"
                                    :controls="false"
                                    :min="0"
                                    placeholder="请输入实盘数量"
                                ></el-input-number>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="132" fixed="right" v-if="status == 1">
                        <template slot-scope="scope">
                            <el-button type="text" @click="handleInventory(2, scope.$index, scope.row)" size="small"
                                >无盈亏</el-button
                            >
                            <el-button type="text" @click="handleInventory(3, scope.$index, scope.row)" size="small"
                                >盘盈</el-button
                            >
                            <el-button type="text" @click="handleInventory(4, scope.$index, scope.row)" size="small"
                                >盘亏</el-button
                            >
                        </template>
                    </el-table-column>
                </el-table>
            </el-form>
        </div>
    </div>
</template>

<script>
import Schema from 'async-validator'
import pLimit from 'p-limit'
export default {
    data() {
        return {
            tabPosition: 'not',
            disabled: false,
            statusOptions: {},
            positionOptions: {},
            notTableData: [],
            withoutTableData: [],
            profitTableData: [],
            loseTableData: [],
            status: 1
        }
    },
    mounted() {
        this.status = this.$parent.formModel.status
        this.queryDic()
    },
    methods: {
        async queryDic() {
            let limit = pLimit(2)
            const input = []
            input.push(limit(() => this.queryStatusDicDetail()))
            input.push(limit(() => this.queryPositionDicDetail()))
            await Promise.all(input)
            if (this.$router.currentRoute.query.id) {
                this.$nextTick(() => {
                    this.disabled = true
                    let tableData = this.$parent.formModel.tableData
                    let notTableData = []
                    let withoutTableData = []
                    let profitTableData = []
                    let loseTableData = []
                    for (let i = 0; i < tableData.length; i++) {
                        let item = tableData[i]
                        if (item.status == 1) {
                            notTableData.push(item)
                        } else if (item.status == 2) {
                            withoutTableData.push(item)
                        } else if (item.status == 3) {
                            profitTableData.push(item)
                        } else if (item.status == 4) {
                            loseTableData.push(item)
                        }
                    }
                    this.notTableData = notTableData
                    this.withoutTableData = withoutTableData
                    this.profitTableData = profitTableData
                    this.loseTableData = loseTableData
                })
            }
        },
        queryStatusDicDetail() {
            return new Promise((resolve, reject) => {
                let params = {
                    name: '资产状态'
                }
                this.$axios.get('dicClassify/queryByName', { params }).then(res => {
                    if (res.data.code === 200) {
                        for (let i = 0; i < res.data.data.length; i++) {
                            this.statusOptions[res.data.data[i].code] = res.data.data[i].name
                        }
                    }
                    resolve()
                })
            })
        },
        queryPositionDicDetail() {
            return new Promise((resolve, reject) => {
                let params = {
                    name: '资产位置'
                }
                this.$axios.get('dicClassify/queryByName', { params }).then(res => {
                    if (res.data.code === 200) {
                        for (let i = 0; i < res.data.data.length; i++) {
                            this.positionOptions[res.data.data[i].code] = res.data.data[i].name
                        }
                    }
                    resolve()
                })
            })
        },
        statusFormatter(row) {
            if (row.status == 1) {
                return '未盘点'
            } else if (row.status == 2) {
                return '无盈亏'
            } else if (row.status == 3) {
                return '盘盈'
            } else if (row.status == 4) {
                return '盘亏'
            }
            return row.status
        },
        assetsStatusFormatter(row) {
            return this.statusOptions[row.assetsStatus]
        },
        positionFormatter(row) {
            return this.positionOptions[row.position]
        },
        batchUploadPicture() {},
        handleInventory(status, index, row) {
            let params = {
                id: row.id,
                status: status,
                num: row.num,
                actualNum: row.actualNum
            }
            this.$axios.post('inventory/updateInventoryPlanDetail', params).then(res => {
                if (res.data.code == 200) {
                    this.$message.success('操作成功')
                    if (this.tabPosition == 'not') {
                        this.notTableData.splice(index, 1)
                    } else if (this.tabPosition == 'without') {
                        this.withoutTableData.splice(index, 1)
                    } else if (this.tabPosition == 'profit') {
                        this.profitTableData.splice(index, 1)
                    } else if (this.tabPosition == 'lose') {
                        this.loseTableData.splice(index, 1)
                    }
                    row.status = status
                    if (status == 2) {
                        this.withoutTableData.push(row)
                    } else if (status == 3) {
                        this.profitTableData.push(row)
                    } else if (status == 4) {
                        this.loseTableData.push(row)
                    }
                }
            })
        }
    }
}
</script>

<style scoped>
::v-deep .el-dialog__header {
    text-align: left !important;
}
::v-deep .el-form-item {
    margin-bottom: 0px;
}
::v-deep .el-input-number .el-input__inner {
    text-align: center;
}
</style>
