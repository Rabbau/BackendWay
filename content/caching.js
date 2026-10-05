// Раздел 9. Кэширование

registerContent('caching-intro', {
  intro: `<p><b>Кэш</b> — быстрое хранилище копий данных, которые дорого получать заново: результат тяжёлого запроса к БД, ответ внешнего API, отрисованная страница.
    Кэш — самый дешёвый способ ускорить систему в разы. И один из самых коварных: «В информатике есть две сложные вещи — инвалидация кэша и придумывание имён».</p>`,
  theory: [
    {
      title: 'Где бывает кэш',
      html: `<table>
          <tr><th>Уровень</th><th>Пример</th><th>Кто управляет</th></tr>
          <tr><td>Браузер</td><td>HTTP-кэш, Service Worker</td><td>Заголовки ответа сервера</td></tr>
          <tr><td>CDN</td><td>Cloudflare, Fastly, CloudFront — копии у пользователя «под боком»</td><td>Заголовки + настройки CDN</td></tr>
          <tr><td>Reverse proxy</td><td>Nginx, Varnish перед приложением</td><td>Конфигурация прокси</td></tr>
          <tr><td>Приложение (в памяти)</td><td><code>functools.lru_cache</code>, словарь</td><td>Код</td></tr>
          <tr><td>Распределённый кэш</td><td>Redis, Memcached — общий для всех экземпляров приложения</td><td>Код</td></tr>
          <tr><td>База данных</td><td>Буферный кэш PostgreSQL, материализованные представления</td><td>СУБД</td></tr>
        </table>
        <p>Кэш в памяти процесса самый быстрый, но у каждого экземпляра приложения он свой и пропадает при перезапуске. Когда серверов несколько — нужен общий кэш (Redis).</p>`,
    },
    {
      title: 'Стратегии работы с кэшем',
      html: `<ul>
          <li><b>Cache-aside (lazy loading)</b> — самая распространённая: читаем из кэша; если нет (<i>cache miss</i>) — читаем из БД и кладём в кэш. Приложение управляет всем само.</li>
          <li><b>Write-through</b> — при записи обновляем и БД, и кэш. Кэш всегда свежий, но каждая запись дороже.</li>
          <li><b>Write-behind (write-back)</b> — пишем в кэш, в БД — позже пачкой. Очень быстро, но риск потери данных.</li>
          <li><b>Read-through</b> — кэш сам ходит в БД при промахе (так работают некоторые библиотеки и CDN).</li>
        </ul>`,
    },
    {
      title: 'Инвалидация и TTL',
      html: `<p>Главный вопрос: когда кэш устаревает? Варианты:</p>
        <ul>
          <li><b>TTL</b> (time to live) — запись живёт N секунд. Просто и надёжно; данные могут быть устаревшими не дольше TTL.</li>
          <li><b>Явная инвалидация</b> — при изменении данных удаляем ключ. Удалять надёжнее, чем обновлять: следующее чтение само загрузит свежие данные.</li>
          <li><b>Версионирование ключей</b> — <code>user:42:v7</code>; при изменении увеличиваем версию, старые ключи вымрут по TTL.</li>
        </ul>
        <p class="note">Всегда задавайте TTL, даже при явной инвалидации, — это страховка от забытого удаления.</p>
        <p>Когда память заканчивается, кэш вытесняет записи по политике: <b>LRU</b> (давно не использованные), <b>LFU</b> (редко используемые), по TTL.</p>`,
    },
    {
      title: 'Типичные проблемы',
      html: `<ul>
          <li><b>Cache stampede</b> (лавина): популярный ключ истёк, и тысяча запросов одновременно идут в БД. Решения: блокировка на пересчёт, ранний фоновый пересчёт, случайный разброс TTL (jitter).</li>
          <li><b>Cache penetration</b>: запросы к несуществующим данным всегда проходят в БД. Решение — кэшировать и «пустой» результат на короткое время.</li>
          <li><b>Устаревшие данные</b>: решите для каждого случая, сколько секунд «несвежести» допустимо. Баланс на счёте — 0, список популярных товаров — 5 минут.</li>
          <li><b>Утечка данных</b>: персональные ответы, закэшированные по общему ключу, покажутся другому пользователю. Включайте id пользователя в ключ.</li>
        </ul>
        <p class="note">Не кэшируйте заранее «на всякий случай». Сначала измерьте, что медленно, — кэш добавляет сложность и баги.</p>`,
    },
  ],
  examples: [
    {
      title: 'Кэш в памяти процесса',
      lang: 'python',
      code: String.raw`
import time
from functools import lru_cache

@lru_cache(maxsize=1024)          # LRU-вытеснение, без TTL
def exchange_rate(currency: str) -> float:
    time.sleep(1)                 # имитация медленного внешнего API
    return {"USD": 92.5, "EUR": 100.1}[currency]

start = time.perf_counter()
exchange_rate("USD")
exchange_rate("USD")              # из кэша
print(f"{time.perf_counter() - start:.2f} с")   # ~1.00, а не 2.00
print(exchange_rate.cache_info()) # hits=1, misses=1`,
    },
    {
      title: 'Свой декоратор с TTL',
      lang: 'python',
      code: String.raw`
import time
from functools import wraps

def ttl_cache(seconds: float):
    def decorator(func):
        store: dict = {}
        @wraps(func)
        def wrapper(*args):
            now = time.monotonic()
            hit = store.get(args)
            if hit and hit[1] > now:
                return hit[0]
            value = func(*args)
            store[args] = (value, now + seconds)
            return value
        wrapper.invalidate = lambda *args: store.pop(args, None)
        return wrapper
    return decorator

@ttl_cache(seconds=60)
def get_product(product_id: int) -> dict:
    print("запрос к БД")
    return {"id": product_id, "title": "Клавиатура"}

get_product(1); get_product(1)        # «запрос к БД» один раз
get_product.invalidate(1)             # после изменения товара
get_product(1)                        # снова из БД`,
    },
  ],
  tasks: [
    {
      title: 'Что и на сколько кэшировать',
      level: 'легко',
      text: `<p>Для интернет-магазина решите, стоит ли кэшировать и с каким TTL: главная страница с подборками, карточка товара, остаток на складе, корзина пользователя,
        курс валют от ЦБ, результат поиска, баланс бонусного счёта. Обоснуйте.</p>`,
      solution: `<p>Подборки — да, минуты. Карточка товара — да, минуты + инвалидация при изменении. Остаток — осторожно: секунды для отображения, но при покупке проверять в БД.
        Корзина — не общим ключом; если кэшировать, то с id пользователя. Курс ЦБ — да, часы (меняется раз в день). Поиск — да, короткий TTL по ключу запроса. Баланс — нет или с инвалидацией при каждом изменении: устаревший баланс недопустим.</p>`,
    },
    {
      title: 'Защита от лавины',
      level: 'сложно',
      text: `<p>Доработайте <code>ttl_cache</code>, чтобы он был потокобезопасным и при истечении ключа пересчитывал значение только <b>один</b> поток, а остальные ждали результата.
        Проверьте с помощью <code>ThreadPoolExecutor</code> и 50 параллельных вызовов: функция должна выполниться один раз.</p>`,
      hint: `<p>Используйте <code>threading.Lock</code> на каждый ключ (словарь замков, защищённый общим замком) и повторную проверку кэша после захвата замка (double-checked locking).</p>`,
    },
  ],
  quiz: [
    { q: 'Как работает стратегия cache-aside?', options: ['Пишем только в кэш, в БД позже', 'Читаем из кэша, при промахе — из БД и кладём в кэш', 'Кэш сам ходит в БД', 'Кэш не используется для чтения'], answer: 1 },
    { q: 'Почему кэш в памяти процесса не подходит для нескольких серверов?', options: ['Он слишком медленный', 'У каждого сервера свой кэш, они расходятся при инвалидации', 'Python не умеет кэшировать', 'Он занимает диск'], answer: 1 },
    { q: 'Что такое cache stampede?', options: ['Переполнение памяти', 'Одновременный поток запросов в БД после истечения популярного ключа', 'Атака на кэш', 'Ошибка сериализации'], answer: 1 },
    { q: 'Что надёжнее при изменении данных?', options: ['Обновить значение в кэше', 'Удалить ключ из кэша', 'Ничего не делать', 'Перезапустить сервер'], answer: 1 },
  ],
  resources: [
    { title: 'AWS: стратегии кэширования', url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html' },
  ],
});

registerContent('http-caching', {
  intro: `<p>Лучший запрос — тот, который не дошёл до вашего сервера. <b>HTTP-кэширование</b> позволяет браузерам, CDN и прокси переиспользовать ответы.
    Управляет им сервер — с помощью заголовков ответа. Правильные заголовки снимают с бэкенда большую часть нагрузки на статику и публичные данные.</p>`,
  theory: [
    {
      title: 'Cache-Control',
      html: `<table>
          <tr><th>Директива</th><th>Смысл</th></tr>
          <tr><td><code>max-age=3600</code></td><td>Ответ свеж 3600 секунд, можно брать из кэша без запроса</td></tr>
          <tr><td><code>s-maxage=600</code></td><td>То же, но для общих кэшей (CDN, прокси)</td></tr>
          <tr><td><code>public</code></td><td>Можно хранить в общих кэшах</td></tr>
          <tr><td><code>private</code></td><td>Только в браузере пользователя (персональные данные)</td></tr>
          <tr><td><code>no-cache</code></td><td>Хранить можно, но перед использованием <b>проверять</b> у сервера</td></tr>
          <tr><td><code>no-store</code></td><td>Не хранить вообще (банковские данные)</td></tr>
          <tr><td><code>immutable</code></td><td>Не изменится никогда — не проверять даже при перезагрузке</td></tr>
          <tr><td><code>stale-while-revalidate=60</code></td><td>Можно отдать устаревшее, обновляя в фоне</td></tr>
        </table>
        <p class="note">Частая путаница: <code>no-cache</code> не означает «не кэшировать». Запрет хранения — <code>no-store</code>.</p>`,
    },
    {
      title: 'Условные запросы: ETag и Last-Modified',
      html: `<p>Когда кэш устарел, браузер не скачивает ответ заново, а спрашивает: «изменилось ли?»</p>
        <ol>
          <li>Первый ответ содержит <code>ETag: "a1b2c3"</code> (отпечаток содержимого) и/или <code>Last-Modified: дата</code>.</li>
          <li>Повторный запрос несёт <code>If-None-Match: "a1b2c3"</code> / <code>If-Modified-Since: дата</code>.</li>
          <li>Если не изменилось — сервер отвечает <code>304 Not Modified</code> <b>без тела</b>. Экономия трафика, а иногда и работы сервера.</li>
        </ol>`,
    },
    {
      title: 'Рецепты',
      html: `<ul>
          <li><b>Статика с хешем в имени</b> (<code>app.3f9a1c.js</code>): <code>Cache-Control: public, max-age=31536000, immutable</code>. Новая версия — новое имя файла (cache busting).</li>
          <li><b>HTML-страницы</b>: <code>no-cache</code> + ETag — всегда свежие, но 304 при неизменности.</li>
          <li><b>Публичные API-данные</b> (каталог): <code>public, max-age=60, s-maxage=300</code>.</li>
          <li><b>Персональные данные API</b>: <code>private, no-cache</code> или <code>no-store</code>.</li>
          <li><code>Vary: Accept-Encoding, Authorization</code> — ответ зависит от этих заголовков, кэш должен хранить отдельные версии.</li>
        </ul>
        <p>Кэшируются в основном ответы на <code>GET</code> и <code>HEAD</code>.</p>`,
    },
  ],
  examples: [
    {
      title: 'ETag и 304 в FastAPI',
      lang: 'python',
      code: String.raw`
import hashlib
import json
from fastapi import FastAPI, Request, Response

app = FastAPI()
CATALOG = [{"id": 1, "title": "Клавиатура"}, {"id": 2, "title": "Мышь"}]

@app.get("/catalog")
def catalog(request: Request):
    body = json.dumps(CATALOG, ensure_ascii=False).encode()
    etag = '"' + hashlib.sha256(body).hexdigest()[:16] + '"'
    headers = {"ETag": etag, "Cache-Control": "public, max-age=60"}

    if request.headers.get("if-none-match") == etag:
        return Response(status_code=304, headers=headers)
    return Response(body, media_type="application/json", headers=headers)`,
    },
    {
      title: 'Проверка через curl',
      lang: 'bash',
      code: String.raw`
curl -i http://127.0.0.1:8000/catalog
# HTTP/1.1 200 OK
# etag: "9f2c1a7b3e4d5f60"
# cache-control: public, max-age=60

curl -i -H 'If-None-Match: "9f2c1a7b3e4d5f60"' http://127.0.0.1:8000/catalog
# HTTP/1.1 304 Not Modified`,
    },
  ],
  tasks: [
    {
      title: 'Аудит заголовков',
      level: 'легко',
      text: `<p>Откройте любой крупный сайт с вкладкой Network. Найдите: HTML-документ, JS-файл с хешем в имени, картинку, API-запрос. Выпишите их <code>Cache-Control</code>, <code>ETag</code>, <code>Age</code>.
        Почему для них выбраны разные правила? Обновите страницу — какие запросы вернули 304 или «(memory cache)»?</p>`,
    },
    {
      title: 'Middleware кэш-заголовков',
      level: 'средне',
      text: `<p>Напишите для API заметок middleware, которое автоматически добавляет ETag ко всем успешным GET-ответам с JSON и отвечает 304 при совпадении <code>If-None-Match</code>.
        Персональные эндпоинты помечайте <code>private, no-cache</code>.</p>`,
      hint: `<p>В middleware тело ответа читается из <code>response.body_iterator</code>; соберите его, посчитайте хеш и верните новый <code>Response</code>.</p>`,
    },
  ],
  quiz: [
    { q: 'Какая директива запрещает хранить ответ где-либо?', options: ['no-cache', 'no-store', 'private', 'max-age=0'], answer: 1 },
    { q: 'Что вернёт сервер, если ETag совпал с If-None-Match?', options: ['200 с телом', '204', '304 без тела', '412'], answer: 2 },
    { q: 'Как обновлять статику с <code>max-age=31536000, immutable</code>?', options: ['Ждать год', 'Менять имя файла (хеш в имени)', 'Чистить кэш у пользователей', 'Перезапускать сервер'], answer: 1 },
    { q: 'Какой Cache-Control подходит для профиля пользователя?', options: ['public, max-age=3600', 'private, no-cache', 'immutable', 's-maxage=600'], answer: 1 },
  ],
  resources: [
    { title: 'MDN: HTTP-кэширование', url: 'https://developer.mozilla.org/ru/docs/Web/HTTP/Caching' },
    { title: 'web.dev: Love your cache', url: 'https://web.dev/articles/http-cache' },
  ],
});

registerContent('redis', {
  intro: `<p><b>Redis</b> — сверхбыстрое хранилище «ключ-значение» в оперативной памяти: сотни тысяч операций в секунду с задержкой меньше миллисекунды.
    Его называют швейцарским ножом бэкенда: кэш, сессии, счётчики, лимиты запросов, очереди задач, блокировки, рейтинги, pub/sub.</p>`,
  theory: [
    {
      title: 'Структуры данных',
      html: `<table>
          <tr><th>Тип</th><th>Команды</th><th>Применение</th></tr>
          <tr><td><b>String</b></td><td><code>SET</code>, <code>GET</code>, <code>INCR</code>, <code>SETEX</code></td><td>Кэш, счётчики, флаги</td></tr>
          <tr><td><b>Hash</b></td><td><code>HSET</code>, <code>HGETALL</code></td><td>Объект с полями (профиль, корзина)</td></tr>
          <tr><td><b>List</b></td><td><code>LPUSH</code>, <code>RPOP</code>, <code>BRPOP</code></td><td>Очереди, лента последних событий</td></tr>
          <tr><td><b>Set</b></td><td><code>SADD</code>, <code>SISMEMBER</code>, <code>SINTER</code></td><td>Уникальные значения, теги, «кто онлайн»</td></tr>
          <tr><td><b>Sorted Set</b></td><td><code>ZADD</code>, <code>ZRANGE</code>, <code>ZINCRBY</code></td><td>Рейтинги, лидерборды, отложенные задачи</td></tr>
          <tr><td><b>Stream</b></td><td><code>XADD</code>, <code>XREADGROUP</code></td><td>Журнал событий, очереди с подтверждением</td></tr>
        </table>
        <p>У любого ключа можно задать срок жизни: <code>EXPIRE key 60</code>, <code>TTL key</code>.</p>`,
    },
    {
      title: 'Почему Redis быстрый',
      html: `<ul>
          <li>Данные в оперативной памяти.</li>
          <li>Команды выполняются в одном потоке по очереди — поэтому каждая команда <b>атомарна</b> (<code>INCR</code> безопасен при параллельных клиентах без блокировок).</li>
          <li>Простой протокол, конвейеризация (pipeline) — много команд за один сетевой круг.</li>
        </ul>
        <p class="note">Однопоточность означает: одна медленная команда (<code>KEYS *</code> на миллионе ключей) блокирует всех. В продакшене используйте <code>SCAN</code> вместо <code>KEYS</code>.</p>`,
    },
    {
      title: 'Надёжность',
      html: `<ul>
          <li><b>RDB</b> — периодические снимки на диск; <b>AOF</b> — журнал всех команд. Без них при перезапуске данные пропадут.</li>
          <li><b>Репликация</b> и <b>Sentinel</b> — автоматическое переключение на реплику; <b>Redis Cluster</b> — шардирование данных.</li>
          <li><code>maxmemory</code> + <code>maxmemory-policy allkeys-lru</code> — поведение при заполнении памяти для кэша.</li>
        </ul>
        <p>Для кэша потеря данных не страшна. Если Redis — единственное место хранения важных данных, нужны AOF и реплики.
        Совместимые альтернативы: <b>Valkey</b> (open-source форк), KeyDB, Dragonfly.</p>`,
    },
  ],
  examples: [
    {
      title: 'Запуск и redis-cli',
      lang: 'bash',
      code: String.raw`
docker run --name redis -p 6379:6379 -d redis:7
docker exec -it redis redis-cli

127.0.0.1:6379> SET greeting "привет" EX 60
OK
127.0.0.1:6379> GET greeting
"\xd0\xbf..."
127.0.0.1:6379> TTL greeting
(integer) 57
127.0.0.1:6379> INCR page:views
(integer) 1
127.0.0.1:6379> ZADD leaderboard 150 anna 90 boris 210 vera
127.0.0.1:6379> ZREVRANGE leaderboard 0 2 WITHSCORES`,
    },
    {
      title: 'Cache-aside с Redis',
      lang: 'python',
      code: String.raw`
# pip install redis
import json
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

def get_product(product_id: int) -> dict | None:
    key = f"product:{product_id}"
    cached = r.get(key)
    if cached is not None:
        return json.loads(cached)

    product = load_product_from_db(product_id)          # медленно
    # кэшируем и «не найдено», но коротко — защита от cache penetration
    r.set(key, json.dumps(product, ensure_ascii=False), ex=300 if product else 30)
    return product

def update_product(product_id: int, data: dict) -> None:
    save_product_to_db(product_id, data)
    r.delete(f"product:{product_id}")                   # инвалидация`,
    },
    {
      title: 'Ограничение частоты запросов',
      lang: 'python',
      code: String.raw`
import time

def allow_request(user_id: int, limit: int = 100, window: int = 60) -> bool:
    """Не больше limit запросов за окно window секунд (fixed window)."""
    key = f"rate:{user_id}:{int(time.time()) // window}"
    pipe = r.pipeline()
    pipe.incr(key)
    pipe.expire(key, window)
    count, _ = pipe.execute()        # две команды за один сетевой круг
    return count <= limit

# В FastAPI: если not allow_request(...) -> HTTPException(429, headers={"Retry-After": "60"})`,
    },
  ],
  tasks: [
    {
      title: 'Кэш для API заметок',
      level: 'средне',
      text: `<p>Добавьте в API заметок кэширование <code>GET /notes/{id}</code> в Redis (TTL 5 минут) с инвалидацией при изменении и удалении. Добавьте заголовок <code>X-Cache: HIT/MISS</code>
        и замерьте время ответа с кэшем и без. Что произойдёт с приложением, если остановить Redis? Сделайте так, чтобы оно продолжало работать без кэша.</p>`,
      hint: `<p>Оберните обращения к Redis в <code>try/except redis.RedisError</code> и при ошибке идите напрямую в БД — кэш не должен становиться точкой отказа.</p>`,
    },
    {
      title: 'Лидерборд',
      level: 'средне',
      text: `<p>На Sorted Set реализуйте функции: <code>add_points(user, points)</code>, <code>top(n)</code>, <code>rank(user)</code> (место пользователя, начиная с 1) и <code>around(user, k)</code> — k соседей сверху и снизу.</p>`,
      solutionCode: String.raw`
KEY = "leaderboard"

def add_points(user: str, points: int) -> None:
    r.zincrby(KEY, points, user)

def top(n: int = 10) -> list[tuple[str, float]]:
    return r.zrevrange(KEY, 0, n - 1, withscores=True)

def rank(user: str) -> int | None:
    pos = r.zrevrank(KEY, user)
    return None if pos is None else pos + 1

def around(user: str, k: int = 2) -> list[tuple[str, float]]:
    pos = r.zrevrank(KEY, user)
    if pos is None:
        return []
    return r.zrevrange(KEY, max(pos - k, 0), pos + k, withscores=True)`,
    },
    {
      title: 'Распределённая блокировка',
      level: 'сложно',
      text: `<p>Несколько экземпляров приложения раз в минуту запускают задачу «разослать письма». Сделайте так, чтобы она выполнялась только одним из них:
        <code>SET lock:mailing &lt;uuid&gt; NX EX 60</code>. Почему удалять блокировку нужно, только проверив, что значение — ваш uuid? Как сделать проверку и удаление атомарно?</p>`,
      solution: `<p>Если задача работала дольше TTL, блокировка истекла и её взял другой экземпляр; удалив её без проверки, вы снимете чужую блокировку. Проверка и удаление должны быть атомарными —
        через Lua-скрипт (<code>if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) end</code>) или через встроенный <code>r.lock()</code> в redis-py.</p>`,
    },
  ],
  quiz: [
    { q: 'Почему <code>INCR</code> в Redis безопасен при параллельных клиентах?', options: ['Использует транзакции SQL', 'Команды выполняются по одной в одном потоке — атомарно', 'Redis блокирует ключ на секунду', 'Не безопасен'], answer: 1 },
    { q: 'Какая структура подойдёт для таблицы рекордов?', options: ['List', 'Set', 'Sorted Set', 'String'], answer: 2 },
    { q: 'Почему в продакшене не используют <code>KEYS *</code>?', options: ['Команда удалена', 'Блокирует однопоточный Redis на время перебора всех ключей', 'Возвращает только 10 ключей', 'Требует пароль'], answer: 1 },
    { q: 'Что должно происходить с приложением, если кэш-Redis упал?', options: ['Падать с 500', 'Продолжать работать, читая из БД', 'Перезапускаться', 'Отдавать пустые ответы'], answer: 1 },
  ],
  resources: [
    { title: 'Redis: документация по типам данных', url: 'https://redis.io/docs/latest/develop/data-types/' },
    { title: 'Try Redis — интерактивный учебник', url: 'https://redis.io/try-free/' },
  ],
});

registerContent('memcached', {
  intro: `<p><b>Memcached</b> — простой распределённый кэш в памяти, предшественник Redis (2003 год). Хранит только строки по ключу, не сохраняет данные на диск,
    зато очень прост и эффективно использует много ядер. До сих пор работает в Facebook, Wikipedia и многих legacy-системах.</p>`,
  theory: [
    {
      title: 'Memcached vs Redis',
      html: `<table>
          <tr><th></th><th>Memcached</th><th>Redis</th></tr>
          <tr><td>Типы данных</td><td>Только строки (до 1 МБ по умолчанию)</td><td>Строки, хеши, списки, множества, потоки...</td></tr>
          <tr><td>Сохранение на диск</td><td>Нет</td><td>RDB / AOF</td></tr>
          <tr><td>Потоки</td><td>Многопоточный</td><td>Команды в одном потоке</td></tr>
          <tr><td>Распределение</td><td>Клиент сам выбирает сервер (consistent hashing)</td><td>Redis Cluster, репликация</td></tr>
          <tr><td>Применение</td><td>Только кэш</td><td>Кэш и многое другое</td></tr>
        </table>
        <p>Для нового проекта почти всегда берут Redis. Memcached уместен, когда нужен только простой кэш огромного объёма на многоядерных машинах.</p>`,
    },
  ],
  examples: [
    {
      title: 'Работа из Python',
      lang: 'python',
      code: String.raw`
# docker run -p 11211:11211 -d memcached
# pip install pymemcache
from pymemcache.client.base import Client

mc = Client(("localhost", 11211))
mc.set("product:1", '{"title": "Клавиатура"}', expire=300)
print(mc.get("product:1"))   # b'{"title": ...}' — байты
mc.delete("product:1")`,
    },
  ],
  tasks: [
    {
      title: 'Кэш с двумя бэкендами',
      level: 'средне',
      text: `<p>Опишите интерфейс <code>Cache</code> (абстрактный класс с методами <code>get</code>, <code>set(key, value, ttl)</code>, <code>delete</code>) и две реализации — на Redis и на Memcached.
        Переключайте реализацию переменной окружения <code>CACHE_BACKEND</code>. Так код приложения не зависит от конкретного кэша.</p>`,
    },
  ],
  quiz: [
    { q: 'Какие данные хранит Memcached?', options: ['Только строки (байты) по ключу', 'Таблицы', 'Документы JSON с индексами', 'Графы'], answer: 0 },
    { q: 'Что будет с данными Memcached после перезапуска?', options: ['Восстановятся с диска', 'Пропадут', 'Загрузятся из реплики', 'Сохранятся в RDB'], answer: 1 },
  ],
  resources: [
    { title: 'Memcached Wiki', url: 'https://github.com/memcached/memcached/wiki' },
  ],
});
