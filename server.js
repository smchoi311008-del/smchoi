import http from 'node:http';
import { readFile } from 'node:fs/promises';
const files = {'/':'index.html','/app.js':'app.js','/style.css':'style.css','/stats.js':'stats.js','/model.js':'model.js','/chart.js':'chart.js','/workbook.json':'workbook.json'};
const types = {html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',json:'application/json; charset=utf-8'};
http.createServer(async(req,res)=>{
 const file=files[new URL(req.url,'http://localhost').pathname];
 if(!file){res.writeHead(404);return res.end('Not found');}
 try{const body=await readFile(new URL('./public/'+file,import.meta.url));res.writeHead(200,{'Content-Type':types[file.split('.').pop()],'X-Content-Type-Options':'nosniff'});res.end(body);}catch{res.writeHead(500);res.end('Server error');}
}).listen(Number(process.env.PORT || 3000),'0.0.0.0',()=>console.log('SPC ledger listening on port '+(process.env.PORT || 3000)));
