<template>
    <div class="printContent">
        <div
            style="text-align: center; font-size: 2em; margin-top: 20px; margin-bottom: 20px; font-family: '方正小标宋'"
        >
            办公用品领用申请表
        </div>
        <table border="1" bordercolor="#fff" cellpadding="0" cellspacing="0" class="content">
            <tbody id="tbody" class="tbody">
                <tr style="height: 42px; font-family: 仿宋_GB2312">
                    <td style="text-align: center; font-size: 14pt">单据编号</td>
                    <td style="padding-left: 15px; font-size: 14pt">{{ formModel.code }}</td>
                    <td style="text-align: center; font-size: 14pt">单据日期</td>
                    <td style="padding-left: 15px; font-size: 14pt">{{ formModel.bill_date }}</td>
                </tr>
                <tr style="height: 42px; font-family: 仿宋_GB2312">
                    <td style="text-align: center; font-size: 14pt">部门</td>
                    <td style="padding-left: 15px; font-size: 14pt">{{ formModel.dept_name }}</td>
                    <td style="text-align: center; font-size: 14pt">领用人</td>
                    <td style="padding-left: 15px; font-size: 14pt">{{ formModel.recipient }}</td>
                </tr>
                <tr style="height: 100px; font-family: 仿宋_GB2312">
                    <td style="text-align: center; font-size: 14pt">申请单位领导意见</td>
                    <td style="padding-left: 15px"></td>
                    <td style="text-align: center; font-size: 14pt">警保处领导意见</td>
                    <td style="padding-left: 15px"></td>
                </tr>
                <tr style="height: 60px; font-size: 20px; font-family: 仿宋_GB2312">
                    <td style="text-align: center" colspan="4">申领物品明细</td>
                </tr>
                <tr>
                    <td colspan="4">
                        <el-table :data="formModel.tableData" border>
                            <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
                            <el-table-column label="物品" prop="goods" align="center"></el-table-column>
                            <el-table-column label="数量" prop="quantity" align="center"></el-table-column>
                            <el-table-column prop="unit" label="单位" align="center" :formatter="formatterUnit">
                            </el-table-column>
                            <el-table-column
                                label="上次申领物品时间"
                                align="center"
                                :formatter="formatLastBillDate"
                            ></el-table-column>
                            <el-table-column
                                label="申领数量"
                                align="center"
                                :formatter="formatLastQuantity"
                            ></el-table-column>
                            <el-table-column label="备注" prop="remark" align="center"></el-table-column>
                        </el-table>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    props: {},
    data() {
        return {
            formModel: {},
            lastGoodsMap: {},
            goodsMap: {},
            unitMap: {}
        }
    },
    created() {
        this.formModel = this.$parent.formModel
        if (this.$router.currentRoute.query.id) {
            this.querydicDetail()
            this.queryLastGoodsTime()
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
                let unitMap = {}
                for (let i = 0; i < res.data.data.length; i++) {
                    let item = res.data.data[i]
                    unitMap[item.code] = item.name
                }
                this.unitMap = unitMap
            }
        },
        formatterUnit(data) {
            return this.unitMap[data.unit]
        },
        async queryLastGoodsTime() {
            let params = {
                id: this.$router.currentRoute.query.id,
                deptName: this.formModel.dept_name
            }
            let res = await this.$axios.get('cloud/outbill/queryLastGoodsTime', { params })
            if (res.data.code === 200) {
                let lastGoodsMap = {}
                for (let i = 0; i < res.data.data.length; i++) {
                    let item = res.data.data[i]
                    if (!lastGoodsMap.hasOwnProperty(item.goods)) {
                        lastGoodsMap[item.goods] = {
                            quantity: item.quantity,
                            billDate: item.billDate
                        }
                    }
                }
                this.lastGoodsMap = lastGoodsMap
            }
        },
        formatLastBillDate(data) {
            if (this.lastGoodsMap.hasOwnProperty(data.goods)) {
                return this.lastGoodsMap[data.goods].billDate
            } else {
                return ''
            }
        },
        formatLastQuantity(data) {
            if (this.lastGoodsMap.hasOwnProperty(data.goods)) {
                return this.lastGoodsMap[data.goods].quantity
            } else {
                return ''
            }
        },
        async queryDetailData() {
            let params = {
                billId: this.$router.currentRoute.query.id
            }
            let res = await this.$axios.get('cloud/outbill/queryDetailByBillId', { params })
            if (res.data.code == 200) {
                this.$set(this.formModel, 'tableData', res.data.data)
            } else {
                this.$message.error(res.data.message)
            }
        }
    }
}
</script>

<style scoped>
@page {
    size: auto;
    margin: 0mm;
}
@media print {
    table {
        page-break-inside: auto;
    }
    tr {
        page-break-inside: avoid;
        page-break-after: auto;
    }
    .printContent {
        display: block !important;
    }
}
::v-deep table {
    table-layout: auto !important;
}
::v-deep .el-table__header-wrapper .el-table__header {
    width: 100% !important;
}
::v-deep .el-table__body-wrapper .el-table__body {
    width: 100% !important;
}
.printContent {
    padding: 15px;
    display: none;
}
.content {
    width: 100%;
    border-collapse: collapse;
    border: var(--theme-color-line);
}
.tbody {
    font-size: 14px;
}
::v-deep .el-table th.el-table__cell.is-leaf,
::v-deep .el-table td.el-table__cell {
    border-bottom: 1px solid #000;
}
::v-deep .el-table--border .el-table__cell {
    border-right: 1px solid #000;
}
</style>
