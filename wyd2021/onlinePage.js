define(['jquery', 'semantic', 'utils', 'gitee'], function ($, semantic, utils, gitee) {

    return {
        data() {
            return {
            }
        },
        methods: {

        },
        watch:{
            $route(a,b){
                console.log("route change",a,b)
            }
        },
        mounted() {
            console.log(this.$route);
        },
        template: `
            <div id="app-onlinePage" wydFlag="onlinePage">
                onlinePage
            </div>
        `,
    }

});
