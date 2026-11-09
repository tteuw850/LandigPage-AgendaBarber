
const cp=require('child_process'),os=require('os'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=10312;
const edge=cp.spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',['--headless','--disable-gpu','--disable-extensions','--no-sandbox','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+path.join(os.tmpdir(),'ab-card-preview-'+Date.now()),'--window-size=430,900','http://localhost:5173/'],{stdio:'ignore'});
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
const probe=()=>ev("(()=>{const w=document.getElementById('secao-branca'),s=document.getElementById('secao-preta-final'),r=s.getBoundingClientRect(),a=[...s.querySelectorAll('.black-chapter-benefit')],im=s.querySelector('.black-chapter-barber'),imRect=im.getBoundingClientRect(),c=s.querySelector('.black-chapter-copy').getBoundingClientRect(),sticky=s.querySelector('.black-chapter-sticky').getBoundingClientRect();return{abs:r.top+scrollY,whiteEnd:w.getBoundingClientRect().bottom+scrollY,height:r.height,whiteHeight:w.getBoundingClientRect().height,vh:innerHeight,vw:innerWidth,background:getComputedStyle(s).backgroundColor,progress:+s.style.getPropertyValue('--black-chapter-progress'),active:a.findIndex(e=>e.dataset.active==='true'),imageLoaded:im.complete&&im.naturalWidth>0,imageX:imRect.x,imageW:imRect.width,copyRight:c.right,copyBottom:c.bottom,stickyY:sticky.y,rows:a.length,docWidth:document.documentElement.scrollWidth}})()");
const samples=[];
const init=await probe(),range=Math.max(1,init.height-init.vh);
for(const fraction of [0.04,0.31,0.56,0.82,0.98,0.23]){
 const pos=Math.round(init.abs+range*fraction);
 await ev('scrollTo({top:'+pos+',behavior:"instant"});true');
 await sleep(400);
 const result=await probe();samples.push(result);console.log("STAGE",fraction,JSON.stringify(result));
 if(fraction===0.56){const screenshot=await send("Page.captureScreenshot",{format:"jpeg",quality:18,fromSurface:true});console.log("SCREENSHOT_BASE64:"+screenshot.data)}
}
const stages=samples,checks=[
["Section immediately follows white",Math.abs(init.abs-init.whiteEnd)<2],
["Section height matches white",Math.abs(init.height-init.whiteHeight)<2],
["Background remains pure black",stages.every(x=>x.background==="rgb(0, 0, 0)")],
["The barber cutout loads",stages.every(x=>x.imageLoaded&&x.imageW>50)],
["The barber stays on right side",stages.every(x=>(x.vw<700 ? x.imageX+x.imageW*.5>x.vw*.65 : x.imageX>x.vw*.44))],
["Four narrative benefits render",stages.every(x=>x.rows===4)],
["Benefits highlight through scroll",stages[0].active===0&&stages[1].active===1&&stages[2].active===2&&stages[3].active===3],
["Progress returns when scrolling up",stages[5].active===0&&stages[5].progress<stages[4].progress],
["Sticky content stays anchored",Math.abs(stages[1].stickyY-stages[3].stickyY)<2],
["No horizontal overflow",stages.every(x=>x.docWidth<=x.vw+4)]
];checks.forEach(([name,ok])=>console.log((ok?"PASS ":"FAIL ")+name));
console.log("RESULT",checks.filter(x=>x[1]).length+"/"+checks.length);if(checks.some(x=>!x[1]))process.exitCode=1;
}
main().catch(e=>{console.log('CARD_PREVIEW_ERR',e.message);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}try{edge.kill()}catch{}setTimeout(()=>process.exit(),150)});
