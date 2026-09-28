var CACHE="mes-notes-v7";
var ASSETS=["./","./index.html","./manifest.webmanifest","./icon.svg","./css/style.css","./js/data.js","./js/ui.js","./js/app.js"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}).then(function(){return self.skipWaiting();}));});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==CACHE;}).map(function(x){return caches.delete(x);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener("fetch",function(e){if(e.request.method!=="GET")return;var u=new URL(e.request.url);if(u.origin!==location.origin)return;e.respondWith(fetch(e.request).then(function(r){var c=r.clone();caches.open(CACHE).then(function(cc){cc.put(e.request,c);});return r;}).catch(function(){return caches.match(e.request).then(function(m){return m||caches.match("./index.html");});}));});
