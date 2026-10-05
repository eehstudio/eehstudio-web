(()=>{
 const boot=window.EEH_CMS_BOOT||{docs:[],preview:null};
 const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const blocks=xs=>(xs||[]).map(b=>b.type==='h2'?`<h2>${E(b.text)}</h2>`:b.type==='blockquote'?`<blockquote>${E(b.text)}</blockquote>`:b.type==='image'?`<figure><img src="${E(b.url)}" alt="${E(b.text)}" loading="lazy"><figcaption>${E(b.text)}</figcaption></figure>`:b.type==='link'?`<p><a href="${E(b.url)}" target="_blank" rel="noopener noreferrer">${E(b.text||b.url)} ↗</a></p>`:`<p>${E(b.text).replace(/\n/g,'<br>')}</p>`).join('');
 function apply(works,notes,studio){
  for(const d of boot.docs){
   if(d.kind==='site'){for(const k of ['email','instagram','phone','address','profilePdf'])if(d[k]!=null)studio[k]=d[k];continue}
   const list=d.kind==='project'?works:notes;let w=list.find(x=>x.id===d.id);
   if(d.hidden){if(w)list.splice(list.indexOf(w),1);continue}
   if(d.kind==='project'){
    if(!w){w={id:d.id,lite:true,cmsNew:true,meta:[],body:[],slides:[],sections:[],tags:[],category:d.div,headline:d.title};works.push(w)}
    for(const k of ['title','client','year','div','status','summary','cover','tags','practices'])if(d[k]!=null)w[k]=d[k];
    w.cmsEdited=true;if(w.cmsNew){w.heroSrc=d.cover;w.meta=[['Client',d.client||''],['Year',d.year||'']];w.sections=d.summary?[{t:'lead',label:'Overview',q:d.title,p:[d.summary]}]:[]}w.meta=w.meta||[];for(const [k,v] of [['Client',d.client],['Year',d.year]]){const at=w.meta.findIndex(x=>x[0]===k);if(at>=0)w.meta[at][1]=v||''}
   }else{
    if(!w){w={id:d.id,body:[]};notes.unshift(w)}
    Object.assign(w,{title:d.title,date:d.date||'',tag:d.tag||'Journal',case:d.case||'',sum:d.summary||'',img:d.cover,body:(d.blocks||[]).filter(b=>!['image','link'].includes(b.type)).map(b=>[b.type,b.text])});
   }
  }
 }
 const key=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return 'k'+h.toString(36)+s.length.toString(36)};
 window.EEHCMS={apply,blocks,E,key,boot};
})();
