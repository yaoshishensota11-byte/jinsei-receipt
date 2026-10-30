# jinsei_receipt_part11b 調査概要

このCSVは、一次資料を確認できた行を収録し、確認できなかった値は空欄にして理由をnoteへ記載しています。

## 項目別の値あり国数・値なし国数

- `med_school_entrants_share`: 値あり 0か国、値なし 20か国（IND, CHN, NGA, PAK, IDN, COD, ETH, USA, BGD, BRA, EGY, MEX, PHL, KEN, VNM, JPN, DEU, GBR, FRA, KOR）
- `doctor_wage_ratio`: 値あり 5か国、値なし 15か国（IND, CHN, NGA, PAK, IDN, COD, ETH, USA, BGD, BRA, EGY, PHL, KEN, VNM, JPN）
- `med_student_high_income_share`: 値あり 2か国、値なし 18か国（IND, CHN, NGA, PAK, IDN, COD, ETH, BGD, BRA, EGY, MEX, PHL, KEN, VNM, DEU, GBR, FRA, KOR）
- `outbound_mobility_ratio`: 値あり 20か国、値なし 0か国
- `study_abroad_annual_cost`: 値あり 18か国、値なし 2か国（USA, KOR）
- `study_abroad_by_income`: 値あり 1か国、値なし 0か国
- `single_parent_household_share`: 値あり 10か国、値なし 10か国（PAK, IDN, COD, ETH, BGD, BRA, EGY, PHL, KEN, VNM）
- `single_parent_poverty_rate`: 値あり 10か国、値なし 10か国（NGA, PAK, IDN, COD, ETH, BGD, EGY, PHL, KEN, VNM）
- `sickness_benefit_status`: 値あり 20か国、値なし 0か国
- `long_sick_leave_share`: 値あり 3か国、値なし 17か国（IND, CHN, NGA, PAK, IDN, COD, ETH, BGD, BRA, EGY, MEX, PHL, KEN, VNM, JPN, FRA, KOR）
- `wage_ratio_teacher`: 値あり 4か国、値なし 16か国（IND, CHN, NGA, PAK, IDN, COD, ETH, BGD, BRA, EGY, MEX, PHL, KEN, VNM, JPN, KOR）
- `wage_ratio_nurse`: 値あり 0か国、値なし 20か国（IND, CHN, NGA, PAK, IDN, COD, ETH, USA, BGD, BRA, EGY, MEX, PHL, KEN, VNM, JPN, DEU, GBR, FRA, KOR）
- `wage_ratio_civil_servant`: 値あり 2か国、値なし 18か国（IND, CHN, NGA, PAK, IDN, COD, ETH, USA, BGD, BRA, EGY, MEX, PHL, KEN, VNM, JPN, GBR, KOR）
- `wage_ratio_factory_worker`: 値あり 20か国、値なし 0か国
- `wage_ratio_driver`: 値あり 0か国、値なし 20か国（IND, CHN, NGA, PAK, IDN, COD, ETH, USA, BGD, BRA, EGY, MEX, PHL, KEN, VNM, JPN, DEU, GBR, FRA, KOR）
- `dental_public_coverage`: 値あり 0か国、値なし 20か国（IND, CHN, NGA, PAK, IDN, COD, ETH, USA, BGD, BRA, EGY, MEX, PHL, KEN, VNM, JPN, DEU, GBR, FRA, KOR）
- `dental_visit_cost`: 値あり 0か国、値なし 20か国（IND, CHN, NGA, PAK, IDN, COD, ETH, USA, BGD, BRA, EGY, MEX, PHL, KEN, VNM, JPN, DEU, GBR, FRA, KOR）
- `glasses_cost`: 値あり 0か国、値なし 20か国（IND, CHN, NGA, PAK, IDN, COD, ETH, USA, BGD, BRA, EGY, MEX, PHL, KEN, VNM, JPN, DEU, GBR, FRA, KOR）

## 定義・単位の主な違い

- `outbound_mobility_ratio`、`single_parent_household_share`、`single_parent_poverty_rate`、`long_sick_leave_share`、職業別賃金は、国・資料により対象年齢、分母、雇用者／全就業者、期間が異なるため、各行のnoteを参照してください。
- `wage_ratio_factory_worker` は、ILOSTATの製造業雇用者平均月収／全産業雇用者平均月収で近似しています。
- `study_abroad_annual_cost` は英国学生ビザの生活費資金証明など、平均実費ではなく制度上の金額を含みます。学費が公式に一律掲載されない国は空欄です。
- `study_abroad_by_income` はJPNのみで、長期留学経験者等の調査であり、一般大学生全体の留学率とは定義が異なります。

## 開けなかった・完了できなかった調査

- 16項目のうち14項目は担当が完了しました。`wage_ratio_driver`、`dental_public_coverage`、`dental_visit_cost`、`glasses_cost` は調査担当がクレジット不足で完了しなかったため、20か国分を空欄にしています。
- 医学部入学者、家庭所得上位層の医学部学生など、公式に指定定義の全国値が確認できない国も空欄です。理由と確認先は各行のnoteに記載しています。
