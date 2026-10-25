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
