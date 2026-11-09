const cp = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const src = path.join(__dirname, '..', '..', 'src', 'assets', 'videos', 'gemini_generated_video_b21d0eb6.mp4');
const dst = path.join(__dirname, '..', '..', 'src', 'assets', 'videos', 'gemini_new_phone_alpha.webm');
const W = 340, H = 680, FPS = 12, rgbBytes = W*H*3;
const decoder = cp.spawn('ffmpeg', ['-hide_banner','-loglevel','error','-i',src,'-vf',`fps=${FPS},crop=${W}:${H}:475:20`,'-an','-pix_fmt','rgb24','-f','rawvideo','pipe:1']);
const encoder = cp.spawn('ffmpeg', ['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgba','-video_size',`${W}x${H}`,'-framerate',String(FPS),'-i','pipe:0','-an','-c:v','libvpx-vp9','-deadline','realtime','-cpu-used','8','-threads','4','-pix_fmt','yuva420p','-b:v','0','-crf','34','-g','3','-auto-alt-ref','0',dst]);
let pending = Buffer.alloc(0), frames=0, decodeError='', encodeError='';
decoder.stderr.on('data', c=>decodeError+=String(c));
encoder.stderr.on('data', c=>encodeError+=String(c));
decoder.on('error', e=>{console.error('DECODER',e.message);process.exitCode=1});
encoder.on('error', e=>{console.error('ENCODER',e.message);process.exitCode=1});
const toRGBA=(src)=>{
 const lows=new Int16Array(H).fill(-1);
 const highs=new Int16Array(H).fill(-1);
 const out=Buffer.alloc(W*H*4);
 for(let y=0;y<H;y++){
  const row=y*W*3;
  const li=row+4*3, ri=row+(W-5)*3;
  const lr=src[li],lg=src[li+1],lb=src[li+2];
  const rr=src[ri],rg=src[ri+1],rb=src[ri+2];
  let low=W,high=-1;
  for(let x=8;x<W-8;x++){
   const f=x/(W-1),i=row+x*3;
   const er=lr+(rr-lr)*f,eg=lg+(rg-lg)*f,eb=lb+(rb-lb)*f;
   if(Math.max(Math.abs(src[i]-er),Math.abs(src[i+1]-eg),Math.abs(src[i+2]-eb))>18){
    if(x<low)low=x;
    if(x>high)high=x;
   }
  }
  if(high-low>=4){lows[y]=low;highs[y]=high}
 }
 for(let y=0;y<H;y++){
  const ls=[],rs=[];
  for(let yy=Math.max(0,y-5);yy<=Math.min(H-1,y+5);yy++){
   if(lows[yy]>=0){ls.push(lows[yy]);rs.push(highs[yy])}
  }
  if(ls.length===0)continue;
  ls.sort((a,b)=>a-b);rs.sort((a,b)=>a-b);
  const low=ls[Math.floor(ls.length/2)],high=rs[Math.floor(rs.length/2)];
  if(high-low<4)continue;
  for(let x=0;x<W;x++){
   const pos=y*W+x,si=pos*3,di=pos*4;
   out[di]=src[si];out[di+1]=src[si+1];out[di+2]=src[si+2];
   out[di+3]=Math.max(0,Math.min(255,Math.min(x-low+2,high+2-x)*110));
  }
 }
 return out;
};
decoder.stdout.on('data', chunk=>{
 pending=Buffer.concat([pending,chunk]);
 while(pending.length>=rgbBytes){
  const rgb=pending.subarray(0,rgbBytes);
  pending=pending.subarray(rgbBytes);
  encoder.stdin.write(toRGBA(rgb));
  frames++;
 }
});
decoder.stdout.on('end',()=>encoder.stdin.end());
encoder.on('close',code=>{
 const stat=fs.existsSync(dst)?fs.statSync(dst):null;
 console.log('ALPHA_WEBM_RESULT',JSON.stringify({frames,exitCode:code,bytes:stat?.size||0,dst,decodeError,encodeError}));
 if(code!==0||!stat||stat.size<1000)process.exitCode=1;
});
