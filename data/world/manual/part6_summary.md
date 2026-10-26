# 人生のレシート part6 調査要約

## TZA — United Republic of Tanzania

取得: avg_monthly_earnings, employee_ssc_rate, income_tax_allowance, income_tax_bracket。

未取得:
- income_tax_credit: TRAの2025/26公式税率表・PAYE案内を確認したが、単身・子なし給与所得者に一律適用される年間の所得税額控除（税額から差し引くcredit）の数値は確認できなかった。教育基金寄付は承認時に課税所得から控除されるallowable expenseであり、tax creditではないため採用しない。

地域: 全国制度。TRAのresident individual税率表はTanzania Mainland and Zanzibarに同一掲載。NBS earningsはUnited Republic of Tanzania（MainlandとZanzibarのURT集計）。SSCは民間NSSF・公的PSSSFの全国制度。

二次情報: なし。

アクセス不能・取得困難: なし。

調査注記: ILOSTAT Tanzania country profileは平均月額 earnings項目を表示するが、取得できたページ本文に数値・年が掲載されていなかったため、要件に従い2023/24の最新NBS公式Formal Sector Employment and Earnings Survey（男女計・全産業相当のURT総平均）を優先採用。税率の年額from/toはTRA公式月額表の閾値を12倍したもの。税務年度は2025/26（2025年7月1日開始）として記録し、税率表自体は2021年7月1日発効と明記されている。

## UGA — Uganda

取得: avg_monthly_earnings, employee_ssc_rate, income_tax_allowance, income_tax_bracket。

未取得:
- income_tax_credit: 給与所得者一般に適用される年間の税額控除（所得税額からの控除）は、確認した2025/26の所得税法Schedule 4およびURA公式説明に見当たらないため、行を作成しない。源泉税等の個別tax creditは一般的な給与所得者向け年間税額控除ではない。

地域: 全国制度。地域差なし。

二次情報: なし。

アクセス不能・取得困難: UBOS National Labour Force Survey 2021 PDFは直接本文抽出ができなかったため、平均賃金は同じLFSを出典として掲載するILOSTAT現行データで確認。

調査注記: 所得税は居住者個人の年額chargeable incomeに対するSchedule 4の限界税率。NSSFは総額月額賃金ベースの本人5%・雇用主10%で、公式Membershipページに上限の記載なし。ILOSTATの対象指標ではUgandaの2022年以降値がなく、最新確認値は2021年577,677.938 UGX/月。

## AGO — Angola

取得: avg_monthly_earnings, employee_ssc_rate, income_tax_allowance, income_tax_bracket。

未取得:
- income_tax_credit: 給与所得税額から別途差し引く年間税額控除は、確認した2026年Group A税率表・税務資料に記載がなく、数値を確認できないため未収録。

地域: 全国制度。アンゴラの給与所得税（Group A）および社会保険料は全国制度として記録。

二次情報: employee_ssc_rate: https://taxsummaries.pwc.com/angola/corporate/other-taxes; income_tax_allowance: https://taxsummaries.pwc.com/angola/individual/taxes-on-personal-income; income_tax_bracket: https://taxsummaries.pwc.com/angola/individual/taxes-on-personal-income

アクセス不能・取得困難: なし。

調査注記: ILOSTATは公式の現行ダウンロード表を直接確認し、AGOのTotal（男女計）・全産業の2024年値を採用。税・社会保険は確認できた最新の2026年PwC Worldwide Tax Summariesを使用（AGT公式ポータルの2025措置ページはクライアントサイド表示で税率全表を取得できず、PwC使用を明記）。税率表の閾値は原資料の月額区分を12倍した年額で、整数の境界は月額区分の下限×12として記録。

## MOZ — Mozambique

取得: avg_monthly_earnings, employee_ssc_rate, income_tax_allowance, income_tax_bracket, income_tax_credit。

地域: 全国制度。賃金は全国のILOSTAT HIES観測値。社会保険・IRPSは全国制度で、州・地域差は採用していない。

二次情報: https://www.rsm.global/mozambique/sites/default/files/media/2025/Mozambique%20Tax%20Pocket%20Guide%202025%20ENG.pdf; https://taxsummaries.pwc.com/mozambique/individual/deductions

アクセス不能・取得困難: なし。

調査注記: 税務当局Autoridade Tributáriaの公開ページ（https://www.at.gov.mz/servicos/impostos）はIRPSの制度根拠を確認できるが、2025年の数値表を掲載していなかったため、指定条件に従いRSM 2025ガイドを使用。RSM表は居住者給与の月額PAYE表（dependents別の固定控除列付き）であり、単身・子なしはdependents 0列を採用。税率区分の年額from/toは公表月額境界を機械的に12倍した値で、注記どおり「月額表を12倍」。ILOSTATデータURLは現行データサービスの実ページで、Mozambique、Total sex、ILO sector Total、2022、MZN 13,571.38を確認。

## RUS — Russian Federation

取得: avg_monthly_earnings, employee_ssc_rate, income_tax_bracket。

未取得:
- income_tax_allowance: 2025年の単身・子なし給与所得者について、給与所得を0%にする一般的な年間allowanceは確認できない。FNS公式税率表は最初の区分を0 RUBから13%としており、0%区分の上限は存在しないためrowsには入れない。なお、特定の障害者等や子ども向けの標準控除は単身・子なしの一般ケースに該当しない。
- income_tax_credit: 2025年の給与所得について、所得税額そのものから一律に差し引く年間税額控除（tax credit）は確認できない。FNSが案内する標準・社会・財産等の控除は課税所得から差し引くtax deductionであり、依頼指定のtax creditとは分離されるためrowsには入れない。

地域: 全国制度。賃金はロシア連邦全体、税・社会保険制度も連邦全国制度を採用。

二次情報: なし。

アクセス不能・取得困難: なし。

調査注記: 賃金はILOSTATの値ではなく、優先順位に従いRosstat公式の全国・全産業年次統計を使用。Rosstatの方法論では平均月額名目賃金は組織が従業員に計上した賃金総額を平均従業員数で割ったもの（税・控除前）で、全経済活動を対象とする。所得税率はFNS公式ページ本文で2025年の13/15/18/20/22%と年額境界を確認。employee_sscはFNS公式の保険料支払者・雇用者 тарифの説明から、通常被用者の本人負担なしを記録した。

## ZAF — South Africa

取得: avg_monthly_earnings, employee_ssc_bracket, income_tax_allowance, income_tax_bracket, income_tax_credit。

地域: 全国制度。南アフリカ全土に適用され、州・地域差なし。

二次情報: なし。

アクセス不能・取得困難: なし。

調査注記: 平均賃金はILOSTATの該当する最新値を確認できなかったため、指定優先順位に従いStatistics South Africaの公式QESを使用。QESの平均はformal non-agricultural sectorで、農業を含まない。税務資料はSARS公式の2025/26 Budget Tax Guideを使用。SARSページ上の2026 tax yearは2025-03-01～2026-02-28。UIFページは上限額を2021年6月1日以降として掲載しており、2025年にも適用される公式ルールとして記録した。

## IRN — Iran (Islamic Republic of)

取得: employee_ssc_rate, income_tax_allowance, income_tax_bracket。

未取得:
- avg_monthly_earnings: ILOSTAT Iran country profileのAverage monthly earnings of employeesは2022年以降を含め未掲載（表示は--）。統計局についても男女計・全産業の平均名目月額賃金として検証可能な2022年以降の公表値を確認できなかったため、最低賃金や職種別賃金は代用しない。
- income_tax_credit: 2025/26年の給与所得税について、税額（tax liability）から差し引く年間税額控除は確認できなかった。確認できた2880000000 IRRは課税所得から差し引く0%区分の上限であり、税額控除ではない。

地域: 全国制度。イランの一般被用者社会保険および給与所得税を採用。州・地域差は確認されない。

二次情報: income_tax_allowance and income_tax_bracket: https://tadbirtp.ir/salary-tax-1404/（民間の解説・表。公式の税務当局ページ本文または公式予算PDFを確認できなかったため二次情報）

アクセス不能・取得困難: https://taxsummaries.pwc.com/iran/individual/taxes-on-personal-income（ページ本文を抽出できず、数値根拠には使用しなかった）

調査注記: 通貨はIRR。2025行はイラン暦1404年度（2025/26）を指す。給与税の二次資料表はトマン表記だったため、数値は全て10倍してIRRに統一した。社会保険のSSA資料は2018年版で、現金給付5%と医療2%の内訳を合算した7%である。

## IRQ — Iraq

取得: employee_ssc_rate, income_tax_allowance, income_tax_bracket。

未取得:
- avg_monthly_earnings: ILOSTATおよび確認できたIraq Labour Force Surveyの平均・月額賃金資料は2021年までで、2022年以降の男女計・全産業の確認可能な数値が見つからなかった（2021 LFSは中央値614,400 IQDであり、対象年外かつ平均値ではないため採用不可）。
- income_tax_credit: 2026年6月24日レビューのPwC資料は個人向けのその他の税額控除・優遇を『no other significant tax credits or incentives』としており、給与所得税額から差し引く年間税額控除は確認できないため行を作成しない。

地域: 首都バグダッド所在の連邦イラク制度を採用。社会保険は連邦Law No. 18 of 2023に基づく制度。所得税は連邦イラクの給与税率表であり、クルディスタン地域には雇用所得5%の別扱いがあるため、同地域の数値は採用していない。

二次情報: https://taxsummaries.pwc.com/iraq/individual/taxes-on-personal-income; https://taxsummaries.pwc.com/iraq/individual/deductions; https://taxsummaries.pwc.com/iraq/individual/other-tax-credits-and-incentives

アクセス不能・取得困難: なし。

調査注記: 所得税について税務当局の2025/2026公式資料を確認できなかったため、PwC Worldwide Tax Summariesの2026年レビュー済みページを使用し、該当rowのnoteに二次情報と明記。PwC税率表は月額区分（0–250,000、250,000–500,000、500,000–1,000,000、1,000,000超）として給与源泉実務で提示されるため、指定どおり年額from/toへ12倍して記録。社会保険はSSAの2024年公式International Update本文で、Law No. 18 of 2023、本人5%、covered earningsの構成・5倍上限・石油ガス部門差を確認。

## NER — Niger

取得: avg_monthly_earnings, employee_ssc_bracket, income_tax_bracket。

未取得:
- income_tax_allowance: 2025/2026の給与所得税表には0%区分がなく、最初の区分は月額0–25,000 XOFでも1%のため、単身・子なしの0%区分上限は存在しない。
- income_tax_credit: 2025/2026の公式税務資料で、所得税額から直接差し引く年間税額控除を確認できなかった。家族数による控除（Art.65）は税額控除ではなく課税ベースへの控除・減額のため収録しない。

地域: 全国制度（ニジェール全土）。

二次情報: なし。

アクセス不能・取得困難: ニジェールDGI公式サイト（https://www.impots.gouv.ne/）は調査時点でメンテナンス中。2025年のITS条文・税率表は、政府の財務省サイトが掲載する財政法関連情報と、政府eRegulations掲載のCGI本文で照合した。

調査注記: ILOSTAT値は2022年の国別プロフィール掲載値。社会保険は2024年版CLEISS表（CNSS本人5.25%、月額上限500,000 XOF）およびCNSS雇用主ガイド（年額上限6,000,000 CFA、本人負担5.25%）と整合。給与税の原資料は月額累進表であり、指定に従い各区分の境界を12倍して年額欄を作成した。

## MDG — Madagascar

取得: employee_ssc_rate, income_tax_allowance, income_tax_bracket。

未取得:
- avg_monthly_earnings: ILOSTATの現行年次データ（Average monthly earnings of employees by sex and currency）でマダガスカルの男女計・現地通貨は2015年が最新で、2022年以降の値を確認できなかった。ILOSTATのマダガスカル国別プロフィールは2022年の家計調査を最新調査として示すが、同指標の2022年賃金値は掲載されていない。2015年値は指定対象（2022年以降）外のため採用しない。
- income_tax_credit: 確認した2025年IRSA資料に、所得税額から直接差し引く年間税額控除の別建て制度を確認できなかった（0%区分のallowanceとは分離）。

地域: 全国制度。農業・非農業で社会保険料算定上限が異なるため、該当row noteに両方を記載。

二次情報: income_tax_allowance: https://taxsummaries.pwc.com/madagascar/individual/taxes-on-personal-income; income_tax_bracket: https://taxsummaries.pwc.com/madagascar/individual/taxes-on-personal-income

アクセス不能・取得困難: なし。

調査注記: 通貨はMGA（Malagasy ariary）。ILOSTATの年次データ表は平均月額賃金の定義（男女計Total、現地通貨、名目・総額等）を確認できたが、MDGの最新観測は2015年であった。所得税の確認ページは2025年11月18日レビューのPwC二次資料で、公式DGIサイトでは同じ率表の実ページを特定できなかった。

## CIV — Côte d'Ivoire

取得: employee_ssc_bracket, income_tax_allowance, income_tax_bracket, income_tax_credit。

未取得:
- avg_monthly_earnings: ILOSTATのCôte d'Ivoire国別プロファイルはAverage monthly earnings of employees (XOF), 2022の指標存在を示すが、公式ページが動的表示で数値本体を取得できなかった。ANStatで確認できた平均はENE 2019の給与労働者145,917 XOF/月であり、指定の2022年以降条件を満たさないため代用しなかった。

地域: 全国制度。社会保険・給与所得税とも全国制度で、地域差は確認されない。

二次情報: employee_ssc_bracket: https://www.cleiss.fr/docs/cotisations/cotedivoire.html; income_tax_allowance: https://taxsummaries.pwc.com/ivory-coast/individual/taxes-on-personal-income; income_tax_bracket: https://taxsummaries.pwc.com/ivory-coast/individual/taxes-on-personal-income; income_tax_credit: https://taxsummaries.pwc.com/ivory-coast/individual/deductions

アクセス不能・取得困難: ILOSTAT Côte d'Ivoire country profile numeric data was not exposed in the fetched page because the profile is dynamically rendered: https://ilostat.ilo.org/data/country-profiles/civ/

調査注記: DGI公式の2025年版『Impôts et taxes en Côte d'Ivoire』で月額給与所得税率表とRICF年額表を確認した。税率表は0–75,000、75,001–240,000、240,001–800,000、800,001–2,400,000、2,400,001–8,000,000、8,000,000超の順。年額行は指定どおり月額表を12倍した。CNPSの公式告知（https://www.cnps.ci/wp-content/uploads/2023/01/NOUVEAU-PLAFOND-DES-COTISATIONS-SOCIALES-DE-LA-CNPS.pdf）でも年金月額上限3,375,000 XOFと最低算定基礎75,000 XOFを確認し、本人率の内訳はCNPS加入者ガイド（https://www.cnps.ci/wp-content/uploads/2021/04/GUIDE-ASSURE-SOCIAL.pdf）の6.3%を補完確認した。

## CMR — Cameroon

取得: employee_ssc_bracket, income_tax_allowance, income_tax_bracket。

未取得:
- avg_monthly_earnings: ILOSTAT現行API系列EAR_EMTA_SEX_IND_NB_Aの男女計・全産業・現地通貨データにCMR観測値がなく、2022年以降の適格値を確認できなかった。公式EESI3の平均月額85,600 XAFは2021年値のため採用しない。
- income_tax_credit: 2026年公式税務コードの給与所得税規定を確認したが、所得税額から差し引く年間税額控除は確認できなかった。

地域: 全国制度。

二次情報: なし。

アクセス不能・取得困難: SSA SSPTW 2022-2023 Cameroon URLは取得できず、確認できたSSA Cameroon資料は2019年版。

調査注記: 金額はXAF。税率表はDGI公式2026年1月1日更新版Article 69。Article 29の500,000 XAF定額控除は税額控除ではなく課税所得計算上の控除。最低賃金を平均賃金として採用していない。

