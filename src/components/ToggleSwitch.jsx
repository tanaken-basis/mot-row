export default function ToggleSwitch({ checked, onChange, label }) {
  const handleClick = () => {
    onChange?.(!checked);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 focus:outline-none"
    >
      {label && (
        <span className="text-xs text-gray-700 select-none">
          {label}
        </span>
      )}
      <span
        className={
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors " +
          (checked ? "bg-emerald-500" : "bg-gray-300")
        }
      >
        <span
          className={
            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform " +
            (checked ? "translate-x-4" : "translate-x-1")
          }
        />
      </span>
    </button>
  );
}
