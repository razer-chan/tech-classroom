/* Slide engine: home page, lesson decks, keyboard, full screen.
 * Lessons register themselves with SC.lesson({...}) in lesson1.js … lesson4.js.
 * Plain script (no modules) so index.html also works by double-click.
 */
(function () {
  'use strict';

  const W = 1600, H = 900;
  const lessons = [];
  const $ = (s, el = document) => el.querySelector(s);

  const SC = (window.SC = {
    lesson(def) { lessons.push(def); lessons.sort((a, b) => a.num - b.num); },
    /** Link to a file in a lesson folder (folder names have spaces). */
    file(folder, name) { return encodeURI(folder + '/' + name); },
  });

  let current = null;   // { lesson, index }
  let cleanup = null;   // returned by the current slide's enter()

  // ---------- layout: one 1600 x 900 frame scaled to the window ----------
  function fit() {
    const s = Math.min(window.innerWidth / W, window.innerHeight / H);
    document.documentElement.style.setProperty('--scale', s);
  }
  window.addEventListener('resize', fit);

  function fullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  // ---------- home ----------
  function home() {
    leave();
    current = null;
    const frame = $('#frame');
    frame.className = 'frame home';
    frame.innerHTML = `
      <header class="topbar">
        <div class="brand"><span class="brand-mark">S</span><span>SCRATCH LEARNING</span></div>
        <div></div>
        <div class="top-actions"><button class="icon-btn" data-act="full" title="Full screen (F)">⛶</button></div>
      </header>
      <main class="home-main">
        <section class="home-hero">
          <div>
            <p class="eyebrow"><span></span>DIGITAL TECHNOLOGIES</p>
            <h1>Learn the logic.<br><em>Build the idea.</em></h1>
            <p class="lead">Four short lessons in Scratch. Learn the idea, watch it work, then build it yourself.</p>
          </div>
          <img class="home-cat" src="site/img/cat-1.svg" alt="">
        </section>
        <section class="lesson-grid">
          ${lessons.map((l) => `
            <article class="lesson-card" style="--accent:${l.colour}">
              <div class="card-top"><span class="card-num">0${l.num}</span><span class="card-tag">${l.tag}</span></div>
              <h3>${l.title}</h3>
              <p>${l.summary}</p>
              <ul class="card-ideas">${l.ideas.map((i) => `<li>${i}</li>`).join('')}</ul>
              <button class="card-start" data-start="${l.num}">Start lesson <span>→</span></button>
              <div class="card-files">${l.files.map((f) => `<a href="${f.href}" download title="${f.note || ''}">⤓ ${f.name}</a>`).join('')}</div>
            </article>`).join('')}
        </section>
      </main>`;
    if (location.hash !== '' && location.hash !== '#/') history.replaceState(null, '', '#/');
  }

  // ---------- deck ----------
  function openLesson(num, index = 0) {
    const lesson = lessons.find((l) => l.num === num);
    if (!lesson) return home();
    const frame = $('#frame');
    if (!current || current.lesson !== lesson) {
      leave();
      frame.className = 'frame deck';
      frame.style.setProperty('--accent', lesson.colour);
      frame.innerHTML = `
        <header class="topbar">
          <button class="brand" data-act="home" title="All lessons"><span class="brand-mark">S</span><span>SCRATCH LEARNING</span></button>
          <div class="part-label">LESSON ${lesson.num} · ${lesson.title.toUpperCase()}</div>
          <div class="top-actions">
            <span class="slide-name"></span>
            <button class="icon-btn" data-act="home" title="All lessons">⌂</button>
            <button class="icon-btn" data-act="full" title="Full screen (F)">⛶</button>
            <span class="counter"></span>
          </div>
        </header>
        <main class="slides"></main>
        <footer class="controls">
          <button class="nav-btn" data-act="prev" aria-label="Previous slide">←</button>
          <nav class="dots">${lesson.slides.map((s, i) => `<button data-go="${i}" title="${s.nav}"></button>`).join('')}</nav>
          <button class="nav-btn" data-act="next" aria-label="Next slide">→</button>
          <span class="key-hint">← → MOVE · F FULL SCREEN</span>
        </footer>`;
      current = { lesson, index: -1, built: [] };
    }
    show(Math.max(0, Math.min(index, lesson.slides.length - 1)));
  }

  function build(i) {
    const { lesson, built } = current;
    if (built[i]) return built[i];
    const def = lesson.slides[i];
    const el = document.createElement('section');
    el.className = 'slide ' + (def.className || '');
    // Block text like <touching …?> would be read as an HTML tag, so escape it first.
    el.innerHTML = def.html.replace(/(<pre class="blocks"[^>]*>)([\s\S]*?)(<\/pre>)/g,
      (m, open, text, close) => open + text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + close);
    SB.renderAll(el);
    $('.slides').appendChild(el);
    built[i] = el;
    return el;
  }

  function leave() {
    if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } }
    cleanup = null;
  }

  function show(i) {
    const { lesson } = current;
    if (i === current.index) return;
    leave();
    current.built.forEach((el) => el && el.classList.remove('active'));
    const el = build(i);
    el.classList.add('active');
    current.index = i;
    const def = lesson.slides[i];
    if (def.enter) cleanup = def.enter(el) || null;
    $('.slide-name').textContent = def.nav;
    $('.counter').textContent = `${String(i + 1).padStart(2, '0')} / ${String(lesson.slides.length).padStart(2, '0')}`;
    document.querySelectorAll('.dots button').forEach((d, k) => d.classList.toggle('on', k === i));
    $('[data-act="prev"]').disabled = i === 0;
    $('[data-act="next"]').disabled = i === lesson.slides.length - 1;
    history.replaceState(null, '', `#/${lesson.num}/${i + 1}`);
  }

  function step(d) { if (current) show(Math.max(0, Math.min(current.index + d, current.lesson.slides.length - 1))); }

  function route() {
    const m = location.hash.match(/^#\/(\d+)(?:\/(\d+))?/);
    if (m) openLesson(+m[1], m[2] ? +m[2] - 1 : 0); else home();
  }

  // ---------- events ----------
  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, [data-act]');
    if (!t) return;
    if (t.dataset.act === 'full') fullscreen();
    else if (t.dataset.act === 'home') home();
    else if (t.dataset.act === 'prev') step(-1);
    else if (t.dataset.act === 'next') step(1);
    else if (t.dataset.start) openLesson(+t.dataset.start, 0);
    else if (t.dataset.go) show(+t.dataset.go);
    else if (t.classList.contains('reveal-btn')) {
      // Teacher clicks to show the answer under the button.
      const box = t.nextElementSibling;
      if (box) { box.classList.add('shown'); t.classList.add('used'); }
    }
  });

  document.addEventListener('keydown', (e) => {
    // A demo that uses a key (e.g. Space) calls preventDefault() first.
    if (e.defaultPrevented || e.target.closest('input, textarea')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'f' || e.key === 'F') { fullscreen(); return; }
    if (!current) return;
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); step(1); }
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); step(-1); }
    else if (e.key === 'Home') show(0);
    else if (e.key === 'End') show(current.lesson.slides.length - 1);
  });

  window.addEventListener('hashchange', () => {
    const m = location.hash.match(/^#\/(\d+)(?:\/(\d+))?/);
    if (!m && current) home();
    else if (m && (!current || current.lesson.num !== +m[1] || current.index !== (m[2] ? +m[2] - 1 : 0))) route();
  });

  document.addEventListener('DOMContentLoaded', () => { fit(); route(); });
})();
