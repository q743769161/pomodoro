// Pomodoro Focus Timer — single-file Cloudflare Worker
// 纯静态单文件：无 R2/KV、无密钥，部署即用
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/healthz") return new Response("ok");
    return new Response(PAGE, {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" },
    });
  },
};

const PAGE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>番茄专注钟</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --glass:rgba(255,255,255,.34);
  --glass-border:rgba(255,255,255,.55);
  --ink:#1c1c1e;
  --ink-soft:rgba(28,28,30,.62);
  --accent:#ff6b4a;
  --accent2:#7c5cff;
}
html,body{height:100%}
body{
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif;
  color:var(--ink);
  background:
    radial-gradient(1200px 800px at 15% 10%, #a8e6ff 0%, transparent 60%),
    radial-gradient(1000px 700px at 85% 20%, #ffd6e8 0%, transparent 55%),
    radial-gradient(1100px 900px at 50% 100%, #d9c6ff 0%, transparent 60%),
    linear-gradient(160deg,#eef3ff,#f7ecff);
  min-height:100vh;min-height:100dvh;
  display:flex;flex-direction:column;align-items:center;
  padding:24px 16px 40px;
  -webkit-tap-highlight-color:transparent;
}
.wrap{width:100%;max-width:430px;display:flex;flex-direction:column;gap:18px}
header{text-align:center;padding-top:10px}
header h1{font-size:22px;font-weight:700;letter-spacing:.5px}
header p{font-size:13px;color:var(--ink-soft);margin-top:4px}
.glass{
  background:var(--glass);
  backdrop-filter:blur(30px) saturate(160%);
  -webkit-backdrop-filter:blur(30px) saturate(160%);
  border:1px solid var(--glass-border);
  border-radius:24px;
  box-shadow:0 8px 32px rgba(120,110,180,.18), inset 0 1px 0 rgba(255,255,255,.6);
  position:relative;overflow:hidden;
}
.glass::before{
  content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.35) 45%,transparent 60%);
}
/* 模式分段器 */
.seg{display:flex;padding:6px;gap:6px}
.seg button{
  flex:1;border:0;background:transparent;border-radius:16px;
  padding:10px 4px;font-size:14px;font-weight:600;color:var(--ink-soft);
  cursor:pointer;transition:all .25s;
}
.seg button.active{
  background:rgba(255,255,255,.65);color:var(--ink);
  box-shadow:0 2px 10px rgba(120,110,180,.2);
}
/* 计时主卡 */
.timer-card{padding:34px 24px 28px;text-align:center}
.ring{position:relative;width:240px;height:240px;margin:0 auto}
.ring svg{transform:rotate(-90deg)}
.ring .track{stroke:rgba(255,255,255,.5)}
.ring .prog{stroke:url(#grad);stroke-linecap:round;transition:stroke-dashoffset .3s linear}
.ring-center{
  position:absolute;inset:0;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
}
#time{font-size:56px;font-weight:200;font-variant-numeric:tabular-nums;letter-spacing:1px}
#phase{font-size:14px;color:var(--ink-soft);margin-top:6px;font-weight:600}
#cycle{font-size:12px;color:var(--ink-soft);margin-top:2px}
.controls{display:flex;gap:12px;justify-content:center;margin-top:26px}
.btn{
  border:1px solid var(--glass-border);border-radius:18px;cursor:pointer;
  background:rgba(255,255,255,.5);color:var(--ink);
  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  font-weight:700;transition:transform .12s, box-shadow .2s;
  box-shadow:0 4px 14px rgba(120,110,180,.15);
}
.btn:active{transform:scale(.96)}
.btn-primary{
  width:120px;padding:14px 0;font-size:17px;color:#fff;border:0;
  background:linear-gradient(135deg,var(--accent),#ff9d5c);
  box-shadow:0 8px 24px rgba(255,107,74,.4);
}
.btn-ghost{width:64px;padding:14px 0;font-size:15px}
/* 统计 */
.stats{display:flex;padding:18px 8px}
.stats div{flex:1;text-align:center}
.stats .num{font-size:26px;font-weight:700}
.stats .lbl{font-size:12px;color:var(--ink-soft);margin-top:2px}
/* 设置 */
.settings{padding:20px}
.settings h2{font-size:15px;font-weight:700;margin-bottom:14px}
.row{display:flex;align-items:center;justify-content:space-between;padding:9px 2px;font-size:14px}
.stepper{display:flex;align-items:center;gap:10px}
.stepper button{
  width:30px;height:30px;border-radius:50%;border:1px solid var(--glass-border);
  background:rgba(255,255,255,.55);font-size:17px;font-weight:700;color:var(--ink);
  cursor:pointer;line-height:1;
}
.stepper span{min-width:64px;text-align:center;font-weight:700;font-variant-numeric:tabular-nums}
.switch{position:relative;width:46px;height:27px;appearance:none;-webkit-appearance:none;
  background:rgba(120,120,128,.3);border-radius:14px;cursor:pointer;transition:background .2s;outline:none}
.switch:checked{background:#34c759}
.switch::after{content:"";position:absolute;top:2px;left:2px;width:23px;height:23px;border-radius:50%;
  background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.2);transition:left .2s}
.switch:checked::after{left:21px}
footer{text-align:center;font-size:11px;color:var(--ink-soft);padding:6px}
.toast{
  position:fixed;left:50%;bottom:34px;transform:translateX(-50%) translateY(20px);
  background:rgba(28,28,30,.85);color:#fff;font-size:14px;font-weight:600;
  padding:12px 22px;border-radius:16px;opacity:0;pointer-events:none;
  transition:all .3s;z-index:99;white-space:nowrap;
}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>🍅 番茄专注钟</h1>
    <p>一次只做一件事</p>
  </header>

  <div class="glass seg" id="seg">
    <button data-mode="focus" class="active">专注</button>
    <button data-mode="short">短休息</button>
    <button data-mode="long">长休息</button>
  </div>

  <div class="glass timer-card">
    <div class="ring">
      <svg width="240" height="240" viewBox="0 0 240 240">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ff6b4a"/>
            <stop offset="100%" stop-color="#7c5cff"/>
          </linearGradient>
        </defs>
        <circle class="track" cx="120" cy="120" r="108" fill="none" stroke-width="14"/>
        <circle class="prog" id="prog" cx="120" cy="120" r="108" fill="none" stroke-width="14"
          stroke-dasharray="678.6" stroke-dashoffset="0"/>
      </svg>
      <div class="ring-center">
        <div id="time">25:00</div>
        <div id="phase">准备专注</div>
        <div id="cycle">第 1 个番茄</div>
      </div>
    </div>
    <div class="controls">
      <button class="btn btn-ghost" id="btnReset" title="重置">↺</button>
      <button class="btn btn-primary" id="btnMain">开始</button>
      <button class="btn btn-ghost" id="btnSkip" title="跳过">⏭</button>
    </div>
  </div>

  <div class="glass stats">
    <div><div class="num" id="stToday">0</div><div class="lbl">今日番茄</div></div>
    <div><div class="num" id="stMins">0</div><div class="lbl">今日专注(分)</div></div>
    <div><div class="num" id="stTotal">0</div><div class="lbl">累计番茄</div></div>
  </div>

  <div class="glass settings">
    <h2>⚙️ 设置</h2>
    <div class="row"><span>专注时长</span><div class="stepper">
      <button data-set="focus" data-d="-5">−</button><span id="vFocus">25 分钟</span><button data-set="focus" data-d="5">＋</button></div></div>
    <div class="row"><span>短休息时长</span><div class="stepper">
      <button data-set="short" data-d="-1">−</button><span id="vShort">5 分钟</span><button data-set="short" data-d="1">＋</button></div></div>
    <div class="row"><span>长休息时长</span><div class="stepper">
      <button data-set="long" data-d="-5">−</button><span id="vLong">15 分钟</span><button data-set="long" data-d="5">＋</button></div></div>
    <div class="row"><span>几个番茄后长休息</span><div class="stepper">
      <button data-set="cycles" data-d="-1">−</button><span id="vCycles">4 个</span><button data-set="cycles" data-d="1">＋</button></div></div>
    <div class="row"><span>结束时播放提示音</span><input type="checkbox" class="switch" id="swSound" checked></div>
    <div class="row"><span>休息结束后自动开始专注</span><input type="checkbox" class="switch" id="swAuto"></div>
  </div>

  <footer>数据只保存在本机浏览器 · 刷新不丢失进度</footer>
</div>
<div class="toast" id="toast"></div>

<script>
(function(){
"use strict";
var KEY="pomodoro_v1";
var C=2*Math.PI*108; // 678.58
var state={
  cfg:{focus:25,short:5,long:15,cycles:4,sound:true,auto:false},
  mode:"focus", running:false, endAt:0, remain:25*60,
  done:0, // 本轮已完成番茄数
  stats:{day:"",today:0,todayMins:0,total:0}
};
try{
  var s=JSON.parse(localStorage.getItem(KEY)||"null");
  if(s&&s.cfg) state.cfg=Object.assign(state.cfg,s.cfg);
  if(s&&s.stats) state.stats=s.stats;
}catch(e){}

var todayStr=function(){var d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();};
if(state.stats.day!==todayStr()){state.stats.day=todayStr();state.stats.today=0;state.stats.todayMins=0;}

function save(){try{localStorage.setItem(KEY,JSON.stringify({cfg:state.cfg,stats:state.stats}));}catch(e){}}
function dur(){return state.cfg[state.mode]*60;}
function el(id){return document.getElementById(id);}
function fmt(sec){sec=Math.max(0,Math.ceil(sec));var m=Math.floor(sec/60),s=sec%60;return (m<10?"0":"")+m+":"+(s<10?"0":"")+s;}
var MODENAME={focus:"专注",short:"短休息",long:"长休息"};

function render(){
  var total=dur();
  var r=state.running?Math.max(0,(state.endAt-Date.now())/1000):state.remain;
  el("time").textContent=fmt(r);
  el("prog").style.strokeDashoffset=C*(1-r/total);
  el("phase").textContent=state.running?("正在"+MODENAME[state.mode]):("准备"+MODENAME[state.mode]);
  el("cycle").textContent="第 "+(state.done+1)+" 个番茄";
  el("btnMain").textContent=state.running?"暂停":"开始";
  document.title=(state.running?fmt(r)+" · ":"")+MODENAME[state.mode]+" - 番茄专注钟";
  el("stToday").textContent=state.stats.today;
  el("stMins").textContent=state.stats.todayMins;
  el("stTotal").textContent=state.stats.total;
  el("vFocus").textContent=state.cfg.focus+" 分钟";
  el("vShort").textContent=state.cfg.short+" 分钟";
  el("vLong").textContent=state.cfg.long+" 分钟";
  el("vCycles").textContent=state.cfg.cycles+" 个";
  el("swSound").checked=state.cfg.sound;
  el("swAuto").checked=state.cfg.auto;
  var btns=document.querySelectorAll("#seg button");
  for(var i=0;i<btns.length;i++)btns[i].classList.toggle("active",btns[i].dataset.mode===state.mode);
}

var tickTimer=null;
function start(){
  state.running=true;
  state.endAt=Date.now()+state.remain*1000;
  tickTimer=setInterval(tick,250);
  render();
}
function pause(){
  state.running=false;
  state.remain=Math.max(0,(state.endAt-Date.now())/1000);
  clearInterval(tickTimer);
  render();save();
}
function tick(){
  var r=(state.endAt-Date.now())/1000;
  if(r<=0){finish();return;}
  render();
}
function finish(){
  clearInterval(tickTimer);
  state.running=false;
  if(state.cfg.sound)chime();
  if(state.mode==="focus"){
    state.done++;
    state.stats.today++;state.stats.total++;
    state.stats.todayMins+=state.cfg.focus;
    var next=state.done%state.cfg.cycles===0?"long":"short";
    toast("🎉 完成一个番茄！"+(next==="long"?"好好长休息一下":"休息一下吧"));
    setMode(next);
    if(state.cfg.auto){start();}
  }else{
    toast("⏰ 休息结束，开始专注吧！");
    setMode("focus");
    if(state.cfg.auto){start();}
  }
  save();render();
}
function setMode(m){
  if(state.running)pause();
  state.mode=m;state.remain=state.cfg[m]*60;
  render();save();
}
function chime(){
  try{
    var ctx=new (window.AudioContext||window.webkitAudioContext)();
    [523.25,659.25,783.99].forEach(function(f,i){
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.type="sine";o.frequency.value=f;
      g.gain.setValueAtTime(0.0001,ctx.currentTime+i*0.22);
      g.gain.exponentialRampToValueAtTime(0.5,ctx.currentTime+i*0.22+0.03);
      g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+i*0.22+0.4);
      o.connect(g);g.connect(ctx.destination);
      o.start(ctx.currentTime+i*0.22);o.stop(ctx.currentTime+i*0.22+0.45);
    });
  }catch(e){}
}
var toastT=null;
function toast(msg){
  var t=el("toast");t.textContent=msg;t.classList.add("show");
  clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove("show");},2600);
}

el("btnMain").onclick=function(){state.running?pause():start();};
el("btnReset").onclick=function(){if(state.running)pause();state.remain=dur();render();save();toast("已重置");};
el("btnSkip").onclick=function(){finish();};
document.querySelectorAll("#seg button").forEach(function(b){
  b.onclick=function(){setMode(b.dataset.mode);};
});
document.querySelectorAll(".stepper button").forEach(function(b){
  b.onclick=function(){
    var k=b.dataset.set,d=parseInt(b.dataset.d,10);
    var lim={focus:[5,120,5],short:[1,30,1],long:[5,60,5],cycles:[2,8,1]}[k];
    var v=state.cfg[k]+d;
    v=Math.max(lim[0],Math.min(lim[1],v));
    state.cfg[k]=v;
    if(!state.running&&((k===state.mode)))state.remain=v*60;
    render();save();
  };
});
el("swSound").onchange=function(){state.cfg.sound=this.checked;save();};
el("swAuto").onchange=function(){state.cfg.auto=this.checked;save();};

setMode("focus");
setInterval(function(){ // 跨天清零
  if(state.stats.day!==todayStr()){state.stats.day=todayStr();state.stats.today=0;state.stats.todayMins=0;render();save();}
},60000);
})();
</script>
</body>
</html>`;

