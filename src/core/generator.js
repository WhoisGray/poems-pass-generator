// هسته‌ی تولید گذرواژه
// واژه‌ها را از شعر/ضرب‌المثل یا حالت انتزاعی می‌گیرد و با تنظیمات کاربر سرهم می‌کند.

import { randomEntry, entryWords } from './database.js';
import { pseudoWords } from './abstract.js';
import { pick, randInt, chance } from './random.js';

const SPECIALS = '!@#$%^&*?-_+=';
const DIGITS = '0123456789';

const LEET = { a: '@', e: '3', i: '1', o: '0', s: '5', t: '7' };

export const DEFAULTS = {
  mode: 'poem',        // 'poem' | 'proverb' | 'abstract'
  poet: undefined,     // فیلتر شاعر (فقط حالت poem)
  words: 3,            // تعداد واژه‌ها
  separator: '-',      // جداکننده‌ی واژه‌ها
  capitalize: false,   // حرف اول هر واژه بزرگ
  leet: false,         // جایگزینی leet-speak
  numbers: true,       // افزودن عدد
  symbols: true,       // افزودن نویسه‌ی خاص
  symbolSet: SPECIALS, // مجموعه‌ی نویسه‌های خاص مجاز
  minWordLen: 2,       // حداقل طول واژه‌ی انتخابی
  maxWordLen: 9,       // حداکثر طول واژه‌ی انتخابی
};

function applyLeet(w) {
  return w.replace(/[aeiost]/g, (c) => (chance(0.6) ? (LEET[c] || c) : c));
}

function capWord(w) {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/** واژه‌های منبع را بر اساس حالت انتخاب می‌کند و متادیتای منبع را برمی‌گرداند */
function sourceWords(opts) {
  if (opts.mode === 'abstract') {
    return { words: pseudoWords(Math.max(opts.words, 1)), source: { mode: 'abstract' } };
  }
  const src = opts.mode === 'proverb' ? 'proverbs' : 'poems';
  const entry = randomEntry({ source: src, poet: opts.poet });
  let words = entryWords(entry).filter(
    (w) => w.length >= opts.minWordLen && w.length <= opts.maxWordLen
  );
  if (words.length < opts.words) words = entryWords(entry); // اگر فیلتر طول خیلی سخت‌گیر بود
  return { words, entry, source: { mode: opts.mode, entry } };
}

/** n واژه از آرایه انتخاب می‌کند؛ ترتیبِ پیوسته اگر ممکن باشد (برای حفظ آهنگ شعر) */
function takeWords(words, n) {
  if (words.length <= n) return words.slice();
  const start = randInt(words.length - n + 1);
  return words.slice(start, start + n);
}

/**
 * یک گذرواژه تولید می‌کند.
 * @param {Partial<typeof DEFAULTS>} options
 * @returns {{ password: string, words: string[], meta: object }}
 */
export function generate(options = {}) {
  const opts = { ...DEFAULTS, ...options };
  const { words: pool, source } = sourceWords(opts);

  let chosen = takeWords(pool, opts.words);

  if (opts.leet) chosen = chosen.map(applyLeet);
  if (opts.capitalize) chosen = chosen.map(capWord);

  let pw = chosen.join(opts.separator);

  if (opts.numbers) {
    pw += (opts.separator || '') + DIGITS[randInt(10)] + DIGITS[randInt(10)];
  }
  if (opts.symbols) {
    const set = opts.symbolSet || SPECIALS;
    pw += set[randInt(set.length)];
  }

  return {
    password: pw,
    words: chosen,
    meta: {
      ...source,
      length: pw.length,
      ...estimateStrength(pw, opts),
    },
  };
}

/** چند گذرواژه تولید می‌کند (مثل pwgen) */
export function generateMany(count, options = {}) {
  return Array.from({ length: count }, () => generate(options));
}

// ---------- برآورد قدرت (آنتروپی) ----------

/** اندازه‌ی فضای نویسه‌ها بر اساس محتوای گذرواژه */
function charsetSize(pw) {
  let size = 0;
  if (/[a-z]/.test(pw)) size += 26;
  if (/[A-Z]/.test(pw)) size += 26;
  if (/[0-9]/.test(pw)) size += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) size += 20;
  return size || 1;
}

/**
 * برآورد آنتروپی. دو دیدگاه:
 *  - charBits: آنتروپی بر مبنای فضای نویسه (محافظه‌کارانه برای حمله‌ی brute-force نویسه‌ای)
 *  - wordBits: آنتروپی واقعی بر مبنای تعداد ترکیب واژه‌ها (مدل حمله‌ی واژه‌نامه‌ای)
 */
export function estimateStrength(pw, opts = DEFAULTS) {
  const charBits = Math.round(pw.length * Math.log2(charsetSize(pw)));

  // مدل واژه‌نامه‌ای: فرض دایره‌ی واژگان ~۲۰۰، به‌علاوه عدد/نماد
  const vocab = 200;
  let wordBits = (opts.words || 3) * Math.log2(vocab);
  if (opts.numbers) wordBits += Math.log2(100);
  if (opts.symbols) wordBits += Math.log2((opts.symbolSet || SPECIALS).length);
  if (opts.capitalize) wordBits += opts.words || 3;
  wordBits = Math.round(wordBits);

  const bits = Math.min(charBits, wordBits); // ضعیف‌ترین حلقه
  return {
    entropyBits: bits,
    charEntropyBits: charBits,
    wordEntropyBits: wordBits,
    strength: rate(bits),
  };
}

function rate(bits) {
  if (bits < 40) return 'ضعیف';
  if (bits < 60) return 'متوسط';
  if (bits < 80) return 'قوی';
  return 'بسیار قوی';
}
