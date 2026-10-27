// 紹介ページ（public/lp/）に載せる画像を、いまのゲームから作る。
// 使い方: npx vite --port 5199 & node scripts/lpassets.mjs
// 作るもの:
//   img/s-*.webp     ゲーム画面（タイトル・誕生・プレイ中・選択・レシート）
//   img/film.png     ドット絵で一生が進む様子（1年2コマ）と film.json（年齢と出来事）
//   img/c-*.png      ドット絵の人物の一覧（cast.json）
//   img/r-*.webp     国ごとのレシート（compare.json）
import { chromium, devices } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = "http://localhost:5199";
const OUT = "public/lp/img";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();

/** PNG を webp に（幅をそろえる） */
function toWebp(png, out, width) {
  execFileSync("python3", ["-I", "-c", `
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGB")
w = int(sys.argv[3])
if im.width != w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
im.save(sys.argv[2], "WEBP", quality=82, method=6)
`, png, out, String(width)]);
}

// ───── 1. ゲーム画面 ─────
{
  const ctx = await b.newContext({ ...devices["iPhone 13"], deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const shot = async (name) => {
    const tmp = `${OUT}/_${name}.png`;
    await p.screenshot({ path: tmp });
    toWebp(tmp, `${OUT}/s-${name}.webp`, 780);
    execFileSync("rm", [tmp]);
    console.log("画面", name);
  };
  await p.goto(`${BASE}/`);
  await p.waitForSelector(".mode");
  await p.waitForTimeout(800);
  await shot("title");

  // 誕生の画面（ゆっくり回して、全部そろったところ）
  await p.goto(`${BASE}/?seed=lpbirth7`);
  await p.click('.mode[data-mode="w"]');
  await p.waitForFunction(() => document.querySelector("#go")?.style.visibility === "visible", null, { timeout: 30000 });
  await p.waitForTimeout(300);
  await shot("birth");

  // 働き方の選択：自動では選ばず、ほかの選択は1番目を押して進め、働き方の場面で止める
  await p.goto(`${BASE}/?seed=lpplay3&turbo=6`);
  await p.click('.mode[data-mode="m"]');
  await p.waitForFunction(() => document.querySelector("#go")?.style.visibility === "visible");
  await p.click("#go");
  for (let i = 0; i < 80; i++) {
    await p.waitForSelector(".sheet .opt", { timeout: 120000 });
    const t = await p.textContent(".sheet h2");
    if (/働き方/.test(t ?? "")) {
      await p.waitForTimeout(700);
      await shot("choice");
      break;
    }
    await p.click(".sheet .opt");
    await p.waitForSelector(".sheet-bg", { state: "detached" });
  }

  // プレイ中（30歳ごろ）
  await p.goto(`${BASE}/?seed=lpplay3&mode=m&turbo=4&auto`);
  // 選択の画面が出ていない、出来事が3つ以上並んだところ
  await p.waitForFunction(() => Number(document.querySelector("#age")?.firstChild?.textContent) >= 31 && !document.querySelector(".sheet-bg") && document.querySelectorAll("#feed > *").length >= 3, null, { timeout: 120000, polling: 50 });
  await shot("play");
  await p.waitForFunction(() => window.__result, null, { timeout: 300000 });
  await p.waitForTimeout(600);
  await shot("result");
  await ctx.close();
}

// ───── 2〜4. ドット絵とレシート（ゲームのコードをそのまま読み込んで描く） ─────
const ctx = await b.newContext({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`${BASE}/`);
await p.waitForSelector(".mode");

const data = await p.evaluate(async () => {
  const sim = await import("/src/engine/sim.ts");
  const res = await import("/src/engine/result.ts");
  const world = await import("/src/engine/world.ts");
  const pix = await import("/src/ui/pixel.ts");
  const rc = await import("/src/ui/receipt.ts");
  const { Rng, hashStr } = await import("/src/engine/rng.ts");
  document.body.innerHTML = "";

  const sceneOf = (w) => {
    const s = new pix.LifeScene();
    s.stop();
    s.el.style.width = w + "px";
    s.el.style.display = "block";
    document.body.append(s.el);
    return s;
  };
  const snap = (s) => {
    const out = [];
    for (const f of [0, 1]) {
      s.frame = f;
      s.draw();
      out.push(s.el.toDataURL("image/png"));
    }
    return out;
  };
  /** 1年ずつ進めて、その年の出来事を渡す（選択はシードで決まるランダム） */
  function* years(seed, mode) {
    const l = res.newLife(seed, mode);
    let guard = 0;
    while (!l.dead && guard++ < 400) {
      if (l.pending) {
        const r = new Rng(hashStr(`${seed}|auto|${l.pending.id}|${l.age}`));
        l.choose(r.pick(l.pending.options).id);
        continue;
      }
      const rec = l.advance();
      if (rec) yield { l, rec };
    }
  }
  const textOf = (rec) => rec.events.map((e) => e.text);

  // 2. 一生が進む様子：結婚・子ども・七五三などがそろう日本の人生を探す
  let film = null;
  for (let i = 0; i < 400 && !film; i++) {
    const seed = `lpfilm${i}`;
    const all = [...years(seed, "j")];
    const t = all.map((y) => textOf(y.rec).join("\n")).join("\n");
    const last = all[all.length - 1];
    if (!last || last.rec.age < 80 || last.rec.age > 92) continue;
    if (!/ランドセル/.test(t) || !/着物|はかま/.test(t) || !/結婚した/.test(t) || last.l.kids.length < 2) continue;
    const s = sceneOf(360);
    const frames = [];
    const caps = [];
    for (const { l, rec } of years(seed, "j")) {
      s.update(l, rec.events, rec.age);
      frames.push(...snap(s));
      const ts = textOf(rec);
      const pick = ts.find((x) => /結婚した|生まれた|入学|ランドセル|七五三|就職|入社|退職|入院|家を買った|当た|孫|卒業|歩いた|歩けた|歩き出/.test(x)) ?? ts.find((x) => !/【選択】/.test(x)) ?? "";
      caps.push({ age: rec.age, text: pick });
    }
    s.el.remove();
    film = { seed, frames, caps, w: 360, h: 96 };
  }

  // 3. ドット絵の人物の一覧
  const WANT = [
    { key: "baby", label: "生まれた", test: (l, r) => r.age === 0 },
    { key: "toddle", label: "はじめて歩いた", test: (l, r, t) => /歩いた|歩けた|歩き出/.test(t) },
    { key: "kimono", label: "七五三（着物）", test: (l, r, t) => /着物/.test(t) },
    { key: "hakama", label: "七五三（はかま）", test: (l, r, t) => /はかま/.test(t) },
    { key: "kinder", label: "保育園・幼稚園", test: (l, r, t) => /幼稚園|保育園/.test(t) && r.age <= 4 && pix.moodOf(r.events) !== "sad" },
    { key: "randoseru", label: "ランドセル", test: (l, r, t) => /ランドセル/.test(t) && l.sex === "female" },
    { key: "uniform", label: "中学・高校", test: (l, r) => r.age === 15 },
    { key: "wedding", label: "結婚式", test: (l, r, t) => pix.specialOf(r.events) === "wedding" && !l.abroad && l.home !== "parents" },
    { key: "family", label: "子育て", test: (l, r) => r.age >= 36 && r.age <= 42 && l.kids.filter((k) => r.age - k.born < 15).length >= 2 },
    { key: "abroad", label: "海外へ出稼ぎ", test: (l, r) => l.abroad && r.age < l.abroadUntil },
    { key: "hospital", label: "入院", test: (l, r, t) => pix.specialOf(r.events) === "hospital" },
    { key: "disaster", label: "災害", test: (l, r, t) => pix.specialOf(r.events) === "disaster" },
    { key: "lucky", label: "宝くじ・遺産", test: (l, r, t) => pix.specialOf(r.events) === "lucky" },
    { key: "elder", label: "老後", test: (l, r) => r.age === 76 },
  ];
  const cast = {};
  const s2 = sceneOf(210);
  for (let i = 0; i < 600 && Object.keys(cast).length < WANT.length; i++) {
    const mode = i % 3 === 0 ? "w" : "j";
    for (const { l, rec } of years(`lpcast${i}`, mode)) {
      const t = textOf(rec).join("\n");
      for (const w of WANT) {
        if (cast[w.key] || !w.test(l, rec, t)) continue;
        s2.update(l, rec.events, rec.age);
        cast[w.key] = { label: w.label, country: l.D.nameJa, age: rec.age, frames: snap(s2) };
      }
    }
  }
  s2.el.remove();

  // 3b. ページのあちこちに出す、背景なしのドット絵の人（2コマを横に並べた画像）
  const SK = ["#f6d7b8", "#e2b088", "#9b6640", "#c98f62", "#7a4c2e"];
  const H = "#2b2118";
  const people = {
    baby: { stage: "baby", female: false, outfit: "onesie", mood: "joy", skin: SK[0], hair: H, shirt: "#e8a0b4" },
    toddle: { stage: "kid", female: true, outfit: "kid", mood: "joy", skin: SK[2], hair: H, shirt: "#e0a43a", toddle: true },
    kimono: { stage: "kid", female: true, outfit: "kimono", mood: "smile", skin: SK[0], hair: H, shirt: "#d9534f" },
    kinder: { stage: "kid", female: false, outfit: "kid", mood: "joy", skin: SK[1], hair: H, shirt: "#4f7fbf", hat: true },
    randoseru: { stage: "kid", female: true, outfit: "kid", mood: "smile", skin: SK[0], hair: "#4a3020", shirt: "#5aa469", bag: "#c8302c" },
    uniform: { stage: "teen", female: false, outfit: "uniform", mood: "smile", skin: SK[3], hair: H, shirt: "#4f7fbf" },
    hoodie: { stage: "teen", female: true, outfit: "hoodie", mood: "smile", skin: SK[4], hair: H, shirt: "#8a6bbf" },
    suit: { stage: "adult", female: false, outfit: "suit", mood: "smile", skin: SK[0], hair: H, shirt: "#4f7fbf" },
    work: { stage: "adult", female: false, outfit: "work", mood: "joy", skin: SK[2], hair: "#1c1c1c", shirt: "#3fa7a3" },
    apron: { stage: "adult", female: true, outfit: "apron", mood: "smile", skin: SK[1], hair: "#6b4a2c", shirt: "#e0a43a" },
    bride: { stage: "adult", female: true, outfit: "dress", mood: "joy", skin: SK[3], hair: H, shirt: "#fff" },
    groom: { stage: "adult", female: false, outfit: "suit", mood: "joy", skin: SK[0], hair: H, shirt: "#fff" },
    elder: { stage: "elder", female: false, outfit: "cardigan", mood: "smile", skin: SK[0], hair: "#b8b2a8", shirt: "#a0825a" },
    grandma: { stage: "elder", female: true, outfit: "cardigan", mood: "joy", skin: SK[4], hair: "#b8b2a8", shirt: "#d9534f" },
  };
  const sprites = {};
  for (const [key, person] of Object.entries(people)) {
    const w = pix.widthOf(person);
    const K = 3;
    const cv = document.createElement("canvas");
    cv.width = w * 2 * K;
    cv.height = 30 * K;
    const g = cv.getContext("2d");
    for (const f of [0, 1]) {
      const px = (x, y, ww, hh, c) => {
        g.fillStyle = c;
        g.fillRect(Math.round((x + f * w) * K), Math.round(y * K), Math.ceil(ww * K), Math.ceil(hh * K));
      };
      pix.drawPerson(px, { ...person }, 0, f);
    }
    sprites[key] = { w: w * K, h: 30 * K, png: cv.toDataURL("image/png") };
  }

  // 4. 国ごとのレシート（同じ年に生まれた3人）
  const compare = [];
  for (const iso of ["JPN", "USA", "ETH"]) {
    for (let i = 0; i < 5000; i++) {
      const seed = `lpcmp${iso}${i}`;
      const mode = iso === "JPN" ? "j" : "w";
      const D = world.pickCountry(seed, mode);
      if (D.iso3 !== iso) continue;
      const l = sim.autoplay(seed, D, mode);
      const age = l.summary().deathAge;
      if (age < 72 || age > 88) continue;
      const d = res.buildReceipt(l);
      const cv = document.createElement("canvas");
      await rc.showReceipt(cv, d, true);
      compare.push({
        iso,
        country: l.D.nameJa,
        place: l.summary().regionLabel,
        deathAge: age,
        income: res.lifetimeIncomeJpy(d),
        code: res.encodeResult(l),
        png: cv.toDataURL("image/png"),
      });
      break;
    }
  }
  return { film, cast, compare, sprites };
});

const save = (dataUrl, path) => writeFileSync(path, Buffer.from(dataUrl.split(",")[1], "base64"));

// 一生のフィルムは、縦に並べた1枚の画像にする（ページでは1コマずつ切り替えて見せる）
if (!data.film) throw new Error("一生のフィルムに使う人生が見つからなかった");
{
  const dir = `${OUT}/_film`;
  mkdirSync(dir, { recursive: true });
  data.film.frames.forEach((f, i) => save(f, `${dir}/${String(i).padStart(3, "0")}.png`));
  execFileSync("python3", ["-I", "-c", `
import sys, glob
from PIL import Image
fs = sorted(glob.glob(sys.argv[1] + "/*.png"))
ims = [Image.open(f).convert("RGBA") for f in fs]
w, h = ims[0].size
cols = 10
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGBA", (w * cols, h * rows), (0, 0, 0, 0))
for i, im in enumerate(ims): sheet.paste(im, ((i % cols) * w, (i // cols) * h))
sheet = sheet.quantize(colors=64, method=Image.FASTOCTREE)
sheet.save(sys.argv[2], optimize=True)
`, dir, `${OUT}/film.png`]);
  execFileSync("rm", ["-r", dir]);
  writeFileSync(`${OUT}/film.json`, JSON.stringify({ seed: data.film.seed, w: data.film.w, h: data.film.h, cols: 10, frames: data.film.frames.length, years: data.film.caps }, null, 1));
  console.log("フィルム", data.film.seed, data.film.frames.length, "コマ");
}

const castOut = [];
for (const [key, c] of Object.entries(data.cast)) {
  c.frames.forEach((f, i) => save(f, `${OUT}/c-${key}-${i}.png`));
  castOut.push({ key, label: c.label, country: c.country, age: c.age });
}
writeFileSync(`${OUT}/cast.json`, JSON.stringify(castOut, null, 1));
console.log("人物", castOut.map((c) => c.key).join(" "));

const spriteOut = {};
for (const [key, sp] of Object.entries(data.sprites)) {
  save(sp.png, `${OUT}/p-${key}.png`);
  spriteOut[key] = { w: sp.w, h: sp.h };
}
writeFileSync(`${OUT}/people.json`, JSON.stringify(spriteOut, null, 1));
console.log("人", Object.keys(spriteOut).join(" "));

const cmpOut = [];
for (const c of data.compare) {
  const tmp = `${OUT}/_r.png`;
  save(c.png, tmp);
  toWebp(tmp, `${OUT}/r-${c.iso.toLowerCase()}.webp`, 600);
  execFileSync("rm", [tmp]);
  const { png, ...rest } = c;
  cmpOut.push(rest);
}
writeFileSync(`${OUT}/compare.json`, JSON.stringify(cmpOut, null, 1));
console.log("レシート", cmpOut.map((c) => `${c.country} ${c.deathAge}歳 ${Math.round(c.income / 1e4)}万円`).join(" / "));
await b.close();
