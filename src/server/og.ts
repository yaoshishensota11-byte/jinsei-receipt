// 結果ごとの共有画像（1200×630）と、共有用ページ（/s/<コード>）を作る。Vercel のサーバーで動く（api/ から呼ばれる）。
// 共有URLの「#」の後ろはXなどが読めないので、共有にはパス（/s/<コード>）を使い、
// そのページのOGP画像に、その人のレシートと「〇〇に生まれ、生涯で稼いだお金は約◯◯円」を描く。
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { decodeResult, replayCode, buildReceipt, lifetimeIncomeJpy, shareText, SHARE_TEXT, type ReceiptData } from "../engine/result";
import { jaUnits } from "../engine/data";

const W = 1200;
const H = 630;
const INK = "#23201c";
const SUB = "#6f6a61";
const RED = "#c8302c";
const PAPER = "#fbfaf6";
const TONE: Record<ReceiptData["stamp"]["tone"], string> = { red: "#c8302c", blue: "#2c5aa0", green: "#2f7d4f", gold: "#b8860b", gray: "#666" };

/** 円の目安（「約1.96億円」「約1,732万円」） */
function approx(jpy: number): string {
  return jpy < 0 ? `−約${jaUnits(-jpy)}円` : `約${jaUnits(jpy)}円`;
}

/** 共有コードからレシートを作る（再現できないコードなら null） */
export function receiptOf(code: string): ReceiptData | null {
  const d = decodeResult(code);
  if (!d) return null;
  try {
    const l = replayCode(d);
    if (!l || !l.records.length) return null;
    return buildReceipt(l, false);
  } catch {
    return null;
  }
}

// satori は React の要素と同じ形のオブジェクトを受け取る
type Node = { type: string; props: { style?: Record<string, unknown>; children?: unknown } };
const el = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({ type, props: { style: { display: "flex", ...style }, children } });

function layout(d: ReceiptData): Node {
  const gen = d.generation > 1 ? `${d.countryName}に生まれた${d.generation}代目。` : `${d.countryName}に生まれ、`;
  const income = approx(lifetimeIncomeJpy(d));
  const jpy = (n: number) => n * d.currency.jpyPerUnit;
  const items = d.items.slice(0, 6);
  const stampColor = TONE[d.stamp.tone];
  const stampLines = d.stamp.text.length <= 3 ? [d.stamp.text] : [d.stamp.text.slice(0, 2), d.stamp.text.slice(2)];
  const row = (left: string, right: string, style: Record<string, unknown> = {}) =>
    el("div", { justifyContent: "space-between", alignItems: "baseline", fontSize: 22, lineHeight: 1.25, padding: "5px 0", ...style }, [el("span", {}, left), el("span", {}, right)]);
  return el("div", { width: W, height: H, flexDirection: "column", background: "#e6e1d6", fontFamily: "BIZ UDGothic", color: INK }, [
    // レジの帯
    el("div", { height: 58, background: "#2a2622", color: "#f3efe6", alignItems: "center", padding: "0 40px", fontSize: 25, fontWeight: 700, justifyContent: "space-between" }, [
      el("span", {}, "人生のレシート"),
      el("span", { fontSize: 20, fontWeight: 400, color: "#e9e4d8" }, "#人生のレシート"),
    ]),
    el("div", { flex: 1, padding: "0 52px", justifyContent: "space-between" }, [
      // 左：問いかけと、生涯の稼ぎ
      el("div", { width: 640, height: 540, background: PAPER, flexDirection: "column", padding: "26px 40px", boxShadow: "0 18px 40px rgba(60,50,30,0.2)" }, [
        el("div", { justifyContent: "space-between", alignItems: "baseline", borderBottom: "3px dashed #b8b2a6", paddingBottom: 10 }, [
          el("span", { fontSize: 30, fontWeight: 700, letterSpacing: 2 }, "人生商店"),
          el("span", { fontSize: 18, color: SUB }, d.generation > 1 ? d.generationLabel : "LIFE STORE"),
        ]),
        el("div", { marginTop: 28, fontSize: 44, fontWeight: 700 }, gen),
        el("div", { marginTop: 6, fontSize: 36, fontWeight: 700 }, "生涯で稼いだお金は"),
        el("div", { marginTop: 4, fontSize: 92, fontWeight: 700, color: RED, letterSpacing: -1 }, income),
        el("div", { marginTop: 18, fontSize: 22, color: SUB }, (d.currency.code === "JPY" ? d.customer : d.customer.replace(/^.*?・/, "")).slice(0, 30)),
        el("div", { marginTop: 4, fontSize: 22, color: SUB }, d.deathLine),
        el("div", { marginTop: "auto", paddingTop: 14, borderTop: "3px solid " + INK, fontSize: 30, fontWeight: 700 }, SHARE_TEXT.replace(" #人生のレシート", "")),
      ]),
      // 右：レシート（費目の上位と、お釣り・はんこ）
      el("div", { width: 410, height: 470, marginTop: 34, background: PAPER, flexDirection: "column", padding: "24px 28px", transform: "rotate(3deg)", boxShadow: "0 14px 26px rgba(60,50,30,0.25)", position: "relative" }, [
        el("div", { justifyContent: "center", fontSize: 30, fontWeight: 700 }, "人生商店"),
        el("div", { borderBottom: "2px dashed #b8b2a6", margin: "10px 0 8px" }),
        ...items.map((it) => row(it.label, approx(jpy(it.amount)))),
        el("div", { borderBottom: "2px solid " + INK, margin: "8px 0" }),
        row("お釣り", approx(jpy(d.change)), { fontSize: 28, fontWeight: 700, color: d.change < 0 ? "#8b1a1a" : INK }),
        el(
          "div",
          { position: "absolute", right: 26, bottom: 30, width: 118, height: 118, borderRadius: 59, border: `5px solid ${stampColor}`, color: stampColor, flexDirection: "column", alignItems: "center", justifyContent: "center", transform: "rotate(-12deg)", opacity: 0.85, fontSize: 28, fontWeight: 700, lineHeight: 1.1 },
          stampLines.map((t) => el("span", {}, t)),
        ),
      ]),
    ]),
  ]);
}

const fontCache = new Map<string, ArrayBuffer>();
/** Google Fonts から、使う文字だけを含むフォント（TTF）を取ってくる */
async function font(text: string, weight: 400 | 700): Promise<ArrayBuffer> {
  const uniq = [...new Set(text)].sort().join("");
  const key = weight + uniq;
  const hit = fontCache.get(key);
  if (hit) return hit;
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=BIZ+UDGothic:wght@${weight}&text=${encodeURIComponent(uniq)}`)).text();
  const url = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/.exec(css)?.[1];
  if (!url) throw new Error("フォントを取得できない");
  const buf = await (await fetch(url)).arrayBuffer();
  if (fontCache.size > 50) fontCache.clear();
  fontCache.set(key, buf);
  return buf;
}

/** 木の中の文字をすべて集める（フォントを文字だけ取り寄せるため） */
function textOf(n: unknown): string {
  if (typeof n === "string") return n;
  if (Array.isArray(n)) return n.map(textOf).join("");
  if (n && typeof n === "object" && "props" in n) return textOf((n as Node).props.children);
  return "";
}

/** 共有画像（PNG）。コードが読めないときは null */
export async function ogPng(code: string): Promise<Uint8Array | null> {
  const d = receiptOf(code);
  if (!d) return null;
  const tree = layout(d);
  const text = textOf(tree) + "0123456789約円億万";
  const [regular, bold] = await Promise.all([font(text, 400), font(text, 700)]);
  const svg = await satori(tree as never, {
    width: W,
    height: H,
    fonts: [
      { name: "BIZ UDGothic", data: regular, weight: 400, style: "normal" },
      { name: "BIZ UDGothic", data: bold, weight: 700, style: "normal" },
    ],
  });
  return new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng();
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** 共有用ページ（/s/<コード>）。Xなどにはその人の画像を見せ、人が開いたら結果のページへ移す */
export function shareHtml(code: string, origin: string): string {
  const d = receiptOf(code);
  const detail = `${origin}/r.html#${code}`;
  const title = d ? `人生のレシート｜${d.countryName}に生まれた人生` : "人生のレシート";
  const desc = d ? shareText(d) : SHARE_TEXT;
  const img = d ? `${origin}/api/og?c=${encodeURIComponent(code)}` : `${origin}/og.png`;
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="人生のレシート" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${esc(`${origin}/s/${code}`)}" />
<meta property="og:image" content="${esc(img)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${esc(img)}" />
<meta http-equiv="refresh" content="0; url=${esc(detail)}" />
<link rel="canonical" href="${esc(detail)}" />
<script>location.replace(${JSON.stringify(detail)});</script>
</head>
<body><p><a href="${esc(detail)}">人生のレシートを見る</a></p></body>
</html>`;
}
