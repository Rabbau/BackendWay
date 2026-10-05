// Раздел: Веб-серверы

registerContent('nginx', {
  intro: `<p>Uvicorn умеет обслуживать HTTP, но в продакшене перед приложением почти всегда стоит <b>веб-сервер</b> — чаще всего <b>Nginx</b>. Он принимает соединения из интернета,
    терминирует HTTPS, раздаёт статику, сжимает ответы, балансирует нагрузку между копиями приложения и защищает его от медленных и злонамеренных клиентов.</p>`,
  theory: [
    {
      title: 'Reverse proxy',
      html: `<p><b>Обратный прокси</b> стоит перед вашими серверами и пересылает им запросы клиентов. Клиент видит только Nginx.</p>
        <ul>
          <li><b>TLS-терминация</b>: сертификаты настраиваются в одном месте, приложение работает по HTTP внутри сети.</li>
          <li><b>Буферизация</b>: медленный мобильный клиент не держит воркер приложения — Nginx дочитает запрос и долго отдаёт ответ сам.</li>
          <li><b>Статика</b>: файлы отдаются напрямую с диска, в десятки раз эффективнее Python.</li>
          <li><b>Сжатие</b> (gzip, brotli), <b>кэш</b>, <b>лимиты</b> запросов и размера тела, заголовки безопасности.</li>
          <li><b>Маршрутизация</b>: <code>/api</code> → бэкенд, <code>/</code> → фронтенд, разные домены → разные приложения.</li>
        </ul>
        <p>Приложение за прокси должно знать реальный IP и схему клиента — их передают заголовки <code>X-Forwarded-For</code>, <code>X-Forwarded-Proto</code> (в uvicorn — флаг <code>--proxy-headers</code>).</p>`,
    },
    {
      title: 'Архитектура Nginx',
      html: `<p>Nginx — событийно-ориентированный: несколько процессов-воркеров (обычно по числу ядер), каждый асинхронно обслуживает тысячи соединений без отдельного потока на каждое.
        Поэтому он держит десятки тысяч одновременных соединений при небольшом расходе памяти — в отличие от классической модели «поток на соединение».</p>`,
    },
    {
      title: 'Конфигурация',
      html: `<ul>
          <li><code>http { server { location { } } }</code> — вложенные блоки. <code>server</code> — виртуальный хост (домен + порт), <code>location</code> — правила для путей.</li>
          <li><code>proxy_pass</code> — куда проксировать; <code>root</code> / <code>try_files</code> — раздача файлов.</li>
          <li><code>upstream</code> — группа серверов для балансировки: по кругу (round-robin), <code>least_conn</code>, <code>ip_hash</code>.</li>
          <li>Проверка конфига: <code>nginx -t</code>; применение без остановки: <code>nginx -s reload</code>.</li>
          <li>Логи: <code>access.log</code> (каждый запрос) и <code>error.log</code>. Ошибка <b>502 Bad Gateway</b> — Nginx не смог связаться с приложением (оно упало или не слушает порт), <b>504</b> — приложение не ответило вовремя.</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'Nginx перед FastAPI: HTTPS, статика, балансировка',
      lang: 'nginx',
      code: String.raw`
upstream notes_api {
    least_conn;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;            # две копии приложения
}

server {
    listen 80;
    server_name notes.example.com;
    return 301 https://$host$request_uri;           # всё на HTTPS
}

server {
    listen 443 ssl;
    http2 on;
    server_name notes.example.com;

    ssl_certificate     /etc/letsencrypt/live/notes.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/notes.example.com/privkey.pem;
    add_header Strict-Transport-Security "max-age=31536000" always;

    client_max_body_size 5m;                         # лимит загрузок
    gzip on;
    gzip_types application/json text/css application/javascript;

    location /static/ {
        alias /var/www/notes/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /api/ {
        proxy_pass http://notes_api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
    }

    location / {
        root /var/www/notes/frontend;
        try_files $uri /index.html;                  # SPA: все пути → index.html
    }
}`,
    },
    {
      title: 'Ограничение частоты запросов',
      lang: 'nginx',
      code: String.raw`
# в блоке http: зона на 10 МБ памяти, 5 запросов в секунду с одного IP
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/s;

server {
    location /api/auth/token {
        limit_req zone=login burst=10 nodelay;      # всплеск до 10, сверх — 503 (или limit_req_status 429)
        limit_req_status 429;
        proxy_pass http://notes_api/auth/token;
    }
}`,
    },
    {
      title: 'Nginx в docker compose',
      lang: 'yaml',
      code: String.raw`
services:
  nginx:
    image: nginx:1.27
    ports: ["80:80"]
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on: [app]
  app:
    build: .
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips="*"
    # порт наружу не пробрасываем — доступ только через nginx (proxy_pass http://app:8000)`,
    },
  ],
  tasks: [
    {
      title: 'Nginx перед API заметок',
      level: 'средне',
      text: `<p>Добавьте Nginx в docker compose API заметок: <code>/api/</code> проксируется в приложение (две копии), <code>/</code> отдаёт статическую страницу. Остановите одну копию приложения — продолжает ли сервис работать?
        Остановите обе — какой код ответа вы получили и почему?</p>`,
      solution: `<p>При одной живой копии Nginx перестанет слать запросы на упавшую (после неудачной попытки, по <code>max_fails</code>/<code>fail_timeout</code>) и сервис продолжит работу.
        Когда упали обе — <b>502 Bad Gateway</b>: прокси работает, но бэкенд недоступен.</p>`,
    },
    {
      title: 'Реальный IP клиента',
      level: 'легко',
      text: `<p>Добавьте в API эндпоинт, возвращающий <code>request.client.host</code>. Вызовите его через Nginx без <code>--proxy-headers</code> и с ним. Почему без настройки приложение видит IP прокси и чем это плохо для rate limiting и логов?</p>`,
    },
  ],
  quiz: [
    { q: 'Что такое reverse proxy?', options: ['Прокси для выхода сотрудников в интернет', 'Сервер перед приложениями, принимающий запросы клиентов и пересылающий их бэкенду', 'Тип БД', 'Антивирус'], answer: 1 },
    { q: 'Что означает 502 Bad Gateway от Nginx?', options: ['Ошибка в запросе клиента', 'Nginx не смог получить ответ от приложения (оно недоступно)', 'Нет прав', 'Неверный сертификат'], answer: 1 },
    { q: 'Как проверить конфигурацию перед применением?', options: ['nginx -t', 'nginx --run', 'Перезагрузить сервер', 'curl localhost'], answer: 0 },
    { q: 'Зачем заголовок X-Forwarded-For?', options: ['Для кэша', 'Передать приложению реальный IP клиента', 'Для CORS', 'Для сжатия'], answer: 1 },
  ],
  resources: [
    { title: 'Nginx: Beginner’s Guide', url: 'https://nginx.org/en/docs/beginners_guide.html' },
    { title: 'Mozilla SSL Configuration Generator', url: 'https://ssl-config.mozilla.org/' },
  ],
});

registerContent('apache', {
  intro: `<p><b>Apache HTTP Server</b> — один из старейших и самых распространённых веб-серверов (с 1995 года), буква «A» в стеке LAMP. Сегодня в новых проектах его чаще заменяет Nginx,
    но Apache по-прежнему работает на огромном числе серверов, особенно в шаред-хостинге и PHP-проектах.</p>`,
  theory: [
    {
      title: 'Особенности',
      html: `<ul>
          <li><b>Модули</b>: функциональность подключается модулями — <code>mod_ssl</code>, <code>mod_rewrite</code>, <code>mod_proxy</code>, <code>mod_php</code>.</li>
          <li><b>MPM</b> (Multi-Processing Modules): <code>prefork</code> (процесс на соединение, старый режим для mod_php), <code>worker</code> и <code>event</code> (потоки, ближе к Nginx по эффективности).</li>
          <li><b>.htaccess</b> — файлы настроек в папках сайта, которые применяются без перезапуска. Удобно на хостинге, но медленнее (файл ищется при каждом запросе).</li>
          <li>Виртуальные хосты — блоки <code>&lt;VirtualHost&gt;</code>.</li>
        </ul>
        <p>Для Python исторически использовался <code>mod_wsgi</code>; сегодня обычно Apache (или Nginx) проксирует запросы в Gunicorn/Uvicorn.</p>`,
    },
  ],
  examples: [
    {
      title: 'Apache как reverse proxy',
      lang: 'apache',
      code: String.raw`
# a2enmod proxy proxy_http headers ssl
<VirtualHost *:80>
    ServerName notes.example.com
    ProxyPreserveHost On
    ProxyPass        /api/ http://127.0.0.1:8000/
    ProxyPassReverse /api/ http://127.0.0.1:8000/
    RequestHeader set X-Forwarded-Proto "http"
    DocumentRoot /var/www/notes/frontend
</VirtualHost>`,
    },
  ],
  tasks: [
    {
      title: 'Тот же сайт на Apache',
      level: 'средне',
      text: `<p>Запустите образ <code>httpd:2.4</code> и настройте его как прокси к API заметок со статикой, как в теме Nginx. Сравните объём и читаемость конфигурации.</p>`,
    },
  ],
  quiz: [
    { q: 'Что такое .htaccess?', options: ['Лог доступа', 'Файл локальных настроек Apache в папке сайта', 'Сертификат', 'Модуль PHP'], answer: 1 },
  ],
  resources: [
    { title: 'Apache HTTP Server: документация', url: 'https://httpd.apache.org/docs/2.4/' },
  ],
});

registerContent('caddy', {
  intro: `<p><b>Caddy</b> — современный веб-сервер на Go, главная фишка которого — <b>автоматический HTTPS</b>: указали домен — Caddy сам получит сертификат Let's Encrypt и будет продлевать его.
    Конфигурация в несколько строк делает его отличным выбором для небольших проектов и pet-проектов.</p>`,
  theory: [
    {
      title: 'Особенности',
      html: `<ul>
          <li>HTTPS по умолчанию, HTTP → HTTPS автоматически, HTTP/2 и HTTP/3.</li>
          <li>Простой формат <b>Caddyfile</b> и JSON-API для динамической настройки.</li>
          <li>Reverse proxy с балансировкой и health-check, раздача статики, сжатие.</li>
          <li>Один бинарный файл без зависимостей.</li>
        </ul>
        <p>Для локальной разработки Caddy сам создаёт доверенный локальный CA — HTTPS на <code>localhost</code> без танцев.</p>`,
    },
  ],
  examples: [
    {
      title: 'Caddyfile — всё, что нужно для продакшена',
      lang: 'caddyfile',
      code: String.raw`
notes.example.com {
    encode gzip zstd
    handle /api/* {
        reverse_proxy app1:8000 app2:8000 {
            health_uri /health
        }
    }
    handle {
        root * /srv/frontend
        try_files {path} /index.html
        file_server
    }
}`,
      explain: `<p>Сравните с конфигом Nginx из предыдущей темы: сертификаты, редирект на HTTPS и HSTS здесь не описаны — Caddy делает это сам.</p>`,
    },
  ],
  tasks: [
    {
      title: 'HTTPS за пять минут',
      level: 'средне',
      text: `<p>Если у вас есть VPS и домен — поднимите API заметок за Caddy с настоящим сертификатом. Если нет — запустите Caddy локально с адресом <code>localhost</code> и убедитесь, что браузер открывает <code>https://localhost</code> без предупреждений.</p>`,
    },
  ],
  quiz: [
    { q: 'Главная особенность Caddy:', options: ['Работает только на Windows', 'Автоматическое получение и продление HTTPS-сертификатов', 'Встроенная БД', 'Только для PHP'], answer: 1 },
  ],
  resources: [
    { title: 'Caddy: документация', url: 'https://caddyserver.com/docs/' },
  ],
});

registerContent('iis', {
  intro: `<p><b>IIS</b> (Internet Information Services) — веб-сервер Microsoft, встроенный в Windows Server. Основная платформа для приложений на ASP.NET и в корпоративной Windows-инфраструктуре
    (интеграция с Active Directory, Windows-аутентификация).</p>`,
  theory: [
    {
      title: 'Особенности',
      html: `<ul>
          <li>Управление через графический <b>IIS Manager</b>, PowerShell и файлы <code>web.config</code>.</li>
          <li><b>Application Pools</b> — изолированные процессы для разных приложений со своими учётными записями.</li>
          <li>Python-приложения подключаются через модуль <b>HttpPlatformHandler</b> или reverse proxy (<b>URL Rewrite + ARR</b>) к Uvicorn/Waitress.</li>
        </ul>
        <p>Если ваш Python-бэкенд нужно развернуть в Windows-инфраструктуре заказчика, вы встретитесь с IIS. В остальных случаях чаще выбирают Linux + Nginx.</p>`,
    },
  ],
  examples: [
    {
      title: 'Установка IIS и сайта из PowerShell',
      lang: 'powershell',
      code: String.raw`
Install-WindowsFeature -Name Web-Server -IncludeManagementTools
Import-Module WebAdministration
New-WebAppPool -Name "NotesPool"
New-Website -Name "Notes" -Port 80 -PhysicalPath "C:\inetpub\notes" -ApplicationPool "NotesPool"`,
    },
  ],
  tasks: [
    {
      title: 'Знакомство с IIS',
      level: 'легко',
      text: `<p>На Windows 10/11 включите компонент «Службы IIS» (Панель управления → Программы → Включение компонентов Windows), откройте IIS Manager и опубликуйте статическую страницу. Найдите, где настраиваются пулы приложений и привязки (bindings).</p>`,
    },
  ],
  quiz: [
    { q: 'Для какой платформы IIS — основной веб-сервер?', options: ['Linux + PHP', 'Windows Server + ASP.NET', 'macOS', 'Kubernetes'], answer: 1 },
  ],
  resources: [
    { title: 'Документация IIS', url: 'https://learn.microsoft.com/ru-ru/iis/' },
  ],
});
