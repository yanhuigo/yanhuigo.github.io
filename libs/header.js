define(["vue", 'jquery', 'semantic'], function (Vue, $) {

    const menus = [
        {title: "Home", url: "home", icon: "home"},
        {title: "Bookmarks", url: "bookmarks", icon: "bookmark outline"},
        {title: "Files", url: "files", icon: "file alternate outline"},
        {title: "MdEditor", url: "mdEditor", icon: "edit outline alternate outline"},
    ];

    Vue.component("app-header-item", {
        props: ['data', 'root'],
        components: {},

        template: `
            <div :class="data.children?'ui pointing dropdown link item':'item'">
                
                <template v-if="!data.children">
                    <a v-if="root" class="text">{{data.title}}</a>
                    <div v-else class="text">{{data.title}}</div>
                </template>
                
                <template v-else >
                    <span class="text">{{data.title}}</span>
                    <i class="dropdown icon"></i>
                    <div class="menu">
                        <app-header-item v-for="(subData,index) in data.children" :key="index" :data="subData" :root="false"></app-header-item>
                    </div>
                </template>
                
            </div>
        `
    });

    return {
        data() {
            return {
                menus: []
            }
        },
        methods: {},
        mounted() {
            $('.ui.dropdown').dropdown();
        },
        template: `
            <div class="ui menu positive">
            
              <div class="header item">
                <img class="ui avatar image" src="/cdn/logo.jpg" />
                <span>Wyd</span>
              </div>
              
              <a class="item active"><i class="terminal icon"></i>编辑器</a>
                            
              <div class="ui pointing dropdown link item">
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
                      <div class="item">衬衫</div>
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
              </div>
              
            </div>
        `,
    }

});
