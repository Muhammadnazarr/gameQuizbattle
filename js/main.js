import { CONFIG } from "./config.js";
import { Arena } from "./scene.js";
import { UI } from "./ui.js";
import { Game } from "./game.js";
import { Sound } from "./audio.js";
import { PATCH_NOTES } from "./patchnotes.js";

(function () {
  // Deteksi layar sentuh (HP / tablet) -> aktifkan kontrol sentuh & tampilan ringkas
  const isTouch = (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) ||
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (isTouch) document.documentElement.classList.add("touch");
  // Cegah zoom cubit / double-tap zoom di iOS Safari
  ["gesturestart", "gesturechange", "gestureend"].forEach((t) =>
    document.addEventListener(t, (e) => e.preventDefault()));
  document.addEventListener("contextmenu", (e) => { if (isTouch) e.preventDefault(); });

  const arena = new Arena(document.getElementById("scene"));
  const ui = new UI();
  const game = new Game(arena, ui);
  const $ = (id) => document.getElementById(id);

  const TOTAL = CONFIG.botLevels.length;

  let paused = false;
  let subject = CONFIG.subjects[0];
  let mode = "room";
  let lastSettings = null;

  const storeKey = (id) => "quizbattle_clear_" + id;

  function getCleared(id) {
    try { return parseInt(localStorage.getItem(storeKey(id)), 10) || 0; } catch (e) { return 0; }
  }

  function setCleared(id, lv) {
    try { if (lv > getCleared(id)) localStorage.setItem(storeKey(id), String(lv)); } catch (e) {}
  }

  const starKey = (id) => "quizbattle_stars_" + id;

  function getStars(id) {
    try { return JSON.parse(localStorage.getItem(starKey(id)) || "{}") || {}; } catch (e) { return {}; }
  }

  function starsOf(id, lv) {
    const rec = getStars(id)[lv];
    if (rec) return rec;
    return lv <= getCleared(id) ? 1 : 0;
  }

  function saveStars(id, lv, n) {
    try {
      const all = getStars(id);
      if (!all[lv] || n > all[lv]) all[lv] = n;
      localStorage.setItem(starKey(id), JSON.stringify(all));
    } catch (e) {}
  }

  function calcStars(winnerHp, maxHp, st) {
    const hpFrac = Math.max(0, Math.min(1, winnerHp / maxHp));
    const speedFrac = st.correct ? Math.max(0, Math.min(1, st.speedSum / st.correct)) : 0;
    const score = hpFrac * 0.6 + speedFrac * 0.4;
    const stars = score >= 0.65 ? 3 : score >= 0.4 ? 2 : 1;
    return { stars, hpFrac, speedFrac };
  }

  function clearProgress(id) {
    try { localStorage.removeItem(storeKey(id)); localStorage.removeItem(starKey(id)); } catch (e) {}
  }

  function twoStep(btn, idleText, confirmText, action) {
    let timer = 0;
    const reset = () => { clearTimeout(timer); btn.classList.remove("confirm"); btn.textContent = idleText; };
    btn.addEventListener("click", () => {
      if (btn.classList.contains("confirm")) { reset(); action(); return; }
      btn.classList.add("confirm");
      btn.textContent = confirmText;
      timer = setTimeout(reset, 4000);
    });
    return reset;
  }

  twoStep($("btn-reset-level"), "↺ Reset Level", "Yakin? Klik lagi", () => {
    clearProgress(subject.id);
    openLevels(subject);
  });

  twoStep($("btn-reset-all"), "↺ Reset semua progres V.S. AI", "Hapus semua progres? Klik lagi", () => {
    CONFIG.subjects.forEach((s) => clearProgress(s.id));
    $("btn-reset-all").textContent = "✔ Progres direset";
    setTimeout(() => { $("btn-reset-all").textContent = "↺ Reset semua progres V.S. AI"; }, 1800);
  });

  const GFX_KEY = "quizbattle_gfx";
  const GFX_HINTS = {
    low: "Paling ringan: tanpa efek bloom dan bayangan, dekorasi latar dimatikan. Cocok untuk laptop atau HP yang kurang kuat.",
    medium: "Seimbang: bloom, bayangan, dan dekorasi latar aktif dengan resolusi sedang.",
    high: "Terbaik: resolusi penuh, anti-aliasing maksimal, dan bayangan lembut. Butuh GPU yang kuat.",
  };
  const DEFAULTS = { gfx: isTouch ? "low" : "medium", music: 50, sfx: 80 };

  function getGfx() {
    try { const v = localStorage.getItem(GFX_KEY); if (GFX_HINTS[v]) return v; } catch (e) {}
    return DEFAULTS.gfx;
  }

  function applyGfx(level) {
    arena.setQuality(level);
    try { localStorage.setItem(GFX_KEY, level); } catch (e) {}
    [...$("seg-gfx").children].forEach((b) => b.classList.toggle("on", b.dataset.v === level));
    $("gfx-hint").textContent = GFX_HINTS[level];
  }

  function paintSlider(id, valId, v) {
    $(id).value = v;
    $(id).style.setProperty("--fill", v + "%");
    $(valId).textContent = v + "%";
  }

  applyGfx(getGfx());
  paintSlider("vol-music", "val-music", Math.round(Sound.getMusicVolume() * 100));
  paintSlider("vol-sfx", "val-sfx", Math.round(Sound.getSfxVolume() * 100));

  $("seg-gfx").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) applyGfx(b.dataset.v);
  });

  $("vol-music").addEventListener("input", (e) => {
    const v = parseInt(e.target.value, 10);
    paintSlider("vol-music", "val-music", v);
    Sound.unlock();
    Sound.setMusicVolume(v / 100);
    if (game.state === "idle") Sound.playMusic("menu");
  });

  $("vol-sfx").addEventListener("input", (e) => {
    const v = parseInt(e.target.value, 10);
    paintSlider("vol-sfx", "val-sfx", v);
    Sound.unlock();
    Sound.setSfxVolume(v / 100);
  });
  $("vol-sfx").addEventListener("change", () => Sound.correct());

  $("btn-settings").addEventListener("click", () => ui.show("settings"));
  $("btn-settings-back").addEventListener("click", () => ui.show("modes"));
  $("btn-settings-reset").addEventListener("click", () => {
    applyGfx(DEFAULTS.gfx);
    paintSlider("vol-music", "val-music", DEFAULTS.music);
    paintSlider("vol-sfx", "val-sfx", DEFAULTS.sfx);
    Sound.unlock();
    Sound.setMusicVolume(DEFAULTS.music / 100);
    Sound.setSfxVolume(DEFAULTS.sfx / 100);
  });

  const startAudio = () => {
    Sound.unlock();
    if (game.state === "idle") Sound.playMusic("menu");
  };
  // iOS hanya mengizinkan audio dari touchend/click, jadi coba di semua event sampai audio benar-benar aktif
  const audioEvents = ["pointerdown", "pointerup", "touchend", "click", "keydown"];
  const startAudioOnce = () => {
    startAudio();
    if (Sound.isRunning && !Sound.isRunning()) return;
    audioEvents.forEach((t) => window.removeEventListener(t, startAudioOnce, true));
  };
  audioEvents.forEach((t) => window.addEventListener(t, startAudioOnce, true));
  document.addEventListener("click", (e) => { if (e.target.closest("button")) Sound.click(); });

  let lastHover = null;
  let lastHoverAt = 0;
  document.addEventListener("pointerover", (e) => {
    if (e.pointerType === "touch") return;
    const el = e.target.closest("button, input[type=range]");
    if (!el || el.disabled || el.classList.contains("locked") || el === lastHover) return;
    lastHover = el;
    const now = performance.now();
    if (now - lastHoverAt < 40) return;
    lastHoverAt = now;
    Sound.hover();
  });
  document.addEventListener("pointerout", (e) => {
    if (lastHover && !lastHover.contains(e.relatedTarget)) lastHover = null;
  });

  $("mode-bot").addEventListener("click", () => openSubjects("bot"));
  $("mode-room").addEventListener("click", () => openSubjects("room"));

  function formatDate(iso) {
    if (!iso) return "Rilis awal";
    return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }

  function renderPatchNotes() {
    $("patch-list").innerHTML = PATCH_NOTES.map((p, i) =>
      `<div class="patch-entry${i === 0 ? " latest" : ""}">` +
        `<div class="patch-head">` +
          `<span class="patch-ver">v${p.version}</span>` +
          (i === 0 ? `<span class="patch-new">TERBARU</span>` : "") +
          `<span class="patch-date">${formatDate(p.date)}</span>` +
        `</div>` +
        `<div class="patch-title">${p.title}</div>` +
        `<ul>${p.changes.map((c) => `<li>${c}</li>`).join("")}</ul>` +
      `</div>`
    ).join("");
  }

  $("ver-label").textContent = `· v${PATCH_NOTES[0].version}`;
  renderPatchNotes();
  $("btn-patch").addEventListener("click", () => ui.show("patch"));
  $("btn-patch-back").addEventListener("click", () => ui.show("modes"));

  function openSubjects(m) {
    mode = m;
    $("subjects-sub").textContent = m === "bot"
      ? "V.S. AI — pilih mapel, taklukkan 20 level!"
      : "Custom Room — duel 2 pemain dalam satu keyboard, pilih pelajaranmu!";
    ui.show("subjects");
  }

  CONFIG.subjects.forEach((s) => {
    const b = document.createElement("button");
    b.className = "subj";
    b.style.setProperty("--c", s.color);
    b.innerHTML = `<div class="ico">${s.icon}</div><div class="nm">${s.name}</div><div class="ds">${s.desc}</div>`;
    b.addEventListener("click", () => (mode === "bot" ? openLevels(s) : openSetup(s)));
    $("subject-grid").appendChild(b);
  });

  function openLevels(s) {
    subject = s;
    $("levels-title").textContent = `${s.icon} ${s.name} — V.S. AI`;
    $("levels-title").style.color = s.color;

    const cleared = getCleared(s.id);
    let totalStars = 0;
    for (let i = 1; i <= cleared; i++) totalStars += starsOf(s.id, i);
    $("levels-progress").innerHTML = `Level selesai: ${cleared} / ${TOTAL} · <span class="levels-stars">★ ${totalStars} / ${TOTAL * 3}</span>`;

    const grid = $("level-grid");
    grid.innerHTML = "";
    CONFIG.botLevels.forEach((L) => {
      const open = L.lv <= cleared + 1;
      const done = L.lv <= cleared;
      const b = document.createElement("button");
      const n = done ? starsOf(s.id, L.lv) : 0;
      b.className = "lvl" + (open ? "" : " locked") + (done ? " done" : "") + (n === 3 ? " three" : "");
      b.style.setProperty("--c", L.color);
      if (!open) b.setAttribute("aria-disabled", "true");
      b.title = open ? `${L.name} · ${L.desc}` : `Menangkan Level ${L.lv - 1} untuk membuka`;
      b.innerHTML =
        `<div class="lv">${L.lv}</div>` +
        (open ? "" : `<div class="ico">🔒</div>`) +
        (done ? `<div class="stars">${[1, 2, 3].map((k) => `<i class="${k <= n ? "on" : ""}">★</i>`).join("")}</div>` : "");
      b.addEventListener("click", () => (open ? startBot(L) : notifyLocked(b, L)));
      grid.appendChild(b);
    });
    ui.show("levels");

    const target = grid.children[Math.min(cleared, TOTAL - 1)];
    if (target) setTimeout(() => target.scrollIntoView({ block: "center" }), 30);
  }

  let toastTimer = 0;

  function showToast(text) {
    const t = $("toast");
    t.textContent = text;
    t.classList.remove("hidden", "show");
    void t.offsetWidth;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.classList.remove("show"); t.classList.add("hidden"); }, 2400);
  }

  function notifyLocked(btn, L) {
    const cleared = getCleared(subject.id);
    const need = cleared + 1;
    showToast(L.lv - 1 === need
      ? `🔒 Level ${L.lv} terkunci. Menangkan Level ${L.lv - 1} dulu untuk membukanya.`
      : `🔒 Level ${L.lv} terkunci. Selesaikan Level ${need} lebih dulu, lalu naik satu per satu.`);
    btn.classList.remove("shake");
    void btn.offsetWidth;
    btn.classList.add("shake");
    Sound.denied();
  }

  function startBot(L) {
    begin({
      subject: subject.id,
      names: [$("input-bot-name").value.trim() || "Pemain 1", `${L.icon} ${L.name}`],
      level: "easy",
      hp: 100,
      ops: L.ops,
      bot: { lv: L.lv, d: L.d, acc: L.acc, react: L.react },
    });
  }

  function currentLevel() { return $("seg-diff").querySelector(".on").dataset.v; }

  function updateHint() {
    $("diff-hint").textContent = subject.hints[currentLevel()];
  }

  function openSetup(s) {
    subject = s;
    $("setup-title").textContent = `${s.icon} ${s.name}`;
    $("setup-title").style.color = s.color;
    $("group-ops").classList.toggle("hidden", s.id !== "math");
    updateHint();
    ui.show("setup");
  }

  ["seg-diff", "seg-hp"].forEach((id) => {
    $(id).addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      [...$(id).children].forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      if (id === "seg-diff") updateHint();
    });
  });

  $("seg-ops").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) b.classList.toggle("on");
  });

  function readSettings() {
    const val = (id) => $(id).querySelector(".on").dataset.v;
    let ops = [...$("seg-ops").querySelectorAll(".on")].map((b) => b.dataset.v);
    if (ops.length === 0) ops = ["+"];
    return {
      subject: subject.id,
      names: [
        $("input-name1").value.trim() || "Pemain 1",
        $("input-name2").value.trim() || "Pemain 2",
      ],
      level: val("seg-diff"),
      hp: parseInt(val("seg-hp"), 10),
      ops,
      bot: null,
    };
  }

  game.onFinish = (winner, s) => {
    const note = $("result-note");
    const next = $("btn-next");
    const levels = $("btn-result-levels");
    const starBox = $("result-stars");
    starBox.classList.add("hidden");
    if (!s.bot) {
      note.textContent = "";
      next.classList.add("hidden");
      levels.classList.add("hidden");
      return;
    }
    levels.classList.remove("hidden");
    if (winner === 0) {
      setCleared(s.subject, s.bot.lv);
      const r = calcStars(game.hp[0], game.maxHP, game.stats[0]);
      const before = starsOf(s.subject, s.bot.lv);
      const hadRecord = !!getStars(s.subject)[s.bot.lv];
      saveStars(s.subject, s.bot.lv, r.stars);
      [...starBox.querySelectorAll(".star")].forEach((el, i) => el.classList.toggle("on", i < r.stars));
      $("star-detail").textContent = `Sisa HP ${Math.round(r.hpFrac * 100)}% · Kecepatan ${Math.round(r.speedFrac * 100)}%`;
      starBox.classList.remove("hidden");
      const record = hadRecord && r.stars > before ? " Rekor bintang baru!" : "";
      note.textContent = (s.bot.lv < TOTAL
        ? `✔ Level ${s.bot.lv} selesai! Level ${s.bot.lv + 1} terbuka.`
        : "✔ Level terakhir selesai! Kamu menamatkan semua level!") + record;
      next.classList.toggle("hidden", s.bot.lv >= TOTAL);
    } else {
      note.textContent = "Kalah. Menangkan level ini untuk membuka level berikutnya.";
      next.classList.add("hidden");
    }
  };

  function begin(settings) {
    Sound.unlock();
    paused = false;
    ui.showPause(false);
    lastSettings = settings;
    Sound.playMusic("battle");
    game.start(settings);
  }

  function toModes() {
    paused = false;
    game.stop();
    arena.reset();
    ui.showPause(false);
    Sound.playMusic("menu");
    ui.show("modes");
  }

  $("btn-start").addEventListener("click", () => begin(readSettings()));
  $("btn-subj-back").addEventListener("click", () => ui.show("modes"));
  $("btn-back").addEventListener("click", () => ui.show("subjects"));
  $("btn-levels-back").addEventListener("click", () => ui.show("subjects"));
  $("btn-rematch").addEventListener("click", () => begin(lastSettings));
  $("btn-next").addEventListener("click", () => startBot(CONFIG.botLevels[lastSettings.bot.lv]));
  $("btn-result-levels").addEventListener("click", () => {
    paused = false;
    game.stop();
    arena.reset();
    ui.showPause(false);
    Sound.playMusic("menu");
    openLevels(subject);
  });
  $("btn-menu").addEventListener("click", toModes);
  $("btn-quit").addEventListener("click", toModes);
  $("btn-resume").addEventListener("click", () => setPause(false));

  function setPause(on) {
    if (on && !game.active) return;
    paused = on;
    Sound.duck(on);
    ui.showPause(on);
  }

  window.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    if (e.target && e.target.tagName === "INPUT") return;

    if (e.code === "Escape" || e.code === "KeyP") {
      setPause(!paused);
      return;
    }
    if (paused) return;
    if (game.handleKey(e.code)) e.preventDefault();
  });

  document.addEventListener("visibilitychange", () => { if (document.hidden) setPause(true); });

  // Kontrol sentuh / klik: ketuk kartu jawaban.
  // Mode V.S. AI: semua ketukan = Pemain 1. Mode 2 pemain: sisi kiri kartu = Pemain 1, sisi kanan = Pemain 2.
  $("options").addEventListener("pointerdown", (e) => {
    if (paused) return;
    const card = e.target.closest(".opt");
    if (!card) return;
    const idx = [...card.parentElement.children].indexOf(card);
    let p = 0;
    if (!card.parentElement.classList.contains("vsbot")) {
      const r = card.getBoundingClientRect();
      p = e.clientX < r.left + r.width / 2 ? 0 : 1;
    }
    if (game.tap(p, idx)) e.preventDefault();
  });

  $("btn-pause-touch").addEventListener("click", () => setPause(!paused));

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (game.state === "idle") {
      requestAnimationFrame(loop);
      return;
    }
    if (!paused) {
      game.update(dt);
      arena.update(dt);
    } else {
      arena.render();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();