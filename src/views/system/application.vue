<template>
    <div class="container">
        <el-table :data="tabelData" border stripe>
            <div slot="empty"><el-empty description="没有数据"></el-empty></div>
            <el-table-column width="55" align="center" label="序号">
                <template slot-scope="scope">
                    {{ scope.$index + 1 }}
                </template>
            </el-table-column>
            <el-table-column prop="name" label="名称" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                    <el-button type="text" size="small" @click="handleInstall(scope.row.mark)">安装</el-button>
                    <el-button type="text" size="small" @click="handleExport(scope.row)">导出</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
export default {
    data() {
        return {
            tabelData: []
        }
    },
    computed: {
        account() {
            return localStorage.getItem('account')
        }
    },
    created() {
        this.queryAll()
    },
    methods: {
        async queryAll() {
            let res = await this.$axios.get('application/queryAll')
            if (res.data.code == 200) {
                this.tabelData = res.data.data
            }
        },
        handleInstall(mark) {
            let load = this.$loading({
                lock: true,
                text: '安装中...'
            })
            let res = this.$axios.get('application/install/' + mark).then(res => {
                if (res.data.code == 200) {
                    this.$message.success('安装成功')
                } else {
                    this.$message.error(res.data.message)
                }
                load.close()
            })
        },
        handleExport(item) {
            this.$axios.post('application/export/' + item.id, {}, { responseType: 'blob' }).then(res => {
                let content = res.data
                let blob = new Blob([content])
                if ('download' in document.createElement('a')) {
                    // 非IE下载
                    let link = document.createElement('a')
                    link.download = item.mark + '.json'
                    link.style.display = 'none'
                    link.href = URL.createObjectURL(blob)
                    document.body.appendChild(link)
                    link.click()
                    URL.revokeObjectURL(link.href) // 释放URL 对象
                    document.body.removeChild(link)
                } else {
                    // IE10+下载
                    navigator.msSaveBlob(blob, item.mark + '.json')
                }
            })
        }
    }
}
</script>
<style scoped>
.container {
    padding: 15px;
}
.block {
    border-radius: 4px;
    border: 1px solid #d7dae2;
    height: 250px;
}
</style>
