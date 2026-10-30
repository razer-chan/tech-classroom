(() => {
  // src/questions.js
  var QUIZ = { id: "spike-quiz-v1", title: "SPIKE Prime Quiz" };
  var ROBOT_CARD = "Our robot: wheels on A + B \xB7 arm motor on C (\u21BB lifts the arm, \u21BA lowers it) \xB7 distance sensor on D";
  var QUESTIONS = [
    // ---- Part A · Motors and sensors ----
    {
      id: "q1",
      part: "Motors and sensors",
      type: "choice",
      prompt: "Which one of these is a **sensor**?",
      options: [
        { id: "a", text: "Large motor", pic: "motor" },
        { id: "b", text: "Hub", pic: "hub" },
        { id: "c", text: "Distance sensor", pic: "distance" },
        { id: "d", text: "Wheel", pic: "wheel" }
      ]
    },
    {
      id: "q2",
      part: "Motors and sensors",
      type: "sort",
      prompt: "Drag each job into the box of the part that does it.",
      buckets: [{ id: "motor", label: "Motor" }, { id: "sensor", label: "Sensor" }],
      items: [
        { id: "wheel", text: "Turns a wheel" },
        { id: "arm", text: "Lifts an arm" },
        { id: "wall", text: "Measures how far away a wall is" },
        { id: "line", text: "Sees a black line on the floor" },
        { id: "push", text: "Feels when it is pushed" }
      ]
    },
    {
      id: "q3",
      part: "Motors and sensors",
      type: "choice",
      card: true,
      prompt: "You want the robot to stop **before** it hits a wall. Which part helps the robot know the wall is close?",
      options: [
        { id: "a", text: "The arm motor on C" },
        { id: "b", text: "The wheels on A + B" },
        { id: "c", text: "The distance sensor on D" },
        { id: "d", text: "The light on the hub" }
      ]
    },
    // ---- Part B · Movement blocks ----
    {
      id: "q4",
      part: "Movement blocks",
      type: "choice",
      card: true,
      prompt: "What does this block do?",
      code: ["move \u2191 for 10 cm"],
      options: [
        { id: "a", text: "Drives forward 10 cm" },
        { id: "b", text: "Drives backward 10 cm" },
        { id: "c", text: "Lifts the arm 10 cm" },
        { id: "d", text: "Turns right 10 times" }
      ]
    },
    {
      id: "q5",
      part: "Movement blocks",
      type: "choice",
      card: true,
      prompt: "Which block makes the robot **turn right on the spot**?",
      options: [
        { id: "a", block: "move \u2191 for 1 seconds" },
        { id: "b", block: "move \u2193 for 1 seconds" },
        { id: "c", block: "move \u21BB for 1 seconds" },
        { id: "d", block: "move \u21BA for 1 seconds" }
      ]
    },
    {
      id: "q6",
      part: "Movement blocks",
      type: "choice",
      card: true,
      prompt: "Your robot keeps driving **past** the place where it should stop. Which change usually helps it stop more accurately?",
      options: [
        { id: "a", block: "set movement speed to 30 %" },
        { id: "b", block: "set movement speed to 100 %" },
        { id: "c", block: "C set speed to 100 %" },
        { id: "d", text: "Add a wait 1 seconds block at the start" }
      ]
    },
    {
      id: "q7",
      part: "Movement blocks",
      type: "choice",
      card: true,
      prompt: "In this block, what does the number **30** change?",
      code: ["move right: 30 for 10 cm"],
      options: [
        { id: "a", text: "How sharply the robot turns" },
        { id: "b", text: "How fast the robot drives" },
        { id: "c", text: "How far the robot drives" },
        { id: "d", text: "Which ports the wheels use" }
      ]
    },
    {
      id: "q8",
      part: "Movement blocks",
      type: "choice",
      card: true,
      prompt: "One wheel rotation moves the robot about **17.5 cm**. About how far does this block drive?",
      code: ["move \u2191 for 2 rotations"],
      options: [
        { id: "a", text: "2 cm" },
        { id: "b", text: "17.5 cm" },
        { id: "c", text: "35 cm" },
        { id: "d", text: "175 cm" }
      ]
    },
    {
      id: "q9",
      part: "Movement blocks",
      type: "order",
      card: true,
      prompt: "Put the blocks in order. Task: set up the robot, then drive forward 20 cm, then back 5 cm.",
      items: [
        { id: "fwd", block: "move \u2191 for 20 cm" },
        { id: "speed", block: "set movement speed to 30 %" },
        { id: "back", block: "move \u2193 for 5 cm" },
        { id: "start", block: "when program starts" },
        { id: "pair", block: "set movement motors to A+B" }
      ]
    },
    // ---- Part C · Motor blocks ----
    {
      id: "q10",
      part: "Motor blocks",
      type: "choice",
      card: true,
      prompt: "This block lifts the arm. Which block **lowers** it again?",
      code: ["C run \u21BB for 30 degrees"],
      options: [
        { id: "a", block: "C run \u21BB for 30 degrees" },
        { id: "b", block: "C run \u21BA for 30 degrees" },
        { id: "c", block: "move \u2193 for 30 cm" },
        { id: "d", block: "C set speed to 30 %" }
      ]
    },
    {
      id: "q11",
      part: "Motor blocks",
      type: "choice",
      card: true,
      prompt: "Both programs run the arm for **1 second**. Which arm moves **further**?",
      programs: [
        { label: "Program 1", code: ["C set speed to 30 %", "C run \u21BB for 1 seconds"] },
        { label: "Program 2", code: ["C set speed to 60 %", "C run \u21BB for 1 seconds"] }
      ],
      options: [
        { id: "a", text: "Program 1" },
        { id: "b", text: "Program 2" },
        { id: "c", text: "They move the same" },
        { id: "d", text: "Neither arm moves" }
      ],
      fixedOrder: true
    },
    {
      id: "q12",
      part: "Motor blocks",
      type: "choice",
      card: true,
      prompt: "What does this block change?",
      code: ["C set speed to 30 %"],
      options: [
        { id: "a", text: "The arm moves more slowly" },
        { id: "b", text: "The robot drives more slowly" },
        { id: "c", text: "The arm moves 30 degrees" },
        { id: "d", text: "The arm moves to port 30" }
      ]
    },
    {
      id: "q13",
      part: "Motor blocks",
      type: "choice",
      card: true,
      prompt: "Sam wants to lift the arm, so Sam uses this block. What will happen?",
      code: ["B run \u21BB for 30 degrees"],
      options: [
        { id: "a", text: "The arm lifts 30 degrees" },
        { id: "b", text: "Only one wheel turns, so the robot twists" },
        { id: "c", text: "Nothing happens, port B is empty" },
        { id: "d", text: "The robot drives forward 30 cm" }
      ]
    },
    // ---- Part D · Put the steps in order ----
    {
      id: "q14",
      part: "Put the steps in order",
      type: "order",
      pic: "img/lever.jpg",
      prompt: "Task: the robot must press a lever down with its arm, then leave. Put the steps in order.",
      items: [
        { id: "press", text: "Lower the arm to press the lever" },
        { id: "away", text: "Back away" },
        { id: "lift", text: "Lift the arm up high" },
        { id: "again", text: "Lift the arm again" },
        { id: "drive", text: "Drive up until the arm is above the lever" }
      ]
    },
    {
      id: "q15",
      part: "Put the steps in order",
      type: "order",
      pic: "img/ring.jpg",
      prompt: "Task: the robot must pick up a ring with a fork and hang it on a hook. Put the steps in order.",
      items: [
        { id: "hang", text: "Lower the fork so the ring hangs on the hook" },
        { id: "hook", text: "Drive to the hook" },
        { id: "leave", text: "Back away and leave the ring there" },
        { id: "through", text: "Lower the fork and drive it through the ring" },
        { id: "pick", text: "Lift the fork to pick up the ring" }
      ]
    },
    {
      id: "q16",
      part: "Put the steps in order",
      type: "order",
      card: true,
      prompt: "Put the blocks in order. Task: drive 30 cm to a button, push it down with the arm, lift the arm, then back away.",
      items: [
        { id: "up", block: "C run \u21BB for 30 degrees" },
        { id: "back", block: "move \u2193 for 10 cm" },
        { id: "drive", block: "move \u2191 for 30 cm" },
        { id: "down", block: "C run \u21BA for 30 degrees" }
      ]
    },
    {
      id: "q17",
      part: "Put the steps in order",
      type: "choice",
      prompt: "Why should the robot **lift its arm before** it drives up to a lever?",
      options: [
        { id: "a", text: "So the arm doesn\u2019t crash into the lever" },
        { id: "b", text: "To make the robot faster" },
        { id: "c", text: "To save battery" },
        { id: "d", text: "Because the arm must always be up" }
      ]
    },
    // ---- Part E · Read the program ----
    {
      id: "q18",
      part: "Read the program",
      type: "choice",
      card: true,
      prompt: "How far does the robot drive?",
      code: ["repeat 3", "  move \u2191 for 10 cm"],
      options: [
        { id: "a", text: "10 cm" },
        { id: "b", text: "13 cm" },
        { id: "c", text: "30 cm" },
        { id: "d", text: "3 cm" }
      ]
    },
    {
      id: "q19",
      part: "Read the program",
      type: "choice",
      card: true,
      prompt: "What does the robot do?",
      code: ["move \u2191 for 20 cm", "C run \u21BA for 30 degrees", "wait 2 seconds", "C run \u21BB for 30 degrees", "move \u2193 for 20 cm"],
      options: [
        { id: "a", text: "Drives forward 20 cm, lowers the arm, waits 2 seconds, lifts the arm, then drives back to where it started" },
        { id: "b", text: "Drives forward 40 cm, then stops" },
        { id: "c", text: "Lifts the arm, waits 2 seconds, then drives forward 20 cm" },
        { id: "d", text: "Drives forward 20 cm and leaves the arm down" }
      ]
    },
    {
      id: "q20",
      part: "Read the program",
      type: "choice",
      card: true,
      prompt: "What does this program do?",
      code: ["start moving \u2191", "wait until D is closer than 10 cm", "stop moving"],
      options: [
        { id: "a", text: "Drives 10 cm, then stops" },
        { id: "b", text: "Drives forward until something is 10 cm away, then stops" },
        { id: "c", text: "Waits 10 seconds, then drives" },
        { id: "d", text: "Drives backward 10 cm" }
      ]
    }
  ];
  var MAX_SCORE = QUESTIONS.length;

  // src/blocks.js
  var CATEGORIES = [
    [/^when program starts/, "events"],
    [/^[A-F] (run|start motor|stop motor|set speed)/, "motors"],
    [/^(move|start moving|stop moving|set movement)/, "movement"],
    [/^(wait|repeat|forever)/, "control"]
  ];
  var UNITS = /* @__PURE__ */ new Set(["cm", "degrees", "rotations", "seconds"]);
  var esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  var pill = (text, kind = "drop") => `<span class="blk-${kind}">${esc(text)}</span>`;
  function category(text) {
    for (const [re, cat] of CATEGORIES) if (re.test(text)) return cat;
    return "control";
  }
  function inner(text) {
    const words = text.split(" ");
    const out = [];
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (i == 0 && /^[A-F]$/.test(w)) out.push(pill(w));
      else if (/^[↑↓↻↺]$/.test(w) || w == "A+B") out.push(pill(w));
      else if ((w == "right:" || w == "left:") && /^\d+$/.test(words[i + 1] || "")) {
        out.push(pill(`${w} ${words[i + 1]}`));
        i++;
      } else if (/^\d+(\.\d+)?$/.test(w)) out.push(pill(w, "num"));
      else if (UNITS.has(w) && /^\d/.test(words[i - 1] || "")) out.push(pill(w));
      else out.push(`<span class="blk-word">${esc(w)}</span>`);
    }
    return out.join(" ");
  }
  function blockHTML(text) {
    const t = text.trim();
    const until = /^wait until ([A-F]) (.+)$/.exec(t);
    if (until) {
      const cond = `<span class="blk-sensor">${pill(until[1])} ${inner(until[2])}</span>`;
      return `<span class="blk blk-control"><span class="blk-word">wait until</span> ${cond}</span>`;
    }
    const cat = category(t);
    return `<span class="blk blk-${cat}${cat == "events" ? " blk-hat" : ""}">${inner(t)}</span>`;
  }
  function programHTML(lines) {
    const html = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^repeat /.test(line)) {
        const body = [];
        while (lines[i + 1]?.startsWith("  ")) body.push(lines[++i].trim());
        html.push(`<div class="blk-c"><div class="blk-c-top">${blockHTML(line)}</div><div class="blk-c-body">${body.map((b) => `<div>${blockHTML(b)}</div>`).join("")}</div><div class="blk-c-foot"></div></div>`);
      } else {
        html.push(`<div>${blockHTML(line)}</div>`);
      }
    }
    return `<div class="program">${html.join("")}</div>`;
  }

  // src/pics.js
  var PICS = {
    hub: `<svg viewBox="0 0 120 120" role="img" aria-label="Hub">
    <rect x="18" y="20" width="84" height="84" rx="12" fill="#ffd521" stroke="#c9a400" stroke-width="2"/>
    <rect x="24" y="14" width="72" height="72" rx="10" fill="#f6f6ef" stroke="#c9c9bd" stroke-width="2"/>
    ${[0, 1, 2, 3, 4].flatMap((r) => [0, 1, 2, 3, 4].map((c) => `<rect x="${37 + c * 10}" y="${24 + r * 10}" width="6" height="6" rx="1.5" fill="${r == 1 && (c == 1 || c == 3) || r == 3 && c > 0 && c < 4 ? "#f2b705" : "#c8cdc9"}"/>`)).join("")}
    <circle cx="60" cy="80" r="5" fill="#ffd521" stroke="#c9a400" stroke-width="1.5"/>
    ${[30, 50, 70, 90].map((x) => `<rect x="${x - 5}" y="98" width="10" height="5" rx="1" fill="#2b2f33"/>`).join("")}
  </svg>`,
    motor: `<svg viewBox="0 0 120 120" role="img" aria-label="Large motor">
    <rect x="16" y="34" width="70" height="52" rx="12" fill="#f6f6ef" stroke="#c9c9bd" stroke-width="2"/>
    <rect x="16" y="70" width="70" height="16" rx="8" fill="#00a7b6"/>
    <circle cx="86" cy="60" r="22" fill="#f6f6ef" stroke="#c9c9bd" stroke-width="2"/>
    <circle cx="86" cy="60" r="13" fill="#00a7b6"/>
    <path d="M86 51v18M77 60h18" stroke="#2b2f33" stroke-width="5" stroke-linecap="round"/>
    <circle cx="30" cy="46" r="3" fill="#9aa3a8"/><circle cx="44" cy="46" r="3" fill="#9aa3a8"/>
    <path d="M14 58 C4 58 4 80 14 84" fill="none" stroke="#2b2f33" stroke-width="3"/>
  </svg>`,
    distance: `<svg viewBox="0 0 120 120" role="img" aria-label="Distance sensor">
    <rect x="12" y="34" width="96" height="52" rx="14" fill="#f6f6ef" stroke="#c9c9bd" stroke-width="2"/>
    <circle cx="40" cy="60" r="18" fill="#2b2f33"/><circle cx="40" cy="60" r="10" fill="#4f5a62"/><circle cx="35" cy="55" r="3" fill="#a9b4bb"/>
    <circle cx="80" cy="60" r="18" fill="#2b2f33"/><circle cx="80" cy="60" r="10" fill="#4f5a62"/><circle cx="75" cy="55" r="3" fill="#a9b4bb"/>
    <path d="M60 86 C60 98 48 98 44 104" fill="none" stroke="#2b2f33" stroke-width="3"/>
  </svg>`,
    wheel: `<svg viewBox="0 0 120 120" role="img" aria-label="Wheel">
    <circle cx="60" cy="60" r="44" fill="#79d1e8" stroke="#4aa9c3" stroke-width="3"/>
    <circle cx="60" cy="60" r="31" fill="#2b2f33"/>
    ${[0, 60, 120, 180, 240, 300].map((a) => `<line x1="60" y1="60" x2="${60 + 24 * Math.cos(a * Math.PI / 180)}" y2="${60 + 24 * Math.sin(a * Math.PI / 180)}" stroke="#5c676f" stroke-width="5"/>`).join("")}
    <circle cx="60" cy="60" r="8" fill="#f6f6ef"/>
    <path d="M60 55v10M55 60h10" stroke="#ffd521" stroke-width="3"/>
  </svg>`
  };

  // src/answers.js
  var KEY = {
    q1: "c",
    q2: { wheel: "motor", arm: "motor", wall: "sensor", line: "sensor", push: "sensor" },
    q3: "c",
    q4: "a",
    q5: "c",
    q6: "a",
    q7: "a",
    q8: "c",
    q9: ["start", "pair", "speed", "fwd", "back"],
    q10: "b",
    q11: "b",
    q12: "a",
    q13: "b",
    q14: ["lift", "drive", "press", "again", "away"],
    q15: ["through", "pick", "hook", "hang", "leave"],
    q16: ["drive", "down", "up", "back"],
    q17: "a",
    q18: "c",
    q19: "a",
    q20: "b"
  };

  // src/grade.js
  function clean(question, value) {
    if (value == null) return null;
    if (question.type == "choice") {
      return typeof value == "string" && question.options.some((o) => o.id == value) ? value : null;
    }
    if (question.type == "sort") {
      if (typeof value != "object" || Array.isArray(value)) return null;
      const out = {};
      for (const item of question.items) {
        const v = value[item.id];
        if (question.buckets.some((b) => b.id == v)) out[item.id] = v;
      }
      return Object.keys(out).length ? out : null;
    }
    if (question.type == "order") {
      const ids = question.items.map((i) => i.id);
      return Array.isArray(value) && value.length == ids.length && ids.every((id) => value.includes(id)) ? value.slice() : null;
    }
    return null;
  }
  function markOne(question, value) {
    const key = KEY[question.id];
    if (value == null) return 0;
    if (question.type == "choice") return value == key ? 1 : 0;
    if (question.type == "sort") return question.items.every((i) => value[i.id] == key[i.id]) ? 1 : 0;
    if (question.type == "order") return key.every((id, i) => value[i] == id) ? 1 : 0;
    return 0;
  }
  function mark(answers = {}) {
    if (typeof answers != "object" || answers === null || Array.isArray(answers)) answers = {};
    const results = {};
    let score = 0;
    let answered2 = 0;
    for (const q of QUESTIONS) {
      const value = clean(q, answers[q.id]);
      const points = markOne(q, value);
      if (value != null && (q.type != "sort" || q.items.every((i) => value[i.id]))) answered2++;
      score += points;
      results[q.id] = { value, points };
    }
    return { score, maxScore: MAX_SCORE, answered: answered2, results };
  }

  // src/result-file.js
  var FORMAT = "spike-quiz-result-v1";
  var MARKER = "===== DATA (JSON) =====";
  var plain = (s) => String(s ?? "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/\s+/g, " ").trim();
  var when = (iso) => iso ? new Date(iso).toLocaleString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "";
  function checksum(d) {
    const text = JSON.stringify([d.quiz, d.name, d.id, d.submittedAt, d.answers]);
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h.toString(16).padStart(8, "0");
  }
  function fileName(name) {
    const safe = String(name).replace(/[\\/:*?"<>|]+/g, "").trim() || "Student";
    return `SPIKE Prime Quiz - ${safe}.txt`;
  }
  function answerText(q, value) {
    if (value == null) return "(blank)";
    const label = (item) => plain(item.block || item.text);
    if (q.type == "choice") return label(q.options.find((o) => o.id == value) || { text: value });
    if (q.type == "sort") return q.items.filter((i) => value[i.id]).map((i) => `${label(i)} \u2192 ${q.buckets.find((b) => b.id == value[i.id])?.label}`).join("; ");
    if (q.type == "order") return value.map((id, n) => `${n + 1}. ${label(q.items.find((i) => i.id == id))}`).join("  ");
    return "";
  }
  function resultText(attempt) {
    const m = mark(attempt.answers);
    const data = {
      format: FORMAT,
      quiz: QUIZ.id,
      title: QUIZ.title,
      name: attempt.name,
      id: attempt.id,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      score: m.score,
      maxScore: m.maxScore,
      answers: Object.fromEntries(QUESTIONS.map((q) => [q.id, m.results[q.id].value]))
    };
    data.check = checksum(data);
    const lines = [
      QUIZ.title.toUpperCase(),
      "",
      `Name:       ${attempt.name}`,
      `Submitted:  ${when(attempt.submittedAt)}`,
      `Score:      ${m.score} / ${m.maxScore}`,
      "",
      "ANSWERS"
    ];
    QUESTIONS.forEach((q, i) => {
      const r = m.results[q.id];
      lines.push(`${String(i + 1).padStart(2, " ")}. ${plain(q.prompt)}`, `    ${r.points ? "\u2713" : "\u2717"}  ${answerText(q, r.value)}`);
    });
    lines.push("", "Hand this file in to your teacher. Please do not change it.", "", MARKER, JSON.stringify(data, null, 1), "");
    return lines.join("\n");
  }

  // src/quiz.js
  var $ = (sel) => document.querySelector(sel);
  var app = $("#app");
  var KEY2 = "spike-quiz:" + QUIZ.id;
  var N = QUESTIONS.length;
  var blank = (name = "") => ({ screen: "start", name, id: null, startedAt: null, submittedAt: null, answers: {}, current: 0 });
  var state = load() || blank();
  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY2));
    } catch {
      return null;
    }
  }
  function keep() {
    try {
      localStorage.setItem(KEY2, JSON.stringify(state));
    } catch {
    }
  }
  var newId = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  var esc2 = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  var rich = (s) => esc2(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  var answered = (q) => {
    const v = state.answers[q.id];
    if (v == null) return false;
    if (q.type == "sort") return q.items.every((i) => v[i.id]);
    return true;
  };
  var answeredCount = () => QUESTIONS.filter(answered).length;
  function seeded(seedText) {
    let h = 2166136261;
    for (const c of seedText) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return () => (h = Math.imul(h ^ h >>> 15, 2246822507), h = Math.imul(h ^ h >>> 13, 3266489909), (h ^= h >>> 16) >>> 0) / 4294967296;
  }
  function shuffled(list, seedText) {
    const rnd = seeded(seedText);
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function setAnswer(q, value) {
    state.answers[q.id] = value;
    keep();
    updateNav();
  }
  function download() {
    const blob = new Blob([resultText(state)], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName(state.name);
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1e3);
    state.downloaded = true;
    keep();
    const note = $("#download-note");
    if (note) note.hidden = false;
  }
  function render() {
    keep();
    document.body.classList.toggle("start-page", state.screen == "start");
    if (state.screen == "start") return renderStart();
    if (state.screen == "quiz") return renderQuestion();
    if (state.screen == "review") return renderReview();
    if (state.screen == "done") return renderDone();
  }
  function renderStart(message = "") {
    app.innerHTML = `
    <section class="hero">
      <div class="hero-left">
        <div class="hero-text">
          <span class="eyebrow light">Robotics</span>
          <h1>SPIKE Prime<br>Quiz</h1>
          <p class="tagline">Motors \xB7 Sensors \xB7 Movement \xB7 Reading programs</p>
        </div>
        <img class="hero-robot" src="img/spike-robot.png" alt="A SPIKE Prime robot with a fork on its arm">
      </div>
      <div class="hero-right">
        <form id="start-form" class="start-card" autocomplete="off">
          <h2>Let\u2019s get started</h2>
          <ul class="facts">
            <li><b>${N}</b> questions</li>
            <li>About <b>15 minutes</b></li>
            <li>Click or drag your answers</li>
          </ul>
          <label for="name">Type your name</label>
          <input id="name" name="name" maxlength="60" placeholder="Your name" value="${esc2(state.name)}" required>
          <p class="error" id="start-error" ${message ? "" : "hidden"}>${esc2(message)}</p>
          <button class="btn primary big" id="start-btn">Start the quiz \u2192</button>
          <p class="start-note">At the end you see your score and download a result file to hand in.</p>
        </form>
        <a class="teacher-link" href="results.html">Teacher: mark result files \u2192</a>
      </div>
    </section>`;
    const input = $("#name");
    input.focus();
    $("#start-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = input.value.trim().replace(/\s+/g, " ").replace(/[\x00-\x1f<>]/g, "");
      const err = $("#start-error");
      if (!name) {
        err.textContent = "Please type your name.";
        err.hidden = false;
        return;
      }
      state = { ...blank(name), screen: "quiz", id: newId(), startedAt: (/* @__PURE__ */ new Date()).toISOString() };
      render();
    });
  }
  function askRestart() {
    const dialog = document.createElement("dialog");
    dialog.className = "modal";
    dialog.innerHTML = `
    <h3>Start again?</h3>
    <p>${state.screen == "done" ? "Your score stays in the file you downloaded." : "Your answers so far will be cleared."} The next person can then type their name.</p>
    <div class="row"><button class="btn" data-no>Cancel</button><button class="btn primary" data-yes>Start again</button></div>`;
    document.body.append(dialog);
    dialog.querySelector("[data-no]").onclick = () => dialog.close();
    dialog.querySelector("[data-yes]").onclick = () => {
      dialog.close();
      state = blank();
      render();
    };
    dialog.addEventListener("close", () => dialog.remove());
    dialog.showModal();
  }
  function header() {
    const done = answeredCount();
    return `
    <header class="quiz-head">
      <div class="who"><span class="eyebrow">${esc2(QUIZ.title)}</span><strong>${esc2(state.name)}</strong></div>
      <div class="progress" aria-label="${done} of ${N} answered"><span style="width:${done / N * 100}%"></span></div>
      <button class="link-btn" id="not-me">Not ${esc2(state.name)}? Start again</button>
    </header>`;
  }
  function dots() {
    return `<nav class="dots" aria-label="Questions">${QUESTIONS.map((q, i) => `<button class="dot ${answered(q) ? "done" : ""} ${i == state.current ? "now" : ""}" data-go="${i}" aria-label="Question ${i + 1}">${i + 1}</button>`).join("")}</nav>`;
  }
  function renderQuestion() {
    const q = QUESTIONS[state.current];
    app.innerHTML = `
    ${header()}
    ${dots()}
    <section class="card question" data-type="${q.type}">
      <div class="q-top"><span class="q-num">Question ${state.current + 1} of ${N}</span><span class="q-part">${esc2(q.part)}</span></div>
      ${q.card ? `<div class="robot-card">\u{1F916} ${esc2(ROBOT_CARD)}</div>` : ""}
      <h2 class="prompt">${rich(q.prompt)}</h2>
      ${q.code ? programHTML(q.code) : ""}
      ${q.programs ? `<div class="programs">${q.programs.map((p) => `<div class="program-box"><span class="label">${esc2(p.label)}</span>${programHTML(p.code)}</div>`).join("")}</div>` : ""}
      <div class="${q.pic ? "with-pic" : ""}">
        <div id="answer-area"></div>
        ${q.pic ? `<img class="task-pic" src="${q.pic}" alt="">` : ""}
      </div>
    </section>
    <footer class="nav">
      <button class="btn" id="prev" ${state.current == 0 ? "disabled" : ""}>\u2190 Back</button>
      <span class="nav-hint" id="nav-hint"></span>
      <button class="btn primary" id="next">${state.current == N - 1 ? "Check my answers \u2192" : "Next \u2192"}</button>
    </footer>`;
    const area = $("#answer-area");
    if (q.type == "choice") renderChoice(q, area);
    if (q.type == "order") renderOrder(q, area);
    if (q.type == "sort") renderSort(q, area);
    $("#prev").onclick = () => go(state.current - 1);
    $("#next").onclick = () => state.current == N - 1 ? openReview() : go(state.current + 1);
    app.querySelectorAll("[data-go]").forEach((b) => b.onclick = () => go(+b.dataset.go));
    $("#not-me").onclick = askRestart;
    updateNav();
    window.scrollTo(0, 0);
  }
  function go(i) {
    state.current = Math.max(0, Math.min(N - 1, i));
    state.screen = "quiz";
    render();
  }
  function updateNav() {
    const q = QUESTIONS[state.current];
    const hint = $("#nav-hint");
    if (hint && q) hint.textContent = answered(q) ? "" : q.type == "choice" ? "Pick one answer" : q.type == "sort" ? "Drag every job into a box" : "Drag the cards into order";
    const bar = app.querySelector(".progress span");
    if (bar) bar.style.width = answeredCount() / N * 100 + "%";
    app.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("done", answered(QUESTIONS[i])));
  }
  function renderChoice(q, area) {
    const opts = q.fixedOrder ? q.options : shuffled(q.options, state.id + q.id);
    const withPics = opts.some((o) => o.pic);
    area.innerHTML = `<div class="options ${withPics ? "pics" : ""}" role="radiogroup">${opts.map((o, i) => `
    <button class="option ${state.answers[q.id] == o.id ? "picked" : ""}" data-id="${o.id}" role="radio" aria-checked="${state.answers[q.id] == o.id}">
      <span class="letter">${"ABCD"[i]}</span>
      ${o.pic ? `<span class="pic">${PICS[o.pic]}</span>` : ""}
      <span class="text">${o.block ? blockHTML(o.block) : esc2(o.text)}</span>
    </button>`).join("")}</div>`;
    area.querySelectorAll(".option").forEach((btn) => btn.onclick = () => {
      area.querySelectorAll(".option").forEach((b) => {
        b.classList.toggle("picked", b == btn);
        b.setAttribute("aria-checked", b == btn);
      });
      setAnswer(q, btn.dataset.id);
    });
  }
  function startDrag(e, el, { onMove, onDrop }) {
    if (e.button != null && e.button != 0) return;
    e.preventDefault();
    const rect = el.getBoundingClientRect();
    const ghost = el.cloneNode(true);
    ghost.classList.add("ghost");
    Object.assign(ghost.style, { width: rect.width + "px", left: rect.left + "px", top: rect.top + "px" });
    document.body.append(ghost);
    el.classList.add("lifting");
    const dx = e.clientX - rect.left, dy = e.clientY - rect.top;
    let last = e, scroller = null;
    const edgeScroll = () => {
      const edge = 70, y = last.clientY;
      if (Math.hypot(last.clientX - e.clientX, last.clientY - e.clientY) < 10) {
        scroller = requestAnimationFrame(edgeScroll);
        return;
      }
      const step = y < edge ? -(edge - y) / 4 : y > innerHeight - edge ? (y - innerHeight + edge) / 4 : 0;
      if (step) {
        window.scrollBy(0, step);
        onMove?.(last);
      }
      scroller = requestAnimationFrame(edgeScroll);
    };
    scroller = requestAnimationFrame(edgeScroll);
    const move = (ev) => {
      last = ev;
      ghost.style.left = ev.clientX - dx + "px";
      ghost.style.top = ev.clientY - dy + "px";
      onMove?.(ev);
    };
    const up = (ev) => {
      cancelAnimationFrame(scroller);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      ghost.remove();
      el.classList.remove("lifting");
      onDrop?.(ev);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }
  function renderOrder(q, area) {
    const byId = Object.fromEntries(q.items.map((i) => [i.id, i]));
    const order = state.answers[q.id] || shuffled(q.items, state.id + q.id).map((i) => i.id);
    area.innerHTML = `
    <p class="how">Drag the cards (or use \u25B2 \u25BC) so the first step is at the top.
      <button class="btn small keep" data-keep ${state.answers[q.id] ? "hidden" : ""}>\u2713 This order is right</button></p>
    <ol class="order-list">${order.map((id) => `
      <li class="order-item" data-id="${id}">
        <span class="grip" aria-hidden="true">\u283F</span>
        <span class="step"></span>
        <span class="content">${byId[id].block ? blockHTML(byId[id].block) : esc2(byId[id].text)}</span>
        <span class="moves"><button class="mini" data-up aria-label="Move up">\u25B2</button><button class="mini" data-down aria-label="Move down">\u25BC</button></span>
      </li>`).join("")}</ol>`;
    const list = area.querySelector(".order-list");
    const commit = () => {
      const ids = [...list.children].map((li) => li.dataset.id);
      [...list.children].forEach((li, i) => {
        li.querySelector(".step").textContent = i + 1;
      });
      return ids;
    };
    commit();
    area.querySelector("[data-keep]").onclick = (e) => {
      e.target.hidden = true;
      setAnswer(q, commit());
    };
    list.addEventListener("click", (e) => {
      const li = e.target.closest(".order-item");
      if (!li) return;
      if (e.target.closest("[data-up]") && li.previousElementSibling) list.insertBefore(li, li.previousElementSibling);
      else if (e.target.closest("[data-down]") && li.nextElementSibling) list.insertBefore(li.nextElementSibling, li);
      else return;
      area.querySelector("[data-keep]").hidden = true;
      setAnswer(q, commit());
    });
    list.addEventListener("pointerdown", (e) => {
      const li = e.target.closest(".order-item");
      if (!li || e.target.closest("button")) return;
      startDrag(e, li, {
        onMove: (ev) => {
          const others = [...list.children].filter((x) => x != li);
          const before = others.find((x) => {
            const r = x.getBoundingClientRect();
            return ev.clientY < r.top + r.height / 2;
          });
          if (before) {
            if (li.nextElementSibling != before) list.insertBefore(li, before);
          } else if (list.lastElementChild != li) list.append(li);
          commit();
        },
        onDrop: () => {
          area.querySelector("[data-keep]").hidden = true;
          setAnswer(q, commit());
        }
      });
    });
  }
  function renderSort(q, area) {
    const value = { ...state.answers[q.id] || {} };
    const chip = (item) => `<span class="chip" data-id="${item.id}" tabindex="0">${esc2(item.text)}</span>`;
    const items = shuffled(q.items, state.id + q.id);
    area.innerHTML = `
    <p class="how">Drag each card into a box. You can also click a card, then click a box.</p>
    <div class="tray drop" data-bucket="">${items.filter((i) => !value[i.id]).map(chip).join("")}</div>
    <div class="buckets">${q.buckets.map((b) => `
      <div class="bucket drop" data-bucket="${b.id}"><span class="bucket-label">${esc2(b.label)}</span>
        <div class="bucket-items">${items.filter((i) => value[i.id] == b.id).map(chip).join("")}</div>
      </div>`).join("")}</div>`;
    let selected = null;
    const place = (chipEl, bucketId) => {
      const target = bucketId ? area.querySelector(`.bucket[data-bucket="${bucketId}"] .bucket-items`) : area.querySelector(".tray");
      target.append(chipEl);
      if (bucketId) value[chipEl.dataset.id] = bucketId;
      else delete value[chipEl.dataset.id];
      chipEl.classList.remove("selected");
      selected = null;
      setAnswer(q, Object.keys(value).length ? { ...value } : null);
    };
    const dropTargetAt = (x, y) => document.elementFromPoint(x, y)?.closest(".drop");
    area.addEventListener("pointerdown", (e) => {
      const c = e.target.closest(".chip");
      if (!c) return;
      const startX = e.clientX, startY = e.clientY;
      let moved = false;
      startDrag(e, c, {
        onMove: (ev) => {
          if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > 6) moved = true;
          area.querySelectorAll(".drop").forEach((d) => d.classList.toggle("over", d == dropTargetAt(ev.clientX, ev.clientY)));
        },
        onDrop: (ev) => {
          area.querySelectorAll(".drop").forEach((d) => d.classList.remove("over"));
          if (!moved) {
            area.querySelectorAll(".chip").forEach((x) => x.classList.toggle("selected", x == c && selected != c));
            selected = selected == c ? null : c;
            return;
          }
          const target = dropTargetAt(ev.clientX, ev.clientY);
          if (target) place(c, target.dataset.bucket);
        }
      });
    });
    area.addEventListener("click", (e) => {
      if (!selected || e.target.closest(".chip")) return;
      const target = e.target.closest(".drop");
      if (target) place(selected, target.dataset.bucket);
    });
  }
  function openReview() {
    state.screen = "review";
    render();
  }
  function renderReview() {
    const missing = QUESTIONS.filter((q) => !answered(q));
    app.innerHTML = `
    ${header()}
    <section class="card review">
      <h2>Check your answers</h2>
      <p>${missing.length ? `You have <b>${missing.length}</b> question${missing.length == 1 ? "" : "s"} not answered yet. Click a number to go back.` : "You have answered every question. Click a number if you want to change something."}</p>
      <div class="review-grid">${QUESTIONS.map((q, i) => `<button class="tile ${answered(q) ? "done" : "todo"}" data-go="${i}"><b>${i + 1}</b><span>${answered(q) ? "Answered" : "Not answered"}</span></button>`).join("")}</div>
      <p class="error" id="submit-error" hidden></p>
      <div class="review-actions">
        <button class="btn" id="back-to-quiz">\u2190 Back to the questions</button>
        <button class="btn primary big" id="submit">Submit my answers</button>
      </div>
    </section>
    <dialog id="confirm" class="modal">
      <h3>Submit now?</h3>
      <p>${missing.length ? `${missing.length} question${missing.length == 1 ? " is" : "s are"} not answered. ` : ""}You can\u2019t change your answers after you submit.</p>
      <div class="row"><button class="btn" id="cancel">Go back</button><button class="btn primary" id="really">Yes, submit</button></div>
    </dialog>`;
    app.querySelectorAll("[data-go]").forEach((b) => b.onclick = () => go(+b.dataset.go));
    $("#back-to-quiz").onclick = () => go(missing.length ? QUESTIONS.indexOf(missing[0]) : N - 1);
    $("#not-me").onclick = askRestart;
    const dialog = $("#confirm");
    $("#submit").onclick = () => dialog.showModal();
    $("#cancel").onclick = () => dialog.close();
    $("#really").onclick = () => {
      dialog.close();
      state.submittedAt = (/* @__PURE__ */ new Date()).toISOString();
      state.screen = "done";
      render();
    };
  }
  function renderDone() {
    const m = mark(state.answers);
    const pct = Math.round(m.score / m.maxScore * 100);
    app.innerHTML = `
    <section class="card done-card">
      <span class="eyebrow">${esc2(QUIZ.title)}</span>
      <h1>Your score</h1>
      <div class="score-ring" style="--pct:${pct}"><b>${m.score}</b><span>/ ${m.maxScore}</span></div>
      <p>Thanks, <b>${esc2(state.name)}</b>.</p>
      <div class="marks-grid" aria-label="Right and wrong answers">${QUESTIONS.map((q, i) => {
      const ok = m.results[q.id].points > 0;
      return `<span class="mark ${ok ? "right" : "wrong"}" title="Question ${i + 1}: ${ok ? "right" : "not right"}"><b>${i + 1}</b>${ok ? "\u2713" : "\u2717"}</span>`;
    }).join("")}</div>
      <button class="btn primary big" id="download">\u2913 Download my result file</button>
      <p class="close-note" id="download-note" ${state.downloaded ? "" : "hidden"}>Saved as <b>${esc2(fileName(state.name))}</b>. Hand this file in to your teacher.</p>
      <p class="small-print">Don\u2019t change the file: your teacher\u2019s page checks it.</p>
      <button class="link-btn" id="again">Start again (next student)</button>
    </section>`;
    $("#download").onclick = download;
    $("#again").onclick = askRestart;
  }
  render();
})();
