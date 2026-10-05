(function () {
  'use strict';

  const ROADMAP = window.ROADMAP;
  const CONTENT = window.CONTENT;
  const app = document.getElementById('app');

  // Плоский список тем с привязкой к разделу — для навигации «назад/вперёд».
  const ALL_TOPICS = [];
  ROADMAP.forEach((sec, si) => sec.topics.forEach(t => ALL_TOPICS.push({ ...t, section: sec, sectionIndex: si })));
  const TOPIC_BY_ID = Object.fromEntries(ALL_TOPICS.map(t => [t.id, t]));

  // ---------- Прогресс (localStorage) ----------
  const STORE_KEY = 'bp-progress-v1';
  let progress = { topics: {}, tasks: {}, quiz: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (saved) progress = { ...progress, ...saved };
  } catch (e) { /* хранилище недоступно — работаем без него */ }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch (e) {}
    updateGlobalProgress();
  }

  const statusOf = id => progress.topics[id] || 'none';

  function setStatus(id, status) {
    if (status === 'none') delete progress.topics[id];
    else progress.topics[id] = status;
    save();
  }

  // Любое действие в теме (задание, тест) переводит её в «в процессе».
  function touch(id) {
    if (statusOf(id) === 'none') setStatus(id, 'progress');
  }

  function countDone(topics) {
    return topics.filter(t => statusOf(t.id) === 'done').length;
  }

  function updateGlobalProgress() {
    const pct = Math.round(countDone(ALL_TOPICS) / ALL_TOPICS.length * 100);
    document.getElementById('globalBar').style.width = pct + '%';
    document.getElementById('globalPct').textContent = pct + '%';
  }

  // ---------- Утилиты ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Убирает общий отступ и пустые строки по краям у кода из шаблонных строк.
  function dedent(code) {
    const lines = code.replace(/\t/g, '    ').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    const indent = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
    return lines.map(l => l.slice(indent)).join('\n');
  }

  const LANG_LABEL = {
    python: 'Python', bash: 'Терминал', http: 'HTTP', json: 'JSON', text: 'Текст', html: 'HTML', ini: 'Конфиг',
    sql: 'SQL', javascript: 'JavaScript', graphql: 'GraphQL', yaml: 'YAML', xml: 'XML', protobuf: 'Protobuf', dockerfile: 'Dockerfile', markdown: 'Markdown',
    nginx: 'Nginx', apache: 'Apache', caddyfile: 'Caddyfile', powershell: 'PowerShell', css: 'CSS',
  };

  function codeBlock(code, lang = 'text') {
    let hl = lang === 'text' ? 'plaintext' : lang === 'html' ? 'xml' : lang;
    // Языков вне стандартной сборки highlight.js (например, protobuf) — без подсветки.
    if (window.hljs && !window.hljs.getLanguage(hl)) hl = 'plaintext';
    return `<div class="code">
      <div class="code-head"><span>${LANG_LABEL[lang] || lang}</span><button class="copy-btn" type="button">Копировать</button></div>
      <pre><code class="language-${hl}">${esc(dedent(code))}</code></pre>
    </div>`;
  }

  const pad = n => String(n).padStart(2, '0');

  // ---------- Карта ----------
  function renderMap() {
    document.title = 'Backend Путь';
    const done = countDone(ALL_TOPICS);
    const ready = ALL_TOPICS.filter(t => CONTENT[t.id]).length;

    const sections = ROADMAP.map((sec, i) => {
      const d = countDone(sec.topics);
      const pct = Math.round(d / sec.topics.length * 100);
      const chips = sec.topics.map(t => {
        const st = statusOf(t.id);
        const cls = ['chip', 'st-' + st, CONTENT[t.id] ? 'ready' : 'soon', t.optional ? 'opt' : ''].join(' ');
        return `<a class="${cls}" href="#/t/${t.id}" data-search="${esc((t.title + ' ' + t.summary).toLowerCase())}" title="${esc(t.summary)}">
          <span class="dot"></span><span>${esc(t.title)}</span>${CONTENT[t.id] ? '' : '<span class="chip-soon">скоро</span>'}
        </a>`;
      }).join('');
      return `<section class="sec ${pct === 100 ? 'sec-done' : ''}" id="sec-${sec.id}">
        <div class="sec-node">${pct === 100 ? '✓' : pad(i + 1)}</div>
        <div class="sec-card">
          <div class="sec-head">
            <h2>${esc(sec.title)}</h2>
            ${sec.optional ? '<span class="badge">по желанию</span>' : ''}
            <span class="sec-count">${d}/${sec.topics.length}</span>
          </div>
          <p class="sec-desc">${esc(sec.desc)}</p>
          <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
          <div class="chips">${chips}</div>
        </div>
      </section>`;
    }).join('');

    app.innerHTML = `
      <div class="hero">
        <h1>Путь бэкенд-разработчика</h1>
        <p>${ROADMAP.length} разделов и ${ALL_TOPICS.length} тем — от устройства интернета до AI-агентов.
           В каждой теме: объяснение, примеры на Python, задания для самостоятельной работы и тест.</p>
        <div class="stats">
          <div class="stat"><b>${done}</b><span>изучено</span></div>
          <div class="stat"><b>${ALL_TOPICS.length - done}</b><span>осталось</span></div>
          <div class="stat"><b>${ready}</b><span>тем с материалами</span></div>
        </div>
        ${continueLink()}
      </div>
      <div class="map-tools">
        <input type="search" id="search" placeholder="Поиск темы…" autocomplete="off">
        <div class="legend">
          <span><i class="dot st-done"></i>изучено</span>
          <span><i class="dot st-progress"></i>в процессе</span>
          <span><i class="dot st-none"></i>не начато</span>
          <span><i class="dot dashed"></i>по желанию</span>
        </div>
      </div>
      <div class="timeline">${sections}</div>`;

    document.getElementById('search').addEventListener('input', e => {
      const q = e.target.value.trim().toLowerCase();
      app.querySelectorAll('.sec').forEach(sec => {
        let any = false;
        sec.querySelectorAll('.chip').forEach(ch => {
          const hit = !q || ch.dataset.search.includes(q);
          ch.hidden = !hit;
          any = any || hit;
        });
        sec.hidden = !any;
      });
    });
  }

  // Ссылка «Продолжить» на первую незавершённую тему с материалами.
  function continueLink() {
    const next = ALL_TOPICS.find(t => statusOf(t.id) === 'progress')
      || ALL_TOPICS.find(t => statusOf(t.id) !== 'done' && CONTENT[t.id] && !t.section.optional);
    if (!next) return '';
    const verb = ALL_TOPICS.some(t => statusOf(t.id) !== 'none') ? 'Продолжить' : 'Начать';
    return `<a class="btn btn-primary" href="#/t/${next.id}">${verb}: ${esc(next.title)} →</a>`;
  }

  // ---------- Страница темы ----------
  function renderTopic(id) {
    const t = TOPIC_BY_ID[id];
    if (!t) { location.hash = '#/'; return; }
    const c = CONTENT[id];
    const idx = ALL_TOPICS.indexOf(t);
    const prev = ALL_TOPICS[idx - 1];
    const next = ALL_TOPICS[idx + 1];
    document.title = t.title + ' — Backend Путь';

    const side = t.section.topics.map(x => `
      <a class="side-link st-${statusOf(x.id)} ${x.id === id ? 'active' : ''} ${CONTENT[x.id] ? '' : 'soon'}" href="#/t/${x.id}">
        <span class="dot"></span>${esc(x.title)}
      </a>`).join('');

    const toc = c ? [
      c.theory?.length && ['theory', 'Теория'],
      c.examples?.length && ['examples', 'Примеры'],
      c.tasks?.length && ['tasks', 'Задания'],
      c.quiz?.length && ['quiz', 'Тест'],
      c.resources?.length && ['resources', 'Ресурсы'],
    ].filter(Boolean).map(([a, l]) => `<a href="#${a}" data-anchor="${a}">${l}</a>`).join('') : '';

    app.innerHTML = `
      <div class="topic-layout">
        <aside class="side">
          <a class="back" href="#/">← Карта курса</a>
          <div class="side-sec">${pad(t.sectionIndex + 1)} · ${esc(t.section.title)}</div>
          <nav>${side}</nav>
        </aside>
        <article class="topic">
          <div class="crumbs"><a href="#/">Карта</a> / ${esc(t.section.title)}</div>
          <h1>${esc(t.title)} ${t.optional || t.section.optional ? '<span class="badge">по желанию</span>' : ''}</h1>
          <p class="lead">${esc(t.summary)}</p>
          <div class="status-row" id="statusRow"></div>
          ${toc ? `<nav class="toc">${toc}</nav>` : ''}
          ${c ? renderContent(id, c) : renderPlaceholder(t)}
          <nav class="pager">
            ${prev ? `<a href="#/t/${prev.id}"><small>← Назад</small>${esc(prev.title)}</a>` : '<span></span>'}
            ${next ? `<a class="right" href="#/t/${next.id}"><small>Дальше →</small>${esc(next.title)}</a>` : '<span></span>'}
          </nav>
        </article>
      </div>`;

    renderStatusRow(id);
    bindTopic(id, c);
    if (window.hljs) app.querySelectorAll('pre code').forEach(el => window.hljs.highlightElement(el));
    window.scrollTo(0, 0);
  }

  function renderStatusRow(id) {
    const st = statusOf(id);
    const opts = [['none', 'Не начато'], ['progress', 'В процессе'], ['done', 'Изучено ✓']];
    document.getElementById('statusRow').innerHTML = opts.map(([v, l]) =>
      `<button type="button" class="status-btn s-${v} ${st === v ? 'on' : ''}" data-status="${v}">${l}</button>`).join('');
  }

  function renderPlaceholder(t) {
    return `<div class="card placeholder">
      <h2>Материалы скоро появятся</h2>
      <p>Тема есть в плане курса, но объяснение, примеры и задания для неё ещё пишутся.
         Пока можно изучить её по материалам roadmap.sh и отметить статус выше.</p>
      <a class="btn" href="https://roadmap.sh/backend" target="_blank" rel="noopener">Открыть roadmap.sh/backend ↗</a>
    </div>`;
  }

  function renderContent(id, c) {
    let html = c.intro ? `<div class="intro">${c.intro}</div>` : '';

    if (c.theory?.length) {
      html += `<h2 class="block-title" id="theory">Теория</h2>` + c.theory.map((b, i) => `
        <section class="card theory">
          <h3><span class="num">${i + 1}</span>${esc(b.title)}</h3>
          <div class="prose">${b.html}</div>
        </section>`).join('');
    }

    if (c.examples?.length) {
      html += `<h2 class="block-title" id="examples">Примеры</h2>` + c.examples.map(ex => `
        <section class="card example">
          <h3>${esc(ex.title)}</h3>
          ${codeBlock(ex.code, ex.lang)}
          ${ex.explain ? `<div class="prose explain">${ex.explain}</div>` : ''}
        </section>`).join('');
    }

    if (c.tasks?.length) {
      html += `<h2 class="block-title" id="tasks">Задания для самостоятельной работы</h2>` + c.tasks.map((tk, i) => {
        const key = id + ':' + i;
        const solution = (tk.solution ? `<div class="prose">${tk.solution}</div>` : '')
          + (tk.solutionCode ? codeBlock(tk.solutionCode, tk.solutionLang || 'python') : '');
        return `<section class="card task ${progress.tasks[key] ? 'task-done' : ''}">
          <div class="task-head">
            <h3>Задание ${i + 1}. ${esc(tk.title)}</h3>
            ${tk.level ? `<span class="level lv-${esc(tk.level)}">${esc(tk.level)}</span>` : ''}
          </div>
          <div class="prose">${tk.text}</div>
          ${tk.hint ? `<details><summary>Подсказка</summary><div class="prose">${tk.hint}</div></details>` : ''}
          ${solution ? `<details class="sol"><summary>Показать решение</summary>${solution}</details>` : ''}
          <label class="check"><input type="checkbox" data-task="${key}" ${progress.tasks[key] ? 'checked' : ''}> Выполнено</label>
        </section>`;
      }).join('');
    }

    if (c.quiz?.length) {
      const best = progress.quiz[id];
      html += `<h2 class="block-title" id="quiz">Проверь себя</h2>
        <section class="card quiz" id="quizBox">
          ${c.quiz.map((q, qi) => `
            <div class="q" data-q="${qi}">
              <p class="q-text"><b>${qi + 1}.</b> ${q.q}</p>
              <div class="opts">${q.options.map((o, oi) => `
                <label class="opt"><input type="radio" name="q${qi}" value="${oi}"><span>${o}</span></label>`).join('')}
              </div>
              <div class="q-explain" hidden></div>
            </div>`).join('')}
          <div class="quiz-foot">
            <button type="button" class="btn btn-primary" id="quizCheck">Проверить</button>
            <button type="button" class="btn" id="quizReset" hidden>Пройти заново</button>
            <span class="quiz-result" id="quizResult">${best ? `Лучший результат: ${best.score}/${best.total}` : ''}</span>
          </div>
        </section>`;
    }

    if (c.resources?.length) {
      html += `<h2 class="block-title" id="resources">Что почитать</h2>
        <section class="card"><ul class="res">${c.resources.map(r =>
          `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)} ↗</a></li>`).join('')}</ul></section>`;
    }
    return html;
  }

  function bindTopic(id, c) {
    document.getElementById('statusRow').addEventListener('click', e => {
      const b = e.target.closest('[data-status]');
      if (!b) return;
      setStatus(id, b.dataset.status);
      renderStatusRow(id);
      refreshSide(id);
    });

    app.querySelectorAll('[data-anchor]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById(a.dataset.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));

    app.querySelectorAll('.copy-btn').forEach(btn => btn.addEventListener('click', () => {
      const text = btn.closest('.code').querySelector('code').innerText;
      navigator.clipboard?.writeText(text).then(() => {
        btn.textContent = 'Скопировано';
        setTimeout(() => (btn.textContent = 'Копировать'), 1500);
      });
    }));

    app.querySelectorAll('[data-task]').forEach(cb => cb.addEventListener('change', () => {
      if (cb.checked) progress.tasks[cb.dataset.task] = true;
      else delete progress.tasks[cb.dataset.task];
      cb.closest('.task').classList.toggle('task-done', cb.checked);
      touch(id);
      save();
      renderStatusRow(id);
      refreshSide(id);
    }));

    if (c?.quiz?.length) bindQuiz(id, c.quiz);
  }

  function refreshSide(id) {
    app.querySelectorAll('.side-link').forEach(a => {
      const tid = a.getAttribute('href').slice(4);
      a.className = a.className.replace(/st-\w+/, 'st-' + statusOf(tid));
    });
  }

  function bindQuiz(id, quiz) {
    const box = document.getElementById('quizBox');
    const checkBtn = document.getElementById('quizCheck');
    const resetBtn = document.getElementById('quizReset');
    const result = document.getElementById('quizResult');

    checkBtn.addEventListener('click', () => {
      const answers = quiz.map((_, qi) => box.querySelector(`input[name="q${qi}"]:checked`));
      if (answers.some(a => !a)) {
        result.textContent = 'Ответьте на все вопросы.';
        result.className = 'quiz-result warn';
        return;
      }
      let score = 0;
      quiz.forEach((q, qi) => {
        const qEl = box.querySelector(`[data-q="${qi}"]`);
        const chosen = +answers[qi].value;
        const ok = chosen === q.answer;
        if (ok) score++;
        qEl.querySelectorAll('.opt').forEach((o, oi) => {
          o.classList.toggle('right', oi === q.answer);
          o.classList.toggle('wrong', oi === chosen && !ok);
          o.querySelector('input').disabled = true;
        });
        const ex = qEl.querySelector('.q-explain');
        ex.innerHTML = (ok ? '✓ Верно. ' : '✗ Неверно. ') + (q.explain || '');
        ex.className = 'q-explain ' + (ok ? 'ok' : 'bad');
        ex.hidden = false;
      });

      const prevBest = progress.quiz[id];
      if (!prevBest || score > prevBest.score) progress.quiz[id] = { score, total: quiz.length };
      touch(id);
      save();
      renderStatusRow(id);
      refreshSide(id);

      const all = score === quiz.length;
      result.innerHTML = `Результат: ${score}/${quiz.length}` + (all && statusOf(id) !== 'done'
        ? ' — отлично! <button type="button" class="link-btn" id="markDone">Отметить тему изученной</button>' : '');
      result.className = 'quiz-result ' + (all ? 'good' : '');
      checkBtn.hidden = true;
      resetBtn.hidden = false;
      document.getElementById('markDone')?.addEventListener('click', () => {
        setStatus(id, 'done');
        renderStatusRow(id);
        refreshSide(id);
        result.textContent = `Результат: ${score}/${quiz.length} — тема отмечена изученной ✓`;
      });
    });

    resetBtn.addEventListener('click', () => {
      box.querySelectorAll('.opt').forEach(o => {
        o.classList.remove('right', 'wrong');
        const inp = o.querySelector('input');
        inp.disabled = false;
        inp.checked = false;
      });
      box.querySelectorAll('.q-explain').forEach(e => (e.hidden = true));
      result.textContent = '';
      result.className = 'quiz-result';
      checkBtn.hidden = false;
      resetBtn.hidden = true;
    });
  }

  // ---------- Роутер ----------
  function route() {
    const m = location.hash.match(/^#\/t\/([\w-]+)/);
    if (m) renderTopic(m[1]);
    else renderMap();
  }

  // ---------- Тема оформления ----------
  document.getElementById('themeBtn').addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.dataset.theme
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  window.addEventListener('hashchange', route);
  updateGlobalProgress();
  route();
})();
