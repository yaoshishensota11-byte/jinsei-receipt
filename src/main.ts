import { Life, yen, jobLabel, cohort } from "./engine/sim";
import { randomSeed, Rng, hashStr } from "./engine/rng";
import { buildReceipt, detailUrl, shareIntentUrl } from "./engine/result";
import type { Choice, LifeEvent, YearRecord } from "./engine/types";
import { drawReceipt, downloadReceipt } from "./ui/receipt";

// 等倍で1年10秒 → 平均寿命まで約14分。選択場面を含めて約20分。
const YEAR_MS = 10_000;
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

// ───────────────────────── タイトル ─────────────────────────

function showTitle(): void {
  app.innerHTML = "";
  app.append(
    h(`<div class="title">
      <div class="paper">
        <div class="en">LIFE STORE RECEIPT</div>
        <h1>人生のレシート</h1>
        <div class="dash"></div>
        <p>あなたは今年、日本のどこかで生まれる赤ちゃん。<br>住む地域と家庭の年収は、生まれるまで分かりません。</p>
        <p>1年ずつ進む一生のなかで、8回だけ道を選べます。最後に、人生のお会計をどうぞ。</p>
        <div class="dash"></div>
        <div class="meta">所要時間 約20分（倍速で短縮できます）<br>賃金・家計・寿命・進学などは公的統計がもと</div>
      </div>
      <button class="btn" id="start">生まれる</button>
    </div>`),
  );
  document.getElementById("start")!.onclick = () => showBirth(params.get("seed") || randomSeed());
}

// ───────────────────────── 誕生 ─────────────────────────

function showBirth(seed: string): void {
  const life = new Life(seed);
  const sexWord = life.sex === "male" ? "男の子" : "女の子";
  const el = h(`<div class="birth">
    <h2>${life.birthYear}年、あなたが生まれます</h2>
    <div class="slot"><span>住む地域</span><b class="spin" data-v="${esc(life.region.label)}">…</b></div>
    <div class="slot"><span>家庭の年収</span><b class="spin" data-v="${esc(life.band.label)}">…</b></div>
    <div class="slot"><span>性別</span><b class="spin" data-v="${sexWord}">…</b></div>
    <div class="slot"><span>きょうだい</span><b class="spin" data-v="${life.siblings ? life.siblings + "人" : "ひとりっ子"}">…</b></div>
    <button class="btn" id="go" style="visibility:hidden;margin-top:10px">人生をはじめる</button>
  </div>`);
  app.innerHTML = "";
  app.append(el);
  const slots = [...el.querySelectorAll<HTMLElement>("b.spin")];
  const pool = ["東京圏", "大阪圏", "地方の町", "300〜500万円", "1200万円以上", "名古屋圏", "地方中核都市", "500〜800万円"];
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
      go.onclick = () => startGame(life);
      if (AUTO) setTimeout(() => startGame(life), 200);
    }
  }, step / 4);
}

// ───────────────────────── プレイ ─────────────────────────

class Game {
  speed = 1; // 0 = 一時停止
  lastSpeed = 1;
  private yearT = 0; // 今の年の経過ms
  private current: YearRecord | null = null;
  private shown = 0;
  private raf = 0;
  private prev = 0;
  private choosing = false;
  private hud!: HTMLElement;
  private feed!: HTMLElement;
  private log!: HTMLElement;
  private ctrl!: HTMLElement;

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
    this.prev = performance.now();
    this.raf = requestAnimationFrame(this.loop);
    // 比較集団の計算は、余裕のあるときに済ませておく
    const idle = (window as unknown as { requestIdleCallback?: (f: () => void) => void }).requestIdleCallback ?? ((f: () => void) => setTimeout(f, 1500));
    idle(() => cohort());
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
      this.renderHud();
    }
    this.yearT += ms;
    const rec = this.current;
    const n = rec.events.length;
    // その年の出来事を、1年の中で順番に見せる
    while (this.shown < n && this.yearT >= ((this.shown + 0.5) / Math.max(n, 1)) * YEAR_MS * 0.8) {
      this.pushEvent(rec.events[this.shown++]);
    }
    (this.hud.querySelector("#prog") as HTMLElement).style.width = `${Math.min(100, (this.yearT / YEAR_MS) * 100)}%`;
    if (this.yearT >= YEAR_MS) {
      while (this.shown < n) this.pushEvent(rec.events[this.shown++]);
      this.current = null;
      if (this.life.dead) this.finish();
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
    const fam = l.partner ? "・配偶者あり" : "";
    const kids = l.kids.length ? `・子ども${l.kids.length}人` : "";
    const home = l.home === "own" ? "・持ち家" : l.home === "rent" ? "・賃貸" : "・実家";
    q("status").textContent = `${status}${fam}${kids}${home}`;
    const bal = rec ? rec.balance : l.balance;
    q("bal").textContent = yen(bal);
    q("bal").className = bal < 0 ? "minus" : "";
    const inc = rec ? Object.entries(rec.income).reduce((t, [k, v]) => t + (k === "invest" ? 0 : v ?? 0), 0) : 0;
    const exp = rec ? Object.values(rec.expense).reduce((t, v) => t + (v ?? 0), 0) : 0;
    q("inc").textContent = yen(inc);
    q("exp").textContent = yen(exp);
  }

  private pushEvent(e: LifeEvent): void {
    const amt = e.amount ? `<span class="amt ${e.amount > 0 ? "plus" : "minus"}">${e.amount > 0 ? "+" : ""}${yen(e.amount)}</span>` : "";
    // 新しい出来事を上に積む。下へスクロールして過去を読んでいる間は、表示位置を動かさない
    const reading = this.feed.scrollTop > 40;
    const el = h(`<div class="ev k-${e.kind}${e.major ? " major" : ""}"><div class="a">${e.age}歳</div><div class="t">${esc(e.text)}${amt}</div></div>`);
    this.feed.prepend(el);
    // 古いものは間引いて軽く保つ（全履歴は一時停止中のログで見られる）
    while (this.feed.children.length > 80) this.feed.lastElementChild!.remove();
    if (reading) this.feed.scrollTop += el.getBoundingClientRect().height + parseFloat(getComputedStyle(this.feed).rowGap || "0");
    else this.feed.scrollTop = 0;
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
          <summary><b>${y.age}歳</b><em>${head ? esc(head.text) : "—"}</em><span class="${y.balance < 0 ? "minus" : ""}">${yen(y.balance)}</span></summary>
          <div class="body">
            ${y.events.length ? `<ul>${y.events.map((e) => `<li>${esc(e.text)}${e.amount ? `（${e.amount > 0 ? "+" : ""}${yen(e.amount)}）` : ""}</li>`).join("")}</ul>` : "<p>特に大きな出来事はなかった。</p>"}
            <div class="nums"><span>収入 ${yen(inc)}</span><span>支出 ${yen(exp)}</span><span>${y.year}年</span><span>年末の貯え ${yen(y.balance)}</span></div>
          </div>
        </details>`;
      })
      .join("");
    this.log.innerHTML = `<h3>これまでの記録 <span>年をタップで詳細</span></h3>${items || "<p>まだ記録はありません。</p>"}`;
  }

  private openChoice(c: Choice): void {
    this.choosing = true;
    this.ctrl.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.s === "0"));
    const n = this.life.choiceLog.length + 1;
    const bg = h(`<div class="sheet-bg"><div class="sheet">
      <div class="tag">分かれ道 ${n} / 8 ・ ${c.age}歳</div>
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

async function showResult(life: Life): Promise<void> {
  app.innerHTML = `<div class="result"><div class="loading">お会計中…</div></div>`;
  await new Promise((r) => setTimeout(r, 30));
  const data = buildReceipt(life);
  const url = detailUrl(life, location.origin + location.pathname.replace(/\/[^/]*$/, ""));
  const root = h(`<div class="result">
    <h2>お会計が済みました</h2>
    <canvas id="rc"></canvas>
    <div class="row2">
      <button class="btn sub" id="png">PNGで保存</button>
      <a class="btn sub" id="x" href="${esc(shareIntentUrl(url))}" target="_blank" rel="noopener">Xで共有</a>
    </div>
    <a class="btn sub" href="${esc(url)}">詳しい明細を見る</a>
    <button class="btn" id="again">もう一度生まれる</button>
  </div>`);
  app.innerHTML = "";
  app.append(root);
  const cv = root.querySelector<HTMLCanvasElement>("#rc")!;
  try {
    await document.fonts?.ready;
  } catch {
    /* フォントが読めなくても描画は続ける */
  }
  drawReceipt(cv, data);
  root.querySelector<HTMLElement>("#png")!.onclick = () => downloadReceipt(cv, `jinsei-receipt-${life.seed}.png`);
  root.querySelector<HTMLElement>("#again")!.onclick = () => showBirth(randomSeed());
  (window as unknown as { __result: unknown }).__result = { url, data };
  window.scrollTo(0, 0);
}

showTitle();
