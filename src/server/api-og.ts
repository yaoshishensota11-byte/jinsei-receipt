// Vercel の関数 /api/og?c=<共有コード>：その人の共有画像（PNG）を返す。scripts/buildapi.mjs で api/og.js にまとめる
import { ogPng } from "./og";

type Req = { url?: string };
type Res = { statusCode: number; setHeader(k: string, v: string): void; end(body?: unknown): void };

export default async function handler(req: Req, res: Res): Promise<void> {
  const code = new URL(req.url ?? "/", "http://x").searchParams.get("c") ?? "";
  try {
    const png = await ogPng(code);
    if (!png) {
      // 読めないコードは、ふつうの共有画像へ
      res.statusCode = 302;
      res.setHeader("Location", "/og.png");
      res.end();
      return;
    }
    res.statusCode = 200;
    res.setHeader("Content-Type", "image/png");
    // 同じコードからはいつも同じ画像になるので、長く覚えておいてよい
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=31536000, immutable");
    res.end(png);
  } catch (e) {
    console.error(e);
    res.statusCode = 302;
    res.setHeader("Location", "/og.png");
    res.end();
  }
}
