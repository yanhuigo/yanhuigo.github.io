let common = (function () {

    const storage_login = "login-state";
    const storage_fileList = "fileList";
    const config = {
        client_id: "f5250ed1c6f0a51423ca06aa4faf5c10d64ce8b411c425256d22fec16a531665",
        client_secret: "00a0f31357ce04fe3619eab7149d7c1b4daade23677a898b8f14bb647bc25fb3",
        username: "yanhui1993",
        project: "webdata"
    }

    axiosInit();

    if ("/login.html" === window.location.pathname) return {config};

    let loginStorageData = localStorage.getItem(storage_login);
    if ("/login.html" !== window.location.pathname && !loginStorageData) {
        window.location.href = "/login.html";
        return;
    }

    let {access_token} = JSON.parse(loginStorageData);

    // 保存文件路径和sha的对应关系
    let fileTree = {};
    let fileListStorageData = localStorage.getItem(storage_fileList);
    if (fileListStorageData) {
        fileTree = JSON.parse(fileListStorageData);
    } else {
        initFileTree().then(() => {
            console.log("初始化文件列表完成...")
        });
    }

    function tip(msg) {
        alert(msg);
    }


    // 获取指定路径的文件内容
    async function getContent(filePath, refresh = false) {
        let cacheContent = localStorage.getItem(filePath);
        if (!refresh && cacheContent) {
            return Base64.decode(cacheContent);
        }
        let data = await axios.get(`https://gitee.com/api/v5/repos/${config.username}/${config.project}/contents/${filePath}?access_token=${access_token}`);
        localStorage.setItem(filePath, data.content);
        return Base64.decode(data.content);
    }

    // 更新文件
    async function updateFile(filePath, content) {
        let sha = fileTree[filePath];
        if (!sha) {
            tip(`未匹配匹配文件 ${filePath}`);
            return;
        }
        let data = Base64.encode(content);
        axios.put(`https://gitee.com/api/v5/repos/${config.username}/${config.project}/contents/${filePath}`, {
            access_token,
            content: data,
            sha,
            message: `open api update ${window.location.pathname}`
        }).then((data) => {
            tip("更新成功！");
            initFileTree();
        }).catch((err) => {
            console.error(err);
            tip("更新异常！");
        })
    }

    // 新增文件
    async function newFile(filePath, content) {
        if (!filePath || !content) {
            return;
        }
        let data = Base64.encode(content);
        axios.post(`https://gitee.com/api/v5/repos/${config.username}/${config.project}/contents/${filePath}`, {
            access_token,
            content: data,
            message: `open api new ${window.location.pathname}`
        }).then((data) => {
            tip("新增成功！");
            initFileTree();
        }).catch((err) => {
            console.error(err);
            tip("新增异常！");
        })
    }

    // 获取整个项目的文件列表
    async function initFileTree() {
        // 获取项目下的文件树
        let data = await axios.get(`https://gitee.com/api/v5/repos/${config.username}/${config.project}/git/trees/master?access_token=${access_token}&recursive=1`);
        let fileList = data.tree;
        let newFileTree = {};
        for (let file of fileList) {
            newFileTree[file.path] = file.sha;
        }
        fileTree = newFileTree;
        localStorage.setItem(storage_fileList, JSON.stringify(newFileTree));
    }

    function axiosInit() {
        axios.interceptors.request.use(function (config) {
            return config;
        }, function (error) {
            return Promise.reject(error);
        });

        axios.interceptors.response.use(function (response) {
            if (response.status === 200) {
                return response.data;
            }
            return response;
        }, function (error) {
            if (error.response.status === 401 && "/login.html" !== window.location.pathname) {
                localStorage.removeItem(storage_login);
                window.location.href = "/login.html";
            } else {
                return Promise.reject(error);
            }
        });
    }

    const Base64 = {

        // private property
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        // public method for encoding
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = Base64._utf8_encode(input);

            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

            }

            return output;
        },

        // public method for decoding
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            while (i < input.length) {

                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

            }

            output = Base64._utf8_decode(output);

            return output;

        },

        // private method for UTF-8 encoding
        _utf8_encode: function (string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        },

        // private method for UTF-8 decoding
        _utf8_decode: function (utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;

            while (i < utftext.length) {

                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }

            }

            return string;
        }

    }

    return {
        config,
        fileTree,
        getContent,
        updateFile,
        newFile,
        base64: Base64
    }

})();
