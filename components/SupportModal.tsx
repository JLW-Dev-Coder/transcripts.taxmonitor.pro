"use client";

import { useState, useEffect, useCallback } from "react";

export const SUPPORT_LINKS = {
  ttmp: {
    support: "tax-monitor-pro/tax-monitor-transcript-support",
  },
};

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
  calLink?: string;
}

export default function SupportModal({
  open,
  onClose,
  calLink = SUPPORT_LINKS.ttmp.support,
}: SupportModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "supportFadeIn 200ms ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "85vh",
          background: "var(--surface, #fff)",
          borderRadius: "var(--radius-xl, 16px) var(--radius-xl, 16px) 0 0",
          boxShadow: "var(--shadow-2xl)",
          overflow: "hidden",
          animation: "supportSlideUp 300ms ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--space-4, 1rem) var(--space-6, 1.5rem)",
            borderBottom: "1px solid var(--surface-border, #e5e7eb)",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display, Georgia, serif)",
              fontSize: "var(--text-lg, 1.125rem)",
              fontWeight: 700,
              color: "var(--text, #111827)",
              margin: 0,
            }}
          >
            Schedule Support
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.25rem",
              color: "var(--text-muted, #9ca3af)",
              padding: "var(--space-1, 0.25rem)",
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {/* Cal.com Embed */}
        <div style={{ height: "70vh", overflow: "hidden" }}>
          <iframe
            src={`https://cal.com/${calLink}?embed=true`}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title="Schedule support call"
          />
        </div>
      </div>

      <style>{`
        @keyframes supportFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes supportSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* Convenience button component */
export function SupportButton({
  label = "Get Support",
  calLink,
}: {
  label?: string;
  calLink?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontFamily: "var(--font-body, system-ui, sans-serif)",
          fontSize: "var(--text-sm, 0.875rem)",
          fontWeight: 600,
          color: "#14b8a6",
          background: "rgba(20, 184, 166, 0.1)",
          border: "1px solid rgba(20, 184, 166, 0.3)",
          borderRadius: "var(--radius-full, 9999px)",
          padding: "0.5rem 1.25rem",
          cursor: "pointer",
          transition: "background 150ms ease, border-color 150ms ease",
        }}
      >
        {label}
      </button>
      <SupportModal open={open} onClose={() => setOpen(false)} calLink={calLink} />
    </>
  );
}
