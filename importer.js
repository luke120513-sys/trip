/* 旅伴 匯入行程（延遲載入） */
(function(){
const H={day:/^(第?幾?天|第\s*\d*\s*天|day|天數|日次|d)$/i,date:/^(日期|date|日付)$/i,time:/^(時間|time|時刻|開始時間|start)$/i,name:/^(地點|景點|名稱|行程|活動|項目|place|name|location|spot|title|summary|地名)$/i,note:/^(備註|說明|note|notes|memo|描述|description|remark)$/i};
const pad=n=>String(n).padStart(2,'0'),iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
// YYYY-MM-DD 且為真實存在的日期（排除 2026-02-31、2026-13-01）
const okDate=s=>{if(typeof s!=='string'||!/^\d{4}-\d\d-\d\d$/.test(s))return false;const d=new Date(s+'T00:00:00');return!isNaN(d)&&iso(d)===s},vd=s=>okDate(s)?s:null;
function normDate(v){if(v==null||v==='')return null;if(v instanceof Date)return iso(v);if(typeof v==='number'&&v>20000&&v<80000){const d=new Date(Math.round((v-25569)*864e5));return vd(d.toISOString().slice(0,10))}
 const s=String(v).trim();let m=/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/.exec(s);if(m)return vd(m[1]+'-'+pad(m[2])+'-'+pad(m[3]));m=/^(\d{1,2})[/月-](\d{1,2})日?$/.exec(s);if(m){const y=new Date().getFullYear();return vd(y+'-'+pad(m[1])+'-'+pad(m[2]))}return null}
function normTime(v){if(v==null||v==='')return'';if(typeof v==='number'&&v<1){const m=Math.round(v*1440);return pad(Math.floor(m/60))+':'+pad(m%60)}const m=/(\d{1,2})[:：時](\d{2})?/.exec(String(v));return m?pad(m[1])+':'+(m[2]||'00'):''}
function dayNum(v){const m=/(\d+)/.exec(String(v??''));return m?+m[1]:null}
function fromTable(rows){rows=rows.filter(r=>r&&r.some(c=>String(c??'').trim()!==''));if(!rows.length)return{rows:[]};
 const hd=rows[0].map(c=>String(c??'').trim().replace(/\s/g,''));const col={};hd.forEach((h,i)=>{for(const k in H)if(col[k]==null&&H[k].test(h))col[k]=i});
 let body=rows.slice(1);if(col.name==null){// 無表頭：猜 [日/日期, 時間, 地點, 備註]
  body=rows;const r0=rows[0];col.time=r0.findIndex(c=>/^\d{1,2}[:：]\d{2}/.test(String(c)));col.name=col.time>=0?col.time+1:0;col.note=col.name+1;if(col.time>0){if(normDate(r0[0]))col.date=0;else col.day=0}}
 const out=[];for(const r of body){const name=String(r[col.name]??'').trim();if(!name)continue;out.push({day:col.day!=null?dayNum(r[col.day]):null,date:col.date!=null?normDate(r[col.date]):null,time:col.time!=null?normTime(r[col.time]):'',name,note:col.note!=null?String(r[col.note]??'').trim():''})}
 return{rows:out,cols:Object.keys(col).filter(k=>col[k]!=null&&col[k]>=0)}}
function csv(text){const rows=[];let r=[],f='',q=false;text=text.replace(/^\uFEFF/,'');const sep=(text.split('\n')[0].match(/\t/g)||[]).length>(text.split('\n')[0].match(/,/g)||[]).length?'\t':',';
 for(let i=0;i<text.length;i++){const c=text[i];if(q){if(c==='"'){if(text[i+1]==='"'){f+='"';i++}else q=false}else f+=c}else if(c==='"')q=true;else if(c===sep){r.push(f);f=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;r.push(f);rows.push(r);r=[];f=''}else f+=c}
 if(f!==''||r.length){r.push(f);rows.push(r)}return rows}
function ics(text){const L=text.replace(/\r?\n[ \t]/g,'').split(/\r?\n/);const out=[];let e=null;
 const val=l=>l.slice(l.indexOf(':')+1).replace(/\\n/gi,' ').replace(/\\([,;\\])/g,'$1').trim();
 for(const l of L){if(l==='BEGIN:VEVENT')e={};else if(l==='END:VEVENT'){if(e&&e.s&&e.name)out.push(e);e=null}else if(e){const k=l.split(/[;:]/)[0];
  if(k==='DTSTART'){const v=val(l);const m=/^(\d{4})(\d\d)(\d\d)(?:T(\d\d)(\d\d)(\d\d)?(Z)?)?/.exec(v);if(m){if(m[7]){const d=new Date(Date.UTC(+m[1],m[2]-1,+m[3],+m[4],+m[5]));e.s=iso(d);e.t=pad(d.getHours())+':'+pad(d.getMinutes())}else{e.s=vd(m[1]+'-'+m[2]+'-'+m[3]);e.t=m[4]?m[4]+':'+m[5]:''}}}
  else if(k==='SUMMARY')e.name=val(l);else if(k==='LOCATION')e.loc=val(l);else if(k==='DESCRIPTION')e.desc=val(l)}}
 return{rows:out.map(e=>({date:e.s,time:e.t,name:e.name,note:[e.loc&&e.loc!==e.name?e.loc:'',e.desc].filter(Boolean).join(' · ').slice(0,200)})),cols:['date','time','name','note']}}
function text(t){const out=[];let day=null,date=null;
 for(let l of t.split(/\r?\n/)){l=l.trim().replace(/^[-*•・]\s*/,'');if(!l)continue;if(PK[l]&&!/^[A-Z]{3}$/.test(l)){out.dest=l;continue}
  let m=/^(?:day\s*(\d+)|d(\d+)\b|第\s*(\d+)\s*天|(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}\/\d{1,2}))[\s:：.,、）)\-]*(.*)$/i.exec(l);
  if(m){if(m[4]){date=normDate(m[4]);day=null}else{day=+(m[1]||m[2]||m[3]);date=null}l=m[5].replace(/^[（(][^）)]*[）)]\s*/,'').trim();if(!l)continue}
  const tm=/^(\d{1,2}[:：]\d{2})(?:\s*[-~～–]\s*\d{1,2}[:：]\d{2})?\s*/.exec(l);let time='';if(tm){time=normTime(tm[1]);l=l.slice(tm[0].length)}
  let name=l,note='';const sp=/\s+[-｜|—]\s+|｜|\s*[（(]/.exec(l);if(sp&&sp.index>0){name=l.slice(0,sp.index).trim();note=l.slice(sp.index+sp[0].length).replace(/[）)]$/,'').trim()}
  if(name)out.push({day,date,time,name,note})}
 return{rows:out,cols:['day','time','name','note']}}
async function xlsx(buf){if(!window.XLSX)await new Promise((ok,no)=>{const s=document.createElement('script');s.src='vendor/xlsx.full.min.js';s.onload=ok;s.onerror=no;document.head.append(s)});
 const wb=XLSX.read(buf,{type:'array',cellDates:true});const ws=wb.Sheets[wb.SheetNames[0]];return fromTable(XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:''}))}
const S=v=>v==null?'':typeof v==='string'?v:typeof v==='number'?String(v):'';
function jSpot(s){if(!s||typeof s!=='object'||Array.isArray(s))return null;const o={...s,time:/^\d\d:\d\d$/.test(s.time)?s.time:'',name:S(s.name).trim(),note:S(s.note)};if(!o.name)return null;
 o.link=typeof s.link==='string'&&/^(https?:\/\/|\/)/.test(s.link)?s.link:undefined;if(s.src!=null)o.src=Array.isArray(s.src)?s.src.filter(u=>typeof u==='string'&&/^https?:\/\//.test(u)):[];
 if(s.price!=null&&!Number.isFinite(+s.price))delete o.price;if(s.arr!=null&&!/^\d\d:\d\d$/.test(s.arr))delete o.arr;return o}
function json(t){let j;try{j=JSON.parse(t)}catch{throw new Error('JSON 格式有誤，無法解析')}const arr=Array.isArray(j)?j:j&&Array.isArray(j.trips)?j.trips:[j];
 const isT=x=>x&&typeof x==='object'&&x.dest!=null&&x.dep!=null&&Array.isArray(x.days);const cand=arr.filter(isT);if(!cand.length)throw new Error('不是旅伴匯出的 JSON');
 const ok=[],bad=[];for(const x of cand){const dest=S(x.dest).trim(),dep=x.dep,ret=x.ret==null||x.ret===''?dep:x.ret;
  if(!dest){bad.push('（未命名）缺少目的地');continue}
  if(!okDate(dep)||!okDate(ret)){bad.push(`「${dest}」日期需為 YYYY-MM-DD 格式的有效日期`);continue}
  if(ret<dep){bad.push(`「${dest}」回程日期早於出發日期`);continue}
  const n=Math.round((new Date(ret)-new Date(dep))/864e5)+1;if(n>366){bad.push(`「${dest}」行程超過 366 天`);continue}
  const pax=Math.round(+x.pax);ok.push({...x,dest,dep,ret,pax:pax>=1&&pax<=9?pax:2,orig:/^[A-Z]{3}$/.test(x.orig)?x.orig:'TPE',days:x.days.map(d=>Array.isArray(d)?d.map(jSpot).filter(Boolean):[])})}
 if(!ok.length)throw new Error('無法匯入：'+bad.slice(0,3).join('；'));if(bad.length)ok.skipped=bad.length;return{trips:ok}}
async function pdfText(buf){const L=await import(new URL('vendor/pdfjs/pdf.min.mjs',location.href).href);L.GlobalWorkerOptions.workerSrc=new URL('vendor/pdfjs/pdf.worker.min.mjs',location.href).href;
 const doc=await L.getDocument({data:new Uint8Array(buf)}).promise;let out=[];
 for(let p=1;p<=doc.numPages;p++){const c=await (await doc.getPage(p)).getTextContent();const ln=[];
  for(const it of c.items){if(!it.str||!it.str.trim())continue;const y=it.transform[5],x=it.transform[4];let l=ln.find(l=>Math.abs(l.y-y)<3);if(!l)ln.push(l={y,a:[]});l.a.push({x,s:it.str})}
  ln.sort((a,b)=>b.y-a.y);for(const l of ln)out.push(l.a.sort((a,b)=>a.x-b.x).map(o=>o.s).join(' ').replace(/\s+/g,' ').trim())}
 const RS={'⻄':'西','⻑':'長','⻘':'青','⻝':'食','⻣':'骨','⻤':'鬼','⻩':'黃','⻨':'麥','⻁':'虎','⻆':'角','⻌':'辶','⻔':'門'};
 return out.join('\n').normalize('NFKC').replace(/[\u2E80-\u2EFF]/g,c=>RS[c]||c).replace(/([\u3000-\u9FFF\uFF00-\uFFEF])\s+(?=[\u3000-\u9FFF\uFF00-\uFFEF])/g,'$1')}
// 訂購明細（機票＋住宿）版面
function booking(t){const out=[];const D=/(\d{4})[\/.\-年](\d{1,2})[\/.\-月](\d{1,2})/g;const seen=new Set();
 const re=/\b([A-Z][A-Z0-9]|[A-Z0-9][A-Z])\s?(\d{2,4})\b/g;let m;
 while((m=re.exec(t))){const c=m[1];if(!AL[c]||seen.has(c+m[2]))continue;const bef=t.slice(Math.max(0,m.index-220),m.index),aft=t.slice(m.index+m[0].length,m.index+m[0].length+220);
  const ds=[...bef.matchAll(D)].slice(-2);const io=/\b([A-Z]{3})\s+([A-Z]{3})\b/.exec(aft);const ts=[...aft.matchAll(/\b(\d{1,2}:\d{2})\b/g)].slice(0,2);if(!io||!ts.length)continue;
  seen.add(c+m[2]);const d0=ds[0]?normDate(ds[0][0]):null;out.push({date:d0,time:normTime(ts[0][1]),name:`${c}${m[2]} ${io[1]}→${io[2]}`,note:ts[1]?'抵達 '+ts[1][1]+(ds[1]&&ds[1][0]!==ds[0][0]?' (+1)':''):'',fl:{from:io[1],to:io[2]}})}
 const hr=/(?:入住退房日期|Check\s*in)[^：:\n]*[：:]\s*(\d{4}\/\d{1,2}\/\d{1,2})\s*[~～\-至]\s*(\d{4}\/\d{1,2}\/\d{1,2})(?:\s*共\s*(\d+)\s*晚)?/gi;let h;
 while((h=hr.exec(t))){const before=t.slice(0,h.index);const ai=before.lastIndexOf('地址');let name='住宿',addr='';
  if(ai>=0){const seg=before.slice(Math.max(0,ai-200),ai).split('\n').map(s=>s.trim()).filter(s=>s&&!/Hotel Information|飯店資料|^\d+$/.test(s));name=(seg.pop()||'住宿').replace(/^\d+\s+/,'').replace(/\s+\d+$/,'');
   addr=(/地址[^：:]*[：:]\s*([^\n]+?)(?:\s+\d{0,2}\s*電話|\n|$)/.exec(t.slice(ai))||[])[1]||'';addr=addr.replace(/^\d+\s+/,'').trim()}
  const ci=normDate(h[1]),co=normDate(h[2]);out.push({date:ci,time:'15:00',name,note:['入住',h[3]?'共'+h[3]+'晚':'',addr.split(/\s(?=\d+-\d+-\d+\s+[A-Z])/)[0]].filter(Boolean).join(' · '),kind:'hotel',addr});
  out.push({date:co,time:'11:00',name,note:'退房',kind:'hotel',addr})}
 if(out.length){const o=out.find(r=>r.fl);if(o&&PK[o.fl.to]){const v=PK[o.fl.to];out.dest=Object.keys(PK).find(k=>PK[k]===v&&!/^[A-Z]{3}$/.test(k))}}
 out.sort((a,b)=>(a.date||'').localeCompare(b.date||'')||(a.time||'').localeCompare(b.time||''));return out}
async function pdf(buf){let t;try{t=await pdfText(buf)}catch(e){throw new Error('PDF 讀取失敗：'+(e.message||e))}
 if(t.replace(/\s/g,'').length<30)throw new Error('這份 PDF 沒有文字層（可能是掃描檔或圖片），目前不支援 OCR');
 const b=booking(t);if(b.length)return{rows:b,cols:['date','time','name','note'],src:'pdf'};const r=text(t);if(!r.rows.length)throw new Error('PDF 中找不到行程、航班或住宿資訊');return r}
async function parseFile(f){const n=f.name.toLowerCase();if(/\.(xlsx|xls|ods)$/.test(n))return xlsx(await f.arrayBuffer());
 if(/\.pdf$/.test(n)||f.type==='application/pdf')return pdf(await f.arrayBuffer());
 if(/\.(png|jpe?g|heic|webp)$/.test(n))throw new Error('目前不支援截圖／圖片，請改用 PDF、CSV、Excel、.ics 或直接貼上文字');
 const t=await f.text();if(/\.json$/.test(n))return json(t);if(/\.ics$/.test(n)||/BEGIN:VCALENDAR/.test(t))return ics(t);if(/\.(csv|tsv)$/.test(n))return fromTable(csv(t));return parseText(t)}
function parseText(t){t=t.trim();if(/^[\[{]/.test(t))return json(t);if(/BEGIN:VCALENDAR/.test(t))return ics(t);const first=t.split('\n')[0];if(/[,\t]/.test(first)&&Object.values(H).some(h=>first.split(/[,\t]/).some(c=>h.test(c.trim()))))return fromTable(csv(t));return text(t)}
// --- 轉成天數
const FL=/^([A-Z][A-Z0-9]|[A-Z0-9][A-Z])\s?(\d{1,4})\b\s*(.*)$/;
function toDays(rows,dep){const dated=rows.filter(r=>r.date);let base=dep;if(dated.length){base=dated.map(r=>r.date).sort()[0]}
 const idx=r=>r.date?Math.round((new Date(r.date)-new Date(base))/864e5):(r.day?r.day-1:null);let last=0;const D=[];
 for(const r of rows){let i=idx(r);if(i==null||i<0)i=last;last=i;(D[i]=D[i]||[]).push(r)}for(let i=0;i<D.length;i++)D[i]=D[i]||[];if(!D.length)D.push([]);
 return{dep:base,days:D}}
function guessDest(rows){if(rows.dest)return rows.dest;const s=rows.map(r=>r.name+' '+r.note).join(' ');for(const k of Object.keys(PK))if(k.length>=2&&!/^[A-Z]{3}$/.test(k)&&s.includes(k))return k;return''}
let R=null;function toEdit(){if($('#sheet').classList.contains('on')){hideSheet();history.replaceState({tab:'edit'},'')}tab='edit';render()}
window.importSheet=function(){$('#sheetBody').innerHTML=`<h2>匯入行程</h2><p class="mut">支援旅伴匯出的 JSON、CSV、Excel（.xlsx）、行事曆（.ics），、訂購明細 PDF（需有文字層），或直接貼上文字（例如「Day1 10:00 淺草寺」）。不支援截圖與掃描檔。</p>
<label class="btn blk" style="text-align:center;cursor:pointer">選擇檔案<input type="file" id="impf" accept=".pdf,.json,.csv,.tsv,.txt,.xlsx,.xls,.ods,.ics" hidden onchange="impFile(this.files[0])"></label>
<label class="fld" style="margin-top:10px">或貼上行程文字<textarea id="impt" rows="6" placeholder="Day1\n10:00 淺草寺\n12:00 淺草今半 - 壽喜燒\nDay2\n09:00 明治神宮\nBR198 08:50 TPE→NRT"></textarea></label>
<div class="row"><button class="btn ghost" onclick="closeSheet()">取消</button><button class="btn" onclick="impPaste()">解析文字</button></div>
<p class="mut" style="margin-top:10px">範本下載：<a href="data/import-template.csv" download>CSV</a>・<a href="data/import-template.xlsx" download>Excel</a>（欄位：第幾天／日期、時間、地點、備註；表頭名稱寫法不拘）</p>
<h3 style="margin:16px 2px 6px">從網址匯入</h3>
<p class="mut">貼上 YouTube 影片、Instagram 貼文或 Reels、或部落格／文章網址。旅伴會盡力從標題、說明與字幕找出景點，也會整理必買、注意事項和出發前要做。可能漏掉或認錯，請在預覽勾選。不是完整清單。</p>
<label class="fld">網址<input id="impurl" inputmode="url" placeholder="https://www.youtube.com/watch?v=…" autocomplete="off"></label>
<div class="row"><button class="btn" type="button" onclick="impUrl()">讀取網址</button></div>`;openSheet()};
window.impFile=async function(f){if(!f)return;try{R=await parseFile(f);preview()}catch(e){toast(e.message||'無法讀取這個檔案')}};
window.impPaste=function(){const t=$('#impt').value;if(!t.trim())return toast('請先貼上內容');try{R=parseText(t);preview()}catch(e){toast(e.message||'無法解析')}};
function preview(){if(R.trips){$('#sheetBody').innerHTML=`<h2>匯入旅伴行程</h2><p>找到 ${R.trips.length} 個行程${R.trips.skipped?`（另有 ${R.trips.skipped} 個資料有誤，已略過）`:''}：</p>${R.trips.map(t=>`<div class="card"><b>${esc(t.dest)}</b> <span class="mut">${esc(t.dep)} → ${esc(t.ret)} · ${t.days.flat().length} 個景點</span></div>`).join('')}<p class="mut">會新增為新行程，不會覆蓋現有行程。</p><div class="row"><button class="btn ghost" onclick="closeSheet()">取消</button><button class="btn" onclick="impApply('json')">匯入</button></div>`;return}
 if(!R.rows.length)return toast('沒有找到可匯入的行程項目');const t=T();const def=t?.dep||new Date(Date.now()+14*864e5).toISOString().slice(0,10);const {dep,days}=toDays(R.rows,def);
 const dest=guessDest(R.rows)||t?.dest||'';const nF=R.rows.filter(r=>FL.test(r.name)&&AL[FL.exec(r.name)[1]]).length;
 $('#sheetBody').innerHTML=`<h2>預覽匯入</h2><p class="mut">共 ${R.rows.length} 筆、${days.length} 天${nF?`，其中 ${nF} 筆航班`:''}。地點若在推薦清單中，會自動帶入評分、價格與座標。</p>
 <div style="max-height:34vh;overflow:auto;border:1px solid var(--bd);border-radius:12px;padding:6px 10px;margin-bottom:10px">${days.map((d,i)=>`<div style="margin:4px 0"><b>Day ${i+1}</b>${d.map(r=>`<div class="mut" style="font-size:13px">${esc(r.time||'—')}　${esc(FL.test(r.name)?apTxt(r.name):r.name)}${r.note?' · '+esc(r.note):''}</div>`).join('')||'<div class="mut">（空）</div>'}</div>`).join('')}</div>
 <label class="fld">目的地<input id="imd" list="cities" value="${esc(dest)}" placeholder="例：東京"></label><label class="fld">第一天日期<input type="date" id="imdep" value="${esc(dep)}"></label>
 <div class="row"><button class="btn ghost" onclick="closeSheet()">取消</button>${t?`<button class="btn ghost" onclick="impApply('merge')">合併到目前行程</button>`:''}<button class="btn" onclick="impApply('new')">建立新行程</button></div>${t?`<p class="mut">合併會依天數加到「${esc(t.dest)} ${esc(t.dep)}」，不刪除原有景點。</p>`:''}`}
window.impApply=async function(mode){if(mode==='json'){for(const x of R.trips){const t={...x,id:Date.now().toString(36)+Math.random().toString(36).slice(2,5)};trips.unshift(t);cur=t.id}save();toEdit();toast('已匯入 '+R.trips.length+' 個行程');return}
 const dest=$('#imd').value.trim(),dep=$('#imdep').value;if(!dest||!dep)return toast('請填寫目的地與日期');const dd=toDays(R.rows,dep).days;
 let t;if(mode==='merge'){t=T()}else{const r=new Date(dep);r.setDate(r.getDate()+dd.length-1);t={id:Date.now().toString(36),dest,dep,ret:iso(r),pax:2,orig:'TPE',days:[]};trips.unshift(t);cur=t.id}
 const off=mode==='merge'?Math.max(0,Math.round((new Date(dep)-new Date(t.dep))/864e5)):0;if(mode==='merge'){const need=off+dd.length;const r=new Date(t.dep);r.setDate(r.getDate()+need-1);if(iso(r)>t.ret)t.ret=iso(r)}
 days(t);let ds=null,P=null;const k=PKEY(t);if(k){try{P=await needPlanner();ds=await P.load(k)}catch{}}let hit=0;
 dd.forEach((d,i)=>{const td=t.days[off+i];for(const r of d){const f=FL.exec(r.name);let s;
  if(f&&AL[f[1]]){const rt=(r.name+' '+r.note).match(/([A-Z]{3})\s*(?:→|->|-|–|~)\s*([A-Z]{3})/);const ar=(r.note.match(/抵達\s*(\d{1,2}:\d{2})/)||[])[1];s={time:r.time,name:`${f[1]}${f[2]}${rt?' '+rt[1]+'→'+rt[2]:''}`,note:[AL[f[1]],r.note].filter(Boolean).join(' · '),kind:'flight',leg:(r.fl&&/^(TPE|TSA|KHH|RMQ)$/.test(r.fl.to))||(!r.fl&&i===dd.length-1&&dd.length>1)?'return':'out',arr:ar}}
  else if(r.kind==='hotel'){s={time:r.time,name:r.name,note:r.note,kind:'hotel',link:'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(r.addr||r.name)}}
  else{const it=ds&&P.best(ds,r.name);if(it){hit++;s={...P.toSpot(it,540,ds),kind:'ds',time:r.time,note:r.note||[it.area,it.note].filter(Boolean).join(' · ')}}else{s={time:r.time,name:r.name,note:r.note};if(k){s.link='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(r.name+' '+t.dest);s.nodata=1}}}
  td.push(s)}td.sort((a,b)=>(a.time||'99').localeCompare(b.time||'99'))});
  save();toEdit();toast(`已匯入 ${R.rows.length} 筆${hit?`，${hit} 筆帶入推薦資料`:''}`)};

let uiP=null,U=null,urlBusy=false;
function needUrl(){return uiP||(uiP=new Promise((ok,no)=>{if(window.UrlImport){ok(window.UrlImport);return}const e=document.createElement('script');e.src='urlimport.js';e.onload=()=>ok(window.UrlImport);e.onerror=()=>{uiP=null;no()};document.head.append(e)}))}
const cityCache={};
async function loadCityItems(keys){const items=[];
 for(const k of keys){if(!cityCache[k]){try{const r=await fetch('data/'+k+'.json');if(r.ok)cityCache[k]=await r.json()}catch{cityCache[k]=null}}
  const d=cityCache[k];if(!d||!Array.isArray(d.items))continue;const city=Object.keys(PK).find(n=>PK[n]===k&&!/^[A-Z]{3}$/.test(n))||k;
  for(const it of d.items)if(it&&it.name&&!it.closed)items.push({...it,city,dataset:k})}
 return items}
async function itemsFor(text,hint){const hits=UrlImport.cityHits(text).map(x=>x.city);if(hint&&!hits.includes(hint))hits.unshift(hint);
 const keys=[];for(const c of hits){const k=PK[c];if(k&&!keys.includes(k))keys.push(k)}
 if(!keys.length){for(const k of Object.values(PK))if(k&&!/^[A-Z]{3}$/.test(k)&&!keys.includes(k))keys.push(k)}
 return loadCityItems(keys.slice(0,10))}
async function getText(url,ms){const r=await fetch(url,{signal:AbortSignal.timeout(ms||12000),headers:{Accept:'text/plain, application/json;q=0.9, */*;q=0.8'}});if(!r.ok)throw new Error('http');return r.text()}
function mapLink(p,dest){if(Number.isFinite(+p.lat)&&Number.isFinite(+p.lng))return 'https://www.google.com/maps/search/?api=1&query='+p.lat+','+p.lng;return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent((p.name||'')+' '+(dest||p.city||''))}
function hm(m){return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
async function fetchSource(info){
 if(info.kind==='youtube'){const watch=info.url;let title='',page='',caps='';
  const jobs=[];
  jobs.push(getText('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent(watch),8000).then(t=>{try{const j=JSON.parse(t);if(j&&j.title)title=j.title}catch{}}).catch(()=>{}));
  jobs.push(getText('https://noembed.com/embed?url='+encodeURIComponent(watch),8000).then(t=>{try{const j=JSON.parse(t);if(j&&j.title&&!j.error)title=title||j.title}catch{}}).catch(()=>{}));
  jobs.push(getText('https://r.jina.ai/'+watch,22000).then(t=>{page=t}).catch(()=>{}));
  jobs.push(getText('https://www.youtube.com/api/timedtext?type=list&v='+info.id,6000).then(async list=>{
   const lang=(/lang_code="([a-zA-Z-]{2,12})"/.exec(list)||[])[1];if(!lang)return;
   const body=await getText('https://www.youtube.com/api/timedtext?v='+info.id+'&lang='+encodeURIComponent(lang),8000);
   caps=UrlImport.captionsText(body)}).catch(()=>{}));
  await Promise.all(jobs);
  const clipped=page?UrlImport.clipYoutube(page,info.id):'';
  const text=[title,caps,clipped].filter(Boolean).join('\n').trim();
  if(UrlImport.readerFailed(text)&&!title)return {ok:false,kind:'youtube',title};
  return {ok:!!text,kind:'youtube',title:title||(clipped.split('\n')[0]||''),text,url:watch}}
 if(info.kind==='instagram'){let title='',desc='';
  const tries=[
   getText('https://noembed.com/embed?url='+encodeURIComponent(info.url),8000).then(t=>{try{const j=JSON.parse(t);if(j&&!j.error){title=j.title||'';desc=j.description||j.author_name||''}}catch{}}).catch(()=>{}),
   getText('https://www.instagram.com/api/v1/oembed/?url='+encodeURIComponent(info.url),8000).then(t=>{try{const j=JSON.parse(t);if(j&&(j.title||j.author_name)){title=title||j.title||'';desc=desc||j.title||''}}catch{}}).catch(()=>{}),
   getText('https://r.jina.ai/'+info.url,18000).then(t=>{if(!UrlImport.readerFailed(UrlImport.clipArticle(t)))desc=desc||UrlImport.clipArticle(t)}).catch(()=>{})
  ];
  await Promise.all(tries);
  const text=[title,desc].filter(Boolean).join('\n').trim();
  if(UrlImport.readerFailed(text))return {ok:false,kind:'instagram',title};
  return {ok:true,kind:'instagram',title,text,url:info.url}}
 let page='';
 try{page=await getText('https://r.jina.ai/'+info.url,22000)}catch{page=''}
 const text=page?UrlImport.clipArticle(page):'';
 if(UrlImport.readerFailed(text))return {ok:false,kind:'article',title:''};
 const title=(/^Title:\s*(.+)$/m.exec(page)||[])[1]||text.split('\n')[0].slice(0,80);
 return {ok:true,kind:'article',title,text,url:info.url}}
function pastePrompt(kind,title){const why=kind==='instagram'?'讀不到這則 Instagram。這個平台常常擋住未登入的讀取。':kind==='youtube'?'讀不到這部影片的標題或說明。':'這篇網頁讀不到，網站可能擋住自動讀取。';
 $('#sheetBody').innerHTML=`<h2>改貼說明文字</h2><p class="mut">${why}請把貼文說明、影片描述或字幕貼在下面。景點和任務表都是盡力擷取，不是完整清單。</p>${title?`<p><b>${esc(title)}</b></p>`:''}<label class="fld">說明文字<textarea id="impcap" rows="8" placeholder="例如：第一天去淺草寺，必買人形燒。記得買 Skyliner。淺草寺要排隊。"></textarea></label><div class="row"><button class="btn ghost" type="button" onclick="importSheet()">返回</button><button class="btn" type="button" onclick="impCaption()">從文字辨識</button></div>`}
async function geocodePending(pending,dest){const out=[];const seen=new Set();
 for(const q of pending.slice(0,8)){const key=q.toLowerCase();if(seen.has(key))continue;seen.add(key);
  if(!/[\u3040-\u30ff\u4e00-\u9fff]/.test(q)&&!/\s/.test(q))continue;
  if(typeof geoSearch!=='function')break;
  try{const hits=await geoSearch(q,dest);const h=hits&&hits[0];if(!h||!Number.isFinite(+h.lat))continue;
   if(h.name&&/^(日本|東京都|tokyo|japan)$/i.test(String(h.name).trim()))continue;
   const blob=[h.addr,h.city,h.name].filter(Boolean).join(' ');
   if(dest&&/東京|大阪|京都|福岡|沖繩|札幌|名古屋/.test(dest)&&h.addr&&!/東京|大阪|京都|福岡|沖繩|札幌|名古屋|日本|japan|tokyo|osaka|kyoto|fukuoka/i.test(blob))continue;
   const hint=h.hint||(typeof PlaceQ!=='undefined'&&PlaceQ.hint?PlaceQ.hint(h.name):'');
   out.push({name:q,local:h.name&&h.name!==q?h.name:'',zh:hint&&hint!==q?hint:'',area:'',type:'',pid:'',city:dest||'',lat:+h.lat,lng:+h.lng,source:'geo',addr:h.addr||''})}catch{}}
 return out}
async function buildPlaces(text,hint){const items=await itemsFor(text,hint);const ex=UrlImport.extractPlaces(text,items);
 const city=hint||UrlImport.guessCity(text)||(T()&&T().dest)||'';
 const geo=await geocodePending(ex.pending,city);
 const places=UrlImport.dedupePlaces(ex.places.concat(geo));
 const tasks=(UrlImport.extractTasks(text,places)||[]).map(x=>({...x,on:true}));
 return {places,city,days:UrlImport.guessDays(text,places.length||1),tasks}}
const TASK_SEC=[['buy','必買'],['note','注意'],['prep','出發前要做']];
function taskPreviewRow(x,i){const sec=x.section==='note'||x.section==='prep'?x.section:'buy';
 return `<div class="card" data-tk="${i}" style="margin-bottom:8px"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-tk-on ${x.on===false?'':'checked'} style="width:22px;height:22px"><b>帶進任務表</b></label><label class="fld">內容<input data-tk-text maxlength="80" value="${esc(x.text||'')}"></label><label class="fld">分類<select data-tk-sec>${TASK_SEC.map(([k,lab])=>`<option value="${k}"${sec===k?' selected':''}>${lab}</option>`).join('')}</select></label><label class="fld">相關景點（選填）<input data-tk-spot maxlength="80" value="${esc(x.spot||'')}" placeholder="例：淺草寺"></label><label class="fld">到期日（選填）<input type="date" data-tk-due value="${esc(x.due||'')}"></label>${x.day!=null?`<p class="mut">對應第 ${x.day+1} 天</p>`:''}</div>`}
function syncTaskDraft(){if(!U)return;const prev=U.tasks||[];U.tasks=[...document.querySelectorAll('[data-tk]')].map(row=>{const i=+row.dataset.tk,old=prev[i]||{};return {section:row.querySelector('[data-tk-sec]').value,text:row.querySelector('[data-tk-text]').value,spot:row.querySelector('[data-tk-spot]').value.trim(),day:old.day,due:row.querySelector('[data-tk-due]').value,on:row.querySelector('[data-tk-on]').checked}})}
function readUrlTasks(){syncTaskDraft();return (U.tasks||[]).filter(x=>x.on!==false&&String(x.text||'').trim()).map(x=>{const o={section:x.section==='note'||x.section==='prep'?x.section:'buy',text:String(x.text).trim().slice(0,80),done:false};if(x.spot)o.spot=x.spot;if(x.day!=null&&x.day!==''&&+x.day>=0)o.day=+x.day|0;if(/^\d{4}-\d{2}-\d{2}$/.test(x.due||''))o.due=x.due;return o})}
function urlPreview(){const t=T();const def=t?.dep||new Date(Date.now()+14*864e5).toISOString().slice(0,10);
 const rows=U.places.map((p,i)=>{const pos=Number.isFinite(+p.lat)?`${(+p.lat).toFixed(4)}, ${(+p.lng).toFixed(4)}`:'尚未定位';
  const how=p.source==='catalog'?'內建清單':'地圖搜尋';
  const addr=p.addr&&typeof PlaceQ!=='undefined'&&PlaceQ.zhText?PlaceQ.zhText(p.addr): (p.addr||'');
  const hint=p.zh||(typeof PlaceQ!=='undefined'&&PlaceQ.hint?PlaceQ.hint(p.local||p.name):'');
  const sub=[p.local&&p.local!==p.name?p.local:'',hint&&hint!==p.name&&hint!==p.local?hint:'',addr,how,pos].filter(Boolean).join(' · ');
  const on=!U.placeOn||U.placeOn[i]!==false;
  return `<label class="card" style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px"><input type="checkbox" data-up="${i}" ${on?'checked':''} style="width:22px;height:22px;margin-top:2px;flex:none"><span><b>${esc(p.name)}</b><div class="mut">${esc(sub)}</div><a href="${esc(mapLink(p,U.city))}" target="_blank" rel="noopener">在地圖上看位置</a></span></label>`}).join('');
 const taskRows=(U.tasks||[]).map(taskPreviewRow).join('');
 const canSave=U.places.length||(U.tasks||[]).some(x=>String(x.text||'').trim());
 $('#sheetBody').innerHTML=`<h2>網址匯入預覽</h2><p class="mut">盡力辨識，不是完整清單。請勾掉不對的地點與任務。來源：${esc(U.title||U.url||'貼上的文字')}</p>${U.places.length?`<div style="max-height:32vh;overflow:auto">${rows}</div>`:`<div class="card mut">沒有辨識出地點。</div>`}
 <h3 style="margin:14px 2px 6px">任務表</h3><p class="mut">必買、注意、出發前要做。關鍵字盡力擷取，不是完整清單，可改字、改分類或自己加。</p><div id="taskrows">${taskRows||'<div class="card mut">這篇沒有擷取到任務，可以自己加一項。</div>'}</div><button class="btn ghost blk" type="button" onclick="impTaskAdd()">加一項任務</button>
 <label class="fld">分成幾天<input id="imdays" type="number" min="1" max="14" value="${U.days}"></label>
 <label class="fld">目的地<input id="imd" list="cities" value="${esc(U.city)}" placeholder="例：東京"></label><label class="fld">第一天日期<input type="date" id="imdep" value="${esc(def)}"></label>
 <div class="row"><button class="btn ghost" type="button" onclick="importSheet()">返回</button>${t?`<button class="btn ghost" type="button" onclick="impUrlApply('merge')">合併到目前行程</button>`:''}<button class="btn" type="button" onclick="impUrlApply('new')" ${canSave?'':'disabled'}>建立新行程</button></div>
 ${t?`<p class="mut">合併會依天數加到「${esc(t.dest)}」，不刪除原有景點。任務會併進這份行程的任務表。</p>`:'<p class="mut">勾選的地點會依座標用最近鄰排進每一天，勾選的任務會存進任務表。</p>'}`}
window.impTaskAdd=function(){if(!U)return;const on={};document.querySelectorAll('[data-up]').forEach(el=>{on[+el.dataset.up]=el.checked});U.placeOn=on;syncTaskDraft();U.tasks=U.tasks||[];U.tasks.push({section:'buy',text:'',spot:'',on:true});urlPreview()};
window.impUrl=async function(){if(urlBusy)return;const raw=($('#impurl')&&$('#impurl').value||'').trim();
 let UI;try{UI=await needUrl()}catch{return toast('載入失敗，請稍後再試')}
 const info=UI.classifyUrl(raw);if(!info)return toast('請貼上 http 開頭的網址');
 urlBusy=true;$('#sheetBody').innerHTML=`<h2>正在讀取</h2><p class="mut">正在用免金鑰來源讀標題與內文。YouTube 會看公開字幕，讀不到就略過。</p>`;
 try{const src=await fetchSource(info);if(!src.ok){pastePrompt(src.kind,src.title);return}
  $('#sheetBody').innerHTML=`<h2>正在辨識地點</h2><p class="mut">${esc(src.title||'已讀到內文')}。正在對照內建清單，並用免費地圖查座標。</p>`;
  const built=await buildPlaces(src.text,UrlImport.guessCity(src.title+' '+src.text));
  U={...src,...built};if(!U.places.length&&!(U.tasks&&U.tasks.length)){pastePrompt(src.kind,src.title);const box=$('#impcap');if(box)box.value=(src.text||'').slice(0,4000);toast('沒有辨識出地點或任務，請改貼說明文字');return}
  urlPreview()}catch(e){pastePrompt(info.kind,'')}finally{urlBusy=false}};
window.impCaption=async function(){const t=($('#impcap')&&$('#impcap').value||'').trim();if(t.length<4)return toast('請先貼上說明文字');
 try{await needUrl()}catch{return toast('載入失敗，請稍後再試')}
 $('#sheetBody').innerHTML=`<h2>正在辨識</h2><p class="mut">盡力從你貼的文字對照清單、地圖和任務關鍵字。</p>`;
 try{const built=await buildPlaces(t,'');if(!built.places.length&&!(built.tasks&&built.tasks.length)){toast('還是沒有辨識出地點或任務');pastePrompt('article','');const box=$('#impcap');if(box)box.value=t;return}
  U={ok:true,kind:'text',title:'貼上的說明',text:t,url:'',...built};urlPreview()}catch{toast('辨識失敗，請稍後再試');pastePrompt('article','')}};
window.impUrlApply=async function(mode){if(!U)return;const dest=$('#imd').value.trim(),dep=$('#imdep').value;if(!dest||!dep)return toast('請填寫目的地與日期');
 const picked=[...document.querySelectorAll('[data-up]')].filter(el=>el.checked).map(el=>U.places[+el.dataset.up]).filter(Boolean);
 const taskRows=readUrlTasks();
 if(!picked.length&&!taskRows.length)return toast('請至少勾一個地點或一項任務');
 let n=Math.round(+$('#imdays').value);if(!n||n<1)n=1;if(n>14)n=14;if(picked.length)n=Math.min(n,picked.length);
 const buckets=UrlImport.splitDays(picked,n);
 let P=null;try{P=await needPlanner()}catch{}
 const groups=buckets.map(list=>{const geo=[],rest=[];for(const p of list){const hint=p.zh||(typeof PlaceQ!=='undefined'&&PlaceQ.hint?PlaceQ.hint(p.local||p.name):'');const addr=p.addr&&typeof PlaceQ!=='undefined'&&PlaceQ.zhText?PlaceQ.zhText(p.addr):(p.addr||'');const s={time:'',name:p.name,zh:hint&&hint!==p.name?hint:undefined,note:[p.local&&p.local!==p.name?p.local:'',hint&&hint!==p.name&&hint!==p.local?hint:'',addr,p.source==='catalog'?'內建清單':'從網址擷取'].filter(Boolean).join(' · '),link:mapLink(p,dest),pid:p.pid||undefined,area:p.area||undefined,lat:Number.isFinite(+p.lat)?+p.lat:undefined,lng:Number.isFinite(+p.lng)?+p.lng:undefined};if(P&&P.coordOf(s))geo.push(s);else rest.push(s)}
  const ordered=P?P.optimizeDay(geo).concat(rest):geo.concat(rest);let m=9*60;for(const s of ordered){s.time=hm(m);m=Math.min(21*60,m+90)}return ordered});
 let t;if(mode==='merge'&&T()){t=T()}else{const r=new Date(dep);r.setDate(r.getDate()+Math.max(groups.length,1)-1);t={id:Date.now().toString(36),dest,dep,ret:iso(r),pax:2,orig:'TPE',days:[]};trips.unshift(t);cur=t.id}
 const off=mode==='merge'?Math.max(0,Math.round((new Date(dep)-new Date(t.dep))/864e5)):0;
 if(mode==='merge'&&groups.length){const need=off+groups.length;const r=new Date(t.dep);r.setDate(r.getDate()+need-1);if(iso(r)>t.ret)t.ret=iso(r)}
 days(t);groups.forEach((d,i)=>{const td=t.days[off+i];if(td)td.push(...d)});
 if(taskRows.length){if(!Array.isArray(t.tasks))t.tasks=[];const now=Date.now();for(const x of taskRows){const dup=t.tasks.some(o=>(o.section||'')===x.section&&o.text===x.text&&(o.spot||'')===(x.spot||'')&&(o.day==null?'':o.day)===(x.day==null?'':x.day)&&!o.done);if(dup)continue;t.tasks.push({...x,id:now.toString(36)+Math.random().toString(36).slice(2,6),rev:now})}t.tasksRev=now}
 save();toEdit();toast([picked.length?`已排入 ${picked.length} 個地點`:'',taskRows.length?`任務表 ${taskRows.length} 項`:'', '盡力擷取，不是完整清單'].filter(Boolean).join('，'))};
})();
