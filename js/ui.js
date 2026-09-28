/* ════════════════════════════════════════════════════════════════
   UI.JS — Couche "interface" (rendu DOM + modales + logique d'affichage)
   Aucune requête réseau ici (sauf fetchSteamGrid/fetchTMDBSeason appelés
   depuis app.js). Tout est dans le style du site, jamais de popup système.
   Version V12.
   ════════════════════════════════════════════════════════════════ */


/* ─────────── ÉTAT GLOBAL ST ─────────── */
var ST = {
  entries:[],              // toutes les oeuvres chargées en mémoire
  view:"search",           // vue active
  colQuery:"",             // texte de recherche bibliothèque
  calDate:new Date(),      // mois affiché dans le Journal
  editing:null,            // oeuvre en cours de modification (formulaire)
  selectedItem:null,       // résultat de recherche sélectionné
  currentType:"Film",      // type actif dans la recherche
  panelType:"Film",        // type dans le formulaire ouvert
  currentNote:null,        // notation temporaire du formulaire
  isFav:false,isEnc:false,isVoir:false,isInCollection:false, // statuts temporaires
  draftJournal:[],         // lignes de journal en préparation
  panelPoster:"",panelThumb:"", // affiche courante du formulaire
  qnEntry:null,qnKind:"time",qnEditIdx:null, // contexte note rapide
  recent:[],               // recherches récentes
  menuEntry:null,          // oeuvre du menu contextuel
  filterType:"all",filterSupport:"all",filterSort:"date-desc", // filtres bibliothèque
  advFields:{plateforme:"",dateAchat:"",edition:"",bonus:[],support:"",packaging:"",ean:"",url:""},
  draft:{titre:"",date:"",comment:"",sub:""},
  subBackFn:null,          // fonction de retour d'une sous-modale
  currentReaderEntry:null,currentReaderJournalIdx:null,
  lastJournalCount:0,      // nb total d'entrées au dernier rendu (badge)
  monthPickYear:new Date().getFullYear(),
  pickerCb:null,pickerVal:null, // contexte du picker date/heure maison
  entryPickCb:null         // callback choix d'oeuvre (liste radio)
};

var overlayStack=[];
var FOOT_IC={"Modifier":"edit","Fermer":"x","Enregistrer":"save","Annuler":"x","Ajouter":"plus","Supprimer":"trash-2","Valider":"save","Remplacer":"save","Vider":"trash","Reinitialiser":"rotate-ccw","Confirmer":"check","Definir":"check"};


/* ─────────── OUTILS DOM ─────────── */
function el(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d;}
function $(id){return document.getElementById(id);}
function emptyBox(icn,txt){var d=el("div","empty");d.innerHTML='<span class="ic">'+ic(icn)+'</span>'+esc(txt);return d;}
function toast(m,t){var e=$("toast");if(!e)return;e.textContent=m;e.classList.add("show");setTimeout(function(){e.classList.remove("show");},t||1800);}


/* ─────────── GESTION DES OVERLAYS ─────────── */
function showOverlay(id){var e=$(id);if(!e)return;e.classList.add("on");overlayStack.push(id);try{history.pushState(null,"");}catch(err){}}
function hideOverlay(id){var e=$(id);if(!e)return;e.classList.remove("on");var i=overlayStack.indexOf(id);if(i>=0)overlayStack.splice(i,1);}
window.addEventListener("popstate",function(){var id=overlayStack[overlayStack.length-1];if(id){var e=$(id);if(e)e.classList.remove("on");overlayStack.pop();}});

function closeModal(){hideOverlay("modal-overlay");var b=$("m-body");if(b)b.innerHTML="";var f=$("m-foot");if(f)f.innerHTML="";ST.editing=null;ST.subBackFn=null;}
function closeOrBack(){if(ST.subBackFn){var f=ST.subBackFn;ST.subBackFn=null;f();}else closeModal();}
function closeReader(){hideOverlay("reader-overlay");ST.currentReaderEntry=null;ST.currentReaderJournalIdx=null;}
function closeMenu(){hideOverlay("menu-overlay");}

/** Construit une modale générique (titre + corps + boutons pied). */
function setModal(title,bodyNode,foot){
  var t=$("m-title");if(t)t.textContent=title;
  var b=$("m-body");if(!b)return;b.innerHTML="";b.appendChild(bodyNode);
  var f=$("m-foot");if(!f)return;f.innerHTML="";
  var list=foot||[];
  for(var i=0;i<list.length;i++){
    var bt=list[i];
    var btn=el("button",bt[1]||"");
    var icn=FOOT_IC[bt[0]]||"";
    btn.innerHTML=(icn?'<span class="ic">'+ic(icn)+"</span>":"")+bt[0];
    btn.addEventListener("click",bt[2]);
    f.appendChild(btn);
  }
  showOverlay("modal-overlay");
}

/** Boîte de confirmation (dans le site, pas window.confirm). */
function showConfirm(title,msg,onYes,yesLabel){
  if(typeof msg==="function"){yesLabel=onYes;onYes=msg;msg="Cette action est irreversible.";}
  var t=$("confirm-title");if(t)t.textContent=title;
  var b=$("confirm-body");if(b)b.innerHTML='<p style="font-size:15px;line-height:1.6;">'+esc(msg)+'</p>';
  var f=$("confirm-foot");if(!f)return;f.innerHTML="";
  var noBtn=el("button","","Annuler");noBtn.addEventListener("click",function(){hideOverlay("confirm-overlay");});
  var yesBtn=el("button","primary",yesLabel||"Confirmer");yesBtn.addEventListener("click",function(){hideOverlay("confirm-overlay");if(onYes)onYes();});
  f.appendChild(noBtn);f.appendChild(yesBtn);
  showOverlay("confirm-overlay");
}

/** Recharge les données puis rend tout à jour. */
async function refreshAll(){ST.entries=await dbAll();renderCollection();renderJournal();updateJournalBadge();scheduleGitHubBackup();}

/** Affiche/masque le point violet sur l'onglet Journal. */
function updateJournalBadge(){
  var total=0;ST.entries.forEach(function(e){total+=(e.journal||[]).length;});
  var badge=$("journal-badge");if(!badge)return;
  if(total>ST.lastJournalCount&&ST.view!=="journal"){badge.style.display="block";}
  else{badge.style.display="none";}
  ST.lastJournalCount=total;
}


/* ─────────── HELPERS AFFICHAGE ─────────── */
function neonClass(e){if(e.aVoir)return "n-voir";if(e.enCours)return "n-enc";return "n-fini";}
function statIcon(e){if(e.aVoir)return ic("eye");if(e.enCours)return ic("hourglass");return ic("check");}
function fmtWhen(v){if(!v)return nowStamp();var p=v.split("T");var d=p[0].split("-");var t=(p[1]||"00:00").split(":");return d[2]+"/"+d[1]+" a "+t[0]+"h"+t[1];}
function toInputDate(s){var p=parseDateFR(s);return p?(p.y+"-"+pad2(p.mo)+"-"+pad2(p.d)):"";}
function openPosterZoom(url){if(!url)return;var img=$("poster-img");if(img)img.src=url;showOverlay("poster-overlay");}

/** Libellé compact d'une entrée de journal (sans emoji). */
function entryTag(x){
  if(x.kind==="time")return x.ts;
  if(x.kind==="ep")return "S"+pad2(x.s)+"E"+pad2(x.e)+(x.note!=null?" . "+x.note+"/10":"");
  if(x.kind==="session")return "Session "+(x.dur||"");
  return "Libre";
}

/** Ouvre le lecteur plein texte d'une entrée. */
function openReaderForEntry(entry,idx){
  ST.currentReaderEntry=entry;ST.currentReaderJournalIdx=idx;
  var jl=entry.journal||(entry.comment?[{kind:"free",text:entry.comment}]:[]);
  var x=jl[idx]||{text:""};
  var t=$("r-title");if(t)t.textContent=entry.titre;
  var s=$("r-sub");if(s)s.textContent=entryTag(x);
  var b=$("r-body");if(b)b.textContent=x.text||"";
  showOverlay("reader-overlay");
}


/* ─────────── POSTER & MENU CONTEXTUEL ─────────── */
function renderPoster(e,withMenu){
  var p=el("div","poster "+neonClass(e));
  var img=el("img","art");img.src=e.posterThumb||e.posterUrl||NO_POSTER;img.alt="";img.loading="lazy";
  img.addEventListener("click",function(ev){ev.stopPropagation();showCollectionDetail(e);});
  p.appendChild(img);
  if(e.note!=null){var pn=el("div","pnote",e.note+"/10");var nc=noteColors(e.note);if(nc){pn.style.background=nc[0];pn.style.color=nc[1];}p.appendChild(pn);}
  var st=el("div","pstat");st.innerHTML=statIcon(e);p.appendChild(st);
  if(withMenu!==false){var mb=el("button","pmenu");mb.innerHTML=ic("more");mb.addEventListener("click",function(ev){ev.stopPropagation();openMenu(e);});p.appendChild(mb);}
  return p;
}

function openMenu(e){
  ST.menuEntry=e;
  var t=$("menu-title");if(t)t.textContent=e.titre;
  var b=$("menu-body");if(!b)return;b.innerHTML="";
  var items=[
    ["edit","Modifier",function(){closeMenu();renderPanel(e);}],
    ["plus","Noter vite",function(){closeMenu();quickNoteOpen(e);}],
    ["duplicate","Dupliquer",function(){closeMenu();duplicateEntry(e);}],
    ["share","Partager",function(){closeMenu();shareJPG(e);}],
    ["trash","Supprimer",function(){closeMenu();showConfirm("Supprimer "+e.titre+" ?","Toutes les entrees de journal seront perdues.",function(){dbDelete(e.id).then(function(){toast("Supprime");refreshAll();});});}]
  ];
  items.forEach(function(it){
    var m=el("div","mitem");
    m.innerHTML='<span class="ic">'+ic(it[0])+'</span><span>'+it[1]+'</span>';
    m.addEventListener("click",it[2]);
    b.appendChild(m);
  });
  showOverlay("menu-overlay");
}


/* ─────────── LOGIQUE ÉPISODES ─────────── */
/** Ensemble des numéros d'épisodes déjà notés pour une saison donnée. */
function epNoted(entry,s){
  var set={};(entry.journal||[]).forEach(function(x){if(x.kind==="ep"&&x.s===s)set[x.e]=1;});
  return set;
}
/** Prochain épisode non noté (dernière saison/notée, +1). */
function nextEpFor(entry){
  var jl=entry.journal||[];var eps=jl.filter(function(x){return x.kind==="ep";});
  if(!eps.length)return{s:1,e:1};
  var sMax=0;eps.forEach(function(x){if(x.s>sMax)sMax=x.s;});
  var eMax=0;eps.forEach(function(x){if(x.s===sMax&&x.e>eMax)eMax=x.e;});
  return{s:sMax,e:eMax+1};
}
/** Une oeuvre gère-t-elle des épisodes ? (type Série OU déjà des entrées ep) */
function hasEp(entry){return entry.type==="S\u00e9rie"||(entry.journal||[]).some(function(x){return x.kind==="ep";});}
/** Bouton "✓ • SxxExx" menant à la fenêtre épisodes. */
function nextEpButton(entry){
  var n=nextEpFor(entry);
  var b=el("button","next-btn");
  b.innerHTML='<span class="ic">'+ic("check")+'</span><span>S'+pad2(n.s)+"E"+pad2(n.e)+"</span>";
  b.addEventListener("click",function(){openEpisodeWindow(entry,n.s,n.e);});
  return b;
}

/**
 * Fenêtre épisodes (dans le site). Bornée par le nombre réel d'épisodes
 * de la saison si connu (maxEps fourni par fetchTMDBSeason), sinon sans plafond.
 */
function openEpisodeWindow(entry,s,e,maxEps){
  var noted=epNoted(entry,s);
  var sel={before:{},after:{}};
  var center=e;
  var limit=maxEps||Infinity; // plafond optionnel
  var body=el("div");

  // Choix rapides
  var presets=el("div","chips small");
  function clearChips(){presets.querySelectorAll(".chip").forEach(function(x){x.classList.remove("on");});}
  function addPreset(label,fn){var c=el("div","chip",label);c.addEventListener("click",function(){clearChips();c.classList.add("on");sel={before:{},after:{}};fn();rebuild();});presets.appendChild(c);}
  addPreset("Aucun",function(){});
  addPreset("Tout avant",function(){for(var i=1;i<center;i++)sel.before[i]=true;});
  addPreset("1 apres",function(){if(center+1<=limit)sel.after[center+1]=true;});
  addPreset("3 apres",function(){for(var i=center+1;i<=Math.min(limit,center+3);i++)sel.after[i]=true;});
  addPreset("6 apres",function(){for(var i=center+1;i<=Math.min(limit,center+6);i++)sel.after[i]=true;});
  body.appendChild(presets);

  // Section AVANT (manquants seulement)
  var wrapBefore=el("div");
  var sectB=el("div","sec-title","Avant (manquants)");sectB.style.cssText="font-size:13px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.05em;margin:16px 0 10px;";
  var listB=el("div","eplist");
  wrapBefore.appendChild(sectB);wrapBefore.appendChild(listB);body.appendChild(wrapBefore);

  // Section EN COURS
  var sectC=el("div","","En cours");sectC.style.cssText="font-size:13px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.05em;margin:16px 0 10px;";
  var listC=el("div","eplist");
  var cur=el("div","eprow cur");cur.innerHTML='<span class="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></span><span>S'+pad2(s)+"E"+pad2(center)+'</span><span class="tagcur">AJOUTE</span>';
  listC.appendChild(cur);body.appendChild(sectC);body.appendChild(listC);

  // Section APRES (bornée)
  var sectA=el("div","","Apres (optionnel)");sectA.style.cssText="font-size:13px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.05em;margin:16px 0 10px;";
  var listA=el("div","eplist");
  body.appendChild(sectA);body.appendChild(listA);

  var count=el("div","ep-count","");
  body.appendChild(count);

  function rebuild(){
    listB.innerHTML="";listA.innerHTML="";
    var missing=[];for(var i=1;i<center;i++){if(!noted[i])missing.push(i);}
    if(missing.length===0){wrapBefore.style.display="none";}
    else{wrapBefore.style.display="";missing.forEach(function(i){
      var r=el("div","eprow"+(sel.before[i]?" on":""));
      r.innerHTML='<span class="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></span><span>S'+pad2(s)+"E"+pad2(i)+"</span>";
      r.addEventListener("click",function(){sel.before[i]=!sel.before[i];rebuild();});
      listB.appendChild(r);});}
    var afterEnd=Math.min(limit,center+6);
    for(var j=center+1;j<=afterEnd;j++){
      (function(j){
        var r=el("div","eprow"+(sel.after[j]?" on":""));
        r.innerHTML='<span class="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></span><span>S'+pad2(s)+"E"+pad2(j)+"</span>";
        r.addEventListener("click",function(){sel.after[j]=!sel.after[j];rebuild();});
        listA.appendChild(r);
      })(j);
    }
    var n=0;for(var k in sel.before){if(sel.before[k])n++;}for(var k2 in sel.after){if(sel.after[k2])n++;}
    var extra=isFinite(limit)?(" (max E"+pad2(limit)+")"):"";
    count.textContent=n+" episode"+(n>1?"s":"")+" supplementaire"+(n>1?"s":"")+extra;
  }
  rebuild();

  setModal("Episodes autour de S"+pad2(s)+"E"+pad2(center),body,[["Confirmer","primary",function(){
    if(!entry.journal)entry.journal=[];
    var adds=[];
    for(var i=1;i<center;i++){if(sel.before[i]&&!noted[i])adds.push(i);}
    adds.push(center);
    for(var j=center+1;j<=Math.min(limit,center+6);j++){if(sel.after[j]&&!noted[j])adds.push(j);}
    adds.sort(function(a,b){return a-b;});
    var base=Date.now();
    adds.forEach(function(ep,idx){entry.journal.push({kind:"ep",s:s,e:ep,note:null,text:"Vu",at:base+idx});});
    dbPut(entry).then(function(){toast(adds.length+" entree"+(adds.length>1?"s":"")+" ajoutee"+(adds.length>1?"s":""));closeModal();refreshAll();});
  }],["Annuler","",closeModal]]);
}


/* ─────────── DÉTAIL ŒUVRE ─────────── */
function collectionCard(e){
  var cell=el("div","grid-cell");
  cell.appendChild(renderPoster(e));
  cell.appendChild(el("div","title",esc(e.titre)));
  var meta=(e.support||"")+(e.packaging?" . "+e.packaging:"");
  if(meta)cell.appendChild(el("div","meta",esc(meta)));
  cell.addEventListener("click",function(ev){if(ev.target.closest("button"))return;showCollectionDetail(e);});
  return cell;
}

function showCollectionDetail(e){
  var body=el("div");
  var head=el("div");head.style.cssText="display:flex;gap:18px;margin-bottom:22px;";
  var posterWrap=el("div","detail-poster");
  var pImg=el("img");pImg.src=e.posterThumb||e.posterUrl||NO_POSTER;
  posterWrap.appendChild(pImg);
  var zoomBtn=el("div","zoom-btn");zoomBtn.innerHTML='<span class="ic">'+ic("maximize-2")+"</span>Agrandir";
  zoomBtn.addEventListener("click",function(){openPosterZoom(pImg.src);});
  posterWrap.appendChild(zoomBtn);
  head.appendChild(posterWrap);
  var info=el("div");info.style.cssText="flex:1;min-width:0;";
  var h2=el("h2","",esc(e.titre));h2.style.cssText="font-family:var(--ft);font-size:21px;margin-bottom:10px;";info.appendChild(h2);
  var tags=el("div");tags.style.cssText="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;";
  var noteTag=el("span","",(e.note!=null?e.note+"/10":"--/10"));noteTag.style.cssText="padding:4px 11px;border-radius:12px;font-family:var(--fm);font-size:12px;font-weight:700;cursor:pointer;";
  var nc=noteColors(e.note);if(nc){noteTag.style.background=nc[0];noteTag.style.color=nc[1];}else{noteTag.style.background="var(--s1)";noteTag.style.border="1px solid var(--bd)";noteTag.style.color="var(--dim)";}
  noteTag.addEventListener("click",function(){openNoteEditor(e);});
  tags.appendChild(noteTag);
  var typeTag=el("span","",esc(e.type));typeTag.style.cssText="background:var(--s1);border:1px solid var(--bd);padding:4px 11px;border-radius:12px;font-family:var(--fm);font-size:12px;";tags.appendChild(typeTag);
  if(e.support){var sTag=el("span","",esc(e.support));sTag.style.cssText="background:var(--s1);border:1px solid var(--bd);padding:4px 11px;border-radius:12px;font-family:var(--fm);font-size:12px;";tags.appendChild(sTag);}
  info.appendChild(tags);
  if(hasEp(e)){info.appendChild(nextEpButton(e));}
  head.appendChild(info);body.appendChild(head);
  var details=el("div");details.style.cssText="margin-bottom:22px;";
  function line(label,val,click){var r=el("div","sline");r.innerHTML='<span style="color:var(--dim);">'+esc(label)+'</span><b>'+esc(val)+'</b>';if(click)r.querySelector("b").addEventListener("click",click);details.appendChild(r);}
  if(e.ean)line("EAN",e.ean,function(){navigator.clipboard.writeText(e.ean);toast("EAN copie");});
  if(e.url)line("URL","Ouvrir",function(){window.open(e.url,"_blank");});
  if(e.plateforme)line("Plateforme",e.plateforme);
  if(e.packaging)line("Packaging",e.packaging);
  if(e.edition)line("Edition",e.edition);
  if(e.dateAchat)line("Date achat",formatDate(e.dateAchat));
  body.appendChild(details);
  var jBtn=el("button","wide");jBtn.innerHTML='<span class="ic">'+ic("book-open")+'</span>Voir le journal';jBtn.style.cssText="margin-bottom:18px;";
  jBtn.addEventListener("click",function(){closeModal();openJournalForEntry(e);});
  body.appendChild(jBtn);
  setModal(e.titre,body,[["Modifier","primary",function(){renderPanel(e);}],["Supprimer","",function(){showConfirm("Supprimer "+e.titre+" ?","Toutes les entrees de journal seront perdues.",function(){dbDelete(e.id).then(function(){toast("Supprime");closeModal();refreshAll();});});}]]);
}

function openJournalForEntry(e){
  var body=el("div");
  if(hasEp(e)){var nb=nextEpButton(e);nb.style.marginBottom="18px";body.appendChild(nb);}
  var jl=e.journal||(e.comment?[{kind:"free",text:e.comment}]:[]);
  if(!jl.length){body.appendChild(emptyBox("book-open","Aucune entree."));}
  else{
    jl.forEach(function(x,i){
      var row=el("div");row.style.cssText="display:flex;gap:12px;align-items:flex-start;padding:14px 0;border-bottom:1px solid var(--bd);";
      var txt=el("div");txt.style.cssText="flex:1;min-width:0;cursor:pointer;";
      txt.innerHTML='<div style="font-size:12px;color:var(--dim);font-family:var(--fm);margin-bottom:5px;">'+esc(entryTag(x))+'</div><div style="font-size:15px;">'+esc(x.text||"")+"</div>";
      txt.addEventListener("click",function(){closeModal();openReaderForEntry(e,i);});
      row.appendChild(txt);
      var acts=el("div");acts.style.cssText="display:flex;gap:6px;";
      var ed=el("button");ed.innerHTML='<span class="ic">'+ic("pen")+"</span>";ed.style.cssText="background:none;border:none;padding:8px;min-height:0;width:36px;height:36px;cursor:pointer;";
      ed.addEventListener("click",function(){closeModal();quickNoteOpen(e,x.text,x.kind,i);});
      var dl=el("button");dl.innerHTML='<span class="ic">'+ic("trash-2")+"</span>";dl.style.cssText="background:none;border:none;padding:8px;min-height:0;width:36px;height:36px;cursor:pointer;";
      dl.addEventListener("click",function(){showConfirm("Supprimer cette entree ?","",function(){e.journal.splice(i,1);dbPut(e).then(function(){toast("Entree supprimee");closeModal();refreshAll();});});});
      acts.appendChild(ed);acts.appendChild(dl);row.appendChild(acts);
      body.appendChild(row);
    });
  }
  var addBtn=el("button","wide");addBtn.innerHTML='<span class="ic">'+ic("plus")+'</span>Ajouter une entree';addBtn.style.cssText="margin-top:18px;";
  addBtn.addEventListener("click",function(){closeModal();quickNoteOpen(e);});
  body.appendChild(addBtn);
  setModal("Journal : "+e.titre,body,[["Fermer","",closeModal]]);
}

function openNoteEditor(e){
  ST.subBackFn=function(){showCollectionDetail(e);};
  var body=el("div");
  body.appendChild(el("div","","Note actuelle : <b>"+(e.note!=null?e.note+"/10":"aucune")+"</b>"));
  var ng=el("div","note-grid");
  for(var n=1;n<=10;n++){
    (function(n){
      var b=el("button","note-btn",String(n));
      if(e.note===n){var c=noteColors(n);b.style.background=c[0];b.style.color=c[1];b.style.borderColor="transparent";}
      b.addEventListener("click",function(){e.note=n;dbPut(e).then(function(){toast("Note : "+n+"/10");closeOrBack();refreshAll();});});
      ng.appendChild(b);
    })(n);
  }
  body.appendChild(ng);
  var clearBtn=el("button","wide");clearBtn.textContent="Retirer la note";
  clearBtn.addEventListener("click",function(){e.note=null;dbPut(e).then(function(){toast("Note retiree");closeOrBack();refreshAll();});});
  body.appendChild(clearBtn);
  setModal("Note",body,[["Fermer","",closeOrBack]]);
}


/* ─────────── FORMULAIRE SIMPLE / AVANCÉ ─────────── */
function capturePanel(){var t=$("p-title");if(t)ST.draft.titre=t.value;var d=$("p-date");if(d)ST.draft.date=d.value;var c=$("p-comment");if(c)ST.draft.comment=c.value;var s=$("p-sub");if(s)ST.draft.sub=s.value;}
function rerenderPanel(){var mb=$("m-body");var sc=mb?mb.scrollTop:0;capturePanel();renderPanel(ST.editing,true);var mb2=$("m-body");if(mb2)mb2.scrollTop=sc;}

function renderPanel(entry,keepDraft){
  ST.editing=entry||null;ST.subBackFn=null;
  if(!keepDraft){
    if(entry){
      ST.panelType=entry.type;ST.currentNote=entry.note!=null?entry.note:null;ST.isFav=!!entry.isFavorite;ST.isEnc=!!entry.enCours;ST.isVoir=!!entry.aVoir;ST.isInCollection=!!entry.inCollection;
      ST.panelPoster=entry.posterUrl||"";ST.panelThumb=entry.posterThumb||"";
      ST.advFields={plateforme:entry.plateforme||"",dateAchat:entry.dateAchat||"",edition:entry.edition||"",bonus:(entry.bonus||[]).slice(),support:entry.support||"",packaging:entry.packaging||"",ean:entry.ean||"",url:entry.url||""};
      ST.draft={titre:entry.titre||"",date:toInputDate(entry.dateFin||""),comment:entry.comment||"",sub:entry.sousTitre||""};
      ST.draftJournal=JSON.parse(JSON.stringify(entry.journal||(entry.comment?[{kind:"free",text:entry.comment}]:[])));
    }else{
      ST.panelType=ST.currentType;ST.currentNote=null;ST.isFav=false;ST.isEnc=false;ST.isVoir=false;ST.isInCollection=false;
      ST.panelPoster=(ST.selectedItem&&ST.selectedItem.poster)||"";ST.panelThumb="";
      ST.advFields={plateforme:"",dateAchat:"",edition:"",bonus:[],support:"",packaging:"",ean:"",url:""};
      ST.draft={titre:(ST.selectedItem&&ST.selectedItem.title)||"",date:todayFR(),comment:"",sub:""};
      ST.draftJournal=[];
    }
  }
  var s=settingsLoad();var mode=s.panelMode||"simple";
  var body=el("div");
  var seg=el("div");seg.style.cssText="display:inline-flex;background:var(--s1);border:1px solid var(--bd);border-radius:22px;padding:4px;margin-bottom:22px;";
  ["simple","avance"].forEach(function(m){
    var b=el("button",mode===m?"on":"",m==="simple"?"Simple":"Avance");
    b.style.cssText="min-height:34px;padding:6px 16px;border:none;background:"+(mode===m?"var(--acc)":"transparent")+";border-radius:18px;font-size:13px;font-weight:600;color:"+(mode===m?"#fff":"var(--dim)")+";cursor:pointer;";
    b.addEventListener("click",function(){s.panelMode=m;settingsSave(s);rerenderPanel();});
    seg.appendChild(b);
  });
  body.appendChild(seg);
  function field(label,node){var w=el("div","field-box");w.appendChild(el("label","",label));w.appendChild(node);body.appendChild(w);return node;}

  // SIMPLE : Titre, Note, Affiche, Date
  var tIn=field("Titre",el("input"));tIn.id="p-title";tIn.value=ST.draft.titre;
  var nw=el("div","field-box");nw.appendChild(el("label","","Note"));
  var nch=el("div","note-grid");nch.style.marginBottom="0";
  for(var n=1;n<=10;n++){
    (function(n){
      var c=el("button","note-btn",String(n));
      if(ST.currentNote===n){var cc=noteColors(n);c.style.background=cc[0];c.style.color=cc[1];c.style.borderColor="transparent";}
      c.addEventListener("click",function(){
        if(ST.currentNote===n){ST.currentNote=null;nch.querySelectorAll(".note-btn").forEach(function(x){x.style.background="";x.style.color="";x.style.borderColor="";});}
        else{ST.currentNote=n;nch.querySelectorAll(".note-btn").forEach(function(x){x.style.background="";x.style.color="";x.style.borderColor="";});var cc2=noteColors(n);c.style.background=cc2[0];c.style.color=cc2[1];c.style.borderColor="transparent";}
      });
      nch.appendChild(c);
    })(n);
  }
  nw.appendChild(nch);body.appendChild(nw);
  var aw=el("div","field-box");aw.appendChild(el("label","","Affiche"));
  var ar=el("div");ar.style.display="flex";ar.style.gap="10px";ar.style.alignItems="center";
  var prev=el("img");prev.id="p-prev";prev.src=ST.panelPoster||NO_POSTER;prev.style.cssText="width:60px;border-radius:6px;cursor:pointer;border:1px solid var(--bd);";
  prev.addEventListener("click",function(){openPosterZoom(prev.src);});
  var bU=el("button","icon");bU.innerHTML=ic("link");
  var bI=el("button","icon");bI.innerHTML=ic("folder");
  var fI=el("input");fI.type="file";fI.accept="image/*";fI.hidden=true;
  bU.addEventListener("click",function(){
    ST.subBackFn=rerenderPanel;
    var body2=el("div");var inp=el("input");inp.placeholder="https://...";body2.appendChild(inp);
    setModal("URL image",body2,[["Valider","primary",function(){var v=inp.value.trim();if(v){ST.panelPoster=v;makeThumb(v).then(function(t){ST.panelThumb=t;});rerenderPanel();}}],["Annuler","",closeOrBack]]);
  });
  bI.addEventListener("click",function(){fI.click();});
  fI.addEventListener("change",function(ev){var f=ev.target.files[0];if(f)fileToResized(f,500).then(function(u){ST.panelPoster=u;makeThumb(u).then(function(t){ST.panelThumb=t;});prev.src=u;});});
  ar.appendChild(prev);ar.appendChild(bU);ar.appendChild(bI);ar.appendChild(fI);aw.appendChild(ar);body.appendChild(aw);
  var dIn=field("Date",el("input"));dIn.id="p-date";dIn.type="date";dIn.value=ST.draft.date;dIn.style.colorScheme="dark";

  if(mode==="avance"){
    // Statuts
    var sw=el("div","chips small");sw.style.marginBottom="22px";
    function sc(get,set,label,icn){
      var c=el("div","chip"+(get()?" on":""),'<span class="ic">'+ic(icn)+"</span>"+label);
      c.addEventListener("click",function(){set(!get());c.classList.toggle("on",get());});
      sw.appendChild(c);
    }
    sc(function(){return ST.isInCollection;},function(v){ST.isInCollection=v;},"Collection","box");
    sc(function(){return ST.isEnc;},function(v){ST.isEnc=v;},"En cours","hourglass");
    sc(function(){return ST.isVoir;},function(v){ST.isVoir=v;},"A voir","eye");
    body.appendChild(sw);
    var cIn=field("Commentaire",el("textarea"));cIn.id="p-comment";cIn.value=ST.draft.comment;
    var sIn=field("Detail",el("input"));sIn.id="p-sub";sIn.value=ST.draft.sub;
    // Journal inline
    var jw=el("div","field-box");jw.appendChild(el("label","","Journal"));
    var jb=el("div","chips small");jb.style.marginBottom="10px";
    [["time","Horodate","clock"],["free","Libre","pen"],["ep","Saison/Episode","tv"],["session","Session","timer"]].forEach(function(k){
      var c=el("div","chip",'<span class="ic">'+ic(k[2])+"</span>"+k[1]);
      c.addEventListener("click",function(){openDraft(k[0],jw);});
      jb.appendChild(c);
    });
    jw.appendChild(jb);
    var jlist=el("div");jlist.id="p-jlist";jw.appendChild(jlist);body.appendChild(jw);renderJList(jlist);
    // Champs avancés
    function advBtn(iconn,label,getVal,fn){
      var val=getVal();
      var b=el("button","adv-btn"+(val?" on":""));
      b.innerHTML='<span class="ic">'+ic(iconn)+'</span><span>'+label+'</span><span class="adv-val">'+esc(val)+'</span>';
      b.addEventListener("click",fn);
      return b;
    }
    var collGrid=el("div","adv-grid");
    collGrid.appendChild(advBtn("monitor","Plateforme",function(){return ST.advFields.plateforme;},function(){ST.subBackFn=rerenderPanel;openPlateformeModal();}));
    collGrid.appendChild(advBtn("calendar","Date achat",function(){return ST.advFields.dateAchat;},function(){ST.subBackFn=rerenderPanel;openDateAchatModal();}));
    collGrid.appendChild(advBtn("hash","Edition",function(){return ST.advFields.edition;},function(){ST.subBackFn=rerenderPanel;openEditionModal();}));
    collGrid.appendChild(advBtn("gift","Bonus",function(){return ST.advFields.bonus.join(", ");},function(){ST.subBackFn=rerenderPanel;openBonusModal();}));
    collGrid.appendChild(advBtn("box","Support",function(){return ST.advFields.support;},function(){ST.subBackFn=rerenderPanel;openSupportModal();}));
    collGrid.appendChild(advBtn("package-open","Packaging",function(){return ST.advFields.packaging;},function(){ST.subBackFn=rerenderPanel;openPackagingModal();}));
    collGrid.appendChild(advBtn("barcode","EAN",function(){return ST.advFields.ean;},function(){ST.subBackFn=rerenderPanel;openEANModal();}));
    collGrid.appendChild(advBtn("link","URL",function(){return ST.advFields.url;},function(){ST.subBackFn=rerenderPanel;openURLModal();}));
    body.appendChild(collGrid);
    // Liens recherche externe
    var searchLinks=el("div","search-links");
    var sl=el("span","","Rechercher :");searchLinks.appendChild(sl);
    [{name:"Google",icon:"search",url:"https://www.google.com/search?q="+encodeURIComponent(ST.draft.titre||"")},{name:"Steam",icon:"gamepad-2",url:"https://store.steampowered.com/search/?term="+encodeURIComponent(ST.draft.titre||"")},{name:"TMDB",icon:"film",url:"https://www.themoviedb.org/search?query="+encodeURIComponent(ST.draft.titre||"")},{name:"SC",icon:"heart",url:"https://www.senscritique.com/recherche?query="+encodeURIComponent(ST.draft.titre||"")}].forEach(function(l){
      var a=el("a","search-link");a.href=l.url;a.target="_blank";a.innerHTML='<span class="ic">'+ic(l.icon)+'</span>'+l.name;searchLinks.appendChild(a);
    });
    body.appendChild(searchLinks);
  }else{
    var cIn2=field("Commentaire",el("textarea"));cIn2.id="p-comment";cIn2.value=ST.draft.comment;
  }
  setModal(entry?"Modifier":"Nouvelle "+OE+"uvre",body,[["Enregistrer","primary",saveCurrentEntry],["Annuler","",closeModal]]);
}

function markCollection(){ST.isInCollection=true;}
function openPlateformeModal(){var body=el("div");PLATFORMS.forEach(function(p){var btn=el("button","wide");btn.innerHTML='<span class="ic">'+ic(p.icon)+'</span><span>'+p.name+'</span>';btn.style.justifyContent="flex-start";if(ST.advFields.plateforme===p.name)btn.classList.add("primary");btn.addEventListener("click",function(){ST.advFields.plateforme=p.name;markCollection();rerenderPanel();});body.appendChild(btn);});setModal("Plateforme",body,[["Annuler","",closeOrBack]]);}
function openDateAchatModal(){var body=el("div");var inp=el("input");inp.type="date";inp.value=ST.advFields.dateAchat||todayFR();inp.style.colorScheme="dark";body.appendChild(inp);setModal("Date d'achat",body,[["Valider","primary",function(){ST.advFields.dateAchat=inp.value;markCollection();rerenderPanel();}],["Annuler","",closeOrBack]]);}
function openEditionModal(){var body=el("div");var inp=el("input");inp.placeholder="Edition limitee...";inp.value=ST.advFields.edition||"";body.appendChild(inp);setModal("Edition",body,[["Valider","primary",function(){ST.advFields.edition=inp.value.trim();if(ST.advFields.edition)markCollection();rerenderPanel();}],["Annuler","",closeOrBack]]);}
function openBonusModal(){var body=el("div");BONUSES.forEach(function(b){var btn=el("button","wide");btn.innerHTML='<span class="ic">'+ic(b.icon)+'</span><span>'+b.name+'</span>';btn.style.justifyContent="flex-start";if(ST.advFields.bonus.indexOf(b.name)>=0)btn.classList.add("primary");btn.addEventListener("click",function(){var i=ST.advFields.bonus.indexOf(b.name);if(i>=0)ST.advFields.bonus.splice(i,1);else ST.advFields.bonus.push(b.name);btn.classList.toggle("primary",ST.advFields.bonus.indexOf(b.name)>=0);});body.appendChild(btn);});setModal("Bonus",body,[["Valider","primary",function(){if(ST.advFields.bonus.length)markCollection();rerenderPanel();}],["Annuler","",closeOrBack]]);}
function openSupportModal(){
  var body=el("div");
  var free=el("button","wide");free.innerHTML='<span class="ic">'+ic("pen")+'</span><span style="font-style:italic;">...</span>';free.style.justifyContent="flex-start";
  free.addEventListener("click",function(){
    ST.subBackFn=openSupportModal;
    var body2=el("div");var inp=el("input");inp.placeholder="Ta valeur...";body2.appendChild(inp);
    setModal("Support libre",body2,[["Valider","primary",function(){var v=inp.value.trim();if(v){ST.advFields.support=v;markCollection();rerenderPanel();}}],["Annuler","",closeOrBack]]);
  });
  body.appendChild(free);
  SUPPORT_CHOICES.forEach(function(s2){var btn=el("button","wide");btn.innerHTML='<span>'+s2+'</span>';btn.style.justifyContent="flex-start";if(ST.advFields.support===s2)btn.classList.add("primary");btn.addEventListener("click",function(){ST.advFields.support=s2;markCollection();rerenderPanel();});body.appendChild(btn);});
  setModal("Support",body,[["Annuler","",closeOrBack]]);
}
function openPackagingModal(){
  var body=el("div");
  var free=el("button","wide");free.innerHTML='<span class="ic">'+ic("pen")+'</span><span style="font-style:italic;">...</span>';free.style.justifyContent="flex-start";
  free.addEventListener("click",function(){
    ST.subBackFn=openPackagingModal;
    var body2=el("div");var inp=el("input");inp.placeholder="Ta valeur...";body2.appendChild(inp);
    setModal("Packaging libre",body2,[["Valider","primary",function(){var v=inp.value.trim();if(v){ST.advFields.packaging=v;markCollection();rerenderPanel();}}],["Annuler","",closeOrBack]]);
  });
  body.appendChild(free);
  PACKAGING_CHOICES.forEach(function(p2){var btn=el("button","wide");btn.innerHTML='<span>'+p2+'</span>';btn.style.justifyContent="flex-start";if(ST.advFields.packaging===p2)btn.classList.add("primary");btn.addEventListener("click",function(){ST.advFields.packaging=p2;markCollection();rerenderPanel();});body.appendChild(btn);});
  setModal("Packaging",body,[["Annuler","",closeOrBack]]);
}
function openEANModal(){var body=el("div");var inp=el("input");inp.placeholder="EAN";inp.inputMode="numeric";inp.value=ST.advFields.ean||"";body.appendChild(inp);var scanBtn=el("button","wide");scanBtn.innerHTML='<span class="ic">'+ic("camera")+'</span><span>Scanner</span>';scanBtn.addEventListener("click",function(){startEAN(function(code){ST.advFields.ean=code;markCollection();rerenderPanel();});});body.appendChild(scanBtn);setModal("EAN",body,[["Valider","primary",function(){ST.advFields.ean=inp.value.trim();if(ST.advFields.ean)markCollection();rerenderPanel();}],["Annuler","",closeOrBack]]);}
function openURLModal(){var body=el("div");var inp=el("input");inp.placeholder="URL de la fiche";inp.value=ST.advFields.url||"";body.appendChild(inp);setModal("URL",body,[["Valider","primary",function(){ST.advFields.url=inp.value.trim();if(ST.advFields.url)markCollection();rerenderPanel();}],["Annuler","",closeOrBack]]);}

function saveCurrentEntry(){
  capturePanel();
  var title=ST.draft.titre.trim();
  if(!title){toast("Titre obligatoire.");return;}
  if(ST.editing){finishSave(ST.editing,ST.editing.id,ST.editing.dateAjout);return;}
  var type=ST.panelType;
  var dup=null;for(var i=0;i<ST.entries.length;i++){if(ST.entries[i].type===type&&norm(ST.entries[i].titre)===norm(title)){dup=ST.entries[i];break;}}
  if(dup){showConfirm("Doublon detecte",dup.titre+" existe deja. Modifier l'existant ?",function(){finishSave(dup,dup.id,dup.dateAjout);},"Modifier");}
  else{finishSave(null,null,null);}
}
async function finishSave(base,entryId,dateAjout){
  var type=ST.panelType;base=base||{};
  if(!entryId){entryId=type+"_"+((ST.selectedItem&&ST.selectedItem.id)||Date.now());var exists=false;for(var k=0;k<ST.entries.length;k++){if(ST.entries[k].id===entryId){exists=true;break;}}if(exists)entryId+="_"+Date.now();dateAjout=new Date().toISOString();}
  var e=Object.assign({},base);
  e.id=entryId;e.type=type;e.titre=ST.draft.titre.trim();e.sousTitre=(ST.draft.sub||"").trim();
  e.note=ST.currentNote;e.isFavorite=ST.isFav;e.enCours=ST.isEnc;e.aVoir=ST.isVoir;e.inCollection=ST.isInCollection;
  e.dateFin=ST.draft.date?formatDate(ST.draft.date):"";e.comment=ST.draft.comment.trim();e.journal=ST.draftJournal;
  e.posterUrl=ST.panelPoster;e.posterThumb=ST.panelThumb||(await makeThumb(ST.panelPoster));
  if(ST.isInCollection){e.plateforme=ST.advFields.plateforme||null;e.dateAchat=ST.advFields.dateAchat||null;e.edition=ST.advFields.edition||null;e.bonus=ST.advFields.bonus.slice();e.support=ST.advFields.support||null;e.packaging=ST.advFields.packaging||null;e.ean=ST.advFields.ean||"";e.url=ST.advFields.url||"";}
  else{e.plateforme=null;e.dateAchat=null;e.edition=null;e.bonus=[];e.support=null;e.packaging=null;e.ean="";e.url="";}
  e.dateAjout=dateAjout;
  await dbPut(e);if(navigator.vibrate)navigator.vibrate(25);toast("Enregistre");closeModal();refreshAll();
}
function duplicateEntry(e){ST.selectedItem=null;ST.editing=null;closeModal();setTimeout(function(){renderPanel(null);ST.draftJournal=[];ST.draft.titre=e.titre;ST.panelType=e.type;},60);}

// Journal inline (mode avancé)
function openDraft(kind,parent){
  var old=$("p-jdraft");if(old)old.remove();
  var d=el("div","card");d.id="p-jdraft";
  if(kind==="time"){var rw=el("div","row2");rw.innerHTML='<label>Date & heure<input type="datetime-local" id="jd-when" style="color-scheme:dark"></label>';d.appendChild(rw);}
  if(kind==="ep"){var r=el("div","row2");r.innerHTML='<label>Saison<input type="number" id="jd-s" min="0"></label><label>Episode<input type="number" id="jd-e" min="0"></label>';d.appendChild(r);}
  if(kind==="session"){var rs=el("div","row2");rs.innerHTML='<label>Duree<input type="text" id="jd-dur" placeholder="2h30..."></label>';d.appendChild(rs);}
  var ta=el("textarea");ta.placeholder="Ton entree...";d.appendChild(ta);
  var act=el("div","row2");act.style.marginTop="12px";
  var ok=el("button","primary");ok.innerHTML='<span class="ic">'+ic("plus")+"</span>Ajouter";
  var no=el("button");no.innerHTML='<span class="ic">'+ic("x")+"</span>Annuler";
  act.appendChild(ok);act.appendChild(no);d.appendChild(act);parent.appendChild(d);
  ok.addEventListener("click",function(){
    var text=ta.value.trim();if(!text&&kind!=="ep"){toast("Entre un texte.");return;}
    if(kind==="time"){var wv=$("jd-when");ST.draftJournal.push({kind:"time",ts:fmtWhen(wv?wv.value:""),text:text,at:Date.now()});}
    else if(kind==="free"){ST.draftJournal.push({kind:"free",text:text,at:Date.now()});}
    else if(kind==="session"){var dd=$("jd-dur");ST.draftJournal.push({kind:"session",dur:dd?dd.value.trim():"",text:text,at:Date.now()});}
    else{var ss=$("jd-s");var ee=$("jd-e");ST.draftJournal.push({kind:"ep",s:parseInt(ss?ss.value||"0":"0",10),e:parseInt(ee?ee.value||"0":"0",10),note:null,text:text,at:Date.now()});}
    d.remove();renderJList($("p-jlist"));
  });
  no.addEventListener("click",function(){d.remove();});
}
function renderJList(c){
  if(!c)return;c.innerHTML="";
  ST.draftJournal.forEach(function(x,i){
    var row=el("div");row.style.cssText="display:flex;gap:12px;padding:14px 0;border-bottom:1px solid var(--bd);align-items:flex-start;";
    var b=el("div");b.style.cssText="flex:1;min-width:0;";
    var ft=el("div","",esc(entryTag(x)));ft.style.cssText="font-size:12px;color:var(--dim);font-family:var(--fm);margin-bottom:5px;";b.appendChild(ft);
    var fx=el("div","",esc(x.text||""));fx.style.cssText="font-size:15px;";b.appendChild(fx);
    var del=el("button");del.innerHTML='<span class="ic">'+ic("trash-2")+'</span>';del.style.cssText="background:none;border:none;padding:8px;min-height:0;width:36px;height:36px;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;";
    del.addEventListener("click",function(){ST.draftJournal.splice(i,1);renderJList(c);});
    row.appendChild(b);row.appendChild(del);c.appendChild(row);
  });
}


/* ─────────── NOTE RAPIDE (avec pickers maison) ─────────── */
function quickNoteOpen(e,preText,kind,idx){
  ST.qnEntry=e||null;ST.qnEditIdx=(idx!=null?idx:null);ST.qnKind=kind||"time";
  var t=$("qn-title");if(t)t.textContent=(ST.qnEditIdx!=null?"Modifier : ":"Noter : ")+(e?e.titre:"note libre");
  var txt=$("qn-text");if(txt)txt.value=preText||"";
  // Choix oeuvre (liste radio maison)
  var erow=$("qn-entry-row");var lbl=$("qn-entry-label");
  if(lbl)lbl.textContent=e?e.titre:"Choisir une oeuvre...";
  if(erow)erow.classList.toggle("hidden",!!e);
  syncQnKind();
  var sb=$("qn-save");if(sb)sb.innerHTML=ST.qnEditIdx!=null?'<span class="ic">'+ic("save")+'</span>Remplacer':'<span class="ic">'+ic("plus")+'</span>Ajouter';
  var k=$("qn-kind");if(!k)return;k.innerHTML="";
  [["time","Horodate","clock"],["free","Libre","pen"],["ep","Saison/Episode","tv"],["session","Session","timer"]].forEach(function(x){
    var c=el("div","chip"+(x[0]===ST.qnKind?" on":""),'<span class="ic">'+ic(x[2])+"</span>"+x[1]);
    c.addEventListener("click",function(){ST.qnKind=x[0];k.querySelectorAll(".chip").forEach(function(y){y.classList.remove("on");});c.classList.add("on");syncQnKind();});
    k.appendChild(c);
  });
  showOverlay("qn-overlay");
}
function syncQnKind(){
  var wr=$("qn-when-row");if(wr)wr.classList.toggle("hidden",ST.qnKind!=="time");
  var er=$("qn-ep-row");if(er)er.classList.toggle("hidden",ST.qnKind!=="ep");
  var sr=$("qn-session-row");if(sr)sr.classList.toggle("hidden",ST.qnKind!=="session");
  if(ST.qnKind==="time"){var wl=$("qn-when-label");if(wl)wl.textContent="Maintenant";}
}
function quickNoteClose(){hideOverlay("qn-overlay");ST.qnEditIdx=null;}
async function quickNoteSave(){
  var e=ST.qnEntry;
  var txt=$("qn-text");var text=txt?txt.value.trim():"";
  if(!text&&ST.qnKind!=="ep"){toast("Entre un texte.");return;}
  if(!e){
    var fake={id:"libre_"+Date.now(),titre:"Note libre",type:"Livre",journal:[],dateFin:todayFR(),dateAjout:new Date().toISOString(),inCollection:false};
    fake.journal.push(buildQnObj(text));
    await dbPut(fake);toast("Note libre ajoutee");quickNoteClose();refreshAll();return;
  }
  if(!e.journal)e.journal=[];
  var obj=buildQnObj(text);
  if(ST.qnEditIdx!=null&&e.journal[ST.qnEditIdx]){obj.at=e.journal[ST.qnEditIdx].at||obj.at;e.journal[ST.qnEditIdx]=obj;}
  else{e.journal.push(obj);}
  await dbPut(e);if(navigator.vibrate)navigator.vibrate(15);toast(ST.qnEditIdx!=null?"Entree modifiee":"Entree ajoutee");quickNoteClose();refreshAll();
}
function buildQnObj(text){
  if(ST.qnKind==="time"){var pv=ST.pickerVal;return{kind:"time",ts:pv?fmtWhen(pv):nowStamp(),text:text,at:Date.now()};}
  if(ST.qnKind==="free"){return{kind:"free",text:text,at:Date.now()};}
  if(ST.qnKind==="session"){var dd=$("qn-dur");return{kind:"session",dur:dd?dd.value.trim():"",text:text,at:Date.now()};}
  var ss=$("qn-s");var ee=$("qn-e");return{kind:"ep",s:parseInt(ss?ss.value||"0":"0",10),e:parseInt(ee?ee.value||"0":"0",10),note:null,text:text,at:Date.now()};
}


/* ─────────── PICKER DATE/HEURE MAISON ─────────── */
function openDateTimePicker(initialIso,cb){
  ST.pickerCb=cb;
  var d=initialIso?new Date(initialIso):new Date();
  var state={y:d.getFullYear(),mo:d.getMonth(),da:d.getDate(),h:d.getHours(),mi:d.getMinutes()};
  var yt=$("picker-title");if(yt)yt.textContent="Date & heure";
  var dc=$("picker-date");dc.innerHTML="";
  var hc=$("picker-hour");hc.innerHTML="";
  function mkCol(title,items,selKey,onChange){
    var col=el("div","picker-col");
    col.appendChild(el("div","ph",title));
    var sc=el("div","picker-scroll");
    items.forEach(function(it){
      var row=el("div","pick-item"+(it.val===state[selKey]?" on":""),it.lab);
      row.dataset.val=it.val;
      row.addEventListener("click",function(){state[selKey]=it.val;sc.querySelectorAll(".pick-item").forEach(function(x){x.classList.remove("on");});row.classList.add("on");onChange&&onChange();});
      sc.appendChild(row);
    });
    col.appendChild(sc);return col;
  }
  var days=[],months=[],years=[],hours=[],mins=[];
  for(var da=1;da<=31;da++)days.push({val:da,lab:String(da)});
  MONTHS.forEach(function(m,i){months.push({val:i,lab:m});});
  for(var y=1900;y<=2100;y++)years.push({val:y,lab:String(y)});
  for(var h=0;h<24;h++)hours.push({val:h,lab:pad2(h)});
  for(var mi=0;mi<60;mi+=5)mins.push({val:mi,lab:pad2(mi)});
  dc.appendChild(mkCol("Jour",days,"da"));
  dc.appendChild(mkCol("Mois",months,"mo"));
  dc.appendChild(mkCol("Annee",years,"y"));
  hc.appendChild(mkCol("Heure",hours,"h"));
  hc.appendChild(mkCol("Min",mins,"mi"));
  var ok=$("picker-ok");if(ok)ok.onclick=function(){hideOverlay("picker-overlay");var iso=state.y+"-"+pad2(state.mo+1)+"-"+pad2(state.da)+"T"+pad2(state.h)+":"+pad2(state.mi);if(ST.pickerCb)ST.pickerCb(iso);};
  var cl=$("picker-clear");if(cl)cl.onclick=function(){hideOverlay("picker-overlay");if(ST.pickerCb)ST.pickerCb(null);};
  showOverlay("picker-overlay");
}


/* ─────────── LISTE RADIO CHOIX D'ŒUVRE ─────────── */
function openEntryPicker(cb){
  ST.entryPickCb=cb;
  var body=el("div");
  var list=el("div","radio-list");
  var oFree=el("div","radio-opt sel");oFree.innerHTML='<span class="dot"></span><span class="lbl">Note libre (sans oeuvre)</span>';
  var chosen=null;
  oFree.addEventListener("click",function(){chosen=null;list.querySelectorAll(".radio-opt").forEach(function(x){x.classList.remove("sel");});oFree.classList.add("sel");});
  list.appendChild(oFree);
  ST.entries.forEach(function(en){
    var o=el("div","radio-opt");o.innerHTML='<span class="dot"></span><span class="lbl">'+esc(en.titre)+"</span>";
    o.addEventListener("click",function(){chosen=en;list.querySelectorAll(".radio-opt").forEach(function(x){x.classList.remove("sel");});o.classList.add("sel");});
    list.appendChild(o);
  });
  body.appendChild(list);
  setModal("Choisir une oeuvre",body,[["Valider","primary",function(){closeModal();if(ST.entryPickCb)ST.entryPickCb(chosen);}],["Annuler","",function(){closeModal();if(ST.entryPickCb)ST.entryPickCb(undefined);}]]);
}


/* ─────────── RENDU JOURNAL ─────────── */
function renderEncours(){
  var row=$("j-encours");if(!row)return;row.innerHTML="";
  var enc=ST.entries.filter(function(e){return e.enCours;});
  if(!enc.length){row.style.display="none";return;}
  row.style.display="";
  enc.forEach(function(e){
    var m=el("div","mini");
    m.appendChild(renderPoster(e,false));
    m.appendChild(el("div","t",esc(e.titre)));
    var l=journalLines(e);
    m.appendChild(el("div","s",esc(truncate(l.length?l[l.length-1]:"En cours...",28))));
    m.addEventListener("click",function(){showCollectionDetail(e);});
    row.appendChild(m);
  });
}
function renderJournal(){
  var y=ST.calDate.getFullYear(),mo=ST.calDate.getMonth();
  var bt=$("bilan-title");if(bt)bt.textContent="Journal de "+MONTHS_MIN[mo]+" "+y;
  renderEncours();
  var feed=[];
  ST.entries.forEach(function(en){
    (en.journal||[]).forEach(function(x,idx){
      var entryDate=parseDateFR(en.dateFin);
      if(entryDate&&entryDate.y===y&&entryDate.mo===mo+1){feed.push({e:en,x:x,idx:idx,at:x.at||0});}
    });
  });
  feed.sort(function(a,b){return b.at-a.at;});
  var f=$("j-feed");if(!f)return;f.innerHTML="";
  if(!feed.length)f.appendChild(emptyBox("book-open","Aucune entree ce mois-ci."));
  feed.slice(0,60).forEach(function(it){
    var item=el("div","journal-entry");
    var posterDiv=el("div","poster");var pImg=el("img");pImg.src=it.e.posterThumb||it.e.posterUrl||NO_POSTER;posterDiv.appendChild(pImg);
    posterDiv.addEventListener("click",function(ev){ev.stopPropagation();showCollectionDetail(it.e);});
    item.appendChild(posterDiv);
    var b=el("div","content");
    b.appendChild(el("div","time",esc(entryTag(it.x))));
    var textEl=el("div","text",esc(truncate(it.x.text||"",90)));
    textEl.addEventListener("click",function(ev){ev.stopPropagation();openReaderForEntry(it.e,it.idx);});
    b.appendChild(textEl);
    b.appendChild(el("div","title",esc(it.e.titre)));
    item.appendChild(b);
    var acts=el("div","acts");
    var edBtn=el("button");edBtn.innerHTML='<span class="ic">'+ic("pen")+'</span>';
    edBtn.addEventListener("click",function(ev){ev.stopPropagation();quickNoteOpen(it.e,it.x.text,it.x.kind,it.idx);});
    var delBtn=el("button","del");delBtn.innerHTML='<span class="ic">'+ic("trash-2")+'</span>';
    delBtn.addEventListener("click",function(ev){ev.stopPropagation();showConfirm("Supprimer cette entree ?","",function(){it.e.journal.splice(it.idx,1);dbPut(it.e).then(function(){toast("Entree supprimee");refreshAll();});});});
    acts.appendChild(edBtn);acts.appendChild(delBtn);
    item.appendChild(acts);
    item.addEventListener("click",function(){openReaderForEntry(it.e,it.idx);});
    f.appendChild(item);
  });
}

/** Calendrier complet (jours cliquables) — ouvre le mois choisi. */
function renderCalendar(){
  var cal=$("cal-grid");if(!cal)return;cal.innerHTML="";
  var y=ST.calDate.getFullYear(),mo=ST.calDate.getMonth();
  var mt=$("cal-month-title");if(mt)mt.textContent=MONTHS[mo]+" "+y;
  ["L","M","M","J","V","S","D"].forEach(function(d){var el2=el("div","cal-day-name");el2.textContent=d;cal.appendChild(el2);});
  var first=(new Date(y,mo,1).getDay()+6)%7;
  var days=new Date(y,mo+1,0).getDate();
  var today=new Date();
  for(var i=0;i<first;i++)cal.appendChild(el("div","cal-day empty"));
  for(var d=1;d<=days;d++){
    (function(d){
      var c=el("div","cal-day");c.textContent=d;
      var de=ST.entries.filter(function(e){var p=parseDateFR(e.dateFin);return p&&p.y===y&&p.mo===mo+1&&p.d===d;});
      if(de.length)c.classList.add("has-entry");
      if(d===today.getDate()&&mo===today.getMonth()&&y===today.getFullYear())c.classList.add("today");
      c.addEventListener("click",function(){hideOverlay("calendar-overlay");ST.calDate=new Date(y,mo,d);renderJournal();});
      cal.appendChild(c);
    })(d);
  }
}
function openMonthPicker(){ST.monthPickYear=ST.calDate.getFullYear();renderMonthGrid();showOverlay("month-overlay");}
function renderMonthGrid(){
  var yt=$("month-year-title");if(yt)yt.textContent=String(ST.monthPickYear);
  var g=$("month-grid");if(!g)return;g.innerHTML="";
  MONTHS.forEach(function(m,i){
    var c=el("div","month-cell"+(i===ST.calDate.getMonth()&&ST.monthPickYear===ST.calDate.getFullYear()?" on":""),m);
    c.addEventListener("click",function(){ST.calDate=new Date(ST.monthPickYear,i,1);hideOverlay("month-overlay");renderJournal();});
    g.appendChild(c);
  });
}


/* ─────────── OPTIONS ─────────── */
function renderOptions(){
  var grid=$("opt-grid");if(!grid)return;grid.innerHTML="";
  [{icon:"save",label:"Sauvegarde",fn:openOptSave},{icon:"palette",label:"Apparence",fn:openOptAppearance},{icon:"bar-chart-3",label:"Stats",fn:openOptStats},{icon:"search",label:"Recherche",fn:openOptSearch},{icon:"smartphone",label:"Application",fn:openOptApp},{icon:"info",label:"A propos",fn:openOptAbout},{icon:"alert",label:"Danger",fn:openOptDanger}].forEach(function(cat){
    var btn=el("button","opt-btn");btn.innerHTML='<span class="ic">'+ic(cat.icon)+'</span><span>'+cat.label+'</span>';btn.addEventListener("click",cat.fn);grid.appendChild(btn);
  });
}
function openOptSave(){
  var body=el("div");
  body.appendChild(el("div","sec-title","Sauvegarde locale"));
  var expBtn=el("button");expBtn.innerHTML='<span class="ic">'+ic("download")+"</span>Export JSON";expBtn.addEventListener("click",function(){exportJSON();});body.appendChild(expBtn);
  var impBtn=el("button");impBtn.innerHTML='<span class="ic">'+ic("upload")+"</span>Import (fusion)";impBtn.addEventListener("click",function(){importJSON();});body.appendChild(impBtn);
  var tsvBtn=el("button");tsvBtn.innerHTML='<span class="ic">'+ic("clipboard-copy")+"</span>Copier tout (TSV)";tsvBtn.addEventListener("click",function(){copyTSV();});body.appendChild(tsvBtn);
  body.appendChild(el("div","sec-title","Backup GitHub (repo prive)"));
  var goIn=el("input");goIn.placeholder="Owner (ex : BoraGooum)";goIn.value=localStorage.getItem("gh_owner")||"";goIn.style.marginBottom="10px";body.appendChild(goIn);
  var grIn=el("input");grIn.placeholder="Repo (ex : collection-backup)";grIn.value=localStorage.getItem("gh_repo")||"";grIn.style.marginBottom="10px";body.appendChild(grIn);
  var gtIn=el("input");gtIn.placeholder="Token (github_pat_...)";gtIn.type="password";gtIn.value=localStorage.getItem("gh_token")||"";gtIn.style.marginBottom="14px";body.appendChild(gtIn);
  var gsave=el("button","primary");gsave.innerHTML='<span class="ic">'+ic("save")+"</span>Sauver la config";gsave.addEventListener("click",function(){localStorage.setItem("gh_owner",goIn.value.trim());localStorage.setItem("gh_repo",grIn.value.trim());localStorage.setItem("gh_token",gtIn.value.trim());toast("Config GitHub sauvee");});body.appendChild(gsave);
  var gtest=el("button");gtest.innerHTML='<span class="ic">'+ic("link")+"</span>Tester la connexion";gtest.addEventListener("click",function(){ghTest();});body.appendChild(gtest);
  var gnow=el("button");gnow.innerHTML='<span class="ic">'+ic("upload")+"</span>Sauvegarder maintenant";gnow.addEventListener("click",function(){ghBackupNow(true);});body.appendChild(gnow);
  var gres=el("button");gres.innerHTML='<span class="ic">'+ic("download")+"</span>Restaurer depuis GitHub";gres.addEventListener("click",function(){showConfirm("Restaurer ?","Les oeuvres manquantes seront ajoutees.",function(){ghRestore();},"Restaurer");});body.appendChild(gres);
  var lb2=localStorage.getItem("last_gh_backup");
  body.appendChild(el("div","","Dernier backup GitHub : <b>"+(lb2?new Date(parseInt(lb2,10)).toLocaleString("fr-FR"):"jamais")+"</b>"));
  setModal("Sauvegarde",body,[["Fermer","",closeModal]]);
}
function openOptAppearance(){var s=settingsLoad();var body=el("div");body.appendChild(el("label","","Densite"));var dPill=el("div","pill-sel");[["comfort","Confort"],["compact","Compact"]].forEach(function(o){var b=el("button",o[0]===s.density?"on":"",o[1]);b.addEventListener("click",function(){s.density=o[0];settingsSave(s);applySettings();closeModal();openOptAppearance();});dPill.appendChild(b);});body.appendChild(dPill);body.appendChild(el("label","","Taille texte"));var fPill=el("div","pill-sel");[["s","S"],["m","M"],["l","L"]].forEach(function(o){var b=el("button",o[0]===s.fontSize?"on":"",o[1]);b.addEventListener("click",function(){s.fontSize=o[0];settingsSave(s);applySettings();closeModal();openOptAppearance();});fPill.appendChild(b);});body.appendChild(fPill);setModal("Apparence",body,[["Fermer","",closeModal]]);}
function openOptStats(){var body=el("div");var entries=ST.entries;var total=entries.length;var byType={},sum=0,cnt=0;entries.forEach(function(e){byType[e.type]=(byType[e.type]||0)+1;if(e.note!=null){sum+=e.note;cnt++;}});var sec=el("div");sec.style.marginBottom="18px";var h=el("h4","","Par type");h.style.cssText="font-size:13px;font-weight:700;color:var(--acc);margin-bottom:10px;";sec.appendChild(h);Object.keys(byType).forEach(function(t){var r=el("div","sline");r.innerHTML='<span>'+esc(t)+'</span><b>'+byType[t]+'</b>';sec.appendChild(r);});body.appendChild(sec);var sec2=el("div");var h2=el("h4","","Notes");h2.style.cssText="font-size:13px;font-weight:700;color:var(--acc);margin-bottom:10px;";sec2.appendChild(h2);var r2=el("div","sline");r2.innerHTML='<span>Moyenne</span><b>'+(cnt?(sum/cnt).toFixed(1):"--")+'/10</b>';sec2.appendChild(r2);var r3=el("div","sline");r3.innerHTML='<span>Total oeuvres</span><b>'+total+'</b>';sec2.appendChild(r3);body.appendChild(sec2);setModal("Statistiques",body,[["Fermer","",closeModal]]);}
function openOptSearch(){var s=settingsLoad();var body=el("div");body.appendChild(el("label","","Type par defaut"));var tPill=el("div","pill-sel");tPill.style.cssText="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px;";allTypes().forEach(function(t){var b=el("button","chip"+(t===s.defaultType?" on":""),t);b.addEventListener("click",function(){s.defaultType=t;settingsSave(s);ST.currentType=t;closeModal();openOptSearch();buildTypeDropdown();});tPill.appendChild(b);});body.appendChild(tPill);setModal("Recherche",body,[["Fermer","",closeModal]]);}
function openOptApp(){var body=el("div");var instBtn=el("button");instBtn.innerHTML='<span class="ic">'+ic("download")+"</span>Installer l'appli";instBtn.addEventListener("click",function(){triggerInstall();});body.appendChild(instBtn);var cacheBtn=el("button");cacheBtn.innerHTML='<span class="ic">'+ic("trash")+"</span>Vider cache offline";cacheBtn.addEventListener("click",function(){if("caches"in window)caches.keys().then(function(k){k.forEach(function(x){caches.delete(x);});});toast("Cache vide");});body.appendChild(cacheBtn);body.appendChild(el("div","","Reseau : <b>"+(navigator.onLine?"connecte":"hors-ligne")+"</b>"));setModal("Application",body,[["Fermer","",closeModal]]);}
function openOptAbout(){var body=el("div");body.appendChild(el("div","","Version : <b>V12.0</b>"));body.appendChild(el("div","","Build : <b>"+new Date(BUILD).toLocaleString("fr-FR",{timeZone:"Europe/Paris"})+"</b>"));var cred=el("a","","Cree par Gooumbora");cred.href="https://www.senscritique.com/Gooumbora";cred.target="_blank";cred.style.color="var(--acc)";body.appendChild(cred);setModal("A propos",body,[["Fermer","",closeModal]]);}
function openOptDanger(){var body=el("div");var clearBtn=el("button");clearBtn.innerHTML='<span class="ic">'+ic("trash")+"</span>Vider la collection";clearBtn.addEventListener("click",function(){showConfirm("Effacer TOUTES tes oeuvres ?","Cette action est irreversible.",function(){(async function(){for(var i=0;i<ST.entries.length;i++)await dbDelete(ST.entries[i].id);refreshAll();toast("Vide");})();},"Vider");});body.appendChild(clearBtn);var resetBtn=el("button");resetBtn.innerHTML='<span class="ic">'+ic("rotate-ccw")+"</span>Reinitialiser reglages";resetBtn.addEventListener("click",function(){showConfirm("Remettre les reglages par defaut ?","",function(){localStorage.removeItem("settings");settingsSave(Object.assign({},SETTINGS_DEFAULTS));applySettings();toast("Reglages reinitialises");},"Reinitialiser");});body.appendChild(resetBtn);setModal("Danger",body,[["Fermer","",closeModal]]);}


/* ─────────── BACKUP GITHUB ─────────── */
function ghConfig(){return{owner:(localStorage.getItem("gh_owner")||"").trim(),repo:(localStorage.getItem("gh_repo")||"").trim(),token:(localStorage.getItem("gh_token")||"").trim()};}
function ghB64encode(s){return btoa(unescape(encodeURIComponent(s)));}
function ghB64decode(s){return decodeURIComponent(escape(atob(s)));}
async function ghGetFile(c,path){var r=await fetch("https://api.github.com/repos/"+c.owner+"/"+c.repo+"/contents/"+path,{headers:{Authorization:"Bearer "+c.token,Accept:"application/vnd.github+json"}});if(r.status===404)return null;if(!r.ok)throw new Error("GET "+r.status);return await r.json();}
async function ghPutFile(c,path,content){var cur=await ghGetFile(c,path);var body={message:"Backup auto "+new Date().toISOString(),content:ghB64encode(content)};if(cur&&cur.sha)body.sha=cur.sha;var r=await fetch("https://api.github.com/repos/"+c.owner+"/"+c.repo+"/contents/"+path,{method:"PUT",headers:{Authorization:"Bearer "+c.token,Accept:"application/vnd.github+json","Content-Type":"application/json"},body:JSON.stringify(body)});if(!r.ok)throw new Error("PUT "+r.status);return await r.json();}
var ghTimer=null;
function scheduleGitHubBackup(){var c=ghConfig();if(!c.owner||!c.repo||!c.token)return;if(ghTimer)clearTimeout(ghTimer);ghTimer=setTimeout(function(){ghBackupNow(false);},5000);}
async function ghBackupNow(manual){var c=ghConfig();if(!c.owner||!c.repo||!c.token){if(manual)toast("Configure GitHub dans Options.");return;}var data={version:"V12",exportDate:new Date().toISOString(),settings:settingsLoad(),customTypes:loadCustomTypes(),entries:ST.entries};try{await ghPutFile(c,"sauvegarde.json",JSON.stringify(data));localStorage.setItem("last_gh_backup",String(Date.now()));if(manual)toast("Sauvegarde GitHub OK");}catch(e){if(manual)toast("Erreur GitHub : "+e.message,3000);}}
async function ghTest(){var c=ghConfig();if(!c.owner||!c.repo||!c.token){toast("Remplis owner, repo et token.");return;}try{var r=await fetch("https://api.github.com/repos/"+c.owner+"/"+c.repo,{headers:{Authorization:"Bearer "+c.token,Accept:"application/vnd.github+json"}});if(r.ok){var d=await r.json();toast("Connexion OK : "+d.full_name+(d.private?" (prive)":" (PUBLIC !)"));}else toast("Erreur "+r.status,3000);}catch(e){toast("Reseau impossible",3000);}}
async function ghRestore(){var c=ghConfig();if(!c.owner||!c.repo||!c.token){toast("Configure GitHub dans Options.");return;}try{var f=await ghGetFile(c,"sauvegarde.json");if(!f){toast("Aucune sauvegarde trouvee.",3000);return;}var data=JSON.parse(ghB64decode(f.content));var list=data.entries||[];var ids={};ST.entries.forEach(function(x){ids[x.id]=1;});var added=0;for(var i=0;i<list.length;i++){var en=list[i];if(en&&en.id&&!ids[en.id]){if(!en.titre)en.titre="Sans titre";if(!en.dateAjout)en.dateAjout=new Date().toISOString();await dbPut(en);added++;}}if(data.settings)settingsSave(Object.assign({},SETTINGS_DEFAULTS,data.settings));if(data.customTypes)saveCustomTypes(data.customTypes);applySettings();buildTypeDropdown();refreshAll();toast("Restaure : "+added+" oeuvre(s) ajoutee(s)");}catch(e){toast("Restauration impossible : "+e.message,3000);}}