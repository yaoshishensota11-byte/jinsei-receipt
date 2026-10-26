// 結果の詳細ページ（r.html#<code>）。URLのコードから人生を再現して描く。サーバー不要。
import { langPicker } from "./ui/lang";
import "./ui/detail.css";
import { buildReceipt, decodeResult, isOldVersion, replayByIndex, shareIntentUrl, turningPoints, yen } from "./engine/result";
import { EXPENSE_LABEL, type ExpenseCat, type IncomeCat, type YearRecord } from "./engine/types";
import type { Life } from "./engine/sim";
import { showReceipt, downloadReceipt } from "./ui/receipt";

const app = document.getElementById("app")!;

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
// 表示する通貨（main で人生を再現したあと、その国のものに切り替える）
let fmt: (n: number) => string = yen;
let unit = "円";
function man(n: number): string {
  return `${Math.round(n / 1e4).toLocaleString("ja-JP")}万${unit}`;
}
function signedYen(n: number): string {
  return n > 0 ? `+${fmt(n)}` : fmt(n);
}

function showError(): void {
  document.title = "人生のレシート｜詳細";
  app.innerHTML = `
    <section class="empty">
      <h1>レシートが見つかりません</h1>
      <p>リンクが途中で切れているか、古い形式のようです。<br>新しい人生を始めて、あなたのレシートを発行してみませんか。</p>
      <a class="btn primary" href="./">自分も生まれてみる</a>
    </section>`;
}

/** 古い版のURLを開いたとき。ゲームの内容が変わり、そのレシートは再現できない */
function showOld(): void {
  document.title = "人生のレシート｜詳細";
  app.innerHTML = `
    <section class="empty">
      <h1>このレシートは古い版のため表示できません</h1>
      <p>ゲームの内容が新しくなり、以前の版で発行されたレシートは同じ人生を再現できなくなりました。<br>お手数ですが、もう一度遊んでみてください。</p>
      <p class="q">同じ一生でも、生まれた国で<br>稼げるお金はどれだけ違う？</p>
      <a class="btn primary" href="./">もう一度生まれる</a>
    </section>`;
}

interface YearFlow {
  age: number;
  income: number;
  expense: number;
  balance: number;
}
function flows(records: YearRecord[]): YearFlow[] {
  return records.map((r) => {
    let income = 0;
    for (const [k, v] of Object.entries(r.income) as [IncomeCat, number][]) if (k !== "invest") income += v ?? 0;
    let expense = 0;
    for (const v of Object.values(r.expense)) expense += v ?? 0;
    return { age: r.age, income, expense, balance: r.balance };
  });
}

function niceStep(max: number, ticks: number): number {
  const raw = max / ticks;
  const p = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const m = raw / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}

function renderChart(box: HTMLElement, data: YearFlow[]): void {
  const svgNS = "http://www.w3.org/2000/svg";
  const tip = box.querySelector<HTMLElement>(".tip")!;
  const holder = box.querySelector<HTMLElement>(".chart-svg")!;
  const draw = () => {
    const W = Math.max(280, holder.clientWidth);
    const H = Math.round(Math.min(320, Math.max(220, W * 0.62)));
    const m = { l: 44, r: 46, t: 26, b: 26 };
    const iw = W - m.l - m.r;
    const ih = H - m.t - m.b;
    const maxIn = Math.max(1, ...data.map((d) => d.income));
    const maxEx = Math.max(1, ...data.map((d) => d.expense));
    const step = niceStep(Math.max(maxIn, maxEx), 2);
    const top = Math.ceil(maxIn / step) * step || step;
    const bot = Math.ceil(maxEx / step) * step || step;
    const y = (v: number) => m.t + ((top - v) / (top + bot)) * ih;
    const minB = Math.min(0, ...data.map((d) => d.balance));
    const maxB = Math.max(1, ...data.map((d) => d.balance));
    const bStep = niceStep(maxB - minB, 3);
    const bTop = Math.ceil(maxB / bStep) * bStep;
    const bBot = Math.floor(minB / bStep) * bStep;
    const yb = (v: number) => m.t + ((bTop - v) / (bTop - bBot || 1)) * ih;
    const n = data.length;
    const bw = iw / n;
    const x = (i: number) => m.l + i * bw;

    let s = `<svg xmlns="${svgNS}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="年齢ごとの収入・支出・資産残高">`;
    // grid + left axis
    for (let v = -bot; v <= top + 1e-6; v += step) {
      const yy = y(v).toFixed(1);
      s += `<line x1="${m.l}" x2="${W - m.r}" y1="${yy}" y2="${yy}" class="${v === 0 ? "axis0" : "grid"}"/>`;
      s += `<text x="${m.l - 6}" y="${yy}" class="tick l">${Math.round(Math.abs(v) / 1e4).toLocaleString("ja-JP")}</text>`;
    }
    // right axis (balance)
    for (let v = bBot; v <= bTop + 1e-6; v += bStep) {
      s += `<text x="${W - m.r + 6}" y="${yb(v).toFixed(1)}" class="tick r">${Math.round(v / 1e4).toLocaleString("ja-JP")}</text>`;
    }
    // bars
    const gap = bw > 4 ? 0.8 : 0.3;
    data.forEach((d, i) => {
      const bx = (x(i) + gap / 2).toFixed(2);
      const w = Math.max(0.6, bw - gap).toFixed(2);
      if (d.income > 0) s += `<rect x="${bx}" y="${y(d.income).toFixed(1)}" width="${w}" height="${(y(0) - y(d.income)).toFixed(1)}" class="b-in"/>`;
      if (d.expense > 0) s += `<rect x="${bx}" y="${y(0).toFixed(1)}" width="${w}" height="${(y(-d.expense) - y(0)).toFixed(1)}" class="b-ex"/>`;
    });
    // balance line
    const pts = data.map((d, i) => `${(x(i) + bw / 2).toFixed(1)},${yb(d.balance).toFixed(1)}`).join(" ");
    s += `<polyline points="${pts}" class="bal"/>`;
    // x ticks every 10 years
    data.forEach((d, i) => {
      if (d.age % 10 === 0) s += `<text x="${(x(i) + bw / 2).toFixed(1)}" y="${H - 8}" class="tick x">${d.age}</text>`;
    });
    s += `<text x="${m.l - 6}" y="${m.t - 14}" class="unit l">万${unit}</text>`;
    s += `<text x="${W - m.r + 6}" y="${m.t - 14}" class="unit r">残高</text>`;
    s += `<line class="cursor" x1="0" x2="0" y1="${m.t}" y2="${H - m.b}" visibility="hidden"/>`;
    s += `<rect class="hit" x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" fill="transparent"/>`;
    s += `</svg>`;
    holder.innerHTML = s;

    const svg = holder.querySelector("svg")!;
    const cursor = svg.querySelector<SVGLineElement>(".cursor")!;
    const show = (clientX: number) => {
      const rect = svg.getBoundingClientRect();
      const px = ((clientX - rect.left) / rect.width) * W;
      const i = Math.min(n - 1, Math.max(0, Math.floor((px - m.l) / bw)));
      const d = data[i];
      const cx = x(i) + bw / 2;
      cursor.setAttribute("x1", String(cx));
      cursor.setAttribute("x2", String(cx));
      cursor.setAttribute("visibility", "visible");
      tip.innerHTML = `<b>${d.age}歳</b><span class="in">収入 ${fmt(d.income)}</span><span class="ex">支出 ${fmt(d.expense)}</span><span class="bl">残高 ${fmt(d.balance)}</span>`;
      tip.hidden = false;
      const left = (cx / W) * rect.width;
      const tw = tip.offsetWidth;
      tip.style.left = `${Math.min(holder.clientWidth - tw, Math.max(0, left - tw / 2))}px`;
    };
    const hide = () => {
      tip.hidden = true;
      cursor.setAttribute("visibility", "hidden");
    };
    svg.addEventListener("pointermove", (e) => show(e.clientX));
    svg.addEventListener("pointerdown", (e) => show(e.clientX));
    svg.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "mouse") hide();
    });
  };
  draw();
  let last = holder.clientWidth;
  new ResizeObserver(() => {
    if (Math.abs(holder.clientWidth - last) < 2) return;
    last = holder.clientWidth;
    draw();
  }).observe(holder);
}

function render(l: Life): void {
  const s = l.summary();
  const d = buildReceipt(l);
  const tps = turningPoints(l);
  const sexWord = s.sex === "male" ? "男性" : "女性";
  const total = Object.values(s.expenseTotal).reduce((a, b) => a + (b ?? 0), 0) || 1;
  const cats = (Object.entries(s.expenseTotal) as [ExpenseCat, number][])
    .filter(([, v]) => (v ?? 0) > 0)
    .sort((a, b) => b[1] - a[1]);
  const maxCat = cats[0]?.[1] || 1;

  document.title = `人生のレシート｜詳細`;
  app.innerHTML = `
    <header class="head">
      <p class="eyebrow">人生のレシート ・ 詳細</p>
      <h1>${esc(l.D.isJapan ? "" : l.D.nameJa + "・")}${esc(s.regionLabel)}生まれ、${s.deathAge}歳で閉店</h1>
      <p class="summary">
        ${esc(l.D.isJapan ? "" : l.D.nameJa + "の")}${esc(s.regionLabel)}で、${esc(l.D.isJapan ? s.familyBandLabel + "の家庭" : s.familyBandLabel)}に${sexWord}として誕生。
        ${s.deathAge}歳、${esc(s.deathCause)}で人生を終えました。
        生涯収入 <b>${fmt(s.lifetimeIncome)}</b>、最後に残ったのは
        <b class="${s.finalBalance < 0 ? "neg" : ""}">${fmt(s.finalBalance)}</b>
        <span class="chip tone-${d.stamp.tone}">${esc(d.stamp.text)}</span>
      </p>
    </header>

    <section class="receipt-card">
      <canvas id="receipt" aria-label="人生のレシート画像"></canvas>
      <div class="actions">
        <button type="button" class="btn" id="save">PNGで保存</button>
        <button type="button" class="btn dark" id="share">Xで共有</button>
      </div>
      <a class="btn primary wide" href="./">自分も生まれてみる</a>
    </section>

    <section class="panel">
      <h2>年齢ごとのお金の流れ</h2>
      <p class="legend"><i class="k-in"></i>収入 <i class="k-ex"></i>支出 <i class="k-bl"></i>資産残高（右目盛）</p>
      <div class="chart">
        <div class="chart-svg"></div>
        <div class="tip" hidden></div>
      </div>
      <p class="note">グラフをタップすると、その年の金額が出ます。単位は万${unit}。運用益は収入に含みません。</p>
    </section>

    <section class="panel">
      <h2>主な支出の内訳</h2>
      <ul class="bars">
        ${cats
          .map(
            ([k, v]) => `<li>
              <div class="bar-head"><span>${EXPENSE_LABEL[k]}</span><span class="num">${fmt(v)}<small>${((v / total) * 100).toFixed(1)}%</small></span></div>
              <div class="track"><div class="fill" style="width:${((v / maxCat) * 100).toFixed(1)}%"></div></div>
            </li>`,
          )
          .join("")}
      </ul>
      <p class="total">支出合計 <b>${fmt(total)}</b></p>
    </section>

    <section class="panel">
      <h2>転機となった出来事</h2>
      <ol class="timeline">
        ${tps
          .map(
            (t) => `<li>
              <span class="age">${t.age}歳</span>
              <div class="tl-body"><p>${esc(t.text)}</p>${
                t.amount ? `<span class="amt ${t.amount < 0 ? "minus" : "plus"}">${signedYen(t.amount)}</span>` : ""
              }</div>
            </li>`,
          )
          .join("")}
      </ol>
    </section>

    <section class="panel">
      <h2>選んだ道</h2>
      ${
        s.choices.length
          ? `<ul class="choices">${s.choices.map((c) => `<li><span class="age">${c.age}歳</span><span>${esc(c.label)}</span></li>`).join("")}</ul>`
          : `<p class="note">選択の場面はありませんでした。</p>`
      }
    </section>

    <footer class="foot">
      <a class="btn primary wide" href="./">自分も生まれてみる</a>
      <p>このページの人生は、URLの中の番号だけから毎回同じように再現されています。<br>金額は公的統計をもとにした架空の試算です。</p>
    </footer>`;

  const canvas = document.getElementById("receipt") as HTMLCanvasElement;
  void showReceipt(canvas, d);
  document.getElementById("save")!.addEventListener("click", () => {
    downloadReceipt(canvas, `jinsei-receipt-${d.receiptNo}.png`).catch(() => {});
  });
  document.getElementById("share")!.addEventListener("click", () => {
    window.open(shareIntentUrl(location.href, d), "_blank", "noopener");
  });
  renderChart(app.querySelector<HTMLElement>(".chart")!, flows(l.records));
  const head = app.querySelector(".head");
  if (head) {
    const lp = langPicker();
    lp.style.float = "right";
    head.prepend(lp);
  }
}

async function main(): Promise<void> {
  const code = decodeURIComponent(location.hash.slice(1));
  const parsed = code ? decodeResult(code) : null;
  if (!parsed) return code && isOldVersion(code) ? showOld() : showError();
  let life: Life;
  try {
    life = replayByIndex(parsed.seed, parsed.picks, parsed.mode);
    const D = life.D;
    fmt = (n) => D.fmt(n);
    unit = D.currency.nameJa;
    if (!life.records.length) return showError();
  } catch (e) {
    console.warn(e);
    return showError();
  }
  try {
    const f = document.fonts;
    if (f) {
      const loads = Promise.all([f.load('400 16px "BIZ UDGothic"', "人生"), f.load('700 16px "BIZ UDGothic"', "人生")]).then(() => f.ready);
      await Promise.race([loads, new Promise((r) => setTimeout(r, 2500))]);
    }
  } catch {
    /* フォント読み込み失敗は無視 */
  }
  render(life);
}

window.addEventListener("hashchange", () => location.reload());
main();
