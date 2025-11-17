export default function Toast({ type, message, position = "top-right" }) {
  const color =
    type === "success" ? "bg-emerald-500/90" :
    type === "error"   ? "bg-rose-500/90" :
    "bg-gray-600/90";

  const posClass =
    position === "center"
      ? "inset-0 flex items-center justify-center"
      : position === "top-center"
      ? "top-4 left-1/2 -translate-x-1/2"
      : position === "top-left"
      ? "fixed top-4 left-4"
      : position === "top-right"
      ? "fixed top-4 right-4"
      : position === "bottom-left"
      ? "fixed bottom-4 left-4"
      : position === "bottom-right"
      ? "fixed bottom-4 right-4"
      : position === "bottom-center"
      ? "bottom-4 left-1/2 -translate-x-1/2"
      : "top-4 left-1/2 -translate-x-1/2"; 

  return (
    <div className={`fixed ${posClass} pointer-events-none`}>
      <div className={`px-6 py-3 text-white rounded-xl shadow-xl text-sm ${color} pointer-events-auto`}>
        {message}
      </div>
    </div>
  );
}
