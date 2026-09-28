function switchView(v){ST.view=v;document.querySelectorAll("nav.tabbar button").forEach(function(b){b.classList.toggle("active",b.dataset.view===v);});document.querySelectorAll(".view").forEach(function(x){x.classList.remove("active");});document.getElementById("view-"+v).classList.add("active");if(v==="collection")renderCollection();if(v==="journal")renderJournal();if(v==="options")renderOptions();window.scrollTo(0,0);}
function buildTypeDropdown(){
  var list=document.getElementById("type-list");
  list.innerHTML="";
  allTypesWithIcons().forEach(function(t){
    var item=el("div","type-dropdown-item"+(t.name===ST.currentType?" active":""),"");
    item.dataset.type=t.name;
    item.innerHTML='<span class="ic">'+ic(t.icon||"tag")+'</span>'+esc(t.name);
    item.addEventListener("click",function(){
      ST.currentType=t.name;
      document.getElementById("type-label").textContent=t.name;
      document.getElementById("type-btn-ic").setAttribute("data-ic",t.icon||"tag");
      document.getElementById("type-btn-ic").innerHTML=ic(t.icon||"tag");
      list.querySelectorAll(".type-dropdown-item").forEach(function(x){x.classList.remove("active");});
      item.classList.add("active");
      list.classList.remove("open");
      document.getElementById("type-btn").classList.remove("open");
      clearResults();
    });
    list.appendChild(item);
  });
  document.getElementById("type-label").textContent=ST.currentType;
  var curType=allTypesWithIcons().find(function(t){return t.name===ST.currentType;});
  if(curType){document.getElementById("type-btn-ic").setAttribute("data-ic",curType.icon||"tag");document.getElementById("type-btn-ic").innerHTML=ic(curType.icon||"tag");}
}
function clearResults(){document.getElementById("results").innerHTML="";document.getElementById("fallback").innerHTML="";document.getElementById("search-status").textContent="";}
async function runSearch(){
  var q=document.getElementById("search-input").value.trim();
  if(!q){document.getElementById("search-status").textContent="Tape un titre.";return;}
  addRecent(q);
  document.getElementById("fallback").innerHTML="";
  var st=document.getElementById("search-status");st.className="status";st.textContent="Recherche\u2026";
  document.getElementById("results").innerHTML='<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  var s=settingsLoad();
  try{
    var r=[];
    if(ST.currentType==="Film")r=(await searchTMDB(q,"movie")).filter(function(x){return !(x.raw.genre_ids||[]).includes(99);});
    else if(ST.currentType==="S\u00e9rie")r=await searchTMDB(q,"tv");
    else if(ST.currentType==="Jeu")r=await searchRAWG(q);
    else if(["Manga","BD","Roman","Livre"].indexOf(ST.currentType)>=0)r=await searchBooks(q,ST.currentType);
    else if(ST.currentType==="Musique")r=await searchMusic(q);
    else r=await searchBooks(q,ST.currentType);
    if(s.searchMode==="avance"){
      var ymin=parseInt(document.getElementById("adv-year-min").value,10),ymax=parseInt(document.getElementById("adv-year-max").value,10),nmin=parseInt(document.getElementById("adv-note-min").value,10),plat=document.getElementById("adv-platform").value.trim().toLowerCase();
      if(ymin)r=r.filter(function(x){return !x.year||parseInt(x.year,10)>=ymin;});
      if(ymax)r=r.filter(function(x){return !x.year||parseInt(x.year,10)<=ymax;});
      if(nmin)r=r.filter(function(x){return x.rating==null||x.rating>=nmin;});
      if(plat&&ST.currentType==="Jeu")r=r.filter(function(x){return !x.platforms||x.platforms.join(" ").toLowerCase().indexOf(plat)>=0;});
    }
    document.getElementById("results").innerHTML="";
    if(!r.length){st.textContent="Aucun r\u00e9sultat en "+ST.currentType+".";showFallback();}
    else{st.textContent=r.length+" r\u00e9sultat(s)";renderResults(r);}
  }catch(err){console.error(err);document.getElementById("results").innerHTML="";st.className="status error";st.textContent="Erreur : "+(err.message||"r\u00e9seau");}
}
function showFallback(){var f=document.getElementById("fallback");f.innerHTML="";f.appendChild(el("div","","Essayer plut\u00f4t :"));var w=el("div","chips small");allTypes().filter(function(t){return t!==ST.currentType;}).forEach(function(t){var c=el("div","chip",esc(t));c.addEventListener("click",function(){ST.currentType=t;buildTypeDropdown();clearResults();});w.appendChild(c);});f.appendChild(w);}
function renderResults(list){var c=document.getElementById("results");c.innerHTML="";list.forEach(function(item){var card=el("div","rcard");var img=el("img","rp");img.src=item.poster||NO_POSTER;img.loading="lazy";var info=el("div","ri");info.appendChild(el("div","rt",esc(item.title||"")));var parts=[];if(item.year)parts.push(item.year);if(item.author)parts.push(item.author);if(item.extra)parts.push(item.extra);info.appendChild(el("div","rm",esc(parts.join(" \u2022 "))));card.appendChild(img);card.appendChild(info);card.addEventListener("click",function(){ST.selectedItem=item;renderPanel(null);});c.appendChild(card);if(item.source==="rawg")fetchSteamGrid(item.title).then(function(cv){if(cv){item.poster=cv;img.src=cv;}});});}
async function searchTMDB(q,kind){var res=await fetch(PROXY+"/tmdb/search/"+kind+"?language=fr-FR&query="+encodeURIComponent(q));if(!res.ok)throw new Error("TMDB "+res.status);var d=await res.json();return (d.results||[]).slice(0,20).map(function(r){return{source:"tmdb",id:r.id,title:kind==="movie"?r.title:r.name,year:(kind==="movie"?r.release_date:r.first_air_date||"").slice(0,4),poster:r.poster_path?TMDB_IMG+r.poster_path:null,rating:r.vote_average?Math.round(r.vote_average):null,raw:r};});}
async function searchRAWG(q){var res=await fetch(PROXY+"/rawg/games?search="+encodeURIComponent(q)+"&page_size=15");if(!res.ok)throw new Error("RAWG "+res.status);var d=await res.json();return (d.results||[]).map(function(g){return{source:"rawg",id:g.id,title:g.name,year:(g.released||"").slice(0,4),poster:g.background_image,platforms:(g.platforms||[]).map(function(p){return p.platform.name;}),raw:g};});}
async function searchMusic(q){var res=await fetch("https://itunes.apple.com/search?term="+encodeURIComponent(q)+"&media=music&entity=album&limit=15");if(!res.ok)throw new Error("Music "+res.status);var d=await res.json();return (d.results||[]).map(function(a){return{source:"music",id:a.collectionId,title:a.collectionName,year:(a.releaseDate||"").slice(0,4),author:a.artistName,poster:a.artworkUrl100?a.artworkUrl100.replace("100x100","400x400"):null,raw:a};});}
async function searchGoogleBooks(q,type){var query=q;if(type==="BD")query+=" bande dessin\u00e9e comics";if(type==="Manga")query+=" manga";if(type==="Roman")query+=" roman fiction";if(type==="Livre")query+=" essai biographie";var res=await fetch(PROXY+"/books/v1/volumes?maxResults=20&q="+encodeURIComponent(query)+"&filter=full");if(!res.ok)throw new Error("Books "+res.status);var d=await res.json();return (d.items||[]).map(function(it){var v=it.volumeInfo||{};var p=v.imageLinks?(v.imageLinks.thumbnail||v.imageLinks.smallThumbnail):null;if(!p&&it.id)p="https://books.google.com/books/content?id="+it.id+"&printsec=frontcover&img=1&zoom=1";return{source:"book",id:it.id,title:v.title+(v.subtitle?" \u2014 "+v.subtitle:""),year:(v.publishedDate||"").slice(0,4),author:(v.authors||[]).join(", "),poster:p,categories:v.categories||[],raw:v};});}
async function searchOpenLib(q,type){var query=q;if(type==="BD")query+=" graphic novel";if(type==="Manga")query+=" manga";var res=await fetch("https://openlibrary.org/search.json?q="+encodeURIComponent(query)+"&limit=20&fields=title,author_name,first_publish_year,cover_i,key,subject");if(!res.ok)throw new Error("OpenLib "+res.status);var d=await res.json();return (d.docs||[]).map(function(x){return{source:"openlib",id:x.key,title:x.title,year:x.first_publish_year?String(x.first_publish_year):"",author:(x.author_name||[]).join(", "),poster:x.cover_i?("https://covers.openlibrary.org/b/id/"+x.cover_i+"-M.jpg"):null,categories:x.subject||[],raw:x};});}
function relevantForType(item,type){var cats=Array.isArray(item.categories)?item.categories.join(" "):"";var t=(cats+" "+(item.title||"")).toLowerCase();var comic=t.indexOf("comic")>=0||t.indexOf("graphic novel")>=0||t.indexOf("bande dessin")>=0;var manga=t.indexOf("manga")>=0;if(type==="BD")return !(manga&&!comic);if(type==="Manga")return manga||!comic;if(type==="Roman")return !(comic||manga);return true;}
async function searchBooks(q,type){var r=await Promise.allSettled([searchGoogleBooks(q,type),searchOpenLib(q,type)]);var a=r[0].status==="fulfilled"?r[0].value:[];var b=r[1].status==="fulfilled"?r[1].value:[];var m=a.concat(b).filter(function(i){return relevantForType(i,type);});var seen={};return m.filter(function(i){var k=norm(i.title).slice(0,30);if(!k||seen[k])return false;seen[k]=1;return true;});}
async function fetchSteamGrid(n){try{var s=await fetch(PROXY+"/steamgrid/search/autocomplete/"+encodeURIComponent(n));if(!s.ok)return null;var sd=await s.json();if(!sd.success||!sd.data||!sd.data.length)return null;var g=await fetch(PROXY+"/steamgrid/grids/game/"+sd.data[0].id+"?dimensions=600x900&styles=alternate");if(!g.ok)return null;var gd=await g.json();if(!gd.success||!gd.data||!gd.data.length)return null;return gd.data[0].url;}catch(e){return null;}}
function addRecent(t){var r=JSON.parse(localStorage.getItem("recent_searches")||"[]");r=[t].concat(r.filter(function(x){return x!==t;})).slice(0,6);localStorage.setItem("recent_searches",JSON.stringify(r));ST.recent=r;}
function showRecent(){var p=document.getElementById("search-menu-body");p.innerHTML="";if(!ST.recent.length)p.appendChild(el("div","empty","Aucune recherche r\u00e9cente."));ST.recent.forEach(function(t){var b=el("button","",esc(t));b.style.width="100%";b.style.justifyContent="flex-start";b.addEventListener("click",function(){document.getElementById("search-input").value=t;hideOverlay("search-menu-overlay");runSearch();});p.appendChild(b);});showOverlay("search-menu-overlay");}
function flatten(e){return{titre:e.titre,description:descriptionOf(e),type:e.type,note:e.note!=null?e.note:"",statut:statutStr(e),horodatage:e.dateFin||""};}
function flattenTSV(e){
  var status="Fini";
  if(e.enCours)status="En cours";
  else if(e.aVoir)status="\u00c0 voir";
  return{
    titre:e.titre||"",
    type:e.type||"",
    note:e.note!=null?String(e.note):"",
    description:descriptionOf(e),
    collection:e.inCollection?"\u2713":"",
    support:e.support||"",
    statut:status,
    dateFin:e.dateFin||"",
    id:e.id||""
  };
}
async function copyTSV(){
  var clean=function(v){return String(v==null?"":v).replace(/[\t\r\n]+/g," ");};
  var rows=[["\u0152uvre","Type","Note","Entr\u00e9e","Collection","Support","Statut","Date","ID"]];
  ST.entries.forEach(function(e){
    var f=flattenTSV(e);
    rows.push([clean(f.titre),clean(f.type),clean(f.note),clean(f.description),clean(f.collection),clean(f.support),clean(f.statut),clean(f.dateFin),clean(f.id)]);
  });
  var text=rows.map(function(r){return r.join("\t");}).join("\n");
  try{await navigator.clipboard.writeText(text);toast("Copi\u00e9 ! Colle en A1.");}catch(e){var ta=el("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();toast("Copi\u00e9 !");}
}
function copyTSVMonth(y,m){
  var clean=function(v){return String(v==null?"":v).replace(/[\t\r\n]+/g," ");};
  var rows=[["\u0152uvre","Type","Note","Entr\u00e9e","Collection","Support","Statut","Date","ID"]];
  ST.entries.forEach(function(e){
    var p=parseDateFR(e.dateFin);
    if(p&&p.y===y&&p.mo===m){
      (e.journal||[]).forEach(function(x){
        var f=flattenTSV(e);
        var entryText=x.kind==="time"?x.ts+" : "+x.text:(x.kind==="ep"?("S"+pad2(x.s)+"E"+pad2(x.e)+(x.note!=null?" \u2022 "+x.note+"/10":"")+(x.text?" : "+x.text:"")):x.text);
        rows.push([clean(f.titre),clean(f.type),clean(f.note),clean(entryText),clean(f.collection),clean(f.support),clean(f.statut),clean(f.dateFin),clean(f.id)]);
      });
    }
  });
  var text=rows.map(function(r){return r.join("\t");}).join("\n");
  try{navigator.clipboard.writeText(text).then(function(){toast("Journal du mois copi\u00e9 !");});}catch(e){var ta=el("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();toast("Copi\u00e9 !");}
}
function copyTSVAll(){copyTSV();}
async function syncSheet(){var url=localStorage.getItem("sheet_url");if(!url){toast("Configure l\u2019URL dans Option.");switchView("options");return;}toast("Envoi\u2026",2500);try{var res=await fetch(url,{method:"POST",body:JSON.stringify({action:"sync_all",entries:ST.entries.map(flatten)})});if(res.ok)toast("Sheet mis \u00e0 jour");else toast("Erreur webhook "+res.status,3000);}catch(err){toast("Erreur sync. Utilise Copier.",3000);}}
async function exportJSON(){var data={version:"V7",exportDate:new Date().toISOString(),settings:settingsLoad(),customTypes:loadCustomTypes(),sheetUrl:localStorage.getItem("sheet_url")||"",entries:ST.entries};var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});var u=URL.createObjectURL(blob);var a=el("a");a.href=u;a.download="ma-collection-"+new Date().toISOString().slice(0,10)+".json";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(u);localStorage.setItem("last_backup",String(Date.now()));toast("Backup export\u00e9");}
function importJSON(){var inp=el("input");inp.type="file";inp.accept="application/json";inp.addEventListener("change",function(ev){var f=ev.target.files[0];if(!f)return;var r=new FileReader();r.onload=async function(e){try{var data=JSON.parse(e.target.result);var list=data.entries||(Array.isArray(data)?data:[]);var ids={};ST.entries.forEach(function(x){ids[x.id]=1;});var added=0,skipped=0;for(var i=0;i<list.length;i++){var en=list[i];if(en&&en.id&&!ids[en.id]){if(!en.titre)en.titre="Sans titre";if(!en.dateAjout)en.dateAjout=new Date().toISOString();await dbPut(en);added++;}else skipped++;}if(data.settings)settingsSave(Object.assign({},SETTINGS_DEFAULTS,data.settings));if(data.customTypes)saveCustomTypes(data.customTypes);if(data.sheetUrl)localStorage.setItem("sheet_url",data.sheetUrl);applySettings();buildTypeDropdown();refreshAll();toast("Import : "+added+" ajout\u00e9(s), "+skipped+" ignor\u00e9(s)");}catch(err){toast("JSON invalide.",3000);}};r.readAsText(f);});inp.click();}
async function startEAN(cb){if(!("BarcodeDetector"in window)){var m=prompt("Scan non support\u00e9 ici.\nSaisis le code manuellement :");if(m)cb(m.trim());return;}try{var stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});showOverlay("poster-overlay");document.getElementById("poster-img").style.display="none";var vid=document.createElement("video");vid.style.flex="1";vid.style.width="100%";vid.style.objectFit="cover";vid.playsInline=true;vid.srcObject=stream;vid.play();document.getElementById("poster-overlay").insertBefore(vid,document.querySelector("#poster-overlay .bar"));var det=new BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e"]});var timer=setInterval(async function(){try{var codes=await det.detect(vid);if(codes.length){clearInterval(timer);stream.getTracks().forEach(function(t){t.stop();});vid.remove();document.getElementById("poster-img").style.display="";hideOverlay("poster-overlay");cb(codes[0].rawValue);}}catch(e){}},400);document.getElementById("poster-close").onclick=function(){clearInterval(timer);stream.getTracks().forEach(function(t){t.stop();});vid.remove();document.getElementById("poster-img").style.display="";hideOverlay("poster-overlay");};}catch(e){toast("Cam\u00e9ra indisponible.",3000);}}
function wrapText(ctx,text,x,y,maxW,lh,maxLines){var words=text.split(" ");var line="";var n=0;for(var i=0;i<words.length;i++){var test=line+words[i]+" ";if(ctx.measureText(test).width>maxW&&line){ctx.fillText(line.trim(),x,y);y+=lh;line=words[i]+" ";n++;if(n>=maxLines-1){var rest=words.slice(i).join(" ");if(ctx.measureText(line+rest).width>maxW){ctx.fillText((line+"...").trim(),x,y);}else{ctx.fillText((line+rest).trim(),x,y);}return y+lh;}}else line=test;}ctx.fillText(line.trim(),x,y);return y+lh;}
async function shareJPG(e){
  toast("G\u00e9n\u00e9ration\u2026");
  var W=600,H=840;
  var cv=document.createElement("canvas");
  cv.width=W;cv.height=H;
  var ctx=cv.getContext("2d");
  var g=ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0,"#0D0A1F");
  g.addColorStop(1,"#1F1738");
  ctx.fillStyle=g;
  ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="#B24BF3";
  ctx.lineWidth=3;
  ctx.strokeRect(14,14,W-28,H-28);
  var src=e.posterThumb||e.posterUrl||"";
  if(src){
    var img=new Image();
    await new Promise(function(res){img.onload=res;img.onerror=res;img.src=src;});
    if(img.complete&&img.naturalWidth){
      var pw=300,ph=450,px=(W-pw)/2,py=60;
      try{ctx.drawImage(img,px,py,pw,ph);}catch(err){}
    }
  }else{
    ctx.fillStyle="#17112E";
    ctx.fillRect(150,60,300,450);
  }
  ctx.fillStyle="#EFECE6";
  ctx.font="600 32px Georgia,serif";
  ctx.textAlign="center";
  wrapText(ctx,e.titre,W/2,560,W-90,38,2);
  ctx.fillStyle="#B24BF3";
  ctx.font="600 24px monospace";
  ctx.fillText((e.note!=null?e.note+"/10":"\u2014/10")+"  "+statutStr(e),W/2,650);
  ctx.fillStyle="#8B83A8";
  ctx.font="16px monospace";
  ctx.fillText(e.type+(e.dateFin?" \u2022 "+formatDate(e.dateFin):""),W/2,682);
  ctx.fillStyle="#8B83A8";
  ctx.font="13px monospace";
  ctx.fillText("Ma Collection",W/2,H-36);
  var url=cv.toDataURL("image/jpeg",0.9);
  var a=el("a");
  a.href=url;
  a.download="ma-collection-"+norm(e.titre)+".jpg";
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast("Image enregistr\u00e9e");
}
var deferredPrompt=null;
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();deferredPrompt=e;});
function triggerInstall(){if(deferredPrompt)deferredPrompt.prompt();else toast("Menu \u22EE \u2192 Installer l\u2019application.");}
async function init(){
  await openDB();
  ST.entries=await dbAll();
  var s=settingsLoad();
  applySettings();
  ST.currentType=s.defaultType||"Film";
  ST.colSort=s.colSort||"date-desc";
  ST.colSupport=s.colSupport||"all";
  ST.recent=JSON.parse(localStorage.getItem("recent_searches")||"[]");
  document.querySelectorAll("[data-ic]").forEach(function(sp){sp.innerHTML=ic(sp.dataset.ic);});
  buildTypeDropdown();
  document.querySelectorAll("nav.tabbar button").forEach(function(b){b.addEventListener("click",function(){switchView(b.dataset.view);});});
  document.getElementById("search-input").addEventListener("keydown",function(e){if(e.key==="Enter")runSearch();});
  document.getElementById("search-menu-btn").addEventListener("click",function(){
    var body=document.getElementById("search-menu-body");
    body.innerHTML="";
    var recentBtn=el("div","m-item");recentBtn.innerHTML='<span class="ic">'+ic("clock")+'</span>Recherches r\u00e9centes';recentBtn.addEventListener("click",function(){hideOverlay("search-menu-overlay");showRecent();});body.appendChild(recentBtn);
    var manualBtn=el("div","m-item");manualBtn.innerHTML='<span class="ic">'+ic("plus")+'</span>Ajout manuel';manualBtn.addEventListener("click",function(){hideOverlay("search-menu-overlay");ST.selectedItem=null;renderPanel(null);});body.appendChild(manualBtn);
    var advBtn=el("div","m-item");advBtn.innerHTML='<span class="ic">'+ic("sliders-horizontal")+'</span>Recherche avanc\u00e9e';advBtn.addEventListener("click",function(){hideOverlay("search-menu-overlay");var p=document.getElementById("adv-panel");p.classList.toggle("hidden");});body.appendChild(advBtn);
    showOverlay("search-menu-overlay");
  });
  document.getElementById("search-menu-close").addEventListener("click",function(){hideOverlay("search-menu-overlay");});
  document.getElementById("type-btn").addEventListener("click",function(){
    document.getElementById("type-btn").classList.toggle("open");
    document.getElementById("type-list").classList.toggle("open");
  });
  document.getElementById("col-search").addEventListener("input",function(e){ST.colQuery=e.target.value;renderCollection();});
  var sf=document.getElementById("col-support-filter");
  [["all","Tous","box"],["phys","Physique","box"],["demat","D\u00e9mat\u00e9rialis\u00e9","box"]].forEach(function(f,i){
    var c=el("div","chip"+(i===0?" on":""),'<span class="ic">'+ic(f[2])+"</span>"+f[1]);
    c.addEventListener("click",function(){ST.colSupport=f[0];sf.querySelectorAll(".chip").forEach(function(x){x.classList.remove("on");});c.classList.add("on");renderCollection();});
    sf.appendChild(c);
  });
  var cs=document.getElementById("col-sort");
  [["date-desc","Date \u2193"],["titre-asc","A-Z"],["type","Type"],["support","Support"],["note-desc","Note \u2193"]].forEach(function(o,i){var b=el("button",ST.colSort===o[0]?"on":"",o[1]);b.addEventListener("click",function(){ST.colSort=o[0];s.colSort=o[0];settingsSave(s);cs.querySelectorAll("button").forEach(function(x){x.classList.remove("on");});b.classList.add("on");renderCollection();});cs.appendChild(b);});
  document.getElementById("col-view").addEventListener("click",function(){s.colView=s.colView==="grid"?"list":"grid";settingsSave(s);var ic2=document.querySelector("#col-view .ic");if(ic2)ic2.innerHTML=ic(s.colView==="grid"?"grid":"list");renderCollection();});
  document.getElementById("j-cal-btn").addEventListener("click",function(){ST.calOpen=!ST.calOpen;document.getElementById("j-cal").classList.toggle("hidden",!ST.calOpen);if(ST.calOpen)renderCalendar();});
  document.getElementById("bilan-prev").addEventListener("click",function(){ST.calDate.setMonth(ST.calDate.getMonth()-1);renderCalendar();renderJournal();});
  document.getElementById("bilan-next").addEventListener("click",function(){ST.calDate.setMonth(ST.calDate.getMonth()+1);renderCalendar();renderJournal();});
  document.getElementById("flux-copy").addEventListener("click",function(){copyTSVMonth(ST.calDate.getFullYear(),ST.calDate.getMonth()+1);});
  document.getElementById("flux-add").addEventListener("click",function(){openAddEntryModal();});
  document.getElementById("flux-filter").addEventListener("click",function(){openFilterModal();});
  document.getElementById("m-close").addEventListener("click",closeModal);
  document.getElementById("modal-overlay").addEventListener("click",function(e){if(e.target.id==="modal-overlay")closeModal();});
  document.getElementById("r-close").addEventListener("click",closeReader);
  document.getElementById("r-delete").addEventListener("click",function(){
    if(ST.currentReaderEntry&&ST.currentReaderJournalIdx!=null){
      var entry=ST.currentReaderEntry;
      var idx=ST.currentReaderJournalIdx;
      showConfirm("Supprimer cette entr\u00e9e ?","Cette action est irr\u00e9versible.",function(){
        entry.journal.splice(idx,1);
        dbPut(entry).then(function(){toast("Entr\u00e9e supprim\u00e9e");closeReader();refreshAll();});
      });
    }
  });
  document.getElementById("r-edit").addEventListener("click",function(){
    if(ST.currentReaderEntry&&ST.currentReaderJournalIdx!=null){
      var entry=ST.currentReaderEntry;
      var idx=ST.currentReaderJournalIdx;
      var x=entry.journal[idx];
      closeReader();
      quickNoteOpen(entry,x?x.text:"");
    }
  });
  document.getElementById("reader-overlay").addEventListener("click",function(e){if(e.target.id==="reader-overlay")closeReader();});
  document.getElementById("qn-close").addEventListener("click",quickNoteClose);
  document.getElementById("qn-cancel").addEventListener("click",quickNoteClose);
  document.getElementById("qn-save").addEventListener("click",quickNoteSave);
  document.getElementById("menu-close").addEventListener("click",closeMenu);
  document.getElementById("menu-overlay").addEventListener("click",function(e){if(e.target.id==="menu-overlay")closeMenu();});
  document.getElementById("confirm-close").addEventListener("click",function(){hideOverlay("confirm-overlay");});
  document.getElementById("poster-close").addEventListener("click",function(){hideOverlay("poster-overlay");});
  document.addEventListener("click",function(e){
    if(!e.target.closest('.type-dropdown')){
      document.getElementById("type-btn").classList.remove("open");
      document.getElementById("type-list").classList.remove("open");
    }
  });
  renderCollection();renderJournal();renderOptions();
  if("serviceWorker"in navigator){try{navigator.serviceWorker.register("./sw.js");}catch(e){}}
}
function openAddEntryModal(){
  var y=ST.calDate.getFullYear(),mo=ST.calDate.getMonth();
  var names=["Janvier","F\u00e9vrier","Mars","Avril","Mai","Juin","Juillet","Ao\u00fbt","Septembre","Octobre","Novembre","D\u00e9cembre"];
  var body=el("div");
  body.appendChild(el("div","","Ajouter une entr\u00e9e pour <b>"+names[mo]+" "+y+"</b>"));
  body.appendChild(el("div",null,"<br>"));
  var libreBtn=el("button","wide");libreBtn.innerHTML='<span class="ic">'+ic("plus")+"</span>Entr\u00e9e libre...";
  libreBtn.addEventListener("click",function(){closeModal();ST.selectedItem=null;renderPanel(null);});
  body.appendChild(libreBtn);
  body.appendChild(el("div",null,"<br>"));
  body.appendChild(el("div","","\u0152uvres du mois :"));
  var monthEntries=ST.entries.filter(function(e){var p=parseDateFR(e.dateFin);return p&&p.y===y&&p.mo===mo+1;});
  if(!monthEntries.length){body.appendChild(el("div","empty","Aucune \u0153uvre ce mois-ci."));}
  monthEntries.forEach(function(e){
    var btn=el("button","wide");
    btn.innerHTML='<span class="ic">'+ic("pen")+"</span>"+esc(e.titre);
    btn.style.justifyContent="flex-start";
    btn.addEventListener("click",function(){closeModal();quickNoteOpen(e);});
    body.appendChild(btn);
  });
  setModal("Ajouter une entr\u00e9e",body,[["Fermer","",closeModal]]);
}
function openFilterModal(){
  var body=el("div");
  var f=ST.fluxFilter;
  var searchDiv=el("div","filter-section");
  searchDiv.appendChild(el("h4","","Recherche"));
  var searchRow=el("div","filter-search");
  var searchInput=el("input");searchInput.type="search";searchInput.placeholder="Rechercher...";searchInput.value=f.search||"";
  searchInput.addEventListener("input",function(e){f.search=e.target.value;renderJournal();});
  searchRow.appendChild(searchInput);
  searchDiv.appendChild(searchRow);
  body.appendChild(searchDiv);
  var typeDiv=el("div","filter-section");
  typeDiv.appendChild(el("h4","","Type"));
  var typeChips=el("div","chips small");
  CORE_TYPES.forEach(function(t){
    var c=el("div","chip"+(f.types.indexOf(t.name)>=0?" on":""),'<span class="ic">'+ic(t.icon)+"</span>"+t.name);
    c.addEventListener("click",function(){
      var idx=f.types.indexOf(t.name);
      if(idx>=0)f.types.splice(idx,1);else f.types.push(t.name);
      c.classList.toggle("on",f.types.indexOf(t.name)>=0);
      renderJournal();
    });
    typeChips.appendChild(c);
  });
  typeDiv.appendChild(typeChips);
  body.appendChild(typeDiv);
  var statusDiv=el("div","filter-section");
  statusDiv.appendChild(el("h4","","Statut"));
  var statusChips=el("div","chips small");
  [["enc","En cours"],["fini","Fini"],["voir","\u00c0 voir"]].forEach(function(s){
    var c=el("div","chip"+(f.status.indexOf(s[0])>=0?" on":""),s[1]);
    c.addEventListener("click",function(){
      var idx=f.status.indexOf(s[0]);
      if(idx>=0)f.status.splice(idx,1);else f.status.push(s[0]);
      c.classList.toggle("on",f.status.indexOf(s[0])>=0);
      renderJournal();
    });
    statusChips.appendChild(c);
  });
  statusDiv.appendChild(statusChips);
  body.appendChild(statusDiv);
  var noteDiv=el("div","filter-section");
  noteDiv.appendChild(el("h4","","Note"));
  var noteChips=el("div","chips small");
  [["none","Sans note"],["low","1-3"],["mid","4-6"],["high","7-8"],["top","9-10"]].forEach(function(n){
    var c=el("div","chip"+(f.noteRange===n[0]?" on":""),n[1]);
    c.addEventListener("click",function(){
      f.noteRange=(f.noteRange===n[0]?null:n[0]);
      noteChips.querySelectorAll(".chip").forEach(function(x){x.classList.remove("on");});
      if(f.noteRange)c.classList.add("on");
      renderJournal();
    });
    noteChips.appendChild(c);
  });
  noteDiv.appendChild(noteChips);
  body.appendChild(noteDiv);
  var ownedDiv=el("div","filter-section");
  ownedDiv.appendChild(el("h4","","Collection"));
  var ownedToggle=el("div","toggle"+(f.ownedOnly?" on":""));
  ownedToggle.addEventListener("click",function(){f.ownedOnly=!f.ownedOnly;ownedToggle.classList.toggle("on",f.ownedOnly);renderJournal();});
  ownedDiv.appendChild(ownedToggle);
  body.appendChild(ownedDiv);
  var sortDiv=el("div","filter-section");
  sortDiv.appendChild(el("h4","","Tri"));
  var sortPill=el("div","pill-sel");
  [["date-desc","Date \u2193"],["date-asc","Date \u2191"],["note-desc","Note \u2193"],["note-asc","Note \u2191"],["titre-asc","A-Z"]].forEach(function(o){
    var b=el("button",f.sort===o[0]?"on":"",o[1]);
    b.addEventListener("click",function(){f.sort=o[0];sortPill.querySelectorAll("button").forEach(function(x){x.classList.remove("on");});b.classList.add("on");renderJournal();});
    sortPill.appendChild(b);
  });
  sortDiv.appendChild(sortPill);
  body.appendChild(sortDiv);
  var resetBtn=el("button","wide");resetBtn.innerHTML='<span class="ic">'+ic("trash")+"</span>R\u00e9initialiser les filtres";
  resetBtn.addEventListener("click",function(){
    ST.fluxFilter={types:[],status:[],noteRange:null,ownedOnly:false,search:"",sort:"date-desc"};
    closeModal();openFilterModal();renderJournal();
  });
  body.appendChild(resetBtn);
  setModal("Filtrer / Trier",body,[["Fermer","",closeModal]]);
}
init();