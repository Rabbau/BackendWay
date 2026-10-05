// Раздел 3. Язык: Python

registerContent('py-start', {
  intro: `<p>Python — язык, на котором написаны Instagram, Dropbox, большая часть Spotify и почти весь современный AI.
    Он читается почти как английский текст, а для бэкенда у него есть зрелые фреймворки: Django, FastAPI, Flask.
    В этой теме вы установите Python и запустите первую программу.</p>`,
  theory: [
    {
      title: 'Установка',
      html: `<ul>
          <li><b>Windows</b>: скачайте установщик с <a href="https://www.python.org/downloads/" target="_blank" rel="noopener">python.org</a>.
            Обязательно отметьте галочку <b>«Add python.exe to PATH»</b>. Альтернатива — <code>winget install Python.Python.3.13</code>.</li>
          <li><b>macOS</b>: <code>brew install python</code> или установщик с python.org.</li>
          <li><b>Linux</b>: обычно уже установлен; проверьте <code>python3 --version</code>.</li>
        </ul>
        <p>Нужна версия <b>3.10 или новее</b>. Проверка: <code>python --version</code> (в Linux/macOS — <code>python3 --version</code>).</p>`,
    },
    {
      title: 'REPL — интерактивный режим',
      html: `<p>Команда <code>python</code> без аргументов запускает <b>REPL</b> (Read-Eval-Print Loop): вы вводите строку — Python сразу выполняет её и печатает результат.
        Это лучший способ быстро что-то проверить.</p>
        <p>Выход — <code>exit()</code> или Ctrl+Z, Enter (Windows) / Ctrl+D (Linux, macOS). Полезно: <code>help(str)</code> — справка, <code>dir(obj)</code> — список методов объекта.</p>`,
    },
    {
      title: 'Скрипты и редактор',
      html: `<p>Программы хранят в файлах с расширением <code>.py</code> и запускают командой <code>python имя_файла.py</code>.</p>
        <p>Рекомендуемый редактор — <b>VS Code</b> с расширением <b>Python</b> от Microsoft: подсветка, автодополнение, отладчик, запуск по F5.
        Альтернатива — PyCharm Community.</p>
        <p>Особенность Python — <b>отступы являются частью синтаксиса</b>. Блоки кода (тело функции, условия, цикла) выделяются отступом в 4 пробела, а не фигурными скобками.</p>`,
    },
    {
      title: 'Вывод, ввод и комментарии',
      html: `<ul>
          <li><code>print(...)</code> — вывести значения на экран;</li>
          <li><code>input("Вопрос: ")</code> — прочитать строку от пользователя (всегда возвращает <b>строку</b>);</li>
          <li><code># ...</code> — комментарий до конца строки, Python его игнорирует.</li>
        </ul>
        <p class="note">Стиль кода в Python описан в <b>PEP 8</b>: 4 пробела, <code>snake_case</code> для переменных и функций, строки не длиннее ~88–100 символов.
        Автоформатировщики <code>black</code> или <code>ruff format</code> делают это за вас.</p>`,
    },
  ],
  examples: [
    {
      title: 'Проверка установки',
      lang: 'bash',
      code: String.raw`
python --version
# Python 3.13.0

python
>>> 2 + 2
4
>>> "бэкенд".upper()
'БЭКЕНД'
>>> exit()`,
    },
    {
      title: 'Первый скрипт hello.py',
      lang: 'python',
      code: String.raw`
# Программа спрашивает имя и здоровается
name = input("Как вас зовут? ")
print("Привет,", name)
print(f"В вашем имени {len(name)} букв")`,
      explain: `<p>Сохраните в файл <code>hello.py</code> и запустите: <code>python hello.py</code>. <code>f"..."</code> — f-строка, внутри фигурных скобок можно писать выражения.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Настройте окружение',
      level: 'легко',
      text: `<p>Установите Python 3.10+ и VS Code с расширением Python. Создайте папку <code>backend-course</code> — в ней будут все ваши решения.
        Запустите <code>hello.py</code> из терминала и через кнопку ▶ в VS Code.</p>`,
    },
    {
      title: 'Калькулятор возраста',
      level: 'легко',
      text: `<p>Напишите скрипт, который спрашивает год рождения и печатает, сколько человеку лет в этом году и сколько будет через 10 лет.</p>`,
      hint: `<p><code>input()</code> возвращает строку — преобразуйте её в число через <code>int()</code>. Текущий год: <code>from datetime import date; date.today().year</code>.</p>`,
      solutionCode: String.raw`
from datetime import date

year = int(input("Год рождения: "))
age = date.today().year - year
print(f"Вам {age} лет, через 10 лет будет {age + 10}")`,
    },
    {
      title: 'Исследуйте REPL',
      level: 'легко',
      text: `<p>В REPL выполните <code>dir("")</code> и найдите пять методов строк, которые вам незнакомы. Для каждого вызовите <code>help(str.имя)</code>
        и попробуйте применить к строке <code>"  Привет, Мир  "</code>.</p>`,
    },
  ],
  quiz: [
    { q: 'Как в Python выделяется тело цикла или функции?', options: ['Фигурными скобками', 'Отступом', 'Ключевыми словами begin/end', 'Точкой с запятой'], answer: 1 },
    { q: 'Что вернёт <code>input()</code>, если пользователь ввёл 42?', options: ['Число 42', 'Строку "42"', 'None', 'Ошибку'], answer: 1, explain: 'input() всегда возвращает строку; для числа нужно int(...).' },
    { q: 'Какая галочка критична при установке Python на Windows?', options: ['Install for all users', 'Add python.exe to PATH', 'Install pip', 'Disable path length limit'], answer: 1, explain: 'Без PATH команда python не будет находиться из терминала.' },
  ],
  resources: [
    { title: 'Официальный учебник Python (рус. перевод)', url: 'https://docs.python.org/3/tutorial/' },
    { title: 'PEP 8 — стиль кода', url: 'https://peps.python.org/pep-0008/' },
  ],
});

registerContent('py-types', {
  intro: `<p>Любая программа работает с данными: числами, текстом, флагами «да/нет». В этой теме — базовые типы Python, переменные и
    преобразования между ними. На этом строится всё остальное.</p>`,
  theory: [
    {
      title: 'Переменные',
      html: `<p>Переменная — имя, которое ссылается на значение. Тип объявлять не нужно — он определяется значением (<b>динамическая типизация</b>):</p>
        <p><code>count = 10</code>, затем <code>count = "десять"</code> — допустимо, хотя так делать не стоит.</p>
        <p>Имена: латиница, цифры, <code>_</code>, не с цифры; регистр важен. Принято <code>snake_case</code>: <code>user_name</code>, <code>max_retries</code>.
        Константы пишут заглавными: <code>MAX_SIZE = 100</code>.</p>`,
    },
    {
      title: 'Числа',
      html: `<ul>
          <li><code>int</code> — целые, без ограничения размера: <code>2 ** 100</code> работает.</li>
          <li><code>float</code> — дробные: <code>3.14</code>. Внимание: <code>0.1 + 0.2 == 0.30000000000000004</code>. Для денег используйте <code>Decimal</code> или храните копейки в <code>int</code>.</li>
        </ul>
        <p>Операторы: <code>+ - * /</code> (деление всегда даёт float), <code>//</code> — целочисленное деление, <code>%</code> — остаток, <code>**</code> — степень.</p>`,
    },
    {
      title: 'Строки',
      html: `<p><code>str</code> — текст в кавычках <code>'...'</code> или <code>"..."</code>, многострочный — в <code>"""..."""</code>. Строки <b>неизменяемы</b>:
        методы возвращают новую строку.</p>
        <ul>
          <li>Индексы и срезы: <code>s[0]</code>, <code>s[-1]</code> (последний), <code>s[1:4]</code>, <code>s[::-1]</code> (наоборот).</li>
          <li>Методы: <code>.lower()</code>, <code>.upper()</code>, <code>.strip()</code>, <code>.split(",")</code>, <code>",".join(lst)</code>, <code>.replace(a, b)</code>, <code>.startswith()</code>, <code>.find()</code>.</li>
          <li><b>f-строки</b>: <code>f"Итого: {price * qty:.2f} руб."</code> — самый удобный способ форматирования.</li>
          <li><code>len(s)</code> — длина, <code>"a" in s</code> — проверка вхождения.</li>
        </ul>`,
    },
    {
      title: 'bool и None',
      html: `<p><code>bool</code> — <code>True</code> или <code>False</code>. Получается из сравнений (<code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&gt;=</code>) и логических операторов <code>and</code>, <code>or</code>, <code>not</code>.</p>
        <p><b>Ложными</b> считаются: <code>False</code>, <code>0</code>, <code>0.0</code>, <code>""</code>, <code>[]</code>, <code>{}</code>, <code>None</code>. Всё остальное — истинно.
        Поэтому можно писать <code>if name:</code> вместо <code>if name != "":</code>.</p>
        <p><code>None</code> — «значения нет». Проверяют его через <code>is</code>: <code>if result is None:</code>.</p>`,
    },
    {
      title: 'Преобразование типов и аннотации',
      html: `<p><code>int("42")</code>, <code>float("3.5")</code>, <code>str(10)</code>, <code>bool(0)</code>. Если строку нельзя превратить в число — будет ошибка <code>ValueError</code>.
        Узнать тип: <code>type(x)</code>, проверить: <code>isinstance(x, int)</code>.</p>
        <p><b>Аннотации типов</b> не влияют на выполнение, но помогают редактору и инструментам (mypy) находить ошибки, а FastAPI по ним валидирует запросы:</p>
        <p><code>age: int = 30</code>, <code>name: str | None = None</code>.</p>`,
    },
  ],
  examples: [
    {
      title: 'Основные операции',
      lang: 'python',
      code: String.raw`
price = 199.9
qty = 3
total = price * qty
print(f"Сумма: {total:.2f}")        # Сумма: 599.70

print(17 // 5, 17 % 5)              # 3 2
print(2 ** 10)                      # 1024

email = "  Anna@Mail.RU "
clean = email.strip().lower()
print(clean)                        # anna@mail.ru
user, domain = clean.split("@")
print(user, domain)                 # anna mail.ru

print("mail" in domain)             # True
print(clean[:4], clean[-2:])        # anna ru`,
    },
    {
      title: 'Ловушки float и как с ними жить',
      lang: 'python',
      code: String.raw`
from decimal import Decimal

print(0.1 + 0.2)                         # 0.30000000000000004
print(Decimal("0.1") + Decimal("0.2"))   # 0.3

# В бэкенде деньги часто хранят в копейках целым числом
price_kop = 19990
print(f"{price_kop // 100}.{price_kop % 100:02d} руб.")  # 199.90 руб.`,
    },
  ],
  tasks: [
    {
      title: 'Нормализация логина',
      level: 'легко',
      text: `<p>Пользователь вводит логин. Уберите пробелы по краям, приведите к нижнему регистру, замените пробелы внутри на <code>_</code>.
        Если получилась пустая строка — выведите «Логин не может быть пустым».</p>`,
      solutionCode: String.raw`
raw = input("Логин: ")
login = raw.strip().lower().replace(" ", "_")
if not login:
    print("Логин не может быть пустым")
else:
    print("Ваш логин:", login)`,
    },
    {
      title: 'Секунды в часы',
      level: 'легко',
      text: `<p>Дано целое число секунд (например, 98765). Выведите его в формате <code>ЧЧ:ММ:СС</code> — <code>27:26:05</code>.</p>`,
      hint: `<p>Используйте <code>//</code> и <code>%</code>, а для двух цифр — формат <code>{x:02d}</code>.</p>`,
      solutionCode: String.raw`
total = 98765
hours = total // 3600
minutes = total % 3600 // 60
seconds = total % 60
print(f"{hours:02d}:{minutes:02d}:{seconds:02d}")   # 27:26:05`,
    },
    {
      title: 'Маскировка карты',
      level: 'средне',
      text: `<p>Напишите код, который превращает номер карты <code>"4276 1234 5678 9012"</code> в <code>"**** **** **** 9012"</code>.
        Номер может приходить с пробелами или без.</p>`,
      solutionCode: String.raw`
card = "4276 1234 5678 9012"
digits = card.replace(" ", "")
masked = "*" * (len(digits) - 4) + digits[-4:]
groups = [masked[i:i + 4] for i in range(0, len(masked), 4)]
print(" ".join(groups))   # **** **** **** 9012`,
    },
  ],
  quiz: [
    { q: 'Что выведет <code>print(7 / 2)</code>?', options: ['3', '3.5', '4', '3.0'], answer: 1, explain: 'Оператор / всегда возвращает float. Целочисленное деление — //.' },
    { q: 'Какое значение считается ложным в условии?', options: ['"0"', '[0]', '""', '" "'], answer: 2, explain: 'Пустая строка ложна. "0" и " " — непустые строки, [0] — непустой список.' },
    { q: 'Как правильно проверить, что переменная равна None?', options: ['x == "None"', 'x is None', 'x = None', 'type(x) == None'], answer: 1 },
    { q: 'Что вернёт <code>"backend"[1:4]</code>?', options: ['"bac"', '"ack"', '"acke"', '"back"'], answer: 1, explain: 'Срез берёт символы с индексами 1, 2, 3 — правая граница не включается.' },
  ],
  resources: [
    { title: 'Документация: встроенные типы', url: 'https://docs.python.org/3/library/stdtypes.html' },
    { title: 'Real Python: f-строки', url: 'https://realpython.com/python-f-strings/' },
  ],
});

registerContent('py-control', {
  intro: `<p>Программы принимают решения и повторяют действия. Условия и циклы — то, что превращает список команд в логику:
    проверить права пользователя, обойти все заказы, повторить запрос при ошибке.</p>`,
  theory: [
    {
      title: 'if / elif / else',
      html: `<p>Выполняет блок кода, только если условие истинно. Ветки проверяются по порядку, срабатывает первая подходящая.</p>
        <p>Короткая форма — <b>тернарный оператор</b>: <code>status = "взрослый" if age >= 18 else "ребёнок"</code>.</p>
        <p>Сравнения можно сцеплять: <code>if 18 &lt;= age &lt; 65:</code>.</p>`,
    },
    {
      title: 'match — сопоставление с образцом',
      html: `<p>С Python 3.10 есть <code>match</code> — удобен, когда нужно выбрать действие по значению или форме данных (например, по методу HTTP-запроса):</p>
        <p><code>case "GET":</code>, <code>case "POST" | "PUT":</code>, <code>case _:</code> — вариант по умолчанию.</p>`,
    },
    {
      title: 'Цикл for',
      html: `<p><code>for</code> перебирает элементы любой коллекции: списка, строки, словаря, файла.</p>
        <ul>
          <li><code>range(5)</code> → 0, 1, 2, 3, 4; <code>range(1, 10, 2)</code> → 1, 3, 5, 7, 9.</li>
          <li><code>enumerate(items)</code> — получить и индекс, и значение.</li>
          <li><code>zip(a, b)</code> — идти по двум спискам параллельно.</li>
        </ul>`,
    },
    {
      title: 'Цикл while, break и continue',
      html: `<p><code>while условие:</code> повторяет блок, пока условие истинно. Используется, когда число повторений заранее неизвестно — например, повторять запрос, пока не получится.</p>
        <ul>
          <li><code>break</code> — немедленно выйти из цикла;</li>
          <li><code>continue</code> — перейти к следующей итерации;</li>
          <li><code>else</code> у цикла выполняется, если цикл завершился <b>без</b> <code>break</code> — удобно для поиска.</li>
        </ul>
        <p class="note">Следите, чтобы условие <code>while</code> когда-нибудь стало ложным, иначе получится бесконечный цикл (остановить — Ctrl+C).</p>`,
    },
  ],
  examples: [
    {
      title: 'Маршрутизация по методу и коду',
      lang: 'python',
      code: String.raw`
def describe(status: int) -> str:
    if 200 <= status < 300:
        return "успех"
    elif 400 <= status < 500:
        return "ошибка клиента"
    elif status >= 500:
        return "ошибка сервера"
    else:
        return "другое"

def handle(method: str) -> str:
    match method:
        case "GET":
            return "читаем"
        case "POST" | "PUT" | "PATCH":
            return "изменяем"
        case "DELETE":
            return "удаляем"
        case _:
            return "405 Method Not Allowed"

print(describe(404), handle("PATCH"))   # ошибка клиента изменяем`,
    },
    {
      title: 'Повтор запроса с экспоненциальной задержкой',
      lang: 'python',
      code: String.raw`
import random
import time

def unreliable_request() -> bool:
    return random.random() > 0.7      # успех в 30% случаев

attempt = 0
delay = 0.1
while attempt < 5:
    attempt += 1
    if unreliable_request():
        print(f"Успех с попытки {attempt}")
        break
    print(f"Попытка {attempt} не удалась, ждём {delay:.1f} с")
    time.sleep(delay)
    delay *= 2                         # 0.1, 0.2, 0.4, 0.8...
else:
    print("Сдаёмся: все попытки исчерпаны")`,
      explain: `<p>Этот приём (retry with exponential backoff) постоянно используется в бэкенде при обращении к внешним сервисам.</p>`,
    },
    {
      title: 'enumerate и zip',
      lang: 'python',
      code: String.raw`
names = ["Анна", "Борис", "Вера"]
scores = [92, 78, 85]

for i, (name, score) in enumerate(zip(names, scores), start=1):
    print(f"{i}. {name}: {score}")`,
    },
  ],
  tasks: [
    {
      title: 'FizzBuzz',
      level: 'легко',
      text: `<p>Классика собеседований. Выведите числа от 1 до 100, но вместо кратных 3 — <code>Fizz</code>, кратных 5 — <code>Buzz</code>, кратных и 3, и 5 — <code>FizzBuzz</code>.</p>`,
      solutionCode: String.raw`
for n in range(1, 101):
    if n % 15 == 0:
        print("FizzBuzz")
    elif n % 3 == 0:
        print("Fizz")
    elif n % 5 == 0:
        print("Buzz")
    else:
        print(n)`,
    },
    {
      title: 'Угадай число',
      level: 'средне',
      text: `<p>Программа загадывает число от 1 до 100 (<code>random.randint</code>). Пользователь угадывает, программа отвечает «больше» / «меньше».
        В конце — число попыток. Если ввели не число — попросить повторить, не падая.</p>`,
      hint: `<p>Проверить, что строка состоит из цифр: <code>s.isdigit()</code>.</p>`,
      solutionCode: String.raw`
import random

secret = random.randint(1, 100)
tries = 0
while True:
    guess = input("Ваше число: ")
    if not guess.isdigit():
        print("Введите целое число")
        continue
    tries += 1
    n = int(guess)
    if n < secret:
        print("Больше")
    elif n > secret:
        print("Меньше")
    else:
        print(f"Угадали за {tries} попыток!")
        break`,
    },
    {
      title: 'Анализ логов',
      level: 'средне',
      text: `<p>Дан список строк лога: <code>["GET /users 200", "POST /login 401", "GET /items 500", "GET /users 200", "DELETE /items/3 204"]</code>.
        Посчитайте число успешных (2xx), клиентских (4xx) и серверных (5xx) ответов. Выведите первую строку с ошибкой 5xx.</p>`,
      solutionCode: String.raw`
logs = ["GET /users 200", "POST /login 401", "GET /items 500", "GET /users 200", "DELETE /items/3 204"]
ok = client = server = 0
first_5xx = None
for line in logs:
    status = int(line.split()[-1])
    if 200 <= status < 300:
        ok += 1
    elif 400 <= status < 500:
        client += 1
    elif status >= 500:
        server += 1
        if first_5xx is None:
            first_5xx = line
print(f"2xx: {ok}, 4xx: {client}, 5xx: {server}")
print("Первая ошибка сервера:", first_5xx)`,
    },
  ],
  quiz: [
    { q: 'Что выведет <code>list(range(2, 10, 3))</code>?', options: ['[2, 5, 8]', '[2, 5, 8, 11]', '[3, 6, 9]', '[2, 3, 4]'], answer: 0 },
    { q: 'Когда выполняется блок <code>else</code> у цикла <code>for</code>?', options: ['Всегда после цикла', 'Если цикл не выполнился ни разу', 'Если цикл завершился без break', 'При ошибке в цикле'], answer: 2 },
    { q: 'Что делает <code>continue</code>?', options: ['Выходит из цикла', 'Пропускает остаток итерации и переходит к следующей', 'Перезапускает цикл с начала', 'Ничего'], answer: 1 },
  ],
  resources: [
    { title: 'Учебник Python: управляющие конструкции', url: 'https://docs.python.org/3/tutorial/controlflow.html' },
  ],
});

registerContent('py-functions', {
  intro: `<p>Функция — именованный кусок кода, который можно вызывать много раз. В бэкенде каждая точка API — это функция-обработчик,
    поэтому умение писать небольшие, понятные функции — основа всего.</p>`,
  theory: [
    {
      title: 'Объявление и возврат значения',
      html: `<p><code>def имя(параметры):</code> + тело с отступом. <code>return</code> возвращает результат и завершает функцию.
        Функция без <code>return</code> возвращает <code>None</code>.</p>
        <p>Можно вернуть несколько значений через кортеж: <code>return min_v, max_v</code> → <code>lo, hi = stats(data)</code>.</p>
        <p>Первая строка в теле в тройных кавычках — <b>docstring</b>, документация функции (видна в <code>help()</code> и подсказках редактора).</p>`,
    },
    {
      title: 'Параметры',
      html: `<ul>
          <li><b>Позиционные</b>: <code>f(1, 2)</code>; <b>именованные</b>: <code>f(a=1, b=2)</code> — понятнее при чтении.</li>
          <li><b>Значения по умолчанию</b>: <code>def connect(host, port=5432):</code>.</li>
          <li><code>*args</code> — любое число позиционных аргументов (кортеж), <code>**kwargs</code> — именованных (словарь).</li>
          <li>Параметры после <code>*</code> — только именованные: <code>def send(to, *, retry=False)</code>.</li>
        </ul>
        <p class="note">Ловушка: никогда не используйте изменяемые значения по умолчанию (<code>def f(items=[])</code>) — список создаётся один раз и общий для всех вызовов. Пишите <code>items=None</code> и внутри <code>if items is None: items = []</code>.</p>`,
    },
    {
      title: 'Область видимости',
      html: `<p>Переменные, созданные внутри функции, — <b>локальные</b>: снаружи их не видно. Функция может читать глобальные переменные,
        но изменять их без <code>global</code> не может. Хорошая практика — передавать всё нужное через параметры и возвращать результат,
        а не менять глобальное состояние: такие функции легко тестировать.</p>`,
    },
    {
      title: 'Функции как значения, lambda и декораторы',
      html: `<p>Функцию можно передать в другую функцию: <code>sorted(users, key=lambda u: u["age"])</code>.
        <code>lambda</code> — короткая безымянная функция из одного выражения.</p>
        <p><b>Декоратор</b> — функция, которая оборачивает другую и добавляет поведение. Синтаксис <code>@decorator</code> над <code>def</code>.
        В веб-фреймворках декораторы повсюду: <code>@app.get("/users")</code> регистрирует функцию как обработчик URL.</p>`,
    },
  ],
  examples: [
    {
      title: 'Функция с аннотациями и docstring',
      lang: 'python',
      code: String.raw`
def calculate_price(price: float, qty: int = 1, discount: float = 0.0) -> float:
    """Возвращает итоговую цену с учётом количества и скидки (0..1)."""
    if not 0 <= discount <= 1:
        raise ValueError("Скидка должна быть от 0 до 1")
    return round(price * qty * (1 - discount), 2)

print(calculate_price(100))                     # 100.0
print(calculate_price(100, qty=3, discount=0.1))  # 270.0`,
    },
    {
      title: '*args и **kwargs',
      lang: 'python',
      code: String.raw`
def log(level: str, *messages: str, **context) -> None:
    text = " ".join(messages)
    extra = " ".join(f"{k}={v}" for k, v in context.items())
    print(f"[{level}] {text} {extra}")

log("INFO", "Пользователь", "вошёл", user_id=42, ip="10.0.0.1")
# [INFO] Пользователь вошёл user_id=42 ip=10.0.0.1`,
    },
    {
      title: 'Декоратор: замер времени',
      lang: 'python',
      code: String.raw`
import time
from functools import wraps

def timed(func):
    @wraps(func)                       # сохраняет имя и docstring
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        ms = (time.perf_counter() - start) * 1000
        print(f"{func.__name__} выполнилась за {ms:.1f} мс")
        return result
    return wrapper

@timed
def slow_sum(n: int) -> int:
    return sum(range(n))

slow_sum(10_000_000)`,
    },
  ],
  tasks: [
    {
      title: 'Проверка пароля',
      level: 'легко',
      text: `<p>Напишите функцию <code>check_password(pwd) -> list[str]</code>, которая возвращает список проблем: короче 8 символов, нет цифры, нет заглавной буквы.
        Пустой список — пароль хороший.</p>`,
      hint: `<p><code>any(ch.isdigit() for ch in pwd)</code> — есть ли хоть одна цифра.</p>`,
      solutionCode: String.raw`
def check_password(pwd: str) -> list[str]:
    problems = []
    if len(pwd) < 8:
        problems.append("слишком короткий")
    if not any(ch.isdigit() for ch in pwd):
        problems.append("нет цифры")
    if not any(ch.isupper() for ch in pwd):
        problems.append("нет заглавной буквы")
    return problems

print(check_password("qwerty"))       # все три проблемы
print(check_password("Secret123"))    # []`,
    },
    {
      title: 'Декоратор retry',
      level: 'сложно',
      text: `<p>Напишите декоратор <code>retry(times)</code>, который при исключении повторяет вызов функции до <code>times</code> раз,
        а если все попытки неудачны — пробрасывает последнее исключение. Использование: <code>@retry(3)</code>.</p>`,
      hint: `<p>Это декоратор с параметром: функция <code>retry(times)</code> возвращает декоратор, а тот — обёртку. Три уровня вложенности.</p>`,
      solutionCode: String.raw`
from functools import wraps

def retry(times: int):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    print(f"Попытка {attempt} упала: {e}")
                    last_error = e
            raise last_error
        return wrapper
    return decorator

import random

@retry(3)
def flaky():
    if random.random() < 0.6:
        raise ConnectionError("нет связи")
    return "ok"

print(flaky())`,
    },
    {
      title: 'Сортировка пользователей',
      level: 'средне',
      text: `<p>Дан список словарей <code>users = [{"name": "Вера", "age": 31}, {"name": "Анна", "age": 25}, {"name": "Борис", "age": 31}]</code>.
        Отсортируйте по возрасту по убыванию, а при равном возрасте — по имени по алфавиту. Одной строкой с <code>sorted</code> и <code>lambda</code>.</p>`,
      solutionCode: String.raw`
users = [{"name": "Вера", "age": 31}, {"name": "Анна", "age": 25}, {"name": "Борис", "age": 31}]
result = sorted(users, key=lambda u: (-u["age"], u["name"]))
print([u["name"] for u in result])   # ['Борис', 'Вера', 'Анна']`,
    },
  ],
  quiz: [
    { q: 'Что вернёт функция без оператора return?', options: ['0', 'Пустую строку', 'None', 'Ошибку'], answer: 2 },
    { q: 'Почему <code>def add(item, items=[])</code> — плохая идея?', options: ['Синтаксическая ошибка', 'Список создаётся один раз и копит значения между вызовами', 'Списки нельзя передавать в функции', 'Работает медленно'], answer: 1 },
    { q: 'Что такое <code>**kwargs</code> внутри функции?', options: ['Кортеж', 'Список', 'Словарь именованных аргументов', 'Строка'], answer: 2 },
    { q: 'Что делает декоратор?', options: ['Удаляет функцию', 'Оборачивает функцию, добавляя поведение', 'Меняет тип возвращаемого значения на str', 'Делает функцию асинхронной'], answer: 1 },
  ],
  resources: [
    { title: 'Учебник Python: определение функций', url: 'https://docs.python.org/3/tutorial/controlflow.html#defining-functions' },
    { title: 'Real Python: декораторы', url: 'https://realpython.com/primer-on-python-decorators/' },
  ],
});

registerContent('py-collections', {
  intro: `<p>Данные в бэкенде почти всегда приходят наборами: список заказов, JSON-объект пользователя, множество тегов.
    Python даёт четыре встроенные коллекции — и JSON отображается на них один в один.</p>`,
  theory: [
    {
      title: 'Список (list)',
      html: `<p>Упорядоченная изменяемая последовательность: <code>nums = [3, 1, 2]</code>.</p>
        <ul>
          <li>Добавить: <code>.append(x)</code>, <code>.extend([...])</code>, <code>.insert(i, x)</code>.</li>
          <li>Удалить: <code>.remove(x)</code>, <code>.pop()</code>, <code>del nums[0]</code>.</li>
          <li>Сортировка: <code>.sort()</code> — на месте, <code>sorted(nums)</code> — новый список.</li>
          <li>Индексы и срезы как у строк: <code>nums[0]</code>, <code>nums[-1]</code>, <code>nums[1:]</code>.</li>
        </ul>`,
    },
    {
      title: 'Кортеж (tuple)',
      html: `<p>Как список, но <b>неизменяемый</b>: <code>point = (10, 20)</code>. Используют для фиксированных наборов (координаты, пара «ключ-значение»)
        и как ключи словаря. Распаковка: <code>x, y = point</code>.</p>`,
    },
    {
      title: 'Словарь (dict)',
      html: `<p>Пары «ключ → значение»: <code>user = {"id": 1, "name": "Анна"}</code>. Доступ по ключу за O(1) — очень быстро даже для миллиона записей.</p>
        <ul>
          <li><code>user["name"]</code> — ошибка <code>KeyError</code>, если ключа нет; <code>user.get("age", 0)</code> — значение по умолчанию.</li>
          <li><code>user["age"] = 30</code> — добавить/изменить; <code>"age" in user</code> — проверить.</li>
          <li>Перебор: <code>for key, value in user.items():</code>.</li>
          <li>Слияние: <code>{**defaults, **overrides}</code> или <code>defaults | overrides</code>.</li>
        </ul>
        <p class="note">JSON-объект ↔ dict, JSON-массив ↔ list. Ответ любого API в Python — это словари и списки.</p>`,
    },
    {
      title: 'Множество (set)',
      html: `<p>Неупорядоченный набор <b>уникальных</b> элементов: <code>tags = {"python", "backend"}</code>. Пустое множество — только <code>set()</code> (<code>{}</code> — это словарь).</p>
        <p>Быстрая проверка <code>x in s</code>, удаление дублей <code>set(lst)</code>, операции: <code>a | b</code> (объединение), <code>a &amp; b</code> (пересечение), <code>a - b</code> (разность).</p>`,
    },
    {
      title: 'Генераторы коллекций (comprehensions)',
      html: `<p>Компактный способ построить коллекцию из другой:</p>
        <ul>
          <li><code>[x * 2 for x in nums if x &gt; 0]</code> — список;</li>
          <li><code>{u["id"]: u for u in users}</code> — словарь (индекс по id);</li>
          <li><code>{w.lower() for w in words}</code> — множество.</li>
        </ul>
        <p>Модуль <code>collections</code> добавляет полезное: <code>Counter</code> (подсчёт), <code>defaultdict</code> (словарь со значением по умолчанию), <code>deque</code> (очередь).</p>`,
    },
  ],
  examples: [
    {
      title: 'Работа с «ответом API»',
      lang: 'python',
      code: String.raw`
orders = [
    {"id": 1, "user": "anna", "total": 1500, "status": "paid"},
    {"id": 2, "user": "boris", "total": 700, "status": "new"},
    {"id": 3, "user": "anna", "total": 300, "status": "paid"},
]

paid = [o for o in orders if o["status"] == "paid"]
revenue = sum(o["total"] for o in paid)
by_id = {o["id"]: o for o in orders}
users = {o["user"] for o in orders}

print(revenue)           # 1800
print(by_id[2]["user"])  # boris
print(sorted(users))     # ['anna', 'boris']`,
    },
    {
      title: 'Counter и defaultdict',
      lang: 'python',
      code: String.raw`
from collections import Counter, defaultdict

text = "кот пёс кот рыба кот пёс"
print(Counter(text.split()).most_common(2))   # [('кот', 3), ('пёс', 2)]

orders_by_user = defaultdict(list)
for user, order_id in [("anna", 1), ("boris", 2), ("anna", 3)]:
    orders_by_user[user].append(order_id)
print(dict(orders_by_user))   # {'anna': [1, 3], 'boris': [2]}`,
    },
  ],
  tasks: [
    {
      title: 'Уникальные email',
      level: 'легко',
      text: `<p>Дан список email с дублями и разным регистром: <code>["A@x.ru", "b@x.ru", "a@X.ru", "c@y.ru"]</code>. Получите отсортированный список уникальных адресов в нижнем регистре.</p>`,
      solutionCode: String.raw`
emails = ["A@x.ru", "b@x.ru", "a@X.ru", "c@y.ru"]
print(sorted({e.lower() for e in emails}))   # ['a@x.ru', 'b@x.ru', 'c@y.ru']`,
    },
    {
      title: 'Группировка заказов',
      level: 'средне',
      text: `<p>Для списка <code>orders</code> из примера посчитайте сумму оплаченных заказов по каждому пользователю. Результат — словарь
        <code>{"anna": 1800}</code>. Затем найдите пользователя с максимальной суммой.</p>`,
      solutionCode: String.raw`
from collections import defaultdict

totals = defaultdict(int)
for o in orders:
    if o["status"] == "paid":
        totals[o["user"]] += o["total"]

print(dict(totals))
top = max(totals, key=totals.get)
print("Лучший покупатель:", top)`,
    },
    {
      title: 'Пагинация',
      level: 'средне',
      text: `<p>Напишите функцию <code>paginate(items, page, per_page)</code>, которая возвращает словарь
        <code>{"items": [...], "page": 2, "pages": 5, "total": 47}</code>. Страницы нумеруются с 1. Так выглядят ответы большинства API со списками.</p>`,
      hint: `<p>Число страниц: <code>(total + per_page - 1) // per_page</code>. Срез: <code>items[start:start + per_page]</code>.</p>`,
      solutionCode: String.raw`
def paginate(items: list, page: int = 1, per_page: int = 10) -> dict:
    total = len(items)
    pages = max(1, (total + per_page - 1) // per_page)
    page = min(max(page, 1), pages)
    start = (page - 1) * per_page
    return {"items": items[start:start + per_page], "page": page, "pages": pages, "total": total}

print(paginate(list(range(47)), page=5, per_page=10))
# {'items': [40, ..., 46], 'page': 5, 'pages': 5, 'total': 47}`,
    },
  ],
  quiz: [
    { q: 'Как создать пустое множество?', options: ['{}', 'set()', '[]', '()'], answer: 1, explain: '{} создаёт пустой словарь.' },
    { q: 'Что вернёт <code>user.get("age")</code>, если ключа нет?', options: ['KeyError', '0', 'None', '""'], answer: 2 },
    { q: 'Какую коллекцию нельзя изменить после создания?', options: ['list', 'dict', 'set', 'tuple'], answer: 3 },
    { q: 'Чему соответствует JSON-объект в Python?', options: ['list', 'dict', 'tuple', 'str'], answer: 1 },
  ],
  resources: [
    { title: 'Учебник Python: структуры данных', url: 'https://docs.python.org/3/tutorial/datastructures.html' },
    { title: 'Модуль collections', url: 'https://docs.python.org/3/library/collections.html' },
  ],
});

registerContent('py-errors-files', {
  intro: `<p>В бэкенде всё время что-то идёт не так: клиент прислал мусор, база недоступна, файл не найден.
    Хороший код не падает целиком, а обрабатывает ошибку и возвращает понятный ответ. Здесь же — работа с файлами и JSON.</p>`,
  theory: [
    {
      title: 'Исключения и try/except',
      html: `<p>Ошибка во время выполнения — это <b>исключение</b> (<code>ValueError</code>, <code>KeyError</code>, <code>ZeroDivisionError</code>, <code>FileNotFoundError</code>...).
        Если его не перехватить, программа завершится и выведет <b>traceback</b> — читайте его снизу вверх: последняя строка — тип и текст ошибки.</p>
        <ul>
          <li><code>try:</code> — код, который может упасть;</li>
          <li><code>except ТипОшибки as e:</code> — что делать при ошибке;</li>
          <li><code>else:</code> — если ошибки не было;</li>
          <li><code>finally:</code> — выполнится всегда (закрыть соединение, освободить ресурс).</li>
        </ul>
        <p class="note">Перехватывайте конкретные исключения. Голый <code>except:</code> скрывает баги, в том числе опечатки в коде.</p>`,
    },
    {
      title: 'Свои исключения и raise',
      html: `<p><code>raise ValueError("сообщение")</code> — выбросить исключение. Свои исключения — классы, унаследованные от <code>Exception</code>.
        В бэкенде принято заводить исключения предметной области (<code>UserNotFound</code>, <code>InsufficientFunds</code>) и
        в одном месте превращать их в HTTP-ответы (404, 409...).</p>`,
    },
    {
      title: 'Файлы и контекстный менеджер',
      html: `<p><code>with open("file.txt", "r", encoding="utf-8") as f:</code> — открыть файл; <code>with</code> гарантирует, что файл закроется даже при ошибке.</p>
        <p>Режимы: <code>"r"</code> — чтение, <code>"w"</code> — запись (перезаписывает!), <code>"a"</code> — дописать в конец, <code>"rb"</code>/<code>"wb"</code> — бинарные данные.</p>
        <p>Всегда указывайте <code>encoding="utf-8"</code> — на Windows по умолчанию может быть другая кодировка, и кириллица превратится в «кракозябры».</p>
        <p>Для путей удобен модуль <code>pathlib</code>: <code>Path("data") / "users.json"</code>, <code>.exists()</code>, <code>.read_text()</code>.</p>`,
    },
    {
      title: 'JSON',
      html: `<p>Модуль <code>json</code>: <code>json.dumps(obj)</code> — объект в строку, <code>json.loads(s)</code> — строка в объект,
        <code>json.dump</code>/<code>json.load</code> — то же с файлами. Для кириллицы используйте <code>ensure_ascii=False</code>, для читаемости — <code>indent=2</code>.</p>`,
    },
  ],
  examples: [
    {
      title: 'Безопасный парсинг ввода',
      lang: 'python',
      code: String.raw`
def parse_age(raw: str) -> int:
    try:
        age = int(raw)
    except ValueError:
        raise ValueError(f"'{raw}' — не число") from None
    if not 0 < age < 150:
        raise ValueError("Возраст вне диапазона")
    return age

for value in ["25", "abc", "-3"]:
    try:
        print("OK:", parse_age(value))
    except ValueError as e:
        print("Ошибка:", e)`,
    },
    {
      title: 'Свои исключения → HTTP-статусы',
      lang: 'python',
      code: String.raw`
class AppError(Exception):
    status = 500

class NotFound(AppError):
    status = 404

class Conflict(AppError):
    status = 409

USERS = {"anna": {"email": "anna@mail.ru"}}

def create_user(name: str, email: str) -> dict:
    if name in USERS:
        raise Conflict(f"Пользователь {name} уже существует")
    USERS[name] = {"email": email}
    return USERS[name]

def handle_request(name: str, email: str) -> tuple[int, dict]:
    try:
        return 201, create_user(name, email)
    except AppError as e:
        return e.status, {"error": str(e)}

print(handle_request("anna", "x@x.ru"))   # (409, {'error': 'Пользователь anna уже существует'})
print(handle_request("boris", "b@b.ru"))  # (201, {'email': 'b@b.ru'})`,
    },
    {
      title: 'Хранилище в JSON-файле',
      lang: 'python',
      code: String.raw`
import json
from pathlib import Path

DB = Path("todos.json")

def load() -> list[dict]:
    if not DB.exists():
        return []
    return json.loads(DB.read_text(encoding="utf-8"))

def save(todos: list[dict]) -> None:
    DB.write_text(json.dumps(todos, ensure_ascii=False, indent=2), encoding="utf-8")

todos = load()
todos.append({"id": len(todos) + 1, "title": "Выучить исключения", "done": False})
save(todos)
print(load())`,
    },
  ],
  tasks: [
    {
      title: 'Безопасное деление',
      level: 'легко',
      text: `<p>Напишите функцию <code>safe_div(a, b)</code>, которая возвращает <code>a / b</code>, а при делении на ноль или нечисловых аргументах — <code>None</code>
        и печатает, какая ошибка произошла.</p>`,
      solutionCode: String.raw`
def safe_div(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        print("Деление на ноль")
    except TypeError:
        print("Аргументы должны быть числами")
    return None

print(safe_div(10, 2), safe_div(1, 0), safe_div("1", 2))`,
    },
    {
      title: 'Подсчёт слов в файле',
      level: 'средне',
      text: `<p>Напишите скрипт, который принимает путь к текстовому файлу, считает 10 самых частых слов (без учёта регистра и знаков препинания)
        и сохраняет результат в <code>stats.json</code>. Если файла нет — понятное сообщение, а не traceback.</p>`,
      hint: `<p>Слова можно достать регуляркой: <code>re.findall(r"\\w+", text.lower())</code>.</p>`,
      solutionCode: String.raw`
import json
import re
import sys
from collections import Counter
from pathlib import Path

path = Path(sys.argv[1] if len(sys.argv) > 1 else "input.txt")
try:
    text = path.read_text(encoding="utf-8")
except FileNotFoundError:
    print(f"Файл {path} не найден")
    sys.exit(1)

top = Counter(re.findall(r"\w+", text.lower())).most_common(10)
Path("stats.json").write_text(json.dumps(dict(top), ensure_ascii=False, indent=2), encoding="utf-8")
print("Готово:", top[:3])`,
    },
    {
      title: 'CLI-список задач',
      level: 'сложно',
      text: `<p>На основе примера «Хранилище в JSON-файле» сделайте консольное приложение с командами:
        <code>python todo.py add "Купить молоко"</code>, <code>list</code>, <code>done 2</code>, <code>delete 2</code>.
        Несуществующий id — сообщение об ошибке через своё исключение <code>TodoNotFound</code>.</p>`,
      hint: `<p>Аргументы командной строки — в <code>sys.argv</code>. Для серьёзных CLI есть модуль <code>argparse</code>.</p>`,
    },
  ],
  quiz: [
    { q: 'Когда выполняется блок <code>finally</code>?', options: ['Только при ошибке', 'Только без ошибки', 'Всегда', 'Никогда, если есть return'], answer: 2 },
    { q: 'Что произойдёт при открытии существующего файла в режиме <code>"w"</code>?', options: ['Данные допишутся в конец', 'Содержимое будет стёрто', 'Будет ошибка', 'Файл откроется только для чтения'], answer: 1 },
    { q: 'Зачем <code>ensure_ascii=False</code> в <code>json.dumps</code>?', options: ['Ускоряет работу', 'Кириллица сохраняется как есть, а не как \\uXXXX', 'Включает отступы', 'Сортирует ключи'], answer: 1 },
    { q: 'Почему плох голый <code>except:</code>?', options: ['Это синтаксическая ошибка', 'Он перехватывает вообще всё, включая баги и Ctrl+C', 'Он медленный', 'Он не работает с файлами'], answer: 1 },
  ],
  resources: [
    { title: 'Учебник Python: ошибки и исключения', url: 'https://docs.python.org/3/tutorial/errors.html' },
    { title: 'Модуль pathlib', url: 'https://docs.python.org/3/library/pathlib.html' },
  ],
});

registerContent('py-oop', {
  intro: `<p>Объектно-ориентированное программирование объединяет данные и функции, которые с ними работают, в <b>классы</b>.
    Модели в ORM, схемы запросов в FastAPI, сервисы и репозитории — всё это классы, поэтому без ООП в бэкенде никуда.</p>`,
  theory: [
    {
      title: 'Класс и объект',
      html: `<p><b>Класс</b> — шаблон (чертёж), <b>объект</b> (экземпляр) — конкретная вещь по этому чертежу. У класса <code>User</code> может быть тысяча объектов-пользователей.</p>
        <ul>
          <li><code>__init__(self, ...)</code> — конструктор, вызывается при создании объекта;</li>
          <li><code>self</code> — ссылка на текущий объект; через неё обращаются к атрибутам: <code>self.name</code>;</li>
          <li><b>методы</b> — функции внутри класса, первым параметром получают <code>self</code>.</li>
        </ul>`,
    },
    {
      title: 'Инкапсуляция и свойства',
      html: `<p>В Python нет настоящих «приватных» полей, есть соглашение: имя с <code>_</code> (<code>self._balance</code>) — внутреннее, не трогайте снаружи.</p>
        <p><code>@property</code> позволяет сделать метод, который читается как атрибут, — например, вычисляемое поле или поле только для чтения.</p>`,
    },
    {
      title: 'Наследование и полиморфизм',
      html: `<p>Класс может наследовать другой: <code>class Admin(User):</code> — получает все его атрибуты и методы и может переопределить их.
        <code>super().__init__(...)</code> вызывает конструктор родителя.</p>
        <p><b>Полиморфизм</b> — разные классы с одинаковым интерфейсом. Например, <code>EmailNotifier</code> и <code>SmsNotifier</code>
        оба имеют метод <code>send()</code>, и код, который их вызывает, не знает, какой именно перед ним.</p>
        <p class="note">Предпочитайте <b>композицию</b> наследованию: вместо глубоких иерархий передавайте объекты-зависимости в конструктор.</p>`,
    },
    {
      title: 'Магические методы и dataclass',
      html: `<p>Методы с двойным подчёркиванием задают поведение: <code>__str__</code> — как печатать, <code>__repr__</code> — отладочное представление,
        <code>__eq__</code> — сравнение, <code>__len__</code> — длина.</p>
        <p><code>@dataclass</code> автоматически создаёт <code>__init__</code>, <code>__repr__</code>, <code>__eq__</code> по аннотациям полей — идеально для классов-«контейнеров данных».
        Похожим образом устроены модели <b>Pydantic</b>, которые использует FastAPI.</p>`,
    },
  ],
  examples: [
    {
      title: 'Класс банковского счёта',
      lang: 'python',
      code: String.raw`
class InsufficientFunds(Exception):
    pass

class Account:
    def __init__(self, owner: str, balance: int = 0):
        self.owner = owner
        self._balance = balance

    @property
    def balance(self) -> int:
        return self._balance

    def deposit(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("Сумма должна быть положительной")
        self._balance += amount

    def withdraw(self, amount: int) -> None:
        if amount > self._balance:
            raise InsufficientFunds(f"На счёте только {self._balance}")
        self._balance -= amount

    def __repr__(self) -> str:
        return f"Account({self.owner!r}, balance={self._balance})"

acc = Account("Анна", 1000)
acc.deposit(500)
acc.withdraw(300)
print(acc, acc.balance)   # Account('Анна', balance=1200) 1200`,
    },
    {
      title: 'Полиморфизм и композиция',
      lang: 'python',
      code: String.raw`
from abc import ABC, abstractmethod

class Notifier(ABC):
    @abstractmethod
    def send(self, to: str, text: str) -> None: ...

class EmailNotifier(Notifier):
    def send(self, to: str, text: str) -> None:
        print(f"📧 {to}: {text}")

class SmsNotifier(Notifier):
    def send(self, to: str, text: str) -> None:
        print(f"📱 {to}: {text[:70]}")

class OrderService:
    def __init__(self, notifier: Notifier):    # зависимость передаётся снаружи
        self.notifier = notifier

    def place_order(self, user: str) -> None:
        # ... сохранить заказ ...
        self.notifier.send(user, "Ваш заказ принят")

OrderService(EmailNotifier()).place_order("anna@mail.ru")
OrderService(SmsNotifier()).place_order("+79990000000")`,
      explain: `<p>Сервису всё равно, как отправляется уведомление. В тестах можно передать фейковый notifier — это и есть внедрение зависимостей (dependency injection).</p>`,
    },
    {
      title: 'dataclass',
      lang: 'python',
      code: String.raw`
from dataclasses import dataclass, field

@dataclass
class Product:
    id: int
    title: str
    price: int
    tags: list[str] = field(default_factory=list)

    @property
    def price_rub(self) -> str:
        return f"{self.price / 100:.2f} ₽"

p = Product(1, "Книга", 59900, ["книги"])
print(p)               # Product(id=1, title='Книга', price=59900, tags=['книги'])
print(p.price_rub)     # 599.00 ₽
print(p == Product(1, "Книга", 59900, ["книги"]))   # True`,
    },
  ],
  tasks: [
    {
      title: 'Корзина покупок',
      level: 'средне',
      text: `<p>Создайте dataclass <code>Product</code> и класс <code>Cart</code> с методами <code>add(product, qty=1)</code>, <code>remove(product_id)</code>,
        свойством <code>total</code> и методом <code>__len__</code> (общее количество товаров). Повторное добавление товара увеличивает количество.</p>`,
      solutionCode: String.raw`
from dataclasses import dataclass

@dataclass(frozen=True)
class Product:
    id: int
    title: str
    price: int

class Cart:
    def __init__(self):
        self._items: dict[int, tuple[Product, int]] = {}

    def add(self, product: Product, qty: int = 1) -> None:
        _, current = self._items.get(product.id, (product, 0))
        self._items[product.id] = (product, current + qty)

    def remove(self, product_id: int) -> None:
        self._items.pop(product_id, None)

    @property
    def total(self) -> int:
        return sum(p.price * q for p, q in self._items.values())

    def __len__(self) -> int:
        return sum(q for _, q in self._items.values())

cart = Cart()
book = Product(1, "Книга", 500)
cart.add(book)
cart.add(book, 2)
cart.add(Product(2, "Ручка", 50))
print(len(cart), cart.total)   # 4 1550`,
    },
    {
      title: 'Иерархия пользователей',
      level: 'средне',
      text: `<p>Создайте класс <code>User</code> (имя, email, метод <code>can(action)</code>, по умолчанию разрешает только <code>"read"</code>),
        и наследников <code>Editor</code> (ещё <code>"write"</code>) и <code>Admin</code> (всё). Используйте <code>super()</code>, чтобы не дублировать логику.</p>`,
      solutionCode: String.raw`
class User:
    permissions = {"read"}

    def __init__(self, name: str, email: str):
        self.name = name
        self.email = email

    def can(self, action: str) -> bool:
        return action in self.permissions

class Editor(User):
    permissions = User.permissions | {"write"}

class Admin(User):
    def can(self, action: str) -> bool:
        return True

for u in (User("a", "a@x"), Editor("b", "b@x"), Admin("c", "c@x")):
    print(type(u).__name__, u.can("read"), u.can("write"), u.can("delete"))`,
    },
    {
      title: 'Репозиторий в памяти',
      level: 'сложно',
      text: `<p>Создайте класс <code>InMemoryRepository</code> для хранения объектов-dataclass с полем <code>id</code>: методы <code>add</code> (присваивает id автоматически),
        <code>get(id)</code> (бросает <code>NotFound</code>), <code>list()</code>, <code>update(id, **fields)</code>, <code>delete(id)</code>.
        Этот паттерн «Репозиторий» вы встретите в реальных проектах — позже заменим память на базу данных.</p>`,
      hint: `<p>Для обновления полей dataclass есть <code>dataclasses.replace(obj, **fields)</code>.</p>`,
    },
  ],
  quiz: [
    { q: 'Что такое <code>self</code> в методе?', options: ['Ключевое слово для глобальных переменных', 'Ссылка на текущий объект', 'Ссылка на класс-родитель', 'Имя модуля'], answer: 1 },
    { q: 'Что автоматически генерирует <code>@dataclass</code>?', options: ['Подключение к БД', '__init__, __repr__, __eq__', 'Только __str__', 'Методы get/set для каждого поля'], answer: 1 },
    { q: 'Что значит имя атрибута с подчёркиванием, например <code>_balance</code>?', options: ['Python запрещает доступ к нему', 'Соглашение: внутренний атрибут, не используйте снаружи', 'Атрибут класса, а не объекта', 'Атрибут только для чтения'], answer: 1 },
  ],
  resources: [
    { title: 'Учебник Python: классы', url: 'https://docs.python.org/3/tutorial/classes.html' },
    { title: 'Модуль dataclasses', url: 'https://docs.python.org/3/library/dataclasses.html' },
  ],
});

registerContent('py-modules', {
  intro: `<p>Реальный проект — это десятки файлов и сторонние библиотеки. В этой теме — как разбивать код на модули,
    устанавливать пакеты через <code>pip</code> и изолировать зависимости каждого проекта в виртуальном окружении.</p>`,
  theory: [
    {
      title: 'Модули и import',
      html: `<p>Любой <code>.py</code>-файл — <b>модуль</b>. Импорт:</p>
        <ul>
          <li><code>import math</code> → <code>math.sqrt(4)</code>;</li>
          <li><code>from math import sqrt</code> → <code>sqrt(4)</code>;</li>
          <li><code>import numpy as np</code> — псевдоним.</li>
        </ul>
        <p>Конструкция <code>if __name__ == "__main__":</code> — код внутри выполнится только при запуске файла напрямую, но не при импорте.</p>
        <p>Стандартная библиотека огромна («батарейки в комплекте»): <code>json</code>, <code>datetime</code>, <code>pathlib</code>, <code>logging</code>, <code>sqlite3</code>, <code>unittest</code>, <code>http</code>...</p>`,
    },
    {
      title: 'Пакеты и структура проекта',
      html: `<p><b>Пакет</b> — папка с модулями (обычно с файлом <code>__init__.py</code>). Типичная структура бэкенд-проекта:</p>
        <pre><code>myapp/
├── app/
│   ├── __init__.py
│   ├── main.py        # точка входа
│   ├── models.py      # модели данных
│   ├── services.py    # бизнес-логика
│   └── api/
│       ├── __init__.py
│       └── users.py   # обработчики URL
├── tests/
├── requirements.txt   # или pyproject.toml
└── .gitignore</code></pre>
        <p>Импорт внутри пакета: <code>from app.models import User</code>. Запуск модулем из корня проекта: <code>python -m app.main</code>.</p>`,
    },
    {
      title: 'pip и PyPI',
      html: `<p><b>PyPI</b> (pypi.org) — каталог из 500 000+ пакетов. <b>pip</b> устанавливает их:</p>
        <ul>
          <li><code>pip install requests</code>, <code>pip install "fastapi==0.115.*"</code> — установить (конкретную версию);</li>
          <li><code>pip list</code>, <code>pip uninstall requests</code>;</li>
          <li><code>pip freeze &gt; requirements.txt</code> — сохранить версии; <code>pip install -r requirements.txt</code> — установить по списку.</li>
        </ul>`,
    },
    {
      title: 'Виртуальные окружения',
      html: `<p>Если ставить пакеты глобально, проекты начнут конфликтовать: одному нужен Django 4, другому — Django 5.
        <b>Виртуальное окружение</b> (venv) — отдельная папка со своим Python и своими пакетами для каждого проекта.</p>
        <ol>
          <li><code>python -m venv .venv</code> — создать;</li>
          <li>Активировать: <code>.venv\\Scripts\\activate</code> (Windows) или <code>source .venv/bin/activate</code> (Linux/macOS);</li>
          <li>Теперь <code>pip install</code> ставит пакеты только сюда; <code>deactivate</code> — выйти.</li>
        </ol>
        <p class="note">Папку <code>.venv</code> не коммитят в Git — её добавляют в <code>.gitignore</code>, а зависимости фиксируют в <code>requirements.txt</code>.
        Современная быстрая альтернатива pip + venv — инструмент <b>uv</b>: <code>uv init</code>, <code>uv add fastapi</code>, <code>uv run main.py</code>.</p>`,
    },
  ],
  examples: [
    {
      title: 'Создание проекта с окружением',
      lang: 'bash',
      code: String.raw`
mkdir myapp && cd myapp
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1
# Linux / macOS
source .venv/bin/activate

pip install requests
pip freeze > requirements.txt
cat requirements.txt
# certifi==2024.8.30
# requests==2.32.3
# ...`,
    },
    {
      title: 'Свой модуль',
      lang: 'python',
      code: String.raw`
# файл utils/text.py
def slugify(title: str) -> str:
    """'Привет, Мир!' -> 'privet-mir'"""
    table = str.maketrans("абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
                          "abvgdeejzijklmnoprstufhccss_y_eua")
    clean = title.lower().translate(table)
    words = "".join(ch if ch.isalnum() else " " for ch in clean).split()
    return "-".join(words)

if __name__ == "__main__":
    print(slugify("Привет, Мир!"))   # выполнится только при python utils/text.py

# файл main.py
from utils.text import slugify
print(slugify("Мой первый пост"))`,
    },
    {
      title: 'Логирование вместо print',
      lang: 'python',
      code: String.raw`
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("orders")

log.info("Заказ %s создан", 42)
log.warning("Мало товара на складе: %d шт.", 2)
try:
    1 / 0
except ZeroDivisionError:
    log.exception("Ошибка при расчёте")   # выведет и traceback`,
      explain: `<p>В бэкенде вместо <code>print</code> используют <code>logging</code>: уровни важности, время, источник, вывод в файл или систему сбора логов.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Окружение для курса',
      level: 'легко',
      text: `<p>В папке <code>backend-course</code> создайте виртуальное окружение, активируйте его, установите <code>requests</code> и <code>rich</code>.
        Сохраните зависимости в <code>requirements.txt</code>. Удалите <code>.venv</code>, создайте заново и восстановите пакеты из файла.</p>`,
    },
    {
      title: 'Разбейте программу на модули',
      level: 'средне',
      text: `<p>Возьмите CLI-список задач из темы «Исключения и файлы» и разделите на пакет: <code>todo/storage.py</code> (загрузка/сохранение),
        <code>todo/models.py</code> (dataclass Todo и исключения), <code>todo/cli.py</code> (разбор команд), <code>todo/__main__.py</code> (запуск через <code>python -m todo</code>).</p>`,
      hint: `<p>Файл <code>__main__.py</code> внутри пакета выполняется командой <code>python -m имя_пакета</code>.</p>`,
    },
    {
      title: 'Красивый вывод',
      level: 'легко',
      text: `<p>С помощью установленной библиотеки <code>rich</code> выведите таблицу пользователей с <code>jsonplaceholder.typicode.com/users</code> (имя, email, город).
        Изучите документацию rich, чтобы найти класс <code>Table</code>.</p>`,
      solutionCode: String.raw`
import requests
from rich.console import Console
from rich.table import Table

users = requests.get("https://jsonplaceholder.typicode.com/users", timeout=10).json()
table = Table(title="Пользователи")
for col in ("Имя", "Email", "Город"):
    table.add_column(col)
for u in users:
    table.add_row(u["name"], u["email"], u["address"]["city"])
Console().print(table)`,
    },
  ],
  quiz: [
    { q: 'Зачем нужно виртуальное окружение?', options: ['Чтобы Python работал быстрее', 'Чтобы у каждого проекта были свои версии пакетов', 'Чтобы запускать код в браузере', 'Для шифрования кода'], answer: 1 },
    { q: 'Когда выполняется код в блоке <code>if __name__ == "__main__":</code>?', options: ['При каждом импорте', 'Только при прямом запуске файла', 'Никогда', 'Только в тестах'], answer: 1 },
    { q: 'Нужно ли коммитить папку <code>.venv</code> в Git?', options: ['Да, обязательно', 'Нет, коммитят requirements.txt / pyproject.toml', 'Только на Windows', 'Только папку Scripts'], answer: 1 },
  ],
  resources: [
    { title: 'Учебник Python: модули', url: 'https://docs.python.org/3/tutorial/modules.html' },
    { title: 'Учебник Python: виртуальные окружения', url: 'https://docs.python.org/3/tutorial/venv.html' },
    { title: 'uv — быстрый менеджер пакетов', url: 'https://docs.astral.sh/uv/' },
  ],
});

registerContent('py-web', {
  intro: `<p>Пора собрать всё вместе и написать настоящий бэкенд. Мы используем <b>FastAPI</b> — современный фреймворк, который
    по аннотациям типов сам проверяет входные данные и генерирует интерактивную документацию API.</p>`,
  theory: [
    {
      title: 'Что делает веб-фреймворк',
      html: `<p>Вместо ручного разбора HTTP (как в теме про браузеры) фреймворк берёт на себя рутину:</p>
        <ul>
          <li><b>маршрутизация</b> — какой функции отдать запрос <code>GET /users/42</code>;</li>
          <li><b>разбор</b> пути, query-параметров, JSON-тела и заголовков;</li>
          <li><b>валидация</b> данных и автоматический ответ 422 при ошибках;</li>
          <li><b>сериализация</b> ответа в JSON и выставление заголовков.</li>
        </ul>
        <p>Популярные Python-фреймворки: <b>Django</b> (всё в комплекте: ORM, админка, авторизация), <b>FastAPI</b> (быстрый, для API), <b>Flask</b> (минималистичный).</p>`,
    },
    {
      title: 'Устройство FastAPI-приложения',
      html: `<ul>
          <li><code>app = FastAPI()</code> — приложение;</li>
          <li><code>@app.get("/path")</code>, <code>@app.post(...)</code> — декораторы, связывающие метод+путь с функцией;</li>
          <li>параметры функции из пути (<code>/items/{item_id}</code>) — <b>path-параметры</b>, остальные простые — <b>query-параметры</b>;</li>
          <li>параметр-модель Pydantic — <b>тело запроса</b> (JSON);</li>
          <li>возвращаемое значение (dict, список, модель) автоматически превращается в JSON;</li>
          <li><code>HTTPException(status_code=404)</code> — вернуть ошибку.</li>
        </ul>
        <p>Запускает приложение ASGI-сервер <b>uvicorn</b> (или команда <code>fastapi dev</code>).</p>`,
    },
    {
      title: 'Автодокументация',
      html: `<p>Откройте <code>http://127.0.0.1:8000/docs</code> — FastAPI генерирует <b>Swagger UI</b> по спецификации OpenAPI:
        все эндпоинты, схемы данных и кнопка «Try it out» для отправки запросов прямо из браузера. Это заменяет Postman на старте.</p>`,
    },
  ],
  examples: [
    {
      title: 'Установка и запуск',
      lang: 'bash',
      code: String.raw`
python -m venv .venv
.venv\Scripts\Activate.ps1        # или source .venv/bin/activate
pip install "fastapi[standard]"

fastapi dev main.py
# Сервер: http://127.0.0.1:8000, документация: http://127.0.0.1:8000/docs`,
    },
    {
      title: 'CRUD API для задач (main.py)',
      lang: 'python',
      code: String.raw`
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field

app = FastAPI(title="Todo API")

class TodoIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    done: bool = False

class Todo(TodoIn):
    id: int

todos: dict[int, Todo] = {}
next_id = 1

@app.get("/todos")
def list_todos(done: bool | None = None) -> list[Todo]:
    items = list(todos.values())
    if done is not None:
        items = [t for t in items if t.done == done]
    return items

@app.post("/todos", status_code=status.HTTP_201_CREATED)
def create_todo(data: TodoIn) -> Todo:
    global next_id
    todo = Todo(id=next_id, **data.model_dump())
    todos[todo.id] = todo
    next_id += 1
    return todo

@app.get("/todos/{todo_id}")
def get_todo(todo_id: int) -> Todo:
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    return todos[todo_id]

@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int) -> None:
    if todos.pop(todo_id, None) is None:
        raise HTTPException(status_code=404, detail="Задача не найдена")`,
      explain: `<p>Попробуйте отправить <code>POST /todos</code> с пустым <code>title</code> — FastAPI сам вернёт 422 с описанием ошибки.
        <code>GET /todos?done=true</code> — фильтрация через query-параметр.</p>`,
    },
    {
      title: 'Проверка через curl',
      lang: 'bash',
      code: String.raw`
curl -X POST http://127.0.0.1:8000/todos -H "Content-Type: application/json" -d '{"title": "Выучить FastAPI"}'
# {"title":"Выучить FastAPI","done":false,"id":1}

curl http://127.0.0.1:8000/todos/1
curl -i http://127.0.0.1:8000/todos/99     # HTTP/1.1 404 Not Found`,
    },
  ],
  tasks: [
    {
      title: 'Добавьте обновление',
      level: 'средне',
      text: `<p>Добавьте в Todo API эндпоинт <code>PATCH /todos/{todo_id}</code>, который принимает частичные данные (<code>title</code> и/или <code>done</code>)
        и обновляет только переданные поля.</p>`,
      hint: `<p>Создайте модель <code>TodoUpdate</code> со всеми полями <code>| None = None</code> и используйте <code>data.model_dump(exclude_unset=True)</code>.</p>`,
      solutionCode: String.raw`
class TodoUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    done: bool | None = None

@app.patch("/todos/{todo_id}")
def update_todo(todo_id: int, data: TodoUpdate) -> Todo:
    todo = get_todo(todo_id)                       # переиспользуем проверку на 404
    updated = todo.model_copy(update=data.model_dump(exclude_unset=True))
    todos[todo_id] = updated
    return updated`,
    },
    {
      title: 'Сохранение в файл',
      level: 'средне',
      text: `<p>Сейчас задачи пропадают при перезапуске сервера. Сохраняйте их в <code>todos.json</code> после каждого изменения и загружайте при старте.
        (Позже, в разделе про базы данных, заменим файл на SQLite/PostgreSQL.)</p>`,
    },
    {
      title: 'API заметок',
      level: 'сложно',
      text: `<p>Самостоятельно спроектируйте и реализуйте API заметок: у заметки есть заголовок, текст, список тегов и дата создания.
        Эндпоинты: создать, получить список (с пагинацией <code>?page=&amp;per_page=</code> и фильтром <code>?tag=</code>), получить одну, изменить, удалить.
        Проверьте всё через <code>/docs</code>. Это ваш первый проект в портфолио — после темы про Git залейте его на GitHub.</p>`,
      hint: `<p>Дата: <code>from datetime import datetime</code>, поле <code>created_at: datetime</code>. Пагинацию вы уже писали в теме «Коллекции».</p>`,
    },
  ],
  quiz: [
    { q: 'Что вернёт FastAPI, если тело запроса не прошло валидацию Pydantic?', options: ['200', '400', '422', '500'], answer: 2 },
    { q: 'По какому адресу находится автоматическая документация FastAPI?', options: ['/api', '/docs', '/swagger.json', '/help'], answer: 1 },
    { q: 'Как в FastAPI объявить path-параметр?', options: ['@app.get("/items?id")', '@app.get("/items/{item_id}") и параметр item_id в функции', 'Через request.path', 'Через глобальную переменную'], answer: 1 },
  ],
  resources: [
    { title: 'Официальный учебник FastAPI (есть на русском)', url: 'https://fastapi.tiangolo.com/ru/tutorial/' },
    { title: 'Документация Pydantic', url: 'https://docs.pydantic.dev/latest/' },
  ],
});
