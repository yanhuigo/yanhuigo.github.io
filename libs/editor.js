define(['vue', 'require', 'gitee', 'utils'], function (Vue, require, gitee, utils) {

    return {
        data() {
            return {
                selectedFile: "",
                fileList: [],
                showTree: true
            }
        },
        methods: {

            addFile() {
                utils.prompt('请输入文件路径', '新增文件', {
                    inputPattern: /^[\w/](.)+[a-z]+$/,
                    inputErrorMessage: '格式不正确'
                }).then(({value}) => {
                    gitee.newFile(value, "new File init").then(() => {
                        this.initSemantic(true);
                    })
                }).catch(() => {

                });
            },

            syncFiles() {
                utils.confirm('是否重新同步文件树?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    gitee.getFileTree(true).then(data => {
                        this.initSemantic(true);
                    });
                }).catch(() => {

                });
            },

            deleteFile() {
                if (this.selectedFile === "") {
                    utils.message.info("请选择文件");
                    return;
                }
                utils.confirm(`确认删除文件[${this.selectedFile}]?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    gitee.deleteFile(this.selectedFile).then(data => {
                        this.selectedFile = "";
                        this.initSemantic(true);
                    });
                }).catch(() => {

                });
            },

            loadFile(sync = false) {
                gitee.getFileContent(this.selectedFile, sync).then(data => {
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
                    if (sync) utils.notify(`已重新加载文件 ${this.selectedFile}`, "success");
                });
            },

            initMonacoEditor() {
                require(['vs/editor/editor.main'], () => {
                    editor = monaco.editor.create(document.getElementById('editor-container'), {
                        value: '点击左侧列表文件开始编辑...',
                        language: "markdown",
                        theme: "vs",
                        automaticLayout: true
                    });
                    this.initEditorActions();
                });
            },

            async initSemantic(sync = false) {
                let fileListOrigin = await gitee.getFileTree(sync);
                let fileList = [];
                let lastDir;
                for (let file of fileListOrigin) {
                    if (file.type === "tree") {
                        // 文件夹
                        if (lastDir && file.path.startsWith(lastDir.file.path)) {
                            // 子目录
                        } else {
                            lastDir = {file, children: []};
                            fileList.push(lastDir);
                        }
                    } else if (lastDir && file.path.indexOf(lastDir.file.path) !== -1) {
                        lastDir.children.push(file);
                    } else {
                        fileList.push({file});
                    }
                }

                let source = fileListOrigin.filter(file => file.type === "blob").map(file => ({title: file.path}));
                this.fileList = fileList;
                let app = this;
                $('#ed-file-search').search({
                    source,
                    minCharacters: 1,
                    selectFirstResult: true,
                    onSelect(result, response) {
                        app.selectFile(result.title);
                    }
                });
            },

            selectFile(file) {
                this.selectedFile = file;
                this.loadFile();
            },

            update() {
                if (this.selectedFile === "") {
                    utils.message.info("请选择编辑文件");
                    return;
                }
                let value = editor.getValue();
                gitee.getFileContent(this.selectedFile).then(data => {
                    if (data !== value) {
                        gitee.updateFile(this.selectedFile, value);
                    } else {
                        utils.message.info("文件内容未变化！");
                    }
                });


            },

            initEditorActions() {
                let actions = [
                    {
                        name: "保存文件",
                        group: "yh-file",
                        keys: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
                        call: () => {
                            this.update();
                        },
                    },
                    {
                        name: "清空文件树缓存", group: "yh-file", call: () => {
                            if (!confirm("确认清空文件树缓存？")) return;
                            common.initFileTree().then((data) => {
                                utils.message.success("清空文件树缓存完成！");
                            });
                        }
                    }
                ];

                let index = 0;
                for (let action of actions) {
                    editor.addAction({
                        id: `yh-editor-${++index}`,
                        label: action.name,
                        keybindings: action.keys ? action.keys : [],
                        precondition: null,
                        keybindingContext: null,
                        contextMenuGroupId: action.group ? action.group : 'yh-editor',
                        contextMenuOrder: 1.5 + index,
                        run: action.call
                    });
                }
            }

        },
        mounted() {
            this.initMonacoEditor();
            this.initSemantic();
        },
        template: `
            <div class="mt-header d-sm-flex ui h-100">
                <button v-if="!showTree" class="ui icon button green" title="显示文件树" style="height: 3rem"
                        @click="showTree=!showTree">
                    <i class="arrow right icon"></i>
                </button>
                <div class="ui vertical menu p-1 m-0 file-tree overflow-auto" style="min-width:240px;" v-show="showTree">
                    <div class="ui icon buttons ml-3 my-1">
                        <button class="ui button" data-tooltip="新增文件" data-position="bottom center" @click="addFile">
                            <i class="plus icon"></i>
                        </button>
                        <button class="ui button" data-tooltip="同步文件树" data-position="bottom center" @click="syncFiles">
                            <i class="sync alternate icon"></i>
                        </button>
                        <button v-show="showTree" class="ui button" data-tooltip="隐藏文件树" data-position="bottom center"
                                @click="showTree=!showTree">
                            <i class="arrow left icon"></i>
                        </button>
                    </div>
                    <div class="item ui search my-1" id="ed-file-search">
                        <div class="ui icon input search">
                            <input class="prompt" type="text" placeholder="Search Files..."/>
                            <i class="search icon"></i>
                        </div>
                        <div class="results"></div>
                    </div>
                    <div class="item" v-for="file in fileList">
                        <template v-if="file.children">
                            <div class="header">{{file.file.path}}</div>
                            <div class="menu" v-for="subFile in file.children"><a class="item"
                                                                                  @click="selectFile(subFile.path)"
                                                                                  :class="selectedFile===subFile.path ? 'active teal':''"><i
                                    class="icon git"></i>{{subFile.path.split(file.file.path + "/")[1]}} </a></div>
                        </template>
                        <div class="menu" v-else><a class="item" @click="selectFile(file.file.path)"
                                                    :class="selectedFile===file.file.path ? 'active teal':''">{{file.file.path}} </a>
                        </div>
                    </div>
                </div>
                <div class="flex-grow-1 d-md-flex flex-column">
                    <div class="flex-grow-1" id="editor-container"></div>
                    <div class="ui raised segment m-0">
                        <a class="ui ribbon label" :class="selectedFile ? 'green':''">编辑信息</a>
                        <span class="font-weight-bold" v-if="selectedFile">
                                正在编辑 <span class="ui label teal">{{selectedFile}}</span>
                            </span>
                        <span class="font-weight-bold" v-else>
                                请选择编辑文件！
                            </span>
                        <button v-if="selectedFile" class="ui compact primary icon button ml-1" data-tooltip="保存文件(Ctrl+s)"
                                data-position="top center" @click="update"><i
                                class="save alternate outline icon"></i></button>
                        <button v-if="selectedFile" class="ui compact primary icon button ml-1" data-tooltip="刷新文件"
                                data-position="top center" @click="loadFile(true)"><i
                                class="sync alternate icon"></i></button>
                        <button v-if="selectedFile"
                                class="ui compact negative icon button ml-1" data-tooltip="删除文件" data-position="top center"
                                @click="deleteFile"><i class="trash alternate outline icon"></i></button>
                    </div>
                </div>
                <!--<div class="w-25">
                    预览区域
                </div>-->
            </div>
        `,
    }

});
