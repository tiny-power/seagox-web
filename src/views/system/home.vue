<template>
    <div>
        <top />
        <div style="padding-top: 60px; height: calc(100vh - 60px)">
            <worktab ref="worktab" />
            <div
                style="
                    height: calc(100vh - 100px);
                    margin-top: 1px;
                    border-top: 3px solid #f4f6fa;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
                    box-sizing: border-box;
                    overflow: auto;
                "
            >
                <keep-alive>
                    <router-view :ref="key" :key="key" v-if="$route.meta.keepAlive"></router-view>
                </keep-alive>
                <router-view v-if="!$route.meta.keepAlive"></router-view>
            </div>
        </div>
    </div>
</template>

<script>
import top from '@/views/system/top'
import worktab from '@/views/system/worktab'
export default {
    components: {
        top,
        worktab
    },
    computed: {
        key() {
            return this.$route.fullPath
        }
    }
}
</script>
<style scoped></style>
