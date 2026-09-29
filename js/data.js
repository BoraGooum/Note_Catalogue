/* js/data.js — V0.9.3 */
var I = {
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  library:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>',
  orbit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><path d="M10.4 21.9a10 10 0 0 0 9.941-15.416"/><path d="M13.5 2.1a10 10 0 0 0-9.841 15.416"/></svg>',
  'book-open':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  'notebook-pen':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.4 2.6a2 2 0 0 0-2.8-2.8L12 8.4V12h3.6z"/></svg>',
  settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>',
  hourglass:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>',
  eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>',
  pen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  'trash-2':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  duplicate:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
  download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  upload:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  save:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  'rotate-ccw':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
  'chevron-left':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>',
  'chevron-right':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>',
  'arrow-left':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
  'arrow-up':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>',
  'arrow-down':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>',
  'more-vertical':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>',
  'more-horizontal':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
  grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>',
  'sliders-horizontal':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>',
  'maximize-2':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>',
  calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>',
  'calendar-check':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  timer:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg>',
  box:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
  'package-open':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 14.5V21"/><path d="M16 11.5 12 14.5 8 11.5"/><path d="m2 10 10-7 10 7-10 7z"/><path d="M2 10v6.5c0 .8.8 1.5 2 1.5h16c1.2 0 2-.7 2-1.5V10"/></svg>',
  monitor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>',
  hash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',
  gift:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M12 21V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>',
  barcode:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>',
  link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  camera:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
  folder:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
  film:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>',
  tv:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="20" height="15" x="2" y="7" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>',
  disc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>',
  scroll:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/></svg>',
  image:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
  'gamepad-2':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258A4 4 0 0 0 17.32 5z"/></svg>',
  tag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
  palette:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
  'bar-chart-3':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
  smartphone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  alert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  'file-text':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
  'clipboard-copy':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>',
  list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/></svg>',
  'shopping-cart':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>'
};
function ic(n){return I[n]||'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';}
function loadCachedIcons(){try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf('icon_svg_')===0)I[k.substring(9)]=localStorage.getItem(k);}}catch(e){}}
loadCachedIcons();
function getCustomIcons(){var o={};try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf('icon_svg_')===0)o[k.substring(9)]=localStorage.getItem(k);}}catch(e){}return o;}
function setCustomIcons(o){if(!o)return;Object.keys(o).forEach(function(n){localStorage.setItem('icon_svg_'+n,o[n]);I[n]=o[n];});}

var PROXY="https://catalogue-api.nicolasarnaud1010.workers.dev";
var BUILD="2026-09-30T20:00:00+02:00";
var TMDB_IMG="https://image.tmdb.org/t/p/w200";
var NO_POSTER="data:image/svg+xml;utf8,"+encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='200' height='300'><rect width='200' height='300' fill='#121216'/><text x='100' y='155' font-family='monospace' font-size='13' fill='#9C93B8' text-anchor='middle'>pas d'affiche</text></svg>");

var BASE_TYPES=[{name:"Film",icon:"film"},{name:"Série",icon:"tv"},{name:"Jeu",icon:"gamepad-2"},{name:"Livre",icon:"book-open"},{name:"Manga",icon:"book-open"},{name:"BD",icon:"image"},{name:"Roman",icon:"scroll"},{name:"Musique",icon:"disc"}];
var BASE_PLATFORMS=[{name:"PC",icon:"monitor"},{name:"PlayStation 5",icon:"gamepad-2"},{name:"PlayStation 4",icon:"gamepad-2"},{name:"Xbox Series",icon:"gamepad-2"},{name:"Xbox One",icon:"gamepad-2"},{name:"Nintendo Switch",icon:"gamepad-2"},{name:"Nintendo Switch 2",icon:"gamepad-2"},{name:"Steam Deck",icon:"gamepad-2"},{name:"Rétro",icon:"gamepad-2"}];
var BASE_BONUSES=[{name:"Artbook",icon:"image"},{name:"OST (CD)",icon:"disc"},{name:"Making-of",icon:"film"},{name:"Carte du monde",icon:"image"},{name:"Figurine",icon:"gift"},{name:"DLC code",icon:"hash"}];
var BASE_SUPPORTS=["Physique","Dématérialisé"];
var BASE_PACKAGINGS=["Boîte","Amaray","Fourreau","Steelbook","Coffret","Collector","Mediabook","Digipack","Édition limitée"];
var MONTHS=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
var MONTHS_MIN=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
var LIST_KEYS=["types","plateformes","supports","packagings","bonus"];
function baseTable(key){
  if(key==="types")return BASE_TYPES.map(function(t){return{name:t.name,icon:t.icon};});
  if(key==="plateformes")return BASE_PLATFORMS.map(function(p){return{name:p.name,icon:p.icon};});
  if(key==="bonus")return BASE_BONUSES.map(function(b){return{name:b.name,icon:b.icon};});
  if(key==="supports")return BASE_SUPPORTS.map(function(s){return{name:s,icon:"box"};});
  if(key==="packagings")return BASE_PACKAGINGS.map(function(p){return{name:p,icon:"package-open"};});
  return[];
}
function getList(key){
  var raw=null;try{raw=JSON.parse(localStorage.getItem("list_"+key)||"null");}catch(e){raw=null;}
  if(Array.isArray(raw)&&raw.length)return raw;
  var out=[];baseTable(key).forEach(function(b,i){out.push({name:b.name,icon:b.icon||"tag",color:null,base:true,order:i});});
  var legacy=[];
  if(key==="types"){try{legacy=JSON.parse(localStorage.getItem("custom_types")||"[]");}catch(e){legacy=[];}legacy.forEach(function(t,i){var nm=(t&&t.name)?t.name:String(t);out.push({name:nm,icon:(t&&t.icon)||"tag",color:null,base:false,order:1000+i});});}
  else{try{legacy=JSON.parse(localStorage.getItem("custom_list_"+key)||"[]");}catch(e){legacy=[];}legacy.forEach(function(v,i){var nm=(v&&v.name)?v.name:String(v);out.push({name:nm,icon:(v&&v.icon)||"tag",color:(v&&v.color)||null,base:false,order:1000+i});});}
  setList(key,out);return out;
}
function setList(key,arr){localStorage.setItem("list_"+key,JSON.stringify(arr));}
function listItems(key){return getList(key).slice().sort(function(a,b){return a.order-b.order;});}
function persoOnly(key){return listItems(key).filter(function(x){return!x.base;});}
function addCustom(key,name){var v=(name||"").trim();if(!v)return false;var arr=getList(key);if(arr.some(function(x){return x.name===v;}))return false;var max=arr.reduce(function(m,x){return Math.max(m,x.order);},-1);arr.push({name:v,icon:"tag",color:null,base:false,order:max+1});setList(key,arr);return true;}
function removeCustom(key,name){setList(key,getList(key).filter(function(x){return x.name!==name;}));}
function renameItem(key,oldName,newName){var v=(newName||"").trim();if(!v)return false;var arr=getList(key);if(arr.some(function(x){return x.name===v&&x.name!==oldName;}))return false;arr.forEach(function(x){if(x.name===oldName)x.name=v;});setList(key,arr);return true;}
function setItemMeta(key,name,patch){var arr=getList(key);arr.forEach(function(x){if(x.name!==name)return;if(patch.icon!==undefined)x.icon=patch.icon;if(patch.color!==undefined)x.color=patch.color;});setList(key,arr);}
function moveItem(key,name,dir){var arr=listItems(key),i=-1;arr.forEach(function(x,k){if(x.name===name)i=k;});if(i<0)return;var j=dir==="up"?i-1:i+1;if(j<0||j>=arr.length)return;var t=arr[i].order;arr[i].order=arr[j].order;arr[j].order=t;setList(key,arr);}
function importLegacyList(key,arr){if(!Array.isArray(arr))return;var list=getList(key);arr.forEach(function(v,i){var nm=(v&&v.name)?v.name:String(v);if(!list.some(function(x){return x.name===nm;}))list.push({name:nm,icon:(v&&v.icon)||"tag",color:(v&&v.color)||null,base:false,order:1000+i});});setList(key,list);}
function loadCustomTypes(){return persoOnly("types").map(function(x){return{name:x.name,icon:x.icon,color:x.color};});}
function saveCustomTypes(arr){var list=getList("types").filter(function(x){return x.base;});var max=list.reduce(function(m,x){return Math.max(m,x.order);},-1);(arr||[]).forEach(function(t,i){var nm=(t&&t.name)?t.name:String(t);list.push({name:nm,icon:(t&&t.icon)||"tag",color:(t&&t.color)||null,base:false,order:max+1+i});});setList("types",list);}
function allTypes(){return listItems("types").map(function(x){return x.name;});}
function allTypesWithIcons(){return listItems("types");}

function pad2(n){return String(n).padStart(2,"0");}
function todayFR(){var d=new Date();return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());}
function nowStamp(){var d=new Date();return pad2(d.getDate())+"/"+pad2(d.getMonth()+1);}
function norm(s){return(s||"").toLowerCase().replace(/[^a-z0-9]/g,"");}
function esc(s){return(s==null?"":String(s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function truncate(s,n){s=s||"";return s.length>n?s.slice(0,n)+"…":s;}
function formatDate(s){if(!s)return"";if(s.indexOf("/")>=0)return s;var m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);return m?m[3]+"/"+m[2]+"/"+m[1]:s;}
function parseDateFR(s){if(!s)return null;var m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return{y:+m[1],mo:+m[2],d:+m[3]};m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);if(m)return{y:+m[3],mo:+m[2],d:+m[1]};return null;}
function isoToAtLocal(iso){var p=parseDateFR(iso);if(!p)return Date.now();return new Date(p.y,p.mo-1,p.d,12,0,0).getTime();}

function entryTag(x){
  if(x.kind==="time")return x.ts;
  if(x.kind==="ep")return"S"+pad2(x.s)+"E"+pad2(x.e)+(x.note!=null?" · "+x.note+"/10":"");
  if(x.kind==="session")return"Session "+(x.dur||"");
  if(x.kind==="pages")return"Pages "+(x.read||0)+(x.total?"/"+x.total:"");
  return"Instantané";
}
function journalLines(e){var j=e.journal||[];return j.map(function(x){if(x.kind==="time")return x.ts+" : "+x.text;if(x.kind==="ep")return"S"+pad2(x.s||0)+"E"+pad2(x.e||0)+(x.note!=null?" · "+x.note+"/10":"")+(x.text?" : "+x.text:"");if(x.kind==="session")return"Session "+(x.dur||"")+(x.text?" : "+x.text:"");if(x.kind==="pages")return"Pages "+(x.read||0)+(x.total?"/"+x.total:"")+(x.text?" : "+x.text:"");return x.text;});}
function descriptionOf(e){return journalLines(e).join(" | ");}
function progressBadge(e){
  var j=e.journal||[];if(!j.length)return"";
  function lastOf(kind){var best=null;j.forEach(function(x){if(x.kind!==kind)return;if(best===null||(x.at||0)>=(best.at||0))best=x;});return best;}
  var hasEp=j.some(function(x){return x.kind==="ep";});
  if(e.type==="Série"||hasEp){var ep=lastOf("ep");if(ep&&ep.s!=null&&ep.e!=null)return"S"+pad2(ep.s)+" E"+pad2(ep.e);}
  var hasPg=j.some(function(x){return x.kind==="pages";});
  if(["Livre","Manga","BD","Roman"].indexOf(e.type)>=0||hasPg){var pg=lastOf("pages");if(pg){if(!pg.read&&!pg.total)return"";if(pg.total)return"p."+pg.read+"/"+pg.total;return"p."+pg.read;}}
  var hasSess=j.some(function(x){return x.kind==="session";});
  if(e.type==="Jeu"||hasSess){var n=j.filter(function(x){return x.kind==="session";}).length;if(n)return n+" session"+(n>1?"s":"");}
  return"";
}
function noteColors(n){
  if(n==null)return null;
  switch(n){
    case 1:return["linear-gradient(135deg,#FF2D2D,#D11A1A)","#ffffff"];
    case 2:return["linear-gradient(135deg,#FF5A2E,#E0431C)","#ffffff"];
    case 3:return["linear-gradient(135deg,#FF8A1E,#E0700F)","#1a1200"];
    case 4:return["linear-gradient(135deg,#FFB300,#E09A00)","#1a1200"];
    case 5:return["linear-gradient(135deg,#C9C400,#A6A200)","#1a1400"];
    case 6:return["linear-gradient(135deg,#8FC93A,#6FA828)","#10240a"];
    case 7:return["linear-gradient(135deg,#46B05A,#2E8C44)","#ffffff"];
    case 8:return["linear-gradient(135deg,#1F8A44,#14622F)","#ffffff"];
    case 9:return["linear-gradient(135deg,#F2F2F2,#9E9E9E)","#111111"];
    case 10:return["linear-gradient(135deg,#FFD700,#B8860B)","#1a1400"];
  }
  return null;
}
function noteSolid(n){if(n==null)return null;return[null,"#FF2D2D","#FF5A2E","#FF8A1E","#FFB300","#C9C400","#8FC93A","#46B05A","#1F8A44","#C0C0C0","#FFD700"][n]||null;}

var db=null,USE_LS=false;
function lsAll(){try{return JSON.parse(localStorage.getItem("entries_ls")||"[]");}catch(e){return[];}}
function lsSave(l){try{localStorage.setItem("entries_ls",JSON.stringify(l));}catch(e){}}
function openDB(){return new Promise(function(res){if(!("indexedDB"in window)){USE_LS=true;res(null);return;}var done=false;var to=setTimeout(function(){if(!done){done=true;USE_LS=true;res(null);}},3000);try{var r=indexedDB.open("catalogue-db",2);r.onupgradeneeded=function(e){var d=e.target.result;if(!d.objectStoreNames.contains("entries"))d.createObjectStore("entries",{keyPath:"id"});if(!d.objectStoreNames.contains("settings"))d.createObjectStore("settings",{keyPath:"k"});};r.onsuccess=function(e){if(done)return;done=true;clearTimeout(to);db=e.target.result;res(db);};r.onerror=function(){if(done)return;done=true;clearTimeout(to);USE_LS=true;res(null);};r.onblocked=function(){if(done)return;done=true;clearTimeout(to);USE_LS=true;res(null);};}catch(e){if(!done){done=true;clearTimeout(to);USE_LS=true;res(null);}}});}
function dbAll(){if(USE_LS)return Promise.resolve(lsAll());return new Promise(function(res,rej){var q=db.transaction("entries","readonly").objectStore("entries").getAll();q.onsuccess=function(){res(q.result||[]);};q.onerror=function(e){rej(e);};});}
function dbPut(en){if(USE_LS){var l=lsAll(),i=-1;for(var k=0;k<l.length;k++){if(l[k].id===en.id){i=k;break;}}if(i>=0)l[i]=en;else l.push(en);lsSave(l);return Promise.resolve();}return new Promise(function(res,rej){var tx=db.transaction("entries","readwrite");tx.objectStore("entries").put(en);tx.oncomplete=function(){res();};tx.onerror=function(e){rej(e);};});}
function dbDelete(id){if(USE_LS){lsSave(lsAll().filter(function(x){return x.id!==id;}));return Promise.resolve();}return new Promise(function(res,rej){var tx=db.transaction("entries","readwrite");tx.objectStore("entries").delete(id);tx.oncomplete=function(){res();};tx.onerror=function(e){rej(e);};});}

var SETTINGS_DEFAULTS={density:"comfort",fontSize:"m",animOn:true,hcMode:false,defaultType:"Film",panelMode:"simple",theme:"violet",font:"Manrope",fontTitle:"Fraunces",alertBackupDays:14};
function settingsLoad(){try{return Object.assign({},SETTINGS_DEFAULTS,JSON.parse(localStorage.getItem("settings")||"{}"));}catch(e){return Object.assign({},SETTINGS_DEFAULTS);}}
function settingsSave(s){localStorage.setItem("settings",JSON.stringify(s));}
function applyTheme(id){var p=THEME_PRESETS.filter(function(t){return t.id===id;})[0]||THEME_PRESETS[0];var r=document.documentElement.style;r.setProperty("--acc",p.acc);r.setProperty("--acc2",p.acc2);r.setProperty("--bd",p.bd);r.setProperty("--accr",p.rgb);}
function ensureFontLoaded(id){var p=FONT_PRESETS.filter(function(f){return f.id===id;})[0];if(!p)return;if(document.querySelector('link[data-font="'+id+'"]'))return;var l=document.createElement("link");l.rel="stylesheet";l.dataset.font=id;l.href="https://fonts.googleapis.com/css2?family="+p.g+"&display=swap";document.head.appendChild(l);}
function applyFont(id){var p=FONT_PRESETS.filter(function(f){return f.id===id;})[0]||FONT_PRESETS[0];ensureFontLoaded(p.id);document.documentElement.style.setProperty("--fs",p.stack);}
function applyTitleFont(id){var p=FONT_PRESETS.filter(function(f){return f.id===id;})[0]||FONT_PRESETS.filter(function(f){return f.id==="Fraunces";})[0];ensureFontLoaded(p.id);document.documentElement.style.setProperty("--ft",p.stack);}
function applySettings(){var s=settingsLoad();document.body.dataset.density=s.density;document.body.dataset.fs=s.fontSize;document.body.dataset.anim=s.animOn?"on":"off";document.body.dataset.hc=s.hcMode?"1":"0";applyTheme(s.theme||"violet");applyFont(s.font||"Manrope");applyTitleFont(s.fontTitle||"Fraunces");var m=document.querySelector('meta[name=theme-color]');if(m)m.content="#000000";}
var THEME_PRESETS=[{id:"violet",name:"Violet",acc:"#B24BF3",acc2:"#7F5AF0",bd:"#4A3B7A",rgb:"178,75,243"},{id:"bordeaux",name:"Bordeaux",acc:"#C0392B",acc2:"#8E2A20",bd:"#6B2420",rgb:"192,57,43"},{id:"bleu",name:"Bleu nuit",acc:"#3B82F6",acc2:"#2563EB",bd:"#2B4A7A",rgb:"59,130,246"},{id:"emeraude",name:"Émeraude",acc:"#10B981",acc2:"#059669",bd:"#1F6B52",rgb:"16,185,129"},{id:"ambre",name:"Ambre",acc:"#F59E0B",acc2:"#D97706",bd:"#7A5A24",rgb:"245,158,11"},{id:"rose",name:"Rose",acc:"#EC4899",acc2:"#DB2777",bd:"#7A2F55",rgb:"236,72,153"},{id:"cyan",name:"Cyan",acc:"#06B6D4",acc2:"#0891B2",bd:"#1F5B6B",rgb:"6,182,212"},{id:"ardoise",name:"Ardoise",acc:"#94A3B8",acc2:"#64748B",bd:"#3F4A5A",rgb:"148,163,184"}];
var FONT_PRESETS=[{id:"Manrope",name:"Manrope",stack:"'Manrope',system-ui,sans-serif",g:"Manrope:wght@400;500;600;700;800"},{id:"Inter",name:"Inter",stack:"'Inter',system-ui,sans-serif",g:"Inter:wght@400;500;600;700"},{id:"Poppins",name:"Poppins",stack:"'Poppins',system-ui,sans-serif",g:"Poppins:wght@400;500;600;700"},{id:"Space Grotesk",name:"Space Grotesk",stack:"'Space Grotesk',system-ui,sans-serif",g:"Space+Grotesk:wght@400;500;600;700"},{id:"Fraunces",name:"Fraunces",stack:"'Fraunces',Georgia,serif",g:"Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700"},{id:"Playfair",name:"Playfair Display",stack:"'Playfair Display',Georgia,serif",g:"Playfair+Display:wght@400;600;700"},{id:"IBM Plex Mono",name:"IBM Plex Mono",stack:"'IBM Plex Mono',ui-monospace,monospace",g:"IBM+Plex+Mono:wght@400;500;600"},{id:"JetBrains Mono",name:"JetBrains Mono",stack:"'JetBrains Mono',ui-monospace,monospace",g:"JetBrains+Mono:wght@400;500;600"}];

function fileToResized(file,maxW){return new Promise(function(res,rej){var r=new FileReader();r.onload=function(){var img=new Image();img.onload=function(){var sc=Math.min(1,maxW/img.width);var c=document.createElement("canvas");c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);c.getContext("2d").drawImage(img,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",0.82));};img.onerror=rej;img.src=r.result;};r.onerror=rej;r.readAsDataURL(file);});}
function makeThumb(url){return new Promise(function(res){if(!url||url.indexOf("data:")===0){res(url||"");return;}var img=new Image();img.crossOrigin="anonymous";var done=false;var t=setTimeout(function(){if(!done){done=true;res("");}},4000);img.onload=function(){if(done)return;done=true;clearTimeout(t);try{var c=document.createElement("canvas");var sc=Math.min(1,300/img.width);c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);c.getContext("2d").drawImage(img,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",0.7));}catch(e){res("");}};img.onerror=function(){if(done)return;done=true;clearTimeout(t);res("");};img.src=url;});}