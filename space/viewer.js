import {THREE as T,OrbitControls} from '../fl/three-bundle.js';
const stage=document.getElementById('stage'),canvas=document.getElementById('canvas'),status=document.getElementById('status'),labels=document.getElementById('labels');
let renderer,scene,camera,controls,group,pins=[],data,fullBox;
function init(){
  if(renderer)return;
  renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(3,Math.max(2,devicePixelRatio||1)));renderer.setClearColor(0xeeeae2,1);renderer.outputColorSpace=T.SRGBColorSpace;
  scene=new T.Scene();camera=new T.PerspectiveCamera(36,1,.01,200);controls=new OrbitControls(camera,canvas);
  controls.autoRotate=false;controls.enableDamping=false;controls.maxDistance=65;controls.minDistance=2;controls.maxPolarAngle=Math.PI/2-.015;
  scene.add(new T.HemisphereLight(0xffffff,0x777168,2.3));const light=new T.DirectionalLight(0xffffff,2.3);light.position.set(5,9,4);scene.add(light);
  new ResizeObserver(size).observe(stage);controls.addEventListener('change',draw);
}
function size(){if(!renderer)return;const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();draw()}
function material(color){return new T.MeshStandardMaterial({color,roughness:.8,metalness:.05})}
function box(x,z,w,d,h,c,y=0){const m=new T.Mesh(new T.BoxGeometry(Math.max(w,.012),Math.max(h,.01),Math.max(d,.012)),material(c));m.position.set(x,y+h/2,z);group.add(m);const edges=new T.LineSegments(new T.EdgesGeometry(m.geometry),new T.LineBasicMaterial({color:0x4b4841,transparent:true,opacity:.2}));m.add(edges);return m}
function placard(p){
  const c=document.createElement('canvas');c.width=2048;c.height=384;const ctx=c.getContext('2d');
  ctx.fillStyle=p.background||'#f6f3ec';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=p.color||'#242421';ctx.font='bold 250px Georgia,serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.text,1024,195,1950);
  const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const m=new T.Mesh(new T.PlaneGeometry(p.w,p.h),new T.MeshBasicMaterial({map:tx,side:T.DoubleSide}));m.position.set(p.x,p.y,p.z+.03);group.add(m);
}
function rebuild(d){
  init();data=d;
  if(group){group.traverse(o=>{o.geometry?.dispose();if(o.material){o.material.map?.dispose();o.material.dispose()}});scene.remove(group)}
  group=new T.Group();scene.add(group);pins=[];labels.replaceChildren();
  const [vx,vy,vw,vh]=d.viewBox,k=10/vw,px=x=>(x-vx-vw/2)*k,pz=y=>(y-vy-vh/2)*k;
  if(d.boxes){for(const r of d.boxes)box(r.x,r.z,r.w,r.d,r.h,r.color,r.y||0);for(const p of d.labels||[])placard(p)}
  else{
    box(0,0,10,vh*k,.05,0xf9f7f2,-.06);
    for(const r of d.rects){
      if(r.w>vw*.98&&r.h>vh*.98||r.kind==='room')continue;
      const wall=r.kind==='wall';box(px(r.x+r.w/2),pz(r.y+r.h/2),r.w*k,r.h*k,wall?1.15:Math.min(.65,Math.max(.18,Math.min(r.w,r.h)*k*.65)),wall?0xd9d5cc:r.color||0xbfb9ae);
    }
    for(const s of d.lines){const ax=px(s[0]),az=pz(s[1]),bx=px(s[2]),bz=pz(s[3]);const len=Math.hypot(bx-ax,bz-az);if(len<.02)continue;const m=box((ax+bx)/2,(az+bz)/2,len,.035,1.15,0xd9d5cc);m.rotation.y=-Math.atan2(bz-az,bx-ax)}
  }
  for(const [i,z] of d.zones.entries()){
    const b=document.createElement('button');b.className='pin';b.textContent=z.n+' · '+z.name;b.onclick=()=>{pick(i);parent.postMessage({type:'eeh-zone',index:i},location.origin)};labels.append(b);pins.push({button:b,point:new T.Vector3(px(z.x),.85,pz(z.y))});
    const dot=new T.Mesh(new T.CylinderGeometry(.055,.055,.04,20),material(0xe95b3e));dot.position.set(px(z.x),.1,pz(z.y));group.add(dot);
  }
  fullBox=new T.Box3().setFromObject(group);status.textContent=d.note||'원본 2D 배치 기반 · 높이는 개념 표현';size();setView('iso');pick(0);
}
function pick(i){pins.forEach((p,k)=>p.button.classList.toggle('on',k===i));draw()}
function setView(v){
  if(!camera||!fullBox)return;
  const center=fullBox.getCenter(new T.Vector3()),dims=fullBox.getSize(new T.Vector3());
  const direction=new T.Vector3(...({top:[.001,1,.001],front:[0,.04,1],right:[1,.04,0],left:[-1,.04,0],iso:[1,.95,1.2]}[v]||[1,.95,1.2])).normalize();
  const right=new T.Vector3().crossVectors(direction,new T.Vector3(0,1,0)).normalize(),up=new T.Vector3().crossVectors(right,direction).normalize();
  let hx=0,hy=0,depth=0;
  for(const x of [-dims.x/2,dims.x/2])for(const y of [-dims.y/2,dims.y/2])for(const z of [-dims.z/2,dims.z/2]){const p=new T.Vector3(x,y,z);hx=Math.max(hx,Math.abs(p.dot(right)));hy=Math.max(hy,Math.abs(p.dot(up)));depth=Math.max(depth,Math.abs(p.dot(direction)))}
  const tan=Math.tan(camera.fov*Math.PI/360),dist=Math.max(hy/tan,hx/(tan*camera.aspect))*1.1+depth;
  camera.position.copy(center).add(direction.multiplyScalar(dist));controls.target.copy(center);controls.update();
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===v));draw();
}
function draw(){if(!renderer)return;renderer.render(scene,camera);pins.forEach(p=>{const v=p.point.clone().project(camera);p.button.style.left=(v.x+1)/2*stage.clientWidth+'px';p.button.style.top=(-v.y+1)/2*stage.clientHeight+'px';p.button.hidden=v.z>1||v.z<-1})}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));document.getElementById('reset').onclick=()=>setView('iso');
addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent)return;if(e.data?.type==='eeh-plan')try{rebuild(e.data.data)}catch(err){status.textContent='3D를 사용할 수 없습니다. 2D 도면으로 확인해 주세요.'}if(e.data?.type==='eeh-select')pick(e.data.index);if(e.data?.type==='eeh-viewer-active'&&e.data.active)size()});
const id=new URLSearchParams(location.search).get('project');
if(id)fetch('./models.json').then(r=>{if(!r.ok)throw Error('load');return r.json()}).then(models=>{if(!models[id])throw Error('project');rebuild(models[id])}).catch(()=>status.textContent='3D를 사용할 수 없습니다. 상세 페이지의 2D 도면으로 확인해 주세요.');
else parent.postMessage({type:'eeh-viewer-ready'},location.origin);
