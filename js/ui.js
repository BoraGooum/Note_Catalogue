var ST={entries:[],view:"search",colQuery:"",colSort:"date-desc",colSupport:"all",editing:null,selectedItem:null,currentType:"Film",panelType:"Film",currentNote:null,isFav:false,isEnc:false,isVoir:false,draftJournal:[],panelPoster:"",panelThumb:"",qnEntry:null,qnKind:"time",recent:[],menuEntry:null,fluxFilter:{types:[],status:[],noteRange:null,ownedOnly:false,search:"",sort:"date-desc"},currentReaderEntry:null,currentReaderJournalIdx:null,isInCollection:false,advFields:{plateforme:"",dateAchat:"",edition:"",bonus:[],support:"",packaging:"",ean:"",url:""}};
var overlayStack=[];
var FOOT_IC={"Modifier":"edit","Noter":"plus","Fermer":"x","Enregistrer":"save","Annuler":"x","Ajouter":"plus","Copier":"clipboard-copy","Supprimer":"trash-2"};
function el(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d;}
function $(id){return document.getElementById(id);}
function emptyBox(icn,txt){var d=el("div","empty");d.innerHTML='<span class="ic">'+ic(icn)+"</span>"+esc(txt);return d;}
function toast(m,t){var e=$("toast");if(!e)return;e.textContent=m;e.classList.add("show");setTimeout(function(){e.classList.remove("show");},t||1800);}
function showOverlay(id){var e=$(id);if(!e)return;e.classList.add("on");overlayStack.push(id);try{history.pushState(null,"");}catch(err){}}
function hideOverlay(id){var e=$(id);if(!e)return;e.classList.remove("on");var i=overlayStack.indexOf(id);if(i>=0)overlayStack.splice(i,1);}
window.addEventListener("popstate",function(){var id=overlayStack[overlayStack.length-1];if(id){var e=$(id);if(e)e.classList.remove("on");overlayStack.pop();}});
function closeModal(){hideOverlay("modal-overlay");var b=$("m-body");if(b)b.innerHTML="";var f=$("m-foot");if(f)f.innerHTML="";ST.editing=null;}
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
function showConfirm(title,msg,onYes,onNo){
  var t=$("confirm-title");if(t)t.textContent=title;
  var b=$("confirm-body");if(b)b.innerHTML='<p style="font-size:14px;line-height:1.6;">'+esc(msg)+'</p>';
  var f=$("confirm-foot");if(!f)return;f.innerHTML="";
  var noBtn=el("button","","Annuler");noBtn.addEventListener("click",function(){hideOverlay("confirm-overlay");if(onNo)onNo();});
  var yesBtn=el("button","primary","Supprimer");yesBtn.addEventListener("click",function(){hideOverlay("confirm-overlay");if(onYes)onYes();});
  f.appendChild(noBtn);f.appendChild(yesBtn);
  showOverlay("confirm-overlay");
}
async function refreshAll(){ST.entries=await dbAll();renderCollection();renderJournal();}
function neonClass(e){if(e.aVoir)return "n-voir";if(e.enCours)return "n-enc";return "n-fini";}
function statIcon(e){if(e.aVoir)return ic("eye");if(e.enCours)return ic("hourglass");return ic("check");}
function fmtWhen(v){
  if(!v)return nowStamp();
  var p=v.split("T");
  var d=p[0].split("-");
  var t=(p[1]||"00:00").split(":");
  return d[2]+"/"+d[1]+" \u00e0 "+t[0]+"h"+t[1];
}
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
  items.push(["trash","Supprimer",function(){closeMenu();showConfirm("Supprimer","Supprimer \u00ab"+e.titre+"\u00bb et toutes ses entr\u00e9es ?",function(){dbDelete(e.id).then(function(){toast("Supprim\u00e9");refreshAll();});});},"danger"]);
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
  tags.appendChild(el("span","tag",esc(e.type)));
  if(e.support)tags.appendChild(el("span","tag",esc(e.support)));
  if(e.packaging)tags.appendChild(el("span","tag",esc(e.packaging)));
  if(e.note!=null)tags.appendChild(el("span","tag note",e.note+"/10"));
  info.appendChild(tags);
  var details=el("div");details.style.marginTop="12px";
  if(e.ean){var row=el("div","sline");row.innerHTML='<span>EAN</span><b style="cursor:pointer;" title="Copier">'+esc(e.ean)+'</b>';row.querySelector("b").addEventListener("click",function(){navigator.clipboard.writeText(e.ean);toast("EAN copi\u00e9");});details.appendChild(row);}
  if(e.url){var row=el("div","sline");row.innerHTML='<span>URL</span><b style="color:var(--acc);cursor:pointer;">Ouvrir</b>';row.querySelector("b").addEventListener("click",function(){window.open(e.url,"_blank");});details.appendChild(row);}
  if(e.dateAjout){var row=el("div","sline");row.innerHTML='<span>Ajout\u00e9 le</span><b>'+esc(formatDate(e.dateAjout.slice(0,10)))+'</b>';details.appendChild(row);}
  if(e.dateAchat){var row=el("div","sline");row.innerHTML='<span>Achet\u00e9 le</span><b>'+esc(e.dateAchat)+'</b>';details.appendChild(row);}
  if(e.edition){var row=el("div","sline");row.innerHTML='<span>\u00c9dition</span><b>'+esc(e.edition)+'</b>';details.appendChild(row);}
  if(e.plateforme){var row=el("div","sline");row.innerHTML='<span>Plateforme</span><b>'+esc(e.plateforme)+'</b>';details.appendChild(row);}
  if(e.bonus&&e.bonus.length){var row=el("div","sline");row.innerHTML='<span>Bonus</span><b>'+esc(e.bonus.join(", "))+'</b>';details.appendChild(row);}
  info.appendChild(details);
  head.appendChild(info);body.appendChild(head);
  setModal(e.titre,body,[["Modifier","primary",function(){renderPanel(e);}],["Supprimer","danger",function(){showConfirm("Supprimer","Supprimer \u00ab"+e.titre+"\u00bb ?",function(){dbDelete(e.id).then(function(){toast("Supprim\u00e9");closeModal();refreshAll();});});}],["Fermer","",closeModal]]);
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
function renderPanel(entry){
  ST.editing=entry||null;
  if(entry){
    ST.panelType=entry.type;
    ST.currentNote=entry.note!=null?entry.note:null;
    ST.isFav=!!entry.isFavorite;
    ST.isEnc=!!entry.enCours;
    ST.isVoir=!!entry.aVoir;
    ST.isInCollection=!!entry.inCollection;
    ST.panelPoster=entry.posterUrl||"";
    ST.panelThumb=entry.posterThumb||"";
    ST.advFields={plateforme:entry.plateforme||"",dateAchat:entry.dateAchat||"",edition:entry.edition||"",bonus:entry.bonus||[],support:entry.support||"",packaging:entry.packaging||"",ean:entry.ean||"",url:entry.url||""};
    var srcJ=entry.journal||(entry.comment?[{kind:"free",text:entry.comment}]:[]);
    ST.draftJournal=JSON.parse(JSON.stringify(srcJ));
  }else{
    ST.panelType=ST.currentType;
    ST.currentNote=null;
    ST.isFav=false;
    ST.isEnc=false;
    ST.isVoir=false;
    ST.isInCollection=false;
    ST.panelPoster=(ST.selectedItem&&ST.selectedItem.poster)||"";
    ST.panelThumb="";
    ST.advFields={plateforme:"",dateAchat:"",edition:"",bonus:[],support:"",packaging:"",ean:"",url:""};
    ST.draftJournal=[];
  }
  var s=settingsLoad();var mode=s.panelMode||"simple";
  var body=el("div");
  var seg=el("div","seg");
  seg.style.marginBottom="16px";
  ["simple","avance"].forEach(function(m){
    var b=el("button",mode===m?"on":"",m==="simple"?"Simple":"Avanc\u00e9");
    b.addEventListener("click",function(){s.panelMode=m;settingsSave(s);renderPanel(ST.editing);});
    seg.appendChild(b);
  });
  body.appendChild(seg);
  function field(label,node){var w=el("div");w.style.marginBottom="16px";w.appendChild(el("label","",label));w.appendChild(node);body.appendChild(w);return node;}
  var tIn=field("Titre",el("input"));tIn.id="p-title";tIn.value=entry?entry.titre:((ST.selectedItem&&ST.selectedItem.title)||"");
  var tw=el("div");tw.style.marginBottom="16px";tw.appendChild(el("label","","Type"));
  var tch=el("div","chips small");
  allTypesWithIcons().forEach(function(t){
    var c=el("div","chip"+(t.name===ST.panelType?" on":""),'<span class="ic">'+ic(t.icon||"tag")+"</span>"+esc(t.name));
    c.addEventListener("click",function(){ST.panelType=t.name;tch.querySelectorAll(".chip").forEach(function(x){x.classList.remove("on");});c.classList.add("on");});
    tch.appendChild(c);
  });
  tw.appendChild(tch);body.appendChild(tw);
  var nw=el("div");nw.style.marginBottom="16px";nw.appendChild(el("label","","Note /10 (re-cliquer pour enlever)"));
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
  var sw=el("div","chips small");sw.style.marginBottom="16px";
  function sc(get,set,label,icn){
    var c=el("div","chip"+(get()?" on":""),'<span class="ic">'+ic(icn)+"</span>"+label);
    c.addEventListener("click",function(){set(!get());c.classList.toggle("on",get());});
    sw.appendChild(c);
  }
  sc(function(){return ST.isFav;},function(v){ST.isFav=v;},"coup de c\u0153ur","heart");
  sc(function(){return ST.isEnc;},function(v){ST.isEnc=v;},"en cours","hourglass");
  sc(function(){return ST.isVoir;},function(v){ST.isVoir=v;},"\u00e0 voir","eye");
  body.appendChild(sw);
  var dIn=field("Date",el("input"));dIn.id="p-date";dIn.type="date";dIn.value=entry?(entry.dateFin||""):todayFR();
  var cIn=field("Commentaire rapide",el("textarea"));cIn.id="p-comment";cIn.value=entry?(entry.comment||""):"";
  var aw=el("div");aw.style.marginBottom="16px";aw.appendChild(el("label","","Affiche"));
  var ar=el("div");ar.style.display="flex";ar.style.gap="8px";ar.style.alignItems="center";
  var prev=el("img");prev.id="p-prev";prev.src=ST.panelPoster||NO_POSTER;prev.style.width="58px";prev.style.borderRadius="6px";
  var bU=el("button","icon");bU.innerHTML=ic("link");bU.title="Changer l'URL";
  var bI=el("button","icon");bI.innerHTML=ic("folder");bI.title="Importer";
  var fI=el("input");fI.type="file";fI.accept="image/*";fI.hidden=true;
  bU.addEventListener("click",function(){var u=prompt("URL de l'image :");if(u)setPoster(u);});
  bI.addEventListener("click",function(){fI.click();});
  fI.addEventListener("change",function(ev){var f=ev.target.files[0];if(f)fileToResized(f,500).then(setPoster);});
  ar.appendChild(prev);ar.appendChild(bU);ar.appendChild(bI);ar.appendChild(fI);
  aw.appendChild(ar);body.appendChild(aw);
  function setPoster(u){ST.panelPoster=u;makeThumb(u).then(function(t){ST.panelThumb=t;});prev.src=u;}
  if(mode==="avance"){
    var collGrid=el("div","adv-grid");
    var collBtn=el("button","adv-btn"+(ST.isInCollection?" on":""));
    collBtn.innerHTML='<span class="ic">'+ic("box")+'</span><span>Collection</span>';
    collBtn.addEventListener("click",function(){ST.isInCollection=!ST.isInCollection;collBtn.classList.toggle("on",ST.isInCollection);renderAdvFields();});
    collGrid.appendChild(collBtn);
    var platBtn=el("button","adv-btn"+(ST.advFields.plateforme?" on":""));
    platBtn.innerHTML='<span class="ic">'+ic("monitor")+'</span><span>Plateforme</span>';
    platBtn.addEventListener("click",function(){openPlateformeModal();});
    collGrid.appendChild(platBtn);
    var dateBtn=el("button","adv-btn"+(ST.advFields.dateAchat?" on":""));
    dateBtn.innerHTML='<span class="ic">'+ic("calendar")+'</span><span>Date achat</span>';
    dateBtn.addEventListener("click",function(){openDateAchatModal();});
    collGrid.appendChild(dateBtn);
    var edBtn=el("button","adv-btn"+(ST.advFields.edition?" on":""));
    edBtn.innerHTML='<span class="ic">'+ic("hash")+'</span><span>\u00c9dition</span>';
    edBtn.addEventListener("click",function(){openEditionModal();});
    collGrid.appendChild(edBtn);
    var bonusBtn=el("button","adv-btn"+(ST.advFields.bonus&&ST.advFields.bonus.length?" on":""));
    bonusBtn.innerHTML='<span class="ic">'+ic("gift")+'</span><span>Bonus</span>';
    bonusBtn.addEventListener("click",function(){openBonusModal();});
    collGrid.appendChild(bonusBtn);
    var supBtn=el("button","adv-btn"+(ST.advFields.support?" on":""));
    supBtn.innerHTML='<span class="ic">'+ic("box")+'</span><span>Support</span>';
    supBtn.addEventListener("click",function(){openSupportModal();});
    collGrid.appendChild(supBtn);
    var packBtn=el("button","adv-btn"+(ST.advFields.packaging?" on":""));
    packBtn.innerHTML='<span class="ic">'+ic("package-open")+'</span><span>Packaging</span>';
    packBtn.addEventListener("click",function(){openPackagingModal();});
    collGrid.appendChild(packBtn);
    var eanBtn=el("button","adv-btn"+(ST.advFields.ean?" on":""));
    eanBtn.innerHTML='<span class="ic">'+ic("barcode")+'</span><span>EAN</span>';
    eanBtn.addEventListener("click",function(){openEANModal();});
    collGrid.appendChild(eanBtn);
    var urlBtn=el("button","adv-btn"+(ST.advFields.url?" on":""));
    urlBtn.innerHTML='<span class="ic">'+ic("link")+'</span><span>URL</span>';
    urlBtn.addEventListener("click",function(){openURLModal();});
    collGrid.appendChild(urlBtn);
    body.appendChild(collGrid);
    var advZone=el("div");advZone.id="adv-zone";advZone.style.marginBottom="16px";
    body.appendChild(advZone);
    renderAdvFields();
    var searchLinks=el("div","search-links");
    searchLinks.appendChild(el("div","","Rechercher :"));
    var links=[
      {name:"Google",icon:"search",url:"https://www.google.com/search?q="+encodeURIComponent((entry?entry.titre:"")+" "+ST.panelType)},
      {name:"Steam",icon:"gamepad2",url:"https://store.steampowered.com/search/?term="+encodeURIComponent(entry?entry.titre:"")},
      {name:"TMDB",icon:"film",url:"https://www.themoviedb.org/search?query="+encodeURIComponent(entry?entry.titre:"")},
      {name:"SensCritique",icon:"heart",url:"https://www.senscritique.com/recherche?query="+encodeURIComponent(entry?entry.titre:"")}
    ];
    links.forEach(function(l){
      var a=el("a","search-link");a.href=l.url;a.target="_blank";a.innerHTML='<span class="ic">'+ic(l.icon)+'</span>'+l.name;
      searchLinks.appendChild(a);
    });
    body.appendChild(searchLinks);
  }
  setModal(entry?"Modifier":"Nouvelle "+OE+"uvre",body,[["Enregistrer","primary",saveCurrentEntry],["Annuler","",closeModal]]);
}
function renderAdvFields(){
  var zone=$("adv-zone");if(!zone)return;
  zone.innerHTML="";
  if(!ST.isInCollection)return;
  var fields=[];
  if(ST.advFields.plateforme)fields.push(["Plateforme",ST.advFields.plateforme]);
  if(ST.advFields.dateAchat)fields.push(["Date d'achat",ST.advFields.dateAchat]);
  if(ST.advFields.edition)fields.push(["\u00c9dition",ST.advFields.edition]);
  if(ST.advFields.bonus&&ST.advFields.bonus.length)fields.push(["Bonus",ST.advFields.bonus.join(", ")]);
  if(ST.advFields.support)fields.push(["Support",ST.advFields.support]);
  if(ST.advFields.packaging)fields.push(["Packaging",ST.advFields.packaging]);
  if(ST.advFields.ean)fields.push(["EAN",ST.advFields.ean]);
  if(ST.advFields.url)fields.push(["URL",ST.advFields.url]);
  if(!fields.length){zone.appendChild(el("div","empty","Aucune info collection."));return;}
  fields.forEach(function(f){
    var row=el("div","sline");
    row.innerHTML='<span>'+f[0]+'</span><b>'+esc(f[1])+'</b>';
    zone.appendChild(row);
  });
}
function openPlateformeModal(){
  var body=el("div");
  PLATFORMS.forEach(function(p){
    var btn=el("button","wide");
    btn.innerHTML='<span class="ic">'+ic(p.icon)+'</span>'+p.name;
    btn.style.justifyContent="flex-start";
    if(ST.advFields.plateforme===p.name)btn.classList.add("primary");
    btn.addEventListener("click",function(){ST.advFields.plateforme=p.name;closeModal();renderPanel(ST.editing);});
    body.appendChild(btn);
  });
  setModal("Plateforme",body,[["Annuler","",closeModal]]);
}
function openDateAchatModal(){
  var body=el("div");
  var inp=el("input");inp.type="date";inp.value=ST.advFields.dateAchat||todayFR();
  body.appendChild(inp);
  body.appendChild(el("div",null,"<br>"));
  var btn=el("button","primary","wide");btn.textContent="Valider";
  btn.addEventListener("click",function(){ST.advFields.dateAchat=inp.value;closeModal();renderPanel(ST.editing);});
  body.appendChild(btn);
  setModal("Date d'achat",body,[["Annuler","",closeModal]]);
}
function openEditionModal(){
  var body=el("div");
  var inp=el("input");inp.placeholder="\u00c9dition limit\u00e9e, Day One...";inp.value=ST.advFields.edition||"";
  body.appendChild(inp);
  body.appendChild(el("div",null,"<br>"));
  var btn=el("button","primary","wide");btn.textContent="Valider";
  btn.addEventListener("click",function(){ST.advFields.edition=inp.value.trim();closeModal();renderPanel(ST.editing);});
  body.appendChild(btn);
  setModal("\u00c9dition",body,[["Annuler","",closeModal]]);
}
function openBonusModal(){
  var body=el("div");
  BONUSES.forEach(function(b){
    var btn=el("button","wide");
    btn.innerHTML='<span class="ic">'+ic(b.icon)+'</span>'+b.name;
    btn.style.justifyContent="flex-start";
    var idx=ST.advFields.bonus.indexOf(b.name);
    if(idx>=0)btn.classList.add("primary");
    btn.addEventListener("click",function(){
      var i=ST.advFields.bonus.indexOf(b.name);
      if(i>=0)ST.advFields.bonus.splice(i,1);else ST.advFields.bonus.push(b.name);
      closeModal();openBonusModal();
    });
    body.appendChild(btn);
  });
  setModal("Bonus",body,[["Valider","",closeModal]]);
}
function openSupportModal(){
  var body=el("div");
  (SUPPORTS[ST.panelType]||SUPPORTS["Film"]).forEach(function(s){
    var btn=el("button","wide");btn.textContent=s;
    if(ST.advFields.support===s)btn.classList.add("primary");
    btn.addEventListener("click",function(){ST.advFields.support=s;closeModal();renderPanel(ST.editing);});
    body.appendChild(btn);
  });
  setModal("Support",body,[["Annuler","",closeModal]]);
}
function openPackagingModal(){
  var body=el("div");
  (PACKAGINGS[ST.panelType]||PACKAGINGS["Film"]).forEach(function(p){
    var btn=el("button","wide");btn.textContent=p;
    if(ST.advFields.packaging===p)btn.classList.add("primary");
    btn.addEventListener("click",function(){ST.advFields.packaging=p;closeModal();renderPanel(ST.editing);});
    body.appendChild(btn);
  });
  setModal("Packaging",body,[["Annuler","",closeModal]]);
}
function openEANModal(){
  var body=el("div");
  var inp=el("input");inp.placeholder="EAN";inp.inputMode="numeric";inp.value=ST.advFields.ean||"";
  body.appendChild(inp);
  body.appendChild(el("div",null,"<br>"));
  var scanBtn=el("button","wide");scanBtn.innerHTML='<span class="ic">'+ic("camera")+'</span>Scanner';
  scanBtn.addEventListener("click",function(){startEAN(function(code){inp.value=code;ST.advFields.ean=code;closeModal();renderPanel(ST.editing);});});
  body.appendChild(scanBtn);
  body.appendChild(el("div",null,"<br>"));
  var btn=el("button","primary","wide");btn.textContent="Valider";
  btn.addEventListener("click",function(){ST.advFields.ean=inp.value.trim();closeModal();renderPanel(ST.editing);});
  body.appendChild(btn);
  setModal("EAN",body,[["Annuler","",closeModal]]);
}
function openURLModal(){
  var body=el("div");
  var inp=el("input");inp.placeholder="URL de la fiche";inp.value=ST.advFields.url||"";
  body.appendChild(inp);
  body.appendChild(el("div",null,"<br>"));
  var btn=el("button","primary","wide");btn.textContent="Valider";
  btn.addEventListener("click",function(){ST.advFields.url=inp.value.trim();closeModal();renderPanel(ST.editing);});
  body.appendChild(btn);
  setModal("URL",body,[["Annuler","",closeModal]]);
}
async function saveCurrentEntry(){
  var titleEl=$("p-title");if(!titleEl){toast("Erreur formulaire.");return;}
  var title=titleEl.value.trim();
  if(!title){toast("Titre obligatoire.");return;}
  var type=ST.panelType;
  var entryId,dateAjout,base={};
  if(ST.editing){base=ST.editing;entryId=base.id;dateAjout=base.dateAjout;}
  else{
    var dup=null;
    for(var i=0;i<ST.entries.length;i++){if(ST.entries[i].type===type&&norm(ST.entries[i].titre)===norm(title)){dup=ST.entries[i];break;}}
    if(dup&&confirm("\u00AB"+dup.titre+"\u00BB existe d\u00e9j\u00e0.\nModifier l\u2019existante ?\n(Annuler = doublon)")){base=dup;entryId=dup.id;dateAjout=dup.dateAjout;}
    else{
      entryId=type+"_"+((ST.selectedItem&&ST.selectedItem.id)||Date.now());
      var exists=false;for(var k=0;k<ST.entries.length;k++){if(ST.entries[k].id===entryId){exists=true;break;}}
      if(exists)entryId+="_"+Date.now();
      dateAjout=new Date().toISOString();
    }
  }
  var e=Object.assign({},base);
  e.id=entryId;e.type=type;e.titre=title;
  e.note=ST.currentNote;e.isFavorite=ST.isFav;e.enCours=ST.isEnc;e.aVoir=ST.isVoir;e.inCollection=ST.isInCollection;
  var dateEl=$("p-date");
  e.dateFin=dateEl&&dateEl.value?formatDate(dateEl.value):"";
  var commentEl=$("p-comment");
  e.comment=commentEl?commentEl.value.trim():"";
  e.journal=ST.draftJournal;
  e.posterUrl=ST.panelPoster;
  e.posterThumb=ST.panelThumb||(await makeThumb(ST.panelPoster));
  if(ST.isInCollection){
    e.plateforme=ST.advFields.plateforme||null;
    e.dateAchat=ST.advFields.dateAchat||null;
    e.edition=ST.advFields.edition||null;
    e.bonus=ST.advFields.bonus||[];
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
    var t=$("p-title");if(t)t.value=e.titre;
    ST.panelType=e.type;
  },60);
}
function quickNoteOpen(e,preText){
  ST.qnEntry=e;ST.qnKind="time";
  var t=$("qn-title");if(t)t.textContent="Noter : "+e.titre;
  var txt=$("qn-text");if(txt)txt.value=preText||"";
  var w=$("qn-when");if(w)w.value="";
  var wr=$("qn-when-row");if(wr)wr.classList.remove("hidden");
  var er=$("qn-ep-row");if(er)er.classList.add("hidden");
  var k=$("qn-kind");if(!k)return;k.innerHTML="";
  [["time","horodat\u00e9","clock"],["free","libre","pen"],["ep","saison/\u00e9pis.","tv"]].forEach(function(x,i){
    var c=el("div","chip"+(i===0?" on":""),'<span class="ic">'+ic(x[2])+"</span>"+x[1]);
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
function quickNoteClose(){hideOverlay("qn-overlay");}
async function quickNoteSave(){
  var e=ST.qnEntry;if(!e)return;
  var txt=$("qn-text");var text=txt?txt.value.trim():"";
  if(!text&&ST.qnKind!=="ep"){toast("Entre un texte.");return;}
  if(!e.journal)e.journal=[];
  if(ST.qnKind==="time"){
    var w=$("qn-when");
    e.journal.push({kind:"time",ts:fmtWhen(w?w.value:""),text:text,at:Date.now()});
  }else if(ST.qnKind==="free"){
    e.journal.push({kind:"free",text:text,at:Date.now()});
  }else{
    var nn=$("qn-note");var ss=$("qn-s");var ee=$("qn-e");
    var noteVal=nn?nn.value:"";var sVal=ss?ss.value:"0";var eVal=ee?ee.value:"0";
    e.journal.push({kind:"ep",s:parseInt(sVal||"0",10),e:parseInt(eVal||"0",10),note:noteVal?Math.max(1,Math.min(10,parseInt(noteVal,10))):null,text:text,at:Date.now()});
  }
  await dbPut(e);
  if(navigator.vibrate)navigator.vibrate(15);
  toast("Entr\u00e9e ajout\u00e9e");
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
  body.appendChild(el("div",null,"<br>"));
  var saveBtn=el("button","primary");saveBtn.innerHTML='<span class="ic">'+ic("save")+"</span>Sauver";
  saveBtn.addEventListener("click",function(){localStorage.setItem("sheet_url",uIn.value.trim());toast("URL enregistr\u00e9e");});
  body.appendChild(saveBtn);
  body.appendChild(el("div",null,"<br>"));
  var copyBtn=el("button");copyBtn.innerHTML='<span class="ic">'+ic("clipboard-copy")+"</span>Copier (TSV)";
  copyBtn.addEventListener("click",function(){copyTSV();});
  body.appendChild(copyBtn);
  body.appendChild(el("div",null,"<br>"));
  var syncBtn=el("button");syncBtn.innerHTML='<span class="ic">'+ic("upload")+"</span>Sync Sheet";
  syncBtn.addEventListener("click",function(){syncSheet();});
  body.appendChild(syncBtn);
  setModal("Google Sheet",body,[["Fermer","",closeModal]]);
}
function openOptSave(){
  var body=el("div");
  var expBtn=el("button");expBtn.innerHTML='<span class="ic">'+ic("download")+"</span>Export JSON";
  expBtn.addEventListener("click",function(){exportJSON();});
  body.appendChild(expBtn);
  body.appendChild(el("div",null,"<br>"));
  var impBtn=el("button");impBtn.innerHTML='<span class="ic">'+ic("upload")+"</span>Import (fusion)";
  impBtn.addEventListener("click",function(){importJSON();});
  body.appendChild(impBtn);
  body.appendChild(el("div",null,"<br>"));
  var expTSVBtn=el("button");expTSVBtn.innerHTML='<span class="ic">'+ic("calendar-range")+"</span>Export journal (TSV)";
  expTSVBtn.addEventListener("click",function(){openExportTSVModal();});
  body.appendChild(expTSVBtn);
  body.appendChild(el("div",null,"<br>"));
  var lb=localStorage.getItem("last_backup");
  body.appendChild(el("div","","Dernier backup : <b>"+(lb?new Date(parseInt(lb,10)).toLocaleDateString("fr-FR"):"jamais")+"</b>"));
  body.appendChild(el("div",null,"<br>"));
  body.appendChild(el("label","","Alerte backup"));
  var pill=el("div","pill-sel");
  [[7,"7j"],[14,"14j"],[30,"30j"],[0,"Off"]].forEach(function(o){
    var s=settingsLoad();
    var b=el("button",o[0]===s.alertBackupDays?"on":"",o[1]);
    b.addEventListener("click",function(){s.alertBackupDays=o[0];settingsSave(s);pill.querySelectorAll("button").forEach(function(x){x.classList.remove("on");});b.classList.add("on");toast("Alerte : "+o[1]);});
    pill.appendChild(b);
  });
  body.appendChild(pill);
  setModal("Sauvegarde",body,[["Fermer","",closeModal]]);
}
function openExportTSVModal(){
  var body=el("div");
  var names=["Janvier","F\u00e9vrier","Mars","Avril","Mai","Juin","Juillet","Ao\u00fbt","Septembre","Octobre","Novembre","D\u00e9cembre"];
  var y=ST.calDate.getFullYear(),mo=ST.calDate.getMonth();
  body.appendChild(el("div","","<b>"+names[mo]+" "+y+"</b>"));
  body.appendChild(el("div",null,"<br>"));
  var btn1=el("button","wide");btn1.innerHTML='<span class="ic">'+ic("clipboard-copy")+"</span>Copier ce mois";
  btn1.addEventListener("click",function(){copyTSVMonth(y,mo+1);closeModal();});
  body.appendChild(btn1);
  body.appendChild(el("div",null,"<br>"));
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
  body.appendChild(el("div",null,"<br>"));
  body.appendChild(el("label","","Taille texte"));
  var fPill=el("div","pill-sel");
  [["s","S"],["m","M"],["l","L"]].forEach(function(o){
    var b=el("button",o[0]===s.fontSize?"on":"",o[1]);
    b.addEventListener("click",function(){s.fontSize=o[0];settingsSave(s);applySettings();fPill.querySelectorAll("button").forEach(function(x){x.classList.remove("on");});b.classList.add("on");});
    fPill.appendChild(b);
  });
  body.appendChild(fPill);
  body.appendChild(el("div",null,"<br>"));
  body.appendChild(el("label","","Animations"));
  var aTog=el("div","toggle"+(s.animOn?" on":""));
  aTog.addEventListener("click",function(){s.animOn=!s.animOn;settingsSave(s);applySettings();aTog.classList.toggle("on",s.animOn);});
  body.appendChild(aTog);
  body.appendChild(el("div",null,"<br>"));
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
  var byType={};
  var byStatus={fini:0,enc:0,voir:0};
  var byColl={phys:0,demat:0,no:0};
  var notes=[],sum=0,cnt=0;
  var totalEntries=0;
  var monthCount={};
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
    if(p){
      var key=p.y+"-"+pad2(p.mo);
      monthCount[key]=(monthCount[key]||0)+rev;
    }
  });
  var avg=cnt?(sum/cnt).toFixed(1):"\u2014";
  var maxNote=notes.length?Math.max.apply(null,notes):0;
  var minNote=notes.length?Math.min.apply(null,notes):0;
  var modeNote="\u2014";
  if(notes.length){
    var freq={};
    notes.forEach(function(n){freq[n]=(freq[n]||0)+1;});
    var maxFreq=0;
    for(var n in freq){if(freq[n]>maxFreq){maxFreq=freq[n];modeNote=n;}}
  }
  var mostActiveMonth=Object.keys(monthCount).sort(function(a,b){return monthCount[b]-monthCount[a];})[0]||"\u2014";
  var sec1=el("div","stats-section");
  sec1.appendChild(el("h4","","Par type"));
  CORE_TYPES.forEach(function(t){
    var n=byType[t.name]||0;
    var typeEntries=entries.filter(function(e){return e.type===t.name;});
    var typeSum=0,typeCnt=0;
    typeEntries.forEach(function(e){if(e.note!=null){typeSum+=e.note;typeCnt++;}});
    var typeAvg=typeCnt?(typeSum/typeCnt).toFixed(1):"\u2014";
    var row=el("div","stats-row");
    row.innerHTML='<span>'+esc(t.name)+'</span><span><b>'+n+'</b> <span class="dim">(moy '+typeAvg+')</span></span>';
    sec1.appendChild(row);
  });
  body.appendChild(sec1);
  var sec2=el("div","stats-section");
  sec2.appendChild(el("h4","","Par statut"));
  [["Fini",byStatus.fini],["En cours",byStatus.enc],["\u00c0 voir",byStatus.voir]].forEach(function(s){
    var row=el("div","stats-row");
    row.innerHTML='<span>'+s[0]+'</span><b>'+s[1]+'</b>';
    sec2.appendChild(row);
  });
  body.appendChild(sec2);
  var sec3=el("div","stats-section");
  sec3.appendChild(el("h4","","Collection"));
  [["Physique",byColl.phys],["D\u00e9mat\u00e9rialis\u00e9",byColl.demat],["Non poss\u00e9d\u00e9",byColl.no]].forEach(function(s){
    var row=el("div","stats-row");
    row.innerHTML='<span>'+s[0]+'</span><b>'+s[1]+'</b>';
    sec3.appendChild(row);
  });
  body.appendChild(sec3);
  var sec4=el("div","stats-section");
  sec4.appendChild(el("h4","","Notes"));
  [["Total \u0153uvres",total],["Moyenne g\u00e9n\u00e9rale",avg+"/10"],["Meilleure note",maxNote+"/10"],["Pire note",minNote+"/10"],["Note la plus fr\u00e9quente",modeNote+"/10"]].forEach(function(s){
    var row=el("div","stats-row");
    row.innerHTML='<span>'+s[0]+'</span><b>'+s[1]+'</b>';
    sec4.appendChild(row);
  });
  body.appendChild(sec4);
  var sec5=el("div","stats-section");
  sec5.appendChild(el("h4","","Activit\u00e9"));
  [["Total entr\u00e9es",totalEntries],["Mois le plus actif",mostActiveMonth.replace("-","/ ")+" ("+(monthCount[mostActiveMonth]||0)+")"]].forEach(function(s){
    var row=el("div","stats-row");
    row.innerHTML='<span>'+s[0]+'</span><b>'+s[1]+'</b>';
    sec5.appendChild(row);
  });
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
        ct.splice(i,1);saveCustomTypes(ct);closeModal();openOptTypes();
        var td=$("type-list");if(td)buildTypeDropdown();
      });
      row.appendChild(delBtn);
      body.appendChild(row);
    });
  }else{
    body.appendChild(el("div","empty","Aucun type personnalis\u00e9."));
  }
  body.appendChild(el("div",null,"<br>"));
  var nt=el("input");nt.placeholder="Nouveau type\u2026";
  body.appendChild(nt);
  body.appendChild(el("div",null,"<br>"));
  var addBtn=el("button","primary");addBtn.innerHTML='<span class="ic">'+ic("plus")+"</span>Ajouter";
  addBtn.addEventListener("click",function(){
    var v=nt.value.trim();if(!v)return;
    if(allTypes().indexOf(v)>=0){toast("Existe d\u00e9j\u00e0.");return;}
    ct.push({name:v});saveCustomTypes(ct);closeModal();openOptTypes();
    var td=$("type-list");if(td)buildTypeDropdown();
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
    b.addEventListener("click",function(){s.defaultType=t;settingsSave(s);ST.currentType=t;tPill.querySelectorAll("button").forEach(function(x){x.classList.remove("on");});b.classList.add("on");
      var td=$("type-list");if(td)buildTypeDropdown();
    });
    tPill.appendChild(b);
  });
  body.appendChild(tPill);
  body.appendChild(el("div",null,"<br>"));
  body.appendChild(el("label","","Tol\u00e9rance fautes"));
  var fTog=el("div","toggle"+(s.fuzzy?" on":""));
  fTog.addEventListener("click",function(){s.fuzzy=!s.fuzzy;settingsSave(s);fTog.classList.toggle("on",s.fuzzy);});
  body.appendChild(fTog);
  body.appendChild(el("div",null,"<br>"));
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
  body.appendChild(el("div",null,"<br>"));
  var cacheBtn=el("button");cacheBtn.innerHTML='<span class="ic">'+ic("trash")+"</span>Vider cache offline";
  cacheBtn.addEventListener("click",function(){if("caches"in window)caches.keys().then(function(k){k.forEach(function(x){caches.delete(x);});});toast("Cache vid\u00e9");});
  body.appendChild(cacheBtn);
  body.appendChild(el("div",null,"<br>"));
  body.appendChild(el("div","","R\u00e9seau : <b>"+(navigator.onLine?"connect\u00e9":"hors-ligne")+"</b>"));
  setModal("Application",body,[["Fermer","",closeModal]]);
}
function openOptAbout(){
  var body=el("div");
  body.appendChild(el("div","","Version : <b>V7.0</b>"));
  body.appendChild(el("div",null,"<br>"));
  body.appendChild(el("div","","Build : <b>"+new Date(BUILD).toLocaleString("fr-FR",{timeZone:"Europe/Paris"})+"</b>"));
  body.appendChild(el("div",null,"<br>"));
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
    });
  });
  body.appendChild(clearBtn);
  body.appendChild(el("div",null,"<br>"));
  var resetBtn=el("button");resetBtn.innerHTML='<span class="ic">'+ic("x")+"</span>R\u00e9initialiser r\u00e9glages";
  resetBtn.addEventListener("click",function(){
    showConfirm("R\u00e9initialiser","Remettre tous les r\u00e9glages par d\u00e9faut ?",function(){
      localStorage.removeItem("settings");settingsSave(Object.assign({},SETTINGS_DEFAULTS));applySettings();toast("R\u00e9glages r\u00e9initialis\u00e9s");
    });
  });
  body.appendChild(resetBtn);
  setModal("Danger",body,[["Fermer","",closeModal]]);
}