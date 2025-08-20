import Vue from 'vue'

const thousandsSeparators = {
    install(Vue) {
        Vue.directive('thousandsSeparators', {
            inserted(el, binding) {
                if (binding.value && binding.value.thousandsSeparators) {
                    if (el.tagName.toLocaleUpperCase() !== 'INPUT') {
                        el = el.getElementsByTagName('input')[0]
                    }
                    if (el.value) {
                        el.value = parseFloat(el.value).toLocaleString('zh', {
                            minimumFractionDigits: binding.value.precision || 0,
                            maximumFractionDigits: binding.value.precision || 0
                        })
                        el.onblur = e => {
                            let a = el.value.replace(/,/g, '')
                            if (a) {
                                el.value = parseFloat(el.value).toLocaleString('zh', {
                                    minimumFractionDigits: binding.value.precision || 0,
                                    maximumFractionDigits: binding.value.precision || 0
                                })
                            }
                        }
                    }
                }
            }
        })
    }
}

Vue.use(thousandsSeparators)
