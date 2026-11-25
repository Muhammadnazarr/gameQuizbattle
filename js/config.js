const BOT_NAMES = [
  ["Pemula", "🐣"], ["Murid", "📘"], ["Pelajar", "✏️"], ["Juara Kelas", "🥉"], ["Cerdas", "💡"],
  ["Gesit", "🏃"], ["Teliti", "🔍"], ["Pintar", "🧠"], ["Cendekia", "🎓"], ["Juara", "🥈"],
  ["Strategis", "♟️"], ["Kilat", "⚡"], ["Ahli", "🛠️"], ["Jenius", "🧬"], ["Master", "🥇"],
  ["Elit", "🛡️"], ["Prodigi", "🚀"], ["Grandmaster", "🏆"], ["Legenda", "👑"], ["Dewa Kuis", "🔱"],
];

function makeBotLevels() {
  const total = BOT_NAMES.length;
  return BOT_NAMES.map(([name, icon], i) => {
    const lv = i + 1;
    const d = i / (total - 1);
    const acc = +(0.45 + 0.52 * d).toFixed(2);
    return {
      lv,
      name: "Bot " + name,
      icon,
      d,
      color: `hsl(${Math.round(135 - 135 * d)}, 90%, 60%)`,
      band: lv <= 6 ? "Mudah" : lv <= 13 ? "Sedang" : "Sulit",
      acc,
      react: [+(5.2 - 3.7 * d).toFixed(1), +(9 - 5.7 * d).toFixed(1)],
      ops: lv === 1 ? ["+"] : lv <= 4 ? ["+", "-"] : lv <= 9 ? ["+", "-", "*"] : ["+", "-", "*", "/"],
      desc: `Akurasi ${Math.round(acc * 100)}%`,
    };
  });
}

export const CONFIG = {
  maxHP: 100,

  baseDamage: 14,
  speedBonusMax: 14,

  comboHeal: 0.03,
  comboHealCap: 5,

  wrongLock: 1.3,

  time: { easy: 14, medium: 11, hard: 9 },
  timeText: { easy: 18, medium: 16, hard: 14 },

  betweenRounds: 1.1,

  keys: {
    p1: ["KeyW", "KeyA", "KeyS", "KeyD"],
    p2: ["KeyI", "KeyJ", "KeyK", "KeyL"],
  },
  keyLabels: {
    p1: ["W", "A", "S", "D"],
    p2: ["I", "J", "K", "L"],
  },

  colors: { p1: 0x35d0ff, p2: 0xff7a45 },
  cssColors: { p1: "#35d0ff", p2: "#ff7a45" },

  subjects: [
    { id: "math", name: "Matematika", icon: "➗", color: "#35d0ff", desc: "Hitungan cepat + − × ÷",
      hints: { easy: "Angka kecil (sampai 20), perkalian sampai 9×5.",
               medium: "Angka sampai 100, perkalian sampai 12×12.",
               hard: "Angka sampai 500, perkalian besar, dan soal gabungan." } },
    { id: "ipa", name: "IPA", icon: "🔬", color: "#46f08a", desc: "Biologi, fisika, kimia, bumi & antariksa",
      hints: { easy: "Tingkat SD: dasar-dasar alam sekitar.",
               medium: "Tingkat SMP: sel, gaya, zat, tata surya.",
               hard: "Tingkat SMA: listrik, kimia, genetika, metabolisme." } },
    { id: "ips", name: "IPS", icon: "🏛️", color: "#ffd34d", desc: "Sejarah, ekonomi, sosial, kewarganegaraan",
      hints: { easy: "Tingkat SD: Pancasila, hari besar, tokoh dasar.",
               medium: "Tingkat SMP: kerajaan, penjajahan, kemerdekaan.",
               hard: "Tingkat SMA: pergerakan nasional, ekonomi, politik." } },
    { id: "geo", name: "Geografi", icon: "🌍", color: "#8a7bff", desc: "Negara, peta, alam, dan iklim",
      hints: { easy: "Tingkat SD: ibu kota, benua, samudra.",
               medium: "Tingkat SMP: selat, iklim, lempeng, waktu.",
               hard: "Tingkat SMA: skala peta, zona waktu, fenomena alam." } },
    { id: "budaya", name: "Budaya", icon: "🎭", color: "#ff7a45", desc: "Budaya & kearifan lokal Indonesia",
      hints: { easy: "Rumah adat, tarian, makanan, pakaian daerah.",
               medium: "Upacara, senjata, kesenian, lagu daerah.",
               hard: "Warisan UNESCO, aksara, naskah, tradisi khusus." } },
    { id: "indonesia", name: "B. Indonesia", icon: "📖", color: "#ff6a5a", desc: "Ejaan, kata baku, kalimat, majas, sastra",
      hints: { easy: "Tingkat SD: huruf, kata baku, sinonim, kalimat dasar.",
               medium: "Tingkat SMP: imbuhan, majas, pantun, jenis teks.",
               hard: "Tingkat SMA: kalimat efektif, unsur sastra, teks argumentasi." } },
    { id: "inggris", name: "B. Inggris", icon: "🔤", color: "#7f9bff", desc: "Kosakata, grammar, tenses, idiom",
      hints: { easy: "Tingkat SD: kosakata dasar, angka, warna, to be.",
               medium: "Tingkat SMP: tenses sederhana, preposisi, comparative.",
               hard: "Tingkat SMA: perfect tense, conditional, passive, idiom." } },
    { id: "jepang", name: "B. Jepang", icon: "🎌", color: "#ff7fa8", desc: "Hiragana, katakana, kosakata, tata bahasa",
      hints: { easy: "Setara N5: hiragana, salam, angka, kosakata dasar.",
               medium: "Setara N4: partikel, bentuk kata kerja, kanji dasar.",
               hard: "Setara N3: bentuk kata kerja lanjut, keigo, pola kalimat." } },
  ],

  botLevels: makeBotLevels(),
};