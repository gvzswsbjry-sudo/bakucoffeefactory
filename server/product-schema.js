'use strict';

const CATEGORIES = new Set(['coffee', 'tea', 'equipment']);
const UNITS = new Set(['g', 'piece']);
const STOCK_STATUSES = new Set(['available', 'out', 'counted']);
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isAssetPath(value) {
  if (typeof value !== 'string' || !value.startsWith('assets/') || value.includes('\\')) return false;
  const parts = value.split('/');
  return parts.length > 1 && parts.every((part) => part && part !== '.' && part !== '..');
}

function validateProduct(product) {
  const errors = [];
  if (!isObject(product)) return { ok: false, errors: ['product must be an object'] };

  if (typeof product.id !== 'string' || !ID_PATTERN.test(product.id)) {
    errors.push('id must be a stable lowercase slug');
  }
  if (!CATEGORIES.has(product.category)) errors.push('category must be coffee, tea, or equipment');
  if (typeof product.name !== 'string' || product.name.trim().length < 1) errors.push('name is required');
  if (!Number.isFinite(product.price) || product.price < 0) errors.push('price must be a finite non-negative number');
  if (!UNITS.has(product.unit)) errors.push('unit must be g or piece');
  if (!isAssetPath(product.image)) errors.push('image must be a safe path below assets/');
  if (typeof product.description !== 'string') errors.push('description must be a string');
  if (typeof product.active !== 'boolean') errors.push('active must be a boolean');
  if (!Number.isFinite(product.sortOrder)) errors.push('sortOrder must be a finite number');
  if (!isObject(product.meta)) errors.push('meta must be an object');

  if (!isObject(product.stock) || !STOCK_STATUSES.has(product.stock.status)) {
    errors.push('stock.status must be available, out, or counted');
  } else if (product.stock.status === 'counted') {
    if (!Number.isInteger(product.stock.quantity) || product.stock.quantity < 0) {
      errors.push('stock.quantity must be a non-negative integer when stock is counted');
    }
  } else if (product.stock.quantity !== null) {
    errors.push('stock.quantity must be null unless stock is counted');
  }

  if (!Array.isArray(product.variants)) {
    errors.push('variants must be an array');
  } else {
    const variantIds = new Set();
    product.variants.forEach((variant, index) => {
      if (!isObject(variant)) {
        errors.push(`variants[${index}] must be an object`);
        return;
      }
      if (typeof variant.id !== 'string' || !ID_PATTERN.test(variant.id)) {
        errors.push(`variants[${index}].id must be a lowercase slug`);
      } else if (variantIds.has(variant.id)) {
        errors.push(`variants[${index}].id is duplicated`);
      } else {
        variantIds.add(variant.id);
      }
      if (typeof variant.name !== 'string' || !variant.name.trim()) errors.push(`variants[${index}].name is required`);
      if (!Number.isFinite(variant.price) || variant.price < 0) errors.push(`variants[${index}].price must be non-negative`);
      if (!isAssetPath(variant.image)) errors.push(`variants[${index}].image must be below assets/`);
    });
  }

  return { ok: errors.length === 0, errors };
}

function validateProducts(products) {
  if (!Array.isArray(products)) return { ok: false, errors: ['products must be an array'] };
  const errors = [];
  const ids = new Set();
  products.forEach((product, index) => {
    const result = validateProduct(product);
    errors.push(...result.errors.map((error) => `[${index}] ${error}`));
    if (product && typeof product.id === 'string') {
      if (ids.has(product.id)) errors.push(`[${index}] duplicate id: ${product.id}`);
      ids.add(product.id);
    }
  });
  return { ok: errors.length === 0, errors };
}

module.exports = { CATEGORIES, UNITS, validateProduct, validateProducts, isAssetPath };
