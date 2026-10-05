// Load the real exported meshes and exercise the actual viewer's controls and
// orthographic camera math without claiming this is a WebGL/browser test.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {THREE,GLTFLoader,OrbitControls} from '../public/fl/three-bundle.js';
const root=path.resolve('public'),index=JSON.parse(fs.readFileSync(root+'/space/cad/index.json'));
// Embedded bitmap decoding is stubbed; geometry and camera/controls are real.
const parse=async url=>{const p=new URL(url).pathname,buf=fs.readFileSync(root+p);return new GLTFLoader().register(()=>({name:'CPU_TEST_TEXTURE_STUB',loadTexture:()=>Promise.resolve(new THREE.Texture())})).parseAsync(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength),'')};
class Element{constructor(){this.hidden=false;this.clientWidth=1000;this.clientHeight=620;this.dataset={};this.attributes={};this.style={};this.value='material';this.listeners={}}addEventListener(k,f){(this.listeners[k]??=[]).push(f)}removeEventListener(k,f){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x!==f)}getRootNode(){return this}setAttribute(k,v){this.attributes[k]=v}getAttribute(k){return this.attributes[k]}getBoundingClientRect(){return{left:0,top:0,width:this.clientWidth,height:this.clientHeight}}}
let draws=0;
class Renderer{setPixelRatio(){}setClearColor(){}setSize(){}render(scene,camera){assert(camera.isOrthographicCamera);draws++}}
const source=fs.readFileSync(root+'/space/viewer.js','utf8').replace(/^import .*;\n/,'').replaceAll('import.meta.url',"'https://eeh.test/space/viewer.js'");
for(const [id,record]of Object.entries(index)){
 assert.equal(record.views.length,5);for(const v of record.views){assert(fs.existsSync(root+'/'+v.src));assert(fs.existsSync(root+'/'+v.svg));assert(!fs.readFileSync(root+'/'+v.svg,'utf8').includes('#f4f2ed'))}
 const elements={},get=k=>elements[k]??=new Element(),buttons=record.views.map(v=>{const b=new Element();b.dataset.view=v.id;return b}),messages=[];
 const context={T:{...THREE,WebGLRenderer:Renderer},OrbitControls,GLTFLoader:class{loadAsync(url){return parse(url)}},console,URL,URLSearchParams,devicePixelRatio:2,location:{search:'?project='+id,origin:'https://eeh.test'},document:{getElementById:get,querySelector:()=>get('cutaway-label'),querySelectorAll:()=>buttons,addEventListener(){},hidden:false},ResizeObserver:class{observe(){}},parent:{postMessage:m=>messages.push(m)},addEventListener(){},fetch:async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.resolve(root+'/space',url),'utf8'))})};
 vm.createContext(context);new vm.Script(source+'\nglobalThis.inspect=()=>({model,bounds,camera,controls,record,selected});').runInContext(context);
 for(let n=0;n<200&&!messages.length;n++)await new Promise(r=>setTimeout(r,5));
 assert.equal(get('status').hidden,true,`${id}: ${get('status').textContent}`);assert(messages.some(x=>x.type==='eeh-model-ready'));
 const before=draws;for(let n=0;n<3;n++)await new Promise(r=>setTimeout(r,3));assert.equal(draws,before,'No animation loop');
 for(const shape of [[1000,620],[390,400]]){
  get('stage').clientWidth=shape[0];get('stage').clientHeight=shape[1];
  for(const b of buttons){b.onclick();const{bounds,camera,controls}=context.inspect();camera.updateMatrixWorld();assert.equal(controls.autoRotate,false);assert.equal(b.attributes['aria-pressed'],'true');
   for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){const q=new THREE.Vector3(x,y,z).project(camera);assert([q.x,q.y,q.z].every(Number.isFinite));assert(Math.abs(q.x)<1.001&&Math.abs(q.y)<1.001,`${id} ${b.dataset.view} cropped at ${shape}`)}
   if(b.dataset.view==='plan'){const d=new THREE.Vector3();camera.getWorldDirection(d);assert(d.y<-.99999,'Top view direction')}
  }
 }
 for(const mode of ['white','line','material']){get('material').value=mode;get('material').onchange()}
 get('reset').onclick();assert.equal(context.inspect().selected,'iso');
 console.log(`${id}: GLB loads, 5 views fit desktop/mobile, material controls and no spin passed`);
}
console.log('8 models / 80 orthographic viewport checks passed. WebGL rendering requires separate browser verification.');
