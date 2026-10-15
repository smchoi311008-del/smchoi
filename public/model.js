import {calculate} from './stats.js';
export function filterRecords(records,lineIds,itemId,from='',to=''){
 const ids=new Set(lineIds);
 return records.filter(r=>ids.has(r.lineId)&&r.itemId===itemId&&(!from||r.date>=from)&&(!to||r.date<=to)).sort((a,b)=>a.date.localeCompare(b.date)||a.sequence-b.sequence||a.id.localeCompare(b.id));
}
export const isND=r=>r.result==='ND';
export const ndSpec=item=>item.lower==='ND'||item.upper==='ND';
export const specText=v=>v==='ND'?'미검출':v===null?'미설정':String(v);
export function judgement(r,item){
 if(ndSpec(item))return isND(r)?'적합':'규격 이탈';
 if(item.lower===null&&item.upper===null)return '규격 미설정';
 if(isND(r))return '판정 불가';
 return (item.lower!==null&&r.value<item.lower)||(item.upper!==null&&r.value>item.upper)?'규격 이탈':'적합';
}
export function summarize(records,item){
 const numeric=records.filter(r=>!isND(r));
 const nd=ndSpec(item),lower=nd?null:item.lower,upper=nd?null:item.upper;
 const s=calculate(numeric.map(r=>r.value),lower??-Infinity,upper??Infinity);
 // A non-detect is not zero and breaks the sequence for moving ranges.
 const pairs=records.slice(1).flatMap((r,i)=>!isND(r)&&!isND(records[i])?[Math.abs(r.value-records[i].value)]:[]);
 const mr=pairs.length?pairs.reduce((a,b)=>a+b,0)/pairs.length:null;
 const sigma=mr===null?null:mr/1.128,ucl=mr===null||s.mean===null?null:s.mean+2.66*mr,lcl=mr===null||s.mean===null?null:s.mean-2.66*mr;
 const specified=nd||lower!==null||upper!==null;
 return {...s,n:records.length,numericN:numeric.length,ndCount:records.length-numeric.length,mr,sigma,ucl,lcl,signals:ucl===null?0:numeric.filter(r=>r.value>ucl||r.value<lcl).length,out:specified?records.filter(r=>judgement(r,item)==='규격 이탈').length:null,unknown:records.filter(r=>judgement(r,item)==='판정 불가').length,cp:!nd&&lower!==null&&upper!==null&&sigma>0?(upper-lower)/(6*sigma):null,cpk:!nd&&specified&&sigma>0?Math.min(upper===null?Infinity:(upper-s.mean)/(3*sigma),lower===null?Infinity:(s.mean-lower)/(3*sigma)):null};
}
export function validateState(s){
 if(!s||s.version!==2||!Array.isArray(s.lines)||!s.lines.length||!Array.isArray(s.items)||!s.items.length||!Array.isArray(s.records)||!Array.isArray(s.groups))throw Error('백업 구조가 잘못되었습니다.');
 for(const list of [s.lines,s.items,s.groups]){const ids=new Set();for(const x of list){if(typeof x.id!=='string'||!x.id||ids.has(x.id)||typeof x.name!=='string'||!x.name.trim())throw Error('이름 또는 ID 오류');ids.add(x.id);}}
 const lines=new Set(s.lines.map(x=>x.id)),items=new Set(s.items.map(x=>x.id)),ids=new Set();
 for(const i of s.items){if(typeof i.unit!=='string'||![i.lower,i.upper].every(x=>x===null||x==='ND'||Number.isFinite(x))||(ndSpec(i)?[i.lower,i.upper].some(Number.isFinite):(i.lower!==null&&i.upper!==null&&i.lower>=i.upper)))throw Error('분석 항목 규격 오류');}
 for(const g of s.groups)if(!Array.isArray(g.lineIds)||!g.lineIds.length||g.lineIds.some(id=>!lines.has(id)))throw Error('그룹 대상 오류');
 for(const r of s.records){if(typeof r.id!=='string'||ids.has(r.id)||!lines.has(r.lineId)||!items.has(r.itemId)||(isND(r)?r.value!==null:!Number.isFinite(r.value))||(r.result!==undefined&&!['ND','numeric'].includes(r.result))||!Number.isInteger(r.sequence)||r.sequence<1||typeof r.note!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||!Number.isFinite(Date.parse(r.date))||new Date(r.date).toISOString().slice(0,10)!==r.date)throw Error('측정 기록 오류');ids.add(r.id);}
 return s;
}
export const csvCell=value=>'"'+String(value??'').replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';
