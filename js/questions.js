import { ipa } from "./data/ipa.js";
import { ips } from "./data/ips.js";
import { geografi } from "./data/geografi.js";
import { budaya } from "./data/budaya.js";
import { indonesia } from "./data/indonesia.js";
import { inggris } from "./data/inggris.js";
import { jepang } from "./data/jepang.js";

export const Questions = (() => {
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (arr) => arr[rnd(0, arr.length - 1)];
  const lerp = (a, b, t) => Math.round(a + (b - a) * t);

  const RANGE = {
    easy:   { addMax: 20,  mulA: 9,  mulB: 5,  divB: 5,  divQ: 9  },
    medium: { addMax: 100, mulA: 12, mulB: 12, divB: 12, divQ: 12 },
    hard:   { addMax: 500, mulA: 25, mulB: 15, divB: 15, divQ: 20 },
  };

  const LEVELS = 20;
  const WINDOW = 10;

  function rangeFor(level, lv) {
    if (!lv) return RANGE[level];
    const t = (lv - 1) / (LEVELS - 1);
    return {
      addMax: lerp(10, 500, t),
      mulA: lerp(4, 25, t),
      mulB: lerp(3, 15, t),
      divB: lerp(3, 15, t),
      divQ: lerp(4, 20, t),
    };
  }

  function make(op, level, lv) {
    const r = rangeFor(level, lv);
    let a, b, text, answer;

    if (op === "+") {
      a = rnd(2, r.addMax); b = rnd(2, r.addMax);
      text = `${a} + ${b}`; answer = a + b;
    } else if (op === "-") {
      a = rnd(5, r.addMax); b = rnd(2, a);
      text = `${a} − ${b}`; answer = a - b;
    } else if (op === "*") {
      a = rnd(2, r.mulA); b = rnd(2, r.mulB);
      text = `${a} × ${b}`; answer = a * b;
    } else {
      b = rnd(2, r.divB); const q = rnd(2, r.divQ); a = b * q;
      text = `${a} ÷ ${b}`; answer = q;
    }

    const chance = lv ? (lv < 8 ? 0 : Math.min(0.75, ((lv - 7) / 13) * 0.75)) : (level === "hard" ? 0.4 : 0);
    if ((op === "*" || op === "+" || op === "-") && chance > 0 && Math.random() < chance) {
      const cMax = lv ? lerp(10, 60, (lv - 1) / (LEVELS - 1)) : 40;
      const c = rnd(2, cMax);
      if (Math.random() < 0.5) { text += ` + ${c}`; answer += c; }
      else if (answer > c) { text += ` − ${c}`; answer -= c; }
      if (lv && lv >= 15 && Math.random() < 0.5) {
        const d = rnd(2, cMax);
        text += ` + ${d}`; answer += d;
      }
    }
    return { text, answer };
  }

  function distractors(answer) {
    const set = new Set();
    const spread = Math.max(3, Math.round(Math.abs(answer) * 0.12));
    let guard = 0;
    while (set.size < 3 && guard++ < 200) {
      let d;
      const t = Math.random();
      if (t < 0.45)      d = answer + pick([-1, 1]) * rnd(1, 3);
      else if (t < 0.8)  d = answer + pick([-1, 1]) * rnd(1, spread);
      else               d = answer + pick([-10, 10, -2, 2, 5, -5]);
      if (d !== answer && d >= 0) set.add(d);
    }
    let fill = 1;
    while (set.size < 3) { if (answer + fill !== answer) set.add(answer + fill); fill++; }
    return [...set];
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = rnd(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const BANKS = { ipa, ips, geo: geografi, budaya, indonesia, inggris, jepang };
  const decks = {};

  function tierOf(i, n) {
    return i < n / 3 ? "easy" : i < (2 * n) / 3 ? "medium" : "hard";
  }

  function levelPool(subject, lv) {
    const b = BANKS[subject];
    const all = [];
    ["easy", "medium", "hard"].forEach((tier) => b[tier].forEach((q) => all.push({ q, tier })));
    const n = all.length;
    const size = Math.min(WINDOW, n);
    const start = Math.round(((lv - 1) / (LEVELS - 1)) * (n - size));
    return all.slice(start, start + size);
  }

  function fromBank(subject, level, lv) {
    let entry;
    if (lv) {
      const key = subject + ":lv" + lv;
      if (!decks[key] || decks[key].length === 0) decks[key] = shuffle([...levelPool(subject, lv)]);
      entry = decks[key].pop();
    } else {
      const key = subject + ":" + level;
      if (!decks[key] || decks[key].length === 0) {
        decks[key] = shuffle(BANKS[subject][level].map((q) => ({ q, tier: level })));
      }
      entry = decks[key].pop();
    }
    const [text, answer, ...wrong] = entry.q;
    const options = shuffle([answer, ...wrong]);
    return { text, answer, options, correctIndex: options.indexOf(answer), isText: true, tier: entry.tier };
  }

  function reset() { for (const k in decks) delete decks[k]; }

  function generate(subject, level, ops, lv) {
    if (subject !== "math") return fromBank(subject, level, lv);
    const tier = lv ? tierOf(lv - 1, LEVELS) : level;
    const q = make(pick(ops), level, lv);
    const options = shuffle([q.answer, ...distractors(q.answer)]);
    return { text: q.text, answer: q.answer, options, correctIndex: options.indexOf(q.answer), isText: false, tier };
  }

  return { generate, reset };
})();