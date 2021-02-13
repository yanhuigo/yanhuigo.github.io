define(['vue', 'require', 'gitee', 'utils'], function (Vue, require, gitee, utils) {

    let bmTypeList = [];//分类集合
    let bmTagList = [];//标签集合  分类下的多级子分类
    let bmList = [];

    function recursionBookmark(bm, type, tag) {
        if (bm.a) { // 子分类文件夹
            for (let cbm of bm.a) {
                if (cbm.a) {
                    bmTagList.push({name: cbm.b, type});
                    recursionBookmark(cbm, type, cbm.b);
                } else {
                    recursionBookmark(cbm, type, tag);
                }
            }
        } else if (bm.c) {//书签
            type && (bm.type = type);
            tag && (bm.tag = tag);
            bmList.push(bm);
        }
    }

    return {
        name: "bookmarks",
        data() {
            return {
                bmTypeList: [],
                bmTagList: [],
                bmList: [],
                checkedType: "",
                checkedTag: "",
                searchTxt: "",
                loading: false
            }
        },
        watch: {
            checkedType(val) {
                this.checkedTag = "";
                this.bmTagList = bmTagList.filter(n => n.type === val);
                this.bmList = bmList.filter(n => n.type === val);
            }
        },
        methods: {
            initSearch() {
                $('.ui.search').search({
                    source: [
                        {title: 'test', actionUrl: "https://zijieke.com/semantic-ui/modules/search.php#/settings"},
                    ],
                    minCharacters: 0,
                    selectFirstResult: true,
                    onSelect(result, response) {
                        console.log(result);
                    }
                });
            },
            logout() {
                let result = confirm("确认登出？");
                if (result) {
                    localStorage.clear();
                    window.location.href = "/login.html"
                }
            },
            search() {
                this.bmList = bmList.filter(
                    n => n.b.toUpperCase().indexOf(this.searchTxt.toUpperCase()) !== -1 ||
                        n.c.toUpperCase().indexOf(this.searchTxt.toUpperCase()) !== -1
                );
                this.checkedTag = "";
                this.searchTxt = "";
            },
            typeClick(type) {
                this.bmList = bmList.filter(n => n.type === type);
            },
            tagClick(tag) {
                let checkedTag = tag.name;
                if (tag.name === this.checkedTag) {
                    this.checkedTag = "";
                    checkedTag = "";
                }

                this.checkedTag = checkedTag;

                if (checkedTag === "") {
                    this.bmList = bmList.filter(n => n.type === this.checkedType);
                    return;
                }

                this.bmList = bmList.filter(bm => {
                    if (!bm.tag) {
                        return false;
                    }
                    return bm.tag === checkedTag;
                });
            },
            refreshData() {
                utils.confirm('确认重新下载书签数据?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.checkedType = "";
                    this.checkedTag = "";
                    bmList = [];
                    bmTypeList = [];
                    bmTagList = [];
                    this.bmTypeList = [];
                    this.bmTagList = [];
                    this.bmList = [];
                    this.loadData(true);
                }).catch(() => {

                });
                return false;
            },
            loadData(refreshCache) {
                gitee.getFileContent("json/chrome.bookmark.json", refreshCache).then(data => {
                    this.bmDataHandle(data);
                });
            },
            bmDataHandle(bmJsonData) {
                let bmRoot = JSON.parse(bmJsonData);
                // 书签栏书签集合 a = children b=title c=url
                let rootBmList = bmRoot.a;
                for (let bm of rootBmList) {
                    // 如果有子节点  则代表分类
                    if (bm.a) {
                        recursionBookmark(bm, bm.b, null);
                        bmTypeList.push(bm.b);
                    } else {
                        recursionBookmark(bm, null, null);
                    }
                }
                this.checkedType = bmTypeList[0];
                this.bmTypeList = bmTypeList;
                this.bmTagList = bmTagList;
                this.bmList = bmList;
                this.loading = false;
            }
        },
        mounted() {
            bmTypeList = [];
            bmTagList = [];
            bmList = [];
            this.loadData();
            // this.initSearch();
        },
        template: `
            <div class="ui container pb-5 segment mt-2 mb-5">
                <div class="mb-3 d-flex flex-row">
                    <div class="ui search flex-grow-1">
                        <div class="ui icon input d-flex">
                            <input class="search" type="text" @keyup.enter="search" v-model="searchTxt" placeholder="搜索书签..."
                                   autocomplete="off"/>
                            <i class="search icon"></i>
                        </div>
                    </div>
                    <button class="ui icon button ml-1" data-tooltip="下载书签" data-position="bottom left"
                            @click="refreshData"><i class="sync icon"></i></button>
                </div>
                <div class="ui raised segment"><span class="ui ribbon label green">分类</span>
                    <template v-for="type in bmTypeList">
                        <button class="ui button mt-1" :class="checkedType==type ? 'positive' :'' "
                                @click="checkedType=type">
                            {{type}}
                        </button>
                    </template>
                </div>
                <div class="ui raised segment" v-if="bmTagList.length>0"><span class="ui ribbon label teal">标签</span><a
                        class="ui tag label mt-1" :class="checkedTag==tag.name ? 'teal' :'' " v-for="tag in bmTagList"
                        @click="tagClick(tag)">{{tag.name}}</a></div>
                <div class="ui cards centered mt-4">
                    <a class="card" target="_blank" :href="bm.c" v-for="bm in bmList">
                        <div class="content overflow-hidden">
                            <p class="ui header small d-inline text-nowrap" :title="bm.b">{{bm.b}} </p>
                            <div class="meta text-nowrap">{{bm.tag}}</div>
                            <div class="description text-nowrap" :title="bm.c">{{bm.c}}</div>
                        </div>
                    </a>
                </div>
            </div>
        `
    }

});
