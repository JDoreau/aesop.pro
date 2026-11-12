// Health Check app controller (bundled module). Mounts the full-screen, focused
// experience: a pillar-grouped stepped questionnaire -> the rich TRUST Index report.
// All scoring/selection is the proven engine (trust-index*.js); this is UI only.
import { buildReport } from './trust-index-report.js';
import { AREAS, PILLAR_STEPS, AI_STEP } from './trust-index-areas.js';

const STORE = 'aesop-hc-v3';
const STEPS = [...PILLAR_STEPS, AI_STEP];

function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function pillarBandWord(v) { return v < 40 ? 'low' : v < 65 ? 'mid' : 'high'; }
function load() { try { const s = JSON.parse(localStorage.getItem(STORE) || 'null'); return s && typeof s === 'object' ? s : {}; } catch (e) { return {}; } }
function save(scores) { try { localStorage.setItem(STORE, JSON.stringify(scores)); } catch (e) {} }

export function mountHealthCheck() {
  const app = document.getElementById('hc-app');
  const launch = document.getElementById('hc-launch');
  if (!app) return;
  const state = { scores: load(), step: 0, view: 'input' };

  function open() { document.body.classList.add('hc-open'); app.hidden = false; if (Object.keys(state.scores).length >= 11) { state.view = 'report'; } render(); app.scrollTop = 0; }
  function close() { document.body.classList.remove('hc-open', 'hc-report-view'); app.hidden = true; }
  if (launch) launch.addEventListener('click', open);
  // Render-from-scores: ?r=<base64 JSON of area scores> renders the report directly.
  // Powers shareable report links AND the server-side PDF render (Browser Rendering -> page.pdf()).
  const rParam = new URLSearchParams(location.search).get('r');
  if (rParam) {
    try { const s = JSON.parse(decodeURIComponent(escape(atob(rParam)))); if (s && typeof s === 'object') state.scores = s; } catch (e) {}
  }
  if (rParam || location.hash === '#start') open();

  function setScore(id, v) { state.scores[id] = v; save(state.scores); }

  function render() {
    app.innerHTML = '';
    document.body.classList.toggle('hc-report-view', state.view === 'report');
    if (state.view === 'report') setPrintMeta();
    app.appendChild(topbar());
    app.appendChild(state.view === 'report' ? reportView() : inputView());
  }
  function setPrintMeta() {
    try {
      const d = new Date();
      const dEl = document.getElementById('hc-prt-date');
      if (dEl) dEl.textContent = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const yEl = document.getElementById('hc-prt-year');
      if (yEl) yEl.textContent = String(d.getFullYear());
    } catch (e) {}
  }

  function topbar() {
    const bar = el('div', 'hc-top band--ink');
    const brand = el('div', 'hc-brand');
    brand.innerHTML = '<span class="hc-wm">aesop</span><span class="hc-wm-an">Reporting Trust Health Check</span>';
    bar.appendChild(brand);
    if (state.view === 'input') {
      const prog = el('div', 'hc-steps');
      STEPS.forEach((s, i) => { const d = el('span', 'hc-dot' + (i === state.step ? ' on' : i < state.step ? ' done' : ''), s.label); prog.appendChild(d); });
      bar.appendChild(prog);
    }
    const x = el('button', 'hc-x', 'Exit'); x.type = 'button'; x.addEventListener('click', close); bar.appendChild(x);
    return bar;
  }

  function inputView() {
    const step = STEPS[state.step];
    const wrap = el('div', 'hc-stage');
    const head = el('div', 'hc-stephead');
    head.appendChild(el('h2', 'hc-step-title', step.title));
    head.appendChild(el('p', 'hc-step-kicker', step.label === 'AI Readiness' ? 'Bonus' : 'Pillar ' + (state.step + 1) + ' of 5'));
    head.appendChild(el('p', 'hc-step-blurb', step.blurb));
    wrap.appendChild(head);

    step.areas.forEach((id) => {
      const a = AREAS[id]; const cur = state.scores[id] != null ? state.scores[id] : 5;
      if (state.scores[id] == null) setScore(id, 5);
      const card = el('div', 'hc-area');
      const text = el('div', 'hc-area-text');
      text.appendChild(el('h3', 'hc-area-name', a.name));
      text.appendChild(el('p', 'hc-area-desc', a.desc));
      const ql = el('ul', 'hc-qs'); a.qs.forEach((q) => ql.appendChild(el('li', null, q))); text.appendChild(ql);
      card.appendChild(text);
      const rate = el('div', 'hc-rate');
      const lbl = el('div', 'hc-rate-top');
      lbl.appendChild(el('span', null, 'How in place is this today?'));
      const valEl = el('span', 'hc-val ' + pillarBandWord((cur - 1) / 9 * 100)); valEl.textContent = cur + ' / 10';
      lbl.appendChild(valEl); rate.appendChild(lbl);
      const slider = document.createElement('input');
      slider.type = 'range'; slider.min = '1'; slider.max = '10'; slider.step = '1'; slider.value = String(cur);
      slider.className = 'hc-slider'; slider.setAttribute('aria-label', a.name + ' score, 1 to 10');
      slider.addEventListener('input', () => { const v = parseInt(slider.value, 10); setScore(id, v); valEl.textContent = v + ' / 10'; valEl.className = 'hc-val ' + pillarBandWord((v - 1) / 9 * 100); });
      rate.appendChild(slider);
      const scale = el('div', 'hc-scale'); scale.appendChild(el('span', null, a.low)); scale.appendChild(el('span', null, a.high)); rate.appendChild(scale);
      card.appendChild(rate); wrap.appendChild(card);
    });

    const nav = el('div', 'hc-nav');
    const back = el('button', 'hc-btn ghost btn btn--secondary', state.step === 0 ? 'Back' : 'Back'); back.type = 'button'; back.disabled = state.step === 0;
    back.addEventListener('click', () => { if (state.step > 0) { state.step--; render(); app.scrollTop = 0; } });
    const next = el('button', 'hc-btn btn btn--primary', state.step === STEPS.length - 1 ? 'See my report' : 'Next'); next.type = 'button';
    next.addEventListener('click', () => { if (state.step < STEPS.length - 1) { state.step++; render(); app.scrollTop = 0; } else { state.view = 'report'; render(); app.scrollTop = 0; } });
    nav.appendChild(back); nav.appendChild(next); wrap.appendChild(nav);
    return wrap;
  }

  function bar(label, score, band, half) {
    const row = el('div', 'hc-bar-row' + (half ? ' ' + half : ''));
    row.appendChild(el('span', 'hc-bar-label', label));
    const track = el('div', 'hc-bar-track'); const fill = el('div', 'hc-bar-fill b-' + band); fill.style.width = score + '%'; track.appendChild(fill); row.appendChild(track);
    row.appendChild(el('span', 'hc-bar-score', String(score)));
    return row;
  }

  function section(label) { return el('h3', 'hc-sec-label', label); }
  function rsec(label, cls) {
    const sec = el('section', 'hc-rsec' + (cls ? ' ' + cls : ''));
    const head = section(label); sec.appendChild(head);
    const body = el('div', 'hc-rsec-body'); sec.appendChild(body);
    return { sec, head, body };
  }
  function card(severity, title, body) {
    const c = el('div', 'hc-card' + (severity ? ' sev-' + severity : ''));
    if (title) c.appendChild(el('h4', 'hc-card-title', title));
    if (body) c.appendChild(el('div', 'hc-card-body', body));
    return c;
  }

  function reportView() {
    const wrap = el('div', 'hc-report');
    let r;
    try { r = buildReport(state.scores); } catch (e) {
      wrap.setAttribute('data-hc-error', '1');
      wrap.appendChild(el('h2', 'hc-head-title', 'We could not build your report'));
      wrap.appendChild(el('p', 'hc-head-body', 'Something went wrong. Please start over and re-rate the areas.'));
      return wrap;
    }

    // Headline: index + band + band statement
    const head = el('div', 'hc-head');
    const scoreBox = el('div', 'hc-scorebox');
    const num = el('div', 'hc-index b-' + (r.band)); num.textContent = String(r.index);
    scoreBox.appendChild(num);
    const scoreSide = el('div', 'hc-score-side'); scoreSide.appendChild(el('div', 'hc-index-max', '/ 100'));
    const pill = el('div', 'hc-band-pill bp-' + r.band);
    pill.appendChild(el('span', 'hc-band-label', 'Trust Initiate Score')); pill.appendChild(el('span', 'hc-band-word', r.bandLabel));
    scoreSide.appendChild(pill);
    scoreBox.appendChild(scoreSide);
    head.appendChild(scoreBox);
    const headText = el('div', 'hc-head-text');
    if (r.bandStatement) { headText.appendChild(el('h2', 'hc-head-title', r.bandStatement.title)); headText.appendChild(el('p', 'hc-head-body', r.bandStatement.body)); }
    if (r.capped) headText.appendChild(el('div', 'hc-gate-note', 'Your number is capped: a strong area can’t hide a weak one. Read the five bars below — they show exactly where.'));
    head.appendChild(headText);
    wrap.appendChild(head);

    // The five pillar bars, grouped Clarity | Operating
    const bars = el('div', 'hc-bars');
    const clarity = el('div', 'hc-half');
    clarity.appendChild(el('h3', 'hc-half-label', 'Clarity — do you trust the numbers?'));
    r.pillars.filter((p) => p.half === 'clarity').forEach((p) => clarity.appendChild(bar(p.label, p.score, p.band, 'clarity')));
    bars.appendChild(clarity);
    const operating = el('div', 'hc-half');
    operating.appendChild(el('h3', 'hc-half-label op', 'Operating — will they stay trustworthy?'));
    r.pillars.filter((p) => p.half === 'operating').forEach((p) => operating.appendChild(bar(p.label, p.score, p.band, 'operating')));
    bars.appendChild(operating);
    wrap.appendChild(bars);

    // Lead finding
    if (r.leadPattern) { const s = rsec('Your lead finding'); s.body.appendChild(card(r.leadPattern.severity, r.leadPattern.title, r.leadPattern.body)); wrap.appendChild(s.sec); }

    // Binding constraint = fastest win
    if (r.bindingAdvice) {
      const s = rsec('Your fastest win — ' + r.bindingLabel);
      s.body.appendChild(card('insight', r.bindingAdvice.title, r.bindingAdvice.body));
      wrap.appendChild(s.sec);
    }

    // Profile shape: archetype + half-gap
    const shape = rsec('The shape of your profile');
    if (r.archetype) shape.body.appendChild(card(r.archetype.severity, r.archetype.title, r.archetype.body));
    if (r.halfGapRead) { const hg = card(r.halfGapRead.severity, r.halfGapRead.title, r.halfGapRead.body); hg.dataset.print = 'drop'; shape.body.appendChild(hg); }
    wrap.appendChild(shape.sec);

    // Secondary patterns
    if (r.secondaryPatterns && r.secondaryPatterns.length) {
      const s = rsec('What else your scores point to');
      const grid = el('div', 'hc-grid');
      r.secondaryPatterns.forEach((p) => grid.appendChild(card(p.severity, p.title, p.body)));
      s.body.appendChild(grid);
      wrap.appendChild(s.sec);
    }

    // Pillar-by-pillar (dropped on print; the five bars already carry per-pillar scores)
    const pillarSec = rsec('Pillar by pillar'); pillarSec.sec.dataset.print = 'drop';
    const pgrid = el('div', 'hc-grid');
    r.pillarReads.forEach((pr) => { const c = card(null, pr.label + ' — ' + (pr.entry ? pr.entry.title || '' : ''), pr.entry ? pr.entry.body : ''); pgrid.appendChild(c); });
    pillarSec.body.appendChild(pgrid);
    wrap.appendChild(pillarSec.sec);

    // AI readiness chip
    if (r.aiRead) {
      const s = rsec('AI readiness' + (r.aiChip != null ? ' — ' + r.aiChip + '/100' : ''));
      s.body.appendChild(card(r.aiRead.severity, r.aiRead.title, r.aiRead.body));
      wrap.appendChild(s.sec);
    }

    // Area-by-area (compact; forced to a fresh page on print)
    const areaSec = rsec('Area by area', 'hc-areas-sec'); areaSec.head.classList.add('hc-areas-label');
    const areas = el('div', 'hc-areas');
    r.areaReads.forEach((ar) => {
      const row = el('div', 'hc-area-row');
      row.appendChild(el('span', 'hc-area-rowname', AREAS[ar.area] ? AREAS[ar.area].name : ar.area));
      row.appendChild(el('span', 'hc-area-chip c-' + ar.band, (state.scores[ar.area] || 0) + '/10'));
      row.appendChild(el('span', 'hc-area-rowtext', ar.entry ? ar.entry.body : ''));
      areas.appendChild(row);
    });
    areaSec.body.appendChild(areas);
    wrap.appendChild(areaSec.sec);

    // Save the report. (The sales CTA and the email-me opt-in were removed in Nov 2026,
    // when the LLC closed: nothing the visitor enters leaves the browser now.)
    const cta = el('div', 'hc-cta');
    cta.appendChild(el('h3', 'hc-cta-title', 'Keep your report.'));
    cta.appendChild(el('p', 'hc-cta-body', 'Your answers stay in this browser. Print the report or save it as a PDF to keep a copy.'));
    const acts = el('div', 'hc-cta-acts');
    const printBtn = el('button', 'hc-btn btn btn--primary', 'Print / save as PDF'); printBtn.type = 'button'; printBtn.addEventListener('click', () => window.print()); acts.appendChild(printBtn);
    cta.appendChild(acts);
    wrap.appendChild(cta);

    // footer actions
    const foot = el('div', 'hc-foot');
    const edit = el('button', 'hc-linkbtn btn btn--secondary', 'Back to my answers'); edit.type = 'button'; edit.addEventListener('click', () => { state.view = 'input'; render(); app.scrollTop = 0; }); foot.appendChild(edit);
    const reset = el('button', 'hc-linkbtn btn btn--secondary', 'Start over'); reset.type = 'button'; reset.addEventListener('click', () => { state.scores = {}; save(state.scores); state.step = 0; state.view = 'input'; render(); app.scrollTop = 0; }); foot.appendChild(reset);
    wrap.appendChild(foot);

    wrap.setAttribute('data-hc-ready', '1'); // signal for the PDF renderer (Browser Rendering waits on this)
    return wrap;
  }

}
