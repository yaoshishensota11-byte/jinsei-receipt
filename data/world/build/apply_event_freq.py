"""第9部（Gemini の Deep Research）で確かめた、国ごとの出来事の確率を country_events.json に反映する。
判断の理由は data/world/manual/part9_review.md。値は manual/jinsei_receipt_part9_*.csv の数字から計算した。
何度実行しても同じ結果になる。使い方: python3 -I data/world/build/apply_event_freq.py
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
P = ROOT / "country_events.json"
EV = json.loads(P.read_text(encoding="utf-8"))

# 出来事の id → (新しい年率, 根拠)。年率が None なら今の値のまま、根拠だけ統計に置き換える
CHECKED = {
    # 確率を直したもの
    "jpn_heavy_rain": (0.001, "2023年の水害の被害建物は約3.1万棟で、全住宅6,505万戸の約0.05%（国土交通省 水害統計）。大きな水害の年も含めて年0.1%"),
    "usa_hurricane_wildfire": (0.013, "成人の1.37%が過去1年に自然災害で避難した（国勢調査局 Household Pulse Survey 2023）"),
    "chn_hukou_school": (0.015, "義務教育の子の8.4%が戸籍が別の地域にある随遷子女（教育部 2023年統計公報）。一度きりの出来事として10年で約1割"),
    "chn_flood": (0.02, "過去10年の年平均の被災人口は約6,200万人で農村人口の13%（応急管理部）。軽い影響やほかの災害も含む数え方なので、家が水につかる場面として年2%"),
    "ind_entrance_exam": (0.07, "JEE Main・NEET の受験者は12年生の約2割（NTA・UDISE+）"),
    "ind_gulf_work": (0.003, "湾岸などへの出国許可は年39.8万人（外務省 2023年）。20〜45歳の就業者約3億人の約0.13%。誘いの場面なのでその2倍ほど"),
    "nga_generator": (0.02, "都市の世帯の52%が自家用発電機を持つ（世界銀行 LSMS 2018-19）"),
    "nga_asuu_strike": (0.2, "過去20年のうち10年で大学教員組合のストライキがあった（二次情報）。在学中に一度はほぼ必ず出会う"),
    "bgd_gulf_work": (0.025, "海外就労の出国者は年113万〜131万人で就業者7,080万人の約1.7%（BMET・統計局 2022-23年）。20〜40歳に限ればそれ以上"),
    "bgd_garment_job": (0.02, "縫製工場で働く人は約400万人で、15〜34歳人口の約7%（BGMEA・2022年国勢調査）"),
    "idn_earthquake": (0.004, "2022年チアンジュール地震の被災者は約50万人で人口の0.2%（BNPB）。ほかの地震も含めて年0.4%"),
    "idn_jakarta_flood": (0.02, "2020年のジャカルタ洪水の避難者は人口の0.3%（BNPB）。冠水で仕事に行けない人はそれより多い"),
    "gbr_rent_rise": (0.15, "民間賃貸の63%が過去1年に家賃を上げられた（English Housing Survey）。場面は大きな値上げ"),
    "fra_strike": (0.2, "過去20年のうち14年で全国規模の交通ストライキ（INSEE・SNCF）"),
    "fra_pension_age": (0.2, "過去30年で6回の年金改革（1995・2003・2010・2014・2020・2023年、労働省）"),
    "fra_heatwave": (0.15, "過去20年のうち19年で熱波警報（Météo-France・公衆衛生庁）"),
    "bra_phone_theft": (0.1, "16歳以上の約10%が過去1年に携帯電話を盗まれた（ブラジル公共安全フォーラム・Datafolha 2024）"),
    "idn_online_loan": (0.01, "オンライン貸金の借り手は約1,657万口座で成人約2億人の8%（OJK、二次情報）"),
    "fra_prepa": (0.05, "バカロレア合格者約73万人のうち準備級（CPGE）に進むのは約4.3万人で約6%（高等教育省）"),
    "mex_migrate_us": (0.007, "2018〜2023年の約5年で約107万人が米国へ移住、年0.17%（INEGI ENADID 2023）。18〜40歳に限ると年0.4%前後"),
    "mex_security": (0.05, "18歳以上の24%が過去1年に犯罪の被害を受けた（INEGI ENVIPE 2025）"),
    "mex_formal_job": (0.12, "インフォーマルからフォーマルの仕事へ年27%が移る（ENOE の分析）。働く人の約55%がインフォーマル"),
    "mex_earthquake": (0.001, "2017年9月の地震の被害住宅は17.1万戸で全住宅の0.5%（CENAPRED）。大きな被害は数十年に一度"),
    "mex_hurricane": (0.015, "2023年に自然災害（主にハリケーン・豪雨）の被害を受けた人は315万人で人口の2.5%（CENAPRED）"),
    "phl_ofw": (0.01, "海外で働くフィリピン人は約216万人で、就業者の約4.5%（PSA Survey on Overseas Filipinos 2023、二次情報）"),
    "egy_bread_subsidy": (0.02, "人口の約55%が補助金付きパンを受給。値上げは2024年が36年ぶり（米国農務省の報告）"),
    "egy_tutoring": (0.2, "高校生の42〜60%が私塾・家庭教師を使う（CAPMAS の報告、二次情報）"),
    "phl_hospital_deposit": (0.05, "公的医療保険（PhilHealth）の請求は年約940万件で人口の約8%（2024年）。家族の誰かの入院の場面"),
    "eth_drought": (0.03, "2023年に干ばつで食料支援を受けた人は約1,100万人で農村人口の約10%（OCHA）。大きな干ばつは数年に一度"),
    "cod_displacement": (0.015, "紛争による新たな国内避難は年平均148万人で人口の1.6%（IDMC、過去10年）"),
    "cod_franc_drop": (0.1, "過去30年のうち11年でコンゴ・フランが1年に20%以上下落（中央銀行・IMF）"),
    "cod_mining": (0.02, "手掘り鉱山で働く人は約200万人で、農村の15〜64歳の約1割（世界銀行）。鉱山は東部・南部に集中"),
    "vnm_typhoon_flood": (0.015, "台風・洪水などの被害を受ける人は年平均約120万人で人口の約1.2%（統計総局・防災当局）"),
    "vnm_factory": (0.04, "農村の18〜35歳の4.2%が1年に働くためにほかの省へ移る（統計総局・UNFPA 国内移住調査）"),
    "gen_lic_malaria": (0.12, "マラリアは年約2億6,300万件で、危険のある地域の人口22億人の約12%（WHO World Malaria Report 2024）。低所得国はさらに高い"),
    "gen_relative_loan": (0.06, "過去1年に家族・友人からお金を借りた成人は低所得国44%、低中所得国32%（世界銀行 Global Findex 2021）"),
    "gen_hic_burnout": (0.05, "EUの働く人の44%が過去1年に仕事のストレスや不調を経験（Eurofound 2022）。燃え尽きはその一部"),
    # 確率はそのまま、統計で確かめたもの
    "jpn_kaigo": (None, "介護をしながら働く人は約365万人、介護のための離職は年10.6万人（総務省 就業構造基本調査2022）"),
    "jpn_seishain": (None, "不本意非正規から正規への転換は年6.3%（リクルートワークス研究所 全国就業実態パネル調査）"),
    "usa_medical_bill": (None, "過去1年に医療費の支払いに困った家族の人は10.8%（CDC NHIS）。救急外来の高額請求はその一部"),
    "chn_gaokao": (None, "高考受験者1,291万人に対し4年制大学（本科）の定員は約478万人で37%（教育部 2023年）"),
    "ind_monsoon_flood": (None, "洪水の被災人口は年平均約3,234万人で人口の2.3%（中央水委員会）"),
    "ind_private_hospital": (None, "1年に人口の2.9%が入院し、その65%が私立病院（NSS 75th round 2017-18）"),
    "nga_naira_drop": (None, "過去30年のうち5年でナイラが1年に30%以上下落（中央銀行・IMF）"),
    "pak_inflation": (None, "過去30年のうち3年で物価上昇率が年20%を超えた（世界銀行 WDI）"),
    "pak_gulf_work": (None, "海外就労の登録は年約86万人で就業者7,121万人の1.2%（BEOE 2023年・統計局）"),
    "bgd_flood": (None, "1回の洪水の被災者は580万〜730万人で人口の3〜4%（OCHA・UNICEF 2022・2024年）"),
    "bgd_cyclone": (None, "大きなサイクロン1回の被災者は240万〜260万人で、おおむね2年に一度（OCHA 2020・2024年）"),
    "bgd_microcredit": (None, "マイクロファイナンスの借り手は約3,217万人で15〜64歳の28%（MRA 2024年）"),
    "idn_haze": (None, "2015年の森林火災の煙は約4,300万人に影響（世界銀行）。大きな煙害は約4年に一度"),
    "idn_jkn": (None, "保険料の滞納などで使えない JKN 加入者は約6,300万人で人口の約23%（保健省、二次情報）"),
    "bra_security": (None, "全世帯の4%が過去1年に窃盗の被害（IBGE PNAD 2021）"),
    "bra_price_rise": (None, "2005〜2024年のうち5年でIPCAの上昇率が6%を超えた（IBGE）"),
    "bra_sus_wait": (None, "SUSで手術を待つ人は約68万人（保健省、二次情報）。専門医の受診待ちはさらに多い"),
    "bra_enem": (None, "高校3年生約200万人のうち約130万人がENEMを受験（INEP 2024年）"),
    "deu_ausbildung": (None, "学校を出た若者の約半数がデュアル職業訓練に進む（BIBB）"),
    "deu_energy_price": (None, "過去20年で家庭用エネルギー価格が1年に30%以上上がったのは2022年のみ（連邦統計局）"),
    "deu_kita": (None, "3歳未満の保育所の不足は約30万人分で、3歳未満の子の約15%（IW・連邦統計局 2025年）"),
    "deu_wohnung": (None, "借家世帯の38%が過去1年に引っ越しを具体的に検討（ドイツ借家人協会 2025年）"),
    "gbr_cost_of_living": (None, "過去20年のうち2年（2022・2023年）で物価上昇率が5%を超えた（ONS）"),
    "gbr_nhs_wait": (None, "NHS England の新規紹介は年約2,360万件（2023年）"),
    "gbr_mortgage_rate": (None, "住宅ローン世帯の約18%が毎年固定金利の期間の終わりを迎える（イングランド銀行 2024年）"),
    "gbr_tuition": (None, "18歳の大学進学率は約32%（UCAS）"),
    "fra_creche": (None, "母親の37%が保育所探しに制約・不満を経験（DREES・上院の報告書）"),
    "phl_typhoon": (None, "2023年に台風の被害を受けた人は約864万人で人口の約8%（EM-DAT）"),
    "egy_pound_drop": (None, "過去30年のうち3年でエジプト・ポンドが1年に30%以上下落（2016・2022・2024年）"),
    "eth_birr_float": (None, "過去30年でブルが1年に30%以上下がったのは2024年の変動相場制への移行のみ（中央銀行）"),
    "eth_cbhi": (None, "地域医療保険の実施地域での加入率は約40%（系統的レビュー 2023年）"),
    "eth_conflict_move": (None, "2022年に紛争で新たに避難した人は約200万人で人口の約1.5%（IDMC）"),
    "eth_gulf_work": (None, "正規の海外就労の出国は年約18.8万人で15〜34歳人口の約0.7%（労働・社会省 2012年）"),
    "cod_epidemic": (None, "はしかなどの感染症の患者は年10万〜30万件（WHO・CDC）。流行の報告はそれより広く起きる"),
    "cod_school_fees": (None, "無償化後も小学生のいる世帯の約7割が学校の費用を負担（世界銀行・ユネスコ）"),
    "vnm_motorbike": (None, "世帯の88.5%がバイクを持つ（統計総局 2019年）"),
    "vnm_extra_class": (None, "補習授業の参加は小学校32%、中学校46%、高校63%（Young Lives 調査）"),
    "kor_hagwon": (None, "小中高生の私教育参加率は78.5%（統計庁 2023年）"),
    "kor_suneung": (None, "スヌン受験者の35.4%が卒業生など（教育部 2024年度）"),
    "ken_mpesa_loan": (None, "成人の28%が過去1年に政府のモバイル融資を利用（中央銀行 FinAccess 2024）"),
    "ken_drought": (None, "乾燥・半乾燥地域の人口の16%が急性の食料不足（IPC）"),
    "ken_harambee": (None, "成人の28.5%が過去1年に助け合いグループや地域の寄付にお金を出した（中央銀行 FinAccess 2024）"),
    "gen_savings_group": (None, "過去1年に積立グループで貯めた成人は低所得国21%、低中所得国13%（世界銀行 Global Findex 2021）"),
    "gen_hic_pension": (None, "高所得国の働く人の約51%が職場の積立年金に加入（OECD Pensions at a Glance 2023）"),
}

# 出る条件を直したもの（状況と合わない人に出ていた）
REQUIRES = {"jpn_seishain": "working+nonregular"}

MARK = "（統計で確認）"
done = 0
for e in EV:
    if e["id"] in REQUIRES:
        e["requires"] = REQUIRES[e["id"]]
    if e["id"] not in CHECKED:
        continue
    p, basis = CHECKED[e["id"]]
    if p is not None:
        e["annualProb"] = p
    e["basis"] = basis + MARK
    e["estimated"] = False
    done += 1
P.write_text(json.dumps(EV, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
left = [e["id"] for e in EV if e.get("estimated")]
print(f"統計で確かめた出来事: {done} / {len(EV)}（推計のまま {len(left)}件）")
print("推計のまま:", " ".join(left))
