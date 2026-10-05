// A read-only feed for the GitHub Pages frontend. It accepts no draft key or callback.
export function publicFeed(docs,origin){
 const fix=value=>Array.isArray(value)?value.map(fix):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,fix(v)])):typeof value==='string'&&/^\/media\/[a-f0-9-]{36}$/.test(value)?origin+value:value;
 return 'window.EEH_CMS_BOOT='+JSON.stringify({docs:fix(docs),preview:null}).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')+';';
}
