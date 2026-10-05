// Раздел 11. Тестирование

registerContent('unit-testing', {
  intro: `<p><b>Тесты</b> — это код, который проверяет ваш код. Они ловят ошибки до пользователей, позволяют смело рефакторить и служат живой документацией.
    <b>Модульные (unit) тесты</b> проверяют маленькие части — функцию, класс — изолированно от БД, сети и файлов. Они быстрые: сотни тестов за секунду.
    В Python стандарт де-факто — <b>pytest</b>.</p>`,
  theory: [
    {
      title: 'Пирамида тестирования',
      html: `<ul>
          <li><b>Основание — много модульных тестов</b>: быстрые, точно указывают на ошибку.</li>
          <li><b>Середина — интеграционные</b>: код + настоящая БД, Redis, HTTP-слой.</li>
          <li><b>Вершина — немного end-to-end</b>: систему проверяют целиком, как пользователь. Медленные и хрупкие.</li>
        </ul>
        <p>Хороший тест: быстрый, независимый от других тестов и порядка запуска, детерминированный (не «мигает»), проверяет поведение, а не детали реализации.</p>`,
    },
    {
      title: 'Основы pytest',
      html: `<ul>
          <li>Файлы <code>test_*.py</code>, функции <code>test_*</code> — pytest находит их сам.</li>
          <li>Проверки — обычный <code>assert</code>; при падении pytest подробно покажет значения.</li>
          <li><code>pytest.raises(ValueError)</code> — ожидаем исключение.</li>
          <li><code>@pytest.mark.parametrize</code> — один тест на много наборов данных.</li>
          <li>Запуск: <code>pytest</code>, <code>pytest -v</code> (подробно), <code>pytest -k pagination</code> (по имени), <code>pytest -x</code> (стоп на первой ошибке).</li>
        </ul>
        <p>Структура теста — <b>Arrange / Act / Assert</b>: подготовить данные, выполнить действие, проверить результат.</p>`,
    },
    {
      title: 'Фикстуры',
      html: `<p><b>Фикстура</b> — функция с декоратором <code>@pytest.fixture</code>, которая готовит данные или ресурсы для теста. Тест получает её, просто указав имя в параметрах.</p>
        <ul>
          <li>Код после <code>yield</code> выполняется после теста — очистка.</li>
          <li><code>scope="session"</code> — фикстура создаётся один раз на весь прогон (например, контейнер с БД).</li>
          <li>Общие фикстуры кладут в <code>conftest.py</code> — они доступны всем тестам папки.</li>
          <li>Встроенные: <code>tmp_path</code> (временная папка), <code>monkeypatch</code> (подмена переменных окружения и атрибутов), <code>capsys</code> (перехват вывода).</li>
        </ul>`,
    },
    {
      title: 'Моки и изоляция',
      html: `<p>Чтобы тестировать логику без внешних зависимостей, их заменяют <b>тестовыми двойниками</b>:</p>
        <ul>
          <li><b>Fake</b> — упрощённая рабочая реализация (репозиторий в памяти вместо БД);</li>
          <li><b>Stub</b> — возвращает заготовленные ответы;</li>
          <li><b>Mock</b> — ещё и запоминает вызовы, чтобы проверить «вызвали ли отправку письма с такими аргументами».</li>
        </ul>
        <p><code>unittest.mock.Mock</code> и <code>patch</code> — стандартные инструменты. Лучше всего тестируется код, в который зависимости <b>передаются</b> (внедрение зависимостей из темы ООП), — тогда фейк просто передаётся в конструктор, без <code>patch</code>.</p>
        <p class="note">Не увлекайтесь моками: тест, где замокано всё, проверяет только сами моки. Мокайте границы системы — сеть, время, внешние API.</p>`,
    },
    {
      title: 'Покрытие и TDD',
      html: `<p><b>Покрытие</b> (<code>pytest-cov</code>) показывает, какие строки выполнялись в тестах. Полезно, чтобы найти непроверенный код, но 100% покрытия не гарантирует отсутствия багов.
        Разумная цель для бэкенда — 70–90% с упором на бизнес-логику.</p>
        <p><b>TDD</b> (разработка через тестирование): сначала пишем падающий тест (red), затем минимальный код, чтобы он прошёл (green), затем улучшаем код (refactor). Особенно хорошо работает при исправлении багов: сначала тест, воспроизводящий баг.</p>`,
    },
  ],
  examples: [
    {
      title: 'Первые тесты',
      lang: 'python',
      code: String.raw`
# app/pricing.py
def apply_discount(price: int, percent: int) -> int:
    if not 0 <= percent <= 100:
        raise ValueError("Скидка должна быть от 0 до 100")
    return price * (100 - percent) // 100

# tests/test_pricing.py
import pytest
from app.pricing import apply_discount

def test_no_discount():
    assert apply_discount(1000, 0) == 1000

@pytest.mark.parametrize("price, percent, expected", [
    (1000, 10, 900),
    (999, 50, 499),      # округление вниз
    (1000, 100, 0),
])
def test_discount(price, percent, expected):
    assert apply_discount(price, percent) == expected

@pytest.mark.parametrize("percent", [-1, 101])
def test_invalid_percent(percent):
    with pytest.raises(ValueError, match="от 0 до 100"):
        apply_discount(1000, percent)`,
    },
    {
      title: 'Фикстуры, фейки и моки',
      lang: 'python',
      code: String.raw`
# app/services.py
class UserService:
    def __init__(self, repo, mailer):
        self.repo, self.mailer = repo, mailer

    def register(self, email: str) -> int:
        if self.repo.find_by_email(email):
            raise ValueError("Email занят")
        user_id = self.repo.create(email)
        self.mailer.send(email, "Добро пожаловать!")
        return user_id

# tests/test_services.py
from unittest.mock import Mock
import pytest
from app.services import UserService

class FakeRepo:
    def __init__(self):
        self.users = {}
    def find_by_email(self, email):
        return next((uid for uid, e in self.users.items() if e == email), None)
    def create(self, email):
        uid = len(self.users) + 1
        self.users[uid] = email
        return uid

@pytest.fixture
def mailer():
    return Mock()

@pytest.fixture
def service(mailer):
    return UserService(FakeRepo(), mailer)

def test_register_sends_welcome_email(service, mailer):
    user_id = service.register("anna@mail.ru")
    assert user_id == 1
    mailer.send.assert_called_once_with("anna@mail.ru", "Добро пожаловать!")

def test_register_duplicate_email(service, mailer):
    service.register("anna@mail.ru")
    with pytest.raises(ValueError):
        service.register("anna@mail.ru")
    assert mailer.send.call_count == 1      # второе письмо не ушло`,
    },
    {
      title: 'Запуск и покрытие',
      lang: 'bash',
      code: String.raw`
pip install pytest pytest-cov
pytest -v
pytest --cov=app --cov-report=term-missing
# Name               Stmts   Miss  Cover   Missing
# app/pricing.py         4      0   100%
# app/services.py       10      0   100%`,
    },
  ],
  tasks: [
    {
      title: 'Тесты для пройденных функций',
      level: 'легко',
      text: `<p>Напишите тесты с <code>parametrize</code> для функций из курса: <code>check_password</code> (тема «Функции»), <code>paginate</code> (тема «Коллекции»),
        <code>is_valid_domain</code> (тема «Доменные имена»). Не забудьте граничные случаи: пустой список, последняя страница, ровно 8 символов.</p>`,
    },
    {
      title: 'Тестируем время',
      level: 'средне',
      text: `<p>Функция <code>is_token_expired(token)</code> сравнивает срок токена с текущим временем. Как протестировать её без <code>time.sleep</code>? Сделайте двумя способами:
        передавая «часы» параметром (<code>now: Callable[[], datetime]</code>) и через библиотеку <code>freezegun</code> или <code>time-machine</code>.</p>`,
    },
    {
      title: 'TDD: корзина со скидками',
      level: 'сложно',
      text: `<p>Методом TDD (сначала тест!) реализуйте расчёт корзины: сумма позиций; промокод <code>SALE10</code> даёт 10%; при сумме от 5000 ₽ доставка бесплатная, иначе 300 ₽;
        скидка не применяется к доставке; промокод одноразовый. Сделайте коммит после каждого цикла red → green → refactor.</p>`,
    },
  ],
  quiz: [
    { q: 'Как pytest находит тесты?', options: ['По списку в конфиге', 'По именам: файлы test_*.py и функции test_*', 'По декоратору @test', 'Только в папке tests'], answer: 1 },
    { q: 'Что делает код после <code>yield</code> в фикстуре?', options: ['Ничего', 'Выполняется после теста — очистка', 'Выполняется перед тестом', 'Повторяет тест'], answer: 1 },
    { q: 'Что лучше мокать в модульных тестах?', options: ['Всё подряд', 'Внешние границы: сеть, время, внешние API', 'Тестируемую функцию', 'Ничего'], answer: 1 },
    { q: 'Что гарантирует 100% покрытие?', options: ['Отсутствие багов', 'Только то, что каждая строка выполнялась хотя бы раз', 'Скорость кода', 'Безопасность'], answer: 1 },
  ],
  resources: [
    { title: 'Документация pytest', url: 'https://docs.pytest.org/en/stable/getting-started.html' },
    { title: 'Real Python: эффективное тестирование с pytest', url: 'https://realpython.com/pytest-python-testing/' },
  ],
});

registerContent('integration-testing', {
  intro: `<p>Модульные тесты с фейками не поймают ошибку в SQL-запросе, неправильную миграцию или несовместимость с настоящим Redis.
    <b>Интеграционные тесты</b> проверяют ваш код вместе с реальными зависимостями: базой данных, кэшем, файловой системой.</p>`,
  theory: [
    {
      title: 'Что проверять',
      html: `<ul>
          <li>Репозитории и запросы к БД — на <b>той же СУБД</b>, что в продакшене (PostgreSQL, а не SQLite: отличаются типы, блокировки, <code>RETURNING</code>, JSONB).</li>
          <li>Миграции — применяются с нуля и откатываются.</li>
          <li>Ограничения БД — уникальность, внешние ключи действительно срабатывают.</li>
          <li>Транзакции — откат при ошибке.</li>
          <li>Работа с кэшем, очередями, хранилищем файлов.</li>
        </ul>`,
    },
    {
      title: 'Настоящая БД в тестах',
      html: `<p><b>Testcontainers</b> запускает Docker-контейнер с PostgreSQL на время тестов и удаляет после — ничего не нужно ставить вручную, CI получает то же окружение.</p>
        <p>Альтернатива — общий сервис <code>docker compose</code> или <code>services</code> в CI.</p>`,
    },
    {
      title: 'Изоляция тестов друг от друга',
      html: `<p>Каждый тест должен начинать с известного состояния БД. Способы:</p>
        <ul>
          <li><b>Откат транзакции</b>: каждый тест работает внутри транзакции, которая в конце откатывается. Быстро — данные никогда не записываются по-настоящему.</li>
          <li><b>Очистка таблиц</b> (<code>TRUNCATE</code>) после каждого теста — проще, медленнее.</li>
          <li>Схему создают один раз за прогон (миграциями) — фикстура со <code>scope="session"</code>.</li>
        </ul>
        <p>Для внешних HTTP-API (платёжки, погода) используют записанные ответы (<code>respx</code>, <code>responses</code>, <code>vcrpy</code>) или их тестовые песочницы.</p>`,
    },
  ],
  examples: [
    {
      title: 'conftest.py: PostgreSQL в контейнере и откат транзакций',
      lang: 'python',
      code: String.raw`
# pip install pytest "testcontainers[postgres]" sqlalchemy "psycopg[binary]"
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from testcontainers.postgres import PostgresContainer
from app.models import Base

@pytest.fixture(scope="session")
def engine():
    with PostgresContainer("postgres:17", driver="psycopg") as pg:   # поднимается один раз
        engine = create_engine(pg.get_connection_url())
        Base.metadata.create_all(engine)                            # или alembic upgrade head
        yield engine

@pytest.fixture
def session(engine):
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    yield session
    session.close()
    transaction.rollback()          # всё, что сделал тест, исчезает
    connection.close()`,
    },
    {
      title: 'Тест репозитория',
      lang: 'python',
      code: String.raw`
import pytest
from sqlalchemy.exc import IntegrityError
from app.models import Note, User
from app.repositories import NoteRepository

@pytest.fixture
def user(session):
    u = User(email="anna@mail.ru", name="Анна")
    session.add(u)
    session.flush()
    return u

def test_filter_by_tag(session, user):
    repo = NoteRepository(session)
    repo.create(user.id, "SQL", tags=["db"])
    repo.create(user.id, "Python", tags=["lang"])
    notes = repo.list(user.id, tag="db")
    assert [n.title for n in notes] == ["SQL"]

def test_email_unique(session, user):
    session.add(User(email="anna@mail.ru", name="Дубль"))
    with pytest.raises(IntegrityError):
        session.flush()`,
    },
  ],
  tasks: [
    {
      title: 'Интеграционные тесты для заметок',
      level: 'средне',
      text: `<p>Настройте Testcontainers для API заметок и напишите тесты репозитория: создание, фильтр по тегу, пагинация, удаление, то, что пользователь не видит чужие заметки.
        Убедитесь, что тесты проходят в любом порядке (<code>pip install pytest-randomly</code>).</p>`,
    },
    {
      title: 'Тест миграций',
      level: 'средне',
      text: `<p>Напишите тест, который на пустой базе выполняет <code>alembic upgrade head</code>, затем <code>alembic downgrade base</code> и снова <code>upgrade head</code> — всё без ошибок.
        Такой тест ловит забытые или сломанные <code>downgrade</code>.</p>`,
      hint: `<p>Alembic можно вызывать из Python: <code>from alembic import command</code>, <code>command.upgrade(config, "head")</code>; URL базы задайте через <code>config.set_main_option("sqlalchemy.url", ...)</code>.</p>`,
    },
  ],
  quiz: [
    { q: 'Почему интеграционные тесты лучше гонять на той же СУБД, что в продакшене?', options: ['Так быстрее', 'СУБД отличаются типами, функциями и поведением — ошибки могут проявиться только на настоящей', 'SQLite платный', 'Это требование pytest'], answer: 1 },
    { q: 'Как быстро изолировать тесты, работающие с БД?', options: ['Пересоздавать базу на каждый тест', 'Выполнять тест в транзакции и откатывать её', 'Не изолировать', 'Запускать тесты по одному вручную'], answer: 1 },
    { q: 'Что делает Testcontainers?', options: ['Пишет тесты за вас', 'Запускает Docker-контейнеры с зависимостями на время тестов', 'Мокает базу данных', 'Измеряет покрытие'], answer: 1 },
  ],
  resources: [
    { title: 'Testcontainers для Python', url: 'https://testcontainers-python.readthedocs.io/' },
    { title: 'SQLAlchemy: сессия во внешней транзакции (для тестов)', url: 'https://docs.sqlalchemy.org/en/20/orm/session_transaction.html#joining-a-session-into-an-external-transaction-such-as-for-test-suites' },
  ],
});

registerContent('functional-testing', {
  intro: `<p><b>Функциональные тесты</b> проверяют систему с точки зрения клиента: отправляем HTTP-запросы в API и проверяем ответы. Неважно, как устроен код внутри —
    важно, что сценарий «зарегистрироваться → войти → создать заметку → найти её» работает. Это самые ценные тесты для бэкенда: они ловят ошибки на стыке всех слоёв.</p>`,
  theory: [
    {
      title: 'TestClient FastAPI',
      html: `<p><code>TestClient</code> отправляет запросы в приложение напрямую, без запуска сервера и сети, — быстро и просто. Проверяем статус, тело, заголовки.</p>
        <p>Зависимости (БД, текущий пользователь, внешние сервисы) подменяются через <code>app.dependency_overrides</code> — например, подставляем тестовую сессию БД из интеграционной фикстуры.</p>`,
    },
    {
      title: 'Что тестировать',
      html: `<ul>
          <li><b>Счастливый путь</b> — основные сценарии работают.</li>
          <li><b>Ошибки клиента</b> — невалидные данные → 422, нет такого объекта → 404, повтор → 409.</li>
          <li><b>Безопасность</b> — без токена → 401, чужие данные → 404/403. Эти тесты защищают от IDOR при любых будущих изменениях.</li>
          <li><b>Контракт</b> — формат ответа (поля, типы) не меняется незаметно для клиентов.</li>
        </ul>
        <p>Для проверки по спецификации OpenAPI — Schemathesis (тема OpenAPI). Для нагрузочного тестирования — Locust, k6.</p>
        <p><b>End-to-end</b> тесты идут ещё дальше: поднимают всю систему (фронтенд + бэкенд + БД) и управляют браузером через <b>Playwright</b>.</p>`,
    },
  ],
  examples: [
    {
      title: 'Функциональные тесты API заметок',
      lang: 'python',
      code: String.raw`
import pytest
from fastapi.testclient import TestClient
from app.main import app, get_session

@pytest.fixture
def client(session):                                   # session — из интеграционного conftest
    app.dependency_overrides[get_session] = lambda: session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def register_and_login(client, email="anna@mail.ru", password="Str0ng-pass!") -> dict:
    client.post("/auth/register", json={"email": email, "password": password})
    r = client.post("/auth/token", data={"username": email, "password": password})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}

def test_note_lifecycle(client):
    headers = register_and_login(client)

    r = client.post("/notes", json={"title": "Купить молоко", "tags": ["дом"]}, headers=headers)
    assert r.status_code == 201
    note_id = r.json()["id"]

    r = client.get("/notes", params={"tag": "дом"}, headers=headers)
    assert [n["id"] for n in r.json()["items"]] == [note_id]

    assert client.delete(f"/notes/{note_id}", headers=headers).status_code == 204
    assert client.get(f"/notes/{note_id}", headers=headers).status_code == 404

def test_requires_auth(client):
    assert client.get("/notes").status_code == 401

def test_cannot_read_foreign_note(client):
    anna = register_and_login(client, "anna@mail.ru")
    boris = register_and_login(client, "boris@mail.ru")
    note_id = client.post("/notes", json={"title": "Секрет"}, headers=anna).json()["id"]
    assert client.get(f"/notes/{note_id}", headers=boris).status_code == 404

@pytest.mark.parametrize("payload", [{}, {"title": ""}, {"title": "x" * 201}])
def test_validation(client, payload):
    headers = register_and_login(client)
    assert client.post("/notes", json=payload, headers=headers).status_code == 422`,
    },
    {
      title: 'Нагрузочный тест на Locust',
      lang: 'python',
      code: String.raw`
# pip install locust; запуск: locust -f locustfile.py --host http://127.0.0.1:8000
from locust import HttpUser, between, task

class NotesUser(HttpUser):
    wait_time = between(0.5, 2)

    def on_start(self):
        r = self.client.post("/auth/token", data={"username": "load@test.ru", "password": "Str0ng-pass!"})
        self.headers = {"Authorization": "Bearer " + r.json()["access_token"]}

    @task(5)
    def list_notes(self):
        self.client.get("/notes", headers=self.headers)

    @task(1)
    def create_note(self):
        self.client.post("/notes", json={"title": "нагрузка"}, headers=self.headers)`,
      explain: `<p>Веб-интерфейс Locust на <code>http://localhost:8089</code> показывает запросы в секунду, время ответа (медиана, 95-й перцентиль) и ошибки по мере роста числа пользователей.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Полное покрытие API',
      level: 'средне',
      text: `<p>Напишите функциональные тесты для всех эндпоинтов API заметок: CRUD, фильтры, пагинация, регистрация (дубликат email → 409), вход с неверным паролем, обновление токена, выход.
        Добейтесь покрытия кода больше 85%.</p>`,
    },
    {
      title: 'Найдите предел',
      level: 'сложно',
      text: `<p>Запустите API заметок с PostgreSQL и проведите нагрузочный тест в Locust, постепенно увеличивая число пользователей. При какой нагрузке 95-й перцентиль превышает 500 мс?
        Найдите узкое место (подсказка: темы «Профилирование», «N+1», «Redis»), исправьте и повторите замер.</p>`,
    },
  ],
  quiz: [
    { q: 'Как в тестах FastAPI подменить зависимость (например, сессию БД)?', options: ['Изменить код приложения', 'app.dependency_overrides', 'monkeypatch.setenv', 'Никак'], answer: 1 },
    { q: 'Зачем тест «пользователь Б не видит заметку пользователя А»?', options: ['Для покрытия', 'Он защищает от уязвимости IDOR при будущих изменениях', 'Для скорости', 'Это не нужно'], answer: 1 },
    { q: 'Чем функциональный тест отличается от модульного?', options: ['Ничем', 'Проверяет поведение системы через внешний интерфейс (HTTP), а не отдельную функцию', 'Он быстрее', 'Пишется без assert'], answer: 1 },
  ],
  resources: [
    { title: 'FastAPI: тестирование', url: 'https://fastapi.tiangolo.com/ru/tutorial/testing/' },
    { title: 'Locust', url: 'https://docs.locust.io/' },
  ],
});
