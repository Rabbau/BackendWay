// Раздел: NoSQL базы данных

registerContent('mongodb', {
  intro: `<p><b>NoSQL</b> — общее название баз, которые хранят данные не в реляционных таблицах: документы, пары ключ-значение, колонки, графы. Каждая решает свой класс задач.
    <b>MongoDB</b> — самая популярная <b>документная</b> БД: данные хранятся как JSON-подобные документы с гибкой структурой.</p>`,
  theory: [
    {
      title: 'Документная модель',
      html: `<ul>
          <li><b>Документ</b> — объект в формате BSON (бинарный JSON): вложенные объекты, массивы, даты, ObjectId. Аналог строки, но может быть сложным деревом.</li>
          <li><b>Коллекция</b> — набор документов (аналог таблицы), но жёсткой схемы нет: документы могут отличаться полями.</li>
          <li>У каждого документа поле <code>_id</code> (по умолчанию <code>ObjectId</code>).</li>
        </ul>
        <p>Главный принцип моделирования — <b>храните вместе то, что читаете вместе</b>. Заказ с позициями и адресом доставки — один документ, а не три таблицы с JOIN.
        Встраивать (embed), если данные принадлежат родителю и ограничены по размеру; ссылаться (reference), если сущность самостоятельна или массив растёт неограниченно (лимит документа — 16 МБ).</p>`,
    },
    {
      title: 'Возможности',
      html: `<ul>
          <li>Запросы по любым полям, включая вложенные (<code>"address.city"</code>) и элементы массивов; индексы на них.</li>
          <li><b>Aggregation pipeline</b> — цепочка стадий (<code>$match</code>, <code>$group</code>, <code>$lookup</code>, <code>$sort</code>) для аналитики.</li>
          <li>Транзакции на несколько документов (с версии 4.0), репликация (replica set), шардирование.</li>
          <li><b>Schema validation</b> — можно всё-таки задать JSON Schema для коллекции.</li>
        </ul>`,
    },
    {
      title: 'Когда выбирать',
      html: `<p>Хорошо подходит: каталоги товаров с разными атрибутами, контент и CMS, профили, логи событий, прототипы с быстро меняющейся структурой.</p>
        <p>Хуже подходит: много связей между сущностями и сложные отчёты с JOIN, строгая согласованность финансовых данных.</p>
        <p class="note">«Без схемы» не значит «без проектирования»: схема всё равно есть — просто в коде приложения. Проверяйте данные через Pydantic, иначе за год в коллекции появятся пять вариантов одного поля.
        Помните и про JSONB в PostgreSQL — он закрывает многие задачи «гибких документов», не выходя из реляционной БД.</p>`,
    },
  ],
  examples: [
    {
      title: 'Работа с MongoDB из Python',
      lang: 'python',
      code: String.raw`
# docker run -d -p 27017:27017 mongo:8 ;  pip install pymongo
from datetime import datetime, timezone
from pymongo import ASCENDING, DESCENDING, MongoClient

db = MongoClient("mongodb://localhost:27017").shop
orders = db.orders

orders.insert_one({
    "user_id": 42,
    "status": "paid",
    "created_at": datetime.now(timezone.utc),
    "address": {"city": "Казань", "street": "Баумана, 1"},
    "items": [                                     # позиции встроены в заказ
        {"sku": "KB-1", "title": "Клавиатура", "price": 3500, "qty": 1},
        {"sku": "MS-2", "title": "Мышь", "price": 1200, "qty": 2},
    ],
})
orders.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])

# Заказы пользователя из Казани с мышью
for o in orders.find({"user_id": 42, "address.city": "Казань", "items.sku": "MS-2"}):
    print(o["_id"], o["status"])

# Обновление: сменить статус и добавить запись в историю
orders.update_one({"user_id": 42, "status": "paid"},
                  {"$set": {"status": "shipped"}, "$push": {"history": {"status": "shipped"}}})

# Агрегация: выручка по городам
pipeline = [
    {"$match": {"status": {"$in": ["paid", "shipped"]}}},
    {"$unwind": "$items"},
    {"$group": {"_id": "$address.city", "revenue": {"$sum": {"$multiply": ["$items.price", "$items.qty"]}}}},
    {"$sort": {"revenue": -1}},
]
print(list(orders.aggregate(pipeline)))`,
    },
  ],
  tasks: [
    {
      title: 'Каталог с разными атрибутами',
      level: 'средне',
      text: `<p>Спроектируйте в MongoDB каталог, где у ноутбуков есть процессор и диагональ, у футболок — размер и цвет, у книг — автор и ISBN. Реализуйте поиск по категории и произвольному атрибуту
        (например, все ноутбуки с диагональю 14) и фасеты через aggregation. Сравните с решением на PostgreSQL + JSONB.</p>`,
    },
    {
      title: 'Embed или reference?',
      level: 'легко',
      text: `<p>Для каждой пары решите — встроить или сослаться: пост и его комментарии (до миллиона у популярных постов); пользователь и его адрес доставки по умолчанию; заказ и товары каталога; статья и её автор.</p>`,
      solution: `<p>Комментарии — ссылка (отдельная коллекция): неограниченный рост упрётся в лимит 16 МБ. Адрес — встроить. Заказ и товары — встроить <i>копию</i> нужных полей (название, цена на момент покупки) + ссылку на товар.
        Автор — ссылка (самостоятельная сущность), при необходимости встроить копию имени для быстрого показа.</p>`,
    },
  ],
  quiz: [
    { q: 'Главный принцип моделирования в документной БД:', options: ['Нормализовать до 3НФ', 'Хранить вместе то, что читается вместе', 'Одна коллекция на поле', 'Не использовать индексы'], answer: 1 },
    { q: 'Какой максимальный размер документа MongoDB?', options: ['1 МБ', '16 МБ', '1 ГБ', 'Без ограничений'], answer: 1 },
    { q: 'Что такое aggregation pipeline?', options: ['Репликация', 'Цепочка стадий обработки документов для аналитики', 'Тип индекса', 'Драйвер Python'], answer: 1 },
  ],
  resources: [
    { title: 'MongoDB: документация и курсы', url: 'https://www.mongodb.com/docs/manual/' },
    { title: 'MongoDB: паттерны моделирования данных', url: 'https://www.mongodb.com/docs/manual/data-modeling/' },
  ],
});

registerContent('redis-kv', {
  intro: `<p><b>Key-Value хранилища</b> — самая простая модель: значение по ключу. Никаких запросов «по полю» — только «дай значение по ключу» за O(1). За счёт простоты они очень быстрые и хорошо масштабируются.
    Вы уже знаете Redis; здесь — о модели в целом и об <b>Amazon DynamoDB</b>, где key-value доведён до огромных масштабов.</p>`,
  theory: [
    {
      title: 'Где применяются',
      html: `<ul>
          <li>Кэш, сессии, корзины, feature flags, rate limiting — Redis/Valkey, Memcached.</li>
          <li>Основное хранилище с предсказуемой задержкой при любом масштабе — <b>DynamoDB</b>, Azure Cosmos DB, Yandex Managed YDB (в режиме document API).</li>
          <li>Встраиваемые: RocksDB, LMDB — внутри других систем (Kafka Streams, CockroachDB).</li>
        </ul>`,
    },
    {
      title: 'DynamoDB и проектирование под запросы',
      html: `<ul>
          <li><b>Partition key</b> (обязателен) определяет, на каком сервере лежат данные; <b>sort key</b> (необязателен) упорядочивает элементы внутри партиции.</li>
          <li>Эффективные операции: получить по ключу, получить диапазон по sort key внутри одной партиции. Всё остальное — дорогой полный перебор (<code>Scan</code>).</li>
          <li><b>Single-table design</b>: сначала выписываете все запросы приложения, затем подбираете ключи так, чтобы каждый запрос был одним <code>Query</code>. Например <code>PK=USER#42</code>, <code>SK=ORDER#2026-10-05#101</code>.</li>
          <li>Вторичные индексы (GSI) — для других способов доступа.</li>
          <li>Serverless: оплата за запросы, автомасштабирование.</li>
        </ul>
        <p class="note">Это противоположность реляционному подходу: там сначала моделируют данные, а запросы любые; здесь сначала запросы, и добавить новый тип запроса потом бывает сложно.</p>`,
    },
  ],
  examples: [
    {
      title: 'Модель «пользователь и его заказы» в DynamoDB',
      lang: 'python',
      code: String.raw`
# Локально: docker run -p 8000:8000 amazon/dynamodb-local ; pip install boto3
import boto3
from boto3.dynamodb.conditions import Key

ddb = boto3.resource("dynamodb", endpoint_url="http://localhost:8000", region_name="local",
                     aws_access_key_id="x", aws_secret_access_key="x")
table = ddb.create_table(
    TableName="shop",
    KeySchema=[{"AttributeName": "PK", "KeyType": "HASH"}, {"AttributeName": "SK", "KeyType": "RANGE"}],
    AttributeDefinitions=[{"AttributeName": "PK", "AttributeType": "S"}, {"AttributeName": "SK", "AttributeType": "S"}],
    BillingMode="PAY_PER_REQUEST",
)

table.put_item(Item={"PK": "USER#42", "SK": "PROFILE", "name": "Анна"})
table.put_item(Item={"PK": "USER#42", "SK": "ORDER#2026-10-01#100", "total": 4700})
table.put_item(Item={"PK": "USER#42", "SK": "ORDER#2026-10-05#101", "total": 1200})

# Все заказы пользователя за октябрь, новые первыми — один эффективный запрос
resp = table.query(
    KeyConditionExpression=Key("PK").eq("USER#42") & Key("SK").begins_with("ORDER#2026-10"),
    ScanIndexForward=False,
)
print([i["SK"] for i in resp["Items"]])`,
    },
  ],
  tasks: [
    {
      title: 'Спроектируйте ключи',
      level: 'сложно',
      text: `<p>Для API заметок выпишите все запросы (заметка по id, заметки пользователя по дате, заметки пользователя по тегу, все теги пользователя) и спроектируйте single-table схему DynamoDB так, чтобы каждый был одним Query (возможно, с GSI).</p>`,
    },
  ],
  quiz: [
    { q: 'Какая операция эффективна в key-value хранилище?', options: ['Поиск по любому полю', 'Получение значения по ключу', 'JOIN', 'Полнотекстовый поиск'], answer: 1 },
    { q: 'С чего начинают проектирование в DynamoDB?', options: ['С нормализации', 'Со списка запросов (access patterns)', 'С индексов B-tree', 'С выбора языка'], answer: 1 },
  ],
  resources: [
    { title: 'Amazon DynamoDB: Developer Guide', url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html' },
  ],
});

registerContent('cassandra', {
  intro: `<p><b>Apache Cassandra</b> и совместимая с ней <b>ScyllaDB</b> — распределённые <b>wide-column</b> базы для огромных объёмов записи: миллионы операций в секунду, петабайты данных,
    десятки и сотни узлов без единой точки отказа. Используются в Apple, Netflix, Discord (сообщения), Instagram.</p>`,
  theory: [
    {
      title: 'Архитектура',
      html: `<ul>
          <li><b>Без лидера</b>: все узлы равноправны, клиент может писать на любой. Данные распределяются по кольцу узлов по хешу <b>partition key</b> и реплицируются (обычно ×3), в том числе между дата-центрами.</li>
          <li><b>Быстрая запись</b>: запись — дописывание в журнал и память (LSM-дерево), без чтения перед записью.</li>
          <li><b>Настраиваемая согласованность</b>: для каждого запроса выбираете, сколько реплик должно подтвердить — <code>ONE</code>, <code>QUORUM</code>, <code>ALL</code>. QUORUM на запись и чтение даёт строгую согласованность.</li>
        </ul>`,
    },
    {
      title: 'Моделирование',
      html: `<ul>
          <li>Язык <b>CQL</b> похож на SQL, но JOIN нет, а <code>WHERE</code> можно ставить только по ключу.</li>
          <li><b>Primary key = partition key + clustering columns</b>: партиция определяет, где лежат данные, clustering — их порядок внутри партиции.</li>
          <li><b>Одна таблица на запрос</b>: данные дублируются в нескольких таблицах под разные запросы (денормализация — норма).</li>
          <li>Партиции не должны расти бесконечно: «сообщения канала» делят на бакеты по времени — <code>(channel_id, month)</code>.</li>
        </ul>
        <p>ScyllaDB — переписанная на C++ совместимая реализация: в несколько раз быстрее на том же железе, тот же CQL и драйверы.</p>`,
    },
  ],
  examples: [
    {
      title: 'Сообщения чата в CQL',
      lang: 'sql',
      code: String.raw`
CREATE KEYSPACE chat WITH replication = {'class': 'NetworkTopologyStrategy', 'dc1': 3};

CREATE TABLE chat.messages (
    channel_id  bigint,
    bucket      text,          -- '2026-10' — ограничиваем размер партиции
    message_id  timeuuid,
    author_id   bigint,
    text        text,
    PRIMARY KEY ((channel_id, bucket), message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);

-- Последние 50 сообщений канала — чтение одной партиции, уже отсортированной
SELECT author_id, text FROM chat.messages
WHERE channel_id = 7 AND bucket = '2026-10'
LIMIT 50;`,
    },
    {
      title: 'Python-драйвер',
      lang: 'python',
      code: String.raw`
# docker run -d -p 9042:9042 scylladb/scylla --smp 1 ; pip install scylla-driver (или cassandra-driver)
from cassandra.cluster import Cluster
from cassandra import ConsistencyLevel
from cassandra.query import SimpleStatement

session = Cluster(["127.0.0.1"]).connect("chat")
stmt = SimpleStatement(
    "SELECT author_id, text FROM messages WHERE channel_id=%s AND bucket=%s LIMIT 50",
    consistency_level=ConsistencyLevel.QUORUM,
)
for row in session.execute(stmt, (7, "2026-10")):
    print(row.author_id, row.text)`,
    },
  ],
  tasks: [
    {
      title: 'Таблицы под запросы',
      level: 'сложно',
      text: `<p>Для сервиса коротких ссылок спроектируйте таблицы Cassandra под запросы: получить URL по короткому коду; список ссылок пользователя по дате создания; переходы по ссылке за день по часам.
        Сколько таблиц понадобится и какие данные дублируются?</p>`,
    },
  ],
  quiz: [
    { q: 'Как распределяются данные по узлам в Cassandra?', options: ['Вручную', 'По хешу partition key', 'По алфавиту', 'Случайно'], answer: 1 },
    { q: 'Почему в Cassandra данные часто дублируют в нескольких таблицах?', options: ['Ошибка проектирования', 'JOIN нет, поэтому под каждый запрос — своя таблица', 'Для бэкапов', 'Так требует CQL'], answer: 1 },
  ],
  resources: [
    { title: 'Cassandra: моделирование данных', url: 'https://cassandra.apache.org/doc/latest/cassandra/developing/data-modeling/index.html' },
    { title: 'Discord: как хранят триллионы сообщений', url: 'https://discord.com/blog/how-discord-stores-trillions-of-messages' },
  ],
});

registerContent('timeseries', {
  intro: `<p><b>Временные ряды</b> — измерения, привязанные ко времени: метрики серверов, показания датчиков, курсы валют, события пользователей. Их особенность — огромный поток записи,
    почти нет изменений старых данных, а запросы — агрегаты по интервалам («средняя загрузка CPU по 5 минут за сутки»). Специализированные <b>time-series БД</b> хранят такие данные в десятки раз компактнее и считают быстрее.</p>`,
  theory: [
    {
      title: 'Возможности',
      html: `<ul>
          <li><b>Сжатие</b>: соседние значения похожи, поэтому хранятся очень компактно.</li>
          <li><b>Даунсэмплинг</b> и <b>retention</b>: сырые данные храним 7 дней, поминутные агрегаты — год, затем удаляем автоматически.</li>
          <li>Функции окон времени: <code>time_bucket</code>, скользящие средние, интерполяция пропусков.</li>
          <li><b>Метки (tags)</b> — измерения для фильтра и группировки: <code>host</code>, <code>region</code>. Следите за <b>кардинальностью</b>: метка «user_id» с миллионом значений убивает производительность.</li>
        </ul>`,
    },
    {
      title: 'Популярные решения',
      html: `<ul>
          <li><b>TimescaleDB</b> — расширение PostgreSQL: обычный SQL, JOIN с вашими таблицами, гипертаблицы с автоматическим разбиением по времени. Лучший выбор, если у вас уже PostgreSQL.</li>
          <li><b>InfluxDB</b> — отдельная TSDB со своим протоколом записи (line protocol) и экосистемой.</li>
          <li><b>Prometheus</b> — TSDB для метрик мониторинга (раздел «Построение систем под нагрузкой»).</li>
          <li><b>ClickHouse</b> — колоночная аналитическая СУБД, отлично справляется и с временными рядами (следующая тема).</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'TimescaleDB: метрики API',
      lang: 'sql',
      code: String.raw`
-- docker run -d -p 5433:5432 -e POSTGRES_PASSWORD=secret timescale/timescaledb:latest-pg17
CREATE TABLE api_requests (
    time        TIMESTAMPTZ NOT NULL,
    endpoint    TEXT NOT NULL,
    status      SMALLINT,
    duration_ms REAL
);
SELECT create_hypertable('api_requests', by_range('time'));
SELECT add_retention_policy('api_requests', INTERVAL '30 days');   -- старое удаляется само

-- p95 времени ответа по эндпоинтам с шагом 5 минут за последний час
SELECT time_bucket('5 minutes', time) AS bucket,
       endpoint,
       percentile_cont(0.95) WITHIN GROUP (ORDER BY duration_ms) AS p95_ms,
       count(*) FILTER (WHERE status >= 500) AS errors
FROM api_requests
WHERE time > now() - INTERVAL '1 hour'
GROUP BY bucket, endpoint
ORDER BY bucket;`,
    },
    {
      title: 'InfluxDB: запись точки',
      lang: 'python',
      code: String.raw`
# pip install influxdb-client
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

client = InfluxDBClient(url="http://localhost:8086", token="my-token", org="my-org")
write = client.write_api(write_options=SYNCHRONOUS)
write.write(bucket="metrics", record=Point("cpu").tag("host", "web-1").field("usage", 63.5))
# line protocol: cpu,host=web-1 usage=63.5 1728139200000000000`,
    },
  ],
  tasks: [
    {
      title: 'Метрики своего API',
      level: 'средне',
      text: `<p>Подключите TimescaleDB к API заметок: middleware из темы «Профилирование» пишет каждую пару (эндпоинт, статус, длительность) в гипертаблицу (пачками раз в секунду, а не по одной).
        Постройте запросами: RPS по минутам, p95 по эндпоинтам, долю 5xx. Добавьте непрерывный агрегат (<code>continuous aggregate</code>) по часам.</p>`,
    },
  ],
  quiz: [
    { q: 'Что такое retention policy?', options: ['Политика паролей', 'Автоматическое удаление данных старше заданного срока', 'Репликация', 'Тип индекса'], answer: 1 },
    { q: 'Почему опасна метка с очень большим числом значений (высокая кардинальность)?', options: ['Нарушает 3НФ', 'Резко растут индексы и падает производительность TSDB', 'Запрещена синтаксисом', 'Мешает сжатию дат'], answer: 1 },
  ],
  resources: [
    { title: 'TimescaleDB: документация', url: 'https://docs.timescale.com/' },
    { title: 'InfluxDB: Get started', url: 'https://docs.influxdata.com/influxdb/v2/get-started/' },
  ],
});

registerContent('clickhouse', {
  intro: `<p><b>ClickHouse</b> — open-source <b>колоночная</b> СУБД для аналитики, созданная в Яндексе для Яндекс.Метрики. Считает агрегаты по миллиардам строк за секунды.
    Стандартный выбор для аналитики событий, логов, продуктовых метрик и отчётов.</p>`,
  theory: [
    {
      title: 'Колоночное хранение',
      html: `<p>В PostgreSQL строки хранятся целиком (row-oriented): чтобы посчитать среднее по одному столбцу, читаются все столбцы всех строк.
        В колоночной БД каждый столбец лежит отдельно: запрос <code>avg(duration)</code> читает только столбец <code>duration</code>. Значения одного столбца однотипны и отлично сжимаются (в 5–20 раз).</p>
        <table>
          <tr><th></th><th>OLTP (PostgreSQL)</th><th>OLAP (ClickHouse)</th></tr>
          <tr><td>Запросы</td><td>Много коротких: прочитать/изменить строку</td><td>Мало тяжёлых: агрегаты по миллиардам строк</td></tr>
          <tr><td>Запись</td><td>По одной строке, UPDATE и DELETE</td><td>Большими пачками, изменения редки</td></tr>
          <tr><td>Транзакции</td><td>Да</td><td>Нет</td></tr>
        </table>
        <p class="note">ClickHouse не заменяет основную БД: в ней живут транзакции приложения, а события и история копируются в ClickHouse для аналитики. Вставляйте пачками (тысячи строк), а не по одной.</p>`,
    },
  ],
  examples: [
    {
      title: 'Таблица событий и аналитика',
      lang: 'sql',
      code: String.raw`
-- docker run -d -p 8123:8123 -p 9000:9000 clickhouse/clickhouse-server
CREATE TABLE events (
    event_time  DateTime,
    user_id     UInt64,
    event       LowCardinality(String),
    page        String,
    duration_ms UInt32
) ENGINE = MergeTree
PARTITION BY toYYYYMM(event_time)
ORDER BY (event, event_time);

-- Воронка по дням и уникальные пользователи
SELECT toDate(event_time) AS day,
       uniqExact(user_id) AS users,
       countIf(event = 'signup') AS signups,
       countIf(event = 'purchase') AS purchases,
       quantile(0.95)(duration_ms) AS p95
FROM events
WHERE event_time >= now() - INTERVAL 30 DAY
GROUP BY day
ORDER BY day;`,
    },
    {
      title: 'Вставка из Python',
      lang: 'python',
      code: String.raw`
# pip install clickhouse-connect
from datetime import datetime
import clickhouse_connect

ch = clickhouse_connect.get_client(host="localhost")
rows = [(datetime.now(), 42, "page_view", "/notes", 35) for _ in range(10_000)]
ch.insert("events", rows, column_names=["event_time", "user_id", "event", "page", "duration_ms"])
print(ch.query("SELECT event, count() FROM events GROUP BY event").result_rows)`,
    },
  ],
  tasks: [
    {
      title: 'PostgreSQL против ClickHouse',
      level: 'средне',
      text: `<p>Сгенерируйте 50 млн событий и загрузите в PostgreSQL и ClickHouse. Сравните размер на диске и время запросов: число событий по дням, уникальные пользователи за месяц, p95 длительности по страницам.</p>`,
    },
  ],
  quiz: [
    { q: 'Почему колоночные СУБД быстры в аналитике?', options: ['Используют больше памяти', 'Читают только нужные столбцы и хорошо их сжимают', 'Не используют диск', 'Имеют транзакции'], answer: 1 },
    { q: 'Как правильно вставлять данные в ClickHouse?', options: ['По одной строке', 'Большими пачками', 'Через UPDATE', 'Только через Kafka'], answer: 1 },
  ],
  resources: [
    { title: 'ClickHouse: документация (рус.)', url: 'https://clickhouse.com/docs/ru' },
  ],
});

registerContent('neo4j', {
  intro: `<p><b>Графовые БД</b> хранят данные как <b>узлы</b> и <b>связи</b> между ними, причём связи — полноценные объекты со свойствами. Запросы «друзья друзей», «кратчайший путь», «кто связан с мошенником через 3 рукопожатия»
    в реляционной БД превращаются в цепочку тяжёлых JOIN, а в графовой — в естественный обход. Самая известная — <b>Neo4j</b>.</p>`,
  theory: [
    {
      title: 'Модель property graph и Cypher',
      html: `<ul>
          <li><b>Узел</b> с метками и свойствами: <code>(:User {name: "Анна"})</code>.</li>
          <li><b>Связь</b> с типом, направлением и свойствами: <code>-[:FOLLOWS {since: 2024}]-&gt;</code>.</li>
          <li>Язык <b>Cypher</b> описывает шаблоны графа «ASCII-картинками»: <code>(a)-[:FRIEND]-&gt;(b)</code>. Стандарт GQL (ISO) основан на нём.</li>
          <li>Обход связи — переход по указателю, его стоимость не зависит от размера всей базы (index-free adjacency).</li>
        </ul>
        <p>Где применяются: социальные графы и рекомендации, антифрод, графы знаний (в том числе для RAG — GraphRAG), управление доступом, логистика и маршруты, зависимости в IT-инфраструктуре.
        Другие графовые БД: Amazon Neptune, ArangoDB, Memgraph; расширение Apache AGE для PostgreSQL.</p>`,
    },
  ],
  examples: [
    {
      title: 'Рекомендации «друзья друзей»',
      lang: 'text',
      code: String.raw`
// docker run -d -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password123 neo4j:5
CREATE (a:User {name: "Анна"}), (b:User {name: "Борис"}), (v:User {name: "Вера"}), (g:User {name: "Глеб"}),
       (a)-[:FOLLOWS]->(b), (b)-[:FOLLOWS]->(v), (b)-[:FOLLOWS]->(g), (a)-[:FOLLOWS]->(v);

// Кого посоветовать Анне: на кого подписаны её подписки, но не она сама
MATCH (me:User {name: "Анна"})-[:FOLLOWS]->(:User)-[:FOLLOWS]->(rec:User)
WHERE rec <> me AND NOT (me)-[:FOLLOWS]->(rec)
RETURN rec.name, count(*) AS common
ORDER BY common DESC;

// Кратчайшая цепочка знакомств
MATCH p = shortestPath((:User {name: "Анна"})-[:FOLLOWS*..6]-(:User {name: "Глеб"}))
RETURN [n IN nodes(p) | n.name];`,
    },
    {
      title: 'Из Python',
      lang: 'python',
      code: String.raw`
# pip install neo4j
from neo4j import GraphDatabase

driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password123"))
records, _, _ = driver.execute_query(
    "MATCH (me:User {name: $name})-[:FOLLOWS]->()-[:FOLLOWS]->(rec) "
    "WHERE rec <> me AND NOT (me)-[:FOLLOWS]->(rec) RETURN DISTINCT rec.name AS name",
    name="Анна",
)
print([r["name"] for r in records])`,
      explain: `<p>Параметры передаются через <code>$name</code> — как и в SQL, никогда не собирайте Cypher-запрос из строк пользователя.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Граф и SQL',
      level: 'средне',
      text: `<p>Решите задачу «друзья друзей, на которых я не подписан» в PostgreSQL (таблица <code>follows(follower_id, followee_id)</code>) и в Neo4j. Затем усложните до «на расстоянии до 4 рукопожатий».
        Сравните читаемость запросов (подсказка для SQL — рекурсивный CTE <code>WITH RECURSIVE</code>).</p>`,
    },
  ],
  quiz: [
    { q: 'Для какой задачи графовая БД подходит лучше всего?', options: ['Бухгалтерский учёт', 'Поиск связей и путей между сущностями на нескольких уровнях', 'Хранение логов', 'Кэширование'], answer: 1 },
    { q: 'Как называется язык запросов Neo4j?', options: ['SQL', 'Cypher', 'GraphQL', 'CQL'], answer: 1 },
  ],
  resources: [
    { title: 'Neo4j: Getting started', url: 'https://neo4j.com/docs/getting-started/' },
  ],
});
