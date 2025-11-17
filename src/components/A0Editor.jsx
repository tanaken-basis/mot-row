
import React from "react";
import { MathJax } from "better-react-mathjax";
import ToggleSwitch from "./ToggleSwitch";
import FractionCell from "./FractionCell";
import { useI18n } from "../i18n";
import { R } from "../math/rational";

function clampInt(x, lo, hi, fallback) {
  const v = Number.parseInt(x, 10);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(lo, Math.min(hi, v));
}

function makeDraft(initial, rows, cols) {
  const draft = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const v = initial?.[r]?.[c];
      if (v && typeof v === "object" && "num" in v && "den" in v) {
        
        const n = v.num;
        const d = v.den;
        row.push(d === 1 ? String(n) : `${n}/${d}`);
      } else if (typeof v === "number" || typeof v === "string") {
        row.push(String(v));
      } else {
        row.push("0");
      }
    }
    draft.push(row);
  }
  return draft;
}

export default function A0Editor({
  initialMatrix,
  onApply,
  maxSize = 6,
}) {
  const { t } = useI18n();

  const initRows = initialMatrix?.length || 3;
  const initCols = initialMatrix?.[0]?.length || 3;

  const [rows, setRows] = React.useState(initRows);
  const [cols, setCols] = React.useState(initCols);
  const [mode, setMode] = React.useState("direct"); 
  const [cells, setCells] = React.useState(
    () => makeDraft(initialMatrix, initRows, initCols)
  );

  React.useEffect(() => {
    setCells((prev) => {
      const draft = [];
      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
          row.push(prev?.[r]?.[c] ?? "0");
        }
        draft.push(row);
      }
      return draft;
    });
  }, [rows, cols]);

  const onChangeRows = (e) => {
    const next = clampInt(e.target.value, 1, maxSize, rows);
    setRows(next);
  };

  const onChangeCols = (e) => {
    const next = clampInt(e.target.value, 1, maxSize, cols);
    setCols(next);
  };

  const updateCell = (r, c, val) => {
    setCells((prev) => {
      const copy = prev.map((row) => row.slice());
      copy[r][c] = val;
      return copy;
    });
  };

  const handleApply = () => {
    const M = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const txt = (cells?.[r]?.[c] ?? "").trim();
        
        let q;
        try {
          q = R(txt === "" ? "0" : txt);
        } catch {
          q = R.fromInt(0);
        }
        row.push(q);
      }
      M.push(row);
    }
    onApply?.(M);
  };

  return (
    <div className="mt-2 p-3 rounded-xl border border-slate-200 bg-white/80 text-sm flex flex-col gap-3">
      
      <div className="flex items-center justify-between">
        <div className="font-semibold">
          <MathJax dynamic>
            {t("A0Editor.title")}
          </MathJax>
        </div>
        <div className="flex items-center gap-3">
          
          <ToggleSwitch
            checked={mode === "fraction"}
            onChange={(on) => setMode(on ? "fraction" : "direct")}
            label={
              mode === "fraction"
                ? t("A0Editor.mode.fraction")
                : t("A0Editor.mode.direct")
            }
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 text-xs">
        <div className="flex flex-col">
          <MathJax dynamic>{t("A0Editor.rows")}</MathJax>
          <input
            type="number"
            className="mt-1 w-20 px-2 py-1 border rounded"
            min={1}
            max={maxSize}
            value={rows}
            onChange={onChangeRows}
          />
        </div>
        <div className="flex flex-col">
          <MathJax dynamic>{t("A0Editor.cols")}</MathJax>
          <input
            type="number"
            className="mt-1 w-20 px-2 py-1 border rounded"
            min={1}
            max={maxSize}
            value={cols}
            onChange={onChangeCols}
          />
        </div>
        <div className="text-[11px] text-slate-500">
          {t("A0Editor.sizeHint", { max: maxSize })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse">
          <tbody>
            {Array.from({ length: rows }, (_, r) => (
              <tr key={r}>
                {Array.from({ length: cols }, (_, c) => (
                  <td key={c} className="p-1">
                    {mode === "direct" ? (
                      <input
                        type="text"
                        className="
                          w-20 px-2 py-1
                          border border-slate-300 rounded
                          text-sm
                        "
                        value={cells?.[r]?.[c] ?? ""}
                        onChange={(e) => updateCell(r, c, e.target.value)}
                      />
                    ) : (
                      <div className="scale-90 origin-left">
                        <FractionCell
                          id={`A0-${r}-${c}`}
                          value={cells?.[r]?.[c] ?? "0"}
                          onChange={(val) => updateCell(r, c, val)}
                          numMin={-999}
                          numMax={999}
                          denMin={1}
                          denMax={999}
                          step={1}
                          normalizeMode="blur"
                        />
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2 mt-1">
        <div className="flex-1 text-[11px] text-slate-500">
          <MathJax dynamic>
            {t("A0Editor.hintTex")}
          </MathJax>
        </div>
        <button
          type="button"
          className="px-3 py-1.5 text-xs border rounded bg-emerald-50 hover:bg-emerald-100"
          onClick={handleApply}
        >
          <MathJax dynamic>{t("A0Editor.apply")}</MathJax>
        </button>
      </div>
    </div>
  );
}
