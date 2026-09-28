var ST={entries:[],view:"search",colFilter:"all",colQuery:"",colSort:"date-desc",colNoteMin:0,recapDate:new Date(),calOpen:false,calDate:new Date(),editing:null,selectedItem:null,currentType:"Film",panelType:"Film",currentNote:null,isFav:false,isEnc:false,isVoir:false,draftJournal:[],panelPoster:"",panelThumb:"",qnEntry:null,qnKind:"time",recent:[],menuEntry:null,fluxFilter:{types:[],status:[],noteRange:null,ownedOnly:false,search:"",sort:"date-desc"},currentReaderEntry:null,currentReaderJournalIdx:null};
var overlayStack=[];
var FOOT_IC={"Modifier":"edit","Noter":"plus","Fermer":"x","Enregistrer":"save","Annuler":"x","Ajouter":"plus","Copier":"clipboard-copy","Supprimer":"trash-2"};
function el(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d;}
function emptyBox(icn,txt){var d=el("div","empty");d.innerHTML='<span class="ic">'+ic(icn)+"</span>"+esc(txt);return d;}
function toast(m,t){var e=document.getElementById("toast");e.textContent=m;e.classList.add("show");setTimeout(function(){e.classList.remove("show");},t||1800);}
function showOverlay(id){var e=document.getElementById(id);e.classList.add("on");overlayStack.push(id);try{history.pushState(null,"");}catch(err){}}
function hideOverlay(id){var e=document.getElementById(id);e.classList.remove("on");var i=overlayStack.indexOf(id);if(i>=0)overlayStack.splice(i,1);}
window.addEventListener("popstate",function(){var id=overlayStack[overlayStack.length-1];if(id){document.getElementById(id).classList.remove("on");overlayStack.pop();}});
function closeModal(){hideOverlay("modal-overlay");document.getElementById("m-body").innerHTML="";document.getElementById("m-foot").innerHTML="";ST.editing=null;}
function setModal(title,bodyNode,foot){
  document.getElementById("m-title").textContent=title;
  var b=document.getElementById("m-body");b.innerHTML="";b.appendChild(bodyNode);
  var f=document.getElementById("m-foot");f.innerHTML="";
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
  document.getElementById("confirm-title").textContent=title;
  document.getElementById("confirm-body").innerHTML='<p style="font-size:14px;line-height:1.6;">'+esc(msg)+'</p>';
  var f=document.getElementById("confirm-foot");f.innerHTML="";
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
  document.getElementById("menu-title").textContent=e.titre;
  var b=document.getElementById("menu-body");b.innerHTML="";
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
    var meta=e.type+" \u2022 "+(e.note!=null?e.note+"/10":"\u2014");
    if(e.dateFin)meta+=" \u2022 "+esc(formatDate(e.dateFin));
    col.appendChild(el("div","hmeta",meta));
    var lines=journalLines(e);
    if(lines.length)col.appendChild(el("div","hsum","\u201C"+esc(truncate(lines[lines.length-1],120))+"\u201D"));
    card.appendChild(col);
    card.addEventListener("click",function(ev){if(ev.target.closest("button"))return;showDetail(e);});
    return card;
  }
  var cell=el("div","gcell");cell.style.animationDelay=(Math.min(i,12)*0.03)+"s";
  cell.appendChild(renderPoster(e));
  cell.appendChild(el("div","gtitle",esc(e.titre)));
  cell.addEventListener("click",function(ev){if(ev.target.closest("button"))return;showDetail(e);});
  return cell;
}
async function renderCollection(){
  var list=ST.entries.slice();
  var q=norm(ST.colQuery);
  if(q)list=list.filter(function(e){return norm(e.titre).indexOf(q)>=0||norm(e.type).indexOf(q)>=0||norm(e.sousTitre||"").indexOf(q)>=0||norm(descriptionOf(e)).indexOf(q)>=0||norm(e.support||"").indexOf(q)>=0||norm(e.packaging||"").indexOf(q)>=0;});
  if(ST.colFilter==="fav")list=list.filter(function(e){return e.isFavorite;});
  if(ST.colFilter==="enc")list=list.filter(function(e){return e.enCours;});
  if(ST.colFilter==="voir")list=list.filter(function(e){return e.aVoir;});
  if(ST.colFilter==="phys")list=list.filter(function(e){return e.inCollection;});
  if(ST.colNoteMin>0)list=list.filter(function(e){return e.note!=null&&e.note>=ST.colNoteMin;});
  var byDate=function(e){var p=parseDateFR(e.dateFin);return p?p.y*10000+p.mo*100+p.d:0;};
  if(ST.colSort==="date-desc")list.sort(function(a,b){return byDate(b)-byDate(a)||(b.dateAjout||"").localeCompare(a.dateAjout||"");});
  if(ST.colSort==="date-asc")list.sort(function(a,b){return byDate(a)-byDate(b);});
  if(ST.colSort==="note-desc")list.sort(function(a,b){return (b.note!=null?b.note:-1)-(a.note!=null?a.note:-1);});
  if(ST.colSort==="titre-asc")list.sort(function(a,b){return a.titre.localeCompare(b.titre,"fr");});
  if(ST.colSort==="type")list.sort(function(a,b){return a.type.localeCompare(b.type,"fr")||a.titre.localeCompare(b.titre,"fr");});
  var stats={},enc=0,voir=0,fav=0,phys=0,sum=0,cnt=0;
  ST.entries.forEach(function(e){stats[e.type]=(stats[e.type]||0)+1;if(e.enCours)enc++;if(e.aVoir)voir++;if(e.isFavorite)fav++;if(e.inCollection)phys++;if(e.note!=null){sum+=e.note;cnt++;}});
  var sh=Object.keys(stats).map(function(t){return '<div class="sline"><span>'+esc(t)+'</span><b>'+stats[t]+"</b></div>";}).join("");
  sh+='<div class="sline"><span>En cours / \u00e0 voir / c\u0153urs / collection</span><b>'+enc+" / "+voir+" / "+fav+" / "+phys+"</b></div>";
  sh+='<div class="sline"><span>Note moyenne</span><b>'+(cnt?(sum/cnt).toFixed(1):"\u2014")+"/10</b></div>";
  document.getElementById("col-stats").innerHTML=sh||'<div class="empty">Aucune donn\u00e9e</div>';
  var top=ST.entries.filter(function(e){return e.note!=null;}).sort(function(a,b){return b.note-a.note;}).slice(0,5);
  document.getElementById("col-top").innerHTML=top.map(function(e,i){return '<div class="sline"><span>'+(i+1)+". "+esc(e.titre)+"</span><b>"+e.note+"/10</b></div>";}).join("")||'<div class="empty">Pas encore de notes</div>';
  var grid=document.getElementById("col-grid");
  var s2=settingsLoad();
  grid.className="grid"+(s2.colView==="list"?" list":"");
  grid.innerHTML="";
  if(!list.length){grid.appendChild(emptyBox("library","Aucune "+OE+"uvre. Ajoute ta premi\u00e8re depuis Recherche."));return;}
  list.forEach(function(e,i){grid.appendChild(collectionCard(e,i));});
}
function showDetail(e){
  var body=el("div");
  var head=el("div","dhead");
  head.appendChild(renderPoster(e,false));
  var info=el("div","dinfo");
  info.appendChild(el("h2","",esc(e.titre)));
  var tags=el("div","tags");
  var noteBtn=el("span","tag note",(e.note!=null?e.note+"/10":"\u2014/10"));
  noteBtn.style.cursor="pointer";
  noteBtn.title="Modifier la note";
  noteBtn.addEventListener("click",function(){openNoteEditor(e);});
  tags.appendChild(noteBtn);
  tags.appendChild(el("span","tag",esc(e.type)));
  if(e.enCours)tags.appendChild(el("span","tag enc","en cours"));
  if(e.aVoir)tags.appendChild(el("span","tag voir","\u00e0 voir"));
  if(e.isFavorite)tags.appendChild(el("span","tag fav","coup de c\u0153ur"));
  if(e.dateFin)tags.appendChild(el("span","tag",esc(formatDate(e.dateFin))));
  info.appendChild(tags);
  if(e.inCollection){
    var ph=el("div","phys");
    ph.innerHTML='<span class="ic">'+ic("box")+"</span><span>"+esc(e.support||"?")+" \u2022 "+esc(e.packaging||"?")+(e.ean?" \u2022 EAN "+esc(e.ean):"")+"</span>";
    info.appendChild(ph);
    if(e.url){
      var lk=el("div","phys");lk.style.cursor="pointer";
      lk.innerHTML='<span class="ic">'+ic("external")+'</span><span style="color:var(--acc);">Ouvrir le lien</span>';
      lk.addEventListener("click",function(){window.open(e.url,"_blank");});
      info.appendChild(lk);
    }
  }
  head.appendChild(info);body.appendChild(head);
  body.appendChild(el("h3","","Journal de bord"));
  var jl=e.journal||(e.comment?[{kind:"free",text:e.comment}]:[]);
  if(jl.length){
    var tl=el("div","tl");
    jl.forEach(function(x,idx){
      var t=el("div","tl-e");
      var tag=x.kind==="time"?x.ts:(x.kind==="ep"?("S"+pad2(x.s)+"E"+pad2(x.e)+(x.note!=null?" \u2022 "+x.note+"/10":"")):"libre");
      t.appendChild(el("div","w",esc(tag)));
      var xx=el("div","x",esc(x.text||""));
      xx.addEventListener("click",function(){openReaderForEntry(e,idx);});
      t.appendChild(xx);
      tl.appendChild(t);
    });
    body.appendChild(tl);
  }else{
    body.appendChild(emptyBox("pen","Pas encore de journal. Utilise \u00AB Noter vite \u00BB."));
  }
  setModal(e.titre,body,[["Modifier","primary",function(){renderPanel(e);}],["Noter","",function(){quickNoteOpen(e);}],["Fermer","",closeModal]]);
}
function openNoteEditor(e){
  var body=el("div");
  body.appendChild(el("div","","Note actuelle : <b>"+(e.note!=null?e.note+"/10":"aucune")+"</b>"));
  var ng=el("div","note-grid");
  for(var n=1;n<=10;n++){
    (function(n){
      var b=el("button","note-btn"+(e.note===n?" on note-"+n:""),String(n));
      b.addEventListener("click",function(){
        e.note=n;
        dbPut(e).then(function(){toast("Note mise \u00e0 "+n+"/10");refreshAll();closeModal();});
      });
      ng.appendChild(b);
    })(n);
  }
  body.appendChild(ng);
  var clearBtn=el("button","wide");clearBtn.textContent="Retirer la note";
  clearBtn.addEventListener("click",function(){e.note=null;dbPut(e).then(function(){toast("Note retir\u00e9e");refreshAll();closeModal();});});
  body.appendChild(clearBtn);
  setModal("Modifier la note",body,[["Fermer","",closeModal]]);
}
function openReaderForEntry(entry,idx){
  ST.currentReaderEntry=entry;
  ST.currentReaderJournalIdx=idx;
  var jl=entry.journal||(entry.comment?[{kind:"free",text:entry.comment}]:[]);
  var x=jl[idx]||{text:""};
  var tag=x.kind==="time"?x.ts:(x.kind==="ep"?("S"+pad2(x.s)+"E"+pad2(x.e)+(x.note!=null?" \u2022 "+x.note+"/10":"")):"libre");
  document.getElementById("r-title").textContent=entry.titre;
  document.getElementById("r-sub").textContent=tag;
  document.getElementById("r-body").textContent=x.text||"";
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
    ST.panelPoster=entry.posterUrl||"";
    ST.panelThumb=entry.posterThumb||"";
    var srcJ=entry.journal||(entry.comment?[{kind:"free",text:entry.comment}]:[]);
    ST.draftJournal=JSON.parse(JSON.stringify(srcJ));
  }else{
    ST.panelType=ST.currentType;
    ST.currentNote=null;
    ST.isFav=false;
    ST.isEnc=false;
    ST.isVoir=false;
    ST.panelPoster=(ST.selectedItem&&ST.selectedItem.poster)||"";
    ST.panelThumb="";
    ST.draftJournal=[];
  }
  var s=settingsLoad();var mode=s.panelMode||"simple";
  var body=el("div");
  var seg=el("div","seg");
  ["simple","avance"].forEach(function(m){
    var b=el("button",mode===m?"on":"",m==="simple"?"Simple":"Avanc\u00e9");
    b.addEventListener("click",function(){s.panelMode=m;settingsSave(s);renderPanel(ST.editing);});
    seg.appendChild(b);
  });
  body.appendChild(seg);
  function field(label,node){var w=el("div");w.style.marginBottom="12px";w.appendChild(el("label","",label));w.appendChild(node);body.appendChild(w);return node;}
  var tIn=field("Titre",el("input"));tIn.id="p-title";tIn.value=entry?entry.titre:((ST.selectedItem&&ST.selectedItem.title)||"");
  var tw=el("div");tw.style.marginBottom="12px";tw.appendChild(el("label","","Type"));
  var tch=el("div","chips small");
  allTypesWithIcons().forEach(function(t){
    var c=el("div","chip"+(t.name===ST.panelType?" on":""),'<span class="ic">'+ic(t.icon||"tag")+"</span>"+esc(t.name));
    c.addEventListener("click",function(){ST.panelType=t.name;tch.querySelectorAll(".chip").forEach(function(x){x.classList.remove("on");});c.classList.add("on");});
    tch.appendChild(c);
  });
  tw.appendChild(tch);body.appendChild(tw);
  var nw=el("div");nw.style.marginBottom="12px";nw.appendChild(el("label","","Note /10 (re-cliquer pour enlever)"));
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
  var sw=el("div","chips small");sw.style.marginBottom="12px";
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
  var aw=el("div");aw.style.marginBottom="12px";aw.appendChild(el("label","","Affiche"));
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
    var sIn=field("D\u00e9tail (saison / tome / piste\u2026)",el("input"));sIn.id="p-sub";sIn.value=entry?(entry.sousTitre||""):"";
    var jw=el("div");jw.style.marginBottom="12px";jw.appendChild(el("label","","Journal de bord"));
    var jb=el("div","chips small");
    [["time","horodat\u00e9","clock"],["free","libre","pen"],["ep","saison/\u00e9pis.","tv"]].forEach(function(k){
      var c=el("div","chip",'<span class="ic">'+ic(k[2])+"</span>"+k[1]);
      c.addEventListener("click",function(){openDraft(k[0],jw);});
      jb.appendChild(c);
    });
    jw.appendChild(jb);
    var jlist=el("div");jlist.id="p-jlist";
    jw.appendChild(jlist);body.appendChild(jw);renderJList(jlist);
    var pw=el("div");pw.style.marginBottom="12px";pw.appendChild(el("label","","Collection"));
    var pOn=!!(entry&&entry.inCollection);
    var pchk=el("div","chip"+(pOn?" on":""),'<span class="ic">'+ic("box")+"</span>dans ma collection");
    var pbox=el("div");pbox.style.display=pOn?"block":"none";pbox.style.marginTop="8px";
    pchk.addEventListener("click",function(){pOn=!pOn;pchk.classList.toggle("on",pOn);pbox.style.display=pOn?"block":"none";});
    pw.appendChild(pchk);
    var quoiSel=el("div","custom-select");quoiSel.id="p-quoi-select";
    var quoiBtn=el("div","custom-select-btn");quoiBtn.innerHTML='<span class="ic">'+ic("box")+'</span><span id="p-quoi-label">'+(entry&&entry.support?entry.support:"Quoi ?")+'</span><span class="chev ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></span>';
    var quoiList=el("div","custom-select-list");quoiList.id="p-quoi-list";
    quoiSel.appendChild(quoiBtn);quoiSel.appendChild(quoiList);
    var commentSel=el("div","custom-select");commentSel.id="p-comment-select";
    var commentBtn=el("div","custom-select-btn");commentBtn.innerHTML='<span class="ic">'+ic("box")+'</span><span id="p-comment-label">'+(entry&&entry.packaging?entry.packaging:"Comment ?")+'</span><span class="chev ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></span>';
    var commentList=el("div","custom-select-list");commentList.id="p-comment-list";
    commentSel.appendChild(commentBtn);commentSel.appendChild(commentList);
    pbox.appendChild(quoiSel);pbox.appendChild(commentSel);
    var ean=el("input");ean.id="p-ean";ean.placeholder="EAN";ean.inputMode="numeric";ean.value=entry?(entry.ean||""):"";
    var escan=el("button");escan.innerHTML='<span class="ic">'+ic("camera")+"</span>Scanner";
    escan.addEventListener("click",function(){startEAN(function(code){ean.value=code;toast("EAN : "+code);});});
    var url=el("input");url.id="p-url";url.placeholder="URL de la fiche";url.value=entry?(entry.url||""):"";
    pbox.appendChild(ean);pbox.appendChild(escan);pbox.appendChild(url);
    pw.appendChild(pbox);body.appendChild(pw);
    setTimeout(function(){
      buildCustomSelect("p-quoi-select","p-quoi-list","p-quoi-label",SUPPORTS[ST.panelType]||SUPPORTS["Film"],entry?entry.support:null);
      buildCustomSelect("p-comment-select","p-comment-list","p-comment-label",PACKAGINGS[ST.panelType]||PACKAGINGS["Film"],entry?entry.packaging:null);
    },100);
    if(entry){
      var dup=el("button","wide");dup.innerHTML='<span class="ic">'+ic("duplicate")+"</span>Dupliquer cette fiche";dup.style.marginTop="8px";
      dup.addEventListener("click",function(){duplicateEntry(entry);});
      body.appendChild(dup);
    }
  }
  setModal(entry?"Modifier":"Nouvelle "+OE+"uvre",body,[["Enregistrer","primary",saveCurrentEntry],["Annuler","",closeModal]]);
}
function buildCustomSelect(selectId,listId,labelId,values,initial){
  var btn=document.querySelector("#"+selectId+" .custom-select-btn");
  var list=document.getElementById(listId);
  var label=document.getElementById(labelId);
  var selected=initial||null;
  if(selected)label.textContent=selected;
  function renderList(){
    list.innerHTML="";
    var libre=document.createElement("div");
    libre.className="custom-select-item libre";
    libre.textContent="+ Entr\u00e9e libre...";
    libre.addEventListener("click",function(e){
      e.stopPropagation();
      var inputRow=document.createElement("div");
      inputRow.className="libre-input";
      var input=document.createElement("input");
      input.type="text";
      input.placeholder="Ta valeur...";
      var okBtn=document.createElement("button");
      okBtn.textContent="OK";
      okBtn.className="primary";
      okBtn.addEventListener("click",function(){
        var val=input.value.trim();
        if(val){
          values.push(val);
          selected=val;
          label.textContent=val;
          renderList();
        }
      });
      input.addEventListener("keydown",function(e){if(e.key==="Enter")okBtn.click();});
      inputRow.appendChild(input);
      inputRow.appendChild(okBtn);
      libre.replaceWith(inputRow);
      input.focus();
    });
    list.appendChild(libre);
    values.forEach(function(v){
      var item=document.createElement("div");
      item.className="custom-select-item"+(selected===v?" active":"");
      item.textContent=v;
      item.addEventListener("click",function(){
        selected=v;
        label.textContent=v;
        list.querySelectorAll(".custom-select-item").forEach(function(x){x.classList.remove("active");});
        item.classList.add("active");
        list.classList.remove("open");
      });
      list.appendChild(item);
    });
  }
  renderList();
  btn.addEventListener("click",function(e){e.stopPropagation();list.classList.toggle("open");});
  document.addEventListener("click",function(e){
    var sel=document.getElementById(selectId);
    if(sel&&!sel.contains(e.target)){list.classList.remove("open");}
  });
}
function openDraft(kind,parent){
  var old=document.getElementById("p-jdraft");if(old)old.remove();
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
  var act=el("div","row2");act.style.marginTop="8px";
  var ok=el("button","primary",'<span class="ic">'+ic("plus")+"</span>Ajouter");
  var no=el("button",'<span class="ic">'+ic("x")+"</span>Annuler");
  act.appendChild(ok);act.appendChild(no);d.appendChild(act);parent.appendChild(d);
  ok.addEventListener("click",function(){
    var text=ta.value.trim();
    if(!text&&kind!=="ep"){toast("Entre un texte.");return;}
    if(kind==="time"){
      var wv=document.getElementById("jd-when").value;
      ST.draftJournal.push({kind:"time",ts:fmtWhen(wv),text:text,at:Date.now()});
    }else if(kind==="free"){
      ST.draftJournal.push({kind:"free",text:text,at:Date.now()});
    }else{
      var nn=document.getElementById("jd-note").value;
      var ss=parseInt(document.getElementById("jd-s").value||"0",10);
      var ee=parseInt(document.getElementById("jd-e").value||"0",10);
      ST.draftJournal.push({kind:"ep",s:ss,e:ee,note:nn?Math.max(1,Math.min(10,parseInt(nn,10))):null,text:text,at:Date.now()});
    }
    d.remove();renderJList(document.getElementById("p-jlist"));
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
    var del=el("button","icon");del.innerHTML=ic("trash");
    del.addEventListener("click",function(){ST.draftJournal.splice(i,1);renderJList(c);});
    row.appendChild(b);row.appendChild(del);
    c.appendChild(row);
  });
}
async function saveCurrentEntry(){
  var title=document.getElementById("p-title").value.trim();
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
  var subEl=document.getElementById("p-sub");
  e.sousTitre=subEl?subEl.value.trim():"";
  e.note=ST.currentNote;e.isFavorite=ST.isFav;e.enCours=ST.isEnc;e.aVoir=ST.isVoir;
  var dateVal=document.getElementById("p-date").value;
  e.dateFin=dateVal?formatDate(dateVal):"";
  e.comment=document.getElementById("p-comment").value.trim();
  e.journal=ST.draftJournal;
  e.posterUrl=ST.panelPoster;
  e.posterThumb=ST.panelThumb||(await makeThumb(ST.panelPoster));
  var quoiLabel=document.getElementById("p-quoi-label");
  var commentLabel=document.getElementById("p-comment-label");
  if(quoiLabel&&commentLabel){
    var quoiVal=quoiLabel.textContent;
    var commentVal=commentLabel.textContent;
    e.inCollection=(quoiVal!=="Quoi ?"||commentVal!=="Comment ?");
    if(e.inCollection){
      e.support=(quoiVal!=="Quoi ?")?quoiVal:null;
      e.packaging=(commentVal!=="Comment ?")?commentVal:null;
      var eanEl=document.getElementById("p-ean");
      var urlEl=document.getElementById("p-url");
      e.ean=eanEl?eanEl.value.trim():"";
      e.url=urlEl?urlEl.value.trim():"";
    }
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
    var t=document.getElementById("p-title");if(t)t.value=e.titre;
    ST.panelType=e.type;
  },60);
}
function quickNoteOpen(e,preText){
  ST.qnEntry=e;ST.qnKind="time";
  document.getElementById("qn-title").textContent="Noter : "+e.titre;
  document.getElementById("qn-text").value=preText||"";
  document.getElementById("qn-when").value="";
  document.getElementById("qn-when-row").classList.remove("hidden");
  document.getElementById("qn-ep-row").classList.add("hidden");
  var k=document.getElementById("qn-kind");k.innerHTML="";
  [["time","horodat\u00e9","clock"],["free","libre","pen"],["ep","saison/\u00e9pis.","tv"]].forEach(function(x,i){
    var c=el("div","chip"+(i===0?" on":""),'<span class="ic">'+ic(x[2])+"</span>"+x[1]);
    c.addEventListener("click",function(){
      ST.qnKind=x[0];
      k.querySelectorAll(".chip").forEach(function(y){y.classList.remove("on");});
      c.classList.add("on");
      document.getElementById("qn-ep-row").classList.toggle("hidden",x[0]!=="ep");
      document.getElementById("qn-when-row").classList.toggle("hidden",x[0]!=="time");
    });
    k.appendChild(c);
  });
  showOverlay("qn-overlay");
}
function quickNoteClose(){hideOverlay("qn-overlay");}
async function quickNoteSave(){
  var e=ST.qnEntry;if(!e)return;
  var text=document.getElementById("qn-text").value.trim();
  if(!text&&ST.qnKind!=="ep"){toast("Entre un texte.");return;}
  if(!e.journal)e.journal=[];
  if(ST.qnKind==="time"){
    var wv=document.getElementById("qn-when").value;
    e.journal.push({kind:"time",ts:fmtWhen(wv),text:text,at:Date.now()});
  }else if(ST.qnKind==="free"){
    e.journal.push({kind:"free",text:text,at:Date.now()});
  }else{
    var nn=document.getElementById("qn-note").value;
    var ss=parseInt(document.getElementById("qn-s").value||"0",10);
    var ee=parseInt(document.getElementById("qn-e").value||"0",10);
    e.journal.push({kind:"ep",s:ss,e:ee,note:nn?Math.max(1,Math.min(10,parseInt(nn,10))):null,text:text,at:Date.now()});
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
  var hasText=it.x.text&&it.x.text.trim().length>0;
  if(hasText){
    if(it.x.note!=null){
      b.appendChild(el("div","ftime",esc(tag)+" \u2022 "+it.x.note+"/10"));
    }else{
      b.appendChild(el("div","ftime",esc(tag)));
    }
    b.appendChild(el("div","ftext",esc(it.x.text)));
    var delBtn=el("button","icon flux-delete");
    delBtn.innerHTML=ic("trash-2");
    delBtn.addEventListener("click",function(ev){
      ev.stopPropagation();
      showConfirm("Supprimer cette entr\u00e9e ?","Cette action est irr\u00e9versible.",function(){
        it.e.journal.splice(it.idx,1);
        dbPut(it.e).then(function(){toast("Entr\u00e9e supprim\u00e9e");refreshAll();});
      });
    });
    b.appendChild(delBtn);
  }else{
    if(it.x.note!=null){
      b.appendChild(el("div","ftime",esc(tag)));
      b.appendChild(el("div","fnote-big",it.x.note+"/10"));
    }else{
      b.appendChild(el("div","ftime",esc(tag)));
      b.appendChild(el("div","ftext","(sans texte)"));
    }
  }
  b.appendChild(el("div","fwork",esc(it.e.titre)));
  item.appendChild(b);
  return item;
}
async function renderJournal(){
  var enc=ST.entries.filter(function(e){return e.enCours;});
  var row=document.getElementById("j-encours");row.innerHTML="";
  if(enc.length){
    enc.forEach(function(e){
      var m=el("div","mini");
      m.appendChild(renderPoster(e,false));
      m.appendChild(el("div","t",esc(e.titre)));
      var l=journalLines(e);
      m.appendChild(el("div","s",esc(truncate(l.length?l[l.length-1]:"En cours\u2026",40))));
      m.addEventListener("click",function(){showDetail(e);});
      row.appendChild(m);
    });
  }else{
    row.appendChild(emptyBox("hourglass","Rien en cours."));
  }
  var y=ST.calDate.getFullYear(),mo=ST.calDate.getMonth();
  var names=["Janvier","F\u00e9vrier","Mars","Avril","Mai","Juin","Juillet","Ao\u00fbt","Septembre","Octobre","Novembre","D\u00e9cembre"];
  document.getElementById("bilan-title").textContent=names[mo]+" "+y;
  var feed=getFluxEntries();
  var f=document.getElementById("j-feed");f.innerHTML="";
  if(!feed.length)f.appendChild(emptyBox("book","Aucune entr\u00e9e ce mois-ci."));
  feed.slice(0,60).forEach(function(it){f.appendChild(renderFluxItem(it));});
  if(ST.calOpen)renderCalendar();
}
function renderCalendar(){
  var cal=document.getElementById("j-cal");cal.innerHTML="";
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
      x.addEventListener("click",function(){showDetail(e);});
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
    row.addEventListener("click",function(){showDetail(e);});
    body.appendChild(row);
  });
  setModal(OEC+"uvres du "+pad2(d)+"/"+pad2(mo+1)+"/"+y,body,[["Fermer","",closeModal]]);
}
function renderOptions(){
  var grid=document.getElementById("opt-grid");
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
        ct.splice(i,1);saveCustomTypes(ct);closeModal();openOptTypes();buildTypeChips();
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
    ct.push({name:v});saveCustomTypes(ct);closeModal();openOptTypes();buildTypeChips();
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
    b.addEventListener("click",function(){s.defaultType=t;settingsSave(s);ST.currentType=t;tPill.querySelectorAll("button").forEach(function(x){x.classList.remove("on");});b.classList.add("on");buildTypeChips();});
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