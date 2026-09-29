/* ════════════════════════════════════════════════════════════════
   FICHIER : js/ui.js   —   VERSION : V0.9.1
   RÔLE    : état global, rendu DOM, fenêtres, formulaires, journal,
             note rapide, options, backup GitHub.
   ════════════════════════════════════════════════════════════════ */


/* ───────── ÉTAT GLOBAL ───────── */
var ST = {
  entries: [],
  view: "search",
  colQuery: "",
  calDate: new Date(),
  calSelectedDay: new Date().getDate(),
  calMode: "journal",
  calPickCb: null,
  editing: null,
  selectedItem: null,
  currentType: "Film",
  panelType: "Film",
  currentNote: null,
  isFav: false,
  isEnc: false,
  isVoir: false,
  isInCollection: false,
  draftJournal: [],
  panelPoster: "",
  panelThumb: "",
  qnEntry: null,
  qnKind: "time",
  qnEditIdx: null,
  pickerVal: null,
  recent: [],
  menuEntry: null,
  filterType: "all",
  filterSupport: "all",
  filterSort: { key: "date", dir: "desc" },
  advFields: { plateforme: "", dateAchat: "", edition: "", bonus: [], support: "", packaging: "", ean: "", url: "" },
  draft: { titre: "", date: "", comment: "", sub: "" },
  currentReaderEntry: null,
  currentReaderJournalIdx: null,
  lastJournalCount: 0,
  pickerCb: null,
  entryPickCb: null
};

var overlayStack = [];
var zCounter = 0;

var FOOT_IC = {
  "Modifier": "pen", "Fermer": "x", "Enregistrer": "save", "Annuler": "x",
  "Ajouter": "plus", "Supprimer": "trash-2", "Valider": "check", "Remplacer": "save",
  "Vider": "trash", "Réinitialiser": "rotate-ccw", "Confirmer": "check", "Définir": "check"
};

/* Les 5 modes de note (kind interne, label affiché, icône). */
var KINDS = [
  ["time", "Note datée", "clock"],
  ["free", "Instantané", "pen"],
  ["ep", "Épisode", "tv"],
  ["session", "Session", "timer"],
  ["pages", "Pages", "file-text"]
];


/* ───────── OUTILS DOM ───────── */
function el(tag, cls, html) {
  var d = document.createElement(tag);
  if (cls) d.className = cls;
  if (html != null) d.innerHTML = html;
  return d;
}
function $(id) { return document.getElementById(id); }
function fieldBox(label, control) {
  var d = el("div", "field");
  d.appendChild(el("span", "flabel", label));
  d.appendChild(control);
  return d;
}
function btn(label, icon, cls, fn) {
  var b = el("button", cls || "");
  var head = icon ? ('<span class="ic">' + ic(icon) + "</span>") : "";
  b.innerHTML = head + esc(label);
  if (fn) b.addEventListener("click", fn);
  return b;
}
function emptyBox(iconName, txt) {
  var d = el("div", "empty");
  d.innerHTML = '<span class="ic">' + ic(iconName) + "</span>" + esc(txt);
  return d;
}
function toast(msg, ms) {
  var e = $("toast");
  if (!e) return;
  e.textContent = msg;
  e.classList.add("show");
  setTimeout(function () { e.classList.remove("show"); }, ms || 1800);
}


/* ───────── FENÊTRES (empilement dynamique) ───────── */
function showOverlay(id) {
  var e = $(id);
  if (!e) return;
  zCounter = zCounter + 1;
  e.style.zIndex = 200 + zCounter;
  e.classList.add("on");
  if (overlayStack.indexOf(id) < 0) overlayStack.push(id);
  try { history.pushState(null, ""); } catch (err) {}
}
function hideOverlay(id) {
  var e = $(id);
  if (!e) return;
  e.classList.remove("on");
  var i = overlayStack.indexOf(id);
  if (i >= 0) overlayStack.splice(i, 1);
}
window.addEventListener("popstate", function () {
  var id = overlayStack[overlayStack.length - 1];
  if (id) {
    var e = $(id);
    if (e) e.classList.remove("on");
    overlayStack.pop();
  }
});
function closeModal() {
  hideOverlay("modal-overlay");
  var b = $("m-body"); if (b) b.innerHTML = "";
  var f = $("m-foot"); if (f) f.innerHTML = "";
  ST.editing = null;
}
function closeReader() {
  hideOverlay("reader-overlay");
  ST.currentReaderEntry = null;
  ST.currentReaderJournalIdx = null;
}
function closeMenu() { hideOverlay("menu-overlay"); }

/* Fenêtre principale (fiche, détail, listes) : modal-overlay. */
function setModal(title, bodyNode, foot) {
  var t = $("m-title"); if (t) t.textContent = title;
  var b = $("m-body");
  if (b) { b.innerHTML = ""; b.appendChild(bodyNode); }
  var f = $("m-foot");
  if (f) {
    f.innerHTML = "";
    (foot || []).forEach(function (bt) {
      var nodeName = el("button", bt[1] || "");
      var iconName = FOOT_IC[bt[0]] || "";
      var head = iconName ? ('<span class="ic">' + ic(iconName) + "</span>") : "";
      nodeName.innerHTML = head + esc(bt[0]);
      nodeName.addEventListener("click", bt[2]);
      f.appendChild(nodeName);
    });
  }
  showOverlay("modal-overlay");
}

/* 2ᵉ fenêtre par-dessus (sous-choix, pick-liste) : menu-overlay.
   N'écrase PAS la fiche ouverte → le scroll de la fiche est gardé. */
function setSheet(title, bodyNode, foot) {
  var t = $("menu-title"); if (t) t.textContent = title;
  var b = $("menu-body");
  if (!b) return;
  b.innerHTML = "";
  b.appendChild(bodyNode);
  (foot || []).forEach(function (bt) {
    var nodeName = el("button", (bt[1] || "") + " wide");
    nodeName.style.marginTop = "10px";
    var iconName = FOOT_IC[bt[0]] || "";
    var head = iconName ? ('<span class="ic">' + ic(iconName) + "</span>") : "";
    nodeName.innerHTML = head + esc(bt[0]);
    nodeName.addEventListener("click", bt[2]);
    b.appendChild(nodeName);
  });
  showOverlay("menu-overlay");
}

function showConfirm(title, msg, onYes, yesLabel) {
  if (typeof msg === "function") { yesLabel = onYes; onYes = msg; msg = "Cette action est irréversible."; }
  var t = $("confirm-title"); if (t) t.textContent = title;
  var b = $("confirm-body");
  if (b) b.innerHTML = '<p style="font-size:15px;line-height:1.6;">' + esc(msg) + "</p>";
  var f = $("confirm-foot"); if (!f) return;
  f.innerHTML = "";
  var no = el("button", "", "Annuler");
  no.addEventListener("click", function () { hideOverlay("confirm-overlay"); });
  var yes = el("button", "primary", yesLabel || "Confirmer");
  yes.addEventListener("click", function () { hideOverlay("confirm-overlay"); if (onYes) onYes(); });
  f.appendChild(no); f.appendChild(yes);
  showOverlay("confirm-overlay");
}

async function refreshAll() {
  ST.entries = await dbAll();
  renderCollection();
  renderJournal();
  updateJournalBadge();
  scheduleGitHubBackup();
}
function updateJournalBadge() {
  var total = 0;
  ST.entries.forEach(function (e) { total = total + (e.journal || []).length; });
  var badge = $("journal-badge");
  if (!badge) return;
  if (ST.lastJournalCount === 0) { badge.style.display = "none"; ST.lastJournalCount = total; return; }
  if (total > ST.lastJournalCount && ST.view !== "journal") badge.style.display = "block";
  else badge.style.display = "none";
  ST.lastJournalCount = total;
}


/* ───────── HELPERS AFFICHAGE ───────── */
function neonClass(e) {
  if (e.aVoir) return "n-voir";
  if (e.enCours) return "n-enc";
  return "n-fini";
}
function statIcon(e) {
  if (e.aVoir) return ic("eye");
  if (e.enCours) return ic("hourglass");
  return ic("check");
}
function fmtWhen(v) {
  if (!v) return nowStamp();
  var p = v.split("T");
  var d = p[0].split("-");
  var t = (p[1] || "00:00").split(":");
  return d[2] + "/" + d[1] + " à " + t[0] + "h" + t[1];
}
function toInputDate(s) {
  var p = parseDateFR(s);
  if (!p) return "";
  return p.y + "-" + pad2(p.mo) + "-" + pad2(p.d);
}
function openPosterZoom(url) {
  if (!url) return;
  var img = $("poster-img"); if (img) img.src = url;
  showOverlay("poster-overlay");
}
function openReaderForEntry(entry, idx) {
  ST.currentReaderEntry = entry;
  ST.currentReaderJournalIdx = idx;
  var jl = entry.journal || [];
  var x = jl[idx] || { text: "" };
  var t = $("r-title"); if (t) t.textContent = entry.titre;
  var s = $("r-sub"); if (s) s.textContent = entryTag(x);
  var b = $("r-body"); if (b) b.textContent = x.text || "";
  showOverlay("reader-overlay");
}


/* ───────── AFFICHE & MENU ───────── */
function renderPoster(e, withMenu) {
  var p = el("div", "poster " + neonClass(e));
  var img = el("img", "art");
  img.src = e.posterThumb || e.posterUrl || NO_POSTER;
  img.alt = ""; img.loading = "lazy";
  img.addEventListener("click", function (ev) { ev.stopPropagation(); showCollectionDetail(e); });
  p.appendChild(img);

  if (e.note != null) {
    var pn = el("div", "pnote", e.note + "/10");
    var nc = noteColors(e.note);
    if (nc) { pn.style.background = nc[0]; pn.style.color = nc[1]; }
    p.appendChild(pn);
  }
  var pb = progressBadge(e);
  if (pb && withMenu !== false) p.appendChild(el("div", "pp", esc(pb)));

  var st = el("div", "pstat"); st.innerHTML = statIcon(e); p.appendChild(st);

  if (withMenu !== false) {
    var mb = el("button", "pmenu");
    mb.setAttribute("aria-label", "Menu de l'œuvre");
    mb.innerHTML = ic("more-vertical");
    mb.addEventListener("click", function (ev) { ev.stopPropagation(); openMenu(e); });
    p.appendChild(mb);
  }
  return p;
}
function openMenu(e) {
  ST.menuEntry = e;
  var t = $("menu-title"); if (t) t.textContent = e.titre;
  var b = $("menu-body"); if (!b) return;
  b.innerHTML = "";
  [
    ["pen", "Modifier", function () { closeMenu(); renderPanel(e); }],
    ["plus", "Noter vite", function () { closeMenu(); quickNoteOpen(e); }],
    ["duplicate", "Dupliquer", function () { closeMenu(); duplicateEntry(e); }],
    ["trash", "Supprimer", function () {
      closeMenu();
      showConfirm("Supprimer " + e.titre + " ?", "Toutes les entrées de journal seront perdues.", function () {
        dbDelete(e.id).then(function () { toast("Supprimé"); refreshAll(); });
      });
    }]
  ].forEach(function (it) {
    var m = el("div", "mitem");
    m.innerHTML = '<span class="ic">' + ic(it[0]) + "</span><span>" + esc(it[1]) + "</span>";
    m.addEventListener("click", it[2]);
    b.appendChild(m);
  });
  showOverlay("menu-overlay");
}


/* ───────── ÉPISODES ───────── */
function epNoted(entry, s) {
  var set = {};
  (entry.journal || []).forEach(function (x) { if (x.kind === "ep" && x.s === s) set[x.e] = 1; });
  return set;
}
function nextEpFor(entry) {
  var eps = (entry.journal || []).filter(function (x) { return x.kind === "ep"; });
  if (!eps.length) return { s: 1, e: 1 };
  var sMax = 0; eps.forEach(function (x) { if (x.s > sMax) sMax = x.s; });
  var eMax = 0; eps.forEach(function (x) { if (x.s === sMax && x.e > eMax) eMax = x.e; });
  return { s: sMax, e: eMax + 1 };
}
function hasEp(entry) {
  if (entry.type === "Série") return true;
  return (entry.journal || []).some(function (x) { return x.kind === "ep"; });
}
function nextEpButton(entry) {
  var n = nextEpFor(entry);
  var b = el("button", "next-btn");
  b.innerHTML = '<span class="ic">' + ic("check") + "</span><span>S" + pad2(n.s) + "E" + pad2(n.e) + "</span>";
  b.addEventListener("click", function () { openEpisodeWindow(entry); });
  return b;
}
function seasonsFromJournal(entry) {
  var set = {};
  (entry.journal || []).forEach(function (x) { if (x.kind === "ep") set[x.s] = 1; });
  var arr = Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
  if (!arr.length) arr = [1];
  return arr;
}
async function openEpisodeWindow(entry, preferS, preferE) {
  var body = el("div");
  var seasonsLocal = seasonsFromJournal(entry);
  var tmdb = null;
  if (entry.tmdb_id) { try { tmdb = await fetchTMDBSeasons(entry.tmdb_id); } catch (e) { tmdb = null; } }
  var seasons;
  if (tmdb && tmdb.length) seasons = tmdb.map(function (s) { return { n: s.n, total: s.total }; });
  else seasons = seasonsLocal.map(function (n) {
    var noted = epNoted(entry, n), mx = 0;
    for (var k in noted) { if (+k > mx) mx = +k; }
    return { n: n, total: mx + 8 };
  });
  var curS = preferS || seasons[0].n;
  if (!seasons.filter(function (s) { return s.n === curS; }).length) curS = seasons[0].n;

  var pillRow = el("div", "season-row"); body.appendChild(pillRow);
  var head = el("div", "ep-head");
  var stEl = el("span", "st", ""), cntEl = el("span", "cnt", "");
  head.appendChild(stEl); head.appendChild(cntEl); body.appendChild(head);
  var quick = el("div", "quick");
  function qb(label, iconName, fn) {
    var b = el("button", "qbtn");
    b.innerHTML = '<span class="ic">' + ic(iconName) + "</span>" + esc(label);
    b.addEventListener("click", fn); quick.appendChild(b);
  }
  qb("Jusqu'au suivant", "check", function () { toggleUpTo(entry, curS); rebuild(); });
  qb("Tout cocher", "grid", function () { setAll(entry, curS, true); rebuild(); });
  qb("Tout décocher", "x", function () { setAll(entry, curS, false); rebuild(); });
  body.appendChild(quick);
  var grid = el("div", "ep-grid"); body.appendChild(grid);
  var info = el("div", "status"); info.style.textAlign = "center"; body.appendChild(info);

  function renderPills() {
    pillRow.innerHTML = "";
    seasons.forEach(function (s) {
      var p = el("button", "season-pill" + (s.n === curS ? " on" : ""), "S" + pad2(s.n));
      p.addEventListener("click", function () { curS = s.n; rebuild(); });
      pillRow.appendChild(p);
    });
  }
  function rebuild() {
    renderPills();
    var sObj = seasons.filter(function (s) { return s.n === curS; })[0] || { n: curS, total: 8 };
    var noted = epNoted(entry, curS), total = sObj.total, seen = 0;
    for (var k in noted) seen = seen + 1;
    stEl.textContent = "Saison " + curS;
    cntEl.textContent = seen + " / " + total + " vus";
    grid.innerHTML = "";
    for (var e = 1; e <= total; e++) {
      (function (e) {
        var isSeen = !!noted[e];
        var c = el("div", "ep-cell" + (isSeen ? " seen" : ""), String(e));
        if (isSeen) c.insertAdjacentHTML("beforeend", '<svg class="chk" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>');
        c.addEventListener("click", function () { toggleEp(entry, curS, e); rebuild(); });
        grid.appendChild(c);
      })(e);
    }
    info.textContent = tmdb ? "" : "Saison sans total connu : la liste s'étend au besoin.";
  }
  rebuild();
  setModal("Saisons et épisodes : " + entry.titre, body, [["Fermer", "", closeModal]]);
}
function toggleEp(entry, s, e) {
  if (!entry.journal) entry.journal = [];
  var idx = -1;
  for (var i = 0; i < entry.journal.length; i++) {
    var x = entry.journal[i];
    if (x.kind === "ep" && x.s === s && x.e === e) { idx = i; break; }
  }
  if (idx >= 0) entry.journal.splice(idx, 1);
  else entry.journal.push({ kind: "ep", s: s, e: e, note: null, text: "Vu", at: Date.now() });
  dbPut(entry).then(refreshAll);
}
function setAll(entry, s, on) {
  if (!entry.journal) entry.journal = [];
  var noted = epNoted(entry, s), mx = 0;
  for (var k in noted) { if (+k > mx) mx = +k; }
  var total = Math.max(8, mx + 8);
  if (on) { for (var e = 1; e <= total; e++) { if (!noted[e]) entry.journal.push({ kind: "ep", s: s, e: e, note: null, text: "Vu", at: Date.now() + e }); } }
  else entry.journal = entry.journal.filter(function (x) { return !(x.kind === "ep" && x.s === s); });
  dbPut(entry).then(refreshAll);
}
function toggleUpTo(entry, s) {
  if (!entry.journal) entry.journal = [];
  var noted = epNoted(entry, s), mx = 0;
  for (var k in noted) { if (+k > mx) mx = +k; }
  var target = mx + 1;
  for (var e = 1; e <= target; e++) { if (!noted[e]) entry.journal.push({ kind: "ep", s: s, e: e, note: null, text: "Vu", at: Date.now() + e }); }
  dbPut(entry).then(refreshAll);
}


/* ───────── DÉTAIL ŒUVRE ──────── */
function collectionCard(e) {
  var cell = el("div", "grid-cell");
  cell.appendChild(renderPoster(e));
  cell.appendChild(el("div", "title", esc(e.titre)));
  var meta = (e.support || "") + (e.packaging ? " · " + e.packaging : "");
  if (meta) cell.appendChild(el("div", "meta", esc(meta)));
  cell.addEventListener("click", function (ev) { if (ev.target.closest("button")) return; showCollectionDetail(e); });
  return cell;
}
function showCollectionDetail(e) {
  var body = el("div");
  var head = el("div", "detail-head");
  var pw = el("div", "detail-poster");
  var pImg = el("img"); pImg.src = e.posterThumb || e.posterUrl || NO_POSTER; pw.appendChild(pImg);
  var zb = el("div", "zoom-btn");
  zb.innerHTML = '<span class="ic">' + ic("maximize-2") + "</span>Agrandir";
  zb.addEventListener("click", function () { openPosterZoom(pImg.src); });
  pw.appendChild(zb); head.appendChild(pw);

  var info = el("div"); info.style.cssText = "flex:1;min-width:0;";
  var h2 = el("h2", "", esc(e.titre));
  h2.style.cssText = "font-family:var(--ft);font-size:21px;margin-bottom:10px;";
  info.appendChild(h2);
  var tags = el("div", "tagline");
  var nt = el("span", "tag", (e.note != null ? e.note + "/10" : "—/10"));
  var nc = noteColors(e.note);
  if (nc) { nt.style.background = nc[0]; nt.style.color = nc[1]; nt.style.border = "none"; }
  nt.style.cursor = "pointer";
  nt.addEventListener("click", function () { openNoteEditor(e); });
  tags.appendChild(nt);
  tags.appendChild(el("span", "tag", esc(e.type)));
  if (e.support) tags.appendChild(el("span", "tag", esc(e.support)));
  info.appendChild(tags);
  var pb = progressBadge(e);
  if (pb) info.appendChild(el("div", "", '<span style="color:var(--dim);font-size:13px;">Où j\'en suis : </span><b style="font-family:var(--fm);color:var(--acc);">' + esc(pb) + "</b>"));
  if (hasEp(e)) info.appendChild(nextEpButton(e));
  head.appendChild(info); body.appendChild(head);

  var det = el("div", "box");
  function line(l, v, click) {
    var r = el("div", "sline");
    r.innerHTML = '<span style="color:var(--dim);">' + esc(l) + "</span><b>" + esc(v) + "</b>";
    if (click) r.querySelector("b").addEventListener("click", click);
    det.appendChild(r);
  }
  if (e.ean) line("EAN", e.ean, function () { navigator.clipboard.writeText(e.ean); toast("EAN copié"); });
  if (e.url) line("URL", "Ouvrir", function () { window.open(e.url, "_blank"); });
  if (e.plateforme) line("Plateforme", e.plateforme);
  if (e.packaging) line("Packaging", e.packaging);
  if (e.edition) line("Édition", e.edition);
  if (e.dateAchat) line("Date d'achat", formatDate(e.dateAchat));
  if (det.children.length) body.appendChild(det);

  var jb = btn("Voir le journal", "book-open", "wide", function () { closeModal(); openJournalForEntry(e); });
  jb.style.marginBottom = "16px"; body.appendChild(jb);

  setModal(e.titre, body, [
    ["Modifier", "primary", function () { renderPanel(e); }],
    ["Supprimer", "", function () {
      showConfirm("Supprimer " + e.titre + " ?", "Toutes les entrées de journal seront perdues.", function () {
        dbDelete(e.id).then(function () { toast("Supprimé"); closeModal(); refreshAll(); });
      });
    }]
  ]);
}
function openJournalForEntry(e) {
  var body = el("div");
  if (hasEp(e)) { var nb = nextEpButton(e); nb.style.marginBottom = "16px"; body.appendChild(nb); }
  var jl = e.journal || [];
  if (!jl.length) body.appendChild(emptyBox("book-open", "Aucune entrée."));
  else jl.forEach(function (x, i) {
    var row = el("div", "jrow");
    var txt = el("div", "jb"); txt.style.cursor = "pointer";
    txt.innerHTML = '<div class="jt">' + esc(entryTag(x)) + '</div><div class="jx">' + esc(x.text || "") + "</div>";
    txt.addEventListener("click", function () { closeModal(); openReaderForEntry(e, i); });
    var ed = el("button"); ed.setAttribute("aria-label", "Modifier");
    ed.innerHTML = '<span class="ic">' + ic("pen") + "</span>";
    ed.addEventListener("click", function () { closeModal(); quickNoteOpen(e, x.text, x.kind, i); });
    var dl = el("button"); dl.setAttribute("aria-label", "Supprimer");
    dl.innerHTML = '<span class="ic">' + ic("trash-2") + "</span>";
    dl.addEventListener("click", function () {
      showConfirm("Supprimer cette entrée ?", "", function () {
        e.journal.splice(i, 1);
        dbPut(e).then(function () { toast("Entrée supprimée"); closeModal(); refreshAll(); });
      });
    });
    row.appendChild(txt); row.appendChild(ed); row.appendChild(dl); body.appendChild(row);
  });
  var ab = btn("Ajouter une entrée", "plus", "wide", function () { closeModal(); quickNoteOpen(e); });
  ab.style.marginTop = "16px"; body.appendChild(ab);
  setModal("Journal : " + e.titre, body, [["Fermer", "", closeModal]]);
}
function openNoteEditor(e) {
  var body = el("div");
  body.appendChild(el("div", "", "Note actuelle : <b>" + (e.note != null ? e.note + "/10" : "aucune") + "</b>"));
  var ng = el("div", "note-grid");
  for (var n = 1; n <= 10; n++) {
    (function (n) {
      var b = el("button", "note-btn", String(n));
      if (e.note === n) { var c = noteColors(n); b.style.background = c[0]; b.style.color = c[1]; b.style.borderColor = "transparent"; }
      b.addEventListener("click", function () {
        e.note = n;
        dbPut(e).then(function () { toast("Note : " + n + "/10"); closeModal(); refreshAll(); });
      });
      ng.appendChild(b);
    })(n);
  }
  body.appendChild(ng);
  var cb = btn("Retirer la note", "x", "wide", function () {
    e.note = null;
    dbPut(e).then(function () { toast("Note retirée"); closeModal(); refreshAll(); });
  });
  cb.style.marginTop = "14px"; body.appendChild(cb);
  setModal("Note", body, [["Fermer", "", closeModal]]);
}


/* ───────── FORMULAIRE (Simple / Avancé) ───────── */
function capturePanel() {
  var t = $("p-title"); if (t) ST.draft.titre = t.value;
  var c = $("p-comment"); if (c) ST.draft.comment = c.value;
  var s = $("p-sub"); if (s) ST.draft.sub = s.value;
}
function rerenderPanel() {
  capturePanel();
  renderPanel(ST.editing, true);
}
function updateAdvBtn(key, val) {
  var b = document.querySelector('#m-body .adv-btn[data-k="' + key + '"]');
  if (!b) return;
  b.querySelector(".adv-val").textContent = val || "";
  b.classList.toggle("on", !!val);
}
function renderPanel(entry, keepDraft) {
  ST.editing = entry || null;
  if (!keepDraft) {
    if (entry) {
      ST.panelType = entry.type;
      ST.currentNote = entry.note != null ? entry.note : null;
      ST.isFav = !!entry.isFavorite; ST.isEnc = !!entry.enCours; ST.isVoir = !!entry.aVoir; ST.isInCollection = !!entry.inCollection;
      ST.panelPoster = entry.posterUrl || ""; ST.panelThumb = entry.posterThumb || "";
      ST.advFields = { plateforme: entry.plateforme || "", dateAchat: entry.dateAchat || "", edition: entry.edition || "", bonus: (entry.bonus || []).slice(), support: entry.support || "", packaging: entry.packaging || "", ean: entry.ean || "", url: entry.url || "" };
      ST.draft = { titre: entry.titre || "", date: toInputDate(entry.dateFin || ""), comment: entry.comment || "", sub: entry.sousTitre || "" };
      ST.draftJournal = JSON.parse(JSON.stringify(entry.journal || []));
    } else {
      ST.panelType = ST.currentType;
      ST.currentNote = null; ST.isFav = false; ST.isEnc = false; ST.isVoir = false; ST.isInCollection = false;
      ST.panelPoster = (ST.selectedItem && ST.selectedItem.poster) || ""; ST.panelThumb = "";
      ST.advFields = { plateforme: "", dateAchat: "", edition: "", bonus: [], support: "", packaging: "", ean: "", url: "" };
      ST.draft = { titre: (ST.selectedItem && ST.selectedItem.title) || "", date: todayFR(), comment: "", sub: "" };
      ST.draftJournal = [];
    }
  }
  var s = settingsLoad();
  var mode = s.panelMode || "simple";
  var body = el("div");

  var seg = el("div", "seg");
  ["simple", "avance"].forEach(function (m) {
    var b = el("button", mode === m ? "on" : "", m === "simple" ? "Simple" : "Avancé");
    b.addEventListener("click", function () { s.panelMode = m; settingsSave(s); rerenderPanel(); });
    seg.appendChild(b);
  });
  body.appendChild(seg);

  var tIn = el("input"); tIn.id = "p-title"; tIn.value = ST.draft.titre;
  body.appendChild(fieldBox("Titre", tIn));

  var ng = el("div", "note-grid");
  for (var n = 1; n <= 10; n++) {
    (function (n) {
      var c = el("button", "note-btn", String(n));
      if (ST.currentNote === n) { var cc = noteColors(n); c.style.background = cc[0]; c.style.color = cc[1]; c.style.borderColor = "transparent"; }
      c.addEventListener("click", function () {
        if (ST.currentNote === n) ST.currentNote = null; else ST.currentNote = n;
        ng.querySelectorAll(".note-btn").forEach(function (x) { x.style.background = ""; x.style.color = ""; x.style.borderColor = ""; });
        if (ST.currentNote === n) { var c2 = noteColors(n); c.style.background = c2[0]; c.style.color = c2[1]; c.style.borderColor = "transparent"; }
      });
      ng.appendChild(c);
    })(n);
  }
  body.appendChild(fieldBox("Notation /10", ng));

  var ar = el("div", "poster-row");
  var prev = el("img"); prev.id = "p-prev"; prev.src = ST.panelPoster || NO_POSTER;
  prev.addEventListener("click", function () { openPosterZoom(prev.src); });
  var pbtns = el("div", "poster-btns");
  var bU = el("button", "poster-btn"); bU.innerHTML = '<span class="ic">' + ic("link") + "</span>URL";
  bU.addEventListener("click", function () {
    var b2 = el("div"); var inp = el("input"); inp.placeholder = "https://…"; inp.value = ST.panelPoster || "";
    b2.appendChild(inp);
    setSheet("URL de l'affiche", b2, [
      ["Valider", "primary", function () {
        var v = inp.value.trim();
        if (v) { ST.panelPoster = v; prev.src = v; makeThumb(v).then(function (t) { ST.panelThumb = t; }); }
        closeMenu();
      }],
      ["Annuler", "", closeMenu]
    ]);
  });
  var bI = el("button", "poster-btn"); bI.innerHTML = '<span class="ic">' + ic("folder") + "</span>Importer";
  var fI = el("input"); fI.type = "file"; fI.accept = "image/*"; fI.hidden = true;
  bI.addEventListener("click", function () { fI.click(); });
  fI.addEventListener("change", function (ev) {
    var f = ev.target.files[0];
    if (f) fileToResized(f, 500).then(function (u) { ST.panelPoster = u; prev.src = u; makeThumb(u).then(function (t) { ST.panelThumb = t; }); });
  });
  pbtns.appendChild(bU); pbtns.appendChild(bI); pbtns.appendChild(fI);
  ar.appendChild(prev); ar.appendChild(pbtns);
  body.appendChild(fieldBox("Affiche", ar));

  var dateBtn = btn(ST.draft.date ? formatDate(ST.draft.date) : "Choisir une date", "calendar", "wide", function () {
    dateBtn.id = "p-datebtn";
    openDatePicker(ST.draft.date, function (iso) {
      ST.draft.date = iso || "";
      var lbl = dateBtn.querySelector("span:last-child");
      if (lbl) lbl.textContent = iso ? formatDate(iso) : "Choisir une date";
    });
  });
  dateBtn.id = "p-datebtn";
  body.appendChild(fieldBox("Date (fin / lecture / visionnage)", dateBtn));

  if (mode === "avance") {
    var sw = el("div", "chips");
    function sc(get, set, label, iconName) {
      var c = el("div", "chip" + (get() ? " on" : ""), '<span class="ic">' + ic(iconName) + "</span>" + label);
      c.addEventListener("click", function () { set(!get()); c.classList.toggle("on", get()); });
      sw.appendChild(c);
    }
    sc(function () { return ST.isInCollection; }, function (v) { ST.isInCollection = v; }, "Ajouter à ma bibliothèque", "box");
    sc(function () { return ST.isEnc; }, function (v) { ST.isEnc = v; }, "En cours", "hourglass");
    sc(function () { return ST.isVoir; }, function (v) { ST.isVoir = v; }, "À voir", "eye");
    body.appendChild(fieldBox("Statuts", sw));

    var cIn = el("textarea"); cIn.id = "p-comment"; cIn.value = ST.draft.comment;
    body.appendChild(fieldBox("Commentaire", cIn));
    var sIn = el("input"); sIn.id = "p-sub"; sIn.value = ST.draft.sub;
    body.appendChild(fieldBox("Détail / sous-titre", sIn));

    var jw = el("div"); var jb = el("div", "chips");
    KINDS.forEach(function (k) {
      var c = el("div", "chip", '<span class="ic">' + ic(k[2]) + "</span>" + k[1]);
      c.addEventListener("click", function () { openDraft(k[0], jw); });
      jb.appendChild(c);
    });
    jw.appendChild(jb);
    var jlist = el("div"); jlist.id = "p-jlist"; jw.appendChild(jlist);
    body.appendChild(fieldBox("Journal", jw));
    renderJList(jlist);

    function advBtn(iconName, label, key, getVal, fn) {
      var val = getVal();
      var b = el("button", "adv-btn" + (val ? " on" : ""));
      b.dataset.k = key;
      b.innerHTML = '<span class="ic">' + ic(iconName) + '</span><span>' + esc(label) + '</span><span class="adv-val">' + esc(val) + "</span>";
      b.addEventListener("click", fn);
      return b;
    }
    var cg = el("div", "adv-grid");
    cg.appendChild(advBtn("monitor", "Plateforme", "plateforme", function () { return ST.advFields.plateforme; }, openPlateformeModal));
    cg.appendChild(advBtn("calendar", "Date d'achat", "dateAchat", function () { return ST.advFields.dateAchat ? formatDate(ST.advFields.dateAchat) : ""; }, function () {
      openDatePicker(ST.advFields.dateAchat, function (iso) {
        ST.advFields.dateAchat = iso || ""; if (iso) markCollection();
        updateAdvBtn("dateAchat", iso ? formatDate(iso) : "");
      });
    }));
    cg.appendChild(advBtn("hash", "Édition", "edition", function () { return ST.advFields.edition; }, openEditionModal));
    cg.appendChild(advBtn("gift", "Bonus", "bonus", function () { return ST.advFields.bonus.join(", "); }, openBonusModal));
    cg.appendChild(advBtn("box", "Support", "support", function () { return ST.advFields.support; }, openSupportModal));
    cg.appendChild(advBtn("package-open", "Packaging", "packaging", function () { return ST.advFields.packaging; }, openPackagingModal));
    cg.appendChild(advBtn("barcode", "EAN", "ean", function () { return ST.advFields.ean; }, openEANModal));
    cg.appendChild(advBtn("link", "URL fiche", "url", function () { return ST.advFields.url; }, openURLModal));
    body.appendChild(fieldBox("Détails bibliothèque", cg));

    var sl = el("div", "search-links");
    sl.appendChild(el("span", "", "Chercher ailleurs :"));
    var q = encodeURIComponent(ST.draft.titre || "");
    [
      { name: "Google", icon: "search", url: "https://www.google.com/search?q=" + q },
      { name: "Steam", icon: "gamepad-2", url: "https://store.steampowered.com/search/?term=" + q },
      { name: "TMDB", icon: "film", url: "https://www.themoviedb.org/search?query=" + q },
      { name: "SensCritique", icon: "heart", url: "https://www.senscritique.com/recherche?query=" + q }
    ].forEach(function (l) {
      var a = el("a", "search-link"); a.href = l.url; a.target = "_blank";
      a.innerHTML = '<span class="ic">' + ic(l.icon) + "</span>" + l.name;
      sl.appendChild(a);
    });
    body.appendChild(fieldBox("Recherche externe", sl));
  } else {
    var cIn2 = el("textarea"); cIn2.id = "p-comment"; cIn2.value = ST.draft.comment;
    body.appendChild(fieldBox("Commentaire", cIn2));
  }

  setModal(entry ? "Modifier l'œuvre" : "Nouvelle œuvre", body, [
    ["Enregistrer", "primary", saveCurrentEntry],
    ["Annuler", "", closeModal]
  ]);
}
function markCollection() { ST.isInCollection = true; }

/* Sous-choix : liste + "…" libre + corbeille sur les perso. */
function choiceRow(label, iconName, selected, isCustom, onPick, onDelete) {
  var row = el("div", "radio-opt" + (selected ? " sel" : ""));
  row.innerHTML = '<span class="dot"></span>' + (iconName ? '<span class="ic">' + ic(iconName) + "</span>" : "") + '<span class="lbl">' + esc(label) + "</span>";
  row.querySelector(".lbl").style.flex = "1";
  row.addEventListener("click", onPick);
  if (isCustom && onDelete) {
    var del = el("button", "tdel"); del.style.marginLeft = "auto";
    del.setAttribute("aria-label", "Supprimer ce choix");
    del.innerHTML = '<span class="ic">' + ic("trash") + "</span>";
    del.addEventListener("click", function (ev) { ev.stopPropagation(); onDelete(); });
    row.appendChild(del);
  }
  return row;
}
function freeRow(onFree) {
  var b = el("button", "wide");
  b.style.cssText = "justify-content:flex-start;margin-top:10px;";
  b.innerHTML = '<span class="ic">' + ic("more-horizontal") + '</span><span style="font-style:italic;">Autre… (libre)</span>';
  b.addEventListener("click", onFree);
  return b;
}
function openPlateformeModal() {
  var wrap = el("div", "radio-list");
  PLATFORMS.forEach(function (p) {
    wrap.appendChild(choiceRow(p.name, p.icon, ST.advFields.plateforme === p.name, false, function () {
      ST.advFields.plateforme = p.name; markCollection(); updateAdvBtn("plateforme", p.name); closeMenu();
    }));
  });
  loadCustomList("plateformes").forEach(function (name) {
    wrap.appendChild(choiceRow(name, "tag", ST.advFields.plateforme === name, true, function () {
      ST.advFields.plateforme = name; markCollection(); updateAdvBtn("plateforme", name); closeMenu();
    }, function () { removeCustom("plateformes", name); openPlateformeModal(); }));
  });
  wrap.appendChild(freeRow(function () {
    var b2 = el("div"); var i = el("input"); i.placeholder = "Ta plateforme…"; b2.appendChild(i);
    setSheet("Plateforme libre", b2, [
      ["Valider", "primary", function () {
        var v = i.value.trim(); if (!v) return;
        addCustom("plateformes", v); ST.advFields.plateforme = v; markCollection();
        updateAdvBtn("plateforme", v); closeMenu();
      }],
      ["Annuler", "", function () { openPlateformeModal(); }]
    ]);
  }));
  setSheet("Plateforme", wrap, [["Annuler", "", closeMenu]]);
}
function openSupportModal() {
  var wrap = el("div", "radio-list");
  SUPPORT_CHOICES.forEach(function (s) {
    wrap.appendChild(choiceRow(s, "", ST.advFields.support === s, false, function () {
      ST.advFields.support = s; markCollection(); updateAdvBtn("support", s); closeMenu();
    }));
  });
  loadCustomList("supports").forEach(function (name) {
    wrap.appendChild(choiceRow(name, "", ST.advFields.support === name, true, function () {
      ST.advFields.support = name; markCollection(); updateAdvBtn("support", name); closeMenu();
    }, function () { removeCustom("supports", name); openSupportModal(); }));
  });
  wrap.appendChild(freeRow(function () {
    var b2 = el("div"); var i = el("input"); i.placeholder = "Ton support…"; b2.appendChild(i);
    setSheet("Support libre", b2, [
      ["Valider", "primary", function () {
        var v = i.value.trim(); if (!v) return;
        addCustom("supports", v); ST.advFields.support = v; markCollection();
        updateAdvBtn("support", v); closeMenu();
      }],
      ["Annuler", "", function () { openSupportModal(); }]
    ]);
  }));
  setSheet("Support", wrap, [["Annuler", "", closeMenu]]);
}
function openPackagingModal() {
  var wrap = el("div", "radio-list");
  PACKAGING_CHOICES.forEach(function (p) {
    wrap.appendChild(choiceRow(p, "", ST.advFields.packaging === p, false, function () {
      ST.advFields.packaging = p; markCollection(); updateAdvBtn("packaging", p); closeMenu();
    }));
  });
  loadCustomList("packagings").forEach(function (name) {
    wrap.appendChild(choiceRow(name, "", ST.advFields.packaging === name, true, function () {
      ST.advFields.packaging = name; markCollection(); updateAdvBtn("packaging", name); closeMenu();
    }, function () { removeCustom("packagings", name); openPackagingModal(); }));
  });
  wrap.appendChild(freeRow(function () {
    var b2 = el("div"); var i = el("input"); i.placeholder = "Ton packaging…"; b2.appendChild(i);
    setSheet("Packaging libre", b2, [
      ["Valider", "primary", function () {
        var v = i.value.trim(); if (!v) return;
        addCustom("packagings", v); ST.advFields.packaging = v; markCollection();
        updateAdvBtn("packaging", v); closeMenu();
      }],
      ["Annuler", "", function () { openPackagingModal(); }]
    ]);
  }));
  setSheet("Packaging", wrap, [["Annuler", "", closeMenu]]);
}
function openBonusModal() {
  var wrap = el("div", "radio-list");
  function refresh() {
    wrap.innerHTML = "";
    BONUSES.forEach(function (x) {
      wrap.appendChild(choiceRow(x.name, x.icon, ST.advFields.bonus.indexOf(x.name) >= 0, false, function () {
        var i = ST.advFields.bonus.indexOf(x.name);
        if (i >= 0) ST.advFields.bonus.splice(i, 1); else ST.advFields.bonus.push(x.name);
        refresh();
      }));
    });
    loadCustomList("bonus").forEach(function (name) {
      wrap.appendChild(choiceRow(name, "tag", ST.advFields.bonus.indexOf(name) >= 0, true, function () {
        var i = ST.advFields.bonus.indexOf(name);
        if (i >= 0) ST.advFields.bonus.splice(i, 1); else ST.advFields.bonus.push(name);
        refresh();
      }, function () { removeCustom("bonus", name); var ix = ST.advFields.bonus.indexOf(name); if (ix >= 0) ST.advFields.bonus.splice(ix, 1); refresh(); }));
    });
    wrap.appendChild(freeRow(function () {
      var b2 = el("div"); var i = el("input"); i.placeholder = "Ton bonus…"; b2.appendChild(i);
      setSheet("Bonus libre", b2, [
        ["Valider", "primary", function () {
          var v = i.value.trim(); if (!v) return;
          addCustom("bonus", v); if (ST.advFields.bonus.indexOf(v) < 0) ST.advFields.bonus.push(v);
          markCollection(); closeMenu(); openBonusModal();
        }],
        ["Annuler", "", function () { openBonusModal(); }]
      ]);
    }));
  }
  refresh();
  setSheet("Bonus", wrap, [
    ["Valider", "primary", function () { if (ST.advFields.bonus.length) markCollection(); updateAdvBtn("bonus", ST.advFields.bonus.join(", ")); closeMenu(); }],
    ["Annuler", "", closeMenu]
  ]);
}
function openEditionModal() {
  var b = el("div"); var i = el("input"); i.placeholder = "Édition limitée…"; i.value = ST.advFields.edition || "";
  b.appendChild(i);
  setSheet("Édition", b, [
    ["Valider", "primary", function () { ST.advFields.edition = i.value.trim(); if (ST.advFields.edition) markCollection(); updateAdvBtn("edition", ST.advFields.edition); closeMenu(); }],
    ["Annuler", "", closeMenu]
  ]);
}
function openEANModal() {
  var b = el("div"); var i = el("input"); i.placeholder = "Code EAN"; i.inputMode = "numeric"; i.value = ST.advFields.ean || "";
  b.appendChild(i);
  var sc = btn("Scanner le code-barres", "camera", "wide", function () {
    startEAN(function (code) { ST.advFields.ean = code; markCollection(); updateAdvBtn("ean", code); closeMenu(); });
  });
  sc.style.marginTop = "12px"; b.appendChild(sc);
  setSheet("EAN", b, [
    ["Valider", "primary", function () { ST.advFields.ean = i.value.trim(); if (ST.advFields.ean) markCollection(); updateAdvBtn("ean", ST.advFields.ean); closeMenu(); }],
    ["Annuler", "", closeMenu]
  ]);
}
function openURLModal() {
  var b = el("div"); var i = el("input"); i.placeholder = "URL de la fiche"; i.value = ST.advFields.url || "";
  b.appendChild(i);
  setSheet("URL", b, [
    ["Valider", "primary", function () { ST.advFields.url = i.value.trim(); if (ST.advFields.url) markCollection(); updateAdvBtn("url", ST.advFields.url); closeMenu(); }],
    ["Annuler", "", closeMenu]
  ]);
}

function saveCurrentEntry() {
  capturePanel();
  var title = ST.draft.titre.trim();
  if (!title) { toast("Titre obligatoire."); return; }
  if (ST.editing) { finishSave(ST.editing, ST.editing.id, ST.editing.dateAjout); return; }
  var type = ST.panelType, dup = null;
  for (var i = 0; i < ST.entries.length; i++) {
    if (ST.entries[i].type === type && norm(ST.entries[i].titre) === norm(title)) { dup = ST.entries[i]; break; }
  }
  if (dup) showConfirm("Doublon détecté", dup.titre + " existe déjà. Modifier l'existant ?", function () { finishSave(dup, dup.id, dup.dateAjout); }, "Modifier");
  else finishSave(null, null, null);
}
async function finishSave(base, entryId, dateAjout) {
  var type = ST.panelType; base = base || {};
  if (!entryId) {
    var sid = (ST.selectedItem && ST.selectedItem.id) || Date.now();
    entryId = type + "_" + sid;
    var exists = false;
    for (var k = 0; k < ST.entries.length; k++) { if (ST.entries[k].id === entryId) { exists = true; break; } }
    if (exists) entryId = entryId + "_" + Date.now();
    dateAjout = new Date().toISOString();
  }
  var e = Object.assign({}, base);
  e.id = entryId; e.type = type; e.titre = ST.draft.titre.trim(); e.sousTitre = (ST.draft.sub || "").trim();
  e.note = ST.currentNote; e.isFavorite = ST.isFav; e.enCours = ST.isEnc; e.aVoir = ST.isVoir; e.inCollection = ST.isInCollection;
  e.dateFin = ST.draft.date ? formatDate(ST.draft.date) : ""; e.comment = ST.draft.comment.trim(); e.journal = ST.draftJournal;
  e.posterUrl = ST.panelPoster; e.posterThumb = ST.panelThumb || (await makeThumb(ST.panelPoster));
  if (ST.selectedItem && ST.selectedItem.source === "tmdb" && ST.selectedItem.tmdbId) e.tmdb_id = ST.selectedItem.tmdbId;
  if (ST.isInCollection) {
    e.plateforme = ST.advFields.plateforme || null; e.dateAchat = ST.advFields.dateAchat || null;
    e.edition = ST.advFields.edition || null; e.bonus = ST.advFields.bonus.slice();
    e.support = ST.advFields.support || null; e.packaging = ST.advFields.packaging || null;
    e.ean = ST.advFields.ean || ""; e.url = ST.advFields.url || "";
  } else {
    e.plateforme = null; e.dateAchat = null; e.edition = null; e.bonus = []; e.support = null; e.packaging = null; e.ean = ""; e.url = "";
  }
  e.dateAjout = dateAjout;
  await dbPut(e);
  if (navigator.vibrate) navigator.vibrate(25);
  toast("Enregistré"); closeModal(); refreshAll();
}
function duplicateEntry(e) {
  ST.selectedItem = null; ST.editing = null; closeModal();
  setTimeout(function () { renderPanel(null); ST.draftJournal = []; ST.draft.titre = e.titre; ST.panelType = e.type; }, 60);
}
function openDraft(kind, parent) {
  var old = $("p-jdraft"); if (old) old.remove();
  var d = el("div", "box"); d.id = "p-jdraft";
  if (kind === "time") {
    var wb = btn("Choisir date et heure", "clock", "wide", function () {
      openDateTimePicker("", function (iso) {
        d.dataset.when = iso || "";
        wb.querySelector("span:last-child").textContent = iso ? fmtWhen(iso) : "Maintenant";
      });
    });
    d.appendChild(wb);
  }
  if (kind === "ep") { var r = el("div", "row2"); r.innerHTML = '<label>Saison<input type="number" id="jd-s" min="0"></label><label>Épisode<input type="number" id="jd-e" min="0"></label>'; d.appendChild(r); }
  if (kind === "pages") { var rp = el("div", "row2"); rp.innerHTML = '<label>Pages lues<input type="number" id="jd-read" min="0"></label><label>Total<input type="number" id="jd-total" min="0"></label>'; d.appendChild(rp); }
  if (kind === "session") { var rs = el("div", "row2"); rs.innerHTML = '<label>Durée<input type="text" id="jd-dur" placeholder="2h30…"></label>'; d.appendChild(rs); }
  var ta = el("textarea"); ta.placeholder = "Ton entrée…"; d.appendChild(ta);
  var act = el("div", "row2"); act.style.marginTop = "12px";
  var ok = btn("Ajouter", "plus", "primary"), no = btn("Annuler", "x");
  act.appendChild(ok); act.appendChild(no); d.appendChild(act); parent.appendChild(d);
  ok.addEventListener("click", function () {
    var text = ta.value.trim();
    if (!text && kind !== "ep" && kind !== "pages") { toast("Entre un texte."); return; }
    if (kind === "time") ST.draftJournal.push({ kind: "time", ts: fmtWhen(d.dataset.when || ""), text: text, at: d.dataset.when ? new Date(d.dataset.when).getTime() : Date.now() });
    else if (kind === "free") ST.draftJournal.push({ kind: "free", ts: nowStamp(), text: text, at: Date.now() });
    else if (kind === "session") { var dd = $("jd-dur"); ST.draftJournal.push({ kind: "session", dur: dd ? dd.value.trim() : "", text: text, at: Date.now() }); }
    else if (kind === "pages") { var rd = $("jd-read"), tt = $("jd-total"); ST.draftJournal.push({ kind: "pages", read: rd ? rd.value : "", total: tt ? tt.value : "", text: text, at: Date.now() }); }
    else { var ss = $("jd-s"), ee = $("jd-e"); ST.draftJournal.push({ kind: "ep", s: parseInt(ss ? ss.value || "0" : "0", 10), e: parseInt(ee ? ee.value || "0" : "0", 10), note: null, text: text, at: Date.now() }); }
    d.remove(); renderJList($("p-jlist"));
  });
  no.addEventListener("click", function () { d.remove(); });
}
function renderJList(c) {
  if (!c) return;
  c.innerHTML = "";
  ST.draftJournal.forEach(function (x, i) {
    var row = el("div", "jrow");
    var b = el("div", "jb");
    b.innerHTML = '<div class="jt">' + esc(entryTag(x)) + '</div><div class="jx">' + esc(x.text || "") + "</div>";
    var del = el("button"); del.setAttribute("aria-label", "Supprimer");
    del.innerHTML = '<span class="ic">' + ic("trash-2") + "</span>";
    del.addEventListener("click", function () { ST.draftJournal.splice(i, 1); renderJList(c); });
    row.appendChild(b); row.appendChild(del); c.appendChild(row);
  });
}


/* ───────── NOTE RAPIDE ───────── */
function quickNoteOpen(e, preText, kind, idx) {
  ST.qnEntry = e || null;
  ST.qnEditIdx = (idx != null ? idx : null);
  ST.qnKind = kind || "time";
  ST.pickerVal = null;
  var t = $("qn-title"); if (t) t.textContent = (ST.qnEditIdx != null ? "Modifier : " : "Noter : ") + (e ? e.titre : "note libre");
  var txt = $("qn-text"); if (txt) txt.value = preText || "";
  var lbl = $("qn-entry-label"); if (lbl) lbl.textContent = e ? e.titre : "Choisir une œuvre…";
  var erow = $("qn-entry-row"); if (erow) erow.classList.toggle("hidden", !!e);
  syncQnKind();
  var sb = $("qn-save");
  if (sb) sb.innerHTML = ST.qnEditIdx != null ? ('<span class="ic">' + ic("save") + "</span>Remplacer") : ('<span class="ic">' + ic("plus") + "</span>Ajouter");
  var k = $("qn-kind"); if (!k) return;
  k.innerHTML = "";
  KINDS.forEach(function (x) {
    var c = el("div", "chip" + (x[0] === ST.qnKind ? " on" : ""), '<span class="ic">' + ic(x[2]) + "</span>" + x[1]);
    c.addEventListener("click", function () { ST.qnKind = x[0]; k.querySelectorAll(".chip").forEach(function (y) { y.classList.remove("on"); }); c.classList.add("on"); syncQnKind(); });
    k.appendChild(c);
  });
  showOverlay("qn-overlay");
}
function syncQnKind() {
  var w = $("qn-when-row"); if (w) w.classList.toggle("hidden", ST.qnKind !== "time");
  var e = $("qn-ep-row"); if (e) e.classList.toggle("hidden", ST.qnKind !== "ep");
  var p = $("qn-pages-row"); if (p) p.classList.toggle("hidden", ST.qnKind !== "pages");
  var s = $("qn-session-row"); if (s) s.classList.toggle("hidden", ST.qnKind !== "session");
  if (ST.qnKind === "time") {
    var wl = $("qn-when-label");
    if (wl) wl.textContent = ST.pickerVal ? fmtWhen(ST.pickerVal) : fmtWhen(new Date().toISOString());
  }
}
function quickNoteClose() { hideOverlay("qn-overlay"); ST.qnEditIdx = null; }
async function quickNoteSave() {
  var e = ST.qnEntry;
  var txt = $("qn-text");
  var text = txt ? txt.value.trim() : "";
  if (!text && ST.qnKind !== "ep" && ST.qnKind !== "pages") { toast("Entre un texte."); return; }
  if (!e) {
    var fake = { id: "libre_" + Date.now(), titre: "Note libre", type: "Livre", journal: [], dateFin: todayFR(), dateAjout: new Date().toISOString(), inCollection: false };
    fake.journal.push(buildQnObj(text));
    await dbPut(fake); toast("Note libre ajoutée"); quickNoteClose(); refreshAll(); return;
  }
  if (!e.journal) e.journal = [];
  var obj = buildQnObj(text);
  if (ST.qnEditIdx != null && e.journal[ST.qnEditIdx]) { obj.at = e.journal[ST.qnEditIdx].at || obj.at; e.journal[ST.qnEditIdx] = obj; }
  else e.journal.push(obj);
  await dbPut(e);
  if (navigator.vibrate) navigator.vibrate(15);
  toast(ST.qnEditIdx != null ? "Entrée modifiée" : "Entrée ajoutée");
  quickNoteClose(); refreshAll();
}
function buildQnObj(text) {
  if (ST.qnKind === "time") return { kind: "time", ts: ST.pickerVal ? fmtWhen(ST.pickerVal) : nowStamp(), text: text, at: ST.pickerVal ? new Date(ST.pickerVal).getTime() : Date.now() };
  if (ST.qnKind === "free") return { kind: "free", ts: nowStamp(), text: text, at: Date.now() };
  if (ST.qnKind === "session") { var dd = $("qn-dur"); return { kind: "session", dur: dd ? dd.value.trim() : "", text: text, at: Date.now() }; }
  if (ST.qnKind === "pages") { var rd = $("qn-read"), tt = $("qn-total"); return { kind: "pages", read: rd ? rd.value : "", total: tt ? tt.value : "", text: text, at: Date.now() }; }
  var ss = $("qn-s"), ee = $("qn-e");
  return { kind: "ep", s: parseInt(ss ? ss.value || "0" : "0", 10), e: parseInt(ee ? ee.value || "0" : "0", 10), note: null, text: text, at: Date.now() };
}


/* ───────── PICKER DATE/HEURE (centré sur la valeur) ───────── */
function openDateTimePicker(initialIso, cb) {
  ST.pickerCb = cb;
  var d = initialIso ? new Date(initialIso) : new Date();
  var st = { y: d.getFullYear(), mo: d.getMonth(), da: d.getDate(), h: d.getHours(), mi: Math.round(d.getMinutes() / 5) * 5 % 60 };
  var yt = $("picker-title"); if (yt) yt.textContent = "Date et heure";
  var dc = $("picker-date"); dc.innerHTML = "";
  var hc = $("picker-hour"); hc.innerHTML = "";
  function col(title, items, key) {
    var c = el("div", "picker-col");
    c.appendChild(el("div", "ph", title));
    var sc = el("div", "picker-scroll");
    items.forEach(function (it) {
      var r = el("div", "pick-item" + (it.val === st[key] ? " on" : ""), it.lab);
      r.addEventListener("click", function () { st[key] = it.val; sc.querySelectorAll(".pick-item").forEach(function (x) { x.classList.remove("on"); }); r.classList.add("on"); });
      sc.appendChild(r);
    });
    c.appendChild(sc);
    setTimeout(function () {
      var on = sc.querySelector(".pick-item.on");
      if (on) sc.scrollTop = on.offsetTop - (sc.clientHeight / 2 - on.clientHeight / 2);
    }, 0);
    return c;
  }
  var days = [], months = [], years = [], hours = [], mins = [];
  for (var da = 1; da <= 31; da++) days.push({ val: da, lab: String(da) });
  MONTHS.forEach(function (m, i) { months.push({ val: i, lab: m }); });
  for (var y = 1900; y <= 2100; y++) years.push({ val: y, lab: String(y) });
  for (var h = 0; h < 24; h++) hours.push({ val: h, lab: pad2(h) });
  for (var mi = 0; mi < 60; mi += 5) mins.push({ val: mi, lab: pad2(mi) });
  dc.appendChild(col("Jour", days, "da"));
  dc.appendChild(col("Mois", months, "mo"));
  dc.appendChild(col("Année", years, "y"));
  hc.appendChild(col("Heure", hours, "h"));
  hc.appendChild(col("Min", mins, "mi"));
  var ok = $("picker-ok");
  if (ok) ok.onclick = function () { hideOverlay("picker-overlay"); if (ST.pickerCb) ST.pickerCb(st.y + "-" + pad2(st.mo + 1) + "-" + pad2(st.da) + "T" + pad2(st.h) + ":" + pad2(st.mi)); };
  var cl = $("picker-clear");
  if (cl) cl.onclick = function () { hideOverlay("picker-overlay"); if (ST.pickerCb) ST.pickerCb(null); };
  showOverlay("picker-overlay");
}


/* ───────── LISTE RADIO ŒUVRE ───────── */
function openEntryPicker(cb) {
  ST.entryPickCb = cb;
  var wrap = el("div", "radio-list");
  var chosen = null;
  var oFree = el("div", "radio-opt sel");
  oFree.innerHTML = '<span class="dot"></span><span class="lbl">Note libre (sans œuvre)</span>';
  oFree.addEventListener("click", function () { chosen = null; wrap.querySelectorAll(".radio-opt").forEach(function (x) { x.classList.remove("sel"); }); oFree.classList.add("sel"); });
  wrap.appendChild(oFree);
  ST.entries.forEach(function (en) {
    var o = el("div", "radio-opt");
    o.innerHTML = '<span class="dot"></span><span class="lbl">' + esc(en.titre) + "</span>";
    o.addEventListener("click", function () { chosen = en; wrap.querySelectorAll(".radio-opt").forEach(function (x) { x.classList.remove("sel"); }); o.classList.add("sel"); });
    wrap.appendChild(o);
  });
  setSheet("Choisir une œuvre", wrap, [
    ["Valider", "primary", function () { closeMenu(); if (ST.entryPickCb) ST.entryPickCb(chosen); }],
    ["Annuler", "", function () { closeMenu(); if (ST.entryPickCb) ST.entryPickCb(undefined); }]
  ]);
}


/* ───────── CALENDRIER ───────── */
function openDatePicker(initialIso, cb) {
  ST.calMode = "pick"; ST.calPickCb = cb;
  var d = initialIso ? parseDateFR(initialIso) : null;
  ST.calDate = d ? new Date(d.y, d.mo - 1, d.d) : new Date();
  showOverlay("calendar-overlay");
  renderCalendar();
}
function entriesByDay() {
  var set = {};
  ST.entries.forEach(function (en) {
    (en.journal || []).forEach(function (x) {
      if (!x.at) return;
      var t = new Date(x.at);
      set[t.getFullYear() + "-" + pad2(t.getMonth() + 1) + "-" + pad2(t.getDate())] = 1;
    });
  });
  return set;
}
function renderCalendar() {
  var cal = $("cal-grid"); if (!cal) return;
  cal.innerHTML = "";
  var dow = $("cal-dow");
  if (dow) { dow.innerHTML = ""; ["L", "M", "M", "J", "V", "S", "D"].forEach(function (d) { dow.appendChild(el("span", "", d)); }); }
  var y = ST.calDate.getFullYear(), mo = ST.calDate.getMonth();
  var mt = $("cal-month-title"); if (mt) mt.textContent = MONTHS[mo] + " " + y;
  var first = (new Date(y, mo, 1).getDay() + 6) % 7;
  var days = new Date(y, mo + 1, 0).getDate();
  var today = new Date();
  var has = ST.calMode === "journal" ? entriesByDay() : {};
  for (var i = 0; i < first; i++) cal.appendChild(el("div", "cal-day empty"));
  for (var d = 1; d <= days; d++) {
    (function (d) {
      var c = el("div", "cal-day", String(d));
      var key = y + "-" + pad2(mo + 1) + "-" + pad2(d);
      if (ST.calMode === "journal" && has[key]) c.classList.add("has-entry");
      if (d === today.getDate() && mo === today.getMonth() && y === today.getFullYear()) c.classList.add("today");
      if (ST.calMode === "journal" && d === ST.calSelectedDay && mo === ST.calDate.getMonth() && y === ST.calDate.getFullYear()) c.classList.add("sel");
      c.addEventListener("click", function () {
        if (ST.calMode === "pick") { hideOverlay("calendar-overlay"); if (ST.calPickCb) ST.calPickCb(y + "-" + pad2(mo + 1) + "-" + pad2(d)); ST.calPickCb = null; }
        else { ST.calSelectedDay = d; ST.calDate = new Date(y, mo, d); hideOverlay("calendar-overlay"); renderJournal(); }
      });
      cal.appendChild(c);
    })(d);
  }
  var totalCells = first + days;
  var trail = (7 - (totalCells % 7)) % 7;
  for (var t = 0; t < trail; t++) cal.appendChild(el("div", "cal-day empty"));
}


/* ───────── JOURNAL ───────── */
function renderEncours() {
  var row = $("j-encours"); if (!row) return;
  row.innerHTML = "";
  var enc = ST.entries.filter(function (e) { return e.enCours; });
  if (!enc.length) { row.style.display = "none"; return; }
  row.style.display = "";
  enc.forEach(function (e) {
    var m = el("div", "mini");
    m.appendChild(renderPoster(e, false));
    m.appendChild(el("div", "t", esc(e.titre)));
    var l = journalLines(e);
    m.appendChild(el("div", "s", esc(truncate(l.length ? l[l.length - 1] : "En cours…", 30))));
    m.addEventListener("click", function () { showCollectionDetail(e); });
    row.appendChild(m);
  });
}
function renderJournal() {
  var y = ST.calDate.getFullYear(), mo = ST.calDate.getMonth();
  var bt = $("bilan-title");
  if (bt) {
    var now = new Date();
    var isCur = (y === now.getFullYear() && mo === now.getMonth());
    if (ST.calSelectedDay != null && (isCur || ST.calDate.getDate() === ST.calSelectedDay)) bt.textContent = ST.calSelectedDay + " " + MONTHS_MIN[mo] + " " + y;
    else bt.textContent = MONTHS_MIN[mo] + " " + y;
  }
  renderEncours();
  var feed = [];
  ST.entries.forEach(function (en) {
    (en.journal || []).forEach(function (x, idx) {
      var t = x.at ? new Date(x.at) : null;
      if (t && t.getFullYear() === y && t.getMonth() === mo) feed.push({ e: en, x: x, idx: idx, at: x.at || 0 });
    });
  });
  feed.sort(function (a, b) { return b.at - a.at; });
  var f = $("j-feed"); if (!f) return;
  f.innerHTML = "";
  if (!feed.length) f.appendChild(emptyBox("book-open", "Aucune entrée ce mois-ci."));
  feed.slice(0, 80).forEach(function (it) {
    var item = el("div", "jentry");
    var pd = el("div", "poster");
    var pi = el("img"); pi.src = it.e.posterThumb || it.e.posterUrl || NO_POSTER;
    pd.appendChild(pi);
    pd.addEventListener("click", function (ev) { ev.stopPropagation(); showCollectionDetail(it.e); });
    item.appendChild(pd);
    var b = el("div", "content");
    b.appendChild(el("div", "time", esc(entryTag(it.x))));
    var tx = el("div", "text", esc(truncate(it.x.text || "", 90)));
    tx.addEventListener("click", function (ev) { ev.stopPropagation(); openReaderForEntry(it.e, it.idx); });
    b.appendChild(tx);
    b.appendChild(el("div", "title", esc(it.e.titre)));
    item.appendChild(b);
    var acts = el("div", "acts");
    var ed = el("button"); ed.setAttribute("aria-label", "Modifier");
    ed.innerHTML = '<span class="ic">' + ic("pen") + "</span>";
    ed.addEventListener("click", function (ev) { ev.stopPropagation(); quickNoteOpen(it.e, it.x.text, it.x.kind, it.idx); });
    var dl = el("button", "del"); dl.setAttribute("aria-label", "Supprimer");
    dl.innerHTML = '<span class="ic">' + ic("trash-2") + "</span>";
    dl.addEventListener("click", function (ev) {
      ev.stopPropagation();
      showConfirm("Supprimer cette entrée ?", "", function () {
        it.e.journal.splice(it.idx, 1);
        dbPut(it.e).then(function () { toast("Entrée supprimée"); refreshAll(); });
      });
    });
    acts.appendChild(ed); acts.appendChild(dl); item.appendChild(acts);
    item.addEventListener("click", function () { openReaderForEntry(it.e, it.idx); });
    f.appendChild(item);
  });
}


/* ───────── BANDEAU RAPPEL SAUVEGARDE ───────── */
function injectBackupBanner() {
  var s = settingsLoad();
  var days = s.alertBackupDays || 14;
  var last = parseInt(localStorage.getItem("last_gh_backup") || localStorage.getItem("last_backup") || "0", 10);
  var main = document.querySelector("main");
  if (!main) return;
  var old = $("backup-banner"); if (old) old.remove();
  if (sessionStorage.getItem("bb_dismissed") === "1") return;
  var age = last ? (Date.now() - last) / 86400000 : 9999;
  if (age < days) return;
  var b = el("div", "backup-banner"); b.id = "backup-banner";
  b.innerHTML = '<span class="ic">' + ic("alert") + "</span><span>Ça fait " + (last ? Math.floor(age) + " jour(s)" : "toujours") + " sans sauvegarde. Pense à exporter.</span>";
  var go = el("button", "", "Sauvegarder");
  go.addEventListener("click", function () { openOptSave(); });
  var cl = el("button", "bb-close"); cl.setAttribute("aria-label", "Ignorer");
  cl.innerHTML = '<span class="ic">' + ic("x") + "</span>";
  cl.addEventListener("click", function () { sessionStorage.setItem("bb_dismissed", "1"); b.remove(); });
  b.appendChild(go); b.appendChild(cl);
  main.insertBefore(b, main.firstChild);
}


/* ───────── OPTIONS ───────── */
function renderOptions() {
  var grid = $("opt-grid"); if (!grid) return;
  grid.innerHTML = "";
  [
    { icon: "save", label: "Sauvegarde", fn: openOptSave },
    { icon: "palette", label: "Apparence", fn: openOptAppearance },
    { icon: "bar-chart-3", label: "Stats", fn: openOptStats },
    { icon: "search", label: "Recherche", fn: openOptSearch },
    { icon: "smartphone", label: "Application", fn: openOptApp },
    { icon: "info", label: "À propos", fn: openOptAbout },
    { icon: "alert", label: "Danger", fn: openOptDanger }
  ].forEach(function (cat) {
    var b = el("button", "opt-btn");
    b.innerHTML = '<span class="ic">' + ic(cat.icon) + "</span><span>" + esc(cat.label) + "</span>";
    b.addEventListener("click", cat.fn);
    grid.appendChild(b);
  });
}
function openOptSave() {
  var b = el("div");
  b.appendChild(el("div", "sec-title", "Sauvegarde locale"));
  b.appendChild(btn("Exporter en JSON", "download", "wide", function () { exportJSON(); }));
  b.appendChild(btn("Importer (fusion)", "upload", "wide", function () { importJSON(); }));
  b.appendChild(btn("Copier tout (TSV)", "clipboard-copy", "wide", function () { copyTSV(); }));
  b.appendChild(el("div", "sec-title", "Backup GitHub (repo privé)"));
  var go = el("input"); go.placeholder = "Owner (ex : BoraGooum)"; go.value = localStorage.getItem("gh_owner") || ""; go.style.marginBottom = "10px"; b.appendChild(go);
  var gr = el("input"); gr.placeholder = "Repo (ex : collection-backup)"; gr.value = localStorage.getItem("gh_repo") || ""; gr.style.marginBottom = "10px"; b.appendChild(gr);
  var gt = el("input"); gt.placeholder = "Token (github_pat_…)"; gt.type = "password"; gt.value = localStorage.getItem("gh_token") || ""; gt.style.marginBottom = "14px"; b.appendChild(gt);
  b.appendChild(btn("Sauver la config", "save", "primary wide", function () {
    localStorage.setItem("gh_owner", go.value.trim()); localStorage.setItem("gh_repo", gr.value.trim()); localStorage.setItem("gh_token", gt.value.trim());
    toast("Config GitHub sauvée");
  }));
  b.appendChild(btn("Tester la connexion", "link", "wide", function () { ghTest(); }));
  b.appendChild(btn("Sauvegarder maintenant", "upload", "wide", function () { ghBackupNow(true); }));
  b.appendChild(btn("Restaurer depuis GitHub", "download", "wide", function () { showConfirm("Restaurer ?", "Les œuvres manquantes seront ajoutées.", function () { ghRestore(); }, "Restaurer"); }));
  var lb = localStorage.getItem("last_gh_backup");
  b.appendChild(el("div", "", "Dernier backup GitHub : <b>" + (lb ? new Date(parseInt(lb, 10)).toLocaleString("fr-FR") : "jamais") + "</b>"));
  setModal("Sauvegarde", b, [["Fermer", "", closeModal]]);
}
function openOptAppearance() {
  var s = settingsLoad();
  var b = el("div");
  b.appendChild(el("span", "flabel", "Densité"));
  var dp = el("div", "pill-sel");
  [["comfort", "Confort"], ["compact", "Compact"]].forEach(function (o) {
    var x = el("button", o[0] === s.density ? "on" : "", o[1]);
    x.addEventListener("click", function () { s.density = o[0]; settingsSave(s); applySettings(); closeModal(); openOptAppearance(); });
    dp.appendChild(x);
  });
  b.appendChild(dp);
  b.appendChild(el("span", "flabel", "Taille du texte"));
  var fp = el("div", "pill-sel");
  [["s", "Petit"], ["m", "Normal"], ["l", "Grand"]].forEach(function (o) {
    var x = el("button", o[0] === s.fontSize ? "on" : "", o[1]);
    x.addEventListener("click", function () { s.fontSize = o[0]; settingsSave(s); applySettings(); closeModal(); openOptAppearance(); });
    fp.appendChild(x);
  });
  b.appendChild(fp);
  b.appendChild(el("span", "flabel", "Couleur du thème"));
  var swr = el("div", "swatch-row");
  THEME_PRESETS.forEach(function (t) {
    var sw = el("div", "swatch" + (t.id === s.theme ? " on" : ""));
    sw.style.background = "linear-gradient(135deg," + t.acc + "," + t.acc2 + ")";
    sw.title = t.name;
    sw.innerHTML = '<span class="ck"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></span>';
    sw.addEventListener("click", function () { s.theme = t.id; settingsSave(s); applyTheme(t.id); closeModal(); openOptAppearance(); });
    swr.appendChild(sw);
  });
  b.appendChild(swr);
  b.appendChild(el("span", "flabel", "Police d'écriture"));
  FONT_PRESETS.forEach(function (f) { ensureFontLoaded(f.id); });
  var fl = el("div", "radio-list");
  FONT_PRESETS.forEach(function (f) {
    var o = el("div", "radio-opt" + (f.id === s.font ? " sel" : ""));
    o.innerHTML = '<span class="dot"></span><span class="lbl" style="font-family:' + f.stack + ';font-size:17px;">' + esc(f.name) + "</span>";
    o.addEventListener("click", function () { s.font = f.id; s.fontTitle = f.id; settingsSave(s); applyFont(f.id); applyTitleFont(f.id); closeModal(); openOptAppearance(); });
    fl.appendChild(o);
  });
  b.appendChild(fl);
  setModal("Apparence", b, [["Fermer", "", closeModal]]);
}
function openOptStats() {
  var b = el("div");
  var entries = ST.entries, total = entries.length, byType = {}, sum = 0, cnt = 0;
  entries.forEach(function (e) { byType[e.type] = (byType[e.type] || 0) + 1; if (e.note != null) { sum = sum + e.note; cnt = cnt + 1; } });
  var sec = el("div", "box"); sec.appendChild(el("div", "sec-title", "Par type"));
  Object.keys(byType).forEach(function (t) { var r = el("div", "sline"); r.innerHTML = "<span>" + esc(t) + "</span><b>" + byType[t] + "</b>"; sec.appendChild(r); });
  b.appendChild(sec);
  var sec2 = el("div", "box"); sec2.appendChild(el("div", "sec-title", "Notes"));
  var r2 = el("div", "sline"); r2.innerHTML = "<span>Moyenne</span><b>" + (cnt ? (sum / cnt).toFixed(1) : "—") + "/10</b>"; sec2.appendChild(r2);
  var r3 = el("div", "sline"); r3.innerHTML = "<span>Total œuvres</span><b>" + total + "</b>"; sec2.appendChild(r3);
  b.appendChild(sec2);
  setModal("Statistiques", b, [["Fermer", "", closeModal]]);
}
function openOptSearch() {
  var s = settingsLoad();
  var b = el("div");
  b.appendChild(el("span", "flabel", "Type par défaut"));
  var tp = el("div", "pill-sel");
  allTypes().forEach(function (t) {
    var x = el("button", t === s.defaultType ? "on" : "", t);
    x.addEventListener("click", function () { s.defaultType = t; settingsSave(s); ST.currentType = t; closeModal(); openOptSearch(); buildTypeDropdown(); });
    tp.appendChild(x);
  });
  b.appendChild(tp);
  setModal("Recherche", b, [["Fermer", "", closeModal]]);
}
function openOptApp() {
  var b = el("div");
  b.appendChild(btn("Installer l'application", "download", "wide", function () { triggerInstall(); }));
  b.appendChild(btn("Vider le cache hors-ligne", "trash", "wide", function () {
    if ("caches" in window) caches.keys().then(function (k) { k.forEach(function (x) { caches.delete(x); }); });
    toast("Cache vidé");
  }));
  b.appendChild(el("div", "", "Réseau : <b>" + (navigator.onLine ? "connecté" : "hors-ligne") + "</b>"));
  setModal("Application", b, [["Fermer", "", closeModal]]);
}
function openOptAbout() {
  var b = el("div");
  b.appendChild(el("div", "", "Version : <b>V0.9.1</b>"));
  b.appendChild(el("div", "", "Build : <b>" + new Date(BUILD).toLocaleString("fr-FR", { timeZone: "Europe/Paris" }) + "</b>"));
  var c = el("a", "", "Créé par Gooumbora");
  c.href = "https://www.senscritique.com/Gooumbora"; c.target = "_blank"; c.style.color = "var(--acc)";
  b.appendChild(c);
  setModal("À propos", b, [["Fermer", "", closeModal]]);
}
function openOptDanger() {
  var b = el("div");
  b.appendChild(btn("Effacer toutes mes œuvres", "trash", "wide", function () {
    showConfirm("Effacer TOUTES tes œuvres ?", "Cette action est irréversible.", function () {
      (async function () { for (var i = 0; i < ST.entries.length; i++) await dbDelete(ST.entries[i].id); refreshAll(); toast("Vidé"); })();
    }, "Effacer");
  }));
  b.appendChild(btn("Réinitialiser les réglages", "rotate-ccw", "wide", function () {
    showConfirm("Remettre les réglages par défaut ?", "", function () {
      localStorage.removeItem("settings"); settingsSave(Object.assign({}, SETTINGS_DEFAULTS)); applySettings(); toast("Réglages réinitialisés");
    }, "Réinitialiser");
  }));
  setModal("Danger", b, [["Fermer", "", closeModal]]);
}


/* ───────── BACKUP GITHUB ───────── */
function ghConfig() {
  return { owner: (localStorage.getItem("gh_owner") || "").trim(), repo: (localStorage.getItem("gh_repo") || "").trim(), token: (localStorage.getItem("gh_token") || "").trim() };
}
function ghB64encode(s) { return btoa(unescape(encodeURIComponent(s))); }
function ghB64decode(s) { return decodeURIComponent(escape(atob(s))); }
async function ghGetFile(c, path) {
  var r = await fetch("https://api.github.com/repos/" + c.owner + "/" + c.repo + "/contents/" + path, { headers: { Authorization: "Bearer " + c.token, Accept: "application/vnd.github+json" } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error("GET " + r.status);
  return await r.json();
}
async function ghPutFile(c, path, content) {
  var cur = await ghGetFile(c, path);
  var body = { message: "Backup auto " + new Date().toISOString(), content: ghB64encode(content) };
  if (cur && cur.sha) body.sha = cur.sha;
  var r = await fetch("https://api.github.com/repos/" + c.owner + "/" + c.repo + "/contents/" + path, { method: "PUT", headers: { Authorization: "Bearer " + c.token, Accept: "application/vnd.github+json", "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error("PUT " + r.status);
  return await r.json();
}
var ghTimer = null;
function scheduleGitHubBackup() {
  var c = ghConfig();
  if (!c.owner || !c.repo || !c.token) return;
  if (ghTimer) clearTimeout(ghTimer);
  ghTimer = setTimeout(function () { ghBackupNow(false); }, 5000);
}
async function ghBackupNow(manual) {
  var c = ghConfig();
  if (!c.owner || !c.repo || !c.token) { if (manual) toast("Configure GitHub dans Options."); return; }
  var data = { version: "V0.9.1", exportDate: new Date().toISOString(), settings: settingsLoad(), customTypes: loadCustomTypes(), customLists: { plateformes: loadCustomList("plateformes"), supports: loadCustomList("supports"), packagings: loadCustomList("packagings"), bonus: loadCustomList("bonus") }, entries: ST.entries };
  try { await ghPutFile(c, "sauvegarde.json", JSON.stringify(data)); localStorage.setItem("last_gh_backup", String(Date.now())); if (manual) toast("Sauvegarde GitHub OK"); }
  catch (e) { if (manual) toast("Erreur GitHub : " + e.message, 3000); }
}
async function ghTest() {
  var c = ghConfig();
  if (!c.owner || !c.repo || !c.token) { toast("Remplis owner, repo et token."); return; }
  try {
    var r = await fetch("https://api.github.com/repos/" + c.owner + "/" + c.repo, { headers: { Authorization: "Bearer " + c.token, Accept: "application/vnd.github+json" } });
    if (r.ok) { var d = await r.json(); toast("Connexion OK : " + d.full_name + (d.private ? " (privé)" : " (PUBLIC !)")); }
    else toast("Erreur " + r.status, 3000);
  } catch (e) { toast("Réseau impossible", 3000); }
}
async function ghRestore() {
  var c = ghConfig();
  if (!c.owner || !c.repo || !c.token) { toast("Configure GitHub dans Options."); return; }
  try {
    var f = await ghGetFile(c, "sauvegarde.json");
    if (!f) { toast("Aucune sauvegarde trouvée.", 3000); return; }
    var data = JSON.parse(ghB64decode(f.content));
    var list = data.entries || [], ids = {};
    ST.entries.forEach(function (x) { ids[x.id] = 1; });
    var added = 0;
    for (var i = 0; i < list.length; i++) {
      var en = list[i];
      if (en && en.id && !ids[en.id]) { if (!en.titre) en.titre = "Sans titre"; if (!en.dateAjout) en.dateAjout = new Date().toISOString(); await dbPut(en); added = added + 1; }
    }
    if (data.settings) settingsSave(Object.assign({}, SETTINGS_DEFAULTS, data.settings));
    if (data.customTypes) saveCustomTypes(data.customTypes);
    if (data.customLists) {
      if (data.customLists.plateformes) saveCustomList("plateformes", data.customLists.plateformes);
      if (data.customLists.supports) saveCustomList("supports", data.customLists.supports);
      if (data.customLists.packagings) saveCustomList("packagings", data.customLists.packagings);
      if (data.customLists.bonus) saveCustomList("bonus", data.customLists.bonus);
    }
    applySettings(); buildTypeDropdown(); refreshAll();
    toast("Restauré : " + added + " œuvre(s) ajoutée(s)");
  } catch (e) { toast("Restauration impossible : " + e.message, 3000); }
}