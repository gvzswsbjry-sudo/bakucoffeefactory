'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { TEA_PRODUCTS } = require('../tea-data');
const { EQUIPMENT_PRODUCTS } = require('../equipment-data');
const { validateProducts } = require('../server/product-schema');

const ROOT = path.resolve(__dirname, '..');

const COFFEES = [
  ['colombia', 'Colombia', 15, 'assets/coffee/colombia.png', 3, 3, 4, 'Qırmızı alma, karamel, süd şokoladı, yüngül fındıq.', 'Yumşaq şirinliyi, canlı meyvə xarakteri və kakaolu bitişi ilə balanslı gündəlik qəhvə.'],
  ['guatemala', 'Guatemala', 12, 'assets/coffee/guatemala.png', 3.5, 3.5, 4, 'Tünd şokolad, badam, qəhvəyi şəkər, qurudulmuş portağal.', 'Dərin, klassik və şokoladlı gövdəsi olan çox yönlü qəhvə.'],
  ['brasil', 'Brasil', 10, 'assets/coffee/brasil.png', 2, 4, 4.5, 'Fındıq, kakao, qəhvəyi şəkər, karamel.', 'Aşağı turşuluqlu, kremli və şokoladlı espresso profili.'],
  ['honduras', 'Honduras', 11, 'assets/coffee/honduras.png', 3, 3, 4, 'Qırmızı giləmeyvə, kakao, qəhvəyi şəkər, yumşaq sitrus.', 'Meyvə təravəti və kakaolu rahatlığı birləşdirən canlı profil.'],
  ['robusta', 'Robusta', 8, 'assets/coffee/robusta.png', 1.5, 5, 3, 'Tünd kakao, qovrulmuş qoz, odunsu tonlar, ədviyyəli bitiş.', 'Güclü, intensiv və dolğun içim üçün seçilən qəhvə.'],
  ['costa-rica', 'Costa Rica', 13, 'assets/coffee/costa-rica.png', 4, 3, 4, 'Portağal, sarı meyvələr, bal, yüngül kakao.', 'Parlaq turşuluq və balabənzər şirinliyi olan təmiz fincan.'],
  ['efiopiya', 'Efiopiya', 13, 'assets/coffee-origins/efiopiya.jpeg', 4.5, 2.5, 4, 'Berqamot, yasəmən, limon qabığı və çəyirdəkli meyvələr.', 'Ətirli, zərif və parlaq xarakterli, çayabənzər yüngül fincan.'],
  ['keniya', 'Keniya', 8, 'assets/coffee-origins/keniya.jpeg', 4.5, 3, 4, 'Qara qarağat, qırmızı giləmeyvə, qreypfrut və qamış şəkəri.', 'Şirəli meyvə xarakteri və parlaq turşuluğu ilə ifadəli qəhvə.'],
  ['decaf', 'Decaf', 12, 'assets/coffee-origins/decaf.jpeg', 2, 3.5, 4, 'Karamel, kakao, badam və yumşaq quru meyvə çalarları.', 'Kofeinsiz, yumşaq və dolğun qəhvə seçimi.'],
  ['uqanda', 'Uqanda', 11, 'assets/coffee-origins/uqanda.jpeg', 2.5, 4, 3.5, 'Tünd şokolad, quru gavalı, isti ədviyyat və qovrulmuş qoz.', 'Dolğun bədənli, aşağı–orta turşuluqlu və uzun kakaolu fincan.'],
];

function stripTags(value = '') {
  return value.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&ndash;/g, '–').replace(/\s+/g, ' ').trim();
}

function extractTeaCopy() {
  const html = fs.readFileSync(path.join(ROOT, 'caylar.html'), 'utf8');
  const copy = new Map();
  const articlePattern = /<article class="tea-product" id="([^"]+)">([\s\S]*?)<\/article>/g;
  for (const match of html.matchAll(articlePattern)) {
    const body = match[2];
    const value = (pattern) => stripTags((body.match(pattern) || [])[1] || '');
    copy.set(match[1], {
      kind: value(/<p class="tea-kind">([\s\S]*?)<\/p>/),
      description: value(/<p class="tea-summary">([\s\S]*?)<\/p>/),
      tasteNotes: value(/<dt>Dad notları<\/dt><dd>([\s\S]*?)<\/dd>/),
      brew: value(/<dt>Dəmləmə<\/dt><dd>([\s\S]*?)<\/dd>/),
    });
  }
  return copy;
}

function buildProductsData() {
  const teaCopy = extractTeaCopy();
  const coffees = COFFEES.map(([id, name, price, image, acidity, body, balance, tasteNotes, description], index) => ({
    id, category: 'coffee', name, price, unit: 'g', image, description, active: true,
    stock: { status: 'available', quantity: null }, sortOrder: index + 1,
    meta: { weight: 100, acidity, body, balance, tasteNotes }, variants: [],
  }));

  const teas = Object.entries(TEA_PRODUCTS).map(([id, tea], index) => {
    const details = teaCopy.get(id) || {};
    return {
      id, category: 'tea', name: tea.name, price: tea.price ?? 0, unit: tea.unit, image: tea.image,
      description: details.description || '', active: true, stock: { status: 'available', quantity: null },
      sortOrder: index + 1,
      meta: { weight: tea.unit === 'g' ? 100 : 1, kind: details.kind || '', tasteNotes: details.tasteNotes || '', brew: details.brew || '', pricePending: tea.price === null },
      variants: [],
    };
  });

  const equipment = EQUIPMENT_PRODUCTS.map((item, index) => ({
    id: item.id, category: 'equipment', name: item.name, price: item.variants[0].price, unit: 'piece',
    image: item.variants[0].image, description: item.description, active: true,
    stock: { status: 'available', quantity: null }, sortOrder: index + 1,
    meta: { equipmentCategory: item.category, categoryLabel: item.categoryLabel, imageFit: item.imageFit || 'cover' },
    variants: item.variants.map((variant) => ({
      id: variant.id, name: variant.label, price: variant.price, image: variant.image,
      color: variant.color || '', alt: variant.alt || '',
    })),
  }));

  return [...coffees, ...teas, ...equipment];
}

function writeProductsData() {
  const products = buildProductsData();
  const validation = validateProducts(products);
  if (!validation.ok) throw new Error(`Cannot generate products.json: ${validation.errors.join('; ')}`);
  const target = path.join(ROOT, 'data', 'products.json');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(products, null, 2)}\n`, 'utf8');
  return target;
}

if (require.main === module) {
  const target = writeProductsData();
  console.log(`Generated ${path.relative(ROOT, target)} with ${buildProductsData().length} products.`);
}

module.exports = { buildProductsData, writeProductsData };
