/* ════════════════════════════════════════════════════════════════
   DATA.JS — Couche "données" de Ma Collection
   ────────────────────────────────────────────────────────────────
   Rôle : tout ce qui est STATIQUE et PARTAGÉ par le reste du site.
     • Icônes Lucide (SVG inline)
     • Constantes (types, plateformes, bonus, supports...)
     • Outils de formatage (dates, texte, couleurs de note...)
     • Accès à la base de données (IndexedDB + fallback localStorage)
     • Réglages (settings) et helpers image
   Ce fichier ne fait AUCUN rendu et ne touche JAMAIS au DOM.
   Version : V11  |  Build : voir var BUILD ci-dessous
   ════════════════════════════════════════════════════════════════ */


/* ────────────────────────────────────────────────────────────────
   1. ICÔNES LUCIDE
   Chaque clé = nom d'icône, valeur = SVG inline (stroke currentColor).
   ic(n) renvoie le SVG, ou un cercle générique si l'icône n'existe pas.
   ──────────────────────────────────────────────────────────────── */
var I = {
  // Navigation / structure
  search:           '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  library:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>',
  'book-open':      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  settings:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',

  // Statuts d'une œuvre
  heart:            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>',
  hourglass:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>',
  eye:              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  check:            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>',

  // Édition / actions
  edit:             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  pen:              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  trash:            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  'trash-2':        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  copy:             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
  'clipboard-copy': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>',
  duplicate:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
  share:            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/></svg>',
  download:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  upload:           '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  save:             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
  plus:             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  x:                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  'rotate-ccw':     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',

  // Flèches / navigation
  'chevron-left':   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>',
  'chevron-right':  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>',

  // Menus / affichage
  more:             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>',
  'more-horizontal':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
  grid:             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>',
  list:             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  'sliders-horizontal':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>',
  'maximize-2':     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>',

  // Temps / calendrier
  calendar:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>',
  clock:            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  timer:            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg>',

  // Collection (champs avancés)
  box:              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
  'package-open':   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 14.5V21"/><path d="M16 11.5 12 14.5 8 11.5"/><path d="m2 10 10-7 10 7-10 7z"/><path d="M2 10v6.5c0 .8.8 1.5 2 1.5h16c1.2 0 2-.7 2-1.5V10"/></svg>',
  monitor:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>',
  hash:             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',
  gift:             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M12 21V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>',
  barcode:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>',
  link:             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  external:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
  camera:           '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
  folder:           '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',

  // Types d'œuvres
  film:             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>',
  tv:               '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="20" height="15" x="2" y="7" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>',
  disc:             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>',
  scroll:           '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/></svg>',
  image:            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
  'gamepad-2':      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258A4 4 0 0 0 17.32 5z"/></svg>',

  // Options / divers
  tag:              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
  palette:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
  'bar-chart-3':    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
  smartphone:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>',
  info:             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  alert:            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
};

/** Renvoie le SVG d'une icône Lucide, ou un cercle générique si introuvable. */
function ic(n) {
  return I[n] || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
}


/* ────────────────────────────────────────────────────────────────
   2. CONSTANTES GLOBALES
   ──────────────────────────────────────────────────────────────── */
var PROXY    = "https://catalogue-api.nicolasarnaud1010.workers.dev"; // Proxy CORS pour TMDB/RAWG/Books
var BUILD    = "2026-09-30T03:00:00+02:00";                           // Date de build (affichée dans À propos)
var TMDB_IMG = "https://image.tmdb.org/t/p/w200";                     // Base URL des affiches TMDB
var OE       = "\u0153";                                              // caractère œ
var OEC      = "\u0152";                                              // caractère Œ
// Affiche placeholder (SVG inline) quand une œuvre n'a pas d'image
var NO_POSTER = "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='200' height='300'><rect width='200' height='300' fill='#121216'/><text x='100' y='155' font-family='monospace' font-size='13' fill='#9C93B8' text-anchor='middle'>pas d'affiche</text></svg>");


/* ────────────────────────────────────────────────────────────────
   3. TYPES, PLATEFORMES, BONUS, SUPPORTS, PACKAGINGS
   Listes utilisées par les formulaires et les filtres.
   ──────────────────────────────────────────────────────────────── */

// Types d'œuvres "officiels" (toujours présents)
var CORE_TYPES = [
  { name: "Film",    icon: "film" },
  { name: "S\u00e9rie", icon: "tv" },
  { name: "Jeu",     icon: "gamepad-2" },
  { name: "Livre",   icon: "book-open" },
  { name: "Manga",   icon: "book-open" },
  { name: "BD",      icon: "image" },
  { name: "Roman",   icon: "scroll" },
  { name: "Musique", icon: "disc" }
];

// Plateformes de jeu proposées
var PLATFORMS = [
  { name: "PC",               icon: "monitor" },
  { name: "PlayStation 5",    icon: "gamepad-2" },
  { name: "PlayStation 4",    icon: "gamepad-2" },
  { name: "Xbox Series",      icon: "gamepad-2" },
  { name: "Xbox One",         icon: "gamepad-2" },
  { name: "Nintendo Switch",  icon: "gamepad-2" },
  { name: "Nintendo Switch 2",icon: "gamepad-2" },
  { name: "Steam Deck",       icon: "gamepad-2" },
  { name: "R\u00e9tro",       icon: "gamepad-2" }
];

// Bonus possibles d'une édition collector
var BONUSES = [
  { name: "Artbook",        icon: "image" },
  { name: "OST (CD)",       icon: "disc" },
  { name: "Making-of",      icon: "film" },
  { name: "Carte du monde", icon: "image" },
  { name: "Figurine",       icon: "gift" },
  { name: "DLC code",       icon: "hash" },
  { name: "Autre",          icon: "plus" }
];

// Choix rapides pour Support et Packaging (boutons "... libre" sinon)
var SUPPORT_CHOICES   = ["Physique", "D\u00e9mat\u00e9rialis\u00e9"];
var PACKAGING_CHOICES = ["Boite", "Amaray", "Fourreau", "Steelbook", "Coffret", "Collector", "Mediabook", "Digipack", "Limit\u00e9e"];

// Mois en français (majuscule pour titres, minuscule pour "Journal de ...")
var MONTHS     = ["Janvier","F\u00e9vrier","Mars","Avril","Mai","Juin","Juillet","Ao\u00fbt","Septembre","Octobre","Novembre","D\u00e9cembre"];
var MONTHS_MIN = ["janvier","f\u00e9vrier","mars","avril","mai","juin","juillet","ao\u00fbt","septembre","octobre","novembre","d\u00e9cembre"];

/** Charge les types personnalisés créés par l'utilisateur (localStorage). */
function loadCustomTypes() {
  try { return JSON.parse(localStorage.getItem("custom_types") || "[]"); }
  catch (e) { return []; }
}

/** Sauvegarde la liste des types personnalisés. */
function saveCustomTypes(l) {
  localStorage.setItem("custom_types", JSON.stringify(l));
}

/** Tous les types (officiels + personnalisés), noms seuls. */
function allTypes() {
  return CORE_TYPES.map(function (t) { return t.name; })
    .concat(loadCustomTypes().map(function (t) { return t.name; }));
}

/** Tous les types avec leur icône (les persos prennent l'icône "tag"). */
function allTypesWithIcons() {
  return CORE_TYPES.concat(loadCustomTypes().map(function (t) { return { name: t.name, icon: "tag" }; }));
}


/* ────────────────────────────────────────────────────────────────
   4. OUTILS DE FORMATAGE
   Petites fonctions pures (sans DOM) pour formater dates/textes.
   ──────────────────────────────────────────────────────────────── */

/** Pad un nombre sur 2 chiffres (ex: 7 -> "07"). */
var pad2 = function (n) { return String(n).padStart(2, "0"); };

/** Date du jour au format ISO YYYY-MM-DD (pour les <input type=date>). */
function todayFR() {
  var d = new Date();
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}

/** Heure actuelle formatée "JJ/MM à HHhMM" (fuseau local = Paris). */
function nowStamp() {
  var d = new Date();
  return pad2(d.getDate()) + "/" + pad2(d.getMonth() + 1) + " \u00e0 " + pad2(d.getHours()) + "h" + pad2(d.getMinutes());
}

/** Normalise une chaîne pour comparaison (minuscule, sans accents/espaces). */
function norm(s) { return (s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }

/** Échappe les caractères HTML pour éviter l'injection XSS. */
function esc(s) {
  return (s == null ? "" : String(s))
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Tronque une chaîne à n caractères + points de suspension. */
function truncate(s, n) { s = s || ""; return s.length > n ? s.slice(0, n) + "\u2026" : s; }

/** Convertit une date ISO (YYYY-MM-DD) en JJ/MM/YYYY ; laisse passer si déjà au bon format. */
function formatDate(s) {
  if (!s) return "";
  if (s.indexOf("/") >= 0) return s;
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[3] + "/" + m[2] + "/" + m[1] : s;
}

/** Parse une date (ISO ou JJ/MM/YYYY) -> {y, mo, d} ou null. */
function parseDateFR(s) {
  if (!s) return null;
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return { y: +m[1], mo: +m[2], d: +m[3] };
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return { y: +m[3], mo: +m[2], d: +m[1] };
  return null;
}

/** Libellé de statut d'une œuvre (texte brut, sans emoji). */
function statutStr(e) {
  var s = [];
  if (e.isFavorite) s.push("Coup de coeur");
  if (e.enCours)    s.push("En cours");
  if (e.aVoir)      s.push("A voir");
  return s.length ? s.join(" / ") : "Fini";
}

/** Transforme le journal d'une œuvre en lignes lisibles. */
function journalLines(e) {
  var j = e.journal || (e.comment ? [{ kind: "free", text: e.comment }] : []);
  return j.map(function (x) {
    if (x.kind === "time")    return x.ts + " : " + x.text;
    if (x.kind === "ep")      return "S" + pad2(x.s || 0) + "E" + pad2(x.e || 0) + (x.note != null ? " \u2022 " + x.note + "/10" : "") + (x.text ? " : " + x.text : "");
    if (x.kind === "session") return "Session " + (x.dur || "") + (x.text ? " : " + x.text : "");
    return x.text;
  });
}

/** Description complète d'une œuvre (journal mis à plat, séparé par " | "). */
function descriptionOf(e) { return journalLines(e).join(" | "); }

/**
 * Couleurs d'une note /10 (dégradé rouge -> vert, argent pour 9, or pour 10).
 * Renvoie [background, color] ou null si pas de note.
 */
function noteColors(n) {
  if (n == null) return null;
  if (n === 10) return ["linear-gradient(135deg,#FFD700,#B8860B)", "#1a1400"]; // or
  if (n === 9)  return ["linear-gradient(135deg,#F2F2F2,#9E9E9E)", "#111111"]; // argent
  if (n >= 7)   return ["linear-gradient(135deg,#46A758,#2CB67D)", "#ffffff"]; // vert
  if (n >= 5)   return ["linear-gradient(135deg,#FFB224,#F76B15)", "#1a1200"]; // orange
  return ["linear-gradient(135deg,#E5484D,#B23B3B)", "#ffffff"];               // rouge
}


/* ────────────────────────────────────────────────────────────────
   5. BASE DE DONNÉES (IndexedDB + fallback localStorage)
   Stocke les œuvres ("entries"). Si IndexedDB indisponible/bloqué,
   on bascule automatiquement sur localStorage (USE_LS = true).
   ──────────────────────────────────────────────────────────────── */
var db = null;       // instance IndexedDB (null si fallback)
var USE_LS = false;  // true = mode localStorage de secours

/** Lit toutes les œuvres depuis localStorage (mode secours). */
function lsAll() {
  try { return JSON.parse(localStorage.getItem("entries_ls") || "[]"); }
  catch (e) { return []; }
}

/** Écrit toutes les œuvres dans localStorage (mode secours). */
function lsSave(l) {
  try { localStorage.setItem("entries_ls", JSON.stringify(l)); } catch (e) {}
}

/** Ouvre la base IndexedDB (timeout 3s -> fallback localStorage). Renvoie une Promise. */
function openDB() {
  return new Promise(function (res) {
    if (!("indexedDB" in window)) { USE_LS = true; res(null); return; }
    var done = false;
    var to = setTimeout(function () { if (!done) { done = true; USE_LS = true; res(null); } }, 3000);
    try {
      var r = indexedDB.open("catalogue-db", 2);
      r.onupgradeneeded = function (e) {
        var d = e.target.result;
        if (!d.objectStoreNames.contains("entries"))  d.createObjectStore("entries",  { keyPath: "id" });
        if (!d.objectStoreNames.contains("settings")) d.createObjectStore("settings", { keyPath: "k" });
      };
      r.onsuccess = function (e) { if (done) return; done = true; clearTimeout(to); db = e.target.result; res(db); };
      r.onerror   = function ()  { if (done) return; done = true; clearTimeout(to); USE_LS = true; res(null); };
      r.onblocked = function ()  { if (done) return; done = true; clearTimeout(to); USE_LS = true; res(null); };
    } catch (e) {
      if (!done) { done = true; clearTimeout(to); USE_LS = true; res(null); }
    }
  });
}

/** Renvoie toutes les œuvres (Promise). */
function dbAll() {
  if (USE_LS) return Promise.resolve(lsAll());
  return new Promise(function (res, rej) {
    var q = db.transaction("entries", "readonly").objectStore("entries").getAll();
    q.onsuccess = function () { res(q.result || []); };
    q.onerror   = function (e) { rej(e); };
  });
}

/** Ajoute ou met à jour une œuvre (Promise). */
function dbPut(en) {
  if (USE_LS) {
    var l = lsAll(), i = -1;
    for (var k = 0; k < l.length; k++) { if (l[k].id === en.id) { i = k; break; } }
    if (i >= 0) l[i] = en; else l.push(en);
    lsSave(l);
    return Promise.resolve();
  }
  return new Promise(function (res, rej) {
    var tx = db.transaction("entries", "readwrite");
    tx.objectStore("entries").put(en);
    tx.oncomplete = function () { res(); };
    tx.onerror    = function (e) { rej(e); };
  });
}

/** Supprime une œuvre par son id (Promise). */
function dbDelete(id) {
  if (USE_LS) {
    lsSave(lsAll().filter(function (x) { return x.id !== id; }));
    return Promise.resolve();
  }
  return new Promise(function (res, rej) {
    var tx = db.transaction("entries", "readwrite");
    tx.objectStore("entries").delete(id);
    tx.oncomplete = function () { res(); };
    tx.onerror    = function (e) { rej(e); };
  });
}


/* ────────────────────────────────────────────────────────────────
   6. RÉGLAGES (SETTINGS)
   Préférences utilisateur (apparence, type par défaut...).
   ──────────────────────────────────────────────────────────────── */

// Valeurs par défaut (utilisées si rien n'est enregistré)
var SETTINGS_DEFAULTS = {
  density: "comfort",     // "comfort" | "compact"
  fontSize: "m",          // "s" | "m" | "l"
  animOn: true,           // animations activées
  hcMode: false,          // mode haut contraste
  searchMode: "simple",   // "simple" | "avance"
  defaultType: "Film",    // type sélectionné par défaut
  panelMode: "simple",    // formulaire "simple" | "avance"
  colView: "grid",        // vue collection
  colSort: "date-desc",   // tri collection par défaut
  colSupport: "all",      // filtre support collection
  alertBackupDays: 14,    // rappel backup
  fuzzy: true             // recherche tolérante
};

/** Charge les réglages (fusion avec les valeurs par défaut). */
function settingsLoad() {
  try { return Object.assign({}, SETTINGS_DEFAULTS, JSON.parse(localStorage.getItem("settings") || "{}")); }
  catch (e) { return Object.assign({}, SETTINGS_DEFAULTS); }
}

/** Sauvegarde les réglages. */
function settingsSave(s) { localStorage.setItem("settings", JSON.stringify(s)); }

/** Applique les réglages au <body> (classes/data-attributes CSS). */
function applySettings() {
  var s = settingsLoad();
  document.body.dataset.density = s.density;
  document.body.dataset.fs      = s.fontSize;
  document.body.dataset.anim    = s.animOn ? "on" : "off";
  document.body.dataset.hc      = s.hcMode ? "1" : "0";
  var m = document.querySelector('meta[name=theme-color]');
  if (m) m.content = "#000000";
}


/* ────────────────────────────────────────────────────────────────
   7. HELPERS IMAGE
   Redimensionnement côté client pour stocker des images légères.
   ──────────────────────────────────────────────────────────────── */

/** Lit un fichier image et le redimensionne (JPEG, largeur max maxW). Renvoie une Promise(dataURL). */
function fileToResized(file, maxW) {
  return new Promise(function (res, rej) {
    var r = new FileReader();
    r.onload = function () {
      var img = new Image();
      img.onload = function () {
        var sc = Math.min(1, maxW / img.width);
        var c = document.createElement("canvas");
        c.width = Math.round(img.width * sc);
        c.height = Math.round(img.height * sc);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = rej;
      img.src = r.result;
    };
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

/** Crée une vignette (thumb) d'une URL d'image (JPEG 300px). Renvoie une Promise(dataURL ou ""). */
function makeThumb(url) {
  return new Promise(function (res) {
    if (!url || url.indexOf("data:") === 0) { res(url || ""); return; }
    var img = new Image();
    img.crossOrigin = "anonymous";
    var done = false;
    var t = setTimeout(function () { if (!done) { done = true; res(""); } }, 4000);
    img.onload = function () {
      if (done) return; done = true; clearTimeout(t);
      try {
        var c = document.createElement("canvas");
        var sc = Math.min(1, 300 / img.width);
        c.width = Math.round(img.width * sc);
        c.height = Math.round(img.height * sc);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", 0.7));
      } catch (e) { res(""); }
    };
    img.onerror = function () { if (done) return; done = true; clearTimeout(t); res(""); };
    img.src = url;
  });
}