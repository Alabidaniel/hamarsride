import { useEffect } from "react";

export default function Modal({ open, title, description, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-800"
          >
            Close
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto px-5 py-4">{children}</div>

        {footer ? <div className="border-t border-gray-100 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

