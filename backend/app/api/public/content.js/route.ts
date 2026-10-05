import {env} from 'cloudflare:workers';
import {published} from '../../../../lib/cms/core.js';
import {publicFeed} from '../../../../lib/cms/public-feed.js';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const docs=await published(env);
 return new Response(publicFeed(docs,new URL(request.url).origin),{headers:{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'cross-origin'}});
}
