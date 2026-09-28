'use strict';
const assert = require('node:assert/strict');
const { defaultRange, rows } = require('./search-console-collector');

const range = defaultRange();
assert.match(range.startDate, /^\d{4}-\d{2}-\d{2}$/);
assert.match(range.endDate, /^\d{4}-\d{2}-\d{2}$/);
assert.ok(range.startDate < range.endDate);

assert.deepEqual(rows({ rows: [{ keys:['x'], clicks:2, impressions:10, ctr:.2, position:4.5 }] }), [
  { keys:['x'], clicks:2, impressions:10, ctr:.2, position:4.5 }
]);
assert.deepEqual(rows({}), []);
console.log('Search Console collector helper tests OK');
