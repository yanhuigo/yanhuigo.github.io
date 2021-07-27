define(['gitee'], function (gitee) {

    let bmTypeList = [];//分类集合
    let bmTagList = [];//标签集合  分类下的多级子分类
    let bmList = [];

    function recursionBookmark(bm, type, tag) {
        if (bm.a) { // 子分类文件夹
            for (let cbm of bm.a) {
                if (cbm.a) {
                    bmTagList.push({ name: cbm.b, type });
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
                    if (!bm.tag) {
                        return false;
                    }
                    return bm.tag === checkedTag;
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
                    this.loadData(true);
                }
                return false;
            },
            loadData(refreshCache = false, call) {
                gitee.getFileContent("data/bm.chrome.home.json", refreshCache, true).then(data => {
                    this.bmDataHandle(data);
                    call && call();
                });
            },
            bmDataHandle(bmRoot) {
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
        },
        template: document.querySelector("#layout #bookmarks"),
    }

});
