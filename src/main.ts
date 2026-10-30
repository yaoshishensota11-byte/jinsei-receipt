import { LifeScene } from "./ui/pixel";
import { langPicker } from "./ui/lang";
import { Life, jobLabel, cohort, kidFemale, ALLOC_LABEL } from "./engine/sim";
import { randomSeed, Rng, hashStr } from "./engine/rng";
import { buildReceipt, buildDetail, detailUrl, shareIntentUrl, shareUrl, shareBase, newLife, childOf, estateFor, MAX_GEN } from "./engine/result";
import { COUNTRIES, worldCountry, type Mode } from "./engine/world";
import type { Alloc, Choice, LifeEvent, YearRecord } from "./engine/types";
import { showReceipt, downloadReceipt, downloadDetailed } from "./ui/receipt";
import { compareMyIncome, topText } from "./engine/myincome";
import { yen } from "./engine/data";
import { CHAPTERS, chapterSummary, oneIn, type Chapter } from "./engine/chapters";
import { snap, voicesFor, type Snap, type Voice } from "./engine/voices";

// 1年が進む時間は、出来事があってもなくても同じ（速さを変えるのは画面下の倍速ボタンだけ）。
// 出来事が多い年と、家族の声がある年は、そのぶん少し長くする。章の区切りでは止まってまとめを見せる。
// 選択・家族の声・章のまとめを含めて、等倍で1プレイ20〜30分ほど。
const YEAR_MS = 4_200;
/** 出来事が多い年は、3つ目から1つにつき少し長くする */
const EVENT_MS = 700;
const VOICE_MS = 1_600;

const SPEEDS = [1, 2, 3, 4, 5] as const;

const params = new URLSearchParams(location.search);
/** テスト用の内部高速モード（?turbo=50 なら速度×50）。画面には出さない */
const TURBO = Math.max(1, Number(params.get("turbo")) || 1);
/** テスト用：選択場面で自動的にランダムに選ぶ */
const AUTO = params.has("auto");

const app = document.getElementById("app")!;
const h = (html: string) => {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild as HTMLElement;
};
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const yenShort = (n: number) => (Math.abs(n) >= 1e4 ? `${Math.round(n / 1e4).toLocaleString("ja-JP")}万円` : `${Math.round(n).toLocaleString("ja-JP")}円`);

// ───────────────────────── タイトル ─────────────────────────

function showTitle(): void {
  app.innerHTML = "";
  app.append(
    h(`<div class="title">
      <div class="paper">
        <div class="en">LIFE STORE RECEIPT</div>
        <h1>人生のレシート</h1>
        <div class="dash"></div>
        <p class="q">同じ一生でも、生まれた国で<br>稼げるお金はどれだけ違う？</p>
        <p>あなたは今年生まれる赤ちゃん。<br>どこの国のどんな家庭に生まれるかは、生まれるまで分かりません。</p>
        <p>大きな分かれ道が8回と、日々の小さな選択がいくつも。最後に、人生のお会計をどうぞ。</p>
        <div class="dash"></div>
        <div class="meta">所要時間 約20分（倍速で短縮できます）<br>賃金・家計・寿命・進学などは公的統計がもと</div>
      </div>
      <div class="modes">
        <div class="modes-h">どこに生まれますか？</div>
        <button class="mode" data-mode="j"><b>日本で生まれる</b><span>日本の地域・家庭のどこかに生まれる。</span></button>
        <button class="mode" data-mode="m"><b>主要20か国のどこかで</b><span>日本・米国・インド・ナイジェリア・ドイツなど20か国から、どこになるかは運しだい。</span></button>
        <button class="mode" data-mode="w"><b>世界のどこかで</b><span>実際の出生数の割合で生まれる国が決まる。いちばん現実に近い。</span></button>
      </div>
    </div>`),
  );
  app.querySelector(".title")!.prepend(langPicker());
  app.querySelectorAll<HTMLElement>(".mode").forEach(
    (b) => (b.onclick = () => showBirth(params.get("seed") || randomSeed(), b.dataset.mode as Mode)),
  );
  if (AUTO) showBirth(params.get("seed") || randomSeed(), (params.get("mode") as Mode) || "j");
}

// ───────────────────────── 誕生 ─────────────────────────

function showBirth(seed: string, mode: Mode): void {
  showBirthOf(newLife(seed, mode), mode);
}

/** 誕生の画面（子どもに生まれ直すときは、親の欄も出す） */
function showBirthOf(life: Life, mode: Mode): void {
  const seed = life.seed;
  const heir = life.heir;
  const sexWord = life.sex === "male" ? "男の子" : "女の子";
  const u5 = worldCountry(life.D.iso3)?.under5MortalityPer1000;
  // 子どもの死亡はゲームでは起こさないが、その国の現実として一文だけ伝える
  const fact = u5 ? `この国では、子どもの約${Math.max(2, Math.round(1000 / u5)).toLocaleString("ja-JP")}人に1人が5歳を迎えられません。` : "";
  const where = life.region.urban === false && !life.region.label.includes("農村") ? "（農村部）" : "";
  const el = h(`<div class="birth">
    <h2>${life.birthYear}年、${heir ? `${heir.gen}代目の` : ""}あなたが生まれます</h2>
    ${heir ? `<div class="slot"><span>親</span><b class="spin" data-v="${heir.gen - 1}代目のあなた（${heir.parentIdx === 0 ? "父" : "母"}）">…</b></div>` : ""}
    ${mode === "j" ? "" : `<div class="slot"><span>国</span><b class="spin" data-v="${esc(life.D.nameJa)}">…</b></div>`}
    <div class="slot"><span>生まれた場所</span><b class="spin" data-v="${esc(life.region.label + where)}">…</b></div>
    <div class="slot"><span>${mode === "j" ? "家庭の年収" : "家庭"}</span><b class="spin" data-v="${esc(life.band.label)}">…</b></div>
    <div class="slot"><span>性別</span><b class="spin" data-v="${sexWord}">…</b></div>
    <p class="fact" style="visibility:hidden">${esc(fact)}</p>
    <button class="btn" id="go" style="visibility:hidden;margin-top:10px">人生をはじめる</button>
  </div>`);
  app.innerHTML = "";
  app.append(el);
  const slots = [...el.querySelectorAll<HTMLElement>("b.spin")];
  const pool = mode === "j" ? ["東京圏", "大阪圏", "地方の町", "名古屋圏", "地方中核都市", "300〜500万円", "1200万円以上"] : COUNTRIES.slice(0, 40).map((c) => c.nameJa);
  let tick = 0;
  const r = new Rng(hashStr(seed + "spin"));
  const step = 500 / TURBO;
  const iv = setInterval(() => {
    tick++;
    slots.forEach((s, i) => {
      if (tick > 6 + i * 4) {
        s.textContent = s.dataset.v!;
        s.classList.remove("spin");
      } else s.textContent = r.pick(pool);
    });
    if (tick > 6 + slots.length * 4) {
      clearInterval(iv);
      const go = el.querySelector<HTMLElement>("#go")!;
      go.style.visibility = "visible";
      el.querySelector<HTMLElement>(".fact")!.style.visibility = "visible";
      // 2回押しても、人生は1つだけ始まる
      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        startGame(life);
      };
      go.onclick = start;
      if (AUTO) setTimeout(start, 200);
    }
  }, step / 4);
}

// ───────────────────────── プレイ ─────────────────────────

class Game {
  speed = 1; // 0 = 一時停止
  lastSpeed = 1;
  private yearT = 0; // 今の年の経過ms
  private yearMs = YEAR_MS; // 今の年の長さms
  private evMs = YEAR_MS; // そのうち、出来事を見せる長さms
  /** 等倍での自動進行の合計時間（テストでプレイ時間の目安を出すため） */
  autoMs = 0;
  /** 等倍で遊んだときの目安（選択は大きな分かれ道20秒・小さな選択6秒と見込む） */
  get playMs(): number {
    const small = this.life.choiceLog.filter((c) => c.id.startsWith("micro:")).length;
    const ev = this.life.choiceLog.filter((c) => c.id.startsWith("ev:")).length;
    return this.autoMs + (this.life.choiceLog.length - small - ev) * 20_000 + small * 6_000 + ev * 10_000 + this.chapters * 40_000;
  }
  private current: YearRecord | null = null;
  private shown = 0;
  /** 家族の声（その年のぶん）と、前の年の終わりの様子 */
  private voices: Voice[] = [];
  private vShown = 0;
  private snap: Snap | null = null;
  /** 見せた章のまとめの数 */
  chapters = 0;
  private raf = 0;
  private prev = 0;
  private choosing = false;
  private hud!: HTMLElement;
  private feed!: HTMLElement;
  private log!: HTMLElement;
  private ctrl!: HTMLElement;
  /** ドット絵の「暮らしの風景」 */
  private scene = new LifeScene();

  constructor(public life: Life) {}

  mount(): void {
    app.innerHTML = "";
    const root = h(`<div class="game">
      <div class="hud">
        <div class="row">
          <div class="age" id="age">0<small>歳</small></div>
          <div class="year" id="year"></div>
        </div>
        <div class="status" id="status"></div>
        <div class="money">
          <div><label>貯え（純資産）</label><b id="bal">0円</b></div>
          <div><label>今年の収入</label><b id="inc">0円</b></div>
          <div><label>今年の支出</label><b id="exp">0円</b></div>
        </div>
        <div class="family" id="fam"></div>
        <div class="bar"><i id="prog"></i></div>
      </div>
      <div class="feed" id="feed"></div>
      <div class="log" id="log" hidden></div>
      <div class="controls" id="ctrl">
        <button class="pause" data-s="0">⏸ 停止</button>
        ${SPEEDS.map((s) => `<button data-s="${s}">${s}×</button>`).join("")}
      </div>
    </div>`);
    app.append(root);
    this.hud = root.querySelector(".hud")!;
    this.hud.after(this.scene.el);
    this.feed = root.querySelector("#feed")!;
    this.log = root.querySelector("#log")!;
    this.ctrl = root.querySelector("#ctrl")!;
    this.ctrl.onclick = (e) => {
      const b = (e.target as HTMLElement).closest("button");
      if (!b || this.choosing) return;
      this.setSpeed(Number(b.dataset.s));
    };
    this.setSpeed(1);
    this.renderHud();
    this.scene.update(this.life, []);
    this.prev = performance.now();
    this.raf = requestAnimationFrame(this.loop);
    // 比較集団の計算は、余裕のあるときに済ませておく
    const idle = (window as unknown as { requestIdleCallback?: (f: () => void) => void }).requestIdleCallback ?? ((f: () => void) => setTimeout(f, 1500));
    idle(() => cohort(this.life.D));
  }

  setSpeed(s: number): void {
    if (s > 0) this.lastSpeed = s;
    this.speed = s;
    this.ctrl.querySelectorAll("button").forEach((b) => b.classList.toggle("on", Number(b.dataset.s) === s));
    const paused = s === 0 && !this.choosing;
    this.feed.hidden = paused;
    this.log.hidden = !paused;
    if (paused) this.renderLog();
    else this.feed.scrollTop = 0;
  }

  private loop = (now: number): void => {
    const dt = Math.min(250, now - this.prev);
    this.prev = now;
    if (this.speed > 0 && !this.choosing) this.tick(dt * this.speed * TURBO);
    if (!this.life.dead || this.current) this.raf = requestAnimationFrame(this.loop);
  };

  private tick(ms: number): void {
    if (!this.current) {
      if (this.life.dead) return this.finish();
      const rec = this.life.advance();
      if (!rec) {
        if (this.life.pending) this.openChoice(this.life.pending);
        return;
      }
      this.current = rec;
      this.shown = 0;
      this.yearT = 0;
      this.voices = voicesFor(this.life, this.snap, rec);
      this.snap = snap(this.life);
      this.vShown = 0;
      this.evMs = YEAR_MS + Math.max(0, rec.events.length - 2) * EVENT_MS;
      this.yearMs = this.evMs + this.voices.length * VOICE_MS;
      const ch = CHAPTERS.find((c) => c.from === rec.age);
      if (ch) this.feed.prepend(h(`<div class="chap-line"><b>第${ch.no}章</b>${esc(ch.title)}<span>${ch.from}${ch.no < CHAPTERS.length ? `〜${ch.to}` : ""}歳</span></div>`));
      this.autoMs += this.yearMs;
      this.renderHud();
      this.scene.update(this.life, [], rec.age);
    }
    this.yearT += ms;
    const rec = this.current;
    const n = rec.events.length;
    // その年の出来事を、1年の中で順番に見せる
    while (this.shown < n && this.yearT >= ((this.shown + 0.5) / Math.max(n, 1)) * this.evMs * 0.8) {
      this.pushEvent(rec.events[this.shown++]);
      // 出来事が出たら、ドット絵の表情もその時点の出来事に合わせる
      this.scene.update(this.life, rec.events.slice(0, this.shown), rec.age);
    }
    // 家族の声は、その年の出来事のあとに
    while (this.vShown < this.voices.length && this.yearT >= this.evMs * 0.8 + (this.vShown + 0.2) * VOICE_MS) this.pushVoice(this.voices[this.vShown++], rec.age);
    (this.hud.querySelector("#prog") as HTMLElement).style.width = `${Math.min(100, (this.yearT / this.yearMs) * 100)}%`;
    if (this.yearT >= this.yearMs) {
      while (this.shown < n) this.pushEvent(rec.events[this.shown++]);
      while (this.vShown < this.voices.length) this.pushVoice(this.voices[this.vShown++], rec.age);
      this.current = null;
      if (this.life.dead) return this.finish();
      const ch = CHAPTERS.find((c) => c.to === rec.age);
      if (ch) this.openChapter(ch);
    }
  }

  private renderHud(): void {
    const l = this.life;
    const rec = this.current;
    const age = rec ? rec.age : l.age;
    const q = (id: string) => this.hud.querySelector("#" + id) as HTMLElement;
    q("age").innerHTML = `${age}<small>歳</small>`;
    q("year").innerHTML = `${l.birthYear + age}年<br>${esc(l.region.label)}`;
    const status = l.school !== "done" && l.school !== "child" ? l.schoolName() + "に在学中" : age < 6 ? "未就学" : age < 15 ? (age < 12 ? "小学生" : "中学生") : jobLabel(l.job);
    const home = l.home === "own" ? "・持ち家" : l.home === "rent" ? "・賃貸" : "・実家";
    q("status").textContent = `${status}${home}${l.dating && !l.partner ? "・恋人あり" : ""}`;
    // 一緒に暮らしている家族（実家にいる間は親ときょうだい、家を出たあとはパートナーと巣立つ前の子ども）
    q("fam").innerHTML = `<label>家族</label><b>${l.householdSize}人</b><span>${esc(l.household.join("・"))}</span>`;
    const bal = rec ? rec.balance : l.balance;
    q("bal").innerHTML = `${esc(l.D.fmt(bal, false))}${l.D.isJapan ? "" : `<small>約${esc(yenShort(l.D.toJpy(bal)))}</small>`}`;
    q("bal").className = bal < 0 ? "minus" : "";
    const inc = rec ? Object.entries(rec.income).reduce((t, [k, v]) => t + (k === "invest" ? 0 : v ?? 0), 0) : 0;
    const exp = rec ? Object.values(rec.expense).reduce((t, v) => t + (v ?? 0), 0) : 0;
    q("inc").textContent = l.D.fmt(inc, false);
    q("exp").textContent = l.D.fmt(exp, false);
  }

  private pushEvent(e: LifeEvent): void {
    const amt = e.amount ? `<span class="amt ${e.amount > 0 ? "plus" : "minus"}">${e.amount > 0 ? "+" : ""}${esc(this.life.D.fmt(e.amount))}</span>` : "";
    // 新しい出来事を上に積む。下へスクロールして過去を読んでいる間は、表示位置を動かさない
    const reading = this.feed.scrollTop > 40;
    const el = h(`<div class="ev k-${e.kind}${e.major ? " major" : ""}"><div class="a">${e.age}歳</div><div class="t">${esc(e.text)}${amt}</div></div>`);
    this.feed.prepend(el);
    // 古いものは間引いて軽く保つ（全履歴は一時停止中のログで見られる）
    while (this.feed.children.length > 80) this.feed.lastElementChild!.remove();
    if (reading) this.feed.scrollTop += el.getBoundingClientRect().height + parseFloat(getComputedStyle(this.feed).rowGap || "0");
    else this.feed.scrollTop = 0;
  }

  private pushVoice(v: Voice, age: number): void {
    const reading = this.feed.scrollTop > 40;
    const el = h(`<div class="voice${v.who === "心の声" ? " inner" : ""}"><div class="a">${age}歳</div><div class="t"><b>${esc(v.who)}</b>「${esc(v.text)}」</div></div>`);
    this.feed.prepend(el);
    if (reading) this.feed.scrollTop += el.getBoundingClientRect().height;
    else this.feed.scrollTop = 0;
  }

  /** 章のまとめ。その時期のお金・出来事と、同じ国に生まれた人と比べた「起きなかったこと」 */
  private openChapter(ch: Chapter): void {
    this.choosing = true;
    this.chapters++;
    this.ctrl.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.s === "0"));
    const l = this.life;
    const s = chapterSummary(l, ch, cohort(l.D));
    const money = (v: number) => esc(l.D.fmt(v, false)) + (l.D.isJapan ? "" : `<small>約${esc(yenShort(l.D.toJpy(v)))}</small>`);
    const next = CHAPTERS[ch.no];
    const evs = s.events.slice(-5);
    const bg = h(`<div class="sheet-bg"><div class="sheet chapter">
      <div class="tag">第${ch.no}章 おわり ・ ${ch.from}〜${s.end}歳</div>
      <h2>${esc(ch.title)}</h2>
      ${
        s.income > 0
          ? `<div class="ch-money">
        <div><label>稼いだお金</label><b>${money(s.income)}</b></div>
        <div><label>出ていったお金</label><b>${money(s.expense)}</b></div>
        <div><label>${s.end}歳の貯え</label><b class="${s.endBal < 0 ? "minus" : ""}">${money(s.endBal)}</b></div>
      </div>${s.rank !== null ? `<p class="ch-rank">同じ国に生まれた${s.n}人の中で、貯えは<b>上位${Math.max(1, Math.round(s.rank * 100))}%</b></p>` : ""}`
          : ""
      }
      ${evs.length ? `<h3>この章の出来事</h3><ul class="ch-ev">${evs.map((e) => `<li><span>${e.age}歳</span>${esc(e.text)}</li>`).join("")}</ul>` : ""}
      <h3>あなたに起きなかったこと</h3>
      <ul class="ch-cmp">
        <li>この国で同じ年に生まれた人のうち、${s.end}歳までに亡くなるのは<b>${esc(oneIn(s.deathShare))}</b>。</li>
        ${s.missed.map((m) => `<li>同じ国に生まれた${s.n}人のうち<b>${m.count}人</b>が、${esc(m.text)}。</li>`).join("")}
      </ul>
      ${s.rare.length ? `<h3>あなたに起きた、めずらしいこと</h3><ul class="ch-cmp rare">${s.rare.map((m) => `<li>${esc(m.text)}。同じ国の${s.n}人のうち、<b>${m.count}人</b>だけだった。</li>`).join("")}</ul>` : ""}
      <p class="ch-note">亡くなる割合は、その国の平均寿命と生命表からの推計。${s.n}人は、同じ統計で動かしたゲームの中の人生です。</p>
      <button class="opt ch-next"><b>${next ? `第${next.no}章「${esc(next.title)}」へ` : "つづける"}</b></button>
    </div></div>`);
    document.body.append(bg);
    const go = () => {
      if (!bg.isConnected) return;
      bg.remove();
      this.choosing = false;
      this.setSpeed(this.lastSpeed);
    };
    bg.querySelector<HTMLElement>(".ch-next")!.onclick = go;
    if (AUTO) setTimeout(go, 300);
  }

  private renderLog(): void {
    const recs = this.life.records;
    const items = [...recs]
      .reverse()
      .map((y) => {
        const inc = Object.entries(y.income).reduce((t, [k, v]) => t + (k === "invest" ? 0 : v ?? 0), 0);
        const exp = Object.values(y.expense).reduce((t, v) => t + (v ?? 0), 0);
        const head = y.events.find((e) => e.major) ?? y.events[0];
        return `<details>
          <summary><b>${y.age}歳</b><em>${head ? esc(head.text) : "—"}</em><span class="${y.balance < 0 ? "minus" : ""}">${esc(this.life.D.fmt(y.balance, false))}</span></summary>
          <div class="body">
            ${y.events.length ? `<ul>${y.events.map((e) => `<li>${esc(e.text)}${e.amount ? `（${e.amount > 0 ? "+" : ""}${esc(this.life.D.fmt(e.amount))}）` : ""}</li>`).join("")}</ul>` : "<p>特に大きな出来事はなかった。</p>"}
            <div class="nums"><span>収入 ${esc(this.life.D.fmt(inc, false))}</span><span>支出 ${esc(this.life.D.fmt(exp, false))}</span><span>${y.year}年</span><span>年末の貯え ${esc(this.life.D.fmt(y.balance, false))}</span></div>
          </div>
        </details>`;
      })
      .join("");
    this.log.innerHTML = `<h3>これまでの記録 <span>年をタップで詳細</span></h3>${items || "<p>まだ記録はありません。</p>"}`;
  }

  private openChoice(c: Choice): void {
    this.choosing = true;
    this.ctrl.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.s === "0"));
    if (c.alloc) return this.openAlloc(c);
    const micro = c.id.startsWith("micro:");
    const event = c.id.startsWith("ev:");
    const n = this.life.choiceLog.filter((x) => !x.id.startsWith("micro:") && !x.id.startsWith("ev:") && x.id !== "alloc").length + 1;
    const bg = h(`<div class="sheet-bg"><div class="sheet${micro ? " small" : ""}">
      <div class="tag">${micro ? "小さな選択" : event ? "人生の出来事" : `分かれ道 ${n} / 8`} ・ ${c.age}歳</div>
      <h2>${esc(c.title)}</h2>
      <p class="sit">${esc(c.situation)}</p>
      ${c.options.map((o) => `<button class="opt" data-id="${esc(o.id)}"><b>${esc(o.label)}</b><span>${esc(o.desc)}</span></button>`).join("")}
    </div></div>`);
    document.body.append(bg);
    const pick = (id: string) => {
      bg.querySelector(`[data-id="${id}"]`)?.classList.add("picked");
      setTimeout(() => {
        bg.remove();
        this.life.choose(id);
        this.choosing = false;
        this.setSpeed(this.lastSpeed);
      }, 220 / Math.min(TURBO, 4));
    };
    bg.querySelectorAll<HTMLElement>(".opt").forEach((b) => (b.onclick = () => pick(b.dataset.id!)));
    if (AUTO) {
      const r = new Rng(hashStr(this.life.seed + c.id));
      setTimeout(() => pick(r.pick(c.options).id), 300);
    }
  }

  /** お金の振り分け：型を選び、必要ならタップして細かく調整する */
  private openAlloc(c: Choice): void {
    const info = c.alloc!;
    const keys: (keyof Alloc)[] = info.noInvest ? ["living", "save", "family", "self"] : ["living", "save", "invest", "family", "self"];
    const familyNote =
      info.familyTo === "kids" ? "子どもの教育費。子どもの進学を助け、その子に生まれ直したときにも役立つ" : info.familyTo === "parents" ? "親への仕送り" : "回す相手がいないので、貯金と同じになる";
    const note: Record<keyof Alloc, string> = {
      living: "ゆとりのある暮らし（趣味・交際）。残るお金は減る",
      save: "現金で持つ。物価が上がると目減りする",
      invest: "国の株式の利回りで、増える年も減る年もある",
      family: familyNote,
      self: "学び直しの費用。給料が上がることも、上がらないことも",
    };
    let cur: Alloc = { ...(info.last ?? info.presets[0]) };
    let picked = info.last ? "same" : "p0";
    const bg = h(`<div class="sheet-bg"><div class="sheet alloc">
      <div class="tag">お金の振り分け ・ ${c.age}歳（5年に一度）</div>
      <h2>${esc(c.title)}</h2>
      <p class="sit">${esc(c.situation)}</p>
      <div class="al-bar" aria-hidden="true"></div>
      <div class="al-legend"></div>
      <div class="al-presets">${c.options.map((o) => `<button class="opt" data-id="${esc(o.id)}"><b>${esc(o.label)}</b><span>${esc(o.desc)}</span></button>`).join("")}</div>
      <button class="al-tune-btn" type="button" aria-expanded="false">細かく調整する</button>
      <div class="al-tune" hidden>
        ${keys
          .map(
            (k) => `<label class="al-row al-${k}"><span class="al-name">${ALLOC_LABEL[k]}</span>${
              k === "living" ? `<span class="al-rest">残り</span>` : `<input type="range" min="0" max="9" step="1" data-k="${k}" aria-label="${ALLOC_LABEL[k]}" />`
            }<b class="al-val" data-v="${k}"></b><small>${esc(note[k])}</small></label>`,
          )
          .join("")}
      </div>
      <button class="btn" id="allocGo">この割合で決める</button>
    </div></div>`);
    document.body.append(bg);
    const draw = () => {
      bg.querySelector<HTMLElement>(".al-bar")!.innerHTML = keys
        .filter((k) => cur[k] > 0)
        .map((k) => `<i class="al-${k}" style="flex:${cur[k]}">${cur[k] >= 2 ? `${ALLOC_LABEL[k]}${cur[k] * 10}%` : ""}</i>`)
        .join("");
      bg.querySelector<HTMLElement>(".al-legend")!.textContent = keys
        .filter((k) => cur[k] > 0)
        .map((k) => `${ALLOC_LABEL[k]}${cur[k] * 10}%`)
        .join("・");
      bg.querySelectorAll<HTMLInputElement>(".al-tune input").forEach((inp) => (inp.value = String(cur[inp.dataset.k as keyof Alloc])));
      bg.querySelectorAll<HTMLElement>(".al-val").forEach((el) => (el.textContent = `${cur[el.dataset.v as keyof Alloc] * 10}%`));
      bg.querySelectorAll<HTMLElement>(".al-presets .opt").forEach((b) => b.classList.toggle("picked", b.dataset.id === picked));
    };
    bg.querySelectorAll<HTMLElement>(".al-presets .opt").forEach((b) => {
      b.onclick = () => {
        const i = c.options.findIndex((o) => o.id === b.dataset.id);
        cur = { ...info.presets[i] };
        picked = b.dataset.id!;
        draw();
      };
    });
    const tuneBtn = bg.querySelector<HTMLButtonElement>(".al-tune-btn")!;
    tuneBtn.onclick = () => {
      const box = bg.querySelector<HTMLElement>(".al-tune")!;
      box.hidden = !box.hidden;
      tuneBtn.setAttribute("aria-expanded", String(!box.hidden));
      tuneBtn.textContent = box.hidden ? "細かく調整する" : "調整を閉じる";
      if (!box.hidden) box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
    // スライダー：合計が100%を超えないよう、動かしたものを止める。暮らしは残り
    bg.querySelectorAll<HTMLInputElement>(".al-tune input").forEach((inp) => {
      inp.oninput = () => {
        const k = inp.dataset.k as keyof Alloc;
        const others = keys.filter((x) => x !== k && x !== "living").reduce((t, x) => t + cur[x], 0);
        cur[k] = Math.min(Number(inp.value), 10 - others);
        cur.living = 10 - others - cur[k];
        picked = "";
        draw();
      };
    });
    draw();
    const go = () => {
      bg.remove();
      this.life.chooseAlloc(cur, picked || "custom");
      this.choosing = false;
      this.setSpeed(this.lastSpeed);
    };
    bg.querySelector<HTMLElement>("#allocGo")!.onclick = go;
    if (AUTO) {
      const r = new Rng(hashStr(this.life.seed + c.id + c.age));
      setTimeout(() => {
        const i = r.int(0, c.options.length - 1);
        cur = { ...info.presets[i] };
        picked = c.options[i].id;
        go();
      }, 300);
    }
  }

  private finishing = false;
  private finish(): void {
    if (this.finishing) return;
    this.finishing = true;
    cancelAnimationFrame(this.raf);
    setTimeout(() => showResult(this.life), 1500 / TURBO);
  }
}

function startGame(life: Life): void {
  const g = new Game(life);
  (window as unknown as { __game: Game }).__game = g;
  g.mount();
}

// ───────────────────────── 結果 ─────────────────────────

/** 「子どもとして生まれ直す」の欄。子どもがいて、3代目より前のときだけ出す */
function heirBlock(life: Life): string {
  const gen = life.heir?.gen ?? 1;
  if (!life.kids.length) return "";
  if (gen >= MAX_GEN) return `<p class="heir-end">${MAX_GEN}代の家系は、ここでおしまいです。</p>`;
  const estate = estateFor(life);
  const money = estate > 0 ? `受け継ぐお金 約${life.D.fmt(estate)}` : estate < 0 ? `受け継ぐ借金 約${life.D.fmt(-estate)}` : "受け継ぐお金はなし";
  const kids = life.kids
    .map((k, i) => {
      const nth = ["第一子", "第二子", "第三子", "第四子", "第五子"][i] ?? "子ども";
      const sex = kidFemale(life.seed, i) ? "女の子" : "男の子";
      return `<button class="opt" data-i="${i}"><b>${nth}・${sex}</b><span>${life.birthYear + k.born}年生まれ・${esc(money)}</span></button>`;
    })
    .join("");
  return `<div class="heir">
    <h3>子どもとして、生まれ直す</h3>
    <p>あなたが残したお金や家を受け継いで、${gen + 1}代目の人生を生きます。借金も引き継ぎます。家庭の収入は、あなたの稼ぎで決まります。</p>
    ${kids}
  </div>`;
}

async function showResult(life: Life): Promise<void> {
  app.innerHTML = `<div class="result"><div class="loading">お会計中…</div></div>`;
  await new Promise((r) => setTimeout(r, 30));
  const data = buildReceipt(life);
  const url = detailUrl(life, location.origin + location.pathname.replace(/\/[^/]*$/, ""));
  const root = h(`<div class="result">
    <h2>お会計が済みました</h2>
    <button class="rc-wrap" id="rc-open" aria-label="レシートを大きく見る"><canvas id="rc"></canvas></button>
    <p class="rc-hint">タップすると、内訳つきのレシートを大きく見られます</p>
    <div class="row2">
      <button class="btn sub" id="png">PNGで保存</button>
      <a class="btn sub" id="x" href="${esc(shareIntentUrl(shareUrl(life, shareBase(location.origin, location.hostname)), data))}" target="_blank" rel="noopener">Xで共有</a>
    </div>
    <div class="row2">
      <button class="btn sub" id="pngDetail">詳細つきで保存</button>
      <a class="btn sub" href="${esc(url)}">詳しい明細・印刷</a>
    </div>
    ${heirBlock(life)}
    <details class="mine">
      <summary>自分の年収と比べてみる</summary>
      <label class="mine-in">あなたの年収（税金などを引く前）<span><input id="myIncome" type="number" inputmode="numeric" min="0" step="10" placeholder="400" />万円</span></label>
      <div class="mine-out" id="myOut" aria-live="polite"></div>
      <p class="mine-note">入力した年収は、どこにも送られません。ゲームの中の世界・日本で、25〜59歳の働く人の年収と比べています（統計をもとにした試算）。</p>
    </details>
    <button class="btn" id="again">もう一度生まれる</button>
    <a class="btn sub lp-link" href="/lp/">人生のレシート 公式ページへ</a>
  </div>`);
  app.innerHTML = "";
  app.append(root);
  // 画面には短いレシートを1画面に収めて出す。保存・拡大は内訳つきの長いレシート
  const cv = root.querySelector<HTMLCanvasElement>("#rc")!;
  const full = document.createElement("canvas");
  full.className = "rc-full";
  await Promise.all([showReceipt(cv, data, true), showReceipt(full, data)]);
  root.querySelector<HTMLElement>("#png")!.onclick = () => downloadReceipt(full, `jinsei-receipt-${life.seed}.png`);
  // 詳細つき：レシートの下に、転機・選んだ道・10年ごとのお金を続けた長い画像
  root.querySelector<HTMLElement>("#pngDetail")!.onclick = () => downloadDetailed(data, buildDetail(life), `jinsei-receipt-${life.seed}-detail.png`).catch(() => {});
  root.querySelector<HTMLElement>("#rc-open")!.onclick = () => {
    const z = h(`<div class="rc-zoom" role="dialog" aria-label="レシート"><button class="rc-close" aria-label="閉じる">閉じる</button></div>`);
    z.append(full);
    z.onclick = (e) => {
      if (e.target === z || (e.target as HTMLElement).classList.contains("rc-close")) z.remove();
    };
    document.body.append(z);
  };
  root.querySelector<HTMLElement>("#again")!.onclick = () => showTitle();
  // 自分の年収と比べる（入力はこの画面の中だけで使う）
  const myIn = root.querySelector<HTMLInputElement>("#myIncome")!;
  const myOut = root.querySelector<HTMLElement>("#myOut")!;
  myIn.oninput = () => {
    const man = Number(myIn.value);
    if (!(man > 0)) {
      myOut.innerHTML = "";
      return;
    }
    const jpy = man * 10_000;
    const c = compareMyIncome(jpy, life);
    const ratio = c.lifeTypical > 0 ? jpy / c.lifeTypical : 0;
    const vsLife =
      c.lifeTypical <= 0
        ? ""
        : ratio >= 1.05
          ? `この人生（${life.D.nameJa}）のふつうの年収 約${yen(c.lifeTypical)} の<b>${ratio >= 10 ? Math.round(ratio) : ratio.toFixed(1)}年分</b>を、1年で稼いでいます。`
          : ratio <= 0.95
            ? `この人生（${life.D.nameJa}）のふつうの年収 約${yen(c.lifeTypical)} の<b>${Math.round(ratio * 100)}%</b>です。`
            : `この人生（${life.D.nameJa}）のふつうの年収 約${yen(c.lifeTypical)} と、ほぼ同じです。`;
    myOut.innerHTML = `<div class="mine-row"><span>世界の働く人の中で</span><b>${topText(c.world)}</b></div>
      <div class="mine-row"><span>日本の働く人の中で</span><b>${topText(c.japan)}</b></div>
      ${vsLife ? `<p>${vsLife}</p>` : ""}`;
  };
  root.querySelectorAll<HTMLElement>(".heir .opt").forEach((b) => {
    b.onclick = () => showBirthOf(childOf(life, Number(b.dataset.i)), life.mode as Mode);
  });
  (window as unknown as { __result: unknown }).__result = { url, data };
  window.scrollTo(0, 0);
}

showTitle();
