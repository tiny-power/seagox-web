<template>
    <div class="drag-container" :style="[config.styles]">
        <el-empty
            description="空数据"
            v-if="config.layout && config.layout.length === 0"
            :image-size="200"
            style="height: 100%; background: #fff; color: #5e6d82"
        ></el-empty>
        <gaugeShowComponent :layout="config.layout" @handleEvent="handleEvent" v-else />
    </div>
</template>

<script>
import gaugeShowComponent from '@/views/components/gauge/gauge-show-component'
import china from '@/utils/china.json'
export default {
    components: {
        gaugeShowComponent
    },
    data() {
        return {
            config: {
                layout: []
            },
            queryData: {},
            jsApi: { fields: {}, methods: {} }
        }
    },
    mounted() {
        this.queryById()
    },
    methods: {
        listToTreeByRule(arr, rule) {
            let ruleArray = rule.split('')
            let ruleList = []
            let ruleMap = {}
            for (let i = 0; i < ruleArray.length; i++) {
                if (i == 0) {
                    ruleList.push(parseInt(ruleArray[i]))
                    ruleMap[ruleArray[i]] = i
                } else {
                    ruleList.push(ruleList[i - 1] + parseInt(ruleArray[i]))
                    ruleMap[String(ruleList[i - 1] + parseInt(ruleArray[i]))] = i
                }
            }

            let r = []
            let hash = {}
            // 将数组转为Object的形式，value为数组中的id
            for (let i = 0; i < arr.length; i++) {
                let json = arr[i]
                hash[json.value] = json
            }
            // 遍历结果集
            for (let j = 0; j < arr.length; j++) {
                // 单条记录
                let aVal = arr[j]
                // 在hash中取出value为单条记录中pid的值
                let curCode = String(aVal.value)

                let index = ruleMap[curCode.length]

                let curKey = null
                if (index != 0) {
                    curKey = curCode.substring(0, ruleList[index - 1])
                }
                let hashVP = hash[curKey]
                // 如果记录的pid存在，则说明它有父节点，将她添加到孩子节点的集合中
                if (hashVP) {
                    // 检查是否有children属性
                    if (hashVP.hasOwnProperty('children')) {
                        let ch = hashVP.children
                        ch.push(aVal)
                        hashVP.children = ch
                    } else {
                        let ch = []
                        ch.push(aVal)
                        hashVP.children = ch
                    }
                } else {
                    r.push(aVal)
                }
            }
            return r
        },
        execMounted() {
            if (this.jsApi.methods.hasOwnProperty('mounted')) {
                this.mounted()
            }
        },
        async queryById() {
            let res = await this.$axios.get('gauge/queryById/' + this.$route.query.id)
            if (res.data.code == 200) {
                if (res.data.data.config) {
                    this.config = JSON.parse(res.data.data.config)
                    this.recursionAttribute(this.config.layout)
                }
                this.jsApi = this.utils.resolveScript(res.data.data.script)
                for (let key in this.jsApi.methods) {
                    this.utils.addFunc(this, key, this.jsApi.methods[key].params, this.jsApi.methods[key].body)
                }
                for (let key in this.jsApi.fields) {
                    this[key] = this.jsApi.fields[key]
                }
                this.execMounted()
            }
        },
        recursionAttribute(layout) {
            for (let i = 0; i < layout.length; i++) {
                let item = layout[i]
                this[item.i] = item
                if (item.type === 'tabs') {
                    for (let j = 0; j < item.tabs.length; j++) {
                        let tab = item.tabs[j]
                        if (tab.children) {
                            this.recursionAttribute(tab.children)
                        }
                    }
                } else if (item.type === 'work') {
                    this.queryTodoItem(item)
                    this.queryDoneItem(item)
                    this.queryCopyItem(item)
                    this.querySelfItem(item)
                    this.queryReadyItem(item)
                } else if (item.type === 'quick') {
                    this.queryQuickAccess(item)
                } else if (item.type === 'chart') {
                    if (item.dataSourceType === 'dataModel' || item.dataSourceType === 'view') {
                        this.$nextTick(() => {
                            var filterDataSql = ''
                            for (let i = 0; i < item.filterData.length; i++) {
                                let filterDataItem = item.filterData[i]
                                if (filterDataItem['field'] && filterDataItem['decider'] === ' is not null') {
                                    let field = filterDataItem['field'].split('|')[0]
                                    if (i != 0) {
                                        filterDataSql = filterDataSql + ' ' + filterDataItem['condition'] + ' '
                                    }
                                    filterDataSql = filterDataSql + field + filterDataItem['decider']
                                } else if (filterDataItem['field'] && filterDataItem['decider'] === 'length') {
                                    let field = filterDataItem['field'].split('|')[0]
                                    if (i != 0) {
                                        filterDataSql = filterDataSql + ' ' + filterDataItem['condition'] + ' '
                                    }
                                    filterDataSql =
                                        filterDataSql +
                                        filterDataItem['decider'] +
                                        '(' +
                                        field +
                                        ')=' +
                                        filterDataItem['value']
                                } else if (filterDataItem['field'] && filterDataItem['value']) {
                                    let field = filterDataItem['field'].split('|')[0]
                                    let type = filterDataItem['field'].split('|')[1]
                                    if (i != 0) {
                                        filterDataSql = filterDataSql + ' ' + filterDataItem['condition'] + ' '
                                    }
                                    filterDataSql = filterDataSql + field + ' ' + filterDataItem['decider'] + ' '
                                    if (filterDataItem['type'] == 'variable') {
                                        if (filterDataItem['decider'] === 'in') {
                                            filterDataSql = filterDataSql + '(' + filterDataItem['value'] + ')' + ' '
                                        } else {
                                            if (type === 'varchar') {
                                                filterDataSql = filterDataSql + "'" + filterDataItem['value'] + "'"
                                            } else {
                                                filterDataSql = filterDataSql + filterDataItem['value']
                                            }
                                        }
                                    } else if (filterDataItem['type'] == 'expression') {
                                        if (type === 'varchar') {
                                            filterDataSql = filterDataSql + "'" + eval(filterDataItem['value']) + "'"
                                        } else {
                                            filterDataSql = filterDataSql + eval(filterDataItem['value'])
                                        }
                                    }
                                }
                            }
                            let params = {
                                tableName: item.dataModel,
                                dimension: item.dimension ? item.dimension.toString() : '',
                                metrics: item.metrics.toString(),
                                filterData: filterDataSql
                            }
                            this.$axios.post('gauge/chartSql', params).then(res => {
                                if (res.data.code == 200) {
                                    item.data = res.data.data
                                    this.reloadChart(item)
                                }
                            })
                        })
                    }
                    if (item.children) {
                        this.recursionAttribute(item.children)
                    }
                } else if (
                    item.type === 'radio' ||
                    item.type === 'checkbox' ||
                    item.type === 'select' ||
                    item.type === 'multiSelect'
                ) {
                    if (item.dataModel) {
                        this.queryDicDetail(item)
                    }
                } else {
                    if (item.children) {
                        this.recursionAttribute(item.children)
                    }
                }
            }
        },
        async queryDicDetail(item) {
            let res = await this.$axios.get('dicDetail/queryDisplay?classifyId=' + item.dataModel)
            if (res.data.code === 200) {
                let result = []
                for (let i = 0; i < res.data.data.length; i++) {
                    result.push({
                        label: res.data.data[i].name,
                        value: res.data.data[i].code
                    })
                }
                item.data = result
            }
        },
        async queryTodoItem(object) {
            let res = await this.$axios.get('flow/queryTodoItem')
            if (res.data.code === 200) {
                this.$set(object, 'todoItem', res.data.data.list)
                this.$set(object, 'todoTotal', res.data.data.total)
            }
        },
        async queryDoneItem(object) {
            let res = await this.$axios.get('flow/queryDoneItem')
            if (res.data.code === 200) {
                this.$set(object, 'doneItem', res.data.data.list)
                this.$set(object, 'doneTotal', res.data.data.total)
            }
        },
        async queryCopyItem(object) {
            let res = await this.$axios.get('flow/queryCopyItem')
            if (res.data.code === 200) {
                this.$set(object, 'copyItem', res.data.data.list)
                this.$set(object, 'copyTotal', res.data.data.total)
            }
        },
        async querySelfItem(object) {
            let res = await this.$axios.get('flow/querySelfItem')
            if (res.data.code === 200) {
                this.$set(object, 'selfItem', res.data.data.list)
                this.$set(object, 'selfTotal', res.data.data.total)
            }
        },
        async queryReadyItem(object) {
            let res = await this.$axios.get('flow/queryReadyItem')
            if (res.data.code === 200) {
                this.$set(object, 'readyItem', res.data.data.list)
                this.$set(object, 'readyTotal', res.data.data.total)
            }
        },
        async queryQuickAccess(object) {
            let res = await this.$axios.get('menu/queryQuickAccess')
            if (res.data.code === 200) {
                let options = []
                if (res.data.data) {
                    for (let i = 0; i < res.data.data.length; i++) {
                        let item = res.data.data[i]
                        if (item.type === 1) {
                            item.color = '#00C458'
                        } else if (item.type === 2) {
                            item.color = '#FC943D'
                        } else if (item.type === 3) {
                            item.color = '#0089FF'
                        } else if (item.type === 4) {
                            item.color = '#FB602D'
                        } else if (item.type === 7) {
                            item.color = '#e6a23c'
                        } else {
                            item.color = '#FF9F00'
                        }
                        options.push(item)
                    }
                }
                this.$set(object, 'options', options)
            }
        },
        recursionData(layout, appointName) {
            for (let i = 0; i < layout.length; i++) {
                let item = layout[i]
                if (item.type === 'chart') {
                    if (item.data && item.data.indexOf(appointName) != -1) {
                        this.reloadChart(item)
                    }
                } else if (item.type === 'text') {
                    if (item.value && item.value.indexOf(appointName) != -1) {
                        try {
                            let pattern = /\{\{(.*?)\}\}/g
                            var matches = item.value.match(pattern)
                            let text = item.value
                            if (matches) {
                                for (let i = 0; i < matches.length; i++) {
                                    let matche = matches[i]
                                    let key = matche.replace(/{{/g, '').replace(/}}/g, '')
                                    text = text.replace(matche, eval(`this.queryData.${key}`))
                                }
                            }
                            this.$set(item, 'text', text.replace(/undefined/g, ''))
                        } catch (e) {
                            console.log(e)
                            this.$set(item, 'text', item.value)
                        }
                    }
                } else if (item.type === 'select') {
                    if (item.data && item.data.indexOf(appointName) != -1) {
                        try {
                            let key = item.data.replace(/{{/g, '').replace(/}}/g, '')
                            this.$set(item, 'options', eval(`this.queryData.${key}`))
                        } catch (e) {
                            console.log(e)
                            this.$set(item, 'options', [])
                        }
                    }
                } else if (item.type === 'multiSelect') {
                    if (item.data && item.data.indexOf(appointName) != -1) {
                        try {
                            let key = item.data.replace(/{{/g, '').replace(/}}/g, '')
                            this.$set(item, 'options', eval(`this.queryData.${key}`))
                        } catch (e) {
                            console.log(e)
                            this.$set(item, 'options', [])
                        }
                    }
                } else if (item.type === 'cascader') {
                    if (item.data && item.data.indexOf(appointName) != -1) {
                        try {
                            let key = item.data.replace(/{{/g, '').replace(/}}/g, '')
                            let result = this.listToTreeByRule(eval(`this.queryData.${key}`), item.levelCode)
                            this.$set(item, 'options', result)
                        } catch (e) {
                            console.log(e)
                            this.$set(item, 'options', [])
                        }
                    }
                } else if (item.type === 'multiCascader') {
                    if (item.data && item.data.indexOf(appointName) != -1) {
                        try {
                            let key = item.data.replace(/{{/g, '').replace(/}}/g, '')
                            let result = this.listToTreeByRule(eval(`this.queryData.${key}`), item.levelCode)
                            this.$set(item, 'options', result)
                        } catch (e) {
                            console.log(e)
                            this.$set(item, 'options', [])
                        }
                    }
                } else if (item.type === 'radio') {
                    if (item.data && item.data.indexOf(appointName) != -1) {
                        try {
                            let key = item.data.replace(/{{/g, '').replace(/}}/g, '')
                            this.$set(item, 'options', eval(`this.queryData.${key}`))
                        } catch (e) {
                            console.log(e)
                            this.$set(item, 'options', [])
                        }
                    }
                } else if (item.type === 'checkbox') {
                    if (item.data && item.data.indexOf(appointName) != -1) {
                        try {
                            let key = item.data.replace(/{{/g, '').replace(/}}/g, '')
                            this.$set(item, 'options', eval(`this.queryData.${key}`))
                        } catch (e) {
                            console.log(e)
                            this.$set(item, 'options', [])
                        }
                    }
                } else if (item.type === 'tree') {
                    if (item.data && item.data.indexOf(appointName) != -1) {
                        try {
                            let key = item.data.replace(/{{/g, '').replace(/}}/g, '')
                            let result = this.listToTreeByRule(eval(`this.queryData.${key}`), item.levelCode)
                            this.$set(item, 'treeData', result)
                        } catch (e) {
                            console.log(e)
                            this.$set(item, 'treeData', [])
                        }
                    }
                } else if (item.type === 'table') {
                    if (item.data && item.data.indexOf(appointName) != -1) {
                        try {
                            let key = item.data.replace(/{{/g, '').replace(/}}/g, '')
                            this.$set(item, 'tabelData', eval(`this.queryData.${key}`))
                        } catch (e) {
                            console.log(e)
                            this.$set(item, 'tabelData', [])
                        }
                    }
                }
                if (item.type === 'tabs') {
                    for (let j = 0; j < item.tabs.length; j++) {
                        let tab = item.tabs[j]
                        if (tab.children) {
                            this.recursionData(tab.children, appointName)
                        }
                    }
                } else {
                    if (item.children) {
                        this.recursionData(item.children, appointName)
                    }
                }
            }
        },
        reloadChart(item) {
            let chartData = item.data
            if (chartData.length === 0) {
                this.$set(item, 'hasData', false)
            } else {
                this.$set(item, 'hasData', true)
            }
            this.$nextTick(() => {
                if (item.data) {
                    this.$echarts.registerMap('china', china, {})
                    if (!document.getElementById(item.i)) {
                        return
                    }
                    var chart = this.$echarts.init(document.getElementById(item.i))
                    chart.resize()
                    chart.clear()

                    var option = {
                        title: {
                            left: item.titleAlign || 'center',
                            text: item.title
                        }
                    }
                    if (item.chartType === 'bar' || item.chartType === 'line') {
                        // 柱状图、折线图
                        let xAxisData = []
                        let seriesMap = {}
                        for (let j = 0; j < chartData.length; j++) {
                            let type = chartData[j].type || 'direct'
                            if (!seriesMap.hasOwnProperty(type)) {
                                seriesMap[type] = []
                            }
                            if (!xAxisData.includes(chartData[j].name)) {
                                xAxisData.push(chartData[j].name)
                            }
                            seriesMap[type].push(chartData[j].value)
                        }
                        let series = []
                        for (let key in seriesMap) {
                            series.push({
                                name: key === 'direct' ? '' : key,
                                type: item.chartType,
                                label: {
                                    show: true
                                },
                                data: seriesMap[key]
                            })
                        }

                        option.tooltip = {
                            trigger: 'axis'
                        }
                        option.legend = {
                            bottom: 10
                        }
                        option.xAxis = {
                            data: xAxisData
                        }
                        option.yAxis = {}

                        option.series = series
                    } else if (item.chartType === 'bar-y-category') {
                        // 条形图
                        let xAxisData = []
                        let seriesMap = {}
                        for (let j = 0; j < chartData.length; j++) {
                            let type = chartData[j].type || 'direct'
                            if (!seriesMap.hasOwnProperty(type)) {
                                seriesMap[type] = []
                            }
                            if (!xAxisData.includes(chartData[j].name)) {
                                xAxisData.push(chartData[j].name)
                            }
                            seriesMap[type].push(chartData[j].value)
                        }
                        let series = []
                        for (let key in seriesMap) {
                            series.push({
                                name: key === 'direct' ? '' : key,
                                type: 'bar',
                                label: {
                                    show: true
                                },
                                data: seriesMap[key]
                            })
                        }

                        option.tooltip = {
                            trigger: 'axis'
                        }
                        option.legend = {}
                        option.xAxis = {}
                        option.yAxis = {
                            data: xAxisData
                        }
                        option.series = series
                    } else if (item.chartType === 'pie') {
                        // 饼状图
                        option.tooltip = {
                            trigger: 'item',
                            formatter: '{b} : {c} ({d}%)'
                        }
                        option.series = [
                            {
                                type: 'pie',
                                radius: '65%',
                                label: {
                                    formatter: '{b}: {c} ({d}%)'
                                },
                                data: chartData
                            }
                        ]
                    } else if (item.chartType === 'pie-doughnut') {
                        // 环形图
                        option.tooltip = {
                            trigger: 'item',
                            formatter: '{b} : {c} ({d}%)'
                        }
                        option.series = [
                            {
                                type: 'pie',
                                radius: ['40%', '70%'],
                                label: {
                                    formatter: '{b}: {c} ({d}%)'
                                },
                                data: chartData
                            }
                        ]
                    } else if (item.chartType === 'funnel' || item.chartType === 'gauge') {
                        // 漏斗图、仪表盘
                        option.tooltip = {
                            trigger: 'item'
                        }
                        option.series = [
                            {
                                type: item.chartType,
                                mapType: 'china',
                                data: chartData
                            }
                        ]
                    } else if (item.chartType === 'mix-line-bar') {
                        // 折柱混合
                        let xAxisData = []
                        let seriesData = []
                        for (let j = 0; j < chartData.length; j++) {
                            xAxisData.push(chartData[j].name)
                            seriesData.push(chartData[j].value)
                        }

                        option.tooltip = {
                            trigger: 'axis'
                        }
                        option.xAxis = {
                            data: xAxisData
                        }
                        option.yAxis = {}
                        option.series = [
                            {
                                type: 'bar',
                                label: {
                                    show: true
                                },
                                data: seriesData
                            },
                            {
                                type: 'line',
                                label: {
                                    show: true
                                },
                                data: seriesData
                            }
                        ]
                    } else if (item.chartType === 'map') {
                        // 地图
                        option.tooltip = {
                            trigger: 'item'
                        }
                        option.geo = {
                            map: 'china',
                            label: {
                                show: true,
                                color: 'rgba(0,0,0,0.7)'
                            }
                        }

                        option.series = [
                            {
                                type: 'map',
                                geoIndex: 0,
                                data: chartData
                            }
                        ]
                    }
                    chart.setOption(option)
                }
            })
        },
        handleEvent(type, params, row) {
            if (params[type]) {
                if (type === 'rowDblclick') {
                    this[params.i].selectedRow = row
                }
                let func = new Function('params', 'this.' + params[type] + '()').bind(this)
                func(params)
            }
        }
    }
}
</script>

<style scoped>
.drag-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    background-color: rgb(240, 242, 245);
}
::-webkit-scrollbar {
    width: 4px;
    height: 4px;
}
::-webkit-scrollbar-thumb {
    width: 4px;
    background: #7d7d7d;
}
::-webkit-scrollbar-track {
    width: 4px;
    background: #eee;
}
</style>
