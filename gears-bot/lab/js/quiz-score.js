// Marking for the Robot Lab Quiz. No Blockly here, so it can be tested in Node.
// How answers are stored:
//   choice → index of the picked option      order → item index in each slot (null = empty)
//   sort   → { itemIndex: groupId }          gap   → index of the item in the gap

// Two cards that look the same count as the same (e.g. the two safety-sound blocks)
const looks = item => JSON.stringify({ block: item.block, text: item.text });

export function isAnswered(q, a) {
  if (a == null) return false;
  if (q.type == 'order') return a.length == q.items.length && a.every(x => x != null);
  if (q.type == 'sort') return q.items.every((_, i) => a[i] != null);
  return true;
}

// How many parts are right: { right, of }
export function marks(q, a) {
  if (q.type == 'choice' || q.type == 'gap') return { right: a === q.answer ? 1 : 0, of: 1 };
  if (q.type == 'order') {
    return { right: q.items.filter((it, i) => a?.[i] != null && looks(q.items[a[i]]) == looks(it)).length, of: q.items.length };
  }
  return { right: q.items.filter((it, i) => a?.[i] == it.group).length, of: q.items.length };
}

export function isCorrect(q, a) {
  const m = marks(q, a);
  return m.right == m.of;
}

// One mark per question: right only when every part is right
export function score(questions, answers) {
  const per = questions.map(q => ({
    id: q.id, topic: q.topic,
    answered: isAnswered(q, answers[q.id]),
    correct: isCorrect(q, answers[q.id]),
    parts: marks(q, answers[q.id]),
  }));
  return { score: per.filter(p => p.correct).length, total: questions.length, per };
}

// The score as a mark out of 20 (one decimal place), for the result page and the teacher's export
export const outOf20 = (got, total) => Math.round(got / total * 200) / 10;
