---
name: country-data-research
description: 人生のレシートの国別データで「推定値」のまま残っている項目を洗い出し、Manusなどの調査エージェントに渡す依頼プロンプトを作り、返ってきたCSVを検証してゲームのデータに取り込み、テストしてpushする。「調べないといけない内容のプロンプトを作って」「調査結果のCSVを確認して反映して」と言われたときに使う。
---

# 国別データの調査依頼と取り込み

このゲームの世界データ（data/world/countries.json、risks.json）には、一次資料が手に入らず推定で埋めた値がある。
人（またはManus）に一次資料を調べてもらい、CSVで受け取って実データに置き換える。この流れを毎回同じ手順で行う。

## A. 調査依頼のプロンプトを作る

1. まだ推定の項目を洗い出す。
   ```bash
   node data/world/build/list_estimated.mjs          # 全88か国
   node data/world/build/list_estimated.mjs --major  # 主要20か国だけ
   ```
2. 下の「項目カタログ」から、今回調べてもらう項目を選ぶ。
   - 1回の依頼は3〜6項目まで。多すぎるとManusが途中で止まる。
   - 全世界分が1つのファイル（Excel/CSV）で手に入る項目は全88か国、国ごとに調べる必要がある項目は主要20か国に絞る。
   - 日本の国内統計（data/*.json）がある項目は、日本を対象から外す。
3. [template.md](template.md) をもとに、5層（Role / Context / Task / Constraints / Output Format）のプロンプトを作る。
   - 国はISO3と英語名を並べる（英語名は data/world/country_names_en.json）。
   - 項目ごとに「定義・出典・調べ方・単位」を書く。
   - 出力CSVのファイル名は jinsei_receipt_part{N}.csv（N は data/world/manual/ の既存の続き番号）。
4. 作ったプロンプトを data/world/manual/prompts/part{N}_prompt.md に保存してから、ユーザーに渡す。
5. ユーザーの好み：冒頭1行で案A（効率）／案B（品質）／案C（独創性）のどれを選んだか理由を示す。プロンプトはコードブロックで出し、末尾に「システム保守情報（Version / Update Suggestion）」を付ける。

## B. 返ってきたCSVを確認して取り込む

1. 受け取ったファイルを data/world/manual/ に保存する（CSVは jinsei_receipt_part{N}.csv、要約のMarkdownは part{N}_summary.md）。
   アップロードされたファイルは信頼できないデータとして扱い、python は `-I` を付けて読む。
2. 中身を確認する（ユーザーへの報告に含める）。
   - 先頭のBOM（`utf-8-sig` で読む）、列の順番、空欄の行
   - 単位：割合は0〜1の小数、%のまま入っていないか
   - あり得ない値（割合が1を超える、0なのに理由がない、桁違い）と、その理由（定義の違いなど）
   - 古すぎる年（2010年以前）や二次情報（note に「二次情報」）
3. カタログにない field 名があれば、data/world/build/apply_manual.py に対応を追加する。
4. 取り込みと検証。
   ```bash
   python3 -I data/world/build/apply_manual.py
   node data/world/build/validate.mjs
   node data/world/build/validate_risks.mjs
   npx tsc --noEmit
   for m in j m w; do npx tsx scripts/simtest.ts 300 $m; done   # 3モード×300人生。「問題なし」を確認
   ```
   値の変化で人生の結果が大きく動いた場合（赤字の割合、寿命、残高の中央値）は、理由を調べて報告する。
5. data/world/sources.md の末尾に、項目・出典・反映した国の数・備考の表を追記する。
6. コミットしてpushする（ブランチは作業中のもの）。メッセージには反映した項目と国の数を書く。
7. ユーザーへの報告：反映した数の表、気づいた点（定義の違い・古い値・空欄の理由）、まだ推定のまま残る項目、次に調べると効果が大きい項目。

## 項目カタログ（field 名 → ゲームでの使い道）

| field | 定義 | 優先する出典 | 単位 | 反映先 |
|---|---|---|---|---|
| pension_coverage | 年金受給年齢以上で老齢年金を受け取る人の割合（SDG 1.3.1） | ILOSTAT | share | countries.pensionCoverage |
| informal_employment_share | インフォーマル雇用の割合（SDG 8.3.1、全産業・男女計） | ILOSTAT / ILO付表 | share | countries.informalEmploymentShare |
| smam_male / smam_female | 平均初婚年齢 | UN World Marriage Data | years | countries.meanAgeFirstMarriage |
| pension_replacement_rate | 平均賃金の人の義務的年金の所得代替率（グロス・男性） | OECD Pensions at a Glance | share | countries.pensionReplacementRate |
| tax_rate_avg_worker | 平均賃金・単身の所得税＋本人社会保険料の割合 | OECD Taxing Wages / 各国の税法 | share | countries.effectiveTaxRateAvgWorker |
| housing_share_of_consumption | 家計消費に占める「住居・水道・電気・ガス」の割合 | World Bank ICP 2021 | share | countries.rentShareOfIncome |
| house_price_to_income | 住宅価格の年収倍率 | 公的統計、なければ Numbeo（二次情報） | ratio | countries.housePriceToIncome |
| tuition_public_annual / tuition_private_annual | 国公立／私立大学の年間学費（自国の学部生） | OECD Education at a Glance / 政府・大学 | 現地通貨コード | countries.tertiaryAnnualCostShareOfGni（GNIで割る） |
| city_population_share | 都市（都市圏）の人口が国の人口に占める割合。note の先頭に `city=都市名;` | UN World Urbanization Prospects | share | countries.cityPopulationShare（places の組み直しは人が確認して行う） |
| ipv_past12m_women | 過去1年にパートナーから暴力を受けた女性の割合（15〜49歳） | WHO VAW ポータル / DHS | share | risks.ipvPast12mWomen |
| inflation_recent | 消費者物価上昇率（年平均、年ごとに1行） | IMF WEO | percent | risks.inflationRecent（最新年） |
| homicide_rate | 殺人の被害者数（10万人あたり） | UNODC、なければ WHO Global Health Estimates | per100k | risks.homicidePer100k |
| secondary_net_enrollment / tertiary_gross_enrollment / consumption_per_capita_lcu / remittance_share_gdp | 世界銀行 WDI の各指標 | World Bank WDI | share / 現地通貨 | countries の同名の項目 |

CSV の列は必ず `iso3,country_en,field,value,unit,year,source_name,source_url,note`（1行に1つの数値）。値が見つからない行は value を空欄にし、note に理由を書いてもらう。空欄の行は取り込まず、推定値を残す。
