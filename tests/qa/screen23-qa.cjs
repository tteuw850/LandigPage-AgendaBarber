
const fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process');
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const browser=cp.spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',['--headless','--disable-gpu','--disable-extensions','--no-sandbox','--no-first-run','--remote-debugging-port=9482','--user-data-dir='+path.join(os.tmpdir(),'agenda-screen23-qa-'+Date.now()),'--window-size=1600,900','http://localhost:5173/'],{stdio:'ignore'});
let ws,id=1;const pending=new Map();
async function main(){
let endpoint;
for(let k=0;k<50;k++){try{const t=await fetch('http://localhost:9482/json').then(r=>r.json());endpoint=t.find(x=>x.type==='page'&&x.url.includes('5173'))?.webSocketDebuggerUrl;if(endpoint)break}catch{}await sleep(180)}
if(!endpoint)throw Error('Edge CDP not ready');
ws=new WebSocket(endpoint);
ws.onmessage=e=>{const m=JSON.parse(e.data);if(pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}};
await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
const send=(method,params={})=>new Promise((resolve,reject)=>{const n=id++;pending.set(n,m=>m.error?reject(Error(m.error.message)):resolve(m.result));ws.send(JSON.stringify({id:n,method,params}))});
const ev=async ex=>(await send('Runtime.evaluate',{expression:ex,returnByValue:true})).result.value;
await send('Page.enable');await sleep(800);
const pos=await ev("(()=>{const s=document.getElementById('proximo-bloco'),w=document.getElementById('secao-branca');const secTop=s.getBoundingClientRect().top+scrollY;const sr=Math.max(innerHeight*1.9,1250),tr=Math.max(innerHeight*1.15,820),er=Math.max(innerHeight*1.45,1100);return{secTop,exitAt:secTop+sr+tr,er,whiteTop:w.getBoundingClientRect().top+scrollY}})()");
console.log('SECTIONS',JSON.stringify(pos));
const cases=[['top',0],['black-scenes',pos.exitAt-130],['retract',pos.exitAt+pos.er*.30],['cards-hidden',pos.exitAt+pos.er*.49],['swapping',pos.exitAt+pos.er*.56],['angled-left',pos.exitAt+pos.er*.98],['white',pos.whiteTop+200],['reverse-swap',pos.exitAt+pos.er*.55],['reverse-open',pos.exitAt-130],['back-top',0]];
let failed=0,values=[];
for(const [label,y] of cases){
await ev('scrollTo({top:'+Math.round(y)+',behavior:"instant"});true');await sleep(600);
const v=await ev("(()=>{const p=document.querySelector('.diagonal-phone'),a=document.querySelector('.diagonal-phone-angled-frame'),c=document.querySelector('.diagonal-phone .hero-phone-cards'),ag=document.querySelector('.diagonal-phone .hero-phone-card--panel'),st=document.querySelector('.diagonal-phone .hero-phone-card--stats');const pbox=p?.getBoundingClientRect(),abox=a?.getBoundingClientRect();return{scroll:scrollY,oldOpacity:Number(getComputedStyle(p).opacity),angledOpacity:Number(getComputedStyle(a).opacity),cardsOpacity:Number(getComputedStyle(c).opacity),phoneX:Math.round(pbox?.x||0),phoneY:Math.round(pbox?.y||0),angleX:Math.round(abox?.x||0),angleY:Math.round(abox?.y||0),agendaTransform:getComputedStyle(ag).transform,statsTransform:getComputedStyle(st).transform}})()");
values.push({label,...v});console.log('CHECK',label,JSON.stringify(v));
}
const by=Object.fromEntries(values.map(v=>[v.label,v]));
function check(cond,message){console.log(cond?'PASS':'FAIL',message);if(!cond)failed++}
check(by.top.oldOpacity>.95&&by.top.angledOpacity<.05,'phone visible in first hero');
check(by['black-scenes'].oldOpacity>.95&&by['black-scenes'].angledOpacity<.05,'original phone preserved in black section');
check(by.retract.cardsOpacity>.95,'popup cards remain visible while docking');
check(by['cards-hidden'].cardsOpacity<.05,'all cards hidden after docking');
check(by['angled-left'].angledOpacity>.90&&by['angled-left'].oldOpacity<.1,'only tilted phone after handoff');
check(by['angled-left'].angleX+150<by.swapping.angleX,'phone moves diagonally left');
check(by.white.angledOpacity>.90,'tilted phone remains on white stage');
check(by['reverse-open'].cardsOpacity>.95&&by['reverse-open'].oldOpacity>.95,'reverse scroll restores popups');
check(by['back-top'].oldOpacity>.95&&by['back-top'].angledOpacity<.05,'reverse scroll restores first screen');
console.log('QA_RESULT',failed?'FAIL_'+failed:'PASS');
if(failed)process.exitCode=1;
}
main().catch(e=>{console.log('QA_EXCEPTION',e.message);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}try{browser.kill()}catch{}setTimeout(()=>process.exit(),100)});
