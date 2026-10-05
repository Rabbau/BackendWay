// Раздел: Построение систем под нагрузкой

registerContent('scaling', {
  intro: `<p><b>Масштабирование</b> — способность системы обслуживать растущую нагрузку. Есть два пути: сделать сервер мощнее (<b>вертикально</b>) или добавить серверов (<b>горизонтально</b>).
    Большая часть того, что вы изучили — 12 факторов, Redis для сессий, балансировка в Nginx, Kubernetes, реплики — нужна именно для горизонтального масштабирования.</p>`,
  theory: [
    {
      title: 'Вертикальное и горизонтальное',
      html: `<table>
          <tr><th></th><th>Вертикальное (scale up)</th><th>Горизонтальное (scale out)</th></tr>
          <tr><td>Как</td><td>Больше CPU, RAM, быстрее диск</td><td>Больше одинаковых серверов за балансировщиком</td></tr>
          <tr><td>Изменения в коде</td><td>Не нужны</td><td>Приложение должно быть stateless</td></tr>
          <tr><td>Предел</td><td>Самый мощный сервер; цена растёт нелинейно</td><td>Практически нет</td></tr>
          <tr><td>Отказоустойчивость</td><td>Один сервер — одна точка отказа</td><td>Отказ одного узла не роняет систему</td></tr>
          <tr><td>Подходит для</td><td>БД, быстрый старт</td><td>Stateless-сервисы: API, воркеры</td></tr>
        </table>
        <p>На практике сочетают: приложения — горизонтально (это дёшево и просто), базу данных — сначала вертикально, затем реплики и, если совсем нужно, шардирование.</p>`,
    },
    {
      title: 'Балансировка нагрузки',
      html: `<ul>
          <li><b>L4</b> (TCP) — быстрый, не смотрит в содержимое; <b>L7</b> (HTTP) — маршрутизация по пути, заголовкам, cookie.</li>
          <li>Алгоритмы: round-robin, least connections, взвешенный, по хешу (липкие сессии — лучше избегать, храните состояние снаружи).</li>
          <li><b>Health checks</b>: балансировщик исключает нездоровые узлы.</li>
          <li><b>Автомасштабирование</b>: число экземпляров меняется по CPU, RPS или длине очереди (HPA в Kubernetes, группы автомасштабирования в облаке).</li>
        </ul>`,
    },
    {
      title: 'Как искать узкое место',
      html: `<p>Масштабировать вслепую бесполезно: если тормозит база, десять копий API только увеличат на неё нагрузку. Порядок:</p>
        <ol>
          <li>Нагрузочный тест (Locust, k6) и метрики: RPS, задержки (p50/p95/p99), ошибки, загрузка CPU/памяти/соединений.</li>
          <li>Найти ресурс, который упирается первым: CPU приложения, соединения к БД, медленный запрос, внешний API.</li>
          <li>Устранить, повторить замер.</li>
        </ol>
        <p><b>Закон Амдала</b>: ускорение ограничено частью, которая не распараллеливается. Если 30% времени запроса — последовательная работа с одной БД, даже бесконечное число серверов приложений ускорит не больше чем в ~3 раза.</p>
        <p class="note">Python-нюанс: из-за GIL один процесс использует одно ядро для Python-кода. Запускайте несколько воркеров (<code>uvicorn --workers 4</code>, Gunicorn с uvicorn-воркерами) или несколько контейнеров. Для I/O-нагрузки используйте <code>async</code>.</p>`,
    },
  ],
  examples: [
    {
      title: 'Нагрузочный тест k6',
      lang: 'javascript',
      code: String.raw`
// k6 run load.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 50 },    // разгон до 50 виртуальных пользователей
    { duration: "3m", target: 200 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<300"],  // тест провален, если p95 > 300 мс
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get("http://localhost:8000/notes?page=1");
  check(res, { "status 200": (r) => r.status === 200 });
  sleep(1);
}`,
    },
    {
      title: 'Автомасштабирование в Kubernetes',
      lang: 'yaml',
      code: String.raw`
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: notes-api
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: notes-api }
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target: { type: Utilization, averageUtilization: 70 }`,
    },
  ],
  tasks: [
    {
      title: 'Масштабируйте и измерьте',
      level: 'средне',
      text: `<p>Запустите API заметок за Nginx с 1, 2 и 4 копиями приложения (и <code>--workers</code>) и прогоните одинаковый k6-тест. Постройте график «RPS и p95 от числа копий». Где рост прекращается и почему?
        Посмотрите на загрузку PostgreSQL и число соединений.</p>`,
      hint: `<p>Часто упираются в число соединений к БД: 4 копии × 4 воркера × пул 10 = 160 соединений. Решение — PgBouncer или уменьшение пулов.</p>`,
    },
  ],
  quiz: [
    { q: 'Что нужно приложению для горизонтального масштабирования?', options: ['Больше RAM', 'Не хранить состояние в памяти процесса', 'Новый язык', 'Монолит'], answer: 1 },
    { q: 'Почему добавление копий API может не помочь?', options: ['Копии конфликтуют', 'Узкое место может быть в другом месте, например в БД', 'Nginx не умеет балансировать', 'Python не масштабируется вовсе'], answer: 1 },
    { q: 'Как обойти GIL для CPU-нагрузки в Python-сервере?', options: ['Потоки', 'Несколько процессов-воркеров или контейнеров', 'async', 'Никак'], answer: 1 },
  ],
  resources: [
    { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' },
    { title: 'k6: документация', url: 'https://grafana.com/docs/k6/latest/' },
  ],
});

registerContent('graceful-degradation', {
  intro: `<p>В сложной системе всегда что-то сломано: внешний сервис рекомендаций, поисковый кластер, сервис отзывов. <b>Graceful degradation</b> (постепенная деградация) — проектирование так,
    чтобы при отказе части система <b>работала хуже, но работала</b>, а не падала целиком. Карточка товара без блока «похожие товары» лучше, чем страница с ошибкой 500.</p>`,
  theory: [
    {
      title: 'Критичное и некритичное',
      html: `<p>Начните с классификации зависимостей для каждой функции:</p>
        <ul>
          <li><b>Критичные</b>: без них функция невозможна (оплата без платёжного шлюза). Честная ошибка 503.</li>
          <li><b>Некритичные</b>: улучшают опыт, но не обязательны (рекомендации, счётчик просмотров, аватарки, персонализация). Их отказ не должен ронять основной сценарий.</li>
        </ul>
        <p>Приёмы деградации:</p>
        <ul>
          <li><b>Fallback-значения</b>: популярные товары вместо персональных рекомендаций, пустой блок вместо ошибки.</li>
          <li><b>Устаревшие данные из кэша</b> (stale-if-error): лучше вчерашний курс валют, чем никакого.</li>
          <li><b>Отложенная обработка</b>: письмо не отправилось — положить в очередь и повторить позже.</li>
          <li><b>Режим только для чтения</b>: при проблемах с основной БД — показывать данные с реплики, временно запретив изменения.</li>
          <li><b>Feature flags / kill switch</b>: вручную отключить тяжёлую функцию при перегрузке.</li>
          <li><b>Load shedding</b>: при перегрузке отбрасывать менее важные запросы (аналитику, ботов) ради важных (оформление заказа).</li>
        </ul>`,
    },
    {
      title: 'Обязательные условия',
      html: `<ul>
          <li><b>Таймауты</b> на всё — иначе медленная зависимость не «упадёт», а повесит всё приложение.</li>
          <li><b>Изоляция</b> (bulkhead, «переборки»): отдельные пулы соединений/потоков для разных зависимостей, чтобы зависание одной не съело все ресурсы.</li>
          <li><b>Параллельные независимые вызовы</b> — общее время = самая медленная часть, а не сумма.</li>
          <li><b>Наблюдаемость</b>: деградация должна быть видна в метриках и алертах, а не проходить молча.</li>
          <li><b>Проверка</b>: chaos engineering — специально отключать зависимости на тестовом стенде (Netflix Chaos Monkey).</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'Карточка товара с деградацией',
      lang: 'python',
      code: String.raw`
import asyncio
import logging
import httpx

log = logging.getLogger("product")
client = httpx.AsyncClient(timeout=0.3)          # некритичным сервисам — короткий таймаут

async def fetch_or_default(url: str, default, name: str):
    try:
        r = await client.get(url)
        r.raise_for_status()
        return r.json()
    except (httpx.HTTPError, ValueError) as e:
        log.warning("degraded: %s недоступен: %s", name, e)   # метрика/лог, чтобы видеть деградацию
        return default

@app.get("/products/{pid}")
async def product_page(pid: int):
    product = await get_product_from_db(pid)                  # критично: без него — 404/503
    reviews, recs, stock = await asyncio.gather(              # некритичное — параллельно
        fetch_or_default(f"http://reviews/products/{pid}/summary", {"rating": None, "count": 0}, "reviews"),
        fetch_or_default(f"http://recs/similar/{pid}", [], "recommendations"),
        fetch_or_default(f"http://inventory/stock/{pid}", {"status": "unknown"}, "inventory"),
    )
    return {"product": product, "reviews": reviews, "similar": recs, "stock": stock}`,
      explain: `<p>Если сервис отзывов лежит, страница отдаётся за ~300 мс без рейтинга. Без таймаута и fallback она бы висела или падала с 500.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Карта зависимостей',
      level: 'легко',
      text: `<p>Для страницы ленты в соцсети перечислите зависимости (посты, авторы, лайки, комментарии, реклама, рекомендации, онлайн-статус друзей) и для каждой: критична ли она и что показывать при её отказе.</p>`,
    },
    {
      title: 'Деградация в API заметок',
      level: 'средне',
      text: `<p>Сделайте так, чтобы при недоступности Redis (кэш), Elasticsearch (поиск) и сервиса уведомлений API заметок продолжал работать: без кэша — из БД, поиск — через полнотекстовый поиск PostgreSQL, уведомления — в очередь на потом.
        Проверьте, останавливая контейнеры по одному. Добавьте в <code>/health</code> поле <code>degraded</code> со списком недоступных зависимостей.</p>`,
    },
  ],
  quiz: [
    { q: 'Что такое graceful degradation?', options: ['Плавное выключение сервера', 'Продолжение работы с ограниченной функциональностью при отказе части системы', 'Удаление старого кода', 'Ухудшение качества картинок'], answer: 1 },
    { q: 'Без чего деградация не сработает?', options: ['Без Kubernetes', 'Без таймаутов на вызовы зависимостей', 'Без GraphQL', 'Без шардирования'], answer: 1 },
    { q: 'Что такое bulkhead?', options: ['Тип БД', 'Изоляция ресурсов разных зависимостей, чтобы сбой одной не исчерпал все', 'Балансировщик', 'Формат логов'], answer: 1 },
  ],
  resources: [
    { title: 'AWS Well-Architected: Reliability', url: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html' },
    { title: 'Netflix: Chaos Engineering', url: 'https://netflix.github.io/chaosmonkey/' },
  ],
});

registerContent('throttling', {
  intro: `<p><b>Rate limiting</b> (ограничение частоты запросов) защищает API от перегрузки, злоупотреблений и атак: подбора паролей, парсинга, «шумных» клиентов, которые съедают ресурсы остальных.
    Превысивший лимит получает <code>429 Too Many Requests</code>. Вы уже делали простой лимит на Redis — здесь об алгоритмах и практике.</p>`,
  theory: [
    {
      title: 'Алгоритмы',
      html: `<table>
          <tr><th>Алгоритм</th><th>Как работает</th><th>Особенности</th></tr>
          <tr><td><b>Fixed window</b></td><td>Счётчик на минуту: 100 запросов с 12:00:00 до 12:00:59</td><td>Просто; на стыке окон возможен двойной всплеск (100 в 12:00:59 + 100 в 12:01:00)</td></tr>
          <tr><td><b>Sliding window log</b></td><td>Храним время каждого запроса, считаем за последние 60 с</td><td>Точно, но много памяти</td></tr>
          <tr><td><b>Sliding window counter</b></td><td>Взвешенная сумма текущего и прошлого окна</td><td>Хороший компромисс</td></tr>
          <tr><td><b>Token bucket</b></td><td>Ведро на N токенов пополняется со скоростью r/с, запрос забирает токен</td><td>Разрешает короткие всплески до N; самый популярный</td></tr>
          <tr><td><b>Leaky bucket</b></td><td>Очередь, из которой запросы вытекают с постоянной скоростью</td><td>Сглаживает поток</td></tr>
        </table>`,
    },
    {
      title: 'Практика',
      html: `<ul>
          <li><b>По чему лимитировать</b>: API-ключ или пользователь (честнее всего), IP (для анонимных, но за одним NAT много людей), эндпоинт (вход — строже, чтение — мягче).</li>
          <li><b>Где</b>: на шлюзе/Nginx (дёшево отсекать до приложения) и в приложении (сложная логика: тарифы, лимиты по пользователю). При нескольких копиях — общий счётчик в Redis.</li>
          <li><b>Ответ</b>: <code>429</code> + <code>Retry-After</code>; информативные заголовки <code>RateLimit-Limit</code>, <code>RateLimit-Remaining</code>, <code>RateLimit-Reset</code>.</li>
          <li><b>Клиентам</b> — повторять с экспоненциальной задержкой и случайным разбросом (jitter), уважать Retry-After.</li>
          <li>Лимиты — часть тарифов коммерческих API (бесплатный план: 60 запросов/мин).</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'Token bucket на Redis (атомарно через Lua)',
      lang: 'python',
      code: String.raw`
import time
import redis

r = redis.Redis()

TOKEN_BUCKET = r.register_script("""
local key, capacity, rate, now = KEYS[1], tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3])
local data = redis.call('HMGET', key, 'tokens', 'ts')
local tokens = tonumber(data[1]) or capacity
local ts = tonumber(data[2]) or now
tokens = math.min(capacity, tokens + (now - ts) * rate)     -- пополняем за прошедшее время
local allowed = 0
if tokens >= 1 then tokens = tokens - 1; allowed = 1 end
redis.call('HSET', key, 'tokens', tokens, 'ts', now)
redis.call('EXPIRE', key, math.ceil(capacity / rate) * 2)
return {allowed, math.floor(tokens)}
""")

def allow(client_id: str, capacity: int = 20, rate: float = 5.0) -> tuple[bool, int]:
    """До 20 запросов всплеском, в среднем 5 в секунду."""
    allowed, remaining = TOKEN_BUCKET(keys=[f"tb:{client_id}"], args=[capacity, rate, time.time()])
    return bool(allowed), remaining`,
      explain: `<p>Lua-скрипт выполняется в Redis атомарно — две копии приложения не «перепишут» состояние ведра одновременно.</p>`,
    },
    {
      title: 'Зависимость FastAPI',
      lang: 'python',
      code: String.raw`
from fastapi import Depends, HTTPException, Request, Response

def rate_limit(capacity: int, rate: float):
    def dependency(request: Request, response: Response, user=Depends(current_user_optional)):
        key = f"user:{user.id}" if user else f"ip:{request.client.host}"
        ok, remaining = allow(key + ":" + request.url.path, capacity, rate)
        response.headers["RateLimit-Remaining"] = str(remaining)
        if not ok:
            raise HTTPException(429, "Слишком много запросов", headers={"Retry-After": str(int(1 / rate) + 1)})
    return dependency

@app.post("/auth/token", dependencies=[Depends(rate_limit(capacity=5, rate=0.1))])   # 5 попыток, затем 1 в 10 с
def login(form: OAuth2PasswordRequestForm = Depends()):
    ...`,
    },
  ],
  tasks: [
    {
      title: 'Сравните алгоритмы',
      level: 'средне',
      text: `<p>Реализуйте в памяти fixed window и token bucket (лимит 10 запросов / 10 с). Сымитируйте поток: 10 запросов в 9.9 с и 10 запросов в 10.1 с. Сколько пропустит каждый алгоритм за эти 0.2 секунды? Объясните результат.</p>`,
      solution: `<p>Fixed window пропустит все 20 — это разные окна. Token bucket с ёмкостью 10 и скоростью 1/с пропустит 10 и ещё ~0 (за 0.2 с успеет накопиться 0.2 токена) — всплеск ограничен ёмкостью ведра.</p>`,
    },
    {
      title: 'Лимиты для API заметок',
      level: 'средне',
      text: `<p>Добавьте лимиты: вход — 5 попыток в минуту на IP+email; создание заметок — 30 в минуту на пользователя; чтение — 300 в минуту. Напишите функциональный тест, проверяющий 429 и заголовок <code>Retry-After</code>.</p>`,
    },
  ],
  quiz: [
    { q: 'Какой статус возвращают при превышении лимита?', options: ['403', '429', '503', '400'], answer: 1 },
    { q: 'Чем token bucket удобнее fixed window?', options: ['Не требует памяти', 'Разрешает контролируемые всплески и нет двойного всплеска на стыке окон', 'Работает без Redis', 'Не нужен ключ клиента'], answer: 1 },
    { q: 'Почему при нескольких копиях API счётчик хранят в Redis?', options: ['Redis быстрее Python', 'Иначе у каждой копии свой счётчик и лимит фактически умножается', 'Так требует HTTP', 'Для логов'], answer: 1 },
  ],
  resources: [
    { title: 'Cloudflare: что такое rate limiting', url: 'https://www.cloudflare.com/learning/bots/what-is-rate-limiting/' },
    { title: 'Stripe: стратегии rate limiting', url: 'https://stripe.com/blog/rate-limiters' },
  ],
});

registerContent('backpressure', {
  intro: `<p><b>Backpressure</b> (обратное давление) — механизм, при котором медленный потребитель сообщает быстрому производителю «притормози». Без него буферы и очереди растут
    бесконечно, память заканчивается, задержки растут до минут, и система падает. Это одна из главных причин каскадных отказов под нагрузкой.</p>`,
  theory: [
    {
      title: 'Откуда берётся проблема',
      html: `<p>Если данные поступают быстрее, чем обрабатываются, есть всего три варианта:</p>
        <ol>
          <li><b>Буферизовать</b> — копить в очереди. Работает только для временных пиков; при постоянном превышении очередь растёт бесконечно.</li>
          <li><b>Отбрасывать</b> (load shedding) — отказывать части запросов (503, 429) или терять неважные данные (сэмплирование метрик).</li>
          <li><b>Замедлять источник</b> — backpressure: производитель блокируется или получает сигнал ждать.</li>
        </ol>
        <p>Неограниченная очередь — это не решение, а отложенная авария: запрос, ждущий 2 минуты в очереди, клиенту уже не нужен (он ушёл по таймауту), но сервер всё равно потратит на него ресурсы.</p>`,
    },
    {
      title: 'Механизмы',
      html: `<ul>
          <li><b>Ограниченные очереди</b>: <code>asyncio.Queue(maxsize=100)</code> — <code>put</code> ждёт, пока появится место.</li>
          <li><b>Ограничение параллелизма</b>: семафор на число одновременных запросов к БД/внешнему API.</li>
          <li><b>TCP</b> сам реализует backpressure через окно приёма — поэтому стриминг больших ответов не переполняет память, если читать поток постепенно.</li>
          <li><b>Брокеры</b>: prefetch в RabbitMQ, pull-модель Kafka (потребитель сам берёт, сколько может) — встроенный backpressure. Следите за <b>лагом</b> потребителей.</li>
          <li><b>Отбрасывание по сроку</b>: если запрос пролежал в очереди дольше, чем клиент готов ждать, — не обрабатывать.</li>
          <li><b>Адаптивные лимиты</b> параллелизма по измеряемой задержке.</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'Ограниченная очередь между производителем и потребителем',
      lang: 'python',
      code: String.raw`
import asyncio
import time

async def producer(q: asyncio.Queue):
    for i in range(20):
        start = time.perf_counter()
        await q.put(i)                     # блокируется, когда очередь полна — это и есть backpressure
        waited = time.perf_counter() - start
        print(f"→ положил {i}" + (f" (ждал {waited:.1f} с)" if waited > 0.05 else ""))
        await asyncio.sleep(0.05)          # производитель быстрый: 20/с

async def consumer(q: asyncio.Queue):
    while True:
        item = await q.get()
        await asyncio.sleep(0.3)           # потребитель медленный: ~3/с
        q.task_done()

async def main():
    q = asyncio.Queue(maxsize=5)           # без maxsize очередь росла бы бесконечно
    workers = [asyncio.create_task(consumer(q)) for _ in range(2)]
    await producer(q)
    await q.join()
    for w in workers:
        w.cancel()

asyncio.run(main())`,
    },
    {
      title: 'Семафор и быстрый отказ при перегрузке',
      lang: 'python',
      code: String.raw`
import asyncio
from fastapi import HTTPException

report_slots = asyncio.Semaphore(4)       # не больше 4 тяжёлых отчётов одновременно

@app.get("/reports/yearly")
async def yearly_report():
    try:
        await asyncio.wait_for(report_slots.acquire(), timeout=0.5)   # ждём место недолго
    except asyncio.TimeoutError:
        raise HTTPException(503, "Сервер перегружен, попробуйте позже", headers={"Retry-After": "10"})
    try:
        return await build_report()
    finally:
        report_slots.release()`,
    },
  ],
  tasks: [
    {
      title: 'Без ограничения',
      level: 'легко',
      text: `<p>Запустите первый пример с <code>asyncio.Queue()</code> без <code>maxsize</code> и 10 000 элементов. Как меняется размер очереди и «возраст» последнего элемента, когда его наконец обрабатывают? Сравните с <code>maxsize=5</code>.</p>`,
    },
    {
      title: 'Защита эндпоинта экспорта',
      level: 'средне',
      text: `<p>Эндпоинт экспорта всех заметок в CSV тяжёлый. Ограничьте число одновременных экспортов семафором, отдавайте ответ стримингом (чтобы не держать весь файл в памяти) и проверьте Locust'ом, что при 100 одновременных запросах сервер не падает, а лишние получают 503.</p>`,
    },
  ],
  quiz: [
    { q: 'Что такое backpressure?', options: ['Сжатие данных', 'Сигнал от медленного потребителя производителю замедлиться', 'Тип балансировки', 'Резервное копирование'], answer: 1 },
    { q: 'Почему неограниченная очередь опасна?', options: ['Она медленная', 'При постоянной перегрузке растёт бесконечно: память и задержки', 'Её нельзя мониторить', 'Она теряет данные'], answer: 1 },
    { q: 'Как поведёт себя <code>await q.put()</code> у полной <code>asyncio.Queue(maxsize=5)</code>?', options: ['Выбросит исключение', 'Дождётся свободного места', 'Перезапишет старый элемент', 'Увеличит размер'], answer: 1 },
  ],
  resources: [
    { title: 'Backpressure explained', url: 'https://medium.com/@jayphelps/backpressure-explained-the-flow-of-data-through-software-2350b3e77ce7' },
  ],
});

registerContent('loadshifting', {
  intro: `<p><b>Load shifting</b> — перенос нагрузки во времени: работа, которую не обязательно делать прямо сейчас, откладывается на момент, когда ресурсов больше или они дешевле.
    Вместо того чтобы покупать серверы под пиковую нагрузку, пик «размазывается».</p>`,
  theory: [
    {
      title: 'Приёмы',
      html: `<ul>
          <li><b>Очереди и фоновые воркеры</b> (тема RabbitMQ): запрос принимается мгновенно, обработка — в темпе воркеров. Пик 10 000 заказов за минуту распределяется на 10 минут.</li>
          <li><b>Пакетная обработка</b> (batch): пересчёт рейтингов, рассылки, отчёты, переиндексация — ночью или в часы низкой нагрузки (cron, Celery beat, Kubernetes CronJob).</li>
          <li><b>Предварительные вычисления</b>: построить отчёт или «прогреть» кэш заранее, а не во время запроса пользователя.</li>
          <li><b>Асинхронный API</b>: <code>POST /exports</code> → <code>202 Accepted</code> + адрес для проверки статуса; результат — по готовности (polling, SSE, вебхук, письмо).</li>
          <li><b>Дешёвые ресурсы</b>: spot/preemptible-инстансы облаков для фоновых задач, которые можно прервать.</li>
          <li><b>Разнос по времени</b>: добавить случайный разброс (jitter) к расписанию, чтобы тысячи клиентов не запускали синхронизацию ровно в 00:00.</li>
        </ul>
        <p class="note">Отложенная работа должна быть идемпотентной и переживать перезапуски: задачи хранятся в брокере или БД, а не в памяти процесса.</p>`,
    },
  ],
  examples: [
    {
      title: 'Асинхронный API: 202 Accepted',
      lang: 'python',
      code: String.raw`
import uuid
from fastapi import BackgroundTasks, status

jobs: dict[str, dict] = {}      # в продакшене — таблица в БД, а задача — в Celery/RabbitMQ

@app.post("/exports", status_code=status.HTTP_202_ACCEPTED)
def create_export(response: Response, user=Depends(current_user)):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "queued", "user_id": user.id}
    send_to_queue("exports", {"job_id": job_id, "user_id": user.id})
    response.headers["Location"] = f"/exports/{job_id}"
    return {"job_id": job_id, "status": "queued"}

@app.get("/exports/{job_id}")
def export_status(job_id: str, user=Depends(current_user)):
    job = jobs.get(job_id)
    if not job or job["user_id"] != user.id:
        raise HTTPException(404)
    return job      # {"status": "done", "url": "https://.../export.csv"} когда готово`,
    },
    {
      title: 'Задачи по расписанию в Celery beat',
      lang: 'python',
      code: String.raw`
from celery import Celery
from celery.schedules import crontab

app = Celery("notes", broker="amqp://localhost")

app.conf.beat_schedule = {
    "nightly-stats": {
        "task": "tasks.rebuild_user_stats",
        "schedule": crontab(hour=3, minute=0),           # каждый день в 03:00 — минимум нагрузки
    },
    "cleanup-expired-tokens": {
        "task": "tasks.cleanup_tokens",
        "schedule": crontab(minute="*/30"),
    },
}
# Запуск планировщика: celery -A tasks beat`,
    },
  ],
  tasks: [
    {
      title: 'Ночной пересчёт',
      level: 'средне',
      text: `<p>Сейчас статистика пользователя (число заметок по тегам, активность по дням) считается при каждом открытии профиля. Перенесите расчёт в ночную задачу Celery beat с сохранением результата в таблицу,
        а в профиле показывайте готовые данные с пометкой «обновлено N часов назад». Какие данные можно так отложить, а какие нет?</p>`,
    },
  ],
  quiz: [
    { q: 'Какой статус возвращает асинхронный API, принявший задачу к выполнению?', options: ['200', '201', '202 Accepted', '204'], answer: 2 },
    { q: 'Зачем добавлять случайный разброс к расписанию клиентов?', options: ['Для безопасности', 'Чтобы запросы тысяч клиентов не совпадали по времени', 'Чтобы ускорить задачу', 'Так требует cron'], answer: 1 },
  ],
  resources: [
    { title: 'Celery: периодические задачи', url: 'https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html' },
  ],
});

registerContent('circuit-breaker', {
  intro: `<p>Внешний сервис начал отвечать по 30 секунд. Каждый ваш запрос ждёт таймаут, потоки и соединения заняты ожиданием, очередь растёт — и через минуту лежит уже ваш сервис.
    <b>Circuit breaker</b> (автоматический выключатель) — паттерн, который после серии ошибок <b>перестаёт звать</b> больную зависимость и сразу возвращает ошибку или fallback, давая ей восстановиться.</p>`,
  theory: [
    {
      title: 'Три состояния',
      html: `<ul>
          <li><b>Closed</b> (замкнут, норма): запросы проходят, ошибки считаются. Превышен порог (например, 50% ошибок за 10 с или 5 подряд) → Open.</li>
          <li><b>Open</b> (разомкнут): запросы сразу отклоняются без обращения к сервису — мгновенно, без траты ресурсов. Через заданное время (например, 30 с) → Half-open.</li>
          <li><b>Half-open</b> (пробный): пропускаем несколько пробных запросов. Успешны → Closed; ошибка → снова Open.</li>
        </ul>
        <p>Как автомат в электрощитке: при коротком замыкании размыкает цепь, чтобы не сгорела проводка.</p>`,
    },
    {
      title: 'В связке с другими паттернами',
      html: `<ul>
          <li><b>Таймаут</b> — без него breaker не узнает об ошибке.</li>
          <li><b>Повторы (retry)</b> с экспоненциальной задержкой и jitter — только для временных ошибок (сеть, 503) и идемпотентных операций; ограниченное число. Breaker снаружи повторов не даёт им «добивать» упавший сервис.</li>
          <li><b>Fallback</b> — что вернуть, когда breaker открыт (graceful degradation).</li>
          <li><b>Bulkhead</b> — изоляция ресурсов.</li>
        </ul>
        <p class="note">Повторы без breaker и jitter опасны: когда сервис начинает восстанавливаться, на него обрушивается волна повторных запросов от всех клиентов одновременно (retry storm), и он падает снова.</p>
        <p>Реализации: библиотеки <code>pybreaker</code>, <code>tenacity</code> (повторы), <code>stamina</code>; на уровне инфраструктуры — Envoy и service mesh.</p>`,
    },
  ],
  examples: [
    {
      title: 'Свой circuit breaker',
      lang: 'python',
      code: String.raw`
import time

class CircuitOpenError(Exception):
    pass

class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, reset_timeout: float = 30.0):
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.failures = 0
        self.state = "closed"
        self.opened_at = 0.0

    def call(self, func, *args, **kwargs):
        if self.state == "open":
            if time.monotonic() - self.opened_at < self.reset_timeout:
                raise CircuitOpenError("Сервис временно отключён")
            self.state = "half-open"                     # пробуем один запрос
        try:
            result = func(*args, **kwargs)
        except Exception:
            self.failures += 1
            if self.state == "half-open" or self.failures >= self.failure_threshold:
                self.state, self.opened_at = "open", time.monotonic()
            raise
        self.state, self.failures = "closed", 0          # успех — всё сбрасываем
        return result

payments_breaker = CircuitBreaker(failure_threshold=5, reset_timeout=30)

def get_exchange_rate():
    try:
        return payments_breaker.call(fetch_rate_from_api)   # fetch_rate_from_api — с таймаутом!
    except CircuitOpenError:
        return cached_rate()                               # fallback`,
    },
    {
      title: 'Повторы с tenacity',
      lang: 'python',
      code: String.raw`
# pip install tenacity
import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_random_exponential

@retry(
    retry=retry_if_exception_type((httpx.TimeoutException, httpx.ConnectError)),
    wait=wait_random_exponential(multiplier=0.2, max=5),   # экспонента + jitter
    stop=stop_after_attempt(4),
    reraise=True,
)
def fetch_rate_from_api() -> float:
    r = httpx.get("https://rates.example.com/usd", timeout=1.0)
    r.raise_for_status()
    return r.json()["rate"]`,
    },
  ],
  tasks: [
    {
      title: 'Тесты для breaker',
      level: 'средне',
      text: `<p>Напишите pytest-тесты для класса <code>CircuitBreaker</code>: размыкание после N ошибок, мгновенный отказ в состоянии open, переход в half-open по истечении времени (подмените время, а не ждите 30 секунд), замыкание после успешного пробного запроса и повторное размыкание после неудачного.</p>`,
    },
    {
      title: 'Каскадный отказ',
      level: 'сложно',
      text: `<p>Сделайте «медленный сервис» (FastAPI, отвечает через 10 с) и API заметок, который вызывает его на каждый запрос без таймаута. Под нагрузкой Locust посмотрите, как растёт задержка API заметок.
        Добавьте таймаут, затем circuit breaker с fallback — сравните p95 и число ошибок на каждом этапе.</p>`,
    },
  ],
  quiz: [
    { q: 'Что делает circuit breaker в состоянии Open?', options: ['Пропускает все запросы', 'Сразу отклоняет запросы, не обращаясь к сервису', 'Повторяет запросы', 'Перезапускает сервис'], answer: 1 },
    { q: 'Зачем состояние Half-open?', options: ['Для логов', 'Проверить пробными запросами, восстановился ли сервис', 'Чтобы пропускать половину запросов всегда', 'Для балансировки'], answer: 1 },
    { q: 'Почему повторы делают со случайным разбросом (jitter)?', options: ['Для безопасности', 'Чтобы повторы клиентов не совпадали и не создавали волну нагрузки', 'Так быстрее', 'Чтобы обойти rate limit'], answer: 1 },
  ],
  resources: [
    { title: 'Martin Fowler: CircuitBreaker', url: 'https://martinfowler.com/bliki/CircuitBreaker.html' },
    { title: 'AWS: Timeouts, retries and backoff with jitter', url: 'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/' },
  ],
});

registerContent('observability', {
  intro: `<p><b>Наблюдаемость</b> (observability) — способность понять, что происходит внутри системы, по данным, которые она выдаёт наружу. Не только «работает или нет», но и «<b>почему</b> у этого пользователя запрос шёл 8 секунд».
    Три столпа наблюдаемости — <b>логи</b>, <b>метрики</b> и <b>трейсы</b>.</p>`,
  theory: [
    {
      title: 'Три столпа',
      html: `<table>
          <tr><th></th><th>Что это</th><th>Отвечает на вопрос</th><th>Инструменты</th></tr>
          <tr><td><b>Логи</b></td><td>Записи о событиях с деталями</td><td>Что именно произошло с этим запросом?</td><td>Loki, ELK/OpenSearch, Graylog</td></tr>
          <tr><td><b>Метрики</b></td><td>Числовые ряды: счётчики, распределения</td><td>Сколько, как быстро, какой тренд? Есть ли проблема?</td><td>Prometheus, VictoriaMetrics</td></tr>
          <tr><td><b>Трейсы</b></td><td>Путь одного запроса через все сервисы со временем каждого шага</td><td>Где именно тратится время?</td><td>Jaeger, Tempo, Zipkin</td></tr>
        </table>
        <p>Метрики говорят, <i>что</i> что-то не так (выросла p95), трейсы — <i>где</i> (медленный SQL в сервисе заказов), логи — <i>почему</i> (конкретная ошибка с параметрами).</p>`,
    },
    {
      title: 'Структурированные логи',
      html: `<ul>
          <li>Пишите логи в <b>JSON</b> (тема «12 факторов») — их можно фильтровать по полям, а не грепать текст.</li>
          <li>В каждую запись — <b>request_id</b> / <b>trace_id</b>: так находятся все записи одного запроса во всех сервисах.</li>
          <li>Контекст: user_id, эндпоинт, длительность, статус.</li>
          <li>Уровни: DEBUG (разработка), INFO (значимые события), WARNING (странно, но работаем), ERROR (не удалось выполнить операцию), CRITICAL.</li>
          <li><b>Никогда</b> не логируйте пароли, токены, номера карт, лишние персональные данные.</li>
        </ul>`,
    },
    {
      title: 'Что измерять',
      html: `<p>Для сервисов — <b>RED</b>: <b>R</b>ate (запросов в секунду), <b>E</b>rrors (доля ошибок), <b>D</b>uration (распределение задержек: p50, p95, p99).</p>
        <p>Для ресурсов — <b>USE</b>: <b>U</b>tilization (загрузка), <b>S</b>aturation (насыщение, очередь), <b>E</b>rrors.</p>
        <p>Плюс <b>бизнес-метрики</b>: регистрации, заказы, выручка в минуту — часто лучший индикатор, что «что-то сломалось».</p>
        <p class="note">Смотрите на перцентили, а не на среднее: среднее 100 мс может скрывать 5% запросов по 3 секунды — и это ваши самые активные пользователи.</p>`,
    },
  ],
  examples: [
    {
      title: 'Request ID и структурированный лог на каждый запрос',
      lang: 'python',
      code: String.raw`
# pip install structlog
import time
import uuid
import structlog
from fastapi import FastAPI, Request

structlog.configure(processors=[
    structlog.contextvars.merge_contextvars,
    structlog.processors.add_log_level,
    structlog.processors.TimeStamper(fmt="iso"),
    structlog.processors.JSONRenderer(ensure_ascii=False),
])
log = structlog.get_logger()
app = FastAPI()

@app.middleware("http")
async def access_log(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex
    structlog.contextvars.bind_contextvars(request_id=request_id)   # попадёт во ВСЕ логи этого запроса
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        log.exception("unhandled_error", path=request.url.path)
        raise
    finally:
        structlog.contextvars.unbind_contextvars("request_id")
    log.info("request", method=request.method, path=request.url.path,
             status=response.status_code, duration_ms=round((time.perf_counter() - start) * 1000, 1))
    response.headers["X-Request-ID"] = request_id
    return response
# {"request_id": "9f1c...", "method": "GET", "path": "/notes", "status": 200, "duration_ms": 12.4, "level": "info", ...}`,
    },
  ],
  tasks: [
    {
      title: 'Логи, которые помогают',
      level: 'средне',
      text: `<p>Переведите API заметок на структурированные логи с request_id. Передавайте <code>X-Request-ID</code> во все исходящие вызовы (сервис уведомлений, воркеры через заголовки сообщений), чтобы по одному id находить всю цепочку.
        Отдавайте request_id клиенту в ответе об ошибке 500 — пользователь сможет сообщить его в поддержку.</p>`,
    },
    {
      title: 'Аудит секретов в логах',
      level: 'легко',
      text: `<p>Найдите в своём коде все места, где в лог может попасть тело запроса, заголовки или объект пользователя. Убедитесь, что пароли, токены и <code>Authorization</code> не логируются. Добавьте процессор structlog, маскирующий такие поля.</p>`,
    },
  ],
  quiz: [
    { q: 'Какой инструмент наблюдаемости покажет, в каком сервисе тратится время конкретного запроса?', options: ['Логи', 'Метрики', 'Трейсы', 'Бэкапы'], answer: 2 },
    { q: 'Что входит в RED-метрики?', options: ['RAM, Errors, Disk', 'Rate, Errors, Duration', 'Requests, Events, Data', 'Redis, Elastic, Docker'], answer: 1 },
    { q: 'Почему смотрят на p95/p99, а не на среднее время ответа?', options: ['Среднее сложно считать', 'Среднее скрывает медленный «хвост» запросов', 'Так требует Prometheus', 'Перцентили всегда меньше'], answer: 1 },
    { q: 'Зачем request_id в логах?', options: ['Для красоты', 'Связать все записи одного запроса, в том числе в разных сервисах', 'Для авторизации', 'Для кэша'], answer: 1 },
  ],
  resources: [
    { title: 'Google SRE Book: Monitoring Distributed Systems', url: 'https://sre.google/sre-book/monitoring-distributed-systems/' },
    { title: 'structlog', url: 'https://www.structlog.org/' },
  ],
});

registerContent('monitoring', {
  intro: `<p><b>Мониторинг</b> — постоянный сбор метрик и автоматические <b>оповещения</b>, когда что-то идёт не так. Цель — узнать о проблеме раньше пользователей и знать, где искать.
    Стандартный open-source стек — <b>Prometheus</b> (сбор и хранение метрик) + <b>Grafana</b> (дашборды) + <b>Alertmanager</b> (оповещения).</p>`,
  theory: [
    {
      title: 'Prometheus',
      html: `<ul>
          <li><b>Pull-модель</b>: приложение отдаёт текущие значения метрик на <code>/metrics</code>, Prometheus сам опрашивает (scrape) его каждые 15 с.</li>
          <li>Типы метрик: <b>Counter</b> (только растёт: число запросов), <b>Gauge</b> (текущее значение: размер очереди, соединения), <b>Histogram</b> (распределение: время ответа по корзинам → перцентили).</li>
          <li><b>Метки</b>: <code>http_requests_total{method="GET", path="/notes", status="200"}</code>. Никаких user_id и полных URL с id в метках — кардинальность взорвётся.</li>
          <li>Язык запросов <b>PromQL</b>: <code>rate(...[5m])</code> — скорость роста счётчика, <code>histogram_quantile(0.95, ...)</code> — перцентиль.</li>
        </ul>`,
    },
    {
      title: 'SLI, SLO и алерты',
      html: `<ul>
          <li><b>SLI</b> (индикатор) — измеряемая величина: доля успешных запросов, доля запросов быстрее 300 мс.</li>
          <li><b>SLO</b> (цель) — «99,9% запросов за 30 дней успешны». Оставшиеся 0,1% — <b>бюджет ошибок</b>: пока он есть, можно смело выкатывать новое; кончился — фокус на надёжность.</li>
          <li><b>SLA</b> — обещание клиентам в договоре (с компенсациями), обычно мягче SLO.</li>
        </ul>
        <p>Правила хороших алертов:</p>
        <ul>
          <li>алерт на <b>симптомы</b>, которые чувствуют пользователи (ошибки, задержки), а не на причины (CPU 80% — не проблема, если пользователи довольны);</li>
          <li>каждый алерт требует действия и содержит ссылку на runbook — инструкцию, что делать;</li>
          <li>меньше шума: если алерты игнорируют, пропустят и настоящий.</li>
        </ul>
        <p>Дополнительно: <b>uptime-мониторинг снаружи</b> (UptimeRobot, Better Stack) — проверка с точки зрения пользователя; <b>Sentry</b> — сбор исключений с контекстом.</p>`,
    },
  ],
  examples: [
    {
      title: 'Метрики FastAPI для Prometheus',
      lang: 'python',
      code: String.raw`
# pip install prometheus-client
import time
from fastapi import FastAPI, Request
from prometheus_client import Counter, Histogram, make_asgi_app

REQUESTS = Counter("http_requests_total", "HTTP-запросы", ["method", "route", "status"])
LATENCY = Histogram("http_request_duration_seconds", "Время ответа", ["route"],
                    buckets=(0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5))
NOTES_CREATED = Counter("notes_created_total", "Создано заметок")      # бизнес-метрика

app = FastAPI()
app.mount("/metrics", make_asgi_app())

@app.middleware("http")
async def metrics(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    route = request.scope.get("route")
    path = route.path if route else "unknown"        # шаблон /notes/{note_id}, а не /notes/123
    REQUESTS.labels(request.method, path, response.status_code).inc()
    LATENCY.labels(path).observe(time.perf_counter() - start)
    return response`,
    },
    {
      title: 'PromQL и правило алерта',
      lang: 'yaml',
      code: String.raw`
# Полезные запросы PromQL:
#   RPS:            sum(rate(http_requests_total[5m]))
#   Доля 5xx:       sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
#   p95 по route:   histogram_quantile(0.95, sum by (le, route) (rate(http_request_duration_seconds_bucket[5m])))

# alerts.yml
groups:
  - name: notes-api
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m]))
            / sum(rate(http_requests_total[5m])) > 0.02
        for: 5m
        labels: { severity: page }
        annotations:
          summary: "Больше 2% ошибок 5xx в течение 5 минут"
          runbook: "https://wiki.example.com/runbooks/notes-api-errors"`,
    },
    {
      title: 'Стек в docker compose',
      lang: 'yaml',
      code: String.raw`
services:
  prometheus:
    image: prom/prometheus:v2.54.0
    volumes: ["./prometheus.yml:/etc/prometheus/prometheus.yml:ro"]
    ports: ["127.0.0.1:9090:9090"]
  grafana:
    image: grafana/grafana:11.2.0
    ports: ["127.0.0.1:3000:3000"]

# prometheus.yml:
# scrape_configs:
#   - job_name: notes-api
#     static_configs: [{ targets: ["app:8000"] }]`,
    },
  ],
  tasks: [
    {
      title: 'Дашборд для API заметок',
      level: 'средне',
      text: `<p>Подключите метрики к API заметок, поднимите Prometheus и Grafana. Сделайте дашборд: RPS, доля ошибок, p50/p95/p99 по эндпоинтам, созданные заметки в минуту, размер пула соединений к БД.
        Запустите нагрузочный тест и посмотрите на графики в реальном времени.</p>`,
    },
    {
      title: 'SLO и алерт',
      level: 'средне',
      text: `<p>Сформулируйте SLO для API заметок (доступность и задержка). Посчитайте бюджет ошибок на 30 дней в минутах и в числе запросов при 100 RPS. Настройте алерт в Alertmanager (или Grafana) с отправкой в Telegram и проверьте его, сломав приложение.</p>`,
    },
  ],
  quiz: [
    { q: 'Как Prometheus получает метрики приложения?', options: ['Приложение отправляет их по UDP', 'Сам опрашивает эндпоинт /metrics (pull)', 'Читает логи', 'Через Kafka'], answer: 1 },
    { q: 'Какой тип метрики подходит для времени ответа?', options: ['Counter', 'Gauge', 'Histogram', 'Label'], answer: 2 },
    { q: 'На что лучше настраивать алерты?', options: ['На CPU выше 50%', 'На симптомы, заметные пользователям: ошибки и задержки', 'На каждый WARNING в логах', 'На число подов'], answer: 1 },
    { q: 'Почему нельзя использовать user_id как метку Prometheus?', options: ['Это секрет', 'Огромная кардинальность: по временному ряду на пользователя', 'PromQL не поддерживает числа', 'Можно'], answer: 1 },
  ],
  resources: [
    { title: 'Prometheus: Getting started', url: 'https://prometheus.io/docs/prometheus/latest/getting_started/' },
    { title: 'Google SRE: Service Level Objectives', url: 'https://sre.google/sre-book/service-level-objectives/' },
  ],
});

registerContent('telemetry', {
  intro: `<p><b>Телеметрия</b> — данные о работе системы (логи, метрики, трейсы), а <b>инструментирование</b> — добавление в код точек их сбора. Индустриальный стандарт сегодня — <b>OpenTelemetry</b> (OTel):
    единые API и SDK для всех языков и протокол OTLP, который понимают Jaeger, Tempo, Prometheus, Datadog, Grafana Cloud и другие. Инструментируете один раз — отправляете куда угодно.</p>`,
  theory: [
    {
      title: 'Распределённая трассировка',
      html: `<ul>
          <li><b>Trace</b> — путь одного запроса через систему; <b>span</b> — один шаг (обработка HTTP, SQL-запрос, вызов другого сервиса) с началом, длительностью и атрибутами.</li>
          <li>Спаны образуют дерево: родительский «GET /orders» содержит дочерние «SELECT orders», «HTTP GET catalog».</li>
          <li><b>Распространение контекста</b>: trace_id передаётся между сервисами в заголовке <code>traceparent</code> (стандарт W3C Trace Context) и в сообщениях брокеров.</li>
          <li><b>Сэмплирование</b>: сохранять все трейсы дорого — сохраняют долю (например, 10%) и все трейсы с ошибками (tail sampling).</li>
        </ul>`,
    },
    {
      title: 'Автоматическое и ручное инструментирование',
      html: `<ul>
          <li><b>Автоматическое</b>: готовые инструментаторы для FastAPI, SQLAlchemy, httpx, Redis, Celery, Kafka — спаны появляются без изменений кода.</li>
          <li><b>Ручное</b>: свои спаны для важных бизнес-операций (<code>calculate_discount</code>) и атрибуты (<code>order.items_count</code>).</li>
          <li><b>OpenTelemetry Collector</b> — промежуточный сервис: принимает телеметрию от приложений, фильтрует, сэмплирует и отправляет в хранилища.</li>
          <li>Связка с логами: добавляйте trace_id в каждую запись лога — из трейса можно перейти к логам этого запроса.</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'OpenTelemetry для FastAPI + SQLAlchemy + httpx',
      lang: 'python',
      code: String.raw`
# pip install opentelemetry-sdk opentelemetry-exporter-otlp \
#   opentelemetry-instrumentation-fastapi opentelemetry-instrumentation-sqlalchemy opentelemetry-instrumentation-httpx
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

provider = TracerProvider(resource=Resource.create({"service.name": "notes-api"}))
provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(endpoint="http://jaeger:4317", insecure=True)))
trace.set_tracer_provider(provider)

FastAPIInstrumentor.instrument_app(app)          # спан на каждый HTTP-запрос
SQLAlchemyInstrumentor().instrument(engine=engine)   # спан на каждый SQL
HTTPXClientInstrumentor().instrument()           # исходящие вызовы + заголовок traceparent

tracer = trace.get_tracer(__name__)

def export_notes(user_id: int):
    with tracer.start_as_current_span("export_notes") as span:     # ручной спан
        span.set_attribute("user.id", user_id)
        notes = load_notes(user_id)
        span.set_attribute("notes.count", len(notes))
        return render_csv(notes)`,
    },
    {
      title: 'Jaeger для локальной разработки',
      lang: 'bash',
      code: String.raw`
docker run -d --name jaeger -p 16686:16686 -p 4317:4317 jaegertracing/all-in-one:1.60
# UI: http://localhost:16686 — выберите сервис notes-api и найдите медленные запросы

# Альтернатива без изменений кода — автоинструментирование:
pip install opentelemetry-distro && opentelemetry-bootstrap -a install
OTEL_SERVICE_NAME=notes-api OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317 \
  opentelemetry-instrument uvicorn app.main:app`,
    },
  ],
  tasks: [
    {
      title: 'Найдите N+1 по трейсу',
      level: 'средне',
      text: `<p>Подключите OpenTelemetry и Jaeger к API заметок. Специально внесите проблему N+1 в список заметок (ленивая загрузка автора) и найдите её по трейсу: как выглядит «лесенка» одинаковых SQL-спанов? Исправьте и сравните трейсы.</p>`,
    },
    {
      title: 'Трейс через два сервиса',
      level: 'сложно',
      text: `<p>Инструментируйте API заметок и сервис уведомлений (или воркер Celery). Убедитесь, что вызов уведомлений виден в Jaeger как дочерний спан того же трейса. Добавьте trace_id в structlog-логи обоих сервисов.</p>`,
    },
  ],
  quiz: [
    { q: 'Что такое span в трассировке?', options: ['Весь запрос пользователя', 'Один шаг обработки с длительностью и атрибутами', 'Метрика', 'Лог-файл'], answer: 1 },
    { q: 'Как trace_id передаётся между сервисами по HTTP?', options: ['В теле ответа', 'В заголовке traceparent', 'В cookie', 'Никак'], answer: 1 },
    { q: 'Главное преимущество OpenTelemetry:', options: ['Это база данных', 'Единый стандарт: инструментируете один раз и отправляете в любые системы', 'Заменяет логи полностью', 'Работает только с Python'], answer: 1 },
  ],
  resources: [
    { title: 'OpenTelemetry: Python', url: 'https://opentelemetry.io/docs/languages/python/' },
    { title: 'Jaeger: Getting started', url: 'https://www.jaegertracing.io/docs/latest/getting-started/' },
  ],
});
