initApp().then(() => {
    let editor;
    require.config({paths: {vs: '../cdn/monaco-editor/min/vs'}});
    let themeIsDark = false;
    let tip = common.tip;

    let app = new Vue({
        el: "#root",
        data() {
            return {
                selectedFile: "",
                fileList: [],
                inputTxt: "",
                editor: null,
                showIframe: false,
                renderFileContent: "<h2>Hello</h2>",
                actions: []
            }
        },
        methods: {
            initActions() {
                this.actions.push(
                    {
                        title: "Actions", children: [
                            {
                                title: "在iframe中预览",
                                call: () => {
                                    let value = editor.getValue();
                                    app.renderFileContent = value;
                                    app.showIframe = true;
                                },
                            },
                            {
                                title: "js eval", call: () => {
                                    let selectionTxt = editor.getModel().getValueInRange(editor.getSelection());
                                    window.eval(selectionTxt);
                                }
                            },
                            {
                                title: "切换主题", call: () => {
                                    editor.updateOptions({theme: themeIsDark ? "vs" : "vs-dark"});
                                    themeIsDark = !themeIsDark;
                                }
                            }, {
                                title: "保存文件", call: () => {
                                    app.update();
                                },
                            },
                            {
                                title: "同步文件", call: () => {
                                    app.loadFile(true);
                                }
                            },
                            {
                                title: "同步文件树", call: () => {
                                    if (!confirm("确认清空文件树缓存？")) return;
                                    common.initFileTree().then((data) => {
                                        app.initFileList(data);
                                        app.loadFile();
                                    });
                                }
                            }
                        ]
                    }
                );
            },
            initFileList(data) {
                this.fileList = [];
                let fileActions = []
                for (let key in data) {
                    this.fileList.push(key);
                    fileActions.push({title: key, call: this.fileClickCall.bind(this, key)});
                }
                this.actions = [];
                this.initActions();
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
                    let suffix = this.selectedFile.substr(this.selectedFile.lastIndexOf(".") + 1);
                    switch (suffix) {
                        case "md":
                            suffix = "markdown";
                            break;
                        default:
                            break;
                    }
                    monaco.editor.setModelLanguage(editor.getModel(), suffix);
                    editor.setValue(data);
                    if (sync) tip("文件加载完成!", `已重新加载文件 => ${this.selectedFile}`);
                });
            },
            update() {
                if (this.selectedFile === "") {
                    tip("请选择编辑文件");
                    return;
                }
                let value = editor.getValue();
                common.updateFile(this.selectedFile, value);
            },
            closeIframe() {
                this.showIframe = false;
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
            initEditor();
            this.listenEvent();
            //this.actions.push({ "title": "测试" })

        }
    });

    function actionInit() {

        /* let actions = [
            {
                name: "在iframe中预览",
                keys: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_P],
                group: "yh-util",
                call: () => {
                    let value = editor.getValue();
                    app.renderFileContent = value;
                    app.showIframe = true;
                },
            },
            {
                name: "js eval", group: "yh-util", call: () => {
                    let selectionTxt = editor.getModel().getValueInRange(editor.getSelection());
                    window.eval(selectionTxt);
                }
            },
            {
                name: "切换主题", group: "yh-util", call: () => {
                    editor.updateOptions({ theme: themeIsDark ? "vs" : "vs-dark" });
                    themeIsDark = !themeIsDark;
                }
            }, {
                name: "保存文件", group: "yh-file", keys: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S], call: () => {
                    app.update();
                },
            },
            {
                name: "重新加载文件", group: "yh-file", call: () => {
                    app.loadFile(true);
                }
            },
            {
                name: "清空文件树缓存", group: "yh-file", call: () => {
                    if (!confirm("确认清空文件树缓存？")) return;
                    common.initFileTree().then((data) => {
                        app.initFileList(data);
                        app.loadFile();
                    });
                }
            }
        ];

        let index = 0;
        for (let action of actions) {
            editor.addAction({
                id: `yh-editor-${++index}`,
                label: action.name,
                // ctrl+p触发
                // monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_P,
                // 按住ctrl 再分别按下 k m 后触发
                // monaco.KeyMod.chord(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_K, monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_M)
                keybindings: action.keys ? action.keys : [],
                precondition: null,
                keybindingContext: null,
                contextMenuGroupId: action.group ? action.group : 'yh-editor',
                contextMenuOrder: 1.5 + index,
                run: action.call
            });
        } */

    }

    function initEditor() {
        require(['vs/editor/editor.main'], function () {
            editor = monaco.editor.create(document.getElementById('container'), {
                value: '',
                language: "markdown",
                theme: "vs",
                automaticLayout: true
            });
            actionInit();
        });
    }
});
