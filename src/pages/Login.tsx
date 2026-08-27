import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, ArrowRight, HeartPulse, Sparkles, Lock } from "lucide-react";
import { useStore, ROLE_META } from "../lib/store";
import type { Role } from "../lib/types";
import { cx } from "../lib/utils";
import { ECG, DemoTag } from "../components/ui";

const DEMO_ROLES: { role: Role; icon: React.ReactNode; blurb: string }[] = [
  { role: "owner", icon: <Sparkles size={17} />, blurb: "Super dashboard & analytics" },
  { role: "receptionist", icon: <HeartPulse size={17} />, blurb: "Tokens, queue & registration" },
  { role: "doctor", icon: <ShieldCheck size={17} />, blurb: "Consultation & prescriptions" },
  { role: "pharmacist", icon: <Lock size={17} />, blurb: "Rx queue & inventory" },
  { role: "lab", icon: <ShieldCheck size={17} />, blurb: "Samples & reports" },
  { role: "nurse", icon: <HeartPulse size={17} />, blurb: "Vitals & medication" },
  { role: "accountant", icon: <Lock size={17} />, blurb: "Billing & accounts" },
  { role: "patient", icon: <HeartPulse size={17} />, blurb: "Personal health portal" },
];

export default function Login() {
  const { s, a, toast } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState("demo@aarogyam.demo");
  const [pwd, setPwd] = useState("hospital360");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [sel, setSel] = useState<Role>("owner");

  const go = (role: Role) => {
    const u = a.login(role);
    nav(ROLE_META[u.role].home);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1.15fr]">
      {/* brand panel */}
      <div className="bg-pine text-white p-8 lg:p-12 flex flex-col relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="flex items-center gap-3 relative">
          <span className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center"><HeartPulse size={23} /></span>
          <div>
            <p className="font-display font-bold text-lg leading-tight">{s.settings.shortName} · {s.settings.city}</p>
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/45">ITCYBER Hospital360 OS</p>
          </div>
        </div>
        <div className="my-auto py-12 relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">The hospital's operating system</p>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl leading-[1.08] mt-4">One login.<br />The whole hospital.</h1>
          <p className="text-white/60 mt-5 max-w-md leading-relaxed">Website, OPD tokens, prescriptions, pharmacy, lab, billing, HR and owner analytics — every role sees exactly what it needs, nothing more.</p>
          <ECG className="w-full max-w-md h-10 text-accent/50 mt-8" />
          <div className="flex flex-wrap gap-2 mt-6">
            {["Role-based access", "Audit logged", "RLS-ready"].map((x) => <span key={x} className="chip !bg-white/8 !border-white/15 !text-white/75"><ShieldCheck size={12} className="text-accent" /> {x}</span>)}
          </div>
        </div>
        <p className="text-[11px] text-white/40 relative">Demo environment · fictional data · nothing leaves your browser</p>
      </div>

      {/* form panel */}
      <div className="p-6 sm:p-12 flex items-center justify-center bg-paper crossgrid">
        <div className="w-full max-w-lg anim-fade-up">
          <h2 className="font-display font-extrabold text-3xl text-ink">Sign in</h2>
          <p className="text-soft mt-1.5 text-sm">Use your hospital credentials — or a one-tap demo role below.</p>

          <form className="card p-6 mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); go(sel); }}>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </div>
            <div>
              <label className="label" htmlFor="pwd">Password</label>
              <div className="relative">
                <input id="pwd" type={show ? "text" : "password"} className="input pr-11" value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="current-password" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-ink" aria-label={show ? "Hide password" : "Show password"}>
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-soft cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-[var(--primary)] w-4 h-4" /> Remember me
              </label>
              <button type="button" className="text-sm font-semibold text-primary hover:underline" onClick={() => toast("Password reset link sent to your email (demo)", "info")}>Forgot password?</button>
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full">Sign in as {ROLE_META[sel].label} <ArrowRight size={17} /></button>
          </form>

          <div className="mt-7">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-soft"><DemoTag /> One-tap demo roles</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 stagger">
              {DEMO_ROLES.map((r) => (
                <button key={r.role} onClick={() => setSel(r.role)} onDoubleClick={() => go(r.role)}
                  className={cx("rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5", sel === r.role ? "border-primary bg-tint shadow-md ring-2 ring-primary/15" : "border-line bg-card hover:border-primary/40")}>
                  <span className={cx("w-8 h-8 rounded-lg flex items-center justify-center", sel === r.role ? "bg-primary text-white" : "bg-tint text-primary")}>{r.icon}</span>
                  <p className="text-xs font-bold text-ink mt-2 leading-tight">{ROLE_META[r.role].label}</p>
                  <p className="text-[10px] text-soft mt-0.5 leading-tight">{r.blurb}</p>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-faint mt-3">Select a role, then press “Sign in” — or double-click a card. Demo convenience only; production uses Supabase Auth + RLS.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
