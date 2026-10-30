// 3D look of the driving-test town. Everything here is decoration except what comes
// from town.js (roads, lines, pads), so what you see is exactly what is checked.
import * as THREE from 'three';
import { RB } from './town.js?v=4636962f';

const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });

// Map (x, y) → three.js (x, height, -y)
const place = (obj, x, y, h = 0) => { obj.position.set(x, h, -y); return obj; };

function textTexture(lines, { w = 256, h = 128, bg = '#ffffff', fg = '#222222', font = 'bold 54px system-ui', border = null } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const draw = text => {
    ctx.clearRect(0, 0, w, h);
    if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); }
    if (border) { ctx.strokeStyle = border; ctx.lineWidth = 10; ctx.strokeRect(5, 5, w - 10, h - 10); }
    ctx.fillStyle = fg;
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const rows = [].concat(text);
    rows.forEach((t, i) => ctx.fillText(t, w / 2, h / 2 + (i - (rows.length - 1) / 2) * h / (rows.length + 0.6)));
    tex.needsUpdate = true;
  };
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  draw(lines);
  tex.redraw = draw;
  return tex;
}

// Flat painted rectangle on the road
function paint(scene, r, color, y = 0.3, map = null) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(r.maxX - r.minX, r.maxY - r.minY),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7, map }));
  mesh.rotation.x = -Math.PI / 2;
  place(mesh, (r.minX + r.maxX) / 2, (r.minY + r.maxY) / 2, y);
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

export function makeCar(color) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(30, 10, 46), std(color, { roughness: 0.45 }));
  body.position.y = 9;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(25, 9, 24), std('#dfe8ee', { roughness: 0.3 }));
  cabin.position.set(0, 18, 2);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(26, 1.5, 22), std(color, { roughness: 0.45 }));
  roof.position.set(0, 23, 2);
  g.add(body, cabin, roof);
  for (const [x, z] of [[-14, -14], [14, -14], [-14, 15], [14, 15]]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 4, 18), std('#222a2e'));
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 5.5, z);
    g.add(wheel);
  }
  // Brake lights at the back (+z), headlights at the front (−z)
  for (const x of [-10, 10]) {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 1), new THREE.MeshStandardMaterial({ color: '#b3261e', emissive: '#000000' }));
    tail.position.set(x, 11, 23.2);
    g.add(tail);
    (g.userData.tails ||= []).push(tail);
    const head = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 1), std('#fff7d6', { emissive: '#665c33' }));
    head.position.set(x, 11, -23.2);
    g.add(head);
  }
  g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return g;
}

function makeHouse(w, d, wall, roof, flat = false) {
  const g = new THREE.Group();
  const walls = new THREE.Mesh(new THREE.BoxGeometry(w, 34, d), std(wall));
  walls.position.y = 17;
  let top;
  if (flat) {
    top = new THREE.Mesh(new THREE.BoxGeometry(w + 6, 4, d + 6), std(roof));
    top.position.y = 36;
  } else {
    top = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(w, d) / 2 * 1.02, 26, 4), std(roof));
    top.rotation.y = Math.PI / 4;
    top.scale.set(w / Math.hypot(w, d) * 1.41, 1, d / Math.hypot(w, d) * 1.41);
    top.position.y = 34 + 13;
  }
  const door = new THREE.Mesh(new THREE.BoxGeometry(9, 18, 1), std('#7a5236'));
  door.position.set(0, 9, d / 2 + 0.3);
  g.add(walls, top, door);
  for (const x of [-w / 3, w / 3]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(10, 9, 1), std('#a9c7d8', { roughness: 0.2 }));
    win.position.set(x, 20, d / 2 + 0.3);
    g.add(win);
  }
  g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}

function makeTree(size = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(2.5 * size, 3 * size, 18 * size, 8), std('#7b5a3c'));
  trunk.position.y = 9 * size;
  const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(15 * size, 0), std('#4f9a4a', { flatShading: true }));
  leaves.position.y = 30 * size;
  g.add(trunk, leaves);
  g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return g;
}

function signPost(scene, x, y, rotY, texture, { w = 22, h = 22, shape = 'rect', height = 40 } = {}) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, height, 8), std('#9aa3a8'));
  pole.position.y = height / 2;
  g.add(pole);
  const geo = shape == 'octagon' ? new THREE.CircleGeometry(w / 2, 8) : new THREE.PlaneGeometry(w, h);
  const face = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide }));
  if (shape == 'octagon') face.rotation.z = Math.PI / 8;
  face.position.set(0, height + h / 2 - 2, 1.2);
  g.add(face);
  g.rotation.y = rotY;           // which way the sign faces
  g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  scene.add(place(g, x, y));
  return g;
}

export function buildTown(view) {
  const { scene, world } = view;

  // Grass
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(world.width + 600, world.height + 600), std('#93c47d'));
  grass.rotation.x = -Math.PI / 2;
  place(grass, world.center.x, world.center.y, 0);
  grass.receiveShadow = true;
  scene.add(grass);

  // Asphalt
  const asphalt = std('#4b5357', { roughness: 0.95 });
  for (const r of world.roads) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(r.maxX - r.minX, r.maxY - r.minY), asphalt);
    m.rotation.x = -Math.PI / 2;
    place(m, (r.minX + r.maxX) / 2, (r.minY + r.maxY) / 2, 0.4);
    m.receiveShadow = true;
    scene.add(m);
  }
  const ring = new THREE.Mesh(new THREE.CircleGeometry(RB.outer, 72), asphalt);
  ring.rotation.x = -Math.PI / 2;
  place(ring, RB.x, RB.y, 0.8);
  ring.receiveShadow = true;
  scene.add(ring);
  // Roundabout island: low kerb, grass and a tree
  const kerb = new THREE.Mesh(new THREE.CylinderGeometry(RB.island, RB.island, 3, 48), std('#d7dcd9'));
  scene.add(place(kerb, RB.x, RB.y, 1.5));
  const top = new THREE.Mesh(new THREE.CylinderGeometry(RB.island - 3, RB.island - 3, 3.2, 48), std('#7fb768'));
  scene.add(place(top, RB.x, RB.y, 1.6));
  scene.add(place(makeTree(1.2), RB.x, RB.y, 3));

  buildFlyover(scene, world, asphalt);

  // Painted lines (one merged mesh)
  const pos = [];
  for (const s of world.lineShapes) {
    const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1) + 2;
    const ux = (s.x2 - s.x1) / (len - 2 || 1), uy = (s.y2 - s.y1) / (len - 2 || 1);
    const nx = -uy, ny = ux;
    const cx = s.x, cy = s.y, hl = len / 2, hw = 1;
    const c = [[-hl, -hw], [hl, -hw], [hl, hw], [-hl, hw]].map(([a, b]) => [cx + ux * a + nx * b, cy + uy * a + ny * b, (s.z1 || 0) + ((s.z2 || 0) - (s.z1 || 0)) * (a + hl) / (2 * hl)]);
    for (const i of [0, 1, 2, 0, 2, 3]) pos.push(c[i][0], c[i][2] + 1.6, -c[i][1]);
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  lineGeo.computeVertexNormals();
  scene.add(new THREE.Mesh(lineGeo, new THREE.MeshBasicMaterial({ color: '#f4f4f0', side: THREE.DoubleSide })));
  paint(scene, world.stopLines.lights, '#f4f4f0', 1.6);
  paint(scene, world.stopLines.stopSign, '#f4f4f0', 1.6);

  // Coloured road paint the sensor reads
  view.lightPad = paint(scene, world.pads.lights, '#d9443a', 1.2);
  paint(scene, world.pads.school, '#e8c22a', 1.2,
    textTexture(['SCHOOL', 'ZONE'], { w: 512, h: 128, bg: '#e8c22a', fg: '#5a4500', font: 'bold 44px system-ui' }));
  const stopTex = textTexture('STOP', { w: 256, h: 256, bg: '#d9443a', fg: '#ffffff', font: 'bold 70px system-ui' });
  stopTex.rotation = Math.PI / 2;
  stopTex.center.set(0.5, 0.5);
  paint(scene, world.pads.stop, '#ffffff', 1.2, stopTex);
  paint(scene, world.pads.bay, '#3b63c9', 1.2,
    textTexture('P', { w: 192, h: 128, bg: '#3b63c9', fg: '#ffffff', font: 'bold 100px system-ui' }));
  const rampTex = textTexture('RAMP', { w: 256, h: 160, bg: '#3b63c9', fg: '#ffffff', font: 'bold 64px system-ui' });
  rampTex.rotation = Math.PI;                 // reads the right way for cars heading south
  rampTex.center.set(0.5, 0.5);
  paint(scene, world.pads.ramp, '#ffffff', 1.2, rampTex);
  // Start marking
  paint(scene, { minX: -110, minY: -248, maxX: -70, maxY: -202 }, '#ffffff', 1.2,
    textTexture('START', { w: 256, h: 128, bg: '#4b5357', fg: '#f4f4f0', font: 'bold 60px system-ui' }));

  // Car park wall and parked cars
  world.walls.forEach((w, i) => {
    const spanX = w.maxX - w.minX, spanY = w.maxY - w.minY;
    if (w.kind == 'wall') {
      const m = new THREE.Mesh(new THREE.BoxGeometry(spanX, 24, spanY), std('#b9bcb5'));
      m.castShadow = m.receiveShadow = true;
      scene.add(place(m, (w.minX + w.maxX) / 2, (w.minY + w.maxY) / 2, 12));
    } else {
      const car = makeCar(CAR_COLOURS[(i * 5) % CAR_COLOURS.length]);
      if (spanX > spanY) {                    // parked east–west
        car.scale.set(spanY / 30, 1, spanX / 46);
        car.rotation.y = Math.PI / 2;
      } else {
        car.scale.set(spanX / 30, 1, spanY / 46);
      }
      scene.add(place(car, (w.minX + w.maxX) / 2, (w.minY + w.maxY) / 2));
    }
  });

  // Driveway and garage where the car in front turns off
  paint(scene, { minX: -620, minY: -115, maxX: -500, maxY: -65 }, '#8d9397', 0.3);

  // Traffic light on the left kerb, facing northbound traffic, with a countdown
  const tl = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 52, 10), std('#59636a'));
  pole.position.y = 26;
  const head = new THREE.Mesh(new THREE.BoxGeometry(10, 28, 7), std('#20272b'));
  head.position.set(0, 50, 0);
  tl.add(pole, head);
  view.lamps = {};
  [['Red', '#ff3b30', 59], ['Yellow', '#ffb000', 50], ['Green', '#30d158', 41]].forEach(([name, color, h]) => {
    const lamp = new THREE.Mesh(new THREE.CircleGeometry(3.3, 20), new THREE.MeshStandardMaterial({ color: '#2b2f31', emissive: '#000000' }));
    lamp.position.set(0, h, 3.6);
    lamp.userData.on = color;
    tl.add(lamp);
    view.lamps[name] = lamp;
  });
  view.countdownTex = textTexture('', { w: 128, h: 96, bg: '#111417', fg: '#ff3b30', font: 'bold 64px ui-monospace, monospace' });
  const display = new THREE.Mesh(new THREE.PlaneGeometry(10, 7.5), new THREE.MeshBasicMaterial({ map: view.countdownTex }));
  display.position.set(0, 31, 1.2);
  tl.add(display);
  tl.traverse(m => { if (m.isMesh) m.castShadow = true; });
  // Faces south (+z), towards cars coming up the road
  scene.add(place(tl, 392, 62));

  // Signs
  signPost(scene, -392, 240, Math.PI / 2,
    textTexture('STOP', { w: 256, h: 256, bg: '#d9443a', fg: '#ffffff', font: 'bold 78px system-ui', border: '#ffffff' }),
    { w: 22, h: 22, shape: 'octagon' });
  signPost(scene, -52, 240, Math.PI / 2,
    textTexture(['SCHOOL', 'ZONE', '30%'], { w: 256, h: 300, bg: '#ffd21f', fg: '#1d1d1d', font: 'bold 52px system-ui', border: '#1d1d1d' }),
    { w: 20, h: 24 });
  signPost(scene, 268, 238, Math.PI / 2,
    textTexture('↻', { w: 256, h: 256, bg: '#1f6fd1', fg: '#ffffff', font: 'bold 170px system-ui' }),
    { w: 18, h: 18 });

  signPost(scene, -472, -212, Math.PI,
    textTexture(['RAMP', '↻'], { w: 256, h: 300, bg: '#1f6fd1', fg: '#ffffff', font: 'bold 70px system-ui', border: '#ffffff' }),
    { w: 18, h: 22 });
  signPost(scene, -478, -628, Math.PI,
    textTexture(['MERGE', '⤵'], { w: 256, h: 300, bg: '#ffd21f', fg: '#1d1d1d', font: 'bold 60px system-ui', border: '#1d1d1d' }),
    { w: 18, h: 22 });

  // School building beside the school zone
  const school = makeHouse(170, 70, '#e9dcc3', '#3b6e9c', true);
  scene.add(place(school, -180, 175));
  const schoolSign = new THREE.Mesh(new THREE.PlaneGeometry(70, 16),
    new THREE.MeshBasicMaterial({ map: textTexture('GEARS PRIMARY', { w: 512, h: 112, bg: '#ffffff', fg: '#3b6e9c', font: 'bold 56px system-ui' }) }));
  schoolSign.position.set(-180, 30, -(175 - 35.6));
  scene.add(schoolSign);

  // Houses and trees (all off the road)
  const houses = [
    [200, -90, 70, 55, '#f3efe6', '#b5523b'], [290, 90, 60, 55, '#dfe9ef', '#6d7b85'], [40, 10, 70, 60, '#f1e3d3', '#8a4f3d'],
    [-260, -60, 70, 60, '#e7eedf', '#b5523b'], [-250, 420, 70, 55, '#f3efe6', '#6d7b85'], [-80, 420, 60, 55, '#dfe9ef', '#b5523b'],
    [320, 420, 70, 55, '#f1e3d3', '#6d7b85'], [0, -370, 70, 45, '#e7eedf', '#8a4f3d'], [40, -480, 70, 45, '#f3efe6', '#b5523b'],
    [-600, -25, 55, 55, '#dfe9ef', '#8a4f3d'], [-590, 130, 55, 60, '#f3efe6', '#6d7b85'], [-420, 420, 70, 55, '#e7eedf', '#8a4f3d'],
  ];
  for (const [x, y, w, d, wall, roof] of houses) scene.add(place(makeHouse(w, d, wall, roof), x, y));
  const trees = [[-330, 60], [-120, 40], [250, 150], [330, 190], [330, -150], [-60, -130], [100, -150], [-335, -285],
    [540, -230], [540, 30], [540, 280], [-100, -370], [330, -335], [450, 430], [-560, 420], [-600, -260], [20, 430], [-640, 300],
    [-580, -540], [-200, -540], [20, -560], [-460, -790], [-160, -790], [120, -800], [75, -600]];
  for (const [x, y] of trees) scene.add(place(makeTree(0.9 + ((x * 7 + y) % 5) / 10), x, y));

  // Numbered markers beside each step, matching the step list
  world.steps.forEach((s, i) => {
    const tex = textTexture(String(i + 1), { w: 128, h: 128, bg: null, fg: '#ffffff', font: 'bold 80px system-ui' });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(9, 28), new THREE.MeshBasicMaterial({ color: '#087c79' }));
    const label = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    label.position.z = 0.1;
    const marker = new THREE.Group();
    marker.add(disc, label);
    marker.rotation.x = -Math.PI / 2;
    const [mx, my] = MARKERS[i];
    scene.add(place(marker, mx, my, 1));
  });

  // The car in front
  view.leadCar = makeCar('#2f6fd1');
  scene.add(view.leadCar);
}

// Where the step numbers sit (on the grass next to each step)
const MARKERS = [[340, -180], [370, -130], [370, 120], [330, 225], [-10, 225], [-330, 225], [-375, 190], [-530, -180],
  [-280, -230], [-300, -610], [125, -610]];

const CAR_COLOURS = ['#c96f3b', '#6b7c8a', '#e3e5e2', '#2f4f6f', '#a33b3b', '#3c6e4f', '#d8b04a'];

// Spiral flyover: road decks that follow each ribbon's height, with side barriers and pillars
function buildFlyover(scene, world, asphalt) {
  const concrete = std('#c3c7c1');
  const barrierMat = std('#e4e7e2');
  const H = world.ribbonHalf;
  for (const rb of world.ribbons) {
    const pts = rb.pts;
    const edge = (i, off) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const nx = (b.y - a.y) / len, ny = -(b.x - a.x) / len;      // points to the right
      return [pts[i].x + nx * off, pts[i].y + ny * off];
    };
    const top = [], sides = [], rails = [];
    const quad = (arr, p1, p2, p3, p4) => arr.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);
    for (let i = 1; i < pts.length; i++) {
      const z0 = pts[i - 1].z, z1 = pts[i].z;
      const [l0, r0, l1, r1] = [edge(i - 1, -H), edge(i - 1, H), edge(i, -H), edge(i, H)];
      const v = ([x, y], z) => [x, z, -y];
      quad(top, v(l0, z0 + 0.6), v(r0, z0 + 0.6), v(r1, z1 + 0.6), v(l1, z1 + 0.6));
      if (Math.max(z0, z1) > 1) {
        // Deck sides and underside, 4 cm thick
        for (const [a, b] of [[l0, l1], [r0, r1]]) quad(sides, v(a, z0 + 0.6), v(b, z1 + 0.6), v(b, Math.max(0, z1 - 4)), v(a, Math.max(0, z0 - 4)));
        quad(sides, v(l0, Math.max(0, z0 - 4)), v(l1, Math.max(0, z1 - 4)), v(r1, Math.max(0, z1 - 4)), v(r0, Math.max(0, z0 - 4)));
      }
      if (Math.max(z0, z1) > 3) {
        // Low safety barriers along both edges
        for (const off of [-H - 1, H + 1]) {
          const a = edge(i - 1, off), b = edge(i, off);
          quad(rails, v(a, z0 + 0.6), v(b, z1 + 0.6), v(b, z1 + 7.6), v(a, z0 + 7.6));
        }
      }
    }
    for (const [arr, mat] of [[top, asphalt], [sides, concrete], [rails, barrierMat]]) {
      if (!arr.length) continue;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
      g.computeVertexNormals();
      const m = new THREE.Mesh(g, mat.clone());
      m.material.side = THREE.DoubleSide;
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
    }
    // Pillars under the raised parts, but never standing on a road underneath
    // (checked with a 10 cm margin all round)
    const clearBelow = (x, y) => [[0, 0], [10, 0], [-10, 0], [0, 10], [0, -10], [7, 7], [-7, 7], [7, -7], [-7, -7]]
      .every(([dx, dy]) => !world.surfaceAt(x + dx, y + dy, 0).ok);
    pts.forEach((p, i) => {
      if (p.z < 10 || i % 8 || !clearBelow(p.x, p.y)) return;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, p.z - 4, 12), concrete);
      pillar.castShadow = true;
      scene.add(place(pillar, p.x, p.y, (p.z - 4) / 2));
    });
  }
}

export function updateTown(view, sim) {
  const dyn = sim.dyn;
  if (!dyn) return;
  const light = dyn.light(dyn.time);
  for (const [name, lamp] of Object.entries(view.lamps)) {
    const on = name == light.color;
    lamp.material.color.set(on ? lamp.userData.on : '#2b2f31');
    lamp.material.emissive.set(on ? lamp.userData.on : '#000000');
  }
  view.lightPad.material.color.set({ Red: '#d9443a', Yellow: '#ffb000', Green: '#3fae49' }[light.color]);
  const secs = Math.ceil(light.remaining);
  const key = light.color + secs;
  if (view.countdownKey != key) {
    view.countdownKey = key;
    const ctxColor = { Red: '#ff3b30', Yellow: '#ffb000', Green: '#30d158' }[light.color];
    const c = view.countdownTex.image.getContext('2d');
    c.fillStyle = '#111417';
    c.fillRect(0, 0, 128, 96);
    c.fillStyle = ctxColor;
    c.font = 'bold 64px ui-monospace, monospace';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(String(secs), 64, 50);
    view.countdownTex.needsUpdate = true;
  }
  const car = dyn.car;
  view.leadCar.visible = true;
  view.leadCar.position.set(car.x, 0, -car.y);
  view.leadCar.rotation.y = -car.heading;
  const braking = car.state == 'braking' || car.state == 'waiting';
  for (const t of view.leadCar.userData.tails) t.material.emissive.set(braking ? '#ff2a1a' : '#000000');
}
