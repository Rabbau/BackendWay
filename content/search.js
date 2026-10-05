// Раздел: Поисковые движки

registerContent('elasticsearch', {
  intro: `<p>Поиск <code>WHERE title ILIKE '%питон%'</code> не найдёт «Python», «питоне» и «питоны», не учтёт опечатки, не отсортирует по релевантности и на миллионах строк будет медленным.
    <b>Поисковые движки</b> решают это иначе — через обратный индекс. Самый популярный — <b>Elasticsearch</b> (и его open-source форк <b>OpenSearch</b>).</p>`,
  theory: [
    {
      title: 'Обратный индекс',
      html: `<p>Как предметный указатель в конце книги: для каждого слова хранится список документов, где оно встречается.</p>
        <pre><code>"python"  → [doc1, doc5, doc9]
"fastapi" → [doc5]
"быстрый" → [doc1, doc9]</code></pre>
        <p>Перед индексацией текст проходит <b>анализ</b>: разбиение на слова (токенизация), приведение к нижнему регистру, удаление стоп-слов («и», «в»),
        <b>стемминг</b> (питоне, питоны → питон), синонимы. Тот же анализ применяется к запросу — поэтому «Питоны» найдёт «питоне».</p>
        <p>Результаты сортируются по <b>релевантности</b> (алгоритм BM25): редкие слова и совпадения в заголовке весят больше.</p>`,
    },
    {
      title: 'Основные понятия',
      html: `<ul>
          <li><b>Индекс</b> — коллекция документов (аналог таблицы); <b>документ</b> — JSON-объект.</li>
          <li><b>Mapping</b> — схема полей: <code>text</code> (анализируется, для полнотекстового поиска), <code>keyword</code> (точное значение: фильтры, сортировка, агрегации), <code>date</code>, числа, <code>dense_vector</code>.</li>
          <li><b>Шарды и реплики</b> — индекс делится на части по узлам кластера и копируется для отказоустойчивости.</li>
          <li><b>Query DSL</b> — JSON-язык запросов: <code>match</code>, <code>multi_match</code>, <code>bool</code> (must / filter / should), <code>fuzziness</code> для опечаток, подсветка совпадений, агрегации (фасеты).</li>
        </ul>`,
    },
    {
      title: 'Elasticsearch рядом с основной БД',
      html: `<p>Elasticsearch — <b>не основная база данных</b>: нет транзакций, данные становятся доступными для поиска с задержкой (~1 с, near real-time). Источник правды — PostgreSQL, а в поисковый индекс данные <b>синхронизируются</b>:</p>
        <ul>
          <li>при изменении записи отправлять событие и обновлять документ (через брокер — тема Kafka);</li>
          <li>CDC: Debezium читает журнал изменений PostgreSQL;</li>
          <li>периодическая полная переиндексация.</li>
        </ul>
        <p class="note">Для небольших объёмов не спешите добавлять отдельную систему: в PostgreSQL есть полнотекстовый поиск (<code>tsvector</code>, русский словарь) и триграммы <code>pg_trgm</code> для опечаток. Легковесные альтернативы Elasticsearch — Meilisearch, Typesense.</p>`,
    },
  ],
  examples: [
    {
      title: 'Запуск и первые запросы',
      lang: 'bash',
      code: String.raw`
docker run -d --name es -p 9200:9200 -e discovery.type=single-node \
  -e xpack.security.enabled=false -e ES_JAVA_OPTS="-Xms512m -Xmx512m" \
  docker.elastic.co/elasticsearch/elasticsearch:8.15.0

curl -X PUT localhost:9200/notes -H "Content-Type: application/json" -d '{
  "settings": {"analysis": {"analyzer": {"default": {"type": "russian"}}}},
  "mappings": {"properties": {
    "title": {"type": "text"}, "body": {"type": "text"},
    "tags": {"type": "keyword"}, "user_id": {"type": "keyword"}, "created_at": {"type": "date"}
  }}
}'`,
    },
    {
      title: 'Индексация и поиск из Python',
      lang: 'python',
      code: String.raw`
# pip install "elasticsearch>=8,<9"
from elasticsearch import Elasticsearch, helpers

es = Elasticsearch("http://localhost:9200")

notes = [
    {"id": 1, "title": "Изучаю Python", "body": "FastAPI и питоновские декораторы", "tags": ["python"], "user_id": "1"},
    {"id": 2, "title": "Рецепт пирога", "body": "Яблоки, мука, сахар", "tags": ["еда"], "user_id": "1"},
]
helpers.bulk(es, ({"_index": "notes", "_id": n["id"], "_source": n} for n in notes), refresh=True)

resp = es.search(index="notes", query={
    "bool": {
        "must": {"multi_match": {
            "query": "питон декоратор",
            "fields": ["title^2", "body"],     # совпадение в заголовке весит вдвое больше
            "fuzziness": "AUTO",               # прощает опечатки
        }},
        "filter": [{"term": {"user_id": "1"}}],   # фильтр не влияет на релевантность и кэшируется
    }
}, highlight={"fields": {"body": {}}})

for hit in resp["hits"]["hits"]:
    print(round(hit["_score"], 2), hit["_source"]["title"], hit.get("highlight"))`,
    },
    {
      title: 'Альтернатива: полнотекстовый поиск в PostgreSQL',
      lang: 'sql',
      code: String.raw`
ALTER TABLE notes ADD COLUMN search tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('russian', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('russian', coalesce(body, '')), 'B')
  ) STORED;
CREATE INDEX idx_notes_search ON notes USING GIN (search);

SELECT id, title, ts_rank(search, q) AS rank
FROM notes, websearch_to_tsquery('russian', 'питон декораторы') AS q
WHERE search @@ q AND user_id = 1
ORDER BY rank DESC
LIMIT 20;`,
    },
  ],
  tasks: [
    {
      title: 'Поиск по заметкам',
      level: 'средне',
      text: `<p>Добавьте в API заметок <code>GET /notes/search?q=</code> на полнотекстовом поиске PostgreSQL (tsvector + GIN). Проверьте, что «декораторы» находит «декоратор», а пользователь ищет только по своим заметкам.</p>`,
    },
    {
      title: 'Elasticsearch с синхронизацией',
      level: 'сложно',
      text: `<p>Переведите поиск на Elasticsearch: при создании, изменении и удалении заметки воркер (из темы RabbitMQ или Kafka) обновляет индекс. Добавьте исправление опечаток, подсветку и фасеты по тегам (агрегация <code>terms</code>).
        Напишите скрипт полной переиндексации из PostgreSQL на случай рассинхронизации.</p>`,
    },
  ],
  quiz: [
    { q: 'Что такое обратный индекс?', options: ['Индекс в обратном порядке', 'Словарь: слово → список документов, где оно встречается', 'Копия таблицы', 'B-tree по id'], answer: 1 },
    { q: 'Какой тип поля в Elasticsearch использовать для фильтра по тегу?', options: ['text', 'keyword', 'dense_vector', 'nested'], answer: 1 },
    { q: 'Должен ли Elasticsearch быть основной базой данных?', options: ['Да, он заменяет PostgreSQL', 'Нет, обычно это вторичный индекс, синхронизируемый с основной БД', 'Только для денег', 'Только в микросервисах'], answer: 1 },
  ],
  resources: [
    { title: 'Elasticsearch: Getting started', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started.html' },
    { title: 'PostgreSQL: полнотекстовый поиск', url: 'https://postgrespro.ru/docs/postgresql/current/textsearch' },
    { title: 'Meilisearch', url: 'https://www.meilisearch.com/docs' },
  ],
});

registerContent('solr', {
  intro: `<p><b>Apache Solr</b> — поисковый движок на той же библиотеке <b>Lucene</b>, что и Elasticsearch, и старше его (2004). Используется в корпоративном поиске, электронной коммерции, библиотеках и СМИ.</p>`,
  theory: [
    {
      title: 'Solr vs Elasticsearch',
      html: `<ul>
          <li>Оба: обратный индекс Lucene, анализаторы, релевантность, фасеты, шардирование (в Solr — режим SolrCloud).</li>
          <li>Solr: конфигурация в XML (<code>schema</code>, <code>solrconfig.xml</code>), сильные возможности поиска «из коробки», полностью под лицензией Apache.</li>
          <li>Elasticsearch: JSON-API, проще начать, богаче экосистема (Kibana, наблюдаемость, логи).</li>
        </ul>
        <p>Для нового проекта чаще выбирают Elasticsearch/OpenSearch или лёгкие Meilisearch/Typesense. С Solr вы встретитесь в существующих системах — принципы те же.</p>`,
    },
  ],
  examples: [
    {
      title: 'Запуск и запрос',
      lang: 'bash',
      code: String.raw`
docker run -d --name solr -p 8983:8983 solr:9 solr-precreate notes
curl -X POST "localhost:8983/solr/notes/update?commit=true" -H "Content-Type: application/json" \
  -d '[{"id": "1", "title_t": "Изучаю Python", "tags_ss": ["python"]}]'
curl "localhost:8983/solr/notes/select?q=title_t:python&facet=true&facet.field=tags_ss"
# Админка: http://localhost:8983/solr`,
      explain: `<p>Суффиксы <code>_t</code> (текст) и <code>_ss</code> (массив строк) — динамические поля схемы по умолчанию.</p>`,
    },
  ],
  tasks: [
    {
      title: 'Тот же поиск в Solr',
      level: 'средне',
      text: `<p>Загрузите в Solr те же заметки, что и в Elasticsearch, и выполните аналогичные запросы: поиск по тексту, фильтр по тегу, фасеты. Сравните удобство API.</p>`,
    },
  ],
  quiz: [
    { q: 'На какой библиотеке построены и Solr, и Elasticsearch?', options: ['PostgreSQL', 'Apache Lucene', 'Redis', 'Kafka'], answer: 1 },
  ],
  resources: [
    { title: 'Solr Tutorial', url: 'https://solr.apache.org/guide/solr/latest/getting-started/solr-tutorial.html' },
  ],
});
