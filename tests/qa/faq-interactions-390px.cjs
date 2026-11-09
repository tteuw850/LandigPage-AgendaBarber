
const cp=require('child_process'),os=require('os'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=10433;
const edge=cp.spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',['--headless','--disable-gpu','--disable-extensions','--no-sandbox','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+path.join(os.tmpdir(),'ab-card-preview-'+Date.now()),'--window-size=430,900','http://localhost:5173/'],{stdio:'ignore'});
let ws,id=1;const cb=new Map();
async function main(){
let url;for(let i=0;i<50;i++){try{let p=await fetch('http://localhost:'+port+'/json').then(r=>r.json());url=p.find(x=>x.type==='page'&&x.url.includes('5173'))?.webSocketDebuggerUrl;if(url)break}catch{}await sleep(200)}
if(!url)throw Error('Edge unavailable');
ws=new WebSocket(url);ws.onmessage=e=>{let a=JSON.parse(e.data);if(cb.has(a.id)){cb.get(a.id)(a);cb.delete(a.id)}};
await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
const send=(method,params={})=>new Promise((r,j)=>{const n=id++;cb.set(n,x=>x.error?j(Error(x.error.message)):r(x.result));ws.send(JSON.stringify({id:n,method,params}))});
const ev=async code=>(await send('Runtime.evaluate',{expression:code,returnByValue:true})).result.value;
await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await sleep(1650);
await sleep(950);
let exists=false;for(let i=0;i<25&&!exists;i++){try{exists=!!(await ev("!!document.querySelector('#perguntas')"))}catch{}if(!exists)await sleep(250)}
if(!exists)throw Error("FAQ not loaded after retry");
const probe=()=>ev("(()=>{const f=document.querySelector('#perguntas'),b=document.querySelector('#secao-preta-final'),l=f.querySelector('.faq-intro').getBoundingClientRect(),r=f.querySelector('.faq-accordion').getBoundingClientRect(),fr=f.getBoundingClientRect(),br=b.getBoundingClientRect(),buttons=[...f.querySelectorAll('.faq-trigger')],answers=[...f.querySelectorAll('.faq-answer-grid')];return{faqTop:fr.top+scrollY,blackEnd:br.bottom+scrollY,viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,background:getComputedStyle(f).backgroundImage,sectionHeight:fr.height,questions:buttons.length,expanded:buttons.map(e=>e.getAttribute('aria-expanded')),buttons:buttons.map(e=>e.textContent.trim()),answerHeights:answers.map(e=>Math.round(e.getBoundingClientRect().height)),left:{x:l.x,y:l.y,right:l.right,bottom:l.bottom},right:{x:r.x,y:r.y,right:r.right},nav:document.querySelector('a[href=\"#perguntas\"]')?.getAttribute('href'),cta:f.querySelector('.faq-link')?.getAttribute('href')}})()");
const start=await probe();
await ev("document.getElementById('perguntas').scrollIntoView({block:'start',behavior:'instant'});true");
await sleep(500);
const initial=await probe();console.log("STAGE initial",JSON.stringify(initial));
await ev("document.querySelectorAll('.faq-trigger')[1].click();true");
await sleep(130);const anim=await probe();console.log("STAGE mid",JSON.stringify(anim));
await sleep(620);const second=await probe();console.log("STAGE second",JSON.stringify(second));
const shot=await send("Page.captureScreenshot",{format:"jpeg",quality:20,fromSurface:true});console.log("SCREENSHOT_BASE64:"+shot.data);
await ev("document.querySelectorAll('.faq-trigger')[1].click();true");
await sleep(650);const closed=await probe();console.log("STAGE closed",JSON.stringify(closed));
await ev("document.querySelectorAll('.faq-trigger')[7].click();true");
await sleep(600);const last=await probe();console.log("STAGE last",JSON.stringify(last));
const all=[start,initial,anim,second,closed,last];
const tests=[
["FAQ immediately after black chapter",Math.abs(initial.faqTop-initial.blackEnd)<3],
["Eight questions",initial.questions===8],
["Starts with first answer opened",initial.expanded[0]==="true"&&initial.expanded.filter(x=>x==="true").length===1],
["Only second opens on click",second.expanded[1]==="true"&&second.expanded.filter(x=>x==="true").length===1],
["Answer expands smoothly",anim.answerHeights[1]>0&&anim.answerHeights[1]<second.answerHeights[1]],
["Click again closes the question",closed.expanded.every(x=>x==="false")&&closed.answerHeights.every(x=>x===0)],
["Last question can be opened",last.expanded[7]==="true"&&last.expanded.filter(x=>x==="true").length===1],
["Navbar FAQ link points to new section",initial.nav==="#perguntas"],
["CTA scrolls to existing features",initial.cta==="#secao-branca"],
["Topo line artwork loads",initial.background.includes("faq-contours.svg")],
["FAQ has no sideways overflow",all.every(x=>x.documentWidth<=x.viewport+4)],
["Responsive column order",(initial.viewport>800?initial.left.right<initial.right.x:initial.left.bottom<initial.right.y)]
];for(const [name,ok] of tests)console.log((ok?"PASS ":"FAIL ")+name);
console.log("RESULT",tests.filter(x=>x[1]).length+"/"+tests.length);if(tests.some(x=>!x[1]))process.exitCode=1;
}
main().catch(e=>{console.log('CARD_PREVIEW_ERR',e.message);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}try{edge.kill()}catch{}setTimeout(()=>process.exit(),150)});
