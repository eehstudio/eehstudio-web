import {env} from 'cloudflare:workers';
import html from '../site/index.html?raw';
import {published,getEntry,identity} from '../lib/cms/core.js';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const url=new URL(request.url),key=url.searchParams.get('cms_preview');
 const docs=await published(env);let preview=null;
 if(key){if(!identity(request,env))return new Response('관리자 로그인 후 미리보기를 열어 주세요.',{status:403});try{const entry=await getEntry(env,key);preview=entry.doc;const at=docs.findIndex(d=>d.key===key);if(at>=0)docs.splice(at,1);docs.push({...preview,hidden:false})}catch{ return new Response('먼저 임시 저장해 주세요.',{status:404}) }}
 const boot=JSON.stringify({docs,preview:key?preview?.key:null}).replace(/</g,'\\u003c');
 return new Response(html.replace('<script src="cms-content.js">',`<script>window.EEH_CMS_BOOT=${boot}</script><script src="cms-content.js">`),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
