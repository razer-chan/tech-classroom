/* Draws Scratch-style blocks from a short text format.
 *
 *   when @flag clicked
 *   repeat (4)
 *     move (160) steps
 *     turn left (90) degrees
 *   if <touching [mouse-pointer v]?> then
 *     say [Hi!]
 *   else
 *     say []
 *
 * (10) number · [text] text · [space v] dropdown · <...> true/false question
 * {Score} variable · @flag green flag. Two spaces of indent = inside a C block.
 * A blank line starts a new script. Each block gets an index (top to bottom)
 * so slides can light up the block that is "running".
 */
(function () {
  'use strict';

  const CATS = [
    ['control', /^when I start as a clone/],
    ['events', /^(when |broadcast)/],
    ['looks', /^(say|think|switch costume|next costume|switch backdrop|next backdrop|change size|set size|clear graphic|show$|hide$|go to \[front|change \[(colou?r|brightness|ghost)|set \[(colou?r|brightness|ghost))/],
    ['control', /^(wait|repeat|forever|if |stop|create clone|delete this clone)/],
    ['motion', /^(move|turn|go to|glide|change x|change y|set x|set y|point|if on edge)/],
    ['sound', /^(play sound|start sound|stop all sounds)/],
    ['variables', /^(set|change) \[[^\]]+\] (to|by)/],
    ['sensing', /^(ask)/],
  ];
  const C_BLOCKS = /^(repeat|forever|if )/;

  function category(text) {
    for (const [cat, re] of CATS) if (re.test(text)) return cat;
    return 'motion';
  }

  function boolCategory(raw) {
    if (/^\s*</.test(raw) || /^\s*not\b/.test(raw)) return 'operators';   // and / or / not
    return /touching|key .* pressed|mouse down/.test(raw) ? 'sensing' : 'operators';
  }

  // Find the closing bracket that matches s[i].
  function closeRound(s, i) {
    let depth = 0;
    for (let j = i; j < s.length; j++) {
      if (s[j] === '(') depth++;
      else if (s[j] === ')' && --depth === 0) return j;
    }
    return s.length - 1;
  }
  // '<' opens a true/false slot unless it is a "less than" with spaces around it.
  function closeAngle(s, i) {
    let depth = 0;
    for (let j = i; j < s.length; j++) {
      if (s[j] === '<' && s[j + 1] !== ' ') depth++;
      else if (s[j] === '>' && s[j - 1] !== ' ' && --depth === 0) return j;
    }
    return s.length - 1;
  }

  function parseRound(inner) {
    if (/^-?[\d.]*$/.test(inner.trim())) return { t: 'num', v: inner.trim() };
    if (/[(<]/.test(inner)) return { t: 'rep', cat: 'operators', parts: parseInline(inner) };
    if (/position|mouse [xy]|timer/.test(inner)) return { t: 'rep', cat: 'sensing', parts: [{ t: 'text', v: inner }] };
    return { t: 'rep', cat: 'variables', parts: [{ t: 'text', v: inner }] };
  }

  function parseInline(s) {
    const out = [];
    let buf = '';
    const flush = () => { if (buf.trim()) out.push({ t: 'text', v: buf.trim() }); buf = ''; };
    for (let i = 0; i < s.length;) {
      const c = s[i];
      if (c === '(') {
        const j = closeRound(s, i); flush(); out.push(parseRound(s.slice(i + 1, j))); i = j + 1;
      } else if (c === '[') {
        const j = s.indexOf(']', i); flush();
        const v = s.slice(i + 1, j);
        out.push(/ v$/.test(v) ? { t: 'drop', v: v.slice(0, -2) } : { t: 'str', v });
        i = j + 1;
      } else if (c === '{') {
        const j = s.indexOf('}', i); flush();
        out.push({ t: 'rep', cat: 'variables', parts: [{ t: 'text', v: s.slice(i + 1, j) }] }); i = j + 1;
      } else if (c === '<' && s[i + 1] !== ' ') {
        const j = closeAngle(s, i); flush();
        const raw = s.slice(i + 1, j);
        out.push({ t: 'bool', cat: boolCategory(raw), parts: parseInline(raw) }); i = j + 1;
      } else if (s.startsWith('@flag', i)) {
        flush(); out.push({ t: 'flag' }); i += 5;
      } else { buf += c; i++; }
    }
    flush();
    return out;
  }

  const FLAG = '<svg class="sb-flag" viewBox="0 0 20 20" aria-label="green flag"><path d="M4 2v16" stroke="#45993d" stroke-width="2.2" stroke-linecap="round"/><path d="M5 3c4-2 6 2 11 0v8c-5 2-7-2-11 0z" fill="#4cbf56" stroke="#45993d" stroke-width="1.2" stroke-linejoin="round"/></svg>';
  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function partsHtml(parts) {
    return parts.map((p) => {
      if (p.t === 'text') return `<span class="sb-t">${esc(p.v)}</span>`;
      if (p.t === 'num') return `<span class="sb-num">${esc(p.v)}</span>`;
      if (p.t === 'str') return `<span class="sb-str">${esc(p.v) || '&nbsp;'}</span>`;
      if (p.t === 'drop') return `<span class="sb-drop">${esc(p.v)}<i>▾</i></span>`;
      if (p.t === 'flag') return FLAG;
      if (p.t === 'bool') return `<span class="sb-bool cat-${p.cat}">${partsHtml(p.parts)}</span>`;
      if (p.t === 'rep') return `<span class="sb-rep cat-${p.cat}">${partsHtml(p.parts)}</span>`;
      return '';
    }).join('');
  }

  // Turn the text into a tree of scripts.
  function parse(text) {
    const scripts = [];
    let stack = null;
    let index = 0;
    for (const rawLine of text.replace(/^\n+|\s+$/g, '').split('\n')) {
      if (!rawLine.trim()) { stack = null; continue; }
      const indent = rawLine.match(/^ */)[0].length / 2;
      const line = rawLine.trim();
      if (!stack) { stack = [{ depth: -1, list: [] }]; scripts.push(stack[0].list); }
      while (stack.length > 1 && stack[stack.length - 1].depth >= indent) stack.pop();
      if (line === 'else') {
        const owner = stack[stack.length - 1].list.at(-1);
        owner.elseBody = [];
        stack.push({ depth: indent, list: owner.elseBody });
        continue;
      }
      const node = { line, index: index++, cat: category(line), body: null };
      stack[stack.length - 1].list.push(node);
      if (C_BLOCKS.test(line)) { node.body = []; stack.push({ depth: indent, list: node.body }); }
    }
    return scripts;
  }

  function nodeHtml(n) {
    const hat = /^when /.test(n.line) ? ' sb-hat' : '';
    const cap = /^(forever|delete this clone|stop \[all)/.test(n.line) ? ' sb-cap' : '';
    const row = `<div class="sb-row">${partsHtml(parseInline(n.line))}</div>`;
    if (!n.body) return `<div class="sb cat-${n.cat}${hat}${cap}" data-i="${n.index}">${row}</div>`;
    let html = `<div class="sb sb-c cat-${n.cat}${cap}" data-i="${n.index}">${row}<div class="sb-mouth">${n.body.map(nodeHtml).join('')}</div>`;
    if (n.elseBody) html += `<div class="sb-row sb-else"><span class="sb-t">else</span></div><div class="sb-mouth">${n.elseBody.map(nodeHtml).join('')}</div>`;
    return html + '<div class="sb-foot"></div></div>';
  }

  /** Render text into an element. Returns { el, blocks, light(i), clear() }. */
  function render(text, opts = {}) {
    const el = document.createElement('div');
    el.className = 'sb-scripts' + (opts.className ? ' ' + opts.className : '');
    el.innerHTML = parse(text).map((s) => `<div class="sb-script">${s.map(nodeHtml).join('')}</div>`).join('');
    const blocks = [];
    el.querySelectorAll('[data-i]').forEach((b) => { blocks[+b.dataset.i] = b; });
    const api = {
      el,
      blocks,
      light(...idx) {
        blocks.forEach((b) => b.classList.remove('run'));
        idx.flat().forEach((i) => blocks[i] && blocks[i].classList.add('run'));
      },
      clear() { blocks.forEach((b) => b.classList.remove('run')); },
    };
    return api;
  }

  /** Replace every <pre class="blocks"> inside root with drawn blocks. */
  function renderAll(root) {
    root.querySelectorAll('pre.blocks').forEach((pre) => {
      const drawn = render(pre.textContent, { className: pre.dataset.size || '' });
      pre.replaceWith(drawn.el);
    });
  }

  window.SB = { render, renderAll };
})();
