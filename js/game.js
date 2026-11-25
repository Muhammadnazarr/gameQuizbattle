import { CONFIG } from "./config.js";
import { Questions } from "./questions.js";
import { Sound } from "./audio.js";

export class Game {
  constructor(arena, ui) {
    this.arena = arena;
    this.ui = ui;
    this.state = "idle";
    this.timers = [];
    this.bot = null;
    this.botTimer = 0;
    this.botTried = new Set();
    this.onFinish = null;
  }

  get active() {
    return this.state === "countdown" || this.state === "question" || this.state === "resolving";
  }

  after(sec, fn) { this.timers.push({ t: sec, fn }); }

  syncCombo(i) {
    this.ui.setCombo(i, this.combo[i]);
    this.arena.setAura(i, this.combo[i]);
  }

  start(settings) {
    this.settings = settings;
    Questions.reset();
    this.maxHP = settings.hp;
    this.hp = [this.maxHP, this.maxHP];
    this.combo = [0, 0];
    this.score = [0, 0];
    this.round = 0;
    this.locked = [0, 0];
    this.stats = [0, 1].map(() => ({ correct: 0, wrong: 0, damage: 0, bestCombo: 0, fastest: null, speedSum: 0 }));
    this.timers = [];

    this.bot = settings.bot || null;
    this.botTimer = 0;
    this.botTried = new Set();
    this.ui.setBotMode(!!this.bot);

    this.arena.setTheme(settings.subject);
    this.arena.reset();
    this.ui.show("hud");
    this.ui.setNames(settings.names[0], settings.names[1]);
    const subj = CONFIG.subjects.find((x) => x.id === settings.subject);
    const lvText = this.bot ? ` · Lv ${this.bot.lv}` : "";
    this.ui.setSubject(subj.icon + " " + subj.name + lvText);
    [0, 1].forEach((i) => {
      this.ui.setHP(i, this.hp[i], this.maxHP);
      this.ui.setScore(i, 0);
      this.syncCombo(i);
    });
    this.ui.setRound(1);
    this.ui.setTimer(1);
    this.ui.clearQuestion();

    this.state = "countdown";
    const steps = [["3", "#ffd34d"], ["2", "#ffb347"], ["1", "#ff7a45"]];
    steps.forEach(([txt, col], i) => this.after(i * 0.9, () => { this.ui.banner(txt, col); Sound.tick(); }));
    this.after(2.7, () => { this.ui.banner("FIGHT!", "#46f08a"); Sound.go(); });
    this.after(3.5, () => { this.ui.hideBanner(); this.nextQuestion(); });
  }

  stop() {
    this.state = "idle";
    this.timers = [];
    this.ui.hideBanner();
  }

  nextQuestion() {
    this.round++;
    this.q = Questions.generate(this.settings.subject, this.settings.level, this.settings.ops, this.bot ? this.bot.lv : 0);
    const times = this.q.isText ? CONFIG.timeText : CONFIG.time;
    const squeeze = this.bot ? 1 - 0.25 * this.bot.d : 1;
    this.total = times[this.q.tier] * squeeze;
    this.remaining = this.total;
    this.locked = [0, 0];
    this.ui.setRound(this.round);
    this.ui.setTimer(1);
    this.ui.setQuestion(this.q, CONFIG.keyLabels);
    if (this.bot) {
      const [a, b] = this.bot.react;
      this.botTimer = a + Math.random() * (b - a);
      this.botTried = new Set();
    }
    this.state = "question";
  }

  handleKey(code) {
    if (this.state !== "question") return false;
    const players = this.bot ? 1 : 2;
    for (let p = 0; p < players; p++) {
      const keys = p === 0 ? CONFIG.keys.p1 : CONFIG.keys.p2;
      const idx = keys.indexOf(code);
      if (idx !== -1) { this.answer(p, idx); return true; }
    }
    return false;
  }

  // Dipakai oleh kontrol sentuh / klik mouse pada kartu jawaban.
  tap(p, idx) {
    if (this.state !== "question") return false;
    if (p >= (this.bot ? 1 : 2)) return false;
    this.answer(p, idx);
    return true;
  }

  answer(p, idx) {
    if (this.locked[p] > 0) return;
    const st = this.stats[p];

    if (idx === this.q.correctIndex) {
      const o = 1 - p;
      this.state = "resolving";
      const took = this.total - this.remaining;
      this.combo[p]++;
      this.combo[o] = 0;
      this.score[p]++;
      st.correct++;
      st.bestCombo = Math.max(st.bestCombo, this.combo[p]);
      st.fastest = st.fastest === null ? took : Math.min(st.fastest, took);

      const speed = Math.max(0, this.remaining / this.total);
      st.speedSum += speed;
      const dmg = Math.round(CONFIG.baseDamage + CONFIG.speedBonusMax * speed);
      st.damage += dmg;

      this.ui.markCorrect(p, idx);
      this.ui.setScore(p, this.score[p]);
      this.syncCombo(p);
      this.syncCombo(o);
      Sound.correct();
      Sound.shoot();

      const streak = this.combo[p];
      if (streak >= 2 && this.hp[p] < this.maxHP) {
        const heal = Math.round(this.maxHP * CONFIG.comboHeal * Math.min(streak - 1, CONFIG.comboHealCap));
        const gained = Math.min(heal, this.maxHP - this.hp[p]);
        if (gained > 0) {
          this.hp[p] += gained;
          this.ui.setHP(p, this.hp[p], this.maxHP);
          const pp = this.arena.toScreen(p);
          this.ui.floater(pp.x, pp.y, "+" + gained, "#46f08a");
        }
      }

      this.arena.attack(p, dmg, () => {
        Sound.hit();
        this.hp[o] = Math.max(0, this.hp[o] - dmg);
        this.ui.setHP(o, this.hp[o], this.maxHP);
        const pos = this.arena.toScreen(o);
        this.ui.floater(pos.x, pos.y, "-" + dmg, p === 0 ? CONFIG.cssColors.p1 : CONFIG.cssColors.p2);

        if (this.hp[o] <= 0) this.after(0.6, () => this.finish(p));
        else this.after(CONFIG.betweenRounds, () => this.nextQuestion());
      });
    } else {
      st.wrong++;
      this.combo[p] = 0;
      this.syncCombo(p);
      this.ui.markWrong(p, idx);
      this.locked[p] = CONFIG.wrongLock;
      this.arena.stun(p, CONFIG.wrongLock);
      Sound.wrong();
    }
  }

  botAct() {
    if (this.locked[1] > 0) { this.botTimer = this.locked[1] + 0.1; return; }
    const wrongLeft = [0, 1, 2, 3].filter((i) => i !== this.q.correctIndex && !this.botTried.has(i));
    const correct = wrongLeft.length === 0 || Math.random() < this.bot.acc;
    if (correct) { this.answer(1, this.q.correctIndex); return; }

    const idx = wrongLeft[Math.floor(Math.random() * wrongLeft.length)];
    this.botTried.add(idx);
    this.answer(1, idx);
    const [a, b] = this.bot.react;
    this.botTimer = CONFIG.wrongLock + a * 0.3 + Math.random() * (b - a) * 0.3;
  }

  timeUp() {
    this.state = "resolving";
    this.combo = [0, 0];
    this.syncCombo(0);
    this.syncCombo(1);
    this.ui.markCorrect(-1, this.q.correctIndex);
    this.ui.banner("WAKTU HABIS", "#ff4d6d");
    Sound.timeout();
    this.after(1.2, () => { this.ui.hideBanner(); this.nextQuestion(); });
  }

  finish(winner) {
    this.state = "over";
    if (this.onFinish) this.onFinish(winner, this.settings);
    this.arena.victory(winner);
    this.ui.banner("K.O.!", winner === 0 ? CONFIG.cssColors.p1 : CONFIG.cssColors.p2);
    Sound.win();
    this.after(2.4, () => {
      this.ui.hideBanner();
      this.ui.showResult(winner, this.settings.names, this.stats);
    });
  }

  update(dt) {
    for (let i = this.timers.length - 1; i >= 0; i--) {
      const t = this.timers[i];
      t.t -= dt;
      if (t.t <= 0) { this.timers.splice(i, 1); t.fn(); }
    }

    if (this.state === "question") {
      this.remaining -= dt;
      this.locked = this.locked.map((v) => Math.max(0, v - dt));
      this.ui.setTimer(this.remaining / this.total);
      if (this.bot) {
        this.botTimer -= dt;
        if (this.botTimer <= 0 && this.state === "question") this.botAct();
      }
      if (this.state === "question" && this.remaining <= 0) this.timeUp();
    }
  }
}