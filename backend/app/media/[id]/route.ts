import {env} from 'cloudflare:workers';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const id=new URL(request.url).pathname.split('/').pop()||'';
 if(!/^[a-f0-9-]{36}$/.test(id))return new Response('Not found',{status:404});
 const object=await env.BUCKET.get('cms/'+id);if(!object)return new Response('Not found',{status:404});
 return new Response(object.body,{headers:{'Content-Type':object.httpMetadata?.contentType||'application/octet-stream','Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});
}
