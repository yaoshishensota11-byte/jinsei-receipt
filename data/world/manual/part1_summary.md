# 人生のレシート Part 1 調査要約

CSVは指定された縦長形式で作成しました。数値が確認できない行は `value` と `year` を空欄にし、`note` に理由を記載しています。

## 取得状況

- `ipv_past12m_women`: 23 / 35か国。WHOの対象ページ/APIで「Physical and/or Sexual IPV」「Past year」「15 - 49」を確認しました。

- `inflation_recent`: 20 / 28行（7か国×4年）。IMF WEO October 2026 Excelの「Inflation, average consumer prices, percent change」を抽出しました。

- `homicide_rate`: 0 / 10か国。2026年7月配布のUNODC Excelに、指定した `Dimension=Total`, `Category=Total`, `Sex=Total`, `Age=Total`, `Rate per 100,000 population` の行が見つからなかったため、推測値は入れていません。

## 取得できなかった国・理由

- WHO: `YEM`, `RUS`, `IRN`, `IRQ`, `UZB`, `DZA`, `SOM`, `SAU`, `SYR`, `MYS`, `PRK`, `COG` は、対象の15–49歳・過去1年の推定値が掲載されていません。

- IMF: `SYR` は4年とも未掲載、`PRK` は指標行自体が未掲載です。

- UNODC: `COD`, `MDG`, `CIV`, `MLI`, `TCD`, `SOM`, `GIN`, `PRK`, `TGO`, `COG` は、指定の総数レート行が未掲載です。

## 定義・年に関する注意

- WHOの公式出版物は2018年版を指定しました。ただし、現在の `vaw-data.srhr.org` ポータルは2023年推定値のプラットフォームに更新されています。CSVのWHO行は、指定された画面/APIで実際に返った値を記録し、`note` に「WHO API current portal」と明記しています。2018年版の値だけに固定する必要がある場合は、旧版データファイルの別途確保が必要です。

- IMFの値は、行ごとにWEOの `LATEST_ACTUAL_ANNUAL_DATA` と指定年を比較し、指定年が実績年より後の場合だけ `IMF推計` と記載しました。

- 定義を変えた代替値は採用していません。UNODCで「Other criminal activities」など指定と異なる分類が存在しても、総数の代替にはしませんでした。

## アクセス状況

- WHOポータル、IMF Data、UNODC Data Portal、および各配布ファイル/APIにアクセスできました。ログイン要求はありませんでした。

## 参照元

- [WHO Violence Against Women Prevalence Estimates, 2018](https://www.who.int/publications/i/item/9789240022256)

- [IMF WEO dataset page](https://data.imf.org/en/datasets/IMF.RES:WEO) / [October 2026 Excel](https://data.imf.org/-/media/iData/External-Storage/Documents/0FA3DC49A04D446E9D69DBEB29979E1C/en/WEOOct2026all.xlsx)

- [UNODC Victims of intentional homicide](https://data.unodc.org/datareport/hom-victim) / [data Excel](https://data.unodc.org/sites/dataportal.unodc.org/files/2026-07/data_cts_intentional_homicide.xlsx)
