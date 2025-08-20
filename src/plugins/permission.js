import Vue from 'vue'

const permission = {
    install(Vue) {
        Vue.directive('permission', {
            update(el, binding) {
                let permissions = localStorage.getItem('permissions')
                if (permissions) {
                    const permissionList = permissions.split(',')
                    if (!permissionList || !permissionList.includes(binding.value)) {
                        if (el.parentNode) {
                            el.parentNode.removeChild(el)
                        }
                    }
                }
            }
        })
    }
}

Vue.use(permission)
