// 感熱紙風のレシートを canvas に描く。PNG保存・共有もここで扱う。
import { lifetimeIncomeJpy, type ReceiptData } from "../engine/result";

const W = 400;
const PAD = 26;
const FONT = '"BIZ UDGothic","Hiragino Kaku Gothic ProN","Noto Sans JP",monospace';
const INK = "#222";
const GRAY = "#777";
const PAPER = "#fbfaf6";
const RED_INK = "#8b1a1a";
const TOOTH = 8;

const TONE: Record<ReceiptData["stamp"]["tone"], string> = {
  red: "#c8302c",
  blue: "#2c5aa0",
  green: "#2f7d4f",
  gold: "#b8860b",
  gray: "#666",
};

/** ¥12,345,678 形式。負は -¥。他の国は現地の通貨記号で表示する */
export function yenFull(n: number, symbol = "¥"): string {
  const r = Math.round(n);
  return `${r < 0 ? "-" : ""}${symbol}${Math.abs(r).toLocaleString("ja-JP")}`;
}
/** 円に直した目安（万円単位） */
function approxYen(n: number): string {
  const a = Math.abs(n);
  const v = a >= 1e8 ? `${(a / 1e8).toFixed(2)}億円` : a >= 1e4 ? `${Math.round(a / 1e4).toLocaleString("ja-JP")}万円` : `${Math.round(a).toLocaleString("ja-JP")}円`;
  return `約${n < 0 ? "-" : ""}${v}`;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function font(size: number, bold = false): string {
  return `${bold ? "700" : "400"} ${size}px ${FONT}`;
}

function fit(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 0 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
  return t + "…";
}

interface Pen {
  ctx: CanvasRenderingContext2D;
  draw: boolean;
  y: number;
  changeY: number;
}

function text(p: Pen, s: string, x: number, size: number, opts: { bold?: boolean; align?: CanvasTextAlign; color?: string; maxW?: number } = {}): void {
  if (!p.draw) return;
  const { ctx } = p;
  ctx.font = font(size, opts.bold);
  ctx.fillStyle = opts.color ?? INK;
  ctx.textAlign = opts.align ?? "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(opts.maxW ? fit(ctx, s, opts.maxW) : s, x, p.y);
}

function row(p: Pen, left: string, right: string, size: number, opts: { bold?: boolean; color?: string; rightColor?: string } = {}): void {
  p.y += size + 6;
  if (!p.draw) return;
  const { ctx } = p;
  ctx.font = font(size, opts.bold);
  const rw = ctx.measureText(right).width;
  text(p, right, W - PAD, size, { bold: opts.bold, align: "right", color: opts.rightColor ?? opts.color });
  text(p, left, PAD, size, { bold: opts.bold, color: opts.color, maxW: W - PAD * 2 - rw - 12 });
}

function rule(p: Pen, kind: "dash" | "solid" | "double" = "dash"): void {
  p.y += 12;
  if (p.draw) {
    const { ctx } = p;
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1;
    if (kind === "dash") ctx.setLineDash([5, 4]);
    const line = (yy: number) => {
      ctx.beginPath();
      ctx.moveTo(PAD, yy + 0.5);
      ctx.lineTo(W - PAD, yy + 0.5);
      ctx.stroke();
    };
    line(p.y);
    if (kind === "double") line(p.y + 4);
    ctx.restore();
  }
  p.y += kind === "double" ? 8 : 4;
}

function rankBar(p: Pen, label: string, rank: number): void {
  p.y += 22;
  const barX = PAD + 78;
  const barW = W - PAD * 2 - 78 - 72;
  const pct = `上位${Math.max(1, Math.round(rank * 100))}%`;
  if (p.draw) {
    const { ctx } = p;
    text(p, label, PAD, 13);
    const by = p.y - 9;
    ctx.fillStyle = "#e4e1d8";
    ctx.fillRect(barX, by, barW, 8);
    const pos = Math.min(1, Math.max(0, 1 - rank));
    ctx.fillStyle = "#bbb6a8";
    ctx.fillRect(barX, by, barW * pos, 8);
    ctx.fillStyle = INK;
    const mx = barX + barW * pos;
    ctx.beginPath();
    ctx.moveTo(mx, by + 10);
    ctx.lineTo(mx - 5, by - 5);
    ctx.lineTo(mx + 5, by - 5);
    ctx.closePath();
    ctx.fill();
    text(p, pct, W - PAD, 13, { bold: true, align: "right" });
  }
}

function barcode(p: Pen, code: string): void {
  const h = 46;
  const top = p.y + 14;
  if (p.draw) {
    const { ctx } = p;
    const rnd = mulberry(hash("barcode|" + code));
    const total = 240;
    const x0 = (W - total) / 2;
    let x = x0;
    ctx.fillStyle = INK;
    // ガード
    const bars: number[] = [1, 1, 1, 1];
    while (bars.reduce((a, b) => a + b, 0) < total - 8) bars.push(1 + Math.floor(rnd() * 3.2));
    bars.push(1, 1, 1);
    const unit = total / bars.reduce((a, b) => a + b, 0);
    bars.forEach((w, i) => {
      if (i % 2 === 0) ctx.fillRect(x, top, w * unit, h);
      x += w * unit;
    });
    ctx.font = font(11);
    ctx.textAlign = "center";
    ctx.fillText(code.split("").join(" "), W / 2, top + h + 14);
  }
  p.y = top + h + 14;
}

function stamp(ctx: CanvasRenderingContext2D, d: ReceiptData, cx: number, cy: number): void {
  const color = TONE[d.stamp.tone];
  const rnd = mulberry(hash("stamp|" + d.receiptNo));
  const R = 50;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-12 * Math.PI) / 180);
  ctx.globalAlpha = 0.78;
  ctx.globalCompositeOperation = "multiply";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  // ざらついた二重円
  const ring = (r: number, w: number) => {
    ctx.lineWidth = w;
    ctx.beginPath();
    const n = 72;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r + (rnd() - 0.5) * 1.6;
      const x = Math.cos(a) * rr;
      const y = Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };
  ring(R, 3.2);
  ring(R - 6, 1.2);
  // 文字（4文字以上は2段）
  const t = d.stamp.text;
  const lines = t.length <= 3 ? [t] : [t.slice(0, Math.ceil(t.length / 2)), t.slice(Math.ceil(t.length / 2))];
  const maxLen = Math.max(...lines.map((l) => l.length));
  const size = Math.min(30, Math.floor(((R - 10) * 2 * 0.9) / maxLen));
  ctx.font = font(size, true);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lh = size * 1.08;
  lines.forEach((l, i) => ctx.fillText(l, 0, (i - (lines.length - 1) / 2) * lh + 1));
  // かすれ：インクを部分的に抜く
  ctx.globalCompositeOperation = "destination-out";
  ctx.globalAlpha = 1;
  for (let i = 0; i < 260; i++) {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * (R + 3);
    const s = rnd() * 1.8 + 0.3;
    ctx.globalAlpha = 0.25 + rnd() * 0.6;
    ctx.fillRect(Math.cos(a) * r, Math.sin(a) * r, s, s);
  }
  ctx.restore();
}

function layout(p: Pen, d: ReceiptData): void {
  p.y = TOOTH + 34;
  // 店名
  p.y += 34;
  text(p, "人生商店", W / 2, 38, { bold: true, align: "center" });
  p.y += 22;
  text(p, "LIFE STORE ─ 本日も一度きりの営業です", W / 2, 11, { align: "center", color: GRAY });
  rule(p);
  const info: [string, string][] = [
    ["来店", d.visitDate],
    ["閉店", d.closeDate],
    ["お客様", d.customer],
    ["No.", d.receiptNo],
  ];
  for (const [k, v] of info) {
    p.y += 19;
    text(p, k, PAD, 13, { color: GRAY });
    text(p, v, PAD + 62, 13, { maxW: W - PAD * 2 - 62 });
  }
  rule(p);
  const jp = d.currency.code === "JPY";
  const sym = jp ? "¥" : d.currency.symbol || d.currency.code + " ";
  const money = (n: number) => yenFull(n, sym);
  for (const it of d.items) {
    row(p, it.label, money(it.amount), 15);
    if (it.memo && it.memo !== "—") {
      p.y += 16;
      text(p, "　└ " + it.memo, PAD, 11, { color: GRAY, maxW: W - PAD * 2 });
    }
    p.y += 3;
  }
  rule(p, "solid");
  row(p, "小計", money(d.subtotal), 16, { bold: true });
  p.y += 6;
  row(p, "お預かり", money(d.deposit), 16, { bold: true });
  for (const l of d.depositLines) {
    p.y += 16;
    if (p.draw) {
      text(p, "　" + l.label, PAD + 8, 11, { color: GRAY });
      text(p, money(l.amount), W - PAD, 11, { color: GRAY, align: "right" });
    }
  }
  rule(p, "double");
  p.y += 4;
  p.changeY = p.y + 18;
  row(p, "お釣り", money(d.change), 26, { bold: true, rightColor: d.change < 0 ? RED_INK : INK });
  if (!jp) {
    p.y += 20;
    // はんこと重ならないよう左に寄せる
    text(p, `${approxYen(d.change * d.currency.jpyPerUnit)}（今日の為替で換算）`, PAD, 11, { color: GRAY });
    p.y += 44;
  } else p.y += 64; // はんこの置き場
  rule(p);
  p.y += 22;
  text(p, jp ? `同い年${d.cohortSize}人の中で` : `${d.countryName}の同い年${d.cohortSize}人の中で`, PAD, 13, { color: GRAY });
  rankBar(p, "生涯収入", d.rankIncome);
  rankBar(p, "お釣り", d.rankBalance);
  p.y += 10;
  // 生涯で稼いだお金を、円に直して一言で目立たせる
  rule(p);
  p.y += 24;
  text(p, `生涯で稼いだお金　${approxYen(lifetimeIncomeJpy(d))}`, W / 2, 15, { bold: true, align: "center", maxW: W - PAD * 2 });
  p.y += 10;
  rule(p);
  p.y += 24;
  text(p, d.deathLine, W / 2, 14, { bold: true, align: "center", maxW: W - PAD * 2 });
  p.y += 30;
  text(p, d.closing, W / 2, 13, { align: "center", maxW: W - PAD * 2 });
  barcode(p, d.receiptNo);
  p.y += 24;
  text(p, "#人生のレシート", W / 2, 13, { bold: true, align: "center" });
  p.y += 30 + TOOTH;
}

function paperPath(ctx: CanvasRenderingContext2D, H: number): void {
  const n = Math.round(W / (TOOTH * 2));
  const step = W / n;
  ctx.beginPath();
  ctx.moveTo(0, TOOTH);
  for (let i = 0; i < n; i++) {
    ctx.lineTo(i * step + step / 2, 0);
    ctx.lineTo((i + 1) * step, TOOTH);
  }
  ctx.lineTo(W, H - TOOTH);
  for (let i = n; i > 0; i--) {
    ctx.lineTo(i * step - step / 2, H);
    ctx.lineTo((i - 1) * step, H - TOOTH);
  }
  ctx.closePath();
}

export function drawReceipt(canvas: HTMLCanvasElement, d: ReceiptData): void {
  const dpr = Math.max(2, Math.ceil(window.devicePixelRatio || 1));
  const mctx = canvas.getContext("2d");
  if (!mctx) return;
  const measure: Pen = { ctx: mctx, draw: false, y: 0, changeY: 0 };
  layout(measure, d);
  const H = Math.ceil(measure.y);

  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.aspectRatio = `${W} / ${H}`;
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  // 紙
  ctx.save();
  paperPath(ctx, H);
  ctx.fillStyle = PAPER;
  ctx.fill();
  ctx.clip();
  const rnd = mulberry(hash("paper|" + d.receiptNo));
  for (let i = 0; i < (W * H) / 90; i++) {
    ctx.fillStyle = rnd() < 0.5 ? "rgba(0,0,0,0.035)" : "rgba(120,100,60,0.04)";
    ctx.fillRect(rnd() * W, rnd() * H, 1, 1);
  }
  // うっすら縦の感熱ムラ
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, "rgba(0,0,0,0.025)");
  g.addColorStop(0.5, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.03)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const pen: Pen = { ctx, draw: true, y: 0, changeY: 0 };
  layout(pen, d);
  stamp(ctx, d, W - PAD - 62, pen.changeY + 36);
  ctx.restore();
}

export function receiptBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
  });
}

export async function downloadReceipt(canvas: HTMLCanvasElement, filename = "jinsei-receipt.png"): Promise<void> {
  const blob = await receiptBlob(canvas);
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (mobile && typeof File !== "undefined" && navigator.canShare) {
    const file = new File([blob], filename, { type: "image/png" });
    try {
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "人生のレシート" });
        return;
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
