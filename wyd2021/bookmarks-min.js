define(["vue","require","gitee","utils"],(function(t,e,i,a){let s=[],n=[],c=[];function l(t,e,i){if(t.a)for(let a of t.a)a.a?(n.push({name:a.b,type:e}),l(a,e,a.b)):l(a,e,i);else t.c&&(e&&(t.type=e),i&&(t.tag=i),c.push(t))}return{name:"bookmarks",data:()=>({bmTypeList:[],bmTagList:[],bmList:[],checkedType:"",checkedTag:"",searchTxt:"",loading:!1}),watch:{checkedType(t){this.checkedTag="",this.bmTagList=n.filter((e=>e.type===t)),this.bmList=c.filter((e=>e.type===t))}},methods:{initSearch(){$(".ui.search").search({source:[{title:"test",actionUrl:"https://zijieke.com/semantic-ui/modules/search.php#/settings"}],minCharacters:0,selectFirstResult:!0,onSelect(t,e){}})},logout(){confirm("确认登出？")&&(localStorage.clear(),window.location.href="/login.html")},search(){this.bmList=c.filter((t=>-1!==t.b.toUpperCase().indexOf(this.searchTxt.toUpperCase())||-1!==t.c.toUpperCase().indexOf(this.searchTxt.toUpperCase()))),this.checkedTag="",this.searchTxt=""},typeClick(t){this.bmList=c.filter((e=>e.type===t))},tagClick(t){let e=t.name;t.name===this.checkedTag&&(this.checkedTag="",e=""),this.checkedTag=e,this.bmList=""!==e?c.filter((t=>!!t.tag&&t.tag===e)):c.filter((t=>t.type===this.checkedType))},refreshData(){return a.confirm("确认重新下载书签数据?","提示",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then((()=>{this.checkedType="",this.checkedTag="",c=[],s=[],n=[],this.bmTypeList=[],this.bmTagList=[],this.bmList=[],this.loadData(!0)})).catch((()=>{})),!1},loadData(t){i.getFileContent("json/chrome.bookmark.json",t).then((t=>{this.bmDataHandle(t)}))},bmDataHandle(t){let e=JSON.parse(t).a;for(let t of e)t.a?(l(t,t.b,null),s.push(t.b)):l(t,null,null);this.checkedType=s[0],this.bmTypeList=s,this.bmTagList=n,this.bmList=c,this.loading=!1}},mounted(){s=[],n=[],c=[],this.loadData()},template:'\n            <div class="ui container pb-5 segment mt-2">\n                <div class="mb-3 d-flex flex-row">\n                    <div class="ui search flex-grow-1">\n                        <div class="ui icon input d-flex">\n                            <input class="search" type="text" @keyup.enter="search" v-model="searchTxt" placeholder="搜索书签..."\n                                   autocomplete="off"/>\n                            <i class="search icon"></i>\n                        </div>\n                    </div>\n                    <button class="ui icon button ml-1" data-tooltip="下载书签" data-position="bottom left"\n                            @click="refreshData"><i class="sync icon"></i></button>\n                </div>\n                <div class="ui raised segment"><span class="ui ribbon label green">分类</span>\n                    <template v-for="type in bmTypeList">\n                        <button class="ui button mt-1" :class="checkedType==type ? \'positive\' :\'\' "\n                                @click="checkedType=type">\n                            {{type}}\n                        </button>\n                    </template>\n                </div>\n                <div class="ui raised segment" v-if="bmTagList.length>0"><span class="ui ribbon label teal">标签</span><a\n                        class="ui tag label mt-1" :class="checkedTag==tag.name ? \'teal\' :\'\' " v-for="tag in bmTagList"\n                        @click="tagClick(tag)">{{tag.name}}</a></div>\n                <div class="ui cards centered mt-4">\n                    <a class="card" target="_blank" :href="bm.c" v-for="bm in bmList">\n                        <div class="content overflow-hidden">\n                            <p class="ui header small d-inline text-nowrap" :title="bm.b">{{bm.b}} </p>\n                            <div class="meta text-nowrap">{{bm.tag}}</div>\n                            <div class="description text-nowrap" :title="bm.c">{{bm.c}}</div>\n                        </div>\n                    </a>\n                </div>\n            </div>\n        '}}));