define(['vue', 'require', 'gitee', 'utils'], function (Vue, require, gitee, utils) {

    let bmTypeList = [];//分类集合
    let bmTagList = [];//标签集合  分类下的多级子分类
    let bmList = [];

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
                loading: false,
                bmSourceFilePath: "",
                bmSourceFile: {},
                bmSourceFiles: []
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
                        { title: 'test', actionUrl: "https://zijieke.com/semantic-ui/modules/search.php#/settings" },
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
                if (this.searchTxt === "") {
                    this.bmList = bmList.filter(n => n.type === this.checkedType);
                } else {
                    this.bmList = bmList.filter(
                        n => n.b.toUpperCase().indexOf(this.searchTxt.toUpperCase()) !== -1 ||
                            n.c.toUpperCase().indexOf(this.searchTxt.toUpperCase()) !== -1
                    );
                }

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
                    if (!bm.tags) {
                        return false;
                    }
                    return bm.tags.indexOf(checkedTag) !== -1;
                });
            },
            refreshData() {
                if (confirm('确认重新下载书签数据?')) {
                    this.checkedType = "";
                    this.checkedTag = "";
                    bmList = [];
                    bmTypeList = [];
                    bmTagList = [];
                    this.bmTypeList = [];
                    this.bmTagList = [];
                    this.bmList = [];
                    this.loadData(true, this.bmSourceFile);
                }
                return false;
            },
            loadData(refreshCache, file, call) {
                gitee.getFileContent(file.path, refreshCache, true, file.repo).then(data => {
                    this.bmDataHandle(data);
                    call();
                });
            },
            bmDataHandle(bmRoot) {
                // 书签栏书签集合 a = children b=title c=url
                let rootBmList = bmRoot;
                const bmTagSet = new Set();
                const bmTypeSet = new Set();
                for (let bm of rootBmList) {
                    let [title, url, type, tags] = bm;
                    bmTypeSet.add(type);
                    if (tags !== "") tags.split(",").forEach(x => bmTagSet.add({ name: x, type }));
                    bmList.push({ title, url, type, tags });
                }


                bmTypeList = Array.from(bmTypeSet);
                this.bmTypeList = bmTypeList;

                bmTagList = Array.from(bmTagSet);
                this.bmTagList = bmTagList;

                this.bmList = bmList;
                this.checkedType = this.bmTypeList[0];
                this.loading = false;
                console.log(bmList);
            },
            changeSource(file) {
                if (file.path === this.bmSourceFilePath) {
                    return;
                }
                bmTypeList = [];
                bmTagList = [];
                bmList = [];
                this.loadData(false, file, () => {
                    this.bmSourceFile = file;
                    this.bmSourceFilePath = file.path;
                });
            }
        },
        mounted() {
            bmTypeList = [];
            bmTagList = [];
            bmList = [];
            let config = gitee.getWydConfig();
            if (config && config.bookmarks) {
                this.bmSourceFiles = config.bookmarks.bmSourceFiles;
                this.changeSource(this.bmSourceFiles[0]);
            }
        },
        template: `
            <div class="ui container pb-5 segment mb-5">
                <div class="ui buttons">
                    <template v-for="(bsf,index) in bmSourceFiles">
                      <button :title="bsf.note+'-'+bsf.path" class="ui button" :class="bsf.path===bmSourceFilePath ? 'active blue':''" @click="changeSource(bsf)">{{bsf.name}}</button>
                      <div class="or" v-if="index<bmSourceFiles.length-1"></div>
                    </template>
                </div>
                <div class="my-3 d-flex flex-row">
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
                    <a class="card" target="_blank" :href="bm.url" v-for="bm in bmList">
                        <div class="content overflow-hidden">
                            <p class="ui header small d-inline text-nowrap" :title="bm.b">{{bm.title}} </p>
                            <div class="meta text-nowrap">{{bm.tags}}</div>
                            <div class="description text-nowrap" :title="bm.url">{{bm.url}}</div>
                        </div>
                    </a>
                </div>
            </div>
        `
    }

});
