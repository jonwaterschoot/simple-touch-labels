/* ============================================================
   COMMUNITY: the Synthux community directory and the firmware repositories it lists.
   Everything read here is other people's text. It only reaches the page escaped
   (labels, notes and excerpts), and repository faceplates are left out for now.
   Needs core.js (SLOT, LIMITS, NO_LINE2, emptyDoc, normalise, REPO_RE, safeHttps).
   ============================================================ */
const COMMUNITY = {
  list: 'https://synthux-academy.github.io/community-instruments/projects.json',
  repo: 'https://github.com/Synthux-Academy/community-instruments',
  page: 'https://synthux-academy.github.io/community-instruments/',
};
/* the file a firmware repository can carry, at its root, for the library to show */
const LABEL_FILE = 'simple-touch-labels.json';

let directoryReq = null;
/* every entry, all platforms (the designer checks new entries against these) */
function loadDirectory(){
  return directoryReq ||= fetch(COMMUNITY.list).then(r=>{ if(!r.ok) throw new Error(r.status); return r.json(); })
    .then(d=>(Array.isArray(d.projects)? d.projects : [])
      .filter(p=>p && typeof p.id==='string' && typeof p.name==='string' && REPO_RE.test(p.repo||''))
      .sort((a,b)=>a.name.localeCompare(b.name)))
    .catch(e=>{ directoryReq=null; throw e; });
}
/* Simple Touch entries, without those already in EXAMPLES (matched by repo) */
const loadCommunity = () => loadDirectory().then(list=>list.filter(p=>p.platform==='touch' && !Object.values(EXAMPLES).some(e=>e.repo===p.repo)));
/* A directory entry as a manual with no labels yet */
function communityDoc(p){
  const d=emptyDoc(), a=p.author||{};
  Object.assign(d.firmware, {name:String(p.name).slice(0,LIMITS.name), author:String(a.name||'').slice(0,LIMITS.author),
    description:String(p.description||'').slice(0,LIMITS.desc), repo:p.repo, authorUrl:safeHttps(a.url)});
  return d;
}

/* ============================================================
   FILES IN A REPOSITORY: default branch, GitHub (raw) or Codeberg (API, which sends CORS)
   ============================================================ */
const MAX_FILE = 400000;
const repoParts = url => { const m=String(url).match(/^https:\/\/(github\.com|codeberg\.org)\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)$/); return m && {host:m[1], owner:m[2], name:m[3]}; };
async function repoFile(repo, path){
  const r=repoParts(repo); if(!r) return null;
  const p=path.split('/').filter(s=>s && s!=='.' && s!=='..').map(encodeURIComponent).join('/');
  const gh=r.host==='github.com';
  const raw= gh? `https://raw.githubusercontent.com/${r.owner}/${r.name}/HEAD/${p}` : `https://codeberg.org/api/v1/repos/${r.owner}/${r.name}/raw/${p}`;
  try{
    const res=await fetch(raw); if(!res.ok) return null;
    const text=await res.text(); if(text.length>MAX_FILE) return null;
    return {path:decodeURIComponent(p), text, url: gh? `${repo}/blob/HEAD/${p}` : `${repo}/src/branch/HEAD/${p}`};
  }catch(e){ return null; }
}
async function repoReadme(repo){
  for(const n of ['README.md','readme.md','Readme.md']){ const f=await repoFile(repo,n); if(f) return f; }
  return null;
}
/* relative links to Markdown files that look like the manual (Creek keeps its controls in daisy/README.md) */
function manualLinks(md){
  const out=[];
  for(const [,text,href] of md.matchAll(/\[([^\]]*)\]\(([^)\s]+)\)/g)){
    const path=href.split('#')[0];
    if(!path || /^[a-z][a-z0-9+.-]*:|^\//i.test(path) || !/\.md$/i.test(path) || !/manual|controls|usage|guide/i.test(text+' '+path)) continue;
    let resolved; try{ resolved=decodeURIComponent(new URL(path,'https://r/').pathname.slice(1)); }catch(e){ continue; }
    if(!/^readme\.md$/i.test(resolved) && !out.includes(resolved)) out.push(resolved);
  }
  return out.slice(0,2);
}

/* A label file from a repository: only the label data, as strings of the usual lengths,
   and a browser build only if it comes from that same repository (emulatorOf) */
function labelFileDoc(d, repo){
  if(!d || typeof d!=='object' || !d.labels || !d.firmware) return null;
  const s=normalise(d), str=(v,n)=>typeof v==='string'? v.slice(0,n) : '';
  const labels={};
  for(const [id,o] of Object.entries(s.labels||{})){
    if(!SLOT[id] || !o || typeof o!=='object') continue;
    const c={}; for(const [k,v] of Object.entries(o)) if(/^(main|main_2|m_[PS]\d\d)$/.test(k)) c[k]=str(v, k==='main'? LIMITS.line : LIMITS.line2);
    labels[id]=c;
  }
  const fw={}; for(const [k,n] of Object.entries({name:LIMITS.name,author:LIMITS.author,version:LIMITS.version,description:LIMITS.desc,notes:LIMITS.notes,repo:200,authorUrl:200})) fw[k]=str(s.firmware[k],n);
  const num=v=>Number.isFinite(v)? v : 0;
  const offs=o=>Object.fromEntries(Object.entries(o||{}).filter(([k,v])=>v&&typeof v==='object').map(([k,v])=>[k,{x:num(v.x),y:num(v.y)}]));
  return {...emptyDoc(), firmware:{...emptyDoc().firmware,...fw}, labels,
    modifiers:(s.modifiers||[]).filter(id=>SLOT[id]), modTypes:Object.fromEntries(Object.entries(s.modTypes||{}).filter(([k,v])=>SLOT[k]&&v==='toggle')),
    customs:(s.customs||[]).filter(c=>c&&typeof c==='object').map(c=>({id:num(c.id), text:str(c.text,LIMITS.line), sub:str(c.sub,LIMITS.line2), x:num(c.x), y:num(c.y)})),
    offsets:{phone:offs(s.offsets.phone), desktop:offs(s.offsets.desktop)}, emulator:emulatorOf(d.emulator, repo)};
}

/* What the library and designer show for a directory entry, in this order:
   1. the repository's simple-touch-labels.json, made by its creator in the designer
   2. labels a script reads from its README (and a linked manual)
   3. the entry alone, with blank labels */
const repoReads = {};
const readRepo = p => repoReads[p.repo] ||= readRepoNow(p).catch(()=>({doc:communityDoc(p), source:'none', files:[]}));
async function readRepoNow(p){
  const base=communityDoc(p);
  const lf=await repoFile(p.repo, LABEL_FILE);
  if(lf){
    let d=null, faceplate=false; try{ const j=JSON.parse(lf.text); faceplate=!!(j&&j.faceplate); d=labelFileDoc(j, p.repo); }catch(e){}
    if(d){
      for(const k of ['name','author','description','repo','authorUrl']) if(!d.firmware[k].trim()) d.firmware[k]=base.firmware[k];
      return {doc:d, source:'file', files:[lf], faceplate};
    }
  }
  const rd=await repoReadme(p.repo);
  if(!rd) return {doc:base, source:'none', files:[]};
  const files=[rd];
  for(const path of manualLinks(rd.text)){ const f=await repoFile(p.repo,path); if(f) files.push(f); }
  const ex=extractLabels(files);
  if(!ex.found.length) return {doc:base, source:'none', files};
  base.labels=ex.labels; base.modifiers=ex.modifiers;
  return {doc:base, source:'readme', files, found:ex.found};
}

/* ============================================================
   README EXTRACTION: control names as READMEs write them → labels.
   Reads, best first: table rows (| S30 | **Cutoff** |), modifier pairs (P11 + S30 – Delay time,
   or **Width** (P10 + S30)), lines that start with a control (- **P01** - Throw a stone),
   headings (### Switch A — transport), then bold controls in sentences (**S32** harmonics).
   A guess: it can't tell modes apart, and it never reads code blocks.
   ============================================================ */
const PAD = n => 'P'+String(n).padStart(2,'0');
/* Synthux names (S30, P03, S07-S08), short pads (P3), Pd names (knob1, faderleft, sw1) and plain words */
/* case-sensitive on purpose: "Switch A" is a control, "switch a voice" is not */
const CTRL_RE = /\b(?:P(?<pad>1[01]|0?\d)|S(?<pot>3[0-7])|S0?(?<sw>7|8|9|10)(?:\s*[-/]\s*S0?(?:7|8|9|10))?|[Kk]nob\s?(?<knob>[1-6])|[Ff]ader\s?(?<fd1>[Ll]eft|[Rr]ight)|(?<fd2>[Ll]eft|[Rr]ight)\s(?:[Ff]ader|[Ss]lider)|(?:SW|sw|[Ss]witch)\s?(?<swn>[12AB])|(?<swd>[Ll]eft|[Rr]ight)\s(?:[Ss]witch|[Tt]oggle))\b/g;
const RANGE_RE = /\bP(1[01]|0?\d)\s*(?:–|—|-|\.{2,3}|…|to)\s*P(1[01]|0?\d)\b/g;
function ctrlOf(g){
  if(g.pad) return PAD(+g.pad);
  if(g.pot) return 'S'+g.pot;
  if(g.sw) return +g.sw<=8? 'S07_S08' : 'S09_S10';
  if(g.knob) return 'S'+(29+ +g.knob);
  const fd=g.fd1||g.fd2; if(fd) return /left/i.test(fd)? 'S36' : 'S37';
  if(g.swn) return /[1a]/i.test(g.swn)? 'S09_S10' : 'S07_S08';   // switch A / SW1 is the left one (S09/S10)
  if(g.swd) return /left/i.test(g.swd)? 'S09_S10' : 'S07_S08';
}
const tokens = s => [...s.matchAll(CTRL_RE)].map(m=>({id:ctrlOf(m.groups), i:m.index, j:m.index+m[0].length}));
const isPad = id => /^P\d\d$/.test(id);
/* Markdown down to lines: no code blocks, images or HTML; links become their text; bold stays */
const plainMd = md => md.replace(/\r/g,'').replace(/```[\s\S]*?```/g,'').replace(/<!--[\s\S]*?-->/g,'')
  .replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/<[^>]+>/g,' ').replace(/\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/`/g,'').replace(/__([^_\n]+)__/g,'**$1**');
const STOP = /^(to|and|or|the|a|an|is|are|while|then|with|for|in|on|at|of|by|as|left|right|up|down|centre|center|middle|press|hold|tap|turn|see|it|this|that|you|same|also|only)\b/i;
const GESTURE = /^(press|hold|tap|double[ -]?tap|long[ -]?press|turn|touch|-|—|–)$/i;
const capFirst = t => t.charAt(0).toUpperCase()+t.slice(1);
/* the label at the start of a description: bold text, or the first phrase */
function labelFrom(rest, maxWords=6){
  // without the closing ** of a bold control name, and the separator after it
  let r=rest.replace(/^\*\*(?=\s|[^*A-Za-z0-9]|$)/,'').replace(/^[\s:|·\-–—=→>),]+/,'');
  const b=r.match(/^\*\*([^*]{1,40})\*\*/);
  let t= b? b[1] : r.replace(/\*+/g,'').split(/\s[-–—|·]\s|[:;(|]|[.,](?:\s|$)/)[0];
  t=t.replace(/\*+/g,'').replace(/\s+/g,' ').trim().replace(/[.,:;]$/,'');
  if(t.length<2 || t.length>40 || !/^[A-Za-z0-9]/.test(t) || !/[A-Za-z]/.test(t) || STOP.test(t) || tokens(t).length || t.split(' ').length>maxWords) return '';
  return capFirst(t);
}
/* after a control, a label is set off: bold, or after a separator ("S31 **Scale**", "P01 - Throw a stone", "P10 + S30 | Drive") */
const setOff = s => /^\s*(?:\([^)]{0,20}\)\s*)?(?:\*\*[^*\s]|[-–—:·=→|]\s*)/.test(s.replace(/^\*\*(?=\s|[^*A-Za-z0-9]|$)/,''));
/* split a label over line 1 and line 2 at a word boundary */
function fitWords(t, max){
  if(t.length<=max) return [t,''];
  const w=t.split(' '); let a='';
  while(w.length && (a+' '+w[0]).trim().length<=max) a=(a+' '+w.shift()).trim();
  return a? [a, w.join(' ')] : [t.slice(0,max), ''];
}
function extractLabels(files){
  const best={}, modSeen=[];
  for(const f of files){
    for(const line of plainMd(f.text).split('\n')){
      const raw=line.trim(); if(!raw) continue;
      const excerpt=raw.length>160? raw.slice(0,157)+'…' : raw;
      const put=(id,key,text,tier)=>{
        if(!SLOT[id] || !text || key==='m_'+id) return;
        const k=id+'|'+key, o=best[k]; if(o && o.tier<=tier) return;
        best[k]={id,key,text,tier,file:f.path,url:f.url,line:excerpt};
        if(key.startsWith('m_') && !modSeen.includes(key.slice(2))) modSeen.push(key.slice(2));
      };
      const tk=tokens(raw);
      if(!tk.length) continue;
      // modifier pairs anywhere: "P11 + S30 – Delay time", "P11 + right fader (S37) - Cutoff", "**Width** (P10 + S30)"
      for(let n=0;n<tk.length-1;n++){
        const a=tk[n], b=tk[n+1];
        if(!isPad(a.id) || a.id===b.id || !/^\s*\*{0,2}\s*\+\s*\*{0,2}\s*$/.test(raw.slice(a.j,b.i))) continue;
        let end=b.j; const c=tk[n+2];
        if(c && c.id===b.id && /^\s*\(\s*$/.test(raw.slice(b.j,c.i))) end=c.j+1;   // "right fader (S37)"
        let t= setOff(raw.slice(end))? labelFrom(raw.slice(end)) : '';
        if(!t){ const m=raw.slice(0,a.i).match(/\*\*([^*]{1,40})\*\*\s*\(\s*(?:hold\s+)?$/i); if(m) t=labelFrom('**'+m[1]+'**'); }
        put(b.id,'m_'+a.id,t,raw.startsWith('|')? 1 : 2);
      }
      if(raw.startsWith('|')) tableRow(raw,put);
      else if(/^#{1,6}\s/.test(raw)) heading(raw,put);
      else if(!subjectLine(raw.replace(/^(?:[-*+>]|\d+[.)])\s+/,''),put)) prose(raw,put);
    }
  }
  const labels={}, found=Object.values(best);
  for(const b of found){
    const o=labels[b.id] ||= {};
    if(b.key==='main'){ const [l1,l2]=fitWords(b.text,LIMITS.line); o.main=l1; if(l2 && !NO_LINE2.includes(b.id)) o.main_2=fitWords(l2,LIMITS.line2)[0]; }
    else o[b.key]=fitWords(b.text,LIMITS.line2)[0];
  }
  const order=TABLE_ORDER.concat(SLOTS.map(s=>s.id));
  found.sort((x,y)=>order.indexOf(x.id)-order.indexOf(y.id) || (x.key==='main'? -1 : y.key==='main'? 1 : x.key.localeCompare(y.key)));
  return {labels, modifiers:modSeen.filter(id=>SLOT[id]).slice(0,MOD_MAX), found};
}
/* | S30 | **Main** — mix level |, | P03 | Press | **Saturation** burst |, | 22 | S31 **Scale** | */
function tableRow(raw, put){
  const cells=raw.replace(/^\||\|$/g,'').split('|').map(c=>c.trim());
  if(cells.every(c=>/^[\s:-]*$/.test(c))) return;
  for(let k=0;k<cells.length;k++){
    const c=cells[k].replace(/^\*\*(?=\S)/,''), t=tokens(c);
    if(!t.length || t[0].i>0) continue;
    if(t.some(x=>x.id!==t[0].id) || /^\s*\+/.test(c.slice(t[0].j))) return;   // a pair or a range ("P2 + pad"), not a name
    const own= setOff(c.slice(t[0].j))? labelFrom(c.slice(t[0].j)) : '';   // "S31 **Scale**", not "P10 alone"
    const next=own? '' : cells.slice(k+1).find(x=>x && !GESTURE.test(x) && !/^[\d\s.,%–-]+$/.test(x));
    put(t[0].id,'main',own||labelFrom(next||'',8),1);
    return;
  }
}
/* ### Switch A (left) — transport, ### Polyrhythmic Grid Shift — Switch A */
function heading(raw, put){
  const text=raw.replace(/^#+\s*/,''), t=tokens(text);
  if(!t.length || t.some(x=>x.id!==t[0].id) || /\([^)]*$/.test(text.slice(0,t[0].i))) return;   // not "### Basic Pitch (SW2 Down)": a mode
  const rest=(text.slice(0,t[0].i)+' '+text.slice(t[0].j)).replace(/\([^)]{0,20}\)/g,' ').replace(/^[\s:—–-]+|[\s:—–-]+$/g,'');
  put(t[0].id,'main',labelFrom(rest),3);
}
/* a line that starts with a control (or a pad range): "**P01** - Throw a stone", "S36 (left) **Level** | …" */
function subjectLine(body, put){
  const lead=body.replace(/^\*\*/,'');
  const rg=[...lead.matchAll(RANGE_RE)][0];
  if(rg && rg.index===0){ rangeList(+rg[1],+rg[2],lead.slice(rg[0].length),put,2); return true; }
  const t=tokens(lead); if(!t.length || t[0].i>0) return false;
  // a list entry ("- **P10** - Freeze", "- P03 Kick"), not a sentence ("Switch B selects one of three scenes")
  const after=lead.slice(t[0].j); if(!setOff(after) && after.trim().split(/\s+/).length>3) return false;
  // several "**P03** - Quiet trickle | **P04** - Rocky creek" on one line
  const segs=body.split(/\s\|\s/), many=segs.length>1 && segs.every(s=>{ const x=tokens(s.replace(/^\s*\*\*/,'')); return x.length && x[0].i===0; });
  for(const seg of many? segs : [body]){
    const s=seg.trim().replace(/^\*\*/,''), x=tokens(s)[0];
    const rest=s.slice(x.j).replace(/^\*\*/,'').replace(/^\s*\([^)]{0,20}\)/,'');
    put(x.id,'main',labelFrom(rest),2);
    // "… | Hold P10: **Width**": the same control with a modifier
    if(!many) for(const m of rest.matchAll(/\bhold\s+P(1[01]|0?\d)\s*[:\-–—]\s*/gi)) put(x.id,'m_'+PAD(+m[1]),labelFrom(rest.slice(m.index+m[0].length)),2);
  }
  return true;
}
/* P03–P09 followed by as many names as pads ("kick, snare, …"), or one name for all of them */
function rangeList(a, b, rest, put, tier, listOnly=false){
  if(b<=a || b-a>11) return;
  const ids=[]; for(let n=a;n<=b;n++) ids.push(PAD(n));
  const items=rest.replace(/^\*\*/,'').replace(/^[\s:—–-]+/,'').replace(/\.\s*$/,'').split(/,\s*|\s+and\s+/).map(s=>s.trim());
  if(items.length===ids.length && items.every(s=>s && s.split(' ').length<=4)){ ids.forEach((id,n)=>put(id,'main',labelFrom(items[n]),tier)); return; }
  if(!listOnly){ const t=labelFrom(rest); if(t) ids.forEach(id=>put(id,'main',t,tier)); }
}
/* sentences: "**S32** harmonics, **S33** timbre", "Turn **S31** for tempo", "the musical pads **P3–P9** — kick, snare, …" */
function prose(raw, put){
  for(const m of raw.matchAll(/\*\*([^*]{1,24})\*\*\s+(?:for\s+|sets?\s+(?:the\s+)?)?([A-Za-z][\w'↔/ -]{1,30}?)(?=\s*(?:[,.;:)]|$)|\s(?:and|while|then|to)\s)/g)){
    const t=tokens(m[1]);
    if(t.length!==1 || t[0].i>0 || t[0].j<m[1].trim().length) continue;
    put(t[0].id,'main',labelFrom(m[2],3),4);
  }
  for(const m of raw.matchAll(RANGE_RE)) rangeList(+m[1],+m[2],raw.slice(m.index+m[0].length),put,3,true);
}
