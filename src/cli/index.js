// رابط خط فرمان poems-pass
// بدون وابستگی خارجی – پارس آرگومان‌ها دستی انجام می‌شود.

import { generateMany } from '../core/generator.js';
import { poets, stats } from '../core/database.js';

const HELP = `
ppg — Poems Pass Generator | تولید گذرواژه از شعر و ضرب‌المثل فارسی

استفاده:
  ppg [گزینه‌ها]            (نام کامل: poems-pass)

گزینه‌ها:
  -n, --count <عدد>       تعداد گذرواژه‌ها (پیش‌فرض ۱)
  -w, --words <عدد>       تعداد واژه در هر گذرواژه (پیش‌فرض ۳)
  -m, --mode <حالت>       poem | proverb | abstract (پیش‌فرض poem)
      --poet <نام>        فیلتر بر اساس شاعر (مثلاً حافظ)
  -s, --sep <نویسه>       جداکننده‌ی واژه‌ها (پیش‌فرض '-')
  -C, --capitalize        حرف اول هر واژه بزرگ
  -L, --leet              جایگزینی leet-speak (a→@, e→3, ...)
      --no-numbers        بدون عدد
      --no-symbols        بدون نویسه‌ی خاص
      --symbols <ست>      مجموعه‌ی نویسه‌های خاص (پیش‌فرض !@#$%^&*?-_+=)
  -v, --verbose           نمایش منبع شعر و قدرت گذرواژه
      --poets             فهرست شاعران موجود
      --stats             آمار پایگاه داده
  -h, --help              این راهنما

نمونه‌ها:
  ppg
  ppg -n 5 -w 4 --poet حافظ -v
  ppg -m abstract -w 3 -C -L
  ppg -m proverb --no-symbols
`;

function parseArgs(argv) {
  const o = {
    count: 1, words: 3, mode: 'poem', separator: '-',
    capitalize: false, leet: false, numbers: true, symbols: true,
    verbose: false, _action: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case '-n': case '--count': o.count = parseInt(next(), 10); break;
      case '-w': case '--words': o.words = parseInt(next(), 10); break;
      case '-m': case '--mode': o.mode = next(); break;
      case '--poet': o.poet = next(); break;
      case '-s': case '--sep': o.separator = next(); break;
      case '-C': case '--capitalize': o.capitalize = true; break;
      case '-L': case '--leet': o.leet = true; break;
      case '--no-numbers': o.numbers = false; break;
      case '--no-symbols': o.symbols = false; break;
      case '--symbols': o.symbolSet = next(); break;
      case '-v': case '--verbose': o.verbose = true; break;
      case '--poets': o._action = 'poets'; break;
      case '--stats': o._action = 'stats'; break;
      case '-h': case '--help': o._action = 'help'; break;
      default:
        if (a.startsWith('-')) { console.error(`گزینه‌ی ناشناخته: ${a}`); process.exit(1); }
    }
  }
  return o;
}

export function run(argv = process.argv.slice(2)) {
  const o = parseArgs(argv);

  if (o._action === 'help') { console.log(HELP); return; }
  if (o._action === 'poets') { console.log(poets().join('\n')); return; }
  if (o._action === 'stats') {
    const s = stats();
    console.log(`اشعار: ${s.poems}\nضرب‌المثل‌ها: ${s.proverbs}\nشاعران: ${s.poets}\nمجموع واژه‌ها: ${s.totalWords}`);
    return;
  }

  const results = generateMany(o.count, o);
  for (const r of results) {
    if (o.verbose) {
      const m = r.meta;
      const src = m.entry ? `${m.entry.poet || 'ضرب‌المثل'} — ${m.entry.fa}` : 'انتزاعی';
      console.log(`${r.password}`);
      console.log(`  منبع: ${src}`);
      console.log(`  قدرت: ${m.strength} (~${m.entropyBits} بیت) | طول: ${m.length}`);
      console.log('');
    } else {
      console.log(r.password);
    }
  }
}
