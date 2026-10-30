(() => {
  // src/questions.js
  var QUIZ = { id: "spike-quiz-v1", title: "SPIKE Prime Quiz" };
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
    const key2 = KEY[question.id];
    if (value == null) return 0;
    if (question.type == "choice") return value == key2 ? 1 : 0;
    if (question.type == "sort") return question.items.every((i) => value[i.id] == key2[i.id]) ? 1 : 0;
    if (question.type == "order") return key2.every((id, i) => value[i] == id) ? 1 : 0;
    return 0;
  }
  function mark(answers = {}) {
    if (typeof answers != "object" || answers === null || Array.isArray(answers)) answers = {};
    const results = {};
    let score = 0;
    let answered = 0;
    for (const q of QUESTIONS) {
      const value = clean(q, answers[q.id]);
      const points = markOne(q, value);
      if (value != null && (q.type != "sort" || q.items.every((i) => value[i.id]))) answered++;
      score += points;
      results[q.id] = { value, points };
    }
    return { score, maxScore: MAX_SCORE, answered, results };
  }

  // src/result-file.js
  var FORMAT = "spike-quiz-result-v1";
  var MARKER = "===== DATA (JSON) =====";
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
  function parseResult(text) {
    const at = text.indexOf(MARKER);
    let data;
    try {
      data = JSON.parse(at >= 0 ? text.slice(at + MARKER.length) : text);
    } catch {
      return { error: "No result data found in this file." };
    }
    if (data?.format !== FORMAT) return { error: "This is not a SPIKE Prime Quiz result file." };
    if (data.quiz !== QUIZ.id) return { error: "This file is from a different quiz." };
    if (typeof data.name != "string" || !data.answers || typeof data.answers != "object") return { error: "This file is incomplete." };
    return { data };
  }

  // src/results.js
  var $ = (sel) => document.querySelector(sel);
  var app = $("#app");
  var esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  var key = (name) => name.toLowerCase().replace(/\s+/g, " ").trim();
  var rows = [];
  var problems = [];
  var sortBy = "name";
  function toRow(data, file) {
    const m = mark(data.answers);
    const notes = [];
    if (data.score !== m.score) notes.push(`File said ${data.score}, re-marked ${m.score}`);
    if (data.check !== checksum(data)) notes.push("File was edited after download");
    if (!data.submittedAt) notes.push("Not submitted");
    return { file, id: data.id, name: data.name.trim(), submittedAt: data.submittedAt, score: m.score, results: m.results, notes };
  }
  async function addFiles(files) {
    for (const file of files) {
      if (file.size > 2e5) {
        problems.push(`${file.name}: too large to be a result file`);
        continue;
      }
      const { data, error } = parseResult(await file.text());
      if (error) {
        problems.push(`${file.name}: ${error}`);
        continue;
      }
      if (rows.some((r) => r.id === data.id)) {
        problems.push(`${file.name}: already loaded`);
        continue;
      }
      rows.push(toRow(data, file.name));
    }
    render();
  }
  function sorted() {
    const list = rows.slice();
    if (sortBy == "score") list.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    else list.sort((a, b) => a.name.localeCompare(b.name));
    const count = {};
    list.forEach((r) => {
      count[key(r.name)] = (count[key(r.name)] || 0) + 1;
    });
    return list.map((r) => ({ ...r, twice: count[key(r.name)] > 1 }));
  }
  function stats() {
    const s = rows.map((r) => r.score).sort((a, b) => a - b);
    const avg = s.reduce((a, b) => a + b, 0) / s.length;
    const mid = s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
    return { n: s.length, avg: avg.toFixed(1), median: mid, high: s[s.length - 1], low: s[0] };
  }
  function render() {
    const list = sorted();
    const st = rows.length ? stats() : null;
    app.innerHTML = `
    <header class="results-head">
      <div><span class="eyebrow">${esc(QUIZ.title)}</span><h1>Results</h1></div>
      <a class="btn" href="index.html">\u2190 Back to the quiz</a>
    </header>
    <label class="drop-zone" id="drop">
      <input type="file" id="files" accept=".txt,text/plain" multiple hidden>
      <b>Drop the students\u2019 result files here</b>
      <span>or click to choose them (you can pick many at once). The files are read on this computer only.</span>
    </label>
    ${problems.length ? `<div class="problems"><b>Some files were skipped</b><ul>${problems.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>` : ""}
    ${st ? `
      <div class="stat-row">
        <span><b>${st.n}</b> students</span><span>Average <b>${st.avg}</b> / ${MAX_SCORE}</span>
        <span>Median <b>${st.median}</b></span><span>Highest <b>${st.high}</b></span><span>Lowest <b>${st.low}</b></span>
      </div>
      <div class="table-tools">
        <span>Sort by</span>
        <button class="btn small ${sortBy == "name" ? "on" : ""}" data-sort="name">Name</button>
        <button class="btn small ${sortBy == "score" ? "on" : ""}" data-sort="score">Score</button>
        <span class="spacer"></span>
        <button class="btn small" id="csv">\u2913 Export CSV (opens in Excel)</button>
        <button class="btn small" id="clear">Clear</button>
      </div>
      <div class="table-wrap"><table class="results">
        <thead><tr><th>#</th><th class="name">Name</th><th>Score</th><th>Submitted</th>${QUESTIONS.map((q, i) => `<th class="q" title="${esc(q.part)}">${i + 1}</th>`).join("")}<th class="notes">Notes</th></tr></thead>
        <tbody>${list.map((r, n) => `
          <tr>
            <td>${n + 1}</td><td class="name">${esc(r.name)}</td><td class="score"><b>${r.score}</b>/${MAX_SCORE}</td>
            <td class="when">${esc(when(r.submittedAt))}</td>
            ${QUESTIONS.map((q) => r.results[q.id].points ? '<td class="q right">\u2713</td>' : `<td class="q wrong">${r.results[q.id].value == null ? "\u2013" : "\u2717"}</td>`).join("")}
            <td class="notes">${esc([...r.notes, ...r.twice ? ["More than one file with this name"] : []].join("; "))}</td>
          </tr>`).join("")}</tbody>
        <tfoot><tr><td></td><td class="name">% right</td><td></td><td></td>${QUESTIONS.map((q) => {
      const pct = Math.round(rows.filter((r) => r.results[q.id].points).length / rows.length * 100);
      return `<td class="q pct ${pct < 50 ? "low" : ""}">${pct}</td>`;
    }).join("")}<td></td></tr></tfoot>
      </table></div>
      <p class="small-print">\u2713 right \xB7 \u2717 wrong \xB7 \u2013 blank. Hover a question number to see its topic. Every file is re-marked from its answers.</p>` : ""}`;
    const input = $("#files");
    input.onchange = () => {
      addFiles([...input.files]);
      input.value = "";
    };
    const drop = $("#drop");
    drop.ondragover = (e) => {
      e.preventDefault();
      drop.classList.add("over");
    };
    drop.ondragleave = () => drop.classList.remove("over");
    drop.ondrop = (e) => {
      e.preventDefault();
      drop.classList.remove("over");
      addFiles([...e.dataTransfer.files]);
    };
    app.querySelectorAll("[data-sort]").forEach((b) => b.onclick = () => {
      sortBy = b.dataset.sort;
      render();
    });
    if (st) {
      $("#csv").onclick = exportCsv;
      $("#clear").onclick = () => {
        rows = [];
        problems = [];
        render();
      };
    }
  }
  function cell(v) {
    let s = String(v ?? "");
    if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  }
  function exportCsv() {
    const head = ["Name", "Score", "Out of", "Submitted", ...QUESTIONS.map((q, i) => `Q${i + 1}`), "Notes"];
    const body = sorted().map((r) => [r.name, r.score, MAX_SCORE, when(r.submittedAt), ...QUESTIONS.map((q) => r.results[q.id].points), [...r.notes, ...r.twice ? ["More than one file with this name"] : []].join("; ")]);
    const csv = "\uFEFF" + [head, ...body].map((line) => line.map(cell).join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `${QUIZ.title} - results.csv`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1e3);
  }
  render();
})();
