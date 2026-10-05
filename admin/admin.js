(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone = x => JSON.parse(JSON.stringify(x));
  const labels = {overview:'대시보드', project:'프로젝트', note:'노트 · 블로그', site:'사이트 공통', backup:'백업'};
  const types = {project:'PROJECT', note:'JOURNAL', site:'SITE SETTINGS'};
  const categories = {brand:'브랜딩', space:'오프라인 전시·팝업', marketing:'마케팅', design:'디자인'};
  const paths = {
    dashboard:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    folder:'M3 7V5h6l2 2h10v13H3z', file:'M14 2H5v20h14V7z M14 2v6h5 M8 12h8 M8 16h6',
    sliders:'M4 7h16 M4 17h16 M8 4v6 M16 14v6', image:'M3 3h18v18H3z M3 16l5-5 5 5 3-3 5 5 M16 7h.01',
    download:'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5', external:'M14 3h7v7 M21 3l-11 11 M10 3H3v18h18v-7',
    search:'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0', plus:'M12 5v14 M5 12h14',
    close:'M6 6l12 12 M18 6L6 18', chevron:'M9 5l7 7-7 7', menu:'M4 6h16 M4 12h16 M4 18h16',
    shield:'M12 2l8 3v6c0 6-8 11-8 11S4 17 4 11V5z M8 11l3 3 5-5', cursor:'M4 3l6 17 3-7 7-3z',
    monitor:'M3 3h18v14H3z M8 21h8 M12 17v4', refresh:'M20 7a9 9 0 1 0 1 8 M20 2v6h-6',
    check:'M5 12l4 4L19 6', clock:'M12 8v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    edit:'M14 5l5 5 M3 21l5-1L21 7l-5-5L3 15z', layers:'M12 2l10 6-10 6L2 8z M2 12l10 6 10-6 M2 16l10 6 10-6'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.file}"/></svg>`;
  function icons(root=document) { root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML=icon(el.dataset.icon); el.removeAttribute('data-icon'); }); }
  let entries=[], view='overview', kind='project', entry=null, dirty=false, busy=false, picked=null, mode='text';
  let assetCallback=null, assets=[], assetLimit=32, currentTab='info', returnFocus=null, initialized=false;
  let route={view:'overview',key:null}, commandIndex=0;
  const drawer=$('#workspace');
  icons();

  function toast(text, error=false) {
    const el=$('#toast'); const host=$('#assets').open?$('#assets'):drawer.open?drawer:document.body; host.append(el); el.textContent=text; el.hidden=false; el.classList.toggle('is-error',error);
    clearTimeout(toast.timer); toast.timer=setTimeout(() => el.hidden=true, 5500);
  }
  async function api(path, options={}) {
    let response;
    try { response=await fetch('/api/cms/'+path,{...options,headers:options.body instanceof FormData?{}:{'Content-Type':'application/json'}}); }
    catch { throw new Error('연결을 확인해 주세요. 수정 내용은 이 화면에 그대로 남아 있습니다.'); }
    let data;
    try { data=await response.json(); } catch { throw new Error('응답을 읽지 못했습니다. 연결을 확인한 뒤 다시 시도해 주세요.'); }
    if (!response.ok) throw Object.assign(new Error(data.error||'요청하지 못했습니다.'),{status:response.status});
    return data;
  }
  const entryPath = () => 'entry/'+encodeURIComponent(entry.key);
  function publication(e) {
    if (e.published?.hidden) return {value:'hidden',label:'게시 중단'};
    if (!e.published) return {value:'draft',label:'비공개 초안'};
    if (e.version!==e.publishedVersion) return {value:'changed',label:'미게시 수정'};
    return {value:'published',label:'공개'};
  }
  const badge = e => { const s=publication(e); return `<span class="badge ${s.value}">${s.label}</span>`; };
  const date = value => value ? new Date(value).toLocaleDateString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}) : '기본 콘텐츠';
  function updateEntry(saved) {
    const index=entries.findIndex(e=>e.key===saved.key);
    if(index<0) entries.push(clone(saved)); else entries[index]=clone(saved);
    render();
  }
  function state() {
    if (!entry) return;
    $('#doc-title').textContent=entry.doc.title||'제목 없는 문서';
    $('#state').textContent=dirty?'저장하지 않은 수정이 있어요':entry.published?.hidden?'게시 중단 · 저장된 내용은 유지됩니다':!entry.published?'비공개 초안 · 아직 게시되지 않았어요':entry.version===entry.publishedVersion?'게시 완료 · 사이트에 반영됐어요':'임시 저장됨 · 공개 사이트는 이전 내용 유지';
    $('#state').classList.toggle('unsaved',dirty);
    $('#version-label').textContent=entry.version?'v'+entry.version:'새 저장본';
    $('#save').textContent=busy?'처리 중…':'임시 저장';
    $('#unpublish').hidden=entry.doc.kind==='site'||!entry.published||!!entry.published.hidden;
    document.title=(dirty?'● ':'')+(entry.doc.title||'문서')+' · EEH 관리자';
    const missing=entry.doc.kind==='site'?[]:[['title','제목'],['summary','소개'],['cover','썸네일']].filter(([key])=>!entry.doc[key]?.trim()).map(([,label])=>label);
    $('#completion').innerHTML=missing.length?`${icon('edit')}<span>게시 전 확인 <strong>${E(missing.join(' · '))}</strong></span>`:`${icon('check')}<span>기본 정보가 준비됐어요</span>`;
  }
  function mark() { dirty=true; state(); }
  function resetFilters() { $('#search').value=''; $('#status-filter').value='all'; $('#category-filter').value='all'; $('#sort').value='recent'; list(); }
  function filteredEntries() {
    const q=$('#search').value.trim().toLowerCase(), status=$('#status-filter').value, category=$('#category-filter').value;
    return entries.filter(e => e.doc.kind===kind && [e.doc.title,e.doc.client,e.doc.summary,(e.doc.tags||[]).join(' ')].join(' ').toLowerCase().includes(q))
      .filter(e=>status==='all'||publication(e).value===status||(status==='published'&&publication(e).value==='changed'))
      .filter(e=>kind!=='project'||category==='all'||(e.doc.practices||[e.doc.div]).includes(category))
      .sort((a,b)=>$('#sort').value==='title'?a.doc.title.localeCompare(b.doc.title,'ko'):String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
  }
  function thumb(e) { return e.doc.cover?`<img class="row-thumb" src="${E(e.doc.cover)}" alt="" loading="lazy">`:`<span class="row-thumb no-image">${icon(e.doc.kind==='site'?'sliders':'file')}</span>`; }
  function list() {
    const found=filteredEntries();
    $('#list').innerHTML=found.map(e=>`<tr><td><button class="entry-title" data-key="${E(e.key)}">${thumb(e)}<span><strong>${E(e.doc.title)}</strong><small>${E(e.doc.client||e.doc.summary||'내용을 채워 주세요')}</small></span></button></td><td><span class="category-text">${E(e.doc.kind==='project'?(e.doc.practices||[e.doc.div]).map(x=>categories[x]||x).join(' · '):e.doc.kind==='note'?e.doc.tag||'Journal':'공통 정보')}</span></td><td>${badge(e)}</td><td class="date-cell">${E(date(e.updatedAt))}</td><td><button class="icon-button row-edit" data-key="${E(e.key)}" aria-label="${E(e.doc.title)} 편집">${icon('edit')}</button></td></tr>`).join('');
    $('#list-empty').hidden=found.length>0; $('.table-wrap').hidden=found.length===0;
    $('#result-count').textContent=`총 ${entries.filter(e=>e.doc.kind===kind).length}개 중 ${found.length}개`;
  }
  function overview() {
    const content=entries.filter(e=>e.doc.kind!=='site');
    const stats=[['프로젝트',entries.filter(e=>e.doc.kind==='project').length,'folder','project'],['노트 · 블로그',entries.filter(e=>e.doc.kind==='note').length,'file','note'],['공개 콘텐츠',content.filter(e=>e.published&&!e.published.hidden).length,'layers','published'],['게시 전 확인',content.filter(e=>['draft','changed'].includes(publication(e).value)).length,'edit','drafts']];
    $('#stats').innerHTML=stats.map(([name,total,symbol,target])=>{const linked=['project','note'].includes(target);return `<${linked?'button':'div'} class="stat-card" ${linked?`data-stat="${target}"`:''}><span class="stat-label">${name}<span class="stat-icon">${icon(symbol)}</span></span><strong>${total}<small>개</small></strong><span class="stat-link">${linked?'콘텐츠 확인 '+icon('chevron'):target==='published'?'현재 공개된 프로젝트와 노트':'비공개 초안과 미게시 수정'}</span></${linked?'button':'div'}>`;}).join('');
    const recent=[...entries].filter(e=>e.updatedAt).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0,5);
    $('#recent-list').innerHTML=recent.length?recent.map(e=>`<button class="recent-entry" data-key="${E(e.key)}">${thumb(e)}<span class="recent-title"><strong>${E(e.doc.title)}</strong><small>${labels[e.doc.kind]} · ${date(e.updatedAt)}</small></span>${badge(e)}${icon('chevron')}</button>`).join(''):`<div class="empty-state compact">${icon('clock')}<h3>첫 수정 기록을 기다리고 있어요</h3><p>프로젝트나 노트를 저장하면 여기에 표시됩니다.</p><button data-view="project">프로젝트 살펴보기</button></div>`;
  }
  function render() {
    $('#project-count').textContent=entries.filter(e=>e.doc.kind==='project').length;
    $('#note-count').textContent=entries.filter(e=>e.doc.kind==='note').length;
    overview(); list();
  }
  async function load() { entries=(await api('entries')).entries; render(); }
  function showView(next) {
    view=labels[next]?next:'overview'; if(['project','note','site'].includes(view)) kind=view;
    $('#overview').hidden=view!=='overview'; $('#content-view').hidden=!['project','note','site'].includes(view); $('#backup-view').hidden=view!=='backup';
    $$('.nav-item[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view); if(b.dataset.view===view)b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');});
    $('#breadcrumb').textContent=labels[view]; $('#view-title').textContent=labels[kind];
    $('#view-eyebrow').textContent=kind==='site'?'SITE SETTINGS':kind==='note'?'JOURNAL':'PORTFOLIO';
    $('#view-description').textContent={project:'작업의 이야기와 이미지를 한곳에서 관리하세요.',note:'과정과 생각을 기록하고, 프로젝트와 연결하세요.',site:'사이트의 연락처와 공통 정보를 관리하세요.'}[kind];
    $('#new').hidden=kind==='site'; $('#new span').textContent=kind==='note'?'새 노트':'새 프로젝트';
    $('#category-filter').hidden=kind!=='project'; $('#title-column').textContent=labels[kind]; $('#category-column').textContent=kind==='project'?'분야':'분류';
    $('#search').placeholder=kind==='project'?'제목·클라이언트 검색':'제목·내용 검색';
    closeMenu(); list(); if(!entry)document.title=labels[view]+' · EEH 관리자';
  }
  function routeUrl(next) { return '#'+next.view+(next.key?'/'+encodeURIComponent(next.key):''); }
  function readRoute() { const [v,key]=location.hash.slice(1).split('/'); let decoded=null;try{decoded=key?decodeURIComponent(key):null}catch{} return {view:labels[v]?v:'overview',key:decoded}; }
  function recordRoute(next, replace=false) { route=next; window.history[replace?'replaceState':'pushState']({eehAdmin:true,...next},'',routeUrl(next)); }
  function discardAllowed(message='저장하지 않은 수정이 있습니다. 수정을 버리고 닫을까요?') { return !dirty||confirm(message); }
  function closeEditorNow() {
    if($('#assets').open)$('#assets').close();
    if($('#command').open)$('#command').close();
    assetCallback=null;
    if(drawer.open) drawer.close(); entry=null; dirty=false; picked=null; $('#frame-wrap').replaceChildren(); drawer.classList.remove('is-preview');
    document.title=labels[view]+' · EEH 관리자';
    // Saving re-renders document rows, so recover the opener by its stable key.
    const focusTarget=returnFocus?.isConnected?returnFocus:
      $$(view==='overview'?'#recent-list [data-key]':'#list [data-key]').find(el=>el.dataset.key===returnFocus?.dataset.key);
    (focusTarget||$('#main')).focus();
  }
  function closeEditor() { if(busy||!discardAllowed())return; closeEditorNow(); recordRoute({view,key:null}); }
  function navigate(next) {
    if(busy||!discardAllowed('저장하지 않은 수정이 있습니다. 수정을 버리고 이동할까요?'))return;
    if(drawer.open)closeEditorNow(); resetFilters(); showView(next); recordRoute({view,key:null});
  }
  window.addEventListener('popstate',async()=>{
    if(!initialized)return;
    const next=readRoute();
    if(busy||!discardAllowed('저장하지 않은 수정이 있습니다. 수정을 버리고 이전 화면으로 이동할까요?')){recordRoute(route);return;}
    closeEditorNow(); resetFilters(); showView(next.view); route=next;
    if(next.key)await openEntry(next.key,false);
  });
  function field(key,label,value,multi=false) {
    return `<label class="field"><span>${label}</span>${multi?`<textarea data-field="${key}" rows="4">${E(value)}</textarea>`:`<input data-field="${key}" value="${E(value)}">`}</label>`;
  }
  function info() {
    const d=entry.doc; let html='';
    if(d.kind==='site') {
      html=`<div class="section-intro"><h3>연락처와 공통 정보</h3><p>사이트에 표시되는 연락처를 관리하세요.</p></div>`+field('email','문의 이메일',d.email)+field('instagram','Instagram 계정 · @ 제외',d.instagram)+field('phone','전화번호',d.phone)+field('address','주소',d.address)+field('profilePdf','회사소개서 PDF 주소',d.profilePdf)+`<p class="inline-help">소개 문구와 서비스 설명은 ‘화면에서 수정’에서 홈페이지를 보며 바꿀 수 있어요.</p>`;
    } else {
      html=`<div class="section-intro"><h3>${d.kind==='project'?'프로젝트':'노트'} 기본 정보</h3><p>목록에서 보일 제목과 소개를 입력하세요.</p></div>`+field('title','제목',d.title)+field('summary','소개 · 요약',d.summary,true);
      if(d.kind==='project') html+=`<div class="field-row">${field('client','클라이언트',d.client)}${field('year','연도',d.year)}</div><div class="field-row"><label class="field"><span>대표 분야</span><select data-field="div">${Object.entries(categories).map(([v,t])=>`<option value="${v}" ${d.div===v?'selected':''}>${t}</option>`).join('')}</select></label><label class="field"><span>작업 상태</span><select data-field="status">${[['Built','실행 프로젝트'],['Proposal','제안'],['System','브랜드 시스템'],['Archive','아카이브'],['Plan','계획']].map(([v,t])=>`<option value="${v}" ${d.status===v?'selected':''}>${t}</option>`).join('')}</select></label></div>`+field('tags','태그 · 쉼표로 구분',(d.tags||[]).join(', '));
      else html+=`<div class="field-row">${field('date','표시 날짜',d.date)}${field('tag','카테고리',d.tag)}</div><label class="field"><span>연결할 프로젝트</span><select data-field="case"><option value="">선택하지 않음</option>${entries.filter(x=>x.doc.kind==='project').map(x=>`<option value="${E(x.doc.id)}" ${d.case===x.doc.id?'selected':''}>${E(x.doc.title)}</option>`).join('')}</select></label>`;
      html+=`<div class="field cover-field"><span>썸네일 이미지</span><div class="cover-layout">${d.cover?`<img class="cover" src="${E(d.cover)}" alt="썸네일 미리보기">`:'<span class="cover no-image">이미지 없음</span>'}<div><button id="pick-cover">${icon('image')} 이미지 선택·업로드</button><small>상세 페이지의 도면과 3D는 유지됩니다.</small></div></div><input data-field="cover" value="${E(d.cover)}" aria-label="썸네일 주소" placeholder="이미지 주소"></div>`;
      if(d.kind==='project')html+=`<fieldset class="field practices"><legend>함께 노출할 분야</legend><p>실제 수행한 분야를 선택하세요. 대표 분야는 항상 포함됩니다.</p><div>${Object.entries(categories).map(([v,t])=>`<label><input type="checkbox" data-practice="${v}" ${(d.practices||[d.div]).includes(v)||d.div===v?'checked':''} ${d.div===v?'disabled':''}><span>${t}</span></label>`).join('')}</div></fieldset>`;
    }
    $('#info').innerHTML=html; $('[data-tab="blocks"]').hidden=d.kind==='site';
    $('#blocks-help').textContent=d.kind==='note'?'제목·문단·사진·링크를 순서대로 작성하세요.':'새 내용을 블록으로 추가하세요. 기존 상세 내용은 ‘화면에서 수정’에서 고칠 수 있어요.';
    $('#pick-cover')?.addEventListener('click',()=>chooseAsset(url=>{entry.doc.cover=url;mark();info();}));
  }
  function blocks() {
    const names={p:'문단',h2:'제목',blockquote:'인용',image:'이미지',link:'링크'}, xs=entry.doc.blocks;
    $('#block-list').innerHTML=xs.length?xs.map((b,i)=>`<div class="block"><div class="block-head"><span><b>${String(i+1).padStart(2,'0')}</b> ${names[b.type]}</span><div><button data-move="-1" data-index="${i}" aria-label="${i+1}번 블록 위로 이동" ${i===0?'disabled':''}>↑</button><button data-move="1" data-index="${i}" aria-label="${i+1}번 블록 아래로 이동" ${i===xs.length-1?'disabled':''}>↓</button><button data-remove="${i}" aria-label="${i+1}번 블록 삭제">${icon('close')}</button></div></div>${b.type==='image'&&b.url?`<img class="cover" src="${E(b.url)}" alt="${E(b.text)}">`:''}<label class="sr-only" for="block-text-${i}">${i+1}번 ${names[b.type]} ${b.type==='image'?'이미지 설명':'내용'}</label><textarea id="block-text-${i}" data-block="${i}" data-prop="text" placeholder="${b.type==='image'?'이미지 설명':b.type==='link'?'링크에 표시할 이름':'내용을 입력하세요'}">${E(b.text)}</textarea>${['image','link'].includes(b.type)?`<label class="sr-only" for="block-url-${i}">${i+1}번 블록 주소</label><input id="block-url-${i}" data-block="${i}" data-prop="url" value="${E(b.url)}" placeholder="주소">${b.type==='image'?`<button class="small-action" data-block-image="${i}">${icon('image')} 이미지 선택·업로드</button>`:''}`:''}</div>`).join(''):`<div class="empty-state compact">${icon('layers')}<h3>첫 블록을 추가해 보세요</h3><p>문단, 제목, 이미지 등 필요한 순서대로 구성하세요.</p></div>`;
  }
  function tab(next) {
    if(!entry||busy)return;
    currentTab=next;
    $$('[data-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.tab===next);if(b.dataset.tab===next)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    $$('.tab-pane').forEach(el=>el.hidden=el.id!==next);
    const previewing=next==='pick'; drawer.classList.toggle('is-preview',previewing); $('.preview-pane').hidden=!previewing;
    if(next==='history')history();
    if(previewing&&!$('#frame-wrap iframe'))showPreviewPlaceholder();
  }
  function showPreviewPlaceholder() {
    $('#frame-wrap').innerHTML=`<div class="preview-empty">${icon('monitor')}<h3>페이지에서 바로 다듬어 보세요</h3><p>${dirty||!entry.version?'현재 내용을 임시 저장한 뒤 미리보기를 엽니다.':'저장된 임시본으로 미리보기를 엽니다.'}<br>공개 사이트는 바뀌지 않습니다.</p><button class="primary" id="start-preview">${dirty||!entry.version?'임시 저장하고 미리보기':'미리보기 열기'}</button></div>`;
    $('#start-preview').onclick=()=>action(preview);
  }
  function setEntry(saved) {
    entry=clone(saved);entry.doc.blocks??=[];entry.doc.text??={};entry.doc.images??={};entry.doc.links??={};
    dirty=false;picked=null;$('#conflict').hidden=true;
    $('#kind-label').textContent=types[entry.doc.kind];$('#frame-wrap').replaceChildren();$('#frame-wrap').classList.remove('mobile');$('#mobile-preview').setAttribute('aria-pressed','false');$('#mobile-preview span').textContent='모바일 보기';
    $('#picked').innerHTML=`<div class="inspector-empty">${icon('cursor')}<p>페이지의 요소를 선택하면<br>여기서 수정할 수 있어요.</p></div>`;
    info();blocks();currentTab='info';state();
    // Restores can arrive inside an action; selecting the initial tab does not issue requests.
    $$('.tab-pane').forEach(el=>el.hidden=el.id!=='info');$$('[data-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.tab==='info');if(b.dataset.tab==='info')b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    drawer.classList.remove('is-preview');$('.preview-pane').hidden=true;
    if(!drawer.open){returnFocus=document.activeElement;drawer.showModal();}
    $('.editor-grid').scrollTop=0;$('#close-editor').focus();
  }
  async function openEntry(key, push=true) {
    if(busy||!discardAllowed('저장하지 않은 수정이 있습니다. 수정을 버리고 다른 문서로 이동할까요?'))return;
    await action(async()=>{const saved=await api('entry/'+encodeURIComponent(key));setEntry(saved);if(push)recordRoute({view,key});});
    if(drawer.open)$('#close-editor').focus();
  }
  async function save() {
    if(!entry)return;
    const saved=await api(entryPath(),{method:'PUT',body:JSON.stringify({doc:clone(entry.doc),version:entry.version})});
    entry=saved;dirty=false;$('#conflict').hidden=true;state();updateEntry(saved);toast('임시 저장했어요. 공개 사이트는 유지됩니다.');return saved;
  }
  async function preview() {
    if(!entry)return;
    if(dirty||!entry.version){if(!confirm('현재 내용을 임시 저장한 뒤 미리보기를 열까요? 공개 사이트는 바뀌지 않습니다.'))return;await save();}
    const d=entry.doc,hash=d.kind==='project'?'#/work/'+d.id:d.kind==='note'?'#/notes/'+d.id:'#/';
    const frame=document.createElement('iframe');frame.title='임시 저장본 미리보기';frame.src='/?cms_preview='+encodeURIComponent(entry.key)+hash;
    $('#frame-wrap').replaceChildren(frame);currentTab='pick';drawer.classList.add('is-preview');$('.preview-pane').hidden=false;
    $$('.tab-pane').forEach(el=>el.hidden=el.id!=='pick');$$('[data-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.tab==='pick');if(b.dataset.tab==='pick')b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  }
  async function action(fn) {
    if(busy)return;busy=true;const controls=$$('.actions button,.drawer-heading button,#asset-upload,#close-assets');controls.forEach(b=>b.disabled=true);
    $$('.editor-grid,.edit-tabs,.asset-tools,#asset-grid,#command-results').forEach(el=>el.inert=true);if(entry)state();
    try{await fn();}catch(error){if(error.status===409&&entry)$('#conflict').hidden=false;toast(error.message,true);}
    finally{busy=false;controls.forEach(b=>b.disabled=false);$$('.editor-grid,.edit-tabs,.asset-tools,#asset-grid,#command-results').forEach(el=>el.inert=false);if(entry)state();}
  }
  async function publish(actionName) {
    if(!entry)return;
    if(actionName==='unpublish'&&!confirm('이 콘텐츠의 게시를 중단할까요? 저장된 내용은 유지됩니다.'))return;
    if(dirty||!entry.version)await save();
    entry=await api(entryPath()+'/'+actionName,{method:'POST',body:JSON.stringify({version:entry.version})});
    dirty=false;$('#conflict').hidden=true;state();updateEntry(entry);toast(actionName==='publish'?'게시했어요. 사이트를 새로 열면 반영됩니다.':'게시를 중단했어요. 저장된 내용은 유지됩니다.');
  }
  async function history() {
    const key=entry.key;$('#history-list').innerHTML='<p class="help" role="status">저장 기록을 불러오고 있어요…</p>';
    try{const result=await api('entry/'+encodeURIComponent(key)+'/history');if(entry?.key!==key||currentTab!=='history')return;
      $('#history-list').innerHTML=result.items.length?result.items.map(x=>`<div class="history-item"><span class="history-icon">${icon('clock')}</span><div><strong>버전 ${x.version} <span>${({publish:'게시',save:'임시 저장',restore:'복원',unpublish:'게시 중단'})[x.action]||E(x.action)}</span></strong><small>${E(new Date(x.created_at).toLocaleString('ko-KR'))}</small></div><button data-restore="${E(x.id)}">임시본으로 복원</button></div>`).join(''):'<div class="empty-state compact"><h3>아직 저장 기록이 없어요</h3><p>첫 임시 저장부터 기록이 남습니다.</p></div>';
    }catch(error){if(entry?.key===key)$('#history-list').innerHTML=`<p class="inline-error">${E(error.message)}</p><button id="retry-history">다시 불러오기</button>`;$('#retry-history')?.addEventListener('click',history);}
  }
  async function chooseAsset(callback=null) {
    if(busy)return;
    assetCallback=callback;assetLimit=32;$('#asset-search').value='';$('#asset-status').textContent='이미지를 불러오고 있어요…';$('#asset-grid').replaceChildren();$('#asset-more').hidden=true;
    $('#assets-title').textContent=callback?'이미지 선택':'이미지 보관함';$('#assets').showModal();
    const existing=Object.values(window.EEH_ASSET_INDEX?.projects||{}).flat().map(a=>({url:'/'+a.src.replace(/^\//,''),name:a.caption||a.src}));
    try{const uploaded=await api('media');assets=[...uploaded.items.filter(x=>x.mime.startsWith('image/')).map(x=>({url:'/media/'+x.id,name:x.name})),...existing];renderAssets();}
    catch(error){assets=existing;renderAssets();$('#asset-status').textContent='업로드한 이미지를 불러오지 못했어요. 기본 이미지만 표시합니다. '+error.message;}
  }
  function renderAssets() {
    const q=$('#asset-search').value.toLowerCase(),found=assets.filter(a=>(a.name+' '+a.url).toLowerCase().includes(q));
    $('#asset-status').textContent=`${found.length}개 이미지${assetCallback?' · 선택하면 문서에 적용됩니다.':''}`;
    $('#asset-grid').innerHTML=found.slice(0,assetLimit).map(a=>`<button data-asset="${E(a.url)}" title="${E(a.name)}"><img src="${E(a.url)}" alt="${E(a.name)}" loading="lazy"><span>${E(a.name)}</span></button>`).join('')||'<p class="help">찾는 이미지가 없어요. 검색어를 바꾸거나 새 이미지를 업로드하세요.</p>';
    $('#asset-more').hidden=found.length<=assetLimit;
  }
  function newEntry(type=kind) {
    if(busy||!['project','note'].includes(type)||!discardAllowed('저장하지 않은 수정이 있습니다. 수정을 버리고 새 문서를 만들까요?'))return;
    const id=(type==='note'?'note-':'project-')+crypto.randomUUID().slice(0,8),doc={key:type+':'+id,id,kind:type,title:type==='note'?'새 노트':'새 프로젝트',summary:'',cover:'',client:'',year:String(new Date().getFullYear()),date:new Date().toISOString().slice(0,10),tag:'Journal',case:'',div:'space',status:'Built',practices:['space'],tags:[],blocks:[],hidden:false,text:{},images:{},links:{}};
    setEntry({key:doc.key,doc,version:0,publishedVersion:0,published:null});mark();recordRoute({view,key:doc.key});$('[data-field="title"]').focus();$('[data-field="title"]').select();
  }
  function syncMenu() { $('#sidebar').inert=window.innerWidth<=760&&!$('#sidebar').classList.contains('is-open'); }
  function closeMenu() { $('#sidebar').classList.remove('is-open');$('#menu-toggle').setAttribute('aria-expanded','false');syncMenu(); }
  addEventListener('resize',syncMenu);syncMenu();
  function openSearch() { if(busy||drawer.open||$('#assets').open)return;$('#command-search').value='';commandIndex=0;commandResults();$('#command').showModal();$('#command-search').focus(); }
  function commandResults() {
    const q=$('#command-search').value.trim().toLowerCase(),found=entries.filter(e=>[e.doc.title,e.doc.client,labels[e.doc.kind]].join(' ').toLowerCase().includes(q)).slice(0,12);
    commandIndex=Math.min(commandIndex,Math.max(0,found.length-1));
    $('#command-results').innerHTML=found.map((e,i)=>`<button class="command-result ${i===commandIndex?'selected':''}" data-key="${E(e.key)}">${icon(e.doc.kind==='project'?'folder':e.doc.kind==='site'?'sliders':'file')}<span><strong>${E(e.doc.title)}</strong><small>${labels[e.doc.kind]}</small></span>${badge(e)}</button>`).join('')||'<p class="help">검색 결과가 없어요.</p>';
  }
  function downloadDraft() {
    if(!entry)return;const blob=new Blob([JSON.stringify({key:entry.key,version:entry.version,doc:entry.doc},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='eeh-unsaved-'+entry.doc.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('현재 수정 사본을 내려받았어요.');
  }

  document.addEventListener('click',event=>{
    const target=event.target.closest('button,a');if(!target)return;
    if(target.dataset.view){event.preventDefault();navigate(target.dataset.view);}
    if(target.dataset.create)newEntry(target.dataset.create);
    if(target.dataset.key){if($('#command').open)$('#command').close();openEntry(target.dataset.key);}
    if(target.dataset.stat){const stat=target.dataset.stat;navigate(stat==='note'?'note':'project');if(stat==='published'||stat==='drafts'){$('#status-filter').value=stat==='published'?'published':'changed';list();}}
  });
  $('.brand').onclick=event=>{event.preventDefault();navigate('overview');};
  $('#menu-toggle').onclick=()=>{const on=$('#sidebar').classList.toggle('is-open');$('#menu-toggle').setAttribute('aria-expanded',String(on));syncMenu();};
  $('#main').onclick=closeMenu;
  $('#search').oninput=list;['status-filter','category-filter','sort'].forEach(id=>$('#'+id).onchange=list);$('#reset-filters').onclick=resetFilters;
  $$('[data-tab]').forEach(button=>button.onclick=()=>tab(button.dataset.tab));
  $('#close-editor').onclick=closeEditor;$('#cancel-editor').onclick=closeEditor;
  drawer.addEventListener('cancel',event=>{event.preventDefault();closeEditor();});
  $('#info').addEventListener('input',event=>{
    if(!entry||busy)return;const target=event.target;
    if(target.dataset.practice){entry.doc.practices=[...new Set([entry.doc.div,...$$('[data-practice]:checked').map(x=>x.dataset.practice)])];mark();return;}
    const key=target.dataset.field;if(!key)return;
    entry.doc[key]=key==='tags'?target.value.split(',').map(x=>x.trim()).filter(Boolean):target.value;
    if(key==='div'){entry.doc.practices=[...new Set([entry.doc.div,...(entry.doc.practices||[])])];$$('[data-practice]').forEach(x=>{x.disabled=x.dataset.practice===entry.doc.div;x.checked=entry.doc.practices.includes(x.dataset.practice);});}
    mark();
  });
  $('#block-list').addEventListener('input',event=>{if(event.target.dataset.block==null||busy)return;entry.doc.blocks[Number(event.target.dataset.block)][event.target.dataset.prop]=event.target.value;mark();});
  $('#block-list').onclick=event=>{
    const button=event.target.closest('button');if(!button||busy)return;const xs=entry.doc.blocks;
    if(button.dataset.remove!=null){if((xs[+button.dataset.remove].text||xs[+button.dataset.remove].url)&&!confirm('이 블록을 삭제할까요? 임시 저장 전에는 문서를 닫아 되돌릴 수 있습니다.'))return;xs.splice(+button.dataset.remove,1);mark();blocks();}
    if(button.dataset.move){const i=+button.dataset.index,j=i+(+button.dataset.move);if(j>=0&&j<xs.length){[xs[i],xs[j]]=[xs[j],xs[i]];mark();blocks();$(`[data-index="${j}"][data-move="${button.dataset.move}"]`)?.focus();}}
    if(button.dataset.blockImage!=null)chooseAsset(url=>{xs[+button.dataset.blockImage].url=url;mark();blocks();});
  };
  $('#add-block').onclick=()=>{if(entry.doc.blocks.length>=100){toast('본문 블록은 100개까지 추가할 수 있어요.',true);return;}entry.doc.blocks.push({type:$('#block-type').value,text:'',url:''});mark();blocks();$('#block-list .block:last-child textarea')?.focus();};
  $('#save').onclick=()=>action(save);$('#preview').onclick=()=>action(preview);$('#refresh-preview').onclick=()=>action(preview);$('#publish').onclick=()=>action(()=>publish('publish'));$('#unpublish').onclick=()=>action(()=>publish('unpublish'));
  $('#history-list').onclick=event=>{const button=event.target.closest('[data-restore]');if(!button)return;action(async()=>{if(!confirm(dirty?'저장하지 않은 수정을 버리고 이전 저장본을 임시본으로 복원할까요? 공개 사이트는 유지됩니다.':'이 저장본을 임시본으로 복원할까요? 공개 사이트는 유지됩니다.'))return;const saved=await api(entryPath()+'/restore',{method:'POST',body:JSON.stringify({revisionId:button.dataset.restore,version:entry.version})});setEntry(saved);updateEntry(saved);toast('임시본으로 복원했어요. 확인한 뒤 게시해 주세요.');});};
  $('#new').onclick=()=>newEntry();$('#nav-assets').onclick=()=>{closeMenu();chooseAsset();};
  $('#mobile-preview').onclick=()=>{const on=$('#frame-wrap').classList.toggle('mobile');$('#mobile-preview').setAttribute('aria-pressed',String(on));$('#mobile-preview span').textContent=on?'데스크톱 보기':'모바일 보기';};
  $$('[data-mode]').forEach(button=>button.onclick=()=>{mode=button.dataset.mode;$$('[data-mode]').forEach(x=>{x.classList.toggle('active',x===button);x.setAttribute('aria-pressed',String(x===button));});$('#frame-wrap iframe')?.contentWindow.postMessage({type:'eeh-cms-mode',mode},location.origin);});
  window.addEventListener('message',event=>{
    const frame=$('#frame-wrap iframe');if(event.origin!==location.origin||event.source!==frame?.contentWindow)return;
    if(event.data?.type==='eeh-cms-ready'){frame.contentWindow.postMessage({type:'eeh-cms-mode',mode},location.origin);return;}
    if(busy||!entry||event.data?.type!=='eeh-cms-pick'||!['text','images','links'].includes(event.data.kind)||typeof event.data.key!=='string'||['__proto__','prototype','constructor'].includes(event.data.key))return;
    picked=event.data;tab('pick');$('#picked').innerHTML=`<label class="field"><span>${E(picked.label||'선택한 항목')}</span><textarea id="pick-value" rows="7">${E(picked.value)}</textarea></label>${picked.kind==='images'?`<button id="pick-image">${icon('image')} 이미지 선택·업로드</button>`:''}<button class="small-action" id="pick-reset">원본으로 돌리기</button><p class="help pick-help">변경한 내용은 임시 저장 후 보관됩니다.</p>`;
    $('#pick-value').oninput=()=>changePick($('#pick-value').value);$('#pick-image')?.addEventListener('click',()=>chooseAsset(url=>{$('#pick-value').value=url;changePick(url);}));
    $('#pick-reset').onclick=()=>{delete entry.doc[picked.kind][picked.key];mark();toast('원본 복원을 임시 저장한 뒤 미리보기를 다시 열어주세요.');};
  });
  function changePick(value){entry.doc[picked.kind][picked.key]=value;mark();$('#frame-wrap iframe')?.contentWindow.postMessage({type:'eeh-cms-change',kind:picked.kind,key:picked.key,value},location.origin);}
  $('#close-assets').onclick=()=>$('#assets').close();$('#assets').addEventListener('cancel',event=>{if(busy)event.preventDefault();});$('#asset-search').oninput=()=>{assetLimit=32;renderAssets();};$('#asset-more').onclick=()=>{assetLimit+=32;renderAssets();};
  $('#asset-grid').onclick=event=>{const button=event.target.closest('[data-asset]');if(!button||busy)return;if(assetCallback){assetCallback(button.dataset.asset);$('#assets').close();}else{const asset=assets.find(a=>a.url===button.dataset.asset);$('#asset-status').textContent=asset?.name||button.dataset.asset;}};
  $('#asset-upload').onclick=()=>{$('#file').value='';$('#file').click();};
  $('#file').onchange=()=>action(async()=>{
    const file=$('#file').files[0];if(!file)return;
    if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type))throw new Error('JPG, PNG, WebP, GIF 이미지를 선택해 주세요.');
    if(!file.size||file.size>20*1024*1024)throw new Error('이미지는 20MB 이하로 올려주세요.');
    const form=new FormData();form.append('file',file);toast('원본 이미지를 업로드하고 있어요.');const result=await api('media',{method:'POST',body:form});
    assets.unshift({url:result.url,name:result.name||file.name});if(assetCallback){assetCallback(result.url);$('#assets').close();}else renderAssets();toast('이미지를 올렸어요. 문서에 적용한 뒤 임시 저장 또는 게시해 주세요.');
  });
  $('#copy-draft').onclick=downloadDraft;$('#reload-entry').onclick=()=>{if(busy||!confirm('이 화면의 수정을 버리고 최신 저장본을 불러올까요? 필요한 수정은 먼저 사본으로 내려받아 주세요.'))return;action(async()=>{const saved=await api(entryPath());setEntry(saved);updateEntry(saved);toast('최신 저장본을 불러왔어요.');});};
  $('#open-search').onclick=openSearch;$('#close-command').onclick=()=>$('#command').close();$('#command-search').oninput=()=>{commandIndex=0;commandResults();};
  $('#command').addEventListener('keydown',event=>{
    const results=$$('.command-result');if(['ArrowDown','ArrowUp'].includes(event.key)&&results.length){event.preventDefault();commandIndex=(commandIndex+(event.key==='ArrowDown'?1:-1)+results.length)%results.length;results.forEach((el,i)=>el.classList.toggle('selected',i===commandIndex));results[commandIndex].scrollIntoView({block:'nearest'});}
    if(event.key==='Enter'&&document.activeElement===$('#command-search')){event.preventDefault();results[commandIndex]?.click();}
  });
  document.addEventListener('keydown',event=>{
    if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openSearch();}
    if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='s'&&drawer.open&&!$('#assets').open){event.preventDefault();action(save);}
    if(event.key==='Escape'&&!drawer.open&&!$('#assets').open&&!$('#command').open)closeMenu();
  });
  addEventListener('beforeunload',event=>{if(dirty||busy){event.preventDefault();event.returnValue='';}});
  Promise.all([api('me'),load()]).then(async([me])=>{
    $('#account').textContent=me.email;$('#loading').hidden=true;initialized=true;const initial=readRoute();showView(initial.view);recordRoute(initial,true);if(initial.key)await openEntry(initial.key,false);
  }).catch(error=>{
    $('#loading').hidden=true;$('#error-state').hidden=false;
    $('#error-state').innerHTML=error.status===401||error.status===403?`<h1>관리자 계정으로 로그인해 주세요</h1><p>${E(error.message)}</p><a class="button primary" href="/signin-with-chatgpt?return_to=%2Fadmin" target="_top">ChatGPT로 로그인</a>`:`<h1>콘텐츠를 불러오지 못했어요</h1><p>${E(error.message)}</p><button id="retry-load">다시 시도</button>`;
    $('#retry-load')?.addEventListener('click',()=>location.reload());
  });
})();
