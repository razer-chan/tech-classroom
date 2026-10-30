// Mission page: blocks on the left, simulator on the right.
import { makeToolbox, STARTER, generateProgram, codeFeatures, mainStackBlock } from './blocks.js?v=4636962f';
import { buildWorld, ZONE_COLORS } from './world.js?v=4636962f';
import { Sim } from './sim.js?v=4636962f';
import { Runner, advance, WATCH_AFTER } from './runner.js?v=4636962f';
import { View3D } from './view3d.js?v=4636962f';
import { MISSIONS, MAX_MINOR, findMission, createTracker, progress, store } from './missions.js?v=4636962f';
import { buildFile, parseFile, download, safeName, summarise, shortResult } from './report.js?v=4636962f';

const $ = id => document.getElementById(id);
const Blockly = window.Blockly;

const mission = findMission(new URLSearchParams(location.search).get('m'));
const isExam = mission.goal.type == 'exam';
document.title = `${mission.title} · Robot Lab`;
$('mission-number').textContent = `Mission ${mission.number}`;
$('mission-title').textContent = mission.title;
document.body.classList.toggle('exam-mode', isExam);

// ---------- Blocks ----------
const theme = Blockly.Theme.defineTheme('lab', { base: Blockly.Themes.Classic, startHats: true });
const workspace = Blockly.inject('blockly', {
  toolbox: makeToolbox(mission),
  theme,
  media: 'vendor/blockly/media/',
  zoom: { controls: true, startScale: 0.9 },
  move: { wheel: true },
  trashcan: true,
  grid: { spacing: 24, length: 2, colour: '#dfe7e3', snap: true },
});
workspace.addChangeListener(Blockly.Events.disableOrphans);

const codeKey = id => `code:${id}`;
const statsKey = id => `stats:${id}`;
const saveCode = () => store.write(codeKey(mission.id), Blockly.serialization.workspaces.save(workspace));

function loadCode(state) {
  try {
    Blockly.serialization.workspaces.load(state || store.read(codeKey(mission.id), null) || STARTER, workspace);
  } catch {
    Blockly.serialization.workspaces.load(STARTER, workspace);
  }
}
loadCode();
workspace.addChangeListener(e => { if (!e.isUiEvent) saveCode(); });

// ---------- Effort stats (this computer; also carried inside saved files) ----------
const readStats = id => ({ runs: 0, seconds: 0, firstOpened: new Date().toISOString(), history: [], hints: {}, demos: 0, ...store.read(statsKey(id), {}) });
let stats = readStats(mission.id);
const writeStats = () => store.write(statsKey(mission.id), stats);
writeStats();
setInterval(() => {
  if (document.visibilityState == 'visible') { stats.seconds += 10; writeStats(); }
}, 10000);

function mergeStats(local, incoming = {}) {
  const byTime = new Map([...(incoming.history || []), ...local.history].map(h => [h.at, h]));
  const history = [...byTime.values()].sort((a, b) => a.at.localeCompare(b.at)).slice(-300);
  const hints = { ...local.hints };
  for (const [k, v] of Object.entries(incoming.hints || {})) hints[k] = Math.max(hints[k] || 0, v);
  return {
    runs: Math.max(local.runs, incoming.runs || 0, history.length),
    seconds: Math.max(local.seconds, (incoming.minutesOnMission || 0) * 60),
    firstOpened: [local.firstOpened, incoming.firstOpened].filter(Boolean).sort()[0],
    history,
    hints,
    demos: Math.max(local.demos || 0, incoming.demos || 0),
  };
}

// ---------- Simulator ----------
const newSeed = () => 1 + Math.floor(Math.random() * 1e6);
const world = buildWorld(mission.world);
const sim = new Sim(world, newSeed());
const view = new View3D($('view'), world);
document.querySelectorAll('.fork-only').forEach(el => { el.hidden = !sim.fork; });

const tracker = createTracker(mission, world, {
  onChange: renderGoal,
  onMissedSound: dir => toast(`Safety sound first! Play it before the fork goes ${dir}.`, 'warn'),
  onFault: f => {
    view.addPin(f.x, f.y, f.critical, f.z || 0);
    if (f.critical) pauseForError(f);
    else toast(`Minor: ${f.text}`, 'warn');
  },
  onFinish: () => {
    if (isExam) {
      showResult();
    } else {
      progress.markDone(mission.id);
      $('win-detail').textContent = `${sim.time.toFixed(1)} s · ${sim.bumps} bump${sim.bumps == 1 ? '' : 's'}`;
      setTimeout(() => { $('win').hidden = false; }, 400);
    }
  },
});

let currentRun = null;
let demo = null;            // the "Show me" replay, when one is playing
const runner = new Runner(sim, {
  onHighlight: id => {
    if (!id) {
      // Program ended: keep the block that caused an error lit up
      workspace.highlightBlock(errorState?.blockId || null);
      return;
    }
    workspace.highlightBlock(id);
    lastId = id;
    const top = mainStackBlock(workspace.getBlockById(id));
    if (top) {
      if (top.id == id) snapshots.set(id, takeSnapshot());
      lastTopId = top.id;
    }
  },
  onSay: text => { showBubble(text); tracker.say?.(text, sim); },
  onTone: (hz, seconds) => { playTone(hz, seconds); tracker.sound?.(); },
  onFork: dir => tracker.fork?.(dir, sim),
  onEnd: result => {
    setRunning(false);
    tracker.update(sim);      // the robot has stopped: lets "stop on Blue" count
    result.endedAt = sim.time;
    // In the test, the examiner keeps watching the stopped robot for a moment (see the clock below)
    if (isExam && result.ok && !result.stopped && !tracker.finished) watching = { left: WATCH_AFTER, result };
    else endRun(result);
  },
});

// The run is over (after the examiner's last look): save it in the history and say how it went
let watching = null;          // { left, result } while the examiner watches the stopped robot
function endRun(result, quiet = false) {
  watching = null;
  if (currentRun) {
    const summary = summarise(mission, sim, tracker);
    stats.history.push({ ...currentRun, result: shortResult(summary), complete: summary.complete, bumps: sim.bumps, seconds: Math.round(result.endedAt * 10) / 10, stopped: !!result.stopped });
    stats.history = stats.history.slice(-300);
    writeStats();
    currentRun = null;
  }
  if (quiet) return;
  if (!result.ok) {
    console.error(result.error);
    toast('Something went wrong in the program', 'bad');
  } else if (isExam && !tracker.finished && !result.stopped) {
    toast(`Test not finished: ${tracker.stepIndex} of ${world.steps.length} steps done`);
  }
}

// ---------- Goal / exam panel ----------
// Mission brief (can be folded away) with progress chips underneath
let briefOpen = store.read('briefOpen', true);
function renderGoal() {
  if (isExam) return renderExam();
  const chips = tracker.chips().map(c => {
    const colour = ZONE_COLORS[c.color] || '#8a9a95';
    // Two little pips for the maze: got there · said it
    const parts = c.parts ? `<span class="pips" title="Got there · Said it">${c.parts.map(p => `<i class="${p ? 'on' : ''}"></i>`).join('')}</span>` : '';
    const icon = c.stop ? '■' : c.sound ? '🔊' : '';
    return `<span class="chip ${c.done ? 'done' : ''} ${c.bad ? 'bad' : ''}"><span class="dot ${c.pallet ? 'crate' : ''}" style="background:${colour}">${c.done ? '' : icon}</span>${c.label}${parts}</span>`;
  });
  // Checkpoints go in order (arrows); pallets can go in any order
  const join = mission.goal.type == 'checkpoints' ? '<span class="arrow">→</span>' : ' ';
  $('goal').innerHTML = `
    <div class="brief-head">
      <div><span class="eyebrow">Mission ${mission.number} · brief</span><strong>${mission.title}</strong></div>
      <button class="btn small" data-brief aria-expanded="${briefOpen}">${briefOpen ? 'Hide ▴' : 'Brief ▾'}</button>
    </div>
    ${briefOpen ? `<ol class="brief-steps">${mission.brief.map(b => `<li>${b}</li>`).join('')}</ol>` : ''}
    <div class="brief-chips">${chips.join(join)}</div>
    <span class="tip">${mission.tips.join(' · ')}</span>`;
}
if (!isExam) {
  $('goal').addEventListener('click', e => {
    if (!e.target.closest('[data-brief]')) return;
    briefOpen = !briefOpen;
    store.write('briefOpen', briefOpen);
    renderGoal();
  });
}

// Driving test: a little book of steps. Flip through every step's job and its hints;
// it turns to the next page by itself when a step is done.
let hintOpen = false;
let viewStep = 0;
let seenStep = 0;
if (isExam) {
  $('goal').addEventListener('click', e => {
    const dot = e.target.closest('[data-step]');
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (dot) turnTo(+dot.dataset.step);
    else if (act == 'prev') turnTo(viewStep - 1);
    else if (act == 'next') turnTo(viewStep + 1);
    else if (act == 'hint') { hintOpen = !hintOpen; if (hintOpen) countHint(); renderExam(); }
    else if (act == 'show') playDemo(viewStep, viewStep);
    else if (act == 'all') playDemo(0, world.steps.length - 1);
  });
}
function turnTo(i) {
  const next = Math.max(0, Math.min(world.steps.length - 1, i));
  if (next == viewStep) return;
  viewStep = next;
  if (hintOpen) countHint();
  renderExam();
}
function countHint() {
  const id = world.steps[viewStep].id;
  stats.hints[id] = (stats.hints[id] || 0) + 1;
  writeStats();
}

function renderExam() {
  const steps = world.steps;
  if (tracker.stepIndex != seenStep) {            // a step was done (or Reset): turn to the current page
    seenStep = tracker.stepIndex;
    viewStep = Math.min(tracker.stepIndex, steps.length - 1);
  }
  const i = viewStep;
  const step = steps[i];
  const status = i < tracker.stepIndex ? 'done' : i == tracker.stepIndex ? 'now' : 'later';
  const badge = { done: '✓ Done', now: '● Now', later: 'Coming up' }[status];
  const { critical, minor } = tracker.counts();
  const dots = steps.map((s, k) => `<button class="${k < tracker.stepIndex ? 'done' : k == tracker.stepIndex ? 'now' : ''} ${k == i ? 'view' : ''}" data-step="${k}" title="${k + 1} · ${s.title}" aria-label="Step ${k + 1}: ${s.title}"></button>`).join('');
  const hints = (mission.hints[step.id] || []).map(q => `<li>${q}</li>`).join('');
  $('goal').innerHTML = `
    <div class="book-head">
      <button class="icon-btn" data-act="prev" ${i == 0 ? 'disabled' : ''} aria-label="Previous step">‹</button>
      <div class="book-title">
        <span class="eyebrow">Step ${i + 1} of ${steps.length} <span class="badge ${status}">${badge}</span></span>
        <strong>${step.title}</strong>
      </div>
      <button class="icon-btn" data-act="next" ${i == steps.length - 1 ? 'disabled' : ''} aria-label="Next step">›</button>
    </div>
    <p class="exam-goal">${step.goal}</p>
    <div class="exam-dots">${dots}</div>
    <div class="exam-faults"><span class="${critical ? 'crit' : ''}">${critical} critical</span><span class="${minor > MAX_MINOR ? 'crit' : minor ? 'minor' : ''}">${minor} minor (max ${MAX_MINOR})</span></div>
    <button class="btn small hint-toggle ${hintOpen ? 'on' : ''}" data-act="hint" aria-expanded="${hintOpen}">${hintOpen ? 'Hide hints ▴' : '? Hints for this step ▾'}</button>
    ${hintOpen ? `<div class="exam-hint">
      <ul class="hint-questions">${hints}</ul>
      <div class="hint-actions"><button class="btn run small" data-act="show">▶ Show me</button><button class="link-btn" data-act="all">Show the whole test</button></div>
    </div>` : ''}
    ${tracker.finished ? `<p class="exam-done">${tracker.passed ? 'PASS' : 'Not yet'} · press Reset to start again.</p>` : ''}
    <span class="tip">${mission.tips.join(' · ')}</span>`;
}
renderGoal();

// ---------- Run / Stop / Reset ----------
function setRunning(on) {
  $('run').disabled = on || !!demo;
  $('stop').disabled = !on && !demo;
}

function reset(seed = newSeed()) {
  if (watching) endRun(watching.result, true);
  stopDemo();
  closeOops();
  clearWarnings();
  snapshots.clear();
  runner.stop();
  sim.reset(seed);
  lastBumps = 0;
  tracker.reset();
  view.clearPins();
  workspace.highlightBlock(null);
  showBubble('');
  $('win').hidden = true;
  $('result').hidden = true;
}

// Runs code from where the robot is now. Reset puts it back at the start.
function startRun(code) {
  if (code == null) {
    toast('Put your blocks under “When Started”', 'bad');
    return;
  }
  if (watching) endRun(watching.result, true);
  stopDemo();
  closeOops();
  clearWarnings();
  workspace.highlightBlock(null);
  $('win').hidden = true;
  $('result').hidden = true;
  audio();          // unlock sound on this click
  stats.runs++;
  currentRun = { at: new Date().toISOString(), blocks: codeFeatures(workspace).statements, seed: sim.seed };
  writeStats();
  setRunning(true);
  accumulator = 0;
  runner.run(code);
}
$('run').onclick = () => startRun(generateProgram(workspace));

// Right-click a block → "Run from here"
Blockly.ContextMenuRegistry.registry.register({
  id: 'robotlab_run_from_here',
  scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
  weight: -10,
  displayText: '▶ Run from here',
  preconditionFn: scope => (mainStackBlock(scope.block) ? (runner.running || demo ? 'disabled' : 'enabled') : 'hidden'),
  callback: scope => startRun(generateProgram(workspace, mainStackBlock(scope.block))),
});

// ---------- When something goes wrong: stop, show which block, offer to go back ----------
const snapshots = new Map();      // main-stack block id → the world just before it ran
let lastId = null;                // block running right now
let lastTopId = null;             // its block in the main stack
let errorState = null;            // { fault, blockId, topId, undone }
let warned = [];

const takeSnapshot = () => ({
  sim: sim.snapshot(), tracker: tracker.snapshot(), pins: view.pins.length,
  bubble: $('bubble').hidden ? '' : $('bubble').textContent,
});

function clearWarnings() {
  for (const id of warned) workspace.getBlockById(id)?.setWarningText(null);
  warned = [];
}
// Editing a block (or a number inside it) takes its warning away
workspace.addChangeListener(e => {
  if (e.type != Blockly.Events.BLOCK_CHANGE || !warned.length) return;
  let b = workspace.getBlockById(e.blockId);
  while (b && !warned.includes(b.id)) b = b.getSurroundParent();
  if (!b) return;
  b.setWarningText(null);
  warned = warned.filter(id => id != b.id);
});

const OOPS = {
  offroad: f => [(f.z || 0) > 8 ? 'Fell off the flyover!' : 'Off the road!',
    ['flyover', 'merge'].includes(f.step)
      ? 'Turning too tight or too wide? Change the gap between the left and right speeds. Stopping too soon or too late? Change the cm.'
      : 'Check the distance (cm) and the turn before this point.'],
  crash: f => ['Crash!', f.step == 'park'
    ? 'Turned in the wrong place? Count the bays (50 cm each). Only turn in a lane, not between the cars.'
    : 'Stop earlier: use the distance sensor, or a shorter distance.'],
  redlight: () => ['Ran a red light!', 'Wait until the colour sensor sees green before you cross the line.'],
  stopsign: () => ['Didn’t stop at the stop sign!', 'Stop on the red pad, then sleep for 2 seconds.'],
  bump: () => ['Bump!', mission.world.type == 'warehouse'
    ? 'Check your distances. A raised fork can’t slide under a pallet.'
    : 'Count the squares (40 cm each) and check which way it turns.'],
};

function pauseForError(f) {
  if (!runner.running || errorState) return;
  errorState = { fault: f, blockId: lastId, topId: lastTopId, undone: false };
  runner.stop();
  const block = lastId && workspace.getBlockById(lastId);
  if (block) {
    block.setWarningText(OOPS[f.type]?.(f)[1] || f.text);
    warned.push(block.id);
    workspace.highlightBlock(block.id);
    workspace.centerOnBlock(block.id);
  }
  renderOops();
}

function renderOops() {
  const { fault: f, undone, topId } = errorState;
  const [title, tip] = OOPS[f.type]?.(f) || [f.text, ''];
  const stepIdx = world.steps ? world.steps.findIndex(st => st.id == f.step) : -1;
  const where = stepIdx >= 0 ? `Step ${stepIdx + 1} · ${world.steps[stepIdx].title} · ${f.time} s` : `${(f.time ?? sim.time).toFixed?.(1) ?? f.time} s`;
  const canUndo = snapshots.has(topId);
  const prev = workspace.getBlockById(topId)?.getPreviousBlock();
  const canStepBack = undone && prev && snapshots.has(prev.id);
  $('oops').innerHTML = undone ? `
      <div class="oops-head"><span class="oops-icon back">↶</span><div><strong>Moved back</strong><span>to just before the highlighted block</span></div></div>
      <p>Fix that block, then run again from there. Was the mistake earlier? Step back one more block.</p>
      <div class="row"><button class="btn" data-oops="close">Close</button>${canStepBack ? '<button class="btn" data-oops="back1">↶ One more block back</button>' : ''}<button class="btn run" data-oops="runfrom">▶ Run from this block</button></div>`
    : `
      <div class="oops-head"><span class="oops-icon">!</span><div><strong>${title}</strong><span>${where}</span></div></div>
      <p>${tip}</p>
      <p class="small">The block that was running is highlighted.</p>
      <div class="row"><button class="btn" data-oops="close">Close</button>${canUndo ? '<button class="btn run" data-oops="undo">↶ Go back before this block</button>' : ''}</div>`;
  $('oops').hidden = false;
  placeOops();
}

// Keep the card off the robot: try the bottom middle, right, left, then the top
function placeOops() {
  const el = $('oops');
  const p = view.robotOnScreen(sim);
  const area = $('view').getBoundingClientRect();
  const x = area.left + p.x, y = area.top + p.y;
  for (const spot of ['', 'right', 'left', 'top']) {
    el.className = 'oops ' + spot;
    const box = el.getBoundingClientRect();
    if (y < box.top - 40 || y > box.bottom + 40 || x < box.left - 40 || x > box.right + 40) return;
  }
}

// Put the world back to just before a main-stack block ran
function goBackTo(id) {
  const snap = snapshots.get(id);
  sim.restore(snap.sim);
  lastBumps = sim.bumps;
  tracker.restore(snap.tracker);
  view.trimPins(snap.pins);
  showBubble(snap.bubble);
  Object.assign(errorState, { undone: true, topId: id });
  workspace.highlightBlock(id);
  workspace.centerOnBlock(id);
  renderOops();
}

function closeOops() {
  errorState = null;
  $('oops').hidden = true;
}

$('oops').addEventListener('click', e => {
  const act = e.target.closest('[data-oops]')?.dataset.oops;
  if (act == 'close') { closeOops(); workspace.highlightBlock(null); }
  if (act == 'undo') goBackTo(errorState.topId);
  if (act == 'back1') goBackTo(workspace.getBlockById(errorState.topId).getPreviousBlock().id);
  if (act == 'runfrom') {
    const block = workspace.getBlockById(errorState.topId);
    startRun(block ? generateProgram(workspace, block) : generateProgram(workspace));
  }
});
$('stop').onclick = () => { runner.stop(); stopDemo(); };
$('reset').onclick = () => reset();
$('win-close').onclick = () => { $('win').hidden = true; };

// ---------- Exam result card ----------
function showResult() {
  const { critical, minor } = tracker.counts();
  if (tracker.passed) progress.markDone(mission.id);
  const list = tracker.faults.map(f => `<li class="${f.critical ? 'crit' : ''}">${f.time} s · ${f.critical ? 'Critical' : 'Minor'}: ${f.text}</li>`).join('');
  $('result-card').className = 'card ' + (tracker.passed ? 'pass' : 'fail');
  $('result-card').innerHTML = tracker.passed ? `
      <div class="licence">
        <div class="plate">P</div>
        <div><span class="eyebrow">Robot Lab · Western Australia</span><h2>Driver’s licence</h2><p>Passed in ${tracker.finishedAt.toFixed(1)} s · ${minor} minor fault${minor == 1 ? '' : 's'}</p></div>
      </div>
      ${list ? `<ul class="fault-list">${list}</ul>` : '<p class="clean">A clean drive. No faults at all.</p>'}
      <div class="row"><button class="btn" data-close>Keep going</button><button class="btn run" data-submit>✓ Submit</button></div>`
    : `
      <span class="eyebrow">Test result</span>
      <h2>Not yet</h2>
      <p>${critical} critical · ${minor} minor fault${minor == 1 ? '' : 's'}. Fix these, then try again.</p>
      <ul class="fault-list">${list}</ul>
      <div class="row"><button class="btn" data-close>Close</button><button class="btn run" data-submit>✓ Submit anyway</button></div>`;
  $('result-card').querySelector('[data-close]').onclick = () => { $('result').hidden = true; };
  $('result-card').querySelector('[data-submit]').onclick = openSubmit;
  setTimeout(() => { $('result').hidden = false; }, 500);
}

// ---------- The ghost demo ----------
$('demo-stop').onclick = () => stopDemo();

// The demo replays the model answer in its own simulation, as a see-through car
async function playDemo(from, to) {
  if (watching) endRun(watching.result, true);
  stopDemo();
  runner.stop();            // the student's robot stays where it is
  stats.demos = (stats.demos || 0) + 1;
  writeStats();
  const dSim = new Sim(world, world.demoSeed ?? 1);
  const dTracker = createTracker(mission, world);
  const dRunner = new Runner(dSim);
  const token = {};
  demo = { sim: dSim, tracker: dTracker, runner: dRunner, to, token, playing: false, endAt: null };
  $('demo-label').textContent = from == to ? `Demo · Step ${from + 1}: ${world.steps[from].title}` : 'Demo · the whole test';
  $('demo-bar').hidden = false;
  if (errorState) $('oops').hidden = true;     // back when the demo ends
  setRunning(false);
  view.setGhost(true);
  dRunner.run(world.reference);
  // Skip quickly to the start of the step
  while (demo?.token == token && dRunner.running && dTracker.stepIndex < from) {
    for (let i = 0; i < 200 && dTracker.stepIndex < from && dRunner.running; i++) {
      await advance(dSim, dRunner, () => dTracker.update(dSim));
    }
    await new Promise(r => setTimeout(r, 0));
  }
  if (demo?.token != token) return;
  dSim.trail = [{ x: dSim.pose.x, y: dSim.pose.y, z: dSim.elev }];
  demo.playing = true;
}

function stopDemo() {
  if (!demo) return;
  demo.runner.stop();
  demo = null;
  view.setGhost(false);
  $('demo-bar').hidden = true;
  if (errorState) { $('oops').hidden = false; placeOops(); }
  setRunning(runner.running);
}

// ---------- Export / Import / Submit ----------
const today = () => new Date().toISOString().slice(0, 10);
const workspaceState = () => Blockly.serialization.workspaces.save(workspace);

$('export').onclick = async () => {
  const { text } = await buildFile({ type: 'save', mission, workspace: workspaceState(), stats });
  download(`${mission.title} - my code - ${today()}.txt`, text);
  toast('Exported. Use Import to load it next time.');
};

$('import').onclick = () => $('open-file').click();
$('open-file').onchange = async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  let data;
  try {
    data = parseFile(await file.text());
  } catch {
    toast('That isn’t a Robot Lab file', 'bad');
    return;
  }
  const target = MISSIONS.find(m => m.id == data.mission?.id) || mission;
  const merged = mergeStats(readStats(target.id), { ...data.stats, history: data.history });
  store.write(statsKey(target.id), merged);
  if (target.id != mission.id) {
    // Code for another mission: store it there and go
    store.write(codeKey(target.id), data.workspace);
    location.href = `mission.html?m=${target.id}`;
    return;
  }
  stats = merged;
  runner.stop();
  loadCode(data.workspace);
  saveCode();
  toast('Code imported');
};

const dialog = $('submit-dialog');
function openSubmit() {
  $('win').hidden = true;
  $('result').hidden = true;
  $('submit-error').hidden = true;
  $('student-name').value = store.read('name', '');
  dialog.showModal();
}
$('submit').onclick = openSubmit;
$('win-submit').onclick = openSubmit;

$('submit-form').addEventListener('submit', async e => {
  if (e.submitter?.value != 'ok') return;
  const name = safeName($('student-name').value);
  if (name.split(' ').length < 2) {
    e.preventDefault();
    $('submit-error').hidden = false;
    return;
  }
  store.write('name', name);
  $('submit-go').disabled = true;
  toast('Checking your code…');
  try {
    const { text } = await buildFile({ type: 'submission', name, mission, workspace: workspaceState(), stats });
    download(`${mission.title} - ${name}.txt`, text);
    toast('File downloaded. Hand it in!');
  } finally {
    $('submit-go').disabled = false;
  }
});

// ---------- Clock: fixed simulation steps, scaled by the speed buttons ----------
let speed = 1;
let accumulator = 0;
let pumping = false;
let lastBumps = 0;

// After every step of the student's own robot: examiner, plus bumps in the maze / forklift
// (checked right away, so the block that caused it is the one shown)
function afterMainStep() {
  tracker.update(sim);
  if (!isExam && sim.bumps > lastBumps) {
    lastBumps = sim.bumps;
    pauseForError({ type: 'bump', text: 'Bumped into something', critical: true, time: Math.round(sim.time * 10) / 10 });
  }
}

async function pump(s, r, t) {
  if (pumping) return;
  pumping = true;
  let steps = 0;
  while (r.running && accumulator >= 0.01 && steps < 80) {
    await advance(s, r, s === sim ? afterMainStep : () => t.update(s));
    accumulator -= 0.01;
    steps++;
  }
  if (steps >= 80) accumulator = 0;
  pumping = false;
}

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  if (demo?.playing) {
    accumulator += dt * speed;
    pump(demo.sim, demo.runner, demo.tracker);
    // Stop a little after the step is done (or 1 s after the program ends: its clock stops then)
    if (demo.endAt == null && (demo.tracker.stepIndex > demo.to || !demo.runner.running)) demo.endAt = demo.sim.time + 1;
    if (!demo.runner.running) demo.idle = (demo.idle || 0) + dt;
    if (demo.endAt != null && (demo.sim.time >= demo.endAt || demo.idle > 1)) stopDemo();
  } else if (runner.running) {
    accumulator += dt * speed;
    pump(sim, runner, tracker);
  } else if (watching) {
    accumulator += dt * speed;
    while (watching && accumulator >= 0.01) {
      sim.step(0.01);
      tracker.update(sim);
      accumulator -= 0.01;
      watching.left -= 0.01;
      if (tracker.finished || watching.left <= 1e-9) endRun(watching.result);
    }
  }
  const shown = demo ? demo.sim : sim;
  view.update(shown);
  placeBubble(shown);
  updateSensors(shown);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function updateSensors(s) {
  $('s-color').textContent = s.colorName();
  $('s-distance').textContent = `${s.distance().toFixed(0)} cm`;
  $('s-gyro').textContent = `${s.gyro()}°`;
  $('s-touch').textContent = s.touchPressed() ? 'pressed' : 'released';
  if (s.fork) $('s-fork').textContent = s.carried ? `up · ${s.carried.color}` : s.fork.height > 0 ? 'up' : 'down';
}

// ---------- Speech bubble ----------
function showBubble(text) {
  const el = $('bubble');
  el.textContent = text;
  el.hidden = !text;
}
function placeBubble(s) {
  const el = $('bubble');
  if (el.hidden) return;
  const p = view.robotOnScreen(s);
  el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -100%)`;
}

// ---------- View controls ----------
function segmented(id, onPick) {
  const el = $(id);
  el.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x == b));
    onPick(b.dataset);
  });
}
segmented('camera', d => view.setMode(d.mode));
segmented('speed', d => { speed = +d.speed; });

// ---------- Resizable split ----------
const gutter = $('gutter');
gutter.addEventListener('pointerdown', e => {
  gutter.setPointerCapture(e.pointerId);
  gutter.classList.add('dragging');
  const rect = $('split').getBoundingClientRect();
  const move = ev => {
    const pct = Math.min(75, Math.max(25, (ev.clientX - rect.left) / rect.width * 100));
    $('split').style.setProperty('--code-width', pct + '%');
    Blockly.svgResize(workspace);
  };
  const up = () => {
    gutter.classList.remove('dragging');
    gutter.removeEventListener('pointermove', move);
    gutter.removeEventListener('pointerup', up);
  };
  gutter.addEventListener('pointermove', move);
  gutter.addEventListener('pointerup', up);
});
new ResizeObserver(() => Blockly.svgResize(workspace)).observe($('blockly'));

// ---------- Toast and sound ----------
let toastTimer;
function toast(text, kind = '') {
  const el = $('toast');
  el.textContent = text;
  el.className = 'toast show ' + kind;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

let audioCtx;
function audio() {
  try {
    audioCtx = audioCtx || new AudioContext();
    if (audioCtx.state == 'suspended') audioCtx.resume();
  } catch { audioCtx = null; }
  return audioCtx;
}
function playTone(hz, seconds) {
  const ctx = audio();
  if (!ctx || seconds <= 0) return;
  const length = seconds / speed;            // faster playback speeds shorten notes too
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = hz;
  const t = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.08, t + 0.01);
  gain.gain.setValueAtTime(0.08, t + Math.max(0.01, length - 0.03));
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + length + 0.02);
}
