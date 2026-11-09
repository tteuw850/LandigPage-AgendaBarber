
const cp=require('child_process'),os=require('os'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=9991;
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
const probe=()=>ev("(()=>{const white=document.getElementById('secao-branca'),section=white.getBoundingClientRect(),angled=document.querySelector('.diagonal-phone-angled-frame'),up=document.querySelector('.diagonal-float-card--upper').getBoundingClientRect(),lo=document.querySelector('.diagonal-float-card--lower').getBoundingClientRect(),fi=document.querySelector('.diagonal-finance-popup').getBoundingClientRect(),show=e=>({x:+e.x.toFixed(2),y:+e.y.toFixed(2),width:+e.width.toFixed(2),height:+e.height.toFixed(2)});return{whiteAbs:section.top+scrollY,whiteHeight:section.height,vh:innerHeight,top:section.top,phone:show(angled.getBoundingClientRect()),upper:show(up),lower:show(lo),finance:show(fi),burst:+angled.style.getPropertyValue('--angled-cards-burst'),financeExpand:+angled.style.getPropertyValue('--finance-popup-expand'),tab:white.dataset.feature,cardsOpacity:+angled.style.getPropertyValue('--angled-cards-opacity')}})()");
const values={};async function sample(k){values[k]=await probe();console.log("STAGE",k,JSON.stringify(values[k]));}
const init=await probe(),whiteY=init.whiteAbs,range=Math.max(init.vh*.85,620);
async function go(pos,wait=1100){await ev('scrollTo({top:'+Math.round(pos)+',behavior:"instant"});true');await sleep(wait);}
await go(whiteY+10);await sample("a");
const shot=await send("Page.captureScreenshot",{format:"jpeg",quality:12,fromSurface:true});console.log("SCREENSHOT_BASE64:"+shot.data);
await go(whiteY+range*.40);await sample("b");
await go(whiteY+range*.75);await sample("c");
await ev("document.querySelector('.white-feature-tabs button:nth-child(2)').click();true");await sleep(1550);await sample("financeA");
await go(whiteY+range*.15);await sample("financeB");
await go(whiteY+range*.75);await sample("financeC");
const x=values,dist=(p,q)=>Math.max(Math.abs(p.x-q.x),Math.abs(p.y-q.y),Math.abs(p.width-q.width),Math.abs(p.height-q.height));
const checks=[
["Cards at final reference zoom",Math.abs(x.a.burst-.45)<.015],
["Cards size unchanged after 40% scroll",dist(x.a.upper,x.b.upper)<2&&dist(x.a.lower,x.b.lower)<2],
["Cards size unchanged after 75% scroll",dist(x.a.upper,x.c.upper)<2&&dist(x.a.lower,x.c.lower)<2],
["Phone remains docked across white section",dist(x.a.phone,x.b.phone)<2&&dist(x.b.phone,x.c.phone)<2],
["Scheduling cards visible at final stage",x.a.cardsOpacity>.98],
["Finance panel settles at fixed size",x.financeA.tab==="financeiro"&&x.financeA.financeExpand>.98],
["Finance panel stays still when scrolling up",dist(x.financeA.finance,x.financeB.finance)<2],
["Finance panel stays still when scrolling down",dist(x.financeA.finance,x.financeC.finance)<2]
];checks.forEach(([label,ok])=>console.log(ok?"PASS "+label:"FAIL "+label));
console.log("RESULT",checks.filter(z=>z[1]).length+"/"+checks.length);if(checks.some(z=>!z[1]))process.exitCode=1;
}
main().catch(e=>{console.log('CARD_PREVIEW_ERR',e.message);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}try{edge.kill()}catch{}setTimeout(()=>process.exit(),150)});
