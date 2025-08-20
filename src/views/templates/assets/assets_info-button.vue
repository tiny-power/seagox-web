<template>
    <div style="display: inline-block; margin-left: 15px">
        <el-button
            type="text"
            size="small"
            icon="el-icon-printer"
            style="color: #000; font-weight: 400"
            @click="showLabelTemplate"
            >标签打印</el-button
        >
        <section id="print" style="display: none">
            <div
                :style="{
                    height: height + 'mm',
                    'box-sizing': 'border-box',
                    display: 'flex',
                    'flex-direction': 'column',
                    'justify-content': 'center',
                    'align-items': 'center',
                    'page-break-after': 'always'
                }"
                v-for="(item, index) in printData"
                :key="index"
            >
                <table
                    :style="{
                        'border-spacing': 0,
                        'border-collapse': 'unset',
                        'border-top': '#000 1px solid',
                        'border-right': '#000 1px solid',
                        margin: 'auto',
                        'box-sizing': 'border-box',
                        width: width - 2 * margin + 'mm',
                        height: height - 2 * margin + 'mm'
                    }"
                >
                    <tr v-for="(tr, tr_index) in rowJson" :key="tr_index">
                        <td
                            v-for="(td, td_index) in tr"
                            :key="td_index"
                            :colspan="td.colspan"
                            :rowspan="td.rowspan"
                            :style="getTdStyle(td.style, tr_index)"
                            v-html="formatValue(td.value, item, td.style)"
                        ></td>
                    </tr>
                </table>
            </div>
        </section>
        <el-dialog title="标签模板" :visible.sync="labelTemplateVisible" width="500px" append-to-body>
            <div>
                <el-select v-model="labelTemplateValue" placeholder="请选择标签模板" clearable>
                    <el-option v-for="item in labelTemplateList" :key="item.id" :label="item.name" :value="item.id">
                    </el-option>
                </el-select>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="labelTemplateVisible = false">取 消</el-button>
                <el-button type="primary" @click="handlePrint">打 印</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import qrcode from 'qrcode'
import print from '@/plugins/print.js'
export default {
    props: {},
    data() {
        return {
            printData: [],
            rowJson: {},
            heightJson: [],
            widthRatio: 0,
            heightRatio: 0,
            labelTemplateVisible: false,
            labelTemplateList: [],
            labelTemplateValue: '',
            width: 0,
            height: 0,
            margin: 0
        }
    },
    methods: {
        showLabelTemplate() {
            let multipleSelection = this.$parent.multipleSelection
            if (multipleSelection.length === 0) {
                this.$message.warning('请选择要打印的数据')
                return
            }
            this.labelTemplateValue = ''
            this.$axios.get('labelTemplate/queryForList').then(res => {
                if (res.data.code == 200) {
                    this.labelTemplateVisible = true
                    this.labelTemplateList = res.data.data
                }
            })
        },
        async handlePrint() {
            if (!this.labelTemplateValue) {
                this.$message.warning('请选择标签模版')
                return
            }
            let multipleSelection = this.$parent.multipleSelection
            let printData = []
            for (let i = 0; i < multipleSelection.length; i++) {
                let item = multipleSelection[i]
                let result = await qrcode.toDataURL(item.code.toString(), { margin: 0 })
                item.qrcode = result
                printData.push(item)
            }
            this.printData = printData

            this.$axios.get('labelTemplate/queryById?id=' + this.labelTemplateValue).then(res => {
                if (res.data.code == 200) {
                    let data = res.data.data
                    this.width = data.width
                    this.height = data.height
                    this.margin = data.margin
                    let excelJson = data.excelJson

                    let totalWidth = 0
                    for (let i = 0; i < excelJson.widthJson.length; i++) {
                        totalWidth = totalWidth + excelJson.widthJson[i]
                    }
                    let totalHeight = 0
                    for (let i = 0; i < excelJson.heightJson.length; i++) {
                        totalHeight = totalHeight + excelJson.heightJson[i]
                    }
                    this.widthRatio = totalWidth / (this.width - this.margin * 2)
                    this.heightRatio = totalHeight / (this.height - this.margin * 2)
                    this.heightJson = excelJson.heightJson
                    this.rowJson = excelJson.rowJson
                    print.printPage('print', this.width + 'mm ' + this.height + 'mm', this.margin + 'mm')
                } else {
                    this.$message.error(res.data.message)
                }
            })
        },
        getTdStyle(style, index) {
            let height = this.heightJson[index] / this.heightRatio
            style.height = height + 'px'
            style['border-left'] = '#000 1px solid'
            style['border-bottom'] = '#000 1px solid'
            style['white-space'] = 'nowrap'
            style['overflow'] = 'hidden'
            style['font-size'] = '10px'
            return [style]
        },
        formatValue(value, item, style) {
            let data = item
            if (value == '{{qrcode}}') {
                let width = parseInt(style.width.replace('px', '')) / this.widthRatio + 'mm'
                let img = '<img src="' + item.qrcode + '" style="width:' + width + '"/>'
                if (data.qrcode.indexOf('<img') === -1) {
                    data.qrcode = img
                }
                value = '{{@qrcode}}'
            }
            const render = this.template.compile(value)
            return render(data)
        }
    }
}
</script>

<style scoped>
::v-deep .el-dialog__body {
    padding: 10px 20px 0px 20px;
}
</style>
