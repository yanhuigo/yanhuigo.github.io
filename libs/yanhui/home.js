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
            <div class="ui vertical flex-grow-1 wyd-home-content">
                <div class="ui text container mt-5">
                    <div v-html="mdContent"></div>
                </div>
            </div>
        </div>
        `
    }

});
