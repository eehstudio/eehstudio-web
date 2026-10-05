import {THREE as T,OrbitControls,GLTFLoader} from '../fl/three-bundle.js';
const $=id=>document.getElementById(id), stage=$('stage'),canvas=$('canvas'),status=$('status');
const params=new URLSearchParams(location.search),id=params.get('project');
const directions={iso:[1,1,1],plan:[0,1,0],front:[0,0,1],left:[-1,0,0],right:[1,0,0]};
const names={iso:'AXONOMETRIC',plan:'PLAN / TOP',front:'FRONT ELEVATION',left:'LEFT ELEVATION',right:'RIGHT ELEVATION'};
let renderer,scene,camera,controls,model,bounds,record,zones,selected='iso',meshes=[],active=true,settingView=false;
const asset=path=>new URL('../'+path,import.meta.url).href;
function draw(){if(renderer&&model&&active)renderer.render(scene,camera)}
function resize(){if(!renderer)return;const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);const half=(camera.top-camera.bottom)/2,aspect=w/h;camera.left=-half*aspect;camera.right=half*aspect;camera.updateProjectionMatrix();draw()}
function fit(view=selected,box=bounds){
 if(!box||!renderer)return;selected=view;settingView=true;
 const dir=new T.Vector3(...directions[view]).normalize(),up=new T.Vector3(...(view==='plan'?[0,0,-1]:[0,1,0])),right=new T.Vector3().crossVectors(up,dir).normalize(),vertical=new T.Vector3().crossVectors(dir,right);
 const center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());let hx=0,hy=0;
 for(const x of [-size.x/2,size.x/2])for(const y of [-size.y/2,size.y/2])for(const z of [-size.z/2,size.z/2]){const v=new T.Vector3(x,y,z);hx=Math.max(hx,Math.abs(v.dot(right)));hy=Math.max(hy,Math.abs(v.dot(vertical)))}
 const aspect=Math.max(stage.clientWidth,1)/Math.max(stage.clientHeight,1),half=Math.max(hy,hx/aspect,.1)*1.16;
 camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.zoom=1;camera.up.copy(up);camera.position.copy(center).addScaledVector(dir,Math.max(size.length()*2,10));camera.lookAt(center);camera.updateProjectionMatrix();bindControls();controls.target.copy(center);controls.update();
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
 $('view-name').textContent=names[view];$('drawing').href=asset(record.views.find(v=>v.id===view).svg);$('drawing').hidden=false;settingView=false;draw();
}
function bindControls(){controls?.dispose();controls=new OrbitControls(camera,canvas);controls.autoRotate=false;controls.enableDamping=false;controls.minZoom=.35;controls.maxZoom=10;controls.maxPolarAngle=Math.PI*.98;controls.screenSpacePanning=true;controls.addEventListener('change',()=>{if(!settingView){$('view-name').textContent='CUSTOM VIEW';document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed','false'));$('drawing').hidden=true}draw()});}
function styleModel(){
 const mode=$('material').value;
 for(const m of meshes){m.material=mode==='material'?m.userData.original:mode==='white'?m.userData.clay:m.userData.line;m.userData.edges.visible=mode!=='white'}
 draw();
}
function focusZone(key){
 if(!zones?.[key])return;const z=zones[key],box=new T.Box3(new T.Vector3(...z.min),new T.Vector3(...z.max));fit('iso',box);
 $('view-name').textContent=z.ko+' / AXONOMETRIC';
}
async function main(){
 const response=await fetch('./cad/index.json');if(!response.ok)throw Error('목록을 불러오지 못했습니다.');record=(await response.json())[id];if(!record)throw Error('해당 공간 모델이 없습니다.');
 $('title').textContent=record.title;document.title=record.title+' · EEH MODEL VIEWS';$('note').textContent=record.note;$('dimension').textContent=record.dimensions.map(d=>d.label).join(' / ');
 $('drawing').href=asset(record.views[0].svg);$('drawing').hidden=false;
 renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2.5));renderer.setClearColor(0xffffff,1);renderer.outputColorSpace=T.SRGBColorSpace;
 scene=new T.Scene();camera=new T.OrthographicCamera(-10,10,10,-10,.01,500);
 scene.add(new T.HemisphereLight(0xffffff,0xb4bbc1,2));const light=new T.DirectionalLight(0xffffff,2.3);light.position.set(8,12,9);scene.add(light);
 const gltf=await new GLTFLoader().loadAsync(asset(record.glb));model=gltf.scene;scene.add(model);model.updateMatrixWorld(true);
 // Static projections and this viewer use the same mesh, with no automatic spin.
 const addEdges=[];model.traverse(o=>{if(!o.isMesh)return;const edge=new T.LineSegments(new T.EdgesGeometry(o.geometry,24),new T.LineBasicMaterial({color:0x38434b,transparent:true,opacity:.5}));edge.renderOrder=1;o.userData.original=o.material;o.userData.clay=new T.MeshStandardMaterial({color:0xe4e7e9,roughness:1,side:T.DoubleSide});o.userData.line=new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});o.userData.edges=edge;meshes.push(o);addEdges.push([o,edge])});for(const [m,e]of addEdges)m.add(e);
 bounds=new T.Box3().setFromObject(model);const overhead=[];model.traverse(o=>{if(o.userData.layer==='overhead')overhead.push(o)});if(overhead.length){document.querySelector('.cutaway').hidden=false;$('cutaway').onchange=()=>{overhead.forEach(o=>o.visible=!$('cutaway').checked);draw()}}

 new ResizeObserver(resize).observe(stage);resize();fit(directions[params.get('view')]?params.get('view'):'iso');status.hidden=true;$('download').href=asset(record.glb);$('download').hidden=false;
 if(id==='freeze-lab'){try{zones=(await (await fetch('../fl/booth_meta.json')).json()).zones}catch{}}
 parent.postMessage({type:'eeh-model-ready'},location.origin);if(params.has('zone'))focusZone(params.get('zone'));
}
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>fit(b.dataset.view));$('reset').onclick=()=>fit('iso');$('material').onchange=styleModel;
addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent)return;if(e.data?.type==='eeh-focus-zone')focusZone(e.data.zone);if(e.data?.type==='eeh-reset')fit('iso');if(e.data?.type==='eeh-viewer-active'){active=!!e.data.active;if(active)resize()}});
document.addEventListener('visibilitychange',()=>{active=!document.hidden;if(active)draw()});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();status.hidden=false;status.textContent='3D 연결이 중단됐습니다. 페이지를 다시 열거나 아래 SVG 도면을 확인해 주세요.';$('drawing').hidden=false});
main().catch(error=>{status.hidden=false;status.textContent='3D를 열 수 없습니다. 아래 SVG 도면으로 구조를 확인해 주세요.';console.warn('Model viewer:',error.message)});
