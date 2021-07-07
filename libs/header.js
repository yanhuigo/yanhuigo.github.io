define(['jquery', 'semantic', 'utils', 'gitee'], function ($, semantic, utils, gitee) {

    return {
        data() {
            return {
                active: "bookmarks",
                level1Menus: [],
                level2Menus: [],
                level3Menus: [],
                showMenu: false,
                showOperation: false,
                operationList: [
                    ["清空缓存", "clearCache"]
                ],
                asyncOperations: [],
                cpsOperations: {},
                appcfg: {},
            }
        },
        watch: {
            $route(newVal, oldVal) {
                this.active = newVal.path.substr(1);
                if (oldVal.path === '/login' && this.level1Menus.length === 0) {
                    // 登录页面跳转过来重新加载菜单
                    this.loadLevelMenu();
                }
            }
        },
        methods: {
            route(name) {
                if (name === this.active) return;
                this.$router.push(name);
                this.active = name;
                this.showMenu = false;
            },
            toggleLeftMenu() {
                this.showMenu = true;
                //$("#app-leftMenu").sidebar({closable: false}).sidebar('toggle');
            },
            openOperation() {
                this.showOperation = true;
            },
            loadLevelMenu() {
                gitee.getFileContent("config/wyd2021.json", false, true).then(data => {
                    this.level1Menus = data.level1Menus;
                    this.level2Menus = data.level2Menus;
                    this.level3Menus = data.level3Menus;
                    this.asyncOperations = data.asyncOperations;
                    this.appcfg = data.appcfg;
                    document.title = this.appcfg.title;
                    this.$nextTick(() => {
                        $(".dropdown").dropdown({
                            on: 'hover',
                            action: function (text, value) {
                                $(this).dropdown('hide');
                            }
                        });
                    })
                });
            },
            goURL(url) {
                window.open(url);
            },
            toggle() {
                utils.getVueCps("header").toggleLeftMenu();
            },
            callMethods(method) {
                this[method]();
                this.showOperation = false;
            },
            asyncLoadOperations() {
                gitee.getFileContent(`cps/operations.js`).then(data => {
                    // 动态注入脚本
                    let script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.append(data);
                    document.body.appendChild(script);
                    require(["cps_operations"], (data) => {
                        this.cpsOperations = data;
                    });
                });
            }
        },
        mounted() {
            this.loadLevelMenu();
            this.asyncLoadOperations();
            if (utils.isApp) {
                $("#wyd-header").addClass("pt-3");
            }
        },
        template: `
        <div id="wyd-header" class="ui menu wyd-header" wydFlag="header">
            
            <div class="header item link" @click="toggleLeftMenu">
                <img class="ui avatar image" :src="appcfg.logo" />
                <span class="font-weight-bold">{{appcfg.title}}</span>
            </div>
              
            <a class="item hidden-xs-only" :class="active===lv1Menu[1]?'active':''" v-for="lv1Menu in level1Menus" @click="route(lv1Menu[1])">
                <i class="icon large blue" :class="lv1Menu[2]"></i>
                <span>{{lv1Menu[0]}}</span>
            </a>
               
            <div class="ui pointing dropdown link item hidden-xs-only" v-for="lv2Menu in level2Menus">
                <i class="icon large blue" :class="lv2Menu.icon"></i>
                <span class="text">{{lv2Menu.title}}</span>
                <i class="dropdown icon"></i>
                <div class="menu">
                    <template v-for="lv2Link in lv2Menu.children">
                        <div v-if="typeof lv2Link==='string'" class="header">{{lv2Link}}</div>
                        <div v-else class="item" :class="active===lv2Link[1]?'active':''" @click="route(lv2Link[1])">{{lv2Link[0]}}</div>
                    </template>
                </div>
            </div>

            <div class="ui pointing dropdown link item hidden-xs-only" v-for="lv3Menu in level3Menus">
                <i class="icon large blue" :class="lv3Menu.icon"></i>
                <span class="text">{{lv3Menu.title}}</span>
                <i class="dropdown icon"></i>
                <div class="menu">
                    <template v-for="lv3Link in lv3Menu.children">
                        <div v-if="typeof lv3Link==='string'" class="header">{{lv3Link}}</div>
                        <div v-else  class="item" @click="goURL(lv3Link[1])">{{lv3Link[0]}}</div>
                    </template>
                </div>
            </div>

            <div class="right menu">
                <a class="ui item" @click="openOperation">
                    <i class="windows large icon blue"></i>
                </a>
            </div>
              
            <el-drawer :visible.sync="showMenu" :append-to-body="true" direction="ltr" size="80%">
                <h3 slot="title" class="ui header d-flex justify-content-center align-items-center m-0">
                    <span><i class="ui icon html5 large blue"></i>导航菜单</span>
                </h3>
                
                <div class="ui selection list d-flex flex-row flex-wrap p-3">
                    <button @click="route(lv1Menu[1])" class="ui basic button d-flex justify-content-center align-items-center m-1" v-for="lv1Menu in level1Menus">
                        <i class="icon large" :class="lv1Menu[2]"></i>
                        {{lv1Menu[0]}}
                    </button>

                    <template v-for="lv2Menu in level2Menus">
                        <button @click="route(lv2Link[1])" class="ui basic button d-flex justify-content-center align-items-center m-1" v-for="lv2Link in lv2Menu.children">
                            <i class="icon large" :class="lv2Link[2]?lv2Link[2]:'html5'"></i>
                            {{lv2Link[0]}}
                        </button>
                    </template>

                </div>
            </el-drawer>

            <el-drawer :visible.sync="showOperation" :append-to-body="true" direction="rtl" size="80%">
                <h3 slot="title" class="ui header d-flex justify-content-center align-items-center m-0">
                    <span><i class="ui icon windows large blue"></i>快捷操作</span>
                </h3>
                <div class="ui selection list d-flex flex-row flex-wrap p-3">
                    <button class="ui basic button d-flex justify-content-center align-items-center m-1" v-for="operation in asyncOperations" @click="cpsOperations[operation[1]]()">
                            <i class="icon large" :class="operation[2]?operation[2]:'code'"></i>{{operation[0]}}
                    </button>
                </div>
            </el-drawer>
            
        </div>
        `,
    }

});
