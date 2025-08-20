<template>
    <div style="background: white; width: 100%">
        <div>
            <div style="text-align: left">
                <el-button
                    style="margin: 5px"
                    type="primary"
                    size="small"
                    icon="el-icon-plus"
                    @click="handleAddDetail"
                    v-if="!disabled"
                    >新增</el-button
                >
            </div>
            <el-form :model="tableForm" ref="tableDataForm" size="small">
                <el-table
                    ref="tableData"
                    :data="tableForm.tableData"
                    max-height="560px"
                    style="width: 100%"
                    border
                >
                    <el-table-column fixed align="center" label="序号" type="index" width="50"></el-table-column>
                    <el-table-column align="center" label="姓名">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input
                                    v-model="scope.row.name"
                                    placeholder="请输入姓名"
                                    :disabled="disabled"
                                ></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="性别">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-select v-model="scope.row.gender" placeholder="请选择性别">
                                    <el-option label="男" :value="1"></el-option>
                                    <el-option label="女" :value="2"></el-option>
                                </el-select>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="职务">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input
                                    v-model="scope.row.post"
                                    placeholder="请输入职务"
                                    :disabled="disabled"
                                ></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="手机号码">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input
                                    v-model="scope.row.phone"
                                    placeholder="请输入手机号码"
                                    :disabled="disabled"
                                ></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="电子邮件">
                        <template slot-scope="scope">
                            <el-form-item>
                                <el-input
                                    v-model="scope.row.email"
                                    placeholder="请输入电子邮件"
                                    :disabled="disabled"
                                ></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="75" fixed="right" v-if="!disabled">
                        <template slot-scope="scope">
                            <el-button type="text" @click="handleDelDetail(scope.$index)" size="small">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-form>
        </div>
    </div>
</template>

<script>
import Schema from 'async-validator'
export default {
    data() {
        return {
            tableForm: {
                tableData: []
            },
            disabled: false
        }
    },
    created() {
        if (this.$router.currentRoute.query.id) {
            //this.disabled = true
            this.queryDetailData()
        }
    },
    methods: {
        handleAddDetail() {
            this.tableForm.tableData.push({})
        },
        handleDelDetail(index) {
            this.tableForm.tableData.splice(index, 1)
        },
        valid() {
            let validFlag = false
            if (this.tableForm.tableData.length == 0) {
                this.$message.error('联系人不能为空')
                return validFlag
            }
            let valid = true
            const descriptor = {
                name: {
                    type: 'string',
                    required: true,
                    message: '姓名不能为空'
                },
                gender: {
                    type: 'integer',
                    required: true,
                    message: '性别不能为空'
                },
                phone: {
                    type: 'string',
                    required: true,
                    message: '手机号码不能为空'
                }
            }
            const validator = new Schema(descriptor)
            for (let i = 0; i < this.tableForm.tableData.length; i++) {
                if (valid) {
                    validator.validate(this.tableForm.tableData[i], (errors, fields) => {
                        if (errors) {
                            valid = false
                            this.$message.error('第' + (i + 1) + '行，' + errors[0].message)
                            return
                        }
                    })
                }
            }
            return valid
        },
        queryDetailData() {
            let params = {
                customerId: this.$router.currentRoute.query.id
            }
            this.$axios.get('cloud/contacts/queryDetailByCustomerId', { params }).then(res => {
                if (res.data.code == 200) {
                    this.tableForm.tableData = res.data.data
                } else {
                    this.$message.error(res.data.message)
                }
            })
        }
    }
}
</script>

<style scoped>
::v-deep .el-form-item {
    margin-bottom: 0px;
}
</style>
