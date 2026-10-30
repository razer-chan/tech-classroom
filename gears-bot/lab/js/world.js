// Builds a world (walls, coloured zones, pallets, start pose) from a mission's world settings.
// Units are cm. x points right (east), y points up the map (north). Rows count up from the bottom.
import { buildMaze } from './maze.js?v=4636962f';
import { buildTownWorld } from './town.js?v=4636962f';

export const ZONE_COLORS = {
  Green: '#3fae49',
  Yellow: '#e8c22a',
  Red: '#d9443a',
  Blue: '#3b63c9',
  Black: '#3d4448',
  White: '#ffffff',
};

export function buildWorld(def) {
  if (def.type == 'maze') return mazeWorld(def);
  if (def.type == 'warehouse') return warehouseWorld(def);
  if (def.type == 'drive') return buildTownWorld(def);
  throw new Error('Unknown world type: ' + def.type);
}

// Shared grid: outer walls, cell helpers, zone lookup
function gridWorld({ rows, columns, cell, wallThickness = 2, wallHeight = 15 }) {
  const width = columns * cell;
  const height = rows * cell;
  const left = -width / 2;
  const bottom = -height / 2;
  const t = wallThickness / 2;
  const walls = [];
  const zones = [];

  const addWall = (x1, y1, x2, y2) => walls.push({
    minX: Math.min(x1, x2) - t, maxX: Math.max(x1, x2) + t,
    minY: Math.min(y1, y2) - t, maxY: Math.max(y1, y2) + t,
  });
  addWall(left, bottom, left + width, bottom);
  addWall(left, bottom + height, left + width, bottom + height);
  addWall(left, bottom, left, bottom + height);
  addWall(left + width, bottom, left + width, bottom + height);

  const world = {
    rows, columns, cell, width, height, left, bottom, wallHeight, wallThickness, walls, zones,
    addWall,
    cellCentre: (r, c) => ({ x: left + cell * c + cell / 2, y: bottom + cell * r + cell / 2 }),
    cellAt: (x, y) => ({ r: Math.floor((y - bottom) / cell), c: Math.floor((x - left) / cell) }),
    addZone(name, r, c, kind) {
      zones.push({
        name, r, c, kind,
        minX: left + cell * c, maxX: left + cell * (c + 1),
        minY: bottom + cell * r, maxY: bottom + cell * (r + 1),
      });
    },
    zoneAt(x, y) {
      const zone = zones.find(z => x >= z.minX && x < z.maxX && y >= z.minY && y < z.maxY);
      return zone ? zone.name : null;
    },
  };
  return world;
}

function mazeWorld(def) {
  const { rows, columns, seed } = def;
  const world = gridWorld(def);
  const maze = buildMaze(rows, columns, seed);
  const { left, bottom, cell } = world;

  maze.colWalls.forEach((row, r) => row.forEach((wall, c) => {
    if (!wall) return;
    const x = left + cell * (c + 1);
    world.addWall(x, bottom + cell * r, x, bottom + cell * (r + 1));
  }));
  maze.rowWalls.forEach((row, r) => row.forEach((wall, c) => {
    if (!wall) return;
    const y = bottom + cell * (r + 1);
    world.addWall(left + cell * c, y, left + cell * (c + 1), y);
  }));

  // Same corner colours as the Gears maze
  world.addZone('Green', 0, 0, 'start');
  world.addZone('Yellow', 0, columns - 1, 'checkpoint');
  world.addZone('Red', rows - 1, columns - 1, 'checkpoint');
  world.addZone('Blue', rows - 1, 0, 'checkpoint');

  return Object.assign(world, {
    type: 'maze', maze,
    start: { ...world.cellCentre(0, 0), heading: 0 },
  });
}

function warehouseWorld(def) {
  const world = gridWorld(def);
  world.addZone('Green', def.start.r, def.start.c, 'start');
  for (const b of def.bays) world.addZone(b.color, b.r, b.c, 'bay');
  return Object.assign(world, {
    type: 'warehouse',
    robot: { fork: true },
    start: { ...world.cellCentre(def.start.r, def.start.c), heading: def.start.heading || 0 },
    pallets: def.pallets.map(p => ({ color: p.color, ...world.cellCentre(p.r, p.c) })),
  });
}
