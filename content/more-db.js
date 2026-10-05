// Раздел 6. Подробнее о базах данных

registerContent('orms', {
  intro: `<p><b>ORM</b> (Object-Relational Mapping) позволяет работать с таблицами как с классами Python: строка — объект, столбец — атрибут.
    Вместо ручного SQL вы пишете <code>session.get(User, 1)</code>. В Python главные ORM — <b>SQLAlchemy</b> (с FastAPI и не только) и <b>Django ORM</b>.</p>`,
  theory: [
    {
      title: 'Зачем нужен ORM',
      html: `<ul>
          <li><b>Меньше шаблонного кода</b>: не нужно вручную превращать строки в объекты и обратно.</li>
          <li><b>Безопасность</b>: параметры всегда передаются корректно — SQL-инъекции исключены (если не собирать SQL строками).</li>
          <li><b>Переносимость</b>: один код для SQLite в тестах и PostgreSQL в продакшене.</li>
          <li><b>Связи</b>: <code>user.orders</code> вместо JOIN вручную.</li>
          <li><b>Миграции</b>: схема описана в коде, изменения генерируются автоматически.</li>
        </ul>
        <p class="note">Минусы: ORM скрывает реальные запросы — легко написать медленный код (см. тему «Проблема N+1»). Хороший бэкендер знает SQL и всегда может посмотреть, что генерирует ORM.</p>`,
    },
    {
      title: 'SQLAlchemy 2.0: модели',
      html: `<p>Модели наследуются от базового класса <code>DeclarativeBase</code>. Столбцы описываются аннотациями <code>Mapped[тип]</code> и <code>mapped_column(...)</code>,
        связи — через <code>relationship()</code>. <code>Mapped[str | None]</code> означает столбец, допускающий NULL.</p>`,
    },
    {
      title: 'Engine и Session',
      html: `<ul>
          <li><b>Engine</b> — точка подключения к БД и пул соединений: <code>create_engine("postgresql+psycopg://...")</code>. Один на приложение.</li>
          <li><b>Session</b> — «единица работы»: отслеживает загруженные и изменённые объекты и при <code>commit()</code> отправляет всё в БД одной транзакцией. Обычно одна сессия на HTTP-запрос.</li>
          <li>Запросы строятся через <code>select(User).where(User.email == x)</code> и выполняются <code>session.scalars(...)</code>.</li>
        </ul>`,
    },
    {
      title: 'Паттерны ORM',
      html: `<p><b>Active Record</b> (Django ORM, Rails): объект сам умеет себя сохранять — <code>user.save()</code>.
        <b>Data Mapper / Unit of Work</b> (SQLAlchemy): объекты — простые классы, а сохранением управляет сессия — <code>session.add(user); session.commit()</code>.</p>
        <p>Для сложной аналитики не стесняйтесь писать чистый SQL: <code>session.execute(text("SELECT ..."), {"x": 1})</code>.</p>`,
    },
  ],
  examples: [
    {
      title: 'Модели и связи',
      lang: 'python',
      code: String.raw`
# pip install sqlalchemy
from datetime import datetime
from sqlalchemy import ForeignKey, String, create_engine, func, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    name: Mapped[str]
    city: Mapped[str | None]
    orders: Mapped[list["Order"]] = relationship(back_populates="user")

class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    total: Mapped[int]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    user: Mapped[User] = relationship(back_populates="orders")

engine = create_engine("sqlite:///orm.db", echo=True)   # echo=True печатает SQL
Base.metadata.create_all(engine)`,
      explain: `<p><code>echo=True</code> — лучший способ учиться: вы видите каждый SQL-запрос, который генерирует ORM.</p>`,
    },
    {
      title: 'CRUD через сессию',
      lang: 'python',
      code: String.raw`
with Session(engine) as session:
    anna = User(email="anna@mail.ru", name="Анна", city="Москва")
    anna.orders.append(Order(total=150000))
    anna.orders.append(Order(total=30000))
    session.add(anna)
    session.commit()                     # INSERT в users и orders

    # Чтение
    user = session.scalars(select(User).where(User.email == "anna@mail.ru")).one()
    print(user.name, [o.total for o in user.orders])

    # Обновление — просто меняем атрибут
    user.city = "Казань"
    session.commit()                     # UPDATE users SET city=...

    # Агрегация
    stmt = select(User.name, func.sum(Order.total)).join(User.orders).group_by(User.id)
    for name, total in session.execute(stmt):
        print(name, total)

    # Удаление
    session.delete(user.orders[0])
    session.commit()`,
    },
  ],
  tasks: [
    {
      title: 'Модели блога',
      level: 'средне',
      text: `<p>Опишите на SQLAlchemy модели блога из темы «Основы SQL»: <code>User</code>, <code>Post</code>, <code>Comment</code>, <code>Tag</code> (многие-ко-многим с постами).
        Создайте таблицы, наполните данными и выведите посты с тегом <code>python</code> вместе с именем автора. Посмотрите на SQL в логе <code>echo=True</code>.</p>`,
      hint: `<p>Для многие-ко-многим создайте <code>Table("post_tags", Base.metadata, Column("post_id", ForeignKey("posts.id"), primary_key=True), ...)</code>
        и укажите <code>relationship(secondary=post_tags)</code>.</p>`,
    },
    {
      title: 'API заметок на SQLAlchemy',
      level: 'сложно',
      text: `<p>Перепишите API заметок на SQLAlchemy. Сессию выдавайте через зависимость FastAPI (<code>Depends(get_session)</code>), адрес БД — из <code>DATABASE_URL</code>.
        Убедитесь, что приложение работает и с SQLite, и с PostgreSQL без изменения кода.</p>`,
      solutionCode: String.raw`
import os
from collections.abc import Iterator
from fastapi import Depends, FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

engine = create_engine(os.environ.get("DATABASE_URL", "sqlite:///notes.db"))

def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session

app = FastAPI()

@app.get("/notes/{note_id}")
def get_note(note_id: int, session: Session = Depends(get_session)):
    note = session.get(Note, note_id)   # Note — ваша модель
    ...`,
    },
  ],
  quiz: [
    { q: 'Что такое Session в SQLAlchemy?', options: ['Подключение пользователя к сайту', 'Единица работы: отслеживает объекты и сохраняет их в транзакции', 'Кэш запросов', 'Таблица сессий'], answer: 1 },
    { q: 'Как увидеть SQL, который генерирует SQLAlchemy?', options: ['Никак', 'create_engine(..., echo=True)', 'print(session)', 'Включить DEBUG в Python'], answer: 1 },
    { q: 'Какой паттерн использует Django ORM (<code>user.save()</code>)?', options: ['Data Mapper', 'Active Record', 'Repository', 'CQRS'], answer: 1 },
  ],
  resources: [
    { title: 'SQLAlchemy 2.0: Unified Tutorial', url: 'https://docs.sqlalchemy.org/en/20/tutorial/' },
    { title: 'FastAPI: SQL базы данных', url: 'https://fastapi.tiangolo.com/ru/tutorial/sql-databases/' },
  ],
});

registerContent('acid', {
  intro: `<p><b>ACID</b> — четыре свойства, которые гарантирует транзакционная база данных. Благодаря им деньги не исчезают при переводе,
    а сбой электричества не оставляет данные «наполовину записанными». Это главное, за что любят реляционные СУБД.</p>`,
  theory: [
    {
      title: 'A — Atomicity (атомарность)',
      html: `<p>Транзакция выполняется <b>целиком или никак</b>. Перевод денег — это два UPDATE: списать с одного счёта, зачислить на другой.
        Если после первого сервер упал — БД откатит списание. Состояния «деньги списаны, но не зачислены» не бывает.</p>`,
    },
    {
      title: 'C — Consistency (согласованность)',
      html: `<p>Транзакция переводит БД из одного корректного состояния в другое: соблюдаются все ограничения —
        <code>NOT NULL</code>, <code>UNIQUE</code>, внешние ключи, <code>CHECK (balance &gt;= 0)</code>. Если транзакция нарушает правило, она отклоняется целиком.</p>`,
    },
    {
      title: 'I — Isolation (изолированность)',
      html: `<p>Параллельные транзакции не мешают друг другу: каждая видит данные так, как будто работает одна. На практике полная изоляция дорога,
        поэтому СУБД предлагают <b>уровни изоляции</b> — компромисс между корректностью и скоростью (подробно — в теме «Транзакции»).</p>`,
    },
    {
      title: 'D — Durability (долговечность)',
      html: `<p>После <code>COMMIT</code> данные сохранены навсегда, даже если через секунду пропадёт питание. Достигается через <b>журнал предзаписи</b> (WAL):
        изменения сначала записываются в журнал на диск, и при перезапуске БД восстанавливается по нему.</p>
        <p class="note">Многие NoSQL-базы жертвуют частью ACID ради масштабирования и скорости (модель <b>BASE</b>: Basically Available, Soft state, Eventual consistency). Об этом — в разделах про NoSQL и CAP-теорему.</p>`,
    },
  ],
  examples: [
    {
      title: 'Атомарность и согласованность на практике',
      lang: 'python',
      code: String.raw`
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT, balance INTEGER CHECK (balance >= 0))")
conn.executemany("INSERT INTO accounts VALUES (?, ?, ?)", [(1, "Анна", 1000), (2, "Борис", 500)])
conn.commit()

def transfer(src: int, dst: int, amount: int) -> None:
    with conn:   # одна транзакция: всё или ничего
        conn.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amount, dst))
        conn.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amount, src))

transfer(1, 2, 300)
try:
    transfer(1, 2, 5000)   # нарушит CHECK (balance >= 0)
except sqlite3.IntegrityError as e:
    print("Отклонено:", e)

print(conn.execute("SELECT owner, balance FROM accounts").fetchall())
# [('Анна', 700), ('Борис', 800)] — Борису НЕ зачислились 5000, хотя этот UPDATE шёл первым`,
    },
  ],
  tasks: [
    {
      title: 'Сломайте без транзакции',
      level: 'средне',
      text: `<p>Перепишите <code>transfer</code> так, чтобы каждый UPDATE коммитился отдельно (<code>conn.commit()</code> после каждого). Повторите неудачный перевод.
        Каким стал суммарный баланс системы? Объясните, какое свойство ACID нарушено и почему.</p>`,
      solution: `<p>Первый UPDATE (зачисление Борису 5000) успеет закоммититься, второй упадёт на CHECK. В системе «из воздуха» появятся 5000 —
        нарушена <b>атомарность</b>: операция выполнилась частично. Решение — оба UPDATE в одной транзакции.</p>`,
    },
    {
      title: 'ACID в жизни',
      level: 'легко',
      text: `<p>Для каждого сценария назовите свойство ACID, которое его обеспечивает:
        (1) после подтверждения оплаты сервер перезагрузился, но заказ остался оплаченным;
        (2) нельзя создать заказ для несуществующего пользователя;
        (3) два покупателя одновременно берут последний товар, и продаётся только один;
        (4) при ошибке на середине оформления заказа не остаётся «осиротевших» позиций.</p>`,
      solution: `<p>(1) Durability, (2) Consistency (внешний ключ), (3) Isolation, (4) Atomicity.</p>`,
    },
  ],
  quiz: [
    { q: 'Какое свойство гарантирует «всё или ничего»?', options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], answer: 0 },
    { q: 'За счёт чего обеспечивается Durability?', options: ['Индексов', 'Журнала предзаписи (WAL) на диске', 'Кэша в памяти', 'Репликации'], answer: 1 },
    { q: 'Что обеспечивает изолированность?', options: ['Защиту от SQL-инъекций', 'Независимость параллельных транзакций друг от друга', 'Шифрование данных', 'Резервные копии'], answer: 1 },
  ],
  resources: [
    { title: 'Википедия: ACID', url: 'https://ru.wikipedia.org/wiki/ACID' },
  ],
});

registerContent('transactions', {
  intro: `<p><b>Транзакция</b> — группа операций, которая выполняется как одно целое. В бэкенде транзакции нужны везде, где одно действие пользователя
    меняет несколько строк: оформление заказа, перевод денег, регистрация с созданием профиля.</p>`,
  theory: [
    {
      title: 'BEGIN, COMMIT, ROLLBACK',
      html: `<ul>
          <li><code>BEGIN</code> — начать транзакцию;</li>
          <li><code>COMMIT</code> — зафиксировать все изменения;</li>
          <li><code>ROLLBACK</code> — отменить всё с момента <code>BEGIN</code>;</li>
          <li><code>SAVEPOINT name</code> / <code>ROLLBACK TO name</code> — частичный откат внутри транзакции.</li>
        </ul>
        <p>Без явного <code>BEGIN</code> многие СУБД работают в режиме <b>autocommit</b>: каждый запрос — отдельная транзакция.
        Драйверы Python (sqlite3, psycopg) и SQLAlchemy, наоборот, открывают транзакцию автоматически и ждут <code>commit()</code>.</p>`,
    },
    {
      title: 'Аномалии параллельного доступа',
      html: `<table>
          <tr><th>Аномалия</th><th>Что происходит</th></tr>
          <tr><td><b>Dirty read</b></td><td>Читаем незакоммиченные данные чужой транзакции, которая потом откатится</td></tr>
          <tr><td><b>Non-repeatable read</b></td><td>Дважды читаем строку в одной транзакции — получаем разные значения</td></tr>
          <tr><td><b>Phantom read</b></td><td>Повторный запрос с тем же условием возвращает новые строки</td></tr>
          <tr><td><b>Lost update</b></td><td>Две транзакции читают значение, обе меняют, вторая затирает изменения первой</td></tr>
        </table>`,
    },
    {
      title: 'Уровни изоляции',
      html: `<table>
          <tr><th>Уровень</th><th>Защищает от</th><th>По умолчанию в</th></tr>
          <tr><td>Read Uncommitted</td><td>почти ни от чего</td><td>—</td></tr>
          <tr><td>Read Committed</td><td>dirty read</td><td>PostgreSQL, Oracle, MS SQL</td></tr>
          <tr><td>Repeatable Read</td><td>+ non-repeatable read (в PG и phantom)</td><td>MySQL InnoDB</td></tr>
          <tr><td>Serializable</td><td>всех аномалий — как будто транзакции шли по очереди</td><td>SQLite (фактически)</td></tr>
        </table>
        <p>Чем выше уровень, тем больше блокировок или откатов из-за конфликтов (их приходится повторять).</p>`,
    },
    {
      title: 'Как избежать lost update',
      html: `<ul>
          <li><b>Атомарный UPDATE</b>: <code>UPDATE products SET stock = stock - 1 WHERE id = 7 AND stock &gt; 0</code> — проверка и изменение в одном запросе. Самый простой и частый способ.</li>
          <li><b>Пессимистичная блокировка</b>: <code>SELECT ... FOR UPDATE</code> блокирует строку до конца транзакции; другие ждут.</li>
          <li><b>Оптимистичная блокировка</b>: в строке есть столбец <code>version</code>; <code>UPDATE ... SET version = version + 1 WHERE id = 7 AND version = 3</code>. Если обновилось 0 строк — кто-то успел раньше, повторяем.</li>
        </ul>
        <p class="note">Держите транзакции короткими: не делайте внутри них HTTP-запросы к внешним сервисам и не ждите действий пользователя — блокировки будут тормозить всех.</p>`,
    },
  ],
  examples: [
    {
      title: 'Транзакция в SQL',
      lang: 'sql',
      code: String.raw`
BEGIN;
INSERT INTO orders (user_id, status) VALUES (1, 'new');
UPDATE products SET stock = stock - 1 WHERE id = 7 AND stock > 0;
-- если товара не хватило (0 обновлённых строк), приложение делает:
-- ROLLBACK;
COMMIT;`,
    },
    {
      title: 'Lost update и его исправление',
      lang: 'python',
      code: String.raw`
# ПЛОХО: чтение и запись разделены — два параллельных запроса продадут один товар дважды
def buy_bad(conn, product_id: int) -> bool:
    stock = conn.execute("SELECT stock FROM products WHERE id = ?", (product_id,)).fetchone()[0]
    if stock <= 0:
        return False
    # ... здесь параллельный запрос успевает прочитать тот же stock ...
    conn.execute("UPDATE products SET stock = ? WHERE id = ?", (stock - 1, product_id))
    conn.commit()
    return True

# ХОРОШО: проверка и изменение атомарно в одном запросе
def buy(conn, product_id: int) -> bool:
    with conn:
        cur = conn.execute(
            "UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0",
            (product_id,),
        )
    return cur.rowcount == 1`,
    },
    {
      title: 'SQLAlchemy: блокировка строки',
      lang: 'python',
      code: String.raw`
from sqlalchemy import select

with Session(engine) as session, session.begin():   # begin() — commit/rollback автоматически
    account = session.scalars(
        select(Account).where(Account.id == 1).with_for_update()   # SELECT ... FOR UPDATE
    ).one()
    account.balance -= 100`,
    },
  ],
  tasks: [
    {
      title: 'Оформление заказа',
      level: 'средне',
      text: `<p>Напишите функцию <code>place_order(conn, user_id, items: dict[product_id, qty])</code>, которая в одной транзакции: создаёт заказ, добавляет позиции,
        уменьшает остатки. Если хоть одного товара не хватает — вся операция откатывается и бросается <code>OutOfStock(product_id)</code>.</p>`,
      solutionCode: String.raw`
class OutOfStock(Exception):
    pass

def place_order(conn, user_id: int, items: dict[int, int]) -> int:
    with conn:   # исключение внутри → ROLLBACK
        order_id = conn.execute("INSERT INTO orders (user_id) VALUES (?)", (user_id,)).lastrowid
        for product_id, qty in items.items():
            cur = conn.execute(
                "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
                (qty, product_id, qty),
            )
            if cur.rowcount == 0:
                raise OutOfStock(product_id)
            conn.execute(
                "INSERT INTO order_items (order_id, product_id, qty) VALUES (?, ?, ?)",
                (order_id, product_id, qty),
            )
    return order_id`,
    },
    {
      title: 'Воспроизведите гонку',
      level: 'сложно',
      text: `<p>Запустите PostgreSQL, создайте товар со <code>stock = 1</code>. Откройте два окна <code>psql</code> и вручную воспроизведите lost update: в обоих сделайте <code>BEGIN</code>,
        <code>SELECT stock</code>, затем <code>UPDATE ... SET stock = 0</code> и <code>COMMIT</code>. Затем повторите с <code>SELECT ... FOR UPDATE</code> — что изменилось во втором окне?</p>`,
      solution: `<p>Без блокировки обе транзакции «продадут» товар. С <code>FOR UPDATE</code> второе окно зависнет на SELECT до коммита первого, затем увидит <code>stock = 0</code> и сможет корректно отказать.</p>`,
    },
  ],
  quiz: [
    { q: 'Какой уровень изоляции по умолчанию в PostgreSQL?', options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'], answer: 1 },
    { q: 'Что делает <code>SELECT ... FOR UPDATE</code>?', options: ['Обновляет строки', 'Блокирует выбранные строки до конца транзакции', 'Создаёт индекс', 'Выбирает только изменённые строки'], answer: 1 },
    { q: 'Почему плохо делать HTTP-запрос к внешнему API внутри транзакции?', options: ['Это запрещено SQL', 'Транзакция долго держит блокировки, пока ждёт ответа', 'HTTP не работает внутри БД', 'Данные потеряются'], answer: 1 },
    { q: 'Как проще всего атомарно уменьшить остаток товара?', options: ['SELECT, затем UPDATE в Python', 'UPDATE ... SET stock = stock - 1 WHERE id = ? AND stock > 0', 'DELETE и INSERT', 'Через кэш'], answer: 1 },
  ],
  resources: [
    { title: 'PostgreSQL: изоляция транзакций', url: 'https://postgrespro.ru/docs/postgresql/current/transaction-iso' },
    { title: 'SQLAlchemy: транзакции и сессии', url: 'https://docs.sqlalchemy.org/en/20/orm/session_transaction.html' },
  ],
});

registerContent('n1-problem', {
  intro: `<p><b>Проблема N+1</b> — самая частая причина медленных бэкендов на ORM. Один запрос загружает список из N объектов, а затем для каждого
    выполняется ещё по запросу за связанными данными. Итого N+1 запрос вместо одного-двух. На 10 записях незаметно, на 1000 — страница грузится секунды.</p>`,
  theory: [
    {
      title: 'Откуда она берётся',
      html: `<p>Связи ORM по умолчанию загружаются <b>лениво</b> (lazy loading): <code>post.author</code> делает запрос к БД в момент первого обращения.
        Код выглядит безобидно:</p>
        <p><code>for post in posts: print(post.author.name)</code></p>
        <p>но для 100 постов выполнит 1 запрос за постами + 100 запросов за авторами. Каждый запрос — это сетевой круг до БД (обычно 0,5–2 мс), плюс накладные расходы ORM.</p>`,
    },
    {
      title: 'Как обнаружить',
      html: `<ul>
          <li>Включите логирование SQL (<code>echo=True</code>) и посмотрите на число одинаковых запросов, отличающихся только id.</li>
          <li>Django Debug Toolbar, <code>nplusone</code>, APM-системы (Sentry, New Relic) подсвечивают N+1 автоматически.</li>
          <li>В тестах можно проверять число запросов к БД.</li>
        </ul>`,
    },
    {
      title: 'Как исправить: жадная загрузка',
      html: `<ul>
          <li><b>JOIN</b> (<code>joinedload</code> в SQLAlchemy, <code>select_related</code> в Django) — подтянуть связанный объект тем же запросом. Подходит для связи «многие-к-одному» (пост → автор).</li>
          <li><b>Второй запрос с IN</b> (<code>selectinload</code>, <code>prefetch_related</code>) — <code>SELECT * FROM comments WHERE post_id IN (1, 2, ..., 100)</code>. Подходит для «один-ко-многим» (пост → комментарии): JOIN размножил бы строки постов.</li>
          <li>Итого 1–2 запроса вместо N+1 независимо от N.</li>
        </ul>
        <p class="note">Та же проблема возникает без ORM — в любом цикле, который ходит в БД или во внешний API. Правило: <b>никаких запросов внутри цикла</b>, собирайте id и загружайте пачкой.</p>`,
    },
  ],
  examples: [
    {
      title: 'N+1 и исправление в SQLAlchemy',
      lang: 'python',
      code: String.raw`
from sqlalchemy import select
from sqlalchemy.orm import joinedload, selectinload

# ПЛОХО: 1 + N запросов
posts = session.scalars(select(Post).limit(100)).all()
for post in posts:
    print(post.title, post.author.name)        # SELECT ... FROM users WHERE id = ? — 100 раз

# ХОРОШО: один запрос с JOIN
posts = session.scalars(select(Post).options(joinedload(Post.author)).limit(100)).all()

# ХОРОШО: для коллекций — 2 запроса (посты + все комментарии через IN)
posts = session.scalars(select(Post).options(selectinload(Post.comments)).limit(100)).all()
for post in posts:
    print(post.title, len(post.comments))     # без новых запросов`,
    },
    {
      title: 'N+1 без ORM и пакетная загрузка',
      lang: 'python',
      code: String.raw`
# ПЛОХО
orders = conn.execute("SELECT id, user_id FROM orders").fetchall()
for o in orders:
    user = conn.execute("SELECT name FROM users WHERE id = ?", (o["user_id"],)).fetchone()

# ХОРОШО: собрать id и загрузить одним запросом
user_ids = {o["user_id"] for o in orders}
placeholders = ",".join("?" * len(user_ids))
rows = conn.execute(f"SELECT id, name FROM users WHERE id IN ({placeholders})", tuple(user_ids))
users = {r["id"]: r["name"] for r in rows}
for o in orders:
    print(o["id"], users[o["user_id"]])`,
      explain: `<p>f-строка здесь безопасна: в SQL подставляются только знаки <code>?</code>, а сами значения передаются параметрами.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Посчитайте запросы',
      level: 'средне',
      text: `<p>В моделях блога (тема ORM) создайте 50 постов с авторами и по 3 комментария. Выведите список «заголовок — автор — число комментариев» наивно
        и посчитайте запросы в логе. Затем исправьте через <code>joinedload</code> и <code>selectinload</code>. Сколько запросов стало?</p>`,
      hint: `<p>Счётчик запросов: <code>from sqlalchemy import event</code> и <code>@event.listens_for(engine, "before_cursor_execute")</code> с увеличением глобальной переменной.</p>`,
      solution: `<p>Наивно: 1 + 50 (авторы; меньше, если авторы повторяются — сессия кэширует уже загруженные объекты) + 50 (комментарии) ≈ 101 запрос. После исправления — 2 запроса.</p>`,
    },
  ],
  quiz: [
    { q: 'Сколько запросов выполнит наивный цикл по 200 заказам с обращением к <code>order.user</code>?', options: ['1', '2', '201', '400'], answer: 2 },
    { q: 'Какой способ лучше для загрузки коллекции (пост → комментарии)?', options: ['joinedload', 'selectinload (второй запрос с IN)', 'Ленивая загрузка', 'Запрос в цикле'], answer: 1, explain: 'JOIN для коллекций размножает строки родителя; запрос с IN эффективнее.' },
    { q: 'Как называется загрузка связей при первом обращении к атрибуту?', options: ['Eager', 'Lazy', 'Batch', 'Prefetch'], answer: 1 },
  ],
  resources: [
    { title: 'SQLAlchemy: техники загрузки связей', url: 'https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html' },
  ],
});

registerContent('normalization', {
  intro: `<p><b>Нормализация</b> — способ спроектировать таблицы так, чтобы каждый факт хранился <b>ровно в одном месте</b>.
    Тогда данные не противоречат сами себе: адрес клиента не может быть одним в заказе №1 и другим в заказе №2.</p>`,
  theory: [
    {
      title: 'Аномалии денормализованных данных',
      html: `<p>Представьте одну таблицу <code>orders(id, customer_name, customer_email, product_title, product_price)</code>:</p>
        <ul>
          <li><b>Аномалия обновления</b>: клиент сменил email — нужно обновить все его заказы; пропустили один — данные противоречивы.</li>
          <li><b>Аномалия вставки</b>: нельзя добавить товар, пока его никто не купил.</li>
          <li><b>Аномалия удаления</b>: удалили единственный заказ — потеряли информацию о клиенте.</li>
        </ul>`,
    },
    {
      title: 'Нормальные формы',
      html: `<ul>
          <li><b>1НФ</b>: каждая ячейка атомарна (одно значение), нет повторяющихся групп. Плохо: столбец <code>phones = "111, 222"</code> или <code>phone1, phone2, phone3</code>. Хорошо: отдельная таблица телефонов.</li>
          <li><b>2НФ</b>: 1НФ + каждый неключевой столбец зависит от <b>всего</b> составного ключа. В <code>order_items(order_id, product_id, qty, product_title)</code> название зависит только от <code>product_id</code> → вынести в <code>products</code>.</li>
          <li><b>3НФ</b>: 2НФ + неключевые столбцы не зависят друг от друга. В <code>users(id, city_id, city_name)</code> название зависит от <code>city_id</code>, а не от пользователя → вынести в <code>cities</code>.</li>
        </ul>
        <p>Упрощённое правило 3НФ: «каждый столбец описывает ключ, весь ключ и ничего, кроме ключа». На практике достаточно 3НФ (иногда BCNF).</p>`,
    },
    {
      title: 'Когда денормализовать',
      html: `<p>Нормализация уменьшает дублирование, но добавляет JOIN-ы. Иногда сознательно дублируют данные ради скорости чтения:</p>
        <ul>
          <li>счётчик <code>posts.comments_count</code> вместо <code>COUNT(*)</code> на каждый показ;</li>
          <li>аналитические хранилища и отчёты;</li>
          <li><b>исторические данные</b>: цена в <code>order_items.price</code> — это цена <i>на момент покупки</i>. Это не дублирование, а другой факт: цена товара потом изменится, а заказ — нет.</li>
        </ul>
        <p class="note">Сначала нормализуйте, денормализуйте только при измеренной проблеме и с понятным механизмом синхронизации.</p>`,
    },
  ],
  examples: [
    {
      title: 'Было → стало',
      lang: 'sql',
      code: String.raw`
-- Было: всё в одной таблице, данные клиентов и товаров дублируются
CREATE TABLE orders_flat (
    order_id       INTEGER,
    customer_name  TEXT,
    customer_email TEXT,
    customer_city  TEXT,
    product_title  TEXT,
    product_price  INTEGER,
    qty            INTEGER
);

-- Стало (3НФ)
CREATE TABLE cities    (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE,
                        city_id INTEGER REFERENCES cities(id));
CREATE TABLE products  (id INTEGER PRIMARY KEY, title TEXT, price INTEGER);
CREATE TABLE orders    (id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id),
                        created_at TEXT);
CREATE TABLE order_items (
    order_id   INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    qty        INTEGER NOT NULL,
    price      INTEGER NOT NULL,   -- цена на момент покупки: осознанная «историческая» копия
    PRIMARY KEY (order_id, product_id)
);`,
    },
  ],
  tasks: [
    {
      title: 'Нормализуйте таблицу',
      level: 'средне',
      text: `<p>Дана таблица курсов: <code>enrollments(student_name, student_email, course_title, teacher_name, teacher_email, grade, student_phones)</code>,
        где <code>student_phones</code> — строка с номерами через запятую. Приведите к 3НФ: напишите <code>CREATE TABLE</code> и укажите, какое нарушение какой формы устраняет каждое изменение.</p>`,
      solution: `<p><code>students(id, name, email)</code>, <code>student_phones(student_id, phone)</code> — устраняет нарушение 1НФ (неатомарные телефоны);
        <code>teachers(id, name, email)</code>, <code>courses(id, title, teacher_id)</code> — данные преподавателя зависят от курса, а не от записи (3НФ);
        <code>enrollments(student_id, course_id, grade)</code> с ключом <code>(student_id, course_id)</code> — оценка зависит от всего ключа (2НФ).</p>`,
    },
    {
      title: 'Найдите проблему',
      level: 'легко',
      text: `<p>В таблице <code>products(id, title, category_name, category_description, price)</code> найдите нарушение нормальной формы и опишите аномалию, к которой оно приведёт.</p>`,
      solution: `<p><code>category_description</code> зависит от <code>category_name</code>, а не от товара — нарушение 3НФ. Аномалия обновления: изменив описание категории, придётся обновлять все её товары; аномалия удаления: удалив последний товар, потеряем описание категории.</p>`,
    },
  ],
  quiz: [
    { q: 'Какое нарушение — столбец <code>tags = "python,sql,web"</code>?', options: ['1НФ', '2НФ', '3НФ', 'Нарушения нет'], answer: 0 },
    { q: 'Почему цену в <code>order_items</code> хранят отдельно от <code>products.price</code>?', options: ['Это ошибка проектирования', 'Это цена на момент покупки — отдельный исторический факт', 'Для ускорения JOIN', 'Так требует 3НФ'], answer: 1 },
    { q: 'Главная цель нормализации:', options: ['Ускорить все запросы', 'Каждый факт хранится в одном месте, без противоречий', 'Уменьшить число таблиц', 'Отказаться от JOIN'], answer: 1 },
  ],
  resources: [
    { title: 'Нормальные формы простыми словами (Хабр)', url: 'https://habr.com/ru/articles/254773/' },
  ],
});

registerContent('database-indexes', {
  intro: `<p><b>Индекс</b> — дополнительная структура данных, которая позволяет найти строки без просмотра всей таблицы. Как алфавитный указатель в книге.
    Правильный индекс ускоряет запрос в тысячи раз; лишние индексы замедляют запись и занимают место.</p>`,
  theory: [
    {
      title: 'Как работает индекс',
      html: `<p>Без индекса запрос <code>WHERE email = 'x'</code> читает все строки (<b>Seq Scan</b>, полный перебор) — O(n). На миллионе строк это сотни миллисекунд.</p>
        <p>Стандартный индекс — <b>B-tree</b> (сбалансированное дерево): значения отсортированы, поиск идёт как в бинарном поиске — O(log n). Для миллиона строк это ~20 шагов.
        B-tree ускоряет: <code>=</code>, <code>&lt;</code>, <code>&gt;</code>, <code>BETWEEN</code>, <code>ORDER BY</code>, <code>LIKE 'abc%'</code> (но не <code>LIKE '%abc'</code>).</p>
        <p>Первичный ключ и <code>UNIQUE</code> индексируются автоматически. <b>Внешние ключи — не всегда</b> (в PostgreSQL — нет): индексируйте их сами, по ним постоянно делают JOIN.</p>`,
    },
    {
      title: 'Составные индексы',
      html: `<p>Индекс по нескольким столбцам <code>(user_id, created_at)</code> отсортирован сначала по первому, затем по второму — как телефонная книга по фамилии, затем по имени.</p>
        <ul>
          <li>Помогает запросам по <code>user_id</code> и по <code>user_id + created_at</code>;</li>
          <li><b>не помогает</b> запросу только по <code>created_at</code> — правило «левого префикса»;</li>
          <li>Порядок: сначала столбцы с проверкой на равенство, потом — с диапазоном или сортировкой.</li>
        </ul>
        <p><b>Покрывающий индекс</b> содержит все нужные запросу столбцы — тогда БД вообще не читает таблицу (Index Only Scan).</p>`,
    },
    {
      title: 'Цена индексов и когда они не помогают',
      html: `<ul>
          <li>Каждый INSERT/UPDATE/DELETE обновляет <b>все</b> индексы таблицы — запись медленнее.</li>
          <li>Индексы занимают диск и память.</li>
          <li>Индекс бесполезен при низкой <b>селективности</b>: <code>WHERE is_active = true</code>, если активны 95% строк, — проще прочитать всё.</li>
          <li>Функция над столбцом ломает индекс: <code>WHERE lower(email) = ...</code> не использует индекс по <code>email</code> — нужен индекс по выражению <code>(lower(email))</code>.</li>
        </ul>
        <p>Другие типы (PostgreSQL): <b>Hash</b> (только =), <b>GIN</b> (JSONB, массивы, полнотекстовый поиск), <b>GiST</b> (геоданные), <b>BRIN</b> (огромные таблицы, упорядоченные по времени), <b>частичные</b> индексы (<code>WHERE deleted_at IS NULL</code>).</p>`,
    },
  ],
  examples: [
    {
      title: 'Измеряем эффект индекса',
      lang: 'python',
      code: String.raw`
import sqlite3
import time

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT, city TEXT)")
conn.executemany("INSERT INTO users (email, city) VALUES (?, ?)",
                 ((f"user{i}@mail.ru", f"city{i % 100}") for i in range(1_000_000)))

def measure(sql: str, params=()) -> None:
    plan = conn.execute("EXPLAIN QUERY PLAN " + sql, params).fetchall()
    start = time.perf_counter()
    conn.execute(sql, params).fetchall()
    print(f"{(time.perf_counter() - start) * 1000:7.2f} мс | {plan[0][-1]}")

q = "SELECT * FROM users WHERE email = ?"
measure(q, ("user777777@mail.ru",))   # SCAN users — полный перебор
conn.execute("CREATE INDEX idx_users_email ON users(email)")
measure(q, ("user777777@mail.ru",))   # SEARCH users USING INDEX idx_users_email`,
      explain: `<p>Типичный результат: ~50 мс без индекса и ~0,05 мс с индексом — в тысячу раз быстрее.</p>`,
    },
    {
      title: 'Индексы в PostgreSQL',
      lang: 'sql',
      code: String.raw`
-- Внешний ключ: индексируем вручную
CREATE INDEX idx_orders_user_id ON orders (user_id);

-- Составной под запрос «заказы пользователя, новые сверху»
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);

-- По выражению: поиск без учёта регистра
CREATE UNIQUE INDEX idx_users_email_lower ON users (lower(email));

-- Частичный: только неудалённые записи
CREATE INDEX idx_posts_active ON posts (created_at) WHERE deleted_at IS NULL;

-- GIN для JSONB
CREATE INDEX idx_users_settings ON users USING GIN (settings);

-- На живой таблице создавайте без блокировки записи
CREATE INDEX CONCURRENTLY idx_orders_status ON orders (status);`,
    },
  ],
  tasks: [
    {
      title: 'Ускорьте запросы',
      level: 'средне',
      text: `<p>В таблице из примера (1 млн пользователей) добавьте столбец <code>created_at</code>. Подберите индексы для запросов и проверьте планы через <code>EXPLAIN QUERY PLAN</code>:</p>
        <ol>
          <li><code>WHERE city = ? ORDER BY created_at DESC LIMIT 20</code></li>
          <li><code>WHERE city = ? AND email LIKE 'user1%'</code></li>
          <li><code>WHERE created_at &gt; ?</code></li>
        </ol>
        <p>Можно ли обойтись одним составным индексом для всех трёх?</p>`,
      solution: `<p>(1) <code>(city, created_at)</code> — фильтр по равенству, затем сортировка без отдельного шага. (2) <code>(city, email)</code>. (3) отдельный индекс по <code>created_at</code>:
        индекс <code>(city, created_at)</code> ему не поможет — нарушено правило левого префикса. Одним индексом все три запроса не покрыть.</p>`,
    },
    {
      title: 'Цена записи',
      level: 'средне',
      text: `<p>Измерьте время вставки 200 000 строк в таблицу без индексов, с одним и с пятью индексами. Сделайте вывод, почему при массовой загрузке данных индексы иногда удаляют и создают заново после.</p>`,
    },
  ],
  quiz: [
    { q: 'Какую сложность поиска даёт B-tree индекс?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], answer: 1 },
    { q: 'Индекс <code>(user_id, created_at)</code> поможет запросу:', options: ['WHERE created_at > ?', 'WHERE user_id = ? ORDER BY created_at', "WHERE email = ?", 'Никакому'], answer: 1 },
    { q: 'Почему <code>WHERE lower(email) = ?</code> не использует индекс по email?', options: ['lower не работает в SQL', 'Индекс построен по исходным значениям, а не по результату функции', 'Индексы не работают со строками', 'Нужен LIMIT'], answer: 1 },
    { q: 'Какой недостаток есть у индексов?', options: ['Замедляют SELECT', 'Замедляют запись и занимают место', 'Нарушают нормализацию', 'Отключают транзакции'], answer: 1 },
  ],
  resources: [
    { title: 'Use The Index, Luke — книга об индексах (есть на русском)', url: 'https://use-the-index-luke.com/ru' },
    { title: 'PostgreSQL: типы индексов', url: 'https://postgrespro.ru/docs/postgresql/current/indexes-types' },
  ],
});

registerContent('migrations', {
  intro: `<p>Схема БД меняется вместе с кодом: новые таблицы, столбцы, индексы. <b>Миграции</b> — это версионируемые скрипты изменений схемы,
    которые хранятся в Git рядом с кодом и применяются одинаково на ноутбуке, тестовом сервере и в продакшене.</p>`,
  theory: [
    {
      title: 'Зачем нужны миграции',
      html: `<p>Без миграций изменения схемы делают вручную — и рано или поздно продакшен расходится с тестовой средой, а новый разработчик не может поднять проект.</p>
        <ul>
          <li>Каждая миграция имеет <b>версию</b> и ссылку на предыдущую — получается цепочка.</li>
          <li>В БД хранится служебная таблица с текущей версией (в Alembic — <code>alembic_version</code>).</li>
          <li><b>upgrade</b> применяет изменение, <b>downgrade</b> — откатывает.</li>
          <li>Миграции применяются автоматически при деплое.</li>
        </ul>
        <p>Инструменты: <b>Alembic</b> (для SQLAlchemy), встроенные миграции <b>Django</b>, а также Flyway, Liquibase, Atlas — независимые от языка.</p>`,
    },
    {
      title: 'Alembic: рабочий цикл',
      html: `<ol>
          <li><code>alembic init migrations</code> — один раз создать структуру;</li>
          <li>указать в <code>env.py</code> метаданные моделей (<code>target_metadata = Base.metadata</code>) и адрес БД;</li>
          <li>изменить модели в коде;</li>
          <li><code>alembic revision --autogenerate -m "add phone to users"</code> — Alembic сравнит модели с БД и сгенерирует миграцию;</li>
          <li><b>проверить сгенерированный файл глазами</b> — autogenerate не всё понимает правильно (например, переименование видит как удаление + добавление);</li>
          <li><code>alembic upgrade head</code> — применить.</li>
        </ol>`,
    },
    {
      title: 'Безопасные миграции на живой системе',
      html: `<p>В продакшене старый и новый код какое-то время работают одновременно, а таблицы могут быть огромными. Правила:</p>
        <ul>
          <li><b>Добавить NOT NULL столбец</b> — сначала nullable или с <code>DEFAULT</code>, заполнить данные, потом добавить ограничение.</li>
          <li><b>Переименовать / удалить столбец</b> — в несколько релизов (expand → migrate → contract): добавить новый, писать в оба, перенести данные, переключить чтение, удалить старый.</li>
          <li><b>Индексы</b> на больших таблицах — <code>CREATE INDEX CONCURRENTLY</code>.</li>
          <li>Не изменяйте уже применённые миграции — создавайте новые.</li>
          <li>Делайте бэкап перед рискованными миграциями.</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'Настройка Alembic',
      lang: 'bash',
      code: String.raw`
pip install alembic
alembic init migrations

# в migrations/env.py:
#   from app.models import Base
#   target_metadata = Base.metadata
# в alembic.ini: sqlalchemy.url = sqlite:///notes.db  (или берите из os.environ в env.py)

alembic revision --autogenerate -m "create notes table"
alembic upgrade head        # применить все
alembic current             # текущая версия БД
alembic history             # цепочка миграций
alembic downgrade -1        # откатить последнюю`,
    },
    {
      title: 'Файл миграции',
      lang: 'python',
      code: String.raw`
"""add phone to users

Revision ID: 3b1f2c9a7d10
Revises: 9e8d7c6b5a40
"""
from alembic import op
import sqlalchemy as sa

revision = "3b1f2c9a7d10"
down_revision = "9e8d7c6b5a40"

def upgrade() -> None:
    op.add_column("users", sa.Column("phone", sa.String(20), nullable=True))
    op.create_index("ix_users_phone", "users", ["phone"])

def downgrade() -> None:
    op.drop_index("ix_users_phone", table_name="users")
    op.drop_column("users", "phone")`,
    },
  ],
  tasks: [
    {
      title: 'Подключите Alembic к API заметок',
      level: 'средне',
      text: `<p>Добавьте Alembic в проект API заметок: начальная миграция создаёт все таблицы. Затем добавьте в модель заметки поле <code>is_pinned</code> (по умолчанию false),
        сгенерируйте миграцию, проверьте её, примените, откатите и примените снова. Уберите <code>create_all</code> из кода приложения.</p>`,
      hint: `<p>Для нового <code>NOT NULL</code>-столбца в существующей таблице задайте <code>server_default=sa.false()</code>, иначе миграция упадёт на уже существующих строках.</p>`,
    },
    {
      title: 'Спланируйте переименование',
      level: 'сложно',
      text: `<p>Нужно переименовать столбец <code>users.name</code> в <code>users.full_name</code> на сервисе, который работает 24/7 на нескольких серверах. Опишите последовательность релизов и миграций без простоя.</p>`,
      solution: `<ol>
          <li>Миграция: добавить <code>full_name</code> (nullable). Код: писать в оба столбца, читать из <code>name</code>.</li>
          <li>Миграция с данными: <code>UPDATE users SET full_name = name WHERE full_name IS NULL</code> (пачками на больших таблицах).</li>
          <li>Код: читать из <code>full_name</code>, писать в оба.</li>
          <li>Код: перестать использовать <code>name</code>. Миграция: <code>full_name</code> → NOT NULL.</li>
          <li>Миграция: удалить <code>name</code>.</li>
        </ol>`,
    },
  ],
  quiz: [
    { q: 'Где Alembic хранит текущую версию схемы?', options: ['В файле alembic.ini', 'В таблице alembic_version в самой БД', 'В Git', 'В переменной окружения'], answer: 1 },
    { q: 'Что нужно сделать после <code>alembic revision --autogenerate</code>?', options: ['Сразу закоммитить', 'Проверить сгенерированный код миграции', 'Удалить старые миграции', 'Перезапустить БД'], answer: 1 },
    { q: 'Как безопасно изменить уже применённую в продакшене миграцию?', options: ['Отредактировать файл', 'Не менять, а создать новую миграцию', 'Удалить её', 'Выполнить downgrade на проде'], answer: 1 },
  ],
  resources: [
    { title: 'Alembic: учебник', url: 'https://alembic.sqlalchemy.org/en/latest/tutorial.html' },
  ],
});

registerContent('failure-modes', {
  intro: `<p>База данных — самая критичная зависимость бэкенда. Она может стать недоступной, медленной, переполненной или потерять данные.
    Хороший бэкенд заранее знает, как поведёт себя в каждом из этих случаев, и не превращает проблему БД в катастрофу.</p>`,
  theory: [
    {
      title: 'Типичные отказы',
      html: `<table>
          <tr><th>Отказ</th><th>Симптомы</th><th>Что делать</th></tr>
          <tr><td>БД недоступна (упала, сеть)</td><td>Ошибки соединения</td><td>Таймауты, повторы с backoff, ответ 503, реплика/failover</td></tr>
          <tr><td>Исчерпан пул соединений</td><td>Запросы висят в ожидании соединения</td><td>Ограничить пул, таймаут ожидания, PgBouncer, искать «утёкшие» соединения</td></tr>
          <tr><td>Медленные запросы</td><td>Растёт время ответа, нагрузка CPU БД</td><td>Индексы, <code>statement_timeout</code>, профилирование</td></tr>
          <tr><td>Взаимоблокировки (deadlock)</td><td>Ошибка deadlock detected</td><td>Блокировать строки в одинаковом порядке, повторять транзакцию</td></tr>
          <tr><td>Закончился диск</td><td>Запись невозможна, БД может остановиться</td><td>Мониторинг места, ротация логов, архивация</td></tr>
          <tr><td>Потеря данных</td><td>Сбой диска, ошибка человека (<code>DELETE</code> без WHERE)</td><td>Бэкапы + проверка восстановления, PITR, репликация</td></tr>
        </table>`,
    },
    {
      title: 'Таймауты везде',
      html: `<p>Запрос без таймаута может висеть бесконечно, держа соединение и поток обработки. Когда БД тормозит, такие запросы накапливаются, и падает уже всё приложение.</p>
        <ul>
          <li><b>Таймаут подключения</b> (<code>connect_timeout</code>);</li>
          <li><b>Таймаут запроса</b> (<code>statement_timeout</code> в PostgreSQL);</li>
          <li><b>Таймаут ожидания соединения из пула</b> (<code>pool_timeout</code> в SQLAlchemy).</li>
        </ul>
        <p class="note">Лучше быстро вернуть клиенту ошибку 503, чем заставить его ждать минуту и всё равно получить ошибку.</p>`,
    },
    {
      title: 'Бэкапы',
      html: `<ul>
          <li><b>Логические</b> (<code>pg_dump</code>) — SQL-дамп; удобно для небольших БД и переноса.</li>
          <li><b>Физические</b> + архив WAL — позволяют <b>PITR</b> (Point-In-Time Recovery): восстановить состояние на любую секунду, например на момент перед ошибочным <code>DELETE</code>.</li>
          <li>Правило <b>3-2-1</b>: 3 копии, на 2 разных носителях, 1 — в другом месте.</li>
        </ul>
        <p class="note">Бэкап, восстановление из которого ни разу не проверяли, — это не бэкап. Регулярно тренируйте восстановление.</p>`,
    },
    {
      title: 'Health check и graceful degradation',
      html: `<p>Эндпоинт <code>/health</code> проверяет доступность БД — по нему балансировщик и оркестратор (Kubernetes) понимают, что экземпляр приложения нездоров.
        Если БД недоступна, часть функций может работать дальше: отдавать данные из кэша, принимать заказы в очередь (см. раздел «Построение систем под нагрузку»).</p>`,
    },
  ],
  examples: [
    {
      title: 'Настройка таймаутов и пула в SQLAlchemy',
      lang: 'python',
      code: String.raw`
from sqlalchemy import create_engine

engine = create_engine(
    "postgresql+psycopg://app:pass@db:5432/shop",
    pool_size=10,           # постоянных соединений
    max_overflow=5,         # дополнительных при пике
    pool_timeout=3,         # сек ожидания свободного соединения
    pool_pre_ping=True,     # проверять соединение перед использованием (переживает рестарт БД)
    connect_args={
        "connect_timeout": 3,
        "options": "-c statement_timeout=5000",   # мс: убивать запросы дольше 5 с
    },
)`,
    },
    {
      title: 'Ответ 503 и health check в FastAPI',
      lang: 'python',
      code: String.raw`
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import OperationalError, TimeoutError as PoolTimeout

app = FastAPI()

@app.exception_handler(OperationalError)
@app.exception_handler(PoolTimeout)
async def db_unavailable(request: Request, exc: Exception):
    return JSONResponse(status_code=503, content={"error": "База данных временно недоступна"},
                        headers={"Retry-After": "5"})

@app.get("/health")
def health():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok"}`,
    },
    {
      title: 'Бэкап и восстановление PostgreSQL',
      lang: 'bash',
      code: String.raw`
# Дамп в сжатом формате
pg_dump -h localhost -U app -Fc shop > shop_2026-10-05.dump

# Восстановление в новую базу
createdb -h localhost -U app shop_restored
pg_restore -h localhost -U app -d shop_restored shop_2026-10-05.dump`,
    },
  ],
  tasks: [
    {
      title: 'Остановите базу',
      level: 'средне',
      text: `<p>Запустите API заметок с PostgreSQL в Docker. Остановите контейнер БД (<code>docker stop pg</code>) и отправьте запрос. Что получил клиент и через сколько секунд?
        Добавьте таймауты и обработчик, чтобы клиент быстро получал 503 с понятным сообщением. Запустите БД снова — восстановилось ли приложение само?</p>`,
    },
    {
      title: 'Учения по восстановлению',
      level: 'средне',
      text: `<p>Сделайте дамп базы API заметок, «случайно» удалите все заметки (<code>DELETE FROM notes</code>) и восстановите данные из дампа. Засеките время. Напишите короткую инструкцию (runbook) по восстановлению для README.</p>`,
    },
  ],
  quiz: [
    { q: 'Что делает <code>pool_pre_ping=True</code>?', options: ['Ускоряет запросы', 'Проверяет живость соединения перед использованием', 'Создаёт бэкап', 'Включает репликацию'], answer: 1 },
    { q: 'Какой код ответа уместен, если БД временно недоступна?', options: ['400', '404', '500', '503'], answer: 3 },
    { q: 'Что позволяет PITR?', options: ['Шардировать БД', 'Восстановить состояние на любой момент времени', 'Ускорить индексы', 'Избежать deadlock'], answer: 1 },
  ],
  resources: [
    { title: 'PostgreSQL: резервное копирование', url: 'https://postgrespro.ru/docs/postgresql/current/backup' },
  ],
});

registerContent('profiling-performance', {
  intro: `<p>Когда API тормозит, в 80% случаев виновата база данных: медленный запрос, отсутствующий индекс, N+1. <b>Профилирование</b> — это поиск узкого места
    по фактам, а не догадкам. Главный инструмент — <code>EXPLAIN ANALYZE</code>.</p>`,
  theory: [
    {
      title: 'Сначала измерить',
      html: `<ol>
          <li><b>Найти медленные эндпоинты</b>: логи с временем ответа, APM (Sentry, Grafana, New Relic).</li>
          <li><b>Найти медленные запросы</b>: лог медленных запросов (<code>log_min_duration_statement</code> в PostgreSQL), расширение <code>pg_stat_statements</code> — топ запросов по суммарному времени.</li>
          <li><b>Разобрать план</b> конкретного запроса через <code>EXPLAIN ANALYZE</code>.</li>
          <li><b>Исправить</b> и <b>измерить снова</b>.</li>
        </ol>
        <p class="note">Оптимизируйте то, что даёт наибольшее <i>суммарное</i> время: запрос по 5 мс, вызываемый 10 000 раз в минуту, важнее отчёта на 3 секунды раз в день.</p>`,
    },
    {
      title: 'Читаем EXPLAIN ANALYZE',
      html: `<p><code>EXPLAIN</code> показывает план, который выбрал оптимизатор; <code>EXPLAIN ANALYZE</code> ещё и выполняет запрос и показывает реальное время. План — дерево узлов, читается изнутри наружу.</p>
        <ul>
          <li><b>Seq Scan</b> — полный перебор таблицы. На большой таблице с селективным условием — кандидат на индекс.</li>
          <li><b>Index Scan / Index Only Scan</b> — поиск по индексу.</li>
          <li><b>Nested Loop / Hash Join / Merge Join</b> — способы соединения таблиц.</li>
          <li><b>Sort</b> с <code>external merge Disk</code> — сортировка не влезла в память.</li>
          <li><code>rows=</code> оценка против <code>actual rows=</code> — если сильно расходятся, у оптимизатора устаревшая статистика (<code>ANALYZE table</code>).</li>
        </ul>`,
    },
    {
      title: 'Частые рецепты',
      html: `<ul>
          <li>Добавить индекс под условие <code>WHERE</code> / <code>JOIN</code> / <code>ORDER BY</code>.</li>
          <li>Выбирать только нужные столбцы, а не <code>SELECT *</code>.</li>
          <li>Убрать N+1 жадной загрузкой.</li>
          <li>Глубокая пагинация <code>OFFSET 100000</code> медленная — БД всё равно читает и выбрасывает 100 000 строк. Используйте <b>keyset-пагинацию</b>: <code>WHERE id &gt; :last_id ORDER BY id LIMIT 20</code>.</li>
          <li>Кэшировать результаты тяжёлых и редко меняющихся запросов (раздел «Кэширование»).</li>
          <li>Профилировать и Python-код: <code>cProfile</code>, <code>py-spy</code> — иногда тормозит не БД, а сериализация.</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'EXPLAIN ANALYZE до и после индекса',
      lang: 'sql',
      code: String.raw`
EXPLAIN ANALYZE
SELECT id, total FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 10;

-- Limit  (actual time=148.2..148.2 rows=10)
--   ->  Sort  (actual time=148.2..148.2 rows=10)
--         Sort Key: created_at DESC
--         ->  Seq Scan on orders  (actual time=0.03..147.9 rows=97 loops=1)
--               Filter: (user_id = 42)
--               Rows Removed by Filter: 999903
-- Execution Time: 148.3 ms

CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);

-- Limit  (actual time=0.04..0.06 rows=10)
--   ->  Index Scan using idx_orders_user_created on orders  (rows=10)
--         Index Cond: (user_id = 42)
-- Execution Time: 0.08 ms`,
      explain: `<p>«Rows Removed by Filter: 999903» — главный сигнал: прочитали миллион строк ради 97. После индекса нет ни перебора, ни отдельной сортировки.</p>`,
    },
    {
      title: 'Топ медленных запросов',
      lang: 'sql',
      code: String.raw`
-- В postgresql.conf: shared_preload_libraries = 'pg_stat_statements'
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

SELECT round(total_exec_time) AS total_ms,
       calls,
       round(mean_exec_time, 2) AS avg_ms,
       left(query, 80) AS query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;`,
    },
    {
      title: 'Keyset-пагинация',
      lang: 'python',
      code: String.raw`
# Медленно на дальних страницах: OFFSET читает и отбрасывает строки
# SELECT * FROM notes ORDER BY id LIMIT 20 OFFSET 200000

def list_notes(conn, after_id: int = 0, limit: int = 20) -> dict:
    rows = conn.execute(
        "SELECT id, title FROM notes WHERE id > ? ORDER BY id LIMIT ?",
        (after_id, limit),
    ).fetchall()
    next_cursor = rows[-1]["id"] if len(rows) == limit else None
    return {"items": [dict(r) for r in rows], "next_cursor": next_cursor}`,
      explain: `<p>Клиент передаёт <code>?after_id=</code> из <code>next_cursor</code> предыдущего ответа. Скорость одинакова на любой «странице».</p>`,
    },
  ],
  tasks: [
    {
      title: 'Найдите узкое место',
      level: 'средне',
      text: `<p>Заполните таблицу заметок в PostgreSQL миллионом строк (<code>INSERT ... SELECT ... FROM generate_series(1, 1000000)</code>). Через <code>EXPLAIN ANALYZE</code> разберите запросы
        вашего API: список с фильтром по тегу, сортировку по дате, дальнюю страницу. Ускорьте каждый и запишите время «до» и «после».</p>`,
      hint: `<p>Генерация данных: <code>INSERT INTO notes (title, created_at) SELECT 'note ' || i, now() - i * interval '1 minute' FROM generate_series(1, 1000000) AS i;</code></p>`,
    },
    {
      title: 'Middleware для времени запросов',
      level: 'средне',
      text: `<p>Добавьте в FastAPI middleware, который логирует метод, путь, статус и время обработки каждого запроса и пишет WARNING, если запрос дольше 500 мс.
        Дополнительно: добавьте в ответ заголовок <code>Server-Timing</code> — его показывает вкладка Network в DevTools.</p>`,
      solutionCode: String.raw`
import logging
import time
from fastapi import FastAPI, Request

log = logging.getLogger("timing")
app = FastAPI()

@app.middleware("http")
async def timing(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    ms = (time.perf_counter() - start) * 1000
    level = logging.WARNING if ms > 500 else logging.INFO
    log.log(level, "%s %s %s %.1fms", request.method, request.url.path, response.status_code, ms)
    response.headers["Server-Timing"] = f"app;dur={ms:.1f}"
    return response`,
    },
  ],
  quiz: [
    { q: 'Что значит <code>Seq Scan</code> в плане запроса?', options: ['Поиск по индексу', 'Полный перебор таблицы', 'Сортировка', 'Соединение таблиц'], answer: 1 },
    { q: 'Чем <code>EXPLAIN ANALYZE</code> отличается от <code>EXPLAIN</code>?', options: ['Ничем', 'Реально выполняет запрос и показывает фактическое время', 'Создаёт индексы', 'Работает только в MySQL'], answer: 1 },
    { q: 'Почему <code>OFFSET 100000</code> медленный?', options: ['OFFSET запрещён', 'БД читает и отбрасывает все пропущенные строки', 'Нужно больше памяти клиенту', 'Он блокирует таблицу'], answer: 1 },
    { q: 'Какое расширение PostgreSQL собирает статистику по всем запросам?', options: ['pg_trgm', 'pg_stat_statements', 'postgis', 'pgvector'], answer: 1 },
  ],
  resources: [
    { title: 'explain.dalibo.com — визуализация планов', url: 'https://explain.dalibo.com/' },
    { title: 'PostgreSQL: использование EXPLAIN', url: 'https://postgrespro.ru/docs/postgresql/current/using-explain' },
  ],
});
