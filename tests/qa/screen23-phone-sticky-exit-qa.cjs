
const cp=require('child_process'),os=require('os'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=10011;
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
const probe=()=>ev("(()=>{const white=document.getElementById('secao-branca'),sticky=white.querySelector('.white-feature-sticky'),angle=document.querySelector('.diagonal-phone-angled-frame'),upper=document.querySelector('.diagonal-float-card--upper'),lower=document.querySelector('.diagonal-float-card--lower'),whiteBox=white.getBoundingClientRect(),rect=e=>{const b=e.getBoundingClientRect();return{x:+b.x.toFixed(2),y:+b.y.toFixed(2),w:+b.width.toFixed(2),h:+b.height.toFixed(2)}};return{whiteAbs:whiteBox.top+scrollY,whiteHeight:whiteBox.height,vh:innerHeight,stickyY:+sticky.getBoundingClientRect().top.toFixed(2),phone:rect(angle),upper:rect(upper),lower:rect(lower),burst:+angle.style.getPropertyValue('--angled-cards-burst'),opacity:+getComputedStyle(angle).opacity}})()");
const stages={};async function get(k){stages[k]=await probe();console.log("STAGE",k,JSON.stringify(stages[k]));return stages[k]}
const init=await probe(),startWhite=init.whiteAbs,runway=Math.max(init.vh*.85,620);
async function scroll(pos){await ev('scrollTo({top:'+Math.round(pos)+',behavior:"instant"});true');await sleep(850)}
await scroll(startWhite+runway*.18);await get("pinnedA");
await scroll(startWhite+runway*.76);await get("pinnedB");
await scroll(startWhite+runway+init.vh*.25);await get("releaseA");
await scroll(startWhite+runway+init.vh*.50);await get("releaseB");
await scroll(startWhite+runway*.18);await get("returnA");
const v=stages,err=(a,b)=>Math.abs(a-b),near=(a,b)=>err(a,b)<3,shift=(a,b)=>a.y-b.y,checks=[
["White section pins the phone",near(v.pinnedA.phone.y,v.pinnedB.phone.y)&&near(v.pinnedA.stickyY,v.pinnedB.stickyY)],
["Reference card zoom stays fixed",near(v.pinnedA.burst,.45)&&near(v.pinnedB.burst,.45)],
["Sticky text begins releasing upward",v.releaseA.stickyY<v.pinnedA.stickyY-30],
["Phone releases UP together with text",v.releaseA.phone.y<v.pinnedA.phone.y-30&&near(shift(v.releaseA.phone,v.pinnedA.phone),v.releaseA.stickyY-v.pinnedA.stickyY)],
["Phone and text continue exiting together",v.releaseB.phone.y<v.releaseA.phone.y-50&&near(shift(v.releaseB.phone,v.pinnedA.phone),v.releaseB.stickyY-v.pinnedA.stickyY)],
["Cards follow without changing size",near(v.pinnedA.upper.w,v.releaseB.upper.w)&&near(v.pinnedA.lower.w,v.releaseB.lower.w)&&near(shift(v.releaseB.upper,v.pinnedA.upper),shift(v.releaseB.phone,v.pinnedA.phone))],
["Reverse scroll restores locked layout",near(v.returnA.phone.y,v.pinnedA.phone.y)&&near(v.returnA.upper.y,v.pinnedA.upper.y)]
];for(const [label,ok] of checks)console.log((ok?"PASS ":"FAIL ")+label);
console.log("RESULT",checks.filter(x=>x[1]).length+"/"+checks.length);if(checks.some(x=>!x[1]))process.exitCode=1;
}
main().catch(e=>{console.log('CARD_PREVIEW_ERR',e.message);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}try{edge.kill()}catch{}setTimeout(()=>process.exit(),150)});
