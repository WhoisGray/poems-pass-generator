// تولید انتزاعی: ساخت واژه‌های شبه‌فارسیِ تلفظ‌پذیر از روی هجاها
// خروجی واژه‌هایی مثل: gofta, daram, mehro, saraan ...

import { DB } from './database.js';
import { pick, randInt } from './random.js';

const S = DB.syllables;

/** یک هجا می‌سازد: onset + nucleus + coda */
function syllable() {
  return pick(S.onsets) + pick(S.nuclei) + pick(S.codas);
}

/** یک واژه‌ی شبه‌فارسی با ۱ تا ۳ هجا می‌سازد */
export function pseudoWord({ minSyll = 1, maxSyll = 3 } = {}) {
  const n = minSyll + randInt(maxSyll - minSyll + 1);
  let w = '';
  for (let i = 0; i < n; i++) w += syllable();
  return w;
}

/** آرایه‌ای از واژه‌های شبه‌فارسی */
export function pseudoWords(count, opts) {
  return Array.from({ length: count }, () => pseudoWord(opts));
}
