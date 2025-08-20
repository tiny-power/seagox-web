<template>
    <el-select
        v-model="property.value"
        :placeholder="property.placeholder"
        clearable
        filterable
        size="medium"
    >
        <el-option
            v-for="item in options"
            :key="item.id"
            :label="item.order_number + '(' + item.customer + ')'"
            :value="item.id"
        >
        </el-option>
    </el-select>
</template>

<script>
export default {
    props: {
        property: {
            type: Object
        }
    },
    data() {
        return {
            options: []
        }
    },
    created() {
        this.queryProjectByCompanyId()
    },
    methods: {
        async queryProjectByCompanyId() {
            let res = await this.$axios.get('cloud/order/queryByCompanyId')
            if (res.data.code == 200) {
                this.options = res.data.data
            }
        }
    }
}
</script>

<style scoped>

</style>
