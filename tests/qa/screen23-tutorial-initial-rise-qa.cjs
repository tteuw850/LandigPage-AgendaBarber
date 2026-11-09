
const cp=require('child_process'),os=require('os'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=9971;
const edge=cp.spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',['--headless','--disable-gpu','--disable-extensions','--no-sandbox','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+path.join(os.tmpdir(),'ab-card-preview-'+Date.now()),'--window-size=1600,900','http://localhost:5173/'],{stdio:'ignore'});
let ws,id=1;const cb=new Map();
async function main(){
let url;for(let i=0;i<50;i++){try{let p=await fetch('http://localhost:'+port+'/json').then(r=>r.json());url=p.find(x=>x.type==='page'&&x.url.includes('5173'))?.webSocketDebuggerUrl;if(url)break}catch{}await sleep(200)}
if(!url)throw Error('Edge unavailable');
ws=new WebSocket(url);ws.onmessage=e=>{let a=JSON.parse(e.data);if(cb.has(a.id)){cb.get(a.id)(a);cb.delete(a.id)}};
await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
const send=(method,params={})=>new Promise((r,j)=>{const n=id++;cb.set(n,x=>x.error?j(Error(x.error.message)):r(x.result));ws.send(JSON.stringify({id:n,method,params}))});
const ev=async code=>(await send('Runtime.evaluate',{expression:code,returnByValue:true})).result.value;
await send('Page.enable');await sleep(3000);
const p=await ev("(()=>{const s=document.getElementById('proximo-bloco'),top=s.getBoundingClientRect().top+scrollY,vh=innerHeight;return{y:top+Math.max(vh*1.9,1250)+Math.max(vh*1.15,820)+Math.max(vh*1.45,1100)*1.90}})()");
await ev('scrollTo({top:'+Math.round(p.y)+',behavior:"instant"});true');await sleep(900);
const probe=()=>ev("(()=>{const s=document.getElementById('secao-branca'),e=document.querySelector('.white-feature-copy'),c=getComputedStyle(e),m=new DOMMatrixReadOnly(c.transform),r=s.getBoundingClientRect();return{opacity:+c.opacity,translateY:m.m42,whiteTop:r.top,whiteBottom:r.bottom,whiteAbs:r.top+scrollY,scroll:scrollY,vh:innerHeight,shift:s.style.getPropertyValue('--white-tutorial-shift'),tab:s.dataset.feature}})()");
const x={};async function snap(k){const r=await probe();x[k]=r;console.log("STAGE",k,JSON.stringify(r))}
await snap("final");
const y=x.final.whiteAbs;
await ev('scrollTo({top:'+Math.round(y-x.final.vh-10)+',behavior:"instant"});true');await sleep(850);await snap("hiddenOutside");
await ev('scrollTo({top:'+Math.round(y+5)+',behavior:"instant"});true');await sleep(55);await snap("enterStart");
await sleep(260);await snap("enterMid");
await sleep(850);await snap("enterEnd");
await ev('scrollTo({top:'+Math.round(y-x.final.vh*.4)+',behavior:"instant"});true');await sleep(760);await snap("reverseInside");
const z=x,tests=[
["Text starts hidden outside section",z.hiddenOutside.opacity<.02&&z.hiddenOutside.translateY>10],
["Text slides upward while appearing",z.enterStart.translateY>1&&z.enterStart.opacity<1],
["Text keeps moving upward",z.enterMid.translateY<z.enterStart.translateY&&z.enterMid.translateY>0],
["Text settles in place",z.enterEnd.opacity>.99&&Math.abs(z.enterEnd.translateY)<.2],
["Text stays visible on upward scroll",z.reverseInside.opacity>.99&&Math.abs(z.reverseInside.translateY)<.2]
];tests.forEach(([label,ok])=>console.log(ok?"PASS "+label:"FAIL "+label));console.log("RESULT",tests.filter(v=>v[1]).length+"/"+tests.length);if(tests.some(v=>!v[1]))process.exitCode=1;
}
main().catch(e=>{console.log('CARD_PREVIEW_ERR',e.message);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}try{edge.kill()}catch{}setTimeout(()=>process.exit(),150)});
