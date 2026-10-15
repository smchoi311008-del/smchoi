import {calculate} from './stats.js';
export function filterRecords(records,lineIds,itemId,from='',to=''){
 const ids=new Set(lineIds);
 return records.filter(r=>ids.has(r.lineId)&&r.itemId===itemId&&(!from||r.date>=from)&&(!to||r.date<=to)).sort((a,b)=>a.date.localeCompare(b.date)||a.sequence-b.sequence||a.id.localeCompare(b.id));
}
export function summarize(records,item){
 const s=calculate(records.map(r=>r.value),item.lower??-Infinity,item.upper??Infinity);
 const specified=item.lower!==null||item.upper!==null;
 return {...s,out:specified?s.out:null,cp:item.lower!==null&&item.upper!==null?s.cp:null,cpk:specified&&s.sigma>0?Math.min(item.upper===null?Infinity:(item.upper-s.mean)/(3*s.sigma),item.lower===null?Infinity:(s.mean-item.lower)/(3*s.sigma)):null};
}
export function validateState(s){
 if(!s||s.version!==2||!Array.isArray(s.lines)||!s.lines.length||!Array.isArray(s.items)||!s.items.length||!Array.isArray(s.records)||!Array.isArray(s.groups))throw Error('백업 구조가 잘못되었습니다.');
 for(const list of [s.lines,s.items,s.groups]){const ids=new Set();for(const x of list){if(typeof x.id!=='string'||!x.id||ids.has(x.id)||typeof x.name!=='string'||!x.name.trim())throw Error('이름 또는 ID 오류');ids.add(x.id);}}
 const lines=new Set(s.lines.map(x=>x.id)),items=new Set(s.items.map(x=>x.id)),ids=new Set();
 for(const i of s.items){if(typeof i.unit!=='string'||![i.lower,i.upper].every(x=>x===null||Number.isFinite(x))||(i.lower!==null&&i.upper!==null&&i.lower>=i.upper))throw Error('분석 항목 규격 오류');}
 for(const g of s.groups)if(!Array.isArray(g.lineIds)||!g.lineIds.length||g.lineIds.some(id=>!lines.has(id)))throw Error('그룹 대상 오류');
 for(const r of s.records){if(typeof r.id!=='string'||ids.has(r.id)||!lines.has(r.lineId)||!items.has(r.itemId)||!Number.isFinite(r.value)||!Number.isInteger(r.sequence)||r.sequence<1||typeof r.note!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||!Number.isFinite(Date.parse(r.date))||new Date(r.date).toISOString().slice(0,10)!==r.date)throw Error('측정 기록 오류');ids.add(r.id);}
 return s;
}
export const csvCell=value=>'"'+String(value??'').replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';
