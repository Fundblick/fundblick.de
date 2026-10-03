'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const publicFiles=require('./public-site-files.json');
function verify(site='_site',mode='production'){
 assert.ok(['production','preview'].includes(mode));
 const assets=JSON.parse(fs.readFileSync(path.join(site,'asset-manifest.json'),'utf8')).assets;
 const allowed=new Set(publicFiles.filter(file=>mode==='production'||file!=='CNAME'));
 for(const [source,target] of Object.entries(assets)){assert.ok(publicFiles.includes(source),'Unreviewed browser dependency: '+source);assert.match(target,/^[a-z0-9.-]+\.[a-f0-9]{12}\.(js|css)$/i);allowed.delete(source);allowed.add(target);}
 for(const file of ['.nojekyll','asset-manifest.json','catalog','themen'])allowed.add(file);
 if(mode==='production')allowed.add('sitemap.xml');
 for(const entry of fs.readdirSync(site,{withFileTypes:true})){
  assert.ok(allowed.has(entry.name),'Unexpected public file/directory: '+entry.name);
  assert.ok(!entry.isSymbolicLink(),'Public package symlink: '+entry.name);
  assert.equal(entry.isDirectory(),['catalog','themen'].includes(entry.name),'Unexpected public file type: '+entry.name);
 }
 for(const file of allowed)assert.ok(fs.existsSync(path.join(site,file)),'Required public entry: '+file);
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);assert.ok(!entry.isSymbolicLink(),'Public package symlink');
  if(entry.isDirectory())walk(file);
  else if(file.endsWith('.html')&&mode==='preview'){
   const html=fs.readFileSync(file,'utf8');assert.match(html,/content="noindex,nofollow"/);assert.ok(!/rel=["']canonical["']/i.test(html),'Preview has a canonical');
  }
 }}walk(site);
 if(mode==='preview')assert.equal(fs.readFileSync(path.join(site,'robots.txt'),'utf8'),'User-agent: *\nAllow: /\n');
 console.log('Site contents: explicit public allowlist and '+mode+' isolation OK');
}
if(require.main===module)verify(process.argv[2],process.argv[3]);
module.exports={verify};
