/* ============================================================
   PLAY: the firmware itself, in the browser, on the panel drawing.
   A firmware's label file can carry an approved browser build (doc.emulator,
   see emulatorOf in core.js), made with simple-touch-web. With embed 'allowed'
   the library plays it here: the knobs, faders, levers and pads of the drawing
   drive the firmware, its LED and OLED show on the panel, and a loop or the
   mic goes into its audio input. Otherwise only the author's page is linked.

   Needs core.js (SLOT, SLOTS, SIMPLE_PADS, esc, escAttr) and the runtime in
   vendor/simple-touch-web/ (ES modules, loaded on the first Play).
   The page calls Play.strip() and Play.attach(fig) on every render, and
   Play.reset() when another firmware is picked.
   ============================================================ */
const PLAY_RUNTIME = 'vendor/simple-touch-web/';
const PLAY_LOOPS = 'https://jonwaterschoot.github.io/simple-touch-web/demo/loops/';
const PLAY_KEYS = {10:'3', 11:'4', 0:'w', 1:'e', 2:'r', 3:'a', 4:'s', 5:'d', 6:'f', 7:'g', 8:'x', 9:'v'};
/* the levers on the drawing: centre, angle, and the contact at each end of their long side */
const PLAY_LEVERS = {
  S09_S10: {w:98, h:37, rot:-4, ends:['left','right']},
  S07_S08: {w:40, h:94, rot:25, ends:['up','down']},
};
const FADER_RUN = [861, 618];   // fader cap centre at 0 and at 1 (panel units)
const OLED_BOX = {x:270, y:330, w:240, h:120};   // in the top plate's free corner; where it sits on a real build varies

const Play = (()=>{
  const S = {
    state:'idle',   // idle | loading | running
    run:0,          // bumps on every start and stop, so a slow load can tell it was overtaken
    st:null, ctx:null, out:null, inGain:null,
    controls:{}, levers:{}, pads:{},
    led:false, oled:null, oledUrl:'', boot:null, stopBoot:null,
    msg:'', err:false, loaded:0,
    input:'off', inputs:null, inputNode:null, inputStream:null, buffers:new Map(),
    volume:0.8, inLevel:1, oledOn:true, peak:0,
    mod:null, svg:null, keys:false,
  };
  const reset0 = ()=>{
    for(const s of SLOTS) if(s.kind==='knob'||s.kind==='fader') S.controls[s.id]=0.5;
    S.levers={S09_S10:'centre', S07_S08:'centre'}; S.pads={};
  };
  reset0();
  const em = ()=> doc.emulator;
  const playable = ()=> !!(em() && em().embed==='allowed');
  const $p = id => document.getElementById(id);

  /* ---------------------------------------------------------- the strip above the drawing */
  function strip(){
    const box=$p('play'); if(!box) return;
    const e=em();
    box.hidden=!e;
    if(!e){ box.innerHTML=''; return; }
    const fw=doc.firmware, name=fw.name||'this firmware';
    if(!playable()){
      box.innerHTML=`<p><b>Play</b> ${esc(fw.author||'The author')} plays ${esc(name)} in the browser on their own page. <a href="${escAttr(e.url)}" target="_blank" rel="noopener">Open it ↗</a></p>`;
      return;
    }
    if(!box.querySelector('.pctl')) build(box);
    const on=S.state!=='idle';
    const go=$p('playGo');
    go.textContent= on? '■ Stop' : '▶ Play';
    go.className= on? '' : 'primary';
    go.setAttribute('aria-pressed',String(on));
    $p('playOled').closest('label').hidden=!e.oled;
    $p('playOled').checked=S.oledOn;
    $p('playMsg').textContent=S.msg; $p('playMsg').classList.toggle('err',S.err);
    $p('playCredit').innerHTML=`Browser build <code>${esc(e.sha256.slice(0,12))}</code>, approved by ${esc(fw.author||'its author')}. It runs in this page: the sound is the firmware's own.`
      +` Drag a knob up or down, click or drag a fader, click a lever's end. Press a pad higher up to press it harder; keys ${PLAY_KEYS[10].toUpperCase()} ${PLAY_KEYS[11].toUpperCase()} · W E R · A S D F G · X V.`;
  }
  function build(box){
    box.innerHTML=`<div class="pctl">
      <button type="button" id="playGo" class="primary">▶ Play</button>
      <label><span class="cap">Input</span><select id="playIn" aria-label="Audio input"></select></label>
      <input type="file" id="playFile" accept="audio/*" hidden>
      <label><span class="cap">In level</span><input type="range" id="playInLevel" min="0" max="1.5" step="0.01"></label>
      <label><span class="cap">Volume</span><input type="range" id="playVol" min="0" max="1" step="0.01"></label>
      <span class="pmeter" title="Output level"><i id="playMeter"></i></span>
      <label class="chk"><input type="checkbox" id="playOled"> OLED</label>
      <span class="status" id="playMsg" role="status"></span>
    </div><p class="hint" id="playCredit"></p>`;
    $p('playGo').onclick=()=> S.state==='idle'? start() : stop();
    $p('playVol').value=S.volume; $p('playVol').oninput=e=>{ S.volume=+e.target.value; if(S.out) S.out.gain.value=S.volume; };
    $p('playInLevel').value=S.inLevel; $p('playInLevel').oninput=e=>{ S.inLevel=+e.target.value; if(S.inGain) S.inGain.gain.value=S.inLevel; };
    $p('playOled').onchange=e=>{ S.oledOn=e.target.checked; if(S.state!=='idle'){ stop(); start(); } else refresh(); };
    $p('playIn').onchange=e=>{ const v=e.target.value; if(v==='file') $p('playFile').click(); else selectInput(v); };
    $p('playFile').onchange=e=>{ const f=e.target.files[0]; if(f){ S.file=f; selectInput('file'); } else $p('playIn').value=S.input; };
    fillInputs();
  }
  async function loops(){
    if(S.inputs) return S.inputs;
    const local=/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    for(const base of [...(local? [new URL('../simple-touch-web/demo/loops/', location.href).href] : []), PLAY_LOOPS]){
      try{
        const r=await fetch(base+'loops.json'); if(!r.ok) continue;
        const list=await r.json();
        return S.inputs=list.filter(l=>l && typeof l.name==='string' && /^[\w.-]+$/.test(l.file||'')).map(l=>({id:'loop:'+l.file, name:l.name, url:base+l.file}));
      }catch(e){}
    }
    return S.inputs=[];
  }
  async function fillInputs(){
    const list=await loops(), sel=$p('playIn'); if(!sel) return;
    sel.replaceChildren(new Option('Off','off'), new Option('Mic','mic'), ...list.map(l=>new Option(l.name+' loop',l.id)), new Option('File…','file'));
    if(S.input==='file' && S.file) sel.insertBefore(new Option(S.file.name,'file:cur'), sel.lastChild);
    sel.value= S.input==='file'? 'file:cur' : S.input;
  }

  /* ---------------------------------------------------------- start and stop */
  function say(msg, err=false){ S.msg=msg; S.err=err; const m=$p('playMsg'); if(m){ m.textContent=msg; m.classList.toggle('err',err); } }
  async function start(){
    const e=em(); if(!e || e.embed!=='allowed' || S.state!=='idle') return;
    const run=++S.run;
    // made and resumed inside the click, so the browser lets it play
    const ctx=new AudioContext({sampleRate:48000, latencyHint:'interactive'});
    ctx.resume();
    S.ctx=ctx; S.state='loading'; say('Loading…'); refresh();
    try{
      const [{SimpleTouch}, oled]=await Promise.all([import('./'+PLAY_RUNTIME+'simple-touch.js'), import('./'+PLAY_RUNTIME+'oled.js')]);
      S.oledLib=oled;
      const st=await SimpleTouch.load(ctx, e.wasm, {sha256:e.sha256, oled:!!(e.oled && S.oledOn), controls:S.controls, switches:S.levers,
        onProgress:n=>{ if(run===S.run) say(`Loading… ${(n/1024).toFixed(0)} KB`); }});
      if(run!==S.run){ st.disconnect(); return; }
      S.st=st;
      // firmware → volume → limiter: a feedback patch can get loud
      S.out=new GainNode(ctx,{gain:S.volume});
      const limiter=new DynamicsCompressorNode(ctx,{threshold:-3, knee:0, ratio:20, attack:0.001, release:0.1});
      st.node.connect(S.out).connect(limiter).connect(ctx.destination);
      S.inGain=new GainNode(ctx,{gain:S.inLevel}); S.inGain.connect(st.node);
      st.on('led', m=>{ if(!S.stopBoot) setLed(m.on); });
      st.on('oled', m=>{ S.live=m; if(!S.stopBoot) showOled(m.ram, m.info); });
      st.on('meter', m=>{ S.peak=m.peak; const b=$p('playMeter'); if(b) b.style.width=Math.min(100,m.peak*100)+'%'; });
      st.on('error', m=>{ if(run===S.run){ stop(); say(m.message||'The firmware stopped.', true); } });
      const ready=await st.ready;
      if(run!==S.run) return;
      S.state='running';
      say(`Playing · ${ready.sampleRate/1000} kHz, block ${ready.blockSize}`);
      S.stopBoot=oled.playBoot(ready.boot, f=>{ showOled(f.ram, f.info); setLed(!!f.led); },
        ()=>{ S.stopBoot=null; if(S.live) showOled(S.live.ram, S.live.info); });
      if(S.input!=='off') selectInput(S.input);
      keys(true);
      refresh();
    }catch(err){
      if(run!==S.run) return;
      stop(); say(err.message||String(err), true);
    }
  }
  function stop(){
    S.run++;
    S.stopBoot?.(); S.stopBoot=null;
    stopInput();
    try{ S.st?.disconnect(); }catch(e){}
    S.ctx?.close().catch(()=>{});
    S.st=S.ctx=S.out=S.inGain=S.live=null;
    S.state='idle'; S.led=false; S.oled=null; S.oledUrl=''; S.pads={};
    keys(false);
    say('');
    refresh();
  }
  /* another firmware: stop, and the controls back to the middle */
  function reset(){ if(S.state!=='idle') stop(); reset0(); S.msg=''; S.err=false; }
  /* what the page shows depends on the state: the button, and a single drawing while playing */
  function refresh(){ if(typeof update==='function') update(); }

  /* ---------------------------------------------------------- audio in */
  function stopInput(){
    try{ S.inputNode?.disconnect(); S.inputNode?.stop?.(); }catch(e){}
    S.inputStream?.getTracks().forEach(t=>t.stop());
    S.inputNode=S.inputStream=null;
  }
  async function selectInput(id){
    if(id==='file:cur') id='file';
    S.input=id; fillInputs();
    if(!S.ctx || S.state==='idle') return;   // connected on Play
    stopInput();
    const want=S.run+':'+id;
    try{
      let node=null, stream=null;
      if(id==='mic'){
        stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false, noiseSuppression:false, autoGainControl:false}});
        node=S.ctx.createMediaStreamSource(stream);
      } else if(id==='file' || id.startsWith('loop:')){
        const loop=(S.inputs||[]).find(l=>l.id===id);
        const key= id==='file'? `file:${S.file.name}:${S.file.size}` : loop.url;
        if(!S.buffers.has(key)){
          if(id!=='file') say('Loading '+loop.name.toLowerCase()+' loop…');
          const bytes= id==='file'? await S.file.arrayBuffer() : await (await fetch(loop.url)).arrayBuffer();
          S.buffers.set(key, await S.ctx.decodeAudioData(bytes));
          if(S.state==='running') say('Playing');
        }
        node=new AudioBufferSourceNode(S.ctx,{buffer:S.buffers.get(key), loop:true}); node.start();
      }
      if(want!==S.run+':'+S.input || !S.inGain){ stream?.getTracks().forEach(t=>t.stop()); try{ node?.stop?.(); }catch(e){} return; }
      S.inputNode=node; S.inputStream=stream; node?.connect(S.inGain);
    }catch(err){ say('Audio in: '+(err.message||'could not load'), true); }
  }

  /* ---------------------------------------------------------- the drawing: controls, pads, LED, OLED */
  const f1=v=>(+v).toFixed(1);
  const D={x:94.67, y:98.61, w:892.14, h:1427.88}, sx=D.w/825, sy=D.h/1277;   // the simplified drawing's pads, as in simpleArt
  const PAD_POLY={};
  { const pts=list=>list.split(' ').map(p=>{ const [a,b]=p.split(','); return [D.x+a*sx, D.y+b*sy]; });
    SIMPLE_PADS.top.forEach((p,i)=>PAD_POLY[10+i]=pts(p));
    SIMPLE_PADS.row.forEach((p,i)=>PAD_POLY[i]=pts(p));
    SIMPLE_PADS.play.forEach((p,i)=>PAD_POLY[3+i]=pts(p)); }
  const PAD_ORDER=[10,11,0,1,2,8,4,5,6,7,9,3];   // P03 after P08: where their outlines overlap, it is P03
  const polar=(cx,cy,r,deg)=>{ const a=deg*Math.PI/180; return [cx+r*Math.sin(a), cy-r*Math.cos(a)]; };
  const KNOB_SWEEP=150;   // degrees each side of straight up
  function arc(cx,cy,r,a0,a1){
    if(a1-a0<0.5) return '';
    const [x0,y0]=polar(cx,cy,r,a0), [x1,y1]=polar(cx,cy,r,a1);
    return `M${f1(x0)} ${f1(y0)}A${r} ${r} 0 ${a1-a0>180?1:0} 1 ${f1(x1)} ${f1(y1)}`;
  }

  function attach(fig){
    S.svg=null; S.mod=null;
    if(!playable() || S.state==='idle') return;
    const svg=fig.querySelector('svg'); if(!svg) return;
    let g='<g class="playov"><defs><radialGradient id="playGlow"><stop offset="0" stop-color="#ff4a2f" stop-opacity=".85"/><stop offset="1" stop-color="#ff4a2f" stop-opacity="0"/></radialGradient></defs>';
    // LED and OLED first, under the controls' hit areas
    { const l=SLOT.LED; g+=`<g data-led><circle class="glow" cx="${l.x}" cy="${l.y}" r="26"/><rect class="lit" x="${l.x-11}" y="${l.y-7}" width="22" height="14" rx="2"/></g>`; }
    if(em().oled && S.oledOn){ const o=OLED_BOX;
      g+=`<g class="oled"><rect class="bezel" x="${o.x-10}" y="${o.y-10}" width="${o.w+20}" height="${o.h+20}" rx="8"/><image data-oled x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" preserveAspectRatio="xMidYMid meet"/></g>`; }
    for(const i of PAD_ORDER) g+=`<polygon class="pad" data-pad="${i}" points="${PAD_POLY[i].map(p=>p.map(f1).join(',')).join(' ')}"><title>P${String(i).padStart(2,'0')} · key ${PLAY_KEYS[i].toUpperCase()}</title></polygon>`;
    for(const s of SLOTS.filter(s=>s.kind==='knob'))
      g+=`<g data-knob="${s.id}"><path class="track" d="${arc(s.x,s.y,44,-KNOB_SWEEP,KNOB_SWEEP)}"/><path class="val"/><line class="ptr" x1="${s.x}" y1="${s.y}"/><circle class="hit knob" cx="${s.x}" cy="${s.y}" r="54"><title>${s.id} · drag up or down</title></circle></g>`;
    for(const s of SLOTS.filter(s=>s.kind==='fader'))
      g+=`<g data-fader="${s.id}"><rect class="val" x="${s.x-4}" width="8" rx="4"/><rect class="cap" x="${s.x-27}" width="54" height="24" rx="5"/><rect class="hit fader" x="${s.x-42}" y="${FADER_RUN[1]-30}" width="84" height="${FADER_RUN[0]-FADER_RUN[1]+60}"><title>${s.id}</title></rect></g>`;
    for(const [id,L] of Object.entries(PLAY_LEVERS)){ const s=SLOT[id], long=Math.max(L.w,L.h), horiz=L.w>L.h, third=long/3;
      g+=`<g data-lever="${id}" transform="translate(${s.x} ${s.y}) rotate(${L.rot})"><rect class="thumb" x="-13" y="-13" width="26" height="26" rx="6"/>`;
      [L.ends[0],'centre',L.ends[1]].forEach((pos,k)=>{ const a=-long/2+k*third-(k===0?10:0), len=third+(k!==1?10:0);
        g+= horiz? `<rect class="hit lever" data-pos="${pos}" x="${f1(a)}" y="${-L.h/2-10}" width="${f1(len)}" height="${L.h+20}"><title>${lab(s)}: ${pos}</title></rect>`
          : `<rect class="hit lever" data-pos="${pos}" x="${-L.w/2-10}" y="${f1(a)}" width="${L.w+20}" height="${f1(len)}"><title>${lab(s)}: ${pos}</title></rect>`; });
      g+='</g>'; }
    g+='</g>';
    svg.insertAdjacentHTML('beforeend', g);
    S.svg=svg; S.mod=svg.querySelector('.playov');
    for(const id of Object.keys(S.controls)) drawControl(id);
    for(const id of Object.keys(PLAY_LEVERS)) drawLever(id);
    for(const i of PAD_ORDER) drawPad(i);
    setLed(S.led);
    if(S.oledUrl) S.mod.querySelector('[data-oled]')?.setAttribute('href',S.oledUrl);
    bind();
  }

  function drawControl(id){
    const s=SLOT[id], v=S.controls[id], g=S.mod?.querySelector(`[data-knob="${id}"],[data-fader="${id}"]`); if(!g) return;
    if(s.kind==='knob'){
      const a=-KNOB_SWEEP+v*2*KNOB_SWEEP, [x,y]=polar(s.x,s.y,33,a);
      g.querySelector('.val').setAttribute('d',arc(s.x,s.y,44,-KNOB_SWEEP,a));
      const p=g.querySelector('.ptr'); p.setAttribute('x2',f1(x)); p.setAttribute('y2',f1(y));
    } else {
      const y=FADER_RUN[0]+(FADER_RUN[1]-FADER_RUN[0])*v;
      g.querySelector('.cap').setAttribute('y',f1(y-12));
      const r=g.querySelector('.val'); r.setAttribute('y',f1(y)); r.setAttribute('height',f1(Math.max(0,FADER_RUN[0]+12-y)));
    }
  }
  function drawLever(id){
    const g=S.mod?.querySelector(`[data-lever="${id}"]`); if(!g) return;
    const L=PLAY_LEVERS[id], pos=S.levers[id], k=[L.ends[0],'centre',L.ends[1]].indexOf(pos)-1, d=k*Math.max(L.w,L.h)/3;
    const r=g.querySelector('.thumb'); r.setAttribute('x', f1((L.w>L.h? d : 0)-13)); r.setAttribute('y', f1((L.w>L.h? 0 : d)-13));
  }
  function drawPad(i){
    const el=S.mod?.querySelector(`[data-pad="${i}"]`); if(!el) return;
    const f=S.pads[i];
    el.classList.toggle('on', f!==undefined);
    el.style.fillOpacity= f!==undefined? (0.25+0.5*f).toFixed(2) : '';
  }
  function setLed(on){ S.led=on; S.mod?.querySelector('[data-led]')?.classList.toggle('on',!!on); }
  /* OLED frames come up to 60 times a second; the drawing takes the newest once per animation frame */
  let oledFrame=0;
  function showOled(ram, info){
    S.oled={ram:ram&&new Uint8Array(ram), info};
    if(oledFrame) return;
    oledFrame=requestAnimationFrame(()=>{
      oledFrame=0; if(!S.oled || !S.oledLib) return;
      const c=S.canvas ||= Object.assign(document.createElement('canvas'),{width:384, height:192});
      S.oledLib.drawOled(c, S.oled.ram, S.oled.info, {gap:0.18});
      S.oledUrl=c.toDataURL();
      S.mod?.querySelector('[data-oled]')?.setAttribute('href',S.oledUrl);
    });
  }

  /* ---------------------------------------------------------- input */
  const svgPoint=(el,e)=>{ const m=el.getScreenCTM(); if(!m) return {x:0,y:0}; return new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse()); };
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  function setControl(id,v){ v=clamp(v); if(v===S.controls[id]) return; S.controls[id]=v; drawControl(id); S.st?.setControl(id,v); }
  function setLever(id,pos){ S.levers[id]=pos; drawLever(id); S.st?.setSwitch(id,pos); }
  function pad(i,down,force=0.5){ if(down) S.pads[i]=force; else delete S.pads[i]; drawPad(i); S.st?.setPad(i,down,force); }
  function drag(el, onDown, onMove, onUp){
    el.addEventListener('pointerdown',e=>{
      if(e.button>0) return;
      e.preventDefault(); el.setPointerCapture(e.pointerId);
      const ctx=onDown(e)||{};
      const move=ev=>onMove?.(ev,ctx), up=ev=>{ el.removeEventListener('pointermove',move); el.removeEventListener('pointerup',up); el.removeEventListener('pointercancel',up); onUp?.(ev,ctx); };
      el.addEventListener('pointermove',move); el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up);
    });
  }
  function bind(){
    const m=S.mod;
    m.querySelectorAll('.hit.knob').forEach(el=>{ const id=el.parentNode.dataset.knob;
      // 160 screen pixels for the whole turn, whatever the drawing's size
      drag(el, e=>({y:e.clientY, v:S.controls[id]}), (e,c)=>setControl(id, c.v+(c.y-e.clientY)/160));
      el.addEventListener('wheel',e=>{ e.preventDefault(); setControl(id, S.controls[id]-Math.sign(e.deltaY)*0.02); },{passive:false});
      el.addEventListener('dblclick',()=>setControl(id,0.5));
    });
    m.querySelectorAll('.hit.fader').forEach(el=>{ const id=el.parentNode.dataset.fader;
      const at=e=>{ const p=svgPoint(S.svg,e); setControl(id,(FADER_RUN[0]-p.y)/(FADER_RUN[0]-FADER_RUN[1])); };
      drag(el, at, at);
      el.addEventListener('wheel',e=>{ e.preventDefault(); setControl(id, S.controls[id]-Math.sign(e.deltaY)*0.02); },{passive:false});
    });
    m.querySelectorAll('.hit.lever').forEach(el=>{ const id=el.parentNode.dataset.lever;
      drag(el, ()=>setLever(id, el.dataset.pos));
    });
    m.querySelectorAll('.pad').forEach(el=>{ const i=+el.dataset.pad, ys=PAD_POLY[i].map(p=>p[1]), top=Math.min(...ys), h=Math.max(...ys)-top;
      // a pen's or touch screen's own pressure where there is one; else where the pad was hit
      // (top = hard, bottom = soft), then dragging up or down from there
      const force=(e,c)=> e.pointerType!=='mouse' && e.pressure>0 && e.pressure!==0.5? e.pressure : clamp(c.base+(c.y-e.clientY)/120);
      drag(el, e=>{ const c={y:e.clientY, base:clamp(1-(svgPoint(S.svg,e).y-top)/h, 0.05, 1)}; pad(i,true,force(e,c)); return c; },
        (e,c)=>pad(i,true,force(e,c)), ()=>pad(i,false));
    });
  }
  const KEY_PAD=Object.fromEntries(Object.entries(PLAY_KEYS).map(([i,k])=>[k,+i]));
  const typing=e=>e.target.closest && e.target.closest('input,select,textarea,[contenteditable]');
  const keyDown=e=>{ const i=KEY_PAD[e.key.toLowerCase()]; if(i===undefined || e.repeat || e.ctrlKey || e.metaKey || e.altKey || typing(e)) return; e.preventDefault(); pad(i,true,0.6); };
  const keyUp=e=>{ const i=KEY_PAD[e.key.toLowerCase()]; if(i!==undefined && S.pads[i]!==undefined) pad(i,false); };
  function keys(on){
    if(on===S.keys) return; S.keys=on;
    const f= on? 'addEventListener' : 'removeEventListener';
    window[f]('keydown',keyDown); window[f]('keyup',keyUp);
  }

  return {
    strip, attach, reset, stop,
    get on(){ return S.state!=='idle'; },
  };
})();
