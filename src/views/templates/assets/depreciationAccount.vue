<template>
    <div class="container">
        <div class="title">折旧相关事项说明</div>
        <div class="catalogue">一、政府会计制度及折旧方法说明：</div>
        <div class="catalogue-detail">
            1.资产折旧/摊销范围：文物和陈列品、动植物、图书档案、单独计价入账的土地不提折旧；价值类型为“名义金额”的固定资产不提折旧；价值类型为“名义金额”或使用年限不确定的无形资产不提折旧（摊销）；
        </div>
        <div class="catalogue-detail">2.折旧/摊销方法：平均年限法；</div>
        <div class="catalogue-detail">
            &nbsp;&nbsp;&nbsp;&nbsp;政府会计制度：卡片入账时，月折旧额=价值/折旧年限；当后续业务中价值或折旧年限改变时，则重算月折旧额：新月折旧额=（调整后价值-累计折旧）/（调整后折旧年限-已提折旧月数），后续以新月折旧额提折旧。
        </div>
        <div class="catalogue-detail">3.资产应计提折旧/摊销的总额：资产原值（累计折旧额的最大值等于资产原值）；</div>
        <div class="catalogue-detail">4.折旧/摊销计提规则：</div>
        <div class="catalogue-detail">
            &nbsp;&nbsp;&nbsp;&nbsp;当月增加的资产，当月开始计提折旧/摊销；当月减少的资产，当月不再计提折旧/摊销；
        </div>
        <div class="catalogue-detail">5.尾差处理：最后一期提完。</div>
        <div class="catalogue">二、按分类设置折旧年限：</div>
        <div class="catalogue-detail">1.为资产分类设置对应的折旧年限，默认值为规定范围的最低使用年限；</div>
        <div class="catalogue-detail">2.房屋类的资产信息卡的折旧年限根据建筑结构设定；</div>
        <div class="catalogue-detail">3.土地类的资产信息卡的折旧年限根据地类用途设定。</div>
        <div class="catalogue">三、名称说明：</div>
        <div class="catalogue-detail">
            1.
            建账日期：单位建立资产折旧账本的时间，在建账时对单位资产进行初始折旧，计算截止至建账日期前一个月的累计折旧值；
        </div>
        <div class="catalogue-detail">2. 首次计提起点：作为计算资产信息卡折旧的起始依据日期。</div>
        <div class="leaderTitle">建账设置</div>
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="180px">
            <el-row>
                <el-col :span="8">
                    <el-form-item label="建账单位">
                        <el-input v-model="ruleForm.companyName" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="变动资产计提起点" prop="changeProvision">
                        <el-select
                            v-model="ruleForm.changeProvision"
                            placeholder="请选择变动资产计提起点"
                            :disabled="disabled"
                        >
                            <el-option label="记账日期" :value="1"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="建账年月" prop="period">
                        <el-date-picker
                            v-model="ruleForm.period"
                            type="date"
                            placeholder="请选择建账年月"
                            value-format="yyyy-MM-dd"
                            clearable
                            :disabled="disabled"
                        >
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="处置资产的计提起点" prop="disposeProvision">
                        <el-select
                            v-model="ruleForm.disposeProvision"
                            placeholder="请选择处置资产的计提起点"
                            :disabled="disabled"
                        >
                            <el-option label="记账日期" :value="1"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="新增资产的计提起点" prop="insertProvision">
                        <el-select
                            v-model="ruleForm.insertProvision"
                            placeholder="请选择新增资产的计提起点"
                            :disabled="disabled"
                        >
                            <el-option label="记账日期" :value="1"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row type="flex" justify="center">
                <el-form-item label-width="0px">
                    <el-button type="primary" @click="submitForm" v-if="!disabled">开始建帐</el-button>
                    <el-button type="primary" v-if="disabled">查看建帐详情</el-button>
                    <el-button type="danger" v-if="disabled" @click="handleReverseAccount">反建帐</el-button>
                </el-form-item>
            </el-row>
        </el-form>
    </div>
</template>
<script>
export default {
    data() {
        return {
            ruleForm: {
                companyName: localStorage.getItem('alias'),
                period: '',
                changeProvision: 1,
                disposeProvision: 1,
                insertProvision: 1
            },
            rules: {
                period: [{ required: true, message: '请选择建账年月', trigger: 'blur' }],
                changeProvision: [{ required: true, message: '请选择变动资产计提起点', trigger: 'change' }],
                disposeProvision: [{ required: true, message: '请选择处置资产的计提起点', trigger: 'change' }],
                insertProvision: [{ required: true, message: '请选择新增资产的计提起点', trigger: 'change' }]
            },
            disabled: false
        }
    },
    mounted() {
        this.queryAccountInfo()
    },
    methods: {
        async queryAccountInfo() {
            let res = await this.$axios.get('provisionDepreciation/accountInfo')
            if (res.data.code === 200) {
                if (res.data.data) {
                    this.disabled = true
                    this.ruleForm = res.data.data
                    this.ruleForm.companyName = localStorage.getItem('alias')
                }
            }
        },
        submitForm() {
            this.$refs.ruleForm.validate(valid => {
                if (valid) {
                    alert('submit!')
                }
            })
        },
        handleReverseAccount() {
            this.$axios.post('provisionDepreciation/delete/' + this.ruleForm.id, {}).then(res => {
                if (res.data.code == 200) {
                    this.$message.success('提交成功')
                    this.ruleForm = {
                        companyName: localStorage.getItem('alias'),
                        period: '',
                        changeProvision: 1,
                        disposeProvision: 1,
                        insertProvision: 1
                    }
                    this.disabled = false
                } else {
                    this.$message.error(res.data.message)
                }
            })
        }
    }
}
</script>
<style scoped>
.container {
    padding: 15px 30px;
}
.title {
    font-size: 16px;
    margin-bottom: 12px;
    font-weight: bold;
}
.catalogue {
    color: #333;
    padding-left: 12px;
    line-height: 24px;
}
.catalogue-detail {
    color: #666;
    padding-left: 36px;
    line-height: 24px;
    font-size: 13px;
}
.leaderTitle:before {
    width: 5px;
    height: 23px;
    background: #2b66f6;
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
}
.leaderTitle {
    font-size: 16px;
    color: #333 !important;
    padding-left: 15px;
    margin-top: 30px;
    margin-bottom: 16px;
    font-weight: 700;
    position: relative;
}
</style>
