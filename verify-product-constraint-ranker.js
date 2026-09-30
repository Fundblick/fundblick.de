'use strict';
const assert=require('node:assert/strict');const r=require('./product-constraint-ranker.js');
let analysis={attributes:{viscosity:{value:'10W-40'},volume:{value:5}}};let items=[{id:'wrong',attributes:{viscosity:{value:'5W-30'},volume:{value:5}}},{id:'partial',attributes:{viscosity:{value:'10W-40'},volume:{value:1}}},{id:'best',attributes:{viscosity:{value:'10W-40'},volume:{value:5}}},{id:'unknown',attributes:{}}];let out=r.rank(items,analysis);assert.equal(out[0].id,'best');assert.equal(out.at(-1).id,'wrong');assert.ok(out[0].constraintMatch.score>out[1].constraintMatch.score);
assert.equal(r.equal({value:1,unit:'TB'},{value:1000,unit:'GB'}),true,'equivalent storage capacities agree');
assert.equal(r.equal({value:1,unit:'TB'},{value:1,unit:'GB'}),false,'unit differences must not produce false exact matches');
assert.equal(r.equal({value:1,unit:'TB'},{value:1024,unit:'GB'}),false,'decimal TB/GB must not be confused with binary TiB/GiB');
analysis={attributes:{width:{value:205},aspect_ratio:{value:55},rim_size:{value:16}}};items=[{id:'205-55-16',attributes:{width:205,aspect_ratio:55,rim_size:16}},{id:'225-45-17',attributes:{width:225,aspect_ratio:45,rim_size:17}},{id:'unknown',attributes:{}}];out=r.rank(items,analysis);assert.equal(out[0].id,'205-55-16');assert.equal(out.at(-1).id,'225-45-17');assert.equal(out[0].constraintMatch.matched,3);assert.equal(out.at(-1).constraintMatch.conflicts,3);console.log('Product constraint ranker: hard matches promoted, conflicts demoted, unknowns preserved');

analysis={attributes:{voltage:{value:18,confidence:'HIGH'}}};
const medium=r.score({attributes:{voltage:{value:12,confidence:'MEDIUM'}}},analysis);
assert.equal(medium.conflicts,0,'snippet-level evidence cannot establish a hard conflict');assert.equal(medium.known,0);assert.equal(medium.softConflicts,1);assert.ok(medium.score<0,'medium disagreement remains a weak ranking hint');
const weakQuery=r.score({attributes:{voltage:{value:12,confidence:'HIGH'}}},{attributes:{voltage:{value:18,confidence:'LOW'}}});assert.equal(weakQuery.conflicts,0);assert.equal(weakQuery.score,0,'low-confidence query guesses cannot penalize products');
const weakResult=r.score({attributes:{voltage:{value:12,confidence:'LOW'}}},analysis);assert.equal(weakResult.conflicts,0);assert.equal(weakResult.score,0);
const mediumMatch=r.score({attributes:{voltage:{value:18,confidence:'MEDIUM'}}},analysis);assert.equal(mediumMatch.matched,0);assert.equal(mediumMatch.softMatched,1);assert.ok(mediumMatch.score>0,'medium matches help ordering without supplying strict-filter coverage');
