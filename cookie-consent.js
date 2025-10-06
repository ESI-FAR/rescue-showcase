/* RESCUE — lightweight cookie consent (no dependencies)
 * Usage:
 *   1) Include once near the end of <body>: <script defer src="cookie-consent.js"></script>
 *   2) (Optional) Add a footer link to reopen settings: <a href="#" onclick="CookieConsent.open(); return false;">Cookie settings</a>
 *   3) Listen for changes: window.addEventListener('rescue:consent', e => console.log(e.detail));
 */
(function(){
  const STORAGE_KEY = 'rescue_cc_v1';
  const THEME = {
    bg: '#0b0f17', surface:'#0f1624', card:'#141c2e', text:'#e6edf3', muted:'#9fb0c3', border:'#22314b', brand:'#0ea5e9', accent:'#a78bfa'
  };

  const state = load() || { needed: true, analytics: false, functional: false, marketing:false, choice:false };

  // Public API
  window.CookieConsent = {
    open: () => openDialog(),
    reset: () => { localStorage.removeItem(STORAGE_KEY); showBanner(); },
    get: () => ({...load()}),
  };

  // Inject styles once
  const css = `
  .cc-wrap{position:fixed; inset:auto 16px 16px 16px; z-index:9999; max-width: 960px; margin:0 auto;}
  .cc-card{background:${THEME.card}; color:${THEME.text}; border:1px solid ${THEME.border}; border-radius:14px; box-shadow:0 18px 40px rgba(0,0,0,.4);}
  .cc-inner{padding:16px; display:grid; gap:12px}
  .cc-title{font-weight:700; font-size:1rem;}
  .cc-text{color:${THEME.muted}; font-size:.95rem;}
  .cc-actions{display:flex; flex-wrap:wrap; gap:8px}
  .cc-btn{position:relative; isolation:isolate; overflow:hidden; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:10px 14px; border-radius:999px; border:1px solid ${THEME.border}; background:#111828; color:${THEME.text}; font-weight:700; text-decoration:none}
  .cc-btn::before{content:""; position:absolute; inset:-2px; border-radius:inherit; background:linear-gradient(135deg, ${THEME.brand}, ${THEME.accent}); transform:translateX(-120%) translateY(60%) rotate(-8deg); transition:transform .22s ease; z-index:0}
  .cc-btn:hover::before{transform:translateX(0) translateY(0) rotate(0)}
  .cc-btn > span{position:relative; z-index:1}
  .cc-btn.primary{border-color:transparent; color:#0b0f17; background:linear-gradient(135deg, ${THEME.brand}, ${THEME.accent})}
  .cc-small{font-size:.88rem}
  .cc-link{color:${THEME.brand};}
  .cc-manage{cursor:pointer; color:${THEME.text}; opacity:.9}
  .cc-manage:hover{opacity:1}
  .cc-modal{position:fixed; inset:0; z-index:10000; display:none; align-items:center; justify-content:center; backdrop-filter: blur(4px);}
  .cc-modal[open]{display:flex}
  .cc-dialog{width:min(680px, 96vw); background:${THEME.card}; border:1px solid ${THEME.border}; border-radius:16px; box-shadow:0 22px 46px rgba(0,0,0,.5);}
  .cc-dialog .cc-inner{padding:18px}
  .cc-row{display:grid; grid-template-columns: 1fr auto; gap:8px; align-items:center; padding:10px 0; border-top:1px solid ${THEME.border}}
  .cc-toggle{appearance:none; width:44px; height:26px; background:#0f172a; border:1px solid ${THEME.border}; border-radius:999px; position:relative; cursor:pointer}
  .cc-toggle:after{content:""; position:absolute; top:2px; left:2px; width:20px; height:20px; border-radius:50%; background:${THEME.muted}; transition:left .18s ease, background .18s ease}
  .cc-toggle:checked{background:${THEME.brand}; border-color:transparent}
  .cc-toggle:checked:after{left:22px; background:#0b0f17}
  @media (max-width:720px){ .cc-wrap{left:12px; right:12px} }
  `;
  injectCSS(css);

  // Show banner only if no prior choice
  if (!state.choice) showBanner();

  function showBanner(){
    removeExisting();
    const wrap = el('div','cc-wrap');
    wrap.innerHTML = `
      <div class="cc-card" role="region" aria-label="Cookie consent">
        <div class="cc-inner">
          <div class="cc-title">We use cookies</div>
          <div class="cc-text cc-small">We use necessary cookies to run the site. With your consent, we also use analytics and functional cookies to improve the experience. <a class="cc-link" href="#" id="cc-privacy">Privacy</a></div>
          <div class="cc-actions">
            <button class="cc-btn" id="cc-reject"><span>Reject non‑essential</span></button>
            <button class="cc-btn" id="cc-manage"><span>Manage preferences</span></button>
            <button class="cc-btn primary" id="cc-accept"><span>Accept all</span></button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    byId('cc-privacy').addEventListener('click', (e)=>{ e.preventDefault(); openDialog(); });
    byId('cc-accept').addEventListener('click', ()=> saveAndClose({analytics:true,functional:true,marketing:false}));
    byId('cc-reject').addEventListener('click', ()=> saveAndClose({analytics:false,functional:false,marketing:false}));
    byId('cc-manage').addEventListener('click', ()=> openDialog());
  }

  function openDialog(){
    const m = el('div','cc-modal');
    m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true'); m.setAttribute('open','');
    m.innerHTML = `
      <div class="cc-dialog">
        <div class="cc-inner">
          <h2 style="margin:0 0 2px">Cookie preferences</h2>
          <p class="cc-text cc-small">Enable the categories you consent to. You can change your choice anytime.</p>
          <div class="cc-row" style="border-top:none">
            <div>
              <strong>Necessary</strong><br>
              <span class="cc-small cc-text">Required for core site functionality. Always on.</span>
            </div>
            <label class="cc-small" style="opacity:.7">Required</label>
          </div>
          <div class="cc-row">
            <div>
              <strong>Analytics</strong><br>
              <span class="cc-small cc-text">Helps us understand usage (anonymous stats).</span>
            </div>
            <input type="checkbox" class="cc-toggle" id="cc-analytics">
          </div>
          <div class="cc-row">
            <div>
              <strong>Functional</strong><br>
              <span class="cc-small cc-text">Remembers your settings and improves features.</span>
            </div>
            <input type="checkbox" class="cc-toggle" id="cc-functional">
          </div>
          <div class="cc-row">
            <div>
              <strong>Marketing</strong><br>
              <span class="cc-small cc-text">Used for personalized content or third‑party embeds.</span>
            </div>
            <input type="checkbox" class="cc-toggle" id="cc-marketing">
          </div>
          <div class="cc-actions" style="margin-top:12px; justify-content:flex-end">
            <button class="cc-btn" id="cc-cancel"><span>Cancel</span></button>
            <button class="cc-btn primary" id="cc-save"><span>Save</span></button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(m);

    // Prefill
    byId('cc-analytics').checked = !!state.analytics;
    byId('cc-functional').checked = !!state.functional;
    byId('cc-marketing').checked = !!state.marketing;

    byId('cc-cancel').onclick = ()=> { m.remove(); };
    byId('cc-save').onclick = ()=> saveAndClose({
      analytics: byId('cc-analytics').checked,
      functional: byId('cc-functional').checked,
      marketing: byId('cc-marketing').checked,
    }, m);

    m.addEventListener('click', (e)=>{ if(e.target===m) m.remove(); });
  }

  function saveAndClose(changes, modal){
    const data = {...state, ...changes, needed:true, choice:true, ts: Date.now()};
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    dispatch(data);
    if (modal) modal.remove();
    const banner = document.querySelector('.cc-wrap');
    if (banner) banner.remove();
  }

  function load(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
  }

  function injectCSS(css){
    if (document.getElementById('rescue-cc-style')) return;
    const s = document.createElement('style'); s.id = 'rescue-cc-style'; s.textContent = css; document.head.appendChild(s);
  }
  function removeExisting(){ const x = document.querySelector('.cc-wrap'); if (x) x.remove(); }
  function el(tag, cls){ const n = document.createElement(tag); if(cls) n.className = cls; return n; }
  function byId(id){ return document.getElementById(id); }
  function dispatch(data){ window.dispatchEvent(new CustomEvent('rescue:consent', { detail: data })); }
})();
