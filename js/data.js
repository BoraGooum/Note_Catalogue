/* ===== CONFIG ===== */
var PROXY = "https://catalogue-api.nicolasarnaud1010.workers.dev";
var BUILD_DATE = "2026-09-28T01:35:00+02:00";
var TMDB_IMG = "https://image.tmdb.org/t/p/w200";
var OE = "\u0153", OEC = "\u0152";
var NO_POSTER = "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='200' height='300'><rect width='200' height='300' fill='#17112E'/><text x='100' y='155' font-family='monospace' font-size='13' fill='#8B83A8' text-anchor='middle'>pas d'affiche</text></svg>");

/* ===== ICÔNES LUCIDE ===== */
var I = {
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  library:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>',
  hourglass:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>',
  eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
  link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  folder:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
  calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  tv:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect width="20" height="15" x="2" y="7" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  barcode:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/></svg>',
  copy2:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
  download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  upload:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>'
};

/* ===== TYPES LIBRES ===== */
var CORE_TYPES = ["Film","S\u00e9rie","Jeu","Manga","BD","Roman"];
function loadCustomTypes(){
  try { return JSON.parse(localStorage.getItem("custom_types")||"[]"); }catch(e){ return []; }
}
function saveCustomTypes(list){ localStorage.setItem("custom_types", JSON.stringify(list)); }
function allTypes(){ return CORE_TYPES.concat(loadCustomTypes().map(function(t){return t.name;})); }

/* ===== HELPERS ===== */
var pad2 = function(n){return String(n).padStart(2,"0");};
function nowStamp(){ var d=new Date(); return pad2(d.getDate())+"/"+pad2(d.getMonth()+1)+" \u00e0 "+pad2(d.getHours())+"h"+pad2(d.getMinutes()); }
function norm(s){ return (s||"").toLowerCase().replace(/[^a-z0-9]/g,""); }
function esc(s){ return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function formatDate(s){
  if(!s) return "";
  if(s.includes("/")) return s;
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[3]+"/"+m[2]+"/"+m[1] : s;
}
function parseDateFR(s){
  if(!s) return null;
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(m) return {y:+m[1], mo:+m[2], d:+m[3]};
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if(m) return {y:+m[3], mo:+m[2], d:+m[1]};
  return null;
}
function statutStr(e){
  return (e.isFavorite?"\u{1F49C}":"")+(e.enCours?"\u23F3":"")+(e.aVoir?"\u{1F440}":"");
}
function statutIconCount(entries, t){
  var list = entries.filter(function(e){return e.type===t;});
  var enc = list.filter(function(e){return e.enCours;}).length;
  var voir = list.filter(function(e){return e.aVoir;}).length;
  return '<span style="color:var(--dim)">(\u23F3 '+enc+' \u2022 \u{1F440} '+voir+')</span>';
}
function journalLines(e){
  var j = e.journal || (e.comment ? [{kind:"free", text:e.comment}] : []);
  return j.map(function(x){
    if(x.kind==="time") return x.ts+" : "+x.text;
    if(x.kind==="ep") return "S"+pad2(x.s||0)+"E"+pad2(x.e||0)+(x.note!=null?" \u2022 "+x.note+"/10":"")+(x.text?" : "+x.text:"");
    return x.text;
  });
}
function descriptionOf(e){ return journalLines(e).join(" | "); }

/* ===== DB INDEXEDDB ===== */
var db;
function openDB(){ return new Promise(function(res,rej){
  var r = indexedDB.open("catalogue-db", 2);
  r.onupgradeneeded = function(e){
    var d = e.target.result;
    if(!d.objectStoreNames.contains("entries")) d.createObjectStore("entries",{keyPath:"id"});
    if(!d.objectStoreNames.contains("settings")) d.createObjectStore("settings",{keyPath:"k"});
    if(!d.objectStoreNames.contains("skins_perso")) d.createObjectStore("skins_perso",{keyPath:"id", autoIncrement:true});
  };
  r.onsuccess = function(e){ db = e.target.result; res(db); };
  r.onerror = function(e){ rej(e); };
});}
function dbAll(){ return new Promise(function(res,rej){
  var tx = db.transaction("entries","readonly");
  var q = tx.objectStore("entries").getAll();
  q.onsuccess = function(){ res(q.result||[]); }; q.onerror = function(e){ rej(e); };
});}
function dbPut(en){ return new Promise(function(res,rej){
  var tx = db.transaction("entries","readwrite");
  tx.objectStore("entries").put(en);
  tx.oncomplete = function(){ res(); }; tx.onerror = function(e){ rej(e); };
});}
function dbDelete(id){ return new Promise(function(res,rej){
  var tx = db.transaction("entries","readwrite");
  tx.objectStore("entries").delete(id);
  tx.oncomplete = function(){ res(); }; tx.onerror = function(e){ rej(e); };
});}
function settingGet(k,def){ return new Promise(function(res){
  var tx = db.transaction("settings","readonly");
  var q = tx.objectStore("settings").get(k);
  q.onsuccess = function(){ res(q.result ? q.result.v : def); };
  q.onerror = function(){ res(def); };
});}
function settingPut(k,v){ return new Promise(function(res){
  var tx = db.transaction("settings","readwrite");
  tx.objectStore("settings").put({k:k, v:v});
  tx.oncomplete = function(){ res(); };
});}
function skinPersoAdd(obj){ return new Promise(function(res,rej){
  var tx = db.transaction("skins_perso","readwrite");
  var q = tx.objectStore("skins_perso").add(obj);
  q.onsuccess = function(){ res(q.result); }; q.onerror = function(e){ rej(e); };
});}
function skinPersoAll(){ return new Promise(function(res){
  var tx = db.transaction("skins_perso","readonly");
  var q = tx.objectStore("skins_perso").getAll();
  q.onsuccess = function(){ res(q.result||[]); };
});}
function skinPersoDel(id){ return new Promise(function(res){
  var tx = db.transaction("skins_perso","readwrite");
  tx.objectStore("skins_perso").delete(id);
  tx.oncomplete = function(){ res(); };
});}

/* ===== RÉGLAGES GLOBAUX (fallback localStorage) ===== */
var SETTINGS_DEFAULTS = {
  searchMode: "simple",
  defaultType: "Film",
  panelMode: "simple",
  density: "comfort",
  fontSize: "m",
  animOn: true,
  hcMode: false,
  skinFilm: 2, skinSerie: 16, skinJeu: 34, skinManga: 47, skinBD: 61, skinRoman: 76, skinLibre: 91,
  colGroup: false,
  alertBackupDays: 7,
  fuzzy: true
};
function settingsLoad(){
  try { return Object.assign({}, SETTINGS_DEFAULTS, JSON.parse(localStorage.getItem("settings")||"{}")); }
  catch(e){ return Object.assign({}, SETTINGS_DEFAULTS); }
}
function settingsSave(s){ localStorage.setItem("settings", JSON.stringify(s)); }

/* ===== 105 SKINS ===== */
var _pc = 0;
function paint(defs, col, vert){
  if(Array.isArray(col)){
    var id = "p"+(++_pc);
    defs.push('<linearGradient id="'+id+'" x1="0" y1="0" x2="'+(vert?0:1)+'" y2="'+(vert?1:0)+'"><stop offset="0" stop-color="'+col[0]+'"/><stop offset="1" stop-color="'+col[1]+'"/></linearGradient>');
    return "url(#"+id+")";
  }
  return col;
}
var X = {
  legs:'<path d="M86 274h28l7 18h-42z" fill="#17171c"/><rect x="62" y="292" width="76" height="5" rx="2.5" fill="#1e1e24"/>',
  led:function(c){return '<circle cx="100" cy="268" r="2.5" fill="'+(c||'#B24BF3')+'"/>';},
  antenna:'<path d="M60 26L30 0M100 26L130 0" stroke="#6b5f4a" stroke-width="4"/>',
  knobs:'<circle cx="172" cy="52" r="11" fill="#6b5f4a"/><circle cx="172" cy="82" r="11" fill="#6b5f4a"/>',
  reels:'<circle cx="60" cy="20" r="14" fill="none" stroke="#d8c9a0" stroke-width="3"/><circle cx="140" cy="20" r="14" fill="none" stroke="#d8c9a0" stroke-width="3"/>',
  reelC:'<circle cx="100" cy="150" r="40" fill="none" stroke="#d8c9a0" stroke-width="4" opacity=".5"/>',
  perf:'<g fill="#e8e8e8"><rect x="6" y="8" width="12" height="16" rx="2"/><rect x="182" y="8" width="12" height="16" rx="2"/><rect x="6" y="72" width="12" height="16" rx="2"/><rect x="182" y="72" width="12" height="16" rx="2"/><rect x="6" y="136" width="12" height="16" rx="2"/><rect x="182" y="136" width="12" height="16" rx="2"/><rect x="6" y="200" width="12" height="16" rx="2"/><rect x="182" y="200" width="12" height="16" rx="2"/><rect x="6" y="264" width="12" height="16" rx="2"/><rect x="182" y="264" width="12" height="16" rx="2"/></g>',
  signet:'<path d="M94 268h12v32l-6-6-6 6z" fill="#a32020"/>',
  spiral:'<g stroke="#c0c0c0" stroke-width="2" fill="none"><path d="M4 20q8 6 0 12"/><path d="M4 80q8 6 0 12"/><path d="M4 140q8 6 0 12"/><path d="M4 200q8 6 0 12"/><path d="M4 260q8 6 0 12"/></g>',
  scotch:'<g fill="#e8e4d8" opacity=".8"><rect x="20" y="6" width="34" height="12" transform="rotate(-20 37 12)"/><rect x="146" y="6" width="34" height="12" transform="rotate(20 163 12)"/><rect x="20" y="282" width="34" height="12" transform="rotate(20 37 288)"/><rect x="146" y="282" width="34" height="12" transform="rotate(-20 163 288)"/></g>',
  joystick:'<circle cx="70" cy="282" r="9" fill="#d33"/><rect x="67" y="282" width="6" height="12" fill="#333"/>',
  notch:'<rect x="80" y="6" width="40" height="8" rx="4" fill="#000"/>',
  home:'<circle cx="100" cy="288" r="6" fill="none" stroke="#888" stroke-width="2"/>',
  playbar:'<rect x="14" y="288" width="172" height="3" rx="1.5" fill="#2A1F4A"/><rect x="14" y="288" width="110" height="3" rx="1.5" fill="#FF5DA2"/><circle cx="124" cy="289.5" r="5" fill="#FF5DA2"/>',
  play:'<path d="M88 130l34 20-34 20z" fill="#fff" opacity=".85"/>',
  clap:'<g fill="#111"><rect y="0" width="200" height="16"/><rect y="20" width="200" height="14"/></g><g fill="#fff"><path d="M0 0l16 0-8 16-16 0z"/><path d="M80 0l16 0-8 16-16 0z"/><path d="M160 0l16 0-8 16-16 0z"/></g>',
  screws:'<circle cx="14" cy="286" r="4" fill="#6b7076"/><circle cx="186" cy="286" r="4" fill="#6b7076"/>',
  string:'<path d="M20 40q80 20 160 0" stroke="#c9a86a" stroke-width="2" fill="none"/>',
  clasp:'<rect x="186" y="140" width="14" height="24" rx="3" fill="#b08d3e"/>',
  elastic:'<rect x="150" y="0" width="6" height="300" fill="#222"/>',
  beam:'<path d="M100 0L40 300L160 300Z" fill="#fff" opacity=".08"/>',
  disc:'<circle cx="160" cy="250" r="26" fill="none" stroke="#c0c0c0" stroke-width="3" opacity=".7"/><circle cx="160" cy="250" r="6" fill="#c0c0c0" opacity=".7"/>',
  gamepad:'<path d="M60 280q40 -14 80 0q10 4 8 12h-96q-2 -8 8 -12z" fill="#333"/>',
  headphone:'<path d="M70 280a30 30 0 0 1 60 0" stroke="#B24BF3" stroke-width="4" fill="none"/><rect x="64" y="278" width="10" height="16" rx="4" fill="#B24BF3"/><rect x="126" y="278" width="10" height="16" rx="4" fill="#B24BF3"/>',
  fold:'<g stroke="#000" opacity=".25"><line x1="0" y1="100" x2="200" y2="100"/><line x1="0" y1="200" x2="200" y2="200"/><line x1="100" y1="0" x2="100" y2="300"/></g>',
  scan:'<g stroke="#00ff00" opacity=".15"><line x1="0" y1="80" x2="200" y2="80"/><line x1="0" y1="160" x2="200" y2="160"/><line x1="0" y1="240" x2="200" y2="240"/></g>',
  wave:'<path d="M176 240q6 -8 12 0q6 8 12 0" stroke="#f3e9d2" stroke-width="2" fill="none"/>',
  flowers:'<g fill="#ffd0e0"><circle cx="186" cy="60" r="3"/><circle cx="186" cy="140" r="3"/><circle cx="186" cy="220" r="3"/></g>'
};

function buildSkin(s){
  if(!s.frame){
    if(s.glow) return '<svg viewBox="0 0 200 300"><rect x="3" y="3" width="194" height="294" rx="10" fill="none" stroke="'+s.glow+'" stroke-width="3"/></svg>';
    return "";
  }
  var win=s.win||[10,7,180,286], id="k"+s.id, defs=[];
  defs.push('<mask id="'+id+'"><rect width="200" height="300" rx="'+(s.rx||6)+'" fill="#fff"/><rect x="'+win[0]+'" y="'+win[1]+'" width="'+win[2]+'" height="'+win[3]+'" rx="'+(s.wrx||2)+'" fill="#000"/></mask>');
  var fill = paint(defs, s.frame, s.gd);
  var b = '<g mask="url(#'+id+')"><rect width="200" height="300" rx="'+(s.rx||6)+'" fill="'+fill+'"/>';
  if(s.spine){
    var sp=s.spine, sx=(sp[0]==='left')?0:200-sp[1];
    b += '<rect x="'+sx+'" y="0" width="'+sp[1]+'" height="300" fill="'+paint(defs,sp[2],true)+'"/>';
    if(s.spineTxt) b += '<text x="'+(sx+sp[1]/2)+'" y="40" fill="'+s.spineTxt[1]+'" font-size="'+(s.spineTxt[2]||13)+'" font-family="serif" transform="rotate(90 '+(sx+sp[1]/2)+' 40)" letter-spacing="3">'+s.spineTxt[0]+'</text>';
  }
  if(s.band){
    var bd=s.band, by=(bd[0]==='top')?0:300-bd[1];
    b += '<rect x="0" y="'+by+'" width="200" height="'+bd[1]+'" fill="'+paint(defs,bd[2],true)+'"/>';
    if(s.bandTxt) b += '<text x="10" y="'+(by+bd[1]*0.72)+'" fill="'+(s.bandTxt[1]||'#fff')+'" font-size="'+(s.bandTxt[2]||12)+'" font-weight="800" font-family="Arial">'+s.bandTxt[0]+'</text>';
    if(s.bandDots) for(var i=0;i<s.bandDots.length;i++){var d=s.bandDots[i];b+='<circle cx="'+d[0]+'" cy="'+(by+bd[1]/2)+'" r="'+d[1]+'" fill="'+d[2]+'"/>';}
  }
  if(s.corners){
    var cx=win[0],cy=win[1],cw=win[2],ch=win[3];
    b += '<path d="M'+cx+' '+cy+'l10 0-10 10zM'+(cx+cw)+' '+cy+'l-10 0 10 10zM'+cx+' '+(cy+ch)+'l10 0-10-10zM'+(cx+cw)+' '+(cy+ch)+'l-10 0 10-10z" fill="'+s.corners+'"/>';
  }
  if(s.refl!==0) b += '<path d="M0 0L'+(s.refl||70)+' 0L20 300L0 300Z" fill="#fff" opacity="'+(s.reflOp||0.06)+'"/>';
  b += '</g>';
  var o = '';
  if(s.x) for(var j=0;j<s.x.length;j++){var k=s.x[j];o+=(typeof X[k]==='function')?X[k](s.xc):(X[k]||'');}
  if(s.wstroke) o += '<rect x="'+win[0]+'" y="'+win[1]+'" width="'+win[2]+'" height="'+win[3]+'" rx="'+(s.wrx||2)+'" fill="none" stroke="'+s.wstroke+'" stroke-width="'+(s.wsw||1.5)+'"/>';
  if(s.badge) o += '<rect x="166" y="270" width="24" height="24" rx="3" fill="#111" stroke="#444"/><text x="178" y="287" fill="#eee" font-size="12" font-weight="800" font-family="Arial" text-anchor="middle">'+s.badge+'</text>';
  return '<svg viewBox="0 0 200 300"><defs>'+defs.join('')+'</defs>'+b+o+'</svg>';
}

var SKINS = [
{id:1,t:'film',n:'Blu-ray épuré',frame:['#2f62c4','#122a66'],spine:['left',11,'#0d2050'],win:[11,7,182,286],rx:9},
{id:2,t:'film',n:'DVD noir sobre',frame:'#1c1c1e',spine:['left',9,'#000000'],win:[9,6,184,288],wstroke:'#3a3a3e'},
{id:3,t:'film',n:'Coffret collector',frame:['#8a6a2a','#4a3413'],win:[14,12,172,276],corners:'#d9b45b',wstroke:'#d9b45b'},
{id:4,t:'film',n:'VHS rétro',frame:'#101010',band:['top',34,['#ff5da2','#00c3e3']],win:[8,40,184,206],rx:3},
{id:5,t:'film',n:'Pellicule 35mm',frame:'#0a0a0a',win:[24,0,152,300],x:['perf'],refl:0},
{id:6,t:'film',n:'Steelbook métal',frame:['#8a8f96','#4a4f56'],gd:1,win:[8,6,184,288],wstroke:'#aab0b8',reflOp:0.14},
{id:7,t:'film',n:'Super 8',frame:['#5a4020','#2a1c0c'],win:[10,44,180,246],x:['reels']},
{id:8,t:'film',n:'Art déco argent',frame:'#141414',win:[16,14,168,272],corners:'#c0c0c0',wstroke:'#c0c0c0',wsw:2},
{id:9,t:'film',n:'Grand format rouge',frame:'#111111',band:['top',30,'#c8352f'],win:[7,34,186,259],badge:'12'},
{id:10,t:'film',n:'Drive-in',frame:'#141414',win:[20,10,160,280],x:['perf'],refl:0},
{id:11,t:'film',n:'DVD rouge',frame:['#a02020','#500c0c'],spine:['left',10,'#330000'],win:[10,7,183,286]},
{id:12,t:'film',n:'4K UHD',frame:'#0d0d0d',band:['top',26,'#000000'],win:[7,30,186,263],wstroke:'#d9b45b',badge:'16'},
{id:13,t:'film',n:'Jaquette clap',frame:'#111111',win:[8,40,184,252],x:['clap']},
{id:14,t:'film',n:'Bobine',frame:['#3a2a10','#160e04'],win:[12,12,176,276],x:['reelC']},
{id:15,t:'film',n:'Écran cinéma',frame:['#7a1e2b','#3d0d15'],spine:['left',26,'#5a0f18'],win:[30,16,150,268],wstroke:'#d9b45b'},
{id:16,t:'serie',n:'TV moderne + LED',frame:['#26262c','#0b0b0e'],win:[13,12,174,248],rx:10,x:['legs','led']},
{id:17,t:'serie',n:'TV cathodique',frame:'#d8cdb4',win:[16,26,130,118],rx:16,wrx:10,x:['knobs','antenna'],wstroke:'#8f8266',wsw:3},
{id:18,t:'serie',n:'Cinémascope',frame:'#050505',win:[5,44,190,212],refl:0},
{id:19,t:'serie',n:'Streaming',frame:'#17112E',win:[6,6,188,272],rx:12,wstroke:'#7F5AF0',wsw:6,x:['playbar']},
{id:20,t:'serie',n:'Écran incurvé',frame:'#0b0b0e',win:[10,10,180,250],rx:24,wrx:18,wstroke:'#333333',x:['legs']},
{id:21,t:'serie',n:'Fenêtre navigateur',frame:'#111111',band:['top',18,'#2a2a33'],bandDots:[[14,4,'#ff5f57'],[28,4,'#febc2e'],[42,4,'#28c840']],win:[6,22,188,272]},
{id:22,t:'serie',n:'Tablette',frame:'#c0c0c6',win:[10,10,180,268],rx:14,x:['home']},
{id:23,t:'serie',n:'Smartphone',frame:'#111111',win:[14,16,172,262],rx:18,wrx:12,x:['notch']},
{id:24,t:'serie',n:'Caméscope',frame:'#8f949a',win:[12,40,150,200],spine:['right',26,'#6b7076'],x:['reels']},
{id:25,t:'serie',n:'Rétro-projecteur',frame:'#1a1a1a',win:[14,20,172,240],x:['beam','legs']},
{id:26,t:'serie',n:'TV bois',frame:['#8a6a3a','#4a3418'],win:[14,16,172,240],rx:12,x:['legs','knobs']},
{id:27,t:'serie',n:'CRT vert',frame:'#1a2a1a',win:[14,14,172,244],rx:14,wrx:10,wstroke:'#2CB67D',x:['scan']},
{id:28,t:'serie',n:'Clap ardoise',frame:'#222222',win:[8,44,184,248],x:['clap']},
{id:29,t:'serie',n:'Fenêtre plateforme',frame:'#0d0d12',win:[6,6,188,272],rx:10,wstroke:'#B24BF3',wsw:3,x:['play']},
{id:30,t:'serie',n:'Box TV',frame:'#111111',win:[10,60,180,200],rx:10,x:['led'],xc:'#107C10'},
{id:31,t:'jeu',n:'Boîte PS5',frame:'#101014',band:['top',27,['#006FCD','#003087']],win:[7,27,186,266],badge:'18'},
{id:32,t:'jeu',n:'Boîte PS4',frame:'#0d0d12',band:['top',27,['#003791','#001a4d']],win:[7,27,186,266],badge:'18'},
{id:33,t:'jeu',n:'Boîte Switch',frame:'#141414',band:['top',27,'#3a3a3e'],bandDots:[[16,9,'#00c3e3'],[184,9,'#ff4554']],win:[7,27,186,266],badge:'12'},
{id:34,t:'jeu',n:'Boîte Xbox',frame:'#0e0e0e',band:['top',27,'#111111'],bandDots:[[184,9,'#107C10']],win:[7,27,186,266],badge:'16'},
{id:35,t:'jeu',n:'Cartouche rétro',frame:'#b8bcc2',band:['top',46,'#8f949a'],win:[10,52,180,238],x:['screws'],rx:6},
{id:36,t:'jeu',n:'Boîte PC',frame:'#23262b',band:['top',20,'#2b2f36'],bandTxt:['PC','#4fa98c'],win:[6,21,188,273],rx:5},
{id:37,t:'jeu',n:'Cartouche GameBoy',frame:'#b8bcc2',band:['top',40,'#9aa0a6'],win:[16,48,168,220],x:['screws'],rx:6},
{id:38,t:'jeu',n:'Borne arcade',frame:'#3d0d15',band:['top',30,['#ff5da2','#7F5AF0']],win:[12,34,176,230],x:['joystick']},
{id:39,t:'jeu',n:'Console portable',frame:'#222222',win:[24,20,152,240],rx:16,wrx:8,x:['gamepad']},
{id:40,t:'jeu',n:'Coffret métal',frame:['#8a8f96','#3a3f46'],gd:1,win:[12,12,176,276],corners:'#c0c0c0',wstroke:'#aab0b8'},
{id:41,t:'jeu',n:'Boîte Sega',frame:'#0d0d12',band:['top',26,['#0060a8','#003060']],bandTxt:['SEGA','#ffd700'],win:[7,27,186,266],badge:'12'},
{id:42,t:'jeu',n:'Boîte Atari',frame:'#1a1a1a',band:['top',26,['#d33333','#ff8800']],win:[7,27,186,266],badge:'10'},
{id:43,t:'jeu',n:'Disque jeu',frame:'#111111',win:[8,8,184,284],x:['disc']},
{id:44,t:'jeu',n:'Manette',frame:'#17112E',win:[8,8,184,250],x:['gamepad']},
{id:45,t:'jeu',n:'Mini-borne',frame:'#c8352f',band:['top',24,'#ffd700'],win:[16,28,168,230],x:['joystick']},
{id:46,t:'manga',n:'Reliure + obi',frame:'#e9e2d0',spine:['right',29,'#5a1f1f'],spineTxt:['ベルセルク','#f3e9d2'],band:['bottom',37,'#c8352f'],win:[5,5,166,258],rx:4},
{id:47,t:'manga',n:'Reliure sobre',frame:'#e9e2d0',spine:['right',24,'#5a3a22'],win:[4,4,170,292],rx:3,wstroke:'#b7ad93'},
{id:48,t:'manga',n:'Tankōbon blanc',frame:'#f2efe6',spine:['right',22,'#f2efe6'],win:[4,4,172,292],rx:3,wstroke:'#c9c2b2'},
{id:49,t:'manga',n:'Grand format noir',frame:'#141416',spine:['right',24,'#0d0d0f'],win:[4,4,170,292],rx:3,wstroke:'#c0c0c0'},
{id:50,t:'manga',n:'Shonen vif',frame:'#f5f5f5',spine:['right',24,'#0060c0'],win:[4,4,170,292],rx:3,wstroke:'#ffd700',wsw:2},
{id:51,t:'manga',n:'Shojo',frame:'#fdf5f8',spine:['right',24,'#e06090'],win:[4,4,170,292],rx:3,x:['flowers'],wstroke:'#ffd0e0'},
{id:52,t:'manga',n:'Deluxe brillant',frame:'#0d0d0f',spine:['right',22,'#111111'],win:[4,4,170,292],rx:3,wstroke:'#c0c0c0',reflOp:0.16},
{id:53,t:'manga',n:'Kraft ficelle',frame:'#c9b98a',spine:['right',22,'#8a7440'],win:[4,4,170,292],rx:3,x:['string']},
{id:54,t:'manga',n:'Noir + obi argent',frame:'#101012',spine:['right',22,'#0a0a0a'],band:['bottom',30,'#c0c0c0'],win:[4,4,170,262],rx:3},
{id:55,t:'manga',n:'Vermillon torii',frame:'#e9e2d0',spine:['right',26,'#e04020'],win:[4,4,168,292],rx:3,x:['wave']},
{id:56,t:'manga',n:'Seinen vert',frame:'#f0f0ec',spine:['right',24,'#1a5a3a'],win:[4,4,170,292],rx:3,wstroke:'#1a5a3a'},
{id:57,t:'manga',n:'Grand format jaune',frame:'#f2c40e',spine:['right',24,'#111111'],win:[4,4,170,292],rx:3},
{id:58,t:'manga',n:'Boîte limitée',frame:['#3a2352','#1a1030'],gd:1,win:[12,12,176,276],corners:'#d9b45b',wstroke:'#d9b45b'},
{id:59,t:'manga',n:'Blanc minimal',frame:'#fafafa',win:[6,6,188,288],rx:3,wstroke:'#dddddd',refl:0},
{id:60,t:'manga',n:'Double-vol',frame:'#e9e2d0',spine:['right',34,'#5a3a22'],win:[4,4,160,292],rx:3,wstroke:'#b7ad93'},
{id:61,t:'bd',n:'Cartonné fers dorés',frame:['#7a1e2b','#3d0d15'],gd:1,spine:['left',12,'#2a080d'],win:[12,9,179,282],corners:'#d9b45b',wstroke:'#d9b45b'},
{id:62,t:'bd',n:'Kraft sobre',frame:'#8B6F47',spine:['left',10,'#6d5636'],win:[10,8,182,284],rx:4},
{id:63,t:'bd',n:'Dos carré coloré',frame:'#17112E',spine:['left',26,['#B24BF3','#7F5AF0']],win:[28,6,166,288],rx:4},
{id:64,t:'bd',n:'Comic US',frame:'#f2c40e',win:[11,11,178,278],wstroke:'#dd3333',wsw:4,refl:0},
{id:65,t:'bd',n:'Intégrale or',frame:'#0d0d0d',win:[12,12,176,252],wstroke:'#d9b45b',band:['bottom',24,'#d9b45b'],bandTxt:['INTÉGRALE','#0d0d0d',11]},
{id:66,t:'bd',n:'Vintage jauni',frame:'#d8c9a0',win:[10,8,182,284],rx:3,wstroke:'#a89868'},
{id:67,t:'bd',n:'Spirale',frame:'#274067',win:[20,8,172,284],rx:4,x:['spiral']},
{id:68,t:'bd',n:'Manfra violet',frame:'#17112E',spine:['left',24,'#7F5AF0'],win:[26,6,168,288],rx:4},
{id:69,t:'bd',n:'Album enfant',frame:'#2CB67D',win:[14,12,172,276],rx:16,wrx:10},
{id:70,t:'bd',n:'Édition nuit',frame:'#0a0a0a',win:[10,8,182,284],rx:4,wstroke:'#00c3e3',wsw:2},
{id:71,t:'bd',n:'Bleu nuit',frame:['#1a2a4a','#0a1226'],gd:1,win:[10,8,182,284],rx:4,wstroke:'#c0c0c0'},
{id:72,t:'bd',n:'Rouge éditeur',frame:['#c03028','#600c08'],gd:1,win:[10,8,182,284],rx:4,wstroke:'#ffffff'},
{id:73,t:'bd',n:'Cuir gaufré',frame:'#4a2c17',win:[14,10,174,280],rx:4,corners:'#b08d3e',wstroke:'#6a4a2a',wsw:2},
{id:74,t:'bd',n:'Tirage de tête',frame:['#6a4a2a','#3a2410'],gd:1,win:[16,14,168,272],corners:'#d9b45b',wstroke:'#d9b45b',wsw:2},
{id:75,t:'bd',n:'Comic argent',frame:['#c0c0c0','#707078'],gd:1,win:[10,8,182,284],rx:3,wstroke:'#111111',wsw:2},
{id:76,t:'roman',n:'Tranche + pages',frame:['#1d3a2a','#0d1f15'],gd:1,spine:['left',14,'#0a1810'],win:[14,5,178,288],rx:3},
{id:77,t:'roman',n:'Poche sobre',frame:'#17112E',win:[4,4,192,292],rx:2,wstroke:'#c9c2b2',wsw:3,refl:0},
{id:78,t:'roman',n:'Livre ancien',frame:'#4a2c17',win:[14,8,174,262],rx:4,corners:'#b08d3e',x:['signet'],wstroke:'#6a4a2a',wsw:2},
{id:79,t:'roman',n:'Grand format blanc',frame:'#f5f2ea',win:[8,6,186,288],rx:2,wstroke:'#b9b2a4',refl:0},
{id:80,t:'roman',n:'Poche vintage',frame:'#d8cf9a',win:[6,6,188,288],rx:2,wstroke:'#8a7440',wsw:2},
{id:81,t:'roman',n:'Grimoire',frame:'#2a1a0c',win:[16,12,168,276],rx:6,corners:'#b08d3e',x:['clasp'],wstroke:'#6a4a2a',wsw:2},
{id:82,t:'roman',n:'Poche moderne',frame:'#e0483a',band:['bottom',40,'#fafafa'],win:[6,6,188,250],rx:2},
{id:83,t:'roman',n:'Luxe tranche dorée',frame:'#0d0d0d',spine:['left',16,'#d9b45b'],win:[16,6,178,288],rx:2,x:['signet']},
{id:84,t:'roman',n:'Carnet journal',frame:'#c9b98a',win:[8,6,186,288],rx:6,x:['elastic']},
{id:85,t:'roman',n:'Liseuse e-ink',frame:'#8f949a',win:[14,14,172,252],rx:10,wrx:4,x:['home'],refl:0},
{id:86,t:'roman',n:'Livre audio',frame:'#17112E',win:[8,8,184,240],rx:4,x:['headphone']},
{id:87,t:'roman',n:'Poche noir',frame:'#111111',win:[5,5,190,290],rx:2,wstroke:'#fafafa',wsw:2,refl:0},
{id:88,t:'roman',n:'Beau livre photo',frame:'#fafafa',win:[16,16,168,268],rx:2,wstroke:'#dddddd',refl:0},
{id:89,t:'roman',n:'Reliure toile',frame:'#3a4a5a',win:[12,8,178,284],rx:3,wstroke:'#c9c2b2'},
{id:90,t:'roman',n:'Novella fine',frame:'#e9e2d0',spine:['left',8,'#b7ad93'],win:[8,5,186,290],rx:2},
{id:91,t:'libre',n:'Cadre violet',frame:'#17112E',win:[7,7,186,286],rx:10,wstroke:'#B24BF3',wsw:4},
{id:92,t:'libre',n:'Néon glow',frame:null,glow:'#B24BF3'},
{id:93,t:'libre',n:'Affiche nue',frame:null,nue:1},
{id:94,t:'libre',n:'Polaroïd',frame:'#fafafa',band:['bottom',58,'#fafafa'],win:[12,12,176,222],rx:2,refl:0},
{id:95,t:'libre',n:'Affiche scotchée',frame:null,scotch:1},
{id:96,t:'libre',n:'Cadre argent',frame:['#c0c0c0','#707078'],gd:1,win:[12,12,176,276],rx:3,wstroke:'#eeeeee'},
{id:97,t:'libre',n:'Cadre bois',frame:['#8a6a3a','#4a3418'],gd:1,win:[14,14,172,272],rx:4,wstroke:'#2a1c0c'},
{id:98,t:'libre',n:'Néon rose',frame:null,glow:'#FF5DA2'},
{id:99,t:'libre',n:'Hologramme',frame:'#17112E',win:[6,6,188,288],rx:8,wstroke:'#00c3e3',reflOp:0.14},
{id:100,t:'libre',n:'Blanc minimal',frame:'#fafafa',win:[6,6,188,288],rx:2,wstroke:'#ffffff',wsw:2,refl:0},
{id:101,t:'libre',n:'Galerie noire',frame:'#0a0a0a',win:[18,18,164,264],rx:2,wstroke:'#fafafa'},
{id:102,t:'libre',n:'Affiche pliée',frame:null,fold:1},
{id:103,t:'libre',n:'Sous verre',frame:'#c0c0c6',win:[10,10,180,280],rx:2,wstroke:'#eeeeee',reflOp:0.18},
{id:104,t:'libre',n:'Néon cyan',frame:null,glow:'#00c3e3'},
{id:105,t:'libre',n:'Ombre longue',frame:null,long:1}
];

function getSkinById(id){
  return SKINS.find(function(s){return s.id===id;}) || SKINS[0];
}
function defaultSkinForType(type){
  var s = settingsLoad();
  if(type==="Film") return s.skinFilm;
  if(type==="S\u00e9rie") return s.skinSerie;
  if(type==="Jeu") return s.skinJeu;
  if(type==="Manga") return s.skinManga;
  if(type==="BD") return s.skinBD;
  if(type==="Roman") return s.skinRoman;
  return s.skinLibre;
}
