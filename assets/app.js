const $ = (id) => document.getElementById(id);
const STORE_FAV = "kokonsho_favorites_v1";
const STORE_FAV_LEGACY = "kokonsho:favorites:v1";
const STORE_BGM = "kokonsho:bgm:v1";
const STORE_DAILY_SETS = "kokonsho_daily_sets_v1";
const STORE_READ_LOG = "kokonsho_read_log_v1";
const STORE_DAILY_PROGRESS = "kokonsho_daily_progress_v1";
let DATA = [];
let idx = 0;
let genre = "all";
let view = "top";
let favs = new Set(loadFavs());
let bgmChoice = localStorage.getItem(STORE_BGM) || "off";
let audio = { ctx:null, master:null, timer:null, enabled:false, pausedByVisibility:false };

const RUBY = [
  // 古今掌の方針：原文・読みには使わず、説明系の欄だけに必要最小限で使う。
  // 基本漢字の単独ルビは避け、古典語・抽象語・論語語彙・百人一首語彙を中心にする。
  ["百人一首","ひゃくにんいっしゅ"],["論語","ろんご"],["古典語","こてんご"],["古典","こてん"],["和歌","わか"],["漢文","かんぶん"],
  ["故事成語","こじせいご"],["慣用句","かんようく"],
  ["矛盾","むじゅん"],["蛇足","だそく"],["推敲","すいこう"],["漁夫の利","ぎょふのり"],["五十歩百歩","ごじっぽひゃっぽ"],["朝三暮四","ちょうさんぼし"],["杞憂","きゆう"],["助長","じょちょう"],
  ["背水の陣","はいすいのじん"],["画竜点睛","がりょうてんせい"],["四面楚歌","しめんそか"],["虎の威を借る狐","とらのいをかるきつね"],["塞翁が馬","さいおうがうま"],["完璧","かんぺき"],
  ["蛍雪の功","けいせつのこう"],["温故知新","おんこちしん"],["切磋琢磨","せっさたくま"],["大器晩成","たいきばんせい"],["臥薪嘗胆","がしんしょうたん"],["守株","しゅしゅ"],
  ["井の中の蛙","いのなかのかわず"],["登竜門","とうりゅうもん"],["馬耳東風","ばじとうふう"],["他山の石","たざんのいし"],["呉越同舟","ごえつどうしゅう"],["知音","ちいん"],
  ["羊頭狗肉","ようとうくにく"],["青天の霹靂","せいてんのへきれき"],["圧巻","あっかん"],["白眉","はくび"],["破竹の勢い","はちくのいきおい"],["一炊の夢","いっすいのゆめ"],
  ["水魚の交わり","すいぎょのまじわり"],["管鮑の交わり","かんぽうのまじわり"],["隗より始めよ","かいよりはじめよ"],["苛政は虎よりも猛し","かせいはとらよりもたけし"],["桃源郷","とうげんきょう"],["邯鄲の夢","かんたんのゆめ"],["刎頸の交わり","ふんけいのまじわり"],
  ["急がば回れ","いそがばまわれ"],["石の上にも三年","いしのうえにもさんねん"],["七転び八起き","ななころびやおき"],["情けは人のためならず","なさけはひとのためならず"],["灯台下暗し","とうだいもとくらし"],
  ["塵も積もれば山となる","ちりもつもればやまとなる"],["良薬は口に苦し","りょうやくはくちににがし"],["備えあれば憂いなし","そなえあればうれいなし"],["後悔先に立たず","こうかいさきにたたず"],
  ["覆水盆に返らず","ふくすいぼんにかえらず"],["千里の道も一歩から","せんりのみちもいっぽから"],["親しき仲にも礼儀あり","したしきなかにもれいぎあり"],["三人寄れば文殊の知恵","さんにんよればもんじゅのちえ"],
  ["頭が上がらない","あたまがあがらない"],["胸を張る","むねをはる"],["耳が痛い","みみがいたい"],["腹をくくる","はらをくくる"],["目を丸くする","めをまるくする"],
  ["手を焼く","てをやく"],["足が出る","あしがでる"],["口が重い","くちがおもい"],["鼻が高い","はながたかい"],["骨が折れる","ほねがおれる"],["気が置けない","きがおけない"],
  ["肩の荷が下りる","かたのにがおりる"],["目から鱗が落ちる","めからうろこがおちる"],["板につく","いたにつく"],
  ["掛詞","かけことば"],["枕詞","まくらことば"],["本歌取り","ほんかどり"],["七夕伝説","たなばたでんせつ"],
  ["衣手","ころもで"],["白妙","しろたえ"],["逢坂","おうさか"],["契り","ちぎり"],["都","みやこ"],["袖","そで"],["故郷","ふるさと"],
  ["三笠の山","みかさのやま"],["富士の高嶺","ふじのたかね"],
  ["孔子","こうし"],["曾子","そうし"],["子貢","しこう"],["顔回","がんかい"],["君子","くんし"],["小人","しょうじん"],
  ["中庸","ちゅうよう"],["三省","さんせい"],["仁者","じんしゃ"],["知者","ちしゃ"],["不仁","ふじん"],
  ["言行一致","げんこういっち"],["先難後獲","せんなんこうかく"],["為己の学","いこのがく"],["為人の学","いじんのがく"],
  ["一を聞いて十を知る","いちをきいてじゅうをしる"],["聞一知十","ぶんいつちじゅう"],
  ["誠実","せいじつ"],["正直","しょうじき"],["自省","じせい"],["実践","じっせん"],["知識","ちしき"],["知恵","ちえ"],
  ["責任","せきにん"],["利益","りえき"],["基準","きじゅん"],["評価","ひょうか"],["実力","じつりょく"],["地位","ちい"],
  ["本性","ほんしょう"],["習慣","しゅうかん"],["環境","かんきょう"],["成長","せいちょう"],["想像","そうぞう"],
  ["景色","けしき"],["季節","きせつ"],["後悔","こうかい"],["経験","けいけん"],["感情","かんじょう"],["自然","しぜん"],
  ["物語","ものがたり"],["歴史","れきし"],["文学","ぶんがく"],["作品","さくひん"],
  // 一字でも、論語の核になる抽象語だけは許可。熟語の中では振らない。
  ["仁","じん"],["礼","れい"],["義","ぎ"],["利","り"],["信","しん"],["徳","とく"],["益","えき"],["損","そん"],["泰","たい"],["驕","きょう"]
].sort((a,b)=>b[0].length-a[0].length);
const RUBY_MAP = new Map(RUBY);
const RUBY_RE = new RegExp(RUBY.map(([word]) => word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'), 'g');
const KANJI_RE = /[一-龯々〆ヶ]/;
const SINGLE_CHAR_AFTER_OK_RE = /[はがをにへとものやで、。．！？!?」』）)]/;
function esc(s){return String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m]));}
function rubyfy(raw){
  const src = esc(raw);
  return src.replace(RUBY_RE, (match, offset, full) => {
    const before = full[offset - 1] || '';
    const after = full[offset + match.length] || '';
    // ひらがな・カタカナだけの語にはルビを振らない。
    // 「ことわざ」に「ことわざ」のルビが付くような重複表示を防ぐ。
    if(!KANJI_RE.test(match)) return match;
    // すでに「仁（じん）」のように本文側で読みが付いている場合は二重にしない。
    if(after === '（' || after === '(') return match;
    // 一字語は「自信」「利益」のような熟語の一部では振らない。
    if(match.length === 1 && (KANJI_RE.test(before) || !SINGLE_CHAR_AFTER_OK_RE.test(after))) return match;
    const kana = RUBY_MAP.get(match);
    return kana ? `<ruby>${match}<rt>${kana}</rt></ruby>` : match;
  });
}
function safeParse(raw, fallback){try{return raw ? JSON.parse(raw) : fallback;}catch{return fallback;}}
function loadFavs(){
  const current = safeParse(localStorage.getItem(STORE_FAV), null);
  if(Array.isArray(current)) return current;
  const legacy = safeParse(localStorage.getItem(STORE_FAV_LEGACY), []);
  if(Array.isArray(legacy) && legacy.length){
    localStorage.setItem(STORE_FAV, JSON.stringify(legacy));
    return legacy;
  }
  return [];
}
function saveFavs(){localStorage.setItem(STORE_FAV, JSON.stringify([...favs]));}
function current(){return DATA[idx] || DATA[0];}
function genres(){return [...new Set(DATA.map(x=>x.genre).filter(Boolean))];}
function shortText(s,n=74){s=String(s||"").replace(/\s+/g,' ');return s.length>n?s.slice(0,n-1)+'…':s;}
function pointOf(item){return item.wordPoint || item.examMemo || "ことばの意味を、おうちの人とゆっくり話してみよう。";}
function talkOf(item){return item.parentQuestion || "このことばを、今日の生活で使うならどんな場面があるかな？";}
function displayKid(item){return item.superTranslation || item.basicTranslation || item.original || "";}

function pad2(n){return String(n).padStart(2,"0");}
function todayKey(date=new Date()){return `${date.getFullYear()}-${pad2(date.getMonth()+1)}-${pad2(date.getDate())}`;}
function dateLabel(key){
  const [y,m,d] = String(key).split("-").map(Number);
  if(!y || !m || !d) return key;
  return `${y}年${m}月${d}日`;
}
function loadDailySets(){return safeParse(localStorage.getItem(STORE_DAILY_SETS), {}) || {};}
function saveDailySets(sets){localStorage.setItem(STORE_DAILY_SETS, JSON.stringify(sets));}
function loadReadLog(){return safeParse(localStorage.getItem(STORE_READ_LOG), {}) || {};}
function saveReadLog(log){localStorage.setItem(STORE_READ_LOG, JSON.stringify(log));}
function saveDailyProgress(key, done, total){
  const progress = safeParse(localStorage.getItem(STORE_DAILY_PROGRESS), {}) || {};
  progress[key] = {done, total, updatedAt:new Date().toISOString()};
  localStorage.setItem(STORE_DAILY_PROGRESS, JSON.stringify(progress));
}
function hashSeed(str){
  let h = 2166136261;
  for(let i=0;i<str.length;i++){
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a){
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function seededShuffle(items, seedText){
  const arr = items.slice();
  const rand = mulberry32(hashSeed(seedText));
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(rand() * (i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function generateDailyIds(key){
  const selected = [];
  const used = new Set();
  const byGenre = new Map();
  DATA.forEach(item => {
    if(!item || !item.id) return;
    const g = item.genre || "その他";
    if(!byGenre.has(g)) byGenre.set(g, []);
    byGenre.get(g).push(item);
  });
  const order = seededShuffle([...byGenre.keys()].sort(), `${key}:genres`);
  order.forEach(g => {
    const picks = seededShuffle(byGenre.get(g), `${key}:${g}`).slice(0, 2);
    picks.forEach(item => { if(!used.has(item.id)){ selected.push(item.id); used.add(item.id); } });
  });
  if(selected.length < 10){
    for(const item of seededShuffle(DATA, `${key}:all`)){
      if(selected.length >= 10) break;
      if(item && item.id && !used.has(item.id)){ selected.push(item.id); used.add(item.id); }
    }
  }
  return selected.slice(0, 10);
}
function getDailyIds(key=todayKey()){
  const sets = loadDailySets();
  const valid = new Set(DATA.map(x=>x.id));
  const saved = Array.isArray(sets[key]) ? sets[key].filter(id=>valid.has(id)) : [];
  if(saved.length === 10) return saved;
  const ids = generateDailyIds(key);
  sets[key] = ids;
  saveDailySets(sets);
  return ids;
}
function getDailyItems(key=todayKey()){
  const byId = new Map(DATA.map(x=>[x.id,x]));
  return getDailyIds(key).map(id=>byId.get(id)).filter(Boolean);
}
function readSetFor(key=todayKey()){
  const log = loadReadLog();
  const entry = log[key] || {};
  return new Set(Array.isArray(entry) ? entry : Object.keys(entry).filter(id=>entry[id]));
}
function setReadForToday(id, value=true){
  const key = todayKey();
  const log = loadReadLog();
  if(!log[key] || Array.isArray(log[key])) log[key] = {};
  if(value) log[key][id] = true;
  else delete log[key][id];
  saveReadLog(log);
  const ids = getDailyIds(key);
  const done = ids.filter(x => log[key] && log[key][x]).length;
  saveDailyProgress(key, done, ids.length);
}
function genreLabel(item){
  return item && item.genre ? `${item.genre}のことば` : "古典のことば";
}
function resultHeading(count){
  const q = ($("searchInput")?.value || "").trim();
  if(!count) return "見つかりませんでした";
  if(q) return "検索結果";
  return genre === "all" ? "すべてのことば" : `${genre}のことば`;
}

async function loadData(){
  try{
    const res = await fetch("./data/kokonsho_300.json",{cache:"no-store"});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    DATA = await res.json();
  }catch(e){
    console.warn("外部JSONを読めませんでした", e);
    DATA = [];
  }
  if(!Array.isArray(DATA)) DATA = [];
  renderGenres();
  renderAll();
}
function getSearchResults(){
  const q = ($("searchInput")?.value || "").trim().toLowerCase();
  return DATA.filter(x => (genre==="all" || x.genre===genre) && (!q || [x.id,x.genre,x.original,x.reading,x.author,x.source,x.superTranslation,x.basicTranslation,(x.theme||[]).join(" "),x.examMemo,x.wordPoint,x.parentQuestion].join(" ").toLowerCase().includes(q)));
}
function renderGenres(){
  const box = $("genreChips");
  if(!box) return;
  box.innerHTML = "";
  const all = [{label:"すべて", value:"all"}, ...genres().map(g=>({label:g,value:g}))];
  for(const g of all){
    const b = document.createElement("button");
    b.className = "chip" + (genre===g.value?" active":"");
    b.textContent = g.label;
    b.onclick = () => {genre=g.value; renderSearch();};
    box.appendChild(b);
  }
}
function renderCard(){
  const item = current();
  if(!item) return;
  $("kidText").innerHTML = rubyfy(displayKid(item));
  $("originalText").textContent = item.original || "";
  $("readingText").textContent = item.reading || "";
  $("pointText").innerHTML = rubyfy(shortText(pointOf(item), 118));
  $("talkText").innerHTML = rubyfy(talkOf(item));
  if($("currentGenreLabel")) $("currentGenreLabel").textContent = genreLabel(item);
  $("favoriteBtn").classList.toggle("active", favs.has(item.id));
  $("favoriteBtn").textContent = favs.has(item.id) ? "♥" : "♡";
  updateFavCount();
  updateCommandBar();
}
function updateFavCount(){
  if($("favCountTop")) $("favCountTop").textContent = favs.size;
}
function makeWordCard(item, like=false){
  const div = document.createElement("button");
  div.type = "button";
  div.className = "wordCard" + (like ? " like" : "");
  const mainText = item.original || displayKid(item);
  const kidText = displayKid(item);
  const meta = [item.source || item.author, ...(Array.isArray(item.theme) ? item.theme.slice(0,1) : [])].filter(Boolean).join("・");
  div.innerHTML = `${like?'<span class="heartSmall">♥</span>':''}<span class="pill">${esc(item.genre)}</span><div class="title">${esc(shortText(mainText, 58))}</div>${meta?`<div class="subline meta">${esc(shortText(meta, 44))}</div>`:''}<div class="subline">${rubyfy('こども訳：' + shortText(kidText, 56))}</div><span class="chev" style="position:absolute;right:16px;top:50%;transform:translateY(-50%)">›</span>`;
  div.onclick = () => { idx = Math.max(0, DATA.findIndex(x=>x.id===item.id)); setView("home"); };
  return div;
}

function makeDailyCard(item, read=false, number=0){
  const div = document.createElement("article");
  div.className = "dailyReadCard" + (read ? " is-read" : "");
  const liked = favs.has(item.id);
  div.innerHTML = `
    <div class="dailyReadHead">
      <div class="dailyMeta"><span class="dailyNum">${String(number || "").padStart(2,"0")}</span><span class="pill">${esc(item.genre)}</span></div>
      <span class="dailyReadState">${read ? "読了" : "未読"}</span>
    </div>
    <div class="dailyOriginal">${esc(item.original || "")}</div>
    ${item.reading ? `<div class="dailyReading">${esc(item.reading)}</div>` : ""}
    <div class="dailyKid">${rubyfy(displayKid(item))}</div>
    <div class="dailyMiniRows">
      <div><b>ことばポイント</b><p>${rubyfy(pointOf(item))}</p></div>
      <div><b>おうちの人と話してみよう</b><p>${rubyfy(talkOf(item))}</p></div>
    </div>
    <div class="dailyActions">
      <button type="button" class="dailyReadBtn ${read ? "done" : ""}" data-read-id="${esc(item.id)}">${read ? "読了済み" : "読んだ"}</button>
      <button type="button" class="dailyLikeBtn ${liked ? "liked" : ""}" data-like-id="${esc(item.id)}">${liked ? "♥ すき" : "♡ すき"}</button>
      <button type="button" class="dailyOpenBtn" data-open-id="${esc(item.id)}">くわしく読む</button>
    </div>`;
  return div;
}
function renderDaily(){
  const box = $("dailyList");
  if(!box) return;
  const key = todayKey();
  const items = getDailyItems(key);
  const read = readSetFor(key);
  const done = items.filter(x=>read.has(x.id)).length;
  if($("dailyDate")) $("dailyDate").textContent = dateLabel(key);
  if($("dailyProgress")) $("dailyProgress").textContent = `${done} / ${items.length}枚 読んだ`;
  if($("dailyBarFill")) $("dailyBarFill").style.width = items.length ? `${Math.round(done/items.length*100)}%` : "0%";
  saveDailyProgress(key, done, items.length);
  box.innerHTML = "";
  if(!items.length){ box.innerHTML = `<div class="empty">まいにち10枚を読み込めませんでした。</div>`; return; }
  items.forEach((item, i) => box.appendChild(makeDailyCard(item, read.has(item.id), i + 1)));
  box.querySelectorAll("[data-read-id]").forEach(btn => btn.addEventListener("click", e => {
    const id = e.currentTarget.dataset.readId;
    const isRead = readSetFor(key).has(id);
    setReadForToday(id, !isRead);
    renderDaily(); renderRecords();
  }));
  box.querySelectorAll("[data-like-id]").forEach(btn => btn.addEventListener("click", e => {
    const id = e.currentTarget.dataset.likeId;
    favs.has(id) ? favs.delete(id) : favs.add(id);
    saveFavs(); renderDaily(); renderLikes(); updateFavCount(); updateCommandBar();
  }));
  box.querySelectorAll("[data-open-id]").forEach(btn => btn.addEventListener("click", e => {
    const id = e.currentTarget.dataset.openId;
    idx = Math.max(0, DATA.findIndex(x=>x.id===id));
    setView("home");
  }));
}
function renderRecords(){
  const box = $("recordList");
  if(!box) return;
  const sets = loadDailySets();
  const log = loadReadLog();
  const byId = new Map(DATA.map(x=>[x.id,x]));
  const keys = Object.keys(log).filter(key => log[key] && Object.keys(log[key]).some(id => log[key][id])).sort().reverse().slice(0, 30);
  box.innerHTML = "";
  if(!keys.length){
    box.innerHTML = `<div class="empty">読んだきろくはまだありません。<br>まいにち10枚で「読んだ」を押すと、日付ごとに残ります。</div>`;
    return;
  }
  keys.forEach(key => {
    const ids = (sets[key] || []).filter(id => byId.has(id));
    const entry = log[key] || {};
    const readIds = ids.filter(id => Array.isArray(entry) ? entry.includes(id) : entry[id]);
    const wrap = document.createElement("article");
    wrap.className = "recordDay";
    wrap.innerHTML = `
      <div class="recordDayHead"><b>${esc(dateLabel(key))}</b><span>${readIds.length} / ${ids.length}枚 読んだ</span></div>
      <div class="recordItems">${readIds.length ? readIds.map(id => {
        const item = byId.get(id);
        return `<button type="button" class="recordItem" data-open-id="${esc(id)}"><span>${esc(item.genre)}</span>${esc(shortText(item.original || displayKid(item), 36))}</button>`;
      }).join("") : `<p class="recordNone">この日はまだチェックがありません。</p>`}</div>`;
    box.appendChild(wrap);
  });
  box.querySelectorAll("[data-open-id]").forEach(btn => btn.addEventListener("click", e => {
    const id = e.currentTarget.dataset.openId;
    idx = Math.max(0, DATA.findIndex(x=>x.id===id));
    setView("home");
  }));
}
function renderSearch(){
  renderGenres();
  const box = $("list");
  if(!box) return;
  const results = getSearchResults();
  const title = $("resultTitle");
  if(title) title.textContent = resultHeading(results.length);
  box.innerHTML = "";
  if(!results.length){ box.innerHTML = `<div class="empty">ことばが見つかりませんでした。<br>検索やジャンルを変えてみよう。</div>`; return; }
  results.forEach(item => box.appendChild(makeWordCard(item, favs.has(item.id))));
}
function renderLikes(){
  const box = $("likesList");
  if(!box) return;
  const liked = DATA.filter(x=>favs.has(x.id));
  box.innerHTML = "";
  if(!liked.length){ box.innerHTML = `<div class="empty">すきなことばはまだありません。<br>カードのハートを押すと、ここにあつまるよ。</div>`; return; }
  liked.forEach(item => box.appendChild(makeWordCard(item, true)));
}
function renderAll(){ renderCard(); renderSearch(); renderLikes(); updateBgmUI(); updateCommandBar(); }
function showPanel(id){
  for(const el of document.querySelectorAll(".panel")) el.classList.remove("active");
  $(id).classList.add("active");
}
function infoPanelId(key){
  const map = {guide:"parentPanel", parent:"parentPanel", privacy:"privacyPanel", terms:"termsPanel", disclaimer:"disclaimerPanel"};
  return map[key] || "parentPanel";
}
function openInfoModal(key){
  const modal = $("infoModal");
  const body = $("infoModalBody");
  const source = document.querySelector(`#${infoPanelId(key)} .infoPage`);
  if(!modal || !body || !source) return;
  body.innerHTML = source.innerHTML;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  const close = $("infoModalClose");
  if(close) close.focus();
}
function closeInfoModal(){
  const modal = $("infoModal");
  if(!modal) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}
function setView(v){
  closeInfoModal();
  view = v;
  document.body.classList.toggle("is-top", v==="top");
  const map = {top:"topPanel", home:"homePanel", daily:"dailyPanel", records:"recordsPanel", search:"searchPanel", likes:"likesPanel", parent:"parentPanel", privacy:"privacyPanel", terms:"termsPanel", disclaimer:"disclaimerPanel"};
  showPanel(map[v] || "homePanel");
  if(v==="home") renderCard();
  if(v==="search") renderSearch();
  if(v==="daily") renderDaily();
  if(v==="records") renderRecords();
  if(v==="likes") renderLikes();
  updateCommandBar();
  window.scrollTo({top:0,behavior:"smooth"});
}
function toggleFav(){
  const item = current();
  if(!item) return;
  favs.has(item.id) ? favs.delete(item.id) : favs.add(item.id);
  saveFavs();
  renderAll();
}
function nextCard(){ if(DATA.length){ idx=(idx+1)%DATA.length; renderCard(); window.scrollTo({top:0,behavior:"smooth"}); }}
function prevCard(){ if(DATA.length){ idx=(idx-1+DATA.length)%DATA.length; renderCard(); window.scrollTo({top:0,behavior:"smooth"}); }}
function updateCommandBar(){
  const item = current();
  const save = $("cmdSave");
  const prev = $("cmdPrev");
  const next = $("cmdNext");
  const top = $("cmdTop");
  top.onclick = () => setView("search");
  top.querySelector(".cmdIcon").textContent = "⌕";
  top.querySelector("span:last-child").textContent = "さがす";
  if(view==="home"){
    prev.querySelector(".cmdIcon").textContent = "‹"; prev.querySelector("span:last-child").textContent = "まえ"; prev.onclick = prevCard;
    next.querySelector(".cmdIcon").textContent = "›"; next.querySelector("span:last-child").textContent = "つぎ"; next.onclick = nextCard; next.classList.add("primary");
    save.style.display = "grid"; save.onclick = toggleFav; save.querySelector(".cmdIcon").textContent = item && favs.has(item.id) ? "♥" : "♡"; save.querySelector("span:last-child").textContent = item && favs.has(item.id) ? "保存済" : "保存"; save.classList.toggle("liked", !!item && favs.has(item.id));
  }else{
    prev.querySelector(".cmdIcon").textContent = "⌂"; prev.querySelector("span:last-child").textContent = "ホーム"; prev.onclick = () => setView("home");
    if(view==="daily"){
      next.querySelector(".cmdIcon").textContent = "✓"; next.querySelector("span:last-child").textContent = "きろく"; next.onclick = () => setView("records");
    }else if(view==="records"){
      next.querySelector(".cmdIcon").textContent = "十"; next.querySelector("span:last-child").textContent = "10枚"; next.onclick = () => setView("daily");
    }else{
      next.querySelector(".cmdIcon").textContent = view==="search" ? "♥" : "⌕"; next.querySelector("span:last-child").textContent = view==="search" ? "すき" : "さがす"; next.onclick = () => setView(view==="search" ? "likes" : "search");
    }
    next.classList.add("primary");
    save.style.display = "grid"; save.onclick = toggleMusic; save.querySelector(".cmdIcon").textContent = audio.enabled ? "♪" : "×"; save.querySelector("span:last-child").textContent = audio.enabled ? "音OFF" : "音ON"; save.classList.remove("liked");
  }
}
function chooseBgm(mode){
  bgmChoice = mode;
  localStorage.setItem(STORE_BGM, mode);
  updateBgmUI();
}
function updateBgmUI(){
  const btn = $("audioToggle");
  if(!btn) return;
  btn.classList.toggle("is-on", !!audio.enabled);
  btn.setAttribute("aria-label", audio.enabled ? "BGMをオフにする" : "BGMをオンにする");
  btn.setAttribute("title", audio.enabled ? "BGMをオフにする" : "BGMをオンにする");
}
function enterApp(mode){
  if(mode) chooseBgm(mode);
  setView("home");
  if(bgmChoice==="on") startMusic(); else stopMusic(false);
}
function initAudio(){
  if(audio.ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) return;
  const ctx = new AC();

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);

  const bus = ctx.createGain();
  bus.gain.value = 0.64;

  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 5000;
  tone.Q.value = 0.34;

  const warmth = ctx.createBiquadFilter();
  warmth.type = "highpass";
  warmth.frequency.value = 38;
  warmth.Q.value = 0.5;

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -34;
  compressor.knee.value = 24;
  compressor.ratio.value = 1.45;
  compressor.attack.value = 0.028;
  compressor.release.value = 0.52;

  const delay = ctx.createDelay(1.6);
  delay.delayTime.value = 0.44;
  const delayGain = ctx.createGain();
  delayGain.gain.value = 0.044;
  const delayTone = ctx.createBiquadFilter();
  delayTone.type = "lowpass";
  delayTone.frequency.value = 1850;

  const reverb = ctx.createConvolver();
  reverb.buffer = makeReverb(ctx, 3.8, 3.6);
  const reverbGain = ctx.createGain();
  reverbGain.gain.value = 0.18;

  bus.connect(tone);
  tone.connect(warmth);
  warmth.connect(compressor);
  compressor.connect(master);

  bus.connect(delay);
  delay.connect(delayTone);
  delayTone.connect(delayGain);
  delayGain.connect(delay);
  delayGain.connect(master);

  bus.connect(reverb);
  reverb.connect(reverbGain);
  reverbGain.connect(master);

  master.connect(ctx.destination);
  audio.ctx = ctx;
  audio.master = master;
  audio.bus = bus;
  audio.loopSec = 48;
  audio.pluckCache = new Map();
}
function makeReverb(ctx, seconds=3.8, decay=3.6){
  const len = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, len, ctx.sampleRate);
  for(let ch=0; ch<2; ch++){
    const data = buffer.getChannelData(ch);
    let last = 0;
    for(let i=0; i<len; i++){
      const n = Math.random()*2-1;
      last = last * 0.90 + n * 0.10;
      data[i] = last * Math.pow(1 - i/len, decay) * 0.22;
    }
  }
  return buffer;
}
function connectVoice(node, pan=0){
  if(!audio.ctx || !audio.bus) return;
  if(audio.ctx.createStereoPanner){
    const p = audio.ctx.createStereoPanner();
    p.pan.value = Math.max(-0.64, Math.min(0.64, pan));
    node.connect(p); p.connect(audio.bus);
  }else{
    node.connect(audio.bus);
  }
}
function makeKotoBuffer(freq, dur=2.4, brightness=0.86){
  const ctx = audio.ctx;
  const key = `${Math.round(freq*10)}:${dur.toFixed(2)}:${brightness.toFixed(2)}`;
  if(audio.pluckCache && audio.pluckCache.has(key)) return audio.pluckCache.get(key);
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * dur);
  const delay = Math.max(8, Math.round(sr / freq));
  const ring = new Float32Array(delay + 1);
  for(let i=0; i<delay; i++) ring[i] = (Math.random()*2-1) * Math.pow(1 - i/delay, 0.35);
  const buffer = ctx.createBuffer(1, len, sr);
  const data = buffer.getChannelData(0);
  let idxRing = 0;
  const damp = Math.max(0.955, Math.min(0.992, 0.972 + (1-brightness)*0.018));
  for(let i=0; i<len; i++){
    const next = (idxRing + 1) % delay;
    const v = (ring[idxRing] + ring[next]) * 0.5 * damp;
    ring[idxRing] = v;
    const t = i / len;
    data[i] = v * Math.pow(1 - t, 1.45) * 0.78;
    idxRing = next;
  }
  if(audio.pluckCache) audio.pluckCache.set(key, buffer);
  return buffer;
}
function koto(freq, when, dur=2.3, vol=0.036, pan=0, bright=0.82){
  if(!audio.ctx || !audio.bus) return;
  const ctx = audio.ctx;
  const src = ctx.createBufferSource();
  src.buffer = makeKotoBuffer(freq, dur, bright);
  src.playbackRate.setValueAtTime(1 + (Math.random()*0.008 - 0.004), when);

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(vol, when + 0.012);
  g.gain.exponentialRampToValueAtTime(vol * 0.55, when + 0.16);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);

  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.setValueAtTime(3600 + bright*900, when);
  f.frequency.exponentialRampToValueAtTime(1150, when + Math.max(0.55, dur*0.62));
  f.Q.value = 0.55;

  src.connect(f); f.connect(g); connectVoice(g, pan);
  src.start(when); src.stop(when + dur + 0.03);
}
function bassDrone(freq, when, dur=9.5, vol=0.010, pan=0){
  if(!audio.ctx || !audio.bus) return;
  const ctx = audio.ctx;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(vol, when + 1.2);
  g.gain.linearRampToValueAtTime(vol * 0.74, when + dur * 0.58);
  g.gain.linearRampToValueAtTime(0.0001, when + dur);

  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 620;
  f.Q.value = 0.22;

  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  o1.type = "sine";
  o2.type = "triangle";
  o1.frequency.setValueAtTime(freq, when);
  o2.frequency.setValueAtTime(freq * 2.001, when);
  const o2g = ctx.createGain();
  o2g.gain.value = 0.10;
  o1.connect(f); o2.connect(o2g); o2g.connect(f);
  f.connect(g); connectVoice(g, pan);
  o1.start(when); o2.start(when);
  o1.stop(when + dur + 0.05); o2.stop(when + dur + 0.05);
}
function breathFlute(freq, when, dur=3.2, vol=0.012, pan=0){
  if(!audio.ctx || !audio.bus) return;
  const ctx = audio.ctx;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, when);
  out.gain.linearRampToValueAtTime(vol, when + 0.58);
  out.gain.linearRampToValueAtTime(vol * 0.72, when + dur * 0.52);
  out.gain.linearRampToValueAtTime(0.0001, when + dur);

  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 1150;
  f.Q.value = 0.85;

  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(freq, when);
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 4.8;
  lfoGain.gain.value = freq * 0.006;
  lfo.connect(lfoGain); lfoGain.connect(o.frequency);
  o.connect(f);

  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for(let i=0;i<len;i++){
    last = last * 0.88 + (Math.random()*2-1) * 0.12;
    d[i] = last * 0.06;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  noise.connect(f);

  f.connect(out); connectVoice(out, pan);
  o.start(when); lfo.start(when); noise.start(when);
  o.stop(when + dur + 0.05); lfo.stop(when + dur + 0.05); noise.stop(when + dur + 0.05);
}
function smallBell(freq, when, vol=0.006, pan=0){
  if(!audio.ctx || !audio.bus) return;
  const ctx = audio.ctx;
  [1,2.01,2.92,4.2].forEach((r,i)=>{
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(freq*r, when + i*0.006);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vol/(i+1.25), when + 0.035);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 2.4 + i*0.18);
    o.connect(g); connectVoice(g, pan);
    o.start(when); o.stop(when + 2.6 + i*0.18);
  });
}
function softAir(when, dur=14.0, vol=0.0026, pan=-0.10){
  if(!audio.ctx || !audio.bus) return;
  const ctx = audio.ctx;
  const len = Math.floor(ctx.sampleRate*dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for(let i=0;i<len;i++){
    last = last * 0.96 + (Math.random()*2-1) * 0.04;
    d[i] = last * 0.12;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 980;
  f.Q.value = 0.32;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(vol, when + 2.4);
  g.gain.linearRampToValueAtTime(vol * 0.76, when + dur * 0.62);
  g.gain.linearRampToValueAtTime(0.0001, when + dur);
  src.connect(f); f.connect(g); connectVoice(g, pan);
  src.start(when); src.stop(when + dur + 0.02);
}
function schedulePhrase(t){
  const N = {
    D2:73.42, A2:110.00, D3:146.83, E3:164.81, G3:196.00, A3:220.00, B3:246.94,
    D4:293.66, E4:329.63, G4:392.00, A4:440.00, B4:493.88,
    D5:587.33, E5:659.25, G5:783.99, A5:880.00, B5:987.77,
    D6:1174.66, E6:1318.51, G6:1567.98
  };

  // 曲っぽさを抑えた、読書の邪魔をしない和風アンビエント。
  // 琴の撥弦音を疎らに置き、笛と空気音はごく薄く支える。
  const plucks = [
    [0.00,N.D4,2.4,.043,-.18,.82],[0.78,N.A4,2.1,.031,.12,.78],[1.52,N.B4,2.6,.027,-.04,.74],
    [5.80,N.G4,2.9,.035,.18,.76],[7.10,N.E4,2.5,.026,-.16,.70],
    [12.60,N.A4,2.8,.035,-.08,.78],[13.44,N.D5,2.5,.027,.14,.76],[15.05,N.B4,2.7,.026,.02,.72],
    [21.80,N.G4,3.0,.032,-.18,.73],[23.15,N.A4,2.5,.026,.16,.72],
    [29.40,N.E4,2.9,.031,.08,.70],[30.36,N.G4,2.6,.027,-.12,.72],[31.42,N.B4,2.7,.025,.14,.70],
    [38.30,N.A4,2.8,.032,-.10,.74],[39.28,N.E5,2.4,.023,.16,.72],[41.10,N.D5,3.2,.029,-.02,.70]
  ];
  const bass = [
    [0.00,N.D2,13.5,.010,-.10],[18.00,N.A2,12.0,.008,.12],[34.00,N.D2,11.2,.009,0]
  ];
  const flutes = [
    [9.80,N.D5,3.6,.010,-.22],[25.80,N.A4,4.2,.009,.20],[43.20,N.E5,3.2,.008,-.12]
  ];
  const bells = [
    [0.18,N.D6,.0062,.24],[17.60,N.A5,.0049,-.22],[33.70,N.E6,.0045,.18],[46.00,N.D6,.0054,-.12]
  ];
  plucks.forEach(([o,f,d,v,p,b])=>koto(f,t+o,d,v,p,b));
  bass.forEach(([o,f,d,v,p])=>bassDrone(f,t+o,d,v,p));
  flutes.forEach(([o,f,d,v,p])=>breathFlute(f,t+o,d,v,p));
  bells.forEach(([o,f,v,p])=>smallBell(f,t+o,v,p));
  softAir(t+0.4, 16.5, 0.0027, -0.18);
  softAir(t+18.5, 15.5, 0.0023, 0.16);
  softAir(t+35.2, 11.8, 0.0021, -0.02);
  // v90: v89は実機で小さく感じやすかったため、上品さは維持しつつ全体音量と琴の存在感を上げた。
}
function playPhrase(){
  if(!audio.enabled || !audio.ctx) return;
  schedulePhrase(audio.ctx.currentTime + 0.12);
}
async function startMusic(){
  chooseBgm("on");
  audio.enabled = true;
  if(document.hidden){
    audio.pausedByVisibility = true;
    clearInterval(audio.timer); audio.timer = null;
    updateBgmUI(); updateCommandBar();
    return;
  }
  initAudio();
  if(!audio.ctx) return;
  try{ await audio.ctx.resume(); }catch(e){}
  audio.pausedByVisibility = false;
  const now = audio.ctx.currentTime;
  if(audio.master){
    audio.master.gain.cancelScheduledValues(now);
    audio.master.gain.setValueAtTime(Math.max(audio.master.gain.value, 0.0001), now);
    audio.master.gain.setTargetAtTime(0.36, now, 0.55);
  }
  clearInterval(audio.timer);
  playPhrase();
  audio.timer = setInterval(playPhrase, (audio.loopSec || 28) * 1000);
  updateBgmUI(); updateCommandBar();
}
function stopMusic(save=true){
  if(audio.ctx && audio.master){
    const now = audio.ctx.currentTime;
    audio.master.gain.cancelScheduledValues(now);
    audio.master.gain.setTargetAtTime(0.0001, now, 0.25);
  }
  audio.enabled = false;
  audio.pausedByVisibility = false;
  clearInterval(audio.timer); audio.timer = null;
  if(save) chooseBgm("off");
  updateBgmUI(); updateCommandBar();
}
async function pauseMusicForVisibility(){
  if(!audio.enabled || !audio.ctx) return;
  audio.pausedByVisibility = true;
  clearInterval(audio.timer); audio.timer = null;
  if(audio.master){
    const now = audio.ctx.currentTime;
    audio.master.gain.cancelScheduledValues(now);
    audio.master.gain.setTargetAtTime(0.0001, now, 0.08);
  }
  try{ await audio.ctx.suspend(); }catch(e){}
  updateBgmUI(); updateCommandBar();
}
async function resumeMusicForVisibility(){
  if(!audio.enabled || bgmChoice !== "on" || !audio.pausedByVisibility) return;
  initAudio();
  if(!audio.ctx) return;
  try{ await audio.ctx.resume(); }catch(e){}
  audio.pausedByVisibility = false;
  const now = audio.ctx.currentTime;
  if(audio.master){
    audio.master.gain.cancelScheduledValues(now);
    audio.master.gain.setValueAtTime(Math.max(audio.master.gain.value, 0.0001), now);
    audio.master.gain.setTargetAtTime(0.36, now, 0.45);
  }
  clearInterval(audio.timer);
  playPhrase();
  audio.timer = setInterval(playPhrase, (audio.loopSec || 32) * 1000);
  updateBgmUI(); updateCommandBar();
}
function handleVisibilityChange(){
  if(document.hidden) pauseMusicForVisibility();
  else resumeMusicForVisibility();
}
function toggleMusic(){ audio.enabled ? stopMusic(true) : startMusic(); }
function bind(){
  const startWithMusic = $("startWithMusic");
  const startSilent = $("startSilent");
  const guideLinkTop = $("guideLinkTop");
  const parentLinkTop = $("parentLinkTop");
  const privacyLinkTop = $("privacyLinkTop");
  const termsLinkTop = $("termsLinkTop");
  const disclaimerLinkTop = $("disclaimerLinkTop");
  const favoriteBtn = $("favoriteBtn");
  const goGuideTop = $("goGuideTop");
  const goDailyTop = $("goDailyTop");
  const goSearchTop = $("goSearchTop");
  const goLikesTop = $("goLikesTop");
  const searchInput = $("searchInput");
  const audioToggle = $("audioToggle");
  const infoModalClose = $("infoModalClose");
  const infoModal = $("infoModal");

  if(startWithMusic) startWithMusic.onclick = () => enterApp("on");
  if(startSilent) startSilent.onclick = () => enterApp("off");
  if(guideLinkTop) guideLinkTop.onclick = () => openInfoModal("guide");
  if(parentLinkTop) parentLinkTop.onclick = () => openInfoModal("parent");
  if(privacyLinkTop) privacyLinkTop.onclick = () => openInfoModal("privacy");
  if(termsLinkTop) termsLinkTop.onclick = () => openInfoModal("terms");
  if(disclaimerLinkTop) disclaimerLinkTop.onclick = () => openInfoModal("disclaimer");
  if(favoriteBtn) favoriteBtn.onclick = toggleFav;
  if(goGuideTop) goGuideTop.onclick = () => openInfoModal("guide");
  if(goDailyTop) goDailyTop.onclick = () => setView("daily");
  if($("dailyRecordsBtn")) $("dailyRecordsBtn").onclick = () => setView("records");
  if($("recordsDailyBtn")) $("recordsDailyBtn").onclick = () => setView("daily");
  if(goSearchTop) goSearchTop.onclick = () => setView("search");
  if(goLikesTop) goLikesTop.onclick = () => setView("likes");
  if(searchInput) searchInput.oninput = renderSearch;
  if(audioToggle) audioToggle.onclick = toggleMusic;
  if(infoModalClose) infoModalClose.onclick = closeInfoModal;
  if(infoModal) infoModal.addEventListener("click", e => { if(e.target && e.target.dataset.closeModal !== undefined) closeInfoModal(); });
  document.addEventListener("keydown", e => { if(e.key === "Escape") closeInfoModal(); });
}
document.addEventListener("visibilitychange", handleVisibilityChange);
window.addEventListener("pagehide", pauseMusicForVisibility);
window.addEventListener("pageshow", () => { if(!document.hidden) resumeMusicForVisibility(); });
document.addEventListener("DOMContentLoaded",()=>{bind(); loadData(); updateBgmUI();});
