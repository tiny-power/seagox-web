<template>
    <div class="container">
        <div class="header">
            <div class="header-left">
                <div class="header-back" @click="toReturn"><i class="el-icon-arrow-left"></i></div>
                <div class="header-title">{{ title }}</div>
            </div>
        </div>
        <div id="relation-box" :style="{ height: height - 60 + 'px' }">
            <div
                v-for="item in nodes"
                :class="item.type"
                :key="item.id"
                :style="{
                    left: item.x + 'px',
                    top: item.y + 'px',
                    background: item.background,
                    border: item.border
                }"
                :id="item.id"
            >
                <div
                    v-if="
                        item.type === 'start' ||
                        item.type === 'end' ||
                        item.type === 'parallelGateWay' ||
                        item.type === 'exclusiveGateway' ||
                        item.type === 'manualTask'
                    "
                >
                    <div
                        v-if="
                            item.type == 'start' ||
                            item.type == 'end' ||
                            item.type == 'userTask' ||
                            item.type == 'ccTask' ||
                            item.type == 'scriptTask'
                        "
                    >
                        {{ item.label }}
                    </div>
                    <div v-if="item.type === 'parallelGateWay'">
                        <i class="el-icon-plus" style="font-weight: bold"></i>
                    </div>
                    <div v-if="item.type === 'exclusiveGateway'">
                        <i class="el-icon-close" style="font-weight: bold"></i>
                    </div>
                    <div v-if="item.type === ''">
                        <i class="el-icon-rank" style="font-weight: bold"></i>
                    </div>
                </div>
                <div v-else>
                    <div>{{ item.label }}</div>
                    <i
                        class="el-icon-user type-icon"
                        style="color: #6b80a8"
                        v-if="item.type === 'userTask' && item.status == 0"
                    ></i>
                    <i
                        class="el-icon-position type-icon"
                        style="color: #6b80a8"
                        v-if="item.type === 'ccTask' && item.status == 0"
                    ></i>
                    <i
                        class="el-icon-user type-icon"
                        style="color: #77c67c"
                        v-if="item.type === 'userTask' && item.status == 1"
                    ></i>
                    <i
                        class="el-icon-position type-icon"
                        style="color: #77c67c"
                        v-if="item.type === 'ccTask' && item.status == 1"
                    ></i>
                    <i
                        class="el-icon-user type-icon"
                        style="color: #22242a"
                        v-if="item.type === 'userTask' && !item.status && item.status != 0"
                    ></i>
                    <i
                        class="el-icon-position type-icon"
                        style="color: #22242a"
                        v-if="item.type === 'ccTask' && !item.status && item.status != 0"
                    ></i>
                    <img
                        v-if="item.status == 0"
                        class="status-icon"
                        src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyBjbGFzcz0iaWNvbiIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTYuMDBweCIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGw9IiM2YjgwYTgiIGQ9Ik01MTIgOTcyLjhjLTI1NC40ODk2IDAtNDYwLjgtMjA2LjMxMDQtNDYwLjgtNDYwLjhTMjU3LjUxMDQgNTEuMiA1MTIgNTEuMnM0NjAuOCAyMDYuMzEwNCA0NjAuOCA0NjAuOC0yMDYuMzEwNCA0NjAuOC00NjAuOCA0NjAuOHpNMjU2IDU2My4yYTUxLjIgNTEuMiAwIDEgMCAwLTEwMi40IDUxLjIgNTEuMiAwIDAgMCAwIDEwMi40eiBtMjU2IDBhNTEuMiA1MS4yIDAgMSAwIDAtMTAyLjQgNTEuMiA1MS4yIDAgMCAwIDAgMTAyLjR6IG0yNTYgMGE1MS4yIDUxLjIgMCAxIDAgMC0xMDIuNCA1MS4yIDUxLjIgMCAwIDAgMCAxMDIuNHoiICAvPjwvc3ZnPg=="
                    />
                    <img
                        v-if="item.status == 1"
                        class="status-icon"
                        src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyBjbGFzcz0iaWNvbiIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTYuMDBweCIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGw9IiM3N0M2N0MiIGQ9Ik01MTIgOTcyLjhjLTI1NC40ODk2IDAtNDYwLjgtMjA2LjMxMDQtNDYwLjgtNDYwLjhTMjU3LjUxMDQgNTEuMiA1MTIgNTEuMnM0NjAuOCAyMDYuMzEwNCA0NjAuOCA0NjAuOC0yMDYuMzEwNCA0NjAuOC00NjAuOCA0NjAuOHogbS0yMTIuMzAwOC01MjMuODc4NGEyNS42IDI1LjYgMCAwIDAtMzYuMTk4NCAzNi4xOTg0bDE4MS4wMTc2IDE4MC45OTJhMjUuNiAyNS42IDAgMCAwIDM2LjE5ODQgMGwyODkuNjM4NC0yODkuNjEyOGEyNS42IDI1LjYgMCAwIDAtMzYuMTk4NC0zNi4xOTg0TDQ2Mi41OTIgNjExLjgxNDRsLTE2Mi45MTg0LTE2Mi44OTI4eiIgIC8+PC9zdmc+"
                    />
                </div>
            </div>
        </div>
        <img class="pass" src="@/assets/pass.png" v-if="passFlag" />
    </div>
</template>

<script>
import { jsPlumb } from 'jsplumb'
export default {
    data() {
        return {
            height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
            jsPlumbInstance: '',
            jsPlumbSetting: {
                Connector: [
                    'Flowchart',
                    {
                        gap: 2,
                        midpoint: 0,
                        cornerRadius: 3
                    }
                ],
                Endpoint: ['Blank', { radius: 6 }],
                EndpointStyle: {
                    stroke: '#888',
                    fill: '#fff'
                },
                PaintStyle: { stroke: '#000', strokeWidth: 2 },
                Overlays: [['Arrow', { width: 10, length: 10, location: 1 }]]
            },
            jsPlumbConnectOptions: {
                isSource: true,
                isTarget: true,
                anchor: 'AutoDefault'
            },
            nodes: [],
            edges: [],
            passFlag: false
        }
    },
    computed: {
        title() {
            return this.$route.query.title
        }
    },
    mounted() {
        document.onselectstart = function () {
            return false
        }
        this.queryFlowInfo()
    },
    methods: {
        async queryFlowInfo() {
            var params = {
                businessType: this.$route.query.businessType,
                businessKey: this.$route.query.businessKey
            }
            let res = await this.$axios.post('flow/flowInfo', params)
            if (res.data.code == 200) {
                this.passFlag = res.data.data.status === 1
                let resources = JSON.parse(res.data.data.resources)
                let nodes = resources.nodes
                let nodesMap = {}
                for (let i=0;i<nodes.length;i++) {
                    let node = nodes[i]
                    if (
                        node.type === 'userTask' ||
                        node.type === 'ccTask' ||
                        node.type === 'scriptTask' ||
                        node.type === 'parallelGateWay' ||
                        node.type === 'exclusiveGateway' ||
                        node.type === 'manualTask'
                    ) {
                        if (node.status == 0) {
                            node.background = '#F0F2F6'
                            node.border = '2px solid #6B80A8'
                        } else if (node.status == 1) {
                            node.background = '#F1F9F1'
                            node.border = '2px solid #77C67C'
                        }
                    }
                    nodesMap[node.id] = node
                }
                this.nodes = nodes
                let edges = resources.edges
                for (let i = 0; i < edges.length; i++) {
                    if (
                        (edges[i].source === 'start' ||
                            nodesMap[edges[i].source].status ||
                            nodesMap[edges[i].source].status == 0) &&
                        (nodesMap[edges[i].target].status || nodesMap[edges[i].target].status == 0)
                    ) {
                        edges[i].flag = true
                    }
                }
                this.edges = edges
                this.drawLines()
            }
        },
        drawLines() {
            this.$nextTick().then(() => {
                jsPlumb.ready(() => {
                    this.jsPlumbInstance = jsPlumb.getInstance()

                    this.jsPlumbInstance.importDefaults(this.jsPlumbSetting)

                    // 连接线
                    this.edges.forEach(item => {
                        if (item.flag) {
                            if (item.label) {
                                item.overlays = [
                                    [
                                        'Label',
                                        {
                                            label: item.label,
                                            location: 0.5,
                                            id: 'label',
                                            cssClass: 'process-point-label'
                                        }
                                    ]
                                ]
                            }
                            this.jsPlumbInstance.connect(item, {
                                isSource: true,
                                isTarget: true,
                                anchor: 'AutoDefault',
                                paintStyle: { stroke: '#77C67C', strokeWidth: 2 }
                            })
                        } else {
                            if (item.label) {
                                item.overlays = [
                                    [
                                        'Label',
                                        {
                                            label: item.label,
                                            location: 0.5,
                                            id: 'label',
                                            cssClass: 'process-point-label'
                                        }
                                    ]
                                ]
                            }
                            this.jsPlumbInstance.connect(item, this.jsPlumbConnectOptions)
                        }
                    })
                    // 重绘
                    this.jsPlumbInstance.repaintEverything()
                })
            })
        },
        toReturn() {
            this.$router.go(-1)
        }
    }
}
</script>

<style scoped>
.header {
    width: 100%;
    height: 60px;
    font-size: 14px;
    color: #fff;
    background: #3296fa;
    display: flex;
    align-items: center;
}
.header > * {
    flex: 1;
    width: 100%;
}
.header-left {
    display: -webkit-box;
    display: flex;
    align-items: center;
}
.header-back {
    display: inline-block;
    width: 60px;
    height: 60px;
    font-size: 22px;
    border-right: 1px solid #1583f2;
    text-align: center;
    cursor: pointer;
}
.header-back .el-icon-arrow-left {
    line-height: 60px;
}
.header-back:hover {
    background: #5af;
}
.header-title {
    width: 0;
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding: 0 15px;
}
#relation-box {
    position: relative;
    overflow: auto;
}
::v-deep .process-point-label {
    background: #fff;
    padding: 4px;
}

.start {
    position: absolute;
    border: 2px solid #22242a;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    text-align: center;
    line-height: 60px;
    background-color: #fff;
    cursor: pointer;
    font-size: 12px;
}
.end {
    position: absolute;
    border: 4px solid #22242a;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    text-align: center;
    line-height: 56px;
    background-color: #fff;
    cursor: pointer;
    font-size: 12px;
}
.userTask {
    position: absolute;
    border: 2px solid #22242a;
    width: 100px;
    height: 60px;
    border-radius: 10px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    cursor: pointer;
    font-size: 12px;
}
.ccTask {
    position: absolute;
    border: 2px solid #22242a;
    width: 100px;
    height: 60px;
    border-radius: 10px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    cursor: pointer;
    font-size: 12px;
}
.scriptTask {
    position: absolute;
    border: 2px solid #22242a;
    width: 100px;
    height: 60px;
    border-radius: 10px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    cursor: pointer;
    font-size: 12px;
}
.exclusiveGateway,
.parallelGateWay,
.manualTask {
    position: absolute;
    border: 2px solid #22242a;
    width: 60px;
    height: 60px;
    transform: rotate(45deg) scale(0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    margin-left: 40px;
}
.exclusiveGateway i,
.parallelGateWay i,
.manualTask i {
    transform: rotate(-45deg) scale(3);
}
.status-icon {
    width: 12px;
    height: 12px;
    position: absolute;
    bottom: 4px;
    right: 4px;
}
.pass {
    position: fixed;
    top: 80px;
    left: 30px;
    width: 100px;
    height: 100px;
}
.type-icon {
    width: 12px;
    height: 12px;
    position: absolute;
    top: 4px;
    left: 4px;
}
</style>
