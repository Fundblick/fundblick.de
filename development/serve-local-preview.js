'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const WORKER='https://fundblick-search.frosty-moon-518b.workers.dev';
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8'};
function createServer(rootValue,{fetchImpl=fetch}={}){
 const root=path.resolve(rootValue);if(path.basename(root)!=='_site'||!fs.existsSync(path.join(root,'search.html'))||fs.existsSync(path.join(root,'.git')))throw Error('A separate _site preview package is required');
 return http.createServer(async(req,res)=>{
  const address=req.socket.localAddress,port=req.socket.localPort,host=`127.0.0.1:${port}`,origin=`http://${host}`;
  if(address!=='127.0.0.1'||req.headers.host!==host||(req.headers.origin&&req.headers.origin!==origin)){res.writeHead(403);res.end();return}
  res.setHeader('cache-control','no-store');res.setHeader('x-robots-tag','noindex, nofollow');res.setHeader('referrer-policy','no-referrer');
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
  let url;try{url=new URL(req.url,origin)}catch{res.writeHead(400);res.end();return}
  if(url.pathname==='/search'){
   const q=String(url.searchParams.get('q')||'').replace(/[\u0000-\u001f\u007f]/g,' ').trim();if(q.length<2||q.length>120){res.writeHead(400);res.end();return}
   const target=new URL('/search',WORKER);for(const key of ['q','lang','country','count','offset'])if(url.searchParams.has(key))target.searchParams.set(key,key==='q'?q:url.searchParams.get(key));
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
   try{const response=await fetchImpl(target,{headers:{Accept:'application/json'},signal:controller.signal,redirect:'error'}),body=await response.text();res.writeHead(response.status,{'content-type':'application/json; charset=utf-8'});res.end(body)}catch{res.writeHead(502,{'content-type':'application/json; charset=utf-8'});res.end('{"error":"development_relay_unavailable"}')}finally{clearTimeout(timer)}return;
  }
  try{const name=decodeURIComponent(url.pathname),relative=name.endsWith('/')?name+'index.html':name,file=path.resolve(root,'.'+relative);if(!file.startsWith(root+path.sep)||name.split('/').some(part=>part.startsWith('.'))){res.writeHead(403);res.end();return}const stat=fs.statSync(file);if(!stat.isFile())throw Error('Not a file');
   if(path.basename(file)==='search.html'){let html=fs.readFileSync(file,'utf8');html=html.replace(/data-external-search-endpoint="[^"]*"/,`data-external-search-endpoint="${origin}"`);html=html.replace(/<html\b/, '<html data-external-search-development-relay="true"');res.writeHead(200,{'content-type':MIME['.html']});res.end(req.method==='HEAD'?'':html);return}
   res.writeHead(200,{'content-type':MIME[path.extname(file)]||'application/octet-stream','content-length':stat.size});if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
  }catch{res.writeHead(404);res.end('Not found')}
 });
}
if(require.main===module){const root=process.argv[2],port=Number(process.argv[3]||4180);if(!root||!Number.isInteger(port)||port<1024||port>65535)throw Error('Usage: node development/serve-local-preview.js <separate _site directory> [port]');createServer(root).listen(port,'127.0.0.1',()=>console.log(`Local Development: http://127.0.0.1:${port}/`));}
module.exports={createServer};
