# データ出典一覧（人生のレシート）

凡例: 推定 = ✅確認済（検索で公表値を確認） / ⚠️推定（一次資料未取得のため推定・記憶値・再構成） 
※作業環境から官公庁サイト(mhlw.go.jp, e-stat 等)への直接アクセスが不可だったため、検索結果に現れた公表値で確認し、確認できない値は推定とした。

| データ | 出典名 | 調査年 | URL | 推定値かどうか |
|---|---|---|---|---|
| income.regular / nonRegular（学歴・性・年齢別年収） | 厚生労働省 賃金構造基本統計調査 | 令和6年(2024) | https://www.mhlw.go.jp/toukei/itiran/roudou/chingin/kouzou/z2024/dl/14.pdf | ⚠️推定（アンカー値: 男性大卒所定内417.7千円・ピーク549.6千円、大卒20-24歳250.8千円 等に合わせ年齢カーブを再構成） |
| income.selfEmployedMedianAnnual | 国税庁 申告所得税標本調査 等から概算 | — | https://www.nta.go.jp/publication/statistics/ | ⚠️推定 |
| living.singleMonthly | 総務省 家計調査（家計収支編）単身世帯 | 2024 | https://www.stat.go.jp/data/kakei/sokuhou/tsuki/pdf/fies_gaikyo2024.pdf | ✅（合計169,547円） |
| living.familyMonthlyByHeadAge 40s〜70plus | 総務省 家計調査 二人以上の世帯 世帯主年齢階級別 | 2025 | https://www.stat.go.jp/data/kakei/2025np/pdf/summary.pdf | ✅（2025年値） |
| living.familyMonthlyByHeadAge under30 / 30s | 同上（40歳未満299,100円を按分） | 2025 | 同上 | ⚠️推定 |
| living.retiredCoupleMonthly | 家計調査 65歳以上夫婦のみ無職世帯 | 2024 | https://www.stat.go.jp/data/kakei/sokuhou/tsuki/pdf/fies_gaikyo2024.pdf | ✅ |
| living.educationCostPerChild 公立/私立 幼〜高 | 文部科学省 子供の学習費調査 | 令和5年度 | https://www.mext.go.jp/b_menu/toukei/chousa03/gakushuuhi/ | ⚠️推定（記憶値・未検証） |
| living.educationCostPerChild 国立大学4年 | 国立大学等の授業料その他の費用に関する省令（標準額） | 現行 | https://www.mext.go.jp/ | ✅（制度値） |
| living.educationCostPerChild 私立大学4年 | 文部科学省 私立大学等入学者に係る初年度学生納付金平均額 | 令和5年度 | https://www.mext.go.jp/a_menu/koutou/shinkou/07021403/ | ⚠️推定（記憶値） |
| living.weddingCost | ゼクシィ結婚トレンド調査 | 2024 | https://souken.zexy.net/data/trend2024/XY_MT24_report.pdf | ✅（343.9万円） |
| living.childbirthNetCost | 出産費用の実態（厚労省）− 出産育児一時金50万円 | 2024 | https://www.mhlw.go.jp/ | ⚠️推定 |
| living.funeralCost | 鎌倉新書 お葬式に関する全国調査 | 2024 | https://www.e-sogi.com/ | ⚠️推定（未検証） |
| living.housePriceNewBuilt | 住宅金融支援機構 フラット35利用者調査 | 2023年度 | https://www.jhf.go.jp/about/research/loan_flat35.html | ⚠️推定 |
| living.rentMonthly | 総務省 住宅・土地統計調査 / 市場家賃 | 2023 | https://www.stat.go.jp/data/jyutaku/ | ⚠️推定 |
| lifetable.lifeExpectancy0 | 厚生労働省 令和6年簡易生命表 | 2024 | https://www.mhlw.go.jp/toukei/saikin/hw/life/life24/dl/life24-14.pdf | ✅（男81.09・女87.13） |
| lifetable.qx | 同上（主要年齢の死亡率を幾何補間し平均寿命に校正） | 2024 | https://www.mhlw.go.jp/toukei/saikin/hw/life/life24/ | ⚠️推定 |
| lifetable.causeShare | 厚生労働省 人口動態統計（死因順位） | 2024 | https://www.mhlw.go.jp/toukei/list/dl/gaisuur06_seigo.pdf | ⚠️推定（全年齢構成は確認、年齢層別は推定。自殺はother） |
| education.highSchoolEntryRate / universityEntryRate | 文部科学省 学校基本調査 | 令和6年度 | https://www.mext.go.jp/b_menu/toukei/chousa01/kihon/ | ⚠️一部未検証（98.8% / 59.1% 記憶値） |
| education.highSchoolDropoutRate | 文科省 問題行動・不登校等調査 | 令和5年度 | https://www.mext.go.jp/a_menu/shotou/seitoshidou/1302902.htm | ⚠️推定 |
| education.vocationalEntryRate / graduateSchoolEntryRate / universityDropoutRate | 学校基本調査 / 文科省 中退調査 | 2024 | https://www.mext.go.jp/ | ⚠️推定 |
| education.universityEntryByHouseholdIncome | 東京大学 大学経営・政策研究センター 高校生の進路追跡調査 | 2009報告 | http://ump.p.u-tokyo.ac.jp/crump/ | ⚠️記憶値（31.4/43.9/49.4/54.8/62.4%） |
| education.scholarshipUseRate / privateUniversityShare | JASSO 学生生活調査 / 学校基本調査 | 令和4年度 / 2024 | https://www.jasso.go.jp/statistics/gakusei_chosa/ | ⚠️推定 |
| savings.byAge（40s） | J-FLEC 家計の金融行動に関する世論調査（二人以上世帯） | 2024 | https://www.j-flec.go.jp/wpimages/uploads/yoronf24.pdf | ✅（平均944万・中央値250万） |
| savings.byAge 20s 平均・中央値 | 同上（二次資料） | 2024 | 同上 | ✅（382万/84万, 二次資料） |
| savings.byAge 20s非保有率・30s・50s・60s・70s | 同上 | 2024 | 同上 | ⚠️推定（記憶値） |
| savings.shareByAgeBins | 同上 | 2024 | 同上 | ⚠️推定（中央値等と整合するよう構成） |
| household.incomeBandsWithChildren | 厚生労働省 国民生活基礎調査 | 2023 | https://www.mhlw.go.jp/toukei/saikin/hw/k-tyosa/k-tyosa23/ | ⚠️推定 |
| household.regions.birthShare | 人口動態統計 都道府県別出生数（全国686,061、愛知45,514） | 2024 | https://www.pref.aichi.jp/soshiki/iryo-keikaku/2024kakuteisuu.html | ⚠️推定（概略グルーピング） |
| household.regions.wageIndex / rentIndex / disasterRisk | 賃金構造基本統計調査 都道府県別 / 住宅・土地統計調査 | 2024 / 2023 | — | ⚠️推定 |
| events.lifetimeUnmarriedRate | 総務省 国勢調査（50歳時未婚割合） | 2020 | https://www.ipss.go.jp/syoushika/tohkei/Popular/ | ✅（記憶値, 公表値として周知） |
| events.marriageByAge | 人口動態統計 平均初婚年齢・生涯未婚率から推定 | 2024 | — | ⚠️推定 |
| events.divorceRateAnnual | 人口動態統計 離婚件数 | 2024 | — | ⚠️推定 |
| events.birthsPerCouple | 国立社会保障・人口問題研究所 第16回出生動向基本調査 | 2021 | https://www.ipss.go.jp/ps-doukou/j/doukou16/doukou16_gaiyo.asp | ✅（1.90） |
| events.unemploymentRate | 総務省 労働力調査 | 2024 | https://www.stat.go.jp/data/roudou/ | ✅（2.5%） |
| events.layoffAnnual / jobChangeRateAnnual | 厚労省 雇用動向調査（離職率14.2%）/ 労働力調査 | 2024 | https://www.mhlw.go.jp/toukei/itiran/roudou/koyou/doukou/25-2/index.html | ⚠️推定 |
| events.promotionToManagerBy45 | — | — | — | ⚠️推定 |
| events.cancerLifetimeRisk / cancerIncidenceByAge | 国立がん研究センター がん情報サービス | 2020データ | https://ganjoho.jp/reg_stat/statistics/stat/summary.html | ⚠️推定（記憶値） |
| events.longTermCareNeedRateByAge | 厚労省 介護給付費等実態統計 / 介護保険事業状況報告 | 2023 | https://www.mhlw.go.jp/topics/kaigo/osirase/jigyo/ | ⚠️推定 |
| events.parentCareStartProbByChildAge | — | — | — | ⚠️推定 |
| events.inheritanceAverage / inheritanceProbability | 国税庁 相続税の申告事績 等 | — | https://www.nta.go.jp/ | ⚠️推定 |
| events.majorDisasterAnnualByRiskUnit | — | — | — | ⚠️推定 |
| events.lotteryJackpotOdds | 年末ジャンボ宝くじ 当せん金・本数 | 2024 | https://www.takarakuji-official.jp/ | ✅（1/2,000万） |
| events.lotteryParticipationRate | 宝くじに関する世論調査 | — | — | ⚠️推定 |
| events.startupFiveYearSurvival / startupBigSuccessRate | 中小企業白書 等 | — | https://www.chusho.meti.go.jp/ | ⚠️推定 |
| events.investmentReturn / depositRate | MSCI ACWI 長期実績の概算 / 普通預金金利 | — | — | ⚠️推定 |
| events.pensionMonthly | 厚生労働省 厚生年金保険・国民年金事業の概況 | 令和5年度 | https://www.nenkin.go.jp/info/tokei/kako/r05.files/R05toukei.pdf | ✅（146,429円 / 57,584円） |
| events.retirementAllowance | 厚生労働省 就労条件総合調査 | 令和5年 | https://www.mhlw.go.jp/toukei/itiran/roudou/jikan/syurou/23/ | ✅（大卒1,896万 / 高卒1,682万, 管理・事務・技術職） |
| events.taxAndSocialInsuranceRate | 家計調査 可処分所得/実収入 等 | — | — | ⚠️推定 |

## 推定値一覧（まとめ）
- income.json: regular・nonRegular の全セル（アンカー値に合わせた再構成）、selfEmployedMedianAnnual
- living.json: familyMonthlyByHeadAge.under30/30s、educationCostPerChild（国立大学以外）、childbirthNetCost、funeralCost、housePriceNewBuilt、rentMonthly
- lifetable.json: qx 全体、causeShare 全体
- education.json: highSchoolDropoutRate、vocationalEntryRate、graduateSchoolEntryRate、universityDropoutRate、scholarshipUseRate、privateUniversityShare（universityEntryByHouseholdIncome も記憶値）
- savings.json: 40s と 20s平均/中央値 以外の byAge、shareByAgeBins 全体
- household.json: incomeBandsWithChildren.share、regions の全指標
- events.json: 各ファイルの `estimatedKeys` 配列を参照
