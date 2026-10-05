import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {getEntry,SEEDS} from '../lib/cms/core.js';

// Execute the actual route with only its Cloudflare binding replaced in memory.
const source=readFileSync(new URL('../app/media/[id]/route.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const env={},exports={};
new Function('exports','require',compiled)(exports,specifier=>{
 assert.equal(specifier,'cloudflare:workers');
 return {env};
});
let checks=0;
const ok=(actual,expected)=>{assert.deepEqual(actual,expected);checks++};
const id='12345678-1234-1234-1234-123456789012';
const request=value=>new Request('https://eeh.test/media/'+value);
let response=await exports.GET(request('invalid'));
ok(response.status,404);
response=await exports.GET(request(id));
ok(response.status,503);
ok(response.headers.get('Cache-Control'),'no-store');
ok(response.headers.get('X-Content-Type-Options'),'nosniff');
ok(await response.text(),'Media storage is unavailable');

let requestedKey=null;
env.BUCKET={async get(key){requestedKey=key;return null}};
response=await exports.GET(request(id));
ok(response.status,404);
ok(requestedKey,'cms/'+id);
requestedKey=null;
response=await exports.GET(request('invalid'));
ok(response.status,404);
ok(requestedKey,null);

env.BUCKET={async get(){return {body:new Uint8Array([137,80,78,71]),httpMetadata:{contentType:'image/png'}}}};
response=await exports.GET(request(id));
ok(response.status,200);
ok(response.headers.get('Content-Type'),'image/png');
ok(response.headers.get('Cache-Control'),'public, max-age=31536000, immutable');
ok(response.headers.get('X-Content-Type-Options'),'nosniff');
ok([...new Uint8Array(await response.arrayBuffer())],[137,80,78,71]);
env.BUCKET={async get(){return {body:'fallback bytes'}}};
response=await exports.GET(request(id));
ok(response.headers.get('Content-Type'),'application/octet-stream');
ok(await response.text(),'fallback bytes');

await assert.rejects(getEntry({},'invalid'),{status:404,message:'문서가 없습니다.'});checks++;
const emptyDatabase={DB:{prepare(){return {bind(){return this},async first(){return null}}}}};
await assert.rejects(getEntry(emptyDatabase,'project:missing-typefix-test'),{status:404,message:'문서가 없습니다.'});checks++;
const seed=SEEDS[0],entry=await getEntry(emptyDatabase,seed.key);
ok(entry.key,seed.key);
ok(entry.doc,seed);
ok(entry.version,0);
console.log(`${checks} route regression checks passed: missing storage, invalid/missing media, media bytes and headers, missing/seed CMS entries.`);
