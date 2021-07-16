const gitee = (function () {

    const lsLoginState = 'wyd-login-state';

    async function getPublicFile(path, cache = true) {
        return getFile("webdata", path, cache,null);
    }

    async function getMeFile(path, cache = true) {
        return getFile("webme", path, cache);
    }

    function refreshToken() {
        let loginStorageData = localStorage.getItem(lsLoginState);
        if (loginStorageData) {
            let loginState = JSON.parse(loginStorageData);
            let { created_at, expires_in, refresh_token } = loginState;
            if (Math.floor(Date.now() / 1000) - created_at > expires_in) {
                axios.post(`https://gitee.com/oauth/token?grant_type=refresh_token&refresh_token=${refresh_token}`).then(data => {
                    localStorage.setItem(lsLoginState, JSON.stringify(data));
                });
            }
        }
    }

    function getFile(project = "webdata", path, cache = true, access_token) {
        return new Promise((resolve, reject) => {
            let dataKey = `webdata#${path}`;
            if (cache) {
                // 修改但是未同步的数据
                let mdfDataKey = `webdata#@${path}`;
                let mdfCacheData = localStorage.getItem(mdfDataKey);
                if (mdfCacheData) {
                    resolve(mdfCacheData);
                    return;
                }
                let cacheData = localStorage.getItem(dataKey);
                if (cacheData) {
                    resolve(cacheData);
                    return;
                }
            }
            fetch(`https://gitee.com/api/v5/repos/yanhui1993/${project}/contents/${path}${access_token ? '?access_token=' + access_token : ''}`).then(response => response.json())
                .then(data => {
                    let fileContent = decode(data.content);
                    localStorage.setItem(dataKey, fileContent);
                    resolve(fileContent);
                });
        })
    }

    // private property
    const _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    // public method for decoding
    function decode(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));
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
        output = _utf8_decode(output);
        return output;

    }

    // private method for UTF-8 decoding
    function _utf8_decode(utftext) {
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

    return {
        getPublicFile,
        getMeFile,
        refreshToken
    }

})();

gitee.refreshToken();