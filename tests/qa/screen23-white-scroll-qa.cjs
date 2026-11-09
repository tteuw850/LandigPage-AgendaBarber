
const cp=require('child_process'),os=require('os'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=+(process.argv[2]||9511),width=+(process.argv[3]||1600);
const edge=cp.spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',['--headless','--disable-gpu','--disable-extensions','--no-sandbox','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+path.join(os.tmpdir(),'ab-white-scroll-qa-'+port+'-'+Date.now()),'--window-size='+width+',900','http://localhost:5173/'],{stdio:'ignore'});
let ws;const responses=new Map();let id=1;
async function main(){
let endpoint;
for(let i=0;i<60;i++){try{const pages=await fetch('http://localhost:'+port+'/json').then(r=>r.json());endpoint=pages.find(p=>p.type==='page'&&p.url.includes('5173'))?.webSocketDebuggerUrl;if(endpoint)break}catch{}await sleep(150)}
if(!endpoint)throw Error('Browser unavailable');
ws=new WebSocket(endpoint);
ws.onmessage=e=>{const m=JSON.parse(e.data),cb=responses.get(m.id);if(cb){responses.delete(m.id);cb(m)}};
await new Promise((ok,no)=>{ws.onopen=ok;ws.onerror=no});
const send=(method,params={})=>new Promise((ok,no)=>{const n=id++;responses.set(n,r=>r.error?no(Error(r.error.message)):ok(r.result));ws.send(JSON.stringify({id:n,method,params}))});
const evalJS=async x=>(await send('Runtime.evaluate',{expression:x,returnByValue:true})).result.value;
await send('Page.enable');await sleep(650);
const setup=await evalJS("(()=>{const s=document.getElementById('proximo-bloco'),wh=document.getElementById('secao-branca');const top=s.getBoundingClientRect().top+scrollY;const vh=innerHeight;return{vh,exitAt:top+Math.max(vh*1.9,1250)+Math.max(vh*1.15,820),runway:Math.max(vh*1.45,1100),whiteTop:wh.getBoundingClientRect().top+scrollY}})()");
console.log('SETUP',width,JSON.stringify(setup));
const steps=[['home',-9],['before',.43],['docking',.475],['entry',.48],['start',.51],['middle',.65],['late',.83],['end',.98],['reverse',.65],['reverse-edge',.48],['reverse-before',.43],['home-back',-9]];
const rows=[];
for(const [label,t] of steps){
const position=t<0?0:setup.exitAt+setup.runway*t;
await evalJS('scrollTo({top:'+Math.round(position)+',behavior:"instant"});true');
await sleep(110);
const v=await evalJS("(()=>{const w=document.getElementById('secao-branca'),b=document.getElementById('proximo-bloco'),p=document.querySelector('.diagonal-phone'),a=document.querySelector('.diagonal-phone-angled-frame'),c=document.querySelector('.diagonal-phone .hero-phone-cards'),ar=a.getBoundingClientRect(),wr=w.getBoundingClientRect();return{scroll:scrollY,whiteY:Math.round(wr.top),whiteH:Math.round(wr.height),blackBottom:Math.round(b.getBoundingClientRect().bottom),angleX:Math.round(ar.x),angleY:Math.round(ar.y),angledOpacity:+getComputedStyle(a).opacity,originalOpacity:+getComputedStyle(p).opacity,cardsOpacity:+getComputedStyle(c).opacity}})()");
rows.push({label,...v});console.log('STAGE',label,JSON.stringify(v));
}
const by=Object.fromEntries(rows.map(r=>[r.label,r]));const checks=[];
function check(ok,label){checks.push(!!ok);console.log(ok?'PASS':'FAIL',label)}
check(by.home.originalOpacity>.99 && by.home.angledOpacity<.01,'Hero original handset visible');
check(by.before.whiteY>=setup.vh-3 && by.before.angledOpacity<.01,'White not yet entering before dock');
check(by.docking.cardsOpacity>.0 && by.docking.whiteY>=setup.vh-3,'Final docking on black stage');
check(Math.abs(by.entry.whiteY-setup.vh)<=4,'White starts entering at exact diagonal trigger');
check(by.start.whiteY<setup.vh-10&&by.start.angleX<by.entry.angleX&&by.start.angleY>by.entry.angleY&&by.start.angledOpacity>0,'Angled handset and white enter on same scroll');
check(by.middle.whiteY<by.start.whiteY&&by.middle.angleX<by.start.angleX&&by.middle.angleY>by.start.angleY,'Middle diagonal and white rise together');
check(by.late.whiteY<by.middle.whiteY&&by.late.angleX<by.middle.angleX&&by.late.angleY>by.middle.angleY,'End diagonal and white rise together');
check(by.end.whiteY<by.late.whiteY&&by.end.angledOpacity>.98&&by.end.originalOpacity<.02,'White incoming under tilted handset');
check(by.reverse.whiteY>by.end.whiteY&&by.reverse.angleX>by.end.angleX&&by.reverse.angleY<by.end.angleY,'Reverse movement synchronizes white and phone');
check(by['reverse-before'].whiteY>=setup.vh-3&&by['reverse-before'].angledOpacity<.01,'Reverse reaches original black section');
check(by['home-back'].originalOpacity>.99,'Hero handset preserved after reverse');
console.log('RESULT',checks.every(Boolean)?'PASS':'FAIL',checks.filter(Boolean).length+'/'+checks.length);
if(!checks.every(Boolean))process.exitCode=1;
}
main().catch(e=>{console.error('TEST_ERROR',e.stack||e);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}try{edge.kill()}catch{}setTimeout(()=>process.exit(),100)});
