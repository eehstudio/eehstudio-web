import {env} from 'cloudflare:workers';
import {api} from '../../../../lib/cms/core.js';
export const dynamic='force-dynamic';
export const GET=(request:Request)=>api(request,env);
export const PUT=(request:Request)=>api(request,env);
export const POST=(request:Request)=>api(request,env);
