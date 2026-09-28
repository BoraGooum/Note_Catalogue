var ST={entries:[],view:"search",colFilter:"all",colQuery:"",colSort:"date-desc",colNoteMin:0,recapDate:new Date(),calOpen:false,calDate:new Date(),editing:null,selectedItem:null,currentType:"Film",panelType:"Film",currentNote:null,isFav:false,isEnc:false,isVoir:false,draftJournal:[],panelPoster:"",panelThumb:"",qnEntry:null,qnKind:"time",recent:[],menuEntry:null};
var overlayStack=[];
function el(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d;}
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
  for(var i=0;i<list.length;i++){var bt=list[i];var btn=el("button",bt[1]||"",bt[0]);btn.addEventListener("click",bt[2]);f.appendChild(btn);}
  showOverlay("modal-overlay");
}
async function refreshAll(){ST.entries=await dbAll();renderCollection();renderJournal();}
function neonClass(e){if(e.aVoir)return "n-voir";if(e.enCours)return "n-enc";return "n-fini";}
function statIcon(e){if(e.aVoir)return ic("eye");if(e.enCours)return ic("hourglass");return ic("check");}
function renderPoster(e,withMenu){
  var p=el("div","poster "+neonClass(e));
  var img=el("img","art");img.src=e.posterThumb||e.posterUrl||NO_POSTER;img.alt="";img.loading="lazy";
  p.appendChild(img);
  if(e.note!=null)p.appendChild(el("div","pnote",e.note+"/10"));
  var st=el("div","pstat");st.innerHTML=statIcon(e);p.appendChild(st);
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
  items.push(["trash","Supprimer",function(){closeMenu();if(confirm("Supprimer "+e.titre+" ?")){dbDelete(e.id).then(function(){toast("Supprim\u00e9");refreshAll();});}},"danger"]);
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
  sh+='<div class="sline"><span>En cours / \u00e0 voir / c\u0153urs / physiques</span><b>'+enc+" / "+voir+" / "+fav+" / "+phys+"</b></div>";
  sh+='<div class="sline"><span>Note moyenne</span><b>'+(cnt?(sum/cnt).toFixed(1):"\u2014")+"/10</b></div>";
  document.getElementById("col-stats").innerHTML=sh||'<div class="empty">Aucune donn\u00e9e</div>';
  var top=ST.entries.filter(function(e){return e.note!=null;}).sort(function(a,b){return b.note-a.note;}).slice(0,5);
  document.getElementById("col-top").innerHTML=top.map(function(e,i){return '<div class="sline"><span>'+(i+1)+". "+esc(e.titre)+"</span><b>"+e.note+"/10</b></div>";}).join("")||'<div class="empty">Pas encore de notes</div>';
  var grid=document.getElementById("col-grid");
  var s2=settingsLoad();
  grid.className="grid"+(s2.colView==="list"?" list":"");
  grid.innerHTML="";
  if(!list.length){grid.appendChild(el("div","empty","Aucune "+OE+"uvre. Ajoute ta premi\u00e8re depuis Recherche."));return;}
  list.forEach(function(e,i){grid.appendChild(collectionCard(e,i));});
}
function showDetail(e){
  var body=el("div");
  var head=el("div","dhead");
  head.appendChild(renderPoster(e,false));
  var info=el("div","dinfo");
  info.appendChild(el("h2","",esc(e.titre)));
  var tags=el("div","tags");
  tags.appendChild(el("span","tag note",(e.note!=null?e.note+"/10":"\u2014/10")));
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
    jl.forEach(function(x){
      var t=el("div","tl-e");
      var tag=x.kind==="time"?x.ts:(x.kind==="ep"?("S"+pad2(x.s)+"E"+pad2(x.e)+(x.note!=null?" \u2022 "+x.note+"/10":"")):"libre");
      t.appendChild(el("div","w",esc(tag)));
      var xx=el("div","x",esc(x.text||""));
      xx.addEventListener("click",function(){openReader(e.titre,tag,x.text||"");});
      t.appendChild(xx);
      tl.appendChild(t);
    });
    body.appendChild(tl);
  }else{
    body.appendChild(el("div","empty","Pas encore de journal. Utilise \u00AB Noter vite \u00BB."));
  }
  setModal(e.titre,body,[["Modifier","primary",function(){renderPanel(e);}],["Noter","",function(){quickNoteOpen(e);}],["Fermer","",closeModal]]);
}
function openReader(title,sub,text){
  document.getElementById("r-title").textContent=title;
  document.getElementById("r-sub").textContent=sub||"";
  document.getElementById("r-body").textContent=text||"";
  showOverlay("reader-overlay");
}
function closeReader(){hideOverlay("reader-overlay");}
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
  allTypes().forEach(function(t){
    var c=el("div","chip"+(t===ST.panelType?" on":""),esc(t));
    c.addEventListener("click",function(){ST.panelType=t;tch.querySelectorAll(".chip").forEach(function(x){x.classList.remove("on");});c.classList.add("on");});
    tch.appendChild(c);
  });
  tw.appendChild(tch);body.appendChild(tw);
  var nw=el("div");nw.style.marginBottom="12px";nw.appendChild(el("label","","Note /10 (re-cliquer pour enlever)"));
  var nch=el("div","chips small");
  for(var n=1;n<=10;n++){
    (function(n){
      var c=el("div","chip"+(ST.currentNote===n?" on":""),String(n));
      c.addEventListener("click",function(){ST.currentNote=(ST.currentNote===n?null:n);nch.querySelectorAll(".chip").forEach(function(x){x.classList.remove("on");});if(ST.currentNote===n)c.classList.add("on");});
      nch.appendChild(c);
    })(n);
  }
  nw.appendChild(nch);body.appendChild(nw);
  var sw=el("div","chips small");sw.style.marginBottom="12px";
  function sc(get,set,label){
    var c=el("div","chip"+(get()?" on":""),label);
    c.addEventListener("click",function(){set(!get());c.classList.toggle("on",get());});
    sw.appendChild(c);
  }
  sc(function(){return ST.isFav;},function(v){ST.isFav=v;},"\u{1F49C} coup de c\u0153ur");
  sc(function(){return ST.isEnc;},function(v){ST.isEnc=v;},"\u23F3 en cours");
  sc(function(){return ST.isVoir;},function(v){ST.isVoir=v;},"\u{1F440} \u00e0 voir");
  body.appendChild(sw);
  var dIn=field("Avancement / date de fin",el("input"));dIn.id="p-date";dIn.placeholder="27/09/2026 ou S01E04 ou 15h";dIn.value=entry?(entry.dateFin||""):"";
  var cIn=field("Commentaire rapide",el("textarea"));cIn.id="p-comment";cIn.value=entry?(entry.comment||""):"";
  var aw=el("div");aw.style.marginBottom="12px";aw.appendChild(el("label","","Affiche"));
  var ar=el("div");ar.style.display="flex";ar.style.gap="8px";ar.style.alignItems="center";
  var prev=el("img");prev.id="p-prev";prev.src=ST.panelPoster||NO_POSTER;prev.style.width="58px";prev.style.borderRadius="4px";
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
    [["time","horodat\u00e9"],["free","libre"],["ep","saison/\u00e9pis."]].forEach(function(k){
      var c=el("div","chip",k[1]);
      c.addEventListener("click",function(){openDraft(k[0],jw);});
      jb.appendChild(c);
    });
    jw.appendChild(jb);
    var jlist=el("div");jlist.id="p-jlist";
    jw.appendChild(jlist);body.appendChild(jw);renderJList(jlist);
    var pw=el("div");pw.style.marginBottom="12px";pw.appendChild(el("label","","Collection physique"));
    var pOn=!!(entry&&entry.inCollection);
    var pchk=el("div","chip"+(pOn?" on":""),"\u{1F4E6} dans ma collection");
    var pbox=el("div");pbox.style.display=pOn?"block":"none";pbox.style.marginTop="8px";
    pchk.addEventListener("click",function(){pOn=!pOn;pchk.classList.toggle("on",pOn);pbox.style.display=pOn?"block":"none";});
    pw.appendChild(pchk);
    var sup=el("select");sup.id="p-support";
    (SUPPORTS[ST.panelType]||SUPPORTS["Film"]).forEach(function(x){var o=el("option","",x);if(entry&&entry.support===x)o.selected=true;sup.appendChild(o);});
    var pak=el("select");pak.id="p-pack";
    (PACKAGINGS[ST.panelType]||PACKAGINGS["Film"]).forEach(function(x){var o=el("option","",x);if(entry&&entry.packaging===x)o.selected=true;pak.appendChild(o);});
    var ean=el("input");ean.id="p-ean";ean.placeholder="EAN";ean.inputMode="numeric";ean.value=entry?(entry.ean||""):"";
    var escan=el("button");escan.innerHTML=ic("camera")+" Scanner";
    escan.addEventListener("click",function(){startEAN(function(code){ean.value=code;toast("EAN : "+code);});});
    var url=el("input");url.id="p-url";url.placeholder="URL de la fiche";url.value=entry?(entry.url||""):"";
    pbox.appendChild(sup);pbox.appendChild(el("br"));
    pbox.appendChild(pak);pbox.appendChild(el("br"));
    pbox.appendChild(ean);pbox.appendChild(el("br"));
    pbox.appendChild(escan);pbox.appendChild(el("br"));
    pbox.appendChild(url);
    pw.appendChild(pbox);body.appendChild(pw);
    if(entry){
      var dup=el("button","wide");dup.innerHTML=ic("duplicate")+" Dupliquer cette fiche";dup.style.marginTop="8px";
      dup.addEventListener("click",function(){duplicateEntry(entry);});
      body.appendChild(dup);
    }
  }
  setModal(entry?"Modifier":"Nouvelle "+OE+"uvre",body,[["Enregistrer","primary",saveCurrentEntry],["Annuler","",closeModal]]);
}
function openDraft(kind,parent){
  var old=document.getElementById("p-jdraft");if(old)old.remove();
  var d=el("div","card");d.id="p-jdraft";
  if(kind==="ep"){
    var r=el("div","row2");
    r.innerHTML='<label>S<input type="number" id="jd-s" min="0"></label><label>E<input type="number" id="jd-e" min="0"></label><label>/10<input type="number" id="jd-note" min="1" max="10"></label>';
    d.appendChild(r);
  }
  var ta=el("textarea");ta.placeholder="Ton entr\u00e9e\u2026";d.appendChild(ta);
  var act=el("div","row2");act.style.marginTop="8px";
  var ok=el("button","primary","Ajouter");var no=el("button","","Annuler");
  act.appendChild(ok);act.appendChild(no);d.appendChild(act);parent.appendChild(d);
  ok.addEventListener("click",function(){
    var text=ta.value.trim();
    if(!text&&kind!=="ep"){toast("Entre un texte.");return;}
    if(kind==="time")ST.draftJournal.push({kind:"time",ts:nowStamp(),text:text,at:Date.now()});
    else if(kind==="free")ST.draftJournal.push({kind:"free",text:text,at:Date.now()});
    else{
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
  e.dateFin=document.getElementById("p-date").value.trim();
  e.comment=document.getElementById("p-comment").value.trim();
  e.journal=ST.draftJournal;
  e.posterUrl=ST.panelPoster;
  e.posterThumb=ST.panelThumb||(await makeThumb(ST.panelPoster));
  var supEl=document.getElementById("p-support");
  if(supEl){
    var chk=supEl.parentNode.parentNode.querySelector(".chip");
    e.inCollection=chk?chk.classList.contains("on"):!!base.inCollection;
    if(e.inCollection){
      e.support=supEl.value;
      e.packaging=document.getElementById("p-pack").value;
      e.ean=document.getElementById("p-ean").value.trim();
      e.url=document.getElementById("p-url").value.trim();
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
function quickNoteOpen(e){
  ST.qnEntry=e;ST.qnKind="time";
  document.getElementById("qn-title").textContent="Noter : "+e.titre;
  document.getElementById("qn-text").value="";
  document.getElementById("qn-ep-row").classList.add("hidden");
  var k=document.getElementById("qn-kind");k.innerHTML="";
  [["time","horodat\u00e9"],["free","libre"],["ep","saison/\u00e9pis."]].forEach(function(x,i){
    var c=el("div","chip"+(i===0?" on":""),x[1]);
    c.addEventListener("click",function(){ST.qnKind=x[0];k.querySelectorAll(".chip").forEach(function(y){y.classList.remove("on");});c.classList.add("on");document.getElementById("qn-ep-row").classList.toggle("hidden",x[0]!=="ep");});
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
  if(ST.qnKind==="time")e.journal.push({kind:"time",ts:nowStamp(),text:text,at:Date.now()});
  else if(ST.qnKind==="free")e.journal.push({kind:"free",text:text,at:Date.now()});
  else{
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
    row.appendChild(el("div","empty","Rien en cours."));
  }
  var feed=[];
  ST.entries.forEach(function(en){
    (en.journal||[]).forEach(function(x){feed.push({e:en,x:x,at:x.at||0});});
  });
  feed.sort(function(a,b){return b.at-a.at;});
  var f=document.getElementById("j-feed");f.innerHTML="";
  f.appendChild(el("h3","","Flux du journal"));
  if(!feed.length)f.appendChild(el("div","empty","Aucune entr\u00e9e."));
  feed.slice(0,60).forEach(function(it){
    var item=el("div","fitem");item.appendChild(el("div","fdot"));
    var b=el("div");
    var tag=it.x.kind==="time"?it.x.ts:(it.x.kind==="ep"?("S"+pad2(it.x.s)+"E"+pad2(it.x.e)+(it.x.note!=null?" \u2022 "+it.x.note+"/10":"")):"libre");
    b.appendChild(el("div","ftime",esc(tag)));
    b.appendChild(el("div","ftext",esc(it.x.text||"")));
    b.appendChild(el("div","fwork",esc(it.e.titre)));
    item.appendChild(b);
    item.addEventListener("click",function(){openReader(it.e.titre,tag,it.x.text||"");});
    f.appendChild(item);
  });
  renderBilan();
  if(ST.calOpen)renderCalendar();
}
function renderBilan(){
  var y=ST.recapDate.getFullYear(),mo=ST.recapDate.getMonth();
  var names=["Janvier","F\u00e9vrier","Mars","Avril","Mai","Juin","Juillet","Ao\u00fbt","Septembre","Octobre","Novembre","D\u00e9cembre"];
  document.getElementById("bilan-title").textContent=names[mo]+" "+y;
  var month=ST.entries.filter(function(e){var p=parseDateFR(e.dateFin);return p&&p.y===y&&p.mo===mo+1;});
  var fav=month.filter(function(e){return e.isFavorite;});
  var avg=month.filter(function(e){return e.note!=null;});
  var moy=avg.length?(avg.reduce(function(s,e){return s+e.note;},0)/avg.length).toFixed(1):"\u2014";
  document.getElementById("bilan-body").innerHTML="<span><b>"+month.length+"</b> "+OE+"uvres</span><span>moy <b>"+moy+"</b></span><span><b>"+fav.length+"</b> c\u0153ur</span>";
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
  pv.addEventListener("click",function(){ST.calDate.setMonth(ST.calDate.getMonth()-1);renderCalendar();});
  nx.addEventListener("click",function(){ST.calDate.setMonth(ST.calDate.getMonth()+1);renderCalendar();});
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
  var s=settingsLoad();
  var c=document.getElementById("opt-container");c.innerHTML="";
  function group(icon,t){var g=el("div","ogroup card");g.appendChild(el("h3",'<span class="ic">'+ic(icon)+"</span>"+t));c.appendChild(g);return g;}
  function row(g,label,node){var r=el("div","orow");r.appendChild(el("span","",label));var ctl=el("div","ctl");if(node)ctl.appendChild(node);r.appendChild(ctl);g.appendChild(r);return r;}
  function btn(icon,label,fn,cls){var b=el("button",cls||"");b.innerHTML=(icon?'<span class="ic">'+ic(icon)+"</span>":"")+label;b.addEventListener("click",fn);return b;}
  function tog(on,fn){var t=el("div","toggle"+(on?" on":""));t.addEventListener("click",function(){var v=!t.classList.contains("on");t.classList.toggle("on",v);fn(v);});return t;}
  function pill(opts,cur,fn){
    var w=el("div","seg small");
    opts.forEach(function(o){
      var b=el("button",o[0]===cur?"on":"",o[1]);
      b.addEventListener("click",function(){w.querySelectorAll("button").forEach(function(x){x.classList.remove("on");});b.classList.add("on");fn(o[0]);});
      w.appendChild(b);
    });
    return w;
  }
  var g1=group("sheet","Google Sheet");
  var uIn=el("input");uIn.placeholder="URL du webhook";uIn.value=localStorage.getItem("sheet_url")||"";uIn.style.maxWidth="60%";
  row(g1,"URL webhook",uIn);
  row(g1,"",btn("save","Sauver",function(){localStorage.setItem("sheet_url",uIn.value.trim());toast("URL enregistr\u00e9e");},"primary"));
  row(g1,"",btn("copy","Copier (TSV)",function(){copyTSV();}));
  row(g1,"",btn("upload","Sync Sheet",function(){syncSheet();}));
  var g2=group("save","Sauvegarde");
  row(g2,"",btn("download","Export JSON",function(){exportJSON();}));
  row(g2,"",btn("upload","Import (fusion)",function(){importJSON();}));
  var lb=localStorage.getItem("last_backup");
  var lbRow=row(g2,"Dernier backup",el("span","mono",lb?new Date(parseInt(lb,10)).toLocaleDateString("fr-FR"):"jamais"));
  if(lb&&s.alertBackupDays>0&&Date.now()-parseInt(lb,10)>s.alertBackupDays*86400000)lbRow.querySelector("span").style.color="var(--fav)";
  row(g2,"Alerte backup",pill([[7,"7j"],[14,"14j"],[30,"30j"],[0,"Off"]],s.alertBackupDays,function(v){s.alertBackupDays=v;settingsSave(s);}));
  var g3=group("palette","Apparence");
  row(g3,"Mode AMOLED",tog(s.amoled,function(v){s.amoled=v;settingsSave(s);applySettings();}));
  row(g3,"Densit\u00e9",pill([["comfort","Confort"],["compact","Compact"]],s.density,function(v){s.density=v;settingsSave(s);applySettings();}));
  row(g3,"Taille texte",pill([["s","S"],["m","M"],["l","L"]],s.fontSize,function(v){s.fontSize=v;settingsSave(s);applySettings();}));
  row(g3,"Animations",tog(s.animOn,function(v){s.animOn=v;settingsSave(s);applySettings();}));
  row(g3,"Contraste \u00e9lev\u00e9",tog(s.hcMode,function(v){s.hcMode=v;settingsSave(s);applySettings();}));
  var g4=group("tag","Types personnalis\u00e9s");
  var ct=loadCustomTypes();
  ct.forEach(function(t,i){
    row(g4,esc(t.name),btn("trash","",function(){
      var used=false;
      for(var j=0;j<ST.entries.length;j++){if(ST.entries[j].type===t.name){used=true;break;}}
      if(used){toast("Type encore utilis\u00e9.");return;}
      ct.splice(i,1);saveCustomTypes(ct);renderOptions();buildTypeChips();
    },""));
  });
  var nt=el("input");nt.placeholder="Nouveau type\u2026";nt.style.maxWidth="55%";
  row(g4,"",nt);
  row(g4,"",btn("plus","Ajouter",function(){
    var v=nt.value.trim();if(!v)return;
    if(allTypes().indexOf(v)>=0){toast("Existe d\u00e9j\u00e0.");return;}
    ct.push({name:v});saveCustomTypes(ct);renderOptions();buildTypeChips();
  }));
  var g5=group("search","Recherche");
  row(g5,"Type par d\u00e9faut",pill(allTypes().map(function(t){return [t,t];}),s.defaultType,function(v){s.defaultType=v;settingsSave(s);ST.currentType=v;buildTypeChips();}));
  row(g5,"Tol\u00e9rance fautes",tog(s.fuzzy,function(v){s.fuzzy=v;settingsSave(s);}));
  row(g5,"",btn("trash","Vider r\u00e9centes",function(){localStorage.removeItem("recent_searches");ST.recent=[];toast("Vid\u00e9");}));
  var g6=group("phone","Application");
  row(g6,"",btn("download","Installer l\u2019appli",function(){triggerInstall();}));
  row(g6,"",btn("trash","Vider cache offline",function(){if("caches"in window)caches.keys().then(function(k){k.forEach(function(x){caches.delete(x);});});toast("Cache vid\u00e9");}));
  row(g6,"R\u00e9seau",el("span","",navigator.onLine?"connect\u00e9":"hors-ligne"));
  var g7=group("info","\u00c0 propos");
  row(g7,"Version",el("span","mono","V7.1"));
  row(g7,"Build",el("span","mono",new Date(BUILD).toLocaleString("fr-FR",{timeZone:"Europe/Paris"})));
  var cred=el("a","","Cr\u00e9\u00e9 par Gooumbora");cred.href="https://www.senscritique.com/Gooumbora";cred.target="_blank";cred.style.color="var(--acc)";cred.style.fontSize="13px";
  row(g7,"",cred);
  var g8=group("alert","Zone danger");
  row(g8,"",btn("trash","Vider la collection",async function(){
    if(confirm("Effacer TOUTES tes "+OE+"uvres ?")){
      for(var i=0;i<ST.entries.length;i++)await dbDelete(ST.entries[i].id);
      refreshAll();toast("Vid\u00e9");
    }
  }));
  row(g8,"",btn("x","R\u00e9initialiser r\u00e9glages",function(){localStorage.removeItem("settings");settingsSave(Object.assign({},SETTINGS_DEFAULTS));applySettings();renderOptions();toast("R\u00e9glages r\u00e9initialis\u00e9s");}));
}
