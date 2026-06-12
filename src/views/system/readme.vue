<template>
    <div class="readme-container">
        <div class="empty" :style="{ height: '100%' }">
            <img src="@/assets/welcome.png" height="480" />
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
            component: null,
            config: {
                layout: []
            },
            queryData: {},
            jsApi: { fields: {}, methods: {} }
        }
    },
    computed: {
        mark() {
            return localStorage.getItem('mark')
        }
    },
    mounted() {
        
    },
    methods: {

        
    }
}
</script>

<style scoped>
.readme-container {
    height: 100%;
    overflow: auto;
}
::v-deep .el-card {
    border-radius: 12px;
}
::v-deep .el-scrollbar__wrap {
    overflow-x: hidden;
}
.empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f9f9f9;
}

.drag-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    box-sizing: border-box;
}
</style>
