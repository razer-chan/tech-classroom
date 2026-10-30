// Pictures of real blocks (same shapes and colours as in the missions), for the quiz.
// Each block is drawn once in a hidden Blockly workspace and its SVG is copied.
import './blocks.js?v=4636962f';                       // registers the Robot Lab block types

const Blockly = window.Blockly;
let ws = null;
const cache = new Map();

function hiddenWorkspace() {
  if (ws) return ws;
  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;left:-10000px;top:0;width:1200px;height:800px;';
  host.setAttribute('aria-hidden', 'true');
  document.body.append(host);
  const theme = Blockly.Theme.defineTheme('lab', { base: Blockly.Themes.Classic, startHats: true });
  ws = Blockly.inject(host, { theme, media: 'vendor/blockly/media/' });
  return ws;
}

// state: one block in Blockly's JSON form (its "next" chain is drawn too)
export function blockPicture(state, scale = 0.8) {
  const key = scale + JSON.stringify(state);
  if (cache.has(key)) return cache.get(key);
  const w = hiddenWorkspace();
  w.clear();
  const block = Blockly.serialization.blocks.append(state, w);
  const root = block.getSvgRoot();
  const bb = root.getBBox();
  const copy = root.cloneNode(true);
  copy.removeAttribute('transform');
  const html = `<span class="block-pic geras-renderer lab-theme"><svg role="img" width="${Math.ceil((bb.width + 4) * scale)}" height="${Math.ceil((bb.height + 4) * scale)}" viewBox="${bb.x - 2} ${bb.y - 2} ${bb.width + 4} ${bb.height + 4}">${copy.outerHTML}</svg></span>`;
  w.clear();
  cache.set(key, html);
  return html;
}
