'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const files=require('./public-site-files.json');
function packageSite(mode='production'){
 assert.ok(['production','preview'].includes(mode),'Unknown site package mode');
 const root=__dirname,site=path.join(root,'_site');
 assert.equal(path.dirname(site),root);
 if(fs.existsSync(site))assert.ok(!fs.lstatSync(site).isSymbolicLink(),'Site output must not be a symlink');
 // Only this reproducible, repository-local output directory is replaced.
 fs.rmSync(site,{recursive:true,force:true});fs.mkdirSync(site);
 for(const file of files){
  assert.ok(/^[a-z0-9][a-z0-9.-]*$/i.test(file),'Only explicitly reviewed root files may be published');
  if(mode==='preview'&&file==='CNAME')continue;
  const source=path.join(root,file);assert.ok(fs.lstatSync(source).isFile(),'Missing public file: '+file);
  fs.copyFileSync(source,path.join(site,file));
 }
 fs.cpSync(path.join(root,'build/catalog'),path.join(site,'catalog'),{recursive:true});
 // Use the same generated category landing pages in both environments.
 execFileSync(process.execPath,['build-seo-landings.js','build/catalog','build/seo'],{cwd:root,stdio:'inherit'});
 fs.cpSync(path.join(root,'build/seo/themen'),path.join(site,'themen'),{recursive:true});
 fs.copyFileSync(path.join(root,'build/seo/sitemap.xml'),path.join(site,'sitemap.xml'));
 fs.writeFileSync(path.join(site,'.nojekyll'),'');
 execFileSync(process.execPath,['build-versioned-site.js'],{cwd:root,stdio:'inherit'});
 if(mode==='preview'){
  require('./development/protect-preview-indexing.js').protect(site);
  fs.rmSync(path.join(site,'sitemap.xml'));
 }
 require('./verify-site-contents.js').verify(site,mode);
 return site;
}
if(require.main===module)console.log('Public site packaged:',packageSite(process.argv[2]));
module.exports={packageSite};
