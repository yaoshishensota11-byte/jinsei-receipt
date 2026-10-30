# 未完了項目の再調査更新

- `wage_ratio_driver`: ILOSTATの20か国データを再取得し、値あり 18か国。取得できた値はISCO-08大分類8を「運転手」の近似としているため、各行noteに定義差を記載。
- `dental_public_coverage`: OECD Health at a Glance 2025 Figure 5.7のStatLink（2023年または最近年）から、対象20か国中OECD図表に掲載されたJPN/DEU/GBR/FRA/KOR/BRAの6か国を更新。これは成人限定の制度statusではなく、歯科医療費全体の公的・強制保険負担割合。
- `dental_visit_cost` と `glasses_cost`: 今回確認できた一次資料では、20か国共通で比較可能な「虫歯1本の自己負担額」「めがね1本価格」の公式数値を確認できなかったため、空欄を維持。
- OECD出典: https://stat.link/bos5wh
- ILOSTAT出典例: https://rplumber.ilo.org/data/indicator/?id=EAR_EMTA_SEX_OCU_NB_A&ref_area=IND
- `dental_public_coverage`の値は指定statusに合わせ、成人歯科費用の公的・強制保険負担が一部である6か国を0.5とした。元の負担割合はnoteに保持。
