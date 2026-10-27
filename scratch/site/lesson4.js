/* Lesson 4 — Airplane Battle: test and debug */
(function () {
  'use strict';
  const F = 'Lesson 4 - Airplane Battle';
  const IMG = 'site/img/';

  /** A small game screen using Scratch coordinates (480 x 360, centre 0,0). */
  function game(host, sky = 'sky-level-1.svg') {
    host.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'game-stage';
    el.style.backgroundImage = `url(${IMG}${sky})`;
    host.appendChild(el);
    const add = (src, w, x, y) => {
      const img = document.createElement('img');
      img.src = IMG + src; img.alt = '';
      img.style.width = (w / 480 * 100) + '%';
      el.appendChild(img);
      const s = { img, x, y, place(nx = s.x, ny = s.y) { s.x = nx; s.y = ny; img.style.left = ((s.x + 240) / 480 * 100) + '%'; img.style.top = ((180 - s.y) / 360 * 100) + '%'; return s; } };
      return s.place();
    };
    const hud = document.createElement('div');
    hud.className = 'game-hud';
    el.appendChild(hud);
    return { el, add, hud: (html) => { hud.innerHTML = html; } };
  }

  function codeInto(host, text, size) {
    host.innerHTML = '';
    const c = SB.render(text, { className: size || 'm' });
    host.appendChild(c.el);
    return c;
  }

  const MOVE = {
    buggy: { code: `when @flag clicked
forever
  if <key [s v] pressed?> then
    change y by (2)
  if <key [w v] pressed?> then
    change y by (-9)
  if <key [d v] pressed?> then
    change x by (-3)
  if <key [a v] pressed?> then
    change x by (7)`, keys: [['s', 0, 2], ['w', 0, -9], ['d', -3, 0], ['a', 7, 0]] },
    fixed: { code: `when @flag clicked
forever
  if <key [up arrow v] pressed?> then
    change y by (5)
  if <key [down arrow v] pressed?> then
    change y by (-5)
  if <key [left arrow v] pressed?> then
    change x by (-5)
  if <key [right arrow v] pressed?> then
    change x by (5)`, keys: [['ArrowUp', 0, 5], ['ArrowDown', 0, -5], ['ArrowLeft', -5, 0], ['ArrowRight', 5, 0]] },
  };

  const FIRE = {
    buggy: { code: `when [b v] key pressed
repeat (3)
  create clone of [myself v]
  wait (5) seconds

when [m v] key pressed
forever
  create clone of [myself v]
  wait (1) seconds

when I start as a clone
repeat until <(y position) > (178)>
  change y by (4)`, burst: 'b', auto: 'm', gap: 5000, autoGap: 1000, speed: 4 },
    fixed: { code: `when [space v] key pressed
repeat (3)
  create clone of [myself v]
  wait (0.15) seconds

when [x v] key pressed
forever
  create clone of [myself v]
  wait (0.2) seconds

when I start as a clone
repeat until <(y position) > (178)>
  change y by (14)`, burst: ' ', auto: 'x', gap: 150, autoGap: 200, speed: 14 },
  };

  const toggle = () => `<div class="row" style="gap:10px"><button class="toggle on" data-v="buggy">🐞 Broken code</button><button class="toggle" data-v="fixed">✅ Fixed code</button></div>`;

  SC.lesson({
    num: 4,
    title: 'Airplane Battle',
    tag: 'DEBUGGING',
    colour: '#d9644a',
    summary: 'Load a broken game. Test it, find the bugs in the code and fix them.',
    ideas: ['testing', 'debugging', 'loops', 'if-else'],
    files: [
      { name: 'Airplane Battle - Student Challenge.sb3', href: SC.file(F, 'Airplane Battle - Student Challenge.sb3'), note: 'The broken game students load and fix' },
      { name: 'Testing and Debugging Worksheet.docx', href: SC.file(F, 'Testing and Debugging Worksheet.docx'), note: 'One-page guide: 3 steps + final challenge' },
    ],
    slides: [
      {
        nav: 'Welcome', className: 'split',
        html: `<div>
            <p class="eyebrow"><span></span>LESSON 4 · TESTING &amp; DEBUGGING</p>
            <h1>Fix the<br><em>game.</em></h1>
            <p class="lead">Someone broke <b>Airplane Battle</b>. Play it, work out what's wrong, then fix the code.</p>
            <p style="margin-top:34px"><button class="btn" data-act="next">Let's go →</button></p>
          </div>
          <div data-game style="width:640px;justify-self:center"></div>`,
        enter(el) {
          const g = game(el.querySelector('[data-game]'));
          g.add('lives-10.svg', 200, -130, 160);
          g.hud('');
          const plane = g.add('plane.svg', 70, 0, -125);
          const enemies = [-150, 20, 150].map((x, i) => g.add('enemy.svg', 55, x, 150 - i * 70));
          const bullets = [];
          const r = new Runner();
          r.run(async (api) => {
            for (let t = 0; ; t++) {
              plane.place(Math.sin(t / 30) * 120, -125);
              enemies.forEach((e, i) => { let y = e.y - 1.2 - i * 0.3; if (y < -200) y = 200; e.place(e.x, y); });
              if (t % 18 === 0) bullets.push(g.add('bullet.svg', 14, plane.x, -90));
              bullets.forEach((b) => b.place(b.x, b.y + 9));
              while (bullets.length && bullets[0].y > 190) bullets.shift().img.remove();
              await api.wait(30);
            }
          });
          return () => r.stop();
        },
      },
      {
        nav: 'Test and debug', className: 'top',
        html: `<div><p class="eyebrow"><span></span>TODAY YOU'RE A GAME TESTER</p><h2>Test it. <em>Debug it.</em></h2></div>
          <div class="col" style="gap:28px">
            <div class="grid-2">
              <div class="card"><h3>🧪 Testing</h3><p>Play the game <b>on purpose</b> to find anything strange, unexpected or wrong.</p></div>
              <div class="card"><h3>🐞 Debugging</h3><p>Find the <b>cause</b> in the code, change it, then test again.</p></div>
            </div>
            <div>
              <p class="pill">THE GOLDEN RULE: ONE CHANGE AT A TIME</p>
              <div class="loop5" style="margin-top:16px"><span>Change one thing</span><i>→</i><span>Predict</span><i>→</i><span>Test</span><i>→</i><span>Observe</span><i>→</i><span>Repeat ↺</span></div>
            </div>
            <div class="question">Why only one change at a time?<button class="reveal-btn" style="margin-left:auto">Answer</button><span class="reveal" style="color:var(--sun)">So you know which change fixed it — or broke it!</span></div>
          </div>`,
      },
      {
        nav: 'Load the game', className: 'split',
        html: `<div>
            <p class="eyebrow"><span></span>GET THE GAME</p>
            <h2>Load it into<br><em>Scratch.</em></h2>
            <div class="files" style="margin-top:26px"><a class="file" href="${SC.file(F, 'Airplane Battle - Student Challenge.sb3')}" download>Airplane Battle - Student Challenge.sb3</a></div>
            <div class="tip" style="margin-top:22px"><b>Can't find the file?</b> Look in your <b>Downloads</b> folder.</div>
          </div>
          <ol class="steps">
            <li>Download the game file (button on the left).</li>
            <li>Go to <b>scratch.mit.edu</b> → <b>Create</b>.</li>
            <li><span><b>File → Load from your computer</b><small>Pick the file. Click OK if it asks to replace the project.</small></span></li>
            <li>Click the green flag and play!</li>
          </ol>`,
      },
      {
        nav: 'Play first', className: 'split',
        html: `<div>
            <p class="eyebrow"><span></span>TEST IT</p>
            <h2>Play first.<br><em>What's weird?</em></h2>
            <p class="lead">Play for 2 minutes. Don't touch the code yet. Notice everything that feels wrong.</p>
            <div class="question">What did you notice?</div>
          </div>
          <div class="col">
            <button class="reveal-btn">Show what testers usually find</button>
            <div class="card reveal">
              <ul class="checks">
                <li>The arrow keys do nothing — <b>W A S D</b> move the plane, the wrong way</li>
                <li>The plane is fast one way and slow the other</li>
                <li><b>Space</b> doesn't shoot. <b>B</b> and <b>M</b> do — slowly</li>
                <li>Burst fire waits ages between shots</li>
                <li>Bullets crawl up the screen</li>
              </ul>
            </div>
            <div class="tip"><b>Rules of the game:</b> hit an enemy = +0.5 score · miss one = lose a ⭐ · every 10 points = next level · 100 points = you win!</div>
          </div>`,
      },
      {
        nav: 'Meet the sprites', className: 'top',
        html: `<div class="heading-row">
            <div><p class="eyebrow"><span></span>WHERE IS THE CODE?</p><h2>Meet the <em>sprites.</em></h2></div>
            <p class="lead">Click a sprite in the sprite list to see its code. Each bug lives in one sprite.</p>
          </div>
          <div class="grid-4">
            <div class="card sprite-card"><img src="${IMG}plane.svg" alt=""><h3>Player Plane</h3><p>Moves with the keys.</p><p class="pill" style="margin-top:12px">BUG HUNT 1</p></div>
            <div class="card sprite-card"><img src="${IMG}bullet.svg" alt="" style="height:70px"><h3>Bullet</h3><p>Burst fire and automatic fire.</p><p class="pill" style="margin-top:12px">BUG HUNT 2</p></div>
            <div class="card sprite-card"><img src="${IMG}enemy.svg" alt=""><h3>Enemy Plane</h3><p>Falls down. Hit or miss?</p><p class="pill" style="margin-top:12px">BUG HUNT 3</p></div>
            <div class="card sprite-card"><img src="${IMG}lives-10.svg" alt="" style="height:36px;margin:17px 0"><h3>Stage</h3><p>Score, Level and Lives (variables).</p></div>
          </div>`,
      },
      {
        nav: 'Bug hunt 1: moving', className: 'split',
        html: `<div>
            <p class="eyebrow"><span></span>BUG HUNT 1 · PLAYER PLANE</p>
            <h2>Fix the <em>controls.</em></h2>
            <div class="code-panel" data-code style="margin-top:20px;width:fit-content"></div>
          </div>
          <div class="col">
            ${toggle()}
            <div data-game tabindex="0" data-own-keys></div>
            <p class="focus-hint" data-hint></p>
          </div>`,
        enter(el) {
          let mode = 'buggy';
          const g = game(el.querySelector('[data-game]'));
          const plane = g.add('plane.svg', 70, 0, -60);
          const area = el.querySelector('[data-game]');
          const hint = el.querySelector('[data-hint]');
          let c;
          const down = new Set();
          const show = () => {
            c = codeInto(el.querySelector('[data-code]'), MOVE[mode].code, 's');
            el.querySelectorAll('[data-v]').forEach((b) => b.classList.toggle('on', b.dataset.v === mode));
            hint.innerHTML = mode === 'buggy'
              ? 'Click the game, then hold <span class="key">W</span> <span class="key">A</span> <span class="key">S</span> <span class="key">D</span>'
              : 'Click the game, then hold the arrow keys <span class="key">↑</span> <span class="key">↓</span> <span class="key">←</span> <span class="key">→</span>';
            plane.place(0, -60);
          };
          const r = new Runner();
          r.run(async (api) => {
            for (;;) {   // like the forever loop: check every key, every frame
              const lit = [1];
              MOVE[mode].keys.forEach(([k, dx, dy], i) => {
                if (down.has(k)) {
                  lit.push(2 + i * 2, 3 + i * 2);
                  plane.place(Math.max(-215, Math.min(215, plane.x + dx)), Math.max(-150, Math.min(150, plane.y + dy)));
                }
              });
              c.light(lit.length > 1 ? lit : []);
              await api.wait(30);
            }
          });
          const norm = (e) => (e.key.length === 1 ? e.key.toLowerCase() : e.key);
          const kd = (e) => { const k = norm(e); if (MOVE[mode].keys.some(([key]) => key === k)) { e.preventDefault(); down.add(k); } };
          const ku = (e) => down.delete(norm(e));
          const on = (e) => { const b = e.target.closest('[data-v]'); if (b) { mode = b.dataset.v; down.clear(); show(); area.focus(); } };
          area.addEventListener('keydown', kd); area.addEventListener('keyup', ku);
          area.addEventListener('blur', () => down.clear());
          el.addEventListener('click', on);
          show();
          return () => { r.stop(); el.removeEventListener('click', on); area.removeEventListener('keydown', kd); area.removeEventListener('keyup', ku); };
        },
      },
      {
        nav: 'Bug hunt 2: firing', className: 'split',
        html: `<div>
            <p class="eyebrow"><span></span>BUG HUNT 2 · BULLET</p>
            <h2>Fix the <em>fire buttons.</em></h2>
            <p class="lead" style="font-size:22px">Look for: which <b>key</b>? How long is the <b>wait</b>? How fast does the bullet <b>move</b>?</p>
            <div class="code-panel" data-code style="margin-top:16px;width:fit-content"></div>
          </div>
          <div class="col">
            ${toggle()}
            <div data-game></div>
            <div class="btn-row"><button class="btn" data-fire="burst">Burst fire</button><button class="btn ghost" data-fire="auto">Auto fire (3 s)</button></div>
          </div>`,
        enter(el) {
          let mode = 'buggy';
          const g = game(el.querySelector('[data-game]'));
          const plane = g.add('plane.svg', 70, 0, -125);
          let c;
          const show = () => {
            c = codeInto(el.querySelector('[data-code]'), FIRE[mode].code, 's');
            el.querySelectorAll('[data-v]').forEach((b) => b.classList.toggle('on', b.dataset.v === mode));
            const f = FIRE[mode];
            el.querySelector('[data-fire="burst"]').textContent = `Burst fire (${f.burst === ' ' ? 'Space' : f.burst.toUpperCase()})`;
            el.querySelector('[data-fire="auto"]').textContent = `Auto fire (${f.auto.toUpperCase()}, 3 s)`;
          };
          const shots = new Runner(), flying = new Runner();
          const bullets = [];
          flying.run(async (api) => {
            for (;;) {
              bullets.forEach((b) => b.place(b.x, b.y + FIRE[mode].speed * 0.9));
              while (bullets.length && bullets[0].y > 178) bullets.shift().img.remove();
              await api.wait(30);
            }
          });
          const shoot = () => bullets.push(g.add('bullet.svg', 14, plane.x, plane.y + 31));
          const fire = (kind) => shots.run(async (api) => {
            const f = FIRE[mode];
            if (kind === 'burst') {
              c.light(0);
              for (let k = 0; k < 3; k++) { c.light(1, 2); shoot(); await api.wait(100); c.light(1, 3); await api.wait(f.gap); }
            } else {
              const end = performance.now() + 3000;
              c.light(4);
              while (performance.now() < end) { c.light(5, 6); shoot(); await api.wait(100); c.light(5, 7); await api.wait(f.autoGap); }
            }
            c.clear();
          });
          const on = (e) => {
            const v = e.target.closest('[data-v]'); if (v) { mode = v.dataset.v; shots.stop(); show(); }
            const f = e.target.closest('[data-fire]'); if (f) fire(f.dataset.fire);
          };
          el.addEventListener('click', on);
          show();
          return () => { shots.stop(); flying.stop(); el.removeEventListener('click', on); };
        },
      },
      {
        nav: 'Bug hunt 3: enemy', className: 'split',
        html: `<div>
            <p class="eyebrow"><span></span>BUG HUNT 3 · ENEMY PLANE</p>
            <h2>Hit or miss?<br><em>If-else decides.</em></h2>
            <div class="code-panel" data-code style="margin-top:18px;width:fit-content"></div>
          </div>
          <div class="col">
            <div class="row" style="font-size:22px;font-weight:800;gap:12px">Did a bullet hit it?
              <button class="toggle" data-hit="yes">Yes, hit</button><button class="toggle" data-hit="no">No, missed</button>
              <button class="toggle" data-reset>Reset</button>
            </div>
            <div data-game></div>
            <p class="small" style="margin:0">Check: one miss = one ⭐ gone. Zero ⭐ = Game Over.</p>
          </div>`,
        enter(el) {
          const c = codeInto(el.querySelector('[data-code]'), `when I start as a clone
repeat until <<touching [Bullet v]?> or <(y position) < (-168)>>
  change y by (-3)
if <touching [Bullet v]?> then
  change [Score v] by (0.5)
else
  change [Lives v] by (-1)
  if <(Lives) < (1)> then
    broadcast [GAME OVER v]
delete this clone`, 's');
          const g = game(el.querySelector('[data-game]'));
          const plane = g.add('plane.svg', 70, 0, -125);
          let score = 0, lives = 3;
          const hud = () => g.hud(`<span>Score ${score}</span><span>Lives ${'⭐'.repeat(lives) || '0'}</span>`);
          let over = null;
          const r = new Runner();
          const play = (hit) => r.run(async (api) => {
            if (lives < 1) return;
            el.querySelectorAll('[data-hit]').forEach((b) => b.classList.toggle('on', b.dataset.hit === (hit ? 'yes' : 'no')));
            const enemy = g.add('enemy.svg', 55, hit ? 0 : 120, 160);
            c.light(0); await api.wait(200);
            let bullet = null;
            for (;;) {
              c.light(1, 2);
              enemy.place(enemy.x, enemy.y - 6);
              if (hit && !bullet && enemy.y < 60) bullet = g.add('bullet.svg', 14, plane.x, -90);
              if (bullet) bullet.place(bullet.x, bullet.y + 14);
              if (bullet && bullet.y >= enemy.y - 20) break;
              if (enemy.y < -168) break;
              await api.wait(30);
            }
            if (bullet) bullet.img.remove();
            c.light(3); await api.wait(400);
            if (hit) { c.light(3, 4); score += 0.5; }
            else {
              c.light(3, 5); lives -= 1; hud(); await api.wait(500);
              c.light(6);
              if (lives < 1) { c.light(6, 7); over = g.add('game-over.svg', 340, 0, 0); }
            }
            hud(); await api.wait(500);
            c.light(8); enemy.img.remove(); await api.wait(300); c.clear();
          });
          const on = (e) => {
            const b = e.target.closest('[data-hit]'); if (b) play(b.dataset.hit === 'yes');
            if (e.target.closest('[data-reset]')) { r.stop(); score = 0; lives = 3; if (over) { over.img.remove(); over = null; } g.el.querySelectorAll('img').forEach((i) => { if (!i.src.includes('plane.svg')) i.remove(); }); c.clear(); hud(); }
          };
          el.addEventListener('click', on);
          hud();
          return () => { r.stop(); el.removeEventListener('click', on); };
        },
      },
      {
        nav: 'Find the ideas', className: 'top',
        html: `<div class="heading-row">
            <div><p class="eyebrow"><span></span>EVERYTHING YOU'VE LEARNED</p><h2>It's all <em>in the game.</em></h2></div>
            <p class="lead">Find one of each in the code. Point to it on your screen.</p>
          </div>
          <div class="find">
            <div class="card"><h3>⚡ Event</h3><button class="reveal-btn">Where?</button><p class="reveal">when [space] key pressed (Bullet)</p></div>
            <div class="card"><h3>🔁 Loop</h3><button class="reveal-btn">Where?</button><p class="reveal">forever (Plane) · repeat 3 (Bullet) · repeat until (Enemy)</p></div>
            <div class="card"><h3>❓ Condition</h3><button class="reveal-btn">Where?</button><p class="reveal">key up arrow pressed? · touching Bullet?</p></div>
            <div class="card"><h3>🔀 If-else</h3><button class="reveal-btn">Where?</button><p class="reveal">Enemy: hit → Score up, miss → Lives down</p></div>
            <div class="card"><h3>📦 Variable</h3><button class="reveal-btn">Where?</button><p class="reveal">Score, Level, Lives, Enemy speed, Spawn delay</p></div>
          </div>
          <div class="tip"><b>New block:</b> <b>repeat until</b> keeps looping <i>until</i> the question is true — the bullet flies until it reaches the top.</div>`,
      },
      {
        nav: 'Final challenge', className: 'split-wide',
        html: `<div>
            <p class="eyebrow"><span></span>YOUR TURN · 30 MIN</p>
            <h2>Playable —<br><em>not too easy.</em></h2>
            <div class="tip" style="margin-top:22px"><b>Save it:</b> File → Save to your computer.<br>Name it <b>Firstname - Airplane Battle.sb3</b></div>
            <div class="files" style="margin-top:18px">
              <a class="file" href="${SC.file(F, 'Airplane Battle - Student Challenge.sb3')}" download>Student Challenge.sb3</a>
              <a class="file" href="${SC.file(F, 'Testing and Debugging Worksheet.docx')}" download>Worksheet.docx</a>
            </div>
          </div>
          <div class="col">
            <div class="card">
              <h3>Checklist</h3>
              <ul class="checks" style="margin-top:12px">
                <li>All 4 arrow keys move the plane the right way, at the same speed</li>
                <li><b>Space</b> = burst fire, <b>X</b> = auto fire</li>
                <li>Bullets are fast and the waits make sense</li>
                <li>A miss takes one ⭐. Zero ⭐ = Game Over</li>
                <li>Final boss: beat all 10 levels with full health</li>
              </ul>
            </div>
            <div class="tip"><b>Too easy or too hard?</b> Tune the Stage: <b>Enemy speed</b>, <b>Spawn delay</b> — or the score for each hit. One change at a time!</div>
          </div>`,
      },
      {
        nav: 'Recap', className: 'top',
        html: `<div class="center-col" style="display:grid"><p class="eyebrow"><span></span>RECAP</p><h2>You're a <em>debugger</em> now.</h2></div>
          <div class="col" style="gap:26px">
            <div class="loop5" style="justify-content:center"><span>Change one thing</span><i>→</i><span>Predict</span><i>→</i><span>Test</span><i>→</i><span>Observe</span><i>→</i><span>Repeat ↺</span></div>
            <div class="grid-3">
              <div class="card"><h3>Why is the movement inside forever?</h3><button class="reveal-btn">Answer</button><p class="reveal">So the keys are checked again and again — not just once at the start.</p></div>
              <div class="card"><h3>When does each branch of the enemy's if-else run?</h3><button class="reveal-btn">Answer</button><p class="reveal">Touching a bullet → Score goes up. Otherwise (it reached the bottom) → lose a life.</p></div>
              <div class="card"><h3>Which bug was hardest to find? Why?</h3><button class="reveal-btn">Talk</button><p class="reveal">Share with the person next to you.</p></div>
            </div>
          </div>`,
      },
    ],
  });
})();
