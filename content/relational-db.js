// Раздел 5. Реляционные базы данных

registerContent('sql-basics', {
  intro: `<p>Почти любой бэкенд — это «прослойка» между клиентом и базой данных. <b>Реляционные БД</b> хранят данные в таблицах со строгой структурой,
    а общаются с ними на языке <b>SQL</b>. SQL почти одинаков в PostgreSQL, MySQL и SQLite, поэтому выучив его один раз, вы сможете работать с любой из них.</p>
    <p>Все примеры этой темы можно выполнять в SQLite: он встроен в Python, ничего устанавливать не нужно (подробнее — в следующей теме).</p>`,
  theory: [
    {
      title: 'Таблицы, строки, столбцы, ключи',
      html: `<p><b>Таблица</b> описывает сущность (пользователи, заказы). <b>Столбец</b> — атрибут с определённым типом (<code>name TEXT</code>),
        <b>строка</b> — одна запись.</p>
        <ul>
          <li><b>Первичный ключ</b> (<code>PRIMARY KEY</code>) — уникальный идентификатор строки, обычно <code>id</code>.</li>
          <li><b>Внешний ключ</b> (<code>FOREIGN KEY</code>) — ссылка на строку другой таблицы: <code>orders.user_id → users.id</code>. Так строятся <b>связи</b>.</li>
          <li>Ограничения: <code>NOT NULL</code> (обязательно), <code>UNIQUE</code> (без повторов), <code>DEFAULT</code> (значение по умолчанию), <code>CHECK</code> (условие).</li>
        </ul>
        <p>Виды связей: <b>один-ко-многим</b> (у пользователя много заказов — внешний ключ в таблице заказов),
        <b>многие-ко-многим</b> (заказы и товары — через промежуточную таблицу <code>order_items</code>), <b>один-к-одному</b> (пользователь и его профиль).</p>`,
    },
    {
      title: 'Создание таблиц (DDL)',
      html: `<p><b>DDL</b> (Data Definition Language) описывает структуру: <code>CREATE TABLE</code>, <code>ALTER TABLE</code>, <code>DROP TABLE</code>.</p>
        <p>Основные типы: <code>INTEGER</code>, <code>NUMERIC(10,2)</code>/<code>DECIMAL</code> (деньги), <code>REAL</code>/<code>DOUBLE</code>, <code>TEXT</code>/<code>VARCHAR(n)</code>,
        <code>BOOLEAN</code>, <code>DATE</code>, <code>TIMESTAMP</code>. Точные названия немного отличаются между СУБД.</p>
        <p class="note">Ключевые слова SQL не чувствительны к регистру, но принято писать их ЗАГЛАВНЫМИ, а имена таблиц и столбцов — <code>snake_case</code> строчными.</p>`,
    },
    {
      title: 'CRUD: INSERT, SELECT, UPDATE, DELETE',
      html: `<table>
          <tr><th>Операция</th><th>SQL</th><th>HTTP-аналог</th></tr>
          <tr><td>Create</td><td><code>INSERT INTO t (a, b) VALUES (1, 2)</code></td><td>POST</td></tr>
          <tr><td>Read</td><td><code>SELECT a, b FROM t WHERE ...</code></td><td>GET</td></tr>
          <tr><td>Update</td><td><code>UPDATE t SET a = 1 WHERE ...</code></td><td>PUT/PATCH</td></tr>
          <tr><td>Delete</td><td><code>DELETE FROM t WHERE ...</code></td><td>DELETE</td></tr>
        </table>
        <p class="note"><code>UPDATE</code> и <code>DELETE</code> без <code>WHERE</code> изменят <b>все строки таблицы</b>. Всегда сначала пишите <code>WHERE</code>,
        а перед опасной операцией проверьте выборку тем же условием через <code>SELECT</code>.</p>`,
    },
    {
      title: 'Фильтрация, сортировка, пагинация',
      html: `<ul>
          <li><code>WHERE</code>: <code>=</code>, <code>&lt;&gt;</code>/<code>!=</code>, <code>&gt;</code>, <code>BETWEEN 10 AND 20</code>, <code>IN (1, 2, 3)</code>,
            <code>LIKE 'Ан%'</code> (шаблон: <code>%</code> — любые символы, <code>_</code> — один), <code>IS NULL</code>, логика <code>AND</code>/<code>OR</code>/<code>NOT</code>.</li>
          <li><code>ORDER BY price DESC, name</code> — сортировка.</li>
          <li><code>LIMIT 10 OFFSET 20</code> — пагинация (третья страница по 10).</li>
          <li><code>SELECT DISTINCT city</code> — без повторов; <code>AS</code> — псевдоним столбца или таблицы.</li>
        </ul>
        <p><code>NULL</code> — «значение неизвестно». С ним нельзя сравнивать через <code>=</code>: <code>NULL = NULL</code> даёт не TRUE, а NULL. Только <code>IS NULL</code> / <code>IS NOT NULL</code>.</p>`,
    },
    {
      title: 'JOIN — соединение таблиц',
      html: `<p>Данные разложены по разным таблицам, а <code>JOIN</code> собирает их обратно по условию связи:</p>
        <ul>
          <li><code>INNER JOIN</code> (или просто <code>JOIN</code>) — только строки, у которых нашлась пара в обеих таблицах;</li>
          <li><code>LEFT JOIN</code> — все строки левой таблицы, а где пары нет — <code>NULL</code> в столбцах правой (например, «пользователи и их заказы, включая тех, у кого заказов нет»);</li>
          <li><code>RIGHT JOIN</code> / <code>FULL JOIN</code> — зеркальный вариант и «все из обеих», используются реже.</li>
        </ul>`,
    },
    {
      title: 'Агрегация: GROUP BY и HAVING',
      html: `<p>Агрегатные функции считают по группе строк: <code>COUNT(*)</code>, <code>SUM()</code>, <code>AVG()</code>, <code>MIN()</code>, <code>MAX()</code>.</p>
        <p><code>GROUP BY user_id</code> разбивает строки на группы, и агрегат считается для каждой. <code>HAVING</code> фильтрует уже группы
        (<code>WHERE</code> — строки до группировки, <code>HAVING</code> — группы после).</p>
        <p>Порядок выполнения запроса: <code>FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT</code>.
        Поэтому псевдоним из <code>SELECT</code> нельзя использовать в <code>WHERE</code> (в большинстве СУБД).</p>`,
    },
  ],
  examples: [
    {
      title: 'Схема учебного интернет-магазина',
      lang: 'sql',
      code: String.raw`
CREATE TABLE users (
    id         INTEGER PRIMARY KEY,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE,
    city       TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id    INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0)   -- в копейках
);

CREATE TABLE orders (
    id         INTEGER PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id),
    status     TEXT NOT NULL DEFAULT 'new',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- многие-ко-многим: какие товары в каком заказе
CREATE TABLE order_items (
    order_id   INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    qty        INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (order_id, product_id)
);

INSERT INTO users (name, email, city) VALUES
    ('Анна',  'anna@mail.ru',  'Москва'),
    ('Борис', 'boris@mail.ru', 'Казань'),
    ('Вера',  'vera@mail.ru',  NULL);

INSERT INTO products (title, price) VALUES
    ('Клавиатура', 350000), ('Мышь', 120000), ('Монитор', 1890000);

INSERT INTO orders (user_id, status) VALUES (1, 'paid'), (1, 'new'), (2, 'paid');

INSERT INTO order_items VALUES (1, 1, 1), (1, 2, 2), (2, 3, 1), (3, 2, 1);`,
    },
    {
      title: 'Выборки',
      lang: 'sql',
      code: String.raw`
-- Товары дороже 2000 ₽, сначала дорогие
SELECT title, price / 100.0 AS price_rub
FROM products
WHERE price > 200000
ORDER BY price DESC;

-- Пользователи без города
SELECT name FROM users WHERE city IS NULL;

-- Поиск по началу имени
SELECT * FROM users WHERE name LIKE 'Б%';

-- Изменение и удаление — всегда с WHERE!
UPDATE orders SET status = 'cancelled' WHERE id = 2;
DELETE FROM order_items WHERE order_id = 2;`,
    },
    {
      title: 'JOIN и агрегация',
      lang: 'sql',
      code: String.raw`
-- Заказы с именами покупателей
SELECT o.id, u.name, o.status
FROM orders AS o
JOIN users AS u ON u.id = o.user_id;

-- Все пользователи и количество их заказов (включая тех, у кого 0)
SELECT u.name, COUNT(o.id) AS orders_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name
ORDER BY orders_count DESC;

-- Сумма каждого заказа: три таблицы сразу
SELECT o.id, u.name, SUM(p.price * oi.qty) / 100.0 AS total_rub
FROM orders o
JOIN users u        ON u.id = o.user_id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
GROUP BY o.id, u.name
HAVING SUM(p.price * oi.qty) > 500000;   -- только заказы больше 5000 ₽`,
      explain: `<p>Псевдонимы таблиц (<code>o</code>, <code>u</code>) сокращают запрос. <code>COUNT(o.id)</code> вместо <code>COUNT(*)</code> важен при <code>LEFT JOIN</code>:
        для пользователя без заказов он даст 0, а не 1.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Простые выборки',
      level: 'легко',
      text: `<p>Создайте схему из примера (в SQLite — см. следующую тему или онлайн на <a href="https://sqliteonline.com" target="_blank" rel="noopener">sqliteonline.com</a>) и напишите запросы:</p>
        <ol>
          <li>Все товары по возрастанию цены.</li>
          <li>Email пользователей из Москвы.</li>
          <li>Количество заказов со статусом <code>paid</code>.</li>
          <li>Самый дорогой товар (одна строка).</li>
        </ol>`,
      solutionCode: String.raw`
SELECT * FROM products ORDER BY price;
SELECT email FROM users WHERE city = 'Москва';
SELECT COUNT(*) FROM orders WHERE status = 'paid';
SELECT * FROM products ORDER BY price DESC LIMIT 1;`,
      solutionLang: 'sql',
    },
    {
      title: 'Отчёты',
      level: 'средне',
      text: `<ol>
          <li>Для каждого пользователя — общая сумма оплаченных (<code>paid</code>) заказов в рублях. Пользователи без оплат тоже должны быть в списке с 0.</li>
          <li>Сколько штук каждого товара продано (по всем заказам), отсортировать по убыванию.</li>
          <li>Товары, которые ни разу не заказывали.</li>
        </ol>`,
      hint: `<p>Для п.1: <code>LEFT JOIN</code> и условие на статус нужно поставить в <code>ON</code>, а не в <code>WHERE</code> — иначе пользователи без заказов отфильтруются.
        <code>COALESCE(x, 0)</code> заменяет NULL на 0. Для п.3: <code>LEFT JOIN ... WHERE oi.product_id IS NULL</code>.</p>`,
      solutionCode: String.raw`
-- 1
SELECT u.name, COALESCE(SUM(p.price * oi.qty), 0) / 100.0 AS paid_rub
FROM users u
LEFT JOIN orders o       ON o.user_id = u.id AND o.status = 'paid'
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN products p     ON p.id = oi.product_id
GROUP BY u.id, u.name;

-- 2
SELECT p.title, COALESCE(SUM(oi.qty), 0) AS sold
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id, p.title
ORDER BY sold DESC;

-- 3
SELECT p.title
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
WHERE oi.product_id IS NULL;`,
      solutionLang: 'sql',
    },
    {
      title: 'Спроектируйте схему',
      level: 'сложно',
      text: `<p>Спроектируйте таблицы для блога: пользователи, посты (у поста один автор), комментарии (к посту, от пользователя), теги (у поста много тегов, тег у многих постов).
        Напишите <code>CREATE TABLE</code> со всеми ключами и ограничениями, заполните данными и выведите: 5 последних постов с именем автора и числом комментариев;
        все посты с тегом <code>python</code>.</p>`,
      hint: `<p>Для тегов нужна промежуточная таблица <code>post_tags(post_id, tag_id)</code> с составным первичным ключом.</p>`,
    },
  ],
  quiz: [
    { q: 'Что произойдёт после <code>DELETE FROM users;</code>?', options: ['Ошибка: нет WHERE', 'Удалится таблица', 'Удалятся все строки таблицы', 'Удалится первая строка'], answer: 2 },
    { q: 'Как правильно найти строки, где <code>city</code> не заполнен?', options: ['WHERE city = NULL', "WHERE city = ''", 'WHERE city IS NULL', 'WHERE NOT city'], answer: 2 },
    { q: 'Какой JOIN вернёт всех пользователей, даже без заказов?', options: ['INNER JOIN orders', 'users LEFT JOIN orders', 'users RIGHT JOIN orders', 'CROSS JOIN'], answer: 1 },
    { q: 'Чем HAVING отличается от WHERE?', options: ['Ничем', 'HAVING фильтрует группы после GROUP BY, WHERE — строки до', 'HAVING работает только с текстом', 'WHERE нельзя использовать с JOIN'], answer: 1 },
    { q: 'Как реализовать связь многие-ко-многим?', options: ['Столбец со списком id через запятую', 'Промежуточная таблица с двумя внешними ключами', 'Два первичных ключа в одной таблице', 'Никак, реляционные БД это не умеют'], answer: 1 },
  ],
  resources: [
    { title: 'SQLBolt — интерактивные уроки SQL', url: 'https://sqlbolt.com/' },
    { title: 'SQL Murder Mystery — детектив на SQL', url: 'https://mystery.knightlab.com/' },
    { title: 'Визуальное объяснение JOIN', url: 'https://joins.spathon.com/' },
  ],
});

registerContent('sqlite', {
  intro: `<p><b>SQLite</b> — самая распространённая база данных в мире: она есть в каждом смартфоне, браузере и в Python «из коробки».
    Вся база — это один файл, отдельный сервер не нужен. Идеальна для обучения, прототипов, тестов, десктопных и мобильных приложений.</p>`,
  theory: [
    {
      title: 'Встраиваемая vs клиент-серверная БД',
      html: `<p>PostgreSQL и MySQL — отдельные <b>серверы</b>: приложение подключается к ним по сети, они обслуживают много клиентов одновременно.
        SQLite — <b>библиотека</b>, которая читает и пишет файл прямо внутри процесса вашего приложения.</p>
        <table>
          <tr><th></th><th>SQLite</th><th>PostgreSQL / MySQL</th></tr>
          <tr><td>Установка</td><td>Не нужна</td><td>Отдельный сервер</td></tr>
          <tr><td>Хранение</td><td>Один файл</td><td>Каталог данных сервера</td></tr>
          <tr><td>Одновременная запись</td><td>Один писатель за раз</td><td>Много параллельных писателей</td></tr>
          <tr><td>Доступ по сети</td><td>Нет</td><td>Да</td></tr>
          <tr><td>Где уместна</td><td>Обучение, тесты, небольшие сайты, мобильные приложения</td><td>Продакшен-бэкенды с нагрузкой</td></tr>
        </table>`,
    },
    {
      title: 'Модуль sqlite3 в Python',
      html: `<ul>
          <li><code>sqlite3.connect("app.db")</code> — открыть (или создать) файл БД; <code>":memory:"</code> — БД в памяти, удобно для тестов.</li>
          <li><code>conn.execute(sql, params)</code> — выполнить запрос; <code>.fetchone()</code>, <code>.fetchall()</code> — получить строки.</li>
          <li><code>conn.commit()</code> — сохранить изменения. Если использовать соединение как контекстный менеджер (<code>with conn:</code>), commit/rollback делается автоматически.</li>
          <li><code>conn.row_factory = sqlite3.Row</code> — строки как словари: <code>row["name"]</code>.</li>
        </ul>`,
    },
    {
      title: 'Параметры запросов и SQL-инъекции',
      html: `<p><b>Никогда</b> не подставляйте данные пользователя в SQL через f-строки или конкатенацию:</p>
        <p><code>f"SELECT * FROM users WHERE email = '{email}'"</code> — если вместо email прислать <code>' OR '1'='1</code>, запрос вернёт всех пользователей.
        Это <b>SQL-инъекция</b> — одна из самых опасных и частых уязвимостей.</p>
        <p>Правильно — <b>параметризованные запросы</b>: <code>conn.execute("SELECT * FROM users WHERE email = ?", (email,))</code>.
        Драйвер передаёт значение отдельно от текста запроса, и оно никогда не станет частью SQL-кода.</p>
        <p class="note">В sqlite3 плейсхолдер — <code>?</code> или <code>:name</code>; в драйверах PostgreSQL (psycopg) — <code>%s</code>. Принцип одинаков.</p>`,
    },
    {
      title: 'Особенности SQLite',
      html: `<ul>
          <li><b>Гибкая типизация</b>: тип столбца — скорее рекомендация; в <code>INTEGER</code>-столбец можно записать строку. С версии 3.37 есть <code>STRICT</code>-таблицы.</li>
          <li><b>Внешние ключи выключены по умолчанию</b>: включайте <code>PRAGMA foreign_keys = ON;</code> при каждом подключении.</li>
          <li>Нет отдельного типа даты — храните ISO-строки (<code>2026-10-05 14:00:00</code>) или Unix-время.</li>
          <li><b>WAL-режим</b> (<code>PRAGMA journal_mode = WAL;</code>) позволяет читать во время записи и заметно ускоряет работу веб-приложений.</li>
          <li>Консольный клиент — <code>sqlite3 app.db</code>; графический — <a href="https://sqlitebrowser.org/" target="_blank" rel="noopener">DB Browser for SQLite</a>.</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'Работа с SQLite из Python',
      lang: 'python',
      code: String.raw`
import sqlite3

conn = sqlite3.connect("shop.db")
conn.row_factory = sqlite3.Row
conn.execute("PRAGMA foreign_keys = ON")

conn.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id    INTEGER PRIMARY KEY,
        name  TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
    )
""")

with conn:  # commit при успехе, rollback при исключении
    conn.execute("INSERT INTO users (name, email) VALUES (?, ?)", ("Анна", "anna@mail.ru"))
    conn.executemany(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        [("Борис", "boris@mail.ru"), ("Вера", "vera@mail.ru")],
    )

for row in conn.execute("SELECT id, name, email FROM users ORDER BY name"):
    print(row["id"], row["name"], row["email"])

user = conn.execute("SELECT * FROM users WHERE email = ?", ("anna@mail.ru",)).fetchone()
print(dict(user))   # {'id': 1, 'name': 'Анна', 'email': 'anna@mail.ru'}`,
      explain: `<p>Повторный запуск упадёт с <code>sqlite3.IntegrityError: UNIQUE constraint failed</code> — email уникален. Удалите <code>shop.db</code> или перехватите исключение.</p>`,
    },
    {
      title: 'Как выглядит SQL-инъекция',
      lang: 'python',
      code: String.raw`
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (email TEXT, password_hash TEXT)")
conn.executemany("INSERT INTO users VALUES (?, ?)", [("a@x.ru", "h1"), ("b@x.ru", "h2")])

evil = "' OR '1'='1"

# УЯЗВИМО: строка пользователя становится частью SQL
query = f"SELECT * FROM users WHERE email = '{evil}'"
print(query)                              # ... WHERE email = '' OR '1'='1'
print(conn.execute(query).fetchall())     # вернулись ВСЕ пользователи!

# БЕЗОПАСНО: значение передаётся отдельно
print(conn.execute("SELECT * FROM users WHERE email = ?", (evil,)).fetchall())  # []`,
    },
    {
      title: 'Консольный клиент',
      lang: 'bash',
      code: String.raw`
sqlite3 shop.db
sqlite> .tables                 -- список таблиц
sqlite> .schema users           -- структура таблицы
sqlite> .headers on
sqlite> .mode column
sqlite> SELECT * FROM users;
sqlite> .quit`,
    },
  ],
  tasks: [
    {
      title: 'Магазин в SQLite',
      level: 'легко',
      text: `<p>Напишите скрипт <code>init_db.py</code>, который создаёт файл <code>shop.db</code> со схемой магазина из темы «Основы SQL» и заполняет тестовыми данными.
        Скрипт должен быть идемпотентным: повторный запуск не падает и не дублирует данные.</p>`,
      hint: `<p><code>CREATE TABLE IF NOT EXISTS</code> и <code>INSERT OR IGNORE</code> (в SQLite) либо проверка «таблица пуста» перед вставкой.
        Несколько команд сразу выполняет <code>conn.executescript(sql)</code>.</p>`,
    },
    {
      title: 'Репозиторий пользователей',
      level: 'средне',
      text: `<p>Напишите класс <code>UserRepository</code> поверх sqlite3 с методами <code>create(name, email) -> int</code>, <code>get(id) -> dict | None</code>,
        <code>find_by_email(email)</code>, <code>list(limit, offset)</code>, <code>delete(id) -> bool</code>. При дубликате email бросайте своё исключение <code>EmailTaken</code>.
        Все запросы — только параметризованные.</p>`,
      solutionCode: String.raw`
import sqlite3

class EmailTaken(Exception):
    pass

class UserRepository:
    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn
        self.conn.row_factory = sqlite3.Row

    def create(self, name: str, email: str) -> int:
        try:
            with self.conn:
                cur = self.conn.execute("INSERT INTO users (name, email) VALUES (?, ?)", (name, email))
        except sqlite3.IntegrityError:
            raise EmailTaken(email) from None
        return cur.lastrowid

    def get(self, user_id: int) -> dict | None:
        row = self.conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(row) if row else None

    def find_by_email(self, email: str) -> dict | None:
        row = self.conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        return dict(row) if row else None

    def list(self, limit: int = 20, offset: int = 0) -> list[dict]:
        rows = self.conn.execute("SELECT * FROM users ORDER BY id LIMIT ? OFFSET ?", (limit, offset))
        return [dict(r) for r in rows]

    def delete(self, user_id: int) -> bool:
        with self.conn:
            cur = self.conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        return cur.rowcount > 0`,
    },
    {
      title: 'API заметок на SQLite',
      level: 'сложно',
      text: `<p>Переведите ваш проект «API заметок» (тема «Первый веб-сервер») с JSON-файла на SQLite. Таблицы: <code>notes</code>, <code>tags</code>, <code>note_tags</code>.
        Фильтр по тегу и пагинацию делайте средствами SQL (<code>JOIN</code>, <code>LIMIT/OFFSET</code>), а не в Python. Закоммитьте изменения отдельной веткой и слейте через Pull Request.</p>`,
      hint: `<p>Соединение удобно открывать на каждый запрос через зависимость FastAPI: функция с <code>yield conn</code> и закрытием в <code>finally</code>, параметр <code>conn = Depends(get_db)</code>.</p>`,
    },
  ],
  quiz: [
    { q: 'Чем SQLite принципиально отличается от PostgreSQL?', options: ['Не поддерживает SQL', 'Работает как библиотека внутри приложения, без отдельного сервера', 'Хранит данные только в памяти', 'Платная'], answer: 1 },
    { q: 'Как безопасно подставить email пользователя в запрос?', options: ['f-строкой', 'Через .format()', 'Параметром: execute("... WHERE email = ?", (email,))', 'Экранировать кавычки вручную'], answer: 2 },
    { q: 'Что нужно сделать, чтобы SQLite проверял внешние ключи?', options: ['Ничего, включено всегда', 'PRAGMA foreign_keys = ON', 'Использовать тип FOREIGN', 'Установить расширение'], answer: 1 },
    { q: 'Что делает <code>with conn:</code> для соединения sqlite3?', options: ['Закрывает соединение', 'Коммитит при успехе и откатывает при исключении', 'Создаёт таблицы', 'Включает WAL'], answer: 1 },
  ],
  resources: [
    { title: 'Документация модуля sqlite3', url: 'https://docs.python.org/3/library/sqlite3.html' },
    { title: 'SQLite: когда её использовать', url: 'https://www.sqlite.org/whentouse.html' },
  ],
});

registerContent('postgresql', {
  intro: `<p><b>PostgreSQL</b> («Постгрес») — мощная open-source СУБД и выбор по умолчанию для новых бэкенд-проектов.
    Строгая к данным, надёжная, с богатыми возможностями: JSONB, массивы, полнотекстовый поиск, расширения (PostGIS, pgvector).</p>`,
  theory: [
    {
      title: 'Установка и подключение',
      html: `<p>Самый простой способ — Docker (подробнее в разделе «Контейнеризация»):</p>
        <p><code>docker run --name pg -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres:17</code></p>
        <p>Без Docker — установщик с <a href="https://www.postgresql.org/download/" target="_blank" rel="noopener">postgresql.org</a>. Облачные бесплатные варианты: Neon, Supabase.</p>
        <p>Строка подключения (DSN): <code>postgresql://user:password@host:5432/dbname</code>. Её кладут в переменную окружения <code>DATABASE_URL</code>.</p>
        <p>Клиенты: консольный <code>psql</code>, графические DBeaver, pgAdmin, DataGrip.</p>`,
    },
    {
      title: 'Структура: кластер, базы, схемы, роли',
      html: `<ul>
          <li><b>Кластер</b> — один запущенный сервер PostgreSQL.</li>
          <li>В нём несколько <b>баз данных</b> — изолированных друг от друга (обычно одна на приложение).</li>
          <li>В базе — <b>схемы</b> (пространства имён), по умолчанию <code>public</code>.</li>
          <li><b>Роли</b> — пользователи и группы с правами. Приложению создают отдельную роль с минимальными правами, а не работают под суперпользователем <code>postgres</code>.</li>
        </ul>`,
    },
    {
      title: 'Типы данных PostgreSQL',
      html: `<table>
          <tr><th>Тип</th><th>Для чего</th></tr>
          <tr><td><code>BIGINT GENERATED ALWAYS AS IDENTITY</code></td><td>Автоинкрементный id (современная замена <code>SERIAL</code>)</td></tr>
          <tr><td><code>UUID</code></td><td>Глобально уникальные id (<code>gen_random_uuid()</code>)</td></tr>
          <tr><td><code>TEXT</code>, <code>VARCHAR(n)</code></td><td>Строки (в PG <code>TEXT</code> не медленнее <code>VARCHAR</code>)</td></tr>
          <tr><td><code>NUMERIC(12,2)</code></td><td>Деньги и точные числа</td></tr>
          <tr><td><code>TIMESTAMPTZ</code></td><td>Дата-время с часовым поясом — используйте его, а не <code>TIMESTAMP</code></td></tr>
          <tr><td><code>BOOLEAN</code></td><td>true / false</td></tr>
          <tr><td><code>JSONB</code></td><td>JSON с индексами и операторами поиска</td></tr>
          <tr><td><code>TEXT[]</code></td><td>Массивы</td></tr>
        </table>`,
    },
    {
      title: 'Полезные возможности',
      html: `<ul>
          <li><code>RETURNING</code>: <code>INSERT ... RETURNING id</code> — получить созданную строку без второго запроса.</li>
          <li><b>Upsert</b>: <code>INSERT ... ON CONFLICT (email) DO UPDATE SET ...</code> — вставить или обновить.</li>
          <li><b>JSONB-операторы</b>: <code>data-&gt;&gt;'city'</code> — достать поле, <code>data @&gt; '{"tag": "x"}'</code> — содержит ли.</li>
          <li><b>Оконные функции</b>: <code>ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at)</code> — ранжирование внутри групп.</li>
          <li><b>CTE</b>: <code>WITH paid AS (SELECT ...) SELECT ... FROM paid</code> — читаемые многошаговые запросы.</li>
          <li><code>EXPLAIN ANALYZE</code> — как выполняется запрос (тема «Профилирование»).</li>
        </ul>`,
    },
    {
      title: 'Подключение из Python',
      html: `<p>Основной драйвер — <b>psycopg</b> (версия 3): <code>pip install "psycopg[binary]"</code>. Для асинхронных приложений — также <code>asyncpg</code>.
        Чаще всего напрямую драйвер не используют, а работают через ORM <b>SQLAlchemy</b> или Django ORM (следующий раздел), но понимать «сырой» SQL обязательно.</p>
        <p>В вебе соединения переиспользуют через <b>пул соединений</b> (<code>psycopg_pool</code>, пул SQLAlchemy, внешний PgBouncer): открывать новое соединение на каждый запрос дорого.</p>`,
    },
  ],
  examples: [
    {
      title: 'Запуск в Docker и psql',
      lang: 'bash',
      code: String.raw`
docker run --name pg -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres:17
docker exec -it pg psql -U postgres

postgres=# CREATE ROLE app LOGIN PASSWORD 'app_pass';
postgres=# CREATE DATABASE shop OWNER app;
postgres=# \c shop app          -- подключиться к базе shop
shop=> \dt                      -- список таблиц
shop=> \d users                 -- структура таблицы
shop=> \q                       -- выход`,
    },
    {
      title: 'Схема с возможностями PostgreSQL',
      lang: 'sql',
      code: String.raw`
CREATE TABLE users (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email      TEXT NOT NULL UNIQUE,
    name       TEXT NOT NULL,
    settings   JSONB NOT NULL DEFAULT '{}',
    tags       TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Вставка с возвратом созданной строки
INSERT INTO users (email, name, settings, tags)
VALUES ('anna@mail.ru', 'Анна', '{"theme": "dark", "lang": "ru"}', ARRAY['vip'])
RETURNING id, created_at;

-- Upsert: создать или обновить имя
INSERT INTO users (email, name) VALUES ('anna@mail.ru', 'Анна И.')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;

-- JSONB и массивы
SELECT name, settings->>'theme' AS theme
FROM users
WHERE settings @> '{"lang": "ru"}' AND 'vip' = ANY(tags);`,
    },
    {
      title: 'psycopg 3 из Python',
      lang: 'python',
      code: String.raw`
# pip install "psycopg[binary]"
import os
import psycopg
from psycopg.rows import dict_row

DSN = os.environ.get("DATABASE_URL", "postgresql://app:app_pass@localhost:5432/shop")

with psycopg.connect(DSN, row_factory=dict_row) as conn:
    # параметр — %s, значение передаётся отдельно (защита от инъекций)
    row = conn.execute(
        "INSERT INTO users (email, name) VALUES (%s, %s) RETURNING id",
        ("boris@mail.ru", "Борис"),
    ).fetchone()
    print("Создан id", row["id"])

    users = conn.execute("SELECT id, name FROM users ORDER BY id").fetchall()
    print(users)
# выход из with: commit при успехе, rollback при ошибке`,
    },
  ],
  tasks: [
    {
      title: 'Поднимите PostgreSQL',
      level: 'легко',
      text: `<p>Запустите PostgreSQL (Docker или установщик), создайте роль <code>app</code> и базу <code>shop</code>. Подключитесь через <code>psql</code> и через DBeaver.
        Перенесите схему магазина из темы «Основы SQL», заменив типы на PostgreSQL-аналоги (<code>IDENTITY</code>, <code>TIMESTAMPTZ</code>, <code>NUMERIC</code> или копейки в <code>BIGINT</code>).</p>`,
    },
    {
      title: 'Последний заказ каждого пользователя',
      level: 'сложно',
      text: `<p>Напишите запрос, который для каждого пользователя возвращает его <b>последний</b> заказ (id и дату). Решите двумя способами:
        через оконную функцию <code>ROW_NUMBER()</code> и через PostgreSQL-специфичный <code>DISTINCT ON</code>.</p>`,
      solutionCode: String.raw`
-- 1. Оконная функция
WITH ranked AS (
    SELECT o.*, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
    FROM orders o
)
SELECT user_id, id, created_at FROM ranked WHERE rn = 1;

-- 2. DISTINCT ON — берёт первую строку в каждой группе по порядку ORDER BY
SELECT DISTINCT ON (user_id) user_id, id, created_at
FROM orders
ORDER BY user_id, created_at DESC;`,
      solutionLang: 'sql',
    },
    {
      title: 'API заметок на PostgreSQL',
      level: 'сложно',
      text: `<p>Переключите API заметок с SQLite на PostgreSQL: адрес берётся из <code>DATABASE_URL</code>. Теги храните в столбце <code>TEXT[]</code>
        и фильтруйте через <code>= ANY(tags)</code>. Сравните код с версией на SQLite — что пришлось изменить?</p>`,
      hint: `<p>Отличия: плейсхолдеры <code>%s</code> вместо <code>?</code>, <code>RETURNING</code> вместо <code>lastrowid</code>, типы столбцов. Именно поэтому в проектах часто используют ORM — он сглаживает различия.</p>`,
    },
  ],
  quiz: [
    { q: 'Какой тип лучше использовать для даты-времени в PostgreSQL?', options: ['TEXT', 'TIMESTAMP', 'TIMESTAMPTZ', 'INTEGER'], answer: 2, explain: 'TIMESTAMPTZ хранит момент времени в UTC и корректно конвертирует часовые пояса.' },
    { q: 'Что делает <code>RETURNING id</code> в INSERT?', options: ['Откатывает вставку', 'Возвращает значения вставленной строки', 'Проверяет уникальность', 'Создаёт индекс'], answer: 1 },
    { q: 'Какой плейсхолдер параметров используется в psycopg?', options: ['?', '%s', '$var', '{}'], answer: 1 },
    { q: 'Зачем нужен пул соединений?', options: ['Для шифрования', 'Чтобы переиспользовать открытые соединения и не открывать новое на каждый запрос', 'Для резервного копирования', 'Чтобы хранить кэш запросов'], answer: 1 },
  ],
  resources: [
    { title: 'Документация PostgreSQL (на русском, Postgres Pro)', url: 'https://postgrespro.ru/docs/postgresql/' },
    { title: 'Документация psycopg 3', url: 'https://www.psycopg.org/psycopg3/docs/' },
    { title: 'PostgreSQL Exercises', url: 'https://pgexercises.com/' },
  ],
});

registerContent('mysql', {
  intro: `<p><b>MySQL</b> — одна из самых популярных СУБД в мире: на ней работают WordPress, ранние Facebook и YouTube, огромное число веб-проектов.
    Если вы знаете PostgreSQL, освоить MySQL — дело пары дней: SQL тот же, отличаются детали.</p>`,
  theory: [
    {
      title: 'Место MySQL в мире',
      html: `<ul>
          <li>Основа стека <b>LAMP</b> (Linux, Apache, MySQL, PHP) — исторически главный стек веба.</li>
          <li>Принадлежит Oracle; есть бесплатная Community Edition и форк <b>MariaDB</b>.</li>
          <li>Облачные версии: Amazon RDS/Aurora, Google Cloud SQL, PlanetScale.</li>
          <li>Сильные стороны: простота, огромное сообщество, отработанная репликация, высокая скорость простых запросов.</li>
        </ul>`,
    },
    {
      title: 'Движки хранения',
      html: `<p>Особенность MySQL — подключаемые <b>движки хранения</b>. Используйте <b>InnoDB</b> (по умолчанию): транзакции, внешние ключи, блокировки на уровне строк, восстановление после сбоев.
        Старый <b>MyISAM</b> не поддерживает транзакции и внешние ключи — встречается только в legacy-проектах.</p>`,
    },
    {
      title: 'Отличия от PostgreSQL',
      html: `<table>
          <tr><th></th><th>MySQL</th><th>PostgreSQL</th></tr>
          <tr><td>Автоинкремент</td><td><code>AUTO_INCREMENT</code></td><td><code>GENERATED AS IDENTITY</code></td></tr>
          <tr><td>Кавычки для имён</td><td><code>&#96;имя&#96;</code> (обратные)</td><td><code>"имя"</code></td></tr>
          <tr><td>Upsert</td><td><code>ON DUPLICATE KEY UPDATE</code></td><td><code>ON CONFLICT ... DO UPDATE</code></td></tr>
          <tr><td>Возврат вставленного</td><td><code>LAST_INSERT_ID()</code></td><td><code>RETURNING</code></td></tr>
          <tr><td>Логический тип</td><td><code>TINYINT(1)</code> (BOOLEAN — псевдоним)</td><td>Настоящий <code>BOOLEAN</code></td></tr>
          <tr><td>JSON</td><td><code>JSON</code></td><td><code>JSON</code> и <code>JSONB</code></td></tr>
        </table>
        <p class="note">Для полной поддержки Unicode (включая эмодзи) используйте кодировку <code>utf8mb4</code>, а не <code>utf8</code> — в MySQL «utf8» хранит максимум 3 байта на символ.</p>`,
    },
  ],
  examples: [
    {
      title: 'Запуск и таблица в MySQL',
      lang: 'bash',
      code: String.raw`
docker run --name mysql -e MYSQL_ROOT_PASSWORD=secret -e MYSQL_DATABASE=shop -p 3306:3306 -d mysql:8.4
docker exec -it mysql mysql -uroot -psecret shop`,
    },
    {
      title: 'Синтаксис MySQL',
      lang: 'sql',
      code: String.raw`
CREATE TABLE users (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    name       VARCHAR(100) NOT NULL,
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO users (email, name) VALUES ('anna@mail.ru', 'Анна')
ON DUPLICATE KEY UPDATE name = VALUES(name);

SELECT LAST_INSERT_ID();`,
    },
    {
      title: 'Подключение из Python',
      lang: 'python',
      code: String.raw`
# pip install pymysql
import pymysql

conn = pymysql.connect(host="localhost", user="root", password="secret",
                       database="shop", charset="utf8mb4",
                       cursorclass=pymysql.cursors.DictCursor)
with conn:
    with conn.cursor() as cur:
        cur.execute("SELECT id, name FROM users WHERE email = %s", ("anna@mail.ru",))
        print(cur.fetchone())`,
    },
  ],
  tasks: [
    {
      title: 'Перенесите схему',
      level: 'средне',
      text: `<p>Запустите MySQL в Docker и перенесите туда схему магазина из темы «Основы SQL». Выпишите все места, где синтаксис пришлось поменять по сравнению с PostgreSQL.</p>`,
    },
    {
      title: 'Ловушка с кодировкой',
      level: 'легко',
      text: `<p>Создайте таблицу с <code>CHARSET = utf8</code> (utf8mb3) и попробуйте вставить строку <code>'Привет 👋'</code>. Что произошло? Исправьте, пересоздав таблицу с <code>utf8mb4</code>.</p>`,
      solution: `<p>Вставка упадёт с ошибкой <code>Incorrect string value</code> (или эмодзи заменится на <code>?</code> в нестрогом режиме): эмодзи занимает 4 байта, а <code>utf8mb3</code> хранит максимум 3. С <code>utf8mb4</code> всё работает.</p>`,
    },
  ],
  quiz: [
    { q: 'Какой движок хранения MySQL поддерживает транзакции и внешние ключи?', options: ['MyISAM', 'InnoDB', 'MEMORY', 'CSV'], answer: 1 },
    { q: 'Какую кодировку выбрать в MySQL для поддержки эмодзи?', options: ['utf8', 'latin1', 'utf8mb4', 'cp1251'], answer: 2 },
    { q: 'Аналог PostgreSQL <code>ON CONFLICT</code> в MySQL:', options: ['ON DUPLICATE KEY UPDATE', 'REPLACE ALL', 'MERGE INTO', 'UPSERT'], answer: 0 },
  ],
  resources: [
    { title: 'Документация MySQL 8.4', url: 'https://dev.mysql.com/doc/refman/8.4/en/' },
  ],
});

registerContent('mariadb', {
  intro: `<p><b>MariaDB</b> — форк MySQL, созданный в 2009 году его же основателем Михаэлем Видениусом после покупки MySQL компанией Oracle.
    Полностью открытая и в большинстве случаев совместимая с MySQL «из коробки».</p>`,
  theory: [
    {
      title: 'MariaDB vs MySQL',
      html: `<ul>
          <li><b>Совместимость</b>: тот же протокол, клиенты и драйверы (pymysql, mysqlclient работают). Замена MySQL на MariaDB обычно проходит незаметно.</li>
          <li><b>Расхождения растут</b>: с версий MySQL 8 и MariaDB 10.x появились различия в JSON, оптимизаторе, системных таблицах.</li>
          <li><b>Свои фичи</b>: дополнительные движки (Aria, ColumnStore для аналитики), Galera Cluster для синхронной репликации, <code>RETURNING</code> в <code>INSERT/DELETE</code>.</li>
          <li>По умолчанию ставится вместо MySQL во многих дистрибутивах Linux (Debian, Fedora).</li>
        </ul>
        <p class="note">Для нового проекта выбор между MySQL и MariaDB обычно определяется инфраструктурой компании. Если выбора нет — изучайте PostgreSQL.</p>`,
    },
  ],
  examples: [
    {
      title: 'Запуск MariaDB',
      lang: 'bash',
      code: String.raw`
docker run --name maria -e MARIADB_ROOT_PASSWORD=secret -e MARIADB_DATABASE=shop -p 3307:3306 -d mariadb:11
docker exec -it maria mariadb -uroot -psecret shop
# MariaDB [shop]> SELECT VERSION();`,
    },
  ],
  tasks: [
    {
      title: 'Проверка совместимости',
      level: 'легко',
      text: `<p>Запустите MariaDB и выполните в ней SQL-скрипт и Python-код из темы MySQL, поменяв только порт. Всё ли заработало без изменений?
        Попробуйте <code>INSERT ... RETURNING id</code> — работает ли он в MariaDB и в MySQL?</p>`,
      solution: `<p>Скрипт и код работают без изменений. <code>INSERT ... RETURNING</code> поддерживается в MariaDB 10.5+, но не в MySQL — пример того, как форки постепенно расходятся.</p>`,
    },
  ],
  quiz: [
    { q: 'Что такое MariaDB?', options: ['NoSQL-база', 'Форк MySQL, совместимый с ним по протоколу', 'Расширение PostgreSQL', 'Облачный сервис Oracle'], answer: 1 },
  ],
  resources: [
    { title: 'MariaDB: отличия от MySQL', url: 'https://mariadb.com/kb/en/mariadb-vs-mysql-compatibility/' },
  ],
});

registerContent('mssql', {
  intro: `<p><b>Microsoft SQL Server</b> — коммерческая СУБД Microsoft, стандарт в компаниях на стеке .NET и Windows. Встречается в банках,
    ритейле, корпоративных системах. Есть бесплатная редакция Express (до 10 ГБ на базу) и Developer (для разработки).</p>`,
  theory: [
    {
      title: 'Особенности',
      html: `<ul>
          <li>Диалект SQL называется <b>T-SQL</b> (Transact-SQL): переменные, циклы, процедуры прямо в SQL.</li>
          <li>Пагинация: <code>SELECT TOP 10 ...</code> или <code>OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY</code> (вместо <code>LIMIT</code>).</li>
          <li>Автоинкремент — <code>IDENTITY(1,1)</code>, строки Unicode — <code>NVARCHAR</code>, кавычки для имён — <code>[квадратные скобки]</code>.</li>
          <li>Возврат вставленного: <code>OUTPUT INSERTED.id</code>.</li>
          <li>Инструменты: SQL Server Management Studio (SSMS), Azure Data Studio. Облачная версия — Azure SQL Database.</li>
          <li>Работает и на Linux, в том числе в Docker.</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'T-SQL',
      lang: 'sql',
      code: String.raw`
CREATE TABLE users (
    id    INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    name  NVARCHAR(100) NOT NULL
);

INSERT INTO users (email, name)
OUTPUT INSERTED.id
VALUES (N'anna@mail.ru', N'Анна');

SELECT TOP 5 * FROM users ORDER BY id DESC;

SELECT * FROM users ORDER BY id
OFFSET 10 ROWS FETCH NEXT 10 ROWS ONLY;`,
      explain: `<p>Префикс <code>N'...'</code> обозначает Unicode-строку — без него кириллица может испортиться.</p>`,
    },
    {
      title: 'Подключение из Python',
      lang: 'python',
      code: String.raw`
# pip install pyodbc  (+ ODBC Driver 18 for SQL Server)
import pyodbc

conn = pyodbc.connect(
    "DRIVER={ODBC Driver 18 for SQL Server};SERVER=localhost;DATABASE=shop;"
    "UID=sa;PWD=Secret_123;TrustServerCertificate=yes"
)
row = conn.execute("SELECT name FROM users WHERE email = ?", "anna@mail.ru").fetchone()
print(row.name)`,
    },
  ],
  tasks: [
    {
      title: 'Переведите запросы на T-SQL',
      level: 'средне',
      text: `<p>Перепишите на T-SQL три запроса из темы «Основы SQL»: товары по убыванию цены (первые 2), пагинацию пользователей (вторая страница по 2) и создание таблицы <code>orders</code>.
        Проверьте в Docker-образе <code>mcr.microsoft.com/mssql/server:2022-latest</code> или на <a href="https://sqliteonline.com" target="_blank" rel="noopener">sqliteonline.com</a> (там есть MS SQL).</p>`,
    },
  ],
  quiz: [
    { q: 'Как называется диалект SQL в MS SQL Server?', options: ['PL/SQL', 'T-SQL', 'PL/pgSQL', 'MySQLi'], answer: 1 },
    { q: 'Чем в MS SQL заменяют <code>LIMIT 10</code>?', options: ['ROWNUM <= 10', 'TOP 10 или OFFSET ... FETCH', 'FIRST 10', 'LIMIT тоже работает'], answer: 1 },
  ],
  resources: [
    { title: 'Документация SQL Server', url: 'https://learn.microsoft.com/ru-ru/sql/sql-server/' },
  ],
});

registerContent('oracle', {
  intro: `<p><b>Oracle Database</b> — одна из старейших и самых мощных коммерческих СУБД. Используется в крупных банках, телекоме, госсекторе,
    ERP-системах. Лицензии дорогие, поэтому в новых проектах её выбирают редко, но в enterprise-мире она повсюду.</p>`,
  theory: [
    {
      title: 'Особенности',
      html: `<ul>
          <li>Процедурный язык <b>PL/SQL</b>: хранимые процедуры, пакеты, триггеры — в legacy-системах в них живёт значительная часть бизнес-логики.</li>
          <li>Пагинация: <code>FETCH FIRST 10 ROWS ONLY</code> (с 12c) или старый <code>ROWNUM</code>.</li>
          <li>Пустая строка <code>''</code> в Oracle равна <code>NULL</code> — частый источник багов.</li>
          <li>Типы: <code>NUMBER</code>, <code>VARCHAR2</code>, <code>DATE</code> (хранит и время), <code>CLOB</code>.</li>
          <li>Таблица-заглушка <code>DUAL</code>: <code>SELECT SYSDATE FROM dual</code>.</li>
          <li>Бесплатные варианты для изучения: Oracle Database Free и Oracle Live SQL в браузере.</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'Oracle SQL',
      lang: 'sql',
      code: String.raw`
CREATE TABLE users (
    id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR2(255) NOT NULL UNIQUE,
    name  VARCHAR2(100) NOT NULL
);

SELECT * FROM users ORDER BY id FETCH FIRST 10 ROWS ONLY;
SELECT SYSDATE FROM dual;`,
    },
    {
      title: 'Подключение из Python',
      lang: 'python',
      code: String.raw`
# pip install oracledb
import oracledb

with oracledb.connect(user="app", password="secret", dsn="localhost/FREEPDB1") as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT name FROM users WHERE email = :email", email="anna@mail.ru")
        print(cur.fetchone())`,
      explain: `<p>В Oracle плейсхолдеры именованные: <code>:email</code>.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Знакомство через Live SQL',
      level: 'легко',
      text: `<p>Зайдите на <a href="https://livesql.oracle.com" target="_blank" rel="noopener">Oracle Live SQL</a>, создайте таблицу <code>users</code> и проверьте:
        что вернёт <code>SELECT COUNT(*) FROM users WHERE name = ''</code> после вставки строки с пустым именем? (Подсказка: вставка с <code>NOT NULL</code> не пройдёт — почему?)</p>`,
      solution: `<p>В Oracle <code>''</code> — это <code>NULL</code>, поэтому вставка пустой строки в <code>NOT NULL</code>-столбец падает с ошибкой ORA-01400, а условие <code>name = ''</code> никогда не истинно.</p>`,
    },
  ],
  quiz: [
    { q: 'Как называется процедурный язык Oracle?', options: ['T-SQL', 'PL/SQL', 'PL/pgSQL', 'OQL'], answer: 1 },
    { q: 'Чему равна пустая строка в Oracle?', options: ['Пробелу', 'NULL', 'Нулю', 'Ошибке'], answer: 1 },
  ],
  resources: [
    { title: 'Oracle Live SQL', url: 'https://livesql.oracle.com/' },
  ],
});
