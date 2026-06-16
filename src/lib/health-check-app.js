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
  if (location.hash === '#start') open();

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
    const bar = el('div', 'hc-top');
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
    head.appendChild(el('div', 'hc-step-kicker', step.label === 'AI Readiness' ? 'Bonus' : 'Pillar ' + (state.step + 1) + ' of 5'));
    head.appendChild(el('h2', 'hc-step-title', step.title));
    head.appendChild(el('p', 'hc-step-blurb', step.blurb));
    wrap.appendChild(head);

    step.areas.forEach((id) => {
      const a = AREAS[id]; const cur = state.scores[id] != null ? state.scores[id] : 5;
      if (state.scores[id] == null) setScore(id, 5);
      const card = el('div', 'hc-area');
      card.appendChild(el('h3', 'hc-area-name', a.name));
      card.appendChild(el('p', 'hc-area-desc', a.desc));
      const ql = el('ul', 'hc-qs'); a.qs.forEach((q) => ql.appendChild(el('li', null, q))); card.appendChild(ql);
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
    const back = el('button', 'hc-btn ghost', state.step === 0 ? 'Back' : 'Back'); back.type = 'button'; back.disabled = state.step === 0;
    back.addEventListener('click', () => { if (state.step > 0) { state.step--; render(); app.scrollTop = 0; } });
    const next = el('button', 'hc-btn', state.step === STEPS.length - 1 ? 'See my report →' : 'Next →'); next.type = 'button';
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

  function section(label) { return el('div', 'hc-sec-label', label); }
  function card(severity, title, body) {
    const c = el('div', 'hc-card' + (severity ? ' sev-' + severity : ''));
    if (title) c.appendChild(el('div', 'hc-card-title', title));
    if (body) c.appendChild(el('div', 'hc-card-body', body));
    return c;
  }

  function reportView() {
    const r = buildReport(state.scores);
    const wrap = el('div', 'hc-report');

    // Headline: index + band + band statement
    const head = el('div', 'hc-head');
    const scoreBox = el('div', 'hc-scorebox');
    const num = el('div', 'hc-index b-' + (r.band)); num.textContent = String(r.index);
    scoreBox.appendChild(num); scoreBox.appendChild(el('div', 'hc-index-max', '/ 100'));
    const pill = el('div', 'hc-band-pill bp-' + r.band); pill.textContent = 'TRUST Index · ' + r.bandLabel;
    scoreBox.appendChild(pill);
    head.appendChild(scoreBox);
    const headText = el('div', 'hc-head-text');
    if (r.bandStatement) { headText.appendChild(el('h2', 'hc-head-title', r.bandStatement.title)); headText.appendChild(el('p', 'hc-head-body', r.bandStatement.body)); }
    if (r.capped) headText.appendChild(el('div', 'hc-gate-note', 'Your number is capped: a strong area can’t hide a weak one. Read the five bars below — they show exactly where.'));
    head.appendChild(headText);
    wrap.appendChild(head);

    // The five pillar bars, grouped Clarity | Operating
    const bars = el('div', 'hc-bars');
    bars.appendChild(el('div', 'hc-half-label', 'Clarity — do you trust the numbers?'));
    r.pillars.filter((p) => p.half === 'clarity').forEach((p) => bars.appendChild(bar(p.label, p.score, p.band, 'clarity')));
    bars.appendChild(el('div', 'hc-half-label op', 'Operating — will they stay trustworthy?'));
    r.pillars.filter((p) => p.half === 'operating').forEach((p) => bars.appendChild(bar(p.label, p.score, p.band, 'operating')));
    wrap.appendChild(bars);

    // Lead finding
    if (r.leadPattern) { wrap.appendChild(section('Your lead finding')); wrap.appendChild(card(r.leadPattern.severity, r.leadPattern.title, r.leadPattern.body)); }

    // Binding constraint = fastest win
    if (r.bindingAdvice) {
      wrap.appendChild(section('Your fastest win — ' + r.bindingLabel));
      wrap.appendChild(card('insight', r.bindingAdvice.title, r.bindingAdvice.body));
    }

    // Profile shape: archetype + half-gap
    wrap.appendChild(section('The shape of your profile'));
    if (r.archetype) wrap.appendChild(card(r.archetype.severity, r.archetype.title, r.archetype.body));
    if (r.halfGapRead) { const hg = card(r.halfGapRead.severity, r.halfGapRead.title, r.halfGapRead.body); hg.dataset.print = 'drop'; wrap.appendChild(hg); }

    // Secondary patterns
    if (r.secondaryPatterns && r.secondaryPatterns.length) {
      wrap.appendChild(section('What else your scores point to'));
      const grid = el('div', 'hc-grid');
      r.secondaryPatterns.forEach((p) => grid.appendChild(card(p.severity, p.title, p.body)));
      wrap.appendChild(grid);
    }

    // Pillar-by-pillar (dropped on print; the five bars already carry per-pillar scores)
    const pillarSec = el('div', 'hc-rsec'); pillarSec.dataset.print = 'drop';
    pillarSec.appendChild(section('Pillar by pillar'));
    const pgrid = el('div', 'hc-grid');
    r.pillarReads.forEach((pr) => { const c = card(null, pr.label + ' — ' + (pr.entry ? pr.entry.title || '' : ''), pr.entry ? pr.entry.body : ''); pgrid.appendChild(c); });
    pillarSec.appendChild(pgrid);
    wrap.appendChild(pillarSec);

    // AI readiness chip
    if (r.aiRead) {
      wrap.appendChild(section('AI readiness' + (r.aiChip != null ? ' — ' + r.aiChip + '/100' : '')));
      wrap.appendChild(card(r.aiRead.severity, r.aiRead.title, r.aiRead.body));
    }

    // Area-by-area (compact; forced to a fresh page on print)
    const areaLabel = section('Area by area'); areaLabel.classList.add('hc-areas-label'); wrap.appendChild(areaLabel);
    const areas = el('div', 'hc-areas');
    r.areaReads.forEach((ar) => {
      const row = el('div', 'hc-area-row');
      row.appendChild(el('span', 'hc-area-rowname', AREAS[ar.area] ? AREAS[ar.area].name : ar.area));
      row.appendChild(el('span', 'hc-area-chip c-' + ar.band, (state.scores[ar.area] || 0) + '/10'));
      row.appendChild(el('span', 'hc-area-rowtext', ar.entry ? ar.entry.body : ''));
      areas.appendChild(row);
    });
    wrap.appendChild(areas);

    // Conversion CTA
    const cta = el('div', 'hc-cta');
    if (r.conversion) { cta.appendChild(el('div', 'hc-cta-title', r.conversion.title || 'This is the self-check. The Assessment is the roadmap.')); cta.appendChild(el('div', 'hc-cta-body', r.conversion.body)); }
    cta.appendChild(el('div', 'hc-cta-printlink', 'Book a free diagnostic — aesopanalytics.com/diagnostic/'));
    const acts = el('div', 'hc-cta-acts');
    const book = document.createElement('a'); book.href = '/diagnostic/'; book.className = 'hc-btn'; book.textContent = 'Book a free diagnostic →'; acts.appendChild(book);
    const emailBtn = el('button', 'hc-btn ghost', 'Email me my report'); emailBtn.type = 'button'; emailBtn.addEventListener('click', () => alert('Email opt-in ships in the next slice.')); acts.appendChild(emailBtn);
    const printBtn = el('button', 'hc-linkbtn', 'Print / save as PDF'); printBtn.type = 'button'; printBtn.addEventListener('click', () => window.print()); acts.appendChild(printBtn);
    cta.appendChild(acts);
    wrap.appendChild(cta);

    // footer actions
    const foot = el('div', 'hc-foot');
    const edit = el('button', 'hc-linkbtn', '← Back to my answers'); edit.type = 'button'; edit.addEventListener('click', () => { state.view = 'input'; render(); app.scrollTop = 0; }); foot.appendChild(edit);
    const reset = el('button', 'hc-linkbtn', 'Start over'); reset.type = 'button'; reset.addEventListener('click', () => { state.scores = {}; save(state.scores); state.step = 0; state.view = 'input'; render(); app.scrollTop = 0; }); foot.appendChild(reset);
    wrap.appendChild(foot);

    return wrap;
  }
}
