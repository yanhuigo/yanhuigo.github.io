let common = (function () {

    const storage_login = "login-state";
    const storage_fileList = "fileList";

    let loginStorageData = localStorage.getItem(storage_login);
    if ("/login.html" !== window.location.pathname && !loginStorageData) {
        window.location.href = "/login.html";
        return;
    }

    let fileTree = JSON.parse(localStorage.getItem("fileList"));


    const config = {
        client_id: "f5250ed1c6f0a51423ca06aa4faf5c10d64ce8b411c425256d22fec16a531665",
        client_secret: "00a0f31357ce04fe3619eab7149d7c1b4daade23677a898b8f14bb647bc25fb3",
        username: "yanhui1993",
        project: "webdata"
    }

    // Add a request interceptor
    axios.interceptors.request.use(function (config) {
        return config;
    }, function (error) {
        return Promise.reject(error);
    });

    // Add a response interceptor
    axios.interceptors.response.use(function (response) {
        return response.data;
    }, function (error) {
        // 如果登录过  则拿 refresh token 换新的token
        return Promise.reject(error);
    });

    async function getContent(filePath, refresh = false) {
        let sha = fileTree[filePath];
        let cacheContent = localStorage.getItem(sha);
        if (!refresh && cacheContent) {
            return Base64.decode(cacheContent);
        }
        let loginStorageData = localStorage.getItem(storage_login);
        let {access_token} = JSON.parse(loginStorageData);
        let data = await axios.get(`https://gitee.com/api/v5/repos/${config.username}/${config.project}/git/blobs/${sha}?access_token=${access_token}`);
        localStorage.setItem(sha, data.content);
        return Base64.decode(data.content);
    }

    async function initFileTree(refresh = false) {
        let fileTreeCache = localStorage.getItem(storage_fileList);
        if (refresh || !fileTreeCache) {
            let loginStorageData = localStorage.getItem(storage_login);
            let {access_token} = JSON.parse(loginStorageData);
            // 获取项目下的文件树
            let data = await axios.get(`https://gitee.com/api/v5/repos/${config.username}/${config.project}/git/trees/master?access_token=${access_token}&recursive=1`);
            let fileList = data.tree;
            let newFileTree = {};
            for (let file of fileList) {
                newFileTree[file.path] = file.sha;
            }
            localStorage.setItem(storage_fileList, JSON.stringify(newFileTree));
        }
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
        initFileTree,
        getContent,
        base64: Base64
    }

})();
