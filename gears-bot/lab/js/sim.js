// Exact robot simulator: no physics engine, no wheel slip, no momentum.
// The robot moves on perfect arcs worked out from the two wheel speeds,
// so the same program always ends in exactly the same place.

export const ROBOT = {
  wheelCircumference: 40,        // cm: 1 wheel rotation = 40 cm = 1 square
  wheelRadius: 40 / (2 * Math.PI),
  track: 80 / Math.PI,           // cm between wheels: spin 90° = half a wheel rotation
  maxWheelSpeed: 360,            // wheel degrees per second at 100 %
  halfWidth: 14,                 // footprint, wheels included
  halfLength: 10,
  colorSensorAhead: 6,           // colour sensor, cm in front of the centre (looks down)
  sonarAhead: 10,                // ultrasonic sensor, cm in front of the centre
  sonarMax: 255,
};

export const FORK = {
  tineStart: 8,                  // tines run from 8 to 44 cm in front of the centre
  tineEnd: 44,
  halfWidth: 10,
  carryAhead: 40,                // a carried pallet sits exactly 1 square in front
  top: 12,                       // cm the fork can lift
  speed: 12,                     // cm per second
};

export const PALLET_HALF = 9;    // pallets are 18 × 18 cm

export const STEP = 0.01;        // simulation step in seconds

const DEG = Math.PI / 180;

export class Sim {
  constructor(world, seed = 1) {
    this.world = world;
    this.walls = world.walls.map(boxToShape);
    this.reset(seed);
  }

  // seed picks the random parts of a world (traffic light timing, the car in front)
  reset(seed = this.seed) {
    this.seed = seed;
    this.dyn = this.world.createDynamic ? this.world.createDynamic(seed) : null;
    const s = this.world.start;
    this.pose = { x: s.x, y: s.y, heading: s.heading * DEG }; // heading: clockwise from north, never wrapped
    this.time = 0;
    this.motion = null;
    this.wheels = { left: 0, right: 0 };                      // wheel degrees turned
    this.gyroZero = this.pose.heading;
    this.trail = [{ x: s.x, y: s.y }];
    this.bumps = 0;
    this.lastBump = null;
    this.elev = 0;                                          // height above the ground (flyover)
    this.level = this.world.surfaceAt ? this.world.surfaceAt(s.x, s.y, 0) : null;
    this.fork = this.world.robot?.fork ? { height: 0, target: 0, move: null } : null;
    this.pallets = (this.world.pallets || []).map((p, i) => ({
      id: i, color: p.color, x: p.x, y: p.y, heading: 0, carried: false, everLifted: false,
    }));
  }

  // Everything needed to put the world back exactly as it was (for "go back")
  snapshot() {
    const m = this.motion;
    return structuredClone({
      pose: this.pose, time: this.time, wheels: this.wheels, gyroZero: this.gyroZero,
      motion: m && { left: m.left, right: m.right, duration: m.duration, t: m.t, from: m.from, wheelsFrom: m.wheelsFrom },
      trailLen: this.trail.length, bumps: this.bumps, lastBump: this.lastBump, elev: this.elev, level: this.level,
      fork: this.fork && { height: this.fork.height, target: this.fork.target },
      pallets: this.pallets, speech: this.speech ?? '',
      dyn: this.dyn?.snapshot ? this.dyn.snapshot() : null,
    });
  }

  restore(snap) {
    const s = structuredClone(snap);
    Object.assign(this, {
      pose: s.pose, time: s.time, wheels: s.wheels, gyroZero: s.gyroZero, bumps: s.bumps,
      lastBump: s.lastBump, elev: s.elev, level: s.level, pallets: s.pallets, speech: s.speech,
    });
    this.motion = s.motion ? { ...s.motion, done: false, bumped: false } : null;
    this.trail.length = Math.min(this.trail.length, s.trailLen);
    if (this.fork && s.fork) Object.assign(this.fork, s.fork, { move: null });
    if (this.dyn && s.dyn) this.dyn.restore(s.dyn);
  }

  get carried() {
    return this.pallets.find(p => p.carried) || null;
  }

  // Wheel speeds in degrees per second. duration in seconds (Infinity = until told to stop).
  drive(left, right, duration = Infinity) {
    this.motion = {
      left, right, duration, t: 0,
      from: { ...this.pose },
      wheelsFrom: { ...this.wheels },
      done: false, bumped: false,
    };
    if (duration <= 0 || (left == 0 && right == 0 && duration == Infinity)) this.finishMotion();
    return this.motion;
  }

  stop() {
    if (this.motion) this.finishMotion();
  }

  finishMotion() {
    this.motion.done = true;
    this.motion = null;
  }

  // ---- Forklift ----

  // Move the fork to a height (0 = on the floor). Returns a handle with .done
  moveFork(target) {
    const fork = this.fork;
    const move = { done: false };
    if (!fork) { move.done = true; return move; }
    target = Math.max(0, Math.min(FORK.top, target));
    if (target > fork.height && fork.height <= 0.5 && !this.carried) {
      const pallet = this.palletOnFork();
      if (pallet) {
        pallet.carried = true;
        pallet.everLifted = true;
        pallet.relHeading = pallet.heading - this.pose.heading;
      }
    }
    if (fork.move) fork.move.done = true;
    fork.target = target;
    fork.move = move;
    if (target == fork.height) this.finishFork();
    return move;
  }

  finishFork() {
    const fork = this.fork;
    const carried = this.carried;
    if (carried && fork.height == 0) {
      // Put the pallet down where it is
      Object.assign(carried, this.carriedPose(this.pose, carried), { carried: false });
    }
    if (fork.move) fork.move.done = true;
    fork.move = null;
  }

  // A floor pallet sitting on the tines: about 1 square ahead, centred, squared up
  palletOnFork() {
    const { f, r } = axes(this.pose.heading);
    let best = null;
    for (const p of this.pallets) {
      if (p.carried) continue;
      const dx = p.x - this.pose.x, dy = p.y - this.pose.y;
      const ahead = dx * f.x + dy * f.y;
      const side = dx * r.x + dy * r.y;
      const twist = Math.abs(((p.heading - this.pose.heading) / DEG % 90 + 135) % 90 - 45);
      if (ahead >= 30 && ahead <= 46 && Math.abs(side) <= 7 && twist <= 20) {
        if (!best || Math.abs(ahead - 40) < best.score) best = { p, score: Math.abs(ahead - 40) };
      }
    }
    return best ? best.p : null;
  }

  carriedPose(pose, pallet) {
    const { f } = axes(pose.heading);
    return {
      x: pose.x + f.x * FORK.carryAhead,
      y: pose.y + f.y * FORK.carryAhead,
      heading: pose.heading + (pallet.relHeading || 0),
    };
  }

  // ---- Motion ----

  poseAfter(m, tau) {
    const C = ROBOT.wheelCircumference;
    const dl = m.left * tau / 360 * C;
    const dr = m.right * tau / 360 * C;
    const s = (dl + dr) / 2;
    const turn = (dl - dr) / ROBOT.track;      // left wheel further → turn right (clockwise)
    const h0 = m.from.heading;
    if (Math.abs(turn) < 1e-12) {
      return { x: m.from.x + Math.sin(h0) * s, y: m.from.y + Math.cos(h0) * s, heading: h0 };
    }
    const R = s / turn;
    return {
      x: m.from.x + R * (Math.cos(h0) - Math.cos(h0 + turn)),
      y: m.from.y + R * (Math.sin(h0 + turn) - Math.sin(h0)),
      heading: h0 + turn,
    };
  }

  applyMotion(m, tau) {
    m.t = tau;
    this.pose = this.poseAfter(m, tau);
    this.wheels = { left: m.wheelsFrom.left + m.left * tau, right: m.wheelsFrom.right + m.right * tau };
    const carried = this.carried;
    if (carried) Object.assign(carried, this.carriedPose(this.pose, carried));
    const last = this.trail[this.trail.length - 1];
    if (Math.hypot(this.pose.x - last.x, this.pose.y - last.y) >= 1) {
      this.trail.push({ x: this.pose.x, y: this.pose.y, z: this.elev || 0 });
    }
  }

  step(dt = STEP) {
    this.time += dt;
    this.dyn?.step(dt, this);
    this.stepFork(dt);
    const m = this.motion;
    if (!m) return;
    const prev = m.t;
    const next = Math.min(prev + dt, m.duration);
    if (this.hits(this.poseAfter(m, next))) {
      // Find the last safe moment, stop there and report a bump
      let lo = prev, hi = next;
      for (let i = 0; i < 14; i++) {
        const mid = (lo + hi) / 2;
        if (this.hits(this.poseAfter(m, mid))) hi = mid; else lo = mid;
      }
      this.applyMotion(m, lo);
      m.bumped = true;
      this.bumps++;
      this.lastBump = { time: this.time, x: this.pose.x, y: this.pose.y };
      this.finishMotion();
      this.updateLevel();
      return;
    }
    this.applyMotion(m, next);
    if (next >= m.duration) this.finishMotion();
    this.updateLevel();
  }

  // Which road surface (and how high) the robot is on, for worlds with a flyover
  updateLevel() {
    if (!this.world.surfaceAt) return;
    this.level = this.world.surfaceAt(this.pose.x, this.pose.y, this.elev);
    this.elev = this.level.elev;
  }

  stepFork(dt) {
    const fork = this.fork;
    if (!fork || !fork.move) return;
    const change = FORK.speed * dt;
    if (Math.abs(fork.target - fork.height) <= change) {
      fork.height = fork.target;
      this.finishFork();
    } else {
      fork.height += Math.sign(fork.target - fork.height) * change;
    }
  }

  // ---- Collisions ----

  // Everything that moves with the robot at this pose
  robotShapes(pose) {
    const { f } = axes(pose.heading);
    const at = ahead => ({ x: pose.x + f.x * ahead, y: pose.y + f.y * ahead });
    const shapes = [{ ...pose, hw: ROBOT.halfWidth, hl: ROBOT.halfLength, kind: 'body' }];
    if (this.fork) {
      const mid = (FORK.tineStart + FORK.tineEnd) / 2;
      shapes.push({ ...at(mid), heading: pose.heading, hw: FORK.halfWidth, hl: (FORK.tineEnd - FORK.tineStart) / 2, kind: 'fork' });
      const carried = this.carried;
      if (carried) shapes.push({ ...this.carriedPose(pose, carried), hw: PALLET_HALF, hl: PALLET_HALF, kind: 'pallet' });
    }
    return shapes;
  }

  floorPallets() {
    return this.pallets.filter(p => !p.carried).map(p => ({ x: p.x, y: p.y, heading: p.heading, hw: PALLET_HALF, hl: PALLET_HALF }));
  }

  // Things to bump into: walls, pallets on the floor, moving cars
  obstacles() {
    return [...this.walls, ...(this.dyn ? this.dyn.obstacles() : [])];
  }

  hits(pose) {
    const floor = this.floorPallets();
    const solids = this.obstacles();
    const forkUp = this.fork && this.fork.height > 1;
    return this.robotShapes(pose).some(shape => {
      if (solids.some(w => overlaps(shape, w))) return true;
      // Lowered tines slide under pallets; raised tines hit them
      if (shape.kind == 'fork' && !forkUp) return false;
      return floor.some(p => overlaps(shape, p));
    });
  }

  // ---- Sensors ----

  colorName() {
    const { f } = axes(this.pose.heading);
    const x = this.pose.x + f.x * ROBOT.colorSensorAhead;
    const y = this.pose.y + f.y * ROBOT.colorSensorAhead;
    if (this.world.colorAt) return this.world.colorAt(x, y, this.dyn, this.elev);
    return this.world.zoneAt(x, y) || 'White';
  }

  distance() {
    const { f } = axes(this.pose.heading);
    const ox = this.pose.x + f.x * ROBOT.sonarAhead;
    const oy = this.pose.y + f.y * ROBOT.sonarAhead;
    let best = ROBOT.sonarMax;
    for (const shape of [...this.obstacles(), ...this.floorPallets()]) {
      const t = rayHits(ox, oy, f.x, f.y, shape);
      if (t != null && t < best) best = t;
    }
    return Math.round(best * 10) / 10;
  }

  gyro() {
    return Math.round((this.pose.heading - this.gyroZero) / DEG);
  }

  resetGyro() {
    this.gyroZero = this.pose.heading;
  }

  touchPressed() {
    const { f } = axes(this.pose.heading);
    const nudged = { ...this.pose, x: this.pose.x + f.x * 0.5, y: this.pose.y + f.y * 0.5 };
    return this.hits(nudged);
  }
}

// ---- Geometry helpers ----

export function axes(heading) {
  return {
    f: { x: Math.sin(heading), y: Math.cos(heading) },   // forward
    r: { x: Math.cos(heading), y: -Math.sin(heading) },  // right
  };
}

function boxToShape(b) {
  return { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2, heading: 0, hw: (b.maxX - b.minX) / 2, hl: (b.maxY - b.minY) / 2 };
}

// Two rotated rectangles overlap (separating axis test); touching does not count
export function overlaps(a, b) {
  const A = axes(a.heading), B = axes(b.heading);
  const dx = b.x - a.x, dy = b.y - a.y;
  for (const axis of [A.r, A.f, B.r, B.f]) {
    const ra = a.hw * Math.abs(A.r.x * axis.x + A.r.y * axis.y) + a.hl * Math.abs(A.f.x * axis.x + A.f.y * axis.y);
    const rb = b.hw * Math.abs(B.r.x * axis.x + B.r.y * axis.y) + b.hl * Math.abs(B.f.x * axis.x + B.f.y * axis.y);
    if (Math.abs(dx * axis.x + dy * axis.y) >= ra + rb - 1e-9) return false;
  }
  return true;
}

// Distance along a ray to a rotated rectangle, or null when it misses
export function rayHits(ox, oy, dx, dy, s) {
  const { r, f } = axes(s.heading);
  const px = ox - s.x, py = oy - s.y;
  const local = [
    [px * r.x + py * r.y, dx * r.x + dy * r.y, s.hw],
    [px * f.x + py * f.y, dx * f.x + dy * f.y, s.hl],
  ];
  let tmin = -Infinity, tmax = Infinity;
  for (const [o, d, h] of local) {
    if (Math.abs(d) < 1e-12) {
      if (o < -h || o > h) return null;
    } else {
      let t1 = (-h - o) / d, t2 = (h - o) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
    }
  }
  if (tmax < Math.max(tmin, 0)) return null;
  return Math.max(tmin, 0);
}
