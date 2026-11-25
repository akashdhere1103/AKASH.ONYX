// One visual pointer per document. Native pointer events always reach the page.
const root = document.documentElement;
const allowed = matchMedia('(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)');
const interactive = 'a[href],button,summary,[role="button"],[role="tab"],canvas,.skill-group,.education-card,.log-entry,.software-records article,.note';
const native = 'input,textarea,select,option,[contenteditable]:not([contenteditable="false"]),iframe,embed,object';
let cleanup;

function mount() {
  const cursor = document.createElement('div');
  cursor.id = 'glass-pointer';
  cursor.setAttribute('popover','manual');
  cursor.setAttribute('aria-hidden','true');
  const lens = document.createElement('i');
  const pulse = document.createElement('b');
  cursor.append(lens,pulse);
  document.body.append(cursor);
  const events = new AbortController();
  const listen = (target,type,fn,capture=false) =>
    target.addEventListener(type,fn,{capture,passive:true,signal:events.signal});
  let x=0,y=0,followX=0,followY=0,frame=0,last=0;
  let tracking=false,visible=false,dirty=false;
  let burst;

  function conceal() {
    delete root.dataset.glassPointer;
    if (visible) cursor.hidePopover();
    visible=false;
    last=0;
    burst?.cancel();
  }
  function stop() {
    tracking=false;
    cancelAnimationFrame(frame);
    frame=0;
    conceal();
  }
  function schedule() {
    if (tracking && !frame) frame=requestAnimationFrame(paint);
  }
  function refresh() {
    dirty=true;
    schedule();
  }
  const intro=document.getElementById("brand-intro");
  function resolveTarget() {
    dirty=false;
    if(intro?.open){conceal();return;}
    const target=document.elementFromPoint(x,y);
    if (!target || target.closest(native)) {
      conceal();
      return;
    }
    const parent=target.closest('dialog[open]') || document.body;
    if (cursor.parentNode!==parent) {
      conceal();
      parent.append(cursor);
    }
    if (!visible || !cursor.matches(':popover-open')) {
      try { cursor.showPopover(); } catch { conceal(); return; }
      visible=true;
      followX=x; followY=y;
      root.dataset.glassPointer='';
    }
    cursor.classList.toggle('over-control',Boolean(target.closest(interactive)));
  }
  function paint(time) {
    frame=0;
    if (dirty) resolveTarget();
    if (!visible) return;
    const amount=1-Math.exp(-Math.min(time-(last||time-16),64)/32);
    last=time;
    followX+=(x-followX)*amount; followY+=(y-followY)*amount;
    const moving=Math.abs(x-followX)+Math.abs(y-followY)>.18;
    if (!moving) { followX=x; followY=y; }
    cursor.style.transform='translate3d('+x+'px,'+y+'px,0)';
    lens.style.transform='translate('+Math.max(-9,Math.min(9,followX-x))+'px,'+Math.max(-9,Math.min(9,followY-y))+'px)';
    if (moving) schedule();
  }
  function move(e) {
    if (e.pointerType!=='mouse') { stop(); return; }
    x=e.clientX; y=e.clientY; tracking=true; refresh();
  }
  listen(document,'pointermove',move,true);
  listen(document,'pointerover',refresh,true);
  listen(document,'pointerout',e=>{if (!e.relatedTarget) stop();},true);
  listen(document,'pointerdown',e=>{
    if(e.pointerType!=='mouse'){stop();return;}
    move(e);
    if(e.target.closest(native)){conceal();return;}
    resolveTarget();
    if(visible && e.button===0){
      ripple();
    }
  },true);
  function ripple() {
    burst?.cancel();
    burst=pulse.animate([{opacity:.8,transform:'scale(.45)'},{opacity:0,transform:'scale(2.4)'}],{duration:360,easing:'ease-out'});
  }
  listen(document,'pointerup',move,true);
  listen(document,'pointercancel',stop,true);
  listen(document,'keydown',stop,true);
  listen(document,'keyup',stop,true);
  listen(window,'blur',stop);
  listen(document,'visibilitychange',()=>{if(document.hidden)stop();});
  listen(document,'scroll',refresh,true);
  listen(window,'resize',refresh);
  const observer=new MutationObserver(records=>{
    if(tracking && records.some(r=>r.target!==cursor && !cursor.contains(r.target))) refresh();
  });
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open','hidden','inert']});
  return ()=>{stop();events.abort();observer.disconnect();cursor.remove();};
}
function configure(){
  if(allowed.matches && !cleanup && !document.getElementById('glass-pointer') &&
    'showPopover' in HTMLElement.prototype && 'animate' in Element.prototype) cleanup=mount();
  if(!allowed.matches && cleanup){cleanup();cleanup=null;}
}
allowed.addEventListener('change',configure);
window.addEventListener('pagehide',()=>{cleanup?.();cleanup=null;});
window.addEventListener('pageshow',configure);
configure();
