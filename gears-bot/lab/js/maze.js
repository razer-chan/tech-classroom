// Maze generator ported from GEARS (world_Maze.js) by Cort Wee, GPL-3.0.
// Same algorithm and random numbers, so the same seed gives the same maze as Gears.
// Note: Gears reads the seed with parseFloat, so a text seed such as "MAZE" becomes NaN.

export function buildMaze(rows, columns, seedText) {
  let seed = parseFloat(seedText);

  function random() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    const result = ((t ^ t >>> 14) >>> 0) / 4294967296;
    seed = result * 4294967296;
    return result;
  }

  const visited = Array.from({ length: rows }, () => new Array(columns).fill(false));
  // colWalls[r][c]: wall between column c and c + 1 in row r
  const colWalls = Array.from({ length: rows }, () => new Array(columns - 1).fill(true));
  // rowWalls[r][c]: wall between row r and r + 1 in column c
  const rowWalls = Array.from({ length: rows - 1 }, () => new Array(columns).fill(true));

  const stack = [];
  let current = { r: 0, c: 0 };
  let count = 1;
  visited[0][0] = true;

  function isVisited(dr, dc) {
    const r = current.r + dr;
    const c = current.c + dc;
    if (r < 0 || r >= rows || c < 0 || c >= columns) return true;
    return visited[r][c];
  }

  function randomNeighbour() {
    const unvisited = [];
    if (!isVisited(-1, 0)) unvisited.push([-1, 0]);
    if (!isVisited(1, 0)) unvisited.push([1, 0]);
    if (!isVisited(0, -1)) unvisited.push([0, -1]);
    if (!isVisited(0, 1)) unvisited.push([0, 1]);
    if (unvisited.length == 0) return null;
    const selected = unvisited[Math.floor(random() * unvisited.length)];
    return { r: current.r + selected[0], c: current.c + selected[1] };
  }

  function removeWall(a, b) {
    if (a.r == b.r) {
      colWalls[a.r][Math.min(a.c, b.c)] = false;
    } else {
      rowWalls[Math.min(a.r, b.r)][a.c] = false;
    }
  }

  while (count < rows * columns) {
    const next = randomNeighbour();
    if (next == null) {
      current = stack.pop();
    } else {
      removeWall(current, next);
      visited[next.r][next.c] = true;
      count++;
      stack.push(current);
      current = next;
    }
  }

  return { rows, columns, colWalls, rowWalls };
}
