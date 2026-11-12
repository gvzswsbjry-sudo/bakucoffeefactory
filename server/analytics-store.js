'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

function createAnalyticsStore({ filePath, rootDir } = {}) {
  const storePath = filePath || path.join(rootDir || process.cwd(), 'data', 'analytics.json');
  
  // Real-time active sessions in memory: Map<sessionId, { path, lastSeen, ip, userAgent }>
  const activeSessions = new Map();

  let state = {
    daily: {},      // { 'YYYY-MM-DD': { pageviews: 0, visitors: [] } }
    pages: {},      // { '/qehveler.html': { views: 0, totalDurationSeconds: 0 } }
    lastUpdated: new Date().toISOString()
  };

  let loaded = false;
  let saveTimer = null;

  async function load() {
    if (loaded) return;
    try {
      const data = await fs.readFile(storePath, 'utf8');
      const parsed = JSON.parse(data);
      state = {
        daily: parsed.daily || {},
        pages: parsed.pages || {},
        lastUpdated: parsed.lastUpdated || new Date().toISOString()
      };
    } catch {
      // File doesn't exist yet, state initialized
    }
    loaded = true;
  }

  function scheduleSave() {
    if (saveTimer) return;
    saveTimer = setTimeout(async () => {
      saveTimer = null;
      try {
        await fs.mkdir(path.dirname(storePath), { recursive: true });
        await fs.writeFile(storePath, JSON.stringify(state, null, 2), 'utf8');
      } catch (err) {
        console.error('Analytics save error:', err.message);
      }
    }, 2000);
  }

  function getTodayKey() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getCurrentMonthKey() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  function normalizePath(rawPath) {
    if (!rawPath || rawPath === '' || rawPath === '/') return '/';
    let clean = rawPath.split('?')[0].split('#')[0];
    if (clean.endsWith('/index.html')) clean = '/';
    return clean;
  }

  function getPageTitle(p) {
    const clean = normalizePath(p);
    if (clean === '/') return 'Ana səhifə';
    if (clean.includes('qehve-secici')) return 'Qəhvə seçicisi';
    if (clean.includes('qehveler')) return 'Qəhvələr';
    if (clean.includes('caylar')) return 'Çaylar';
    if (clean.includes('avadanliqlar')) return 'Avadanlıqlar';
    if (clean.includes('menyu')) return 'Menyu';
    if (clean.includes('mehsul')) return 'Məhsul detalları';
    if (clean.includes('mexfilik')) return 'Məxfilik siyasəti';
    return clean;
  }

  function formatDuration(seconds) {
    const s = Math.round(seconds || 0);
    if (s < 60) return `${s} san`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return rem > 0 ? `${m} dəq ${rem} san` : `${m} dəq`;
  }

  async function trackPageView({ sessionId, path: rawPath, ip, userAgent } = {}) {
    await load();
    if (!sessionId) return;
    const now = Date.now();
    const page = normalizePath(rawPath);
    const today = getTodayKey();

    // 1. Update real-time active session
    activeSessions.set(sessionId, {
      path: page,
      lastSeen: now,
      ip: ip || null,
      userAgent: userAgent || null
    });

    // 2. Update daily record
    if (!state.daily[today]) {
      state.daily[today] = { pageviews: 0, visitors: [] };
    }
    state.daily[today].pageviews += 1;
    if (!state.daily[today].visitors.includes(sessionId)) {
      state.daily[today].visitors.push(sessionId);
    }

    // 3. Update page record
    if (!state.pages[page]) {
      state.pages[page] = { views: 0, totalDurationSeconds: 0 };
    }
    state.pages[page].views += 1;

    state.lastUpdated = new Date().toISOString();
    scheduleSave();
  }

  async function trackHeartbeat({ sessionId, path: rawPath, duration = 15 } = {}) {
    await load();
    if (!sessionId) return;
    const now = Date.now();
    const page = normalizePath(rawPath);
    const secs = Math.max(1, Math.min(60, Number(duration) || 15));

    // Update real-time active session
    const existing = activeSessions.get(sessionId) || {};
    activeSessions.set(sessionId, {
      ...existing,
      path: page,
      lastSeen: now
    });

    // Add time spent on this page
    if (!state.pages[page]) {
      state.pages[page] = { views: 1, totalDurationSeconds: 0 };
    }
    state.pages[page].totalDurationSeconds += secs;

    state.lastUpdated = new Date().toISOString();
    scheduleSave();
  }

  function pruneActiveSessions() {
    const threshold = Date.now() - 60000; // active in last 60 seconds
    for (const [id, session] of activeSessions.entries()) {
      if (session.lastSeen < threshold) {
        activeSessions.delete(id);
      }
    }
  }

  async function getStats() {
    await load();
    pruneActiveSessions();

    const today = getTodayKey();
    const currentMonth = getCurrentMonthKey();

    // Real-time active breakdown
    const activeCount = activeSessions.size;
    const pageCounts = {};
    for (const session of activeSessions.values()) {
      const p = session.path || '/';
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    }
    const activePages = Object.entries(pageCounts).map(([p, count]) => ({
      path: p,
      title: getPageTitle(p),
      count
    })).sort((a, b) => b.count - a.count);

    // Today stats
    const todayRecord = state.daily[today] || { pageviews: 0, visitors: [] };
    const todayViews = todayRecord.pageviews || 0;
    const todayVisitors = (todayRecord.visitors || []).length;

    // This month stats
    let monthViews = 0;
    const monthVisitorsSet = new Set();
    let totalAllViews = 0;
    const allVisitorsSet = new Set();

    for (const [dateStr, rec] of Object.entries(state.daily)) {
      totalAllViews += rec.pageviews || 0;
      (rec.visitors || []).forEach(v => allVisitorsSet.add(v));
      if (dateStr.startsWith(currentMonth)) {
        monthViews += rec.pageviews || 0;
        (rec.visitors || []).forEach(v => monthVisitorsSet.add(v));
      }
    }

    // Pages breakdown
    let totalDurationAll = 0;
    let totalViewsAll = 0;
    const pagesList = Object.entries(state.pages).map(([p, data]) => {
      const views = data.views || 0;
      const totalSec = data.totalDurationSeconds || 0;
      totalDurationAll += totalSec;
      totalViewsAll += views;
      const avgSec = views > 0 ? Math.round(totalSec / views) : 0;
      return {
        path: p,
        title: getPageTitle(p),
        views,
        totalDurationSeconds: totalSec,
        avgSeconds: avgSec,
        avgFormatted: formatDuration(avgSec)
      };
    }).sort((a, b) => b.views - a.views);

    const overallAvgSec = totalViewsAll > 0 ? Math.round(totalDurationAll / totalViewsAll) : 0;

    // Recent 14 days history
    const dailyHistory = Object.entries(state.daily)
      .map(([date, rec]) => ({
        date,
        pageviews: rec.pageviews || 0,
        visitors: (rec.visitors || []).length
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 14);

    return {
      activeUsers: activeCount,
      activePages,
      today: {
        pageviews: todayViews,
        visitors: todayVisitors,
        avgDurationFormatted: formatDuration(overallAvgSec)
      },
      thisMonth: {
        pageviews: monthViews,
        visitors: monthVisitorsSet.size,
        avgDurationFormatted: formatDuration(overallAvgSec)
      },
      allTime: {
        pageviews: totalAllViews,
        visitors: allVisitorsSet.size
      },
      pages: pagesList,
      dailyHistory
    };
  }

  return {
    trackPageView,
    trackHeartbeat,
    getStats
  };
}

module.exports = { createAnalyticsStore };
