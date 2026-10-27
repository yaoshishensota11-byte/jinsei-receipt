// 「暮らしの風景」：上の欄の下に、ドット絵の自分と家族、住まいを描く帯。
// 画像は使わず、すべて小さな四角（1マス＝数ピクセル）で描く。年齢・服装・家族・その年の出来事で絵が変わる。
import type { Life } from "../engine/sim";
import type { LifeEvent } from "../engine/types";

const CELL = 3; // 1マスの大きさ（CSSピクセル）
const ROWS = 32; // 帯の高さ（マス）
const GROUND = 29; // 地面の行

type Stage = "baby" | "kid" | "teen" | "adult" | "elder";
type Outfit = "onesie" | "kid" | "uniform" | "suit" | "work" | "apron" | "casual" | "hoodie" | "cardigan" | "dress" | "kimono" | "hakama";
type Mood = "neutral" | "smile" | "joy" | "sad";

interface Person {
  stage: Stage;
  female: boolean;
  outfit: Outfit;
  mood: Mood;
  skin: string;
  hair: string;
  shirt: string;
  self?: boolean;
  /** 幼稚園・保育園の黄色い帽子 */
  hat?: boolean;
  /** ランドセルの色 */
  bag?: string;
  /** よちよち歩き */
  toddle?: boolean;
}

const INK = "#2b2620";
// 肌の色は、生まれた地域でよく見られる幅の中から選ぶ（家族はその幅でそろえる）
const SKIN_LIGHT = ["#f6d7b8", "#efc9a4"];
const SKIN_MID = ["#e2b088", "#c98f62"];
const SKIN_DARK = ["#9b6640", "#7a4c2e", "#6f4528"];
const SSA = "NGA COD ETH TZA UGA KEN AGO MOZ ZAF MDG CIV CMR GHA ZMB MWI ZWE BEN BDI RWA TGO SLE COG NER MLI TCD BFA GIN SOM SSD SDN SEN CAF HTI";
const MID = "IND PAK BGD NPL LKA AFG IDN PHL MYS THA KHM MMR VNM EGY IRN IRQ TUR DZA MAR SYR JOR YEM SAU UZB TJK BRA MEX COL PER ARG VEN GTM ECU BOL HND DOM CHL PNG ISR";
function skinsFor(iso3: string): string[] {
  return SSA.includes(iso3) ? SKIN_DARK : MID.includes(iso3) ? SKIN_MID : SKIN_LIGHT;
}
const HAIRS = ["#2b2118", "#4a3020", "#6b4a2c", "#1c1c1c"];
const SHIRTS = ["#d9534f", "#4f7fbf", "#5aa469", "#e0a43a", "#8a6bbf", "#3fa7a3"];

function stageOf(age: number): Stage {
  return age < 2 ? "baby" : age < 12 ? "kid" : age < 18 ? "teen" : age < 65 ? "adult" : "elder";
}

/** 0〜1 の決まった値（同じ人生なら毎回同じ見た目にする） */
function pick<T>(arr: T[], key: string): T {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return arr[(h >>> 0) % arr.length];
}

/** その年の出来事から、表情を決める */
export function moodOf(events: LifeEvent[]): Mood {
  const t = events.map((e) => e.text).join("\n");
  if (/亡くなった|入院|がん|病気|失業|解雇|災害|浸水|避難|盗|離婚|暴力|跳ね上がり|上昇率|別れた|寝込んだ|熱を出して|大泣き/.test(t)) return "sad";
  if (/結婚|生まれた|合格|入学|昇進|昇給|当選|当たった|卒業|付き合いはじめ|一人立ち|独立|家を買った|笑う|笑った|歩いた|歩けた|歩き出|七五三|ランドセル|誕生日|乗れるよう/.test(t)) return "joy";
  return events.length ? "smile" : "neutral";
}

/** その年だけの特別な場面 */
export type Special = "" | "hospital" | "wedding" | "disaster" | "lucky";

/** 小さいころの出来事に合わせた見た目 */
interface Early {
  toddle: boolean;
  kimono: boolean;
  hakama: boolean;
  randoseru: boolean;
  kinder: boolean;
}

function earlyOf(events: LifeEvent[]): Early {
  const t = events.map((e) => e.text).join("\n");
  return {
    toddle: /歩いた|歩けた|歩き出/.test(t),
    kimono: /着物/.test(t),
    hakama: /はかま/.test(t),
    randoseru: /ランドセル/.test(t),
    kinder: /幼稚園|保育園/.test(t),
  };
}

export function specialOf(events: LifeEvent[]): Special {
  const t = events.map((e) => e.text).join("\n");
  if (/入院|がんが見つかり|手術/.test(t)) return "hospital";
  if (/結婚した|届けだけで結婚|と結婚した|約束どおり結婚|結婚を決めた/.test(t)) return "wedding";
  if (/浸水|地震|災害|雨が降らず|避難|川があふれ/.test(t)) return "disaster";
  if (/宝くじ|当たった|当選|遺産|受け継いだ/.test(t)) return "lucky";
  return "";
}

function outfitOf(l: Life, age: number): Outfit {
  if (age < 2) return "onesie";
  if (age < 12) return "kid";
  if (l.school !== "done" && l.school !== "child" && age < 23) return age < 18 ? "uniform" : "hoodie";
  if (age >= 65 || l.job === "retired") return "cardigan";
  switch (l.job) {
    case "big":
    case "civil":
    case "founder":
      return "suit";
    case "sme":
      return l.region.urban === false ? "work" : "suit";
    case "nonregular":
      return "apron";
    case "freelance":
      return "hoodie";
    default:
      return "casual";
  }
}

/** いまの暮らしに登場する人たち（並ぶ順は左から） */
function cast(l: Life, mood: Mood, a: number): Person[] {
  // a は画面に出ている年齢（ゲームは1年先まで計算しているので、l.age とは1年ずれることがある）
  const lag = l.age - a;
  const seed = l.seed;
  const skins = skinsFor(l.D.iso3);
  const skin = pick(skins, seed + "skin");
  const hair = pick(HAIRS, seed + "hair");
  const me: Person = {
    stage: stageOf(a),
    female: l.sex === "female",
    outfit: outfitOf(l, a),
    mood,
    skin,
    hair: a >= 65 ? "#b8b2a8" : hair,
    shirt: pick(SHIRTS, seed + "shirt"),
    self: true,
  };
  const left: Person[] = [];
  const right: Person[] = [];
  // 実家にいる間は親が一緒
  if (l.home === "parents") {
    l.parents.forEach((p, i) => {
      if (!p.alive) return;
      const pa = p.age + a;
      left.push({ stage: stageOf(pa), female: i === 1, outfit: pa >= 65 ? "cardigan" : i === 0 ? "suit" : "apron", mood: mood === "joy" ? "smile" : mood, skin, hair: pa >= 60 ? "#b8b2a8" : pick(HAIRS, seed + "p" + i), shirt: pick(SHIRTS, seed + "ps" + i) });
    });
  }
  const p = l.partner;
  if (p && p.alive) {
    const pAge = p.age - lag;
    right.push({ stage: stageOf(pAge), female: p.sex === "female", outfit: pAge >= 65 ? "cardigan" : p.work === "regular" ? "suit" : "casual", mood: mood === "joy" ? "smile" : mood, skin: pick(skins, seed + "pskin"), hair: pAge >= 65 ? "#b8b2a8" : pick(HAIRS, seed + "phair"), shirt: pick(SHIRTS, seed + "pshirt") });
  }
  // 巣立つ前の子ども
  l.kids.forEach((k, i) => {
    const ka = a - k.born;
    const home = k.leftAge === undefined && (ka < (k.univ ? 22 : 18) || k.stayHome);
    if (!home || ka < 0) return;
    right.push({ stage: stageOf(ka), female: pick([true, false], seed + "kid" + i), outfit: ka < 2 ? "onesie" : ka < 12 ? "kid" : ka < 18 ? "uniform" : "casual", mood: mood === "joy" ? "joy" : mood === "sad" ? "sad" : "smile", skin, hair: pick(HAIRS, seed + "kh" + i), shirt: pick(SHIRTS, seed + "ks" + i) });
  });
  return [...left, me, ...right].slice(0, 7);
}

// ───────────── 描く ─────────────

type Px = (x: number, y: number, w: number, h: number, c: string) => void;

const SIZE: Record<Stage, { head: number; body: number; legs: number; w: number }> = {
  baby: { head: 6, body: 4, legs: 1, w: 6 },
  kid: { head: 7, body: 5, legs: 4, w: 8 },
  teen: { head: 8, body: 7, legs: 6, w: 9 },
  adult: { head: 8, body: 9, legs: 8, w: 10 },
  elder: { head: 8, body: 8, legs: 7, w: 10 },
};

function widthOf(p: Person): number {
  return SIZE[p.stage].w + 4;
}

function drawPerson(px: Px, p: Person, x: number, bob: number): void {
  const s = SIZE[p.stage];
  const h = s.head + s.body + s.legs;
  const jump = p.mood === "joy" ? bob * 2 : 0;
  const top = GROUND - h - jump + (p.mood === "joy" ? 0 : bob);
  const cx = x + 2 + (p.toddle ? (bob ? 1 : -1) : 0); // 体の左端（よちよち歩きは左右に揺れる）
  const pants = p.outfit === "suit" ? "#2f3440" : p.outfit === "work" ? "#3d5a80" : p.outfit === "uniform" ? (p.female ? "#2c3e66" : "#1f2533") : "#4a4f5a";
  let shirt = p.shirt;
  if (p.outfit === "suit") shirt = "#2f3440";
  if (p.outfit === "uniform") shirt = p.female ? "#f4f2ec" : "#1f2533";
  if (p.outfit === "work") shirt = "#3d5a80";
  if (p.outfit === "cardigan") shirt = "#b49a76";
  if (p.outfit === "onesie") shirt = "#f1c6d3";
  if (p.outfit === "dress") shirt = "#fbfaf6";
  if (p.outfit === "kimono") shirt = "#d9534f";
  if (p.outfit === "hakama") shirt = "#2b2620";

  // 脚
  const legY = top + s.head + s.body;
  if (p.stage === "baby") px(cx + 1, legY, s.w - 2, 1, shirt);
  else {
    const lw = Math.max(2, Math.floor(s.w / 2) - 1);
    if (p.female && (p.stage === "teen" || p.stage === "adult") && p.outfit !== "work" && p.outfit !== "suit") {
      // スカート
      px(cx, legY, s.w, 2, p.outfit === "uniform" ? "#2c3e66" : pants);
      px(cx + 1, legY + 2, lw, s.legs - 3, p.skin);
      px(cx + s.w - 1 - lw, legY + 2, lw, s.legs - 3, p.skin);
    } else {
      px(cx + 1, legY, lw, s.legs - 1, pants);
      px(cx + s.w - 1 - lw, legY, lw, s.legs - 1, pants);
    }
    px(cx, legY + s.legs - 1, lw + 1, 1, INK);
    px(cx + s.w - 1 - lw, legY + s.legs - 1, lw + 1, 1, INK);
    if (p.outfit === "kimono") px(cx, legY, s.w, s.legs - 1, shirt);
    if (p.outfit === "hakama") {
      px(cx, legY, s.w, s.legs - 1, "#8a8f99");
      for (let i = 1; i < s.w; i += 2) px(cx + i, legY, 1, s.legs - 1, "#6f7480");
    }
  }
  // 胴と腕
  const bodyY = top + s.head;
  if (p.bag) {
    px(cx - 3, bodyY, 3, s.body + 1, p.bag);
    px(cx - 3, bodyY, 3, 1, "#00000033");
  }
  px(cx, bodyY, s.w, s.body, shirt);
  if (p.outfit === "kimono") px(cx, bodyY + Math.floor(s.body / 2), s.w, 2, "#e8c547"); // 帯
  if (p.outfit === "hakama") px(cx + 1, bodyY, s.w - 2, 1, "#f4f2ec"); // 白いえり
  const armDown = p.mood === "joy" || p.toddle ? -2 : 0;
  px(cx - 1, bodyY + 1 + armDown, 1, s.body - 2, shirt);
  px(cx + s.w, bodyY + 1 + armDown, 1, s.body - 2, shirt);
  px(cx - 1, bodyY + s.body - 1 + armDown, 1, 1, p.skin);
  px(cx + s.w, bodyY + s.body - 1 + armDown, 1, 1, p.skin);
  if (p.outfit === "suit") {
    px(cx + Math.floor(s.w / 2) - 1, bodyY, 2, 3, "#f4f2ec");
    px(cx + Math.floor(s.w / 2) - 1, bodyY + 1, 1, 4, "#c8302c");
  }
  if (p.outfit === "uniform") {
    px(cx, bodyY, s.w, 1, p.female ? "#2c3e66" : "#c9a227");
    if (p.female) px(cx + Math.floor(s.w / 2) - 1, bodyY + 1, 2, 2, "#c8302c");
  }
  if (p.outfit === "apron") px(cx + 1, bodyY + 2, s.w - 2, s.body - 1, "#f4f2ec");
  if (p.outfit === "work") px(cx + 1, bodyY + 1, 2, 2, "#e0a43a");
  if (p.outfit === "hoodie") px(cx + 1, bodyY, s.w - 2, 1, "#00000022");

  // 頭
  const hx = cx + Math.floor((s.w - s.head) / 2);
  px(hx, top, s.head, s.head, p.skin);
  // 髪
  const longHair = p.female && p.stage !== "baby";
  px(hx - (p.stage === "baby" ? 0 : 1), top - 1, s.head + (p.stage === "baby" ? 0 : 2), p.stage === "baby" ? 1 : 3, p.hair);
  if (longHair) {
    px(hx - 1, top + 2, 1, s.head + (p.stage === "kid" ? 0 : 2), p.hair);
    px(hx + s.head, top + 2, 1, s.head + (p.stage === "kid" ? 0 : 2), p.hair);
  } else if (p.stage !== "baby") {
    px(hx - 1, top + 2, 1, 2, p.hair);
    px(hx + s.head, top + 2, 1, 2, p.hair);
  }
  if (p.outfit === "work") px(hx - 1, top - 2, s.head + 2, 2, "#e8c547"); // ヘルメット
  if (p.hat) {
    px(hx - 1, top - 2, s.head + 2, 2, "#f2c94c"); // 幼稚園・保育園の黄色い帽子
    px(hx - 2, top, s.head + 4, 1, "#e0b43a");
  }
  if (p.outfit === "dress") {
    // ドレスの裾とベール
    px(cx - 1, legY, s.w + 2, s.legs - 1, "#fbfaf6");
    px(hx - 1, top - 1, s.head + 2, 1, "#ffffff");
    px(hx - 2, top, 1, s.head + 3, "#ffffffcc");
    px(hx + s.head + 1, top, 1, s.head + 3, "#ffffffcc");
  }
  // 顔
  const ey = top + Math.floor(s.head / 2);
  const el = hx + 2;
  const er = hx + s.head - 3;
  if (p.mood === "sad") {
    px(el, ey, 1, 1, INK);
    px(er, ey, 1, 1, INK);
    px(er + 1, ey + 1, 1, 2, "#6fa8dc"); // 涙
    px(hx + Math.floor(s.head / 2) - 1, ey + 3, 2, 1, INK);
    px(hx + Math.floor(s.head / 2) - 2, ey + 4, 1, 1, INK);
    px(hx + Math.floor(s.head / 2) + 1, ey + 4, 1, 1, INK);
  } else {
    px(el, ey, 1, 1, INK);
    px(er, ey, 1, 1, INK);
    if (p.mood === "neutral") px(hx + Math.floor(s.head / 2) - 1, ey + 2, 2, 1, INK);
    else {
      px(hx + Math.floor(s.head / 2) - 2, ey + 2, 1, 1, INK);
      px(hx + Math.floor(s.head / 2) - 1, ey + 3, 2, 1, INK);
      px(hx + Math.floor(s.head / 2) + 1, ey + 2, 1, 1, INK);
      px(el - 1, ey + 1, 1, 1, "#e89a8a");
      px(er + 1, ey + 1, 1, 1, "#e89a8a");
    }
  }
  if (p.stage === "elder" && p.self) {
    // 杖
    px(cx + s.w + 2, bodyY + 3, 1, s.body + s.legs - 3, "#7a5a3a");
    px(cx + s.w + 1, bodyY + 3, 1, 1, "#7a5a3a");
  }
  // うれしい年はきらきら
  if (p.mood === "joy" && p.self) {
    const kx = hx + s.head + 2;
    px(kx, top - 3, 1, 3, "#e0a43a");
    px(kx - 1, top - 2, 3, 1, "#e0a43a");
  }
}

function drawScene(px: Px, cols: number, l: Life, rural: boolean): void {
  // 空と地面
  px(0, 0, cols, GROUND, "#efe9dc");
  px(0, GROUND, cols, ROWS - GROUND, rural ? "#b9c79a" : "#cfc6b4");
  if (rural) {
    // 畑と木
    for (let x = 2; x < cols; x += 9) px(x, GROUND + 1, 5, 1, "#93a874");
    const tx = cols - 10;
    px(tx + 2, GROUND - 7, 2, 7, "#7a5a3a");
    px(tx, GROUND - 13, 6, 6, "#7fa36a");
  } else {
    // 遠くの街
    const tops = [9, 14, 7, 12, 16, 10, 13, 8];
    for (let i = 0, x = 0; x < cols; i++, x += 7) px(x, GROUND - tops[i % tops.length], 6, tops[i % tops.length], "#e1d9c8");
  }
  // 住まい（左に置く）
  const hx = 3;
  if (l.home === "rent") {
    px(hx, GROUND - 20, 16, 20, "#d8cbb4");
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) px(hx + 2 + c * 5, GROUND - 18 + r * 5, 3, 3, "#9fb6c9");
    px(hx + 6, GROUND - 4, 4, 4, "#8a6a4a");
  } else {
    const own = l.home === "own";
    const w = own ? 18 : 16;
    px(hx, GROUND - 11, w, 11, own ? "#e8d9bf" : "#e3d3b8");
    for (let i = 0; i < 6; i++) px(hx - 1 + i, GROUND - 12 - i, w + 2 - i * 2, 1, own ? "#b5503c" : "#8c6b4a");
    px(hx + 3, GROUND - 7, 4, 4, "#9fb6c9");
    px(hx + w - 7, GROUND - 6, 4, 6, "#8a6a4a");
  }
}

/** 入院中：自分はベッドで寝ている */
function drawBed(px: Px, p: Person, x: number): void {
  const y = GROUND - 7;
  px(x, y + 2, 24, 4, "#f4f2ec"); // 掛け布団の下のベッド
  px(x, y + 6, 2, 1, "#9aa3ad");
  px(x + 22, y + 6, 2, 1, "#9aa3ad");
  px(x - 1, y - 2, 2, 9, "#9aa3ad"); // 頭側の柵
  px(x + 23, y, 2, 7, "#9aa3ad");
  px(x + 1, y, 6, 3, "#ffffff"); // まくら
  px(x + 2, y - 3, 6, 5, p.skin); // 顔
  px(x + 2, y - 4, 6, 2, p.hair);
  px(x + 4, y - 1, 1, 1, INK);
  px(x + 6, y - 1, 1, 1, INK);
  px(x + 7, y, 15, 3, "#8fb3d9"); // 掛け布団
  // 赤十字
  px(x + 10, GROUND - 22, 6, 6, "#ffffff");
  px(x + 12, GROUND - 21, 2, 4, "#c8302c");
  px(x + 11, GROUND - 20, 4, 2, "#c8302c");
}

/** 出稼ぎ中：自分は遠く（右端）にいて、空に飛行機 */
function drawPlane(px: Px, x: number, y: number): void {
  px(x, y + 2, 12, 2, "#8a96a3");
  px(x + 3, y, 3, 2, "#8a96a3");
  px(x + 4, y + 4, 4, 2, "#8a96a3");
  px(x + 10, y + 1, 2, 1, "#8a96a3");
  px(x + 1, y + 2, 1, 1, "#d9e4ee");
}

function drawWeather(px: Px, cols: number, special: Special, frame: number): void {
  if (special === "disaster") {
    for (let x = 1 + frame; x < cols; x += 5) for (let y = 2 + ((x * 7) % 5); y < GROUND - 2; y += 7) px(x, y, 1, 3, "#7ea6c9");
    px(0, GROUND - 2, cols, 2, "#7ea6c9aa"); // 水があふれる
  }
  if (special === "lucky") {
    for (let i = 0; i < 9; i++) {
      const x = (i * 23 + 7) % cols;
      const y = ((i * 11 + frame * 3) % (GROUND - 6)) + 1;
      px(x, y, 3, 3, "#e0b43a");
      px(x + 1, y + 1, 1, 1, "#fff2b3");
    }
  }
}

export class LifeScene {
  readonly el: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private frame = 0;
  private timer = 0;
  private life: Life | null = null;
  private mood: Mood = "neutral";
  private special: Special = "";
  private early: Early = earlyOf([]);
  private age = 0;
  private still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  constructor() {
    this.el = document.createElement("canvas");
    this.el.className = "scene";
    this.el.setAttribute("aria-hidden", "true");
    this.ctx = this.el.getContext("2d")!;
    if (!this.still) this.timer = window.setInterval(() => this.tick(), 450);
  }

  /** 年が変わったとき、または出来事が出たときに呼ぶ */
  update(l: Life, events: LifeEvent[], age = l.age): void {
    this.life = l;
    this.age = age;
    this.mood = moodOf(events);
    this.special = specialOf(events);
    this.early = earlyOf(events);
    this.draw();
  }

  stop(): void {
    window.clearInterval(this.timer);
  }

  private tick(): void {
    if (!this.el.isConnected) return this.stop();
    this.frame ^= 1;
    this.draw();
  }

  private draw(): void {
    const l = this.life;
    if (!l) return;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const cssW = this.el.clientWidth || 360;
    const cols = Math.ceil(cssW / CELL);
    const W = Math.round(cssW * dpr);
    const H = Math.round(ROWS * CELL * dpr);
    if (this.el.width !== W || this.el.height !== H) {
      this.el.width = W;
      this.el.height = H;
    }
    const k = CELL * dpr;
    const ctx = this.ctx;
    const px: Px = (x, y, w, h, c) => {
      ctx.fillStyle = c;
      ctx.fillRect(Math.round(x * k), Math.round(y * k), Math.ceil(w * k), Math.ceil(h * k));
    };
    drawScene(px, cols, l, l.region.urban === false);
    const sp = this.special;
    drawWeather(px, cols, sp, this.frame);
    const people = cast(l, this.mood, this.age);
    const me = people.find((p) => p.self)!;
    // 小さいころの出来事に合わせた見た目
    const e = this.early;
    if (this.age <= 6) {
      if (e.toddle) {
        me.toddle = true;
        if (me.stage === "baby") me.stage = "kid";
      }
      if (e.kimono) me.outfit = "kimono";
      if (e.hakama) me.outfit = "hakama";
      if (e.kinder) me.hat = true;
      if (e.randoseru) me.bag = me.female ? "#c8302c" : "#2b2620";
    }
    // 結婚の年：花嫁は白いドレス、花婿はスーツ。上にハート
    if (sp === "wedding") {
      // 並びは「親、自分、相手、子ども」なので、相手は自分のすぐ右
      const partner = l.partner && l.partner.alive ? people[people.indexOf(me) + 1] : undefined;
      for (const p of [me, partner]) {
        if (!p || (p.stage !== "adult" && p.stage !== "elder")) continue;
        p.outfit = p.female ? "dress" : "suit";
        p.mood = "joy";
      }
    }
    const abroad = l.abroad && this.age < l.abroadUntil;
    const standing = people.filter((p) => !((sp === "hospital" || abroad) && p.self));
    const total = standing.reduce((t, p) => t + widthOf(p), 0) + (sp === "hospital" ? 28 : 0);
    let x = Math.max(24, Math.floor((cols - total - (abroad ? 20 : 0)) / 2) + 6);
    for (const p of people) {
      if (p.self && sp === "hospital") {
        drawBed(px, p, x + 1);
        x += 28;
        continue;
      }
      if (p.self && abroad) continue;
      drawPerson(px, p, x, p.self || p.mood === "joy" ? this.frame : 0);
      x += widthOf(p);
    }
    if (abroad) {
      // 家族と離れて、遠くで働いている
      const fx = cols - widthOf(me) - 2;
      for (let y = 4; y < GROUND; y += 3) px(fx - 3, y, 1, 1, "#b9ad97");
      drawPerson(px, { ...me, outfit: "work", mood: me.mood === "joy" ? "smile" : me.mood }, fx, this.frame);
      drawPlane(px, fx - 18 + this.frame, 2);
    }
    if (sp === "wedding") {
      const hx = Math.floor(cols / 2) + 2;
      px(hx, 2, 2, 2, "#e06a7a");
      px(hx + 3, 2, 2, 2, "#e06a7a");
      px(hx, 3, 5, 2, "#e06a7a");
      px(hx + 1, 5, 3, 1, "#e06a7a");
      px(hx + 2, 6, 1, 1, "#e06a7a");
    }
  }
}
