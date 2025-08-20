<template>
    <div>
        <div class="flow">
            <el-alert
                title="提示 ：单击流程中的某个节点，可以增加节点、删除当前节点、设置节点属性。"
                type="warning"
                center
                show-icon
                :closable="false"
                style="position: fixed; z-index: 2000"
            >
            </el-alert>
            <div v-for="(item, index) in nodes" :key="index">
                <div
                    :id="item.id"
                    :class="item.type"
                    :style="{ left: item.x + 'px', top: item.y + 'px' }"
                    v-if="item.type == 'end'"
                >
                    {{ item.label }}
                </div>
                <el-popover placement="bottom-start" trigger="click" width="100" :visible-arrow="false" v-else>
                    <div class="contextMenu">
                        <div
                            style="line-height: 36px; cursor: pointer; padding: 0 20px"
                            @click="handleNode(item, 'userTask')"
                        >
                            用户任务
                        </div>
                        <div
                            style="line-height: 36px; cursor: pointer; padding: 0 20px"
                            @click="handleNode(item, 'ccTask')"
                        >
                            抄送任务
                        </div>
                        <div
                            style="line-height: 36px; cursor: pointer; padding: 0 20px"
                            @click="handleNode(item, 'delete')"
                            v-if="
                                item.type == 'userTask' ||
                                item.type == 'ccTask' ||
                                item.type == 'scriptTask' ||
                                item.type === 'manualTask' ||
                                item.type === 'exclusiveGateway'
                            "
                        >
                            删除节点
                        </div>
                    </div>
                    <div
                        slot="reference"
                        :id="item.id"
                        :class="item.type"
                        :style="{ left: item.x + 'px', top: item.y + 'px' }"
                    >
                        <div>
                            <div
                                v-if="
                                    item.type == 'start' ||
                                    item.type == 'userTask' ||
                                    item.type == 'ccTask' ||
                                    item.type == 'scriptTask'
                                "
                            >
                                {{ item.label }}
                            </div>
                            <i
                                class="el-icon-s-custom type-icon"
                                style="color: #22242a"
                                v-if="item.type === 'userTask'"
                            ></i>
                            <i
                                class="el-icon-s-promotion type-icon"
                                style="color: #22242a"
                                v-if="item.type === 'ccTask'"
                            ></i>
                            <i
                                class="el-icon-s-tools type-icon"
                                style="color: #22242a"
                                v-if="item.type === 'scriptTask'"
                            ></i>
                            <div v-if="item.type === 'parallelGateWay'">
                                <i class="el-icon-plus" style="font-weight: bold"></i>
                            </div>
                            <div v-if="item.type === 'exclusiveGateway'">
                                <i class="el-icon-close" style="font-weight: bold"></i>
                            </div>
                            <div v-if="item.type === 'manualTask'">
                                <i class="el-icon-rank"></i>
                            </div>
                        </div>
                    </div>
                </el-popover>
            </div>
        </div>
        <personnel ref="member" @confirm="personnelConfirm"></personnel>
    </div>
</template>

<script>
import { jsPlumb } from 'jsplumb'
import dagre from 'dagre'
import personnel from '@/views/system/personnel'
export default {
    components: {
        personnel
    },
    props: {
        resources: {
            type: Object,
            default: () => {}
        }
    },
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
                Endpoint: ['Blank', { radius: 2 }],
                EndpointStyle: {
                    stroke: '#888',
                    fill: '#fff'
                },
                PaintStyle: { stroke: '#22242A', strokeWidth: 2, outlineStroke: '#f7f8fa' },
                Overlays: [['Arrow', { width: 10, length: 10, location: 1 }]]
            },
            jsPlumbConnectOptions: {
                isSource: true,
                isTarget: true,
                anchor: ['Left', 'Right']
            },
            nodes: [],
            edges: [],
            form: {},
            variable: [],
            currentId: ''
        }
    },
    mounted() {
        document.onselectstart = function () {
            return false
        }
        this.nodes = this.resources.nodes
        this.edges = this.resources.edges
        this.handleAlign(this.nodes, this.edges)
    },
    methods: {
        handleAlign(nodesMap, edges) {
            var g = new dagre.graphlib.Graph()
            g.setGraph({
                rankdir: 'LR',
                ranksep: 100,
                marginx: 50,
                marginy: 100
            })
            g.setDefaultEdgeLabel(function () {
                return {}
            })
            for (let i = 0; i < nodesMap.length; i++) {
                let item = nodesMap[i]
                item.width = 100
                item.height = 60
                g.setNode(item.id, item)
            }
            for (let i = 0; i < edges.length; i++) {
                g.setEdge(edges[i].source, edges[i].target)
            }
            dagre.layout(g)
            let nodes = []
            g.nodes().forEach(function (v) {
                nodes.push(g.node(v))
            })
            this.nodes = nodes
            this.drawLines()
        },
        drawLines() {
            this.$nextTick().then(() => {
                jsPlumb.ready(() => {
                    if (this.jsPlumbInstance) {
                        this.jsPlumbInstance.reset()
                    }
                    this.jsPlumbInstance = jsPlumb.getInstance()

                    this.jsPlumbInstance.importDefaults(this.jsPlumbSetting)
                    //连接线
                    this.edges.forEach(item => {
                        if (item.label) {
                            item.overlays = [
                                [
                                    'Label',
                                    { label: item.label, location: 0.5, id: 'label', cssClass: 'process-point-label' }
                                ]
                            ]
                        }
                        let connect = this.jsPlumbInstance.connect(item, this.jsPlumbConnectOptions)
                        if (item.condition) {
                            connect.setParameter('condition', item.condition)
                        }
                    })
                })
            })
        },
        handleNode(node, type) {
            this.currentId = node.id
            if (type === 'userTask') {
                if (
                    node.type === 'start' ||
                    node.type === 'parallelGateWay' ||
                    node.type === 'exclusiveGateway' ||
                    node.type === 'manualTask'
                ) {
                    this.$refs.member.showDialog([], false)
                } else {
                    this.$refs.member.showDialog([], true)
                }
            } else if (type === 'ccTask') {
                if (
                    node.type === 'start' ||
                    node.type === 'parallelGateWay' ||
                    node.type === 'exclusiveGateway' ||
                    node.type === 'manualTask'
                ) {
                    this.$refs.member.showDialog([], false)
                } else {
                    this.$refs.member.showDialog([], true)
                }
            } else if (type === 'delete') {
                let targetlist = []
                let source = {}
                this.edges.forEach(key => {
                    if (key.source == node.id) {
                        targetlist.push({ id: key.target })
                    }
                    if (key.target == node.id) {
                        source.id = key.source
                    }
                })
                this.nodes.forEach(key => {
                    if (source.id == key.id) {
                        source = JSON.parse(JSON.stringify(key))
                    }
                    targetlist.forEach((keys, index) => {
                        if (keys.id == key.id) {
                            targetlist[index] = key
                        }
                    })
                })
                //晒出改节点的源节点和目标节点
                if (targetlist.length > 1) {
                    //该情况下可以直接把节点置换成她的上一个目标节点
                    this.edges.forEach(key => {
                        if (key.source == node.id) {
                            key.source = source.id
                        }
                    })
                    this.edges = this.edges.filter(key => {
                        return key.target != node.id
                    })
                    this.nodes = this.nodes.filter(key => {
                        return key.id != node.id
                    })
                } else {
                    //剖析目标节点是否为汇合点
                    if (targetlist[0].type != 'parallelGateWay') {
                        // 不是汇合点，该情况下可以直接把节点置换成她的上一个目标节点
                        this.edges.forEach(key => {
                            if (key.source == node.id) {
                                key.source = source.id
                            }
                        })
                        this.edges = this.edges.filter(key => {
                            return key.target != node.id
                        })
                        this.nodes = this.nodes.filter(key => {
                            return key.id != node.id
                        })
                    } else {
                        //是汇合点。判断汇合点是否有多个source
                        let list = this.edges.filter(key => {
                            return key.target == targetlist[0].id
                        })
                        if (list.length > 2) {
                            //表明有多个并行，前面是并行节点可直接删除节点和连接线，前面是普通节点则增加一条线
                            //并行节点不止一个gate类型，普通节点也能成为分叉
                            if (
                                this.edges.filter(key => {
                                    return key.source == source.id
                                }).length == 1
                            ) {
                                this.edges.forEach(key => {
                                    if (key.source == node.id) {
                                        key.source = source.id
                                    }
                                })
                            }

                            this.edges = this.edges.filter(key => {
                                return !(key.target == node.id || key.source == node.id)
                            })
                            this.nodes = this.nodes.filter(key => {
                                return key.id != node.id
                            })
                        } else {
                            //当前只有2个可把节点连同她下一个汇合点一起删除,并行节点要变成当前唯一节点并连接下一节点
                            //找到当前节点唯一并行节点
                            let tempnode = list.filter(key => {
                                return key.source != node.id
                            })[0]
                            tempnode = this.nodes.filter(key => {
                                return key.id == tempnode.source
                            })[0]
                            //找出汇合点下一个节点
                            let nextnode = this.edges.filter(key => {
                                return key.source == targetlist[0].id
                            })[0]
                            nextnode = this.nodes.filter(key => {
                                return key.id == nextnode.target
                            })[0]
                            this.edges.forEach(key => {
                                if (key.source == targetlist[0].id) {
                                    key.source = tempnode.id
                                }
                            })
                            this.edges = this.edges.filter(key => {
                                return !(
                                    key.source == node.id ||
                                    key.target == node.id ||
                                    key.source == targetlist[0].id ||
                                    key.target == targetlist[0].id
                                )
                            })
                            this.nodes = this.nodes.filter(key => {
                                return !(key.id == node.id || key.id == targetlist[0].id)
                            })
                        }
                    }
                }
                this.handleAlign(this.nodes, this.edges)
            } else if (type === 'manualTask') {
                let edgesObj = {}
                for (let i = 0; i < this.edges.length; i++) {
                    let edge = this.edges[i]
                    if (edgesObj.hasOwnProperty(edge.source)) {
                        let target = edgesObj[edge.source]
                        target.push(edge)
                        edgesObj[edge.source] = target
                    } else {
                        let target = []
                        target.push(edge)
                        edgesObj[edge.source] = target
                    }
                }
                let target = edgesObj[this.currentId]
                let targetList = []
                for (let i = 0; i < target.length; i++) {
                    targetList.push(target[i].target)
                }
                let currentId = this.currentId
                let edges = this.edges.filter(item => {
                    return !(item.source === currentId && targetList.includes(item.target))
                })
                let nodeId = Math.random().toString(36).slice(-6)
                this.nodes.push({
                    id: nodeId,
                    type: 'manualTask',
                    label: '手动选择'
                })
                edges.push({
                    source: currentId,
                    target: nodeId
                })
                for (let j = 0; j < targetList.length; j++) {
                    edges.push({
                        source: nodeId,
                        target: targetList[j]
                    })
                }
                this.edges = edges
                this.handleAlign(this.nodes, this.edges)
            } else if (type === 'scriptTask') {
                let edgesObj = {}
                for (let i = 0; i < this.edges.length; i++) {
                    let edge = this.edges[i]
                    if (edgesObj.hasOwnProperty(edge.source)) {
                        let target = edgesObj[edge.source]
                        target.push(edge)
                        edgesObj[edge.source] = target
                    } else {
                        let target = []
                        target.push(edge)
                        edgesObj[edge.source] = target
                    }
                }
                let target = edgesObj[this.currentId]
                let targetList = []
                for (let i = 0; i < target.length; i++) {
                    targetList.push(target[i].target)
                }
                let currentId = this.currentId
                let edges = this.edges.filter(item => {
                    return !(item.source === currentId && targetList.includes(item.target))
                })
                let nodeId = Math.random().toString(36).slice(-6)
                this.nodes.push({
                    id: nodeId,
                    type: 'scriptTask',
                    label: '脚本任务'
                })
                edges.push({
                    source: currentId,
                    target: nodeId
                })
                for (let j = 0; j < targetList.length; j++) {
                    edges.push({
                        source: nodeId,
                        target: targetList[j]
                    })
                }
                this.edges = edges
                this.handleAlign(this.nodes, this.edges)
            } else if (type === 'exclusiveGateway') {
                let edgesObj = {}
                for (let i = 0; i < this.edges.length; i++) {
                    let edge = this.edges[i]
                    if (edgesObj.hasOwnProperty(edge.source)) {
                        let target = edgesObj[edge.source]
                        target.push(edge)
                        edgesObj[edge.source] = target
                    } else {
                        let target = []
                        target.push(edge)
                        edgesObj[edge.source] = target
                    }
                }
                let target = edgesObj[this.currentId]
                let targetList = []
                for (let i = 0; i < target.length; i++) {
                    targetList.push(target[i].target)
                }
                let currentId = this.currentId
                let edges = this.edges.filter(item => {
                    return !(item.source === currentId && targetList.includes(item.target))
                })
                let nodeId = Math.random().toString(36).slice(-6)
                this.nodes.push({
                    id: nodeId,
                    type: 'exclusiveGateway',
                    label: '排他网关'
                })
                edges.push({
                    source: currentId,
                    target: nodeId
                })
                for (let j = 0; j < targetList.length; j++) {
                    edges.push({
                        source: nodeId,
                        target: targetList[j]
                    })
                }
                this.edges = edges
                this.handleAlign(this.nodes, this.edges)
            }
        },
        personnelConfirm(flowType, memberList) {
            // flowType 0:串发;1:并发;2:会签;
            let edgesObj = {}
            for (let i = 0; i < this.edges.length; i++) {
                let edge = this.edges[i]
                if (edgesObj.hasOwnProperty(edge.source)) {
                    let target = edgesObj[edge.source]
                    target.push(edge)
                    edgesObj[edge.source] = target
                } else {
                    let target = []
                    target.push(edge)
                    edgesObj[edge.source] = target
                }
            }
            let nodeObj = {}
            for (let i = 0; i < this.nodes.length; i++) {
                let node = this.nodes[i]
                nodeObj[node.id] = node
            }
            if (flowType == 0) {
                // 串发
                let target = edgesObj[this.currentId]
                let targetList = []
                for (let i = 0; i < target.length; i++) {
                    targetList.push(target[i].target)
                }
                let currentId = this.currentId
                let edges = this.edges.filter(item => {
                    return !(item.source === currentId && targetList.includes(item.target))
                })
                for (let i = 0; i < memberList.length; i++) {
                    let nodeId = Math.random().toString(36).slice(-6)
                    this.nodes.push({
                        id: nodeId,
                        type: 'userTask',
                        label: memberList[i].name,
                        value: [memberList[i]]
                    })
                    edges.push({
                        source: currentId,
                        target: nodeId
                    })
                    if (i === memberList.length - 1) {
                        for (let j = 0; j < targetList.length; j++) {
                            edges.push({
                                source: nodeId,
                                target: targetList[j]
                            })
                        }
                    }
                    currentId = nodeId
                }
                this.edges = edges
                this.handleAlign(this.nodes, this.edges)
            } else if (flowType == 1) {
                // 并发
                let target = edgesObj[this.currentId]
                let targetList = []
                for (let i = 0; i < target.length; i++) {
                    targetList.push(target[i].target)
                }
                let currentId = this.currentId
                let edges = this.edges.filter(item => {
                    return !(item.source === currentId && targetList.includes(item.target))
                })
                if (memberList.length === 1) {
                    for (let i = 0; i < memberList.length; i++) {
                        let nodeId = Math.random().toString(36).slice(-6)
                        this.nodes.push({
                            id: nodeId,
                            type: 'userTask',
                            label: memberList[i].name,
                            value: [memberList[i]]
                        })
                        edges.push({
                            source: currentId,
                            target: nodeId
                        })
                        if (i === memberList.length - 1) {
                            for (let j = 0; j < targetList.length; j++) {
                                edges.push({
                                    source: nodeId,
                                    target: targetList[j]
                                })
                            }
                        }
                    }
                } else {
                    let parallelNodeId = Math.random().toString(36).slice(-6)
                    this.nodes.push({
                        id: parallelNodeId,
                        type: 'parallelGateWay',
                        label: '并行网关'
                    })
                    for (let i = 0; i < targetList.length; i++) {
                        edges.push({
                            source: parallelNodeId,
                            target: targetList[i]
                        })
                    }
                    for (let i = 0; i < memberList.length; i++) {
                        let nodeId = Math.random().toString(36).slice(-6)
                        this.nodes.push({
                            id: nodeId,
                            type: 'userTask',
                            label: memberList[i].name,
                            value: [memberList[i]]
                        })
                        edges.push({
                            source: this.currentId,
                            target: nodeId
                        })
                        edges.push({
                            source: nodeId,
                            target: parallelNodeId
                        })
                    }
                }
                this.edges = edges
                this.handleAlign(this.nodes, this.edges)
            } else if (flowType == 2) {
                // 会签
                let sourceList = []
                let targetList = []
                let parallelGateWayFlag = false
                for (let i = 0; i < this.edges.length; i++) {
                    if (this.edges[i].source === this.currentId) {
                        targetList.push(this.edges[i].target)
                        if (nodeObj.hasOwnProperty(this.edges[i].target)) {
                            if (nodeObj[this.edges[i].target].type === 'parallelGateWay') {
                                parallelGateWayFlag = true
                            }
                        }
                    }
                    if (this.edges[i].target === this.currentId) {
                        sourceList.push(this.edges[i].source)
                    }
                }
                if (parallelGateWayFlag) {
                    for (let i = 0; i < memberList.length; i++) {
                        let nodeId = Math.random().toString(36).slice(-6)
                        this.nodes.push({
                            id: nodeId,
                            type: 'userTask',
                            label: memberList[i].name,
                            value: [memberList[i]]
                        })
                        for (let j = 0; j < sourceList.length; j++) {
                            this.edges.push({
                                source: sourceList[j],
                                target: nodeId
                            })
                        }
                        this.edges.push({
                            source: nodeId,
                            target: targetList[0]
                        })
                    }
                } else {
                    for (let i = 0; i < this.edges.length; i++) {
                        if (this.edges[i].source === this.currentId && targetList.includes(this.edges[i].target)) {
                            this.edges.splice(i, 1)
                        }
                    }
                    let parallelNodeId = Math.random().toString(36).slice(-6)
                    this.nodes.push({
                        id: parallelNodeId,
                        type: 'parallelGateWay',
                        label: '并行网关'
                    })
                    for (let i = 0; i < targetList.length; i++) {
                        this.edges.push({
                            source: parallelNodeId,
                            target: targetList[i]
                        })
                    }
                    this.edges.push({
                        source: this.currentId,
                        target: parallelNodeId
                    })
                    for (let i = 0; i < memberList.length; i++) {
                        let nodeId = Math.random().toString(36).slice(-6)
                        this.nodes.push({
                            id: nodeId,
                            type: 'userTask',
                            label: memberList[i].name,
                            value: [memberList[i]]
                        })
                        this.edges.push({
                            source: nodeId,
                            target: parallelNodeId
                        })
                        for (let j = 0; j < sourceList.length; j++) {
                            this.edges.push({
                                source: sourceList[j],
                                target: nodeId
                            })
                        }
                    }
                }
                this.handleAlign(this.nodes, this.edges)
            }
        },
        validate() {
            return {
                nodes: this.nodes,
                edges: this.edges
            }
        }
    }
}
</script>

<style scoped>
.flow {
    position: relative;
}
::v-deep .process-point-label {
    background: #f7f8fa;
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
    background-color: #fff;
    cursor: pointer;
    transform: rotate(45deg) scale(0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 40px;
}
.exclusiveGateway i,
.parallelGateWay i,
.manualTask i {
    transform: rotate(-45deg) scale(3);
}

.type-icon {
    width: 12px;
    height: 12px;
    position: absolute;
    top: 4px;
    left: 4px;
}
::v-deep .jtk-overlay {
    margin-top: -15px;
}
::v-deep .jtk-connector {
    cursor: pointer;
}
.contextMenu {
    font-size: 12px;
    color: #333;
    text-align: center;
}
.contextMenu div:hover {
    background-color: #eee;
}
</style>
