
import { useRef, useState, useEffect } from "react";
import { MathJaxContext, MathJax } from "better-react-mathjax";
import { I18nProvider, useI18n } from "./i18n";
import { R } from "./math/rational";
import { toRREF } from "./math/rref";
import { swapRows, scaleRow, addRows } from "./math/rowOps";
import { rankR } from "./math/rank";
import { toColoredMatrixTex, opToTex } from "./tex/rowOpsTex";
import { toBMatrixR } from "./tex/builders";
import ToggleSwitch from "./components/ToggleSwitch";
import StepViewer from "./components/StepViewer";
import RowOperationPanel from "./components/RowOperationPanel";
import SettingsPanel from "./components/SettingsPanel";
import A0Editor from "./components/A0Editor";
import Toast from "./components/Toast";

export default function App() {
  return (
    <I18nProvider defaultLang="ja">
      <InnerApp />
    </I18nProvider>
  );
}

function InnerApp() {
  const { t, lang, setLang } = useI18n();
  const [matrix, setMatrix] = useState(() => [
    [R.fromInt(1), R.fromInt(2), R.fromInt(-1)],
    [R.fromInt(3), R.fromInt(0), R.fromInt(4)],
    [R.fromInt(2), R.fromInt(1), R.fromInt(5)],
  ]);
  const [autoPlan, setAutoPlan] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showA0Editor, setShowA0Editor] = useState(false);
  const [showA0Panel, setShowA0Panel] = useState(false);
  const [showStepsPanel, setShowStepsPanel] = useState(true);
  const [steps, setSteps] = useState([]);
  const [cursor, setCursor] = useState(-1);
  const [mode, setMode] = useState("practice");
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizRankInput, setQuizRankInput] = useState("");
  const [quizRankResult, setQuizRankResult] = useState(null);
  const initialRef = useRef(null);
  const [problem, setProblem] = useState({
    A0: null,
    source: "none",
    createdAt: null,
  });
  const [toast, setToast] = useState(null);
  const [settings, setSettings] = useState({
    rows: 3,
    cols: 3,
    min: -5,
    max: 5,
    randomSize: true,
    minRows: 2,
    maxRows: 4,
    minCols: 3,
    maxCols: 4,
    highlightChangedRows: true,
    showRank: false,
  });

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function genRandomMatrix(rows, cols, min, max) {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => R.fromInt(randInt(min, max)))
    );
  }

  function startPracticeProblem() {
    const { rows, cols } = resolveMatrixSize();
    const { min, max } = settings;

    const A0 = genRandomMatrix(rows, cols, min, max);
    resetMatrix(A0, "random");
  }

  function startQuizProblem() {

    const { rows, cols } = resolveMatrixSize();
    const { min, max } = settings;

    let A0 = genRandomMatrix(rows, cols, min, max);

    let nonZero = false;
    for (const row of A0) for (const x of row) {
      if (R(x).n !== 0) { nonZero = true; break; }
    }
    if (!nonZero) {
      A0[0][0] = R.fromInt(1);
    }

    const { final: target, steps: bestSteps } = toRREF(A0, { pivoting: "partialOnZero" });

    resetMatrix(A0, "quiz");
  }

  function applyManualA0(matrixR) {
    if (!matrixR || !matrixR.length || !matrixR[0]) return;
    const rows = matrixR.length;
    const cols = matrixR[0].length;

    setSettings((prev) => ({
      ...prev,
      rows,
      cols,
    }));

    resetMatrix(matrixR, "manual");

    setShowA0Editor(false);
  }

  let changedRowIndices = null;

  if (settings.highlightChangedRows && cursor >= 0 && steps[cursor]?.op) {
    const op = steps[cursor].op;
    if (op.type === "swap") {

      changedRowIndices = [op.i, op.j];
    } else if (op.type === "scale") {
      changedRowIndices = [op.i];
    } else if (op.type === "add") {

      changedRowIndices = [op.i];
    }
  }

  function matricesEqualR(A, B) {
    if (!A || !B || A.length !== B.length || A[0].length !== B[0].length) return false;
    const rows = A.length;
    const cols = A[0].length;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const a = A[i][j];
        const b = B[i][j];
        if (!a || !b || a.num !== b.num || a.den !== b.den) {
          return false;
        }
      }
    }
    return true;
  }

  function checkQuizAnswer() {
    if (mode !== "quiz") return;

    const A0 = problem.A0 || initialRef.current;
    if (!A0) return;

    const { final: rrefA0 } = toRREF(A0, { pivoting: "partialOnZero" });

    const okMatrix = matricesEqualR(matrix, rrefA0);
    let okRank = true;
    if (settings.showRank) {
      const trueRank = rankR(A0);
      const userRank = Number.parseInt(quizRankInput, 10);
      okRank = Number.isFinite(userRank) && userRank === trueRank;
      setQuizRankResult(okRank);
    } else {
      setQuizRankResult(null);
    }
    const ok = okMatrix && okRank;
    setToast({
      type: ok ? "success" : "error",
      message: ok
        ? t("quiz.result.correct")
        : t("quiz.result.incorrect"),
    });

    setTimeout(() => setToast(null), 2500);
  }

  function showQuizAnswer() {
    if (mode !== "quiz") return;

    const A0 = problem.A0 || initialRef.current;
    if (!A0) return;

    const { final: rrefA0 } = toRREF(A0, { pivoting: "partialOnZero" });
    setQuizAnswer(rrefA0);
    setShowStepsPanel(true);

    const { final, steps: algSteps } = toRREF(A0, { pivoting: "partialOnZero" });

    setMatrix(final);

    const newSteps = algSteps.map(s => ({
      op: s.op,
      snapshot: cloneR(s.snapshot),
      isAnswerStep: true
    }));
    setSteps(newSteps);
    setCursor(newSteps.length - 1);

    setQuizAnswer(final);

    setShowStepsPanel(true);
    setAutoPlan(null);
  }

  const updateSettings = (patch) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  function resolveMatrixSize() {
    const s = settings;
    if (s.randomSize) {
      const r1 = Math.max(1, s.minRows | 0);
      const r2 = Math.max(r1, s.maxRows | 0);
      const c1 = Math.max(1, s.minCols | 0);
      const c2 = Math.max(c1, s.maxCols | 0);
      const rows = randInt(r1, r2);
      const cols = randInt(c1, c2);
      return { rows, cols };
    } else {
      const rows = Math.max(1, settings.rows | 0);
      const cols = Math.max(1, settings.cols | 0);
      return { rows, cols };
    }
  }

  const cloneR = (A) => A.map((row) => row.map(R));

  function resetMatrix(A, source = "unknown") {

    const B = cloneR(A);

    setMatrix(B);

    initialRef.current = cloneR(B);

    setProblem({
      A0: cloneR(B),
      source,
      createdAt: Date.now(),
    });

    setSteps([]);
    setCursor(-1);
    setQuizAnswer(null);
    setAutoPlan(null);
    setQuizRankInput("");
    setQuizRankResult(null);
  }

  function setCurrentAsInitial() {
    if (!matrix || matrix.length === 0) return;
    const B = cloneR(matrix);

    setProblem({
      A0: cloneR(B),
      source: "manual",
      createdAt: Date.now(),
    });
    initialRef.current = cloneR(B);
    setSteps([]);
    setCursor(-1);
    setAutoPlan(null);
    setQuizRankInput("");
    setQuizRankResult(null);
  }

  function ensureInitialSnapshot() {
    if (initialRef.current == null) {
      initialRef.current = cloneR(matrix);
    }
  }

  function onApply(op) {
    setAutoPlan(null);

    ensureInitialSnapshot();

    let res;
    if (op.type === "swap") {
      res = swapRows(matrix, op.i, op.j);
    } else if (op.type === "scale") {
      res = scaleRow(matrix, op.i, op.k);
    } else if (op.type === "add") {
      res = addRows(matrix, op.i, op.j, op.k);
    } else {
      return;
    }

    setMatrix(res.matrix);

    const snap = cloneR(res.matrix);
    const next = steps.slice(0, cursor + 1).concat([{ op: res.op, snapshot: snap }]);
    setSteps(next);
    setCursor(next.length - 1);
  }

  function undo() {
    setAutoPlan(null);

    if (cursor < 0) return;
    const prevCursor = cursor - 1;
    if (prevCursor >= 0) {
      setMatrix(cloneR(steps[prevCursor].snapshot));
    } else {

      if (initialRef.current) {
        setMatrix(cloneR(initialRef.current));
      }
    }
    setCursor(prevCursor);
  }

  function redo() {
    setAutoPlan(null);

    if (cursor + 1 >= steps.length) return;
    const nextCursor = cursor + 1;
    setMatrix(cloneR(steps[nextCursor].snapshot));
    setCursor(nextCursor);
  }

  function jumpTo(index) {
    setAutoPlan(null);

    if (index < -1 || index >= steps.length) return;
    if (index === -1) {

      if (initialRef.current) {
        setMatrix(cloneR(initialRef.current));
      }
      setCursor(-1);
      return;
    }
    setMatrix(cloneR(steps[index].snapshot));
    setCursor(index);
  }

  function calcRREF() {
    ensureInitialSnapshot();

    const { final, steps: algSteps } = toRREF(matrix, { pivoting: "partialOnZero" });

    let newSteps = steps.slice(0, cursor + 1);
    let curMat = matrix;
    let cur = cursor;
    for (const s of algSteps) {
      curMat = cloneR(s.snapshot);
      newSteps = newSteps.concat([{ op: s.op, snapshot: curMat }]);
      cur++;
    }
    setMatrix(final);
    setSteps(newSteps);
    setCursor(newSteps.length - 1);
    setAutoPlan(null);
  }

  function autoNext() {
    ensureInitialSnapshot();

    let plan = autoPlan;
    if (!plan) {
      const { steps: algSteps } = toRREF(matrix, { pivoting: "partialOnZero" });
      plan = { steps: algSteps, index: 0 };
    }

    if (!plan.steps || plan.index >= plan.steps.length) {
      setAutoPlan(null);
      return;
    }

    const s = plan.steps[plan.index];
    const snap = cloneR(s.snapshot);
    setMatrix(snap);
    const next = steps.slice(0, cursor + 1).concat([{ op: s.op, snapshot: snap }]);
    setSteps(next);
    setCursor(next.length - 1);
    setAutoPlan({ steps: plan.steps, index: plan.index + 1 });
  }

  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    if (mode === "quiz") {
      startQuizProblem();
    } else {
      startPracticeProblem();
    }
  }, [mode]);

  function deleteLastStep() {
    if (steps.length === 0) return;
    const newSteps = steps.slice(0, -1);

    let newCursor = cursor;
    if (newCursor >= newSteps.length) {
      newCursor = newSteps.length - 1;
    }

    let newMatrix = null;
    if (newCursor >= 0) {
      newMatrix = cloneR(newSteps[newCursor].snapshot);
    } else if (initialRef.current) {
      newMatrix = cloneR(initialRef.current);
    }

    setSteps(newSteps);
    setCursor(newCursor);
    if (newMatrix) {
      setMatrix(newMatrix);
    }
  }

  const currentAIndex = cursor < 0 ? 0 : cursor + 1;

  let prevMatrix = null;
  let prevAIndex = null;

  if (cursor > 0 && steps[cursor - 1]?.snapshot) {

    prevMatrix = steps[cursor - 1].snapshot;
    prevAIndex = currentAIndex - 1;
  } else if (cursor === 0 && initialRef.current) {

    prevMatrix = initialRef.current;
    prevAIndex = 0;
  }

  const A0Matrix = problem.A0 || initialRef.current;
  const canShowRankValue =
    settings.showRank &&
    (mode === "practice" || (mode === "quiz" && !!quizAnswer));
  const currentRank =
    settings.showRank && matrix && matrix.length
      ? rankR(matrix)
      : null;
  const rankA0 =
    settings.showRank && A0Matrix
      ? rankR(A0Matrix)
      : null;

  return (
    <MathJaxContext
      version={3}
      config={{
        loader: { load: ["[tex]/ams", "[tex]/color"] },
        tex: {
          inlineMath: [["\\(", "\\)"]],
          displayMath: [["\\[", "\\]"]],
          packages: { "[+]": ["noerrors", "ams", "color"] },
        },
        options: { enableMenu: false },
      }}
    >
      <div className="p-4 max-w-5xl mx-auto flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-semibold flex-1">
            {t("app.title")}
          </h1>
          <div className="flex items-center gap-2 text-xs">
            <button
              className={
                "px-2 py-1 border rounded " +
                (lang === "ja" ? "bg-gray-200" : "bg-white")
              }
              onClick={() => setLang("ja")}
            >
              {t("lang.ja")}
            </button>
            <button
              className={
                "px-2 py-1 border rounded " +
                (lang === "en" ? "bg-gray-200" : "bg-white")
              }
              onClick={() => setLang("en")}
            >
              {t("lang.en")}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-2">
          <ToggleSwitch
            checked={mode === "quiz"}
            onChange={(on) => setMode(on ? "quiz" : "practice")}
            label={mode === "quiz" ? t("mode.quiz") : t("mode.practice")}
          />
          <button
            type="button"
            className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
            onClick={() => {
              if (mode === "quiz") {
                startQuizProblem();
              } else {
                startPracticeProblem();
              }
            }}
          >
            {t("ui.newProblem")}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1" />
          <button
            className="px-3 py-2 border rounded hover:bg-gray-50"
            onClick={undo}
            disabled={cursor < 0}
            title="Undo"
          >
            {t("ui.undo")}
          </button>
          <button
            className="px-3 py-2 border rounded hover:bg-gray-50"
            onClick={redo}
            disabled={cursor + 1 >= steps.length}
            title="Redo"
          >
            {t("ui.redo")}
          </button>
          <button
            className="px-3 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            disabled={mode === "quiz"}
            onClick={autoNext}
          >
            {t("ui.rref.next")}
          </button>
          <button
            className="px-3 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            disabled={mode === "quiz"}
            onClick={calcRREF}
          >
            {t("ui.rref.all")}
          </button>
          {mode === "quiz" && (
            <>
              <button
                type="button"
                onClick={quizAnswer ? undefined : checkQuizAnswer}
                disabled={!!quizAnswer}
                className={
                  "px-3 py-1.5 text-sm border rounded " +
                  (quizAnswer
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-emerald-50 hover:bg-emerald-100"
                  )
                }>
                {t("quiz.check")}
              </button>
              {mode === "quiz" && (
                quizAnswer ? (
                  <button
                    className="px-3 py-1.5 text-sm border rounded bg-gray-100 hover:bg-gray-200"
                    onClick={() => {
                      setQuizAnswer(null);
                      setSteps([]);
                      setCursor(-1);
                      setMatrix(problem.A0 || initialRef.current);
                      setQuizRankInput("");
                      setQuizRankResult(null);
                    }}
                  >
                    {t("quiz.hideAnswer")}
                  </button>
                ) : (
                  <button
                    className="px-3 py-1.5 text-sm border rounded bg-sky-50 hover:bg-sky-100"
                    onClick={showQuizAnswer}
                  >
                    {t("quiz.showAnswer")}
                  </button>
                )
              )}
            </>
          )}
        </div>

        <div className="text-lg">
          <div className="flex flex-wrap items-start gap-6">
            <div className="overflow-x-auto overflow-y-hidden"></div>
            <MathJax dynamic>
              <span>
                {settings.highlightChangedRows && changedRowIndices?.length
                  ? `\\(A_{${currentAIndex}} = ${toColoredMatrixTex(
                    matrix,
                    changedRowIndices,
                    "LightYellow",
                    "red"
                  )}\\)`
                  : `\\(A_{${currentAIndex}} = ${toBMatrixR(matrix)}\\)`
                }
              </span>
              {prevMatrix && (
                <span className="overflow-x-auto overflow-y-hidden text-base text-slate-400">
                  {`\\(
                  \\quad \\leftarrow \\quad A_{${prevAIndex}} = ${toBMatrixR(prevMatrix)}
                  \\quad , \\quad ${opToTex(steps[cursor].op)}
                  \\)`}
                </span>
              )}
            </MathJax>
          </div>
          {canShowRankValue && currentRank != null && (
            <div className="mt-1 text-sm text-slate-600">
              <MathJax dynamic>
                {`\\(\\quad \\quad \\operatorname{rank}(A_{${currentAIndex}}) = ${currentRank}\\)`}
              </MathJax>
            </div>
          )}

        {mode === "quiz" && settings.showRank && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <MathJax dynamic>
              <span>{`\\(\\quad \\quad \\operatorname{rank}(A_0) =\\)`}</span>
            </MathJax>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={Math.min(matrix.length || 0, (matrix[0] || []).length || 0)}
              value={quizRankInput}
              onChange={(e) => setQuizRankInput(e.target.value)}
              className={
                "w-20 px-2 py-1 text-center rounded border text-sm " +
                (quizRankResult == null
                  ? "border-slate-300"
                  : quizRankResult
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-rose-500 bg-rose-50")
              }
            />
          </div>
        )}

        </div>

        <RowOperationPanel matrix={matrix} onApply={onApply} />

        <div className="mt-3 border rounded-xl bg-white/60">
          <button
            type="button"
            className="w-full px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-50"
            onClick={() => setShowA0Panel((v) => !v)}
          >
            <MathJax dynamic>
              <span>{t("panel.A0.title")}</span>
            </MathJax>
            <span className="text-xs">{showA0Panel ? "▲" : "▼"}</span>
          </button>
          {showA0Panel && (
            <div className="px-3 pb-3 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-slate-600">
                  <MathJax dynamic>
                    {t("quiz.A0.caption")}
                  </MathJax>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs border rounded hover:bg-gray-50"
                    onClick={setCurrentAsInitial}
                    title={t("ui.setCurrentAsInitial")}
                  >
                    <MathJax dynamic>{t("ui.setCurrentAsInitial")}</MathJax>
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs border rounded hover:bg-gray-50"
                    onClick={() => setShowA0Editor((v) => !v)}
                  >
                    <MathJax dynamic>
                      {showA0Editor
                        ? t("A0Editor.hideButton") ?? "A₀ 手入力パネルを閉じる"
                        : t("A0Editor.showButton") ?? "A₀ を手入力"}
                    </MathJax>
                  </button>
                </div>
              </div>
              <MathJax dynamic>
                <div className="text-lg overflow-x-auto overflow-y-hidden">
                  {problem.A0
                    ? `\\(${toBMatrixR(problem.A0)}\\)`
                    : t("quiz.A0.none")
                  }
                </div>
              </MathJax>
              {canShowRankValue && rankA0 != null && problem.A0 && (
                <MathJax dynamic>
                  <div className="mt-1 text-xs text-slate-600">
                    {`\\(\\operatorname{rank}(A_0) = ${rankA0}\\)`}
                  </div>
                </MathJax>
              )}
              {showA0Editor && (
                <A0Editor
                  initialMatrix={problem.A0 || initialRef.current}
                  onApply={applyManualA0}
                  maxSize={6}
                />
              )}
            </div>
          )}
        </div>

        <div className="mt-3 border rounded-xl bg-white/70">
          <button
            type="button"
            className="w-full px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-50"
            onClick={() => setShowStepsPanel((v) => !v)}
          >
            <span>{t("panel.steps.title")}</span>
            <span className="text-xs">{showStepsPanel ? "▲" : "▼"}</span>
          </button>
          {showStepsPanel && (
            <div className="px-3 pb-3 pt-2 border-t border-slate-200">
              <StepViewer
                steps={steps}
                cursor={cursor}
                onJump={jumpTo}
                onUndo={undo}
                onRedo={redo}
                onDeleteLast={deleteLastStep}
                initialMatrix={problem.A0 || initialRef.current}
              />
            </div>
          )}
        </div>
        <div className="mt-4 border rounded-xl bg-white/70">
          <button
            type="button"
            className="w-full px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-50"
            onClick={() => setShowSettings((v) => !v)}
          >
            <span>{t("settings.title")}</span>
            <span className="text-xs">{showSettings ? "▲" : "▼"}</span>
          </button>
          {showSettings && (
            <SettingsPanel
              settings={settings}
              onChangeSettings={updateSettings}
            />
          )}
        </div>

      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          position="center"
        />
      )}
    </MathJaxContext>
  );
}
