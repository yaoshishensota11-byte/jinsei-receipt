# 国別統計データ（data/world）出典メモ

- 対象: 88か国。2023年の世界出生数（約1億3,146万人、WDIの粗出生率 x 人口で算出）の **96.06%** をカバー。
- 主要20か国（`major: true`）: JPN USA CHN IND NGA BRA DEU GBR FRA IDN PAK BGD MEX PHL EGY ETH COD VNM KOR KEN
- 生成手順: `raw/` に取得した生データ（信頼できない入力として扱う）を、`build/build.py`（`python3 -I` で実行）で加工。検証は `node build/validate.mjs`。
- 世界銀行API・UN・OWID・ILO・OECD などの公式サイトは、この環境のプロキシで遮断されていた。そのため WDI は **GitHub 上の open-numbers DDF ミラー** から取得した。ILO・OECD・UN の各値と WorldRiskIndex は**ダウンロードできていない**（下表の「推定」を参照）。

## フィールド別の出典

| フィールド | 出典名 | 年 | URL | 取得方法 | 推定の有無 |
|---|---|---|---|---|---|
| births | WDI SP.DYN.CBRT.IN（粗出生率）x SP.POP.TOTL（人口） | 2023 | https://github.com/open-numbers/ddf--open_numbers--world_development_indicators | GitHubミラー（raw.githubusercontent.com）のCSV | 算出値（WDIから計算）。UN WPP の出生数とは数%ずれることがある |
| iso3 / nameJa | i18n-iso-countries `ja` ロケール + 外務省式の略称に手修正（中国・韓国・北朝鮮・英国・イラン・ロシアなど） | 2026 | https://github.com/michaelwittig/node-i18n-iso-countries | npmパッケージ | 名称の一部を手修正 |
| incomeGroup | 世界銀行 所得分類。ミラーの分類は古いため、FY2026（2025年7月）分類を記憶に基づき上書き（IDN→UMC、RUS→HIC、TZA→LMC、UKR→UMC など） | 2025 | https://datahelpdesk.worldbank.org/knowledgebase/articles/906519 | ミラー + 手入力の上書き | 上書き分は記憶に基づく。VEN は世銀では分類外のため UMC と仮置き |
| currency.code | country-to-currency（ZWE→ZWG、SLE→SLE、VEN→VES、MRT→MRU は手修正） | 2026 | https://github.com/thiagodp/country-to-currency | npm | なし |
| currency.nameJa / symbol | Unicode CLDR 49 `ja` の通貨名・記号（narrow記号を優先し、無ければ通貨コード） | 2026 | https://github.com/unicode-org/cldr-json | npm `cldr-numbers-full` | なし（CLDR表記のため「ナイジェリア ナイラ」のような表記になる） |
| currency.jpyPerUnit | fawazahmed0/exchange-api（2026-10-22 時点） | 2026 | https://github.com/fawazahmed0/exchange-api | npm `@fawazahmed0/currency-api` | なし（市場レート。KPW などは公定レート） |
| gniPerCapitaLCU | WDI NY.GNP.PCAP.CN | 主に2024 | 同上ミラー | GitHubミラー | 6か国は推定（SOM・VEN・ZWE はWDIの自国通貨値と為替系列が食い違うため、PRK・SSD・YEM は欠損のため、米ドル建ての概算値 x 現行レート） |
| consumptionPerCapitaLCU | WDI NE.CON.PRVT.CN ÷ SP.POP.TOTL | 主に2024 | 同上 | GitHubミラー | 10か国はGNI x 0.6で推定 |
| pppPerIntlDollar | WDI PA.NUS.PRVT.PP（家計消費PPP）。無い国は PA.NUS.PPP | 2021〜2024 | 同上 | GitHubミラー | 5か国は「現行レート x 所得グループ別の物価水準」で推定 |
| （金額の換算） | 2024年値（WDI PA.NUS.FCRF）から現行レートまでに通貨が25%超下落した国（ETH・TUR・ARG・SYR・BOL など）は、米ドル換算額が変わらないと仮定して GNI・消費・PPP を現行の通貨水準に換算した（倍率は notes に記載） | - | - | 算出 | 加工あり |
| incomeShareQuintiles | WDI SI.DST.FRST.20〜SI.DST.05TH.20（PIP由来） | 2005〜2024の最新年 | 同上 | GitHubミラー | 5か国は所得グループの中央値 |
| urbanShare | WDI SP.URB.TOTL.IN.ZS | 2024 | 同上 | GitHubミラー | なし |
| places | 主要国は都市・州別の出生分布を手で概算。他国は「最大都市（都市人口の30%、上限は全国の35%）／その他の都市／農村部」をWDIの都市化率から機械的に作成 | - | - | 手入力・算出 | **全件推定**。incomeIndex は出生数で加重した平均が1になるよう調整 |
| lifeExpectancy | WDI SP.DYN.LE00.MA.IN / FE.IN | 2023 | 同上 | GitHubミラー | なし |
| under5MortalityPer1000 | WDI SH.DYN.MORT | 2023 | 同上 | GitHubミラー | なし |
| tfr | WDI SP.DYN.TFRT.IN | 2023 | 同上 | GitHubミラー | なし |
| meanAgeFirstMarriage | 主要国は UN World Marriage Data・各国統計の値を記憶から手入力。他国は主要国の値から作った log(TFR) の回帰式で推定 | 概ね2015〜2023 | https://www.un.org/development/desa/pd/data/world-marriage-data | ダウンロードできず | **全件推定** |
| secondaryNetEnrollment | WDI SE.SEC.NENR。無い国は SE.SEC.CMPT.LO.ZS（前期中等教育の修了率）で代替 | 2012〜2024 | 同上 | GitHubミラー | 6か国は所得グループの中央値（JPN を含む） |
| tertiaryGrossEnrollment | WDI SE.TER.ENRR（100%超は1.0に丸め） | 2012〜2024 | 同上 | GitHubミラー | 10か国は所得グループの中央値 |
| tertiaryAnnualCostShareOfGni | 主要国は学費水準から手で概算。他国は主要国の所得グループ別中央値 | - | - | 手入力 | **全件推定** |
| unemploymentRate | WDI SL.UEM.TOTL.ZS（ILOのモデル推計） | 2024 | 同上 | GitHubミラー | なし |
| informalEmploymentShare | 主要国は ILO の公表値を記憶から手入力。他国は WDI SL.EMP.VULN.ZS（脆弱な雇用）からの回帰式（informal% = 14.6 + 1.07 x 脆弱な雇用%） | - | https://ilostat.ilo.org/ | ダウンロードできず | **全件推定** |
| pensionCoverage | 主要国は ILO World Social Protection Report 2024-26（SDG 1.3.1）を記憶から概算。他国は主要国の所得グループ別中央値 | 2024 | https://www.social-protection.org/ | ダウンロードできず | **全件推定** |
| pensionReplacementRate | 主要国は OECD Pensions at a Glance 2023 の総所得代替率を記憶から概算（OECD以外は判断）。他国は主要国の所得グループ別中央値 | 2023 | https://www.oecd.org/pensions/ | ダウンロードできず | **全件推定** |
| outOfPocketHealthShare | WDI SH.XPD.OOPC.CH.ZS（WHO GHED） | 2015〜2023 | 同上 | GitHubミラー | 1か国は所得グループの中央値 |
| effectiveTaxRateAvgWorker | OECD加盟国は Taxing Wages 2024（所得税＋本人負担の社会保険料）を記憶から概算。他国は制度（社会保険料率・所得税）から判断。主要国以外は主要国の所得グループ別中央値 | 2024 | https://www.oecd.org/tax/taxing-wages | ダウンロードできず | **全件推定** |
| rentShareOfIncome / housePriceToIncome | 主要国は Numbeo 等の一般的な水準感から手で概算。他国は主要国の所得グループ別中央値 | - | - | 手入力 | **全件推定** |
| disasterRisk | WorldRiskIndex 2023 の相対順位と地震リスクを参考にした判断値（日本=0.5を基準）。一覧に無い国は0.3 | 2023 | https://weltrisikobericht.de/ | ダウンロードできず | **全件推定** |
| remittanceShareGdp | WDI BX.TRF.PWKR.DT.GD.ZS | 2024 | 同上 | GitHubミラー | 6か国は所得グループの中央値 |

「所得グループの中央値」は、WDIミラーに値がある全世界の国（約190か国）を所得グループ別に集計した中央値。「主要国の所得グループ別中央値」は、手入力した主要20か国の値から計算した中央値（LICはETH・CODの2か国だけなので精度が低い）。

## 推定フィールドが多い国（estimated の件数）

| 国 | 件数 | 主な理由 |
|---|---|---|
| ソマリア (SOM) | 17 | GNI・消費・PPP・五分位などがWDIで欠損または不整合 |
| 北朝鮮 (PRK) | 17 | WDIの経済指標がほぼ無い。GNIは1人あたり約1,200米ドルと仮定 |
| イエメン (YEM) | 14 | 内戦によりGNI・消費・PPPが欠損 |
| ベネズエラ (VEN) | 14 | WDIの自国通貨系列が古く不整合。GNIは1人あたり約3,800米ドルと仮定 |
| ジンバブエ (ZWE) | 13 | 通貨の切替（ZWL→ZWG）でWDIの系列が不整合 |
| 南スーダン (SSD) | 13 | GNI・消費が欠損 |
| ナイジェリア (NGA) | 13 | 家計消費・高等教育・中等教育が欠損 |
| パプアニューギニア / イラク / ハイチ | 12 | 教育・消費などが欠損 |

全88か国で手入力または推定になっている10フィールド: places, meanAgeFirstMarriage, tertiaryAnnualCostShareOfGni, informalEmploymentShare, pensionCoverage, pensionReplacementRate, effectiveTaxRateAvgWorker, rentShareOfIncome, housePriceToIncome, disasterRisk。ゲーム用の概算として扱うこと。正式な統計として引用しないこと。

## リスク指標と国ごとの出来事

生成手順: `python3 -I build/build_risks.py` → `risks.json`、`python3 -I build/build_events.py` → `country_events.json`、検証は `node build/validate_risks.mjs`。WDI の生データは前回と同じ open-numbers ミラー（`raw/wdi/` に保存、git管理外）から取得した。

### risks.json（88か国）

| フィールド | 出典 | 年 | URL | 推定の有無 |
|---|---|---|---|---|
| inflationMean | WDI FP.CPI.TOTL.ZG の2000〜2024年の単純平均（各年300%で頭打ち。ハイパーインフレの1年が平均を支配しないため） | 2000〜2024 | https://github.com/open-numbers/ddf--open_numbers--world_development_indicators | SOM・PRK はデータ無しのため推定 |
| inflationCrisisShare | 同上で、1990〜2024年のうち年40%超だった年の割合（データのある年のみで計算） | 1990〜2024 | 同上 | SOM・PRK は0と仮置き（推定） |
| inflationRecent | 同上の最新年（多くは2025年値。`years.inflationRecent` に年を記録） | 主に2025 | 同上 | 最新値が2022年より古いか欠損の7か国（COD・VEN・YEM・MMR・SYR・SOM・PRK）は報道等からの概算 |
| homicidePer100k | WDI VC.IHR.PSRC.P5（UNODC由来） | 2005〜2023の最新年 | 同上 | 10か国（COD・MDG・CIV・MLI・TCD・SOM・GIN・PRK・TGO・COG）は UNODC の推計水準を記憶から概算 |
| ipvPast12mWomen | WDI SG.VAW.1549.ZS（過去12か月に配偶者・パートナーから身体的・性的暴力を受けた15〜49歳女性の割合。主にDHS調査） | 2006〜2017の最新年 | 同上 | 37か国（JPN・USA・CHN・BRA・KOR などを含む）は WHO「Violence Against Women Prevalence Estimates 2018」の国別推計値を記憶から概算。日本の内閣府「男女間における暴力に関する調査」（令和5年度）は過去1年の数値を取得できず、WHO推計水準（約4%）を使用 |
| politicalStability | WDI GOV.WGI.PV.EST（世界ガバナンス指標の政治的安定性・暴力の不在） | ミラー上の最新年（2025表記） | 同上 | なし |
| conflictRisk | WDI VC.BTL.DETH（戦闘による死者、2015〜2024平均の人口比）と VC.IDP.NWCV（紛争による新規国内避難民、2014〜2023合計の人口比）から指数を作り、UCDP・ACLED・UNHCR の状況認識で約30か国を手で上書き | 2014〜2024 | 同上 | **全件推定** |
| floodRisk / droughtRisk / earthquakeRisk | INFORM Risk Index・WorldRiskIndex・EM-DAT の記憶に基づく相対的な判断値（0〜1） | - | https://drmkc.jrc.ec.europa.eu/inform-index | **全件推定**（ダウンロードできず） |
| epidemicRisk | 5歳未満死亡率（countries.json）から算出: 0.05 + 死亡率/130 (+LIC・LMCは0.05)、上限0.9 | 2023 | - | **全件推定**（算出値） |

参考として取得したが未使用: WDI EN.CLC.MDAT.ZS（干ばつ・洪水・異常気温の被災人口比、1990〜2009平均）。

### country_events.json

- 主要20か国に各4〜6件（計101件）、所得グループ・都市農村別の汎用イベント9件、合計110件。
- 各イベントの `basis` に根拠（統計名・機関名・報道）を日本語で記載した。根拠の数値はいずれも記憶に基づくもので、原典では確認していない。
- `annualProb` は「条件を満たす人が1年間にその出来事に直面する確率」を根拠の数値から大まかに見積もった値で、**全件推定**（`estimated: true`）。
- 金額は日本円の水準で書いており、ゲーム側で各国の物価水準を掛ける前提。

### INFORM Risk Index（ユーザー提供ファイル）による更新

| データ | 出典 | 版 | 取得方法 | 推定の有無 |
|---|---|---|---|---|
| floodRisk / earthquakeRisk / droughtRisk / epidemicRisk / conflictRisk（全88か国） | European Commission JRC「INFORM Risk Index」 https://drmkc.jrc.ec.europa.eu/inform-index/INFORM-Risk/Results-and-data | Mid 2026 v0.7.3（2026年9月1日公開） | ユーザーがダウンロードしたExcel（シート「INFORM Risk 2026 (a-z)」）を build/apply_inform.py で反映 | 実データ（ゲーム用に家庭単位の相対値へ変換） |

- 生のスコア（0〜10）は risks.json の各国 `inform` に保存。
- 変換：洪水＝max(River Flood, Coastal flood)/10 の3乗、地震＝Earthquake/10 の3乗、干ばつ＝Drought/10、感染症＝Epidemic/10、紛争による避難＝10^((Current Conflict Intensity − 10)/2.5)（いまの紛争の激しさを指数で直す）。
- 中国の ipvPast12mWomen は、WHO VAW 2018 推計（https://vaw-data.srhr.org/ 、15〜49歳・過去1年 10.6%）をユーザーが確認した値に更新。
- 日本のパートナー暴力：内閣府男女共同参画局「男女間における暴力に関する調査報告書＜概要版＞」（令和6年3月、令和5年度調査）p.3。結婚したことのある人のうち、配偶者から身体的暴行を受けたことがある割合＝女性15.0%・男性11.5%（何らかの被害は女性27.5%・男性22.0%）。ユーザー提供のPDFから取得。risks.json の JPN に ipvLifetimeWomen / ipvLifetimeMen として保存し、生涯の割合として直接使う。

## ユーザー（Manus）調査による実データ（2026年10月）

元データ：data/world/manual/jinsei_receipt_part1.csv、jinsei_receipt_part2.csv（1行1数値、各行に出典URLと年）。反映は build/apply_manual.py。値が空欄の国はこれまでの推定値のまま。

| データ | 出典 | 反映した国の数 | 備考 |
|---|---|---|---|
| pensionCoverage | ILOSTAT SDG 1.3.1（老齢年金の受給率、男女計） https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz | 87/88 | PRKは未掲載 |
| informalEmploymentShare | ILOSTAT SDG 8.3.1、未掲載国はILO「Women and Men in the Informal Economy」付表B.1 | 72/88 | 全産業（農業を含む）・男女計。年は国により2003〜2025年 |
| meanAgeFirstMarriage | UN World Marriage Data 2019（SMAM、男女別） | 87/88 | SOM(1982)、SYR(2001)、UZB(2002)は古い調査 |
| pensionReplacementRate | OECD Pensions at a Glance（SDMX、グロス・男性・平均賃金・義務的制度、2024） | 23 | OECD加盟国と掲載のG20の国のみ。ZAFは0.078（義務的な所得比例年金がないため） |
| effectiveTaxRateAvgWorker | OECD Taxing Wages（所得税＋本人社会保険料、単身・子なし・平均賃金、2025） | 16 | OECD加盟国のみ。COLは0（OECDの定義では年金保険料を税に数えないため。ゲームでは下限2%） |
| ipvPast12mWomen | WHO VAW 推計ポータル https://vaw-data.srhr.org/ （15〜49歳・過去1年・身体的または性的） | 23/35 | ポータルの最新推定（2023年版に更新済み）の値。YEM, RUS, IRN, IRQ, UZB, DZA, SOM, SAU, SYR, MYS, PRK, COG は未掲載のため推定のまま |
| inflationRecent | IMF World Economic Outlook October 2026（Excel一括） | 5/7 | 各国の最新年の値。SYR・PRKは未掲載 |
| homicidePer100k | UNODC Data Portal（2026年7月配布Excel） | 0/10 | 対象10か国は総数の率が未掲載のため推定のまま |

### 第3部（Manus調査、2026年10月）：住まい

元データ：data/world/manual/jinsei_receipt_part3.csv。依頼文は manual/prompts/part3_prompt.md（(3)〜(6)は未着手のため未反映）。

| データ | 出典 | 反映した国の数 | 備考 |
|---|---|---|---|
| rentShareOfIncome | World Bank ICP 2021「Housing, water, electricity, gas and other fuels」の支出割合（World Bank API series 9060000） | 79/88 | 分母は AIC（実質個人消費＝政府が個人に提供するサービスを含む）で、家計消費支出だけの割合より少し小さい。ゲームでは日本との比（0.5〜2倍に制限）で家賃の重さを決めるので、全国同じ定義でそろっていることを優先。AFG, YEM, RUS, IRN, MMR, VEN, PRK, HTI, PNG は未掲載で推定のまま |
| housePriceToIncome | Numbeo「Property Prices Index by Country」Price To Income Ratio（2026年の最新掲載） | 53/88 | 二次情報（利用者の投稿にもとづく民間サイト。都市部の物件に偏りやすい）。NGA 116.3・LKA 55.4・GHA 49.0・CMR 46.0 など極端な値があるが、ゲームでは日本との比を0.5〜3倍に制限し、さらに住宅ローンは世帯年収の7倍までに抑えている |

### 第3部の続き（Manus調査、2026年10月）：都市の人口・学費・小さな穴埋め

元データ：data/world/manual/jinsei_receipt_part3b.csv。

| データ | 出典 | 反映した数 | 備考 |
|---|---|---|---|
| places の share（主要19か国） | UN World Urbanization Prospects 2018（File 22、2025年推計の都市圏人口）÷ UN World Population Prospects 2024 の国の人口 | 19か国・95都市 | 名前つきの都市を実際の人口割合に置き換え、「その他の都市」＝都市人口率−名前つき都市の合計、農村部は比率を保って（1−都市人口率）に合わせた。日本語名との対応は build/city_names_ja.json。「広州・深圳」は「広州」に改名（深圳は「その他の都市」に含む）。所得の係数（incomeIndex）は推定のまま |
| tertiaryAnnualCostShareOfGni | USA：OECD（国公立 9,596ドル・私立 34,041ドル）、GBR：イングランドの授業料上限 9,535ポンド（2025-26） | 2か国 | 国公立6割・私立4割で合成し、1人あたりGNIで割った値 |
| pensionReplacementRate | OECD Pensions at a Glance Asia/Pacific 2022（グロス・男性・平均賃金） | PAK 0.411、PHL 0.724、VNM 0.587 | |
| homicidePer100k（COD） | WHO Global Health Estimates（Homicide、2021年） | 12.4 | UNODC に掲載がないため WHO の推計 |
| tertiaryGrossEnrollment（NGA） | World Bank WDI SE.TER.ENRR | 0.097（2011年） | |
| 取り込まなかった値 | VNM remittance_share_gdp（2004年） | — | 2010年より前で古すぎるため |
| 未取得 | tax_rate_avg_worker（13か国）、授業料（17か国）、NGA の1人あたり消費、NGA・JPN の中等教育純就学率、PHL のインフォーマル雇用 | — | 推定のまま |

## 手作業の調査データ 第4部（data/world/manual/jinsei_receipt_part4.csv）

税・社会保険料の「材料」を集め、apply_manual.py で平均賃金・単身の実効負担率（所得税＋本人社会保険料 ÷ 年収）を計算した。

| 項目 | 出典 | 反映した国 | 備考 |
|---|---|---|---|
| 平均月収 | ILOSTAT（パキスタンは統計局 LFS 2024-25、フィリピンは PSA 2024 Occupational Wages Survey） | 計算の材料 | |
| 本人負担の社会保険料率 | 各国の社会保険機関、SSA SSPTW、PwC（エジプト・ベトナムは二次情報） | 計算の材料 | フィリピンの Pag-IBIG は本人上限200ペソ/月があり、実際は約1ポイント低い |
| 所得税の基礎控除・税率表 | 各国の税務当局（エジプト・ベトナムの税率表は PwC、二次情報） | 計算の材料 | 「0%区分の上限」と同じ額の控除は二重に引かない |
| 実効負担率（計算） | 上の材料から計算 | 8か国（IND 12.8%、NGA 9.9%、PAK 1.0%、IDN 4.0%、BGD 0%、EGY 11.0%、PHL 10.0%、VNM 10.0%） | 平均月収が控除より低い国は所得税0で、社会保険料だけになる |

計算しなかった国（推定値のまま）：CHN（社会保険料率が地域ごとで未取得）、BRA（INSS は累進で、最高率しか取れていない）、KEN・ETH・COD（平均月収が税率表より4年以上古い。KEN は税額控除 personal relief も必要）。

## 手作業の調査データ 第5部（data/world/manual/jinsei_receipt_part5.csv、part5b.csv）

| 項目 | 出典 | 反映した国 | 備考 |
|---|---|---|---|
| INSS の累進料率表 | Portaria Interministerial MPS/MF nº 6/2025 | BRA → 実効負担率 12.4% | 平均月収3,393レアルでは保険料率 約8.9% |
| 平均月収・personal relief | KNBS Economic Survey 2025、KRA | KEN → 実効負担率 28.5% | NSSF の上限は2025年2月以降の月額72,000（PwC Kenya、二次情報。part5b.csv に Claude が追記）。住宅税1.5%は含まず、保険料の所得控除も入れていないので、合わせて約1ポイントの誤差 |
| 平均月収 | ESS 労働力調査 2024/25 | ETH → 実効負担率 19.5% | |
| 社会保険料率 | 北京市の公式通告 | CHN は未反映 | 本人負担率の合計が通告に載っていない |
| 最低賃金（SMIG） | ACP の報道 | COD は未反映 | 平均月収ではないため使わない |

## 手作業の調査データ 第6部（data/world/manual/jinsei_receipt_part6.csv、part6_summary.md）

主要20か国の外で、生まれる確率が高い12か国の税・社会保険料の材料。

| 国 | 平均月収の出典 | 税・保険料の出典 | 実効負担率（計算） |
|---|---|---|---|
| TZA | NBS Formal Sector Employment and Earnings Survey 2023/24（formal sector のみ） | TRA 2025/26、NSSF | 16.2%（NSSF 本人10%は上限値） |
| AGO | ILOSTAT 2024 | PwC（二次情報） | 3.0%（月収が非課税枠より低い） |
| MOZ | ILOSTAT 2022（HIES） | RSM 2025、PwC（二次情報） | 3.0%（同上） |
| RUS | Rosstat 2025 | FNS 2025 | 13.0%（本人負担の社会保険料なし） |
| ZAF | Stats SA QES 2023（農業を除く formal sector） | SARS 2025/26 | 15.1%（tax threshold は primary rebate と重なるので引かない） |
| NER | ILOSTAT 2022 | 一般税法典 Art.66、CLEISS | 8.3% |

計算しなかった国：UGA（平均月収が2021年で古い）、IRN・IRQ・MDG・CIV・CMR（2022年以降の平均月収が見つからない）。税率表と保険料率は取り込み済みで、平均月収が届けば計算される。

## 平均月収の物価補正（data/world/cpi_annual.json、build/cpi_series.py）

税・社会保険料の実効負担率を計算するとき、平均月収の年が税率表の年より古い国は、その間の消費者物価上昇率（World Bank WDI FP.CPI.TOTL.ZG、手作業 CSV に IMF WEO の値がある年はそちら）を掛けて、税率表の年の金額に直す。賃金は物価とほぼ同じだけ上がるとみなしている。
- 統計の最終年より後の年（多くは2026年）は、物価が変わらないものとして扱う。
- 10年より古い月収や、途中の年の物価が欠けている国（COD）は計算しない。
- 新たに計算できた国：UGA 21.0%（2021年の月収×1.21）、CIV 15.5%（2019年×1.21）、CMR 10.3%（2021年×1.23）。CIV・CMR の月収は第6部の Manus 要約から転記（part6b.csv）。
- これまでの国も同じ補正をかけ直した（例：NGA 9.9%→12.4%、ETH 19.5%→20.8%、TZA 16.2%→17.1%）。

## ゲーム内の物価の動き（src/engine/risks.ts）

18歳からの毎年の物価上昇率を、その国で実際に記録された年の値（cpi_annual.json）から借りる。人生はこれからの年に進むので、過去の何年分かをひと続きのまま使い（高い物価が何年も続いた時代はそのまま続く）、平均およそ8年ごとに別の時代へ切り替える。1年の上昇率は300%で頭打ち。
- 現金の目減り：預金の利息で年5%ほどは取り戻せるとみなし、残りの上昇分 ×0.8 を価値の減少とする（最大75%、ドルや金で持っていれば3割に）。
- 知らせは、年25%以上の上昇が始まった年（実際の年と国名を添える）と、2年以上続いて収まった年だけに出す。
- 年ごとのデータがない国（PRK）は、これまでどおり平均と暴騰の割合から起こす。
- 目減りした額は支出の区分「inflation」に入れ、レシートに「物価で消えた貯金」として表示する（これまでは「その他の生活費」に混ざっていた）。

## 結婚のしかた（data/world/marriage.json、build/build_marriage.py）

| 項目 | 意味 | 今の値 |
|---|---|---|
| arranged | 結婚のうち、家族が相手を決める・縁談で決まる割合 | 地域ごとの目安（推定）。南アジア0.8、アフガニスタン0.9、サヘル0.7、中東・北アフリカ0.5、サハラ以南0.35、中国0.1、日本0.06、欧米・中南米0.02 など |
| betrothal | そのうち、子どものころに許嫁として決まる割合 | 推定。アフガニスタン0.3、サヘル0.25、イエメン・サウジ0.15、南アジア0.08 など |
| payment / paymentYears | 持参金・婚資の種類と、ふつうの働き手の年収の何年分か | 推定。南アジアは持参金1.5年分、アフガニスタンは婚資2年分、中東はマフル1年分、サハラ以南は婚資0.6年分 など |

調査済みの値は手作業の CSV（arranged_marriage_share、betrothal_share、marriage_payment_amount）から apply_manual.py で置き換える。

### 手作業の調査データ 第7部（jinsei_receipt_part7.csv、part7b.csv）

| 国 | 家族が決める結婚の割合 | 持参金・婚資（1人あたり国民所得の何年分） | 出典・備考 |
|---|---|---|---|
| IND | 0.58（親が選んだ。共同選択37%は含めない） | 持参金 0.67 | IHDS 2005、持参金は南・西インドの農村3村（2008年、中央値5万ルピー） |
| PAK | 0.81 | 持参金 0.94 | Gallup Pakistan 2024（全国）、持参金は農村パンジャブ・シンド（2004年、平均） |
| BGD | 0.942（本人が選んだ5.8%から） | 推定のまま | Matlab の地域値。持参金は年が期間で物価の年が分からず取り込まない |
| ETH | 0.702 | 推定のまま | 7地域のジェンダー調査 2009–10 |
| NGA | 0.216（北中部の地域値、強制婚24%は含めない） | 推定のまま | |
| CHN | 推定のまま | 婚資 1.25 | 福建省の裁判データ（2020年の物価、中央値11.5万元） |
| EGY | 推定のまま | 婚資 2.45（type を mahr から brideprice に） | ELMPS（2018年の物価、中央値。住まいや家財の新郎側負担を含む） |
| JPN | 0.098 | なし | 出生動向基本調査 2021（見合い・結婚相談所などの紹介） |

取り込まなかった値：IDN（1930年以前に生まれた女性だけの値）、VNM（1995年の地域値）。
