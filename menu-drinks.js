(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) {
    root.BCF_MENU_DRINKS = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const MENU_DRINKS = [
    {
      key: 'espresso-single',
      name: 'Espresso (Single)',
      category: 'Espresso',
      filterGroup: 'espresso',
      defaultImage: 'assets/menu/daily-latte.jpg',
      prices: [{ size: '', price: 3.8 }],
    },
    {
      key: 'espresso-double',
      name: 'Espresso (Double)',
      category: 'Espresso',
      filterGroup: 'espresso',
      defaultImage: 'assets/menu/daily-latte.jpg',
      prices: [{ size: '', price: 4.7 }],
    },
    {
      key: 'triple-joy',
      name: 'Triple Joy',
      category: 'Espresso',
      filterGroup: 'espresso',
      defaultImage: 'assets/menu/daily-latte.jpg',
      prices: [{ size: '', price: 5.9 }],
    },
    {
      key: 'americano',
      name: 'Americano',
      category: 'Espresso',
      filterGroup: 'espresso',
      defaultImage: 'assets/menu/daily-latte.jpg',
      prices: [
        { size: 'S', price: 5.9 },
        { size: 'M', price: 6.3 },
        { size: 'L', price: 7.2 },
      ],
    },
    {
      key: 'latte',
      name: 'Latte',
      category: 'Südlü qəhvələr',
      filterGroup: 'milk',
      defaultImage: 'assets/menu/daily-latte.jpg',
      prices: [
        { size: 'S', price: 6.8 },
        { size: 'M', price: 7.5 },
        { size: 'L', price: 8.4 },
      ],
    },
    {
      key: 'espresso-macchiato',
      name: 'Espresso Macchiato',
      category: 'Südlü qəhvələr',
      filterGroup: 'milk',
      defaultImage: 'assets/menu/daily-latte.jpg',
      prices: [{ size: '', price: 5.5 }],
    },
    {
      key: 'caramel-macchiato',
      name: 'Caramel Macchiato',
      category: 'Südlü qəhvələr',
      filterGroup: 'milk',
      defaultImage: 'assets/menu/daily-latte.jpg',
      prices: [
        { size: 'S', price: 6.1 },
        { size: 'M', price: 7.2 },
        { size: 'L', price: 8.0 },
      ],
    },
    {
      key: 'cappuccino',
      name: 'Cappuccino',
      category: 'Südlü qəhvələr',
      filterGroup: 'milk',
      defaultImage: 'assets/menu/daily-latte.jpg',
      prices: [
        { size: 'S', price: 6.2 },
        { size: 'M', price: 7.3 },
        { size: 'L', price: 8.0 },
      ],
    },
    {
      key: 'flat-white',
      name: 'Flat White',
      category: 'Südlü qəhvələr',
      filterGroup: 'milk',
      defaultImage: 'assets/menu/daily-latte.jpg',
      prices: [
        { size: 'S', price: 6.7 },
        { size: 'M', price: 7.5 },
      ],
    },
    {
      key: 'mocha',
      name: 'Mocha',
      category: 'Südlü qəhvələr',
      filterGroup: 'milk',
      defaultImage: 'assets/menu/daily-latte.jpg',
      prices: [
        { size: 'S', price: 5.9 },
        { size: 'M', price: 6.7 },
      ],
    },
    {
      key: 'cortado',
      name: 'Cortado',
      category: 'Südlü qəhvələr',
      filterGroup: 'milk',
      defaultImage: 'assets/menu/daily-latte.jpg',
      prices: [{ size: 'M', price: 5.9 }],
    },
    {
      key: 'raff-coffee',
      name: 'Raff Coffee',
      category: 'Südlü qəhvələr',
      filterGroup: 'milk',
      defaultImage: 'assets/menu/baku-coffee-factory-special.jpg',
      prices: [
        { size: 'S', price: 7.0 },
        { size: 'M', price: 8.0 },
      ],
    },
    {
      key: 'spanish-latte',
      name: 'Spanish Latte',
      category: 'Südlü qəhvələr',
      filterGroup: 'milk',
      defaultImage: 'assets/menu/daily-latte.jpg',
      prices: [
        { size: 'S', price: 7.0 },
        { size: 'M', price: 8.0 },
        { size: 'L', price: 9.0 },
      ],
    },
    {
      key: 'spanish-cortado',
      name: 'Spanish Cortado',
      category: 'Südlü qəhvələr',
      filterGroup: 'milk',
      defaultImage: 'assets/menu/daily-latte.jpg',
      prices: [{ size: 'M', price: 8.0 }],
    },
    {
      key: 'ice-latte',
      name: 'Ice Latte',
      category: 'Soyuq içkilər',
      filterGroup: 'cold',
      defaultImage: 'assets/menu-background/cold-brew.jpg',
      prices: [{ size: 'L', price: 8.4 }],
    },
    {
      key: 'ice-americano',
      name: 'Ice Americano',
      category: 'Soyuq içkilər',
      filterGroup: 'cold',
      defaultImage: 'assets/menu-background/cold-brew.jpg',
      prices: [{ size: 'L', price: 7.2 }],
    },
    {
      key: 'cold-brew',
      name: 'Cold Brew',
      category: 'Soyuq içkilər',
      filterGroup: 'cold',
      defaultImage: 'assets/menu-background/cold-brew.jpg',
      prices: [{ size: 'M', price: 6.9 }],
    },
    {
      key: 'bumble-coffee',
      name: 'Bumble Coffee',
      category: 'Coffee Creations',
      filterGroup: 'cold',
      defaultImage: 'assets/menu-background/cold-brew.jpg',
      prices: [{ size: '', price: 8.5 }],
    },
    {
      key: 'espresso-tropical',
      name: 'Espresso Tropical',
      category: 'Coffee Creations',
      filterGroup: 'cold',
      defaultImage: 'assets/menu-background/cold-brew.jpg',
      prices: [{ size: '', price: 7.0 }],
    },
    {
      key: 'espresso-flower',
      name: 'Espresso Flower',
      category: 'Coffee Creations',
      filterGroup: 'cold',
      defaultImage: 'assets/menu-background/cold-brew.jpg',
      prices: [{ size: '', price: 7.0 }],
    },
    {
      key: 'orange-chocolate',
      name: 'Orange Chocolate',
      category: 'Coffee Creations',
      filterGroup: 'cold',
      defaultImage: 'assets/menu/daily-latte.jpg',
      prices: [{ size: '', price: 8.8 }],
    },
    {
      key: 'mojito',
      name: 'Mojito',
      category: 'Refreshing Lemonades',
      filterGroup: 'lemonades',
      defaultImage: 'assets/menu-background/cold-brew.jpg',
      prices: [{ size: '', price: 7.0 }],
    },
    {
      key: 'strawberry-lemonade',
      name: 'Strawberry Lemonade',
      category: 'Refreshing Lemonades',
      filterGroup: 'lemonades',
      defaultImage: 'assets/menu-background/cold-brew.jpg',
      prices: [{ size: '', price: 6.0 }],
    },
    {
      key: 'mango-maracuya',
      name: 'Mango Maracuya',
      category: 'Refreshing Lemonades',
      filterGroup: 'lemonades',
      defaultImage: 'assets/menu-background/cold-brew.jpg',
      prices: [{ size: '', price: 6.0 }],
    },
    {
      key: 'blu-curacao',
      name: 'Blu Curaçao',
      category: 'Refreshing Lemonades',
      filterGroup: 'lemonades',
      defaultImage: 'assets/menu-background/cold-brew.jpg',
      prices: [{ size: '', price: 6.0 }],
    },
    {
      key: 'turk-qehvesi',
      name: 'Türk qəhvəsi',
      category: 'Alternativlər',
      filterGroup: 'alt',
      defaultImage: 'assets/menu/daily-latte.jpg',
      prices: [{ size: '', price: 9.3 }],
    },
    {
      key: 'isti-sokolad',
      name: 'İsti şokolad',
      category: 'Alternativlər',
      filterGroup: 'alt',
      defaultImage: 'assets/menu/daily-latte.jpg',
      prices: [{ size: '', price: 9.4 }],
    },
    {
      key: 'isti-sokolad-marshmello',
      name: 'İsti şokolad (Marshmello)',
      category: 'Alternativlər',
      filterGroup: 'alt',
      defaultImage: 'assets/menu/daily-latte.jpg',
      prices: [{ size: '', price: 9.9 }],
    },
    {
      key: 'filtr-coffee-v60',
      name: 'Filtr coffee (V60)',
      category: 'Alternativlər',
      filterGroup: 'alt',
      defaultImage: 'assets/menu-background/v60.jpg',
      prices: [{ size: '', price: 13.0 }],
    },
    {
      key: 'baku-coffee-factory-special',
      name: 'Baku Coffee Factory Special',
      category: 'Alternativlər',
      filterGroup: 'alt',
      defaultImage: 'assets/menu/baku-coffee-factory-special.jpg',
      prices: [{ size: '', price: 13.3 }],
    },
    {
      key: 'chai-tea-latte',
      name: 'Chai Tea Latte',
      category: 'Çaylar',
      filterGroup: 'tea',
      defaultImage: 'assets/menu/daily-latte.jpg',
      prices: [
        { size: 'S', price: 6.9 },
        { size: 'M', price: 7.7 },
      ],
    },
  ];

  const DEFAULT_DAILY_DISCOUNT_SETTINGS = {
    enabled: true,
    itemKey: 'latte',
    discountPercent: 50,
    image: 'assets/menu/daily-latte.jpg',
    customNote: '',
  };

  function getMenuDrinkByKey(key) {
    return MENU_DRINKS.find((item) => item.key === key) || null;
  }

  function computeDailyDiscountPrices(drink, discountPercent = 50) {
    const pct = Math.max(1, Math.min(90, Math.round(Number(discountPercent) || 50)));
    const source = Array.isArray(drink?.prices) ? drink.prices : [];
    return source.map((entry, idx) => {
      const original = Number(entry.price);
      const discounted = Math.round(original * (100 - pct)) / 100;
      return {
        size: entry.size || '',
        original,
        discounted,
        showCurrency: idx === source.length - 1,
      };
    });
  }

  function resolveDailyDiscountConfig(input = {}) {
    const fallbackDrink = getMenuDrinkByKey(DEFAULT_DAILY_DISCOUNT_SETTINGS.itemKey) || MENU_DRINKS[0];
    const requestedKey = typeof input?.itemKey === 'string' ? input.itemKey.trim() : DEFAULT_DAILY_DISCOUNT_SETTINGS.itemKey;
    const drink = getMenuDrinkByKey(requestedKey) || fallbackDrink;
    const enabled = input?.enabled === undefined ? true : Boolean(input.enabled);
    const rawPct = Number(input?.discountPercent);
    const discountPercent = Number.isFinite(rawPct) ? Math.max(1, Math.min(90, Math.round(rawPct))) : DEFAULT_DAILY_DISCOUNT_SETTINGS.discountPercent;
    const customImage = typeof input?.image === 'string' ? input.image.trim() : '';
    const image = customImage || drink.defaultImage || DEFAULT_DAILY_DISCOUNT_SETTINGS.image;
    const customNote = typeof input?.customNote === 'string' ? input.customNote.trim() : '';

    return {
      enabled,
      itemKey: drink.key,
      itemName: drink.name,
      category: drink.category,
      discountPercent,
      image,
      defaultImage: drink.defaultImage,
      customNote,
      prices: computeDailyDiscountPrices(drink, discountPercent),
      updatedAt: input?.updatedAt || null,
    };
  }

  return {
    MENU_DRINKS,
    DEFAULT_DAILY_DISCOUNT_SETTINGS,
    getMenuDrinkByKey,
    computeDailyDiscountPrices,
    resolveDailyDiscountConfig,
  };
});
