/*
 * Google Analytics loader with a simple opt-out (no cookie banner).
 * Analytics is used only for site statistics, so it runs by default
 * under the UK statistical-purposes exemption. Visitors can switch it
 * off (and back on) with the "Turn off analytics" link in the footer;
 * the choice is remembered in this browser.
 */
(function () {
  var GA_ID = 'G-YQE4RECHMX'; // PT Licensing GA4 Measurement ID
  var KEY = 'pt-cookie-consent'; // kept from the old banner so earlier "Reject" choices still apply

  function isOptedOut() {
    try { return localStorage.getItem(KEY) === 'denied'; } catch (e) { return false; }
  }

  function setOptedOut(out) {
    try {
      if (out) localStorage.setItem(KEY, 'denied');
      else localStorage.removeItem(KEY);
    } catch (e) { /* storage blocked: nothing to remember */ }
  }

  function loadAnalytics() {
    if (window.__ptAnalyticsLoaded) return;
    window.__ptAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function clearAnalyticsCookies() {
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name.indexOf('_ga') === 0) {
        var domains = [location.hostname, '.' + location.hostname.replace(/^www\./, '')];
        domains.forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + d;
        });
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      }
    });
  }

  function updateLinks() {
    var label = isOptedOut() ? 'Turn analytics back on' : 'Turn off analytics';
    var links = document.querySelectorAll('[data-analytics-toggle]');
    Array.prototype.forEach.call(links, function (link) { link.textContent = label; });
  }

  function init() {
    if (!isOptedOut()) loadAnalytics();
    updateLinks();

    var links = document.querySelectorAll('[data-analytics-toggle]');
    Array.prototype.forEach.call(links, function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        if (isOptedOut()) {
          setOptedOut(false);
          loadAnalytics();
          updateLinks();
        } else {
          setOptedOut(true);
          clearAnalyticsCookies();
          // Reload so the already-running Google script stops.
          if (window.__ptAnalyticsLoaded) location.reload();
          else updateLinks();
        }
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
