const V='v1',SHELL='shell-'+V,RT='rt-'+V;
const FILES=['/','/index.html','/manifest.webmanifest','/icon-192.png','/icon-512.png','/icon-maskable-512.png','/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==SHELL&&x!==RT).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const swr=(r,name)=>caches.open(name).then(c=>c.match(r).then(hit=>{
  const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>hit);
  return hit||net;
}));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(SHELL).then(c=>c.put('/index.html',cp))}return res}).catch(()=>caches.match('/index.html')));
    return;
  }
  if(u.origin===location.origin)e.respondWith(swr(r,SHELL));
  else if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))e.respondWith(swr(r,RT));
});
