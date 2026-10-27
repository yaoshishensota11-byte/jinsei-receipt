// サーバーで動く関数（共有画像・共有ページ）を、ゲームのコードとデータごと1つのファイルにまとめて api/ に書き出す。
// Vercel は api/ のファイルを関数として動かす。ゲームの中身を変えたら、これを実行してから push する（npm run build でも実行される）。
import { build } from "esbuild";

for (const name of ["og", "share"]) {
  await build({
    entryPoints: [`src/server/api-${name}.ts`],
    outfile: `api/${name}.js`,
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node18",
    // 画像を作る部品は Vercel で入れたものを使う（アプリ用の部品を含むため、まとめない）
    external: ["satori", "@resvg/resvg-js"],
    banner: { js: "// このファイルは scripts/buildapi.mjs が作る。直接は書きかえない。" },
    logLevel: "warning",
  });
  console.log(`api/${name}.js を書き出しました`);
}
