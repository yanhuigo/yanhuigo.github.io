let isProd = true;
let pathArr = window.location.pathname.split('/');
let bsnName = pathArr[pathArr.length - 1].replace(".html", "");
let bsnJsPath = `/js/${bsnName ? bsnName : "/index"}`;

if (window.location.host === 'localhost') isProd = false;
let header = document.getElementsByTagName('head')[0];
let loadBsn = () => {
    // 业务包
    let script_bsn = document.createElement('script');
    script_bsn.src = `${bsnJsPath}${isProd ? '-min' : ''}.js`;
    header.appendChild(script_bsn);
}

// 公共包
let script_common = document.createElement('script');
script_common.src = `/js/common${isProd ? '-min' : ''}.js`;
if (script_common.readyState) {
    script_common.onreadystatechange = function () {
        if (script_common.readyState === 'loaded' || script_common.readyState === 'complete') {
            script_common.onreadystatechange = null;
            loadBsn();
        }
    };
} else {
    script_common.onload = function () {
        loadBsn();
    };
}
header.appendChild(script_common);