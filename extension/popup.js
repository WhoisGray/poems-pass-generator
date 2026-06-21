// منطق پاپ‌آپ اکستنشن – از هسته‌ی کپی‌شده در lib/ استفاده می‌کند.
import { generate } from './lib/src/core/index.js';
import { poets } from './lib/src/core/database.js';

const $ = (id) => document.getElementById(id);

// پر کردن فهرست شاعران
for (const p of poets()) {
  const opt = document.createElement('option');
  opt.value = p; opt.textContent = p;
  $('poet').appendChild(opt);
}

function readOptions() {
  return {
    mode: $('mode').value,
    words: parseInt($('words').value, 10) || 3,
    separator: $('sep').value,
    poet: $('poet').value || undefined,
    numbers: $('numbers').checked,
    symbols: $('symbols').checked,
    capitalize: $('capitalize').checked,
    leet: $('leet').checked,
  };
}

// برچسب قدرت از هسته انگلیسی است؛ اینجا برای نمایش به فارسی و رنگ نگاشت می‌شود.
const STRENGTH_FA = {
  'weak': 'ضعیف', 'medium': 'متوسط', 'strong': 'قوی', 'very strong': 'بسیار قوی',
};
const STRENGTH_COLOR = {
  'weak': 'var(--bad)', 'medium': 'var(--mid)',
  'strong': 'var(--good)', 'very strong': 'var(--good)',
};

function render() {
  const r = generate(readOptions());
  $('password').textContent = r.password;

  const m = r.meta;
  const pct = Math.min(100, (m.entropyBits / 90) * 100);
  $('bar').style.width = pct + '%';
  $('bar').style.background = STRENGTH_COLOR[m.strength] || 'var(--mid)';

  const src = m.entry ? (m.entry.poet ? `${m.entry.poet}: ${m.entry.fa}` : m.entry.fa) : 'واژه‌های انتزاعی';
  const strengthFa = STRENGTH_FA[m.strength] || m.strength;
  $('meta').textContent = `${strengthFa} · ~${m.entropyBits} بیت · ${src}`;
}

// نمایش/مخفی‌سازی فیلتر شاعر بسته به حالت
$('mode').addEventListener('change', () => {
  $('poetWrap').style.display = $('mode').value === 'poem' ? '' : 'none';
});

$('gen').addEventListener('click', render);
$('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('password').textContent);
    $('copy').textContent = '✅';
    setTimeout(() => ($('copy').textContent = '📋'), 1000);
  } catch (e) { /* clipboard ممکن است در دسترس نباشد */ }
});

render();
