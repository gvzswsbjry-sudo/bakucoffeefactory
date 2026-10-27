const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveManagedTeaPrice } = require('../../tea-data');

test('managed tea price ignores a stale pending flag after a positive price is assigned', () => {
  assert.equal(resolveManagedTeaPrice({ price: 8, meta: { pricePending: true } }), 8);
});

test('managed tea price stays pending until a positive price is assigned', () => {
  assert.equal(resolveManagedTeaPrice({ price: 0, meta: { pricePending: true } }), null);
});
