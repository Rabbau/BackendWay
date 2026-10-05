// Раздел: Контейнеризация

registerContent('docker', {
  intro: `<p>«У меня работает» — классическая проблема: на ноутбуке Python 3.13 и macOS, на сервере Python 3.10 и Ubuntu, у коллеги Windows.
    <b>Docker</b> упаковывает приложение вместе со всем окружением — нужной версией Python, библиотеками, системными пакетами — в <b>образ</b>,
    который одинаково запускается где угодно. Сегодня это стандарт доставки бэкенда в продакшен.</p>`,
  theory: [
    {
      title: 'Контейнеры vs виртуальные машины',
      html: `<p><b>Виртуальная машина</b> эмулирует целый компьютер со своей ОС: гигабайты, загрузка — минуты.
        <b>Контейнер</b> — обычный процесс, изолированный средствами ядра Linux (<b>namespaces</b> — своё дерево процессов, сеть, файловая система; <b>cgroups</b> — лимиты CPU и памяти).
        Ядро общее с хостом, поэтому контейнер стартует за доли секунды и весит мегабайты.</p>
        <p>На Windows и macOS Docker Desktop запускает лёгкую Linux-ВМ, а контейнеры работают внутри неё (на Windows — через WSL 2).</p>`,
    },
    {
      title: 'Образ, контейнер, реестр',
      html: `<ul>
          <li><b>Образ</b> (image) — неизменяемый шаблон: файловая система + команда запуска. Состоит из <b>слоёв</b>; одинаковые слои разных образов хранятся один раз.</li>
          <li><b>Контейнер</b> — запущенный экземпляр образа (как объект и класс). Из одного образа можно запустить сколько угодно контейнеров.</li>
          <li><b>Реестр</b> (registry) — хранилище образов: Docker Hub, GitHub Container Registry (ghcr.io), облачные реестры. Имя образа: <code>postgres:17</code>, <code>ghcr.io/anna/notes:3f2a1bc</code>.</li>
          <li>Файлы внутри контейнера <b>исчезают</b> при его удалении. Постоянные данные (БД, загрузки) хранят в <b>томах</b> (volumes).</li>
        </ul>`,
    },
    {
      title: 'Dockerfile',
      html: `<p>Рецепт сборки образа. Основные инструкции:</p>
        <table>
          <tr><th>Инструкция</th><th>Что делает</th></tr>
          <tr><td><code>FROM python:3.13-slim</code></td><td>Базовый образ</td></tr>
          <tr><td><code>WORKDIR /app</code></td><td>Рабочая папка</td></tr>
          <tr><td><code>COPY src dst</code></td><td>Скопировать файлы из проекта в образ</td></tr>
          <tr><td><code>RUN pip install ...</code></td><td>Выполнить команду при сборке (новый слой)</td></tr>
          <tr><td><code>ENV KEY=value</code></td><td>Переменная окружения</td></tr>
          <tr><td><code>EXPOSE 8000</code></td><td>Документирует порт (сам ничего не открывает)</td></tr>
          <tr><td><code>USER app</code></td><td>Запускать не от root</td></tr>
          <tr><td><code>CMD [...]</code></td><td>Команда запуска контейнера</td></tr>
        </table>
        <p><b>Кэш слоёв</b>: если инструкция и файлы не изменились, Docker берёт слой из кэша. Поэтому сначала копируют <code>requirements.txt</code> и ставят зависимости,
        а уже потом — код: при правке кода зависимости не переустанавливаются.</p>
        <p>Файл <code>.dockerignore</code> исключает из сборки <code>.venv</code>, <code>.git</code>, <code>.env</code>, кэш — образ меньше, секреты не утекают.</p>`,
    },
    {
      title: 'Docker Compose',
      html: `<p>Реальное приложение — это несколько контейнеров: API, PostgreSQL, Redis. <b>Docker Compose</b> описывает их в одном файле <code>compose.yaml</code> и запускает одной командой.</p>
        <ul>
          <li>Контейнеры одного compose-проекта в общей сети и обращаются друг к другу <b>по имени сервиса</b>: <code>postgresql://...@db:5432/...</code>, а не <code>localhost</code>.</li>
          <li><code>depends_on</code> + <code>healthcheck</code> — API стартует после того, как БД готова.</li>
          <li>Тома для данных БД, переменные из файла <code>.env</code>.</li>
        </ul>`,
    },
    {
      title: 'Хорошие практики',
      html: `<ul>
          <li>Маленькие базовые образы (<code>-slim</code>), <b>многоэтапная сборка</b> (multi-stage): инструменты сборки остаются в первом этапе, в итоговый образ попадает только нужное.</li>
          <li>Запуск не от root (<code>USER</code>).</li>
          <li>Один процесс на контейнер; логи — в stdout/stderr, а не в файлы.</li>
          <li>Секреты — через переменные окружения или Docker secrets при запуске, <b>никогда</b> не в образе (их видно в слоях).</li>
          <li>Конкретные теги (<code>postgres:17.2</code>), а не <code>latest</code> — воспроизводимость.</li>
          <li><code>HEALTHCHECK</code> и корректная обработка сигнала остановки (SIGTERM).</li>
          <li>Сканирование образов на уязвимости: <code>docker scout</code>, Trivy.</li>
        </ul>`,
    },
  ],
  examples: [
    {
      title: 'Основные команды',
      lang: 'bash',
      code: String.raw`
docker run hello-world                       # проверить установку
docker run -it --rm python:3.13 python       # REPL в контейнере, удалить после выхода

docker run -d --name pg -p 127.0.0.1:5432:5432 \
  -e POSTGRES_PASSWORD=secret -v pgdata:/var/lib/postgresql/data postgres:17

docker ps                    # запущенные контейнеры (-a — все)
docker logs -f pg            # логи
docker exec -it pg psql -U postgres   # команда внутри работающего контейнера
docker stop pg && docker rm pg        # остановить и удалить (том pgdata сохранится)

docker images                # образы
docker system df             # сколько места занято
docker system prune          # удалить неиспользуемое`,
    },
    {
      title: 'Dockerfile для API заметок',
      lang: 'dockerfile',
      code: String.raw`
# ---- Этап 1: зависимости ----
FROM python:3.13-slim AS builder
WORKDIR /app
RUN pip install --no-cache-dir uv
COPY requirements.txt .
RUN uv pip install --system --no-cache -r requirements.txt --target /deps

# ---- Этап 2: итоговый образ ----
FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/deps
WORKDIR /app

RUN useradd --create-home --uid 1000 app
COPY --from=builder /deps /deps
COPY --chown=app:app . .
USER app

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')"
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`,
      explain: `<p>Внутри контейнера приложение слушает <code>0.0.0.0</code> — иначе к нему не достучаться из-за пределов контейнера. Наружу порт открывается только при <code>-p</code>.
        <code>PYTHONUNBUFFERED=1</code> — логи сразу попадают в <code>docker logs</code>.</p>`,
    },
    {
      title: '.dockerignore',
      lang: 'text',
      code: String.raw`
.git
.venv
__pycache__
*.pyc
.env
.pytest_cache
tests
*.db`,
    },
    {
      title: 'compose.yaml: API + PostgreSQL + Redis',
      lang: 'yaml',
      code: String.raw`
services:
  app:
    build: .
    image: notes-api:dev
    ports:
      - "127.0.0.1:8000:8000"
    environment:
      DATABASE_URL: postgresql+psycopg://notes:notes@db:5432/notes   # db — имя сервиса
      REDIS_URL: redis://redis:6379/0
    env_file: .env              # секреты: JWT_SECRET и др. (файл не в Git)
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped

  db:
    image: postgres:17
    environment:
      POSTGRES_USER: notes
      POSTGRES_PASSWORD: notes
      POSTGRES_DB: notes
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U notes"]
      interval: 5s
      retries: 10

  redis:
    image: redis:7

volumes:
  pgdata:`,
    },
    {
      title: 'Работа с compose',
      lang: 'bash',
      code: String.raw`
docker compose up -d --build          # собрать и запустить всё в фоне
docker compose ps
docker compose logs -f app
docker compose exec app alembic upgrade head    # миграции внутри контейнера
docker compose exec db psql -U notes
docker compose down                   # остановить (данные в томе сохранятся)
docker compose down -v                # остановить и удалить тома — данные БД пропадут!`,
    },
  ],
  tasks: [
    {
      title: 'Установите Docker',
      level: 'легко',
      text: `<p>Установите Docker Desktop (Windows/macOS; на Windows — с WSL 2) или Docker Engine (Linux). Запустите <code>hello-world</code>, затем <code>nginx</code> с пробросом порта
        <code>-p 8080:80</code> и откройте <code>http://localhost:8080</code>. Зайдите внутрь контейнера (<code>docker exec -it ... sh</code>) и измените файл <code>/usr/share/nginx/html/index.html</code>.
        Удалите контейнер и запустите заново — что стало с вашим изменением?</p>`,
      solution: `<p>Изменение пропало: файловая система контейнера временная. Чтобы сохранять или подставлять файлы, используют тома или bind mount: <code>-v ./site:/usr/share/nginx/html</code>.</p>`,
    },
    {
      title: 'Контейнеризуйте API заметок',
      level: 'средне',
      text: `<p>Напишите Dockerfile и compose.yaml для API заметок (приложение + PostgreSQL + Redis). Проект должен подниматься с нуля одной командой <code>docker compose up</code>
        на чистой машине, где есть только Docker. Обновите README. Сравните размер образа на <code>python:3.13</code> и <code>python:3.13-slim</code>.</p>`,
    },
    {
      title: 'Оптимизация сборки',
      level: 'средне',
      text: `<p>Поменяйте порядок инструкций в Dockerfile: <code>COPY . .</code> перед установкой зависимостей. Измените одну строку кода и пересоберите — сколько времени заняла сборка?
        Верните правильный порядок и повторите. Объясните разницу.</p>`,
      solution: `<p>При <code>COPY . .</code> до <code>pip install</code> любое изменение кода инвалидирует кэш этого слоя и всех следующих — зависимости ставятся заново (минуты).
        При правильном порядке слой с зависимостями берётся из кэша, пересобирается только слой с кодом (секунды).</p>`,
    },
  ],
  quiz: [
    { q: 'Чем контейнер отличается от виртуальной машины?', options: ['Ничем', 'Контейнер использует ядро хоста и изолирован средствами ОС, ВМ эмулирует целый компьютер', 'Контейнер всегда медленнее', 'ВМ не может запускать Linux'], answer: 1 },
    { q: 'Что произойдёт с данными БД при удалении контейнера без тома?', options: ['Сохранятся в образе', 'Пропадут', 'Перенесутся на хост', 'Останутся в реестре'], answer: 1 },
    { q: 'Как контейнер API обращается к PostgreSQL в одном compose-проекте?', options: ['localhost:5432', 'По имени сервиса: db:5432', 'По IP хоста', 'Через Docker Hub'], answer: 1 },
    { q: 'Почему <code>requirements.txt</code> копируют и устанавливают до копирования кода?', options: ['Так требует Docker', 'Чтобы слой с зависимостями кэшировался и не пересобирался при правке кода', 'Чтобы образ был меньше', 'Для безопасности'], answer: 1 },
    { q: 'Где нельзя хранить секреты?', options: ['В переменных окружения при запуске', 'В Docker secrets', 'Внутри образа (в Dockerfile)', 'В менеджере секретов'], answer: 2 },
  ],
  resources: [
    { title: 'Docker: Get started', url: 'https://docs.docker.com/get-started/' },
    { title: 'FastAPI в контейнерах', url: 'https://fastapi.tiangolo.com/ru/deployment/docker/' },
    { title: 'Play with Docker — песочница в браузере', url: 'https://labs.play-with-docker.com/' },
  ],
});

registerContent('lxc', {
  intro: `<p><b>LXC</b> (Linux Containers) — технология <b>системных</b> контейнеров: внутри работает почти полноценный Linux с init-системой, несколькими сервисами, SSH.
    По ощущениям — лёгкая виртуальная машина. Docker изначально был построен поверх LXC, но затем перешёл на собственную среду выполнения.</p>`,
  theory: [
    {
      title: 'Системные и прикладные контейнеры',
      html: `<table>
          <tr><th></th><th>LXC / Incus</th><th>Docker</th></tr>
          <tr><td>Что внутри</td><td>Целая ОС: systemd, много процессов</td><td>Один процесс-приложение</td></tr>
          <tr><td>Жизненный цикл</td><td>Долгоживущий, обновляется как сервер</td><td>Неизменяемый, пересоздаётся из образа</td></tr>
          <tr><td>Похоже на</td><td>Лёгкую ВМ</td><td>Упакованное приложение</td></tr>
          <tr><td>Где встречается</td><td>Proxmox, хостинг-провайдеры, лаборатории</td><td>Разработка, CI/CD, Kubernetes</td></tr>
        </table>
        <p>Современный инструмент управления — <b>Incus</b> (форк LXD) с удобной командой <code>incus</code>. В Proxmox VE LXC-контейнеры — альтернатива ВМ для экономии ресурсов.</p>
        <p class="note">Для доставки бэкенд-приложений используйте Docker/OCI-образы. LXC полезен, когда нужна «машина», а не «приложение».</p>`,
    },
  ],
  examples: [
    {
      title: 'Incus за минуту',
      lang: 'bash',
      code: String.raw`
sudo apt install incus && sudo incus admin init --minimal

incus launch images:ubuntu/24.04 lab        # создать и запустить контейнер-«машину»
incus list
incus exec lab -- bash                       # зайти внутрь: там systemd, apt, всё как на сервере
incus snapshot create lab before-upgrade     # снимок состояния
incus stop lab && incus delete lab`,
    },
  ],
  tasks: [
    {
      title: 'Учебный сервер в контейнере',
      level: 'средне',
      text: `<p>На Linux (или в WSL 2 / ВМ) создайте Incus-контейнер с Ubuntu и выполните в нём базовую настройку сервера из темы «Безопасность сервера». Это безопасный способ тренироваться,
        не арендуя VPS: сломали — откатились на снимок.</p>`,
    },
  ],
  quiz: [
    { q: 'Чем системный контейнер LXC отличается от Docker-контейнера?', options: ['Работает только на Windows', 'Внутри полноценная ОС с init и многими сервисами', 'Требует гипервизор', 'Не изолирует процессы'], answer: 1 },
  ],
  resources: [
    { title: 'Incus: документация', url: 'https://linuxcontainers.org/incus/docs/main/' },
  ],
});

registerContent('kubernetes', {
  intro: `<p>Docker запускает контейнеры на одной машине. А если машин двадцать, приложение должно переживать падение сервера, масштабироваться под нагрузкой и обновляться без простоя?
    <b>Kubernetes</b> (K8s) — система <b>оркестрации</b>: вы описываете желаемое состояние («3 копии API, вот образ, вот ресурсы»), а кластер сам его поддерживает.</p>`,
  theory: [
    {
      title: 'Декларативная модель',
      html: `<p>Вы не говорите «запусти контейнер на сервере 5», вы описываете в YAML <b>желаемое состояние</b> и отправляете его в кластер (<code>kubectl apply</code>).
        Контроллеры постоянно сравнивают фактическое состояние с желаемым и исправляют расхождения: упал под — запустят новый, умер узел — перенесут поды на другие.</p>
        <p>Кластер: <b>control plane</b> (API-сервер, планировщик, хранилище etcd) и <b>узлы</b> (nodes) — машины, на которых работают контейнеры.</p>`,
    },
    {
      title: 'Основные объекты',
      html: `<table>
          <tr><th>Объект</th><th>Что это</th></tr>
          <tr><td><b>Pod</b></td><td>Минимальная единица: один (иногда несколько) контейнер с общей сетью. Поды смертны и заменяемы.</td></tr>
          <tr><td><b>Deployment</b></td><td>Управляет набором одинаковых подов: число реплик, rolling update, откат.</td></tr>
          <tr><td><b>Service</b></td><td>Постоянный адрес и балансировка между подами (поды меняют IP, Service — нет).</td></tr>
          <tr><td><b>Ingress</b> / Gateway</td><td>Вход HTTP(S)-трафика снаружи: домены, пути, TLS.</td></tr>
          <tr><td><b>ConfigMap</b> / <b>Secret</b></td><td>Настройки и секреты, передаются в поды как переменные или файлы.</td></tr>
          <tr><td><b>PersistentVolumeClaim</b></td><td>Запрос постоянного диска.</td></tr>
          <tr><td><b>HorizontalPodAutoscaler</b></td><td>Автоматически меняет число реплик по нагрузке.</td></tr>
          <tr><td><b>Namespace</b></td><td>Изолированное пространство внутри кластера (dev, staging, prod).</td></tr>
        </table>`,
    },
    {
      title: 'Пробы и ресурсы',
      html: `<ul>
          <li><b>readinessProbe</b> — готов ли под принимать трафик (пока не готов — Service на него не шлёт).</li>
          <li><b>livenessProbe</b> — жив ли процесс; если нет — Kubernetes перезапустит контейнер.</li>
          <li><b>resources.requests</b> — сколько CPU/памяти гарантировать (по ним планировщик выбирает узел), <b>limits</b> — максимум (превысил память — контейнер убьют).</li>
        </ul>
        <p>Вот где пригождается эндпоинт <code>/health</code> из темы «Режимы отказа».</p>`,
    },
    {
      title: 'Нужен ли вам Kubernetes',
      html: `<p>Kubernetes мощный, но сложный: сети, хранилища, безопасность, обновления кластера. Для одного-двух сервисов достаточно VPS с docker compose или PaaS.
        K8s окупается, когда сервисов много, нужна автоматическая масштабируемость и есть команда, которая его обслуживает.</p>
        <p>Чаще используют управляемые кластеры: GKE, EKS, AKS, Yandex Managed Kubernetes. Для локального обучения — <b>kind</b>, <b>minikube</b>, <b>k3d</b> или Kubernetes в Docker Desktop.
        Шаблонизация манифестов — <b>Helm</b>, <b>Kustomize</b>.</p>`,
    },
  ],
  examples: [
    {
      title: 'Deployment и Service для API заметок',
      lang: 'yaml',
      code: String.raw`
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notes-api
spec:
  replicas: 3
  selector:
    matchLabels: { app: notes-api }
  template:
    metadata:
      labels: { app: notes-api }
    spec:
      containers:
        - name: api
          image: ghcr.io/anna/notes:3f2a1bc
          ports:
            - containerPort: 8000
          envFrom:
            - secretRef: { name: notes-secrets }     # DATABASE_URL, JWT_SECRET
          resources:
            requests: { cpu: 100m, memory: 128Mi }
            limits:   { memory: 256Mi }
          readinessProbe:
            httpGet: { path: /health, port: 8000 }
            periodSeconds: 5
          livenessProbe:
            httpGet: { path: /health, port: 8000 }
            initialDelaySeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: notes-api
spec:
  selector: { app: notes-api }
  ports:
    - port: 80
      targetPort: 8000`,
    },
    {
      title: 'kubectl на локальном кластере',
      lang: 'bash',
      code: String.raw`
kind create cluster --name lab                  # кластер в Docker
kubectl create secret generic notes-secrets \
  --from-literal=DATABASE_URL=postgresql+psycopg://... --from-literal=JWT_SECRET=...
kubectl apply -f k8s/

kubectl get pods -w                             # смотреть, как поды запускаются
kubectl logs deploy/notes-api -f
kubectl describe pod notes-api-7d9c...          # события: почему под не стартует
kubectl port-forward svc/notes-api 8000:80      # доступ с ноутбука

kubectl set image deploy/notes-api api=ghcr.io/anna/notes:9e8d7c6   # rolling update
kubectl rollout status deploy/notes-api
kubectl rollout undo deploy/notes-api            # откат
kubectl scale deploy/notes-api --replicas=5
kubectl delete pod notes-api-7d9c...             # «убить» под — Deployment создаст новый`,
    },
  ],
  tasks: [
    {
      title: 'Первый кластер',
      level: 'средне',
      text: `<p>Установите kind или minikube и kubectl. Разверните API заметок (PostgreSQL можно поставить в кластер Helm-чартом или временно запустить простым Deployment).
        Удалите один под и посмотрите, как Kubernetes его восстанавливает. Сделайте rolling update на новую версию образа и откатитесь.</p>`,
      hint: `<p>Локальный образ в kind загружается командой <code>kind load docker-image notes-api:dev --name lab</code>, и тогда в манифесте укажите <code>imagePullPolicy: IfNotPresent</code>.</p>`,
    },
    {
      title: 'Сломанная проба',
      level: 'средне',
      text: `<p>Измените <code>readinessProbe</code> на несуществующий путь <code>/healthz</code> и примените. Что показывают <code>kubectl get pods</code> и <code>kubectl describe pod</code>? Идёт ли на поды трафик?
        Затем сломайте <code>livenessProbe</code> — чем отличается поведение?</p>`,
      solution: `<p>С неверной readiness поды работают, но в статусе <code>0/1 READY</code>, и Service не отправляет на них трафик; при rolling update старые поды не удаляются, пока новые не станут готовыми — это защищает от выкатки сломанной версии.
        С неверной liveness Kubernetes будет постоянно перезапускать контейнер (растёт RESTARTS, затем статус CrashLoopBackOff).</p>`,
    },
  ],
  quiz: [
    { q: 'Какой объект поддерживает заданное число одинаковых подов и делает rolling update?', options: ['Pod', 'Service', 'Deployment', 'ConfigMap'], answer: 2 },
    { q: 'Зачем нужен Service?', options: ['Хранить секреты', 'Дать постоянный адрес и балансировку для меняющихся подов', 'Собирать образы', 'Масштабировать узлы'], answer: 1 },
    { q: 'Что делает Kubernetes, если не проходит livenessProbe?', options: ['Ничего', 'Перестаёт слать трафик', 'Перезапускает контейнер', 'Удаляет Deployment'], answer: 2 },
    { q: 'Когда Kubernetes, скорее всего, избыточен?', options: ['Десятки микросервисов с автомасштабированием', 'Один сервис с одной БД у небольшой команды', 'Большая платформа с несколькими командами', 'Нужен деплой без простоя для 50 сервисов'], answer: 1 },
  ],
  resources: [
    { title: 'Kubernetes: основы (интерактивно)', url: 'https://kubernetes.io/ru/docs/tutorials/kubernetes-basics/' },
    { title: 'kind — Kubernetes в Docker', url: 'https://kind.sigs.k8s.io/' },
  ],
});
