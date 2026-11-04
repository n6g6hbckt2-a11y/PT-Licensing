/*
 * Cookie consent + Google Analytics loader.
 * Analytics only loads after the visitor clicks "Accept".
 * The choice is remembered in this browser; "Cookie settings" in the footer reopens the banner.
 */
(function () {
  var GA_ID = 'G-XXXXXXXXXX'; // Google Analytics Measurement ID
  var KEY = 'pt-cookie-consent';

  function getChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function setChoice(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* storage blocked: ask again next visit */ }
  }

  function loadAnalytics() {
    if (window.__ptAnalyticsLoaded || GA_ID.indexOf('XXXX') !== -1) return;
    window.__ptAnalyticsLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
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

  function hideBanner() {
    var b = document.getElementById('cookie-banner');
    if (b) b.remove();
  }

  function showBanner() {
    if (document.getElementById('cookie-banner')) return;
    var b = document.createElement('div');
    b.id = 'cookie-banner';
    b.className = 'cookie-banner';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'Cookie consent');
    b.innerHTML =
      '<p>We use optional analytics cookies to understand how visitors use this site so we can improve it. ' +
      'They are only set if you accept.</p>' +
      '<div class="cookie-banner__actions">' +
      '<button type="button" class="button" data-consent="granted">Accept</button>' +
      '<button type="button" class="button button--secondary" data-consent="denied">Reject</button>' +
      '</div>';
    b.addEventListener('click', function (e) {
      var choice = e.target.getAttribute && e.target.getAttribute('data-consent');
      if (!choice) return;
      setChoice(choice);
      hideBanner();
      if (choice === 'granted') {
        loadAnalytics();
      } else {
        clearAnalyticsCookies();
        if (window.__ptAnalyticsLoaded) location.reload();
      }
    });
    document.body.appendChild(b);
  }

  function init() {
    var choice = getChoice();
    if (choice === 'granted') loadAnalytics();
    else if (choice !== 'denied') showBanner();

    var links = document.querySelectorAll('[data-cookie-settings]');
    Array.prototype.forEach.call(links, function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        showBanner();
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
