<template>
    <div style="background: white; width: 100%">
        <div>
            <div style="text-align: left">
                <el-button
                    style="margin: 5px"
                    type="primary"
                    size="small"
                    icon="el-icon-plus"
                    @click="handleAddDetail"
                    v-if="!disabled"
                    >新增</el-button
                >
            </div>
            <el-form size="small">
                <el-table :data="tableData" max-height="560px" style="width: calc(100% - 2px)" border>
                    <el-table-column fixed align="center" label="序号" type="index" width="50"></el-table-column>
                    <el-table-column align="center" label="物品名称">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-autocomplete
                                    v-model="scope.row.goods"
                                    :fetch-suggestions="querySearch"
                                    placeholder="请输入物品名称"
                                    :disabled="disabled"
                                    @select="
                                        val => {
                                            handleSelect(val, scope.$index)
                                        }
                                    "
                                ></el-autocomplete>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="数量">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input-number
                                    v-model="scope.row.quantity"
                                    :controls="false"
                                    :min="1"
                                    placeholder="请输入数量"
                                    :disabled="disabled"
                                ></el-input-number>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="单位">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-select v-model="scope.row.unit" placeholder="请选择单位" disabled>
                                    <el-option
                                        v-for="option in unitOptions"
                                        :key="option.code"
                                        :label="option.name"
                                        :value="option.code"
                                    ></el-option>
                                </el-select>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="备注">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input
                                    v-model="scope.row.remark"
                                    :controls="false"
                                    placeholder="请输入备注"
                                    :disabled="disabled"
                                ></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="75" fixed="right" v-if="!disabled">
                        <template slot-scope="scope">
                            <el-button type="text" @click="handleDelDetail(scope.$index)" size="small">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-form>
        </div>
    </div>
</template>

<script>
import Schema from 'async-validator'
export default {
    data() {
        return {
            tableData: [],
            billId: '',
            disabled: false,
            goodsList: [],
            unitOptions: []
        }
    },

    created() {
        this.queryGoodsByGroup()
        this.querydicDetail()
        if (this.$router.currentRoute.query.id) {
            this.disabled = this.$parent.formModel.form_status == 1
            this.billId = this.$router.currentRoute.query.id
            this.queryDetailData()
        }
    },
    methods: {
        async querydicDetail() {
            let params = {
                name: '单位'
            }
            let res = await this.$axios.get('dicClassify/queryByName', { params })
            if (res.data.code === 200) {
                this.unitOptions = res.data.data
            }
        },
        async queryGoodsByGroup() {
            let res = await this.$axios.get('cloud/inventory/queryGoodsByGroup')
            if (res.data.code === 200) {
                this.goodsList = res.data.data
            }
        },
        handleAddDetail() {
            this.tableData.push({})
        },
        handleDelDetail(index) {
            this.tableData.splice(index, 1)
        },
        valid() {
            let validFlag = false
            if (this.tableData.length == 0) {
                this.$message.error('出库明细不能为空')
                return validFlag
            }
            let valid = true
            const descriptor = {
                goods: {
                    type: 'string',
                    required: true,
                    message: '物品名称不能为空'
                },
                quantity: {
                    type: 'number',
                    required: true,
                    message: '数量不能为空'
                }
            }
            const validator = new Schema(descriptor)
            for (let i = 0; i < this.tableData.length; i++) {
                if (valid) {
                    validator.validate(this.tableData[i], (errors, fields) => {
                        if (errors) {
                            valid = false
                            this.$message.error('第' + (i + 1) + '行，' + errors[0].message)
                            return
                        }
                    })
                }
            }
            return valid
        },
        queryDetailData() {
            let params = {
                billId: this.billId
            }
            this.$axios.get('cloud/outbill/queryDetailByBillId', { params }).then(res => {
                if (res.data.code == 200) {
                    this.tableData = res.data.data
                } else {
                    this.$message.error(res.data.message)
                }
            })
        },
        querySearch(queryString, cb) {
            var goodsList = this.goodsList
            var results = queryString ? goodsList.filter(this.createFilter(queryString)) : goodsList
            cb(results)
        },
        createFilter(queryString) {
            return goods => {
                return goods.value.toLowerCase().indexOf(queryString.toLowerCase()) != -1
            }
        },
        handleSelect(val, index) {
            let item = this.tableData[index]
            item.unit = val.unit
            this.$set(this.tableData, index, item)
        }
    }
}
</script>

<style scoped>
::v-deep .el-autocomplete {
    width: 100%;
}
::v-deep .el-form-item {
    margin-bottom: 0px;
}
</style>
