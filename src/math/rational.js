export function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b !== 0) { const t = a % b; a = b; b = t; }
  return a || 1;
}

export function normalize(n, d) {
  if (d === 0) throw new Error('Zero denominator');
  if (n === 0) return { n: 0, d: 1, num: 0, den: 1 };
  const g = gcd(n, d);
  n /= g; d /= g;
  if (d < 0) { n = -n; d = -d; }
  return { n, d, num: n, den: d };
}

export function fromInt(k) {
  if (!Number.isFinite(k)) return normalize(0, 1);
  return normalize(Math.trunc(k), 1);
}

function normalizeNumericString(raw) {
  if (raw == null) return '';
  let t = String(raw).trim();
  
  t = t.replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFF10 + 0x30));
  
  t = t
    .replace(/\u2212|\uFF0D/g, '-')  
    .replace(/\uFF0F/g, '/');        
  
  t = t.replace(/,/g, '');
  
  t = t.replace(/\s*\/\s*/g, '/').replace(/\s+/g, ' ').trim();
  return t;
}

export function fromString(s, { loose = true } = {}) {
  const t = normalizeNumericString(s);
  if (t === '') return normalize(0, 1);

  if (t.includes('/')) {
    const [aRaw, bRaw] = t.split('/');
    const a = Number(aRaw);
    const b = Number(bRaw);
    if (Number.isFinite(a) && Number.isFinite(b) && b !== 0) {
      return normalize(a, b);
    }
    if (!loose) throw new Error('fromString: invalid fraction');
    return normalize(0, 1);
  }

  const v = Number(t);
  if (Number.isFinite(v)) return fromNumber(v);
  if (!loose) throw new Error('fromString: invalid');
  return normalize(0, 1);
}

export function fromNumber(x) {
  if (!Number.isFinite(x)) return normalize(0, 1);
  if (Number.isInteger(x)) return normalize(x, 1);
  const s = x.toString();
  const k = s.includes('.') ? s.split('.')[1].length : 0;
  const num = Math.round(x * 10 ** k);
  return normalize(num, 10 ** k);
}

export function R(x) {
  if (typeof x === 'object' && x) {
    if (Number.isInteger(x.n) && Number.isInteger(x.d)) return normalize(x.n, x.d);
    if (Number.isInteger(x.num) && Number.isInteger(x.den)) return normalize(x.num, x.den);
  }
  if (typeof x === 'number') return fromNumber(x);
  if (typeof x === 'string') return fromString(x, { loose: true });
  return normalize(0, 1);
}

export function add(a, b) { a = R(a); b = R(b); return normalize(a.n*b.d + b.n*a.d, a.d*b.d); }
export function sub(a, b) { a = R(a); b = R(b); return normalize(a.n*b.d - b.n*a.d, a.d*b.d); }
export function mul(a, b) { a = R(a); b = R(b); return normalize(a.n*b.n, a.d*b.d); }
export function div(a, b) { a = R(a); b = R(b); if (b.n === 0) return normalize(0,1); return normalize(a.n*b.d, a.d*b.n); }
export function neg(a) { a = R(a); return { n: -a.n, d: a.d, num: -a.n, den: a.d }; }

export function isZero(a) { return R(a).n === 0; }
export function isOne(a) { const v = R(a); return v.n === 1 && v.d === 1; };
export function eq(a, b) { a = R(a); b = R(b); return a.n === b.n && a.d === b.d; }
export function compare(a, b) {
  a = R(a); b = R(b);
  const left = a.n * b.d, right = b.n * a.d;
  return left === right ? 0 : (left < right ? -1 : 1);
}

export function toFractionString(a) {
  a = R(a);
  return a.d === 1 ? `${a.n}` : `${a.n}/${a.d}`;
}
export function toDecimalString(a, digits = 6) {
  a = R(a);
  return (a.n / a.d).toFixed(digits);
}

R.fromInt = fromInt;
R.fromNumber = fromNumber;
R.fromString = fromString;
R.add = add;
R.sub = sub;
R.mul = mul;
R.div = div;
R.neg = neg;
R.isZero = isZero;
R.isOne = isOne;
R.eq = eq;
R.compare = compare;
R.toFractionString = toFractionString
R.toDecimalString = toDecimalString
