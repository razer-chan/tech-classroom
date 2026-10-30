// Wheel speeds drive both wheel rotation and the robot's path.
export const PRESETS = [
 {id:'forward',title:'Forward',left:20,right:20,explain:'Same speed. Both wheels forwards.'},
 {id:'reverse',title:'Reverse',left:-20,right:-20,explain:'Same speed. Both wheels backwards.'},
 {id:'curve-left',title:'Curve left',left:10,right:20,explain:'Right wheel faster. Curve towards the slower left wheel.'},
 {id:'curve-right',title:'Curve right',left:20,right:10,explain:'Left wheel faster. Curve towards the slower right wheel.'},
 {id:'spin-left',title:'Spin left',left:-10,right:10,explain:'Left backwards + right forwards. Turn on the spot.'},
 {id:'spin-right',title:'Spin right',left:10,right:-10,explain:'Left forwards + right backwards. Turn on the spot.'}
];
export function stateAt(left,right,t){
 const vl=left*2,vr=right*2,v=(vl+vr)/2,w=(vl-vr)/64;
 const angle=w*t;
 return {x:Math.abs(w)<1e-9?0:v/w*(1-Math.cos(angle)),y:Math.abs(w)<1e-9?-v*t:-v/w*Math.sin(angle),angle,leftAngle:vl*t/20,rightAngle:vr*t/20};
}
