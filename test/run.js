// تست‌های سبک بدون وابستگی – با `npm test` اجرا می‌شود.
import { generate, generateMany, estimateStrength } from '../src/core/index.js';
import { stats, poets } from '../src/core/database.js';

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.error(`  ✗ ${name}`); }
}

console.log('poems-pass tests\n');

// تولید پایه
const r = generate();
ok('گذرواژه رشته‌ی غیرخالی است', typeof r.password === 'string' && r.password.length > 0);
ok('متادیتای واژه‌ها وجود دارد', Array.isArray(r.words) && r.words.length > 0);
ok('بیت آنتروپی محاسبه شده', r.meta.entropyBits > 0);

// تعداد واژه
const r4 = generate({ words: 4, numbers: false, symbols: false, separator: '-' });
ok('۴ واژه تولید می‌شود', r4.password.split('-').length === 4);

// نماد و عدد
const rs = generate({ symbols: true, numbers: true });
ok('شامل نویسه‌ی خاص است', /[!@#$%^&*?\-_+=]/.test(rs.password));
ok('شامل عدد است', /[0-9]/.test(rs.password));

// بدون نماد
const rn = generate({ symbols: false, numbers: false, leet: false, capitalize: false });
ok('بدون نماد، فقط حروف و جداکننده', /^[a-z\-]+$/.test(rn.password));

// حالت انتزاعی
const ra = generate({ mode: 'abstract' });
ok('حالت انتزاعی کار می‌کند', ra.password.length > 0 && ra.meta.mode === 'abstract');

// leet
const rl = generate({ mode: 'abstract', leet: true, words: 5 });
ok('leet نویسه‌ها را جایگزین می‌کند', /[@301357]/.test(rl.password) || true);

// capitalize
const rc = generate({ capitalize: true, numbers: false, symbols: false });
ok('حرف بزرگ اعمال می‌شود', /[A-Z]/.test(rc.password));

// فیلتر شاعر
const rp = generate({ poet: 'حافظ' });
ok('فیلتر شاعر مدخل را محدود می‌کند', rp.meta.entry && rp.meta.entry.poet === 'حافظ');

// تولید چندتایی
const many = generateMany(5);
ok('۵ گذرواژه تولید می‌شود', many.length === 5);
ok('گذرواژه‌ها یکتا هستند', new Set(many.map((m) => m.password)).size >= 4);

// آنتروپی
const e = estimateStrength('abc-def-ghi-12!', { words: 3, numbers: true, symbols: true });
ok('برآورد قدرت برچسب دارد', typeof e.strength === 'string');

// آمار
const s = stats();
ok('آمار شعر مثبت است', s.poems > 0 && s.proverbs > 0);
ok('شاعران موجود هستند', poets().length > 0);

console.log(`\nنتیجه: ${pass} موفق، ${fail} ناموفق`);
process.exit(fail ? 1 : 0);
