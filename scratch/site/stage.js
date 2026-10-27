/* A tiny Scratch-like stage for slide demos.
 * Coordinates work like Scratch: 480 x 360, (0,0) in the centre, y goes up,
 * direction 90 = facing right. Every animation can be stopped with stop().
 */
(function () {
  'use strict';

  const STOP = Symbol('stop');

  /** Runs one cancellable animation at a time (used by MiniStage and other demos). */
  class Runner {
    constructor() { this.gen = 0; }
    stop() { this.gen++; }

    /** Run an async demo. A newer run (or stop()) cancels the older one quietly. */
    run(fn) {
      this.stop();
      const gen = this.gen;
      const api = {
        alive: () => gen === this.gen,
        wait: (ms) => this.wait(ms, gen),
        tween: (ms, step) => this.tween(ms, step, gen),
      };
      return Promise.resolve().then(() => fn(api)).catch((e) => { if (e !== STOP) throw e; });
    }

    wait(ms, gen = this.gen) {
      return new Promise((resolve, reject) => {
        setTimeout(() => (gen === this.gen ? resolve() : reject(STOP)), ms);
      });
    }

    tween(ms, step, gen = this.gen) {
      return new Promise((resolve, reject) => {
        const start = performance.now();
        const frame = (now) => {
          if (gen !== this.gen) return reject(STOP);
          const t = Math.min(1, (now - start) / ms);
          step(t);
          if (t < 1) requestAnimationFrame(frame); else resolve();
        };
        requestAnimationFrame(frame);
      });
    }
  }

  class MiniStage extends Runner {
    constructor(host, opts = {}) {
      super();
      this.el = document.createElement('div');
      this.el.className = 'mini-stage' + (opts.className ? ' ' + opts.className : '');
      if (opts.background) this.el.style.background = opts.background;
      this.pen = document.createElement('canvas');
      this.pen.width = 960; this.pen.height = 720;
      this.pen.className = 'mini-pen';
      this.el.appendChild(this.pen);
      this.ctx = this.pen.getContext('2d');
      host.appendChild(this.el);
      this.sprites = [];
    }

    sprite(opts) {
      const s = new Sprite(this, opts);
      this.sprites.push(s);
      return s;
    }

    /** Stop every running animation on this stage. */
    stop() { super.stop(); (this.sprites || []).forEach((s) => s.say('')); }

    clearPen() { this.ctx.clearRect(0, 0, this.pen.width, this.pen.height); }

    line(x1, y1, x2, y2, colour) {
      const c = this.ctx;
      c.strokeStyle = colour || '#f4bd24';
      c.lineWidth = 8; c.lineCap = 'round';
      c.beginPath(); c.moveTo((x1 + 240) * 2, (180 - y1) * 2); c.lineTo((x2 + 240) * 2, (180 - y2) * 2); c.stroke();
    }

    destroy() { this.stop(); this.el.remove(); }
  }

  class Sprite {
    constructor(stage, o) {
      this.stage = stage;
      this.x = o.x || 0; this.y = o.y || 0; this.dir = o.dir ?? 90;
      this.size = o.size ?? 100; this.width = o.width || 90;
      this.rotate = o.rotate !== false;
      this.penColour = o.pen || null;
      this.colour = 0; this.bright = 0;
      this.el = document.createElement('div');
      this.el.className = 'mini-sprite' + (o.className ? ' ' + o.className : '');
      this.el.style.width = (this.width / 480 * 100) + '%';
      if (o.img) { this.img = document.createElement('img'); this.img.src = o.img; this.img.alt = o.alt || ''; this.el.appendChild(this.img); }
      if (o.html) this.el.innerHTML = o.html;
      this.bubble = document.createElement('div');
      this.bubble.className = 'mini-bubble';
      stage.el.appendChild(this.el);
      stage.el.appendChild(this.bubble);
      if (o.onClick) { this.el.classList.add('clickable'); this.el.addEventListener('click', o.onClick); }
      this.draw();
    }

    draw() {
      const left = (this.x + 240) / 480 * 100, top = (180 - this.y) / 360 * 100;
      this.el.style.left = left + '%';
      this.el.style.top = top + '%';
      const turn = this.rotate ? this.dir - 90 : 0;
      this.el.style.transform = `translate(-50%, -50%) rotate(${turn}deg) scale(${this.size / 100})`;
      this.el.style.filter = (this.colour ? `hue-rotate(${this.colour * 1.8}deg) ` : '') + (this.bright ? `brightness(${1 + this.bright / 100})` : '');
      this.bubble.style.left = left + '%';
      this.bubble.style.top = top + '%';
    }

    set(o) { Object.assign(this, o); this.draw(); return this; }

    say(text) {
      this.bubble.textContent = text || '';
      this.bubble.classList.toggle('show', !!text);
    }

    async glide(x, y, ms, api) {
      const x0 = this.x, y0 = this.y;
      let px = x0, py = y0;
      await api.tween(ms, (t) => {
        this.x = x0 + (x - x0) * t; this.y = y0 + (y - y0) * t;
        if (this.penColour) { this.stage.line(px, py, this.x, this.y, this.penColour); px = this.x; py = this.y; }
        this.draw();
      });
    }

    move(steps, ms, api) {
      const r = (90 - this.dir) * Math.PI / 180;
      return this.glide(this.x + steps * Math.cos(r), this.y + steps * Math.sin(r), ms, api);
    }

    async turn(deg, ms, api) {
      const d0 = this.dir;
      await api.tween(ms, (t) => { this.dir = d0 + deg * t; this.draw(); });
    }
  }

  window.MiniStage = MiniStage;
  window.Runner = Runner;
})();
