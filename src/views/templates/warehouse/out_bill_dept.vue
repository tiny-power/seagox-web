<template>
    <div>
        <el-autocomplete
            v-model="deptName"
            :fetch-suggestions="querySearch"
            placeholder="请输入部门"
            :disabled="disabled"
            @blur="handleBlur"
            @select="handleBlur"
        ></el-autocomplete>
    </div>
</template>
<script>
export default {
    data() {
        return {
            deptName: '',
            disabled: false,
            deptList: []
        }
    },
    created() {
        this.queryNameByGroup()
        this.deptName = this.$parent.formModel.dept_name
        if (this.$router.currentRoute.query.id) {
            this.disabled = true
        }
    },
    methods: {
        async queryNameByGroup() {
            let res = await this.$axios.get('cloud/department/queryNameByGroup')
            if (res.data.code === 200) {
                this.deptList = res.data.data
            }
        },
        valid() {
            if (this.deptName) {
                return true
            } else {
                this.$message.error('请输入部门')
                return false
            }
        },
        querySearch(queryString, cb) {
            var deptList = this.deptList
            var results = queryString ? deptList.filter(this.createFilter(queryString)) : deptList
            cb(results)
        },
        createFilter(queryString) {
            return deptName => {
                return deptName.value.toLowerCase().indexOf(queryString.toLowerCase()) != -1
            }
        },
        handleBlur() {
            if (this.deptName) {
                this.$parent.$refs.out_bill_last[0].queryLastTime(this.deptName)
            }
        }
    }
}
</script>

<style scoped>
::v-deep .el-autocomplete {
    width: 100%;
}
</style>
