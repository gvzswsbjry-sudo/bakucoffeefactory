const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { validateProduct, validateProducts } = require('../../server/product-schema');
const { createProductStore } = require('../../server/product-store');

function product(overrides = {}) {
  return {
    id: 'ethiopia',
    category: 'coffee',
    name: 'Efiopiya',
    price: 13,
    unit: 'g',
    image: 'assets/coffee/ethiopia.jpg',
    description: 'Meyvəli specialty qəhvə.',
    active: true,
    stock: { status: 'available', quantity: null },
    sortOrder: 1,
    meta: { weight: 100 },
    variants: [],
    ...overrides,
  };
}

async function tempStore(options = {}) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bcf-store-'));
  const assetsRoot = path.join(dir, 'assets');
  await fs.mkdir(assetsRoot, { recursive: true });
  const filePath = path.join(dir, 'products.json');
  return {
    dir,
    filePath,
    store: createProductStore({ filePath, assetsRoot, ...options }),
  };
}

test('validateProduct accepts coffee, tea, and equipment records', () => {
  for (const item of [
    product(),
    product({ id: 'jasmin', category: 'tea', name: 'Jasmin', price: 8 }),
    product({ id: 'v60', category: 'equipment', name: 'V60', price: 25, unit: 'piece' }),
  ]) {
    assert.deepEqual(validateProduct(item), { ok: true, errors: [] });
  }
});

test('validateProduct rejects invalid values and unsafe image paths', () => {
  const cases = [
    [product({ price: -1 }), 'price'],
    [product({ price: Number.NaN }), 'price'],
    [product({ category: 'dessert' }), 'category'],
    [product({ unit: 'box' }), 'unit'],
    [product({ active: 'yes' }), 'active'],
    [product({ stock: { status: 'counted', quantity: -2 } }), 'stock.quantity'],
    [product({ stock: { status: 'counted', quantity: null } }), 'stock.quantity'],
    [product({ image: '../secret.jpg' }), 'image'],
    [product({ image: '/tmp/secret.jpg' }), 'image'],
    [product({ id: 'Bad ID' }), 'id'],
  ];

  for (const [item, field] of cases) {
    const result = validateProduct(item);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((message) => message.includes(field)), result.errors.join('\n'));
  }
});

test('validateProduct validates variant prices and asset paths', () => {
  const result = validateProduct(product({
    variants: [{ id: 'large', name: 'Böyük', price: -3, image: '../large.jpg' }],
  }));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((message) => message.includes('variants[0].price')));
  assert.ok(result.errors.some((message) => message.includes('variants[0].image')));
});

test('validateProducts rejects duplicate IDs', () => {
  const result = validateProducts([product(), product({ name: 'Duplicate' })]);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((message) => message.includes('duplicate id')));
});

test('store persists CRUD operations and rejects duplicate creation', async (t) => {
  const fixture = await tempStore();
  t.after(() => fs.rm(fixture.dir, { recursive: true, force: true }));

  assert.deepEqual(await fixture.store.list(), []);
  await fixture.store.create(product());
  await assert.rejects(() => fixture.store.create(product()), /already exists/i);
  assert.equal((await fixture.store.get('ethiopia')).name, 'Efiopiya');

  await fixture.store.update('ethiopia', { price: 14, name: 'Efiopiya Natural' });
  assert.equal((await fixture.store.get('ethiopia')).price, 14);
  assert.equal((await fixture.store.get('ethiopia')).name, 'Efiopiya Natural');

  const reloaded = createProductStore({ filePath: fixture.filePath, assetsRoot: path.join(fixture.dir, 'assets') });
  assert.equal((await reloaded.get('ethiopia')).price, 14);

  assert.equal(await fixture.store.remove('ethiopia'), true);
  assert.equal(await fixture.store.get('ethiopia'), null);
  assert.equal(await fixture.store.remove('missing'), false);
});

test('store serializes concurrent saves without losing products', async (t) => {
  const fixture = await tempStore();
  t.after(() => fs.rm(fixture.dir, { recursive: true, force: true }));

  await Promise.all([
    fixture.store.create(product({ id: 'one', name: 'One' })),
    fixture.store.create(product({ id: 'two', name: 'Two' })),
  ]);

  const ids = (await fixture.store.list()).map((item) => item.id).sort();
  assert.deepEqual(ids, ['one', 'two']);
  assert.doesNotReject(async () => JSON.parse(await fs.readFile(fixture.filePath, 'utf8')));
});

test('store recovers from malformed primary JSON using the valid backup', async (t) => {
  const fixture = await tempStore();
  t.after(() => fs.rm(fixture.dir, { recursive: true, force: true }));

  await fs.writeFile(`${fixture.filePath}.bak`, JSON.stringify([product({ id: 'backup', name: 'Backup' })]));
  await fs.writeFile(fixture.filePath, '{truncated');

  assert.deepEqual((await fixture.store.list()).map((item) => item.id), ['backup']);
});

test('failed atomic rename leaves the previous valid file readable', async (t) => {
  const fixture = await tempStore();
  t.after(() => fs.rm(fixture.dir, { recursive: true, force: true }));
  await fixture.store.replaceAll([product({ id: 'stable', name: 'Stable' })]);

  let failRename = true;
  const fsImpl = {
    ...fs,
    rename: async (...args) => {
      if (failRename && String(args[1]).endsWith('products.json')) {
        failRename = false;
        throw new Error('simulated rename failure');
      }
      return fs.rename(...args);
    },
  };
  const failingStore = createProductStore({
    filePath: fixture.filePath,
    assetsRoot: path.join(fixture.dir, 'assets'),
    fsImpl,
  });

  await assert.rejects(
    () => failingStore.replaceAll([product({ id: 'replacement', name: 'Replacement' })]),
    /simulated rename failure/
  );

  const disk = JSON.parse(await fs.readFile(fixture.filePath, 'utf8'));
  assert.deepEqual(disk.map((item) => item.id), ['stable']);
});
