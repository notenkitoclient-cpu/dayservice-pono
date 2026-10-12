(() => {
  'use strict';
  const config = document.currentScript.dataset;
  const id = config.ga;
  const container = config.gtm;
  const origin = config.origin;
  const title = config.title;
  const key = config.consent;
  const duration = 90 * 86400000;
  let loaded = false;
  let viewed = false;
  let expiryTimer;
  let banner;
  function choice() {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value && typeof value.allowed === 'boolean' && Number.isFinite(value.until)
        && value.until > Date.now() ? value.allowed : null;
    } catch { return null; }
  }
  function publicPage() {
    return location.origin === origin && ['/', '/index.html'].includes(location.pathname)
      && !location.search;
  }
  function permitted() {
    return publicPage() && choice() === true && navigator.doNotTrack !== '1'
      && navigator.globalPrivacyControl !== true;
  }
  function context() {
    let referrer = '';
    try {
      const url = new URL(document.referrer);
      const hosts = ['www.google.com', 'www.google.co.jp', 'www.bing.com', 'search.yahoo.co.jp',
        'duckduckgo.com', 'chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'www.perplexity.ai',
        'claude.ai', 'copilot.microsoft.com', 'gemini.google.com'];
      if (url.protocol === 'https:' && !url.username && !url.password && hosts.includes(url.hostname)) referrer = url.origin + '/';
    } catch { /* Direct or unapproved referrers remain empty. */ }
    return { page_location: origin + '/', page_title: title, page_referrer: referrer };
  }
  function suspend() { window['ga-disable-' + id] = true; }
  function clearCookies() {
    const host = new URL(origin).hostname;
    document.cookie.split(';').forEach(part => {
      const name = part.trim().split('=')[0];
      if (name === '_ga' || name === '_ga_' + id.slice(2)) {
        ['', ';Domain=' + host, ';Domain=.' + host].forEach(domain => {
          document.cookie = name + '=;Max-Age=0;Path=/;SameSite=Lax;Secure' + domain;
        });
      }
    });
  }
  function update() {
    suspend();
    clearTimeout(expiryTimer);
    if (!permitted()) {
      if (choice() !== true) {
        clearCookies();
        if (loaded) { location.reload(); return; }
      }
      return;
    }
    window['ga-disable-' + id] = false;
    const value = JSON.parse(localStorage.getItem(key));
    expiryTimer = setTimeout(() => { update(); if (choice() === null) show(); },
      Math.min(value.until - Date.now(), 2147483647));
    if (viewed) return;
    const safe = context();
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('set', 'url_passthrough', false);
    window.gtag('set', safe);
    window.gtag('config', id, { ...safe, send_page_view: false, allow_google_signals: false,
      allow_ad_personalization_signals: false });
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const script = document.createElement('script');
    script.async = true;
    script.referrerPolicy = 'no-referrer';
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + container;
    document.head.appendChild(script);
    loaded = true;
    window.gtag('event', 'page_view', { ...safe, send_to: id });
    viewed = true;
  }
  function choose(allowed) {
    if (!allowed) suspend();
    try { localStorage.setItem(key, JSON.stringify({ allowed, until: Date.now() + duration })); }
    catch { /* Do not measure when the choice cannot be stored. */ }
    update();
    banner.hidden = choice() !== null;
  }
  function show() { banner.hidden = false; }
  function init() {
    suspend();
    const controls = document.createElement('div');
    controls.className = 'analytics-settings';
    controls.innerHTML = '<button type="button">アクセス解析の設定</button> · <a href="/privacy.html">アクセス解析について</a>';
    controls.querySelector('button').addEventListener('click', show);
    const footer = document.querySelector('footer');
    (footer || document.body).appendChild(controls);
    banner = document.createElement('section');
    banner.className = 'analytics-consent';
    banner.setAttribute('aria-label', 'アクセス解析の設定');
    banner.hidden = choice() !== null;
    banner.innerHTML = '<h2>アクセス解析について</h2><p>サイト改善のため、同意いただいた場合にGoogleアナリティクスで公開ページの閲覧と連絡ボタンの操作を計測します。氏名・連絡先・フォームやLINEの本文は解析に送信しません。広告用途には使いません。選択は90日保存し、フッターから変更できます。</p><p><a href="/privacy.html">詳しく見る</a> · <a href="https://policies.google.com/privacy?hl=ja" target="_blank" rel="noopener noreferrer">Googleのプライバシーポリシー</a></p><div><button type="button" data-choice="deny">許可しない</button><button type="button" data-choice="allow">許可する</button></div>';
    banner.querySelector('[data-choice=deny]').addEventListener('click', () => choose(false));
    banner.querySelector('[data-choice=allow]').addEventListener('click', () => choose(true));
    document.body.appendChild(banner);
    document.addEventListener('click', event => {
      if (!permitted() || !loaded) return;
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
      const href = anchor ? anchor.getAttribute('href') : '';
      const method = href.startsWith('tel:') ? 'telephone' : href.startsWith('mailto:') ? 'email'
        : /^https:\/\/(line\.me|lin\.ee)\//.test(href) ? 'line' : '';
      if (method) window.gtag('event', method === 'telephone' ? 'click_to_call' : 'outbound_contact',
        { ...context(), contact_method: method, send_to: id });
    });
    window.addEventListener('storage', event => {
      if (event.key === key || event.key === null) { update(); banner.hidden = choice() !== null; }
    });
    update();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
