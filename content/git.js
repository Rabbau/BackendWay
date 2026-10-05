// Раздел 4. Git и контроль версий

registerContent('vcs', {
  intro: `<p>Представьте: вы неделю пишете проект, что-то ломаете и хотите вернуть вчерашнюю версию. Или вдвоём правите один файл.
    <b>Система контроля версий</b> (VCS) хранит всю историю изменений и позволяет работать над кодом одновременно многим людям.
    Сегодня стандарт де-факто — <b>Git</b>.</p>`,
  theory: [
    {
      title: 'Зачем нужен контроль версий',
      html: `<ul>
          <li><b>История</b>: кто, когда и зачем изменил каждую строку.</li>
          <li><b>Откат</b>: вернуться к любой прошлой версии.</li>
          <li><b>Ветки</b>: разрабатывать новую функцию отдельно, не ломая рабочую версию.</li>
          <li><b>Командная работа</b>: объединять изменения нескольких людей.</li>
          <li><b>Резервная копия</b>: код хранится в удалённом репозитории.</li>
        </ul>
        <p class="note">Папки «проект_финал_v2_точно_финал» — это ручной контроль версий. Git делает то же самое, но надёжно.</p>`,
    },
    {
      title: 'Централизованные и распределённые VCS',
      html: `<p><b>Централизованные</b> (SVN, Perforce): история хранится на одном сервере, без связи с ним нельзя сделать коммит.</p>
        <p><b>Распределённые</b> (Git, Mercurial): у каждого разработчика полная копия репозитория со всей историей. Можно коммитить офлайн,
        а сервер (GitHub, GitLab) — лишь договорённость о «главной» копии.</p>`,
    },
    {
      title: 'Как Git хранит данные',
      html: `<p>Git хранит не разницу между файлами, а <b>снимки</b> (snapshots) всего проекта. Каждый <b>коммит</b> — снимок + автор + дата + сообщение + ссылка на родительский коммит.
        Коммиты образуют цепочку — историю.</p>
        <p>У каждого коммита есть уникальный <b>хеш</b> (SHA-1), например <code>a1b2c3d</code>. Изменить старый коммит незаметно нельзя — изменится хеш.</p>
        <p>Вся служебная информация лежит в скрытой папке <code>.git</code> в корне проекта.</p>`,
    },
    {
      title: 'Три области Git',
      html: `<table>
          <tr><th>Область</th><th>Что это</th></tr>
          <tr><td><b>Рабочая директория</b></td><td>Файлы, которые вы видите и редактируете</td></tr>
          <tr><td><b>Индекс</b> (staging area)</td><td>«Черновик» следующего коммита: что именно в него попадёт</td></tr>
          <tr><td><b>Репозиторий</b></td><td>Сохранённые коммиты в папке <code>.git</code></td></tr>
        </table>
        <p>Цикл работы: изменили файлы → <code>git add</code> (в индекс) → <code>git commit</code> (в репозиторий).
        Индекс позволяет закоммитить только часть изменений — например, исправление бага отдельно от новой функции.</p>`,
    },
  ],
  examples: [
    {
      title: 'Установка и первичная настройка',
      lang: 'bash',
      code: String.raw`
# Windows: https://git-scm.com/download/win или
winget install Git.Git
# macOS: brew install git     Linux: sudo apt install git

git --version

# Представьтесь — эти данные попадут в каждый коммит
git config --global user.name "Анна Иванова"
git config --global user.email "anna@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf true     # только на Windows: переводы строк

git config --list`,
    },
  ],
  tasks: [
    {
      title: 'Установите и настройте Git',
      level: 'легко',
      text: `<p>Установите Git, настройте имя, email и ветку по умолчанию <code>main</code>. Проверьте настройки командой <code>git config --list</code>.
        Откройте файл <code>~/.gitconfig</code> и найдите там свои настройки.</p>`,
    },
    {
      title: 'Объясните своими словами',
      level: 'легко',
      text: `<p>Ответьте письменно (2–3 предложения на пункт): чем коммит отличается от сохранения файла? Зачем нужен индекс, если можно коммитить всё сразу?
        Что будет, если удалить папку <code>.git</code>?</p>`,
      solution: `<p><b>Коммит</b> — осознанная точка в истории со снимком всего проекта, автором и описанием; к нему можно вернуться. Сохранение файла лишь перезаписывает текущую версию.</p>
        <p><b>Индекс</b> позволяет собрать коммит из части изменений, чтобы каждый коммит был логически цельным («исправил баг» отдельно от «добавил функцию»).</p>
        <p>Удаление <code>.git</code> уничтожит всю историю: останутся только текущие файлы, проект перестанет быть репозиторием.</p>`,
    },
  ],
  quiz: [
    { q: 'Чем распределённая VCS отличается от централизованной?', options: ['Она платная', 'У каждого разработчика полная копия истории', 'Она хранит только последние версии', 'Она работает только онлайн'], answer: 1 },
    { q: 'Где Git хранит историю проекта?', options: ['В облаке GitHub', 'В папке .git', 'В файле README', 'В реестре Windows'], answer: 1 },
    { q: 'Что такое staging area (индекс)?', options: ['Удалённый сервер', 'Список веток', 'Набор изменений, которые войдут в следующий коммит', 'Корзина удалённых файлов'], answer: 2 },
  ],
  resources: [
    { title: 'Книга Pro Git (на русском, бесплатно)', url: 'https://git-scm.com/book/ru/v2' },
  ],
});

registerContent('git-basics', {
  intro: `<p>Десяток команд покрывают 90% повседневной работы с Git. В этой теме — создание репозитория, коммиты,
    просмотр истории и отмена изменений.</p>`,
  theory: [
    {
      title: 'Основной цикл',
      html: `<ul>
          <li><code>git init</code> — сделать текущую папку репозиторием;</li>
          <li><code>git status</code> — что изменено, что в индексе (запускайте постоянно!);</li>
          <li><code>git add файл</code> / <code>git add .</code> — добавить в индекс;</li>
          <li><code>git commit -m "Сообщение"</code> — создать коммит;</li>
          <li><code>git log --oneline</code> — история коммитов;</li>
          <li><code>git diff</code> — что изменилось и ещё не в индексе; <code>git diff --staged</code> — что в индексе.</li>
        </ul>`,
    },
    {
      title: 'Хорошие сообщения коммитов',
      html: `<p>Сообщение отвечает на вопрос «что сделает этот коммит?»: <code>Add user registration endpoint</code>, <code>Исправить падение при пустом email</code>.</p>
        <ul>
          <li>Коротко (до ~50–70 символов) в первой строке, детали — после пустой строки;</li>
          <li>Один коммит — одно логическое изменение;</li>
          <li>Многие команды используют <b>Conventional Commits</b>: <code>feat: ...</code>, <code>fix: ...</code>, <code>docs: ...</code>, <code>refactor: ...</code>.</li>
        </ul>
        <p class="note">Плохо: <code>fix</code>, <code>изменения</code>, <code>asdf</code>. Через месяц вы сами не поймёте, что там.</p>`,
    },
    {
      title: '.gitignore',
      html: `<p>Файл <code>.gitignore</code> перечисляет то, что Git не должен отслеживать: виртуальные окружения, кэш, логи, секреты.</p>
        <p class="note">Никогда не коммитьте пароли, токены и файл <code>.env</code>. Даже если удалить их потом, они остаются в истории.
        Если секрет утёк — сразу смените его.</p>`,
    },
    {
      title: 'Отмена изменений',
      html: `<table>
          <tr><th>Ситуация</th><th>Команда</th></tr>
          <tr><td>Отменить изменения файла в рабочей папке</td><td><code>git restore файл</code></td></tr>
          <tr><td>Убрать файл из индекса (изменения останутся)</td><td><code>git restore --staged файл</code></td></tr>
          <tr><td>Исправить сообщение / добавить забытый файл в последний коммит</td><td><code>git commit --amend</code></td></tr>
          <tr><td>Отменить коммит, создав «обратный» коммит (безопасно)</td><td><code>git revert &lt;хеш&gt;</code></td></tr>
          <tr><td>Откатить ветку на коммит назад, сохранив изменения в файлах</td><td><code>git reset HEAD~1</code></td></tr>
          <tr><td>Откатить и удалить изменения (опасно!)</td><td><code>git reset --hard HEAD~1</code></td></tr>
        </table>
        <p><code>HEAD</code> — указатель на текущий коммит, <code>HEAD~1</code> — предыдущий. Временно спрятать изменения: <code>git stash</code>, вернуть — <code>git stash pop</code>.</p>`,
    },
  ],
  examples: [
    {
      title: 'Первый репозиторий',
      lang: 'bash',
      code: String.raw`
mkdir notes-api && cd notes-api
git init

echo "# Notes API" > README.md
git status                 # README.md — untracked
git add README.md
git commit -m "Initial commit"

echo "print('hello')" > main.py
git add main.py
git commit -m "feat: add main script"

git log --oneline
# 3f2a1bc (HEAD -> main) feat: add main script
# 9e8d7c6 Initial commit`,
    },
    {
      title: '.gitignore для Python-проекта',
      lang: 'text',
      code: String.raw`
# Виртуальное окружение
.venv/
venv/

# Кэш Python
__pycache__/
*.pyc

# Секреты и локальные настройки
.env
*.local

# Базы данных и логи
*.sqlite3
*.log

# IDE
.vscode/
.idea/`,
      explain: `<p>Готовые шаблоны для любых языков: <a href="https://github.com/github/gitignore" target="_blank" rel="noopener">github.com/github/gitignore</a>.</p>`,
    },
    {
      title: 'Изучение истории',
      lang: 'bash',
      code: String.raw`
git log --oneline --graph --all     # дерево всех веток
git show 3f2a1bc                    # что изменилось в коммите
git log -p main.py                  # история конкретного файла с изменениями
git blame main.py                   # кто последним менял каждую строку
git diff HEAD~2 HEAD                # разница между коммитами`,
    },
  ],
  tasks: [
    {
      title: 'Версионируйте свой курс',
      level: 'легко',
      text: `<p>Превратите папку <code>backend-course</code> с решениями в Git-репозиторий. Добавьте <code>.gitignore</code> для Python и сделайте
        минимум три коммита с осмысленными сообщениями (например, по одному на тему курса).</p>`,
    },
    {
      title: 'Тренировка отмены',
      level: 'средне',
      text: `<p>В учебном репозитории по очереди: (1) испортите файл и верните его <code>git restore</code>; (2) добавьте файл в индекс и уберите обратно;
        (3) сделайте коммит с опечаткой в сообщении и исправьте через <code>--amend</code>; (4) сделайте коммит и отмените его через <code>git revert</code>.
        После каждого шага смотрите <code>git status</code> и <code>git log --oneline</code>.</p>`,
    },
    {
      title: 'Утёкший секрет',
      level: 'средне',
      text: `<p>Вы закоммитили файл <code>.env</code> с паролем от базы и уже сделали ещё два коммита после. Опишите порядок действий.</p>`,
      solution: `<ol>
          <li><b>Первым делом сменить пароль</b> — считаем его скомпрометированным, особенно если код уже был запушен.</li>
          <li>Добавить <code>.env</code> в <code>.gitignore</code> и убрать файл из отслеживания: <code>git rm --cached .env</code>, закоммитить.</li>
          <li>Если нужно вычистить историю — использовать <code>git filter-repo</code> или BFG Repo-Cleaner и перезаписать удалённую историю (согласовав с командой).</li>
          <li>Создать <code>.env.example</code> с пустыми значениями как образец.</li>
        </ol>`,
    },
  ],
  quiz: [
    { q: 'Какая команда показывает текущее состояние рабочей папки и индекса?', options: ['git log', 'git status', 'git show', 'git diff --staged'], answer: 1 },
    { q: 'Какой способ отмены коммита безопасен для уже опубликованной истории?', options: ['git reset --hard', 'git revert', 'Удалить .git', 'git commit --amend'], answer: 1, explain: 'revert создаёт новый коммит и не переписывает историю, которую уже скачали другие.' },
    { q: 'Что должно попасть в <code>.gitignore</code>?', options: ['main.py', 'README.md', '.venv/ и .env', 'requirements.txt'], answer: 2 },
    { q: 'Что такое <code>HEAD</code>?', options: ['Первый коммит', 'Указатель на текущий коммит', 'Главная ветка на сервере', 'Последний тег'], answer: 1 },
  ],
  resources: [
    { title: 'Pro Git: основы Git', url: 'https://git-scm.com/book/ru/v2/Основы-Git-Создание-Git-репозитория' },
    { title: 'Conventional Commits', url: 'https://www.conventionalcommits.org/ru/v1.0.0/' },
  ],
});

registerContent('git-branches', {
  intro: `<p><b>Ветки</b> — главная суперсила Git. Они позволяют вести несколько линий разработки параллельно: в одной — новая функция,
    в другой — срочное исправление, а <code>main</code> остаётся стабильной.</p>`,
  theory: [
    {
      title: 'Что такое ветка',
      html: `<p>Ветка в Git — это просто <b>подвижный указатель на коммит</b>. Создание ветки мгновенное: копируется не код, а ссылка.
        При новом коммите указатель текущей ветки сдвигается вперёд.</p>
        <ul>
          <li><code>git branch</code> — список веток; <code>git branch feature-x</code> — создать;</li>
          <li><code>git switch feature-x</code> — перейти; <code>git switch -c feature-x</code> — создать и перейти;</li>
          <li><code>git branch -d feature-x</code> — удалить (после слияния).</li>
        </ul>
        <p>Старый синтаксис <code>git checkout</code> делает то же самое — его часто встретите в статьях.</p>`,
    },
    {
      title: 'Слияние (merge)',
      html: `<p><code>git merge feature-x</code> — влить ветку <code>feature-x</code> в текущую. Два варианта:</p>
        <ul>
          <li><b>Fast-forward</b>: если в <code>main</code> не было новых коммитов, указатель просто сдвигается вперёд.</li>
          <li><b>Merge-коммит</b>: если обе ветки ушли вперёд, Git создаёт коммит с двумя родителями.</li>
        </ul>`,
    },
    {
      title: 'Конфликты',
      html: `<p>Если в обеих ветках изменили одни и те же строки, Git не может решить сам и помечает <b>конфликт</b>:</p>
        <pre><code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
PORT = 8000
=======
PORT = 8080
&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature-x</code></pre>
        <p>Порядок разрешения: открыть файл → оставить нужный вариант (или объединить) и удалить маркеры → <code>git add файл</code> → <code>git commit</code>.
        VS Code показывает кнопки «Accept Current / Incoming / Both». Передумали — <code>git merge --abort</code>.</p>`,
    },
    {
      title: 'Rebase и рабочие процессы',
      html: `<p><code>git rebase main</code> «пересаживает» коммиты вашей ветки поверх свежего <code>main</code> — история получается линейной, без merge-коммитов.</p>
        <p class="note">Золотое правило: не делайте rebase веток, которые уже запушены и используются другими — rebase переписывает хеши коммитов.</p>
        <p>Популярные процессы: <b>GitHub Flow</b> — от <code>main</code> создаётся короткая ветка на каждую задачу, затем Pull Request и слияние;
        <b>Trunk-based</b> — очень короткие ветки и частые слияния в main; <b>Git Flow</b> — ветки develop/release/hotfix (для редких релизов).</p>`,
    },
  ],
  examples: [
    {
      title: 'Работа над функцией в ветке',
      lang: 'bash',
      code: String.raw`
git switch -c feature/user-search      # новая ветка от текущей
# ... правим код ...
git add .
git commit -m "feat: add user search endpoint"

git switch main
git merge feature/user-search          # fast-forward, если main не менялась
git branch -d feature/user-search

git log --oneline --graph --all`,
    },
    {
      title: 'Воспроизвести и решить конфликт',
      lang: 'bash',
      code: String.raw`
echo "PORT = 8000" > config.py
git add config.py && git commit -m "Add config"

git switch -c change-port
echo "PORT = 8080" > config.py
git commit -am "Use port 8080"

git switch main
echo "PORT = 9000" > config.py
git commit -am "Use port 9000"

git merge change-port
# CONFLICT (content): Merge conflict in config.py
# → правим config.py вручную, затем:
git add config.py
git commit -m "Merge change-port, keep port 8080"`,
    },
  ],
  tasks: [
    {
      title: 'Две ветки — одна история',
      level: 'средне',
      text: `<p>В учебном репозитории создайте две ветки от <code>main</code>: в <code>feature/a</code> добавьте файл <code>a.py</code>, в <code>feature/b</code> — <code>b.py</code>.
        Слейте обе в <code>main</code>. Посмотрите <code>git log --oneline --graph</code>: где был fast-forward, а где merge-коммит? Почему?</p>`,
      solution: `<p>Первое слияние — fast-forward: в <code>main</code> не было новых коммитов после ответвления. Ко второму слиянию <code>main</code> уже ушла вперёд
        (в ней коммит из <code>feature/a</code>), поэтому Git создаёт merge-коммит с двумя родителями.</p>`,
    },
    {
      title: 'Разрешите конфликт',
      level: 'средне',
      text: `<p>Повторите пример с конфликтом, но решите его так, чтобы порт брался из переменной окружения:
        <code>PORT = int(os.environ.get("PORT", 8080))</code>. Убедитесь, что в файле не осталось маркеров <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>.</p>`,
    },
    {
      title: 'Rebase вместо merge',
      level: 'сложно',
      text: `<p>Создайте ветку, сделайте в ней два коммита. Тем временем добавьте коммит в <code>main</code>. Выполните в ветке <code>git rebase main</code>,
        затем слейте в <code>main</code>. Сравните граф истории с вариантом через merge. Изучите <a href="https://learngitbranching.js.org/?locale=ru_RU" target="_blank" rel="noopener">Learn Git Branching</a> — пройдите первые уровни.</p>`,
    },
  ],
  quiz: [
    { q: 'Что такое ветка в Git технически?', options: ['Копия всех файлов проекта', 'Подвижный указатель на коммит', 'Отдельный репозиторий', 'Архив изменений'], answer: 1 },
    { q: 'Какая команда создаёт ветку и сразу переключается на неё?', options: ['git branch -m x', 'git switch -c x', 'git merge x', 'git init x'], answer: 1 },
    { q: 'Когда merge будет fast-forward?', options: ['Всегда', 'Когда в целевой ветке не было новых коммитов после ответвления', 'Когда есть конфликты', 'Только с флагом --ff-only'], answer: 1 },
    { q: 'Почему нельзя делать rebase общей опубликованной ветки?', options: ['Rebase удаляет файлы', 'Rebase переписывает коммиты, и истории у коллег разойдутся', 'Rebase запрещён на GitHub', 'Это слишком медленно'], answer: 1 },
  ],
  resources: [
    { title: 'Learn Git Branching — интерактивный тренажёр', url: 'https://learngitbranching.js.org/?locale=ru_RU' },
    { title: 'Pro Git: ветвление', url: 'https://git-scm.com/book/ru/v2/Ветвление-в-Git-О-ветвлении-в-двух-словах' },
  ],
});

registerContent('github', {
  intro: `<p>Git работает локально, а для командной работы и резервной копии нужен <b>удалённый репозиторий</b>. Самый популярный хостинг —
    <b>GitHub</b>; аналоги — <b>GitLab</b> и <b>Bitbucket</b>. Ваш GitHub-профиль — ещё и портфолио для работодателя.</p>`,
  theory: [
    {
      title: 'Удалённые репозитории',
      html: `<ul>
          <li><code>git clone URL</code> — скачать репозиторий целиком со всей историей;</li>
          <li><code>git remote add origin URL</code> — привязать локальный репозиторий к удалённому (<code>origin</code> — общепринятое имя);</li>
          <li><code>git push -u origin main</code> — отправить коммиты (флаг <code>-u</code> запоминает связь, дальше достаточно <code>git push</code>);</li>
          <li><code>git pull</code> — забрать и влить изменения с сервера (= <code>git fetch</code> + <code>git merge</code>);</li>
          <li><code>git fetch</code> — только скачать, ничего не меняя в ваших ветках.</li>
        </ul>`,
    },
    {
      title: 'Аутентификация: SSH-ключи',
      html: `<p>Пароль от аккаунта для <code>git push</code> не подходит. Варианты: <b>SSH-ключ</b> (рекомендуется), <b>Personal Access Token</b> по HTTPS
        или GitHub CLI (<code>gh auth login</code>).</p>
        <p>SSH-ключ — пара файлов: приватный (храните в секрете, никому не передавайте) и публичный <code>.pub</code> (его добавляют в настройки GitHub → SSH keys).</p>`,
    },
    {
      title: 'Pull Request и код-ревью',
      html: `<p><b>Pull Request</b> (в GitLab — Merge Request) — предложение влить ветку в <code>main</code>. Это центр командной работы:</p>
        <ol>
          <li>Создаёте ветку, коммитите, пушите её: <code>git push -u origin feature/x</code>;</li>
          <li>На GitHub открываете PR с описанием: что и зачем изменено, как проверить;</li>
          <li>Коллеги оставляют комментарии, автоматически запускаются тесты (CI);</li>
          <li>После одобрения PR вливается (merge / squash / rebase), ветка удаляется.</li>
        </ol>
        <p><b>Fork</b> — ваша копия чужого репозитория; так вносят вклад в open source: fork → ветка → PR в оригинал.</p>`,
    },
    {
      title: 'Возможности платформ',
      html: `<ul>
          <li><b>Issues</b> — задачи и баги; <b>Projects</b> — канбан-доски;</li>
          <li><b>Actions</b> (GitHub) / <b>GitLab CI</b> — автоматический запуск тестов и деплой (раздел CI/CD);</li>
          <li><b>README.md</b> — главная страница проекта, пишется в Markdown;</li>
          <li><b>Releases</b> и теги (<code>git tag v1.0.0</code>) — версии продукта;</li>
          <li><b>GitHub Pages</b> — бесплатный хостинг статических сайтов.</li>
        </ul>
        <p>GitLab популярен в компаниях, которые держат код на своих серверах (self-hosted); у него сильный встроенный CI/CD.</p>`,
    },
  ],
  examples: [
    {
      title: 'SSH-ключ для GitHub',
      lang: 'bash',
      code: String.raw`
ssh-keygen -t ed25519 -C "anna@example.com"   # Enter на все вопросы (или задайте пароль)
cat ~/.ssh/id_ed25519.pub                       # скопируйте вывод
# GitHub → Settings → SSH and GPG keys → New SSH key → вставить

ssh -T git@github.com
# Hi anna! You've successfully authenticated...`,
    },
    {
      title: 'Публикация проекта',
      lang: 'bash',
      code: String.raw`
# 1. На github.com: New repository → notes-api (без README)
# 2. В локальном проекте:
git remote add origin git@github.com:anna/notes-api.git
git branch -M main
git push -u origin main

# Дальше обычный цикл:
git add . && git commit -m "feat: add notes pagination"
git push`,
    },
    {
      title: 'Работа через Pull Request',
      lang: 'bash',
      code: String.raw`
git switch main && git pull           # начинаем со свежей main
git switch -c fix/empty-title
# ... исправления ...
git commit -am "fix: reject empty note title"
git push -u origin fix/empty-title
# GitHub предложит "Compare & pull request"

# Или через GitHub CLI:
gh pr create --title "Reject empty note title" --body "Возвращаем 422 для пустого заголовка"`,
    },
  ],
  tasks: [
    {
      title: 'Ваш первый репозиторий на GitHub',
      level: 'легко',
      text: `<p>Зарегистрируйтесь на GitHub, настройте SSH-ключ и опубликуйте репозиторий <code>backend-course</code> с решениями.
        Напишите <code>README.md</code>: что это за проект, какие темы пройдены, как запустить код.</p>`,
    },
    {
      title: 'PR самому себе',
      level: 'средне',
      text: `<p>В своём репозитории создайте ветку, внесите изменение, запушьте и откройте Pull Request. Оставьте к нему комментарий к конкретной строке,
        затем слейте через «Squash and merge». Обновите локальную <code>main</code> через <code>git pull</code> и удалите ветку локально и на сервере.</p>`,
      hint: `<p>Удалить ветку на сервере: <code>git push origin --delete имя</code> (или кнопкой в интерфейсе PR).</p>`,
    },
    {
      title: 'Опубликуйте API заметок',
      level: 'средне',
      text: `<p>Залейте проект «API заметок» из темы «Первый веб-сервер» в отдельный репозиторий. Проверьте, что в репозиторий не попали <code>.venv</code> и <code>.env</code>,
        есть <code>requirements.txt</code>, а в README описано, как запустить проект с нуля (склонируйте его в другую папку и проверьте по своей же инструкции).</p>`,
    },
  ],
  quiz: [
    { q: 'Чем <code>git fetch</code> отличается от <code>git pull</code>?', options: ['Ничем', 'fetch только скачивает изменения, pull ещё и вливает их в текущую ветку', 'fetch отправляет коммиты на сервер', 'pull работает только с SSH'], answer: 1 },
    { q: 'Какую часть SSH-ключа добавляют в настройки GitHub?', options: ['Приватную', 'Публичную (.pub)', 'Обе', 'Пароль от ключа'], answer: 1 },
    { q: 'Что такое Pull Request?', options: ['Команда git pull', 'Предложение влить изменения ветки с обсуждением и ревью', 'Запрос на доступ к репозиторию', 'Скачивание репозитория'], answer: 1 },
    { q: 'Что такое fork?', options: ['Ветка в вашем репозитории', 'Ваша копия чужого репозитория на платформе', 'Конфликт слияния', 'Тег версии'], answer: 1 },
  ],
  resources: [
    { title: 'GitHub Docs: начало работы', url: 'https://docs.github.com/ru/get-started' },
    { title: 'GitHub Skills — интерактивные курсы', url: 'https://skills.github.com/' },
  ],
});
