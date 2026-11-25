import {buildModel,createRenderer} from './models.js';

const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const easeOut=t=>1-(1-t)**3;
const defaultYaw={software:-.34,aero:-.98};
const defaultPitch={software:.27,aero:.53};

// Use the homepage itself for the display. Its own model uses the still
// screen texture, which stops the scene after one animated nested laptop.
async function mountHomepagePreview(display,mesh) {
  if (document.documentElement.hasAttribute('data-laptop-display')) return;
  const response = await fetch(new URL('./', document.baseURI));
  if (!response.ok) return;
  const page = new DOMParser().parseFromString(await response.text(), 'text/html');
  page.documentElement.dataset.laptopDisplay = '';
  page.documentElement.dataset.theme = 'light';
  page.querySelectorAll('script:not([src="app.js"]), link[as="audio"]').forEach(node => node.remove());
  const base = page.createElement('base');
  base.href = response.url;
  page.head.prepend(base);
  const frame = document.createElement('iframe');
  frame.title = 'Light-mode software portfolio preview';
  frame.tabIndex = -1;
  frame.inert = true;
  frame.srcdoc = '<!doctype html>' + page.documentElement.outerHTML;
  frame.portfolioMesh = mesh;
  display.append(frame);
}

async function prepareMesh() {
  if (document.documentElement.hasAttribute('data-laptop-display') && window.frameElement?.portfolioMesh) {
    return window.frameElement.portfolioMesh;
  }
  let worker;
  try {
    worker = new Worker(new URL('./model-worker.js', import.meta.url), {type:'module'});
    return await new Promise((resolve,reject) => {
      worker.onmessage = event => resolve(event.data);
      worker.onerror = reject;
    });
  } catch {
    return buildModel();
  } finally {
    worker?.terminate();
  }
}

export async function setupStudio(reducedMotion){
  const mesh = await prepareMesh();
  const stage=document.querySelector('#model-template').content.firstElementChild.cloneNode(true);
  let profile='software';
  const slot=key=>document.querySelector('#'+key+'-model');
  slot(profile).append(stage);
  const screen=document.querySelector('#suit-screen');
  const {canvas,draw,softwareMode}=createRenderer(stage.querySelector('canvas'),mesh);
  if(!draw){
    stage.remove();
    return {switchTo(){}};
  }
  let yaw=defaultYaw.software,pitch=defaultPitch.software,frame=0,take=null,drag=null,flight=null;
  const preview=stage.querySelector('.laptop-preview');
  const displayMask=document.createElement('div');
  displayMask.className='display-occlusion';
  preview.replaceWith(displayMask);
  displayMask.append(preview);
  const intro = document.querySelector('#brand-intro');
  const mountPreview = () => mountHomepagePreview(preview,mesh).catch(() => {});
  if (intro.open) intro.addEventListener('close',mountPreview,{once:true});
  else mountPreview();
  // Project the display plane with the same perspective and camera as the mesh.
  function positionPreview(){
    if(take || profile!=='software'){
      if(!preview.hidden)preview.hidden=true;
      return;
    }
    const w=canvas.clientWidth,h=canvas.clientHeight,r=Math.min(h*.46,w*.301);
    function project(x,y,z){
      const rx=Math.cos(yaw)*x+Math.sin(yaw)*z,rz=-Math.sin(yaw)*x+Math.cos(yaw)*z;
      const ry=Math.cos(pitch)*y-Math.sin(pitch)*rz;
      const depth=1-.115*(Math.sin(pitch)*y+Math.cos(pitch)*rz);
      return [w*.5*depth+r*rx,h*.5*depth-r*ry,0,depth];
    }
    function corner(x,t){return project(x,-.53+t*1.41,-.58-.24*t+.012);}
    const origin=corner(-1.078,.952),right=corner(1.078,.952),bottom=corner(-1.078,.055);
    // Cull the back face using the projected lid, including its tilt and perspective.
    const [a,b,c]=[origin,right,bottom].map(([x,y,,w])=>[x/w,y/w]);
    const facing=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
    if(preview.hidden !== (facing<=0)) preview.hidden=facing<=0;
    if(preview.hidden)return;
    // The live HTML display sits above the GPU canvas. Cut the base silhouette
    // out of that layer when the camera looks up past the keyboard deck.
    if(Math.sin(pitch)/.115 < -.505){
      const points=[];
      for(const z of [-.63,.79]){
        for(let i=0;i<32;i++){
          const angle=i*Math.PI/16;
          const rounded=v=>Math.sign(v)*Math.abs(v)**.17;
          const q=project(1.13*.965*rounded(Math.cos(angle)),-.566+.061*rounded(Math.sin(angle)),z);
          points.push([q[0]/q[3],q[1]/q[3]]);
        }
      }
      // Include the full-width portion just inside each tapered end.
      for(const z of [-.559,.719])for(const x of [-1.13,1.13])for(const y of [-.625,-.507]){
        const q=project(x,y,z);points.push([q[0]/q[3],q[1]/q[3]]);
      }
      points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
      const half=list=>{
        const hull=[];
        for(const p of list){
          while(hull.length>=2){
            const a=hull[hull.length-2],b=hull[hull.length-1];
            if((b[0]-a[0])*(p[1]-a[1])>(b[1]-a[1])*(p[0]-a[0]))break;
            hull.pop();
          }
          hull.push(p);
        }
        hull.pop();return hull;
      };
      const outline=half(points).concat(half(points.reverse()));
      displayMask.style.clipPath='path(evenodd, "M0 0 H'+w+' V'+h+' H0 Z M'+outline.map(p=>p.join(' ')).join(' L')+' Z")';
    }else if(displayMask.style.clipPath)displayMask.style.clipPath='';
    const axis=(end,length)=>end.map((n,i)=>(n-origin[i])/length);
    preview.style.transform='matrix3d('+[...axis(right,480),...axis(bottom,280),0,0,1,0,...origin].join(',')+')';
  }
  const duration=1450;
  let visibleMorph=0,visibleYaw=yaw,visiblePitch=pitch;
  // The nested preview is a same-origin srcdoc. Both renderers share the portal state.
  const portalDocument=document.documentElement.hasAttribute('data-laptop-display') && window.frameElement
    ? window.parent.document : document;
  const portalBusy=()=>portalDocument.documentElement.classList.contains('mobile-software-portal');
  const schedule=()=>{if(!frame&&!document.hidden&&!portalBusy())frame=requestAnimationFrame(render);};
  function sizeCanvas(){
    const nested=document.documentElement.hasAttribute('data-laptop-display');
    const dpr=nested ? .55 : softwareMode ? Math.min(devicePixelRatio||1,1.2,520/Math.max(1,canvas.clientWidth,canvas.clientHeight)) : Math.min(devicePixelRatio||1,1.65);
    const width=Math.round(canvas.clientWidth*dpr),height=Math.round(canvas.clientHeight*dpr);
    if(width&&height&&(width!==canvas.width||height!==canvas.height)){canvas.width=width;canvas.height=height;}
  }
  function finish(){
    if(!take)return;
    take=null;
    flight?.cancel();flight=null;
    screen.getAnimations({subtree:true}).forEach(animation=>animation.cancel());
    stage.insertBefore(canvas,displayMask);
    canvas.removeAttribute('style');screen.hidden=true;
    sizeCanvas();
  }
  let inView=true, lastTurn=0, returnPose=null;
  function alignModel(){
    lastTurn=0;
    const angle=defaultYaw[profile]-yaw;
    returnPose={yaw,pitch,arc:Math.atan2(Math.sin(angle),Math.cos(angle)),start:performance.now()};
    schedule();
  }
  const portalLifetime=new AbortController();
  window.addEventListener('pagehide',event=>{
    if(!event.persisted)portalLifetime.abort();
  });
  portalDocument.addEventListener('portfolio-portal-state',()=>{
    lastTurn=0;
    if(portalBusy()){cancelAnimationFrame(frame);frame=0;}
    else schedule();
  },{signal:portalLifetime.signal});
  function render(now){
    frame=0;
    if(document.hidden)return;
    if(intro.open && intro.getAnimations().some(a=>a.animationName==='intro-exit' && a.currentTime<7100))return;
    const aligning=Boolean(returnPose);
    if(returnPose){
      const t=reducedMotion.matches?1:clamp((now-returnPose.start)/180,0,1);
      const eased=easeOut(t);
      yaw=returnPose.yaw+returnPose.arc*eased;
      pitch=returnPose.pitch+(defaultPitch[profile]-returnPose.pitch)*eased;
      if(t===1){yaw=defaultYaw[profile];pitch=defaultPitch[profile];returnPose=null;}
    }
    const autoTurn=inView&&!reducedMotion.matches&&!drag&&!take&&!aligning;
    if(autoTurn&&lastTurn){
      const elapsed=now-lastTurn;
      if(elapsed<(softwareMode?65:30)){schedule();return;}
      yaw+=Math.min(elapsed,120)*Math.PI*2/30000;
    }
    lastTurn=autoTurn?now:0;
    sizeCanvas();
    const endpoint=profile==='aero'?1:0;
    let zoom=1;
    visibleMorph=endpoint;visibleYaw=yaw;visiblePitch=pitch;
    if(take){
      const t=clamp((now-take.start)/duration,0,1);
      const travel=easeOut(clamp((t-.05)/.85,0,1));
      const morph=clamp((t-.10)/.68,0,1);
      visibleMorph=take.fromMorph+(endpoint-take.fromMorph)*morph;
      const arc=Math.atan2(Math.sin(yaw-take.fromYaw),Math.cos(yaw-take.fromYaw));
      visibleYaw=take.fromYaw+arc*travel;
      visiblePitch=take.fromPitch+(pitch-take.fromPitch)*travel+.12*Math.sin(Math.PI*travel);
      zoom=1-.08*Math.sin(Math.PI*t);
      if(t>=1)finish();
    }
    draw(visibleMorph,visibleYaw,visiblePitch,zoom,reducedMotion.matches?0:now*.013);
    positionPreview();
    if(returnPose||take||(inView&&(!drag||profile==="aero")&&!reducedMotion.matches))schedule();
  }
  function stop(){
    finish();
    schedule();
  }
  function cinematic(origin){
    const rect=canvas.getBoundingClientRect();
    if(rect.width<1||rect.height<1||!canvas.animate)return;
    const header=document.querySelector('.mast').getBoundingClientRect().bottom;
    const midY=(innerHeight+header)/2;
    const dx=innerWidth/2-rect.left-rect.width/2,dy=midY-rect.top-rect.height/2;
    const magnify=clamp(Math.min((innerHeight-header)*.81/rect.height,innerWidth*.83/rect.width),1,1.8);
    screen.style.setProperty('--header-height',header+'px');screen.hidden=false;
    Object.assign(canvas.style,{position:'fixed',left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',pointerEvents:'none'});
    screen.append(canvas);
    const center='translate('+dx+'px,'+dy+'px) scale('+magnify+')';
    const destination='translate(0,0) scale(1)';
    let start=center;
    if(origin?.width && origin.bottom>header && origin.top<innerHeight){
      const x=origin.left+origin.width/2-rect.left-rect.width/2;
      const y=origin.top+origin.height/2-rect.top-rect.height/2;
      const scale=Math.min(origin.width,origin.height)/Math.min(rect.width,rect.height);
      start='translate('+x+'px,'+y+'px) scale('+scale+')';
    }
    flight=canvas.animate([{transform:start},{transform:center,offset:.22},{transform:center,offset:.64},{transform:destination}],{duration,easing:'cubic-bezier(.32,.02,.22,1)',fill:'both'});
    screen.querySelector('.atmosphere').animate([{opacity:0},{opacity:1,offset:.095},{opacity:1,offset:.70},{opacity:0}],{duration,fill:'both'});
    screen.querySelector('.morph-wave').animate([
      {transform:'translate(-50%,-50%) scale(.40)',opacity:0},
      {opacity:.88,offset:.34},
      {transform:'translate(-50%,-50%) scale(1.65)',opacity:0}
    ],{duration:720,delay:280,easing:'ease-out',fill:'both'});
    for(const shutter of screen.querySelectorAll('.shutter')){
      const out=shutter.classList.contains('shutter-top')?'-104%':'104%';
      shutter.animate([{transform:'translateY('+out+')'},{transform:'translateY(0)',offset:.16},{transform:'translateY(0)',offset:.60},{transform:'translateY('+out+')'}],{duration,easing:'ease-in-out',fill:'both'});
    }
    take={start:performance.now(),fromMorph:visibleMorph,fromYaw:visibleYaw,fromPitch:visiblePitch};
  }
  function switchTo(key,play,origin){
    finish();
    returnPose=null;
    profile=key;yaw=defaultYaw[key];pitch=defaultPitch[key];drag=null;
    slot(key).append(stage);
    canvas.setAttribute('aria-label',key==='aero'?'Rotatable 3D aeroplane':'Rotatable 3D laptop');
    if(play&&!reducedMotion.matches&&!document.hidden)cinematic(origin);
    schedule();
  }
  for(const button of stage.querySelectorAll('button')){
    button.addEventListener('click',()=>{finish();yaw+=Number(button.dataset.turn)*Math.PI/8;alignModel();});
  }
  canvas.addEventListener('pointerdown',event=>{
    if(take||!event.isPrimary||event.button!==0)return;
    returnPose=null;
    drag={moved:false,id:event.pointerId,x:event.clientX,y:event.clientY,yaw,pitch};
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove',event=>{
    if(!drag||drag.id!==event.pointerId)return;
    drag.moved ||= event.clientX!==drag.x || event.clientY!==drag.y;
    yaw=drag.yaw+(event.clientX-drag.x)*.014;
    pitch=clamp(drag.pitch+(event.clientY-drag.y)*.009,-.56,.56);schedule();
  });
  function endDrag(event){
    if(!drag || drag.id!==event.pointerId)return;
    const moved=drag.moved;
    drag=null;lastTurn=0;
    if(moved)alignModel();
    else schedule();
  }
  for(const type of ['pointerup','pointercancel','lostpointercapture']){
    canvas.addEventListener(type,endDrag);
  }
  if('IntersectionObserver' in window){
    new IntersectionObserver(([entry])=>{
      inView=entry.isIntersecting;
      lastTurn=0;
      if(inView)schedule();
    }).observe(stage);
  }
  new ResizeObserver(schedule).observe(stage);
  reducedMotion.addEventListener('change',stop);
  window.addEventListener('resize',stop,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){lastTurn=0;finish();cancelAnimationFrame(frame);frame=0;}else schedule();});
  // The navbar and all CV controls stay interactive throughout a take.
  for(const event of ['wheel','touchstart','keydown']){
    document.addEventListener(event,e=>{if(take&&!e.target.closest?.('[role="tablist"]'))stop();},{passive:true});
  }
  document.addEventListener('click',event=>{
    if(take&&!event.target.closest('[role="tablist"]'))stop();
  },true);
  canvas.setAttribute('aria-label','Rotatable 3D laptop');
  // Draw the first model frame as the opaque portion of the intro ends.
  let resumeTimer;
  const resumeAtFade = () => {
    clearTimeout(resumeTimer);
    const animation=intro.getAnimations().find(a=>a.animationName==='intro-exit');
    if(animation)resumeTimer=setTimeout(schedule,Math.max(0,7120-(animation.currentTime||0)));
  };
  intro.addEventListener('animationstart',e=>{if(e.animationName==='intro-exit')resumeAtFade();});
  intro.addEventListener('close',()=>{clearTimeout(resumeTimer);schedule();});
  if(intro.open)resumeAtFade();
  schedule();
  return {switchTo};
}
