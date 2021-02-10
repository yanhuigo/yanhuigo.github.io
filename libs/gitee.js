define(['axios', 'base64', 'utils'], function (axios, base64, utils) {

    const apiConfig = {
        client_id: "f5250ed1c6f0a51423ca06aa4faf5c10d64ce8b411c425256d22fec16a531665",
        client_secret: "00a0f31357ce04fe3619eab7149d7c1b4daade23677a898b8f14bb647bc25fb3",
        reposUrlPrefix: `https://gitee.com/api/v5/repos/yanhui1993/webdata`
    }

    const storageKey = {
        lsLoginState: "ls-login-state",//登录状态
        lsFileTree: "ls-file-Tree",//文件树
    };

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
     * @returns {Promise<unknown>}
     */
    async function getFileTree(refresh = false) {
        return new Promise((resolve) => {
            let cache = getLocalData(storageKey.lsFileTree);
            if (cache && !refresh) {
                resolve(cache);
                return;
            }
            // 获取项目下的文件树
            axios.get(`${apiConfig.reposUrlPrefix}/git/trees/master?access_token=${access_token}&recursive=1`).then(data => {
                saveLocalData(storageKey.lsFileTree, data.tree);
                resolve(data.tree);
            });

        });
    }

    /**
     * 获取文件内容
     * @param filePath 文件路径
     * @param refresh 是否刷新
     * @returns {Promise<null|*>}
     */
    async function getFileContent(filePath, refresh = false) {
        let storageKey = `ls-${filePath}`;
        let cache = getLocalData(storageKey, false);
        if (!refresh && cache) {
            return base64.decode(cache);
        }
        let data = await axios.get(`${apiConfig.reposUrlPrefix}/contents/${filePath}?access_token=${access_token}`);
        if (!data.content) {
            utils.message(`获取文件内容失败! [${filePath}]`, "error");
            return null;
        }
        saveLocalData(storageKey, data.content)
        return base64.decode(data.content);
    }

    /**
     * 新增文件
     * @param filePath 文件路径
     * @param content 文件内容
     * @returns {Promise<unknown>}
     */
    async function newFile(filePath, content) {
        if (!filePath || !content) {
            return;
        }
        let data = base64.encode(content);
        // let loading = utils.loading({text: "新增文件中..."});
        return new Promise((resolve) => {
            axios.post(`${apiConfig.reposUrlPrefix}/contents/${filePath}`, {
                access_token,
                content: data,
                message: `open api new ${window.location.pathname}`
            }).then(async (data) => {
                utils.notify("新增成功！", "success");
                // loading.close();
                // await initFileTree();
                resolve(data);
            }).catch((err) => {
                // loading.close();
                console.error(err);
                utils.notify("新增异常！", "error");
            })
        })

    }

    /**
     * 更新文件
     * @param filePath 文件路径
     * @param content 文件内容
     * @returns {Promise<void>}
     */
    async function updateFile(filePath, content) {
        let sha = state.fileShaMap.get(filePath);
        if (!sha) {
            utils.notify(`未匹配文件 ${filePath}`, 'warning');
            return;
        }
        // let loading = utils.loading({text: "更新文件中..."});
        let data = base64.encode(content);
        axios.put(`${apiConfig.reposUrlPrefix}/contents/${filePath}`, {
            access_token,
            content: data,
            sha,
            message: `open api update ${window.location.pathname}`
        }).then(() => {
            // loading.close();
            utils.notify(`更新[${filePath}]成功！`, "success");
            // localStorage.setItem(filePath, data);
            // initFileTree();
        }).catch((err) => {
            // loading.close();
            console.error(err);
            utils.notify("更新异常！", "error");
        })
    }

    /**
     * 删除文件
     * @param filePath 文件路径
     * @returns {Promise<unknown>}
     */
    async function deleteFile(filePath) {
        let sha = state.fileShaMap.get(filePath);
        if (!sha) {
            // utils.notify.warning(`未匹配文件 ${filePath}`);
            return;
        }
        // let loading = utils.loading({text: "删除文件中..."});
        return new Promise((resolve) => {
            axios.delete(`${apiConfig.reposUrlPrefix}/contents/${filePath}`, {
                params: {
                    access_token,
                    sha,
                    message: `open api delete ${window.location.pathname}`
                }
            }).then(async () => {
                // loading.close();
                utils.notify(`删除[${filePath}]成功！`, "success");
                // localStorage.removeItem(filePath);
                // await initFileTree();
                resolve();
            }).catch((err) => {
                // loading.close();
                console.error(err);
                // utils.notify.error("删除异常！", "error");
            })
        })

    }

    /**
     * 保存数据到本地
     * @param key
     * @param data
     */
    function saveLocalData(key, data) {
        if (typeof data === 'object') {
            localStorage.setItem(key, JSON.stringify(data));
        } else {
            localStorage.setItem(key, data);
        }

    }

    /**
     * 获取本地数据
     * @param key
     * @param isObject
     * @returns {string|null}
     */
    function getLocalData(key, isObject = true) {
        let storage = localStorage.getItem(key);
        if (storage) {
            return isObject ? JSON.parse(storage) : storage;
        }
        return null;
    }

    /**
     * 初始化本地localStorage
     */
    async function initState() {

        return new Promise(async (resolve, reject) => {

            loginStateInit();

            await fileShaMapInit();

            console.log("数据初始化完成！");

            resolve();

        });
    }

    // 登录状态
    function loginStateInit() {
        let loginStorageData = localStorage.getItem(storageKey.lsLoginState);
        state.loginState = JSON.parse(loginStorageData);
        access_token = state.loginState['access_token'];
    }

    // 文件路径-sha
    async function fileShaMapInit() {
        let fileData = await getFileTree();
        for (let file of fileData) {
            state.fileShaMap.set(file.path, file.sha);
        }
    }

    return {
        getFileTree,
        getFileContent,
        newFile,
        updateFile,
        deleteFile,
        initState
    }

});
