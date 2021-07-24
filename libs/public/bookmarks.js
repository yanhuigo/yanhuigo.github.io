define(['utils', 'gitee'], function (utils, gitee) {

    return {
        data() {
            return {
                searchTxt: "",
                links: [],
                cache: true,
                headerLinks: []
            }
        },
        methods: {
            open(link) {
                this.searchTxt = "";
                this.links = originLinks;
                window.open(link.url);
            },
            filter() {
                if (!this.searchTxt) this.links = originLinks;
                let txt = this.searchTxt.toUpperCase();
                this.links = originLinks.filter(link => link.title.toUpperCase().indexOf(txt) !== -1 || link.note.toUpperCase().indexOf(txt) !== -1)
            },
            loadData() {
                gitee.getFileContent("data/pages.link.json", false, true).then(data => {
                    let links = data.map(link => ({ title: link[0], url: link[1], note: link[2] }));
                    originLinks = links;
                    this.links = originLinks;
                });
            },
            refreshCache() {
                if (confirm("确认重新加载数据?")) {
                    this.cache = false;
                    this.loadData();
                    this.cache = true;
                }

            }
        },
        mounted() {
            this.loadData();
        },
        template: `
        <div class="container mt-4">
            <div class="row justify-content-center">
                <div class="card m-1 yh-pointer col-md-4 col-lg-3" v-for="link in links" @click="open(link)">
                    <div class="card-body">
                        <h4 class="card-title">{{link.title}}</h4>
                        <p class="card-text d-inline text-nowrap">{{link.note}}</p>
                    </div>
                </div>
            </div>
        </div>
        `,
    }

});
