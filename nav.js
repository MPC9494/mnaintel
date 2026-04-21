// ── THE NAPKIN — nav.js ─────────────────────────────────────────────────
(function(){

const NAPKINS = [
  { num:1,  file:'tovagliolo-01-bias.html',            title:'I bias mentali',           sub:'Il cervello che ti fa perdere soldi' },
  { num:2,  file:'tovagliolo-02-etf.html',             title:'ETF',                      sub:'Il carrello già pronto' },
  { num:3,  file:'tovagliolo-03-pac.html',             title:'PAC',                      sub:'Investire ogni mese senza pensarci' },
  { num:4,  file:'tovagliolo-04-inflazione.html',      title:'Inflazione',               sub:'La tassa silenziosa' },
  { num:5,  file:'tovagliolo-05-compound.html',        title:'Interesse composto',       sub:'L\'ottava meraviglia' },
  { num:6,  file:'tovagliolo-06-diversificazione.html',title:'Diversificazione',         sub:'Non mettere tutto in un posto' },
  { num:7,  file:'tovagliolo-07-rischio.html',         title:'Rischio vs Volatilità',    sub:'Non sono la stessa cosa' },
  { num:8,  file:'tovagliolo-08-obbligazioni.html',    title:'BTP e Obbligazioni',       sub:'Prestare soldi allo Stato' },
  { num:9,  file:'tovagliolo-09-tasse.html',           title:'Tasse sugli investimenti', sub:'Capital gain e regime amministrato' },
  { num:10, file:'tovagliolo-10-portafoglio.html',     title:'Il portafoglio pigro',     sub:'3 ETF, zero pensieri' },
  { num:11, file:'tovagliolo-11-fire.html',            title:'FIRE',                     sub:'I numeri veri dell\'indipendenza' },
  { num:12, file:'tovagliolo-12-inizia.html',          title:'Come iniziare domani',     sub:'La checklist finale' },
];

const GREEN  = '#1d6b4a';
const INK    = '#1a1a18';
const BORDER = '#dddbd0';
const PAPER  = '#faf9f5';
const PAPER2 = '#f3f2ec';
const AMBER  = '#b8621a';

// ── localStorage ─────────────────────────────────────────────────────────
function getDone() {
  try { return JSON.parse(localStorage.getItem('tn_done') || '[]'); } catch(e){ return []; }
}
function markDone(num) {
  const d = getDone();
  if (!d.includes(num)) { d.push(num); localStorage.setItem('tn_done', JSON.stringify(d)); }
}
function isDone(num) { return getDone().includes(num); }

// ── Current page ──────────────────────────────────────────────────────────
function currentNum() {
  const f = window.location.pathname.split('/').pop();
  const m = NAPKINS.find(n => n.file === f);
  return m ? m.num : 0;
}

// ── CSS ───────────────────────────────────────────────────────────────────
function injectCSS() {
  if (document.getElementById('tn-nav-css')) return;
  const s = document.createElement('style');
  s.id = 'tn-nav-css';
  s.textContent = `
/* ── NAV LAYOUT ── */
nav { position:sticky;top:0;z-index:400;background:#faf9f5;border-bottom:1px solid #dddbd0; }
nav > a.logo, nav > .logo { flex-shrink:0; }
.tn-nav-right { display:flex;align-items:center;gap:4px;flex-wrap:nowrap; }

/* ── DROPDOWN ── */
.tn-nav-item { position:relative; }
.tn-dropdown {
  display:none;position:absolute;top:calc(100% + 6px);right:0;
  background:#faf9f5;border:1px solid #dddbd0;border-radius:8px;
  padding:6px;min-width:280px;z-index:500;
  box-shadow:0 8px 24px rgba(0,0,0,.09);
}
.tn-nav-item.open .tn-dropdown { display:block;animation:tnDrop .14s ease; }
@keyframes tnDrop { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }
.tn-dd-item {
  display:flex;align-items:center;gap:10px;padding:8px 10px;
  border-radius:5px;cursor:pointer;text-decoration:none;transition:background .1s;
}
.tn-dd-item:hover { background:#f3f2ec; }
.tn-dd-num {
  width:22px;height:22px;border-radius:50%;
  font-family:'DM Mono',monospace;font-size:10px;font-weight:500;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.tn-dd-num.done    { background:#1d6b4a;color:#fff; }
.tn-dd-num.current { background:#1a1a18;color:#fff; }
.tn-dd-num.pending { background:#dddbd0;color:#8a8a80; }
.tn-dd-title { font-size:13px;color:#1a1a18;font-weight:500;line-height:1.2; }
.tn-dd-sub   { font-size:11px;color:#8a8a80;font-weight:300;margin-top:1px; }
.tn-dd-sep   { height:1px;background:#dddbd0;margin:4px 0; }

/* ── INDICE BUTTON ── */
.tn-indice-btn {
  position:relative;background:none;border:none;cursor:pointer;
  font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#4a4a44;
  padding:7px 14px;display:flex;align-items:center;gap:6px;
}
.tn-indice-btn:hover { color:#1a1a18; }
.tn-indice-rough { position:absolute;top:-4px;left:-4px;pointer-events:none; }

/* ── DRAWER ── */
.tn-overlay {
  display:none;position:fixed;inset:0;
  background:rgba(26,26,24,.32);z-index:800;
}
.tn-overlay.open { display:block; }
.tn-drawer {
  position:fixed;top:0;left:-300px;width:276px;height:100vh;
  background:#faf9f5;border-right:1px solid #dddbd0;
  z-index:900;transition:left .24s ease;
  display:flex;flex-direction:column;overflow-y:auto;
}
.tn-drawer.open { left:0; }
.tn-drawer-head {
  display:flex;align-items:center;justify-content:space-between;
  padding:18px 16px 14px;border-bottom:1px solid #dddbd0;flex-shrink:0;
}
.tn-drawer-logo { font-family:'Playfair Display',Georgia,serif;font-size:18px;font-weight:700;color:#1a1a18; }
.tn-drawer-x { background:none;border:none;font-size:22px;color:#8a8a80;cursor:pointer;line-height:1;padding:0 4px; }
.tn-drawer-section {
  font-family:'DM Mono',monospace;font-size:10px;color:#8a8a80;
  letter-spacing:.09em;text-transform:uppercase;padding:12px 16px 4px;
}
.tn-drawer-item {
  display:flex;align-items:center;gap:10px;
  padding:8px 16px;text-decoration:none;transition:background .1s;
}
.tn-drawer-item:hover { background:#f3f2ec; }
.tn-drawer-item.active { background:#e8f5ee; }
.tn-di-num {
  width:22px;height:22px;border-radius:50%;flex-shrink:0;
  font-family:'DM Mono',monospace;font-size:10px;
  display:flex;align-items:center;justify-content:center;
}
.tn-di-num.done    { background:#1d6b4a;color:#fff; }
.tn-di-num.active  { background:#1a1a18;color:#fff; }
.tn-di-num.pending { background:#dddbd0;color:#8a8a80; }
.tn-di-title { font-size:13px;color:#1a1a18;font-weight:500;line-height:1.25; }
.tn-di-sub   { font-size:11px;color:#8a8a80;font-weight:300; }
.tn-drawer-link {
  display:flex;align-items:center;gap:8px;
  padding:9px 16px;font-size:13px;color:#4a4a44;text-decoration:none;transition:background .1s;
}
.tn-drawer-link:hover { background:#f3f2ec;color:#1a1a18; }
.tn-drawer-footer { margin-top:auto;padding:16px;border-top:1px solid #dddbd0;flex-shrink:0; }
.tn-drawer-cta {
  display:block;text-align:center;background:#1a1a18;color:#fff;
  font-size:14px;font-weight:600;padding:11px;border-radius:4px;
  text-decoration:none;transition:background .15s;
}
.tn-drawer-cta:hover { background:#1d6b4a; }

/* ── PROGRESS BAR ── */
.tn-progress {
  display:flex;align-items:center;gap:12px;
  padding:9px 40px;background:#f3f2ec;border-bottom:1px solid #dddbd0;
}
.tn-progress-label { font-family:'DM Mono',monospace;font-size:12px;color:#8a8a80;white-space:nowrap; }
.tn-progress-track { flex:1;position:relative;height:16px; }
.tn-progress-pct   { font-family:'DM Mono',monospace;font-size:12px;color:#1d6b4a;font-weight:500;white-space:nowrap; }

/* ── PREV / NEXT ── */
.tn-prevnext { display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:40px 0 0; }
.tn-prev,.tn-next {
  display:flex;align-items:center;gap:12px;padding:18px 20px;
  background:#f3f2ec;border:1px solid #dddbd0;border-radius:4px;
  text-decoration:none;transition:all .18s;
}
.tn-prev:hover,.tn-next:hover { border-color:#1a1a18;transform:translateY(-2px); }
.tn-next { justify-content:flex-end;text-align:right; }
.tn-pn-arrow { font-size:20px;color:#1d6b4a;flex-shrink:0; }
.tn-pn-label { font-family:'DM Mono',monospace;font-size:10px;color:#8a8a80;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px; }
.tn-pn-title { font-family:'Playfair Display',Georgia,serif;font-size:17px;font-weight:700;color:#1a1a18;line-height:1.2; }

/* ── AUTOVALUTAZIONE ── */
.tn-autoval {
  background:#f3f2ec;border-radius:4px;
  padding:28px 32px;margin:32px 0 0;
  border-left:3px solid #1d6b4a;
}
.tn-av-q    { font-family:'Playfair Display',Georgia,serif;font-size:19px;font-weight:700;color:#1a1a18;margin-bottom:18px;line-height:1.3; }
.tn-av-btns { display:flex;gap:12px;flex-wrap:wrap; }
.tn-av-yes  { font-size:15px;font-weight:600;background:#1d6b4a;color:#fff;border:none;border-radius:4px;padding:12px 24px;cursor:pointer;transition:opacity .15s; }
.tn-av-yes:hover { opacity:.85; }
.tn-av-no   { font-size:15px;font-weight:400;background:#faf9f5;color:#1a1a18;border:1.5px solid #dddbd0;border-radius:4px;padding:12px 24px;cursor:pointer;transition:border-color .15s; }
.tn-av-no:hover { border-color:#1a1a18; }
.tn-av-feedback { margin-top:14px;font-family:'DM Mono',monospace;font-size:13px;display:none; }
.tn-av-feedback.yes { color:#1d6b4a; }
.tn-av-feedback.no  { color:#b8621a; }

@media(max-width:640px){
  .tn-progress { padding:9px 20px; }
  .tn-prevnext { grid-template-columns:1fr; }
  .tn-autoval  { padding:20px; }
  .nb.nav-label,.tn-nav-item { display:none; }
}
`;
  document.head.appendChild(s);
}

// ── Build nav ─────────────────────────────────────────────────────────────
function buildNav() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const cur = currentNum();
  const isHome = cur === 0;

  // Dropdown items
  const ddItems = NAPKINS.map(n => {
    const d = isDone(n.num);
    const active = n.num === cur;
    const cls = d ? 'done' : active ? 'current' : 'pending';
    return `<a class="tn-dd-item" href="${n.file}">
      <div class="tn-dd-num ${cls}">${d ? '✓' : n.num}</div>
      <div>
        <div class="tn-dd-title">${n.title}</div>
        <div class="tn-dd-sub">${n.sub}</div>
      </div>
    </a>`;
  }).join('');

  // Build right-side nav
  const right = document.createElement('div');
  right.className = 'tn-nav-right';
  right.innerHTML = `
    <div class="tn-nav-item">
      <button class="nb" style="display:flex;align-items:center;gap:5px"
        onclick="this.closest('.tn-nav-item').classList.toggle('open');event.stopPropagation()">
        I Napkins <span style="font-size:10px;opacity:.5;margin-left:2px">▾</span>
      </button>
      <div class="tn-dropdown">${ddItems}</div>
    </div>
    <a class="nb nav-label" href="glossario.html">Glossario</a>
    <a class="nb nav-label" href="strumenti.html">Strumenti</a>
    ${!isHome ? `<button class="tn-indice-btn" id="tnIndiceBtn" onclick="TNNav.openDrawer()">
      <canvas class="tn-indice-rough" id="tnIndiceCanvas" width="100" height="34"></canvas>
      <span style="position:relative;z-index:1">≡ Indice</span>
    </button>` : ''}
    <a class="nb cta" href="https://thenapkin.beehiiv.com">Newsletter</a>
  `;

  // Clear existing nav-links div and replace with our right block
  const existing = nav.querySelector('.nav-links');
  if (existing) existing.replaceWith(right);
  else nav.appendChild(right);

  // Close on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.tn-nav-item.open').forEach(el => el.classList.remove('open'));
  });

  // Rough border on Indice button
  if (!isHome) {
    requestAnimationFrame(() => setTimeout(() => {
      const btn = document.getElementById('tnIndiceBtn');
      const c   = document.getElementById('tnIndiceCanvas');
      if (!btn || !c || typeof rough === 'undefined') return;
      const bw = btn.offsetWidth + 8;
      const bh = btn.offsetHeight + 8;
      c.width = bw; c.height = bh;
      rough.canvas(c).rectangle(3, 3, bw-6, bh-6,
        {stroke:INK, strokeWidth:1.5, roughness:2.5, fill:'none'});
    }, 150));
  }
}

// ── Drawer ────────────────────────────────────────────────────────────────
function buildDrawer() {
  const cur = currentNum();
  if (cur === 0) return;

  const overlay = document.createElement('div');
  overlay.className = 'tn-overlay';
  overlay.id = 'tnOverlay';
  overlay.onclick = closeDrawer;

  const drawer = document.createElement('div');
  drawer.className = 'tn-drawer';
  drawer.id = 'tnDrawer';

  const items = NAPKINS.map(n => {
    const d = isDone(n.num);
    const active = n.num === cur;
    return `<a class="tn-drawer-item${active?' active':''}" href="${n.file}">
      <div class="tn-di-num ${d?'done':active?'active':'pending'}">${d?'✓':n.num}</div>
      <div>
        <div class="tn-di-title">${n.title}</div>
        <div class="tn-di-sub">${n.sub}</div>
      </div>
    </a>`;
  }).join('');

  drawer.innerHTML = `
    <div class="tn-drawer-head">
      <span class="tn-drawer-logo">The Napkin</span>
      <button class="tn-drawer-x" onclick="TNNav.closeDrawer()">×</button>
    </div>
    <div class="tn-drawer-section">I Napkins</div>
    ${items}
    <div class="tn-drawer-section">Risorse</div>
    <a class="tn-drawer-link" href="glossario.html">↗ Glossario</a>
    <a class="tn-drawer-link" href="strumenti.html">↗ Strumenti</a>
    <div class="tn-drawer-footer">
      <a class="tn-drawer-cta" href="https://thenapkin.beehiiv.com">Newsletter — è gratis</a>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);
}

function openDrawer()  {
  document.getElementById('tnDrawer')?.classList.add('open');
  document.getElementById('tnOverlay')?.classList.add('open');
}
function closeDrawer() {
  document.getElementById('tnDrawer')?.classList.remove('open');
  document.getElementById('tnOverlay')?.classList.remove('open');
}

// ── Progress bar ──────────────────────────────────────────────────────────
function buildProgress() {
  const cur = currentNum();
  if (cur === 0) return;

  const total = NAPKINS.length;
  const pct   = Math.round((cur / total) * 100);

  const bar = document.createElement('div');
  bar.className = 'tn-progress';
  bar.innerHTML = `
    <span class="tn-progress-label">Napkin ${cur} di ${total}</span>
    <div class="tn-progress-track">
      <canvas id="tnProgCanvas" style="display:block;width:100%;height:16px"></canvas>
    </div>
    <span class="tn-progress-pct">${pct}%</span>
  `;

  const nav = document.querySelector('nav');
  if (nav) nav.insertAdjacentElement('afterend', bar);

  requestAnimationFrame(() => setTimeout(() => {
    const c = document.getElementById('tnProgCanvas');
    if (!c || typeof rough === 'undefined') return;
    c.width = c.parentElement.offsetWidth;
    const rc = rough.canvas(c);
    rc.rectangle(0, 2, c.width, 12,
      {stroke:BORDER, strokeWidth:1.2, roughness:1.8, fill:PAPER2, fillStyle:'solid'});
    if (pct > 0) {
      rc.rectangle(0, 2, Math.max(4, Math.round(c.width * pct / 100)), 12,
        {stroke:GREEN, strokeWidth:1.2, roughness:1.8, fill:GREEN, fillStyle:'solid'});
    }
  }, 200));
}

// ── Prev / Next ───────────────────────────────────────────────────────────
function buildPrevNext() {
  const cur = currentNum();
  if (cur === 0) return;

  const prev = NAPKINS.find(n => n.num === cur - 1);
  const next = NAPKINS.find(n => n.num === cur + 1);

  const wrap = document.createElement('div');
  wrap.className = 'tn-prevnext';
  wrap.innerHTML = `
    ${prev
      ? `<a class="tn-prev" href="${prev.file}">
          <span class="tn-pn-arrow">←</span>
          <div><div class="tn-pn-label">Precedente</div><div class="tn-pn-title">${prev.title}</div></div>
         </a>`
      : `<div></div>`}
    ${next
      ? `<a class="tn-next" href="${next.file}">
          <div><div class="tn-pn-label">Successivo</div><div class="tn-pn-title">${next.title}</div></div>
          <span class="tn-pn-arrow">→</span>
         </a>`
      : `<a class="tn-next" href="index.html">
          <div><div class="tn-pn-label">Hai finito!</div><div class="tn-pn-title">Torna alla home</div></div>
          <span class="tn-pn-arrow">↩</span>
         </a>`}
  `;

  const beehiiv = document.querySelector('.beehiiv');
  const wrap2   = document.querySelector('.wrap');
  if (beehiiv) beehiiv.insertAdjacentElement('beforebegin', wrap);
  else if (wrap2) wrap2.appendChild(wrap);
}

// ── Autovalutazione ───────────────────────────────────────────────────────
const QUESTIONS = {
  1:  'Hai capito perché il tuo cervello ti fa vendere al momento sbagliato?',
  2:  'Hai capito cos\'è un ETF e perché batte la maggior parte dei fondi attivi?',
  3:  'Hai capito come il PAC elimina il problema del "momento giusto"?',
  4:  'Hai capito perché tenere i soldi fermi sul conto ti costa ogni anno?',
  5:  'Hai capito come l\'interesse composto accelera nel tempo?',
  6:  'Hai capito perché diversificare riduce il rischio senza penalizzare il rendimento?',
  7:  'Hai capito la differenza tra rischio reale e semplice volatilità?',
  8:  'Hai capito come funzionano i BTP e quando ha senso usarli?',
  9:  'Hai capito come vengono tassati i tuoi investimenti in Italia?',
  10: 'Hai capito cos\'è un portafoglio pigro e perché funziona?',
  11: 'Hai capito come calcolare il tuo numero FIRE?',
  12: 'Hai tutto quello che ti serve per iniziare domani?',
};

function buildAutoval() {
  const cur = currentNum();
  if (cur === 0 || !QUESTIONS[cur]) return;

  const next = NAPKINS.find(n => n.num === cur + 1);

  const block = document.createElement('div');
  block.className = 'tn-autoval';
  block.innerHTML = `
    <div class="tn-av-q">${QUESTIONS[cur]}</div>
    <div class="tn-av-btns">
      <button class="tn-av-yes" id="tnAvYes">Sì, andiamo avanti →</button>
      <button class="tn-av-no"  id="tnAvNo">No, rispiegamelo</button>
    </div>
    <div class="tn-av-feedback" id="tnAvFeedback"></div>
  `;

  const pn = document.querySelector('.tn-prevnext');
  if (pn) pn.insertAdjacentElement('beforebegin', block);
  else {
    const b = document.querySelector('.beehiiv');
    if (b) b.insertAdjacentElement('beforebegin', block);
  }

  document.getElementById('tnAvYes').onclick = () => {
    markDone(cur);
    const fb = document.getElementById('tnAvFeedback');
    fb.className = 'tn-av-feedback yes';
    fb.style.display = 'block';
    fb.textContent = next
      ? `Tappa ${cur} completata ✓  —  Prossimo: ${next.title} →`
      : 'Hai completato tutti i napkin. Ottimo lavoro.';
    setTimeout(() => window.location.href = next ? next.file : 'index.html', 1400);
  };

  document.getElementById('tnAvNo').onclick = () => {
    const fb = document.getElementById('tnAvFeedback');
    fb.className = 'tn-av-feedback no';
    fb.style.display = 'block';
    fb.textContent = 'Nessun problema — rileggi la sezione qui sopra, poi torna qui.';
    window.scrollTo({top: 0, behavior:'smooth'});
  };
}

// ── Init ──────────────────────────────────────────────────────────────────
function init() {
  injectCSS();
  buildNav();
  buildDrawer();
  buildProgress();
  buildPrevNext();
  buildAutoval();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.TNNav = { openDrawer, closeDrawer, markDone, isDone, getDone, NAPKINS };

})();
