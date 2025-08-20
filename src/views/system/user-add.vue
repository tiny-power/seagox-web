<template>
    <div style="padding: 20px">
        <el-form :model="form" label-width="80px" :rules="formRules" ref="form">
            <el-col :span="8">
                <el-form-item label="所属部门" prop="departmentId">
                    <el-cascader
                        v-model="form.departmentId"
                        :options="departmentOptions"
                        :props="{ checkStrictly: true, emitPath: false, value: 'id', label: 'name' }"
                        clearable
                        placeholder="请选择所属部门"
                    >
                    </el-cascader>
                </el-form-item>
            </el-col>
            <el-col :span="8">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="form.name" placeholder="请输入姓名" clearable></el-input>
                </el-form-item>
            </el-col>
            <el-col :span="8">
                <el-form-item label="性别" prop="sex">
                    <el-select v-model="form.sex" placeholder="请选择性别">
                        <el-option label="男" :value="1"></el-option>
                        <el-option label="女" :value="2"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="8">
                <el-form-item label="账号" prop="account">
                    <el-input v-model="form.account" placeholder="请输入账号" clearable autocomplete="off"></el-input>
                </el-form-item>
            </el-col>
            <el-col :span="8">
                <el-form-item label="密码" prop="password">
                    <el-input
                        autocomplete="new-password"
                        v-model="form.password"
                        show-password
                        placeholder="请输入密码"
                        clearable
                    ></el-input>
                </el-form-item>
            </el-col>
            <el-col :span="8">
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="form.phone" placeholder="请输入手机号" clearable></el-input>
                </el-form-item>
            </el-col>
            <el-col :span="8">
                <el-form-item label="职位" prop="position">
                    <el-input v-model="form.position" placeholder="请输入职位" clearable></el-input>
                </el-form-item>
            </el-col>
            <el-col :span="8">
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="form.email" placeholder="请输入邮箱" clearable></el-input>
                </el-form-item>
            </el-col>
            <el-col :span="24" style="text-align: right">
                <el-form-item>
                    <el-button type="primary" @click="handleSubmit">提交</el-button>
                </el-form-item>
            </el-col>
        </el-form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            departmentOptions: [],
            form: {
                departmentId: '',
                account: '',
                password: '',
                name: '',
                sex: '',
                position: '',
                sort: 0,
                phone: '',
                email: ''
            },
            formRules: {
                account: [
                    { required: true, message: '请输入账号', trigger: 'blur' },
                    { min: 2, message: '长度至少2个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    {
                        pattern: /(?=.*[a-z])(?=.*\d)(?=.*[^a-z0-9])[\S]{8,}/i,
                        message: '密码必须包含字母、数字和特殊字符，且长度至少8位',
                        trigger: 'blur'
                    }
                ],
                departmentId: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
                name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
                sex: [{ required: true, message: '请选择性别', trigger: 'change' }]
            }
        }
    },
    created() {
        this.queryDepartmentList()
    },
    methods: {
        async queryDepartmentList() {
            let res = await this.$axios.get(
                'department/queryByCompanyId?searchCompanyId=' + localStorage.getItem('companyId')
            )
            if (res.data.code == 200) {
                this.departmentOptions = res.data.data
            }
        },
        handleSubmit() {
            var params = {
                departmentId: this.form.departmentId,
                account: this.form.account,
                password: this.form.password,
                name: this.form.name,
                sex: this.form.sex,
                position: this.form.position,
                sort: this.form.sort,
                phone: this.form.phone,
                email: this.form.email
            }
            this.$refs.form.validate(valid => {
                if (valid) {
                    this.$axios.post('user/insert', params).then(res => {
                        if (res.data.code == 200) {
                            this.$message.success('新增成功')
                            this.$store.commit('worktabRemove', this.$route.fullPath)
                        } else {
                            this.$message.error(res.data.message)
                        }
                    })
                }
            })
        }
    }
}
</script>
<style scoped></style>
