// The deck shares vertices with the fuselage, and the lid shares vertices with
// the wings. The same mesh can travel continuously in either direction.
const clamp=(n,low,high)=>Math.min(high,Math.max(low,n));
const mix=(a,b,t)=>a+(b-a)*t;
const between=(a,b,t)=>a.map((n,i)=>mix(n,b[i],t));
const flat=point=>()=>point;
const colors={
  silver:[.81,.84,.83],pearl:[.94,.92,.86],aluminium:[.57,.63,.64],
  graphite:[.22,.27,.28],dark:[.043,.061,.067],screen:[.022,.070,.078],
  glass:[.058,.145,.18],gold:[1,.73,.25],muted:[.28,.50,.47],
  blue:[.12,.55,.98],trim:[.37,.43,.43]
};
const stations=[
  [-1.68,.018,.018,.115],[-1.47,.085,.091,.084],[-1.08,.151,.158,.045],
  [-.66,.201,.204,.012],[-.36,.217,.221,0],[.62,.217,.221,0],
  [.90,.207,.210,-.003],[1.12,.166,.168,-.013],[1.30,.103,.094,-.041],
  [1.39,.045,.042,-.055],[1.42,.003,.003,-.055]
];
function hull(z,angle,offset=0){
  z=clamp(z,stations[0][0],stations.at(-1)[0]);
  let i=1;
  while(stations[i][0]<z)i++;
  const a=stations[i-1],b=stations[i],t=(z-a[0])/(b[0]-a[0]);
  return [(mix(a[1],b[1],t)+offset)*Math.cos(angle),
    mix(a[3],b[3],t)+(mix(a[2],b[2],t)+offset)*Math.sin(angle),z];
}
function normal(fn,u,v){
  const left=fn(Math.max(0,u-.001),v),right=fn(Math.min(1,u+.001),v);
  const bottom=fn(u,Math.max(0,v-.001)),top=fn(u,Math.min(1,v+.001));
  const [x,y,z]=right.map((n,i)=>n-left[i]),[a,b,c]=top.map((n,i)=>n-bottom[i]);
  const n=[y*c-z*b,z*a-x*c,x*b-y*a],length=Math.hypot(...n)||1;
  return n.map(k=>k/length);
}
export const nozzle={offset:.57,height:-.223,z:-.28,radius:.081};

export function buildModel(){
  const vertices=[];
  function patch(start,end,from,to,cols=1,rows=1,delay=0){
    const grid=[];
    for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
      const u=i/cols,v=j/rows,p=start(u,v);
      grid.push([p[0],p[1]-.16,p[2],...normal(start,u,v),...colors[from],
        ...end(u,v),...normal(end,u,v),...colors[to],delay]);
    }
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
      const a=j*(cols+1)+i,b=a+1,c=a+cols+1,d=c+1;
      vertices.push(...grid[a],...grid[b],...grid[d],...grid[a],...grid[d],...grid[c]);
    }
  }
  const deck=(u,v)=>{
    const a=u*2*Math.PI,z=mix(-.63,.79,v);
    const rounded=n=>Math.sign(n)*Math.abs(n)**.17;
    const corner=1-.035*Math.max(0,(Math.abs(v-.5)-.45)/.05);
    return [1.13*rounded(Math.cos(a))*corner,-.406+.061*rounded(Math.sin(a)),z];
  };
  const fuselage=(u,v)=>hull(mix(-1.68,1.42,v),u*2*Math.PI);
  patch(deck,fuselage,'aluminium','pearl',32,48,.03);
  for(const v of [0,1]){
    const close=(fn,u,r)=>between(between(fn(0,v),fn(.5,v),.5),fn(u,v),r);
    patch((u,r)=>close(deck,u,r),(u,r)=>close(fuselage,u,r),'trim','silver',32,1,.03);
  }
  const lid=(x,h,front=0)=>[x,-.37+h*1.41,-.58-.24*h+front];
  const wing=(side,span,chord,raised=0)=>{
    const k=Math.abs(span),leading=.44-.93*k,trailing=leading-(.70-.53*k);
    return [side*(.105+1.41*k),-.044+.095*k+.024*Math.sin(Math.PI*chord)+raised,mix(trailing,leading,chord)];
  };
  for(const side of [-1,1]){
    const panel=(u,v)=>lid(side*u*1.13,v);
    const wingSide=(u,v)=>wing(side,u,v);
    const panelBack=(u,v)=>lid(side*u*1.13,v,-.047);
    const wingBack=(u,v)=>wing(side,u,v,-.041+.027*u);
    patch(panel,wingSide,'graphite','silver',9,5,.12);
    patch(panelBack,wingBack,'aluminium','aluminium',9,5,.12);
    for(const edge of [0,1]){
      patch((u,v)=>between(panel(u,edge),panelBack(u,edge),v),(u,v)=>between(wingSide(u,edge),wingBack(u,edge),v),'trim','trim',10,1,.12);
      patch((v,t)=>between(panel(edge,v),panelBack(edge,v),t),(v,t)=>between(wingSide(edge,v),wingBack(edge,v),t),'trim','blue',5,1,.12);
    }
    patch((u,v)=>lid(side*(.00005+1.088*u),.042+.923*v,.003),
      (u,v)=>wing(side,u*.94,v*.86+.06,-.025),'screen','aluminium',8,4,.12);
    patch((u,v)=>lid(side*mix(1.085,1.10,u),mix(.05,.94,v),.005),
      (u,v)=>wing(side,.945+u*.055,v,.004),'dark','blue',3,5,.12);
    patch((u,v)=>lid(side*mix(.34,1.07,u),.024+.006*v,.004),
      (u,v)=>wing(side,.39+.53*u,.255+.009*v,.004),'graphite','trim',8,1,.12);
  }
  // Horizontal trapezoids from the two navbar monogram outlines, facing out from the lid.
  const monogramBands = [
    [9, 49, 43.0, 20.662, 55.0, 48.333],
    [49, 69, 20.662, 9.494, 35.0, 24.189],
    [49, 69, 35.0, 31.0, 48.333, 45.0],
    [69, 86, 9.494, 0.0, 24.189, 15.0],
    [22, 36, 52.0, 50.0, 76.0, 90.737],
    [36, 41, 72.0, 76.375, 90.737, 96.0],
    [41, 44, 76.375, 79.0, 96.0, 94.2],
    [44, 68, 79.0, 67.0, 94.2, 79.8],
    [68, 73, 67.0, 56.0, 79.8, 76.8],
    [73, 76, 36.0, 34.154, 76.8, 75.0],
    [76, 86, 34.154, 28.0, 75.0, 57.0],
  ];
  for(const [top,bottom,leftTop,leftBottom,rightTop,rightBottom] of monogramBands){
    patch((u,v)=>{
      const x=mix(mix(leftTop,leftBottom,v),mix(rightTop,rightBottom,v),u);
      return lid((50-x)*.008,.52+(50-mix(top,bottom,v))*.0043,-.055);
    },flat([0,0,0]),'gold','trim',1,1,.12);
  }
  function deckRect(x,z,w,h,y,material){
    patch((u,v)=>[x+w*u,y,z+h*v],flat([0,-.02,-.17]),material,'graphite');
  }
  // Gold edge inlays, twin speaker grilles and a framed glass trackpad.
  for(const side of [-1,1]){
    const railX=side<0?-1.085:1.005;
    deckRect(railX,.25,.08,.022,-.332,'gold');
    for(let vent=0;vent<9;vent++){
      deckRect(railX,-.45+vent*.074,.08,.022,-.332,'dark');
    }
  }
  for(const x of [-.78,.59]){
    deckRect(x,-.57,.19,.07,-.325,'trim');
    deckRect(x+.02,-.555,.15,.03,-.320,'silver');
  }
  deckRect(-.78,.745,1.56,.013,-.338,'gold');
  deckRect(-.96,-.49,1.92,.70,-.339,'graphite');
  for(let r=0;r<5;r++){
    const cols=r===4?9:13;
    for(let c=0;c<cols;c++){
      const w=1.84/cols;
      deckRect(-.92+c*w,-.45+r*.127,w-.018,.096,-.328,'dark');
      deckRect(-.905+c*w,-.428+r*.127,Math.min(.037,w*.22),.010,-.326,'trim');
    }
  }
  deckRect(-.32,.297,.64,.349,-.337,'gold');deckRect(-.307,.309,.614,.325,-.332,'glass');
  for(const side of [-1,1]){
    const angle=a=>side<0?Math.PI-a:a;
    const skin=(u,v,z0,z1,a0,a1,offset=.004)=>hull(mix(z0,z1,u),angle(mix(a0,a1,v)),offset);
    const tucked=flat([side*.32,-.408,-.53]);
    patch(tucked,(u,v)=>skin(u,v,-1.37,1.17,-.22,-.1),'trim','blue',28,2,.10);
    for(let i=0;i<12;i++){
      const z=-.79+i*.139;
      patch(tucked,(u,v)=>skin(u,v,z,z+.064,.22,.50,.008),'dark','glass',3,3,.18);
    }
    for(const [a0,a1] of [[.31,.79],[.84,1.52]]){
      patch(tucked,(u,v)=>{
        const a=mix(a0,a1,v),z=mix(.915+.08*Math.sin(a),1.136+.106*Math.sin(a),u);
        return hull(z,angle(a),.008);
      },'dark','glass',6,5,.16);
    }
    const hinge=(u,v)=>{
      const a=u*2*Math.PI;
      return [side*(.52+v*.31),-.34+.048*Math.cos(a),-.57+.048*Math.sin(a)];
    };
    const pod=(u,v)=>{
      const a=u*2*Math.PI,r=.128+.029*Math.sin(Math.PI*v)-.047*(1-v)**2;
      return [side*nozzle.offset+r*Math.cos(a),nozzle.height+r*Math.sin(a),nozzle.z+v*.65];
    };
    patch(hinge,pod,'graphite','aluminium',22,9,.22);
    patch((u,v)=>hinge(u,1),(u,v)=>{
      const a=u*2*Math.PI,r=mix(.102,.13,v);
      return [side*.57+r*Math.cos(a),-.223+r*Math.sin(a),.371+.012*Math.sin(Math.PI*v)];
    },'trim','silver',22,3,.22);
    patch((u,v)=>hinge(u,1),(u,v)=>{
      const a=u*2*Math.PI,r=.105*v;
      return [side*.57+r*Math.cos(a),-.223+r*Math.sin(a),.351];
    },'dark','dark',24,3,.22);
    for(let i=0;i<11;i++){
      patch(tucked,(u,v)=>{
        const a=i*2*Math.PI/11+.45*u+.13*v,r=mix(.018,.091,u);
        return [side*.57+r*Math.cos(a),-.223+r*Math.sin(a),.356];
      },'dark','trim',3,1,.26);
    }
    patch(tucked,(u,v)=>[side*.57,-.22+.20*v,mix(-.23,.10,u)-.09*v],'trim','silver',1,1,.22);
    patch(tucked,(u,v)=>[side*(.045+.56*u),.104+.061*u,-1.13-.35*u+(.36-.24*u)*v],'aluminium','silver',5,3,.32);
  }
  const fin=(side,u,v)=>[side*.024*(1-v),.105+.53*v,-1.53+.037*v+(.62-.46*v)*u];
  for(const side of [-1,1]){
    const fold=flat([side*.14,-.4,-.56]);
    patch(fold,(u,v)=>fin(side,u,v),'aluminium','blue',3,4,.32);
    patch(fold,(u,v)=>{const p=fin(side,u,.54+.08*v+.14*u);p[0]+=side*.001;return p;},'trim','pearl',3,2,.32);
  }
  // Concentric rings make the plume circular in cross-section. A negative
  // destination color marks emissive vertices in the shared depth-tested mesh.
  for(const side of [-1,1]){
    const ring=(angle,t)=>{
      const r=nozzle.radius*(1-t)**.78*(1+.08*Math.sin(t*18+angle*3)*t);
      const position=[side*nozzle.offset+r*Math.cos(angle),nozzle.height+r*Math.sin(angle),nozzle.z-.49*t];
      return [0,-.55,-.58,0,0,1,0,0,0,...position,Math.cos(angle),Math.sin(angle),0,-1,t,angle,.35];
    };
    for(let i=0;i<28;i++)for(let j=0;j<10;j++){
      const a=i*2*Math.PI/28,b=(i+1)*2*Math.PI/28,t=j/10,u=(j+1)/10;
      vertices.push(...ring(a,t),...ring(b,t),...ring(b,u),...ring(a,t),...ring(b,u),...ring(a,u));
      if(!j)vertices.push(...ring(a,0),...ring(b,0),0,-.55,-.58,0,0,1,0,0,0,side*nozzle.offset,nozzle.height,nozzle.z,0,0,-1,-1,0,0,.35);
    }
  }
  return new Float32Array(vertices);
}

const vertexShader=`
attribute vec3 aPosition, aNormal, aColor;
attribute vec3 bPosition, bNormal, bColor;
attribute float aDelay;
uniform vec4 uCamera;
uniform vec2 uScale;
uniform float uMorph,uTime;
varying vec3 vNormal,vColor,vPoint;
vec3 turn(vec3 p){
  vec3 q=vec3(uCamera.x*p.x+uCamera.y*p.z,p.y,-uCamera.y*p.x+uCamera.x*p.z);
  return vec3(q.x,uCamera.z*q.y-uCamera.w*q.z,uCamera.w*q.y+uCamera.z*q.z);
}
void main(){
  float t=smoothstep(aDelay,min(1.,aDelay+.65),uMorph);
  vec3 pos=mix(aPosition,bPosition,t);
  if(bColor.r<0.)pos.z-=.025*t*bColor.g*bColor.g*sin(uTime+5.*bColor.g);
  vec3 p=turn(pos);
  float w=1.0-p.z*.115;
  gl_Position=vec4(p.xy*uScale,-p.z*.16,w);
  vNormal=turn(mix(aNormal,bNormal,t)); vPoint=p; vColor=bColor.r<0.?vec3(-1.,bColor.g,bColor.b):mix(aColor,bColor,t);
}`;
const fragmentShader=`
precision mediump float;
varying vec3 vNormal,vColor,vPoint;
void main(){
  vec3 n=normalize(vNormal);
  vec3 eye=normalize(vec3(0.,0.,8.)-vPoint);
  if(dot(n,eye)<0.) n=-n;
  if(vColor.r<0.){
    float t=vColor.g;
    vec3 fire=mix(vec3(.97,.96,1.),vec3(.28,.57,1.),smoothstep(0.,.48,t));
    fire=mix(fire,vec3(1.,.53,.18),smoothstep(.47,1.,t));
    gl_FragColor=vec4(fire*(.55+.45*abs(dot(n,eye))),1.);return;
  }
  vec3 r=reflect(-eye,n);
  float key=max(0.,dot(n,normalize(vec3(-.7,.9,.8))));
  float rim=pow(1.-max(0.,dot(n,eye)),2.);
  float strip=exp(-abs(r.x+.62)*11.)*smoothstep(-.65,.55,r.y);
  float top=exp(-abs(r.y-.53)*12.)*smoothstep(-.95,-.30,r.x);
  float edge=exp(-abs(r.x-.77)*16.);
  vec3 color=vColor*(.25+.72*key+.27*rim)+vec3(.73,.84,.83)*(.42*strip+.42*top+.22*edge);
  gl_FragColor=vec4(color,1.);
}`;

function gpuRenderer(canvas, mesh) {
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'});
  if(!gl) return null;
  const program=gl.createProgram();
  for(const [type,source] of [[gl.VERTEX_SHADER,vertexShader],[gl.FRAGMENT_SHADER,fragmentShader]]){
    const shader=gl.createShader(type);
    gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Model shader unavailable');
    gl.attachShader(program,shader);gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Model renderer unavailable');
  gl.useProgram(program);
  const buffer=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,mesh,gl.STATIC_DRAW);
  const attributes=[['aPosition',3,0],['aNormal',3,3],['aColor',3,6],
    ['bPosition',3,9],['bNormal',3,12],['bColor',3,15],['aDelay',1,18]];
  for(const [name,size,offset] of attributes){
    const location=gl.getAttribLocation(program,name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location,size,gl.FLOAT,false,19*4,offset*4);
  }
  const cam=gl.getUniformLocation(program,'uCamera'),scale=gl.getUniformLocation(program,'uScale'),morph=gl.getUniformLocation(program,'uMorph');
  const clock=gl.getUniformLocation(program,'uTime');
  gl.enable(gl.DEPTH_TEST);
  return (progress,yaw,pitch,zoom,time=0)=>{
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const radius=Math.min(canvas.height*.46,canvas.width*.301)*zoom;
    gl.uniform2f(scale,2*radius/canvas.width,2*radius/canvas.height);
    gl.uniform4f(cam,Math.cos(yaw),Math.sin(yaw),Math.cos(pitch),Math.sin(pitch));
    gl.uniform1f(morph,progress);gl.uniform1f(clock,time);
    gl.drawArrays(gl.TRIANGLES,0,mesh.length/19);
  };
}

// Rasterize the same curved panels with a depth buffer on devices without WebGL.
// The software path caps its pixel count and interpolates the studio lighting.
function softwareRenderer(canvas,mesh){
  const ctx=canvas.getContext('2d');
  if(!ctx)return null;
  let image,depth;
  const unique=[],indices=[],seen=new Map();
  for(let i=0;i<mesh.length;i+=19){
    const vertex=mesh.subarray(i,i+19),signature=vertex.join(',');
    let index=seen.get(signature);
    if(index===undefined){
      index=unique.length/19;seen.set(signature,index);unique.push(...vertex);
    }
    indices.push(index);
  }
  const geometry=new Float32Array(unique);
  const projected=new Float32Array(unique.length/19*6);
  return (progress,yaw,pitch,zoom,time=0)=>{
    const w=canvas.width,h=canvas.height;
    if(!image||image.width!==w||image.height!==h){
      image=ctx.createImageData(w,h);depth=new Float32Array(w*h);
    }
    const pixels=image.data;pixels.fill(0);depth.fill(-10);
    const size=Math.min(h*.46,w*.301)*zoom;
    const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch);
    for(let i=0,k=0;i<geometry.length;i+=19,k+=6){
      const t=clamp((progress-geometry[i+18])/.65,0,1),blend=t*t*(3-2*t);
      const x=mix(geometry[i],geometry[i+9],blend);
      const y=mix(geometry[i+1],geometry[i+10],blend);
      const flame=geometry[i+15]<0, along=geometry[i+16];
      const z=mix(geometry[i+2],geometry[i+11],blend)-(flame?.025*blend*along*along*Math.sin(time+5*along):0);
      const rx=cy*x+sy*z,rz=-sy*x+cy*z,ry=cx*y-sx*rz,zv=sx*y+cx*rz;
      const f=size/(1-.115*zv);
      projected[k]=w/2+rx*f;projected[k+1]=h/2-ry*f;projected[k+2]=zv;
      const ax=mix(geometry[i+3],geometry[i+12],blend);
      const ay=mix(geometry[i+4],geometry[i+13],blend);
      const az=mix(geometry[i+5],geometry[i+14],blend);
      const length=Math.hypot(ax,ay,az)||1;
      let nx=(cy*ax+sy*az)/length;
      const nz0=(-sy*ax+cy*az)/length;
      let ny=cx*ay/length-sx*nz0,nz=sx*ay/length+cx*nz0;
      if(nz<0){nx=-nx;ny=-ny;nz=-nz;}
      if(flame){
        const glow=255*(.55+.45*nz), blue=clamp(along/.48,0,1), gold=clamp((along-.47)/.53,0,1);
        projected[k+3]=glow*mix(mix(.97,.28,blue),1,gold);
        projected[k+4]=glow*mix(mix(.96,.57,blue),.53,gold);
        projected[k+5]=glow*mix(1,.18,gold);
        continue;
      }
      const key=Math.max(0,-.52*nx+.66*ny+.54*nz),rim=(1-nz)**2;
      const ex=2*nz*nx,ey=2*nz*ny;
      const strip=Math.exp(-Math.abs(ex+.58)*9)*clamp((ey+.65)/1.2,0,1);
      const top=Math.exp(-Math.abs(ey-.55)*10)*clamp((ex+.95)/.65,0,1);
      const edge=Math.exp(-Math.abs(ex-.77)*14);
      const light=.32+.69*key+.24*rim;
      const gleam=.44*strip+.44*top+.24*edge;
      for(let c=0;c<3;c++){
        const color=mix(geometry[i+6+c],geometry[i+15+c],blend);
        projected[k+3+c]=255*Math.min(1,color*light+gleam*(c===0?.78:.86));
      }
    }
    for(let i=0;i<indices.length;i+=3){
      const a=indices[i]*6,b=indices[i+1]*6,c=indices[i+2]*6;
      const ax=projected[a],ay=projected[a+1],bx=projected[b],by=projected[b+1],cx=projected[c],cy=projected[c+1];
      const den=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);
      if(Math.abs(den)<.001)continue;
      const x0=Math.max(0,Math.floor(Math.min(ax,bx,cx))),x1=Math.min(w-1,Math.ceil(Math.max(ax,bx,cx)));
      const y0=Math.max(0,Math.floor(Math.min(ay,by,cy))),y1=Math.min(h-1,Math.ceil(Math.max(ay,by,cy)));
      const da=(by-cy)/den,db=(cy-ay)/den;
      for(let y=y0;y<=y1;y++){
        const py=y+.5-cy;
        let u=da*(x0+.5-cx)+(cx-bx)*py/den;
        let v=db*(x0+.5-cx)+(ax-cx)*py/den;
        for(let x=x0,index=y*w+x0;x<=x1;x++,index++,u+=da,v+=db){
          const q=1-u-v;
          if(u<-.0001||v<-.0001||q<-.0001)continue;
          const z=u*projected[a+2]+v*projected[b+2]+q*projected[c+2];
          if(z<depth[index])continue;
          depth[index]=z;
          const pixel=index*4;
          for(let ch=0;ch<3;ch++)pixels[pixel+ch]=u*projected[a+3+ch]+v*projected[b+3+ch]+q*projected[c+3+ch];
          pixels[pixel+3]=255;
        }
      }
    }
    ctx.putImageData(image,0,0);
  };
}

export function createRenderer(canvas,mesh){
  let draw;
  try {draw=gpuRenderer(canvas,mesh);} catch {}
  const softwareMode=!draw;
  if(!draw){
    const replacement=canvas.cloneNode(false);canvas.replaceWith(replacement);canvas=replacement;
    draw=softwareRenderer(canvas,mesh);
  }
  return {canvas,draw,softwareMode};
}
