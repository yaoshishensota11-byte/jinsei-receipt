# 人生のレシート 引き継ぎメモ（2026-10-31）

## 1. 作品の概要
- 内容：今年生まれる赤ちゃんとして、一生ぶんのお金の流れを体験するゲーム。国・家庭・性別はランダム。分かれ道8回と小さな選択を経て、最後に「人生商店」のレシートでお会計。子どもとして3代目まで生まれ直せる
- 対象：一般の人と、授業（社会・家庭・金融教育）
- 遊ぶ時間：1回約30分（最大5倍速）
- 対応端末：ブラウザ。スマホの縦画面が基準で、パソコンでも遊べる
- 公開URL：https://jinsei-receipt.vercel.app/
- 紹介ページ：https://jinsei-receipt.vercel.app/lp/

## 2. 作り方と置き場所
- 道具：Claude Code（クラウド）。調査は ChatGPT・Gemini の Deep Research、Manus、Runable。Base44 は使っていない
- 技術：Vite＋TypeScript。サーバーは使わない（共有画像だけ Vercel の関数で、satori と resvg）。ドット絵は画像を使わずコードで描く
- リポジトリ：GitHub の個人リポジトリ `jinsei-receipt`、ブランチ `claude/jinsei-receipt-game-6angza`
- 主な場所：`src/engine/`（人生の計算）、`src/ui/`（画面）、`data/`（日本の統計）、`data/world/`（88か国の統計）、`public/lp/`（紹介ページ）、`scripts/`（テストと画像づくり）、`.claude/skills/`（スキル）
- 公開先：Vercel（push すると自動で反映）

## 3. 作ったプロンプトの一覧
すべて調査AIに統計を集めてもらうための依頼文。本文は付録。

| 名前 | 用途 | 渡した先 |
|---|---|---|
| part3〜part8 | 住まい・学費・税と社会保険料・結婚の習わし・小さいころの行事 | Manus |
| part9（全体版と a〜h） | 国ごとの出来事の確率、国のリスク | Gemini |
| part10 | 推計のまま残る出来事29件 | ChatGPT |
| part11（Manus／Gemini／Runable） | 新しい出来事の統計（Manus が止まった分を Gemini・Runable 用に作り直し） | 各AI |
| part11f・part11g | プロのスポーツ選手になる人数（男子・女子） | ChatGPT |

工程はどれも「推計値を見つける → 依頼文 → CSV を受け取る → 確かめて取り込む」。

## 4. 作ったスキルの一覧
- **country-data-research**
  - 何をするか：推計のままの項目を洗い出し、調査用の依頼文を作る。返ってきた CSV を確かめて取り込み、テストして push する
  - いつ使うか：「調べる内容のプロンプトを作って」「CSV を確認して反映して」と言われたとき
  - 要点：
    - 依頼の分け方（一括データは3項目・88か国まで、国ごとに探す項目は1項目・20か国まで、計算は頼まず材料だけ）
    - CSV の確かめ方（単位・あり得ない値・古い年）
    - 取り込みの命令と、出典表への追記
- **annual-review**
  - 何をするか：年に1回、統計に新しい年の値が出ていないかを確かめる。あれば取り込み、テスト・共有URLの版上げ・紹介ページの作り直しまで行う
  - いつ使うか：「年に1回の見直しをして」と言われたとき
  - 要点：見直す4つのデータの束、テストの命令一式、`scripts/lpregen.sh` で紹介ページを作り直す、最後に CLAUDE.md の日付を更新する
- **jinsei-receipt-research-prompt**：このチャットの外で作られたスキル。中身は不明

## 5. 今後のゲーム作りへの使い方
**そのまま使い回せるもの**
- 依頼文の5層の型（Role／Context／Task／Constraints／Output Format）と、1回分を小さく分けてクレジット切れに備えるやり方
- テストの仕組み
  - 同じシードなら同じ結果になる作り
  - URL に `?turbo=60&auto` を付けて自動で最後まで遊ぶ画面テスト
  - 「状況と食い違う文」を探すテスト
- 新しい機能は乱数の流れを別に分ける（ほかの結果がずれない）

**少し直せば使えるもの**
- country-data-research：項目カタログ・ファイル名・取り込みの命令を、次の作品のデータに合わせて直す
- annual-review：見直すデータの束とテストの命令を直す
- `scripts/lpregen.sh`・`lpassets.mjs`：撮る画面の手順を直す

**この作品専用のもの**
- 人生の計算、88か国のデータ、出来事110種、レシートの見た目

## 6. データと出典
- 日本：厚労省・総務省・文科省などの統計。一覧は `data/sources.md`
- 88か国：世界銀行（WDI）、ILO、国連、WHO、INFORM など。一覧は `data/world/sources.md`
- 出来事の確率は、110件のうち100件を統計で確認済み
- 更新：年に1回（前回は2026年10月）

**国別データの集め方と更新の手順**
1. 推計の項目を洗い出す
2. 依頼文を作り、`data/world/manual/prompts/` に保存
3. 調査AIに貼って CSV を受け取り、`data/world/manual/` に保存
4. 確かめる（単位・あり得ない値・古い年・二次情報）
5. 取り込んで、テストを流す
6. 出典表と判断メモ（`part*_review.md`）に記録
7. push する

**調査用プロンプトの使い方**
- 1回分ずつ、新しいタスクとしてコードブロックの中を貼る
- Gemini・ChatGPT は CSV をコードブロックで出させ、出典はURLで書かせる。1回15件前後まで
- 途中で止まったら、残りだけを頼む短い依頼文を作る

**検算の方法**
- 確率は自分では計算させず、分子と分母の人数を集めてもらって自分で割る
- 生涯や期間の割合は、年率に直す（1−(1−p)^(1/年数)）
- 300人の自動プレイで、ゲームの中の割合を実際の統計と比べる。例：不登校が約30%と多すぎたので、引く回数を減らして約9%に直した
- あり得ない値は採らない。例：南アフリカの労災死亡率 10万人あたり557
- 取り込みは2回続けて流しても差が出ないことを確かめる

## 7. デザインの決まり
- 見立て：ページ全体を「人生商店」のレシートと感熱紙に見立てる。罫線は点線・破線
- 色

  | 役割 | 色 |
  |---|---|
  | 紙 | #fbfaf6 |
  | 地 | #f3efe6 |
  | 文字 | #222（紹介ページは #23201c） |
  | 補助の文字 | #6b665c |
  | 線 | #d8d1c2 |
  | 強調（赤） | #c8302c |
  | 増える | #2f7d4f |
  | 減る | #b23a2e |

- 文字：BIZ UDGothic（ゲームと見出し）、DotGothic16（紹介ページの説明文）
- 人物と場面：ドット絵
- 選択肢：濃い枠のカードに「›」、選ぶと黒く反転する。場面の種類は赤い札で示す
- 方針：雰囲気を保つ。言葉はやさしく、正解は示さない

## 8. うまくいったこと／つまずいたこと
**うまくいったこと**
- 統計がない出来事は入れない、と決めたこと。説明できる作品になった
- テストを3種類用意して、毎回流したこと
- 遊んだ人のフィードバックから直したこと（詳細つきの保存、選択画面の見やすさ）

**つまずいたこと（教訓）**
- 調査AIの得意・不得意：途中で止まる、定義を取り違える（例：児童労働で家の仕事を含めない）、クレジットが切れる → 小さく分けて頼み、定義を明記する
- 毎年の割合を毎年引くと、同じ人が何度も当たる → 一生で何回引くかを決める
- 文と状況の食い違い（例：退職後に通勤の文が出る） → 食い違いを探すテストを足す
- 片方の性別だけの出来事 → 男女の統計がそろうまで入れない
- この環境から官公庁サイトに直接つながらなかった → 道を広げてもらうか、ミラーを使う

## 9. 残っている不具合・改善したいこと
- 推計のまま残る出来事が10件（`part10_review.md`）
- 女子サッカーの在籍年数は、名簿から出した目安
- ほかの競技のプロ選手は、男女の統計がそろったら足す
- 自己破産は、ランダムに選ぶテストでは9%（実際は生涯で約4%）。ランダムな選び方で借金が増えるためと判断して、そのままにしている

## 10. 権利と表記
- フォント：Google Fonts の BIZ UDGothic・DotGothic16（SIL Open Font License）
- 素材：ドット絵はコードで描いたもので、外部の素材は使っていない
- 着想：「80億分の1」から着想を得たオリジナル作品（README に記載）
- AIを使った旨の表記：サイトにはない
- 作者表記「Lukumo」：サイトにもリポジトリにもない
- Cookie・解析ツール：使っていない。ただし次の3つを使う
  - Google Fonts の読み込み
  - 感想欄の送り先（Google フォーム）
  - 言語の切り替え（Google 翻訳を通して開く）

## 11. 判断の基準（数字で決めたもの）
- 1年の進む時間は10秒（等倍）。亡くなるのは20歳から。生まれ直しは3代まで
- はんこはお釣りで決める：-300万円未満は赤字閉店、2,000万〜1億円は老後安泰、など5段階
- テスト：3モード×300人、食い違いの確認3,000人、画面テスト10回
- 結果が変わったら、共有URLの版を上げる（今は17）
- 交通事故の重いけがは、死者の10倍として計算（日本の重傷者27,285人÷死者2,663人）
- 自己破産を選べるのは、借金が年収（下限200万円）の3倍を超えたとき。その後7年は家を買えない
- プロ選手になる確率

  | 競技 | 確率 | 在籍年数 |
  |---|---|---|
  | 野球 | 76÷(114,904÷3) | 7年 |
  | サッカー | 265÷(137,925÷3) | 6年 |
  | 女子サッカー | 37÷(9,048÷3) | 8年 |

## 12. これまでの主な判断と理由
- 留学・子どもからの仕送り・同性のパートナーは入れない：ユーザーの判断
- プロ選手は男女そろえて入れる：片方の性別だけ出るのは違うため
- 生まれ直すときは借金も引き継ぐ：1代目でしっかり稼ぐ意味を持たせるため
- お酒の影響は「病気のかかりやすさが少し上がる」という言葉で示す：ユーザーの指定
- 2026年10月で完成とし、これからは年1回の見直しだけにする：残りは何度調べても手に入らない情報のため

---

# 付録：作ったプロンプトの全文

リポジトリの `data/world/manual/prompts/` にある21本を、作った順にそのまま載せます（ファイルの中身を変えずに、````markdown の囲みに入れています）。

## 付録1. part3_prompt.md（2026-10-25）

````markdown
```
[Role]
あなたは国際統計の調査アシスタントです。公的機関・国際機関の一次データを探し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。
- ゲーム内の国別データのうち、住まい・大学の学費・都市の人口・税などの項目がまだ「推定値」のままです。これを公的統計の実データに置き換えたいと考えています。
- 集めた数字はプログラムでそのまま読み込むため、定義・単位・年をそろえることが最優先です。
- 国はISO3コード（3文字の国コード）で管理しています。

[Task]
次の6項目について国別の数値を集めてください。項目の番号順に1つずつ進め、1項目が終わるごとにCSVへ追記してください。

(1) housing_share_of_consumption：家計の消費支出に占める「住居・水道・電気・ガス・その他の燃料（Housing, water, electricity, gas and other fuels）」の割合
    出典：World Bank International Comparison Program（ICP）2021
    調べ方：World Bank DataBank の ICP 2021 データ（https://databank.worldbank.org/source/icp-2021 ）で、分類「HOUSING, WATER, ELECTRICITY, GAS AND OTHER FUELS」の Expenditure share（Individual consumption expenditure by households に占める割合）を国別に一括で書き出す。
    対象：下記の88か国すべて

(2) house_price_to_income：住宅価格の年収倍率（標準的な住宅の価格が、世帯の年間可処分所得の何年分か）
    出典：公的な統計（中央銀行・統計局・OECD）にこの倍率がある国はそれを優先。国をまたいでそろった公的統計がないため、それ以外の国は Numbeo の「Property Prices Index by Country」の Price To Income Ratio（最新年、https://www.numbeo.com/property-investment/rankings_by_country.jsp ）を使ってよい。その場合は note に「二次情報（Numbeo）」と書く。
    対象：下記の88か国すべて（Numbeo に載っていない国は空欄でよい）

(3) tuition_public_annual / tuition_private_annual：国公立大学／私立大学の、自国の学部生の年間授業料（入学金を除く。代表的な値または平均）
    出典：OECD Education at a Glance（授業料の指標、OECD加盟国）、それ以外の国は教育省・政府の公表値、または代表的な国公立大学・私立大学の公式サイト
    単位：現地通貨（unit に通貨コードを書く。例：INR）。無償の場合は 0 とし、note に「無償」と書く。私立大学がほとんどない国は tuition_private_annual を空欄でよい。
    対象：IND: India / CHN: China / NGA: Nigeria / PAK: Pakistan / IDN: Indonesia / COD: Democratic Republic of the Congo / ETH: Ethiopia / USA: United States of America / BGD: Bangladesh / BRA: Brazil / EGY: Egypt / MEX: Mexico / PHL: Philippines / KEN: Kenya / VNM: Viet Nam / DEU: Germany / GBR: United Kingdom / FRA: France / KOR: Republic of Korea

(4) city_population_share：主な都市（都市圏）の人口が、国全体の人口に占める割合。1か国につき人口の多い順に3〜5都市
    出典：UN World Urbanization Prospects 2018（https://population.un.org/wup/ の「Urban Agglomerations」のファイル、2025年の推計値）と、同じ年の国全体の人口（UN World Population Prospects 2024）
    記録方法：1都市1行。value は「都市圏の人口 ÷ 国の人口」。note の先頭に「city=都市名（英語）;」を書き、その後ろに都市圏の人口と国の人口の実数を書く（例：city=Lagos; agglomeration 16,500,000 / national 230,000,000）。
    対象：IND: India / CHN: China / NGA: Nigeria / PAK: Pakistan / IDN: Indonesia / COD: Democratic Republic of the Congo / ETH: Ethiopia / USA: United States of America / BGD: Bangladesh / BRA: Brazil / EGY: Egypt / MEX: Mexico / PHL: Philippines / KEN: Kenya / VNM: Viet Nam / DEU: Germany / GBR: United Kingdom / FRA: France / KOR: Republic of Korea

(5) tax_rate_avg_worker：平均賃金・単身・子どもなしの労働者について、「所得税＋本人負担の社会保険料」が額面給与に占める割合
    出典：OECDの統計がない国のため、次の組み合わせで計算する。
      - 平均賃金：ILOSTAT の平均月収（Mean nominal monthly earnings of employees、現地通貨、最新年）
      - 所得税：その国の税務当局が公表する所得税の税率表と基礎控除
      - 本人負担の社会保険料率：ISSA / 米国社会保障庁「Social Security Programs Throughout the World」（https://www.ssa.gov/policy/docs/progdesc/ssptw/ ）
    記録方法：value に計算結果の割合。note に「平均月収○○、年収○○、所得税○○、社会保険料率○%」のように計算の内訳を書く。税率表の確認に PwC Worldwide Tax Summaries などを使った場合は note に「二次情報」と書く。
    対象：IND: India / CHN: China / NGA: Nigeria / PAK: Pakistan / IDN: Indonesia / COD: Democratic Republic of the Congo / ETH: Ethiopia / BGD: Bangladesh / BRA: Brazil / EGY: Egypt / PHL: Philippines / KEN: Kenya / VNM: Viet Nam

(6) 小さな穴埋め（見つかったものだけでよい）
    - pension_replacement_rate：平均賃金の人の義務的な公的年金の所得代替率（グロス）。出典は ILO・世界銀行の年金制度レポート、または各国の年金機関。計算方法が違う場合は note に明記。
      対象：NGA: Nigeria / PAK: Pakistan / COD: Democratic Republic of the Congo / ETH: Ethiopia / BGD: Bangladesh / EGY: Egypt / PHL: Philippines / KEN: Kenya / VNM: Viet Nam
    - secondary_net_enrollment（中等教育の純就学率、World Bank WDI SE.SEC.NENR を小数に）：NGA: Nigeria / JPN: Japan
    - tertiary_gross_enrollment（高等教育の総就学率、WDI SE.TER.ENRR を小数に）：NGA: Nigeria
    - consumption_per_capita_lcu（1人あたり家計最終消費支出、現地通貨、WDI NE.CON.PRVT.PC.KN または NE.CON.PRVT.CN ÷ 人口）：NGA: Nigeria
    - remittance_share_gdp（個人送金の受取額のGDP比、WDI BX.TRF.PWKR.DT.GD.ZS を小数に）：VNM: Viet Nam
    - informal_employment_share（インフォーマル雇用の割合、ILOSTAT SDG 8.3.1 または フィリピン統計庁）：PHL: Philippines
    - homicide_rate（殺人の被害者数、人口10万人あたり。UNODC になければ WHO Global Health Estimates の Homicide）：COD: Democratic Republic of the Congo

対象88か国（(1)(2)用。ISO3：英語名）：
IND: India / CHN: China / NGA: Nigeria / PAK: Pakistan / IDN: Indonesia / COD: Democratic Republic of the Congo / ETH: Ethiopia / USA: United States of America / BGD: Bangladesh / BRA: Brazil / EGY: Egypt / TZA: United Republic of Tanzania / MEX: Mexico / PHL: Philippines / UGA: Uganda / SDN: Sudan / KEN: Kenya / AFG: Afghanistan / VNM: Viet Nam / YEM: Yemen / AGO: Angola / MOZ: Mozambique / RUS: Russian Federation / ZAF: South Africa / IRN: Iran (Islamic Republic of) / IRQ: Iraq / NER: Niger / MDG: Madagascar / CIV: Côte d'Ivoire / CMR: Cameroon / TUR: Türkiye / MLI: Mali / UZB: Uzbekistan / DZA: Algeria / MMR: Myanmar / GHA: Ghana / TCD: Chad / SOM: Somalia / JPN: Japan / BFA: Burkina Faso / COL: Colombia / DEU: Germany / GBR: United Kingdom / ZMB: Zambia / FRA: France / MWI: Malawi / MAR: Morocco / THA: Thailand / NPL: Nepal / SAU: Saudi Arabia / PER: Peru / SEN: Senegal / SYR: Syrian Arab Republic / ARG: Argentina / ZWE: Zimbabwe / GIN: Guinea / BEN: Benin / BDI: Burundi / MYS: Malaysia / VEN: Venezuela (Bolivarian Republic of) / KAZ: Kazakhstan / RWA: Rwanda / ITA: Italy / GTM: Guatemala / KHM: Cambodia / CAN: Canada / PRK: Democratic People's Republic of Korea / SSD: South Sudan / ESP: Spain / AUS: Australia / POL: Poland / TJK: Tajikistan / ECU: Ecuador / TGO: Togo / BOL: Bolivia (Plurinational State of) / SLE: Sierra Leone / HTI: Haiti / PNG: Papua New Guinea / LKA: Sri Lanka / CAF: Central African Republic / JOR: Jordan / HND: Honduras / KOR: Republic of Korea / UKR: Ukraine / DOM: Dominican Republic / COG: Congo / ISR: Israel / CHL: Chile

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に「未掲載」「最新年が2010年以前」など理由を書くこと。
- 1つの数値ごとに、実際に数字を確認したページのURL（トップページではなく、該当の表・ファイル・国を選んだ状態のページ）と、データの年を必ず記録すること。
- 割合は小数で記録すること（例：45.3% → 0.453）。倍率はそのままの数（例：8.5）、授業料は現地通貨の金額（例：120000）で記録すること。
- 指定と違う定義の値しかない場合は、その値を記録したうえで note に定義の違いを明記すること。
- 二次情報（ニュース記事・まとめサイト・Wikipedia）は使わないこと。どうしても一次情報が見つからない場合と、(2)の Numbeo・(5)の税率表の確認だけは使ってよく、その場合は note に「二次情報」と明記すること。
- 国名の表記ゆれに注意し、ISO3コードで正しく対応させること。コンゴ民主共和国（COD）とコンゴ共和国（COG）、北朝鮮（PRK）と韓国（KOR）、ニジェール（NER）とナイジェリア（NGA）を取り違えないこと。
- 一覧表やExcelファイルで多くの国をまとめて取れる場合は、1か国ずつ調べるよりそちらを優先し、source_url にそのファイルのURLを記録すること。
- 途中で作業が止まりそうな場合は、そこまでのCSVを出力し、どの項目のどの国まで終わったかを明記すること。

[Output Format]
1. CSVファイル（ファイル名：jinsei_receipt_part3.csv、UTF-8）。1行に1つの数値を入れる縦長の形式とし、列は次の順にすること：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   例（数値は書き方を示すための仮の値です。実際の値ではないので使わないこと）：
   KEN,Kenya,housing_share_of_consumption,0.164,share,2021,World Bank ICP 2021,https://databank.worldbank.org/...,
   IND,India,tuition_public_annual,60000,INR,2025,Ministry of Education,https://...,IIT Bombay B.Tech tuition（代表値）
   NGA,Nigeria,city_population_share,0.073,share,2025,UN WUP 2018 / WPP 2024,https://population.un.org/wup/...,city=Lagos; agglomeration 16,500,000 / national 230,000,000
2. チャット内に次の要約を書くこと：
   - 項目ごとの取得状況（取得できた国の数／対象の国の数）
   - 取得できなかった国と、その理由
   - 定義が指定と異なる値の一覧
   - アクセスできなかったサイトや、ログインが必要だったサイト
   - まとめて取得に使ったファイル（Excel・CSV）のURL一覧
```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：（なし）
````

## 付録2. part4_prompt.md（2026-10-26）

````markdown
```
[Role]
あなたは各国の税制・社会保険制度の調査アシスタントです。税務当局や社会保険機関などの一次資料を探し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。計算はせず、材料となる数字だけを集めます。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。
- 「平均的な労働者が給料からどれだけ税金と社会保険料を引かれるか」が、下記13か国でまだ推定値のままです。
- 前回は計算までお願いしたため、材料が一部そろわず値が出ませんでした。今回は計算はこちらで行うので、計算に使う「材料」だけを集めてください。
- 集めた数字はプログラムでそのまま読み込むため、定義・単位・年をそろえることが最優先です。

[Task]
次の13か国について、4種類の材料を集めてください。1か国ずつ、4種類すべてを調べてから次の国に進み、1か国終わるごとにCSVへ追記してください。

対象13か国（ISO3：英語名）：
IND: India / CHN: China / NGA: Nigeria / PAK: Pakistan / IDN: Indonesia / COD: Democratic Republic of the Congo / ETH: Ethiopia / BGD: Bangladesh / BRA: Brazil / EGY: Egypt / PHL: Philippines / KEN: Kenya / VNM: Viet Nam

(1) avg_monthly_earnings：被用者の平均月収（名目、現地通貨、入手できる最新年）
    出典：ILOSTAT「Mean nominal monthly earnings of employees」（https://ilostat.ilo.org/ 、男女計・全産業・現地通貨）。ILOSTATにない国は、その国の統計局の賃金統計。
    単位：現地通貨（unit に通貨コード。例：KES）

(2) employee_ssc_rate：給与から天引きされる、本人負担の社会保険料率の合計（年金・医療・失業・その他の義務的な保険料を足したもの）
    出典：米国社会保障庁・ISSA「Social Security Programs Throughout the World」（https://www.ssa.gov/policy/docs/progdesc/ssptw/ 、最新版の各国ページ）、または各国の社会保険機関の公式サイト
    記録方法：value に合計の割合（例：5% と 1.5% なら 0.065）。note に内訳（例：pension 5%; health 1.5%）と、保険料の上限額（月額の上限がある場合）を書く。上限額は平均月収を超える場合だけ影響するので、上限があるかどうかを必ず書く。

(3) income_tax_allowance：単身・子どもなしの給与所得者が、所得税を払わずに済む年間の金額（基礎控除・非課税枠・ゼロ税率区分の上限）
    出典：その国の税務当局の公式サイト（2025年または2026年の課税年度）
    単位：現地通貨（年額）。税率表の最初の区分が0%になっている国は、その上限額を記録し、note に「0%区分の上限」と書く。この場合 (4) には0%の区分を入れなくてよい。

(4) income_tax_bracket：給与所得にかかる所得税の税率表（1区分1行）
    出典：その国の税務当局の公式サイト（(3)と同じ課税年度）
    記録方法：value に税率（例：25% → 0.25）。note に区分の範囲を「from=下限; to=上限」の形で書く（年額、現地通貨、カンマなしの数字）。最上位の区分は「to=」を空にする。例：from=0; to=500000 / from=500000; to=
    範囲は、(3)の控除を引いたあとの「課税所得」にもとづくものを記録する。税率表が月額で公表されている国は12倍して年額にし、note に「月額表を12倍」と書く。

[Constraints]
- 計算（所得税額や実効税率）はしないこと。材料の数字だけを記録すること。
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に理由を書くこと。
- 1つの数値ごとに、実際に数字を確認したページのURL（トップページではなく、税率表や制度説明のページ）と、データの年（課税年度）を必ず記録すること。
- 税率表・控除は、国（連邦）の制度を記録すること。州・地域ごとに違う税や保険料がある場合は、首都のある州・地域のものを記録し、note にそう書くこと。
- 税務当局の公式サイトで確認できない場合に限り、PwC Worldwide Tax Summaries（https://taxsummaries.pwc.com/ ）などで確認してよい。その場合は note に「二次情報」と書くこと。
- 国名の表記ゆれに注意し、ISO3コードで正しく対応させること。コンゴ民主共和国（COD）を取り違えないこと。
- 途中で作業が止まりそうな場合は、そこまでのCSVを出力し、どの国まで終わったかを明記すること。

[Output Format]
1. CSVファイル（ファイル名：jinsei_receipt_part4.csv、UTF-8）。1行に1つの数値を入れる縦長の形式とし、列は次の順にすること：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   例（数値は書き方を示すための仮の値です。実際の値ではないので使わないこと）：
   KEN,Kenya,avg_monthly_earnings,50000,KES,2024,ILOSTAT,https://ilostat.ilo.org/...,
   KEN,Kenya,employee_ssc_rate,0.06,share,2025,SSA SSPTW 2025,https://www.ssa.gov/...,pension 6%; 上限あり（月額○○）
   KEN,Kenya,income_tax_allowance,100000,KES,2025,Kenya Revenue Authority,https://www.kra.go.ke/...,0%区分の上限
   KEN,Kenya,income_tax_bracket,0.1,rate,2025,Kenya Revenue Authority,https://www.kra.go.ke/...,from=0; to=200000
   KEN,Kenya,income_tax_bracket,0.25,rate,2025,Kenya Revenue Authority,https://www.kra.go.ke/...,from=200000; to=
2. チャット内に次の要約を書くこと：
   - 国ごとの取得状況（4種類のうちいくつ取れたか）
   - 取得できなかった材料と、その理由
   - 州・地域で制度が違う国と、どこの制度を記録したか
   - 二次情報を使った国と項目
   - アクセスできなかったサイトや、ログインが必要だったサイト
```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：（なし）
````

## 付録3. part5_prompt.md（2026-10-26）

````markdown
```
[Role]
あなたは各国の税制・社会保険制度の調査アシスタントです。税務当局・社会保険機関・統計局などの一次資料を探し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。計算はせず、材料となる数字だけを集めます。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。
- 前回（第4部）の調査で13か国中8か国の税負担を計算できました。残る5か国は、材料が1つずつ足りないため計算できていません。
- 今回は、その足りない材料だけを集めてください。前回の書式（jinsei_receipt_part4.csv と同じ列）をそのまま使います。

[Task]
次の5か国について、指定した材料だけを集めてください。1か国終わるごとにCSVへ追記してください。

(1) CHN: China — employee_ssc_rate（本人負担の社会保険料率の合計）
    北京市（Beijing）の制度で記録する。年金・医療・失業の本人負担率を足した値を value に、内訳と月額の算定上限（缴费基数上限）を note に書く。
    出典：北京市人力资源和社会保障局、北京市医疗保障局などの公式サイト（2025年または2026年）

(2) BRA: Brazil — employee_ssc_bracket（INSS の本人負担の累進料率表、1区分1行）
    value に料率（例：7.5% → 0.075）、note に月額の範囲を「from=下限; to=上限」で書く（BRL、月額、カンマなし。最上位の区分の to= には上限額＝teto を書く）。
    出典：INSS「Tabela de contribuição mensal」（https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabela-de-contribuicao-mensal 、2025年）

(3) KEN: Kenya — avg_monthly_earnings（被用者の平均月収、2023年以降）と income_tax_credit（personal relief の年額）
    平均月収の出典：Kenya National Bureau of Statistics「Economic Survey」の Average Wage Earnings（年額で公表されている場合は12で割り、note に「年額を12で割る」と書く）
    personal relief の出典：Kenya Revenue Authority（前回と同じ PAYE の資料）。年額で記録する。

(4) ETH: Ethiopia — avg_monthly_earnings（被用者の平均月収、2023年以降）
    出典：Ethiopian Statistics Service の Labour Force / Urban Employment Unemployment Survey、なければ ILOSTAT の最新値

(5) COD: Democratic Republic of the Congo — avg_monthly_earnings（被用者の平均月収、2022年以降）
    出典：Institut National de la Statistique（INS）の公表値、なければ ILOSTAT の最新値。見つからない場合は、法定最低賃金（SMIG、日額または月額）を記録し、note に「平均月収ではなく最低賃金」と書く。

[Constraints]
- 計算（所得税額や実効税率）はしないこと。材料の数字だけを記録すること。
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に理由を書くこと。
- 1つの数値ごとに、実際に数字を確認したページのURL（トップページではなく、該当の表や資料のページ）と、データの年を必ず記録すること。
- 平均月収は、指定した年より古い値しかない場合も記録してよい。その場合は note に「指定より古い」と書くこと。
- 公式サイトで確認できない場合に限り、PwC Worldwide Tax Summaries などを使ってよい。その場合は note に「二次情報」と書くこと。
- 途中で作業が止まりそうな場合は、そこまでのCSVを出力し、どの国まで終わったかを明記すること。

[Output Format]
1. CSVファイル（ファイル名：jinsei_receipt_part5.csv、UTF-8）。列は次の順にすること：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   例（数値は書き方を示すための仮の値です。実際の値ではないので使わないこと）：
   BRA,Brazil,employee_ssc_bracket,0.075,rate,2025,INSS,https://www.gov.br/inss/...,from=0; to=1500
   BRA,Brazil,employee_ssc_bracket,0.09,rate,2025,INSS,https://www.gov.br/inss/...,from=1500; to=2800
   KEN,Kenya,income_tax_credit,30000,KES,2025,Kenya Revenue Authority,https://www.kra.go.ke/...,personal relief 年額
   CHN,China,employee_ssc_rate,0.105,rate,2026,北京市人力资源和社会保障局,https://rsj.beijing.gov.cn/...,北京市; pension 8%; medical 2%; unemployment 0.5%; 上限 月額○○
2. チャット内に次の要約を書くこと：
   - 国ごとの取得状況
   - 取得できなかった材料と、その理由
   - 二次情報を使った国と項目
   - アクセスできなかったサイトや、ログインが必要だったサイト
```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：（なし）
````

## 付録4. part6_prompt.md（2026-10-26）

````markdown
```
[Role]
あなたは各国の税制・社会保険制度の調査アシスタントです。税務当局・社会保険機関・統計局などの一次資料を探し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。計算はせず、材料となる数字だけを集めます。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。
- 「平均的な労働者が給料からどれだけ税金と社会保険料を引かれるか」を、前回までに主要13か国中11か国で実データから計算できました。
- 今回は、ゲームで生まれる確率が高い次の12か国について、同じ材料を集めてください。計算はこちらで行います。
- 集めた数字はプログラムでそのまま読み込むため、定義・単位・年をそろえることが最優先です。

[Task]
次の12か国について、材料を集めてください。1か国ずつ、すべての材料を調べてから次の国に進み、1か国終わるごとにCSVへ追記してください。

対象12か国（ISO3：英語名）：
TZA: United Republic of Tanzania / UGA: Uganda / AGO: Angola / MOZ: Mozambique / RUS: Russian Federation / ZAF: South Africa / IRN: Iran (Islamic Republic of) / IRQ: Iraq / NER: Niger / MDG: Madagascar / CIV: Côte d'Ivoire / CMR: Cameroon

(1) avg_monthly_earnings：被用者の平均月収（名目、現地通貨、2022年以降）
    出典：ILOSTAT「Mean nominal monthly earnings of employees」（男女計・全産業・現地通貨）。ILOSTATの最新値が2022年より古い国は、その国の統計局の賃金統計や労働力調査を優先する。
    単位：現地通貨（unit に通貨コード。例：TZS）。年額で公表されている場合は12で割り、note に「年額を12で割る」と書く。
    最低賃金は平均月収の代わりにしないこと。

(2) 本人負担の社会保険料（年金・医療・失業など、給与から天引きされる義務的な保険料）
    出典：米国社会保障庁・ISSA「Social Security Programs Throughout the World」（https://www.ssa.gov/policy/docs/progdesc/ssptw/ 、最新版）、または各国の社会保険機関の公式サイト
    記録方法は次のどちらか：
    - 上限がなく、率が一律の場合：employee_ssc_rate に合計の割合（例：5% と 1.5% なら 0.065）。note に内訳と「上限なし」と書く。
    - 上限がある、または収入によって率が変わる場合：employee_ssc_bracket を使い、1行に1つの率を記録する。value に率、note に月額の範囲を「from=下限; to=上限」で書く（月額、現地通貨、カンマなしの数字。上限がない場合は to= を空にする）。制度が複数ある場合（年金と医療など）は、制度ごとに from=0 から行を分けて書き、note に制度名を書く。
      例：年金5%（月額100000まで）と医療2%（上限なし）→ 2行「0.05 / from=0; to=100000; pension」「0.02 / from=0; to=; health」

(3) income_tax_allowance：単身・子どもなしの給与所得者が、所得税を払わずに済む年間の金額（基礎控除・非課税枠・ゼロ税率区分の上限）
    出典：その国の税務当局の公式サイト（2025年または2026年の課税年度）
    単位：現地通貨（年額）。税率表の最初の区分が0%の場合は、その上限額を記録し、note に「0%区分の上限」と書く。

(4) income_tax_bracket：給与所得にかかる所得税の税率表（1区分1行）
    出典：その国の税務当局の公式サイト（(3)と同じ課税年度）
    記録方法：value に税率（例：25% → 0.25）。note に区分の範囲を「from=下限; to=上限」で書く（年額、現地通貨、カンマなしの数字）。最上位の区分は to= を空にする。
    税率表が月額で公表されている国は12倍して年額にし、note に「月額表を12倍」と書く。

(5) income_tax_credit：計算した所得税額から差し引く、年間の税額控除（南アフリカの primary rebate など）。ない国は記録しなくてよい。
    単位：現地通貨（年額）。課税所得から差し引く控除（(3)）とは別のものなので、混ぜないこと。

[Constraints]
- 計算（所得税額や実効税率）はしないこと。材料の数字だけを記録すること。
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に理由を書くこと。
- 1つの数値ごとに、実際に数字を確認したページのURL（トップページではなく、税率表や制度説明のページ）と、データの年（課税年度）を必ず記録すること。
- 平均月収が2022年より古い値しか見つからない場合も記録してよい。その場合は note に「指定より古い」と書くこと。
- 州・地域ごとに違う税や保険料がある場合は、首都のある州・地域のものを記録し、note にそう書くこと。
- 税務当局の公式サイトで確認できない場合に限り、PwC Worldwide Tax Summaries（https://taxsummaries.pwc.com/ ）などで確認してよい。その場合は note に「二次情報」と書くこと。
- ニジェール（NER）とナイジェリア（NGA）を取り違えないこと。CFAフラン（XOF・XAF）の国は、どちらの通貨かを unit に正しく書くこと（NER・CIV は XOF、CMR は XAF）。
- 途中で作業が止まりそうな場合は、そこまでのCSVを出力し、どの国まで終わったかを明記すること。

[Output Format]
1. CSVファイル（ファイル名：jinsei_receipt_part6.csv、UTF-8）。1行に1つの数値を入れる縦長の形式とし、列は次の順にすること：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   例（数値は書き方を示すための仮の値です。実際の値ではないので使わないこと）：
   ZAF,South Africa,avg_monthly_earnings,25000,ZAR,2025,Statistics South Africa QES,https://www.statssa.gov.za/...,
   ZAF,South Africa,employee_ssc_bracket,0.01,rate,2025,SARS UIF,https://www.sars.gov.za/...,from=0; to=17000; UIF
   ZAF,South Africa,income_tax_bracket,0.18,rate,2026,South African Revenue Service,https://www.sars.gov.za/...,from=0; to=230000
   ZAF,South Africa,income_tax_bracket,0.26,rate,2026,South African Revenue Service,https://www.sars.gov.za/...,from=230000; to=
   ZAF,South Africa,income_tax_credit,17000,ZAR,2026,South African Revenue Service,https://www.sars.gov.za/...,primary rebate 年額
2. チャット内に次の要約を書くこと：
   - 国ごとの取得状況（どの材料が取れたか）
   - 取得できなかった材料と、その理由
   - 州・地域で制度が違う国と、どこの制度を記録したか
   - 二次情報を使った国と項目
   - アクセスできなかったサイトや、ログインが必要だったサイト
```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：（なし）
````

## 付録5. part7_prompt.md（2026-10-26）

````markdown
```
[Role]
あなたは結婚と家族の社会調査に詳しい調査アシスタントです。人口・保健調査（DHS）、各国の家族調査、学術論文などの一次資料を探し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。計算はせず、資料に書かれている数字をそのまま集めます。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。
- ゲームに「結婚の場面」を加えました。自分で相手を見つける国では「結婚するか」を選び、家族が相手を決めることが多い国では「縁談」や「許嫁」の話が来ます。結婚のときの持参金（ダウリー）や婚資（ブライドプライス・マフル）のやりとりも起きます。
- 今は「家族が決める結婚の割合」や「持参金・婚資の額」を地域ごとの目安（推定）で入れています。これを実際の調査の数字に置き換えたいと考えています。
- 集めた数字はプログラムでそのまま読み込むため、定義・単位・年をそろえることが最優先です。

[Task]
次の14か国について、3種類の数字を集めてください。1か国ずつ、3種類すべてを調べてから次の国に進み、1か国終わるごとにCSVへ追記してください。

対象14か国（ISO3：英語名）：
IND: India / CHN: China / NGA: Nigeria / PAK: Pakistan / IDN: Indonesia / COD: Democratic Republic of the Congo / ETH: Ethiopia / BGD: Bangladesh / EGY: Egypt / PHL: Philippines / KEN: Kenya / VNM: Viet Nam / KOR: Republic of Korea / JPN: Japan

(1) arranged_marriage_share：結婚のうち、親や家族が相手を決めた・縁談（お見合い）で決まった結婚の割合
    本人の同意がある「家族が選んだ結婚」も含める。「本人だけで相手を選んだ」結婚の割合しか載っていない場合は、その値を記録し、note に「本人が選んだ割合」と書く（こちらで 1 − 値 に直します）。
    出典の例：インド IHDS（India Human Development Survey）、パキスタン・バングラデシュ・エジプトなどの DHS や全国調査、中国の家族調査、日本は国立社会保障・人口問題研究所「出生動向基本調査」（見合い結婚の割合）、韓国は統計庁などの調査
    note に、調査の対象（例：既婚女性15〜49歳）と、使った質問・区分の名前を書く。

(2) betrothal_share：家族が決めた結婚のうち、子どものころに親どうしの約束（許嫁・婚約）で決まっていた割合
    見つからない場合が多いと思われます。見つからなければ value を空欄にし、note に理由を書くだけでよい。

(3) marriage_payment_amount：結婚のときに渡す持参金・婚資の、ふつうの額（平均または中央値、現地通貨）
    note の先頭に、習わしの種類を次のどれかで書く：
      type=dowry（妻の家から夫の家へ） / type=brideprice（夫の側から妻の家へ） / type=mahr（夫から妻本人へ） / type=none（特になし）
    続けて、平均か中央値か、対象（都市・農村・全国）、何の額か（現金だけか、品物を含むか）を書く。
    習わしがほとんどない国は value を空欄にし、note に「type=none」と理由を書く。
    額は、資料に書かれている年の金額をそのまま記録すること（物価での換算はしない。年を必ず書く）。

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に理由を書くこと。
- 1つの数値ごとに、実際に数字を確認したページのURL（トップページではなく、表や論文のページ）と、データの年（調査年）を必ず記録すること。
- 割合は小数で記録すること（例：45.3% → 0.453）。
- 地域（州・省）ごとの値しかない場合は、全国に最も近い値（全国平均・最大の地域）を記録し、note にそう書くこと。
- 学術論文の値を使ってよい。ニュース記事・まとめサイト・Wikipedia は使わないこと。どうしても一次資料が見つからない場合だけ使い、note に「二次情報」と書くこと。
- 結婚年齢が18歳未満の結婚（児童婚）に関する数字は、今回は集めなくてよい。
- 途中で作業が止まりそうな場合は、そこまでのCSVを出力し、どの国まで終わったかを明記すること。

[Output Format]
1. CSVファイル（ファイル名：jinsei_receipt_part7.csv、UTF-8）。1行に1つの数値を入れる縦長の形式とし、列は次の順にすること：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   例（数値は書き方を示すための仮の値です。実際の値ではないので使わないこと）：
   IND,India,arranged_marriage_share,0.80,share,2012,India Human Development Survey II,https://ihds.umd.edu/...,既婚女性15〜49歳; 夫を選んだのは親・家族
   IND,India,marriage_payment_amount,200000,INR,2012,（論文名）,https://...,type=dowry; 中央値; 全国; 現金と品物の合計
   VNM,Viet Nam,marriage_payment_amount,,VND,,,,type=none; 婚資・持参金の習わしはほとんどない
2. チャット内に次の要約を書くこと：
   - 国ごとの取得状況（3種類のうちどれが取れたか）
   - 取得できなかった数字と、その理由
   - 定義が指定と異なる値の一覧（「本人が選んだ割合」など）
   - 二次情報を使った国と項目
   - アクセスできなかったサイトや、ログインが必要だったサイト
```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：（なし）
````

## 付録6. part8_prompt.md（2026-10-27）

````markdown
```
[Role]
あなたは世界の子育てと家族の文化に詳しい調査アシスタントです。政府・国際機関の資料、人口・保健調査（DHS など）、文化人類学や宗教学の文献、百科事典的な一次資料を探し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。特定の宗教や民族を優劣で語らず、事実だけを記録します。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。
- ゲームの0〜5歳の時期に、その国らしい行事（日本なら、お宮参り・七五三・ランドセルなど）を出しています。今は日本にしか行事がありません。
- ゲームでは、行事を次の決まりで出します。
  - その国でほぼ全員が経験するもの → 必ず出す
  - 家庭によって違うもの（宗教・地域・家の考え方による） → 確率で出す
- そのため、行事の中身だけでなく「どれくらいの家庭が行うか」も知りたいです。
- 集めた内容はプログラムで読み込むため、書き方をそろえることが最優先です。

[Task]
次の19か国について、0〜6歳ごろまでに子どもが経験する行事・節目を、1か国につき2〜4つ集めてください。1か国ずつ調べ、1か国終わるごとにCSVへ追記してください。

対象19か国（ISO3：英語名）：
IND: India / CHN: China / NGA: Nigeria / PAK: Pakistan / IDN: Indonesia / COD: Democratic Republic of the Congo / ETH: Ethiopia / USA: United States of America / BGD: Bangladesh / BRA: Brazil / EGY: Egypt / MEX: Mexico / PHL: Philippines / KEN: Kenya / VNM: Viet Nam / DEU: Germany / GBR: United Kingdom / FRA: France / KOR: Republic of Korea

集める行事の例（このほかでもよい）：
- 生まれてすぐの儀式（名付け、洗礼、お祝いの食事、髪をそる儀式 など）
- 1歳前後の祝い（初めての誕生日の特別な祝い など）
- 入園・入学の準備や、その国特有の節目（就学前の行事、通過儀礼 など）

1つの行事を1行に書きます。field は childhood_rite とし、次のように記録してください。
- value：その行事を行う子ども（または家庭）の割合が統計で分かる場合だけ、その割合を小数で（例：45% → 0.45）。分からない場合は空欄。
- unit：share
- year：割合の調査年（割合が空欄なら、資料の年）
- note：次の項目を「;」で区切って、この順に書く（日本語で）。
  name=行事の名前（現地の言葉とカタカナ読み。例：Naamkaran（ナームカラン））;
  age=行う年齢（歳。生まれてすぐなら 0）;
  category=universal / common / some のどれか;
  who=行う人たち（例：ヒンドゥー教徒の家庭、全国、農村部 など）;
  desc=どんな行事か（1〜2文。ゲームの中で「〇〇をした。」と書けるような具体的な内容）

category の決め方：
- universal：その国のほぼ全員（目安9割以上）が経験する
- common：多くの家庭（目安4〜9割）が行う。宗教や地域で行わない人もいる
- some：一部の家庭（目安4割未満）が行う
割合の統計がなくても、資料の記述から判断して category は必ず書いてください。判断の根拠になった記述を、source_name に資料名、source_url にそのページで記録してください。

[Constraints]
- 推測・概算で割合を埋めないこと。統計がなければ value は空欄にし、category だけを資料の記述から判断すること。
- 1つの行ごとに、実際に内容を確認したページのURL（トップページではなく、その行事を説明しているページ）を必ず記録すること。
- 宗教や民族によって行事が違う国（例：インド、ナイジェリア、エチオピア）は、who にどの人たちの行事かを必ず書き、国全体での広がりに合わせて category を決めること。
- 子どもにとって危険な慣習や、強い苦痛をともなう慣習（女性器切除、児童婚など）は集めないこと。
- ニュース記事・まとめサイト・Wikipedia は使わないこと。どうしても一次資料が見つからない場合だけ使い、note の最後に「二次情報」と書くこと。
- 途中で作業が止まりそうな場合は、そこまでのCSVを出力し、どの国まで終わったかを明記すること。

[Output Format]
1. CSVファイル（ファイル名：jinsei_receipt_part8.csv、UTF-8）。列は次の順にすること：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   例（内容は書き方を示すための仮のものです。実際の値ではないので使わないこと）：
   IND,India,childhood_rite,,share,2020,（資料名）,https://...,name=Naamkaran（ナームカラン）;age=0;category=common;who=ヒンドゥー教徒の家庭;desc=生後まもなく親族が集まり、子どもの名前を正式に決めるお祝いをする。
   MEX,Mexico,childhood_rite,0.7,share,2020,（資料名）,https://...,name=Bautizo（バウティソ）;age=0;category=common;who=カトリック教徒の家庭;desc=教会で洗礼を受け、代父母が決まる。家族でお祝いの食事をする。
2. チャット内に次の要約を書くこと：
   - 国ごとの行事の数と、そのうち universal / common / some の数
   - 割合の統計が見つかった行事の一覧
   - 宗教・地域で大きく違うため判断が難しかった国と、その理由
   - 二次情報を使った国と行事
   - アクセスできなかったサイトや、ログインが必要だったサイト
```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：（なし）
````

## 付録7. part9_gemini.md（2026-10-29）

````markdown
# 第9部：国ごとの出来事の確率（Gemini の Deep Research 用）

全110件を11回に分けています。1回分ずつ、新しいチャットで「Deep Research」を選んでから、区切り線の間の文をそのまま貼ってください。

## 1回目（Japan・United States of America）

----- ここから -----
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を調べ、出典URL付きで表にまとめてください。推測で数字を埋めないでください。

背景：私は、生まれた国によってお金の一生が変わる教育用のブラウザゲームを作っています。ゲームの中で起きる出来事の確率を、統計で確かめたいと考えています。確率への計算は私がするので、あなたは「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字と出典を集めてください。

調べてほしいこと（番号順に）：
1. jpn_tenkin（Japan）：正社員のうち、1年間に転居をともなう転勤を経験した人の割合（年率）。出典の例：労働政策研究・研修機構（JILPT）「企業における転勤の実態に関する調査」
2. jpn_kaigo（Japan）：40〜64歳の働く人のうち、1年間に親の介護が新たに始まった人の割合。年率がなければ「介護をしている有業者の数」と「その年齢の有業者の数」（総務省 就業構造基本調査2022）
3. jpn_earthquake（Japan）：1年間に、住んでいる市区町村で震度6弱以上の揺れを観測した人の割合（過去10〜30年の平均）。出典の例：気象庁 震度データベース、総務省の人口
4. jpn_heavy_rain（Japan）：1年間に住宅が浸水被害（床上・床下）を受けた世帯の割合（過去10年の平均）。出典の例：国土交通省「水害統計」の浸水棟数 ÷ 住宅数
5. jpn_seishain（Japan）：非正規で働く人のうち、1年間に正社員に転換した人の割合。出典の例：総務省 労働力調査（詳細集計）「非正規から正規への転換」
6. jpn_chugaku_juken（Japan）：小学6年生のうち、私立・国立の中学校を受験する子の割合（全国と首都圏の両方）
7. usa_medical_bill（United States of America）：成人のうち、過去1年に救急外来で治療を受け、保険で払われない高額の請求（目安1,000ドル以上）を受けた人の割合。なければ「過去1年に医療費の支払いに困った成人の割合」（CDC NHIS、KFF）
8. usa_student_loan（United States of America）：高校卒業者のうち4年制大学にすぐ進学する割合と、そのうち連邦学生ローンを借りる割合（NCES）
9. usa_layoff（United States of America）：雇用者のうち、1年間にレイオフ・解雇された人の割合（BLS JOLTS の Layoffs and discharges の年合計 ÷ 雇用者数）。あわせて Displaced Worker Survey の「3年間に会社の都合で職を失った人の割合」
10. usa_childcare（United States of America）：0〜2歳の子どもがいる家庭のうち、有料の保育施設を使っている割合と、年間の保育料の中央値

守ってほしいこと：
・割合そのものが公表されていなくても、空欄にしないでください。割合の計算に使う「分子の数」（例：1年間の出国者数、被災者数、件数）と「分母の数」（例：その年齢の人口、全人口、全世帯数）を、それぞれ別の行に unit を count として出してください。私が計算します。
・ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間・地域など）を書く。どうしても見つからないときだけ空欄にし、理由を書く。
・NGOの記事や、危険区域の面積のような「起きうる範囲」の数字ではなく、実際に起きた人数・件数を優先する。
・数字ごとに、実際に確認したページのURLとデータの年を書く。ニュースやWikipediaは、一次資料がないときだけ使い「二次情報」と書く。
・割合は小数で書く（45.3%なら0.453）。
・英語とその国の言葉の両方で検索する。

出力：最後に、次の9列の表を1つだけ出してください。1行に1つの数字です。
列：iso3／country_en／field／value／unit／year／source_name／source_url／note
・field は「event_freq:番号の前の英字のID」（例 event_freq:jpn_tenkin）
・unit は annual_share（1年に経験する割合）、period_share（数年間の割合）、lifetime_share（生涯・ある年齢までの割合）、current_share（今その状態の割合）、years_count（過去N年のうち起きた年の数）、count（人数・件数）、currency（金額）のどれか
・note には、対象の人（成人・働く人・農村の世帯など）と、期間や定義の違いを書く
表のあとに、見つからなかった項目とその理由を短く書いてください。
----- ここまで -----

## 2回目（United States of America・China・India）

----- ここから -----
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を調べ、出典URL付きで表にまとめてください。推測で数字を埋めないでください。

背景：私は、生まれた国によってお金の一生が変わる教育用のブラウザゲームを作っています。ゲームの中で起きる出来事の確率を、統計で確かめたいと考えています。確率への計算は私がするので、あなたは「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字と出典を集めてください。

調べてほしいこと（番号順に）：
1. usa_hurricane_wildfire（United States of America）：成人のうち、1年間に自然災害（ハリケーン・山火事など）で家を離れて避難した人の割合（Census Household Pulse Survey の natural disaster displacement）
2. chn_unfinished_flat（China）：完成前の住宅を予約購入した世帯のうち、工事が止まった物件にあたった世帯の割合。なければ、工事停止物件の戸数 ÷ 都市の世帯数
3. chn_hukou_school（China）：都市に住む義務教育年齢の子どものうち、戸籍が別の地域にある子ども（随遷子女）の割合（教育部 統計公報）
4. chn_gaokao（China）：高考の受験者のうち、4年制大学（本科）に合格した人の割合（教育部）
5. chn_996（China）：都市の雇用者のうち、週の労働時間が60時間以上の人の割合（国家統計局）
6. chn_flood（China）：農村の人口のうち、1年間に洪水の被害を受けた人の割合（応急管理部の年間被災人口 ÷ 農村人口、過去10年の平均）
7. ind_monsoon_flood（India）：人口のうち、1年間に洪水の影響を受けた人の割合（過去10年の平均。出典の例：Central Water Commission、NDMA）
8. ind_entrance_exam（India）：12年生（高校3年）のうち、JEE Main または NEET を受験する人の割合（受験者数 ÷ 12年生の在籍者数）
9. ind_wedding_cost（India）：結婚した世帯のうち、結婚式の費用のために借金をした世帯の割合（家計調査・学術調査）
10. ind_gulf_work（India）：20〜45歳の働く人のうち、1年間に湾岸諸国へ出稼ぎに出た人の割合（eMigrate の年間の出国許可数 ÷ その年齢の就業者数）

守ってほしいこと：
・割合そのものが公表されていなくても、空欄にしないでください。割合の計算に使う「分子の数」（例：1年間の出国者数、被災者数、件数）と「分母の数」（例：その年齢の人口、全人口、全世帯数）を、それぞれ別の行に unit を count として出してください。私が計算します。
・ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間・地域など）を書く。どうしても見つからないときだけ空欄にし、理由を書く。
・NGOの記事や、危険区域の面積のような「起きうる範囲」の数字ではなく、実際に起きた人数・件数を優先する。
・数字ごとに、実際に確認したページのURLとデータの年を書く。ニュースやWikipediaは、一次資料がないときだけ使い「二次情報」と書く。
・割合は小数で書く（45.3%なら0.453）。
・英語とその国の言葉の両方で検索する。

出力：最後に、次の9列の表を1つだけ出してください。1行に1つの数字です。
列：iso3／country_en／field／value／unit／year／source_name／source_url／note
・field は「event_freq:番号の前の英字のID」（例 event_freq:jpn_tenkin）
・unit は annual_share（1年に経験する割合）、period_share（数年間の割合）、lifetime_share（生涯・ある年齢までの割合）、current_share（今その状態の割合）、years_count（過去N年のうち起きた年の数）、count（人数・件数）、currency（金額）のどれか
・note には、対象の人（成人・働く人・農村の世帯など）と、期間や定義の違いを書く
表のあとに、見つからなかった項目とその理由を短く書いてください。
----- ここまで -----

## 3回目（India・Nigeria・Pakistan）

----- ここから -----
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を調べ、出典URL付きで表にまとめてください。推測で数字を埋めないでください。

背景：私は、生まれた国によってお金の一生が変わる教育用のブラウザゲームを作っています。ゲームの中で起きる出来事の確率を、統計で確かめたいと考えています。確率への計算は私がするので、あなたは「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字と出典を集めてください。

調べてほしいこと（番号順に）：
1. ind_crop_failure（India）：農家世帯のうち、1年間に干ばつや雨不足で作物の被害を受けた世帯の割合（NSS 77th round「Situation Assessment of Agricultural Households」など）
2. ind_private_hospital（India）：人口のうち、1年間に入院した人の割合と、そのうち私立病院の割合（NSS 75th round）
3. nga_fuel_price（Nigeria）：過去20年のうち、ガソリンの公定・平均価格が1年で50%以上上がった年の数
4. nga_naira_drop（Nigeria）：過去30年のうち、ナイラが対米ドルで1年に30%以上下落した年の数
5. nga_generator（Nigeria）：都市の世帯のうち、自家用の発電機を持っている（使っている）世帯の割合（NBS、DHS、LSMS）
6. nga_japa（Nigeria）：22〜40歳の働く人のうち、1年間に就労や留学で国外へ移住した人の割合。なければ、年間の国外移住者数（英国などの就労ビザ発給数）と、その年齢の人口
7. nga_asuu_strike（Nigeria）：過去20年のうち、国立大学の教員組合（ASUU）のストライキがあった年の数と、それぞれの期間（月）
8. pak_flood（Pakistan）：農村の人口のうち、1年間に洪水の被害を受けた人の割合（過去10年の平均。NDMA）
9. pak_inflation（Pakistan）：過去30年のうち、消費者物価の上昇率が年20%を超えた年の数（IMF・WDI）
10. pak_electricity_bill（Pakistan）：都市の世帯のうち、電気代が家計の支出の10%を超える世帯の割合。なければ、過去10年で家庭用の電気料金が1年に20%以上上がった年の数

守ってほしいこと：
・割合そのものが公表されていなくても、空欄にしないでください。割合の計算に使う「分子の数」（例：1年間の出国者数、被災者数、件数）と「分母の数」（例：その年齢の人口、全人口、全世帯数）を、それぞれ別の行に unit を count として出してください。私が計算します。
・ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間・地域など）を書く。どうしても見つからないときだけ空欄にし、理由を書く。
・NGOの記事や、危険区域の面積のような「起きうる範囲」の数字ではなく、実際に起きた人数・件数を優先する。
・数字ごとに、実際に確認したページのURLとデータの年を書く。ニュースやWikipediaは、一次資料がないときだけ使い「二次情報」と書く。
・割合は小数で書く（45.3%なら0.453）。
・英語とその国の言葉の両方で検索する。

出力：最後に、次の9列の表を1つだけ出してください。1行に1つの数字です。
列：iso3／country_en／field／value／unit／year／source_name／source_url／note
・field は「event_freq:番号の前の英字のID」（例 event_freq:jpn_tenkin）
・unit は annual_share（1年に経験する割合）、period_share（数年間の割合）、lifetime_share（生涯・ある年齢までの割合）、current_share（今その状態の割合）、years_count（過去N年のうち起きた年の数）、count（人数・件数）、currency（金額）のどれか
・note には、対象の人（成人・働く人・農村の世帯など）と、期間や定義の違いを書く
表のあとに、見つからなかった項目とその理由を短く書いてください。
----- ここまで -----

## 4回目（Pakistan・Bangladesh・Indonesia）

----- ここから -----
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を調べ、出典URL付きで表にまとめてください。推測で数字を埋めないでください。

背景：私は、生まれた国によってお金の一生が変わる教育用のブラウザゲームを作っています。ゲームの中で起きる出来事の確率を、統計で確かめたいと考えています。確率への計算は私がするので、あなたは「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字と出典を集めてください。

調べてほしいこと（番号順に）：
1. pak_gulf_work（Pakistan）：20〜45歳の働く人のうち、1年間に海外就労に出た人の割合（Bureau of Emigration and Overseas Employment の年間登録者数 ÷ その年齢の就業者数）
2. pak_heatwave（Pakistan）：人口のうち、1年間に熱波（気温45度前後以上が続く）の影響を受けた人の割合、または熱波が起きた年の数（過去10年）
3. bgd_garment_job（Bangladesh）：16〜35歳の人のうち、縫製工場で働いている人の割合（または1年間に新しく縫製業で働きはじめた人の割合）
4. bgd_flood（Bangladesh）：人口のうち、1年間に洪水の被害を受けた人の割合（過去10年の平均）
5. bgd_cyclone（Bangladesh）：沿岸の農村人口のうち、1年間にサイクロンの被害を受けた人の割合（過去10年の平均）
6. bgd_microcredit（Bangladesh）：農村の成人のうち、マイクロファイナンス機関から借りている人の割合（Microcredit Regulatory Authority、Global Findex）
7. bgd_gulf_work（Bangladesh）：20〜40歳の働く人のうち、1年間に海外就労に出た人の割合（BMET の年間出国者数 ÷ その年齢の就業者数）
8. idn_earthquake（Indonesia）：人口のうち、1年間に被害の出た地震の影響を受けた人の割合（BNPB の被災者数、過去10年の平均）
9. idn_jakarta_flood（Indonesia）：都市の住民のうち、1年間に浸水の被害を受けた人の割合（BNPB、ジャカルタ州の統計）
10. idn_haze（Indonesia）：人口のうち、森林火災の煙害の影響を受けた人の数（2015年、2019年など）と、煙害が起きた年の数（過去10年）

守ってほしいこと：
・割合そのものが公表されていなくても、空欄にしないでください。割合の計算に使う「分子の数」（例：1年間の出国者数、被災者数、件数）と「分母の数」（例：その年齢の人口、全人口、全世帯数）を、それぞれ別の行に unit を count として出してください。私が計算します。
・ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間・地域など）を書く。どうしても見つからないときだけ空欄にし、理由を書く。
・NGOの記事や、危険区域の面積のような「起きうる範囲」の数字ではなく、実際に起きた人数・件数を優先する。
・数字ごとに、実際に確認したページのURLとデータの年を書く。ニュースやWikipediaは、一次資料がないときだけ使い「二次情報」と書く。
・割合は小数で書く（45.3%なら0.453）。
・英語とその国の言葉の両方で検索する。

出力：最後に、次の9列の表を1つだけ出してください。1行に1つの数字です。
列：iso3／country_en／field／value／unit／year／source_name／source_url／note
・field は「event_freq:番号の前の英字のID」（例 event_freq:jpn_tenkin）
・unit は annual_share（1年に経験する割合）、period_share（数年間の割合）、lifetime_share（生涯・ある年齢までの割合）、current_share（今その状態の割合）、years_count（過去N年のうち起きた年の数）、count（人数・件数）、currency（金額）のどれか
・note には、対象の人（成人・働く人・農村の世帯など）と、期間や定義の違いを書く
表のあとに、見つからなかった項目とその理由を短く書いてください。
----- ここまで -----

## 5回目（Indonesia・Brazil・Germany）

----- ここから -----
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を調べ、出典URL付きで表にまとめてください。推測で数字を埋めないでください。

背景：私は、生まれた国によってお金の一生が変わる教育用のブラウザゲームを作っています。ゲームの中で起きる出来事の確率を、統計で確かめたいと考えています。確率への計算は私がするので、あなたは「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字と出典を集めてください。

調べてほしいこと（番号順に）：
1. idn_jkn（Indonesia）：18〜60歳の自営業者・インフォーマルで働く人のうち、国民健康保険（JKN）に入っていない、または保険料を滞納している人の割合（BPJS Kesehatan）
2. idn_online_loan（Indonesia）：成人のうち、過去1年にオンライン貸金（pinjol）を使った人の割合（OJK）
3. bra_price_rise（Brazil）：過去20年のうち、消費者物価の上昇率が年6%を超えた年の数（IBGE・WDI）
4. bra_security（Brazil）：都市の世帯のうち、防犯の設備やサービスにお金を払っている世帯の割合。なければ、過去1年に犯罪の被害を受けた人の割合（PNAD の被害者調査）
5. bra_phone_theft（Brazil）：15歳以上の人のうち、過去1年に携帯電話を盗まれた・奪われた人の割合（PNAD、Fórum Brasileiro de Segurança Pública）
6. bra_sus_wait（Brazil）：人口のうち、1年間に公的医療（SUS）で専門医の受診を待った人の割合と、待った期間の中央値
7. bra_enem（Brazil）：高校3年生のうち、ENEM を受験する人の割合（INEP）
8. deu_ausbildung（Germany）：学校を出た若者のうち、職業訓練（デュアルシステム）に進む人の割合（BIBB）
9. deu_energy_price（Germany）：過去20年のうち、家庭用のガス・暖房費が1年に30%以上上がった年の数（Destatis）
10. deu_kita（Germany）：0〜2歳の子どもの親のうち、保育所（Kita）を希望したが入れなかった親の割合（DJI、Destatis）

守ってほしいこと：
・割合そのものが公表されていなくても、空欄にしないでください。割合の計算に使う「分子の数」（例：1年間の出国者数、被災者数、件数）と「分母の数」（例：その年齢の人口、全人口、全世帯数）を、それぞれ別の行に unit を count として出してください。私が計算します。
・ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間・地域など）を書く。どうしても見つからないときだけ空欄にし、理由を書く。
・NGOの記事や、危険区域の面積のような「起きうる範囲」の数字ではなく、実際に起きた人数・件数を優先する。
・数字ごとに、実際に確認したページのURLとデータの年を書く。ニュースやWikipediaは、一次資料がないときだけ使い「二次情報」と書く。
・割合は小数で書く（45.3%なら0.453）。
・英語とその国の言葉の両方で検索する。

出力：最後に、次の9列の表を1つだけ出してください。1行に1つの数字です。
列：iso3／country_en／field／value／unit／year／source_name／source_url／note
・field は「event_freq:番号の前の英字のID」（例 event_freq:jpn_tenkin）
・unit は annual_share（1年に経験する割合）、period_share（数年間の割合）、lifetime_share（生涯・ある年齢までの割合）、current_share（今その状態の割合）、years_count（過去N年のうち起きた年の数）、count（人数・件数）、currency（金額）のどれか
・note には、対象の人（成人・働く人・農村の世帯など）と、期間や定義の違いを書く
表のあとに、見つからなかった項目とその理由を短く書いてください。
----- ここまで -----

## 6回目（Germany・United Kingdom・France）

----- ここから -----
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を調べ、出典URL付きで表にまとめてください。推測で数字を埋めないでください。

背景：私は、生まれた国によってお金の一生が変わる教育用のブラウザゲームを作っています。ゲームの中で起きる出来事の確率を、統計で確かめたいと考えています。確率への計算は私がするので、あなたは「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字と出典を集めてください。

調べてほしいこと（番号順に）：
1. deu_flood（Germany）：世帯のうち、1年間に洪水・大雨で住宅の被害を受けた世帯の割合（保険会社の団体 GDV など、過去10年の平均）
2. deu_wohnung（Germany）：都市で子育てをしている賃貸世帯のうち、1年間に引っ越し先を探した世帯の割合
3. gbr_cost_of_living（United Kingdom）：過去20年のうち、消費者物価の上昇率が年5%を超えた年の数（ONS）
4. gbr_nhs_wait（United Kingdom）：人口のうち、1年間に NHS の待機リストに新しく加わった人の割合（NHS England の年間の新規紹介数 ÷ 人口）
5. gbr_mortgage_rate（United Kingdom）：住宅ローンのある世帯のうち、1年間に固定金利の期間が終わる世帯の割合（Bank of England、FCA）
6. gbr_tuition（United Kingdom）：18歳の人のうち、大学に進学する人の割合（UCAS の entry rate）
7. gbr_rent_rise（United Kingdom）：民間の賃貸に住む世帯のうち、過去1年に家賃を上げられた世帯の割合（English Housing Survey）
8. fra_strike（France）：過去20年のうち、全国規模の交通機関のストライキがあった年の数
9. fra_pension_age（France）：過去30年のうち、年金の支給開始年齢や満額の条件が変わった改革があった年の数
10. fra_heatwave（France）：過去20年のうち、熱波の警報（canicule）が出た年の数

守ってほしいこと：
・割合そのものが公表されていなくても、空欄にしないでください。割合の計算に使う「分子の数」（例：1年間の出国者数、被災者数、件数）と「分母の数」（例：その年齢の人口、全人口、全世帯数）を、それぞれ別の行に unit を count として出してください。私が計算します。
・ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間・地域など）を書く。どうしても見つからないときだけ空欄にし、理由を書く。
・NGOの記事や、危険区域の面積のような「起きうる範囲」の数字ではなく、実際に起きた人数・件数を優先する。
・数字ごとに、実際に確認したページのURLとデータの年を書く。ニュースやWikipediaは、一次資料がないときだけ使い「二次情報」と書く。
・割合は小数で書く（45.3%なら0.453）。
・英語とその国の言葉の両方で検索する。

出力：最後に、次の9列の表を1つだけ出してください。1行に1つの数字です。
列：iso3／country_en／field／value／unit／year／source_name／source_url／note
・field は「event_freq:番号の前の英字のID」（例 event_freq:jpn_tenkin）
・unit は annual_share（1年に経験する割合）、period_share（数年間の割合）、lifetime_share（生涯・ある年齢までの割合）、current_share（今その状態の割合）、years_count（過去N年のうち起きた年の数）、count（人数・件数）、currency（金額）のどれか
・note には、対象の人（成人・働く人・農村の世帯など）と、期間や定義の違いを書く
表のあとに、見つからなかった項目とその理由を短く書いてください。
----- ここまで -----

## 7回目（France・Mexico・Philippines）

----- ここから -----
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を調べ、出典URL付きで表にまとめてください。推測で数字を埋めないでください。

背景：私は、生まれた国によってお金の一生が変わる教育用のブラウザゲームを作っています。ゲームの中で起きる出来事の確率を、統計で確かめたいと考えています。確率への計算は私がするので、あなたは「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字と出典を集めてください。

調べてほしいこと（番号順に）：
1. fra_prepa（France）：バカロレアの合格者のうち、グランゼコール準備級（CPGE）に進む人の割合（高等教育省）
2. fra_creche（France）：3歳未満の子どもの親のうち、公立保育所（crèche）を希望したが入れなかった親の割合（CNAF、DREES）
3. mex_migrate_us（Mexico）：18〜40歳の人のうち、1年間に米国へ移住した人の割合（INEGI ENOE の国外移住率、CONAPO）
4. mex_security（Mexico）：18歳以上の人のうち、過去1年に犯罪の被害を受けた人の割合（INEGI ENVIPE）
5. mex_formal_job（Mexico）：インフォーマルで働く人のうち、1年間に社会保険のある仕事に移った人の割合（INEGI ENOE の移動の統計）
6. mex_earthquake（Mexico）：都市の人口のうち、1年間に被害の出た地震の影響を受けた人の割合（過去30年の平均）
7. mex_hurricane（Mexico）：人口のうち、1年間にハリケーンの被害を受けた人の割合（CENAPRED、過去10年の平均）
8. phl_ofw（Philippines）：22〜45歳の働く人のうち、1年間に海外就労（OFW）に出た人の割合（PSA Survey on Overseas Filipinos、DMW の年間出国者数）
9. phl_typhoon（Philippines）：人口のうち、1年間に台風の被害を受けた人の割合（NDRRMC、過去10年の平均）
10. phl_commute（Philippines）：都市で働く人のうち、片道の通勤時間が1時間以上の人の割合

守ってほしいこと：
・割合そのものが公表されていなくても、空欄にしないでください。割合の計算に使う「分子の数」（例：1年間の出国者数、被災者数、件数）と「分母の数」（例：その年齢の人口、全人口、全世帯数）を、それぞれ別の行に unit を count として出してください。私が計算します。
・ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間・地域など）を書く。どうしても見つからないときだけ空欄にし、理由を書く。
・NGOの記事や、危険区域の面積のような「起きうる範囲」の数字ではなく、実際に起きた人数・件数を優先する。
・数字ごとに、実際に確認したページのURLとデータの年を書く。ニュースやWikipediaは、一次資料がないときだけ使い「二次情報」と書く。
・割合は小数で書く（45.3%なら0.453）。
・英語とその国の言葉の両方で検索する。

出力：最後に、次の9列の表を1つだけ出してください。1行に1つの数字です。
列：iso3／country_en／field／value／unit／year／source_name／source_url／note
・field は「event_freq:番号の前の英字のID」（例 event_freq:jpn_tenkin）
・unit は annual_share（1年に経験する割合）、period_share（数年間の割合）、lifetime_share（生涯・ある年齢までの割合）、current_share（今その状態の割合）、years_count（過去N年のうち起きた年の数）、count（人数・件数）、currency（金額）のどれか
・note には、対象の人（成人・働く人・農村の世帯など）と、期間や定義の違いを書く
表のあとに、見つからなかった項目とその理由を短く書いてください。
----- ここまで -----

## 8回目（Philippines・Egypt・Ethiopia）

----- ここから -----
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を調べ、出典URL付きで表にまとめてください。推測で数字を埋めないでください。

背景：私は、生まれた国によってお金の一生が変わる教育用のブラウザゲームを作っています。ゲームの中で起きる出来事の確率を、統計で確かめたいと考えています。確率への計算は私がするので、あなたは「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字と出典を集めてください。

調べてほしいこと（番号順に）：
1. phl_hospital_deposit（Philippines）：人口のうち、1年間に入院した人の割合と、入院のときに前払い金を求められた人の割合
2. egy_pound_drop（Egypt）：過去30年のうち、エジプト・ポンドが対米ドルで1年に30%以上下落した年の数
3. egy_bread_subsidy（Egypt）：補助金付きパンを受け取っている人の割合と、過去30年のうち補助金付きパンの価格が引き上げられた年の数
4. egy_tutoring（Egypt）：高校生のうち、私塾・家庭教師を使っている人の割合（CAPMAS の家計調査 HIECS など）
5. egy_gulf_work（Egypt）：22〜45歳の働く人のうち、1年間に湾岸諸国へ働きに出た人の割合
6. egy_marriage_home（Egypt）：結婚した世帯のうち、新居や家具の準備のために借金をした世帯の割合
7. eth_birr_float（Ethiopia）：過去30年のうち、ブルが対米ドルで1年に30%以上下落した年の数
8. eth_drought（Ethiopia）：農村の人口のうち、1年間に干ばつで食料支援を受けた人の割合（OCHA、過去10年の平均）
9. eth_conflict_move（Ethiopia）：人口のうち、1年間に紛争で新たに国内避難民になった人の割合（IDMC の新規避難者数 ÷ 人口、過去10年の平均）
10. eth_cbhi（Ethiopia）：農村の世帯のうち、地域医療保険（CBHI）に入っている世帯の割合

守ってほしいこと：
・割合そのものが公表されていなくても、空欄にしないでください。割合の計算に使う「分子の数」（例：1年間の出国者数、被災者数、件数）と「分母の数」（例：その年齢の人口、全人口、全世帯数）を、それぞれ別の行に unit を count として出してください。私が計算します。
・ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間・地域など）を書く。どうしても見つからないときだけ空欄にし、理由を書く。
・NGOの記事や、危険区域の面積のような「起きうる範囲」の数字ではなく、実際に起きた人数・件数を優先する。
・数字ごとに、実際に確認したページのURLとデータの年を書く。ニュースやWikipediaは、一次資料がないときだけ使い「二次情報」と書く。
・割合は小数で書く（45.3%なら0.453）。
・英語とその国の言葉の両方で検索する。

出力：最後に、次の9列の表を1つだけ出してください。1行に1つの数字です。
列：iso3／country_en／field／value／unit／year／source_name／source_url／note
・field は「event_freq:番号の前の英字のID」（例 event_freq:jpn_tenkin）
・unit は annual_share（1年に経験する割合）、period_share（数年間の割合）、lifetime_share（生涯・ある年齢までの割合）、current_share（今その状態の割合）、years_count（過去N年のうち起きた年の数）、count（人数・件数）、currency（金額）のどれか
・note には、対象の人（成人・働く人・農村の世帯など）と、期間や定義の違いを書く
表のあとに、見つからなかった項目とその理由を短く書いてください。
----- ここまで -----

## 9回目（Ethiopia・Democratic Republic of the Congo・Viet Nam）

----- ここから -----
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を調べ、出典URL付きで表にまとめてください。推測で数字を埋めないでください。

背景：私は、生まれた国によってお金の一生が変わる教育用のブラウザゲームを作っています。ゲームの中で起きる出来事の確率を、統計で確かめたいと考えています。確率への計算は私がするので、あなたは「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字と出典を集めてください。

調べてほしいこと（番号順に）：
1. eth_gulf_work（Ethiopia）：18〜35歳の人のうち、1年間に中東へ働きに出た人の割合（労働・技能省の年間出国者数）
2. cod_displacement（Democratic Republic of the Congo）：人口のうち、1年間に紛争で新たに国内避難民になった人の割合（IDMC、過去10年の平均）
3. cod_epidemic（Democratic Republic of the Congo）：人口のうち、1年間にコレラ・はしかなどの感染症にかかった人の割合（WHO、過去10年の平均）
4. cod_school_fees（Democratic Republic of the Congo）：小学生のいる世帯のうち、学校に関わる費用（制服・教材・教員への謝礼など）を払っている世帯の割合と、その年額
5. cod_mining（Democratic Republic of the Congo）：農村の16〜50歳の人のうち、手掘りの鉱山で働いている人の割合
6. cod_franc_drop（Democratic Republic of the Congo）：過去30年のうち、コンゴ・フランが対米ドルで1年に20%以上下落した年の数
7. vnm_motorbike（Viet Nam）：18〜30歳の人のうち、自分のバイクを持っている人の割合（または1年間に新しく買う人の割合）
8. vnm_land（Viet Nam）：30〜60歳が世帯主の世帯のうち、1年間に土地を買った世帯の割合
9. vnm_typhoon_flood（Viet Nam）：人口のうち、1年間に台風・洪水の被害を受けた人の割合（過去10年の平均）
10. vnm_factory（Viet Nam）：農村の18〜35歳の人のうち、1年間に工業団地へ働きに出た人の割合（国内移住調査）

守ってほしいこと：
・割合そのものが公表されていなくても、空欄にしないでください。割合の計算に使う「分子の数」（例：1年間の出国者数、被災者数、件数）と「分母の数」（例：その年齢の人口、全人口、全世帯数）を、それぞれ別の行に unit を count として出してください。私が計算します。
・ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間・地域など）を書く。どうしても見つからないときだけ空欄にし、理由を書く。
・NGOの記事や、危険区域の面積のような「起きうる範囲」の数字ではなく、実際に起きた人数・件数を優先する。
・数字ごとに、実際に確認したページのURLとデータの年を書く。ニュースやWikipediaは、一次資料がないときだけ使い「二次情報」と書く。
・割合は小数で書く（45.3%なら0.453）。
・英語とその国の言葉の両方で検索する。

出力：最後に、次の9列の表を1つだけ出してください。1行に1つの数字です。
列：iso3／country_en／field／value／unit／year／source_name／source_url／note
・field は「event_freq:番号の前の英字のID」（例 event_freq:jpn_tenkin）
・unit は annual_share（1年に経験する割合）、period_share（数年間の割合）、lifetime_share（生涯・ある年齢までの割合）、current_share（今その状態の割合）、years_count（過去N年のうち起きた年の数）、count（人数・件数）、currency（金額）のどれか
・note には、対象の人（成人・働く人・農村の世帯など）と、期間や定義の違いを書く
表のあとに、見つからなかった項目とその理由を短く書いてください。
----- ここまで -----

## 10回目（Viet Nam・Republic of Korea・Kenya）

----- ここから -----
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を調べ、出典URL付きで表にまとめてください。推測で数字を埋めないでください。

背景：私は、生まれた国によってお金の一生が変わる教育用のブラウザゲームを作っています。ゲームの中で起きる出来事の確率を、統計で確かめたいと考えています。確率への計算は私がするので、あなたは「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字と出典を集めてください。

調べてほしいこと（番号順に）：
1. vnm_extra_class（Viet Nam）：小中高生のうち、補習授業（học thêm）に通っている人の割合
2. kor_hagwon（Republic of Korea）：小中高生のうち、私教育（塾など）に参加している人の割合（統計庁 私教育費調査）
3. kor_jeonse（Republic of Korea）：賃貸世帯のうち、チョンセで借りている世帯の割合と、1年間に新しく賃貸契約を結ぶ世帯の割合
4. kor_suneung（Republic of Korea）：スヌンの受験者のうち、浪人生など高校卒業後に受ける人の割合（韓国教育課程評価院）
5. kor_early_retire（Republic of Korea）：48〜56歳の雇用者のうち、1年間に希望退職・早期退職をした人の割合
6. kor_wedding_home（Republic of Korea）：結婚を考えている人のうち、住宅費を理由に結婚を延ばした人の割合（保健社会研究院など）
7. ken_mpesa_loan（Kenya）：成人のうち、過去1年にモバイル融資（M-Shwari など）を使った人の割合（FinAccess 2024）
8. ken_drought（Kenya）：農村の人口のうち、1年間に干ばつで食料が足りなくなった人の割合（NDMA、過去10年の平均）
9. ken_school_fees（Kenya）：中等学校の生徒のうち、寮のある学校（boarding）に通う人の割合と、寮費などの年額
10. ken_fuel_tax（Kenya）：過去20年のうち、ガソリンの価格が1年に20%以上上がった年の数

守ってほしいこと：
・割合そのものが公表されていなくても、空欄にしないでください。割合の計算に使う「分子の数」（例：1年間の出国者数、被災者数、件数）と「分母の数」（例：その年齢の人口、全人口、全世帯数）を、それぞれ別の行に unit を count として出してください。私が計算します。
・ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間・地域など）を書く。どうしても見つからないときだけ空欄にし、理由を書く。
・NGOの記事や、危険区域の面積のような「起きうる範囲」の数字ではなく、実際に起きた人数・件数を優先する。
・数字ごとに、実際に確認したページのURLとデータの年を書く。ニュースやWikipediaは、一次資料がないときだけ使い「二次情報」と書く。
・割合は小数で書く（45.3%なら0.453）。
・英語とその国の言葉の両方で検索する。

出力：最後に、次の9列の表を1つだけ出してください。1行に1つの数字です。
列：iso3／country_en／field／value／unit／year／source_name／source_url／note
・field は「event_freq:番号の前の英字のID」（例 event_freq:jpn_tenkin）
・unit は annual_share（1年に経験する割合）、period_share（数年間の割合）、lifetime_share（生涯・ある年齢までの割合）、current_share（今その状態の割合）、years_count（過去N年のうち起きた年の数）、count（人数・件数）、currency（金額）のどれか
・note には、対象の人（成人・働く人・農村の世帯など）と、期間や定義の違いを書く
表のあとに、見つからなかった項目とその理由を短く書いてください。
----- ここまで -----

## 11回目（Kenya・共通）

----- ここから -----
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を調べ、出典URL付きで表にまとめてください。推測で数字を埋めないでください。

背景：私は、生まれた国によってお金の一生が変わる教育用のブラウザゲームを作っています。ゲームの中で起きる出来事の確率を、統計で確かめたいと考えています。確率への計算は私がするので、あなたは「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字と出典を集めてください。

調べてほしいこと（番号順に）：
1. ken_harambee（Kenya）：成人のうち、過去1年に地域の寄付集め（harambee）や助け合いのグループにお金を出した人の割合（FinAccess）
2. gen_lic_malaria（所得水準ごとの平均。iso3 は LIC／LMC／UMC／HIC）：低所得国の人口のうち、1年間にマラリアにかかった人の割合（WHO World Malaria Report の国別の年間症例数 ÷ 人口。低所得国の平均と、主な国の値）
3. gen_savings_group（所得水準ごとの平均。iso3 は LIC／LMC／UMC／HIC）：低所得国・低中所得国の成人のうち、過去1年に積立グループ（savings club、ROSCA）でお金を貯めた人の割合（Global Findex の所得水準ごとの値）
4. gen_rural_harvest（所得水準ごとの平均。iso3 は LIC／LMC／UMC／HIC）：低・中所得国の農家世帯のうち、1年間に天候による不作で収入が大きく減った世帯の割合（LSMS、FAO）
5. gen_urban_rent（所得水準ごとの平均。iso3 は LIC／LMC／UMC／HIC）：都市で賃貸に住む世帯のうち、1年間に大家の都合で退去を求められた世帯の割合（各国の住宅調査。主な数か国の値）
6. gen_scam_call（所得水準ごとの平均。iso3 は LIC／LMC／UMC／HIC）：成人のうち、過去1年に電話・SMS の詐欺でお金をだまし取られた人の割合（Global Anti-Scam Alliance、各国の犯罪被害調査。主な数か国の値）
7. gen_relative_loan（所得水準ごとの平均。iso3 は LIC／LMC／UMC／HIC）：成人のうち、過去1年に家族・友人からお金を借りた人の割合（Global Findex の所得水準ごとの値）
8. gen_hic_pension（所得水準ごとの平均。iso3 は LIC／LMC／UMC／HIC）：高所得国の雇用者のうち、職場の確定拠出年金・税優遇の積立制度に入っている人の割合（OECD Pensions at a Glance）
9. gen_hic_burnout（所得水準ごとの平均。iso3 は LIC／LMC／UMC／HIC）：高所得国・高中所得国の働く人のうち、過去1年に仕事のストレスで心身の不調を経験した人の割合（EU-OSHA、Eurofound、ILO）
10. gen_umc_lmc_gig（所得水準ごとの平均。iso3 は LIC／LMC／UMC／HIC）：中所得国の都市で働く人のうち、配達・配車などのアプリの仕事をしている人の割合（ILO）

守ってほしいこと：
・割合そのものが公表されていなくても、空欄にしないでください。割合の計算に使う「分子の数」（例：1年間の出国者数、被災者数、件数）と「分母の数」（例：その年齢の人口、全人口、全世帯数）を、それぞれ別の行に unit を count として出してください。私が計算します。
・ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間・地域など）を書く。どうしても見つからないときだけ空欄にし、理由を書く。
・NGOの記事や、危険区域の面積のような「起きうる範囲」の数字ではなく、実際に起きた人数・件数を優先する。
・数字ごとに、実際に確認したページのURLとデータの年を書く。ニュースやWikipediaは、一次資料がないときだけ使い「二次情報」と書く。
・割合は小数で書く（45.3%なら0.453）。
・英語とその国の言葉の両方で検索する。

出力：最後に、次の9列の表を1つだけ出してください。1行に1つの数字です。
列：iso3／country_en／field／value／unit／year／source_name／source_url／note
・field は「event_freq:番号の前の英字のID」（例 event_freq:jpn_tenkin）
・unit は annual_share（1年に経験する割合）、period_share（数年間の割合）、lifetime_share（生涯・ある年齢までの割合）、current_share（今その状態の割合）、years_count（過去N年のうち起きた年の数）、count（人数・件数）、currency（金額）のどれか
・note には、対象の人（成人・働く人・農村の世帯など）と、期間や定義の違いを書く
表のあとに、見つからなかった項目とその理由を短く書いてください。
----- ここまで -----

## 12回目（国のリスク：治安・パートナーからの暴力・物価）

----- ここから -----
あなたは国際統計の調査アシスタントです。国際機関・政府の一次データを調べ、出典URL付きで表にまとめてください。推測で数字を埋めないでください。

背景：私は、生まれた国によってお金の一生が変わる教育用のブラウザゲームを作っています。下の国の値がまだ推計のままなので、公的統計に置き換えたいと考えています。

調べてほしいこと（番号順に）：
1. homicide_rate：故意の殺人の被害者数（人口10万人あたり）。出典は UNODC、なければ WHO Global Health Estimates。対象：Madagascar（MDG）、Côte d'Ivoire（CIV）、Mali（MLI）、Chad（TCD）、Somalia（SOM）、Guinea（GIN）、North Korea（PRK）、Togo（TGO）、Republic of the Congo（COG）
2. ipv_past12m_women：過去12か月にパートナーから身体的・性的暴力を受けた女性の割合（15〜49歳）。出典は WHO Violence Against Women Prevalence Estimates 2018、なければ DHS。対象：Yemen（YEM）、Russia（RUS）、Iran（IRN）、Iraq（IRQ）、Uzbekistan（UZB）、Algeria（DZA）、Somalia（SOM）、Saudi Arabia（SAU）、Syria（SYR）、Malaysia（MYS）、North Korea（PRK）、Republic of the Congo（COG）
3. inflation_recent：消費者物価の上昇率（年平均、%）。1995年から最新年まで1年1行。出典は IMF World Economic Outlook、なければ World Bank、各国の中央銀行。対象：Somalia（SOM）、North Korea（PRK）、Syria（SYR）

守ってほしいこと：
・見つからないときは数字を空欄にし、理由を書く。定義が違う数字しかないときは、その数字を入れて違いを書く。
・数字ごとに、実際に確認したページのURLとデータの年を書く。ニュースやWikipediaは、一次資料がないときだけ使い「二次情報」と書く。
・2の割合は小数で書く（18.3%なら0.183）。1は10万人あたりの数、3は%のまま（12.5など）。
・コンゴ共和国（COG）とコンゴ民主共和国（COD）、北朝鮮（PRK）と韓国（KOR）を取り違えない。

出力：最後に、次の9列の表を1つだけ出してください。1行に1つの数字です。
列：iso3／country_en／field／value／unit／year／source_name／source_url／note
・unit は 1が per100k、2が share、3が percent
表のあとに、見つからなかった国とその理由を短く書いてください。
----- ここまで -----
````

## 付録8. part9a_prompt.md（2026-10-29）

````markdown
# 第9部a：国ごとの出来事の確率（Japan・United States of America・China、16件）

Gemini の Deep Research（または Perplexity の Research モード）に、下のコードブロックをそのまま貼る。返ってきたCSVは jinsei_receipt_part9a.csv として保存する。

```
[Role]
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を検索し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。目的は、統計にもとづいて「世界にはこういう暮らしがある」と知ってもらうことです。
- ゲームでは、国ごとの出来事（転勤、洪水、通貨の下落など）が、ある確率で起きます。いまの確率は、私がおおよそで決めた推計です。
- これを統計で確かめたいので、出来事ごとに「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字を集めてください。確率への直し方は私が計算します。あなたは数字と出典を集めるだけで構いません。

[Task]
次の出来事について、それぞれ「調べる数字」を探してください。番号順に1つずつ進めてください。
英語と、その国の言葉の両方で検索し、政府統計・国際機関の資料を優先してください。

(1) event_freq:jpn_tenkin　転勤の辞令
    ゲームでの場面：会社から、来春から遠方の支店に異動するよう内示が出た。
    対象の国：JPN（Japan）
    調べる数字：正社員のうち、1年間に転居をともなう転勤を経験した人の割合（年率）。出典の例：労働政策研究・研修機構（JILPT）「企業における転勤の実態に関する調査」

(2) event_freq:jpn_kaigo　親の介護
    ゲームでの場面：離れて暮らす親が倒れ、日常生活に介助が必要になった。
    対象の国：JPN（Japan）
    調べる数字：40〜64歳の働く人のうち、1年間に親の介護が新たに始まった人の割合。年率がなければ「介護をしている有業者の数」と「その年齢の有業者の数」（総務省 就業構造基本調査2022）

(3) event_freq:jpn_earthquake　大きな地震
    ゲームでの場面：住んでいる地域で震度6弱以上の地震が起きた。家具が倒れ、しばらく水道が止まった。
    対象の国：JPN（Japan）
    調べる数字：1年間に、住んでいる市区町村で震度6弱以上の揺れを観測した人の割合（過去10〜30年の平均）。出典の例：気象庁 震度データベース、総務省の人口

(4) event_freq:jpn_heavy_rain　豪雨で浸水
    ゲームでの場面：線状降水帯による大雨で川があふれ、自宅の1階が浸水した。
    対象の国：JPN（Japan）
    調べる数字：1年間に住宅が浸水被害（床上・床下）を受けた世帯の割合（過去10年の平均）。出典の例：国土交通省「水害統計」の浸水棟数 ÷ 住宅数

(5) event_freq:jpn_seishain　正社員登用の話
    ゲームでの場面：契約社員として働く職場で、正社員登用試験を受けないかと声をかけられた。
    対象の国：JPN（Japan）
    調べる数字：非正規で働く人のうち、1年間に正社員に転換した人の割合。出典の例：総務省 労働力調査（詳細集計）「非正規から正規への転換」

(6) event_freq:jpn_chugaku_juken　中学受験
    ゲームでの場面：子どもの同級生の多くが塾に通いはじめ、中学受験をするか家族で話し合った。
    対象の国：JPN（Japan）
    調べる数字：小学6年生のうち、私立・国立の中学校を受験する子の割合（全国と首都圏の両方）

(7) event_freq:usa_medical_bill　救急外来の請求書
    ゲームでの場面：救急外来で治療を受けたあと、保険でカバーされない高額な請求書が届いた。
    対象の国：USA（United States of America）
    調べる数字：成人のうち、過去1年に救急外来で治療を受け、保険で払われない高額の請求（目安1,000ドル以上）を受けた人の割合。なければ「過去1年に医療費の支払いに困った成人の割合」（CDC NHIS、KFF）

(8) event_freq:usa_student_loan　大学進学と学生ローン
    ゲームでの場面：大学の合格通知が届いた。学費は年に数万ドルかかる。
    対象の国：USA（United States of America）
    調べる数字：高校卒業者のうち4年制大学にすぐ進学する割合と、そのうち連邦学生ローンを借りる割合（NCES）

(9) event_freq:usa_layoff　突然のレイオフ
    ゲームでの場面：会社の業績悪化で、部署ごと解雇されることになった。
    対象の国：USA（United States of America）
    調べる数字：雇用者のうち、1年間にレイオフ・解雇された人の割合（BLS JOLTS の Layoffs and discharges の年合計 ÷ 雇用者数）。あわせて Displaced Worker Survey の「3年間に会社の都合で職を失った人の割合」

(10) event_freq:usa_childcare　保育料の高さ
    ゲームでの場面：産休が明けたが、近くの保育施設の料金は月に1,000ドルを超えていた。
    対象の国：USA（United States of America）
    調べる数字：0〜2歳の子どもがいる家庭のうち、有料の保育施設を使っている割合と、年間の保育料の中央値

(11) event_freq:usa_hurricane_wildfire　ハリケーン・山火事で避難
    ゲームでの場面：大型のハリケーンや山火事が迫り、地域に避難命令が出た。
    対象の国：USA（United States of America）
    調べる数字：成人のうち、1年間に自然災害（ハリケーン・山火事など）で家を離れて避難した人の割合（Census Household Pulse Survey の natural disaster displacement）

(12) event_freq:chn_unfinished_flat　工事が止まったマンション
    ゲームでの場面：頭金を払って予約購入したマンションの工事が、開発会社の資金難で止まった。
    対象の国：CHN（China）
    調べる数字：完成前の住宅を予約購入した世帯のうち、工事が止まった物件にあたった世帯の割合。なければ、工事停止物件の戸数 ÷ 都市の世帯数

(13) event_freq:chn_hukou_school　戸籍と子どもの学校
    ゲームでの場面：働いている都市に戸籍がないため、子どもが地元の公立校に入るには多くの書類と条件が必要だと分かった。
    対象の国：CHN（China）
    調べる数字：都市に住む義務教育年齢の子どものうち、戸籍が別の地域にある子ども（随遷子女）の割合（教育部 統計公報）

(14) event_freq:chn_gaokao　高考の結果
    ゲームでの場面：全国統一の大学入試「高考」の点数が発表され、志望校には届かなかった。
    対象の国：CHN（China）
    調べる数字：高考の受験者のうち、4年制大学（本科）に合格した人の割合（教育部）

(15) event_freq:chn_996　長時間労働の職場
    ゲームでの場面：勤め先で、朝9時から夜9時まで週6日働くことが当たり前になってきた。
    対象の国：CHN（China）
    調べる数字：都市の雇用者のうち、週の労働時間が60時間以上の人の割合（国家統計局）

(16) event_freq:chn_flood　夏の大雨と洪水
    ゲームでの場面：夏の豪雨で川が増水し、村の田畑と家が水につかった。
    対象の国：CHN（China）
    調べる数字：農村の人口のうち、1年間に洪水の被害を受けた人の割合（応急管理部の年間被災人口 ÷ 農村人口、過去10年の平均）

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に「未掲載」「最新年が2010年以前」など理由を書くこと。
- 指定とぴったり同じ数字がないときは、いちばん近い数字を記録し、note に「指定との違い」（対象の年齢・期間・地域の違いなど）を必ず書くこと。1つの出来事に2つ以上の数字を記録してよい（1行に1つ）。
- 1つの数値ごとに、実際に数字を確認したページのURL（トップページではなく、表・報告書・PDFのページ）と、データの年を必ず記録すること。[1] のような番号ではなく、URLそのものを書くこと。
- 割合は小数で記録すること（例：45.3% → 0.453）。
- unit は次のどれかにすること：annual_share（1年間に経験する人の割合）／period_share（数年間に経験する割合。note に期間）／lifetime_share（生涯や、ある年齢までに経験する割合。note に年齢）／current_share（今その状態にある人の割合）／years_count（過去N年のうち起きた年の数。note に「過去N年」）／count（人数・件数。note に何の数か）／currency（金額。note に通貨）
- 「対象の人」（全人口・成人・働く人・農村の世帯など）を note に必ず書くこと。
- ニュース記事・まとめサイト・Wikipedia は使わないこと。一次資料がどうしても見つからない場合だけ使い、note に「二次情報」と書くこと。
- 途中で回答が長くなりすぎる場合は、そこまでのCSVを出し、どの番号まで終わったかを書くこと。

[Output Format]
1. 次の列のCSVを、```csv のコードブロックで出力すること（1行に1つの数値。列の順番を変えないこと）：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   field は「event_freq:出来事のID」（例：event_freq:jpn_tenkin）とすること。
   例：
   JPN,Japan,event_freq:jpn_tenkin,0.0XX,annual_share,20XX,JILPT,https://www.jil.go.jp/（数字を確認したページ）,対象：正社員。過去1年に転居をともなう転勤をした人の割合
   USA,United States,event_freq:usa_layoff,0.XX,annual_share,20XX,BLS JOLTS,https://www.bls.gov/（数字を確認したページ）,対象：雇用者。Layoffs and discharges の年合計 ÷ 平均雇用者数
2. CSVのあとに、日本語で短い要約を書くこと：
   - 数字が見つかった出来事／見つからなかった出来事と、その理由
   - 指定と定義が違う数字の一覧
   - アクセスできなかったサイト
```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：なし
````

## 付録9. part9b_prompt.md（2026-10-29）

````markdown
# 第9部b：国ごとの出来事の確率（India・Nigeria・Pakistan、16件）

Gemini の Deep Research（または Perplexity の Research モード）に、下のコードブロックをそのまま貼る。返ってきたCSVは jinsei_receipt_part9b.csv として保存する。

```
[Role]
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を検索し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。目的は、統計にもとづいて「世界にはこういう暮らしがある」と知ってもらうことです。
- ゲームでは、国ごとの出来事（転勤、洪水、通貨の下落など）が、ある確率で起きます。いまの確率は、私がおおよそで決めた推計です。
- これを統計で確かめたいので、出来事ごとに「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字を集めてください。確率への直し方は私が計算します。あなたは数字と出典を集めるだけで構いません。

[Task]
次の出来事について、それぞれ「調べる数字」を探してください。番号順に1つずつ進めてください。
英語と、その国の言葉の両方で検索し、政府統計・国際機関の資料を優先してください。

(1) event_freq:ind_monsoon_flood　モンスーンの洪水
    ゲームでの場面：モンスーンの大雨で近くの川があふれ、家の中まで水が入ってきた。
    対象の国：IND（India）
    調べる数字：人口のうち、1年間に洪水の影響を受けた人の割合（過去10年の平均。出典の例：Central Water Commission、NDMA）

(2) event_freq:ind_entrance_exam　工学・医学部の入試準備
    ゲームでの場面：周りの多くが工学系入試（JEE）や医学部入試（NEET）の予備校に通いはじめた。
    対象の国：IND（India）
    調べる数字：12年生（高校3年）のうち、JEE Main または NEET を受験する人の割合（受験者数 ÷ 12年生の在籍者数）

(3) event_freq:ind_wedding_cost　結婚式の費用
    ゲームでの場面：結婚が決まり、親族から盛大な式を挙げるよう期待されている。
    対象の国：IND（India）
    調べる数字：結婚した世帯のうち、結婚式の費用のために借金をした世帯の割合（家計調査・学術調査）

(4) event_freq:ind_gulf_work　湾岸諸国への出稼ぎ
    ゲームでの場面：知人から、ドバイの建設現場の仕事を紹介すると持ちかけられた。
    対象の国：IND（India）
    調べる数字：20〜45歳の働く人のうち、1年間に湾岸諸国へ出稼ぎに出た人の割合（eMigrate の年間の出国許可数 ÷ その年齢の就業者数）

(5) event_freq:ind_crop_failure　雨不足で不作
    ゲームでの場面：モンスーンの雨が少なく、育てていた作物の収穫が大きく減った。
    対象の国：IND（India）
    調べる数字：農家世帯のうち、1年間に干ばつや雨不足で作物の被害を受けた世帯の割合（NSS 77th round「Situation Assessment of Agricultural Households」など）

(6) event_freq:ind_private_hospital　家族の入院
    ゲームでの場面：家族が入院することになり、公立病院と私立病院のどちらにするか迷った。
    対象の国：IND（India）
    調べる数字：人口のうち、1年間に入院した人の割合と、そのうち私立病院の割合（NSS 75th round）

(7) event_freq:nga_fuel_price　ガソリン代の高騰
    ゲームでの場面：燃料補助金が打ち切られ、ガソリンと交通費が一気に値上がりした。
    対象の国：NGA（Nigeria）
    調べる数字：過去20年のうち、ガソリンの公定・平均価格が1年で50%以上上がった年の数

(8) event_freq:nga_naira_drop　ナイラの急落
    ゲームでの場面：為替の自由化でナイラが急落し、輸入品を中心に物価が上がり続けている。
    対象の国：NGA（Nigeria）
    調べる数字：過去30年のうち、ナイラが対米ドルで1年に30%以上下落した年の数

(9) event_freq:nga_generator　停電と発電機
    ゲームでの場面：送電網の停電が続き、1日に数時間しか電気が来ない。
    対象の国：NGA（Nigeria）
    調べる数字：都市の世帯のうち、自家用の発電機を持っている（使っている）世帯の割合（NBS、DHS、LSMS）

(10) event_freq:nga_japa　海外移住（ジャパ）
    ゲームでの場面：同僚が次々と英国やカナダに移住し、自分も就労ビザを取るか考えた。
    対象の国：NGA（Nigeria）
    調べる数字：22〜40歳の働く人のうち、1年間に就労や留学で国外へ移住した人の割合。なければ、年間の国外移住者数（英国などの就労ビザ発給数）と、その年齢の人口

(11) event_freq:nga_asuu_strike　大学教員のストライキ
    ゲームでの場面：国立大学の教員組合がストライキに入り、授業が何か月も止まった。
    対象の国：NGA（Nigeria）
    調べる数字：過去20年のうち、国立大学の教員組合（ASUU）のストライキがあった年の数と、それぞれの期間（月）

(12) event_freq:pak_flood　大洪水
    ゲームでの場面：記録的な雨で村一帯が水につかり、家畜と畑が流された。
    対象の国：PAK（Pakistan）
    調べる数字：農村の人口のうち、1年間に洪水の被害を受けた人の割合（過去10年の平均。NDMA）

(13) event_freq:pak_inflation　物価の急上昇
    ゲームでの場面：ルピーが下落し、小麦粉や電気代などの値段が1年で3割近く上がった。
    対象の国：PAK（Pakistan）
    調べる数字：過去30年のうち、消費者物価の上昇率が年20%を超えた年の数（IMF・WDI）

(14) event_freq:pak_electricity_bill　電気代の請求額
    ゲームでの場面：料金改定で、毎月の電気代が収入の1割を超えるほどになった。
    対象の国：PAK（Pakistan）
    調べる数字：都市の世帯のうち、電気代が家計の支出の10%を超える世帯の割合。なければ、過去10年で家庭用の電気料金が1年に20%以上上がった年の数

(15) event_freq:pak_gulf_work　サウジアラビアへの出稼ぎ
    ゲームでの場面：親戚の紹介で、サウジアラビアの運転手の仕事に応募できることになった。
    対象の国：PAK（Pakistan）
    調べる数字：20〜45歳の働く人のうち、1年間に海外就労に出た人の割合（Bureau of Emigration and Overseas Employment の年間登録者数 ÷ その年齢の就業者数）

(16) event_freq:pak_heatwave　熱波
    ゲームでの場面：気温が45度を超える日が続き、停電も重なった。
    対象の国：PAK（Pakistan）
    調べる数字：人口のうち、1年間に熱波（気温45度前後以上が続く）の影響を受けた人の割合、または熱波が起きた年の数（過去10年）

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に「未掲載」「最新年が2010年以前」など理由を書くこと。
- 指定とぴったり同じ数字がないときは、いちばん近い数字を記録し、note に「指定との違い」（対象の年齢・期間・地域の違いなど）を必ず書くこと。1つの出来事に2つ以上の数字を記録してよい（1行に1つ）。
- 1つの数値ごとに、実際に数字を確認したページのURL（トップページではなく、表・報告書・PDFのページ）と、データの年を必ず記録すること。[1] のような番号ではなく、URLそのものを書くこと。
- 割合は小数で記録すること（例：45.3% → 0.453）。
- unit は次のどれかにすること：annual_share（1年間に経験する人の割合）／period_share（数年間に経験する割合。note に期間）／lifetime_share（生涯や、ある年齢までに経験する割合。note に年齢）／current_share（今その状態にある人の割合）／years_count（過去N年のうち起きた年の数。note に「過去N年」）／count（人数・件数。note に何の数か）／currency（金額。note に通貨）
- 「対象の人」（全人口・成人・働く人・農村の世帯など）を note に必ず書くこと。
- ニュース記事・まとめサイト・Wikipedia は使わないこと。一次資料がどうしても見つからない場合だけ使い、note に「二次情報」と書くこと。
- 途中で回答が長くなりすぎる場合は、そこまでのCSVを出し、どの番号まで終わったかを書くこと。

[Output Format]
1. 次の列のCSVを、```csv のコードブロックで出力すること（1行に1つの数値。列の順番を変えないこと）：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   field は「event_freq:出来事のID」（例：event_freq:jpn_tenkin）とすること。
   例：
   JPN,Japan,event_freq:jpn_tenkin,0.0XX,annual_share,20XX,JILPT,https://www.jil.go.jp/（数字を確認したページ）,対象：正社員。過去1年に転居をともなう転勤をした人の割合
   USA,United States,event_freq:usa_layoff,0.XX,annual_share,20XX,BLS JOLTS,https://www.bls.gov/（数字を確認したページ）,対象：雇用者。Layoffs and discharges の年合計 ÷ 平均雇用者数
2. CSVのあとに、日本語で短い要約を書くこと：
   - 数字が見つかった出来事／見つからなかった出来事と、その理由
   - 指定と定義が違う数字の一覧
   - アクセスできなかったサイト
```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：なし
````

## 付録10. part9c_prompt.md（2026-10-29）

````markdown
# 第9部c：国ごとの出来事の確率（Bangladesh・Indonesia・Brazil、15件）

Gemini の Deep Research（または Perplexity の Research モード）に、下のコードブロックをそのまま貼る。返ってきたCSVは jinsei_receipt_part9c.csv として保存する。

```
[Role]
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を検索し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。目的は、統計にもとづいて「世界にはこういう暮らしがある」と知ってもらうことです。
- ゲームでは、国ごとの出来事（転勤、洪水、通貨の下落など）が、ある確率で起きます。いまの確率は、私がおおよそで決めた推計です。
- これを統計で確かめたいので、出来事ごとに「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字を集めてください。確率への直し方は私が計算します。あなたは数字と出典を集めるだけで構いません。

[Task]
次の出来事について、それぞれ「調べる数字」を探してください。番号順に1つずつ進めてください。
英語と、その国の言葉の両方で検索し、政府統計・国際機関の資料を優先してください。

(1) event_freq:bgd_garment_job　縫製工場の求人
    ゲームでの場面：ダッカ近郊の縫製工場で働き手を募集していると、村で話が広まった。
    対象の国：BGD（Bangladesh）
    調べる数字：16〜35歳の人のうち、縫製工場で働いている人の割合（または1年間に新しく縫製業で働きはじめた人の割合）

(2) event_freq:bgd_flood　雨季の洪水
    ゲームでの場面：上流からの大水で川が氾濫し、道も畑も水につかった。
    対象の国：BGD（Bangladesh）
    調べる数字：人口のうち、1年間に洪水の被害を受けた人の割合（過去10年の平均）

(3) event_freq:bgd_cyclone　サイクロン
    ゲームでの場面：沿岸部にサイクロンの警報が出た。
    対象の国：BGD（Bangladesh）
    調べる数字：沿岸の農村人口のうち、1年間にサイクロンの被害を受けた人の割合（過去10年の平均）

(4) event_freq:bgd_microcredit　マイクロクレジット
    ゲームでの場面：村のマイクロファイナンスの集まりで、小さな商売のための融資を勧められた。
    対象の国：BGD（Bangladesh）
    調べる数字：農村の成人のうち、マイクロファイナンス機関から借りている人の割合（Microcredit Regulatory Authority、Global Findex）

(5) event_freq:bgd_gulf_work　海外への出稼ぎ
    ゲームでの場面：仲介業者から、マレーシアや中東の工場の仕事を紹介された。
    対象の国：BGD（Bangladesh）
    調べる数字：20〜40歳の働く人のうち、1年間に海外就労に出た人の割合（BMET の年間出国者数 ÷ その年齢の就業者数）

(6) event_freq:idn_earthquake　地震と津波警報
    ゲームでの場面：強い地震が起き、沿岸に津波警報が出た。
    対象の国：IDN（Indonesia）
    調べる数字：人口のうち、1年間に被害の出た地震の影響を受けた人の割合（BNPB の被災者数、過去10年の平均）

(7) event_freq:idn_jakarta_flood　雨季の冠水
    ゲームでの場面：大雨で住んでいる地区が冠水し、数日間仕事に行けなかった。
    対象の国：IDN（Indonesia）
    調べる数字：都市の住民のうち、1年間に浸水の被害を受けた人の割合（BNPB、ジャカルタ州の統計）

(8) event_freq:idn_haze　森林火災の煙害
    ゲームでの場面：乾季の森林火災の煙で、空が何週間も霞んでいる。
    対象の国：IDN（Indonesia）
    調べる数字：人口のうち、森林火災の煙害の影響を受けた人の数（2015年、2019年など）と、煙害が起きた年の数（過去10年）

(9) event_freq:idn_jkn　国民健康保険の加入
    ゲームでの場面：屋台の商売を始めたので、国民健康保険（JKN）に自分で保険料を払って入るか考えた。
    対象の国：IDN（Indonesia）
    調べる数字：18〜60歳の自営業者・インフォーマルで働く人のうち、国民健康保険（JKN）に入っていない、または保険料を滞納している人の割合（BPJS Kesehatan）

(10) event_freq:idn_online_loan　スマホの即日ローン
    ゲームでの場面：急な出費があり、スマホアプリの即日ローンの広告が目に入った。
    対象の国：IDN（Indonesia）
    調べる数字：成人のうち、過去1年にオンライン貸金（pinjol）を使った人の割合（OJK）

(11) event_freq:bra_price_rise　物価の上昇
    ゲームでの場面：食料品の値段が上がり、毎月の買い物で同じ額では足りなくなってきた。
    対象の国：BRA（Brazil）
    調べる数字：過去20年のうち、消費者物価の上昇率が年6%を超えた年の数（IBGE・WDI）

(12) event_freq:bra_security　防犯のための出費
    ゲームでの場面：近所で強盗が相次ぎ、家族で防犯対策を話し合った。
    対象の国：BRA（Brazil）
    調べる数字：都市の世帯のうち、防犯の設備やサービスにお金を払っている世帯の割合。なければ、過去1年に犯罪の被害を受けた人の割合（PNAD の被害者調査）

(13) event_freq:bra_phone_theft　スマホのひったくり
    ゲームでの場面：通勤中にスマホをひったくられた。
    対象の国：BRA（Brazil）
    調べる数字：15歳以上の人のうち、過去1年に携帯電話を盗まれた・奪われた人の割合（PNAD、Fórum Brasileiro de Segurança Pública）

(14) event_freq:bra_sus_wait　公立病院の待ち時間
    ゲームでの場面：専門医の診察が必要になったが、公的医療（SUS）では数か月待ちだと言われた。
    対象の国：BRA（Brazil）
    調べる数字：人口のうち、1年間に公的医療（SUS）で専門医の受診を待った人の割合と、待った期間の中央値

(15) event_freq:bra_enem　全国高校試験（ENEM）
    ゲームでの場面：ENEMの点数で国立大学に入れるかが決まる。結果は少し足りなかった。
    対象の国：BRA（Brazil）
    調べる数字：高校3年生のうち、ENEM を受験する人の割合（INEP）

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に「未掲載」「最新年が2010年以前」など理由を書くこと。
- 指定とぴったり同じ数字がないときは、いちばん近い数字を記録し、note に「指定との違い」（対象の年齢・期間・地域の違いなど）を必ず書くこと。1つの出来事に2つ以上の数字を記録してよい（1行に1つ）。
- 1つの数値ごとに、実際に数字を確認したページのURL（トップページではなく、表・報告書・PDFのページ）と、データの年を必ず記録すること。[1] のような番号ではなく、URLそのものを書くこと。
- 割合は小数で記録すること（例：45.3% → 0.453）。
- unit は次のどれかにすること：annual_share（1年間に経験する人の割合）／period_share（数年間に経験する割合。note に期間）／lifetime_share（生涯や、ある年齢までに経験する割合。note に年齢）／current_share（今その状態にある人の割合）／years_count（過去N年のうち起きた年の数。note に「過去N年」）／count（人数・件数。note に何の数か）／currency（金額。note に通貨）
- 「対象の人」（全人口・成人・働く人・農村の世帯など）を note に必ず書くこと。
- ニュース記事・まとめサイト・Wikipedia は使わないこと。一次資料がどうしても見つからない場合だけ使い、note に「二次情報」と書くこと。
- 途中で回答が長くなりすぎる場合は、そこまでのCSVを出し、どの番号まで終わったかを書くこと。

[Output Format]
1. 次の列のCSVを、```csv のコードブロックで出力すること（1行に1つの数値。列の順番を変えないこと）：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   field は「event_freq:出来事のID」（例：event_freq:jpn_tenkin）とすること。
   例：
   JPN,Japan,event_freq:jpn_tenkin,0.0XX,annual_share,20XX,JILPT,https://www.jil.go.jp/（数字を確認したページ）,対象：正社員。過去1年に転居をともなう転勤をした人の割合
   USA,United States,event_freq:usa_layoff,0.XX,annual_share,20XX,BLS JOLTS,https://www.bls.gov/（数字を確認したページ）,対象：雇用者。Layoffs and discharges の年合計 ÷ 平均雇用者数
2. CSVのあとに、日本語で短い要約を書くこと：
   - 数字が見つかった出来事／見つからなかった出来事と、その理由
   - 指定と定義が違う数字の一覧
   - アクセスできなかったサイト
```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：なし
````

## 付録11. part9d_prompt.md（2026-10-29）

````markdown
# 第9部d：国ごとの出来事の確率（Germany・United Kingdom・France、15件）

Gemini の Deep Research（または Perplexity の Research モード）に、下のコードブロックをそのまま貼る。返ってきたCSVは jinsei_receipt_part9d.csv として保存する。

```
[Role]
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を検索し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。目的は、統計にもとづいて「世界にはこういう暮らしがある」と知ってもらうことです。
- ゲームでは、国ごとの出来事（転勤、洪水、通貨の下落など）が、ある確率で起きます。いまの確率は、私がおおよそで決めた推計です。
- これを統計で確かめたいので、出来事ごとに「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字を集めてください。確率への直し方は私が計算します。あなたは数字と出典を集めるだけで構いません。

[Task]
次の出来事について、それぞれ「調べる数字」を探してください。番号順に1つずつ進めてください。
英語と、その国の言葉の両方で検索し、政府統計・国際機関の資料を優先してください。

(1) event_freq:deu_ausbildung　職業訓練か大学か
    ゲームでの場面：学校を出たあと、職業訓練（デュアルシステム）に進むか、大学を目指すかを決める時期が来た。
    対象の国：DEU（Germany）
    調べる数字：学校を出た若者のうち、職業訓練（デュアルシステム）に進む人の割合（BIBB）

(2) event_freq:deu_energy_price　暖房費の値上がり
    ゲームでの場面：ガス料金の改定で、冬の暖房費が前年の2倍近くになった。
    対象の国：DEU（Germany）
    調べる数字：過去20年のうち、家庭用のガス・暖房費が1年に30%以上上がった年の数（Destatis）

(3) event_freq:deu_kita　保育所の空き待ち
    ゲームでの場面：育児休業が終わるが、近くの保育所（Kita）に空きがない。
    対象の国：DEU（Germany）
    調べる数字：0〜2歳の子どもの親のうち、保育所（Kita）を希望したが入れなかった親の割合（DJI、Destatis）

(4) event_freq:deu_flood　豪雨による洪水
    ゲームでの場面：記録的な大雨で近くの川が氾濫し、家の1階が泥に埋まった。
    対象の国：DEU（Germany）
    調べる数字：世帯のうち、1年間に洪水・大雨で住宅の被害を受けた世帯の割合（保険会社の団体 GDV など、過去10年の平均）

(5) event_freq:deu_wohnung　都市の住まい探し
    ゲームでの場面：家族が増えて引っ越したいが、都市部の賃貸物件の内見には何十人も集まる。
    対象の国：DEU（Germany）
    調べる数字：都市で子育てをしている賃貸世帯のうち、1年間に引っ越し先を探した世帯の割合

(6) event_freq:gbr_cost_of_living　生活費の高騰
    ゲームでの場面：光熱費と食料品の値上がりで、毎月の家計が赤字になった。
    対象の国：GBR（United Kingdom）
    調べる数字：過去20年のうち、消費者物価の上昇率が年5%を超えた年の数（ONS）

(7) event_freq:gbr_nhs_wait　NHSの待機リスト
    ゲームでの場面：手術が必要と言われたが、国民保健サービス（NHS）では1年近く待つ見込みだった。
    対象の国：GBR（United Kingdom）
    調べる数字：人口のうち、1年間に NHS の待機リストに新しく加わった人の割合（NHS England の年間の新規紹介数 ÷ 人口）

(8) event_freq:gbr_mortgage_rate　住宅ローン金利の更新
    ゲームでの場面：2年固定の住宅ローン金利が終わり、新しい金利は以前の2倍以上になった。
    対象の国：GBR（United Kingdom）
    調べる数字：住宅ローンのある世帯のうち、1年間に固定金利の期間が終わる世帯の割合（Bank of England、FCA）

(9) event_freq:gbr_tuition　大学の学費と学生ローン
    ゲームでの場面：イングランドの大学の学費は年9,000ポンド超。学生ローンを使って進学するか考えた。
    対象の国：GBR（United Kingdom）
    調べる数字：18歳の人のうち、大学に進学する人の割合（UCAS の entry rate）

(10) event_freq:gbr_rent_rise　家賃の値上げ
    ゲームでの場面：大家から、来月から家賃を15%上げると通知が来た。
    対象の国：GBR（United Kingdom）
    調べる数字：民間の賃貸に住む世帯のうち、過去1年に家賃を上げられた世帯の割合（English Housing Survey）

(11) event_freq:fra_strike　交通機関のストライキ
    ゲームでの場面：年金改革に反対するストライキで、電車と地下鉄がほとんど動かない日が続いた。
    対象の国：FRA（France）
    調べる数字：過去20年のうち、全国規模の交通機関のストライキがあった年の数

(12) event_freq:fra_pension_age　年金の支給開始年齢
    ゲームでの場面：年金改革で、年金を満額受け取れる年齢が2年遅くなった。
    対象の国：FRA（France）
    調べる数字：過去30年のうち、年金の支給開始年齢や満額の条件が変わった改革があった年の数

(13) event_freq:fra_heatwave　夏の猛暑
    ゲームでの場面：気温40度近い熱波が続き、自宅にはエアコンがない。
    対象の国：FRA（France）
    調べる数字：過去20年のうち、熱波の警報（canicule）が出た年の数

(14) event_freq:fra_prepa　グランゼコール準備級
    ゲームでの場面：バカロレアに合格し、大学に進むか、難関校を目指す準備級（プレパ）に進むか選ぶことになった。
    対象の国：FRA（France）
    調べる数字：バカロレアの合格者のうち、グランゼコール準備級（CPGE）に進む人の割合（高等教育省）

(15) event_freq:fra_creche　保育所の申し込み
    ゲームでの場面：公立保育所（クレッシュ）に申し込んだが、空きが出るのは1年後と言われた。
    対象の国：FRA（France）
    調べる数字：3歳未満の子どもの親のうち、公立保育所（crèche）を希望したが入れなかった親の割合（CNAF、DREES）

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に「未掲載」「最新年が2010年以前」など理由を書くこと。
- 指定とぴったり同じ数字がないときは、いちばん近い数字を記録し、note に「指定との違い」（対象の年齢・期間・地域の違いなど）を必ず書くこと。1つの出来事に2つ以上の数字を記録してよい（1行に1つ）。
- 1つの数値ごとに、実際に数字を確認したページのURL（トップページではなく、表・報告書・PDFのページ）と、データの年を必ず記録すること。[1] のような番号ではなく、URLそのものを書くこと。
- 割合は小数で記録すること（例：45.3% → 0.453）。
- unit は次のどれかにすること：annual_share（1年間に経験する人の割合）／period_share（数年間に経験する割合。note に期間）／lifetime_share（生涯や、ある年齢までに経験する割合。note に年齢）／current_share（今その状態にある人の割合）／years_count（過去N年のうち起きた年の数。note に「過去N年」）／count（人数・件数。note に何の数か）／currency（金額。note に通貨）
- 「対象の人」（全人口・成人・働く人・農村の世帯など）を note に必ず書くこと。
- ニュース記事・まとめサイト・Wikipedia は使わないこと。一次資料がどうしても見つからない場合だけ使い、note に「二次情報」と書くこと。
- 途中で回答が長くなりすぎる場合は、そこまでのCSVを出し、どの番号まで終わったかを書くこと。

[Output Format]
1. 次の列のCSVを、```csv のコードブロックで出力すること（1行に1つの数値。列の順番を変えないこと）：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   field は「event_freq:出来事のID」（例：event_freq:jpn_tenkin）とすること。
   例：
   JPN,Japan,event_freq:jpn_tenkin,0.0XX,annual_share,20XX,JILPT,https://www.jil.go.jp/（数字を確認したページ）,対象：正社員。過去1年に転居をともなう転勤をした人の割合
   USA,United States,event_freq:usa_layoff,0.XX,annual_share,20XX,BLS JOLTS,https://www.bls.gov/（数字を確認したページ）,対象：雇用者。Layoffs and discharges の年合計 ÷ 平均雇用者数
2. CSVのあとに、日本語で短い要約を書くこと：
   - 数字が見つかった出来事／見つからなかった出来事と、その理由
   - 指定と定義が違う数字の一覧
   - アクセスできなかったサイト
```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：なし
````

## 付録12. part9e_prompt.md（2026-10-29）

````markdown
# 第9部e：国ごとの出来事の確率（Mexico・Philippines・Egypt、14件）

Gemini の Deep Research（または Perplexity の Research モード）に、下のコードブロックをそのまま貼る。返ってきたCSVは jinsei_receipt_part9e.csv として保存する。

```
[Role]
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を検索し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。目的は、統計にもとづいて「世界にはこういう暮らしがある」と知ってもらうことです。
- ゲームでは、国ごとの出来事（転勤、洪水、通貨の下落など）が、ある確率で起きます。いまの確率は、私がおおよそで決めた推計です。
- これを統計で確かめたいので、出来事ごとに「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字を集めてください。確率への直し方は私が計算します。あなたは数字と出典を集めるだけで構いません。

[Task]
次の出来事について、それぞれ「調べる数字」を探してください。番号順に1つずつ進めてください。
英語と、その国の言葉の両方で検索し、政府統計・国際機関の資料を優先してください。

(1) event_freq:mex_migrate_us　米国へ働きに行く話
    ゲームでの場面：米国で働くいとこから、農場の仕事があると連絡が来た。
    対象の国：MEX（Mexico）
    調べる数字：18〜40歳の人のうち、1年間に米国へ移住した人の割合（INEGI ENOE の国外移住率、CONAPO）

(2) event_freq:mex_security　地域の治安の悪化
    ゲームでの場面：地元で犯罪組織による事件が増え、夜の外出や商売に不安を感じるようになった。
    対象の国：MEX（Mexico）
    調べる数字：18歳以上の人のうち、過去1年に犯罪の被害を受けた人の割合（INEGI ENVIPE）

(3) event_freq:mex_formal_job　社会保険のある仕事
    ゲームでの場面：屋台の仕事より給料は少し低いが、社会保険（IMSS）に入れる工場の仕事を紹介された。
    対象の国：MEX（Mexico）
    調べる数字：インフォーマルで働く人のうち、1年間に社会保険のある仕事に移った人の割合（INEGI ENOE の移動の統計）

(4) event_freq:mex_earthquake　大地震
    ゲームでの場面：強い地震が起き、住んでいる建物の壁にひびが入った。
    対象の国：MEX（Mexico）
    調べる数字：都市の人口のうち、1年間に被害の出た地震の影響を受けた人の割合（過去30年の平均）

(5) event_freq:mex_hurricane　ハリケーン
    ゲームでの場面：大型のハリケーンが上陸し、屋根と家財が被害を受けた。
    対象の国：MEX（Mexico）
    調べる数字：人口のうち、1年間にハリケーンの被害を受けた人の割合（CENAPRED、過去10年の平均）

(6) event_freq:phl_ofw　海外就労（OFW）
    ゲームでの場面：中東の病院や香港の家庭で働く仕事の募集があり、応募するか考えた。
    対象の国：PHL（Philippines）
    調べる数字：22〜45歳の働く人のうち、1年間に海外就労（OFW）に出た人の割合（PSA Survey on Overseas Filipinos、DMW の年間出国者数）

(7) event_freq:phl_typhoon　台風
    ゲームでの場面：強い台風が直撃し、家の屋根が飛ばされた。
    対象の国：PHL（Philippines）
    調べる数字：人口のうち、1年間に台風の被害を受けた人の割合（NDRRMC、過去10年の平均）

(8) event_freq:phl_commute　マニラの通勤
    ゲームでの場面：渋滞がひどく、片道2時間以上かけて通勤している。
    対象の国：PHL（Philippines）
    調べる数字：都市で働く人のうち、片道の通勤時間が1時間以上の人の割合

(9) event_freq:phl_hospital_deposit　入院の前払い金
    ゲームでの場面：家族が入院することになり、病院から前払い金を求められた。
    対象の国：PHL（Philippines）
    調べる数字：人口のうち、1年間に入院した人の割合と、入院のときに前払い金を求められた人の割合

(10) event_freq:egy_pound_drop　ポンドの切り下げ
    ゲームでの場面：エジプト・ポンドが切り下げられ、輸入品の値段が一気に上がった。
    対象の国：EGY（Egypt）
    調べる数字：過去30年のうち、エジプト・ポンドが対米ドルで1年に30%以上下落した年の数

(11) event_freq:egy_bread_subsidy　補助金付きパンの値上げ
    ゲームでの場面：配給カードで買える補助金付きパンの値段が大きく引き上げられた。
    対象の国：EGY（Egypt）
    調べる数字：補助金付きパンを受け取っている人の割合と、過去30年のうち補助金付きパンの価格が引き上げられた年の数

(12) event_freq:egy_tutoring　高校卒業試験と家庭教師
    ゲームでの場面：子どもが高校卒業試験（サナウェイヤ・アンマ）を控え、ほとんどの同級生が私塾に通っている。
    対象の国：EGY（Egypt）
    調べる数字：高校生のうち、私塾・家庭教師を使っている人の割合（CAPMAS の家計調査 HIECS など）

(13) event_freq:egy_gulf_work　湾岸諸国での仕事
    ゲームでの場面：サウジアラビアの会社から、技術者として働かないかと誘われた。
    対象の国：EGY（Egypt）
    調べる数字：22〜45歳の働く人のうち、1年間に湾岸諸国へ働きに出た人の割合

(14) event_freq:egy_marriage_home　結婚と新居の準備
    ゲームでの場面：婚約が決まり、慣習として新郎側が住まいと家具をそろえることを期待されている。
    対象の国：EGY（Egypt）
    調べる数字：結婚した世帯のうち、新居や家具の準備のために借金をした世帯の割合

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に「未掲載」「最新年が2010年以前」など理由を書くこと。
- 指定とぴったり同じ数字がないときは、いちばん近い数字を記録し、note に「指定との違い」（対象の年齢・期間・地域の違いなど）を必ず書くこと。1つの出来事に2つ以上の数字を記録してよい（1行に1つ）。
- 1つの数値ごとに、実際に数字を確認したページのURL（トップページではなく、表・報告書・PDFのページ）と、データの年を必ず記録すること。[1] のような番号ではなく、URLそのものを書くこと。
- 割合は小数で記録すること（例：45.3% → 0.453）。
- unit は次のどれかにすること：annual_share（1年間に経験する人の割合）／period_share（数年間に経験する割合。note に期間）／lifetime_share（生涯や、ある年齢までに経験する割合。note に年齢）／current_share（今その状態にある人の割合）／years_count（過去N年のうち起きた年の数。note に「過去N年」）／count（人数・件数。note に何の数か）／currency（金額。note に通貨）
- 「対象の人」（全人口・成人・働く人・農村の世帯など）を note に必ず書くこと。
- ニュース記事・まとめサイト・Wikipedia は使わないこと。一次資料がどうしても見つからない場合だけ使い、note に「二次情報」と書くこと。
- 途中で回答が長くなりすぎる場合は、そこまでのCSVを出し、どの番号まで終わったかを書くこと。

[Output Format]
1. 次の列のCSVを、```csv のコードブロックで出力すること（1行に1つの数値。列の順番を変えないこと）：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   field は「event_freq:出来事のID」（例：event_freq:jpn_tenkin）とすること。
   例：
   JPN,Japan,event_freq:jpn_tenkin,0.0XX,annual_share,20XX,JILPT,https://www.jil.go.jp/（数字を確認したページ）,対象：正社員。過去1年に転居をともなう転勤をした人の割合
   USA,United States,event_freq:usa_layoff,0.XX,annual_share,20XX,BLS JOLTS,https://www.bls.gov/（数字を確認したページ）,対象：雇用者。Layoffs and discharges の年合計 ÷ 平均雇用者数
2. CSVのあとに、日本語で短い要約を書くこと：
   - 数字が見つかった出来事／見つからなかった出来事と、その理由
   - 指定と定義が違う数字の一覧
   - アクセスできなかったサイト
```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：なし
````

## 付録13. part9f_prompt.md（2026-10-29）

````markdown
# 第9部f：国ごとの出来事の確率（Ethiopia・Democratic Republic of the Congo・Viet Nam、15件）

Gemini の Deep Research（または Perplexity の Research モード）に、下のコードブロックをそのまま貼る。返ってきたCSVは jinsei_receipt_part9f.csv として保存する。

```
[Role]
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を検索し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。目的は、統計にもとづいて「世界にはこういう暮らしがある」と知ってもらうことです。
- ゲームでは、国ごとの出来事（転勤、洪水、通貨の下落など）が、ある確率で起きます。いまの確率は、私がおおよそで決めた推計です。
- これを統計で確かめたいので、出来事ごとに「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字を集めてください。確率への直し方は私が計算します。あなたは数字と出典を集めるだけで構いません。

[Task]
次の出来事について、それぞれ「調べる数字」を探してください。番号順に1つずつ進めてください。
英語と、その国の言葉の両方で検索し、政府統計・国際機関の資料を優先してください。

(1) event_freq:eth_birr_float　ブルの切り下げ
    ゲームでの場面：為替が自由化され、ブルの価値が半分以下になった。
    対象の国：ETH（Ethiopia）
    調べる数字：過去30年のうち、ブルが対米ドルで1年に30%以上下落した年の数

(2) event_freq:eth_drought　干ばつ
    ゲームでの場面：雨季の雨がほとんど降らず、家畜が弱り、畑は乾ききった。
    対象の国：ETH（Ethiopia）
    調べる数字：農村の人口のうち、1年間に干ばつで食料支援を受けた人の割合（OCHA、過去10年の平均）

(3) event_freq:eth_conflict_move　地域の衝突による避難
    ゲームでの場面：住んでいる地域で武力衝突が起き、多くの家族が町を離れはじめた。
    対象の国：ETH（Ethiopia）
    調べる数字：人口のうち、1年間に紛争で新たに国内避難民になった人の割合（IDMC の新規避難者数 ÷ 人口、過去10年の平均）

(4) event_freq:eth_cbhi　地域医療保険への加入
    ゲームでの場面：村で地域医療保険（CBHI）の加入受付があり、年会費を払うか家族で相談した。
    対象の国：ETH（Ethiopia）
    調べる数字：農村の世帯のうち、地域医療保険（CBHI）に入っている世帯の割合

(5) event_freq:eth_gulf_work　中東への出稼ぎ
    ゲームでの場面：仲介業者から、サウジアラビアで家事や建設の仕事があると勧められた。
    対象の国：ETH（Ethiopia）
    調べる数字：18〜35歳の人のうち、1年間に中東へ働きに出た人の割合（労働・技能省の年間出国者数）

(6) event_freq:cod_displacement　東部の衝突による避難
    ゲームでの場面：住んでいる地域の近くで武装勢力の衝突が起き、住民の多くが避難をはじめた。
    対象の国：COD（Democratic Republic of the Congo）
    調べる数字：人口のうち、1年間に紛争で新たに国内避難民になった人の割合（IDMC、過去10年の平均）

(7) event_freq:cod_epidemic　感染症の流行
    ゲームでの場面：地域で、コレラなどの感染症の流行が報告された。
    対象の国：COD（Democratic Republic of the Congo）
    調べる数字：人口のうち、1年間にコレラ・はしかなどの感染症にかかった人の割合（WHO、過去10年の平均）

(8) event_freq:cod_school_fees　学校の費用
    ゲームでの場面：小学校は無償化されたが、制服や教材、教員への謝礼などの出費が続く。
    対象の国：COD（Democratic Republic of the Congo）
    調べる数字：小学生のいる世帯のうち、学校に関わる費用（制服・教材・教員への謝礼など）を払っている世帯の割合と、その年額

(9) event_freq:cod_mining　手掘り鉱山の仕事
    ゲームでの場面：近くでコバルトや金の手掘り鉱山が見つかり、若者が働きに行っている。
    対象の国：COD（Democratic Republic of the Congo）
    調べる数字：農村の16〜50歳の人のうち、手掘りの鉱山で働いている人の割合

(10) event_freq:cod_franc_drop　コンゴ・フランの下落
    ゲームでの場面：フランの価値が下がり、市場の値段がドル建てで決まるようになってきた。
    対象の国：COD（Democratic Republic of the Congo）
    調べる数字：過去30年のうち、コンゴ・フランが対米ドルで1年に20%以上下落した年の数

(11) event_freq:vnm_motorbike　バイクを買う
    ゲームでの場面：通勤や通学のために、自分のバイクを買うことにした。
    対象の国：VNM（Viet Nam）
    調べる数字：18〜30歳の人のうち、自分のバイクを持っている人の割合（または1年間に新しく買う人の割合）

(12) event_freq:vnm_land　土地への投資
    ゲームでの場面：郊外の土地の値段が上がっていると聞き、貯金で土地を買うか迷った。
    対象の国：VNM（Viet Nam）
    調べる数字：30〜60歳が世帯主の世帯のうち、1年間に土地を買った世帯の割合

(13) event_freq:vnm_typhoon_flood　台風と洪水
    ゲームでの場面：台風のあとの大雨で、中部の村が水につかった。
    対象の国：VNM（Viet Nam）
    調べる数字：人口のうち、1年間に台風・洪水の被害を受けた人の割合（過去10年の平均）

(14) event_freq:vnm_factory　工業団地への出稼ぎ
    ゲームでの場面：村の友人がビンズオンの工業団地で働き、仕送りをしていると聞いた。
    対象の国：VNM（Viet Nam）
    調べる数字：農村の18〜35歳の人のうち、1年間に工業団地へ働きに出た人の割合（国内移住調査）

(15) event_freq:vnm_extra_class　補習授業
    ゲームでの場面：子どもの担任の先生が放課後の補習授業を開いており、ほとんどの同級生が通っている。
    対象の国：VNM（Viet Nam）
    調べる数字：小中高生のうち、補習授業（học thêm）に通っている人の割合

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に「未掲載」「最新年が2010年以前」など理由を書くこと。
- 指定とぴったり同じ数字がないときは、いちばん近い数字を記録し、note に「指定との違い」（対象の年齢・期間・地域の違いなど）を必ず書くこと。1つの出来事に2つ以上の数字を記録してよい（1行に1つ）。
- 1つの数値ごとに、実際に数字を確認したページのURL（トップページではなく、表・報告書・PDFのページ）と、データの年を必ず記録すること。[1] のような番号ではなく、URLそのものを書くこと。
- 割合は小数で記録すること（例：45.3% → 0.453）。
- unit は次のどれかにすること：annual_share（1年間に経験する人の割合）／period_share（数年間に経験する割合。note に期間）／lifetime_share（生涯や、ある年齢までに経験する割合。note に年齢）／current_share（今その状態にある人の割合）／years_count（過去N年のうち起きた年の数。note に「過去N年」）／count（人数・件数。note に何の数か）／currency（金額。note に通貨）
- 「対象の人」（全人口・成人・働く人・農村の世帯など）を note に必ず書くこと。
- ニュース記事・まとめサイト・Wikipedia は使わないこと。一次資料がどうしても見つからない場合だけ使い、note に「二次情報」と書くこと。
- 途中で回答が長くなりすぎる場合は、そこまでのCSVを出し、どの番号まで終わったかを書くこと。

[Output Format]
1. 次の列のCSVを、```csv のコードブロックで出力すること（1行に1つの数値。列の順番を変えないこと）：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   field は「event_freq:出来事のID」（例：event_freq:jpn_tenkin）とすること。
   例：
   JPN,Japan,event_freq:jpn_tenkin,0.0XX,annual_share,20XX,JILPT,https://www.jil.go.jp/（数字を確認したページ）,対象：正社員。過去1年に転居をともなう転勤をした人の割合
   USA,United States,event_freq:usa_layoff,0.XX,annual_share,20XX,BLS JOLTS,https://www.bls.gov/（数字を確認したページ）,対象：雇用者。Layoffs and discharges の年合計 ÷ 平均雇用者数
2. CSVのあとに、日本語で短い要約を書くこと：
   - 数字が見つかった出来事／見つからなかった出来事と、その理由
   - 指定と定義が違う数字の一覧
   - アクセスできなかったサイト
```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：なし
````

## 付録14. part9g_prompt.md（2026-10-29）

````markdown
# 第9部g：国ごとの出来事の確率（Republic of Korea・Kenya・共通の出来事、19件）

Gemini の Deep Research（または Perplexity の Research モード）に、下のコードブロックをそのまま貼る。返ってきたCSVは jinsei_receipt_part9g.csv として保存する。

```
[Role]
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を検索し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。目的は、統計にもとづいて「世界にはこういう暮らしがある」と知ってもらうことです。
- ゲームでは、国ごとの出来事（転勤、洪水、通貨の下落など）が、ある確率で起きます。いまの確率は、私がおおよそで決めた推計です。
- これを統計で確かめたいので、出来事ごとに「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字を集めてください。確率への直し方は私が計算します。あなたは数字と出典を集めるだけで構いません。

[Task]
次の出来事について、それぞれ「調べる数字」を探してください。番号順に1つずつ進めてください。
英語と、その国の言葉の両方で検索し、政府統計・国際機関の資料を優先してください。

(1) event_freq:kor_hagwon　学習塾（ハグォン）
    ゲームでの場面：子どもの友人のほとんどが放課後に複数の塾に通っている。
    対象の国：KOR（Republic of Korea）
    調べる数字：小中高生のうち、私教育（塾など）に参加している人の割合（統計庁 私教育費調査）

(2) event_freq:kor_jeonse　チョンセ（伝貰）契約
    ゲームでの場面：新しい部屋を、まとまった保証金を預けて家賃のかからない「チョンセ」で借りるか、月払いの家賃にするか迷った。
    対象の国：KOR（Republic of Korea）
    調べる数字：賃貸世帯のうち、チョンセで借りている世帯の割合と、1年間に新しく賃貸契約を結ぶ世帯の割合

(3) event_freq:kor_suneung　修学能力試験（スヌン）
    ゲームでの場面：大学修学能力試験の結果が出て、志望大学には届かなかった。
    対象の国：KOR（Republic of Korea）
    調べる数字：スヌンの受験者のうち、浪人生など高校卒業後に受ける人の割合（韓国教育課程評価院）

(4) event_freq:kor_early_retire　早期退職の勧め
    ゲームでの場面：会社から希望退職の募集があり、上司から応募を勧められた。
    対象の国：KOR（Republic of Korea）
    調べる数字：48〜56歳の雇用者のうち、1年間に希望退職・早期退職をした人の割合

(5) event_freq:kor_wedding_home　結婚と新居
    ゲームでの場面：結婚を考えているが、ソウルの住宅価格が高く、新居の準備が難しい。
    対象の国：KOR（Republic of Korea）
    調べる数字：結婚を考えている人のうち、住宅費を理由に結婚を延ばした人の割合（保健社会研究院など）

(6) event_freq:ken_mpesa_loan　モバイルマネーの少額ローン
    ゲームでの場面：携帯電話のモバイルマネー（M-Pesa）で、すぐに借りられる少額ローンの案内が届いた。
    対象の国：KEN（Kenya）
    調べる数字：成人のうち、過去1年にモバイル融資（M-Shwari など）を使った人の割合（FinAccess 2024）

(7) event_freq:ken_drought　干ばつ
    ゲームでの場面：雨季の雨が何度も降らず、家畜の牧草と水が足りなくなった。
    対象の国：KEN（Kenya）
    調べる数字：農村の人口のうち、1年間に干ばつで食料が足りなくなった人の割合（NDMA、過去10年の平均）

(8) event_freq:ken_school_fees　中等学校の費用
    ゲームでの場面：子どもが全寮制の中等学校に合格したが、寮費や制服の費用が必要になった。
    対象の国：KEN（Kenya）
    調べる数字：中等学校の生徒のうち、寮のある学校（boarding）に通う人の割合と、寮費などの年額

(9) event_freq:ken_fuel_tax　燃料と交通費の値上がり
    ゲームでの場面：燃料税の引き上げで、乗り合いバス（マタツ）の運賃が上がった。
    対象の国：KEN（Kenya）
    調べる数字：過去20年のうち、ガソリンの価格が1年に20%以上上がった年の数

(10) event_freq:ken_harambee　地域の寄付集め（ハランベー）
    ゲームでの場面：親戚の入院費のために、地域で寄付を集める会が開かれた。
    対象の国：KEN（Kenya）
    調べる数字：成人のうち、過去1年に地域の寄付集め（harambee）や助け合いのグループにお金を出した人の割合（FinAccess）

(11) event_freq:gen_lic_malaria　マラリアにかかる
    ゲームでの場面：高熱が出て、診療所でマラリアと診断された。
    対象の国：所得水準ごとの平均（世界銀行の分類）。iso3 の列には LIC／LMC／UMC／HIC（低所得／低中所得／高中所得／高所得）と書く。国別の値があれば主な数か国も（iso3 は国のコード）
    調べる数字：低所得国の人口のうち、1年間にマラリアにかかった人の割合（WHO World Malaria Report の国別の年間症例数 ÷ 人口。低所得国の平均と、主な国の値）

(12) event_freq:gen_savings_group　頼母子講（積立グループ）
    ゲームでの場面：近所の人たちから、毎月お金を出し合って順番に受け取る積立グループに誘われた。
    対象の国：所得水準ごとの平均（世界銀行の分類）。iso3 の列には LIC／LMC／UMC／HIC（低所得／低中所得／高中所得／高所得）と書く。国別の値があれば主な数か国も（iso3 は国のコード）
    調べる数字：低所得国・低中所得国の成人のうち、過去1年に積立グループ（savings club、ROSCA）でお金を貯めた人の割合（Global Findex の所得水準ごとの値）

(13) event_freq:gen_rural_harvest　不作の年
    ゲームでの場面：天候不順で収穫が例年より大きく減った。
    対象の国：所得水準ごとの平均（世界銀行の分類）。iso3 の列には LIC／LMC／UMC／HIC（低所得／低中所得／高中所得／高所得）と書く。国別の値があれば主な数か国も（iso3 は国のコード）
    調べる数字：低・中所得国の農家世帯のうち、1年間に天候による不作で収入が大きく減った世帯の割合（LSMS、FAO）

(14) event_freq:gen_urban_rent　大家からの退去通知
    ゲームでの場面：建物の建て替えのため、半年以内に部屋を出るよう大家から告げられた。
    対象の国：所得水準ごとの平均（世界銀行の分類）。iso3 の列には LIC／LMC／UMC／HIC（低所得／低中所得／高中所得／高所得）と書く。国別の値があれば主な数か国も（iso3 は国のコード）
    調べる数字：都市で賃貸に住む世帯のうち、1年間に大家の都合で退去を求められた世帯の割合（各国の住宅調査。主な数か国の値）

(15) event_freq:gen_scam_call　巧妙な詐欺の電話
    ゲームでの場面：銀行を名乗る相手から、口座が不正利用されているので手続きをしてほしいと電話があった。
    対象の国：所得水準ごとの平均（世界銀行の分類）。iso3 の列には LIC／LMC／UMC／HIC（低所得／低中所得／高中所得／高所得）と書く。国別の値があれば主な数か国も（iso3 は国のコード）
    調べる数字：成人のうち、過去1年に電話・SMS の詐欺でお金をだまし取られた人の割合（Global Anti-Scam Alliance、各国の犯罪被害調査。主な数か国の値）

(16) event_freq:gen_relative_loan　親戚からの借金の頼み
    ゲームでの場面：親戚から、商売の資金を少し貸してほしいと頼まれた。
    対象の国：所得水準ごとの平均（世界銀行の分類）。iso3 の列には LIC／LMC／UMC／HIC（低所得／低中所得／高中所得／高所得）と書く。国別の値があれば主な数か国も（iso3 は国のコード）
    調べる数字：成人のうち、過去1年に家族・友人からお金を借りた人の割合（Global Findex の所得水準ごとの値）

(17) event_freq:gen_hic_pension　老後資金の積立
    ゲームでの場面：職場で、税の優遇がある積立投資の制度を案内された。
    対象の国：所得水準ごとの平均（世界銀行の分類）。iso3 の列には LIC／LMC／UMC／HIC（低所得／低中所得／高中所得／高所得）と書く。国別の値があれば主な数か国も（iso3 は国のコード）
    調べる数字：高所得国の雇用者のうち、職場の確定拠出年金・税優遇の積立制度に入っている人の割合（OECD Pensions at a Glance）

(18) event_freq:gen_hic_burnout　仕事の燃え尽き
    ゲームでの場面：仕事の量が増え続け、朝起きるのがつらくなってきた。
    対象の国：所得水準ごとの平均（世界銀行の分類）。iso3 の列には LIC／LMC／UMC／HIC（低所得／低中所得／高中所得／高所得）と書く。国別の値があれば主な数か国も（iso3 は国のコード）
    調べる数字：高所得国・高中所得国の働く人のうち、過去1年に仕事のストレスで心身の不調を経験した人の割合（EU-OSHA、Eurofound、ILO）

(19) event_freq:gen_umc_lmc_gig　配達アプリの仕事
    ゲームでの場面：スマホの配達アプリに登録すれば、すぐに働けると聞いた。
    対象の国：所得水準ごとの平均（世界銀行の分類）。iso3 の列には LIC／LMC／UMC／HIC（低所得／低中所得／高中所得／高所得）と書く。国別の値があれば主な数か国も（iso3 は国のコード）
    調べる数字：中所得国の都市で働く人のうち、配達・配車などのアプリの仕事をしている人の割合（ILO）

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に「未掲載」「最新年が2010年以前」など理由を書くこと。
- 指定とぴったり同じ数字がないときは、いちばん近い数字を記録し、note に「指定との違い」（対象の年齢・期間・地域の違いなど）を必ず書くこと。1つの出来事に2つ以上の数字を記録してよい（1行に1つ）。
- 1つの数値ごとに、実際に数字を確認したページのURL（トップページではなく、表・報告書・PDFのページ）と、データの年を必ず記録すること。[1] のような番号ではなく、URLそのものを書くこと。
- 割合は小数で記録すること（例：45.3% → 0.453）。
- unit は次のどれかにすること：annual_share（1年間に経験する人の割合）／period_share（数年間に経験する割合。note に期間）／lifetime_share（生涯や、ある年齢までに経験する割合。note に年齢）／current_share（今その状態にある人の割合）／years_count（過去N年のうち起きた年の数。note に「過去N年」）／count（人数・件数。note に何の数か）／currency（金額。note に通貨）
- 「対象の人」（全人口・成人・働く人・農村の世帯など）を note に必ず書くこと。
- ニュース記事・まとめサイト・Wikipedia は使わないこと。一次資料がどうしても見つからない場合だけ使い、note に「二次情報」と書くこと。
- 途中で回答が長くなりすぎる場合は、そこまでのCSVを出し、どの番号まで終わったかを書くこと。

[Output Format]
1. 次の列のCSVを、```csv のコードブロックで出力すること（1行に1つの数値。列の順番を変えないこと）：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   field は「event_freq:出来事のID」（例：event_freq:jpn_tenkin）とすること。
   例：
   JPN,Japan,event_freq:jpn_tenkin,0.0XX,annual_share,20XX,JILPT,https://www.jil.go.jp/（数字を確認したページ）,対象：正社員。過去1年に転居をともなう転勤をした人の割合
   USA,United States,event_freq:usa_layoff,0.XX,annual_share,20XX,BLS JOLTS,https://www.bls.gov/（数字を確認したページ）,対象：雇用者。Layoffs and discharges の年合計 ÷ 平均雇用者数
2. CSVのあとに、日本語で短い要約を書くこと：
   - 数字が見つかった出来事／見つからなかった出来事と、その理由
   - 指定と定義が違う数字の一覧
   - アクセスできなかったサイト
```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：なし
````

## 付録15. part9h_prompt.md（2026-10-29）

````markdown
# 第9部h：国のリスクで推計のまま残っている値（18か国）

Gemini の Deep Research（または Perplexity の Research モード）に、下のコードブロックをそのまま貼る。返ってきたCSVは jinsei_receipt_part9h.csv として保存する。

```
[Role]
あなたは国際統計の調査アシスタントです。国際機関・政府の一次データを検索し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。目的は、統計にもとづいて「世界にはこういう暮らしがある」と知ってもらうことです。
- 国ごとの治安・暮らしのリスクのうち、下記の国の値がまだ推計のままです。これを公的統計に置き換えたいと考えています。
- 集めた数字はプログラムでそのまま読み込むため、定義・単位・年をそろえることが最優先です。

[Task]
次の3項目について、国別の数値を集めてください。番号順に進めてください。

(1) homicide_rate：故意の殺人の被害者数（人口10万人あたり）
    出典：UNODC（https://dataunodc.un.org/）。なければ WHO Global Health Estimates の interpersonal violence の死亡率
    対象：MDG: Madagascar / CIV: Côte d'Ivoire / MLI: Mali / TCD: Chad / SOM: Somalia / GIN: Guinea / PRK: Democratic People's Republic of Korea / TGO: Togo / COG: Congo

(2) ipv_past12m_women：過去12か月にパートナーから身体的・性的暴力を受けた女性の割合（15〜49歳、パートナーのいたことがある女性）
    出典：WHO Violence Against Women Prevalence Estimates 2018（https://srhr.org/vaw-data/）、なければ DHS
    対象：YEM: Yemen / RUS: Russian Federation / IRN: Iran (Islamic Republic of) / IRQ: Iraq / UZB: Uzbekistan / DZA: Algeria / SOM: Somalia / SAU: Saudi Arabia / SYR: Syrian Arab Republic / MYS: Malaysia / PRK: Democratic People's Republic of Korea / COG: Congo

(3) inflation_recent：消費者物価の上昇率（年平均、%）。1995年から最新年まで、1年1行で記録する
    出典：IMF World Economic Outlook（https://www.imf.org/external/datamapper/PCPIPCH）、なければ World Bank WDI（FP.CPI.TOTL.ZG）や各国の中央銀行・統計局
    対象：SOM: Somalia / PRK: Democratic People's Republic of Korea / SYR: Syrian Arab Republic

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に「未掲載」「最新年が2010年以前」など理由を書くこと。
- 1つの数値ごとに、実際に数字を確認したページのURL（トップページではなく、表・ファイル・国を選んだ状態のページ）と、データの年を必ず記録すること。[1] のような番号ではなく、URLそのものを書くこと。
- (2) の割合は小数で記録すること（例：18.3% → 0.183）。(1) は10万人あたりの数、(3) は%のまま（例：12.5）。
- 指定と違う定義の値しかない場合は、その値を記録したうえで note に定義の違いを明記すること（例：年齢が15歳以上、生涯の割合 など）。
- ニュース記事・まとめサイト・Wikipedia は使わないこと。一次資料がどうしても見つからない場合だけ使い、note に「二次情報」と書くこと。
- 国名の取り違えに注意すること。コンゴ共和国（COG）とコンゴ民主共和国（COD）、北朝鮮（PRK）と韓国（KOR）を取り違えないこと。
- 途中で回答が長くなりすぎる場合は、そこまでのCSVを出し、どの項目のどの国まで終わったかを書くこと。

[Output Format]
1. 次の列のCSVを、```csv のコードブロックで出力すること（1行に1つの数値。列の順番を変えないこと）：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   unit は (1) per100k、(2) share、(3) percent とすること。
   例：
   MLI,Mali,homicide_rate,XX.X,per100k,20XX,WHO Global Health Estimates,https://（数字を確認したページ）,UNODC に未掲載のため WHO の値
   SYR,Syrian Arab Republic,inflation_recent,XX.X,percent,20XX,Central Bank of Syria,https://（数字を確認したページ）,
2. CSVのあとに、日本語で短い要約を書くこと：
   - 項目ごとの取得状況（取得できた国の数／対象の国の数）
   - 取得できなかった国と、その理由
   - 指定と定義が違う値の一覧
   - アクセスできなかったサイト
```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：なし
````

## 付録16. part10_chatgpt.md（2026-10-29）

````markdown
# 第10部：推計のまま残っている出来事29件（ChatGPT の Deep Research 用）

3回に分けています。1回分ずつ、新しいチャットで「Deep Research（詳細なリサーチ）」を選び、コードブロックの中をそのまま貼ってください。返ってきた表は jinsei_receipt_part10_01.csv〜03.csv として保存します。

## 1回目（日本・アメリカ・中国・インド、10件）

```
[Role]
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を探し、出典URL付きで表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国でお金の一生がどう変わるかを体験する教育用ゲーム「人生のレシート」を作っています。
- ゲームの中の出来事は、国ごとに決めた確率で起きます。下の出来事は、別の調査で公式の数字が見つからず、確率が私の推計のままです。
- 各項目の「前回」は、前の調査で分かったことと、足りなかったことです。同じ資料をくり返さず、「代わりの資料」も当たってください。
- 確率への計算は私がします。あなたは数字と出典を集めてください。

[Task]
次の出来事について、番号順に「調べる数字」を探してください。英語とその国の言葉（日本語・中国語・韓国語・アラビア語・ベトナム語など）の両方で検索してください。

(1) event_freq:jpn_tenkin　日本「転勤の辞令」
    調べる数字：正社員のうち、1年間に転居をともなう転勤をした人の割合
    前回：回答者数（5,827人）しか取れなかった
    代わりの資料：労働政策研究・研修機構「企業における転勤の実態に関する調査」(2017) の「正社員に占める転勤者の割合」。国土交通省「住生活総合調査」の住み替え理由「転勤」の世帯数と全世帯数

(2) event_freq:jpn_earthquake　日本「大きな地震」
    調べる数字：1年間に、地震で住宅が被害（全壊・半壊・一部損壊）を受けた世帯の割合（過去20年の平均）
    前回：震度6弱以上が20年で43回、と回数だけ
    代わりの資料：消防庁「災害情報」の地震ごとの住家被害棟数（全壊・半壊・一部破損）の年合計と、総務省「住宅・土地統計調査」の住宅数

(3) event_freq:jpn_chugaku_juken　日本「中学受験」
    調べる数字：小学6年生のうち、私立・国立の中学校を受験する子の割合（全国と首都圏）
    前回：首都圏約2割の数字がまとめサイト経由だった
    代わりの資料：首都圏模試センターの公表値。全国は、文部科学省「学校基本調査」の中学1年生の在籍者数（国立・公立・私立別）

(4) event_freq:usa_student_loan　アメリカ「大学進学と学生ローン」
    調べる数字：高校卒業者のうち4年制大学にすぐ進学する割合と、4年制の学生のうち連邦学生ローンを借りる割合
    前回：進学率0.421が二次情報だった
    代わりの資料：NCES Digest of Education Statistics の immediate college enrollment rate（4年制）、NPSAS の federal loan を借りた学部生の割合

(5) event_freq:usa_layoff　アメリカ「突然のレイオフ」
    調べる数字：雇用者のうち、1年間にレイオフ・解雇された人の割合
    前回：月1%×12の概算だけだった
    代わりの資料：BLS JOLTS の Layoffs and discharges の年合計と平均雇用者数（2015〜2024年の各年）。BLS Displaced Worker Survey の「3年間に会社都合で職を失った人の割合」

(6) event_freq:usa_childcare　アメリカ「保育料の高さ」
    調べる数字：0〜2歳の子どものうち、有料の保育施設（center-based care）を使っている割合
    前回：年間の保育料（15,636ドル）だけで、利用割合がなかった
    代わりの資料：NCES の NHES Early Childhood Program Participation Survey、Census の SIPP Child Care tables

(7) event_freq:chn_unfinished_flat　中国「工事が止まったマンション」
    調べる数字：完成前に買った住宅の工事が止まった戸数 ÷ 都市の世帯数
    前回：公式統計なし
    代わりの資料：住房和城乡建设部などが公表した「保交楼」で引き渡しを支援した戸数、「城市房地产融资协调机制（白名单）」の対象戸数。国家统计局の都市世帯数

(8) event_freq:chn_996　中国「長時間労働の職場」
    調べる数字：都市の雇用者のうち、週の労働時間が48時間超または60時間以上の人の割合
    前回：週60時間以上の割合が見つからなかった
    代わりの資料：国家统计局「中国劳动统计年鉴」の「城镇就业人员工作时间构成」（48小时以上の割合など）、全国の月次の平均週労働時間

(9) event_freq:ind_wedding_cost　インド「結婚式の費用」
    調べる数字：世帯のうち、結婚・儀式のために借金をしている世帯の割合
    前回：全国統計がなかった
    代わりの資料：NSS 77th round「All India Debt and Investment Survey」の借入目的「marriage and ceremonies」、India Human Development Survey（IHDS）の結婚費用と借入

(10) event_freq:ind_crop_failure　インド「雨不足で不作」
    調べる数字：農家世帯のうち、1年間に干ばつ・雨不足で作物の被害を受けた世帯の割合
    前回：報告書に全国の集計がなかった
    代わりの資料：PMFBY（作物保険）の保険金を受け取った農家数 ÷ 加入農家数（年ごと）、農業省「Agricultural Statistics at a Glance」の干ばつ・水害の被害面積 ÷ 作付面積

[Constraints]
- 割合そのものが公表されていなければ、分子の数（年間の人数・件数）と分母の数（対象の人口・世帯数）を、別々の行に unit=count で出すこと。計算は私がする。
- ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（年齢・期間・地域・定義）を note に書くこと。1つの出来事に何行使ってもよい。
- 危険区域の面積や「影響を受けうる人」ではなく、実際に起きた人数・件数を優先すること。
- 数字ごとに、実際に数字を確認したページ（表・報告書・PDF）のURLと、データの年を書くこと。[1] のような番号ではなくURLそのものを書くこと。
- ニュース・まとめサイト・Wikipedia は、一次資料がないときだけ使い、note に「二次情報」と書くこと。
- 割合は小数で書くこと（45.3% → 0.453）。
- 見つからないときだけ value を空欄にし、探した資料名と理由を note に書くこと。

[Output Format]
1. 次の9列のCSVを、1つの csv コードブロックで出すこと（1行に1つの数字）。
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   - field は「event_freq:出来事のID」（例：event_freq:jpn_tenkin）
   - unit は annual_share（1年に経験する割合）／period_share（数年間の割合）／lifetime_share（生涯・ある年齢までの割合）／current_share（今その状態の割合）／years_count（過去N年のうち起きた年の数）／count（人数・件数）／currency（金額）のどれか
   - note には、対象の人（成人・働く人・農村の世帯など）と定義の違いを書く
2. CSVのあとに、日本語で短く：見つかった項目／見つからなかった項目と理由／開けなかったサイト
```

## 2回目（ナイジェリア・パキスタン・ドイツ・フィリピン・エジプト・ベトナム、10件）

```
[Role]
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を探し、出典URL付きで表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国でお金の一生がどう変わるかを体験する教育用ゲーム「人生のレシート」を作っています。
- ゲームの中の出来事は、国ごとに決めた確率で起きます。下の出来事は、別の調査で公式の数字が見つからず、確率が私の推計のままです。
- 各項目の「前回」は、前の調査で分かったことと、足りなかったことです。同じ資料をくり返さず、「代わりの資料」も当たってください。
- 確率への計算は私がします。あなたは数字と出典を集めてください。

[Task]
次の出来事について、番号順に「調べる数字」を探してください。英語とその国の言葉（日本語・中国語・韓国語・アラビア語・ベトナム語など）の両方で検索してください。

(11) event_freq:nga_fuel_price　ナイジェリア「ガソリン代の高騰」
    調べる数字：過去20年のうち、ガソリンの価格が1年で50%以上上がった年の数
    前回：価格の系列が途中で途切れていた
    代わりの資料：NBS「Premium Motor Spirit (Petrol) Price Watch」（2016年以降の月次）、それ以前は PPPRA の公定小売価格の改定（2007・2012・2016・2023年など）

(12) event_freq:nga_japa　ナイジェリア「海外移住（ジャパ）」
    調べる数字：20〜39歳の人のうち、1年間に就労・留学で国外へ移った人の数
    前回：公式統計なし
    代わりの資料：英国 Home Office の国籍別ビザ発給数（Skilled Worker、Health and Care、Study）、カナダ IRCC の国籍別永住・留学許可数、NBS の20〜39歳人口

(13) event_freq:pak_flood　パキスタン「大洪水」
    調べる数字：1年間に洪水の被害を受けた人数（2010〜2024年の各年）と、農村の人口
    前回：農村に限った値がなかった（全人口の数でよい）
    代わりの資料：NDMA の各年の Monsoon Situation Report の affected population、EM-DAT、パキスタン統計局の国勢調査（2017・2023年）の農村人口

(14) event_freq:pak_electricity_bill　パキスタン「電気代の請求額」
    調べる数字：過去15年のうち、家庭用の電気料金が1年に20%以上上がった年の数。あわせて、家計の支出に占める電気代の割合
    前回：公表されていなかった
    代わりの資料：NEPRA の家庭用の基本料金（uniform tariff）の改定の一覧、パキスタン統計局 HIES の支出の内訳

(15) event_freq:pak_heatwave　パキスタン「熱波」
    調べる数字：過去10年のうち、熱波（最高気温45度前後以上が続く）が起きた年の数と、影響を受けた人数
    前回：調べていない
    代わりの資料：パキスタン気象局（PMD）の年次の気候報告、NDMA の熱波の報告、EM-DAT

(16) event_freq:deu_flood　ドイツ「豪雨による洪水」
    調べる数字：1年間に、大雨・洪水で住宅の保険金が支払われた件数（過去10年の各年）と、住宅の数
    前回：保険の加入率しか取れなかった（被害の数ではない）
    代わりの資料：GDV「Naturgefahrenreport」の Starkregen・Überschwemmung の Schadensfälle（件数）、Destatis の住宅（Wohngebäude）数

(17) event_freq:phl_commute　フィリピン「マニラの通勤」
    調べる数字：マニラ首都圏で働く人のうち、片道の通勤時間が1時間以上の人の割合
    前回：1日の移動数だけだった
    代わりの資料：JICA「MUCEP（Metro Manila Urban Transportation Integration Study）」の通勤時間の分布、Social Weather Stations の通勤時間の調査、PSA の調査

(18) event_freq:egy_gulf_work　エジプト「湾岸諸国での仕事」
    調べる数字：1年間に湾岸諸国へ働きに出た人数と、22〜45歳の働く人の数
    前回：1,213人という、桁が合わない数字だった
    代わりの資料：CAPMAS の「海外で働くための労働許可（تصاريح العمل للخارج）」の年間件数、サウジアラビア GASTAT のエジプト人就業者数、CAPMAS の労働力調査

(19) event_freq:egy_marriage_home　エジプト「結婚と新居の準備」
    調べる数字：結婚した世帯のうち、新居・家具の準備のために借金をした世帯の割合
    前回：結婚件数（年93.7万件）だけだった
    代わりの資料：Egypt Labor Market Panel Survey（ELMPS）の結婚費用の調査、Population Council の SYPE（Survey of Young People in Egypt）

(20) event_freq:vnm_land　ベトナム「土地への投資」
    調べる数字：世帯のうち、1年間に土地・住宅を買った世帯の割合
    前回：見つからなかった
    代わりの資料：統計総局（GSO）の家計生活水準調査（VHLSS）、建設省の不動産取引件数（年）、GSO の世帯数

[Constraints]
- 割合そのものが公表されていなければ、分子の数（年間の人数・件数）と分母の数（対象の人口・世帯数）を、別々の行に unit=count で出すこと。計算は私がする。
- ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（年齢・期間・地域・定義）を note に書くこと。1つの出来事に何行使ってもよい。
- 危険区域の面積や「影響を受けうる人」ではなく、実際に起きた人数・件数を優先すること。
- 数字ごとに、実際に数字を確認したページ（表・報告書・PDF）のURLと、データの年を書くこと。[1] のような番号ではなくURLそのものを書くこと。
- ニュース・まとめサイト・Wikipedia は、一次資料がないときだけ使い、note に「二次情報」と書くこと。
- 割合は小数で書くこと（45.3% → 0.453）。
- 見つからないときだけ value を空欄にし、探した資料名と理由を note に書くこと。

[Output Format]
1. 次の9列のCSVを、1つの csv コードブロックで出すこと（1行に1つの数字）。
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   - field は「event_freq:出来事のID」（例：event_freq:jpn_tenkin）
   - unit は annual_share（1年に経験する割合）／period_share（数年間の割合）／lifetime_share（生涯・ある年齢までの割合）／current_share（今その状態の割合）／years_count（過去N年のうち起きた年の数）／count（人数・件数）／currency（金額）のどれか
   - note には、対象の人（成人・働く人・農村の世帯など）と定義の違いを書く
2. CSVのあとに、日本語で短く：見つかった項目／見つからなかった項目と理由／開けなかったサイト
```

## 3回目（韓国・ケニア・共通の出来事、9件）

```
[Role]
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を探し、出典URL付きで表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国でお金の一生がどう変わるかを体験する教育用ゲーム「人生のレシート」を作っています。
- ゲームの中の出来事は、国ごとに決めた確率で起きます。下の出来事は、別の調査で公式の数字が見つからず、確率が私の推計のままです。
- 各項目の「前回」は、前の調査で分かったことと、足りなかったことです。同じ資料をくり返さず、「代わりの資料」も当たってください。
- 確率への計算は私がします。あなたは数字と出典を集めてください。

[Task]
次の出来事について、番号順に「調べる数字」を探してください。英語とその国の言葉（日本語・中国語・韓国語・アラビア語・ベトナム語など）の両方で検索してください。

(21) event_freq:kor_jeonse　韓国「チョンセ（伝貰）契約」
    調べる数字：賃貸世帯のうち、チョンセで借りている世帯の割合と、1年間に新しく賃貸契約を結ぶ（引っ越す）世帯の割合
    前回：ソウルのオフィステルの値だけだった
    代わりの資料：国土交通部「주거실태조사」の 전세 の割合、現住宅での居住期間が1年未満の賃貸世帯の割合

(22) event_freq:kor_early_retire　韓国「早期退職の勧め」
    調べる数字：50代の雇用者のうち、1年間に希望退職・勧告退職・整理解雇で職を離れた人の割合
    前回：調べていない
    代わりの資料：統計庁「경제활동인구조사 고령층 부가조사」の「가장 오래 근무한 일자리를 그만둔 이유」（권고사직・명예퇴직・정리해고の割合）と人数

(23) event_freq:kor_wedding_home　韓国「結婚と新居」
    調べる数字：未婚の人のうち、結婚しない・延ばす理由に「住宅・結婚資金の不足」を挙げた人の割合
    前回：調べていない
    代わりの資料：統計庁「사회조사」の「결혼을 하지 않는 이유」、保健社会研究院「가족과 출산 조사」

(24) event_freq:ken_school_fees　ケニア「中等学校の費用」
    調べる数字：中等学校の生徒のうち、寮のある学校（boarding）に通う生徒の割合
    前回：寮費の金額（年7.6万シリング）だけだった
    代わりの資料：教育省「Basic Education Statistical Booklet」の boarding と day の生徒数、KNBS の調査

(25) event_freq:ken_fuel_tax　ケニア「燃料と交通費の値上がり」
    調べる数字：過去20年のうち、ナイロビのガソリン価格（年平均）が1年に20%以上上がった年の数
    前回：調べていない
    代わりの資料：EPRA（旧 ERC）の毎月の上限価格の公表、KNBS の CPI の燃料の項目

(26) event_freq:gen_rural_harvest　共通（所得の低い国・中くらいの国）「不作の年」
    調べる数字：農家世帯のうち、過去12か月に干ばつ・洪水・不作の打撃を受けた世帯の割合（国ごと）
    前回：調べていない
    代わりの資料：世界銀行 LSMS-ISA の shocks モジュール（エチオピア・ナイジェリア・マラウイ・タンザニア・ウガンダ・ニジェールなど）、FAO の報告

(27) event_freq:gen_urban_rent　共通（主な数か国）「大家からの退去通知」
    調べる数字：都市の賃貸世帯のうち、1年間に大家の都合で退去を求められた世帯の割合
    前回：調べていない
    代わりの資料：英国 English Housing Survey の「借家を出た理由：大家の求め」、米国 Census の American Housing Survey の forced to move、ドイツ・ブラジル・南アフリカなどの住宅調査

(28) event_freq:gen_scam_call　共通（主な数か国）「巧妙な詐欺の電話」
    調べる数字：成人のうち、過去1年に電話・SMS・ネットの詐欺でお金を取られた人の割合
    前回：調べていない
    代わりの資料：Global Anti-Scam Alliance「Global State of Scams」の国別の「お金を失った人の割合」、英国 Crime Survey for England and Wales の fraud、米国 FTC、各国の犯罪被害調査

(29) event_freq:gen_umc_lmc_gig　共通（所得が中くらいの国）「配達アプリの仕事」
    調べる数字：都市で働く人のうち、配達・配車などのアプリの仕事をしている人の割合
    前回：調べていない
    代わりの資料：ブラジル IBGE の PNAD「Teletrabalho e trabalho por meio de plataformas digitais」、インド NITI Aayog「India's Booming Gig and Platform Economy」、インドネシア・メキシコの労働力調査、ILO の報告

[Constraints]
- 割合そのものが公表されていなければ、分子の数（年間の人数・件数）と分母の数（対象の人口・世帯数）を、別々の行に unit=count で出すこと。計算は私がする。
- ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（年齢・期間・地域・定義）を note に書くこと。1つの出来事に何行使ってもよい。
- 危険区域の面積や「影響を受けうる人」ではなく、実際に起きた人数・件数を優先すること。
- 数字ごとに、実際に数字を確認したページ（表・報告書・PDF）のURLと、データの年を書くこと。[1] のような番号ではなくURLそのものを書くこと。
- ニュース・まとめサイト・Wikipedia は、一次資料がないときだけ使い、note に「二次情報」と書くこと。
- 割合は小数で書くこと（45.3% → 0.453）。
- 見つからないときだけ value を空欄にし、探した資料名と理由を note に書くこと。

[Output Format]
1. 次の9列のCSVを、1つの csv コードブロックで出すこと（1行に1つの数字）。
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   - field は「event_freq:出来事のID」（例：event_freq:jpn_tenkin）
   - unit は annual_share（1年に経験する割合）／period_share（数年間の割合）／lifetime_share（生涯・ある年齢までの割合）／current_share（今その状態の割合）／years_count（過去N年のうち起きた年の数）／count（人数・件数）／currency（金額）のどれか
   - note には、対象の人（成人・働く人・農村の世帯など）と定義の違いを書く
2. CSVのあとに、日本語で短く：見つかった項目／見つからなかった項目と理由／開けなかったサイト
```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：なし
````

## 付録17. part11_manus.md（2026-10-29）

````markdown
# 第11部：新しい出来事の候補を統計で確かめる（Manus 用）

専門家の話し合いで残った候補（◎14件・○13件）のうち、ゲームにまだないものを4回に分けています。
「脳卒中・心臓の病気」はすでにゲームにあるため外しました（「心臓や脳の病気で入院した」）。公務員と不妊治療もすでにあるので、職業の給料と国による制度の違いだけを調べます。
1回分ずつ、新しいタスクとして、コードブロックの中をそのまま貼ってください。返ってきたCSVは、ファイル名のとおり data/world/manual/ に置きます。

## 1回目：88か国の国際統計（交通事故・お産・児童労働・口座・労災・国の支え・認知症・高齢の一人暮らし）

```
[Role]
あなたは国際統計の調査アシスタントです。政府・国際機関（WHO、世界銀行、ILO、UNICEF、UNESCO、OECD など）の一次資料を探し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。目的は、統計にもとづいて「生まれた場所で、起きやすいことが違う」と知ってもらうことです。
- ゲームに新しい出来事を足す前に、その出来事が「どのくらいの割合で起きるか」「いくらかかるか」を、国ごとの統計で確かめたいと考えています。統計が見つからない出来事は、ゲームに入れません。
- 集めた数字はプログラムで読み込むため、書き方をそろえることが最優先です。確率への計算は私がします。あなたは数字と出典を集めてください。

[Task]
次の項目を、ゲームに出てくる88か国すべてについて集めてください。どれも国際機関の表から国ごとに取れる指標です。項目ごとに88か国を埋めてから、次の項目に進んでください。

対象88か国（ISO3）：
IND CHN NGA PAK IDN COD ETH USA BGD BRA EGY TZA MEX PHL UGA SDN KEN AFG VNM YEM AGO MOZ RUS ZAF IRN IRQ NER MDG CIV CMR TUR MLI UZB DZA MMR GHA TCD SOM JPN BFA COL DEU GBR ZMB FRA MWI MAR THA NPL SAU PER SEN SYR ARG ZWE GIN BEN BDI MYS VEN KAZ RWA ITA GTM KHM CAN PRK SSD ESP AUS POL TJK ECU TGO BOL SLE HTI PNG LKA CAF JOR HND KOR UKR DOM COG ISR CHL
（国の英語名は、各データベースの表記で構いません。COD はコンゴ民主共和国、COG はコンゴ共和国、PRK は北朝鮮、KOR は韓国です。取り違えないこと）

(1) road_traffic_death_rate：交通事故で亡くなる人（人口10万人あたり、per100k）。出典：WHO Global Status Report on Road Safety 2023 の推計値（GHO）
(2) maternal_mortality_ratio：妊娠・出産で亡くなる女性（出生10万あたり、per100k）。出典：WHO・UNICEF・UNFPA・世界銀行・国連の共同推計（MMEIG、2020年以降の最新）。あわせて maternal_death_lifetime_risk（15歳の女性が生涯に妊娠・出産で亡くなる確率、share）があれば記録
(3) child_labour_share：5〜17歳の子どものうち、児童労働をしている割合（share）。出典：UNICEF Data（MICS・DHS をもとにした SDG 8.7.1）、ILO
(4) account_ownership：15歳以上のうち、銀行やモバイルマネーの口座を持つ人の割合（share）。出典：世界銀行 Global Findex（2025年版があればそれ、なければ2021年版）
(5) fatal_occupational_injury_rate：働く人10万人あたりの、仕事中の事故で亡くなった人（per100k）。出典：ILOSTAT（SDG 8.8.1）。あわせて nonfatal_occupational_injury_rate（仕事中のけが、働く人10万人あたり）があれば記録
(6) social_assistance_coverage_q1：所得が一番低い2割の人のうち、生活保護や現金給付などの社会扶助を受けている人の割合（share）。出典：世界銀行 ASPIRE。あわせて social_protection_coverage（何らかの社会保障の給付を受けている人の割合、ILO の SDG 1.3.1）
(7) dementia_prevalence_65plus：65歳以上のうち、認知症の人の割合（share）。出典：WHO Global Dementia Observatory、なければ IHME の世界の疾病負担（GBD）の推計
(8) older_living_alone_share：65歳以上のうち、一人で暮らしている人の割合（share）。出典：国連経済社会局「Database on the Living Arrangements of Older Persons」、各国の国勢調査

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に理由（未掲載、最新が2010年より前 など）を書くこと。
- 割合そのものがない場合は、分子の数（人数・件数）と分母の数（人口・世帯数など）を、別々の行に unit=count で記録すること。計算は私がする。
- 指定とぴったり同じ数字がないときは、いちばん近い数字を記録し、note に「指定との違い」（年齢・期間・地域・定義の違い）を必ず書くこと。
- 1つの数値ごとに、実際に数字を確認したページ（表・報告書・PDF・データベースの該当ページ。トップページではない）のURLと、データの年を記録すること。
- 国際機関のデータベース（WHO GHO、World Bank WDI、ILOSTAT、UNICEF Data など）から表をまとめて取れる項目は、ダウンロードした表から全部の国を記録してよい。その場合 source_url はその指標のページにする。
- 割合は小数で記録すること（45.3% → 0.453）。
- ニュース記事・まとめサイト・Wikipedia は、一次資料がどうしても見つからない場合だけ使い、note の最後に「二次情報」と書くこと。
- 一番新しい年の値を1つ記録すること（年ごとの系列はいらない）。2010年より前の値しかない場合は、その値を記録し note に書くこと。
- 途中で作業が止まりそうな場合は、そこまでのCSVを出力し、どの項目・どの国まで終わったかを明記すること。

[Output Format]
1. CSVファイル（ファイル名：jinsei_receipt_part11a.csv、UTF-8）。列は次の順にすること（1行に1つの数値）：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   - field は下の [Task] に書いた名前をそのまま使うこと
   - unit は share（割合）／per100k（10万人あたり）／ratio（倍率）／count（人数・件数）／現地通貨のコード（JPY・USD など。金額のとき）／status（制度の有無。value は 1=ある・0.5=一部・0=ない）のどれか
   - note には、対象の人（成人・15歳以上・働く人 など）と定義の違いを日本語で書く
   例（書き方を示す仮の値です。使わないこと）：
   JPN,Japan,road_traffic_death_rate,0.0,per100k,2021,WHO Global Health Observatory,https://www.who.int/data/gho/data/indicators/indicator-details/GHO/estimated-road-traffic-death-rate-(per-100-000-population),対象：全人口。WHO の推計値
2. チャット内に、日本語で短く要約を書くこと：
   - 項目ごとに、値が見つかった国の数と、見つからなかった国
   - 定義が指定と違う数字の一覧
   - 開けなかったサイト

```

## 2回目：主要20か国（医師・留学・ひとり親・病気で働けない・職業の給料・歯や目の治療）

```
[Role]
あなたは国際統計の調査アシスタントです。政府・国際機関（WHO、世界銀行、ILO、UNICEF、UNESCO、OECD など）の一次資料を探し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。目的は、統計にもとづいて「生まれた場所で、起きやすいことが違う」と知ってもらうことです。
- ゲームに新しい出来事を足す前に、その出来事が「どのくらいの割合で起きるか」「いくらかかるか」を、国ごとの統計で確かめたいと考えています。統計が見つからない出来事は、ゲームに入れません。
- 集めた数字はプログラムで読み込むため、書き方をそろえることが最優先です。確率への計算は私がします。あなたは数字と出典を集めてください。

[Task]
次の項目を、主要20か国について集めてください。1か国ずつではなく、1項目ずつ20か国を埋めてから、次の項目に進んでください。

対象20か国（ISO3：英語名）：
IND: India / CHN: China / NGA: Nigeria / PAK: Pakistan / IDN: Indonesia / COD: Democratic Republic of the Congo / ETH: Ethiopia / USA: United States / BGD: Bangladesh / BRA: Brazil / EGY: Egypt / MEX: Mexico / PHL: Philippines / KEN: Kenya / VNM: Viet Nam / JPN: Japan / DEU: Germany / GBR: United Kingdom / FRA: France / KOR: Republic of Korea

(1) 医師を目指す
  - med_school_entrants_share：その年の18〜19歳のうち、医学部（医師になる課程）に入学した人の割合（share）。なければ「医学部の入学者数」と「18歳人口」を count で
  - doctor_wage_ratio：医師の平均の年収 ÷ 働く人全体の平均の年収（ratio）。出典：OECD Health Statistics（Remuneration of health professionals）、各国の賃金統計
  - med_student_high_income_share：医学部の学生のうち、家庭の年収が上位2割（または一番上の区分）の学生の割合（share）。日本は日本学生支援機構「学生生活調査」の学部別の家庭の年収。ほかの国は調査があれば
(2) 留学する
  - outbound_mobility_ratio：大学生などのうち、外国の大学に在籍している人の割合（share）。出典：UNESCO Institute for Statistics（Outbound mobility ratio）
  - study_abroad_annual_cost：その国から多い留学先での、1年間の学費と生活費の目安（現地通貨または USD）。note に留学先の国を書く
  - 日本だけ：study_abroad_by_income：家庭の年収の区分ごとの、留学する学生の割合（日本学生支援機構、文部科学省の調査）
(3) ひとり親になる
  - single_parent_household_share：18歳未満の子どもがいる世帯のうち、ひとり親の世帯の割合（share）。出典：OECD Family Database、国連の家族統計、各国の国勢調査
  - single_parent_poverty_rate：ひとり親世帯の相対的貧困率（share）。出典：OECD Family Database、日本は厚生労働省「国民生活基礎調査」
(4) 病気で長く働けなくなる（心の病気を含む）
  - sickness_benefit_status：病気で働けない間に、国の制度で給料の一部が補償されるか（status：1=ある・0.5=一部の人だけ・0=ない）。note に補償の割合と期間。出典：ILO World Social Protection Report、ISSA・米国社会保障庁「Social Security Programs Throughout the World」
  - long_sick_leave_share：働く人のうち、1年間に1か月以上続けて病気で休んだ人の割合（share）。日本は厚生労働省「労働安全衛生調査」の、メンタルヘルスの不調で1か月以上休んだ人の割合も記録
(5) よくある職業の給料を細かくする
  - wage_ratio_teacher・wage_ratio_nurse・wage_ratio_civil_servant・wage_ratio_factory_worker・wage_ratio_driver：それぞれの職業の平均の給料 ÷ 働く人全体の平均（ratio）。出典：ILOSTAT の職業別の平均月収（ISCO の分類）、OECD Education at a Glance（教員）、各国の賃金統計
(6) 歯や目など、身近な治療の費用
  - dental_public_coverage：大人の歯の治療に、公的な保険が使えるか（status：1=ほぼ使える・0.5=一部・0=使えない）。出典：OECD Health at a Glance、WHO の報告
  - dental_visit_cost：歯の治療（虫歯の治療1本など）の、自分で払う費用の目安（現地通貨）。note に何の治療か
  - glasses_cost：めがね1本の費用の目安と、公的な補助の有無（現地通貨。note に補助）

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に理由（未掲載、最新が2010年より前 など）を書くこと。
- 割合そのものがない場合は、分子の数（人数・件数）と分母の数（人口・世帯数など）を、別々の行に unit=count で記録すること。計算は私がする。
- 指定とぴったり同じ数字がないときは、いちばん近い数字を記録し、note に「指定との違い」（年齢・期間・地域・定義の違い）を必ず書くこと。
- 1つの数値ごとに、実際に数字を確認したページ（表・報告書・PDF・データベースの該当ページ。トップページではない）のURLと、データの年を記録すること。
- 国際機関のデータベース（WHO GHO、World Bank WDI、ILOSTAT、UNICEF Data など）から表をまとめて取れる項目は、ダウンロードした表から全部の国を記録してよい。その場合 source_url はその指標のページにする。
- 割合は小数で記録すること（45.3% → 0.453）。
- ニュース記事・まとめサイト・Wikipedia は、一次資料がどうしても見つからない場合だけ使い、note の最後に「二次情報」と書くこと。
- 一番新しい年の値を1つ記録すること（年ごとの系列はいらない）。2010年より前の値しかない場合は、その値を記録し note に書くこと。
- 途中で作業が止まりそうな場合は、そこまでのCSVを出力し、どの項目・どの国まで終わったかを明記すること。

[Output Format]
1. CSVファイル（ファイル名：jinsei_receipt_part11b.csv、UTF-8）。列は次の順にすること（1行に1つの数値）：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   - field は下の [Task] に書いた名前をそのまま使うこと
   - unit は share（割合）／per100k（10万人あたり）／ratio（倍率）／count（人数・件数）／現地通貨のコード（JPY・USD など。金額のとき）／status（制度の有無。value は 1=ある・0.5=一部・0=ない）のどれか
   - note には、対象の人（成人・15歳以上・働く人 など）と定義の違いを日本語で書く
   例（書き方を示す仮の値です。使わないこと）：
   JPN,Japan,road_traffic_death_rate,0.0,per100k,2021,WHO Global Health Observatory,https://www.who.int/data/gho/data/indicators/indicator-details/GHO/estimated-road-traffic-death-rate-(per-100-000-population),対象：全人口。WHO の推計値
2. チャット内に、日本語で短く要約を書くこと：
   - 項目ごとに、値が見つかった国の数と、見つからなかった国
   - 定義が指定と違う数字の一覧
   - 開けなかったサイト

```

## 3回目：主要20か国（海外移住・障害・同性のパートナー・給料の差・依存・不妊治療・犯罪の被害・宗教のお金・ペット）

```
[Role]
あなたは国際統計の調査アシスタントです。政府・国際機関（WHO、世界銀行、ILO、UNICEF、UNESCO、OECD など）の一次資料を探し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。目的は、統計にもとづいて「生まれた場所で、起きやすいことが違う」と知ってもらうことです。
- ゲームに新しい出来事を足す前に、その出来事が「どのくらいの割合で起きるか」「いくらかかるか」を、国ごとの統計で確かめたいと考えています。統計が見つからない出来事は、ゲームに入れません。
- 集めた数字はプログラムで読み込むため、書き方をそろえることが最優先です。確率への計算は私がします。あなたは数字と出典を集めてください。

[Task]
次の項目を、主要20か国について集めてください。1項目ずつ20か国を埋めてから、次の項目に進んでください。これらは扱いに配慮が必要なため、制度や割合の「事実」だけを記録し、良い・悪いの評価は書かないでください。

対象20か国（ISO3：英語名）：
IND: India / CHN: China / NGA: Nigeria / PAK: Pakistan / IDN: Indonesia / COD: Democratic Republic of the Congo / ETH: Ethiopia / USA: United States / BGD: Bangladesh / BRA: Brazil / EGY: Egypt / MEX: Mexico / PHL: Philippines / KEN: Kenya / VNM: Viet Nam / JPN: Japan / DEU: Germany / GBR: United Kingdom / FRA: France / KOR: Republic of Korea

(1) 海外に移り住んで暮らす
  - emigrant_stock_share：その国で生まれ、外国に住んでいる人 ÷ その国の人口（share）。出典：国連経済社会局 International Migrant Stock 2024
  - emigrant_top_destinations：行き先の上位3か国（value は空欄、note に「国名=人数」を3つ）
(2) 障害がある・障害を負う
  - disability_prevalence：重い障害がある人の割合（share）。出典：WHO Global Report on Health Equity for Persons with Disabilities 2022、各国の調査（ワシントン・グループの設問）
  - disability_benefit_coverage：重い障害がある人のうち、障害の給付を受けている人の割合（share）。出典：ILO（SDG 1.3.1）
  - disability_employment_gap：障害がある人とない人の、働いている割合の差（share）。出典：OECD、国連の報告
(3) 同性のパートナーと暮らす
  - same_sex_union_status：同性のパートナーの結婚、またはそれに近い登録が法律で認められているか（status：1=結婚・0.5=登録や一部の地域のみ・0=なし）。note に制度の名前と始まった年。出典：各国の法律、ILGA World の報告
(4) 性別による給料の差
  - gender_pay_gap：男性と女性の給料の差（男性の中央値に対する差の割合、share）。出典：ILO Global Wage Report、OECD Employment Database
  - 米国・英国・ブラジルだけ：ethnic_pay_gap：人種・民族による給料の差（note にどの集団の比較か）。各国の統計局
(5) お酒・ギャンブルへの依存
  - alcohol_use_disorder_share：15歳以上のうち、アルコール使用障害の人の割合（share）。出典：WHO Global Status Report on Alcohol and Health and Treatment of Substance Use Disorders 2024
  - problem_gambling_share：成人のうち、問題のあるギャンブルの人の割合（share）。国の調査がある国だけ（日本は久里浜医療センターの調査など）
(6) 不妊治療
  - ivf_public_funding_status：体外受精に公的な保険や補助が使えるか（status：1=使える・0.5=一部・0=使えない）。note に回数や年齢の条件
  - ivf_cycle_cost：体外受精1回の費用の目安（現地通貨、補助を受ける前）
  - art_birth_share：生まれた子のうち、体外受精などで生まれた子の割合（share）。出典：ICMART、ESHRE、各国の学会
(7) 犯罪の被害
  - burglary_victim_share：1年間に空き巣・住居侵入の被害にあった世帯の割合（share）
  - robbery_victim_share：1年間に強盗・ひったくりの被害にあった人の割合（share）
    出典：各国の犯罪被害調査（米国 NCVS、英国 CSEW、日本の法務総合研究所「犯罪被害実態調査」、メキシコ ENVIPE など）、UNODC
(8) 宗教の行事・寄付のお金
  - religious_spending_share：家計の支出のうち、宗教の行事や寄付（お布施・献金・ザカートなど）に使う割合（share）。出典：各国の家計調査。note に何が含まれるか
(9) ペットを飼う
  - pet_household_share：犬または猫を飼っている世帯の割合（share）
  - pet_annual_cost：犬1匹を飼う1年間の費用の目安（現地通貨）。出典：各国の業界団体・統計局（二次情報なら note に書く）

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に理由（未掲載、最新が2010年より前 など）を書くこと。
- 割合そのものがない場合は、分子の数（人数・件数）と分母の数（人口・世帯数など）を、別々の行に unit=count で記録すること。計算は私がする。
- 指定とぴったり同じ数字がないときは、いちばん近い数字を記録し、note に「指定との違い」（年齢・期間・地域・定義の違い）を必ず書くこと。
- 1つの数値ごとに、実際に数字を確認したページ（表・報告書・PDF・データベースの該当ページ。トップページではない）のURLと、データの年を記録すること。
- 国際機関のデータベース（WHO GHO、World Bank WDI、ILOSTAT、UNICEF Data など）から表をまとめて取れる項目は、ダウンロードした表から全部の国を記録してよい。その場合 source_url はその指標のページにする。
- 割合は小数で記録すること（45.3% → 0.453）。
- ニュース記事・まとめサイト・Wikipedia は、一次資料がどうしても見つからない場合だけ使い、note の最後に「二次情報」と書くこと。
- 一番新しい年の値を1つ記録すること（年ごとの系列はいらない）。2010年より前の値しかない場合は、その値を記録し note に書くこと。
- 途中で作業が止まりそうな場合は、そこまでのCSVを出力し、どの項目・どの国まで終わったかを明記すること。

[Output Format]
1. CSVファイル（ファイル名：jinsei_receipt_part11c.csv、UTF-8）。列は次の順にすること（1行に1つの数値）：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   - field は下の [Task] に書いた名前をそのまま使うこと
   - unit は share（割合）／per100k（10万人あたり）／ratio（倍率）／count（人数・件数）／現地通貨のコード（JPY・USD など。金額のとき）／status（制度の有無。value は 1=ある・0.5=一部・0=ない）のどれか
   - note には、対象の人（成人・15歳以上・働く人 など）と定義の違いを日本語で書く
   例（書き方を示す仮の値です。使わないこと）：
   JPN,Japan,road_traffic_death_rate,0.0,per100k,2021,WHO Global Health Observatory,https://www.who.int/data/gho/data/indicators/indicator-details/GHO/estimated-road-traffic-death-rate-(per-100-000-population),対象：全人口。WHO の推計値
2. チャット内に、日本語で短く要約を書くこと：
   - 項目ごとに、値が見つかった国の数と、見つからなかった国
   - 定義が指定と違う数字の一覧
   - 開けなかったサイト

```

## 4回目：日本だけの候補（スポーツ選手・不登校・自己破産）と、聞き直し3件

```
[Role]
あなたは国際統計の調査アシスタントです。政府・国際機関（WHO、世界銀行、ILO、UNICEF、UNESCO、OECD など）の一次資料を探し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。目的は、統計にもとづいて「生まれた場所で、起きやすいことが違う」と知ってもらうことです。
- ゲームに新しい出来事を足す前に、その出来事が「どのくらいの割合で起きるか」「いくらかかるか」を、国ごとの統計で確かめたいと考えています。統計が見つからない出来事は、ゲームに入れません。
- 集めた数字はプログラムで読み込むため、書き方をそろえることが最優先です。確率への計算は私がします。あなたは数字と出典を集めてください。

[Task]
次の項目を集めてください。前半は日本だけの項目、後半は、前に別の調査で数字が足りなかった3件の聞き直しです。

【日本だけ】
(1) スポーツ選手を目指す（JPN）
  - pro_athlete_entrants：1年間に新しくプロになった人数（プロ野球のドラフトと育成、Jリーグの新人登録など。競技ごとに1行、count）と、その年の22歳人口（count）
  - pro_athlete_career_years：プロ野球選手・Jリーガーの平均の在籍年数
  - pro_athlete_salary_median：プロ野球選手・Jリーガーの年俸の中央値（JPY。なければ平均と note に書く）
  - post_career_income：引退後の仕事と収入が分かる調査（日本プロ野球選手会、Jリーグのキャリア調査など）
(2) 不登校（JPN）
  - futoko_share：小学生・中学生・高校生のうち、1年間に不登校（年30日以上の欠席）になった子の割合（share、学校の段階ごとに1行）。出典：文部科学省「児童生徒の問題行動・不登校等生徒指導上の諸課題に関する調査」
  - futoko_after_path：不登校だった中学3年生の、その後の進学・就職の割合（文部科学省「不登校に関する実態調査」）
(3) 借金の保証人・自己破産（JPN）
  - bankruptcy_rate：1年間の個人の自己破産の件数（count）と成人人口（count）。出典：最高裁判所「司法統計年報」
  - bankruptcy_guarantor_reason_share：自己破産の理由のうち「保証債務」の割合（share）。出典：日本弁護士連合会「破産事件及び個人再生事件記録調査」

【聞き直し：数字が足りなかった3件】
(4) event_freq:jpn_earthquake（JPN）：2005〜2024年の各年について、地震で被害を受けた住宅の棟数の合計（全壊・半壊・一部破損、count）。出典：消防庁「災害情報」、内閣府の被害状況。あわせて、住宅の数（総務省「住宅・土地統計調査」、count）
(5) event_freq:nga_japa（NGA）：2019〜2024年の各年について、ナイジェリア国籍の人に出された英国の就労ビザ（Skilled Worker、Health and Care Worker）と留学ビザの数（count、英国 Home Office の Immigration system statistics）。あわせてナイジェリアの20〜39歳の人口（count、国連 World Population Prospects 2024）
(6) event_freq:ken_fuel_tax（KEN）：2005〜2024年の各年について、ケニアのガソリンの年平均の小売価格（KES、KNBS の Economic Survey または Statistical Abstract、EPRA の公表）。1年1行

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に理由（未掲載、最新が2010年より前 など）を書くこと。
- 割合そのものがない場合は、分子の数（人数・件数）と分母の数（人口・世帯数など）を、別々の行に unit=count で記録すること。計算は私がする。
- 指定とぴったり同じ数字がないときは、いちばん近い数字を記録し、note に「指定との違い」（年齢・期間・地域・定義の違い）を必ず書くこと。
- 1つの数値ごとに、実際に数字を確認したページ（表・報告書・PDF・データベースの該当ページ。トップページではない）のURLと、データの年を記録すること。
- 国際機関のデータベース（WHO GHO、World Bank WDI、ILOSTAT、UNICEF Data など）から表をまとめて取れる項目は、ダウンロードした表から全部の国を記録してよい。その場合 source_url はその指標のページにする。
- 割合は小数で記録すること（45.3% → 0.453）。
- ニュース記事・まとめサイト・Wikipedia は、一次資料がどうしても見つからない場合だけ使い、note の最後に「二次情報」と書くこと。
- 一番新しい年の値を1つ記録すること（年ごとの系列はいらない）。2010年より前の値しかない場合は、その値を記録し note に書くこと。
- 途中で作業が止まりそうな場合は、そこまでのCSVを出力し、どの項目・どの国まで終わったかを明記すること。

[Output Format]
1. CSVファイル（ファイル名：jinsei_receipt_part11d.csv、UTF-8）。列は次の順にすること（1行に1つの数値）：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   - field は下の [Task] に書いた名前をそのまま使うこと
   - unit は share（割合）／per100k（10万人あたり）／ratio（倍率）／count（人数・件数）／現地通貨のコード（JPY・USD など。金額のとき）／status（制度の有無。value は 1=ある・0.5=一部・0=ない）のどれか
   - note には、対象の人（成人・15歳以上・働く人 など）と定義の違いを日本語で書く
   例（書き方を示す仮の値です。使わないこと）：
   JPN,Japan,road_traffic_death_rate,0.0,per100k,2021,WHO Global Health Observatory,https://www.who.int/data/gho/data/indicators/indicator-details/GHO/estimated-road-traffic-death-rate-(per-100-000-population),対象：全人口。WHO の推計値
2. チャット内に、日本語で短く要約を書くこと：
   - 項目ごとに、値が見つかった国の数と、見つからなかった国
   - 定義が指定と違う数字の一覧
   - 開けなかったサイト

```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：なし
````

## 付録18. part11c_gemini.md（2026-10-30）

````markdown
# 第11部の3回目：Manus が止まった分を、Gemini の Deep Research で調べる

3つに分けています。1回分ずつ、新しいチャットで「Deep Research」を選んでから、区切り線の間の文をそのまま貼ってください。返ってきた表は jinsei_receipt_part11c_1〜3.csv として保存します。

## 1回目（海外移住・障害・同性のパートナー）

----- ここから -----
あなたは国際統計の調査アシスタントです。政府・国際機関の一次資料を調べ、出典URL付きで表にまとめてください。推測で数字を埋めないでください。

背景：私は、生まれた国によってお金の一生が変わる教育用のブラウザゲームを作っています。新しい出来事を足す前に、国ごとの割合や制度を統計で確かめたいと考えています。扱いに配慮が必要な内容なので、制度や割合の事実だけを記録し、良い・悪いの評価は書かないでください。

対象の20か国：IND（インド）、CHN（中国）、NGA（ナイジェリア）、PAK（パキスタン）、IDN（インドネシア）、COD（コンゴ民主共和国）、ETH（エチオピア）、USA（アメリカ）、BGD（バングラデシュ）、BRA（ブラジル）、EGY（エジプト）、MEX（メキシコ）、PHL（フィリピン）、KEN（ケニア）、VNM（ベトナム）、JPN（日本）、DEU（ドイツ）、GBR（イギリス）、FRA（フランス）、KOR（韓国）

調べてほしいこと（番号順に、1項目ずつ20か国を埋めてから次へ）：
1. emigrant_stock_share：その国で生まれ、外国に住んでいる人 ÷ その国の人口（share）。出典：国連経済社会局 International Migrant Stock 2024
2. emigrant_top_destinations：行き先の上位3か国（value は空欄、note に「国名=人数」を3つ）。同じ出典
3. disability_prevalence：重い障害がある人の割合（share）。出典：WHO Global Report on Health Equity for Persons with Disabilities 2022、各国の調査（ワシントン・グループの設問）
4. disability_benefit_coverage：重い障害がある人のうち、障害の給付を受けている人の割合（share）。出典：ILO World Social Protection Report（SDG 1.3.1）
5. same_sex_union_status：同性のパートナーの結婚、またはそれに近い登録が法律で認められているか（status）。note に制度の名前と始まった年。出典：各国の法律、ILGA World の報告

守ってほしいこと：
・割合そのものがなければ、分子の数と分母の数を別々の行に unit を count として出す。計算は私がする。
・ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（年齢・期間・定義）を書く。どうしても見つからないときだけ空欄にし、理由を書く。
・数字ごとに、実際に確認したページのURLとデータの年を書く。ニュースやWikipediaは、一次資料がないときだけ使い「二次情報」と書く。
・割合は小数で書く（45.3%なら0.453）。一番新しい年の値を1つだけ書く。
・status は制度の有無で、1＝ある、0.5＝一部、0＝ない。

出力：最後に、次の9列の表を1つだけ出してください。1行に1つの数字です。
列：iso3／country_en／field／value／unit／year／source_name／source_url／note
・field は下に書いた英字の名前をそのまま使う
・unit は share（割合）／ratio（倍率）／count（人数・件数）／status（制度の有無）／金額は現地通貨のコード（JPY・USD など）
・note には、対象の人と定義の違いを日本語で書く
表のあとに、見つからなかった国とその理由を短く書いてください。
----- ここまで -----

## 2回目（給料の差・お酒とギャンブル・不妊治療）

----- ここから -----
あなたは国際統計の調査アシスタントです。政府・国際機関の一次資料を調べ、出典URL付きで表にまとめてください。推測で数字を埋めないでください。

背景：私は、生まれた国によってお金の一生が変わる教育用のブラウザゲームを作っています。新しい出来事を足す前に、国ごとの割合や制度を統計で確かめたいと考えています。扱いに配慮が必要な内容なので、制度や割合の事実だけを記録し、良い・悪いの評価は書かないでください。

対象の20か国：IND（インド）、CHN（中国）、NGA（ナイジェリア）、PAK（パキスタン）、IDN（インドネシア）、COD（コンゴ民主共和国）、ETH（エチオピア）、USA（アメリカ）、BGD（バングラデシュ）、BRA（ブラジル）、EGY（エジプト）、MEX（メキシコ）、PHL（フィリピン）、KEN（ケニア）、VNM（ベトナム）、JPN（日本）、DEU（ドイツ）、GBR（イギリス）、FRA（フランス）、KOR（韓国）

調べてほしいこと（番号順に、1項目ずつ20か国を埋めてから次へ）：
1. gender_pay_gap：男性と女性の給料の差（男性に対する差の割合、share）。出典：ILO Global Wage Report、OECD Employment Database
2. ethnic_pay_gap：アメリカ・イギリス・ブラジルだけ。人種・民族による給料の差（ratio または share。note にどの集団の比較か）。出典：各国の統計局
3. alcohol_use_disorder_share：15歳以上のうち、アルコール使用障害の人の割合（share）。出典：WHO Global Status Report on Alcohol and Health and Treatment of Substance Use Disorders 2024（または WHO GHO の国別の値）
4. problem_gambling_share：成人のうち、問題のあるギャンブルの人の割合（share）。国の調査がある国だけ（日本は久里浜医療センターの調査など）
5. ivf_public_funding_status：体外受精に公的な保険や補助が使えるか（status）。note に回数や年齢の条件
6. ivf_cycle_cost：体外受精1回の費用の目安（現地通貨、補助を受ける前）
7. art_birth_share：生まれた子のうち、体外受精などで生まれた子の割合（share）。出典：ICMART、ESHRE、各国の学会

守ってほしいこと：
・割合そのものがなければ、分子の数と分母の数を別々の行に unit を count として出す。計算は私がする。
・ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（年齢・期間・定義）を書く。どうしても見つからないときだけ空欄にし、理由を書く。
・数字ごとに、実際に確認したページのURLとデータの年を書く。ニュースやWikipediaは、一次資料がないときだけ使い「二次情報」と書く。
・割合は小数で書く（45.3%なら0.453）。一番新しい年の値を1つだけ書く。
・status は制度の有無で、1＝ある、0.5＝一部、0＝ない。

出力：最後に、次の9列の表を1つだけ出してください。1行に1つの数字です。
列：iso3／country_en／field／value／unit／year／source_name／source_url／note
・field は下に書いた英字の名前をそのまま使う
・unit は share（割合）／ratio（倍率）／count（人数・件数）／status（制度の有無）／金額は現地通貨のコード（JPY・USD など）
・note には、対象の人と定義の違いを日本語で書く
表のあとに、見つからなかった国とその理由を短く書いてください。
----- ここまで -----

## 3回目（犯罪の被害・宗教のお金・ペット）

----- ここから -----
あなたは国際統計の調査アシスタントです。政府・国際機関の一次資料を調べ、出典URL付きで表にまとめてください。推測で数字を埋めないでください。

背景：私は、生まれた国によってお金の一生が変わる教育用のブラウザゲームを作っています。新しい出来事を足す前に、国ごとの割合や制度を統計で確かめたいと考えています。扱いに配慮が必要な内容なので、制度や割合の事実だけを記録し、良い・悪いの評価は書かないでください。

対象の20か国：IND（インド）、CHN（中国）、NGA（ナイジェリア）、PAK（パキスタン）、IDN（インドネシア）、COD（コンゴ民主共和国）、ETH（エチオピア）、USA（アメリカ）、BGD（バングラデシュ）、BRA（ブラジル）、EGY（エジプト）、MEX（メキシコ）、PHL（フィリピン）、KEN（ケニア）、VNM（ベトナム）、JPN（日本）、DEU（ドイツ）、GBR（イギリス）、FRA（フランス）、KOR（韓国）

調べてほしいこと（番号順に、1項目ずつ20か国を埋めてから次へ）：
1. burglary_victim_share：1年間に空き巣・住居侵入の被害にあった世帯の割合（share）
2. robbery_victim_share：1年間に強盗・ひったくりの被害にあった人の割合（share）
   1と2の出典：各国の犯罪被害調査（アメリカ NCVS、イギリス CSEW、日本の法務総合研究所「犯罪被害実態調査」、メキシコ ENVIPE など）、UNODC。警察の届け出の件数しかない国は、件数と人口を count で
3. religious_spending_share：家計の支出のうち、宗教の行事や寄付（お布施・献金・ザカートなど）に使う割合（share）。出典：各国の家計調査。note に何が含まれるか
4. pet_household_share：犬または猫を飼っている世帯の割合（share）
5. pet_annual_cost：犬1匹を飼う1年間の費用の目安（現地通貨）。出典：各国の業界団体・統計局（二次情報なら note に書く）

守ってほしいこと：
・割合そのものがなければ、分子の数と分母の数を別々の行に unit を count として出す。計算は私がする。
・ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（年齢・期間・定義）を書く。どうしても見つからないときだけ空欄にし、理由を書く。
・数字ごとに、実際に確認したページのURLとデータの年を書く。ニュースやWikipediaは、一次資料がないときだけ使い「二次情報」と書く。
・割合は小数で書く（45.3%なら0.453）。一番新しい年の値を1つだけ書く。
・status は制度の有無で、1＝ある、0.5＝一部、0＝ない。

出力：最後に、次の9列の表を1つだけ出してください。1行に1つの数字です。
列：iso3／country_en／field／value／unit／year／source_name／source_url／note
・field は下に書いた英字の名前をそのまま使う
・unit は share（割合）／ratio（倍率）／count（人数・件数）／status（制度の有無）／金額は現地通貨のコード（JPY・USD など）
・note には、対象の人と定義の違いを日本語で書く
表のあとに、見つからなかった国とその理由を短く書いてください。
----- ここまで -----

システム保守情報
- Version：2026.10 作成
- Update Suggestion：なし
````

## 付録19. part11c_runable.md（2026-10-30）

````markdown
# 第11部の3回目：Manus が止まった分を、Runable で調べる

3つに分けています。1回分ずつ、新しいタスクとしてコードブロックの中をそのまま貼ってください。返ってきたCSVは、ファイル名のとおり data/world/manual/ に置きます。

## 1回目（海外移住・障害・同性のパートナー）

```
[Role]
あなたは国際統計の調査エージェントです。政府・国際機関（国連、WHO、ILO、OECD など）の一次資料を検索し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国によってお金の一生が変わる教育用のブラウザゲーム「人生のレシート」を作っています。
- 新しい出来事をゲームに足す前に、国ごとの割合や制度を統計で確かめたいと考えています。統計が見つからない出来事は、ゲームに入れません。
- 扱いに配慮が必要な内容を含むため、制度や割合の事実だけを記録し、良い・悪いの評価は書かないでください。
- 集めた数字はプログラムで読み込むため、書き方をそろえることが最優先です。確率への計算は私がします。

[Task]
次の項目を、主要20か国について集めてください。1項目ずつ20か国を埋めてから、次の項目に進んでください。

対象20か国（ISO3：英語名）：
IND: India / CHN: China / NGA: Nigeria / PAK: Pakistan / IDN: Indonesia / COD: Democratic Republic of the Congo / ETH: Ethiopia / USA: United States / BGD: Bangladesh / BRA: Brazil / EGY: Egypt / MEX: Mexico / PHL: Philippines / KEN: Kenya / VNM: Viet Nam / JPN: Japan / DEU: Germany / GBR: United Kingdom / FRA: France / KOR: Republic of Korea

1. emigrant_stock_share：その国で生まれ、外国に住んでいる人 ÷ その国の人口（share）。出典：国連経済社会局 International Migrant Stock 2024
2. emigrant_top_destinations：行き先の上位3か国（value は空欄、note に「国名=人数」を3つ）。同じ出典
3. disability_prevalence：重い障害がある人の割合（share）。出典：WHO Global Report on Health Equity for Persons with Disabilities 2022、各国の調査（ワシントン・グループの設問）
4. disability_benefit_coverage：重い障害がある人のうち、障害の給付を受けている人の割合（share）。出典：ILO World Social Protection Report（SDG 1.3.1）
5. same_sex_union_status：同性のパートナーの結婚、またはそれに近い登録が法律で認められているか（status）。note に制度の名前と始まった年。出典：各国の法律、ILGA World の報告

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に理由を書くこと。
- 割合そのものがない場合は、分子の数（人数・件数）と分母の数（人口・世帯数など）を、別々の行に unit=count で記録すること。
- 指定とぴったり同じ数字がないときは、いちばん近い数字を記録し、note に「指定との違い」（年齢・期間・定義の違い）を書くこと。
- 1つの数値ごとに、実際に数字を確認したページ（表・報告書・PDF・データベースの該当ページ）のURLと、データの年を記録すること。
- 一番新しい年の値を1つだけ記録すること。割合は小数で書くこと（45.3% → 0.453）。
- ニュース記事・まとめサイト・Wikipedia は、一次資料がない場合だけ使い、note の最後に「二次情報」と書くこと。
- クレジットや時間が尽きても結果が残るよう、1項目が終わるたびにCSVファイルを上書き保存すること。途中で止まる場合は、どの項目・どの国まで終わったかをチャットに書くこと。

[Output Format]
1. CSVファイル（ファイル名：jinsei_receipt_part11c_1.csv、UTF-8）。列は次の順にすること（1行に1つの数値）：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   - field は [Task] に書いた英字の名前をそのまま使う
   - unit は share（割合）／ratio（倍率）／count（人数・件数）／status（制度の有無。value は 1=ある・0.5=一部・0=ない）／金額は現地通貨のコード（JPY・USD など）
   - note には、対象の人と定義の違いを日本語で書く
2. チャット内に、日本語で短く要約を書くこと：項目ごとに値が見つかった国の数と見つからなかった国、定義が指定と違う数字、開けなかったサイト
```

## 2回目（給料の差・お酒とギャンブル・不妊治療）

```
[Role]
あなたは国際統計の調査エージェントです。政府・国際機関（国連、WHO、ILO、OECD など）の一次資料を検索し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国によってお金の一生が変わる教育用のブラウザゲーム「人生のレシート」を作っています。
- 新しい出来事をゲームに足す前に、国ごとの割合や制度を統計で確かめたいと考えています。統計が見つからない出来事は、ゲームに入れません。
- 扱いに配慮が必要な内容を含むため、制度や割合の事実だけを記録し、良い・悪いの評価は書かないでください。
- 集めた数字はプログラムで読み込むため、書き方をそろえることが最優先です。確率への計算は私がします。

[Task]
次の項目を、主要20か国について集めてください。1項目ずつ20か国を埋めてから、次の項目に進んでください。

対象20か国（ISO3：英語名）：
IND: India / CHN: China / NGA: Nigeria / PAK: Pakistan / IDN: Indonesia / COD: Democratic Republic of the Congo / ETH: Ethiopia / USA: United States / BGD: Bangladesh / BRA: Brazil / EGY: Egypt / MEX: Mexico / PHL: Philippines / KEN: Kenya / VNM: Viet Nam / JPN: Japan / DEU: Germany / GBR: United Kingdom / FRA: France / KOR: Republic of Korea

1. gender_pay_gap：男性と女性の給料の差（男性に対する差の割合、share）。出典：ILO Global Wage Report、OECD Employment Database
2. ethnic_pay_gap：アメリカ・イギリス・ブラジルだけ。人種・民族による給料の差（ratio または share。note にどの集団の比較か）。出典：各国の統計局
3. alcohol_use_disorder_share：15歳以上のうち、アルコール使用障害の人の割合（share）。出典：WHO Global Status Report on Alcohol and Health and Treatment of Substance Use Disorders 2024（または WHO GHO の国別の値）
4. problem_gambling_share：成人のうち、問題のあるギャンブルの人の割合（share）。国の調査がある国だけ（日本は久里浜医療センターの調査など）
5. ivf_public_funding_status：体外受精に公的な保険や補助が使えるか（status）。note に回数や年齢の条件
6. ivf_cycle_cost：体外受精1回の費用の目安（現地通貨、補助を受ける前）
7. art_birth_share：生まれた子のうち、体外受精などで生まれた子の割合（share）。出典：ICMART、ESHRE、各国の学会

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に理由を書くこと。
- 割合そのものがない場合は、分子の数（人数・件数）と分母の数（人口・世帯数など）を、別々の行に unit=count で記録すること。
- 指定とぴったり同じ数字がないときは、いちばん近い数字を記録し、note に「指定との違い」（年齢・期間・定義の違い）を書くこと。
- 1つの数値ごとに、実際に数字を確認したページ（表・報告書・PDF・データベースの該当ページ）のURLと、データの年を記録すること。
- 一番新しい年の値を1つだけ記録すること。割合は小数で書くこと（45.3% → 0.453）。
- ニュース記事・まとめサイト・Wikipedia は、一次資料がない場合だけ使い、note の最後に「二次情報」と書くこと。
- クレジットや時間が尽きても結果が残るよう、1項目が終わるたびにCSVファイルを上書き保存すること。途中で止まる場合は、どの項目・どの国まで終わったかをチャットに書くこと。

[Output Format]
1. CSVファイル（ファイル名：jinsei_receipt_part11c_2.csv、UTF-8）。列は次の順にすること（1行に1つの数値）：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   - field は [Task] に書いた英字の名前をそのまま使う
   - unit は share（割合）／ratio（倍率）／count（人数・件数）／status（制度の有無。value は 1=ある・0.5=一部・0=ない）／金額は現地通貨のコード（JPY・USD など）
   - note には、対象の人と定義の違いを日本語で書く
2. チャット内に、日本語で短く要約を書くこと：項目ごとに値が見つかった国の数と見つからなかった国、定義が指定と違う数字、開けなかったサイト
```

## 3回目（犯罪の被害・宗教のお金・ペット）

```
[Role]
あなたは国際統計の調査エージェントです。政府・国際機関（国連、WHO、ILO、OECD など）の一次資料を検索し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国によってお金の一生が変わる教育用のブラウザゲーム「人生のレシート」を作っています。
- 新しい出来事をゲームに足す前に、国ごとの割合や制度を統計で確かめたいと考えています。統計が見つからない出来事は、ゲームに入れません。
- 扱いに配慮が必要な内容を含むため、制度や割合の事実だけを記録し、良い・悪いの評価は書かないでください。
- 集めた数字はプログラムで読み込むため、書き方をそろえることが最優先です。確率への計算は私がします。

[Task]
次の項目を、主要20か国について集めてください。1項目ずつ20か国を埋めてから、次の項目に進んでください。

対象20か国（ISO3：英語名）：
IND: India / CHN: China / NGA: Nigeria / PAK: Pakistan / IDN: Indonesia / COD: Democratic Republic of the Congo / ETH: Ethiopia / USA: United States / BGD: Bangladesh / BRA: Brazil / EGY: Egypt / MEX: Mexico / PHL: Philippines / KEN: Kenya / VNM: Viet Nam / JPN: Japan / DEU: Germany / GBR: United Kingdom / FRA: France / KOR: Republic of Korea

1. burglary_victim_share：1年間に空き巣・住居侵入の被害にあった世帯の割合（share）
2. robbery_victim_share：1年間に強盗・ひったくりの被害にあった人の割合（share）
   1と2の出典：各国の犯罪被害調査（アメリカ NCVS、イギリス CSEW、日本の法務総合研究所「犯罪被害実態調査」、メキシコ ENVIPE など）、UNODC。警察の届け出の件数しかない国は、件数と人口を count で
3. religious_spending_share：家計の支出のうち、宗教の行事や寄付（お布施・献金・ザカートなど）に使う割合（share）。出典：各国の家計調査。note に何が含まれるか
4. pet_household_share：犬または猫を飼っている世帯の割合（share）
5. pet_annual_cost：犬1匹を飼う1年間の費用の目安（現地通貨）。出典：各国の業界団体・統計局（二次情報なら note に書く）

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に理由を書くこと。
- 割合そのものがない場合は、分子の数（人数・件数）と分母の数（人口・世帯数など）を、別々の行に unit=count で記録すること。
- 指定とぴったり同じ数字がないときは、いちばん近い数字を記録し、note に「指定との違い」（年齢・期間・定義の違い）を書くこと。
- 1つの数値ごとに、実際に数字を確認したページ（表・報告書・PDF・データベースの該当ページ）のURLと、データの年を記録すること。
- 一番新しい年の値を1つだけ記録すること。割合は小数で書くこと（45.3% → 0.453）。
- ニュース記事・まとめサイト・Wikipedia は、一次資料がない場合だけ使い、note の最後に「二次情報」と書くこと。
- クレジットや時間が尽きても結果が残るよう、1項目が終わるたびにCSVファイルを上書き保存すること。途中で止まる場合は、どの項目・どの国まで終わったかをチャットに書くこと。

[Output Format]
1. CSVファイル（ファイル名：jinsei_receipt_part11c_3.csv、UTF-8）。列は次の順にすること（1行に1つの数値）：
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   - field は [Task] に書いた英字の名前をそのまま使う
   - unit は share（割合）／ratio（倍率）／count（人数・件数）／status（制度の有無。value は 1=ある・0.5=一部・0=ない）／金額は現地通貨のコード（JPY・USD など）
   - note には、対象の人と定義の違いを日本語で書く
2. チャット内に、日本語で短く要約を書くこと：項目ごとに値が見つかった国の数と見つからなかった国、定義が指定と違う数字、開けなかったサイト
```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：なし
````

## 付録20. part11f_sports.md（2026-10-30）

````markdown
# 第11部：プロのスポーツ選手になる人数（ChatGPT の Deep Research 用）

新しいチャットで「Deep Research（詳細なリサーチ）」を選び、コードブロックの中をそのまま貼ってください。返ってきた表は jinsei_receipt_part11f_sports.csv として保存します。

```
[Role]
あなたは日本のスポーツ統計の調査アシスタントです。リーグ・協会・選手会の公式発表を探し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国や家庭でお金の一生が変わる教育用ゲーム「人生のレシート」を作っています。
- 「プロのスポーツ選手を目指す」という出来事を入れるため、競技ごとに「1年に何人がプロになるか」と「プロになったあとの収入」を、事実として示したいと考えています。
- 高校の部員数は全国高等学校体育連盟の資料で取れています。プロ野球（NPB）は、ドラフト127人（2026年）、年俸の中央値2,000万円、引退した人の平均在籍6.8年が取れています。
- 足りないのは、ほかの競技の「1年にプロになる人数」です。確率への計算は私がします。

[Task]
次の競技について、番号順に数字を探してください。

(1) サッカー男子（Jリーグ）
  - pro_entrants:jleague：1年間に新しくJリーグのクラブとプロ契約した選手の数（高卒・大卒・ユース昇格の合計。最新の年）。公式の集計がなければ、Jリーグ公式サイトの各クラブの新加入選手の一覧から数え、数え方を note に書く
  - pro_salary:jleague：Jリーグの選手の年俸の平均または中央値（公式の発表、または日本プロサッカー選手会の調査）
  - pro_career:jleague：Jリーガーの平均の在籍年数（選手会・Jリーグの調査）
(2) サッカー女子（WEリーグ）
  - pro_entrants:weleague：1年間に新しくWEリーグのクラブに加入した選手の数
  - pro_salary:weleague：WEリーグの最低年俸の規定、または平均年俸
(3) バスケットボール（B.LEAGUE 男子、Wリーグ 女子）
  - pro_entrants:bleague：1年間に新しくB1・B2のクラブと契約した日本人の新人選手の数（ドラフトとドラフト以外の両方）
  - pro_salary:bleague：B.LEAGUE の平均年俸、または最低年俸の規定
  - pro_entrants:wleague：1年間にWリーグのチームに加入した新人選手の数
(4) バレーボール（SVリーグ 男子・女子）
  - pro_entrants:svleague_m・pro_entrants:svleague_f：1年間に新しく加入した新人選手の数
  - pro_salary:svleague：プロ契約選手の年俸の規定や平均（公表されていれば）
(5) 大相撲
  - pro_entrants:sumo：1年間（2025年の6場所）の新弟子検査の合格者の合計。日本相撲協会の発表、または場所ごとの発表を足し合わせ、場所ごとの人数を note に書く
  - pro_reach_sekitori：入門した力士のうち、十両以上（月給がもらえる関取）になれた割合（協会の資料や研究）
  - pro_salary:sumo：十両・幕内・横綱の月給と、幕下以下の場所手当（日本相撲協会の規定）
(6) ゴルフ（男子 JPGA・JGTO、女子 JLPGA）
  - pro_entrants:golf_m・pro_entrants:golf_f：最新年のプロテストの合格者数と受験者数（年を必ず書く）
  - pro_salary:golf：賞金ランキングの賞金額の中央値、またはシード権を持つ選手の数
  - hs_club_members:golf：日本高等学校ゴルフ連盟の加盟校の部員数（男女別）
(7) 野球（確認だけ）
  - hs_club_members:baseball_m：日本高等学校野球連盟が発表した、最新年の硬式野球部の部員数（5月末現在）

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に探した資料と理由を書くこと。
- 公式の集計がなく、公式の一覧から自分で数えた場合は、何のページから何を数えたかを note に書くこと。
- 1つの数値ごとに、実際に確認したページのURLとデータの年を書くこと。[1] のような番号ではなくURLそのものを書くこと。
- ニュース記事・まとめサイト・Wikipedia は、公式の資料がないときだけ使い、note に「二次情報」と書くこと。
- 年俸は円で書くこと（unit は JPY）。人数は unit を count にすること。割合は小数で書くこと（45.3% → 0.453）。

[Output Format]
1. 次の9列のCSVを、1つの csv コードブロックで出すこと（1行に1つの数字）。
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   - iso3 は JPN、country_en は Japan
   - field は [Task] に書いた名前をそのまま使う
   - note には、対象（男子・女子、どのリーグか）と数え方を日本語で書く
2. CSVのあとに、日本語で短く：見つかった項目／見つからなかった項目と理由／開けなかったサイト
```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：なし
````

## 付録21. part11g_women_sports.md（2026-10-30）

````markdown
# 第11部：女子のスポーツ選手になる人数（ChatGPT の Deep Research 用）

新しいチャットで「Deep Research（詳細なリサーチ）」を選び、コードブロックの中をそのまま貼ってください。返ってきた表は jinsei_receipt_part11g_women_sports.csv として保存します。
女子の統計がそろわなければ、プロ選手の出来事は男子の分も取り除く（ユーザーの判断：片方の性別だけに出すのはおかしい）。

```
[Role]
あなたは日本のスポーツ統計の調査アシスタントです。リーグ・協会・選手会の公式発表を探し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国や家庭でお金の一生が変わる教育用ゲーム「人生のレシート」を作っています。
- 「プロのスポーツ選手を目指す」という出来事を、男子は野球とサッカーで作りました。女子にも同じように出したいので、女子の競技について「1年に何人がトップリーグに入るか」と「入ったあとの収入」を、事実として示したいと考えています。
- 女子の高校の部員数は、全国高等学校体育連盟の資料で取れています（サッカー9,048人、バスケットボール4.9万人、バレーボール5.5万人、ソフトボール1.2万人）。
- 分かっている数字：WEリーグの最低年俸270万円、JLPGAの2025年度プロテスト合格22人（受験756人）。
- 女子のリーグには、プロ契約の選手と、会社に勤めながらプレーする選手（社員選手）がいます。どちらなのかが分かる数字も知りたいです。確率への計算は私がします。

[Task]
次の競技について、番号順に数字を探してください。

(1) サッカー女子（WEリーグ）
  - pro_entrants:weleague：1年間に高校・大学・クラブのユース（下部組織）から新しくWEリーグに加入した選手の数。公式の集計がなければ、WEリーグ公式サイトや各クラブの新加入選手の発表から数え、数え方を note に書く
  - pro_salary:weleague：平均年俸、またはプロ契約の割合（最低年俸の規定は分かっている）
  - pro_career:weleague：平均の在籍年数（なければ空欄）
(2) バスケットボール女子（Wリーグ）
  - pro_entrants:wleague：1年間に高校・大学から新しくWリーグのチームに加入した選手の数（Wリーグ公式の新人選手一覧などから数えてよい）
  - pro_salary:wleague：プロ契約の選手の割合、または年俸の規定・平均（社員選手が多いなら、その割合）
(3) バレーボール女子（SVリーグ）
  - pro_entrants:svleague_f：1年間に高校・大学から新しく加入した新人選手の数（内定選手・新加入選手の公式発表から数えてよい。移籍や特別指定選手は除き、除き方を note に書く）
  - pro_salary:svleague_f：プロ契約の選手の割合、または年俸の規定・平均
(4) ソフトボール女子（JDリーグ）
  - pro_entrants:jdleague：1年間に高校・大学から新しく加入した選手の数
  - pro_salary:jdleague：プロ契約の選手の割合、または年俸の規定・平均
(5) ゴルフ女子（JLPGA）
  - hs_club_members:golf_f：高校の女子ゴルフ部員の数（日本高等学校ゴルフ連盟など）。なければ、プロテストの受験者の年齢の内訳
  - pro_salary:golf_f：JLPGAツアーの賞金ランキングで賞金を得た選手の数と、賞金額の中央値（公式の賞金ランキングから数えてよい）
  - pro_career:golf_f：シード権を持つ選手の数（最新年）

[Constraints]
- 推測・概算で数字を埋めないこと。見つからない場合は value を空欄にし、note に探した資料と理由を書くこと。
- 公式の集計がなく、公式の一覧から自分で数えた場合は、何のページから何を数えたかを note に書くこと。
- 1つの数値ごとに、実際に確認したページのURLとデータの年を書くこと。[1] のような番号ではなくURLそのものを書くこと。
- ニュース記事・まとめサイト・Wikipedia は、公式の資料がないときだけ使い、note に「二次情報」と書くこと。
- 年俸・賞金は円で書くこと（unit は JPY）。人数は unit を count にすること。割合は小数で書くこと（45.3% → 0.453）。

[Output Format]
1. 次の9列のCSVを、1つの csv コードブロックで出すこと（1行に1つの数字）。
   iso3,country_en,field,value,unit,year,source_name,source_url,note
   - iso3 は JPN、country_en は Japan
   - field は [Task] に書いた名前をそのまま使う
   - note には、対象（どのリーグか）、数え方、プロ契約か社員選手かを日本語で書く
2. CSVのあとに、日本語で短く：見つかった項目／見つからなかった項目と理由／開けなかったサイト
```

システム保守情報
- Version：2026.10 作成
- Update Suggestion：なし
````
