define([], function () {

    return {
        data() {
            return {
                lsKeyList: []
            }
        },
        methods: {
            initLsKey() {
                for (let key in localStorage) {
                    if (localStorage.hasOwnProperty(key)) {
                        this.lsKeyList.push(key);
                        this.lsKeyList.sort();
                    }
                }
            },
            clearStorage() {
                if (!confirm("确认清空缓存？")) return;
                for (let key in localStorage) {
                    if (localStorage.hasOwnProperty(key)) {
                        if (key && key !== "login-state") {
                            localStorage.removeItem(key);
                        }
                    }
                }
                this.refresh();
            },
            refresh() {
                this.lsKeyList = [];
                this.initLsKey();
            }
        },
        mounted() {
            $('div[flag="storageView"]').accordion({
                exclusive: false,
                onOpening() {
                    let oldVal = $(this).find("textarea").val();
                    if (!oldVal) {
                        let content = localStorage.getItem($(this).attr("lsKey"));
                        try {
                            let data = JSON.parse(content);
                            $(this).find("textarea").val(JSON.stringify(data, null, 4));
                        } catch (e) {
                            $(this).find("textarea").val(content);
                        }
                    }
                }
            });
            this.initLsKey();
        },
        template: `
        <div class="ui container mt-5 d-flex flex-column segment">
            <div class="mb-3">
                <button class="ui button" @click="refresh">
                    <i class="refresh icon"></i>刷新缓存
                </button>
                <button class="ui button" @click="clearStorage">
                    <i class="download icon"></i>清空缓存
                </button>
                <button class="ui button disabled">
                    <i class="download icon"></i>下载缓存
                </button>
            </div>
            <div flag="storageView" class="ui styled accordion w-100">
                <template v-for="lsKey in lsKeyList">
                  <div class="title">
                    <i class="dropdown icon"></i>
                    {{lsKey}}
                  </div>
                  <div class="content ui from" :lsKey="lsKey">
                    <div class="transition hidden ui form">
                        <div class="field">
                            <textarea readonly></textarea>
                        </div>
                    </div>
                  </div>
                </template>
            </div>
        </div>
        `,
    }

});
