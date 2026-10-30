import { PRESETS, stateAt } from './motion-model.mjs?v=4636962f';
const $=s=>document.querySelector(s);
const canvas=$('#robot-scene'),ctx=canvas.getContext('2d');
const routeCanvas=$('#route-scene'),routeCtx=routeCanvas.getContext('2d');
let preset=PRESETS[0],clock=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,slow=false,visible=true,last=0;
let width=800,height=500,scale=1,camera={x:0,y:0};
const DURATION=6;
function project([x,y,z]){
 x-=camera.x;y-=camera.y;
 const yaw=-.24,tilt=.84,X=x*Math.cos(yaw)-y*Math.sin(yaw),Y=x*Math.sin(yaw)+y*Math.cos(yaw);
 return [width/2+X*scale,height*.67+(Y*Math.cos(tilt)-z*Math.sin(tilt))*scale,Y*Math.sin(tilt)+z*Math.cos(tilt)];
}
function polygon(points,color,stroke){
 ctx.beginPath();points.forEach((p,i)=>{let q=project(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});ctx.closePath();ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.65;ctx.stroke();}
}
function line(points,color,weight=1,dashed=false){
 ctx.beginPath();points.forEach((p,i)=>{let q=project(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});ctx.strokeStyle=color;ctx.lineWidth=weight;ctx.setLineDash(dashed?[6,6]:[]);ctx.stroke();ctx.setLineDash([]);
}
function drawRoute(s,time){
 const c=routeCtx,w=240,h=180; c.clearRect(0,0,w,h);
 const all=Array.from({length:121},(_,i)=>stateAt(preset.left,preset.right,i*DURATION/120));
 const xs=all.map(p=>p.x),ys=all.map(p=>p.y),minX=Math.min(-30,...xs)-20,maxX=Math.max(30,...xs)+20,minY=Math.min(-30,...ys)-20,maxY=Math.max(30,...ys)+20;
 const zoom=Math.min((w-40)/(maxX-minX),(h-36)/(maxY-minY));
 const pt=p=>[w/2+(p.x-(minX+maxX)/2)*zoom,h/2+(p.y-(minY+maxY)/2)*zoom];
 function path(points,color,dash){c.beginPath();points.forEach((p,i)=>{const [x,y]=pt(p);i?c.lineTo(x,y):c.moveTo(x,y);});c.strokeStyle=color;c.lineWidth=4;c.setLineDash(dash);c.stroke();c.setLineDash([]);}
 if(preset.id.startsWith('spin')){c.beginPath();c.arc(w/2,h/2,37,0,2*Math.PI);c.setLineDash([5,6]);c.strokeStyle='#cad8cf';c.lineWidth=3;c.stroke();c.setLineDash([]);}
 else {path(all,'#dce5df',[4,5]);path(all.filter((_,i)=>i*DURATION/120<=time),'#459080',[]);}
 const start=pt({x:0,y:0});c.fillStyle='#9cbeb0';c.beginPath();c.arc(...start,5,0,Math.PI*2);c.fill();
 const [x,y]=pt(s);c.save();c.translate(x,y);c.rotate(s.angle);c.fillStyle='#264d47';c.beginPath();c.moveTo(0,-13);c.lineTo(10,10);c.lineTo(0,6);c.lineTo(-10,10);c.closePath();c.fill();c.restore();
 routeCanvas.setAttribute('aria-label',`Top view: ${preset.title}. The arrow shows the robot's current position and heading.`);
}
function render(){
 if(!ctx)return;
 ctx.clearRect(0,0,width,height);
 const time=Math.min(clock,DURATION),s=stateAt(preset.left,preset.right,time);camera=s;
 ctx.fillStyle='#e8f0e9';ctx.fillRect(0,0,width,height);
 const extent=600;
 for(let i=-extent;i<=extent;i+=40){line([[i,-extent,0],[i,extent,0]],'#cbdcd0');line([[-extent,i,0],[extent,i,0]],'#cbdcd0');}
 const trail=[];for(let t=0;t<=time;t+=.035){let p=stateAt(preset.left,preset.right,t);trail.push([p.x,p.y,.5]);}line(trail,'#5d9b87',4,true);
 const transform=([x,y,z])=>[s.x+x*Math.cos(s.angle)-y*Math.sin(s.angle),s.y+x*Math.sin(s.angle)+y*Math.cos(s.angle),z];
 polygon([[-47,-35,.7],[47,-35,.7],[47,40,.7],[-47,40,.7]].map(transform),'rgba(41,68,52,.13)');
 // Wheel direction arrows: length is proportional to speed, sign sets direction.
 for(const [x,speed,color] of [[-54,preset.left,'#087c79'],[54,preset.right,'#aa6414']]){
  const len=Math.abs(speed)*2.4,sign=Math.sign(speed),a=[x,sign*len/2,2],b=[x,-sign*len/2,2];
  line([a,b].map(transform),color,6);polygon([[x,-sign*len/2-sign*9,2],[x-6,-sign*len/2+sign*2,2],[x+6,-sign*len/2+sign*2,2]].map(transform),color);
 }
 const faces=[];
 const face=(p,c,stroke)=>{const pts=p.map(transform);faces.push({pts,c,stroke,depth:pts.reduce((sum,v)=>sum+project(v)[2],0)/pts.length});};
 function box(x,y,z,w,d,h,colors){
  const p=[[x-w/2,y-d/2,z],[x+w/2,y-d/2,z],[x+w/2,y+d/2,z],[x-w/2,y+d/2,z],[x-w/2,y-d/2,z+h],[x+w/2,y-d/2,z+h],[x+w/2,y+d/2,z+h],[x-w/2,y+d/2,z+h]];
  [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]].forEach((ids,i)=>face(ids.map(j=>p[j]),colors[i]||colors[0],'#ffffff18'));
 }
 function wheel(x,phase,accent){
  const n=40,r=20,w=14,z=20,ring=(side,i,rad=r)=>[x+side*w/2,Math.sin(i/n*Math.PI*2-phase)*rad,z+Math.cos(i/n*Math.PI*2-phase)*rad];
  for(let i=0;i<n;i++)face([ring(-1,i),ring(1,i),ring(1,i+1),ring(-1,i+1)],i<4?'#f9fff4':i%2?'#273f43':'#365157');
  for(const side of [-1,1]){
   face(Array.from({length:n},(_,i)=>ring(side,i)),'#21373d');
   const hub=i=>[x+side*(w/2+.4),Math.sin(i/n*Math.PI*2-phase)*15,z+Math.cos(i/n*Math.PI*2-phase)*15];
   for(let i=0;i<n;i++)face([[x+side*(w/2+.4),0,z],hub(i),hub(i+1)],i<5?'#fffef4':accent);
  }
 }
 box(0,0,20,48,66,16,['#78988a','#91af9f','#688777','#a3bdac','#ecf3e6']);
 box(0,-18,36,35,22,10,['#bf8c38','#d9a954','#bf9040','#dcaf5c','#f7d68e']);
 box(0,10,36,29,22,2,['#3f6e66','#3f6e66','#3f6e66','#3f6e66','#5a9a8b']);
 box(-10,-30,36,8,5,6,['#27434b']);box(10,-30,36,8,5,6,['#27434b']);
 wheel(-32,s.leftAngle,'#087c79');wheel(32,s.rightAngle,'#c88125');
 face([[-6,17,38.4],[0,7,38.4],[6,17,38.4],[2,17,38.4],[2,26,38.4],[-2,26,38.4],[-2,17,38.4]],'#fff');
 faces.sort((a,b)=>a.depth-b.depth).forEach(f=>polygon(f.pts,f.c,f.stroke));
 // Bubbles stay readable; their leaders follow the actual moving wheel centres.
 const canvasRect=canvas.getBoundingClientRect();
 for(const [side,x,angle,color] of [['left',-39,s.leftAngle,'#087c79'],['right',39,s.rightAngle,'#aa6414']]){
  const p=project(transform([x,0,23])),b=$(`#${side}-bubble`).getBoundingClientRect();
  const ax=b.left-canvasRect.left+b.width/2,ay=b.bottom-canvasRect.top;
  ctx.beginPath();ctx.moveTo(ax,ay);ctx.bezierCurveTo(ax,ay+25,p[0],p[1]-45,p[0],p[1]);ctx.strokeStyle='#ffffff';ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
  ctx.beginPath();ctx.arc(p[0],p[1],5,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
  $(`#${side}-disc`).style.transform=`rotate(${angle}rad)`;
  $(`#${side}-bubble`).dataset.targetX=p[0].toFixed(1);$(`#${side}-bubble`).dataset.targetY=p[1].toFixed(1);
 }
 drawRoute(s,time);
 canvas.dataset.motion=preset.id;canvas.dataset.time=time.toFixed(3);canvas.dataset.x=s.x.toFixed(3);canvas.dataset.y=s.y.toFixed(3);canvas.dataset.heading=s.angle.toFixed(3);canvas.dataset.leftAngle=s.leftAngle.toFixed(3);canvas.dataset.rightAngle=s.rightAngle.toFixed(3);
}
function resize(){const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);scale=Math.min(width/230,(height-175)/145);render();}
function buttonState(){$('#play-toggle').textContent=playing?'Pause':'Play';}
function selectPreset(id){
 preset=PRESETS.find(p=>p.id===id);clock=0;
 document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.preset===id)));
 for(const side of ['left','right']){
  const speed=preset[side],other=preset[side==='left'?'right':'left'];
  $(`#${side}-speed`).textContent=(speed>0?'+':'−')+Math.abs(speed)+'%';$(`#${side}-direction`).textContent=speed>0?'↑ forwards':'↓ backwards';$(`#block-${side}`).textContent=speed;
  $(`#${side}-bar`).style.width=`${Math.abs(speed)/20*100}%`;
  $(`#${side}-compare`).textContent=Math.abs(speed)===Math.abs(other)?'Same speed':Math.abs(speed)>Math.abs(other)?'2× as fast':'Half as fast';
 }
 $('#motion-title').textContent=preset.title;$('#motion-explanation').textContent=preset.explain;
 canvas.setAttribute('aria-label',`3D robot: ${preset.title}. Left wheel ${preset.left} percent, right wheel ${preset.right} percent. ${preset.explain}`);render();
}
for(const button of document.querySelectorAll('[data-preset]'))button.addEventListener('click',()=>{selectPreset(button.dataset.preset);playing=true;buttonState();});
$('#play-toggle').addEventListener('click',()=>{playing=!playing;buttonState();});
$('#replay').addEventListener('click',()=>{clock=0;playing=true;buttonState();render();});
$('#slow-toggle').addEventListener('click',()=>{slow=!slow;$('#slow-toggle').setAttribute('aria-pressed',String(slow));$('#slow-toggle').textContent=slow?'Slow motion · on':'Slow motion';});
new ResizeObserver(resize).observe(canvas);
new IntersectionObserver(([entry])=>visible=entry.isIntersecting).observe(canvas);
function frame(now){const dt=Math.min((now-last)/1000,.05);last=now;if(playing&&visible&&!document.hidden){clock=(clock+dt*(slow?.4:1))%(DURATION+1.2);render();}requestAnimationFrame(frame);}
buttonState();resize();requestAnimationFrame(frame);
