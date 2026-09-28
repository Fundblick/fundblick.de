'use strict';
const assert=require('assert');
const {numberFromMoney}=require('./search-sort-runtime.js');

assert.strictEqual(numberFromMoney('19,99 €'),19.99);
assert.strictEqual(numberFromMoney('1.234,56 €'),1234.56);
assert.strictEqual(numberFromMoney('€ 1,234.56'),1234.56);
assert.strictEqual(numberFromMoney('29.00 EUR'),29);
assert.strictEqual(numberFromMoney(' 7,50 € '),7.5);
assert.strictEqual(numberFromMoney(''),Number.POSITIVE_INFINITY);
console.log('search sort runtime parser: ok');
