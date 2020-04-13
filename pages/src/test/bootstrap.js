new Vue({
    el: '#app',
    data: {
        typeList: [],
        bmList: []
    },
    mounted() {
        fetch(`${pageJsonUrl}/ChromeData.json`).then(res => res.json()).then(data => {
            let result = paeseData(JSON.parse(data[0].value));
            let { typeList, bmList } = result;
            this.typeList = typeList;
            this.bmList = bmList;
        });
    }
});

function paeseData(rootBm) {

    let typeList = [];
    let bmList = [];

    let getBookmark = (bmObj) => {
        let { a: children, b: title, c: url } = bmObj;
        if (children) {
            typeList.push(title);
            children.forEach(n => getBookmark(n));
        } else {
            bmList.push({ title, url });
        }
    }

    getBookmark(rootBm);

    return { typeList, bmList }

}