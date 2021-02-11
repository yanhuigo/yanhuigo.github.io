define(['jquery', 'semantic', 'utils', 'gitee'], function ($, semantic, utils, gitee) {

    return {
        data() {
            return {
                active: "bookmarks",
                level1Menus: [],
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
                });
            }
        },
        mounted() {
            this.loadLevelMenu();
            this.active = location.hash.substr(2);
            let app = this;
            $('#app-online-page-menu').dropdown({
                on: 'hover',
                action: function (text, value) {
                    $(this).dropdown('hide');
                    app.route("onlinePage");
                }
            });
        },
        template: `
            <div class="ui menu positive" wydFlag="header">
            
              <div class="header item link" @click="toggleLeftMenu">
                <img class="ui avatar image" src="/cdn/logo.jpg" />
                <a class="text-dark font-weight-bold">Wyd2021</a>
              </div>
              
              <a class="item" :class="active===lv1Menu[1]?'active':''" v-for="lv1Menu in level1Menus" @click="route(lv1Menu[1])"><i :class="lv1Menu[2]"></i>{{lv1Menu[0]}}</a>
               
              <!--<div id="app-online-page-menu" class="ui pointing dropdown link item">
                <i class="smile outline icon" :class="active==='onlinePage'?'font-weight-bold':''"></i>
                <span class="text" :class="active==='onlinePage'?'font-weight-bold':''">在线页面</span>
                <i class="dropdown icon"></i>
                <div class="menu">
                    <div class="item">test page</div>
                </div>
              </div>-->
              
              <!--<div class="ui pointing dropdown link item">
                <i class="smile outline icon"></i>
                <span class="text">导航</span>
                <i class="dropdown icon"></i>
                <div class="menu">
                  <div class="header">分类</div>
                  <div class="item">
                    <i class="dropdown icon"></i>
                    <span class="text">衣服</span>
                    <div class="menu">
                      <div class="header">男装</div>
                      <div class="item active">衬衫</div>
                      <div class="item">裤子</div>
                      <div class="item">牛仔裤</div>
                      <div class="item">鞋</div>
                      <div class="divider"></div>
                      <div class="header">女装</div>
                      <div class="item">礼服</div>
                      <div class="item">鞋</div>
                      <div class="item">包包</div>
                    </div>
                  </div>
                </div>
              </div>-->
              
            </div>
        `,
    }

});
