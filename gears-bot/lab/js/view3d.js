// 3D view of the world and robot (three.js). Map x → three x, map y (north) → three −z.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ROBOT, FORK, PALLET_HALF } from './sim.js?v=4636962f';
import { ZONE_COLORS } from './world.js?v=4636962f';
import { buildTown, updateTown } from './town3d.js?v=4636962f';

const TRAIL_MAX = 20000;

export class View3D {
  constructor(container, world) {
    this.container = container;
    this.world = world;
    this.mode = '3d';

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e9efec');
    this.scene = scene;

    this.camera = new THREE.PerspectiveCamera(40, 1, 4, 6000);
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.maxPolarAngle = Math.PI * 0.47;
    this.controls.minDistance = 80;
    this.controls.maxDistance = 1400;

    scene.add(new THREE.HemisphereLight('#ffffff', '#9aa8a3', 1.6));
    const sun = new THREE.DirectionalLight('#ffffff', 1.6);
    sun.position.set(-160, 420, 260);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const reach = Math.max(world.width, world.height) * 0.7;
    const c = world.center || { x: 0, y: 0 };
    Object.assign(sun.shadow.camera, { left: -reach, right: reach, top: reach, bottom: -reach, near: 10, far: 2000 });
    sun.position.set(c.x - 160, 420, -c.y + 260);
    sun.target.position.set(c.x, 0, -c.y);
    scene.add(sun, sun.target);
    if (world.type == 'drive') {
      this.controls.maxDistance = 2600;
      scene.background = new THREE.Color('#dcebf2');
    }

    this.pins = [];
    if (world.type == 'drive') buildTown(this); else this.buildWorld();
    this.robot = this.buildRobot();
    scene.add(this.robot.group);
    this.palletMeshes = (world.pallets || []).map(p => this.buildPallet(p.color));
    this.buildTrail();

    this.resize();
    new ResizeObserver(() => this.resize()).observe(container);
    this.setMode('3d');
  }

  buildWorld() {
    const w = this.world;
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(w.width + 60, w.height + 60),
      new THREE.MeshStandardMaterial({ color: '#d5dcd9', roughness: 0.95 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const inside = new THREE.Mesh(
      new THREE.PlaneGeometry(w.width, w.height),
      new THREE.MeshStandardMaterial({ color: '#f4f6f5', roughness: 0.9 }));
    inside.rotation.x = -Math.PI / 2;
    inside.position.y = 0.05;
    inside.receiveShadow = true;
    this.scene.add(inside);

    // Faint square grid so students can count squares
    const pts = [];
    for (let c = 1; c < w.columns; c++) {
      const x = w.left + c * w.cell;
      pts.push(x, 0.15, -w.bottom, x, 0.15, -(w.bottom + w.height));
    }
    for (let r = 1; r < w.rows; r++) {
      const y = w.bottom + r * w.cell;
      pts.push(w.left, 0.15, -y, w.left + w.width, 0.15, -y);
    }
    const grid = new THREE.BufferGeometry();
    grid.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    this.scene.add(new THREE.LineSegments(grid, new THREE.LineBasicMaterial({ color: '#c9d3cf' })));

    this.zoneMeshes = {};
    for (const z of w.zones) {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(z.maxX - z.minX, z.maxY - z.minY),
        new THREE.MeshStandardMaterial({ color: ZONE_COLORS[z.name], roughness: 0.8 }));
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set((z.minX + z.maxX) / 2, 0.2, -(z.minY + z.maxY) / 2);
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      this.zoneMeshes[z.name] = mesh;
      if (z.kind == 'bay') {
        // Loading-bay frame
        const inset = 3, w = z.maxX - z.minX - inset * 2, h = z.maxY - z.minY - inset * 2;
        const pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2], [-w / 2, -h / 2]]
          .map(([x, y]) => new THREE.Vector3(x, 0, y));
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#ffffff' }));
        line.position.set((z.minX + z.maxX) / 2, 0.3, -(z.minY + z.maxY) / 2);
        this.scene.add(line);
      }
    }

    const wallMat = new THREE.MeshStandardMaterial({ color: '#33434a', roughness: 0.7 });
    for (const b of w.walls) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(b.maxX - b.minX, w.wallHeight, b.maxY - b.minY), wallMat);
      mesh.position.set((b.minX + b.maxX) / 2, w.wallHeight / 2, -(b.minY + b.maxY) / 2);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    }
  }

  buildRobot() {
    const group = new THREE.Group();
    const r = ROBOT.wheelRadius;
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#e5a14b', roughness: 0.55 });
    this.bodyMat = bodyMat;
    const dark = new THREE.MeshStandardMaterial({ color: '#29484e', roughness: 0.6 });
    const light = new THREE.MeshStandardMaterial({ color: '#fff1d6', roughness: 0.6 });

    const bodyWidth = ROBOT.track - 4;
    const body = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth, 9, 18), bodyMat);
    body.position.y = r + 1;
    body.castShadow = true;
    group.add(body);

    const lid = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth - 6, 1.5, 11), light);
    lid.position.set(0, r + 6.2, 1.5);
    group.add(lid);

    // Arrow on top showing forward
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 6); arrowShape.lineTo(5, 0); arrowShape.lineTo(2, 0);
    arrowShape.lineTo(2, -5); arrowShape.lineTo(-2, -5); arrowShape.lineTo(-2, 0); arrowShape.lineTo(-5, 0);
    const arrow = new THREE.Mesh(new THREE.ShapeGeometry(arrowShape), new THREE.MeshBasicMaterial({ color: '#087c79' }));
    arrow.rotation.x = -Math.PI / 2;
    arrow.position.set(0, r + 7.1, 1);
    group.add(arrow);

    // Ultrasonic "eyes" on the front
    for (const x of [-4, 4]) {
      const eye = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 3, 20), light);
      eye.rotation.x = Math.PI / 2;
      eye.position.set(x, r + 2, -10);
      group.add(eye);
      const pupil = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.2, 16), dark);
      pupil.rotation.x = Math.PI / 2;
      pupil.position.set(x, r + 2, -10.1);
      group.add(pupil);
    }

    // Colour sensor under the front, with a small light spot on the floor
    const sensor = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 3), dark);
    sensor.position.set(0, 2.5, -ROBOT.colorSensorAhead);
    group.add(sensor);

    // Caster
    const caster = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 12), dark);
    caster.position.set(0, 2, 7);
    group.add(caster);

    // Wheels: a stripe on each tyre makes the turning easy to see
    const wheels = [];
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * ROBOT.track / 2, r, 0);
      const tyre = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 2.6, 32), dark);
      tyre.rotation.z = Math.PI / 2;
      tyre.castShadow = true;
      pivot.add(tyre);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.8, r * 1.9, 1.6), new THREE.MeshStandardMaterial({ color: '#e5a14b' }));
      pivot.add(stripe);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 2.9, 16), light);
      hub.rotation.z = Math.PI / 2;
      pivot.add(hub);
      group.add(pivot);
      wheels.push(pivot);
    }

    // Forklift: mast on the front, carriage with two tines that slides up and down
    let carriage = null;
    if (this.world.robot?.fork) {
      for (const x of [-9, 9]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(2, 26, 2), dark);
        post.position.set(x, 13, -10.5);
        post.castShadow = true;
        group.add(post);
      }
      const bar = new THREE.Mesh(new THREE.BoxGeometry(20, 2, 2), dark);
      bar.position.set(0, 26, -10.5);
      group.add(bar);
      carriage = new THREE.Group();
      const back = new THREE.Mesh(new THREE.BoxGeometry(20, 7, 1.5), bodyMat);
      back.position.set(0, 4, -12);
      carriage.add(back);
      const length = FORK.tineEnd - FORK.tineStart;
      for (const x of [-6, 6]) {
        const tine = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, length), dark);
        tine.position.set(x, 0.6, -(FORK.tineStart + length / 2));
        tine.castShadow = true;
        carriage.add(tine);
      }
      group.add(carriage);
    }

    return { group, left: wheels[0], right: wheels[1], carriage };
  }

  buildPallet(color) {
    const g = new THREE.Group();
    const size = PALLET_HALF * 2;
    const wood = new THREE.MeshStandardMaterial({ color: '#b98a55', roughness: 0.9 });
    // Deck boards on three runners, with gaps for the fork
    const deck = new THREE.Mesh(new THREE.BoxGeometry(size, 1, size), wood);
    deck.position.y = 2.5;
    g.add(deck);
    for (const x of [-size / 2 + 1.5, 0, size / 2 - 1.5]) {
      const runner = new THREE.Mesh(new THREE.BoxGeometry(3, 2, size), wood);
      runner.position.set(x, 1, 0);
      g.add(runner);
    }
    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(size - 3, 11, size - 3),
      new THREE.MeshStandardMaterial({ color: ZONE_COLORS[color], roughness: 0.6 }));
    crate.position.y = 8.5;
    crate.castShadow = true;
    g.add(crate);
    g.traverse(m => { if (m.isMesh) m.castShadow = true; });
    this.scene.add(g);
    return g;
  }

  buildTrail() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL_MAX * 3), 3));
    geometry.setDrawRange(0, 0);
    this.trail = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#087c79' }));
    this.trail.frustumCulled = false;
    this.scene.add(this.trail);
    this.trailCount = 0;
  }

  update(sim, now = performance.now()) {
    const { pose, wheels } = sim;
    if (this.world.type == 'drive') updateTown(this, sim);
    const g = this.robot.group;
    const elev = sim.elev || 0;
    g.position.set(pose.x, elev, -pose.y);
    g.rotation.order = 'YXZ';
    g.rotation.y = -pose.heading;
    // Nose up or down on ramps
    g.rotation.x = 0;
    if (this.world.surfaceAt && elev > 0.01) {
      const fx = Math.sin(pose.heading) * 10, fy = Math.cos(pose.heading) * 10;
      const zf = this.world.surfaceAt(pose.x + fx, pose.y + fy, elev).elev;
      const zb = this.world.surfaceAt(pose.x - fx, pose.y - fy, elev).elev;
      g.rotation.x = Math.atan2(zf - zb, 20);
    }
    // Wheels roll forward for positive degrees
    this.robot.left.rotation.x = -wheels.left * Math.PI / 180;
    this.robot.right.rotation.x = -wheels.right * Math.PI / 180;

    // Fork and pallets
    if (this.robot.carriage && sim.fork) this.robot.carriage.position.y = sim.fork.height;
    sim.pallets.forEach((p, i) => {
      const mesh = this.palletMeshes[i];
      if (!mesh) return;
      mesh.position.set(p.x, p.carried ? sim.fork.height + 0.2 : 0, -p.y);
      mesh.rotation.y = -p.heading;
    });

    // Trail
    if (sim.trail.length < this.trailCount) this.trailCount = 0;
    const pos = this.trail.geometry.attributes.position;
    while (this.trailCount < sim.trail.length && this.trailCount < TRAIL_MAX) {
      const p = sim.trail[this.trailCount];
      pos.setXYZ(this.trailCount, p.x, this.world.type == 'drive' ? (p.z || 0) + 2 : 0.4, -p.y);
      this.trailCount++;
    }
    pos.needsUpdate = true;
    this.trail.geometry.setDrawRange(0, this.trailCount);

    // Red flash after a bump
    const flashing = sim.lastBump && sim.time - sim.lastBump.time < 0.6;
    this.bodyMat.emissive.set(flashing ? '#c0392b' : '#000000');

    this.lastPose = { ...pose };
    if (this.mode == 'follow') {
      // Move the camera along with the robot; dragging and zooming still work
      const target = new THREE.Vector3(pose.x, 8 + elev, -pose.y);
      if (this.followTarget) this.camera.position.add(target.clone().sub(this.followTarget));
      this.followTarget = target;
      this.controls.target.copy(target);
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  // See-through robot for the "Show me" demo
  setGhost(on) {
    if (!!this.ghost == on) return;
    this.ghost = on;
    this.robot.group.traverse(m => {
      if (!m.isMesh) return;
      m.userData.realMat ||= m.material;
      m.userData.ghostMat ||= Object.assign(m.userData.realMat.clone(), { transparent: true, opacity: 0.4, depthWrite: false });
      m.material = on ? m.userData.ghostMat : m.userData.realMat;
    });
    this.trail.material.color.set(on ? '#7c8bd6' : '#087c79');
  }

  // Red (critical) or orange (minor) pin where a fault happened
  addPin(x, y, critical, z = 0) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: critical ? '#d92d20' : '#f39c12', emissive: critical ? '#5a0f0a' : '#5a3a05' });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(4, 14, 16), mat);
    cone.rotation.x = Math.PI;
    cone.position.y = 7;
    const ball = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 12), mat);
    ball.position.y = 18;
    g.add(cone, ball);
    g.position.set(x, z, -y);
    this.scene.add(g);
    this.pins.push(g);
  }

  // Keep only the first n pins (used when going back in time)
  trimPins(n) {
    while (this.pins.length > n) this.scene.remove(this.pins.pop());
  }

  clearPins() {
    for (const p of this.pins) this.scene.remove(p);
    this.pins = [];
  }

  // Where the top of the robot is on screen (for the speech bubble)
  robotOnScreen(sim) {
    const p = new THREE.Vector3(sim.pose.x, 30 + (sim.elev || 0), -sim.pose.y).project(this.camera);
    const { clientWidth: w, clientHeight: h } = this.container;
    return { x: (p.x + 1) / 2 * w, y: (1 - p.y) / 2 * h, visible: p.z < 1 };
  }

  setMode(mode) {
    this.mode = mode;
    this.controls.enabled = true;
    if (mode == 'follow') {
      // Start behind the robot, a little way back, looking down at it
      const pose = this.lastPose || { ...this.world.start, heading: (this.world.start.heading || 0) * Math.PI / 180 };
      const [far, high] = this.world.type == 'drive' ? [230, 170] : [150, 125];
      const target = new THREE.Vector3(pose.x, 8, -pose.y);
      this.camera.position.set(target.x - Math.sin(pose.heading) * far, high, target.z + Math.cos(pose.heading) * far);
      this.controls.target.copy(target);
      this.followTarget = target;
      this.controls.update();
      return;
    }
    // Distance that fits the whole world in view, whatever the pane shape
    const size = Math.max(this.world.width, this.world.height) * (this.world.type == 'drive' ? 0.92 : 1.3);
    const vHalf = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const hHalf = Math.atan(Math.tan(vHalf) * this.camera.aspect);
    const fit = (size / 2) / Math.tan(Math.min(vHalf, hHalf));
    // Leave room for the goal bar (top) and the controls (bottom)
    const c = this.world.center || { x: 0, y: 0 };
    const target = new THREE.Vector3(c.x, 0, -c.y - size * 0.02);
    if (mode == 'top') {
      this.camera.position.set(target.x, fit * 1.08, target.z + 0.01);
    } else {
      const tilt = THREE.MathUtils.degToRad(58);
      const d = fit * 1.12;
      this.camera.position.set(target.x, Math.sin(tilt) * d, target.z + Math.cos(tilt) * d);
    }
    this.controls.target.copy(target);
    this.controls.update();
  }

  resize() {
    const { clientWidth: w, clientHeight: h } = this.container;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.mode != 'follow') this.setMode(this.mode);
  }
}
