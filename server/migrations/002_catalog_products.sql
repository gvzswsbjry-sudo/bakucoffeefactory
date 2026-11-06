CREATE TABLE IF NOT EXISTS catalog_products (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'g',
  image TEXT NOT NULL,
  description TEXT DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  stock_status TEXT NOT NULL DEFAULT 'available',
  stock_quantity INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  meta JSONB DEFAULT '{}'::jsonb,
  variants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS catalog_products_category_idx ON catalog_products(category);
CREATE INDEX IF NOT EXISTS catalog_products_sort_idx ON catalog_products(sort_order, name);
