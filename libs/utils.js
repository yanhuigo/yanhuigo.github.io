define([
    'ELEMENT',
], function (element) {


    console.log("element ui 加载成功", element);


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
        messageBox
    }

})
