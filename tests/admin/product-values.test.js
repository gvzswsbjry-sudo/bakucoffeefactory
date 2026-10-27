const test = require('node:test');
const assert = require('node:assert/strict');

const { getCatalogPrice, alignDefaultPrice, getEditorPricingState, isProductPricePending } = require('../../admin/product-values');

test('equipment catalog price follows its first visible variant', () => {
  const product = {
    category: 'equipment',
    price: 1,
    variants: [{ id: 'green', price: 2 }, { id: 'silver', price: 2 }],
  };

  assert.equal(getCatalogPrice(product), 2);
  assert.equal(alignDefaultPrice(product).price, 2);
});

test('products without variants keep their own price', () => {
  const coffee = { category: 'coffee', price: 13, variants: [] };
  assert.equal(getCatalogPrice(coffee), 13);
  assert.equal(alignDefaultPrice(coffee).price, 13);
});

test('editor uses variant prices as the only visible price source when variants exist', () => {
  assert.deepEqual(getEditorPricingState({
    category: 'equipment',
    price: 1,
    variants: [{ id: 'small', price: 20 }, { id: 'large', price: 30 }],
  }), {
    usesVariantPrices: true,
    showBasePrice: false,
    basePrice: 20,
  });
});

test('editor shows the base price for products without variants', () => {
  assert.deepEqual(getEditorPricingState({ category: 'tea', price: 8, variants: [] }), {
    usesVariantPrices: false,
    showBasePrice: true,
    basePrice: 8,
  });
});

test('a positive tea price clears a stale pending-price flag when saved', () => {
  const tea = { category: 'tea', price: 8, meta: { pricePending: true, weight: 100 }, variants: [] };
  const aligned = alignDefaultPrice(tea);

  assert.equal(aligned.price, 8);
  assert.equal(aligned.meta.pricePending, false);
  assert.equal(isProductPricePending(tea), false);
});

test('a tea without a positive price remains marked as pending', () => {
  assert.equal(isProductPricePending({ category: 'tea', price: 0, meta: { pricePending: true } }), true);
});
