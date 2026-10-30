(function bootstrapCatalog(root) {
  const currentScript = root.document?.currentScript;
  const page = currentScript?.dataset?.catalogPage;
  if (typeof root.bootstrapStorefrontPage !== 'function') {
    throw new Error('Kataloq başlanğıc modulu tapılmadı.');
  }
  root.BCF_CATALOG_READY = root.bootstrapStorefrontPage({ page });
  root.BCF_CATALOG_READY.catch(() => {});
})(window);
