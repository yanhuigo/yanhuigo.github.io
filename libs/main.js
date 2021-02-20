let isProd = true;
if (window.location.host.indexOf('localhost') !== -1) isProd = false;

// 本地js定义
let localLibs = ["header", "utils", "gitee", "editor", "bookmarks", "base64", "home", "storageView", "sysLog"];
let localPath = {};
for (let lib of localLibs) {
    localPath[lib] = isProd ? lib + "-min" : lib;
}

// 本地css定义
let localCssList = ["util", "wyd2021"];
let localCssPath = [];
for (let css of localCssList) {
    localCssPath.push(isProd ? `css!/css/${css}` + "-min.css" : `css!/css/${css}.css`);
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
        "vue", "vueRouter", "axios", "ELEMENT", "jquery", "semantic",
        "css!/cdn/element-ui/lib/theme-chalk/index.css",
        "css!/cdn/element-ui/lib/theme-chalk/display.css",
        "css!/cdn/semantic/semantic.min.css",
        ...localCssPath
    ],
    // 定义模块 名称key-路径value
    paths: {
        "vue": "/cdn/vue/vue.min",
        "vueRouter": "/cdn/vue/vue-router",
        "axios": "/cdn/axios.min",
        "ELEMENT": "/cdn/element-ui/lib/index",
        "jquery": '/cdn/bootstrap/jquery.min',
        "semantic": '/cdn/semantic/semantic.min',
        "vs": '/cdn/monaco-editor/min/vs',
        "vue-markdown": '/cdn/vue/vue-markdown.min',
        "markdownIt": '/cdn/markdown-it.min',
        ...localPath
    },
    // 加载非AMD规范的JS文件
    shim: {
        "semantic": {
            deps: ['jquery']
        }
    }
});

// app入口
require([
    'vue',
    'axios',
    'gitee',
    'ELEMENT',
    'vueRouter',
    'header',
    'utils',
], function (
    Vue,
    axios,
    gitee,
    element,
    VueRouter,
    Header,
    utils,
) {

    axiosInit();

    Vue.use(element);
    Vue.use(VueRouter);

    gitee.initState().then(data => {
        vueMixin();
        // 数据初始化完成
        appInit();
    });

    function appInit() {
        window.wyd2021 = new Vue({
            el: "#root",
            router: vueRouterInit(),
            components: {
                "app-header": Header,
            },
            mounted() {
            },
            template: `
            <div class="d-flex flex-column">
                <div>
                    <app-header ref="header"/>
                </div>
                <div class="flex-grow-1 wyd-app-router">
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

    const routeNames = ["home", "bookmarks", "editor", "login", "storageView", "sysLog"];

    function vueRouterInit() {
        const routes = [
            { path: '/', redirect: '/bookmarks' }
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

        let autoRouteList = gitee.getWydConfig()["autoRouteList"];
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
                    text: '努力加载中~~~',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.9)'
                });
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
            if (error.response && error.response.status === 401) {
                utils.goLogin();
            }
            return Promise.reject(error);
        });
    }

    function vueMixin() {
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
    }
});
