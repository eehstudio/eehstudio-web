/* Original plans, presentation drawings and clearly identified concept imagery. */
(() => {
  const data = window.EEH_SPATIAL_DATA.projects;
  const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const link = (url, label) => `<a href="${E(url)}" target="_blank" rel="noopener noreferrer">${E(label)} <span aria-hidden="true">↗</span></a>`;
  function visual(a,w,i){
    if(a.model)return `<div class="spatial-live-host"><img class="spatial-poster" src="${E(a.src)}" alt="${E(w.title)} 도면 미리보기"><button type="button" class="spatial-launch" data-spatial-launch="${E(a.model)}" data-model-title="${E(w.title)} 인터랙티브 3D">3D 직접 돌려보기 <span>드래그 회전 · 확대 · 시점 선택</span></button></div>`;
    return `<figure class="spatial-view"><span class="spatial-kind">${E(a.kind)}</span><img src="${E(a.drawing||a.src)}" alt="${E(w.title+' · '+a.label)}" decoding="async" ${i?'loading="lazy"':''}></figure>`;
  }

  function hero(w) {
    const p = data[w.id];
    if (!p?.assets.length) return '';
    const id = 'study-' + w.id;
    return `<section class="spatial-study" aria-label="${E(w.title)} 공간·디자인 프레젠테이션">
      <div class="spatial-head"><span>DESIGN STUDY / ${String(p.assets.length).padStart(2,'0')} VIEWS</span><p>기획을, 눈앞의 장면으로.</p></div>
      <div class="spatial-tabs" role="tablist" aria-label="도면과 이미지 선택">${p.assets.map((a,i) => `<button type="button" role="tab" data-spatial-tab="${i}" id="${id}-tab-${i}" aria-controls="${id}-panel-${i}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${E(a.label)}</button>`).join('')}</div>
      ${p.assets.map((a,i) => `<div class="spatial-panel" role="tabpanel" id="${id}-panel-${i}" aria-labelledby="${id}-tab-${i}" ${i?'hidden':''}>
        ${visual(a,w,i)}
        <div class="spatial-caption"><p>${E(a.caption)}</p><div>${link(a.model||a.drawing||a.src,a.model?'3D 크게 열기':'크게 보기')}${a.drawing?link(a.drawing,'SVG 도면 원본'):''}</div></div>
      </div>`).join('')}
    </section>`;
  }

  function client(w) {
    const c = data[w.id]?.client;
    if (!c) return '';
    return `<section class="spatial-client" aria-label="클라이언트와 프로젝트 배경"><div><span class="spatial-eyebrow">CLIENT & CONTEXT</span><small>${E(c.relation)}</small><h2>${E(c.name)}</h2></div><div><p>${E(c.intro)}</p>${c.links.length?`<nav class="spatial-links" aria-label="${E(c.name)} 공식 채널">${c.links.map(l=>link(l.url,l.label)).join('')}</nav>`:''}${w.id==='red-sky'?`<p class="spatial-source-note">이 페이지는 2025년 8월 29일을 기준으로 작성한 <b>Red Sky 초기 제안</b>입니다. 별도로 연결한 공식 행사 안내는 2025년 11월 21일 열린 <b>Colors of Haneul</b>로, 초기안과 이후 공개된 행사의 제목·일정이 다릅니다.</p>`:''}</div></section>`;
  }

  function apply(works, reel, why) {
    const red=works.find(w=>w.id==='red-sky');
    if (red) {
      red.meta[1]=['Initial proposal','2025.08.29 · Red Sky'];
      red.summary='조하늘 첫 팬미팅의 초기 기획 제안. 감정 카드와 사전 설문에서 토크·공연·포토 타임까지, 팬의 참여가 다음 프로그램으로 이어지도록 설계했습니다.';
      const program=red.sections.find(s=>s.label==='Program');
      program.h='팬이 남긴 한 장의 카드가, 다음 프로그램으로.';
      program.items[0].d='다섯 종류의 날씨 카드 중 한 장을 받습니다. 앞면은 프로그램 중 호명과 참여에, 뒷면은 기대와 질문을 적는 데 사용합니다.';
      program.items[2].d='사전 질문과 현장 감정 카드를 기상캐스터 콘셉트의 영상·Q&A로 연결합니다. 팬들과 감정 기상도를 완성한 뒤 감성 발라드 무대로 호흡을 바꿉니다.';
      program.items[3].d='사전 설문에서 모은 고민을 소규모 대화로 이어 갑니다. 팬의 이야기에 조하늘이 짧은 문장으로 답하며 온라인 팬과의 거리를 좁힙니다.';
      program.items[4].d='퀴즈, 밸런스 게임, TMI 토크와 팬 참여 퍼포먼스. 릴스형 댄스 무대를 더해 대화에서 공연으로 다시 에너지를 높입니다.';
      program.items[5].d='노을빛 포토존에서 1:1 사진과 사인, 단체 사진으로 마무리합니다. 순서별 대기 동선을 나눠 마지막 교감까지 편안하게 이어지도록 기획했습니다.';
      red.sections.splice(red.sections.indexOf(program)+1,0,{
        t:'cards',label:'Participation design',h:'입장 전, 공연 중, 집에 돌아간 뒤까지.',cols:3,items:[
          {k:'BEFORE / LISTEN',t:'팬의 질문으로 시작',d:'사전 설문으로 기대와 관심사를 수집하고, 입장할 때 적는 감정 카드로 당일의 마음을 더합니다.'},
          {k:'DURING / CONNECT',t:'한 장으로 여러 번 참여',d:'날씨 카드로 팬을 호명하고, 카드 뒷면의 문장을 감정 예보와 Cloud Lounge 대화로 연결합니다.'},
          {k:'AFTER / REMEMBER',t:'답변과 사진을 남기기',d:'팬에게 써 주는 문장과 마지막 사진이 만남의 기억으로 남습니다. 감정 카드 5종과 포토카드 3종은 하나의 기록 세트로 제안했습니다.'}
        ]
      });
      const details=red.sections.find(s=>s.label==='Special & Goods');
      details.label='Experience details';details.h='머무르고, 나누고, 기억하는 디테일';
      details.items=details.items.filter(x=>x[0]!=='Cup sleeve');
    }
    const cafeWork=works.find(w=>w.id==='recette-booth');
    if(cafeWork){
      const role=cafeWork.sections.find(s=>s.t==='role');
      role.items.push(['Spatial source','원본 부스 렌더 DITTE · 기존 기획·그래픽을 바탕으로 공간 프레젠테이션 재구성']);
    }
  }

  function select(tab, index, focus=false) {
    const study=tab.closest('.spatial-study');
    const tabs=Array.from(study.querySelectorAll('[data-spatial-tab]'));
    const panels=Array.from(study.querySelectorAll('.spatial-panel'));
    tabs.forEach((b,i)=>{b.setAttribute('aria-selected',i===index);b.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;panels[i].querySelector('iframe')?.contentWindow.postMessage({type:'eeh-viewer-active',active:i===index},location.origin)});
    if(focus)tabs[index].focus();
  }
  document.addEventListener('click',e=>{
    const launch=e.target.closest('[data-spatial-launch]');
    if(launch){
      const host=launch.closest('.spatial-live-host');
      if(!host || host.querySelector('iframe'))return;
      const frame=document.createElement('iframe');frame.src=launch.dataset.spatialLaunch;frame.title=launch.dataset.modelTitle||'직접 회전하는 3D 모델';frame.allowFullscreen=true;frame.className='spatial-live';
      host.append(frame);host.classList.add('is-live');launch.hidden=true;frame.tabIndex=0;frame.focus();return;
    }
    const tab=e.target.closest('[data-spatial-tab]');
    if(tab)select(tab,Number(tab.dataset.spatialTab));
  });
  window.addEventListener('message',e=>{
    if(e.origin!==location.origin || e.data?.type!=='eeh-model-ready')return;
    document.querySelectorAll('.spatial-live-host').forEach(host=>{
      const frame=host.querySelector('iframe');
      if(frame?.contentWindow===e.source && host.dataset.focusZone)frame.contentWindow.postMessage({type:'eeh-focus-zone',zone:host.dataset.focusZone},location.origin);
    });
  });
  document.addEventListener('keydown',e=>{
    const tab=e.target.closest('[data-spatial-tab]');if(!tab)return;
    const n=tab.closest('.spatial-study').querySelectorAll('[data-spatial-tab]').length;
    let i=Number(tab.dataset.spatialTab);
    if(e.key==='ArrowRight')i=(i+1)%n;else if(e.key==='ArrowLeft')i=(i+n-1)%n;
    else if(e.key==='Home')i=0;else if(e.key==='End')i=n-1;else return;
    e.preventDefault();select(tab,i,true);
  });
  window.EEHSpatial={hero,client,apply};
})();
