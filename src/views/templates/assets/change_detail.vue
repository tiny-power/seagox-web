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
                    <el-table-column
                        v-for="(item, index) in tableColumn"
                        :key="index"
                        align="center"
                        :label="item.label"
                    >
                        <el-table-column align="center" label="变更前">
                            <template slot-scope="scope">
                                <el-form-item>
                                    <el-input
                                        v-model="scope.row[item.field + '_before']"
                                        disabled
                                        v-if="item.type === 'input'"
                                    ></el-input>
                                </el-form-item>
                                <el-form-item>
                                    <el-input-number
                                        v-model="scope.row[item.field + '_before']"
                                        :controls="false"
                                        :min="1"
                                        disabled
                                        v-if="item.type === 'number'"
                                    ></el-input-number>
                                </el-form-item>
                                <el-form-item>
                                    <el-select
                                        v-model="scope.row[item.field + '_before']"
                                        disabled
                                        v-if="item.type === 'select'"
                                    >
                                        <el-option
                                            v-for="item in positionOptions"
                                            :key="item.code"
                                            :label="item.name"
                                            :value="item.code"
                                        >
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column align="center" label="变更后">
                            <template slot-scope="scope">
                                <el-form-item>
                                    <el-input
                                        v-model="scope.row[item.field + '_after']"
                                        :placeholder="'请输入' + item.label"
                                        :disabled="disabled"
                                        v-if="item.type === 'input'"
                                    ></el-input>
                                </el-form-item>
                                <el-form-item>
                                    <el-input-number
                                        v-model="scope.row[item.field + '_after']"
                                        :controls="false"
                                        :min="1"
                                        :placeholder="'请输入' + item.label"
                                        :disabled="disabled"
                                        v-if="item.type === 'number'"
                                    ></el-input-number>
                                </el-form-item>
                                <el-form-item>
                                    <el-select
                                        v-model="scope.row[item.field + '_after']"
                                        :placeholder="'请选择' + item.label"
                                        :disabled="disabled"
                                        v-if="item.type === 'select'"
                                    >
                                        <el-option
                                            v-for="item in positionOptions"
                                            :key="item.code"
                                            :label="item.name"
                                            :value="item.code"
                                        >
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </template>
                        </el-table-column>
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
            positionOptions: [],
            tableData: [],
            deleteData: [],
            disabled: false,
            tableColumn: []
        }
    },
    created() {
        this.queryPositionDicDetail()
    },
    mounted() {
        if (this.$router.currentRoute.query.id) {
            this.disabled = !this.$parent.stageButton
            let tableData = this.$parent.formModel.tableData
            for (let i = 0; i < tableData.length; i++) {
                let item = tableData[0]
                let options = JSON.parse(item.options)
                if (i == 0) {
                    this.tableColumn = options
                }
                for (let j = 0; j < options.length; j++) {
                    let option = options[j]
                    item[option.field + '_before'] = option[option.field + '_before']
                    item[option.field + '_after'] = option[option.field + '_after']
                }
            }
            this.tableData = tableData
        }
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
            const descriptor = {}
            for (let i = 0; i < this.tableColumn.length; i++) {
                descriptor[this.tableColumn[i].field + '_after'] = {
                    type: this.tableColumn[i].validType,
                    required: true,
                    message: this.tableColumn[i].label + '不能为空'
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
                        position_before: item.position ? String(item.position) : '',
                        name_before: item.name,
                        num_before: item.num
                    })
                }
            }
        },
        handleTableColumn(value) {
            let tableColumn = []
            for (let i = 0; i < value.length; i++) {
                if (value[i] === 'name') {
                    tableColumn.push({ type: 'input', label: '资产名称', field: value[i], validType: 'string' })
                } else if (value[i] === 'num') {
                    tableColumn.push({ type: 'number', label: '资产数量', field: value[i], validType: 'number' })
                } else if (value[i] === 'position') {
                    tableColumn.push({ type: 'select', label: '资产位置', field: value[i], validType: 'string' })
                }
            }
            this.tableColumn = tableColumn
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
