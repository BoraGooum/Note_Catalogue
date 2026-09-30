// ==========================================
// 1. ÉTAT GLOBAL ET CONSTANTES
// ==========================================
var ST = {
  entries: [], view: "search", colQuery: "", calDate: new Date(), calSel: null, calView: null,
  calMode: "journal", calPickCb: null, editing: null, selectedItem: null, currentType: "Film",
  panelType: "Film", currentNote: null, isCoeur: false, isEnc: false, isVoir: false, isFini: false,
  isInCollection: false, draftJournal: [], panelPoster: "", panelThumb: "", panelImage: "",
  galerie: [], qnEntry: null, qnKind: "time", qnEditIdx: null, qnDest: null, pickerVal: null,
  recent: [], filterType: "all", filterSupport: "all", filterSort: { key: "date", dir: "desc" },
  advFields: { plateforme: "", dateAchat: "", edition: "", bonus: [], support: "", packaging: "", ean: "", url: "", contenu: "", imageUrl: "" },
  draft: { titre: "", date: "", comment: "", sub: "" }, currentReaderEntry: null,
  currentReaderJournalIdx: null, lastJournalCount: 0, searchToken: 0, journalSheetRebuild: null, _libPaint: null
};

var overlayStack = [], zCounter = 0;
var KINDS = [["time", "Note datée", "calendar"], ["free", "Instantané", "pen"], ["ep", "Épisode", "tv"], ["session", "Session", "timer"], ["pages", "Pages", "file-text"]];
var COLOR_SWATCHES = ["#B24BF3", "#7F5AF0", "#C0392B", "#E74C3C", "#F59E0B", "#FFD700", "#10B981", "#2CB67D", "#3B82F6", "#06B6D4", "#EC4899", "#FF5DA2", "#94A3B8", "#8E44AD", "#16A34A", "#EA580C"];
var LUCIDE_NAMES = "film tv gamepad-2 book-open image scroll disc music mic headphones monitor smartphone tablet laptop cpu hard-drive usb battery wifi bluetooth box package package-open gift tag tags bookmark star heart thumb-up clock calendar calendar-check hourglass timer alarm-clock history pen edit pencil file-text notebook-pen notebook clipboard clipboard-list list grid layout-grid layers stack archive inbox folder folder-open search zoom-in zoom-out maximize-2 expand eye eye-off lock unlock key camera image-plus images clapperboard megaphone radio satellite globe map map-pin compass navigation anchor ship plane train car bike footprints mountain tree-pine leaf flower-2 sun moon cloud droplets flame zap sparkles palette brush spray-can wand-2 scissors utensils coffee wine beer cake-slice ice-cream apple cherry grape dumbbell trophy medal flag crown gem coins banknote wallet credit-card shopping-bag shopping-cart store briefcase backpack graduation-cap school baby users user smile frown ghost mask drama theater ticket concert barcode check eject clipboard alert-triangle".split(" ");

// ==========================================
// 2. ICÔNES LUCIDE
// ==========================================
window.I = window.I || {};
if (!window.I.star) window.I.star = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
if (!window.I.flag) window.I.flag = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>';
if (!window.I['eject']) window.I['eject'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 11h16l-8-8z"/><path d="M4 19h16"/></svg>';
if (!window.I['clipboard']) window.I['clipboard'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>';
if (!window.I['alert-triangle']) window.I['alert-triangle'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';

// ==========================================
// 3. UTILITAIRES
// ==========================================
function el(t, c, h) { var d = document.createElement(t); if (c) d.className = c; if (h != null) d.innerHTML = h; return d; }
function $(id) { return document.getElementById(id); }
function fieldBox(l, c) { var d = el("div", "field"); d.appendChild(el("span", "flabel", l)); d.appendChild(c); return d; }
function btn(l, i, c, f) { var b = el("button", c || ""); b.innerHTML = (i ? '<span class="ic">' + ic(i) + "</span>" : "") + "<span>" + esc(l) + "</span>"; if (f) b.addEventListener("click", f); return b; }
function emptyBox(i, t) { var d = el("div", "empty"); d.innerHTML = '<span class="ic">' + ic(i) + "</span>" + esc(t); return d; }
function toast(m, ms) { var e = $("toast"); if (!e) return; e.textContent = m; e.classList.add("show"); setTimeout(function() { e.classList.remove("show"); }, ms || 1800); }
function valueIconHTML(it) { return '<span class="ic" style="color:' + (it && it.color ? it.color : "var(--acc)") + '">' + ic((it && it.icon) || "tag") + "</span>"; }
function burstHearts(b) {
  if (document.body.dataset.anim === "off") return;
  for (var i = 0; i < 6; i++) {
    var s = el("span", "hb"); s.innerHTML = ic("heart");
    var a = (Math.PI * 2 / 6) * i + Math.random() * 0.4, d = 26 + Math.random() * 16;
    s.style.setProperty("--dx", Math.cos(a) * d + "px"); s.style.setProperty("--dy", Math.sin(a) * d + "px"); s.style.animationDelay = (i * 28) + "ms";
    b.appendChild(s); setTimeout((function(n) { return function() { if (n.parentNode) n.remove(); }; })(s), 900);
  }
}
function makeHeartButton(on, cb) {
  var b = el("button", "heart-btn" + (on ? " on" : "")); b.setAttribute("aria-label", "Coup de cœur"); b.innerHTML = '<span class="ic">' + ic("heart") + "</span>";
  b.addEventListener("click", function() { var n = !b.classList.contains("on"); b.classList.toggle("on", n); burstHearts(b); if (cb) cb(n); }); return b;
}

// ==========================================
// 4. OVERLAYS ET MODALS
// ==========================================
function showOverlay(id) {
  var e = $(id); if (!e) return;
  e.querySelectorAll("[data-ic]").forEach(function(s) { s.innerHTML = ic(s.dataset.ic); });
  zCounter++; e.style.zIndex = 200 + zCounter; e.classList.add("on");
  if (overlayStack.indexOf(id) < 0) overlayStack.push(id);
  try { history.pushState(null, ""); } catch(err) {}
}
function hideOverlay(id) { var e = $(id); if (!e) return; e.classList.remove("on"); var i = overlayStack.indexOf(id); if (i >= 0) overlayStack.splice(i, 1); }
window.addEventListener("popstate", function() { var id = overlayStack[overlayStack.length - 1]; if (!id) return; var e = $(id); if (e) e.classList.remove("on"); overlayStack.pop(); });
function closeModal() { hideOverlay("modal-overlay"); var b = $("m-body"); if (b) b.innerHTML = ""; var f = $("m-foot"); if (f) f.innerHTML = ""; ST.editing = null; ST._libPaint = null; }
function closeReader() { hideOverlay("reader-overlay"); ST.currentReaderEntry = null; ST.currentReaderJournalIdx = null; }
function closeMenu() { hideOverlay("menu-overlay"); ST.journalSheetRebuild = null; }
function setModal(t, bn, ft) {
  var x = $("m-title"); if (x) x.textContent = t;
  var b = $("m-body"); if (b) { b.innerHTML = ""; b.appendChild(bn); }
  var f = $("m-foot");
  if (f) {
    f.innerHTML = "";
    (ft || []).forEach(function(bt) { var n = el("button", bt[1] || ""); n.innerHTML = (bt[3] ? '<span class="ic">' + ic(bt[3]) + "</span>" : "") + "<span>" + esc(bt[0]) + "</span>"; n.addEventListener("click", bt[2]); f.appendChild(n); });
  }
  showOverlay("modal-overlay");
}
function setSheet(t, bn, ft) {
  var x = $("menu-title"); if (x) x.textContent = t;
  var b = $("menu-body"); if (!b) return; b.innerHTML = ""; b.appendChild(bn);
  (ft || []).forEach(function(bt) { var n = el("button", (bt[1] || "") + " wide"); n.style.marginTop = "10px"; n.innerHTML = (bt[3] ? '<span class="ic">' + ic(bt[3]) + "</span>" : "") + "<span>" + esc(bt[0]) + "</span>"; n.addEventListener("click", bt[2]); b.appendChild(n); });
  showOverlay("menu-overlay");
}
function showConfirm(t, m, y, l) {
  if (typeof m === "function") { l = y; y = m; m = "Cette action est irréversible."; }
  if (l === "trash") l = /historique/i.test(t) ? "Effacer" : "Supprimer"; if (l === "trash-2") l = "Supprimer";
  var x = $("confirm-title"); if (x) x.textContent = t;
  var b = $("confirm-body"); if (b) b.innerHTML = '<p style="font-size:15px;line-height:1.6;">' + esc(m) + "</p>";
  var f = $("confirm-foot"); if (!f) return; f.innerHTML = "";
  var no = el("button", ""); no.innerHTML = "<span>Annuler</span>"; no.addEventListener("click", function() { hideOverlay("confirm-overlay"); });
  var ye = el("button", "primary"); ye.innerHTML = "<span>" + esc(l || "Confirmer") + "</span>"; ye.addEventListener("click", function() { hideOverlay("confirm-overlay"); if (y) y(); });
  f.appendChild(no); f.appendChild(ye); showOverlay("confirm-overlay");
}

// ==========================================
// 5. POSTERS ET STATUTS
// ==========================================
function neonClass(e) { return e.fini ? "n-fini" : e.aVoir ? "n-voir" : e.enCours ? "n-enc" : "n-fini"; }
function statIcon(e) { return e.fini ? ic("check") : e.aVoir ? ic("eye") : e.enCours ? ic("hourglass") : ic("check"); }
function renderPoster(e, sp) {
  var p = el("div", "poster " + neonClass(e));
  var im = el("img", "art"); im.src = e.posterThumb || e.posterUrl || NO_POSTER; im.alt = ""; im.loading = "lazy"; p.appendChild(im);
  if (e.note != null) {
    var so = noteSolid(e.note); if (so) { p.classList.add("has-note"); p.style.borderColor = so; }
    var pn = el("div", "pnote", e.note + "/10"); var nc = noteColors(e.note); if (nc) { pn.style.background = nc[0]; pn.style.color = nc[1]; } p.appendChild(pn);
  }
  if (e.coeur) p.appendChild(el("div", "pheart", ic("heart")));
  if (sp !== false) { var pb = progressBadge(e); if (pb) p.appendChild(el("div", "pp", esc(pb))); }
  var st = el("div", "pstat"); st.innerHTML = statIcon(e); p.appendChild(st); return p;
}
function syncPoster(e) {
  var h = $("d-poster"); if (!h) return;
  h.classList.remove("n-fini", "n-enc", "n-voir", "has-note"); h.classList.add(neonClass(e));
  var so = noteSolid(e.note); h.style.borderColor = so || ""; if (so) h.classList.add("has-note");
  var pn = h.querySelector(".pnote"); if (pn) { if (e.note != null) { pn.style.display = ""; pn.textContent = e.note + "/10"; var nc = noteColors(e.note); if (nc) { pn.style.background = nc[0]; pn.style.color = nc[1]; } } else pn.style.display = "none"; }
  var ps = h.querySelector(".pstat"); if (ps) ps.innerHTML = statIcon(e);
  var ph = h.querySelector(".pheart"); if (ph && !e.coeur) ph.remove(); if (!ph && e.coeur) h.insertBefore(el("div", "pheart", ic("heart")), h.querySelector(".pstat"));
  var pb = h.querySelector(".pp"), tx = progressBadge(e); if (pb && !tx) pb.remove(); if (!pb && tx) h.insertBefore(el("div", "pp", esc(tx)), h.querySelector(".pstat")); else if (pb) pb.textContent = tx;
}

// ==========================================
// 6. ÉPISODES ET SAISONS
// ==========================================
function epNoted(en, s) { var o = {}; (en.journal || []).forEach(function(x) { if (x.kind === "ep" && x.s === s) o[x.e] = 1; }); return o; }
function nextEpFor(en) {
  var ep = (en.journal || []).filter(function(x) { return x.kind === "ep"; });
  if (!ep.length) return { s: 1, e: 1 };
  var sm = 0; ep.forEach(function(x) { if (x.s > sm) sm = x.s; });
  var em = 0; ep.forEach(function(x) { if (x.s === sm && x.e > em) em = x.e; });
  return { s: sm, e: em + 1 };
}
function hasEp(en) { return en.type === "Série" || (en.journal || []).some(function(x) { return x.kind === "ep"; }); }
function nextEpButton(en) { var n = nextEpFor(en), b = el("button", "next-btn"); b.innerHTML = '<span class="ic">' + ic("check") + "</span><span>S" + pad2(n.s) + "E" + pad2(n.e) + "</span>"; b.addEventListener("click", function() { openEpisodeWindow(en); }); return b; }
function seasonsFromJournal(en) { var o = {}; (en.journal || []).forEach(function(x) { if (x.kind === "ep") o[x.s] = 1; }); var a = Object.keys(o).map(Number).sort(function(p, q) { return p - q; }); return a.length ? a : [1]; }
async function openEpisodeWindow(en, ps, pe) {
  var body = el("div"), loc = seasonsFromJournal(en), tmdb = null;
  if (en.tmdb_id) { try { tmdb = await fetchTMDBSeasons(en.tmdb_id); } catch(e) { tmdb = null; } }
  var seasons = tmdb && tmdb.length ? tmdb.map(function(s) { return { n: s.n, total: s.total }; }) : loc.map(function(n) { var nt = epNoted(en, n), mx = 0; for (var k in nt) if (+k > mx) mx = +k; return { n: n, total: mx + 8 }; });
  var cur = ps || seasons[0].n; if (!seasons.some(function(s) { return s.n === cur; })) cur = seasons[0].n;
  var pr = el("div", "season-row"); body.appendChild(pr);
  var hd = el("div", "ep-head"), stE = el("span", "st", ""), cnE = el("span", "cnt", ""); hd.appendChild(stE); hd.appendChild(cnE); body.appendChild(hd);
  var qk = el("div", "quick");
  function qb(l, i, f) { var b = el("button", "qbtn"); b.innerHTML = '<span class="ic">' + ic(i) + "</span><span>" + esc(l) + "</span>"; b.addEventListener("click", f); qk.appendChild(b); }
  qb("Jusqu'au suivant", "check", function() { toggleUpTo(en, cur); rb(); });
  qb("Tout cocher", "grid", function() { setAll(en, cur, true); rb(); });
  qb("Tout décocher", "x", function() { setAll(en, cur, false); rb(); });
  body.appendChild(qk); var gr = el("div", "ep-grid"); body.appendChild(gr);
  var inf = el("div", "status"); inf.style.textAlign = "center"; body.appendChild(inf);
  function rp() { pr.innerHTML = ""; seasons.forEach(function(s) { var p = el("button", "season-pill" + (s.n === cur ? " on" : ""), "<span>S" + pad2(s.n) + "</span>"); p.addEventListener("click", function() { cur = s.n; rb(); }); pr.appendChild(p); }); }
  function rb() {
    rp(); var so = seasons.filter(function(s) { return s.n === cur; })[0] || { n: cur, total: 8 }, nt = epNoted(en, cur), tot = so.total, sn = 0;
    for (var k in nt) sn++; stE.textContent = "Saison " + cur; cnE.textContent = sn + " / " + tot + " vus"; gr.innerHTML = "";
    for (var e = 1; e <= tot; e++) { (function(e) { var v = !!nt[e], c = el("div", "ep-cell" + (v ? " seen" : ""), "<span>" + e + "</span>"); if (v) c.insertAdjacentHTML("beforeend", '<svg class="chk" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>'); c.addEventListener("click", function() { toggleEp(en, cur, e); rb(); }); gr.appendChild(c); })(e); }
    inf.textContent = tmdb ? "" : "Saison sans total connu : la liste s'étend au besoin.";
  }
  rb(); setSheet("Saisons et épisodes : " + en.titre, body, [["Fermer", "", closeMenu, "x"]]);
}
function toggleEp(en, s, e) {
  if (!en.journal) en.journal = []; var ix = -1;
  for (var i = 0; i < en.journal.length; i++) { var x = en.journal[i]; if (x.kind === "ep" && x.s === s && x.e === e) { ix = i; break; } }
  if (ix >= 0) en.journal.splice(ix, 1); else en.journal.push({ kind: "ep", s: s, e: e, note: null, text: "Vu", at: Date.now() });
  dbPut(en).then(refreshAll);
}
function setAll(en, s, on) {
  if (!en.journal) en.journal = []; var nt = epNoted(en, s), mx = 0; for (var k in nt) if (+k > mx) mx = +k; var tot = Math.max(8, mx + 8);
  if (on) { for (var e = 1; e <= tot; e++) if (!nt[e]) en.journal.push({ kind: "ep", s: s, e: e, note: null, text: "Vu", at: Date.now() + e }); }
  else en.journal = en.journal.filter(function(x) { return !(x.kind === "ep" && x.s === s); });
  dbPut(en).then(refreshAll);
}
function toggleUpTo(en, s) {
  if (!en.journal) en.journal = []; var nt = epNoted(en, s), mx = 0; for (var k in nt) if (+k > mx) mx = +k;
  for (var e = 1; e <= mx + 1; e++) if (!nt[e]) en.journal.push({ kind: "ep", s: s, e: e, note: null, text: "Vu", at: Date.now() + e });
  dbPut(en).then(refreshAll);
}

// ==========================================
// 7. BOUTONS DE FICHE DÉTAILLÉE
// ==========================================
function detailValueBtn(i, l, k, v, f) { var b = el("button", "adv-btn" + (v ? " on" : "")); b.dataset.k = k; b.dataset.l = l; b.innerHTML = '<span class="ic">' + ic(i) + "</span>"; var s = el("span", "adv-lbl", esc(v || l)); b.appendChild(s); b.addEventListener("click", f); return b; }
function libToggleBtn(get, set) {
  var b = el("button", "adv-btn" + (get() ? " on" : "")); b.dataset.k = "biblio"; b.dataset.l = "Bibliothèque";
  function paint() { b.classList.toggle("on", !!get()); }
  b.innerHTML = '<span class="ic">' + ic("library") + '</span><span class="adv-lbl">Bibliothèque</span>';
  b.addEventListener("click", function() { set(!get()); paint(); }); ST._libPaint = paint; return b;
}
function updateAdvBtn(k, v) { var b = document.querySelector('#m-body .adv-btn[data-k="' + k + '"]'); if (!b) return; var x = b.querySelector(".adv-lbl"); if (x) x.textContent = v || b.dataset.l || ""; b.classList.toggle("on", !!v); }
function markCollection() { ST.isInCollection = true; if (ST._libPaint) ST._libPaint(); }
function detailStatusLabel(e) { if (e.fini) return "Fini"; var a = []; if (e.enCours) a.push("En cours"); if (e.aVoir) a.push("À voir"); return a.join(" · "); }
function statusText(st) { if (st.isFini) return "Fini"; return st.isEnc && st.isVoir ? "En cours · À voir" : st.isEnc ? "En cours" : st.isVoir ? "À voir" : ""; }
function journalCountLabel(e) { var n = (e.journal || []).length; return n ? n + " entrée" + (n > 1 ? "s" : "") : ""; }
function formStatusLabel() { if (ST.isFini) return "Fini"; var a = []; if (ST.isEnc) a.push("En cours"); if (ST.isVoir) a.push("À voir"); return a.join(" · "); }
function dateLabel(e) { if (e && e.dateFin) return formatDate(e.dateFin); if (e && e.dateAjout) { try { return new Date(e.dateAjout).toLocaleDateString("fr-FR"); } catch(err) {} } return ""; }

// ==========================================
// 8. COLLECTION ET CARTE
// ==========================================
function collectionCard(e) {
  var c = el("div", "grid-cell"); c.appendChild(renderPoster(e, true)); c.appendChild(el("div", "title", esc(e.titre)));
  var m = (e.support || "") + (e.packaging ? " · " + e.packaging : ""); if (m) c.appendChild(el("div", "meta", esc(m)));
  c.addEventListener("click", function(ev) { if (ev.target.closest("button")) return; showCollectionDetail(e); }); return c;
}

// ==========================================
// 9. GALERIE D'IMAGES
// ==========================================
function openImageZoom(u) { if (!u) return; var i = $("poster-img"); if (i) i.src = u; showOverlay("poster-overlay"); }
function openGalerieSheet(galerie, cb) {
  var b = el("div"); var list = el("div"); list.style.cssText = "display:flex;flex-direction:column;gap:10px;max-height:60vh;overflow-y:auto;";
  galerie.forEach(function(url, i) {
    var row = el("div"); row.style.cssText = "display:flex;gap:8px;align-items:center;";
    var thumb = el("img"); thumb.src = url; thumb.style.cssText = "width:60px;height:90px;object-fit:cover;border-radius:8px;border:1px solid var(--bd);cursor:pointer;";
    thumb.addEventListener("click", function() { openImageZoom(url); }); row.appendChild(thumb);
    var inp = el("input"); inp.value = url; inp.style.cssText = "flex:1;min-width:0;padding:8px;font-size:13px;";
    inp.addEventListener("change", function() { galerie[i] = inp.value.trim(); }); row.appendChild(inp);
    var del = el("button"); del.innerHTML = '<span class="ic">' + ic("trash-2") + "</span>"; del.style.cssText = "width:40px;height:40px;min-width:40px;padding:0;";
    del.addEventListener("click", function() { galerie.splice(i, 1); closeMenu(); openGalerieSheet(galerie, cb); }); row.appendChild(del); list.appendChild(row);
  });
  b.appendChild(list);
  var addRow = el("div"); addRow.style.cssText = "display:flex;gap:8px;margin-top:12px;";
  var addInp = el("input"); addInp.placeholder = "Ajouter une URL d'image…"; addInp.style.cssText = "flex:1;"; addRow.appendChild(addInp);
  var addBtn = btn("Ajouter", "plus", "", function() { var v = addInp.value.trim(); if (v) { galerie.push(v); closeMenu(); openGalerieSheet(galerie, cb); } });
  addRow.appendChild(addBtn); b.appendChild(addRow);
  setSheet("Galerie d'images", b, [["Valider", "primary", function() { cb(galerie); closeMenu(); }, "check"], ["Fermer", "", closeMenu, "x"]]);
}

// ==========================================
// 10. CONTENU ET IMAGE OBJET
// ==========================================
function openContenuSheet(text, cb) {
  var b = el("div"); var ta = el("textarea"); ta.value = text || ""; ta.style.minHeight = "260px"; ta.readOnly = true; ta.style.background = "var(--s2)"; ta.style.cursor = "default";
  var eb = btn("Modifier le contenu", "pen", "wide", function() { ta.readOnly = false; ta.style.background = "var(--s3)"; ta.style.cursor = "text"; ta.focus(); eb.style.display = "none"; });
  b.appendChild(ta); b.appendChild(eb); setSheet("Contenu et bonus", b, [["Valider", "primary", function() { cb(ta.value.trim()); closeMenu(); }, "check"], ["Fermer", "", closeMenu, "x"]]);
}
function openImageUrlSheet(e, cb) {
  var b = el("div"), ip = el("input"); ip.placeholder = "https://…"; ip.value = e.imageUrl || ""; b.appendChild(ip);
  var fi = el("input"); fi.type = "file"; fi.accept = "image/*"; fi.hidden = true;
  var bi = btn("Importer une photo", "folder", "wide", function() { fi.click(); });
  fi.addEventListener("change", function(ev) { var f = ev.target.files[0]; if (f) fileToResized(f, 600).then(function(u) { ip.value = u; }); });
  b.appendChild(bi); b.appendChild(fi); setSheet("Photo de l'objet", b, [["Valider", "primary", function() { cb(ip.value.trim()); closeMenu(); }, "check"], ["Annuler", "", closeMenu, "x"]]);
}
function openImageMenu(e, cb) {
  var b = el("div");
  b.appendChild(btn("Voir la photo", "maximize-2", "wide", function() { closeMenu(); openImageZoom(e.imageUrl); }));
  b.appendChild(btn("Remplacer", "pen", "wide", function() { closeMenu(); openImageUrlSheet(e, cb); }));
  b.appendChild(btn("Retirer", "trash", "wide", function() { closeMenu(); cb(""); }));
  setSheet("Photo de l'objet", b, [["Annuler", "", closeMenu, "x"]]);
}

// ==========================================
// 11. FICHE DÉTAILLÉE COMPLÈTE
// ==========================================
function showCollectionDetail(e) {
  var body = el("div"), hd = el("div", "detail-head"), pw = el("div", "detail-poster"), po = renderPoster(e, true);
  po.id = "d-poster"; var im = po.querySelector("img"); if (im) im.addEventListener("click", function() { openPosterZoom(im.src); });
  var zb = el("div", "zoom-btn"); zb.innerHTML = '<span class="ic">' + ic("maximize-2") + "</span><span>Agrandir</span>";
  zb.addEventListener("click", function() { openPosterZoom(im ? im.src : po.querySelector("img").src); }); po.appendChild(zb); pw.appendChild(po); hd.appendChild(pw);
  var inf = el("div"); inf.style.cssText = "flex:1;min-width:0;";
  var h2 = el("h2", "", esc(e.titre)); h2.style.cssText = "font-family:var(--ft);font-size:21px;margin-bottom:10px;"; inf.appendChild(h2);
  var tg = el("div", "tagline"); tg.appendChild(el("span", "tag", esc(e.type))); if (e.support) tg.appendChild(el("span", "tag", esc(e.support))); inf.appendChild(tg);
  var hr = el("div", "detail-heart"); hr.appendChild(makeHeartButton(!!e.coeur, function(on) { e.coeur = on; dbPut(e).then(function() { toast(on ? "Coup de cœur" : "Coup de cœur retiré"); syncPoster(e); refreshAll(); }); })); inf.appendChild(hr);
  if (hasEp(e)) inf.appendChild(nextEpButton(e)); hd.appendChild(inf); body.appendChild(hd);
  function save(p, l) { p(e); dbPut(e).then(function() { toast(l); syncPoster(e); refreshAll(); }); }
  var row = el("div", "form-row");
  row.appendChild(libToggleBtn(function() { return e.inCollection; }, function(v) { e.inCollection = v; dbPut(e).then(function() { toast(v ? "Ajouté à la bibliothèque" : "Retiré de la bibliothèque"); refreshAll(); }); }));
  row.appendChild(detailValueBtn("star", "Note", "note", e.note != null ? e.note + "/10" : "", function() { openNoteSheet(e.note, !!e.coeur, function(n, c) { updateAdvBtn("note", n != null ? n + "/10" : ""); save(function(x) { x.note = n; x.coeur = c; }, "Note enregistrée"); }); }));
  row.appendChild(detailValueBtn("flag", "Statuts", "statuts", detailStatusLabel(e), function() { openStatusSheet({ isEnc: !!e.enCours, isVoir: !!e.aVoir, isFini: !!e.fini }, function(st) { updateAdvBtn("statuts", statusText(st)); save(function(x) { x.enCours = st.isEnc; x.aVoir = st.isVoir; x.fini = st.isFini; }, "Statuts mis à jour"); }); }));
  row.appendChild(detailValueBtn("notebook-pen", "Journal", "journal", journalCountLabel(e), function() { openJournalSheet({ kind: "entry", e: e }, function() { updateAdvBtn("journal", journalCountLabel(e)); syncPoster(e); }); }));
  row.appendChild(detailValueBtn("calendar-check", "Date", "dateFin", dateLabel(e), function() { openDatePicker(e.dateFin || "", function(iso) { updateAdvBtn("dateFin", iso ? formatDate(iso) : dateLabel(e)); save(function(x) { x.dateFin = iso ? formatDate(iso) : todayFR(); }, "Date enregistrée"); }); }));
  row.appendChild(detailValueBtn("shopping-cart", "Date d'achat", "dateAchat", e.dateAchat ? formatDate(e.dateAchat) : "", function() { openDatePicker(e.dateAchat, function(iso) { updateAdvBtn("dateAchat", iso ? formatDate(iso) : ""); save(function(x) { x.dateAchat = iso || ""; x.inCollection = true; }, "Date d'achat enregistrée"); }); }));
  body.appendChild(fieldBox("Rangement & suivi", row));

  var mediaRow = el("div", "form-row");
  mediaRow.appendChild(detailValueBtn("image", "Image objet", "_img", e.imageUrl ? "Voir" : "", function() {
    if (e.imageUrl) { openImageMenu(e, function(v) { e.imageUrl = v; dbPut(e).then(function() { toast(v ? "Photo mise à jour" : "Photo retirée"); updateAdvBtn("_img", v ? "Voir" : ""); }); }); }
    else { openImageUrlSheet(e, function(v) { e.imageUrl = v; dbPut(e).then(function() { toast("Photo enregistrée"); updateAdvBtn("_img", v ? "Voir" : ""); }); }); }
  }));
  mediaRow.appendChild(detailValueBtn("file-text", "Contenu et bonus", "_contenu", e.contenu ? "Voir" : "", function() { openContenuSheet(e.contenu || "", function(v) { e.contenu = v; dbPut(e).then(function() { toast("Contenu mis à jour"); updateAdvBtn("_contenu", v ? "Voir" : ""); }); }); }));
  mediaRow.appendChild(detailValueBtn("images", "Galerie", "_galerie", (e.galerie || []).length + " image(s)", function() { var gal = e.galerie || []; openGalerieSheet(gal, function(newGal) { e.galerie = newGal; dbPut(e).then(function() { toast("Galerie mise à jour"); updateAdvBtn("_galerie", newGal.length + " image(s)"); }); }); }));
  body.appendChild(fieldBox("Médias et contenu", mediaRow));

  if (e.galerie && e.galerie.length) {
    var galSection = el("div", "field"); galSection.appendChild(el("span", "flabel", "Galerie"));
    var galRow = el("div"); galRow.style.cssText = "display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;";
    e.galerie.forEach(function(url) { var thumb = el("img"); thumb.src = url; thumb.style.cssText = "width:60px;height:90px;object-fit:cover;border-radius:8px;border:1px solid var(--bd);cursor:pointer;flex-shrink:0;"; thumb.addEventListener("click", function() { openImageZoom(url); }); galRow.appendChild(thumb); });
    galSection.appendChild(galRow); body.appendChild(galSection);
  }

  var g2 = el("div", "form-row");
  g2.appendChild(detailValueBtn("monitor", "Plateforme", "plateforme", e.plateforme || "", function() { openListSheet("plateformes", e.plateforme, function(v) { updateAdvBtn("plateforme", v); save(function(x) { x.plateforme = v; x.inCollection = true; }, "Plateforme : " + v); }); }));
  g2.appendChild(detailValueBtn("box", "Support", "support", e.support || "", function() { openListSheet("supports", e.support, function(v) { updateAdvBtn("support", v); save(function(x) { x.support = v; x.inCollection = true; }, "Support : " + v); }); }));
  g2.appendChild(detailValueBtn("package-open", "Packaging", "packaging", e.packaging || "", function() { openListSheet("packagings", e.packaging, function(v) { updateAdvBtn("packaging", v); save(function(x) { x.packaging = v; x.inCollection = true; }, "Packaging : " + v); }); }));
  g2.appendChild(detailValueBtn("gift", "Bonus", "bonus", (e.bonus || []).join(", "), function() { openBonusSheet(e.bonus || [], function(a) { updateAdvBtn("bonus", a.join(", ")); save(function(x) { x.bonus = a; x.inCollection = true; }, "Bonus mis à jour"); }); }));
  g2.appendChild(detailValueBtn("hash", "Édition", "edition", e.edition || "", function() { openEditionSheet(e.edition || "", function(v) { updateAdvBtn("edition", v); save(function(x) { x.edition = v; x.inCollection = true; }, "Édition enregistrée"); }); }));
  g2.appendChild(detailValueBtn("barcode", "EAN", "ean", e.ean || "", function() { openEanSheet(e.ean || "", function(v) { updateAdvBtn("ean", v); save(function(x) { x.ean = v; }, "EAN enregistré"); }); }));
  g2.appendChild(detailValueBtn("link", "URL", "url", e.url ? "Lien" : "", function() { openUrlSheet(e.url || "", function(v) { updateAdvBtn("url", v ? "Lien" : ""); save(function(x) { x.url = v; }, "URL enregistrée"); }); }));
  body.appendChild(fieldBox("Détails bibliothèque", g2));

  if (e.url) { var ob = btn("Ouvrir la fiche", "link", "wide", function() { window.open(e.url, "_blank"); }); ob.style.marginBottom = "16px"; body.appendChild(ob); }

  var ac = el("div", "detail-actions");
  ac.appendChild(btn("Noter vite", "plus", "", function() { quickNoteOpen(e, "", "time", null, { kind: "entry", e: e }); }));
  ac.appendChild(btn("Dupliquer", "duplicate", "", function() { duplicateEntry(e); }));
  ac.appendChild(btn("Journal", "notebook-pen", "", function() { openJournalSheet({ kind: "entry", e: e }, function() { updateAdvBtn("journal", journalCountLabel(e)); syncPoster(e); }); }));
  body.appendChild(ac);

  setModal(e.titre, body, [
    ["Modifier", "primary", function() { renderPanel(e); }, "pen"],
    ["Supprimer", "", function() { showConfirm("Supprimer " + e.titre + " ?", "Toutes les entrées de journal seront perdues.", function() { dbDelete(e.id).then(function() { toast("Supprimé"); closeModal(); refreshAll(); }); }, "Supprimer"); }, "trash-2"]
  ]);
}

// ==========================================
// 12. FORMULAIRE D'ÉDITION (PANEL)
// ==========================================
function capturePanel() { var t = $("p-title"); if (t) ST.draft.titre = t.value; var c = $("p-comment"); if (c) ST.draft.comment = c.value; var s = $("p-sub"); if (s) ST.draft.sub = s.value; }
function rerenderPanel() { capturePanel(); renderPanel(ST.editing, true); }
function renderPanel(en, kd) {
  ST.editing = en || null;
  if (!kd) {
    if (en) {
      ST.panelType = en.type; ST.currentNote = en.note != null ? en.note : null; ST.isCoeur = !!en.coeur; ST.isEnc = !!en.enCours; ST.isVoir = !!en.aVoir; ST.isFini = !!en.fini; ST.isInCollection = !!en.inCollection;
      ST.panelPoster = en.posterUrl || ""; ST.panelThumb = en.posterThumb || ""; ST.panelImage = en.imageUrl || ""; ST.galerie = (en.galerie || []).slice();
      ST.advFields = { plateforme: en.plateforme || "", dateAchat: en.dateAchat || "", edition: en.edition || "", bonus: (en.bonus || []).slice(), support: en.support || "", packaging: en.packaging || "", ean: en.ean || "", url: en.url || "", contenu: en.contenu || "", imageUrl: en.imageUrl || "" };
      ST.draft = { titre: en.titre || "", date: toInputDate(en.dateFin || ""), comment: en.comment || "", sub: en.sousTitre || "" }; ST.draftJournal = JSON.parse(JSON.stringify(en.journal || []));
    } else {
      ST.panelType = ST.currentType; ST.currentNote = null; ST.isCoeur = false; ST.isEnc = false; ST.isVoir = false; ST.isFini = false; ST.isInCollection = false;
      ST.panelPoster = (ST.selectedItem && ST.selectedItem.poster) || ""; ST.panelThumb = ""; ST.panelImage = (ST.selectedItem && ST.selectedItem.imageUrl) || "";
      ST.galerie = (ST.selectedItem && ST.selectedItem.galerie) ? ST.selectedItem.galerie.slice() : [];
      ST.advFields = { plateforme: "", dateAchat: "", edition: "", bonus: [], support: "", packaging: "", ean: "", url: "", contenu: "", imageUrl: (ST.selectedItem && ST.selectedItem.imageUrl) || "" };
      ST.draft = { titre: (ST.selectedItem && ST.selectedItem.title) || "", date: todayFR(), comment: "", sub: "" }; ST.draftJournal = [];
    }
  }
  var mode = "simple", body = el("div"), seg = el("div", "seg sticky-top"), fh = el("div"); fh.id = "p-form";
  [["simple", "Simple"], ["avance", "Avancé"]].forEach(function(m) {
    var b = el("button", mode === m[0] ? "on" : "", "<span>" + m[1] + "</span>");
    b.addEventListener("click", function() { capturePanel(); mode = m[0]; seg.querySelectorAll("button").forEach(function(x) { x.classList.remove("on"); }); b.classList.add("on"); buildForm(fh, mode); });
    seg.appendChild(b);
  });
  body.appendChild(seg); body.appendChild(fh); buildForm(fh, mode);
  setModal(en ? "Modifier l'œuvre" : "Nouvelle œuvre", body, [["Enregistrer", "primary", saveCurrentEntry, "save"], ["Annuler", "", closeModal, "x"]]);
}

function buildForm(host, mode) {
  host.innerHTML = "";
  var ti = el("input"); ti.id = "p-title"; ti.value = ST.draft.titre; ti.placeholder = "Titre de l'œuvre"; host.appendChild(fieldBox("Titre", ti));
  var r1 = el("div", "form-row");
  r1.appendChild(libToggleBtn(function() { return ST.isInCollection; }, function(v) { ST.isInCollection = v; }));
  r1.appendChild(detailValueBtn("star", "Note", "note", ST.currentNote != null ? ST.currentNote + "/10" : "", function() { openNoteSheet(ST.currentNote, ST.isCoeur, function(n, c) { ST.currentNote = n; ST.isCoeur = c; updateAdvBtn("note", n != null ? n + "/10" : ""); }); }));
  r1.appendChild(detailValueBtn("flag", "Statuts", "statuts", formStatusLabel(), function() { openStatusSheet({ isEnc: ST.isEnc, isVoir: ST.isVoir, isFini: ST.isFini }, function(st) { ST.isEnc = st.isEnc; ST.isVoir = st.isVoir; ST.isFini = st.isFini; updateAdvBtn("statuts", formStatusLabel()); }); }));
  r1.appendChild(detailValueBtn("notebook-pen", "Journal", "journal", ST.draftJournal.length ? ST.draftJournal.length + " entrée" + (ST.draftJournal.length > 1 ? "s" : "") : "", function() { openJournalSheet({ kind: "draft" }, function() { updateAdvBtn("journal", ST.draftJournal.length ? ST.draftJournal.length + " entrée" + (ST.draftJournal.length > 1 ? "s" : "") : ""); }); }));
  r1.appendChild(detailValueBtn("calendar-check", "Date", "dateFin", ST.draft.date ? formatDate(ST.draft.date) : todayFR(), function() { openDatePicker(ST.draft.date, function(iso) { ST.draft.date = iso || ""; updateAdvBtn("dateFin", ST.draft.date ? formatDate(ST.draft.date) : todayFR()); }); }));
  host.appendChild(fieldBox("Rangement & suivi", r1));
  var ci = el("textarea"); ci.id = "p-comment"; ci.value = ST.draft.comment; ci.placeholder = "Ton avis…"; host.appendChild(fieldBox("Commentaire", ci));
  var ar = el("div", "poster-row"), pv = el("img"); pv.id = "p-prev"; pv.src = ST.panelPoster || NO_POSTER; pv.addEventListener("click", function() { openPosterZoom(pv.src); });
  var pb = el("div", "poster-btns"), bu = el("button", "poster-btn"); bu.innerHTML = '<span class="ic">' + ic("link") + "</span><span>URL</span>";
  bu.addEventListener("click", function() { var b2 = el("div"), ip = el("input"); ip.placeholder = "https://…"; ip.value = ST.panelPoster || ""; b2.appendChild(ip); setSheet("URL de l'affiche", b2, [["Valider", "primary", function() { var v = ip.value.trim(); if (v) { ST.panelPoster = v; pv.src = v; makeThumb(v).then(function(t) { ST.panelThumb = t; }); } closeMenu(); }, "check"], ["Annuler", "", closeMenu, "x"]]); });
  var bi = el("button", "poster-btn"); bi.innerHTML = '<span class="ic">' + ic("folder") + "</span><span>Importer</span>";
  var fi = el("input"); fi.type = "file"; fi.accept = "image/*"; fi.hidden = true; bi.addEventListener("click", function() { fi.click(); });
  fi.addEventListener("change", function(ev) { var f = ev.target.files[0]; if (f) fileToResized(f, 500).then(function(u) { ST.panelPoster = u; pv.src = u; makeThumb(u).then(function(t) { ST.panelThumb = t; }); }); });
  pb.appendChild(bu); pb.appendChild(bi); pb.appendChild(fi); ar.appendChild(pv); ar.appendChild(pb); host.appendChild(fieldBox("Affiche", ar));

  if (mode === "avance") {
    var si = el("input"); si.id = "p-sub"; si.value = ST.draft.sub; si.placeholder = "Sous-titre, détail…"; host.appendChild(fieldBox("Détail / sous-titre", si));

    // --- ASSISTANT DE SAISIE INTELLIGENT ---
    var assistRow = el("div", "field");
    assistRow.style.cssText = "margin-top:16px; padding-top:16px; border-top:1px solid var(--bd);";
    assistRow.appendChild(el("span", "flabel", "Assistant de saisie"));
    var assistBtn = btn("Ouvrir l'assistant", "wand-2", "wide", function() {
      openSmartScrapeAssistant(ST.advFields.ean || "", ST.draft.titre || "", function(data) {
        if (data.titre) { ST.draft.titre = data.titre; $("p-title").value = data.titre; }
        if (data.support) { ST.advFields.support = data.support; updateAdvBtn("support", data.support); }
        if (data.packaging) { ST.advFields.packaging = data.packaging; updateAdvBtn("packaging", data.packaging); }
        if (data.posterUrl) { ST.panelPoster = data.posterUrl; $("p-prev").src = data.posterUrl; makeThumb(data.posterUrl).then(t => ST.panelThumb = t); }
        if (data.formattedDescription) {
          var existing = ST.advFields.contenu || "";
          ST.advFields.contenu = existing ? (existing + "\n\n" + data.formattedDescription) : data.formattedDescription;
          updateAdvBtn("contenu", "Voir");
        }
        toast("Infos ajoutées à la description !");
      });
    });
    assistRow.appendChild(assistBtn); host.appendChild(assistRow);
    // ---------------------------------------

    var galBtn = btn("Galerie d'images (" + ST.galerie.length + ")", "images", "wide", function() {
      openGalerieSheet(ST.galerie, function(newGal) { ST.galerie = newGal; galBtn.innerHTML = '<span class="ic">' + ic("images") + '</span><span>Galerie (' + newGal.length + ')</span>'; });
    });
    host.appendChild(fieldBox("Galerie", galBtn));

    var r2 = el("div", "form-row");
    r2.appendChild(detailValueBtn("shopping-cart", "Date d'achat", "dateAchat", ST.advFields.dateAchat ? formatDate(ST.advFields.dateAchat) : "", function() { openDatePicker(ST.advFields.dateAchat, function(iso) { ST.advFields.dateAchat = iso || ""; if (iso) markCollection(); updateAdvBtn("dateAchat", iso ? formatDate(iso) : ""); }); }));
    r2.appendChild(detailValueBtn("monitor", "Plateforme", "plateforme", ST.advFields.plateforme, function() { openListSheet("plateformes", ST.advFields.plateforme, function(v) { ST.advFields.plateforme = v; markCollection(); updateAdvBtn("plateforme", v); }); }));
    r2.appendChild(detailValueBtn("box", "Support", "support", ST.advFields.support, function() { openListSheet("supports", ST.advFields.support, function(v) { ST.advFields.support = v; markCollection(); updateAdvBtn("support", v); }); }));
    r2.appendChild(detailValueBtn("package-open", "Packaging", "packaging", ST.advFields.packaging, function() { openListSheet("packagings", ST.advFields.packaging, function(v) { ST.advFields.packaging = v; markCollection(); updateAdvBtn("packaging", v); }); }));
    r2.appendChild(detailValueBtn("gift", "Bonus", "bonus", ST.advFields.bonus.join(", "), function() { openBonusSheet(ST.advFields.bonus, function(a) { ST.advFields.bonus = a; if (a.length) markCollection(); updateAdvBtn("bonus", a.join(", ")); }); }));
    r2.appendChild(detailValueBtn("hash", "Édition", "edition", ST.advFields.edition, function() { openEditionSheet(ST.advFields.edition, function(v) { ST.advFields.edition = v; if (v) markCollection(); updateAdvBtn("edition", v); }); }));
    r2.appendChild(detailValueBtn("barcode", "EAN", "ean", ST.advFields.ean, function() { openEanSheet(ST.advFields.ean, function(v) { ST.advFields.ean = v; if (v) markCollection(); updateAdvBtn("ean", v); }); }));
    r2.appendChild(detailValueBtn("link", "URL fiche", "url", ST.advFields.url ? "Lien" : "", function() { openUrlSheet(ST.advFields.url, function(v) { ST.advFields.url = v; if (v) markCollection(); updateAdvBtn("url", v ? "Lien" : ""); }); }));
    host.appendChild(fieldBox("Détails bibliothèque", r2));

    var sl = el("div", "search-links"); sl.appendChild(el("span", "", "Chercher ailleurs :"));
    var q = encodeURIComponent(ST.draft.titre || "");
    [{ n: "Google", i: "search", u: "https://www.google.com/search?q=" + q }, { n: "Steam", i: "gamepad-2", u: "https://store.steampowered.com/search/?term=" + q }, { n: "TMDB", i: "film", u: "https://www.themoviedb.org/search?query=" + q }, { n: "SensCritique", i: "heart", u: "https://www.senscritique.com/recherche?query=" + q }].forEach(function(l) {
      var a = el("a", "search-link"); a.href = l.u; a.target = "_blank"; a.innerHTML = '<span class="ic">' + ic(l.i) + "</span><span>" + l.n + "</span>"; sl.appendChild(a);
    });
    host.appendChild(fieldBox("Recherche externe", sl));
  }
}// ==========================================
// 13. LISTES PERSONNALISÉES
// ==========================================
function choiceRow(it, sel, pick, del) {
  var r = el("div", "radio-opt" + (sel ? " sel" : "")); r.innerHTML = '<span class="dot"></span>' + valueIconHTML(it) + '<span class="lbl">' + esc(it.name) + "</span>";
  var lb = r.querySelector(".lbl"); if (lb) { lb.style.flex = "1"; lb.style.minWidth = "0"; lb.style.overflow = "hidden"; lb.style.textOverflow = "ellipsis"; lb.style.whiteSpace = "nowrap"; }
  r.addEventListener("click", pick);
  if (del) { var d = el("button", "sq-btn ml-del"); d.setAttribute("aria-label", "Supprimer ce choix"); d.innerHTML = '<span class="ic">' + ic("trash") + "</span>"; d.addEventListener("click", function(ev) { ev.stopPropagation(); del(); }); r.appendChild(d); }
  return r;
}
function freeRow(f) { var b = el("button", "wide"); b.style.cssText = "justify-content:flex-start;margin-top:10px;"; b.innerHTML = '<span class="ic">' + ic("more-horizontal") + '</span><span style="font-style:italic;">Autre… (libre)</span>'; b.addEventListener("click", f); return b; }
function openListSheet(k, cur, pick) {
  var w = el("div", "radio-list");
  function rb() {
    w.innerHTML = "";
    listItems(k).forEach(function(it) { w.appendChild(choiceRow(it, cur === it.name, function() { pick(it.name); closeMenu(); }, it.base ? null : function() { removeCustom(k, it.name); rb(); })); });
    w.appendChild(freeRow(function() { var b2 = el("div"), i = el("input"); i.placeholder = "Ta valeur libre…"; b2.appendChild(i); setSheet("Valeur libre", b2, [["Valider", "primary", function() { var v = i.value.trim(); if (!v) return; addCustom(k, v); pick(v); closeMenu(); }, "check"], ["Annuler", "", rb, "x"]]); }));
  }
  rb(); setSheet("Choix", w, [["Annuler", "", closeMenu, "x"]]);
}
function openBonusSheet(ca, pick) {
  var arr = (ca || []).slice(), w = el("div", "radio-list");
  function rb() {
    w.innerHTML = "";
    listItems("bonus").forEach(function(it) { w.appendChild(choiceRow(it, arr.indexOf(it.name) >= 0, function() { var i = arr.indexOf(it.name); if (i >= 0) arr.splice(i, 1); else arr.push(it.name); rb(); }, it.base ? null : function() { removeCustom("bonus", it.name); var x = arr.indexOf(it.name); if (x >= 0) arr.splice(x, 1); rb(); })); });
    w.appendChild(freeRow(function() { var b2 = el("div"), i = el("input"); i.placeholder = "Ton bonus…"; b2.appendChild(i); setSheet("Bonus libre", b2, [["Valider", "primary", function() { var v = i.value.trim(); if (!v) return; addCustom("bonus", v); if (arr.indexOf(v) < 0) arr.push(v); rb(); }, "check"], ["Annuler", "", rb, "x"]]); }));
  }
  rb(); setSheet("Bonus", w, [["Valider", "primary", function() { pick(arr); closeMenu(); }, "check"], ["Annuler", "", closeMenu, "x"]]);
}
function openEditionSheet(c, p) { var b = el("div"), i = el("input"); i.placeholder = "Édition limitée…"; i.value = c || ""; b.appendChild(i); setSheet("Édition", b, [["Valider", "primary", function() { p(i.value.trim()); closeMenu(); }, "check"], ["Annuler", "", closeMenu, "x"]]); }
function openEanSheet(c, p) {
  var b = el("div"), i = el("input"); i.placeholder = "Code EAN"; i.inputMode = "numeric"; i.value = c || ""; b.appendChild(i);
  if (c && /^\d{8,14}$/.test(c)) {
    var searchBtn = btn("🔎 Rechercher cet EAN", "search", "wide", function() { window.open("https://www.ean-search.org/ean/" + c, "_blank"); });
    searchBtn.style.marginTop = "12px"; searchBtn.style.background = "var(--s2)"; b.appendChild(searchBtn);
  }
  var sc = btn("Scanner le code-barres", "camera", "wide", function() { startEAN(function(cd) { i.value = cd; }); }); sc.style.marginTop = "12px"; b.appendChild(sc);
  setSheet("EAN", b, [["Valider", "primary", function() { p(i.value.trim()); closeMenu(); }, "check"], ["Annuler", "", closeMenu, "x"]]);
}
function openUrlSheet(c, p) { var b = el("div"), i = el("input"); i.placeholder = "URL de la fiche"; i.value = c || ""; b.appendChild(i); setSheet("URL", b, [["Valider", "primary", function() { p(i.value.trim()); closeMenu(); }, "check"], ["Annuler", "", closeMenu, "x"]]); }

// ==========================================
// 14. NOTES ET STATUTS
// ==========================================
function openNoteSheet(cur, co, cb) {
  var sel = cur, coe = !!co, b = el("div"), ng = el("div", "note-grid");
  function paint() { ng.querySelectorAll(".note-btn").forEach(function(x) { var n = +x.dataset.n, c = noteColors(n); if (n === sel && c) { x.style.background = c[0]; x.style.color = c[1]; x.style.borderColor = "transparent"; } else { x.style.background = ""; x.style.color = ""; x.style.borderColor = ""; } x.classList.toggle("sel", n === sel); }); }
  for (var n = 1; n <= 10; n++) { (function(n) { var c = el("button", "note-btn", "<span>" + n + "</span>"); c.dataset.n = n; c.addEventListener("click", function() { sel = n; paint(); }); ng.appendChild(c); })(n); }
  b.appendChild(ng); paint();
  var hr = el("div", "heart-row"); hr.appendChild(makeHeartButton(coe, function(on) { coe = on; })); b.appendChild(hr);
  if (sel != null) { var rb = btn("Retirer la note", "x", "wide", function() { sel = null; paint(); }); rb.style.marginTop = "14px"; b.appendChild(rb); }
  setSheet("Note /10", b, [["Valider", "primary", function() { cb(sel, coe); closeMenu(); }, "check"], ["Annuler", "", closeMenu, "x"]]);
}
function openStatusSheet(st, cb) {
  var s = { isEnc: !!st.isEnc, isVoir: !!st.isVoir, isFini: !!st.isFini }, b = el("div", "chips");
  function mk(k, l, i) {
    var c = el("div", "chip" + (s[k] ? " on" : ""), '<span class="ic">' + ic(i) + "</span><span>" + l + "</span>");
    c.addEventListener("click", function() { s[k] = !s[k]; if (s[k] && k === "isFini") { s.isEnc = false; s.isVoir = false; } if (s[k] && k !== "isFini") { s.isFini = false; } b.querySelectorAll(".chip").forEach(function(ch, idx) { var keys = ["isEnc", "isVoir", "isFini"]; ch.classList.toggle("on", !!s[keys[idx]]); }); });
    b.appendChild(c);
  }
  mk("isEnc", "En cours", "hourglass"); mk("isVoir", "À voir", "eye"); mk("isFini", "Vu / Fini", "check");
  setSheet("Statuts", b, [["Valider", "primary", function() { cb(s); closeMenu(); }, "check"], ["Annuler", "", closeMenu, "x"]]);
}

// ==========================================
// 15. JOURNAL
// ==========================================
function getJournalArr(d) { return d.kind === "draft" ? ST.draftJournal : (d.e.journal || (d.e.journal = [])); }
function openJournalSheet(d, ac) {
  var body = el("div"), list = el("div"); body.appendChild(list);
  var ab = btn("Ajouter une entrée", "plus", "wide", function() { quickNoteOpen(d.kind === "entry" ? d.e : null, "", "time", null, d); }); ab.style.marginTop = "16px"; body.appendChild(ab);
  function rb() {
    list.innerHTML = ""; var a = getJournalArr(d);
    if (!a.length) { list.appendChild(emptyBox("notebook-pen", "Aucune entrée.")); if (ac) ac(); return; }
    a.forEach(function(x, i) {
      var r = el("div", "jrow"), t = el("div", "jb"); t.style.cursor = "pointer"; t.innerHTML = '<div class="jt">' + esc(entryTag(x)) + '</div><div class="jx">' + esc(x.text || "") + "</div>";
      if (d.kind === "entry") t.addEventListener("click", function() { closeMenu(); openReaderForEntry(d.e, i); });
      var ed = el("button"); ed.setAttribute("aria-label", "Modifier"); ed.innerHTML = '<span class="ic">' + ic("pen") + "</span>"; ed.addEventListener("click", function() { quickNoteOpen(d.kind === "entry" ? d.e : null, x.text, x.kind, i, d); });
      var dl = el("button"); dl.setAttribute("aria-label", "Supprimer"); dl.innerHTML = '<span class="ic">' + ic("trash-2") + "</span>"; dl.addEventListener("click", function() { showConfirm("Supprimer cette entrée ?", "", function() { a.splice(i, 1); if (d.kind === "entry") dbPut(d.e).then(function() { toast("Supprimée"); rb(); refreshAll(); }); else rb(); }, "Supprimer"); });
      r.appendChild(t); r.appendChild(ed); r.appendChild(dl); list.appendChild(r);
    });
    if (ac) ac();
  }
  rb(); setSheet(d.kind === "draft" ? "Journal (brouillon)" : "Journal : " + d.e.titre, body, [["Fermer", "", closeMenu, "x"]]); ST.journalSheetRebuild = rb;
}

// ==========================================
// 16. SAUVEGARDE DE LA FICHE
// ==========================================
function saveCurrentEntry() {
  capturePanel(); var ti = ST.draft.titre.trim(); if (!ti) { toast("Titre obligatoire."); return; }
  var any = ST.isInCollection || ST.advFields.support || ST.isEnc || ST.isVoir || ST.currentNote != null || ST.draftJournal.length || ST.draft.comment.trim();
  if (!any) { toast("Choisis au moins un support, un statut, une note ou un avis."); return; }
  if (ST.editing) { finishSave(ST.editing, ST.editing.id, ST.editing.dateAjout); return; }
  var ty = ST.panelType, dp = null; for (var i = 0; i < ST.entries.length; i++) { if (ST.entries[i].type === ty && norm(ST.entries[i].titre) === norm(ti)) { dp = ST.entries[i]; break; } }
  if (dp) showConfirm("Doublon détecté", dp.titre + " existe déjà. Modifier l'existant ?", function() { finishSave(dp, dp.id, dp.dateAjout); }, "Modifier"); else finishSave(null, null, null);
}
async function finishSave(base, id, daj) {
  var ty = ST.panelType; base = base || {};
  if (!id) { var sid = (ST.selectedItem && ST.selectedItem.id) || Date.now(); id = ty + "_" + sid; var ex = false; for (var k = 0; k < ST.entries.length; k++) { if (ST.entries[k].id === id) { ex = true; break; } } if (ex) id = id + "_" + Date.now(); daj = new Date().toISOString(); }
  var e = Object.assign({}, base); e.id = id; e.type = ty; e.titre = ST.draft.titre.trim(); e.sousTitre = (ST.draft.sub || "").trim(); e.note = ST.currentNote; e.coeur = ST.isCoeur; e.enCours = ST.isEnc; e.aVoir = ST.isVoir; e.fini = ST.isFini; e.inCollection = ST.isInCollection || !!ST.advFields.support;
  e.dateFin = ST.draft.date ? formatDate(ST.draft.date) : todayFR(); e.comment = ST.draft.comment.trim(); e.journal = ST.draftJournal; e.posterUrl = ST.panelPoster; e.posterThumb = ST.panelThumb || (await makeThumb(ST.panelPoster));
  e.imageUrl = ST.advFields.imageUrl || ST.panelImage || ""; e.contenu = ST.advFields.contenu || ""; e.galerie = ST.galerie.slice();
  if (ST.selectedItem && ST.selectedItem.source === "tmdb" && ST.selectedItem.tmdbId) e.tmdb_id = ST.selectedItem.tmdbId;
  if (e.inCollection) { e.plateforme = ST.advFields.plateforme || null; e.dateAchat = ST.advFields.dateAchat || null; e.edition = ST.advFields.edition || null; e.bonus = ST.advFields.bonus.slice(); e.support = ST.advFields.support || null; e.packaging = ST.advFields.packaging || null; e.ean = ST.advFields.ean || ""; e.url = ST.advFields.url || ""; }
  else { e.plateforme = null; e.dateAchat = null; e.edition = null; e.bonus = []; e.support = null; e.packaging = null; e.ean = ""; e.url = ""; }
  e.dateAjout = daj; await dbPut(e); if (navigator.vibrate) navigator.vibrate(25); toast("Enregistré"); closeModal(); refreshAll();
}
function duplicateEntry(e) { closeModal(); setTimeout(function() { ST.selectedItem = { title: e.titre, source: "manual", id: null, poster: e.posterUrl || "" }; ST.currentType = e.type; ST.editing = null; renderPanel(null); }, 60); }

// ==========================================
// 17. NOTE RAPIDE (QUICK NOTE)
// ==========================================
function quickNoteOpen(e, pt, k, ix, d) {
  ST.qnEntry = e || null; ST.qnEditIdx = ix != null ? ix : null; ST.qnKind = k || "time"; ST.qnDest = d || (e ? { kind: "entry", e: e } : { kind: "global" }); ST.pickerVal = null;
  if (ST.qnEditIdx != null && ST.qnDest.kind === "entry" && ST.qnDest.e) { var ex = (ST.qnDest.e.journal || [])[ST.qnEditIdx]; if (ex && ex.kind === "time" && ex.at) { var dt = new Date(ex.at); ST.pickerVal = dt.getFullYear() + "-" + pad2(dt.getMonth() + 1) + "-" + pad2(dt.getDate()); } }
  var t = $("qn-title"); if (t) t.textContent = (ST.qnEditIdx != null ? "Modifier : " : "Noter : ") + (e ? e.titre : "note libre");
  var tx = $("qn-text"); if (tx) tx.value = pt || ""; var lb = $("qn-entry-label"); if (lb) lb.textContent = e ? e.titre : "Choisir une œuvre…"; var er = $("qn-entry-row"); if (er) er.classList.remove("hidden"); syncQnKind();
  var sb = $("qn-save"); if (sb) sb.innerHTML = ST.qnEditIdx != null ? '<span class="ic">' + ic("save") + "</span><span>Remplacer</span>" : '<span class="ic">' + ic("plus") + "</span><span>Ajouter</span>";
  var kk = $("qn-kind"); if (!kk) return; kk.innerHTML = "";
  KINDS.forEach(function(x) { var c = el("div", "chip" + (x[0] === ST.qnKind ? " on" : ""), '<span class="ic">' + ic(x[2]) + "</span><span>" + x[1] + "</span>"); c.addEventListener("click", function() { ST.qnKind = x[0]; kk.querySelectorAll(".chip").forEach(function(y) { y.classList.remove("on"); }); c.classList.add("on"); syncQnKind(); }); kk.appendChild(c); });
  showOverlay("qn-overlay");
}
function syncQnKind() {
  var w = $("qn-when-row"); if (w) w.classList.toggle("hidden", ST.qnKind !== "time"); var e = $("qn-ep-row"); if (e) e.classList.toggle("hidden", ST.qnKind !== "ep");
  var p = $("qn-pages-row"); if (p) p.classList.toggle("hidden", ST.qnKind !== "pages"); var s = $("qn-session-row"); if (s) s.classList.toggle("hidden", ST.qnKind !== "session");
  if (ST.qnKind === "time") { var wl = $("qn-when-label"); if (wl) wl.textContent = ST.pickerVal ? fmtWhen(ST.pickerVal) : nowStamp(); }
}
function quickNoteClose() { hideOverlay("qn-overlay"); ST.qnEditIdx = null; }
async function quickNoteSave() {
  var tx = $("qn-text"), text = tx ? tx.value.trim() : ""; if (!text && ST.qnKind !== "ep" && ST.qnKind !== "pages") { toast("Entre un texte."); return; }
  var ob = buildQnObj(text), d = ST.qnDest || { kind: "global" };
  if (d.kind === "draft") { if (ST.qnEditIdx != null && ST.draftJournal[ST.qnEditIdx]) { ob.at = ST.draftJournal[ST.qnEditIdx].at || ob.at; ST.draftJournal[ST.qnEditIdx] = ob; } else ST.draftJournal.push(ob); toast(ST.qnEditIdx != null ? "Entrée modifiée" : "Entrée ajoutée"); quickNoteClose(); if (ST.journalSheetRebuild) ST.journalSheetRebuild(); return; }
  var e = d.kind === "entry" ? d.e : ST.qnEntry;
  if (e && e.isNew) { var ty = e.type || ST.currentType || "Livre"; var nt = { id: ty + "_" + Date.now(), titre: e.titre, type: ty, journal: [ob], dateFin: todayFR(), dateAjout: new Date().toISOString(), inCollection: false, note: null, coeur: false, enCours: false, aVoir: false, fini: false, posterUrl: "", posterThumb: "", imageUrl: "", contenu: "", galerie: [] }; await dbPut(nt); toast("Œuvre créée"); quickNoteClose(); refreshAll(); return; }
  if (!e) { var fk = { id: "libre_" + Date.now(), titre: "Note libre", type: "Livre", journal: [ob], dateFin: todayFR(), dateAjout: new Date().toISOString(), inCollection: false }; await dbPut(fk); toast("Note libre ajoutée"); quickNoteClose(); refreshAll(); return; }
  if (!e.journal) e.journal = []; if (ST.qnEditIdx != null && e.journal[ST.qnEditIdx]) { ob.at = e.journal[ST.qnEditIdx].at || ob.at; e.journal[ST.qnEditIdx] = ob; } else e.journal.push(ob);
  await dbPut(e); if (navigator.vibrate) navigator.vibrate(15); toast(ST.qnEditIdx != null ? "Entrée modifiée" : "Entrée ajoutée"); quickNoteClose(); if (ST.journalSheetRebuild) ST.journalSheetRebuild(); refreshAll();
}
function buildQnObj(text) {
  if (ST.qnKind === "time") return { kind: "time", ts: ST.pickerVal ? fmtWhen(ST.pickerVal) : nowStamp(), text: text, at: ST.pickerVal ? isoToAtLocal(ST.pickerVal) : Date.now() };
  if (ST.qnKind === "free") return { kind: "free", ts: nowStamp(), text: text, at: Date.now() };
  if (ST.qnKind === "session") { var dd = $("qn-dur"); return { kind: "session", dur: dd ? dd.value.trim() : "", text: text, at: Date.now() }; }
  if (ST.qnKind === "pages") { var rd = $("qn-read"), tt = $("qn-total"); return { kind: "pages", read: rd ? rd.value : "", total: tt ? tt.value : "", text: text, at: Date.now() }; }
  var ss = $("qn-s"), ee = $("qn-e"); return { kind: "ep", s: parseInt(ss ? ss.value || "0" : "0", 10), e: parseInt(ee ? ee.value || "0" : "0", 10), note: null, text: text, at: Date.now() };
}
function openEntryPicker(cb) {
  var wrap = el("div"), inp = el("input"), list = el("div", "radio-list"); inp.placeholder = "Titre de l'œuvre…"; inp.style.marginBottom = "12px"; list.style.maxHeight = "46vh"; list.style.overflowY = "auto"; wrap.appendChild(inp); wrap.appendChild(list); var chosen = null;
  function lastAt(en) { var m = 0; (en.journal || []).forEach(function(x) { if (x.at && x.at > m) m = x.at; }); return m; }
  function select(node, val) { chosen = val; list.querySelectorAll(".radio-opt").forEach(function(x) { x.classList.remove("sel"); }); node.classList.add("sel"); }
  function rebuild() {
    list.innerHTML = ""; var q = norm(inp.value || ""); var arr = ST.entries.slice().sort(function(a, b) { return lastAt(b) - lastAt(a); });
    if (q) arr = arr.filter(function(e) { return norm(e.titre).indexOf(q) >= 0; });
    if (!q) { var fr = el("div", "radio-opt" + (chosen === null ? " sel" : "")); fr.innerHTML = '<span class="dot"></span><span class="lbl">Note libre (sans œuvre)</span>'; fr.addEventListener("click", function() { select(fr, null); }); list.appendChild(fr); }
    arr.forEach(function(en) { var o = el("div", "radio-opt" + (chosen && chosen.id === en.id ? " sel" : "")); o.innerHTML = '<span class="dot"></span><span class="lbl">' + esc(en.titre) + "</span>"; o.addEventListener("click", function() { select(o, en); }); list.appendChild(o); });
    if (q) { var raw = inp.value.trim(), exact = arr.some(function(e) { return norm(e.titre) === q; }); if (!exact && raw) { var cr = el("div", "radio-opt"); cr.innerHTML = '<span class="dot"></span><span class="lbl">Créer « ' + esc(raw) + ' »</span>'; cr.addEventListener("click", function() { select(cr, { isNew: true, titre: raw, type: ST.currentType || "Livre" }); }); list.appendChild(cr); } }
  }
  inp.addEventListener("input", rebuild); rebuild(); setSheet("Choisir une œuvre", wrap, [["Valider", "primary", function() { closeMenu(); cb(chosen); }, "check"], ["Annuler", "", function() { closeMenu(); cb(undefined); }, "x"]]);
}// ==========================================
// 18. CALENDRIER
// ==========================================
function entriesByDay() { var o = {}; ST.entries.forEach(function(en) { (en.journal || []).forEach(function(x) { if (!x.at) return; var t = new Date(x.at); o[t.getFullYear() + "-" + pad2(t.getMonth() + 1) + "-" + pad2(t.getDate())] = 1; }); }); return o; }
function openDatePicker(init, cb) { ST.calMode = "pick"; ST.calPickCb = cb; var p = parseDateFR(init), n = new Date(); ST.calSel = p ? { y: p.y, mo: p.mo - 1, d: p.d } : { y: n.getFullYear(), mo: n.getMonth(), d: n.getDate() }; ST.calDate = new Date(ST.calSel.y, ST.calSel.mo, ST.calSel.d, 12); showOverlay("calendar-overlay"); renderCalendar(); }
function openJournalCalendar() { ST.calMode = "journal"; if (!ST.calSel) { var n = new Date(); ST.calSel = { y: n.getFullYear(), mo: n.getMonth(), d: n.getDate() }; } ST.calView = { y: ST.calSel.y, mo: ST.calSel.mo }; ST.calDate = new Date(ST.calSel.y, ST.calSel.mo, ST.calSel.d, 12); showOverlay("calendar-overlay"); renderCalendar(); }
function setCalendarMonthYear(y, mo) {
  if (ST.calMode === "journal") { ST.calView = { y: y, mo: mo }; var ds = new Date(y, mo + 1, 0).getDate(); ST.calDate = new Date(y, mo, Math.min(ST.calSel ? ST.calSel.d : 1, ds), 12); }
  else { var ds2 = new Date(y, mo + 1, 0).getDate(); ST.calSel = { y: y, mo: mo, d: Math.min(ST.calSel ? ST.calSel.d : 1, ds2) }; ST.calDate = new Date(y, mo, ST.calSel.d, 12); }
  renderCalendar();
}
function renderCalendar() {
  var cal = $("cal-grid"); if (!cal) return; cal.innerHTML = "";
  var dw = $("cal-dow"); if (dw) { dw.innerHTML = ""; ["L", "M", "M", "J", "V", "S", "D"].forEach(function(d) { dw.appendChild(el("span", "", "<span>" + d + "</span>")); }); }
  var y, mo; if (ST.calMode === "journal" && ST.calView) { y = ST.calView.y; mo = ST.calView.mo; } else { y = ST.calSel.y; mo = ST.calSel.mo; }
  var mb = $("cal-month-btn"), yb = $("cal-year-btn"), td = new Date();
  if (mb) { mb.textContent = MONTHS[mo]; mb.classList.toggle("now", mo === td.getMonth() && y === td.getFullYear()); }
  if (yb) { yb.textContent = y; yb.classList.toggle("now", y === td.getFullYear()); }
  var first = (new Date(y, mo, 1).getDay() + 6) % 7, days = new Date(y, mo + 1, 0).getDate(), weeks = Math.ceil((first + days) / 7), has = ST.calMode === "journal" ? entriesByDay() : {}, i, d;
  for (i = 0; i < first; i++) cal.appendChild(el("div", "cal-day empty"));
  for (d = 1; d <= days; d++) {
    (function(d) {
      var key = y + "-" + pad2(mo + 1) + "-" + pad2(d), nt = !!has[key], cls = "cal-day";
      if (ST.calMode === "journal" && !nt) cls += " muted";
      if (d === td.getDate() && mo === td.getMonth() && y === td.getFullYear()) cls += " today";
      if (ST.calSel && ST.calSel.y === y && ST.calSel.mo === mo && ST.calSel.d === d) cls += " sel";
      var c = el("div", cls, "<span>" + d + "</span>"); if (ST.calMode === "journal" && nt) c.classList.add("has-entry");
      c.addEventListener("click", function() {
        if (ST.calMode === "pick") { hideOverlay("calendar-overlay"); if (ST.calPickCb) ST.calPickCb(y + "-" + pad2(mo + 1) + "-" + pad2(d)); ST.calPickCb = null; }
        else { ST.calSel = { y: y, mo: mo, d: d }; ST.calDate = new Date(y, mo, d, 12); hideOverlay("calendar-overlay"); renderJournal(); }
      });
      cal.appendChild(c);
    })(d);
  }
  var fill = weeks * 7 - first - days; for (i = 0; i < fill; i++) cal.appendChild(el("div", "cal-day empty"));
}
function openMonthPicker() { var y = (ST.calMode === "journal" && ST.calView) ? ST.calView.y : ST.calSel.y, b = el("div", "month-grid"); MONTHS.forEach(function(m, i) { var x = el("button", "cal-pick-btn", "<span>" + m + "</span>"); x.addEventListener("click", function() { setCalendarMonthYear(y, i); closeMenu(); }); b.appendChild(x); }); setSheet("Mois", b, [["Retour", "", closeMenu, "x"]]); }
function openYearPicker() {
  var cur = (ST.calMode === "journal" && ST.calView) ? ST.calView.y : ST.calSel.y, grp = Math.floor(cur / 16) * 16, b = el("div");
  function rn() {
    b.innerHTML = ""; var nv = el("div", "year-nav"), lf = el("button", "rnd-btn"); lf.setAttribute("aria-label", "Années précédentes"); lf.innerHTML = '<span class="ic">' + ic("chevron-left") + "</span>"; lf.disabled = grp <= 1900; lf.addEventListener("click", function() { grp -= 16; rn(); });
    var rt = el("button", "rnd-btn"); rt.setAttribute("aria-label", "Années suivantes"); rt.innerHTML = '<span class="ic">' + ic("chevron-right") + "</span>"; rt.disabled = grp >= 2100; rt.addEventListener("click", function() { grp += 16; rn(); });
    nv.appendChild(lf); nv.appendChild(rt); b.appendChild(nv);
    var g = el("div", "year-grid"); for (var i = 0; i < 16; i++) { (function(yr) { var x = el("button", "cal-pick-btn" + (yr === cur ? " on" : ""), "<span>" + yr + "</span>"); if (yr < 1900 || yr > 2100) x.disabled = true; x.addEventListener("click", function() { setCalendarMonthYear(yr, (ST.calMode === "journal" && ST.calView) ? ST.calView.mo : ST.calSel.mo); closeMenu(); }); g.appendChild(x); })(grp + i); }
    b.appendChild(g);
  }
  rn(); setSheet("Année", b, [["Retour", "", closeMenu, "x"]]);
}

// ==========================================
// 19. AFFICHAGE DU JOURNAL
// ==========================================
function renderEncours() {
  var r = $("j-encours"); if (!r) return; r.innerHTML = "";
  var enc = ST.entries.filter(function(e) { return e.enCours || e.aVoir || e.note != null || (e.comment || "").trim() || (e.journal || []).length; });
  if (!enc.length) { r.style.display = "none"; return; } r.style.display = "";
  enc.sort(function(a, b) { var la = 0, lb = 0; (a.journal || []).forEach(function(x) { if (x.at > la) la = x.at; }); (b.journal || []).forEach(function(x) { if (x.at > lb) lb = x.at; }); if (lb !== la) return lb - la; return (b.dateAjout || "").localeCompare(a.dateAjout || ""); });
  enc.forEach(function(e) { var m = el("div", "mini"); m.appendChild(renderPoster(e, false)); m.appendChild(el("div", "t", esc(e.titre))); var s = e.fini ? "Fini" : e.aVoir ? "À voir" : e.enCours ? "En cours" : "—"; m.appendChild(el("div", "s", esc(s))); m.addEventListener("click", function() { showCollectionDetail(e); }); r.appendChild(m); });
}
function renderJournal() {
  if (!ST.calSel) { var n = new Date(); ST.calSel = { y: n.getFullYear(), mo: n.getMonth(), d: n.getDate() }; }
  var y = ST.calSel.y, mo = ST.calSel.mo, d = ST.calSel.d, bt = $("bilan-title"); if (bt) bt.textContent = d + " " + MONTHS_MIN[mo] + " " + y;
  var sh = document.querySelector("#view-journal .sec-head.sticky span:last-child"); if (sh) sh.textContent = "Notes du jour"; renderEncours();
  var feed = []; ST.entries.forEach(function(en) { (en.journal || []).forEach(function(x, ix) { var t = x.at ? new Date(x.at) : null; if (t && t.getFullYear() === y && t.getMonth() === mo && t.getDate() === d) feed.push({ e: en, x: x, ix: ix, at: x.at || 0 }); }); });
  feed.sort(function(a, b) { return b.at - a.at; });
  var f = $("j-feed"); if (!f) return; f.innerHTML = "";
  if (!feed.length) { f.appendChild(emptyBox("book-open", "Aucune entrée ce jour.")); return; }
  feed.slice(0, 80).forEach(function(it) {
    var item = el("div", "jentry"), pd = el("div", "poster"), pi = el("img"); pi.src = it.e.posterThumb || it.e.posterUrl || NO_POSTER; pd.appendChild(pi); pd.addEventListener("click", function(ev) { ev.stopPropagation(); showCollectionDetail(it.e); }); item.appendChild(pd);
    var b = el("div", "content"); b.appendChild(el("div", "time", esc(entryTag(it.x))));
    var tx = el("div", "text", esc(truncate(it.x.text || "", 90))); tx.addEventListener("click", function(ev) { ev.stopPropagation(); openReaderForEntry(it.e, it.ix); }); b.appendChild(tx); b.appendChild(el("div", "title", esc(it.e.titre))); item.appendChild(b);
    var ac = el("div", "acts"), ed = el("button"); ed.setAttribute("aria-label", "Modifier"); ed.innerHTML = '<span class="ic">' + ic("pen") + "</span>"; ed.addEventListener("click", function(ev) { ev.stopPropagation(); quickNoteOpen(it.e, it.x.text, it.x.kind, it.ix, { kind: "entry", e: it.e }); });
    var dl = el("button", "del"); dl.setAttribute("aria-label", "Supprimer"); dl.innerHTML = '<span class="ic">' + ic("trash-2") + "</span>"; dl.addEventListener("click", function(ev) { ev.stopPropagation(); showConfirm("Supprimer cette entrée ?", "", function() { it.e.journal.splice(it.ix, 1); dbPut(it.e).then(function() { toast("Entrée supprimée"); refreshAll(); }); }, "Supprimer"); });
    ac.appendChild(ed); ac.appendChild(dl); item.appendChild(ac); item.addEventListener("click", function() { openReaderForEntry(it.e, it.ix); }); f.appendChild(item);
  });
}
function injectJournalControls() { var cal = $("journal-cal-btn"); if (!cal || $("journal-today-btn")) return; var b = el("button", "sq-btn"); b.id = "journal-today-btn"; b.setAttribute("aria-label", "Revenir à aujourd'hui"); b.innerHTML = '<span class="ic">' + ic("clock") + "</span>"; b.addEventListener("click", function() { var n = new Date(); ST.calSel = { y: n.getFullYear(), mo: n.getMonth(), d: n.getDate() }; ST.calView = { y: n.getFullYear(), mo: n.getMonth() }; ST.calDate = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 12); renderJournal(); toast("Aujourd'hui"); }); if (cal.parentNode) cal.parentNode.insertBefore(b, cal.nextSibling); }
function injectFloatingNoteBtn() { if (!$("fab-note")) { var b = el("button", "fab-note hidden"); b.id = "fab-note"; b.setAttribute("aria-label", "Note rapide"); b.innerHTML = '<span class="ic">' + ic("notebook-pen") + "</span>"; b.addEventListener("click", function() { quickNoteOpen(null, "", "time", null, { kind: "global" }); }); document.body.appendChild(b); } injectJournalControls(); }
function updateFabVisibility() { var b = $("fab-note"); if (b) b.classList.toggle("hidden", ST.view !== "journal"); }
function injectBackupBanner() {
  var s = settingsLoad(), days = s.alertBackupDays || 14, last = parseInt(localStorage.getItem("last_gh_backup") || localStorage.getItem("last_backup") || "0", 10), mn = document.querySelector("main"); if (!mn) return;
  var od = $("backup-banner"); if (od) od.remove(); if (sessionStorage.getItem("bb_dismissed") === "1") return;
  var age = last ? (Date.now() - last) / 86400000 : 9999; if (age < days) return;
  var b = el("div", "backup-banner"); b.id = "backup-banner"; b.innerHTML = '<span class="ic">' + ic("alert") + "</span><span>Ça fait " + (last ? Math.floor(age) + " jour(s)" : "toujours") + " sans sauvegarde. Pense à exporter.</span>";
  var go = el("button", ""); go.innerHTML = "<span>Sauvegarder</span>"; go.addEventListener("click", function() { openOptSave(); });
  var cl = el("button", "bb-close"); cl.setAttribute("aria-label", "Ignorer"); cl.innerHTML = '<span class="ic">' + ic("x") + "</span>"; cl.addEventListener("click", function() { sessionStorage.setItem("bb_dismissed", "1"); b.remove(); });
  b.appendChild(go); b.appendChild(cl); mn.insertBefore(b, mn.firstChild);
}

// ==========================================
// 20. OPTIONS ET SAUVEGARDE
// ==========================================
function renderOptions() { var g = $("opt-grid"); if (!g) return; g.innerHTML = ""; [{ i: "save", l: "Sauvegarde", f: openOptSave }, { i: "list", l: "Mes listes", f: openOptMyLists }, { i: "palette", l: "Apparence", f: openOptAppearance }, { i: "bar-chart-3", l: "Stats", f: openOptStats }, { i: "search", l: "Recherche", f: openOptSearch }, { i: "smartphone", l: "Application", f: openOptApp }, { i: "info", l: "À propos", f: openOptAbout }, { i: "alert", l: "Danger", f: openOptDanger }, { i: "alert-triangle", l: "Problèmes / Bugs", f: openOptProblemes }].forEach(function(c) { var b = el("button", "opt-btn"); b.innerHTML = '<span class="ic">' + ic(c.i) + "</span><span>" + esc(c.l) + "</span>"; b.addEventListener("click", c.f); g.appendChild(b); }); }
function openOptSave() {
  var b = el("div"); b.appendChild(el("div", "sec-title", "Sauvegarde locale"));
  b.appendChild(btn("Exporter en JSON", "download", "wide", function() { exportJSON(); })); b.appendChild(btn("Importer (fusion)", "upload", "wide", function() { importJSON(); })); b.appendChild(btn("Copier tout (TSV)", "clipboard-copy", "wide", function() { copyTSV(); }));
  b.appendChild(el("div", "sec-title", "Backup GitHub (repo privé)"));
  var go = el("input"); go.placeholder = "Owner (ex : BoraGooum)"; go.value = localStorage.getItem("gh_owner") || ""; go.style.marginBottom = "10px"; b.appendChild(go);
  var gr = el("input"); gr.placeholder = "Repo (ex : collection-backup)"; gr.value = localStorage.getItem("gh_repo") || ""; gr.style.marginBottom = "10px"; b.appendChild(gr);
  var gt = el("input"); gt.placeholder = "Token (github_pat_…)"; gt.type = "password"; gt.value = localStorage.getItem("gh_token") || ""; gt.style.marginBottom = "14px"; b.appendChild(gt);
  b.appendChild(btn("Sauver la config", "save", "primary wide", function() { localStorage.setItem("gh_owner", go.value.trim()); localStorage.setItem("gh_repo", gr.value.trim()); localStorage.setItem("gh_token", gt.value.trim()); toast("Config GitHub sauvée"); }));
  b.appendChild(btn("Tester la connexion", "link", "wide", function() { ghTest(); })); b.appendChild(btn("Sauvegarder maintenant", "upload", "wide", function() { ghBackupNow(true); }));
  b.appendChild(btn("Restaurer depuis GitHub", "download", "wide", function() { showConfirm("Restaurer ?", "Les œuvres manquantes seront ajoutées.", function() { ghRestore(); }, "Restaurer"); }));
  var lb = localStorage.getItem("last_gh_backup"); b.appendChild(el("div", "", "Dernier backup GitHub : <b>" + (lb ? new Date(parseInt(lb, 10)).toLocaleString("fr-FR") : "jamais") + "</b>"));
  setModal("Sauvegarde", b, [["Fermer", "", closeModal, "x"]]);
}
function openOptMyLists() {
  var bd = el("div"), tb = el("div", "chips mylist-tabs"), hs = el("div"), cur = "plateformes", LB = { types: "Types", plateformes: "Plateformes", supports: "Supports", packagings: "Packagings", bonus: "Bonus" };
  function uc(k, n) { var c = 0; ST.entries.forEach(function(e) { if (k === "types" && e.type === n) c++; if (k === "plateformes" && e.plateforme === n) c++; if (k === "supports" && e.support === n) c++; if (k === "packagings" && e.packaging === n) c++; if (k === "bonus" && (e.bonus || []).indexOf(n) >= 0) c++; }); return c; }
  function rt() { tb.innerHTML = ""; LIST_KEYS.forEach(function(k) { var c = el("div", "chip" + (k === cur ? " on" : ""), "<span>" + LB[k] + "</span>"); c.addEventListener("click", function() { cur = k; rt(); rr(); }); tb.appendChild(c); }); }
  function rr() {
    hs.innerHTML = ""; var it = listItems(cur); if (!it.length) { hs.appendChild(emptyBox("list", "Liste vide.")); return; }
    it.forEach(function(x, i) {
      var r = el("div", "mylist-row"); r.innerHTML = valueIconHTML(x) + '<span class="ml-name">' + esc(x.name) + "</span>" + (x.base ? '<span class="ml-base">base</span>' : "");
      var u = uc(cur, x.name); if (u) r.querySelector(".ml-name").insertAdjacentHTML("afterend", ' <span class="ml-used">utilisée (' + u + ")</span>");
      var up = el("button", "sq-btn ml-btn"); up.setAttribute("aria-label", "Monter"); up.innerHTML = '<span class="ic">' + ic("arrow-up") + "</span>"; up.disabled = i === 0; up.addEventListener("click", function() { moveItem(cur, x.name, "up"); rr(); });
      var dn = el("button", "sq-btn ml-btn"); dn.setAttribute("aria-label", "Descendre"); dn.innerHTML = '<span class="ic">' + ic("arrow-down") + "</span>"; dn.disabled = i === it.length - 1; dn.addEventListener("click", function() { moveItem(cur, x.name, "down"); rr(); });
      var ed = el("button", "sq-btn ml-btn"); ed.setAttribute("aria-label", "Personnaliser"); ed.innerHTML = '<span class="ic">' + ic("palette") + "</span>"; ed.addEventListener("click", function() { openItemEditor(cur, x, rr); });
      r.appendChild(up); r.appendChild(dn); r.appendChild(ed);
      if (!x.base) { var dl = el("button", "sq-btn ml-btn del"); dl.setAttribute("aria-label", "Supprimer"); dl.innerHTML = '<span class="ic">' + ic("trash") + "</span>"; dl.addEventListener("click", function() { if (u) showConfirm("« " + x.name + " » est utilisée par " + u + " œuvre(s).", "Elle restera sur ces œuvres mais disparaîtra des futurs choix.", function() { removeCustom(cur, x.name); rr(); }, "Supprimer quand même"); else { removeCustom(cur, x.name); rr(); } }); r.appendChild(dl); }
      hs.appendChild(r);
    });
  }
  bd.appendChild(tb); bd.appendChild(hs); rt(); rr(); setModal("Mes listes", bd, [["Fermer", "", closeModal, "x"]]);
}
function openItemEditor(key, item, after) {
  var state = { view: "main", q: "" };
  function fresh() { return listItems(key).filter(function(x) { return x.name === item.name; })[0] || item; }
  function rMain() {
    var it = fresh(), b = el("div"), nf = el("div", "field"); nf.appendChild(el("span", "flabel", "Nom"));
    var ni = el("input"); ni.value = it.name; ni.disabled = !!it.base; if (it.base) ni.title = "Valeur de base : nom non modifiable."; nf.appendChild(ni); b.appendChild(nf);
    b.appendChild(btn("Icône : " + (it.icon || "tag"), it.icon || "tag", "wide", function() { state.view = "icon"; rn(); }));
    var colBtn = btn("Couleur : " + (it.color ? "définie" : "aucune"), "palette", "wide", function() { state.view = "color"; rn(); }); if (it.color) { colBtn.style.color = it.color; var ci = colBtn.querySelector(".ic"); if (ci) ci.style.color = it.color; } b.appendChild(colBtn);
    if (!it.base) {
      b.appendChild(btn("Renommer", "pen", "wide", function() {
        var v = ni.value.trim(); if (!v || v === it.name) return; var u = 0;
        ST.entries.forEach(function(e) { if (key === "types" && e.type === it.name) u++; if (key === "plateformes" && e.plateforme === it.name) u++; if (key === "supports" && e.support === it.name) u++; if (key === "packagings" && e.packaging === it.name) u++; if (key === "bonus" && (e.bonus || []).indexOf(it.name) >= 0) u++; });
        function dr() { renameItem(key, it.name, v); var sv = []; ST.entries.forEach(function(e) { if (key === "types" && e.type === it.name) { e.type = v; sv.push(dbPut(e)); } if (key === "plateformes" && e.plateforme === it.name) { e.plateforme = v; sv.push(dbPut(e)); } if (key === "supports" && e.support === it.name) { e.support = v; sv.push(dbPut(e)); } if (key === "packagings" && e.packaging === it.name) { e.packaging = v; sv.push(dbPut(e)); } if (key === "bonus") { var bx = e.bonus || [], bi = bx.indexOf(it.name); if (bi >= 0) { bx[bi] = v; e.bonus = bx; sv.push(dbPut(e)); } } }); Promise.all(sv).then(function() { toast("Renommé" + (u ? " (" + u + " œuvre(s) mise(s) à jour)" : "")); after(); buildTypeDropdown(); refreshAll(); }); }
        if (u) showConfirm("Renommer ?", "« " + it.name + " » est utilisé par " + u + " œuvre(s). Elles suivront le nouveau nom.", dr, "Renommer"); else dr();
      }));
    }
    setSheet("Personnaliser : " + it.name, b, [["Fermer", "", closeMenu, "x"]]);
  }
  function rIcon() {
    var it = fresh(), b = el("div"), se = el("input"); se.placeholder = "Chercher une icône (ex : manette)…"; se.value = state.q; se.style.marginBottom = "14px"; b.appendChild(se); var g = el("div", "icon-grid"); b.appendChild(g);
    function cell(n, s) { var c = el("button", "icon-cell" + (n === it.icon ? " on" : "")); c.setAttribute("aria-label", "Icône " + n); c.innerHTML = s || ic(n); c.addEventListener("click", function() { setItemMeta(key, it.name, { icon: n }); after(); state.view = "main"; rn(); }); return c; }
    function rb() { g.innerHTML = ""; Object.keys(I).forEach(function(n) { g.appendChild(cell(n, I[n])); }); }
    function rs(q) {
      g.innerHTML = ""; var nm = LUCIDE_NAMES.filter(function(n) { return n.indexOf(q) >= 0; }).slice(0, 60); if (!nm.length) { g.appendChild(el("div", "status", "Aucune icône trouvée.")); return; }
      nm.forEach(function(n) { if (I[n]) { g.appendChild(cell(n, I[n])); return; } var c = el("button", "icon-cell" + (n === it.icon ? " on" : "")); c.setAttribute("aria-label", "Charger icône " + n); c.innerHTML = '<span class="ic">' + ic("image") + "</span>"; c.addEventListener("click", function() { fetch("https://unpkg.com/lucide-static@latest/icons/" + n + ".svg").then(function(r) { return r.text(); }).then(function(t) { localStorage.setItem("icon_svg_" + n, t); I[n] = t; setItemMeta(key, it.name, { icon: n }); after(); state.view = "main"; rn(); }).catch(function() { toast("Icône indisponible (réseau).", 3000); }); }); g.appendChild(c); });
    }
    se.addEventListener("input", function() { state.q = norm(se.value); if (!state.q) rb(); else rs(state.q); }); if (!state.q) rb(); else rs(state.q); setSheet("Icône", b, [["Retour", "", function() { state.view = "main"; rn(); }, "x"]]);
  }
  function rColor() {
    var it = fresh(), b = el("div", "color-grid"), nn = el("button", "color-cell" + (!it.color ? " on" : "")); nn.setAttribute("aria-label", "Aucune couleur"); nn.style.background = "var(--s2)"; nn.innerHTML = '<span class="ic">' + ic("x") + "</span>"; nn.addEventListener("click", function() { setItemMeta(key, it.name, { color: null }); after(); state.view = "main"; rn(); }); b.appendChild(nn);
    COLOR_SWATCHES.forEach(function(h) { var c = el("button", "color-cell" + (h === it.color ? " on" : "")); c.setAttribute("aria-label", "Couleur " + h); c.style.background = h; c.addEventListener("click", function() { setItemMeta(key, it.name, { color: h }); after(); state.view = "main"; rn(); }); b.appendChild(c); });
    setSheet("Couleur", b, [["Retour", "", function() { state.view = "main"; rn(); }, "x"]]);
  }
  function rn() { if (state.view === "icon") rIcon(); else if (state.view === "color") rColor(); else rMain(); } rn();
}
function openOptAppearance() {
  var s = settingsLoad(), b = el("div"); b.appendChild(el("span", "flabel", "Couleur du thème"));
  var sw = el("div", "swatch-row"); THEME_PRESETS.forEach(function(t) { var x = el("div", "swatch" + (t.id === s.theme ? " on" : "")); x.style.background = "linear-gradient(135deg," + t.acc + "," + t.acc2 + ")"; x.title = t.name; x.innerHTML = '<span class="ck"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></span>'; x.addEventListener("click", function() { s.theme = t.id; settingsSave(s); applyTheme(t.id); closeModal(); openOptAppearance(); }); sw.appendChild(x); }); b.appendChild(sw);
  b.appendChild(el("span", "flabel", "Police d'écriture")); FONT_PRESETS.forEach(function(f) { ensureFontLoaded(f.id); });
  var fl = el("div", "radio-list"); FONT_PRESETS.forEach(function(f) { var o = el("div", "radio-opt" + (f.id === s.font ? " sel" : "")); o.innerHTML = '<span class="dot"></span><span class="lbl" style="font-family:' + f.stack + ';font-size:17px;">' + esc(f.name) + "</span>"; o.addEventListener("click", function() { s.font = f.id; s.fontTitle = f.id; settingsSave(s); applyFont(f.id); applyTitleFont(f.id); closeModal(); openOptAppearance(); }); fl.appendChild(o); }); b.appendChild(fl);
  b.appendChild(el("span", "flabel", "Taille du texte")); var fp = el("div", "pill-sel"); [["s", "Petit"], ["m", "Normal"], ["l", "Grand"]].forEach(function(o) { var x = el("button", o[0] === s.fontSize ? "on" : "", "<span>" + o[1] + "</span>"); x.addEventListener("click", function() { s.fontSize = o[0]; settingsSave(s); applySettings(); closeModal(); openOptAppearance(); }); fp.appendChild(x); }); b.appendChild(fp);
  b.appendChild(el("span", "flabel", "Densité")); var dp = el("div", "pill-sel"); [["comfort", "Confort"], ["compact", "Compact"]].forEach(function(o) { var x = el("button", o[0] === s.density ? "on" : "", "<span>" + o[1] + "</span>"); x.addEventListener("click", function() { s.density = o[0]; settingsSave(s); applySettings(); closeModal(); openOptAppearance(); }); dp.appendChild(x); }); b.appendChild(dp);
  setModal("Apparence", b, [["Fermer", "", closeModal, "x"]]);
}
function openOptStats() {
  var b = el("div"), en = ST.entries, tot = en.length, bt = {}, sm = 0, cn = 0, co = 0;
  en.forEach(function(e) { bt[e.type] = (bt[e.type] || 0) + 1; if (e.note != null) { sm += e.note; cn++; } if (e.coeur) co++; });
  var s1 = el("div", "box"); s1.appendChild(el("div", "sec-title", "Par type")); Object.keys(bt).forEach(function(t) { var r = el("div", "sline"); r.innerHTML = "<span>" + esc(t) + "</span><b>" + bt[t] + "</b>"; s1.appendChild(r); }); b.appendChild(s1);
  var s2 = el("div", "box"); s2.appendChild(el("div", "sec-title", "Notes")); var r2 = el("div", "sline"); r2.innerHTML = "<span>Moyenne</span><b>" + (cn ? (sm / cn).toFixed(1) : "—") + "/10</b>"; s2.appendChild(r2); var r3 = el("div", "sline"); r3.innerHTML = "<span>Total œuvres</span><b>" + tot + "</b>"; s2.appendChild(r3); var r4 = el("div", "sline"); r4.innerHTML = "<span>Coups de cœur</span><b>" + co + "</b>"; s2.appendChild(r4); b.appendChild(s2);
  setModal("Statistiques", b, [["Fermer", "", closeModal, "x"]]);
}
function openOptSearch() { var s = settingsLoad(), b = el("div"); b.appendChild(el("span", "flabel", "Type par défaut")); var tp = el("div", "pill-sel"); allTypes().forEach(function(t) { var x = el("button", t === s.defaultType ? "on" : "", "<span>" + esc(t) + "</span>"); x.addEventListener("click", function() { s.defaultType = t; settingsSave(s); ST.currentType = t; closeModal(); openOptSearch(); buildTypeDropdown(); }); tp.appendChild(x); }); b.appendChild(tp); setModal("Recherche", b, [["Fermer", "", closeModal, "x"]]); }
function openOptApp() { var b = el("div"); b.appendChild(btn("Installer l'application", "download", "wide", function() { triggerInstall(); })); b.appendChild(btn("Vider le cache hors-ligne", "trash", "wide", function() { if ("caches" in window) caches.keys().then(function(k) { k.forEach(function(x) { caches.delete(x); }); }); toast("Cache vidé"); })); b.appendChild(el("div", "", "Réseau : <b>" + (navigator.onLine ? "connecté" : "hors-ligne") + "</b>")); setModal("Application", b, [["Fermer", "", closeModal, "x"]]); }
function openOptAbout() { var b = el("div"); b.appendChild(el("div", "", "Version : <b>V0.9.5</b>")); b.appendChild(el("div", "", "Build : <b>" + new Date(BUILD).toLocaleString("fr-FR", { timeZone: "Europe/Paris" }) + "</b>")); var c = el("a", "", "Créé par Gooumbora"); c.href = "https://www.senscritique.com/Gooumbora"; c.target = "_blank"; c.style.color = "var(--acc)"; b.appendChild(c); setModal("À propos", b, [["Fermer", "", closeModal, "x"]]); }
function openOptDanger() { var b = el("div"); b.appendChild(btn("Effacer toutes mes œuvres", "trash", "wide", function() { showConfirm("Effacer TOUTES tes œuvres ?", "Cette action est irréversible.", function() { (async function() { for (var i = 0; i < ST.entries.length; i++) await dbDelete(ST.entries[i].id); refreshAll(); toast("Vidé"); })(); }, "Effacer"); })); b.appendChild(btn("Réinitialiser les réglages", "rotate-ccw", "wide", function() { showConfirm("Remettre les réglages par défaut ?", "", function() { localStorage.removeItem("settings"); settingsSave(Object.assign({}, SETTINGS_DEFAULTS)); applySettings(); toast("Réglages réinitialisés"); }, "Réinitialiser"); })); setModal("Danger", b, [["Fermer", "", closeModal, "x"]]); }

function openOptProblemes() {
  var b = el("div");
  var tabs = ["Recherche", "Bibliothèque", "Journal", "Options"];
  tabs.forEach(function(t, i) {
    var lbl = el("div", "flabel", t); lbl.style.marginTop = "10px";
    var ta = el("textarea"); ta.id = "prob-" + i; ta.placeholder = "Notes pour l'onglet " + t + "...";
    ta.style.cssText = "width:100%; min-height:80px; margin-bottom:12px; padding:10px; background:var(--s1); border:1px solid var(--bd); border-radius:8px; color:var(--tx); font-family:inherit; font-size:14px; resize:vertical;";
    ta.value = localStorage.getItem("bug_report_" + i) || "";
    ta.addEventListener("input", function() { localStorage.setItem("bug_report_" + i, ta.value); });
    b.appendChild(lbl); b.appendChild(ta);
  });
  var btnRow = el("div"); btnRow.style.cssText = "display:flex; gap:10px; margin-top:16px;";
  var btnCopy = btn("Copier le rapport", "clipboard", "primary", function() {
    var report = ""; tabs.forEach(function(t, i) { var val = document.getElementById("prob-" + i).value; if (val.trim()) report += "--- " + t + " ---\n" + val + "\n\n"; });
    if (!report) { toast("Rien à copier."); return; }
    navigator.clipboard.writeText(report).then(function() { toast("Rapport copié !"); }).catch(function() { toast("Erreur copie"); });
  });
  var btnClear = btn("Tout effacer", "trash-2", "", function() {
    showConfirm("Effacer toutes les notes de bugs ?", "Cette action est irréversible.", function() {
      tabs.forEach(function(t, i) { document.getElementById("prob-" + i).value = ""; localStorage.removeItem("bug_report_" + i); });
      toast("Notes effacées");
    }, "Effacer");
  });
  btnRow.appendChild(btnCopy); btnRow.appendChild(btnClear); b.appendChild(btnRow);
  setModal("Signaler un problème", b, [["Fermer", "", closeModal, "x"]]);
}

// ==========================================
// 21. GITHUB BACKUP
// ==========================================
function ghConfig() { return { owner: (localStorage.getItem("gh_owner") || "").trim(), repo: (localStorage.getItem("gh_repo") || "").trim(), token: (localStorage.getItem("gh_token") || "").trim() }; }
function ghB64encode(s) { return btoa(unescape(encodeURIComponent(s))); }
function ghB64decode(s) { return decodeURIComponent(escape(atob(s))); }
async function ghGetFile(c, p) { var r = await fetch("https://api.github.com/repos/" + c.owner + "/" + c.repo + "/contents/" + p, { headers: { Authorization: "Bearer " + c.token, Accept: "application/vnd.github+json" } }); if (r.status === 404) return null; if (!r.ok) throw new Error("GET " + r.status); return await r.json(); }
async function ghPutFile(c, p, ct) { var cu = await ghGetFile(c, p), bd = { message: "Backup auto " + new Date().toISOString(), content: ghB64encode(ct) }; if (cu && cu.sha) bd.sha = cu.sha; var r = await fetch("https://api.github.com/repos/" + c.owner + "/" + c.repo + "/contents/" + p, { method: "PUT", headers: { Authorization: "Bearer " + c.token, Accept: "application/vnd.github+json", "Content-Type": "application/json" }, body: JSON.stringify(bd) }); if (!r.ok) throw new Error("PUT " + r.status); return await r.json(); }
var ghTimer = null;
function scheduleGitHubBackup() { var c = ghConfig(); if (!c.owner || !c.repo || !c.token) return; if (ghTimer) clearTimeout(ghTimer); ghTimer = setTimeout(function() { ghBackupNow(false); }, 5000); }
function dumpLists() { var o = {}; LIST_KEYS.forEach(function(k) { o[k] = getList(k); }); return o; }
async function ghBackupNow(m) { var c = ghConfig(); if (!c.owner || !c.repo || !c.token) { if (m) toast("Configure GitHub dans Options."); return; } var d = { version: "V0.9.5", exportDate: new Date().toISOString(), settings: settingsLoad(), lists: dumpLists(), customIcons: getCustomIcons(), entries: ST.entries }; try { await ghPutFile(c, "sauvegarde.json", JSON.stringify(d)); localStorage.setItem("last_gh_backup", String(Date.now())); if (m) toast("Sauvegarde GitHub OK"); } catch(e) { if (m) toast("Erreur GitHub : " + e.message, 3000); } }
async function ghTest() { var c = ghConfig(); if (!c.owner || !c.repo || !c.token) { toast("Remplis owner, repo et token."); return; } try { var r = await fetch("https://api.github.com/repos/" + c.owner + "/" + c.repo, { headers: { Authorization: "Bearer " + c.token, Accept: "application/vnd.github+json" } }); if (r.ok) { var d = await r.json(); toast("Connexion OK : " + d.full_name + (d.private ? " (privé)" : " (PUBLIC !)")); } else toast("Erreur " + r.status, 3000); } catch(e) { toast("Réseau impossible", 3000); } }
async function ghRestore() { var c = ghConfig(); if (!c.owner || !c.repo || !c.token) { toast("Configure GitHub dans Options."); return; } try { var f = await ghGetFile(c, "sauvegarde.json"); if (!f) { toast("Aucune sauvegarde trouvée.", 3000); return; } var d = JSON.parse(ghB64decode(f.content)), ls = d.entries || [], ids = {}; ST.entries.forEach(function(x) { ids[x.id] = 1; }); var ad = 0; for (var i = 0; i < ls.length; i++) { var en = ls[i]; if (en && en.id && !ids[en.id]) { if (!en.titre) en.titre = "Sans titre"; if (!en.dateAjout) en.dateAjout = new Date().toISOString(); await dbPut(en); ad++; } } if (d.settings) settingsSave(Object.assign({}, SETTINGS_DEFAULTS, d.settings)); if (d.lists) LIST_KEYS.forEach(function(k) { if (Array.isArray(d.lists[k]) && d.lists[k].length) setList(k, d.lists[k]); }); if (d.customTypes) importLegacyList("types", d.customTypes); if (d.customLists) { importLegacyList("plateformes", d.customLists.plateformes); importLegacyList("supports", d.customLists.supports); importLegacyList("packagings", d.customLists.packagings); importLegacyList("bonus", d.customLists.bonus); } if (d.customIcons) setCustomIcons(d.customIcons); applySettings(); buildTypeDropdown(); refreshAll(); toast("Restauré : " + ad + " œuvre(s) ajoutée(s)"); } catch(e) { toast("Restauration impossible : " + e.message, 3000); } }

// ==========================================
// 22. ASSISTANT DE SAISIE (SMART SCRAPE LOCAL)
// ==========================================
async function openSmartScrapeAssistant(ean, currentTitle, cb) {
  var body = el("div");
  body.style.cssText = "display:flex; flex-direction:column; gap:16px; padding-bottom:10px;";
  
  var btnRow = el("div");
  btnRow.style.cssText = "display:flex; gap:12px; justify-content:center; margin-bottom:8px;";
  
  var commonBtnStyle = "width:60px; height:60px; min-width:60px; border-radius:16px; display:flex; align-items:center; justify-content:center; border: 1px solid var(--bd);";
  
  var btnDvd = el("button", "sq-btn");
  btnDvd.setAttribute("aria-label", "Rechercher sur DVD.fr");
  btnDvd.innerHTML = '<span class="ic">' + ic("eject") + '</span>';
  btnDvd.style.cssText = commonBtnStyle + " background: linear-gradient(135deg, rgba(0,85,164,0.3), rgba(255,255,255,0.1), rgba(239,65,53,0.3));";
  btnDvd.addEventListener("click", function() {
    if (currentTitle) {
      window.open("https://www.dvdfr.com/listeliv.php?flou&mots_recherche=" + encodeURIComponent(currentTitle) + "&base=dvd", "_blank");
    } else {
      toast("Titre manquant pour la recherche.");
    }
  });
  
  var btnEan = el("button", "sq-btn");
  btnEan.setAttribute("aria-label", "Rechercher par EAN");
  btnEan.innerHTML = '<span class="ic">' + ic("barcode") + '</span>';
  btnEan.style.cssText = commonBtnStyle + " background: var(--s2);";
  btnEan.addEventListener("click", function() {
    if (ean) {
      window.open("https://www.ean-search.org/ean/" + ean, "_blank");
    } else {
      toast("EAN manquant pour la recherche.");
    }
  });
  
  var btnPaste = el("button", "sq-btn");
  btnPaste.setAttribute("aria-label", "Coller et analyser");
  btnPaste.innerHTML = '<span class="ic">' + ic("clipboard") + '</span>';
  btnPaste.style.cssText = commonBtnStyle + " background: var(--s2);";
  
  btnRow.appendChild(btnDvd);
  btnRow.appendChild(btnEan);
  btnRow.appendChild(btnPaste);
  body.appendChild(btnRow);
  
  var pasteArea = el("div");
  pasteArea.style.cssText = "display:none; flex-direction:column; gap:10px;";
  
  var infoText = el("div");
  infoText.style.cssText = "font-size:13px; color:var(--dim); text-align:center; line-height:1.4;";
  infoText.innerHTML = "Sur la page ouverte : <b>Ctrl+U</b> (Code source) → <b>Ctrl+A</b> → <b>Ctrl+C</b><br>ou copie simplement tout le texte de la page.";
  pasteArea.appendChild(infoText);
  
  var ta = el("textarea");
  ta.placeholder = "Colle le code source ou le texte ici...";
  ta.style.cssText = "width:100%; min-height:150px; padding:10px; background:var(--s1); border:1px solid var(--bd); border-radius:8px; color:var(--tx); font-family:var(--fm); font-size:12px; resize:vertical;";
  
  var analyzeBtn = btn("Analyser le contenu collé", "search", "primary wide", function() {
    var text = ta.value.trim();
    if (!text) { toast("Rien à analyser."); return; }
    processPastedText(text, cb);
  });
  
  pasteArea.appendChild(ta);
  pasteArea.appendChild(analyzeBtn);
  body.appendChild(pasteArea);
  
  btnPaste.addEventListener("click", function() {
    pasteArea.style.display = "flex";
    ta.focus();
  });
  
  setModal("Assistant de saisie", body, [["Fermer", "", closeModal, "x"]]);
}

async function processPastedText(text, cb) {
  var body = $("m-body");
  body.innerHTML = '<div class="status" style="text-align:center;padding:20px;">Analyse en cours...</div>';
  
  try {
    var doc = new DOMParser().parseFromString(text, "text/html");
    var fullText = doc.body ? doc.body.innerText : text;
    var rawTitle = (doc.querySelector("h1") || doc.querySelector("title") || {}).textContent || "";
    rawTitle = rawTitle.replace(/\s*[-–|]\s*.*$/i, "").trim();
    
    var extracted = {
      titre: rawTitle, ean: "", dateSortie: "", realisateur: "", acteurs: "",
      resume: "", description: "", bonus: "", support: "", packaging: "",
      langue: "", duree: "", editeur: "", technique: ""
    };
    
    var eanMatch = fullText.match(/\b(\d{13})\b/);
    if (eanMatch) extracted.ean = eanMatch[1];
    
    var dateMatch = fullText.match(/(?:sortie|date|release|parution)[^0-9]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4})/i);
    if (dateMatch) extracted.dateSortie = dateMatch[1];
    else { var yearMatch = fullText.match(/\b(19|20)\d{2}\b/); if (yearMatch) extracted.dateSortie = yearMatch[0]; }
    
    var realMatch = fullText.match(/(?:réalisateur|director|de|par)\s*[:\-]?\s*([A-Z][a-zéèàù]+\s+[A-Z][a-zéèàù]+)/i);
    if (realMatch) extracted.realisateur = realMatch[1];
    
    var actMatch = fullText.match(/(?:avec|casting|acteurs?|distribution)\s*[:\-]?\s*([A-Z][a-zéèàù]+(?:\s*,\s*[A-Z][a-zéèàù]+){2,})/i);
    if (actMatch) extracted.acteurs = actMatch[1];
    
    var synMatch = fullText.match(/(?:synopsis|résumé|resume|histoire|pitch)\s*[:\-]?\s*([\s\S]{50,500}?)(?=\n\n|\n[A-Z]|Bonus|Contenu|Descriptif|$)/i);
    if (synMatch) extracted.resume = synMatch[1].trim();
    
    var descMatch = fullText.match(/(?:présentation|description|à propos|about)\s*[:\-]?\s*([\s\S]{50,800}?)(?=\n\n(?:Bonus|Contenu|Descriptif|Caractérist)|$)/i);
    if (descMatch) extracted.description = descMatch[1].trim();
    
    var bonusMatch = fullText.match(/(?:bonus|contenu|suppléments?|special features)\s*[:\-]?\s*([\s\S]{20,1000}?)(?=\n\n(?:Descriptif|Caractérist|Format)|$)/i);
    if (bonusMatch) extracted.bonus = bonusMatch[1].trim();
    
    var techMatch = fullText.match(/(?:descriptif\s*technique|caractéristique|format|spécifications?)\s*[:\-]?\s*([\s\S]{20,800}?)(?=\n\n(?:Détails|Conformité)|$)/i);
    if (techMatch) extracted.technique = techMatch[1].trim();
    
    var langMatch = fullText.match(/(?:langue|audio|language)\s*[:\-]?\s*([A-Z][a-zéèàù]+(?:\s*,\s*[A-Z][a-zéèàù]+)*)/i);
    if (langMatch) extracted.langue = langMatch[1];
    
    var dureeMatch = fullText.match(/(?:durée|duration|runtime)\s*[:\-]?\s*(\d+\s*(?:min|minutes?|h))/i);
    if (dureeMatch) extracted.duree = dureeMatch[1];
    
    var editMatch = fullText.match(/(?:éditeur|studio|distributeur|edition)\s*[:\-]?\s*([A-Z][a-zéèàù]+(?:\s+[A-Z][a-zéèàù]+)*)/i);
    if (editMatch) extracted.editeur = editMatch[1];
    
    var allText = (rawTitle + " " + fullText).toLowerCase();
    extracted.support = allText.indexOf("4k") >= 0 || allText.indexOf("uhd") >= 0 ? "Physique - 4K UHD" :
                        allText.indexOf("blu-ray") >= 0 || allText.indexOf("bluray") >= 0 ? "Physique - Blu-ray" :
                        allText.indexOf("dvd") >= 0 ? "Physique - DVD" : "";
    extracted.packaging = allText.indexOf("steelbook") >= 0 || allText.indexOf("boîtier métal") >= 0 ? "Steelbook" :
                          allText.indexOf("digipack") >= 0 ? "Digipack" : "";
    
    var searchTitle = rawTitle.split(' - ')[0].split(' (')[0].trim();
    var finalTitle = rawTitle;
    var finalPoster = "";
    
    if (searchTitle && typeof searchTMDB === "function") {
      try {
        var tmdbRes = await searchTMDB(searchTitle, "movie");
        if (tmdbRes && tmdbRes.length) {
          finalTitle = tmdbRes[0].title;
          finalPoster = tmdbRes[0].poster;
        }
      } catch(e) { console.log("TMDB search failed", e); }
    }
    extracted.titre = finalTitle;
    
    body.innerHTML = "";
    var form = el("div");
    form.style.cssText = "display:flex;flex-direction:column;gap:12px;";
    
    function makeRow(label, value, key, isTextarea) {
      if (!value && key !== "titre") return null;
      var row = el("div");
      row.style.cssText = "display:flex;align-items:flex-start;gap:10px;";
      
      var cbx = el("input");
      cbx.type = "checkbox";
      cbx.checked = true;
      cbx.dataset.key = key;
      cbx.style.cssText = "margin-top:12px;width:18px;height:18px;accent-color:var(--acc);cursor:pointer;";
      
      var info = el("div");
      info.style.cssText = "flex:1;min-width:0;";
      var lbl = el("div");
      lbl.style.cssText = "font-size:12px;font-weight:700;color:var(--dim);margin-bottom:4px;";
      lbl.textContent = label;
      
      var val = isTextarea ? el("textarea") : el("input");
      val.value = value || "";
      val.style.cssText = "width:100%;padding:8px;font-size:14px;background:var(--s1);border:1px solid var(--bd);border-radius:8px;color:var(--tx);" + (isTextarea ? "min-height:80px;resize:vertical;font-family:inherit;" : "");
      
      var btnClear = el("button", "sq-btn");
      btnClear.setAttribute("aria-label", "Effacer ce champ");
      btnClear.innerHTML = '<span class="ic">' + ic("x") + '</span>';
      btnClear.style.cssText = "width:32px;height:32px;min-width:32px;padding:0;margin-top:8px;";
      btnClear.addEventListener("click", function() { val.value = ""; });
      
      info.appendChild(lbl);
      info.appendChild(val);
      row.appendChild(cbx);
      row.appendChild(info);
      row.appendChild(btnClear);
      return row;
    }
    
    var fields = [
      ["Titre officiel", extracted.titre, "titre", false],
      ["EAN", extracted.ean, "ean", false],
      ["Date de sortie", extracted.dateSortie, "dateSortie", false],
      ["Réalisateur", extracted.realisateur, "realisateur", false],
      ["Acteurs", extracted.acteurs, "acteurs", false],
      ["Résumé / Synopsis", extracted.resume, "resume", true],
      ["Description", extracted.description, "description", true],
      ["Bonus / Contenu", extracted.bonus, "bonus", true],
      ["Description technique", extracted.technique, "technique", true],
      ["Langue", extracted.langue, "langue", false],
      ["Durée", extracted.duree, "duree", false],
      ["Éditeur / Studio", extracted.editeur, "editeur", false],
      ["Support détecté", extracted.support, "support", false],
      ["Packaging détecté", extracted.packaging, "packaging", false]
    ];
    
    fields.forEach(function(f) {
      var row = makeRow(f[0], f[1], f[2], f[3]);
      if (row) form.appendChild(row);
    });
    
    if (form.children.length === 0) {
      form.innerHTML = "<p style='text-align:center;color:var(--dim);'>Aucune information exploitable trouvée. Vérifie ton collage.</p>";
    }
    
    body.appendChild(form);
    
    var foot = $("m-foot");
    foot.innerHTML = "";
    var btnValidate = el("button", "primary");
    btnValidate.innerHTML = '<span class="ic">' + ic("check") + '</span><span>Appliquer dans la Description</span>';
    btnValidate.addEventListener("click", function() {
      var result = {};
      var selectedSections = [];
      
      form.querySelectorAll("input[type='checkbox']").forEach(function(c) {
        if (c.checked) {
          var valEl = c.nextElementSibling.querySelector("input, textarea");
          if (valEl && valEl.value.trim()) {
            result[c.dataset.key] = valEl.value.trim();
            selectedSections.push({ label: c.parentElement.querySelector("div div").textContent, value: valEl.value.trim() });
          }
        }
      });
      
      if (finalPoster) result.posterUrl = finalPoster;
      
      var formattedDesc = "";
      selectedSections.forEach(function(sec, idx) {
        if (idx > 0) formattedDesc += "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        formattedDesc += "▸ " + sec.label.toUpperCase() + "\n";
        formattedDesc += sec.value;
      });
      
      result.formattedDescription = formattedDesc;
      cb(result);
    });
    var btnCancel = el("button");
    btnCancel.innerHTML = '<span class="ic">' + ic("x") + '</span><span>Fermer</span>';
    btnCancel.addEventListener("click", closeModal);
    foot.appendChild(btnValidate);
    foot.appendChild(btnCancel);
    
  } catch(e) {
    body.innerHTML = '<div class="status error" style="text-align:center;padding:20px;">Erreur lors de l\'analyse : ' + e.message + '</div>';
  }
}