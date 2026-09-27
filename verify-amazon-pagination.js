'use strict';
const fs=require('fs');
const assert=require('assert');

const relay=fs.readFileSync('external-relay-provider.js','utf8');
const ui=fs.readFileSync('amazon-refinement-ui.js','utf8');
const css=fs.readFileSync('external-search.css','utf8');
const e2e=fs.readFileSync('amazon-pagination-e2e.spec.js','utf8');

assert(relay.includes('AMAZON_VISIBLE_LIMIT=24'),'Amazon visible result cap missing');
assert(relay.includes("url.searchParams.set('itemPage'"),'Amazon itemPage forwarding missing');
assert(relay.includes('fundblick:amazon-pagination'),'Amazon pagination event missing');
assert(relay.includes('amazonCache'),'Amazon page accumulation cache missing');
assert(relay.includes('dedupeAmazon'),'Amazon page deduplication missing');
assert(relay.includes('resetAmazonPagination'),'Amazon pagination reset missing');
assert(relay.includes('displayTarget=Math.min(total,AMAZON_VISIBLE_LIMIT)'),'Amazon pagination must stop at visible result budget');
assert(ui.includes('fundblick:amazon-pagination'),'Amazon pagination UI event listener missing');
assert(ui.includes('id="amazon-load-more"'),'Amazon load-more button missing');
assert(ui.includes('FundBlickAmazonPaginationState'),'Amazon pagination state missing');
assert(ui.includes('resetPagination'),'Amazon pagination reset hook missing');
assert(ui.includes('getPagination'),'Amazon pagination inspection contract missing');
assert(css.includes('.amazon-pagination'),'Amazon pagination styling missing');
assert(e2e.includes('Amazon +10 appends the next SearchItems page'),'Amazon pagination append E2E missing');
assert(e2e.includes('changing an Amazon refinement resets pagination to page one'),'Amazon pagination reset E2E missing');
assert(e2e.includes("searchParams.get('itemPage')")||e2e.includes("get('itemPage')"),'Amazon itemPage request assertion missing');

console.log('Amazon pagination safety contract: OK');
