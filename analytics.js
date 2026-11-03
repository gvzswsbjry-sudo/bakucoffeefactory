(() => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const STORAGE_KEY = 'bcf_analytics_session';
  let sessionId = '';
  try {
    sessionId = sessionStorage.getItem(STORAGE_KEY) || '';
    if (!sessionId) {
      sessionId = 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
      sessionStorage.setItem(STORAGE_KEY, sessionId);
    }
  } catch {
    sessionId = 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
  }

  const currentPath = location.pathname || '/';

  function sendTrack() {
    try {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          path: currentPath,
          referrer: document.referrer || ''
        }),
        keepalive: true
      }).catch(() => {});
    } catch {}
  }

  function sendHeartbeat(secs = 15) {
    if (document.visibilityState === 'hidden') return;
    try {
      fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          path: currentPath,
          duration: secs
        }),
        keepalive: true
      }).catch(() => {});
    } catch {}
  }

  // Initial track on load
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    sendTrack();
  } else {
    window.addEventListener('DOMContentLoaded', sendTrack, { once: true });
  }

  // Periodic heartbeat every 15s to keep active count and calculate time on page
  const intervalId = setInterval(() => {
    sendHeartbeat(15);
  }, 15000);

  // Send final update when leaving
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      try {
        const payload = JSON.stringify({ sessionId, path: currentPath, duration: 5 });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/analytics/heartbeat', new Blob([payload], { type: 'application/json' }));
        } else {
          fetch('/api/analytics/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true
          }).catch(() => {});
        }
      } catch {}
    }
  });

  window.addEventListener('beforeunload', () => {
    clearInterval(intervalId);
  });
})();
