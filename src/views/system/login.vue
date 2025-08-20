<template>
    <div
        :style="{
            width: '100%',
            height: clientHeight + 'px',
            background: 'url(' + backgroundImage + ') no-repeat',
            'background-size': '100% 100%'
        }"
    >
        <div class="form">
            <div class="title">欢 迎 登 录</div>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
                <el-form-item prop="account">
                    <el-input v-model="ruleForm.account" placeholder="请输入账号" prefix-icon="el-icon-user"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        type="password"
                        v-model="ruleForm.password"
                        placeholder="请输入密码"
                        prefix-icon="el-icon-lock"
                        @keyup.enter.native="onEnter"
                        show-password
                    ></el-input>
                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="submitForm"> 登 录 </el-button>
                </div>
            </el-form>
        </div>
        <!-- <div style="position: absolute; bottom: 10px; margin: auto; width: 100%; text-align: center">
            <a href="https://beian.miit.gov.cn/" target="_blank" style="text-decoration: none; color: #fff"
                >闽ICP备2022002743号</a
            >
        </div> -->
    </div>
</template>

<script>
import client from 'webpack-theme-color-replacer/client'
import forElementUI from 'webpack-theme-color-replacer/forElementUI'
export default {
    data() {
        return {
            clientHeight: 0,
            ruleForm: {
                account: '',
                password: ''
            },
            rules: {
                account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
                password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
            }
        }
    },
    beforeMount() {
        this.clientHeight = document.documentElement.clientHeight || document.body.clientHeight
        this.backgroundImage = require('@/' + window.platform.backgroundImage)
    },
    created() {
        localStorage.clear()
        localStorage.setItem('title', window.platform.title)
    },
    methods: {
        onEnter(event) {
            if (event.keyCode == 13) {
                this.submitForm()
            }
        },
        submitForm() {
            this.$refs.ruleForm.validate(valid => {
                if (valid) {
                    let params = Object.assign({}, this.ruleForm)
                    this.$axios.post('auth/login', params).then(res => {
                        if (res.data.code == 200) {
                            localStorage.setItem('color', res.data.data.color || '#3a6cfa')
                            //if (res.data.data.color) {
                            var options = {
                                newColors: [...forElementUI.getElementUISeries('#3a6cfa')]
                            }
                            client.changer.changeColor(options, Promise).then(() => {})
                            //}
                            localStorage.setItem('alias', res.data.data.alias)
                            localStorage.setItem('logo', res.data.data.logo)
                            localStorage.setItem('mark', res.data.data.mark)
                            localStorage.setItem('companyId', res.data.data.companyId)
                            localStorage.setItem('Authorization', res.data.data.accessToken)
                            if (res.data.data.permissions) {
                                localStorage.setItem('permissions', res.data.data.permissions.split(','))
                            } else {
                                localStorage.setItem('permissions', 'no')
                            }
                            localStorage.setItem('departmentId', res.data.data.departmentId)

                            localStorage.setItem('avatar', res.data.data.avatar)
                            localStorage.setItem('userId', res.data.data.userId)
                            localStorage.setItem('account', res.data.data.account)
                            localStorage.setItem('name', res.data.data.name)
                            localStorage.setItem('company', JSON.stringify(res.data.data.company))

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
                            this.$router.replace({
                                path: this.$route.query.redirect || '/readme'
                            })

                            this.$store.commit('handleLogin')
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

<style scoped>
::v-deep .el-form-item__content {
    line-height: 54px;
}
::v-deep .el-input__inner {
    height: 44px;
}
.form {
    width: 280px;
    height: 360px;
    position: absolute;
    margin: auto;
    top: 0;
    left: 50%;
    right: 0;
    bottom: 0;
    border-radius: 8px;
    background-color: #fff;
    padding: 0px 25px 0px 25px;
}
.title {
    font-weight: 700;
    line-height: 60px;
    color: #364a63;
    text-align: center;
    margin-top: 30px;
    margin-bottom: 10px;
    font-size: 26px;
}
.login-btn button {
    width: 100%;
    height: 44px;
}
</style>
