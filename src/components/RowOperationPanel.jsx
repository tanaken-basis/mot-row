import { useMemo, useState } from 'react';
import { useI18n } from "../i18n";
import FractionCell from "./FractionCell";
import ToggleSwitch from "./ToggleSwitch";
import { MathJax } from "better-react-mathjax";

export default function RowOperationPanel({ matrix, onApply }) {
  const { t } = useI18n();
  const rows = useMemo(() => Math.max(0, matrix?.length ?? 0), [matrix]);

  const [ri, setRi] = useState("1");
  const [rj, setRj] = useState("2");
  const [k, setK] = useState("1");
  const [kMode, setKMode] = useState("direct"); 

  const clamp = (v) => Math.min(rows, Math.max(1, v | 0 || 1));

  const applySwap = () => {
    if (rows < 2) return;
    const ii = clamp(ri) - 1, jj = clamp(rj) - 1;
    if (ii === jj) return;
    onApply?.({ type: 'swap', i: ii, j: jj });
  };

  const applyScale = () => {
    const ii = clamp(ri) - 1;
    if (!k || k === '0') return; 
    onApply?.({ type: 'scale', i: ii, k });
  };

  const applyAdd = () => {
    if (rows < 2) return;
    const ii = clamp(ri) - 1, jj = clamp(rj) - 1;
    if (ii === jj) return;
    if (!k) return;
    onApply?.({ type: 'add', i: ii, j: jj, k });
  };

  return (
    <div className="flex flex-col gap-3 p-3 rounded-xl border border-gray-200">
      <div className="text-sm font-semibold">{t("rowOps.title")}</div>

            <div className="flex flex-wrap gap-3 items-end">
                <div className="flex flex-col text-sm">
          <MathJax dynamic>
            <span>{t("rowOps.riLabelTex")}</span>
          </MathJax>
          <input
            className="mt-1 w-20 px-2 py-1 border rounded"
            type="number"
            min={1}
            max={rows || 1}
            value={ri}
            onChange={(e) => setRi(e.target.value)}
          />
        </div>

                <div className="flex flex-col text-sm">
          <MathJax dynamic>
            <span>{t("rowOps.rjLabelTex")}</span>
          </MathJax>
          <input
            className="mt-1 w-20 px-2 py-1 border rounded"
            type="number"
            min={1}
            max={rows || 1}
            value={rj}
            onChange={(e) => setRj(e.target.value)}
          />
        </div>

                        <div className="flex flex-col items-start">
                    <span className="mb-1 text-sm">
            <MathJax dynamic>{t("rowOps.kLabelTex")}</MathJax>
          </span>

          <div
            className="
              flex items-center gap-3
              px-3 py-2
              rounded-lg border border-slate-200 bg-white/70
            "
          >
                        <ToggleSwitch
              checked={kMode === "fraction"}
              onChange={(on) => setKMode(on ? "fraction" : "direct")}
              label={
                kMode === "fraction"
                  ? t("rowOps.kMode.fraction")
                  : t("rowOps.kMode.direct")
              }
            />

                        {kMode === "direct" && (
              <input
                type="text"
                value={k}
                onChange={(e) => setK(e.target.value)}
                className="
                    w-20           
                    px-2 py-1
                    border rounded
                    border border-slate-300 rounded
                    text-sm
                  "
                placeholder="1, -3, 2/5"
              />
            )}

                        {kMode === "fraction" && (
              <div className="origin-left">
                <FractionCell
                  id="rowops-k"
                  value={k}
                  onChange={setK}
                  numMin={-999}
                  numMax={999}
                  denMin={1}
                  denMax={999}
                  step={1}
                  normalizeMode="blur"
                />
              </div>
            )}
          </div>
        </div>

      </div>

            <div className="grid grid-cols-3 gap-2">
        <button
          className="px-3 py-2 rounded-lg border hover:bg-gray-50"
          onClick={applySwap}
          disabled={rows < 2}
          title="R_i ↔ R_j"
        >
          <MathJax dynamic>
            <span>{t("rowOps.swapTex")}</span>
          </MathJax>
        </button>
        <button
          className="px-3 py-2 rounded-lg border hover:bg-gray-50"
          onClick={applyScale}
          disabled={rows < 1}
          title="R_i ← k·R_i"
        >
          <MathJax dynamic>
            <span>{t("rowOps.scaleTex")}</span>
          </MathJax>
        </button>
        <button
          className="px-3 py-2 rounded-lg border hover:bg-gray-50"
          onClick={applyAdd}
          disabled={rows < 2}
          title="R_i ← R_i + k·R_j"
        >
          <MathJax dynamic>
            <span>{t("rowOps.addTex")}</span>
          </MathJax>
        </button>
      </div>

      <MathJax dynamic>
  <div className="text-xs text-slate-500 mt-1">
    {t("rowOps.hintTex")}
  </div>
</MathJax>
    </div>
  );
}
