initApp().then(() => {
    let tip = common.tip;
    let app = new Vue({
        el: "#root",
        data() {
            return {
                selectedFile: "test/test.md",
                fileList: [],
                editor: null,
                actions: {
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
            }
        },
        methods: {
            initFileList() {
                for (let key in common.fileTree) {
                    if (key && key.endsWith(".md")) {
                        this.fileList.push(key);
                    }
                }
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
                confirm("确认同步文件树？") && common.initFileTree().then(() => {
                    tip("同步文件树完成！");
                    this.fileList = [];
                    this.initFileList();
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
            this.initFileList();
            this.editor = editormd("test-editor", {
                mode: "gfm",
                width: "98%",
                autoHeight: true,
                path: "../cdn/editormd/lib/",
                watch: true,
                tocm: true,
                taskList: true,
                emoji: true,
                tex: true,
                flowChart: true,
                sequenceDiagram: true,
                onload: () => {
                    this.loadFile();
                },
            });
            this.listenEvent();
        }
    });
})