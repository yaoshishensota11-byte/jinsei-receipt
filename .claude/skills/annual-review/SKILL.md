---
name: annual-review
description: 人生のレシートを年に1回見直す。使っている統計（物価・賃金・寿命・WHOや国連の推計・各国の出来事の確率・プロ選手の数字など）に新しい年の値が出ていないかを確かめ、新しい値があれば取り込み、テスト・共有URLの版上げ・紹介ページの作り直しまで行う。「年に1回の見直しをして」「統計を新しくして」「最新のデータに更新して」と言われたときに使う。
---

# 年に1回の見直し

人生のレシートは、2026年10月の時点で完成している。このスキルは、使っている統計を新しい年の値に置き換えるためのもの。
新しい値がなければ、何も変えずに「変更なし」と報告して終わる。

## 0. はじめに
- 返答は日本語で、結論を先に、専門用語はやさしく言いかえる（CLAUDE.md のきまり）。
- `git status` で作業前に変更が残っていないことを確かめる。ブランチは作業中のものを使う。
- 事実にもとづくことが方針。統計がない値を作らない。二次情報は記録に「二次情報」と書く。
- 片方の性別だけに出る出来事は作らない（ユーザーの判断）。

## 1. 何を見直すか（一覧を作る）
次の4つの順に、新しい年の値が出ているかを確かめる。出ていたものだけを取り込む候補にする。

| 種類 | どこにあるか | 主な出典 |
|---|---|---|
| 国の基本の統計（物価・賃金・寿命・進学・税など） | data/world/countries.json、cpi_annual.json、risks.json | 世界銀行 WDI、IMF、ILO、WHO、国連 |
| 第11部の暮らしの統計（交通事故・お産・口座・児童労働・移住・お酒など） | data/world/life_stats.json（build/build_life_stats.py） | WHO、国連、世界銀行 Global Findex、UNICEF、ILO |
| 国ごとの出来事の確率（110件） | data/world/country_events.json（build/apply_event_freq.py） | 出来事ごとの basis に出典 |
| 日本のプロスポーツの数字 | src/engine/sim.ts の PRO（コメントに出典） | NPB・選手会・Jリーグ・WEリーグ・高体連・高野連 |

あわせて、前の年に残した作業（CLAUDE.md の「年に1回の見直しで確かめること」）を必ず確かめる：
- 推計のまま残っている出来事10件（一覧は data/world/manual/part10_review.md の「3回分のまとめ」）に、公式の数字が出ていないか
- 女子サッカー（WEリーグ）の在籍年数の公式の統計が出ていないか（今は名簿から計算した目安の約8年）
- 女子・ほかの競技（バスケットボール・バレーボールなど）で、男女とも「1年にプロになる人数・年俸・在籍年数」がそろったか

## 2. 調べ方
- 自分で調べられるときは、curl で一次資料のページ・PDF・表を開いて確かめる（このクラウド環境は WebFetch が通らないことがあるが、curl は通る）。開けないときは、環境のネットの許可（Network access）を広げてもらうよう、ユーザーに頼む。
- 量が多いときは、country-data-research スキルで、ほかのAI（ChatGPT の Deep Research がいちばん確か。Gemini・Manus・Runable も使える）に渡す依頼文を作る。依頼文は [Role][Context][Task][Constraints][Output Format] の5つの形で、コードブロックに入れ、最後に「システム保守情報」を付ける。分子と分母を別の行で出してもらい、数字ごとにURLと年を書いてもらう。
- 返ってきたCSVは data/world/manual/ に保存し、値を確かめる（桁・定義・年・国の取り違え）。判断の理由は data/world/manual/ の判断メモ（例：part12_review.md）に書く。

## 3. 取り込み
変えた種類に合わせて、次を実行する。
```bash
python3 -I data/world/build/cpi_series.py          # 物価の年ごとの表を変えたとき
python3 -I data/world/build/build_marriage.py
python3 -I data/world/build/apply_manual.py         # countries.json・risks.json を変えたとき
python3 -I data/world/build/apply_event_freq.py     # 出来事の確率を変えたとき（CHECKED に追記）
python3 -I data/world/build/build_life_stats.py     # 第11部の統計を変えたとき（FILES に新しいCSVを足す）
node data/world/build/validate.mjs
node data/world/build/validate_risks.mjs
npx tsc --noEmit -p .
```
data/world/sources.md の末尾に、取り込んだ項目・出典・国の数を書き足す。

## 4. 共有URLの版を上げる
人生の結果が変わる変更をしたら、src/engine/result.ts の CODEC_VERSION を1つ上げる（同じURLで違う人生になるため）。文の言い回しだけの変更なら上げない。

## 5. テスト（すべて通るまで直す）
```bash
for m in j m w; do npx tsx scripts/simtest.ts 300 $m; done   # 3モード×300人。「問題なし」
npx tsx scripts/heirtest.ts                                   # 子どもに生まれ直す
npx tsx scripts/voicetest.ts 300                              # 家族の声
npx tsx scripts/consistencytest.ts 3000                       # 食い違い
```
版を上げたときは、simtest が「紹介ページのURLが古い版」と出すので、次の6で作り直してからもう一度流す。

## 6. 紹介ページを作り直す（版を上げたときだけ）
```bash
bash scripts/lpregen.sh 前の版の番号      # 例：版を18にしたなら 17
for m in j m w; do npx tsx scripts/simtest.ts 300 $m; done
node scripts/uitest.mjs 10                 # 画面を動かして10回遊ぶ。「10回すべて完走」と、等倍で約20分か
npm run build
```
lpregen.sh は 10分ほどかかるので、裏で動かして終わりを待つ。

## 7. 保存と報告
- `git add` して日本語でコミットし、作業中のブランチに push する（コミットの最後に、会話で指定された Co-Authored-By などの行を付ける）。
- 本番（https://jinsei-receipt.vercel.app/ と /lp/）で、紹介ページの例のリンクが新しい版になっているかを確かめる。
- CLAUDE.md の「年に1回の見直しで確かめること」を更新する（見直した日付、片付いたもの、まだ残るもの）。
- ユーザーへの報告：結論（変更あり／なし）、取り込んだ統計の表、変わった確率や数字の例、確かめたテスト、公開URL、まだ統計が出ていないもの。
