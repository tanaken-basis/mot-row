import React from "react";

export default function FractionCell({
  id,
  value,
  onChange,
  isCorrect,
  showCheck,
  numMin = -99,
  numMax = 99,
  denMin = 1,
  denMax = 99,
  step = 1,
  normalizeMode = "blur",
}) {
  
  const parse = (v) => {
    const t = String(v ?? "").trim();
    if (t === "" || t === "-") return { num: 0, den: 1 };
    if (t.includes("/")) {
      const [ns, ds] = t.split("/").map((s) => s.trim());
      let n = Number.parseInt(ns, 10);
      let d = Number.parseInt(ds, 10);
      if (!Number.isFinite(n)) n = 0;
      if (!Number.isFinite(d) || d === 0) d = 1;
      return { num: n, den: d };
    }
    let n = Number.parseInt(t, 10);
    if (!Number.isFinite(n)) n = 0;
    return { num: n, den: 1 };
  };

  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const normalize = ({ num, den }) => {
    if (den < 0) { num = -num; den = -den; }
    if (num === 0) return { num: 0, den: 1 };
    const g = gcd(num, den);
    return { num: num / g, den: den / g };
  };
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const toStr = ({ num, den }) => (den === 1 ? String(num) : `${num}/${den}`);

  const [state, setState] = React.useState(() => parse(value));
  React.useEffect(() => { setState(parse(value)); }, [value]);

  const notify = (nextRaw, when = "change") => {
    const clamped = {
      num: clamp(nextRaw.num, numMin, numMax),
      den: clamp(nextRaw.den, denMin, denMax),
    };
    let out = clamped;
    if (normalizeMode === "live") {
      out = normalize(clamped);
    } else if (normalizeMode === "blur" && when === "blur") {
      out = normalize(clamped);
    }
    onChange?.(toStr(out));
  };

  const onNumChange = (e) => {
    const v = Number(e.target.value);
    const next = { ...state, num: Number.isFinite(v) ? v : state.num };
    setState(next);
    notify(next, "change");
  };
  const onDenChange = (e) => {
    const v = Number(e.target.value);
    const safe = Number.isFinite(v) ? v : state.den;
    const next = { ...state, den: safe };
    setState(next);
    notify(next, "change");
  };
  const onBlur = () => { notify(state, "blur"); };

  const border = showCheck
    ? (isCorrect ? "2px solid #10b981" : "2px dotted #ef4444")
    : "1px solid #475569";

  const preventWheel = (e) => e.currentTarget.blur();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: 6,
        borderRadius: 10,
        border,
        background: "#f9fafb",
      }}
    >
            <input
        id={id ? `${id}-num` : undefined}
        type="number"
        inputMode="numeric"
        value={state.num}
        onChange={onNumChange}
        onBlur={onBlur}
        onWheel={preventWheel}
        min={numMin}
        max={numMax}
        step={step}
        style={{
          width: 64,
          height: 32,
          textAlign: "center",
          fontSize: 14,
          borderRadius: 8,
          border: "1px solid #cbd5e1",
          background: "#ffffff",
          color: "#0f172a",
          outline: "none",
        }}
      />
      <span
        style={{
          opacity: 0.7,
          userSelect: "none",
          marginInline: 4,
        }}
      >
        /
      </span>
            <input
        id={id ? `${id}-den` : undefined}
        type="number"
        inputMode="numeric"
        value={state.den}
        onChange={onDenChange}
        onBlur={onBlur}
        onWheel={preventWheel}
        min={denMin}
        max={denMax}
        step={step}
        style={{
          width: 64,
          height: 32,
          textAlign: "center",
          fontSize: 14,
          borderRadius: 8,
          border: "1px solid #cbd5e1",
          background: "#ffffff",
          color: "#0f172a",
          outline: "none",
        }}
      />
    </div>
  );
}
