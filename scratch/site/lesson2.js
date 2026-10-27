/* Lesson 2 — Loops & If-Else */
(function () {
  'use strict';
  const F = 'Lesson 2 - Loops and If-Else';
  const F1 = 'Lesson 1 - Events and Sequence';

  const LONG = `when @flag clicked
move (160) steps
turn left (90) degrees
move (160) steps
turn left (90) degrees
move (160) steps
turn left (90) degrees
move (160) steps
turn left (90) degrees`;

  const LOOP = `when @flag clicked
repeat (4)
  move (160) steps
  turn left (90) degrees`;

  /** Put drawn blocks into a host element. */
  function code(el, sel, text, size) {
    const host = el.querySelector(sel); host.innerHTML = '';
    const c = SB.render(text, { className: size || 'm' });
    host.appendChild(c.el);
    return c;
  }

  SC.lesson({
    num: 2,
    title: 'Loops & If-Else',
    tag: 'LOOPS & CHOICES',
    colour: '#3f7466',
    summary: 'Repeat blocks without copying them. Let the program choose with a yes/no question.',
    ideas: ['repeat', 'forever', 'condition', 'if-else'],
    files: [
      { name: 'Loops and If-Else - Demo.sb3', href: SC.file(F, 'Loops and If-Else - Demo.sb3'), note: 'Press 1: repeat square · Press 2: colour loop · touch the cat: if-else' },
      { name: 'Little Magic - Extra Example.sb3', href: SC.file(F, 'Little Magic - Extra Example.sb3'), note: 'Extra: repeat, forever and if together' },
    ],
    slides: [
      {
        nav: 'Welcome', className: 'split',
        html: `<div>
            <p class="eyebrow"><span></span>LESSON 2 · LOOPS &amp; IF-ELSE</p>
            <h1>Repeat it.<br><em>Decide it.</em></h1>
            <p class="lead">Loops save you from copying blocks. If-else lets your program make a choice.</p>
            <p style="margin-top:34px"><button class="btn" data-act="next">Let's go →</button></p>
          </div>
          <div class="col" style="align-items:center;gap:30px">
            <pre class="blocks" data-size="l">repeat (4)
  move (160) steps
  turn left (90) degrees</pre>
            <pre class="blocks" data-size="l">if <touching [mouse-pointer v]?> then
  say [Hi!]
else
  say []</pre>
          </div>`,
      },
      {
        nav: 'Spot the pattern', className: 'split',
        html: `<div>
            <p class="eyebrow"><span></span>LAST LESSON: SQUARE WALK</p>
            <h2>Spot the<br><em>pattern.</em></h2>
            <p class="lead">This is the cat's square walk from Lesson 1. Read it top to bottom. What do you notice?</p>
            <p style="margin-top:26px"><button class="btn" data-run>Show me</button></p>
            <div class="count-box" style="margin-top:22px"><span class="big-num" data-lap>–</span> <span>times the same 2 blocks</span></div>
          </div>
          <div class="code-panel" data-code style="justify-self:center"></div>`,
        enter(el) {
          const c = code(el, '[data-code]', LONG, 'l');
          const r = new Runner();
          const lap = el.querySelector('[data-lap]');
          const on = (e) => {
            if (!e.target.closest('[data-run]')) return;
            r.run(async (api) => {
              for (let k = 0; k < 4; k++) {
                c.light(1 + k * 2, 2 + k * 2); lap.textContent = k + 1;
                await api.wait(900);
              }
              c.light([1, 2, 3, 4, 5, 6, 7, 8]);
            });
          };
          el.addEventListener('click', on);
          lap.textContent = '–';
          return () => { r.stop(); el.removeEventListener('click', on); };
        },
      },
      {
        nav: 'Repeat loop', className: 'top',
        html: `<div class="heading-row">
            <div><p class="eyebrow"><span></span>LOOP: REPEAT</p><h2>A loop does it<br><em>again and again.</em></h2></div>
            <div><p class="lead">Put the 2 blocks inside <b>repeat (4)</b>. Same square, far fewer blocks.</p><p style="margin-top:16px"><button class="btn" data-run>Run the loop</button></p></div>
          </div>
          <div class="row" style="align-items:center;justify-content:space-between">
            <div class="code-panel tight" data-long style="opacity:.55"></div>
            <div style="font:900 30px var(--round)">9 blocks → <span style="color:var(--accent)">4 blocks</span></div>
            <div class="code-panel" data-loop></div>
            <div style="width:400px"><div data-stage></div><div class="count-box" style="margin-top:10px">Lap <span class="big-num" style="font-size:44px" data-lap>0</span> of 4</div></div>
          </div>`,
        enter(el) {
          code(el, '[data-long]', LONG, 's');
          const c = code(el, '[data-loop]', LOOP, 'l');
          const sh = el.querySelector('[data-stage]'); sh.innerHTML = '';
          const st = new MiniStage(sh);
          const cat = st.sprite({ img: 'site/img/cat-1.svg', x: -80, y: -80, size: 55, pen: '#3f7466' });
          const lap = el.querySelector('[data-lap]');
          const on = (e) => {
            if (!e.target.closest('[data-run]')) return;
            st.run(async (api) => {
              st.clearPen(); cat.set({ x: -80, y: -80, dir: 90 }); lap.textContent = 0;
              c.light(0); await api.wait(400);
              for (let k = 1; k <= 4; k++) {
                lap.textContent = k;
                c.light(1); await api.wait(250);
                c.light(2); await cat.move(160, 700, api);
                c.light(3); await cat.turn(-90, 400, api);
              }
              c.clear(); cat.say('Back at the start!');
            });
          };
          el.addEventListener('click', on);
          return () => { st.destroy(); el.removeEventListener('click', on); };
        },
      },
      {
        nav: 'Change the number', className: 'split',
        html: `<div>
            <p class="eyebrow"><span></span>PLAY WITH THE LOOP</p>
            <h2>Change the number,<br><em>change the shape.</em></h2>
            <p class="lead">Pick how many sides. The loop does the rest.</p>
            <div class="btn-row" style="margin-top:24px">
              ${[3, 4, 5, 6, 8].map((n) => `<button class="toggle" data-n="${n}">${n} sides</button>`).join('')}
            </div>
            <div class="code-panel" data-code style="margin-top:24px;width:fit-content"></div>
            <div class="tip" style="margin-top:20px"><b>Maths trick:</b> repeat × turn = 360°. &nbsp;3 × 120 · 4 × 90 · 6 × 60</div>
          </div>
          <div data-stage style="width:620px;justify-self:center"></div>`,
        enter(el) {
          const sh = el.querySelector('[data-stage]'); sh.innerHTML = '';
          const st = new MiniStage(sh);
          const cat = st.sprite({ img: 'site/img/cat-1.svg', x: 0, y: -120, size: 50, pen: '#c98d00' });
          let c;
          const draw = (n) => {
            const side = Math.round(760 / n), turn = Math.round(360 / n * 10) / 10;
            c = code(el, '[data-code]', `when @flag clicked\nrepeat (${n})\n  move (${side}) steps\n  turn left (${turn}) degrees`, 'l');
            el.querySelectorAll('[data-n]').forEach((b) => b.classList.toggle('on', +b.dataset.n === n));
            st.run(async (api) => {
              st.clearPen(); cat.set({ x: -side / 2, y: -130, dir: 90 });
              for (let k = 0; k < n; k++) {
                c.light(2); await cat.move(side, 500, api);
                c.light(3); await cat.turn(-360 / n, 250, api);
              }
              c.clear();
            });
          };
          const on = (e) => { const b = e.target.closest('[data-n]'); if (b) draw(+b.dataset.n); };
          el.addEventListener('click', on);
          draw(4);
          return () => { st.destroy(); el.removeEventListener('click', on); };
        },
      },
      {
        nav: 'Two loops', className: 'top',
        html: `<div><p class="eyebrow"><span></span>TWO LOOPS</p><h2>Some loops stop.<br><em>Some never do.</em></h2></div>
          <div class="grid-3" style="align-items:start">
            <div class="card">
              <pre class="blocks" data-size="m">repeat (3)
  play sound [Clap v]</pre>
              <h3 style="margin-top:18px">repeat</h3>
              <p>Does it a set number of times, then moves on.<br><b>Clap 3 times.</b></p>
            </div>
            <div class="card hot">
              <pre class="blocks" data-size="m">forever
  move (10) steps
  if on edge, bounce</pre>
              <h3 style="margin-top:18px">forever</h3>
              <p>Keeps going until you click stop.<br><b>The cat keeps walking.</b></p>
            </div>
            <div>
              <div class="stage-bar"><button class="flag-btn" data-go title="Start"><svg viewBox="0 0 20 20"><path d="M4 2v16" stroke="#45993d" stroke-width="2.2" stroke-linecap="round"/><path d="M5 3c4-2 6 2 11 0v8c-5 2-7-2-11 0z" fill="#4cbf56" stroke="#45993d" stroke-width="1.2"/></svg></button><button class="stop-btn" data-halt title="Stop"></button><span class="focus-hint">forever needs the stop button!</span></div>
              <div data-stage></div>
              <p class="small" style="margin:14px 0 0">Coming in Lesson 4: <b>repeat until</b> — keeps going until something is true.</p>
            </div>
          </div>`,
        enter(el) {
          const sh = el.querySelector('[data-stage]'); sh.innerHTML = '';
          const st = new MiniStage(sh);
          const cat = st.sprite({ img: 'site/img/cat-1.svg', x: 0, y: -40, size: 60, rotate: false });
          const on = (e) => {
            if (e.target.closest('[data-go]')) {
              st.run(async (api) => {
                let dx = 10, flip = false;
                for (;;) {
                  cat.x += dx;
                  if (Math.abs(cat.x) > 205) { dx = -dx; flip = !flip; cat.el.style.scale = flip ? '-1 1' : ''; }
                  cat.img.src = cat.img.src.includes('cat-1') ? 'site/img/cat-2.svg' : 'site/img/cat-1.svg';
                  cat.draw();
                  await api.wait(70);
                }
              });
            }
            if (e.target.closest('[data-halt]')) st.stop();
          };
          el.addEventListener('click', on);
          return () => { st.destroy(); el.removeEventListener('click', on); };
        },
      },
      {
        nav: 'Yes / no question', className: 'split',
        html: `<div>
            <p class="eyebrow"><span></span>CONDITION</p>
            <h2>Ask a <em>yes / no</em><br>question.</h2>
            <p class="lead">A <b>condition</b> is a question with only two answers: <b>true</b> or <b>false</b>. The program picks a path.</p>
            <div class="row" style="margin-top:26px;font-size:24px;font-weight:800">Is it raining?
              <button class="toggle" data-rain="yes">Yes</button><button class="toggle" data-rain="no">No</button>
            </div>
          </div>
          <div class="col">
            <div class="code-panel" data-code></div>
            <div class="branch">
              <div class="card" data-b="yes"><div class="emoji">☂️</div><h3 style="margin-top:8px">Take an umbrella</h3><p>runs when the answer is <b>yes</b></p></div>
              <div class="card" data-b="no"><div class="emoji">😎</div><h3 style="margin-top:8px">Wear sunglasses</h3><p>runs when the answer is <b>no</b></p></div>
            </div>
          </div>`,
        enter(el) {
          const c = code(el, '[data-code]', `if <it is raining?> then
  say [Take an umbrella!]
else
  say [Wear sunglasses!]`, 'l');
          const set = (v) => {
            el.querySelectorAll('[data-rain]').forEach((b) => b.classList.toggle('on', b.dataset.rain === v));
            el.querySelectorAll('[data-b]').forEach((b) => b.classList.toggle('go', b.dataset.b === v));
            c.light(0, v === 'yes' ? 1 : 2);
          };
          const on = (e) => { const b = e.target.closest('[data-rain]'); if (b) set(b.dataset.rain); };
          el.addEventListener('click', on);
          return () => el.removeEventListener('click', on);
        },
      },
      {
        nav: 'if or if-else', className: 'top',
        html: `<div><p class="eyebrow"><span></span>TWO KINDS OF IF</p><h2><em>if</em> or <em>if-else?</em></h2></div>
          <div class="grid-2" style="align-items:start">
            <div class="card">
              <pre class="blocks" data-size="l">if <touching [edge v]?> then
  turn right (180) degrees</pre>
              <h3 style="margin-top:20px">if … then</h3>
              <p><b>Yes</b> → do the blocks inside.<br><b>No</b> → skip them and carry on.</p>
            </div>
            <div class="card hot">
              <pre class="blocks" data-size="l">if <key [space v] pressed?> then
  say [Jump!]
else
  say [Walk.]</pre>
              <h3 style="margin-top:20px">if … then … else</h3>
              <p><b>Yes</b> → top path. <b>No</b> → bottom path.<br>Always one of the two.</p>
            </div>
          </div>
          <div class="question">“If your score gets to 10, say You win!” — if or if-else?
            <button class="reveal-btn" style="margin-left:auto">Answer</button><span class="reveal" style="color:var(--sun)">if — nothing has to happen otherwise.</span></div>`,
      },
      {
        nav: 'Loop + if-else', className: 'split',
        html: `<div>
            <p class="eyebrow"><span></span>LOOP + IF-ELSE</p>
            <h2>The loop keeps<br><em>asking.</em></h2>
            <p class="lead">Inside <b>forever</b>, the question gets asked again and again. Move the mouse onto the cat.</p>
            <div class="code-panel" data-code style="margin-top:24px;width:fit-content"></div>
          </div>
          <div><div class="stage-bar"><button class="flag-btn" data-go title="Start"><svg viewBox="0 0 20 20"><path d="M4 2v16" stroke="#45993d" stroke-width="2.2" stroke-linecap="round"/><path d="M5 3c4-2 6 2 11 0v8c-5 2-7-2-11 0z" fill="#4cbf56" stroke="#45993d" stroke-width="1.2"/></svg></button><button class="stop-btn" data-halt title="Stop"></button><span class="focus-hint">Click the flag, then touch the cat with the mouse</span></div><div data-stage></div></div>`,
        enter(el) {
          const c = code(el, '[data-code]', `when @flag clicked
forever
  if <touching [mouse-pointer v]?> then
    say [Hi! You found me.]
  else
    say []`, 'm');
          const sh = el.querySelector('[data-stage]'); sh.innerHTML = '';
          const st = new MiniStage(sh);
          const cat = st.sprite({ img: 'site/img/cat-1.svg', x: 0, y: -30, size: 110 });
          let over = false;
          cat.el.addEventListener('mouseenter', () => { over = true; });
          cat.el.addEventListener('mouseleave', () => { over = false; });
          const go = () => st.run(async (api) => {
            for (;;) {
              cat.say(over ? 'Hi! You found me.' : '');
              cat.img.src = over ? 'site/img/cat-2.svg' : 'site/img/cat-1.svg';
              c.light(1, 2, over ? 3 : 4);
              await api.wait(80);
            }
          });
          const on = (e) => {
            if (e.target.closest('[data-go]')) go();
            if (e.target.closest('[data-halt]')) { st.stop(); c.clear(); }
          };
          el.addEventListener('click', on);
          return () => { st.destroy(); el.removeEventListener('click', on); };
        },
      },
      {
        nav: 'Your turn', className: 'split-wide',
        html: `<div>
            <p class="eyebrow"><span></span>YOUR TURN · 30 MIN</p>
            <h2>Shorter, then<br><em>smarter.</em></h2>
            <ol class="steps" style="margin-top:22px">
              <li><span>Open <b>Square Walk</b>: File → Load from your computer.<small>Make it shorter with a <b>repeat</b> loop. Does it still walk a square?</small></span></li>
              <li><span>Walk a new shape.<small>Triangle: repeat 3, turn 120 · Hexagon: repeat 6, turn 60</small></span></li>
              <li><span>Add <b>forever</b> + <b>if-else</b>.<small>If the mouse touches the cat, say Hi! — else say nothing.</small></span></li>
            </ol>
          </div>
          <div class="col">
            <div class="code-panel"><pre class="blocks" data-size="m">when @flag clicked
forever
  if <touching [mouse-pointer v]?> then
    say [Hi!]
  else
    say []</pre></div>
            <div class="tip"><b>Done?</b> Open <b>Little Magic</b>: press M, hold Space. Find the repeat, the forever and the if.</div>
            <div class="files">
              <a class="file" href="${SC.file(F1, 'Square Walk - Sequence.sb3')}" download>Square Walk - Sequence.sb3</a>
              <a class="file" href="${SC.file(F, 'Loops and If-Else - Demo.sb3')}" download>Loops and If-Else - Demo.sb3 <small>teacher demo</small></a>
              <a class="file" href="${SC.file(F, 'Little Magic - Extra Example.sb3')}" download>Little Magic - Extra Example.sb3</a>
            </div>
          </div>`,
      },
      {
        nav: 'Recap', className: 'top',
        html: `<div class="center-col" style="display:grid"><p class="eyebrow"><span></span>RECAP</p><h2>Three new <em>ideas.</em></h2></div>
          <div class="col" style="gap:26px">
            <div class="grid-3">
              <div class="card"><h3>🔁 Loop</h3><p><b>repeat</b> does it a set number of times. <b>forever</b> never stops.</p></div>
              <div class="card"><h3>❓ Condition</h3><p>A yes / no question, like <b>touching edge?</b></p></div>
              <div class="card"><h3>🔀 If-else</h3><p>Yes → one path. No → the other path.</p></div>
            </div>
            <div class="grid-3">
              <div class="card"><h3>How many blocks did the loop save?</h3><button class="reveal-btn">Answer</button><p class="reveal">9 blocks became 4 — and it's easier to change.</p></div>
              <div class="card"><h3>Why put an if inside forever?</h3><button class="reveal-btn">Answer</button><p class="reveal">So the question gets asked again and again, not just once.</p></div>
              <div class="card"><h3>Triangle: repeat ? · turn ?</h3><button class="reveal-btn">Answer</button><p class="reveal">repeat 3 · turn 120 (3 × 120 = 360)</p></div>
            </div>
          </div>`,
      },
    ],
  });
})();
