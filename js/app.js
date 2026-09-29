/* ════════════════════════════════════════════════════════════════
   FICHIER : js/app.js   —   VERSION : V0.9.1
   RÔLE    : contrôleur. Navigation, recherche, historique,
             filtres/tri, export/import, scan EAN, PWA, initialisation.
   ════════════════════════════════════════════════════════════════ */


/* ───────── COMPLÉMENTS TEMPORAIRES (rapatriement prévu en V0.9.2) ───────── */
if (!I["clipboard-copy"]) {
  I["clipboard-copy"] = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>';
}

/* Bouton avec libellé isolé : permet de mettre à jour le texte sans casser l'icône. */
function btn(label, icon, cls, fn) {
  var b = el("button", cls || "");
  var head = icon ? ('<span class="ic">' + ic(icon) + "</span>") : "";
  b.innerHTML = head + "<span>" + esc(label) + "</span>";
  if (fn) b.addEventListener("click", fn);
  return b;
}

/* Ligne de choix avec corbeille compacte sur les valeurs personnelles. */
function choiceRow(label, iconName, selected, isCustom, onPick, onDelete) {
  var row = el("div", "radio-opt" + (selected ? " sel" : ""));
  row.innerHTML =
    '<span class="dot"></span>' +
    (iconName ? '<span class="ic">' + ic(iconName) + "</span>" : "") +
    '<span class="lbl">' + esc(label) + "</span>";

  var lbl = row.querySelector(".lbl");
  if (lbl) {
    lbl.style.flex = "1";
    lbl.style.minWidth = "0";
    lbl.style.overflow = "hidden";
    lbl.style.textOverflow = "ellipsis";
    lbl.style.whiteSpace = "nowrap";
  }

  row.addEventListener("click", onPick);

  if (isCustom && onDelete) {
    var del = el("button", "sq-btn");
    del.style.width = "40px";
    del.style.minWidth = "40px";
    del.style.height = "40px";
    del.style.borderRadius = "10px";
    del.style.padding = "0";
    del.setAttribute("aria-label", "Supprimer ce choix");
    del.innerHTML = '<span class="ic">' + ic("trash") + "</span>";
    del.addEventListener("click", function (ev) {
      ev.stopPropagation();
      onDelete();
    });
    row.appendChild(del);
  }

  return row;
}


/* ───────── NAVIGATION ───────── */
function updateStickyVars() {
  var h = document.querySelector("header");
  if (h) document.documentElement.style.setProperty("--head-h", h.offsetHeight + "px");

  var jh = document.querySelector(".jhead");
  if (jh && jh.offsetParent !== null) {
    document.documentElement.style.setProperty("--jhead-h", jh.offsetHeight + "px");
  }
}

function switchView(v) {
  try { sessionStorage.setItem("lastView", v); } catch (e) {}
  ST.view = v;

  document.querySelectorAll("nav.tabbar button").forEach(function (b) {
    b.classList.toggle("active", b.dataset.view === v);
  });
  document.querySelectorAll(".view").forEach(function (x) {
    x.classList.remove("active");
  });

  var view = document.getElementById("view-" + v);
  if (view) view.classList.add("active");

  if (v === "collection") renderCollection();

  if (v === "journal") {
    if (ST.journalInitialized === undefined || ST.journalInitialized === false) {
      ST.calDate = new Date();
      ST.calSelectedDay = new Date().getDate();
      ST.journalInitialized = true;
    }
    ST.calMode = "journal";
    renderJournal();
    updateJournalBadge();
  }

  if (v === "options") renderOptions();

  window.scrollTo(0, 0);
  updateStickyVars();
}


/* ───────── SÉLECTEUR DE TYPE ───────── */
function promptCustomType() {
  var body = el("div");
  var input = el("input");
  input.placeholder = "Nom du nouveau type…";
  body.appendChild(input);

  setModal("Nouveau type", body, [
    ["Valider", "primary", function () {
      var v = input.value.trim();
      if (!v) return;
      if (allTypes().indexOf(v) >= 0) { toast("Existe déjà."); return; }
      var ct = loadCustomTypes();
      ct.push({ name: v });
      saveCustomTypes(ct);
      closeModal();
      buildTypeDropdown();
      toast("Type ajouté");
    }],
    ["Annuler", "", closeModal]
  ]);
}

function buildTypeDropdown() {
  var list = $("type-list");
  if (!list) return;
  list.innerHTML = "";

  var coreNames = CORE_TYPES.map(function (t) { return t.name; });

  allTypesWithIcons().forEach(function (t) {
    var isCore = coreNames.indexOf(t.name) >= 0;
    var item = el("div", "type-dropdown-item" + (t.name === ST.currentType ? " active" : ""));
    item.dataset.type = t.name;
    item.innerHTML =
      '<span class="ic">' + ic(t.icon || "tag") + "</span>" +
      '<span class="tname">' + esc(t.name) + "</span>";

    if (!isCore) {
      var used = ST.entries.some(function (e) { return e.type === t.name; });
      if (!used) {
        var del = el("button", "tdel");
        del.setAttribute("aria-label", "Supprimer ce type");
        del.innerHTML = '<span class="ic">' + ic("trash-2") + "</span>";
        del.addEventListener("click", function (ev) {
          ev.stopPropagation();
          var ct = loadCustomTypes().filter(function (x) { return x.name !== t.name; });
          saveCustomTypes(ct);
          if (ST.currentType === t.name) ST.currentType = "Film";
          buildTypeDropdown();
          toast("Type supprimé");
        });
        item.appendChild(del);
      }
    }

    item.addEventListener("click", function () {
      ST.currentType = t.name;
      list.classList.remove("open");
      var tb = $("type-btn");
      if (tb) tb.classList.remove("open");
      buildTypeDropdown();
      clearResults();
      var si = $("search-input");
      if (si && si.value.trim()) runSearch();
    });

    list.appendChild(item);
  });

  list.appendChild(el("div", "type-sep"));

  var addRow = el("div", "type-dropdown-item");
  addRow.innerHTML =
    '<span class="ic">' + ic("plus") + "</span>" +
    '<span class="tname" style="font-style:italic;">Autre type…</span>';
  addRow.addEventListener("click", function () {
    list.classList.remove("open");
    var tb = $("type-btn");
    if (tb) tb.classList.remove("open");
    promptCustomType();
  });
  list.appendChild(addRow);

  var lbl = $("type-label");
  if (lbl) lbl.textContent = ST.currentType;

  var cur = allTypesWithIcons().filter(function (t) { return t.name === ST.currentType; })[0];
  var ico = $("type-btn-ic");
  if (ico && cur) {
    ico.setAttribute("data-ic", cur.icon || "tag");
    ico.innerHTML = ic(cur.icon || "tag");
  }
}


/* ───────── RECHERCHE ───────── */
function clearResults() {
  var r = $("results");
  if (r) r.innerHTML = "";
  var s = $("search-status");
  if (s) s.textContent = "";
}

function newEntryCard(query, type) {
  var c = el("div", "new-entry");
  var sub = query
    ? "Créer « " + esc(truncate(query, 28)) + " » en " + esc(type)
    : "Créer une œuvre en " + esc(type);

  c.innerHTML =
    '<div class="ne-art"><span class="ic">' + ic("pen") + "</span></div>" +
    '<div class="ne-ri"><div class="ne-label">Nouvelle entrée</div><div class="ne-sub">' + sub + "</div></div>";

  c.addEventListener("click", function () {
    ST.selectedItem = { title: query || "", source: "manual", id: null, poster: "" };
    ST.currentType = type;
    buildTypeDropdown();
    renderPanel(null);
  });

  return c;
}

function renderResults(list, type, query) {
  var c = $("results");
  if (!c) return;
  c.innerHTML = "";

  if (query) c.appendChild(newEntryCard(query, type));

  list.forEach(function (item) {
    var card = el("div", "rcard");

    var img = el("img", "rp");
    img.src = item.poster || NO_POSTER;
    img.loading = "lazy";

    var info = el("div", "ri");
    info.appendChild(el("div", "rt", esc(item.title || "")));

    var parts = [];
    if (item.year) parts.push(item.year);
    if (item.author) parts.push(item.author);
    if (item.extra) parts.push(item.extra);
    info.appendChild(el("div", "rm", esc(parts.join(" · "))));

    card.appendChild(img);
    card.appendChild(info);

    card.addEventListener("click", function () {
      ST.selectedItem = item;
      ST.currentType = type;
      buildTypeDropdown();
      renderPanel(null);
    });

    c.appendChild(card);

    if (item.source === "rawg") {
      fetchSteamGrid(item.title).then(function (cv) {
        if (cv) {
          item.poster = cv;
          img.src = cv;
        }
      });
    }
  });
}

function showFallback(type) {
  var c = $("results");
  if (!c) return;

  c.appendChild(el("div", "status", "Essayer plutôt :"));

  var w = el("div", "chips");
  allTypes().filter(function (t) { return t !== type; }).forEach(function (t) {
    var chip = el("div", "chip", esc(t));
    chip.addEventListener("click", function () {
      ST.currentType = t;
      buildTypeDropdown();
      clearResults();
      var si = $("search-input");
      if (si && si.value.trim()) runSearch();
    });
    w.appendChild(chip);
  });
  c.appendChild(w);
}

async function runSearch() {
  var si = $("search-input");
  if (!si) return;

  var q = si.value.trim();
  if (!q) {
    var s0 = $("search-status");
    if (s0) s0.textContent = "Tape un titre, un auteur, une année.";
    return;
  }

  var localType = ST.currentType;
  ST.searchToken = (ST.searchToken || 0) + 1;
  var token = ST.searchToken;

  addRecent(q, localType);

  var st = $("search-status");
  if (st) {
    st.className = "status";
    st.textContent = "Recherche…";
  }

  var r = $("results");
  if (r) r.innerHTML = '<div class="skel"></div><div class="skel"></div><div class="skel"></div>';

  try {
    var res = [];

    if (localType === "Film") {
      res = (await searchTMDB(q, "movie")).filter(function (x) {
        return (x.raw.genre_ids || []).indexOf(99) < 0;
      });
    }
    else if (localType === "Série") res = await searchTMDB(q, "tv");
    else if (localType === "Jeu") res = await searchRAWG(q);
    else if (["Manga", "BD", "Roman", "Livre"].indexOf(localType) >= 0) res = await searchBooks(q, localType);
    else if (localType === "Musique") res = await searchMusic(q);
    else res = await searchBooks(q, localType);

    if (token !== ST.searchToken) return;

    if (!res.length) {
      var st2 = $("search-status");
      if (st2) st2.textContent = "Aucun résultat en " + localType + ".";
      renderResults([], localType, q);
      showFallback(localType);
    } else {
      var st3 = $("search-status");
      if (st3) st3.textContent = res.length + " résultat(s)";
      renderResults(res, localType, q);
    }
  } catch (err) {
    if (token !== ST.searchToken) return;
    console.error(err);

    var results2 = $("results");
    if (results2) results2.innerHTML = "";

    var st4 = $("search-status");
    if (st4) {
      st4.className = "status error";
      st4.textContent = "Erreur : " + (err.message || "réseau");
    }

    renderResults([], localType, q);
  }
}


/* ───────── RECHERCHES RÉCENTES (titre + type) ───────── */
function loadRecents() {
  var raw = [];
  try { raw = JSON.parse(localStorage.getItem("recent_searches") || "[]"); } catch (e) { raw = []; }

  return raw.map(function (x) {
    if (typeof x === "string") return { titre: x, type: SETTINGS_DEFAULTS.defaultType || "Film" };
    if (x && x.titre) return { titre: String(x.titre), type: x.type || SETTINGS_DEFAULTS.defaultType || "Film" };
    return null;
  }).filter(Boolean).slice(0, 8);
}

function saveRecents() {
  localStorage.setItem("recent_searches", JSON.stringify(ST.recent || []));
}

function addRecent(t, type) {
  var item = { titre: t, type: type || ST.currentType };
  ST.recent = [item].concat(
    (ST.recent || []).filter(function (x) {
      return !(x.titre === item.titre && x.type === item.type);
    })
  ).slice(0, 8);
  saveRecents();
}

function showRecent() {
  var wrap = el("div");

  if (!ST.recent || !ST.recent.length) {
    wrap.appendChild(emptyBox("clock", "Aucune recherche récente."));
  }

  (ST.recent || []).forEach(function (r) {
    var b = el("button", "wide");
    b.style.justifyContent = "flex-start";
    b.style.marginBottom = "10px";
    b.innerHTML =
      '<span class="ic">' + ic("clock") + "</span>" +
      "<span>" + esc(r.titre) + ' <span style="color:var(--dim);font-weight:500;">· ' + esc(r.type) + "</span></span>";

    b.addEventListener("click", function () {
      closeMenu();
      var si = $("search-input");
      if (si) si.value = r.titre;
      ST.currentType = r.type;
      buildTypeDropdown();
      runSearch();
    });

    wrap.appendChild(b);
  });

  setSheet("Recherches récentes", wrap, [["Annuler", "", closeMenu]]);
}


/* ───────── SOURCES RÉSEAU ───────── */
async function searchTMDB(q, kind) {
  var res = await fetch(PROXY + "/tmdb/search/" + kind + "?language=fr-FR&query=" + encodeURIComponent(q));
  if (!res.ok) throw new Error("TMDB " + res.status);
  var d = await res.json();

  return (d.results || []).slice(0, 20).map(function (r) {
    return {
      source: "tmdb",
      id: r.id,
      tmdbId: r.id,
      title: kind === "movie" ? r.title : r.name,
      year: (kind === "movie" ? r.release_date : r.first_air_date || "").slice(0, 4),
      poster: r.poster_path ? TMDB_IMG + r.poster_path : null,
      rating: r.vote_average ? Math.round(r.vote_average) : null,
      raw: r
    };
  });
}

async function searchRAWG(q) {
  var res = await fetch(PROXY + "/rawg/games?search=" + encodeURIComponent(q) + "&page_size=15");
  if (!res.ok) throw new Error("RAWG " + res.status);
  var d = await res.json();

  return (d.results || []).map(function (g) {
    return {
      source: "rawg",
      id: g.id,
      title: g.name,
      year: (g.released || "").slice(0, 4),
      poster: g.background_image,
      platforms: (g.platforms || []).map(function (p) { return p.platform.name; }),
      raw: g
    };
  });
}

async function searchMusic(q) {
  var res = await fetch("https://itunes.apple.com/search?term=" + encodeURIComponent(q) + "&media=music&entity=album&limit=15");
  if (!res.ok) throw new Error("Music " + res.status);
  var d = await res.json();

  return (d.results || []).map(function (a) {
    return {
      source: "music",
      id: a.collectionId,
      title: a.collectionName,
      year: (a.releaseDate || "").slice(0, 4),
      author: a.artistName,
      poster: a.artworkUrl100 ? a.artworkUrl100.replace("100x100", "400x400") : null,
      raw: a
    };
  });
}

async function searchGoogleBooks(q, type) {
  var query = q;
  if (type === "BD") query += " bande dessinée comics";
  if (type === "Manga") query += " manga";
  if (type === "Roman") query += " roman fiction";
  if (type === "Livre") query += " essai biographie";

  var res = await fetch(PROXY + "/books/v1/volumes?maxResults=20&q=" + encodeURIComponent(query) + "&filter=full");
  if (!res.ok) throw new Error("Books " + res.status);
  var d = await res.json();

  return (d.items || []).map(function (it) {
    var v = it.volumeInfo || {};
    var p = v.imageLinks ? (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail) : null;
    if (!p && it.id) p = "https://books.google.com/books/content?id=" + it.id + "&printsec=frontcover&img=1&zoom=1";

    return {
      source: "book",
      id: it.id,
      title: v.title + (v.subtitle ? " - " + v.subtitle : ""),
      year: (v.publishedDate || "").slice(0, 4),
      author: (v.authors || []).join(", "),
      poster: p,
      categories: v.categories || [],
      raw: v
    };
  });
}

async function searchOpenLib(q, type) {
  var query = q;
  if (type === "BD") query += " graphic novel";
  if (type === "Manga") query += " manga";

  var res = await fetch("https://openlibrary.org/search.json?q=" + encodeURIComponent(q) + "&limit=20&fields=title,author_name,first_publish_year,cover_i,key,subject");
  if (!res.ok) throw new Error("OpenLib " + res.status);
  var d = await res.json();

  return (d.docs || []).map(function (x) {
    return {
      source: "openlib",
      id: x.key,
      title: x.title,
      year: x.first_publish_year ? String(x.first_publish_year) : "",
      author: (x.author_name || []).join(", "),
      poster: x.cover_i ? ("https://covers.openlibrary.org/b/id/" + x.cover_i + "-M.jpg") : null,
      categories: x.subject || [],
      raw: x
    };
  });
}

function relevantForType(item, type) {
  var cats = Array.isArray(item.categories) ? item.categories.join(" ") : "";
  var t = (cats + " " + (item.title || "")).toLowerCase();
  var comic = t.indexOf("comic") >= 0 || t.indexOf("graphic novel") >= 0 || t.indexOf("bande dessin") >= 0;
  var manga = t.indexOf("manga") >= 0;

  if (type === "BD") return !(manga && !comic);
  if (type === "Manga") return manga || !comic;
  if (type === "Roman") return !(comic || manga);
  return true;
}

async function searchBooks(q, type) {
  var r = await Promise.allSettled([searchGoogleBooks(q, type), searchOpenLib(q, type)]);
  var a = r[0].status === "fulfilled" ? r[0].value : [];
  var b = r[1].status === "fulfilled" ? r[1].value : [];
  var m = a.concat(b).filter(function (i) { return relevantForType(i, type); });
  var seen = {};

  return m.filter(function (i) {
    var k = norm(i.title).slice(0, 30);
    if (!k || seen[k]) return false;
    seen[k] = 1;
    return true;
  });
}

async function fetchSteamGrid(n) {
  try {
    var s = await fetch(PROXY + "/steamgrid/search/autocomplete/" + encodeURIComponent(n));
    if (!s.ok) return null;
    var sd = await s.json();
    if (!sd.success || !sd.data || !sd.data.length) return null;

    var g = await fetch(PROXY + "/steamgrid/grids/game/" + sd.data[0].id + "?dimensions=600x900&styles=alternate");
    if (!g.ok) return null;
    var gd = await g.json();
    if (!gd.success || !gd.data || !gd.data.length) return null;
    return gd.data[0].url;
  } catch (e) {
    return null;
  }
}

async function fetchTMDBSeasons(id) {
  try {
    var res = await fetch(PROXY + "/tmdb/tv/" + id);
    if (!res.ok) return null;
    var d = await res.json();
    if (!d.seasons) return null;

    return d.seasons
      .filter(function (s) { return s.season_number > 0; })
      .map(function (s) { return { n: s.season_number, total: s.episode_count || 0 }; })
      .filter(function (s) { return s.total > 0; });
  } catch (e) {
    return null;
  }
}


/* ───────── EXPORT / IMPORT / TSV ───────── */
function statusOf(e) {
  if (e.aVoir) return "À voir";
  if (e.enCours) return "En cours";
  return "Fini";
}

async function copyTSV() {
  var clean = function (v) { return String(v == null ? "" : v).replace(/[\t\r\n]+/g, " "); };
  var rows = [["Œuvre", "Type", "Note", "Entrées", "Bibliothèque", "Support", "Packaging", "Plateforme", "Statut", "Date", "ID"]];

  ST.entries.forEach(function (e) {
    rows.push([
      clean(e.titre),
      clean(e.type),
      clean(e.note != null ? e.note : ""),
      clean(descriptionOf(e)),
      clean(e.inCollection ? "oui" : ""),
      clean(e.support || ""),
      clean(e.packaging || ""),
      clean(e.plateforme || ""),
      clean(statusOf(e)),
      clean(e.dateFin || ""),
      clean(e.id || "")
    ]);
  });

  var text = rows.map(function (r) { return r.join("\t"); }).join("\n");

  try {
    await navigator.clipboard.writeText(text);
    toast("Copié ! Colle en A1.");
  } catch (e) {
    var ta = el("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    toast("Copié !");
  }
}

async function exportJSON() {
  var data = {
    version: "V0.9.1",
    exportDate: new Date().toISOString(),
    settings: settingsLoad(),
    customTypes: loadCustomTypes(),
    customLists: {
      plateformes: loadCustomList("plateformes"),
      supports: loadCustomList("supports"),
      packagings: loadCustomList("packagings"),
      bonus: loadCustomList("bonus")
    },
    entries: ST.entries
  };

  var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  var u = URL.createObjectURL(blob);
  var a = el("a");
  a.href = u;
  a.download = "ma-collection-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(u);
  localStorage.setItem("last_backup", String(Date.now()));
  toast("Backup exporté");
}

function importJSON() {
  var inp = el("input");
  inp.type = "file";
  inp.accept = "application/json";
  inp.hidden = true;
  document.body.appendChild(inp);

  inp.addEventListener("change", function (ev) {
    var f = ev.target.files[0];
    if (!f) return;

    var r = new FileReader();
    r.onload = async function (e) {
      try {
        var data = JSON.parse(e.target.result);
        var list = data.entries || (Array.isArray(data) ? data : []);
        var ids = {};
        ST.entries.forEach(function (x) { ids[x.id] = 1; });

        var added = 0, skipped = 0;
        for (var i = 0; i < list.length; i++) {
          var en = list[i];
          if (en && en.id && !ids[en.id]) {
            if (!en.titre) en.titre = "Sans titre";
            if (!en.dateAjout) en.dateAjout = new Date().toISOString();
            await dbPut(en);
            added++;
          } else skipped++;
        }

        if (data.settings) settingsSave(Object.assign({}, SETTINGS_DEFAULTS, data.settings));
        if (data.customTypes) saveCustomTypes(data.customTypes);
        if (data.customLists) {
          if (data.customLists.plateformes) saveCustomList("plateformes", data.customLists.plateformes);
          if (data.customLists.supports) saveCustomList("supports", data.customLists.supports);
          if (data.customLists.packagings) saveCustomList("packagings", data.customLists.packagings);
          if (data.customLists.bonus) saveCustomList("bonus", data.customLists.bonus);
        }

        applySettings();
        buildTypeDropdown();
        refreshAll();
        inp.remove();
        toast("Import : " + added + " ajouté(s), " + skipped + " ignoré(s)");
      } catch (err) {
        inp.remove();
        toast("JSON invalide.", 3000);
      }
    };
    r.readAsText(f);
  });

  inp.click();
}


/* ───────── SCAN EAN ───────── */
async function startEAN(cb) {
  function manual() {
    var body = el("div");
    var inp = el("input");
    inp.placeholder = "Code EAN…";
    inp.inputMode = "numeric";
    body.appendChild(inp);

    setSheet("EAN manuel", body, [
      ["Valider", "primary", function () {
        var v = inp.value.trim();
        if (v) cb(v);
        else toast("Code vide.");
      }],
      ["Annuler", "", function () { openEANModal(); }]
    ]);
  }

  if (!("BarcodeDetector" in window)) {
    manual();
    return;
  }

  try {
    var stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    showOverlay("poster-overlay");

    var pi = $("poster-img");
    if (pi) pi.style.display = "none";

    var vid = document.createElement("video");
    vid.style.flex = "1";
    vid.style.width = "100%";
    vid.style.objectFit = "cover";
    vid.setAttribute("playsinline", "true");
    vid.playsInline = true;
    vid.srcObject = stream;
    vid.play();

    var po = $("poster-overlay");
    if (po) po.insertBefore(vid, po.querySelector(".bar"));

    var det = new BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });
    var cleaned = false;

    function cleanup() {
      if (cleaned) return;
      cleaned = true;
      clearInterval(timer);
      stream.getTracks().forEach(function (t) { t.stop(); });
      if (vid.parentNode) vid.remove();
      if (pi) pi.style.display = "";
      hideOverlay("poster-overlay");
      if (po && outsideHandler) po.removeEventListener("click", outsideHandler);
    }

    function outsideHandler(e) {
      if (e.target === po) cleanup();
    }

    if (po) po.addEventListener("click", outsideHandler);

    var timer = setInterval(async function () {
      try {
        var codes = await det.detect(vid);
        if (codes.length) {
          var value = codes[0].rawValue;
          cleanup();
          cb(value);
        }
      } catch (e) {}
    }, 400);

    var pc = $("poster-close");
    if (pc) pc.onclick = cleanup;
  } catch (e) {
    toast("Caméra indisponible.", 3000);
    manual();
  }
}


/* ───────── PWA INSTALL ───────── */
var deferredPrompt = null;

window.addEventListener("beforeinstallprompt", function (e) {
  e.preventDefault();
  deferredPrompt = e;
});

function triggerInstall() {
  if (deferredPrompt) deferredPrompt.prompt();
  else toast("Menu → Installer l'application.");
}


/* ───────── FILTRES & TRI BIBLIOTHÈQUE ───────── */
function isDemat(s) {
  var n = (s || "").toLowerCase();
  return n.indexOf("démat") >= 0 ||
         n.indexOf("demat") >= 0 ||
         n.indexOf("streaming") >= 0 ||
         n.indexOf("numérique") >= 0 ||
         n.indexOf("numerique") >= 0;
}

function renderFilterControls() {
  renderTypeChips();
  renderSupportChips();
  renderSortButtons();
}

function renderTypeChips() {
  var c = $("filter-type-chips");
  if (!c) return;
  c.innerHTML = "";

  var all = el("div", "chip" + (ST.filterType === "all" ? " on" : ""), "Tous");
  all.addEventListener("click", function () {
    ST.filterType = "all";
    renderFilterControls();
    renderCollection();
  });
  c.appendChild(all);

  allTypesWithIcons().forEach(function (t) {
    var chip = el("div", "chip" + (ST.filterType === t.name ? " on" : ""),
      '<span class="ic">' + ic(t.icon || "tag") + "</span>" + esc(t.name));
    chip.addEventListener("click", function () {
      ST.filterType = (ST.filterType === t.name ? "all" : t.name);
      renderFilterControls();
      renderCollection();
    });
    c.appendChild(chip);
  });
}

function renderSupportChips() {
  var c = $("filter-support-chips");
  if (!c) return;
  c.innerHTML = "";

  [["all", "Tous"], ["phys", "Physique"], ["demat", "Dématérialisé"]].forEach(function (f) {
    var chip = el("div", "chip" + (ST.filterSupport === f[0] ? " on" : ""), f[1]);
    chip.addEventListener("click", function () {
      ST.filterSupport = f[0];
      renderFilterControls();
      renderCollection();
    });
    c.appendChild(chip);
  });
}

function renderSortButtons() {
  var c = $("filter-sort-btns");
  if (!c) return;
  c.innerHTML = "";

  var crit = [
    { key: "titre", label: "Nom" },
    { key: "date", label: "Date" },
    { key: "note", label: "Note" },
    { key: "type", label: "Type" },
    { key: "support", label: "Support" }
  ];

  crit.forEach(function (cr) {
    var active = ST.filterSort && ST.filterSort.key === cr.key;
    var b = el("button", "sort-btn" + (active ? " on" : ""));
    var arrow = "";
    if (active) {
      arrow = '<span class="ic">' + ic(ST.filterSort.dir === "asc" ? "arrow-up" : "arrow-down") + "</span>";
    }
    b.innerHTML = esc(cr.label) + arrow;
    b.addEventListener("click", function () { cycleSort(cr.key); });
    c.appendChild(b);
  });
}

function cycleSort(key) {
  if (!ST.filterSort || ST.filterSort.key !== key) {
    ST.filterSort = { key: key, dir: "asc" };
  } else {
    ST.filterSort.dir = (ST.filterSort.dir === "asc" ? "desc" : "asc");
  }
  renderFilterControls();
  renderCollection();
}

function renderCollection() {
  var list = ST.entries.filter(function (e) { return e.inCollection; });

  var q = norm(ST.colQuery);
  if (q) {
    list = list.filter(function (e) {
      return norm(e.titre).indexOf(q) >= 0 ||
             norm(e.type).indexOf(q) >= 0 ||
             norm(e.support || "").indexOf(q) >= 0 ||
             norm(e.packaging || "").indexOf(q) >= 0 ||
             norm(e.plateforme || "").indexOf(q) >= 0;
    });
  }

  if (ST.filterType !== "all") {
    list = list.filter(function (e) { return e.type === ST.filterType; });
  }

  if (ST.filterSupport === "phys") {
    list = list.filter(function (e) { return e.support && !isDemat(e.support); });
  } else if (ST.filterSupport === "demat") {
    list = list.filter(function (e) { return e.support && isDemat(e.support); });
  }

  function byDate(e) {
    var p = parseDateFR(e.dateFin);
    return p ? p.y * 10000 + p.mo * 100 + p.d : 0;
  }

  function cmp(a, b) {
    var k = ST.filterSort ? ST.filterSort.key : "date";
    if (k === "titre") return (a.titre || "").localeCompare(b.titre || "", "fr");
    if (k === "date") return byDate(a) - byDate(b);
    if (k === "note") return (a.note != null ? a.note : -1) - (b.note != null ? b.note : -1);
    if (k === "type") return (a.type || "").localeCompare(b.type || "", "fr");
    if (k === "support") return (a.support || "").localeCompare(b.support || "", "fr");
    return byDate(a) - byDate(b);
  }

  list.sort(function (a, b) {
    var r = cmp(a, b);
    return (ST.filterSort && ST.filterSort.dir === "desc") ? -r : r;
  });

  var grid = $("col-grid");
  if (!grid) return;
  grid.innerHTML = "";

  if (!list.length) {
    grid.appendChild(emptyBox("library", "Aucune œuvre dans ta bibliothèque."));
    return;
  }

  list.forEach(function (e) { grid.appendChild(collectionCard(e)); });
}


/* ───────── INITIALISATION ───────── */
function on(id, ev, fn) {
  var e = $(id);
  if (e) e.addEventListener(ev, fn);
}

async function init() {
  await openDB();
  ST.entries = await dbAll();

  var s = settingsLoad();
  applySettings();

  ST.currentType = s.defaultType || "Film";
  ST.recent = loadRecents();
  ST.searchToken = 0;
  ST.journalInitialized = false;
  if (!ST.filterSort) ST.filterSort = { key: "date", dir: "desc" };

  document.querySelectorAll("[data-ic]").forEach(function (sp) {
    sp.innerHTML = ic(sp.dataset.ic);
  });

  var fb = $("fallback");
  if (fb) fb.remove();

  buildTypeDropdown();

  /* Tabbar */
  document.querySelectorAll("nav.tabbar button").forEach(function (b) {
    b.addEventListener("click", function () { switchView(b.dataset.view); });
  });

  /* Recherche */
  on("search-input", "keydown", function (e) {
    if (e.key === "Enter") runSearch();
  });
  on("search-loupe", "click", runSearch);
  on("search-recent-btn", "click", showRecent);

  on("type-btn", "click", function () {
    var tb = $("type-btn");
    var list = $("type-list");
    if (tb && list) {
      tb.classList.toggle("open");
      list.classList.toggle("open");
    }
  });

  /* Bibliothèque */
  on("col-search", "input", function (e) {
    ST.colQuery = e.target.value;
    renderCollection();
  });
  on("col-loupe", "click", function () {
    var cs = $("col-search");
    ST.colQuery = cs ? cs.value : "";
    renderCollection();
  });
  on("col-filter-btn", "click", function () {
    renderFilterControls();
    showOverlay("filter-panel-overlay");
  });
  on("filter-back", "click", function () { hideOverlay("filter-panel-overlay"); });
  on("filter-apply", "click", function () {
    hideOverlay("filter-panel-overlay");
    renderCollection();
  });
  on("filter-reset", "click", function () {
    ST.filterType = "all";
    ST.filterSupport = "all";
    ST.filterSort = { key: "date", dir: "desc" };
    renderFilterControls();
    renderCollection();
  });

  /* Journal */
  on("journal-pen", "click", function () { quickNoteOpen(null); });
  on("bilan-prev", "click", function () {
    ST.calDate.setMonth(ST.calDate.getMonth() - 1);
    ST.calSelectedDay = null;
    renderJournal();
    updateStickyVars();
  });
  on("bilan-next", "click", function () {
    ST.calDate.setMonth(ST.calDate.getMonth() + 1);
    ST.calSelectedDay = null;
    renderJournal();
    updateStickyVars();
  });
  on("bilan-title", "click", function () {
    ST.calMode = "journal";
    showOverlay("calendar-overlay");
    renderCalendar();
  });

  /* Calendrier */
  on("cal-back", "click", function () { hideOverlay("calendar-overlay"); });
  on("cal-prev", "click", function () {
    ST.calDate.setMonth(ST.calDate.getMonth() - 1);
    renderCalendar();
  });
  on("cal-next", "click", function () {
    ST.calDate.setMonth(ST.calDate.getMonth() + 1);
    renderCalendar();
  });

  /* Picker date/heure */
  on("picker-back", "click", function () { hideOverlay("picker-overlay"); });

  /* Note rapide */
  on("qn-when-btn", "click", function () {
    openDateTimePicker(ST.pickerVal, function (iso) {
      ST.pickerVal = iso;
      var lbl = $("qn-when-label");
      if (lbl) lbl.textContent = iso ? fmtWhen(iso) : fmtWhen(new Date().toISOString());
    });
  });

  on("qn-entry-btn", "click", function () {
    openEntryPicker(function (chosen) {
      if (chosen === undefined) return;
      ST.qnEntry = chosen;
      var lbl = $("qn-entry-label");
      if (lbl) lbl.textContent = chosen ? chosen.titre : "Note libre (sans œuvre)";
      var erow = $("qn-entry-row");
      if (erow) erow.classList.toggle("hidden", !!chosen);
    });
  });

  on("qn-ep-plus", "click", function () {
    var e = ST.qnEntry;
    if (!e) { toast("Choisis d'abord une œuvre."); return; }
    var ss = $("qn-s");
    var ee = $("qn-e");
    openEpisodeWindow(
      e,
      parseInt(ss ? ss.value || "1" : "1", 10),
      parseInt(ee ? ee.value || "1" : "1", 10)
    );
  });

  on("qn-back", "click", quickNoteClose);
  on("qn-cancel", "click", quickNoteClose);
  on("qn-save", "click", quickNoteSave);

  /* Fenêtres */
  on("m-back", "click", closeModal);
  on("r-back", "click", closeReader);

  on("r-delete", "click", function () {
    if (ST.currentReaderEntry && ST.currentReaderJournalIdx != null) {
      var entry = ST.currentReaderEntry;
      var idx = ST.currentReaderJournalIdx;
      showConfirm("Supprimer cette entrée ?", "", function () {
        entry.journal.splice(idx, 1);
        dbPut(entry).then(function () {
          toast("Entrée supprimée");
          closeReader();
          refreshAll();
        });
      });
    }
  });

  on("r-edit", "click", function () {
    if (ST.currentReaderEntry && ST.currentReaderJournalIdx != null) {
      var entry = ST.currentReaderEntry;
      var idx = ST.currentReaderJournalIdx;
      var x = entry.journal[idx];
      closeReader();
      quickNoteOpen(entry, x ? x.text : "", x ? x.kind : "time", idx);
    }
  });

  on("menu-back", "click", closeMenu);
  on("confirm-back", "click", function () { hideOverlay("confirm-overlay"); });
  on("poster-close", "click", function () { hideOverlay("poster-overlay"); });

  /* Clic extérieur : dropdown type */
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".type-dropdown")) {
      var tb = $("type-btn");
      if (tb) tb.classList.remove("open");
      var list = $("type-list");
      if (list) list.classList.remove("open");
    }
  });

  /* Clic hors-fenêtre */
  [
    "modal-overlay", "reader-overlay", "qn-overlay", "menu-overlay",
    "confirm-overlay", "filter-panel-overlay", "calendar-overlay",
    "picker-overlay", "poster-overlay"
  ].forEach(function (id) {
    var ov = $(id);
    if (!ov) return;
    ov.addEventListener("click", function (e) {
      if (e.target !== ov) return;

      if (id === "modal-overlay") closeModal();
      else if (id === "reader-overlay") closeReader();
      else if (id === "qn-overlay") quickNoteClose();
      else if (id === "menu-overlay") closeMenu();
      else hideOverlay(id);
    });
  });

  window.addEventListener("resize", updateStickyVars);
  window.addEventListener("load", updateStickyVars);
  setTimeout(updateStickyVars, 300);

  var savedView = null;
  try { savedView = sessionStorage.getItem("lastView"); } catch (e) {}
  if (savedView && ["search", "collection", "journal", "options"].indexOf(savedView) >= 0) {
    ST.view = savedView;
  }

  switchView(ST.view);
  injectBackupBanner();
  scheduleGitHubBackup();

  if ("serviceWorker" in navigator) {
    try { navigator.serviceWorker.register("./sw.js"); } catch (e) {}
  }
}

init();