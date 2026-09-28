var ST={entries:[],view:"search",colQuery:"",colSort:"date-desc",colSupport:"all",calDate:new Date(),calOpen:false,editing:null,selectedItem:null,currentType:"Film",panelType:"Film",currentNote:null,isFav:false,isEnc:false,isVoir:false,draftJournal:[],panelPoster:"",panelThumb:"",qnEntry:null,qnKind:"time",qnEditIdx:null,recent:[],menuEntry:null,filterType:"all",filterSupport:"all",filterSort:"date-desc",isInCollection:false,advFields:{plateforme:"",dateAchat:"",edition:"",bonus:[],support:"",packaging:"",ean:"",url:""},draft:{titre:"",date:"",comment:"",sub:""},subBackFn:null};
var overlayStack=[];
var FOOT_IC={"Modifier":"edit","Fermer":"x","Enregistrer":"save","Annuler":"x","Ajouter":"plus","Supprimer":"trash-2","Valider":"save","Remplacer":"save","Vider":"trash","Réinitialiser":"rotate-ccw"};

function el(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d;}
function $(id){return document.getElementById(id);}
function emptyBox(icn,txt){var d=el("div","empty");d.innerHTML='<span class="ic">'+ic(icn)+'</span>'+esc(txt);return d;}
function toast(m,t){var e=$("toast");if(!e)return;e.textContent=m;e.classList.add("show");setTimeout(function(){e.classList.remove("show");},t||1800);}

function showOverlay(id){var e=$(id);if(!e)return;e.classList.add("on");overlayStack.push(id);try{history.pushState(null,"");}catch(err){}}
function hideOverlay(id){var e=$(id);if(!e)return;e.classList.remove("on");var i=overlayStack.indexOf(id);if(i>=0)overlayStack.splice(i,1);}
window.addEventListener("popstate",function(){var id=overlayStack[overlayStack.length-1];if(id){var e=$(id);if(e)e.classList.remove("on");overlayStack.pop();}});

function closeModal(){hideOverlay("modal-overlay");var b=$("m-body");if(b)b.innerHTML="";var f=$("m-foot");if(f)f.innerHTML="";ST.editing=null;ST.subBackFn=null;}
function closeOrBack(){if(ST.subBackFn){var f=ST.subBackFn;ST.subBackFn=null;f();}else closeModal();}

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

function showConfirm(title,msg,onYes,yesLabel){
  var t=$("confirm-title");if(t)t.textContent=title;
  var b=$("confirm-body");if(b)b.innerHTML='<p style="font-size:14px;line-height:1.6;">'+esc(msg)+'</p>';
  var f=$("confirm-foot");if(!f)return;f.innerHTML="";
  var noBtn=el("button","","Annuler");noBtn.addEventListener("click",function(){hideOverlay("confirm-overlay");});
  var yesBtn=el("button","primary",yesLabel||"Confirmer");yesBtn.addEventListener("click",function(){hideOverlay("confirm-overlay");if(onYes)onYes();});
  f.appendChild(noBtn);f.appendChild(yesBtn);
  showOverlay("confirm-overlay");
}

async function refreshAll(){ST.entries=await dbAll();renderCollection();renderJournal();scheduleGitHubBackup();}

function neonClass(e){if(e.aVoir)return "n-voir";if(e.enCours)return "n-enc";return "n-fini";}
function statIcon(e){if(e.aVoir)return ic("eye");if(e.enCours)return ic("hourglass");return ic("check");}
function fmtWhen(v){if(!v)return nowStamp();var p=v.split("T");var d=p[0].split("-");var t=(p[1]||"00:00").split(":");return d[2]+"/"+d[1]+" à "+t[0]+"h"+t[1];}
function toInputDate(s){var p=parseDateFR(s);return p?(p.y+"-"+pad2(p.mo)+"-"+pad2(p.d)):"";}

function openPosterZoom(url){if(!url)return;var img=$("poster-img");if(img)img.src=url;showOverlay("poster-overlay");}

function renderPoster(e,withMenu){
  var p=el("div","poster "+neonClass(e));
  var img=el("img","art");img.src=e.posterThumb||e.posterUrl||NO_POSTER;img.alt="";img.loading="lazy";
  img.addEventListener("click",function(ev){ev.stopPropagation();openPosterZoom(img.src);});
  p.appendChild(img);
  if(e.note!=null)p.appendChild(el("div","pnote",e.note+"/10"));
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
    ["trash","Supprimer",function(){closeMenu();showConfirm("Supprimer "+e.titre+" ?",function(){dbDelete(e.id).then(function(){toast("Supprimé");refreshAll();});});}]
  ];
  items.forEach(function(it){
    var m=el("div","mitem");
    m.innerHTML='<span class="ic">'+ic(it[0])+'</span><span>'+it[1]+'</span>';
    m.addEventListener("click",it[2]);
    b.appendChild(m);
  });
  showOverlay("menu-overlay");
}
function closeMenu(){hideOverlay("menu-overlay");}

function collectionCard(e){
  var cell=el("div","grid-cell");
  cell.appendChild(renderPoster(e));
  cell.appendChild(el("div","title",esc(e.titre)));
  var meta=(e.support||"")+(e.packaging?" · "+e.packaging:"");
  if(meta)cell.appendChild(el("div","meta",esc(meta)));
  cell.addEventListener("click",function(ev){if(ev.target.closest("button"))return;showCollectionDetail(e);});
  return cell;
}

function showCollectionDetail(e){
  var body=el("div");
  var head=el("div");head.style.cssText="display:flex;gap:16px;margin-bottom:20px;";
  var posterWrap=el("div");posterWrap.style.cssText="width:100px;flex-shrink:0;cursor:pointer;";
  var pImg=el("img");pImg.src=e.posterThumb||e.posterUrl||NO_POSTER;pImg.style.cssText="width:100%;border-radius:12px;";
  pImg.addEventListener("click",function(){openPosterZoom(pImg.src);});
  posterWrap.appendChild(pImg);
  head.appendChild(posterWrap);
  var info=el("div");info.style.cssText="flex:1;min-width:0;";
  info.appendChild(el("h2","",esc(e.titre)));info.querySelector("h2").style.cssText="font-family:var(--ft);font-size:20px;margin-bottom:8px;";
  var tags=el("div");tags.style.cssText="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;";
  var noteTag=el("span","tag note",(e.note!=null?e.note+"/10":"—/10"));noteTag.style.cssText="background:linear-gradient(135deg,var(--acc),var(--acc2));color:#fff;padding:3px 10px;border-radius:12px;font-family:var(--fm);font-size:11px;font-weight:600;cursor:pointer;";
  noteTag.addEventListener("click",function(){openNoteEditor(e);});
  tags.appendChild(noteTag);
  var typeTag=el("span","tag",esc(e.type));typeTag.style.cssText="background:var(--s1);border:1px solid var(--bd);padding:3px 10px;border-radius:12px;font-family:var(--fm);font-size:11px;";tags.appendChild(typeTag);
  if(e.support){var sTag=el("span","tag",esc(e.support));sTag.style.cssText="background:var(--s1);border:1px solid var(--bd);padding:3px 10px;border-radius:12px;font-family:var(--fm);font-size:11px;";tags.appendChild(sTag);}
  info.appendChild(tags);
  head.appendChild(info);body.appendChild(head);

  var details=el("div");details.style.cssText="margin-bottom:20px;";
  if(e.ean){var r=el("div","sline");r.innerHTML='<span style="color:var(--dim);">EAN</span><b>'+esc(e.ean)+'</b>';r.querySelector("b").addEventListener("click",function(){navigator.clipboard.writeText(e.ean);toast("EAN copié");});details.appendChild(r);}
  if(e.url){var r=el("div","sline");r.innerHTML='<span style="color:var(--dim);">URL</span><b style="color:var(--acc);">Ouvrir</b>';r.querySelector("b").addEventListener("click",function(){window.open(e.url,"_blank");});details.appendChild(r);}
  if(e.plateforme){var r=el("div","sline");r.innerHTML='<span style="color:var(--dim);">Plateforme</span><b>'+esc(e.plateforme)+'</b>';details.appendChild(r);}
  if(e.support){var r=el("div","sline");r.innerHTML='<span style="color:var(--dim);">Support</span><b>'+esc(e.support)+'</b>';details.appendChild(r);}
  if(e.packaging){var r=el("div","sline");r.innerHTML='<span style="color:var(--dim);">Packaging</span><b>'+esc(e.packaging)+'</b>';details.appendChild(r);}
  if(e.edition){var r=el("div","sline");r.innerHTML='<span style="color:var(--dim);">Édition</span><b>'+esc(e.edition)+'</b>';details.appendChild(r);}
  body.appendChild(details);

  var jBtn=el("button","wide");jBtn.innerHTML='<span class="ic">'+ic("book-open")+'</span>Voir le journal';jBtn.style.cssText="margin-bottom:16px;";
  jBtn.addEventListener("click",function(){closeModal();openJournalForEntry(e);});
  body.appendChild(jBtn);

  setModal(e.titre,body,[["Modifier","primary",function(){renderPanel(e);}],["Supprimer","",function(){showConfirm("Supprimer "+e.titre+" ?",function(){dbDelete(e.id).then(function(){toast("Supprimé");closeModal();refreshAll();});});}]]);
}

function openJournalForEntry(e){
  var body=el("div");
  var jl=e.journal||(e.comment?[{kind:"free",text:e.comment}]:[]);
  if(!jl.length){body.appendChild(emptyBox("book-open","Aucune entrée."));}
  else{
    jl.forEach(function(x){
      var tag=x.kind==="time"?x.ts:(x.kind==="ep"?("S"+pad2(x.s)+"E"+pad2(x.e)+(x.note!=null?" · "+x.note+"/10":"")):"libre");
      var row=el("div");row.style.cssText="padding:12px 0;border-bottom:1px solid var(--bd);";
      row.innerHTML='<div style="font-size:11px;color:var(--dim);font-family:var(--fm);margin-bottom:4px;">'+esc(tag)+'</div><div style="font-size:14px;">'+esc(x.text||"")+'</div>';
      body.appendChild(row);
    });
  }
  var addBtn=el("button","wide");addBtn.innerHTML='<span class="ic">'+ic("plus")+'</span>Ajouter une entrée';addBtn.style.cssText="margin-top:16px;";
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
      var b=el("button","note-btn"+(e.note===n?" on":""),String(n));
      b.addEventListener("click",function(){e.note=n;dbPut(e).then(function(){toast("Note : "+n+"/10");closeOrBack();refreshAll();});});
      ng.appendChild(b);
    })(n);
  }
  body.appendChild(ng);
  var clearBtn=el("button","wide");clearBtn.textContent="Retirer la note";
  clearBtn.addEventListener("click",function(){e.note=null;dbPut(e).then(function(){toast("Note retirée");closeOrBack();refreshAll();});});
  body.appendChild(clearBtn);
  setModal("Note",body,[["Fermer","",closeOrBack]]);
}

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
  var seg=el("div","seg");seg.style.cssText="display:inline-flex;background:var(--s1);border:1px solid var(--bd);border-radius:20px;padding:3px;margin-bottom:20px;";
  ["simple","avance"].forEach(function(m){
    var b=el("button",mode===m?"on":"",m==="simple"?"Simple":"Avancé");b.style.cssText="min-height:32px;padding:5px 15px;border:none;background:transparent;border-radius:16px;font-size:12px;font-weight:600;color:"+(mode===m?"#fff":"var(--dim)");if(mode===m)b.style.background="var(--acc)";
    b.addEventListener("click",function(){s.panelMode=m;settingsSave(s);rerenderPanel();});
    seg.appendChild(b);
  });
  body.appendChild(seg);

  function field(label,node){var w=el("div");w.style.marginBottom="20px";w.appendChild(el("label","",label));w.appendChild(node);body.appendChild(w);return node;}
  var tIn=field("Titre",el("input"));tIn.id="p-title";tIn.value=ST.draft.titre;
  
  var tw=el("div");tw.style.marginBottom="20px";tw.appendChild(el("label","","Type"));
  var tch=el("div","chips small");tch.style.marginBottom="0";
  allTypesWithIcons().forEach(function(t){
    var c=el("div","chip"+(t.name===ST.panelType?" on":""),'<span class="ic">'+ic(t.icon||"tag")+"</span>"+esc(t.name));
    c.addEventListener("click",function(){ST.panelType=t.name;rerenderPanel();});
    tch.appendChild(c);
  });
  tw.appendChild(tch);body.appendChild(tw);

  var nw=el("div");nw.style.marginBottom="20px";nw.appendChild(el("label","","Note"));
  var nch=el("div","note-grid");
  for(var n=1;n<=10;n++){
    (function(n){
      var c=el("button","note-btn"+(ST.currentNote===n?" on":""),String(n));
      c.addEventListener("click",function(){if(ST.currentNote===n){ST.currentNote=null;nch.querySelectorAll(".note-btn").forEach(function(x){x.className="note-btn";});}else{ST.currentNote=n;nch.querySelectorAll(".note-btn").forEach(function(x){x.className="note-btn";});c.className="note-btn on";}});
      nch.appendChild(c);
    })(n);
  }
  nw.appendChild(nch);body.appendChild(nw);

  var sw=el("div","chips small");sw.style.marginBottom="20px";
  function sc(get,set,label,icn){
    var c=el("div","chip"+(get()?" on":""),'<span class="ic">'+ic(icn)+"</span>"+label);
    c.addEventListener("click",function(){set(!get());c.classList.toggle("on",get());});
    sw.appendChild(c);
  }
  sc(function(){return ST.isInCollection;},function(v){ST.isInCollection=v;},"Collection","box");
  sc(function(){return ST.isEnc;},function(v){ST.isEnc=v;},"En cours","hourglass");
  sc(function(){return ST.isVoir;},function(v){ST.isVoir=v;},"À voir","eye");
  body.appendChild(sw);

  var dIn=field("Date",el("input"));dIn.id="p-date";dIn.type="date";dIn.value=ST.draft.date;
  var cIn=field("Commentaire",el("textarea"));cIn.id="p-comment";cIn.value=ST.draft.comment;
  
  var aw=el("div");aw.style.marginBottom="20px";aw.appendChild(el("label","","Affiche"));
  var ar=el("div");ar.style.display="flex";ar.style.gap="8px";ar.style.alignItems="center";
  var prev=el("img");prev.id="p-prev";prev.src=ST.panelPoster||NO_POSTER;prev.style.width="58px";prev.style.borderRadius="6px";prev.style.cursor="pointer";
  prev.addEventListener("click",function(){openPosterZoom(prev.src);});
  var bU=el("button","icon");bU.innerHTML=ic("link");
  var bI=el("button","icon");bI.innerHTML=ic("folder");
  var fI=el("input");fI.type="file";fI.accept="image/*";fI.hidden=true;
  bU.addEventListener("click",function(){ST.subBackFn=rerenderPanel;var body2=el("div");var inp=el("input");inp.placeholder="https://…";body2.appendChild(inp);setModal("URL image",body2,[["Valider","primary",function(){var v=inp.value.trim();if(v){ST.panelPoster=v;makeThumb(v).then(function(t){ST.panelThumb=t;});rerenderPanel();}}],["Annuler","",closeOrBack]]);});
  bI.addEventListener("click",function(){fI.click();});
  fI.addEventListener("change",function(ev){var f=ev.target.files[0];if(f)fileToResized(f,500).then(function(u){ST.panelPoster=u;makeThumb(u).then(function(t){ST.panelThumb=t;});prev.src=u;});});
  ar.appendChild(prev);ar.appendChild(bU);ar.appendChild(bI);ar.appendChild(fI);aw.appendChild(ar);body.appendChild(aw);

  if(mode==="avance"){
    var sIn=field("Détail",el("input"));sIn.id="p-sub";sIn.value=ST.draft.sub;
    var jw=el("div");jw.style.marginBottom="20px";jw.appendChild(el("label","","Journal"));
    var jb=el("div","chips small");jb.style.marginBottom="8px";
    [["time","Horodaté","clock"],["free","Libre","pen"],["ep","Saison/Épisode","tv"]].forEach(function(k){
      var c=el("div","chip",'<span class="ic">'+ic(k[2])+"</span>"+k[1]);
      c.addEventListener("click",function(){openDraft(k[0],jw);});
      jb.appendChild(c);
    });
    jw.appendChild(jb);
    var jlist=el("div");jlist.id="p-jlist";jw.appendChild(jlist);body.appendChild(jw);renderJList(jlist);

    function advBtn(iconn,label,getVal,fn){
      var val=getVal();
      var b=el("button","adv-btn"+(val?" on":""));
      b.innerHTML='<span class="ic">'+ic(iconn)+'</span><span>'+label+'</span><span class="adv-val">'+esc(val)+'</span>';
      b.addEventListener("click",fn);
      return b;
    }
    var collGrid=el("div","adv-grid");
    collGrid.appendChild(advBtn("box","Collection",function(){return ST.isInCollection?"Oui":"";},function(){ST.isInCollection=!ST.isInCollection;rerenderPanel();}));
    collGrid.appendChild(advBtn("monitor","Plateforme",function(){return ST.advFields.plateforme;},function(){ST.subBackFn=rerenderPanel;openPlateformeModal();}));
    collGrid.appendChild(advBtn("calendar","Date achat",function(){return ST.advFields.dateAchat;},function(){ST.subBackFn=rerenderPanel;openDateAchatModal();}));
    collGrid.appendChild(advBtn("hash","Édition",function(){return ST.advFields.edition;},function(){ST.subBackFn=rerenderPanel;openEditionModal();}));
    collGrid.appendChild(advBtn("gift","Bonus",function(){return ST.advFields.bonus.join(", ");},function(){ST.subBackFn=rerenderPanel;openBonusModal();}));
    collGrid.appendChild(advBtn("box","Support",function(){return ST.advFields.support;},function(){ST.subBackFn=rerenderPanel;openSupportModal();}));
    collGrid.appendChild(advBtn("package-open","Packaging",function(){return ST.advFields.packaging;},function(){ST.subBackFn=rerenderPanel;openPackagingModal();}));
    collGrid.appendChild(advBtn("barcode","EAN",function(){return ST.advFields.ean;},function(){ST.subBackFn=rerenderPanel;openEANModal();}));
    collGrid.appendChild(advBtn("link","URL",function(){return ST.advFields.url;},function(){ST.subBackFn=rerenderPanel;openURLModal();}));
    body.appendChild(collGrid);

    var searchLinks=el("div","search-links");
    searchLinks.appendChild(el("span","","Rechercher :"));searchLinks.querySelector("span").style.cssText="font-size:12px;font-weight:700;color:var(--dim);margin-right:4px;";
    var links=[{name:"Google",icon:"search",url:"https://www.google.com/search?q="+encodeURIComponent(ST.draft.titre||"")},{name:"Steam",icon:"gamepad-2",url:"https://store.steampowered.com/search/?term="+encodeURIComponent(ST.draft.titre||"")},{name:"TMDB",icon:"film",url:"https://www.themoviedb.org/search?query="+encodeURIComponent(ST.draft.titre||"")},{name:"SC",icon:"heart",url:"https://www.senscritique.com/recherche?query="+encodeURIComponent(ST.draft.titre||"")}];
    links.forEach(function(l){var a=el("a","search-link");a.href=l.url;a.target="_blank";a.innerHTML='<span class="ic">'+ic(l.icon)+'</span>'+l.name;searchLinks.appendChild(a);});
    body.appendChild(searchLinks);
  }
  setModal(entry?"Modifier":"Nouvelle œuvre",body,[["Enregistrer","primary",saveCurrentEntry],["Annuler","",closeModal]]);
}

function markCollection(){ST.isInCollection=true;}
function openPlateformeModal(){var body=el("div");PLATFORMS.forEach(function(p){var btn=el("button","wide");btn.innerHTML='<span class="ic">'+ic(p.icon)+'</span><span>'+p.name+'</span>';btn.style.justifyContent="flex-start";if(ST.advFields.plateforme===p.name)btn.classList.add("primary");btn.addEventListener("click",function(){ST.advFields.plateforme=p.name;markCollection();rerenderPanel();});body.appendChild(btn);});setModal("Plateforme",body,[["Annuler","",closeOrBack]]);}
function openDateAchatModal(){var body=el("div");var inp=el("input");inp.type="date";inp.value=ST.advFields.dateAchat||todayFR();body.appendChild(inp);setModal("Date d'achat",body,[["Valider","primary",function(){ST.advFields.dateAchat=inp.value;markCollection();rerenderPanel();}],["Annuler","",closeOrBack]]);}
function openEditionModal(){var body=el("div");var inp=el("input");inp.placeholder="Édition limitée…";inp.value=ST.advFields.edition||"";body.appendChild(inp);setModal("Édition",body,[["Valider","primary",function(){ST.advFields.edition=inp.value.trim();if(ST.advFields.edition)markCollection();rerenderPanel();}],["Annuler","",closeOrBack]]);}
function openBonusModal(){var body=el("div");BONUSES.forEach(function(b){var btn=el("button","wide");btn.innerHTML='<span class="ic">'+ic(b.icon)+'</span><span>'+b.name+'</span>';btn.style.justifyContent="flex-start";if(ST.advFields.bonus.indexOf(b.name)>=0)btn.classList.add("primary");btn.addEventListener("click",function(){var i=ST.advFields.bonus.indexOf(b.name);if(i>=0)ST.advFields.bonus.splice(i,1);else ST.advFields.bonus.push(b.name);btn.classList.toggle("primary",ST.advFields.bonus.indexOf(b.name)>=0);});body.appendChild(btn);});setModal("Bonus",body,[["Valider","primary",function(){if(ST.advFields.bonus.length)markCollection();rerenderPanel();}],["Annuler","",closeOrBack]]);}
function openSupportModal(){var body=el("div");var free=el("button","wide");free.innerHTML='<span class="ic">'+ic("pen")+'</span><span style="font-style:italic;">...</span>';free.style.justifyContent="flex-start";free.addEventListener("click",function(){ST.subBackFn=openSupportModal;var body2=el("div");var inp=el("input");inp.placeholder="Ta valeur…";body2.appendChild(inp);setModal("Support libre",body2,[["Valider","primary",function(){var v=inp.value.trim();if(v){ST.advFields.support=v;markCollection();rerenderPanel();}}],["Annuler","",closeOrBack]]);});body.appendChild(free);SUPPORT_CHOICES.forEach(function(s2){var btn=el("button","wide");btn.innerHTML='<span>'+s2+'</span>';btn.style.justifyContent="flex-start";if(ST.advFields.support===s2)btn.classList.add("primary");btn.addEventListener("click",function(){ST.advFields.support=s2;markCollection();rerenderPanel();});body.appendChild(btn);});setModal("Support",body,[["Annuler","",closeOrBack]]);}
function openPackagingModal(){var body=el("div");var free=el("button","wide");free.innerHTML='<span class="ic">'+ic("pen")+'</span><span style="font-style:italic;">...</span>';free.style.justifyContent="flex-start";free.addEventListener("click",function(){ST.subBackFn=openPackagingModal;var body2=el("div");var inp=el("input");inp.placeholder="Ta valeur…";body2.appendChild(inp);setModal("Packaging libre",body2,[["Valider","primary",function(){var v=inp.value.trim();if(v){ST.advFields.packaging=v;markCollection();rerenderPanel();}}],["Annuler","",closeOrBack]]);});body.appendChild(free);PACKAGING_CHOICES.forEach(function(p2){var btn=el("button","wide");btn.innerHTML='<span>'+p2+'</span>';btn.style.justifyContent="flex-start";if(ST.advFields.packaging===p2)btn.classList.add("primary");btn.addEventListener("click",function(){ST.advFields.packaging=p2;markCollection();rerenderPanel();});body.appendChild(btn);});setModal("Packaging",body,[["Annuler","",closeOrBack]]);}
function openEANModal(){var body=el("div");var inp=el("input");inp.placeholder="EAN";inp.inputMode="numeric";inp.value=ST.advFields.ean||"";body.appendChild(inp);var scanBtn=el("button","wide");scanBtn.innerHTML='<span class="ic">'+ic("camera")+'</span><span>Scanner</span>';scanBtn.addEventListener("click",function(){startEAN(function(code){ST.advFields.ean=code;markCollection();rerenderPanel();});});body.appendChild(scanBtn);setModal("EAN",body,[["Valider","primary",function(){ST.advFields.ean=inp.value.trim();if(ST.advFields.ean)markCollection();rerenderPanel();}],["Annuler","",closeOrBack]]);}
function openURLModal(){var body=el("div");var inp=el("input");inp.placeholder="URL de la fiche";inp.value=ST.advFields.url||"";body.appendChild(inp);setModal("URL",body,[["Valider","primary",function(){ST.advFields.url=inp.value.trim();if(ST.advFields.url)markCollection();rerenderPanel();}],["Annuler","",closeOrBack]]);}

function saveCurrentEntry(){
  capturePanel();
  var title=ST.draft.titre.trim();
  if(!title){toast("Titre obligatoire.");return;}
  if(ST.editing){finishSave(ST.editing,ST.editing.id,ST.editing.dateAjout);return;}
  var type=ST.panelType;
  var dup=null;for(var i=0;i<ST.entries.length;i++){if(ST.entries[i].type===type&&norm(ST.entries[i].titre)===norm(title)){dup=ST.entries[i];break;}}
  if(dup){showConfirm("Doublon détecté",dup.titre+" existe déjà. Modifier l'existant ?",function(){finishSave(dup,dup.id,dup.dateAjout);},"Modifier");}
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
  await dbPut(e);if(navigator.vibrate)navigator.vibrate(25);toast("Enregistré");closeModal();refreshAll();
}

function duplicateEntry(e){ST.selectedItem=null;ST.editing=null;closeModal();setTimeout(function(){renderPanel(null);ST.draftJournal=[];ST.draft.titre=e.titre;ST.panelType=e.type;},60);}

function openDraft(kind,parent){
  var old=$("p-jdraft");if(old)old.remove();
  var d=el("div","card");d.id="p-jdraft";d.style.cssText="background:var(--s1);border:1px solid var(--bd);border-radius:14px;padding:14px;margin-top:12px;";
  if(kind==="time"){var rw=el("div","row2");rw.innerHTML='<label>Date & heure<input type="datetime-local" id="jd-when"></label>';d.appendChild(rw);}
  if(kind==="ep"){var r=el("div","row2");r.innerHTML='<label>S<input type="number" id="jd-s" min="0"></label><label>E<input type="number" id="jd-e" min="0"></label><label>/10<input type="number" id="jd-note" min="1" max="10"></label>';d.appendChild(r);}
  var ta=el("textarea");ta.placeholder="Ton entrée…";d.appendChild(ta);
  var act=el("div","row2");act.style.marginTop="10px";
  var ok=el("button","primary");ok.innerHTML='<span class="ic">'+ic("plus")+"</span>Ajouter";
  var no=el("button");no.innerHTML='<span class="ic">'+ic("x")+"</span>Annuler";
  act.appendChild(ok);act.appendChild(no);d.appendChild(act);parent.appendChild(d);
  ok.addEventListener("click",function(){
    var text=ta.value.trim();if(!text&&kind!=="ep"){toast("Entre un texte.");return;}
    if(kind==="time"){var wv=$("jd-when");ST.draftJournal.push({kind:"time",ts:fmtWhen(wv?wv.value:""),text:text,at:Date.now()});}
    else if(kind==="free"){ST.draftJournal.push({kind:"free",text:text,at:Date.now()});}
    else{var nn=$("jd-note");var ss=$("jd-s");var ee=$("jd-e");ST.draftJournal.push({kind:"ep",s:parseInt(ss?ss.value||"0":"0",10),e:parseInt(ee?ee.value||"0":"0",10),note:nn&&nn.value?Math.max(1,Math.min(10,parseInt(nn.value,10))):null,text:text,at:Date.now()});}
    d.remove();renderJList($("p-jlist"));
  });
  no.addEventListener("click",function(){d.remove();});
}

function renderJList(c){if(!c)return;c.innerHTML="";ST.draftJournal.forEach(function(x,i){var tag=x.kind==="time"?x.ts:(x.kind==="ep"?("S"+pad2(x.s)+"E"+pad2(x.e)+(x.note!=null?" · "+x.note+"/10":"")):"libre");var row=el("div");row.style.cssText="display:flex;gap:10px;padding:12px 0;border-bottom:1px solid var(--bd);align-items:flex-start;";var b=el("div");b.style.cssText="flex:1;min-width:0;";b.appendChild(el("div","ftime",esc(tag)));b.querySelector(".ftime").style.cssText="font-size:11px;color:var(--dim);font-family:var(--fm);margin-bottom:4px;";b.appendChild(el("div","ftext",esc(x.text||"")));b.querySelector(".ftext").style.cssText="font-size:14px;";var del=el("button");del.innerHTML='<span class="ic">'+ic("trash-2")+'</span>';del.style.cssText="background:none;border:none;padding:6px;min-height:0;width:32px;height:32px;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;";del.addEventListener("click",function(){ST.draftJournal.splice(i,1);renderJList(c);});row.appendChild(b);row.appendChild(del);c.appendChild(row);});}

function quickNoteOpen(e,preText,kind,idx){
  ST.qnEntry=e;ST.qnEditIdx=(idx!=null?idx:null);ST.qnKind=kind||"time";
  var t=$("qn-title");if(t)t.textContent=(ST.qnEditIdx!=null?"Modifier : ":"Noter : ")+e.titre;
  var txt=$("qn-text");if(txt)txt.value=preText||"";
  var w=$("qn-when");if(w)w.value="";
  var wr=$("qn-when-row");if(wr)wr.classList.toggle("hidden",ST.qnKind!=="time");
  var er=$("qn-ep-row");if(er)er.classList.toggle("hidden",ST.qnKind!=="ep");
  var sb=$("qn-save");if(sb)sb.innerHTML=ST.qnEditIdx!=null?'<span class="ic">'+ic("save")+'</span>Remplacer':'<span class="ic">'+ic("plus")+'</span>Ajouter';
  var k=$("qn-kind");if(!k)return;k.innerHTML="";
  [["time","Horodaté","clock"],["free","Libre","pen"],["ep","Saison/Épisode","tv"]].forEach(function(x){
    var c=el("div","chip"+(x[0]===ST.qnKind?" on":""),'<span class="ic">'+ic(x[2])+"</span>"+x[1]);
    c.addEventListener("click",function(){ST.qnKind=x[0];k.querySelectorAll(".chip").forEach(function(y){y.classList.remove("on");});c.classList.add("on");var er2=$("qn-ep-row");if(er2)er2.classList.toggle("hidden",x[0]!=="ep");var wr2=$("qn-when-row");if(wr2)wr2.classList.toggle("hidden",x[0]!=="time");});
    k.appendChild(c);
  });
  showOverlay("qn-overlay");
}
function quickNoteClose(){hideOverlay("qn-overlay");ST.qnEditIdx=null;}
async function quickNoteSave(){
  var e=ST.qnEntry;if(!e)return;
  var txt=$("qn-text");var text=txt?txt.value.trim():"";
  if(!text&&ST.qnKind!=="ep"){toast("Entre un texte.");return;}
  if(!e.journal)e.journal=[];
  var obj;if(ST.qnKind==="time"){var w=$("qn-when");obj={kind:"time",ts:fmtWhen(w?w.value:""),text:text,at:Date.now()};}
  else if(ST.qnKind==="free"){obj={kind:"free",text:text,at:Date.now()};}
  else{var nn=$("qn-note");var ss=$("qn-s");var ee=$("qn-e");obj={kind:"ep",s:parseInt(ss?ss.value||"0":"0",10),e:parseInt(ee?ee.value||"0":"0",10),note:nn&&nn.value?Math.max(1,Math.min(10,parseInt(nn.value,10))):null,text:text,at:Date.now()};}
  if(ST.qnEditIdx!=null&&e.journal[ST.qnEditIdx]){obj.at=e.journal[ST.qnEditIdx].at||obj.at;e.journal[ST.qnEditIdx]=obj;}else{e.journal.push(obj);}
  await dbPut(e);if(navigator.vibrate)navigator.vibrate(15);toast(ST.qnEditIdx!=null?"Entrée modifiée":"Entrée ajoutée");quickNoteClose();refreshAll();
}

function renderJournal(){
  var y=ST.calDate.getFullYear(),mo=ST.calDate.getMonth();
  var names=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  var bd=$("bilan-date");if(bd)bd.textContent=new Date().getDate()+' '+names[new Date().getMonth()]+' '+new Date().getFullYear();
  var feed=[];
  ST.entries.forEach(function(en){
    (en.journal||[]).forEach(function(x,idx){
      var entryDate=parseDateFR(en.dateFin);
      if(entryDate&&entryDate.y===y&&entryDate.mo===mo+1){feed.push({e:en,x:x,idx:idx,at:x.at||0});}
    });
  });
  feed.sort(function(a,b){return b.at-a.at;});
  var f=$("j-feed");if(!f)return;f.innerHTML="";
  if(!feed.length)f.appendChild(emptyBox("book-open","Aucune entrée ce mois-ci."));
  feed.slice(0,60).forEach(function(it){
    var item=el("div","journal-entry");
    var posterDiv=el("div","poster");var pImg=el("img");pImg.src=it.e.posterThumb||it.e.posterUrl||NO_POSTER;posterDiv.appendChild(pImg);
    posterDiv.addEventListener("click",function(ev){ev.stopPropagation();openPosterZoom(pImg.src);});
    item.appendChild(posterDiv);
    var b=el("div","content");
    var tag=it.x.kind==="time"?it.x.ts:(it.x.kind==="ep"?("S"+pad2(it.x.s)+"E"+pad2(it.x.e)+(it.x.note!=null?" · "+it.x.note+"/10":"")):"libre");
    b.appendChild(el("div","time",esc(tag)));
    var textRow=el("div");textRow.style.display="flex";textRow.style.justifyContent="space-between";textRow.style.alignItems="flex-start";textRow.style.gap="8px";
    var textEl=el("div","text",esc(it.x.text));textEl.style.flex="1";
    textEl.addEventListener("click",function(ev){ev.stopPropagation();quickNoteOpen(it.e,it.x.text,it.x.kind,it.idx);});
    textRow.appendChild(textEl);
    var delBtn=el("button","delete");delBtn.innerHTML='<span class="ic">'+ic("trash-2")+'</span>';
    delBtn.addEventListener("click",function(ev){ev.stopPropagation();showConfirm("Supprimer cette entrée ?",function(){it.e.journal.splice(it.idx,1);dbPut(it.e).then(function(){toast("Entrée supprimée");refreshAll();});});});
    textRow.appendChild(delBtn);
    b.appendChild(textRow);
    b.appendChild(el("div","title",esc(it.e.titre)));
    item.appendChild(b);
    f.appendChild(item);
  });
}

function renderCalendar(){
  var cal=$("cal-grid");if(!cal)return;cal.innerHTML="";
  var y=ST.calDate.getFullYear(),mo=ST.calDate.getMonth();
  var names=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  var mt=$("cal-month-title");if(mt)mt.textContent=names[mo]+" "+y;
  var dayNames=["L","M","M","J","V","S","D"];
  dayNames.forEach(function(d){var el2=el("div","cal-day-name");el2.textContent=d;cal.appendChild(el2);});
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
      if(de.length){c.addEventListener("click",function(){cal.querySelectorAll(".cal-day").forEach(function(x){x.style.background="";});c.style.background="var(--acc)";c.style.color="#fff";});}
      cal.appendChild(c);
    })(d);
  }
}

function renderOptions(){
  var grid=$("opt-grid");if(!grid)return;grid.innerHTML="";
  var cats=[{icon:"sheet",label:"Sheet",fn:openOptSheet},{icon:"save",label:"Sauvegarde",fn:openOptSave},{icon:"palette",label:"Apparence",fn:openOptAppearance},{icon:"bar-chart-3",label:"Stats",fn:openOptStats},{icon:"tag",label:"Types",fn:openOptTypes},{icon:"search",label:"Recherche",fn:openOptSearch},{icon:"smartphone",label:"Application",fn:openOptApp},{icon:"info",label:"À propos",fn:openOptAbout},{icon:"alert",label:"Danger",fn:openOptDanger}];
  cats.forEach(function(cat){
    var btn=el("button","opt-btn");btn.innerHTML='<span class="ic">'+ic(cat.icon)+'</span><span>'+cat.label+'</span>';btn.addEventListener("click",cat.fn);grid.appendChild(btn);
  });
}
function openOptSheet(){var body=el("div");var uIn=el("input");uIn.placeholder="URL du webhook";uIn.value=localStorage.getItem("sheet_url")||"";body.appendChild(el("label","","URL webhook"));body.appendChild(uIn);var saveBtn=el("button","primary");saveBtn.innerHTML='<span class="ic">'+ic("save")+"</span>Sauver";saveBtn.addEventListener("click",function(){localStorage.setItem("sheet_url",uIn.value.trim());toast("URL enregistrée");});body.appendChild(saveBtn);setModal("Google Sheet",body,[["Fermer","",closeModal]]);}
function openOptSave(){
  var body=el("div");
  body.appendChild(el("div","sec-title","Sauvegarde locale"));
  var expBtn=el("button");expBtn.innerHTML='<span class="ic">'+ic("download")+"</span>Export JSON";expBtn.addEventListener("click",function(){exportJSON();});body.appendChild(expBtn);
  var impBtn=el("button");impBtn.innerHTML='<span class="ic">'+ic("upload")+"</span>Import (fusion)";impBtn.addEventListener("click",function(){importJSON();});body.appendChild(impBtn);
  body.appendChild(el("div","sec-title","Backup GitHub (repo privé)"));
  var goIn=el("input");goIn.placeholder="Owner (ex : BoraGooum)";goIn.value=localStorage.getItem("gh_owner")||"";goIn.style.marginBottom="8px";body.appendChild(goIn);
  var grIn=el("input");grIn.placeholder="Repo (ex : collection-backup)";grIn.value=localStorage.getItem("gh_repo")||"";grIn.style.marginBottom="8px";body.appendChild(grIn);
  var gtIn=el("input");gtIn.placeholder="Token (github_pat_…)";gtIn.type="password";gtIn.value=localStorage.getItem("gh_token")||"";gtIn.style.marginBottom="12px";body.appendChild(gtIn);
  var gsave=el("button","primary");gsave.innerHTML='<span class="ic">'+ic("save")+"</span>Sauver la config";gsave.addEventListener("click",function(){localStorage.setItem("gh_owner",goIn.value.trim());localStorage.setItem("gh_repo",grIn.value.trim());localStorage.setItem("gh_token",gtIn.value.trim());toast("Config GitHub sauvée");});body.appendChild(gsave);
  var gtest=el("button");gtest.innerHTML='<span class="ic">'+ic("link")+"</span>Tester la connexion";gtest.addEventListener("click",function(){ghTest();});body.appendChild(gtest);
  var gnow=el("button");gnow.innerHTML='<span class="ic">'+ic("upload")+"</span>Sauvegarder maintenant";gnow.addEventListener("click",function(){ghBackupNow(true);});body.appendChild(gnow);
  var gres=el("button");gres.innerHTML='<span class="ic">'+ic("download")+"</span>Restaurer depuis GitHub";gres.addEventListener("click",function(){showConfirm("Restaurer ?",function(){ghRestore();},"Restaurer");});body.appendChild(gres);
  var lb2=localStorage.getItem("last_gh_backup");body.appendChild(el("div","","Dernier backup GitHub : <b>"+(lb2?new Date(parseInt(lb2,10)).toLocaleString("fr-FR"):"jamais")+"</b>"));
  setModal("Sauvegarde",body,[["Fermer","",closeModal]]);
}
function openOptAppearance(){var s=settingsLoad();var body=el("div");body.appendChild(el("label","","Densité"));var dPill=el("div","pill-sel");[["comfort","Confort"],["compact","Compact"]].forEach(function(o){var b=el("button",o[0]===s.density?"on":"",o[1]);b.addEventListener("click",function(){s.density=o[0];settingsSave(s);applySettings();openOptAppearance();});dPill.appendChild(b);});body.appendChild(dPill);body.appendChild(el("label","","Taille texte"));var fPill=el("div","pill-sel");[["s","S"],["m","M"],["l","L"]].forEach(function(o){var b=el("button",o[0]===s.fontSize?"on":"",o[1]);b.addEventListener("click",function(){s.fontSize=o[0];settingsSave(s);applySettings();openOptAppearance();});fPill.appendChild(b);});body.appendChild(fPill);setModal("Apparence",body,[["Fermer","",closeModal]]);}
function openOptStats(){var body=el("div");body.appendChild(el("div","empty","Stats à venir."));setModal("Statistiques",body,[["Fermer","",closeModal]]);}
function openOptTypes(){var body=el("div");var ct=loadCustomTypes();if(ct.length){ct.forEach(function(t,i){var row=el("div");row.style.cssText="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--bd);";row.appendChild(el("span","",esc(t.name)));var delBtn=el("button","icon");delBtn.innerHTML=ic("trash");delBtn.addEventListener("click",function(){ct.splice(i,1);saveCustomTypes(ct);closeModal();openOptTypes();buildTypeDropdown();});row.appendChild(delBtn);body.appendChild(row);});}else{body.appendChild(el("div","empty","Aucun type personnalisé."));}var nt=el("input");nt.placeholder="Nouveau type…";body.appendChild(nt);var addBtn=el("button","primary");addBtn.innerHTML='<span class="ic">'+ic("plus")+"</span>Ajouter";addBtn.addEventListener("click",function(){var v=nt.value.trim();if(!v)return;if(allTypes().indexOf(v)>=0){toast("Existe déjà.");return;}ct.push({name:v});saveCustomTypes(ct);closeModal();openOptTypes();buildTypeDropdown();});body.appendChild(addBtn);setModal("Types",body,[["Fermer","",closeModal]]);}
function openOptSearch(){var s=settingsLoad();var body=el("div");body.appendChild(el("label","","Type par défaut"));var tPill=el("div","pill-sel");tPill.style.cssText="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;";allTypes().forEach(function(t){var b=el("button","chip"+(t===s.defaultType?" on":""),t);b.addEventListener("click",function(){s.defaultType=t;settingsSave(s);ST.currentType=t;closeModal();openOptSearch();buildTypeDropdown();});tPill.appendChild(b);});body.appendChild(tPill);setModal("Recherche",body,[["Fermer","",closeModal]]);}
function openOptApp(){var body=el("div");var instBtn=el("button");instBtn.innerHTML='<span class="ic">'+ic("download")+"</span>Installer l'appli";instBtn.addEventListener("click",function(){triggerInstall();});body.appendChild(instBtn);var cacheBtn=el("button");cacheBtn.innerHTML='<span class="ic">'+ic("trash")+"</span>Vider cache offline";cacheBtn.addEventListener("click",function(){if("caches"in window)caches.keys().then(function(k){k.forEach(function(x){caches.delete(x);});});toast("Cache vidé");});body.appendChild(cacheBtn);body.appendChild(el("div","","Réseau : <b>"+(navigator.onLine?"connecté":"hors-ligne")+"</b>"));setModal("Application",body,[["Fermer","",closeModal]]);}
function openOptAbout(){var body=el("div");body.appendChild(el("div","","Version : <b>V10.0</b>"));body.appendChild(el("div","","Build : <b>"+new Date(BUILD).toLocaleString("fr-FR",{timeZone:"Europe/Paris"})+"</b>"));var cred=el("a","","Créé par Gooumbora");cred.href="https://www.senscritique.com/Gooumbora";cred.target="_blank";cred.style.color="var(--acc)";body.appendChild(cred);setModal("À propos",body,[["Fermer","",closeModal]]);}
function openOptDanger(){var body=el("div");var clearBtn=el("button");clearBtn.innerHTML='<span class="ic">'+ic("trash")+"</span>Vider la collection";clearBtn.addEventListener("click",function(){showConfirm("Effacer TOUTES tes œuvres ?",function(){(async function(){for(var i=0;i<ST.entries.length;i++)await dbDelete(ST.entries[i].id);refreshAll();toast("Vidé");})();},"Vider");});body.appendChild(clearBtn);var resetBtn=el("button");resetBtn.innerHTML='<span class="ic">'+ic("rotate-ccw")+"</span>Réinitialiser réglages";resetBtn.addEventListener("click",function(){showConfirm("Remettre les réglages par défaut ?",function(){localStorage.removeItem("settings");settingsSave(Object.assign({},SETTINGS_DEFAULTS));applySettings();toast("Réglages réinitialisés");},"Réinitialiser");});body.appendChild(resetBtn);setModal("Danger",body,[["Fermer","",closeModal]]);}

// GitHub Backup
function ghConfig(){return{owner:(localStorage.getItem("gh_owner")||"").trim(),repo:(localStorage.getItem("gh_repo")||"").trim(),token:(localStorage.getItem("gh_token")||"").trim()};}
function ghB64encode(s){return btoa(unescape(encodeURIComponent(s)));}
function ghB64decode(s){return decodeURIComponent(escape(atob(s)));}
async function ghGetFile(c,path){var r=await fetch("https://api.github.com/repos/"+c.owner+"/"+c.repo+"/contents/"+path,{headers:{Authorization:"Bearer "+c.token,Accept:"application/vnd.github+json"}});if(r.status===404)return null;if(!r.ok)throw new Error("GET "+r.status);return await r.json();}
async function ghPutFile(c,path,content){var cur=await ghGetFile(c,path);var body={message:"Backup auto "+new Date().toISOString(),content:ghB64encode(content)};if(cur&&cur.sha)body.sha=cur.sha;var r=await fetch("https://api.github.com/repos/"+c.owner+"/"+c.repo+"/contents/"+path,{method:"PUT",headers:{Authorization:"Bearer "+c.token,Accept:"application/vnd.github+json","Content-Type":"application/json"},body:JSON.stringify(body)});if(!r.ok)throw new Error("PUT "+r.status);return await r.json();}
var ghTimer=null;
function scheduleGitHubBackup(){var c=ghConfig();if(!c.owner||!c.repo||!c.token)return;if(ghTimer)clearTimeout(ghTimer);ghTimer=setTimeout(function(){ghBackupNow(false);},5000);}
async function ghBackupNow(manual){var c=ghConfig();if(!c.owner||!c.repo||!c.token){if(manual)toast("Configure GitHub dans Option.");return;}var data={version:"V10",exportDate:new Date().toISOString(),settings:settingsLoad(),customTypes:loadCustomTypes(),sheetUrl:localStorage.getItem("sheet_url")||"",entries:ST.entries};try{await ghPutFile(c,"sauvegarde.json",JSON.stringify(data));localStorage.setItem("last_gh_backup",String(Date.now()));if(manual)toast("Sauvegarde GitHub OK");}catch(e){if(manual)toast("Erreur GitHub : "+e.message,3000);}}
async function ghTest(){var c=ghConfig();if(!c.owner||!c.repo||!c.token){toast("Remplis owner, repo et token.");return;}try{var r=await fetch("https://api.github.com/repos/"+c.owner+"/"+c.repo,{headers:{Authorization:"Bearer "+c.token,Accept:"application/vnd.github+json"}});if(r.ok){var d=await r.json();toast("Connexion OK : "+d.full_name+(d.private?" (privé)":" (PUBLIC !)"));}else toast("Erreur "+r.status,3000);}catch(e){toast("Réseau impossible",3000);}}
async function ghRestore(){var c=ghConfig();if(!c.owner||!c.repo||!c.token){toast("Configure GitHub dans Option.");return;}try{var f=await ghGetFile(c,"sauvegarde.json");if(!f){toast("Aucune sauvegarde trouvée.",3000);return;}var data=JSON.parse(ghB64decode(f.content));var list=data.entries||[];var ids={};ST.entries.forEach(function(x){ids[x.id]=1;});var added=0;for(var i=0;i<list.length;i++){var en=list[i];if(en&&en.id&&!ids[en.id]){if(!en.titre)en.titre="Sans titre";if(!en.dateAjout)en.dateAjout=new Date().toISOString();await dbPut(en);added++;}}if(data.settings)settingsSave(Object.assign({},SETTINGS_DEFAULTS,data.settings));if(data.customTypes)saveCustomTypes(data.customTypes);applySettings();buildTypeDropdown();refreshAll();toast("Restauré : "+added+" œuvre(s) ajoutée(s)");}catch(e){toast("Restauration impossible : "+e.message,3000);}}