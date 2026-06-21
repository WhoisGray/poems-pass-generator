// بارگذاری و پرس‌وجوی پایگاه داده اشعار
// داده به‌صورت import مستقیم بارگذاری می‌شود تا هم در Node و هم در باندل مرورگر کار کند.

import { readFileSync } from 'node:fs';
import { pick } from './random.js';
import { toWords } from './transliterate.js';

// بارگذاری دیتابیس به‌روش بومی Node (سازگار با همه‌ی نسخه‌های ۱۴+ و بدون هشدار).
// در ساختِ اکستنشن، این خط به import یک ماژول مرورگری بازنویسی می‌شود. (DATA_LOADER)
const data = JSON.parse(readFileSync(new URL('../../data/poems.json', import.meta.url), 'utf8'));

export const DB = data;

/** همه‌ی مدخل‌ها (شعر + ضرب‌المثل) */
export function allEntries() {
  return [...DB.poems, ...DB.proverbs];
}

/** فهرست شاعران موجود */
export function poets() {
  return [...new Set(DB.poems.map((p) => p.poet))];
}

/**
 * یک مدخل تصادفی برمی‌گرداند.
 * @param {object} opts
 * @param {'all'|'poems'|'proverbs'} opts.source
 * @param {string} [opts.poet] فیلتر بر اساس شاعر
 */
export function randomEntry({ source = 'all', poet } = {}) {
  let pool =
    source === 'poems' ? DB.poems :
    source === 'proverbs' ? DB.proverbs :
    allEntries();
  if (poet) pool = pool.filter((e) => e.poet === poet);
  if (!pool.length) throw new Error('هیچ مدخلی با این فیلترها یافت نشد.');
  return pick(pool);
}

/** واژه‌های لاتین یک مدخل را برمی‌گرداند */
export function entryWords(entry) {
  return toWords(entry.fg);
}

/** آمار پایگاه داده */
export function stats() {
  return {
    poems: DB.poems.length,
    proverbs: DB.proverbs.length,
    poets: poets().length,
    totalWords: allEntries().reduce((s, e) => s + entryWords(e).length, 0)
  };
}
