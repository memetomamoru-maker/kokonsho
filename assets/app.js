const $ = (id) => document.getElementById(id);
const STORE_FAV = "kokonsho:favorites:v1";
const STORE_BGM = "kokonsho:bgm:v1";
let DATA = [];
let idx = 0;
let genre = "all";
let view = "top";
let favs = new Set(loadFavs());
let bgmChoice = localStorage.getItem(STORE_BGM) || "off";
let audio = { ctx:null, master:null, timer:null, enabled:false, pausedByVisibility:false };

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
function renderSearch(){
  renderGenres();
  const box = $("list");
  if(!box) return;
  const results = getSearchResults();
  const title = $("resultTitle");
  if(title) title.textContent = resultHeading(results.length);
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
  bus.gain.value = 0.72;

  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 5600;
  tone.Q.value = 0.45;

  const warmth = ctx.createBiquadFilter();
  warmth.type = "highpass";
  warmth.frequency.value = 42;
  warmth.Q.value = 0.5;

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -30;
  compressor.knee.value = 20;
  compressor.ratio.value = 1.75;
  compressor.attack.value = 0.020;
  compressor.release.value = 0.38;

  const delay = ctx.createDelay(1.2);
  delay.delayTime.value = 0.36;
  const delayGain = ctx.createGain();
  delayGain.gain.value = 0.055;
  const delayTone = ctx.createBiquadFilter();
  delayTone.type = "lowpass";
  delayTone.frequency.value = 2500;

  const reverb = ctx.createConvolver();
  reverb.buffer = makeReverb(ctx, 2.8, 2.9);
  const reverbGain = ctx.createGain();
  reverbGain.gain.value = 0.135;

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
  audio.loopSec = 32;
  audio.scheduledUntil = 0;
}
function makeReverb(ctx, seconds=2.8, decay=2.9){
  const len = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, len, ctx.sampleRate);
  for(let ch=0; ch<2; ch++){
    const data = buffer.getChannelData(ch);
    let last = 0;
    for(let i=0; i<len; i++){
      const n = Math.random()*2-1;
      last = last * 0.86 + n * 0.14;
      data[i] = last * Math.pow(1 - i/len, decay) * 0.28;
    }
  }
  return buffer;
}
function connectVoice(node, pan=0){
  if(!audio.ctx || !audio.bus) return;
  if(audio.ctx.createStereoPanner){
    const p = audio.ctx.createStereoPanner();
    p.pan.value = Math.max(-0.72, Math.min(0.72, pan));
    node.connect(p); p.connect(audio.bus);
  }else{
    node.connect(audio.bus);
  }
}
function note(freq, when, dur=1.0, vol=0.05, pan=0){
  if(!audio.ctx || !audio.bus) return;
  const ctx = audio.ctx;
  const out = ctx.createGain();
  const peak = Math.max(0.0001, vol);
  out.gain.setValueAtTime(0.0001, when);
  out.gain.exponentialRampToValueAtTime(peak, when+0.018);
  out.gain.exponentialRampToValueAtTime(peak*0.42, when+0.20);
  out.gain.exponentialRampToValueAtTime(peak*0.15, when+Math.max(0.45, dur*0.62));
  out.gain.exponentialRampToValueAtTime(0.0001, when+dur);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(4200, when);
  filter.frequency.exponentialRampToValueAtTime(1250, when+Math.max(0.36, dur*0.78));
  filter.Q.value = 0.48;

  const body = ctx.createGain();
  body.gain.value = 0.74;
  const overtone = ctx.createGain();
  overtone.gain.value = 0.13;
  const air = ctx.createGain();
  air.gain.value = 0.045;

  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  const o3 = ctx.createOscillator();
  o1.type = "triangle";
  o2.type = "sine";
  o3.type = "sine";
  o1.frequency.setValueAtTime(freq, when);
  o2.frequency.setValueAtTime(freq*2.004, when);
  o3.frequency.setValueAtTime(freq*3.01, when);
  if(o1.detune) o1.detune.setValueAtTime(-3, when);
  if(o2.detune) o2.detune.setValueAtTime(4, when);
  o1.connect(body);
  o2.connect(overtone);
  o3.connect(air);
  body.connect(filter);
  overtone.connect(filter);
  air.connect(filter);
  filter.connect(out);
  connectVoice(out, pan);
  o1.start(when); o2.start(when); o3.start(when);
  o1.stop(when+dur+0.06); o2.stop(when+Math.min(dur,0.9)+0.04); o3.stop(when+Math.min(dur,0.5)+0.04);

  const len = Math.floor(ctx.sampleRate*0.022);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for(let i=0;i<len;i++) d[i] = (Math.random()*2-1) * Math.pow(1-i/len, 3.4) * 0.34;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol*0.075, when);
  g.gain.exponentialRampToValueAtTime(0.0001, when+0.020);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2600;
  bp.Q.value = 1.8;
  src.connect(bp); bp.connect(g); connectVoice(g, pan);
  src.start(when); src.stop(when+0.024);
}
function lowNote(freq, when, dur=2.4, vol=0.020, pan=0){
  if(!audio.ctx || !audio.bus) return;
  const ctx = audio.ctx;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(vol, when+0.16);
  g.gain.exponentialRampToValueAtTime(vol*0.45, when+dur*0.62);
  g.gain.exponentialRampToValueAtTime(0.0001, when+dur);

  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 1100;
  f.Q.value = 0.35;
  const o = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  o.type = "sine";
  o2.type = "triangle";
  o.frequency.setValueAtTime(freq, when);
  o2.frequency.setValueAtTime(freq*2.001, when);
  const o2g = ctx.createGain();
  o2g.gain.value = 0.18;
  o.connect(f);
  o2.connect(o2g); o2g.connect(f);
  f.connect(g); connectVoice(g, pan);
  o.start(when); o2.start(when);
  o.stop(when+dur+0.08); o2.stop(when+dur+0.08);
}
function bell(freq, when, vol=0.010, pan=0){
  if(!audio.ctx || !audio.bus) return;
  const ctx = audio.ctx;
  [1,2,3.01,4.02].forEach((r,i)=>{
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(freq*r, when+i*0.008);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vol/(i+1.35), when+0.030);
    g.gain.exponentialRampToValueAtTime(0.0001, when+1.55+i*0.12);
    o.connect(g); connectVoice(g, pan);
    o.start(when); o.stop(when+1.7+i*0.12);
  });
}
function softAir(when, dur=8.0, vol=0.0045, pan=-0.10){
  if(!audio.ctx || !audio.bus) return;
  const ctx = audio.ctx;
  const len = Math.floor(ctx.sampleRate*dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for(let i=0;i<len;i++){
    last = last * 0.92 + (Math.random()*2-1) * 0.08;
    d[i] = last * 0.16;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 1180;
  f.Q.value = 0.42;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(vol, when+1.6);
  g.gain.linearRampToValueAtTime(vol*0.62, when+dur*0.58);
  g.gain.linearRampToValueAtTime(0.0001, when+dur);
  src.connect(f); f.connect(g); connectVoice(g, pan);
  src.start(when); src.stop(when+dur+0.02);
}
function schedulePhrase(t){
  const N = {
    D3:146.83, G3:196.00, A3:220.00, B3:246.94,
    D4:293.66, E4:329.63, G4:392.00, A4:440.00, B4:493.88,
    D5:587.33, E5:659.25, G5:783.99, A5:880.00, B5:987.77,
    D6:1174.66, E6:1318.51, A6:1760.00
  };
  const melody = [
    [0.00,N.D4,1.22,.042,-.18],[1.12,N.E4,0.86,.033,.10],[2.00,N.G4,1.32,.039,-.05],[3.28,N.A4,1.68,.043,.16],
    [5.68,N.G4,1.08,.034,-.12],[6.62,N.E4,1.28,.035,.12],[7.92,N.D4,1.95,.042,-.04],
    [10.60,N.A4,1.12,.039,.14],[11.58,N.B4,0.92,.032,-.10],[12.40,N.D5,1.64,.043,.10],[14.28,N.B4,1.02,.032,-.16],[15.18,N.A4,1.76,.037,.06],
    [18.20,N.G4,1.08,.034,-.14],[19.12,N.A4,1.02,.035,.14],[20.06,N.B4,1.24,.036,-.06],[21.38,N.D5,1.86,.042,.12],
    [24.36,N.A4,1.18,.035,-.10],[25.48,N.G4,1.18,.034,.08],[26.60,N.E4,1.34,.032,-.12],[28.10,N.D4,2.18,.043,.02]
  ];
  const ornament = [
    [4.96,N.D5,0.42,.018,-.26],[5.36,N.B4,0.44,.014,-.20],
    [16.92,N.E5,0.38,.017,.24],[17.26,N.D5,0.46,.014,.18],
    [22.98,N.G5,0.36,.015,-.22],[23.30,N.E5,0.48,.012,-.16]
  ];
  const bass = [
    [0.00,N.D3,2.8,.018,-.20],[7.80,N.A3,2.5,.014,.18],
    [15.70,N.G3,2.7,.014,-.14],[23.70,N.A3,2.4,.013,.16],[28.00,N.D3,2.8,.018,-.02]
  ];
  melody.forEach(([o,f,d,v,p])=>note(f,t+o,d,v,p));
  ornament.forEach(([o,f,d,v,p])=>note(f,t+o,d,v,p));
  bass.forEach(([o,f,d,v,p])=>lowNote(f,t+o,d,v,p));
  [[0.18,N.D6,.006,.30],[9.95,N.A5,.005,-.28],[17.88,N.E6,.005,.24],[30.00,N.D6,.006,-.16]].forEach(([o,f,v,p])=>bell(f,t+o,v,p));
  softAir(t+0.2, 9.2, 0.0034, -0.16);
  softAir(t+15.7, 8.4, 0.0028, 0.14);
}
function playPhrase(){
  if(!audio.enabled || !audio.ctx) return;
  schedulePhrase(audio.ctx.currentTime + 0.10);
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
    audio.master.gain.setTargetAtTime(0.32, now, 0.70);
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
    audio.master.gain.setTargetAtTime(0.32, now, 0.55);
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
document.addEventListener("visibilitychange", handleVisibilityChange);
window.addEventListener("pagehide", pauseMusicForVisibility);
window.addEventListener("pageshow", () => { if(!document.hidden) resumeMusicForVisibility(); });
document.addEventListener("DOMContentLoaded",()=>{bind(); loadData(); updateBgmUI();});
