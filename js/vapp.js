// vue组件定义
const vappComponents = (function () {

    const menus = [
        { title: "Home", url: "home", icon: "home" },
        { title: "Bookmarks", url: "bookmarks", icon: "bookmark outline" },
        { title: "Files", url: "files", icon: "file alternate outline" },
    ];

    function Home() {

        return {
            template: $("#page-home").html(),
            data() {
                return {
                    cfg: {}
                }
            },
            methods: {},
            mounted() {
                this.cfg = common.getAppCfg().home;
            }
        }
    }

    function Bookmarks() {

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
            template: $("#page-bookmarks").html(),
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
                    common.getContent("json/chrome.bookmark.json", refreshCache).then(data => {
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
            }
        }
    }

    function Files() {

        let editor;

        return {
            template: $("#page-files").html(),
            data() {
                return {
                    selectedFile: "",
                    fileList: []
                }
            },
            methods: {

                addFile() {
                    utils.prompt('请输入文件路径', '新增文件', {
                        inputPattern: /^[\w/](.)+[a-z]+$/,
                        inputErrorMessage: '格式不正确'
                    }).then(({ value }) => {
                        common.newFile(value, "new File init").then(() => {
                            this.initSemantic();
                        })
                    }).catch(() => {

                    });
                },

                syncFiles() {
                    utils.confirm('是否重新同步文件树?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        common.initFileTree().then(data => {
                            this.initSemantic();
                        });
                    }).catch(() => {

                    });
                },

                deleteFile() {
                    if (this.selectedFile === "") {
                        utils.message.info("请选择文件");
                        return;
                    }
                    utils.confirm(`确认删除文件[${this.selectedFile}]?`, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        common.delteFile(this.selectedFile).then(data => {
                            this.selectedFile = "";
                            this.initSemantic();
                        });
                    }).catch(() => {

                    });
                },

                loadFile(sync = false) {
                    common.getContent(this.selectedFile, sync).then(data => {
                        let suffix = this.selectedFile.substr(this.selectedFile.lastIndexOf(".") + 1);
                        switch (suffix) {
                            case "md":
                                suffix = "markdown";
                                break;
                            default:
                                break;
                        }
                        monaco.editor.setModelLanguage(editor.getModel(), suffix);
                        editor.setValue(data);
                        if (sync) tip("文件加载完成!", `已重新加载文件 => ${this.selectedFile}`);
                    });
                },

                initMonacoEditor() {
                    common.asyncLoadLibs(["/cdn/monaco-editor/min/vs/loader.js"]).then(() => {
                        require.config({ paths: { vs: '/cdn/monaco-editor/min/vs' } });
                        require(['vs/editor/editor.main'], () => {
                            editor = monaco.editor.create(document.getElementById('editor-container'), {
                                value: 'start edit gitee files...',
                                language: "markdown",
                                theme: "vs",
                                automaticLayout: true
                            });
                            this.initEditorActions();
                        });
                    });
                },

                initSemantic() {
                    let fileListOrigin = common.getFileListOrigin();
                    let fileList = [];
                    let lastDir;
                    for (let file of fileListOrigin) {
                        if (file.type === "tree") {
                            // 文件夹
                            lastDir = { file, children: [] };
                            fileList.push(lastDir);
                        } else if (lastDir && file.path.indexOf(lastDir.file.path) !== -1) {
                            lastDir.children.push(file);
                        } else {
                            fileList.push({ file });
                        }
                    }

                    let source = fileListOrigin.filter(file => file.type === "blob").map(file => ({ title: file.path }));
                    this.fileList = fileList;
                    let app = this;
                    $('#ed-file-search').search({
                        source,
                        minCharacters: 1,
                        selectFirstResult: true,
                        onSelect(result, response) {
                            app.selectFile(result.title);
                        }
                    });
                },

                selectFile(file) {
                    this.selectedFile = file;
                    this.loadFile();
                },

                update() {
                    if (this.selectedFile === "") {
                        utils.message.info("请选择编辑文件");
                        return;
                    }
                    let value = editor.getValue();
                    common.getContent(this.selectedFile).then(data => {
                        if (data !== value) {
                            common.updateFile(this.selectedFile, value);
                        } else {
                            utils.message.info("文件内容未变化！");
                        }
                    });


                },

                initEditorActions() {
                    let actions = [
                        {
                            name: "保存文件",
                            group: "yh-file",
                            keys: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
                            call: () => {
                                this.update();
                            },
                        },
                        {
                            name: "清空文件树缓存", group: "yh-file", call: () => {
                                if (!confirm("确认清空文件树缓存？")) return;
                                common.initFileTree().then((data) => {
                                    utils.message.success("清空文件树缓存完成！");
                                });
                            }
                        }
                    ];

                    let index = 0;
                    for (let action of actions) {
                        editor.addAction({
                            id: `yh-editor-${++index}`,
                            label: action.name,
                            keybindings: action.keys ? action.keys : [],
                            precondition: null,
                            keybindingContext: null,
                            contextMenuGroupId: action.group ? action.group : 'yh-editor',
                            contextMenuOrder: 1.5 + index,
                            run: action.call
                        });
                    }
                }

            },
            mounted() {
                this.initMonacoEditor();
                this.initSemantic();
            }
        }
    }

    const Header = {
        template: $("#page-header").html(),
        data() {
            return {
                title: "Yanhui1993",
                active: "",
                menus
            }
        },
        methods: {
            titleCall(menu) {
                this.active = menu.title;
                this.$router.push(menu.url);
                $(document).scrollTop(0);
            },
            toggleMenu() {
                utils.toggleLeftMenu();
            }
        },
        mounted() {
            this.active = location.hash.split("#/")[1];
        }
    }

    return {
        Bookmarks: Bookmarks(),
        Home: Home(),
        Header,
        Files: Files(),
        menus
    }

})();

// app start
const vappStart = (function () {

    // 2. 定义路由
    const routes = [
        { path: '/', redirect: '/home' },
        { path: '/home', component: vappComponents.Home },
        { path: '/files', component: vappComponents.Files },
        { path: '/bookmarks', component: vappComponents.Bookmarks }
    ]

    const router = new VueRouter({
        routes // (缩写) 相当于 routes: routes
    })

    let appInitFunc = () => {

        let app = new Vue({
            el: "#root",
            components: {
                "app-header": vappComponents.Header
            },
            router,
            methods: {},
            data() {
                return { navLinks: [] }
            },
            mounted() {
            }
        });

        window.tip = app.tip;

        new Vue({
            el: "#vapp-leftMenu",
            data() {
                return { navLinks: [] }
            },
            methods: {
                itemClick(link) {
                    app.$router.push(link.url);
                    $("#vapp-leftMenu").sidebar('toggle');
                    app.$refs.header.active = link.url;
                }
            },
            mounted() {
                this.navLinks = vappComponents.menus;
            }
        });


    };

    return appInitFunc;
})();

$(function () {
});

const utils = {
    toggleLeftMenu() {
        $("#vapp-leftMenu").sidebar('toggle');
    },
    alert: Vue.prototype.$alert,
    message: Vue.prototype.$message,
    notify: Vue.prototype.$notify,
    prompt: Vue.prototype.$prompt,
    confirm: Vue.prototype.$confirm,
    loading: Vue.prototype.$loading,
};

// commmon init...
const common = (function () {

    let appCfg = {};
    const storage_login = "login-state";
    const storage_fileList = "fileList";
    const storage_fileList_origin = "fileList_origin";
    const configFilePath = "config/vapp.json";
    const config = {
        client_id: "f5250ed1c6f0a51423ca06aa4faf5c10d64ce8b411c425256d22fec16a531665",
        client_secret: "00a0f31357ce04fe3619eab7149d7c1b4daade23677a898b8f14bb647bc25fb3",
        username: "yanhui1993",
        project: "webdata"
    }

    if ("/login.html" === window.location.pathname) return { config };

    let loginStorageData = localStorage.getItem(storage_login);
    if ("/login.html" !== window.location.pathname && !loginStorageData) {
        window.location.href = `/login.html?page=${window.location.pathname}`;
        return;
    }

    let { access_token, created_at, expires_in, refresh_token } = JSON.parse(loginStorageData);
    // 保存文件路径和sha的对应关系
    let fileTree = {};
    let fileListOrigin = [];


    function getFileList() {
        let fileList = [];
        for (let key in fileTree) {
            fileList.push(key);
        }
        return fileList;
    }

    function getFileListOrigin() {
        return fileListOrigin;
    }

    async function appInit() {
        return new Promise(async resolve => {
            window.axios && axiosInit();
            await dataInit();
            resolve();
        });
    }

    async function dataInit() {
        // 初始化app配置
        let tokenHasExpires = Math.floor(Date.now() / 1000) - created_at > expires_in;
        if (tokenHasExpires) {
            let response = await axios.post(`https://gitee.com/oauth/token?grant_type=refresh_token&refresh_token=${refresh_token}`);
            if (response.status === 200) {
                let loginStateTxt = JSON.stringify(response.data);
                access_token = response.data.access_token;
                localStorage.setItem(storage_login, loginStateTxt);
                utils.notify.success("刷新token成功！");
            } else {
                window.location.href = "/login.html";
                return;
            }
        }

        let fileListStorageData = localStorage.getItem(storage_fileList);
        let fileListStorageDataOrigin = localStorage.getItem(storage_fileList_origin);
        if (fileListStorageData) {
            fileTree = JSON.parse(fileListStorageData);
            fileListOrigin = JSON.parse(fileListStorageDataOrigin);
        } else {
            await initFileTree();
        }

        let appCfgData = await getContent(configFilePath);
        appCfg = JSON.parse(appCfgData);
    }

    // 获取指定路径的文件内容
    async function getContent(filePath, refresh = false) {
        let cacheContent = localStorage.getItem(filePath);
        if (!refresh && cacheContent) {
            return Base64.decode(cacheContent);
        }
        let data = await axios.get(`https://gitee.com/api/v5/repos/${config.username}/${config.project}/contents/${filePath}?access_token=${access_token}`);
        if (!data.content) {
            utils.message.warning(`获取文件内容失败! [${filePath}]`);
            return null;
        }
        localStorage.setItem(filePath, data.content);
        return Base64.decode(data.content);
    }

    // 更新文件
    async function updateFile(filePath, content) {
        let sha = fileTree[filePath];
        if (!sha) {
            utils.notify.warning(`未匹配文件 ${filePath}`);
            return;
        }
        let loading = utils.loading({ text: "更新文件中..." });
        let data = Base64.encode(content);
        axios.put(`https://gitee.com/api/v5/repos/${config.username}/${config.project}/contents/${filePath}`, {
            access_token,
            content: data,
            sha,
            message: `open api update ${window.location.pathname}`
        }).then(() => {
            loading.close();
            utils.notify.success(`更新[${filePath}]成功！`, "success");
            localStorage.setItem(filePath, data);
            initFileTree();
        }).catch((err) => {
            loading.close();
            console.error(err);
            utils.notify.error("更新异常！", "error");
        })
    }

    // 删除文件
    async function delteFile(filePath) {
        let sha = fileTree[filePath];
        if (!sha) {
            utils.notify.warning(`未匹配文件 ${filePath}`);
            return;
        }
        let loading = utils.loading({ text: "删除文件中..." });
        return new Promise((resolve) => {
            axios.delete(`https://gitee.com/api/v5/repos/${config.username}/${config.project}/contents/${filePath}`, {
                params: {
                    access_token,
                    sha,
                    message: `open api delete ${window.location.pathname}`
                }
            }).then(async () => {
                loading.close();
                utils.notify.success(`删除[${filePath}]成功！`, "success");
                localStorage.removeItem(filePath);
                await initFileTree();
                resolve();
            }).catch((err) => {
                loading.close();
                console.error(err);
                utils.notify.error("删除异常！", "error");
            })
        })

    }

    // 新增文件
    async function newFile(filePath, content) {
        if (!filePath || !content) {
            return;
        }
        let data = Base64.encode(content);
        let loading = utils.loading({ text: "新增文件中..." });
        return new Promise((resolve) => {
            axios.post(`https://gitee.com/api/v5/repos/${config.username}/${config.project}/contents/${filePath}`, {
                access_token,
                content: data,
                message: `open api new ${window.location.pathname}`
            }).then(async (data) => {
                utils.notify.success("新增成功！", "success");
                loading.close();
                await initFileTree();
                resolve();
            }).catch((err) => {
                loading.close();
                console.error(err);
                utils.notify.error("新增异常！", "error");
            })
        })

    }

    // 获取整个项目的文件列表
    async function initFileTree() {
        // 获取项目下的文件树
        let data = await axios.get(`https://gitee.com/api/v5/repos/${config.username}/${config.project}/git/trees/master?access_token=${access_token}&recursive=1`);
        let fileList = data.tree;
        let newFileTree = {};
        for (let file of fileList) {
            if (file.type === "blob") {
                newFileTree[file.path] = file.sha;
            }
        }
        fileTree = newFileTree;
        fileListOrigin = fileList;
        localStorage.setItem(storage_fileList, JSON.stringify(newFileTree));
        localStorage.setItem(storage_fileList_origin, JSON.stringify(fileList));
        return fileTree;
    }

    function axiosInit() {
        axios.interceptors.request.use(function (config) {
            return config;
        }, function (error) {
            return Promise.reject(error);
        });

        axios.interceptors.response.use(function (response) {
            if (response.status === 200) {
                return response.data;
            }
            return response;
        }, function (error) {
            if (error.response.status === 401 && "/login.html" !== window.location.pathname) {
                window.location.href = "/login.html";
            } else {
                return Promise.reject(error);
            }
        });
    }

    async function asyncLoadLibs(libs = []) {
        for (let lib of libs) {
            await loadBaseLib(lib);
        }
    }

    async function loadBaseLib(lib) {
        return new Promise((resolve) => {
            loadLibs(lib, () => {
                resolve();
            });
        });
    }

    function loadLibs(url, callback) {
        let script = document.createElement('script');
        let fn = callback || function () {
        };

        script.type = 'text/javascript';
        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState === 'loaded' || script.readyState === 'complete') {
                    script.onreadystatechange = null;
                    fn();
                }
            };
        } else {
            script.onload = function () {
                fn();
            };
        }
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
    }

    function loadCss(url, callback) {
        let link = document.createElement('link');
        let fn = callback || function () {
        };

        link.rel = 'stylesheet';
        if (link.readyState) {
            link.onreadystatechange = function () {
                if (link.readyState === 'loaded' || link.readyState === 'complete') {
                    link.onreadystatechange = null;
                    fn();
                }
            };
        } else {
            link.onload = function () {
                fn();
            };
        }
        link.href = url;
        document.getElementsByTagName('head')[0].appendChild(link);
    }

    function getAppCfg() {
        return appCfg;
    }

    const Base64 = {

        // private property
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        // public method for encoding
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = Base64._utf8_encode(input);

            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

            }

            return output;
        },

        // public method for decoding
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            while (i < input.length) {

                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

            }

            output = Base64._utf8_decode(output);

            return output;

        },

        // private method for UTF-8 encoding
        _utf8_encode: function (string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        },

        // private method for UTF-8 decoding
        _utf8_decode: function (utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;

            while (i < utftext.length) {

                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }

            }

            return string;
        }

    }

    appInit().then(vappStart);

    return {
        config,
        getFileList,
        getContent,
        updateFile,
        newFile,
        delteFile,
        base64: Base64,
        initFileTree,
        asyncLoadLibs,
        getAppCfg,
        getFileListOrigin
    }

})();


