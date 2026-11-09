
const cp=require('child_process'),os=require('os'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=10631;
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
const probe=()=>ev("(()=>{const f=document.querySelector('.site-footer'),faq=document.getElementById('perguntas'),r=f.getBoundingClientRect(),q=faq.getBoundingClientRect(),links=[...f.querySelectorAll('a')].map(a=>({href:a.getAttribute('href'),download:a.getAttribute('download'),target:a.getAttribute('target'),rel:a.getAttribute('rel')})),headline=f.querySelector('.site-footer-headline').getBoundingClientRect(),actions=f.querySelector('.site-footer-actions').getBoundingClientRect(),cols=[...f.querySelector('.site-footer-columns').children].map(n=>{const a=n.getBoundingClientRect();return{x:a.x,y:a.y,w:a.width,h:a.height}}),logo=f.querySelector('.site-footer-brand img');return{vw:innerWidth,vh:innerHeight,pageWidth:document.documentElement.scrollWidth,pageHeight:document.documentElement.scrollHeight,faqBottom:q.bottom+scrollY,footerTop:r.top+scrollY,footerBottom:r.bottom+scrollY,footerHeight:r.height,bg:getComputedStyle(f).backgroundColor,heading:f.querySelector('h2')?.textContent.trim(),logo:logo.complete&&logo.naturalWidth>0,links,headline:{x:headline.x,y:headline.y,right:headline.right,bottom:headline.bottom},actions:{x:actions.x,y:actions.y,right:actions.right,bottom:actions.bottom},columns:cols,copyright:f.querySelector('.site-footer-bottom')?.textContent.trim()}})()");
await ev("document.querySelector('.site-footer').scrollIntoView({block:'start',behavior:'instant'});true");
await sleep(550);
const x=await probe();console.log("STAGE footer",JSON.stringify(x));
const shot=await send("Page.captureScreenshot",{format:"jpeg",quality:24,fromSurface:true});console.log("SCREENSHOT_BASE64:"+shot.data);
const expected="https://wa.me/5511946464236?text=Ol%C3%A1%2C%20gostaria%20de%20adquirir%20uma%20conta%20no%20Agenda%20Barber.";
const links=x.links;
const internal=links.filter(a=>a.href?.startsWith("#")).map(a=>a.href.slice(1));
const anchors=await ev("([...document.querySelectorAll(\'.site-footer a\')].filter(a=>a.getAttribute(\'href\')?.startsWith(\'#\')).every(a=>document.getElementById(a.getAttribute(\'href\').slice(1))))");
const checks=[
["Footer follows FAQ",Math.abs(x.footerTop-x.faqBottom)<2],
["Footer occupies full width without overflow",x.pageWidth<=x.vw+3],
["Footer is final page section",Math.abs(x.footerBottom-x.pageHeight)<3],
["Footer brand logo loads",x.logo],
["Brand heading is present",x.heading.includes("Sua barbearia")],
["APK download appears in footer twice",links.filter(a=>a.download==="Agenda-Barber-1.0.0.apk"&&a.href==="/downloads/Agenda-Barber-1.0.0.apk").length===2],
["WhatsApp CTA uses approved message",links.filter(a=>a.href===expected&&a.target==="_blank"&&a.rel?.includes("noopener")).length===2],
["Footer internal anchors resolve",anchors===true],
["Footer includes legal year",x.copyright.includes("Agenda Barber. Todos os direitos reservados.")],
["Footer uses dark background",x.bg==="rgb(11, 11, 12)"],
["Footer actions align",(x.vw>1120?x.actions.x>x.headline.x:x.actions.y>x.headline.y)],
["Footer columns fit",x.columns.length===3&&x.columns.every(c=>c.x>=-2&&c.x+c.w<=x.vw+2)]
];for(const [label,ok] of checks)console.log((ok?"PASS ":"FAIL ")+label);
console.log("RESULT",checks.filter(x=>x[1]).length+"/"+checks.length);if(checks.some(x=>!x[1]))process.exitCode=1;
}
main().catch(e=>{console.log('CARD_PREVIEW_ERR',e.message);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}try{edge.kill()}catch{}setTimeout(()=>process.exit(),150)});
