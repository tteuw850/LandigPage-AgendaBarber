
const cp=require('child_process'),os=require('os'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=9931;
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
const samples={};async function mark(key){const r=await probe();samples[key]=r;console.log('STAGE',key,JSON.stringify(r));return r;}
await mark('start');
await ev("document.querySelector('.white-feature-tabs button:nth-child(2)').click();true");await sleep(170);await mark('transition');
await sleep(1550);await mark('financeFinal');
const midY=samples.financeFinal.whiteAbs+Math.round(samples.financeFinal.runway*.5);
await ev('scrollTo({top:'+midY+',behavior:"instant"});true');await sleep(450);await mark('halfScroll');
await ev('scrollTo({top:'+(samples.financeFinal.whiteAbs+3)+',behavior:"instant"});true');await sleep(450);await mark('insidePhone');
await ev('scrollTo({top:'+(samples.financeFinal.whiteAbs+Math.ceil(samples.financeFinal.runway))+',behavior:"instant"});true');await sleep(450);await mark('zoomBack');
await ev("document.querySelector('.white-feature-tabs button:first-child').click();true");await sleep(170);await mark('reverseText');
await sleep(1500);await mark('back');
const x=samples,checks=[
['start is Agendamento',x.start.tab==='agendamento'&&x.start.nav.opacity>.95&&x.start.fin.opacity<.05],
['Financeiro text moves vertically on click',x.transition.nav.opacity<1&&x.transition.nav.y<0&&x.transition.fin.opacity>0&&x.transition.fin.y>0],
['Financeiro panel enters on click',x.financeFinal.financeOpacity>.98&&x.financeFinal.financeZoom>.95],
['Financeiro text ends in final position',x.financeFinal.nav.opacity<.05&&x.financeFinal.fin.opacity>.95&&Math.abs(x.financeFinal.fin.y)<1],
['Financial panel zoom follows half-scroll',x.halfScroll.financeZoom>.15&&x.halfScroll.financeZoom<.85],
['Financeiro retracts back into phone',x.insidePhone.financeZoom<.02],
['Reverse scrolling restores large zoom',x.zoomBack.financeZoom>.95],
['Agendamento copy returns in vertical reverse',x.reverseText.nav.opacity>0&&x.reverseText.nav.y<0&&x.reverseText.fin.opacity<1&&x.reverseText.fin.y>0],
['Agendamento restored with half gold line',x.back.tab==='agendamento'&&x.back.nav.opacity>.95&&x.back.fin.opacity<.05&&x.back.cardsZoom>.95&&Math.abs(x.back.bar-.5)<.04]
];checks.forEach(([label,pass])=>console.log(pass?'PASS '+label:'FAIL '+label));
console.log('RESULT',checks.filter(x=>x[1]).length+'/'+checks.length);if(checks.some(x=>!x[1]))process.exitCode=1;
}
main().catch(e=>{console.log('CARD_PREVIEW_ERR',e.message);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}try{edge.kill()}catch{}setTimeout(()=>process.exit(),150)});
