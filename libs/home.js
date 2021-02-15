define(['vue', 'require', 'gitee', 'utils', "markdownIt"], function (Vue, require, gitee, utils, markdownIt) {

    const md = markdownIt();

    return {
        data() {
            return {
                cfg: {},
                mdContent: ""
            }
        },
        watch: {},
        methods: {},
        mounted() {
            gitee.getFileContent("config/wyd2021.json", false, true).then(data => {
                this.cfg = data.home;
            });

            gitee.getFileContent("md/home.md").then(content => {
                this.mdContent = md.render(content);
            })

        },
        template: `
        <div class="wyd-home d-flex flex-column">
            <div class="ui inverted vertical segment flex-grow-1 wyd-home-content">
                <div class="ui text container mt-5">
                    <div v-html="mdContent"></div>
                </div>
            </div>
            
            <div class="ui inverted vertical footer segment wyd-border-top">
                <div class="ui container">
                    <div class="ui stackable inverted divided equal height stackable grid">
                        <div class="eight wide column" v-if="cfg.innerLinks">
                            <h4 class="ui inverted header">站内导航</h4>
                            <div class="ui inverted link list d-flex flex-row justify-content-start align-items-center flex-wrap">
                                <div v-for="link in cfg.innerLinks">
                                    <a :href="link[0]" target="_blank" class="item mr-3">{{link[1]}}</a>
                                </div>
                            </div>
                        </div>
                        <div class="eight wide column" v-if="cfg.outLinks">
                            <h4 class="ui inverted header">收藏站点</h4>
                            <div class="ui inverted link list">
                                <a v-for="link in cfg.outLinks" :href="link[0]" target="_blank" class="item">{{link[1]}}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `
    }

});
