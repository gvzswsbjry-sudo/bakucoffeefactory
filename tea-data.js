(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) Object.assign(root, api);
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const resolveManagedTeaPrice = (product) => product.meta?.pricePending && !(Number(product.price) > 0) ? null : product.price;

  const FALLBACK_TEA_PRODUCTS = {
    '1001-gece': { name: '1001 Gecə Çayı', image: 'assets/tea-packages/1001-gece.jpg', price: 7, unit: 'g' },
    'admiral': { name: 'Admiral', image: 'assets/tea-packages/admiral.jpg', price: 8, unit: 'g' },
    'geysa-qara': { name: 'Geyşa Qara', image: 'assets/tea-packages/geysa-qara.jpg', price: 8, unit: 'g' },
    'jasmin': { name: 'Jasmin Çayı', image: 'assets/tea-packages/jasmin.jpg', price: 2, unit: 'piece' },
    'limon': { name: 'Limon Çayı', image: 'assets/tea-packages/limon.jpg', price: 8, unit: 'g' },
    'malina': { name: 'Malina Şərbəti', image: 'assets/tea-packages/malina-serbeti.jpg', price: 8, unit: 'g' },
    'meyveli': { name: 'Meyvəli Çay', image: 'assets/tea-packages/meyveli.jpg', price: 7, unit: 'g' },
    'nar': { name: 'Nar Çayı', image: 'assets/tea-packages/nar.jpg', price: null, unit: 'g' },
    'portagal': { name: 'Portağal Çayı', image: 'assets/tea-packages/portagal.jpg', price: 7, unit: 'g' },
    'qarpiz': { name: 'Qarpız Çayı', image: 'assets/tea-packages/qarpiz.jpg', price: null, unit: 'g' },
    'geysa-yasil': { name: 'Geyşa Yaşıl', image: 'assets/tea-packages/geysa-yasil.jpg', price: 8, unit: 'g' },
    'yasil-cay': { name: 'Yaşıl Çay', image: 'assets/tea-packages/yasil-cay.jpg', price: null, unit: 'g' },
    'mango-kuresi': { name: 'Mango Kürəsi', image: 'assets/tea-packages/mango-kuresi.jpg', price: 2.4, unit: 'piece' },
    'mango-cayi': { name: 'Mango Çayı', image: 'assets/tea-packages/mango-cayi.jpg', price: null, unit: 'g' },
    'qara-cay': { name: 'Qara Çay', image: 'assets/tea-packages/qara-cay.jpg', price: 7, unit: 'g' },
    'jasminli-qara': { name: 'Jasminli Qara Çay', image: 'assets/tea-packages/jasminli-qara-cay.jpg', price: 7, unit: 'g' },
    'hibiskus': { name: 'Hibiskus', image: 'assets/tea-packages/hibiskus.jpg', price: null, unit: 'g' },
    'melisa': { name: 'Melisa Çayı', image: 'assets/tea-packages/melisa.jpg', price: 9, unit: 'g' },
  };

  const managedTea = Array.isArray(globalThis.BCF_PRODUCT_DATA)
    ? globalThis.BCF_PRODUCT_DATA.filter((product) => product.category === 'tea' && product.active)
    : [];
  const TEA_PRODUCTS = managedTea.length
    ? Object.fromEntries(managedTea.map((product) => [product.id, {
        name: product.name,
        image: product.image,
        price: resolveManagedTeaPrice(product),
        unit: product.unit,
        stock: product.stock,
      }]))
    : FALLBACK_TEA_PRODUCTS;

  const getTeaProduct = (id) => {
    const tea = TEA_PRODUCTS[id];
    return tea ? { id, ...tea } : null;
  };

  return { TEA_PRODUCTS, getTeaProduct, resolveManagedTeaPrice };
});

