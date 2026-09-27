/* ===== ÉTAT GLOBAL ===== */
var ST = {
  entries:[], view:'search', colFilter:'all', colQuery:'', colSort:'date-desc', colNoteMin:0, colGroup:false,
  recapDate:new Date(), calOpen:false, calDate:new Date(),
  editing:null, selectedItem:null, currentType:'Film', currentNote:null,
  isFav:false, isEnc:false, isVoir:false, draftJournal:[], panelMode:'simple', panelPoster:'',
  qnEntry:null, qnKind:'time', recent:[]
};
function el(tag, cls, html){ var d=document.createElement(tag); if(cls)d.className=cls; if(html!=null)d.innerHTML=html; return d; }
function toast(msg, t){ var e=document.getElementById('toast'); e.textContent=msg; e.classList.add('show'); setTimeout(function(){e.classList.remove('show');}, t||1800); }
function openModal(){ var o=document.getElementById('modal-overlay'); o.classList.add('active'); o.setAttribute('aria-hidden','false'); }
function closeModal(){ var o=document.getElementById('modal-overlay'); o.classList.remove('active'); o.setAttribute('aria-hidden','true'); document.getElementById('m-body').innerHTML=''; document.getElementById('m-foot').innerHTML=''; document.getElementById('m-title').textContent=''; ST.editing=null; }
function setModal(title, bodyNode, foot){
  document.getElementById('m-title').textContent=title;
  var b=document.getElementById('m-body'); b.innerHTML=''; b.appendChild(bodyNode);
  var f=document.getElementById('m-foot'); f.innerHTML='';
  (foot||[]).forEach(function(bt){ var btn=el('button', bt[1]||'', bt[0]); btn.addEventListener('click', bt[2]); f.appendChild(btn); });
  openModal();
}
async function refreshAll(){ ST.entries = await dbAll(); renderCollection(); renderJournal(); }

/* ===== BOÎTIERS ===== */
function renderBox(entry, override){
  var sid = override || entry.skin || defaultSkinForType(entry.type);
  var skin = getSkinById(sid);
  var box = el('div','box');
  if(skin.glow){ box.classList.add('glow'); box.style.setProperty('--gc', skin.glow); }
  if(skin.nue) box.classList.add('nue');
  if(skin.long) box.classList.add('long');
  var img = el('img','art'); img.src = entry.posterUrl || NO_POSTER; img.alt=''; img.loading='lazy';
  box.appendChild(img);
  var svgHTML = buildSkin(skin);
  if(skin.scotch) svgHTML = '<svg viewBox="0 0 200 300">'+X.scotch+'</svg>';
  if(skin.fold) svgHTML = '<svg viewBox="0 0 200 300">'+X.fold+'</svg>';
  if(svgHTML) box.insertAdjacentHTML('beforeend', svgHTML);
  return box;
}

/* ===== COLLECTION ===== */
function collectionCard(e, idx){
  var card = el('div','hcard'+(e.enCours?' encours':''));
  card.style.animationDelay = (Math.min(idx,12)*0.03)+'s';
  card.appendChild(renderBox(e));
  var col = el('div','hcol');
  col.appendChild(el('div','htitle', esc(e.titre)+' '+statutStr(e)));
  var meta = e.type+' \u2022 '+(e.note!=null?e.note+'/10':'\u2014/10');
  if(e.sousTitre) meta += ' \u2022 '+esc(e.sousTitre);
  if(e.dateFin) meta += ' \u2022 '+esc(formatDate(e.dateFin));
  col.appendChild(el('div','hmeta', meta));
  var lines = journalLines(e);
  if(lines.length) col.appendChild(el('div','hsum','\u201C'+esc(lines[lines.length-1])+'\u201D'));
  var btns = el('div','hbtns');
  var bSC=el('button','sc','SC'); bSC.title='SensCritique';
  var bEd=el('button','',I.edit); bEd.title='Modifier';
  var bQn=el('button','',I.plus); bQn.title='Noter vite';
  var bDel=el('button','',I.trash); bDel.title='Supprimer';
  [bSC,bEd,bQn,bDel].forEach(function(b){btns.appendChild(b);});
  col.appendChild(btns); card.appendChild(col);
  card.addEventListener('click', function(ev){ if(ev.target.closest('button')) return; showDetail(e); });
  bSC.addEventListener('click', function(){ window.open('https://www.senscritique.com/recherche?query='+encodeURIComponent(e.titre),'_blank'); });
  bEd.addEventListener('click', function(){ renderPanel(e); });
  bQn.addEventListener('click', function(){ quickNoteOpen(e); });
  bDel.addEventListener('click', async function(){ if(confirm('Supprimer \u00AB'+e.titre+'\u00BB ?')){ await dbDelete(e.id); toast('Supprim\u00e9'); await refreshAll(); } });
  return card;
}
async function renderCollection(){
  var list = ST.entries.slice();
  var q = norm(ST.colQuery);
  if(q) list = list.filter(function(e){ return norm(e.titre).includes(q)||norm(e.type).includes(q)||norm(e.sousTitre).includes(q)||norm(descriptionOf(e)).includes(q)||norm(e.comment||'').includes(q)||norm(e.support||'').includes(q)||norm(e.packaging||'').includes(q); });
  if(ST.colFilter==='fav') list=list.filter(function(e){return e.isFavorite;});
  if(ST.colFilter==='enc') list=list.filter(function(e){return e.enCours;});
  if(ST.colFilter==='voir') list=list.filter(function(e){return e.aVoir;});
  if(ST.colFilter==='phys') list=list.filter(function(e){return e.inCollection;});
  if(ST.colNoteMin>0) list=list.filter(function(e){return e.note!=null && e.note>=ST.colNoteMin;});
  var byDate=function(e){var p=parseDateFR(e.dateFin); return p?p.y*10000+p.mo*100+p.d:0;};
  if(ST.colSort==='date-desc') list.sort(function(a,b){return byDate(b)-byDate(a)||(b.dateAjout||'').localeCompare(a.dateAjout||'');});
  if(ST.colSort==='date-asc') list.sort(function(a,b){return byDate(a)-byDate(b);});
  if(ST.colSort==='note-desc') list.sort(function(a,b){return (b.note!=null?b.note:-1)-(a.note!=null?a.note:-1);});
  if(ST.colSort==='titre-asc') list.sort(function(a,b){return a.titre.localeCompare(b.titre,'fr');});
  if(ST.colSort==='type') list.sort(function(a,b){return a.type.localeCompare(b.type,'fr')||a.titre.localeCompare(b.titre,'fr');});
  var stats={}, enc=0, phys=0, fav=0, voir=0, sum=0, cnt=0;
  ST.entries.forEach(function(e){ stats[e.type]=(stats[e.type]||0)+1; if(e.enCours)enc++; if(e.inCollection)phys++; if(e.isFavorite)fav++; if(e.aVoir)voir++; if(e.note!=null){sum+=e.note;cnt++;} });
  var sHTML = Object.keys(stats).map(function(t){ return '<div class="sline"><span>'+esc(t)+' '+statutIconCount(ST.entries,t)+'</span><b>'+stats[t]+'</b></div>'; }).join('');
  sHTML += '<div class="sline"><span>\u23F3 / \u{1F440} / \u{1F49C} / \u{1F4E6}</span><b>'+enc+' / '+voir+' / '+fav+' / '+phys+'</b></div>';
  sHTML += '<div class="sline"><span>Note moyenne</span><b>'+(cnt?(sum/cnt).toFixed(1):'\u2014')+'/10</b></div>';
  document.getElementById('col-stats').innerHTML = '<div class="serif" style="color:var(--acc);font-size:14px;margin-bottom:6px;">\u{1F4CA} Stats</div>'+(sHTML||'<div class="empty">Aucune donn\u00e9e</div>');
  var top = ST.entries.filter(function(e){return e.note!=null;}).sort(function(a,b){return b.note-a.note;}).slice(0,5);
  document.getElementById('col-top').innerHTML = '<div class="serif" style="color:var(--acc);font-size:14px;margin-bottom:6px;">\u{1F3C6} Top 5</div>'+(top.map(function(e,i){return '<div class="sline"><span>'+(i+1)+'. '+esc(e.titre)+'</span><b>'+e.note+'/10</b></div>';}).join('')||'<div class="empty">Pas encore de notes</div>');
  var grid = document.getElementById('col-grid'); grid.innerHTML='';
  if(!list.length){ grid.appendChild(el('div','empty','Aucune '+OE+'uvre ne correspond.')); return; }
  if(ST.colGroup){
    var types=[]; list.forEach(function(e){ if(types.indexOf(e.type)<0)types.push(e.type); });
    types.forEach(function(t){
      grid.appendChild(el('div','serif','<span style="color:var(--acc);font-size:14px;">'+esc(t)+'</span>'));
      list.filter(function(e){return e.type===t;}).forEach(function(e,i){ grid.appendChild(collectionCard(e,i)); });
    });
  } else list.forEach(function(e,i){ grid.appendChild(collectionCard(e,i)); });
}

/* ===== JOURNAL ===== */
async function renderJournal(){
  var enc = ST.entries.filter(function(e){return e.enCours;});
  var row = document.getElementById('j-encours'); row.innerHTML='';
  if(enc.length){
    enc.forEach(function(e){
      var m = el('div','mini'); m.appendChild(renderBox(e));
      m.appendChild(el('div','t', esc(e.titre)));
      var lines=journalLines(e);
      m.appendChild(el('div','s', esc(lines.length?lines[lines.length-1]:'En cours\u2026')));
      m.addEventListener('click', function(){ showDetail(e); });
      row.appendChild(m);
    });
  } else row.appendChild(el('div','empty','Rien en cours pour le moment.'));
  var feed=[];
  ST.entries.forEach(function(e){ (e.journal||[]).forEach(function(x){ feed.push({e:e,x:x,at:x.at||0}); }); });
  feed.sort(function(a,b){return b.at-a.at;});
  var f = document.getElementById('j-feed'); f.innerHTML='';
  f.appendChild(el('div','serif','<span style="color:var(--acc);font-size:14px;">\u{1F4D6} Flux du journal</span>'));
  if(!feed.length) f.appendChild(el('div','empty','Aucune entr\u00e9e de journal.'));
  feed.slice(0,60).forEach(function(it){
    var item = el('div','fitem'); item.appendChild(el('div','fdot'));
    var body = el('div');
    var tag = it.x.kind==='time'?('\u{1F5D3}\uFE0F '+it.x.ts):(it.x.kind==='ep'?('\u{1F4FA} S'+pad2(it.x.s)+'E'+pad2(it.x.e)+(it.x.note!=null?' \u2022 '+it.x.note+'/10':'')):'\u270F\uFE0F');
    body.appendChild(el('div','ftime', tag));
    body.appendChild(el('div','ftext', esc(it.x.text||'')));
    body.appendChild(el('div','fwork', esc(it.e.titre)));
    item.appendChild(body);
    item.addEventListener('click', function(){ showDetail(it.e); });
    f.appendChild(item);
  });
  renderBilan();
  if(ST.calOpen) renderCalendar();
}
function renderBilan(){
  var y=ST.recapDate.getFullYear(), mo=ST.recapDate.getMonth();
  var names=['Janvier','F\u00e9vrier','Mars','Avril','Mai','Juin','Juillet','Ao\u00fbt','Septembre','Octobre','Novembre','D\u00e9cembre'];
  document.getElementById('bilan-title').textContent = '\u{1F381} '+names[mo]+' '+y;
  var month = ST.entries.filter(function(e){ var p=parseDateFR(e.dateFin); return p&&p.y===y&&p.mo===mo+1; });
  var fav = month.filter(function(e){return e.isFavorite;});
  var avg = month.filter(function(e){return e.note!=null;});
  document.getElementById('bilan-body').innerHTML =
    '<div class="sline"><span>'+OEC+'uvres termin\u00e9es</span><b>'+month.length+'</b></div>'+
    '<div class="sline"><span>Note moyenne</span><b>'+(avg.length?(avg.reduce(function(s,e){return s+e.note;},0)/avg.length).toFixed(1):'\u2014')+'/10</b></div>'+
    '<div class="sline"><span>Coups de c\u0153ur</span><b>'+(fav.length?fav.map(function(e){return esc(e.titre);}).join(', '):'aucun')+'</b></div>';
}
function renderCalendar(){
  var cal = document.getElementById('j-cal'); cal.innerHTML='';
  var y=ST.calDate.getFullYear(), mo=ST.calDate.getMonth();
  var names=['Janvier','F\u00e9vrier','Mars','Avril','Mai','Juin','Juillet','Ao\u00fbt','Septembre','Octobre','Novembre','D\u00e9cembre'];
  var head = el('div','cal-head');
  var prev=el('button','icon-btn','\u25C0'), next=el('button','icon-btn','\u25B6');
  head.appendChild(prev); head.appendChild(el('strong','', names[mo]+' '+y)); head.appendChild(next);
  cal.appendChild(head);
  var grid = el('div','cal-grid');
  ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].forEach(function(d){ grid.appendChild(el('div','cdname',d)); });
  var first=(new Date(y,mo,1).getDay()+6)%7, days=new Date(y,mo+1,0).getDate();
  for(var i=0;i<first;i++) grid.appendChild(el('div','cday empty'));
  for(var d=1;d<=days;d++){
    (function(d){
      var cell=el('div','cday'); cell.appendChild(el('div','',String(d)));
      var dayE = ST.entries.filter(function(e){ var p=parseDateFR(e.dateFin); return p&&p.y===y&&p.mo===mo+1&&p.d===d; });
      if(dayE.length){ cell.classList.add('has'); cell.appendChild(el('div','dot')); cell.addEventListener('click', function(){ dayModal(d,mo,y,dayE); }); }
      grid.appendChild(cell);
    })(d);
  }
  cal.appendChild(grid);
  prev.addEventListener('click', function(){ ST.calDate.setMonth(ST.calDate.getMonth()-1); renderCalendar(); });
  next.addEventListener('click', function(){ ST.calDate.setMonth(ST.calDate.getMonth()+1); renderCalendar(); });
}
function dayModal(d,mo,y,list){
  var body = el('div');
  list.forEach(function(e){
    var row = el('div','fitem'); row.appendChild(renderBox(e));
    var info = el('div');
    info.appendChild(el('div','htitle', esc(e.titre)+' '+statutStr(e)));
    info.appendChild(el('div','hmeta', e.type+' \u2022 '+(e.note!=null?e.note+'/10':'\u2014/10')));
    row.appendChild(info);
    row.addEventListener('click', function(){ showDetail(e); });
    body.appendChild(row);
  });
  setModal(OEC+'uvres du '+pad2(d)+'/'+pad2(mo+1)+'/'+y, body, [['Fermer','',closeModal]]);
}

/* ===== DÉTAIL ===== */
function showDetail(e){
  var body = el('div');
  var head = el('div'); head.style.display='flex'; head.style.gap='12px'; head.style.marginBottom='12px';
  var box = renderBox(e); box.style.width='96px'; box.style.flexShrink='0';
  head.appendChild(box);
  var info = el('div'); info.style.flex='1'; info.style.minWidth='0';
  info.appendChild(el('div','htitle', esc(e.titre)+' '+statutStr(e)));
  info.appendChild(el('div','hmeta', e.type+(e.sousTitre?' \u2022 '+esc(e.sousTitre):'')));
  info.appendChild(el('div','hmeta','Note : '+(e.note!=null?e.note+'/10':'\u2014/10')));
  info.appendChild(el('div','hmeta','Avancement : '+(e.dateFin?esc(formatDate(e.dateFin)):'non renseign\u00e9')));
  if(e.inCollection){
    info.appendChild(el('div','hmeta','\u{1F4E6} '+esc(e.support||'?')+' \u2022 '+esc(e.packaging||'?')));
    if(e.ean) info.appendChild(el('div','hmeta','EAN : '+esc(e.ean)));
    if(e.url) info.appendChild(el('div','hmeta','<a href="'+esc(e.url)+'" target="_blank" style="color:var(--acc);">Lien \u2197</a>'));
  }
  head.appendChild(info); body.appendChild(head);
  body.appendChild(el('div','serif','<span style="color:var(--acc);font-size:13px;">Journal de bord</span>'));
  var jl = e.journal || (e.comment?[{kind:'free',text:e.comment}]:[]);
  if(jl.length){
    jl.forEach(function(x){
      var tag = x.kind==='time'?('\u{1F5D3}\uFE0F '+x.ts):(x.kind==='ep'?('\u{1F4FA} S'+pad2(x.s)+'E'+pad2(x.e)+(x.note!=null?' \u2022 '+x.note+'/10':'')):'\u270F\uFE0F');
      body.appendChild(el('div','ftime', tag));
      body.appendChild(el('div','ftext', esc(x.text||'')));
    });
  } else body.appendChild(el('div','empty','Pas encore de journal.</div>'));
  setModal(e.titre, body, [
    ['Modifier','primary', function(){ renderPanel(e); }],
    ['Noter','', function(){ quickNoteOpen(e); }],
    ['Partager','', function(){ if(window.shareJPG) shareJPG(e); }],
    ['Fermer','', closeModal]
  ]);
}

/* ===== PANNEAU ÉDITION (Simple/Avancé) ===== */
function renderPanel(entry){
  ST.editing = entry||null;
  if(entry){ ST.currentNote=entry.note!=null?entry.note:null; ST.isFav=!!entry.isFavorite; ST.isEnc=!!entry.enCours; ST.isVoir=!!entry.aVoir; ST.panelPoster=entry.posterUrl||''; ST.draftJournal=JSON.parse(JSON.stringify(entry.journal||(entry.comment?[{kind:'free',text:entry.comment}]:[]))); ST.currentType=entry.type; }
  else { ST.currentNote=null; ST.isFav=false; ST.isEnc=false; ST.isVoir=false; ST.panelPoster=(ST.selectedItem&&ST.selectedItem.poster)||''; ST.draftJournal=[]; }
  var s = settingsLoad(); ST.panelMode = s.panelMode||'simple';
  var body = el('div');
  var seg = el('div','seg');
  ['simple','avance'].forEach(function(m){
    var b = el('button', ST.panelMode===m?'on':'', m==='simple'?'Simple':'Avanc\u00e9');
    b.addEventListener('click', function(){ ST.panelMode=m; s.panelMode=m; settingsSave(s); renderPanel(ST.editing); });
    seg.appendChild(b);
  });
  body.appendChild(seg);
  function field(label, node){ var w=el('div'); w.style.marginBottom='12px'; w.appendChild(el('label','',label)); w.appendChild(node); body.appendChild(w); return node; }
  var tIn = field('Titre', el('input')); tIn.id='p-title'; tIn.value = entry?entry.titre:((ST.selectedItem&&ST.selectedItem.title)||'');
  var tySel = field('Type', el('select')); tySel.id='p-type';
  allTypes().forEach(function(t){ var o=el('option','',t); o.value=t; if(t===ST.currentType)o.selected=true; tySel.appendChild(o); });
  // note chips
  var nw = el('div'); nw.style.marginBottom='12px'; nw.appendChild(el('label','','Note (/10) \u2014 re-cliquer pour enlever'));
  var nch = el('div','chips small');
  for(var n=1;n<=10;n++){ (function(n){ var c=el('div','chip'+(ST.currentNote===n?' on':''), String(n)); c.addEventListener('click', function(){ ST.currentNote=(ST.currentNote===n?null:n); nch.querySelectorAll('.chip').forEach(function(x){x.classList.remove('on');}); if(ST.currentNote===n)c.classList.add('on'); }); nch.appendChild(c); })(n); }
  nw.appendChild(nch); body.appendChild(nw);
  // statuts
  var sw = el('div','chips small'); sw.style.marginBottom='12px';
  function statChip(on, label, get, set){ var c=el('div','chip'+(get()?' on':''), label); c.addEventListener('click', function(){ set(!get()); c.classList.toggle('on', get()); }); sw.appendChild(c); }
  statChip(null,'\u{1F49C} coup de c\u0153ur', function(){return ST.isFav;}, function(v){ST.isFav=v;});
  statChip(null,'\u23F3 en cours', function(){return ST.isEnc;}, function(v){ST.isEnc=v;});
  statChip(null,'\u{1F440} \u00e0 voir', function(){return ST.isVoir;}, function(v){ST.isVoir=v;});
  body.appendChild(sw);
  var dIn = field('Avancement / date de fin', el('input')); dIn.id='p-date'; dIn.placeholder='ex: 27/09/2026 ou S01E04'; dIn.value=entry?(entry.dateFin||''):'';
  var cIn = field('Commentaire rapide', el('textarea')); cIn.id='p-comment'; cIn.value=entry?(entry.comment||''):'';
  // affiche
  var aw = el('div'); aw.style.marginBottom='12px'; aw.appendChild(el('label','','Affiche'));
  var arow = el('div'); arow.style.display='flex'; arow.style.gap='8px'; arow.style.alignItems='center';
  var prev = el('img'); prev.id='p-poster-prev'; prev.src=ST.panelPoster||NO_POSTER; prev.style.width='60px'; prev.style.borderRadius='4px';
  var bUrl = el('button','icon-btn','\u{1F517}'); bUrl.title='Changer URL';
  var bImp = el('button','icon-btn','\u{1F4C2}'); bImp.title='Importer';
  var fImp = el('input'); fImp.type='file'; fImp.accept='image/*'; fImp.hidden=true;
  bUrl.addEventListener('click', function(){ openPoster('panel'); });
  bImp.addEventListener('click', function(){ fImp.click(); });
  fImp.addEventListener('change', async function(ev){ var f=ev.target.files[0]; if(!f)return; var url=await fileToResized(f,400); setPanelPoster(url); });
  arow.append(prev,bUrl,bImp,fImp); aw.appendChild(arow); body.appendChild(aw);
  // AVANCÉ
  if(ST.panelMode==='avance'){
    var sIn = field('Sous-titre / saison / plateforme', el('input')); sIn.id='p-sub'; sIn.value=entry?(entry.sousTitre||''):'';
    // journal
    var jw = el('div'); jw.style.marginBottom='12px'; jw.appendChild(el('label','','Journal de bord'));
    var jbtns = el('div','chips small');
    [['time','\u{1F5D3}\uFE0F horodat\u00e9'],['free','\u270F\uFE0F libre'],['ep','\u{1F4FA} saison/\u00e9pis.']].forEach(function(k){
      var c=el('div','chip',k[1]); c.addEventListener('click', function(){ openJournalDraft(k[0], jw); }); jbtns.appendChild(c);
    });
    jw.appendChild(jbtns);
    var jlist = el('div'); jlist.id='p-jlist'; jw.appendChild(jlist); body.appendChild(jw); renderJournalList(jlist);
    // collection physique
    var pw = el('div'); pw.appendChild(el('label','','Collection physique'));
    var pchk = el('div','chip'+(entry&&entry.inCollection?' on':''), '\u{1F4E6} dans ma collection'); var pOn = !!(entry&&entry.inCollection);
    pchk.addEventListener('click', function(){ pOn=!pOn; pchk.classList.toggle('on',pOn); physBox.style.display=pOn?'block':'none'; });
    pw.appendChild(pchk);
    var physBox = el('div'); physBox.style.display=pOn?'block':'none'; physBox.style.marginTop='8px';
    var supSel = el('select'); supSel.id='p-support';
    ['DVD','Blu-ray','4K UHD','CD','Vinyle','Cassette','Cartouche','Livre papier','Poche','D\u00e9mat\u00e9rialis\u00e9'].forEach(function(x){ var o=el('option','',x); if(entry&&entry.support===x)o.selected=true; supSel.appendChild(o); });
    var packSel = el('select'); packSel.id='p-pack';
    ['Steelbook','Amaray','Coffret','Digipack','Collector','Int\u00e9grale','Album','Tank\u014DBon','Reliure'].forEach(function(x){ var o=el('option','',x); if(entry&&entry.packaging===x)o.selected=true; packSel.appendChild(o); });
    var eanIn = el('input'); eanIn.id='p-ean'; eanIn.placeholder='EAN / code-barres'; eanIn.value=entry?(entry.ean||''):'';
    var eanScan = el('button','obtn','\u{1F4F7} Scanner'); eanScan.addEventListener('click', function(){ if(window.startEAN) startEAN(function(code){ eanIn.value=code; toast('EAN : '+code); }); });
    var urlIn = el('input'); urlIn.id='p-url'; urlIn.placeholder='URL de la fiche'; urlIn.value=entry?(entry.url||''):'';
    [supSel,packSel,eanIn,eanScan,urlIn].forEach(function(n){ physBox.appendChild(n); physBox.appendChild(el('br')); });
    pw.appendChild(physBox); body.appendChild(pw);
    // skin
    var skIn = field('N\u00b0 de bo\u00eetier (1-105, 106+ perso)', el('input')); skIn.id='p-skin'; skIn.type='number'; skIn.value=entry&&entry.skin?entry.skin:defaultSkinForType(ST.currentType);
    var skLink = el('a','','voir le showroom \u2197'); skLink.href='showroom.html'; skLink.target='_blank'; skLink.style.color='var(--acc)'; skLink.style.fontSize='11px';
    body.appendChild(skLink);
    // duplicate
    if(entry){ var dup=el('button','wide','\u2795 Dupliquer cette fiche'); dup.style.marginTop='10px'; dup.addEventListener('click', function(){ duplicateEntry(entry); }); body.appendChild(dup); }
  }
  setModal(entry?'Modifier':'Nouvelle fiche', body, [
    ['Enregistrer','primary', function(){ saveCurrentEntry(); }],
    ['Annuler','', closeModal]
  ]);
}
function setPanelPoster(url){ ST.panelPoster=url; var p=document.getElementById('p-poster-prev'); if(p)p.src=url; }
function openJournalDraft(kind, parent){
  var old = document.getElementById('p-jdraft'); if(old) old.remove();
  var d = el('div','card'); d.id='p-jdraft';
  if(kind==='ep'){
    var r = el('div','row2');
    r.innerHTML = '<label>S<input type="number" id="jd-s" min="0"></label><label>E<input type="number" id="jd-e" min="0"></label><label>/10<input type="number" id="jd-note" min="1" max="10"></label>';
    d.appendChild(r);
  }
  var ta = el('textarea'); ta.id='jd-text'; ta.placeholder='Ton entr\u00e9e\u2026'; d.appendChild(ta);
  var act = el('div','row2'); act.style.marginTop='8px';
  var ok = el('button','primary','Ajouter'); var no = el('button','','Annuler');
  act.append(ok,no); d.appendChild(act);
  parent.appendChild(d);
  ok.addEventListener('click', function(){
    var text = ta.value.trim();
    if(!text && kind!=='ep'){ toast('Entre un texte.'); return; }
    if(kind==='time') ST.draftJournal.push({kind:'time', ts:nowStamp(), text:text, at:Date.now()});
    else if(kind==='free') ST.draftJournal.push({kind:'free', text:text, at:Date.now()});
    else { var nn=document.getElementById('jd-note').value; ST.draftJournal.push({kind:'ep', s:parseInt(document.getElementById('jd-s').value||'0',10), e:parseInt(document.getElementById('jd-e').value||'0',10), note:nn?Math.max(1,Math.min(10,parseInt(nn,10))):null, text:text, at:Date.now()}); }
    d.remove(); renderJournalList(document.getElementById('p-jlist'));
  });
  no.addEventListener('click', function(){ d.remove(); });
}
function renderJournalList(container){
  if(!container) return; container.innerHTML='';
  ST.draftJournal.forEach(function(x,i){
    var tag = x.kind==='time'?('\u{1F5D3}\uFE0F '+x.ts):(x.kind==='ep'?('\u{1F4FA} S'+pad2(x.s)+'E'+pad2(x.e)+(x.note!=null?' \u2022 '+x.note+'/10':'')):'\u270F\uFE0F');
    var row = el('div','fitem');
    var b = el('div'); b.appendChild(el('div','ftime',tag)); b.appendChild(el('div','ftext',esc(x.text||'')));
    var del = el('button','icon-btn','\u{1F5D1}'); del.addEventListener('click', function(){ ST.draftJournal.splice(i,1); renderJournalList(container); });
    row.appendChild(b); row.appendChild(del); container.appendChild(row);
  });
}
async function saveCurrentEntry(){
  var title = document.getElementById('p-title').value.trim();
  if(!title){ alert('Titre obligatoire !'); return; }
  var type = document.getElementById('p-type').value;
  var entries = ST.entries;
  var entryId, dateAjout;
  if(ST.editing){ entryId = ST.editing.id; dateAjout = ST.editing.dateAjout; }
  else {
    var dup = entries.find(function(e){ return e.type===type && norm(e.titre)===norm(title); });
    if(dup && confirm('\u00AB'+dup.titre+'\u00BB existe d\u00e9j\u00e0 en '+type+'.\nModifier l\u2019existante ?\n(Annuler = cr\u00e9er un doublon)')){ entryId=dup.id; dateAjout=dup.dateAjout; }
    else { entryId = type+'_'+((ST.selectedItem&&ST.selectedItem.id)||Date.now()); if(entries.some(function(e){return e.id===entryId;})) entryId+='_'+Date.now(); dateAjout=new Date().toISOString(); }
  }
  var entry = {
    id: entryId, type: type, titre: title,
    sousTitre: (document.getElementById('p-sub')?document.getElementById('p-sub').value.trim():''),
    note: ST.currentNote, isFavorite: ST.isFav, enCours: ST.isEnc, aVoir: ST.isVoir,
    dateFin: document.getElementById('p-date').value.trim(),
    journal: ST.draftJournal,
    comment: document.getElementById('p-comment').value.trim(),
    posterUrl: ST.panelPoster,
    skin: document.getElementById('p-skin')?parseInt(document.getElementById('p-skin').value,10)||null:null,
    inCollection: !!(document.getElementById('p-support') && document.querySelector('#p-support').closest('div').parentNode.querySelector('.chip.on')),
    dateAjout: dateAjout
  };
  if(entry.inCollection){
    entry.support = document.getElementById('p-support').value;
    entry.packaging = document.getElementById('p-pack').value;
    entry.ean = document.getElementById('p-ean').value.trim();
    entry.url = document.getElementById('p-url').value.trim();
  }
  await dbPut(entry);
  if(navigator.vibrate) navigator.vibrate(30);
  toast('Enregistr\u00e9 !');
  closeModal();
  await refreshAll();
}
function duplicateEntry(e){
  var copy = JSON.parse(JSON.stringify(e));
  copy.id = e.type+'_'+Date.now();
  copy.titre = e.titre; copy.dateAjout = new Date().toISOString(); copy.dateFin=''; copy.journal=[];
  ST.selectedItem = null;
  closeModal();
  setTimeout(function(){ renderPanel(null); var t=document.getElementById('p-title'); if(t)t.value=copy.titre; ST.draftJournal=[]; }, 50);
  window.__dup = copy;
}

/* ===== QUICK NOTE ===== */
function quickNoteOpen(e){
  ST.qnEntry = e; ST.qnKind='time';
  document.getElementById('qn-title').textContent = 'Noter : '+e.titre;
  document.getElementById('qn-text').value='';
  document.getElementById('qn-ep-row').classList.add('hidden');
  var kinds = document.getElementById('qn-kind'); kinds.innerHTML='';
  [['time','\u{1F5D3}\uFE0F'],['free','\u270F\uFE0F'],['ep','\u{1F4FA}']].forEach(function(k){
    var c=el('div','chip'+(k[0]==='time'?' on':''), k[1]);
    c.addEventListener('click', function(){ ST.qnKind=k[0]; kinds.querySelectorAll('.chip').forEach(function(x){x.classList.remove('on');}); c.classList.add('on'); document.getElementById('qn-ep-row').classList.toggle('hidden', k[0]!=='ep'); });
    kinds.appendChild(c);
  });
  document.getElementById('qn-overlay').classList.add('active');
}
function quickNoteClose(){ document.getElementById('qn-overlay').classList.remove('active'); }
async function quickNoteSave(){
  var e = ST.qnEntry; if(!e) return;
  var text = document.getElementById('qn-text').value.trim();
  if(!text && ST.qnKind!=='ep'){ toast('Entre un texte.'); return; }
  if(!e.journal) e.journal=[];
  if(ST.qnKind==='time') e.journal.push({kind:'time', ts:nowStamp(), text:text, at:Date.now()});
  else if(ST.qnKind==='free') e.journal.push({kind:'free', text:text, at:Date.now()});
  else { var nn=document.getElementById('qn-note').value; e.journal.push({kind:'ep', s:parseInt(document.getElementById('qn-s').value||'0',10), e:parseInt(document.getElementById('qn-e').value||'0',10), note:nn?Math.max(1,Math.min(10,parseInt(nn,10))):null, text:text, at:Date.now()}); }
  await dbPut(e);
  if(navigator.vibrate) navigator.vibrate(20);
  toast('Entr\u00e9e ajout\u00e9e !');
  quickNoteClose();
  await refreshAll();
}

/* ===== AFFICHE PLEIN ÉCRAN ===== */
var posterState = { url:'', target:null };
function openPoster(target){
  posterState.target = target;
  posterState.url = (target==='panel') ? ST.panelPoster : (target.posterUrl||'');
  document.getElementById('poster-img').src = posterState.url || NO_POSTER;
  document.getElementById('poster-url-input').value = posterState.url.startsWith('data:')?'':posterState.url;
  document.getElementById('poster-url-row').classList.add('hidden');
  document.getElementById('poster-overlay').classList.add('active');
}
function posterClose(){ document.getElementById('poster-overlay').classList.remove('active'); }
async function posterApply(url){
  posterState.url = url;
  document.getElementById('poster-img').src = url;
  if(posterState.target==='panel'){ setPanelPoster(url); }
  else if(posterState.target){ posterState.target.posterUrl=url; await dbPut(posterState.target); await refreshAll(); showDetail(posterState.target); }
  toast('Affiche mise \u00e0 jour !');
}

/* ===== OPTIONS ===== */
function renderOptions(){
  var s = settingsLoad();
  var c = document.getElementById('opt-container'); c.innerHTML='';
  function group(t){ var g=el('div','ogroup card'); g.appendChild(el('h3','',t)); c.appendChild(g); return g; }
  function row(g, label, node){ var r=el('div','orow'); r.appendChild(el('span','',label)); var ctl=el('div','ctl'); if(node)ctl.appendChild(node); r.appendChild(ctl); g.appendChild(r); return r; }
  function btn(label, cls, fn){ var b=el('button','obtn '+ (cls||''), label); b.addEventListener('click', fn); return b; }
  function toggle(on, fn){ var b=el('div','chip'+(on?' on':''), on?'ON':'OFF'); b.addEventListener('click', function(){ var v=!b.classList.contains('on'); b.classList.toggle('on',v); b.textContent=v?'ON':'OFF'; fn(v); }); return b; }
  // Sheet
  var g1 = group('\u{1F517} Google Sheet');
  var urlIn = el('input'); urlIn.placeholder='URL du webhook'; urlIn.value = localStorage.getItem('sheet_url')||'';
  row(g1,'URL webhook', urlIn);
  row(g1,'', btn('💾 Sauver','primary', function(){ localStorage.setItem('sheet_url', urlIn.value.trim()); toast('URL enregistr\u00e9e'); }));
  row(g1,'', btn('\u{1F4CB} Copier (TSV)','', function(){ if(window.copyTSV) copyTSV(); }));
  row(g1,'', btn('\u{1F4E4} Sync Sheet','', function(){ if(window.syncSheet) syncSheet(); }));
  // Sauvegarde
  var g2 = group('\u{1F4BE} Sauvegarde');
  row(g2,'', btn('\u{1F4E4} Export JSON','', function(){ if(window.exportJSON) exportJSON(); }));
  row(g2,'', btn('\u{1F4E5} Import (fusion)','', function(){ if(window.importJSON) importJSON(); }));
  var lb = localStorage.getItem('last_backup');
  row(g2,'Dernier backup', el('span','', lb?new Date(parseInt(lb,10)).toLocaleDateString('fr-FR'):'jamais'));
  var alSel = el('select'); [7,14,30,0].forEach(function(d){ var o=el('option','', d===0?'Jamais':'Tous les '+d+'j'); o.value=d; if(s.alertBackupDays===d)o.selected=true; alSel.appendChild(o); });
  alSel.addEventListener('change', function(){ s.alertBackupDays=parseInt(alSel.value,10); settingsSave(s); });
  row(g2,'Alerte backup', alSel);
  // Apparence
  var g3 = group('\u{1F3A8} Apparence');
  [['skinFilm','Film'],['skinSerie','S\u00e9rie'],['skinJeu','Jeu'],['skinManga','Manga'],['skinBD','BD'],['skinRoman','Roman'],['skinLibre','Libre']].forEach(function(k){
    var inp = el('input'); inp.type='number'; inp.value=s[k[0]]; inp.style.width='70px';
    inp.addEventListener('change', function(){ s[k[0]]=parseInt(inp.value,10)||1; settingsSave(s); toast('Skin '+k[1]+' = '+s[k[0]]); });
    row(g3,'Bo\u00eetier '+k[1], inp);
  });
  var dSel = el('select'); [['comfort','Confort'],['compact','Compact']].forEach(function(d){ var o=el('option','',d[1]); o.value=d[0]; if(s.density===d[0])o.selected=true; dSel.appendChild(o); });
  dSel.addEventListener('change', function(){ s.density=dSel.value; settingsSave(s); applySettings(); });
  row(g3,'Densit\u00e9', dSel);
  var fSel = el('select'); [['s','Petit'],['m','Moyen'],['l','Grand']].forEach(function(d){ var o=el('option','',d[1]); o.value=d[0]; if(s.fontSize===d[0])o.selected=true; fSel.appendChild(o); });
  fSel.addEventListener('change', function(){ s.fontSize=fSel.value; settingsSave(s); applySettings(); });
  row(g3,'Taille texte', fSel);
  row(g3,'Animations', toggle(s.animOn, function(v){ s.animOn=v; settingsSave(s); applySettings(); }));
  row(g3,'Contraste \u00e9lev\u00e9', toggle(s.hcMode, function(v){ s.hcMode=v; settingsSave(s); applySettings(); }));
  // Collection / types
  var g4 = group('\u{1F5C2} Types personnalis\u00e9s');
  var ct = loadCustomTypes();
  ct.forEach(function(t,i){
    row(g4, t.name, btn('\u{1F5D1}','', function(){ ct.splice(i,1); saveCustomTypes(ct); renderOptions(); }));
  });
  var ntIn = el('input'); ntIn.placeholder='Nouveau type\u2026';
  row(g4,'', ntIn);
  row(g4,'', btn('➕ Ajouter','', function(){ var v=ntIn.value.trim(); if(!v)return; ct.push({name:v}); saveCustomTypes(ct); ntIn.value=''; renderOptions(); }));
  // Recherche
  var g5 = group('\u{1F50D} Recherche');
  var dtSel = el('select'); allTypes().forEach(function(t){ var o=el('option','',t); if(s.defaultType===t)o.selected=true; dtSel.appendChild(o); });
  dtSel.addEventListener('change', function(){ s.defaultType=dtSel.value; settingsSave(s); ST.currentType=s.defaultType; if(window.buildTypeChips) buildTypeChips(); });
  row(g5,'Type par d\u00e9faut', dtSel);
  row(g5,'Tol\u00e9rance fautes (fuzzy)', toggle(s.fuzzy, function(v){ s.fuzzy=v; settingsSave(s); }));
  row(g5,'', btn('Vider recherches r\u00e9centes','', function(){ localStorage.removeItem('recent_searches'); ST.recent=[]; toast('Vid\u00e9'); }));
  // Appli
  var g6 = group('\u{1F4F2} Application');
  row(g6,'', btn('Installer l\u2019appli','', function(){ if(window.triggerInstall) triggerInstall(); }));
  row(g6,'', btn('Vider le cache offline','', function(){ if('caches' in window) caches.keys().then(function(k){k.forEach(function(x){caches.delete(x);});}); toast('Cache vid\u00e9'); }));
  row(g6,'Hors-ligne', el('span','', navigator.onLine?'connect\u00e9':'hors-ligne'));
  // À propos
  var g7 = group('\u2139\uFE0F \u00C0 propos');
  var d = new Date(BUILD_DATE);
  row(g7,'Version', el('span','','V6.0'));
  row(g7,'Build', el('span','', d.toLocaleString('fr-FR',{timeZone:'Europe/Paris'})));
  var cred = el('a','','\u{1F3AC} Cr\u00e9\u00e9 par Gooumbora'); cred.href='https://www.senscritique.com/Gooumbora'; cred.target='_blank'; cred.style.color='var(--acc)';
  row(g7,'', cred);
  // Danger
  var g8 = group('\u26A0\uFE0F Zone danger');
  row(g8,'', btn('Vider la collection','outline', async function(){ if(confirm('Effacer TOUTES tes '+OE+'uvres ?')){ for(var i=0;i<ST.entries.length;i++) await dbDelete(ST.entries[i].id); await refreshAll(); toast('Vid\u00e9'); } }));
  row(g8,'', btn('R\u00e9initialiser r\u00e9glages','outline', function(){ localStorage.removeItem('settings'); settingsSave(Object.assign({},SETTINGS_DEFAULTS)); applySettings(); renderOptions(); toast('R\u00e9glages r\u00e9initialis\u00e9s'); }));
}
function applySettings(){
  var s = settingsLoad();
  document.body.dataset.density = s.density;
  document.body.dataset.fs = s.fontSize;
  document.body.dataset.anim = s.animOn?'on':'off';
  document.body.dataset.hc = s.hcMode?'1':'0';
}
