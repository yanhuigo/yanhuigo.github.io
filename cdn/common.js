let initAsyncFunc = async function (initCfg) {

    let appCfg = {};
    const storage_login = "login-state";
    const storage_fileList = "fileList";
    const configFilePath = "json/config.json";
    const config = {
        client_id: "f5250ed1c6f0a51423ca06aa4faf5c10d64ce8b411c425256d22fec16a531665",
        client_secret: "00a0f31357ce04fe3619eab7149d7c1b4daade23677a898b8f14bb647bc25fb3",
        username: "yanhui1993",
        project: "webdata"
    }

    if ("/login.html" === window.location.pathname) return {config};

    let loginStorageData = localStorage.getItem(storage_login);
    if ("/login.html" !== window.location.pathname && !loginStorageData) {
        window.location.href = "/login.html";
        return;
    }

    let {access_token, created_at, expires_in, refresh_token} = JSON.parse(loginStorageData);
    // 保存文件路径和sha的对应关系
    let fileTree = {};

    async function appInit() {

        if (!initCfg.noLoadDefault) {
            let baseLibs = ["/cdn/vue/vue.min.js", "/cdn/axios.min.js", "/cdn/bootstrap/jquery.slim.min.js"];
            let asyncLibs = ["/cdn/bootstrap/bootstrap.min.js", "/cdn/bootstrap/bootstrap.min.css", "/cdn/font-awesome-4.7.0/css/font-awesome.min.css"];

            if (initCfg.baseLibs) {
                baseLibs = baseLibs.concat(initCfg.baseLibs);
            }

            if (initCfg.asyncLibs) {
                asyncLibs = asyncLibs.concat(initCfg.asyncLibs);
            }

            await loadBaseLibs(baseLibs);
            axiosInit();
            for (let lib of asyncLibs) {
                if (lib.indexOf(".css") !== -1) {
                    loadCss(lib);
                } else {
                    loadLibs(lib);
                }

            }
        } else {
            window.axios && axiosInit();
        }


        return new Promise(async resolve => {
            window.Vue && vueComponentBind();
            await dataInit();
            resolve();
        });
    }

    async function loadBaseLibs(libs = []) {
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

    async function dataInit() {


        // 初始化app配置
        let tokenHasExpires = Math.floor(Date.now() / 1000) - created_at > expires_in;
        if (tokenHasExpires) {
            let response = await axios.post(`https://gitee.com/oauth/token?grant_type=refresh_token&refresh_token=${refresh_token}`);
            if (response.status === 200) {
                let loginStateTxt = JSON.stringify(response.data);
                console.log("已刷新token", response.data);
                access_token = response.data.access_token;
                localStorage.setItem(storage_login, loginStateTxt);
            } else {
                window.location.href = "/login.html";
                return;
            }
        }

        let fileListStorageData = localStorage.getItem(storage_fileList);
        if (fileListStorageData) {
            fileTree = JSON.parse(fileListStorageData);
        } else {
            await initFileTree();
        }

        let appCfgData = await getContent(configFilePath);
        appCfg = JSON.parse(appCfgData);
    }


    function tip(msg, detail = "") {
        if (window.Notification) {
            Notification.requestPermission(function (status) {
                let n = new Notification(msg, {
                    body: detail,
                    dir: "rtl",
                    icon: "https://yanhui1993.gitee.io/imgs/logo.jpg"
                });
                n.onshow = function () {
                    setTimeout(n.close.bind(n), 3000);
                }
            });
        } else {
            alert(msg);
        }
    }


    // 获取指定路径的文件内容
    async function getContent(filePath, refresh = false) {
        let cacheContent = localStorage.getItem(filePath);
        if (!refresh && cacheContent) {
            return Base64.decode(cacheContent);
        }
        let data = await axios.get(`https://gitee.com/api/v5/repos/${config.username}/${config.project}/contents/${filePath}?access_token=${access_token}`);
        localStorage.setItem(filePath, data.content);
        return Base64.decode(data.content);
    }

    // 更新文件
    async function updateFile(filePath, content) {
        let sha = fileTree[filePath];
        if (!sha) {
            tip(`未匹配匹配文件 ${filePath}`);
            return;
        }
        let data = Base64.encode(content);
        axios.put(`https://gitee.com/api/v5/repos/${config.username}/${config.project}/contents/${filePath}`, {
            access_token,
            content: data,
            sha,
            message: `open api update ${window.location.pathname}`
        }).then(() => {
            tip("更新成功！");
            localStorage.setItem(filePath, data);
            initFileTree();
        }).catch((err) => {
            console.error(err);
            tip("更新异常！");
        })
    }

    // 新增文件
    async function newFile(filePath, content) {
        if (!filePath || !content) {
            return;
        }
        let data = Base64.encode(content);
        axios.post(`https://gitee.com/api/v5/repos/${config.username}/${config.project}/contents/${filePath}`, {
            access_token,
            content: data,
            message: `open api new ${window.location.pathname}`
        }).then((data) => {
            tip("新增成功！");
            initFileTree();
        }).catch((err) => {
            console.error(err);
            tip("新增异常！");
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
        localStorage.setItem(storage_fileList, JSON.stringify(newFileTree));
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

    function vueComponentBind() {

        // element
        Vue.component('yanhui-header-element', {
            data() {
                return {
                    links: []
                }
            },
            mounted() {
                this.links = appCfg.navLinks.concat([]);
                this.operations && this.links.push({
                    title: "Action",
                    children: this.operations ? this.operations : []
                });
            },
            methods: {
                handleSelect(key, keyPath) {
                    console.log(key, keyPath);
                    let callFunc = this[`menuCall${String(key).replace("-", "_")}`];
                    callFunc && callFunc();
                },
                menuCall0() {
                    alert(1);
                },
                menuCall1_0() {
                    alert(2);
                }
            },
            template: `
                <el-menu :default-active="0" class="el-menu-demo" mode="horizontal" @select="handleSelect">
                    <template v-for="(link,index) in links">
                        <el-menu-item v-if="!link.children" :index="index">{{link.title}}</el-menu-item>
                        <el-submenu v-else :index="index">
                            <template slot="title">{{link.title}}</template>
                            <el-menu-item v-for="(subLink,subIndex) in link.children" :index="index+'-'+subIndex">{{subLink.title}}</el-menu-item>
                        </el-submenu>
                    </template>
                </el-menu>
            `
        });

        // bootstrap
        Vue.component('yanhui-header', {
            data() {
                return {
                    links: []
                }
            },
            methods: {},
            mounted() {
                let commonOperations = [
                    {
                        title: "OpenApi", children: [
                            {
                                title: "更新应用配置", call: () => {
                                    if (confirm("确认清空应用配置并刷新页面？")) {
                                        localStorage.removeItem(configFilePath);
                                        window.location.reload();
                                    }
                                }
                            },
                            {
                                title: "清空所有缓存", call: () => {
                                    if (confirm("确认清空所有缓存并刷新页面？")) {
                                        for (let key in localStorage) {
                                            if (localStorage.hasOwnProperty(key) && key !== storage_login) {
                                                localStorage.removeItem(key);
                                            }
                                        }
                                        window.location.reload();
                                    }
                                }
                            },
                            {
                                title: "同步文件树", call: () => {
                                    confirm("确认同步文件树？") && initFileTree().then(() => {
                                        tip("同步文件树完成！");
                                    });
                                }
                            }
                        ]
                    },
                ];
                this.links = appCfg.navLinks.concat(commonOperations);
                this.operations && this.links.push({
                    title: "Action",
                    children: this.operations ? this.operations : []
                });
            },
            props: ['title', "icon", "operations"],
            template: `
                <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                    <i class="fa fa-2x text-light link mr-2 title-align-sub" :class="icon?'fa-'+icon:'fa-paper-plane-o'"></i>
                    <a class="navbar-brand" href="#">{{title}}</a>
                    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                  <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav mr-auto">
                      
                      <li class="nav-item" :class="link.children ? 'dropdown' : ''" v-for="(link,index) in links">
                        <a v-if="!link.children" class="nav-link" target="_blank" :href="link.url">{{link.title}} <span class="sr-only">(current)</span></a>
                        <template v-else>
                            <a class="nav-link dropdown-toggle" href="#" :id="'navbarDropdown'+index" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                              {{link.title}}
                            </a>
                            <div v-if="link.children" class="dropdown-menu" :aria-labelledby="'navbarDropdown'+index">
                                <template v-for="subLink in link.children">
                                    <a v-if="subLink.call" class="dropdown-item" href="###" @click.prevent="subLink.call">{{subLink.title}}</a>
                                    <a v-else class="dropdown-item" :href="subLink.url" target="_blank">{{subLink.title}}</a>
                                </template>
                            </div>
                        </template>
                      </li>
                    </ul>
                  </div>
                </nav>
            `
        })

    }

    await appInit();

    return {
        config,
        fileTree,
        getContent,
        updateFile,
        newFile,
        base64: Base64,
        tip,
        initFileTree,
        loadLibs
    }

};


window.initApp = async (initCfg = {}) => {

    // 基础数据加载完成后再启动应用
    window.common = await initAsyncFunc(initCfg);

    console.log("init complete...");
}
