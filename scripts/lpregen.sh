#!/bin/bash
# 紹介ページ（public/lp/）を、いまのゲームで作り直す。共有URLの版（CODEC_VERSION）を上げたあとに使う。
# 使い方: bash scripts/lpregen.sh 前の版の番号   （例：版を18に上げたなら bash scripts/lpregen.sh 17）
# 作り直すもの：例のレシートのリンクと説明・画像、各国の生涯の稼ぎ（読み上げ用の説明も）、3代の集計、年収の分布
set -e
cd "$(dirname "$0")/.."
SP=$(mktemp -d)
npx tsx scripts/lpgallery.ts > public/lp/gallery.json
OLD=$1 python3 - <<'PY'
import json,re,os
old=os.environ["OLD"]
g={x['key']:x for x in json.load(open('public/lp/gallery.json'))}
p='public/lp/index.html'; s=open(p,encoding='utf8').read()
img={'tokyo':'g-tokyo','migrate':'g-migrate','inflation':'g-inflation','brideprice':'g-brideprice','care':'g-care','usa':'g-usa'}
for k,x in g.items():
    pat=re.compile(r'href="/s/'+old+r'\.[^"]+">(\s*<img src="img/'+img[k]+r'\.webp" alt=")([^"]*)("[^>]*>\s*<span class="meta">)([^<]*)(</span><span class="ttl">[^<]*</span><span class="desc">)([^<]*)(</span>)')
    m=pat.search(s); assert m,k
    print(k,'|',m.group(4),'|',x.get('place'),x.get('sex'),x.get('deathAge'),'|',m.group(6),'=>',x['line'])
    desc=re.sub(r'約[\d,]+万円', re.search(r'約[\d,]+万円',x['line']).group(0), m.group(6)) if k=='inflation' else x['line']
    s=s[:m.start()]+f'href="/s/{x["code"]}">'+m.group(1)+m.group(2)+m.group(3)+m.group(4)+m.group(5)+desc+m.group(7)+s[m.end():]
open(p,'w',encoding='utf8').write(s)
PY
(curl -s -o /dev/null localhost:5199/ || (nohup npx vite --port 5199 --strictPort > $SP/vite.log 2>&1 &)); for i in $(seq 60); do curl -s -o /dev/null localhost:5199/ && break; sleep 1; done
node scripts/lpgalleryimg.mjs 2>&1 | tail -1; node scripts/lpassets.mjs 2>&1 | tail -1
npx tsx scripts/lpmedians.ts > $SP/med.txt; cat $SP/med.txt
npx tsx scripts/incomedist.ts > data/world/income_percentiles.json
npx tsx scripts/genstats.ts > docs/generations.md 2>/dev/null
SP=$SP python3 - <<'PY'
import re,os
p='public/lp/index.html'; s=open(p,encoding='utf8').read()
for line in open(os.environ['SP']+'/med.txt'):
    iso,name,v=line.split()
    short={'アメリカ合衆国':'アメリカ'}.get(name,name)
    s,n=re.subn(r'(<div class="er(?: jp)?" data-v=")\d+("><span class="cn">'+short+'</span>)', lambda m: m.group(1)+v+m.group(2), s); assert n==1,short
# 金額の大きい順に並べ替える（年ごとの数字の入れ替えで順番がずれないように）
rows=re.findall(r'          <div class="er(?: jp)?" data-v="\d+">.*?</div>\n',s)
assert len(rows)==8
start=s.index(rows[0]); end=start+sum(len(r) for r in rows)
assert s[start:end]==''.join(rows)
rows.sort(key=lambda r:-int(re.search(r'data-v="(\d+)"',r).group(1)))
s=s[:start]+''.join(rows)+s[end:]
vals=re.findall(r'<div class="er(?: jp)?" data-v="(\d+)"><span class="cn">([^<]+)</span>',s)
s,n=re.subn(r'(<div class="total"><span>)[^<]*(の差</span>)',lambda m:m.group(1)+vals[0][1]+'と'+vals[-1][1]+m.group(2),s); assert n==1
man=lambda v: f"{v/10000:.2f}億円" if v>=10000 else f"{v:,}万円"
s,n=re.subn(r'(<div class="earn" id="earn" role="img" aria-label=")[^"]*(")',lambda m:m.group(1)+"生涯で稼ぐお金の中央値。"+"、".join(n+man(int(v)) for v,n in vals)+m.group(2),s); assert n==1
for row in open('docs/generations.md',encoding='utf8'):
    m=re.match(r'\| (低所得国|低中所得国|高中所得国|高所得国) \| \d+ \| ([0-9.]+)倍 \| ([0-9.]+)倍',row)
    if not m: continue
    k,a,b=m.groups()
    s,n=re.subn(r'<div class="gr( hot)?" data-v="[0-9.]+"><span class="cn">'+k+r'</span><b>[0-9.]+倍</b><b class="g3">[0-9.]+倍</b>', lambda mm: f'<div class="gr{mm.group(1) or ""}" data-v="{a}"><span class="cn">{k}</span><b>{a}倍</b><b class="g3">{b}倍</b>', s); assert n==1,k
    print(k,a,b)
open(p,'w',encoding='utf8').write(s)
PY
