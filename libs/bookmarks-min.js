define(["vue","require","gitee","utils"],(function(e,t,i,s){let a=[],n=[],c=[];function l(e,t,i){if(e.a)for(let s of e.a)s.a?(n.push({name:s.b,type:t}),l(s,t,s.b)):l(s,t,i);else e.c&&(t&&(e.type=t),i&&(e.tag=i),c.push(e))}return{name:"bookmarks",data:()=>({bmTypeList:[],bmTagList:[],bmList:[],checkedType:"",checkedTag:"",searchTxt:"",loading:!1,bmSourceFile:"",bmSourceFiles:[]}),watch:{checkedType(e){this.checkedTag="",this.bmTagList=n.filter((t=>t.type===e)),this.bmList=c.filter((t=>t.type===e))}},methods:{initSearch(){$(".ui.search").search({source:[{title:"test",actionUrl:"https://zijieke.com/semantic-ui/modules/search.php#/settings"}],minCharacters:0,selectFirstResult:!0,onSelect(e,t){}})},logout(){confirm("确认登出？")&&(localStorage.clear(),window.location.href="/login.html")},search(){""===this.searchTxt?this.bmList=c.filter((e=>e.type===this.checkedType)):this.bmList=c.filter((e=>-1!==e.b.toUpperCase().indexOf(this.searchTxt.toUpperCase())||-1!==e.c.toUpperCase().indexOf(this.searchTxt.toUpperCase()))),this.checkedTag="",this.searchTxt=""},typeClick(e){this.bmList=c.filter((t=>t.type===e))},tagClick(e){let t=e.name;e.name===this.checkedTag&&(this.checkedTag="",t=""),this.checkedTag=t,this.bmList=""!==t?c.filter((e=>!!e.tag&&e.tag===t)):c.filter((e=>e.type===this.checkedType))},refreshData(){return s.confirm("确认重新下载书签数据?","提示",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then((()=>{this.checkedType="",this.checkedTag="",c=[],a=[],n=[],this.bmTypeList=[],this.bmTagList=[],this.bmList=[],this.loadData(!0)})).catch((()=>{})),!1},loadData(e){i.getFileContent(this.bmSourceFile,e).then((e=>{this.bmDataHandle(e)}))},bmDataHandle(e){let t=JSON.parse(e).a;for(let e of t)e.a?(l(e,e.b,null),a.push(e.b)):l(e,null,null);this.checkedType=a[0],this.bmTypeList=a,this.bmTagList=n,this.bmList=c,this.loading=!1},changeSource(e){a=[],n=[],c=[],this.bmSourceFile=e,this.loadData()}},mounted(){a=[],n=[],c=[];let e=i.getWydConfig();this.bmSourceFiles=e?.bookmarks?.bmSourceFiles,this.bmSourceFile=this.bmSourceFiles[0].path,this.loadData()},template:'\n            <div class="ui container pb-5 segment mt-2 mb-5">\n                <div class="ui buttons">\n                    <template v-for="(bsf,index) in bmSourceFiles">\n                      <button :title="bsf.note+\'-\'+bsf.path" class="ui button" :class="bsf.path===bmSourceFile ? \'active blue\':\'\'" @click="changeSource(bsf.path)">{{bsf.name}}</button>\n                      <div class="or" v-if="index<bmSourceFiles.length-1"></div>\n                    </template>\n                </div>\n                <div class="my-3 d-flex flex-row">\n                    <div class="ui search flex-grow-1">\n                        <div class="ui icon input d-flex">\n                            <input class="search" type="text" @keyup.enter="search" v-model="searchTxt" placeholder="搜索书签..."\n                                   autocomplete="off"/>\n                            <i class="search icon"></i>\n                        </div>\n                    </div>\n                    <button class="ui icon button ml-1" data-tooltip="下载书签" data-position="bottom left"\n                            @click="refreshData"><i class="sync icon"></i></button>\n                </div>\n                <div class="ui raised segment"><span class="ui ribbon label green">分类</span>\n                    <template v-for="type in bmTypeList">\n                        <button class="ui button mt-1" :class="checkedType==type ? \'positive\' :\'\' "\n                                @click="checkedType=type">\n                            {{type}}\n                        </button>\n                    </template>\n                </div>\n                <div class="ui raised segment" v-if="bmTagList.length>0"><span class="ui ribbon label teal">标签</span><a\n                        class="ui tag label mt-1" :class="checkedTag==tag.name ? \'teal\' :\'\' " v-for="tag in bmTagList"\n                        @click="tagClick(tag)">{{tag.name}}</a></div>\n                <div class="ui cards centered mt-4">\n                    <a class="card" target="_blank" :href="bm.c" v-for="bm in bmList">\n                        <div class="content overflow-hidden">\n                            <p class="ui header small d-inline text-nowrap" :title="bm.b">{{bm.b}} </p>\n                            <div class="meta text-nowrap">{{bm.tag}}</div>\n                            <div class="description text-nowrap" :title="bm.c">{{bm.c}}</div>\n                        </div>\n                    </a>\n                </div>\n            </div>\n        '}}));