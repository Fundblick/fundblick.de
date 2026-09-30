'use strict';
const fs=require('node:fs'),path=require('node:path');
function attribute(tag,name){const match=tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,'i'));return match?(match[1]??match[2]??match[3]):''}
function protectHtml(source){let html=String(source).replace(/<meta\b[^>]*>/gi,tag=>['robots','googlebot','bingbot'].includes(attribute(tag,'name').toLowerCase())?'':tag).replace(/<link\b[^>]*>/gi,tag=>attribute(tag,'rel').toLowerCase().split(/\s+/).includes('canonical')?'':tag);const rule='<meta name="robots" content="noindex,nofollow">';if(/<head\b[^>]*>/i.test(html))return html.replace(/<head\b[^>]*>\s*/i,head=>head.trimEnd()+'\n  '+rule);if(/<html\b[^>]*>/i.test(html))return html.replace(/<html\b[^>]*>/i,tag=>tag+'<head>\n  '+rule+'</head>');return '<head>\n  '+rule+'</head>'+html}
function protect(rootValue){const root=path.resolve(rootValue||'');if(path.basename(root)!=='_site'||!fs.existsSync(path.join(root,'index.html'))||!fs.existsSync(path.join(root,'search.html'))||fs.existsSync(path.join(root,'.git'))||fs.lstatSync(root).isSymbolicLink())throw new Error('Preview protection requires a separate _site package containing index.html and search.html');let count=0;function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isSymbolicLink())throw new Error('Preview package must not contain symlinks');if(entry.isDirectory())walk(file);else if(entry.isFile()&&/\.html$/i.test(entry.name)){const source=fs.readFileSync(file,'utf8');fs.writeFileSync(file,protectHtml(source));count++}}}walk(root);
 // Crawling must remain possible for robots to read noindex. No production sitemap advertised.
 fs.writeFileSync(path.join(root,'robots.txt'),'User-agent: *\nAllow: /\n');return{htmlCount:count,root,rule:'noindex,nofollow'};
}
if(require.main===module)console.log(JSON.stringify(protect(process.argv[2])));
module.exports={protect,protectHtml,attribute};
