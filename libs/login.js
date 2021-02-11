define(['jquery', 'semantic', 'utils', 'gitee'], function ($, semantic, utils, gitee) {

    return {
        data() {
            return {
                username: "",
                password: "",
            }
        },
        methods: {
            login() {
                if (this.username.trim() === "" || this.password.trim() === "") {
                    utils.notify.warning("请输入用户名密码！");
                    return false;
                }
                axios.post('https://gitee.com/oauth/token', {
                    grant_type: "password",
                    username: this.username,
                    password: this.password,
                    client_id: common.config.client_id,
                    client_secret: common.config.client_secret,
                    scope: "projects",
                }).then(data => {
                    common.updateLogin(data);
                    localStorage.setItem(common.storage_login, JSON.stringify(data));
                    utils.notify.success("登录成功");
                    $("#app-login").modal("hide");
                    // app.$router.go(0);
                }).catch((err) => {
                    console.log(err);
                    utils.notify.error("登录失败");
                });
                return false;
            }
        },
        mounted() {
            $("#app-login").modal({
                closable: false,
                onApprove: () => {
                    this.login();
                    return false;
                }
            });
        },
        template: `
            <div class="ui modal w-50" id="app-login">
                <div class="header">
                    用户登录
                </div>
                <div class="content">
                    <div class="ui form">
                        <div class="field">
                            <label>用户名</label>
                            <input @keyup.enter="login" type="text" v-model="username" placeholder="请输入用户名">
                        </div>
                        <div class="field">
                            <label>密码</label>
                            <input @keyup.enter="login" type="password" v-model="password" name="last-name"
                                   placeholder="请输入密码">
                        </div>
                    </div>
                </div>
                <div class="actions">
                    <div class="ui positive right labeled icon button">
                        确认登录
                        <i class="checkmark icon"></i>
                    </div>
                </div>
            </div>
        `,
    }

});
