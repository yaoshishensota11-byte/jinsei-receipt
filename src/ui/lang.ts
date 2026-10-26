// 言語の切り替え。ページを Google 翻訳（translate.goog）を通して開き直す。
// ゲームの文章は日本語のまま作り、表示だけを機械翻訳する（レシート画像の中の文字は訳されない）。

export const LANGS: { code: string; label: string }[] = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
  { code: "zh-CN", label: "简体中文" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "hi", label: "हिन्दी" },
  { code: "id", label: "Bahasa Indonesia" },
];

const PROXY = ".translate.goog";

/** translate.goog の住所から、もとのサイトの住所に戻す（"a--b-c" → "a-b.c"） */
function originalHost(host: string): string {
  if (!host.endsWith(PROXY)) return host;
  return host
    .slice(0, -PROXY.length)
    .split("--")
    .map((x) => x.replace(/-/g, "."))
    .join("-");
}

/** いま表示している言語（翻訳されていなければ ja） */
export function currentLang(): string {
  if (!location.hostname.endsWith(PROXY)) return "ja";
  return new URLSearchParams(location.search).get("_x_tr_tl") ?? "ja";
}

/** 指定した言語でこのページを開くURL */
export function langUrl(code: string): string {
  const host = originalHost(location.host);
  const q = new URLSearchParams(location.search);
  for (const k of [...q.keys()]) if (k.startsWith("_x_tr_")) q.delete(k);
  if (code === "ja") {
    const qs = q.toString();
    return `https://${host}${location.pathname}${qs ? "?" + qs : ""}${location.hash}`;
  }
  const proxied = host.replace(/-/g, "--").replace(/\./g, "-") + PROXY;
  q.set("_x_tr_sl", "ja");
  q.set("_x_tr_tl", code);
  q.set("_x_tr_hl", code);
  return `https://${proxied}${location.pathname}?${q.toString()}${location.hash}`;
}

/** 言語を選ぶ小さなメニュー（地球のアイコン付き） */
export function langPicker(): HTMLElement {
  const wrap = document.createElement("label");
  wrap.className = "lang";
  wrap.setAttribute("translate", "no");
  wrap.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8"/><path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18"/></svg>`;
  const sel = document.createElement("select");
  sel.setAttribute("aria-label", "Language");
  const now = currentLang();
  for (const l of LANGS) {
    const o = document.createElement("option");
    o.value = l.code;
    o.textContent = l.label;
    if (l.code === now) o.selected = true;
    sel.append(o);
  }
  sel.onchange = () => {
    location.href = langUrl(sel.value);
  };
  wrap.append(sel);
  return wrap;
}
