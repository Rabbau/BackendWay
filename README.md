# [Backend Путь](https://rabbau.github.io/BackendWay/)

Интерактивный курс бэкенд-разработки на Python по роадмапу [roadmap.sh/backend](https://roadmap.sh/backend).

## Запуск

Откройте `index.html` в браузере или запустите локальный сервер:

```bash
python -m http.server 8765
```

и перейдите на http://localhost:8765.

## Структура

```
index.html          — страница, подключает скрипты
css/style.css       — стили (светлая/тёмная тема)
js/roadmap.js       — разделы и темы курса (порядок, названия, краткие описания)
js/registry.js      — registerContent() и описание формата контента
js/app.js           — карта, страницы тем, прогресс, тесты
content/*.js        — материалы тем, по файлу на раздел
```

## Как добавить материалы к теме

1. Создайте файл `content/<раздел>.js` (или откройте существующий).
2. Вызовите `registerContent('<id темы из roadmap.js>', { intro, theory, examples, tasks, quiz, resources })` —
   формат описан в `js/registry.js`.
3. Подключите новый файл в `index.html` перед `js/app.js`.

Код в примерах пишите через ``String.raw`...` ``, чтобы `\n` и другие обратные слэши остались как есть.
