<template>
    <div>
        <div
            style="
                display: flex;
                align-items: center;
                padding: 6px 10px;
                border-bottom: 8px solid #f4f6fa;
                height: 56px;
                box-sizing: border-box;
            "
        >
            <div style="font-size: 16px">{{ title }}</div>
            <div style="flex: 1; text-align: right">
                <!--有流程-->
                <el-button
                    type="primary"
                    icon="el-icon-printer"
                    @click="handlePrint"
                    v-if="!isAddView && printTemplate"
                    size="medium"
                    >打印</el-button
                >
                <el-button
                    type="danger"
                    icon="el-icon-delete"
                    v-if="isFlow && !isAddView && submitButton"
                    @click="handleDelete"
                    size="medium"
                    >删除</el-button
                >
                <el-button
                    type="primary"
                    icon="el-icon-refresh-right"
                    @click="handleRevoke"
                    v-if="isFlow && revokeButton"
                    size="medium"
                    >撤回</el-button
                >
                <el-button
                    type="primary"
                    icon="el-icon-check"
                    @click="submitForm('submit')"
                    v-if="isFlow && submitButton"
                    size="medium"
                    >提交</el-button
                >
                <el-button
                    type="primary"
                    icon="el-icon-s-check"
                    @click="handleApproval"
                    v-if="isFlow && approvalButton"
                    size="medium"
                    >审批</el-button
                >
                <!--新增页面(无流程)-->
                <el-button
                    type="primary"
                    icon="el-icon-check"
                    @click="submitForm('submit')"
                    size="medium"
                    v-if="!isFlow && isAddView"
                    >提交</el-button
                >
                <!--编辑页面(无流程)-->
                <el-button
                    type="primary"
                    icon="el-icon-check"
                    @click="submitForm('submit')"
                    size="medium"
                    v-if="!isFlow && !isAddView && permissions.includes(formMark + ':edit')"
                    >提交</el-button
                >
                <el-button
                    icon="el-icon-document"
                    @click="submitForm('stage')"
                    v-if="isFlow && stageButton"
                    size="medium"
                    >暂存</el-button
                >
            </div>
        </div>
        <div style="display: flex; padding-left: 8px; padding-top: 8px">
            <el-tabs
                type="border-card"
                v-model="activeName"
                v-if="(isFlow && !isAddView) || freeProcess"
                :style="{ width: '100%', height: height - 180 + 'px' }"
            >
                <el-tab-pane label="基本信息" name="basic">
                    <senior-form
                        :style="{ height: height - 220 + 'px', overflow: 'auto' }"
                        v-if="formCofig"
                        ref="seniorForm"
                        id="seniorForm"
                        :behavior="behavior"
                        :formModel="formModel"
                        :formCofig="formCofig"
                        :disabled="disabled"
                        :editable="editable"
                        :hidden="hidden"
                        :stageButton="stageButton"
                    />
                </el-tab-pane>
                <el-tab-pane label="流程设计" name="process-design" lazy v-if="freeProcess && stageButton">
                    <flowDesigner
                        ref="flowDesigner"
                        :style="{ height: height - 220 + 'px', overflow: 'auto' }"
                        :resources="resources"
                    />
                </el-tab-pane>
                <el-tab-pane label="流程记录" name="process-record" lazy v-if="isFlow && !stageButton">
                    <process />
                </el-tab-pane>
                <el-tab-pane label="流程监控" name="process-monitor" lazy v-if="isFlow && !stageButton">
                    <flow :style="{ height: height - 220 + 'px', overflow: 'auto' }" />
                </el-tab-pane>
            </el-tabs>
            <senior-form
                :style="{ width: '100%', overflow: 'auto', height: height - 180 + 'px' }"
                v-if="formCofig && (isAddView || !isFlow) && !freeProcess"
                ref="seniorForm"
                id="seniorForm"
                :behavior="behavior"
                :formModel="formModel"
                :formCofig="formCofig"
                :disabled="disabled"
                :editable="editable"
                :hidden="hidden"
                :stageButton="stageButton"
            />
        </div>
        <!--流程审批-->
        <el-dialog title="审批" width="500px" :visible.sync="approvalVisible" :close-on-click-modal="false">
            <el-form :model="handleForm" label-width="0px" ref="approvalForm">
                <el-form-item>
                    <el-radio-group v-model="handleForm.approved">
                        <el-radio :label="true">同意</el-radio>
                        <el-radio :label="false">不同意</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item style="margin-top: -20px">
                    <el-input type="textarea" :rows="10" placeholder="请输入处理意见" v-model="handleForm.comment">
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="handleForm.rejectNode" v-if="!handleForm.approved">
                        <el-option v-for="item in rejectNodeList" :key="item.id" :label="item.label" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="approvalVisible = false">取消</el-button>
                <el-button type="primary" @click="submitForm('approve')">提交</el-button>
            </div>
        </el-dialog>
        <!--节点选择-->
        <el-dialog title="节点选择" width="500px" :visible.sync="manualVisible" :close-on-click-modal="false">
            <div>
                <el-table :data="manualNode" @selection-change="handleSelectionChange" :show-header="false">
                    <el-table-column type="selection" width="55"> </el-table-column>
                    <el-table-column label="名称" prop="label"></el-table-column>
                </el-table>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="manualVisible = false">取消</el-button>
                <el-button type="primary" @click="handleManual">提交</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import seniorForm from '@/views/system/senior-form'
import flow from '@/views/system/flow'
import process from '@/views/system/process'
import flowDesigner from '@/views/system/flow-designer'
export default {
    components: {
        seniorForm,
        flow,
        process,
        flowDesigner
    },
    data() {
        return {
            title: this.$route.query.title,
            height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
            behavior: 'NORMAL',
            formCofig: null,
            formModel: {},
            disabled: [],
            editable: [],
            hidden: [],
            handleForm: {
                approved: true,
                comment: '',
                rejectNode: ''
            },
            approvalVisible: false,
            isFlow: false,
            submitButton: false,
            approvalButton: false,
            stageButton: false,
            revokeButton: false,
            rejectNodeList: [],
            options: {},
            activeName: 'basic',
            isAddView: this.$route.query.id ? false : true,
            freeProcess: false,
            resources: {},
            formMark: '',
            printTemplate: false,
            manualVisible: false,
            manualNode: [],
            multipleSelection: [],
            appoint: [],
            processInstanceId: ''
        }
    },
    computed: {
        mark() {
            return localStorage.getItem('mark')
        },
        permissions() {
            return localStorage.getItem('permissions')
        }
    },
    created() {
        this.reportDetail()
    },
    methods: {
        async reportDetail() {
            var params = {
                id: this.$route.query.id,
                formId: this.$route.query.formId
            }
            let res = await this.$axios.get('form/queryCustomDetail', { params })
            if (res.data.code == 200) {
                this.formMark = res.data.data.mark
                let fieldOptions = this.utils.fieldResolve(res.data.data.fieldOptions)
                this.disabled = fieldOptions.disabled
                this.editable = fieldOptions.editable
                this.hidden = fieldOptions.hidden
                this.isFlow = res.data.data.isFlow
                this.submitButton = res.data.data.submitButton
                this.approvalButton = res.data.data.approvalButton
                this.stageButton = res.data.data.stageButton
                this.revokeButton = res.data.data.revokeButton
                this.rejectNodeList = res.data.data.rejectNodeList
                this.processInstanceId = res.data.data.processInstanceId
                if (this.$route.query.id) {
                    if (res.data.data.isFlow) {
                        if (this.submitButton) {
                            this.behavior = 'NORMAL'
                        } else {
                            this.behavior = 'DISABLED'
                        }
                    } else {
                        this.behavior = 'NORMAL'
                    }
                }
                this.options = res.data.data.options
                if (this.options.printPath) {
                    if (this.options.printPath.length != 0) {
                        this.printTemplate = true
                    }
                }
                this.formModel = res.data.data.data
                this.formCofig = res.data.data.workbook
                this.formCofig.javascript = this.options.javascript
                this.freeProcess = res.data.data.freeProcess
                if (this.freeProcess) {
                    if (this.$route.query.id) {
                        this.resources = JSON.parse(this.formModel.resources)
                    } else {
                        this.resources = {
                            nodes: [
                                {
                                    id: 'start',
                                    type: 'start',
                                    label: '开始',
                                    x: 100,
                                    y: 140
                                },
                                {
                                    id: 'end',
                                    type: 'end',
                                    label: '结束',
                                    x: 280,
                                    y: 140
                                }
                            ],
                            edges: [
                                {
                                    source: 'start',
                                    target: 'end',
                                    label: null
                                }
                            ]
                        }
                    }
                }
            }
        },
        beforeLeave(activeName) {},
        handleApproval() {
            this.handleForm = {
                approved: true,
                comment: '',
                rejectNode: this.rejectNodeList[0].id
            }
            this.approvalVisible = true
            if (this.$refs.approvalForm) {
                this.$refs.approvalForm.resetFields()
            }
        },
        handleSelectionChange(val) {
            this.multipleSelection = val
        },
        handleManual() {
            if (this.multipleSelection.length === 0) {
                this.$message.error('至少选择一个节点')
            } else {
                let appoint = []
                for (let i = 0; i < this.multipleSelection.length; i++) {
                    appoint.push(this.multipleSelection[i].id)
                }
                this.appoint = appoint
                if (this.submitButton) {
                    this.submitForm('submit')
                } else if (this.approvalButton) {
                    this.submitForm('approve')
                }
                this.manualVisible = false
            }
        },
        //stage:暂存;approve:审批;submit:提交;
        submitForm(type) {
            let params = {
                _type: type,
                _formId: this.$route.query.formId,
                id: this.$route.query.id
            }
            params.appoint = this.appoint.toString()
            if (this.$refs.seniorForm.jsApi.methods.hasOwnProperty('extraParameter')) {
                params = Object.assign(params, this.$refs.seniorForm.extraParameter())
            }
            if (this.freeProcess) {
                if (!this.$refs.seniorForm.state.title.value) {
                    this.$message.error('标题不能为空')
                    return
                }
                if (this.$refs.flowDesigner) {
                    let result = this.$refs.flowDesigner.validate()
                    params['resources'] = JSON.stringify(result)
                } else {
                    params['resources'] = JSON.stringify(this.resources)
                }
            }
            if (type === 'approve') {
                //审批
                params.approved = this.handleForm.approved
                params.comment = this.handleForm.comment
                params.rejectNode = this.handleForm.rejectNode
                let result = this.$refs.seniorForm.validate()
                if (!result) {
                    return
                }
            } else if (type === 'submit') {
                //提交
                let result = this.$refs.seniorForm.validate()
                if (!result) {
                    return
                }
            }
            if (this.$refs.seniorForm.jsApi.methods.hasOwnProperty('validateRule')) {
                let result = this.$refs.seniorForm.validateRule()
                if (!result) {
                    return
                }
            }
            params = Object.assign(params, this.utils.attributeToObject(this.$refs.seniorForm.state))
            let insertUrl = 'form/insertCustom'
            let updateUrl = 'form/updateCustom'
            if (this.$refs.seniorForm.jsApi.methods.hasOwnProperty('baseUrl')) {
                let result = this.$refs.seniorForm.baseUrl()
                if (result.insertUrl) {
                    insertUrl = result.insertUrl
                }
                if (result.updateUrl) {
                    updateUrl = result.updateUrl
                }
            }
            if (this.$route.query.id) {
                this.$axios.post(updateUrl, params).then(res => {
                    if (res.data.code == 200) {
                        this.$message.success('提交成功')
                        this.$parent.$refs.worktab.removeTab(this.$route.fullPath)
                        this.$store.commit('worktabRemove', this.$route.fullPath)
                        this.$bus.$emit('updateTable')
                        this.approvalVisible = false
                    } else if (res.data.code == 10004) {
                        this.manualNode = res.data.data
                        this.manualVisible = true
                    } else {
                        this.$message.error(res.data.message)
                    }
                })
            } else {
                this.$axios.post(insertUrl, params).then(res => {
                    if (res.data.code == 200) {
                        this.$message.success('提交成功')
                        this.$parent.$refs.worktab.removeTab(this.$route.fullPath)
                        this.$store.commit('worktabRemove', this.$route.fullPath)
                        this.$bus.$emit('updateTable')
                        this.approvalVisible = false
                    } else if (res.data.code == 10004) {
                        this.manualNode = res.data.data
                        this.manualVisible = true
                    } else {
                        this.$message.error(res.data.message)
                    }
                })
            }
        },
        async handleRevoke() {
            let res = await this.$axios.get('flow/revokeTask/' + this.processInstanceId)
            if (res.data.code == 200) {
                this.$message.success('撤回成功')
                this.$store.commit('worktabRemove', this.$route.fullPath)
            } else {
                this.$message.error(res.data.message)
            }
        },
        handlePrint() {
            window.open(
                window.platform.url +
                    '/form/print?businessType=' +
                    this.$route.query.formId +
                    '&businessKey=' +
                    this.$route.query.id
            )
        },
        handleDelete() {
            this.$confirm('亲，确认要删除吗？', '提示', { type: 'warning' }).then(() => {
                var params = {
                    businessType: this.$route.query.formId,
                    businessKeys: this.$route.query.id
                }
                this.$axios.post('form/deleteCustom', params).then(res => {
                    if (res.data.code == 200) {
                        this.$message.success('删除成功')
                        this.$store.commit('worktabRemove', this.$route.fullPath)
                        this.$bus.$emit('updateTable')
                    } else {
                        this.$message.error(res.data.message)
                    }
                })
            })
        }
    }
}
</script>
<style scoped>
::v-deep .el-dialog__body {
    padding: 5px 20px 0px 20px;
}
::v-deep .el-tabs--border-card > .el-tabs__content {
    padding: 0px;
}
.approval {
    width: 324px;
    background-color: #fff;
    box-sizing: border-box;
    box-shadow: 0 8px 10px -5px rgb(0 0 0 / 20%), 0 16px 24px 2px rgb(0 0 0 / 14%), 0 6px 30px 5px rgb(0 0 0 / 12%);
    padding: 10px;
}
.reset {
    position: absolute;
    top: 100px;
    right: 100px;
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    border-radius: 50%;
    background-color: #3a6cfa;
    color: #fff;
    cursor: pointer;
}
</style>
