/* Public project evidence and AI-assisted planning, alongside the four practices. */
(()=>{
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const external=(url,label)=>`<a href="${E(url)}" target="_blank" rel="noopener noreferrer">${E(label)} <span aria-hidden="true">↗</span></a>`;
const proofLink=(id,label,jump)=>`<a href="#/work/${id}" data-eeh-jump="${jump}">${label} <span aria-hidden="true">↗</span></a>`;
const cases=[
 {id:'freeze-lab',name:'용산 FREEZE LAB',client:'LIFEMEAL · YONGSAN POP-UP',image:'images/pf/fl-site/04.jpg',text:'브리프와 커뮤니케이션을 일정, 결정 사항, 실행 체크리스트로 구조화하고 3D 공간 설계와 현장 운영으로 연결했습니다.',tags:['기획 대시보드','77개 실행 항목','공간 시뮬레이션']},
 {id:'social-value-market',name:'CSES · SOCIAL VALUE MARKET',client:'CSES · SOCIAL VALUE FESTA',image:'images/svm-counter.jpg',text:'사회적가치 체험을 문항, 보상 구조, 참여 동선으로 설계하고 앱·POS·영수증으로 이어지는 운영 시스템으로 구체화했습니다.',tags:['기획 대시보드','91개 등록 업무','앱 · POS 프로토타입']}
];
function home(){
 const h=q('.js-ai-home');if(h)h.innerHTML=`<section class="ee-ai-home"><div class="ee-ai-intro"><span class="ee-eyebrow">HOW WE PLAN / AI-ASSISTED</span><h2>AI로 기획을 구조화하고,<br>현장에서 검증합니다.</h2><p>브랜딩, 오프라인 전시·팝업, 마케팅, 디자인을 연결하는 기획 방식입니다. AI로 자료와 아이디어를 정리하고, 대시보드와 시뮬레이션으로 구체화합니다. 최종 방향과 실행은 디렉터가 판단합니다.</p></div><div class="ee-proof-grid">${cases.map(c=>`<article class="ee-proof-card"><img src="${c.image}" alt="${E(c.name)} 현장" loading="lazy"><div class="ee-proof-copy"><small>${c.client}</small><h3>${c.name}</h3><p>${c.text}</p><div class="ee-proof-tags">${c.tags.map(t=>`<span>${t}</span>`).join('')}</div>${proofLink(c.id,'기획 대시보드 보기','eeh-dashboard-'+c.id)}</div></article>`).join('')}</div></section>`;
 const a=q('.js-ai-about');if(a)a.innerHTML=`<section class="ee-ai-about"><span class="ee-eyebrow">AI-ASSISTED PLANNING</span><h2>아이디어를 실행 가능한 기획으로.</h2><p>AI를 활용해 복잡한 자료와 아이디어를 정리하고, 공간 시뮬레이션과 프로토타입으로 검토합니다. 용산 팝업과 CSES의 기획 대시보드에서 그 과정을 확인할 수 있습니다.</p><div class="ee-links">${cases.map(c=>proofLink(c.id,c.name,'eeh-dashboard-'+c.id)).join('')}</div></section>`;
}
function insertBeforeArchive(root,block){const next=q('.cs-next',root);if(next)next.before(block);else root.append(block)}
function addAI(root,w){
 const c=cases.find(x=>x.id===w.id);if(!c)return;
 const block=document.createElement('section');block.className='wrap ee-ai-case';block.id='eeh-ai-'+w.id;
 block.innerHTML=`<span class="ee-eyebrow">AI-ASSISTED PLANNING / PROJECT EVIDENCE</span><h2>기획을 정리하는 데서,<br>실제로 작동하는 데까지.</h2><p>${c.text} AI는 이 과정을 구조화하고 구현하는 도구로 활용했습니다.</p><div class="ee-ai-steps">${(w.id==='freeze-lab'?[['01 / STRUCTURE','자료를 실행 계획으로','브리프, 메일 기록, 제작 규격을 일정과 결정 로그로 정리.'],['02 / SIMULATE','공간을 먼저 검토','2D 배치와 3D 모델로 존 구성과 동선을 확인.'],['03 / OPERATE','현장 피드백을 반영','예약·참여 기록과 운영 변경 사항을 대시보드에 연결.']]:[['01 / STRUCTURE','개념을 체험 설계로','사회적가치 메시지를 문항과 보상, 고객 동선으로 정리.'],['02 / PROTOTYPE','흐름을 직접 작동시켜 보기','앱, 바코드, POS, 영수증을 하나의 참여 흐름으로 구현.'],['03 / ITERATE','결정과 변경을 기록','실행 항목과 결정 질문, 업데이트 이력을 한눈에 관리.']]).map(([n,t,d])=>`<div><small>${n}</small><h3>${t}</h3><p>${d}</p></div>`).join('')}</div><div class="ee-links">${proofLink(w.id,'기획 대시보드 열기','eeh-dashboard-'+w.id)}${external(w.id==='freeze-lab'?'fl/booth3d.html':'svm/booth3d.html','3D 공간 보기')}${w.id==='social-value-market'?external('svm/app.html','참여 앱 체험'):''}</div>`;
 const intro=q('.cs-intro',root);if(intro){block.classList.remove('wrap');intro.after(block)}else root.prepend(block);
 if(w.id==='freeze-lab'){
  const dos=q('.dos',root);if(dos){dos.id='eeh-dashboard-freeze-lab';dos.tabIndex=-1;}
 }else addCsesDashboard(root);
}
function addCsesDashboard(root){
 const section=document.createElement('section');section.className='wrap ee-dashboard';section.id='eeh-dashboard-social-value-market';section.tabIndex=-1;
 const tabs=['기획 개요','결정과 실행','체험 시스템'];
 const overview=`<h3>사회적가치를 장보기의 경험으로.</h3><p>2026.09.21–22 · COEX A홀 D-43 · 3×3m. 일상의 실천을 확인하고, 굿즈를 고르고, 영수증을 가져가는 체험입니다.</p><div class="ee-dashboard-stats"><div><b>91</b><span>대시보드 등록 업무</span></div><div><b>15</b><span>결정 질문</span></div><div><b>20</b><span>실천 문항</span></div><div><b>16</b><span>가치 굿즈</span></div></div><div class="ee-decision-list">${SVM.ideas.map(([t,d])=>`<details><summary>${E(t)}</summary><p>${E(d)}</p></details>`).join('')}</div>`;
 const timeline=`<h3>기획이 바뀐 이유까지 기록합니다.</h3><p>초기 협의 질문과 이후 확정안을 구분했습니다. 9월 5일 공간 기획, 9월 14일 보상 구조, 9월 15일 발주 확정을 거쳐 현장 운영으로 이어집니다.</p><ol class="ee-timeline">${SVM.timeline.map(([d,t,b])=>`<li><time>${E(d)}</time><div><h4>${E(t)}</h4><p>${E(b)}</p></div></li>`).join('')}</ol>`;
 const system=`<h3>앱에서 시작해, 가치 영수증으로 끝나는 체험.</h3><p><b>측정 결과와 체험 보상은 별개입니다.</b> 환경·돌봄·나눔·지역사회 4영역 × 5문항으로 나의 실천을 환산합니다. 참여자는 측정 금액과 관계없이 20,000 VALUE를 받아, 개당 10,000 VALUE의 굿즈를 최대 2개 고릅니다. 미사용 잔액은 기부로 표시됩니다.</p><p class="ee-fine">문항별 환산액은 사회적가치를 이해하기 위한 체험용 기준이며 CSES의 공식 SPC 측정값이 아닙니다.</p><div class="ee-system-grid">${SVM.system.map(([t,device,d])=>`<article><small>${E(device)}</small><h4>${E(t)}</h4><p>${E(d)}</p></article>`).join('')}</div><div class="ee-links">${external('svm/app.html','공개 데모 · 참여 앱')}${external('svm/booth3d.html','공간 3D 보기')}</div><p class="ee-fine">체험 앱은 공개 데모입니다. 실제 행사 참여나 현장 리워드 지급으로 연결되지 않습니다.</p>`;
 section.innerHTML=`<div class="ee-dashboard-head"><span class="ee-eyebrow">PROJECT DASHBOARD / CSES</span><h2>기획의 근거와 실행의 흐름.</h2><p>2026 소셜밸류마켓 원본 대시보드의 기획·일정·공간·제작 자료를 기준으로 정리했습니다. 2025 부스는 별도 프로젝트로 구분했습니다.</p><div class="ee-links">${external('https://eehstudio.github.io/eeh-studio/#s-home','원본 기획 대시보드')}${external('https://eehstudio.github.io/eeh-studio/#s-work','등록 업무 · 결정 질문')}${external('https://eehstudio.github.io/eeh-studio/#s-plan','공간 · 체험 설계')}${external('https://eehstudio.github.io/eeh-studio/#s-goods','굿즈 · 발주 자료')}${external('https://eehstudio.github.io/eeh-studio/#s-app','앱 · POS 개발 기록')}</div></div><div role="tablist" class="ee-dashboard-tabs" aria-label="CSES 기획 대시보드">${tabs.map((t,i)=>`<button type="button" role="tab" id="ee-cses-tab-${i}" aria-controls="ee-cses-panel-${i}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${t}</button>`).join('')}</div>${[overview,timeline,system].map((html,i)=>`<div class="ee-dashboard-panel" role="tabpanel" id="ee-cses-panel-${i}" aria-labelledby="ee-cses-tab-${i}" ${i?'hidden':''}>${html}</div>`).join('')}`;
 const sources=document.createElement('div');sources.className='ee-source-group';sources.innerHTML=`<h3>기획안에서 제작과 운영으로.</h3><div class="ee-system-grid"><article><small>SPACE / 09.05 PLAN</small><h4>IN → TEST → GIFT → COUNTER → OUT</h4><p>ㄴ자 개방형 3×3m 부스. TEST는 전면 우측, GIFT는 후면 좌측, COUNTER는 전면 좌측에 두고, 코너의 대형 영수증을 포토 포인트로 설계했습니다. 크레이트 41개와 벽면 5면은 제작 전 계획 수량입니다.</p></article><article><small>GRAPHIC / PRODUCTION</small><h4>공간과 손에 남는 디자인</h4><p>950×2,200mm 벽면 5면, 4개 카테고리 사인, 굿즈 16종의 키워드·행택 바코드, 안내 카드, 앱 화면과 80mm 영수증을 연결했습니다. 1,300개는 9월 15일 확정 발주 수량입니다.</p></article><article><small>ROLE / COLLABORATION</small><h4>기획·구현과 콘텐츠 승인</h4><p>EEH STUDIO는 전체 기획과 제작 관리, 공간·그래픽·리워드 디자인, 앱·POS 구현과 설치를 연결했습니다. CSES는 측정 문항과 기준 승인, 현장 운영 인력 및 공식 홍보를 담당했습니다.</p></article></div><p class="ee-fine">대시보드의 500명은 계획 단계 참여 목표입니다. 실제 방문 실적이나 발주 수량을 소진 실적으로 바꾸어 표기하지 않았습니다. 초기 질문지의 차등 보상·굿즈 가격안은 이후 확정안과 구분합니다.</p>`;section.append(sources);
 insertBeforeArchive(root,section);
 const buttons=qa('[role=tab]',section),panels=qa('[role=tabpanel]',section);
 const select=(i,focus=false)=>{buttons.forEach((b,j)=>{b.setAttribute('aria-selected',j===i);b.tabIndex=j===i?0:-1;panels[j].hidden=j!==i});if(focus)buttons[i].focus()};
 buttons.forEach((b,i)=>{b.onclick=()=>select(i);b.onkeydown=e=>{let n=i;if(e.key==='ArrowRight')n=(i+1)%buttons.length;else if(e.key==='ArrowLeft')n=(i+buttons.length-1)%buttons.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=buttons.length-1;else return;e.preventDefault();select(n,true)}});
}
function sourceLabel(l){if(l.type==='instagram_reel')return 'Instagram · 릴스';if(l.type==='instagram_post')return 'Instagram · 게시물';if(l.type==='official_content')return '공식 캠페인';return l.publisher||'관련 기사'}
function linkCard(l){return `<a class="ee-source-card" href="${E(l.url)}" target="_blank" rel="noopener noreferrer"><small>${E(sourceLabel(l))}${l.date?' · '+E(l.date):''}</small><h4>${E(l.title)}</h4><span>원문 보기 ↗</span></a>`}
function addSources(root,w){
 const key=w.id==='marketing'?'pokeallday':w.id==='cheongsinho'?'cheongsinho':null;if(!key)return;
 const data=window.EEH_CAMPAIGN_LINKS?.[key];if(!data)return;
 const groups=key==='pokeallday'?[
  ['비건포케 · 식목일',l=>/비건|식목일/.test(l.campaign)],
  ['그린포니 3기 · 지구의 날',l=>l.campaign==='그린포니 3기'],
  ['스윗올데이 · 그릭요거트',l=>/그릭|스윗/.test(l.campaign)],
  ['포케트럭',l=>l.campaign.includes('포케트럭')]
 ]:[['청신호 폰서트',()=>true]];
 const section=document.createElement('section');section.className='wrap ee-evidence';section.id='eeh-sources-'+w.id;
 section.innerHTML=`<span class="ee-eyebrow">PRESS & SOCIAL / ${key==='pokeallday'?'POKE ALL DAY':'청신호 명동'}</span><h2>캠페인이 밖으로 이어진 기록.</h2><p>해당 캠페인의 기사와 게시물을 원문으로 연결했습니다.</p>${groups.map(([name,match])=>`<div class="ee-source-group"><h3>${name}</h3><div class="ee-source-grid">${data.links.filter(match).map(linkCard).join('')}</div></div>`).join('')}<div class="ee-links">${external(data.profile,key==='pokeallday'?'포케올데이 공식 Instagram':'청신호 명동 공식 Instagram')}${key==='cheongsinho'?external('https://blog.naver.com/cheongsinho','청신호 공식 블로그'):''}</div><p class="ee-fine">${key==='pokeallday'?'공식 뉴스룸에 재게시된 기사 날짜와 캠페인 진행일은 다를 수 있습니다. Instagram은 공개 검색에서 캠페인 내용을 대조한 링크입니다.':'폰서트는 원본 프로그램 기준 2021.09.13–11.26이며, 기사에는 10–11월 회차가 소개되어 있습니다. Instagram은 공식 계정 링크입니다.'}</p>`;
 insertBeforeArchive(root,section);
 const overview=q('.xs-lead',root)||q('.lite-status',root);if(overview){const a=document.createElement('a');a.className='ee-source-jump';a.href='#/work/'+w.id;a.dataset.eehJump=section.id;a.textContent='캠페인 기사·게시물 모아 보기 ↗';overview.after(a)}
 // Attach direct source buttons next to the campaign records as well as the index.
 qa('.xs',root).forEach(s=>{
  const title=q('h2,h3',s)?.textContent||'';let links=[];
  if(key==='pokeallday'){
   if(title.includes('비건포케 히스토리'))links=data.links.filter(l=>l.campaign==='비건포케 출시');
   else if(title.includes('식목일'))links=data.links.filter(l=>l.campaign.includes('식목일'));
   else if(title.includes('그린포니'))links=data.links.filter(l=>l.campaign==='그린포니 3기');
   else if(title.includes('신메뉴 그릭요거트'))links=data.links.filter(l=>l.campaign==='그릭요거트·스윗올데이'||l.campaign==='스윗올데이');
   else if(title.includes('스윗올데이 댓글'))links=data.links.filter(l=>l.campaign==='스윗올데이 댓글 이벤트');
  }else if(title.includes('폰서트'))links=data.links;
  if(links.length)s.insertAdjacentHTML('beforeend',`<div class="ee-links ee-inline-sources">${links.map(l=>external(l.url,sourceLabel(l))).join('')}</div>`);
 });
}
function addLifemealMarketing(root,w){
 if(!['freeze-lab','lifemeal-yeonnam'].includes(w.id))return;
 const fl=w.id==='freeze-lab';const b=document.createElement('section');b.className='wrap ee-evidence';b.id='eeh-marketing-'+w.id;
 const rows=fl?[
 ['ACQUISITION','방문 전 · 예약과 기대 만들기','SNS 콘텐츠와 사전예약 캠페인, 인스타그램 댓글에서 예약 링크로 이어지는 안내, 카카오 채널과 광고 집행 계획을 하나의 오픈 일정으로 정리했습니다.'],
 ['ENGAGEMENT','현장 · 방문을 참여로 바꾸기','웰컴 QR과 미션, 팔로우·예약·리뷰 리워드를 설계했습니다. 동결건조 연구원이라는 역할을 주어 제품 설명이 체험과 콘텐츠로 이어지도록 했습니다.'],
 ['RETENTION','방문 후 · 구매와 관계 이어가기','리뷰 혜택과 후속 쿠폰, 채널 연결을 운영하고 예약 방문율과 주차별 매출을 함께 확인했습니다. 현장 피드백으로 가격표와 시식 동선을 수정했습니다.']]:[
 ['ACQUISITION','첫 단독 팝업을 알리는 캠페인','연남동 팔시보 스토어의 체험형 팝업을 사전예약과 보도 자료로 알렸습니다. 공개 기사에서 사전예약 이틀 만에 1,000명 돌파가 확인됩니다.'],
 ['ENGAGEMENT','진단을 제품 경험으로','WBTI 웰니스 유형 진단 → 제품 추천 카드 → 웰니스 오마카세 시식으로 연결했습니다. 방문자의 관심에 맞춰 제품의 성분과 섭취 방법을 경험하게 했습니다.'],
 ['RETENTION','채널과 리뷰로 후속 접점 만들기','카카오 채널 친구 추가 럭키드로우, 스토어 쿠폰과 체험 키트, 인증 리뷰 혜택을 기획했습니다. 팝업이 끝난 뒤에도 브랜드와 만날 접점을 남겼습니다.']];
 b.innerHTML=`<span class="ee-eyebrow">MARKETING / LIFEMEAL</span><h2>방문을 만들고,<br>참여와 다음 구매로 연결합니다.</h2><div class="ee-ai-steps">${rows.map(([n,t,d])=>`<div><small>${n}</small><h3>${t}</h3><p>${d}</p></div>`).join('')}</div><p class="ee-fine">원본 마케팅·팝업 기획안과 운영 기록 기준. 상세 페이지의 공개 기사와 결과 자료에서 확인할 수 있습니다.</p>`;insertBeforeArchive(root,b);
}
function augment(root,w){
 if(q('.ee-ai-case,.ee-evidence',root))return;
 addAI(root,w);addSources(root,w);addLifemealMarketing(root,w);
 if(w.id==='design-archive'){
  const b=document.createElement('section');b.className='wrap ee-evidence';b.innerHTML=`<span class="ee-eyebrow">PRESS / SPACE COR · 2021.01</span><h2>되찾을 것들에 대하여.</h2><p>스페이스 코르에서 진행한 전시와 황윤희 디자이너의 작업을 소개한 보도입니다.</p><div class="ee-links">${external('https://www.kmib.co.kr/article/view.asp?arcid=0924175009','국민일보 · 전시 기사')}</div>`;insertBeforeArchive(root,b);
 }
}
document.addEventListener('click',e=>{const a=e.target.closest('[data-eeh-jump]');if(!a)return;const id=a.dataset.eehJump;setTimeout(()=>{const target=document.getElementById(id);if(target){target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});if(!target.hasAttribute('tabindex'))target.tabIndex=-1;target.focus({preventScroll:true})}},120)});
window.EEHEditorial={augment};home();
})();
