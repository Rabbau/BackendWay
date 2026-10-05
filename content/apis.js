// Раздел 7. API

registerContent('rest', {
  intro: `<p><b>API</b> (Application Programming Interface) — договор о том, как программы общаются друг с другом. Бэкенд почти всегда предоставляет API:
    его вызывают фронтенд, мобильное приложение, другие сервисы. Самый распространённый стиль веб-API — <b>REST</b>.</p>`,
  theory: [
    {
      title: 'Принципы REST',
      html: `<p>REST (REpresentational State Transfer) — архитектурный стиль, описанный Роем Филдингом в 2000 году. Ключевые идеи:</p>
        <ul>
          <li><b>Ресурсы</b>: всё, с чем работает API, — ресурсы с адресами (URL): <code>/users</code>, <code>/users/42</code>, <code>/users/42/orders</code>.</li>
          <li><b>Единый интерфейс</b>: действие над ресурсом задаётся методом HTTP, а не URL.</li>
          <li><b>Stateless</b>: каждый запрос самодостаточен — сервер не хранит состояние клиента между запросами (токен приходит в каждом запросе).</li>
          <li><b>Представления</b>: клиент получает представление ресурса (обычно JSON), а не сам объект из БД.</li>
          <li><b>Кэшируемость</b>: ответы помечаются как кэшируемые или нет.</li>
          <li><b>Клиент-сервер</b> и <b>многоуровневость</b>: между ними могут быть прокси, балансировщики, CDN.</li>
        </ul>`,
    },
    {
      title: 'Проектирование URL',
      html: `<table>
          <tr><th>Действие</th><th>Метод и URL</th><th>Ответ</th></tr>
          <tr><td>Список</td><td><code>GET /articles</code></td><td>200 + массив</td></tr>
          <tr><td>Создать</td><td><code>POST /articles</code></td><td>201 + объект + <code>Location</code></td></tr>
          <tr><td>Получить</td><td><code>GET /articles/7</code></td><td>200 или 404</td></tr>
          <tr><td>Заменить</td><td><code>PUT /articles/7</code></td><td>200</td></tr>
          <tr><td>Изменить часть</td><td><code>PATCH /articles/7</code></td><td>200</td></tr>
          <tr><td>Удалить</td><td><code>DELETE /articles/7</code></td><td>204</td></tr>
          <tr><td>Вложенный ресурс</td><td><code>GET /articles/7/comments</code></td><td>200</td></tr>
        </table>
        <ul>
          <li>Существительные во <b>множественном числе</b>, а не глаголы: <code>POST /orders</code>, а не <code>POST /createOrder</code>.</li>
          <li>Строчные буквы и дефисы: <code>/order-items</code>.</li>
          <li>Фильтры, сортировка, пагинация — в query: <code>GET /articles?author=7&amp;sort=-created_at&amp;page=2</code>.</li>
          <li>Действия, которые не ложатся на CRUD, оформляют как подресурс: <code>POST /orders/7/cancel</code>.</li>
          <li>Не делайте вложенность глубже двух уровней.</li>
        </ul>`,
    },
    {
      title: 'Версионирование',
      html: `<p>API живёт годами, а клиенты (особенно мобильные) обновляются не сразу. Ломающие изменения — удаление поля, смена типа, переименование — требуют новой версии:</p>
        <ul>
          <li>в пути: <code>/api/v1/users</code> — самый простой и распространённый способ;</li>
          <li>в заголовке: <code>Accept: application/vnd.myapp.v2+json</code>;</li>
          <li>датой (как в Stripe): <code>Stripe-Version: 2024-06-20</code>.</li>
        </ul>
        <p class="note">Добавление новых необязательных полей не ломает клиентов — для этого новая версия не нужна. Клиенты, в свою очередь, должны игнорировать неизвестные поля.</p>`,
    },
    {
      title: 'Модель зрелости Ричардсона и HATEOAS',
      html: `<ol start="0">
          <li>Один URL, всё через POST (как RPC).</li>
          <li>Отдельные URL для ресурсов.</li>
          <li>+ правильные методы HTTP и коды ответов — уровень большинства «REST API».</li>
          <li>+ <b>HATEOAS</b>: ответ содержит ссылки на возможные действия (<code>"links": {"cancel": "/orders/7/cancel"}</code>), клиент «ходит по ссылкам».</li>
        </ol>
        <p>Третий уровень на практике встречается редко; второй — разумный стандарт.</p>`,
    },
    {
      title: 'Идемпотентность и повторы',
      html: `<p>Сеть ненадёжна: клиент отправил <code>POST /payments</code>, а ответ потерялся. Повторить запрос — рискуем списать деньги дважды.
        Решение — <b>ключ идемпотентности</b>: клиент генерирует уникальный <code>Idempotency-Key</code> и шлёт его в заголовке; сервер запоминает результат по ключу
        и на повтор возвращает тот же ответ, не выполняя действие снова.</p>`,
    },
  ],
  examples: [
    {
      title: 'REST-ресурс статей на FastAPI',
      lang: 'python',
      code: String.raw`
from fastapi import APIRouter, FastAPI, HTTPException, Query, Response, status
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/articles", tags=["articles"])

class ArticleIn(BaseModel):
    title: str
    body: str

class Article(ArticleIn):
    id: int

db: dict[int, Article] = {}

@router.get("")
def list_articles(q: str | None = None, limit: int = Query(20, le=100), offset: int = 0) -> list[Article]:
    items = [a for a in db.values() if not q or q.lower() in a.title.lower()]
    return items[offset:offset + limit]

@router.post("", status_code=status.HTTP_201_CREATED)
def create_article(data: ArticleIn, response: Response) -> Article:
    article = Article(id=len(db) + 1, **data.model_dump())
    db[article.id] = article
    response.headers["Location"] = f"/api/v1/articles/{article.id}"
    return article

@router.get("/{article_id}")
def get_article(article_id: int) -> Article:
    if article_id not in db:
        raise HTTPException(404, "Статья не найдена")
    return db[article_id]

@router.put("/{article_id}")
def replace_article(article_id: int, data: ArticleIn) -> Article:
    get_article(article_id)
    db[article_id] = Article(id=article_id, **data.model_dump())
    return db[article_id]

@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(article_id: int) -> None:
    if db.pop(article_id, None) is None:
        raise HTTPException(404, "Статья не найдена")

app = FastAPI()
app.include_router(router)`,
      explain: `<p><code>APIRouter</code> группирует эндпоинты одного ресурса — в реальном проекте каждый ресурс лежит в своём модуле <code>app/api/articles.py</code>.</p>`,
    },
    {
      title: 'Ключ идемпотентности',
      lang: 'python',
      code: String.raw`
from fastapi import Header

processed: dict[str, dict] = {}   # в продакшене — Redis или таблица в БД с TTL

@app.post("/api/v1/payments", status_code=201)
def create_payment(data: dict, idempotency_key: str = Header(...)):
    if idempotency_key in processed:
        return processed[idempotency_key]           # повтор: тот же ответ, без списания
    result = {"payment_id": len(processed) + 1, "amount": data["amount"], "status": "ok"}
    processed[idempotency_key] = result
    return result`,
    },
  ],
  tasks: [
    {
      title: 'Спроектируйте API',
      level: 'средне',
      text: `<p>Спроектируйте (без кода) REST API для библиотеки: книги, авторы, читатели, выдачи книг. Для каждого эндпоинта укажите метод, URL, тело запроса, коды ответов.
        Как оформить «выдать книгу» и «вернуть книгу»? Как получить все книги автора? Все просроченные выдачи?</p>`,
      solution: `<p>Пример: <code>GET/POST /books</code>, <code>GET/PATCH/DELETE /books/{id}</code>, <code>GET /authors/{id}/books</code>.
        Выдача — отдельный ресурс: <code>POST /loans</code> <code>{"book_id", "reader_id"}</code> → 201 (или 409, если книга уже выдана);
        возврат — <code>POST /loans/{id}/return</code> или <code>PATCH /loans/{id}</code> <code>{"returned_at": ...}</code>.
        Просроченные — фильтр: <code>GET /loans?overdue=true</code>.</p>`,
    },
    {
      title: 'Найдите ошибки',
      level: 'легко',
      text: `<p>Что не так с этими эндпоинтами и как их исправить?</p>
        <ol>
          <li><code>GET /getAllUsers</code></li>
          <li><code>POST /users/delete/5</code></li>
          <li><code>GET /user/5</code> возвращает <code>200 {"error": "not found"}</code></li>
          <li><code>GET /users/5/orders/12/items/3/reviews</code></li>
          <li><code>GET /orders?action=cancel&amp;id=7</code></li>
        </ol>`,
      solution: `<ol>
          <li>Глагол в URL → <code>GET /users</code>.</li>
          <li>Действие через метод → <code>DELETE /users/5</code>.</li>
          <li>Множественное число и правильный статус → <code>GET /users/5</code> → 404.</li>
          <li>Слишком глубокая вложенность → <code>GET /order-items/3/reviews</code> или <code>GET /reviews?item_id=3</code>.</li>
          <li>GET не должен менять состояние → <code>POST /orders/7/cancel</code>.</li>
        </ol>`,
    },
    {
      title: 'Версия v2',
      level: 'средне',
      text: `<p>В API статей решили разделить <code>title</code> на <code>title</code> и <code>subtitle</code>, а <code>body</code> переименовать в <code>content</code>.
        Добавьте <code>/api/v2/articles</code>, сохранив работу <code>/api/v1</code> для старых клиентов поверх той же модели хранения.</p>`,
    },
  ],
  quiz: [
    { q: 'Какой URL соответствует принципам REST для создания заказа?', options: ['POST /createOrder', 'GET /orders/new', 'POST /orders', 'PUT /order'], answer: 2 },
    { q: 'Что означает stateless в REST?', options: ['У сервера нет базы данных', 'Каждый запрос содержит всё нужное, сервер не хранит контекст клиента между запросами', 'Ответы нельзя кэшировать', 'Нельзя использовать cookie'], answer: 1 },
    { q: 'Какое изменение требует новой версии API?', options: ['Добавление необязательного поля в ответ', 'Новый эндпоинт', 'Переименование существующего поля', 'Ускорение запроса'], answer: 2 },
    { q: 'Зачем нужен Idempotency-Key?', options: ['Для авторизации', 'Чтобы безопасно повторять неидемпотентные запросы без двойного эффекта', 'Для кэширования GET', 'Для версионирования'], answer: 1 },
  ],
  resources: [
    { title: 'Microsoft: рекомендации по проектированию REST API', url: 'https://learn.microsoft.com/ru-ru/azure/architecture/best-practices/api-design' },
    { title: 'Zalando RESTful API Guidelines', url: 'https://opensource.zalando.com/restful-api-guidelines/' },
  ],
});

registerContent('json-apis', {
  intro: `<p><b>JSON</b> — стандартный формат обмена данными в веб-API. Сам по себе он простой, но договорённости о структуре ответов, ошибок,
    дат и пагинации сильно влияют на то, насколько удобно с вашим API работать.</p>`,
  theory: [
    {
      title: 'Формат JSON',
      html: `<ul>
          <li>Типы: объект <code>{}</code>, массив <code>[]</code>, строка (только в двойных кавычках), число, <code>true</code>/<code>false</code>, <code>null</code>.</li>
          <li>Нет дат, комментариев, завершающих запятых, <code>NaN</code>.</li>
          <li>Заголовок ответа: <code>Content-Type: application/json</code>. Кодировка — UTF-8.</li>
        </ul>`,
    },
    {
      title: 'Соглашения о данных',
      html: `<ul>
          <li><b>Имена полей</b> — единообразно: <code>snake_case</code> (Python, GitHub API) или <code>camelCase</code> (JavaScript, Google). Главное — одинаково во всём API.</li>
          <li><b>Даты</b> — строки ISO 8601 в UTC: <code>"2026-10-05T14:30:00Z"</code>.</li>
          <li><b>Деньги</b> — целые в минимальных единицах (<code>"amount": 19990</code>) или строки-десятичные (<code>"19.99"</code>), но не float. Плюс валюта: <code>"currency": "RUB"</code>.</li>
          <li><b>id</b> — большие числа (больше 2<sup>53</sup>) теряют точность в JavaScript; такие id отдают строками.</li>
          <li><b>Отсутствие значения</b> — договоритесь: поле с <code>null</code> или отсутствие поля.</li>
          <li><b>Перечисления</b> — строками (<code>"status": "paid"</code>), а не магическими числами.</li>
        </ul>`,
    },
    {
      title: 'Ответы со списками',
      html: `<p>Список лучше возвращать не голым массивом, а объектом — так можно добавить метаданные, не ломая клиентов:</p>
        <pre><code>{"items": [...], "total": 134, "page": 2, "per_page": 20}
{"items": [...], "next_cursor": "eyJpZCI6NDJ9"}</code></pre>
        <p>Курсорная пагинация (из темы «Профилирование») стабильна при вставке новых записей и быстра на больших объёмах.</p>`,
    },
    {
      title: 'Единый формат ошибок',
      html: `<p>Клиенту нужно программно понять, что пошло не так. Хороший формат ошибки: машиночитаемый код, сообщение для человека, детали по полям.
        Есть стандарт <b>RFC 9457 Problem Details</b> (<code>Content-Type: application/problem+json</code>):</p>
        <pre><code>{
  "type": "https://api.shop.ru/errors/out-of-stock",
  "title": "Товара нет в наличии",
  "status": 409,
  "detail": "Товар 7 закончился",
  "product_id": 7
}</code></pre>
        <p class="note">Не отдавайте в ответе traceback и внутренние детали (SQL, пути к файлам) — это помогает атакующему. Логируйте их на сервере.</p>
        <p>Отдельная спецификация <b>JSON:API</b> (jsonapi.org) стандартизирует вообще всё — связи, включения, фильтры. Используется реже, но полезно знать.</p>`,
    },
  ],
  examples: [
    {
      title: 'Единый формат ошибок в FastAPI',
      lang: 'python',
      code: String.raw`
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

class ApiError(Exception):
    def __init__(self, status: int, code: str, message: str, **extra):
        self.status, self.code, self.message, self.extra = status, code, message, extra

app = FastAPI()

@app.exception_handler(ApiError)
async def api_error_handler(request: Request, exc: ApiError):
    return JSONResponse(status_code=exc.status, media_type="application/problem+json",
                        content={"type": exc.code, "title": exc.message, "status": exc.status, **exc.extra})

@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    fields = {".".join(map(str, e["loc"][1:])): e["msg"] for e in exc.errors()}
    return JSONResponse(status_code=422, media_type="application/problem+json",
                        content={"type": "validation-error", "title": "Неверные данные", "status": 422, "fields": fields})

@app.post("/orders")
def create_order(product_id: int):
    raise ApiError(409, "out-of-stock", "Товара нет в наличии", product_id=product_id)`,
    },
    {
      title: 'Сериализация дат и денег',
      lang: 'python',
      code: String.raw`
from datetime import datetime, timezone
from decimal import Decimal
from pydantic import BaseModel

class Payment(BaseModel):
    id: str
    amount: Decimal
    currency: str
    created_at: datetime

p = Payment(id="9007199254740993", amount=Decimal("199.90"), currency="RUB",
            created_at=datetime(2026, 10, 5, 14, 30, tzinfo=timezone.utc))
print(p.model_dump_json())
# {"id":"9007199254740993","amount":"199.90","currency":"RUB","created_at":"2026-10-05T14:30:00Z"}`,
      explain: `<p>Pydantic сам сериализует <code>Decimal</code> в строку, а <code>datetime</code> — в ISO 8601.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Стандартизируйте API заметок',
      level: 'средне',
      text: `<p>Приведите API заметок к единым правилам: список — объект с <code>items</code> и метаданными пагинации; все даты — ISO 8601 в UTC;
        все ошибки (404, 409, 422, 500) — в формате Problem Details. Добавьте обработчик для любого необработанного исключения: лог с traceback на сервере и обезличенный ответ 500 клиенту.</p>`,
    },
    {
      title: 'Ловушка больших чисел',
      level: 'легко',
      text: `<p>Откройте консоль браузера (F12) и выполните <code>JSON.parse('{"id": 9007199254740993}').id</code>. Что получилось и почему? Как избежать этой проблемы в API?</p>`,
      solution: `<p>Получится <code>9007199254740992</code>: числа в JavaScript — 64-битные float, целые точно представимы только до 2<sup>53</sup>. Большие id (например, Snowflake ID) отдают строками.</p>`,
    },
  ],
  quiz: [
    { q: 'Как правильно передать дату в JSON-API?', options: ['"05.10.2026"', 'Число миллисекунд без пояснений', '"2026-10-05T14:30:00Z" (ISO 8601)', 'Объект {day, month, year}'], answer: 2 },
    { q: 'Почему список лучше возвращать объектом <code>{"items": [...]}</code>, а не массивом?', options: ['JSON не поддерживает массивы', 'Можно добавить метаданные (пагинацию), не ломая клиентов', 'Так быстрее', 'Этого требует HTTP'], answer: 1 },
    { q: 'Что не стоит включать в ответ с ошибкой 500?', options: ['Код ошибки', 'Сообщение для человека', 'Traceback и SQL-запрос', 'Идентификатор запроса для поддержки'], answer: 2 },
  ],
  resources: [
    { title: 'RFC 9457: Problem Details for HTTP APIs', url: 'https://www.rfc-editor.org/rfc/rfc9457' },
    { title: 'JSON:API', url: 'https://jsonapi.org/' },
  ],
});

registerContent('open-api-specs', {
  intro: `<p><b>OpenAPI</b> (бывший Swagger) — стандартный формат описания REST API в YAML или JSON: эндпоинты, параметры, схемы данных, ответы, авторизация.
    По спецификации генерируют документацию, клиентские SDK, моки и тесты. FastAPI создаёт её автоматически — вы уже видели её на <code>/docs</code>.</p>`,
  theory: [
    {
      title: 'Структура спецификации',
      html: `<ul>
          <li><code>openapi</code> — версия стандарта (3.1);</li>
          <li><code>info</code> — название, версия, описание API;</li>
          <li><code>servers</code> — базовые URL;</li>
          <li><code>paths</code> — эндпоинты: метод → параметры, тело запроса, ответы;</li>
          <li><code>components.schemas</code> — переиспользуемые модели данных (JSON Schema), на них ссылаются через <code>$ref</code>;</li>
          <li><code>components.securitySchemes</code> — способы авторизации (Bearer, API key, OAuth2).</li>
        </ul>`,
    },
    {
      title: 'Code-first и Design-first',
      html: `<p><b>Code-first</b>: пишем код, спецификация генерируется из него (FastAPI, drf-spectacular для Django). Быстро, спецификация всегда соответствует коду.</p>
        <p><b>Design-first</b>: сначала пишем и согласуем спецификацию (с фронтендом, мобильщиками, партнёрами), затем реализуем. Фронтенд может начать работу на моке, не дожидаясь бэкенда.</p>`,
    },
    {
      title: 'Экосистема',
      html: `<ul>
          <li><b>Swagger UI</b>, <b>ReDoc</b>, <b>Scalar</b> — интерактивная документация (FastAPI: <code>/docs</code> и <code>/redoc</code>);</li>
          <li><b>openapi-generator</b>, <b>openapi-typescript</b> — генерация клиентов на десятках языков;</li>
          <li><b>Prism</b> — мок-сервер по спецификации;</li>
          <li><b>Schemathesis</b> — автоматическое тестирование API по спецификации (генерирует сотни запросов и ищет падения);</li>
          <li><b>Spectral</b> — линтер стиля спецификации.</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'Фрагмент спецификации OpenAPI',
      lang: 'yaml',
      code: String.raw`
openapi: 3.1.0
info:
  title: Notes API
  version: 1.0.0
paths:
  /notes/{note_id}:
    get:
      summary: Получить заметку
      parameters:
        - name: note_id
          in: path
          required: true
          schema: { type: integer }
      responses:
        "200":
          description: Заметка
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Note" }
        "404":
          description: Не найдена
components:
  schemas:
    Note:
      type: object
      required: [id, title]
      properties:
        id:    { type: integer }
        title: { type: string, maxLength: 200 }
        tags:  { type: array, items: { type: string } }`,
    },
    {
      title: 'Обогащаем автодокументацию FastAPI',
      lang: 'python',
      code: String.raw`
from fastapi import FastAPI, Path
from pydantic import BaseModel, Field

app = FastAPI(title="Notes API", version="1.0.0", description="Учебный API заметок")

class Note(BaseModel):
    id: int
    title: str = Field(max_length=200, examples=["Купить молоко"])
    tags: list[str] = Field(default_factory=list, description="Теги в нижнем регистре")

class ErrorOut(BaseModel):
    title: str

@app.get(
    "/notes/{note_id}",
    summary="Получить заметку",
    tags=["notes"],
    responses={404: {"model": ErrorOut, "description": "Заметка не найдена"}},
)
def get_note(note_id: int = Path(ge=1, description="ID заметки")) -> Note:
    ...

# Спецификация целиком: GET /openapi.json`,
    },
    {
      title: 'Генерация клиента и тестирование',
      lang: 'bash',
      code: String.raw`
# Сохранить спецификацию
curl http://127.0.0.1:8000/openapi.json -o openapi.json

# TypeScript-типы для фронтенда
npx openapi-typescript openapi.json -o api-types.ts

# Фаззинг-тесты API по спецификации
pip install schemathesis
schemathesis run http://127.0.0.1:8000/openapi.json`,
    },
  ],
  tasks: [
    {
      title: 'Документация, которой не стыдно',
      level: 'легко',
      text: `<p>Доработайте API заметок так, чтобы в <code>/docs</code> у каждого эндпоинта было описание, теги, примеры значений и документированные ответы с ошибками. Откройте также <code>/redoc</code>.</p>`,
    },
    {
      title: 'Найдите баги автоматически',
      level: 'средне',
      text: `<p>Запустите Schemathesis на API заметок. Какие проблемы он нашёл (500-е ошибки, ответы, не соответствующие схеме)? Исправьте их.</p>`,
      hint: `<p>Частые находки: необработанные очень длинные строки, отрицательные id, пустые тела, ответы 404, не описанные в спецификации.</p>`,
    },
  ],
  quiz: [
    { q: 'Что такое OpenAPI?', options: ['Фреймворк для Python', 'Стандарт описания REST API в YAML/JSON', 'Протокол передачи данных', 'Сервис хостинга API'], answer: 1 },
    { q: 'Где FastAPI отдаёт спецификацию?', options: ['/swagger.yaml', '/openapi.json', '/spec', '/api'], answer: 1 },
    { q: 'Главное преимущество подхода design-first:', options: ['Меньше кода', 'Можно согласовать контракт и начать работу параллельно до реализации', 'Не нужна документация', 'Быстрее работает'], answer: 1 },
  ],
  resources: [
    { title: 'Спецификация OpenAPI', url: 'https://spec.openapis.org/oas/latest.html' },
    { title: 'Swagger Editor — онлайн-редактор', url: 'https://editor.swagger.io/' },
  ],
});

registerContent('graphql', {
  intro: `<p><b>GraphQL</b> — язык запросов к API, созданный в Facebook. Вместо множества эндпоинтов — один, а клиент сам описывает, какие именно поля и связи ему нужны.
    Удобен для сложных фронтендов и мобильных приложений, где важно получить всё нужное за один запрос.</p>`,
  theory: [
    {
      title: 'Проблемы, которые решает GraphQL',
      html: `<ul>
          <li><b>Over-fetching</b>: <code>GET /users/1</code> возвращает 30 полей, а экрану нужно 2.</li>
          <li><b>Under-fetching</b>: чтобы показать пользователя, его посты и комментарии, нужно 3+ запроса к REST.</li>
          <li><b>Версионирование</b>: новые поля добавляются в схему, старые помечаются <code>@deprecated</code> — версия v2 обычно не нужна.</li>
        </ul>`,
    },
    {
      title: 'Схема, запросы, мутации',
      html: `<ul>
          <li><b>Схема</b> строго типизирована: типы, поля, связи. Это контракт между клиентом и сервером.</li>
          <li><b>Query</b> — чтение; <b>Mutation</b> — изменение; <b>Subscription</b> — поток событий в реальном времени (обычно через WebSocket).</li>
          <li><b>Резолвер</b> — функция на сервере, которая вычисляет значение поля.</li>
          <li>Все запросы обычно идут как <code>POST /graphql</code>, ответ — <code>{"data": ..., "errors": [...]}</code>, статус часто 200 даже при ошибках.</li>
          <li><b>Интроспекция</b>: клиент может запросить саму схему — на этом работают IDE вроде GraphiQL.</li>
        </ul>`,
    },
    {
      title: 'Минусы и подводные камни',
      html: `<ul>
          <li><b>N+1</b> в резолверах — решается паттерном <b>DataLoader</b> (пакетная загрузка).</li>
          <li><b>HTTP-кэширование</b> не работает «из коробки» — все запросы POST на один URL.</li>
          <li><b>Безопасность</b>: клиент может прислать очень глубокий или тяжёлый запрос — нужны лимиты глубины и сложности, таймауты.</li>
          <li>Больше сложности на сервере. Для простого CRUD REST проще.</li>
        </ul>
        <p>В Python: <b>Strawberry</b> (на аннотациях типов, хорошо дружит с FastAPI), Graphene, Ariadne (schema-first).</p>`,
    },
  ],
  examples: [
    {
      title: 'Запрос и ответ',
      lang: 'graphql',
      code: String.raw`
query UserWithPosts($id: ID!) {
  user(id: $id) {
    name
    posts(last: 2) {
      title
      commentsCount
    }
  }
}

mutation {
  createPost(title: "GraphQL за 5 минут", body: "...") {
    id
    title
  }
}`,
      explain: `<p>Ответ повторяет форму запроса: <code>{"data": {"user": {"name": "Анна", "posts": [{"title": "...", "commentsCount": 3}, ...]}}}</code>.</p>`,
    },
    {
      title: 'GraphQL-сервер на Strawberry + FastAPI',
      lang: 'python',
      code: String.raw`
# pip install "strawberry-graphql[fastapi]"
import strawberry
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter

POSTS = [
    {"id": 1, "title": "Первый пост", "author_id": 1},
    {"id": 2, "title": "Про SQL", "author_id": 1},
]
USERS = {1: {"id": 1, "name": "Анна"}}

@strawberry.type
class Post:
    id: int
    title: str

@strawberry.type
class User:
    id: int
    name: str

    @strawberry.field
    def posts(self) -> list[Post]:
        return [Post(id=p["id"], title=p["title"]) for p in POSTS if p["author_id"] == self.id]

@strawberry.type
class Query:
    @strawberry.field
    def user(self, id: int) -> User | None:
        u = USERS.get(id)
        return User(**u) if u else None

@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_post(self, title: str) -> Post:
        post = {"id": len(POSTS) + 1, "title": title, "author_id": 1}
        POSTS.append(post)
        return Post(id=post["id"], title=title)

schema = strawberry.Schema(query=Query, mutation=Mutation)
app = FastAPI()
app.include_router(GraphQLRouter(schema), prefix="/graphql")
# Откройте http://127.0.0.1:8000/graphql — встроенная IDE GraphiQL`,
    },
  ],
  tasks: [
    {
      title: 'Поиграйте с публичным API',
      level: 'легко',
      text: `<p>Откройте <a href="https://countries.trevorblades.com/" target="_blank" rel="noopener">countries.trevorblades.com</a> (публичный GraphQL API) и напишите запрос:
        все страны Европы с названием, столицей и списком языков. Затем выполните тот же запрос из Python через <code>requests.post</code>.</p>`,
      solutionCode: String.raw`
import requests

query = """
{
  continent(code: "EU") {
    countries { name capital languages { name } }
  }
}
"""
r = requests.post("https://countries.trevorblades.com/", json={"query": query}, timeout=10)
for c in r.json()["data"]["continent"]["countries"][:5]:
    print(c["name"], c["capital"], [l["name"] for l in c["languages"]])`,
    },
    {
      title: 'GraphQL для заметок',
      level: 'сложно',
      text: `<p>Добавьте к API заметок GraphQL-эндпоинт на Strawberry поверх той же БД: запрос <code>notes(tag: String, limit: Int)</code> и мутацию <code>createNote</code>.
        У заметки есть поле <code>author</code> — проверьте через лог SQL, нет ли N+1, и исправьте через DataLoader.</p>`,
    },
  ],
  quiz: [
    { q: 'Сколько эндпоинтов обычно у GraphQL API?', options: ['По одному на ресурс', 'Один', 'По одному на поле', 'Зависит от числа таблиц'], answer: 1 },
    { q: 'Какая операция GraphQL изменяет данные?', options: ['query', 'mutation', 'fragment', 'schema'], answer: 1 },
    { q: 'Какой паттерн решает N+1 в резолверах?', options: ['Singleton', 'DataLoader', 'Observer', 'Middleware'], answer: 1 },
    { q: 'Почему с GraphQL сложнее HTTP-кэширование?', options: ['Ответы слишком большие', 'Все запросы — POST на один URL', 'GraphQL не использует HTTP', 'Нет заголовков'], answer: 1 },
  ],
  resources: [
    { title: 'Официальный учебник GraphQL (на русском)', url: 'https://graphql.org/learn/' },
    { title: 'Strawberry GraphQL', url: 'https://strawberry.rocks/docs' },
  ],
});

registerContent('grpc', {
  intro: `<p><b>gRPC</b> — фреймворк удалённого вызова процедур от Google. Клиент вызывает метод сервера так, будто это локальная функция.
    Работает поверх HTTP/2 с бинарным форматом <b>Protocol Buffers</b> — быстрее и компактнее JSON. Стандарт для общения микросервисов внутри компании.</p>`,
  theory: [
    {
      title: 'Protocol Buffers',
      html: `<p>Контракт описывается в файле <code>.proto</code>: сообщения (структуры данных) и сервисы (методы). Из него генератор создаёт код клиента и сервера на любом языке — Python, Go, Java...</p>
        <ul>
          <li>Поля имеют номера (<code>string name = 2;</code>) — в бинарном формате передаются номера, а не имена, поэтому сообщения маленькие.</li>
          <li>Строгая типизация и обратная совместимость: можно добавлять поля, но нельзя менять номера существующих.</li>
        </ul>`,
    },
    {
      title: 'Четыре вида вызовов',
      html: `<ul>
          <li><b>Unary</b> — запрос → ответ (как обычная функция);</li>
          <li><b>Server streaming</b> — один запрос → поток ответов (например, прогресс задачи);</li>
          <li><b>Client streaming</b> — поток запросов → один ответ (загрузка частями);</li>
          <li><b>Bidirectional streaming</b> — потоки в обе стороны (чат).</li>
        </ul>`,
    },
    {
      title: 'REST, GraphQL или gRPC?',
      html: `<table>
          <tr><th></th><th>REST</th><th>GraphQL</th><th>gRPC</th></tr>
          <tr><td>Формат</td><td>JSON</td><td>JSON</td><td>Protobuf (бинарный)</td></tr>
          <tr><td>Контракт</td><td>OpenAPI (необязателен)</td><td>Схема (обязательна)</td><td>.proto (обязателен)</td></tr>
          <tr><td>Браузер</td><td>Нативно</td><td>Нативно</td><td>Только через gRPC-Web/прокси</td></tr>
          <tr><td>Стриминг</td><td>Нет (SSE/WebSocket отдельно)</td><td>Subscriptions</td><td>Встроен</td></tr>
          <tr><td>Где хорош</td><td>Публичные API, простота</td><td>Сложные клиенты</td><td>Сервис-сервис, высокая нагрузка</td></tr>
        </table>
        <p>Частая архитектура: наружу — REST или GraphQL, внутри между микросервисами — gRPC.</p>`,
    },
  ],
  examples: [
    {
      title: 'Контракт greeter.proto',
      lang: 'protobuf',
      code: String.raw`
syntax = "proto3";

package notes;

service NoteService {
  rpc GetNote (GetNoteRequest) returns (Note);
  rpc WatchNotes (WatchRequest) returns (stream Note);   // server streaming
}

message GetNoteRequest {
  int64 id = 1;
}

message WatchRequest {
  string tag = 1;
}

message Note {
  int64 id = 1;
  string title = 2;
  repeated string tags = 3;
}`,
    },
    {
      title: 'Генерация кода и сервер на Python',
      lang: 'python',
      code: String.raw`
# pip install grpcio grpcio-tools
# python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. notes.proto
from concurrent import futures
import grpc
import notes_pb2
import notes_pb2_grpc

NOTES = {1: notes_pb2.Note(id=1, title="gRPC", tags=["rpc"])}

class NoteService(notes_pb2_grpc.NoteServiceServicer):
    def GetNote(self, request, context):
        note = NOTES.get(request.id)
        if note is None:
            context.abort(grpc.StatusCode.NOT_FOUND, "Заметка не найдена")
        return note

server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
notes_pb2_grpc.add_NoteServiceServicer_to_server(NoteService(), server)
server.add_insecure_port("[::]:50051")
server.start()
server.wait_for_termination()

# Клиент:
# with grpc.insecure_channel("localhost:50051") as ch:
#     stub = notes_pb2_grpc.NoteServiceStub(ch)
#     print(stub.GetNote(notes_pb2.GetNoteRequest(id=1)).title)`,
      explain: `<p>Вместо HTTP-кодов в gRPC свои статусы: <code>NOT_FOUND</code>, <code>INVALID_ARGUMENT</code>, <code>UNAVAILABLE</code>, <code>DEADLINE_EXCEEDED</code>...</p>`,
    },
  ],
  tasks: [
    {
      title: 'Hello, gRPC',
      level: 'средне',
      text: `<p>Повторите пример: сгенерируйте код из <code>notes.proto</code>, запустите сервер и клиента. Реализуйте <code>WatchNotes</code> как генератор (<code>yield</code>),
        который каждую секунду отдаёт новую заметку с нужным тегом. Протестируйте инструментом <a href="https://github.com/fullstorydev/grpcurl" target="_blank" rel="noopener">grpcurl</a> или Postman.</p>`,
    },
    {
      title: 'Сравните размер',
      level: 'легко',
      text: `<p>Создайте сообщение <code>Note</code> с 10 тегами, сериализуйте через <code>note.SerializeToString()</code> и сравните размер в байтах с <code>json.dumps</code> тех же данных.</p>`,
    },
  ],
  quiz: [
    { q: 'Какой формат данных использует gRPC?', options: ['JSON', 'XML', 'Protocol Buffers', 'YAML'], answer: 2 },
    { q: 'Поверх какого протокола работает gRPC?', options: ['HTTP/1.0', 'HTTP/2', 'FTP', 'SMTP'], answer: 1 },
    { q: 'Где gRPC особенно уместен?', options: ['Публичный API для браузеров', 'Общение микросервисов внутри компании', 'Статические сайты', 'Отправка почты'], answer: 1 },
  ],
  resources: [
    { title: 'gRPC: быстрый старт на Python', url: 'https://grpc.io/docs/languages/python/quickstart/' },
    { title: 'Protocol Buffers: руководство', url: 'https://protobuf.dev/programming-guides/proto3/' },
  ],
});

registerContent('soap', {
  intro: `<p><b>SOAP</b> — протокол обмена XML-сообщениями, популярный в 2000-х. Сегодня новые API на нём почти не делают, но он живёт в банках, страховании,
    государственных системах (например, СМЭВ) и платёжных шлюзах. Бэкендеру иногда приходится к нему подключаться.</p>`,
  theory: [
    {
      title: 'Как устроен SOAP',
      html: `<ul>
          <li>Сообщение — XML-документ: <code>Envelope</code> → необязательный <code>Header</code> (безопасность, метаданные) → <code>Body</code> (данные или <code>Fault</code> при ошибке).</li>
          <li>Контракт описывается в <b>WSDL</b> — XML-файле со списком операций и типов. По нему генерируются клиенты.</li>
          <li>Обычно передаётся через HTTP POST, но может и через другие транспорты.</li>
          <li>Стандарты <b>WS-*</b> (WS-Security — подписи и шифрование сообщений, WS-ReliableMessaging) — сильная сторона для enterprise-интеграций.</li>
        </ul>
        <p>Минусы: многословность, сложность, тяжёлые инструменты. Для работы из Python используйте библиотеку <b>zeep</b>.</p>`,
    },
  ],
  examples: [
    {
      title: 'SOAP-сообщение',
      lang: 'xml',
      code: String.raw`
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:m="http://www.example.org/stock">
  <soap:Header/>
  <soap:Body>
    <m:GetStockPrice>
      <m:StockName>YNDX</m:StockName>
    </m:GetStockPrice>
  </soap:Body>
</soap:Envelope>`,
    },
    {
      title: 'Клиент на zeep',
      lang: 'python',
      code: String.raw`
# pip install zeep
from zeep import Client

client = Client("https://www.dataaccess.com/webservicesserver/NumberConversion.wso?WSDL")
print(client.service.NumberToWords(42))   # forty two`,
      explain: `<p>zeep читает WSDL и сам создаёт методы <code>client.service.*</code> с проверкой типов. Посмотреть доступные операции: <code>python -m zeep URL_WSDL</code>.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Вызовите SOAP-сервис',
      level: 'легко',
      text: `<p>С помощью zeep вызовите операции <code>NumberToWords</code> и <code>NumberToDollars</code> публичного сервиса из примера. Затем отправьте тот же запрос вручную через
        <code>requests.post</code> с XML-телом и заголовком <code>Content-Type: text/xml</code> — так вы увидите, что SOAP — это просто XML поверх HTTP.</p>`,
    },
  ],
  quiz: [
    { q: 'В каком формате передаются SOAP-сообщения?', options: ['JSON', 'XML', 'Protobuf', 'CSV'], answer: 1 },
    { q: 'Что такое WSDL?', options: ['Язык запросов', 'XML-описание операций и типов SOAP-сервиса', 'Сервер приложений', 'Протокол шифрования'], answer: 1 },
  ],
  resources: [
    { title: 'Документация zeep', url: 'https://docs.python-zeep.org/' },
  ],
});
