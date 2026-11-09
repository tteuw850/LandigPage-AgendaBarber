
const cp=require('child_process'),os=require('os'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=+(process.argv[2]||9531),width=+(process.argv[3]||1600);
const browser=cp.spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',['--headless','--disable-gpu','--disable-extensions','--no-sandbox','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+path.join(os.tmpdir(),'agenda-visual-edge-align-'+port+'-'+Date.now()),'--window-size='+width+',900','http://localhost:5173/'],{stdio:'ignore'});
let ws;let id=1;const pending=new Map();
async function main(){
let endpoint;
for(let i=0;i<55;i++){try{const t=await fetch('http://localhost:'+port+'/json').then(r=>r.json());endpoint=t.find(x=>x.type==='page'&&x.url.includes('5173'))?.webSocketDebuggerUrl;if(endpoint)break}catch{}await sleep(200)}
if(!endpoint)throw Error('Edge CDP unavailable');
ws=new WebSocket(endpoint);
ws.onmessage=e=>{const r=JSON.parse(e.data);const cb=pending.get(r.id);if(cb){pending.delete(r.id);cb(r)}};
await new Promise((ok,no)=>{ws.onopen=ok;ws.onerror=no});
const send=(method,params={})=>new Promise((ok,no)=>{const n=id++;pending.set(n,r=>r.error?no(Error(r.error.message)):ok(r.result));ws.send(JSON.stringify({id:n,method,params}))});
const ev=async x=>(await send('Runtime.evaluate',{expression:x,returnByValue:true})).result.value;
await send('Page.enable');await sleep(1200);
const scene=await ev("(()=>{const s=document.getElementById('proximo-bloco'),top=s.getBoundingClientRect().top+scrollY,vh=innerHeight;return{exitAt:top+Math.max(vh*1.9,1250)+Math.max(vh*1.15,820),runway:Math.max(vh*1.45,1100)}})()");
await ev('scrollTo({top:'+Math.round(scene.exitAt+scene.runway*.99)+',behavior:"instant"});true');await sleep(400);
const result=await ev("(()=>{const s=document.getElementById('proximo-bloco'),a=document.querySelector('.diagonal-phone-angled-frame'),c=s.querySelector('.feature-copy'),h=s.querySelector('.feature-title'),p=document.querySelector('.diagonal-phone'),ar=a.getBoundingClientRect(),cr=c.getBoundingClientRect(),hr=h.getBoundingClientRect(),phoneHeight=parseFloat(getComputedStyle(a).height);return {scrollY,copyLeft:cr.left,titleLeft:hr.left,rawBoxLeft:ar.left,rawBoxRight:ar.right,imageHeight:phoneHeight,visibleFrameLeft:ar.left+(221/1448)*phoneHeight,visibleFrameRight:ar.left+(832/1448)*phoneHeight,angledOpacity:+getComputedStyle(a).opacity,oldOpacity:+getComputedStyle(p).opacity,whiteTop:document.getElementById('secao-branca').getBoundingClientRect().top}})()");
const difference=Math.round((result.visibleFrameLeft-result.copyLeft)*10)/10;
console.log('ALIGN_CHECK',width,JSON.stringify(result),'DIFFERENCE_PX',difference);
const pass=Math.abs(difference)<=14 && result.angledOpacity>.99 && result.oldOpacity<.01;
console.log(pass?'PASS':'FAIL','visible frame aligned with text start',width);
if(!pass)process.exitCode=1;
}
main().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}try{browser.kill()}catch{}setTimeout(()=>process.exit(),100)});
