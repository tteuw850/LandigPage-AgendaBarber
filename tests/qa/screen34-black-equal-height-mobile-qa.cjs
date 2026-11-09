
const cp=require('child_process'),os=require('os'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=9982;
const edge=cp.spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',['--headless','--disable-gpu','--disable-extensions','--no-sandbox','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+path.join(os.tmpdir(),'ab-card-preview-'+Date.now()),'--window-size=430,900','http://localhost:5173/'],{stdio:'ignore'});
let ws,id=1;const cb=new Map();
async function main(){
let url;for(let i=0;i<50;i++){try{let p=await fetch('http://localhost:'+port+'/json').then(r=>r.json());url=p.find(x=>x.type==='page'&&x.url.includes('5173'))?.webSocketDebuggerUrl;if(url)break}catch{}await sleep(200)}
if(!url)throw Error('Edge unavailable');
ws=new WebSocket(url);ws.onmessage=e=>{let a=JSON.parse(e.data);if(cb.has(a.id)){cb.get(a.id)(a);cb.delete(a.id)}};
await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
const send=(method,params={})=>new Promise((r,j)=>{const n=id++;cb.set(n,x=>x.error?j(Error(x.error.message)):r(x.result));ws.send(JSON.stringify({id:n,method,params}))});
const ev=async code=>(await send('Runtime.evaluate',{expression:code,returnByValue:true})).result.value;
await send('Page.enable');await sleep(1650);
await sleep(950);
let exists=false;
for(let attempt=0;attempt<20&&!exists;attempt++){
  try{exists=!!(await ev("!!document.querySelector('#secao-preta-final')"))}catch{}
  if(!exists)await sleep(350);
}
if(!exists)throw Error("New black chapter missing after extended DOM ready wait");
const probe=()=>ev("(()=>{const w=document.getElementById('secao-branca'),b=document.getElementById('secao-preta-final'),phone=document.querySelector('.diagonal-phone-angled-frame'),wr=w.getBoundingClientRect(),br=b.getBoundingClientRect();return{whiteTop:wr.top+scrollY,blackTop:br.top+scrollY,whiteHeight:wr.height,blackHeight:br.height,whiteBottom:wr.bottom+scrollY,bg:getComputedStyle(b).backgroundColor,phoneOpacity:getComputedStyle(phone).opacity,visibleBlackPx:Math.min(innerHeight,Math.max(0,innerHeight-br.top)),windowWidth:innerWidth,windowHeight:innerHeight,blackText:b.textContent.trim(),documentTotal:document.documentElement.scrollHeight}})()");
const a=await probe(); console.log("STAGE initial",JSON.stringify(a));
const blackMiddle=Math.round(a.blackTop+a.windowHeight*.35);
await ev('scrollTo({top:'+blackMiddle+',behavior:"instant"});true');
await sleep(450);
const b=await probe(); console.log("STAGE black",JSON.stringify(b));
const checks=[
["Black chapter follows white chapter",Math.abs(a.blackTop-a.whiteBottom)<2],
["Black height exactly matches white height",Math.abs(a.blackHeight-a.whiteHeight)<2],
["Black canvas is pure black",b.bg==="rgb(0, 0, 0)"],
["Black chapter has no placeholder copy",b.blackText.length===0],
["Black chapter fills viewport when scrolled",b.visibleBlackPx>=b.windowHeight-2],
["Angled phone hidden on black chapter",+b.phoneOpacity<.01],
];for(const [name,yes] of checks)console.log(yes?"PASS "+name:"FAIL "+name);
console.log("RESULT",checks.filter(q=>q[1]).length+"/"+checks.length);if(checks.some(q=>!q[1]))process.exitCode=1;
}
main().catch(e=>{console.log('CARD_PREVIEW_ERR',e.message);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}try{edge.kill()}catch{}setTimeout(()=>process.exit(),150)});
