/* ===== HELPERS IMAGE ===== */
function fileToResized(file, maxW){
  return new Promise(function(res,rej){
    var r=new FileReader();
    r.onload=function(){ var img=new Image();
      img.onload=function(){ var sc=Math.min(1,maxW/img.width); var c=document.createElement('canvas');
        c.width=Math.round(img.width*sc); c.height=Math.round(img.height*sc);
        c.getContext('2d').drawImage(img,0,0,c.width,c.height); res(c.toDataURL('image/jpeg',0.82)); };
      img.onerror=rej; img.src=r.result; };
    r.onerror=rej; r.readAsDataURL(file);
  });
}

/* ===== NAVIGATION ===== */
function switchView(v){
  ST.view=v;
  document.querySelectorAll('nav.tabbar button').forEach(function(b){ b.classList.toggle('active', b.dataset.view===v); });
  document.querySelectorAll('.view').forEach(function(x){ x.classList.remove('active'); });
  document.getElementById('view-'+v).classList.add('active');
  if(v==='collection') renderCollection();
  if(v==='journal') renderJournal();
  if(v==='options') renderOptions();
}

/* ===== CHIPS DE TYPE ===== */
function buildTypeChips(){
  var c = document.getElementById('type-chips'); c.innerHTML='';
  allTypes().forEach(function(t){
    var chip = el('div','chip'+(t===ST.currentType?' on':''), t);
    chip.addEventListener('click', function(){ ST.currentType=t; buildTypeChips(); clearResults(); });
    c.appendChild(chip);
  });
  var plus = el('div','chip','+ libre');
  plus.addEventListener('click', function(){
    var name = prompt('Nom du type libre :');
    if(!name) return;
    var ct = loadCustomTypes(); ct.push({name:name.trim()}); saveCustomTypes(ct);
    ST.currentType = name.trim(); buildTypeChips();
  });
  c.appendChild(plus);
}
function clearResults(){ document.getElementById('results').innerHTML=''; document.getElementById('fallback').innerHTML=''; document.getElementById('search-status').textContent=''; }

/* ===== RECHERCHE ===== */
async function runSearch(){
  var q = document.getElementById('search-input').value.trim();
  if(!q){ document.getElementById('search-status').textContent='Tape un titre.'; return; }
  addRecent(q);
  document.getElementById('fallback').innerHTML='';
  document.getElementById('search-status').textContent='Recherche\u2026';
  document.getElementById('results').innerHTML='<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  var s = settingsLoad();
  try{
    var results=[];
    if(ST.currentType==='Film'){ results=(await searchTMDB(q,'movie')).filter(function(r){return !(r.raw.genre_ids||[]).includes(99);}); }
    else if(ST.currentType==='Documentaire'){ var rr=await searchTMDB(q,'movie'); var ff=rr.filter(function(r){return (r.raw.genre_ids||[]).includes(99);}); results=ff.length?ff:rr; }
    else if(ST.currentType==='S\u00e9rie'){ results=await searchTMDB(q,'tv'); }
    else if(['Manga','BD','Roman'].includes(ST.currentType)){ results=await searchBooks(q, ST.currentType); }
    else if(ST.currentType==='Jeu'){ results=await searchRAWG(q); }
    else { results=await searchBooks(q, ST.currentType); }
    // filtres avancés
    if(s.searchMode==='avance'){
      var ymin=parseInt(document.getElementById('adv-year-min').value,10), ymax=parseInt(document.getElementById('adv-year-max').value,10);
      var nmin=parseInt(document.getElementById('adv-note-min').value,10), plat=document.getElementById('adv-platform').value.trim().toLowerCase();
      if(ymin) results=results.filter(function(r){return !r.year||parseInt(r.year,10)>=ymin;});
      if(ymax) results=results.filter(function(r){return !r.year||parseInt(r.year,10)<=ymax;});
      if(nmin) results=results.filter(function(r){ return r.rating==null || r.rating>=nmin; });
      if(plat) results=results.filter(function(r){ return !r.platforms || r.platforms.join(' ').toLowerCase().includes(plat); });
    }
    document.getElementById('results').innerHTML='';
    if(!results.length){
      document.getElementById('search-status').textContent='Aucun r\u00e9sultat en '+ST.currentType+'.';
      showFallback();
    } else {
      document.getElementById('search-status').textContent=results.length+' r\u00e9sultat(s)';
      renderResults(results);
    }
  }catch(err){
    console.error(err);
    document.getElementById('results').innerHTML='';
    document.getElementById('search-status').className='status error';
    document.getElementById('search-status').textContent='Erreur : '+(err.message||'');
  }
}
function showFallback(){
  var f = document.getElementById('fallback'); f.innerHTML='';
  f.appendChild(el('div','','Essayer plut\u00f4t dans :'));
  var w = el('div','chips small');
  allTypes().filter(function(t){return t!==ST.currentType;}).forEach(function(t){
    var c=el('div','chip',t); c.addEventListener('click', function(){ ST.currentType=t; buildTypeChips(); runSearch(); }); w.appendChild(c);
  });
  f.appendChild(w);
}
function renderResults(list){
  var c = document.getElementById('results'); c.innerHTML='';
  list.forEach(function(item){
    var card = el('div','rcard');
    var img = el('img','poster'); img.src=item.poster||NO_POSTER; img.loading='lazy';
    var info = el('div','rinfo');
    info.appendChild(el('div','rtitle', esc(item.title||'')));
    var parts=[]; if(item.year)parts.push(item.year); if(item.author)parts.push(item.author);
    info.appendChild(el('div','rmeta', parts.join(' \u2022 ')));
    card.append(img,info);
    card.addEventListener('click', function(){ ST.selectedItem=item; renderPanel(null); openModal(); });
    c.appendChild(card);
    if(item.source==='rawg') fetchSteamGrid(item.title).then(function(cv){ if(cv){ item.poster=cv; img.src=cv; } });
  });
}
/* APIs */
async function searchTMDB(q,kind){
  var res=await fetch(PROXY+'/tmdb/search/'+kind+'?language=fr-FR&query='+encodeURIComponent(q));
  if(!res.ok) throw new Error('TMDB '+res.status);
  var d=await res.json();
  return (d.results||[]).slice(0,20).map(function(r){ return {source:'tmdb_'+kind,id:r.id,title:kind==='movie'?r.title:r.name,year:(kind==='movie'?r.release_date:r.first_air_date||'').slice(0,4),poster:r.poster_path?TMDB_IMG+r.poster_path:null,rating:r.vote_average?Math.round(r.vote_average/1):null,raw:r}; });
}
async function searchRAWG(q){
  var res=await fetch(PROXY+'/rawg/games?search='+encodeURIComponent(q)+'&page_size=15');
  if(!res.ok) throw new Error('RAWG '+res.status);
  var d=await res.json();
  return (d.results||[]).map(function(g){ return {source:'rawg',id:g.id,title:g.name,year:(g.released||'').slice(0,4),poster:g.background_image,platforms:(g.platforms||[]).map(function(p){return p.platform.name;}),raw:g}; });
}
async function searchGoogleBooks(q,type){
  var query=q; if(type==='BD')query+=' bande dessin\u00e9e comics'; if(type==='Manga')query+=' manga'; if(type==='Roman')query+=' roman fiction';
  var res=await fetch(PROXY+'/books/v1/volumes?maxResults=20&q='+encodeURIComponent(query)+'&filter=full');
  if(!res.ok) throw new Error('Books '+res.status);
  var d=await res.json();
  return (d.items||[]).map(function(it){ var v=it.volumeInfo||{}; var p=v.imageLinks?(v.imageLinks.thumbnail||v.imageLinks.smallThumbnail):null; if(!p&&it.id)p='https://books.google.com/books/content?id='+it.id+'&printsec=frontcover&img=1&zoom=1';
    return {source:'book',id:it.id,title:v.title+(v.subtitle?' \u2014 '+v.subtitle:''),year:(v.publishedDate||'').slice(0,4),author:(v.authors||[]).join(', '),poster:p,categories:v.categories||[],raw:v}; });
}
async function searchOpenLib(q,type){
  var query=q; if(type==='BD')query+=' graphic novel'; if(type==='Manga')query+=' manga';
  var res=await fetch('https://openlibrary.org/search.json?q='+encodeURIComponent(query)+'&limit=20&fields=title,author_name,first_publish_year,cover_i,key,subject');
  if(!res.ok) throw new Error('OpenLib '+res.status);
  var d=await res.json();
  return (d.docs||[]).map(function(x){ return {source:'openlib',id:x.key,title:x.title,year:x.first_publish_year?String(x.first_publish_year):'',author:(x.author_name||[]).join(', '),poster:x.cover_i?('https://covers.openlibrary.org/b/id/'+x.cover_i+'-M.jpg'):null,categories:x.subject||[],raw:x}; });
}
function relevantForType(item,type){
  var cats=Array.isArray(item.categories)?item.categories.join(' '):'';
  var text=(cats+' '+(item.title||'')).toLowerCase();
  var comic=text.includes('comic')||text.includes('graphic novel')||text.includes('bande dessin')||text.includes(' bd ');
  var manga=text.includes('manga');
  if(type==='BD') return !(manga&&!comic);
  if(type==='Manga') return manga||!comic;
  if(type==='Roman') return !(comic||manga);
  return true;
}
async function searchBooks(q,type){
  var r=await Promise.allSettled([searchGoogleBooks(q,type), searchOpenLib(q,type)]);
  var a=r[0].status==='fulfilled'?r[0].value:[];
  var b=r[1].status==='fulfilled'?r[1].value:[];
  var merged=a.concat(b).filter(function(i){return relevantForType(i,type);});
  var seen={}; return merged.filter(function(i){ var k=norm(i.title).slice(0,30); if(!k||seen[k])return false; seen[k]=1; return true; });
}
async function fetchSteamGrid(name){
  try{
    var s=await fetch(PROXY+'/steamgrid/search/autocomplete/'+encodeURIComponent(name)); if(!s.ok)return null;
    var sd=await s.json(); if(!sd.success||!sd.data||!sd.data.length)return null;
    var g=await fetch(PROXY+'/steamgrid/grids/game/'+sd.data[0].id+'?dimensions=600x900&styles=alternate'); if(!g.ok)return null;
    var gd=await g.json(); if(!gd.success||!gd.data||!gd.data.length)return null;
    return gd.data[0].url;
  }catch(e){ return null; }
}
/* recherches récentes */
function addRecent(t){ var r=JSON.parse(localStorage.getItem('recent_searches')||'[]'); r=[t].concat(r.filter(function(x){return x!==t;})).slice(0,6); localStorage.setItem('recent_searches',JSON.stringify(r)); ST.recent=r; }
function showRecent(){
  var p=document.getElementById('recent-pop');
  if(!p.classList.contains('hidden')){ p.classList.add('hidden'); return; }
  p.innerHTML=''; ST.recent.forEach(function(t){ var b=el('button','',esc(t)); b.addEventListener('click', function(){ document.getElementById('search-input').value=t; p.classList.add('hidden'); runSearch(); }); p.appendChild(b); });
  p.classList.remove('hidden');
}

/* ===== SHEET ===== */
function flatten(e){ return { titre:e.titre, description:descriptionOf(e), type:e.type, note:e.note!=null?e.note:'', statut:statutStr(e), horodatage:e.dateFin||'' }; }
async function copyTSV(){
  var clean=function(v){ return String(v==null?'':v).replace(/[\t\r\n]+/g,' '); };
  var rows=[['Titre','Description','Type','Note','Statut','Horodatage']];
  ST.entries.forEach(function(e){ var f=flatten(e); rows.push([clean(f.titre),clean(f.description),clean(f.type),clean(f.note),clean(f.statut),clean(f.horodatage)]); });
  var text = rows.map(function(r){return r.join('\t');}).join('\n');
  try{ await navigator.clipboard.writeText(text); toast('\u{1F4CB} Copi\u00e9 ! Colle dans ton Sheet (A1).'); }
  catch(e){ var ta=el('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('\u{1F4CB} Copi\u00e9 !'); }
}
async function syncSheet(){
  var url=localStorage.getItem('sheet_url');
  if(!url){ toast('Configure d\u2019abord l\u2019URL dans \u{1F6E0}.'); switchView('options'); return; }
  toast('Envoi au Sheet\u2026',2500);
  try{
    var res=await fetch(url,{method:'POST',body:JSON.stringify({action:'sync_all',entries:ST.entries.map(flatten)})});
    if(res.ok) toast('Sheet mis \u00e0 jour !'); else toast('Erreur webhook '+res.status,3000);
  }catch(err){ toast('Erreur sync. Utilise \u{1F4CB} en secours.',3000); }
}

/* ===== EXPORT / IMPORT ===== */
async function exportJSON(){
  var perso = await skinPersoAll();
  var data={version:'V6', exportDate:new Date().toISOString(), settings:settingsLoad(), customTypes:loadCustomTypes(), skinsPerso:perso, sheetUrl:localStorage.getItem('sheet_url')||'', entries:ST.entries};
  var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  var u=URL.createObjectURL(blob); var a=el('a'); a.href=u; a.download='mes-notes-backup-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(u);
  localStorage.setItem('last_backup', String(Date.now()));
  toast('Backup export\u00e9 !');
}
function importJSON(){
  var inp=el('input'); inp.type='file'; inp.accept='application/json';
  inp.addEventListener('change', async function(ev){
    var f=ev.target.files[0]; if(!f)return;
    var r=new FileReader();
    r.onload=async function(e){
      try{
        var data=JSON.parse(e.target.result);
        var list=data.entries||(Array.isArray(data)?data:[]);
        var ids={}; ST.entries.forEach(function(x){ids[x.id]=1;});
        var added=0, skipped=0;
        for(var i=0;i<list.length;i++){ var en=list[i];
          if(en&&en.id&&!ids[en.id]){ if(!en.titre)en.titre='Sans titre'; if(!en.dateAjout)en.dateAjout=new Date().toISOString(); await dbPut(en); added++; } else skipped++; }
        if(data.settings) settingsSave(Object.assign({},SETTINGS_DEFAULTS,data.settings));
        if(data.customTypes) saveCustomTypes(data.customTypes);
        if(data.skinsPerso) for(var j=0;j<data.skinsPerso.length;j++) await skinPersoAdd(data.skinsPerso[j]);
        if(data.sheetUrl) localStorage.setItem('sheet_url', data.sheetUrl);
        applySettings(); buildTypeChips(); await refreshAll();
        toast('Import : '+added+' ajout\u00e9(s), '+skipped+' d\u00e9j\u00e0 pr\u00e9sent(s)');
      }catch(err){ toast('JSON invalide.',3000); }
    };
    r.readAsText(f);
  });
  inp.click();
}

/* ===== SCAN EAN (Android) ===== */
async function startEAN(onResult){
  if(!('BarcodeDetector' in window)){ toast('Scan non support\u00e9 ici. Saisis le code \u00e0 la main.',3000); return; }
  try{
    var stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
    var video=document.getElementById('ean-video');
    video.srcObject=stream; await video.play();
    document.getElementById('ean-overlay').classList.add('active');
    var det=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e']});
    var timer=setInterval(async function(){
      try{
        var codes=await det.detect(video);
        if(codes.length){ clearInterval(timer); stream.getTracks().forEach(function(t){t.stop();}); document.getElementById('ean-overlay').classList.remove('active'); onResult(codes[0].rawValue); }
      }catch(e){}
    },400);
    document.getElementById('ean-cancel').onclick=function(){ clearInterval(timer); stream.getTracks().forEach(function(t){t.stop();}); document.getElementById('ean-overlay').classList.remove('active'); };
  }catch(e){ toast('Cam\u00e9ra indisponible.',3000); }
}

/* ===== PARTAGE JPG ===== */
async function shareJPG(e){
  toast('G\u00e9n\u00e9ration\u2026');
  var W=600,H=840;
  var cv=document.createElement('canvas'); cv.width=W; cv.height=H;
  var ctx=cv.getContext('2d');
  var g=ctx.createLinearGradient(0,0,W,H); g.addColorStop(0,'#0D0A1F'); g.addColorStop(1,'#1F1738');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#B24BF3'; ctx.lineWidth=3; ctx.strokeRect(14,14,W-28,H-28);
  var img=new Image(); img.crossOrigin='anonymous';
  await new Promise(function(res){ img.onload=res; img.onerror=res; img.src=e.posterUrl||NO_POSTER; });
  var pw=300,ph=450,px=(W-pw)/2,py=60;
  try{ ctx.drawImage(img,px,py,pw,ph); }catch(err){}
  ctx.fillStyle='#EFECE6'; ctx.font='700 34px Georgia'; ctx.textAlign='center';
  ctx.fillText(e.titre, W/2, py+ph+60, W-80);
  ctx.fillStyle='#B24BF3'; ctx.font='600 26px monospace';
  ctx.fillText((e.note!=null?e.note+'/10':'\u2014/10')+'  '+statutStr(e), W/2, py+ph+100);
  ctx.fillStyle='#8B83A8'; ctx.font='18px monospace';
  ctx.fillText(e.type+(e.dateFin?' \u2022 '+formatDate(e.dateFin):''), W/2, py+ph+132);
  ctx.fillStyle='#8B83A8'; ctx.font='14px monospace';
  ctx.fillText('Mes Notes \u2022 Ma Collection', W/2, H-40);
  var url=cv.toDataURL('image/jpeg',0.9);
  var a=el('a'); a.href=url; a.download='mes-notes-'+norm(e.titre)+'.jpg'; document.body.appendChild(a); a.click(); a.remove();
  toast('Image JPG enregistr\u00e9e !');
}

/* ===== PWA / INSTALL ===== */
var deferredPrompt=null;
window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); deferredPrompt=e; document.getElementById('install-btn').classList.remove('hidden'); });
function triggerInstall(){ if(deferredPrompt){ deferredPrompt.prompt(); } else toast('Utilise le menu \u22EE \u2192 Installer l\u2019application.'); }

/* ===== INIT ===== */
async function init(){
  await openDB();
  ST.entries = await dbAll();
  var s = settingsLoad();
  applySettings();
  ST.currentType = s.defaultType || 'Film';
  ST.colGroup = !!s.colGroup;
  ST.recent = JSON.parse(localStorage.getItem('recent_searches')||'[]');
  buildTypeChips();
  // tabbar
  document.querySelectorAll('nav.tabbar button').forEach(function(b){ b.addEventListener('click', function(){ switchView(b.dataset.view); }); });
  // search wiring
  document.getElementById('search-btn').addEventListener('click', runSearch);
  document.getElementById('search-input').addEventListener('keydown', function(e){ if(e.key==='Enter') runSearch(); });
  document.getElementById('manual-btn').addEventListener('click', function(){ ST.selectedItem=null; renderPanel(null); openModal(); });
  document.getElementById('recent-btn').addEventListener('click', showRecent);
  document.querySelectorAll('#search-mode button').forEach(function(b){
    b.addEventListener('click', function(){
      document.querySelectorAll('#search-mode button').forEach(function(x){x.classList.remove('on');}); b.classList.add('on');
      s.searchMode=b.dataset.m; settingsSave(s);
      document.getElementById('adv-panel').classList.toggle('hidden', s.searchMode!=='avance');
    });
  });
  // collection wiring
  document.getElementById('col-search').addEventListener('input', function(e){ ST.colQuery=e.target.value; renderCollection(); });
  var fc=document.getElementById('col-filters');
  [['all','Toutes'],['fav','\u{1F49C}'],['enc','\u23F3'],['voir','\u{1F440}'],['phys','\u{1F4E6}']].forEach(function(f){
    var c=el('div','chip'+(f[0]==='all'?' on':''), f[1]);
    c.addEventListener('click', function(){ ST.colFilter=f[0]; fc.querySelectorAll('.chip').forEach(function(x){x.classList.remove('on');}); c.classList.add('on'); renderCollection(); });
    fc.appendChild(c);
  });
  document.getElementById('col-sort').addEventListener('change', function(e){ ST.colSort=e.target.value; renderCollection(); });
  document.getElementById('col-notemin').addEventListener('input', function(e){ ST.colNoteMin=parseInt(e.target.value,10)||0; document.getElementById('col-notemin-val').textContent=ST.colNoteMin; renderCollection(); });
  document.getElementById('col-group').addEventListener('click', function(){ ST.colGroup=!ST.colGroup; s.colGroup=ST.colGroup; settingsSave(s); renderCollection(); });
  // journal wiring
  document.getElementById('j-cal-btn').addEventListener('click', function(){ ST.calOpen=!ST.calOpen; document.getElementById('j-cal').classList.toggle('hidden',!ST.calOpen); if(ST.calOpen) renderCalendar(); });
  document.getElementById('bilan-prev').addEventListener('click', function(){ ST.recapDate.setMonth(ST.recapDate.getMonth()-1); renderBilan(); });
  document.getElementById('bilan-next').addEventListener('click', function(){ ST.recapDate.setMonth(ST.recapDate.getMonth()+1); renderBilan(); });
  // modales
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', function(e){ if(e.target.id==='modal-overlay') closeModal(); });
  document.getElementById('qn-close').addEventListener('click', quickNoteClose);
  document.getElementById('qn-cancel').addEventListener('click', quickNoteClose);
  document.getElementById('qn-save').addEventListener('click', quickNoteSave);
  document.getElementById('poster-close').addEventListener('click', posterClose);
  document.getElementById('poster-link-btn').addEventListener('click', function(){ document.getElementById('poster-url-row').classList.toggle('hidden'); });
  document.getElementById('poster-url-save').addEventListener('click', function(){ var v=document.getElementById('poster-url-input').value.trim(); if(v) posterApply(v); });
  document.getElementById('poster-import-btn').addEventListener('click', function(){ document.getElementById('poster-file').click(); });
  document.getElementById('poster-file').addEventListener('change', async function(ev){ var f=ev.target.files[0]; if(!f)return; var url=await fileToResized(f,500); posterApply(url); ev.target.value=''; });
  document.getElementById('install-btn').addEventListener('click', triggerInstall);
  // rendu initial
  renderCollection(); renderJournal(); renderOptions();
  // alerte backup
  var lb=parseInt(localStorage.getItem('last_backup')||'0',10);
  if(ST.entries.length && s.alertBackupDays>0 && Date.now()-lb > s.alertBackupDays*86400000) toast('\u26A0\uFE0F Pense \u00e0 ta sauvegarde \u{1F4E4} (\u{1F6E0})',4000);
  // SW
  if('serviceWorker' in navigator){ try{ navigator.serviceWorker.register('./sw.js'); }catch(e){} }
}
init();
