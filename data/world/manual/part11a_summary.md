# 「人生のレシート」part11a 調査要約

対象88か国、指定8指標を公式データベース・報告書から収集しました。最終CSVは主指標88行×8に、副指標 `nonfatal_occupational_injury_rate` 40行と `social_protection_coverage` 85行を加えた計829行です。値が確認できない主指標は空欄のまま残し、noteに理由を記載しています。

## 項目別の取得状況

| field | 値あり | 値なし（ISO3） |
|---|---:|---|
| `road_traffic_death_rate` | 88/88 | なし |
| `maternal_mortality_ratio` | 88/88 | なし |
| `child_labour_share` | 60/88 | CHN, PAK, USA, IRN, SOM, JPN, DEU, GBR, FRA, MAR, THA, SAU, SYR, MYS, VEN, ITA, GTM, CAN, SSD, ESP, AUS, POL, TJK, BOL, HTI, PNG, KOR, ISR |
| `account_ownership` | 77/88 | SDN, YEM, AGO, SOM, SYR, BDI, RWA, PRK, HTI, PNG, CAF |
| `fatal_occupational_injury_rate` | 41/88 | CHN, NGA, IDN, COD, ETH, BGD, TZA, UGA, SDN, KEN, AFG, VNM, YEM, AGO, MOZ, IRN, IRQ, NER, MDG, CIV, CMR, MLI, GHA, TCD, SOM, ZMB, MWI, MAR, NPL, PER, SEN, SYR, GIN, BEN, VEN, RWA, KHM, PRK, SSD, TJK, BOL, SLE, HTI, PNG, CAF, HND, COG |
| `social_assistance_coverage_q1` | 69/88 | USA, MDG, DZA, JPN, DEU, GBR, FRA, SAU, SYR, ITA, KHM, CAN, PRK, ESP, AUS, CAF, KOR, COG, ISR |
| `dementia_prevalence_65plus` | 0/88 | IND, CHN, NGA, PAK, IDN, COD, ETH, USA, BGD, BRA, EGY, TZA, MEX, PHL, UGA, SDN, KEN, AFG, VNM, YEM, AGO, MOZ, RUS, ZAF, IRN, IRQ, NER, MDG, CIV, CMR, TUR, MLI, UZB, DZA, MMR, GHA, TCD, SOM, JPN, BFA, COL, DEU, GBR, ZMB, FRA, MWI, MAR, THA, NPL, SAU, PER, SEN, SYR, ARG, ZWE, GIN, BEN, BDI, MYS, VEN, KAZ, RWA, ITA, GTM, KHM, CAN, PRK, SSD, ESP, AUS, POL, TJK, ECU, TGO, BOL, SLE, HTI, PNG, LKA, CAF, JOR, HND, KOR, UKR, DOM, COG, ISR, CHL |
| `older_living_alone_share` | 85/88 | SAU, PRK, LKA |
| `nonfatal_occupational_injury_rate`（副指標） | 40 | 公式系列で値を確認できた国のみ |
| `social_protection_coverage`（副指標） | 85 | 公式系列で値を確認できた国のみ |

## 指定と異なる定義・条件

- `child_labour_share`: 値あり60か国は公開系列の「経済活動」の最新観測値。指定のSDG 8.7.1一般生産境界（経済活動＋家事）と差があるため、各行noteに記載。
- `fatal_occupational_injury_rate`: ILOSTATの国別reference groupは必ずしも同一ではない。定義差と年を各行noteに記載。2010年より前の値は IND、PAK、DZA、BFA、TGO、JOR、DOM。
- `social_assistance_coverage_q1`: ASPIREの系列は公式名称上、最貧五分位のsocial safety net coverageであり、社会扶助単独とは異なる。
- `social_protection_coverage`: ILOの全人口対象・総合系列で、Q1対象ではないため、主指標との定義差を各行noteに記載。
- `older_living_alone_share`: UN DESAの65歳以上・1人世帯居住割合。2010年より前は SYR 2006、MYS 2000、VEN 2001、PNG 2000。
- `account_ownership`: Global Findex 2025の2024年値を優先。AFG、MMR、SSDは2021年値。
- 母体死亡率は2023年MMEIG推計。15歳女性の生涯リスク副指標は同じ公式表で国別掲載を確認できなかったため追加なし。
- 認知症はWHO GDOおよびIHME GBDの公式画面から、65歳以上の国別有病割合をこの環境で取得できなかったため、88か国すべて空欄。

## 開けなかった公式サイト・データ

- UNICEF SDMX: https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/data/UNICEF,PT,1.0/.PT_CHLD_5-17_LBR_ECON-HC......?format=csv （503）
- UNICEF Excel: https://data.unicef.org/wp-content/uploads/2023/06/xls_pt_child_labour_June_2026.xlsx （ExcelではなくHTML応答）
- Global Findex 2025公式CSV直リンク: https://thedocs.worldbank.org/en/doc/be6615202d1f08a25855c8ac2d615122-0050012025/related/GlobalFindexDatabase2025.csv （403。代わりに公式API・指標ページを使用）
- IHME GBD Results: https://vizhub.healthdata.org/gbd-results/ （この環境から65歳以上の国別値を取得できず）

## 主な出典ページ

- WHO GHO road traffic death rate: https://www.who.int/data/gho/data/indicators/indicator-details/GHO/estimated-road-traffic-death-rate-(per-100-000-population)
- World Bank WDI maternal mortality ratio: https://data.worldbank.org/indicator/SH.STA.MMRT
- World Bank Global Findex account ownership: https://www.worldbank.org/en/publication/globalfindex
- World Bank ASPIRE: https://www.worldbank.org/en/data/datatopics/aspire
- ILOSTAT: https://ilostat.ilo.org/data/
- UNICEF Data child labour: https://data.unicef.org/topic/child-protection/child-labour/
- UN DESA older persons living arrangements: https://www.un.org/development/desa/pd/data/older-persons
