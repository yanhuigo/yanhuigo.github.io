define(['axios', 'base64', 'utils', 'sysLog'], function (axios, base64, utils, sysLog) {

    const pubRepo = "webdata";//公开仓库
    const meRepo = "webme";//隐私仓库

    const storageKey = {
        lsRepo: "gitee-repo",
        lsLoginState: "wyd-login-state",//登录状态
        lsFileTree: "file-Tree",//文件树
    };

    let lsRepo = localStorage.getItem(storageKey.lsRepo);

    let apiConfig = {
        client_id: "f5250ed1c6f0a51423ca06aa4faf5c10d64ce8b411c425256d22fec16a531665",
        client_secret: "00a0f31357ce04fe3619eab7149d7c1b4daade23677a898b8f14bb647bc25fb3",
        reposUrlPrefix: `https://gitee.com/api/v5/repos/yanhui1993`,
        repo: lsRepo ? lsRepo : pubRepo,
    };

    let wydConfig = {};

    let state = {
        // 登录状态
        loginState: {},
        // 文件路径-sha
        fileShaMap: new Map()
    }

    let access_token;

    /**
     * 获取文件树
     * @param refresh 是否刷新
     * @param repo
     * @returns {Promise<unknown>}
     */
    async function getFileTree(refresh = false, repo = pubRepo) {
        return new Promise((resolve, reject) => {
            let cache = getLocalData(storageKey.lsFileTree, true, repo);
            if (cache && !refresh) {
                resolve(cache);
                return;
            }
            // 获取项目下的文件树
            axios.get(`${apiConfig.reposUrlPrefix}/${repo}/git/trees/master?${access_token ? 'access_token=' + access_token : ''}&recursive=1`).then(data => {
                saveLocalData(storageKey.lsFileTree, data.tree, repo);
                fileShaMapInit(false, repo)
                resolve(data.tree);
                sysLog.addLog(`[${repo}]获取仓库文件树`);
            }).catch(err => {
                reject(err);
            });

        });
    }

    /**
     * 获取文件内容
     * @param filePath 文件路径
     * @param refresh 是否刷新
     * @param parseJson 是否转json
     * @param repo 仓库
     * @returns {Promise<null|*>}
     */
    async function getFileContent(filePath, refresh = false, parseJson = false, repo = pubRepo) {
        let cacheKey = `@${filePath}`;
        let cache;
        let localMdfCache = getLocalData(cacheKey, false, repo);
        cache = localMdfCache ? localMdfCache : getLocalData(filePath, false, repo);
        if (!refresh && cache) {
            if (parseJson) {
                return JSON.parse(cache);
            } else {
                return cache;
            }
        }
        let data = await axios.get(`${apiConfig.reposUrlPrefix}/${repo}/contents/${filePath}?${access_token ? 'access_token=' + access_token : ''}`);
        if (!data.content) {
            utils.message(`获取文件内容失败! [${filePath}]`, "error");
            return null;
        }
        let content = base64.decode(data.content);
        delLocalData(cacheKey, repo);
        saveLocalData(filePath, content, repo);
        sysLog.addLog(`[${repo}]下载文件 ${filePath}`);
        if (parseJson) {
            return JSON.parse(content);
        }
        return content;
    }

    /**
     * 新增文件
     * @param filePath 文件路径
     * @param content 文件内容
     * @param repo
     * @returns {Promise<unknown>}
     */
    async function newFile(filePath, content, repo = pubRepo) {
        if (!filePath || !content) {
            return null;
        }
        let data = base64.encode(content);
        return new Promise((resolve) => {
            axios.post(`${apiConfig.reposUrlPrefix}/${repo}/contents/${filePath}`, {
                access_token,
                content: data,
                message: `open api new ${window.location.pathname}`
            }).then(async (data) => {
                utils.notify("新增成功！", "success");
                await fileShaMapInit(true, repo);
                resolve(data);
                sysLog.addLog(`[${repo}]新增文件 ${filePath}`);
            }).catch((err) => {
                console.error(err);
                utils.notify("新增异常！", "error");
            })
        })

    }

    /**
     * 更新文件
     * @param filePath 文件路径
     * @param content 文件内容
     * @param repo
     * @returns {Promise<void>}
     */
    async function updateFile(filePath, content, repo = pubRepo, refreshFileTree = true) {
        let sha = state.fileShaMap.get(`${repo}#${filePath}`);
        if (!sha) {
            utils.notify(`未匹配文件 ${repo}#${filePath}`, 'warning');
            return null;
        }
        let data = base64.encode(content);
        return new Promise((resolve) => {
            axios.put(`${apiConfig.reposUrlPrefix}/${repo}/contents/${filePath}`, {
                access_token,
                content: data,
                sha,
                message: `open api update ${window.location.pathname}`
            }).then(async () => {
                utils.notify(`上传[${filePath}]成功！`, "success");
                delLocalData(filePath, repo);
                saveLocalData(filePath, base64.decode(data), repo);
                if (refreshFileTree) await fileShaMapInit(true, repo);
                resolve();
                sysLog.addLog(`[${repo}]上传文件 ${filePath}`);
            }).catch((err) => {
                console.error(err);
                utils.notify("上传异常！", "error");
            })
        })
    }

    /**
     * 更新文件本地缓存
     * @param filePath
     * @param content
     * @param repo
     * @returns {null}
     */
    function updateFileCache(filePath, content, repo = pubRepo) {
        let sha = state.fileShaMap.get(`${repo}#${filePath}`);
        if (!sha) {
            utils.notify(`未匹配文件 ${repo}#${filePath}`, 'warning');
            return null;
        }
        saveLocalData(`@${filePath}`, content, repo);
        utils.notify(`更新[${filePath}]成功！`, "success");
    }

    /**
     * 删除文件
     * @param filePath 文件路径
     * @param repo 仓库
     * @returns {Promise<unknown>}
     */
    async function deleteFile(filePath, repo = pubRepo) {
        let sha = state.fileShaMap.get(`${repo}#${filePath}`);
        if (!sha) {
            utils.notify(`未匹配文件 ${repo}#${filePath}`, 'warning');
            return null;
        }
        return new Promise((resolve) => {
            axios.delete(`${apiConfig.reposUrlPrefix}/${repo}/contents/${filePath}`, {
                params: {
                    access_token,
                    sha,
                    message: `open api delete ${window.location.pathname}`
                }
            }).then(async () => {
                utils.notify(`删除[${filePath}]成功！`, "success");
                delLocalData(filePath, repo);
                await fileShaMapInit(true, repo);
                resolve();
                sysLog.addLog(`[${repo}]删除文件 ${filePath}`);
            }).catch((err) => {
                console.error(err);
                utils.notify("删除异常！", "error");
            })
        })

    }

    /**
     * 保存数据到本地
     * @param key
     * @param data
     * @param repo
     */
    function saveLocalData(key, data, repo = pubRepo) {
        if (typeof data === 'object') {
            localStorage.setItem(`${repo}#${key}`, JSON.stringify(data));
        } else {
            localStorage.setItem(`${repo}#${key}`, data);
        }

    }

    /**
     * 获取本地数据
     * @param key
     * @param isObject
     * @param repo
     * @returns {string|null}
     */
    function getLocalData(key, isObject = true, repo = pubRepo) {
        let storage = localStorage.getItem(`${repo}#${key}`);
        if (storage) {
            return isObject ? JSON.parse(storage) : storage;
        }
        return null;
    }

    /**
     * 删除本地数据
     * @param key
     * @param repo
     */
    function delLocalData(key, repo = pubRepo) {
        localStorage.removeItem(`${repo}#${key}`);
        localStorage.removeItem(`${repo}#@${key}`);
    }

    /**
     * 初始化本地localStorage
     */
    async function initState() {

        return new Promise(async (resolve, reject) => {

            loginStateInit();

            // 提前初始化配置
            getFileContent("config/wyd2021.json", false, true).then(data => {
                wydConfig = data;
            }).catch(e => {
                console.log("加载配置异常");
            });

            fileShaMapInit(false, apiConfig.repo).then(() => {
                console.log("数据初始化完成！");
                resolve();
            }).catch(err => {
                console.warn("数据初始化异常！", err)
                utils.goLogin();
                resolve();
            });


        });
    }

    // 登录状态
    function loginStateInit() {
        let loginStorageData = localStorage.getItem(storageKey.lsLoginState);
        if (!loginStorageData) {
            // goLogin();
            return;
        }
        state.loginState = JSON.parse(loginStorageData);
        access_token = state.loginState['access_token'];
    }

    // 文件路径-sha
    async function fileShaMapInit(refresh = false, repo) {
        return new Promise((resolve, reject) => {
            if (!repo) {
                console.warn("仓库不能为空")
                return null;
            }
            getFileTree(refresh, repo).then((fileData) => {
                for (let file of fileData) {
                    state.fileShaMap.set(`${apiConfig.repo}#${file.path}`, file.sha);
                }
                resolve();
            }).catch(error => {
                reject(error);
            });

        })
    }

    function clearAllCache() {
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                if (key && !key.startsWith("wyd-")) {
                    localStorage.removeItem(key);
                }
            }
        }
    }

    /**
     * 设置指定仓库
     * @param repo
     */
    function setRepo(repo) {
        apiConfig.repo = repo;
        localStorage.setItem(storageKey.lsRepo, repo);
        utils.message(`切换数据源[${repo}]成功！`);
    }

    function getRepo() {
        return apiConfig.repo;
    }

    function getWydConfig() {
        return wydConfig;
    }

    function refreshToken(call) {
        let loginStorageData = localStorage.getItem(storageKey.lsLoginState);
        if (loginStorageData) {
            let loginState = JSON.parse(loginStorageData);
            let { created_at, expires_in, refresh_token } = loginState;
            if (Math.floor(Date.now() / 1000) - created_at > expires_in) {
                axios.post(`https://gitee.com/oauth/token?grant_type=refresh_token&refresh_token=${refresh_token}`).then(data => {
                    localStorage.setItem(storageKey.lsLoginState, JSON.stringify(data));
                    initState().then(() => {
                        call && call(data);
                    });
                });
            } else {
                call && call(loginState);
            }
        }
    }

    return {
        getFileTree,
        getFileContent,
        newFile,
        updateFile,
        deleteFile,
        initState,
        clearAllCache,
        setRepo,
        getRepo,
        storageKey,
        apiConfig,
        getWydConfig,
        updateFileCache,
        refreshToken
    }

});
