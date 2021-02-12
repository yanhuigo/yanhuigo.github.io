let isProd = true;
if (window.location.host.indexOf('localhost') !== -1) isProd = false;

// 本地包定义
let localLibs = ["header", "utils", "gitee", "editor", "bookmarks", "base64"];
let localPath = {};
for (let lib of localLibs) {
    localPath[lib] = isProd ? lib + "-min" : lib;
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
        "css!/css/util.css",
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
    'onlinePage',
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

    gitee.initState().then(data => {
        vueMixin();
        // 数据初始化完成
        appInit();
        leftAppInit();
    });

    Vue.use(element);
    Vue.use(VueRouter);

    function appInit() {
        window.wyd2021 = rootApp = new Vue({
            el: "#root",
            router: vueRouterInit(),
            components: {
                "app-header": Header,
            },
            mounted() {

            },
            template: `
            <div class="d-flex flex-column vh-100">
                <div>
                    <app-header ref="header"/>
                </div>
                <app-login />
                <div class="flex-grow-1 p-1" style="max-height: 100vh;overflow: auto">
                    <keep-alive>
                        <router-view></router-view>
                    </keep-alive>
                </div>
            </div>
        `
        });
    }

    function leftAppInit() {
        new Vue({
            el: "#app-leftMenu",
            data() {
                return {level1Menus: []}
            },
            methods: {
                loadLevelMenu() {
                    gitee.getFileContent("config/wyd2021.json", false, true).then(data => {
                        this.level1Menus = data.level1Menus;
                    });
                },
                itemClick(name) {
                    let headerCps = utils.getVueCps("header");
                    headerCps.route(name);
                    headerCps.toggleLeftMenu();
                },
                clearCache() {
                    if (confirm("确认清空所有缓存？")) {
                        gitee.clearAllCache();
                    }
                }
            },
            mounted() {
                this.loadLevelMenu();
            }
        });
    }

    function vueRouterInit() {
        const routes = [
            {path: '/', redirect: '/bookmarks'},
            {
                path: '/bookmarks', component: resolve => {
                    require(['bookmarks'], resolve);
                }
            },
            {
                path: '/editor', component: resolve => {
                    require(['editor'], resolve);
                }
            },
            {
                path: '/onlinePage', component: resolve => {
                    require(['onlinePage'], resolve);
                }
            },
        ]
        const router = new VueRouter({
            routes
        });

        /*router.beforeEach((to, from, next) => {
            next();
        })*/

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
            if (error.response.status === 401) {
                gitee.goLogin();
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
