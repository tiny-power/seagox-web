import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// 解决报错
const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace
// push
VueRouter.prototype.push = function push(location, onResolve, onReject) {
    if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
    return originalPush.call(this, location).catch(err => err)
}
// replace
VueRouter.prototype.replace = function push(location, onResolve, onReject) {
    if (onResolve || onReject) return originalReplace.call(this, location, onResolve, onReject)
    return originalReplace.call(this, location).catch(err => err)
}

const routes = [
    {
        path: '/',
        name: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/system/login')
    },
    {
        path: '/flowDisplay',
        name: 'flowDisplay',
        component: () => import('@/views/system/flow-display'),
        meta: {
            title: '流程查看'
        }
    },
    {
        name: 'home',
        path: '/home',
        component: () => import('@/views/system/home'),
        children: [
            {
                name: 'readme',
                path: '/readme',
                component: () => import('@/views/system/readme'),
                meta: {
                    title: '首页'
                }
            },
            {
                name: 'contact',
                path: '/contact',
                component: () => import('@/views/system/contact'),
                meta: {
                    title: '人员管理'
                }
            },
            {
                name: 'role',
                path: '/role',
                component: () => import('@/views/system/role'),
                meta: {
                    title: '角色管理'
                }
            },
            {
                name: 'leave',
                path: '/leave',
                component: () => import('@/views/business/leave'),
                meta: {
                    title: '请假单'
                }
            },
            {
                name: 'leaveDetail',
                path: '/leaveDetail',
                component: () => import('@/views/business/leave-detail'),
                meta: {
                    title: '请假单详情'
                }
            },
            {
                name: 'userAdd',
                path: '/userAdd',
                component: () => import('@/views/system/user-add'),
                meta: {
                    title: '新增用户'
                }
            },
            {
                name: 'userEdit',
                path: '/userEdit',
                component: () => import('@/views/system/user-edit'),
                meta: {
                    title: '编辑用户'
                }
            },
            { 
                name: 'project', 
                path: '/project', 
                component: () => import('@/views/business/project/project'), 
                meta: { 
                    title: '项目管理' 
                } 
            },
            {
                name: 'finance',
                path: '/finance',
                component: () => import('@/views/business/finance'),
                meta: {
                    title: '财务管理'
                }
            },
            { 
                name: 'projectAdd', 
                path: '/projectAdd', component: () => import('@/views/business/project/project-add'), 
                meta: { 
                    title: '新增项目' 
                } 
            },
            { 
                name: 'projectEdit', path: '/projectEdit', 
                component: () => import('@/views/business/project/project-edit'), 
                meta: { 
                    title: '编辑项目' 
                } 
            },
            { 
                name: 'constructionLog', path: '/constructionLog', 
                component: () => import('@/views/business/construction-log'), 
                meta: { 
                    title: '施工日志' 
                } 
            },
            { 
                name: 'constructionLogDetail', path: '/constructionLogDetail', 
                component: () => import('@/views/business/construction-log/detail'), 
                meta: { 
                    title: '施工日志详情' 
                } 
            },
            { 
                name: 'inspection', path: '/inspection', 
                component: () => import('@/views/business/inspection'), 
                meta: { 
                    title: '验收单' 
                } 
            },
            { 
                name: 'inspectionDetail', path: '/inspectionDetail', 
                component: () => import('@/views/business/inspection/detail'), 
                meta: { 
                    title: '验收单详情' 
                } 
            },
            { 
                name: 'issueTicket', path: '/issueTicket', 
                component: () => import('@/views/business/issue-ticket'), 
                meta: { 
                    title: '问题单' 
                } 
            },
            { 
                name: 'issueTicketDetail', path: '/issueTicketDetail', 
                component: () => import('@/views/business/issue-ticket/detail'), 
                meta: { 
                    title: '问题单详情' 
                } 
            },
            { 
                name: 'paymentRequest', path: '/paymentRequest', 
                component: () => import('@/views/business/payment-request'), 
                meta: { 
                    title: '请款单' 
                } 
            },
            { 
                name: 'paymentRequestDetail', 
                path: '/paymentRequestDetail', 
                component: () => import('@/views/business/payment-request/detail'), 
                meta: { 
                    title: '请款单详情' 
                } 
            },
            { 
                name: 'materialArrival', 
                path: '/materialArrival', 
                component: () => import('@/views/business/material-arrival'), 
                meta: { 
                    title: '材料到场' 
                } 
            },
            { 
                name: 'materialArrivalDetail', 
                path: '/materialArrivalDetail', 
                component: () => import('@/views/business/material-arrival/detail'), 
                meta: { 
                    title: '材料到场详情' 
                } 
            },
            { 
                name: 'projectHandover', 
                path: '/projectHandover', 
                component: () => import('@/views/business/project-handover'), 
                meta: { 
                    title: '交接单' 
                } 
            },
            { 
                name: 'projectHandoverDetail', 
                path: '/projectHandoverDetail', 
                component: () => import('@/views/business/project-handover/detail'), 
                meta: { 
                    title: '交接单详情' 
                } 
            },
            {
                name: 'requirement',
                path: '/requirement',
                component: () => import('@/views/business/requirement'),
                meta: { title: '需求沟通' }
            },
            {
                name: 'solutionDesign',
                path: '/solutionDesign',
                component: () => import('@/views/business/solution-design'),
                meta: { title: '方案设计' }
            },
            {
                name: 'constructionDrawing',
                path: '/constructionDrawing',
                component: () => import('@/views/business/construction-drawing'),
                meta: { title: '施工图出图' }
            },
            {
                name: 'repair',
                path: '/repair',
                component: () => import('@/views/business/repair'),
                meta: { title: '报修单' }
            },
            {
                name: 'message',
                path: '/message',
                component: () => import('@/views/system/message'),
                meta: {
                    title: '消息中心'
                }
            },
            {
                name: 'disk',
                path: '/disk',
                component: () => import('@/views/business/disk'),
                meta: {
                    title: '知识库'
                }
            },
            {
                name: 'todoItem',
                path: '/todoItem',
                component: () => import('@/views/system/todo-item'),
                meta: {
                    keepAlive: true,
                    title: '待办事项'
                }
            },
            {
                name: 'readyItem',
                path: '/readyItem',
                component: () => import('@/views/system/ready-item'),
                meta: {
                    keepAlive: true,
                    title: '待发事项'
                }
            },
            {
                name: 'doneItem',
                path: '/doneItem',
                component: () => import('@/views/system/done-item'),
                meta: {
                    keepAlive: true,
                    title: '已办事项'
                }
            },
            {
                name: 'copyItem',
                path: '/copyItem',
                component: () => import('@/views/system/copy-item'),
                meta: {
                    keepAlive: true,
                    title: '抄送事项'
                }
            },
            {
                name: 'selfItem',
                path: '/selfItem',
                component: () => import('@/views/system/self-item'),
                meta: {
                    keepAlive: true,
                    title: '我发起的'
                }
            }
        ]
    },
    {
        path: '/404',
        name: 'NotFound',
        component: () => import('@/views/system/404'),
        meta: { title: '404' }
    }
]

const router = new VueRouter({
    mode: 'history',
    routes
})

import store from '@/store/index'

router.beforeEach((to, from, next) => {
    if (window.platform) {
        document.title = window.platform.title
    } else {
        document.title = localStorage.getItem('title')
    }
    var authorization = localStorage.getItem('Authorization')
    if (authorization) {
        if (!store.state.isAddRouter) {
            store.commit('handleAddRouter', true)
            // 动态路由
            let asyRoutes = JSON.parse(localStorage.getItem('routes'))
            if (asyRoutes) {
                for (let i = 0; i < asyRoutes.length; i++) {
                    let path = asyRoutes[i].path
                    let queryStr = path.split('?')[1]
                    let query = {}
                    if (queryStr) {
                        let queryAry = queryStr.split('&')
                        queryAry.forEach(element => {
                            let queryObj = element.split('=')
                            query[queryObj[0]] = queryObj[1]
                        })
                        path = path.split('?')[0]
                    }
                    router.addRoute('home', {
                        name: path,
                        path: encodeURI('/' + path),
                        component: resolve => require([`@/views/${path}`], resolve),
                        query: query,
                        meta: {
                            title: asyRoutes[i].name
                        }
                    })
                }
                router.addRoute({
                    name: 'notMatch',
                    path: '/:pathMatch(.*)',
                    redirect: '/404'
                })
                next({ ...to, replace: true })
            } else {
                next()
            }
        } else {
            next()
        }
    } else {
        if (to.path === '/' || to.path === '/login') {
            next()
        } else {
            next('/login')
        }
    }
})

router.onError((error, to, from) => {
    router.push('/404')
})

export default router
