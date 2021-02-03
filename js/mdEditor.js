initApp().then(() => {
    let tip = common.tip;
    let app = new Vue({
        el: "#root",
        data() {
            return {
                selectedFile: "",
                fileList: [],
                editor: null,
                actions: []
            }
        },
        methods: {
            initActions() {
                this.actions.push({
                        title: "Actions", children: [
                            {
                                title: "更新文件", call: () => {
                                    this.update();
                                }
                            },
                            {
                                title: "同步文件", call: () => {
                                    this.syncFile();
                                }
                            },
                            {
                                title: "同步文件树", call: () => {
                                    this.syncFileTree();
                                }
                            }
                        ]
                    }
                )
            },
            initFileList(fileList) {
                let fileActions = []
                for (let key in fileList) {
                    if (key && key.endsWith(".md")) {
                        this.fileList.push(key);
                        fileActions.push({title: key, call: this.fileClickCall.bind(this, key)});
                    }
                }
                this.actions.push({
                    title: "Files", children: fileActions
                });
            },
            fileClickCall(key) {
                this.selectedFile = key;
                this.$nextTick(() => {
                    this.loadFile();
                })
            },
            loadFile(sync = false) {
                common.getContent(this.selectedFile, sync).then(data => {
                    this.editor.setValue(data);
                    if (sync) tip("文件加载完成!", `已重新加载文件 => ${this.selectedFile}`);
                });
            },
            update() {
                if (this.selectedFile === "") {
                    tip("请选选择文件！");
                    return;
                }
                let value = this.editor.getValue();
                common.updateFile(this.selectedFile, value);
            },
            syncFile() {
                if (this.selectedFile === "") {
                    tip("请选选择文件！");
                    return;
                }
                this.loadFile(true);
            },
            syncFileTree() {
                confirm("确认同步文件树？") && common.initFileTree().then((data) => {
                    tip("同步文件树完成！");
                    this.actions = [];
                    this.initActions()
                    this.fileList = [];
                    this.initFileList(data);
                });
            },
            listenEvent() {
                $(window).keydown(function (event) {
                    if (event.keyCode === 83 && event.ctrlKey) {
                        app.update();
                        event.preventDefault();
                    }
                });
            }
        },
        mounted() {
            this.initActions();
            this.initFileList(common.fileTree);
            this.editor = editormd("test-editor", {
                mode: "gfm",
                width: "98%",
                autoHeight: true,
                path: "../cdn/editormd/lib/",
                watch: false,
                tocm: true,
                taskList: true,
                emoji: true,
                tex: true,
                flowChart: true,
                sequenceDiagram: true,
                toolbarIcons: [
                    "undo", "redo", "|",
                    "bold", "del", "italic", "quote", "uppercase", "lowercase", "|",
                    "h1", "h2", "h3", "h4", "h5", "h6", "|",
                    "list-ul", "list-ol", "hr", "|",
                    "watch", "fullscreen"
                ],
                onload: () => {
                    this.loadFile();
                },
            });
            this.listenEvent();
        }
    });
})
