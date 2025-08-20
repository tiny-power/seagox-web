<template>
    <div class="header">
        <div class="sidebar-logo-container">
            <div class="sidebar-logo-container-menu" @click="openMenu">
                <i class="el-icon-menu" style="color: #fff; font-size: 40px"></i>
            </div>
            <div class="navbar-left">
                <img class="sidebar-logo" src="@/assets/logo.png" />
                <div>{{ alias }}</div>
            </div>
        </div>
        <div class="navbar">
            <div class="navbar-right">
                <!-- <i class="el-icon-full-screen" style="font-size: 22px; color: #fff; cursor: pointer"></i> -->
                <div @click="handleMessage">
                    <el-badge
                        :is-dot="messageNumber != 0"
                        :style="{
                            'margin-left': '15px',
                            'margin-right': '15px'
                        }"
                    >
                        <i class="el-icon-bell" style="font-size: 22px; color: #fff; cursor: pointer"></i>
                    </el-badge>
                </div>
                <el-dropdown trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                        <span style="color: #fff">{{ name }}</span>
                        <i class="el-icon-arrow-down el-icon--right" style="color: #fff"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item icon="el-icon-office-building" command="company" v-if="switchCompany"
                            >切换单位</el-dropdown-item
                        >
                        <el-dropdown-item icon="el-icon-lock" command="password">修改密码</el-dropdown-item>
                        <el-dropdown-item icon="el-icon-switch-button" command="loginout">退出登陆</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
        <!--修改密码界面-->
        <el-dialog
            title="修改密码"
            width="520px"
            :visible.sync="passVisible"
            :close-on-click-modal="false"
            :append-to-body="true"
            :modal-append-to-body="false"
        >
            <el-form :model="passForm" label-width="80px" :rules="passFormRules" ref="passForm">
                <el-form-item label="旧密码" prop="oldPassword">
                    <el-input
                        type="password"
                        v-model="passForm.oldPassword"
                        clearable
                        placeholder="请输入旧密码"
                        show-password
                    ></el-input>
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                    <el-input
                        type="password"
                        v-model="passForm.newPassword"
                        clearable
                        placeholder="请输入新密码"
                        show-password
                    ></el-input>
                </el-form-item>

                <el-form-item label="确认密码" prop="morePass">
                    <el-input
                        type="password"
                        v-model="passForm.morePass"
                        clearable
                        placeholder="请输入确认密码"
                        show-password
                    ></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="passVisible = false">取消</el-button>
                <el-button type="primary" @click.native="passSubmit">提交</el-button>
            </div>
        </el-dialog>
        <!--切换单位-->
        <el-dialog
            title="切换单位"
            width="520px"
            :visible.sync="companyVisible"
            :close-on-click-modal="false"
            :append-to-body="true"
            :modal-append-to-body="false"
        >
            <el-cascader
                v-model="companyId"
                :options="companyList"
                :show-all-levels="false"
                :props="{ checkStrictly: true, emitPath: false, value: 'id', label: 'name' }"
                filterable
            >
            </el-cascader>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="companyVisible = false">取消</el-button>
                <el-button type="primary" @click.native="changeCompanySubmit">确定</el-button>
            </div>
        </el-dialog>
        <sidebar ref="menu"></sidebar>
    </div>
</template>
<script>
import sidebar from '@/views/system/sidebar'
export default {
    components: {
        sidebar
    },
    data() {
        var checkAge = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请再次输入密码'))
            } else if (value !== this.passForm.newPassword) {
                callback(new Error('两次输入密码不一致!'))
            } else {
                callback()
            }
        }
        var checkOld = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入新密码！'))
            } else if (value == this.passForm.oldPassword) {
                callback(new Error('新密码不能与旧密码一样'))
            } else {
                callback()
            }
        }
        return {
            title: window.platform.title,
            switchCompany: window.platform.switchCompany,
            avatar: localStorage.getItem('avatar'),
            passVisible: false,
            passForm: {
                oldPassword: '',
                newPassword: '',
                morePass: ''
            },
            passFormRules: {
                oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
                newPassword: [
                    { required: true, message: '请输入新密码', trigger: 'blur' },
                    {
                        pattern: /(?=.*[a-z])(?=.*\d)(?=.*[^a-z0-9])[\S]{8,}/i,
                        message: '密码必须包含字母、数字和特殊字符，且长度至少8位',
                        trigger: 'blur'
                    },
                    { validator: checkOld, trigger: 'blur' }
                ],
                morePass: [
                    { required: true, message: '请再次输入密码', trigger: 'blur' },
                    { validator: checkAge, trigger: 'blur' }
                ]
            },
            companyVisible: false,
            companyId: Number(localStorage.getItem('companyId')),
            messageNumber: 0
        }
    },
    computed: {
        name() {
            return localStorage.getItem('name')
        },
        alias() {
            return localStorage.getItem('alias')
        },
        companyList() {
            return JSON.parse(localStorage.getItem('company'))
        }
    },
    created() {
        this.queryUnRead()
    },
    methods: {
        async queryUnRead() {
            let res = await this.$axios.get('message/queryUnRead')
            if (res.data.code === 200) {
                this.messageNumber = res.data.data
            }
        },
        handleCommand(command) {
            if (command == 'loginout') {
                localStorage.clear()
                this.$router.push('/login')
            } else if (command == 'password') {
                this.passVisible = true
                if (this.$refs.passForm) {
                    this.$refs.passForm.resetFields()
                }
            } else if (command == 'company') {
                this.companyVisible = true
            }
        },
        passSubmit() {
            this.$refs.passForm.validate(valid => {
                if (valid) {
                    this.$axios.post('user/updatePassword', this.passForm).then(res => {
                        if (res.data.code == 200) {
                            this.$message.success('修改成功')
                            this.$router.push('/login')
                        } else {
                            this.$message.error(res.data.message)
                        }
                    })
                }
            })
        },
        changeCompanySubmit() {
            this.$axios.post('company/change/' + this.companyId, {}).then(res => {
                if (res.data.code == 200) {
                    this.$message.success('切换成功')
                    localStorage.setItem('alias', res.data.data.alias)
                    localStorage.setItem('logo', res.data.data.logo)
                    localStorage.setItem('mark', res.data.data.mark)
                    localStorage.setItem('companyId', res.data.data.companyId)
                    localStorage.setItem('Authorization', res.data.data.accessToken)
                    localStorage.setItem('departmentId', res.data.data.departmentId)

                    if (res.data.data.permissions) {
                        localStorage.setItem('permissions', res.data.data.permissions.split(','))
                    } else {
                        localStorage.setItem('permissions', 'no')
                    }

                    // 动态路由添加
                    localStorage.setItem('routes', JSON.stringify(res.data.data.routes))
                    this.$store.commit('handleAddRouter', true)
                    let asyRoutes = res.data.data.routes
                    for (let i = 0; i < asyRoutes.length; i++) {
                        let path = asyRoutes[i].path
                        let queryStr = path.split('?')[1]
                        let query = {}
                        if (queryStr) {
                            let queryAry = queryStr.split('&')
                            queryAry.forEach(element => {
                                let queryObj = element.split('=')
                                query[queryObj[0]] = queryObj[1]
                            })
                            path = path.split('?')[0]
                        }
                        if (asyRoutes[i].type == 7) {
                            this.$router.addRoute({
                                name: path,
                                path: encodeURI('/' + path),
                                component: resolve => require([`@/views/${path}`], resolve),
                                query: query,
                                meta: {
                                    title: asyRoutes[i].name
                                }
                            })
                        } else {
                            this.$router.addRoute('home', {
                                name: path,
                                path: encodeURI('/' + path),
                                component: resolve => require([`@/views/${path}`], resolve),
                                query: query,
                                meta: {
                                    title: asyRoutes[i].name
                                }
                            })
                        }
                    }

                    this.$store.commit('closeAll')
                    this.$router.go(0)
                } else {
                    this.$message.error(res.data.message)
                }
            })
        },
        errorHandler() {
            return true
        },
        openMenu() {
            this.$refs.menu.openDrawer()
        },
        handleMessage() {
            this.$router.push('/message')
        }
    }
}
</script>
<style scoped>
::v-deep .el-badge__content.is-fixed {
    top: 3px !important;
    right: 12px !important;
}
::v-deep .el-dialog__body {
    padding: 10px 20px 0px 20px;
}
::v-deep .el-avatar {
    background: transparent;
}
.header {
    box-shadow: unset;
    box-sizing: border-box;
    border: 0px solid transparent;
    width: 100%;
    height: 60px;
    font-size: 18px;
    background: #3a6cfa;
    position: fixed;
}
.sidebar-logo-container {
    position: relative;
    height: 60px;
    display: flex;
    align-items: center;
}
.sidebar-logo-container-menu {
    background: #025ee7;
    width: 86px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-sizing: border-box;
}
.sidebar-logo {
    width: 32px;
    height: 32px;
    background: transparent;
    margin-right: 8px;
}
.navbar-left {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
    letter-spacing: 1px;
    font-weight: 700;
    margin-left: 15px;
    height: 100%;
}
.navbar {
    position: fixed;
    top: 0;
    right: 0;
}
.hamburger-container {
    float: left;
    display: flex;
    padding: 0px 15px;
    cursor: pointer;
}
.navbar-right {
    float: right;
    padding-right: 20px;
    display: flex;
    align-items: center;
}
.navbar-right .el-dropdown-link {
    cursor: pointer;
    height: 60px;
    display: flex;
    align-items: center;
}
.user-logo {
    width: 36px;
    height: 36px;
    border-radius: 36px;
}
.el-dropdown-menu__item {
    text-align: center;
}
.el-icon-arrow-down {
    font-size: 12px;
}
::v-deep .el-badge__content.is-fixed {
    top: 12px;
    right: 12px;
}
::v-deep .el-menu--horizontal {
    width: 960px;
    overflow: auto;
    display: flex;
}
::v-deep .el-menu.el-menu--horizontal {
    border-bottom: solid 0px #fff;
}
.color-box {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
}
.color-item {
    width: 165px;
    height: 130px;
    background: #ffffff;
    box-shadow: 0px 3px 16px 0px rgba(210, 211, 212, 0.5);
    border-radius: 4px;
    position: relative;
    margin: 5px;
}
.color-item > img {
    width: 100%;
}
.color-title {
    width: 100%;
    position: absolute;
    bottom: -5px;
    text-align: center;
}
</style>
