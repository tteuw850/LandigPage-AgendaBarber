
const cp=require('child_process'), os=require('os'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=Number(process.argv[2]||9490);
const width=Number(process.argv[3]||1600);
const height=900;
const edge=cp.spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',['--headless','--disable-gpu','--disable-extensions','--no-sandbox','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+path.join(os.tmpdir(),'agenda-diagonal-synced-'+port+'-'+Date.now()),'--window-size='+width+','+height,'http://localhost:5173/'],{stdio:'ignore'});
let ws,id=1;const pending=new Map();
async function main(){
 let endpoint;
 for(let k=0;k<50;k++){try{const items=await fetch('http://localhost:'+port+'/json').then(x=>x.json());endpoint=items.find(x=>x.type==='page'&&x.url.includes('5173'))?.webSocketDebuggerUrl;if(endpoint)break}catch{}await sleep(150)}
 if(!endpoint) throw Error('Edge not available');
 ws=new WebSocket(endpoint);
 ws.onmessage=e=>{const x=JSON.parse(e.data);if(pending.has(x.id)){pending.get(x.id)(x);pending.delete(x.id)}};
 await new Promise((ok,no)=>{ws.onopen=ok;ws.onerror=no});
 const send=(method,params={})=>new Promise((ok,no)=>{const n=id++;pending.set(n,x=>x.error?no(Error(x.error.message)):ok(x.result));ws.send(JSON.stringify({id:n,method,params}))});
 const evalJS=async exp=>(await send('Runtime.evaluate',{expression:exp,returnByValue:true})).result.value;
 await send('Page.enable');await sleep(650);
 const scene=await evalJS("(()=>{const s=document.getElementById('proximo-bloco');const top=s.getBoundingClientRect().top+scrollY;return {exitAt:top+Math.max(innerHeight*1.9,1250)+Math.max(innerHeight*1.15,820),runway:Math.max(innerHeight*1.15,1100)}})()");
 console.log('METADATA',width,scene);
 const cases=[['initial',0],['before',-0.03],['hidden',0.48],['start',0.52],['early',0.58],['middle',0.70],['late',0.84],['complete',0.98],['reverse',0.58],['again',0.48],['home',0]];
 const values=[];
 for(const [name,t] of cases) {
  const y=name==='initial'||name==='home'?0:scene.exitAt+scene.runway*t;
  await evalJS('scrollTo({top:'+Math.round(y)+',behavior:"instant"});true');
  await sleep(520);
  const row=await evalJS("(()=>{const p=document.querySelector('.diagonal-phone'),a=document.querySelector('.diagonal-phone-angled-frame'),c=document.querySelector('.diagonal-phone .hero-phone-cards');const x=a.getBoundingClientRect(),pbox=p.getBoundingClientRect();return{scroll:Math.round(scrollY),x:Math.round(x.x),y:Math.round(x.y),w:Math.round(x.width),h:Math.round(x.height),angleOpacity:+getComputedStyle(a).opacity,oldOpacity:+getComputedStyle(p).opacity,cardsOpacity:+getComputedStyle(c).opacity,rot:getComputedStyle(a).transform}})()");
  values.push({name,...row});console.log(name,JSON.stringify(row));
 }
 const by=Object.fromEntries(values.map(v=>[v.name,v]));
 const tests=[
  [by.initial.oldOpacity>.99&&by.initial.angleOpacity<.01,'original hero unchanged'],
  [by.before.oldOpacity>.99&&by.before.angleOpacity<.01,'black features unchanged'],
  [by.hidden.cardsOpacity<.05,'cards hidden before phone starts leaving'],
  [by.start.x<by.hidden.x&&by.start.y>by.hidden.y&&by.start.angleOpacity>0,'turn and diagonal begin together'],
  [by.early.x<by.start.x&&by.early.y>by.start.y,'early movement: left and down in same step'],
  [by.middle.x<by.early.x&&by.middle.y>by.early.y,'middle movement: left and down together'],
  [by.late.x<by.middle.x&&by.late.y>by.middle.y,'late movement: left and down together'],
  [by.complete.angleOpacity>.98&&by.complete.oldOpacity<.02,'only angled phone at end'],
  [by.reverse.x>by.complete.x&&by.reverse.y<by.complete.y,'reverse direction moves right and up'],
  [by.home.oldOpacity>.99&&by.home.angleOpacity<.01,'hero fully restored after reverse'],
 ];
 const failed=tests.filter(t=>!t[0]); for(const [ok,msg] of tests)console.log(ok?'PASS':'FAIL',msg);
 console.log('QA_RESULT',failed.length?'FAIL_'+failed.length:'PASS');
 if(failed.length) process.exitCode=1;
}
main().catch(e=>{console.log('QA_ERROR',e.stack||e);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}try{edge.kill()}catch{}setTimeout(()=>process.exit(),100)});
