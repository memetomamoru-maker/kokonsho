
const $ = (id) => document.getElementById(id);
const STORE_KEY = "kokonsho:favorites:v1";
let DATA = [];
let filtered = [];
let idx = 0;
let genre = "all";
let view = "home";
let favs = new Set(loadFavs());

const RUBY = [
  ["百人一首","ひゃくにんいっしゅ"],["論語","ろんご"],["故事成語","こじせいご"],["枕草子","まくらのそうし"],["徒然草","つれづれぐさ"],
  ["親子","おやこ"],["原文","げんぶん"],["読み","よみ"],["今日","きょう"],["明日","あした"],["言葉","ことば"],["小学生","しょうがくせい"],
  ["思いやり","おもいやり"],["気持ち","きもち"],["大切","たいせつ"],["宝","たから"],["人","ひと"],["心","こころ"],["友","とも"],["学ぶ","まなぶ"],["勉強","べんきょう"],["行動","こうどう"],["考え","かんが"],["考える","かんがえる"],["自然","しぜん"],["歴史","れきし"],["人物","じんぶつ"],["文学","ぶんがく"],["作品","さくひん"],["春","はる"],["夏","なつ"],["秋","あき"],["冬","ふゆ"],["月","つき"],["雪","ゆき"],["花","はな"],["山","やま"],["川","かわ"],["道","みち"],["海","うみ"],["恋","こい"],["君子","くんし"],["小人","しょうじん"],["仁","じん"],["礼","れい"],["義","ぎ"]
].sort((a,b)=>b[0].length-a[0].length);
function esc(s){return String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m]));}
function rubyfy(raw){
  let out = esc(raw);
  for(const [word,kana] of RUBY){
    const safe = word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    out = out.replace(new RegExp(safe,'g'),`<ruby>${word}<rt>${kana}</rt></ruby>`);
  }
  return out;
}
function loadFavs(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||"[]");}catch{return []}}
function saveFavs(){localStorage.setItem(STORE_KEY, JSON.stringify([...favs]));}
function current(){return filtered[idx] || DATA[0];}
function genres(){return [...new Set(DATA.map(x=>x.genre).filter(Boolean))];}
function shortText(s,n=74){s=String(s||"").replace(/\s+/g,' '); return s.length>n?s.slice(0,n-1)+'…':s;}
function pointOf(item){return item.wordPoint || item.examMemo || "ことばの意味を、親子でゆっくり話してみよう。";}
function talkOf(item){return item.parentQuestion || "このことばを、今日の生活で使うならどんな場面があるかな？";}
function displayKid(item){return item.superTranslation || item.basicTranslation || item.original || "";}

async function loadData(){
  const inline = () => JSON.parse($("data-json").textContent);
  try{
    const res = await fetch("./data/kokonsho_160.json",{cache:"no-store"});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    DATA = await res.json();
  }catch(e){
    console.warn("外部JSONを読めなかったため、HTML内蔵データを使います", e);
    DATA = inline();
  }
  filtered = [...DATA];
  renderGenres();
  filterAndRender();
}
function renderGenres(){
  const box = $("genreChips");
  box.innerHTML = "";
  const all = [{label:"すべて", value:"all"}, ...genres().map(g=>({label:g,value:g}))];
  for(const g of all){
    const b = document.createElement("button");
    b.className = "chip" + (genre===g.value?" active":"");
    b.textContent = g.label;
    b.onclick = () => {genre=g.value; idx=0; filterAndRender();};
    box.appendChild(b);
  }
}
function filterAndRender(){
  const q = ($("searchInput")?.value || "").trim().toLowerCase();
  filtered = DATA.filter(x => (genre==="all" || x.genre===genre) && (!q || [x.id,x.genre,x.original,x.reading,x.author,x.source,x.superTranslation,x.basicTranslation,(x.theme||[]).join(" "),x.examMemo,x.wordPoint,x.parentQuestion].join(" ").toLowerCase().includes(q)));
  if(view === "likes") filtered = DATA.filter(x=>favs.has(x.id));
  if(idx >= filtered.length) idx = 0;
  renderGenres();
  renderCard();
  renderList();
  renderLikes();
}
function renderCard(){
  const item = current();
  if(!item) return;
  $("kidText").innerHTML = rubyfy(displayKid(item));
  $("originalText").innerHTML = rubyfy(item.original || "");
  $("readingText").innerHTML = rubyfy(item.reading || "");
  $("pointText").innerHTML = rubyfy(shortText(pointOf(item), 110));
  $("talkText").innerHTML = rubyfy(talkOf(item));
  $("favoriteBtn").classList.toggle("active", favs.has(item.id));
  $("favoriteBtn").textContent = favs.has(item.id) ? "♥" : "♡";
  $("favCountTop").textContent = favs.size;
}
function makeWordCard(item, like=false){
  const div = document.createElement("button");
  div.type = "button";
  div.className = "wordCard" + (like ? " like" : "");
  div.innerHTML = `${like?'<span class="heartSmall">♥</span>':''}<span class="pill">${esc(item.genre)}</span><div class="title">${rubyfy(shortText(displayKid(item), 46))}</div><div class="subline">${rubyfy(shortText(item.source || item.author || item.original, 44))}</div><span class="chev" style="position:absolute;right:16px;top:50%;transform:translateY(-50%)">›</span>`;
  div.onclick = () => { view="home"; idx = DATA.findIndex(x=>x.id===item.id); filtered=[...DATA]; setView("home"); renderCard(); window.scrollTo({top:0,behavior:"smooth"}); };
  return div;
}
function renderList(){
  const box = $("list");
  if(!box) return;
  box.innerHTML = "";
  const title = $("resultTitle");
  if(title) title.textContent = filtered.length ? "おすすめのことば" : "見つかりませんでした";
  if(!filtered.length){ box.innerHTML = `<div class="empty">ことばが見つかりませんでした。<br>検索やジャンルを変えてみよう。</div>`; return; }
  filtered.slice(0,24).forEach(item => box.appendChild(makeWordCard(item, favs.has(item.id))));
}
function renderLikes(){
  const box = $("likesList");
  if(!box) return;
  const liked = DATA.filter(x=>favs.has(x.id));
  box.innerHTML = "";
  if(!liked.length){ box.innerHTML = `<div class="empty">すきなことばはまだありません。<br>カードのハートを押すと、ここにあつまるよ。</div>`; return; }
  liked.forEach(item => box.appendChild(makeWordCard(item, true)));
}
function setView(v){
  view = v;
  for(const id of ["homePanel","searchPanel","likesPanel","quizPanel"]){ $(id).classList.remove("active"); }
  for(const id of ["homeTab","searchTab","likesTab","quizTab"]){ $(id).classList.remove("active"); }
  if(v==="home"){ $("homePanel").classList.add("active"); $("homeTab").classList.add("active"); filtered=[...DATA]; }
  if(v==="search"){ $("searchPanel").classList.add("active"); $("searchTab").classList.add("active"); }
  if(v==="likes"){ $("likesPanel").classList.add("active"); $("likesTab").classList.add("active"); }
  if(v==="quiz"){ $("quizPanel").classList.add("active"); $("quizTab").classList.add("active"); }
  filterAndRender();
  window.scrollTo({top:0,behavior:"smooth"});
}
function bind(){
  $("favoriteBtn").onclick = () => { const item = current(); if(!item) return; favs.has(item.id) ? favs.delete(item.id) : favs.add(item.id); saveFavs(); renderCard(); renderLikes(); renderList(); };
  $("nextBtn").onclick = () => { if(filtered.length){ idx=(idx+1)%filtered.length; renderCard(); }};
  $("prevBtn").onclick = () => { if(filtered.length){ idx=(idx-1+filtered.length)%filtered.length; renderCard(); }};
  $("todayBtn").onclick = () => { if(DATA.length){ filtered=[...DATA]; idx=Math.floor(Math.random()*DATA.length); renderCard(); }};
  $("searchInput").oninput = () => { idx=0; filterAndRender(); };
  $("homeTab").onclick = () => setView("home");
  $("searchTab").onclick = () => setView("search");
  $("likesTab").onclick = () => setView("likes");
  $("quizTab").onclick = () => setView("quiz");
}
document.addEventListener("DOMContentLoaded",()=>{bind(); loadData();});
