import {env} from 'cloudflare:workers';
import {identity} from '../../lib/cms/core.js';
import html from '../../site/admin.html?raw';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 if(!request.headers.get('oai-authenticated-user-id'))return Response.redirect(new URL('/signin-with-chatgpt?return_to=%2Fadmin',request.url),302);
 if(!identity(request,env))return new Response('<html lang="ko"><meta charset="utf-8"><title>관리자 로그인</title><body style="font-family:system-ui;padding:10vw"><h1>사이트 소유자 계정으로 로그인해 주세요.</h1><p>현재 계정에는 편집 권한이 없습니다.</p><a href="/signout-with-chatgpt?return_to=%2Fadmin" target="_top">다른 계정으로 로그인</a> · <a href="/">사이트로 돌아가기</a></body></html>',{status:403,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
 return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
