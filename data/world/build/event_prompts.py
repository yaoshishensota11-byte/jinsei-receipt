# 国ごとの出来事（country_events.json）の「起きる確率」を統計で確かめるための、調査依頼文（Gemini Deep Research・Perplexity 向け）を作る。
# 使い方: python3 -I data/world/build/event_prompts.py  → data/world/manual/prompts/part9{a..h}_prompt.md
# 出来事ごとに「何の割合を調べれば確率に直せるか」を STAT に書く。返ってきた CSV は field=event_freq:<id> で取り込む。
import json, os

ROOT = os.path.join(os.path.dirname(__file__), "..")
EVENTS = {e["id"]: e for e in json.load(open(os.path.join(ROOT, "country_events.json"), encoding="utf-8"))}
EN = json.load(open(os.path.join(ROOT, "country_names_en.json"), encoding="utf-8"))

# 出来事の id → 調べてほしい数字（対象の人・数字の意味・よい出典）
STAT = {
    # 日本
    "jpn_tenkin": "正社員のうち、1年間に転居をともなう転勤を経験した人の割合（年率）。出典の例：労働政策研究・研修機構（JILPT）「企業における転勤の実態に関する調査」",
    "jpn_kaigo": "40〜64歳の働く人のうち、1年間に親の介護が新たに始まった人の割合。年率がなければ「介護をしている有業者の数」と「その年齢の有業者の数」（総務省 就業構造基本調査2022）",
    "jpn_earthquake": "1年間に、住んでいる市区町村で震度6弱以上の揺れを観測した人の割合（過去10〜30年の平均）。出典の例：気象庁 震度データベース、総務省の人口",
    "jpn_heavy_rain": "1年間に住宅が浸水被害（床上・床下）を受けた世帯の割合（過去10年の平均）。出典の例：国土交通省「水害統計」の浸水棟数 ÷ 住宅数",
    "jpn_seishain": "非正規で働く人のうち、1年間に正社員に転換した人の割合。出典の例：総務省 労働力調査（詳細集計）「非正規から正規への転換」",
    "jpn_chugaku_juken": "小学6年生のうち、私立・国立の中学校を受験する子の割合（全国と首都圏の両方）",
    # アメリカ
    "usa_medical_bill": "成人のうち、過去1年に救急外来で治療を受け、保険で払われない高額の請求（目安1,000ドル以上）を受けた人の割合。なければ「過去1年に医療費の支払いに困った成人の割合」（CDC NHIS、KFF）",
    "usa_student_loan": "高校卒業者のうち4年制大学にすぐ進学する割合と、そのうち連邦学生ローンを借りる割合（NCES）",
    "usa_layoff": "雇用者のうち、1年間にレイオフ・解雇された人の割合（BLS JOLTS の Layoffs and discharges の年合計 ÷ 雇用者数）。あわせて Displaced Worker Survey の「3年間に会社の都合で職を失った人の割合」",
    "usa_childcare": "0〜2歳の子どもがいる家庭のうち、有料の保育施設を使っている割合と、年間の保育料の中央値",
    "usa_hurricane_wildfire": "成人のうち、1年間に自然災害（ハリケーン・山火事など）で家を離れて避難した人の割合（Census Household Pulse Survey の natural disaster displacement）",
    # 中国
    "chn_unfinished_flat": "完成前の住宅を予約購入した世帯のうち、工事が止まった物件にあたった世帯の割合。なければ、工事停止物件の戸数 ÷ 都市の世帯数",
    "chn_hukou_school": "都市に住む義務教育年齢の子どものうち、戸籍が別の地域にある子ども（随遷子女）の割合（教育部 統計公報）",
    "chn_gaokao": "高考の受験者のうち、4年制大学（本科）に合格した人の割合（教育部）",
    "chn_996": "都市の雇用者のうち、週の労働時間が60時間以上の人の割合（国家統計局）",
    "chn_flood": "農村の人口のうち、1年間に洪水の被害を受けた人の割合（応急管理部の年間被災人口 ÷ 農村人口、過去10年の平均）",
    # インド
    "ind_monsoon_flood": "人口のうち、1年間に洪水の影響を受けた人の割合（過去10年の平均。出典の例：Central Water Commission、NDMA）",
    "ind_entrance_exam": "12年生（高校3年）のうち、JEE Main または NEET を受験する人の割合（受験者数 ÷ 12年生の在籍者数）",
    "ind_wedding_cost": "結婚した世帯のうち、結婚式の費用のために借金をした世帯の割合（家計調査・学術調査）",
    "ind_gulf_work": "20〜45歳の働く人のうち、1年間に湾岸諸国へ出稼ぎに出た人の割合（eMigrate の年間の出国許可数 ÷ その年齢の就業者数）",
    "ind_crop_failure": "農家世帯のうち、1年間に干ばつや雨不足で作物の被害を受けた世帯の割合（NSS 77th round「Situation Assessment of Agricultural Households」など）",
    "ind_private_hospital": "人口のうち、1年間に入院した人の割合と、そのうち私立病院の割合（NSS 75th round）",
    # ナイジェリア
    "nga_fuel_price": "過去20年のうち、ガソリンの公定・平均価格が1年で50%以上上がった年の数",
    "nga_naira_drop": "過去30年のうち、ナイラが対米ドルで1年に30%以上下落した年の数",
    "nga_generator": "都市の世帯のうち、自家用の発電機を持っている（使っている）世帯の割合（NBS、DHS、LSMS）",
    "nga_japa": "22〜40歳の働く人のうち、1年間に就労や留学で国外へ移住した人の割合。なければ、年間の国外移住者数（英国などの就労ビザ発給数）と、その年齢の人口",
    "nga_asuu_strike": "過去20年のうち、国立大学の教員組合（ASUU）のストライキがあった年の数と、それぞれの期間（月）",
    # パキスタン
    "pak_flood": "農村の人口のうち、1年間に洪水の被害を受けた人の割合（過去10年の平均。NDMA）",
    "pak_inflation": "過去30年のうち、消費者物価の上昇率が年20%を超えた年の数（IMF・WDI）",
    "pak_electricity_bill": "都市の世帯のうち、電気代が家計の支出の10%を超える世帯の割合。なければ、過去10年で家庭用の電気料金が1年に20%以上上がった年の数",
    "pak_gulf_work": "20〜45歳の働く人のうち、1年間に海外就労に出た人の割合（Bureau of Emigration and Overseas Employment の年間登録者数 ÷ その年齢の就業者数）",
    "pak_heatwave": "人口のうち、1年間に熱波（気温45度前後以上が続く）の影響を受けた人の割合、または熱波が起きた年の数（過去10年）",
    # バングラデシュ
    "bgd_garment_job": "16〜35歳の人のうち、縫製工場で働いている人の割合（または1年間に新しく縫製業で働きはじめた人の割合）",
    "bgd_flood": "人口のうち、1年間に洪水の被害を受けた人の割合（過去10年の平均）",
    "bgd_cyclone": "沿岸の農村人口のうち、1年間にサイクロンの被害を受けた人の割合（過去10年の平均）",
    "bgd_microcredit": "農村の成人のうち、マイクロファイナンス機関から借りている人の割合（Microcredit Regulatory Authority、Global Findex）",
    "bgd_gulf_work": "20〜40歳の働く人のうち、1年間に海外就労に出た人の割合（BMET の年間出国者数 ÷ その年齢の就業者数）",
    # インドネシア
    "idn_earthquake": "人口のうち、1年間に被害の出た地震の影響を受けた人の割合（BNPB の被災者数、過去10年の平均）",
    "idn_jakarta_flood": "都市の住民のうち、1年間に浸水の被害を受けた人の割合（BNPB、ジャカルタ州の統計）",
    "idn_haze": "人口のうち、森林火災の煙害の影響を受けた人の数（2015年、2019年など）と、煙害が起きた年の数（過去10年）",
    "idn_jkn": "18〜60歳の自営業者・インフォーマルで働く人のうち、国民健康保険（JKN）に入っていない、または保険料を滞納している人の割合（BPJS Kesehatan）",
    "idn_online_loan": "成人のうち、過去1年にオンライン貸金（pinjol）を使った人の割合（OJK）",
    # ブラジル
    "bra_price_rise": "過去20年のうち、消費者物価の上昇率が年6%を超えた年の数（IBGE・WDI）",
    "bra_security": "都市の世帯のうち、防犯の設備やサービスにお金を払っている世帯の割合。なければ、過去1年に犯罪の被害を受けた人の割合（PNAD の被害者調査）",
    "bra_phone_theft": "15歳以上の人のうち、過去1年に携帯電話を盗まれた・奪われた人の割合（PNAD、Fórum Brasileiro de Segurança Pública）",
    "bra_sus_wait": "人口のうち、1年間に公的医療（SUS）で専門医の受診を待った人の割合と、待った期間の中央値",
    "bra_enem": "高校3年生のうち、ENEM を受験する人の割合（INEP）",
    # ドイツ
    "deu_ausbildung": "学校を出た若者のうち、職業訓練（デュアルシステム）に進む人の割合（BIBB）",
    "deu_energy_price": "過去20年のうち、家庭用のガス・暖房費が1年に30%以上上がった年の数（Destatis）",
    "deu_kita": "0〜2歳の子どもの親のうち、保育所（Kita）を希望したが入れなかった親の割合（DJI、Destatis）",
    "deu_flood": "世帯のうち、1年間に洪水・大雨で住宅の被害を受けた世帯の割合（保険会社の団体 GDV など、過去10年の平均）",
    "deu_wohnung": "都市で子育てをしている賃貸世帯のうち、1年間に引っ越し先を探した世帯の割合",
    # イギリス
    "gbr_cost_of_living": "過去20年のうち、消費者物価の上昇率が年5%を超えた年の数（ONS）",
    "gbr_nhs_wait": "人口のうち、1年間に NHS の待機リストに新しく加わった人の割合（NHS England の年間の新規紹介数 ÷ 人口）",
    "gbr_mortgage_rate": "住宅ローンのある世帯のうち、1年間に固定金利の期間が終わる世帯の割合（Bank of England、FCA）",
    "gbr_tuition": "18歳の人のうち、大学に進学する人の割合（UCAS の entry rate）",
    "gbr_rent_rise": "民間の賃貸に住む世帯のうち、過去1年に家賃を上げられた世帯の割合（English Housing Survey）",
    # フランス
    "fra_strike": "過去20年のうち、全国規模の交通機関のストライキがあった年の数",
    "fra_pension_age": "過去30年のうち、年金の支給開始年齢や満額の条件が変わった改革があった年の数",
    "fra_heatwave": "過去20年のうち、熱波の警報（canicule）が出た年の数",
    "fra_prepa": "バカロレアの合格者のうち、グランゼコール準備級（CPGE）に進む人の割合（高等教育省）",
    "fra_creche": "3歳未満の子どもの親のうち、公立保育所（crèche）を希望したが入れなかった親の割合（CNAF、DREES）",
    # メキシコ
    "mex_migrate_us": "18〜40歳の人のうち、1年間に米国へ移住した人の割合（INEGI ENOE の国外移住率、CONAPO）",
    "mex_security": "18歳以上の人のうち、過去1年に犯罪の被害を受けた人の割合（INEGI ENVIPE）",
    "mex_formal_job": "インフォーマルで働く人のうち、1年間に社会保険のある仕事に移った人の割合（INEGI ENOE の移動の統計）",
    "mex_earthquake": "都市の人口のうち、1年間に被害の出た地震の影響を受けた人の割合（過去30年の平均）",
    "mex_hurricane": "人口のうち、1年間にハリケーンの被害を受けた人の割合（CENAPRED、過去10年の平均）",
    # フィリピン
    "phl_ofw": "22〜45歳の働く人のうち、1年間に海外就労（OFW）に出た人の割合（PSA Survey on Overseas Filipinos、DMW の年間出国者数）",
    "phl_typhoon": "人口のうち、1年間に台風の被害を受けた人の割合（NDRRMC、過去10年の平均）",
    "phl_commute": "都市で働く人のうち、片道の通勤時間が1時間以上の人の割合",
    "phl_hospital_deposit": "人口のうち、1年間に入院した人の割合と、入院のときに前払い金を求められた人の割合",
    # エジプト
    "egy_pound_drop": "過去30年のうち、エジプト・ポンドが対米ドルで1年に30%以上下落した年の数",
    "egy_bread_subsidy": "補助金付きパンを受け取っている人の割合と、過去30年のうち補助金付きパンの価格が引き上げられた年の数",
    "egy_tutoring": "高校生のうち、私塾・家庭教師を使っている人の割合（CAPMAS の家計調査 HIECS など）",
    "egy_gulf_work": "22〜45歳の働く人のうち、1年間に湾岸諸国へ働きに出た人の割合",
    "egy_marriage_home": "結婚した世帯のうち、新居や家具の準備のために借金をした世帯の割合",
    # エチオピア
    "eth_birr_float": "過去30年のうち、ブルが対米ドルで1年に30%以上下落した年の数",
    "eth_drought": "農村の人口のうち、1年間に干ばつで食料支援を受けた人の割合（OCHA、過去10年の平均）",
    "eth_conflict_move": "人口のうち、1年間に紛争で新たに国内避難民になった人の割合（IDMC の新規避難者数 ÷ 人口、過去10年の平均）",
    "eth_cbhi": "農村の世帯のうち、地域医療保険（CBHI）に入っている世帯の割合",
    "eth_gulf_work": "18〜35歳の人のうち、1年間に中東へ働きに出た人の割合（労働・技能省の年間出国者数）",
    # コンゴ民主共和国
    "cod_displacement": "人口のうち、1年間に紛争で新たに国内避難民になった人の割合（IDMC、過去10年の平均）",
    "cod_epidemic": "人口のうち、1年間にコレラ・はしかなどの感染症にかかった人の割合（WHO、過去10年の平均）",
    "cod_school_fees": "小学生のいる世帯のうち、学校に関わる費用（制服・教材・教員への謝礼など）を払っている世帯の割合と、その年額",
    "cod_mining": "農村の16〜50歳の人のうち、手掘りの鉱山で働いている人の割合",
    "cod_franc_drop": "過去30年のうち、コンゴ・フランが対米ドルで1年に20%以上下落した年の数",
    # ベトナム
    "vnm_motorbike": "18〜30歳の人のうち、自分のバイクを持っている人の割合（または1年間に新しく買う人の割合）",
    "vnm_land": "30〜60歳が世帯主の世帯のうち、1年間に土地を買った世帯の割合",
    "vnm_typhoon_flood": "人口のうち、1年間に台風・洪水の被害を受けた人の割合（過去10年の平均）",
    "vnm_factory": "農村の18〜35歳の人のうち、1年間に工業団地へ働きに出た人の割合（国内移住調査）",
    "vnm_extra_class": "小中高生のうち、補習授業（học thêm）に通っている人の割合",
    # 韓国
    "kor_hagwon": "小中高生のうち、私教育（塾など）に参加している人の割合（統計庁 私教育費調査）",
    "kor_jeonse": "賃貸世帯のうち、チョンセで借りている世帯の割合と、1年間に新しく賃貸契約を結ぶ世帯の割合",
    "kor_suneung": "スヌンの受験者のうち、浪人生など高校卒業後に受ける人の割合（韓国教育課程評価院）",
    "kor_early_retire": "48〜56歳の雇用者のうち、1年間に希望退職・早期退職をした人の割合",
    "kor_wedding_home": "結婚を考えている人のうち、住宅費を理由に結婚を延ばした人の割合（保健社会研究院など）",
    # ケニア
    "ken_mpesa_loan": "成人のうち、過去1年にモバイル融資（M-Shwari など）を使った人の割合（FinAccess 2024）",
    "ken_drought": "農村の人口のうち、1年間に干ばつで食料が足りなくなった人の割合（NDMA、過去10年の平均）",
    "ken_school_fees": "中等学校の生徒のうち、寮のある学校（boarding）に通う人の割合と、寮費などの年額",
    "ken_fuel_tax": "過去20年のうち、ガソリンの価格が1年に20%以上上がった年の数",
    "ken_harambee": "成人のうち、過去1年に地域の寄付集め（harambee）や助け合いのグループにお金を出した人の割合（FinAccess）",
    # いくつもの国に共通の出来事（所得水準ごとの平均でよい）
    "gen_lic_malaria": "低所得国の人口のうち、1年間にマラリアにかかった人の割合（WHO World Malaria Report の国別の年間症例数 ÷ 人口。低所得国の平均と、主な国の値）",
    "gen_savings_group": "低所得国・低中所得国の成人のうち、過去1年に積立グループ（savings club、ROSCA）でお金を貯めた人の割合（Global Findex の所得水準ごとの値）",
    "gen_rural_harvest": "低・中所得国の農家世帯のうち、1年間に天候による不作で収入が大きく減った世帯の割合（LSMS、FAO）",
    "gen_urban_rent": "都市で賃貸に住む世帯のうち、1年間に大家の都合で退去を求められた世帯の割合（各国の住宅調査。主な数か国の値）",
    "gen_scam_call": "成人のうち、過去1年に電話・SMS の詐欺でお金をだまし取られた人の割合（Global Anti-Scam Alliance、各国の犯罪被害調査。主な数か国の値）",
    "gen_relative_loan": "成人のうち、過去1年に家族・友人からお金を借りた人の割合（Global Findex の所得水準ごとの値）",
    "gen_hic_pension": "高所得国の雇用者のうち、職場の確定拠出年金・税優遇の積立制度に入っている人の割合（OECD Pensions at a Glance）",
    "gen_hic_burnout": "高所得国・高中所得国の働く人のうち、過去1年に仕事のストレスで心身の不調を経験した人の割合（EU-OSHA、Eurofound、ILO）",
    "gen_umc_lmc_gig": "中所得国の都市で働く人のうち、配達・配車などのアプリの仕事をしている人の割合（ILO）",
}

BATCHES = [
    ("a", ["JPN", "USA", "CHN"]),
    ("b", ["IND", "NGA", "PAK"]),
    ("c", ["BGD", "IDN", "BRA"]),
    ("d", ["DEU", "GBR", "FRA"]),
    ("e", ["MEX", "PHL", "EGY"]),
    ("f", ["ETH", "COD", "VNM"]),
    ("g", ["KOR", "KEN", "*"]),
]

HEAD = """[Role]
あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を検索し、出典URL付きで正確に表にまとめます。推測で数字を埋めることはしません。

[Context]
- 私は、生まれた国によってお金の一生が変わるブラウザゲーム「人生のレシート」を作っています。目的は、統計にもとづいて「世界にはこういう暮らしがある」と知ってもらうことです。
- ゲームでは、国ごとの出来事（転勤、洪水、通貨の下落など）が、ある確率で起きます。いまの確率は、私がおおよそで決めた推計です。
- これを統計で確かめたいので、出来事ごとに「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字を集めてください。確率への直し方は私が計算します。あなたは数字と出典を集めるだけで構いません。

[Task]
次の出来事について、それぞれ「調べる数字」を探してください。番号順に1つずつ進めてください。
英語と、その国の言葉の両方で検索し、政府統計・国際機関の資料を優先してください。

{tasks}

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
"""

FOOT = """
システム保守情報
- Version：2026.10 作成
- Update Suggestion：なし
"""


def task_lines(isos):
    lines = []
    n = 1
    for e in EVENTS.values():
        tags = e["iso3"]
        own = [t for t in tags if t in isos]
        generic = "*" in isos and all(t.startswith("*") for t in tags)
        if not own and not generic:
            continue
        if e["id"] not in STAT:
            raise SystemExit(f"STAT がない: {e['id']}")
        if generic:
            where = "対象の国：所得水準ごとの平均（世界銀行の分類）。iso3 の列には LIC／LMC／UMC／HIC（低所得／低中所得／高中所得／高所得）と書く。国別の値があれば主な数か国も（iso3 は国のコード）"
        else:
            where = f"対象の国：{own[0]}（{EN.get(own[0], own[0])}）"
        lines.append(
            f"({n}) event_freq:{e['id']}　{e['title']}\n"
            f"    ゲームでの場面：{e['situation']}\n"
            f"    {where}\n"
            f"    調べる数字：{STAT[e['id']]}"
        )
        n += 1
    return "\n\n".join(lines), n - 1


def main():
    out_dir = os.path.join(ROOT, "manual", "prompts")
    total = 0
    for key, isos in BATCHES:
        body, n = task_lines(isos)
        total += n
        text = HEAD.replace("{tasks}", body)
        name = "・".join("共通の出来事" if i == "*" else EN.get(i, i) for i in isos)
        md = f"# 第9部{key}：国ごとの出来事の確率（{name}、{n}件）\n\nGemini の Deep Research（または Perplexity の Research モード）に、下のコードブロックをそのまま貼る。返ってきたCSVは jinsei_receipt_part9{key}.csv として保存する。\n\n```\n{text}```\n{FOOT}"
        with open(os.path.join(out_dir, f"part9{key}_prompt.md"), "w", encoding="utf-8") as f:
            f.write(md)
        print(f"part9{key}: {n}件")
    if total != len(EVENTS):
        raise SystemExit(f"出来事の数が合わない: {total} / {len(EVENTS)}")


main()


# ───── Gemini（Deep Research）向け：短く、記号（```）を使わず、10件ずつに分ける ─────
GEMINI_HEAD = """あなたは国際統計の調査アシスタントです。政府・国際機関・大学の一次資料を調べ、出典URL付きで表にまとめてください。推測で数字を埋めないでください。

背景：私は、生まれた国によってお金の一生が変わる教育用のブラウザゲームを作っています。ゲームの中で起きる出来事の確率を、統計で確かめたいと考えています。確率への計算は私がするので、あなたは「対象の人のうち、どのくらいの割合がそれを経験するか」が分かる数字と出典を集めてください。

調べてほしいこと（番号順に）：
{tasks}

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
表のあとに、見つからなかった項目とその理由を短く書いてください。"""


RISK_GEMINI = """あなたは国際統計の調査アシスタントです。国際機関・政府の一次データを調べ、出典URL付きで表にまとめてください。推測で数字を埋めないでください。

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
表のあとに、見つからなかった国とその理由を短く書いてください。"""


def gemini_tasks(events):
    out = []
    for i, e in enumerate(events, 1):
        tags = e["iso3"]
        if all(t.startswith("*") for t in tags):
            where = "所得水準ごとの平均。iso3 は LIC／LMC／UMC／HIC"
        else:
            where = EN.get(tags[0], tags[0])
        out.append(f"{i}. {e['id']}（{where}）：{STAT[e['id']]}")
    return "\n".join(out)


def gemini_main():
    out_dir = os.path.join(ROOT, "manual", "prompts")
    evs = list(EVENTS.values())
    size = 10
    parts = [evs[i : i + size] for i in range(0, len(evs), size)]
    lines = ["# 第9部：国ごとの出来事の確率（Gemini の Deep Research 用）", "", f"全{len(evs)}件を{len(parts)}回に分けています。1回分ずつ、新しいチャットで「Deep Research」を選んでから、区切り線の間の文をそのまま貼ってください。", ""]
    for n, chunk in enumerate(parts, 1):
        names = "・".join(dict.fromkeys(("共通" if e["iso3"][0].startswith("*") else EN.get(e["iso3"][0], e["iso3"][0])) for e in chunk))
        lines += [f"## {n}回目（{names}）", "", "----- ここから -----", GEMINI_HEAD.replace("{tasks}", gemini_tasks(chunk)), "----- ここまで -----", ""]
    lines += [f"## {len(parts) + 1}回目（国のリスク：治安・パートナーからの暴力・物価）", "", "----- ここから -----", RISK_GEMINI, "----- ここまで -----", ""]
    with open(os.path.join(out_dir, "part9_gemini.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"part9_gemini.md: {len(parts)}回")


gemini_main()
