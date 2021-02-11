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
    'editor',
    'header',
    'bookmarks',
    'utils',
    'login',
], function (
    Vue,
    axios,
    gitee,
    element,
    VueRouter,
    Editor,
    Header,
    Bookmarks,
    utils,
    Login
) {

    axiosInit();

    gitee.initState().then(data => {

        // 数据初始化完成
        appInit();
        leftAppInit();

    });

    Vue.use(element);
    Vue.use(VueRouter);

    let rootApp;

    function appInit() {
        rootApp = new Vue({
            el: "#root",
            router: vueRouterInit(),
            components: {
                "app-header": Header,
                "app-login": Login,
            },
            mounted() {

            },
            template: `
            <div class="d-flex flex-column vh-100">
                <div class="hidden-sm-only">
                    <app-header ref="header"/>
                </div>
                <app-login />
                <div class="flex-grow-1 p-1">
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
                    rootApp.$refs.header.route(name);
                    rootApp.$refs.header.toggleLeftMenu();
                },
                clearCache() {
                    utils.confirm('确认清空所有缓存?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        for (let key in localStorage) {
                            if (localStorage.hasOwnProperty(key)) {
                                if (key && key !== 'login-state') {
                                    localStorage.removeItem(key);
                                }
                            }
                        }
                        location.reload();
                    }).catch(() => {

                    });
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
            {path: '/bookmarks', component: Bookmarks},
            {path: '/editor', component: Editor},
        ]
        return new VueRouter({
            routes
        });
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
                if (confirm("确认跳转到登录页？")) {
                    window.location.href = `/login.html?page=${window.location.pathname}`;
                }
            }
            return Promise.reject(error);
        });
    }
});
