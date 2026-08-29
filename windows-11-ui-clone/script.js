/* ══════════════════════════════════════════════
   Windows 11 UI Clone  |  script.js
   ══════════════════════════════════════════════ */

'use strict';

/* ══ Helpers ════════════════════════════════════ */
const $ = id => document.getElementById(id);
const qs  = (sel, ctx) => (ctx || document).querySelector(sel);
const qsa = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

/* ══ App -> Window ID map ════════════════════════ */
const APP_WIN = {
  notepad:  'win-notepad',
  calc:     'win-calc',
  explorer: 'win-explorer',
  settings: 'win-settings',
  edge:     'win-edge',
  recycle:  'win-recycle',
};

/* ══ Clock ══════════════════════════════════════ */
function updateClock() {
  const now  = new Date();
  const h    = now.getHours(), m = now.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  const pad  = n => String(n).padStart(2,'0');
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const mons = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const t = $('tbTime'), d = $('tbDate');
  if (t) t.textContent = `${h12}:${pad(m)} ${ampm}`;
  if (d) d.textContent = `${days[now.getDay()]}, ${mons[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}
updateClock();
setInterval(updateClock, 10000);

/* ══ Panel management ═══════════════════════════ */
const PANELS = ['startMenu','quickSettings','notifCenter','powerMenu'];

function closeAllPanels(except) {
  PANELS.forEach(id => { if (id !== except) $(id)?.classList.add('hidden'); });
}

function togglePanel(id) {
  const el = $(id);
  if (!el) return;
  const wasHidden = el.classList.contains('hidden');
  closeAllPanels(id);
  if (wasHidden) {
    el.classList.remove('hidden');
    el.style.animation = 'none';
    requestAnimationFrame(() => { el.style.animation = ''; });
  } else {
    el.classList.add('hidden');
  }
}

$('startBtn')?.addEventListener('click',   e => { e.stopPropagation(); togglePanel('startMenu'); });
$('trayClockBtn')?.addEventListener('click', e => { e.stopPropagation(); togglePanel('notifCenter'); });
$('notifBtn')?.addEventListener('click',   e => { e.stopPropagation(); togglePanel('notifCenter'); });
$('smPowerBtn')?.addEventListener('click', e => {
  e.stopPropagation();
  $('startMenu')?.classList.add('hidden');
  togglePanel('powerMenu');
});

qsa('.tray-icon-btn').forEach(btn => {
  btn.addEventListener('click', e => { e.stopPropagation(); togglePanel('quickSettings'); });
});

document.addEventListener('click', e => {
  const insidePanel  = PANELS.some(id => $(id)?.contains(e.target));
  const insideTbC    = $('tbCenterGroup')?.contains(e.target);
  const insideTray   = $('tbTray')?.contains(e.target);
  if (!insidePanel && !insideTbC && !insideTray) closeAllPanels(null);
});

/* ══ Window management ══════════════════════════ */
let topZ = 20;
const winStates = {};

function initState(win) {
  const id = win.id;
  if (!winStates[id]) {
    winStates[id] = {
      x: parseInt(win.style.left)   || 100,
      y: parseInt(win.style.top)    || 60,
      w: parseInt(win.style.width)  || 800,
      h: parseInt(win.style.height) || 520,
      minimized: false, maximized: false, prevRect: null,
    };
  }
  return winStates[id];
}

function getWin(appOrId) {
  return $(APP_WIN[appOrId] || appOrId);
}

function openWindow(appOrId) {
  const win = getWin(appOrId);
  if (!win) return;
  closeAllPanels(null);

  const st = initState(win);
  st.minimized = false;
  win.classList.remove('hidden');
  if (!st.maximized) applyRect(win, st);
  win.classList.add('win-opening');
  win.addEventListener('animationend', () => win.classList.remove('win-opening'), { once: true });

  focusWindow(win);
  setIndicator(win.id, true);
}

function applyRect(win, st) {
  win.style.left   = st.x + 'px'; win.style.top    = st.y + 'px';
  win.style.width  = st.w + 'px'; win.style.height = st.h + 'px';
}

function focusWindow(win) {
  qsa('.window').forEach(w => w.classList.remove('focused'));
  win.classList.add('focused');
  win.style.zIndex = ++topZ;
}

function minimizeWindow(win) {
  const st = winStates[win.id] || {};
  st.minimized = true;
  win.classList.add('win-minimizing');
  win.addEventListener('animationend', () => {
    win.classList.add('hidden');
    win.classList.remove('win-minimizing');
  }, { once: true });
}

function maximizeWindow(win) {
  const id = win.id, st = initState(win);
  const icon = win.querySelector('.wc-max i');

  if (st.maximized) {
    st.maximized = false;
    win.classList.remove('maximized');
    const r = st.prevRect;
    win.style.left = r.x+'px'; win.style.top = r.y+'px';
    win.style.width = r.w+'px'; win.style.height = r.h+'px';
    if (icon) icon.className = 'fas fa-square';
  } else {
    st.prevRect = { x: parseInt(win.style.left)||0, y: parseInt(win.style.top)||0, w: parseInt(win.style.width)||800, h: parseInt(win.style.height)||520 };
    st.maximized = true;
    win.classList.add('maximized');
    win.style.left='0px'; win.style.top='0px';
    win.style.width = window.innerWidth+'px';
    win.style.height = (window.innerHeight-48)+'px';
    if (icon) icon.className = 'fas fa-clone';
  }
}

function closeWindow(win) {
  win.classList.add('win-closing');
  win.addEventListener('animationend', () => {
    win.classList.add('hidden');
    win.classList.remove('win-closing','maximized');
    const st = winStates[win.id];
    if (st) { st.minimized = false; st.maximized = false; }
    setIndicator(win.id, false);
  }, { once: true });
}

const WIN_TO_APP = {
  'win-notepad':'notepad','win-calc':'calc','win-explorer':'explorer',
  'win-settings':'settings','win-edge':'edge','win-recycle':'recycle',
};

function setIndicator(winId, open) {
  const app = WIN_TO_APP[winId];
  if (!app) return;
  const btn = qs(`.tb-app-btn[data-app="${app}"]`);
  if (!btn) return;
  const ind = btn.querySelector('.tb-app-indicator');
  if (ind) ind.classList.toggle('hidden', !open);
  btn.classList.toggle('open', open);
}

/* Wire controls for every window */
qsa('.window').forEach(win => {
  initState(win);
  win.addEventListener('mousedown', () => focusWindow(win), true);
  win.querySelector('.wc-min')?.addEventListener('click',   e => { e.stopPropagation(); minimizeWindow(win); });
  win.querySelector('.wc-max')?.addEventListener('click',   e => { e.stopPropagation(); maximizeWindow(win); });
  win.querySelector('.wc-close')?.addEventListener('click', e => { e.stopPropagation(); closeWindow(win); });
  win.querySelector('.win-titlebar')?.addEventListener('dblclick', e => {
    if (!e.target.closest('.win-controls,.edge-tabs')) maximizeWindow(win);
  });
  setupDrag(win);
  setupResize(win);
});

/* ── Drag ────────────────────────────────────── */
function setupDrag(win) {
  const tb = win.querySelector('.win-titlebar');
  if (!tb) return;
  let sx, sy, sl, st2, active = false;

  tb.addEventListener('mousedown', e => {
    if (e.button !== 0 || e.target.closest('.win-controls,.edge-tabs,.wc-btn')) return;
    const s = initState(win); if (s.maximized) return;
    active = true;
    sx = e.clientX; sy = e.clientY;
    sl = parseInt(win.style.left)||0; st2 = parseInt(win.style.top)||0;
    focusWindow(win); e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!active) return;
    const nx = Math.max(-300, Math.min(sl + e.clientX - sx, window.innerWidth - 60));
    const ny = Math.max(0, Math.min(st2 + e.clientY - sy, window.innerHeight - 96));
    win.style.left = nx+'px'; win.style.top = ny+'px';
    const s = winStates[win.id]; if (s) { s.x = nx; s.y = ny; }
  });
  document.addEventListener('mouseup', () => { active = false; });
}

/* ── Resize ──────────────────────────────────── */
function setupResize(win) {
  qsa('.rh', win).forEach(handle => {
    handle.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      const s = initState(win); if (s.maximized) return;
      e.preventDefault(); e.stopPropagation(); focusWindow(win);

      const dir = [...handle.classList].find(c => c.startsWith('rh-') && c.length > 2)?.slice(3) || '';
      const sx = e.clientX, sy = e.clientY;
      const sl = parseInt(win.style.left)||0, st = parseInt(win.style.top)||0;
      const sw = parseInt(win.style.width)||800, sh = parseInt(win.style.height)||520;

      function mv(e) {
        const dx = e.clientX-sx, dy = e.clientY-sy;
        let l=sl,t=st,w=sw,h=sh;
        if (dir.includes('e')) w = Math.max(260, sw+dx);
        if (dir.includes('s')) h = Math.max(160, sh+dy);
        if (dir.includes('w')) { w = Math.max(260, sw-dx); l = sl+(sw-w); }
        if (dir.includes('n')) { h = Math.max(160, sh-dy); t = st+(sh-h); }
        win.style.left=l+'px'; win.style.top=t+'px'; win.style.width=w+'px'; win.style.height=h+'px';
        const ss=winStates[win.id]; if (ss) { ss.x=l; ss.y=t; ss.w=w; ss.h=h; }
      }
      function up() { document.removeEventListener('mousemove',mv); document.removeEventListener('mouseup',up); }
      document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
    });
  });
}

/* ══ Taskbar / Start / Desktop -> open windows ══ */
qsa('.tb-app-btn[data-app]').forEach(btn => btn.addEventListener('click', () => openWindow(btn.dataset.app)));
qsa('.sm-app[data-app]').forEach(btn => btn.addEventListener('click', () => openWindow(btn.dataset.app)));
qsa('.di[data-app]').forEach(icon => {
  icon.addEventListener('dblclick', () => openWindow(icon.dataset.app));
  icon.addEventListener('click', e => {
    e.stopPropagation();
    qsa('.di').forEach(d => d.classList.remove('selected'));
    icon.classList.add('selected');
  });
});
document.addEventListener('click', () => qsa('.di').forEach(d => d.classList.remove('selected')));

/* ══ Context menu ═══════════════════════════════ */
const ctxMenu = $('ctxMenu');
$('desktop')?.addEventListener('contextmenu', e => {
  e.preventDefault();
  const x = Math.min(e.clientX, window.innerWidth-215), y = Math.min(e.clientY, window.innerHeight-230);
  ctxMenu.style.left = x+'px'; ctxMenu.style.top = y+'px';
  ctxMenu.classList.remove('hidden');
  ctxMenu.style.animation='none'; requestAnimationFrame(() => { ctxMenu.style.animation=''; });
});
document.addEventListener('click', () => ctxMenu?.classList.add('hidden'));

$('ctx-refresh')?.addEventListener('click',     () => { showToast('🔄','Refreshed','Desktop has been refreshed.');     ctxMenu.classList.add('hidden'); });
$('ctx-new')?.addEventListener('click',         () => { showToast('📁','New Folder','New folder created on desktop.'); ctxMenu.classList.add('hidden'); });
$('ctx-display')?.addEventListener('click',     () => { openWindow('settings'); ctxMenu.classList.add('hidden'); });
$('ctx-personalize')?.addEventListener('click', () => { openWindow('settings'); ctxMenu.classList.add('hidden'); });
$('ctx-terminal')?.addEventListener('click',    () => { showToast('💻','Terminal','Opening terminal…'); ctxMenu.classList.add('hidden'); });

/* ══ Quick Settings ══════════════════════════════ */
qsa('.qs-tile').forEach(t => t.addEventListener('click', e => { e.stopPropagation(); t.classList.toggle('active'); }));

const vs = $('volSlider'), vv = $('volVal'), bs = $('brightSlider'), bv = $('brightVal');
vs?.addEventListener('input', () => { if (vv) vv.textContent = vs.value+'%'; });
bs?.addEventListener('input', () => { if (bv) bv.textContent = bs.value+'%'; });
$('qsSettings')?.addEventListener('click', () => openWindow('settings'));
$('qsPower')?.addEventListener('click',    () => { closeAllPanels(null); togglePanel('powerMenu'); });

/* ══ Power menu ══════════════════════════════════ */
$('pmSleep')?.addEventListener('click',    () => { closeAllPanels(null); showToast('😴','Sleep','Your PC is going to sleep.'); });
$('pmShutdown')?.addEventListener('click', () => { closeAllPanels(null); showToast('🔌','Shut down','Shutting down…'); });
$('pmRestart')?.addEventListener('click',  () => { closeAllPanels(null); showToast('🔄','Restart','Restarting your PC…'); });

/* ══ Taskbar search & task view ═════════════════ */
$('searchBtn')?.addEventListener('click', () => {
  closeAllPanels(null);
  const q = prompt('Search Windows:');
  if (q) showToast('🔍','Search results',`Searching for "${q}"…`);
});
$('taskviewBtn')?.addEventListener('click', () => showToast('🖥️','Task View','Virtual desktops - coming soon!'));

/* ══ Calculator ══════════════════════════════════ */
(function() {
  const exprEl = $('calcExpr'), resEl = $('calcResult');
  if (!exprEl) return;
  let expr = '', mem = 0, justCalced = false;
  const OPS = ['+','-','−','×','÷'];

  function ev(raw) {
    if (!raw) return '0';
    try {
      const e = raw.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-')
                   .replace(/π/g, String(Math.PI)).replace(/ℯ/g, String(Math.E));
      // eslint-disable-next-line no-new-func
      const v = new Function('return ('+e+')')();
      return isFinite(v) ? String(parseFloat(v.toPrecision(12))) : 'Error';
    } catch { return ''; }
  }

  function render() {
    exprEl.textContent = expr;
    resEl.textContent  = expr ? (ev(expr) || '') : '0';
  }

  function press(c) {
    const last = expr.slice(-1);
    if (c==='AC')     { expr=''; justCalced=false; render(); return; }
    if (c==='⌫')     { expr=expr.slice(0,-1); justCalced=false; render(); return; }
    if (c==='=')      { const r=ev(expr); if (r&&r!=='Error'){expr=r;justCalced=true;} render(); return; }
    if (c==='negate') { expr=expr.startsWith('-')?expr.slice(1):'-'+expr; render(); return; }
    if (c==='%')      { const r=ev(expr); if(r) expr=String(parseFloat(r)/100); render(); return; }
    if (['MC','MR','M+','M-','MS'].includes(c)) {
      const cur=parseFloat(ev(expr))||0;
      if(c==='MC')mem=0; else if(c==='MR'){expr=String(mem);justCalced=false;}
      else if(c==='M+')mem+=cur; else if(c==='M-')mem-=cur; else mem=cur;
      render(); return;
    }
    if (justCalced && !OPS.includes(c)) expr='';
    justCalced=false;
    if (OPS.includes(c) && OPS.includes(last)) expr=expr.slice(0,-1);
    if (c==='.' && last==='.') return;
    expr+=c; render();
  }

  qs('#win-calc .calc-btns')?.addEventListener('click', e => {
    const b = e.target.closest('[data-c]'); if (b) press(b.dataset.c);
  });

  document.addEventListener('keydown', e => {
    const win=$('win-calc'); if(!win||win.classList.contains('hidden')||!win.classList.contains('focused')) return;
    const map={'0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
      '+':'+','-':'−','*':'×','/':'÷','=':'=','Enter':'=','.':'.','Backspace':'⌫','Escape':'AC','%':'%'};
    if(map[e.key]){e.preventDefault();press(map[e.key]);}
  });
  render();
})();

/* ══ Notepad ══════════════════════════════════════ */
(function() {
  const area=qs('#win-notepad #npTextarea'), stat=qs('#win-notepad #npStatus');
  if(!area) return;
  area.value = localStorage.getItem('w11_np') || '';

  function upd() {
    const lines = area.value.slice(0, area.selectionStart).split('\n');
    if(stat) stat.textContent = `Ln ${lines.length}, Col ${lines[lines.length-1].length+1}`;
  }
  area.addEventListener('keyup', upd); area.addEventListener('click', upd);
  area.addEventListener('input', () => { upd(); localStorage.setItem('w11_np', area.value); });

  qsa('.menu-item[data-menu]', $('win-notepad')).forEach(item => {
    item.addEventListener('click', () => {
      if(item.dataset.menu==='np-file') {
        const ok = confirm('Copy text to clipboard? (Cancel = clear all)');
        if(ok) { navigator.clipboard?.writeText(area.value); showToast('📋','Copied','Text copied to clipboard.'); }
        else   { area.value=''; localStorage.removeItem('w11_np'); upd(); }
      }
    });
  });
  upd();
})();

/* ══ File Explorer ════════════════════════════════ */
(function() {
  const content=$('expContent'), pathEl=$('expPath'), statEl=$('expStatus');
  if(!content) return;

  const F = {
    home:      {label:'Home',      items:[{n:'Documents',i:'fa-folder',c:'#f0c27f'},{n:'Downloads',i:'fa-folder',c:'#f0c27f'},{n:'Pictures',i:'fa-folder',c:'#f0c27f'},{n:'Music',i:'fa-folder',c:'#f0c27f'},{n:'Desktop',i:'fa-folder',c:'#f0c27f'}]},
    desktop:   {label:'Desktop',   items:[{n:'Notepad',i:'fa-file-lines',c:'#0078d4'},{n:'Calculator',i:'fa-calculator',c:'#888'},{n:'Recycle Bin',i:'fa-trash',c:'#ccc'}]},
    documents: {label:'Documents', items:[{n:'Resume.docx',i:'fa-file-word',c:'#185abd'},{n:'Notes.txt',i:'fa-file-lines',c:'#6e6e6e'},{n:'Budget.xlsx',i:'fa-file-excel',c:'#107c10'},{n:'Report.pdf',i:'fa-file-pdf',c:'#e74c3c'},{n:'Archive',i:'fa-folder',c:'#f0c27f'}]},
    downloads: {label:'Downloads', items:[{n:'Setup.exe',i:'fa-gear',c:'#6e6e6e'},{n:'Movie.mp4',i:'fa-film',c:'#e60026'},{n:'Music.mp3',i:'fa-music',c:'#0078d4'},{n:'Archive.zip',i:'fa-file-zipper',c:'#f0c27f'}]},
    pictures:  {label:'Pictures',  items:[{n:'Vacation',i:'fa-folder-open',c:'#f0c27f'},{n:'Profile.png',i:'fa-file-image',c:'#0078d4'},{n:'Screenshot.png',i:'fa-file-image',c:'#107c10'}]},
    music:     {label:'Music',     items:[{n:'Playlist',i:'fa-folder',c:'#f0c27f'},{n:'Song1.mp3',i:'fa-music',c:'#0078d4'},{n:'Song2.mp3',i:'fa-music',c:'#6e6e6e'}]},
    videos:    {label:'Videos',    items:[{n:'Movie.mp4',i:'fa-film',c:'#e60026'},{n:'Clip.mp4',i:'fa-film',c:'#0078d4'}]},
    c:         {label:'Local Disk (C:)', items:[{n:'Windows',i:'fa-folder',c:'#f0c27f'},{n:'Program Files',i:'fa-folder',c:'#f0c27f'},{n:'Users',i:'fa-folder',c:'#f0c27f'}]},
  };

  function load(key) {
    const folder = F[key] || F.home;
    if(pathEl)  pathEl.textContent  = 'This PC > '+folder.label;
    if(statEl)  statEl.textContent  = folder.items.length+' items';
    content.innerHTML='';
    folder.items.forEach(item => {
      const el = document.createElement('div'); el.className='exp-file';
      el.innerHTML=`<i class="fa-solid ${item.i}" style="color:${item.c}"></i><span>${item.n}</span>`;
      el.addEventListener('dblclick', () => {
        if(item.i.includes('folder')){const k=item.n.toLowerCase().replace(/ /g,'').replace('(c:)','c'); if(F[k])load(k);}
        else if(item.n==='Notepad')openWindow('notepad');
        else if(item.n==='Calculator')openWindow('calc');
      });
      content.appendChild(el);
    });
    qsa('.exp-nav-item[data-folder]',$('win-explorer')).forEach(n=>n.classList.toggle('active',n.dataset.folder===key));
  }

  qsa('.exp-nav-item[data-folder]',$('win-explorer')).forEach(n=>n.addEventListener('click',()=>load(n.dataset.folder)));
  load('home');
})();

/* ══ Settings ════════════════════════════════════ */
(function() {
  const contentEl=$('setContent'); if(!contentEl) return;

  const PAGES = {
    system:      {title:'System',              rows:[{icon:'fa-display',label:'Display',sub:'Brightness & resolution',tog:true,on:true},{icon:'fa-volume-high',label:'Sound',sub:'Volume, output, input',tog:true,on:true},{icon:'fa-bell',label:'Notifications',sub:'Apps and other senders',tog:true,on:true},{icon:'fa-power-off',label:'Power & sleep',sub:'Screen & sleep timeout',tog:false,val:'Balanced'}]},
    bluetooth:   {title:'Bluetooth & devices', rows:[{icon:'fa-bluetooth',label:'Bluetooth',sub:'Paired devices: 2',tog:true,on:true},{icon:'fa-print',label:'Printers & scanners',sub:'1 printer installed',tog:false,val:''},{icon:'fa-computer-mouse',label:'Mouse',sub:'Pointer speed',tog:false,val:''}]},
    network:     {title:'Network & Internet',  rows:[{icon:'fa-wifi',label:'Wi-Fi',sub:'Connected: Home Network',tog:true,on:true},{icon:'fa-ethernet',label:'Ethernet',sub:'Not connected',tog:false,val:''},{icon:'fa-shield-halved',label:'VPN',sub:'Not connected',tog:true,on:false}]},
    personalize: {title:'Personalization',     rows:[{icon:'fa-image',label:'Background',sub:'Wallpaper, slideshow',tog:false,val:''},{icon:'fa-palette',label:'Colors',sub:'Accent color',tog:false,val:''},{icon:'fa-lock',label:'Lock screen',sub:'Image & app status',tog:false,val:''}]},
    apps:        {title:'Apps',                rows:[{icon:'fa-th-large',label:'Installed apps',sub:'77 apps',tog:false,val:''},{icon:'fa-download',label:'Default apps',sub:'Browser, email, music',tog:false,val:''}]},
    accounts:    {title:'Accounts',            rows:[{icon:'fa-user',label:'Your info',sub:'Local account',tog:false,val:''},{icon:'fa-envelope',label:'Email & accounts',sub:'1 account linked',tog:false,val:''}]},
    time:        {title:'Time & Language',     rows:[{icon:'fa-clock',label:'Date & time',sub:'Automatic time zone: UTC+5',tog:true,on:true},{icon:'fa-language',label:'Language',sub:'English (United States)',tog:false,val:''}]},
    gaming:      {title:'Gaming',              rows:[{icon:'fa-gamepad',label:'Game Bar',sub:'Xbox Game Bar shortcuts',tog:true,on:true},{icon:'fa-bolt',label:'Game Mode',sub:'Optimises PC for gaming',tog:true,on:true}]},
    privacy:     {title:'Privacy & Security',  rows:[{icon:'fa-lock',label:'Windows Security',sub:'No active threats',tog:false,val:'Open'},{icon:'fa-location-dot',label:'Location',sub:'Off for all apps',tog:true,on:false},{icon:'fa-camera',label:'Camera',sub:'On for some apps',tog:true,on:true},{icon:'fa-microphone',label:'Microphone',sub:'On for some apps',tog:true,on:true}]},
    update:      {title:'Windows Update',      rows:[{icon:'fa-arrows-rotate',label:'Check for updates',sub:'Last checked today',tog:false,val:''},{icon:'fa-calendar',label:'Update history',sub:'5 updates installed',tog:false,val:''}]},
  };

  function load(key) {
    const pg = PAGES[key] || PAGES.system;
    contentEl.innerHTML = `<div class="set-page-title">${pg.title}</div><div class="set-section"></div>`;
    const sec = contentEl.querySelector('.set-section');
    pg.rows.forEach(row => {
      const div=document.createElement('div'); div.className='set-row';
      div.innerHTML=`
        <div class="set-row-left">
          <div class="set-row-icon"><i class="fa-solid ${row.icon}"></i></div>
          <div><div class="set-row-label">${row.label}</div><div class="set-row-sub">${row.sub}</div></div>
        </div>
        <div class="set-row-right">
          ${row.tog
            ? `<div class="set-toggle ${row.on?'on':''}"></div>`
            : `${row.val?'<span>'+row.val+'</span>':''}<i class="fa-solid fa-chevron-right" style="font-size:.62rem"></i>`}
        </div>`;
      if(row.tog) div.querySelector('.set-toggle').addEventListener('click', e=>{e.stopPropagation();e.currentTarget.classList.toggle('on');});
      sec.appendChild(div);
    });
    qsa('.set-nav-item[data-panel]',$('win-settings')).forEach(n=>n.classList.toggle('active',n.dataset.panel===key));
  }

  qsa('.set-nav-item[data-panel]',$('win-settings')).forEach(n=>n.addEventListener('click',()=>load(n.dataset.panel)));
  load('system');
})();

/* ══ Edge ════════════════════════════════════════ */
(function() {
  const input=$('edgeSearch'), urlEl=$('edgeUrl');

  function nav(raw) {
    if(!raw?.trim()) return;
    const isURL=/^https?:\/\//.test(raw)||/^(www\.)?[\w-]+\.\w{2,}(\/|$)/.test(raw);
    const url=isURL?(raw.startsWith('http')?raw:'https://'+raw):`https://www.google.com/search?q=${encodeURIComponent(raw)}`;
    if(urlEl) urlEl.textContent=url;
    showToast('🌐','Navigating',url.slice(0,50)+(url.length>50?'…':''));
  }

  input?.addEventListener('keydown', e=>{if(e.key==='Enter')nav(input.value);});

  qs('#win-edge .edge-address-bar')?.addEventListener('click', ()=>{
    const q=prompt('Enter URL or search:',urlEl?.textContent||'');
    if(q!==null) nav(q);
  });

  qsa('.edge-tab').forEach(t=>t.addEventListener('click',()=>{qsa('.edge-tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');}));
  qsa('.edge-tab-close').forEach(b=>b.addEventListener('click', e=>{e.stopPropagation(); const t=b.closest('.edge-tab'); if(!t.classList.contains('active'))t.remove();}));
})();

/* ══ Notification Center calendar ═══════════════ */
(function() {
  const grid=$('ncCalGrid'), hdr=$('ncCalHeader'); if(!grid) return;
  const now=new Date(), y=now.getFullYear(), mo=now.getMonth(), today=now.getDate();
  const MONS=['January','February','March','April','May','June','July','August','September','October','November','December'];
  if(hdr) hdr.textContent=MONS[mo]+' '+y;
  const first=new Date(y,mo,1).getDay(), total=new Date(y,mo+1,0).getDate();
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d=>{const e=document.createElement('div');e.className='nc-cal-day head';e.textContent=d;grid.appendChild(e);});
  for(let i=0;i<first;i++){const e=document.createElement('div');e.className='nc-cal-day other';grid.appendChild(e);}
  for(let d=1;d<=total;d++){const e=document.createElement('div');e.className='nc-cal-day'+(d===today?' today':'');e.textContent=d;grid.appendChild(e);}
})();

qs('.nc-clear-btn')?.addEventListener('click', ()=>{qsa('.nc-item').forEach(el=>el.remove()); showToast('🔔','All clear','Notifications dismissed.');});

/* ══ Toast ═══════════════════════════════════════ */
function showToast(icon, title, msg, dur=3600) {
  const c=$('toastContainer'); if(!c) return;
  const el=document.createElement('div'); el.className='toast-notif';
  el.innerHTML=`<span class="toast-icon">${icon}</span><div class="toast-body"><div class="toast-title">${title}</div><div class="toast-msg">${msg}</div></div><button class="toast-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>`;
  el.querySelector('.toast-close').addEventListener('click',()=>dismiss(el));
  c.appendChild(el);
  setTimeout(()=>dismiss(el), dur);
}
function dismiss(el) {
  if(!el.isConnected) return;
  el.classList.add('out');
  el.addEventListener('animationend',()=>el.remove(),{once:true});
}

/* ══ Global keyboard ══════════════════════════════ */
document.addEventListener('keydown', e=>{
  if(e.key==='Escape') closeAllPanels(null);
  if(e.key==='`'&&!e.ctrlKey&&!e.altKey){e.preventDefault();togglePanel('startMenu');}
});

/* ══ Welcome ══════════════════════════════════════ */
setTimeout(()=>showToast('👋','Welcome back!','Windows is up to date. Have a great day!'), 1000);
