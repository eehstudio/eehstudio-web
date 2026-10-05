(()=>{
 const cms=window.EEHCMS,{E,key,boot}=cms;
 const docFor=k=>boot.docs.find(d=>d.key===k),site=docFor('site:main');
 let current=null,mode='text';
 const selector='main h1, main h2, main h3, main h4, main p, main li, main dd, main dt, main figcaption, main .cap, main .kicker, main .cs-label, main .offer-output, main .offer-deliver>b, footer .wordmark';
 function targets(root=document){return [...root.querySelectorAll(selector)].filter(el=>!el.closest('.bx,.dos,.receipt,.cs-toc,.spatial-tabs,.ee-dashboard-tabs,form,script')&&!el.querySelector('h1,h2,h3,h4,p,li,dd,dt,figure,img,iframe,ul,ol,div')&&el.textContent.trim())}
 function augment(root=document,doc=null){
  current=doc;
  for(const el of targets(root)){
   if(!el.dataset.cmsKey){el.dataset.cmsOriginal=el.textContent;el.dataset.cmsKey=key(el.textContent.replace(/\s+/g,' ').trim())}
   const t=doc?.text?.[el.dataset.cmsKey]??site?.text?.[el.dataset.cmsKey];if(t!=null)el.textContent=t;
  }
  root.querySelectorAll('img').forEach(im=>{const src=im.dataset.cmsOriginalSrc||(im.dataset.cmsOriginalSrc=im.getAttribute('src'));const v=doc?.images?.[src]??site?.images?.[src];if(v)im.src=v});
  root.querySelectorAll('a[href]').forEach(a=>{const href=a.getAttribute('href');const hidden=boot.docs.find(d=>d.hidden&&href===(d.kind==='project'?'#/work/':'#/notes/')+d.id);if(hidden){(a.closest('.ee-proof-card,.note-card,.why-card,.card')||a).hidden=true;return;}const src=a.dataset.cmsOriginalHref||(a.dataset.cmsOriginalHref=a.getAttribute('href'));const v=doc?.links?.[src]??site?.links?.[src];if(v)a.href=v});
 }
 const renderC=renderCase;renderCase=function(w){renderC(w);const d=docFor('project:'+w.id),root=document.querySelector('.js-case');if(d?.blocks?.length){const section=document.createElement('section');section.className='wrap cms-body';section.innerHTML=cms.blocks(d.blocks);const next=root.querySelector('.cs-next');if(next)next.before(section);else root.append(section)}augment(root,d)};
 const renderN=renderNote;renderNote=function(n){renderN(n);const d=docFor('note:'+n.id),root=document.querySelector('.js-note');if(d){const body=root.querySelector('.note-body');const legacy=[...body.children].filter(x=>!x.matches('.lede,.note-facts,.note-cta'));legacy.forEach(x=>x.remove());const div=document.createElement('div');div.className='cms-body';div.innerHTML=cms.blocks(d.blocks);body.querySelector('.note-cta')?.before(div)}augment(root,d)};
 const oldShow=show;show=function(r){oldShow(r);if(!['case','note'].includes(r.view))augment(document,site)};
 show(parse());
 if(!boot.preview)return;
 document.documentElement.classList.add('cms-preview');
 const editorStyle=document.createElement('style');editorStyle.textContent='.cms-preview .cms-selected{outline:2px solid #233955;outline-offset:4px}.cms-preview[data-cms-mode=text] main :is(h1,h2,h3,h4,p,li,dd,dt,figcaption):hover,.cms-preview[data-cms-mode=image] main img:hover,.cms-preview[data-cms-mode=link] main a:hover{outline:1px dashed #7692b7;outline-offset:3px}';document.head.append(editorStyle);
 const send=value=>parent.postMessage(value,location.origin);
 document.addEventListener('click',e=>{
  if(e.target.closest('.spatial-tabs,.spatial-launch,.bx-bar,.tap-guard'))return;
  let el,k,value,type;
  if(mode==='image'){el=e.target.closest('img');if(!el)return;type='images';k=el.dataset.cmsOriginalSrc||el.getAttribute('src');value=el.getAttribute('src')}
  else if(mode==='link'){el=e.target.closest('a[href]');if(!el)return;type='links';k=el.dataset.cmsOriginalHref||el.getAttribute('href');value=el.getAttribute('href')}
  else{el=targets().find(x=>x===e.target||x.contains(e.target));if(!el){const a=e.target.closest('a');if(a&&!(boot.preview==='site:main'&&a.getAttribute('href')?.startsWith('#/')))e.preventDefault();return}type='text';k=el.dataset.cmsKey;value=el.textContent}
  e.preventDefault();e.stopImmediatePropagation();document.querySelector('.cms-selected')?.classList.remove('cms-selected');el.classList.add('cms-selected');send({type:'eeh-cms-pick',kind:type,key:k,value,label:el.textContent?.slice(0,70)||el.getAttribute('alt')||'이미지'});
 },true);
 window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent)return;if(e.data?.type==='eeh-cms-mode'){mode=e.data.mode;document.documentElement.dataset.cmsMode=mode}if(e.data?.type==='eeh-cms-change'){const d=docFor(boot.preview);if(!d)return;d[e.data.kind]??={};d[e.data.kind][e.data.key]=e.data.value;augment(document,d)}});
 send({type:'eeh-cms-ready'});
})();
