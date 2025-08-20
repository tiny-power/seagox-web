const template = require('art-template/lib/template-web')

template.defaults.delimiters = ['{{', '}}'] // 设置模板标签的起止字符
template.defaults.cache = false // 禁用模板缓存

template.defaults.imports.toUpperCase = function (value) {
    return value.toUpperCase()
}

template.defaults.imports.text = function (value, format) {
    if (value && format) {
        try {
            if (format === '0.00%') {
                return (value * 100).toFixed(2) + '%'
            }
            if (format === '#,###') {
                return Number(value.toFixed(2)).toLocaleString()
            }
        } catch (err) {}
    }
    return value
}

// 导出
export default template
