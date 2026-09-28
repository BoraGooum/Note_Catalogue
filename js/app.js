function switchView(v){
try{sessionStorage.setItem("lastView",v);}catch(e){}
ST.view=v;
document.querySelectorAll("nav.tabbar button").forEach(function(b){b.classList.toggle("active",b.dataset.view===v);});
document.querySelectorAll(".view").forEach(function(x){x.classList.remove("active");});
var el=document.getElementById("view-"+v);if(el)el.classList.add("active");
if(v==="collection")renderCollection();
if(v==="journal"){renderJournal();updateJournalBadge();}
if(v==="options")renderOptions();
window.scrollTo(0,0);
}
function buildTypeDropdown(){
var list=$("type-list");if(!list)return;
list.innerHTML="";
allTypesWithIcons().forEach(function(t){
var item=el("div","type-dropdown-item"+(t.name===ST.currentType?" active":""),"");
item.dataset.type=t.name;
item.innerHTML='<span class="ic">'+ic(t.icon||"tag")+'</span>'+esc(t.name);
item.addEventListener("click",function(){
ST.currentType=t.name;
var lbl=$("type-label");if(lbl)lbl.textContent=t.name;
var ico=$("type-btn-ic");
if(ico){ico.setAttribute("data-ic",t.icon||"tag");ico.innerHTML=ic(t.icon||"tag");}
list.querySelectorAll(".type-dropdown-item").forEach(function(x){x.classList.remove("active");});
item.classList.add("active");
list.classList.remove("open");
var btn=$("type-btn");if(btn)btn.classList.remove("open");
clearResults();
});
list.appendChild(item);
});
var lbl=$("type-label");if(lbl)lbl.textContent=ST.currentType;
var curType=allTypesWithIcons().find(function(t){return t.name===ST.currentType;});
var ico=$("type-btn-ic");
if(ico&&curType){ico.setAttribute("data-ic",curType.icon||"tag");ico.innerHTML=ic(curType.icon||"tag");}
}
function clearResults(){var r=$("results");if(r)r.innerHTML="";var f=$("fallback");if(f)f.innerHTML="";var s=$("search-status");if(s)s.textContent="";}
async function runSearch(){
var si=$("search-input");if(!si)return;
var q=si.value.trim();
if(!q){var s0=$("search-status");if(s0)s0.textContent="Tape un titre.";return;}
addRecent(q);
var f=$("fallback");if(f)f.innerHTML="";
var st=$("search-status");if(st){st.className="status";st.textContent="Recherche...";}
var r=$("results");if(r)r.innerHTML='<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
var s=settingsLoad();
try{
var res=[];
if(ST.currentType==="Film")res=(await searchTMDB(q,"movie")).filter(function(x){return !(x.raw.genre_ids||[]).includes(99);});
else if(ST.currentType==="S\u00e9rie")res=await searchTMDB(q,"tv");
else if(ST.currentType==="Jeu")res=await searchRAWG(q);
else if(["Manga","BD","Roman","Livre"].indexOf(ST.currentType)>=0)res=await searchBooks(q,ST.currentType);
else if(ST.currentType==="Musique")res=await searchMusic(q);
else res=await searchBooks(q,ST.currentType);
if(s.searchMode==="avance"){
var yminEl=$("adv-year-min"),ymaxEl=$("adv-year-max"),nminEl=$("adv-note-min"),platEl=$("adv-platform");
var ymin=yminEl?parseInt(yminEl.value,10):null,ymax=ymaxEl?parseInt(ymaxEl.value,10):null,nmin=nminEl?parseInt(nminEl.value,10):null,plat=platEl?platEl.value.trim().toLowerCase():"";
if(ymin)res=res.filter(function(x){return !x.year||parseInt(x.year,10)>=ymin;});
if(ymax)res=res.filter(function(x){return !x.year||parseInt(x.year,10)<=ymax;});
if(nmin)res=res.filter(function(x){return x.rating==null||x.rating>=nmin;});
if(plat&&ST.currentType==="Jeu")res=res.filter(function(x){return !x.platforms||x.platforms.join(" ").toLowerCase().indexOf(plat)>=0;});
}
var results=$("results");if(results)results.innerHTML="";
if(!res.length){var st2=$("search-status");if(st2)st2.textContent="Aucun resultat en "+ST.currentType+".";showFallback();}
else{var st3=$("search-status");if(st3)st3.textContent=res.length+" resultat(s)";renderResults(res);}
}catch(err){console.error(err);var results=$("results");if(results)results.innerHTML="";var st4=$("search-status");if(st4){st4.className="status error";st4.textContent="Erreur : "+(err.message||"reseau");}}
}
function showFallback(){var f=$("fallback");if(!f)return;f.innerHTML="";f.appendChild(el("div","","Essayer plutot :"));var w=el("div","chips small");allTypes().filter(function(t){return t!==ST.currentType;}).forEach(function(t){var c=el("div","chip",esc(t));c.addEventListener("click",function(){ST.currentType=t;buildTypeDropdown();clearResults();});w.appendChild(c);});f.appendChild(w);}
function renderResults(list){var c=$("results");if(!c)return;c.innerHTML="";list.forEach(function(item){var card=el("div","rcard");var img=el("img","rp");img.src=item.poster||NO_POSTER;img.loading="lazy";var info=el("div","ri");info.appendChild(el("div","rt",esc(item.title||"")));var parts=[];if(item.year)parts.push(item.year);if(item.author)parts.push(item.author);if(item.extra)parts.push(item.extra);info.appendChild(el("div","rm",esc(parts.join(" . "))));card.appendChild(img);card.appendChild(info);card.addEventListener("click",function(){ST.selectedItem=item;renderPanel(null);});c.appendChild(card);if(item.source==="rawg")fetchSteamGrid(item.title).then(function(cv){if(cv){item.poster=cv;img.src=cv;}});});}
async function searchTMDB(q,kind){var res=await fetch(PROXY+"/tmdb/search/"+kind+"?language=fr-FR&query="+encodeURIComponent(q));if(!res.ok)throw new Error("TMDB "+res.status);var d=await res.json();return (d.results||[]).slice(0,20).map(function(r){return{source:"tmdb",id:r.id,title:kind==="movie"?r.title:r.name,year:(kind==="movie"?r.release_date:r.first_air_date||"").slice(0,4),poster:r.poster_path?TMDB_IMG+r.poster_path:null,rating:r.vote_average?Math.round(r.vote_average):null,raw:r};});}
async function searchRAWG(q){var res=await fetch(PROXY+"/rawg/games?search="+encodeURIComponent(q)+"&page_size=15");if(!res.ok)throw new Error("RAWG "+res.status);var d=await res.json();return (d.results||[]).map(function(g){return{source:"rawg",id:g.id,title:g.name,year:(g.released||"").slice(0,4),poster:g.background_image,platforms:(g.platforms||[]).map(function(p){return p.platform.name;}),raw:g};});}
async function searchMusic(q){var res=await fetch("https://itunes.apple.com/search?term="+encodeURIComponent(q)+"&media=music&entity=album&limit=15");if(!res.ok)throw new Error("Music "+res.status);var d=await res.json();return (d.results||[]).map(function(a){return{source:"music",id:a.collectionId,title:a.collectionName,year:(a.releaseDate||"").slice(0,4),author:a.artistName,poster:a.artworkUrl100?a.artworkUrl100.replace("100x100","400x400"):null,raw:a};});}
async function searchGoogleBooks(q,type){var query=q;if(type==="BD")query+=" bande dessinee comics";if(type==="Manga")query+=" manga";if(type==="Roman")query+=" roman fiction";if(type==="Livre")query+=" essai biographie";var res=await fetch(PROXY+"/books/v1/volumes?maxResults=20&q="+encodeURIComponent(query)+"&filter=full");if(!res.ok)throw new Error("Books "+res.status);var d=await res.json();return (d.items||[]).map(function(it){var v=it.volumeInfo||{};var p=v.imageLinks?(v.imageLinks.thumbnail||v.imageLinks.smallThumbnail):null;if(!p&&it.id)p="https://books.google.com/books/content?id="+it.id+"&printsec=frontcover&img=1&zoom=1";return{source:"book",id:it.id,title:v.title+(v.subtitle?" - "+v.subtitle:""),year:(v.publishedDate||"").slice(0,4),author:(v.authors||[]).join(", "),poster:p,categories:v.categories||[],raw:v};});}
async function searchOpenLib(q,type){var query=q;if(type==="BD")query+=" graphic novel";if(type==="Manga")query+=" manga";var res=await fetch("https://openlibrary.org/search.json?q="+encodeURIComponent(query)+"&limit=20&fields=title,author_name,first_publish_year,cover_i,key,subject");if(!res.ok)throw new Error("OpenLib "+res.status);var d=await res.json();return (d.docs||[]).map(function(x){return{source:"openlib",id:x.key,title:x.title,year:x.first_publish_year?String(x.first_publish_year):"",author:(x.author_name||[]).join(", "),poster:x.cover_i?("https://covers.openlibrary.org/b/id/"+x.cover_i+"-M.jpg"):null,categories:x.subject||[],raw:x};});}
function relevantForType(item,type){var cats=Array.isArray(item.categories)?item.categories.join(" "):"";var t=(cats+" "+(item.title||"")).toLowerCase();var comic=t.indexOf("comic")>=0||t.indexOf("graphic novel")>=0||t.indexOf("bande dessin")>=0;var manga=t.indexOf("manga")>=0;if(type==="BD")return !(manga&&!comic);if(type==="Manga")return manga||!comic;if(type==="Roman")return !(comic||manga);return true;}
async function searchBooks(q,type){var r=await Promise.allSettled([searchGoogleBooks(q,type),searchOpenLib(q,type)]);var a=r[0].status==="fulfilled"?r[0].value:[];var b=r[1].status==="fulfilled"?r[1].value:[];var m=a.concat(b).filter(function(i){return relevantForType(i,type);});var seen={};return m.filter(function(i){var k=norm(i.title).slice(0,30);if(!k||seen[k])return false;seen[k]=1;return true;});}
async function fetchSteamGrid(n){try{var s=await fetch(PROXY+"/steamgrid/search/autocomplete/"+encodeURIComponent(n));if(!s.ok)return null;var sd=await s.json();if(!sd.success||!sd.data||!sd.data.length)return null;var g=await fetch(PROXY+"/steamgrid/grids/game/"+sd.data[0].id+"?dimensions=600x900&styles=alternate");if(!g.ok)return null;var gd=await g.json();if(!gd.success||!gd.data||!gd.data.length)return null;return gd.data[0].url;}catch(e){return null;}}
function addRecent(t){var r=JSON.parse(localStorage.getItem("recent_searches")||"[]");r=[t].concat(r.filter(function(x){return x!==t;})).slice(0,6);localStorage.setItem("recent_searches",JSON.stringify(r));ST.recent=r;}
function showRecent(){var p=$("search-menu-body");if(!p)return;p.innerHTML="";if(!ST.recent.length)p.appendChild(el("div","empty","Aucune recherche recente."));ST.recent.forEach(function(t){var b=el("button","wide");b.innerHTML='<span class="ic">'+ic("clock")+'</span><span>'+esc(t)+'</span>';b.style.justifyContent="flex-start";b.style.marginBottom="8px";b.addEventListener("click",function(){var si=$("search-input");if(si)si.value=t;hideOverlay("search-menu-overlay");runSearch();});p.appendChild(b);});showOverlay("search-menu-overlay");}
function flatten(e){return{titre:e.titre,description:descriptionOf(e),type:e.type,note:e.note!=null?e.note:"",statut:statutStr(e),horodatage:e.dateFin||""};}
function flattenTSV(e){var status="Fini";if(e.enCours)status="En cours";else if(e.aVoir)status="A voir";return{titre:e.titre||"",type:e.type||"",note:e.note!=null?String(e.note):"",description:descriptionOf(e),collection:e.inCollection?"oui":"",support:e.support||"",statut:status,dateFin:e.dateFin||"",id:e.id||""};}
async function copyTSV(){var clean=function(v){return String(v==null?"":v).replace(/[\t\r\n]+/g," ");};var rows=[["Oeuvre","Type","Note","Entree","Collection","Support","Statut","Date","ID"]];ST.entries.forEach(function(e){var f=flattenTSV(e);rows.push([clean(f.titre),clean(f.type),clean(f.note),clean(f.description),clean(f.collection),clean(f.support),clean(f.statut),clean(f.dateFin),clean(f.id)]);});var text=rows.map(function(r){return r.join("\t");}).join("\n");try{await navigator.clipboard.writeText(text);toast("Copie ! Colle en A1.");}catch(e){var ta=el("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();toast("Copie !");}}
function copyTSVMonth(y,m){var clean=function(v){return String(v==null?"":v).replace(/[\t\r\n]+/g," ");};var rows=[["Oeuvre","Type","Note","Entree","Collection","Support","Statut","Date","ID"]];ST.entries.forEach(function(e){var p=parseDateFR(e.dateFin);if(p&&p.y===y&&p.mo===m){(e.journal||[]).forEach(function(x){var f=flattenTSV(e);var entryText=x.kind==="time"?x.ts+" : "+x.text:(x.kind==="ep"?("S"+pad2(x.s)+"E"+pad2(x.e)+(x.note!=null?" . "+x.note+"/10":"")+(x.text?" : "+x.text:"")):x.text);rows.push([clean(f.titre),clean(f.type),clean(f.note),clean(entryText),clean(f.collection),clean(f.support),clean(f.statut),clean(f.dateFin),clean(f.id)]);});}});var text=rows.map(function(r){return r.join("\t");}).join("\n");try{navigator.clipboard.writeText(text).then(function(){toast("Journal du mois copie !");});}catch(e){var ta=el("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();toast("Copie !");}}
function copyTSVAll(){copyTSV();}
async function syncSheet(){var url=localStorage.getItem("sheet_url");if(!url){toast("Configure l'URL dans Option.");switchView("options");return;}toast("Envoi...",2500);try{var res=await fetch(url,{method:"POST",body:JSON.stringify({action:"sync_all",entries:ST.entries.map(flatten)})});if(res.ok)toast("Sheet mis a jour");else toast("Erreur webhook "+res.status,3000);}catch(err){toast("Erreur sync. Utilise Copier.",3000);}}
async function exportJSON(){var data={version:"V10",exportDate:new Date().toISOString(),settings:settingsLoad(),customTypes:loadCustomTypes(),sheetUrl:localStorage.getItem("sheet_url")||"",entries:ST.entries};var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});var u=URL.createObjectURL(blob);var a=el("a");a.href=u;a.download="ma-collection-"+new Date().toISOString().slice(0,10)+".json";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(u);localStorage.setItem("last_backup",String(Date.now()));toast("Backup exporte");}
function importJSON(){var inp=el("input");inp.type="file";inp.accept="application/json";inp.addEventListener("change",function(ev){var f=ev.target.files[0];if(!f)return;var r=new FileReader();r.onload=async function(e){try{var data=JSON.parse(e.target.result);var list=data.entries||(Array.isArray(data)?data:[]);var ids={};ST.entries.forEach(function(x){ids[x.id]=1;});var added=0,skipped=0;for(var i=0;i<list.length;i++){var en=list[i];if(en&&en.id&&!ids[en.id]){if(!en.titre)en.titre="Sans titre";if(!en.dateAjout)en.dateAjout=new Date().toISOString();await dbPut(en);added++;}else skipped++;}if(data.settings)settingsSave(Object.assign({},SETTINGS_DEFAULTS,data.settings));if(data.customTypes)saveCustomTypes(data.customTypes);if(data.sheetUrl)localStorage.setItem("sheet_url",data.sheetUrl);applySettings();buildTypeDropdown();refreshAll();toast("Import : "+added+" ajoute(s), "+skipped+" ignore(s)");}catch(err){toast("JSON invalide.",3000);}};r.readAsText(f);});inp.click();}
async function startEAN(cb){
if(!("BarcodeDetector" in window)){ST.subBackFn=function(){openEANModal();};var body=el("div");var inp=el("input");inp.placeholder="Code EAN...";inp.inputMode="numeric";body.appendChild(inp);setModal("EAN manuel",body,[["Valider","primary",function(){var v=inp.value.trim();if(v)cb(v);else toast("Code vide.");}],["Annuler","",closeOrBack]]);return;}
try{
var stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
showOverlay("poster-overlay");
var pi=$("poster-img");if(pi)pi.style.display="none";
var vid=document.createElement("video");
vid.style.flex="1";vid.style.width="100%";vid.style.objectFit="cover";vid.playsInline=true;
vid.srcObject=stream;vid.play();
var po=$("poster-overlay");if(po)po.insertBefore(vid,po.querySelector(".bar"));
var det=new BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e"]});
var timer=setInterval(async function(){
try{
var codes=await det.detect(vid);
if(codes.length){
clearInterval(timer);
stream.getTracks().forEach(function(t){t.stop();});
vid.remove();
if(pi)pi.style.display="";
hideOverlay("poster-overlay");
cb(codes[0].rawValue);
}
}catch(e){}
},400);
var pc=$("poster-close");
if(pc)pc.onclick=function(){clearInterval(timer);stream.getTracks().forEach(function(t){t.stop();});vid.remove();if(pi)pi.style.display="";hideOverlay("poster-overlay");};
}catch(e){toast("Camera indisponible.",3000);ST.subBackFn=function(){openEANModal();};var body=el("div");var inp=el("input");inp.placeholder="Code EAN...";inp.inputMode="numeric";body.appendChild(inp);setModal("EAN manuel",body,[["Valider","primary",function(){var v=inp.value.trim();if(v)cb(v);else toast("Code vide.");}],["Annuler","",closeOrBack]]);}
}
function wrapText(ctx,text,x,y,maxW,lh,maxLines){var words=text.split(" ");var line="";var n=0;for(var i=0;i<words.length;i++){var test=line+words[i]+" ";if(ctx.measureText(test).width>maxW&&line){ctx.fillText(line.trim(),x,y);y+=lh;line=words[i]+" ";n++;if(n>=maxLines-1){var rest=words.slice(i).join(" ");if(ctx.measureText(line+rest).width>maxW){ctx.fillText((line+"...").trim(),x,y);}else{ctx.fillText((line+rest).trim(),x,y);}return y+lh;}}else line=test;}ctx.fillText(line.trim(),x,y);return y+lh;}
async function shareJPG(e){
toast("Generation...");
var W=600,H=840;
var cv=document.createElement("canvas");
cv.width=W;cv.height=H;
var ctx=cv.getContext("2d");
function drawBG(){
var g=ctx.createLinearGradient(0,0,W,H);
g.addColorStop(0,"#0D0A1F");g.addColorStop(1,"#1F1738");
ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
ctx.strokeStyle="#B24BF3";ctx.lineWidth=3;ctx.strokeRect(14,14,W-28,H-28);
}
function drawTexts(){
ctx.fillStyle="#EFECE6";
ctx.font="600 32px Georgia,serif";
ctx.textAlign="center";
wrapText(ctx,e.titre,W/2,560,W-90,38,2);
ctx.fillStyle="#B24BF3";
ctx.font="600 24px monospace";
ctx.fillText((e.note!=null?e.note+"/10":"--/10")+"  "+statutStr(e),W/2,650);
ctx.fillStyle="#8B83A8";
ctx.font="16px monospace";
ctx.fillText(e.type+(e.dateFin?" . "+formatDate(e.dateFin):""),W/2,682);
ctx.fillStyle="#8B83A8";
ctx.font="13px monospace";
ctx.fillText("Ma Collection",W/2,H-36);
}
var img=null;
var src=e.posterThumb||"";
if(src&&src.indexOf("data:")===0){
img=new Image();
try{await new Promise(function(res,rej){img.onload=res;img.onerror=rej;img.src=src;});}catch(err){img=null;}
}
drawBG();
if(img&&img.complete&&img.naturalWidth){
try{ctx.drawImage(img,(W-300)/2,60,300,450);}catch(err){}
}
drawTexts();
var url=null;
try{url=cv.toDataURL("image/jpeg",0.9);}
catch(err){ctx.clearRect(0,0,W,H);drawBG();drawTexts();url=cv.toDataURL("image/jpeg",0.9);}
var a=el("a");
a.href=url;
a.download="ma-collection-"+norm(e.titre)+".jpg";
document.body.appendChild(a);
a.click();
a.remove();
toast("Image enregistree");
}
var deferredPrompt=null;
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();deferredPrompt=e;});
function triggerInstall(){if(deferredPrompt)deferredPrompt.prompt();else toast("Menu -> Installer l'application.");}
function renderFilterChips(){
var typeContainer=$("filter-type-chips");if(typeContainer){
typeContainer.innerHTML="";
var allBtn=el("div","chip"+(ST.filterType==="all"?" on":""),"Tous");
allBtn.addEventListener("click",function(){ST.filterType="all";renderFilterChips();renderCollection();});
typeContainer.appendChild(allBtn);
CORE_TYPES.forEach(function(t){
var c=el("div","chip"+(ST.filterType===t.name?" on":""),'<span class="ic">'+ic(t.icon)+'</span>'+t.name);
c.addEventListener("click",function(){ST.filterType=(ST.filterType===t.name?"all":t.name);renderFilterChips();renderCollection();});
typeContainer.appendChild(c);
});
}
var supContainer=$("filter-support-chips");if(supContainer){
supContainer.innerHTML="";
[["all","Tous"],["phys","Physique"],["demat","Dematerialise"]].forEach(function(f){
var c=el("div","chip"+(ST.filterSupport===f[0]?" on":""),f[1]);
c.addEventListener("click",function(){ST.filterSupport=f[0];renderFilterChips();renderCollection();});
supContainer.appendChild(c);
});
}
var sortContainer=$("filter-sort-chips");if(sortContainer){
sortContainer.innerHTML="";
[["date-desc","Date down"],["titre-asc","Titre up"],["type","Type"],["support","Support"],["note-desc","Note down"]].forEach(function(o){
var c=el("div","chip"+(ST.filterSort===o[0]?" on":""),o[1]);
c.addEventListener("click",function(){ST.filterSort=o[0];renderFilterChips();renderCollection();});
sortContainer.appendChild(c);
});
}
}
function renderCollection(){
var list=ST.entries.filter(function(e){return e.inCollection;});
var q=norm(ST.colQuery);
if(q)list=list.filter(function(e){return norm(e.titre).indexOf(q)>=0||norm(e.type).indexOf(q)>=0||norm(e.support||"").indexOf(q)>=0;});
if(ST.filterType!=="all")list=list.filter(function(e){return e.type===ST.filterType;});
if(ST.filterSupport==="phys")list=list.filter(function(e){return e.support&&e.support!=="D\u00e9mat\u00e9rialis\u00e9"&&e.support!=="Streaming";});
else if(ST.filterSupport==="demat")list=list.filter(function(e){return e.support==="D\u00e9mat\u00e9rialis\u00e9"||e.support==="Streaming";});
var byDate=function(e){var p=parseDateFR(e.dateFin);return p?p.y*10000+p.mo*100+p.d:0;};
if(ST.filterSort==="date-desc")list.sort(function(a,b){return byDate(b)-byDate(a);});
else if(ST.filterSort==="date-asc")list.sort(function(a,b){return byDate(a)-byDate(b);});
else if(ST.filterSort==="titre-asc")list.sort(function(a,b){return a.titre.localeCompare(b.titre,"fr");});
else if(ST.filterSort==="type")list.sort(function(a,b){return a.type.localeCompare(b.type,"fr");});
else if(ST.filterSort==="support")list.sort(function(a,b){return (a.support||"").localeCompare(b.support||"","fr");});
else if(ST.filterSort==="note-desc")list.sort(function(a,b){return (b.note!=null?b.note:-1)-(a.note!=null?a.note:-1);});
var grid=$("col-grid");if(!grid)return;
grid.innerHTML="";
if(!list.length){grid.appendChild(emptyBox("library","Aucune oeuvre dans ta bibliotheque."));return;}
list.forEach(function(e){grid.appendChild(collectionCard(e));});
}
function openQuickNoteModal(){
var body=el("div");
body.appendChild(el("div","","Choisis une oeuvre ou laisse vide pour une note libre."));
var sel=el("select");sel.id="qn-select";
var optEmpty=el("option","","Note libre (sans oeuvre)");optEmpty.value="";sel.appendChild(optEmpty);
ST.entries.forEach(function(e){
var o=el("option","",esc(e.titre));o.value=e.id;sel.appendChild(o);
});
body.appendChild(sel);
var kindChips=el("div","chips small");kindChips.style.marginTop="16px";
var selectedKind="free";
[["time","Horodate","clock"],["free","Libre","pen"],["ep","Saison/Episode","tv"]].forEach(function(x){
var c=el("div","chip"+(x[0]==="free"?" on":""),'<span class="ic">'+ic(x[2])+"</span>"+x[1]);
c.addEventListener("click",function(){
selectedKind=x[0];
kindChips.querySelectorAll(".chip").forEach(function(y){y.classList.remove("on");});
c.classList.add("on");
});
kindChips.appendChild(c);
});
body.appendChild(kindChips);
var ta=el("textarea");ta.id="qn-free-text";ta.placeholder="Ta note libre...";ta.rows=4;body.appendChild(ta);
setModal("Nouvelle note",body,[["Enregistrer","primary",function(){
var entryId=sel.value;
var text=ta.value.trim();
if(!text){toast("Entre un texte.");return;}
if(entryId){
var entry=ST.entries.find(function(e){return e.id===entryId;});
if(entry){
if(!entry.journal)entry.journal=[];
var obj;
if(selectedKind==="time"){obj={kind:"time",ts:nowStamp(),text:text,at:Date.now()};}
else if(selectedKind==="ep"){obj={kind:"ep",s:0,e:0,note:null,text:text,at:Date.now()};}
else{obj={kind:"free",text:text,at:Date.now()};}
entry.journal.push(obj);
dbPut(entry).then(function(){toast("Note ajoutee");closeModal();refreshAll();});
}
}else{
var fakeEntry={id:"libre_"+Date.now(),titre:"Note libre",type:"Livre",journal:[{kind:selectedKind==="time"?"time":"free",ts:selectedKind==="time"?nowStamp():undefined,text:text,at:Date.now()}],dateFin:todayFR(),dateAjout:new Date().toISOString()};
dbPut(fakeEntry).then(function(){toast("Note libre ajoutee");closeModal();refreshAll();});
}
}],["Annuler","",closeModal]]);
}
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
var searchInput=$("search-input");
if(searchInput)searchInput.addEventListener("keydown",function(e){if(e.key==="Enter")runSearch();});
var loupe=$("search-loupe");
if(loupe)loupe.addEventListener("click",runSearch);
var colLoupe=$("col-loupe");
if(colLoupe)colLoupe.addEventListener("click",function(){ST.colQuery=$("col-search").value;renderCollection();});
var menuBtn=$("search-menu-btn");
if(menuBtn)menuBtn.addEventListener("click",function(){
var body=$("search-menu-body");if(!body)return;
var title=document.querySelector("#search-menu-overlay .m-title");
if(title)title.textContent="Plus...";
body.innerHTML="";
function mbtn(iconn,label,fn){
var b=el("button","wide");
b.innerHTML='<span class="ic">'+ic(iconn)+'</span><span>'+label+'</span>';
b.style.justifyContent="flex-start";
b.style.minHeight="52px";
b.style.marginBottom="10px";
b.addEventListener("click",fn);
body.appendChild(b);
}
mbtn("clock","Recherches recentes",function(){hideOverlay("search-menu-overlay");showRecent();});
mbtn("plus","Ajout manuel",function(){hideOverlay("search-menu-overlay");ST.selectedItem=null;renderPanel(null);});
mbtn("sliders-horizontal","Recherche avancee",function(){hideOverlay("search-menu-overlay");var p=$("adv-panel");if(p)p.classList.toggle("hidden");});
showOverlay("search-menu-overlay");
});
var typeBtn=$("type-btn");
if(typeBtn)typeBtn.addEventListener("click",function(){
typeBtn.classList.toggle("open");
var list=$("type-list");if(list)list.classList.toggle("open");
});
var colSearch=$("col-search");
if(colSearch)colSearch.addEventListener("input",function(e){ST.colQuery=e.target.value;renderCollection();});
var colFilterBtn=$("col-filter-btn");
if(colFilterBtn)colFilterBtn.addEventListener("click",function(){
var fp=$("filter-panel-overlay");if(fp)fp.classList.add("on");
renderFilterChips();
});
var filterBack=$("filter-back");
if(filterBack)filterBack.addEventListener("click",function(){var fp=$("filter-panel-overlay");if(fp)fp.classList.remove("on");});
var filterApply=$("filter-apply");
if(filterApply)filterApply.addEventListener("click",function(){var fp=$("filter-panel-overlay");if(fp)fp.classList.remove("on");renderCollection();});
var filterReset=$("filter-reset");
if(filterReset)filterReset.addEventListener("click",function(){ST.filterType="all";ST.filterSupport="all";ST.filterSort="date-desc";renderFilterChips();renderCollection();});
var journalAddBtn=$("journal-add-btn");
if(journalAddBtn)journalAddBtn.addEventListener("click",openQuickNoteModal);
var bilanMini=$("bilan-mini");
if(bilanMini)bilanMini.addEventListener("click",function(){var co=$("calendar-overlay");if(co)co.classList.add("on");renderCalendar();});
var calBack=$("cal-back");
if(calBack)calBack.addEventListener("click",function(){var co=$("calendar-overlay");if(co)co.classList.remove("on");});
var calPrev=$("cal-prev");
if(calPrev)calPrev.addEventListener("click",function(){ST.calDate.setMonth(ST.calDate.getMonth()-1);renderCalendar();});
var calNext=$("cal-next");
if(calNext)calNext.addEventListener("click",function(){ST.calDate.setMonth(ST.calDate.getMonth()+1);renderCalendar();});
var mBack=$("m-back");if(mBack)mBack.addEventListener("click",closeOrBack);
var rBack=$("r-back");if(rBack)rBack.addEventListener("click",closeReader);
var rDelete=$("r-delete");
if(rDelete)rDelete.addEventListener("click",function(){
if(ST.currentReaderEntry&&ST.currentReaderJournalIdx!=null){
var entry=ST.currentReaderEntry;var idx=ST.currentReaderJournalIdx;
showConfirm("Supprimer cette entree ?","",function(){entry.journal.splice(idx,1);dbPut(entry).then(function(){toast("Entree supprimee");closeReader();refreshAll();});});
}
});
var rEdit=$("r-edit");
if(rEdit)rEdit.addEventListener("click",function(){
if(ST.currentReaderEntry&&ST.currentReaderJournalIdx!=null){
var entry=ST.currentReaderEntry;var idx=ST.currentReaderJournalIdx;var x=entry.journal[idx];
closeReader();quickNoteOpen(entry,x?x.text:"",x?x.kind:"time",idx);
}
});
var qnBack=$("qn-back");if(qnBack)qnBack.addEventListener("click",quickNoteClose);
var qnCancel=$("qn-cancel");if(qnCancel)qnCancel.addEventListener("click",quickNoteClose);
var qnSave=$("qn-save");if(qnSave)qnSave.addEventListener("click",quickNoteSave);
var menuBack=$("menu-back");if(menuBack)menuBack.addEventListener("click",closeMenu);
var searchMenuBack=$("search-menu-back");if(searchMenuBack)searchMenuBack.addEventListener("click",function(){hideOverlay("search-menu-overlay");});
var confirmBack=$("confirm-back");if(confirmBack)confirmBack.addEventListener("click",function(){hideOverlay("confirm-overlay");});
var posterClose=$("poster-close");if(posterClose)posterClose.addEventListener("click",function(){hideOverlay("poster-overlay");});
document.addEventListener("click",function(e){
if(!e.target.closest('.type-dropdown')){
var btn=$("type-btn");if(btn)btn.classList.remove("open");
var list=$("type-list");if(list)list.classList.remove("open");
}
});
["modal-overlay","reader-overlay","qn-overlay","menu-overlay","search-menu-overlay","confirm-overlay","filter-panel-overlay","calendar-overlay"].forEach(function(id){
var ov=$(id);
if(ov)ov.addEventListener("click",function(e){if(e.target===ov){
if(id==="modal-overlay")closeOrBack();
else if(id==="reader-overlay")closeReader();
else if(id==="qn-overlay")quickNoteClose();
else if(id==="menu-overlay")closeMenu();
else hideOverlay(id);
}});
});
var savedView=null;
try{savedView=sessionStorage.getItem("lastView");}catch(e){}
if(savedView&&["search","collection","journal","options"].indexOf(savedView)>=0)ST.view=savedView;
switchView(ST.view);
scheduleGitHubBackup();
if("serviceWorker"in navigator){try{navigator.serviceWorker.register("./sw.js");}catch(e){}}
}
init();