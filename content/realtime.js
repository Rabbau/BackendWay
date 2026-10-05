// Раздел: Данные в реальном времени

registerContent('polling', {
  intro: `<p>HTTP устроен как «запрос — ответ»: говорит всегда клиент. Но чату нужно показать новое сообщение, а трекеру заказа — смену статуса, <b>как только они произошли</b>.
    Самый простой способ — <b>опрос</b> (polling): клиент сам регулярно спрашивает сервер «есть что-то новое?».</p>`,
  theory: [
    {
      title: 'Short polling',
      html: `<p>Клиент отправляет запрос каждые N секунд: <code>GET /messages?after_id=105</code>. Сервер сразу отвечает — новыми данными или пустым списком.</p>
        <ul>
          <li>+ предельно просто, работает везде, без особой инфраструктуры;</li>
          <li>− задержка до N секунд; большинство запросов пустые — лишняя нагрузка: 10 000 клиентов с интервалом 2 с — это 5 000 запросов в секунду «впустую».</li>
        </ul>
        <p>Вполне годится для редких обновлений: статус фоновой задачи, проверка новых уведомлений раз в минуту.</p>`,
    },
    {
      title: 'Long polling',
      html: `<p>Клиент отправляет запрос, а сервер <b>не отвечает сразу</b>, а держит соединение открытым, пока не появятся новые данные (или не истечёт таймаут, например 30 с).
        Получив ответ, клиент сразу отправляет следующий запрос.</p>
        <ul>
          <li>+ данные приходят почти мгновенно, пустых ответов мало, работает через любые прокси;</li>
          <li>− сервер держит много открытых соединений — нужен асинхронный сервер (FastAPI с <code>async</code> подходит, синхронный поток на запрос — нет);</li>
          <li>− сложнее: таймауты, повторное подключение, не потерять события между запросами (клиент передаёт id последнего полученного).</li>
        </ul>
        <p>Long polling долго был основой веб-чатов (ранний Facebook Messenger, Gmail). Сегодня его вытеснили WebSocket и SSE, но он остаётся запасным вариантом.</p>`,
    },
  ],
  examples: [
    {
      title: 'Long polling на FastAPI',
      lang: 'python',
      code: String.raw`
import asyncio
from fastapi import FastAPI

app = FastAPI()
messages: list[dict] = []
new_message = asyncio.Condition()

@app.post("/messages")
async def post_message(text: str):
    async with new_message:
        messages.append({"id": len(messages) + 1, "text": text})
        new_message.notify_all()              # будим всех ждущих
    return messages[-1]

@app.get("/messages")
async def get_messages(after_id: int = 0, timeout: float = 25):
    def fresh() -> list[dict]:
        return [m for m in messages if m["id"] > after_id]

    async with new_message:
        try:
            await asyncio.wait_for(new_message.wait_for(fresh), timeout)   # ждём, пока fresh() не станет непустым
        except asyncio.TimeoutError:
            pass                              # ничего нового — вернём [], клиент переподключится
    return fresh()`,
      explain: `<p>Работает только в одном процессе: при нескольких копиях приложения нужен общий канал событий — например, Redis Pub/Sub.</p>`,
    },
    {
      title: 'Клиент long polling',
      lang: 'javascript',
      code: String.raw`
let lastId = 0;

async function poll() {
  while (true) {
    try {
      const res = await fetch("/messages?after_id=" + lastId);
      const items = await res.json();
      for (const m of items) {
        console.log("Новое:", m.text);
        lastId = m.id;
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 3000));   // сеть упала — подождать и повторить
    }
  }
}
poll();`,
    },
  ],
  tasks: [
    {
      title: 'Статус фоновой задачи',
      level: 'легко',
      text: `<p>Сделайте эндпоинт <code>POST /exports</code>, который запускает «долгий экспорт» (asyncio-задача на 10 секунд) и возвращает id, и <code>GET /exports/{id}</code> со статусом. Напишите HTML-страницу, которая опрашивает статус каждые 2 секунды и показывает прогресс.</p>`,
    },
    {
      title: 'Посчитайте нагрузку',
      level: 'легко',
      text: `<p>Сколько запросов в секунду получит сервер от 20 000 пользователей при short polling раз в 3 секунды? А при long polling с таймаутом 30 секунд, если новые события приходят в среднем раз в минуту?</p>`,
      solution: `<p>Short polling: 20 000 / 3 ≈ 6 700 запросов/с. Long polling: каждый клиент делает запрос примерно раз в 30 с (по таймауту) — ≈ 670 запросов/с, но одновременно открыто ~20 000 соединений.</p>`,
    },
  ],
  quiz: [
    { q: 'Чем long polling отличается от short polling?', options: ['Использует WebSocket', 'Сервер держит запрос открытым, пока не появятся данные', 'Работает только по HTTPS', 'Опрашивает реже'], answer: 1 },
    { q: 'Главный недостаток short polling:', options: ['Сложная реализация', 'Задержка и много пустых запросов', 'Не работает в браузерах', 'Требует Kafka'], answer: 1 },
  ],
  resources: [
    { title: 'javascript.info: длинные опросы', url: 'https://learn.javascript.ru/long-polling' },
  ],
});

registerContent('websockets', {
  intro: `<p><b>WebSocket</b> — протокол постоянного <b>двустороннего</b> соединения между браузером и сервером. После установки обе стороны могут отправлять сообщения в любой момент,
    без накладных расходов HTTP-заголовков. Основа чатов, онлайн-игр, совместного редактирования, бирж и торговых терминалов.</p>`,
  theory: [
    {
      title: 'Как устанавливается соединение',
      html: `<ol>
          <li>Клиент отправляет обычный HTTP-запрос с заголовками <code>Upgrade: websocket</code> и <code>Connection: Upgrade</code>.</li>
          <li>Сервер отвечает <code>101 Switching Protocols</code>.</li>
          <li>То же TCP-соединение превращается в WebSocket: дальше идут лёгкие фреймы (текст или бинарные данные) в обе стороны.</li>
        </ol>
        <p>Адреса: <code>ws://</code> и защищённый <code>wss://</code> (поверх TLS — используйте всегда). Прокси (Nginx) нужно настроить на проброс заголовков Upgrade.</p>`,
    },
    {
      title: 'Сложности в продакшене',
      html: `<ul>
          <li><b>Состояние соединений</b>: каждое соединение живёт на конкретной копии сервера. Чтобы сообщение от пользователя на сервере A дошло до пользователя на сервере B, нужен общий канал — <b>Redis Pub/Sub</b>, брокер.</li>
          <li><b>Переподключение</b>: мобильная сеть рвётся — клиент должен переподключаться с экспоненциальной задержкой и дозапрашивать пропущенное.</li>
          <li><b>Heartbeat</b> (ping/pong) — обнаружение «мёртвых» соединений, которые не закрылись корректно.</li>
          <li><b>Аутентификация</b>: браузерный WebSocket не позволяет задать заголовок Authorization — используют cookie, токен в первом сообщении или короткоживущий одноразовый тикет в URL.</li>
          <li>Проверяйте заголовок <code>Origin</code> — на WebSocket не распространяется CORS (атака Cross-Site WebSocket Hijacking).</li>
          <li><b>Протокол сообщений</b>: договоритесь о формате, например <code>{"type": "message", "data": {...}}</code>.</li>
        </ul>
        <p>Готовые решения поверх WebSocket: Socket.IO (комнаты, переподключение, fallback), Centrifugo, облачные Pusher, Ably.</p>`,
    },
  ],
  examples: [
    {
      title: 'Чат на FastAPI',
      lang: 'python',
      code: String.raw`
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active: dict[str, set[WebSocket]] = {}      # комната → соединения

    async def connect(self, room: str, ws: WebSocket):
        await ws.accept()
        self.active.setdefault(room, set()).add(ws)

    def disconnect(self, room: str, ws: WebSocket):
        self.active.get(room, set()).discard(ws)

    async def broadcast(self, room: str, message: dict):
        for ws in list(self.active.get(room, ())):
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(room, ws)

manager = ConnectionManager()

@app.websocket("/ws/rooms/{room}")
async def chat(ws: WebSocket, room: str, name: str = "гость"):
    await manager.connect(room, ws)
    await manager.broadcast(room, {"type": "join", "name": name})
    try:
        while True:
            data = await ws.receive_json()
            await manager.broadcast(room, {"type": "message", "name": name, "text": data["text"]})
    except WebSocketDisconnect:
        manager.disconnect(room, ws)
        await manager.broadcast(room, {"type": "leave", "name": name})`,
    },
    {
      title: 'Клиент в браузере с переподключением',
      lang: 'javascript',
      code: String.raw`
let delay = 1000;

function connect() {
  const proto = location.protocol === "https:" ? "wss://" : "ws://";
  const ws = new WebSocket(proto + location.host + "/ws/rooms/general?name=Анна");

  ws.onopen = () => { delay = 1000; ws.send(JSON.stringify({ text: "Всем привет!" })); };
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log(msg.type, msg.name, msg.text || "");
  };
  ws.onclose = () => {
    setTimeout(connect, delay);                // переподключение
    delay = Math.min(delay * 2, 30000);        // с экспоненциальной задержкой
  };
}
connect();`,
    },
    {
      title: 'Nginx для WebSocket',
      lang: 'nginx',
      code: String.raw`
location /ws/ {
    proxy_pass http://notes_api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 1h;            # иначе Nginx закроет «тихое» соединение через 60 с
}`,
    },
  ],
  tasks: [
    {
      title: 'Чат с историей',
      level: 'средне',
      text: `<p>Расширьте пример: при подключении пользователь получает последние 50 сообщений комнаты (храните в PostgreSQL или Redis List), имя берётся из JWT (передайте токен первым сообщением и закройте соединение с кодом 4401, если он неверен).
        Сделайте простую HTML-страницу чата.</p>`,
    },
    {
      title: 'Чат на двух копиях сервера',
      level: 'сложно',
      text: `<p>Запустите две копии чата за Nginx. Убедитесь, что пользователи, попавшие на разные копии, не видят сообщений друг друга. Исправьте с помощью Redis Pub/Sub: каждая копия публикует сообщения в канал комнаты и пересылает своим клиентам всё, что приходит из канала.</p>`,
      hint: `<p>В <code>redis.asyncio</code>: <code>pubsub = r.pubsub(); await pubsub.subscribe("room:general")</code> и фоновая задача <code>async for msg in pubsub.listen()</code>, запущенная при старте приложения.</p>`,
    },
  ],
  quiz: [
    { q: 'Каким ответом сервер подтверждает переход на WebSocket?', options: ['200 OK', '101 Switching Protocols', '204 No Content', '302 Found'], answer: 1 },
    { q: 'Как доставить сообщение пользователям, подключённым к разным копиям сервера?', options: ['Никак', 'Через общий канал, например Redis Pub/Sub', 'Через cookie', 'Через CORS'], answer: 1 },
    { q: 'Распространяется ли CORS на WebSocket?', options: ['Да, полностью', 'Нет — сервер должен сам проверять Origin', 'Только для wss', 'Только в Chrome'], answer: 1 },
  ],
  resources: [
    { title: 'MDN: WebSocket API', url: 'https://developer.mozilla.org/ru/docs/Web/API/WebSockets_API' },
    { title: 'FastAPI: WebSockets', url: 'https://fastapi.tiangolo.com/ru/advanced/websockets/' },
  ],
});

registerContent('sse', {
  intro: `<p><b>Server-Sent Events</b> (SSE) — простой стандарт, по которому сервер держит обычный HTTP-ответ открытым и отправляет в него события по мере появления. Поток — <b>только от сервера к клиенту</b>.
    Именно так AI-чаты показывают ответ по словам, а дашборды — обновления в реальном времени.</p>`,
  theory: [
    {
      title: 'Формат и возможности',
      html: `<p>Ответ с <code>Content-Type: text/event-stream</code>, события — текстовые блоки, разделённые пустой строкой:</p>
        <pre><code>id: 42
event: order-status
data: {"order_id": 7, "status": "shipped"}

</code></pre>
        <ul>
          <li>В браузере — встроенный <code>EventSource</code> с <b>автоматическим переподключением</b>. При переподключении браузер отправляет заголовок <code>Last-Event-ID</code> — сервер может дослать пропущенное.</li>
          <li>Обычный HTTP: работает через прокси, с cookie-аутентификацией, с HTTP/2 (много потоков в одном соединении).</li>
          <li>Только текст и только сервер → клиент. Клиент отправляет данные обычными POST-запросами.</li>
        </ul>`,
    },
    {
      title: 'SSE или WebSocket?',
      html: `<table>
          <tr><th></th><th>SSE</th><th>WebSocket</th></tr>
          <tr><td>Направление</td><td>Сервер → клиент</td><td>В обе стороны</td></tr>
          <tr><td>Протокол</td><td>Обычный HTTP</td><td>Отдельный протокол после Upgrade</td></tr>
          <tr><td>Переподключение</td><td>Встроено</td><td>Пишете сами</td></tr>
          <tr><td>Данные</td><td>Текст</td><td>Текст и бинарные</td></tr>
          <tr><td>Подходит для</td><td>Уведомления, ленты, статусы, стриминг ответа LLM</td><td>Чаты, игры, совместное редактирование</td></tr>
        </table>
        <p>Если клиенту нужно только получать обновления — начинайте с SSE: проще и надёжнее.</p>
        <p class="note">Через Nginx отключите буферизацию для потока (<code>proxy_buffering off;</code> или заголовок ответа <code>X-Accel-Buffering: no</code>), иначе события будут приходить пачками.</p>`,
    },
  ],
  examples: [
    {
      title: 'SSE на FastAPI',
      lang: 'python',
      code: String.raw`
import asyncio
import json
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse

app = FastAPI()

async def order_events(request: Request, order_id: int):
    statuses = ["created", "paid", "packed", "shipped", "delivered"]
    for i, status in enumerate(statuses, start=1):
        if await request.is_disconnected():      # клиент ушёл — прекращаем
            break
        payload = json.dumps({"order_id": order_id, "status": status})
        yield f"id: {i}\nevent: status\ndata: {payload}\n\n"
        await asyncio.sleep(2)

@app.get("/orders/{order_id}/events")
async def stream(order_id: int, request: Request):
    return StreamingResponse(
        order_events(request, order_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )`,
    },
    {
      title: 'Клиент',
      lang: 'javascript',
      code: String.raw`
const source = new EventSource("/orders/7/events");

source.addEventListener("status", (e) => {
  const data = JSON.parse(e.data);
  document.querySelector("#status").textContent = data.status;
  if (data.status === "delivered") source.close();
});

source.onerror = () => console.log("Соединение потеряно, браузер переподключится сам");`,
    },
    {
      title: 'Проверка через curl',
      lang: 'bash',
      code: String.raw`
curl -N http://127.0.0.1:8000/orders/7/events
# id: 1
# event: status
# data: {"order_id": 7, "status": "created"}
# ...`,
    },
  ],
  tasks: [
    {
      title: 'Живые уведомления',
      level: 'средне',
      text: `<p>Добавьте в API заметок эндпоинт <code>GET /events</code> (SSE): авторизованный пользователь получает событие, когда кто-то делится с ним заметкой. События публикуйте через Redis Pub/Sub, чтобы схема работала при нескольких копиях сервера.
        Поддержите <code>Last-Event-ID</code>, храня последние события пользователя в Redis Stream.</p>`,
    },
    {
      title: 'Стриминг «как у ChatGPT»',
      level: 'легко',
      text: `<p>Сделайте эндпоинт, который отдаёт заранее заданный длинный текст по одному слову каждые 100 мс через SSE, и страницу, которая дописывает слова по мере прихода. В разделе «AI в бэкенде» на месте этого текста будет настоящий ответ языковой модели.</p>`,
    },
  ],
  quiz: [
    { q: 'В каком направлении передаются данные в SSE?', options: ['Клиент → сервер', 'Сервер → клиент', 'В обе стороны', 'Между серверами'], answer: 1 },
    { q: 'Какой Content-Type у потока SSE?', options: ['application/json', 'text/event-stream', 'text/html', 'application/octet-stream'], answer: 1 },
    { q: 'Что делает браузерный EventSource при разрыве соединения?', options: ['Ничего', 'Автоматически переподключается и шлёт Last-Event-ID', 'Перезагружает страницу', 'Переходит на WebSocket'], answer: 1 },
  ],
  resources: [
    { title: 'MDN: Server-Sent Events', url: 'https://developer.mozilla.org/ru/docs/Web/API/Server-sent_events/Using_server-sent_events' },
    { title: 'javascript.info: EventSource', url: 'https://learn.javascript.ru/server-sent-events' },
  ],
});
