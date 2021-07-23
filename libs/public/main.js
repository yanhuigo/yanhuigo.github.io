requireJsConfig();
initApp();

function requireJsConfig() {
    // 本地js定义
    let localLibs = [];
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
            "css!/cdn/bootswatch/bootstrap.Morph.min.css",
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
        window.wyd2021 = new Vue({
            el: "#root",
            router: vueRouterInit(gitee, VueRouter, element),
            components: {
            },
            mounted() {
                gitee.refreshToken();
            },
            template: `
            <div class="d-flex flex-column">
                <nav class="navbar navbar-expand-lg navbar-light bg-light">
                    <div class="container-fluid">
                    <a class="navbar-brand" href="#">Navbar</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor03" aria-controls="navbarColor03" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                
                    <div class="collapse navbar-collapse" id="navbarColor03">
                        <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link active" href="#">Home
                            <span class="visually-hidden">(current)</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#">Features</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#">Pricing</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#">About</a>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Dropdown</a>
                            <div class="dropdown-menu">
                            <a class="dropdown-item" href="#">Action</a>
                            <a class="dropdown-item" href="#">Another action</a>
                            <a class="dropdown-item" href="#">Something else here</a>
                            <div class="dropdown-divider"></div>
                            <a class="dropdown-item" href="#">Separated link</a>
                            </div>
                        </li>
                        </ul>
                        <form class="d-flex">
                        <input class="form-control me-sm-2" type="text" placeholder="Search">
                        <button class="btn btn-secondary my-2 my-sm-0" type="submit">Search</button>
                        </form>
                    </div>
                    </div>
                </nav>
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
    })
}

function vueRouterInit(gitee, VueRouter, element) {
    const routeNames = [];
    const routes = [
        // { path: '/', redirect: '/editor' }
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





