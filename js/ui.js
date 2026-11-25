import { CONFIG } from "./config.js";

export class UI {
  constructor() {
    const $ = (id) => document.getElementById(id);
    this.el = {
      hud: $("hud"), modes: $("screen-modes"), subjects: $("screen-subjects"), levels: $("screen-levels"),
      setup: $("screen-setup"), settings: $("screen-settings"), pause: $("screen-pause"), result: $("screen-result"), patch: $("screen-patch"),
      name: [$("name1"), $("name2")],
      hp: [$("hp1"), $("hp2")],
      ghost: [$("hpghost1"), $("hpghost2")],
      hpText: [$("hptext1"), $("hptext2")],
      score: [$("score1"), $("score2")],
      combo: [$("combo1"), $("combo2")],
      round: $("roundLabel"),
      subject: $("subjectLabel"),
      timer: $("timerFill"),
      question: $("question"),
      options: $("options"),
      floaters: $("floaters"),
      banner: $("banner"),
      winner: $("winner-text"),
      stats: $("result-stats"),
    };
  }

  show(name) {
    ["hud", "modes", "subjects", "levels", "setup", "settings", "patch", "pause", "result"].forEach((k) => this.el[k].classList.add("hidden"));
    if (["modes", "subjects", "levels", "setup", "settings", "patch", "hud"].includes(name)) this.el[name].classList.remove("hidden");
    if (name === "result") { this.el.hud.classList.remove("hidden"); this.el.result.classList.remove("hidden"); }
  }
  showPause(on) { this.el.pause.classList.toggle("hidden", !on); }

  setBotMode(on) { this.el.options.classList.toggle("vsbot", on); }

  setNames(a, b) { this.el.name[0].textContent = a; this.el.name[1].textContent = b; }

  setHP(i, hp, max) {
    const pct = Math.max(0, (hp / max) * 100);
    this.el.hp[i].style.width = pct + "%";
    this.el.ghost[i].style.width = pct + "%";
    this.el.hp[i].classList.toggle("low", pct < 30);
    this.el.hpText[i].textContent = Math.max(0, Math.round(hp));
  }
  setScore(i, v) { this.el.score[i].textContent = v; }

  setCombo(i, c) {
    this.el.combo[i].textContent = c >= 2 ? ` · 🔥 x${c}` : "";
    const bar = this.el.hp[i].parentElement;
    const step = Math.min(Math.max(c - 1, 0), 6);
    bar.style.height = (18 + step * 4) + "px";
    bar.classList.toggle("boost", c >= 2);
  }

  setSubject(t) { this.el.subject.textContent = t; }
  setRound(n) { this.el.round.textContent = "Ronde " + n; }
  setTimer(frac) { this.el.timer.style.width = Math.max(0, frac * 100) + "%"; }

  setQuestion(q, labels) {
    const qEl = this.el.question;
    qEl.textContent = q.isText ? q.text : q.text + " = ?";
    qEl.classList.toggle("text", q.isText);
    qEl.classList.remove("pop"); void qEl.offsetWidth; qEl.classList.add("pop");

    this.el.options.innerHTML = "";
    const touch = document.documentElement.classList.contains("touch");
    q.options.forEach((val, i) => {
      const d = document.createElement("div");
      d.className = "opt" + (q.isText ? " text" : "");
      d.innerHTML =
        `<span class="x l">✖</span><span class="x r">✖</span>` +
        `<div class="val">${val}</div>` +
        `<div class="keys"><span class="chip k1">${touch ? "P1" : labels.p1[i]}</span><span class="chip k2">${touch ? "P2" : labels.p2[i]}</span></div>`;
      this.el.options.appendChild(d);
    });
  }

  clearQuestion() { this.el.question.textContent = "…"; this.el.options.innerHTML = ""; }

  markWrong(player, idx) {
    const opt = this.el.options.children[idx];
    if (!opt) return;
    opt.querySelector(player === 0 ? ".x.l" : ".x.r").classList.add("show");
    opt.querySelector(player === 0 ? ".k1" : ".k2").classList.add("dead");
  }

  markCorrect(player, idx) {
    [...this.el.options.children].forEach((o, i) => {
      if (i === idx) { o.classList.add("correct"); if (player >= 0) o.classList.add(player === 0 ? "by1" : "by2"); }
      else o.classList.add("faded");
    });
  }

  floater(x, y, text, color) {
    const f = document.createElement("div");
    f.className = "floater";
    f.textContent = text;
    f.style.left = x + "px"; f.style.top = y + "px"; f.style.color = color;
    this.el.floaters.appendChild(f);
    setTimeout(() => f.remove(), 1300);
  }

  banner(text, color = "#fff") {
    const b = this.el.banner;
    b.classList.add("hidden"); void b.offsetWidth;
    b.textContent = text; b.style.color = color;
    b.classList.remove("hidden");
  }
  hideBanner() { this.el.banner.classList.add("hidden"); }

  showResult(winnerIdx, names, stats) {
    const col = winnerIdx === 0 ? CONFIG.cssColors.p1 : CONFIG.cssColors.p2;
    this.el.winner.textContent = names[winnerIdx] + " MENANG!";
    this.el.winner.style.color = col;
    this.el.stats.innerHTML = [0, 1].map((i) => {
      const s = stats[i];
      return `<div class="s${i + 1}"><b>${names[i]}</b><br>` +
        `Benar: ${s.correct}<br>Salah: ${s.wrong}<br>Damage: ${s.damage}<br>` +
        `Combo terbaik: ${s.bestCombo}<br>Tercepat: ${s.fastest === null ? "-" : s.fastest.toFixed(1) + " dtk"}</div>`;
    }).join("");
    this.show("result");
  }
}