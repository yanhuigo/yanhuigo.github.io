define(['vue', 'require', 'gitee', 'utils', 'jquery', 'semantic'], function (Vue, require, gitee, utils) {

    return {
        data() {
            return {
                selectedFile: "",
                fileList: [],
                showTree: true,
                showIframe: true,
                renderFileContent: "<h2>Hello</h2>",
                repo: gitee.getRepo()
            }
        },
        methods: {
            setRepo(repo) {
                this.repo = repo;
                if (repo !== gitee.getRepo()) {
                    this.selectedFile = "";
                    editor.setValue("");
                    gitee.setRepo(repo);
                    this.initSemantic(false);
                }
            },
            closeIframe() {
                this.showIframe = false;
            },

            previewInIframe() {
                $("#ed-iframe-modal").modal("show");
                let value = editor.getValue();
                this.renderFileContent = value;
                this.showIframe = true;
            },

            runJs() {
                let selectionTxt = editor.getModel().getValueInRange(editor.getSelection());
                window.eval(selectionTxt);
            },

            addFile() {
                utils.prompt('请输入文件路径', '新增文件', {
                    inputPattern: /^[\w/](.)+[a-z]+$/,
                    inputErrorMessage: '格式不正确'
                }).then(({value}) => {
                    gitee.newFile(value, "new File init", this.repo).then(() => {
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
                    gitee.getFileTree(true, this.repo).then(data => {
                        utils.notify("同步文件树完成！")
                        this.initSemantic(true);
                    });
                }).catch(() => {

                });
            },

            deleteFile() {
                if (this.selectedFile === "") {
                    utils.message("请选择文件", "info");
                    return;
                }
                utils.confirm(`确认删除文件[${this.selectedFile}]?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    gitee.deleteFile(this.selectedFile, this.repo).then(data => {
                        editor.setValue("");
                        this.selectedFile = "";
                        this.initSemantic(true);
                    });
                }).catch(() => {

                });
            },

            loadFile(sync = false) {
                gitee.getFileContent(this.selectedFile, sync, false, this.repo).then(data => {
                    let suffix = this.selectedFile.substr(this.selectedFile.lastIndexOf(".") + 1);
                    switch (suffix) {
                        case "md":
                            suffix = "markdown";
                            break;
                        case "js":
                            suffix = "javascript";
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
                let fileListOrigin = await gitee.getFileTree(sync, this.repo);
                let fileList = [];
                let lastDir;
                for (let file of fileListOrigin) {
                    if (file.type === "tree") {
                        // 文件夹
                        if (lastDir && file.path.startsWith(lastDir.file.path + "/")) {
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
                    utils.message("请选择编辑文件", "info");
                    return;
                }
                let value = editor.getValue();
                gitee.getFileContent(this.selectedFile, false, false, this.repo).then(data => {
                    if (data !== value) {
                        gitee.updateFile(this.selectedFile, value, this.repo);
                    } else {
                        utils.message("文件内容未变化！", "info");
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
                                utils.message("清空文件树缓存完成！");
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
            <div class="mt-header d-sm-flex ui segment m-2" wydFlag="editor" style="height: 90vh">
                
                <button v-if="!showTree" class="ui icon button green" title="显示文件树" style="height: 3rem"
                        @click="showTree=!showTree">
                    <i class="arrow right icon"></i>
                </button>
                
                <div class="ui vertical menu p-1 m-0 file-tree overflow-auto w-100-xs-only" style="min-width:240px;" v-show="showTree">
                    <div class="d-flex justify-content-start flex-wrap wyd-editor-operations">
                        <div class="ui buttons w-100">
                              <button @click="setRepo('webdata')" class="ui button" :class="repo==='webdata'?'active teal':''"><i class="heart icon"></i>webData</button>
                              <div class="or"></div>
                              <button @click="setRepo('webme')" class="ui button" :class="repo==='webme'?'active red':''"><i class="user secret icon"></i>webMe</button>
                        </div>
                        <el-tooltip content="新增文件" placement="bottom">
                            <button class="ui compact icon button small" @click="addFile">
                                <i class="plus icon"></i>
                            </button>
                        </el-tooltip>
                        <el-tooltip content="同步文件树" placement="bottom">
                            <button class="ui compact icon button" @click="syncFiles">
                                <i class="sync alternate icon"></i>
                            </button>
                        </el-tooltip>
                        <el-tooltip content="隐藏文件树" placement="bottom">
                            <button v-show="showTree" class="ui compact icon button" @click="showTree=!showTree">
                                <i class="arrow left icon"></i>
                            </button>
                        </el-tooltip>
                        <template v-if="selectedFile" >
                            <el-tooltip content="保存文件(Ctrl+s)" placement="bottom">
                                <button class="ui compact icon teal button" @click="update">
                                    <i class="save alternate outline icon"></i>
                                </button>
                            </el-tooltip>
                            <el-tooltip content="同步文件" placement="bottom">
                                <button class="ui compact icon teal button ml-1" @click="loadFile(true)">
                                    <i class="cloud download icon"></i>
                                </button>
                            </el-tooltip>
                            <el-tooltip content="删除文件" placement="bottom">
                                <button class="ui compact teal icon button ml-1" @click="deleteFile">
                                    <i class="trash alternate outline icon"></i>
                                </button>
                            </el-tooltip>
                            <el-tooltip content="在iframe中预览" placement="bottom">
                                <button v-if="selectedFile.endsWith('.html')||selectedFile.endsWith('.js')" class="ui compact icon green button" @click="previewInIframe">
                                    <i class="html5 icon"></i>
                                </button>
                            </el-tooltip>
                            <el-tooltip content="运行选中的js" placement="bottom">
                                <button v-if="selectedFile.endsWith('.js')" class="ui compact icon green button" @click="runJs">
                                    <i class="node js icon"></i>
                                </button>
                            </el-tooltip>
                        </template>
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
                            <div class="menu" v-for="subFile in file.children">
                                <a class="item" @click="selectFile(subFile.path)" :class="selectedFile===subFile.path ? 'active teal':''">
                                    <i class="icon git"></i>
                                    {{subFile.path.split(file.file.path + "/")[1]}} 
                                </a>
                            </div>
                        </template>
                        <div class="menu" v-else>
                            <a class="item" @click="selectFile(file.file.path)" :class="selectedFile===file.file.path ? 'active teal':''">
                                {{file.file.path}} 
                            </a>
                        </div>
                    </div>
                </div>
                
                <div class="flex-grow-1 d-md-flex flex-column w-100-xs-only">
                    <div class="flex-grow-1 vh-50-xs-only" id="editor-container"></div>
                    <div class="ui raised segment m-0">
                        <a class="ui ribbon label" :class="selectedFile ? 'green':''">编辑信息</a>
                        <span class="font-weight-bold" v-if="selectedFile">
                                正在编辑 <span class="ui label">{{selectedFile}}</span>
                            </span>
                        <span class="font-weight-bold" v-else>
                                请选择编辑文件！
                        </span>
                        
                        </button>
                    </div>
                </div>
                <!--<div class="w-25">
                    预览区域
                </div>-->
                
                <div id="ed-iframe-modal" class="ui modal large">
                  <div class="header">{{selectedFile}}</div>
                  <div class="content p-0">
                    <iframe class="border-0" :srcdoc="renderFileContent" width="100%" height="600px"></iframe>
                  </div>
                  <div class="actions">
                    <div class="ui cancel button">取消</div>
                  </div>
                </div>
                    
            </div>
        `,
    }

});
