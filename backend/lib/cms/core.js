import seeds from './seeds.json' with {type:'json'};
export const SEEDS=seeds;
const byKey=new Map(seeds.map(x=>[x.key,x]));
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const fail=(status,message)=>{throw Object.assign(new Error(message),{status})};
export function identity(req,env){const id=req.headers.get('oai-authenticated-user-id'),email=req.headers.get('oai-authenticated-user-email')?.toLowerCase();return id&&email&&email===String(env.CMS_ADMIN_EMAIL||'').toLowerCase()?{id,email}:null}
const validKey=k=>/^(project|note|site):[a-z0-9][a-z0-9-]{0,79}$/.test(k);
function safeUrl(v,image=false){if(!v)return '';if(typeof v!=='string'||v.length>2048||/[\x00-\x20<>"'\\]/.test(v))fail(400,'주소를 확인해 주세요.');if(image){if(/^(https:\/\/|\/(?!\/)|images\/|pf\/|fl\/|svm\/)/.test(v))return v;}else if(/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/.test(v))return v;fail(400,'사용할 수 없는 주소입니다.')}
export function validate(input,key){
 if(!validKey(key)||!input||typeof input!=='object')fail(400,'문서를 확인해 주세요.');
 const [kind,id]=key.split(':'),out={key,kind,id};
 const fields=['title','client','year','div','status','summary','cover','date','tag','case','email','instagram','phone','address','profilePdf'];
 for(const k of fields)if(input[k]!=null){if(typeof input[k]!=='string'||input[k].length>(k==='summary'?10000:2000))fail(400,'입력 내용이 너무 깁니다.');out[k]=input[k]}
 if(!out.title?.trim())fail(400,'제목을 입력해 주세요.');
 if(kind==='project'&&!['brand','space','marketing','design'].includes(out.div))fail(400,'프로젝트 분야를 선택해 주세요.');
 if(kind==='project'&&!['Built','Proposal','System','Archive','Plan'].includes(out.status))fail(400,'작업 상태를 확인해 주세요.');
 if(kind==='project'&&input.practices!=null){if(!Array.isArray(input.practices)||input.practices.some(x=>!['brand','space','marketing','design'].includes(x)))fail(400,'노출 분야를 확인해 주세요.');out.practices=[...new Set([out.div,...input.practices])];}
 if(out.cover)safeUrl(out.cover,true);if(out.profilePdf)safeUrl(out.profilePdf);
 out.hidden=!!input.hidden;out.tags=Array.isArray(input.tags)?input.tags.slice(0,15).map(String).map(x=>x.slice(0,60)):[];
 for(const kind of ['text','images','links']){out[kind]={};const entries=Object.entries(input[kind]||{});if(entries.length>600)fail(400,'수정 항목이 너무 많습니다.');for(const [k,v] of entries){if(['__proto__','prototype','constructor'].includes(k)||typeof v!=='string'||k.length>2048||v.length>15000)fail(400,'수정 항목을 확인해 주세요.');if(kind==='images')safeUrl(v,true);if(kind==='links')safeUrl(v);out[kind][k]=v}}
 if(!Array.isArray(input.blocks||[])||(input.blocks||[]).length>100)fail(400,'본문 블록은 100개까지 사용할 수 있습니다.');
 out.blocks=(input.blocks||[]).map(b=>{if(!['p','h2','blockquote','image','link'].includes(b.type))fail(400,'본문 형식을 확인해 주세요.');const v={type:b.type,text:String(b.text||'').slice(0,15000)};if(b.type==='image'||b.type==='link')v.url=safeUrl(b.url,b.type==='image');return v});
 if(JSON.stringify(out).length>450000)fail(400,'문서 크기가 너무 큽니다.');return out;
}
async function row(env,key){return env.DB.prepare('SELECT * FROM cms_entries WHERE key=?').bind(key).first()}
export async function getEntry(env,key){if(!validKey(key))fail(404,'문서가 없습니다.');const r=await row(env,key);if(r)return {key,doc:JSON.parse(r.draft_json),version:r.version,publishedVersion:r.published_version,publishedAt:r.published_at,updatedAt:r.updated_at,published:r.published_json?JSON.parse(r.published_json):null};if(byKey.has(key))return {key,doc:byKey.get(key),version:0,publishedVersion:0,publishedAt:null,updatedAt:null,published:byKey.get(key)};fail(404,'문서가 없습니다.')}
export async function published(env){const r=await env.DB.prepare('SELECT published_json FROM cms_entries WHERE published_json IS NOT NULL').all();return r.results.map(x=>JSON.parse(x.published_json))}
async function list(env){const r=await env.DB.prepare('SELECT * FROM cms_entries ORDER BY updated_at DESC').all();const map=new Map(seeds.map(doc=>[doc.key,{key:doc.key,doc,version:0,publishedVersion:0,published:doc,updatedAt:null}]));for(const x of r.results)map.set(x.key,{key:x.key,doc:JSON.parse(x.draft_json),version:x.version,publishedVersion:x.published_version,published:x.published_json?JSON.parse(x.published_json):null,updatedAt:x.updated_at});return [...map.values()]}
const revision=async(env,key,version,doc,action)=>env.DB.prepare('INSERT INTO cms_revisions(id,entry_key,version,content_json,action,created_at) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),key,version,JSON.stringify(doc),action,new Date().toISOString()).run();
async function save(env,key,body,action='save'){
 const doc=validate(body.doc,key),ver=body.version;if(!Number.isSafeInteger(ver)||ver<0)fail(400,'저장 버전을 확인해 주세요.');
 const existing=await row(env,key);if((existing?.version||0)!==ver)fail(409,'다른 창에서 수정되었습니다. 현재 내용을 복사한 뒤 새로고침해 주세요.');
 const now=new Date().toISOString(),seed=byKey.get(key),p=seed?JSON.stringify(seed):null;
 const result=await env.DB.prepare('INSERT INTO cms_entries(key,kind,draft_json,published_json,version,published_version,updated_at) VALUES(?,?,?,?,1,0,?) ON CONFLICT(key) DO UPDATE SET draft_json=excluded.draft_json,version=cms_entries.version+1,updated_at=excluded.updated_at WHERE cms_entries.version=? RETURNING version').bind(key,doc.kind,JSON.stringify(doc),p,now,ver).all();
 if(!result.results.length)fail(409,'다른 창에서 수정되었습니다. 새로고침 후 다시 저장해 주세요.');
 await revision(env,key,ver+1,doc,action);return getEntry(env,key);
}
function checkWrite(req){if(req.headers.get('origin')!==new URL(req.url).origin)fail(403,'이 사이트의 관리자 화면에서 요청해 주세요.');}
export async function api(req,env){
 try{
  const url=new URL(req.url),parts=url.pathname.slice('/api/cms/'.length).split('/').map(decodeURIComponent),me=identity(req,env);
  if(!me)return json({error:'사이트 소유자 계정으로 로그인해 주세요.',signIn:'/signin-with-chatgpt?return_to=%2Fadmin'},req.headers.get('oai-authenticated-user-id')?403:401);
  if(!['GET','HEAD'].includes(req.method))checkWrite(req);
  if(parts[0]==='me'&&req.method==='GET')return json({email:me.email});
  if(parts[0]==='entries'&&req.method==='GET')return json({entries:await list(env)});
  if(parts[0]==='backup'&&req.method==='GET')return new Response(JSON.stringify({format:'eeh-cms-v1',exportedAt:new Date().toISOString(),entries:await list(env)},null,2),{headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="eeh-studio-content-backup.json"','Cache-Control':'no-store'}});
  if(parts[0]==='media'){
   if(req.method==='GET')return json({items:(await env.DB.prepare('SELECT * FROM cms_media ORDER BY created_at DESC LIMIT 150').all()).results});
   if(req.method==='POST'){
    if(Number(req.headers.get('content-length')||0)>22*1024*1024)fail(413,'파일은 20MB 이하로 올려주세요.');
    const form=await req.formData(),f=form.get('file');if(!f||typeof f==='string'||!f.size||f.size>20*1024*1024)fail(400,'20MB 이하의 이미지 또는 PDF를 선택해 주세요.');
    const buf=await f.arrayBuffer(),b=new Uint8Array(buf),head=new TextDecoder('latin1').decode(b.slice(0,16));let mime='';
    if(b[0]===137&&head.slice(1,4)==='PNG')mime='image/png';else if(b[0]===255&&b[1]===216&&b[2]===255)mime='image/jpeg';else if(head.startsWith('RIFF')&&head.slice(8,12)==='WEBP')mime='image/webp';else if(/^GIF8[79]a/.test(head))mime='image/gif';else if(head.startsWith('%PDF-'))mime='application/pdf';else fail(400,'JPG, PNG, WebP, GIF, PDF 파일만 지원합니다.');
    const id=crypto.randomUUID(),now=new Date().toISOString();await env.BUCKET.put('cms/'+id,buf,{httpMetadata:{contentType:mime}});
    await env.DB.prepare('INSERT INTO cms_media(id,name,mime,size,created_at) VALUES(?,?,?,?,?)').bind(id,String(f.name).slice(0,200),mime,f.size,now).run();return json({id,url:'/media/'+id,name:f.name,mime,size:f.size});
   }
  }
  if(parts[0]==='entry'){
   const key=parts[1];if(!validKey(key))fail(404,'문서가 없습니다.');
   if(parts.length===2&&req.method==='GET')return json(await getEntry(env,key));
   if(parts.length===2&&req.method==='PUT'){const raw=await req.text();if(raw.length>500000)fail(413,'문서가 너무 큽니다.');return json(await save(env,key,JSON.parse(raw)))}
   if(parts[2]==='history'&&req.method==='GET')return json({items:(await env.DB.prepare('SELECT id,version,action,created_at FROM cms_revisions WHERE entry_key=? ORDER BY created_at DESC LIMIT 30').bind(key).all()).results});
   if(parts[2]==='restore'&&req.method==='POST'){const b=await req.json(),r=await env.DB.prepare('SELECT content_json FROM cms_revisions WHERE id=? AND entry_key=?').bind(b.revisionId,key).first();if(!r)fail(404,'이전 저장본이 없습니다.');return json(await save(env,key,{version:b.version,doc:JSON.parse(r.content_json)},'restore'))}
   if(['publish','unpublish'].includes(parts[2])&&req.method==='POST'){
    const b=await req.json(),r=await getEntry(env,key);if(r.version!==b.version)fail(409,'다른 창에서 수정되었습니다. 먼저 새로고침해 주세요.');if(!r.version)fail(400,'먼저 임시 저장해 주세요.');
    const doc=parts[2]==='unpublish'?{...r.doc,hidden:true}:{...r.doc,hidden:false},now=new Date().toISOString();
    const result=await env.DB.prepare('UPDATE cms_entries SET published_json=?,published_version=version+1,version=version+1,published_at=?,updated_at=? WHERE key=? AND version=? RETURNING version').bind(JSON.stringify(doc),now,now,key,b.version).all();if(!result.results.length)fail(409,'다른 창에서 수정되었습니다.');await revision(env,key,b.version+1,doc,parts[2]);return json(await getEntry(env,key));
   }
  }
  return json({error:'요청한 기능이 없습니다.'},404);
 }catch(e){return json({error:e.status?e.message:'저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'},e.status||500)}
}
