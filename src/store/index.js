import Vue from 'vue'
import Vuex from 'vuex'
import router from '@/router'
Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        isAddRouter: false,
        worktab: {
            list: [
                {
                    name: 'readme',
                    title: '首页',
                    path: '/readme'
                }
            ],
            current: {
                name: 'readme',
                title: '首页',
                path: '/readme'
            }
        }
    },
    mutations: {
        handleLogin(state) {
            const worktab = {
                list: [
                    {
                        name: 'readme',
                        title: '首页',
                        path: '/readme'
                    }
                ],
                current: {
                    name: 'readme',
                    title: '首页',
                    path: '/readme'
                }
            }
            state.worktab = worktab
        },
        handleAddRouter(state, p) {
            state.isAddRouter = p
        },
        worktabRemove(state, p) {
            // 关闭标签
            const index = state.worktab.list.findIndex(item => item.path === p)
            if (index > -1) {
                // 清理 keep alive - end
                state.worktab.list.splice(index, 1)
                // 返回到前一页
                if (state.worktab.list.length > 0 && index > 0) {
                    router.push(state.worktab.list[index - 1].path).catch(err => {
                        //console.log(err)
                    })
                } else {
                    router.push('/readme').catch(err => {
                        //console.log(err)
                    })
                }
            }
        },
        worktabRoute(state, p) {
            const index = state.worktab.list.findIndex(s => s.path === p.to.path)
            if (index > -1) {
                // 标签已存在
                state.worktab.current = state.worktab.list[index]
            } else {
                // 标签不存在，现在新建
                state.worktab.list.push(p.to)
                state.worktab.current = p.to
            }
        },
        closeAll(state) {
            state.worktab = {
                list: [
                    {
                        name: 'readme',
                        title: '首页',
                        path: '/readme'
                    }
                ],
                current: {
                    name: 'readme',
                    title: '首页',
                    path: '/readme'
                }
            }
            router.push('/readme').catch(err => {
                //console.log(err)
            })
        }
    }
})
