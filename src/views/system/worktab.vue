<template>
    <div>
        <el-tabs v-model="activeTab" @tab-remove="removeTab" @tab-click="clickTab" style="padding: 0px 60px 0px 20px">
            <el-tab-pane
                v-for="t in worktabs"
                :key="t.path"
                :label="t.title"
                :name="t.path"
                :closable="t.path !== '/readme'"
            >
            </el-tab-pane>
        </el-tabs>
        <el-tooltip content="关闭所有页签" placement="bottom-start">
            <i class="el-icon-close" @click="closeAll"></i>
        </el-tooltip>
    </div>
</template>
<script>
export default {
    created() {
        setTimeout(() => {
            this.activeTab = this.$store.state.worktab.current.path
        }, 500)
    },
    watch: {
        '$store.state.worktab.current'(tab) {
            this.activeTab = tab.path
        }
    },
    computed: {
        worktabs() {
            return this.$store.state.worktab.list
        }
    },
    data() {
        return {
            activeTab: 'name'
        }
    },
    methods: {
        clickTab(tab) {
            this.$router.push(this.worktabs[1 * tab.index].path).catch(err => {
                //console.log(err)
            })
        },
        removeTab(name) {
            // 判断需要清空缓存的页面
            if (this.$parent.$refs[name]) {
                const cache = this.$parent.$refs[name].$vnode.parent.componentInstance.cache
                // 拿到keep-alive的keys
                delete cache[name]
            }
            this.$store.commit('worktabRemove', name)
        },
        closeAll() {
            this.$store.commit('closeAll')
        }
    }
}
</script>
<style scoped>
.el-icon-close {
    cursor: pointer;
    position: absolute;
    top: 70px;
    right: 10px;
}
</style>
