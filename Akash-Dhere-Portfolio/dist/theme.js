(() => {
  const root = document.documentElement;
  const key = 'akash-portfolio-theme';
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  root.dataset.theme = ['dark', 'light'].includes(saved) ? saved :
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  function sync() {
    const dark = root.dataset.theme === 'dark';
    document.querySelector('#theme-switch').setAttribute('aria-pressed', String(dark));
    document.querySelector('meta[name="theme-color"]').content = dark ? '#091522' : '#f7fbff';
  }
  document.addEventListener('DOMContentLoaded', () => {
    sync();
    const mast=document.querySelector('.mast');
    const brand=mast.querySelector('.brand');
    const wordmark=brand.querySelector('.wordmark');
    const target=mast.querySelector('.profiles');
    const beam=mast.querySelector('.mast-beam');
    function aimBeam(){
      const name=wordmark.getBoundingClientRect();
      const tabs=target.getBoundingClientRect();
      const header=mast.getBoundingClientRect();
      const x=name.right+5, y=name.top+name.height/2;
      const stacked=tabs.top>=name.bottom;
      const dx=(stacked ? tabs.left+tabs.width*.35 : tabs.left+2)-x;
      const dy=(stacked ? tabs.top : tabs.top+tabs.height/2)-y;
      Object.assign(beam.style,{left:(x-header.left)+'px',top:(y-header.top)+'px',
        width:Math.hypot(dx,dy)+'px',transform:'rotate('+Math.atan2(dy,dx)+'rad)'});
    }
    aimBeam();
    if(window.ResizeObserver){
      const observer=new ResizeObserver(aimBeam);
      for(const element of [mast,wordmark,target])observer.observe(element);
    } else { window.addEventListener('resize',aimBeam); }
    const intro=document.querySelector('#brand-intro');
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    if(!motion.matches && typeof intro.showModal==='function'){
      const film=intro.querySelector('.intro-film');

      const audio=new Audio('assets/intro-sound-1.mp3');
      audio.preload='auto';
      audio.volume=.88;
      audio.muted=false;
      let started=0;
      function joinAudio(){
        audio.currentTime=Math.max(0,(performance.now()-started)/1000);
        audio.play().catch(()=>{});
      }
      let timer;
      const endIntro=()=>{if(intro.open)intro.close();};
      function playSequence(){
        mast.classList.remove('beam-ready');
        if(!intro.open)intro.showModal();
        clearTimeout(timer);
        timer=setTimeout(endIntro,8450); // Fallback if the browser cancels the CSS animation.
        for(const animation of intro.getAnimations({subtree:true}))animation.currentTime=0;
        if(!film.src)film.src=film.dataset.src;
        film.currentTime=0;
        film.play().catch(endIntro);
        started=performance.now();
        joinAudio();
      }
      intro.addEventListener('animationend', event => {
        if (event.target === intro && event.animationName === 'intro-exit') endIntro();
      });
      intro.addEventListener('click',()=>{if(intro.open && audio.paused)joinAudio();});
      brand.addEventListener('click',event=>{
        if(!motion.matches && !event.ctrlKey && !event.metaKey && !event.shiftKey){
          event.preventDefault();window.scrollTo(0,0);playSequence();
        }
      });
      brand.title='Back to top and replay intro';
      motion.addEventListener('change',endIntro);
      intro.addEventListener('close',()=>{
        film.pause();audio.pause();clearTimeout(timer);aimBeam();mast.classList.add('beam-ready');
      });
      playSequence();
    } else { mast.classList.add('beam-ready'); }
    document.addEventListener('portfolio-profile-change',()=>{
      if(intro.open)return;
      mast.classList.remove('beam-ready');
      mast.classList.add('restarting-brand');
      aimBeam(); // The bounds read commits the reset before restarting the sequence.
      mast.classList.remove('restarting-brand');
      mast.classList.add('beam-ready');
    });
    const switcher = document.querySelector('#theme-switch');
    let reveal;
    let desiredTheme = root.dataset.theme;
    function applyTheme() {
      root.dataset.theme = desiredTheme;
      sync();
    }
    const mobilePortal=matchMedia('(max-width: 800px), (pointer: coarse)');
    let mobileLayer;
    function endMobilePortal(){
      mobileLayer?.remove();
      mobileLayer=null;
      root.classList.remove('mobile-software-portal');
      document.dispatchEvent(new Event('portfolio-portal-state'));
    }
    async function openMobilePortal(x,y,radius){
      const layer=document.createElement('span');
      mobileLayer=layer;
      layer.className='mobile-theme-wave';
      layer.setAttribute('aria-hidden','true');
      layer.style.left=(x-32)+'px';
      layer.style.top=(y-32)+'px';
      layer.style.background=desiredTheme==='dark'?'#091522':'#f7fbff';
      root.classList.add('mobile-software-portal');
      document.dispatchEvent(new Event('portfolio-portal-state'));
      document.body.append(layer);
      try {
        await layer.animate([{transform:'scale(.05)'},{transform:'scale('+radius/32+')'}],
          {duration:320,easing:'cubic-bezier(.35,.05,.25,1)',fill:'forwards'}).finished;
        if(mobileLayer!==layer)return;
        applyTheme();
        await layer.animate([{opacity:1},{opacity:0}],{duration:170,fill:'forwards'}).finished;
      } catch {
        if(mobileLayer===layer)applyTheme();
      } finally {
        if(mobileLayer===layer)endMobilePortal();
      }
    }
    switcher.addEventListener('click', () => {
      desiredTheme = desiredTheme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem(key, desiredTheme); } catch {}
      if (mobileLayer) {
        for(const animation of mobileLayer.getAnimations())animation.cancel();
        endMobilePortal();
        applyTheme();
        return;
      }
      if (reveal) {
        reveal.skipTransition();
        applyTheme();
        return;
      }
      if (motion.matches || (mobilePortal.matches ? !switcher.animate : !document.startViewTransition)) {
        applyTheme();
        return;
      }
      const box = switcher.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;
      const radius = Math.ceil(Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))) + 2;
      if(mobilePortal.matches){
        openMobilePortal(x,y,radius);
        return;
      }
      root.style.setProperty('--portal-x', x + 'px');
      root.style.setProperty('--portal-y', y + 'px');
      root.style.setProperty('--reveal-at', x + 'px ' + y + 'px');
      root.style.setProperty('--reveal-radius', radius + 'px');
      root.classList.add('revealing-theme');
      root.style.setProperty('--core-scale', String(22 / radius));
      const ring = document.createElement('span');
      ring.id = 'portal-ring';
      ring.setAttribute('aria-hidden', 'true');
      const transition = document.startViewTransition(() => {
        applyTheme();
        document.body.append(ring);
      });
      reveal = transition;
      transition.finished.finally(() => {
        ring.remove();
        if (reveal === transition) {
          reveal = null;
          root.classList.remove('revealing-theme');
        }
      });
    });
  });
})();
