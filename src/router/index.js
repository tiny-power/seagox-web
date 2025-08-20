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
                name: 'message',
                path: '/message',
                component: () => import('@/views/system/message'),
                meta: {
                    title: '消息中心'
                }
            },
            {
                name: 'handleCustomForm',
                path: '/handleCustomForm',
                component: () => import('@/views/system/handle-custom-form'),
                meta: {
                    keepAlive: true
                }
            },
            {
                name: 'formList',
                path: '/formList',
                component: () => import('@/views/system/form-list'),
                meta: {
                    keepAlive: true
                }
            },
            {
                name: 'analysis',
                path: '/analysis',
                component: () => import('@/views/system/analysis'),
                meta: {
                    keepAlive: true
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
            },
            {
                name: 'application',
                path: '/application',
                component: () => import('@/views/system/application'),
                meta: {
                    keepAlive: true,
                    title: '应用中心'
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
                    if (asyRoutes[i].type == 7) {
                        router.addRoute({
                            name: path,
                            path: encodeURI('/' + path),
                            component: resolve => require([`@/views/${path}`], resolve),
                            query: query,
                            meta: {
                                title: asyRoutes[i].name
                            }
                        })
                    } else {
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
