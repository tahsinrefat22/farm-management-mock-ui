"use client";

import React, { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Lightweight modal + declarative form builder for the mock-up.
// Forms don't persist — Save shows a confirmation toast and closes.
// ---------------------------------------------------------------------------

export type Field = {
  label: string;
  type?: "text" | "number" | "date" | "select" | "textarea" | "photo" | "static";
  options?: string[];
  placeholder?: string;
  value?: string;
  col?: 1 | 2; // grid span
  hint?: string;
};

const DURATION = 200; // ms — keep in sync with the transition classes below

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  // `mounted` keeps the modal in the DOM during the exit animation;
  // `visible` drives the enter/leave transition one frame after mount.
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Double rAF: let the browser paint the hidden initial state once,
      // then flip to visible so the enter transition actually runs.
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }
    setVisible(false);
    const id = setTimeout(() => setMounted(false), DURATION);
    return () => clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;
  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 transition-opacity duration-200 ease-out motion-reduce:transition-none sm:p-8 ${
        visible ? "bg-black/40 opacity-100" : "bg-black/0 opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`card w-full ${wide ? "max-w-3xl" : "max-w-lg"} my-auto origin-center transition-all duration-200 ease-out motion-reduce:transition-none ${
          visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-stone-100 px-5 py-3.5">
          <div>
            <h3 className="text-base font-bold text-stone-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-stone-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700">✕</button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        <div className="flex items-center justify-end gap-2 border-t border-stone-100 px-5 py-3">
          {footer ?? (
            <>
              <button onClick={onClose} className="btn-ghost">Cancel</button>
              <button onClick={onClose} className="btn-primary">Save</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ f }: { f: Field }) {
  const base = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-account focus:outline-none focus:ring-1 focus:ring-account";
  if (f.type === "static")
    return <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700">{f.value}</div>;
  if (f.type === "select")
    return (
      <select className={base} defaultValue={f.value}>
        {(f.options ?? []).map((o) => <option key={o}>{o}</option>)}
      </select>
    );
  if (f.type === "textarea")
    return <textarea className={base} rows={3} placeholder={f.placeholder} defaultValue={f.value} />;
  if (f.type === "photo")
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-stone-300 bg-stone-50 px-3 py-3 text-sm text-stone-500">
        <span className="text-2xl">📷</span> Tap to add a photo (optional)
      </div>
    );
  return <input type={f.type ?? "text"} className={base} placeholder={f.placeholder} defaultValue={f.value} />;
}

/**
 * A form modal built from a field spec. `open`/`onClose` control visibility.
 */
export function FormModal({
  open,
  onClose,
  title,
  subtitle,
  fields,
  note,
  saveLabel = "Save",
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fields: Field[];
  note?: string;
  saveLabel?: string;
  wide?: boolean;
}) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      wide={wide}
      footer={
        <>
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleSave} className={`btn-primary ${saved ? "opacity-70" : ""}`}>
            {saved ? "✓ Saved" : saveLabel}
          </button>
        </>
      }
    >
      {saved && (
        <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          ✓ Saved — this is a UI mock-up, so nothing is stored.
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((f, i) => (
          <div key={i} className={f.col === 2 || f.type === "textarea" || f.type === "photo" ? "sm:col-span-2" : ""}>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">{f.label}</label>
            <Input f={f} />
            {f.hint && <p className="mt-1 text-[11px] text-stone-400">{f.hint}</p>}
          </div>
        ))}
      </div>
      {note && <p className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">{note}</p>}
    </Modal>
  );
}
