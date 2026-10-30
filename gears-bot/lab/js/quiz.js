// Robot Lab Quiz: one question at a time, multiple choice and drag and drop.
// Answers are saved in this browser. Online (the teacher's own site): students pick their name
// from the class list and each try is sent to the teacher page. Otherwise "Submit" downloads a
// result file, like the missions do.
import { CONFIG } from './config.js?v=4636962f';
import { QUESTIONS, TOPICS } from './quiz-data.js?v=4636962f';
import { isAnswered, isCorrect, marks, score, outOf20 } from './quiz-score.js?v=4636962f';
import { blockPicture } from './blockpics.js?v=4636962f';
import { store, progress } from './missions.js?v=4636962f';
import { download, safeName, fnv1a, FORMAT } from './report.js?v=4636962f';

const $ = id => document.getElementById(id);
const app = $('app');
const N = QUESTIONS.length;
const KEY = 'quiz';

let state = store.read(KEY, null) || { name: '', tries: [], current: null };
state.tries.forEach(t => { t.sending = false; });         // a page reload while sending
let view = state.current ? 'question' : state.tries.length ? 'result' : 'start';
let picked = null;                 // a card picked up by tapping (drag and drop without dragging)
const save = () => store.write(KEY, state);

// ---------- Small helpers ----------
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const plain = s => s.replace(/\*\*/g, '');
const wordCount = s => s.trim().split(/\s+/).filter(Boolean).length;

function toast(text, kind = '') {
  const el = $('toast');
  el.textContent = text;
  el.className = `toast show ${kind}`;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { el.className = 'toast'; }, 2600);
}

// Seeded shuffle, so each try has its own option order that stays the same after a reload
function shuffle(n, seed) {
  let s = seed >>> 0;
  const rnd = () => {
    let t = s += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function content(item, scale = 1.3) {
  if (item.block) return blockPicture(item.block, scale);
  if (item.svg) return item.svg;
  return `<span class="card-text">${fmt(item.text)}</span>`;
}

// ---------- Screens ----------
function render() {
  if (view == 'question' && state.current) renderQuestion();
  else if (view == 'result' && state.tries.length) renderResult(state.tries.length - 1);
  else renderStart();
}

function renderStart() {
  const tries = state.tries;
  app.innerHTML = `
    <section class="start">
      <div class="eyebrow">Robot Lab · Quiz</div>
      <h1>How well do you know your robot?</h1>
      <p class="lead">${N} questions on blocks, sensors, loops and flowcharts. Some are drag and drop. About 20 minutes.</p>
      <label class="name">${CONFIG.online ? 'Type the start of your name, then tap your name' : 'Your first and last name'}
        <input id="name" autocomplete="off" spellcheck="false" value="${esc(state.name)}" placeholder="${CONFIG.online ? 'e.g. Sam' : 'e.g. Sam Taylor'}">
      </label>
      ${CONFIG.online ? '<div class="suggest" id="suggest" role="listbox"></div>' : ''}
      <p class="error" id="name-error"></p>
      <div class="row">
        <button class="btn run big" data-act="start">${tries.length ? 'Start a new try →' : 'Start the quiz →'}</button>
        ${tries.length ? '<button class="btn big" data-act="last">See my last result</button>' : ''}
      </div>
      ${tries.length ? `<p class="muted">Your tries: ${tries.map((t, i) => `#${i + 1} ${t.score}/${t.total}`).join(' · ')}</p>` : ''}
    </section>`;
  $('name').focus();
}

function start() {
  const name = $('name').value.trim().replace(/\s+/g, ' ');
  // Online: the name must be one picked from the class list (unless the list can't be reached)
  if (CONFIG.online && name != state.picked && !lookup.failed) {
    $('name-error').textContent = 'Start typing your name, then tap your full name in the list.';
    $('name').focus();
    return;
  }
  if (wordCount(name) < 2) {
    $('name-error').textContent = 'Please type your first and last name.';
    $('name').focus();
    return;
  }
  if (state.name && name != state.name) state.tries = [];   // someone else on this computer
  state.name = name;
  const seed = Date.now();
  state.current = {
    startedAt: seed, index: 0, answers: {},
    order: Object.fromEntries(QUESTIONS.map((q, i) => {
      const n = (q.options || q.items).length;
      let perm = shuffle(n, seed + i * 7919);
      if (q.type == 'order' && perm.every((x, k) => x == k)) perm = perm.reverse();   // never start in the right order
      return [q.id, perm];
    })),
  };
  picked = null;
  view = 'question';
  save();
  render();
  window.scrollTo(0, 0);
}

function renderQuestion() {
  const cur = state.current;
  const q = QUESTIONS[cur.index];
  const a = cur.answers[q.id];
  const answered = QUESTIONS.filter(x => isAnswered(x, cur.answers[x.id])).length;
  const last = cur.index == N - 1;
  app.innerHTML = `
    <div class="q-progress" aria-label="Questions">${QUESTIONS.map((x, i) =>
      `<button class="dot${i == cur.index ? ' now' : ''}${isAnswered(x, cur.answers[x.id]) ? ' done' : ''}" data-go="${i}" title="Question ${i + 1}" aria-label="Question ${i + 1}">${i + 1}</button>`).join('')}</div>
    <article class="q-card">
      <div class="eyebrow">Question ${cur.index + 1} of ${N}${q.type == 'choice' ? '' : ' · drag and drop'}</div>
      <h2 class="q-prompt">${fmt(q.prompt)}</h2>
      ${q.figure ? `<div class="q-figure">${content(q.figure, 1.5)}</div>` : ''}
      ${body(q, a, cur.order[q.id])}
      ${q.type == 'choice' ? '' : '<p class="how">Drag the cards. Or tap a card, then tap where it goes.</p>'}
    </article>
    <nav class="q-nav">
      <button class="btn" data-act="back" ${cur.index == 0 ? 'disabled' : ''}>← Back</button>
      <span class="muted">${answered} of ${N} answered</span>
      ${last ? '<button class="btn run" data-act="finish">Finish ✓</button>' : '<button class="btn run" data-act="next">Next →</button>'}
    </nav>`;
}

function body(q, a, perm) {
  if (q.type == 'choice') {
    const pics = q.options.map(o => content(o));
    const blocks = q.options.some(o => o.block);
    // Long blocks get a row each, so they keep their full size instead of shrinking into two columns
    const long = pics.some(h => +(h.match(/<svg[^>]* width="(\d+)"/)?.[1] || 0) > 400);
    return `<div class="options${blocks ? ' blocks' : ''}${long ? ' long' : ''}">${perm.map((orig, k) =>
      `<button class="opt${a === orig ? ' on' : ''}" data-opt="${orig}" aria-pressed="${a === orig}"><span class="letter">${'ABCD'[k]}</span><span class="opt-body">${pics[orig]}</span></button>`).join('')}</div>`;
  }
  const card = i => `<button class="card${picked === i ? ' picked' : ''}" data-item="${i}">${content(q.items[i], 1.3)}</button>`;
  const placed = new Set(q.type == 'order' ? (a || []).filter(x => x != null)
    : q.type == 'sort' ? Object.keys(a || {}).map(Number) : a != null ? [a] : []);
  const loose = perm.filter(i => !placed.has(i));
  const tray = `<div class="zone tray" data-zone="tray">${loose.length ? loose.map(card).join('') : '<span class="empty">All cards placed</span>'}</div>`;
  if (q.type == 'order') {
    return `<div class="board order">${tray}<ol class="slots">${q.items.map((_, i) =>
      `<li class="zone slot" data-zone="s${i}"><span class="num">${i + 1}</span>${a?.[i] != null ? card(a[i]) : '<span class="empty">Drop here</span>'}</li>`).join('')}</ol></div>`;
  }
  if (q.type == 'sort') {
    return `<div class="board sort">${tray}<div class="groups" style="--n:${q.groups.length}">${q.groups.map(g =>
      `<div class="zone group" data-zone="g:${g.id}"><div class="group-head">${g.svg || `<strong>${esc(g.label)}</strong><span>${esc(g.note)}</span>`}</div>
        <div class="group-cards">${q.items.map((_, i) => i).filter(i => a?.[i] == g.id).map(card).join('') || '<span class="empty">Drop here</span>'}</div></div>`).join('')}</div></div>`;
  }
  return `<div class="board gap"><div class="zone slot gap-slot" data-zone="gap"><span class="num">?</span>${a != null ? card(a) : '<span class="empty">Drop the missing block here</span>'}</div>${tray}</div>`;
}

// Move a card to a zone ('tray', 's<slot>', 'g:<group>' or 'gap')
function place(q, item, zone) {
  const cur = state.current;
  let a = cur.answers[q.id];
  if (q.type == 'order') {
    a = a ? [...a] : Array(q.items.length).fill(null);
    const from = a.indexOf(item);
    if (from >= 0) a[from] = null;
    if (zone[0] == 's') {
      const k = +zone.slice(1);
      const other = a[k];
      a[k] = item;
      if (other != null && from >= 0) a[from] = other;        // swap places
    }
  } else if (q.type == 'sort') {
    a = { ...(a || {}) };
    const from = a[item];
    delete a[item];
    if (zone.startsWith('g:')) {
      const g = zone.slice(2);
      if (q.oneEach) {                                         // one card per shape: swap the one already there
        const other = Object.keys(a).find(k => a[k] == g);
        if (other != null) { if (from) a[other] = from; else delete a[other]; }
      }
      a[item] = g;
    }
  } else {
    a = zone == 'gap' ? item : a === item ? null : a;
  }
  cur.answers[q.id] = a;
  save();
  render();
}

function finish(anyway = false) {
  const cur = state.current;
  const missing = QUESTIONS.flatMap((q, i) => isAnswered(q, cur.answers[q.id]) ? [] : [i]);
  if (missing.length && !anyway) return askFinish(missing);
  const s = score(QUESTIONS, cur.answers);
  state.tries.push({ startedAt: cur.startedAt, finishedAt: Date.now(), answers: cur.answers, order: cur.order, score: s.score, total: s.total });
  state.current = null;
  save();
  progress.markDone('quiz');
  view = 'result';
  render();
  window.scrollTo(0, 0);
  if (CONFIG.online) sendTry(state.tries.length - 1);
}

// Some questions are empty: say which ones (tap a number to go there), or finish anyway.
// An in-page box rather than the browser's pop-up, so it's big and clear.
function askFinish(missing) {
  const none = missing.length == N, many = missing.length == 1 ? '1 question' : `${missing.length} questions`;
  const box = document.createElement('div');
  box.className = 'modal-back';
  box.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <h2 id="modal-title">${none ? 'You haven’t answered any questions yet' : `${many} still empty`}</h2>
      <p>${none ? 'Start at question 1. Your answers save as you go.' : 'Tap a number to go back to it. Empty questions get no marks.'}</p>
      ${none ? '' : `<div class="modal-dots">${missing.map(i => `<button class="dot" data-go="${i}" aria-label="Question ${i + 1}">${i + 1}</button>`).join('')}</div>`}
      <div class="modal-actions">
        <button class="btn" data-act="finish-anyway">Finish anyway</button>
        <button class="btn run" data-go="${missing[0]}">Go to question ${missing[0] + 1} →</button>
      </div>
    </div>`;
  app.append(box);
  box.querySelector('.btn.run').focus();
}

// ---------- Online: names from the class list, and sending each try to the teacher ----------
const lookup = { timer: null, failed: false, seq: 0 };

async function suggestNames() {
  const box = $('suggest');
  if (!box) return;
  const q = $('name').value.trim();
  if (q != state.picked) state.picked = null;
  if (q.length < 2) { box.innerHTML = ''; return; }
  const seq = ++lookup.seq;
  try {
    const r = await fetch(`/api/names?q=${encodeURIComponent(q)}`);
    if (!r.ok) throw new Error(r.status);
    const { names } = await r.json();
    if (seq != lookup.seq) return;                      // an older search came back late
    lookup.failed = false;
    box.innerHTML = names.length
      ? names.map(n => `<button class="sug${n == state.picked ? ' on' : ''}" data-pick="${esc(n)}" role="option">${esc(n)}</button>`).join('')
      : '<span class="muted small">No match yet. Check the spelling.</span>';
  } catch {
    lookup.failed = true;                               // no class list: type the full name instead
    box.innerHTML = '<span class="muted small">Can’t load the class list. Type your first and last name.</span>';
  }
}

async function sendTry(t) {
  const tryData = state.tries[t];
  tryData.sending = true;
  if (view == 'result') render();
  try {
    const r = await fetch('/api/quiz-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: state.name, try: t + 1, startedAt: tryData.startedAt, finishedAt: tryData.finishedAt,
        score: tryData.score, total: tryData.total, answers: tryData.answers,
      }),
    });
    if (!r.ok) throw new Error(r.status);
    tryData.sent = Date.now();
  } catch {
    tryData.sent = null;
  }
  tryData.sending = false;
  save();
  if (view == 'result') render();
}

function renderResult(t) {
  const tryData = state.tries[t];
  const s = score(QUESTIONS, tryData.answers);
  const pct = s.score / s.total;
  const message = pct >= 0.9 ? 'Excellent! You really know your robot.'
    : pct >= 0.7 ? 'Nice work! Check the ✗ ones below.'
      : pct >= 0.5 ? 'Good start. Read the ✗ ones, then have another go.'
        : 'Have another look at the missions, then try again.';
  const topics = Object.entries(TOPICS).map(([id, tp]) => {
    const qs = s.per.filter(p => p.topic == id);
    const right = qs.filter(p => p.correct).length;
    return `<div class="topic"><span>${tp.title}</span><span class="bar"><i style="width:${Math.round(right / qs.length * 100)}%"></i></span><b>${right}/${qs.length}</b></div>`;
  }).join('');
  const when = new Date(tryData.finishedAt).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' });
  const sendLine = !CONFIG.online ? ''
    : tryData.sending ? '<p class="send-status">Sending to your teacher…</p>'
      : tryData.sent ? '<p class="send-status ok">✓ Sent to your teacher</p>'
        : `<p class="send-status bad">Not sent yet. <button class="btn small" data-act="send" data-try="${t}">Send again</button> <button class="link-btn" data-act="submit">or download the file</button></p>`;
  app.innerHTML = `
    <section class="result">
      <div class="score-card">
        <div class="result-name">${esc(state.name)}</div>
        <div class="muted">Robot Lab Quiz · try ${t + 1} · ${when}</div>
        <div class="scores">
          <div class="score-box"><span>Score</span><div class="score-num">${s.score}<small> / ${s.total}</small></div></div>
          <div class="score-box twenty"><span>Out of 20</span><div class="score-num">${outOf20(s.score, s.total)}<small> / 20</small></div></div>
        </div>
        <p>${message}</p>
        ${sendLine}
        <div class="row">
          ${CONFIG.online ? '' : '<button class="btn submit big" data-act="submit">✓ Submit</button>'}
          <button class="btn big" data-act="again">↺ Try again</button>
        </div>
        ${CONFIG.online ? '' : '<p class="muted small">Submit downloads your result file. Hand it in the same way as your missions.</p>'}
      </div>
      <div class="topics">${topics}</div>
      <h3>Check your answers</h3>
      <ol class="review">${QUESTIONS.map((q, i) => reviewRow(q, i, tryData.answers[q.id])).join('')}</ol>
    </section>`;
}

function reviewRow(q, i, a) {
  const ok = isCorrect(q, a);
  const m = marks(q, a);
  let right = '';
  if (!ok) {
    if (q.type == 'choice') right = `<div class="right-answer"><span>Right answer:</span>${content(q.options[q.answer], 0.8)}</div>`;
    else if (q.type == 'gap') right = `<div class="right-answer"><span>Right answer:</span>${content(q.items[q.answer], 0.8)}</div>`;
    else if (q.type == 'order') right = `<div class="right-answer"><span>Right order (${m.right} of ${m.of} in the right place):</span><ol>${q.items.map(it => `<li>${content(it, 0.75)}</li>`).join('')}</ol></div>`;
    else right = `<div class="right-answer"><span>${m.right} of ${m.of} in the right group.</span></div>`;
  }
  return `<li class="${ok ? 'ok' : 'bad'}"><span class="mark">${ok ? '✓' : '✗'}</span><div>
      <div class="review-q"><b>${i + 1}.</b> ${fmt(q.prompt)}${isAnswered(q, a) ? '' : ' <em>(not answered)</em>'}</div>
      ${ok ? '' : `${right}<p class="explain">${esc(q.explain)}</p>`}
    </div></li>`;
}

// ---------- The result file (readable summary on top, data underneath) ----------
const DATA_MARK = '===== DATA (JSON) =====';

// One line of text for a block, so the teacher can read answers without the quiz open
function blockText(b) {
  if (!b) return '___';
  const n = name => b.inputs?.[name]?.shadow?.fields?.NUM ?? b.inputs?.[name]?.block?.fields?.NUM;
  const inner = name => blockText(b.inputs?.[name]?.block);
  const body = name => (b.inputs?.[name]?.block ? stackText(b.inputs[name].block) : '');
  const one = {
    move_tank_for: () => `tank ${n('left')} ${n('right')} for ${n('duration')} ${b.fields.units.toLowerCase()}`,
    move_tank: () => `tank ${n('left')} ${n('right')}`,
    move_cm: () => `move ${b.fields.DIR == 'FWD' ? 'forward' : 'backward'} ${n('CM')} cm`,
    spin_deg: () => `spin ${b.fields.DIR.toLowerCase()} ${n('DEG')}°`,
    stop: () => 'stop', safety_sound: () => 'safety sound', fork_up: () => 'lift fork', fork_down: () => 'lower fork',
    say: () => `say "${b.inputs.TEXT.shadow.fields.TEXT}"`,
    color_sees: () => `sees ${b.fields.COLOR.toLowerCase()}`,
    touch_pressed: () => 'touch pressed',
    logic_compare: () => `distance ${{ LT: '<', GT: '>', LTE: '≤', GTE: '≥', EQ: '=' }[b.fields.OP]} ${n('B')}`,
    wait_until: () => `wait until ${inner('value')}`,
    controls_if: () => `if ${inner('IF0')} [${body('DO0')}]${b.extraState?.hasElse ? ` else [${body('ELSE')}]` : ''}`,
    controls_repeat_ext: () => `repeat ${n('TIMES')} [${body('DO')}]`,
    controls_whileUntil: () => `repeat until ${inner('BOOL')} [${body('DO')}]`,
    forever: () => `forever [${body('DO')}]`,
    when_started: () => 'when started',
  }[b.type];
  return one ? one() : b.type;
}
function stackText(b) {
  const out = [];
  for (let x = b; x; x = x.next?.block) out.push(blockText(x));
  return out.join('; ');
}
const itemText = it => (it.block ? stackText(it.block) : it.text ?? it.group ?? '');

function answerText(q, a) {
  if (!isAnswered(q, a) && (a == null || q.type == 'choice' || q.type == 'gap')) return '(not answered)';
  if (q.type == 'choice') return itemText(q.options[a]);
  if (q.type == 'gap') return itemText(q.items[a]);
  if (q.type == 'order') return a.map((x, i) => `${i + 1}) ${x == null ? '___' : itemText(q.items[x])}`).join('  ');
  return q.groups.map(g => `${g.label || g.id}: ${q.items.map((it, i) => (a[i] == g.id ? itemText(it) : null)).filter(Boolean).join(', ') || '—'}`).join(' | ');
}

function buildFile() {
  const now = new Date();
  const tries = state.tries.map((t, i) => {
    const s = score(QUESTIONS, t.answers);
    return {
      try: i + 1,
      startedAt: new Date(t.startedAt).toISOString(),
      finishedAt: new Date(t.finishedAt).toISOString(),
      minutes: Math.round((t.finishedAt - t.startedAt) / 60000),
      score: s.score, total: s.total,
      questions: QUESTIONS.map((q, k) => ({
        n: k + 1, id: q.id, topic: TOPICS[q.topic].title, code: TOPICS[q.topic].code,
        correct: s.per[k].correct, parts: s.per[k].parts, answer: answerText(q, t.answers[q.id]),
      })),
    };
  });
  const data = { format: FORMAT, type: 'quiz', name: state.name, quiz: { id: 'robot-lab-quiz', questions: N }, savedAt: now.toISOString(), localTime: now.toLocaleString('en-AU'), tries };
  data.check = fnv1a(JSON.stringify(data));
  const first = tries[0], best = tries.reduce((b, t) => (t.score > b.score ? t : b), first);
  const byTopic = t => Object.entries(TOPICS).map(([id, tp]) => {
    const qs = t.questions.filter((_, k) => QUESTIONS[k].topic == id);
    return `  ${tp.title.padEnd(28)} ${tp.code.padEnd(10)} ${qs.filter(x => x.correct).length}/${qs.length}`;
  });
  const lines = [
    'ROBOT LAB · QUIZ RESULT', '',
    `Name:      ${state.name}`,
    `Saved:     ${data.localTime}`, '',
    `First try: ${first.score} / ${first.total} (${Math.round(first.score / first.total * 100)}%) · ${outOf20(first.score, first.total)} / 20 · ${first.minutes} min`,
    `Best try:  ${best.score} / ${best.total} · ${outOf20(best.score, best.total)} / 20 (try ${best.try} of ${tries.length})`, '',
    'BY TOPIC (first try)',
    ...byTopic(first), '',
    'QUESTIONS (first try)',
    ...first.questions.map(x => {
      const q = QUESTIONS[x.n - 1];
      const extra = x.correct ? '' : `   right: ${q.type == 'choice' ? itemText(q.options[q.answer]) : q.type == 'gap' ? itemText(q.items[q.answer]) : `${x.parts.right}/${x.parts.of} parts right`}`;
      return `  ${String(x.n).padStart(2)}. ${x.correct ? '✓' : '✗'} ${plain(q.prompt)}\n        chose: ${x.answer}${extra}`;
    }), '',
    'ALL TRIES',
    ...tries.map(t => `  #${t.try}  ${new Date(t.finishedAt).toLocaleString('en-AU')}  ${t.score}/${t.total}  ${t.minutes} min`), '',
    DATA_MARK,
    JSON.stringify(data, null, 1), '',
  ];
  return lines.join('\n');
}

// ---------- Clicks and drags ----------
let drag = null;
let skipClick = false;

app.addEventListener('pointerdown', e => {
  const el = e.target.closest('.card');
  if (!el || e.button > 0) return;
  drag = { el, item: +el.dataset.item, x: e.clientX, y: e.clientY, id: e.pointerId, ghost: null, over: null };
  el.setPointerCapture(e.pointerId);
});

app.addEventListener('pointermove', e => {
  if (!drag || e.pointerId != drag.id) return;
  if (!drag.ghost) {
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
    const r = drag.el.getBoundingClientRect();
    drag.dx = drag.x - r.left;
    drag.dy = drag.y - r.top;
    drag.ghost = drag.el.cloneNode(true);
    drag.ghost.classList.add('ghost');
    drag.ghost.style.width = `${r.width}px`;
    document.body.append(drag.ghost);
    drag.el.classList.add('lifted');
    picked = null;
  }
  drag.ghost.style.transform = `translate(${e.clientX - drag.dx}px, ${e.clientY - drag.dy}px)`;
  const zone = document.elementFromPoint(e.clientX, e.clientY)?.closest('.zone') || null;
  if (zone !== drag.over) {
    drag.over?.classList.remove('over');
    zone?.classList.add('over');
    drag.over = zone;
  }
});

function endDrag(e) {
  if (!drag || e.pointerId != drag.id) return;
  const d = drag;
  drag = null;
  if (!d.ghost) return;                                   // just a tap: the click handler deals with it
  d.ghost.remove();
  skipClick = true;
  setTimeout(() => { skipClick = false; }, 0);
  const q = QUESTIONS[state.current.index];
  if (d.over) place(q, d.item, d.over.dataset.zone);
  else render();
}
app.addEventListener('pointerup', endDrag);
app.addEventListener('pointercancel', endDrag);

app.addEventListener('click', e => {
  if (skipClick) return;
  const t = e.target;
  if (t.classList.contains('modal-back')) return t.remove();          // tap outside the box closes it
  const act = t.closest('[data-act]')?.dataset.act;
  const pick = t.closest('[data-pick]');
  if (pick) {
    state.picked = pick.dataset.pick;
    $('name').value = state.picked;
    $('name-error').textContent = '';
    $('suggest').innerHTML = `<span class="picked-name">✓ ${esc(state.picked)}</span>`;
    return;
  }
  if (act == 'send') return sendTry(+t.closest('[data-try]').dataset.try);
  if (act == 'start') return start();
  if (act == 'last') { view = 'result'; return render(); }
  if (act == 'again') { view = 'start'; return render(); }
  if (act == 'submit') {
    download(`Robot Lab Quiz - ${safeName(state.name)}.txt`, buildFile());
    return toast('Result file downloaded');
  }
  const cur = state.current;
  if (!cur) return;
  const q = QUESTIONS[cur.index];
  const go = t.closest('[data-go]');
  if (go || act == 'next' || act == 'back') {
    cur.index = go ? +go.dataset.go : cur.index + (act == 'next' ? 1 : -1);
    picked = null;
    save();
    render();
    return window.scrollTo(0, 0);
  }
  if (act == 'finish') return finish();
  if (act == 'finish-anyway') return finish(true);
  const opt = t.closest('[data-opt]');
  if (opt) {
    cur.answers[q.id] = +opt.dataset.opt;
    save();
    return render();
  }
  // Tap a card to pick it up, then tap a place (or another card) to put it there
  const cardEl = t.closest('.card');
  const zoneEl = t.closest('.zone');
  if (cardEl) {
    const item = +cardEl.dataset.item;
    if (picked == null || picked == item) { picked = picked == item ? null : item; return render(); }
    const pickedZone = app.querySelector(`.card[data-item="${picked}"]`)?.closest('.zone')?.dataset.zone;
    if (pickedZone == zoneEl.dataset.zone) { picked = item; return render(); }
  }
  if (zoneEl && picked != null) {
    const p = picked;
    picked = null;
    return place(q, p, zoneEl.dataset.zone);
  }
});

app.addEventListener('keydown', e => {
  if (e.key != 'Enter' || e.target.id != 'name') return;
  const first = document.querySelector('[data-pick]');
  if (CONFIG.online && first && $('name').value.trim() != state.picked) first.click();     // Enter picks the top name
  else start();
});
document.addEventListener('keydown', e => { if (e.key == 'Escape') app.querySelector('.modal-back')?.remove(); });
app.addEventListener('input', e => {
  if (e.target.id != 'name' || !CONFIG.online) return;
  clearTimeout(lookup.timer);
  lookup.timer = setTimeout(suggestNames, 150);
});

render();
// Online: send any try that didn't reach the teacher last time
if (CONFIG.online) state.tries.forEach((t, i) => { if (t.sent === null) sendTry(i); });
