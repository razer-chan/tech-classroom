/* Lesson 3 — Animate Your Name (activity lesson) */
(function () {
  'use strict';
  const F = 'Lesson 3 - Animate Your Name';
  const COLOURS = ['#4c97ff', '#9966ff', '#e2574c', '#ffab19', '#59c059', '#ff8c1a', '#cf63cf', '#2e8eb8'];

  // Each effect: Scratch blocks + the steps that animate a letter tile.
  // Step i = index of the block it lights up (0 is the hat block).
  const FX = {
    grow: {
      name: 'Grow and shrink', idea: 'sequence',
      code: 'when this sprite clicked\nset size to (150) %\nwait (0.4) seconds\nset size to (100) %',
      steps: [[1, { size: 150 }, 200], [2, null, 400], [3, { size: 100 }, 200]],
    },
    jump: {
      name: 'Jump up and down', idea: 'y goes up',
      code: 'when this sprite clicked\nchange y by (60)\nwait (0.4) seconds\nchange y by (-60)',
      steps: [[1, { y: 60 }, 200], [2, null, 400], [3, { y: 0 }, 200]],
    },
    slide: {
      name: 'Slide side to side', idea: 'x goes right',
      code: 'when this sprite clicked\nchange x by (60)\nwait (0.4) seconds\nchange x by (-60)',
      steps: [[1, { x: 60 }, 200], [2, null, 400], [3, { x: 0 }, 200]],
    },
    spin: {
      name: 'Spin around', idea: 'repeat loop',
      code: 'when this sprite clicked\nrepeat (12)\n  turn right (30) degrees\n  wait (0.04) seconds',
      steps: [[1, null, 100], ...Array.from({ length: 12 }, (_, k) => [2, { rot: 30 * (k + 1) }, 45])],
      after: { rot: 0 },
    },
    colour: {
      name: 'Colour flash', idea: 'repeat loop',
      code: 'when this sprite clicked\nrepeat (8)\n  change [color v] effect by (25)\n  wait (0.1) seconds\nclear graphic effects',
      steps: [[1, null, 100], ...Array.from({ length: 8 }, (_, k) => [2, { hue: 25 * (k + 1) }, 100]), [4, { hue: 0 }, 80]],
    },
    fly: {
      name: 'Fly away and back', idea: 'glide',
      code: 'when this sprite clicked\nglide (0.5) secs to x: (80) y: (90)\nglide (0.5) secs to x: (0) y: (0)',
      steps: [[1, { x: 80, y: 90 }, 500], [2, { x: 0, y: 0 }, 500]],
    },
  };
  const ORDER = ['grow', 'jump', 'slide', 'spin', 'colour', 'fly'];

  /** A letter tile that can play an effect. */
  function tile(letter, colour) {
    const el = document.createElement('button');
    el.className = 'letter';
    el.textContent = letter;
    el.style.background = colour;
    const s = { x: 0, y: 0, size: 100, rot: 0, hue: 0 };
    const runner = new Runner();
    const apply = () => {
      el.style.transform = `translate(${s.x}px, ${-s.y}px) rotate(${s.rot}deg) scale(${s.size / 100})`;
      el.style.filter = s.hue ? `hue-rotate(${s.hue * 1.8}deg)` : '';
    };
    function play(fx, code) {
      return runner.run(async (api) => {
        Object.assign(s, { x: 0, y: 0, size: 100, rot: 0, hue: 0 }); apply();
        if (code) code.light(0);
        await api.wait(150);
        for (const [i, target, ms] of fx.steps) {
          if (code) code.light(i);
          if (!target) { await api.wait(ms); continue; }
          const from = { ...s };
          await api.tween(ms, (t) => { for (const k in target) s[k] = from[k] + (target[k] - from[k]) * t; apply(); });
        }
        if (fx.after) { Object.assign(s, fx.after); apply(); }
        if (code) code.clear();
      });
    }
    return { el, play, stop: () => runner.stop() };
  }

  function codeInto(host, text, size) {
    host.innerHTML = '';
    const c = SB.render(text, { className: size || 'm' });
    host.appendChild(c.el);
    return c;
  }

  SC.lesson({
    num: 3,
    title: 'Animate Your Name',
    tag: 'ACTIVITY',
    colour: '#624b78',
    summary: 'Activity: every letter of your name is a sprite with its own little show.',
    ideas: ['events', 'sequence', 'repeat', 'test & fix'],
    files: [
      { name: 'Animate Your Name - Demo.sb3', href: SC.file(F, 'Animate Your Name - Demo.sb3'), note: 'Teacher demo: F R A N K, a different effect on each letter (code notes in English + Chinese)' },
      { name: 'Animate Your Name - Simple Glide.sb3', href: SC.file(F, 'Animate Your Name - Simple Glide.sb3'), note: 'One sprite that glides around — a simple starting idea' },
    ],
    slides: [
      {
        nav: 'Welcome', className: 'split',
        html: `<div>
            <p class="eyebrow"><span></span>LESSON 3 · ACTIVITY</p>
            <h1>Animate<br><em>your name.</em></h1>
            <p class="lead">Every letter is a sprite. Click a letter and it puts on its own little show.</p>
            <p style="margin-top:34px"><button class="btn" data-act="next">See an example →</button></p>
          </div>
          <div class="name-stage" data-name style="height:360px"></div>`,
        enter(el) {
          const host = el.querySelector('[data-name]'); host.innerHTML = '';
          const tiles = [...'NAME'].map((ch, i) => tile(ch, COLOURS[i]));
          tiles.forEach((t) => host.appendChild(t.el));
          const r = new Runner();
          r.run(async (api) => {
            for (let k = 0; ; k = (k + 1) % tiles.length) {
              await tiles[k].play(FX[ORDER[k % ORDER.length]]);
              await api.wait(250);
            }
          });
          return () => { r.stop(); tiles.forEach((t) => t.stop()); };
        },
      },
      {
        nav: 'Try it', className: 'top',
        html: `<div class="heading-row">
            <div><p class="eyebrow"><span></span>WHAT YOU'LL MAKE</p><h2>Click a letter.<br><em>Watch it go.</em></h2></div>
            <div class="col" style="align-items:flex-end">
              <label class="row" style="font-size:20px;font-weight:800;gap:12px">Type a name <input class="name-input" data-input maxlength="8" value="SCRATCH" aria-label="Name"></label>
              <span class="small">Each letter gets a different effect.</span>
            </div>
          </div>
          <div class="row" style="align-items:stretch">
            <div class="name-stage" data-name style="flex:1;height:auto;min-height:420px"></div>
            <div class="code-panel" style="width:520px">
              <p class="pill" data-fxname>Click a letter</p>
              <div data-code style="margin-top:16px"></div>
            </div>
          </div>`,
        enter(el) {
          const host = el.querySelector('[data-name]');
          const input = el.querySelector('[data-input]');
          const codeHost = el.querySelector('[data-code]');
          const label = el.querySelector('[data-fxname]');
          let tiles = [];
          const build = () => {
            tiles.forEach((t) => t.stop());
            host.innerHTML = '';
            const letters = [...input.value.toUpperCase().replace(/[^A-Z0-9]/g, '')].slice(0, 8);
            tiles = letters.map((ch, i) => {
              const t = tile(ch, COLOURS[i % COLOURS.length]);
              const fx = FX[ORDER[i % ORDER.length]];
              t.el.addEventListener('click', () => {
                host.querySelectorAll('.letter').forEach((b) => b.classList.remove('picked'));
                t.el.classList.add('picked');
                label.textContent = `${ch} · ${fx.name.toUpperCase()}`;
                t.play(fx, codeInto(codeHost, fx.code, 'l'));
              });
              host.appendChild(t.el);
              return t;
            });
          };
          input.addEventListener('input', build);
          build();
          return () => { tiles.forEach((t) => t.stop()); input.removeEventListener('input', build); };
        },
      },
      {
        nav: 'One letter = one sprite', className: 'split',
        html: `<div>
            <p class="eyebrow"><span></span>HOW ONE LETTER WORKS</p>
            <h2>Event on top.<br><em>Sequence below.</em></h2>
            <p class="lead">Each letter is its own sprite with its own script. Clicking it is the <b>event</b>. The blocks under it run in <b>order</b>.</p>
            <div class="question">Predict: what will this letter do?</div>
            <p style="margin-top:24px"><button class="btn" data-run>Click the letter</button></p>
          </div>
          <div class="col" style="align-items:center;gap:30px">
            <div class="name-stage" data-name style="width:100%;height:260px"></div>
            <div class="code-panel" data-code></div>
          </div>`,
        enter(el) {
          const host = el.querySelector('[data-name]'); host.innerHTML = '';
          const t = tile('A', COLOURS[0]);
          host.appendChild(t.el);
          const c = codeInto(el.querySelector('[data-code]'), FX.grow.code, 'l');
          const go = () => t.play(FX.grow, c);
          t.el.addEventListener('click', go);
          const on = (e) => { if (e.target.closest('[data-run]')) go(); };
          el.addEventListener('click', on);
          return () => { t.stop(); el.removeEventListener('click', on); };
        },
      },
      {
        nav: 'Effect menu', className: 'top',
        html: `<div class="heading-row">
            <div><p class="eyebrow"><span></span>PICK YOUR EFFECTS</p><h2>The <em>effect menu.</em></h2></div>
            <p class="lead">Click a card to see it. Use a different one for each letter.</p>
          </div>
          <div class="grid-3" data-cards></div>`,
        enter(el) {
          const grid = el.querySelector('[data-cards]'); grid.innerHTML = '';
          const items = ORDER.map((key, i) => {
            const fx = FX[key];
            const card = document.createElement('div');
            card.className = 'card effect-card';
            card.innerHTML = `<div class="row" style="align-items:flex-start;gap:16px"><div class="tile" style="width:130px;flex:none"></div><div data-code></div></div><h3 style="margin-top:6px;font-size:24px">${fx.name} <span class="pill" style="font-size:13px;vertical-align:4px">${fx.idea}</span></h3>`;
            const t = tile('ABCDEF'[i], COLOURS[i]);
            card.querySelector('.tile').appendChild(t.el);
            const c = codeInto(card.querySelector('[data-code]'), fx.code, 's');
            card.addEventListener('click', () => {
              grid.querySelectorAll('.effect-card').forEach((x) => x.classList.remove('on'));
              card.classList.add('on');
              t.play(fx, c);
            });
            grid.appendChild(card);
            return t;
          });
          return () => items.forEach((t) => t.stop());
        },
      },
      {
        nav: 'Build it', className: 'split-wide',
        html: `<div>
            <p class="eyebrow"><span></span>HOW TO BUILD IT</p>
            <h2>Step by <em>step.</em></h2>
            <p class="lead">Teacher shows it once. Then you go.</p>
          </div>
          <ol class="steps">
            <li><span>Delete the cat.<small>Right-click the cat in the sprite list → delete.</small></span></li>
            <li><span>Choose a Sprite → <b>Letters</b>.<small>Add each letter of your name (the 🐱 button, bottom right).</small></span></li>
            <li><span>Drag the letters into a line on the stage.</span></li>
            <li><span>Click one letter in the sprite list.<small>Drag in <b>when this sprite clicked</b> from Events.</small></span></li>
            <li><span>Snap effect blocks underneath.<small>Pick one from the effect menu — or make your own.</small></span></li>
            <li><span>Click the letter on the stage to test. Fix it. Next letter!</span></li>
          </ol>`,
      },
      {
        nav: 'Make it smooth', className: 'top',
        html: `<div><p class="eyebrow"><span></span>TIPS</p><h2>Make it <em>smooth.</em></h2></div>
          <div class="grid-3" style="align-items:start">
            <div class="card">
              <h3>Come back home</h3>
              <pre class="blocks" data-size="m">change y by (60)
wait (0.4) seconds
change y by (-60)</pre>
              <p style="margin-top:12px">Go up 60, come down 60. Same number, opposite sign.</p>
            </div>
            <div class="card">
              <h3>Slow it down</h3>
              <pre class="blocks" data-size="m">set size to (150) %
wait (0.4) seconds
set size to (100) %</pre>
              <p style="margin-top:12px">No <b>wait</b>? It happens too fast to see.</p>
            </div>
            <div class="card">
              <h3>Reset with the flag</h3>
              <pre class="blocks" data-size="m">when @flag clicked
set size to (100) %
clear graphic effects
point in direction (90)</pre>
              <p style="margin-top:12px">If a letter gets stuck big or upside down, the flag fixes it.</p>
            </div>
          </div>
          <div class="tip"><b>Sound?</b> Use <b>start sound</b>, not <b>play sound until done</b> — then the letter moves while the sound plays. <b>One letter at a time:</b> test it before you start the next.</div>`,
      },
      {
        nav: 'Your turn', className: 'split-wide',
        html: `<div>
            <p class="eyebrow"><span></span>YOUR TURN · 35 MIN</p>
            <h2>Animate<br><em>your name.</em></h2>
            <div class="tip" style="margin-top:24px"><b>Save it:</b> File → Save to your computer.<br>Name it <b>Firstname - Name Animation.sb3</b></div>
            <div class="files" style="margin-top:20px">
              <a class="file" href="${SC.file(F, 'Animate Your Name - Demo.sb3')}" download>Animate Your Name - Demo.sb3 <small>teacher demo</small></a>
              <a class="file" href="${SC.file(F, 'Animate Your Name - Simple Glide.sb3')}" download>Simple Glide.sb3 <small>starting idea</small></a>
            </div>
          </div>
          <div class="col">
            <div class="card">
              <h3>Checklist</h3>
              <ul class="checks" style="margin-top:12px">
                <li>At least 3 letters of my name (the whole name if I can)</li>
                <li>Every letter has <b>when this sprite clicked</b></li>
                <li>Each letter does something different</li>
                <li>At least one effect uses <b>repeat</b></li>
                <li>I tested every letter and fixed what didn't work</li>
                <li>I saved my project</li>
              </ul>
            </div>
            <div class="tip"><b>Done?</b> Add a backdrop and sounds · make one letter glide around the whole name · press a key to animate every letter at once.</div>
          </div>`,
      },
      {
        nav: 'Show and share', className: 'top',
        html: `<div class="center-col" style="display:grid"><p class="eyebrow"><span></span>SHOW AND SHARE</p><h2>Click someone<br><em>else's name.</em></h2></div>
          <div class="col" style="gap:26px">
            <p class="lead" style="margin:0 auto;text-align:center">Leave your project open. Walk around and click the letters on other screens.</p>
            <div class="grid-3">
              <div class="card"><h3>Which event starts each letter?</h3><button class="reveal-btn">Answer</button><p class="reveal">when this sprite clicked (and maybe when 🏁 clicked to reset).</p></div>
              <div class="card"><h3>Point to a sequence.</h3><button class="reveal-btn">Answer</button><p class="reveal">The blocks under the hat — they run top to bottom.</p></div>
              <div class="card"><h3>Point to a loop.</h3><button class="reveal-btn">Answer</button><p class="reveal">A repeat block, e.g. repeat 12 → turn 30 = one full spin.</p></div>
            </div>
          </div>`,
      },
    ],
  });
})();
