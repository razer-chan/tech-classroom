// Mission list. Add new missions here.
import { ROBOT, axes, overlaps, rayHits } from './sim.js?v=4636962f';
import { SCHOOL_MAX, LIGHT_LINE_Y, STOP_LINE_X } from './town.js?v=4636962f';

export const MISSIONS = [
  {
    id: 'maze',
    number: 1,
    title: 'Maze Run',
    summary: 'Green → Yellow → Red → Blue. Say each colour.',
    world: { type: 'maze', rows: 8, columns: 8, cell: 40, seed: 'MAZE' },
    goal: { type: 'checkpoints', order: ['Yellow', 'Red', 'Blue'], say: true },
    brief: [
      'Start on <b class="c-green">Green</b>. Drive to <b class="c-yellow">Yellow</b>, then <b class="c-red">Red</b>, then <b class="c-blue">Blue</b>.',
      'At each colour, check it with the colour sensor and say it: <span class="blk blk-looks">say <span class="blk blk-sensors">color sensor color name</span></span>',
      'Finish by stopping on <b class="c-blue">Blue</b>.',
    ],
    tips: ['1 square = 40 cm = 1 wheel rotation', 'Spin 90° = half a wheel rotation'],
  },
  {
    id: 'warehouse',
    number: 2,
    title: 'Warehouse Forklift',
    summary: 'Lift each pallet. Drop it on its colour.',
    world: {
      type: 'warehouse', rows: 8, columns: 9, cell: 40,
      start: { r: 0, c: 4 },
      pallets: [{ color: 'Yellow', r: 3, c: 4 }, { color: 'Red', r: 2, c: 2 }, { color: 'Blue', r: 4, c: 6 }],
      bays: [{ color: 'Blue', r: 7, c: 1 }, { color: 'Yellow', r: 7, c: 4 }, { color: 'Red', r: 7, c: 7 }],
    },
    goal: { type: 'deliver', colors: ['Red', 'Yellow', 'Blue'], safetySound: true },
    brief: [
      'Pick up a pallet: <span class="blk blk-forklift">lower fork down ↓</span> → drive 1 square under it → <span class="blk blk-forklift">lift fork up ↑</span>',
      'Safety first: <span class="blk blk-forklift">play safety sound 🔊</span> right before <b>every</b> lift and lower.',
      'Carry it to the bay of the <b>same colour</b> on the top wall.',
      'Lower the fork to drop it, then back out.',
      'Deliver all 3 pallets: <b class="c-red">Red</b>, <b class="c-yellow">Yellow</b>, <b class="c-blue">Blue</b>.',
    ],
    tips: ['1 square = 40 cm = 1 wheel rotation', 'A pallet you carry sits 1 square in front'],
  },
  {
    id: 'driving',
    number: 3,
    title: 'Driving Test',
    summary: 'Lights, a roundabout, a school zone, a flyover and a car park. Pass to get your licence.',
    world: { type: 'drive' },
    goal: { type: 'exam' },
    tips: ['1 wheel rotation = 40 cm', 'Spin 90° = each wheel 20 cm'],
    scenarios: [11, 22, 33],            // traffic timings used when a submission is re-run
    hints: {
      straight: ['How far is it to the middle of the corner?', 'Same speed on both wheels = straight.', 'Use “move tank … for … cm”.'],
      turn1: ['To spin left on the spot, which wheel goes forward?', 'Spinning 90° = each wheel goes 20 cm.', 'Stop in the middle of the lane, then turn.'],
      lights: ['What colour does the sensor see on the road before the line?', 'What should happen when it’s red? When it’s green?', 'Look in Control for “Wait until”.'],
      turn2: ['Can you reuse what you did at the first corner?', 'Measure from the stop line to the middle of the corner.'],
      roundabout: ['Go around the island on its left side. Don’t drive over it.', 'Try: turn a little, drive, turn back, drive…', 'Watch the ghost car with “Show me”.'],
      school: ['What colour is the school zone?', 'How fast is 30%?', 'Slow down when you see yellow. Speed up when it’s gone.'],
      stop: ['What colour is the stop pad?', 'How long must you stop for?', 'After the stop, which way do you turn?'],
      follow: ['Which sensor tells you how close the car in front is?', 'What should you do if it’s closer than 30 cm?', 'Keep checking in a loop until you see the blue RAMP sign.'],
      flyover: ['Where does the loop start? Drive to it first.', 'Left wheel a bit slower than the right = a gentle left curve. Try left 40, right 50.', 'How far for one full circle? Try different cm until you come back facing the same way.'],
      merge: ['How far down the ramp before you turn?', 'A 90° left curve: try left 30, right 50.', 'Finish in the left lane of the main road.'],
      park: ['The empty bay is behind the middle row. Drive to the end, turn, and come back along the next lane.', 'Count the bays: each one is 50 cm wide.', 'Face the bay, drive in slowly, and stop when the wall is about 10 cm away.'],
    },
  },
];

export function findMission(id) {
  return MISSIONS.find(m => m.id == id) || MISSIONS[0];
}

// A tracker's own data (no functions), copied, for "go back"
const dataOf = obj => structuredClone(Object.fromEntries(Object.entries(obj).filter(([, v]) => typeof v != 'function')));

export function createTracker(mission, world, hooks = {}) {
  const make = { deliver: deliveryTracker, exam: examTracker }[mission.goal.type] || checkpointTracker;
  return make(mission, world, hooks);
}

// Maze: reach each colour in order AND say it while the colour sensor sees it,
// then stop on the last colour. Also remembers how close the robot got to the next
// colour (in squares along the maze), for part marks.
function checkpointTracker(mission, world, hooks) {
  const order = mission.goal.order;
  const needSay = !!mission.goal.say;
  const zoneCell = name => world.zones.find(z => z.name == name);
  const distTo = order.map(name => mazeDistances(world, zoneCell(name)));
  const legLength = order.map((name, i) => {
    const from = i == 0 ? zoneCell('Green') : zoneCell(order[i - 1]);
    return distTo[i][from.r][from.c];
  });
  const blank = () => order.map(() => false);

  const tracker = {
    reached: blank(), said: blank(), done: 0, best: legLength.slice(), finished: false, finishedAt: null,
    reset() {
      Object.assign(this, { reached: blank(), said: blank(), done: 0, best: legLength.slice(), finished: false, finishedAt: null });
      hooks.onChange?.(this);
    },
    // Move on past every colour that is both reached and said
    advance() {
      let moved = false;
      while (this.done < order.length && this.reached[this.done] && (this.said[this.done] || !needSay)) {
        this.done++;
        moved = true;
      }
      return moved;
    },
    update(sim) {
      if (this.finished) return;
      const i = this.done;
      const here = world.zoneAt(sim.pose.x, sim.pose.y);
      if (i < order.length) {
        const { r, c } = world.cellAt(sim.pose.x, sim.pose.y);
        const d = distTo[i][r]?.[c];
        if (d != null && d < this.best[i]) this.best[i] = d;
        if (!this.reached[i] && here == order[i]) {
          this.reached[i] = true;
          this.best[i] = 0;
          this.advance();
          hooks.onChange?.(this);
        }
      } else if (!sim.motion && here == order[order.length - 1]) {
        // Every colour done: finished once the robot is stopped on the last one
        this.finished = true;
        this.finishedAt = sim.time;
        hooks.onChange?.(this);
        hooks.onFinish?.(this);
      }
    },
    // Called for every "say" block. It counts when the robot says the colour it is checking
    // and the colour sensor really sees that colour.
    say(text, sim) {
      const i = this.done;
      if (this.finished || i >= order.length) return;
      if (String(text).trim().toLowerCase() == order[i].toLowerCase() && sim.colorName() == order[i]) {
        this.said[i] = true;
        this.advance();
        hooks.onChange?.(this);
      }
    },
    chips() {
      return [
        { color: 'Green', label: 'Start', done: true },
        ...order.map((name, i) => ({ color: name, label: name, done: i < this.done, parts: needSay ? [this.reached[i], this.said[i]] : null })),
        { color: order[order.length - 1], label: 'Stop', done: this.finished, stop: true },
      ];
    },
    snapshot() { return dataOf(this); },
    restore(snap) { Object.assign(this, structuredClone(snap)); hooks.onChange?.(this); },
    // Share of each leg completed, 0–1
    legProgress() {
      return order.map((_, i) => (legLength[i] - this.best[i]) / legLength[i]);
    },
  };
  return tracker;
}

// Squares from every cell to the target cell, following open maze passages
function mazeDistances(world, target) {
  const { rows, columns, colWalls, rowWalls } = world.maze;
  const dist = Array.from({ length: rows }, () => new Array(columns).fill(null));
  dist[target.r][target.c] = 0;
  const queue = [[target.r, target.c]];
  const open = (r, c, dr, dc) => {
    if (dr == 1) return r < rows - 1 && !rowWalls[r][c];
    if (dr == -1) return r > 0 && !rowWalls[r - 1][c];
    if (dc == 1) return c < columns - 1 && !colWalls[r][c];
    return c > 0 && !colWalls[r][c - 1];
  };
  while (queue.length) {
    const [r, c] = queue.shift();
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (open(r, c, dr, dc) && dist[r + dr][c + dc] == null) {
        dist[r + dr][c + dc] = dist[r][c] + 1;
        queue.push([r + dr, c + dc]);
      }
    }
  }
  return dist;
}

// Warehouse: every pallet resting on the bay of its own colour
function deliveryTracker(mission, world, hooks) {
  const colors = mission.goal.colors;
  const needSafety = !!mission.goal.safetySound;
  return {
    delivered: [], finished: false, forkMoves: 0, warned: 0, missed: [], soundReady: false,
    reset() {
      Object.assign(this, { delivered: [], finished: false, finishedAt: null, forkMoves: 0, warned: 0, missed: [], soundReady: false });
      hooks.onChange?.(this);
    },
    snapshot() { return dataOf(this); },
    restore(snap) { Object.assign(this, structuredClone(snap)); hooks.onChange?.(this); },
    // Any sound counts as the warning for the next fork move
    sound() {
      this.soundReady = true;
    },
    fork(dir, sim) {
      this.forkMoves++;
      if (this.soundReady) this.warned++;
      else {
        this.missed.push({ dir, time: Math.round(sim.time * 10) / 10 });
        hooks.onMissedSound?.(dir);
      }
      this.soundReady = false;
      hooks.onChange?.(this);
    },
    update(sim) {
      const now = sim.pallets.filter(p => !p.carried && world.zoneAt(p.x, p.y) == p.color).map(p => p.color);
      if (now.join() != this.delivered.join()) {
        this.delivered = now;
        hooks.onChange?.(this);
      }
      if (!this.finished && colors.every(c => now.includes(c)) && !(needSafety && this.missed.length)) {
        this.finished = true;
        this.finishedAt = sim.time;
        hooks.onChange?.(this);
        hooks.onFinish?.(this);
      }
    },
    chips() {
      const chips = colors.map(c => ({ color: c, label: c, done: this.delivered.includes(c), pallet: true }));
      if (needSafety) {
        chips.push(this.missed.length
          ? { color: 'Red', label: `Safety sound missed ×${this.missed.length}`, done: false, bad: true }
          : { color: 'Yellow', label: `Safety sounds ${this.warned}/${this.forkMoves}`, done: this.forkMoves > 0, sound: true });
      }
      return chips;
    },
  };
}

// Driving test: nine steps in order, and an examiner who writes down every fault.
// Critical faults fail the test; more than 3 minor faults also fail it.
export const MAX_MINOR = 3;

function examTracker(mission, world, hooks) {
  const steps = world.steps;
  const inRect = (x, y, r) => x >= r.minX && x <= r.maxX && y >= r.minY && y <= r.maxY;
  let mem;
  const fresh = () => ({ prevFront: null, touching: false, lastLineAt: -9, offRoad: false, still: 0, maxStill: 0, fastFor: 0, schoolFast: false, lastTail: -9, bumps: 0, parked: 0, lastTime: 0 });

  const tracker = {
    stepIndex: 0, stepTimes: [], faults: [], finished: false, passed: false, finishedAt: null,
    reset() {
      Object.assign(this, { stepIndex: 0, stepTimes: [], faults: [], finished: false, passed: false, finishedAt: null });
      mem = fresh();
      hooks.onChange?.(this);
    },
    snapshot() { return { data: dataOf(this), mem: structuredClone(mem) }; },
    restore(snap) {
      Object.assign(this, structuredClone(snap.data));
      mem = structuredClone(snap.mem);
      hooks.onChange?.(this);
    },
    counts() {
      const critical = this.faults.filter(f => f.critical).length;
      return { critical, minor: this.faults.length - critical };
    },
    update(sim) {
      const dt = sim.time - mem.lastTime;
      mem.lastTime = sim.time;
      const p = sim.pose;
      const { f } = axes(p.heading);
      const front = { x: p.x + f.x * ROBOT.halfLength, y: p.y + f.y * ROBOT.halfLength };
      const sensor = { x: p.x + f.x * ROBOT.colorSensorAhead, y: p.y + f.y * ROBOT.colorSensorAhead };
      const m = sim.motion;
      const moving = !!m && (m.left != 0 || m.right != 0);
      const speed = m ? Math.max(Math.abs(m.left), Math.abs(m.right)) / ROBOT.maxWheelSpeed * 100 : 0;

      const fault = (type, critical, text) => {
        const item = { type, critical, text, time: Math.round(sim.time * 10) / 10, x: Math.round(p.x), y: Math.round(p.y), z: Math.round(sim.elev || 0), step: steps[Math.min(this.stepIndex, steps.length - 1)].id };
        this.faults.push(item);
        hooks.onFault?.(item);
        hooks.onChange?.(this);
      };

      // Crashes and leaving the road
      if (sim.bumps > mem.bumps) {
        mem.bumps = sim.bumps;
        fault('crash', true, 'Crashed');
      }
      const off = sim.level ? !sim.level.ok : !world.onRoad(p.x, p.y);
      if (off && !mem.offRoad) fault('offroad', true, 'Drove off the road');
      mem.offRoad = off;

      // Touching painted lines
      const body = { ...p, hw: ROBOT.halfWidth, hl: ROBOT.halfLength };
      // Only lines at the robot's own height (not the road under a bridge)
      const elev = sim.elev || 0;
      const touching = world.lineShapes.some(s => Math.abs((s.z || 0) - elev) <= 8 &&
        s.minX <= p.x + 20 && s.maxX >= p.x - 20 && s.minY <= p.y + 20 && s.maxY >= p.y - 20 && overlaps(body, s));
      if (touching && !mem.touching && sim.time - mem.lastLineAt > 1) {
        mem.lastLineAt = sim.time;
        fault('line', false, 'Touched a line');
      }
      mem.touching = touching;

      if (mem.prevFront) {
        // Red light: the front of the robot crosses the stop line while it's red
        const crossedLights = mem.prevFront.y < LIGHT_LINE_Y && front.y >= LIGHT_LINE_Y && front.x > 400 && front.x < 450;
        if (crossedLights && sim.dyn?.light(sim.dyn.time).color == 'Red') fault('redlight', true, 'Ran a red light');

        // Stop sign: a full stop of 2 s close to the line before crossing it
        const approaching = front.x > STOP_LINE_X && front.x <= STOP_LINE_X + 60 && p.y > 245 && p.y < 305;
        mem.still = approaching && !moving ? mem.still + dt : 0;
        mem.maxStill = Math.max(mem.maxStill, mem.still);
        const crossedStop = mem.prevFront.x > STOP_LINE_X && front.x <= STOP_LINE_X && front.y > 250 && front.y < 300;
        if (crossedStop) {
          if (mem.maxStill < 1.9) fault('stopsign', true, 'Didn’t stop for 2 s at the stop sign');
          mem.maxStill = 0;
        }
      }
      mem.prevFront = front;

      // School zone: speed judged where the colour sensor is (it sees the yellow first)
      if (world.inSchool(sensor.x, sensor.y)) {
        mem.fastFor = speed > SCHOOL_MAX + 0.5 ? mem.fastFor + dt : 0;
        if (mem.fastFor > 0.15 && !mem.schoolFast) {
          mem.schoolFast = true;
          fault('school', false, 'Too fast in the school zone');
        }
      } else {
        mem.schoolFast = false;
        mem.fastFor = 0;
      }

      // Tailgating the car in front
      const car = sim.dyn?.obstacles()[0];
      if (car) {
        const gap = rayHits(front.x, front.y, f.x, f.y, car);
        if (gap != null && gap < 12 && sim.time - mem.lastTail > 4) {
          mem.lastTail = sim.time;
          fault('tailgate', false, 'Too close to the car in front');
        }
      }

      // Steps, in order
      const cur = steps[this.stepIndex];
      if (!cur || this.finished) return;
      let done = false;
      if (cur.zone) {
        done = inRect(p.x, p.y, cur.zone) && (cur.minElev == null || (sim.elev || 0) >= cur.minElev);
      } else if (cur.park) {
        const { r } = axes(p.heading);
        const corners = [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => ({
          x: p.x + f.x * ROBOT.halfLength * a + r.x * ROBOT.halfWidth * b,
          y: p.y + f.y * ROBOT.halfLength * a + r.y * ROBOT.halfWidth * b,
        }));
        const inside = corners.every(c => inRect(c.x, c.y, cur.park.bay));
        // Gap to the wall at the end of the bay: east (wallX) or north (wallY)
        const gap = cur.park.wallX != null
          ? cur.park.wallX - Math.max(...corners.map(c => c.x))
          : cur.park.wallY - Math.max(...corners.map(c => c.y));
        const ok = !moving && inside && gap >= 4 && gap <= 16;
        mem.parked = ok ? mem.parked + dt : 0;
        done = mem.parked >= 1;
      }
      if (done) {
        this.stepTimes.push(Math.round(sim.time * 10) / 10);
        this.stepIndex++;
        if (this.stepIndex == steps.length) {
          const { critical, minor } = this.counts();
          this.finished = true;
          this.finishedAt = sim.time;
          this.passed = critical == 0 && minor <= MAX_MINOR;
          hooks.onChange?.(this);
          hooks.onFinish?.(this);
        } else {
          hooks.onChange?.(this);
        }
      }
    },
    chips() {
      return steps.map((s, i) => ({ color: i < this.stepIndex ? 'Green' : 'White', label: s.title, done: i < this.stepIndex }));
    },
  };
  mem = fresh();
  return tracker;
}

// Small per-computer store (progress ticks, run counts, time on task)
export const store = {
  read(key, fallback) {
    try { return JSON.parse(localStorage.getItem('robotlab:' + key)) ?? fallback; } catch { return fallback; }
  },
  write(key, value) {
    try { localStorage.setItem('robotlab:' + key, JSON.stringify(value)); } catch { /* storage blocked */ }
  },
};

export const progress = {
  isDone: id => !!store.read('done', {})[id],
  markDone(id) {
    const all = store.read('done', {});
    all[id] = Date.now();
    store.write('done', all);
  },
};
