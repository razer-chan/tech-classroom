// Robot Lab Quiz: the questions.
// Every question is about this course (Missions 1–3) and the WA Digital Technologies syllabus.
// Codes are the strand part of the WA code (e.g. DI4), so no year level is shown.
//   type 'choice': pick one option          answer = index of the right option (options are shuffled on screen)
//   type 'order':  drag cards into order    items are listed in the right order
//   type 'sort':   drag cards into groups   each item says its group
//   type 'gap':    drag one card into a gap answer = index of the right item
// Block pictures use Blockly's JSON form, so they look exactly like the blocks in the missions.

export const TOPICS = {
  motion: { title: 'Moving and turning', code: 'DI4' },
  sensors: { title: 'Sensors and hardware', code: 'DS2' },
  control: { title: 'Loops and if', code: 'DI2' },
  debug: { title: 'Tracing and fixing code', code: 'DI3' },
  algorithms: { title: 'Algorithms and flowcharts', code: 'DI2' },
  data: { title: 'Data (RGB and binary)', code: 'DR1' },
};

// ---- Block helpers ----
const num = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const text = t => ({ shadow: { type: 'text', fields: { TEXT: t } } });
const tankFor = (l, r, amount, units = 'CM') => ({ type: 'move_tank_for', fields: { units }, inputs: { left: num(l), right: num(r), duration: num(amount) } });
const tank = (l, r) => ({ type: 'move_tank', inputs: { left: num(l), right: num(r) } });
const forward = cm => ({ type: 'move_cm', fields: { DIR: 'FWD' }, inputs: { CM: num(cm) } });
const spin = (dir, deg) => ({ type: 'spin_deg', fields: { DIR: dir }, inputs: { DEG: num(deg) } });
const stop = () => ({ type: 'stop' });
const say = t => ({ type: 'say', inputs: { TEXT: text(t) } });
const sees = colour => ({ type: 'color_sees', fields: { COLOR: colour } });
const distance = (op, n) => ({ type: 'logic_compare', fields: { OP: op }, inputs: { A: { block: { type: 'ultrasonic' } }, B: { block: { type: 'math_number', fields: { NUM: n } } } } });
const touch = () => ({ type: 'touch_pressed' });
const waitUntil = cond => ({ type: 'wait_until', inputs: { value: { block: cond } } });
const slot = (name, block) => (block ? { [name]: { block } } : {});      // an input, or an empty slot
const ifDo = (cond, body) => ({ type: 'controls_if', inputs: { ...slot('IF0', cond), ...slot('DO0', chain(body)) } });
const ifElse = (cond, yes, no) => ({ type: 'controls_if', extraState: { hasElse: true }, inputs: { ...slot('IF0', cond), ...slot('DO0', chain(yes)), ...slot('ELSE', chain(no)) } });
const repeat = (times, body) => ({ type: 'controls_repeat_ext', inputs: { TIMES: num(times), ...slot('DO', chain(body)) } });
const repeatUntil = (cond, body) => ({ type: 'controls_whileUntil', fields: { MODE: 'UNTIL' }, inputs: { ...slot('BOOL', cond), ...slot('DO', chain(body)) } });
const forever = body => ({ type: 'forever', inputs: { ...slot('DO', chain(body)) } });

// A stack of blocks, one after another
function chain(list) {
  const blocks = Array.isArray(list) ? list : [list];
  let next = null;
  for (const b of blocks.slice().reverse()) next = { ...structuredClone(b), ...(next ? { next: { block: next } } : {}) };
  return next;
}
const program = list => ({ type: 'when_started', ...(list.length ? { next: { block: chain(list) } } : {}) });

// ---- Flowchart drawings ----
const INK = '#24434a', FILL = '#eef6f3';
const shape = inner => `<svg viewBox="0 0 120 64" width="120" height="64" role="img">${inner}</svg>`;
const SHAPES = {
  oval: shape(`<rect x="8" y="12" width="104" height="40" rx="20" fill="${FILL}" stroke="${INK}" stroke-width="2.5"/>`),
  rect: shape(`<rect x="10" y="12" width="100" height="40" fill="${FILL}" stroke="${INK}" stroke-width="2.5"/>`),
  diamond: shape(`<path d="M60 4 L112 32 L60 60 L8 32 Z" fill="${FILL}" stroke="${INK}" stroke-width="2.5"/>`),
  para: shape(`<path d="M26 12 H112 L94 52 H8 Z" fill="${FILL}" stroke="${INK}" stroke-width="2.5"/>`),
};

const LIGHTS_FLOWCHART = `<svg viewBox="0 0 270 330" width="225" height="275" role="img" aria-label="Flowchart">
  <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="${INK}"/></marker></defs>
  <g font-family="system-ui, sans-serif" font-size="14" font-weight="650" fill="${INK}" text-anchor="middle">
    <rect x="60" y="6" width="100" height="34" rx="17" fill="${FILL}" stroke="${INK}" stroke-width="2"/><text x="110" y="28">Start</text>
    <path d="M110 40 V60" stroke="${INK}" stroke-width="2" marker-end="url(#ah)"/>
    <rect x="35" y="62" width="150" height="36" fill="${FILL}" stroke="${INK}" stroke-width="2"/><text x="110" y="85">Drive to the lights</text>
    <path d="M110 98 V116" stroke="${INK}" stroke-width="2" marker-end="url(#ah)"/>
    <path d="M110 118 L180 152 L110 186 L40 152 Z" fill="${FILL}" stroke="${INK}" stroke-width="2"/><text x="110" y="157">Is it green?</text>
    <path d="M180 152 H236 V108 H114" fill="none" stroke="${INK}" stroke-width="2" marker-end="url(#ah)"/><text x="208" y="144">No</text>
    <path d="M110 186 V212" stroke="${INK}" stroke-width="2" marker-end="url(#ah)"/><text x="128" y="204">Yes</text>
    <rect x="45" y="214" width="130" height="36" fill="${FILL}" stroke="${INK}" stroke-width="2"/><text x="110" y="237">Drive on</text>
    <path d="M110 250 V272" stroke="${INK}" stroke-width="2" marker-end="url(#ah)"/>
    <rect x="60" y="274" width="100" height="34" rx="17" fill="${FILL}" stroke="${INK}" stroke-width="2"/><text x="110" y="296">End</text>
  </g>
</svg>`;

// ---- The questions ----
export const QUESTIONS = [
  // Moving and turning
  {
    id: 'spin-left', topic: 'motion', type: 'choice',
    prompt: 'Which block spins the robot **left** on the spot?',
    options: [{ block: tankFor(-50, 50, 20) }, { block: tankFor(50, -50, 20) }, { block: tankFor(50, 50, 20) }, { block: tankFor(-50, -50, 20) }],
    answer: 0,
    explain: 'Left wheel backwards and right wheel forwards = spin left. 20 cm on each wheel is a 90° turn.',
  },
  {
    id: 'curve-left', topic: 'motion', type: 'choice',
    prompt: 'Which block drives a gentle **curve to the left**?',
    options: [{ block: tankFor(40, 50, 100) }, { block: tankFor(50, 40, 100) }, { block: tankFor(50, 50, 100) }, { block: tankFor(-50, 50, 100) }],
    answer: 0,
    explain: 'The right wheel is a bit faster, so the robot curves left. −50 and 50 would spin on the spot.',
  },
  {
    id: 'what-turn', topic: 'motion', type: 'choice',
    prompt: 'What does this block do?',
    figure: { block: tankFor(50, -50, 20) },
    options: [{ text: 'Spins right 90°' }, { text: 'Spins left 90°' }, { text: 'Drives forward 20 cm' }, { text: 'Drives backward 20 cm' }],
    answer: 0,
    explain: 'Left wheel forwards and right wheel backwards = spin right. Each wheel goes 20 cm, which is 90°.',
  },
  {
    id: 'rotations', topic: 'motion', type: 'choice',
    prompt: 'One wheel rotation moves the robot 40 cm. How many rotations does it take to drive **120 cm**?',
    options: [{ text: '3 rotations' }, { text: '2 rotations' }, { text: '4 rotations' }, { text: '120 rotations' }],
    answer: 0,
    explain: '120 ÷ 40 = 3 rotations.',
  },
  {
    id: 'speed', topic: 'motion', type: 'choice',
    prompt: 'At 100% speed the robot drives 40 cm every second. How far does it go at **50% for 4 seconds**?',
    options: [{ text: '80 cm' }, { text: '40 cm' }, { text: '160 cm' }, { text: '200 cm' }],
    answer: 0,
    explain: '50% is half speed: 20 cm every second. 20 × 4 = 80 cm.',
  },
  {
    id: 'turn-too-small', topic: 'debug', type: 'choice',
    prompt: 'This block should turn the robot **90° left**, but it only turns 45°. What’s the fix?',
    figure: { block: tankFor(-50, 50, 10) },
    options: [{ text: 'Change 10 cm to 20 cm' }, { text: 'Change the speeds to −100 and 100' }, { text: 'Change 10 cm to 5 cm' }, { text: 'Add a stop block after it' }],
    answer: 0,
    explain: 'The cm decides how far it turns. The speed only changes how fast it gets there.',
  },
  {
    id: 'wrong-way', topic: 'debug', type: 'choice',
    prompt: 'The robot should turn **left** here, but it turns right. How do you fix this block?',
    figure: { block: tankFor(50, -50, 20) },
    options: [{ text: 'Swap the speeds: left −50, right 50' }, { text: 'Change 20 cm to 40 cm' }, { text: 'Change cm to rotations' }, { text: 'Make both speeds 50' }],
    answer: 0,
    explain: 'To spin left, the left wheel goes backwards and the right wheel goes forwards.',
  },
  {
    id: 'forklift-order', topic: 'algorithms', type: 'order',
    prompt: 'Put the forklift steps in order to **pick up a pallet**.',
    items: [{ block: { type: 'safety_sound' } }, { block: { type: 'fork_down' } }, { block: forward(40) }, { block: { type: 'safety_sound' } }, { block: { type: 'fork_up' } }],
    explain: 'Safety sound before every fork move. Fork down, drive in under the pallet, safety sound, then lift.',
  },

  // Sensors and hardware
  {
    id: 'sensor-wall', topic: 'sensors', type: 'choice',
    prompt: 'Which sensor should you use to **stop 10 cm before a wall**?',
    options: [{ text: 'Ultrasonic (distance) sensor' }, { text: 'Colour sensor' }, { text: 'Gyro sensor' }, { text: 'Touch sensor' }],
    answer: 0,
    explain: 'The ultrasonic sensor measures the distance in cm, so the robot can stop before it touches the wall.',
  },
  {
    id: 'sensor-lights', topic: 'sensors', type: 'choice',
    prompt: 'In the Driving Test, how does the robot know the traffic light is **green**?',
    options: [{ text: 'The colour sensor reads the coloured pad on the road' }, { text: 'The ultrasonic sensor looks at the light' }, { text: 'The gyro sensor feels the light change' }, { text: 'The touch sensor presses a button' }],
    answer: 0,
    explain: 'The colour sensor looks down at the road. The pad before the line shows the light’s colour.',
  },
  {
    id: 'sensor-gyro', topic: 'sensors', type: 'choice',
    prompt: 'Which sensor measures **how far the robot has turned** (in degrees)?',
    options: [{ text: 'Gyro sensor' }, { text: 'Ultrasonic sensor' }, { text: 'Colour sensor' }, { text: 'Touch sensor' }],
    answer: 0,
    explain: 'A gyro sensor measures turning. Your phone has one too: it knows when you rotate the screen.',
  },
  {
    id: 'car-sensor', topic: 'sensors', type: 'choice',
    prompt: 'Your robot must slow down **before** it touches the car in front. Which sensor helps?',
    options: [{ text: 'Ultrasonic (distance) sensor' }, { text: 'Touch sensor' }, { text: 'Colour sensor' }, { text: 'Gyro sensor' }],
    answer: 0,
    explain: 'A touch sensor only knows after you hit the car. A distance sensor sees it before you touch it.',
  },
  {
    id: 'input-output', topic: 'sensors', type: 'sort',
    prompt: 'Drag each part into **Input** or **Output**.',
    groups: [{ id: 'in', label: 'Input', note: 'collects data' }, { id: 'out', label: 'Output', note: 'does something' }],
    items: [
      { text: 'Colour sensor', group: 'in' }, { text: 'Ultrasonic sensor', group: 'in' }, { text: 'Touch sensor', group: 'in' },
      { text: 'Wheel motors', group: 'out' }, { text: 'Speaker (play a sound)', group: 'out' }, { text: 'Screen (say block)', group: 'out' },
    ],
    explain: 'Sensors are inputs: they collect data. Motors, speakers and screens are outputs: they do something.',
  },

  // Loops and if
  {
    id: 'square', topic: 'control', type: 'choice',
    prompt: 'What path does the robot drive?',
    figure: { block: program([repeat(4, [forward(40), spin('RIGHT', 90)])]) },
    options: [{ text: 'A square' }, { text: 'A straight line' }, { text: 'A triangle' }, { text: 'A circle' }],
    answer: 0,
    explain: 'Forward, turn 90°, four times: four sides and four corners make a square.',
  },
  {
    id: 'repeat-distance', topic: 'control', type: 'choice',
    prompt: 'How far does the robot drive **in total**?',
    figure: { block: program([repeat(3, [forward(40)])]) },
    options: [{ text: '120 cm' }, { text: '40 cm' }, { text: '80 cm' }, { text: '160 cm' }],
    answer: 0,
    explain: 'The loop runs 3 times: 3 × 40 cm = 120 cm.',
  },
  {
    id: 'which-structure', topic: 'control', type: 'choice',
    prompt: 'What kind of control structure is this?',
    figure: { block: ifElse(sees('Red'), [stop()], [tank(50, 50)]) },
    options: [{ text: 'Selection (if … else)' }, { text: 'Sequence' }, { text: 'Iteration (a loop)' }, { text: 'A variable' }],
    answer: 0,
    explain: 'If / else picks one of two paths. Picking a path is called selection.',
  },
  {
    id: 'sort-structures', topic: 'control', type: 'sort',
    prompt: 'Drag each block into the right group.',
    groups: [{ id: 'seq', label: 'Sequence', note: 'one step after another' }, { id: 'sel', label: 'Selection', note: 'choose a path' }, { id: 'iter', label: 'Iteration', note: 'repeat' }],
    items: [
      { block: chain([forward(40), spin('RIGHT', 90)]), group: 'seq' },
      { block: ifDo(sees('Red'), [stop()]), group: 'sel' },
      { block: ifElse(touch(), [stop()], [tank(40, 40)]), group: 'sel' },
      { block: repeat(4, [forward(40)]), group: 'iter' },
      { block: repeatUntil(sees('Blue'), [tank(40, 40)]), group: 'iter' },
      { block: forever([tank(40, 40)]), group: 'iter' },
    ],
    explain: 'Blocks stacked one after another = sequence. If = selection. Repeat, repeat until and forever = iteration.',
  },
  {
    id: 'repeat-until', topic: 'control', type: 'choice',
    prompt: 'When does this loop stop?',
    figure: { block: repeatUntil(sees('Blue'), [tank(40, 40)]) },
    options: [{ text: 'When the colour sensor sees blue' }, { text: 'After it runs once' }, { text: 'Never' }, { text: 'When it sees any colour' }],
    answer: 0,
    explain: '“Repeat until” keeps going and checks every time. It stops as soon as the sensor sees blue.',
  },
  {
    id: 'follow-car', topic: 'control', type: 'choice',
    prompt: 'This loop has an **if inside it** (a nested control structure). What does the program do?',
    figure: { block: program([forever([ifElse(distance('LT', 30), [stop()], [tank(40, 40)])])]) },
    options: [{ text: 'Drives, but stops whenever something is closer than 30 cm' }, { text: 'Drives forever and never stops' }, { text: 'Only drives when something is closer than 30 cm' }, { text: 'Spins on the spot' }],
    answer: 0,
    explain: 'The loop checks the distance again and again. Close: stop. Not close: drive. That’s how you followed the car.',
  },
  {
    id: 'trace-if', topic: 'debug', type: 'choice',
    prompt: 'The distance sensor reads **25 cm**. What does the robot say?',
    figure: { block: ifElse(distance('LT', 30), [say('Too close!')], [say('All good')]) },
    options: [{ text: '“Too close!”' }, { text: '“All good”' }, { text: 'Both' }, { text: 'Nothing' }],
    answer: 0,
    explain: '25 is less than 30, so the top part runs and the robot says “Too close!”.',
  },
  {
    id: 'wait-forever', topic: 'debug', type: 'choice',
    prompt: 'In a test run, the light **never turns green**. What happens?',
    figure: { block: program([forward(80), waitUntil(sees('Green')), forward(40)]) },
    options: [{ text: 'The robot waits there forever' }, { text: 'It skips the wait and keeps going' }, { text: 'It drives the 40 cm first' }, { text: 'It turns around' }],
    answer: 0,
    explain: '“Wait until” only finishes when the colour sensor sees green. No green = it keeps waiting.',
  },
  {
    id: 'gap-distance', topic: 'debug', type: 'gap',
    prompt: 'The robot must stop when the car in front is **closer than 30 cm**. Drag the right block into the empty slot.',
    figure: { block: program([forever([ifElse(null, [stop()], [tank(40, 40)])])]) },
    items: [{ block: distance('LT', 30) }, { block: distance('GT', 30) }, { block: sees('Red') }, { block: touch() }],
    answer: 0,
    explain: '“Distance < 30” is true when the car is closer than 30 cm, so the robot stops.',
  },

  // Algorithms and flowcharts
  {
    id: 'flowchart-shapes', topic: 'algorithms', type: 'sort', oneEach: true,
    prompt: 'Match each flowchart shape with what it means.',
    groups: [{ id: 'oval', svg: SHAPES.oval }, { id: 'rect', svg: SHAPES.rect }, { id: 'diamond', svg: SHAPES.diamond }, { id: 'para', svg: SHAPES.para }],
    items: [
      { text: 'Start or End', group: 'oval' },
      { text: 'Do an action', group: 'rect' },
      { text: 'Ask a yes / no question', group: 'diamond' },
      { text: 'Input or output (e.g. read a sensor)', group: 'para' },
    ],
    explain: 'Oval = start/end. Rectangle = an action. Diamond = a decision (yes/no). Parallelogram = input or output.',
  },
  {
    id: 'flowchart-blocks', topic: 'algorithms', type: 'choice',
    prompt: 'Which blocks do the **same thing** as this flowchart?',
    figure: { svg: LIGHTS_FLOWCHART },
    options: [
      { block: program([forward(80), waitUntil(sees('Green')), forward(40)]) },
      { block: program([forward(80), forward(40), waitUntil(sees('Green'))]) },
      { block: program([forward(80), ifDo(sees('Green'), [forward(40)])]) },
      { block: program([repeat(4, [forward(40)])]) },
    ],
    answer: 0,
    explain: 'The “No” arrow goes back and asks again. That’s “wait until green”. An if only checks once.',
  },
  {
    id: 'stop-sign-order', topic: 'algorithms', type: 'order',
    prompt: 'Put the pseudocode for the **stop sign** in order.',
    items: [
      { text: 'DRIVE forward UNTIL the colour sensor sees red' },
      { text: 'STOP' },
      { text: 'WAIT 2 seconds' },
      { text: 'TURN left 90°' },
      { text: 'DRIVE on' },
    ],
    explain: 'Drive to the red pad, stop, wait 2 seconds, then turn and keep going.',
  },
  {
    id: 'need-loop', topic: 'algorithms', type: 'choice',
    prompt: 'The robot must **keep checking** the colour until it sees blue. Which block do you need?',
    options: [{ block: repeatUntil(sees('Blue'), []) }, { block: ifDo(sees('Blue'), []) }, { block: tankFor(50, 50, 40) }, { block: say('Blue') }],
    answer: 0,
    explain: 'Checking again and again needs a loop. “Repeat until” stops the loop when the sensor sees blue.',
  },

  // Data
  {
    id: 'rgb', topic: 'data', type: 'choice',
    prompt: 'A colour sensor reads **Red 255, Green 0, Blue 0**. What colour is under the robot?',
    options: [{ text: 'Red' }, { text: 'Green' }, { text: 'Blue' }, { text: 'White' }],
    answer: 0,
    explain: 'Like pixels on a screen, every colour is a mix of red, green and blue from 0 to 255. Only red is on.',
  },
  {
    id: 'binary', topic: 'data', type: 'choice',
    prompt: 'Each RGB value goes from 0 to **255**. Why does it stop at 255?',
    options: [{ text: '255 is the biggest number 8 bits can hold (11111111)' }, { text: 'The sensor can see 255 cm' }, { text: 'There are only 255 colours' }, { text: 'It was picked at random' }],
    answer: 0,
    explain: '8 bits (eight 0s and 1s) make 256 values: 0 to 255. 11111111 in binary is 255.',
  },
];
