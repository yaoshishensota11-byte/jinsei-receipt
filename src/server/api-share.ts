// Vercel の関数 /s/<共有コード>（vercel.json で /api/share?c= に回す）：共有画像つきのページを返し、人が開いたら結果のページへ移す。
// scripts/buildapi.mjs で api/share.js にまとめる
import { shareHtml } from "./og";

type Req = { url?: string; headers: Record<string, string | string[] | undefined> };
type Res = { statusCode: number; setHeader(k: string, v: string): void; end(body?: unknown): void };

export default function handler(req: Req, res: Res): void {
  const code = decodeURIComponent(new URL(req.url ?? "/", "http://x").searchParams.get("c") ?? "");
  const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "jinsei-receipt.vercel.app");
  const proto = String(req.headers["x-forwarded-proto"] ?? "https");
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=31536000");
  res.end(shareHtml(code, `${proto}://${host}`));
}
