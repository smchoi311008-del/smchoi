const $=id=>document.getElementById(id);
const fmt=v=>v===null?"—":Number(v).toFixed(3);
export function draw(target,values,center,lower,upper){
 const host=$(target);host.replaceChildren();
 if(!values.length){const p=document.createElement('p');p.className='chart-empty';p.textContent='측정 데이터가 쌓이면 이곳에 관리도가 표시됩니다.';host.append(p);return;}
 const all=[...values,center,lower,upper].filter(v=>v!==null),min=Math.min(...all),max=Math.max(...all),pad=(max-min)*.18||.01,lo=min-pad,hi=max+pad,W=1000,H=240,L=72,R=85,T=18,B=32;
 const x=i=>L+(values.length===1?.5:i/(values.length-1))*(W-L-R),y=v=>T+(hi-v)/(hi-lo)*(H-T-B);
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('role','img');svg.setAttribute('aria-label',target==='chart'?'개별값 관리도':'이동범위 관리도');
 const add=(tag,attrs,text)=>{const e=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;svg.append(e);return e;};
 for(let i=0;i<5;i++){const v=lo+(hi-lo)*i/4;add('line',{x1:L,x2:W-R,y1:y(v),y2:y(v),stroke:'#edf0f5'});add('text',{x:L-12,y:y(v)+4,'text-anchor':'end',fill:'#8b95a6','font-size':12},fmt(v));}
 [[lower,'LCL','#e39785'],[center,'CL','#64a997'],[upper,'UCL','#e39785']].forEach(([v,label,color])=>{if(v===null)return;add('line',{x1:L,x2:W-R,y1:y(v),y2:y(v),stroke:color,'stroke-dasharray':'5 5'});add('text',{x:W-R+10,y:y(v)+4,fill:color,'font-size':11},`${label} ${fmt(v)}`);});
 add('polyline',{points:values.map((v,i)=>`${x(i)},${y(v)}`).join(' '),fill:'none',stroke:'#4168e8','stroke-width':2});
 values.forEach((v,i)=>{const c=add('circle',{cx:x(i),cy:y(v),r:4,fill:upper!==null&&(v>upper||v<lower)?'#e36b58':'#4168e8'});const title=document.createElementNS(ns,'title');title.textContent=`${i+1}: ${v}`;c.append(title);if(i===0||i===values.length-1||i%Math.ceil(values.length/12)===0)add('text',{x:x(i),y:H-8,'text-anchor':'middle',fill:'#8b95a6','font-size':11},i+1);});host.append(svg);
}
