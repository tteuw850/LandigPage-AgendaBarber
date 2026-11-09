
const cp=require('child_process'),os=require('os'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=9671;
const edge=cp.spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',['--headless','--disable-gpu','--disable-extensions','--no-sandbox','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+path.join(os.tmpdir(),'ab-card-preview-'+Date.now()),'--window-size=1600,900','http://localhost:5173/'],{stdio:'ignore'});
let ws,id=1;const cb=new Map();
async function main(){
let url;for(let i=0;i<50;i++){try{let p=await fetch('http://localhost:'+port+'/json').then(r=>r.json());url=p.find(x=>x.type==='page'&&x.url.includes('5173'))?.webSocketDebuggerUrl;if(url)break}catch{}await sleep(200)}
if(!url)throw Error('Edge unavailable');
ws=new WebSocket(url);ws.onmessage=e=>{let a=JSON.parse(e.data);if(cb.has(a.id)){cb.get(a.id)(a);cb.delete(a.id)}};
await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
const send=(method,params={})=>new Promise((r,j)=>{const n=id++;cb.set(n,x=>x.error?j(Error(x.error.message)):r(x.result));ws.send(JSON.stringify({id:n,method,params}))});
const ev=async code=>(await send('Runtime.evaluate',{expression:code,returnByValue:true})).result.value;
await send('Page.enable');await sleep(650);
const p=await ev("(()=>{const s=document.getElementById('proximo-bloco'),top=s.getBoundingClientRect().top+scrollY,vh=innerHeight;return{y:top+Math.max(vh*1.9,1250)+Math.max(vh*1.15,820)+Math.max(vh*1.45,1100)*.98}})()");
await ev('scrollTo({top:'+Math.round(p.y)+',behavior:"instant"});true');await sleep(350);
const details=await ev("(()=>{const c=[...document.querySelectorAll('.diagonal-float-card')];return c.map(e=>{const img=e.querySelector('img'),r=e.getBoundingClientRect();return{class:e.className,src:img.currentSrc,natural:[img.naturalWidth,img.naturalHeight],box:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],opacity:getComputedStyle(e).opacity,objectFit:getComputedStyle(img).objectFit}})})()");
console.log('CARDS',JSON.stringify(details));
const result=await ev("(()=>{const a=document.querySelector('.diagonal-phone-angled-shell'),f=document.querySelector('.diagonal-phone-angled-frame'),w=document.getElementById('secao-branca'),sc=document.querySelector('.diagonal-phone-angled-screen');const cv=document.createElement('canvas');cv.width=a.naturalWidth;cv.height=a.naturalHeight;const ctx=cv.getContext('2d',{willReadFrequently:true});ctx.drawImage(a,0,0);const d=ctx.getImageData(0,0,cv.width,cv.height).data;let minX=cv.width,minY=cv.height,maxX=0,maxY=0;for(let y=0;y<cv.height;y+=2){for(let x=0;x<cv.width;x+=2){if(d[(y*cv.width+x)*4+3]>80){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y)}}}const r=f.getBoundingClientRect();return{viewport:[innerWidth,innerHeight],natural:[a.naturalWidth,a.naturalHeight],alphaBBox:[minX,minY,maxX,maxY],frame:{x:r.x,y:r.y,width:r.width,height:r.height},whiteTop:w.getBoundingClientRect().top,visualMidY:r.y+r.height*((minY+maxY)/(cv.height*2)),cardOpacity:getComputedStyle(sc).opacity}})()");
console.log('METRICS',JSON.stringify(result));
}
main().catch(e=>{console.log('CARD_PREVIEW_ERR',e.message);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}try{edge.kill()}catch{}setTimeout(()=>process.exit(),150)});
