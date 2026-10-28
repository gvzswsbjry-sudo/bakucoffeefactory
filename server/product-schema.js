'use strict';

const CATEGORIES = new Set(['coffee', 'tea', 'equipment']);
const UNITS = new Set(['g', 'piece']);
const STOCK_STATUSES = new Set(['available', 'out', 'counted']);
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_PATTERN = /\.(?:avif|gif|jpe?g|png|webp)$/i;
const COLOR_PATTERN = /^(?:#[0-9a-f]{3,8}|[a-z]{3,20})$/i;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isAssetPath(value) {
  if (typeof value !== 'string' || !value.startsWith('assets/') || value.includes('\\')) return false;
  const parts = value.split('/');
  return parts.length > 1 && value.length <= 255 && IMAGE_PATTERN.test(value) && parts.every((part) => part && part !== '.' && part !== '..');
}

function isBoundedString(value, min, max) {
  return typeof value === 'string' && value.trim().length >= min && value.length <= max && !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value);
}

function validateProduct(product) {
  const errors = [];
  if (!isObject(product)) return { ok: false, errors: ['product must be an object'] };

  if (typeof product.id !== 'string' || !ID_PATTERN.test(product.id)) {
    errors.push('id must be a stable lowercase slug');
  }
  if (!CATEGORIES.has(product.category)) errors.push('category must be coffee, tea, or equipment');
  if (!isBoundedString(product.name, 1, 120)) errors.push('name must be between 1 and 120 characters');
  if (!Number.isFinite(product.price) || product.price < 0 || product.price > 1_000_000) errors.push('price must be a finite non-negative number below 1000000');
  if (!UNITS.has(product.unit)) errors.push('unit must be g or piece');
  if (!isAssetPath(product.image)) errors.push('image must be a safe path below assets/');
  if (!isBoundedString(product.description, 0, 4000)) errors.push('description must be a string up to 4000 characters');
  if (typeof product.active !== 'boolean') errors.push('active must be a boolean');
  if (!Number.isInteger(product.sortOrder) || Math.abs(product.sortOrder) > 1_000_000) errors.push('sortOrder must be a bounded integer');
  if (!isObject(product.meta) || JSON.stringify(product.meta).length > 32 * 1024) errors.push('meta must be an object below 32 KB');

  if (!isObject(product.stock) || !STOCK_STATUSES.has(product.stock.status)) {
    errors.push('stock.status must be available, out, or counted');
  } else if (product.stock.status === 'counted') {
    if (!Number.isInteger(product.stock.quantity) || product.stock.quantity < 0 || product.stock.quantity > 1_000_000) {
      errors.push('stock.quantity must be a bounded non-negative integer when stock is counted');
    }
  } else if (product.stock.quantity !== null) {
    errors.push('stock.quantity must be null unless stock is counted');
  }

  if (!Array.isArray(product.variants)) {
    errors.push('variants must be an array');
  } else if (product.variants.length > 100) {
    errors.push('variants must contain at most 100 items');
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
      if (!isBoundedString(variant.name, 1, 120)) errors.push(`variants[${index}].name must be between 1 and 120 characters`);
      if (!Number.isFinite(variant.price) || variant.price < 0 || variant.price > 1_000_000) errors.push(`variants[${index}].price must be bounded and non-negative`);
      if (!isAssetPath(variant.image)) errors.push(`variants[${index}].image must be below assets/`);
      if (variant.alt !== undefined && !isBoundedString(variant.alt, 0, 250)) errors.push(`variants[${index}].alt must be at most 250 characters`);
      if (variant.color !== undefined && (typeof variant.color !== 'string' || !COLOR_PATTERN.test(variant.color))) errors.push(`variants[${index}].color is invalid`);
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
