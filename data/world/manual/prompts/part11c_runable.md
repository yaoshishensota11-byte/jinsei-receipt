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
