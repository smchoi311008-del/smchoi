import {isND} from './model.js';
const colors=['#4168e8','#d76835','#0c937c','#a14eb9','#b59214','#d04b7a','#2585a7','#735444','#518c30','#636b86'];
export function drawSeries(target,series,moving=false){
 const host=typeof target==='string'?document.getElementById(target):target;host.replaceChildren();
 const prepared=series.map((s,i)=>({...s,color:colors[i%colors.length],points:s.records.map((r,j)=>({...r,y:moving?(j>0&&!isND(r)&&!isND(s.records[j-1])?Math.abs(r.value-s.records[j-1].value):null):isND(r)?null:r.value})).slice(-300)}));
 const legend=document.createElement('div');legend.className='series-legend';
 for(const s of prepared){const label=document.createElement('span');label.style.color=s.color;label.textContent=`● ${s.name} (${s.records.length}건 / ND ${s.stats.ndCount}건)`;legend.append(label);}host.append(legend);
 const points=prepared.flatMap(s=>s.points),keys=[...new Set(points.map(r=>r.date+'/'+String(r.sequence).padStart(8,'0')))].sort(),index=new Map(keys.map((k,i)=>[k,i]));
 if(!keys.length){const e=document.createElement('p');e.className='chart-empty';e.textContent='선택한 라인에 측정 기록이 없습니다.';host.append(e);return;}
 const vals=points.filter(p=>p.y!==null).map(p=>p.y);
 for(const s of prepared){const st=s.stats;vals.push(...(moving?[0,st.mr,st.mr===null?null:st.mr*3.267]:[st.mean,st.lcl,st.ucl]).filter(v=>v!==null));}
 const min=vals.length?Math.min(...vals):0,max=vals.length?Math.max(...vals):1,pad=(max-min)*.16||.01,lo=min-pad,hi=max+pad,W=1000,H=300,L=78,R=25,T=20,B=65;
 const x=r=>L+(keys.length===1?.5:index.get(r.date+'/'+String(r.sequence).padStart(8,'0'))/(keys.length-1))*(W-L-R),y=v=>T+(hi-v)/(hi-lo)*(H-T-B);
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('role','img');svg.setAttribute('aria-label',moving?'선택 라인 전체 이동범위 관리도':'선택 라인 전체 개별값 관리도');
 const add=(tag,attrs,text)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;svg.append(e);return e;};
 const title=(el,text)=>{const t=document.createElementNS(ns,'title');t.textContent=text;el.append(t);};
 for(let i=0;i<5;i++){const v=lo+(hi-lo)*i/4;add('line',{x1:L,x2:W-R,y1:y(v),y2:y(v),stroke:'#e9edf5'});add('text',{x:L-10,y:y(v)+4,'text-anchor':'end',fill:'#8390a5','font-size':11},Number(v.toPrecision(5)));}
 for(let i=0;i<keys.length;i+=Math.max(1,Math.ceil(keys.length/7))){const [date,seq]=keys[i].split('/');const xx=L+(keys.length===1?.5:i/(keys.length-1))*(W-L-R);add('text',{x:xx,y:H-35,'text-anchor':'middle',fill:'#8390a5','font-size':10},date);add('text',{x:xx,y:H-21,'text-anchor':'middle',fill:'#8390a5','font-size':10},`${Number(seq)}회`);}
 for(const s of prepared){
  const st=s.stats,limits=moving?[[0,'LCL'],[st.mr,'CL'],[st.mr===null?null:st.mr*3.267,'UCL']]:[[st.lcl,'LCL'],[st.mean,'CL'],[st.ucl,'UCL']];
  for(const [v,name]of limits){if(v===null)continue;const line=add('line',{x1:L,x2:W-R,y1:y(v),y2:y(v),stroke:s.color,'stroke-opacity':.45,'stroke-width':1,'stroke-dasharray':name==='CL'?'2 5':'7 5','data-limit':name,'data-line':s.id});title(line,`${s.name} ${name}: ${v}`);}
  let segment=[];const flush=()=>{if(segment.length)add('polyline',{points:segment.map(r=>`${x(r)},${y(r.y)}`).join(' '),fill:'none',stroke:s.color,'stroke-width':1.8,'data-series':s.id});segment=[];};
  for(const r of s.points){if(r.y===null){flush();if(!moving&&isND(r)){const marker=add('text',{x:x(r),y:H-B+15,fill:s.color,'font-size':8,'text-anchor':'middle','data-nd':s.id},'ND');title(marker,`${s.name} ${r.date} ${r.sequence}회: 미검출 (수치 아님)`);}continue;}segment.push(r);const upper=moving?(st.mr===null?null:st.mr*3.267):st.ucl,lower=moving?0:st.lcl,out=upper!==null&&(r.y>upper||r.y<lower);const dot=add('circle',{cx:x(r),cy:y(r.y),r:2.7,fill:s.color,stroke:out?'#b52222':s.color,'stroke-width':out?2:0,'data-line':s.id});title(dot,`${s.name} · ${r.date} ${r.sequence}회 · ${r.y}${out?' · 관리한계 이탈':''}`);}flush();
 }
 host.append(svg);
}
