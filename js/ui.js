var ST={entries:[],view:"search",colQuery:"",colSort:"date-desc",colSupport:"all",calDate:new Date(),calOpen:false,editing:null,selectedItem:null,currentType:"Film",panelType:"Film",currentNote:null,isFav:false,isEnc:false,isVoir:false,draftJournal:[],panelPoster:"",panelThumb:"",qnEntry:null,qnKind:"time",qnEditIdx:null,recent:[],menuEntry:null,fluxFilter:{types:[],status:[],noteRange:null,ownedOnly:false,search:"",sort:"date-desc"},currentReaderEntry:null,currentReaderJournalIdx:null,isInCollection:false,advFields:{plateforme:"",dateAchat:"",edition:"",bonus:[],support:"",packaging:"",ean:"",url:""},draft:{titre:"",date:"",comment:"",sub:""},subBackFn:null};
var overlayStack=[];
var FOOT_IC={"Modifier":"edit","Noter":"plus","Fermer":"x","Enregistrer":"save","Annuler":"x","Ajouter":"plus","Copier":"clipboard-copy","Supprimer":"trash-2","Valider":"save","Remplacer":"save","Vider":"trash","R\u00e9initialiser":"x"};
var SUPPORT_CHOICES=["Physique","D\u00e9mat\u00e9rialis\u00e9"];
var PACKAGING_CHOICES=["Boite","Amaray","Fourreau","Steelbook","Coffret","Collector","Mediabook","Digipack","Limit\u00e9e"];
function el(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d;}
function $(id){return document.getElementById(id);}
function emptyBox(icn,txt){var d=el("div","empty");d.innerHTML='<span class="ic">'+ic(icn)+"</span>"+esc(txt);return d;}
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
function showConfirm(title,msg,onYes,onNo,yesLabel){
  var t=$("confirm-title");if(t)t.textContent=title;
  var b=$("confirm-body");if(b)b.innerHTML='<p style="font-size:14px;line-height:1.6;">'+esc(msg)+'</p>';
  var f=$("confirm-foot");if(!f)return;f.innerHTML="";
  var noBtn=el("button","","Annuler");noBtn.addEventListener("click",function(){hideOverlay("confirm-overlay");if(onNo)onNo();});
  var yesBtn=el("button","primary",yesLabel||"Supprimer");yesBtn.addEventListener("click",function(){hideOverlay("confirm-overlay");if(onYes)onYes();});
  f.appendChild(noBtn);f.appendChild(yesBtn);
  showOverlay("confirm-overlay");
}
async function refreshAll(){ST.entries=await dbAll();renderCollection();renderJournal();scheduleGitHubBackup();}
function neonClass(e){if(e.aVoir)return "n-voir";if(e.enCours)return "n-enc";return "n-fini";}
function statIcon(e){if(e.aVoir)return ic("eye");if(e.enCours)return ic("hourglass");return ic("check");}
function fmtWhen(v){
  if(!v)return nowStamp();
  var p=v.split("T");
  var d=p[0].split("-");
  var t=(p[1]||"00:00").split(":");
  return d[2]+"/"+d[1]+" \u00e0 "+t[0]+"h"+t[1];
}
function toInputDate(s){var p=parseDateFR(s);return p?(p.y+"-"+pad2(p.mo)+"-"+pad2(p.d)):"";}
function renderPoster(e,withMenu){
  var p=el("div","poster "+neonClass(e));
  var img=el("img","art");img.src=e.posterThumb||e.posterUrl||NO_POSTER;img.alt="";img.loading="lazy";
  p.appendChild(img);
  if(e.note!=null)p.appendChild(el("div","pnote",e.note+"/10"));
  var st=el("div","pstat");st.innerHTML=statIcon(e);p.appendChild(st);
  if(e.sousTitre){var prog=el("div","pprog",esc(e.sousTitre));p.appendChild(prog);}
  if(withMenu!==false){var mb=el("button","pmenu");mb.innerHTML=ic("more");mb.addEventListener("click",function(ev){ev.stopPropagation();openMenu(e);});p.appendChild(mb);}
  return p;
}
function openMenu(e){
  ST.menuEntry=e;
  var t=$("menu-title");if(t)t.textContent=e.titre;
  var b=$("menu-body");if(!b)return;b.innerHTML="";
  var items=[];
  items.push(["edit","Modifier",function(){closeMenu();renderPanel(e);}]);
  items.push(["plus","Noter vite",function(){closeMenu();quickNoteOpen(e);}]);
  items.push(["duplicate","Dupliquer",function(){closeMenu();duplicateEntry(e);}]);
  items.push(["share","Partager en image",function(){closeMenu();shareJPG(e);}]);
  items.push(["link","SensCritique",function(){closeMenu();window.open("https://www.senscritique.com/recherche?query="+encodeURIComponent(e.titre),"_blank");}]);
  items.push(["trash","Supprimer",function(){closeMenu();showConfirm("Supprimer","Supprimer \u00ab"+e.titre+"\u00bb et toutes ses entr\u00e9es ?",function(){dbDelete(e.id).then(function(){toast("Supprim\u00e9");refreshAll();});});}]);
  for(var i=0;i<items.length;i++){
    var it=items[i];
    var m=el("div","mitem"+(it[3]?" "+it[3]:""));
    m.innerHTML='<span class="ic">'+ic(it[0])+"</span><span>"+it[1]+"</span>";
    m.addEventListener("click",it[2]);
    b.appendChild(m);
  }
  showOverlay("menu-overlay");
}
function closeMenu(){hideOverlay("menu-overlay");}
function collectionCard(e,i){
  var s=settingsLoad();
  if(s.colView==="list"){
    var card=el("div","hcard");card.style.animationDelay=(Math.min(i,10)*0.03)+"s";
    card.appendChild(renderPoster(e));
    var col=el("div","hcol");
    col.appendChild(el("div","htitle",esc(e.titre)));
    var meta=e.type+" \u2022 "+(e.support||"?")+" \u2022 "+(e.packaging||"?");
    if(e.note!=null)meta+=" \u2022 "+e.note+"/10";
    col.appendChild(el("div","hmeta",meta));
    card.appendChild(col);
    card.addEventListener("click",function(ev){if(ev.target.closest("button"))return;showCollectionDetail(e);});
    return card;
  }
  var cell=el("div","gcell");cell.style.animationDelay=(Math.min(i,12)*0.03)+"s";
  cell.appendChild(renderPoster(e));
  cell.appendChild(el("div","gtitle",esc(e.titre)));
  var meta=(e.support||"")+(e.packaging?" \u00b7 "+e.packaging:"");
  if(meta)cell.appendChild(el("div","gmeta",esc(meta)));
  cell.addEventListener("click",function(ev){if(ev.target.closest("button"))return;showCollectionDetail(e);});
  return cell;
}
async function renderCollection(){
  var list=ST.entries.filter(function(e){return e.inCollection;});
  var q=norm(ST.colQuery);
  if(q)list=list.filter(function(e){return norm(e.titre).indexOf(q)>=0||norm(e.type).indexOf(q)>=0||norm(e.support||"").indexOf(q)>=0||norm(e.packaging||"").indexOf(q)>=0;});
  if(ST.colSupport==="phys")list=list.filter(function(e){return e.support&&e.support!=="D\u00e9mat\u00e9rialis\u00e9"&&e.support!=="Streaming"&&e.support!=="Num\u00e9rique";});
  else if(ST.colSupport==="demat")list=list.filter(function(e){return e.support==="D\u00e9mat\u00e9rialis\u00e9"||e.support==="Streaming"||e.support==="Num\u00e9rique";});
  var byDate=function(e){var p=parseDateFR(e.dateFin);return p?p.y*10000+p.mo*100+p.d:0;};
  if(ST.colSort==="date-desc")list.sort(function(a,b){return byDate(b)-byDate(a)||(b.dateAjout||"").localeCompare(a.dateAjout||"");});
  if(ST.colSort==="date-asc")list.sort(function(a,b){return byDate(a)-byDate(b);});
  if(ST.colSort==="note-desc")list.sort(function(a,b){return (b.note!=null?b.note:-1)-(a.note!=null?a.note:-1);});
  if(ST.colSort==="titre-asc")list.sort(function(a,b){return a.titre.localeCompare(b.titre,"fr");});
  if(ST.colSort==="type")list.sort(function(a,b){return a.type.localeCompare(b.type,"fr")||a.titre.localeCompare(b.titre,"fr");});
  if(ST.colSort==="support")list.sort(function(a,b){return (a.support||"").localeCompare(b.support||"","fr")||a.titre.localeCompare(b.titre,"fr");});
  var grid=$("col-grid");if(!grid)return;
  var s2=settingsLoad();
  grid.className="grid"+(s2.colView==="list"?" list":"");
  grid.innerHTML="";
  if(!list.length){grid.appendChild(emptyBox("library","Aucune \u0153uvre dans ta biblioth\u00e8que."));return;}
  list.forEach(function(e,i){grid.appendChild(collectionCard(e,i));});
}
function showCollectionDetail(e){
  var body=el("div");
  var head=el("div","dhead");
  head.appendChild(renderPoster(e,false));
  var info=el("div","dinfo");
  info.appendChild(el("h2","",esc(e.titre)));
  var tags=el("div","tags");
  var noteTag=el("span","tag note",(e.note!=null?e.note+"/10":"\u2014/10"));
  noteTag.addEventListener("click",function(){openNoteEditor(e);});
  tags.appendChild(noteTag);
  tags.appendChild(el("span","tag",esc(e.type)));
  if(e.support)tags.appendChild(el("span","tag",esc(e.support)));
  if(e.packaging)tags.appendChild(el("span","tag",esc(e.packaging)));
  info.appendChild(tags);
  var details=el("div");details.style.marginTop="14px";
  if(e.ean){var row=el("div","sline");row.innerHTML='<span>EAN</span><b style="cursor:pointer;" title="Copier">'+esc(e.ean)+'</b>';row.querySelector("b").addEventListener("click",function(){navigator.clipboard.writeText(e.ean);toast("EAN copi\u00e9");});details.appendChild(row);}
  if(e.url){var row2=el("div","sline");row2.innerHTML='<span>URL</span><b style="color:var(--acc);cursor:pointer;">Ouvrir</b>';row2.querySelector("b").addEventListener("click",function(){window.open(e.url,"_blank");});details.appendChild(row2);}
  if(e.dateAjout){var row3=el("div","sline");row3.innerHTML='<span>Ajout\u00e9 le</span><b>'+esc(formatDate(e.dateAjout.slice(0,10)))+'</b>';details.appendChild(row3);}
  if(e.dateAchat){var row4=el("div","sline");row4.innerHTML='<span>Achet\u00e9 le</span><b>'+esc(formatDate(e.dateAchat))+'</b>';details.appendChild(row4);}
  if(e.edition){var row5=el("div","sline");row5.innerHTML='<span>\u00c9dition</span><b>'+esc(e.edition)+'</b>';details.appendChild(row5);}
  if(e.plateforme){var row6=el("div","sline");row6.innerHTML='<span>Plateforme</span><b>'+esc(e.plateforme)+'</b>';details.appendChild(row6);}
  if(e.bonus&&e.bonus.length){var row7=el("div","sline");row7.innerHTML='<span>Bonus</span><b>'+esc(e.bonus.join(", "))+'</b>';details.appendChild(row7);}
  info.appendChild(details);
  head.appendChild(info);body.appendChild(head);
  setModal(e.titre,body,[["Modifier","primary",function(){renderPanel(e);}],["Supprimer","",function(){showConfirm("Supprimer","Supprimer \u00ab"+e.titre+"\u00bb de ta biblioth\u00e8que ?",function(){dbDelete(e.id).then(function(){toast("Supprim\u00e9");closeModal();refreshAll();});});}],["Fermer","",closeModal]]);
}
function openNoteEditor(e){
  ST.subBackFn=function(){showCollectionDetail(e);};
  var body=el("div");
  body.appendChild(el("div","","Note actuelle : <b>"+(e.note!=null?e.note+"/10":"aucune")+"</b>"));
  var ng=el("div","note-grid");
  for(var n=1;n<=10;n++){
    (function(n){
      var b=el("button","note-btn"+(e.note===n?" on note-"+n:""),String(n));
      b.addEventListener("click",function(){
        e.note=n;
        dbPut(e).then(function(){toast("Note : "+n+"/10");closeOrBack();refreshAll();});
      });
      ng.appendChild(b);
    })(n);
  }
  body.appendChild(ng);
  var clearBtn=el("button","wide");clearBtn.textContent="Retirer la note";
  clearBtn.addEventListener("click",function(){e.note=null;dbPut(e).then(function(){toast("Note retir\u00e9e");closeOrBack();refreshAll();});});
  body.appendChild(clearBtn);
  setModal("Modifier la note",body,[["Fermer","",closeOrBack]]);
}
function openReaderForEntry(entry,idx){
  ST.currentReaderEntry=entry;
  ST.currentReaderJournalIdx=idx;
  var jl=entry.journal||(entry.comment?[{kind:"free",text:entry.comment}]:[]);
  var x=jl[idx]||{text:""};
  var tag=x.kind==="time"?x.ts:(x.kind==="ep"?("S"+pad2(x.s)+"E"+pad2(x.e)+(x.note!=null?" \u2022 "+x.note+"/10":"")):"libre");
  var t=$("r-title");if(t)t.textContent=entry.titre;
  var s=$("r-sub");if(s)s.textContent=tag;
  var b=$("r-body");if(b)b.textContent=x.text||"";
  showOverlay("reader-overlay");
}
function closeReader(){hideOverlay("reader-overlay");ST.currentReaderEntry=null;ST.currentReaderJournalIdx=null;}
function capturePanel(){
  var t=$("p-title");if(t)ST.draft.titre=t.value;
  var d=$("p-date");if(d)ST.draft.date=d.value;
  var c=$("p-comment");if(c)ST.draft.comment=c.value;
  var s=$("p-sub");if(s)ST.draft.sub=s.value;
}
function rerenderPanel(){
  var mb=$("m-body");var sc=mb?mb.scrollTop:0;
  capturePanel();
  renderPanel(ST.editing,true);
  var mb2=$("m-body");if(mb2)mb2.scrollTop=sc;
}
function renderPanel(entry,keepDraft){
  ST.editing=entry||null;
  ST.subBackFn=null;
  if(!keepDraft){
    if(entry){
      ST.panelType=entry.type;
      ST.currentNote=entry.note!=null?entry.note:null;
      ST.isFav=!!entry.isFavorite;
      ST.isEnc=!!entry.enCours;
      ST.isVoir=!!entry.aVoir;
      ST.isInCollection=!!entry.inCollection;
      ST.panelPoster=entry.posterUrl||"";
      ST.panelThumb=entry.posterThumb||"";
      ST.advFields={plateforme:entry.plateforme||"",dateAchat:entry.dateAchat||"",edition:entry.edition||"",bonus:(entry.bonus||[]).slice(),support:entry.support||"",packaging:entry.packaging||"",ean:entry.ean||"",url:entry.url||""};
      ST.draft={titre:entry.titre||"",date:toInputDate(entry.dateFin||""),comment:entry.comment||"",sub:entry.sousTitre||""};
      var srcJ=entry.journal||(entry.comment?[{kind:"free",text:entry.comment}]:[]);
      ST.draftJournal=JSON.parse(JSON.stringify(srcJ));
    }else{
      ST.panelType=ST.currentType;
      ST.currentNote=null;
      ST.isFav=false;ST.isEnc=false;ST.isVoir=false;ST.isInCollection=false;
      ST.panelPoster=(ST.selectedItem&&ST.selectedItem.poster)||"";
      ST.panelThumb="";
      ST.advFields={plateforme:"",dateAchat:"",edition:"",bonus:[],support:"",packaging:"",ean:"",url:""};
      ST.draft={titre:(ST.selectedItem&&ST.selectedItem.title)||"",date:todayFR(),comment:"",sub:""};
      ST.draftJournal=[];
    }
  }
  var s=settingsLoad();var mode=s.panelMode||"simple";
  var body=el("div");
  var seg=el("div","seg");
  seg.style.marginBottom="20px";
  ["simple","avance"].forEach(function(m){
    var b=el("button",mode===m?"on":"",m==="simple"?"Simple":"Avanc\u00e9");
    b.addEventListener("click",function(){s.panelMode=m;settingsSave(s);rerenderPanel();});
    seg.appendChild(b);
  });
  body.appendChild(seg);
  function field(label,node){var w=el("div");w.style.marginBottom="20px";w.appendChild(el("label","",label));w.appendChild(node);body.appendChild(w);return node;}
  var tIn=field("Titre",el("input"));tIn.id="p-title";tIn.value=ST.draft.titre;
  var tw=el("div");tw.style.marginBottom="20px";tw.appendChild(el("label","","Type"));
  var tch=el("div","chips small");
  allTypesWithIcons().forEach(function(t){
    var c=el("div","chip"+(t.name===ST.panelType?" on":""),'<span class="ic">'+ic(t.icon||"tag")+"</span>"+esc(t.name));
    c.addEventListener("click",function(){ST.panelType=t.name;rerenderPanel();});
    tch.appendChild(c);
  });
  tw.appendChild(tch);body.appendChild(tw);
  var nw=el("div");nw.style.marginBottom="20px";nw.appendChild(el("label","","Note /10 (re-cliquer pour enlever)"));
  var nch=el("div","note-grid");
  for(var n=1;n<=10;n++){
    (function(n){
      var c=el("button","note-btn"+(ST.currentNote===n?" on note-"+n:""),String(n));
      c.addEventListener("click",function(){
        if(ST.currentNote===n){ST.currentNote=null;nch.querySelectorAll(".note-btn").forEach(function(x){x.className="note-btn";});}
        else{ST.currentNote=n;nch.querySelectorAll(".note-btn").forEach(function(x){x.className="note-btn";});c.className="note-btn on note-"+n;}
      });
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
  sc(function(){return ST.isFav;},function(v){ST.isFav=v;},"coup de c\u0153ur","heart");
  sc(function(){return ST.isEnc;},function(v){ST.isEnc=v;},"en cours","hourglass");
  sc(function(){return ST.isVoir;},function(v){ST.isVoir=v;},"\u00e0 voir","eye");
  body.appendChild(sw);
  var dIn=field("Date",el("input"));dIn.id="p-date";dIn.type="date";dIn.value=ST.draft.date;
  var cIn=field("Commentaire rapide",el("textarea"));cIn.id="p-comment";cIn.value=ST.draft.comment;
  var aw=el("div");aw.style.marginBottom="20px";aw.appendChild(el("label","","Affiche"));
  var ar=el("div");ar.style.display="flex";ar.style.gap="8px";ar.style.alignItems="center";
  var prev=el("img");prev.id="p-prev";prev.src=ST.panelPoster||NO_POSTER;prev.style.width="58px";prev.style.borderRadius="6px";
  var bU=el("button","icon");bU.innerHTML=ic("link");bU.title="Changer l'URL";
  var bI=el("button","icon");bI.innerHTML=ic("folder");bI.title="Importer";
  var fI=el("input");fI.type="file";fI.accept="image/*";fI.hidden=true;
  bU.addEventListener("click",function(){openImageUrlModal();});
  bI.addEventListener("click",function(){fI.click();});
  fI.addEventListener("change",function(ev){var f=ev.target.files[0];if(f)fileToResized(f,500).then(function(u){ST.panelPoster=u;makeThumb(u).then(function(t){ST.panelThumb=t;});prev.src=u;});});
  ar.appendChild(prev);ar.appendChild(bU);ar.appendChild(bI);ar.appendChild(fI);
  aw.appendChild(ar);body.appendChild(aw);
  if(mode==="avance"){
    var sIn=field("D\u00e9tail (saison / tome / piste\u2026)",el("input"));sIn.id="p-sub";sIn.value=ST.draft.sub;
    var jw=el("div");jw.style.marginBottom="20px";jw.appendChild(el("label","","Journal de bord"));
    var jb=el("div","chips small");
    [["time","horodat\u00e9","clock"],["free","libre","pen"],["ep","saison/\u00e9pis.","tv"]].forEach(function(k){
      var c=el("div","chip",'<span class="ic">'+ic(k[2])+"</span>"+k[1]);
      c.addEventListener("click",function(){openDraft(k[0],jw);});
      jb.appendChild(c);
    });
    jw.appendChild(jb);
    var jlist=el("div");jlist.id="p-jlist";
    jw.appendChild(jlist);body.appendChild(jw);renderJList(jlist);
    function advBtn(iconn,label,getVal,fn){
      var val=getVal();
      var b=el("button","adv-btn"+(val?" on":""));
      b.innerHTML='<span class="ic">'+ic(iconn)+'</span><span>'+label+'</span><span class="adv-val">'+esc(val)+'</span>';
      b.addEventListener("click",fn);
      return b;
    }
    var collGrid=el("div","adv-grid");
    collGrid.appendChild(advBtn("box","Collection",function(){return ST.isInCollection?"Oui":"";},function(){ST.isInCollection=!ST.isInCollection;rerenderPanel();}));
    collGrid.appendChild(advBtn("monitor","Plateforme",function(){return ST.advFields.plateforme;},function(){openPlateformeModal();}));
    collGrid.appendChild(advBtn("calendar","Date achat",function(){return ST.advFields.dateAchat;},function(){openDateAchatModal();}));
    collGrid.appendChild(advBtn("hash","\u00c9dition",function(){return ST.advFields.edition;},function(){openEditionModal();}));
    collGrid.appendChild(advBtn("gift","Bonus",function(){return ST.advFields.bonus.join(", ");},function(){openBonusModal();}));
    collGrid.appendChild(advBtn("box","Support",function(){return ST.advFields.support;},function(){openSupportModal();}));
    collGrid.appendChild(advBtn("package-open","Packaging",function(){return ST.advFields.packaging;},function(){openPackagingModal();}));
    collGrid.appendChild(advBtn("barcode","EAN",function(){return ST.advFields.ean;},function(){openEANModal();}));
    collGrid.appendChild(advBtn("link","URL",function(){return ST.advFields.url;},function(){openURLModal();}));
    body.appendChild(collGrid);
    var searchLinks=el("div","search-links");
    searchLinks.appendChild(el("span","","Rechercher :"));
    var links=[
      {name:"Google",icon:"search",url:"https://www.google.com/search?q="+encodeURIComponent(ST.draft.titre||"")},
      {name:"Steam",icon:"gamepad2",url:"https://store.steampowered.com/search/?term="+encodeURIComponent(ST.draft.titre||"")},
      {name:"TMDB",icon:"film",url:"https://www.themoviedb.org/search?query="+encodeURIComponent(ST.draft.titre||"")},
      {name:"SensCritique",icon:"heart",url:"https://www.senscritique.com/recherche?query="+encodeURIComponent(ST.draft.titre||"")}
    ];
    links.forEach(function(l){
      var a=el("a","search-link");a.href=l.url;a.target="_blank";a.innerHTML='<span class="ic">'+ic(l.icon)+'</span>'+l.name;
      searchLinks.appendChild(a);
    });
    body.appendChild(searchLinks);
  }
  setModal(entry?"Modifier":"Nouvelle "+OE+"uvre",body,[["Enregistrer","primary",saveCurrentEntry],["Annuler","",closeModal]]);
}
function markCollection(){ST.isInCollection=true;}
function openImageUrlModal(){
  ST.subBackFn=function(){rerenderPanel();};
  var body=el("div");
  var inp=el("input");inp.placeholder="https://\u2026";
  body.appendChild(inp);
  setModal("URL de l'image",body,[["Valider","primary",function(){var v=inp.value.trim();if(!v){toast("URL vide.");return;}ST.panelPoster=v;makeThumb(v).then(function(t){ST.panelThumb=t;});rerenderPanel();}],["Annuler","",closeOrBack]]);
}
function openFreeInputModal(title,cb,onCancel){
  var body=el("div");
  var inp=el("input");inp.placeholder="Ta valeur\u2026";
  body.appendChild(inp);
  setModal(title,body,[["Valider","primary",function(){var v=inp.value.trim();if(v)cb(v);else toast("Vide.");}],["Annuler","",onCancel||closeOrBack]]);
}
function openEanInputModal(cb){
  ST.subBackFn=function(){openEANModal();};
  var body=el("div");
  var inp=el("input");inp.placeholder="Code EAN\u2026";inp.inputMode="numeric";
  body.appendChild(inp);
  setModal("EAN manuel",body,[["Valider","primary",function(){var v=inp.value.trim();if(v)cb(v);else toast("Code vide.");}],["Annuler","",closeOrBack]]);
}
function openPlateformeModal(){
  ST.subBackFn=function(){rerenderPanel();};
  var body=el("div");
  PLATFORMS.forEach(function(p){
    var btn=el("button","wide");
    btn.innerHTML='<span class="ic">'+ic(p.icon)+'</span><span>'+p.name+'</span>';
    btn.style.justifyContent="flex-start";
    if(ST.advFields.plateforme===p.name)btn.classList.add("primary");
    btn.addEventListener("click",function(){ST.advFields.plateforme=p.name;markCollection();rerenderPanel();});
    body.appendChild(btn);
  });
  setModal("Plateforme",body,[["Annuler","",closeOrBack]]);
}
function openDateAchatModal(){
  ST.subBackFn=function(){rerenderPanel();};
  var body=el("div");
  var inp=el("input");inp.type="date";inp.value=ST.advFields.dateAchat||todayFR();
  body.appendChild(inp);
  setModal("Date d'achat",body,[["Valider","primary",function(){ST.advFields.dateAchat=inp.value;markCollection();rerenderPanel();}],["Annuler","",closeOrBack]]);
}
function openEditionModal(){
  ST.subBackFn=function(){rerenderPanel();};
  var body=el("div");
  var inp=el("input");inp.placeholder="\u00c9dition limit\u00e9e, Day One, N\u00b0 234/500\u2026";inp.value=ST.advFields.edition||"";
  body.appendChild(inp);
  setModal("\u00c9dition",body,[["Valider","primary",function(){ST.advFields.edition=inp.value.trim();if(ST.advFields.edition)markCollection();rerenderPanel();}],["Annuler","",closeOrBack]]);
}
function openBonusModal(){
  ST.subBackFn=function(){rerenderPanel();};
  var body=el("div");
  BONUSES.forEach(function(b){
    var btn=el("button","wide");
    btn.innerHTML='<span class="ic">'+ic(b.icon)+'</span><span>'+b.name+'</span>';
    btn.style.justifyContent="flex-start";
    if(ST.advFields.bonus.indexOf(b.name)>=0)btn.classList.add("primary");
    btn.addEventListener("click",function(){
      var i=ST.advFields.bonus.indexOf(b.name);
      if(i>=0)ST.advFields.bonus.splice(i,1);else ST.advFields.bonus.push(b.name);
      btn.classList.toggle("primary",ST.advFields.bonus.indexOf(b.name)>=0);
    });
    body.appendChild(btn);
  });
  setModal("Bonus (multi-s\u00e9lection)",body,[["Valider","primary",function(){if(ST.advFields.bonus.length)markCollection();rerenderPanel();}],["Annuler","",closeOrBack]]);
}
function openSupportModal(){
  ST.subBackFn=function(){rerenderPanel();};
  var body=el("div");
  var free=el("button","wide");
  free.innerHTML='<span class="ic">'+ic("pen")+'</span><span style="font-style:italic;">...</span>';
  free.style.justifyContent="flex-start";
  free.addEventListener("click",function(){
    ST.subBackFn=function(){openSupportModal();};
    openFreeInputModal("Support (entr\u00e9e libre)",function(v){ST.advFields.support=v;markCollection();rerenderPanel();});
  });
  body.appendChild(free);
  SUPPORT_CHOICES.forEach(function(s2){
    var btn=el("button","wide");
    btn.innerHTML='<span>'+s2+'</span>';
    btn.style.justifyContent="flex-start";
    if(ST.advFields.support===s2)btn.classList.add("primary");
    btn.addEventListener("click",function(){ST.advFields.support=s2;markCollection();rerenderPanel();});
    body.appendChild(btn);
  });
  setModal("Support",body,[["Annuler","",closeOrBack]]);
}
function openPackagingModal(){
  ST.subBackFn=function(){rerenderPanel();};
  var body=el("div");
  var free=el("button","wide");
  free.innerHTML='<span class="ic">'+ic("pen")+'</span><span style="font-style:italic;">...</span>';
  free.style.justifyContent="flex-start";
  free.addEventListener("click",function(){
    ST.subBackFn=function(){openPackagingModal();};
    openFreeInputModal("Packaging (entr\u00e9e libre)",function(v){ST.advFields.packaging=v;markCollection();rerenderPanel();});
  });
  body.appendChild(free);
  PACKAGING_CHOICES.forEach(function(p2){
    var btn=el("button","wide");
    btn.innerHTML='<span>'+p2+'</span>';
    btn.style.justifyContent="flex-start";
    if(ST.advFields.packaging===p2)btn.classList.add("primary");
    btn.addEventListener("click",function(){ST.advFields.packaging=p2;markCollection();rerenderPanel();});
    body.appendChild(btn);
  });
  setModal("Packaging",body,[["Annuler","",closeOrBack]]);
}
function openEANModal(){
  ST.subBackFn=function(){rerenderPanel();};
  var body=el("div");
  var inp=el("input");inp.placeholder="EAN";inp.inputMode="numeric";inp.value=ST.advFields.ean||"";
  body.appendChild(inp);
  var scanBtn=el("button","wide");scanBtn.innerHTML='<span class="ic">'+ic("camera")+'</span><span>Scanner</span>';
  scanBtn.addEventListener("click",function(){
    startEAN(function(code){ST.advFields.ean=code;markCollection();rerenderPanel();});
  });
  body.appendChild(scanBtn);
  setModal("EAN",body,[["Valider","primary",function(){ST.advFields.ean=inp.value.trim();if(ST.advFields.ean)markCollection();rerenderPanel();}],["Annuler","",closeOrBack]]);
}
function openURLModal(){
  ST.subBackFn=function(){rerenderPanel();};
  var body=el("div");
  var inp=el("input");inp.placeholder="URL de la fiche";inp.value=ST.advFields.url||"";
  body.appendChild(inp);
  setModal("URL",body,[["Valider","primary",function(){ST.advFields.url=inp.value.trim();if(ST.advFields.url)markCollection();rerenderPanel();}],["Annuler","",closeOrBack]]);
}
function saveCurrentEntry(){
  capturePanel();
  var title=ST.draft.titre.trim();
  if(!title){toast("Titre obligatoire.");return;}
  if(ST.editing){finishSave(ST.editing,ST.editing.id,ST.editing.dateAjout);return;}
  var type=ST.panelType;
  var dup=null;
  for(var i=0;i<ST.entries.length;i++){if(ST.entries[i].type===type&&norm(ST.entries[i].titre)===norm(title)){dup=ST.entries[i];break;}}
  if(dup){
    showConfirm("Doublon d\u00e9tect\u00e9","\u00AB"+dup.titre+"\u00bb existe d\u00e9j\u00e0 en "+type+". Modifier la fiche existante ?",function(){finishSave(dup,dup.id,dup.dateAjout);},function(){finishSave(null,null,null);},"Modifier");
  }else{
    finishSave(null,null,null);
  }
}
async function finishSave(base,entryId,dateAjout){
  var type=ST.panelType;
  base=base||{};
  if(!entryId){
    entryId=type+"_"+((ST.selectedItem&&ST.selectedItem.id)||Date.now());
    var exists=false;for(var k=0;k<ST.entries.length;k++){if(ST.entries[k].id===entryId){exists=true;break;}}
    if(exists)entryId+="_"+Date.now();
    dateAjout=new Date().toISOString();
  }
  var e=Object.assign({},base);
  e.id=entryId;e.type=type;e.titre=ST.draft.titre.trim();
  e.sousTitre=(ST.draft.sub||"").trim();
  e.note=ST.currentNote;e.isFavorite=ST.isFav;e.enCours=ST.isEnc;e.aVoir=ST.isVoir;e.inCollection=ST.isInCollection;
  e.dateFin=ST.draft.date?formatDate(ST.draft.date):"";
  e.comment=ST.draft.comment.trim();
  e.journal=ST.draftJournal;
  e.posterUrl=ST.panelPoster;
  e.posterThumb=ST.panelThumb||(await makeThumb(ST.panelPoster));
  if(ST.isInCollection){
    e.plateforme=ST.advFields.plateforme||null;
    e.dateAchat=ST.advFields.dateAchat||null;
    e.edition=ST.advFields.edition||null;
    e.bonus=ST.advFields.bonus.slice();
    e.support=ST.advFields.support||null;
    e.packaging=ST.advFields.packaging||null;
    e.ean=ST.advFields.ean||"";
    e.url=ST.advFields.url||"";
  }else{
    e.plateforme=null;e.dateAchat=null;e.edition=null;e.bonus=[];e.support=null;e.packaging=null;e.ean="";e.url="";
  }
  e.dateAjout=dateAjout;
  await dbPut(e);
  if(navigator.vibrate)navigator.vibrate(25);
  toast("Enregistr\u00e9");
  closeModal();refreshAll();
}
function duplicateEntry(e){
  ST.selectedItem=null;ST.editing=null;
  closeModal();
  setTimeout(function(){
    renderPanel(null);
    ST.draftJournal=[];
    ST.draft.titre=e.titre;
    var t=$("p-title");if(t)t.value=e.titre;
    ST.panelType=e.type;
  },60);
}
function openDraft(kind,parent){
  var old=$("p-jdraft");if(old)old.remove();
  var d=el("div","card");d.id="p-jdraft";
  if(kind==="time"){
    var rw=el("div","row2");
    rw.innerHTML='<label>Date & heure (optionnel)<input type="datetime-local" id="jd-when"></label>';
    d.appendChild(rw);
  }
  if(kind==="ep"){
    var r=el("div","row2");
    r.innerHTML='<label>S<input type="number" id="jd-s" min="0"></label><label>E<input type="number" id="jd-e" min="0"></label><label>/10<input type="number" id="jd-note" min="1" max="10"></label>';
    d.appendChild(r);
  }
  var ta=el("textarea");ta.placeholder="Ton entr\u00e9e\u2026";d.appendChild(ta);
  var act=el("div","row2");act.style.marginTop="10px";
  var ok=el("button","primary");ok.innerHTML='<span class="ic">'+ic("plus")+"</span>Ajouter";
  var no=el("button");no.innerHTML='<span class="ic">'+ic("x")+"</span>Annuler";
  act.appendChild(ok);act.appendChild(no);d.appendChild(act);parent.appendChild(d);
  ok.addEventListener("click",function(){
    var text=ta.value.trim();
    if(!text&&kind!=="ep"){toast("Entre un texte.");return;}
    if(kind==="time"){
      var wv=$("jd-when");
      ST.draftJournal.push({kind:"time",ts:fmtWhen(wv?wv.value:""),text:text,at:Date.now()});
    }else if(kind==="free"){
      ST.draftJournal.push({kind:"free",text:text,at:Date.now()});
    }else{
      var nn=$("jd-note");var ss=$("jd-s");var ee=$("jd-e");
      ST.draftJournal.push({kind:"ep",s:parseInt(ss?ss.value||"0":"0",10),e:parseInt(ee?ee.value||"0":"0",10),note:nn&&nn.value?Math.max(1,Math.min(10,parseInt(nn.value,10))):null,text:text,at:Date.now()});
    }
    d.remove();renderJList($("p-jlist"));
  });
  no.addEventListener("click",function(){d.remove();});
}
function renderJList(c){
  if(!c)return;
  c.innerHTML="";
  ST.draftJournal.forEach(function(x,i){
    var tag=x.kind==="time"?x.ts:(x.kind==="ep"?("S"+pad2(x.s)+"E"+pad2(x.e)+(x.note!=null?" \u2022 "+x.note+"/10":"")):"libre");
    var row=el("div","fitem");
    var b=el("div");
    b.appendChild(el("div","ftime",esc(tag)));
    b.appendChild(el("div","ftext",esc(x.text||"")));
    var del=el("button","flux-delete");del.innerHTML='<span class="ic">'+ic("trash-2")+'</span>';
    del.addEventListener("click",function(){ST.draftJournal.splice(i,1);renderJList(c);});
    row.appendChild(b);row.appendChild(del);
    c.appendChild(row);
  });
}
function quickNoteOpen(e,preText,kind,idx){
  ST.qnEntry=e;
  ST.qnEditIdx=(idx!=null?idx:null);
  ST.qnKind=kind||"time";
  var t=$("qn-title");if(t)t.textContent=(ST.qnEditIdx!=null?"Modifier : ":"Noter : ")+e.titre;
  var txt=$("qn-text");if(txt)txt.value=preText||"";
  var w=$("qn-when");if(w)w.value="";
  var wr=$("qn-when-row");if(wr)wr.classList.toggle("hidden",ST.qnKind!=="time");
  var er=$("qn-ep-row");if(er)er.classList.toggle("hidden",ST.qnKind!=="ep");
  var sb=$("qn-save");
  if(sb)sb.innerHTML=ST.qnEditIdx!=null?'<span class="ic">'+ic("save")+'</span>Remplacer':'<span class="ic">'+ic("plus")+'</span>Ajouter';
  var k=$("qn-kind");if(!k)return;k.innerHTML="";
  [["time","horodat\u00e9","clock"],["free","libre","pen"],["ep","saison/\u00e9pis.","tv"]].forEach(function(x){
    var c=el("div","chip"+(x[0]===ST.qnKind?" on":""),'<span class="ic">'+ic(x[2])+"</span>"+x[1]);
    c.addEventListener("click",function(){
      ST.qnKind=x[0];
      k.querySelectorAll(".chip").forEach(function(y){y.classList.remove("on");});
      c.classList.add("on");
      var er2=$("qn-ep-row");if(er2)er2.classList.toggle("hidden",x[0]!=="ep");
      var wr2=$("qn-when-row");if(wr2)wr2.classList.toggle("hidden",x[0]!=="time");
    });
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
  var obj;
  if(ST.qnKind==="time"){
    var w=$("qn-when");
    obj={kind:"time",ts:fmtWhen(w?w.value:""),text:text,at:Date.now()};
  }else if(ST.qnKind==="free"){
    obj={kind:"free",text:text,at:Date.now()};
  }else{
    var nn=$("qn-note");var ss=$("qn-s");var ee=$("qn-e");
    obj={kind:"ep",s:parseInt(ss?ss.value||"0":"0",10),e:parseInt(ee?ee.value||"0":"0",10),note:nn&&nn.value?Math.max(1,Math.min(10,parseInt(nn.value,10))):null,text:text,at:Date.now()};
  }
  if(ST.qnEditIdx!=null&&e.journal[ST.qnEditIdx]){
    obj.at=e.journal[ST.qnEditIdx].at||obj.at;
    e.journal[ST.qnEditIdx]=obj;
  }else{
    e.journal.push(obj);
  }
  await dbPut(e);
  if(navigator.vibrate)navigator.vibrate(15);
  toast(ST.qnEditIdx!=null?"Entr\u00e9e modifi\u00e9e":"Entr\u00e9e ajout\u00e9e");
  quickNoteClose();refreshAll();
}
function getFluxEntries(){
  var y=ST.calDate.getFullYear(),mo=ST.calDate.getMonth();
  var feed=[];
  ST.entries.forEach(function(en){
    (en.journal||[]).forEach(function(x,idx){
      var entryDate=parseDateFR(en.dateFin);
      if(entryDate&&entryDate.y===y&&entryDate.mo===mo+1){
        feed.push({e:en,x:x,idx:idx,at:x.at||0});
      }
    });
  });
  feed.sort(function(a,b){return b.at-a.at;});
  var f=ST.fluxFilter;
  if(f.types.length>0)feed=feed.filter(function(it){return f.types.indexOf(it.e.type)>=0;});
  if(f.status.length>0){
    feed=feed.filter(function(it){
      if(f.status.indexOf("enc")>=0&&it.e.enCours)return true;
      if(f.status.indexOf("fini")>=0&&!it.e.enCours&&!it.e.aVoir)return true;
      if(f.status.indexOf("voir")>=0&&it.e.aVoir)return true;
      return false;
    });
  }
  if(f.noteRange){
    if(f.noteRange==="none")feed=feed.filter(function(it){return it.e.note==null;});
    else if(f.noteRange==="low")feed=feed.filter(function(it){return it.e.note!=null&&it.e.note<=3;});
    else if(f.noteRange==="mid")feed=feed.filter(function(it){return it.e.note!=null&&it.e.note>=4&&it.e.note<=6;});
    else if(f.noteRange==="high")feed=feed.filter(function(it){return it.e.note!=null&&it.e.note>=7&&it.e.note<=8;});
    else if(f.noteRange==="top")feed=feed.filter(function(it){return it.e.note!=null&&it.e.note>=9;});
  }
  if(f.ownedOnly)feed=feed.filter(function(it){return it.e.inCollection;});
  if(f.search){
    var q=norm(f.search);
    feed=feed.filter(function(it){return norm(it.e.titre).indexOf(q)>=0||norm(it.x.text||"").indexOf(q)>=0;});
  }
  if(f.sort==="date-desc")feed.sort(function(a,b){return b.at-a.at;});
  else if(f.sort==="date-asc")feed.sort(function(a,b){return a.at-b.at;});
  else if(f.sort==="note-desc")feed.sort(function(a,b){return (b.e.note!=null?b.e.note:-1)-(a.e.note!=null?a.e.note:-1);});
  else if(f.sort==="note-asc")feed.sort(function(a,b){return (a.e.note!=null?a.e.note:99)-(b.e.note!=null?b.e.note:99);});
  else if(f.sort==="titre-asc")feed.sort(function(a,b){return a.e.titre.localeCompare(b.e.titre,"fr");});
  return feed;
}
function renderFluxItem(it){
  var item=el("div","fitem");
  var posterDiv=renderPoster(it.e,false);
  posterDiv.addEventListener("click",function(ev){ev.stopPropagation();openReaderForEntry(it.e,it.idx);});
  item.appendChild(posterDiv);
  var b=el("div","ftext-area");
  var tag=it.x.kind==="time"?it.x.ts:(it.x.kind==="ep"?("S"+pad2(it.x.s)+"E"+pad2(it.x.e)+(it.x.note!=null?" \u2022 "+it.x.note+"/10":"")):"libre");
  b.appendChild(el("div","ftime",esc(tag)));
  var hasText=it.x.text&&it.x.text.trim().length>0;
  if(hasText){
    var textRow=el("div");
    textRow.style.display="flex";
    textRow.style.justifyContent="space-between";
    textRow.style.alignItems="flex-start";
    textRow.style.gap="8px";
    var textEl=el("div","ftext",esc(it.x.text));
    textEl.style.flex="1";
    textEl.addEventListener("click",function(ev){ev.stopPropagation();quickNoteOpen(it.e,it.x.text,it.x.kind,it.idx);});
    textRow.appendChild(textEl);
    var delBtn=el("button","flux-delete");
    delBtn.innerHTML='<span class="ic">'+ic("trash-2")+'</span>';
    delBtn.addEventListener("click",function(ev){
      ev.stopPropagation();
      showConfirm("Supprimer cette entr\u00e9e ?","Cette action est irr\u00e9versible.",function(){
        it.e.journal.splice(it.idx,1);
        dbPut(it.e).then(function(){toast("Entr\u00e9e supprim\u00e9e");refreshAll();});
      });
    });
    textRow.appendChild(delBtn);
    b.appendChild(textRow);
  }else{
    if(it.x.note!=null){
      b.appendChild(el("div","fnote-big",it.x.note+"/10"));
    }else{
      b.appendChild(el("div","ftext","(sans texte)"));
    }
  }
  b.appendChild(el("div","fwork",esc(it.e.titre)));
  item.appendChild(b);
  return item;
}
async function renderJournal(){
  var enc=ST.entries.filter(function(e){return e.enCours;});
  var row=$("j-encours");if(!row)return;row.innerHTML="";
  if(enc.length){
    enc.forEach(function(e){
      var m=el("div","mini");
      m.appendChild(renderPoster(e,false));
      m.appendChild(el("div","t",esc(e.titre)));
      var l=journalLines(e);
      m.appendChild(el("div","s",esc(truncate(l.length?l[l.length-1]:"En cours\u2026",40))));
      m.addEventListener("click",function(){showCollectionDetail(e);});
      row.appendChild(m);
    });
  }else{
    row.appendChild(emptyBox("hourglass","Rien en cours."));
  }
  var y=ST.calDate.getFullYear(),mo=ST.calDate.getMonth();
  var names=["Janvier","F\u00e9vrier","Mars","Avril","Mai","Juin","Juillet","Ao\u00fbt","Septembre","Octobre","Novembre","D\u00e9cembre"];
  var bt=$("bilan-title");if(bt)bt.textContent=names[mo]+" "+y;
  var feed=getFluxEntries();
  var f=$("j-feed");if(!f)return;f.innerHTML="";
  if(!feed.length)f.appendChild(emptyBox("book","Aucune entr\u00e9e ce mois-ci."));
  feed.slice(0,60).forEach(function(it){f.appendChild(renderFluxItem(it));});
  if(ST.calOpen)renderCalendar();
}
function renderCalendar(){
  var cal=$("j-cal");if(!cal)return;cal.innerHTML="";
  var y=ST.calDate.getFullYear(),mo=ST.calDate.getMonth();
  var names=["Janvier","F\u00e9vrier","Mars","Avril","Mai","Juin","Juillet","Ao\u00fbt","Septembre","Octobre","Novembre","D\u00e9cembre"];
  var head=el("div","cal-head");
  var pv=el("button","icon");pv.innerHTML=ic("chevL");
  var nx=el("button","icon");nx.innerHTML=ic("chevR");
  head.appendChild(pv);head.appendChild(el("strong","",names[mo]+" "+y));head.appendChild(nx);
  cal.appendChild(head);
  var grid=el("div","cal-grid");
  ["L","M","M","J","V","S","D"].forEach(function(d){grid.appendChild(el("div","cdname",d));});
  var first=(new Date(y,mo,1).getDay()+6)%7;
  var days=new Date(y,mo+1,0).getDate();
  for(var i=0;i<first;i++)grid.appendChild(el("div","cday empty"));
  for(var d=1;d<=days;d++){
    (function(d){
      var c=el("div","cday");c.appendChild(el("div","",String(d)));
      var de=ST.entries.filter(function(e){var p=parseDateFR(e.dateFin);return p&&p.y===y&&p.mo===mo+1&&p.d===d;});
      if(de.length){
        c.classList.add("has");c.appendChild(el("div","dot"));
        c.addEventListener("click",function(){dayModal(d,mo,y,de);});
      }
      grid.appendChild(c);
    })(d);
  }
  cal.appendChild(grid);
  var nodate=ST.entries.filter(function(e){return e.dateFin&&!parseDateFR(e.dateFin);});
  if(nodate.length){
    var nd=el("div");nd.style.marginTop="10px";
    nd.appendChild(el("div","ftime","Sans date lisible :"));
    nodate.forEach(function(e){
      var x=el("div","fwork",esc(e.titre)+" \u2014 "+esc(e.dateFin));
      x.style.cursor="pointer";
      x.addEventListener("click",function(){showCollectionDetail(e);});
      nd.appendChild(x);
    });
    cal.appendChild(nd);
  }
  pv.addEventListener("click",function(){ST.calDate.setMonth(ST.calDate.getMonth()-1);renderCalendar();renderJournal();});
  nx.addEventListener("click",function(){ST.calDate.setMonth(ST.calDate.getMonth()+1);renderCalendar();renderJournal();});
}
function dayModal(d,mo,y,list){
  var body=el("div");
  list.forEach(function(e){
    var row=el("div","fitem");
    row.appendChild(renderPoster(e,false));
    var b=el("div");
    b.appendChild(el("div","htitle",esc(e.titre)));
    b.appendChild(el("div","hmeta",e.type+" \u2022 "+(e.note!=null?e.note+"/10":"\u2014")));
    row.appendChild(b);
    row.addEventListener("click",function(){showCollectionDetail(e);});
    body.appendChild(row);
  });
  setModal(OEC+"uvres du "+pad2(d)+"/"+pad2(mo+1)+"/"+y,body,[["Fermer","",closeModal]]);
}
function ghConfig(){return{owner:(localStorage.getItem("gh_owner")||"").trim(),repo:(localStorage.getItem("gh_repo")||"").trim(),token:(localStorage.getItem("gh_token")||"").trim()};}
function ghB64encode(s){return btoa(unescape(encodeURIComponent(s)));}
function ghB64decode(s){return decodeURIComponent(escape(atob(s)));}
async function ghGetFile(c,path){
  var r=await fetch("https://api.github.com/repos/"+c.owner+"/"+c.repo+"/contents/"+path,{headers:{Authorization:"Bearer "+c.token,Accept:"application/vnd.github+json"}});
  if(r.status===404)return null;
  if(!r.ok)throw new Error("GET "+r.status);
  return await r.json();
}
async function ghPutFile(c,path,content){
  var cur=await ghGetFile(c,path);
  var body={message:"Backup auto "+new Date().toISOString(),content:ghB64encode(content)};
  if(cur&&cur.sha)body.sha=cur.sha;
  var r=await fetch("https://api.github.com/repos/"+c.owner+"/"+c.repo+"/contents/"+path,{method:"PUT",headers:{Authorization:"Bearer "+c.token,Accept:"application/vnd.github+json","Content-Type":"application/json"},body:JSON.stringify(body)});
  if(!r.ok)throw new Error("PUT "+r.status);
  return await r.json();
}
var ghTimer=null;
function scheduleGitHubBackup(){
  var c=ghConfig();
  if(!c.owner||!c.repo||!c.token)return;
  if(ghTimer)clearTimeout(ghTimer);
  ghTimer=setTimeout(function(){ghBackupNow(false);},5000);
}
async function ghBackupNow(manual){
  var c=ghConfig();
  if(!c.owner||!c.repo||!c.token){if(manual)toast("Configure GitHub dans Option.");return;}
  var data={version:"V9",exportDate:new Date().toISOString(),settings:settingsLoad(),customTypes:loadCustomTypes(),sheetUrl:localStorage.getItem("sheet_url")||"",entries:ST.entries};
  try{
    await ghPutFile(c,"sauvegarde.json",JSON.stringify(data));
    localStorage.setItem("last_gh_backup",String(Date.now()));
    if(manual)toast("Sauvegarde GitHub OK");
  }catch(e){
    if(manual)toast("Erreur GitHub : "+e.message,3000);
  }
}
async function ghTest(){
  var c=ghConfig();
  if(!c.owner||!c.repo||!c.token){toast("Remplis owner, repo et token.");return;}
  try{
    var r=await fetch("https://api.github.com/repos/"+c.owner+"/"+c.repo,{headers:{Authorization:"Bearer "+c.token,Accept:"application/vnd.github+json"}});
    if(r.ok){var d=await r.json();toast("Connexion OK : "+d.full_name+(d.private?" (priv\u00e9)":" (PUBLIC !)"));}
    else toast("Erreur "+r.status,3000);
  }catch(e){toast("R\u00e9seau impossible",3000);}
}
async function ghRestore(){
  var c=ghConfig();
  if(!c.owner||!c.repo||!c.token){toast("Configure GitHub dans Option.");return;}
  try{
    var f=await ghGetFile(c,"sauvegarde.json");
    if(!f){toast("Aucune sauvegarde trouv\u00e9e.",3000);return;}
    var data=JSON.parse(ghB64decode(f.content));
    var list=data.entries||[];
    var ids={};ST.entries.forEach(function(x){ids[x.id]=1;});
    var added=0;
    for(var i=0;i<list.length;i++){
      var en=list[i];
      if(en&&en.id&&!ids[en.id]){
        if(!en.titre)en.titre="Sans titre";
        if(!en.dateAjout)en.dateAjout=new Date().toISOString();
        await dbPut(en);added++;
      }
    }
    if(data.settings)settingsSave(Object.assign({},SETTINGS_DEFAULTS,data.settings));
    if(data.customTypes)saveCustomTypes(data.customTypes);
    applySettings();buildTypeDropdown();refreshAll();
    toast("Restaur\u00e9 : "+added+" \u0153uvre(s) ajout\u00e9e(s)");
  }catch(e){toast("Restauration impossible : "+e.message,3000);}
}
function renderOptions(){
  var grid=$("opt-grid");if(!grid)return;
  grid.innerHTML="";
  var cats=[
    {icon:"sheet",label:"Sheet",fn:openOptSheet},
    {icon:"save",label:"Sauvegarde",fn:openOptSave},
    {icon:"palette",label:"Apparence",fn:openOptAppearance},
    {icon:"bar-chart-3",label:"Stats",fn:openOptStats},
    {icon:"tag",label:"Types",fn:openOptTypes},
    {icon:"search",label:"Recherche",fn:openOptSearch},
    {icon:"phone",label:"Application",fn:openOptApp},
    {icon:"info",label:"\u00c0 propos",fn:openOptAbout},
    {icon:"alert",label:"Danger",fn:openOptDanger}
  ];
  cats.forEach(function(cat){
    var btn=el("button","opt-btn");
    btn.innerHTML='<span class="ic">'+ic(cat.icon)+'</span><span>'+cat.label+'</span>';
    btn.addEventListener("click",cat.fn);
    grid.appendChild(btn);
  });
}
function openOptSheet(){
  var body=el("div");
  var uIn=el("input");uIn.placeholder="URL du webhook";uIn.value=localStorage.getItem("sheet_url")||"";
  body.appendChild(el("label","","URL webhook"));body.appendChild(uIn);
  var saveBtn=el("button","primary");saveBtn.innerHTML='<span class="ic">'+ic("save")+"</span>Sauver";
  saveBtn.addEventListener("click",function(){localStorage.setItem("sheet_url",uIn.value.trim());toast("URL enregistr\u00e9e");});
  body.appendChild(saveBtn);
  var copyBtn=el("button");copyBtn.innerHTML='<span class="ic">'+ic("clipboard-copy")+"</span>Copier (TSV)";
  copyBtn.addEventListener("click",function(){copyTSV();});
  body.appendChild(copyBtn);
  var syncBtn=el("button");syncBtn.innerHTML='<span class="ic">'+ic("upload")+"</span>Sync Sheet";
  syncBtn.addEventListener("click",function(){syncSheet();});
  body.appendChild(syncBtn);
  setModal("Google Sheet",body,[["Fermer","",closeModal]]);
}
function openOptSave(){
  var body=el("div");
  body.appendChild(el("div","sec-title","Sauvegarde locale"));
  var expBtn=el("button");expBtn.innerHTML='<span class="ic">'+ic("download")+"</span>Export JSON";
  expBtn.addEventListener("click",function(){exportJSON();});
  body.appendChild(expBtn);
  var impBtn=el("button");impBtn.innerHTML='<span class="ic">'+ic("upload")+"</span>Import (fusion)";
  impBtn.addEventListener("click",function(){importJSON();});
  body.appendChild(impBtn);
  var expTSVBtn=el("button");expTSVBtn.innerHTML='<span class="ic">'+ic("calendar-range")+"</span>Export journal (TSV)";
  expTSVBtn.addEventListener("click",function(){openExportTSVModal();});
  body.appendChild(expTSVBtn);
  var lb=localStorage.getItem("last_backup");
  body.appendChild(el("div","","Dernier backup local : <b>"+(lb?new Date(parseInt(lb,10)).toLocaleDateString("fr-FR"):"jamais")+"</b>"));
  body.appendChild(el("div","sec-title","Backup GitHub (repo priv\u00e9)"));
  var goIn=el("input");goIn.placeholder="Owner (ex : BoraGooum)";goIn.value=localStorage.getItem("gh_owner")||"";goIn.style.marginBottom="8px";
  body.appendChild(goIn);
  var grIn=el("input");grIn.placeholder="Repo (ex : collection-backup)";grIn.value=localStorage.getItem("gh_repo")||"";grIn.style.marginBottom="8px";
  body.appendChild(grIn);
  var gtIn=el("input");gtIn.placeholder="Token (github_pat_\u2026)";gtIn.type="password";gtIn.value=localStorage.getItem("gh_token")||"";gtIn.style.marginBottom="12px";
  body.appendChild(gtIn);
  var gsave=el("button","primary");gsave.innerHTML='<span class="ic">'+ic("save")+"</span>Sauver la config";
  gsave.addEventListener("click",function(){localStorage.setItem("gh_owner",goIn.value.trim());localStorage.setItem("gh_repo",grIn.value.trim());localStorage.setItem("gh_token",gtIn.value.trim());toast("Config GitHub sauv\u00e9e");});
  body.appendChild(gsave);
  var gtest=el("button");gtest.innerHTML='<span class="ic">'+ic("link")+"</span>Tester la connexion";
  gtest.addEventListener("click",function(){ghTest();});
  body.appendChild(gtest);
  var gnow=el("button");gnow.innerHTML='<span class="ic">'+ic("upload")+"</span>Sauvegarder maintenant";
  gnow.addEventListener("click",function(){ghBackupNow(true);});
  body.appendChild(gnow);
  var gres=el("button");gres.innerHTML='<span class="ic">'+ic("download")+"</span>Restaurer depuis GitHub";
  gres.addEventListener("click",function(){showConfirm("Restaurer","Ajouter les \u0153uvres manquantes depuis la sauvegarde GitHub ?",function(){ghRestore();},null,"Restaurer");});
  body.appendChild(gres);
  var lb2=localStorage.getItem("last_gh_backup");
  body.appendChild(el("div","","Dernier backup GitHub : <b>"+(lb2?new Date(parseInt(lb2,10)).toLocaleString("fr-FR"):"jamais")+"</b>"));
  body.appendChild(el("div","","Auto : \u00e0 chaque entr\u00e9e et \u00e0 chaque visite."));
  setModal("Sauvegarde",body,[["Fermer","",closeModal]]);
}
function openExportTSVModal(){
  var body=el("div");
  var names=["Janvier","F\u00e9vrier","Mars","Avril","Mai","Juin","Juillet","Ao\u00fbt","Septembre","Octobre","Novembre","D\u00e9cembre"];
  var y=ST.calDate.getFullYear(),mo=ST.calDate.getMonth();
  body.appendChild(el("div","","<b>"+names[mo]+" "+y+"</b>"));
  var btn1=el("button","wide");btn1.innerHTML='<span class="ic">'+ic("clipboard-copy")+"</span>Copier ce mois";
  btn1.addEventListener("click",function(){copyTSVMonth(y,mo+1);closeModal();});
  body.appendChild(btn1);
  var btn2=el("button","wide");btn2.innerHTML='<span class="ic">'+ic("clipboard-copy")+"</span>Copier tout le journal";
  btn2.addEventListener("click",function(){copyTSVAll();closeModal();});
  body.appendChild(btn2);
  setModal("Export journal",body,[["Fermer","",closeModal]]);
}
function openOptAppearance(){
  var s=settingsLoad();
  var body=el("div");
  body.appendChild(el("label","","Densit\u00e9"));
  var dPill=el("div","pill-sel");
  [["comfort","Confort"],["compact","Compact"]].forEach(function(o){
    var b=el("button",o[0]===s.density?"on":"",o[1]);
    b.addEventListener("click",function(){s.density=o[0];settingsSave(s);applySettings();dPill.querySelectorAll("button").forEach(function(x){x.classList.remove("on");});b.classList.add("on");});
    dPill.appendChild(b);
  });
  body.appendChild(dPill);
  body.appendChild(el("label","","Taille texte"));
  var fPill=el("div","pill-sel");
  [["s","S"],["m","M"],["l","L"]].forEach(function(o){
    var b=el("button",o[0]===s.fontSize?"on":"",o[1]);
    b.addEventListener("click",function(){s.fontSize=o[0];settingsSave(s);applySettings();fPill.querySelectorAll("button").forEach(function(x){x.classList.remove("on");});b.classList.add("on");});
    fPill.appendChild(b);
  });
  body.appendChild(fPill);
  body.appendChild(el("label","","Animations"));
  var aTog=el("div","toggle"+(s.animOn?" on":""));
  aTog.addEventListener("click",function(){s.animOn=!s.animOn;settingsSave(s);applySettings();aTog.classList.toggle("on",s.animOn);});
  body.appendChild(aTog);
  body.appendChild(el("label","","Contraste \u00e9lev\u00e9"));
  var hTog=el("div","toggle"+(s.hcMode?" on":""));
  hTog.addEventListener("click",function(){s.hcMode=!s.hcMode;settingsSave(s);applySettings();hTog.classList.toggle("on",s.hcMode);});
  body.appendChild(hTog);
  setModal("Apparence",body,[["Fermer","",closeModal]]);
}
function openOptStats(){
  var body=el("div");
  var entries=ST.entries;
  var total=entries.length;
  var byType={},byStatus={fini:0,enc:0,voir:0},byColl={phys:0,demat:0,no:0};
  var notes=[],sum=0,cnt=0,totalEntries=0,monthCount={};
  entries.forEach(function(e){
    byType[e.type]=(byType[e.type]||0)+1;
    if(e.enCours)byStatus.enc++;
    else if(e.aVoir)byStatus.voir++;
    else byStatus.fini++;
    if(e.inCollection){
      if(e.support==="D\u00e9mat\u00e9rialis\u00e9"||e.support==="Streaming"||e.support==="Num\u00e9rique")byColl.demat++;
      else byColl.phys++;
    }else byColl.no++;
    if(e.note!=null){notes.push(e.note);sum+=e.note;cnt++;}
    var rev=(e.journal||[]).filter(function(x){return x.text&&x.text.trim().length>0;}).length;
    totalEntries+=rev;
    var p=parseDateFR(e.dateFin);
    if(p){var key=p.y+"-"+pad2(p.mo);monthCount[key]=(monthCount[key]||0)+rev;}
  });
  var avg=cnt?(sum/cnt).toFixed(1):"\u2014";
  var maxNote=notes.length?Math.max.apply(null,notes):0;
  var minNote=notes.length?Math.min.apply(null,notes):0;
  var modeNote="\u2014";
  if(notes.length){
    var freq={};notes.forEach(function(n){freq[n]=(freq[n]||0)+1;});
    var maxFreq=0;for(var n in freq){if(freq[n]>maxFreq){maxFreq=freq[n];modeNote=n;}}
  }
  var mostActiveMonth=Object.keys(monthCount).sort(function(a,b){return monthCount[b]-monthCount[a];})[0]||"\u2014";
  var sec1=el("div","stats-section");sec1.appendChild(el("h4","","Par type"));
  CORE_TYPES.forEach(function(t){
    var n=byType[t.name]||0;
    var te=entries.filter(function(e){return e.type===t.name;});
    var ts=0,tc=0;te.forEach(function(e){if(e.note!=null){ts+=e.note;tc++;}});
    var row=el("div","stats-row");
    row.innerHTML='<span>'+esc(t.name)+'</span><span><b>'+n+'</b> <span class="dim">(moy '+(tc?(ts/tc).toFixed(1):"\u2014")+')</span></span>';
    sec1.appendChild(row);
  });
  body.appendChild(sec1);
  var sec2=el("div","stats-section");sec2.appendChild(el("h4","","Par statut"));
  [["Fini",byStatus.fini],["En cours",byStatus.enc],["\u00c0 voir",byStatus.voir]].forEach(function(s2){var row=el("div","stats-row");row.innerHTML='<span>'+s2[0]+'</span><b>'+s2[1]+'</b>';sec2.appendChild(row);});
  body.appendChild(sec2);
  var sec3=el("div","stats-section");sec3.appendChild(el("h4","","Collection"));
  [["Physique",byColl.phys],["D\u00e9mat\u00e9rialis\u00e9",byColl.demat],["Non poss\u00e9d\u00e9",byColl.no]].forEach(function(s2){var row=el("div","stats-row");row.innerHTML='<span>'+s2[0]+'</span><b>'+s2[1]+'</b>';sec3.appendChild(row);});
  body.appendChild(sec3);
  var sec4=el("div","stats-section");sec4.appendChild(el("h4","","Notes"));
  [["Total \u0153uvres",total],["Moyenne g\u00e9n\u00e9rale",avg+"/10"],["Meilleure note",maxNote+"/10"],["Pire note",minNote+"/10"],["Note la plus fr\u00e9quente",modeNote+"/10"]].forEach(function(s2){var row=el("div","stats-row");row.innerHTML='<span>'+s2[0]+'</span><b>'+s2[1]+'</b>';sec4.appendChild(row);});
  body.appendChild(sec4);
  var sec5=el("div","stats-section");sec5.appendChild(el("h4","","Activit\u00e9"));
  [["Total entr\u00e9es",totalEntries],["Mois le plus actif",mostActiveMonth.replace("-","/ ")+" ("+(monthCount[mostActiveMonth]||0)+")"]].forEach(function(s2){var row=el("div","stats-row");row.innerHTML='<span>'+s2[0]+'</span><b>'+s2[1]+'</b>';sec5.appendChild(row);});
  body.appendChild(sec5);
  setModal("Statistiques",body,[["Fermer","",closeModal]]);
}
function openOptTypes(){
  var body=el("div");
  var ct=loadCustomTypes();
  if(ct.length){
    body.appendChild(el("div","","Types personnalis\u00e9s :"));
    ct.forEach(function(t,i){
      var row=el("div","orow");
      row.appendChild(el("span","",esc(t.name)));
      var delBtn=el("button","icon");delBtn.innerHTML=ic("trash");
      delBtn.addEventListener("click",function(){
        var used=false;
        for(var j=0;j<ST.entries.length;j++){if(ST.entries[j].type===t.name){used=true;break;}}
        if(used){toast("Type encore utilis\u00e9.");return;}
        ct.splice(i,1);saveCustomTypes(ct);closeModal();openOptTypes();buildTypeDropdown();
      });
      row.appendChild(delBtn);
      body.appendChild(row);
    });
  }else{
    body.appendChild(el("div","empty","Aucun type personnalis\u00e9."));
  }
  var nt=el("input");nt.placeholder="Nouveau type\u2026";
  body.appendChild(nt);
  var addBtn=el("button","primary");addBtn.innerHTML='<span class="ic">'+ic("plus")+"</span>Ajouter";
  addBtn.addEventListener("click",function(){
    var v=nt.value.trim();if(!v)return;
    if(allTypes().indexOf(v)>=0){toast("Existe d\u00e9j\u00e0.");return;}
    ct.push({name:v});saveCustomTypes(ct);closeModal();openOptTypes();buildTypeDropdown();
  });
  body.appendChild(addBtn);
  setModal("Types",body,[["Fermer","",closeModal]]);
}
function openOptSearch(){
  var s=settingsLoad();
  var body=el("div");
  body.appendChild(el("label","","Type par d\u00e9faut"));
  var tPill=el("div","pill-sel");
  allTypes().forEach(function(t){
    var b=el("button",t===s.defaultType?"on":"",t);
    b.addEventListener("click",function(){s.defaultType=t;settingsSave(s);ST.currentType=t;tPill.querySelectorAll("button").forEach(function(x){x.classList.remove("on");});b.classList.add("on");buildTypeDropdown();});
    tPill.appendChild(b);
  });
  body.appendChild(tPill);
  body.appendChild(el("label","","Tol\u00e9rance fautes"));
  var fTog=el("div","toggle"+(s.fuzzy?" on":""));
  fTog.addEventListener("click",function(){s.fuzzy=!s.fuzzy;settingsSave(s);fTog.classList.toggle("on",s.fuzzy);});
  body.appendChild(fTog);
  var clearBtn=el("button");clearBtn.innerHTML='<span class="ic">'+ic("trash")+"</span>Vider r\u00e9centes";
  clearBtn.addEventListener("click",function(){localStorage.removeItem("recent_searches");ST.recent=[];toast("Vid\u00e9");});
  body.appendChild(clearBtn);
  setModal("Recherche",body,[["Fermer","",closeModal]]);
}
function openOptApp(){
  var body=el("div");
  var instBtn=el("button");instBtn.innerHTML='<span class="ic">'+ic("download")+"</span>Installer l\u2019appli";
  instBtn.addEventListener("click",function(){triggerInstall();});
  body.appendChild(instBtn);
  var cacheBtn=el("button");cacheBtn.innerHTML='<span class="ic">'+ic("trash")+"</span>Vider cache offline";
  cacheBtn.addEventListener("click",function(){if("caches"in window)caches.keys().then(function(k){k.forEach(function(x){caches.delete(x);});});toast("Cache vid\u00e9");});
  body.appendChild(cacheBtn);
  body.appendChild(el("div","","R\u00e9seau : <b>"+(navigator.onLine?"connect\u00e9":"hors-ligne")+"</b>"));
  setModal("Application",body,[["Fermer","",closeModal]]);
}
function openOptAbout(){
  var body=el("div");
  body.appendChild(el("div","","Version : <b>V9.0</b>"));
  body.appendChild(el("div","","Build : <b>"+new Date(BUILD).toLocaleString("fr-FR",{timeZone:"Europe/Paris"})+"</b>"));
  var cred=el("a","","Cr\u00e9\u00e9 par Gooumbora");cred.href="https://www.senscritique.com/Gooumbora";cred.target="_blank";cred.style.color="var(--acc)";
  body.appendChild(cred);
  setModal("\u00c0 propos",body,[["Fermer","",closeModal]]);
}
function openOptDanger(){
  var body=el("div");
  var clearBtn=el("button");clearBtn.innerHTML='<span class="ic">'+ic("trash")+"</span>Vider la collection";
  clearBtn.addEventListener("click",function(){
    showConfirm("Vider la collection","Effacer TOUTES tes "+OE+"uvres ? Cette action est irr\u00e9versible.",function(){
      (async function(){for(var i=0;i<ST.entries.length;i++)await dbDelete(ST.entries[i].id);refreshAll();toast("Vid\u00e9");})();
    },null,"Vider");
  });
  body.appendChild(clearBtn);
  var resetBtn=el("button");resetBtn.innerHTML='<span class="ic">'+ic("x")+"</span>R\u00e9initialiser r\u00e9glages";
  resetBtn.addEventListener("click",function(){
    showConfirm("R\u00e9initialiser","Remettre tous les r\u00e9glages par d\u00e9faut ?",function(){
      localStorage.removeItem("settings");settingsSave(Object.assign({},SETTINGS_DEFAULTS));applySettings();toast("R\u00e9glages r\u00e9initialis\u00e9s");
    },null,"R\u00e9initialiser");
  });
  body.appendChild(resetBtn);
  setModal("Danger",body,[["Fermer","",closeModal]]);
}