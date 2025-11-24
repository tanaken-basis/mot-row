import { toRREF } from "./rref";

export function rankR(A) {
  if (!A || !A.length || !A[0] || !A[0].length) return 0;

  const { final } = toRREF(A, { pivoting: "partialOnZero" });

  let r = 0;
  outer: for (const row of final) {
    for (const x of row) {
      if (!x) continue;
      // Rational { num, den }
      if (x.num !== 0) {
        r++;
        continue outer;
      }
    }
  }
  return r;
}
