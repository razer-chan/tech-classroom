// Runs the code generated from the blocks against the simulator.
// The program only moves forward when the simulation clock ticks, so timing is
// the same on every computer, at every playback speed, and when re-run for marking.
import { ROBOT, FORK, STEP } from './sim.js?v=4636962f';

export const STOP = Symbol('stop');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const SIMPLE_SPEED = 50; // % used by "move … cm" and "spin … degrees"

// Note name → Hz (equal temperament, A4 = 440)
const NOTE_STEPS = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
export function noteHz(name) {
  const m = /^([A-G])(#?)(\d)$/.exec(name) || [];
  const steps = (NOTE_STEPS[m[1]] ?? 0) + (m[2] ? 1 : 0) + ((+m[3] || 4) - 4) * 12;
  return Math.round(440 * 2 ** (steps / 12) * 100) / 100;
}

export class Runner {
  constructor(sim, hooks = {}) {
    this.sim = sim;
    this.hooks = hooks;   // onHighlight(id), onSay(text), onTone(hz, seconds), onFork(dir), onEnd(result)
    this.waiters = [];
    this.running = false;
    this.stopped = false;
    this.token = 0;
    this.api = this.makeApi();
  }

  async run(code) {
    const token = ++this.token;
    this.running = true;
    this.stopped = false;
    let result = { ok: true };
    try {
      await new AsyncFunction('R', code)(this.api);
    } catch (e) {
      result = e === STOP ? { ok: true, stopped: true } : { ok: false, error: e };
    }
    // A newer run has already started: leave it alone
    if (token != this.token) return result;
    this.sim.stop();
    this.running = false;
    this.hooks.onHighlight?.(null);
    this.hooks.onEnd?.(result);
    return result;
  }

  stop() {
    if (!this.running) return;
    this.stopped = true;
    const waiters = this.waiters;
    this.waiters = [];
    waiters.forEach(w => w.reject(STOP));
  }

  // Call after every simulation step
  afterStep() {
    if (!this.waiters.length) return;
    const still = [];
    for (const w of this.waiters) {
      if (w.ready()) w.resolve(); else still.push(w);
    }
    this.waiters = still;
  }

  wait(ready) {
    return new Promise((resolve, reject) => this.waiters.push({ ready, resolve, reject }));
  }

  check() {
    if (this.stopped) throw STOP;
  }

  makeApi() {
    const sim = this.sim;
    const num = v => (Number.isFinite(+v) ? +v : 0);
    const pct = v => Math.max(-100, Math.min(100, num(v))) / 100 * ROBOT.maxWheelSpeed;

    const driveAndWait = async (left, right, duration) => {
      this.check();
      const m = sim.drive(left, right, duration);
      await this.wait(() => m.done);
    };

    // Move until the faster wheel has turned `degrees` (like ev3dev2 on_for_degrees)
    const driveDegrees = (left, right, degrees) => {
      if (degrees < 0) { left = -left; right = -right; degrees = -degrees; }
      const fastest = Math.max(Math.abs(left), Math.abs(right));
      if (fastest == 0 || degrees == 0) return api.tick();
      return driveAndWait(left, right, degrees / fastest);
    };

    const forkTo = async height => {
      this.check();
      const target = Math.max(0, Math.min(FORK.top, height));
      if (sim.fork && target != sim.fork.height) this.hooks.onFork?.(target > sim.fork.height ? 'up' : 'down');
      const move = sim.moveFork(height);
      await this.wait(() => move.done);
    };

    const api = {
      hl: id => {
        this.check();
        this.hooks.onHighlight?.(id);
      },
      tick: async () => {
        this.check();
        const t = sim.time;
        await this.wait(() => sim.time > t);
      },
      sleep: async seconds => {
        this.check();
        const end = sim.time + Math.max(0, num(seconds)) - 1e-9;
        await this.wait(() => sim.time >= end);
      },

      // Motion
      moveCm: (direction, cm) => {
        const speed = pct(SIMPLE_SPEED) * (direction == 'BACK' ? -1 : 1);
        return driveDegrees(speed, speed, num(cm) / ROBOT.wheelCircumference * 360);
      },
      spin: (direction, degrees) => {
        const speed = pct(SIMPLE_SPEED) * (direction == 'LEFT' ? -1 : 1);
        // Spinning 90° turns each wheel 180°
        return driveDegrees(speed, -speed, num(degrees) * 2);
      },
      tankFor: (left, right, amount, units) => {
        const l = pct(left), r = pct(right), a = num(amount);
        if (units == 'SECONDS') return driveAndWait(l, r, Math.max(0, a));
        // CM: how far the faster wheel rolls
        const degrees = units == 'CM' ? a / ROBOT.wheelCircumference * 360 : units == 'ROTATIONS' ? a * 360 : a;
        return driveDegrees(l, r, degrees);
      },
      tank: (left, right) => {
        this.check();
        sim.drive(pct(left), pct(right));
      },
      stop: () => {
        this.check();
        sim.stop();
      },

      // Forklift
      forkUp: () => forkTo(FORK.top),
      forkDown: () => forkTo(0),

      // Sensors
      colorName: () => sim.colorName(),
      colorIs: name => sim.colorName() == name,
      distance: () => sim.distance(),
      gyro: () => sim.gyro(),
      resetGyro: () => sim.resetGyro(),
      touch: () => sim.touchPressed(),

      // Looks and sound
      say: text => {
        this.check();
        sim.speech = text == null ? '' : String(text);
        this.hooks.onSay?.(sim.speech);
      },
      tone: async (hz, seconds) => {
        this.check();
        const s = Math.max(0, Math.min(10, num(seconds)));
        this.hooks.onTone?.(Math.max(20, Math.min(10000, num(hz))), s);
        await api.sleep(s);
      },
      note: (name, seconds) => api.tone(noteHz(name), seconds),
      beep: () => api.tone(880, 0.25),
      // Forklift warning: two short high beeps
      safetySound: async () => {
        await api.tone(1200, 0.2);
        await api.sleep(0.1);
        await api.tone(1200, 0.2);
      },
    };
    return api;
  }
}

// Let the program react to the last step: it runs until it waits again (or ends)
async function settle(runner) {
  for (let i = 0; i < 5000 && runner.running && runner.waiters.length == 0; i++) await null;
  if (runner.running && runner.waiters.length == 0) await new Promise(r => setTimeout(r, 0));
}

// One simulation step, then let the program catch up
export async function advance(sim, runner, afterStep) {
  sim.step(STEP);
  afterStep?.();
  runner.afterStep();
  if (runner.waiters.length == 0) await settle(runner);
}

// When a program ends the robot stops. The examiner keeps watching it for this long,
// so "stop in the bay" counts even if the program ends right there.
export const WATCH_AFTER = 1.5;

// Runs a whole program as fast as possible (tests and marking)
export async function runHeadless(sim, runner, code, { maxSeconds = 600, afterStep, watchAfter = 0 } = {}) {
  const done = runner.run(code);
  await settle(runner);
  while (runner.running && sim.time < maxSeconds) {
    await advance(sim, runner, afterStep);
  }
  const timedOut = runner.running;
  if (timedOut) runner.stop();
  const result = await done;
  const endedAt = sim.time;
  if (!timedOut) {
    for (let i = Math.round(watchAfter / STEP); i > 0; i--) { sim.step(STEP); afterStep?.(); }
  }
  return { ...result, timedOut, endedAt };
}
