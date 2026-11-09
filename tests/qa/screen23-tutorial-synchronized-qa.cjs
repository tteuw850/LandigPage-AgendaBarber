
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
await send('Page.enable');await sleep(1800);await evalJS('scrollTo({top:0,behavior:"instant"});true');await sleep(300);
let setup=await evalJS("(()=>{const s=document.getElementById('proximo-bloco'),wh=document.getElementById('secao-branca');const top=s.getBoundingClientRect().top+scrollY;const vh=innerHeight;return{vh,exitAt:top+Math.max(vh*1.9,1250)+Math.max(vh*1.15,820),runway:Math.max(vh*1.45,1100),whiteTop:wh.getBoundingClientRect().top+scrollY}})()");
await sleep(650);
await evalJS('scrollTo({top:0,behavior:"instant"});true');await sleep(200);
setup=await evalJS("(()=>{const s=document.getElementById('proximo-bloco'),wh=document.getElementById('secao-branca');const top=s.getBoundingClientRect().top+scrollY;const vh=innerHeight;return{vh,exitAt:top+Math.max(vh*1.9,1250)+Math.max(vh*1.15,820),runway:Math.max(vh*1.45,1100),whiteTop:wh.getBoundingClientRect().top+scrollY}})()");
console.log('SETUP',width,JSON.stringify(setup));
const steps=[['home',-9],['before',.43],['docking',.475],['entry',.48],['start',.51],['middle',.65],['late',.83],['almost',.94],['end',.98],['white-full',1.24],['zoom25',1.39],['zoom50',1.53],['zoom100',1.90],['reverseZoom',1.53],['reverse-end',.98],['reverse-near',.94],['reverse',.65],['reverse-edge',.48],['reverse-before',.43],['home-back',-9]];
const rows=[];
for(const [label,t] of steps){
const position=t<0?0:setup.exitAt+setup.runway*t;
await evalJS('scrollTo({top:'+Math.round(position)+',behavior:"instant"});true');
await sleep(200);
const v=await evalJS("(()=>{const w=document.getElementById('secao-branca'),b=document.getElementById('proximo-bloco'),p=document.querySelector('.diagonal-phone'),a=document.querySelector('.diagonal-phone-angled-frame'),c=document.querySelector('.diagonal-phone .hero-phone-cards'),ar=a.getBoundingClientRect(),wr=w.getBoundingClientRect();const u=document.querySelector('.diagonal-float-card--upper').getBoundingClientRect(),l=document.querySelector('.diagonal-float-card--lower').getBoundingClientRect();return{upperX:Math.round(u.x),upperY:Math.round(u.y),upperW:Math.round(u.width),lowerX:Math.round(l.x),lowerY:Math.round(l.y),lowerW:Math.round(l.width),zoom:+a.style.getPropertyValue('--angled-cards-burst'),scroll:scrollY,whiteY:Math.round(wr.top),whiteH:Math.round(wr.height),blackBottom:Math.round(b.getBoundingClientRect().bottom),angleX:Math.round(ar.x),angleY:Math.round(ar.y),angledOpacity:+getComputedStyle(a).opacity,originalOpacity:+getComputedStyle(p).opacity,cardsOpacity:+getComputedStyle(c).opacity,insideOpacity:+getComputedStyle(document.querySelector('.diagonal-phone-angled-screen')).opacity,tutorialOpacity:+getComputedStyle(document.querySelector('.white-feature-copy')).opacity,visibleMidY:Math.round(ar.y+ar.height*730/1448),screenHeight:innerHeight}})()");
rows.push({label,...v});console.log('STAGE',label,JSON.stringify(v));
}
const by=Object.fromEntries(rows.map(r=>[r.label,r]));const checks=[];
function check(ok,label){checks.push(!!ok);console.log(ok?'PASS':'FAIL',label)}
check(by.home.originalOpacity>.99 && by.home.angledOpacity<.01,'Hero original handset visible');
check(by.before.whiteY>=setup.vh-3 && by.before.angledOpacity<.01,'White not yet entering before dock');
check(by.docking.cardsOpacity>.0 && by.docking.whiteY>=setup.vh-3,'Final docking on black stage');
check(Math.abs(by.entry.whiteY-setup.vh)<=4,'White starts entering at exact diagonal trigger');
check(by.start.whiteY<setup.vh-10&&by.start.angleX<by.entry.angleX&&by.start.angleY>=by.entry.angleY&&by.start.angledOpacity>0,'Angled handset and white enter on same scroll');
check(by.middle.whiteY<by.start.whiteY&&by.middle.angleX<by.start.angleX&&by.middle.angleY>by.start.angleY,'Middle diagonal and white rise together');
check(by.late.whiteY<by.middle.whiteY&&by.late.angleX<by.middle.angleX&&by.late.angleY>by.middle.angleY,'End diagonal and white rise together');
check(by.end.whiteY<by.late.whiteY&&by.end.angledOpacity>.98&&by.end.originalOpacity<.02,'White incoming under tilted handset');
check(by.reverse.whiteY>by.end.whiteY&&by.reverse.angleX>by.end.angleX&&by.reverse.angleY<by.end.angleY,'Reverse movement synchronizes white and phone');
check(by['reverse-before'].whiteY>=setup.vh-3&&by['reverse-before'].angledOpacity<.01,'Reverse reaches original black section');
check(by['home-back'].originalOpacity>.99,'Hero handset preserved after reverse');
check(by.before.insideOpacity<.01&&by.middle.insideOpacity<.01&&by.almost.insideOpacity<.01,'No cards until phone reaches final position');
check(by.end.insideOpacity<.01 && by.end.whiteY>1,'Cards still hidden while black section remains visible');
check(by['white-full'].insideOpacity>.99 && by['white-full'].whiteY<=1,'Cards appear once final white section fills viewport');
check(by['reverse-end'].insideOpacity<.01,'Cards hide when scrolling back out of full white stage');
check(by['reverse-near'].insideOpacity<.01&&by.reverse.insideOpacity<.01,'Cards hide again during reverse scroll');
check(width<620 || Math.abs(by.end.visibleMidY-by.end.screenHeight/2)<12,'Visible phone vertically centered on desktop');
check(by['white-full'].insideOpacity>.99&&by['white-full'].zoom<.05,'Cards appear inside phone at start of white chapter');
check(by.zoom25.zoom>.03&&by.zoom25.zoom<.5,'Scroll starts zoom');
check(by.zoom50.zoom>by.zoom25.zoom&&by.zoom50.zoom<1,'Zoom grows continuously');
check(by.zoom100.zoom>.98,'Large zoom fully reached');
check(by.zoom100.upperW>by['white-full'].upperW*1.5&&by.zoom100.lowerW>by['white-full'].lowerW*1.5,'Both cards physically grow');
check(by.zoom100.upperX>by['white-full'].upperX&&by.zoom100.lowerX<by['white-full'].lowerX,'Upper leaves to right, lower leaves to left');
check(by.reverseZoom.zoom<by.zoom100.zoom&&by.reverseZoom.zoom>.1,'Reverse scroll contracts cards');
check(rows.every(r=>Math.abs(r.tutorialOpacity-r.insideOpacity)<0.001),'Tutorial visible exactly when pop-ups are visible');
check(by['white-full'].tutorialOpacity>.99&&by.zoom100.tutorialOpacity>.99&&by['reverse-end'].tutorialOpacity<.01,'Tutorial enters at final white and hides on reverse');
const copy=await evalJS("(()=>{const c=document.querySelector('.white-feature-copy'),h=c.querySelector('.white-feature-count');return{header:h.textContent.trim(),title:c.querySelector('h2').textContent.trim(),desc:c.querySelector('.white-feature-description').textContent.trim()}})()");
check(copy.header==='FUNCIONALIDADES AGENDA BARBER','Header exact requested text');
check(copy.desc.includes('cliente')&&copy.desc.includes('data')&&copy.desc.includes('hor')&&copy.desc.includes('servi')&&copy.title.includes('fácil'),'Tutorial covers client, date, time, service');
console.log('RESULT',checks.every(Boolean)?'PASS':'FAIL',checks.filter(Boolean).length+'/'+checks.length);
if(!checks.every(Boolean))process.exitCode=1;
}
main().catch(e=>{console.error('TEST_ERROR',e.stack||e);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}try{edge.kill()}catch{}setTimeout(()=>process.exit(),100)});
