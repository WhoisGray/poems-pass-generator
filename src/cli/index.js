// رابط خط فرمان poems-pass
// بدون وابستگی خارجی – پارس آرگومان‌ها دستی انجام می‌شود.

import { generateMany } from '../core/generator.js';
import { poets, stats } from '../core/database.js';

const HELP = `
ppg — Poems Pass Generator | memorable passwords from Persian poetry

Usage:
  ppg [options]            (full name: poems-pass)

Options:
  -n, --count <num>       Number of passwords (default 1)
  -w, --words <num>       Words per password (default 3)
  -m, --mode <mode>       poem | proverb | abstract (default poem)
      --poet <name>       Filter by poet (Persian name, e.g. حافظ)
  -s, --sep <char>        Word separator (default '-')
  -C, --capitalize        Capitalize first letter of each word
  -L, --leet              Apply leet-speak (a->@, e->3, ...)
      --no-numbers        Do not append digits
      --no-symbols        Do not append a special character
      --symbols <set>     Special-character set (default !@#$%^&*?-_+=)
  -v, --verbose           Show poem source and password strength
      --poets             List available poets
      --stats             Show database statistics
  -h, --help              Show this help

Examples:
  ppg
  ppg -n 5 -w 4 -v
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
        if (a.startsWith('-')) { console.error(`Unknown option: ${a}`); process.exit(1); }
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
    console.log(`Poems: ${s.poems}\nProverbs: ${s.proverbs}\nPoets: ${s.poets}\nTotal words: ${s.totalWords}`);
    return;
  }

  const results = generateMany(o.count, o);
  for (const r of results) {
    if (o.verbose) {
      const m = r.meta;
      // Latin transliteration as source so it renders on any terminal.
      const src = m.entry ? (m.entry.fg + (m.entry.poet ? ` (${m.entry.poet})` : '')) : 'abstract';
      console.log(`${r.password}`);
      console.log(`  source: ${src}`);
      console.log(`  strength: ${m.strength} (~${m.entropyBits} bits) | length: ${m.length}`);
      console.log('');
    } else {
      console.log(r.password);
    }
  }
}
