// Реестр контента тем. Файлы из content/ вызывают registerContent(id, data).
//
// Формат data:
// {
//   intro:     'HTML — вводный абзац',
//   theory:    [{ title, html }],
//   examples:  [{ title, lang, code, explain? }],
//   tasks:     [{ title, level: 'легко'|'средне'|'сложно', text, hint?, solution?, solutionCode?, solutionLang? }],
//   quiz:      [{ q, options: [...], answer: index, explain? }],
//   resources: [{ title, url }]
// }
// Для кода используйте String.raw`...`, чтобы обратные слэши (\n) не превращались в символы.
window.CONTENT = {};

function registerContent(id, data) {
  window.CONTENT[id] = data;
}
