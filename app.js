'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),round=v=>Math.round(v*100)/100;
const fmt=s=>{s=Math.max(0,s);return String(Math.floor(s/60)).padStart(2,'0')+':'+(s%60).toFixed(1).padStart(4,'0')};
const toast=m=>{const e=$('#toast');e.textContent=m;e.className='show';clearTimeout(toast.i);toast.i=setTimeout(()=>e.className='',2200)};
const TR=[['none','بدون'],['fade','Fade'],['zoom','Zoom'],['slide','Slide'],['blur','Blur'],['glitch','Glitch'],['wipe','Wipe'],['flash','Flash'],['spin','Spin'],['flipx','Flip أفقي (3D)'],['flipy','Flip رأسي (3D)']];
const LOOKS=[['بدون',{br:100,cn:100,sat:100,hue:0,filter:'none',vig:0,gr:0}],['سينمائي',{br:98,cn:118,sat:88,hue:-6,filter:'sepia(.12)',vig:35,gr:12}],['دافئ',{br:104,cn:104,sat:112,hue:-10,filter:'sepia(.25)',vig:15,gr:0}],['بارد',{br:100,cn:108,sat:92,hue:12,filter:'none',vig:15,gr:0}],['قديم (Vintage)',{br:96,cn:92,sat:70,hue:0,filter:'sepia(.5)',vig:45,gr:30}],['تباين عالٍ',{br:100,cn:140,sat:120,hue:0,filter:'none',vig:0,gr:0}],['أبيض وأسود درامي',{br:100,cn:135,sat:100,hue:0,filter:'grayscale(1)',vig:40,gr:18}]];
const h2r=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),WAVE={};
const FXL=[['none','بدون'],['grayscale(1)','أبيض وأسود'],['sepia(.9)','سيبيا'],['blur(4px)','ضبابي'],['brightness(1.4)','سطوع'],['contrast(1.6)','تباين'],['saturate(2.2)','تشبّع'],['invert(1)','عكس الألوان'],['hue-rotate(90deg)','تدرّج لوني']];
const FONTS=['Tahoma','Arial','Georgia','Impact','Courier New','Segoe UI'].map(f=>[f,f]);
const ANIM=['x','y','scale','rot','opacity','rx','ry','depth','br','cn','sat','hue','blr','sw','sh','cl','cr','ct','cb','vig','gr','pp','dsh','rnd'],LW=150;
const KH=52,EASE=[['linear','ثابتة'],['in','تبدأ ببطء'],['out','تنتهي ببطء'],['inout','بطيئة في الطرفين']];let gprop=null;
const BL=[['source-over','عادي'],['screen','Screen'],['multiply','Multiply'],['overlay','Overlay'],['lighten','Lighten'],['difference','Difference']];
const FLD=[['speed','السرعة (×)',.1,8,.1,'va'],['vol','مستوى الصوت %',0,200,1,'va'],['fi','Fade In (ث)',0,10,.1,'va'],['fo','Fade Out (ث)',0,10,.1,'va'],['scale','الحجم %',5,400,1,'vits'],['x','الموضع X',-1280,1280,1,'vits'],['y','الموضع Y',-720,720,1,'vits'],['rot','التدوير °',-360,360,1,'vits'],['opacity','الشفافية %',0,100,1,'vitsf'],['depth','عمق 3D',0,80,1,'t'],['rx','إمالة 3D (أعلى/أسفل) °',-180,180,1,'vit'],['ry','دوران 3D (يمين/يسار) °',-360,360,1,'vit'],['br','السطوع %',0,300,1,'vif'],['cn','التباين %',0,300,1,'vif'],['sat','التشبّع %',0,300,1,'vif'],['hue','تدرّج اللون °',-180,180,1,'vif'],['blr','التمويه px',0,40,.5,'vitsf'],['sw','عرض الشكل',10,2000,1,'s'],['sh','ارتفاع الشكل',10,1200,1,'s'],['sk','حدود النص',0,20,1,'t'],['cl','قصّ من اليسار %',0,90,1,'vi'],['cr','قصّ من اليمين %',0,90,1,'vi'],['ct','قصّ من الأعلى %',0,90,1,'vi'],['cb','قصّ من الأسفل %',0,90,1,'vi'],['vig','فينيت (تعتيم الأطراف) %',0,100,1,'vi'],['gr','حبيبات الفيلم %',0,100,1,'vi'],['cks','حساسية الكروما كي',1,100,1,'vi'],['pp','المنظور 3D %',0,100,1,'vi'],['dsh','ظل %',0,60,1,'vi'],['rnd','تدوير الحواف %',0,100,1,'vi']];
let P,media={},sel=null,t=0,playing=false,pps=60,els={},actx,adest,lastTs=0,exporting=false,cancel=false,onEnd=null,hist=[],saveT,drag=null;
const cv=$('#cv'),cx=cv.getContext('2d'),tls=$('#tls');
const BND={},OC=document.createElement('canvas'),NOISE=(()=>{const n=document.createElement('canvas');n.width=n.height=256;const g=n.getContext('2d'),d=g.createImageData(256,256);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}g.putImageData(d,0,0);return n})();

/* ---------- storage (IndexedDB) ---------- */
const idb=new Promise((res,rej)=>{const r=indexedDB.open('cutlab',1);r.onupgradeneeded=()=>{r.result.createObjectStore('projects',{keyPath:'id'});r.result.createObjectStore('blobs')};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const db=(st,mode,fn)=>idb.then(d=>new Promise((res,rej)=>{const q=fn(d.transaction(st,mode).objectStore(st));q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)}));
async function save(quiet){if(!P)return;P.updated=Date.now();P.name=$('#pname').value||P.name;const thumb=!exporting?cv.toDataURL('image/jpeg',.4):'';await db('projects','readwrite',s=>s.put({id:P.id,name:P.name,updated:P.updated,thumb,data:P}));if(!quiet)toast('تم حفظ المشروع')}
async function loadRecents(){const all=await db('projects','readonly',s=>s.getAll());all.sort((a,b)=>b.updated-a.updated);
 $('#recents').innerHTML=all.length?all.map(p=>`<div class="rc" data-id="${p.id}"><img src="${p.thumb||''}" alt=""><b>${esc(p.name)}</b><small>${new Date(p.updated).toLocaleString('ar-EG')}</small><button class="x" data-del="${p.id}">✕</button></div>`).join(''):'<p class="hint">لا توجد مشاريع بعد. ابدأ بمشروع جديد.</p>'}
async function openProject(id){const rec=await db('projects','readonly',s=>s.get(id));if(!rec)return;P=rec.data;media={};
 for(const m of P.media){const b=await db('blobs','readonly',s=>s.get(P.id+':'+m.id));if(b){media[m.id]={...m,url:URL.createObjectURL(b)};if(m.kind!=='image')peaks(m.id,b)}}enter()}

/* ---------- project ---------- */
const mkT=(type,name)=>({id:uid(),type,name,vis:true,mute:false});
function newProject(){P={id:uid(),name:'مشروع جديد',w:1280,h:720,tracks:[mkT('video','فيديو 1')],clips:[],media:[],updated:0};media={};enter()}
function enter(){P.clips.forEach(c=>{if(c.cn==null){c.cn=100;if(c.ct>=100){c.ct=0;if(c.kf&&c.kf.ct){c.kf.cn=c.kf.ct;delete c.kf.ct}}}});stop();els={};sel=null;t=0;hist=[JSON.stringify(P)];$('#welcome').hidden=true;$('#app').hidden=false;$('#pname').value=P.name;setSize();mediaList();refresh()}
const total=()=>P.clips.reduce((m,c)=>Math.max(m,c.start+c.dur),0);
const trk=c=>P.tracks.find(x=>x.id===c.track);
const commit=()=>{hist.push(JSON.stringify(P));if(hist.length>60)hist.shift();clearTimeout(saveT);saveT=setTimeout(()=>save(true),900)};
const refresh=()=>{drawTL();inspect();frame()};
const change=()=>{commit();refresh()};
function undo(){if(hist.length<2)return toast('لا يوجد ما يمكن التراجع عنه');hist.pop();P=JSON.parse(hist[hist.length-1]);sel=sel&&P.clips.find(c=>c.id===sel.id)||null;setSize();refresh()}
const rmEl=c=>{const e=els[c.id];if(e){e.pause&&e.pause();delete els[c.id]}};

/* ---------- media ---------- */
const kindOf=f=>f.type.startsWith('video')||/\.(mp4|m4v|mov|webm|mkv|avi|wmv|flv|3gp|ogv|mpe?g|mts|m2ts)$/i.test(f.name)?'video':f.type.startsWith('image')||/\.(jpe?g|png|gif|webp|bmp|svg|avif)$/i.test(f.name)?'image':f.type.startsWith('audio')||/\.(mp3|wav|aac|m4a|ogg|flac|opus|wma)$/i.test(f.name)?'audio':null;
async function importFiles(files){const ids=[];for(const f of files){const k=kindOf(f);if(!k)continue;
 const id=uid(),url=URL.createObjectURL(f);let dur=5;
 if(k!=='image')dur=await new Promise(r=>{const e=document.createElement(k==='video'?'video':'audio');e.preload='metadata';e.onloadedmetadata=()=>r(isFinite(e.duration)&&e.duration>0?e.duration:5);e.onerror=()=>r(0);e.src=url});
 if(!dur){toast('تعذّر قراءة «'+f.name+'»: الكودك غير مدعوم في المتصفح. حوّله إلى MP4 (H.264) ثم أعد الاستيراد.');continue}
 const m={id,name:f.name,kind:k,dur};media[id]={...m,url};P.media.push(m);if(k!=='image')peaks(id,f);db('blobs','readwrite',s=>s.put(f,P.id+':'+id));ids.push(id)}
 mediaList();commit();if(ids.length)toast('تم استيراد '+ids.length+' ملف');return ids}
function mediaList(){$('#mlist').innerHTML=P.media.filter(m=>media[m.id]).map(m=>{const u=media[m.id].url,th=m.kind==='image'?`<img src="${u}">`:m.kind==='video'?`<video src="${u}#t=0.5" preload="metadata" muted></video>`:'<span>♪</span>';
 return `<div class="mi" draggable="true" data-id="${m.id}">${th}<b>${esc(m.name)}</b><small>${m.kind==='image'?'صورة':fmt(m.dur)}</small><button data-ma="${m.id}">+</button></div>`}).join('')||'<p class="hint">استورد ملفاتك أو اسحبها إلى النافذة.</p>'}
const TN={video:'فيديو',audio:'صوت',text:'نص',image:'صورة'},TI={video:'🎬',audio:'🔊',text:'🔤',image:'🖼'};
function addTrack(type='video'){const tr=mkT(type,TN[type]+' '+(P.tracks.filter(x=>x.type===type).length+1));type==='audio'?P.tracks.push(tr):P.tracks.unshift(tr);return tr}
const tOf=k=>k==='audio'?'audio':k==='image'?'image':k==='text'||k==='shape'||k==='fxlayer'?'text':'video',compat=(c,tr)=>tr.type==='any'||tr.type===tOf(c.kind);
const baseClip=(o)=>({id:uid(),start:0,dur:5,in:0,speed:1,rev:false,vol:100,mute:false,fi:0,fo:0,x:0,y:0,scale:100,rot:0,opacity:100,tin:'none',tout:'none',tr:.6,filter:'none',kf:{},rx:0,ry:0,depth:0,dcolor:'#2563eb',br:100,cn:100,sat:100,hue:0,blr:0,sw:400,sh:240,sk:0,pp:50,dsh:0,rnd:0,vig:0,gr:0,ck:false,ckc:'#00ff00',cks:40,cl:0,cr:0,ct:0,cb:0,scolor:'#000000',fh:false,fv:false,blend:'source-over',typew:false,shape:'rect',...o});
function addMediaClip(mid,tr,start=t){const m=media[mid];if(!m)return;if(!tr||!compat({kind:m.kind},tr))tr=P.tracks.find(x=>compat({kind:m.kind},x))||addTrack(tOf(m.kind));
 sel=baseClip({track:tr.id,start:Math.max(0,start),dur:m.kind==='image'?5:m.dur,kind:m.kind,mid,name:m.name});P.clips.push(sel);change()}
function addText(i){const pr=[['عنوان رئيسي',90,0],['عنوان فرعي',50,120],['نص سفلي',36,280],['نص 3D',110,0,{depth:28,rx:-12,ry:-25}],['نص 3D دوّار',110,0,{depth:28,kf:{ry:[[0,0],[4,360]]}}]][i];let tr=P.tracks.find(x=>x.type==='text'||x.type==='any')||addTrack('text');
 sel=baseClip({track:tr.id,start:t,dur:4,kind:'text',text:pr[0],font:'Tahoma',size:pr[1],color:'#ffffff',align:'center',y:pr[2],tin:'fade',tout:'fade',...(pr[3]||{})});P.clips.push(sel);change()}

/* ---------- edit ops ---------- */
function split(){const c=sel;if(!c||t<=c.start+.05||t>=c.start+c.dur-.05)return toast('حدّد مقطعاً وضع المؤشر داخله');const lt=t-c.start,d=JSON.parse(JSON.stringify(c));d.id=uid();d.start=t;d.dur=c.dur-lt;
 if(c.kind==='video'||c.kind==='audio'){if(c.rev)c.in=c.in+d.dur*c.speed;else d.in=c.in+lt*c.speed}
 Object.keys(d.kf).forEach(p=>d.kf[p]=d.kf[p].map(([a,v,s])=>[a-lt,v,s]));c.dur=lt;c.tout='none';d.tin='none';P.clips.push(d);sel=d;change()}
function dup(){if(!sel)return;const d=JSON.parse(JSON.stringify(sel));d.id=uid();d.start=sel.start+sel.dur;P.clips.push(d);sel=d;change()}
function del(){if(!sel)return toast('حدّد مقطعاً أولاً');rmEl(sel);P.clips=P.clips.filter(c=>c!==sel);sel=null;change()}
function join(){const c=sel;if(!c)return toast('حدّد مقطعاً أولاً');const n=P.clips.filter(x=>x.track===c.track&&x!==c&&x.start>=c.start+c.dur-.001).sort((a,b)=>a.start-b.start)[0];if(!n)return toast('لا يوجد مقطع تالٍ على نفس المسار');
 const gap=n.start-(c.start+c.dur);
 if(n.mid&&n.mid===c.mid&&gap<.05&&c.speed===n.speed&&!c.rev&&!n.rev&&Math.abs(c.in+c.dur*c.speed-n.in)<.05){c.dur=n.start+n.dur-c.start;rmEl(n);P.clips=P.clips.filter(x=>x!==n);toast('تم دمج المقطعين')}else{n.start=c.start+c.dur;toast('تم ضمّ المقطع التالي')}change()}

/* ---------- playback / render ---------- */
const gv=(c,p,lt)=>{const k=c.kf[p];if(!k||!k.length)return c[p];k.sort((a,b)=>a[0]-b[0]);if(lt<=k[0][0])return k[0][1];const l=k[k.length-1];if(lt>=l[0])return l[1];for(let i=1;i<k.length;i++)if(lt<=k[i][0]){const a=k[i-1],b=k[i];let u=(lt-a[0])/(b[0]-a[0]);const va=a[2]==null?1:a[2],vb=b[2]==null?1:b[2],u2=u*u,u3=u2*u;u=(u3-2*u2+u)*va+(3*u2-2*u3)+(u3-u2)*vb;return a[1]+(b[1]-a[1])*u}};
const hasKf=(c,p)=>(c.kf[p]||[]).some(k=>Math.abs(k[0]-(t-c.start))<.06);
const active=()=>P.clips.filter(c=>t>=c.start&&t<c.start+c.dur-1e-6);
function initAudio(){if(!actx){actx=new(window.AudioContext||window.webkitAudioContext)();adest=actx.createMediaStreamDestination()}}
function el(c){if(els[c.id])return els[c.id];const m=media[c.mid];if(c.kind==='image'){const i=new Image();i.src=m.url;i.onload=()=>playing||render();return els[c.id]=i}
 const e=document.createElement(c.kind==='video'?'video':'audio');e.src=m.url;e.preload='auto';e.playsInline=true;e.addEventListener('seeked',()=>{if(!playing)render()});
 try{initAudio();const s=actx.createMediaElementSource(e),g=actx.createGain();s.connect(g);g.connect(actx.destination);g.connect(adest);e._g=g}catch{}return els[c.id]=e}
function sync(){const act=new Set(active());for(const c of P.clips){if(c.kind!=='video'&&c.kind!=='audio')continue;let e=els[c.id];if(!act.has(c)){if(e&&!e.paused)e.pause();continue}
 e=el(c);const tr=trk(c),lt=t-c.start,sp=c.speed,m=media[c.mid];let want=c.in+(c.rev?(c.dur-lt)*sp:lt*sp);want=Math.max(0,Math.min(want,m.dur-.05));
 const aud=tr.mute||c.mute||(c.kind==='audio'&&!tr.vis)?0:1,fi=c.fi?Math.min(1,lt/c.fi):1,fo=c.fo?Math.min(1,(c.dur-lt)/c.fo):1,v=c.vol/100*fi*fo*aud;
 if(e._g)e._g.gain.value=v;else e.volume=Math.min(1,v);e.playbackRate=Math.min(16,Math.max(.0625,sp));
 if(playing&&!c.rev){if(Math.abs(e.currentTime-want)>.3)e.currentTime=want;if(e.paused)e.play().catch(()=>{})}else{if(!e.paused)e.pause();if(Math.abs(e.currentTime-want)>.04)e.currentTime=want}}}
function draw(c,W,H,k){const lt=t-c.start;let x=gv(c,'x',lt),y=gv(c,'y',lt),s=gv(c,'scale',lt)/100,r=gv(c,'rot',lt),o=gv(c,'opacity',lt)/100,bl=0,gl=0,wp=1,wd=-1,fl=0,fry=0,frx=0;
 const fx=(ty,p,d)=>{if(ty==='fade')o*=p;else if(ty==='zoom'){s*=.4+.6*p;o*=p}else if(ty==='slide')x+=d*(1-p)*P.w;else if(ty==='blur'){bl=(1-p)*30;o*=.2+.8*p}else if(ty==='glitch')gl=Math.max(gl,1-p);else if(ty==='wipe'){wp=p;wd=d}else if(ty==='flash')fl=Math.max(fl,1-p);else if(ty==='spin'){r+=d*(1-p)*270;s*=.3+.7*p;o*=p}else if(ty==='flipx')fry=d*(1-p)*90;else if(ty==='flipy')frx=d*(1-p)*90};
 if(c.tin!=='none'&&lt<c.tr)fx(c.tin,lt/c.tr,-1);if(c.tout!=='none'&&c.dur-lt<c.tr)fx(c.tout,(c.dur-lt)/c.tr,1);
 cx.save();if(wp<1){cx.beginPath();wd<0?cx.rect(0,0,W*wp,H):cx.rect(W*(1-wp),0,W*wp,H);cx.clip()}cx.globalAlpha=Math.max(0,Math.min(1,o));cx.translate(W/2+x*k,H/2+y*k);cx.rotate(r*Math.PI/180);cx.scale(s*(c.fh?-1:1),s*(c.fv?-1:1));cx.globalCompositeOperation=c.blend||'source-over';
 const nv=(p,d)=>{const v=gv(c,p,lt);return v==null?d:v},ad=[];if(c.filter&&c.filter!=='none')ad.push(c.filter);
 if(nv('br',100)!==100)ad.push(`brightness(${nv('br',100)}%)`);if(nv('cn',100)!==100)ad.push(`contrast(${nv('cn',100)}%)`);if(nv('sat',100)!==100)ad.push(`saturate(${nv('sat',100)}%)`);if(nv('hue',0))ad.push(`hue-rotate(${nv('hue',0)}deg)`);if(nv('blr',0))ad.push(`blur(${nv('blr',0)*k}px)`);
 if(fl>0)ad.push(`brightness(${1+fl*4})`);const base=ad.join(' ');
 if(c.kind==='fxlayer'){cx.filter=base||'none';cx.drawImage(cv,0,0,W,H);delete BND[c.id];cx.restore();return}
 const paint=dx=>{if(c.kind==='shape'){const w=nv('sw',400),h=nv('sh',240);BND[c.id]=[W/2+x*k,H/2+y*k,w*k*s/2,h*k*s/2,r];cx.save();cx.scale(Math.max(.02,Math.cos(fry*Math.PI/180)),Math.max(.02,Math.cos(frx*Math.PI/180)));cx.fillStyle=c.color||'#ffffff';cx.beginPath();if(c.shape==='circle')cx.ellipse(dx,0,w*k/2,h*k/2,0,0,7);else if(c.shape==='round')cx.roundRect(-w*k/2+dx,-h*k/2,w*k,h*k,Math.min(w,h)*k*.2);else cx.rect(-w*k/2+dx,-h*k/2,w*k,h*k);cx.fill();cx.restore();return}if(c.kind==='text'){cx.font=`700 ${c.size*k}px ${c.font}`;cx.fillStyle=c.color;cx.textAlign=c.align;cx.textBaseline='middle';cx.shadowColor='rgba(0,0,0,.55)';cx.shadowBlur=8*k;
  const L=(c.typew?c.text.slice(0,Math.ceil(c.text.length*Math.min(1,lt/Math.max(.1,c.dur*.6)))):c.text).split('\n'),lh=c.size*k*1.25,bx=c.align==='center'?0:c.align==='left'?-W*.4:W*.4;const tw=Math.max(10,...c.text.split('\n').map(l=>cx.measureText(l).width));BND[c.id]=[W/2+x*k+(c.align==='center'?0:(c.align==='left'?bx+tw/2:bx-tw/2)*s),H/2+y*k,tw*s/2,L.length*lh*s/2,r];
  const rx=((gv(c,'rx',lt)||0)+frx)*Math.PI/180,ry=((gv(c,'ry',lt)||0)+fry)*Math.PI/180,dp=gv(c,'depth',lt)||0;let sx=Math.cos(ry),sy=Math.cos(rx);if(Math.abs(sx)<.02)sx=.02;if(Math.abs(sy)<.02)sy=.02;
  cx.save();cx.scale(sx,sy);const ox=(.6+Math.sin(ry)*.9)*k,oy=(.6-Math.sin(rx)*.9)*k,put=(p,q,st)=>L.forEach((l,i)=>{const X=bx+dx+p,Y=(i-(L.length-1)/2)*lh+q;if(st&&c.sk>0){cx.lineWidth=c.sk*k*2;cx.lineJoin='round';cx.strokeStyle=c.scolor||'#000';cx.strokeText(l,X,Y)}cx.fillText(l,X,Y)});
  if(dp>0){const sc=cx.shadowColor;cx.shadowColor='transparent';cx.fillStyle=c.dcolor||'#2563eb';for(let i=Math.round(dp);i>0;i--)put(ox*i,oy*i);cx.shadowColor=sc;cx.fillStyle=c.color}
  put(0,0,1);cx.restore();return}
  const e=el(c),sw=e.videoWidth||e.naturalWidth,sh=e.videoHeight||e.naturalHeight;if(!sw||e.readyState===0)return;const f=Math.min(W/sw,H/sh);const pl=Math.max(0,Math.min(90,nv('cl',0))),pr=Math.max(0,Math.min(95-pl,nv('cr',0))),pt=Math.max(0,Math.min(90,nv('ct',0))),pb=Math.max(0,Math.min(95-pt,nv('cb',0))),cL=pl/100,cR=pr/100,cT=pt/100,cB=pb/100,dw=sw*f,dh=sh*f,ox=(cL-cR)/2*dw*s,oy=(cT-cB)/2*dh*s,rr=r*Math.PI/180;
  BND[c.id]=[W/2+x*k+ox*Math.cos(rr)-oy*Math.sin(rr),H/2+y*k+ox*Math.sin(rr)+oy*Math.cos(rr),dw*(1-cL-cR)*s/2,dh*(1-cT-cB)*s/2,r,dw*s,dh*s];
  let src=e,sx0=sw*cL,sy0=sh*cT,sw0=sw*(1-cL-cR),sh0=sh*(1-cT-cB);
  if(c.ck){const ow=Math.max(2,Math.min(640,Math.round(sw0))),oh=Math.max(2,Math.round(ow*sh0/sw0));OC.width=ow;OC.height=oh;const og=OC.getContext('2d',{willReadFrequently:true});og.drawImage(e,sx0,sy0,sw0,sh0,0,0,ow,oh);const id=og.getImageData(0,0,ow,oh),d=id.data,[kr,kg,kb]=h2r(c.ckc||'#00ff00'),th=(c.cks==null?40:c.cks)*4.4;
   for(let i=0;i<d.length;i+=4){const dr=d[i]-kr,dg=d[i+1]-kg,db=d[i+2]-kb,ds=Math.sqrt(dr*dr+dg*dg+db*db);if(ds<th)d[i+3]=0;else if(ds<th*1.4)d[i+3]=d[i+3]*(ds-th)/(th*.4)}og.putImageData(id,0,0);src=OC;sx0=0;sy0=0;sw0=ow;sh0=oh}
  const rx0=-dw/2+dw*cL+dx,ry0=-dh/2+dh*cT,rw0=dw*(1-cL-cR),rh0=dh*(1-cT-cB);const rxa=(nv('rx',0)+frx)*Math.PI/180,rya=(nv('ry',0)+fry)*Math.PI/180,d3=c.kind!=='text'&&(Math.abs(rxa)>.001||Math.abs(rya)>.001);
  if(d3){const bb=draw3D(src,sx0,sy0,sw0,sh0,rx0,ry0,rw0,rh0,rxa,rya,Math.max(dw,dh)*(3.5-nv('pp',50)*.03)),mx=(bb[0]+bb[1])/2*s,my=(bb[2]+bb[3])/2*s;BND[c.id]=[W/2+x*k+mx*Math.cos(rr)-my*Math.sin(rr),H/2+y*k+mx*Math.sin(rr)+my*Math.cos(rr),(bb[1]-bb[0])*s/2,(bb[3]-bb[2])*s/2,r,dw*s,dh*s]}
  else{const rd=nv('rnd',0),ds=nv('dsh',0);cx.save();if(ds>0){cx.shadowColor='rgba(0,0,0,.65)';cx.shadowBlur=ds*k;cx.shadowOffsetX=cx.shadowOffsetY=ds*.4*k}if(rd>0){cx.beginPath();cx.roundRect(rx0,ry0,rw0,rh0,Math.min(rw0,rh0)*rd/200);cx.clip()}cx.drawImage(src,sx0,sy0,sw0,sh0,rx0,ry0,rw0,rh0);cx.restore()}
  const vgn=nv('vig',0),gn=nv('gr',0);if(!d3&&(vgn>0||gn>0)){cx.save();cx.filter='none';cx.beginPath();cx.rect(rx0,ry0,rw0,rh0);cx.clip();
   if(vgn>0){const g=cx.createRadialGradient(rx0+rw0/2,ry0+rh0/2,Math.min(rw0,rh0)*.25,rx0+rw0/2,ry0+rh0/2,Math.max(rw0,rh0)*.7);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${vgn/100})`);cx.fillStyle=g;cx.fillRect(rx0,ry0,rw0,rh0)}
   if(gn>0){cx.globalAlpha*=gn/180;cx.fillStyle=cx.createPattern(NOISE,'repeat');cx.translate(Math.random()*256,Math.random()*256);cx.fillRect(rx0-256,ry0-256,rw0+512,rh0+512)}cx.restore()}};
 cx.filter=(base+(bl?` blur(${bl*k}px)`:'')).trim()||'none';
 if(gl>0){cx.filter=(base+' hue-rotate(140deg) saturate(3)').trim();paint((Math.random()-.5)*90*gl*k);cx.filter=base||'none'}
 paint(gl>0?(Math.random()-.5)*20*gl*k:0);cx.restore()}
function render(){const W=cv.width,H=cv.height,k=W/P.w;cx.fillStyle=P.bg||'#000';cx.fillRect(0,0,W,H);const act=active();
 [...P.tracks].reverse().forEach(tr=>{if(!tr.vis)return;const L=layout(tr.id);act.filter(c=>c.track===tr.id&&c.kind!=='audio').sort((a,b)=>L.map[b.id]-L.map[a.id]).forEach(c=>draw(c,W,H,k))});
 if(sel&&!exporting&&act.includes(sel)&&BND[sel.id]){const b=BND[sel.id];cx.save();cx.translate(b[0],b[1]);cx.rotate(b[4]*Math.PI/180);cx.strokeStyle='#6ea8ff';cx.lineWidth=2*W/1280;cx.setLineDash([8,6]);cx.strokeRect(-b[2],-b[3],b[2]*2,b[3]*2);cx.setLineDash([]);if(sel.kind==='video'||sel.kind==='image'){cx.fillStyle='#fff';const q=7*W/1280;[[0,-b[3]],[0,b[3]],[-b[2],0],[b[2],0]].forEach(([hx,hy])=>cx.fillRect(hx-q,hy-q,q*2,q*2))}cx.restore()}}
function ui(){$('#tc').textContent=fmt(t)+' / '+fmt(total());movePH();if(exporting)$('#xprog i').style.width=Math.min(100,t/total()*100)+'%';
 if(sel){$$('#insp [data-p]').forEach(x=>{const p=x.dataset.p;if(ANIM.includes(p)&&sel.kf[p]&&sel.kf[p].length&&document.activeElement!==x)x.value=round(gv(sel,p,t-sel.start))});$$('#insp .kb').forEach(b=>b.classList.toggle('on',hasKf(sel,b.dataset.kf)))}}
let showG=false;function guides(){if(!showG||exporting)return;const W=cv.width,H=cv.height;cx.save();cx.strokeStyle='rgba(255,255,255,.6)';cx.lineWidth=Math.max(1,W/1280);cx.setLineDash([6,5]);[.9,.93].forEach(m=>cx.strokeRect(W*(1-m)/2,H*(1-m)/2,W*m,H*m));cx.beginPath();[1/3,2/3].forEach(f=>{cx.moveTo(W*f,0);cx.lineTo(W*f,H);cx.moveTo(0,H*f);cx.lineTo(W,H*f)});cx.moveTo(W/2-10,H/2);cx.lineTo(W/2+10,H/2);cx.moveTo(W/2,H/2-10);cx.lineTo(W/2,H/2+10);cx.stroke();cx.restore()}
function frame(){if(!P)return;sync();render();guides();ui();drawGraph()}
function tick(ts){if(!playing)return;t+=(ts-lastTs)/1000;lastTs=ts;if(t>=total()){t=total();frame();stop();if(onEnd){const f=onEnd;onEnd=null;f()}return}frame();requestAnimationFrame(tick)}
function play(force){if(!total())return toast('أضف مقاطع إلى المخطط الزمني أولاً');if(playing&&!force)return stop();initAudio();actx.resume();if(t>=total()-.05)t=0;playing=true;lastTs=performance.now();requestAnimationFrame(tick);$('#bPlay').textContent='⏸'}
function stop(){playing=false;$('#bPlay').textContent='▶';Object.values(els).forEach(e=>e.pause&&e.pause())}

/* ---------- timeline ---------- */
const movePH=()=>{const p=$('#ph');if(p)p.style.left=LW+t*pps+'px'};
function drawTL(){const len=Math.max(total()+10,30),w=len*pps,st=pps>=40?1:5;
 let h=`<div class="row rul"><div class="hd"></div><div class="lane" id="ruler" style="width:${w}px">`;
 for(let s=0;s<=len;s+=st)h+=`<i style="left:${s*pps}px">${s%(st*5)===0?fmt(s).slice(0,5):''}</i>`;h+=(P.markers||[]).map(m=>`<em style="left:${m*pps}px" title="${fmt(m)}"></em>`).join('')+'</div></div>';
 P.tracks.forEach(tr=>{const LY=layout(tr.id);h+=`<div class="row" style="height:${LY.n*46}px"><div class="hd ${tr.type}"><b>${TI[tr.type]||''} ${esc(tr.name)}</b><span><button data-th="vis" data-i="${tr.id}" class="${tr.vis?'':'off'}" title="إظهار/إخفاء">👁</button>${tr.type==='video'||tr.type==='audio'||tr.type==='any'?`<button data-th="mute" data-i="${tr.id}" class="${tr.mute?'off':''}" title="كتم">🔊</button>`:''}<button data-th="up" data-i="${tr.id}">▲</button><button data-th="dn" data-i="${tr.id}">▼</button><button data-th="rm" data-i="${tr.id}">✕</button></span></div><div class="lane" data-track="${tr.id}" style="width:${w}px">`;
  P.clips.filter(c=>c.track===tr.id).forEach(c=>{h+=`<div class="clip k-${c.kind}${sel&&sel.id===c.id?' sel':''}" data-id="${c.id}" style="left:${c.start*pps}px;width:${Math.max(6,c.dur*pps)}px;top:${LY.map[c.id]*46+4}px;height:38px;bottom:auto"><u class="h l"></u>${waveSvg(c)}<span>${esc(c.kind==='text'?c.text:c.name)}</span>${Object.values(c.kf).flat().map(k=>`<s style="left:${k[0]*pps}px"></s>`).join('')}<u class="h r"></u></div>`});h+='</div></div>'});
 $('#tlin').innerHTML=h+'<div id="ph"></div>';movePH()}
function seekTo(e){t=Math.max(0,(e.clientX-tls.getBoundingClientRect().left+tls.scrollLeft-LW)/pps);frame()}
function snapT(s,c){const th=8/pps,pts=[t,...P.clips.filter(x=>x!==c).flatMap(x=>[x.start,x.start+x.dur])];for(const p of pts){if(Math.abs(s-p)<th)return p;if(Math.abs(s+c.dur-p)<th)return p-c.dur}return s}
tls.addEventListener('pointerdown',e=>{if(!P)return;const ce=e.target.closest('.clip');
 if(ce){const c=P.clips.find(x=>x.id===ce.dataset.id);sel=c;$$('.clip').forEach(x=>x.classList.toggle('sel',x===ce));inspect();const cl=e.target.classList;
  drag={c,ce,mode:cl.contains('l')?'l':cl.contains('r')?'r':'m',x0:e.clientX,s:c.start,d:c.dur,i:c.in};tls.setPointerCapture(e.pointerId);frame();return}
 const ln=e.target.closest('.lane');if(ln){if(ln.dataset.track&&sel){sel=null;$$('.clip.sel').forEach(x=>x.classList.remove('sel'));inspect()}drag={mode:'seek'};tls.setPointerCapture(e.pointerId);seekTo(e)}});
tls.addEventListener('pointermove',e=>{if(!drag)return;if(drag.mode==='seek')return seekTo(e);const {c,ce}=drag,dx=(e.clientX-drag.x0)/pps,av=c.kind==='video'||c.kind==='audio';
 if(drag.mode==='m'){c.start=snapT(Math.max(0,drag.s+dx),c);ce.style.left=c.start*pps+'px';
  const ln=document.elementsFromPoint(e.clientX,e.clientY).find(x=>x.classList&&x.classList.contains('lane')&&x.dataset.track);
  if(ln&&ln.dataset.track!==c.track){const tr=P.tracks.find(x=>x.id===ln.dataset.track);if(compat(c,tr)){c.track=tr.id;ln.appendChild(ce)}}}
 else if(drag.mode==='l'){let d=Math.min(dx,drag.d-.1);if(av)d=Math.max(d,-drag.i/c.speed);d=Math.max(d,-drag.s);c.start=drag.s+d;c.dur=drag.d-d;if(av)c.in=drag.i+d*c.speed;ce.style.left=c.start*pps+'px';ce.style.width=c.dur*pps+'px'}
 else{let d=Math.max(drag.d+dx,.1);if(av)d=Math.min(d,(media[c.mid].dur-c.in)/c.speed);c.dur=d;ce.style.width=d*pps+'px'}frame()});
tls.addEventListener('pointerup',()=>{if(drag&&drag.mode!=='seek')change();drag=null});
$('#tlin').addEventListener('click',e=>{const b=e.target.closest('[data-th]');if(!b)return;const i=P.tracks.findIndex(x=>x.id===b.dataset.i),tr=P.tracks[i],a=b.dataset.th;
 if(a==='vis')tr.vis=!tr.vis;else if(a==='mute')tr.mute=!tr.mute;
 else if(a==='up'&&i>0)[P.tracks[i-1],P.tracks[i]]=[tr,P.tracks[i-1]];else if(a==='dn'&&i<P.tracks.length-1)[P.tracks[i+1],P.tracks[i]]=[tr,P.tracks[i+1]];
 else if(a==='rm'){if(P.clips.some(c=>c.track===tr.id)&&!confirm('سيتم حذف كل مقاطع هذا المسار. متابعة؟'))return;P.clips.filter(c=>c.track===tr.id).forEach(rmEl);P.clips=P.clips.filter(c=>c.track!==tr.id);P.tracks.splice(i,1);if(sel&&!P.clips.includes(sel))sel=null}change()});

/* ---------- inspector ---------- */
function inspect(){const box=$('#insp'),c=sel;if(!c){box.innerHTML='<p class="hint">حدّد مقطعاً على المخطط الزمني لتعديل خصائصه.</p>';return}
 const opt=(a,v)=>a.map(([x,y])=>`<option value="${esc(x)}"${x===v?' selected':''}>${y}</option>`).join('');
 let h=`<h4>${esc(c.kind==='text'?'نص':c.name)}</h4>`;
 if(c.kind==='text')h+=`<label>النص<textarea data-p="text">${esc(c.text)}</textarea></label><div class="g2"><label>الخط<select data-p="font">${opt(FONTS,c.font)}</select></label><label>الحجم<input type="number" data-p="size" value="${c.size}"></label><label>اللون<input type="color" data-p="color" value="${c.color}"></label><label>لون العمق 3D<input type="color" data-p="dcolor" value="${c.dcolor||'#2563eb'}"></label><label>لون الحدود<input type="color" data-p="scolor" value="${c.scolor||'#000000'}"></label><label class="ck"><input type="checkbox" data-p="typew"${c.typew?' checked':''}> كتابة تدريجية</label><label>المحاذاة<select data-p="align">${opt([['left','يسار'],['center','وسط'],['right','يمين']],c.align)}</select></label></div>`;
 if(c.kind==='shape')h+=`<div class="g2"><label>الشكل<select data-p="shape">${opt([['rect','مستطيل'],['round','مدوّر'],['circle','بيضاوي']],c.shape)}</select></label><label>اللون<input type="color" data-p="color" value="${c.color}"></label></div>`;
 FLD.forEach(([p,l,mn,mx,st,f])=>{if(!f.includes(c.kind[0]))return;const v=gv(c,p,t-c.start)??({br:100,cn:100,sat:100,hue:0,blr:0,sw:400,sh:240,sk:0,cks:40,pp:50})[p]??0;
  h+=`<div class="fld"><span>${l}</span>${ANIM.includes(p)?`<button class="kb${hasKf(c,p)?' on':''}" data-kf="${p}" title="إضافة/حذف مفتاح حركة عند المؤشر">◆</button>`:''}<input type="range" data-p="${p}" min="${mn}" max="${mx}" step="${st}" value="${v}"><input type="number" data-p="${p}" min="${mn}" max="${mx}" step="${st}" value="${round(v)}"></div>`});
 if(c.kind!=='audio')h+=`<div class="g2"><label class="ck"><input type="checkbox" data-p="fh"${c.fh?' checked':''}> قلب أفقي</label><label class="ck"><input type="checkbox" data-p="fv"${c.fv?' checked':''}> قلب رأسي</label></div><label>وضع الدمج<select data-p="blend">${opt(BL,c.blend||'source-over')}</select></label>${c.kind==='video'||c.kind==='image'||c.kind==='text'?`<div class="p3"><span>زاوية 3D:</span><button data-d3="0,0">مسطّح</button><button data-d3="0,-35">يمين</button><button data-d3="0,35">يسار</button><button data-d3="-30,0">أعلى</button><button data-d3="30,0">أسفل</button><button data-d3="-20,-30">ركن</button></div><p class="hint">أو Ctrl + اسحب على العنصر في المعاينة للتدوير</p>`:''}${c.kind==='video'||c.kind==='image'?`<div class="g2"><label class="ck"><input type="checkbox" data-p="ck"${c.ck?' checked':''}> كروما كي</label><label>لون المفتاح<input type="color" data-p="ckc" value="${c.ckc||'#00ff00'}"></label></div>`:''}`;
 if(c.kind!=='audio')h+='<div class="pad"><button data-nd="0,-1" title="أعلى">⬆</button><button data-nd="-1,0" title="يسار">⬅</button><button data-nd="0,0" title="توسيط">⌖</button><button data-nd="1,0" title="يمين">➡</button><button data-nd="0,1" title="أسفل">⬇</button></div>';
 if(c.kind==='video'||c.kind==='audio')h+=`<label class="ck"><input type="checkbox" data-p="mute"${c.mute?' checked':''}> كتم الصوت</label>`;
 if(c.kind==='video')h+=`<label class="ck"><input type="checkbox" data-p="rev"${c.rev?' checked':''}> عكس الفيديو</label>`;
 if(c.kind!=='audio')h+=`<div class="g2"><label>انتقال الدخول<select data-p="tin">${opt(TR,c.tin)}</select></label><label>انتقال الخروج<select data-p="tout">${opt(TR,c.tout)}</select></label><label>مدة الانتقال<input type="number" data-p="tr" step=".1" min=".1" max="3" value="${c.tr}"></label>${c.kind!=='text'?`<label>التأثير<select data-p="filter">${opt(FXL,c.filter)}</select></label>`:''}</div>`;
 box.innerHTML=h}
function setProp(p,v){const c=sel;if(!c)return;
 if(p==='speed'){v=Math.max(.1,v||1);const span=c.dur*c.speed;c.speed=v;c.dur=Math.max(.1,span/v);drawTL()}
 else if(ANIM.includes(p)&&c.kf[p]&&c.kf[p].length){const lt=t-c.start,a=c.kf[p],k=a.find(k=>Math.abs(k[0]-lt)<.06);k?k[1]=v:a.push([lt,v])}
 else c[p]=v;if(p==='text'||p==='ease')drawTL();frame()}
$('#insp').addEventListener('input',e=>{const x=e.target,p=x.dataset.p;if(!p)return;const v=x.type==='checkbox'?x.checked:(x.type==='number'||x.type==='range')?+x.value:x.value;setProp(p,v);
 $$(`#insp [data-p="${p}"]`).forEach(y=>{if(y!==x&&y.type!=='checkbox')y.value=v})});
$('#insp').addEventListener('change',()=>commit());
$('#insp').addEventListener('click',e=>{const b=e.target.closest('[data-kf]');if(!b||!sel)return;const p=b.dataset.kf,lt=t-sel.start;gprop=p;gpOff=false;if(lt<0||lt>sel.dur)return toast('ضع المؤشر داخل المقطع');
 const a=sel.kf[p]||(sel.kf[p]=[]),i=a.findIndex(k=>Math.abs(k[0]-lt)<.06);if(i>=0){a.splice(i,1);if(!a.length)delete sel.kf[p]}else a.push([lt,gv(sel,p,lt)]);change()});

/* ---------- side panels ---------- */
$('#p-tr').innerHTML=TR.map(([v,l])=>`<button class="tile" data-tr="${v}">${v==='none'?'إزالة الانتقال':l}</button>`).join('')+'<p class="hint">حدّد مقطعاً ثم اختر انتقالاً (يُطبَّق على الدخول والخروج).</p>';
$('#p-fx').innerHTML=FXL.map(([v,l])=>`<button class="tile" data-fx="${v}">${l}</button>`).join('')+LOOKS.map(([l],i)=>`<button class="tile" data-lk="${i}">🎨 Look: ${l}</button>`).join('')+'<button class="tile" data-kb>🎥 حركة كاميرا (Ken Burns)</button><button class="tile" data-fxl>＋ طبقة تعديل (تؤثر على كل ما تحتها)</button><p class="hint">حدّد فيديو أو صورة ثم اختر التأثير. الكروما كي في اللوحة اليمنى.</p>';
$('#p-tx').innerHTML=['عنوان رئيسي','عنوان فرعي','نص سفلي','نص 3D','نص 3D دوّار (Keyframes)'].map((l,i)=>`<button class="tile" data-tx="${i}">+ ${l}</button>`).join('')+[['rect','مستطيل'],['round','مستطيل مدوّر'],['circle','دائرة / بيضاوي']].map(([v,l])=>`<button class="tile" data-sh="${v}">+ شكل: ${l}</button>`).join('')+'<button class="tile" data-lt>🏷 ثلث سفلي (Lower Third)</button><button class="tile" data-srt>📄 استيراد ترجمة (SRT)</button><p class="hint">يُضاف النص عند موضع المؤشر. عدّل الخط واللون والحركة من اللوحة اليمنى.</p>';
$('#side').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.t){$$('#tabs button').forEach(x=>x.classList.toggle('on',x===b));['m','tr','fx','tx','kp'].forEach(k=>$('#p-'+k).hidden=k!==d.t)}
 else if(d.ma)addMediaClip(d.ma);else if(d.tx!==undefined)addText(+d.tx);else if(d.sh)addShape(d.sh);else if(d.kp!==undefined)applyKfPreset(+d.kp);else if(d.fxl!==undefined)addFx();else if(d.kb!==undefined){if(!sel||!['video','image'].includes(sel.kind))return toast('حدّد فيديو أو صورة أولاً');sel.kf.scale=[[0,100],[sel.dur,118]];sel.kf.x=[[0,0],[sel.dur,-40]];sel.kf.y=[[0,0],[sel.dur,-20]];gprop='scale';gpOff=false;change()}else if(d.lt!==undefined)addLower();else if(d.srt!==undefined)$('#srtIn').click();else if(d.lk!==undefined){if(!sel||!['video','image','fxlayer'].includes(sel.kind))return toast('حدّد فيديو أو صورة أو طبقة تعديل أولاً');Object.assign(sel,LOOKS[+d.lk][1]);change()}
 else if(d.tr!==undefined||d.fx!==undefined){if(!sel||sel.kind==='audio')return toast('حدّد فيديو أو صورة أو نصاً أولاً');
  if(d.tr!==undefined){sel.tin=sel.tout=d.tr}else if(sel.kind!=='text')sel.filter=d.fx;change()}});
$('#mlist').addEventListener('dragstart',e=>{const m=e.target.closest('.mi');if(m)e.dataTransfer.setData('text/plain',m.dataset.id)});
$('#mlist').addEventListener('dblclick',e=>{const m=e.target.closest('.mi');if(m)addMediaClip(m.dataset.id)});

/* ---------- export ---------- */
const MIMES=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/mp4;codecs=avc1,mp4a.40.2','video/mp4'].filter(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m));
$('#xf').innerHTML=MIMES.map(m=>`<option value="${m}">${m.includes('mp4')?'MP4':'WebM'}${m.includes('vp8')?' (VP8)':''}</option>`).join('');
async function doExport(){const T=total();if(!T)return toast('المشروع فارغ');if(!MIMES.length)return toast('المتصفح لا يدعم التسجيل');stop();initAudio();await actx.resume();
 const q=+$('#xq').value,L2=P.w>=P.h,h=L2?q:Math.round(q*P.h/P.w),w=L2?Math.round(q*P.w/P.h):q,mime=$('#xf').value;cv.width=w;cv.height=h;t=0;exporting=true;cancel=false;$('#xgo').disabled=true;$('#xmsg').textContent='جارٍ التصدير… أبقِ النافذة مفتوحة';
 frame();await new Promise(r=>setTimeout(r,500));frame();
 const vs=cv.captureStream(+$('#xr').value);adest.stream.getAudioTracks().forEach(a=>vs.addTrack(a));
 const rec=new MediaRecorder(vs,{mimeType:mime,videoBitsPerSecond:h>=1080?8e6:h>=720?5e6:2.5e6}),ch=[];rec.ondataavailable=e=>e.data.size&&ch.push(e.data);
 const done=new Promise(r=>rec.onstop=r);rec.start(500);await new Promise(r=>{onEnd=r;play(true)});rec.stop();await done;
 exporting=false;setSize();$('#xgo').disabled=false;t=0;frame();
 if(cancel){$('#xmsg').textContent='أُلغي التصدير';return}
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(ch,{type:mime}));a.download=(P.name||'video')+(mime.includes('mp4')?'.mp4':'.webm');a.click();$('#xmsg').textContent='تم التصدير ✔';$('#xprog i').style.width='100%'}
$('#bExp').onclick=()=>{$('#xprog i').style.width='0';$('#modal').hidden=false};
$('#xgo').onclick=doExport;
$('#xcl').onclick=()=>{if(exporting){cancel=true;stop();if(onEnd){const f=onEnd;onEnd=null;f()}}else $('#modal').hidden=true};

/* ---------- wiring ---------- */
$('#wNew').onclick=newProject;
$('#wOpen').onclick=()=>{$('#recents').scrollIntoView({behavior:'smooth'});toast('اختر مشروعاً من القائمة')};
$('#recents').onclick=e=>{const d=e.target.closest('[data-del]');if(d){e.stopPropagation();if(confirm('حذف هذا المشروع نهائياً؟'))db('projects','readwrite',s=>s.delete(d.dataset.del)).then(loadRecents);return}const r=e.target.closest('.rc');if(r)openProject(r.dataset.id)};
$('#bHome').onclick=async()=>{stop();await save(true);$('#app').hidden=true;$('#welcome').hidden=false;loadRecents()};
$('#pname').onchange=()=>{P.name=$('#pname').value;commit()};
$('#bImp').onclick=()=>$('#fIn').click();$('#fIn').onchange=e=>{importFiles(e.target.files);e.target.value=''};
$('#bUndo').onclick=undo;$('#bSplit').onclick=split;$('#bDup').onclick=dup;$('#bJoin').onclick=join;$('#bDel').onclick=del;$('#bSave').onclick=()=>save();
$('#bPlay').onclick=()=>play();$('#bStart').onclick=()=>{t=0;frame()};$('#bEnd').onclick=()=>{t=total();frame()};
$('#zi').onclick=()=>{pps=Math.min(300,pps*1.3);drawTL()};$('#zo').onclick=()=>{pps=Math.max(10,pps/1.3);drawTL()};
$('#tbar').addEventListener('click',e=>{const b=e.target.closest('[data-at]');if(b){addTrack(b.dataset.at);change()}});
addEventListener('dragover',e=>e.preventDefault());
addEventListener('drop',async e=>{e.preventDefault();if(!P||$('#app').hidden)return;const ln=e.target.closest&&e.target.closest('.lane[data-track]'),tr=ln&&P.tracks.find(x=>x.id===ln.dataset.track),st=ln?(e.clientX-ln.getBoundingClientRect().left)/pps:t;
 if(e.dataTransfer.files.length){const ids=await importFiles(e.dataTransfer.files);if(ids[0])addMediaClip(ids[0],tr,st);return}
 const id=e.dataTransfer.getData('text/plain');if(media[id])addMediaClip(id,tr,st)});
addEventListener('keydown',e=>{if(!P||$('#app').hidden||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=e.key.toLowerCase(),m=e.ctrlKey||e.metaKey;
 if(k===' '){e.preventDefault();play()}else if(k==='s'&&!m)split();else if(k==='delete'||k==='backspace')del();else if(k==='z'&&m)undo();else if(k==='m'&&!m)mark();else if(k==='d'&&m){e.preventDefault();dup()}
 else if(k==='arrowleft'){t=Math.max(0,t-1/30);frame()}else if(k==='arrowright'){t=Math.min(total(),t+1/30);frame()}});
addEventListener('beforeunload',()=>{if(P&&!$('#app').hidden)save(true)});
loadRecents();

/* ---------- move from preview / nudge pad ---------- */
function syncPos(){if(!sel)return;const lt=t-sel.start;['x','y'].forEach(p=>$$(`#insp [data-p="${p}"]`).forEach(i=>i.value=round(gv(sel,p,lt))))}
function cpos(e){const r=cv.getBoundingClientRect(),W=cv.width,H=cv.height,sc=Math.min(r.width/W,r.height/H);return[(e.clientX-r.left-(r.width-W*sc)/2)/sc,(e.clientY-r.top-(r.height-H*sc)/2)/sc]}
function hit(px,py){const act=active();for(const tr of P.tracks){if(!tr.vis)continue;const L=layout(tr.id);for(const c of act.filter(c=>c.track===tr.id&&c.kind!=='audio').sort((a,b)=>L.map[a.id]-L.map[b.id])){const b=BND[c.id];if(!b)continue;const a=-b[4]*Math.PI/180,dx=px-b[0],dy=py-b[1];
 if(Math.abs(dx*Math.cos(a)-dy*Math.sin(a))<=b[2]&&Math.abs(dx*Math.sin(a)+dy*Math.cos(a))<=b[3])return c}}return null}
let cd=null;
cv.addEventListener('pointerdown',e=>{if(!P||exporting)return;const[px,py]=cpos(e),hh=cropHandle(px,py);if(hh){const c=sel,lt=t-c.start;cd={crop:hh,c,b:[...BND[c.id]],px,py,v:{cl:gv(c,'cl',lt)||0,cr:gv(c,'cr',lt)||0,ct:gv(c,'ct',lt)||0,cb:gv(c,'cb',lt)||0}};cv.setPointerCapture(e.pointerId);return}const c=hit(px,py);if(!c){if(sel){sel=null;refresh()}return}
 if(sel!==c){sel=c;drawTL();inspect()}const lt=t-c.start;cd={px,py,x:gv(c,'x',lt),y:gv(c,'y',lt),r3:e.ctrlKey,rx:gv(c,'rx',lt)||0,ry:gv(c,'ry',lt)||0};cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing';frame()});
cv.addEventListener('pointermove',e=>{if(!P)return;const[px,py]=cpos(e);if(cd&&cd.crop)return cropMove(px,py);if(!cd){const h2=cropHandle(px,py);cv.style.cursor=h2?(h2==='l'||h2==='r'?'ew-resize':'ns-resize'):hit(px,py)?'move':'default';return}
 if(cd.r3){setProp('ry',Math.round(cd.ry+(px-cd.px)*.3));setProp('rx',Math.round(cd.rx-(py-cd.py)*.3));['rx','ry'].forEach(p=>$$(`#insp [data-p="${p}"]`).forEach(i=>i.value=round(gv(sel,p,t-sel.start)||0)));return}
 const f=P.w/cv.width;let nx=cd.x+(px-cd.px)*f,ny=cd.y+(py-cd.py)*f;
 if(e.shiftKey){Math.abs(nx-cd.x)>Math.abs(ny-cd.y)?ny=cd.y:nx=cd.x}
 if(!e.altKey){if(Math.abs(nx)<8)nx=0;if(Math.abs(ny)<8)ny=0}
 setProp('x',Math.round(nx));setProp('y',Math.round(ny));syncPos()});
cv.addEventListener('pointerup',()=>{if(cd){cd=null;cv.style.cursor='move';commit()}});
$('#insp').addEventListener('click',e=>{const b=e.target.closest('[data-nd]');if(!b||!sel)return;const[dx,dy]=b.dataset.nd.split(',').map(Number),st=e.shiftKey?50:10,lt=t-sel.start;
 if(!dx&&!dy){setProp('x',0);setProp('y',0)}else{setProp('x',gv(sel,'x',lt)+dx*st);setProp('y',gv(sel,'y',lt)+dy*st)}syncPos();commit()});

/* ---------- extras: shapes, ripple delete, snapshot, markers, aspect, background ---------- */
function setSize(){cv.width=P.w;cv.height=P.h;$('#asp').value=P.w+'x'+P.h;$('#pbg').value=P.bg||'#000000'}
function addShape(v){const tr=P.tracks.find(x=>x.type==='text'||x.type==='any')||addTrack('text');sel=baseClip({track:tr.id,start:t,dur:4,kind:'shape',name:'شكل',shape:v,color:'#ff5a5f',tin:'fade',tout:'fade'});P.clips.unshift(sel);change()}
function ripple(){if(!sel)return toast('حدّد مقطعاً أولاً');const c=sel;P.clips.filter(x=>x.track===c.track&&x!==c&&x.start>=c.start+c.dur-.001).forEach(x=>x.start-=c.dur);del()}
function snapshot(){const s=sel;sel=null;render();cv.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=(P.name||'frame')+'-'+fmt(t).replace(':','-')+'.png';a.click();sel=s;render();toast('تم حفظ الصورة')})}
function mark(){const ms=P.markers||(P.markers=[]),i=ms.findIndex(m=>Math.abs(m-t)<.3);i>=0?ms.splice(i,1):ms.push(t);commit();drawTL()}
$('#bRip').onclick=ripple;$('#bSnap').onclick=snapshot;
$('#asp').onchange=e=>{const[w,h]=e.target.value.split('x').map(Number);P.w=w;P.h=h;setSize();change()};
$('#pbg').oninput=e=>{P.bg=e.target.value;frame()};$('#pbg').onchange=commit;

/* ---------- keyframe SPEED graph (separate panel) ---------- */
let gpOff=false,gsig='',gd=null;const G={ml:50,mr:14,mt:14,mb:22},SMAX=3,gsvg=$('#gsvg'),spd=k=>k[2]==null?1:k[2];
$('#gEase').innerHTML=[['','نمط سريع…'],['1','سرعة ثابتة'],['0','بطيء عند كل مفتاح (Ease)'],['2','سريع عند كل مفتاح']].map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
function gmap(c){const W=gsvg.clientWidth,H=gsvg.clientHeight,pw=W-G.ml-G.mr,ph=H-G.mt-G.mb;return{W,H,X:l=>G.ml+l/c.dur*pw,Y:v=>G.mt+(1-Math.max(0,Math.min(SMAX,v))/SMAX)*ph,iL:x=>Math.max(0,Math.min(c.dur,(x-G.ml)/pw*c.dur)),iV:y=>{let v=Math.max(0,Math.min(SMAX,Math.round((SMAX-(y-G.mt)/ph*SMAX)*20)/20));return Math.abs(v-1)<.07?1:v}}}
function drawGraph(){const gp=$('#gp'),c=sel,ks=c?Object.keys(c.kf).filter(p=>c.kf[p].length):[];
 if(!c||!ks.length||gpOff){gp.hidden=true;return}gp.hidden=false;if(!ks.includes(gprop))gprop=ks[0];
 const sig=c.id+ks.join()+gprop;if(sig!==gsig){gsig=sig;$('#gProp').innerHTML=ks.map(p=>`<option value="${p}"${p===gprop?' selected':''}>${FLD.find(x=>x[0]===p)[1]}</option>`).join('')}
 const m=gmap(c),{W,H,X,Y}=m;if(W<80||H<60)return;const kf=c.kf[gprop].sort((a,b)=>a[0]-b[0]);let s='';
 for(let v=0;v<=SMAX;v++){const y=Y(v);s+=`<line class="gl${v===1?' g1':''}" x1="${G.ml}" x2="${W-G.mr}" y1="${y}" y2="${y}"/><text x="${G.ml-6}" y="${y+3}" text-anchor="end">×${v}${v===1?' ثابتة':''}</text>`}
 for(let i=0;i<=5;i++){const l=c.dur*i/5;s+=`<line class="gl" x1="${X(l)}" x2="${X(l)}" y1="${G.mt}" y2="${H-G.mb}"/><text x="${X(l)}" y="${H-6}" text-anchor="middle">${l.toFixed(1)}s</text>`}
 let d='';for(let i=0;i<kf.length-1;i++){const a=kf[i],b=kf[i+1],va=spd(a),vb=spd(b);for(let j=0;j<=60;j++){const u=j/60,v=(3*u*u-4*u+1)*va+(6*u-6*u*u)+(3*u*u-2*u)*vb;d+=(d?'L':'M')+X(a[0]+(b[0]-a[0])*u).toFixed(1)+' '+Y(v).toFixed(1)}}
 if(d)s+=`<path d="${d}"/>`;else s+=`<text x="${G.ml+10}" y="${G.mt+16}" style="fill:#ffb020">أضف مفتاحاً ثانياً (◆) ليظهر خط السرعة بين المفتاحين</text>`;
 const pl=t-c.start;if(pl>=0&&pl<=c.dur)s+=`<line x1="${X(pl)}" x2="${X(pl)}" y1="${G.mt}" y2="${H-G.mb}" stroke="#ff5a5f" stroke-width="2"/>`;
 s+=kf.map((k,i)=>`<circle class="kp" data-i="${i}" cx="${X(k[0])}" cy="${Y(spd(k))}" r="7"/><text x="${X(k[0])+10}" y="${Math.max(12,Y(spd(k))-10)}" style="fill:#fff;font-weight:600">×${round(spd(k))}</text>`).join('');gsvg.innerHTML=s}
gsvg.addEventListener('pointerdown',e=>{const c=sel;if(!c||!gprop)return;gsvg.setPointerCapture(e.pointerId);const kp=e.target.closest('.kp'),r=gsvg.getBoundingClientRect();
 if(kp)gd={c,pt:c.kf[gprop][+kp.dataset.i]};else{gd={seek:1,c};t=c.start+gmap(c).iL(e.clientX-r.left);frame()}});
gsvg.addEventListener('pointermove',e=>{if(!gd)return;const c=gd.c,r=gsvg.getBoundingClientRect(),m=gmap(c);if(gd.seek){t=c.start+m.iL(e.clientX-r.left);return frame()}gd.pt[2]=m.iV(e.clientY-r.top);frame()});
gsvg.addEventListener('pointerup',()=>{if(gd&&!gd.seek)change();gd=null});
gsvg.addEventListener('dblclick',e=>{const kp=e.target.closest('.kp');if(kp&&sel&&gprop){sel.kf[gprop][+kp.dataset.i][2]=1;change()}});
$('#gProp').onchange=e=>{gprop=e.target.value;gsig='';drawGraph()};
$('#gEase').onchange=e=>{const v=e.target.value;e.target.value='';if(v===''||!sel||!gprop||!sel.kf[gprop])return;sel.kf[gprop].forEach(k=>k[2]=+v);change()};
$('#gX').onclick=()=>{gpOff=true;drawGraph()};

/* ---------- crop handles, layers ---------- */
function cropHandle(px,py){if(!sel||(sel.kind!=='video'&&sel.kind!=='image')||!BND[sel.id]||!active().includes(sel))return null;const b=BND[sel.id],a=-b[4]*Math.PI/180,dx=px-b[0],dy=py-b[1],lx=dx*Math.cos(a)-dy*Math.sin(a),ly=dx*Math.sin(a)+dy*Math.cos(a),tol=16*cv.width/1280;
 const near=(x,y)=>Math.hypot(lx-x,ly-y)<tol;return near(-b[2],0)?'l':near(b[2],0)?'r':near(0,-b[3])?'t':near(0,b[3])?'b':null}
function cropMove(px,py){const{crop,c,b,v}=cd,a=-b[4]*Math.PI/180,dx=px-cd.px,dy=py-cd.py,lx=dx*Math.cos(a)-dy*Math.sin(a),ly=dx*Math.sin(a)+dy*Math.cos(a);
 const m={l:['cl',lx/b[5]*100],r:['cr',-lx/b[5]*100],t:['ct',ly/b[6]*100],b:['cb',-ly/b[6]*100]}[crop];setProp(m[0],Math.round(Math.max(0,Math.min(90,v[m[0]]+m[1]))));
 const lt=t-c.start;['cl','cr','ct','cb'].forEach(p=>$$(`#insp [data-p="${p}"]`).forEach(i=>i.value=round(gv(c,p,lt)||0)))}
function layout(trId){const cl=P.clips.filter(c=>c.track===trId).reverse(),rows=[],map={};for(const c of cl){let r=0;for(;;r++){if(!rows[r])rows[r]=[];if(!rows[r].some(o=>c.start<o.start+o.dur-.001&&o.start<c.start+c.dur-.001))break}rows[r].push(c);map[c.id]=r}return{map,n:Math.max(1,rows.length)}}
$('#bFront').onclick=()=>{if(!sel)return toast('حدّد مقطعاً أولاً');P.clips=P.clips.filter(c=>c!==sel);P.clips.push(sel);change()};
$('#bBack').onclick=()=>{if(!sel)return toast('حدّد مقطعاً أولاً');P.clips=P.clips.filter(c=>c!==sel);P.clips.unshift(sel);change()};

$('#addLayer').onchange=e=>{const v=e.target.value;e.target.value='';if(v){addTrack(v);change()}};
$('#tlin').addEventListener('dblclick',e=>{const b=e.target.closest('.hd b');if(!b)return;const row=b.closest('.row'),i=[...row.parentNode.querySelectorAll('.row:not(.rul)')].indexOf(row),tr=P.tracks[i];const n=prompt('اسم الطبقة:',tr.name);if(n){tr.name=n;change()}});

/* ---------- pro extras: waveform, adjustment layer, freeze, zoom, guides ---------- */
async function peaks(mid,file){try{if(file.size>300e6)return;const buf=await (initAudio(),actx).decodeAudioData(await file.arrayBuffer()),ch=buf.getChannelData(0),n=Math.min(4000,Math.max(100,Math.floor(buf.duration*40))),step=Math.max(1,Math.floor(ch.length/n)),out=new Float32Array(n);
 for(let i=0;i<n;i++){let m=0;for(let j=i*step;j<(i+1)*step&&j<ch.length;j+=Math.max(1,step>>6))m=Math.max(m,Math.abs(ch[j]));out[i]=m}WAVE[mid]={p:out,d:buf.duration};drawTL()}catch{}}
function waveSvg(c){const W=WAVE[c.mid];if(!W||(c.kind!=='video'&&c.kind!=='audio'))return'';const w=Math.max(6,c.dur*pps),n=Math.min(400,Math.max(2,Math.floor(w/2))),up=[],dn=[];
 for(let i=0;i<=n;i++){const lt=c.dur*i/n,s=c.in+(c.rev?c.dur-lt:lt)*c.speed,a=Math.min(1,(W.p[Math.min(W.p.length-1,Math.max(0,Math.floor(s/W.d*W.p.length)))]||0)*c.vol/100),x=(w*i/n).toFixed(1);up.push(x+' '+(19-a*17).toFixed(1));dn.unshift(x+' '+(19+a*17).toFixed(1))}
 return`<svg class="wv" width="${w}" height="38"><polygon points="${up.join(' ')} ${dn.join(' ')}"/></svg>`}
function addFx(){const tr=P.tracks.find(x=>x.type==='text'||x.type==='any')||addTrack('text');sel=baseClip({track:tr.id,start:t,dur:5,kind:'fxlayer',name:'طبقة تعديل'});P.clips.push(sel);change()}
function freeze(){if(!P||!total())return toast('أضف مقاطع أولاً');const s=sel;sel=null;render();cv.toBlob(async b=>{sel=s;const ids=await importFiles([new File([b],'freeze.png',{type:'image/png'})]);addMediaClip(ids[0],undefined,t)})}
$('#bFreeze').onclick=freeze;$('#bGuide').onclick=()=>{showG=!showG;frame()};
$('#zf').onclick=()=>{pps=Math.max(10,Math.min(300,(tls.clientWidth-LW-40)/Math.max(total(),5)));drawTL()};
tls.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();pps=Math.max(10,Math.min(300,pps*(e.deltaY<0?1.15:.87)));drawTL()}},{passive:false});

/* ---------- 3D perspective, lower third, subtitles ---------- */
let S3={};
function tri(img,A,B,C){const det=(B[2]-A[2])*(C[3]-A[3])-(C[2]-A[2])*(B[3]-A[3]);if(!det)return;
 const a=((B[0]-A[0])*(C[3]-A[3])-(C[0]-A[0])*(B[3]-A[3]))/det,b=((B[1]-A[1])*(C[3]-A[3])-(C[1]-A[1])*(B[3]-A[3]))/det,c=((C[0]-A[0])*(B[2]-A[2])-(B[0]-A[0])*(C[2]-A[2]))/det,d=((C[1]-A[1])*(B[2]-A[2])-(B[1]-A[1])*(C[2]-A[2]))/det,e=A[0]-a*A[2]-c*A[3],f=A[1]-b*A[2]-d*A[3];
 const mx=(A[0]+B[0]+C[0])/3,my=(A[1]+B[1]+C[1])/3;cx.save();cx.beginPath();[A,B,C].forEach((p,i)=>{const X=p[0]+(p[0]>mx?1.6:-1.6),Y=p[1]+(p[1]>my?1.6:-1.6);i?cx.lineTo(X,Y):cx.moveTo(X,Y)});cx.closePath();cx.clip();
 cx.transform(a,b,c,d,e,f);cx.drawImage(img,S3.x,S3.y,S3.w,S3.h,S3.x,S3.y,S3.w,S3.h);cx.restore()}
function draw3D(img,sx,sy,sw,sh,rx,ry,rw,rh,ax,ay,F){const N=10,ca=Math.cos(ax),sa=Math.sin(ax),cb=Math.cos(ay),sb=Math.sin(ay),V=[];let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;S3={x:sx,y:sy,w:sw,h:sh};
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const X=rx+rw*i/N,Y=ry+rh*j/N,ya=Y*ca,z1=Y*sa,xb=X*cb+z1*sb,z2=-X*sb+z1*cb,p=F/Math.max(F*.15,F+z2),px=xb*p,py=ya*p;V.push([px,py,sx+sw*i/N,sy+sh*j/N]);x0=Math.min(x0,px);x1=Math.max(x1,px);y0=Math.min(y0,py);y1=Math.max(y1,py)}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const A=V[j*(N+1)+i],B=V[j*(N+1)+i+1],C=V[(j+1)*(N+1)+i],D=V[(j+1)*(N+1)+i+1];tri(img,A,B,C);tri(img,B,D,C)}
 const sh0=(1-Math.abs(ca*cb))*.45;if(sh0>.01){cx.save();cx.filter='none';cx.fillStyle=`rgba(0,0,0,${sh0})`;cx.beginPath();[V[0],V[N],V[(N+1)*(N+1)-1],V[N*(N+1)]].forEach((p,i)=>i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1]));cx.closePath();cx.fill();cx.restore()}
 return[x0,x1,y0,y1]}
$('#insp').addEventListener('click',e=>{const b=e.target.closest('[data-d3]');if(!b||!sel)return;const[x,y]=b.dataset.d3.split(',').map(Number);setProp('rx',x);setProp('ry',y);change()});
function addLower(){const tr=P.tracks.find(x=>x.type==='text')||addTrack('text');const sh=baseClip({track:tr.id,start:t,dur:5,kind:'shape',name:'شكل',shape:'rect',color:'#2b6cff',sw:620,sh:96,x:-300,y:250,tin:'wipe',tout:'fade'}),tx=baseClip({track:tr.id,start:t,dur:5,kind:'text',text:'الاسم هنا\nالوصف',font:'Tahoma',size:34,color:'#ffffff',align:'left',x:-38,y:250,tin:'wipe',tout:'fade'});P.clips.push(tx);P.clips.unshift(sh);sel=tx;change()}
async function importSrt(f){const txt=(await f.text()).replace(/\r/g,''),tr=addTrack('text');tr.name='ترجمة';let n=0;
 for(const b of txt.split(/\n\n+/)){const L=b.split('\n').filter(x=>x.trim()),i=L.findIndex(x=>x.includes('-->')),m=i>=0&&L[i].match(/(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)/);if(!m)continue;
  const s=+m[1]*3600+(+m[2])*60+(+m[3])+(+m[4])/1000,e=+m[5]*3600+(+m[6])*60+(+m[7])+(+m[8])/1000;P.clips.push(baseClip({track:tr.id,start:s,dur:Math.max(.2,e-s),kind:'text',text:L.slice(i+1).join('\n'),font:'Tahoma',size:44,color:'#ffffff',align:'center',y:300,sk:3}));n++}
 change();toast('تم استيراد '+n+' سطر ترجمة')}
$('#srtIn').onchange=e=>{if(e.target.files[0])importSrt(e.target.files[0]);e.target.value=''};

/* ---------- ready-made keyframe animations ---------- */
const KFP=[['ظهور تدريجي',{opacity:[[0,0],[1,100]]}],['ظهور بحجم (Pop)',{scale:[[0,0],[.6,115],[1,100]],opacity:[[0,0],[.3,100],[1,100]]}],['انزلاق من اليمين',{x:[[0,900],[1,0]],opacity:[[0,0],[.5,100],[1,100]]}],['انزلاق من اليسار',{x:[[0,-900],[1,0]],opacity:[[0,0],[.5,100],[1,100]]}],['انزلاق من الأسفل',{y:[[0,500],[1,0]],opacity:[[0,0],[.5,100],[1,100]]}],['انزلاق من الأعلى',{y:[[0,-500],[1,0]],opacity:[[0,0],[.5,100],[1,100]]}],['ارتداد (Bounce)',{y:[[0,-500],[.45,0],[.62,-90],[.8,0],[.9,-30],[1,0]]}],['اهتزاز (Shake)',{x:[[0,0],[.1,-25],[.2,25],[.3,-20],[.4,20],[.5,-12],[.6,12],[.7,-6],[.8,6],[1,0]]}],['نبض (Pulse)',{scale:[[0,100],[.25,112],[.5,100],[.75,112],[1,100]]}],['تأرجح (Swing)',{rot:[[0,0],[.25,12],[.5,-10],[.75,6],[1,0]]}],['دوران وظهور',{rot:[[0,-360],[1,0]],scale:[[0,0],[1,100]]}],['قلب 3D (Flip)',{ry:[[0,90],[1,0]]}],['لفّة 3D كاملة',{ry:[[0,0],[1,360]]}],['طفو (Float)',{y:[[0,0],[.5,-25],[1,0]]}],['تكبير بطيء',{scale:[[0,100],[1,125]]}]];
$('#p-kp').innerHTML='<label>التطبيق على<select id="kpMode"><option value="in">بداية المقطع (دخول)</option><option value="out">نهاية المقطع (خروج)</option><option value="all">كل المقطع</option></select></label><label>مدة الحركة<select id="kpLen"><option value=".5">0.5 ث</option><option value=".8" selected>0.8 ث</option><option value="1.2">1.2 ث</option><option value="2">2 ث</option></select></label>'+KFP.map(([l],i)=>`<button class="tile" data-kp="${i}">◆ ${l}</button>`).join('')+'<p class="hint">حدّد عنصراً ثم اختر حركة جاهزة. تُنشأ كـ Keyframes يمكنك تعديلها من لوحة السرعة.</p>';
function applyKfPreset(i){const c=sel;if(!c||c.kind==='audio')return toast('حدّد عنصراً مرئياً أولاً');const pr=KFP[i][1],mode=$('#kpMode').value,L=mode==='all'?c.dur:Math.min(+$('#kpLen').value,c.dur),st=mode==='out'?c.dur-L:0;
 for(const p in pr){const ab=p==='scale'||p==='opacity',bv=c[p]==null?(ab?100:0):c[p],pts=pr[p].map(([u,v])=>[mode==='out'?1-u:u,ab?bv*v/100:bv+v]);if(mode==='out')pts.reverse();
  const a=(c.kf[p]||[]).filter(k=>k[0]<st-.001||k[0]>st+L+.001);pts.forEach(([u,v])=>a.push([st+u*L,round(v)]));a.sort((x,y)=>x[0]-y[0]);c.kf[p]=a}
 gprop=Object.keys(pr)[0];gpOff=false;change()}
/* ---------- floating about card ---------- */
const ab=$('#about');let ad=null;
ab.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const r=ab.getBoundingClientRect();ab.style.left=r.left+'px';ab.style.top=r.top+'px';ab.style.transform='none';ad={dx:e.clientX-r.left,dy:e.clientY-r.top};try{ab.setPointerCapture(e.pointerId)}catch{}ab.style.cursor='grabbing'});
ab.addEventListener('pointermove',e=>{if(!ad)return;ab.style.left=Math.max(0,Math.min(innerWidth-80,e.clientX-ad.dx))+'px';ab.style.top=Math.max(0,Math.min(innerHeight-40,e.clientY-ad.dy))+'px'});
ab.addEventListener('pointerup',()=>{ad=null;ab.style.cursor='grab'});
$('#abX').onclick=$('#abGo').onclick=()=>{ab.hidden=true};$('#bAbout').onclick=()=>{ab.hidden=false};
