#!/usr/bin/env node
// هسته و دیتابیس را داخل پوشه‌ی اکستنشن کپی می‌کند تا اکستنشن خودکفا شود.
// چون مرورگر به node:fs دسترسی ندارد، دیتابیس به یک ماژول ES تبدیل و
// خط بارگذاریِ database.js به import آن ماژول بازنویسی می‌شود.

import { cp, rm, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dest = join(root, 'extension', 'lib');

await rm(dest, { recursive: true, force: true });
await mkdir(join(dest, 'data'), { recursive: true });

// ۱) کپی هسته (با حفظ ساختار src/ تا importهای نسبی دست‌نخورده بمانند)
await cp(join(root, 'src'), join(dest, 'src'), { recursive: true });

// ۲) ساخت ماژول ES از دیتابیس برای مرورگر
const json = await readFile(join(root, 'data', 'poems.json'), 'utf8');
await writeFile(
  join(dest, 'data', 'poems.module.js'),
  `// تولید خودکار توسط build-extension.js — ویرایش نکنید.\nexport default ${json.trim()};\n`
);

// ۳) بازنویسی بارگذارِ Node در نسخه‌ی مرورگریِ database.js
const dbPath = join(dest, 'src', 'core', 'database.js');
let db = await readFile(dbPath, 'utf8');
db = db
  .replace(/import \{ readFileSync \} from 'node:fs';\n/, '')
  .replace(
    /const data = JSON\.parse\(readFileSync\([^;]*\);/,
    "import data from '../../data/poems.module.js';"
  );
await writeFile(dbPath, db);

console.log('✓ اکستنشن ساخته شد: extension/lib (هسته + دیتابیسِ مرورگری)');
