const fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const browser=cp.spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',['--headless','--disable-gpu','--disable-extensions','--no-sandbox','--no-first-run','--remote-debugging-port=9477','--user-data-dir='+path.join(os.tmpdir(),'agenda-slide-down-'+Date.now()),'--window-size=1600,900','http://localhost:5173/'],{stdio:'ignore'});
let ws;const pending=new Map();let id=1;
async function main(){let endpoint;
for(let k=0;k<35;k++){try{const t=await fetch('http://localhost:9477/json').then(r=>r.json());endpoint=t.find(x=>x.type==='page'&&x.url.includes('5173'))?.webSocketDebuggerUrl;if(endpoint)break}catch{}await sleep(200)}
if(!endpoint)throw Error('Browser not ready');
ws=new WebSocket(endpoint);ws.onmessage=e=>{const m=JSON.parse(e.data);if(pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}};
await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej});
const send=(method,params={})=>new Promise((res,rej)=>{const n=id++;pending.set(n,m=>m.error?rej(Error(m.error.message)):res(m.result));ws.send(JSON.stringify({id:n,method,params}))});
await send('Page.enable');await sleep(2500);
for(const [label,y] of [['top',0],['enter',520],['middle',1250],['right',2200],['reverse',0]]){
 await send('Runtime.evaluate',{expression:'scrollTo({top:'+y+',behavior:"instant"});true',returnByValue:true});
 await sleep(700);
 const r=await send('Runtime.evaluate',{expression:'(()=>{const p=document.querySelector(".single-phone-floating"),a=document.querySelector(".hero-phone-anchor"),s=document.querySelector(".next-section");return{scrollY,phoneCount:document.querySelectorAll(".hero-phone").length,phone:p?.getBoundingClientRect().toJSON(),phoneOpacity:getComputedStyle(p).opacity,phoneTransform:getComputedStyle(p).transform,clip:getComputedStyle(p).clipPath,section:s?.getBoundingClientRect().toJSON(),anchor:a?.getBoundingClientRect().toJSON(),hasBarber:!!document.querySelector(".handoff-barber"),hasSpinVideo:!!document.querySelector(".single-phone-video")}})()',returnByValue:true});
 console.log(label,JSON.stringify(r.result.value));
 const pic=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
 fs.writeFileSync(path.join(os.tmpdir(),'agenda-slide-'+label+'.png'),Buffer.from(pic.data,'base64'));
}}
main().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}try{browser.kill()}catch{}setTimeout(()=>process.exit(),200)});