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
                    <el-table-column prop="code" align="center" label="资产编码"> </el-table-column>
                    <el-table-column prop="name" align="center" label="资产名称"> </el-table-column>
                    <el-table-column prop="unit" align="center" label="单位" :formatter="unitFormatter">
                    </el-table-column>
                    <el-table-column prop="num" align="center" label="数量"> </el-table-column>
                    <el-table-column align="center" label="预计归还日期">
                        <template slot-scope="scope">
                            <el-date-picker
                                v-model="scope.row.reckon_return_date"
                                type="date"
                                value-format="yyyy-MM-dd"
                                align="center"
                                placeholder="请选择预计归还日期"
                                clearable
                                :disabled="disabled"
                            >
                            </el-date-picker>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="原资产位置">
                        <template slot-scope="scope">
                            <el-select v-model="scope.row.source_position" disabled placeholder="">
                                <el-option
                                    v-for="item in positionOptions"
                                    :key="item.code"
                                    :label="item.name"
                                    :value="parseInt(item.code)"
                                >
                                </el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="现资产位置">
                        <template slot-scope="scope">
                            <el-select
                                v-model="scope.row.target_position"
                                :disabled="disabled"
                                placeholder="请选择现资产位置"
                            >
                                <el-option
                                    v-for="item in positionOptions"
                                    :key="item.code"
                                    :label="item.name"
                                    :value="parseInt(item.code)"
                                >
                                </el-option>
                            </el-select>
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
        <tiny-business ref="tinyBusiness" @confirm="handleConfirm" />
    </div>
</template>

<script>
import Schema from 'async-validator'
import tinyBusiness from '@/views/components/form/tiny-business'
export default {
    components: {
        tinyBusiness
    },
    data() {
        return {
            unitOptions: {},
            tableData: [],
            deleteData: [],
            disabled: false,
            dialogVisible: false,
            positionOptions: []
        }
    },
    created() {
        this.queryPositionDicDetail()
        this.queryUnitDicDetail()
    },
    methods: {
        async queryPositionDicDetail() {
            let params = {
                name: '资产位置'
            }
            let res = await this.$axios.get('dicClassify/queryByName', { params })
            if (res.data.code === 200) {
                this.positionOptions = res.data.data
            }
        },
        async queryUnitDicDetail() {
            let params = {
                name: '计量单位'
            }
            let res = await this.$axios.get('dicClassify/queryByName', { params })
            if (res.data.code === 200) {
                for (let i = 0; i < res.data.data.length; i++) {
                    this.unitOptions[res.data.data[i].code] = res.data.data[i].name
                }
                if (this.$router.currentRoute.query.id) {
                    this.disabled = !this.$parent.stageButton
                    this.tableData = this.$parent.formModel.tableData
                }
            }
        },
        unitFormatter(row) {
            return this.unitOptions[row.unit]
        },
        handleDialog() {
            this.$refs.tinyBusiness.showDialog(9, true, { flowStatus: 1 })
        },
        handleDelDetail(index, row) {
            this.tableData.splice(index, 1)
            this.deleteData.push(row.id)
        },
        valid() {
            let validFlag = false
            if (this.tableData.length == 0) {
                this.$message.error('资产明细不能为空')
                return validFlag
            }
            let valid = true
            const descriptor = {
                reckon_return_date: {
                    type: 'string',
                    required: true,
                    message: '预计归还日期不能为空'
                },
                target_position: {
                    type: 'number',
                    required: true,
                    message: '现资产位置不能为空'
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
        handleConfirm(data) {
            let assetsArray = []
            for (let i = 0; i < this.tableData.length; i++) {
                let item = this.tableData[i]
                assetsArray.push(item.assets_id)
            }
            for (let i = 0; i < data.length; i++) {
                let item = data[i]
                if (!assetsArray.includes(item.id)) {
                    this.tableData.push({
                        assets_id: item.id,
                        code: item.code,
                        name: item.name,
                        unit: item.unit,
                        num: item.num,
                        source_position: item.position
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
