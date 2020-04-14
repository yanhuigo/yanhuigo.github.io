new Vue({
    el: '#app',
    data: {
        oldBmList: [],
        typeList: [],// 分类集合
        tagList: [],// 标签集合
        bmList: [],//书签集合
        checkedType: '',
        checkedTag: "",
        serachTxt: ""
    },
    methods: {
        typeFilter(type) {
            this.checkedTag = '';
            this.checkedType = this.checkedType === type ? '' : type;
            this.bmList = this.oldBmList.filter((bm) => this.checkedType === '' || bm.type === type)
        },
        tagFilter(tag) {
            this.checkedType = '';
            this.checkedTag = this.checkedTag === tag ? '' : tag;
            this.bmList = this.oldBmList.filter((bm) => this.checkedTag === '' || bm.tag === tag)
        },
        serach() {
            this.checkedTag = '';
            this.checkedType = '';
            let txt = this.serachTxt.toUpperCase();
            this.bmList = this.oldBmList.filter(({ title, url, type, tag }) =>
                txt === '' || title.toUpperCase().indexOf(txt) !== -1 || url.toUpperCase().indexOf(txt) !== -1 || tag.toUpperCase().indexOf(txt) !== -1 || type.toUpperCase().indexOf(txt) !== -1)
        }
    },
    mounted() {
        fetch(`${pageJsonUrl}/chrome.bookmark.json`).then(res => res.json()).then(data => {
            let eachBm = (object, isRoot, type, tag) => {
                let { b: title, c: url, a: children } = object;
                if (url) {
                    this.oldBmList.push({ title, url, type, tag });
                    this.bmList.push({ title, url, type, tag });
                } else {
                    !isRoot && this.tagList.push(title);
                    if (children) {
                        children.forEach((item) => {
                            eachBm(item, false, type, title);
                        });
                    }
                }

            }
            data.a.forEach(n => {
                this.typeList.push(n.b);
                eachBm(n, true, n.b);
            });
            document.getElementById('input_search').focus();
        });
    }
});