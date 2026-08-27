import React, { useEffect, useRef, useState } from "react";
import {
  X, Search, Inbox, CheckCircle2, AlertTriangle, Info, Stethoscope, HeartPulse, Bone, Baby,
  Flower2, Slice, Ear, Eye, Brain, ScanLine, Microscope, Activity, Siren, Ticket, Pill,
  ShieldCheck, Home, Truck, Building2, BedDouble, ChevronLeft, ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cx, toneFor, type Tone } from "../lib/utils";

export const ICONS: Record<string, LucideIcon> = {
  Stethoscope, HeartPulse, Bone, Baby, Flower2, Slice, Ear, Eye, Brain, ScanLine, Microscope,
  Activity, Siren, Ticket, Pill, ShieldCheck, Home, Ambulance: Truck, Building2, BedDouble,
};
export function DIcon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  const I = ICONS[name] ?? Stethoscope;
  return <I size={size} className={className} strokeWidth={1.8} />;
}

/* ── badges ── */
const TONE_STYLES: Record<Tone, string> = {
  ok: "bg-okbg text-ok border-ok/25",
  warn: "bg-warnbg text-warn border-warn/25",
  danger: "bg-dangerbg text-danger border-danger/25",
  info: "bg-infobg text-info border-info/25",
  neutral: "bg-paper text-soft border-line",
  primary: "bg-tint text-primary border-primary/25",
  pine: "bg-pine text-[#cfe8de] border-pine2",
};
export function Badge({ tone = "neutral", children, dot, className }: { tone?: Tone; children: React.ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[11px] font-semibold whitespace-nowrap", TONE_STYLES[tone], className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return <Badge tone={toneFor(status)} dot className={className}>{status}</Badge>;
}

/* ── stat card ── */
export function StatCard({ label, value, sub, icon: Icon, tone = "primary", onClick, big }: {
  label: string; value: React.ReactNode; sub?: React.ReactNode; icon?: LucideIcon; tone?: Tone; onClick?: () => void; big?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={!onClick} className={cx("card text-left w-full p-4 group", onClick && "card-hover cursor-pointer")}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-soft">{label}</p>
        {Icon && (
          <span className={cx("rounded-lg p-1.5 border", TONE_STYLES[tone], "transition-transform group-hover:scale-110")}>
            <Icon size={15} strokeWidth={2} />
          </span>
        )}
      </div>
      <p className={cx("font-display font-bold text-ink mt-1.5 tabular-nums", big ? "text-3xl" : "text-2xl")}>{value}</p>
      {sub && <p className="text-xs text-soft mt-1 leading-snug">{sub}</p>}
    </button>
  );
}

/* ── modal & drawer ── */
export function Modal({ open, onClose, title, children, wide, footer }: {
  open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; wide?: boolean; footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-pine/55 backdrop-blur-[2px] anim-fade-in" onClick={onClose} />
      <div className={cx("relative bg-card w-full anim-pop border border-line shadow-2xl rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col", wide ? "sm:max-w-3xl" : "sm:max-w-lg")}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
          <h3 className="font-display font-bold text-ink text-lg">{title}</h3>
          <button onClick={onClose} aria-label="Close dialog" className="btn btn-ghost btn-sm !px-2"><X size={18} /></button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-line flex justify-end gap-2 shrink-0 bg-paper/60 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, children, footer }: {
  open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-pine/55 backdrop-blur-[2px] anim-fade-in" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-line shadow-2xl anim-slide-left flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
          <h3 className="font-display font-bold text-ink text-lg">{title}</h3>
          <button onClick={onClose} aria-label="Close panel" className="btn btn-ghost btn-sm !px-2"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-line shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

/* ── tabs ── */
export function Tabs({ tabs, active, onChange, className }: {
  tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void; className?: string;
}) {
  return (
    <div className={cx("flex gap-1 overflow-x-auto no-scrollbar border-b border-line", className)} role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={active === t.id} onClick={() => onChange(t.id)}
          className={cx("px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors",
            active === t.id ? "border-primary text-primary" : "border-transparent text-soft hover:text-ink")}>
          {t.label}
          {t.count !== undefined && <span className={cx("ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full", active === t.id ? "bg-tint text-primary" : "bg-paper text-soft")}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ── data table ── */
export interface Col<T> { key: string; label: string; render?: (row: T) => React.ReactNode; right?: boolean; w?: string; }
export function DataTable<T extends { id: string }>({ cols, rows, searchable, pageSize = 8, onRow, empty, footerNote }: {
  cols: Col<T>[]; rows: T[]; searchable?: (row: T) => string; pageSize?: number; onRow?: (row: T) => void; empty?: string; footerNote?: string;
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const filtered = searchable && q ? rows.filter((r) => searchable(r).toLowerCase().includes(q.toLowerCase())) : rows;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages - 1);
  const slice = filtered.slice(cur * pageSize, cur * pageSize + pageSize);
  return (
    <div>
      {searchable && (
        <div className="relative mb-3">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search…" className="input !pl-9" aria-label="Search table" />
        </div>
      )}
      {slice.length === 0 ? (
        <EmptyState title={empty ?? "Nothing here yet"} sub={q ? `No results for “${q}”` : "Records will appear here as activity happens."} />
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="tbl min-w-full">
            <thead><tr>{cols.map((c) => <th key={c.key} className={cx(c.right && "text-right")} style={c.w ? { width: c.w } : undefined}>{c.label}</th>)}</tr></thead>
            <tbody>
              {slice.map((r) => (
                <tr key={r.id} onClick={() => onRow?.(r)} className={cx(onRow && "cursor-pointer")}>
                  {cols.map((c) => (
                    <td key={c.key} className={cx(c.right && "text-right")}>{c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key] ?? "—")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-between mt-3 text-xs text-soft">
        <span>{footerNote ?? `${filtered.length} record${filtered.length === 1 ? "" : "s"}`}</span>
        {pages > 1 && (
          <div className="flex items-center gap-1">
            <button className="btn btn-outline btn-sm !px-2" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={cur === 0} aria-label="Previous page"><ChevronLeft size={14} /></button>
            <span className="mono px-2">{cur + 1}/{pages}</span>
            <button className="btn btn-outline btn-sm !px-2" onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={cur >= pages - 1} aria-label="Next page"><ChevronRight size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ title, sub, action, icon: Icon = Inbox }: { title: string; sub?: string; action?: React.ReactNode; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <span className="w-14 h-14 rounded-2xl bg-tint text-primary flex items-center justify-center mb-4"><Icon size={26} strokeWidth={1.6} /></span>
      <p className="font-display font-bold text-ink">{title}</p>
      {sub && <p className="text-sm text-soft mt-1 max-w-sm leading-relaxed">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ── form field ── */
export function Field({ label, children, hint, req }: { label: string; children: React.ReactNode; hint?: string; req?: boolean }) {
  return (
    <div>
      <label className="label">{label}{req && <span className="text-danger ml-0.5">*</span>}</label>
      {children}
      {hint && <p className="text-[11px] text-faint mt-1">{hint}</p>}
    </div>
  );
}

/* ── misc ── */
export function Avatar({ name, hue = 165, size = 40, className }: { name: string; hue?: number; size?: number; className?: string }) {
  const init = name.replace(/^Dr\.?\s+/, "").split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <span className={cx("inline-flex items-center justify-center rounded-full font-display font-bold shrink-0 border", className)}
      style={{ width: size, height: size, fontSize: size * 0.36, background: `hsl(${hue} 42% 92%)`, color: `hsl(${hue} 55% 26%)`, borderColor: `hsl(${hue} 40% 82%)` }}>
      {init}
    </span>
  );
}

export function ECG({ className, color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 560 60" className={cx("ecg overflow-visible", className)} aria-hidden="true" preserveAspectRatio="none">
      <path className="ecg-trace" d="M0 30 H80 L96 30 L104 12 L114 48 L124 22 L132 30 H210 L226 30 L234 8 L244 52 L254 20 L262 30 H350 L366 30 L374 12 L384 48 L394 24 L402 30 H480 L496 30 L504 10 L514 50 L524 22 L532 30 H560"
        fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("on"); ob.disconnect(); } }, { threshold: 0.12 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return <div ref={ref} className={cx("reveal", className)} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

export function Counter({ to, prefix = "", suffix = "", className }: { to: number; prefix?: string; suffix?: string; className?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const ob = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      ob.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 1300);
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    ob.observe(el);
    return () => { ob.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref} className={cx("tabular-nums", className)}>{prefix}{v.toLocaleString("en-IN")}{suffix}</span>;
}

export function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-line/70 last:border-0">
      <span className="text-xs text-soft font-medium shrink-0">{k}</span>
      <span className="text-sm font-semibold text-ink text-right">{v}</span>
    </div>
  );
}

export function SectionHead({ eyebrow, title, sub, light }: { eyebrow?: string; title: string; sub?: string; light?: boolean }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className={cx("text-[11px] font-bold uppercase tracking-[0.18em] mb-2", light ? "text-accent" : "text-primary")}>{eyebrow}</p>}
      <h2 className={cx("font-display font-bold text-3xl sm:text-4xl leading-tight", light ? "text-white" : "text-ink")}>{title}</h2>
      {sub && <p className={cx("mt-3 leading-relaxed", light ? "text-white/70" : "text-soft")}>{sub}</p>}
    </div>
  );
}

/* ── searchable select ── */
export function SearchSelect({ options, value, onChange, placeholder }: {
  options: { id: string; label: string; sub?: string }[]; value: string; onChange: (id: string) => void; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const sel = options.find((o) => o.id === value);
  const list = options.filter((o) => (o.label + " " + (o.sub ?? "")).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="input text-left flex items-center justify-between gap-2">
        <span className={sel ? "text-ink" : "text-faint"}>{sel?.label ?? placeholder ?? "Select…"}</span>
        <Search size={14} className="text-faint shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 w-full bg-card border border-line rounded-xl shadow-xl p-2 anim-pop max-h-64 overflow-y-auto">
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type to filter…" className="input !py-1.5 !text-sm mb-1.5" />
            {list.length === 0 && <p className="text-xs text-soft px-2 py-2">No matches</p>}
            {list.map((o) => (
              <button key={o.id} type="button" onClick={() => { onChange(o.id); setOpen(false); setQ(""); }}
                className={cx("w-full text-left px-2.5 py-2 rounded-lg text-sm hover:bg-tint flex justify-between gap-2", o.id === value && "bg-tint text-primary font-semibold")}>
                <span>{o.label}</span>
                {o.sub && <span className="text-[11px] text-soft">{o.sub}</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── toasts ── */
export function ToastHost({ toasts, dismiss }: { toasts: { id: string; msg: string; kind: "ok" | "err" | "info" }[]; dismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-[95] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={cx("anim-tick flex items-start gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium bg-card",
          t.kind === "ok" && "border-ok/30 text-ok", t.kind === "err" && "border-danger/30 text-danger", t.kind === "info" && "border-info/30 text-info")}>
          {t.kind === "ok" ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> : t.kind === "err" ? <AlertTriangle size={17} className="mt-0.5 shrink-0" /> : <Info size={17} className="mt-0.5 shrink-0" />}
          <span className="text-ink flex-1">{t.msg}</span>
          <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-faint hover:text-ink"><X size={15} /></button>
        </div>
      ))}
    </div>
  );
}

export function DemoTag({ className }: { className?: string }) {
  return <Badge tone="warn" className={className}>Demo data</Badge>;
}

export function PageHead({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">{title}</h1>
        {sub && <p className="text-sm text-soft mt-0.5">{sub}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
