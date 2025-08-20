export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    if(sizes[i] === 'B' || sizes[i] === 'KB') {
        return parseInt((bytes / Math.pow(k, i))) + ' ' + sizes[i]
    } else {
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
    }
}

// 获取文件类型
export const getFileType = suffix => {
    let result = ''
    // 图片格式
    const imglist = ['png', 'jpg', 'jpeg', 'bmp', 'gif']
    // 进行图片匹配
    result = imglist.find(item => item === suffix)
    if (result) {
        return 'image'
    }
    // 图片格式
    const tiflist = ['tiff', 'tif']
    // 进行图片匹配
    result = tiflist.find(item => item === suffix)
    if (result) {
        return 'tif'
    }
    // 匹配txt
    const txtlist = ['txt']
    result = txtlist.find(item => item === suffix)
    if (result) {
        return 'txt'
    }
    // 匹配 excel
    const excelist = ['xls', 'xlsx']
    result = excelist.find(item => item === suffix)
    if (result) {
        return 'excel'
    }
    // 匹配 word
    const wordlist = ['doc', 'docx']
    result = wordlist.find(item => item === suffix)
    if (result) {
        return 'word'
    }
    // 匹配 pdf
    const pdflist = ['pdf']
    result = pdflist.find(item => item === suffix)
    if (result) {
        return 'pdf'
    }
    // 匹配 ppt
    const pptlist = ['ppt', 'pptx']
    result = pptlist.find(item => item === suffix)
    if (result) {
        return 'ppt'
    }
    // 匹配 视频
    const videolist = ['mp4', 'm2v', 'mkv', 'rmvb', 'wmv', 'avi', 'flv', 'mov', 'm4v']
    result = videolist.find(item => item === suffix)
    if (result) {
        return 'video'
    }
    // 匹配 音频
    const radiolist = ['mp3', 'wav', 'wmv']
    result = radiolist.find(item => item === suffix)
    if (result) {
        return 'radio'
    }
    // 匹配 压缩
    const ziplist = ['zip', 'rar']
    result = ziplist.find(item => item === suffix)
    if (result) {
        return 'zip'
    }
    // 匹配 ofd
    const ofdlist = ['ofd']
    result = ofdlist.find(item => item === suffix)
    if (result) {
        return 'ofd'
    }
    // 匹配 rtf
    const rtflist = ['rtf']
    result = rtflist.find(item => item === suffix)
    if (result) {
        return 'rtf'
    }
    // 其他 文件类型
    return 'other'
}

// 格式化日期，输出值为：2022-01-29
export const formatter = (type, date, format) => {
    if (type === 'date') {
        const o = {
            'M+': date.getMonth() + 1, // 月份
            'd+': date.getDate(), // 日
            'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, // 小时
            'H+': date.getHours(), // 小时
            'm+': date.getMinutes(), // 分
            's+': date.getSeconds(), // 秒
            'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
            S: date.getMilliseconds(), // 毫秒
            a: date.getHours() < 12 ? '上午' : '下午', // 上午/下午
            A: date.getHours() < 12 ? 'AM' : 'PM' // AM/PM
        }
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
        }
        for (let k in o) {
            if (new RegExp('(' + k + ')').test(format)) {
                format = format.replace(
                    RegExp.$1,
                    RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
                )
            }
        }
        return format
    }
}

// 解析动作脚本
export const resolveScript = javascript => {
    let result = {
        fields: {},
        methods: {}
    }
    if (javascript) {
        let splitArray = javascript.split('export ')
        for (let i = 0; i < splitArray.length; i++) {
            if (splitArray[i]) {
                let content = splitArray[i]
                if (content.startsWith('const')) {
                    let value = content.substring(5, content.length).trim()
                    result.fields[value.split('=')[0].trim()] = value.split('=')[1].trim()
                } else if (content.startsWith('let') || content.startsWith('var')) {
                    let value = content.substring(3, content.length).trim()
                    result.fields[value.split('=')[0].trim()] = value.split('=')[1].trim()
                } else if (content.startsWith('function')) {
                    content = content.substring(8, content.length).trim()
                    let startParams = content.indexOf('(')
                    let endParams = content.indexOf(')')
                    let params = []
                    let paramsSlit = content.substring(startParams + 1, endParams).split(',')
                    for (let j = 0; j < paramsSlit.length; j++) {
                        if (paramsSlit[j]) {
                            params.push(paramsSlit[j].trim())
                        }
                    }
                    let startBody = content.indexOf('{')
                    let endBody = content.lastIndexOf('}')
                    result.methods[content.substring(0, startParams).trim()] = {
                        params: params,
                        body: content.substring(startBody + 1, endBody)
                    }
                }
            }
        }
    }
    return result
}

const letter = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'AA',
    'AB',
    'AC',
    'AD',
    'AE',
    'AF',
    'AG',
    'AH',
    'AI',
    'AJ',
    'AK',
    'AL',
    'AM',
    'AN',
    'AO',
    'AP',
    'AQ',
    'AR',
    'AS',
    'AT',
    'AU',
    'AV',
    'AW',
    'AX',
    'AY',
    'AZ',
    'BA',
    'BB',
    'BC',
    'BD',
    'BE',
    'BF',
    'BG',
    'BH',
    'BI',
    'BJ',
    'BK',
    'BL',
    'BM',
    'BN',
    'BO',
    'BP',
    'BQ',
    'BR',
    'BS',
    'BT',
    'BU',
    'BV',
    'BW',
    'BX',
    'BY',
    'BZ',
    'CA',
    'CB',
    'CC',
    'CD',
    'CE',
    'CF',
    'CG',
    'CH',
    'CI',
    'CJ',
    'CK',
    'CL',
    'CM',
    'CN',
    'CO',
    'CP',
    'CQ',
    'CR',
    'CS',
    'CT',
    'CU',
    'CV',
    'CW',
    'CX',
    'CY',
    'CZ',
    'DA',
    'DB',
    'DC',
    'DD',
    'DE',
    'DF',
    'DG',
    'DH',
    'DI',
    'DJ',
    'DK',
    'DL',
    'DM',
    'DN',
    'DO',
    'DP',
    'DQ',
    'DR',
    'DS',
    'DT',
    'DU',
    'DV',
    'DW',
    'DX',
    'DY',
    'DZ'
]

// 解析合并单元格
export const handleMerge = (merges, row, col, td) => {
    for (var i = 0; i < merges.length; i++) {
        var startMerge = merges[i].split(':')[0]
        var endMerge = merges[i].split(':')[1]
        var row_start = Number(startMerge.substr(1, startMerge.length))
        var row_end = Number(endMerge.substr(1, endMerge.length))
        var col_start = letter.indexOf(startMerge.substr(0, 1))
        var col_end = letter.indexOf(endMerge.substr(0, 1))

        if (row >= row_start - 1 && row <= row_end - 1) {
            if (col >= col_start && col <= col_end) {
                if (row === row_start - 1 && col === col_start) {
                    td.rowspan = row_end - row_start + 1
                    td.colspan = col_end - col_start + 1
                    break
                } else {
                    td.rowspan = 0
                    td.colspan = 0
                    break
                }
            }
        }
    }
    return td
}

// 获取样式
export const getStyles = (cell, td, styles) => {
    td.style['white-space'] = 'pre-wrap'
    if (cell.style || cell.style === 0) {
        var cellStyle = styles[cell.style]
        for (let styleType in cellStyle) {
            if (styleType === 'bgcolor') {
                td.style['background-color'] = cellStyle[styleType]
            } else if (styleType === 'align') {
                td.style['text-align'] = cellStyle[styleType]
            } else if (styleType === 'valign') {
                td.style['vertical-align'] = cellStyle[styleType]
            } else if (styleType === 'strike') {
                td.text = '<strike>' + td.text + '</strike>'
            } else if (styleType === 'underline') {
                td.style['text-decoration'] = 'underline'
            } else if (styleType === 'textwrap') {
                td.style['word-wrap'] = 'break-word'
                td.style['word-break'] = 'normal'
            } else if (styleType === 'font') {
                if (cellStyle[styleType].size) {
                    td.style['font-size'] = cellStyle[styleType].size + 'px'
                }
                if (cellStyle[styleType].bold) {
                    td.style['font-weight'] = 'bold'
                }
                if (cellStyle[styleType].italic) {
                    td.style['font-style'] = 'italic'
                }
                if (cellStyle[styleType].name) {
                    td.style['font-family'] = cellStyle[styleType].name
                }
            } else if (styleType === 'border') {
                if (cellStyle[styleType].top) {
                    var topBorder = cellStyle[styleType].top
                    if (topBorder[0] === 'thick') {
                        td.style['border-top'] = 'solid 3px ' + topBorder[1]
                    } else if (topBorder[0] === 'thin') {
                        td.style['border-top'] = 'solid 1px ' + topBorder[1]
                    } else if (topBorder[0] === 'medium') {
                        td.style['border-top'] = 'solid 2px ' + topBorder[1]
                    } else if (topBorder[0] === 'dashed') {
                        td.style['border-top'] = 'dashed 1px ' + topBorder[1]
                    } else if (topBorder[0] === 'dotted') {
                        td.style['border-top'] = 'dotted 1px ' + topBorder[1]
                    } else if (topBorder[0] === 'double') {
                        td.style['border-top'] = 'double 1px ' + topBorder[1]
                    }
                }
                if (cellStyle[styleType].bottom) {
                    var bottomBorder = cellStyle[styleType].bottom
                    if (bottomBorder[0] === 'thick') {
                        td.style['border-bottom'] = 'solid 3px ' + bottomBorder[1]
                    } else if (bottomBorder[0] === 'thin') {
                        td.style['border-bottom'] = 'solid 1px ' + bottomBorder[1]
                    } else if (bottomBorder[0] === 'medium') {
                        td.style['border-bottom'] = 'solid 2px ' + bottomBorder[1]
                    } else if (bottomBorder[0] === 'dashed') {
                        td.style['border-bottom'] = 'dashed 1px ' + bottomBorder[1]
                    } else if (bottomBorder[0] === 'dotted') {
                        td.style['border-bottom'] = 'dotted 1px ' + bottomBorder[1]
                    } else if (bottomBorder[0] === 'double') {
                        td.style['border-bottom'] = 'double 1px ' + bottomBorder[1]
                    }
                }
                if (cellStyle[styleType].left) {
                    var leftBorder = cellStyle[styleType].left
                    if (leftBorder[0] === 'thick') {
                        td.style['border-left'] = 'solid 3px ' + leftBorder[1]
                    } else if (leftBorder[0] === 'thin') {
                        td.style['border-left'] = 'solid 1px ' + leftBorder[1]
                    } else if (leftBorder[0] === 'medium') {
                        td.style['border-left'] = 'solid 2px ' + leftBorder[1]
                    } else if (leftBorder[0] === 'dashed') {
                        td.style['border-left'] = 'dashed 1px ' + leftBorder[1]
                    } else if (leftBorder[0] === 'dotted') {
                        td.style['border-left'] = 'dotted 1px ' + leftBorder[1]
                    } else if (leftBorder[0] === 'double') {
                        td.style['border-left'] = 'double 1px ' + leftBorder[1]
                    }
                }
                if (cellStyle[styleType].right) {
                    var rightBorder = cellStyle[styleType].right
                    if (rightBorder[0] === 'thick') {
                        td.style['border-right'] = 'solid 3px ' + rightBorder[1]
                    } else if (rightBorder[0] === 'thin') {
                        td.style['border-right'] = 'solid 1px ' + rightBorder[1]
                    } else if (rightBorder[0] === 'medium') {
                        td.style['border-right'] = 'solid 2px ' + rightBorder[1]
                    } else if (rightBorder[0] === 'dashed') {
                        td.style['border-right'] = 'dashed 1px ' + rightBorder[1]
                    } else if (rightBorder[0] === 'dotted') {
                        td.style['border-right'] = 'dotted 1px ' + rightBorder[1]
                    } else if (rightBorder[0] === 'double') {
                        td.style['border-right'] = 'double 1px ' + rightBorder[1]
                    }
                }
            } else {
                td.style[styleType] = cellStyle[styleType]
            }
        }
    }
    return td
}

// 添加函数
export const addFunc = (context, name, params, body) => {
    context[name] = function () {
        let func = null
        if (params.length === 0) {
            func = new Function(body).bind(context)
        } else {
            func = new Function(params, body).bind(context)
        }
        let argLength = arguments.length
        if (argLength === 0) {
            return func()
        } else if (argLength === 1) {
            return func(arguments[0])
        } else if (argLength === 2) {
            return func(arguments[0], arguments[1])
        } else if (argLength === 3) {
            return func(arguments[0], arguments[1], arguments[2])
        } else if (argLength === 4) {
            return func(arguments[0], arguments[1], arguments[2], arguments[3])
        } else if (argLength === 5) {
            return func(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4])
        }
    }
}

// 属性转对象值
export const attributeToObject = state => {
    let params = {}
    for (let key in state) {
        let attribute = state[key]
        let type = attribute.type
        let value = attribute.value
        if (
            (type === 'select' || type === 'company' || type === 'department' || type === 'member') &&
            attribute.multiple
        ) {
            params[key] = value.toString()
        } else if (type === 'checkbox' || type === 'cascader') {
            if (value) {
                params[key] = value.toString()
            }
        } else if (type === 'picture' || type === 'upload' || type === 'table' || type === 'editor') {
            params[key] = JSON.stringify(value)
        } else {
            params[key] = value
        }
    }
    return params
}

// 是否是移动端
export const isMobile = () => {
    return /(iPhone|iPad|iPod|iOS|Android|Linux armv8l|Linux armv7l|Linux aarch64)/i.test(navigator.platform)
}

//表格合计
export const getSummaries = (that, param, summaryArray) => {
    const { columns, data } = param
    const sums = []
    columns.forEach((column, index) => {
        if (index === 0) {
            sums[index] = '合计'
            return
        }

        if (summaryArray.indexOf(column.property) != -1) {
            const values = data.map(item => Number(item[column.property]))
            if (!values.every(value => isNaN(value))) {
                sums[index] = values.reduce((prev, curr) => {
                    const value = Number(curr)
                    if (!isNaN(value)) {
                        prev = that.BigNumber(prev)
                        return prev.plus(curr).toString()
                    } else {
                        return prev
                    }
                }, 0)
            } else {
                sums[index] = 0
            }
        } else {
            sums[index] = ''
        }
    })
    return sums
}

// 字段权限解析
export const fieldResolve = fieldOptions => {
    let disabled = []
    let editable = []
    let hidden = []
    for (let k = 0; k < fieldOptions.length; k++) {
        let data = JSON.parse(fieldOptions[k])
        for (let i = 0; i < data.length; i++) {
            let attribute = data[i]

            if (attribute.behavior === 'NORMAL') {
                editable.push(attribute.field)
            } else if (attribute.behavior === 'DISABLED') {
                disabled.push(attribute.field)
            } else if (attribute.behavior === 'HIDDEN') {
                hidden.push(attribute.field)
            }
            if (attribute.type === 'table') {
                let children = attribute.children
                for (let j = 0; j < children.length; j++) {
                    let item = children[j]
                    if (item.behavior === 'NORMAL') {
                        editable.push(item.field)
                    } else if (item.behavior === 'DISABLED') {
                        disabled.push(item.field)
                    } else if (item.behavior === 'HIDDEN') {
                        hidden.push(item.field)
                    }
                }
            }
        }
    }
    return { editable, disabled, hidden }
}
