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
  div.innerHTML = `${like?'<span class="heartSmall">♥</span>':''}<span class="pill">${esc(item.genre)}</span><div class="title">${rubyfy(shortText(displayKid(item), 46))}</div><div class="subline">${rubyfy(shortText(item.source || item.author || item.original, 44))}</div><span class="chev" style="position:absolute;right:16px;top:50%;transform:translateY(-50%)">›</span>`;
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
  top.onclick = () => setView("top");
  top.querySelector("span:last-child").textContent = "TOP";
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
  $("startWithMusic")?.classList.toggle("active", bgmChoice==="on");
  $("startSilent")?.classList.toggle("active", bgmChoice!=="on");
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
  bus.gain.value = 0.98;

  const dry = ctx.createGain();
  dry.gain.value = 0.78;

  const toneFilter = ctx.createBiquadFilter();
  toneFilter.type = "lowpass";
  toneFilter.frequency.value = 8400;
  toneFilter.Q.value = 0.64;

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -30;
  compressor.knee.value = 22;
  compressor.ratio.value = 2.6;
  compressor.attack.value = 0.018;
  compressor.release.value = 0.34;

  const delay = ctx.createDelay(1.4);
  delay.delayTime.value = 0.37;
  const delayGain = ctx.createGain();
  delayGain.gain.value = 0.135;
  const delayTone = ctx.createBiquadFilter();
  delayTone.type = "lowpass";
  delayTone.frequency.value = 3600;

  const reverb = ctx.createConvolver();
  reverb.buffer = makeReverb(ctx, 2.4, 2.15);
  const reverbGain = ctx.createGain();
  reverbGain.gain.value = 0.21;

  bus.connect(dry);
  dry.connect(toneFilter);
  toneFilter.connect(compressor);
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
  audio.loopSec = 24;
}
function makeReverb(ctx, seconds=2.1, decay=2.0){
  const length = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for(let ch=0; ch<2; ch++){
    const data = impulse.getChannelData(ch);
    for(let i=0; i<length; i++){
      const t = i / length;
      const early = i < ctx.sampleRate * 0.045 ? 1.18 : 0.72;
      data[i] = (Math.random()*2-1) * Math.pow(1-t, decay) * early * 0.36;
    }
  }
  return impulse;
}
function withPan(node, pan=0){
  if(!audio.ctx || !audio.ctx.createStereoPanner) return node;
  const panner = audio.ctx.createStereoPanner();
  panner.pan.value = Math.max(-0.65, Math.min(0.65, pan));
  node.connect(panner);
  return panner;
}
function connectVoice(node, pan=0){
  if(!audio.bus) return;
  const out = withPan(node, pan);
  out.connect(audio.bus);
}
function koto(freq, when, dur=1.55, vol=0.064, pan=0){
  if(!audio.ctx || !audio.bus) return;
  const ctx = audio.ctx;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, when);
  out.gain.exponentialRampToValueAtTime(vol, when+0.010);
  out.gain.exponentialRampToValueAtTime(vol*0.43, when+0.105);
  out.gain.exponentialRampToValueAtTime(0.0001, when+dur);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(6200, when);
  filter.frequency.exponentialRampToValueAtTime(1550, when+dur);
  filter.Q.value = 1.05;

  const body = ctx.createGain();
  body.gain.value = 0.78;
  const bright = ctx.createGain();
  bright.gain.value = 0.34;

  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  const o3 = ctx.createOscillator();
  o1.type = "triangle";
  o2.type = "sine";
  o3.type = "triangle";
  o1.frequency.setValueAtTime(freq, when);
  o2.frequency.setValueAtTime(freq*2.01, when);
  o3.frequency.setValueAtTime(freq*3.01, when);
  o1.detune.setValueAtTime(-4, when);
  o2.detune.setValueAtTime(5, when);
  o3.detune.setValueAtTime(2, when);
  o1.connect(body); o2.connect(bright); o3.connect(bright);
  body.connect(filter); bright.connect(filter);
  filter.connect(out);
  connectVoice(out, pan);
  o1.start(when); o2.start(when); o3.start(when);
  o1.stop(when+dur+0.08); o2.stop(when+dur+0.08); o3.stop(when+Math.min(0.55, dur)+0.04);

  const noiseLen = Math.floor(ctx.sampleRate*0.045);
  const buf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for(let i=0;i<noiseLen;i++) d[i] = (Math.random()*2-1) * Math.pow(1-i/noiseLen, 2.7);
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(vol*0.58, when);
  ng.gain.exponentialRampToValueAtTime(0.0001, when+0.044);
  const nf = ctx.createBiquadFilter();
  nf.type = "bandpass";
  nf.frequency.value = 4200;
  nf.Q.value = 3.4;
  noise.connect(nf); nf.connect(ng); connectVoice(ng, pan);
  noise.start(when); noise.stop(when+0.052);
}
function shamisen(freq, when, dur=0.62, vol=0.035, pan=0){
  if(!audio.ctx || !audio.bus) return;
  const ctx = audio.ctx;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, when);
  out.gain.exponentialRampToValueAtTime(vol, when+0.008);
  out.gain.exponentialRampToValueAtTime(vol*0.22, when+0.075);
  out.gain.exponentialRampToValueAtTime(0.0001, when+dur);
  const osc = ctx.createOscillator();
  const filt = ctx.createBiquadFilter();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(freq, when);
  filt.type = "bandpass";
  filt.frequency.setValueAtTime(freq*2.2, when);
  filt.Q.value = 1.3;
  osc.connect(filt); filt.connect(out); connectVoice(out, pan);
  osc.start(when); osc.stop(when+dur+0.04);
}
function flute(freq, when, dur=1.3, vol=0.030, pan=0){
  if(!audio.ctx || !audio.bus) return;
  const ctx = audio.ctx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq*0.994, when);
  osc.frequency.linearRampToValueAtTime(freq, when+0.20);
  lfo.type = "sine";
  lfo.frequency.value = 5.25;
  lfoGain.gain.setValueAtTime(0.1, when);
  lfoGain.gain.linearRampToValueAtTime(2.6, when+0.45);
  lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
  filter.type = "lowpass";
  filter.frequency.value = 2850;
  filter.Q.value = 0.7;
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.linearRampToValueAtTime(vol, when+0.22);
  gain.gain.setValueAtTime(vol*0.86, when+Math.max(0.26, dur-0.34));
  gain.gain.linearRampToValueAtTime(0.0001, when+dur);
  osc.connect(filter); filter.connect(gain); connectVoice(gain, pan);
  osc.start(when); lfo.start(when);
  osc.stop(when+dur+0.05); lfo.stop(when+dur+0.05);

  const noiseLen = Math.floor(ctx.sampleRate*dur);
  const buf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for(let i=0; i<noiseLen; i++) data[i] = (Math.random()*2-1) * 0.32;
  const breath = ctx.createBufferSource();
  breath.buffer = buf;
  const bg = ctx.createGain();
  bg.gain.setValueAtTime(0.0001, when);
  bg.gain.linearRampToValueAtTime(vol*0.22, when+0.18);
  bg.gain.linearRampToValueAtTime(0.0001, when+dur);
  const bf = ctx.createBiquadFilter();
  bf.type = "bandpass";
  bf.frequency.value = 1900;
  bf.Q.value = 0.55;
  breath.connect(bf); bf.connect(bg); connectVoice(bg, pan);
  breath.start(when); breath.stop(when+dur+0.03);
}
function shoPad(freqs, when, dur=11.7, vol=0.014, pan=0){
  if(!audio.ctx || !audio.bus) return;
  const ctx = audio.ctx;
  freqs.forEach((freq, i)=>{
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = i%2 ? "sine" : "triangle";
    osc.frequency.setValueAtTime(freq, when);
    osc.detune.value = (i-1)*3;
    filter.type = "lowpass";
    filter.frequency.value = 1350 + i*120;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(vol/(i+1.05), when+1.15);
    gain.gain.setValueAtTime(vol*0.74/(i+1.05), when+dur-1.1);
    gain.gain.linearRampToValueAtTime(0.0001, when+dur);
    osc.connect(filter); filter.connect(gain); connectVoice(gain, pan + (i-1)*0.08);
    osc.start(when); osc.stop(when+dur+0.08);
  });
}
function suzu(freq, when, vol=0.022, pan=0){
  if(!audio.ctx || !audio.bus) return;
  const ctx = audio.ctx;
  [1, 2.37, 3.84, 5.21].forEach((r, i)=>{
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq*r, when+i*0.004);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(vol/(i+1.15), when+0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, when+0.82+i*0.10);
    osc.connect(gain); connectVoice(gain, pan);
    osc.start(when); osc.stop(when+0.98+i*0.08);
  });
}
function woodTick(when, vol=0.018, pan=0){
  if(!audio.ctx || !audio.bus) return;
  const ctx = audio.ctx;
  const len = Math.floor(ctx.sampleRate*0.05);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for(let i=0;i<len;i++) d[i] = (Math.random()*2-1) * Math.pow(1-i/len, 5.0);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 760;
  f.Q.value = 5.2;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, when);
  g.gain.exponentialRampToValueAtTime(0.0001, when+0.05);
  src.connect(f); f.connect(g); connectVoice(g, pan);
  src.start(when); src.stop(when+0.055);
}
function playPhrase(){
  if(!audio.enabled || !audio.ctx) return;
  const t = audio.ctx.currentTime + 0.08;
  const N = {
    D3:146.83, Eb3:155.56, G3:196.00, A3:220.00, Bb3:233.08,
    D4:293.66, Eb4:311.13, G4:392.00, A4:440.00, Bb4:466.16,
    D5:587.33, Eb5:622.25, G5:783.99, A5:880.00, Bb5:932.33,
    D6:1174.66, Eb6:1244.51, G6:1567.98, A6:1760.00
  };

  shoPad([N.D3, N.A3, N.Eb4], t, 11.8, 0.015, -0.12);
  shoPad([N.G3, N.D4, N.Bb4], t+12.0, 11.6, 0.014, 0.12);

  const kotoLine = [
    [0.00,N.D4,1.55,.070,-.20],[0.42,N.A4,.96,.049,.18],[0.84,N.D5,1.42,.062,-.06],[1.46,N.Eb5,.74,.044,.22],
    [2.38,N.G4,1.18,.050,-.26],[2.86,N.A4,.92,.046,.12],[3.26,N.Bb4,.86,.042,-.02],[3.68,N.D5,1.34,.058,.18],
    [4.86,N.A4,.96,.044,-.18],[5.26,N.G4,1.20,.050,.10],[5.80,N.Eb4,.86,.040,-.10],[6.24,N.D4,1.56,.062,.22],
    [7.70,N.G4,1.04,.047,-.24],[8.08,N.A4,.86,.042,.06],[8.46,N.D5,1.22,.057,.20],
    [9.76,N.Bb4,.90,.043,-.18],[10.16,N.A4,.92,.042,.14],[10.60,N.G4,1.12,.047,-.02],[11.10,N.D4,1.32,.058,.20],

    [12.00,N.G4,1.26,.054,-.20],[12.42,N.Bb4,.94,.046,.14],[12.84,N.D5,1.25,.058,-.04],[13.36,N.Eb5,.84,.048,.22],
    [14.30,N.D5,1.12,.054,-.18],[14.74,N.Bb4,.86,.042,.10],[15.10,N.A4,1.08,.046,-.06],[15.60,N.G4,1.38,.054,.18],
    [16.86,N.Eb4,.92,.041,-.20],[17.24,N.G4,.96,.047,.08],[17.66,N.A4,1.12,.048,.18],[18.18,N.D5,1.44,.060,-.10],
    [19.66,N.Eb5,.88,.046,.22],[20.08,N.D5,1.10,.056,-.16],[20.58,N.Bb4,.94,.044,.10],[21.02,N.A4,.98,.042,-.04],
    [22.04,N.G4,1.10,.050,.16],[22.52,N.Eb4,.82,.040,-.18],[22.88,N.D4,1.55,.066,.08]
  ];
  kotoLine.forEach(([o,f,d,v,p])=>koto(f, t+o, d, v, p));

  [[1.96,N.A4,1.28,.026,.28],[4.18,N.Eb5,1.05,.023,-.22],[6.78,N.D5,1.38,.025,.18],[13.82,N.Bb4,1.16,.024,-.22],[16.00,N.D5,1.44,.026,.26],[19.20,N.Eb5,1.18,.023,-.18],[21.40,N.A4,1.48,.022,.16]].forEach(([o,f,d,v,p])=>flute(f,t+o,d,v,p));

  [[0.02,N.D6,.014,-.30],[5.68,N.A5,.012,.24],[11.62,N.Eb6,.012,-.18],[12.06,N.G6,.013,.30],[18.02,N.D6,.011,-.26],[23.20,N.A6,.013,.22]].forEach(([o,f,v,p])=>suzu(f,t+o,v,p));

  [3.92,7.92,15.92,19.92].forEach((o,i)=>woodTick(t+o, i%2?0.012:0.015, i%2?0.28:-0.28));
  [0.02,12.02].forEach(o=>shamisen(N.D3, t+o, .72, .020, -0.06));
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
    audio.master.gain.setTargetAtTime(0.34, now, 0.42);
  }
  clearInterval(audio.timer);
  playPhrase();
  audio.timer = setInterval(playPhrase, (audio.loopSec || 24) * 1000);
  updateBgmUI(); updateCommandBar();
}
function stopMusic(save=true){
  if(audio.ctx && audio.master){
    const now = audio.ctx.currentTime;
    audio.master.gain.cancelScheduledValues(now);
    audio.master.gain.setTargetAtTime(0.0001, now, 0.22);
  }
  audio.enabled = false;
  clearInterval(audio.timer); audio.timer = null;
  if(save) chooseBgm("off");
  updateBgmUI(); updateCommandBar();
}
function toggleMusic(){ audio.enabled ? stopMusic(true) : startMusic(); }
function bind(){
  $("startBtn").onclick = () => enterApp(bgmChoice);
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
