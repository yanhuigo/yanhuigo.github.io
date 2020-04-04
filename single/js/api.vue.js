if (!Vue) {
    console.warn("No Vue Libary...");
}

const baseUrl = 'https://212.64.91.205:5210/api';

let myfetch = (url, config = {}) => {
    url = `${baseUrl}${url}`;
    return fetch(url, config).then(response => {
        if (response.status === 200) {
            return response.json();
        } else if (response.status === 400 || response.status === 401) {
            Vue.prototype.$api.loginCallback();
        }
        throw new Error('http请求异常...', response);
    });
}

let app = {};

let ss = sessionStorage.getItem("app");
if (ss) {
    app = JSON.parse(ss);
}

window.app = app;
Vue.prototype.$api = {
    login(key) {
        return myfetch('/admin/app', {
            method: "get",
            headers: { 'JB-Plat': 'js', 'JB-AdminKey': key }
        }).then(res => {
            app = res.data.result[0];
            sessionStorage.setItem("app", JSON.stringify(app));
            return app;
        });
    },
    get(objectName, order = { createdAt: -1 }) {
        order = encodeURI(JSON.stringify(order));
        return myfetch(`/object/${objectName}?order=${order}`, {
            method: "GET",
            headers: { 'JB-Plat': 'js', 'JB-AppId': app.id, 'JB-key': app.key }
        }).then(res => res.data.result);
    },
    post(objectName, object) {
        return myfetch(`/object/${objectName}`, {
            method: "POST",
            headers: { 'JB-Plat': 'js', 'JB-AppId': app.id, 'JB-key': app.key },
            body: JSON.stringify(object)
        }).then(res => res.data.result);
    },
    put(objectName, id, object) {
        return myfetch(`/object/${objectName}/${id}/`, {
            method: "PUT",
            headers: { 'JB-Plat': 'js', 'JB-AppId': app.id, 'JB-key': app.key },
            body: JSON.stringify(object)
        }).then(res => res.data.result);
    },
    delete(objectName, id) {
        return myfetch(`/object/${objectName}/${id}/`, {
            method: "DELETE",
            headers: { 'JB-Plat': 'js', 'JB-AppId': app.id, 'JB-key': app.key }
        }).then(res => res.data.result);
    }
}