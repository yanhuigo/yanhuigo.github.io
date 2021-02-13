define([
    'ELEMENT',
    'axios'
], function (element, axios) {


    console.log("element ui 加载成功", element);

    let vueComponents = {};

    function goLogin(){
        if ("#/login" !== window.location.hash) {
            window.location.href = "#/login";
        }
    }

    /**
     * 获取标记有wydFlag属性的vue组件
     * @param wydFlag
     * @returns {*}
     */
    function getVueCps(wydFlag) {
        return vueComponents[wydFlag];
    }

    function setVueCps(wydFlag, cps) {
        vueComponents[wydFlag] = cps;
    }

    function getAllVueCps() {
        return vueComponents;
    }

    /*
        close
        closeAll
        error
        info
        success
        warning
    */
    function notify(msg, type = "success") {
        return element.Notification[type](msg);
    }

    /*
        close
        closeAll
        error
        info
        success
        warning
    */
    function message(msg, type = "success") {
        return element.Message[type](msg);
    }

    /*
        alert
        confirm
        prompt
        close
        setDefaults
    */
    function messageBox(msg, type = "alert") {
        return element.MessageBox[type](msg);
    }

    return {
        message,
        notify,
        messageBox,
        alert: element.MessageBox.alert,
        confirm: element.MessageBox.confirm,
        prompt: element.MessageBox.prompt,
        getVueCps,
        setVueCps,
        getAllVueCps,
        goLogin
    }

})
