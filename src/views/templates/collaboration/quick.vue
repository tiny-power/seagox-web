<template>
    <!-- 快捷入口 -->
    <div style="height: 100%; box-sizing: border-box">
        <el-card style="height: 100%">
            <div slot="header">
                <span>常用功能</span>
            </div>
            <div :style="{ height: height - 80 + 'px' }">
                <el-scrollbar style="height: 100%">
                    <div style="display: flex; flex-wrap: wrap; row-gap: 20px; column-gap: 10px">
                        <div
                            @click="handleQuickAccess(option)"
                            style="
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                                align-items: center;
                                width: 100px;
                                cursor: pointer;
                            "
                            v-for="(option, index) in options"
                            :key="index"
                        >
                            <div
                                :style="{
                                    width: '68px',
                                    height: '68px',
                                    'border-radius': '16px',
                                    'text-align': 'center',
                                    'line-height': '68px',
                                    background: option.color
                                }"
                            >
                                <i :class="option.icon" style="color: #fff; font-size: 30px"></i>
                            </div>
                            <div
                                style="
                                    width: 100px;
                                    margin-top: 8px;
                                    font-size: 14px;
                                    overflow: hidden;
                                    white-space: nowrap;
                                    text-overflow: ellipsis;
                                    text-align: center;
                                "
                            >
                                {{ option.name }}
                            </div>
                        </div>
                    </div>
                </el-scrollbar>
            </div>
        </el-card>
    </div>
</template>
<script>
export default {
    props: ['height'],
    data() {
        return {
            options: []
        }
    },
    mounted() {
        this.queryQuickAccess()
    },
    methods: {
        async queryQuickAccess() {
            let options = [
                {
                    type: 3,
                    name: '新建事项',
                    icon: 'iconfont icon-duban',
                    color: 'linear-gradient(180deg, #3793FF, #0017E4)',
                    path: '0'
                }
            ]
            let colors = [
                'linear-gradient(180deg, #2a6cf9, #61a3ff)',
                'linear-gradient(180deg, #ff6e65, #ff5a42)',
                'linear-gradient(180deg, #40de61, #00be5a)',
                'linear-gradient(180deg, #ff9200, #ffb450)',
                'linear-gradient(180deg, #00b7db, #00dfd2)'
            ]
            let res = await this.$axios.get('shortcut/queryListByUserId')
            if (res.data.code === 200) {
                if (res.data.data) {
                    for (let i = 0; i < res.data.data.length; i++) {
                        let item = res.data.data[i]
                        item.color = colors[(i + 1) % 5]
                        options.push(item)
                    }
                }
                this.options = options
            }
        },
        handleQuickAccess(item) {
            if (item.type === 1) {
                // 列表
                this.$router.push({
                    path: '/formList',
                    query: {
                        id: item.path,
                        title: item.name
                    }
                })
            } else if (item.type === 3) {
                // 新增页面
                this.$router.push({
                    path: '/handleCustomForm',
                    query: {
                        formId: item.path,
                        title: item.name,
                        time: new Date().getTime()
                    }
                })
            } else if (item.type === 4) {
                // 系统菜单
                this.$router.push('/' + item.path)
            } else if (item.type === 6) {
                // 仪表板
                this.$router.push({
                    path: '/analysis',
                    query: {
                        id: item.path,
                        title: item.name,
                        time: new Date().getTime()
                    }
                })
            } else if (item.type === 7) {
                // 单页面
                this.$router.push('/' + item.path)
            }
        }
    }
}
</script>
<style scoped></style>
