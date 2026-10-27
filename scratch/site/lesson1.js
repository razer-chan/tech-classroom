/* Lesson 1 — Events & Sequence */
(function () {
  'use strict';
  const F = 'Lesson 1 - Events and Sequence';

  // ---------- the robot maze (slides 3 and 5) ----------
  // Grid: 5 columns; row -1 = finish, rows 0–4 = ring around a blocked middle, row 5 = start.
  const ROUTES = {
    a: [['Move forward', 1], ['Turn left'], ['Move forward', 2], ['Turn right'], ['Move forward', 4], ['Turn right'], ['Move forward', 2], ['Turn left'], ['Move forward', 1]],
    b: [['Move forward', 1], ['Turn right'], ['Move forward', 2], ['Turn left'], ['Move forward', 4], ['Turn left'], ['Move forward', 2], ['Turn right'], ['Move forward', 1]],
  };
  const CELL = 80, X0 = 50, Y0 = 40;
  const cx = (c) => X0 + c * CELL + CELL / 2;
  const cy = (r) => Y0 + (r + 1) * CELL + CELL / 2;

  function mazeSvg() {
    let cells = '';
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      if (r > 0 && r < 4 && c > 0 && c < 4) continue;
      cells += `<rect class="cell" x="${X0 + c * CELL + 3}" y="${Y0 + (r + 1) * CELL + 3}" width="${CELL - 6}" height="${CELL - 6}" rx="12"/>`;
    }
    return `<svg viewBox="0 0 500 600" role="img" aria-label="A maze with a blocked middle">
      <rect class="cell finish" x="${X0 + 2 * CELL + 3}" y="${Y0 + 3}" width="${CELL - 6}" height="${CELL - 6}" rx="12"/>
      <text class="maze-label" x="250" y="30" text-anchor="middle">FINISH</text>
      ${cells}
      <rect class="wall" x="${X0 + CELL + 6}" y="${Y0 + 2 * CELL + 6}" width="${3 * CELL - 12}" height="${3 * CELL - 12}" rx="20"/>
      <text class="maze-core" x="250" y="${Y0 + 3.5 * CELL}" text-anchor="middle">BLOCKED</text>
      <rect class="cell start" x="${X0 + 2 * CELL + 3}" y="${Y0 + 6 * CELL + 3}" width="${CELL - 6}" height="${CELL - 6}" rx="12"/>
      <text class="maze-label" x="250" y="${Y0 + 7 * CELL + 22}" text-anchor="middle">START</text>
      <polyline class="trail-a" points=""/><polyline class="trail-b" points=""/>
      <text x="250" y="${Y0 + 25}" text-anchor="middle" font-size="40">⭐</text>
      <g class="robot"><circle r="26" fill="#624b78"/><rect x="-15" y="-12" width="30" height="20" rx="6" fill="#fff"/><circle cx="-6" cy="-2" r="4" fill="#20221f"/><circle cx="6" cy="-2" r="4" fill="#20221f"/><path d="M0 -26 L-9 -36 L9 -36 Z" fill="#f4bd24"/></g>
    </svg>`;
  }

  function cmdList(route, extra = '') {
    return `<div class="cmd-list ${route} ${extra}">${ROUTES[route].map(([t, n], i) =>
      `<div class="cmd" data-c="${i}">${t.startsWith('Move') ? '⬆' : t.endsWith('left') ? '↺' : '↻'} ${t}${n ? `<b>${n} ${n > 1 ? 'cells' : 'cell'}</b>` : ''}</div>`).join('')}</div>`;
  }

  /** Animate the robot through a route. Returns a controller. */
  function maze(el) {
    const robot = el.querySelector('.robot');
    const runner = new Runner();
    let state;
    const put = () => { robot.style.transform = `translate(${cx(state.c)}px, ${cy(state.r)}px) rotate(${state.a}deg)`; };
    // Back to the start; only clears the trail and list of the given route (or all).
    function home(route) {
      state = { c: 2, r: 5, a: 0, step: 0, pts: [[2, 5]] };
      el.querySelectorAll(route ? `.trail-${route}` : 'polyline').forEach((p) => p.setAttribute('points', ''));
      el.querySelectorAll(route ? `.cmd-list.${route} .cmd` : '.cmd').forEach((c) => c.classList.remove('done', 'now'));
      put();
    }
    function reset() { runner.stop(); home(); }
    function doStep(route) {
      if (state.step >= ROUTES[route].length) home(route);
      const cmd = ROUTES[route][state.step];
      const dirs = { 0: [0, -1], 90: [1, 0], 180: [0, 1], 270: [-1, 0] };
      if (cmd[0].startsWith('Move')) {
        const [dc, dr] = dirs[((state.a % 360) + 360) % 360];
        state.c += dc * cmd[1]; state.r += dr * cmd[1];
        state.pts.push([state.c, state.r]);
      } else state.a += cmd[0].endsWith('left') ? -90 : 90;
      el.querySelector('.trail-' + route).setAttribute('points', state.pts.map(([c, r]) => `${cx(c)},${cy(r)}`).join(' '));
      el.querySelectorAll(`.cmd-list.${route} .cmd`).forEach((c, i) => {
        c.classList.toggle('done', i < state.step); c.classList.toggle('now', i === state.step);
      });
      state.step++;
      put();
      return true;
    }
    function runAll(route) {
      return runner.run(async (api) => {
        home(route);
        await api.wait(300);
        while (state.step < ROUTES[route].length) { doStep(route); await api.wait(650); }
        el.querySelectorAll(`.cmd-list.${route} .cmd`).forEach((c) => { c.classList.add('done'); c.classList.remove('now'); });
      });
    }
    reset();
    return { reset, step: (r) => doStep(r), runAll, stop: () => runner.stop() };
  }

  // ---------- slides ----------
  SC.lesson({
    num: 1,
    title: 'Events & Sequence',
    tag: 'THE BASICS',
    colour: '#c98d00',
    summary: 'What programming is. Code blocks, events and the order they run in.',
    ideas: ['code blocks', 'events', 'sequence'],
    files: [{ name: 'Square Walk - Sequence.sb3', href: SC.file(F, 'Square Walk - Sequence.sb3'), note: 'Demo: the cat walks a square, one block at a time' }],
    slides: [
      {
        nav: 'Welcome', className: 'split',
        html: `<div>
            <p class="eyebrow"><span></span>LESSON 1 · EVENTS &amp; SEQUENCE</p>
            <h1>Make your<br><em>ideas move.</em></h1>
            <p class="lead">Programming starts with one idea — and a set of clear instructions.</p>
            <p style="margin-top:34px"><button class="btn" data-act="next">Let's go →</button></p>
          </div>
          <div class="col" style="align-items:center">
            <div class="card hot" style="width:340px;text-align:center"><div class="emoji">💡</div><h3 style="margin-top:8px">IDEA</h3><p>“Get the cat to walk a square.”</p></div>
            <div style="font-size:40px;font-weight:900;color:var(--sun-deep)">↓</div>
            <pre class="blocks" data-size="m">when @flag clicked
move (100) steps
turn right (90) degrees
move (100) steps</pre>
            <div style="font-size:40px;font-weight:900;color:var(--sun-deep)">↓</div>
            <div class="card" style="width:340px;text-align:center"><h3>ACTION ✨</h3><p>The computer does it.</p></div>
          </div>`,
      },
      {
        nav: 'Be the robot', className: 'split',
        html: `<div>
            <p class="eyebrow"><span></span>WARM UP</p>
            <h2>I'm a robot.<br><em>Program me!</em></h2>
            <p class="lead">Tell me how to get to the door. I only do <b>exactly</b> what you say.</p>
            <div class="question">What's the first thing I should do?</div>
          </div>
          <div class="col">
            <div class="card"><span class="bug-tag">TOO VAGUE</span><h3 style="margin-top:12px">“Go to the door.”</h3><p>How many steps? Which way? What first?</p></div>
            <button class="reveal-btn">Show a better program</button>
            <div class="card hot reveal"><span class="fix-tag">CLEAR</span><h3 style="margin-top:12px">“Walk forward 3 steps. Turn left. Walk forward 2 steps.”</h3><p>Small steps. Clear order. That's programming.</p></div>
          </div>`,
      },
      {
        nav: 'Robot challenge', className: 'split-wide',
        html: `<div>
            <p class="eyebrow"><span></span>THE ROBOT CHALLENGE</p>
            <h2>Guide the robot<br>to the <em>finish.</em></h2>
            <p class="lead">The middle is blocked. Give one clear instruction at a time.</p>
            <div class="question">What should the robot do first?</div>
            <div class="btn-row" style="margin-top:26px">
              <button class="btn" data-m="step">Next instruction</button>
              <button class="btn ghost" data-m="all">Run all</button>
              <button class="btn ghost" data-m="reset">Reset</button>
            </div>
          </div>
          <div class="row" style="justify-content:center;align-items:center">
            <div class="maze" style="width:440px">${mazeSvg()}</div>
            <div style="width:300px">${cmdList('a')}</div>
          </div>`,
        enter(el) {
          const m = maze(el);
          const on = (e) => {
            const b = e.target.closest('[data-m]'); if (!b) return;
            if (b.dataset.m === 'step') { m.stop(); m.step('a'); }
            if (b.dataset.m === 'all') m.runAll('a');
            if (b.dataset.m === 'reset') m.reset();
          };
          el.addEventListener('click', on);
          return () => { m.stop(); el.removeEventListener('click', on); };
        },
      },
      {
        nav: 'This is programming', className: 'top',
        html: `<div class="center-col" style="display:grid">
            <p class="eyebrow"><span></span>FROM AN IDEA TO A PROGRAM</p>
            <h2>This is <em>programming.</em></h2>
          </div>
          <div class="col" style="gap:34px;justify-content:center">
            <div class="flow">
              <div class="node"><small>01</small><b>💡 IDEA</b><span>Get the robot to the finish.</span></div>
              <div class="arrow">→</div>
              <div class="node"><small>02</small><b>🧩 CLEAR STEPS</b><span>Move forward 1. Turn left. Move forward 2 …</span></div>
              <div class="arrow">→</div>
              <div class="node"><small>03</small><b>🤖 ACTION</b><span>The computer follows them — exactly.</span></div>
            </div>
            <div class="tip" style="font-size:26px;text-align:center"><b>Programming</b> = turning an idea into clear instructions a computer can follow.</div>
            <p class="small" style="text-align:center;margin:0">Computers are fast, but they can't read your mind. If it does something weird, it's usually doing exactly what we told it!</p>
          </div>`,
      },
      {
        nav: 'Sequence', className: 'split-wide',
        html: `<div>
            <p class="eyebrow"><span></span>SEQUENCE</p>
            <h2>Two routes.<br><em>One result.</em></h2>
            <p class="lead">A <b>sequence</b> is the order the instructions run in.</p>
            <div class="btn-row" style="margin-top:26px">
              <button class="btn" data-m="a">Run route A</button>
              <button class="btn ghost" data-m="b">Run route B</button>
            </div>
            <button class="reveal-btn" style="margin-top:22px">What did you notice?</button>
            <div class="tip reveal" style="margin-top:22px">Different sequence → <b>same</b> finish. There can be more than one right answer.</div>
          </div>
          <div class="row" style="justify-content:center;align-items:center;gap:18px">
            <div style="width:220px">${cmdList('a', 'compact')}</div>
            <div class="maze" style="width:360px">${mazeSvg()}</div>
            <div style="width:220px">${cmdList('b', 'compact')}</div>
          </div>`,
        enter(el) {
          const m = maze(el);
          const on = (e) => {
            const b = e.target.closest('[data-m]'); if (!b) return;
            m.runAll(b.dataset.m);
          };
          el.addEventListener('click', on);
          return () => { m.stop(); el.removeEventListener('click', on); };
        },
      },
      {
        nav: 'Order matters', className: 'top',
        html: `<div class="heading-row">
            <div><p class="eyebrow"><span></span>ORDER MATTERS</p><h2>Same blocks.<br><em>Different order.</em></h2></div>
            <div><p class="lead">Predict first: will the cats end up in the same place?</p><p style="margin-top:16px"><button class="btn" data-run>Run both</button></p></div>
          </div>
          <div class="grid-2">
            <div class="row" style="align-items:flex-start">
              <div class="code-panel tight" data-code="a" style="flex:none"></div>
              <div data-stage="a" style="flex:1"></div>
            </div>
            <div class="row" style="align-items:flex-start">
              <div class="code-panel tight" data-code="b" style="flex:none"></div>
              <div data-stage="b" style="flex:1"></div>
            </div>
          </div>`,
        enter(el) {
          const progs = {
            a: ['move (100) steps', 'turn left (90) degrees', 'move (100) steps'],
            b: ['turn left (90) degrees', 'move (100) steps', 'move (100) steps'],
          };
          const parts = {};
          for (const k of ['a', 'b']) {
            const host = el.querySelector(`[data-code="${k}"]`); host.innerHTML = '';
            const code = SB.render('when @flag clicked\n' + progs[k].join('\n'), { className: 'm' });
            host.appendChild(code.el);
            const sh = el.querySelector(`[data-stage="${k}"]`); sh.innerHTML = '';
            const st = new MiniStage(sh);
            const cat = st.sprite({ img: 'site/img/cat-1.svg', x: -60, y: -90, size: 60, pen: k === 'a' ? '#624b78' : '#d9644a' });
            parts[k] = { code, st, cat };
          }
          async function play(k) {
            const { code, st, cat } = parts[k];
            await st.run(async (api) => {
              st.clearPen(); cat.set({ x: -60, y: -90, dir: 90 });
              code.light(0); await api.wait(500);
              for (let i = 0; i < 3; i++) {
                code.light(i + 1);
                const line = progs[k][i];
                if (line.startsWith('move')) await cat.move(100, 700, api); else await cat.turn(-90, 450, api);
                await api.wait(200);
              }
              code.clear();
              cat.say(k === 'a' ? 'I went up and over.' : 'I went straight up!');
            });
          }
          const on = (e) => { if (e.target.closest('[data-run]')) { play('a'); play('b'); } };
          el.addEventListener('click', on);
          return () => { el.removeEventListener('click', on); parts.a.st.destroy(); parts.b.st.destroy(); };
        },
      },
      {
        nav: 'Events', className: 'split',
        html: `<div>
            <p class="eyebrow"><span></span>EVENTS</p>
            <h2>What makes<br>an action <em>start?</em></h2>
            <p class="lead">An <b>event</b> is something that happens. It starts an action — or a whole sequence.</p>
            <div class="flow" style="margin-top:30px">
              <div class="node" style="padding:16px"><b style="font-size:24px;margin:0">⚡ EVENT</b></div><div class="arrow">→</div>
              <div class="node" style="padding:16px"><b style="font-size:24px;margin:0">ACTION</b></div><div class="arrow">→</div>
              <div class="node" style="padding:16px"><b style="font-size:24px;margin:0">RESULT</b></div>
            </div>
          </div>
          <div class="col">
            <img src="site/img/event-triggers.jpg" alt="A hand presses a light switch, another presses a computer power button" style="width:100%;border-radius:22px;border:2px solid var(--line)">
            <div class="grid-2">
              <div class="card"><p><b>WHEN</b> the switch is pressed → <b>light on</b></p></div>
              <div class="card"><p><b>WHEN</b> power is pressed → <b>computer starts</b></p></div>
            </div>
          </div>`,
      },
      {
        nav: 'Events in Scratch', className: 'split',
        html: `<div>
            <p class="eyebrow"><span></span>EVENTS IN SCRATCH</p>
            <h2>Every script starts<br>with a <em>hat block.</em></h2>
            <p class="lead">The yellow <b>event</b> block on top waits. When its event happens, the blocks under it run — top to bottom.</p>
            <div class="code-panel" data-code style="margin-top:24px"></div>
          </div>
          <div>
            <div class="stage-bar">
              <button class="flag-btn" data-flag title="Green flag"><svg viewBox="0 0 20 20"><path d="M4 2v16" stroke="#45993d" stroke-width="2.2" stroke-linecap="round"/><path d="M5 3c4-2 6 2 11 0v8c-5 2-7-2-11 0z" fill="#4cbf56" stroke="#45993d" stroke-width="1.2"/></svg></button>
              <button class="stop-btn" data-stop title="Stop"></button>
              <span class="focus-hint">Try: green flag · <span class="key">Space</span> · click the cat. (Click the stage first if Space changes the slide.)</span>
            </div>
            <div data-stage tabindex="0" data-own-keys></div>
          </div>`,
        enter(el) {
          const host = el.querySelector('[data-code]'); host.innerHTML = '';
          const code = SB.render(`when @flag clicked
go to x: (0) y: (0)
say [Hello!] for (2) seconds

when [space v] key pressed
move (40) steps

when this sprite clicked
turn right (360) degrees`, { className: 'm' });
          host.appendChild(code.el);
          const sh = el.querySelector('[data-stage]'); sh.innerHTML = '';
          const st = new MiniStage(sh);
          const cat = st.sprite({ img: 'site/img/cat-1.svg', x: 0, y: 0, size: 90, onClick: () => spin() });
          const runs = new Runner();
          const flag = () => st.run(async (api) => {
            code.light(0); await api.wait(300); code.light(1); cat.set({ x: 0, y: 0, dir: 90 }); await api.wait(300);
            code.light(2); cat.say('Hello!'); await api.wait(2000); cat.say(''); code.clear();
          });
          const space = () => runs.run(async (api) => {
            code.light(3); await api.wait(150); code.light(4);
            await cat.move(40, 300, api);
            if (cat.x > 260) cat.set({ x: -240 });
            await api.wait(200); code.clear();
          });
          const spin = () => runs.run(async (api) => {
            code.light(5); await api.wait(150); code.light(6);
            await cat.turn(360, 700, api); cat.set({ dir: 90 }); code.clear();
          });
          const key = (e) => { if (e.key === ' ') { e.preventDefault(); space(); } };
          const click = (e) => {
            if (e.target.closest('[data-flag]')) flag();
            if (e.target.closest('[data-stop]')) { st.stop(); runs.stop(); code.clear(); }
          };
          sh.addEventListener('keydown', key);
          el.addEventListener('click', click);
          sh.focus({ preventScroll: true });   // so Space reaches the demo straight away
          return () => { st.destroy(); runs.stop(); sh.removeEventListener('keydown', key); el.removeEventListener('click', click); };
        },
      },
      {
        nav: 'Meet Scratch', className: 'split-wide',
        html: `<div>
            <p class="eyebrow"><span></span>MEET SCRATCH</p>
            <h2>Where things <em>live.</em></h2>
            <p class="lead">Go to <b>scratch.mit.edu</b> → <b>Create</b>.</p>
            <ul class="legend" style="margin-top:26px">
              <li><b>1</b> Block colours — one colour for each kind of block</li>
              <li><b>2</b> Blocks — drag them out</li>
              <li><b>3</b> Code area — snap blocks together here</li>
              <li><b>4</b> Stage — green flag runs it, red stop stops it</li>
              <li><b>5</b> Sprites — the characters in your project</li>
            </ul>
          </div>
          <div class="editor" aria-label="A simple sketch of the Scratch editor">
            <div class="ed-top">SCRATCH &nbsp; File &nbsp; Edit &nbsp; Tutorials</div>
            <div class="ed-cats"><i style="background:#4c97ff"></i><i style="background:#9966ff"></i><i style="background:#cf63cf"></i><i style="background:#ffbf00"></i><i style="background:#ffab19"></i><i style="background:#5cb1d6"></i><i style="background:#59c059"></i><span class="callout" style="left:6px;top:6px;width:34px;height:34px;font-size:17px">1</span></div>
            <div class="ed-palette"><span style="background:#ffbf00"></span><span style="background:#4c97ff"></span><span style="background:#4c97ff"></span><span style="background:#9966ff"></span><span style="background:#ffab19"></span><span class="callout" style="left:8px;top:8px">2</span></div>
            <div class="ed-code"><div style="transform:scale(.85)"><pre class="blocks" data-size="s">when @flag clicked
move (10) steps
say [Hello!] for (2) seconds</pre></div><span class="callout" style="left:20px;top:16px">3</span></div>
            <div class="ed-stage-wrap ed-stage"><img src="site/img/cat-1.svg" alt="" style="width:80px"><span class="callout" style="right:14px;top:14px">4</span></div>
            <div class="ed-sprites">Sprite1 🐱<span class="callout" style="right:14px;top:14px">5</span></div>
          </div>`,
      },
      {
        nav: 'Your turn', className: 'split-wide',
        html: `<div>
            <p class="eyebrow"><span></span>YOUR TURN · 30 MIN</p>
            <h2>Make the cat<br><em>walk a square.</em></h2>
            <ol class="steps" style="margin-top:24px">
              <li>Start with an event block: <pre class="blocks" data-size="s">when @flag clicked</pre></li>
              <li>Add <b>move</b> and <b>turn</b> blocks to walk a square.</li>
              <li><span>Use at least <b>5 different</b> blocks.<small>Try say, wait, play sound, change colour …</small></span></li>
              <li>Click the flag. Test it. Fix it. Test again.</li>
            </ol>
          </div>
          <div class="col">
            <div class="code-panel"><pre class="blocks" data-size="m">when @flag clicked
say [Walk forward.] for (0.5) seconds
move (160) steps
say [Turn left.] for (0.5) seconds
turn left (90) degrees
move (160) steps</pre><p class="small" style="margin:14px 0 0">… keep going until the cat is back at the start.</p></div>
            <div class="tip"><b>Stuck?</b> Click <b>Tutorials → Getting Started</b> in Scratch. <b>Done?</b> Make the cat talk at each corner, or walk a different shape.</div>
            <div class="files"><a class="file" href="${SC.file(F, 'Square Walk - Sequence.sb3')}" download>Square Walk - Sequence.sb3 <small>teacher demo</small></a></div>
          </div>`,
      },
      {
        nav: 'Recap', className: 'top',
        html: `<div class="center-col" style="display:grid"><p class="eyebrow"><span></span>RECAP</p><h2>Remember <em>the pattern.</em></h2></div>
          <div class="col" style="gap:30px">
            <div class="flow">
              <div class="node"><small>01</small><b>EVENT</b><span>something happens</span></div><div class="arrow">→</div>
              <div class="node"><small>02</small><b>SEQUENCE</b><span>blocks run in order</span></div><div class="arrow">→</div>
              <div class="node"><small>03</small><b>RESULT</b><span>we see what the code does</span></div>
            </div>
            <div class="grid-3">
              <div class="card"><h3>Which block starts a script?</h3><button class="reveal-btn">Answer</button><p class="reveal">The yellow event (hat) block, e.g. when 🏁 clicked.</p></div>
              <div class="card"><h3>What is a sequence?</h3><button class="reveal-btn">Answer</button><p class="reveal">The order the instructions run in — top to bottom.</p></div>
              <div class="card"><h3>Swap two blocks. What happens?</h3><button class="reveal-btn">Answer</button><p class="reveal">The result can change. Order matters — so predict, test, fix.</p></div>
            </div>
          </div>`,
      },
    ],
  });
})();
