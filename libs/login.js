define(['jquery', 'semantic', 'utils', 'gitee', 'axios'], function ($, semantic, utils, gitee, axios) {

    return {
        data() {
            return {
                username: "",
                password: "",
                loginState: {}
            }
        },
        methods: {
            login() {
                if (this.username.trim() === "" || this.password.trim() === "") {
                    utils.message("请输入用户名密码！", "warning");
                    return false;
                }
                axios.post('https://gitee.com/oauth/token', {
                    grant_type: "password",
                    username: this.username,
                    password: this.password,
                    client_id: gitee.apiConfig.client_id,
                    client_secret: gitee.apiConfig.client_secret,
                    scope: "projects",
                }).then(data => {
                    localStorage.setItem(gitee.storageKey.lsLoginState, JSON.stringify(data));
                    gitee.initState().then(() => {
                        utils.notify("登录成功", "success");
                        this.$router.go(-1);
                    });
                    this.username = "";
                    this.password = "";
                }).catch((err) => {
                    console.log(err);
                    utils.notify("登录失败", "error");
                });
                return false;
            },
            loginValid() {
                gitee.refreshToken();
            },
        },
        mounted() {
            this.loginValid();
        },
        template: `
            <div class="ui middle aligned center aligned grid flex-grow-1 rounded-0 p-2 m-0 wyd-home">
              <div class="column border border-secondary rounded" style="max-width: 450px">
                <h1 class="ui teal image header">
                  <div class="content">
                     请登录 <i class="sign in alternate icon"></i>
                  </div>
                </h1>
                <div class="ui large form">
                  <div class="ui stacked">
                    <div class="field">
                      <div class="ui left icon input">
                        <i class="user icon"></i>
                        <input @keyup.enter="login" type="text" name="username" placeholder="用户名" v-model="username">
                      </div>
                    </div>
                    <div class="field">
                      <div class="ui left icon input">
                        <i class="lock icon"></i>
                        <input @keyup.enter="login" type="password" name="password" placeholder="密码" v-model="password">
                      </div>
                    </div>
                    <div class="ui fluid large teal submit button" @click="login">登录</div>
                    <div class="mt-3" v-if="loginState.access_token">
                        <div class="text-success my-3">已有登录状态</div>
                        <div class="text-left mb-2">登录时间 => {{new Date(loginState.created_at*1000).toLocaleString()}}</div>
                        <div class="text-left mb-2">过期时间 => {{new Date((loginState.created_at+loginState.expires_in)*1000).toLocaleString()}}</div>
                        <div class="text-left mb-2 text-truncate">AccessToken => {{loginState.access_token}}</div>
                        <div class="text-left mb-2 text-truncate">RefreshToken => {{loginState.refresh_token}}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        `,
    }

});
