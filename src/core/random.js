// منبع تصادفی امن (CSPRNG) با fallback برای محیط‌های مختلف
// در مرورگر و Node ۲۰+: globalThis.crypto
// در Node ۱۸ (که crypto سراسری ندارد): import پویای node:crypto

function fromGlobal() {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
    return globalThis.crypto;
  }
  return null;
}

let cryptoObj = fromGlobal();
if (!cryptoObj) {
  // فقط در Node اجرا می‌شود؛ مرورگر چون crypto سراسری دارد به اینجا نمی‌رسد.
  try {
    const mod = await import('node:crypto');
    cryptoObj = mod.webcrypto;
  } catch (e) { /* در دسترس نیست */ }
}
if (!cryptoObj || !cryptoObj.getRandomValues) {
  throw new Error('هیچ منبع تصادفی امنی در دسترس نیست (CSPRNG).');
}

/** عدد تصادفی امن صحیح در بازه [0, max) بدون بایاس پیمانه‌ای */
export function randInt(max) {
  if (max <= 0) throw new Error('max باید مثبت باشد');
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  let x;
  do {
    cryptoObj.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % max;
}

/** انتخاب امن یک عضو از آرایه */
export function pick(arr) {
  return arr[randInt(arr.length)];
}

/** بولین تصادفی با احتمال p */
export function chance(p = 0.5) {
  return randInt(1_000_000) / 1_000_000 < p;
}
