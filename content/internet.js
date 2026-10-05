// Раздел 1. Интернет

registerContent('how-internet-works', {
  intro: `<p>Каждый раз, когда кто-то открывает ваш сайт или вызывает ваш API, запрос проходит через десятки устройств по всему миру.
    Бэкенд-разработчику не нужно быть сетевым инженером, но базовая картина обязательна: без неё не понять ни таймауты,
    ни ошибки соединения, ни то, почему сервер «не виден снаружи».</p>`,
  theory: [
    {
      title: 'Интернет — это сеть сетей',
      html: `<p>Интернет — не одна большая сеть, а множество независимых сетей (домашних, офисных, сетей провайдеров и дата-центров),
        соединённых между собой. Провайдеры договариваются обмениваться трафиком, и благодаря этому пакет из вашего ноутбука
        может дойти до сервера на другом континенте.</p>
        <ul>
          <li><b>Клиент</b> — устройство, которое отправляет запрос (браузер, мобильное приложение, другой сервер).</li>
          <li><b>Сервер</b> — программа (и компьютер, на котором она работает), которая принимает запросы и отвечает на них.</li>
          <li><b>Маршрутизатор (роутер)</b> — устройство, которое пересылает пакеты дальше, в сторону получателя.</li>
        </ul>`,
    },
    {
      title: 'IP-адреса и порты',
      html: `<p>У каждого устройства в сети есть <b>IP-адрес</b> — как почтовый адрес дома.</p>
        <ul>
          <li><b>IPv4</b>: четыре числа от 0 до 255, например <code>93.184.216.34</code>. Всего около 4,3 млрд адресов — их уже не хватает.</li>
          <li><b>IPv6</b>: длинные адреса вида <code>2606:2800:220:1::248</code>, их практически бесконечно много.</li>
          <li><b>Частные адреса</b> (<code>192.168.x.x</code>, <code>10.x.x.x</code>) работают только внутри локальной сети. <code>127.0.0.1</code> (localhost) — это сам компьютер.</li>
        </ul>
        <p>Если IP — адрес дома, то <b>порт</b> — номер квартиры. На одном сервере могут работать разные программы,
        и порт указывает, какой из них адресован пакет: 80 — HTTP, 443 — HTTPS, 22 — SSH, 5432 — PostgreSQL.
        Ваш учебный сервер обычно слушает порт 8000 или 5000.</p>`,
    },
    {
      title: 'Пакеты и маршрутизация',
      html: `<p>Данные не передаются одним куском. Они делятся на небольшие <b>пакеты</b> (обычно до ~1500 байт), у каждого есть адрес
        отправителя и получателя. Пакеты одного сообщения могут идти разными маршрутами и приходить в разном порядке —
        принимающая сторона собирает их обратно.</p>
        <p>Каждый роутер на пути смотрит на адрес получателя и решает, кому передать пакет дальше. Такой шаг называется <b>хоп</b> (hop).
        Путь от вас до крупного сайта обычно занимает 10–20 хопов.</p>`,
    },
    {
      title: 'Модель TCP/IP и протоколы',
      html: `<p><b>Протокол</b> — набор правил общения. Сетевые протоколы устроены слоями, каждый решает свою задачу:</p>
        <table>
          <tr><th>Уровень</th><th>Задача</th><th>Примеры</th></tr>
          <tr><td>Прикладной</td><td>Смысл данных для программ</td><td>HTTP, DNS, SMTP, SSH</td></tr>
          <tr><td>Транспортный</td><td>Доставка между программами (порты), надёжность</td><td>TCP, UDP</td></tr>
          <tr><td>Сетевой</td><td>Доставка между компьютерами (IP-адреса), маршрутизация</td><td>IP</td></tr>
          <tr><td>Канальный</td><td>Передача по конкретному проводу или Wi-Fi</td><td>Ethernet, Wi-Fi</td></tr>
        </table>
        <p><b>TCP</b> гарантирует, что все данные дойдут, без потерь и в правильном порядке: перед передачей устанавливается соединение
        («тройное рукопожатие»: SYN → SYN-ACK → ACK), потерянные пакеты отправляются заново. На TCP работают HTTP/1.1 и HTTP/2.</p>
        <p><b>UDP</b> просто отправляет пакеты без гарантий — зато быстрее. Используется для видеозвонков, игр, DNS и в HTTP/3 (через протокол QUIC).</p>`,
    },
    {
      title: 'Что происходит при открытии сайта',
      html: `<ol>
          <li>Браузер выясняет IP-адрес домена через <b>DNS</b>.</li>
          <li>Устанавливает <b>TCP</b>-соединение с сервером (порт 443).</li>
          <li>Выполняет <b>TLS</b>-рукопожатие — договаривается о шифровании.</li>
          <li>Отправляет <b>HTTP</b>-запрос, например <code>GET /</code>.</li>
          <li>Сервер (ваш бэкенд!) обрабатывает запрос и возвращает HTTP-ответ.</li>
          <li>Браузер отрисовывает страницу и загружает остальные ресурсы.</li>
        </ol>
        <p class="note">Каждая следующая тема этого раздела подробно разбирает один из этих шагов.</p>`,
    },
  ],
  examples: [
    {
      title: 'Посмотреть свой IP-адрес и проверить связь',
      lang: 'bash',
      code: String.raw`
# Windows: адреса сетевых интерфейсов
ipconfig
# Linux / macOS
ip addr        # или ifconfig

# Проверить, доступен ли сервер, и сколько идёт пакет туда и обратно
ping google.com

# Посмотреть маршрут пакета (все хопы)
tracert google.com     # Windows
traceroute google.com  # Linux / macOS`,
      explain: `<p><code>ping</code> показывает время в миллисекундах (RTT — round-trip time). Внутри одного города это 1–10 мс,
        до другого континента — 100–200 мс. Эта задержка добавляется к каждому запросу к вашему серверу.</p>`,
    },
    {
      title: 'TCP-соединение из Python',
      lang: 'python',
      code: String.raw`
import socket

# Открываем TCP-соединение с сервером example.com на порт 80
with socket.create_connection(("example.com", 80), timeout=5) as sock:
    # Отправляем «сырой» HTTP-запрос — это просто текст
    request = "GET / HTTP/1.1\r\nHost: example.com\r\nConnection: close\r\n\r\n"
    sock.sendall(request.encode())

    # Читаем ответ кусками, пока сервер не закроет соединение
    response = b""
    while chunk := sock.recv(4096):
        response += chunk

print(response.decode(errors="replace")[:300])`,
      explain: `<p>Это то, что делает браузер «под капотом»: открывает TCP-сокет и пишет в него текст по правилам HTTP.
        Все веб-фреймворки строятся поверх этого механизма.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Трассировка маршрута',
      level: 'легко',
      text: `<p>Выполните <code>tracert</code> (или <code>traceroute</code>) до трёх сайтов: одного российского, одного европейского и одного американского.
        Сравните количество хопов и время отклика. Попробуйте объяснить разницу.</p>`,
      hint: `<p>Звёздочки <code>* * *</code> означают, что роутер не отвечает на служебные запросы — это нормально.</p>`,
      solution: `<p>Обычно чем дальше физически сервер, тем больше время отклика: свет в оптоволокне проходит ~200 км за 1 мс,
        а до США и обратно — больше 15 000 км. Число хопов не всегда растёт с расстоянием: крупные компании используют CDN и
        держат серверы близко к пользователям, поэтому «американский» сайт может отвечать из соседнего города.</p>`,
    },
    {
      title: 'Порт-сканер своими руками',
      level: 'средне',
      text: `<p>Напишите на Python функцию <code>is_port_open(host, port)</code>, которая возвращает <code>True</code>, если на порту
        принимаются TCP-соединения. Проверьте порты 22, 80, 443 и 8080 на <code>localhost</code> и на <code>example.com</code>.</p>
        <p class="note">Сканируйте только свои машины и публичные тестовые хосты — сканирование чужих серверов может нарушать правила.</p>`,
      hint: `<p>Используйте <code>socket.create_connection</code> с таймаутом и перехватывайте <code>OSError</code>.</p>`,
      solutionCode: String.raw`
import socket

def is_port_open(host: str, port: int, timeout: float = 1.0) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:  # отказ в соединении, таймаут, хост не найден
        return False

for host in ("localhost", "example.com"):
    for port in (22, 80, 443, 8080):
        state = "открыт" if is_port_open(host, port) else "закрыт"
        print(f"{host}:{port} — {state}")`,
    },
    {
      title: 'TCP или UDP?',
      level: 'легко',
      text: `<p>Для каждого сценария решите, какой транспорт подходит лучше, и объясните почему:
        онлайн-игра-шутер, загрузка файла, банковский перевод через API, видеозвонок, DNS-запрос.</p>`,
      solution: `<ul>
          <li><b>Шутер</b> — UDP: старая позиция игрока уже не нужна, важнее скорость.</li>
          <li><b>Загрузка файла</b> — TCP: нельзя потерять ни байта.</li>
          <li><b>Банковский API</b> — TCP (HTTPS): нужна надёжность.</li>
          <li><b>Видеозвонок</b> — UDP: потерянный кадр лучше пропустить, чем ждать.</li>
          <li><b>DNS</b> — обычно UDP: запрос и ответ маленькие, при потере проще переспросить.</li>
        </ul>`,
    },
  ],
  quiz: [
    { q: 'Что указывает порт в сетевом адресе?', options: ['Страну сервера', 'Программу на компьютере, которой адресованы данные', 'Скорость соединения', 'Тип IP-адреса'], answer: 1, explain: 'IP-адрес определяет компьютер, а порт — конкретную программу (сервис) на нём.' },
    { q: 'Какой протокол гарантирует доставку данных в правильном порядке?', options: ['UDP', 'IP', 'TCP', 'Ethernet'], answer: 2, explain: 'TCP устанавливает соединение, нумерует данные и пересылает потерянные пакеты.' },
    { q: 'Что такое <code>127.0.0.1</code>?', options: ['Адрес роутера', 'Адрес DNS-сервера Google', 'Текущий компьютер (localhost)', 'Публичный адрес сервера'], answer: 2, explain: 'Это loopback-адрес: запросы на него никуда не уходят из компьютера.' },
    { q: 'На каком уровне работает HTTP?', options: ['Прикладном', 'Транспортном', 'Сетевом', 'Канальном'], answer: 0, explain: 'HTTP — прикладной протокол, он работает поверх транспортного TCP (или QUIC/UDP в HTTP/3).' },
  ],
  resources: [
    { title: 'MDN: Как работает интернет', url: 'https://developer.mozilla.org/ru/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work' },
    { title: 'Cloudflare Learning: что такое интернет-протокол', url: 'https://www.cloudflare.com/learning/network-layer/internet-protocol/' },
  ],
});

registerContent('what-is-http', {
  intro: `<p><b>HTTP</b> (HyperText Transfer Protocol) — язык, на котором клиенты разговаривают с вашим бэкендом.
    Это главный протокол бэкенд-разработчика: каждая функция вашего API — это обработчик HTTP-запроса.</p>`,
  theory: [
    {
      title: 'Запрос и ответ',
      html: `<p>HTTP устроен очень просто: клиент отправляет <b>запрос</b>, сервер возвращает <b>ответ</b>. Оба — это текст определённой структуры:</p>
        <ul>
          <li><b>Стартовая строка</b>: у запроса — метод, путь и версия (<code>GET /users/42 HTTP/1.1</code>), у ответа — версия и статус (<code>HTTP/1.1 200 OK</code>).</li>
          <li><b>Заголовки</b> — пары «имя: значение» с метаданными.</li>
          <li>Пустая строка.</li>
          <li><b>Тело</b> (необязательно) — сами данные: HTML, JSON, файл.</li>
        </ul>
        <p>HTTP — протокол <b>без состояния</b> (stateless): сервер не помнит предыдущие запросы. Чтобы «узнать» пользователя,
        клиент каждый раз присылает cookie или токен.</p>`,
    },
    {
      title: 'Методы',
      html: `<table>
          <tr><th>Метод</th><th>Назначение</th><th>Тело</th><th>Идемпотентен</th></tr>
          <tr><td><code>GET</code></td><td>Получить ресурс</td><td>Нет</td><td>Да</td></tr>
          <tr><td><code>POST</code></td><td>Создать ресурс / выполнить действие</td><td>Да</td><td>Нет</td></tr>
          <tr><td><code>PUT</code></td><td>Полностью заменить ресурс</td><td>Да</td><td>Да</td></tr>
          <tr><td><code>PATCH</code></td><td>Частично изменить ресурс</td><td>Да</td><td>Не обязательно</td></tr>
          <tr><td><code>DELETE</code></td><td>Удалить ресурс</td><td>Обычно нет</td><td>Да</td></tr>
        </table>
        <p><b>Идемпотентность</b> — повторный одинаковый запрос даёт тот же результат, что и первый. Два одинаковых <code>DELETE /users/42</code>
        оставят систему в том же состоянии, а два <code>POST /orders</code> создадут два заказа. Это важно при повторах после сетевых ошибок.</p>`,
    },
    {
      title: 'Коды состояния',
      html: `<p>Трёхзначный код в ответе сообщает, чем закончился запрос. Первая цифра — класс:</p>
        <ul>
          <li><b>1xx</b> — информационные (редко встречаются напрямую).</li>
          <li><b>2xx — успех</b>: <code>200 OK</code>, <code>201 Created</code> (создано), <code>204 No Content</code> (успех без тела).</li>
          <li><b>3xx — перенаправление</b>: <code>301 Moved Permanently</code>, <code>302 Found</code>, <code>304 Not Modified</code> (бери из кэша).</li>
          <li><b>4xx — ошибка клиента</b>: <code>400 Bad Request</code>, <code>401 Unauthorized</code> (не представился), <code>403 Forbidden</code> (нет прав),
            <code>404 Not Found</code>, <code>422 Unprocessable Entity</code> (данные не прошли проверку), <code>429 Too Many Requests</code>.</li>
          <li><b>5xx — ошибка сервера</b>: <code>500 Internal Server Error</code>, <code>502 Bad Gateway</code>, <code>503 Service Unavailable</code>, <code>504 Gateway Timeout</code>.</li>
        </ul>
        <p class="note">Правило: если виноват клиент — 4xx, если сервер — 5xx. Никогда не отвечайте <code>200</code> с текстом «ошибка» в теле.</p>`,
    },
    {
      title: 'Важные заголовки',
      html: `<ul>
          <li><code>Host</code> — какой домен запрашивается (на одном IP может быть много сайтов).</li>
          <li><code>Content-Type</code> — формат тела: <code>application/json</code>, <code>text/html; charset=utf-8</code>.</li>
          <li><code>Content-Length</code> — размер тела в байтах.</li>
          <li><code>Authorization</code> — данные для аутентификации, например <code>Bearer &lt;токен&gt;</code>.</li>
          <li><code>Accept</code> — какие форматы клиент готов принять.</li>
          <li><code>Cookie</code> / <code>Set-Cookie</code> — передача cookie.</li>
          <li><code>Cache-Control</code> — правила кэширования.</li>
          <li><code>Location</code> — куда перенаправлять (с кодами 3xx и 201).</li>
        </ul>`,
    },
    {
      title: 'Версии HTTP и URL',
      html: `<p><b>HTTP/1.1</b> — текстовый, один запрос за раз на соединение. <b>HTTP/2</b> — бинарный, много параллельных запросов в одном соединении.
        <b>HTTP/3</b> работает поверх QUIC (UDP) и быстрее на нестабильных сетях. Смысл методов, статусов и заголовков во всех версиях одинаков.</p>
        <p>Части URL <code>https://api.shop.ru:443/products/7?color=red#reviews</code>:</p>
        <ul>
          <li><code>https</code> — схема (протокол), <code>api.shop.ru</code> — хост, <code>443</code> — порт;</li>
          <li><code>/products/7</code> — путь, <code>?color=red</code> — query-параметры;</li>
          <li><code>#reviews</code> — фрагмент: обрабатывается только браузером и <b>не отправляется на сервер</b>.</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'Как выглядят запрос и ответ',
      lang: 'http',
      code: String.raw`
POST /api/users HTTP/1.1
Host: example.com
Content-Type: application/json
Content-Length: 41

{"name": "Анна", "email": "anna@mail.ru"}

HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/users/17

{"id": 17, "name": "Анна", "email": "anna@mail.ru"}`,
    },
    {
      title: 'Запросы из терминала через curl',
      lang: 'bash',
      code: String.raw`
# GET с выводом заголовков ответа (-i)
curl -i https://httpbin.org/get

# POST с JSON-телом
curl -X POST https://httpbin.org/post \
     -H "Content-Type: application/json" \
     -d '{"name": "Анна"}'

# Подробно: видно TLS-рукопожатие, заголовки запроса и ответа
curl -v https://example.com -o /dev/null`,
      explain: `<p><a href="https://httpbin.org" target="_blank" rel="noopener">httpbin.org</a> — учебный сервис, который возвращает вам ваш же запрос. Удобно для экспериментов.</p>`,
    },
    {
      title: 'Запросы из Python (библиотека requests)',
      lang: 'python',
      code: String.raw`
# pip install requests
import requests

r = requests.get("https://httpbin.org/get", params={"q": "python"})
print(r.status_code)                # 200
print(r.headers["Content-Type"])    # application/json
print(r.json()["args"])             # {'q': 'python'}

r = requests.post("https://httpbin.org/post", json={"name": "Анна"})
print(r.json()["json"])             # {'name': 'Анна'}

r = requests.get("https://httpbin.org/status/404")
if not r.ok:                        # ok == True для кодов < 400
    print("Ошибка:", r.status_code)`,
    },
  ],
  tasks: [
    {
      title: 'Исследуйте реальные ответы',
      level: 'легко',
      text: `<p>Откройте любой сайт, нажмите <b>F12</b> → вкладка <b>Network (Сеть)</b> и обновите страницу. Найдите:
        главный HTML-документ, его статус, значение <code>Content-Type</code> и <code>Cache-Control</code>;
        хотя бы один запрос со статусом 304 или 3xx.</p>`,
      hint: `<p>Кликните на запрос — справа откроются вкладки Headers, Response, Timing.</p>`,
    },
    {
      title: 'Подберите статус',
      level: 'легко',
      text: `<p>Какой код ответа должен вернуть API в каждой ситуации?</p>
        <ol>
          <li>Пользователь зарегистрировался.</li>
          <li>Запрошен товар с id, которого нет.</li>
          <li>В поле <code>email</code> передана строка без <code>@</code>.</li>
          <li>Пользователь без токена запрашивает свой профиль.</li>
          <li>Обычный пользователь пытается удалить чужой аккаунт.</li>
          <li>Сервер не смог подключиться к базе данных.</li>
          <li>Клиент отправил 1000 запросов за секунду.</li>
        </ol>`,
      solution: `<ol><li>201 Created</li><li>404 Not Found</li><li>422 Unprocessable Entity (или 400)</li><li>401 Unauthorized</li>
        <li>403 Forbidden</li><li>500 (или 503, если это временная недоступность)</li><li>429 Too Many Requests</li></ol>`,
    },
    {
      title: 'Мини-клиент для API',
      level: 'средне',
      text: `<p>С помощью <code>requests</code> напишите скрипт, который получает список пользователей с
        <code>https://jsonplaceholder.typicode.com/users</code> и печатает имя и город каждого.
        Затем создайте пост через <code>POST /posts</code> и выведите код ответа и полученный <code>id</code>.</p>`,
      solutionCode: String.raw`
import requests

BASE = "https://jsonplaceholder.typicode.com"

users = requests.get(f"{BASE}/users", timeout=10).json()
for u in users:
    print(f'{u["name"]} — {u["address"]["city"]}')

r = requests.post(f"{BASE}/posts", json={"title": "Привет", "body": "Текст", "userId": 1}, timeout=10)
print(r.status_code, r.json()["id"])   # 201 101`,
    },
  ],
  quiz: [
    { q: 'Какой метод следует использовать для частичного изменения ресурса?', options: ['GET', 'PUT', 'PATCH', 'POST'], answer: 2, explain: 'PATCH меняет только переданные поля, PUT заменяет ресурс целиком.' },
    { q: 'Пользователь не прислал токен. Какой код вернуть?', options: ['400', '401', '403', '404'], answer: 1, explain: '401 — «не аутентифицирован». 403 — когда пользователь известен, но прав у него нет.' },
    { q: 'Какая часть URL не отправляется на сервер?', options: ['Query-параметры', 'Путь', 'Фрагмент после #', 'Порт'], answer: 2, explain: 'Фрагмент используется только браузером (например, для прокрутки к якорю).' },
    { q: 'Что значит «HTTP — протокол без состояния»?', options: ['Сервер не хранит данные в БД', 'Каждый запрос независим, сервер не помнит предыдущие', 'Ответ не имеет статуса', 'Соединение нельзя переиспользовать'], answer: 1, explain: 'Поэтому для «входа в систему» клиент сам присылает cookie или токен в каждом запросе.' },
    { q: 'Какой метод НЕ идемпотентен?', options: ['GET', 'PUT', 'DELETE', 'POST'], answer: 3, explain: 'Повторный POST обычно создаёт ещё один ресурс.' },
  ],
  resources: [
    { title: 'MDN: Обзор протокола HTTP', url: 'https://developer.mozilla.org/ru/docs/Web/HTTP/Overview' },
    { title: 'MDN: Коды ответа HTTP', url: 'https://developer.mozilla.org/ru/docs/Web/HTTP/Status' },
    { title: 'HTTP-коты: статусы в картинках', url: 'https://http.cat' },
  ],
});

registerContent('domain-name', {
  intro: `<p>Запоминать IP-адреса неудобно, поэтому придумали <b>доменные имена</b> — человекочитаемые адреса вроде <code>github.com</code>.
    Бэкенд-разработчику домены нужны, чтобы публиковать свои сервисы, настраивать поддомены (<code>api.</code>, <code>admin.</code>) и выпускать HTTPS-сертификаты.</p>`,
  theory: [
    {
      title: 'Структура домена',
      html: `<p>Домен читается <b>справа налево</b>, от общего к частному. В <code>api.shop.example.ru</code>:</p>
        <ul>
          <li><code>.</code> (невидимая точка в конце) — корень DNS;</li>
          <li><code>ru</code> — <b>домен верхнего уровня (TLD)</b>;</li>
          <li><code>example</code> — домен второго уровня, его покупают у регистратора;</li>
          <li><code>shop</code>, <code>api</code> — поддомены, их владелец создаёт сам, бесплатно и сколько угодно.</li>
        </ul>
        <p>Виды TLD: общие (<code>.com</code>, <code>.org</code>, <code>.dev</code>), национальные (<code>.ru</code>, <code>.de</code>, <code>.uk</code>), и новые (<code>.app</code>, <code>.shop</code>).</p>`,
    },
    {
      title: 'Кто управляет доменами',
      html: `<ul>
          <li><b>ICANN</b> — международная организация, которая координирует систему доменов в целом.</li>
          <li><b>Реестр (registry)</b> — управляет конкретной зоной, например <code>.ru</code> (Координационный центр доменов .RU/.РФ).</li>
          <li><b>Регистратор (registrar)</b> — компания, у которой вы покупаете домен (REG.RU, Namecheap, Cloudflare и др.).</li>
          <li><b>Администратор домена</b> — вы. Домен арендуется на срок (обычно год) и его нужно продлевать.</li>
        </ul>
        <p class="note">Забытое продление домена — классическая причина «упавшего» продакшена. Включайте автопродление.</p>`,
    },
    {
      title: 'WHOIS и делегирование',
      html: `<p><b>WHOIS</b> — публичная база, где можно узнать регистратора, даты регистрации и окончания, NS-серверы домена.</p>
        <p>При покупке домена вы указываете <b>NS-серверы</b> (name servers) — серверы, которые будут отвечать на DNS-запросы о вашем домене.
        Это может быть DNS регистратора, Cloudflare, AWS Route 53 и т. д. Сами записи (какой IP у <code>api.example.ru</code>) настраиваются уже там.</p>`,
    },
  ],
  examples: [
    {
      title: 'Информация о домене',
      lang: 'bash',
      code: String.raw`
# Linux / macOS (на Windows используйте сайт whois или WSL)
whois github.com

# Какие NS-серверы обслуживают домен
nslookup -type=NS github.com`,
    },
    {
      title: 'Разбор URL в Python',
      lang: 'python',
      code: String.raw`
from urllib.parse import urlparse

url = urlparse("https://api.shop.example.ru:8443/v1/items?page=2")
print(url.scheme)    # https
print(url.hostname)  # api.shop.example.ru
print(url.port)      # 8443
print(url.path)      # /v1/items
print(url.query)     # page=2

parts = url.hostname.split(".")
print("TLD:", parts[-1])                       # ru
print("Домен 2-го уровня:", ".".join(parts[-2:]))  # example.ru`,
    },
  ],
  tasks: [
    {
      title: 'WHOIS-расследование',
      level: 'легко',
      text: `<p>С помощью whois (команда или сайт, например <a href="https://who.is" target="_blank" rel="noopener">who.is</a>) узнайте для трёх известных сайтов:
        регистратора, дату создания домена, дату окончания и NS-серверы. Какой домен самый старый?</p>`,
    },
    {
      title: 'Спроектируйте поддомены',
      level: 'легко',
      text: `<p>Вы запускаете интернет-магазин <code>myshop.ru</code>. Придумайте схему поддоменов для: основного сайта, REST API,
        админки, статики/картинок, тестового окружения. Объясните, зачем API выносить на отдельный поддомен.</p>`,
      solution: `<p>Пример: <code>myshop.ru</code> и <code>www.myshop.ru</code> — сайт; <code>api.myshop.ru</code> — API; <code>admin.myshop.ru</code> — админка;
        <code>cdn.myshop.ru</code> или <code>static.myshop.ru</code> — статика; <code>staging.myshop.ru</code> и <code>api.staging.myshop.ru</code> — тестовое окружение.</p>
        <p>Отдельный поддомен для API позволяет направить его на другие серверы, независимо масштабировать, настроить свои правила
        кэширования, CORS и лимитов, не затрагивая сайт.</p>`,
    },
    {
      title: 'Функция-валидатор домена',
      level: 'средне',
      text: `<p>Напишите функцию <code>is_valid_domain(name)</code>. Правила: части разделены точками, минимум две части;
        каждая часть 1–63 символа, только латинские буквы, цифры и дефис; часть не начинается и не заканчивается дефисом;
        общая длина не больше 253; TLD не состоит только из цифр.</p>`,
      hint: `<p>Удобно использовать регулярное выражение для одной части: <code>^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$</code></p>`,
      solutionCode: String.raw`
import re

LABEL = re.compile(r"^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$")

def is_valid_domain(name: str) -> bool:
    name = name.lower().rstrip(".")
    if len(name) > 253:
        return False
    parts = name.split(".")
    if len(parts) < 2 or parts[-1].isdigit():
        return False
    return all(LABEL.match(p) for p in parts)

assert is_valid_domain("api.example.ru")
assert not is_valid_domain("-bad.com")
assert not is_valid_domain("localhost")
assert not is_valid_domain("1.2.3.4")
print("Все проверки пройдены")`,
    },
  ],
  quiz: [
    { q: 'Что такое <code>ru</code> в <code>mail.yandex.ru</code>?', options: ['Поддомен', 'Домен верхнего уровня', 'Домен второго уровня', 'Имя хоста'], answer: 1 },
    { q: 'У кого вы покупаете домен?', options: ['У ICANN', 'У регистратора', 'У хостинг-провайдера обязательно', 'У реестра напрямую'], answer: 1, explain: 'Покупка идёт через аккредитованного регистратора; хостинг может быть у другой компании.' },
    { q: 'Нужно ли платить за поддомен <code>api.mysite.ru</code>, если <code>mysite.ru</code> уже ваш?', options: ['Да, каждый поддомен покупается отдельно', 'Нет, владелец создаёт поддомены сам', 'Только за первые три', 'Да, если он на другом сервере'], answer: 1 },
  ],
  resources: [
    { title: 'MDN: Что такое доменное имя', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_domain_name' },
    { title: 'Cloudflare: что такое домен', url: 'https://www.cloudflare.com/learning/dns/glossary/what-is-a-domain-name/' },
  ],
});

registerContent('hosting', {
  intro: `<p>Написанный бэкенд должен где-то работать 24/7 и быть доступен из интернета. <b>Хостинг</b> — это аренда вычислительных ресурсов
    для этого. Выбор хостинга определяет, сколько вы платите, сколько администрируете сами и как легко масштабироваться.</p>`,
  theory: [
    {
      title: 'Виды хостинга',
      html: `<table>
          <tr><th>Тип</th><th>Что это</th><th>Плюсы</th><th>Минусы</th></tr>
          <tr><td><b>Shared</b> (виртуальный)</td><td>Много сайтов на одном сервере, вы получаете папку и панель</td><td>Дёшево, ничего не настраивать</td><td>Обычно только PHP, нет контроля, «соседи» влияют</td></tr>
          <tr><td><b>VPS/VDS</b></td><td>Виртуальная машина с root-доступом</td><td>Полный контроль, недорого</td><td>Всё администрируете сами</td></tr>
          <tr><td><b>Выделенный сервер</b></td><td>Физический сервер целиком ваш</td><td>Максимум мощности</td><td>Дорого, долго заказывать</td></tr>
          <tr><td><b>Облако (IaaS)</b></td><td>AWS, Google Cloud, Azure, Yandex Cloud: ВМ, БД, сети по API</td><td>Масштабирование за минуты, сотни сервисов</td><td>Сложно, легко переплатить</td></tr>
          <tr><td><b>PaaS</b></td><td>Render, Railway, Fly.io, Heroku: загрузил код — работает</td><td>Не нужно думать о серверах</td><td>Дороже при росте, меньше гибкости</td></tr>
          <tr><td><b>Serverless</b></td><td>AWS Lambda, Cloudflare Workers: функция на запрос</td><td>Платите за вызовы, масштаб автоматически</td><td>Ограничения по времени, холодный старт</td></tr>
        </table>`,
    },
    {
      title: 'Ключевые понятия',
      html: `<ul>
          <li><b>Публичный IP</b> — адрес, по которому сервер виден из интернета.</li>
          <li><b>Аптайм (uptime)</b> — доля времени, когда сервис работает. 99,9% — это около 8,8 часа простоя в год, 99,99% — 53 минуты.</li>
          <li><b>Регион и зона доступности</b> — где физически стоит дата-центр. Чем ближе к пользователям, тем меньше задержка.</li>
          <li><b>Managed-сервисы</b> — облачный провайдер сам обслуживает БД, бэкапы, обновления.</li>
          <li><b>Статический хостинг / CDN</b> — для HTML/CSS/JS без бэкенда (GitHub Pages, Netlify, Cloudflare Pages).</li>
        </ul>`,
    },
    {
      title: 'Что выбрать на старте',
      html: `<ul>
          <li><b>Учебный проект</b> — PaaS с бесплатным тарифом (Render, Railway) или бесплатный уровень облака.</li>
          <li><b>Хотите научиться администрированию</b> — дешёвый VPS: сами поставите Linux-пакеты, Nginx, настроите HTTPS.</li>
          <li><b>Компания</b> — чаще всего облако + контейнеры (Docker, Kubernetes) — к этому курс придёт в последних разделах.</li>
        </ul>
        <p class="note">Код бэкенда должен быть одинаковым для любого хостинга: настройки (порт, адрес БД, секреты) берутся из переменных окружения.</p>`,
    },
  ],
  examples: [
    {
      title: 'Первые шаги на VPS',
      lang: 'bash',
      code: String.raw`
# Подключение к серверу по SSH
ssh root@203.0.113.10

# Обновить пакеты (Ubuntu/Debian)
apt update && apt upgrade -y

# Установить Python и запустить простой сервер на порту 8000
apt install -y python3
python3 -m http.server 8000

# Теперь на своём компьютере откройте http://203.0.113.10:8000`,
      explain: `<p>Адрес <code>203.0.113.10</code> — из диапазона для документации, подставьте IP своего сервера.
        В реальной работе так приложения не запускают: нужен процесс-менеджер (systemd), reverse proxy (Nginx) и HTTPS.</p>`,
    },
    {
      title: 'Чтение настроек из окружения',
      lang: 'python',
      code: String.raw`
import os

# На хостинге PORT и DATABASE_URL задаются в панели управления
PORT = int(os.environ.get("PORT", 8000))
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///local.db")
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"

print(f"Запуск на порту {PORT}, БД: {DATABASE_URL}, debug={DEBUG}")`,
    },
  ],
  tasks: [
    {
      title: 'Сравните тарифы',
      level: 'легко',
      text: `<p>Найдите на сайтах трёх провайдеров (один VPS, одно облако, один PaaS) стоимость минимальной конфигурации: 1 vCPU, 1–2 ГБ RAM.
        Составьте таблицу: цена в месяц, что входит, есть ли бесплатный тариф.</p>`,
    },
    {
      title: 'Посчитайте аптайм',
      level: 'средне',
      text: `<p>Напишите функцию <code>downtime(sla_percent)</code>, которая возвращает допустимое время простоя в год, месяц (30 дней) и неделю
        в удобном виде. Проверьте для 99%, 99,9%, 99,95%, 99,99%.</p>`,
      solutionCode: String.raw`
from datetime import timedelta

def downtime(sla_percent: float) -> dict[str, timedelta]:
    share = 1 - sla_percent / 100
    periods = {"год": timedelta(days=365), "месяц": timedelta(days=30), "неделя": timedelta(weeks=1)}
    return {name: timedelta(seconds=round(p.total_seconds() * share)) for name, p in periods.items()}

for sla in (99, 99.9, 99.95, 99.99):
    d = downtime(sla)
    print(f"{sla}%: год {d['год']}, месяц {d['месяц']}, неделя {d['неделя']}")`,
    },
    {
      title: 'Опубликуйте статическую страницу',
      level: 'средне',
      text: `<p>Создайте файл <code>index.html</code> с вашим именем и опубликуйте его бесплатно на GitHub Pages или Netlify.
        Пришлите ссылку другу и проверьте с телефона. (Пригодится и после темы про Git.)</p>`,
    },
  ],
  quiz: [
    { q: 'Какой вид хостинга даёт root-доступ к виртуальной машине за небольшие деньги?', options: ['Shared', 'VPS', 'Статический хостинг', 'Serverless'], answer: 1 },
    { q: 'Сколько примерно простоя в год допускает SLA 99,9%?', options: ['~53 минуты', '~8,8 часа', '~3,6 дня', '~1 минута'], answer: 1 },
    { q: 'Как правильно передавать адрес базы данных в приложение на хостинге?', options: ['Захардкодить в коде', 'Через переменную окружения', 'Положить в README', 'Через query-параметр запроса'], answer: 1, explain: 'Так один и тот же код работает локально, на тесте и в продакшене с разными настройками.' },
  ],
  resources: [
    { title: 'MDN: Что такое веб-сервер', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_web_server' },
    { title: 'The Twelve-Factor App (рус.)', url: 'https://12factor.net/ru/' },
  ],
});

registerContent('dns', {
  intro: `<p><b>DNS</b> (Domain Name System) — «телефонная книга» интернета: переводит имена вроде <code>github.com</code> в IP-адреса.
    Ошибки DNS — одна из самых частых причин недоступности сервисов, поэтому бэкенд-разработчику важно понимать, как он работает.</p>`,
  theory: [
    {
      title: 'Как происходит DNS-запрос',
      html: `<ol>
          <li>Браузер и ОС проверяют свой <b>кэш</b> — может, адрес уже известен.</li>
          <li>Запрос уходит к <b>рекурсивному резолверу</b> — обычно у провайдера, или публичному (<code>8.8.8.8</code> Google, <code>1.1.1.1</code> Cloudflare).</li>
          <li>Резолвер спрашивает <b>корневой сервер</b>: «Кто отвечает за <code>.com</code>?»</li>
          <li>Затем <b>TLD-сервер</b> <code>.com</code>: «Кто отвечает за <code>github.com</code>?» — получает NS-серверы домена.</li>
          <li>Затем <b>авторитативный сервер</b> домена: «Какой IP у <code>github.com</code>?» — получает ответ.</li>
          <li>Резолвер кэширует ответ на время <b>TTL</b> и возвращает его клиенту.</li>
        </ol>`,
    },
    {
      title: 'Типы DNS-записей',
      html: `<table>
          <tr><th>Тип</th><th>Назначение</th><th>Пример</th></tr>
          <tr><td><code>A</code></td><td>Имя → IPv4</td><td><code>api.site.ru → 203.0.113.10</code></td></tr>
          <tr><td><code>AAAA</code></td><td>Имя → IPv6</td><td><code>site.ru → 2001:db8::1</code></td></tr>
          <tr><td><code>CNAME</code></td><td>Псевдоним другого имени</td><td><code>www.site.ru → site.ru</code></td></tr>
          <tr><td><code>MX</code></td><td>Почтовые серверы домена</td><td><code>site.ru → mx.yandex.net</code></td></tr>
          <tr><td><code>TXT</code></td><td>Произвольный текст: подтверждение владения, SPF, DKIM</td><td><code>"v=spf1 include:_spf.google.com ~all"</code></td></tr>
          <tr><td><code>NS</code></td><td>Какие серверы обслуживают домен</td><td><code>site.ru → ns1.reg.ru</code></td></tr>
        </table>
        <p class="note">На корневой домен (<code>site.ru</code>) нельзя поставить CNAME — только A/AAAA (некоторые провайдеры предлагают обход: ALIAS/ANAME).</p>`,
    },
    {
      title: 'TTL и распространение изменений',
      html: `<p><b>TTL</b> (time to live) — сколько секунд резолверы могут кэшировать запись. При TTL = 3600 после смены IP часть пользователей
        ещё до часа будет ходить на старый сервер. Это и называют «DNS обновляется».</p>
        <p>Практический приём: перед переездом сервера заранее уменьшите TTL до 60–300 секунд, после переезда верните обратно.</p>`,
    },
    {
      title: 'Файл hosts',
      html: `<p>До DNS система смотрит в файл <code>hosts</code> (<code>C:\\Windows\\System32\\drivers\\etc\\hosts</code> или <code>/etc/hosts</code>).
        Там можно вручную привязать имя к IP, например <code>127.0.0.1 myapp.local</code> — удобно для локальной разработки.</p>`,
    },
  ],
  examples: [
    {
      title: 'DNS-запросы из терминала',
      lang: 'bash',
      code: String.raw`
nslookup github.com              # работает везде, в том числе в Windows
nslookup -type=MX gmail.com      # почтовые серверы
nslookup github.com 1.1.1.1      # спросить конкретный резолвер

# Linux / macOS: dig выводит подробнее, включая TTL
dig github.com
dig +trace github.com            # весь путь: корень → .com → github.com`,
    },
    {
      title: 'Резолвинг из Python',
      lang: 'python',
      code: String.raw`
import socket

# Самый простой способ: спросить ОС
print(socket.gethostbyname("github.com"))

# Все адреса, включая IPv6
for family, _, _, _, addr in socket.getaddrinfo("google.com", 443, proto=socket.IPPROTO_TCP):
    kind = "IPv6" if family == socket.AF_INET6 else "IPv4"
    print(kind, addr[0])`,
      explain: `<p>Для работы с конкретными типами записей (MX, TXT) есть библиотека <code>dnspython</code>: <code>pip install dnspython</code>.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Записи популярных доменов',
      level: 'легко',
      text: `<p>С помощью <code>nslookup</code> найдите для <code>gmail.com</code>, <code>yandex.ru</code> и <code>github.com</code>: A-записи, MX-записи и TXT-записи.
        Какие сервисы угадываются по TXT (подсказка: ищите слова google, spf, verification)?</p>`,
    },
    {
      title: 'Локальный домен',
      level: 'средне',
      text: `<p>Добавьте в файл hosts строку <code>127.0.0.1 mysite.local</code> (нужны права администратора).
        Запустите <code>python -m http.server 8000</code> и откройте <code>http://mysite.local:8000</code>. Затем удалите строку.</p>`,
      hint: `<p>В Windows откройте Блокнот от имени администратора, затем Файл → Открыть и выберите все файлы (*.*) в папке etc.</p>`,
    },
    {
      title: 'Мини-резолвер с кэшем',
      level: 'сложно',
      text: `<p>Напишите класс <code>CachingResolver</code> с методом <code>resolve(name)</code>. Он возвращает IP через <code>socket.gethostbyname</code>,
        но хранит результат в кэше на <code>ttl</code> секунд. Выводите, был ли ответ взят из кэша.</p>`,
      solutionCode: String.raw`
import socket
import time

class CachingResolver:
    def __init__(self, ttl: float = 60):
        self.ttl = ttl
        self._cache: dict[str, tuple[str, float]] = {}

    def resolve(self, name: str) -> str:
        cached = self._cache.get(name)
        if cached and cached[1] > time.monotonic():
            print(f"{name}: из кэша")
            return cached[0]
        ip = socket.gethostbyname(name)
        self._cache[name] = (ip, time.monotonic() + self.ttl)
        print(f"{name}: запрос к DNS")
        return ip

r = CachingResolver(ttl=2)
r.resolve("github.com")
r.resolve("github.com")   # из кэша
time.sleep(2.1)
r.resolve("github.com")   # снова к DNS`,
    },
  ],
  quiz: [
    { q: 'Какая запись связывает имя с IPv4-адресом?', options: ['AAAA', 'A', 'CNAME', 'MX'], answer: 1 },
    { q: 'Вы сменили IP сервера, но часть пользователей попадает на старый. Почему?', options: ['Сломан HTTP', 'Ответ ещё закэширован у резолверов на время TTL', 'Нужно перезагрузить браузер всем', 'Неправильная MX-запись'], answer: 1 },
    { q: 'Какую запись используют для подтверждения владения доменом в Google или для SPF?', options: ['TXT', 'NS', 'A', 'CNAME'], answer: 0 },
    { q: 'Кто первым получает DNS-запрос от вашего компьютера (если в кэше пусто)?', options: ['Корневой сервер', 'Авторитативный сервер домена', 'Рекурсивный резолвер', 'Регистратор'], answer: 2 },
  ],
  resources: [
    { title: 'Cloudflare: что такое DNS', url: 'https://www.cloudflare.com/learning/dns/what-is-dns/' },
    { title: 'How DNS works (комикс)', url: 'https://howdns.works/' },
  ],
});

registerContent('browsers', {
  intro: `<p>Браузер — главный клиент веба. Понимание того, как он загружает и отрисовывает страницу, помогает бэкендеру правильно
    отдавать заголовки, кэшировать, настраивать CORS и cookie и понимать, почему «у меня всё работает, а в браузере нет».</p>`,
  theory: [
    {
      title: 'Из чего состоит браузер',
      html: `<ul>
          <li><b>Интерфейс</b> — адресная строка, вкладки, кнопки.</li>
          <li><b>Сетевой слой</b> — DNS, TCP, TLS, HTTP, кэш.</li>
          <li><b>Движок отрисовки</b> — превращает HTML и CSS в картинку (Blink в Chrome/Edge, Gecko в Firefox, WebKit в Safari).</li>
          <li><b>JavaScript-движок</b> — выполняет скрипты (V8, SpiderMonkey, JavaScriptCore).</li>
          <li><b>Хранилища</b> — cookie, localStorage, IndexedDB, кэш.</li>
        </ul>`,
    },
    {
      title: 'Путь от HTML до пикселей',
      html: `<ol>
          <li><b>Парсинг HTML</b> → дерево <b>DOM</b>. Встретив <code>&lt;link&gt;</code>, <code>&lt;script&gt;</code>, <code>&lt;img&gt;</code>, браузер отправляет новые запросы.</li>
          <li><b>Парсинг CSS</b> → дерево <b>CSSOM</b>.</li>
          <li>DOM + CSSOM = <b>render tree</b> — только видимые элементы со стилями.</li>
          <li><b>Layout</b> — расчёт размеров и позиций.</li>
          <li><b>Paint</b> и <b>composite</b> — отрисовка слоёв на экране.</li>
        </ol>
        <p>Скрипт <code>&lt;script&gt;</code> без <code>defer</code>/<code>async</code> блокирует парсинг: браузер ждёт загрузки и выполнения.
        Поэтому медленный ответ вашего сервера на JS-файл задерживает всю страницу.</p>`,
    },
    {
      title: 'Same-Origin Policy',
      html: `<p><b>Origin</b> (источник) = схема + хост + порт. <code>https://site.ru</code> и <code>https://api.site.ru</code> — разные origin,
        как и <code>http://localhost:3000</code> и <code>http://localhost:8000</code>.</p>
        <p>По правилу <b>одного источника</b> JavaScript со страницы одного origin не может читать ответы с другого — иначе любой сайт мог бы
        от вашего имени читать вашу почту. Чтобы фронтенд на другом домене мог обращаться к вашему API, сервер должен явно разрешить это
        заголовками <b>CORS</b> (подробнее — в разделе безопасности).</p>`,
    },
    {
      title: 'Cookie и хранилища',
      html: `<ul>
          <li><b>Cookie</b> ставит сервер заголовком <code>Set-Cookie</code>; браузер автоматически отправляет их обратно в каждом запросе к этому домену. Флаги:
            <code>HttpOnly</code> (недоступна из JS), <code>Secure</code> (только по HTTPS), <code>SameSite</code> (защита от CSRF), <code>Max-Age</code>.</li>
          <li><b>localStorage</b> — хранилище на стороне JS, сервер его не видит.</li>
        </ul>
        <p class="note">Сессионные токены храните в cookie с <code>HttpOnly</code> и <code>Secure</code> — так их не украдёт вредоносный скрипт.</p>`,
    },
    {
      title: 'DevTools — главный инструмент',
      html: `<p>Клавиша <b>F12</b> открывает инструменты разработчика. Бэкендеру нужнее всего вкладки:</p>
        <ul>
          <li><b>Network</b> — все запросы, статусы, заголовки, тело, время. Кнопка «Copy as cURL» превращает запрос в команду терминала.</li>
          <li><b>Console</b> — ошибки JS и CORS.</li>
          <li><b>Application</b> — cookie, localStorage.</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'Сервер, который ставит cookie',
      lang: 'python',
      code: String.raw`
from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        visits = 1
        cookie = self.headers.get("Cookie", "")
        if "visits=" in cookie:
            visits = int(cookie.split("visits=")[1].split(";")[0]) + 1

        body = f"<h1>Вы здесь {visits}-й раз</h1>".encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Set-Cookie", f"visits={visits}; Max-Age=3600; HttpOnly")
        self.end_headers()
        self.wfile.write(body)

HTTPServer(("127.0.0.1", 8000), Handler).serve_forever()`,
      explain: `<p>Запустите и откройте <code>http://127.0.0.1:8000</code>, обновите несколько раз. В DevTools → Application → Cookies видно cookie
        <code>visits</code>, а в Network — заголовки <code>Cookie</code> и <code>Set-Cookie</code>.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Водопад загрузки',
      level: 'легко',
      text: `<p>Откройте крупный новостной сайт с вкладкой Network. Ответьте: сколько всего запросов, сколько мегабайт загружено,
        сколько времени до события <code>DOMContentLoaded</code> и <code>Load</code>? Какие запросы самые медленные?</p>`,
    },
    {
      title: 'Один ли это origin?',
      level: 'легко',
      text: `<p>Для каждой пары определите, один ли у них origin:</p>
        <ol>
          <li><code>https://site.ru/a</code> и <code>https://site.ru/b</code></li>
          <li><code>http://site.ru</code> и <code>https://site.ru</code></li>
          <li><code>https://site.ru</code> и <code>https://www.site.ru</code></li>
          <li><code>http://localhost:3000</code> и <code>http://localhost:8000</code></li>
          <li><code>https://site.ru:443</code> и <code>https://site.ru</code></li>
        </ol>`,
      solution: `<ol><li>Да — путь не входит в origin.</li><li>Нет — разная схема.</li><li>Нет — разный хост.</li><li>Нет — разный порт.</li><li>Да — 443 порт по умолчанию для https.</li></ol>`,
    },
    {
      title: 'Copy as cURL',
      level: 'средне',
      text: `<p>В DevTools найдите любой XHR/fetch-запрос сайта (фильтр Fetch/XHR), выберите «Copy as cURL (bash)», выполните в терминале.
        Затем повторите тот же запрос из Python через <code>requests</code>, перенеся нужные заголовки.</p>`,
    },
  ],
  quiz: [
    { q: 'Что входит в понятие origin?', options: ['Только домен', 'Схема, хост и порт', 'Полный URL с путём', 'IP-адрес сервера'], answer: 1 },
    { q: 'Какой флаг cookie запрещает доступ к ней из JavaScript?', options: ['Secure', 'SameSite', 'HttpOnly', 'Max-Age'], answer: 2 },
    { q: 'Почему <code>&lt;script&gt;</code> без defer замедляет показ страницы?', options: ['Он всегда грузится последним', 'Браузер останавливает разбор HTML, пока скрипт не загрузится и не выполнится', 'Он отключает кэш', 'Он требует CORS'], answer: 1 },
  ],
  resources: [
    { title: 'web.dev: Как работают браузеры', url: 'https://web.dev/articles/howbrowserswork' },
    { title: 'MDN: Same-origin policy', url: 'https://developer.mozilla.org/ru/docs/Web/Security/Same-origin_policy' },
  ],
});
