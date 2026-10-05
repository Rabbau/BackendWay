// Раздел: Брокеры сообщений

registerContent('rabbitmq', {
  intro: `<p>Не всё нужно делать прямо во время HTTP-запроса. Отправить письмо, сгенерировать PDF, пересчитать рейтинг, уведомить другой сервис — это можно сделать <b>асинхронно</b>:
    положить задачу в очередь и сразу ответить клиенту. <b>Брокер сообщений</b> принимает сообщения от отправителей и доставляет их получателям. <b>RabbitMQ</b> — классический брокер для очередей задач.</p>`,
  theory: [
    {
      title: 'Зачем нужны очереди',
      html: `<ul>
          <li><b>Быстрый ответ</b>: API отвечает за 50 мс, а тяжёлая работа выполняется в фоне.</li>
          <li><b>Слабая связанность</b>: сервис заказов не знает, кто и как отправляет письма. Если сервис почты лежит — сообщения подождут в очереди и не потеряются.</li>
          <li><b>Сглаживание пиков</b>: 10 000 задач за минуту ложатся в очередь, а воркеры разбирают их в своём темпе (load leveling).</li>
          <li><b>Масштабирование</b>: больше нагрузки — запускаем больше воркеров.</li>
        </ul>
        <p>Термины: <b>producer</b> (отправитель), <b>consumer</b> (получатель, воркер), <b>queue</b> (очередь), <b>message</b> (сообщение — обычно JSON).</p>`,
    },
    {
      title: 'Модель RabbitMQ: exchange → queue',
      html: `<p>В RabbitMQ (протокол AMQP) отправитель пишет не в очередь, а в <b>exchange</b> (обменник), который по правилам (<b>bindings</b>) раскладывает сообщения по очередям:</p>
        <table>
          <tr><th>Тип exchange</th><th>Маршрутизация</th><th>Пример</th></tr>
          <tr><td><b>direct</b></td><td>По точному совпадению routing key</td><td><code>email</code> → очередь писем</td></tr>
          <tr><td><b>fanout</b></td><td>Копия во все привязанные очереди</td><td>«Заказ создан» → склад, почта, аналитика</td></tr>
          <tr><td><b>topic</b></td><td>По шаблону ключа: <code>order.*</code>, <code>*.created</code>, <code>#</code></td><td>Подписка на группы событий</td></tr>
          <tr><td><b>headers</b></td><td>По заголовкам сообщения</td><td>Редко</td></tr>
        </table>`,
    },
    {
      title: 'Надёжная доставка',
      html: `<ul>
          <li><b>Подтверждения (ack)</b>: воркер подтверждает сообщение <i>после</i> успешной обработки. Упал до ack — сообщение вернётся в очередь и достанется другому воркеру.</li>
          <li><b>Durable</b>-очереди и <b>persistent</b>-сообщения переживают перезапуск брокера.</li>
          <li><b>Prefetch</b> (<code>basic_qos</code>) — сколько неподтверждённых сообщений воркер берёт одновременно; честное распределение между воркерами.</li>
          <li><b>Dead Letter Exchange</b> — куда уходят сообщения, которые не удалось обработать после N попыток, чтобы не зацикливаться на «ядовитом» сообщении.</li>
          <li>Гарантия обычно <b>at-least-once</b> — сообщение может прийти дважды. Обработчики должны быть <b>идемпотентными</b> (проверять, не обработан ли уже этот id).</li>
        </ul>`,
    },
    {
      title: 'Очереди задач в Python',
      html: `<p>Поверх брокеров работают библиотеки фоновых задач: <b>Celery</b> (самая распространённая, RabbitMQ или Redis), <b>Dramatiq</b>, <b>arq</b> и <b>RQ</b> (на Redis), <b>Taskiq</b>.
        Они берут на себя сериализацию, повторы, расписание (cron-задачи), мониторинг (Flower для Celery).</p>
        <p class="note">Проблема «двойной записи»: сохранили заказ в БД, а отправить событие в брокер не успели (упали). Решение — паттерн <b>Transactional Outbox</b>: событие пишется в таблицу <code>outbox</code> в той же транзакции, что и заказ, а отдельный процесс пересылает его в брокер.</p>`,
    },
  ],
  examples: [
    {
      title: 'Запуск RabbitMQ',
      lang: 'bash',
      code: String.raw`
docker run -d --name rabbit -p 5672:5672 -p 15672:15672 rabbitmq:4-management
# Веб-интерфейс: http://localhost:15672 (guest / guest) — очереди, сообщения, скорости`,
    },
    {
      title: 'Отправитель и воркер на pika',
      lang: 'python',
      code: String.raw`
# pip install pika
# ---------- producer.py ----------
import json
import pika

conn = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
ch = conn.channel()
ch.queue_declare(queue="emails", durable=True)

for i in range(5):
    msg = {"id": f"email-{i}", "to": "anna@mail.ru", "subject": f"Письмо {i}"}
    ch.basic_publish(
        exchange="", routing_key="emails", body=json.dumps(msg, ensure_ascii=False),
        properties=pika.BasicProperties(delivery_mode=pika.DeliveryMode.Persistent),
    )
conn.close()

# ---------- worker.py ----------
import json
import time
import pika

processed: set[str] = set()   # в реальности — таблица в БД или Redis

def on_message(ch, method, properties, body):
    msg = json.loads(body)
    if msg["id"] in processed:                  # идемпотентность: дубль пропускаем
        ch.basic_ack(method.delivery_tag)
        return
    print("Отправляю", msg["subject"])
    time.sleep(1)                               # «работа»
    processed.add(msg["id"])
    ch.basic_ack(method.delivery_tag)           # подтверждаем ПОСЛЕ обработки

conn = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
ch = conn.channel()
ch.queue_declare(queue="emails", durable=True)
ch.basic_qos(prefetch_count=1)                  # не больше одного сообщения в работе
ch.basic_consume(queue="emails", on_message_callback=on_message)
ch.start_consuming()`,
      explain: `<p>Запустите два воркера в разных терминалах — сообщения распределятся между ними. Остановите воркер посреди обработки (Ctrl+C) — неподтверждённое сообщение получит другой.</p>`,
    },
    {
      title: 'Фоновые задачи на Celery из FastAPI',
      lang: 'python',
      code: String.raw`
# pip install celery
# tasks.py
from celery import Celery

app = Celery("notes", broker="amqp://guest:guest@localhost:5672//")

@app.task(bind=True, max_retries=5, default_retry_delay=10, acks_late=True)
def send_welcome_email(self, user_id: int) -> None:
    try:
        ...  # обращение к почтовому сервису
    except ConnectionError as exc:
        raise self.retry(exc=exc)     # повтор через 10 с, до 5 раз

# api.py
@router.post("/auth/register", status_code=201)
def register(data: RegisterIn):
    user = users.create(data)
    send_welcome_email.delay(user.id)  # кладём в очередь и сразу отвечаем
    return user

# Запуск воркера: celery -A tasks worker --loglevel=info`,
    },
  ],
  tasks: [
    {
      title: 'Письма в фоне',
      level: 'средне',
      text: `<p>Добавьте в API заметок RabbitMQ (в docker compose) и воркер: при регистрации пользователя отправляется «приветственное письмо» (пока просто запись в лог или таблицу <code>sent_emails</code>).
        Убедитесь, что регистрация работает, когда воркер остановлен, а после запуска воркера письма «догоняют».</p>`,
    },
    {
      title: 'Fanout-событие',
      level: 'средне',
      text: `<p>Создайте exchange <code>notes.events</code> типа fanout и две очереди: <code>search-index</code> и <code>audit-log</code>. При создании заметки публикуйте событие <code>note.created</code>.
        Два разных воркера обрабатывают его независимо. Добавьте третью очередь без изменения кода API — в этом и есть слабая связанность.</p>`,
    },
    {
      title: 'Ядовитое сообщение',
      level: 'сложно',
      text: `<p>Отправьте сообщение, на котором воркер всегда падает (например, невалидный JSON). Что происходит при <code>basic_nack(requeue=True)</code>? Настройте dead letter exchange,
        чтобы после 3 неудачных попыток сообщение уходило в очередь <code>emails.dead</code>.</p>`,
      hint: `<p>Аргументы очереди: <code>x-dead-letter-exchange</code>; в RabbitMQ 4 для quorum-очередей — <code>x-delivery-limit</code>. Для классических очередей счётчик попыток можно вести в заголовке сообщения.</p>`,
    },
  ],
  quiz: [
    { q: 'Когда воркер должен подтверждать (ack) сообщение?', options: ['Сразу при получении', 'После успешной обработки', 'Никогда', 'Перед отправкой'], answer: 1 },
    { q: 'Какой тип exchange отправит копию сообщения во все привязанные очереди?', options: ['direct', 'fanout', 'topic', 'headers'], answer: 1 },
    { q: 'Почему обработчики сообщений должны быть идемпотентными?', options: ['Для скорости', 'Сообщение может быть доставлено повторно (at-least-once)', 'Так требует JSON', 'Чтобы не нужен был брокер'], answer: 1 },
    { q: 'Какую проблему решает Transactional Outbox?', options: ['Медленные запросы', 'Рассинхронизацию записи в БД и отправки события в брокер', 'Переполнение очереди', 'Шифрование сообщений'], answer: 1 },
  ],
  resources: [
    { title: 'RabbitMQ Tutorials (Python)', url: 'https://www.rabbitmq.com/tutorials' },
    { title: 'Celery: First steps', url: 'https://docs.celeryq.dev/en/stable/getting-started/first-steps-with-celery.html' },
    { title: 'microservices.io: Transactional Outbox', url: 'https://microservices.io/patterns/data/transactional-outbox.html' },
  ],
});

registerContent('kafka', {
  intro: `<p><b>Apache Kafka</b> — распределённый <b>журнал событий</b>. В отличие от очереди, где сообщение удаляется после обработки, Kafka хранит события на диске заданное время (дни, недели, бессрочно),
    и любое число независимых потребителей читает их, каждый со своей позиции. Kafka выдерживает миллионы событий в секунду и стала стандартом для потоков данных в крупных компаниях.</p>`,
  theory: [
    {
      title: 'Топики, партиции, смещения',
      html: `<ul>
          <li><b>Топик</b> — именованный поток событий (<code>orders</code>, <code>page-views</code>).</li>
          <li>Топик делится на <b>партиции</b> — упорядоченные журналы, распределённые по серверам кластера (брокерам). Партиции — единица параллелизма.</li>
          <li>Каждое событие в партиции имеет порядковый номер — <b>offset</b>. Порядок гарантирован <b>только внутри партиции</b>.</li>
          <li>Событие с <b>ключом</b> всегда попадает в одну партицию (хеш ключа) — все события одного заказа (<code>key=order_id</code>) будут упорядочены.</li>
          <li>Партиции реплицируются на несколько брокеров — отказ сервера не теряет данные.</li>
        </ul>`,
    },
    {
      title: 'Группы потребителей',
      html: `<p>Потребители объединяются в <b>consumer group</b>. Партиции топика распределяются между участниками группы: каждую партицию читает ровно один потребитель группы.
        Больше потребителей, чем партиций, — лишние простаивают. Поэтому число партиций задаёт максимальный параллелизм.</p>
        <p>Разные группы читают топик <b>независимо</b>: сервис аналитики и сервис уведомлений получают все события, каждый со своим offset.
        Группа хранит в Kafka свой последний обработанный offset (commit) и после перезапуска продолжает с него. Можно даже «перемотать» и перечитать историю.</p>`,
    },
    {
      title: 'Kafka или RabbitMQ?',
      html: `<table>
          <tr><th></th><th>RabbitMQ</th><th>Kafka</th></tr>
          <tr><td>Модель</td><td>Очередь: сообщение обработано — удалено</td><td>Журнал: события хранятся, читаются многими</td></tr>
          <tr><td>Маршрутизация</td><td>Гибкая (exchanges, ключи, шаблоны)</td><td>Простая: топик + партиция</td></tr>
          <tr><td>Пропускная способность</td><td>Десятки тысяч сообщений/с</td><td>Миллионы событий/с</td></tr>
          <tr><td>Перечитать историю</td><td>Нет</td><td>Да</td></tr>
          <tr><td>Порядок</td><td>В очереди (с одним потребителем)</td><td>В партиции</td></tr>
          <tr><td>Подходит для</td><td>Фоновых задач, команд, RPC</td><td>Событий между сервисами, стриминга, аналитики, CDC</td></tr>
        </table>
        <p>Экосистема Kafka: <b>Kafka Connect</b> (готовые коннекторы к БД и хранилищам), <b>Debezium</b> (CDC — поток изменений из PostgreSQL), Kafka Streams и Flink (обработка потоков), Schema Registry.
        Совместимые альтернативы: Redpanda, облачные сервисы. Redis Streams — облегчённая похожая модель.</p>`,
    },
    {
      title: 'Гарантии доставки',
      html: `<ul>
          <li><b>At-most-once</b>: commit offset до обработки — при падении событие потеряется.</li>
          <li><b>At-least-once</b> (обычный выбор): commit после обработки — при падении событие обработается повторно. Нужна идемпотентность.</li>
          <li><b>Exactly-once</b>: идемпотентный producer + транзакции Kafka — внутри Kafka; с внешними системами всё равно нужна идемпотентность обработчика.</li>
        </ul>
        <p>Для продюсера: <code>acks=all</code> — событие подтверждено, только когда записано на все синхронные реплики.</p>`,
    },
  ],
  examples: [
    {
      title: 'Kafka локально (без ZooKeeper, режим KRaft)',
      lang: 'bash',
      code: String.raw`
docker run -d --name kafka -p 9092:9092 apache/kafka:3.9.0

docker exec -it kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 \
  --create --topic orders --partitions 3 --replication-factor 1

docker exec -it kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --describe --group notifications     # offset и отставание (lag) группы по партициям`,
    },
    {
      title: 'Producer и consumer',
      lang: 'python',
      code: String.raw`
# pip install confluent-kafka
import json
from confluent_kafka import Consumer, Producer

# ---------- producer ----------
producer = Producer({"bootstrap.servers": "localhost:9092", "acks": "all", "enable.idempotence": True})

for order_id, status in [(101, "created"), (102, "created"), (101, "paid"), (101, "shipped")]:
    event = {"order_id": order_id, "status": status}
    producer.produce("orders", key=str(order_id), value=json.dumps(event))   # один заказ — одна партиция
producer.flush()

# ---------- consumer ----------
consumer = Consumer({
    "bootstrap.servers": "localhost:9092",
    "group.id": "notifications",
    "auto.offset.reset": "earliest",     # новая группа читает с начала
    "enable.auto.commit": False,         # коммитим сами — после обработки
})
consumer.subscribe(["orders"])
try:
    while True:
        msg = consumer.poll(1.0)
        if msg is None or msg.error():
            continue
        event = json.loads(msg.value())
        print(f"партиция {msg.partition()} offset {msg.offset()}: {event}")
        consumer.commit(msg)             # at-least-once
finally:
    consumer.close()`,
      explain: `<p>Запустите два consumer с одним <code>group.id</code> — партиции поделятся между ними. Запустите consumer с другим <code>group.id</code> — он получит все события заново, независимо от первой группы.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Порядок событий',
      level: 'средне',
      text: `<p>Отправьте 30 событий для 5 заказов в топик с 3 партициями: сначала без ключа, затем с <code>key=order_id</code>. В каком случае события одного заказа приходят строго в порядке created → paid → shipped? Почему?</p>`,
      solution: `<p>Без ключа события раскладываются по партициям без привязки к заказу, а порядок между партициями не гарантирован. С ключом все события заказа попадают в одну партицию, где порядок строгий.</p>`,
    },
    {
      title: 'Две группы потребителей',
      level: 'средне',
      text: `<p>Публикуйте из API заметок события <code>note.created</code>, <code>note.updated</code>, <code>note.deleted</code> в топик <code>notes</code>. Сделайте две группы: <code>search</code> (поддерживает поисковый индекс в Redis)
        и <code>stats</code> (считает заметки по пользователям). Остановите <code>stats</code>, создайте 10 заметок, запустите снова — догонит ли он? Сбросьте offset группы на начало и пересчитайте статистику с нуля.</p>`,
      hint: `<p>Сброс offset: <code>kafka-consumer-groups.sh --group stats --reset-offsets --to-earliest --topic notes --execute</code> (группа должна быть остановлена).</p>`,
    },
  ],
  quiz: [
    { q: 'Чем Kafka принципиально отличается от очереди RabbitMQ?', options: ['Kafka быстрее только', 'Kafka хранит события как журнал, их могут читать многие группы, в том числе повторно', 'Kafka не хранит данные', 'Kafka работает только с JSON'], answer: 1 },
    { q: 'Где Kafka гарантирует порядок событий?', options: ['Во всём топике', 'Внутри одной партиции', 'Во всём кластере', 'Нигде'], answer: 1 },
    { q: 'В группе 3 потребителя, в топике 2 партиции. Сколько потребителей будут получать сообщения?', options: ['3', '2', '1', '6'], answer: 1 },
    { q: 'Как получить at-least-once при чтении?', options: ['Коммитить offset до обработки', 'Коммитить offset после успешной обработки', 'Не коммитить вообще', 'Удалять сообщения'], answer: 1 },
  ],
  resources: [
    { title: 'Apache Kafka: Quickstart', url: 'https://kafka.apache.org/quickstart' },
    { title: 'Confluent: Kafka для Python', url: 'https://developer.confluent.io/get-started/python/' },
  ],
});
