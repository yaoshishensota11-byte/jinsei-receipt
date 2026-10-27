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
2. 下の「項目カタログ」から、今回調べてもらう項目を選ぶ。これまでの依頼で分かったManusの得意・不得意に合わせる。
   - **一括ファイルで全世界分が取れる項目**（世界銀行・ILO・国連・IMF・OECDの一括データ）は得意。1回に3項目程度まとめてよく、対象は全88か国。
   - **国ごとに公式サイトを探す項目**（大学の授業料、各国の税率表など）は後半で止まりやすい。1回の依頼につき1項目まで、対象は主要20か国以内に絞る。
   - **計算が必要な項目**（税・社会保険料の実効負担率など）は、計算まで頼むと失敗しやすい。材料（平均賃金・税率表・保険料率）だけを集めてもらい、計算は apply_manual.py で行う。
   - 優先順位は「遊んだ結果への効き目」で決める：毎年の手取りや支出に効く項目（税、家賃、物価）＞一度きりの出費（学費、住宅価格）＞まれな出来事の確率。
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
   python3 -I data/world/build/cpi_series.py   # 物価の年ごとの表（inflation_recent を取り込んだとき）
   python3 -I data/world/build/build_marriage.py   # 結婚のしかたの目安（地域ごと）を作り直す
   python3 -I data/world/build/apply_manual.py
   node data/world/build/validate.mjs
   node data/world/build/validate_risks.mjs
   npx tsc --noEmit
   for m in j m w; do npx tsx scripts/simtest.ts 300 $m; done   # 3モード×300人生。「問題なし」を確認
   ```
   値の変化で人生の結果が大きく動いた場合（赤字の割合、寿命、残高の中央値）は、理由を調べて報告する。
   apply_manual.py は何度実行しても同じ結果になるように書く（2回続けて実行し、data/world/ に差分が出ないことを確認する）。
5. data/world/sources.md の末尾に、項目・出典・反映した国の数・備考の表を追記する。
6. コミットしてpushする（ブランチは作業中のもの）。メッセージには反映した項目と国の数を書く。
7. ユーザーへの報告：反映した数の表、気づいた点（定義の違い・古い値・空欄の理由）、まだ推定のまま残る項目、次に調べると効果が大きい項目。
   Manusが途中で止まった場合は、未着手の項目だけを続けて頼む短い依頼文（同じチャットに貼る用）を添える。

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
| secondary_net_enrollment / tertiary_gross_enrollment / consumption_per_capita_lcu / remittance_share_gdp | 世界銀行 WDI の各指標（2010年より前の値は取り込まない） | World Bank WDI | share / 現地通貨 | countries の同名の項目 |
| avg_monthly_earnings | 被用者の平均月収（名目、現地通貨） | ILOSTAT（Mean nominal monthly earnings of employees） | 現地通貨コード | 税の計算の材料 |
| employee_ssc_rate | 本人負担の社会保険料率の合計（年金・医療・失業など） | ISSA / 米国社会保障庁「Social Security Programs Throughout the World」、各国の社会保険機関 | share | 税の計算の材料 |
| income_tax_allowance | 所得税がかからない年間の基礎控除・非課税枠（単身・子なし） | 各国の税務当局 | 現地通貨コード | 税の計算の材料 |
| income_tax_bracket | 所得税の税率（1区分1行）。note に `from=下限; to=上限`（最上位は `to=` を空に）。金額は控除後の年間課税所得 | 各国の税務当局 | rate | 税の計算の材料 |
| employee_ssc_bracket | 本人社会保険料が累進の国の月額の料率表（1区分1行、note に `from=; to=`、月額） | 各国の社会保険機関 | rate | 税の計算の材料（employee_ssc_rate より優先） |
| income_tax_credit | 所得税額から差し引く年間の税額控除（ケニアの personal relief など） | 各国の税務当局 | 現地通貨コード | 税の計算の材料 |
| arranged_marriage_share | 結婚のうち、家族が相手を決めた・縁談で決まった割合（本人の同意があるものを含む） | DHS・全国家族調査・学術調査 | share | marriage.json の arranged |
| betrothal_share | 家族が決めた結婚のうち、子どものころに許嫁として決まっていた割合 | 学術調査（見つからなければ空欄） | share | marriage.json の betrothal |
| marriage_payment_amount | 結婚のときの持参金・婚資のふつうの額。note の先頭に `type=dowry|brideprice|mahr|none` | 学術調査・政府統計 | 現地通貨コード | marriage.json の paymentYears（物価で直し、1人あたり国民所得で割る） |
| childhood_rite | 0〜6歳ごろの行事（1行事1行）。value は行う子どもの割合（統計があれば）、note に `name=; age=; category=universal|common|some; who=; desc=` | 政府・国際機関の資料、文化人類学の文献 | share | 小さいころの出来事（src/engine/rites.ts に手で文にして入れる。apply_manual は読まない）。universal は必ず、common・some は確率で出す。19か国は第8部で取り込み済み |

税の4つの材料（平均月収・保険料率・税率表、あれば基礎控除）がそろった国は、apply_manual.py が「平均賃金・単身の所得税＋本人社会保険料 ÷ 年収」を計算して countries.effectiveTaxRateAvgWorker に入れる。
平均月収が税率表より古い国は、data/world/cpi_annual.json の物価上昇率で税率表の年の金額に直してから計算する。物価の CSV（inflation_recent）を新しく取り込んだときは、先に `python3 -I data/world/build/cpi_series.py` を実行する。
計算しない条件（推定値を残す）：平均月収が10年より古い、または途中の年の物価が欠けている、保険料率の note に「実効率ではない」とある、材料が欠けている。
基礎控除が「0%区分の上限」と同じ額なら、税率表がすでに控除を含むので二重に引かない。税額控除 ÷ 最初の税率と同じ額の基礎控除（南アフリカの tax threshold など）も引かない。
区分の範囲は note の「from=…; to=…」のほか、「from=0、to=…」「from/to=A–B」「from/to=IRR A/B」も読める。新しい書き方が届いたら、取り込み後に「計算した国」の値を手計算で1つ確かめる。
平均月収の note に「最低賃金」とある行は使わない（「最低賃金ではない」は除く）。

今の暮らしを表さない値（古い世代だけ、何十年も前の地域値など）は、apply_manual.py の REJECT に理由と一緒に入れて取り込まない。
金額の年が「2000-2018」のような期間のときは、「constant 2018」のように何年の物価の額か書かれている場合だけ、その年で物価を直す。

CSV の列は必ず `iso3,country_en,field,value,unit,year,source_name,source_url,note`（1行に1つの数値）。値が見つからない行は value を空欄にし、note に理由を書いてもらう。空欄の行は取り込まず、推定値を残す。
