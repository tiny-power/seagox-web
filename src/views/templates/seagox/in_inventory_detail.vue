<template>
    <div style="background: white; width: 100%">
        <div>
            <div style="text-align: left">
                <el-button
                    style="margin: 5px"
                    type="primary"
                    size="small"
                    icon="el-icon-plus"
                    @click="handleDialog"
                    v-if="!disabled"
                    >选择产品</el-button
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
                                <el-input v-model="scope.row.code" disabled></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="产品名称">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input v-model="scope.row.name" disabled></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="产品规格">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input v-model="scope.row.specifications" disabled></el-input>
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
                                    disabled
                                ></el-input-number>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="入库数量" prop="rksl">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input-number
                                    v-model="scope.row.rksl"
                                    :controls="false"
                                    :min="1"
                                    :precision="0"
                                    placeholder="请输入入库数量"
                                    :disabled="disabled"
                                ></el-input-number>
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
                <el-table-column prop="quantity" label="数量" align="center"></el-table-column>
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
            productData: [],
            formVisible: false,
            multipleSelection: [],
            unitOptions: {}
        }
    },
    created() {
        this.querydicDetail()
        if (this.$router.currentRoute.query.id) {
            this.queryDetailData()
        }
    },
    methods: {
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
        handleDialog() {
            if (!this.$parent.state.quality_test_id.value) {
                this.$message.error('请选择质检单')
                return
            } else {
                this.queryInquiryData()
            }
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
                this.$message.error('入库明细不能为空')
                return validFlag
            }
            let valid = true
            const descriptor = {
                rksl: {
                    type: 'number',
                    required: true,
                    message: '入库数量不能为空'
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
                if (index === 5 || index === 6) {
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
        async queryDetailData() {
            let params = {
                inInventoryId: this.$router.currentRoute.query.id
            }
            let res = await this.$axios.get('cloud/inInventoryDetail/queryDetailByInventoryId', { params })
            if (res.data.code == 200) {
                this.tableData = res.data.data
            } else {
                this.$message.error(res.data.message)
            }
        },
        queryInquiryData() {
            let params = {
                qualityTestId: this.$parent.state.quality_test_id.value
            }
            this.$axios.get('cloud/qualityTestDetail/queryListByQualityTestId', { params }).then(res => {
                if (res.data.code == 200) {
                    this.productData = res.data.data
                } else {
                    this.$message.error(res.data.message)
                }
            })
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
                        unit: item.unit,
                        quantity: item.quantity
                    })
                }
            }
        },
        handleSelectionChange(val) {
            this.multipleSelection = val
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
