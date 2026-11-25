import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { CONFIG } from "./config.js";


const THEMES = {
  math: {
    sky: ["#07111a", "#12252e", "#3a4a47", "#a8704a", "#d9a066"], fog: 0x17252b,
    sun: 0xf2c58a, sunOpacity: 0.55, ridges: [0x31464a, 0x24373c, 0x182a30],
    ring: [0x8fa0ff, 0xe0c58a], arcs: [0x6fb7a8, 0xe0c58a], dust: 0xffd9a0, pillar: 0x20292c,
    amb: 0xc4d0d2, hemi: 0xd6e4e8,
    symbols: ["+", "−", "×", "÷", "=", "π", "√", "7", "3", "9", "%"], symColors: ["#e8d9a8", "#6fb7a8", "#e09a5c", "#b9d3d6"],
    floor: { pattern: "grid", base: "#0a1030", line: "rgba(90,130,255,0.25)", major: "rgba(110,150,255,0.95)", dot: "#9fb4ff", side: 0x0b1030, emissive: 0x3350ff },
    prop: "math",
  },
  ipa: {
    sky: ["#031210", "#0a2a25", "#14463d", "#2a8a6a", "#8fe8b0"], fog: 0x0d2a26,
    sun: 0x9dffd0, sunOpacity: 0.35, ridges: [0x16463f, 0x0f332e, 0x0a2420],
    ring: [0x7fe0c0, 0xb6ff8a], arcs: [0x4fd6b0, 0xb6ff8a], dust: 0xb6ffd8, pillar: 0x12302c,
    amb: 0xbfeede, hemi: 0xcff5e6,
    symbols: ["⚛", "H₂O", "CO₂", "⚡", "🧬", "🔬", "🌱", "🧪"], symColors: ["#b6ffd8", "#7fe0c0", "#d6ff9a", "#8fe8b0"],
    floor: { pattern: "hex", base: "#06201c", line: "rgba(110,230,190,0.45)", major: "rgba(190,255,220,0.9)", dot: "#b6ffd8", side: 0x08241f, emissive: 0x1fbf8a },
    prop: "atom",
  },
  ips: {
    sky: ["#140d08", "#2a1a10", "#5a3a22", "#b87a3c", "#f0c27a"], fog: 0x2a1d12,
    sun: 0xffd27a, sunOpacity: 0.6, ridges: [0x5a4128, 0x42301d, 0x2e2114],
    ring: [0xf0c27a, 0xd9a05a], arcs: [0xd9a05a, 0xf4e3b0], dust: 0xffe0a8, pillar: 0x3a2b1c,
    amb: 0xe8d6bc, hemi: 0xf0e0c8,
    symbols: ["⚖", "📜", "🏛", "🪙", "★", "🗳", "📖", "🌐"], symColors: ["#f0c27a", "#e8d9a8", "#d9a05a"],
    floor: { pattern: "checker", base: "#1a120b", line: "rgba(240,194,122,0.5)", major: "rgba(244,227,176,0.95)", dot: "#f0c27a", side: 0x2a1d12, emissive: 0xb8731f },
    prop: "temple",
  },
  geo: {
    sky: ["#0a2a4a", "#1b5b8a", "#4fa3d1", "#9ad4ea", "#e8f6f8"], fog: 0x2b5f80,
    sun: 0xfff2c0, sunOpacity: 0.8, ridges: [0x3d7c8c, 0x2c6070, 0x1d4756],
    ring: [0xbfe6ff, 0x4fc3f7], arcs: [0x4fc3f7, 0xffffff], dust: 0xdff6ff, pillar: 0x234a63,
    amb: 0xd6ecff, hemi: 0xe4f4ff,
    symbols: ["🌍", "🧭", "🗺", "🌋", "🌊", "⛰", "🏝", "❄"], symColors: ["#ffffff", "#bfe6ff"],
    floor: { pattern: "globe", base: "#0b2c47", line: "rgba(140,210,255,0.4)", major: "rgba(210,240,255,0.95)", dot: "#ffffff", side: 0x0b2c47, emissive: 0x2a8fd8 },
    prop: "globe",
  },
  budaya: {
    sky: ["#1a0a14", "#3a1424", "#7a2a30", "#d0602e", "#f5b05a"], fog: 0x2e1118,
    sun: 0xffb347, sunOpacity: 0.65, ridges: [0x5a2a26, 0x421d1d, 0x2c1214],
    ring: [0xf5b05a, 0xe0553b], arcs: [0xe0553b, 0xffd27a], dust: 0xffc27a, pillar: 0x3a1a1a,
    amb: 0xf0d4c0, hemi: 0xffe4cc,
    symbols: ["🎭", "🥁", "🏯", "🎶", "🌺", "🗿", "⛩", "🐚"], symColors: ["#ffd27a", "#e0553b"],
    floor: { pattern: "batik", base: "#1c0b10", line: "rgba(245,176,90,0.5)", major: "rgba(255,210,122,0.95)", dot: "#ffd27a", side: 0x2a1015, emissive: 0xc0452a },
    prop: "candi",
  },
  indonesia: {
    sky: ["#14080a", "#34121a", "#7a2230", "#c8453a", "#f2a27a"], fog: 0x2e1015,
    sun: 0xff8a6a, sunOpacity: 0.6, ridges: [0x5a2230, 0x421923, 0x2c1018],
    ring: [0xff8a6a, 0xf2d0a0], arcs: [0xe0553b, 0xffe0c0], dust: 0xffc4a8, pillar: 0x3a1820,
    amb: 0xf0d0c8, hemi: 0xffe0d4,
    symbols: ["A", "B", "ng", "ny", "“ ”", "?", "!", "📖", "✒", "Aa"], symColors: ["#ffe0c0", "#ff8a6a", "#f2d0a0"],
    floor: { pattern: "checker", base: "#1a0a0e", line: "rgba(255,138,106,0.5)", major: "rgba(255,224,192,0.95)", dot: "#ffe0c0", side: 0x2a1015, emissive: 0xc0352a },
    prop: "temple",
  },
  inggris: {
    sky: ["#060b1a", "#101c3a", "#26407a", "#5a78c8", "#b8c8f2"], fog: 0x14224a,
    sun: 0xd0dcff, sunOpacity: 0.5, ridges: [0x26366a, 0x1a284e, 0x101a38],
    ring: [0x9ab4ff, 0xe0e8ff], arcs: [0x6f8cff, 0xffffff], dust: 0xd0dcff, pillar: 0x182444,
    amb: 0xd0d8f0, hemi: 0xe0e8ff,
    symbols: ["A", "Z", "the", "is", "and", "?", "“ ”", "ABC", "ing", "ed"], symColors: ["#ffffff", "#9ab4ff", "#d0dcff"],
    floor: { pattern: "grid", base: "#0a1030", line: "rgba(130,160,255,0.3)", major: "rgba(200,215,255,0.95)", dot: "#d0dcff", side: 0x0b1030, emissive: 0x3a58ff },
    prop: "globe",
  },
  jepang: {
    sky: ["#14060e", "#3a1028", "#7a2a58", "#d05a8a", "#ffc0d4"], fog: 0x30112a,
    sun: 0xff6a7a, sunOpacity: 0.75, ridges: [0x5a2248, 0x421836, 0x2c1024],
    ring: [0xff9ab8, 0xffe0e8], arcs: [0xff6a8a, 0xffffff], dust: 0xffc0d4, pillar: 0x3a1430,
    amb: 0xf0d0e0, hemi: 0xffe0ec,
    symbols: ["あ", "い", "う", "カ", "ン", "日", "本", "桜", "山", "水"], symColors: ["#ffe0e8", "#ff9ab8", "#ffc0d4"],
    floor: { pattern: "batik", base: "#1c0a14", line: "rgba(255,154,184,0.5)", major: "rgba(255,224,232,0.95)", dot: "#ffe0e8", side: 0x2a1020, emissive: 0xd03a6a },
    prop: "candi",
  },
};

export class Arena {
  constructor(container) {
    this.container = container;
    this.time = 0;
    this.tweens = [];
    this.particles = [];
    this.temp = new Set();
    this.spinners = [];
    this.pillars = [];
    this.shake = 0;
    this.winner = null;
    this.confettiTimer = 0;
    this.stunned = [0, 0];

    this.scene = new THREE.Scene();
    this.scene.background = this.makeSky(THEMES.math.sky);
    this.scene.fog = new THREE.Fog(0x17252b, 30, 95);

    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 250);
    this.camBase = new THREE.Vector3(0, 3.8, 12.5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(this.renderer.domElement);

    this.pGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);

    this.buildLights();
    this.buildFloor();
    this.buildDecor();
    this.buildStars();
    this.buildNebula();
    this.buildSymbols();
    this.buildDust();

    this.fighters = [
      this.createFighter(CONFIG.colors.p1, -4.2, Math.PI / 2),
      this.createFighter(CONFIG.colors.p2, 4.2, -Math.PI / 2),
    ];
    this.fighters.forEach((f) => this.scene.add(f.group));
    this.auras = this.fighters.map((f) => this.createAura(f));

    this.boltLight = new THREE.PointLight(0xffffff, 0, 16);
    this.scene.add(this.boltLight);

    this.buildProps();
    this.setTheme("math");
    this.setQuality("medium");
    window.addEventListener("resize", () => this.resize());
  }

  setQuality(level) {
    const dpr = window.devicePixelRatio || 1;
    const table = {
      low: { pr: 1, bloom: false, shadow: false, sm: 512, msaa: 0, decor: false, soft: false },
      medium: { pr: Math.min(dpr, 1.25), bloom: true, shadow: true, sm: 1024, msaa: 2, decor: true, soft: false },
      high: { pr: Math.min(dpr, 2), bloom: true, shadow: true, sm: 2048, msaa: 4, decor: true, soft: true },
    };
    const q = table[level] || table.medium;
    this.quality = table[level] ? level : "medium";

    const r = this.renderer;
    r.setPixelRatio(q.pr);
    r.shadowMap.enabled = q.shadow;
    r.shadowMap.type = q.soft ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    this.sun.castShadow = q.shadow;
    if (this.sun.shadow.map) {
      this.sun.shadow.map.dispose();
      this.sun.shadow.map = null;
    }
    this.sun.shadow.mapSize.set(q.sm, q.sm);
    this.scene.traverse((o) => {
      if (o.material) [].concat(o.material).forEach((m) => { m.needsUpdate = true; });
    });

    this.dust.visible = q.decor;
    this.stars.visible = q.decor;
    this.symbols.forEach((s) => { s.visible = q.decor; });

    this.setupPost(q);
    this.resize();
  }

  setupPost(q) {
    if (this.composer) {
      try {
        this.composer.renderTarget1.dispose();
        this.composer.renderTarget2.dispose();
      } catch (e) {}
    }
    this.composer = null;
    if (!q.bloom) return;
    try {
      const w = this.container.clientWidth || window.innerWidth;
      const h = this.container.clientHeight || window.innerHeight;
      const target = THREE.WebGLMultisampleRenderTarget ? new THREE.WebGLMultisampleRenderTarget(w, h) : undefined;
      if (target) target.samples = q.msaa;
      const composer = new EffectComposer(this.renderer, target);
      if (composer.setPixelRatio) composer.setPixelRatio(q.pr);
      composer.addPass(new RenderPass(this.scene, this.camera));
      this.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.85, 0.6, 0.55);
      composer.addPass(this.bloom);
      this.composer = composer;
    } catch (err) {
      console.warn("Bloom dinonaktifkan:", err);
      this.composer = null;
    }
  }

  buildLights() {
    this.ambient = new THREE.AmbientLight(0xc4d0d2, 0.5);
    this.hemi = new THREE.HemisphereLight(0xd6e4e8, 0x1a130e, 0.45);
    this.scene.add(this.ambient, this.hemi);

    const sun = new THREE.DirectionalLight(0xffffff, 0.95);
    this.sun = sun;
    sun.position.set(5, 11, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.bias = -0.0005;
    const sc = sun.shadow.camera;
    sc.left = -12; sc.right = 12; sc.top = 12; sc.bottom = -12; sc.near = 1; sc.far = 40;
    this.scene.add(sun);

    const l1 = new THREE.PointLight(CONFIG.colors.p1, 1.5, 26);
    l1.position.set(-7, 4, 3);
    const l2 = new THREE.PointLight(CONFIG.colors.p2, 1.5, 26);
    l2.position.set(7, 4, 3);
    this.scene.add(l1, l2);
  }

  makeFloorTexture(f) {
    const N = 1024;
    const c = document.createElement("canvas");
    c.width = c.height = N;
    const g = c.getContext("2d");
    g.fillStyle = f.base;
    g.fillRect(0, 0, N, N);
    g.lineWidth = 1.5;
    g.strokeStyle = f.line;
    const mid = N / 2;

    if (f.pattern === "grid") {
      for (let i = 0; i <= N; i += 32) {
        g.beginPath(); g.moveTo(i, 0); g.lineTo(i, N); g.stroke();
        g.beginPath(); g.moveTo(0, i); g.lineTo(N, i); g.stroke();
      }
      g.strokeStyle = f.major; g.lineWidth = 4;
      for (let i = 0; i <= N; i += 256) {
        g.beginPath(); g.moveTo(i, 0); g.lineTo(i, N); g.stroke();
        g.beginPath(); g.moveTo(0, i); g.lineTo(N, i); g.stroke();
      }
      g.fillStyle = f.dot;
      for (let x = 0; x <= N; x += 256) for (let y = 0; y <= N; y += 256) { g.beginPath(); g.arc(x, y, 8, 0, Math.PI * 2); g.fill(); }
    } else if (f.pattern === "hex") {
      const r = 44;
      const w = r * 1.5;
      const h = Math.sqrt(3) * r;
      g.lineWidth = 2.5;
      for (let col = -1; col * w < N + r; col++) {
        for (let row = -1; row * h < N + h; row++) {
          const cx = col * w;
          const cy = row * h + (col % 2 ? h / 2 : 0);
          g.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (Math.PI / 3) * k;
            const px = cx + r * 0.94 * Math.cos(a);
            const py = cy + r * 0.94 * Math.sin(a);
            k ? g.lineTo(px, py) : g.moveTo(px, py);
          }
          g.closePath();
          g.stroke();
          if ((col * 7 + row * 3) % 11 === 0) { g.fillStyle = f.line; g.fill(); }
        }
      }
      g.fillStyle = f.dot;
      g.beginPath(); g.arc(mid, mid, 16, 0, Math.PI * 2); g.fill();
    } else if (f.pattern === "checker") {
      const t = 128;
      for (let x = 0; x < N / t; x++) for (let y = 0; y < N / t; y++) {
        g.fillStyle = (x + y) % 2 ? "rgba(240,194,122,0.10)" : "rgba(0,0,0,0.18)";
        g.fillRect(x * t, y * t, t, t);
      }
      g.lineWidth = 2;
      for (let i = 0; i <= N; i += t) {
        g.beginPath(); g.moveTo(i, 0); g.lineTo(i, N); g.stroke();
        g.beginPath(); g.moveTo(0, i); g.lineTo(N, i); g.stroke();
      }
      g.strokeStyle = f.major; g.lineWidth = 5;
      for (const h of [128, 256]) g.strokeRect(mid - h, mid - h, h * 2, h * 2);
      g.fillStyle = f.dot;
      g.beginPath(); g.moveTo(mid, mid - 40); g.lineTo(mid + 40, mid); g.lineTo(mid, mid + 40); g.lineTo(mid - 40, mid); g.closePath(); g.fill();
    } else if (f.pattern === "globe") {
      g.lineWidth = 2;
      for (let r = 64; r <= mid; r += 64) { g.beginPath(); g.arc(mid, mid, r, 0, Math.PI * 2); g.stroke(); }
      for (let k = 0; k < 12; k++) {
        const a = (Math.PI / 6) * k;
        g.beginPath(); g.moveTo(mid, mid); g.lineTo(mid + Math.cos(a) * mid * 1.45, mid + Math.sin(a) * mid * 1.45); g.stroke();
      }
      g.strokeStyle = f.major; g.lineWidth = 4;
      g.beginPath(); g.arc(mid, mid, 256, 0, Math.PI * 2); g.stroke();
      g.fillStyle = f.dot;
      g.beginPath();
      for (let k = 0; k < 8; k++) {
        const a = (Math.PI / 4) * k - Math.PI / 2;
        const rr = k % 2 ? 30 : 90;
        g.lineTo(mid + rr * Math.cos(a), mid + rr * Math.sin(a));
      }
      g.closePath(); g.fill();
    } else {
      const t = 128;
      g.lineWidth = 2.5;
      for (let x = 0; x <= N + t; x += t) for (let y = 0; y <= N + t; y += t) {
        g.beginPath(); g.arc(x, y, t / 2, 0, Math.PI * 2); g.stroke();
        g.beginPath(); g.arc(x + t / 2, y + t / 2, t / 2, 0, Math.PI * 2); g.stroke();
        g.fillStyle = f.line;
        g.beginPath(); g.arc(x + t / 2, y, 5, 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = f.dot;
      g.beginPath(); g.arc(mid, mid, 18, 0, Math.PI * 2); g.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 8;
    return tex;
  }

  buildFloor() {
    const tex = this.makeFloorTexture(THEMES.math.floor);
    const side = new THREE.MeshStandardMaterial({ color: 0x0b1030, roughness: 0.4, metalness: 0.8 });
    this.floorSide = side;
    const top = new THREE.MeshStandardMaterial({
      map: tex, emissiveMap: tex, emissive: 0x3350ff, emissiveIntensity: 0.7, roughness: 0.3, metalness: 0.7,
    });
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(10, 10.4, 0.5, 96), [side, top, side]);
    this.floorTop = top;
    floor.position.y = -0.25;
    floor.receiveShadow = true;
    this.scene.add(floor);

    this.ringMats = [];
    this.arcMats = [];
    const ring = (r, tube, color) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 12, 128), new THREE.MeshBasicMaterial({ color }));
      m.rotation.x = Math.PI / 2;
      m.position.y = 0.02;
      this.scene.add(m);
      this.ringMats.push(m.material);
    };
    ring(10, 0.1, 0x8fa0ff);
    ring(10.55, 0.05, 0xe0c58a);

    const arcs = (radius, count, gap, color, speed) => {
      const g = new THREE.Group();
      const len = (Math.PI * 2) / count - gap;
      const mats = [];
      for (let i = 0; i < count; i++) {
        const m = new THREE.Mesh(
          new THREE.RingGeometry(radius, radius + 0.09, 24, 1, (i * Math.PI * 2) / count, len),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
        );
        g.add(m);
        mats.push(m.material);
      }
      this.arcMats.push(mats);
      g.rotation.x = -Math.PI / 2;
      g.position.y = 0.04;
      this.scene.add(g);
      this.spinners.push({ g, speed });
    };
    arcs(8.6, 6, 0.5, 0x6fb7a8, 0.25);
    arcs(7.4, 4, 0.7, 0xe0c58a, -0.4);

    [[-4.2, CONFIG.colors.p1], [4.2, CONFIG.colors.p2]].forEach(([x, c]) => {
      const pad = new THREE.Mesh(
        new THREE.CircleGeometry(1.7, 48),
        new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.3 })
      );
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(x, 0.03, 0);
      this.scene.add(pad);

      const padRing = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.05, 8, 64), new THREE.MeshBasicMaterial({ color: c }));
      padRing.rotation.x = Math.PI / 2;
      padRing.position.set(x, 0.04, 0);
      this.scene.add(padRing);
    });
  }

  buildDecor() {
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x20292c, roughness: 0.35, metalness: 0.8 });
    this.pillarMat = pillarMat;
    const n = 9;
    const c1 = new THREE.Color(CONFIG.colors.p1);
    const c2 = new THREE.Color(CONFIG.colors.p2);
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (0.1 + (0.8 * i) / (n - 1));
      const x = Math.cos(a) * 15;
      const z = -Math.sin(a) * 11 - 3;
      const col = c1.clone().lerp(c2, i / (n - 1));

      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 7, 10), pillarMat);
      p.position.set(x, 3.5, z);
      this.scene.add(p);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 0.7), new THREE.MeshBasicMaterial({ color: col }));
      cap.position.set(x, 7.1, z);
      this.scene.add(cap);

      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 14, 8, 1, true),
        new THREE.MeshBasicMaterial({
          color: col, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false,
        })
      );
      beam.position.set(x, 14, z);
      this.scene.add(beam);
      this.pillars.push({ beam, phase: i });
    }

  }

  buildStars() {
    const n = 260;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 40 + Math.random() * 50;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = Math.abs(r * Math.cos(ph)) * 0.8 + 2;
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th) - 10;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.stars = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, sizeAttenuation: true, fog: false, transparent: true, opacity: 0.55 })
    );
    this.scene.add(this.stars);
  }

  makeSky(stops) {
    const cv = document.createElement("canvas");
    cv.width = 8; cv.height = 512;
    const g = cv.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, 512);
    const pos = [0, 0.45, 0.72, 0.86, 1];
    stops.forEach((c, i) => grad.addColorStop(pos[i], c));
    g.fillStyle = grad;
    g.fillRect(0, 0, 8, 512);
    const t = new THREE.CanvasTexture(cv);
    return t;
  }

  buildNebula() {
    const sun = new THREE.Mesh(
      new THREE.CircleGeometry(7, 64),
      new THREE.MeshBasicMaterial({ color: 0xf2c58a, transparent: true, opacity: 0.55, fog: false })
    );
    sun.position.set(14, 4.5, -70);
    this.scene.add(sun);
    this.sunDisc = sun;
    this.ridges = [];

    const layers = [
      [-62, 0x31464a, 13, 0.035, 1.3],
      [-50, 0x24373c, 10, 0.05, 2.7],
      [-40, 0x182a30, 7, 0.07, 4.1],
    ];
    layers.forEach(([z, color, amp, freq, seed]) => {
      const shape = new THREE.Shape();
      shape.moveTo(-110, -6);
      for (let x = -110; x <= 110; x += 2) {
        const h = amp * (0.55 + 0.3 * Math.sin(x * freq + seed) + 0.2 * Math.sin(x * freq * 2.7 + seed * 2) + 0.1 * Math.sin(x * freq * 6.1 + seed * 3));
        shape.lineTo(x, h - 2);
      }
      shape.lineTo(110, -6);
      shape.closePath();
      const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color, fog: false }));
      m.position.set(0, 0, z);
      this.scene.add(m);
      this.ridges.push(m);
    });
  }

  symbolTexture(ch, color) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 128;
    const g = cv.getContext("2d");
    g.fillStyle = color;
    g.font = ch.length > 1 ? "bold 56px Arial" : "bold 96px Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(ch, 64, 70);
    return new THREE.CanvasTexture(cv);
  }

  buildProps() {
    this.props = {};
    const basic = (color, extra) => new THREE.MeshBasicMaterial(Object.assign({ color, fog: false }, extra || {}));
    const mk = (name) => { const g = new THREE.Group(); g.visible = false; this.scene.add(g); this.props[name] = g; return g; };

    const math = mk("math");
    math.position.set(0, 9.5, -34);
    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(5.2, 0), basic(0xe8d9a8, { wireframe: true, transparent: true, opacity: 0.35 }));
    const ico2 = new THREE.Mesh(new THREE.OctahedronGeometry(3, 0), basic(0x6fb7a8, { wireframe: true, transparent: true, opacity: 0.45 }));
    math.add(ico, ico2);
    math.userData.spin = [ico, ico2];

    const atom = mk("atom");
    atom.position.set(0, 9.5, -32);
    atom.add(new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 16), basic(0xb6ffd8)));
    const rings = [];
    [[0, 0], [Math.PI / 3, 0], [-Math.PI / 3, 0]].forEach(([rx], i) => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(5.4, 0.07, 8, 96), basic(0x7fe0c0, { transparent: true, opacity: 0.7 }));
      r.rotation.set(rx, i * 1.05, 0);
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8), basic(0xd6ff9a));
      e.position.set(5.4, 0, 0);
      r.add(e);
      atom.add(r);
      rings.push(r);
    });
    atom.userData.rings = rings;

    const temple = mk("temple");
    temple.position.set(0, 0, -34);
    const stone = basic(0x6b4d2e);
    const stone2 = basic(0x56402a);
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(26, 1, 6), stone2); step1.position.y = 0.5;
    const step2 = new THREE.Mesh(new THREE.BoxGeometry(23, 1, 5), stone); step2.position.y = 1.5;
    temple.add(step1, step2);
    for (let i = 0; i < 7; i++) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 8, 12), stone);
      col.position.set(-9 + i * 3, 6, 0);
      temple.add(col);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(22.5, 1, 4.6), stone2); beam.position.y = 10.5;
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 4.6, 3), stone);
    ped.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    ped.scale.set(1, 1, 5.2);
    ped.position.y = 12.7;
    temple.add(beam, ped);

    const globe = mk("globe");
    globe.position.set(0, 9.5, -32);
    const wire = new THREE.Mesh(new THREE.SphereGeometry(6, 28, 18), basic(0xbfe6ff, { wireframe: true, transparent: true, opacity: 0.45 }));
    const core = new THREE.Mesh(new THREE.SphereGeometry(5.85, 24, 16), basic(0x1b5b8a, { transparent: true, opacity: 0.55 }));
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(8, 0.06, 8, 96), basic(0xffffff, { transparent: true, opacity: 0.6 }));
    orbit.rotation.x = Math.PI / 2.6;
    globe.add(core, wire, orbit);
    globe.userData.spin = [wire, core];

    const candi = mk("candi");
    candi.position.set(0, 0, -34);
    const rock = basic(0x4a2220);
    const rock2 = basic(0x3a1a19);
    const tiers = [[24, 2.4, 14], [19, 2.4, 11], [14, 2.2, 8]];
    let y = 0;
    tiers.forEach(([w, h, d], i) => {
      const t = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), i % 2 ? rock2 : rock);
      t.position.y = y + h / 2;
      candi.add(t);
      y += h;
    });
    [-5, 0, 5].forEach((x, i) => {
      const bell = new THREE.Mesh(new THREE.SphereGeometry(i === 1 ? 2.4 : 1.7, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), rock);
      bell.position.set(x, y, 0);
      candi.add(bell);
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.3, i === 1 ? 4 : 2.6, 8), rock2);
      spire.position.set(x, y + (i === 1 ? 4.4 : 3), 0);
      candi.add(spire);
    });
    [-17, 17].forEach((x) => {
      const t = new THREE.Mesh(new THREE.ConeGeometry(3, 8, 4), rock2);
      t.position.set(x, 4, 0);
      t.rotation.y = Math.PI / 4;
      candi.add(t);
    });
  }

  setTheme(id) {
    const th = THEMES[id] || THEMES.math;
    this.themeId = THEMES[id] ? id : "math";

    if (this.scene.background && this.scene.background.dispose) this.scene.background.dispose();
    this.scene.background = this.makeSky(th.sky);
    this.scene.fog.color.setHex(th.fog);

    this.sunDisc.material.color.setHex(th.sun);
    this.sunDisc.material.opacity = th.sunOpacity;
    this.ridges.forEach((m, i) => m.material.color.setHex(th.ridges[i]));

    this.ambient.color.setHex(th.amb);
    this.hemi.color.setHex(th.hemi);
    this.pillarMat.color.setHex(th.pillar);
    this.dust.material.color.setHex(th.dust);
    this.ringMats.forEach((m, i) => m.color.setHex(th.ring[i % th.ring.length]));
    this.arcMats.forEach((mats, i) => mats.forEach((m) => m.color.setHex(th.arcs[i % th.arcs.length])));

    const f = th.floor;
    if (this.floorTop.map) this.floorTop.map.dispose();
    const tex = this.makeFloorTexture(f);
    this.floorTop.map = tex;
    this.floorTop.emissiveMap = tex;
    this.floorTop.emissive.setHex(f.emissive);
    this.floorTop.needsUpdate = true;
    this.floorSide.color.setHex(f.side);

    this.symbols.forEach((sp, i) => {
      if (sp.material.map) sp.material.map.dispose();
      sp.material.map = this.symbolTexture(th.symbols[i % th.symbols.length], th.symColors[i % th.symColors.length]);
      sp.material.needsUpdate = true;
    });

    Object.keys(this.props).forEach((k) => { this.props[k].visible = k === th.prop; });
  }

  buildSymbols() {
    this.symbols = [];
    const th = THEMES.math;
    for (let i = 0; i < 18; i++) {
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: this.symbolTexture(th.symbols[i % th.symbols.length], th.symColors[i % th.symColors.length]), transparent: true, opacity: 0.3, fog: false })
      );
      const sz = 1.4 + Math.random() * 1.6;
      sp.scale.set(sz, sz, 1);
      sp.position.set((Math.random() - 0.5) * 36, 1 + Math.random() * 11, -6 - Math.random() * 12);
      sp.userData = { baseY: sp.position.y, speed: 0.3 + Math.random() * 0.6, phase: Math.random() * 6 };
      this.scene.add(sp);
      this.symbols.push(sp);
    }
  }

  buildDust() {
    const n = 160;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = Math.random() * 9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.dust = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0xffd9a0, size: 0.09, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending,
      })
    );
    this.scene.add(this.dust);
  }

  createFighter(color, x, faceY) {
    const group = new THREE.Group();
    group.position.set(x, 0, 0);
    group.rotation.order = "YXZ";
    group.rotation.y = faceY;

    const mats = [];
    const std = (c, metal = 0.55, rough = 0.32) => {
      const m = new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: metal, emissive: 0x000000 });
      mats.push(m);
      return m;
    };
    const glow = (c) => new THREE.MeshBasicMaterial({ color: c });
    const box = (w, h, d, material, px, py, pz, parent) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      m.position.set(px, py, pz);
      m.castShadow = true;
      (parent || group).add(m);
      return m;
    };

    const bodyMat = std(color);
    const darkMat = std(0x232a5c, 0.7, 0.35);
    const trimMat = std(0xdfe6ff, 0.85, 0.2);

    box(1.5, 1.6, 0.95, bodyMat, 0, 1.75, 0);
    box(1.1, 0.3, 0.8, darkMat, 0, 0.98, 0);
    box(1.56, 0.12, 1.0, trimMat, 0, 2.58, 0);
    box(0.5, 0.95, 0.55, darkMat, -0.4, 0.5, 0);
    box(0.5, 0.95, 0.55, darkMat, 0.4, 0.5, 0);
    box(0.6, 0.2, 0.8, trimMat, -0.4, 0.1, 0.1);
    box(0.6, 0.2, 0.8, trimMat, 0.4, 0.1, 0.1);
    box(1.05, 1.1, 0.35, darkMat, 0, 1.9, -0.65);
    box(0.2, 0.7, 0.1, glow(color), -0.28, 1.9, -0.85);
    box(0.2, 0.7, 0.1, glow(color), 0.28, 1.9, -0.85);

    const head = box(1.15, 0.95, 0.95, bodyMat, 0, 3.15, 0);
    box(0.95, 0.34, 0.06, glow(0xffffff), 0, 3.2, 0.5);
    box(0.12, 0.5, 0.7, trimMat, -0.64, 0, 0, head);
    box(0.12, 0.5, 0.7, trimMat, 0.64, 0, 0, head);
    box(0.05, 0.5, 0.05, darkMat, 0, 3.85, 0);

    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), glow(color));
    ball.position.set(0, 4.15, 0);
    group.add(ball);

    const core = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), glow(color));
    core.position.set(0, 1.95, 0.5);
    group.add(core);
    const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.04, 8, 32), trimMat);
    coreRing.position.set(0, 1.95, 0.5);
    group.add(coreRing);

    const makeArm = (sx) => {
      const pivot = new THREE.Group();
      pivot.position.set(sx * 1.0, 2.45, 0);
      const pad = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 12), bodyMat);
      pad.position.set(0, 0.05, 0);
      pad.castShadow = true;
      pivot.add(pad);
      box(0.36, 1.15, 0.36, darkMat, 0, -0.55, 0, pivot);
      box(0.4, 0.1, 0.4, glow(color), 0, -0.9, 0, pivot);
      box(0.42, 0.42, 0.42, bodyMat, 0, -1.2, 0, pivot);
      group.add(pivot);
      return pivot;
    };
    const armL = makeArm(-1);
    const armR = makeArm(1);

    return {
      group, head, armL, armR, mats, core,
      baseX: x,
      dir: x < 0 ? 1 : -1,
      color,
      phase: Math.random() * 6,
      dead: false,
    };
  }

  createAura(f) {
    const g = new THREE.Group();
    const mat = (o) => new THREE.MeshBasicMaterial({
      color: 0xffd34d, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 4.8, 32, 1, true), mat(0.18));
    cyl.position.y = 2.4;
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.05, 8, 48), mat(0.9));
    r1.rotation.x = Math.PI / 2;
    r1.position.y = 0.1;
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.04, 8, 48), mat(0.7));
    r2.rotation.x = Math.PI / 2;
    g.add(cyl, r1, r2);
    g.position.set(f.baseX, 0, 0);
    g.visible = false;
    this.scene.add(g);
    return { g, cyl, r1, r2, mats: [cyl.material, r1.material, r2.material] };
  }

  setAura(idx, c) {
    const a = this.auras && this.auras[idx];
    if (!a) return;
    a.g.visible = c >= 2;
    const col = c >= 6 ? 0xff7a45 : c >= 4 ? 0xffb347 : 0xffd34d;
    a.mats.forEach((m) => m.color.setHex(col));
    a.cyl.material.opacity = 0.1 + 0.03 * Math.min(c, 8);
  }

  tween(dur, fn, done) {
    this.tweens.push({ t: 0, dur, fn, done });
  }

  addTemp(o) {
    this.temp.add(o);
    this.scene.add(o);
  }

  dropTemp(o) {
    if (!this.temp.has(o)) return;
    this.temp.delete(o);
    this.scene.remove(o);
    o.traverse((n) => {
      if (n.geometry) n.geometry.dispose();
      if (n.material) n.material.dispose();
    });
  }

  flash(f, hex, strength, dur) {
    this.tween(dur, (k) => {
      const v = strength * (1 - k);
      f.mats.forEach((m) => { m.emissive.setHex(hex); m.emissiveIntensity = v; });
    }, () => f.mats.forEach((m) => { m.emissiveIntensity = 0; }));
  }

  shockwave(x, y, z, color, vertical) {
    const mat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const m = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.65, 48), mat);
    m.position.set(x, y, z);
    if (!vertical) m.rotation.x = -Math.PI / 2;
    this.addTemp(m);
    this.tween(0.5, (k) => {
      const s = 1 + k * 9;
      m.scale.set(s, s, 1);
      mat.opacity = 0.9 * (1 - k);
    }, () => this.dropTemp(m));
  }

  attack(from, damage, onHit) {
    const f = this.fighters[from];
    const t = this.fighters[1 - from];
    const big = 0.8 + damage / 35;
    const col = f.color;

    this.tween(0.22, (k) => {
      f.armR.rotation.x = -Math.PI / 2 * k;
      f.group.position.x = f.baseX + f.dir * 0.6 * k;
    }, () => {
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.28 * big, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      const glowMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.55 * big, 16, 16),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55 })
      );
      orb.add(glowMesh);
      this.addTemp(orb);

      const sx = f.group.position.x + f.dir * 1.4, sy = 2.35;
      const ex = t.group.position.x, ey = 2.0;

      this.boltLight.color.setHex(col);
      this.boltLight.intensity = 2.4;

      this.tween(0.42, (k) => {
        orb.position.set(sx + (ex - sx) * k, sy + (ey - sy) * k + Math.sin(Math.PI * k) * 0.7, 0);
        orb.rotation.x += 0.3;
        this.boltLight.position.copy(orb.position);
        if (Math.random() < 0.7) this.burst(orb.position, col, 1, 1.2, 0.5);
      }, () => {
        this.dropTemp(orb);
        this.boltLight.intensity = 0;
        this.hitReact(1 - from, damage, col);
        if (onHit) onHit();
      });

      this.tween(0.5, (k) => {
        f.armR.rotation.x = -Math.PI / 2 * (1 - k);
        f.group.position.x = f.baseX + f.dir * 0.6 * (1 - k);
      });
    });
  }

  hitReact(idx, damage, col) {
    const f = this.fighters[idx];
    const power = Math.min(1.6, 0.6 + damage / 30);
    this.shake = Math.max(this.shake, 0.35 * power);
    this.flash(f, 0xff2233, 1.2, 0.5);
    this.burst(new THREE.Vector3(f.group.position.x, 2.1, 0.3), 0xffd34d, 26, 7 * power, 1);
    this.burst(new THREE.Vector3(f.group.position.x, 2.1, 0.3), 0xffffff, 10, 4, 1);
    this.shockwave(f.group.position.x, 2.1, 0.6, col || 0xffffff, true);
    this.shockwave(f.group.position.x, 0.06, 0, 0xffffff, false);
    this.tween(0.45, (k) => {
      f.group.position.x = f.baseX - f.dir * 0.9 * power * Math.sin(Math.PI * k);
      f.group.rotation.x = -0.3 * Math.sin(Math.PI * k);
    }, () => { f.group.rotation.x = 0; });
  }

  stun(idx, seconds) {
    this.stunned[idx] = seconds;
    this.flash(this.fighters[idx], 0x8888aa, 0.9, 0.4);
  }

  victory(winner) {
    this.winner = winner;
    const w = this.fighters[winner];
    const l = this.fighters[1 - winner];
    l.dead = true;
    this.auras[1 - winner].g.visible = false;
    this.shake = 0.8;
    this.shockwave(l.group.position.x, 0.06, 0, 0xffd34d, false);
    this.tween(0.9, (k) => {
      l.group.rotation.x = -Math.PI / 2 * k;
      l.group.position.y = 0.45 * k;
    });
    w.armL.rotation.x = w.armR.rotation.x = -2.8;
    this.confettiTimer = 0;
  }

  reset() {
    this.tweens.length = 0;
    [...this.temp].forEach((o) => this.dropTemp(o));
    this.boltLight.intensity = 0;
    this.winner = null;
    this.stunned = [0, 0];
    this.shake = 0;
    this.auras.forEach((a) => { a.g.visible = false; });
    this.fighters.forEach((f) => {
      f.dead = false;
      f.group.position.set(f.baseX, 0, 0);
      f.group.rotation.x = 0;
      f.group.rotation.z = 0;
      f.armL.rotation.x = f.armR.rotation.x = 0;
      f.head.rotation.z = 0;
      f.mats.forEach((m) => { m.emissiveIntensity = 0; });
    });
  }

  burst(pos, color, n, speed, life, gravity = 9) {
    for (let i = 0; i < n; i++) {
      const mesh = new THREE.Mesh(this.pGeo, new THREE.MeshBasicMaterial({ color, transparent: true }));
      mesh.position.copy(pos);
      const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.2, Math.random() - 0.5)
        .normalize().multiplyScalar(speed * (0.4 + Math.random() * 0.8));
      this.scene.add(mesh);
      this.particles.push({ mesh, v, life: life * (0.6 + Math.random() * 0.6), max: life, gravity });
    }
  }

  confetti() {
    const colors = [0xffd34d, 0x46f08a, 0x35d0ff, 0xff7a45, 0xff4d9d, 0xffffff];
    for (let i = 0; i < 6; i++) {
      const p = new THREE.Vector3((Math.random() - 0.5) * 14, 7 + Math.random() * 2, (Math.random() - 0.5) * 4);
      this.burst(p, colors[Math.floor(Math.random() * colors.length)], 1, 1.5, 2.6, 3);
    }
  }

  toScreen(idx) {
    const f = this.fighters[idx];
    const v = new THREE.Vector3(f.group.position.x, 3.8, 0).project(this.camera);
    const w = this.container.clientWidth, h = this.container.clientHeight;
    return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h };
  }

  resize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h);
    if (this.composer) this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    const aspect = w / h;
    this.camBase.z = 12.5 + Math.max(0, 1.7 - aspect) * 9;
    this.camera.updateProjectionMatrix();
  }

  update(dt) {
    this.time += dt;

    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tw = this.tweens[i];
      tw.t += dt;
      const k = Math.min(1, tw.t / tw.dur);
      tw.fn(k);
      if (k >= 1) {
        this.tweens.splice(i, 1);
        if (tw.done) tw.done();
      }
    }

    this.fighters.forEach((f, i) => {
      f.core.scale.setScalar(1 + Math.sin(this.time * 4 + f.phase) * 0.12);
      if (f.dead) return;
      const bob = Math.sin(this.time * 2.2 + f.phase) * 0.08;
      if (this.winner === i) {
        f.group.position.y = Math.abs(Math.sin(this.time * 5)) * 0.9;
      } else {
        f.group.position.y = bob;
      }
      if (this.stunned[i] > 0) {
        this.stunned[i] -= dt;
        f.head.rotation.z = Math.sin(this.time * 30) * 0.18;
      } else {
        f.head.rotation.z *= 0.8;
      }
    });

    this.auras.forEach((a, i) => {
      if (!a.g.visible) return;
      const f = this.fighters[i];
      a.g.position.x = f.group.position.x;
      a.g.rotation.y += dt * 1.5;
      a.r2.position.y = ((this.time * 1.2 + i * 0.5) % 1) * 4.4;
      const s = 1 + Math.sin(this.time * 6) * 0.03;
      a.cyl.scale.set(s, 1, s);
    });

    this.spinners.forEach((s) => { s.g.rotation.z += dt * s.speed; });
    this.pillars.forEach((p) => {
      p.beam.material.opacity = 0.28 + Math.sin(this.time * 2 + p.phase) * 0.1;
    });

    const dp = this.dust.geometry.attributes.position.array;
    for (let i = 0; i < dp.length / 3; i++) {
      dp[i * 3 + 1] += dt * (0.25 + (i % 5) * 0.05);
      if (dp[i * 3 + 1] > 9) dp[i * 3 + 1] = 0;
    }
    this.dust.geometry.attributes.position.needsUpdate = true;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }
      p.v.y -= p.gravity * dt;
      p.mesh.position.addScaledVector(p.v, dt);
      p.mesh.rotation.x += dt * 6;
      p.mesh.rotation.y += dt * 4;
      p.mesh.material.opacity = Math.min(1, p.life / (p.max * 0.5));
    }

    if (this.winner !== null) {
      this.confettiTimer -= dt;
      if (this.confettiTimer <= 0) { this.confetti(); this.confettiTimer = 0.12; }
    }

    this.stars.rotation.y += dt * 0.01;
    const p = this.props;
    if (p) {
      p.math.userData.spin[0].rotation.y += dt * 0.15;
      p.math.userData.spin[0].rotation.x += dt * 0.07;
      p.math.userData.spin[1].rotation.y -= dt * 0.3;
      p.atom.userData.rings.forEach((r, i) => { r.rotation.z += dt * (0.5 + i * 0.25); });
      p.globe.userData.spin[0].rotation.y += dt * 0.12;
      p.globe.userData.spin[1].rotation.y += dt * 0.12;
    }
    this.symbols.forEach((s) => {
      s.position.y = s.userData.baseY + Math.sin(this.time * s.userData.speed + s.userData.phase) * 0.6;
    });

    this.shake = Math.max(0, this.shake - dt * 1.4);
    const sx = (Math.random() - 0.5) * this.shake;
    const sy = (Math.random() - 0.5) * this.shake;
    this.camera.position.set(
      this.camBase.x + Math.sin(this.time * 0.3) * 0.7 + sx,
      this.camBase.y + Math.sin(this.time * 0.5) * 0.15 + sy,
      this.camBase.z
    );
    this.camera.lookAt(0, 1.9, 0);

    this.render();
  }

  render() {
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }
}