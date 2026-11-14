(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) Object.assign(root, api);
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const FALLBACK_EQUIPMENT_PRODUCTS = [
    {
      id: 'french-press', category: 'brewing', categoryLabel: 'Dəmləmə', name: 'French Press',
      description: '350 ml, 600 ml və 850 ml ölçülərdə sadə, zəngin və dolğun dəmləmə üçün borosilikat şüşə və polad pres.',
      variants: [
        { id: 'french-press', label: '600 ml', color: '#64748b', image: 'assets/equipment/french-press.jpg', alt: '600 millilitrlik şüşə və paslanmayan polad French Press', price: 25 },
        { id: 'french-press-350', label: '350 ml', color: '#94a3b8', image: 'assets/equipment/french-press.jpg', alt: '350 millilitrlik şüşə və paslanmayan polad French Press', price: 20 },
        { id: 'french-press-850', label: '850 ml', color: '#334155', image: 'assets/equipment/french-press.jpg', alt: '850 millilitrlik şüşə və paslanmayan polad French Press', price: 30 },
      ],
    },
    {
      id: 'wood-grinder', category: 'grinder', categoryLabel: 'Dəyirman', name: 'Əl dəyirmanı',
      description: 'Klassik taxta gövdəli, keramika dişli mexanizmə və tənzimlənən üyütmə dərəcəsinə malik əl dəyirmanı.',
      imageFit: 'contain',
      variants: [{ id: 'wood-grinder', label: 'Klassik taxta', color: '#854d0e', image: 'assets/equipment/manual-grinder-wood.jpg', alt: 'Taxta gövdəli əl qəhvə dəyirmanı', price: 55 }],
    },
    {
      id: 'ornate-manual-grinder', category: 'grinder', categoryLabel: 'Dəyirman', name: 'Naxışlı əl dəyirmanı',
      description: 'Ənənəvi şərq naxışları ilə bəzədilmiş antik bürünc gövdə, qatlanan qol və dəqiq üyütmə tənzimləyicisi.',
      imageFit: 'contain',
      variants: [{ id: 'ornate-manual-grinder', label: 'Naxışlı bürünc', color: '#b45309', image: 'assets/equipment/ornate-manual-grinder.jpg', alt: 'Bürünc rəngli naxışlı əl qəhvə dəyirmanı', price: 55 }],
    },
    {
      id: 'moka-pot', category: 'brewing', categoryLabel: 'Dəmləmə', name: 'Moka Pot',
      description: 'Ocaq üzərində klassik İtalyan üslubunda sıx və dolğun espresso hazırlamaq üçün səkkizbucaqlı dəmləyici.',
      variants: [
        { id: 'moka-pot-steel', label: 'Polad', color: '#e2e8f0', image: 'assets/equipment/moka-pot.jpg', alt: 'Paslanmayan poladdan Moka Pot', price: 90 },
        { id: 'moka-pot-gray', label: 'Boz', color: '#475569', image: 'assets/equipment/classic-moka-pot-gray.jpg', alt: 'Boz xallı klassik Moka Pot', price: 90 },
      ],
    },
    {
      id: 'cezve', category: 'brewing', categoryLabel: 'Dəmləmə', name: 'Naxışlı cezvə',
      description: 'Əl işi naxışlı qalın bürünc gövdə, təbii ağac sap və bərabər istilik paylanması ilə ənənəvi türk qəhvəsi cezvəsi.',
      imageFit: 'contain',
      variants: [
        { id: 'cezve', label: 'Klassik naxışlı', color: '#c27803', image: 'assets/equipment/brass-cezve.jpg', alt: 'Naxışlı mis rəngli cezvə', price: 70 },
        { id: 'cezve-classic', label: 'Sadə bürünc', color: '#d97706', image: 'assets/equipment/brass-cezve-classic.jpg', alt: 'Taxta saplı klassik bürünc cezvə', price: 70 },
        { id: 'cezve-fluted', label: 'Yivli bürünc', color: '#92400e', image: 'assets/equipment/brass-cezve-fluted.jpg', alt: 'Taxta saplı yivli bürünc cezvə', price: 70 },
        { id: 'cezve-lidded', label: 'Qapaqlı bürünc', color: '#78350f', image: 'assets/equipment/brass-cezve-lidded.jpg', alt: 'Taxta saplı qapaqlı bürünc cezvə', price: 75 },
      ],
    },
    {
      id: 'gooseneck-kettle', category: 'kettle', categoryLabel: 'Çaydan', name: 'Gooseneck çaydan',
      description: 'V60 və manual filtr dəmləmələrdə su axınının sürətini və istiqamətini dəqiq idarə edən incə qu quşu ağızlı paslanmayan polad çaydan.',
      variants: [{ id: 'gooseneck-kettle', label: 'Polad', color: '#cbd5e1', image: 'assets/equipment/gooseneck-kettle.jpg', alt: 'Paslanmayan poladdan qu quşu ağızlı çaydan', price: 55 }],
    },
    {
      id: 'dallah', category: 'service', categoryLabel: 'Servis', name: 'Naxışlı Dallah',
      description: 'Ərəb qəhvə mədəniyyətini əks etdirən, zərif naxışlı və bəzək daşlı ənənəvi qəhvə təqdimat qəhvədanı.',
      variants: [
        { id: 'dallah-decorative', label: 'Yaşıl daşlı', color: '#047857', image: 'assets/equipment/decorative-dallah.jpg', alt: 'Yaşıl daşlı dekorativ Dallah qəhvədan', price: 2 },
        { id: 'dallah-silver', label: 'Gümüşü', color: '#cbd5e1', image: 'assets/equipment/silver-dallah.jpg', alt: 'Naxışlı gümüşü rəngli Dallah qəhvədan', price: 2 },
      ],
    },
    {
      id: 'manual-press', category: 'brewing', categoryLabel: 'Dəmləmə', name: 'Manual Press',
      description: 'Sürətli hava təzyiqi ilə zəngin və təmiz dad əldə etmək üçün yüngül, portativ və davamlı əl presi.',
      variants: [{ id: 'manual-press', label: 'Qara', color: '#1e293b', image: 'assets/equipment/manual-press.jpg', alt: 'Silindrik əl presi dəmləyici', price: 80 }],
    },
    {
      id: 'wheel-grinder', category: 'grinder', categoryLabel: 'Dəyirman', name: 'Çarxlı əl dəyirmanı',
      description: 'Retro üslublu tökmə çuqun çarx mexanizmi, taxta qutu qəbuledicisi və dəqiq üyütmə sistemli dekorativ əl dəyirmanı.',
      variants: [{ id: 'wheel-grinder', label: 'Bürünc', color: '#7c2d12', image: 'assets/equipment/wheel-grinder.jpg', alt: 'Böyük çarxlı klassik əl qəhvə dəyirmanı', price: 95 }],
    },
    {
      id: 'glass-server', category: 'service', categoryLabel: 'Servis', name: 'Şüşə server · 400 ml',
      description: 'Termo-davamlı borosilikat şüşədən hazırlanmış, rahat erqonomik tutacaqlı və ölçü xətli 400 ml servis qrafini.',
      variants: [{ id: 'glass-server', label: 'Şüşə', color: '#e2e8f0', image: 'assets/equipment/glass-server-400ml.jpg', alt: 'Qara tutacaqlı 400 millilitrlik şüşə server', price: 38 }],
    },
    {
      id: 'azerbaijan-coffee-set', category: 'service', categoryLabel: 'Servis', name: 'Azərbaycan qəhvə dəsti',
      description: 'Zərif bürünc və ya gümüşü naxışlı cezvə, iki ədəd fincan və nəlbəki ilə xüsusi hədiyyəlik qutuda milli qəhvə dəsti.',
      imageFit: 'contain',
      variants: [
        { id: 'azerbaijan-set-bronze', label: 'Bürünc', color: '#9a3412', image: 'assets/equipment/azerbaijan-coffee-set-bronze.jpg', alt: 'Taxta qutuda bürünc rəngli Azərbaycan qəhvə dəsti', price: 83 },
        { id: 'azerbaijan-set-silver', label: 'Gümüşü', color: '#cbd5e1', image: 'assets/equipment/azerbaijan-coffee-set-silver.jpg', alt: 'Taxta qutuda gümüşü rəngli Azərbaycan qəhvə dəsti', price: 83 },
      ],
    },
    {
      id: 'espresso-tamper', category: 'accessory', categoryLabel: 'Aksesuar', name: 'Espresso tamper',
      description: 'Qəhvə tabletini portafilterdə bərabər və ideal təzyiqlə sıxmaq üçün 58 mm-lik paslanmayan polad əsaslı peşəkar tamper.',
      imageFit: 'contain',
      variants: [
        { id: 'tamper-wood', label: 'Taxta', color: '#854d0e', image: 'assets/equipment/espresso-tamper-wood.jpg', alt: 'Taxta üstlü qara espresso tamperi', price: 58 },
        { id: 'tamper-silver', label: 'Gümüşü', color: '#f1f5f9', image: 'assets/equipment/espresso-tamper-silver.jpg', alt: 'Gümüşü rəngli espresso tamperi', price: 55 },
        { id: 'tamper-black', label: 'Qara', color: '#18181b', image: 'assets/equipment/espresso-tamper-black.jpg', alt: 'Qara rəngli espresso tamperi', price: 55 },
      ],
    },
    {
      id: 'oriental-serving-set', category: 'service', categoryLabel: 'Servis', name: 'Şərq üslublu servis dəsti',
      description: 'Əl işi naxışlı fincanlar, qapaqlı lokum qabı və zərif servis nimçəsindən ibarət autentik Şərq qəhvə dəsti.',
      imageFit: 'contain',
      variants: [
        { id: 'oriental-serving-set-six-cup', label: '6 fincanlı', color: '#78350f', image: 'assets/equipment/oriental-serving-set-six-cup.jpg', alt: 'Naxışlı metal altlıqda altı fincanlı Şərq üslublu servis dəsti', price: 120 },
        { id: 'oriental-serving-set', label: '2 fincanlı', color: '#b45309', image: 'assets/equipment/oriental-serving-set.jpg', alt: 'Naxışlı metal altlıqda iki fincanlı Şərq üslublu servis dəsti', price: 72 },
      ],
    },
  ];

  const managedEquipment = Array.isArray(globalThis.BCF_PRODUCT_DATA)
    ? globalThis.BCF_PRODUCT_DATA.filter((product) => product.category === 'equipment' && product.active)
    : [];
  const EQUIPMENT_PRODUCTS = managedEquipment.length
    ? managedEquipment
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((product) => ({
          id: product.id,
          category: product.meta?.equipmentCategory || 'accessory',
          categoryLabel: product.meta?.categoryLabel || 'Avadanlıq',
          name: product.name,
          description: product.description,
          imageFit: product.meta?.imageFit || 'cover',
          stock: product.stock,
          variants: (product.variants?.length ? product.variants : [{ id: product.id, name: product.name, price: product.price, image: product.image }]).map((variant) => ({
            id: variant.id,
            label: variant.name,
            color: variant.color || '#8b8177',
            image: variant.image,
            alt: variant.alt || product.name,
            price: variant.price,
          })),
        }))
    : (typeof window !== 'undefined' ? [...FALLBACK_EQUIPMENT_PRODUCTS, {
        id: 'test', category: 'accessory', categoryLabel: 'Aksesuar', name: 'Test',
        description: 'Sınaq və yoxlama üçün test avadanlığı.',
        imageFit: 'contain',
        variants: [{ id: 'test', label: 'Standart', color: '#8b8177', image: 'assets/equipment/french-press.jpg', alt: 'Test avadanlığı', price: 1 }],
      }] : FALLBACK_EQUIPMENT_PRODUCTS);

  const getEquipmentProduct = (id) => EQUIPMENT_PRODUCTS.find((product) => product.id === id);

  const resolveEquipmentVariant = (product, variantId) => {
    if (!product?.variants?.length) return null;
    return product.variants.find((variant) => variant.id === variantId) || product.variants[0];
  };

  const cycleEquipmentVariant = (product, variantId, direction) => {
    if (!product?.variants?.length) return null;
    const current = product.variants.findIndex((variant) => variant.id === variantId);
    const index = current < 0 ? 0 : current;
    const next = (index + direction + product.variants.length) % product.variants.length;
    return product.variants[next];
  };

  const getEquipmentVariantName = (product, variant) => {
    if (!variant) return product?.name || '';
    if (product?.variants?.length <= 1) return product.name;
    const desc = variant.label || variant.size || (variant.name !== product.name ? variant.name : '');
    return desc ? `${product.name} · ${desc}` : product.name;
  };

  const buildEquipmentDetailUrl = (productId, filter = 'all') => {
    const url = `mehsul.html?id=${encodeURIComponent(productId)}`;
    return filter && filter !== 'all' ? `${url}&from=${encodeURIComponent(filter)}` : url;
  };

  const buildEquipmentCatalogUrl = (filter = 'all') =>
    filter && filter !== 'all' ? `avadanliqlar.html?filter=${encodeURIComponent(filter)}` : 'avadanliqlar.html';

  const sortEquipmentProducts = (products, sort = 'featured') => {
    const indexed = products.map((product, index) => ({ product, index }));
    const defaultPrice = (product) => Number(product.variants?.[0]?.price) || 0;
    const comparators = {
      'price-asc': (a, b) => defaultPrice(a.product) - defaultPrice(b.product) || a.index - b.index,
      'price-desc': (a, b) => defaultPrice(b.product) - defaultPrice(a.product) || a.index - b.index,
      newest: (a, b) => b.index - a.index,
      oldest: (a, b) => a.index - b.index,
      'name-asc': (a, b) => a.product.name.localeCompare(b.product.name, 'az'),
    };
    const compare = comparators[sort] || ((a, b) => a.index - b.index);
    return indexed.sort(compare).map(({ product }) => product);
  };

  return {
    EQUIPMENT_PRODUCTS,
    getEquipmentProduct,
    resolveEquipmentVariant,
    cycleEquipmentVariant,
    getEquipmentVariantName,
    buildEquipmentDetailUrl,
    buildEquipmentCatalogUrl,
    sortEquipmentProducts,
  };
});
