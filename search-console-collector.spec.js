'use strict';
const assert = require('node:assert/strict');
const { defaultRange, rows, summary } = require('./search-console-collector');

const range = defaultRange(new Date('2026-09-28T12:00:00Z'));
assert.deepEqual(range, { startDate: '2026-08-29', endDate: '2026-09-25' });

assert.deepEqual(rows({ rows: [{ keys:['x'], clicks:2, impressions:10, ctr:.2, position:4.5 }] }), [
  { keys:['x'], clicks:2, impressions:10, ctr:.2, position:4.5 }
]);
assert.deepEqual(rows({}), []);
assert.deepEqual(summary([{ clicks: 2, impressions: 10 }, { clicks: 3, impressions: 15 }]), { clicks: 5, impressions: 25, ctr: 0.2 });
assert.deepEqual(summary([]), { clicks: 0, impressions: 0, ctr: 0 });
console.log('Search Console collector helper tests OK');
