import { R } from "../math/rational";
import { texR } from "./builders";

export function opToTex(op) {
  if (!op) return "\\text{(no op)}";

  const type = op.type;
  const i = (op.i ?? 0) + 1;
  const j = (op.j ?? 0) + 1;

  const toK = (kRaw) => {
    if (kRaw == null) return R.fromInt(0);
    return R(kRaw);
  };

  if (type === "swap") {
    
    return `R_{${i}} \\leftrightarrow R_{${j}}`;
  }

  if (type === "scale") {
    const k = toK(op.k);
    const { num, den } = k;

    if (num === 1 && den === 1) {
      return `R_{${i}} \\leftarrow R_{${i}}`;
    }

    if (num === -1 && den === 1) {
      return `R_{${i}} \\leftarrow - R_{${i}}`;
    }

    const kTex = texR(k); 
    return `R_{${i}} \\leftarrow ${kTex} R_{${i}}`;
  }

  if (type === "add") {
    const k = toK(op.k);
    const { num, den } = k;

    if (num === 1 && den === 1) {
      return `R_{${i}} \\leftarrow R_{${i}} + R_{${j}}`;
    }

    if (num === -1 && den === 1) {
      return `R_{${i}} \\leftarrow R_{${i}} - R_{${j}}`;
    }

    const kTex = texR(k);

    return `R_{${i}} \\leftarrow R_{${i}} + \\left(${kTex}\\right) R_{${j}}`;
  }

  return "\\text{(unknown row operation)}";
}

export function toColoredMatrixTex(
  A,
  changedRows = [],
  bg = "LightYellow",
  fg = "red"
) {
  const changed = new Set(changedRows ?? []);

  const rows = A.map((row, rIndex) => {
    const cells = row.map((val) => {
      const base = texR(val); 

      if (!changed.has(rIndex)) return base;

      let inner = base;

      if (fg) {
        inner = "\\textcolor{" + fg + "}{" + inner + "}";
      }

      return inner;
    });

    return cells.join(" & ");
  });

  return "\\begin{bmatrix}"
    + rows.join(" \\\\ ")
    + "\\end{bmatrix}";
}
