// Раздел 2. Основы фронтенда (по желанию)

registerContent('html', {
  intro: `<p>Бэкендеру не нужно верстать сайты, но понимать, как устроена страница, необходимо: вы отдаёте HTML из шаблонов, принимаете данные HTML-форм, разбираетесь с XSS и SEO.
    <b>HTML</b> описывает <b>структуру и смысл</b> содержимого страницы: заголовки, абзацы, ссылки, формы.</p>`,
  theory: [
    {
      title: 'Структура документа',
      html: `<ul>
          <li>Документ — дерево <b>элементов</b>: открывающий тег, содержимое, закрывающий тег: <code>&lt;p&gt;Текст&lt;/p&gt;</code>. У тегов есть <b>атрибуты</b>: <code>&lt;a href="/notes"&gt;</code>.</li>
          <li><code>&lt;!doctype html&gt;</code>, затем <code>&lt;html&gt;</code> с <code>&lt;head&gt;</code> (метаданные: кодировка, заголовок вкладки, подключение CSS) и <code>&lt;body&gt;</code> (видимое содержимое).</li>
          <li>Основные элементы: заголовки <code>&lt;h1&gt;…&lt;h6&gt;</code>, абзац <code>&lt;p&gt;</code>, ссылка <code>&lt;a&gt;</code>, картинка <code>&lt;img alt="..."&gt;</code>, списки <code>&lt;ul&gt;/&lt;ol&gt;/&lt;li&gt;</code>, таблица <code>&lt;table&gt;</code>, контейнеры <code>&lt;div&gt;</code> и <code>&lt;span&gt;</code>.</li>
          <li><b>Семантические</b> элементы: <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;article&gt;</code>, <code>&lt;footer&gt;</code> — помогают поисковикам и программам чтения с экрана.</li>
        </ul>`,
    },
    {
      title: 'Формы — точка встречи с бэкендом',
      html: `<ul>
          <li><code>&lt;form action="/notes" method="post"&gt;</code> — куда и каким методом отправить данные. Формы умеют только GET и POST.</li>
          <li>Поля: <code>&lt;input name="title"&gt;</code> (типы: text, email, password, number, date, checkbox, file), <code>&lt;textarea&gt;</code>, <code>&lt;select&gt;</code>. На сервер уходят пары <b>name=value</b>.</li>
          <li>Кодировка тела: <code>application/x-www-form-urlencoded</code> по умолчанию, <code>multipart/form-data</code> — для загрузки файлов.</li>
          <li>Атрибуты <code>required</code>, <code>maxlength</code>, <code>type="email"</code> дают проверку в браузере — но это только удобство. <b>Сервер обязан проверять всё сам</b>: запрос можно отправить в обход формы.</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'Страница с формой',
      lang: 'html',
      code: String.raw`
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Мои заметки</title>
  <link rel="stylesheet" href="/static/style.css">
</head>
<body>
  <header><h1>Заметки</h1></header>
  <main>
    <form action="/notes" method="post">
      <label>Заголовок <input name="title" required maxlength="200"></label>
      <label>Текст <textarea name="body" rows="5"></textarea></label>
      <label>Теги <input name="tags" placeholder="через запятую"></label>
      <button type="submit">Сохранить</button>
    </form>
    <ul id="notes"></ul>
  </main>
  <script src="/static/app.js" defer></script>
</body>
</html>`,
    },
    {
      title: 'Приём формы в FastAPI',
      lang: 'python',
      code: String.raw`
# pip install python-multipart
from fastapi import Form
from fastapi.responses import RedirectResponse

@app.post("/notes")
def create_from_form(title: str = Form(max_length=200), body: str = Form(""), tags: str = Form("")):
    note = notes.create(title=title, body=body, tags=[t.strip() for t in tags.split(",") if t.strip()])
    return RedirectResponse(f"/notes/{note.id}", status_code=303)   # Post/Redirect/Get`,
      explain: `<p>После обработки POST-формы делают редирект (303) на GET-страницу — иначе обновление страницы повторно отправит форму.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Форма для API заметок',
      level: 'легко',
      text: `<p>Сверстайте страницу из примера, отдайте её через FastAPI (<code>StaticFiles</code> или шаблон Jinja2) и примите форму. Откройте DevTools → Network и посмотрите, в каком виде браузер отправил данные.
        Удалите атрибут <code>required</code> в DevTools и отправьте пустую форму — проверяет ли сервер?</p>`,
    },
  ],
  quiz: [
    { q: 'Какие методы HTTP поддерживает HTML-форма?', options: ['Все', 'GET и POST', 'Только POST', 'PUT и DELETE'], answer: 1 },
    { q: 'Достаточно ли атрибута <code>required</code> для проверки данных?', options: ['Да', 'Нет, сервер должен проверять сам', 'Только для email', 'Только в Chrome'], answer: 1 },
    { q: 'Какая кодировка формы нужна для загрузки файлов?', options: ['application/json', 'multipart/form-data', 'text/plain', 'x-www-form-urlencoded'], answer: 1 },
  ],
  resources: [
    { title: 'MDN: Введение в HTML', url: 'https://developer.mozilla.org/ru/docs/Learn_web_development/Core/Structuring_content' },
    { title: 'MDN: веб-формы', url: 'https://developer.mozilla.org/ru/docs/Learn_web_development/Extensions/Forms' },
  ],
});

registerContent('css', {
  intro: `<p><b>CSS</b> отвечает за внешний вид: цвета, шрифты, отступы, расположение блоков, адаптивность под телефоны. Бэкендеру достаточно основ — чтобы сделать аккуратную админку,
    страницу документации или прототип и понимать, о чём говорят фронтендеры.</p>`,
  theory: [
    {
      title: 'Селекторы и каскад',
      html: `<ul>
          <li>Правило: <code>селектор { свойство: значение; }</code>.</li>
          <li>Селекторы: по тегу <code>p</code>, классу <code>.card</code>, id <code>#notes</code>, вложенности <code>.card h2</code>, состоянию <code>a:hover</code>.</li>
          <li><b>Каскад</b>: если правила конфликтуют, побеждает более специфичный селектор (id &gt; класс &gt; тег), при равенстве — более позднее правило.</li>
          <li><b>Блочная модель</b>: содержимое → <code>padding</code> (внутренний отступ) → <code>border</code> → <code>margin</code> (внешний отступ). Почти всегда задают <code>box-sizing: border-box</code>.</li>
          <li><b>CSS-переменные</b>: <code>--accent: #5b5bf0;</code> и <code>color: var(--accent)</code> — основа тем оформления.</li>
        </ul>`,
    },
    {
      title: 'Раскладка: Flexbox и Grid',
      html: `<ul>
          <li><b>Flexbox</b> (<code>display: flex</code>) — элементы в строку или столбец: выравнивание, промежутки (<code>gap</code>), перенос. Для панелей, меню, карточек в ряд.</li>
          <li><b>Grid</b> (<code>display: grid</code>) — двумерная сетка: колонки и строки. Для общей раскладки страницы.</li>
          <li><b>Медиа-запросы</b> (<code>@media (max-width: 600px)</code>) — другие правила для узких экранов; <code>@media (prefers-color-scheme: dark)</code> — для тёмной темы системы.</li>
        </ul>
        <p>На практике часто используют готовые решения: Tailwind CSS, Pico.css, Bootstrap.</p>`,
    },
  ],
  examples: [
    {
      title: 'Аккуратная страница заметок',
      lang: 'css',
      code: String.raw`
:root {
  --bg: #f6f7fb;
  --card: #ffffff;
  --text: #1b1f2e;
  --accent: #5b5bf0;
}
@media (prefers-color-scheme: dark) {
  :root { --bg: #0d1017; --card: #151a24; --text: #e6e9f2; --accent: #8b8bff; }
}

* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); }
main { max-width: 900px; margin: 0 auto; padding: 24px 16px; }

form { display: flex; flex-direction: column; gap: 12px; }
input, textarea { width: 100%; padding: 10px; border: 1px solid #ccd; border-radius: 8px; font: inherit; }
button { align-self: flex-start; padding: 10px 18px; border: 0; border-radius: 8px;
         background: var(--accent); color: #fff; cursor: pointer; }

#notes { list-style: none; padding: 0; display: grid; gap: 12px;
         grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }   /* адаптивная сетка без медиа-запросов */
#notes li { background: var(--card); padding: 16px; border-radius: 12px; }`,
    },
  ],
  tasks: [
    {
      title: 'Стилизуйте страницу заметок',
      level: 'легко',
      text: `<p>Подключите стили из примера к странице из темы HTML. Проверьте вид на ширине телефона (DevTools → режим устройства) и в тёмной теме системы. Добавьте карточкам эффект при наведении.</p>`,
    },
  ],
  quiz: [
    { q: 'Какой селектор специфичнее?', options: ['p', '.note', '#main', 'Одинаково'], answer: 2 },
    { q: 'Что лучше подходит для двумерной сетки карточек?', options: ['float', 'Grid', 'table', 'position: absolute'], answer: 1 },
  ],
  resources: [
    { title: 'MDN: Основы CSS', url: 'https://developer.mozilla.org/ru/docs/Learn_web_development/Core/Styling_basics' },
    { title: 'Flexbox Froggy — игра', url: 'https://flexboxfroggy.com/#ru' },
  ],
});

registerContent('javascript', {
  intro: `<p><b>JavaScript</b> — язык, который выполняется в браузере: реагирует на действия пользователя, меняет страницу и обращается к вашему API через <code>fetch</code>.
    Для бэкендера важнее всего понимать, как фронтенд вызывает API, обрабатывает ответы и ошибки, — это помогает проектировать удобные API и отлаживать интеграцию.</p>`,
  theory: [
    {
      title: 'Основы языка',
      html: `<ul>
          <li>Переменные: <code>const</code> (нельзя переприсвоить) и <code>let</code>. Старый <code>var</code> не используйте.</li>
          <li>Типы похожи на Python: числа, строки, <code>true/false</code>, <code>null</code> и <code>undefined</code>, массивы <code>[]</code>, объекты <code>{}</code> (аналог dict).</li>
          <li>Сравнение — строгое <code>===</code> (без приведения типов); <code>==</code> даёт сюрпризы: <code>"1" == 1</code> истинно.</li>
          <li>Функции: <code>function f(x) {}</code> и стрелочные <code>(x) =&gt; x * 2</code>. Методы массивов: <code>map</code>, <code>filter</code>, <code>find</code>, <code>reduce</code>.</li>
          <li><code>JSON.parse</code> / <code>JSON.stringify</code> — разбор и сборка JSON.</li>
        </ul>`,
    },
    {
      title: 'Асинхронность и fetch',
      html: `<ul>
          <li>Сетевые операции асинхронны и возвращают <b>Promise</b>. Как в Python: <code>async function</code> и <code>await</code>.</li>
          <li><code>fetch(url, {method, headers, body})</code> — HTTP-запрос. Важно: <code>fetch</code> <b>не</b> выбрасывает ошибку на 4xx/5xx — проверяйте <code>res.ok</code> или <code>res.status</code>. Исключение будет только при сетевой ошибке.</li>
          <li>Запросы к другому origin подчиняются CORS (тема CORS), cookie отправляются с <code>credentials: "include"</code>.</li>
        </ul>`,
    },
    {
      title: 'DOM и события',
      html: `<ul>
          <li><b>DOM</b> — дерево элементов страницы как объекты: <code>document.querySelector("#notes")</code>.</li>
          <li>Изменение: <code>el.textContent = ...</code> (безопасно), <code>document.createElement</code>, <code>el.append</code>.</li>
          <li><code>el.innerHTML = данные_пользователя</code> — прямой путь к <b>XSS</b> (тема CSP). Вставляйте текст через <code>textContent</code>.</li>
          <li>События: <code>el.addEventListener("click", handler)</code>, отправка формы — событие <code>submit</code> (<code>event.preventDefault()</code> отменяет обычную отправку).</li>
        </ul>
        <p>На JavaScript работает и бэкенд (Node.js, Deno, Bun), а TypeScript добавляет статическую типизацию. Крупные интерфейсы строят на фреймворках: React, Vue, Svelte, Angular.</p>`,
    },
  ],
  examples: [
    {
      title: 'Клиент для API заметок',
      lang: 'javascript',
      code: String.raw`
const API = "/api";
const list = document.querySelector("#notes");
const form = document.querySelector("form");

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "include",
  });
  if (!res.ok) {                                   // fetch не бросает исключение на 4xx/5xx
    const problem = await res.json().catch(() => ({}));
    throw new Error(problem.title || "Ошибка " + res.status);
  }
  return res.status === 204 ? null : res.json();
}

function render(notes) {
  list.replaceChildren(...notes.map((n) => {
    const li = document.createElement("li");
    const h = document.createElement("h3");
    h.textContent = n.title;                       // textContent, а не innerHTML — защита от XSS
    const tags = document.createElement("small");
    tags.textContent = n.tags.join(", ");
    li.append(h, tags);
    return li;
  }));
}

async function load() {
  const data = await api("/notes?page=1");
  render(data.items);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const fd = new FormData(form);
  try {
    await api("/notes", {
      method: "POST",
      body: JSON.stringify({
        title: fd.get("title"),
        body: fd.get("body"),
        tags: fd.get("tags").split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    form.reset();
    await load();
  } catch (e) {
    alert(e.message);
  }
});

load();`,
    },
  ],
  tasks: [
    {
      title: 'Мини-фронтенд для заметок',
      level: 'средне',
      text: `<p>Сделайте одностраничный клиент для API заметок: список, создание, удаление (кнопка у каждой заметки), фильтр по тегу и сообщения об ошибках (например, 422 с полями). Раздавайте его через Nginx вместе с API на одном домене — без CORS.</p>`,
    },
    {
      title: 'Найдите XSS',
      level: 'легко',
      text: `<p>Замените в функции <code>render</code> <code>textContent</code> на <code>innerHTML</code> и создайте заметку с заголовком <code>&lt;img src=x onerror="alert('XSS')"&gt;</code>. Что произошло? Верните безопасный вариант.</p>`,
    },
  ],
  quiz: [
    { q: 'Бросает ли <code>fetch</code> исключение при ответе 404?', options: ['Да', 'Нет, нужно проверять res.ok / res.status', 'Только при POST', 'Только по HTTPS'], answer: 1 },
    { q: 'Как безопасно вставить текст от пользователя в страницу?', options: ['innerHTML', 'textContent', 'document.write', 'eval'], answer: 1 },
    { q: 'Чем <code>===</code> отличается от <code>==</code>?', options: ['Ничем', '=== сравнивает без приведения типов', '=== быстрее в 3 раза', '== только для строк'], answer: 1 },
  ],
  resources: [
    { title: 'Современный учебник JavaScript', url: 'https://learn.javascript.ru/' },
    { title: 'MDN: Fetch API', url: 'https://developer.mozilla.org/ru/docs/Web/API/Fetch_API/Using_Fetch' },
  ],
});
