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
], function (
    Vue,
    axios,
    gitee,
    element,
    VueRouter,
    editor,
    header
) {

    axiosInit();

    gitee.initState().then(data => {

        // 数据初始化完成
        appInit();

    });

    Vue.use(element);
    Vue.use(VueRouter);

    function appInit() {
        new Vue({
            el: "#root",
            router: vueRouterInit(),
            components: {
                "app-header": header
            },
            mounted() {

            },
            template: `
            <div class="d-flex flex-column vh-100">
                <div class="hidden-sm-only">
                    <app-header />
                </div>
                <div class="flex-grow-1">
                    <keep-alive>
                        <router-view></router-view>
                    </keep-alive>
                </div>
                <div>
                    Bottom
                </div>
            </div>
        `
        });
    }

    function vueRouterInit() {
        const routes = [
            {path: '/', redirect: '/editor'},
            {path: '/editor', component: editor},
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
            return Promise.reject(error);
        });
    }
});
