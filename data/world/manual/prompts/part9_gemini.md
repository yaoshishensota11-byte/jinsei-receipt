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
・見つからないときは数字を空欄にし、理由を書く。ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間など）を書く。
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
・見つからないときは数字を空欄にし、理由を書く。ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間など）を書く。
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
・見つからないときは数字を空欄にし、理由を書く。ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間など）を書く。
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
・見つからないときは数字を空欄にし、理由を書く。ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間など）を書く。
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
・見つからないときは数字を空欄にし、理由を書く。ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間など）を書く。
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
・見つからないときは数字を空欄にし、理由を書く。ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間など）を書く。
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
・見つからないときは数字を空欄にし、理由を書く。ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間など）を書く。
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
・見つからないときは数字を空欄にし、理由を書く。ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間など）を書く。
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
・見つからないときは数字を空欄にし、理由を書く。ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間など）を書く。
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
・見つからないときは数字を空欄にし、理由を書く。ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間など）を書く。
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
・見つからないときは数字を空欄にし、理由を書く。ぴったりの数字がなければ、いちばん近い数字を入れ、何が違うか（対象の年齢・期間など）を書く。
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
