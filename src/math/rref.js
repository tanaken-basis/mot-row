
import { R } from './rational.js';
import { swapRows, scaleRow, addRows } from './rowOps.js';

function findNonZeroRow(A, startRow, col) {
  for (let r = startRow; r < A.length; r++) {
    if (!R.isZero(A[r][col])) return r;
  }
  return -1;
}

function findMaxAbsRow(A, startRow, col) {
  let best = -1, bestAbs = -1;
  for (let r = startRow; r < A.length; r++) {
    const v = R(A[r][col]);
    const abs = Math.abs(v.n / v.d);
    if (abs > bestAbs && abs !== 0) { bestAbs = abs; best = r; }
  }
  return best;
}

const cloneMat = (A) => A.map(row => row.map(x => R(x)));

export function toREF(A, options = {}) {
  const pivoting = options.pivoting ?? 'none'; 
  const steps = [];
  let B = cloneMat(A);
  const m = B.length, n = B[0]?.length ?? 0;

  let row = 0;
  for (let col = 0; col < n && row < m; col++) {
    
    let pivotRow = -1;
    if (pivoting === 'partial') {
      
      pivotRow = findMaxAbsRow(B, row, col);
    } else if (pivoting === 'partialOnZero') {
      
      pivotRow = !R.isZero(B[row][col]) ? row : findNonZeroRow(B, row, col);
    } else {
      
      pivotRow = findNonZeroRow(B, row, col);
    }
    if (pivotRow === -1) continue; 

    if (pivotRow !== row) {
      const res = swapRows(B, row, pivotRow);
      B = res.matrix; steps.push({ ...res, snapshot: B.map(r => r.map(x => R(x))) });
    }

    const pivot = R(B[row][col]);
    if (!R.isZero(pivot) && !R.isOne(pivot)) {
      const res = scaleRow(B, row, R.div(R(1), pivot));
      B = res.matrix; steps.push({ ...res, snapshot: B.map(r => r.map(x => R(x))) });
    }

    for (let r = row + 1; r < m; r++) {
      const factor = R(B[r][col]); 
      if (!R.isZero(factor)) {
        const res = addRows(B, r, row, R.sub(R(0), factor)); 
        B = res.matrix; steps.push({ ...res, snapshot: B.map(rr => rr.map(x => R(x))) });
      }
    }
    row++;
  }

  return { steps, final: B };
}

export function toRREF(A, options = {}) {
  
  const pivoting = options.pivoting ?? 'partial';
  const { steps: refSteps, final: REF } = toREF(A, { pivoting });
  let B = cloneMat(REF);
  const steps = [...refSteps];
  const m = B.length, n = B[0]?.length ?? 0;

  const pivots = [];
  for (let i = 0; i < m; i++) {
    let pivotCol = -1;
    for (let j = 0; j < n; j++) {
      if (!R.isZero(B[i][j]) && (B[i][j].n === 1 && B[i][j].d === 1)) { pivotCol = j; break; }
    }
    if (pivotCol >= 0) pivots.push({ row: i, col: pivotCol });
  }

  for (let k = pivots.length - 1; k >= 0; k--) {
    const { row, col } = pivots[k];
    
    for (let r = row - 1; r >= 0; r--) {
      const factor = R(B[r][col]);
      if (!R.isZero(factor)) {
        const res = addRows(B, r, row, R.sub(R(0), factor));
        B = res.matrix; steps.push({ ...res, snapshot: B.map(rr => rr.map(x => R(x))) });
      }
    }
  }

  return { steps, final: B };
}
