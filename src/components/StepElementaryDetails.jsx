import { useState } from "react";
import { MathJax } from "better-react-mathjax";
import { useI18n } from "../i18n";
import { R } from "../math/rational";
import { toBMatrixR } from "../tex/builders";
import { swapRows, scaleRow, addRows } from "../math/rowOps";

function identityR(n) {
  const one = R.fromInt(1);
  const zero = R.fromInt(0);
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? one : zero))
  );
}

function elementaryFromOp(n, op) {
  let E = identityR(n);
  if (!op) return E;
  if (op.type === "swap") {
    return swapRows(E, op.i, op.j).matrix;
  }
  if (op.type === "scale") {
    return scaleRow(E, op.i, op.k).matrix;
  }
  if (op.type === "add") {
    return addRows(E, op.i, op.j, op.k).matrix;
  }
  return E;
}

function cumulativeElementary(n, steps, uptoIndex) {
  let E = identityR(n);
  for (let i = 0; i <= uptoIndex; i++) {
    const op = steps[i]?.op;
    if (!op) continue;
    if (op.type === "swap") {
      E = swapRows(E, op.i, op.j).matrix;
    } else if (op.type === "scale") {
      E = scaleRow(E, op.i, op.k).matrix;
    } else if (op.type === "add") {
      E = addRows(E, op.i, op.j, op.k).matrix;
    }
  }
  return E;
}

function leftMultiply(E, A) {
  if (!E || !A || !A[0]) return null;
  const n = E.length;
  const m = A[0].length;
  const zero = R.fromInt(0);
  const out = Array.from({ length: n }, () =>
    Array.from({ length: m }, () => zero)
  );
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      let acc = zero;
      for (let k = 0; k < n; k++) {
        acc = R.add(acc, R.mul(E[i][k], A[k][j]));
      }
      out[i][j] = acc;
    }
  }
  return out;
}

export default function StepElementaryDetails({ index, steps, initialMatrix }) {
  const { t } = useI18n();
  const [showCum, setShowCum] = useState(false);

  if (!initialMatrix || !initialMatrix.length || !initialMatrix[0]) {
    return null;
  }
  const rows = initialMatrix.length;

  const step = steps[index];
  if (!step) return null;

  const A_before =
    index === 0 ? initialMatrix : steps[index - 1]?.snapshot || initialMatrix;
  const A_after = step.snapshot;

  const E_step = elementaryFromOp(rows, step.op);
  const EA_before = leftMultiply(E_step, A_before);

  const E_total = cumulativeElementary(rows, steps, index);
  const EtotalA0 = leftMultiply(E_total, initialMatrix);

  return (
    <div className="mt-1 p-2 rounded-md bg-slate-50 border border-slate-200 text-[11px] space-y-2">
      {}
      <div>
        {EA_before && (
          <div>
            <MathJax dynamic>
              <div className="mb-1">
                {`\\(A_{${index + 1}} = E_{${index + 1}} A_{${index}}\\)`}
                {`\\(= ${toBMatrixR(E_step)}${toBMatrixR(A_before)}\\)`}
                {`\\(= ${toBMatrixR(A_after)}\\)`}
              </div>
            </MathJax>
          </div>
        )}
      </div>

      {}
      <div className="pt-1 border-t border-slate-200">
        <button
          type="button"
          className="px-2 py-0.5 text-[10px] border rounded hover:bg-gray-100"
          onClick={() => setShowCum((v) => !v)}
        >
          {showCum ? t("elem.cum.toggle.hide") : t("elem.cum.toggle.show")}
        </button>

        {showCum && (
          <div className="mt-2 grid md:grid-cols-2 gap-2">
            <div>
              <MathJax dynamic>
                <div className="mb-1">
                  {`\\(E_{\\text{total},${index + 1}} =\\)`}
                  {`\\(${toBMatrixR(E_total)}\\)`}
                </div>
              </MathJax>
            </div>
            {EtotalA0 && (
              <div>
                <MathJax dynamic>
                  <div className="mb-1">
                    {`\\(E_{\\text{total},${index + 1}} A_0 =\\)`}
                  
                    {`\\(${toBMatrixR(EtotalA0)}\\)`}
                  </div>
                </MathJax>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}