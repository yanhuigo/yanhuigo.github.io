requireJsConfig();
initApp();

function requireJsConfig() {
    // 本地js定义
    let localLibs = ['home','bookmarks'];
    let localPath = {};
    for (let lib of localLibs) {
        localPath[lib] = isProd ? lib + ".min" : lib;
    }

    // 本地css定义
    let localCssList = [];
    let localCssPath = [];
    for (let css of localCssList) {
        localCssPath.push(isProd ? `css!/css/${css}` + ".min.css" : `css!/css/${css}.css`);
    }

    // 路径配置
    require.config({
        map: {
            '*': {
                'css': '/cdn/css.min.js',
            }
        },
        // 默认自动加载的模块
        deps: [
            "vue", "vueRouter", "axios", "ELEMENT",
            "css!/cdn/element-ui/lib/theme-chalk/index.css",
            "css!/cdn/element-ui/lib/theme-chalk/display.css",
            "css!/libs/public/public.css",
            ...localCssPath
        ],
        // 定义模块 名称key-路径value
        paths: {
            "vue": "/cdn/vue/vue.min",
            "vueRouter": "/cdn/vue/vue-router",
            "axios": "/cdn/axios.min",
            "ELEMENT": "/cdn/element-ui/lib/index",
            "gitee": "/libs/yanhui/gitee.min",
            "utils": "/libs/yanhui/utils.min",
            "base64": "/libs/yanhui/base64.min",
            "sysLog": "/libs/yanhui/sysLog.min",
            ...localPath
        },
        // 加载非AMD规范的JS文件
        shim: {
            // "semantic": {
            //     deps: ['jquery']
            // }
        }
    });
}


function initApp() {
    require([
        'vue',
        'gitee',
        'ELEMENT',
        'vueRouter',
        'axios',
        'utils'
    ], function (
        Vue,
        gitee,
        element,
        VueRouter,
        axios,
        utils
    ) {

        axiosInit(axios, utils);
        Vue.use(element);
        Vue.use(VueRouter);
        gitee.initState().then(data => {
            vueMixin();
            startVueApp();
        });
    })
}

function startVueApp() {
    require([
        'vue',
        'gitee',
        'vueRouter',
        'ELEMENT'
    ], function (
        Vue,
        gitee,
        VueRouter,
        element
    ) {

        gitee.getFileContent('config/public.json', false, true).then(config => {
            console.log('config', config);
            initVue(config);
        });

        function initVue(config) {
            window.wyd2021 = new Vue({
                el: "#root",
                router: vueRouterInit(gitee, VueRouter, element, config),
                data() {
                    return {
                        activePath: "",
                        currentTheme: "",
                        config: {
                            base: {},
                            routes: [],
                            themes: []
                        }
                    }
                },
                methods: {
                    route(name) {
                        this.$router.push(name);
                    },
                    loadTheme(theme) {
                        let link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = `/cdn/bootswatch/bootstrap.${theme}.min.css`;
                        document.body.appendChild(link);
                        this.currentTheme = theme;
                    },
                    setTheme(theme) {
                        localStorage.setItem("index-theme", theme);
                        window.location.reload();
                    },
                    clearCache() {
                        let mdfFiles = [];
                        for (let key in localStorage) {
                            if (localStorage.hasOwnProperty(key)) {
                                if (key && key.indexOf("@") !== -1) {
                                    mdfFiles.push(key);
                                }
                            }
                        }
                        if (confirm("确认清空所有缓存？")) {
                            if (mdfFiles.length > 0) {
                                utils.confirm(`存在已修改未上传的文件，是否继续清空缓存？【${mdfFiles.join("；")}】`).then(() => {
                                    gitee.clearAllCache();
                                    location.reload();
                                }).catch(() => {
                                });
                            } else {
                                gitee.clearAllCache();
                                location.reload();
                            }

                        }
                    }
                },
                watch: {
                    $route(newVal, oldVal) {
                        this.activePath = newVal.path;
                    }
                },
                mounted() {
                    this.config = config;
                    document.title = config.base.title;
                    let theme = localStorage.getItem("index-theme");
                    this.loadTheme(!!theme ? theme : config.base.defaultTheme);
                },
                template: `
                <div>
                    <nav class="navbar navbar-expand-lg navbar-dark bg-dark nav-pills">
                        <div class="container-fluid">
                        <a class="navbar-brand" href="#">{{config.base.title}}</a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor03" aria-controls="navbarColor03" aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                    
                        <div class="collapse navbar-collapse" id="navbarColor03">
                            <ul class="navbar-nav me-auto">
         
    
                                <template v-for="route in config.routes">
                                    <li v-if="typeof route[1] === 'string'" class="nav-item">
                                        <a class="nav-link" :class="activePath===route[1].substr(1)?'active':''" :href="route[1]">
                                            <i v-if="route[2]" :class="'fa fa-'+route[2]"></i>
                                            <span>{{route[0]}}</span>
                                        </a>
                                    </li>
                                    <li v-else class="nav-item dropdown">
                                        <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                                            {{route[0]}}
                                        </a>
                                        <div class="dropdown-menu">
                                        <a v-for="subRoute in route[1]" class="dropdown-item" :class="activePath===subRoute[1].substr(1)?'active':''" :href="subRoute[1]" :target="subRoute[1].startsWith('#')?'_self':'_blank'">
                                            <i v-if="subRoute[2]" :class="'fa fa-'+subRoute[2]"></i>
                                            <span>{{subRoute[0]}}</span>
                                        </a>
                                        </div>
                                    </li>
                                </template>
    
                                <li class="nav-item dropdown">
                                    <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                                        Themes
                                    </a>
                                    <div class="dropdown-menu">
                                        <a v-for="oneTheme in config.themes" :class="currentTheme==oneTheme?'active':''" class="dropdown-item yh-pointer" @click="setTheme(oneTheme)">{{oneTheme}}</a>
                                    </div>
                                </li>
                                
                            </ul>
                            <div class="d-flex">
                                <i class="fa fa-refresh fa-2x yh-pointer" @click="clearCache"></i>
                            </div>
                        </div>
                        </div>
                    </nav>
                    <div class="flex-grow-1">
                        <keep-alive>
                            <router-view></router-view>
                        </keep-alive>
                    </div>
                    <div>
                        <el-backtop target="body" :visibility-height="100"></el-backtop>
                    </div>
                </div>
            `
            });
        }

    })
}

function vueRouterInit(gitee, VueRouter, element, config) {
    const routeNames = ['home', 'bookmarks'];
    const routes = [
        { path: '/', redirect: config.base.defaultRoute }
    ]
    for (let routeName of routeNames) {
        routes.push({
            path: `/${routeName}`, component: resolve => {
                require([routeName], (data) => {
                    if (data.cps) {
                        resolve(data.cps);
                    } else {
                        resolve(data);
                    }
                });
            }
        });
    }

    let autoRouteList = config["autoRouteList"];
    if (autoRouteList) {
        try {
            for (let autoRoute of autoRouteList) {
                let meRoute = `ar_${autoRoute}`;
                routes.push({
                    path: `/${meRoute}`, component: resolve => {
                        gitee.getFileContent(`cps/${autoRoute}.js`).then(data => {
                            // 动态注入脚本
                            let script = document.createElement('script');
                            script.type = 'text/javascript';
                            script.append(data);
                            document.body.appendChild(script);
                            require([meRoute], (data) => {
                                if (data.cps) {
                                    resolve(data.cps);
                                } else {
                                    resolve(data);
                                }
                            });
                        });
                    }
                });
            }
        } catch (e) {
            console.error(e);
        }
    }

    let router = new VueRouter({
        routes
    });

    let loading;
    let loadedRoute = [];
    router.beforeEach((to, from, next) => {
        if (!loadedRoute.includes(to.path)) {
            loading = element.Loading.service({
                lock: true,
                text: 'Loading~~~',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.9)'
            });
            setTimeout(() => {
                loading.close();
            }, 3000)
        }
        next();
    });

    router.afterEach((to, from) => {
        if (!loadedRoute.includes(to.path)) {
            loadedRoute.push(to.path);
            loading && loading.close();
        }
    });

    return router;
}

/**
 * axios拦截器初始化
 */
function axiosInit(axios, utils) {
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
        if (error.response && error.response.status === 401) {
            utils.goLogin();
        }
        return Promise.reject(error);
    });
}

function vueMixin() {
    require(['vue', 'utils'], (Vue, utils) => {
        // 全局混入
        Vue.mixin({
            mounted() {
                if (!this.$el.getAttribute) {
                    return;
                }
                let wydFlag = this.$el.getAttribute("wydFlag");
                if (wydFlag) {
                    utils.setVueCps(wydFlag, this);
                }
            }
        })
    })
}





