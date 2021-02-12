define(['jquery', 'semantic', 'utils', 'gitee'], function ($, semantic, utils, gitee) {

    return {
        data() {
            return {
                active: "bookmarks",
                level1Menus: [],
                level2Menus: [],
            }
        },
        watch: {
            $route(newVal, oldVal) {
                this.active = newVal.path.substr(1);
            }
        },
        methods: {
            route(name) {
                if (name === this.active) return;
                this.$router.push(name);
                this.active = name;
            },
            toggleLeftMenu() {
                $("#app-leftMenu").sidebar('toggle');
            },
            loadLevelMenu() {
                gitee.getFileContent("config/wyd2021.json", false, true).then(data => {
                    this.level1Menus = data.level1Menus;
                    this.level2Menus = data.level2Menus;
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
            }
        },
        mounted() {
            this.loadLevelMenu();
        },
        template: `
            <div class="ui menu positive" wydFlag="header">
            
              <div class="header item link" @click="toggleLeftMenu">
                <img class="ui avatar image" src="/cdn/logo.jpg" />
                <a class="text-dark font-weight-bold">Wyd2021</a>
              </div>
              
              <a class="item hidden-xs-only" :class="active===lv1Menu[1]?'active':''" v-for="lv1Menu in level1Menus" @click="route(lv1Menu[1])"><i :class="lv1Menu[2]"></i>{{lv1Menu[0]}}</a>
               
              <div flag="lv2MenuList" class="ui pointing dropdown link item" v-for="lv2Menu in level2Menus">
                <i class="icon" :class="lv2Menu.icon"></i>
                <span class="text">{{lv2Menu.title}}</span>
                <i class="dropdown icon"></i>
                <div class="menu">
                    <template v-for="lv2Link in lv2Menu.children">
                        <div v-if="typeof lv2Link==='string'" class="header">{{lv2Link}}</div>
                        <div v-else  class="item" @click="goURL(lv2Link[1])">{{lv2Link[0]}}</div>
                    </template>
                </div>
              </div>
              
              
            </div>
        `,
    }

});
