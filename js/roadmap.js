// Структура курса: разделы и темы в порядке изучения (по roadmap.sh/backend).
// optional: true — тема/раздел по желанию, не обязательна для прохождения.
window.ROADMAP = [
  {
    id: 'internet', title: 'Интернет',
    desc: 'Как устроена сеть, по которой ходят запросы к вашему серверу.',
    topics: [
      { id: 'how-internet-works', title: 'Как работает интернет', summary: 'Сети, IP-адреса, пакеты, маршрутизация и модель TCP/IP.' },
      { id: 'what-is-http', title: 'Что такое HTTP', summary: 'Протокол запросов и ответов: методы, статусы, заголовки.' },
      { id: 'domain-name', title: 'Доменные имена', summary: 'Как устроены домены, зоны и регистрация.' },
      { id: 'hosting', title: 'Хостинг', summary: 'Где живут сайты: shared, VPS, облака, PaaS.' },
      { id: 'dns', title: 'DNS и как он работает', summary: 'Как имя превращается в IP-адрес: резолверы, записи, TTL.' },
      { id: 'browsers', title: 'Браузеры и как они работают', summary: 'Путь от URL до отрисованной страницы.' },
    ],
  },
  {
    id: 'frontend', title: 'Основы фронтенда', optional: true,
    desc: 'Минимум, чтобы понимать, кто и как обращается к вашему API.',
    topics: [
      { id: 'html', title: 'HTML', summary: 'Разметка страниц: теги, формы, семантика.' },
      { id: 'css', title: 'CSS', summary: 'Стилизация: селекторы, блочная модель, flex и grid.' },
      { id: 'javascript', title: 'JavaScript', summary: 'Язык браузера: DOM, события, fetch для запросов к API.' },
    ],
  },
  {
    id: 'python', title: 'Язык: Python',
    desc: 'Основной язык курса. Из роадмапа выбран Python — простой и востребованный в бэкенде.',
    topics: [
      { id: 'py-start', title: 'Установка и первый скрипт', summary: 'Установка Python, REPL, запуск файлов, редактор.' },
      { id: 'py-types', title: 'Переменные и типы данных', summary: 'Числа, строки, bool, None, преобразование типов, f-строки.' },
      { id: 'py-control', title: 'Условия и циклы', summary: 'if/elif/else, for, while, range, break/continue.' },
      { id: 'py-functions', title: 'Функции', summary: 'Параметры, значения по умолчанию, *args/**kwargs, области видимости.' },
      { id: 'py-collections', title: 'Коллекции', summary: 'Списки, кортежи, словари, множества и генераторы списков.' },
      { id: 'py-errors-files', title: 'Исключения и файлы', summary: 'try/except, свои исключения, работа с файлами и JSON.' },
      { id: 'py-oop', title: 'ООП в Python', summary: 'Классы, объекты, наследование, dataclass.' },
      { id: 'py-modules', title: 'Модули, пакеты и pip', summary: 'import, структура проекта, venv, зависимости.' },
      { id: 'py-web', title: 'Первый веб-сервер', summary: 'Простой HTTP API на FastAPI.' },
    ],
  },
  {
    id: 'git', title: 'Git и контроль версий',
    desc: 'Без системы контроля версий не работает ни одна команда.',
    topics: [
      { id: 'vcs', title: 'Системы контроля версий', summary: 'Зачем нужны VCS и как устроен Git.' },
      { id: 'git-basics', title: 'Основы Git', summary: 'init, add, commit, status, log, diff.' },
      { id: 'git-branches', title: 'Ветки и слияние', summary: 'branch, switch, merge, конфликты, rebase.' },
      { id: 'github', title: 'GitHub и удалённые репозитории', summary: 'remote, push, pull, Pull Request, GitLab/Bitbucket.' },
    ],
  },
  {
    id: 'relational-db', title: 'Реляционные базы данных',
    desc: 'Таблицы, связи и SQL — основа хранения данных.',
    topics: [
      { id: 'sql-basics', title: 'Основы SQL', summary: 'SELECT, INSERT, UPDATE, DELETE, JOIN, GROUP BY.' },
      { id: 'sqlite', title: 'SQLite', summary: 'Встраиваемая БД в одном файле — идеальна для старта и тестов.' },
      { id: 'postgresql', title: 'PostgreSQL', summary: 'Самая популярная open-source реляционная СУБД для бэкенда.' },
      { id: 'mysql', title: 'MySQL', summary: 'Широко распространённая СУБД, основа стека LAMP.' },
      { id: 'mariadb', title: 'MariaDB', summary: 'Форк MySQL, совместимый по протоколу.', optional: true },
      { id: 'mssql', title: 'MS SQL Server', summary: 'СУБД Microsoft, популярна в корпоративной среде.', optional: true },
      { id: 'oracle', title: 'Oracle', summary: 'Коммерческая СУБД для крупных предприятий.', optional: true },
    ],
  },
  {
    id: 'more-db', title: 'Подробнее о базах данных',
    desc: 'Как работать с БД правильно и быстро.',
    topics: [
      { id: 'orms', title: 'ORM', summary: 'Работа с БД через объекты: SQLAlchemy, Django ORM.' },
      { id: 'acid', title: 'ACID', summary: 'Атомарность, согласованность, изолированность, долговечность.' },
      { id: 'transactions', title: 'Транзакции', summary: 'BEGIN/COMMIT/ROLLBACK и уровни изоляции.' },
      { id: 'n1-problem', title: 'Проблема N+1', summary: 'Лишние запросы при загрузке связанных данных и как их избежать.' },
      { id: 'normalization', title: 'Нормализация', summary: 'Нормальные формы и устранение дублирования данных.' },
      { id: 'database-indexes', title: 'Индексы', summary: 'B-tree, составные индексы, когда индекс помогает и вредит.' },
      { id: 'migrations', title: 'Миграции', summary: 'Версионирование схемы БД: Alembic, Django migrations.' },
      { id: 'failure-modes', title: 'Режимы отказа', summary: 'Что бывает, когда БД падает, тормозит или теряет данные.' },
      { id: 'profiling-performance', title: 'Профилирование', summary: 'EXPLAIN, медленные запросы, поиск узких мест.' },
    ],
  },
  {
    id: 'apis', title: 'API',
    desc: 'Как сервер общается с клиентами и другими сервисами.',
    topics: [
      { id: 'rest', title: 'REST', summary: 'Ресурсы, методы HTTP, коды ответов, проектирование эндпоинтов.' },
      { id: 'json-apis', title: 'JSON API', summary: 'Формат обмена данными и соглашения по структуре ответов.' },
      { id: 'open-api-specs', title: 'OpenAPI', summary: 'Описание API в виде спецификации, Swagger UI.' },
      { id: 'graphql', title: 'GraphQL', summary: 'Клиент сам выбирает нужные поля одним запросом.' },
      { id: 'grpc', title: 'gRPC', summary: 'Быстрый бинарный RPC на Protocol Buffers и HTTP/2.' },
      { id: 'soap', title: 'SOAP', summary: 'XML-протокол, всё ещё встречается в банках и госсистемах.', optional: true },
    ],
  },
  {
    id: 'auth', title: 'Аутентификация',
    desc: 'Как узнать, кто пришёл, и что ему разрешено.',
    topics: [
      { id: 'basic-auth', title: 'Basic Authentication', summary: 'Логин и пароль в заголовке каждого запроса.' },
      { id: 'cookie-auth', title: 'Сессии и cookie', summary: 'Сервер хранит сессию, браузер — её идентификатор.' },
      { id: 'token-auth', title: 'Токены', summary: 'Stateless-аутентификация через токен в заголовке.' },
      { id: 'jwt', title: 'JWT', summary: 'Подписанные токены с данными внутри.' },
      { id: 'oauth', title: 'OAuth 2.0', summary: 'Делегирование доступа: «Войти через Google».' },
      { id: 'openid', title: 'OpenID Connect', summary: 'Слой идентификации поверх OAuth 2.0.' },
      { id: 'saml', title: 'SAML', summary: 'XML-стандарт единого входа в корпорациях.', optional: true },
    ],
  },
  {
    id: 'caching', title: 'Кэширование',
    desc: 'Самый дешёвый способ ускорить систему.',
    topics: [
      { id: 'caching-intro', title: 'Виды кэширования', summary: 'Клиентский, серверный кэш, CDN, стратегии инвалидации.' },
      { id: 'http-caching', title: 'HTTP-кэширование', summary: 'Cache-Control, ETag, Last-Modified.' },
      { id: 'redis', title: 'Redis', summary: 'In-memory хранилище для кэша, очередей и счётчиков.' },
      { id: 'memcached', title: 'Memcached', summary: 'Простой распределённый кэш в памяти.', optional: true },
    ],
  },
  {
    id: 'security', title: 'Веб-безопасность',
    desc: 'Защита данных пользователей и сервера.',
    topics: [
      { id: 'https', title: 'HTTPS и SSL/TLS', summary: 'Шифрование трафика и сертификаты.' },
      { id: 'cors', title: 'CORS', summary: 'Правила доступа к API с других доменов.' },
      { id: 'csp', title: 'Content Security Policy', summary: 'Защита от XSS через заголовки.' },
      { id: 'owasp', title: 'OWASP Top 10', summary: 'Самые частые уязвимости: инъекции, XSS, CSRF и др.' },
      { id: 'hashing', title: 'Хеширование паролей', summary: 'MD5, SHA, bcrypt, scrypt, argon2 — что использовать и почему.' },
      { id: 'server-security', title: 'Безопасность сервера', summary: 'Файрвол, SSH-ключи, обновления, принцип наименьших привилегий.' },
    ],
  },
  {
    id: 'testing', title: 'Тестирование',
    desc: 'Уверенность, что код работает, и после изменений тоже.',
    topics: [
      { id: 'unit-testing', title: 'Модульные тесты', summary: 'pytest, фикстуры, моки.' },
      { id: 'integration-testing', title: 'Интеграционные тесты', summary: 'Проверка взаимодействия с БД и внешними сервисами.' },
      { id: 'functional-testing', title: 'Функциональные тесты', summary: 'Проверка сценариев пользователя через API.' },
    ],
  },
  {
    // Раньше, чем на roadmap.sh: CI/CD собирает и выкатывает Docker-образы.
    id: 'containers', title: 'Контейнеризация',
    desc: 'Одинаковое окружение на ноутбуке и в продакшене.',
    topics: [
      { id: 'docker', title: 'Docker', summary: 'Образы, контейнеры, Dockerfile, docker compose.' },
      { id: 'lxc', title: 'LXC', summary: 'Системные контейнеры Linux.', optional: true },
      { id: 'kubernetes', title: 'Kubernetes', summary: 'Оркестрация контейнеров в кластере.' },
    ],
  },
  {
    id: 'cicd', title: 'CI/CD',
    desc: 'Автоматическая проверка и выкладка кода.',
    topics: [
      { id: 'ci-cd', title: 'CI/CD конвейеры', summary: 'GitHub Actions, GitLab CI: тесты и деплой на каждый коммит.' },
    ],
  },
  {
    id: 'ai-coding', title: 'AI в разработке',
    desc: 'Как эффективно программировать вместе с AI-ассистентами.',
    topics: [
      { id: 'how-llms-work', title: 'Как работают LLM', summary: 'Токены, контекст, вероятностная генерация.' },
      { id: 'prompting', title: 'Техники промптинга', summary: 'Контекст, примеры, пошаговые инструкции.' },
      { id: 'ai-assisted-coding', title: 'AI-ассистенты', summary: 'Claude Code, Cursor, Copilot: где помогают, где мешают.' },
      { id: 'code-reviews', title: 'Код-ревью', summary: 'Проверка своего и чужого (в том числе сгенерированного) кода.' },
    ],
  },
  {
    id: 'architecture', title: 'Архитектурные паттерны',
    desc: 'Как разбить большую систему на части.',
    topics: [
      { id: 'monolith', title: 'Монолит', summary: 'Одно приложение — простой и правильный старт.' },
      { id: 'microservices', title: 'Микросервисы', summary: 'Независимые сервисы со своими БД.' },
      { id: 'soa', title: 'SOA', summary: 'Сервис-ориентированная архитектура.', optional: true },
      { id: 'serverless', title: 'Serverless', summary: 'Функции в облаке без управления серверами.' },
      { id: 'service-mesh', title: 'Service Mesh', summary: 'Сетевой слой для общения микросервисов.', optional: true },
      { id: 'twelve-factor', title: '12 факторов', summary: 'Принципы построения облачных приложений.' },
    ],
  },
  {
    id: 'message-brokers', title: 'Брокеры сообщений',
    desc: 'Асинхронное взаимодействие сервисов.',
    topics: [
      { id: 'rabbitmq', title: 'RabbitMQ', summary: 'Очереди задач и маршрутизация сообщений.' },
      { id: 'kafka', title: 'Kafka', summary: 'Распределённый журнал событий для больших потоков.' },
    ],
  },
  {
    id: 'search', title: 'Поисковые движки',
    desc: 'Полнотекстовый поиск, который не потянет обычная БД.',
    topics: [
      { id: 'elasticsearch', title: 'Elasticsearch', summary: 'Поиск и аналитика на основе Lucene.' },
      { id: 'solr', title: 'Solr', summary: 'Ещё один поисковый движок на Lucene.', optional: true },
    ],
  },
  {
    id: 'web-servers', title: 'Веб-серверы',
    desc: 'То, что стоит перед вашим приложением.',
    topics: [
      { id: 'nginx', title: 'Nginx', summary: 'Reverse proxy, балансировка, раздача статики.' },
      { id: 'apache', title: 'Apache', summary: 'Классический веб-сервер с модулями.', optional: true },
      { id: 'caddy', title: 'Caddy', summary: 'Простой сервер с автоматическим HTTPS.', optional: true },
      { id: 'iis', title: 'MS IIS', summary: 'Веб-сервер Microsoft для Windows.', optional: true },
    ],
  },
  {
    id: 'realtime', title: 'Данные в реальном времени',
    desc: 'Как сервер сам отправляет данные клиенту.',
    topics: [
      { id: 'polling', title: 'Long / Short Polling', summary: 'Периодические запросы и удержание соединения.' },
      { id: 'websockets', title: 'WebSockets', summary: 'Двусторонний постоянный канал.' },
      { id: 'sse', title: 'Server-Sent Events', summary: 'Односторонний поток событий от сервера.' },
    ],
  },
  {
    id: 'nosql', title: 'NoSQL базы данных',
    desc: 'Хранилища для задач, где таблицы неудобны.',
    topics: [
      { id: 'mongodb', title: 'MongoDB', summary: 'Документная БД с JSON-подобными документами.' },
      { id: 'redis-kv', title: 'Key-Value хранилища', summary: 'Redis, DynamoDB — доступ по ключу за O(1).' },
      { id: 'cassandra', title: 'Cassandra / ScyllaDB', summary: 'Колоночные БД для огромных объёмов записи.' },
      { id: 'timeseries', title: 'Time-series БД', summary: 'InfluxDB, TimescaleDB — метрики и события во времени.' },
      { id: 'clickhouse', title: 'ClickHouse', summary: 'Колоночная аналитическая СУБД.', optional: true },
      { id: 'neo4j', title: 'Графовые БД', summary: 'Neo4j — связи как объекты первого класса.' },
    ],
  },
  {
    id: 'scaling-db', title: 'Масштабирование БД',
    desc: 'Что делать, когда одна база не справляется.',
    topics: [
      { id: 'replication', title: 'Репликация', summary: 'Копии данных: master-replica, чтение с реплик.' },
      { id: 'sharding', title: 'Шардирование', summary: 'Разделение данных между серверами.' },
      { id: 'cap-theorem', title: 'CAP-теорема', summary: 'Согласованность, доступность, устойчивость к разделению.' },
    ],
  },
  {
    id: 'scale', title: 'Построение систем под нагрузку',
    desc: 'Надёжность, наблюдаемость и масштабирование.',
    topics: [
      { id: 'scaling', title: 'Горизонтальное и вертикальное', summary: 'Больше серверов или мощнее сервер.' },
      { id: 'graceful-degradation', title: 'Graceful degradation', summary: 'Работать хуже, но не падать целиком.' },
      { id: 'throttling', title: 'Rate limiting', summary: 'Ограничение частоты запросов.' },
      { id: 'backpressure', title: 'Backpressure', summary: 'Как не утонуть под потоком входящих данных.' },
      { id: 'loadshifting', title: 'Load shifting', summary: 'Перенос нагрузки во времени: очереди, отложенные задачи.' },
      { id: 'circuit-breaker', title: 'Circuit Breaker', summary: 'Перестать звать упавший сервис.' },
      { id: 'observability', title: 'Наблюдаемость', summary: 'Логи, метрики, трейсы.' },
      { id: 'monitoring', title: 'Мониторинг и алерты', summary: 'Prometheus, Grafana, оповещения.' },
      { id: 'telemetry', title: 'Телеметрия и инструментирование', summary: 'OpenTelemetry, сбор данных из кода.' },
    ],
  },
  {
    id: 'ai-integration', title: 'AI в бэкенде',
    desc: 'Встраивание языковых моделей в ваши сервисы.',
    topics: [
      { id: 'llm-apis', title: 'API языковых моделей', summary: 'Anthropic, OpenAI, Gemini: запросы к моделям из кода.' },
      { id: 'streaming', title: 'Стриминг ответов', summary: 'Отдавать ответ модели по мере генерации.' },
      { id: 'structured-outputs', title: 'Структурированный вывод', summary: 'Получение JSON по схеме от модели.' },
      { id: 'function-calling', title: 'Function calling', summary: 'Модель вызывает функции вашего бэкенда.' },
      { id: 'embeddings', title: 'Эмбеддинги и векторы', summary: 'Векторные представления текста и векторные БД.' },
      { id: 'rag', title: 'RAG', summary: 'Ответы модели на основе ваших документов.' },
      { id: 'mcp', title: 'MCP', summary: 'Model Context Protocol — стандарт подключения инструментов.' },
      { id: 'agents', title: 'AI-агенты', summary: 'Модель в цикле с инструментами решает многошаговые задачи.' },
    ],
  },
];
