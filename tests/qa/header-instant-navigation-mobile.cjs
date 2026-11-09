
const cp=require('child_process'),os=require('os'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=10712;
const edge=cp.spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',['--headless','--disable-gpu','--disable-extensions','--no-sandbox','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+path.join(os.tmpdir(),'ab-card-preview-'+Date.now()),'--window-size=1600,900','http://localhost:5173/'],{stdio:'ignore'});
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
const exists=await ev("!!document.querySelector('#secao-preta-final')");
if(!exists)throw Error("New black chapter missing from document");
const probe=()=>ev("(()=>{const white=document.getElementById('secao-branca'),black=document.getElementById('secao-preta-final'),faq=document.getElementById('perguntas'),header=document.querySelector('.brand-header'),menu=header.querySelector('.nav-dropdown-menu');return{scroll:scrollY,hash:location.hash,vw:innerWidth,docWidth:document.documentElement.scrollWidth,whiteTop:white.getBoundingClientRect().top,blackTop:black.getBoundingClientRect().top,faqTop:faq.getBoundingClientRect().top,feature:white.dataset.feature,menuOpen:!!menu,menuAria:header.querySelector('.nav-dropdown-toggle').getAttribute('aria-expanded'),anchors:['home','secao-branca','agendamentos','financas','secao-preta-final','perguntas'].every(id=>!!document.getElementById(id)),logo:header.querySelector('a.brand')?.getAttribute('href'),links:[...header.querySelectorAll('a[href^=\"#\"]')].map(a=>a.getAttribute('href'))}})()");
const checks=[];
function check(name,ok){checks.push([name,ok]);console.log((ok?'PASS ':'FAIL ')+name)}
await ev("window.scrollTo({top:0,behavior:'instant'});true");await sleep(250);
let v=await probe();check('All navigation anchor targets exist',v.anchors);check('Brand logo links to home',v.logo==='#home');check('No horizontal overflow',v.docWidth<=v.vw+4);
await ev("document.querySelector('.nav-dropdown-toggle').click();true");await sleep(100);v=await probe();check('Chevron opens the feature menu',v.menuOpen&&v.menuAria==='true');
await ev("document.querySelector('.nav-dropdown-menu a[href=\"#financas\"]').click();true");await sleep(45);v=await probe();console.log('STAGE FINANCE',JSON.stringify(v));check('Finance menu selects Financeiro',v.feature==='financeiro');check('Finance menu reaches white section',v.hash==='#financas'&&v.whiteTop<0&&v.whiteTop>-220);check('Dropdown closes on selection',!v.menuOpen);
await ev("document.querySelector('.nav-dropdown-toggle').click();true");await sleep(75);
await ev("document.querySelector('.nav-dropdown-menu a[href=\"#agendamentos\"]').click();true");await sleep(45);v=await probe();console.log('STAGE APPOINT',JSON.stringify(v));check('Agendamento menu selects scheduling',v.feature==='agendamento'&&v.hash==='#agendamentos');
await ev("document.querySelector('.nav-link[href=\"#secao-preta-final\"]').click();true");await sleep(45);v=await probe();console.log('STAGE SOLUTIONS',JSON.stringify(v));check('Solucoes leads to correct chapter',v.hash==='#secao-preta-final'&&Math.abs(v.blackTop)<15);
await ev("document.querySelector('.nav-link[href=\"#perguntas\"]').click();true");await sleep(45);v=await probe();console.log('STAGE FAQ',JSON.stringify(v));check('Perguntas leads to FAQ',v.hash==='#perguntas'&&Math.abs(v.faqTop)<15);
await ev("document.querySelector('.brand-header .brand').click();true");await sleep(45);v=await probe();console.log('STAGE LOGO',JSON.stringify(v));check('Clicking the logo returns to top',v.hash==='#home'&&v.scroll<15);
await ev("document.querySelector('.nav-link[href=\"#secao-branca\"]').click();true");await sleep(45);v=await probe();console.log('STAGE FEATURES',JSON.stringify(v));check('Clicking Funcionalidades opens feature section',v.hash==='#secao-branca'&&v.whiteTop<0&&v.whiteTop>-220);
await ev("document.querySelector('.nav-home').click();true");await sleep(45);v=await probe();check('Home link returns to top',v.hash==='#home'&&v.scroll<15);
await ev("document.querySelector('.nav-dropdown-toggle').click();true");await sleep(90);
await ev("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));true");await sleep(80);v=await probe();check('Escape closes dropdown',!v.menuOpen);
console.log('INSTANT_NAVIGATION_TEST_DURATION_45MS');console.log('RESULT',checks.filter(x=>x[1]).length+'/'+checks.length);if(checks.some(x=>!x[1]))process.exitCode=1;
}
main().catch(e=>{console.log('CARD_PREVIEW_ERR',e.message);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}try{edge.kill()}catch{}setTimeout(()=>process.exit(),150)});
