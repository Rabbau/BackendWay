// Раздел 12. CI/CD
// В YAML GitHub Actions есть выражения вида ${{ ... }}. Внутри шаблонных строк JS они пишутся как ${'$'}{{ ... }}.

registerContent('ci-cd', {
  intro: `<p><b>CI/CD</b> — автоматизация пути кода от коммита до продакшена. Вместо «у меня локально работало» и ручного копирования файлов на сервер —
    конвейер, который на каждый push проверяет код и выкатывает его одинаково и предсказуемо.</p>
    <ul>
      <li><b>CI</b> (Continuous Integration, непрерывная интеграция) — на каждый коммит и Pull Request автоматически запускаются линтеры, тесты, сборка. Сломанный код не попадает в <code>main</code>.</li>
      <li><b>CD</b> (Continuous Delivery / Deployment) — прошедший проверки код автоматически собирается в артефакт и выкатывается на тестовый стенд, а затем в продакшен (по кнопке или сразу).</li>
    </ul>`,
  theory: [
    {
      title: 'Типичный конвейер',
      html: `<ol>
          <li><b>Lint</b> — стиль и простые ошибки: <code>ruff check</code>, <code>ruff format --check</code>.</li>
          <li><b>Type check</b> — <code>mypy</code> или <code>pyright</code>.</li>
          <li><b>Tests</b> — модульные, интеграционные (с PostgreSQL как сервисом), покрытие.</li>
          <li><b>Security</b> — <code>pip-audit</code>, <code>bandit</code>, поиск секретов в коде.</li>
          <li><b>Build</b> — Docker-образ с тегом коммита, публикация в реестр.</li>
          <li><b>Deploy staging</b> → проверки (smoke-тесты) → <b>Deploy production</b>.</li>
        </ol>
        <p>Правило: быстрые проверки — первыми. Если линтер упал за 10 секунд, незачем ждать 5 минут тестов.</p>`,
    },
    {
      title: 'GitHub Actions',
      html: `<p>Конвейер описывается YAML-файлами в <code>.github/workflows/</code>:</p>
        <ul>
          <li><b>workflow</b> — файл с конвейером; <code>on:</code> — когда запускать (push, pull_request, по расписанию, вручную);</li>
          <li><b>job</b> — набор шагов на отдельной виртуальной машине (<code>runs-on: ubuntu-latest</code>); джобы идут параллельно, зависимости — через <code>needs</code>;</li>
          <li><b>step</b> — команда (<code>run:</code>) или готовое действие (<code>uses: actions/checkout@v4</code>);</li>
          <li><b>services</b> — контейнеры-зависимости (PostgreSQL, Redis) на время джоба;</li>
          <li><b>secrets</b> — пароли и ключи, заданные в настройках репозитория; в логах маскируются;</li>
          <li><b>matrix</b> — прогон на нескольких версиях Python или ОС.</li>
        </ul>
        <p>Аналоги: <b>GitLab CI</b> (<code>.gitlab-ci.yml</code>), Jenkins, CircleCI, TeamCity. Принципы одни и те же.</p>`,
    },
    {
      title: 'Защита main и культура',
      html: `<ul>
          <li><b>Branch protection</b>: в <code>main</code> нельзя пушить напрямую, только через PR с зелёным CI и одобрением ревьюера.</li>
          <li>Сломанный <code>main</code> чинится в первую очередь — иначе все работают на неисправной основе.</li>
          <li>CI должен быть быстрым (цель — до 10 минут): кэш зависимостей, параллельные джобы.</li>
          <li><b>pre-commit</b>-хуки запускают линтер ещё до коммита — ошибки ловятся локально.</li>
        </ul>`,
    },
    {
      title: 'Стратегии деплоя',
      html: `<table>
          <tr><th>Стратегия</th><th>Как</th><th>Плюсы / минусы</th></tr>
          <tr><td><b>Recreate</b></td><td>Остановить старую версию, запустить новую</td><td>Просто, но есть простой</td></tr>
          <tr><td><b>Rolling</b></td><td>Заменять экземпляры по одному</td><td>Без простоя; какое-то время работают обе версии</td></tr>
          <tr><td><b>Blue-Green</b></td><td>Поднять новую среду рядом и переключить трафик</td><td>Мгновенный откат; нужно вдвое больше ресурсов</td></tr>
          <tr><td><b>Canary</b></td><td>Сначала 5% трафика на новую версию, следить за метриками, расширять</td><td>Минимальный риск; нужна хорошая наблюдаемость</td></tr>
        </table>
        <p><b>Feature flags</b> отделяют деплой от релиза: код выкатывается выключенным и включается для части пользователей без нового деплоя.</p>
        <p class="note">Помните про миграции (тема «Миграции»): при rolling и blue-green старый и новый код работают с одной БД одновременно — изменения схемы должны быть обратно совместимыми.</p>`,
    },
  ],
  examples: [
    {
      title: 'CI для API заметок: .github/workflows/ci.yml',
      lang: 'yaml',
      code: String.raw`
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.13"
      - run: pip install ruff
      - run: ruff check .
      - run: ruff format --check .

  test:
    needs: lint
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.12", "3.13"]
    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready --health-interval 5s --health-retries 10
    env:
      DATABASE_URL: postgresql+psycopg://postgres:test@localhost:5432/postgres
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${'$'}{{ matrix.python-version }}
          cache: pip
      - run: pip install -r requirements.txt -r requirements-dev.txt
      - run: alembic upgrade head
      - run: pytest --cov=app --cov-report=term-missing --cov-fail-under=80
      - run: pip-audit -r requirements.txt`,
      explain: `<p>Интеграционные тесты здесь используют PostgreSQL из <code>services</code>, а не Testcontainers, — оба варианта работают в GitHub Actions.
        <code>--cov-fail-under=80</code> роняет сборку, если покрытие упало.</p>`,
    },
    {
      title: 'CD: сборка образа и деплой',
      lang: 'yaml',
      code: String.raw`
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${'$'}{{ github.actor }}
          password: ${'$'}{{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: ghcr.io/${'$'}{{ github.repository }}:${'$'}{{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production          # можно требовать ручное подтверждение
    steps:
      - name: Обновить сервер по SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${'$'}{{ secrets.DEPLOY_HOST }}
          username: deploy
          key: ${'$'}{{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /opt/notes
            export IMAGE_TAG=${'$'}{{ github.sha }}
            docker compose pull
            docker compose run --rm app alembic upgrade head
            docker compose up -d
            curl -fsS http://127.0.0.1:8000/health`,
      explain: `<p>Образ помечается хешем коммита — всегда известно, какой код работает, и откат — это деплой предыдущего тега. Секреты хранятся в Settings → Secrets and variables → Actions.</p>`,
    },
    {
      title: 'pre-commit: проверки до коммита',
      lang: 'yaml',
      code: String.raw`
# .pre-commit-config.yaml; установка: pip install pre-commit && pre-commit install
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.6.9
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: check-added-large-files
      - id: detect-private-key
      - id: end-of-file-fixer`,
    },
    {
      title: 'То же в GitLab CI',
      lang: 'yaml',
      code: String.raw`
# .gitlab-ci.yml
stages: [lint, test]

lint:
  stage: lint
  image: python:3.13
  script:
    - pip install ruff
    - ruff check .

test:
  stage: test
  image: python:3.13
  services:
    - postgres:17
  variables:
    POSTGRES_PASSWORD: test
    DATABASE_URL: postgresql+psycopg://postgres:test@postgres:5432/postgres
  script:
    - pip install -r requirements.txt -r requirements-dev.txt
    - pytest`,
    },
  ],
  tasks: [
    {
      title: 'Зелёная галочка',
      level: 'средне',
      text: `<p>Добавьте в репозиторий API заметок workflow CI из примера. Откройте Pull Request с намеренно сломанным тестом — убедитесь, что CI красный.
        Включите branch protection для <code>main</code> (Settings → Branches): требовать зелёный CI перед слиянием. Добавьте значок статуса CI в README.</p>`,
      hint: `<p>Значок: <code>![CI](https://github.com/ЛОГИН/РЕПО/actions/workflows/ci.yml/badge.svg)</code>.</p>`,
    },
    {
      title: 'Ускорьте конвейер',
      level: 'средне',
      text: `<p>Замерьте длительность CI. Ускорьте его: кэш pip (<code>cache: pip</code>) или переход на <code>uv</code>, параллельный запуск тестов (<code>pytest-xdist</code>),
        запуск тяжёлых джобов только при изменении кода (<code>paths:</code>). На сколько удалось сократить время?</p>`,
    },
    {
      title: 'Автодеплой',
      level: 'сложно',
      text: `<p>Настройте автоматический деплой API заметок при push в <code>main</code>: на VPS через SSH (как в примере) или на PaaS (Render, Railway, Fly.io — у них есть свои интеграции с GitHub).
        Добавьте проверку <code>/health</code> после деплоя и автоматический откат на предыдущий образ, если проверка не прошла. Dockerfile и docker compose возьмите из темы «Docker».</p>`,
    },
  ],
  quiz: [
    { q: 'Что такое Continuous Integration?', options: ['Ручная выкладка на сервер', 'Автоматическая проверка (тесты, линтеры) каждого изменения', 'Слияние веток раз в месяц', 'Мониторинг продакшена'], answer: 1 },
    { q: 'Где хранятся workflow GitHub Actions?', options: ['В настройках аккаунта', 'В .github/workflows/*.yml', 'В README', 'В package.json'], answer: 1 },
    { q: 'Как правильно передать пароль от сервера в CI?', options: ['Записать в YAML', 'Через secrets репозитория', 'В коммит-сообщении', 'В переменную в коде'], answer: 1 },
    { q: 'Какая стратегия направляет новую версию сначала на малую долю трафика?', options: ['Recreate', 'Rolling', 'Blue-Green', 'Canary'], answer: 3 },
  ],
  resources: [
    { title: 'GitHub Actions: быстрый старт', url: 'https://docs.github.com/ru/actions/writing-workflows/quickstart' },
    { title: 'Building and testing Python в GitHub Actions', url: 'https://docs.github.com/ru/actions/use-cases-and-examples/building-and-testing/building-and-testing-python' },
    { title: 'pre-commit', url: 'https://pre-commit.com/' },
  ],
});
