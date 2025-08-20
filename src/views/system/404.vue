<template>
    <div
        :style="{
            width: '100%',
            height: clientHeight + 'px',
            background: 'url(' + backgroundImage + ') no-repeat',
            'background-size': '100% 100%',
            display: 'flex',
            'justify-content': 'center',
            'align-items': 'center'
        }"
    >
        <el-button type="primary" round @click="backToHome" style="position: fixed; bottom: 45px">返回首页</el-button>
    </div>
</template>
<script>
export default {
    beforeMount() {
        this.clientHeight = document.documentElement.clientHeight || document.body.clientHeight
        this.backgroundImage = require('@/assets/404.png')
    },
    methods: {
        backToHome() {
            this.$router.replace({
                path: '/readme'
            })
        }
    }
}
</script>
