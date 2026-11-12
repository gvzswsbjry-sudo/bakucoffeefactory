(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) Object.assign(root, api);
})(typeof window !== 'undefined' ? window : globalThis, function () {
  function createAdminApi(fetchImpl = fetch) {
    async function request(url, options = {}) {
      const response = await fetchImpl(url, {
        credentials: 'same-origin',
        ...options,
        headers: options.body ? { 'content-type': 'application/json', ...(options.headers || {}) } : options.headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      let data = null;
      if (response.status !== 204 && String(response.headers.get('content-type') || '').includes('application/json')) data = await response.json();
      if (!response.ok) {
        const error = new Error(data?.error || `Sorğu uğursuz oldu (${response.status})`);
        error.status = response.status;
        throw error;
      }
      return data;
    }
    return {
      getSession: () => request('/api/admin/session'),
      setup: (password) => request('/api/admin/session', { method: 'POST', body: { password } }),
      login: (password) => request('/api/admin/session', { method: 'POST', body: { password } }),
      logout: () => request('/api/admin/session', { method: 'DELETE' }),
      listProducts: () => request('/api/admin/products'),
      createProduct: (product) => request('/api/admin/products', { method: 'POST', body: product }),
      updateProduct: (id, product) => request(`/api/admin/products/${encodeURIComponent(id)}`, { method: 'PATCH', body: product }),
      deleteProduct: (id) => request(`/api/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' }),
      listAssets: () => request('/api/admin/assets'),
      uploadAsset: (file) => request('/api/admin/assets', { method: 'POST', body: file }),
      getAnalytics: () => request('/api/admin/analytics'),
      listOrders: () => request('/api/admin/orders'),
      getMenuDiscount: () => request('/api/admin/menu-discount'),
      updateMenuDiscount: (settings) => request('/api/admin/menu-discount', { method: 'PUT', body: settings }),
    };
  }
  return { createAdminApi };
});
