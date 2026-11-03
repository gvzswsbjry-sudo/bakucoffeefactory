(() => {
  const api = window.createAdminApi ? window.createAdminApi() : null;
  if (!api) return;

  const activeUsersCount = document.getElementById('activeUsersCount');
  const activePagesList = document.getElementById('activePagesList');
  const todayPageviews = document.getElementById('todayPageviews');
  const todayVisitors = document.getElementById('todayVisitors');
  const monthPageviews = document.getElementById('monthPageviews');
  const monthVisitorsSub = document.getElementById('monthVisitorsSub');
  const avgDuration = document.getElementById('avgDuration');
  const pagesTableBody = document.getElementById('pagesTableBody');
  const dailyTableBody = document.getElementById('dailyTableBody');

  function formatSecs(seconds) {
    const s = Math.round(seconds || 0);
    if (s < 60) return `${s} san`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return rem > 0 ? `${m} dəq ${rem} san` : `${m} dəq`;
  }

  async function updateStats() {
    try {
      const stats = await api.getAnalytics();
      if (!stats) return;

      // 1. Live Active Visitors
      if (activeUsersCount) activeUsersCount.textContent = stats.activeUsers || 0;
      if (activePagesList) {
        if (!stats.activePages || stats.activePages.length === 0) {
          activePagesList.innerHTML = '<span class="live-badge" style="opacity:.65;">Hazırda aktiv ziyarətçi yoxdur</span>';
        } else {
          activePagesList.innerHTML = stats.activePages.map((ap) => `
            <span class="live-badge">
              ${escapeHtml(ap.title)}: <strong>${ap.count} nəfər</strong>
            </span>
          `).join('');
        }
      }

      // 2. Metrics
      if (todayPageviews) todayPageviews.textContent = (stats.today?.pageviews || 0).toLocaleString();
      if (todayVisitors) todayVisitors.textContent = (stats.today?.visitors || 0).toLocaleString();
      if (monthPageviews) monthPageviews.textContent = (stats.thisMonth?.pageviews || 0).toLocaleString();
      if (monthVisitorsSub) monthVisitorsSub.textContent = `${(stats.thisMonth?.visitors || 0).toLocaleString()} unikal ziyarətçi`;
      if (avgDuration) avgDuration.textContent = stats.today?.avgDurationFormatted || '0 san';

      // 3. Pages breakdown table
      if (pagesTableBody) {
        if (!stats.pages || stats.pages.length === 0) {
          pagesTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:24px;color:#7a6a5e;">Hələ səhifə baxışı qeydə alınmayıb.</td></tr>';
        } else {
          pagesTableBody.innerHTML = stats.pages.map((p) => `
            <tr>
              <td class="page-name-cell">
                <strong>${escapeHtml(p.title)}</strong>
                <small>${escapeHtml(p.path)}</small>
              </td>
              <td style="font-weight:600;font-size:14px;">${p.views.toLocaleString()}</td>
              <td><span class="duration-badge">${p.avgFormatted}</span></td>
              <td style="color:#7a6a5e;">${formatSecs(p.totalDurationSeconds)}</td>
            </tr>
          `).join('');
        }
      }

      // 4. Daily history table
      if (dailyTableBody) {
        if (!stats.dailyHistory || stats.dailyHistory.length === 0) {
          dailyTableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:24px;color:#7a6a5e;">Hələ gündəlik məlumat yoxdur.</td></tr>';
        } else {
          dailyTableBody.innerHTML = stats.dailyHistory.map((d) => `
            <tr>
              <td style="font-family:'DM Mono',monospace;font-weight:600;">${escapeHtml(d.date)}</td>
              <td style="font-weight:600;">${d.pageviews.toLocaleString()}</td>
              <td style="color:#51473f;">${d.visitors.toLocaleString()}</td>
            </tr>
          `).join('');
        }
      }
    } catch (err) {
      if (err.status === 401) {
        window.location.href = './';
      }
    }
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Initial load
  updateStats();

  // Live polling every 6 seconds
  setInterval(updateStats, 6000);
})();
