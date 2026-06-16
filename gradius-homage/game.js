'use strict';
/* ================================================================
   GRADIUS HOMAGE — 横スクロールSTG（自作コード・自作アセット）
   全30ステージ（10テーマ × 3周）
   操作: 矢印キー移動 / Z:ショット / X:パワーアップ発動 / P:ポーズ
   隠しコマンド: ↑↑↓↓←→←→ で無敵モード ON/OFF
   ================================================================ */

const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
const W = 800, H = 600;
const HUD_H = 84;            // 画面下部HUD
const PH = H - HUD_H;        // プレイ領域の高さ
const COL_W = 8;             // 地形1カラムの幅
const COLS = Math.ceil(W / COL_W) + 2;
const BOSS_DIST = 7200;      // この距離でボス出現
const MAX_STAGE = 30;

/* ---------------- ステージテーマ定義 ----------------
   key      : 内部名
   name     : 表示名
   scroll   : スクロール速度
   ter      : 地形パラメータ {topMax, botMax, amp} / corridor:gap幅 / step:角張り
   terCol   : [地形色, ハイライト色]
   bg       : 背景色
   boss     : ボス種別 core | twin | guardian | final
----------------------------------------------------- */
const THEMES = [
  { key: 'space',    name: '宇宙空域',  scroll: 1.6, ter: { topMax: 0,   botMax: 36,  amp: 26 },  terCol: ['#6b4f9e', '#9b7fd4'], bg: '#03040f', boss: 'core' },
  { key: 'asteroid', name: '小惑星帯',  scroll: 1.6, ter: { topMax: 0,   botMax: 30,  amp: 20 },  terCol: ['#7a6a55', '#a89274'], bg: '#0a0806', boss: 'core' },
  { key: 'volcano',  name: '火山地帯',  scroll: 1.6, ter: { topMax: 0,   botMax: 120, amp: 90, spike: true }, terCol: ['#8a3a24', '#d96a3a'], bg: '#120505', boss: 'guardian' },
  { key: 'ruins',    name: '古代遺跡',  scroll: 1.6, ter: { topMax: 44,  botMax: 80,  amp: 46, step: 20 }, terCol: ['#7d7a4e', '#b3ad77'], bg: '#070806', boss: 'guardian' },
  { key: 'cavern',   name: '鍾乳洞',    scroll: 1.6, ter: { topMax: 95,  botMax: 95,  amp: 65 },  terCol: ['#2f6f74', '#55b3b8'], bg: '#031010', boss: 'twin' },
  { key: 'organic',  name: '生体内部',  scroll: 1.6, ter: { topMax: 75,  botMax: 75,  amp: 55 },  terCol: ['#8a2d4e', '#d4587f'], bg: '#13040a', boss: 'twin' },
  { key: 'ice',      name: '氷結地帯',  scroll: 1.6, ter: { topMax: 55,  botMax: 65,  amp: 45 },  terCol: ['#3a6f9e', '#9fd4ef'], bg: '#040a12', boss: 'core' },
  { key: 'speed',    name: '高速回廊',  scroll: 3.4, ter: { corridor: 250 }, terCol: ['#3d4a63', '#6a7ea6'], bg: '#05060d', boss: 'twin' },
  { key: 'fortress', name: '大要塞',    scroll: 1.6, ter: { corridor: 215, step: 24 }, terCol: ['#555f70', '#8b97ac'], bg: '#06070a', boss: 'guardian' },
  { key: 'core',     name: '中枢部',    scroll: 1.6, ter: { corridor: 265, step: 24 }, terCol: ['#6e3a3a', '#b06060'], bg: '#0d0509', boss: 'final' },
];
function curTheme() { return THEMES[(stage - 1) % 10]; }
function loopNum()  { return Math.floor((stage - 1) / 10); }   // 0..2 (周回)
function curScroll() { return stagePhase === 'boss' ? 1.6 : curTheme().scroll; }
function diffMul()  { return 1 + (stage - 1) * 0.045 + loopNum() * 0.15; }
function bSpeed()   { return Math.min(4.2, 2.2 + stage * 0.05); }   // 敵弾速度

/* ---------------- 入力 ---------------- */
const keys = {};
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight'];
let konamiBuf = [];
let invincibleCheat = false;
let cheatFlash = 0;

addEventListener('keydown', e => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyZ','KeyX','KeyP','Enter'].includes(e.code)) e.preventDefault();
  if (e.repeat) return;
  keys[e.code] = true;
  initAudio();

  // コナミコマンド判定（どの画面でも有効）
  konamiBuf.push(e.code);
  if (konamiBuf.length > KONAMI.length) konamiBuf.shift();
  if (konamiBuf.join(',') === KONAMI.join(',')) {
    invincibleCheat = !invincibleCheat;
    cheatFlash = 90;
    konamiBuf = [];
    sfx.konami();
  }

  if (e.code === 'KeyP' && state === 'play') paused = !paused;
  if (e.code === 'Enter') {
    if (state === 'title') startGame();
    else if (state === 'gameover' || state === 'ending') state = 'title';
  }
});
addEventListener('keyup', e => { keys[e.code] = false; });

/* ---------------- サウンド（WebAudio自作合成） ---------------- */
let actx = null;
function initAudio() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
}
function tone(freq, dur, type = 'square', vol = 0.07, slide = 0, when = 0) {
  if (!actx) return;
  const t0 = actx.currentTime + when;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(actx.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
function noise(dur, vol = 0.1) {
  if (!actx) return;
  const len = Math.floor(actx.sampleRate * dur);
  const buf = actx.createBuffer(1, len, actx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = actx.createBufferSource();
  const g = actx.createGain();
  g.gain.value = vol;
  src.buffer = buf;
  src.connect(g); g.connect(actx.destination);
  src.start();
}
const sfx = {
  shoot()   { tone(880, 0.06, 'square', 0.04, -500); },
  laser()   { tone(1400, 0.1, 'sawtooth', 0.04, -900); },
  missile() { tone(300, 0.12, 'triangle', 0.05, -150); },
  expl()    { noise(0.25, 0.12); tone(110, 0.25, 'sawtooth', 0.06, -70); },
  bigExpl() { noise(0.6, 0.2); tone(70, 0.6, 'sawtooth', 0.1, -40); },
  cap()     { tone(660, 0.08, 'square', 0.06); tone(990, 0.08, 'square', 0.06, 0, 0.08); },
  pow()     { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.09, 'square', 0.07, 0, i * 0.07)); },
  dead()    { tone(400, 0.5, 'sawtooth', 0.1, -350); noise(0.5, 0.15); },
  konami()  { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.1, 'square', 0.08, 0, i * 0.06)); },
  clear()   { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.14, 'square', 0.08, 0, i * 0.12)); },
  allClear(){ [392, 523, 659, 784, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.18, 'square', 0.09, 0, i * 0.15)); },
};

/* ---------------- ゲーム状態 ---------------- */
let state = 'title';   // title | play | gameover | ending
let paused = false;
let frame = 0;
let score = 0;
let hiScore = Number(localStorage.getItem('gradius_homage_hi') || 0);
let lives = 0;
let stage = 1;
let dist = 0;          // ステージ内進行距離(px)
let stagePhase = '';   // run | boss
let shakeT = 0;
let introT = 0;        // ステージ開始バナー表示残り

let player = null;
let bullets = [];      // 自機弾
let ebullets = [];     // 敵弾
let enemies = [];
let capsules = [];
let parts = [];        // パーティクル
let boss = null;
let squads = {};
let squadSeq = 0;
let stars = [];

const METER_NAMES = ['SPEED', 'MISSILE', 'DOUBLE', 'LASER', 'OPTION', '?'];

/* ---------------- 地形 ---------------- */
let terTop = [];
let terBot = [];
let terShift = 0;
let terSeed = 0;

function genColumn() {
  terSeed += 0.13;
  if (stagePhase === 'boss') return { top: 0, bot: 24 };   // ボス部屋は平坦
  const t = curTheme().ter;
  const lp = loopNum();
  const f = Math.min(1, dist / 2200);   // ステージ序盤は地形浅め

  if (t.corridor) {
    // 蛇行する回廊
    const gap = Math.max(150, t.corridor - lp * 18);
    const range = Math.max(20, (PH - gap) / 2 - 20);
    let c = PH / 2 + Math.sin(terSeed * 0.62) * range * f;
    let top = c - gap / 2, bot = PH - (c + gap / 2);
    if (t.step) { top = Math.round(top / t.step) * t.step; bot = Math.round(bot / t.step) * t.step; }
    return { top: Math.max(0, top), bot: Math.max(16, bot) };
  }

  const wobT = Math.sin(terSeed * 1.7) * 0.5 + Math.sin(terSeed * 0.6) * 0.5;
  let wobB = Math.sin(terSeed * 1.3 + 2.2) * 0.5 + Math.cos(terSeed * 0.45) * 0.5;
  if (t.spike) wobB = Math.pow(Math.abs(Math.sin(terSeed * 0.55)), 2.2) * 1.6 - 0.6;   // 火山の尖峰
  let top = t.topMax > 0 ? Math.max(0, t.topMax * f + wobT * t.amp * f) : 0;
  let bot = Math.max(16, (t.botMax * 0.4 + t.botMax * 0.6 * f) + wobB * t.amp * f);
  if (t.step) { top = Math.round(top / t.step) * t.step; bot = Math.max(16, Math.round(bot / t.step) * t.step); }
  return { top, bot };
}
function initTerrain() {
  terTop = []; terBot = []; terShift = 0; terSeed = Math.random() * 100;
  for (let i = 0; i < COLS; i++) { const c = genColumn(); terTop.push(c.top); terBot.push(c.bot); }
}
function terAt(x) {
  const i = Math.max(0, Math.min(COLS - 1, Math.floor((x + terShift) / COL_W)));
  return { top: terTop[i], bot: terBot[i] };
}
function updateTerrain() {
  terShift += curScroll();
  while (terShift >= COL_W) {
    terShift -= COL_W;
    terTop.shift(); terBot.shift();
    const c = genColumn();
    terTop.push(c.top); terBot.push(c.bot);
  }
}

/* ---------------- プレイヤー ---------------- */
function newPlayer() {
  return {
    x: 100, y: PH / 2, w: 26, h: 14,
    speedLv: 0, shot: 'normal', missile: false, options: 0, shield: 0,
    meter: 0, inv: 120, cool: 0, mcool: 0,
    alive: true, deadT: 0, trail: [],
  };
}
function playerSpeed() { return 2.3 + player.speedLv * 0.7; }

function activatePower() {
  const p = player;
  if (p.meter === 0) return;
  let ok = true;
  switch (p.meter) {
    case 1: if (p.speedLv < 4) p.speedLv++; else ok = false; break;
    case 2: if (!p.missile) p.missile = true; else ok = false; break;
    case 3: if (p.shot !== 'double') p.shot = 'double'; else ok = false; break;
    case 4: if (p.shot !== 'laser') p.shot = 'laser'; else ok = false; break;
    case 5: if (p.options < 4) p.options++; else ok = false; break;
    case 6: p.shield = 4; break;
  }
  if (ok) { p.meter = 0; sfx.pow(); }
}

function fireFrom(x, y) {
  const p = player;
  if (p.shot === 'laser') {
    bullets.push({ x, y, vx: 14, vy: 0, type: 'laser', w: 56, h: 4, dmg: 1, hits: new Set() });
  } else {
    bullets.push({ x, y, vx: 11, vy: 0, type: 'shot', w: 12, h: 4, dmg: 1 });
    if (p.shot === 'double') {
      bullets.push({ x, y, vx: 8, vy: -8, type: 'shot', w: 8, h: 8, dmg: 1 });
    }
  }
}
function fireMissileFrom(x, y) {
  bullets.push({ x, y, vx: 3, vy: 3.5, type: 'missile', w: 8, h: 8, dmg: 2, ground: false });
}

function optionPos(i) {
  const idx = (i + 1) * 14;
  const t = player.trail;
  if (t.length > idx) return t[t.length - 1 - idx];
  return { x: player.x, y: player.y };
}

function updatePlayer() {
  const p = player;
  if (!p.alive) {
    p.deadT--;
    if (p.deadT <= 0) {
      if (lives > 0) { lives--; respawn(); }
      else { state = 'gameover'; saveHi(); }
    }
    return;
  }
  const sp = playerSpeed();
  if (keys['ArrowUp'])    p.y -= sp;
  if (keys['ArrowDown'])  p.y += sp;
  if (keys['ArrowLeft'])  p.x -= sp;
  if (keys['ArrowRight']) p.x += sp;
  p.x = Math.max(14, Math.min(W - 60, p.x));
  p.y = Math.max(8, Math.min(PH - 8, p.y));

  p.trail.push({ x: p.x, y: p.y });
  if (p.trail.length > 90) p.trail.shift();

  if (p.inv > 0) p.inv--;
  if (p.cool > 0) p.cool--;
  if (p.mcool > 0) p.mcool--;

  if (keys['KeyZ'] || keys['Space']) {
    if (p.cool <= 0) {
      p.cool = p.shot === 'laser' ? 10 : 9;
      fireFrom(p.x + 14, p.y);
      for (let i = 0; i < p.options; i++) { const o = optionPos(i); fireFrom(o.x + 10, o.y); }
      p.shot === 'laser' ? sfx.laser() : sfx.shoot();
    }
    if (p.missile && p.mcool <= 0) {
      p.mcool = 40;
      fireMissileFrom(p.x, p.y + 6);
      for (let i = 0; i < p.options; i++) { const o = optionPos(i); fireMissileFrom(o.x, o.y + 6); }
      sfx.missile();
    }
  }
  if (keys['KeyX']) { activatePower(); keys['KeyX'] = false; }

  // 地形衝突
  const t = terAt(p.x);
  if (!isInvincible() && (p.y - p.h / 2 < t.top || p.y + p.h / 2 > PH - t.bot)) killPlayer();
}

function isInvincible() { return invincibleCheat || player.inv > 0; }
function saveHi() { if (score > hiScore) { hiScore = score; localStorage.setItem('gradius_homage_hi', hiScore); } }

function killPlayer() {
  const p = player;
  if (!p.alive || isInvincible()) return;
  if (p.shield > 0) { p.shield--; p.inv = 40; sfx.expl(); return; }
  p.alive = false;
  p.deadT = 110;
  explode(p.x, p.y, 30, '#7af');
  sfx.dead();
  shakeT = 20;
}

function respawn() {
  // グラディウス流: 装備を失って復活
  const keepCheat = invincibleCheat;
  player = newPlayer();
  invincibleCheat = keepCheat;
}

/* ---------------- パーティクル・弾ヘルパー ---------------- */
function explode(x, y, n, col) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = 0.5 + Math.random() * 3.5;
    parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 20 + Math.random() * 25, col });
  }
}
function aimAt(x, y, tx, ty, speed) {
  const a = Math.atan2(ty - y, tx - x);
  return { vx: Math.cos(a) * speed, vy: Math.sin(a) * speed };
}
function eshoot(x, y, speed) {
  if (!player.alive) return;
  const v = aimAt(x, y, player.x, player.y, speed || bSpeed());
  ebullets.push({ x, y, vx: v.vx, vy: v.vy });
}
function ering(x, y, n, speed, off = 0) {
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 2 * i / n + off;
    ebullets.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed });
  }
}

/* ---------------- 敵生成 ---------------- */
function safeY() {
  // 回廊系でも壁に埋まらない出現Y
  const t = terAt(W - 8);
  const lo = t.top + 40, hi = PH - t.bot - 40;
  return lo + Math.random() * Math.max(20, hi - lo);
}
function spawnFanSquad() {
  const id = ++squadSeq;
  squads[id] = { n: 6, capsule: true };
  const baseY = safeY();
  for (let i = 0; i < 6; i++) {
    enemies.push({ type: 'fan', x: W + 30 + i * 34, y: baseY, baseY, hp: 1, t: i * -8, w: 20, h: 16, squad: id, sc: 100 });
  }
}
function spawnRusher() {
  enemies.push({ type: 'rush', x: W + 20, y: safeY(), hp: 1, t: 0, w: 22, h: 14, sc: 110 });
}
function spawnHover() {
  enemies.push({ type: 'hover', x: W + 20, y: safeY(), hp: 3, t: 0, w: 26, h: 22, sc: 300 });
}
function spawnTurret(side) {
  const t = terAt(W - 4);
  const y = side === 'top' ? t.top + 8 : PH - t.bot - 8;
  enemies.push({ type: 'turret', x: W + 4, y, side, hp: 4, t: Math.floor(Math.random() * 60), w: 18, h: 16, sc: 250 });
}
function spawnStatue(side) {
  side = side || 'bot';
  const t = terAt(W - 4);
  const y = side === 'top' ? t.top + 18 : PH - t.bot - 18;
  enemies.push({ type: 'statue', x: W + 10, y, side, hp: 8, t: Math.floor(Math.random() * 80), w: 24, h: 36, sc: 500 });
}
function spawnRock() {
  const big = Math.random() < 0.6;
  enemies.push({
    type: 'rock', x: W + 30, y: 30 + Math.random() * (PH - 60),
    hp: big ? 3 : 1, t: Math.random() * 99, w: big ? 30 : 16, h: big ? 28 : 14, big, sc: big ? 200 : 80,
    vy: (Math.random() - 0.5) * 0.8, rot: Math.random() * 6,
  });
}
function spawnErupt() {
  // 火山の噴石: 下から放物線
  const x = W * 0.35 + Math.random() * W * 0.6;
  const t = terAt(x);
  enemies.push({
    type: 'erupt', x, y: PH - t.bot, hp: 1, t: 0, w: 14, h: 14, sc: 60,
    vx: -0.6 - Math.random() * 1.2, vy: -(5.5 + Math.random() * 3.5),
  });
}
function spawnStal() {
  enemies.push({ type: 'stal', x: W + 8, y: 0, hp: 2, t: 0, w: 12, h: 26, sc: 120, fall: false, vy: 0 });
}
function spawnBubble(x, y, big) {
  enemies.push({
    type: 'bubble', x: x === undefined ? W + 24 : x, y: y === undefined ? safeY() : y,
    baseY: y === undefined ? null : y, hp: 1, t: Math.random() * 99,
    w: big === false ? 16 : 30, h: big === false ? 16 : 30, big: big !== false, sc: big === false ? 60 : 150,
  });
}
function spawnShard() {
  enemies.push({ type: 'shard', x: 80 + Math.random() * (W - 120), y: -10, hp: 1, t: Math.random() * 99, w: 10, h: 18, sc: 70, vy: 1.4 + Math.random() });
}

/* ---------------- 出現スケジュール ---------------- */
function spawner() {
  if (stagePhase === 'boss') return;
  dist += curScroll();
  if (dist >= BOSS_DIST && !boss) { spawnBoss(); return; }

  const th = curTheme();
  const base = Math.max(34, 120 - stage * 2.5);   // ステージが進むほど出現間隔短縮

  // 共通の雑魚
  if (frame % Math.floor(base * 1.6) === 0) spawnFanSquad();
  if (frame % Math.floor(base * 1.25) === 37) spawnRusher();
  if (dist > 1200 && frame % Math.floor(base * 2.2) === 71) spawnHover();

  // テーマ固有ギミック
  switch (th.key) {
    case 'space':
      if (dist > 3000 && frame % Math.floor(base * 1.8) === 55) spawnTurret('bot');
      break;
    case 'asteroid':
      if (frame % Math.max(26, 56 - stage) === 10) spawnRock();
      break;
    case 'volcano':
      if (frame % Math.max(30, 80 - stage * 2) === 20) spawnErupt();
      if (dist > 2000 && frame % 150 === 60) spawnTurret('bot');
      break;
    case 'ruins':
      if (frame % 170 === 30) spawnStatue(Math.random() < 0.4 ? 'top' : 'bot');
      if (frame % 140 === 90) spawnTurret(Math.random() < 0.5 ? 'top' : 'bot');
      break;
    case 'cavern':
      if (frame % Math.max(50, 100 - stage * 2) === 15) spawnStal();
      if (dist > 2500 && frame % 160 === 80) spawnTurret('bot');
      break;
    case 'organic':
      if (frame % Math.max(46, 90 - stage * 2) === 25) spawnBubble();
      break;
    case 'ice':
      if (frame % Math.max(36, 70 - stage) === 5) spawnShard();
      if (dist > 2500 && frame % 170 === 90) spawnTurret('bot');
      break;
    case 'speed':
      if (frame % 110 === 40) spawnRusher();
      break;
    case 'fortress':
      if (frame % Math.max(50, 92 - stage) === 20) spawnTurret(Math.random() < 0.5 ? 'top' : 'bot');
      if (frame % 190 === 80) spawnStatue(Math.random() < 0.5 ? 'top' : 'bot');
      break;
    case 'core':
      if (frame % 80 === 10) spawnTurret(Math.random() < 0.5 ? 'top' : 'bot');
      if (frame % 130 === 50) spawnHover();
      if (frame % 150 === 70) spawnStatue(Math.random() < 0.5 ? 'top' : 'bot');
      if (frame % 60 === 33) spawnShard();
      break;
  }
}

/* ---------------- 敵の更新 ---------------- */
function updateEnemies() {
  const diff = diffMul();
  for (const e of enemies) {
    e.t++;
    switch (e.type) {
      case 'fan':
        if (e.t < 0) break;
        e.x -= 3.4 * diff;
        e.y = e.baseY + Math.sin(e.t * 0.07) * 56;
        break;
      case 'rush': {
        e.x -= 4.6 * diff;
        const dy = player.alive ? Math.sign(player.y - e.y) : 0;
        e.y += dy * 0.9;
        break;
      }
      case 'hover':
        e.x -= e.x > W * 0.62 ? 2.2 : 0.5;
        e.y += Math.sin(e.t * 0.05) * 0.8;
        if (e.t % Math.max(40, Math.floor(90 / diff)) === 0) eshoot(e.x, e.y);
        break;
      case 'turret': {
        e.x -= curScroll();
        const t = terAt(e.x);
        e.y = e.side === 'top' ? t.top + 8 : PH - t.bot - 8;
        if (e.t % Math.max(45, Math.floor(100 / diff)) === 0 && e.x < W - 40) eshoot(e.x, e.y);
        break;
      }
      case 'statue': {
        e.x -= curScroll();
        const t = terAt(e.x);
        e.y = e.side === 'top' ? t.top + 18 : PH - t.bot - 18;
        if (e.t % Math.max(80, Math.floor(150 / diff)) === 0 && e.x < W - 50) ering(e.x, e.y, 8, bSpeed() * 0.8);
        break;
      }
      case 'rock':
        e.x -= 1.9 * Math.min(1.6, diff);
        e.y += e.vy;
        e.rot += 0.03;
        break;
      case 'erupt':
        e.vy += 0.16;
        e.x += e.vx;
        e.y += e.vy;
        break;
      case 'stal': {
        if (!e.fall) {
          e.x -= curScroll();
          e.y = terAt(e.x).top + 13;
          if ((player.alive && Math.abs(player.x - e.x) < 46) || e.t > 420) e.fall = true;
        } else {
          e.vy += 0.28;
          e.y += e.vy;
        }
        break;
      }
      case 'bubble':
        e.x -= 1.6;
        if (e.baseY === null) e.baseY = e.y;
        e.y = e.baseY + Math.sin(e.t * 0.04) * 38;
        break;
      case 'shard':
        e.x -= curScroll() + 0.4;
        e.y += e.vy;
        e.x += Math.sin(e.t * 0.08) * 0.6;
        break;
    }
  }
  enemies = enemies.filter(e => e.x > -40 && e.x < W + 260 && e.y < PH + 40 && e.hp > 0);
}

/* ---------------- ボス ---------------- */
function spawnBoss() {
  stagePhase = 'boss';
  const kind = curTheme().boss;
  const hp = Math.floor((50 + stage * 12) * (kind === 'final' ? 1.8 : 1));
  boss = { kind, x: W + 170, y: PH / 2, w: 150, h: 170, hp, maxHp: hp, t: 0, open: 0, dead: false, deadT: 0, sp: 0 };
  if (kind === 'twin') {
    boss.h = 230;
    boss.cores = [{ dy: -58, hp: Math.ceil(hp / 2) }, { dy: 58, hp: Math.ceil(hp / 2) }];
  }
  if (kind === 'guardian') { boss.w = 130; boss.h = 190; }
  if (kind === 'final') { boss.w = 180; boss.h = 260; }
}

function bossWeakPoints() {
  const b = boss;
  if (b.kind === 'twin') return b.cores.filter(c => c.hp > 0).map(c => ({ x: b.x - 60, y: b.y + c.dy, w: 26, h: 26, core: c }));
  if (b.kind === 'guardian') return [{ x: b.x - 50, y: b.y - 30, w: 24, h: 24 }];
  if (b.kind === 'final') return [{ x: b.x - 84, y: b.y, w: 30, h: 30 }];
  return [{ x: b.x - 64, y: b.y, w: 26, h: 26 }];
}
function updateBoss() {
  if (!boss) return;
  const b = boss;
  b.t++;
  if (b.dead) {
    b.deadT++;
    if (b.deadT % 6 === 0) {
      explode(b.x + (Math.random() - 0.5) * b.w, b.y + (Math.random() - 0.5) * b.h, 14, '#fc6');
      sfx.expl();
    }
    if (b.deadT > 120) {
      sfx.bigExpl();
      score += 5000 * (b.kind === 'final' ? 2 : 1) + stage * 500;
      stageClear();
    }
    return;
  }
  // 出現 → 定位置で上下移動
  const homeX = W - (b.kind === 'final' ? 150 : 130);
  if (b.x > homeX) b.x -= 1.2;
  else b.y = PH / 2 + Math.sin(b.t * 0.017) * Math.max(0, PH / 2 - b.h / 2 - 26);

  // コア開閉サイクル
  const cyc = b.t % 280;
  b.open = (cyc > 160) ? 1 : 0;

  // 攻撃
  if (b.x <= homeX + 4 && player.alive) {
    const bs = bSpeed();
    switch (b.kind) {
      case 'core':
        if (b.t % 50 === 0) spread3(b.x - 60, b.y, bs);
        if (b.t % 130 === 0) ering(b.x - 20, b.y, 10, bs * 0.7);
        break;
      case 'twin':
        for (let i = 0; i < b.cores.length; i++) {
          const c = b.cores[i];
          if (c.hp <= 0) continue;
          if ((b.t + i * 30) % 60 === 0) spread3(b.x - 60, b.y + c.dy, bs);
        }
        if (b.t % 150 === 0) ering(b.x - 20, b.y, 12, bs * 0.65);
        break;
      case 'guardian':
        if (b.t % 120 === 0) ering(b.x - 40, b.y, 12, bs * 0.7);
        if (b.t % 70 === 0) { eshoot(b.x - 50, b.y - 30); eshoot(b.x - 50, b.y + 30); }
        break;
      case 'final':
        if (b.t % 40 === 0) spread3(b.x - 84, b.y, bs);
        if (b.t % 110 === 0) ering(b.x - 30, b.y, 14, bs * 0.7);
        if (b.open && b.t % 5 === 0) {   // スパイラル弾
          b.sp += 0.42;
          ebullets.push({ x: b.x - 84, y: b.y, vx: Math.cos(b.sp) * bs * 0.8, vy: Math.sin(b.sp) * bs * 0.8 });
        }
        break;
    }
  }
}
function spread3(x, y, speed) {
  const v = aimAt(x, y, player.x, player.y, speed);
  const base = Math.atan2(v.vy, v.vx);
  for (let i = -1; i <= 1; i++) {
    const a = base + i * 0.22;
    ebullets.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed });
  }
}
function bossAlive() {
  if (!boss) return false;
  if (boss.kind === 'twin') return boss.cores.some(c => c.hp > 0);
  return boss.hp > 0;
}

function stageClear() {
  boss = null;
  enemies = []; ebullets = []; capsules = [];
  score += 1000;
  if (stage >= MAX_STAGE) {
    score += 100000;
    saveHi();
    state = 'ending';
    sfx.allClear();
    return;
  }
  sfx.clear();
  stage++;
  dist = 0;
  stagePhase = 'run';
  introT = 160;
  initTerrain();
}

/* ---------------- 弾・当たり判定 ---------------- */
function rectHit(ax, ay, aw, ah, bx, by, bw, bh) {
  return Math.abs(ax - bx) * 2 < aw + bw && Math.abs(ay - by) * 2 < ah + bh;
}

function killEnemy(e) {
  e.hp = 0;
  score += e.sc;
  explode(e.x, e.y, 12, '#fa5');
  sfx.expl();
  if (e.type === 'bubble' && e.big) {   // 大きい泡は分裂
    spawnBubble(e.x, e.y - 14, false);
    spawnBubble(e.x, e.y + 14, false);
  }
  if (e.squad && squads[e.squad]) {
    const s = squads[e.squad];
    s.n--;
    if (s.n === 0 && s.capsule) {
      capsules.push({ x: e.x, y: e.y, t: 0 });
      delete squads[e.squad];
    }
  }
}

function updateBullets() {
  for (const b of bullets) {
    if (b.type === 'missile') {
      const t = terAt(b.x);
      const floor = PH - t.bot - 4;
      if (!b.ground && b.y >= floor) b.ground = true;
      if (b.ground) { b.x += 5; b.y = PH - terAt(b.x).bot - 4; }
      else { b.x += b.vx; b.y += b.vy; }
    } else {
      b.x += b.vx; b.y += b.vy;
    }
  }
  bullets = bullets.filter(b => b.x < W + 60 && b.y < PH + 20 && b.y > -20 && b.dmg > 0);

  for (const b of bullets) {
    // 対 敵
    for (const e of enemies) {
      if (e.hp <= 0 || e.t < 0) continue;
      if (rectHit(b.x, b.y, b.w, b.h, e.x, e.y, e.w, e.h)) {
        if (b.type === 'laser') {
          if (b.hits.has(e)) continue;
          b.hits.add(e);
        } else {
          b.dmg = 0;
        }
        e.hp -= (b.type === 'missile' ? 2 : 1);
        if (e.hp <= 0) killEnemy(e); else sfx.shoot();
        if (b.type !== 'laser') break;
      }
    }
    // 対 ボス
    if (boss && !boss.dead && b.dmg > 0) {
      let hitCore = false;
      if (boss.open) {
        for (const wp of bossWeakPoints()) {
          if (rectHit(b.x, b.y, b.w, b.h, wp.x, wp.y, wp.w, wp.h)) {
            const d = (b.type === 'missile' ? 2 : 1);
            if (wp.core) { wp.core.hp -= d; boss.hp = boss.cores.reduce((s, c) => s + Math.max(0, c.hp), 0); }
            else boss.hp -= d;
            b.dmg = 0;
            hitCore = true;
            explode(b.x, b.y, 4, '#f55');
            if (!bossAlive()) { boss.dead = true; boss.deadT = 0; shakeT = 40; }
            break;
          }
        }
      }
      if (!hitCore && b.dmg > 0 && rectHit(b.x, b.y, b.w, b.h, boss.x, boss.y, boss.w, boss.h)) {
        b.dmg = 0;   // 装甲は無効化
        explode(b.x, b.y, 2, '#888');
      }
    }
    // 対 地形（ミサイル以外は消える）
    if (b.dmg > 0 && b.type !== 'missile') {
      const t = terAt(b.x);
      if (b.y < t.top || b.y > PH - t.bot) b.dmg = 0;
    }
  }
  bullets = bullets.filter(b => b.dmg > 0);
}

function updateEBullets() {
  for (const b of ebullets) { b.x += b.vx; b.y += b.vy; }
  ebullets = ebullets.filter(b => b.x > -10 && b.x < W + 10 && b.y > -10 && b.y < PH + 10);
  if (!player.alive) return;
  for (const b of ebullets) {
    if (rectHit(b.x, b.y, 6, 6, player.x, player.y, player.w - 8, player.h - 4)) {
      b.x = -999;
      killPlayer();
    }
  }
}

function updateCollisions() {
  if (!player.alive) return;
  for (const e of enemies) {
    if (e.hp <= 0 || e.t < 0) continue;
    if (rectHit(e.x, e.y, e.w, e.h, player.x, player.y, player.w - 8, player.h - 4)) {
      if (isInvincible()) killEnemy(e);
      else { killEnemy(e); killPlayer(); }
    }
  }
  if (boss && !boss.dead && rectHit(boss.x, boss.y, boss.w, boss.h, player.x, player.y, player.w - 8, player.h - 4)) {
    killPlayer();
  }
  for (const c of capsules) {
    c.x -= 1.2; c.t++;
    if (rectHit(c.x, c.y, 18, 18, player.x, player.y, player.w + 6, player.h + 6)) {
      c.x = -999;
      player.meter = player.meter % 6 + 1;
      sfx.cap();
      score += 50;
    }
  }
  capsules = capsules.filter(c => c.x > -30);
}

/* ---------------- 星空 ---------------- */
function initStars() {
  stars = [];
  for (let i = 0; i < 70; i++) {
    stars.push({ x: Math.random() * W, y: Math.random() * PH, z: 0.3 + Math.random() * 1.4 });
  }
}
function updateStars() {
  const sc = state === 'play' ? curScroll() / 1.6 : 1;
  for (const s of stars) {
    s.x -= s.z * 1.2 * sc;
    if (s.x < 0) { s.x = W; s.y = Math.random() * PH; }
  }
}

/* ---------------- 開始・リセット ---------------- */
function startGame() {
  state = 'play';
  paused = false;
  score = 0;
  lives = 2;
  stage = 1;
  dist = 0;
  stagePhase = 'run';
  frame = 0;
  introT = 160;
  bullets = []; ebullets = []; enemies = []; capsules = []; parts = [];
  boss = null; squads = {}; squadSeq = 0;
  player = newPlayer();
  initTerrain();
  initStars();
}

/* ---------------- 描画 ---------------- */
function drawShip(x, y, blink) {
  ctx.save();
  ctx.translate(x, y);
  if (blink) ctx.globalAlpha = (frame % 6 < 3) ? 0.3 : 1;
  ctx.fillStyle = '#cdd9e5';
  ctx.beginPath();
  ctx.moveTo(15, 0); ctx.lineTo(-4, -6); ctx.lineTo(-13, -3);
  ctx.lineTo(-13, 3); ctx.lineTo(-4, 6);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4d7bd6';
  ctx.beginPath();
  ctx.moveTo(-2, -4); ctx.lineTo(-13, -9); ctx.lineTo(-13, -3); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-2, 4); ctx.lineTo(-13, 9); ctx.lineTo(-13, 3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#9fe8ff';
  ctx.fillRect(2, -2, 7, 4);
  ctx.fillStyle = (frame % 4 < 2) ? '#ffb347' : '#ff6b35';
  ctx.fillRect(-17, -2, 4, 4);
  if (invincibleCheat) {
    ctx.strokeStyle = `hsl(${frame * 7 % 360},100%,60%)`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 19 + Math.sin(frame * 0.3) * 2, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

function drawOption(x, y) {
  ctx.save();
  ctx.translate(x, y);
  const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 8);
  g.addColorStop(0, '#ffe9a8');
  g.addColorStop(0.6, '#ff9d2e');
  g.addColorStop(1, 'rgba(255,100,30,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawEnemy(e) {
  ctx.save();
  ctx.translate(e.x, e.y);
  switch (e.type) {
    case 'fan':
      ctx.fillStyle = '#e05656';
      ctx.beginPath();
      ctx.moveTo(-10, 0); ctx.lineTo(6, -8); ctx.lineTo(10, 0); ctx.lineTo(6, 8);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffd28a'; ctx.fillRect(-4, -2, 5, 4);
      break;
    case 'rush':
      ctx.fillStyle = '#b76ee0';
      ctx.beginPath();
      ctx.moveTo(-11, 0); ctx.lineTo(4, -7); ctx.lineTo(11, 0); ctx.lineTo(4, 7);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(-2, -2, 4, 4);
      break;
    case 'hover':
      ctx.fillStyle = '#5aa86e';
      ctx.fillRect(-13, -8, 26, 16);
      ctx.fillStyle = '#2e6b40';
      ctx.fillRect(-13, -11, 26, 5);
      ctx.fillStyle = (frame % 30 < 15) ? '#ff5' : '#fa0';
      ctx.beginPath(); ctx.arc(0, 2, 4, 0, Math.PI * 2); ctx.fill();
      break;
    case 'turret': {
      const flip = e.side === 'top' ? -1 : 1;
      ctx.scale(1, flip);
      ctx.fillStyle = '#8a93a6';
      ctx.fillRect(-9, -2, 18, 8);
      ctx.fillStyle = '#5b6477';
      const a = player && player.alive ? Math.atan2((player.y - e.y) * flip, player.x - e.x) : Math.PI;
      ctx.save();
      ctx.rotate(Math.max(-2.6, Math.min(-0.5, a)));
      ctx.fillRect(0, -2, 14, 4);
      ctx.restore();
      ctx.fillStyle = '#f66';
      ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'statue': {
      const flip = e.side === 'top' ? -1 : 1;
      ctx.scale(1, flip);
      // 自作デザインの石像砲台（角張った兜の番人）
      ctx.fillStyle = '#9a9272';
      ctx.fillRect(-12, -18, 24, 36);
      ctx.fillStyle = '#6e684c';
      ctx.fillRect(-12, -18, 24, 8);
      ctx.fillRect(-12, 10, 24, 8);
      ctx.fillStyle = (frame % 40 < 20) ? '#ffe27a' : '#c9a93f';
      ctx.fillRect(-7, -6, 6, 5);
      ctx.fillRect(2, -6, 6, 5);
      ctx.fillStyle = '#3c3826';
      ctx.fillRect(-5, 3, 10, 4);
      break;
    }
    case 'rock':
      ctx.rotate(e.rot);
      ctx.fillStyle = '#8d7a5e';
      ctx.beginPath();
      ctx.moveTo(-e.w / 2, -e.h / 4); ctx.lineTo(-e.w / 5, -e.h / 2); ctx.lineTo(e.w / 3, -e.h / 2.5);
      ctx.lineTo(e.w / 2, e.h / 5); ctx.lineTo(e.w / 6, e.h / 2); ctx.lineTo(-e.w / 2.5, e.h / 3);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#6b5b44';
      ctx.fillRect(-e.w / 6, -e.h / 6, e.w / 4, e.h / 4);
      break;
    case 'erupt':
      ctx.fillStyle = (frame % 8 < 4) ? '#ff7b35' : '#ffc14d';
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8a3a24';
      ctx.beginPath(); ctx.arc(-2, -1, 4, 0, Math.PI * 2); ctx.fill();
      break;
    case 'stal':
      ctx.fillStyle = '#55b3b8';
      ctx.beginPath();
      ctx.moveTo(-6, -13); ctx.lineTo(6, -13); ctx.lineTo(2, 8); ctx.lineTo(0, 13); ctx.lineTo(-2, 8);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8fe0e4';
      ctx.fillRect(-3, -13, 2, 16);
      break;
    case 'bubble': {
      const r = e.w / 2;
      ctx.strokeStyle = '#ff9eba';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(255,120,160,0.25)';
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.arc(-r / 3, -r / 3, r / 4, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'shard':
      ctx.fillStyle = '#bfeaff';
      ctx.beginPath();
      ctx.moveTo(0, -9); ctx.lineTo(5, 0); ctx.lineTo(0, 9); ctx.lineTo(-5, 0);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(-1, -6, 2, 12);
      break;
  }
  ctx.restore();
}

function drawCoreHatch(cx, cy, open, destroyed) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#1b2233';
  ctx.fillRect(-18, -22, 36, 44);
  if (destroyed) {
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
    if (frame % 14 < 4) explodeMark();
  } else if (open) {
    const pulse = 0.6 + 0.4 * Math.sin(frame * 0.2);
    ctx.fillStyle = `rgba(255,${Math.floor(80 + 100 * pulse)},80,1)`;
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = '#4a5670';
    ctx.fillRect(-14, -18, 28, 17);
    ctx.fillRect(-14, 1, 28, 17);
  }
  ctx.restore();
}
function explodeMark() {
  ctx.fillStyle = '#fa5';
  ctx.fillRect(-4 + Math.random() * 8, -4 + Math.random() * 8, 4, 4);
}

function drawBoss() {
  const b = boss;
  ctx.save();
  ctx.translate(b.x, b.y);
  switch (b.kind) {
    case 'core':
      ctx.fillStyle = '#3d4a63';
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.fillStyle = '#566a8f';
      ctx.fillRect(-b.w / 2 + 10, -b.h / 2 + 10, b.w - 20, b.h - 20);
      ctx.fillStyle = '#2a3346';
      for (let i = -2; i <= 2; i++) ctx.fillRect(-b.w / 2 - 12, i * 30 - 8, 14, 16);
      ctx.restore();
      drawCoreHatch(b.x - 64, b.y, b.open, false);
      break;
    case 'twin':
      ctx.fillStyle = '#33524a';
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.fillStyle = '#4d7a6c';
      ctx.fillRect(-b.w / 2 + 10, -b.h / 2 + 10, b.w - 20, b.h - 20);
      ctx.fillStyle = '#22362f';
      for (let i = -3; i <= 3; i++) ctx.fillRect(-b.w / 2 - 12, i * 32 - 8, 14, 16);
      ctx.restore();
      for (const c of b.cores) drawCoreHatch(b.x - 60, b.y + c.dy, b.open, c.hp <= 0);
      break;
    case 'guardian': {
      // 自作デザインの巨像（角張った兜の巨人）
      ctx.fillStyle = '#7d7a4e';
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.fillStyle = '#9a9272';
      ctx.fillRect(-b.w / 2 + 8, -b.h / 2 + 8, b.w - 16, b.h - 16);
      // 兜
      ctx.fillStyle = '#55523a';
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, 34);
      ctx.fillRect(-b.w / 2 - 14, -b.h / 2 + 6, 16, 60);
      // 口
      ctx.fillStyle = '#3c3826';
      ctx.fillRect(-b.w / 2 + 16, 36, b.w - 40, 14);
      ctx.restore();
      // 目（弱点）
      ctx.save();
      ctx.translate(b.x - 50, b.y - 30);
      ctx.fillStyle = '#2a281c';
      ctx.fillRect(-16, -14, 32, 28);
      if (b.open) {
        const pulse = 0.6 + 0.4 * Math.sin(frame * 0.2);
        ctx.fillStyle = `rgba(255,${Math.floor(120 + 90 * pulse)},60,1)`;
        ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = '#6e684c';
        ctx.fillRect(-12, -4, 24, 8);
      }
      ctx.restore();
      break;
    }
    case 'final':
      ctx.fillStyle = '#5a2e3e';
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.fillStyle = '#7e4458';
      ctx.fillRect(-b.w / 2 + 12, -b.h / 2 + 12, b.w - 24, b.h - 24);
      ctx.fillStyle = '#3a1d28';
      for (let i = -3; i <= 3; i++) ctx.fillRect(-b.w / 2 - 14, i * 36 - 9, 16, 18);
      // 回転リング装飾
      ctx.strokeStyle = `hsla(${frame * 3 % 360},70%,60%,0.5)`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(-84, 0, 26 + Math.sin(frame * 0.1) * 4, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      drawCoreHatch(b.x - 84, b.y, b.open, false);
      break;
  }
  // HPバー
  ctx.fillStyle = '#400';
  ctx.fillRect(W - 220, 12, 200, 8);
  ctx.fillStyle = '#f44';
  ctx.fillRect(W - 220, 12, 200 * Math.max(0, boss.hp) / boss.maxHp, 8);
}

function drawTerrain() {
  const [main, hi] = curTheme().terCol;
  ctx.fillStyle = main;
  for (let i = 0; i < COLS; i++) {
    const x = i * COL_W - terShift;
    if (terTop[i] > 0) ctx.fillRect(x, 0, COL_W + 1, terTop[i]);
    ctx.fillRect(x, PH - terBot[i], COL_W + 1, terBot[i]);
  }
  ctx.fillStyle = hi;
  for (let i = 0; i < COLS; i++) {
    const x = i * COL_W - terShift;
    if (terTop[i] > 0) ctx.fillRect(x, terTop[i] - 3, COL_W + 1, 3);
    ctx.fillRect(x, PH - terBot[i], COL_W + 1, 3);
  }
}

function drawHUD() {
  ctx.fillStyle = '#101428';
  ctx.fillRect(0, PH, W, HUD_H);
  ctx.strokeStyle = '#2c3a66';
  ctx.strokeRect(0.5, PH + 0.5, W - 1, HUD_H - 1);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`1P  ${String(score).padStart(8, '0')}`, 16, PH + 22);
  ctx.fillStyle = '#9ab';
  ctx.fillText(`HI  ${String(Math.max(hiScore, score)).padStart(8, '0')}`, 16, PH + 42);
  ctx.fillStyle = '#fff';
  ctx.fillText(`REST ${lives}  ST ${stage}/${MAX_STAGE}`, 16, PH + 64);

  // パワーメーター
  const mx = 240, my = PH + 38, cw = 84, ch = 26;
  for (let i = 0; i < 6; i++) {
    const sel = player && player.meter === i + 1;
    ctx.fillStyle = sel ? '#ff8c1a' : '#1d2742';
    ctx.fillRect(mx + i * (cw + 4), my, cw, ch);
    ctx.strokeStyle = sel ? '#ffd9a0' : '#3a4a7a';
    ctx.strokeRect(mx + i * (cw + 4) + 0.5, my + 0.5, cw, ch);
    ctx.fillStyle = sel ? '#000' : '#8fa3d0';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(METER_NAMES[i], mx + i * (cw + 4) + cw / 2, my + 17);
  }
  ctx.textAlign = 'left';

  if (player) {
    ctx.fillStyle = '#6fe3ff';
    ctx.font = '11px monospace';
    const eq = [
      `SPD:${player.speedLv}`,
      player.missile ? 'MSL' : '---',
      player.shot.toUpperCase(),
      `OPT:${player.options}`,
      player.shield > 0 ? `SHLD:${player.shield}` : '----',
    ].join('  ');
    ctx.fillText(eq, 240, PH + 22);
    ctx.fillStyle = '#8fa3d0';
    ctx.fillText(curTheme().name, 460, PH + 22);
  }
  if (invincibleCheat) {
    ctx.fillStyle = `hsl(${frame * 7 % 360},100%,65%)`;
    ctx.font = 'bold 13px monospace';
    ctx.fillText('★ MUTEKI ★', 660, PH + 22);
  }
}

function draw() {
  ctx.save();
  if (shakeT > 0) { shakeT--; ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6); }

  ctx.fillStyle = curTheme().bg;
  ctx.fillRect(0, 0, W, PH);
  for (const s of stars) {
    ctx.fillStyle = s.z > 1.2 ? '#cfe0ff' : '#5a6a9a';
    ctx.fillRect(s.x, s.y, s.z > 1.2 ? 2 : 1, s.z > 1.2 ? 2 : 1);
  }

  drawTerrain();

  for (const c of capsules) {
    ctx.save();
    ctx.translate(c.x, c.y + Math.sin(c.t * 0.1) * 3);
    ctx.fillStyle = (frame % 14 < 7) ? '#ff4d4d' : '#ffb0b0';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 7, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(-3, -3, 4, 3);
    ctx.restore();
  }

  for (const e of enemies) if (e.t >= 0) drawEnemy(e);
  if (boss) drawBoss();

  for (const b of bullets) {
    if (b.type === 'laser') {
      ctx.fillStyle = '#aef';
      ctx.fillRect(b.x - b.w / 2, b.y - 2, b.w, 4);
      ctx.fillStyle = '#fff';
      ctx.fillRect(b.x - b.w / 2, b.y - 1, b.w, 2);
    } else if (b.type === 'missile') {
      ctx.fillStyle = '#ffd24d';
      ctx.fillRect(b.x - 4, b.y - 3, 8, 6);
      ctx.fillStyle = '#f80';
      ctx.fillRect(b.x - 7, b.y - 1, 3, 2);
    } else {
      ctx.fillStyle = '#ffe9b0';
      ctx.fillRect(b.x - 6, b.y - 2, 12, 4);
    }
  }

  for (const b of ebullets) {
    ctx.fillStyle = (frame % 8 < 4) ? '#ff7b9c' : '#ffd0dc';
    ctx.beginPath(); ctx.arc(b.x, b.y, 3.5, 0, Math.PI * 2); ctx.fill();
  }

  if (player && player.alive) {
    for (let i = 0; i < player.options; i++) { const o = optionPos(i); drawOption(o.x, o.y); }
    drawShip(player.x, player.y, player.inv > 0 && !invincibleCheat);
    if (player.shield > 0) {
      ctx.strokeStyle = `rgba(120,200,255,${0.4 + 0.2 * Math.sin(frame * 0.2)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(player.x + 6, player.y, 20, -1.1, 1.1);
      ctx.stroke();
    }
  }

  for (const p of parts) {
    ctx.globalAlpha = Math.max(0, p.life / 40);
    ctx.fillStyle = p.col;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  }
  ctx.globalAlpha = 1;

  drawHUD();

  // ステージ開始バナー
  if (introT > 0) {
    introT--;
    const a = Math.min(1, introT / 30);
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`STAGE ${stage}`, W / 2, PH / 2 - 30);
    ctx.font = 'bold 22px "Hiragino Kaku Gothic ProN", monospace';
    ctx.fillText(`〜 ${curTheme().name} 〜`, W / 2, PH / 2 + 10);
    ctx.textAlign = 'left';
  }

  if (cheatFlash > 0) {
    cheatFlash--;
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, cheatFlash / 30) * 0.9})`;
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(invincibleCheat ? '★ INVINCIBLE MODE ON ★' : 'INVINCIBLE MODE OFF', W / 2, 80);
    ctx.textAlign = 'left';
  }

  if (paused) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, PH);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSE', W / 2, PH / 2);
    ctx.textAlign = 'left';
  }
  ctx.restore();
}

function drawTitle() {
  ctx.fillStyle = '#03040f';
  ctx.fillRect(0, 0, W, H);
  for (const s of stars) {
    ctx.fillStyle = s.z > 1.2 ? '#cfe0ff' : '#5a6a9a';
    ctx.fillRect(s.x, s.y, 2, 2);
  }
  ctx.textAlign = 'center';
  ctx.font = 'bold 72px "Hiragino Kaku Gothic ProN", monospace';
  const grad = ctx.createLinearGradient(0, 150, 0, 230);
  grad.addColorStop(0, '#e8f2ff');
  grad.addColorStop(0.5, '#6fa8ff');
  grad.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = grad;
  ctx.fillText('グラディウス', W / 2, 210);
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#8fa3d0';
  ctx.fillText('— HOMAGE EDITION / ALL 30 STAGES —', W / 2, 245);

  ctx.fillStyle = (frame % 60 < 36) ? '#fff' : 'rgba(255,255,255,0.2)';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('PUSH ENTER KEY', W / 2, 340);

  ctx.fillStyle = '#9ab';
  ctx.font = '14px monospace';
  ctx.fillText('矢印キー: 移動   Z: ショット   X: パワーアップ   P: ポーズ', W / 2, 410);
  ctx.fillText('カプセルを集めてメーターを進め、Xで発動せよ', W / 2, 435);
  ctx.fillText('全30ステージ / 10テーマ×3周', W / 2, 460);

  if (invincibleCheat) {
    ctx.fillStyle = `hsl(${frame * 7 % 360},100%,65%)`;
    ctx.font = 'bold 14px monospace';
    ctx.fillText('★ INVINCIBLE MODE ★', W / 2, 495);
  }
  ctx.fillStyle = '#556';
  ctx.font = '12px monospace';
  ctx.fillText(`HI-SCORE ${String(hiScore).padStart(8, '0')}`, W / 2, 560);
  ctx.textAlign = 'left';

  if (cheatFlash > 0) {
    cheatFlash--;
    ctx.fillStyle = `rgba(255,255,80,${Math.min(1, cheatFlash / 30)})`;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(invincibleCheat ? '★ INVINCIBLE MODE ON ★' : 'INVINCIBLE MODE OFF', W / 2, 525);
    ctx.textAlign = 'left';
  }
}

function drawGameOver() {
  draw();
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f55';
  ctx.font = 'bold 48px monospace';
  ctx.fillText('GAME OVER', W / 2, H / 2 - 20);
  ctx.fillStyle = '#fff';
  ctx.font = '18px monospace';
  ctx.fillText(`SCORE ${score}   REACHED STAGE ${stage}`, W / 2, H / 2 + 30);
  ctx.fillStyle = (frame % 60 < 36) ? '#ccc' : 'rgba(200,200,200,0.2)';
  ctx.fillText('PUSH ENTER KEY', W / 2, H / 2 + 70);
  ctx.textAlign = 'left';
}

function drawEnding() {
  ctx.fillStyle = '#03040f';
  ctx.fillRect(0, 0, W, H);
  for (const s of stars) {
    ctx.fillStyle = s.z > 1.2 ? '#cfe0ff' : '#5a6a9a';
    ctx.fillRect(s.x, s.y, 2, 2);
  }
  drawShip(W / 2 + Math.sin(frame * 0.02) * 60, H - 90 + Math.cos(frame * 0.03) * 16, false);
  ctx.textAlign = 'center';
  ctx.fillStyle = `hsl(${frame * 2 % 360},80%,70%)`;
  ctx.font = 'bold 52px monospace';
  ctx.fillText('ALL 30 STAGES CLEAR!', W / 2, 180);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px "Hiragino Kaku Gothic ProN", monospace';
  ctx.fillText('銀河に平和が戻った……', W / 2, 240);
  ctx.font = '18px monospace';
  ctx.fillText(`FINAL SCORE ${String(score).padStart(8, '0')}`, W / 2, 300);
  ctx.fillText(`HI-SCORE    ${String(hiScore).padStart(8, '0')}`, W / 2, 330);
  ctx.fillStyle = (frame % 60 < 36) ? '#ccc' : 'rgba(200,200,200,0.2)';
  ctx.fillText('PUSH ENTER KEY', W / 2, 420);
  ctx.textAlign = 'left';
}

/* ---------------- メインループ ---------------- */
function update() {
  updateStars();
  if (state !== 'play' || paused) return;
  updateTerrain();
  spawner();
  updatePlayer();
  updateEnemies();
  updateBoss();
  updateBullets();
  updateEBullets();
  updateCollisions();
  for (const p of parts) { p.x += p.vx; p.y += p.vy; p.life--; }
  parts = parts.filter(p => p.life > 0);
}

function loop() {
  frame++;
  update();
  if (state === 'title') drawTitle();
  else if (state === 'gameover') drawGameOver();
  else if (state === 'ending') drawEnding();
  else draw();
  requestAnimationFrame(loop);
}

initStars();
initTerrain();
loop();


/* ---------------- タッチ操作（スマホ用バーチャルパッド） ----------------
   keys[] を直接操作する方式。
   以前は new KeyboardEvent を dispatch していたが、一部モバイルブラウザ
   （iOS Safari 等）では構築した KeyboardEvent の code が反映されず、
   方向入力が効かなかった。確実に動かすため keys[] を直接立てる。
   スティック: 8方向（しきい値超えで該当ArrowキーON、斜め対応）
   SHOT/POW: 押している間 KeyZ/KeyX 押下扱い
   ---------------------------------------------------------------- */
(() => {
  const ui = document.getElementById('touch-ui');
  if (!ui) return;

  // ---- バーチャルスティック（方向） ----
  const stick = document.getElementById('stick');
  const knob = document.getElementById('stick-knob');
  let stickId = null;

  function setDir(up, down, left, right) {
    keys['ArrowUp'] = up;
    keys['ArrowDown'] = down;
    keys['ArrowLeft'] = left;
    keys['ArrowRight'] = right;
  }
  function stickMove(t) {
    const r = stick.getBoundingClientRect();
    let dx = t.clientX - (r.left + r.width / 2);
    let dy = t.clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy), maxLen = r.width * 0.32;
    if (len > maxLen) { dx *= maxLen / len; dy *= maxLen / len; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    const th = r.width * 0.08; // デッドゾーン
    setDir(dy < -th, dy > th, dx < -th, dx > th);
  }
  function stickReset() {
    stickId = null;
    knob.style.transform = '';
    setDir(false, false, false, false);
  }
  if (stick && knob) {
    stick.addEventListener('touchstart', e => {
      e.preventDefault();
      initAudio();
      if (stickId === null) { const t = e.changedTouches[0]; stickId = t.identifier; stickMove(t); }
    }, { passive: false });
    stick.addEventListener('touchmove', e => {
      e.preventDefault();
      for (const t of e.changedTouches) if (t.identifier === stickId) stickMove(t);
    }, { passive: false });
    for (const ev of ['touchend', 'touchcancel']) {
      stick.addEventListener(ev, e => {
        e.preventDefault();
        for (const t of e.changedTouches) if (t.identifier === stickId) stickReset();
      }, { passive: false });
    }
  }

  // ---- ホールド式ボタン（SHOT / POW） ----
  function holdButton(id, code) {
    const b = document.getElementById(id);
    if (!b) return;
    b.addEventListener('touchstart', e => {
      e.preventDefault();
      initAudio();
      b.classList.add('on');
      keys[code] = true;
    }, { passive: false });
    for (const ev of ['touchend', 'touchcancel']) {
      b.addEventListener(ev, e => {
        e.preventDefault();
        b.classList.remove('on');
        keys[code] = false;
      }, { passive: false });
    }
  }
  holdButton('btn-shot', 'KeyZ');
  holdButton('btn-pow', 'KeyX');

  // ---- ポーズ（タップ） ----
  const bp = document.getElementById('btn-pause');
  if (bp) {
    bp.addEventListener('touchstart', e => {
      e.preventDefault();
      initAudio();
      bp.classList.add('on');
      if (state === 'play') paused = !paused;
    }, { passive: false });
    for (const ev of ['touchend', 'touchcancel']) {
      bp.addEventListener(ev, e => {
        e.preventDefault();
        bp.classList.remove('on');
      }, { passive: false });
    }
  }

  // ---- 画面タップで開始（タイトル/ゲームオーバー時のEnter相当） ----
  cv.addEventListener('touchstart', e => {
    e.preventDefault();
    initAudio();
    if (state === 'title') startGame();
    else if (state === 'gameover' || state === 'ending') state = 'title';
  }, { passive: false });
})();
