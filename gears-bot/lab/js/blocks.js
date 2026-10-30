// Block definitions (wording and colours follow Gears), toolbox and code generator.
// Blockly is loaded as a classic script, so it lives on window.

const Blockly = window.Blockly;
const gen = window.javascript.javascriptGenerator;
const Order = window.javascript.Order;

const COLOURS = { motion: 230, forklift: 30, sensors: 160, control: 65, looks: 290, sound: 20 };
const ZONES = [['green', 'Green'], ['yellow', 'Yellow'], ['red', 'Red'], ['blue', 'Blue'], ['white', 'White'], ['black', 'Black']];
const NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'].map(n => [n, n]);

Blockly.common.defineBlocksWithJsonArray([
  {
    type: 'when_started',
    message0: 'When Started',
    nextStatement: null,
    colour: COLOURS.control,
    tooltip: 'Your program starts here.',
  },
  {
    type: 'move_cm',
    message0: 'move %1 %2 cm',
    args0: [
      { type: 'field_dropdown', name: 'DIR', options: [['forward', 'FWD'], ['backward', 'BACK']] },
      { type: 'input_value', name: 'CM', check: 'Number' },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: COLOURS.motion,
    tooltip: '40 cm = 1 square.',
  },
  {
    type: 'spin_deg',
    message0: 'spin %1 %2 degrees',
    args0: [
      { type: 'field_dropdown', name: 'DIR', options: [['right ↻', 'RIGHT'], ['left ↺', 'LEFT']] },
      { type: 'input_value', name: 'DEG', check: 'Number' },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: COLOURS.motion,
    tooltip: 'Turn on the spot.',
  },
  {
    type: 'move_tank_for',
    message0: 'move tank with left speed %1 and right speed %2 %3 %4 for %5 %6',
    args0: [
      { type: 'input_value', name: 'left', check: 'Number' },
      { type: 'input_value', name: 'right', check: 'Number' },
      { type: 'field_label', text: '%' },
      { type: 'input_end_row' },
      { type: 'input_value', name: 'duration', check: 'Number' },
      { type: 'field_dropdown', name: 'units', options: [['cm', 'CM'], ['rotations', 'ROTATIONS'], ['degrees', 'DEGREES'], ['seconds', 'SECONDS']] },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: COLOURS.motion,
    tooltip: 'Left = Right: straight. Left > Right: turn right. cm = how far the faster wheel rolls.',
  },
  {
    type: 'move_tank',
    message0: 'move tank with left speed %1 and right speed %2 %3',
    args0: [
      { type: 'input_value', name: 'left', check: 'Number' },
      { type: 'input_value', name: 'right', check: 'Number' },
      { type: 'field_label', text: '%' },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: COLOURS.motion,
    tooltip: 'Keeps moving until you stop it.',
  },
  {
    type: 'stop',
    message0: 'stop moving',
    previousStatement: null,
    nextStatement: null,
    colour: COLOURS.motion,
  },
  {
    type: 'fork_up',
    message0: 'lift fork up ↑',
    previousStatement: null,
    nextStatement: null,
    colour: COLOURS.forklift,
    tooltip: 'Picks up a pallet sitting on the fork.',
  },
  {
    type: 'fork_down',
    message0: 'lower fork down ↓',
    previousStatement: null,
    nextStatement: null,
    colour: COLOURS.forklift,
    tooltip: 'Puts the pallet down.',
  },
  {
    type: 'safety_sound',
    message0: 'play safety sound 🔊',
    previousStatement: null,
    nextStatement: null,
    colour: COLOURS.forklift,
    tooltip: 'Warns people nearby. Play it before the fork goes up or down.',
  },
  {
    type: 'color_sees',
    message0: 'color sensor sees %1',
    args0: [{ type: 'field_dropdown', name: 'COLOR', options: ZONES }],
    output: 'Boolean',
    colour: COLOURS.sensors,
    tooltip: 'Looks at the floor just in front of the robot.',
  },
  {
    type: 'color_name',
    message0: 'color sensor color name',
    output: 'String',
    colour: COLOURS.sensors,
  },
  {
    type: 'color_value',
    message0: '%1',
    args0: [{ type: 'field_dropdown', name: 'COLOR', options: ZONES }],
    output: 'String',
    colour: COLOURS.sensors,
  },
  {
    type: 'ultrasonic',
    message0: 'ultrasonic distance in cm',
    output: 'Number',
    colour: COLOURS.sensors,
    tooltip: 'Distance to the wall in front.',
  },
  {
    type: 'gyro_angle',
    message0: 'gyro angle',
    output: 'Number',
    colour: COLOURS.sensors,
    tooltip: 'Degrees turned. Right is +, left is −.',
  },
  {
    type: 'reset_gyro',
    message0: 'reset gyro',
    previousStatement: null,
    nextStatement: null,
    colour: COLOURS.sensors,
  },
  {
    type: 'touch_pressed',
    message0: 'touch sensor is pressed',
    output: 'Boolean',
    colour: COLOURS.sensors,
    tooltip: 'True when the front of the robot touches something.',
  },
  {
    type: 'sleep',
    message0: 'sleep for %1 seconds',
    args0: [{ type: 'input_value', name: 'seconds', check: 'Number' }],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: COLOURS.control,
  },
  {
    type: 'wait_until',
    message0: 'Wait until %1',
    args0: [{ type: 'input_value', name: 'value', check: 'Boolean' }],
    previousStatement: null,
    nextStatement: null,
    colour: COLOURS.control,
  },
  {
    type: 'forever',
    message0: 'repeat forever %1 %2',
    args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }],
    previousStatement: null,
    colour: '%{BKY_LOOPS_HUE}',
  },
  {
    type: 'say',
    message0: 'say %1',
    args0: [{ type: 'input_value', name: 'TEXT' }],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: COLOURS.looks,
    tooltip: 'Shows a speech bubble above the robot.',
  },
  {
    type: 'beep',
    message0: 'beep',
    previousStatement: null,
    nextStatement: null,
    colour: COLOURS.sound,
  },
  {
    type: 'play_tone',
    message0: 'play tone %1 Hz for %2 seconds',
    args0: [
      { type: 'input_value', name: 'HZ', check: 'Number' },
      { type: 'input_value', name: 'SECONDS', check: 'Number' },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: COLOURS.sound,
    tooltip: 'Higher Hz = higher sound. 440 Hz is the note A.',
  },
  {
    type: 'play_note',
    message0: 'play note %1 for %2 seconds',
    args0: [
      { type: 'field_dropdown', name: 'NOTE', options: NOTES },
      { type: 'input_value', name: 'SECONDS', check: 'Number' },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: COLOURS.sound,
  },
]);

const number = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const text = t => ({ shadow: { type: 'text', fields: { TEXT: t } } });

export function makeToolbox(mission) {
  const forklift = mission.world.type == 'warehouse';
  const tankOnly = mission.world.type == 'drive';      // driving test: steer with the two wheels only
  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category', name: 'Motion', colour: COLOURS.motion, contents: [
          ...(tankOnly ? [] : [
            { kind: 'block', type: 'move_cm', fields: { DIR: 'FWD' }, inputs: { CM: number(40) } },
            { kind: 'block', type: 'spin_deg', fields: { DIR: 'RIGHT' }, inputs: { DEG: number(90) } },
          ]),
          { kind: 'block', type: 'move_tank_for', fields: { units: 'CM' }, inputs: { left: number(50), right: number(50), duration: number(40) } },
          { kind: 'block', type: 'move_tank', inputs: { left: number(50), right: number(50) } },
          { kind: 'block', type: 'stop' },
        ],
      },
      ...(forklift ? [{
        kind: 'category', name: 'Forklift', colour: COLOURS.forklift, contents: [
          { kind: 'block', type: 'safety_sound' },
          { kind: 'block', type: 'fork_up' },
          { kind: 'block', type: 'fork_down' },
        ],
      }] : []),
      {
        kind: 'category', name: 'Sensors', colour: COLOURS.sensors, contents: [
          { kind: 'block', type: 'color_sees', fields: { COLOR: 'Yellow' } },
          { kind: 'block', type: 'ultrasonic' },
          { kind: 'block', type: 'touch_pressed' },
          { kind: 'block', type: 'gyro_angle' },
          { kind: 'block', type: 'reset_gyro' },
          { kind: 'block', type: 'color_name' },
          { kind: 'block', type: 'say', inputs: { TEXT: { block: { type: 'color_name' } } } },
          { kind: 'block', type: 'color_value', fields: { COLOR: 'Yellow' } },
        ],
      },
      {
        kind: 'category', name: 'Control', colour: COLOURS.control, contents: [
          { kind: 'block', type: 'when_started' },
          { kind: 'block', type: 'sleep', inputs: { seconds: number(1) } },
          { kind: 'block', type: 'wait_until' },
          { kind: 'block', type: 'controls_if' },
          { kind: 'block', type: 'controls_if', extraState: { hasElse: true } },
        ],
      },
      {
        kind: 'category', name: 'Loops', colour: '%{BKY_LOOPS_HUE}', contents: [
          { kind: 'block', type: 'controls_repeat_ext', inputs: { TIMES: number(4) } },
          { kind: 'block', type: 'forever' },
          { kind: 'block', type: 'controls_whileUntil', fields: { MODE: 'UNTIL' } },
        ],
      },
      {
        kind: 'category', name: 'Logic', colour: '%{BKY_LOGIC_HUE}', contents: [
          { kind: 'block', type: 'logic_compare', fields: { OP: 'LT' }, inputs: { B: number(20) } },
          { kind: 'block', type: 'logic_operation' },
          { kind: 'block', type: 'logic_negate' },
          { kind: 'block', type: 'logic_boolean' },
        ],
      },
      {
        kind: 'category', name: 'Math', colour: '%{BKY_MATH_HUE}', contents: [
          { kind: 'block', type: 'math_number', fields: { NUM: 0 } },
          { kind: 'block', type: 'math_arithmetic', inputs: { A: number(1), B: number(1) } },
        ],
      },
      {
        kind: 'category', name: 'Looks', colour: COLOURS.looks, contents: [
          { kind: 'block', type: 'say', inputs: { TEXT: { block: { type: 'color_name' } } } },
          { kind: 'block', type: 'say', inputs: { TEXT: text('Yellow!') } },
          { kind: 'block', type: 'text', fields: { TEXT: 'Hello' } },
          { kind: 'block', type: 'text_join' },
        ],
      },
      {
        kind: 'category', name: 'Sound', colour: COLOURS.sound, contents: [
          { kind: 'block', type: 'beep' },
          { kind: 'block', type: 'play_note', fields: { NOTE: 'C4' }, inputs: { SECONDS: number(0.5) } },
          { kind: 'block', type: 'play_tone', inputs: { HZ: number(440), SECONDS: number(0.5) } },
        ],
      },
      { kind: 'category', name: 'Variables', colour: '%{BKY_VARIABLES_HUE}', custom: 'VARIABLE' },
    ],
  };
}

export const STARTER = {
  blocks: { languageVersion: 0, blocks: [{ type: 'when_started', x: 40, y: 40, deletable: false }] },
};

// ---- Code generator: every statement awaits the robot ----

const value = (block, name, fallback = '0') => gen.valueToCode(block, name, Order.NONE) || fallback;
const statement = code => code + '\n';

gen.forBlock.when_started = () => '';
gen.forBlock.move_cm = b => statement(`await R.moveCm('${b.getFieldValue('DIR')}', ${value(b, 'CM')});`);
gen.forBlock.spin_deg = b => statement(`await R.spin('${b.getFieldValue('DIR')}', ${value(b, 'DEG')});`);
gen.forBlock.move_tank_for = b => statement(
  `await R.tankFor(${value(b, 'left')}, ${value(b, 'right')}, ${value(b, 'duration')}, '${b.getFieldValue('units')}');`);
gen.forBlock.move_tank = b => statement(`R.tank(${value(b, 'left')}, ${value(b, 'right')});`);
gen.forBlock.stop = () => statement('R.stop();');
gen.forBlock.fork_up = () => statement('await R.forkUp();');
gen.forBlock.fork_down = () => statement('await R.forkDown();');
gen.forBlock.color_sees = b => [`R.colorIs('${b.getFieldValue('COLOR')}')`, Order.FUNCTION_CALL];
gen.forBlock.color_name = () => ['R.colorName()', Order.FUNCTION_CALL];
gen.forBlock.color_value = b => [`'${b.getFieldValue('COLOR')}'`, Order.ATOMIC];
gen.forBlock.ultrasonic = () => ['R.distance()', Order.FUNCTION_CALL];
gen.forBlock.gyro_angle = () => ['R.gyro()', Order.FUNCTION_CALL];
gen.forBlock.reset_gyro = () => statement('R.resetGyro();');
gen.forBlock.touch_pressed = () => ['R.touch()', Order.FUNCTION_CALL];
gen.forBlock.sleep = b => statement(`await R.sleep(${value(b, 'seconds')});`);
gen.forBlock.wait_until = b => statement(`while (!(${value(b, 'value', 'false')})) { await R.tick(); }`);
gen.forBlock.forever = b => `while (true) {\n${gen.addLoopTrap(gen.statementToCode(b, 'DO'), b)}}\n`;
gen.forBlock.say = b => statement(`R.say(${value(b, 'TEXT', "''")});`);
gen.forBlock.beep = () => statement('await R.beep();');
gen.forBlock.safety_sound = () => statement('await R.safetySound();');
gen.forBlock.play_tone = b => statement(`await R.tone(${value(b, 'HZ')}, ${value(b, 'SECONDS')});`);
gen.forBlock.play_note = b => statement(`await R.note('${b.getFieldValue('NOTE')}', ${value(b, 'SECONDS')});`);

// Highlight each block as it runs, and give loops a tick so they never freeze the page
gen.STATEMENT_PREFIX = 'R.hl(%1);\n';
gen.INFINITE_LOOP_TRAP = 'await R.tick();\n';
gen.addReservedWords('R');

function startBlock(workspace) {
  return workspace.getTopBlocks(true).find(b => b.type == 'when_started' && b.isEnabled()) || null;
}

// Code for the first enabled "When Started" stack, or null when there is none.
// With `from`, only that block and the blocks after it ("Run from here").
export function generateProgram(workspace, from = null) {
  const start = from || startBlock(workspace);
  if (!start) return null;
  gen.init(workspace);
  const code = gen.blockToCode(start);
  return gen.finish(code);
}

// The block in the main "When Started" stack that contains this block
// (blocks inside a loop or "if" belong to that loop or "if")
export function mainStackBlock(block) {
  let b = block;
  while (b && b.getSurroundParent()) b = b.getSurroundParent();
  if (!b || b.type == 'when_started') return null;
  const root = b.getRootBlock();
  return root.type == 'when_started' && root.isEnabled() ? b : null;
}

// ---- Reading a program back ----

const LOOPS = ['controls_repeat_ext', 'forever', 'controls_whileUntil'];
const SENSING = ['controls_if', 'wait_until', 'color_sees', 'color_name', 'ultrasonic', 'gyro_angle', 'touch_pressed'];

// Blocks that run (inside "When Started")
function runningBlocks(workspace) {
  const start = startBlock(workspace);
  return start ? start.getDescendants(true).filter(b => b.isEnabled()) : [];
}

export function codeFeatures(workspace) {
  const blocks = runningBlocks(workspace);
  const types = new Set(blocks.map(b => b.type));
  return {
    statements: blocks.filter(b => b.previousConnection).length,
    loops: LOOPS.some(t => types.has(t)),
    sensing: SENSING.some(t => types.has(t)),
    say: types.has('say'),
    // a "say" block with the colour sensor inside it
    sayColour: blocks.some(b => b.type == 'say' && b.getDescendants(false).some(d => d.type == 'color_name')),
    sound: ['beep', 'play_tone', 'play_note', 'safety_sound'].some(t => types.has(t)),
  };
}

// One line per block, nested blocks indented, e.g. "  move forward 40 cm"
export function programText(workspace) {
  const start = startBlock(workspace);
  if (!start) return '(no "When Started" block)';
  const { VALUE, STATEMENT } = Blockly.inputs.inputTypes;
  // getText() can include invisible direction marks (e.g. before "<"); drop them
  const fieldsText = input => input.fieldRow.map(f => f.getText().replace(/[\u200e\u200f]/g, '').trim()).filter(Boolean);
  const inline = block => {
    if (!block) return '…';
    if (block.type == 'text') return `"${block.getFieldValue('TEXT')}"`;
    return block.inputList.flatMap(input => [
      ...fieldsText(input),
      ...(input.type == VALUE ? [inline(input.connection.targetBlock())] : []),
    ]).join(' ');
  };
  const lines = [];
  const walk = (first, depth) => {
    for (let b = first; b; b = b.getNextBlock()) {
      if (!b.isEnabled()) continue;
      let head = [];
      const flush = () => {
        if (head.length) lines.push('  '.repeat(depth) + head.join(' '));
        head = [];
      };
      for (const input of b.inputList) {
        head.push(...fieldsText(input));
        if (input.type == VALUE) head.push(inline(input.connection.targetBlock()));
        if (input.type == STATEMENT) {
          flush();
          walk(input.connection.targetBlock(), depth + 1);
        }
      }
      flush();
    }
  };
  lines.push('When Started');
  walk(start.getNextBlock(), 1);
  return lines.join('\n');
}
