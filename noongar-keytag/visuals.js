/* Original, simplified drawing guides. These are not screenshots or cultural symbols. */
const svg = (body, label='', box='0 0 640 420') => `<svg viewBox="${box}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><g font-family="Arial,sans-serif" fill="#203c41">${body}</g></svg>`;
const txt=(x,y,t,size=20,fill='#657e6b',anchor='middle')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${t}</text>`;
const leaf=(x,y,scale=1,rotation=0,color='#478373')=>`<path transform="translate(${x} ${y}) rotate(${rotation}) scale(${scale})" d="M0 0 Q-90 -90 0 -170 Q90 -90 0 0Z" fill="${color}"/>`;
const dot=(x,y,r=10,color='#d9a951')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
const box=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#629480" stroke-width="2" stroke-dasharray="6 5"/>${[[x,y],[x+w,y],[x,y+h],[x+w,y+h]].map(([a,b])=>`<rect x="${a-4}" y="${b-4}" width="8" height="8" fill="#fff" stroke="#478373" stroke-width="2"/>`).join('')}`;
const cursor=(x,y)=>`<path d="M${x} ${y}v31l9-9 9 15 6-4-9-15h15Z" fill="#203c41" stroke="white" stroke-width="2"/>`;
const flower=(x,y,s=1,color='#d4ab55')=>`<g transform="translate(${x} ${y}) scale(${s})">${[0,60,120,180,240,300].map(a=>`<ellipse cx="0" cy="-40" rx="17" ry="33" fill="${color}" transform="rotate(${a})"/>`).join('')}<circle r="21" fill="#7c6147"/></g>`;
const tagOutline=(color='#c85c53')=>`<circle cx="320" cy="215" r="165" fill="#fffef9" stroke="${color}" stroke-width="3"/><circle cx="320" cy="85" r="13" fill="#fafaf5" stroke="${color}" stroke-width="3"/>`;
function toolIcon(name){const shapes={select:'<path d="M7 4v19l5-6 5 9 4-2-5-9h9Z" fill="#385e50"/>',ellipse:'<ellipse cx="16" cy="16" rx="11" ry="9" fill="#c9984c"/>',rect:'<rect x="5" y="6" width="22" height="20" rx="2" fill="#7c9ab8"/>',pen:'<path d="M16 3L5 20l11 8 11-8Z" fill="none" stroke="#476b5a" stroke-width="2"/><path d="M16 3v15" stroke="#476b5a" stroke-width="2"/><circle cx="16" cy="20" r="3" fill="#476b5a"/>',node:'<path d="M5 25Q6 3 27 7" fill="none" stroke="#629276" stroke-width="2"/><rect x="3" y="23" width="6" height="6" fill="#629276"/><rect x="24" y="4" width="6" height="6" fill="#629276"/>',lock:'<rect x="6" y="14" width="20" height="15" rx="3" fill="#839589"/><path d="M10 14V9a6 6 0 0112 0v5" fill="none" stroke="#839589" stroke-width="3"/>',file:'<path d="M7 2h12l8 9v19H7Z" fill="#eff4e9" stroke="#7f9e84" stroke-width="2"/><path d="M19 2v10h8" fill="none" stroke="#7f9e84" stroke-width="2"/>',check:'<path d="M5 16l7 7L28 6" fill="none" stroke="#52886b" stroke-width="4" stroke-linecap="round"/>',plant:'<path d="M16 29V10" stroke="#507f65" stroke-width="2"/><path d="M16 21Q2 22 4 9q13-1 12 12M16 15q-1-14 13-12 0 13-13 12" fill="#7caa85"/>'};return svg(shapes[name]||shapes.plant,name,'0 0 32 32');}
function drawing(kind,step=0){let a='';
if(kind==='circle'){
 a=step===0?`<ellipse cx="295" cy="202" rx="91" ry="70" fill="#e6e8df" stroke="#9cafa0" stroke-width="2"/>${cursor(387,272)}${txt(320,340,'Ellipse tool (E) → drag',23)}`:step===1?`<circle cx="295" cy="202" r="91" fill="#e5b55b"/>${box(204,111,182,182)}${txt(320,340,'Hold Ctrl for a circle',23)}`:`<circle cx="295" cy="202" r="91" fill="#447f6b"/>${box(204,111,182,182)}${txt(320,340,'Click a palette colour → fill',23)}`;
}
if(kind==='move'){
 const x=step===0?150:step===1?300:275,r=step===2?90:55;
 a=dot(x,200,r,'#5d947a')+box(x-r,200-r,r*2,r*2)+cursor(x+25,200)+txt(320,350,['Selector (S)','Drag the object to move it','Ctrl + corner handle → keep proportions'][step],22);
}
if(kind==='duplicate'){
 a=dot(160,210,36,'#c28b47');if(step>0)a+=box(124,174,72,72)+txt(320,100,'The copy starts on top of the original',20);if(step===2)a+=dot(290,210,36,'#c28b47')+dot(420,210,36,'#c28b47')+dot(550,210,36,'#c28b47');a+=txt(320,350,['Select one dot','Edit → Duplicate','Move the copy. Repeat.'][step],24);
}
if(kind==='line'){
 a=`<path d="M155 230L450 170" fill="none" stroke="${step===2?'#233e42':'#799886'}" stroke-width="${step===2?7:2}" ${step===0?'stroke-dasharray="8 5"':''}/>${[155,450].map((x,i)=>dot(x,i?170:230,6,'#203c41')).join('')}${txt(155,270,'1',18)}${txt(450,140,'2',18)}${txt(320,345,['Pen (B): click two points','Press Enter to finish the open path','Shift-click a palette colour → stroke'][step],22)}`;
}
if(kind==='rotate'){
 if(step===0)a=`<ellipse cx="320" cy="210" rx="27" ry="70" fill="#d6a74e"/>${box(293,140,54,140)}`;
 if(step===1)a=`<ellipse cx="250" cy="160" rx="27" ry="70" fill="#d6a74e"/><ellipse cx="395" cy="235" rx="27" ry="70" fill="#d6a74e" transform="rotate(60 395 235)"/>${box(328,182,134,106)}${txt(405,145,'↻',40)}`;
 if(step===2)a=flower(320,210,1.8);
 a+=txt(320,365,['Draw an oval petal','Duplicate → click again → rotate → move','Repeat around the centre. Add a circle.'][step],21);
}
if(kind==='group'){
 const shift=step===2?110:0; a=`<g transform="translate(${shift} 0)">${flower(230,180,1)}${leaf(250,300,.5,70)}<path d="M230 210v110" stroke="#4a856e" stroke-width="10"/>${step===0?box(153,104,166,220):box(153,104,166,220)}</g>${txt(320,380,['Shift-click to select all the parts','Object → Group','Selector (S): drag the group'][step],21)}`;
}
if(kind==='order'){
 const shape=leaf(320,315,1.25,0),band='<rect x="180" y="235" width="280" height="55" rx="14" fill="#d9ab56"/>';
 a=(step===0?shape+band:band+shape)+box(207,102,226,218)+txt(320,375,step===0?'The leaf is behind the band':'Object → Raise moves the leaf in front',22);
}
if(kind==='path'){
 const d=step===0?'M320 65L285 320L355 320Z':step===1?'M320 65Q155 300 285 320L355 320Z':'M320 65Q155 300 285 320L355 320Q485 300 320 65Z';
 a=`<path d="${d}" fill="#b8d3aa" stroke="#508467" stroke-width="3"/>${[[320,65],[285,320],[355,320]].map(([x,y])=>`<rect x="${x-5}" y="${y-5}" width="10" height="10" fill="white" stroke="#346c55" stroke-width="2"/>`).join('')}${txt(320,383,['Pen (B): 3 clicks, then close on point 1','Node tool (N): pull one long edge out','Pull the other long edge into a curve'][step],21)}`;
}
if(kind==='fillstroke'){
 a=`<circle cx="320" cy="190" r="98" fill="${step===0?'#d9ad53':'#000000'}" stroke="${step===2?'none':'#c56b53'}" stroke-width="12"/>${txt(320,350,['Fill = inside. Stroke = outline.','Click black on the palette to set the fill','Fill and Stroke → Stroke paint → X'][step],21)}`;
}
if(kind==='scale'){
 a=tagOutline('#d4dace')+leaf(315,316,1,0,'#203c41')+flower(380,230,.55,'#203c41')+txt(320,413,'Simple shapes remain readable at a small size',20);
}
return svg(a,`${kind} drawing step ${step+1}`);
}
function keytagArt(mode='clean'){
 let a=tagOutline();
 if(mode==='dimensions'){a=`<rect x="138.5" y="33.5" width="363" height="363" fill="#fff" stroke="#b9cbbd" stroke-dasharray="5 5"/><image href="${TEMPLATE}" x="138.5" y="33.5" width="363" height="363"/><path d="M155 393H485M155 386v14M485 386v14" stroke="#527665" stroke-width="2"/>${txt(320,412,'50 mm keytag',18)}${txt(320,20,'55 mm page',17)}<path d="M332 75H478" stroke="#6d8a76" stroke-width="2"/>${txt(498,72,'Hole',20)}`;}
 else if(mode==='bad'){a+=leaf(320,340,1.55,0,'#273f42')+flower(467,280,.9,'#273f42')+`<circle cx="320" cy="88" r="32" fill="none" stroke="#c56a50" stroke-width="5"/><circle cx="480" cy="280" r="68" fill="none" stroke="#c56a50" stroke-width="5"/>`;}
 else if(mode==='cut'){a+=`<path d="M503 95l-52 39" stroke="#bd784c" stroke-width="3"/><circle cx="451" cy="134" r="7" fill="#e1a555"/>${txt(526,73,'CUT',20,'#b85b46')}`;}
 else if(mode==='blank'){}
 else {a+=leaf(310,328,1,0,'#263e41')+flower(392,226,.65,'#263e41')+`<path d="M242 310q-23-41 7-68" fill="none" stroke="#263e41" stroke-width="9" stroke-linecap="round"/>`;}
 return svg(a,mode==='dimensions'?'55 mm page, 50 mm keytag, supplied keyring hole':`${mode} keytag illustration`);
}
function visualFor(s){
 if(s.visual==='image')return `<img class="scene" src="${s.image}" alt="${s.alt||s.title}">${s.caption?`<p class="visual-caption">${s.caption}</p>`:''}`;
 if(s.visual==='reference')return `<button class="reference-image" data-image="${s.image}" data-credit="${s.caption}" aria-label="Enlarge reference image"><img src="${s.image}" alt="${s.alt||s.title}"></button><p class="visual-caption">${s.caption} · Click to enlarge</p>`;
 if(s.visual==='poster')return `<div class="poster-frame"><button data-image="assets/references/symbols-${s.poster}.png" data-credit="SERCUL Noongar Symbols and Language. Acknowledgement to Marie Taylor, Yelakitj Moort Nyungar Association. Supplied school resource." aria-label="Enlarge full ${s.poster} poster"><svg viewBox="0 0 885 1252" role="img" aria-label="${s.poster} section of supplied Noongar symbol poster"><defs><clipPath id="poster-clip"><rect width="885" height="1252"/></clipPath></defs><image clip-path="url(#poster-clip)" href="assets/references/symbols-${s.poster}.png" width="1773" height="1252" preserveAspectRatio="none"/></svg></button></div><p class="visual-caption">SERCUL · Noongar Symbols & Language · Click for full source</p>`;
 if(s.visual==='seasons')return `<div class="seasons-six">${SEASONS.map(x=>`<div class="mini-season"><img src="assets/diagrams/${x.id}.svg" alt="${x.clue}"><b>${x.name}</b><small>${x.months}</small></div>`).join('')}</div>`;
 if(s.visual==='seasonpair')return `<div class="season-pair">${s.ids.map(i=>SEASONS[i]).map(x=>`<div class="season-panel"><img src="assets/diagrams/${x.id}.svg" alt="${x.clue}"><div class="season-caption"><h2>${x.name}<small>${x.months}</small></h2><p>${x.clue}</p></div></div>`).join('')}</div>`;
 if(s.visual==='demo')return `<div class="tool-demo"><div class="editor"><div class="editor-head"><span>Inkscape · tool guide</span><span>Simplified view</span></div><div class="editor-menu"><span>File</span><span>Edit</span><span>Object</span><span>Path</span><span>Layer</span></div><div class="editor-area"><div class="tool-strip">${['select','node','rect','ellipse','pen'].map(x=>`<div class="tool-icon ${((s.demo==='rotate'&&x==='ellipse')||(s.demo!=='rotate'&&s.tool===x))?'active':''}" title="${x}">${toolIcon(x)}</div>`).join('')}</div><div class="editor-canvas" id="demoDrawing">${drawing(s.demo,0)}</div></div><div class="palette">${['#fff','#273f42','#767e71','#c97250','#d8ab53','#668862','#418674','#779bb5','#8875a3'].map(c=>`<span style="background:${c}"></span>`).join('')}</div></div><div class="demo-controls"><p id="demoCaption" aria-live="polite"><strong>1.</strong> ${s.steps[0]}</p><div class="step-buttons">${s.steps.map((_,i)=>`<button data-step="${i}" aria-label="Show step ${i+1}" aria-pressed="${i===0}">${i+1}</button>`).join('')}</div></div><p class="demo-hint">Click the numbered steps · then demonstrate in Inkscape</p></div>`;
 if(s.visual==='steps')return `<div class="steps">${s.items.map((x,i)=>`<div class="step-row"><span class="step-number">${i+1}</span><div><b>${x[0]}</b><small>${x[1]}</small></div></div>`).join('')}${s.foot?`<p class="task-foot">${s.foot}</p>`:''}</div>`;
 if(s.visual==='tag')return keytagArt(s.mode);
 if(s.visual==='compare')return `<div class="compare">${s.cards.map(x=>`<div class="compare-card ${x.bad?'bad':''}">${keytagArt(x.mode)}<h3>${x.title}</h3><p>${x.text}</p></div>`).join('')}</div>`;
 if(s.visual==='layers')return `<div class="layer-stack"><div class="layer-row active">${toolIcon('pen')}<div><b>Pendant Design Drawing</b><span>SELECT THIS LAYER · Your artwork goes here.</span></div></div><div class="layer-row">${toolIcon('lock')}<div><b>Pendant Design Template</b><span>LOCKED · Keep the outer edge and hole unchanged.</span></div></div><p class="visual-caption">Layer → Layers and Objects</p>${keytagArt('blank')}</div>`;
 if(s.visual==='checklist')return `<ul class="check-list">${s.items.map(x=>`<li>${x}</li>`).join('')}</ul>`;
 if(s.visual==='save')return `<div><div class="file-icon">${toolIcon('file')}</div><div class="filename">${s.filename||'Alex_Makuru_Keytag.svg'}<small>File type: Inkscape SVG (*.svg)</small></div><div class="steps">${s.items.map((x,i)=>`<div class="step-row"><span class="step-number">${i+1}</span><div><b>${x}</b></div></div>`).join('')}</div></div>`;
 if(s.visual==='quote')return `<div class="sample-quote">${s.quote}</div>`;
 if(s.visual==='support')return `<div class="support-row"><div>${drawing('circle',2)}<h3>Start simple</h3><p>Use the supplied circle.<br>One main shape.<br>A few repeated details.</p></div><div>${drawing('path',2)}<h3>Extend your idea</h3><p>Draw your own paths.<br>Refine spacing and balance.<br>Explain each choice.</p></div></div>`;
 if(s.visual==='concepts')return `<div class="compare"><div class="compare-card">${svg(`<circle cx="320" cy="210" r="155" fill="#fff" stroke="#809587" stroke-width="3"/>${flower(320,225,1.7,'#849087')}${dot(320,80,12,'#fff')}<circle cx="320" cy="80" r="12" fill="none" stroke="#8d9b8d" stroke-width="2"/>`,'Concept A: large flower')}<h3>A · One focal point</h3></div><div class="compare-card">${svg(`<circle cx="320" cy="210" r="155" fill="#fff" stroke="#809587" stroke-width="3"/>${flower(260,190,1,'#849087')}${flower(370,260,.75,'#849087')}${leaf(355,330,.7,30,'#849087')}<circle cx="320" cy="80" r="12" fill="#fff" stroke="#8d9b8d" stroke-width="2"/>`,'Concept B: diagonal grouping')}<h3>B · A diagonal flow</h3></div></div>`;
 if(s.visual==='journey')return `<div class="card3">${[['plant','Observe','Choose a seasonal clue.'],['pen','Design','Make an original SVG.'],['file','Make','Teacher review, then laser.']].map(x=>`<div>${toolIcon(x[0])}<h3>${x[1]}</h3><p>${x[2]}</p></div>`).join('')}</div>`;
 if(s.visual==='tools')return `<div class="card3">${[['select','Select · S','Move and resize.'],['ellipse','Ellipse · E','Circles and ovals.'],['pen','Pen · B','Lines and paths.']].map(x=>`<div>${toolIcon(x[0])}<h3>${x[1]}</h3><p>${x[2]}</p></div>`).join('')}</div>`;
 return keytagArt();
}
