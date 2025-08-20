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
                <el-table
                    :data="tableData"
                    max-height="560px"
                    style="width: 100%"
                    border
                    stripe
                    show-summary
                    :summary-method="getSummaries"
                >
                    <el-table-column fixed align="center" label="序号" type="index" width="50"></el-table-column>
                    <el-table-column align="center" label="产品编号">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input
                                    v-model="scope.row.code"
                                    disabled
                                ></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="产品名称">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input
                                    v-model="scope.row.name"
                                    disabled
                                ></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="产品规格">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input
                                    v-model="scope.row.specifications"
                                    disabled
                                ></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="单位">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-select v-model="scope.row.unit" disabled>
                                    <el-option
                                        v-for="(option, key) in unitOptions"
                                        :key="key"
                                        :label="option"
                                        :value="key"
                                    >
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="数量" prop="quantity">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input-number
                                    v-model="scope.row.quantity"
                                    :controls="false"
                                    :min="1"
                                    :precision="0"
                                    placeholder="请输入数量"
                                    :disabled="disabled"
                                    @change="handleChange(scope.$index, scope.row)"
                                ></el-input-number>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="单价" prop="price">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input-number
                                    v-model="scope.row.price"
                                    :controls="false"
                                    :min="0"
                                    :precision="2"
                                    placeholder="请输入单价"
                                    :disabled="disabled"
                                     @change="handleChange(scope.$index, scope.row)"
                                ></el-input-number>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="金额" prop="amount">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input v-model="scope.row.amount" disabled></el-input>
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
        <el-dialog title="选择" width="750px" :visible.sync="formVisible" :close-on-click-modal="false">
            <el-table
                :data="productData"
                border
                style="width: 100%"
                @selection-change="handleSelectionChange"
                ref="multipleTable"
            >
                <el-table-column type="selection" width="50" align="center"></el-table-column>
                <el-table-column prop="code" label="产品编号" align="center"></el-table-column>
                <el-table-column prop="name" label="产品名称" align="center"></el-table-column>
                <el-table-column prop="specifications" label="产品规格" align="center"></el-table-column>
                <el-table-column prop="unit" label="单位" align="center" :formatter="formatterUnit"></el-table-column>
            </el-table>
            <div slot="footer" class="dialog-footer">
                <el-button @click="formVisible = false">取消</el-button>
                <el-button type="primary" @click="handleDetermine">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import Schema from 'async-validator'
export default {
    data() {
        return {
            tableData: [],
            disabled: false,
            formVisible: false,
            productData: [],
            multipleSelection: [],
            unitOptions: {}
        }
    },
    created() {
        this.querydicDetail()
        this.queryProductData()
        if (this.$router.currentRoute.query.id) {
            this.disabled = true
            this.queryDetailData()
        } else if (this.$router.currentRoute.query.inquiryId) {
            this.selectInquiry()
            this.queryInquiryDemand()
        }
    },
    methods: {
        async queryProductData() {
            let res = await this.$axios.get('cloud/productFiles/queryByCompanyId')
            if (res.data.code == 200) {
                this.productData = res.data.data
            } else {
                this.$message.error(res.data.message)
            }
        },
        async querydicDetail() {
            let params = {
                name: '产品单位'
            }
            let res = await this.$axios.get('dicClassify/queryByName', { params })
            if (res.data.code === 200) {
                for (let i = 0; i < res.data.data.length; i++) {
                    this.unitOptions[res.data.data[i].code] = res.data.data[i].name
                }
            }
        },
        formatterUnit(value) {
            return this.unitOptions[value.unit]
        },
        handleAddDetail() {
            this.formVisible = true
            this.$nextTick(() => {
                this.$refs.multipleTable.clearSelection()
            })
        },
        handleDelDetail(index) {
            this.tableData.splice(index, 1)
        },
        valid() {
            let validFlag = false
            if (this.tableData.length == 0) {
                this.$message.error('订单明细不能为空')
                return validFlag
            }
            let valid = true
            const descriptor = {
                
                quantity: {
                    type: 'integer',
                    required: true,
                    message: '数量不能为空'
                },
                price: {
                    type: 'number',
                    required: true,
                    message: '单价不能为空'
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
        getSummaries(param) {
            const { columns, data } = param
            const sums = []
            columns.forEach((column, index) => {
                if (index === 0) {
                    sums[index] = '合计'
                    return
                } 
                if (index === 5 || index === 6 || index === 7) {
                    const values = data.map(item => item[column.property])
                    sums[index] = values.reduce((prev, curr) => {
                        if (!isNaN(curr)) {
                            return prev + curr
                        } else {
                            return prev
                        }
                    }, 0)
                    sums[index] = parseFloat(sums[index]).toLocaleString('zh')
                }
            })
            return sums
        },
        handleChange(index, row) {
            if(row.price && row.quantity) {
                row.amount = this.BigNumber(row.price).multipliedBy(row.quantity).toNumber()
            } else {
                row.amount = ''
            }
            this.$set(this.tableData, index, row)
        },
        
        queryDetailData() {
            let params = {
                orderId: this.$router.currentRoute.query.id
            }
            this.$axios.get('cloud/orderProduct/queryDetailByOrderId', { params }).then(res => {
                if (res.data.code == 200) {
                    this.tableData = res.data.data
                } else {
                    this.$message.error(res.data.message)
                }
            })
        },
        selectInquiry() {
            let params = {
                id: this.$router.currentRoute.query.inquiryId
            }
            this.$axios.get('cloud/inquiry/selectById', { params }).then(res => {
                if (res.data.code == 200) {
                    this.$parent.state.contacts.value = res.data.data.lxr
                    this.$parent.state.phone.value = res.data.data.lxdh
                    this.$parent.state.customer.value = res.data.data.customer
                } else {
                    this.$message.error(res.data.message)
                }
            })
        },
        queryInquiryDemand() {
            let params = {
                inquiryId: this.$router.currentRoute.query.inquiryId
            }
            this.$axios.get('cloud/inquiryDemand/queryDetailByInquiryId', { params }).then(res => {
                if (res.data.code == 200) {
                    this.tableData = res.data.data
                } else {
                    this.$message.error(res.data.message)
                }
            })
        },
        handleSelectionChange(val) {
            this.multipleSelection = val
        },
        handleDetermine() {
            this.formVisible = false
            let productArray = []
            for (let i = 0; i < this.tableData.length; i++) {
                let item = this.tableData[i]
                productArray.push(item.code)
            }
            for (let i = 0; i < this.multipleSelection.length; i++) {
                let item = this.multipleSelection[i]
                if (!productArray.includes(item.code)) {
                    this.tableData.push({
                        productId: item.id,
                        code: item.code,
                        name: item.name,
                        specifications: item.specifications,
                        unit: String(item.unit),
                        quantity: item.quantity
                    })
                }
            }
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
</style>
