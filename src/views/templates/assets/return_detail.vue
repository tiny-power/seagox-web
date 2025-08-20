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
            dialogVisible: false
        }
    },
    created() {
        this.queryUnitDicDetail()
    },
    methods: {
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
            const descriptor = {}
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
                        num: item.num
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
