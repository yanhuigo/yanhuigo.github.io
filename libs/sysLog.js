define(["gitee", "utils"], function (gitee, utils) {

    let lsKey = "wyd-gitee-api-log";
    let lsData = {}

    initLogData();

    function initLogData() {
        let lsGiteeApiData = localStorage.getItem(lsKey);
        if (lsGiteeApiData) {
            lsData = JSON.parse(lsGiteeApiData);
            let app = utils.getVueCps("sysLog");
            if (app) {
                app.lsData = lsData;
            }
        }
    }

    function addLog(log, type = "gitee") {
        let dataList = lsData[type];
        let logObj = {
            content: log,
            time: new Date().toLocaleString()
        };
        if (dataList) {
            dataList.unshift(logObj);
        } else {
            lsData[type] = [logObj];
        }
        localStorage.setItem(lsKey, JSON.stringify(lsData));
    }

    let cps = {
        data() {
            return {
                lsData
            }
        },
        watch: {
            $route() {
                initLogData();
            }
        },
        methods: {
            clearLog() {
                localStorage.removeItem(lsKey);
                this.lsData = [];
                initLogData();
            }
        },
        mounted() {
        },
        template: `
        <div wydFlag="sysLog" class="ui container mt-5 d-flex flex-column segment">
            <h1 class="ui header">Gitee API操作日志</h1>
            <div class="mb-3">
                <button class="ui button" @click="clearLog">
                    <i class="refresh icon"></i>清空日志
                </button>
            </div>
            <el-timeline>
                <el-timeline-item
                  v-for="(log,index) in lsData.gitee"
                  :key="index"
                  :timestamp="log.time">
                  {{log.content}}
                </el-timeline-item>
            </el-timeline>
        </div>
        `,
    }

    return {
        cps,
        addLog
    }

});
