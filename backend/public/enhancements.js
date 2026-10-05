/* Source-preserving additions. The original case-study data remains unchanged. */
(()=>{
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const progress=document.createElement('div');progress.className='eeh-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
let scrolling=false;function progressUpdate(){scrolling=false;const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?Math.min(1,scrollY/max):0})`}
addEventListener('scroll',()=>{if(!scrolling){scrolling=true;requestAnimationFrame(progressUpdate)}},{passive:true});addEventListener('hashchange',progressUpdate);
const originalRender=renderCase;renderCase=function(w){originalRender(w);const root=q(".js-case");if(root)delete root.dataset.enhanced;augment(w)};
const publicOrigin='https://eehstudio.kr/';
function classify(src){
 if(/sim-|\/sim|simulation/i.test(src))return '시뮬레이션';
 if(/(?:\/d\/|\/\d\d\.|fl-deck|svm-original\/p)/.test(src))return '기획안';
 if(/(?:site|\/o\d|svm-(?:cover|hall|crowd|visitor|booth|mission|counter)|fl-site)/.test(src))return '현장';
 if(/(?:plan|front|view_|fl-wall|fl-top|fl-mission|render)/.test(src))return '공간·도면';
 return '디자인·기록';
}
function augment(w){
 const root=q('.js-case');if(!root||root.dataset.enhanced===w.id)return;root.dataset.enhanced=w.id;
 qa('.xs-plan',root).forEach((p)=>enhancePlan(p,w));
 if(w.id==='immersive-2021'){const svg=q('.xi-plan',root);if(svg)enhanceFlat(svg,w)}
 if(w.id==='social-value-market')addSourcePlates(root);
 if(w.id==='freeze-lab')addModelDrawing(root);
 if(w.id==='king-of-kings')addSimulation(root);
 if(window.EEHEditorial)window.EEHEditorial.augment(root,w);
 addQuiz(root,w);addArchive(root,w);qa('.ph-fig img,.ea-im',root).forEach(el=>el.dataset.cu='');
 if(typeof mvScan==='function')mvScan(root);if(typeof rvScan==='function')rvScan();progressUpdate();
}
function sourceFor(w){
 const folders=(window.EEH_ASSET_INDEX||{}).projects[w.id]||[];
 return folders.filter(x=>!/(?:^|\/)thumbs\.jpg$/i.test(x.src)).map((x,i)=>({...x,kind:x.caption?.includes("참고")?"기획안·참고":classify(x.src),no:i+1}));
}
function addQuiz(root,w){
 const quizzes={
  'lifemeal-yeonnam':{label:'FEBRUARY 2026 · YEONNAM POP-UP',title:'나의 웰니스 유형은?',description:'2월 라이프밀 팝업에서 선보인 WBTI입니다. 방문객이 자신의 웰니스 유형을 확인하던 경험을 직접 만나보세요.',url:'https://smore.im/quiz/ZQK41vQWJE'},
  'freeze-lab':{label:'LIFEMEAL · WBTI TEST',title:'나에게 맞는 웰니스 루틴 찾기',description:'최근 진행한 라이프밀 WBTI TEST입니다. 공간의 이야기와 함께, 질문을 따라 나의 웰니스 유형을 알아보는 콘텐츠도 체험할 수 있습니다.',url:'https://smore.im/quiz/GsPkM6IuyH'}
 };
 const quiz=quizzes[w.id];if(!quiz)return;
 const section=document.createElement('section');section.className='quiz-experience wrap';
 const heading='quiz-'+w.id;section.setAttribute('aria-labelledby',heading);
 section.innerHTML=`<div><span class="quiz-label">${quiz.label}</span><h2 id="${heading}">${quiz.title}</h2><p>${quiz.description}</p><a href="${quiz.url}" target="_blank" rel="noopener noreferrer">스모어에서 새 탭으로 열기 ↗</a></div><div><details class="quiz-embed"><summary>이 페이지에서 테스트 열기</summary></details><p class="quiz-note">테스트가 보이지 않으면 새 탭으로 열어 주세요. 접었다 펼쳐도 현재 화면은 유지됩니다.</p></div>`;
 const details=q('details',section);
 details.addEventListener('toggle',()=>{
  if(!details.open||q('iframe',details))return;
  const iframe=document.createElement('iframe');iframe.src=quiz.url;iframe.title=quiz.title+' · 라이프밀 WBTI 테스트';iframe.referrerPolicy='strict-origin-when-cross-origin';details.append(iframe);
 });
 const next=q('.cs-next',root);if(next)next.before(section);else root.append(section);
}
function addArchive(root,w){
 const assets=sourceFor(w);if(!assets.length)return;
 const block=document.createElement('section');block.className='ea wrap';block.setAttribute('aria-label',w.title+' 프로젝트 이미지 아카이브');
 block.innerHTML=`<div class="ea-head"><div><span class="ea-k">PROJECT ARCHIVE / ${String(assets.length).padStart(3,'0')}</span><h2>작업의 장면들.</h2></div><p>현장, 공간, 디자인과 기획 기록을 함께 살펴보세요. 이미지를 누르면 크게 볼 수 있습니다.</p></div><div class="ea-tabs" role="group" aria-label="자료 종류"></div><div class="ea-grid"></div><button type="button" class="ea-more">더 보기</button><p class="ep-note">SIMULATION은 구현 예상 이미지입니다. 원본 기획안에는 타 브랜드 참고 자료가 포함될 수 있으며, 모두 실제 제작물이나 현장 사진을 뜻하지는 않습니다.</p>`;
 const next=q('.cs-next',root);if(next)next.before(block);else root.append(block);
 const types=['전체',...new Set(assets.map(a=>a.kind))],tabs=q('.ea-tabs',block),grid=q('.ea-grid',block),more=q('.ea-more',block);let type='전체',limit=12;
 function render(){
  const list=type==='전체'?assets:assets.filter(a=>a.kind===type);
  grid.innerHTML=list.slice(0,limit).map((a,i)=>`<figure><div class="ea-im"><img src="${a.src}" alt="${esc(w.title)} · ${esc(a.caption||a.kind)} ${a.no}" loading="lazy" decoding="async" width="${a.width}" height="${a.height}" data-lb="${esc(w.title)} · ${esc(a.caption||a.kind)} ${a.no}">${a.kind==='시뮬레이션'?'<span class="ea-tag">SIMULATION</span>':''}</div><figcaption><span>${esc(a.caption||a.kind)} ${String(a.no).padStart(2,'0')}</span><span>${a.width} × ${a.height}</span></figcaption></figure>`).join('');
  qa('button',tabs).forEach(b=>b.setAttribute('aria-pressed',b.dataset.type===type));more.hidden=list.length<=limit;more.textContent=`더 보기 · ${Math.min(limit,list.length)} / ${list.length}`;
  if(typeof mvScan==='function')mvScan(grid);
 }
 types.forEach(t=>{const b=document.createElement('button');b.type='button';b.dataset.type=t;b.innerHTML=esc(t)+`<span>${t==='전체'?assets.length:assets.filter(a=>a.kind===t).length}</span>`;b.onclick=()=>{type=t;limit=12;render()};tabs.append(b)});
 more.onclick=()=>{limit+=12;render()};render();
}
function addSourcePlates(root){
 const block=document.createElement('section');block.className='ea wrap';
 block.innerHTML=`<div class="ea-head"><div><span class="ea-k">ORIGINAL DRAWINGS / CSES</span><h2>제작 전 기획과 현장 배치를 비교합니다.</h2></div><p>9월 5일 제작 전 공간기획 원본입니다. 페이지 상단의 도면과 3D는 이후 현장 사진으로 재구성한 배치입니다.</p></div><div class="ep-plates">${['부스 조닝과 원본 치수','정면 입면과 참여 미션','평면 배치 · IN, TEST, GIFT, COUNTER, OUT'].map((c,i)=>`<figure><img src="images/svm-original/p${String(i+4).padStart(2,'0')}.webp" alt="${esc(c)}" width="2880" height="1620" loading="lazy" data-lb="${esc(c)}"><figcaption>${esc(c)}</figcaption></figure>`).join('')}</div><p class="ep-note">기획 당시 도면과 최종 현장 사진을 함께 보며 설계가 구현된 과정을 확인할 수 있습니다.</p>`;
 const archive=q('.cs-next',root);if(archive)archive.before(block);else root.append(block);
}
function addSimulation(root){
 const section=document.createElement('section');section.className='ea wrap';section.innerHTML='<div class="ea-head"><div><span class="ea-k">SPACE VISUALIZATION</span><h2>빈 공간에서, 참여하는 공간으로.</h2></div><p>설치 전 실측 사진을 기준으로 색칠 체험존의 설치 모습을 재구성했습니다. 슬라이더를 움직여 비교해 보세요.</p></div><div class="ep-compare" style="--split:50%"><img src="images/pf/king-of-kings/x/z3.jpg" alt="킹오브킹스 색칠 체험존 설치 전 원본 실측 사진" loading="lazy"><img class="ep-after" src="images/pf/king-of-kings/x/sim-z3-v2.webp" alt="색칠 체험존 설치 모습을 재구성한 AI 공간 시뮬레이션" loading="lazy"><span class="ep-compare-label">BEFORE · 원본 실측 사진</span><span class="ep-compare-label right">SIMULATION · 공간 재구성</span><div class="ep-divider"></div><input type="range" min="0" max="100" value="50" aria-label="설치 전과 공간 시뮬레이션 비교 비율"></div><p class="ep-note">AI 공간 시뮬레이션 · 원본 공간 구조와 색칠 체험 기획을 바탕으로 재구성한 예상 모습입니다.</p>';
 q('input',section).addEventListener('input',e=>q('.ep-compare',section).style.setProperty('--split',e.target.value+'%'));const next=q('.cs-next',root);if(next)next.before(section);else root.append(section);
}
function addModelDrawing(root){
 const section=document.createElement('section');section.className='ea wrap';section.innerHTML='<div class="ea-head"><div><span class="ea-k">MODEL R02 / DRAWINGS</span><h2>같은 모델에서 뽑은 도면.</h2></div><p>FREEZE LAB 3D 원본 모델의 평면·입면과 존별 영역을 벡터로 다시 정리했습니다.</p></div><div class="ep-plates"><figure><img src="space/cad/freeze-lab/plan.svg" alt="FREEZE LAB 원본 모델 R02에서 투영한 벡터 평면도" loading="lazy" data-lb="FREEZE LAB 모델 R02 평면도"><figcaption>2D PLAN · 원본 모델의 위쪽 투영</figcaption></figure><figure><img src="space/cad/freeze-lab/front.svg" alt="FREEZE LAB 원본 모델 R02에서 투영한 벡터 입면도" loading="lazy" data-lb="FREEZE LAB 모델 R02 입면도"><figcaption>ELEVATION · 원본 모델 정면 투영</figcaption></figure><figure><img src="space/cad/freeze-lab/iso.svg" alt="FREEZE LAB 모델 R02 아이소메트릭 구조" loading="lazy" data-lb="FREEZE LAB 모델 R02 아이소메트릭"><figcaption>AXONOMETRIC · 원본 모델 전체 구조</figcaption></figure></div><p class="ep-note">평면·정면·아이소메트릭을 같은 원본 R02 모델에서 추출했습니다. 현장 실측도와 구분되는 모델 기록입니다.</p>';
 const next=q('.cs-next',root);if(next)next.before(section);else root.append(section);
}
function getPlanData(svg,zones){
 const vb=(svg.getAttribute('viewBox')||'0 0 1200 800').split(/[ ,]+/).map(Number),rects=[],lines=[];
 qa('rect',svg).forEach(r=>{const kind=(r.classList.contains('room')||(+r.getAttribute('width')>vb[2]*.85&&+r.getAttribute('height')>vb[3]*.85))?'room':r.classList.contains('wall')?'wall':'fixture';const fill=r.getAttribute('fill');rects.push({x:+r.getAttribute('x')||0,y:+r.getAttribute('y')||0,w:+r.getAttribute('width')||0,h:+r.getAttribute('height')||0,kind,color:fill&&/^#[0-9a-f]{3,6}$/i.test(fill)?fill:'#c9c3b7'})});
 qa('path.wall',svg).forEach(p=>{let x=0,y=0;const tokens=(p.getAttribute('d')||'').match(/[MLHVZmlhvz]|-?\d+(?:\.\d+)?/g)||[];let c='',i=0,sx=0,sy=0;while(i<tokens.length){if(/[a-z]/i.test(tokens[i]))c=tokens[i++];const old=[x,y];if(c==='M'||c==='L'){x=+tokens[i++];y=+tokens[i++];if(c==='M'){sx=x;sy=y;c='L';continue}}else if(c==='H')x=+tokens[i++];else if(c==='V')y=+tokens[i++];else if(c==='Z'){x=sx;y=sy;c='';}else{break}if(Number.isFinite(x)&&Number.isFinite(y))lines.push([...old,x,y]);else break}});
 return {viewBox:vb,rects,lines,zones:zones.map(z=>({n:z.n,name:z.name,x:z.x,y:z.y}))};
}
function controlsFor(holder,flat,svg,zones,notify,projectId){
 const tools=document.createElement('div');tools.className='ep-tools';tools.innerHTML='<button type="button" data-view="flat" aria-pressed="true">2D 도면</button><button type="button" data-view="space" aria-pressed="false">3D 아이소</button><button type="button" data-act="in" aria-label="2D 도면 확대">＋</button><button type="button" data-act="out" aria-label="2D 도면 축소">−</button><button type="button" data-act="reset">초기화</button><small>원본 배치 기반 구조 모델</small>';
 holder.prepend(tools);flat.classList.add('ep-flat');const iframe=document.createElement('iframe');iframe.className='ep-frame';iframe.title='원본 평면 배치 기반 인터랙티브 3D 공간 다이어그램';iframe.hidden=true;flat.after(iframe);let ready=false,started=false,zoom=1;
 const message=(payload)=>{if(ready)iframe.contentWindow.postMessage(payload,location.origin)};
 tools.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.view){const is3=b.dataset.view==='space';flat.hidden=is3;iframe.hidden=!is3;qa('[data-view]',tools).forEach(x=>x.setAttribute('aria-pressed',x===b));if(is3&&!started){iframe.src='space/viewer.html?project='+encodeURIComponent(projectId);started=true}if(is3&&ready)message({type:'eeh-reset'})}
  if(b.dataset.act){zoom=b.dataset.act==='reset'?1:Math.max(.6,Math.min(2.5,zoom+(b.dataset.act==='in'?.2:-.2)));svg.style.transform=`scale(${zoom})`;if(b.dataset.act==='reset')message({type:'eeh-reset'})}
 });
 addEventListener('message',e=>{if(!holder.isConnected||e.origin!==location.origin||e.source!==iframe.contentWindow)return;if(e.data?.type==='eeh-model-ready'){ready=true;message({type:'eeh-reset'})}if(e.data?.type==='eeh-zone'&&Number.isInteger(e.data.index))notify?.(e.data.index)});
 return i=>message({type:'eeh-select',index:i});
}
function enhancePlan(p,w){
 if(p.dataset.spatial)return;p.dataset.spatial='1';const flat=q('.pl',p),svg=q('svg',flat);if(!svg||w.id==='ghs-2025')return;
 const zd=q('.xs-zd',p.closest('.xs')),zones=zd?JSON.parse(zd.textContent):[];if(!zones.length)return;
 const holder=document.createElement('div');holder.className='ep-view';flat.before(holder);holder.append(flat);const pick=i=>{const b=qa('.xs-tabs button',p)[i];b?.click()};const send=controlsFor(holder,flat,svg,zones,pick,w.id);
 qa('.xs-tabs button',p).forEach((b,i)=>b.addEventListener('click',()=>send(i)));
 qa('.z',svg).forEach((g,i)=>{g.classList.add('ep-key');g.setAttribute('role','button');g.setAttribute('tabindex','0');g.setAttribute('aria-label',zones[i]?.name||'존 선택');g.addEventListener('click',()=>send(i));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(i);send(i)}})});
 const cap=document.createElement('p');cap.className='ep-cap';cap.textContent='2D 원본 배치를 바탕으로 공간 구조를 재구성했습니다. 3D의 수직 높이는 개념 표현이며 시공 도면을 대체하지 않습니다.';holder.append(cap);
}
function enhanceFlat(svg,w){
 const flat=svg.parentElement,holder=document.createElement('div');holder.className='ep-view ep-immersive';flat.before(holder);holder.append(flat);controlsFor(holder,flat,svg,[],null,w.id);const cap=document.createElement('p');cap.className='ep-cap';cap.textContent='원본의 전시 동선을 2D와 공간 다이어그램으로 살펴보세요. 색상은 각 코스의 영역이며 높이는 개념 표현입니다.';holder.append(cap);
}
const current=WORKS.find(w=>location.hash===`#/work/${w.id}`);if(current)augment(current);
})();
