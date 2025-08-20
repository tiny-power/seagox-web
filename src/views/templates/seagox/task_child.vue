<template>
    <div style="background:#fff">
        <el-select           
            v-model="value"
            placeholder="请选择上级任务"
            clearable
            filterable
            :disabled="disabled"
        >
            <el-option
                v-for="item in options"
                :key="item.id"
                :label="item.name"
                :value="item.id">
            </el-option>
        </el-select>
    </div>
</template>

<script>
export default {
    data() {
        return {
            value: '',
            options: [],
            disabled: false
        }
    },
    created() {
        if (this.$router.currentRoute.query.id) {
            this.disabled = true
            this.value = this.$parent.formModel.parent_id
            this.queryTaskByProjectId(this.$parent.state.project_id.value)
        }
    },
    methods: {
        async queryTaskByProjectId(projectId) {
            let params = {
                projectId: projectId
            }
            let res = await this.$axios.get('cloud/project/queryTaskRootByProjectId', {params})
            if (res.data.code == 200) {
                this.options = res.data.data
            }
        }
    }
}
</script>

<style scoped>

</style>
