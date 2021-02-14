define(["gitee"],(function(t){return{data:()=>({lsKeyList:[]}),methods:{initLsKey(){for(let t in localStorage)localStorage.hasOwnProperty(t)&&(this.lsKeyList.push(t),this.lsKeyList.sort())},clearStorage(){confirm("确认清空缓存？")&&(t.clearAllCache(),this.refresh())},refresh(){this.lsKeyList=[],this.initLsKey()}},mounted(){$('div[flag="storageView"]').accordion({exclusive:!1,onOpening(){if(!$(this).find("textarea").val()){let t=localStorage.getItem($(this).attr("lsKey"));try{let i=JSON.parse(t);$(this).find("textarea").val(JSON.stringify(i,null,4))}catch(i){$(this).find("textarea").val(t)}}}}),this.initLsKey()},template:'\n        <div class="ui container mt-5 d-flex flex-column segment">\n            <div class="mb-3">\n                <button class="ui button" @click="refresh">\n                    <i class="refresh icon"></i>刷新缓存\n                </button>\n                <button class="ui button" @click="clearStorage">\n                    <i class="download icon"></i>清空缓存\n                </button>\n                <button class="ui button disabled">\n                    <i class="download icon"></i>下载缓存\n                </button>\n            </div>\n            <div flag="storageView" class="ui styled accordion w-100">\n                <template v-for="lsKey in lsKeyList">\n                  <div class="title">\n                    <i class="dropdown icon"></i>\n                    {{lsKey}}\n                  </div>\n                  <div class="content ui from" :lsKey="lsKey">\n                    <div class="transition hidden ui form">\n                        <div class="field">\n                            <textarea readonly></textarea>\n                        </div>\n                    </div>\n                  </div>\n                </template>\n            </div>\n        </div>\n        '}}));