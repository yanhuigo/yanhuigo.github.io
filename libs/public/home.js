define(['gitee', '/cdn/markdown-it.min.js'], function (gitee, MarkdownIt) {
    let md = new MarkdownIt({
        html: true
    });
    return {
        data() {
            return {
                home: "",
            }
        },
        mounted() {
            gitee.getFileContent("md/public.home.md").then(data => {
                this.home = md.render(data);
            })
        },
        template: document.querySelector("#layout #home")
    }

});
