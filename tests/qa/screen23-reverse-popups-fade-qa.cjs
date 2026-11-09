
const cp=require('child_process'),os=require('os'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=10121;
const edge=cp.spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',['--headless','--disable-gpu','--disable-extensions','--no-sandbox','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+path.join(os.tmpdir(),'ab-card-preview-'+Date.now()),'--window-size=1600,900','http://localhost:5173/'],{stdio:'ignore'});
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
const exists=await ev("!!document.querySelector('#secao-preta-final')");
if(!exists)throw Error("New black chapter missing from document");
const probe=()=>ev("(()=>{const white=document.getElementById('secao-branca'),phone=document.querySelector('.diagonal-phone-angled-frame'),bounds=white.getBoundingClientRect(),screen=document.querySelector('.diagonal-phone-angled-screen'),fi=document.querySelector('.diagonal-finance-popup');return{whiteAbs:bounds.top+scrollY,vh:innerHeight,whiteTop:bounds.top,scale:+phone.style.getPropertyValue('--angled-cards-burst'),cards:+getComputedStyle(screen).opacity,finZoom:+phone.style.getPropertyValue('--finance-popup-expand'),finance:+getComputedStyle(fi).opacity,parent:+getComputedStyle(phone).opacity,copy:+getComputedStyle(document.querySelector('.white-feature-copy')).opacity}})()");
async function go(y){await ev('scrollTo({top:'+Math.round(y)+',behavior:"instant"});true')}
const samples={};async function capture(key){samples[key]=await probe();console.log("STAGE",key,JSON.stringify(samples[key]))}
const init=await probe(),edgeY=init.whiteAbs;
await go(edgeY+80);await sleep(1250);await capture("agendamentoStart");
await go(edgeY-24);await sleep(85);await capture("agendamentoReverse85");
await sleep(210);await capture("agendamentoReverse295");
await sleep(250);await capture("agendamentoReverse545");
await sleep(450);await capture("agendamentoReverse995");
await go(edgeY+80);await sleep(1250);await capture("agendamentoRestored");
await ev("document.querySelector('.white-feature-tabs button:nth-child(2)').click();true");await sleep(1350);await capture("financeStart");
await go(edgeY-24);await sleep(85);await capture("financeReverse85");
await sleep(210);await capture("financeReverse295");
await sleep(650);await capture("financeReverse945");
await go(edgeY+80);await sleep(1250);await capture("financeRestored");
const x=samples,check=[
["Agenda is visible before reversal",x.agendamentoStart.cards>.97&&Math.abs(x.agendamentoStart.scale-.45)<.02],
["Agenda stays visible immediately after crossing boundary",x.agendamentoReverse85.cards>.9&&x.agendamentoReverse85.scale>.25],
["Agenda visibly shrinks before fading",x.agendamentoReverse295.scale<x.agendamentoReverse85.scale&&x.agendamentoReverse295.scale>.04&&x.agendamentoReverse295.cards>.2],
["Agenda disappears at end of reverse animation",x.agendamentoReverse995.cards<.02&&x.agendamentoReverse995.scale<.01],
["Agenda zooms back on downward scroll",x.agendamentoRestored.cards>.97&&Math.abs(x.agendamentoRestored.scale-.45)<.02],
["Financeiro initially visible",x.financeStart.finance>.97&&x.financeStart.finZoom>.95],
["Financeiro remains visible when reversal starts",x.financeReverse85.finance>.9&&x.financeReverse85.finZoom>.55],
["Financeiro shrinks before disappearing",x.financeReverse295.finZoom<x.financeReverse85.finZoom&&x.financeReverse295.finance>.2],
["Financeiro hidden after finishing reverse animation",x.financeReverse945.finance<.02&&x.financeReverse945.finZoom<.01],
["Financeiro returns on downward scroll",x.financeRestored.finance>.97&&x.financeRestored.finZoom>.95],
["Lateral text stays visible while scrolling up",x.agendamentoReverse545.copy>.97&&x.financeReverse295.copy>.97]
];for(const [label,ok] of check)console.log((ok?"PASS ":"FAIL ")+label);
console.log("RESULT",check.filter(x=>x[1]).length+"/"+check.length);if(check.some(x=>!x[1]))process.exitCode=1;
}
main().catch(e=>{console.log('CARD_PREVIEW_ERR',e.message);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}try{edge.kill()}catch{}setTimeout(()=>process.exit(),150)});
