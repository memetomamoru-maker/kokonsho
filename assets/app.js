const $ = (id) => document.getElementById(id);
const STORE_FAV = "kokonsho:favorites:v1";
const STORE_BGM = "kokonsho:bgm:v1";
let DATA = [];
let idx = 0;
let genre = "all";
let view = "top";
let favs = new Set(loadFavs());
let bgmChoice = localStorage.getItem(STORE_BGM) || "off";
let audio = { ctx:null, master:null, timer:null, enabled:false };

const RUBY = [
  ["百人一首","ひゃくにんいっしゅ"],["論語","ろんご"],["故事成語","こじせいご"],["枕草子","まくらのそうし"],["徒然草","つれづれぐさ"],
  ["親子","おやこ"],["原文","げんぶん"],["読み","よみ"],["今日","きょう"],["明日","あした"],["言葉","ことば"],["小学生","しょうがくせい"],
  ["思いやり","おもいやり"],["気持ち","きもち"],["大切","たいせつ"],["宝","たから"],["人","ひと"],["心","こころ"],["友","とも"],["学ぶ","まなぶ"],["勉強","べんきょう"],["行動","こうどう"],["考え","かんがえ"],["考える","かんがえる"],["自然","しぜん"],["歴史","れきし"],["人物","じんぶつ"],["文学","ぶんがく"],["作品","さくひん"],["春","はる"],["夏","なつ"],["秋","あき"],["冬","ふゆ"],["月","つき"],["雪","ゆき"],["花","はな"],["山","やま"],["川","かわ"],["道","みち"],["海","うみ"],["恋","こい"],["君子","くんし"],["小人","しょうじん"],["仁","じん"],["礼","れい"],["義","ぎ"]
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
function loadFavs(){try{return JSON.parse(localStorage.getItem(STORE_FAV)||"[]");}catch{return []}}
function saveFavs(){localStorage.setItem(STORE_FAV, JSON.stringify([...favs]));}
function current(){return DATA[idx] || DATA[0];}
function genres(){return [...new Set(DATA.map(x=>x.genre).filter(Boolean))];}
function shortText(s,n=74){s=String(s||"").replace(/\s+/g,' ');return s.length>n?s.slice(0,n-1)+'…':s;}
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
  $("originalText").innerHTML = rubyfy(item.original || "");
  $("readingText").innerHTML = rubyfy(item.reading || "");
  $("pointText").innerHTML = rubyfy(shortText(pointOf(item), 118));
  $("talkText").innerHTML = rubyfy(talkOf(item));
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
  div.innerHTML = `${like?'<span class="heartSmall">♥</span>':''}<span class="pill">${esc(item.genre)}</span><div class="title">${rubyfy(shortText(mainText, 58))}</div>${meta?`<div class="subline meta">${rubyfy(shortText(meta, 44))}</div>`:''}<div class="subline">${rubyfy('こども訳：' + shortText(kidText, 56))}</div><span class="chev" style="position:absolute;right:16px;top:50%;transform:translateY(-50%)">›</span>`;
  div.onclick = () => { idx = Math.max(0, DATA.findIndex(x=>x.id===item.id)); setView("home"); };
  return div;
}
function renderSearch(){
  renderGenres();
  const box = $("list");
  if(!box) return;
  const results = getSearchResults();
  const title = $("resultTitle");
  if(title) title.textContent = results.length ? "おすすめのことば" : "見つかりませんでした";
  box.innerHTML = "";
  if(!results.length){ box.innerHTML = `<div class="empty">ことばが見つかりませんでした。<br>検索やジャンルを変えてみよう。</div>`; return; }
  results.slice(0,24).forEach(item => box.appendChild(makeWordCard(item, favs.has(item.id))));
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
function setView(v){
  view = v;
  document.body.classList.toggle("is-top", v==="top");
  const map = {top:"topPanel", home:"homePanel", search:"searchPanel", likes:"likesPanel", parent:"parentPanel", privacy:"privacyPanel", terms:"termsPanel", disclaimer:"disclaimerPanel"};
  showPanel(map[v] || "homePanel");
  if(v==="home") renderCard();
  if(v==="search") renderSearch();
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
    next.querySelector(".cmdIcon").textContent = view==="search" ? "♥" : "⌕"; next.querySelector("span:last-child").textContent = view==="search" ? "すき" : "さがす"; next.onclick = () => setView(view==="search" ? "likes" : "search"); next.classList.add("primary");
    save.style.display = "grid"; save.onclick = toggleMusic; save.querySelector(".cmdIcon").textContent = audio.enabled ? "♪" : "×"; save.querySelector("span:last-child").textContent = audio.enabled ? "音OFF" : "音ON"; save.classList.remove("liked");
  }
}
function chooseBgm(mode){
  bgmChoice = mode;
  localStorage.setItem(STORE_BGM, mode);
  updateBgmUI();
}
function updateBgmUI(){
  if($("audioToggle")) $("audioToggle").textContent = audio.enabled ? "音OFF" : "音ON";
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
  bus.gain.value = 0.82;

  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 7200;
  tone.Q.value = 0.55;

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -26;
  compressor.knee.value = 18;
  compressor.ratio.value = 2.1;
  compressor.attack.value = 0.014;
  compressor.release.value = 0.30;

  const delay = ctx.createDelay(1.2);
  delay.delayTime.value = 0.42;
  const delayGain = ctx.createGain();
  delayGain.gain.value = 0.10;
  const delayTone = ctx.createBiquadFilter();
  delayTone.type = "lowpass";
  delayTone.frequency.value = 3000;

  const reverb = ctx.createConvolver();
  reverb.buffer = makeReverb(ctx, 2.2, 2.4);
  const reverbGain = ctx.createGain();
  reverbGain.gain.value = 0.18;

  bus.connect(tone);
  tone.connect(compressor);
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
  audio.loopSec = 28;
  audio.scheduledUntil = 0;
}
function makeReverb(ctx, seconds=2.2, decay=2.4){
  const len = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, len, ctx.sampleRate);
  for(let ch=0; ch<2; ch++){
    const data = buffer.getChannelData(ch);
    for(let i=0; i<len; i++){
      const n = Math.random()*2-1;
      data[i] = n * Math.pow(1 - i/len, decay) * 0.34;
    }
  }
  return buffer;
}
function connectVoice(node, pan=0){
  if(!audio.ctx || !audio.bus) return;
  if(audio.ctx.createStereoPanner){
    const p = audio.ctx.createStereoPanner();
    p.pan.value = Math.max(-0.8, Math.min(0.8, pan));
    node.connect(p); p.connect(audio.bus);
  }else{
    node.connect(audio.bus);
  }
}
function note(freq, when, dur=1.0, vol=0.05, pan=0){
  if(!audio.ctx || !audio.bus) return;
  const ctx = audio.ctx;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, when);
  out.gain.exponentialRampToValueAtTime(vol, when+0.012);
  out.gain.exponentialRampToValueAtTime(vol*0.34, when+0.18);
  out.gain.exponentialRampToValueAtTime(0.0001, when+dur);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(5200, when);
  filter.frequency.exponentialRampToValueAtTime(1450, when+Math.max(0.28, dur*0.82));
  filter.Q.value = 0.64;

  const body = ctx.createGain();
  body.gain.value = 0.78;
  const shine = ctx.createGain();
  shine.gain.value = 0.18;

  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  o1.type = "triangle";
  o2.type = "sine";
  o1.frequency.setValueAtTime(freq, when);
  o2.frequency.setValueAtTime(freq*2.002, when);
  o1.connect(body);
  o2.connect(shine);
  body.connect(filter);
  shine.connect(filter);
  filter.connect(out);
  connectVoice(out, pan);
  o1.start(when); o2.start(when);
  o1.stop(when+dur+0.05); o2.stop(when+Math.min(dur,0.70)+0.04);

  const len = Math.floor(ctx.sampleRate*0.028);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for(let i=0;i<len;i++) d[i] = (Math.random()*2-1) * Math.pow(1-i/len, 2.6);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol*0.23, when);
  g.gain.exponentialRampToValueAtTime(0.0001, when+0.026);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 3200;
  bp.Q.value = 2.2;
  src.connect(bp); bp.connect(g); connectVoice(g, pan);
  src.start(when); src.stop(when+0.03);
}
function lowNote(freq, when, dur=1.4, vol=0.032, pan=0){
  note(freq, when, dur, vol, pan);
}
function bell(freq, when, vol=0.016, pan=0){
  if(!audio.ctx || !audio.bus) return;
  const ctx = audio.ctx;
  [1,2,4].forEach((r,i)=>{
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(freq*r, when+i*0.006);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vol/(i+1.25), when+0.018);
    g.gain.exponentialRampToValueAtTime(0.0001, when+0.88+i*0.06);
    o.connect(g); connectVoice(g, pan);
    o.start(when); o.stop(when+1.0+i*0.06);
  });
}
function softAir(when, dur=7.5, vol=0.010){
  if(!audio.ctx || !audio.bus) return;
  const ctx = audio.ctx;
  const len = Math.floor(ctx.sampleRate*dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for(let i=0;i<len;i++) d[i] = (Math.random()*2-1) * 0.18;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 1400;
  f.Q.value = 0.38;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(vol, when+1.2);
  g.gain.linearRampToValueAtTime(0.0001, when+dur);
  src.connect(f); f.connect(g); connectVoice(g, -0.16);
  src.start(when); src.stop(when+dur+0.02);
}
function schedulePhrase(t){
  const N = {
    D3:146.83, A3:220.00, D4:293.66, E4:329.63, G4:392.00, A4:440.00, B4:493.88,
    D5:587.33, E5:659.25, G5:783.99, A5:880.00, D6:1174.66, A6:1760.00
  };
  const melody = [
    [0.00,N.D4,1.10,.060,-.18],[0.90,N.G4,0.86,.046,.12],[1.62,N.A4,1.18,.052,-.04],[2.72,N.D5,1.42,.058,.16],
    [4.35,N.B4,0.92,.044,-.14],[5.10,N.A4,1.08,.050,.10],[6.05,N.G4,0.96,.044,-.08],[6.86,N.E4,1.28,.046,.12],[8.12,N.D4,1.55,.058,-.12],
    [10.10,N.G4,0.92,.044,.14],[10.86,N.A4,1.02,.048,-.08],[11.76,N.B4,0.82,.042,.12],[12.42,N.A4,1.10,.046,-.16],[13.38,N.G4,1.26,.050,.08],[14.58,N.D4,1.70,.058,0],
    [17.00,N.D5,1.18,.054,-.12],[17.92,N.B4,0.92,.044,.12],[18.68,N.A4,1.12,.048,-.04],[19.74,N.G4,1.05,.046,.16],[20.70,N.E4,1.18,.044,-.14],
    [21.82,N.G4,0.82,.042,.10],[22.48,N.A4,1.04,.046,-.08],[23.42,N.D5,1.32,.052,.14],[24.74,N.A4,0.95,.044,-.10],[25.48,N.G4,1.18,.048,.10],[26.54,N.D4,1.36,.058,-.02]
  ];
  const bass = [
    [0.00,N.D3,1.45,.030,-.22],[4.00,N.A3,1.12,.024,.20],[8.00,N.D3,1.55,.029,-.12],[14.00,N.A3,1.05,.022,.16],
    [17.00,N.D3,1.20,.026,-.20],[21.00,N.A3,1.10,.022,.18],[26.00,N.D3,1.50,.030,0]
  ];
  melody.forEach(([o,f,d,v,p])=>note(f,t+o,d,v,p));
  bass.forEach(([o,f,d,v,p])=>lowNote(f,t+o,d,v,p));
  [[0.08,N.D6,.012,.28],[8.10,N.A5,.010,-.26],[16.95,N.D6,.011,.22],[26.40,N.A6,.010,-.18]].forEach(([o,f,v,p])=>bell(f,t+o,v,p));
  softAir(t+0.2, 7.4, 0.006);
  softAir(t+17.0, 7.8, 0.005);
}
function playPhrase(){
  if(!audio.enabled || !audio.ctx) return;
  schedulePhrase(audio.ctx.currentTime + 0.10);
}
async function startMusic(){
  initAudio();
  if(!audio.ctx) return;
  try{ await audio.ctx.resume(); }catch(e){}
  audio.enabled = true;
  chooseBgm("on");
  const now = audio.ctx.currentTime;
  if(audio.master){
    audio.master.gain.cancelScheduledValues(now);
    audio.master.gain.setValueAtTime(Math.max(audio.master.gain.value, 0.0001), now);
    audio.master.gain.setTargetAtTime(0.44, now, 0.55);
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
  clearInterval(audio.timer); audio.timer = null;
  if(save) chooseBgm("off");
  updateBgmUI(); updateCommandBar();
}
function toggleMusic(){ audio.enabled ? stopMusic(true) : startMusic(); }
function bind(){
  $("startWithMusic").onclick = () => enterApp("on");
  $("startSilent").onclick = () => enterApp("off");
  $("parentLinkTop").onclick = () => setView("parent");
  $("privacyLinkTop").onclick = () => setView("privacy");
  $("termsLinkTop").onclick = () => setView("terms");
  $("disclaimerLinkTop").onclick = () => setView("disclaimer");
  $("favoriteBtn").onclick = toggleFav;
  $("goSearchTop").onclick = () => setView("search");
  $("goLikesTop").onclick = () => setView("likes");
  $("searchInput").oninput = renderSearch;
  $("audioToggle").onclick = toggleMusic;
}
document.addEventListener("DOMContentLoaded",()=>{bind(); loadData(); updateBgmUI();});
