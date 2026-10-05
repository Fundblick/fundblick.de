'use strict';
const fs=require('node:fs'),zlib=require('node:zlib');
function parseCsv(text){
 const records=[];let row=[],field='',quoted=false,closed=false;
 for(let i=0;i<String(text).length;i++){const c=text[i];
  if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++;}else if(c==='"'){quoted=false;closed=true;}else field+=c;continue;}
  if(c==='"'){if(field||closed)throw new Error('Unexpected CSV quote');quoted=true;continue;}
  if(c===','||c==='\n'){row.push(field.replace(/\r$/,''));field='';closed=false;if(c==='\n'){records.push(row);row=[];}continue;}
  if(closed&&c!=='\r')throw new Error('Unexpected text after CSV quote');field+=c;
 }
 if(quoted)throw new Error('Unclosed CSV quote');
 if(field||row.length){row.push(field.replace(/\r$/,''));records.push(row);}
 if(!records.length)return[];
 const headers=records.shift().map(h=>h.replace(/^\uFEFF/,''));
 if(headers.some(h=>!h)||new Set(headers).size!==headers.length)throw new Error('Missing/duplicate CSV column');
 return records.filter(r=>r.some(Boolean)).map((r,i)=>{if(r.length!==headers.length)throw new Error('CSV field count mismatch at record '+(i+2));return Object.fromEntries(headers.map((h,j)=>[h,r[j]]));});
}
function readCsv(file){const bytes=fs.readFileSync(file);const raw=/\.gz$/i.test(file)?zlib.gunzipSync(bytes):bytes;return parseCsv(new TextDecoder('utf-8',{fatal:true}).decode(raw));}
module.exports={parseCsv,readCsv};
