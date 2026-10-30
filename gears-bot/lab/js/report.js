// Save / Open / Submit files.
// One plain-text format for everything: a readable summary on top, then all the data as JSON
// (code, re-run result, run history). Robot Lab can open both saved and submitted files.
import { buildWorld } from './world.js?v=4636962f';
import { Sim } from './sim.js?v=4636962f';
import { Runner, runHeadless, WATCH_AFTER } from './runner.js?v=4636962f';
import { createTracker } from './missions.js?v=4636962f';
import { generateProgram, programText, codeFeatures } from './blocks.js?v=4636962f';

const Blockly = window.Blockly;
export const FORMAT = 'robotlab-v1';
const DATA_MARK = '===== DATA (JSON) =====';
const MAX_SECONDS = 600;

// ---- Results ----

// Facts about one run, from the simulator and the mission tracker
export function summarise(mission, sim, tracker) {
  const round = t => Math.round(t * 10) / 10;
  const base = {
    complete: tracker.finished,
    completedAtSeconds: tracker.finished ? round(tracker.finishedAt) : null,
    bumps: sim.bumps,
    programEndSeconds: round(sim.time),
  };
  if (mission.goal.type == 'exam') {
    const { critical, minor } = tracker.counts();
    return {
      ...base,
      seed: sim.seed,
      pass: tracker.passed,
      stepsDone: tracker.stepIndex,
      steps: sim.world.steps.map((st, i) => ({ id: st.id, title: st.title, done: i < tracker.stepIndex, atSeconds: tracker.stepTimes[i] ?? null })),
      critical, minor,
      faults: tracker.faults,
    };
  }
  if (mission.goal.type == 'checkpoints') {
    const progress = tracker.legProgress();
    return {
      ...base,
      checkpoints: mission.goal.order.map((name, i) => ({
        name, reached: !!tracker.reached[i], said: !!tracker.said?.[i], percentOfWay: Math.round(progress[i] * 100),
      })),
      stoppedOnLast: tracker.finished,
    };
  }
  return {
    ...base,
    pallets: sim.pallets.map(p => ({ color: p.color, delivered: tracker.delivered.includes(p.color), lifted: p.everLifted })),
    safety: { forkMoves: tracker.forkMoves, warnedFirst: tracker.warned, missed: tracker.missed },
  };
}

export function shortResult(result) {
  if (result.steps) return `${result.pass ? 'PASS' : 'FAIL'} · ${result.stepsDone}/${result.steps.length} steps · ${result.critical} critical · ${result.minor} minor`;
  if (result.checkpoints) return result.checkpoints.map(c => `${c.name} ${c.reached ? '✓' : '✗'}${c.said ? ' said' : ''}`).join(' ') + (result.stoppedOnLast ? ' · stopped' : '');
  if (result.pallets) return result.pallets.map(p => `${p.color} ${p.delivered ? '✓' : p.lifted ? '↑' : '✗'}`).join(' ');
  return '';
}

// Re-run the saved blocks from the start, exactly as the student would see them
export async function checkWorkspace(mission, workspaceState) {
  const ws = new Blockly.Workspace();
  try {
    Blockly.serialization.workspaces.load(workspaceState, ws);
    const javascript = generateProgram(ws);
    const out = { features: codeFeatures(ws), programText: programText(ws), javascript, result: null };
    if (!javascript) return out;
    // Missions with random traffic are re-run in several fixed scenarios
    const seeds = mission.scenarios || [1];
    const runs = [];
    for (const seed of seeds) runs.push(await runOnce(mission, javascript, seed));
    out.result = seeds.length == 1 ? runs[0] : {
      scenarios: runs,
      passedScenarios: runs.filter(r => r.pass).length,
      complete: runs.some(r => r.complete),
    };
    return out;
  } finally {
    ws.dispose();
  }
}

async function runOnce(mission, javascript, seed) {
  const world = buildWorld(mission.world);
  const sim = new Sim(world, seed);
  const tracker = createTracker(mission, world);
  const said = [];
  let tones = 0;
  const runner = new Runner(sim, {
    onSay: t => { if (said.length < 100) said.push(t); tracker.say?.(t, sim); },
    onTone: () => { tones++; tracker.sound?.(); },
    onFork: dir => tracker.fork?.(dir, sim),
  });
  const run = await runHeadless(sim, runner, javascript, {
    maxSeconds: MAX_SECONDS, afterStep: () => tracker.update(sim),
    watchAfter: mission.goal.type == 'exam' ? WATCH_AFTER : 0,
  });
  tracker.update(sim);   // the robot has stopped: lets "stop on Blue" count
  return {
    ...summarise(mission, sim, tracker),
    programEndSeconds: Math.round(run.endedAt * 10) / 10,
    ended: run.timedOut ? `still running after ${MAX_SECONDS} s (stopped)` : run.ok ? 'program finished' : 'error: ' + (run.error?.message || run.error),
    said,
    tonesPlayed: tones,
  };
}

function examLines(r, label) {
  const lines = [`  ${label}: ${r.pass ? 'PASS' : 'FAIL'} · ${r.stepsDone}/${r.steps.length} steps · ${r.critical} critical · ${r.minor} minor · ${r.complete ? `finished at ${r.completedAtSeconds} s` : 'not finished'} · ${r.ended}`];
  for (const f of r.faults) lines.push(`      ${String(f.time).padStart(6)} s  ${f.critical ? 'CRITICAL' : 'minor   '}  ${f.text}  (step: ${f.step}, x ${f.x}, y ${f.y})`);
  return lines;
}

// ---- File text ----

export async function buildFile({ type, name, mission, workspace, stats }) {
  const check = await checkWorkspace(mission, workspace);
  const now = new Date();
  const data = {
    format: FORMAT,
    type,                                   // 'submission' or 'save'
    name: name || '',
    mission: { id: mission.id, number: mission.number, title: mission.title },
    savedAt: now.toISOString(),
    localTime: now.toLocaleString('en-AU'),
    result: check.result,
    features: check.features,
    stats: { runs: stats.runs, minutesOnMission: Math.round(stats.seconds / 60), firstOpened: stats.firstOpened, hints: stats.hints || {}, demos: stats.demos || 0 },
    history: stats.history,
    programText: check.programText,
    javascript: check.javascript,
    workspace,
  };
  data.check = fnv1a(JSON.stringify(data));

  const r = check.result;
  const f = check.features;
  const yesNo = v => (v ? 'yes' : 'no');
  const lines = [
    `ROBOT LAB · ${type == 'submission' ? 'SUBMISSION' : 'EXPORTED CODE'}`,
    '',
    ...(type == 'submission' ? [`Name:      ${data.name}`] : []),
    `Mission:   ${mission.number} · ${mission.title}`,
    `Saved:     ${data.localTime}`,
    '',
    r?.scenarios ? `RESULT (code re-run from the start in ${r.scenarios.length} traffic scenarios)` : 'RESULT (code re-run from the start)',
  ];
  if (!r) {
    lines.push('  No "When Started" block, so nothing ran.');
  } else if (r.scenarios) {
    r.scenarios.forEach((sc, i) => lines.push(...examLines(sc, `Scenario ${i + 1} (seed ${sc.seed})`)));
    lines.push(`  Passed ${r.passedScenarios} of ${r.scenarios.length} scenarios`);
    const steps = r.scenarios[0].steps;
    lines.push('', 'STEPS (scenario 1)', ...steps.map((st, i) => `  ${String(i + 1).padStart(2)}. ${st.title.padEnd(16)} ${st.done ? `done at ${st.atSeconds} s` : 'not done'}`));
  } else {
    if (r.checkpoints) {
      r.checkpoints.forEach(c => lines.push(`  ${c.name.padEnd(14)} ${c.reached ? 'reached' : `not reached · ${c.percentOfWay}% of the way`} · ${c.said ? 'said the colour' : 'did not say the colour'}`));
      lines.push(`  ${'Stopped on ' + r.checkpoints[r.checkpoints.length - 1].name} ${r.stoppedOnLast ? 'yes' : 'no'}`);
    }
    if (r.pallets) {
      r.pallets.forEach(p => lines.push(`  ${(p.color + ' pallet').padEnd(14)} ${p.delivered ? 'delivered' : p.lifted ? 'lifted, not delivered' : 'not lifted'}`));
      lines.push(`  ${'Safety sound'.padEnd(14)} before ${r.safety.warnedFirst} of ${r.safety.forkMoves} fork moves` +
        (r.safety.missed.length ? ` · missed at ${r.safety.missed.map(m => `${m.time} s (${m.dir})`).join(', ')}` : ''));
    }
    lines.push(
      `  ${'Complete'.padEnd(14)} ${r.complete ? `yes, after ${r.completedAtSeconds} s` : 'no'}`,
      `  ${'Bumps'.padEnd(14)} ${r.bumps}`,
      `  ${'Program ran'.padEnd(14)} ${r.programEndSeconds} s`,
      `  ${'Ended'.padEnd(14)} ${r.ended}`,
    );
  }
  lines.push(
    '',
    'CODE',
    `  Blocks ${f.statements} · Loops ${yesNo(f.loops)} · Sensors/if ${yesNo(f.sensing)} · Say ${yesNo(f.say)} · Says sensor colour ${yesNo(f.sayColour)} · Sound ${yesNo(f.sound)}`,
    '',
    'EFFORT',
    `  Runs ${stats.runs} · About ${data.stats.minutesOnMission} min on this mission`,
    ...(mission.goal.type == 'exam' ? [`  Hints opened: ${Object.entries(data.stats.hints).map(([k, v]) => `${k} ×${v}`).join(', ') || 'none'} · Demos watched: ${data.stats.demos}`] : []),
    '',
    'PROGRAM',
    ...check.programText.split('\n').map(l => '  ' + l),
    '',
    'RUN HISTORY',
    ...(stats.history.length
      ? stats.history.map((h, i) => `  #${i + 1}  ${new Date(h.at).toLocaleString('en-AU')}  ${h.blocks} blocks  ${h.result}  bumps ${h.bumps}`)
      : ['  (no runs yet)']),
    '',
    DATA_MARK,
    JSON.stringify(data, null, 1),
    '',
  );
  return { text: lines.join('\n'), data };
}

// Accepts a Robot Lab .txt file (or plain JSON). Returns the data, or throws.
export function parseFile(text) {
  text = text.replace(/^﻿/, '');
  let json = text.trim();
  if (!json.startsWith('{')) {
    const at = text.indexOf(DATA_MARK);
    if (at < 0) throw new Error('Not a Robot Lab file');
    json = text.slice(at + DATA_MARK.length).trim();
  }
  const data = JSON.parse(json);
  if (data.format != FORMAT || !data.workspace) throw new Error('Not a Robot Lab file');
  return data;
}

export function download(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export const safeName = s => s.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim();

// Small tamper check: FNV-1a (32-bit) of the compact JSON without the "check" field
export function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
