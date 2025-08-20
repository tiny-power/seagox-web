import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import '@/plugins/axios'
import '@/plugins/permission'
import '@/plugins/thousandsSeparators'
import '@/css/main.css'
import '@/css/iconfont.css'

import echarts from '@/utils/echarts'
Vue.prototype.$echarts = echarts

import template from '@/utils/art-template'
Vue.prototype.template = template

import * as utils from '@/utils/utils'
Vue.prototype.utils = utils

import dayjs from 'dayjs'
Vue.prototype.dayjs = dayjs

import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
Vue.use(mavonEditor)

import { BigNumber } from 'bignumber.js'
Vue.prototype.BigNumber = BigNumber

import ElementUI from 'element-ui'
Vue.use(ElementUI)

Vue.config.productionTip = false
Vue.prototype.$store = store
new Vue({
    router,
    store,
    render: h => h(App),
    beforeCreate() {
        Vue.prototype.$bus = this
    }
}).$mount('#app')
