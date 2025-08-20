<template>
    <div style="background: white; width: 100%">
        <el-table :data="tableData" max-height="560px" style="width: 100%" border>
            <el-table-column fixed align="center" label="序号" type="index" width="50"></el-table-column>
            <el-table-column align="center" label="产品编号" prop="code"></el-table-column>
            <el-table-column align="center" label="文件名称" prop="name"></el-table-column>
            <el-table-column label="操作" align="center" width="75" fixed="right">
                <template slot-scope="scope">
                    <i
                        class="el-icon-view"
                        style="font-size: 16px; margin-left: 10px; margin-right: 10px; cursor: pointer"
                        @click="handleFilePreview(scope.row)"
                    ></i>
                    <i
                        class="el-icon-download"
                        style="font-size: 16px; cursor: pointer"
                        @click="handleFileDownload(scope.row)"
                    ></i>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
export default {
    data() {
        return {
            tableData: []
        }
    },
    created() {
        if (this.$router.currentRoute.query.id) {
            this.queryByPage()
        }
    },
    methods: {
        async queryByPage() {
            let params = {
                orderId: this.$router.currentRoute.query.id
            }
            let res = await this.$axios.get('cloud/drawing/queryListByOrderId', { params })
            if (res.data.code == 200) {
                this.tableData = res.data.data
            }
        },
        handleFilePreview(row) {
            if(row.type === 'pdf') {
                window.open(row.url)
            }
        },
        handleFileDownload(row) {
            let params = {
                url: row.url,
                fileName: row.name
            }
            this.$axios.post('upload/download', params, { responseType: 'blob' }).then(res => {
                let content = res.data
                let blob = new Blob([content])
                if ('download' in document.createElement('a')) {
                    // 非IE下载
                    let elink = document.createElement('a')
                    elink.download = row.name
                    elink.style.display = 'none'
                    elink.href = URL.createObjectURL(blob)
                    document.body.appendChild(elink)
                    elink.click()
                    URL.revokeObjectURL(elink.href) // 释放URL 对象
                    document.body.removeChild(elink)
                } else {
                    // IE10+下载
                    navigator.msSaveBlob(blob, row.name)
                }
            })
        }
    }
}
</script>

<style scoped></style>
