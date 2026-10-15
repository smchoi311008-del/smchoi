export function calculate(values, lower, upper){
 const n=values.length;
 if(!n)return {n,mean:null,mr:null,sigma:null,ucl:null,lcl:null,cp:null,cpk:null,out:0,signals:0};
 const mean=values.reduce((a,b)=>a+b,0)/n;
 const mr=n>1?values.slice(1).reduce((a,b,i)=>a+Math.abs(b-values[i]),0)/(n-1):null;
 const sigma=mr===null?null:mr/1.128;
 const ucl=mr===null?null:mean+2.66*mr,lcl=mr===null?null:mean-2.66*mr;
 return {n,mean,mr,sigma,ucl,lcl,cp:sigma>0?(upper-lower)/(6*sigma):null,cpk:sigma>0?Math.min(upper-mean,mean-lower)/(3*sigma):null,out:values.filter(v=>v<lower||v>upper).length,signals:ucl===null?0:values.filter(v=>v>ucl||v<lcl).length};
}
