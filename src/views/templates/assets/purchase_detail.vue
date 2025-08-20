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
                    >新增</el-button
                >
            </div>
            <el-form size="small">
                <el-table :data="tableData" max-height="560px" style="width: calc(100% - 2px)" border>
                    <el-table-column fixed align="center" label="序号" type="index" width="50"></el-table-column>
                    <el-table-column prop="name" align="center" label="资产名称">
                        <template slot-scope="scope">
                            <el-input
                                v-model="scope.row.name"
                                placeholder="请输入资产名称"
                                clearable
                                :disabled="disabled"
                            >
                            </el-input>
                        </template>
                    </el-table-column>
                    <el-table-column prop="specification" align="center" label="规格型号">
                        <template slot-scope="scope">
                            <el-input
                                v-model="scope.row.specification"
                                placeholder="请输入规格型号"
                                clearable
                                :disabled="disabled"
                            >
                            </el-input>
                        </template>
                    </el-table-column>
                    <el-table-column prop="brand" align="center" label="品牌">
                        <template slot-scope="scope">
                            <el-input v-model="scope.row.brand" placeholder="请输入品牌" clearable :disabled="disabled">
                            </el-input>
                        </template>
                    </el-table-column>
                    <el-table-column prop="price" align="center" label="采购单价">
                        <template slot-scope="scope">
                            <el-input-number
                                v-model="scope.row.price"
                                :controls="false"
                                :disabled="disabled"
                                placeholder="请输入采购单价"
                                :precision="2"
                                clearable
                            ></el-input-number>
                        </template>
                    </el-table-column>
                    <el-table-column prop="num" align="center" label="采购数量">
                        <template slot-scope="scope">
                            <el-input-number
                                v-model="scope.row.num"
                                :controls="false"
                                :disabled="disabled"
                                placeholder="请输入采购数量"
                                :precision="0"
                                clearable
                            ></el-input-number>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="75" fixed="right" v-if="!disabled">
                        <template slot-scope="scope">
                            <el-button type="text" @click="handleDelDetail(scope.$index, scope.row)" size="small"
                                >删除</el-button
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
export default {
    data() {
        return {
            unitOptions: {},
            tableData: [],
            deleteData: [],
            disabled: false
        }
    },
    created() {
        if (this.$router.currentRoute.query.id) {
            this.disabled = !this.$parent.stageButton
            this.tableData = this.$parent.formModel.tableData
        }
    },
    methods: {
        handleDialog() {
            this.tableData.push({})
        },
        handleDelDetail(index, row) {
            this.tableData.splice(index, 1)
            this.deleteData.push(row.id)
        },
        valid() {
            let validFlag = false
            if (this.tableData.length == 0) {
                this.$message.error('采购明细不能为空')
                return validFlag
            }
            let valid = true
            const descriptor = {
                name: {
                    type: 'string',
                    required: true,
                    message: '采购名称不能为空'
                },
                specification: {
                    type: 'string',
                    required: true,
                    message: '规格型号不能为空'
                },
                brand: {
                    type: 'string',
                    required: true,
                    message: '品牌不能为空'
                },
                price: {
                    type: 'number',
                    required: true,
                    message: '采购单价不能为空'
                },
                num: {
                    type: 'number',
                    required: true,
                    message: '采购数量不能为空'
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
