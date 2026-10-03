'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const publicDocs={
 'AGENTS.md':'# FundBlick website\n\nBefore project work, read the private [documentation master](https://github.com/Fundblick/fundblick-core/blob/main/core/internal-docs/DOCUMENTATION-MASTER.md) and follow its reading order. The current private handoff is linked from [docs/HANDOFF_CURRENT.md](docs/HANDOFF_CURRENT.md).\n\nInternal documentation belongs exclusively in Fundblick/fundblick-core. This public repository contains website/build/deployment inputs and these entry-point links. Use branch + PR and preserve the existing safety gates.\n',
 'docs/HANDOFF_CURRENT.md':'# FundBlick project handoff\n\nThe canonical handoff is in the private Core repository:\n\n[Current handoff](https://github.com/Fundblick/fundblick-core/blob/main/core/internal-docs/website/docs/HANDOFF_CURRENT.md)\n\nStart with the [documentation master](https://github.com/Fundblick/fundblick-core/blob/main/core/internal-docs/DOCUMENTATION-MASTER.md). Access requires authorization to Fundblick/fundblick-core.\n',
 'docs/README.md':'# FundBlick documentation\n\nInternal project documentation is maintained exclusively in the private [FundBlick Core documentation](https://github.com/Fundblick/fundblick-core/blob/main/core/internal-docs/DOCUMENTATION-MASTER.md).\n\nThis directory contains entry-point links only. Reports, requirements, merchant analyses, worklogs and internal handoffs belong in Core.\n'
};
function verify(files,read){
 const documentation=files.filter(file=>file.endsWith('.md')||file.startsWith('docs/')||/^(?:core\/internal-docs|internal-docs|private-docs)\//.test(file));
 for(const file of documentation){assert.ok(Object.hasOwn(publicDocs,file),'Internal/unreviewed documentation in public repository: '+file);assert.equal(read(file).replace(/\r\n/g,'\n'),publicDocs[file],'Public entry point contains unreviewed content: '+file);}
 for(const file of Object.keys(publicDocs))assert.ok(files.includes(file),'Missing private documentation entry point: '+file);
}
if(require.main===module){
 const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
 verify(files,file=>fs.readFileSync(file,'utf8'));
 const entries=Object.keys(publicDocs),read=file=>publicDocs[file];
 for(const privatePath of ['docs/INTERNAL-REPORT.md','docs/audits/internal.json','AUTONOMOUS_WORK_MODE_JENS.md','core/internal-docs/worklog.txt'])assert.throws(()=>verify([...entries,privatePath],read),/Internal\/unreviewed documentation/);
 assert.throws(()=>verify(entries,file=>read(file)+(file==='docs/HANDOFF_CURRENT.md'?'Private audit contents\n':'')),/unreviewed content/);
 console.log('Documentation boundary: only reviewed private-Core entry points; internal report/cost/worklog copies blocked.');
}
module.exports={verify,publicDocs};
