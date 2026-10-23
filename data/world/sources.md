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
