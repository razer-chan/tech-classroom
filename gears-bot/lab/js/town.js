// Driving test town: roads, painted lines, coloured road pads, the traffic light
// and the car in front. Sizes in cm; x points east, y points north.
// Australian rules: keep left, roundabouts go clockwise.

export const LANE = 48;                 // lane width between lines
const W = 1;                            // painted line half width

const rect = (minX, minY, maxX, maxY) => ({ minX, minY, maxX, maxY });
const inRect = (x, y, r) => x >= r.minX && x <= r.maxX && y >= r.minY && y <= r.maxY;

// Roundabout
export const RB = { x: 150, y: 300, outer: 110, island: 40, lineR: 41, edgeR: 109 };

// ---- Spiral flyover (after the car-following road, before the car park) ----
// Radii are picked so whole-number wheel settings drive them exactly:
//   loop:  left 40 %, right 50 %, 800 cm  → one full circle, radius 114.6 cm
//   merge: left 30 %, right 50 %, 100 cm  → a 90° left turn, radius 50.9 cm
const HALF_TRACK = 40 / Math.PI;
export const FLYOVER = {
  rampSign: { x: -425, y: -200 },              // blue RAMP sign starts here
  loopStart: { x: -425, y: -260 },             // A: the loop starts and ends here
  loopR: 9 * HALF_TRACK,
  bridgeEndY: -420,
  rampEndY: -620,
  mergeR: 4 * HALF_TRACK,
  top: 40,                                     // deck height (cm) at the top
};
const LOOP_C = { x: FLYOVER.loopStart.x + FLYOVER.loopR, y: FLYOVER.loopStart.y };
const MERGE_C = { x: FLYOVER.loopStart.x + FLYOVER.mergeR, y: FLYOVER.rampEndY };
export const MAIN_Y = FLYOVER.rampEndY - FLYOVER.mergeR;   // centre of the main road's left lane
const RIBBON_HALF = 27;                         // lane (48) + lines + a little

// ---- Car park at the end of the main road ----
// Four rows of 6 bays (50 cm wide, 65 cm deep). The main road's left lane runs on
// as the first car-park lane; the second lane is behind the middle (double) row,
// reached by the turning lane at the east end. The only empty bay is in the back row.
const BAY_W = 50, BAY_D = 65;
export const CAR_PARK = {
  rowsX: [150, 450],                                            // west and east end of every row
  rowsY: [MAIN_Y - 100, MAIN_Y + 35, MAIN_Y + 100, MAIN_Y + 235], // south edge of each row
  eastX: 520,                                                   // turning lane runs from 450 to 520
  wallY: MAIN_Y + 300,                                          // wall behind the back row
  empty: { row: 3, bay: 3 },                                    // back row, 4th bay from the west
};
const EMPTY_X = CAR_PARK.rowsX[0] + CAR_PARK.empty.bay * BAY_W;
const EMPTY_BAY = rect(EMPTY_X, CAR_PARK.rowsY[3], EMPTY_X + BAY_W, CAR_PARK.wallY);

// Every bay but the empty one has a car in it (26 × 44 cm, parked nose in)
function parkedCars() {
  const cars = [];
  CAR_PARK.rowsY.forEach((y, row) => {
    for (let bay = 0; bay < 6; bay++) {
      if (row == CAR_PARK.empty.row && bay == CAR_PARK.empty.bay) continue;
      const cx = CAR_PARK.rowsX[0] + (bay + 0.5) * BAY_W, cy = y + BAY_D / 2;
      cars.push({ ...rect(cx - 13, cy - 22, cx + 13, cy + 22), kind: 'car' });
    }
  });
  return cars;
}

// A ribbon is a one-lane road along a centre line, with a height at every point
function straightRibbon(name, [x0, y0], [x1, y1], z0, z1) {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 5));
  return { name, pts: Array.from({ length: n + 1 }, (_, i) => ({ x: x0 + (x1 - x0) * i / n, y: y0 + (y1 - y0) * i / n, z: z0 + (z1 - z0) * i / n })) };
}
function arcRibbon(name, c, r, fromDeg, toDeg, z0, z1) {
  const n = Math.ceil(Math.abs(toDeg - fromDeg) / 3);
  return {
    name, pts: Array.from({ length: n + 1 }, (_, i) => {
      const a = (fromDeg + (toDeg - fromDeg) * i / n) * Math.PI / 180;
      return { x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a), z: z0 + (z1 - z0) * i / n };
    }),
  };
}
const A = FLYOVER.loopStart;
export const RIBBONS = [
  straightRibbon('entry', [A.x, FLYOVER.rampSign.y], [A.x, A.y], 0, 0),
  arcRibbon('loop1', LOOP_C, FLYOVER.loopR, 180, 360, 0, FLYOVER.top / 2),
  arcRibbon('loop2', LOOP_C, FLYOVER.loopR, 360, 540, FLYOVER.top / 2, FLYOVER.top),
  straightRibbon('bridge', [A.x, A.y], [A.x, FLYOVER.bridgeEndY], FLYOVER.top, FLYOVER.top),
  straightRibbon('ramp', [A.x, FLYOVER.bridgeEndY], [A.x, FLYOVER.rampEndY], FLYOVER.top, 0),
  arcRibbon('merge', MERGE_C, FLYOVER.mergeR, 180, 270, 0, 0),
];

// Height of a ribbon at (x, y), or null when the point is not on it
function ribbonHeight(rb, x, y) {
  let best = null;
  for (let i = 1; i < rb.pts.length; i++) {
    const p = rb.pts[i - 1], q = rb.pts[i];
    const dx = q.x - p.x, dy = q.y - p.y;
    const t = Math.max(0, Math.min(1, ((x - p.x) * dx + (y - p.y) * dy) / (dx * dx + dy * dy)));
    const d = Math.hypot(x - (p.x + t * dx), y - (p.y + t * dy));
    if (d <= RIBBON_HALF && (!best || d < best.d)) best = { d, z: p.z + (q.z - p.z) * t };
  }
  return best ? best.z : null;
}

// Left and right edge lines of a ribbon (offset ±25 cm from the centre line)
function ribbonEdges(rb) {
  const left = [], right = [];
  rb.pts.forEach((p, i) => {
    const a = rb.pts[Math.max(0, i - 1)], b = rb.pts[Math.min(rb.pts.length - 1, i + 1)];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const dx = (b.x - a.x) / len, dy = (b.y - a.y) / len;
    left.push([p.x - dy * 25, p.y + dx * 25, p.z]);
    right.push([p.x + dy * 25, p.y - dx * 25, p.z]);
  });
  return { left, right };
}

// Asphalt (union of rectangles, plus the roundabout ring)
const ROADS = [
  rect(-150, -300, 400, -200),   // bottom road (eastbound)
  rect(400, -300, 500, -200),    // corner 1
  rect(400, -200, 500, 250),     // right road (northbound)
  rect(400, 250, 500, 350),      // corner 2
  rect(247, 250, 400, 350),      // top road, east of the roundabout
  rect(100, 397, 200, 480),      // roundabout north arm
  rect(100, 110, 200, 203),      // roundabout south arm
  rect(-400, 250, 53, 350),      // top road, west of the roundabout (westbound)
  rect(-500, 250, -400, 350),    // T junction
  rect(-620, 250, -500, 350),    // side street to the west
  rect(-500, -200, -400, 250),   // left road (southbound)
  rect(-640, MAIN_Y - 76, 100, MAIN_Y + 26),   // main road (two lanes, eastbound)
  rect(100, MAIN_Y - 76, 150, MAIN_Y + 35),    // car park entrance
  rect(150, MAIN_Y - 100, 520, MAIN_Y + 300),  // car park
];

// Painted lines you must not touch (centre lines of each 2 cm stripe)
function lineStrips() {
  const s = [];
  const add = (...pts) => { for (let i = 1; i < pts.length; i++) s.push([pts[i - 1], pts[i]]); };
  const ix = Math.sqrt(RB.edgeR ** 2 - 49 ** 2);          // where road edges meet the roundabout
  // Bottom and right roads, corners 1 and 2
  add([-150, -299], [499, -299], [499, 349], [150 + ix, 349]);
  add([-150, -201], [401, -201], [401, 251], [150 + ix, 251]);
  add([-149, -299], [-149, -201]);                          // dead end
  add([-150, -250], [400, -250]);                           // centre lines
  add([450, -200], [450, 250]);
  add([400, 300], [RB.x + RB.edgeR, 300]);
  // Roundabout: outer edge with gaps for the four arms, and the island
  const gap = Math.asin(49 / RB.edgeR) * 180 / Math.PI;
  for (const start of [0, 90, 180, 270]) add(...arc(RB.edgeR, start + gap, start + 90 - gap));
  add(...arc(RB.lineR, 0, 360));
  // Roundabout arms (north and south)
  add([101, 300 + ix], [101, 480]);
  add([199, 300 + ix], [199, 480]);
  add([150, 300 + RB.edgeR], [150, 480]);
  add([101, 300 - ix], [101, 111], [199, 111], [199, 300 - ix]);
  add([150, 300 - RB.edgeR], [150, 112]);
  // Top road west, T junction, side street
  add([150 - ix, 349], [-620, 349]);
  add([150 - ix, 251], [-399, 251]);
  add([RB.x - RB.edgeR, 300], [-400, 300]);
  add([-501, 251], [-620, 251]);
  add([-500, 300], [-620, 300]);
  // Left road (its west lane ends at the ramp)
  add([-399, 251], [-399, -200]);
  add([-501, 251], [-501, -200], [-450, -200]);
  add([-450, 250], [-450, -200]);
  // Flyover: both edges of every ribbon, except the merge's outer edge,
  // which stops where it meets the main road
  for (const rb of RIBBONS) {
    const { left, right } = ribbonEdges(rb);
    add(...left);
    add(...(rb.name == 'merge' ? right.filter(p => p[1] > MAIN_Y + 25) : right));
  }
  // Main road: gap in the north edge where the ramp joins
  const gapStart = MERGE_C.x - Math.sqrt((FLYOVER.mergeR + 25) ** 2 - (MAIN_Y + 25 - MERGE_C.y) ** 2);
  add([-640, MAIN_Y + 25], [gapStart, MAIN_Y + 25]);
  add([MERGE_C.x, MAIN_Y + 25], [100, MAIN_Y + 25]);
  add([-640, MAIN_Y - 25], [100, MAIN_Y - 25]);
  add([-640, MAIN_Y - 75], [100, MAIN_Y - 75]);
  // Car park: lines between the bays, and down the middle of the double row
  const [x0, x1] = CAR_PARK.rowsX;
  for (const y of CAR_PARK.rowsY) for (let x = x0; x <= x1; x += BAY_W) add([x, y], [x, y + BAY_D]);
  add([x0, MAIN_Y + 100], [x1, MAIN_Y + 100]);
  return s;
}

function arc(r, fromDeg, toDeg, stepDeg = 4) {
  const pts = [];
  const n = Math.max(1, Math.ceil((toDeg - fromDeg) / stepDeg));
  for (let i = 0; i <= n; i++) {
    const a = (fromDeg + (toDeg - fromDeg) * i / n) * Math.PI / 180;
    pts.push([RB.x + r * Math.cos(a), RB.y + r * Math.sin(a)]);
  }
  return pts;
}

// White stop lines: you drive over these, so they are not "touch" lines
const STOP_LINES = {
  lights: rect(402, 50, 448, 54),
  stopSign: rect(-404, 252, -400, 298),
};

// Coloured road paint the colour sensor can read
const PADS = {
  lights: rect(402, 20, 448, 50),       // shows the traffic light colour
  school: rect(-300, 252, -60, 298),    // Yellow
  stop: rect(-400, 252, -370, 298),     // Red
  ramp: rect(-449, -230, -401, -200),   // Blue RAMP sign at the start of the flyover
  bay: rect(EMPTY_BAY.minX + 2, EMPTY_BAY.minY + 1, EMPTY_BAY.maxX - 2, EMPTY_BAY.maxY),   // Blue, the empty bay
};

// Solid things you can crash into (besides the car in front)
const SOLIDS = [
  { ...rect(150, MAIN_Y - 112, 532, MAIN_Y - 100), kind: 'wall' },     // car park walls: south,
  { ...rect(520, MAIN_Y - 100, 532, MAIN_Y + 300), kind: 'wall' },     // east,
  { ...rect(150, MAIN_Y + 300, 532, MAIN_Y + 312), kind: 'wall' },     // north (behind the empty bay)
  ...parkedCars(),
];

// The nine steps of the test. `zone` = where the robot's centre must get to.
export const STEPS = [
  { id: 'straight', title: 'Drive straight', goal: 'Drive to the first corner. Stay in your lane.', zone: rect(330, -250, 400, -200) },
  { id: 'turn1', title: 'Turn left', goal: 'Turn left into the next road.', zone: rect(400, -150, 450, -100) },
  { id: 'lights', title: 'Traffic lights', goal: 'Red: stop before the line. Green: go.', zone: rect(400, 90, 450, 150) },
  { id: 'turn2', title: 'Turn left', goal: 'Turn left at the top corner.', zone: rect(290, 250, 360, 300) },
  { id: 'roundabout', title: 'Roundabout', goal: 'Go straight through: 2nd exit. Keep left of the island.', zone: rect(-40, 250, 20, 300) },
  { id: 'school', title: 'School zone', goal: 'Slow down to 30% or less on the yellow road.', zone: rect(-350, 250, -310, 300) },
  { id: 'stop', title: 'Stop sign', goal: 'Stop on the red for 2 seconds. Then turn left.', zone: rect(-450, 170, -400, 220) },
  { id: 'follow', title: 'Follow the car', goal: "Don't hit the car in front. Drive to the blue RAMP sign.", zone: rect(-450, -235, -400, -185) },
  { id: 'flyover', title: 'Spiral flyover', goal: 'Go up the spiral: once all the way round, then over the bridge.', zone: rect(-450, -420, -400, -380), minElev: 30 },
  { id: 'merge', title: 'Merge', goal: 'Come down the ramp. Turn left into the main road. Keep left.', zone: rect(-300, MAIN_Y - 25, -250, MAIN_Y + 25) },
  { id: 'park', title: 'Park', goal: 'Drive round the parked cars to the empty blue bay. Stop about 10 cm from the wall.', park: { bay: EMPTY_BAY, wallY: CAR_PARK.wallY } },
];

export const SCHOOL_MAX = 30;            // % speed limit in the school zone
export const LIGHT_LINE_Y = 50;
export const STOP_LINE_X = -400;

export function buildTownWorld() {
  const strips = lineStrips();
  const lineShapes = strips.map(([[x1, y1, z1 = 0], [x2, y2, z2 = 0]]) => {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    return {
      x: (x1 + x2) / 2, y: (y1 + y2) / 2, heading: Math.atan2(dx, dy), hw: W, hl: len / 2 + W,
      minX: Math.min(x1, x2) - W, maxX: Math.max(x1, x2) + W, minY: Math.min(y1, y2) - W, maxY: Math.max(y1, y2) + W,
      x1, y1, x2, y2, z1, z2, z: (z1 + z2) / 2,
    };
  });

  // Ground-level asphalt
  const onRoad = (x, y) => {
    const r = Math.hypot(x - RB.x, y - RB.y);
    if (r < RB.island) return false;
    return r <= RB.outer || ROADS.some(rr => inRect(x, y, rr));
  };

  // Which road surface the robot is on. Where roads cross (the bridge over the road
  // below), pick the one closest to the height the robot was already at.
  const surfaceAt = (x, y, prevZ = 0) => {
    const heights = [];
    if (onRoad(x, y)) heights.push(0);
    for (const rb of RIBBONS) {
      const z = ribbonHeight(rb, x, y);
      if (z != null) heights.push(z);
    }
    if (!heights.length) return { ok: false, elev: prevZ };
    const z = heights.reduce((a, b) => (Math.abs(b - prevZ) < Math.abs(a - prevZ) ? b : a));
    return Math.abs(z - prevZ) <= 8 ? { ok: true, elev: z } : { ok: false, elev: prevZ };
  };

  const onLine = (x, y, z = 0) => lineShapes.some(s => {
    if (Math.abs(s.z - z) > 8) return false;
    if (x < s.minX || x > s.maxX || y < s.minY || y > s.maxY) return false;
    const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
    const t = Math.max(0, Math.min(1, ((x - s.x1) * dx + (y - s.y1) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(x - (s.x1 + t * dx), y - (s.y1 + t * dy)) <= W;
  });

  return {
    type: 'drive',
    width: 1200, height: 1290, center: { x: -40, y: -165 },
    start: { x: -60, y: -225, heading: 90 },
    walls: SOLIDS,
    zones: [],
    roads: ROADS, ribbons: RIBBONS, ribbonHalf: RIBBON_HALF, strips, lineShapes, pads: PADS, stopLines: STOP_LINES,
    roundabout: RB, steps: STEPS, mainY: MAIN_Y,
    reference: REFERENCE, demoSeed: DEMO_SEED,          // for "Show me"
    onRoad, surfaceAt,
    // What the colour sensor sees at a point (z = the robot's height)
    colorAt(x, y, dyn, z = 0) {
      if (z > 8) {
        if (onLine(x, y, z)) return 'White';
        return surfaceAt(x, y, z).ok ? 'Black' : 'None';
      }
      if (inRect(x, y, PADS.lights)) return dyn ? dyn.light(dyn.time).color : 'Red';
      if (inRect(x, y, PADS.school)) return 'Yellow';
      if (inRect(x, y, PADS.stop)) return 'Red';
      if (inRect(x, y, PADS.ramp) || inRect(x, y, PADS.bay)) return 'Blue';
      if (inRect(x, y, STOP_LINES.lights) || inRect(x, y, STOP_LINES.stopSign)) return 'White';
      if (onLine(x, y, z)) return 'White';
      return surfaceAt(x, y, z).ok ? 'Black' : 'None';
    },
    zoneAt: () => null,
    inSchool: (x, y) => inRect(x, y, PADS.school),
    createDynamic: seed => new TownTraffic(seed),
  };
}

// ---- Things that move: the traffic light and the car in front ----

function mulberry32(seed) {
  let s = seed >>> 0;
  return () => {
    let t = s += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export const LEAD_CAR = { hw: 15, hl: 23, speed: 12, start: { x: -425, y: 130 }, turnY: -90, endX: -575 };

class TownTraffic {
  constructor(seed) {
    const rnd = mulberry32(seed || 1);
    this.seed = seed;
    this.time = 0;
    // Traffic light: green → amber (3 s) → red, random lengths and a random starting point
    this.green = 5 + rnd() * 3;
    this.amber = 3;
    this.red = 6 + rnd() * 4;
    this.offset = rnd() * (this.green + this.amber + this.red);
    // Car in front: two random stops along the left road
    this.brakes = [
      { at: 40 + rnd() * 60, for: 1.5 + rnd() * 1.5 },
      { at: 140 + rnd() * 50, for: 1.5 + rnd() * 1.5 },
    ];
    this.car = { x: LEAD_CAR.start.x, y: LEAD_CAR.start.y, heading: Math.PI, state: 'waiting', travelled: 0, wait: 0, brakeIndex: 0 };
  }

  light(t) {
    const cycle = this.green + this.amber + this.red;
    const p = (t + this.offset) % cycle;
    if (p < this.green) return { color: 'Green', remaining: this.green - p };
    if (p < this.green + this.amber) return { color: 'Yellow', remaining: this.green + this.amber - p };
    return { color: 'Red', remaining: cycle - p };
  }

  step(dt, sim) {
    this.time += dt;
    const car = this.car;
    const { f } = { f: { x: Math.sin(sim.pose.heading), y: Math.cos(sim.pose.heading) } };
    const frontX = sim.pose.x + f.x * 10;
    // The car in front sets off once you cross the stop-sign line
    if (car.state == 'waiting') {
      if (frontX <= STOP_LINE_X && sim.pose.y > 240 && sim.pose.y < 320) car.state = 'driving';
      return;
    }
    if (car.state == 'driving') {
      const brake = this.brakes[car.brakeIndex];
      if (brake && car.travelled >= brake.at) {
        car.state = 'braking';
        car.wait = brake.for;
        car.brakeIndex++;
        return;
      }
      const move = Math.min(LEAD_CAR.speed * dt, car.y - LEAD_CAR.turnY);
      car.y -= move;
      car.travelled += move;
      if (car.y <= LEAD_CAR.turnY) car.state = 'turning';
    } else if (car.state == 'braking') {
      car.wait -= dt;
      if (car.wait <= 0) car.state = 'driving';
    } else if (car.state == 'turning') {
      // Turn right into a driveway, then drive off the road
      car.heading = Math.min(1.5 * Math.PI, car.heading + dt * Math.PI / 2 / 1.2);
      if (car.heading >= 1.5 * Math.PI) car.state = 'leaving';
    } else if (car.state == 'leaving') {
      car.x = Math.max(LEAD_CAR.endX, car.x - 15 * dt);
      if (car.x <= LEAD_CAR.endX) car.state = 'parked';
    }
  }

  snapshot() {
    return { time: this.time, car: { ...this.car } };
  }

  restore(s) {
    this.time = s.time;
    this.car = { ...s.car };
  }

  obstacles() {
    const c = this.car;
    if (c.state == 'parked') return [];
    return [{ x: c.x, y: c.y, heading: c.heading, hw: LEAD_CAR.hw, hl: LEAD_CAR.hl, kind: 'car' }];
  }
}

// Traffic timing used for the "Show me" demo (arrives on red, waits about 4 s)
export const DEMO_SEED = 3;

// The examiner's model answer: used for the "Show me" demo and for testing
export const REFERENCE = `
// 1 Drive straight to the middle of the corner
await R.tankFor(50, 50, 485, 'CM');
// 2 Spin left 90° (each wheel 20 cm)
await R.tankFor(-50, 50, 20, 'CM');
// 3 Drive until the light pad, wait for green
R.tank(50, 50);
while (R.colorName() == 'Black') { await R.tick(); }
if (R.colorName() != 'Green') {
  R.stop();
  while (R.colorName() != 'Green') { await R.tick(); }
}
await R.tankFor(50, 50, 261, 'CM');
// 4 Spin left at the top corner
await R.tankFor(-50, 50, 20, 'CM');
// 5 Roundabout: go around the south side of the island
await R.tankFor(50, 50, 185, 'CM');
await R.tankFor(-50, 50, 10, 'CM');
await R.tankFor(50, 50, 60.8, 'CM');
await R.tankFor(50, -50, 10, 'CM');
await R.tankFor(50, 50, 94, 'CM');
await R.tankFor(50, -50, 10, 'CM');
await R.tankFor(50, 50, 60.8, 'CM');
await R.tankFor(-50, 50, 10, 'CM');
// 6 School zone: slow on yellow
R.tank(50, 50);
while (!R.colorIs('Yellow')) { await R.tick(); }
R.tank(25, 25);
while (R.colorIs('Yellow')) { await R.tick(); }
R.tank(50, 50);
// 7 Stop sign: stop on red for 2 s, then turn left
while (!R.colorIs('Red')) { await R.tick(); }
R.stop();
await R.sleep(2);
await R.tankFor(50, 50, 61, 'CM');
await R.tankFor(-50, 50, 20, 'CM');
// 8 Follow the car until the blue RAMP sign
while (!R.colorIs('Blue')) {
  if (R.distance() < 30) { R.stop(); } else { R.tank(40, 40); }
  await R.tick();
}
// 9 Spiral flyover: to the start of the loop, once round, over the bridge and down the ramp
await R.tankFor(50, 50, 66, 'CM');
await R.tankFor(40, 50, 800, 'CM');
await R.tankFor(50, 50, 360, 'CM');
// 10 Merge: turn left into the main road
await R.tankFor(30, 50, 100, 'CM');
// 11 Park: to the end of the car park, round the middle row, into the empty bay
R.tank(50, 50);
while (R.distance() > 25) { await R.tick(); }
R.stop();
await R.tankFor(-50, 50, 20, 'CM');
await R.tankFor(50, 50, 200, 'CM');
await R.tankFor(-50, 50, 20, 'CM');
await R.tankFor(50, 50, 160, 'CM');
await R.tankFor(50, -50, 20, 'CM');
R.tank(20, 20);
while (R.distance() > 10) { await R.tick(); }
R.stop();
await R.sleep(1.5);
`;
