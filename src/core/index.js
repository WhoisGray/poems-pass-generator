// نقطه‌ی ورود هسته – همه‌چیزِ موردنیازِ CLI و اکستنشن از اینجا export می‌شود.

export { generate, generateMany, estimateStrength, DEFAULTS } from './generator.js';
export { randomEntry, entryWords, poets, stats, allEntries, DB } from './database.js';
export { pseudoWord, pseudoWords } from './abstract.js';
export { transliterate, toWords } from './transliterate.js';
