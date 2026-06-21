#!/usr/bin/env node
// اکستنشن ساخته‌شده را در یک فایل zip آماده‌ی بارگذاری در فروشگاه/Release بسته‌بندی می‌کند.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { rmSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'poems-pass-extension.zip');

rmSync(out, { force: true });
// از داخل پوشه‌ی extension زیپ می‌گیریم تا ساختار مسیرها درست بماند.
execFileSync('zip', ['-r', '-q', out, '.'], { cwd: join(root, 'extension') });
console.log('✓ بسته‌بندی شد: poems-pass-extension.zip');
