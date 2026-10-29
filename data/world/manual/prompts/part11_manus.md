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
