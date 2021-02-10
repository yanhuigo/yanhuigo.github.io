// 路径配置
require.config({
    map: {
        '*': {
            'css': '/cdn/css.min.js',
        }
    },
    deps: [
        "vue", "vue-router", "axios", "element",
        "css!/cdn/element-ui/lib/theme-chalk/index.css",
        "css!/css/util.css",
        "css!/css/main.css",
    ],
    paths: {
        "vue": "/cdn/vue/vue.min",
        "vue-router": "/cdn/vue/vue-router",
        "axios": "/cdn/axios.min",
        "element": "/cdn/element-ui/lib/index",
    }
});

// app入口
require([
    'vue',
    'axios',
    'gitee',
    'require'
], function (vue, axios, gitee, require) {

    axiosInit();

    gitee.initState().then(data => {

        // 数据初始化完成
        appInit();

    });

    let element = require("ELEMENT");
    vue.use(element);

    function appInit() {
        new vue({
            el: "#root",
            mounted() {
                this.$loading("aaa")
            },
            template: `
            <div>
                start app
            </div>
        `
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
