
import { R } from './rational.js';

const cloneMat = (A) => A.map(row => row.map(x => R(x)));

export function swapRows(A, i, j) {
  const B = cloneMat(A);
  [B[i], B[j]] = [B[j], B[i]];
  return { matrix: B, op: { type: 'swap', i, j } };
}

export function scaleRow(A, i, k) {
  const B = cloneMat(A);
  const rk = R(k);
  if (rk.n === 0) throw new Error('Scale factor cannot be zero');
  B[i] = B[i].map(x => R.mul(R(x), rk));
  return { matrix: B, op: { type: 'scale', i, k: rk } };
}

export function addRows(A, i, j, k) {
  const B = cloneMat(A);
  const rk = R(k);
  B[i] = B[i].map((x, c) => R.add(R(x), R.mul(R(A[j][c]), rk)));
  return { matrix: B, op: { type: 'add', i, j, k: rk } };
}
