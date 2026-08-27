import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, Users, Stethoscope, BedDouble, HeartHandshake, FlaskConical,
  ScanLine, Pill, Receipt, Briefcase, ClipboardList, Boxes, Truck, Star, BarChart3, Settings,
  Bell, Search, Sparkles, LogOut, Menu, X, ChevronRight, ShieldAlert, Play, ExternalLink, RotateCcw,
  Syringe, Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useStore, ROLE_META, lowStockMeds, expiringMeds, bedStats, unreadCount, todayRevenue, invBalance } from "../lib/store";
import type { Role } from "../lib/types";
import { cx, inr, timeAgo, fmtDateShort, initials } from "../lib/utils";
import { Badge, Drawer, ECG, Modal, DemoTag } from "../components/ui";

interface NavItem { to: string; label: string; icon: LucideIcon; roles: Role[]; }
interface NavGroup { label: string; items: NavItem[]; }

const ALL: Role[] = ["owner", "admin", "receptionist", "doctor", "nurse", "pharmacist", "lab", "radiology", "accountant", "hr"];
const MGMT: Role[] = ["owner", "admin"];

const NAV: NavGroup[] = [
  { label: "Overview", items: [{ to: "/app/dash", label: "Dashboard", icon: LayoutDashboard, roles: ALL }] },
  {
    label: "Patient Care", items: [
      { to: "/app/appointments", label: "Appointments", icon: CalendarDays, roles: ["owner", "admin", "receptionist", "doctor"] },
      { to: "/app/patients", label: "Patients", icon: Users, roles: ["owner", "admin", "receptionist", "doctor", "nurse"] },
      { to: "/app/ipd", label: "IPD / Admissions", icon: ClipboardList, roles: ["owner", "admin", "doctor", "nurse", "receptionist"] },
      { to: "/app/beds", label: "Bed Management", icon: BedDouble, roles: ["owner", "admin", "nurse", "receptionist", "doctor"] },
      { to: "/app/nursing", label: "Nursing", icon: HeartHandshake, roles: ["owner", "admin", "nurse"] },
    ],
  },
  {
    label: "Clinical", items: [
      { to: "/app/doctors", label: "Doctors", icon: Stethoscope, roles: ["owner", "admin", "doctor", "receptionist"] },
      { to: "/app/lab", label: "Laboratory", icon: FlaskConical, roles: ["owner", "admin", "lab", "doctor"] },
      { to: "/app/radiology", label: "Radiology", icon: ScanLine, roles: ["owner", "admin", "radiology", "doctor"] },
      { to: "/app/ot", label: "Operation Theatre", icon: Syringe, roles: ["owner", "admin", "doctor", "nurse"] },
    ],
  },
  {
    label: "Pharmacy", items: [
      { to: "/app/pharmacy?tab=queue", label: "Prescription Queue", icon: Pill, roles: ["owner", "admin", "pharmacist", "doctor"] },
      { to: "/app/pharmacy?tab=meds", label: "Medicines & Stock", icon: Boxes, roles: ["owner", "admin", "pharmacist"] },
      { to: "/app/pharmacy?tab=alerts", label: "Stock Alerts", icon: ShieldAlert, roles: ["owner", "admin", "pharmacist"] },
      { to: "/app/pharmacy?tab=purchase", label: "Purchases & Suppliers", icon: Truck, roles: ["owner", "admin", "pharmacist"] },
    ],
  },
  {
    label: "Business", items: [
      { to: "/app/billing", label: "Billing & Payments", icon: Receipt, roles: ["owner", "admin", "accountant", "receptionist"] },
      { to: "/app/accounts", label: "Accounts & Expenses", icon: Briefcase, roles: ["owner", "admin", "accountant"] },
    ],
  },
  {
    label: "Workforce", items: [
      { to: "/app/staff", label: "Staff", icon: Users, roles: ["owner", "admin", "hr"] },
      { to: "/app/attendance", label: "Attendance & Shifts", icon: Activity, roles: ["owner", "admin", "hr"] },
      { to: "/app/leaves", label: "Leaves & Payroll", icon: ClipboardList, roles: ["owner", "admin", "hr"] },
    ],
  },
  {
    label: "Operations", items: [
      { to: "/app/inventory", label: "Hospital Inventory", icon: Boxes, roles: MGMT },
      { to: "/app/assets", label: "Assets & AMC", icon: Stethoscope, roles: MGMT },
      { to: "/app/ambulance", label: "Ambulance", icon: Truck, roles: MGMT },
      { to: "/app/feedback", label: "Patient Feedback", icon: Star, roles: ["owner", "admin", "receptionist"] },
    ],
  },
  {
    label: "Insights", items: [
      { to: "/app/analytics", label: "Analytics & Reports", icon: BarChart3, roles: MGMT },
      { to: "/app/audit", label: "Audit Logs", icon: ShieldAlert, roles: MGMT },
    ],
  },
  { label: "System", items: [{ to: "/app/settings", label: "Settings & CMS", icon: Settings, roles: MGMT }] },
];

function navFor(role: Role): NavGroup[] {
  return NAV.map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(role)) })).filter((g) => g.items.length);
}

/* ── live clock ── */
function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return <span className="mono text-xs text-soft hidden md:block">{now.toLocaleTimeString("en-IN")} · {now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</span>;
}

/* ── command palette ── */
function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { s } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  useEffect(() => { if (open) setQ(""); }, [open]);
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const l = q.toLowerCase();
    const out: { group: string; label: string; sub: string; to: string }[] = [];
    s.patients.filter((p) => (p.name + p.uhid + p.mobile).toLowerCase().includes(l)).slice(0, 4)
      .forEach((p) => out.push({ group: "Patients", label: p.name, sub: p.uhid, to: `/app/patients/${p.id}` }));
    s.doctors.filter((d) => (d.name + d.specialty).toLowerCase().includes(l)).slice(0, 4)
      .forEach((d) => out.push({ group: "Doctors", label: d.name, sub: d.specialty, to: `/app/doctors` }));
    s.appointments.filter((a) => a.no.toLowerCase().includes(l)).slice(0, 3)
      .forEach((a) => out.push({ group: "Appointments", label: a.no, sub: s.patients.find((p) => p.id === a.patientId)?.name ?? "", to: "/app/appointments" }));
    s.medicines.filter((m) => (m.name + m.generic + m.brand).toLowerCase().includes(l)).slice(0, 4)
      .forEach((m) => out.push({ group: "Medicines", label: m.name, sub: `Stock ${m.stock}`, to: "/app/pharmacy?tab=meds" }));
    s.invoices.filter((i) => i.no.toLowerCase().includes(l)).slice(0, 3)
      .forEach((i) => out.push({ group: "Invoices", label: i.no, sub: s.patients.find((p) => p.id === i.patientId)?.name ?? "", to: "/app/billing" }));
    s.staff.filter((e) => (e.name + e.empId).toLowerCase().includes(l)).slice(0, 3)
      .forEach((e) => out.push({ group: "Staff", label: e.name, sub: e.empId, to: "/app/staff" }));
    s.prescriptions.filter((r) => r.no.toLowerCase().includes(l)).slice(0, 3)
      .forEach((r) => out.push({ group: "Prescriptions", label: r.no, sub: s.patients.find((p) => p.id === r.patientId)?.name ?? "", to: "/app/pharmacy?tab=queue" }));
    return out;
  }, [q, s]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[85] flex items-start justify-center pt-[12vh] px-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-pine/60 backdrop-blur-[2px] anim-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-card rounded-2xl border border-line shadow-2xl anim-pop overflow-hidden">
        <div className="flex items-center gap-2 px-4 border-b border-line">
          <Search size={17} className="text-faint" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients, doctors, medicines, invoices…"
            className="flex-1 py-3.5 text-sm bg-transparent outline-none" aria-label="Global search" />
          <kbd className="mono text-[10px] text-faint border border-line rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {!q.trim() && <p className="text-xs text-soft px-3 py-6 text-center">Try “Rohan”, “Azithromycin”, “INV-2026” or “A-1052”</p>}
          {q.trim() && results.length === 0 && <p className="text-xs text-soft px-3 py-6 text-center">No matches for “{q}”</p>}
          {results.map((r, i) => (
            <button key={i} onClick={() => { nav(r.to); onClose(); }}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-tint text-left anim-fade-in">
              <span className="flex items-center gap-3 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-tint rounded px-1.5 py-0.5 shrink-0">{r.group}</span>
                <span className="text-sm font-semibold text-ink truncate">{r.label}</span>
                <span className="text-xs text-soft truncate hidden sm:block">{r.sub}</span>
              </span>
              <ChevronRight size={14} className="text-faint shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── AI assistant ── */
function AiDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { s } = useStore();
  const [msgs, setMsgs] = useState<{ from: "me" | "ai"; text: string }[]>([
    { from: "ai", text: "Namaste! I'm H360 Assist — the hospital's operational assistant. Ask me about today's revenue, low-stock medicines, bed occupancy, a doctor's schedule or pending bills." },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);

  const answer = (q: string): string => {
    const t = q.toLowerCase();
    const doc = s.doctors.find((d) => t.includes(d.name.replace("Dr. ", "").toLowerCase().split(" ")[0]));
    if (t.includes("revenue") || t.includes("collection")) {
      const r = todayRevenue(s);
      return `Today's collections are ${inr(r)} across ${s.payments.filter((p) => p.at.slice(0, 10) === new Date().toISOString().slice(0, 10)).length} payments. Yesterday closed at ${inr(s.revenueHistory[s.revenueHistory.length - 1].opd + s.revenueHistory[s.revenueHistory.length - 1].ipd + s.revenueHistory[s.revenueHistory.length - 1].pharmacy + s.revenueHistory[s.revenueHistory.length - 1].lab + s.revenueHistory[s.revenueHistory.length - 1].radiology)} total.`;
    }
    if (t.includes("low stock") || t.includes("reorder")) {
      const ls = lowStockMeds(s);
      return ls.length ? `${ls.length} medicine(s) are at or below minimum stock: ${ls.slice(0, 4).map((m) => `${m.name} (${m.stock}/${m.min})`).join(", ")}. Raise a purchase from Pharmacy → Purchases.` : "All medicines are above their minimum stock levels.";
    }
    if (t.includes("expir")) {
      const e30 = expiringMeds(s, 30).length, e60 = expiringMeds(s, 60).length, e90 = expiringMeds(s, 90).length;
      return `Expiry watch: ${e30} within 30 days · ${e60} within 60 days · ${e90} within 90 days. Oldest: ${expiringMeds(s, 90).sort((a, b) => a.expiry.localeCompare(b.expiry))[0]?.name ?? "—"}.`;
    }
    if (t.includes("bed") || t.includes("occupancy")) {
      const b = bedStats(s);
      return `Bed occupancy is ${b.pct}% — ${b.occupied} occupied of ${b.total}. ${b.available} beds are available right now. ICU: ${s.beds.filter((x) => x.ward === "ICU" && x.status === "Available").length} free.`;
    }
    if (t.includes("pending") && (t.includes("bill") || t.includes("receivable"))) {
      const pend = s.invoices.filter((i) => i.status !== "Paid");
      return `${pend.length} invoices are pending, totalling ${inr(pend.reduce((a, i) => a + invBalance(s, i.id), 0))}. Largest: ${pend[0]?.no ?? "—"} (${s.patients.find((p) => p.id === pend[0]?.patientId)?.name ?? ""}).`;
    }
    if (doc) {
      const todays = s.appointments.filter((a) => a.doctorId === doc.id && a.date === new Date().toISOString().slice(0, 10) && a.status !== "Cancelled");
      const next = todays.find((a) => a.status === "Booked");
      return `${doc.name} (${doc.specialty}) sits ${doc.days.join(", ")} · ${doc.from}–${doc.to}. Today: ${todays.length} appointment(s). ${next ? `Next slot: ${next.slot} for ${s.patients.find((p) => p.id === next.patientId)?.name}.` : "No open slots remain today."}`;
    }
    if (t.includes("follow-up") || t.includes("follow up")) {
      const fu = s.consultations.filter((c) => c.followUp === new Date().toISOString().slice(0, 10));
      return `${fu.length} follow-up(s) are due today: ${fu.map((c) => s.patients.find((p) => p.id === c.patientId)?.name).join(", ") || "none"}.`;
    }
    if (t.includes("appointment")) {
      const today = s.appointments.filter((a) => a.date === new Date().toISOString().slice(0, 10));
      return `Today: ${today.length} appointments — ${today.filter((a) => a.status === "Completed").length} completed, ${today.filter((a) => a.status === "Waiting").length} waiting, ${today.filter((a) => a.status === "Booked").length} yet to arrive.`;
    }
    if (t.includes("hi") || t.includes("hello") || t.includes("namaste")) return "Namaste! How can I help — try “today's revenue”, “low stock”, “bed occupancy” or “Dr. Sharma's schedule”.";
    return "I can help with operational questions: revenue, appointments, doctor schedules, stock, expiries, beds and pending bills. For anything clinical, please consult the treating doctor.";
  };

  const send = (override?: string) => {
    const q = (override ?? input).trim();
    if (!q) return;
    setMsgs((m) => [...m, { from: "me", text: q }]);
    setInput("");
    setTimeout(() => setMsgs((m) => [...m, { from: "ai", text: answer(q) }]), 500);
  };

  return (
    <Drawer open={open} onClose={onClose} title={<span className="flex items-center gap-2"><Sparkles size={18} className="text-primary" /> H360 Assist <Badge tone="primary">AI-ready</Badge></span>}>
      <div className="space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={cx("max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed anim-tick", m.from === "ai" ? "bg-tint text-ink rounded-tl-sm" : "bg-pine text-white ml-auto rounded-tr-sm")}>{m.text}</div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-4">
        {["Today's revenue?", "Low stock?", "Bed occupancy", "Dr. Sharma ka schedule"].map((c) => (
          <button key={c} onClick={() => send(c)} className="chip hover:border-primary hover:text-primary cursor-pointer">{c}</button>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-faint leading-relaxed border border-warn/30 bg-warnbg rounded-lg p-2.5">
        <strong>Safety:</strong> H360 Assist answers operational questions only. It never diagnoses, prescribes, changes dosages or replaces a doctor.
      </p>
    </Drawer>
  );
}

/* ── demo tour ── */
const TOUR: { title: string; body: string; to?: string }[] = [
  { title: "The 7-minute Hospital360 tour", body: "We'll walk the exact journey of one patient — from the public website to the owner dashboard. Each step is LIVE: whatever you do actually flows through the system." },
  { title: "1 · Patient Website", body: "This is what your patients see: departments, doctors with OPD timings, health packages, emergency numbers and one-tap WhatsApp. Try the sticky Call / WhatsApp / Appointment bar on mobile.", to: "/" },
  { title: "2 · Book Appointment", body: "Pick Orthopaedics → Dr. Rahul Sharma → a 10:30-style slot → patient details → confirm. The moment it's submitted, reception can see it. No phone calls, no register book.", to: "/book" },
  { title: "3 · Reception & Tokens", body: "The receptionist checks the patient in — the system prints Token 12 and the lobby TV updates instantly. Walk-ins get tokens the same way.", to: "/app/reception" },
  { title: "4 · Doctor Consultation", body: "Dr. Sharma sees Token 12 on his queue, opens vitals, applies a template, types the diagnosis — and adds medicines with dose, frequency and duration.", to: "/app/doctor" },
  { title: "5 · Prescription → Pharmacy", body: "One click: 'Send to Hospital Pharmacy'. The pharmacist sees the order instantly, marks it Preparing → Ready → Dispensed.", to: "/app/pharmacy" },
  { title: "6 · Stock, Bill, Payment", body: "Dispensing auto-decreases medicine stock and adds the pharmacy amount to the patient's bill. The cashier records the payment in cash/UPI/card.", to: "/app/billing" },
  { title: "7 · Owner Dashboard", body: "Back here — today's revenue, pharmacy sales, occupancy and receivables all moved because of that one patient. That's the whole hospital, one screen.", to: "/app/dash" },
];
function TourModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const nav = useNavigate();
  useEffect(() => { if (open) setStep(0); }, [open]);
  const st = TOUR[step];
  const go = () => { if (st.to) nav(st.to); if (step < TOUR.length - 1) setStep(step + 1); else onClose(); };
  return (
    <Modal open={open} onClose={onClose} title={<span className="flex items-center gap-2"><Play size={17} className="text-primary" /> Sales Demo Tour</span>}
      footer={<>
        <button className="btn btn-ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</button>
        <button className="btn btn-primary" onClick={go}>{step === TOUR.length - 1 ? "Finish tour" : step === 0 ? "Start →" : "Next step →"}</button>
      </>}>
      <div className="flex gap-1.5 mb-4">{TOUR.map((_, i) => <span key={i} className={cx("h-1.5 flex-1 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-line")} />)}</div>
      <h4 className="font-display font-bold text-xl text-ink">{st.title}</h4>
      <p className="text-sm text-soft leading-relaxed mt-2">{st.body}</p>
      <p className="text-[11px] text-faint mt-4">Step {step + 1} of {TOUR.length} · ~7 minutes total</p>
    </Modal>
  );
}

/* ── main layout ── */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { s, a, toast } = useStore();
  const loc = useLocation();
  const nav = useNavigate();
  const [side, setSide] = useState(false);
  const [notif, setNotif] = useState(false);
  const [ai, setAi] = useState(false);
  const [palette, setPalette] = useState(false);
  const [tour, setTour] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const user = s.user!;
  const groups = navFor(user.role);
  const unread = unreadCount(s);
  const roleHome = ROLE_META[user.role].home;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  useEffect(() => { setSide(false); }, [loc.pathname, loc.search]);

  const isDash = loc.pathname === "/app/dash";
  const dashTarget = roleHome === "/app/owner" ? "/app/owner" : roleHome;

  return (
    <div className="min-h-screen flex bg-paper">
      {/* sidebar */}
      <aside className={cx("fixed lg:sticky top-0 h-screen z-[60] w-[264px] bg-pine text-white flex flex-col transition-transform lg:translate-x-0 shrink-0", side ? "translate-x-0" : "-translate-x-full")}>
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center"><HeartHandshake size={19} /></span>
            <span className="leading-tight">
              <span className="block font-display font-bold text-[15px]">{s.settings.shortName}</span>
              <span className="block text-[9.5px] font-semibold tracking-[0.16em] uppercase text-white/40">Hospital360 OS</span>
            </span>
          </Link>
          <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setSide(false)} aria-label="Close sidebar"><X size={19} /></button>
        </div>
        <div className="px-4 pt-4">
          <ECG className="w-full h-6 text-accent/30" />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-3 no-scrollbar" aria-label="Modules">
          {groups.map((g) => (
            <div key={g.label} className="mb-4">
              <p className="px-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35 mb-1.5">{g.label}</p>
              {g.items.map((it) => {
                const to = it.to === "/app/dash" ? dashTarget : it.to;
                const active = loc.pathname + loc.search === to || (it.to === "/app/dash" && isDash);
                const I = it.icon;
                return (
                  <Link key={it.to} to={to} className={cx("flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-semibold mb-0.5 transition-all",
                    active ? "bg-primary text-white shadow-md" : "text-white/65 hover:text-white hover:bg-white/8")}>
                    <I size={16} strokeWidth={1.9} /> {it.label}
                    {it.label === "Prescription Queue" && s.pharmacyOrders.filter((o) => o.status !== "Dispensed").length > 0 && (
                      <span className="ml-auto text-[10px] bg-accent text-pine font-bold rounded-full px-1.5 py-0.5">{s.pharmacyOrders.filter((o) => o.status !== "Dispensed").length}</span>
                    )}
                    {it.label === "Stock Alerts" && lowStockMeds(s).length > 0 && (
                      <span className="ml-auto text-[10px] bg-warn text-white font-bold rounded-full px-1.5 py-0.5">{lowStockMeds(s).length}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Link to="/" className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] font-semibold text-white/65 hover:bg-white/8 hover:text-white">
            <ExternalLink size={15} /> Public website
          </Link>
          <button onClick={() => setTour(true)} className="w-full mt-1 btn btn-primary btn-sm justify-center"><Play size={14} /> Start Demo Tour</button>
        </div>
      </aside>
      {side && <div className="fixed inset-0 z-[55] bg-pine/50 lg:hidden" onClick={() => setSide(false)} />}

      {/* main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 bg-card/92 backdrop-blur border-b border-line">
          <div className="px-4 lg:px-6 h-[60px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button className="lg:hidden btn btn-outline btn-sm !px-2.5" onClick={() => setSide(true)} aria-label="Open sidebar"><Menu size={17} /></button>
              <button onClick={() => setPalette(true)} className="hidden sm:flex items-center gap-2 border border-line rounded-lg px-3 py-2 text-sm text-faint hover:border-primary hover:text-primary transition-colors bg-white w-64 lg:w-80">
                <Search size={15} /> <span className="flex-1 text-left">Search anything…</span>
                <kbd className="mono text-[10px] border border-line rounded px-1.5 py-0.5">⌘K</kbd>
              </button>
              <DemoTag className="hidden md:inline-flex" />
            </div>
            <div className="flex items-center gap-2">
              <Clock />
              <button onClick={() => setAi(true)} className="btn btn-outline btn-sm" aria-label="Open AI assistant"><Sparkles size={15} className="text-primary" /><span className="hidden md:inline">Ask AI</span></button>
              <button onClick={() => { setNotif(true); }} className="btn btn-outline btn-sm !px-2.5 relative" aria-label={`Notifications (${unread} unread)`}>
                <Bell size={16} />
                {unread > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 anim-pop">{unread}</span>}
              </button>
              <div className="relative">
                <button onClick={() => setUserMenu(!userMenu)} className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-lg border border-line hover:border-primary transition-colors bg-white" aria-label="User menu">
                  <span className="w-7 h-7 rounded-md bg-primary text-white text-[11px] font-bold flex items-center justify-center">{initials(user.name)}</span>
                  <span className="hidden sm:block text-left leading-tight">
                    <span className="block text-xs font-bold text-ink">{user.name}</span>
                    <span className="block text-[10px] text-soft">{ROLE_META[user.role].label}</span>
                  </span>
                </button>
                {userMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                    <div className="absolute right-0 mt-1.5 w-52 bg-card border border-line rounded-xl shadow-xl p-1.5 z-50 anim-pop">
                      <Link to={roleHome} onClick={() => setUserMenu(false)} className="block px-3 py-2 text-sm font-semibold rounded-lg hover:bg-tint">My dashboard</Link>
                      <Link to="/" onClick={() => setUserMenu(false)} className="block px-3 py-2 text-sm font-semibold rounded-lg hover:bg-tint">Public website</Link>
                      <button onClick={() => { a.logout(); nav("/login"); }} className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg hover:bg-dangerbg text-danger flex items-center gap-2"><LogOut size={14} /> Sign out</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>

      {/* notifications drawer */}
      <Drawer open={notif} onClose={() => setNotif(false)} title={<span className="flex items-center gap-2"><Bell size={17} className="text-primary" /> Notifications {unread > 0 && <Badge tone="danger">{unread} new</Badge>}</span>}
        footer={<button className="btn btn-outline btn-sm w-full" onClick={() => { a.markNoticesRead(); toast("All notifications marked as read", "ok"); }}>Mark all as read</button>}>
        <div className="space-y-2.5">
          {s.notices.map((n) => (
            <div key={n.id} className={cx("rounded-xl border p-3.5 transition-colors", n.read ? "border-line bg-white" : "border-primary/30 bg-tint/50")}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-ink leading-snug">{n.title}</p>
                {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 live-dot text-primary" />}
              </div>
              <p className="text-xs text-soft mt-1 leading-relaxed">{n.body}</p>
              <p className="mono text-[10px] text-faint mt-1.5">{timeAgo(n.at)} · {fmtDateShort(n.at)}</p>
            </div>
          ))}
        </div>
      </Drawer>

      <AiDrawer open={ai} onClose={() => setAi(false)} />
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      <TourModal open={tour} onClose={() => setTour(false)} />
    </div>
  );
}

export { RotateCcw };
