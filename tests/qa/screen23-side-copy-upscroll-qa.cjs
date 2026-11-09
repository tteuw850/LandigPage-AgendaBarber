
const cp=require('child_process'),os=require('os'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=9951;
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
const details=await ev("(()=>{const c=[...document.querySelectorAll('.diagonal-float-card')];return c.map(e=>{const img=e.querySelector('img'),r=e.getBoundingClientRect();return{class:e.className,src:img.currentSrc,natural:[img.naturalWidth,img.naturalHeight],box:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],opacity:getComputedStyle(e).opacity,objectFit:getComputedStyle(img).objectFit}})})()");
console.log('CARDS',JSON.stringify(details));
const probe=()=>ev("(()=>{const sec=document.getElementById('secao-branca'),phone=document.querySelector('.diagonal-phone-angled-frame'),popup=document.querySelector('.diagonal-finance-popup'),nav=document.querySelector('.white-feature-panel--agendamento'),fin=document.querySelector('.white-feature-panel--financeiro'),line=document.querySelector('.white-feature-rule');const col=e=>{const style=getComputedStyle(e);return{opacity:+style.opacity,y:new DOMMatrixReadOnly(style.transform).m42}};const r=popup.getBoundingClientRect();return{tab:sec.dataset.feature,whiteY:sec.getBoundingClientRect().top,whiteAbs:sec.getBoundingClientRect().top+scrollY,runway:Math.max(innerHeight*.85,620),bar:line.querySelector('span').getBoundingClientRect().width/line.getBoundingClientRect().width,financeOpacity:+phone.style.getPropertyValue('--finance-popup-opacity'),financeZoom:+phone.style.getPropertyValue('--finance-popup-expand'),cardsOpacity:+phone.style.getPropertyValue('--angled-cards-opacity'),cardsZoom:+phone.style.getPropertyValue('--angled-cards-burst'),financeX:r.x,financeWidth:r.width,nav:col(nav),fin:col(fin)}})()");
const copyProbe=()=>ev("(()=>{const white=document.getElementById('secao-branca'),phone=document.querySelector('.diagonal-phone-angled-frame'),copy=document.querySelector('.white-feature-copy'),w=white.getBoundingClientRect();return{scroll:scrollY,whiteAbs:w.top+scrollY,whiteTop:w.top,whiteBottom:w.bottom,copyOpacity:+getComputedStyle(copy).opacity,cardsOpacity:+phone.style.getPropertyValue('--angled-cards-opacity'),financeOpacity:+phone.style.getPropertyValue('--finance-popup-opacity'),tab:white.dataset.feature,vh:innerHeight}})()");
const stages={};
async function measure(label){const p=await copyProbe();stages[label]=p;console.log("STAGE",label,JSON.stringify(p));return p;}
async function goto(y){await ev('scrollTo({top:'+Math.round(y)+',behavior:"instant"});true');await sleep(430);}
const first=await measure("initialFinal");
await goto(first.whiteAbs-first.vh*.45);await measure("upIntoTransition");
await goto(first.whiteAbs+first.vh*.45);await measure("returnToFinal");
await goto(first.whiteAbs-first.vh-12);await measure("leaveWhiteUp");
await goto(first.whiteAbs-first.vh*.45);await measure("enterWhiteAgain");
await goto(first.whiteAbs+first.vh*.45);await measure("revealAgain");
await ev("document.querySelector('.white-feature-tabs button:nth-child(2)').click();true");
await sleep(1450);await measure("financeActive");
await goto(first.whiteAbs-first.vh*.45);await measure("financeBackUp");
const x=stages,checks=[
["Initially side copy is shown",x.initialFinal.copyOpacity>.98],
["Side copy persists while scrolling upward into transition",x.upIntoTransition.copyOpacity>.98&&x.upIntoTransition.cardsOpacity<.05],
["Side copy remains when scrolling down again",x.returnToFinal.copyOpacity>.98],
["Side copy hides when white section entirely leaves viewport",x.leaveWhiteUp.copyOpacity<.02&&x.leaveWhiteUp.whiteTop>x.leaveWhiteUp.vh],
["Fresh partial white entry remains hidden",x.enterWhiteAgain.copyOpacity<.02],
["Full white entry triggers side copy again",x.revealAgain.copyOpacity>.98],
["Financeiro tab keeps text visible",x.financeActive.tab==="financeiro"&&x.financeActive.copyOpacity>.98],
["Financeiro text persists on upward scroll",x.financeBackUp.copyOpacity>.98&&x.financeBackUp.financeOpacity<.05]
];for(const [label,ok] of checks)console.log(ok?"PASS "+label:"FAIL "+label);console.log("RESULT",checks.filter(x=>x[1]).length+"/"+checks.length);if(checks.some(x=>!x[1]))process.exitCode=1;
}
main().catch(e=>{console.log('CARD_PREVIEW_ERR',e.message);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}try{edge.kill()}catch{}setTimeout(()=>process.exit(),150)});
