import { useState } from "react";
import { MathJax } from "better-react-mathjax";
import { useI18n } from "../i18n";
import { opToTex } from "../tex/rowOpsTex";
import ToggleSwitch from "./ToggleSwitch";
import StepElementaryDetails from "./StepElementaryDetails";

export default function StepViewer({
  steps,
  cursor,
  onJump,
  onUndo,
  onRedo,
  onDeleteLast,
  initialMatrix,
}) {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState(null);
  
  const count = steps.length;

  const handleToggleDetails = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="p-3 rounded-xl border border-gray-200 flex flex-col gap-3 bg-white/70">
      
      <div className="flex items-center gap-2">
        <div className="text-xs font-medium text-slate-600">
          {t("steps.title")}{" "}<span className="text-[11px] text-slate-500">{t("steps.clickHint")}</span>{" "}
          {count > 0 && `（${cursor + 1}/${count}）`}
        </div>
        <div className="flex-1" />

        <button
          className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-xs"
          onClick={onUndo}
          disabled={cursor < 0}
        >
          Undo
        </button>
        <button
          className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-xs"
          onClick={onRedo}
          disabled={cursor + 1 >= count}
        >
          Redo
        </button>
        <button
          className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-xs"
          onClick={onDeleteLast}
          disabled={count === 0}
          title={t("steps.deleteLast")}
        >
          ×
        </button>
      </div>

        <div className="flex flex-col gap-2 max-h-80 overflow-x-auto overflow-y-auto max-w-full">
          {count === 0 && (
            <div className="text-xs text-gray-500">
              {t("steps.empty")}
            </div>
          )}

          {steps.map((s, idx) => {
            const active = idx === cursor;
            const tex = opToTex(s.op) || "\\text{(no op)}";
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className={
                  "rounded-lg border px-2 py-1.5 text-xs bg-white " +
                  (active ? "border-emerald-500 shadow-sm" : "border-slate-200")
                }
              >
                <div className="flex items-center gap-2">
                  
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onJump(idx)}
                  >
                    <MathJax dynamic>
                      <div>
                        {`\\(\\text{Step }${idx + 1}:\\; ${tex}\\)`}
                      </div>
                    </MathJax>
                  </div>

                  <button
                    type="button"
                    className="px-2 py-0.5 border rounded hover:bg-gray-50 text-[10px]"
                    onClick={() => handleToggleDetails(idx)}
                  >
                    {isOpen ? t("elem.details.hide") : t("elem.details.show")}
                  </button>
                </div>

                {isOpen && (
                  <StepElementaryDetails
                    index={idx}
                    steps={steps}
                    initialMatrix={initialMatrix}
                  />
                )}
              </div>
            );
          })}
        </div>
      
    </div>
  );
}
