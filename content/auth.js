// Раздел 8. Аутентификация

registerContent('basic-auth', {
  intro: `<p>Прежде чем говорить о способах входа, разделим два понятия, которые постоянно путают:</p>
    <ul>
      <li><b>Аутентификация</b> (authentication, AuthN) — <i>кто вы?</i> Проверка личности: пароль, токен, отпечаток.</li>
      <li><b>Авторизация</b> (authorization, AuthZ) — <i>что вам можно?</i> Проверка прав: может ли этот пользователь удалить пост.</li>
    </ul>
    <p>Ошибка аутентификации — <code>401 Unauthorized</code>, ошибка авторизации — <code>403 Forbidden</code>.
    Самый простой способ аутентификации в HTTP — <b>Basic Authentication</b>.</p>`,
  theory: [
    {
      title: 'Как работает Basic Auth',
      html: `<ol>
          <li>Клиент обращается к защищённому ресурсу без данных.</li>
          <li>Сервер отвечает <code>401</code> и заголовком <code>WWW-Authenticate: Basic realm="admin"</code> — браузер показывает окно логина.</li>
          <li>Клиент повторяет запрос с заголовком <code>Authorization: Basic &lt;base64(login:password)&gt;</code>.</li>
          <li>Сервер декодирует, проверяет пароль и отвечает.</li>
        </ol>
        <p>Логин и пароль передаются <b>в каждом запросе</b>.</p>`,
    },
    {
      title: 'Base64 — это не шифрование',
      html: `<p><code>YW5uYTpzZWNyZXQ=</code> — это просто <code>anna:secret</code> в кодировке Base64, раскодировать может кто угодно. Поэтому:</p>
        <ul>
          <li>Basic Auth допустим <b>только поверх HTTPS</b>;</li>
          <li>нет встроенного «выхода» — браузер помнит пароль до закрытия;</li>
          <li>пароль постоянно гуляет по сети — больше шансов утечки через логи прокси.</li>
        </ul>
        <p>Где уместен: внутренние инструменты, админка тестового стенда, межсервисные вызовы, простые API-ключи (часто ключ передают как логин с пустым паролем).</p>
        <p class="note">Сравнивайте секреты функцией <code>secrets.compare_digest</code>, а не <code>==</code>: обычное сравнение прерывается на первом несовпадающем символе, и по времени ответа можно подбирать пароль (timing attack).</p>`,
    },
  ],
  examples: [
    {
      title: 'Basic Auth в FastAPI',
      lang: 'python',
      code: String.raw`
import secrets
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

app = FastAPI()
security = HTTPBasic()

def check_admin(credentials: HTTPBasicCredentials = Depends(security)) -> str:
    ok_user = secrets.compare_digest(credentials.username.encode(), b"admin")
    ok_pass = secrets.compare_digest(credentials.password.encode(), b"s3cret-pass")
    if not (ok_user and ok_pass):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

@app.get("/admin/stats")
def stats(user: str = Depends(check_admin)):
    return {"user": user, "orders_today": 42}`,
      explain: `<p>Пароль в коде — только для примера. В реальности — хеш в БД или секрет из переменной окружения.</p>`,
    },
    {
      title: 'Клиенты',
      lang: 'bash',
      code: String.raw`
curl -u admin:s3cret-pass http://127.0.0.1:8000/admin/stats

# То же вручную
echo -n "admin:s3cret-pass" | base64        # YWRtaW46czNjcmV0LXBhc3M=
curl -H "Authorization: Basic YWRtaW46czNjcmV0LXBhc3M=" http://127.0.0.1:8000/admin/stats

# Python: requests.get(url, auth=("admin", "s3cret-pass"))`,
    },
  ],
  tasks: [
    {
      title: 'Расшифруйте заголовок',
      level: 'легко',
      text: `<p>Перехвачен заголовок <code>Authorization: Basic Ym9yaXM6cXdlcnR5MTIz</code>. Узнайте логин и пароль одной строкой Python. Какой вывод о безопасности Basic Auth без HTTPS?</p>`,
      solutionCode: String.raw`
import base64
print(base64.b64decode("Ym9yaXM6cXdlcnR5MTIz").decode())   # boris:qwerty123`,
    },
    {
      title: 'Защитите админку',
      level: 'средне',
      text: `<p>Добавьте в API заметок эндпоинт <code>GET /admin/notes/stats</code> (число заметок, число тегов) с Basic Auth. Логин и пароль берите из переменных окружения <code>ADMIN_USER</code> и <code>ADMIN_PASSWORD</code>;
        если они не заданы — эндпоинт должен быть недоступен (а не открыт всем!).</p>`,
    },
  ],
  quiz: [
    { q: 'Пользователь не вошёл в систему и запрашивает профиль. Какой статус?', options: ['401', '403', '404', '400'], answer: 0 },
    { q: 'Пользователь вошёл, но пытается удалить чужой пост. Какой статус?', options: ['401', '403', '409', '500'], answer: 1 },
    { q: 'Чем является Base64 в Basic Auth?', options: ['Шифрованием', 'Хешированием', 'Обратимой кодировкой без защиты', 'Цифровой подписью'], answer: 2 },
    { q: 'Зачем <code>secrets.compare_digest</code> вместо <code>==</code>?', options: ['Быстрее', 'Сравнение за постоянное время защищает от timing-атак', 'Работает с Unicode', 'Хеширует строки'], answer: 1 },
  ],
  resources: [
    { title: 'MDN: HTTP-аутентификация', url: 'https://developer.mozilla.org/ru/docs/Web/HTTP/Authentication' },
    { title: 'FastAPI: HTTP Basic Auth', url: 'https://fastapi.tiangolo.com/advanced/security/http-basic-auth/' },
  ],
});

registerContent('cookie-auth', {
  intro: `<p>Классический способ входа на сайты: пользователь вводит пароль один раз, сервер создаёт <b>сессию</b> и выдаёт браузеру cookie с её идентификатором.
    Дальше браузер сам присылает cookie в каждом запросе. Так работают Django, Rails, большинство сайтов с серверным рендерингом.</p>`,
  theory: [
    {
      title: 'Как работают сессии',
      html: `<ol>
          <li><code>POST /login</code> с логином и паролем.</li>
          <li>Сервер проверяет пароль (по <b>хешу</b> в БД — см. тему «Хеширование паролей»), создаёт запись сессии: случайный id → user_id, срок жизни.</li>
          <li>Ответ: <code>Set-Cookie: session_id=k3J9...; HttpOnly; Secure; SameSite=Lax; Max-Age=1209600</code>.</li>
          <li>Каждый следующий запрос несёт <code>Cookie: session_id=k3J9...</code>; сервер находит сессию и узнаёт пользователя.</li>
          <li><code>POST /logout</code> — сервер удаляет сессию; cookie становится бесполезной.</li>
        </ol>
        <p>Сессии хранят в БД, Redis (быстро, удобный TTL) или в подписанной cookie целиком (stateless-сессии).</p>`,
    },
    {
      title: 'Флаги безопасности cookie',
      html: `<table>
          <tr><th>Флаг</th><th>Защищает от</th></tr>
          <tr><td><code>HttpOnly</code></td><td>Кражи cookie через XSS: JavaScript не может её прочитать</td></tr>
          <tr><td><code>Secure</code></td><td>Передачи по незашифрованному HTTP</td></tr>
          <tr><td><code>SameSite=Lax</code></td><td>CSRF: cookie не отправляется при большинстве запросов с чужих сайтов (<code>Strict</code> — вообще никогда)</td></tr>
          <tr><td><code>Max-Age</code> / <code>Expires</code></td><td>Вечных сессий</td></tr>
          <tr><td><code>Path</code>, <code>Domain</code></td><td>Отправки cookie туда, где она не нужна</td></tr>
        </table>`,
    },
    {
      title: 'CSRF',
      html: `<p><b>Cross-Site Request Forgery</b>: злой сайт содержит форму, отправляющую <code>POST https://bank.ru/transfer</code>. Браузер автоматически приложит cookie банка —
        и запрос выполнится от имени жертвы. Защита:</p>
        <ul>
          <li><code>SameSite=Lax</code> или <code>Strict</code> у сессионной cookie (сегодня — основной барьер);</li>
          <li><b>CSRF-токен</b>: случайное значение в форме, которое злой сайт не может узнать;</li>
          <li>изменяющие действия — никогда через GET.</li>
        </ul>`,
    },
    {
      title: 'Плюсы и минусы сессий',
      html: `<p><b>Плюсы</b>: мгновенный выход и отзыв сессии (удалили запись — пользователь разлогинен везде), в cookie нет данных пользователя, браузер всё делает сам.</p>
        <p><b>Минусы</b>: нужно хранилище сессий и запрос к нему на каждый HTTP-запрос; неудобно для мобильных приложений и сторонних клиентов; сложности с CORS при фронтенде на другом домене.</p>
        <p class="note">После входа всегда выдавайте <b>новый</b> id сессии — иначе возможна атака «фиксация сессии» (session fixation).</p>`,
    },
  ],
  examples: [
    {
      title: 'Вход по сессии в FastAPI',
      lang: 'python',
      code: String.raw`
import secrets
import time
from fastapi import Cookie, Depends, FastAPI, HTTPException, Response
from pydantic import BaseModel

app = FastAPI()
SESSIONS: dict[str, tuple[int, float]] = {}      # в продакшене — Redis или таблица
SESSION_TTL = 14 * 24 * 3600

class LoginIn(BaseModel):
    email: str
    password: str

def authenticate(email: str, password: str) -> int | None:
    ...   # найти пользователя и проверить хеш пароля; вернуть user_id

@app.post("/login")
def login(data: LoginIn, response: Response):
    user_id = authenticate(data.email, data.password)
    if user_id is None:
        raise HTTPException(401, "Неверный email или пароль")   # не уточняем, что именно неверно
    sid = secrets.token_urlsafe(32)                             # криптостойкий случайный id
    SESSIONS[sid] = (user_id, time.time() + SESSION_TTL)
    response.set_cookie("session_id", sid, max_age=SESSION_TTL,
                        httponly=True, secure=True, samesite="lax")
    return {"ok": True}

def current_user(session_id: str | None = Cookie(default=None)) -> int:
    session = SESSIONS.get(session_id or "")
    if not session or session[1] < time.time():
        raise HTTPException(401, "Требуется вход")
    return session[0]

@app.get("/me")
def me(user_id: int = Depends(current_user)):
    return {"user_id": user_id}

@app.post("/logout")
def logout(response: Response, session_id: str | None = Cookie(default=None)):
    SESSIONS.pop(session_id or "", None)
    response.delete_cookie("session_id")
    return {"ok": True}`,
      explain: `<p>Флаг <code>secure=True</code> не даст cookie работать на <code>http://127.0.0.1</code> в некоторых браузерах — для локальной разработки его делают настраиваемым.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Сессии в Redis',
      level: 'сложно',
      text: `<p>Замените словарь <code>SESSIONS</code> на Redis (<code>pip install redis</code>, Redis в Docker): ключ <code>session:&lt;id&gt;</code>, значение — user_id, TTL — через <code>setex</code>.
        Добавьте эндпоинт <code>POST /logout-all</code>, который завершает все сессии пользователя.</p>`,
      hint: `<p>Для «выйти везде» храните ещё множество <code>user_sessions:&lt;user_id&gt;</code> со всеми его session id.</p>`,
    },
    {
      title: 'Исследуйте cookie',
      level: 'легко',
      text: `<p>Войдите на любой крупный сайт и откройте DevTools → Application → Cookies. Найдите сессионную cookie: какие у неё флаги HttpOnly, Secure, SameSite и срок жизни?
        Попробуйте прочитать <code>document.cookie</code> в консоли — видна ли она?</p>`,
    },
  ],
  quiz: [
    { q: 'Какой флаг не даёт JavaScript прочитать cookie?', options: ['Secure', 'HttpOnly', 'SameSite', 'Path'], answer: 1 },
    { q: 'Как сгенерировать id сессии?', options: ['random.randint', 'Хеш email', 'secrets.token_urlsafe', 'Счётчик +1'], answer: 2, explain: 'Нужен криптостойкий непредсказуемый генератор; random и счётчики предсказуемы.' },
    { q: 'Главное преимущество серверных сессий перед JWT:', options: ['Не нужен сервер', 'Сессию можно мгновенно отозвать', 'Меньше запросов к БД', 'Работает без cookie'], answer: 1 },
    { q: 'От какой атаки защищает SameSite?', options: ['SQL-инъекция', 'CSRF', 'DDoS', 'Подбор пароля'], answer: 1 },
  ],
  resources: [
    { title: 'OWASP Session Management Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html' },
    { title: 'MDN: использование cookie', url: 'https://developer.mozilla.org/ru/docs/Web/HTTP/Cookies' },
  ],
});

registerContent('token-auth', {
  intro: `<p>Для мобильных приложений, SPA на другом домене и вызовов между сервисами cookie неудобны. Вместо них клиент получает <b>токен</b> и сам передаёт его
    в заголовке каждого запроса: <code>Authorization: Bearer &lt;токен&gt;</code>. «Bearer» означает «предъявитель»: кто держит токен, тот и пользователь.</p>`,
  theory: [
    {
      title: 'Непрозрачные токены (opaque)',
      html: `<p>Токен — случайная строка, по которой сервер ищет запись в своей БД: кому выдан, срок, права. Это фактически та же сессия, но передаётся заголовком, а не cookie.</p>
        <ul>
          <li>+ легко отозвать (удалить запись);</li>
          <li>− поиск в хранилище на каждый запрос.</li>
        </ul>
        <p>Альтернатива — <b>самодостаточные</b> токены (JWT, следующая тема): данные зашиты в сам токен и защищены подписью, хранилище не нужно.</p>`,
    },
    {
      title: 'API-ключи',
      html: `<p>Долгоживущие токены для программного доступа (интеграции, скрипты, партнёры): <code>sk_live_...</code> в Stripe, ключи OpenAI и Anthropic.</p>
        <ul>
          <li>Показывайте ключ <b>один раз</b> при создании, храните в БД только его <b>хеш</b> (как пароль) — утечка БД не раскроет ключи.</li>
          <li>Префикс (<code>nk_live_</code>) помогает распознать ключ и найти утечки в коде (GitHub сканирует такие паттерны).</li>
          <li>Дайте возможность создавать несколько ключей, ограничивать права (scopes), отзывать и ротировать.</li>
        </ul>`,
    },
    {
      title: 'Где хранить токен на клиенте',
      html: `<ul>
          <li><b>Мобильные приложения</b>: защищённое хранилище ОС (Keychain, Keystore).</li>
          <li><b>Браузер</b>: <code>localStorage</code> доступен любому JS — при XSS токен украдут. Безопаснее держать токен в памяти, а долгоживущий refresh-токен — в <code>HttpOnly</code> cookie.</li>
          <li><b>Серверы и скрипты</b>: переменные окружения или менеджер секретов, никогда не в коде.</li>
        </ul>
        <p class="note">Токены не передают в URL (<code>?token=...</code>): URL оседают в логах серверов, истории браузера и заголовке Referer.</p>`,
    },
  ],
  examples: [
    {
      title: 'API-ключи с хешированием',
      lang: 'python',
      code: String.raw`
import hashlib
import secrets
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

app = FastAPI()
bearer = HTTPBearer()
API_KEYS: dict[str, int] = {}     # sha256(ключа) -> user_id; в продакшене — таблица в БД

def hash_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()   # для длинных случайных ключей достаточно SHA-256

@app.post("/api-keys")
def create_key(user_id: int = 1):
    key = "nk_live_" + secrets.token_urlsafe(32)
    API_KEYS[hash_key(key)] = user_id
    return {"api_key": key, "warning": "Сохраните ключ: больше он не будет показан"}

def current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> int:
    user_id = API_KEYS.get(hash_key(creds.credentials))
    if user_id is None:
        raise HTTPException(401, "Неверный ключ", headers={"WWW-Authenticate": "Bearer"})
    return user_id

@app.get("/notes")
def notes(user_id: int = Depends(current_user)):
    return {"user_id": user_id, "items": []}`,
      explain: `<p>Пароли хешируют медленными алгоритмами (bcrypt, argon2), потому что они короткие и их подбирают. API-ключ — 256 бит случайности, подобрать его нельзя, поэтому быстрого SHA-256 достаточно.</p>`,
    },
    {
      title: 'Запрос с токеном',
      lang: 'bash',
      code: String.raw`
curl -X POST http://127.0.0.1:8000/api-keys
# {"api_key":"nk_live_Xq3...","warning":"..."}

curl -H "Authorization: Bearer nk_live_Xq3..." http://127.0.0.1:8000/notes`,
    },
  ],
  tasks: [
    {
      title: 'Ключи с правами',
      level: 'средне',
      text: `<p>Расширьте пример: у ключа есть набор прав (<code>notes:read</code>, <code>notes:write</code>), название и дата последнего использования. Сделайте зависимость
        <code>require_scope("notes:write")</code>, которая возвращает 403, если у ключа нет права. Добавьте эндпоинты списка и отзыва ключей.</p>`,
      hint: `<p>Зависимость с параметром — функция, которая возвращает функцию: <code>def require_scope(scope): def dep(key = Depends(current_key)): ...; return dep</code>.</p>`,
    },
  ],
  quiz: [
    { q: 'Как обычно передаётся токен в API?', options: ['В query: ?token=...', 'В заголовке Authorization: Bearer ...', 'В теле GET-запроса', 'В пути URL'], answer: 1 },
    { q: 'Как правильно хранить API-ключи на сервере?', options: ['Открытым текстом', 'В виде хеша', 'В зашифрованной cookie', 'В логах'], answer: 1 },
    { q: 'Почему опасно хранить токен в localStorage?', options: ['Он удаляется при закрытии вкладки', 'Его может прочитать вредоносный JS при XSS', 'Он ограничен 10 символами', 'Сервер его не видит'], answer: 1 },
  ],
  resources: [
    { title: 'FastAPI: безопасность', url: 'https://fastapi.tiangolo.com/ru/tutorial/security/' },
  ],
});

registerContent('jwt', {
  intro: `<p><b>JWT</b> (JSON Web Token, произносится «джот») — самодостаточный токен: данные о пользователе записаны прямо в нём и защищены <b>подписью</b>.
    Серверу не нужно хранилище — достаточно проверить подпись. Удобно для микросервисов: любой сервис с ключом проверит токен сам.</p>`,
  theory: [
    {
      title: 'Структура токена',
      html: `<p>Три части через точку: <code>header.payload.signature</code>, каждая — Base64URL.</p>
        <ul>
          <li><b>Header</b>: алгоритм подписи — <code>{"alg": "HS256", "typ": "JWT"}</code>.</li>
          <li><b>Payload</b> (claims): <code>sub</code> (id пользователя), <code>exp</code> (когда истекает), <code>iat</code> (когда выдан), <code>iss</code> (кто выдал), <code>aud</code> (для кого), плюс свои поля (<code>role</code>).</li>
          <li><b>Signature</b>: подпись header и payload секретным ключом.</li>
        </ul>
        <p class="note">Payload <b>не зашифрован</b> — его прочитает любой на jwt.io. Подпись защищает только от <i>изменения</i>. Никаких паролей и персональных данных в токене.</p>`,
    },
    {
      title: 'Алгоритмы подписи',
      html: `<ul>
          <li><b>HS256</b> (симметричный): один секрет и подписывает, и проверяет. Просто, но секрет должен быть у всех проверяющих.</li>
          <li><b>RS256 / ES256</b> (асимметричный): подписывает закрытый ключ сервера авторизации, проверяют публичным ключом — его можно раздать всем сервисам. Публичные ключи публикуют в формате <b>JWKS</b>.</li>
        </ul>
        <p>При проверке <b>всегда явно указывайте допустимые алгоритмы</b>: известная атака — токен с <code>"alg": "none"</code> без подписи.</p>`,
    },
    {
      title: 'Access и refresh токены',
      html: `<p>Главная слабость JWT — его <b>нельзя отозвать</b> до истечения срока: подпись остаётся верной. Поэтому используют пару:</p>
        <ul>
          <li><b>Access-токен</b> — короткоживущий (5–15 минут), передаётся в каждом запросе.</li>
          <li><b>Refresh-токен</b> — долгоживущий (дни, недели), хранится надёжно (HttpOnly cookie), используется только для получения нового access-токена через <code>POST /token/refresh</code>. Его храним на сервере и можем отозвать.</li>
        </ul>
        <p><b>Ротация</b>: при каждом обновлении выдаём новый refresh-токен и аннулируем старый. Если старый пришёл повторно — его украли, отзываем всю цепочку.</p>`,
    },
    {
      title: 'Сессии или JWT?',
      html: `<p>JWT — не «современная замена» сессиям, а инструмент со своими компромиссами. Для обычного веб-сайта на одном домене серверные сессии часто проще и безопаснее.
        JWT хороши, когда токен проверяют многие независимые сервисы, для мобильных клиентов и в OAuth/OpenID Connect.</p>`,
    },
  ],
  examples: [
    {
      title: 'Выдача и проверка JWT (PyJWT)',
      lang: 'python',
      code: String.raw`
# pip install pyjwt
import os
from datetime import datetime, timedelta, timezone
import jwt

SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-me-32-bytes-min!")
ALGORITHM = "HS256"

def create_access_token(user_id: int, role: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": str(user_id), "role": role, "iat": now, "exp": now + timedelta(minutes=15)}
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    # algorithms — явно! exp проверяется автоматически
    return jwt.decode(token, SECRET, algorithms=[ALGORITHM])

token = create_access_token(42, "editor")
print(token)                      # eyJhbGciOiJIUzI1NiIs...
print(decode_token(token))        # {'sub': '42', 'role': 'editor', 'iat': ..., 'exp': ...}

try:
    decode_token(token[:-2] + "xx")
except jwt.InvalidSignatureError:
    print("Подпись неверна — токен подделан")`,
    },
    {
      title: 'OAuth2 Password Flow в FastAPI',
      lang: 'python',
      code: String.raw`
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

app = FastAPI()
oauth2 = OAuth2PasswordBearer(tokenUrl="token")   # кнопка Authorize в /docs

@app.post("/token")
def login(form: OAuth2PasswordRequestForm = Depends()):
    user = authenticate(form.username, form.password)   # проверка хеша пароля
    if not user:
        raise HTTPException(401, "Неверный логин или пароль")
    return {"access_token": create_access_token(user.id, user.role), "token_type": "bearer"}

def current_user(token: str = Depends(oauth2)) -> dict:
    try:
        return decode_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Токен истёк", headers={"WWW-Authenticate": "Bearer"})
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Неверный токен", headers={"WWW-Authenticate": "Bearer"})

def require_role(role: str):
    def checker(user: dict = Depends(current_user)) -> dict:
        if user["role"] != role:
            raise HTTPException(403, "Недостаточно прав")
        return user
    return checker

@app.delete("/notes/{note_id}")
def delete_note(note_id: int, user: dict = Depends(require_role("admin"))):
    ...`,
    },
  ],
  tasks: [
    {
      title: 'Разберите токен',
      level: 'легко',
      text: `<p>Сгенерируйте токен из примера и вставьте его на <a href="https://jwt.io" target="_blank" rel="noopener">jwt.io</a>. Измените в payload роль на <code>admin</code> — что произошло с подписью?
        Затем декодируйте payload вручную через <code>base64.urlsafe_b64decode</code>, не используя библиотеку.</p>`,
      hint: `<p>Base64URL без дополнения: добавьте <code>"=" * (-len(part) % 4)</code> перед декодированием.</p>`,
    },
    {
      title: 'Пользователи и вход в API заметок',
      level: 'сложно',
      text: `<p>Добавьте в API заметок регистрацию (<code>POST /auth/register</code>, пароль хешируется argon2 или bcrypt), вход (<code>POST /auth/token</code>) с access-токеном на 15 минут и refresh-токеном на 14 дней в БД,
        обновление (<code>POST /auth/refresh</code>) с ротацией и выход (<code>POST /auth/logout</code>). Заметки становятся личными: пользователь видит и меняет только свои (иначе 404 — не раскрываем, что чужая заметка существует).</p>`,
      hint: `<p>Хеширование: <code>pip install "pwdlib[argon2]"</code>, <code>PasswordHash.recommended().hash(pwd)</code> и <code>.verify(pwd, hash)</code>. Refresh-токен — случайная строка, в БД храните её хеш.</p>`,
    },
  ],
  quiz: [
    { q: 'Зашифрован ли payload JWT?', options: ['Да, всегда', 'Нет, он только закодирован Base64URL и подписан', 'Только при HS256', 'Только при RS256'], answer: 1 },
    { q: 'Главный недостаток JWT по сравнению с сессиями:', options: ['Большой размер базы', 'Нельзя отозвать до истечения срока без доп. механизмов', 'Не работает в мобильных приложениях', 'Медленная проверка'], answer: 1 },
    { q: 'Зачем access-токен делают короткоживущим?', options: ['Экономия памяти', 'Чтобы ограничить ущерб от кражи токена', 'Так требует HTTP', 'Чтобы чаще спрашивать пароль'], answer: 1 },
    { q: 'Чем удобен RS256 для микросервисов?', options: ['Он быстрее HS256', 'Проверять токены можно публичным ключом, не раздавая секрет', 'Он шифрует payload', 'Не нужен exp'], answer: 1 },
  ],
  resources: [
    { title: 'jwt.io — отладчик токенов', url: 'https://jwt.io/introduction' },
    { title: 'FastAPI: OAuth2 с паролем и JWT', url: 'https://fastapi.tiangolo.com/ru/tutorial/security/oauth2-jwt/' },
  ],
});

registerContent('oauth', {
  intro: `<p><b>OAuth 2.0</b> — стандарт <b>делегирования доступа</b>. Он позволяет приложению получить ограниченный доступ к вашим данным в другом сервисе,
    не узнавая пароль. Пример: сервис печати фотографий просит доступ к вашему Google Фото — вы подтверждаете на странице Google, и сервис получает токен только на чтение фото.</p>`,
  theory: [
    {
      title: 'Роли',
      html: `<ul>
          <li><b>Resource Owner</b> — пользователь, владелец данных.</li>
          <li><b>Client</b> — приложение, которое хочет доступ (ваш сервис).</li>
          <li><b>Authorization Server</b> — выдаёт токены после согласия пользователя (Google, GitHub, Яндекс ID, Keycloak, Auth0).</li>
          <li><b>Resource Server</b> — API с данными, принимающий токены (Google Drive API).</li>
        </ul>
        <p><b>Scopes</b> — запрашиваемые права: <code>read:user</code>, <code>repo</code>, <code>drive.readonly</code>. Пользователь видит их на экране согласия.</p>`,
    },
    {
      title: 'Authorization Code Flow с PKCE',
      html: `<p>Основной и рекомендуемый сценарий для веб- и мобильных приложений:</p>
        <ol>
          <li>Клиент перенаправляет пользователя на <code>https://auth-server/authorize?response_type=code&amp;client_id=...&amp;redirect_uri=...&amp;scope=...&amp;state=...&amp;code_challenge=...</code>.</li>
          <li>Пользователь входит <b>на сайте провайдера</b> и даёт согласие.</li>
          <li>Провайдер перенаправляет обратно на <code>redirect_uri?code=XYZ&amp;state=...</code>.</li>
          <li>Бэкенд клиента обменивает <code>code</code> на токены запросом к <code>/token</code> (с <code>client_secret</code> и/или <code>code_verifier</code>).</li>
          <li>С access-токеном клиент вызывает API провайдера.</li>
        </ol>
        <ul>
          <li><b>state</b> — случайное значение против CSRF: проверяем, что вернулось то же, что отправляли.</li>
          <li><b>PKCE</b> (code_verifier / code_challenge) — защищает от перехвата кода; обязателен для мобильных и SPA, рекомендован для всех.</li>
          <li><b>redirect_uri</b> регистрируется у провайдера заранее и проверяется строго.</li>
        </ul>`,
    },
    {
      title: 'Другие сценарии',
      html: `<ul>
          <li><b>Client Credentials</b> — сервис обращается к API от своего имени, без пользователя (межсервисное взаимодействие).</li>
          <li><b>Device Code</b> — для устройств без браузера (Smart TV, CLI): «откройте ссылку на телефоне и введите код».</li>
          <li><b>Refresh Token</b> — получение нового access-токена.</li>
          <li><s>Implicit</s> и <s>Password</s> — устарели, в OAuth 2.1 удалены.</li>
        </ul>
        <p class="note">OAuth сам по себе — про <b>доступ</b>, а не про <b>вход</b>. Access-токен не говорит, кто пользователь. Для «Войти через Google» поверх OAuth используют OpenID Connect (следующая тема).</p>`,
    },
  ],
  examples: [
    {
      title: 'Вход через GitHub (Authorization Code)',
      lang: 'python',
      code: String.raw`
# Зарегистрируйте OAuth App: GitHub → Settings → Developer settings → OAuth Apps
# Callback URL: http://127.0.0.1:8000/auth/github/callback
import os
import secrets
from urllib.parse import urlencode
import requests
from fastapi import Cookie, FastAPI, HTTPException
from fastapi.responses import RedirectResponse

CLIENT_ID = os.environ["GITHUB_CLIENT_ID"]
CLIENT_SECRET = os.environ["GITHUB_CLIENT_SECRET"]
app = FastAPI()

@app.get("/auth/github")
def github_login():
    state = secrets.token_urlsafe(16)
    params = {"client_id": CLIENT_ID, "scope": "read:user", "state": state,
              "redirect_uri": "http://127.0.0.1:8000/auth/github/callback"}
    response = RedirectResponse("https://github.com/login/oauth/authorize?" + urlencode(params))
    response.set_cookie("oauth_state", state, httponly=True, max_age=600)
    return response

@app.get("/auth/github/callback")
def github_callback(code: str, state: str, oauth_state: str | None = Cookie(default=None)):
    if not oauth_state or not secrets.compare_digest(state, oauth_state):
        raise HTTPException(400, "Неверный state")
    token = requests.post(
        "https://github.com/login/oauth/access_token",
        data={"client_id": CLIENT_ID, "client_secret": CLIENT_SECRET, "code": code},
        headers={"Accept": "application/json"}, timeout=10,
    ).json()["access_token"]
    user = requests.get("https://api.github.com/user",
                        headers={"Authorization": f"Bearer {token}"}, timeout=10).json()
    # Здесь: найти/создать пользователя по user["id"] и создать СВОЮ сессию
    return {"github_login": user["login"], "name": user["name"]}`,
      explain: `<p>Токен GitHub остаётся на сервере. Браузеру выдаётся ваша собственная сессия или JWT — так вы не зависите от токенов провайдера.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Пройдите поток вручную',
      level: 'средне',
      text: `<p>Откройте <a href="https://www.oauth.com/playground/" target="_blank" rel="noopener">OAuth 2.0 Playground</a> и пройдите Authorization Code Flow с PKCE по шагам. Для каждого шага запишите,
        какие параметры передаются и зачем. Почему код обменивается на токен запросом с бэкенда, а не прямо в браузере?</p>`,
      solution: `<p>Обмен идёт с бэкенда, потому что он требует <code>client_secret</code>, который нельзя показывать браузеру; к тому же токен не появляется в адресной строке, истории и логах.
        Код одноразовый и короткоживущий, и без secret/verifier бесполезен.</p>`,
    },
    {
      title: 'Вход через GitHub для заметок',
      level: 'сложно',
      text: `<p>Добавьте в API заметок вход через GitHub: после callback найдите или создайте пользователя по <code>github_id</code> и выдайте <b>свои</b> токены (из темы JWT).
        Один пользователь может входить и паролем, и через GitHub — продумайте таблицу <code>user_identities(user_id, provider, provider_user_id)</code>.</p>`,
    },
  ],
  quiz: [
    { q: 'Для чего изначально предназначен OAuth 2.0?', options: ['Для шифрования трафика', 'Для делегирования доступа к ресурсам без передачи пароля', 'Для хранения паролей', 'Для балансировки нагрузки'], answer: 1 },
    { q: 'Зачем параметр <code>state</code>?', options: ['Хранит scopes', 'Защищает от CSRF при возврате с провайдера', 'Задаёт время жизни токена', 'Указывает язык'], answer: 1 },
    { q: 'Какой flow используется для сервис-сервис без пользователя?', options: ['Authorization Code', 'Implicit', 'Client Credentials', 'Device Code'], answer: 2 },
    { q: 'Что такое PKCE?', options: ['Формат токена', 'Защита кода авторизации от перехвата с помощью verifier/challenge', 'Сервер авторизации', 'Тип scope'], answer: 1 },
  ],
  resources: [
    { title: 'OAuth 2.0 Simplified', url: 'https://www.oauth.com/' },
    { title: 'GitHub: авторизация OAuth-приложений', url: 'https://docs.github.com/ru/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps' },
  ],
});

registerContent('openid', {
  intro: `<p><b>OpenID Connect</b> (OIDC) — слой <b>аутентификации</b> поверх OAuth 2.0. Если OAuth отвечает на вопрос «что приложению можно?», то OIDC — «кто этот пользователь?».
    Именно OIDC стоит за кнопками «Войти через Google / Яндекс / Microsoft» и корпоративным единым входом (SSO).</p>`,
  theory: [
    {
      title: 'Что добавляет OIDC',
      html: `<ul>
          <li><b>ID Token</b> — JWT с информацией о пользователе: <code>sub</code> (постоянный уникальный id у провайдера), <code>email</code>, <code>name</code>, <code>iss</code>, <code>aud</code> (= ваш client_id), <code>exp</code>, <code>nonce</code>.</li>
          <li>scope <code>openid</code> (+ <code>profile</code>, <code>email</code>) — признак OIDC-запроса.</li>
          <li><b>UserInfo endpoint</b> — дополнительные данные профиля по access-токену.</li>
          <li><b>Discovery</b>: всё о провайдере по адресу <code>/.well-known/openid-configuration</code> — URL авторизации, токенов, JWKS с публичными ключами.</li>
        </ul>`,
    },
    {
      title: 'Проверка ID Token',
      html: `<p>Нельзя просто декодировать ID Token и поверить ему. Обязательно проверьте:</p>
        <ol>
          <li>подпись — публичным ключом провайдера из JWKS;</li>
          <li><code>iss</code> — ожидаемый провайдер;</li>
          <li><code>aud</code> — ваш client_id (иначе токен, выданный другому приложению, подойдёт и вам);</li>
          <li><code>exp</code> — не истёк;</li>
          <li><code>nonce</code> — совпадает с отправленным (защита от повтора).</li>
        </ol>
        <p>Идентифицируйте пользователя по паре <code>(iss, sub)</code>, а не по email: email может смениться или быть не подтверждён.</p>
        <p class="note">Готовые библиотеки делают всё это за вас: <b>Authlib</b> в Python. Свою реализацию OIDC писать не стоит.</p>`,
    },
    {
      title: 'SSO и провайдеры',
      html: `<p><b>Single Sign-On</b>: один вход — доступ ко многим приложениям компании. Провайдеры идентичности (IdP): Keycloak (open-source, можно развернуть у себя), Auth0, Okta, Microsoft Entra ID, Google Workspace.</p>
        <p>Частое архитектурное решение — не писать аутентификацию самому, а вынести её в IdP: приложение лишь проверяет токены.</p>`,
    },
  ],
  examples: [
    {
      title: 'Discovery-документ',
      lang: 'bash',
      code: String.raw`
curl https://accounts.google.com/.well-known/openid-configuration
# {
#   "issuer": "https://accounts.google.com",
#   "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
#   "token_endpoint": "https://oauth2.googleapis.com/token",
#   "userinfo_endpoint": "https://openidconnect.googleapis.com/v1/userinfo",
#   "jwks_uri": "https://www.googleapis.com/oauth2/v3/certs",
#   ...
# }`,
    },
    {
      title: '«Войти через Google» с Authlib',
      lang: 'python',
      code: String.raw`
# pip install authlib httpx itsdangerous
import os
from authlib.integrations.starlette_client import OAuth
from fastapi import FastAPI, Request
from starlette.middleware.sessions import SessionMiddleware

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=os.environ["SESSION_SECRET"])

oauth = OAuth()
oauth.register(
    name="google",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_id=os.environ["GOOGLE_CLIENT_ID"],
    client_secret=os.environ["GOOGLE_CLIENT_SECRET"],
    client_kwargs={"scope": "openid email profile"},
)

@app.get("/login/google")
async def login_google(request: Request):
    redirect_uri = request.url_for("auth_google")
    return await oauth.google.authorize_redirect(request, redirect_uri)   # state, nonce, PKCE — автоматически

@app.get("/auth/google")
async def auth_google(request: Request):
    token = await oauth.google.authorize_access_token(request)   # обмен кода + проверка ID Token
    claims = token["userinfo"]
    # Найти/создать пользователя по (claims["iss"], claims["sub"]), выдать свою сессию
    return {"sub": claims["sub"], "email": claims.get("email"), "name": claims.get("name")}`,
    },
  ],
  tasks: [
    {
      title: 'Изучите ID Token',
      level: 'легко',
      text: `<p>В <a href="https://developers.google.com/oauthplayground/" target="_blank" rel="noopener">Google OAuth Playground</a> выберите scopes <code>openid email profile</code>, пройдите авторизацию и получите токены.
        Вставьте <code>id_token</code> в jwt.io: найдите <code>iss</code>, <code>aud</code>, <code>sub</code>, <code>exp</code>. Какой алгоритм подписи используется?</p>`,
    },
    {
      title: 'Свой IdP на Keycloak',
      level: 'сложно',
      text: `<p>Запустите Keycloak в Docker (<code>quay.io/keycloak/keycloak start-dev</code>), создайте realm, клиента и пользователя. Подключите вход через Keycloak к API заметок с помощью Authlib.
        API должно принимать access-токены Keycloak, проверяя подпись по JWKS.</p>`,
    },
  ],
  quiz: [
    { q: 'Чем OIDC отличается от OAuth 2.0?', options: ['Ничем', 'Добавляет аутентификацию: ID Token с данными о пользователе', 'Заменяет HTTPS', 'Использует XML'], answer: 1 },
    { q: 'По какому полю надёжно идентифицировать пользователя провайдера?', options: ['email', 'name', 'iss + sub', 'access_token'], answer: 2 },
    { q: 'Зачем проверять <code>aud</code> в ID Token?', options: ['Чтобы узнать язык', 'Чтобы убедиться, что токен выдан именно вашему приложению', 'Для проверки срока', 'Это необязательно'], answer: 1 },
  ],
  resources: [
    { title: 'OpenID Connect: как это работает', url: 'https://openid.net/developers/how-connect-works/' },
    { title: 'Authlib: интеграция с FastAPI', url: 'https://docs.authlib.org/en/latest/client/fastapi.html' },
  ],
});

registerContent('saml', {
  intro: `<p><b>SAML 2.0</b> — XML-стандарт единого входа (SSO), появившийся в 2005 году. Он старше OIDC, сложнее и тяжелее, но до сих пор царит в корпоративном мире:
    если вы продаёте B2B-продукт крупным компаниям, вас обязательно спросят «а у вас есть SAML SSO?».</p>`,
  theory: [
    {
      title: 'Как работает SAML',
      html: `<ul>
          <li><b>IdP</b> (Identity Provider) — корпоративная система входа: Okta, Microsoft Entra ID (Azure AD), ADFS, Keycloak.</li>
          <li><b>SP</b> (Service Provider) — ваше приложение.</li>
          <li>Пользователь заходит в приложение → SP перенаправляет в IdP с <b>AuthnRequest</b> → пользователь входит в IdP → браузер отправляет POST-запросом на SP подписанный XML <b>SAML Response</b> с <b>Assertion</b> (кто пользователь, его атрибуты и группы) → SP проверяет подпись и создаёт сессию.</li>
          <li>Доверие настраивается обменом <b>метаданными</b> (XML с URL и сертификатами).</li>
        </ul>
        <p>SAML vs OIDC: оба решают SSO; OIDC — JSON/JWT, проще, подходит для мобильных и API. SAML — XML, только браузерный вход, но глубоко интегрирован в enterprise.</p>
        <p class="note">Проверка XML-подписей — источник множества уязвимостей (XML Signature Wrapping). Используйте проверенные библиотеки (<code>python3-saml</code>, <code>pysaml2</code>) или сервисы вроде WorkOS, Auth0, Keycloak как посредника.</p>`,
    },
  ],
  examples: [
    {
      title: 'Фрагмент SAML Assertion',
      lang: 'xml',
      code: String.raw`
<saml:Assertion ID="_a1b2c3" IssueInstant="2026-10-05T10:00:00Z">
  <saml:Issuer>https://idp.company.com</saml:Issuer>
  <ds:Signature>...</ds:Signature>
  <saml:Subject>
    <saml:NameID>anna.ivanova@company.com</saml:NameID>
  </saml:Subject>
  <saml:Conditions NotBefore="2026-10-05T10:00:00Z" NotOnOrAfter="2026-10-05T10:05:00Z">
    <saml:AudienceRestriction>
      <saml:Audience>https://notes.example.com/saml/metadata</saml:Audience>
    </saml:AudienceRestriction>
  </saml:Conditions>
  <saml:AttributeStatement>
    <saml:Attribute Name="groups">
      <saml:AttributeValue>engineering</saml:AttributeValue>
    </saml:Attribute>
  </saml:AttributeStatement>
</saml:Assertion>`,
      explain: `<p>Сравните с ID Token в OIDC: те же идеи (издатель, субъект, аудитория, срок, подпись), но в XML.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Сравните протоколы',
      level: 'легко',
      text: `<p>Составьте таблицу соответствия понятий SAML и OIDC: IdP ↔ ?, SP ↔ ?, Assertion ↔ ?, NameID ↔ ?, метаданные ↔ ?, Audience ↔ ?</p>`,
      solution: `<p>IdP ↔ OpenID Provider (Authorization Server); SP ↔ Client (Relying Party); Assertion ↔ ID Token; NameID ↔ <code>sub</code>; метаданные ↔ discovery-документ <code>.well-known/openid-configuration</code> + JWKS; Audience ↔ <code>aud</code>.</p>`,
    },
  ],
  quiz: [
    { q: 'В каком формате передаются данные в SAML?', options: ['JSON', 'XML', 'Protobuf', 'YAML'], answer: 1 },
    { q: 'Что такое SP в терминах SAML?', options: ['Сервер идентификации', 'Ваше приложение, принимающее вход', 'Сертификат', 'Протокол передачи'], answer: 1 },
  ],
  resources: [
    { title: 'Okta: что такое SAML', url: 'https://developer.okta.com/docs/concepts/saml/' },
  ],
});
