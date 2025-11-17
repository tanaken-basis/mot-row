export const wrapNum = (x) => (x < 0 ? `(${x})` : `${x}`);

export function toBMatrix(M) {
  const rows = M.map((row) => row.join(" & ")).join(" \\\\ ");
  return `\\begin{bmatrix} ${rows} \\end{bmatrix}`;
}

export function toDetBMatrix(M) {
  const rows = M.map((row) => row.join(" & ")).join(" \\\\ ");
  return `\\operatorname{det}\\begin{bmatrix} ${rows} \\end{bmatrix}`;
}

export function texR(r) {
  return r.den === 1 ? `${r.num}` : `\\frac{${r.num}}{${r.den}}`;
}

const strR = (r) => r.den === 1 ? String(r.num) : `${r.num}/${r.den}`;

export function toBMatrixR(M) {
  const rows = M.map((row) => row.map(texR).join(" & ")).join(" \\\\ ");
  return `\\begin{bmatrix} ${rows} \\end{bmatrix}`;
}

export function eroLabelTex(type, i, j = null, k = null) {
  
  const I = i + 1;
  const J = j != null ? j + 1 : null;
  if (type === "swap")  return `R_{${I}} \\, \\leftrightarrow \\, R_{${J}}`;
  if (type === "scale") return `R_{${I}} \\, \\leftarrow \\, ${wrapNum(k)}\\cdot R_{${I}}`;
  if (type === "add")   return `R_{${I}} \\, \\leftarrow \\, R_{${I}} \\, + \\, ${wrapNum(k)}\\cdot R_{${J}}`;
  return "";
}

export function smallGrayLabel(i, j) {
  return `{\\small \\color{gray} (${i}, ${j})}`;
}

export function opToTex(op) {
  
  if (op === "+") return "+";
  if (op === "-") return "-";
  if (op === "times") return "\\times"; 
  if (op === "cdot") return "\\cdot";   
  return ""; 
}
