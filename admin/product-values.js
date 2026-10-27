(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) Object.assign(root, api);
})(typeof window !== 'undefined' ? window : globalThis, function () {
  function getCatalogPrice(product) {
    const defaultVariant = product?.category === 'equipment' ? product.variants?.[0] : null;
    const value = defaultVariant?.price ?? product?.price;
    return Number(value);
  }

  function isProductPricePending(product) {
    return Boolean(product?.meta?.pricePending) && !(getCatalogPrice(product) > 0);
  }

  function alignDefaultPrice(product) {
    const price = getCatalogPrice(product);
    const clearsPendingPrice = product?.category === 'tea' && price > 0 && product?.meta?.pricePending;
    return {
      ...product,
      price,
      meta: clearsPendingPrice ? { ...product.meta, pricePending: false } : product.meta,
    };
  }

  function getEditorPricingState(product) {
    const usesVariantPrices = Boolean(product?.variants?.length);
    return {
      usesVariantPrices,
      showBasePrice: !usesVariantPrices,
      basePrice: getCatalogPrice(product),
    };
  }

  return { getCatalogPrice, alignDefaultPrice, getEditorPricingState, isProductPricePending };
});
