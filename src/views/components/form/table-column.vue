<template>
    <el-table-column
        v-if="!element.display || element.display === 1"
        :prop="element.prop"
        :label="element.label"
        :width="element.width"
        align="center"
        :sortable="element.sortable"
    >
        <template slot-scope="scope">
            <div
                v-html="$options.filters.formatter(scope.row, element, scope.row[element.prop], that)"
                @click="cellClick(scope.row, element)"
            ></div>
        </template>
        <template v-if="element.children">
            <table-column v-for="(item, index) in element.children" :key="index" :element="item"></table-column>
        </template>
    </el-table-column>
</template>

<script>
export default {
    name: 'tableColumn',
    props: {
        element: {
            type: Object,
            required: true
        }
    },
    filters: {
        formatter(row, column, value, that) {
            //数据字典
            if (column.formatter) {
                let resultArray = []
                let options = JSON.parse(column.options)
                if (String(value).indexOf(',') > -1) {
                    //数组
                    let cellArray = value.split(',')
                    for (var i = 0; i < options.length; i++) {
                        if (cellArray.includes(options[i].code)) {
                            resultArray.push(options[i].name)
                        }
                    }
                } else {
                    let cellArray = [String(value)]
                    for (var i = 0; i < options.length; i++) {
                        if (cellArray.includes(options[i].code)) {
                            resultArray.push(options[i].name)
                        }
                    }
                }
                value = resultArray.toString()
            }
            if (typeof value == 'undefined') {
                value = ''
            }
            if (that.$parent.$parent && that.$parent.$parent.jsApi) {
                let jsApi = that.$parent.$parent.jsApi
                if (jsApi.methods.hasOwnProperty('cellStyle')) {
                    return that.$parent.$parent.cellStyle(column, value)
                }
            }
            return value
        }
    },
    data() {
        return {
            that: this
        }
    },
    methods: {
        cellClick(row, column) {
            if (this.$parent.$parent && this.$parent.$parent.jsApi) {
                let jsApi = this.$parent.$parent.jsApi
                if (jsApi.methods.hasOwnProperty('cellClick')) {
                    this.$parent.$parent.cellClick(row, column)
                }
            }
        }
    }
}
</script>

<style scoped></style>
