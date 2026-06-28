(function () {
  'use strict';

  var THEME_KEY = 'ecs-theme';
  var PROGRESS_KEY = 'ecs-progress';

  function getProgress() {
    try {
      var raw = localStorage.getItem(PROGRESS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveProgress(list) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(list));
  }

  function isComplete(id) {
    return getProgress().indexOf(String(id)) !== -1;
  }

  function setComplete(id, done) {
    var list = getProgress();
    var sid = String(id);
    if (done && list.indexOf(sid) === -1) list.push(sid);
    if (!done) list = list.filter(function (x) { return String(x) !== sid; });
    saveProgress(list);
    refreshAll();
  }

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    var btn = document.getElementById('ecs-theme-btn');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.title = theme === 'dark' ? 'Açık mod' : 'Koyu mod';
    }
  }

  function toggleTheme() {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  }

  function initThemeDefault() {
    if (document.documentElement.getAttribute('data-theme')) return;
    var saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  /* theme.css must load AFTER inline <style> blocks or :root wins the cascade */
  function ensureThemeCssLast() {
    var link = document.querySelector('link[href*="theme.css"]');
    if (link && link.parentNode) {
      link.parentNode.appendChild(link);
    }
  }

  function aboutHref() {
    var script = document.querySelector('script[src*="app.js"]');
    if (!script) return 'about.html';
    return (script.getAttribute('src') || 'assets/app.js').replace(/assets\/app\.js(\?.*)?$/, 'about.html');
  }

  function createToolbar() {
    if (document.querySelector('.ecs-toolbar')) return;
    var bar = document.createElement('div');
    bar.className = 'ecs-toolbar no-print';
    bar.innerHTML =
      '<button type="button" id="ecs-theme-btn" class="ecs-tool-btn" title="Koyu mod" aria-label="Tema değiştir">🌙</button>';
    document.body.appendChild(bar);
    document.getElementById('ecs-theme-btn').addEventListener('click', toggleTheme);
    setTheme(getTheme());
  }

  function createCompleteButton(lessonId) {
    var footer = document.querySelector('.footer');
    if (!footer || footer.querySelector('.ecs-complete')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ecs-complete no-print';
    btn.addEventListener('click', function () {
      setComplete(lessonId, !btn.classList.contains('is-done'));
    });

    var nav = footer.querySelector('.nav-links');
    if (nav) footer.insertBefore(btn, nav);
    else footer.appendChild(btn);

    updateCompleteButton(btn, lessonId);
  }

  function updateCompleteButton(btn, lessonId) {
    var done = isComplete(lessonId);
    btn.classList.toggle('is-done', done);
    btn.textContent = done ? '✓ Tamamlandı' : '○ Dersi tamamladım';
  }

  function refreshIndex() {
    var index = document.getElementById('ecs-index');
    if (!index) return;

    var done = 0;
    index.querySelectorAll('[data-lesson]').forEach(function (el) {
      var id = el.getAttribute('data-lesson');
      var complete = isComplete(id);
      el.classList.toggle('done', complete);
      var flag = el.querySelector('.lesson-flag');
      if (flag) {
        flag.textContent = complete ? '✓' : 'Hazır';
        flag.classList.toggle('flag-ready', !complete);
        flag.classList.toggle('flag-done', complete);
      }
      if (complete) done++;
    });

    var fill = index.querySelector('.progress-fill');
    var label = index.querySelector('.progress-count');
    if (fill) fill.style.width = Math.round((done / 25) * 100) + '%';
    if (label) label.textContent = done + ' / 25 ders tamamlandı';
  }

  function refreshAll() {
    refreshIndex();
    var script = document.querySelector('script[data-lesson]');
    if (script) {
      var btn = document.querySelector('.ecs-complete');
      if (btn) updateCompleteButton(btn, script.getAttribute('data-lesson'));
    }
  }

  function addAboutLink() {
    var href = aboutHref();
    document.querySelectorAll('.footer').forEach(function (footer) {
      if (footer.querySelector('.footer-about')) return;
      var span = footer.querySelector('span');
      if (!span) return;
      span.appendChild(document.createTextNode(' · '));
      var a = document.createElement('a');
      a.className = 'footer-about';
      a.href = href;
      a.textContent = 'Hakkında';
      span.appendChild(a);
    });
  }

  initThemeDefault();
  ensureThemeCssLast();

  document.addEventListener('DOMContentLoaded', function () {
    ensureThemeCssLast();
    createToolbar();
    var script = document.querySelector('script[data-lesson]');
    if (script) createCompleteButton(script.getAttribute('data-lesson'));
    addAboutLink();
    refreshAll();
  });

  window.ECS = { getProgress: getProgress, setComplete: setComplete, isComplete: isComplete, toggleTheme: toggleTheme };
})();
