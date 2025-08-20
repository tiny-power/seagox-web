<template>
    <el-drawer
        :visible.sync="drawer"
        :withHeader="false"
        direction="ltr"
        size="430px"
        :append-to-body="true"
        :modal-append-to-body="false"
        :modal="false"
        class="drawer-class"
    >
        <div class="flex-menu-box">
            <div class="first-menu">
                <div
                    v-for="(item, index) in menuList"
                    :key="index"
                    :class="selectIndex != index ? 'first-menu-item' : ' first-menu-item cur-first-menu'"
                    @click="handleSelected(index)"
                >
                    <i :class="item.icon"></i>
                    <div>{{ item.name }}</div>
                </div>
            </div>
            <div class="second-menu" v-if="menuList[selectIndex] && menuList[selectIndex].children">
                <div class="second-title">
                    <div
                        style="width: 6px; height: 12px; border-radius: 3px; background: #3a6cfa; margin-right: 5px"
                    ></div>
                    {{ menuList[selectIndex].name }}
                </div>
                <div
                    v-for="(item, index) in menuList[selectIndex].children"
                    :key="index"
                    class="second-item"
                    v-if="item.type != 5"
                >
                    <div @click="selectMenu(item.url)">
                        {{ item.name }}
                        <div class="favorite-star">
                            <i
                                v-if="item.isFavorite == 1"
                                class="el-icon-star-on on"
                                @click.stop="handleCancel(item, index)"
                            ></i>
                            <i v-else class="el-icon-star-on off" @click.stop="handleCollection(item)"></i>
                        </div>
                    </div>
                </div>
                <div v-if="otherMap[menuList[selectIndex].id]">
                    <div v-for="(item, index) in otherMap[menuList[selectIndex].id]" :key="index">
                        <div class="second-title">
                            <div
                                style="
                                    width: 6px;
                                    height: 12px;
                                    border-radius: 3px;
                                    background: #3a6cfa;
                                    margin-right: 5px;
                                "
                            ></div>
                            {{ item.name }}
                        </div>
                        <div style="display: flex; flex-wrap: wrap">
                            <div v-for="(itemChild, indexChild) in item.children" :key="indexChild" class="second-item">
                                <div @click="selectMenu(itemChild.url)">
                                    {{ itemChild.name }}
                                    <div class="favorite-star">
                                        <i
                                            v-if="itemChild.isFavorite == 1"
                                            class="el-icon-star-on on"
                                            @click.stop="handleCancel(itemChild, indexChild)"
                                        ></i>
                                        <i
                                            v-else
                                            class="el-icon-star-on off"
                                            @click.stop="handleCollection(itemChild)"
                                        ></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </el-drawer>
</template>

<script>
export default {
    data() {
        return {
            drawer: false,
            menuList: [],
            selectIndex: 0,
            otherMap: {}
        }
    },
    created() {
        this.queryMenu()
    },
    methods: {
        async queryMenu() {
            let params = {
                classify: 1
            }
            const res = await this.$axios.get('menu/queryUserMenu', { params })
            if (res.data.code == 200) {
                if (res.data.data) {
                    let shortcut = []
                    let shortcutList = res.data.data[0].children
                    for (let i = 0; i < shortcutList.length; i++) {
                        shortcut.push(shortcutList[i].id)
                    }
                    this.menuList = this.resetmenu(res.data.data, shortcut, 0)
                }
            }
        },
        resetmenu(data, shortcut, level) {
            // 1:表单列表;2:按钮;3:新增页面;4:菜单页面;5:目录;6:仪表板;7:单页面;
            let menuList = JSON.parse(JSON.stringify(data))
            let menuArray = []
            for (let i = 0; i < menuList.length; i++) {
                let item = menuList[i]
                if (item.type === 1) {
                    item.url = 'formList?id=' + item.path + '&title=' + item.name
                } else if (item.type === 3) {
                    item.url = 'handleCustomForm?formId=' + item.path + '&title=' + item.name
                } else if (item.type === 5) {
                    item.url = Math.random().toString(36).slice(-6)
                } else if (item.type === 6) {
                    item.url = 'analysis?id=' + item.path + '&title=' + item.name
                } else {
                    item.url = item.path
                }
                if (shortcut.includes(item.id)) {
                    item.isFavorite = 1
                } else {
                    item.isFavorite = 0
                }
                if (item.children && item.children.length > 0) {
                    item.children = this.resetmenu(item.children, shortcut, level + 1)
                }
                menuArray.push(item)
                if (level > 0 && item.type === 5) {
                    let otherArray = []
                    if (this.otherMap.hasOwnProperty(item.parentId)) {
                        otherArray = this.otherMap[item.parentId]
                    }
                    otherArray.push(item)
                    this.otherMap[item.parentId] = otherArray
                }
            }
            return menuArray
        },
        openDrawer() {
            this.drawer = !this.drawer
        },
        handleSelected(index) {
            if (
                (this.menuList[index].children && this.menuList[index].children.length > 0) ||
                this.menuList[index].type == 5
            ) {
                this.selectIndex = index
            } else {
                this.selectIndex = 0
                this.selectMenu(this.menuList[index].url)
            }
        },
        selectMenu(url) {
            this.$router.push('/' + url)
            this.drawer = false
        },
        async handleCollection(item) {
            let params = {
                menuId: item.id
            }
            const res = await this.$axios.post('shortcut/insert', params)
            if (res.data.code == 200) {
                this.$message.success('收藏成功')
                item.isFavorite = 1
                this.menuList[0].children.push(item)
            }
        },
        async handleCancel(item, index) {
            const res = await this.$axios.get('shortcut/cancel/' + item.id)
            if (res.data.code == 200) {
                this.$message.success('取消收藏')
                this.menuList[0].children.splice(index, 1)
                if (this.selectIndex == 0) {
                    let shortcut = []
                    let shortcutList = this.menuList
                    for (let i = 0; i < shortcutList.length; i++) {
                        shortcut.push(shortcutList[i].id)
                    }
                    this.menuList = this.resetmenu(shortcutList, shortcut)
                } else {
                    item.isFavorite = 0
                }
            }
        }
    }
}
</script>

<style scoped>
* {
    box-sizing: border-box;
}
.drawer-class {
    top: 60px;
    height: calc(100% - 60px);
}
.flex-menu-box {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    height: 100%;
    width: 100%;
}
.first-menu {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    background: #3a6cfa;
    width: 86px;
}
.first-menu-item {
    width: 86px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    /* color: #fff; */
    font-family: Microsoft YaHei;
    font-weight: 400;
    font-size: 13px;
    color: #d8e4f9;
    line-height: 25px;
    border-bottom: 1px solid #3a6cfa;
    cursor: pointer;
}
.first-menu-item i {
    font-size: 24px;
}
.first-menu-item:hover {
    background: #609bfe;
    color: #fff;
}
.cur-first-menu {
    background: #609bfe;
    color: #fff;
}
.second-menu {
    width: 340px;
    height: 100%;
    padding: 0 10px;
    overflow-x: hidden;
    overflow-y: auto;
}
.second-title {
    height: 12px;
    font-family: Microsoft YaHei;
    font-weight: 600;
    font-size: 14px;
    color: #333333;
    line-height: 12px;
    border-radius: 2px;
    padding: 20px 0 20px 0;
    position: relative;
    display: flex;
}
.second-title i {
    font-size: 20px;
    color: #333333;
    margin: 0 7px;
}
.second-item {
    width: 150px;
    height: 30px;
    font-size: 13px;
    font-weight: 400;
    line-height: 30px;
    color: #3e464c;
    margin: 4px;
    padding: 0 5px 0 10px;
    display: inline-block;
    cursor: pointer;
    box-sizing: border-box;
    border-radius: 4px;
}
.second-item:hover {
    background: #e1eefe;
    color: #3882fe;
}
.second-item i {
    margin-right: 3px;
    font-size: 18px;
    color: #4797fb;
}
.second-item > div {
    box-sizing: border-box;
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
}
.sub-title {
    font-size: 13px;
    font-weight: 400;
    line-height: 30px;
    color: #000;
    padding-left: 10px;
    margin-top: 5px;
}
.favorite-star {
    display: none;
    flex: 1;
    font-size: 18px;
    text-align: right;
}

.favorite-star .on {
    color: #3a6cfa;
}
.favorite-star .off {
    color: #8a9aac;
}
.second-item:hover .favorite-star {
    display: block;
}
</style>
