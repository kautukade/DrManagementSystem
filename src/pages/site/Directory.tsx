import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight, BadgeCheck, CalendarDays, Clock, Globe2, Languages, MapPin, Phone, Siren,
  ShieldCheck, Star, Stethoscope, Send, ChevronRight, GraduationCap, Award, HeartHandshake, Mail, MessageCircle,
} from "lucide-react";
import { useStore, patOf, docOf, invTotal, invPaid } from "../../lib/store";
import type { Doctor } from "../../lib/types";
import { HERO_IMG } from "../../lib/data";
import { cx, fmtDate, fmtDateShort, inr, WA_LINK, MAPS_LINK } from "../../lib/utils";
import { Avatar, Badge, DIcon, EmptyState, Field, Reveal, SectionHead, StatusBadge, DemoTag, ECG } from "../../components/ui";

function Band({ title, sub, crumb }: { title: string; sub?: string; crumb?: string }) {
  return (
    <div className="bg-pine text-white relative overflow-hidden">
      <ECG className="absolute right-0 top-1/2 -translate-y-1/2 w-[420px] h-16 text-accent/25 hidden md:block" />
      <div className="max-w-7xl mx-auto px-4 py-10 relative">
        {crumb && <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent mb-2">{crumb}</p>}
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl">{title}</h1>
        {sub && <p className="text-white/65 mt-2 max-w-2xl">{sub}</p>}
      </div>
    </div>
  );
}

/* ═══ doctor card (shared) ═══ */
export function DoctorCard({ d }: { d: Doctor }) {
  const { s } = useStore();
  const dept = s.departments.find((x) => x.id === d.deptId);
  return (
    <div className="card card-hover p-5 flex flex-col h-full">
      <div className="flex items-center gap-3.5">
        <Avatar name={d.name} hue={d.hue} size={52} />
        <div className="min-w-0">
          <p className="font-display font-bold text-ink leading-tight">{d.name}</p>
          <p className="text-[11px] text-soft">{d.quals}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        <Badge tone="primary">{dept?.name ?? d.specialty}</Badge>
        <Badge tone="neutral">{d.years} yrs exp</Badge>
      </div>
      <div className="mt-3 space-y-1.5 text-xs text-soft">
        <p className="flex items-center gap-2"><Clock size={13} className="text-primary" /> {d.days[0]}–{d.days[d.days.length - 1]} · {d.from}–{d.to}</p>
        <p className="flex items-center gap-2"><Languages size={13} className="text-primary" /> {d.languages.join(", ")}</p>
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t border-line">
        <Link to={`/doctors/${d.id}`} className="btn btn-outline btn-sm flex-1">Profile</Link>
        <Link to={`/book/${d.id}`} className="btn btn-primary btn-sm flex-1">Book · ₹{d.fee}</Link>
      </div>
    </div>
  );
}

/* ═══ doctors list ═══ */
export function DoctorsPage() {
  const { s } = useStore();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("");
  const list = s.doctors.filter((d) =>
    (d.name + d.specialty + d.quals).toLowerCase().includes(q.toLowerCase()) && (!dept || d.deptId === dept));
  return (
    <div>
      <Band crumb="Medical Team" title="Our Doctors" sub={`${s.doctors.length} consultants across ${s.departments.length} departments — every profile shows real OPD timings and live availability.`} />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-wrap gap-3 items-center mb-7">
          <input className="input max-w-xs" placeholder="Search name or specialty…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search doctors" />
          <select className="select max-w-[220px]" value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Filter by department">
            <option value="">All departments</option>
            {s.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <span className="text-sm text-soft ml-auto">{list.length} doctor(s)</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
          {list.map((d) => <DoctorCard key={d.id} d={d} />)}
        </div>
        {list.length === 0 && <EmptyState title="No doctors match" sub="Try a different name or department filter." />}
      </div>
    </div>
  );
}

/* ═══ doctor detail ═══ */
export function DoctorDetailPage() {
  const { s } = useStore();
  const { id } = useParams();
  const d = s.doctors.find((x) => x.id === id);
  if (!d) return <EmptyState title="Doctor not found" sub="This doctor may have been removed from the directory." action={<Link to="/doctors" className="btn btn-primary">Browse doctors</Link>} />;
  const dept = s.departments.find((x) => x.id === d.deptId);
  const others = s.doctors.filter((x) => x.deptId === d.deptId && x.id !== d.id);
  return (
    <div>
      <Band crumb={dept?.name ?? d.specialty} title={d.name} sub={`${d.quals} · ${d.years} years of experience`} />
      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-8 anim-fade-up">
          <div className="card p-6 flex flex-wrap gap-6 items-start">
            <Avatar name={d.name} hue={d.hue} size={88} />
            <div className="flex-1 min-w-[240px]">
              <div className="flex flex-wrap gap-2">
                <Badge tone="primary" dot>Available for OPD</Badge>
                <Badge tone="neutral">{dept?.name}</Badge>
                <Badge tone="neutral">Fee ₹{d.fee}</Badge>
              </div>
              <p className="text-soft leading-relaxed mt-4 text-[15px]">{d.bio}</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-5">
                <div>
                  <p className="label"><GraduationCap size={12} className="inline mr-1" />Qualifications</p>
                  <p className="text-sm font-semibold text-ink">{d.quals}</p>
                </div>
                <div>
                  <p className="label"><Languages size={12} className="inline mr-1" />Languages</p>
                  <p className="text-sm font-semibold text-ink">{d.languages.join(" · ")}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-display font-bold text-ink text-lg">Procedures & special interests</h3>
            <div className="flex flex-wrap gap-2 mt-3">{d.procedures.map((p) => <span key={p} className="chip"><BadgeCheck size={12} className="text-ok" /> {p}</span>)}</div>
          </div>
          <div className="card p-6">
            <h3 className="font-display font-bold text-ink text-lg">OPD schedule</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => {
                const on = d.days.includes(day);
                return (
                  <div key={day} className={cx("rounded-xl border p-3 text-center", on ? "border-primary/30 bg-tint" : "border-line opacity-45")}>
                    <p className="text-[11px] font-bold uppercase text-soft">{day}</p>
                    <p className={cx("text-xs font-bold mt-1", on ? "text-primary" : "text-faint")}>{on ? `${d.from}–${d.to}` : "Closed"}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-faint mt-3">Sunday: emergency cover only. Timings are demo data managed from Hospital360 Settings.</p>
          </div>
          {others.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-ink text-lg mb-3">Also in {dept?.name}</h3>
              <div className="grid sm:grid-cols-2 gap-4">{others.map((x) => <DoctorCard key={x.id} d={x} />)}</div>
            </div>
          )}
        </div>
        <aside className="space-y-4 anim-slide-left h-fit lg:sticky lg:top-24">
          <div className="card p-5">
            <p className="font-display font-bold text-ink">Book with {d.name.split(" ")[1]}</p>
            <p className="text-xs text-soft mt-1">Live slots · instant confirmation · reception gets it instantly.</p>
            <Link to={`/book/${d.id}`} className="btn btn-primary w-full mt-4 justify-center"><CalendarDays size={15} /> Book appointment</Link>
            <a href={`tel:${s.settings.phone}`} className="btn btn-outline w-full mt-2 justify-center"><Phone size={15} /> Call hospital</a>
          </div>
          <div className="rounded-2xl bg-pine text-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-accent">Today's OPD</p>
            <p className="font-display font-extrabold text-3xl mt-1">{s.appointments.filter((a) => a.doctorId === d.id && a.date === new Date().toISOString().slice(0, 10) && a.status !== "Cancelled").length} patients</p>
            <p className="text-[11px] text-white/55 mt-1">Live from the hospital system (demo)</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ═══ departments ═══ */
export function DepartmentsPage() {
  const { s } = useStore();
  return (
    <div>
      <Band crumb="Centres of Care" title="Departments" sub="Every department is connected — your reports, prescriptions and bills follow you across all of them." />
      <div className="max-w-7xl mx-auto px-4 py-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {s.departments.map((d) => (
          <div key={d.id} className="card card-hover p-6 flex flex-col">
            <div className="flex items-start justify-between">
              <span className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `hsl(${d.hue} 45% 93%)`, color: `hsl(${d.hue} 55% 32%)` }}><DIcon name={d.icon} size={23} /></span>
              <Badge tone="neutral">{s.doctors.filter((x) => x.deptId === d.id).length} doctors</Badge>
            </div>
            <h3 className="font-display font-bold text-lg text-ink mt-4">{d.name}</h3>
            <p className="text-sm text-soft mt-1.5 leading-relaxed">{d.short}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">{d.services.slice(0, 3).map((x) => <span key={x} className="chip">{x}</span>)}</div>
            <div className="flex gap-2 mt-5 pt-4 border-t border-line">
              <Link to={`/departments/${d.id}`} className="btn btn-outline btn-sm flex-1">Details</Link>
              <Link to="/book" className="btn btn-primary btn-sm flex-1">Book</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DepartmentDetailPage() {
  const { s } = useStore();
  const { id } = useParams();
  const d = s.departments.find((x) => x.id === id);
  if (!d) return <EmptyState title="Department not found" action={<Link to="/departments" className="btn btn-primary">All departments</Link>} />;
  const docs = s.doctors.filter((x) => x.deptId === d.id);
  return (
    <div>
      <Band crumb="Department" title={d.name} sub={d.desc} />
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        <div className="card p-6">
          <h3 className="font-display font-bold text-ink text-lg">Services offered</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {d.services.map((x) => <div key={x} className="flex items-center gap-2.5 rounded-xl border border-line p-3.5"><BadgeCheck size={16} className="text-ok shrink-0" /><span className="text-sm font-semibold text-ink">{x}</span></div>)}
          </div>
        </div>
        <div>
          <div className="flex items-end justify-between mb-4">
            <h3 className="font-display font-bold text-xl text-ink">Doctors in {d.name}</h3>
            <Link to="/book" className="btn btn-primary btn-sm">Book in this department</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{docs.map((x) => <DoctorCard key={x.id} d={x} />)}
            {docs.length === 0 && <EmptyState title="No doctors listed yet" sub="This department's roster is managed from the admin panel." />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ services / facilities / packages ═══ */
export function ServicesPage() {
  const { s } = useStore();
  return (
    <div>
      <Band crumb="What we do" title="Hospital Services" sub="From the front desk to the ICU — these services run on one connected system." />
      <div className="max-w-7xl mx-auto px-4 py-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {s.services.map((sv) => {
          const dept = s.departments.find((d) => d.id === sv.dept);
          return (
            <div key={sv.id} className="card card-hover p-6">
              <span className="w-11 h-11 rounded-xl bg-tint text-primary flex items-center justify-center"><DIcon name={sv.icon} size={21} /></span>
              <h3 className="font-display font-bold text-ink mt-3.5">{sv.name}</h3>
              <p className="text-sm text-soft mt-1.5 leading-relaxed">{sv.desc}</p>
              <p className="text-[11px] font-bold text-primary mt-3 uppercase tracking-wide">{dept?.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FacilitiesPage() {
  const { s } = useStore();
  return (
    <div>
      <Band crumb="Inside the hospital" title="Facilities" sub="Modern infrastructure designed around patient comfort and clinical safety." />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-line relative group">
            <img src={HERO_IMG} alt="Hospital atrium" className="w-full h-72 lg:h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
            <span className="absolute bottom-3 left-3 bg-pine/75 text-white text-xs font-bold rounded-full px-3 py-1.5">Reception Atrium</span>
          </div>
          {s.gallery.slice(1, 5).map((g) => (
            <div key={g.id} className="rounded-2xl border border-line p-6 flex flex-col justify-between relative overflow-hidden group" style={{ background: `linear-gradient(140deg, hsl(${g.hue} 40% 95%), hsl(${g.hue} 45% 88%))` }}>
              <DIcon name={g.icon} size={30} className="group-hover:scale-110 transition-transform" />
              <div>
                <p className="font-display font-bold text-ink">{g.title}</p>
                <p className="text-[11px] font-bold uppercase tracking-wide mt-0.5" style={{ color: `hsl(${g.hue} 50% 34%)` }}>{g.cat}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {[["Bed Capacity", "38+ monitored beds across 6 ward types"], ["Operation Theatres", "2 modular OTs with laminar airflow"], ["ICU", "6 ICU + 4 NICU beds with 1:2 nursing"], ["Ambulance", "BLS fleet with 24×7 dispatch"]].map(([k, v]) => (
            <div key={k} className="card p-5"><p className="font-display font-extrabold text-xl text-primary">{k}</p><p className="text-xs text-soft mt-1.5 leading-relaxed">{v}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PackagesPage() {
  const { s } = useStore();
  return (
    <div>
      <Band crumb="Preventive Care" title="Health Packages" sub="Transparent pricing, same-day reports, physician review included in every package." />
      <div className="max-w-7xl mx-auto px-4 py-10 grid sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
        {s.packages.map((p) => (
          <div key={p.id} className={cx("card card-hover p-6 flex flex-col relative", p.popular && "border-primary ring-2 ring-primary/15")}>
            {p.popular && <span className="absolute -top-2.5 left-4 text-[10px] font-bold bg-primary text-white rounded-full px-2.5 py-0.5">MOST BOOKED</span>}
            <p className="font-display font-bold text-lg text-ink">{p.name}</p>
            <p className="text-xs text-soft">{p.forWho}</p>
            <p className="font-display font-extrabold text-4xl text-primary mt-4">{inr(p.price)}</p>
            <ul className="mt-4 space-y-2 flex-1">
              {p.tests.map((x) => <li key={x} className="text-sm text-soft flex gap-2"><span className="text-ok font-bold">✓</span>{x}</li>)}
            </ul>
            <Link to="/book" className="btn btn-primary mt-5 justify-center">Book this package</Link>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-faint pb-4">Prices are demo data. Fasting of 10–12 hours is required for sugar & lipid tests.</p>
    </div>
  );
}

/* ═══ insurance & emergency ═══ */
export function InsurancePage() {
  const { s } = useStore();
  return (
    <div>
      <Band crumb="Payments made easy" title="Insurance & Cashless" sub="Our insurance desk handles pre-authorisation so you can focus on recovery." />
      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-display font-bold text-ink text-lg flex items-center gap-2"><ShieldCheck size={19} className="text-primary" /> Cashless process</h3>
          <ol className="mt-4 space-y-3">
            {["Share your policy card & ID at the insurance desk on admission", "We prepare and send the pre-authorisation request", "Insurer approves the estimated amount (usually within 2–6 hours)", "Treatment proceeds; final claim settled at discharge"].map((x, i) => (
              <li key={i} className="flex gap-3 text-sm text-soft"><span className="w-6 h-6 rounded-full bg-tint text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>{x}</li>
            ))}
          </ol>
        </div>
        <div className="card p-6">
          <h3 className="font-display font-bold text-ink text-lg">Accepted providers <DemoTag className="ml-2" /></h3>
          <div className="flex flex-wrap gap-2 mt-4">
            {["Star Health", "HDFC Ergo", "ICICI Lombard", "New India", "Oriental", "Care Health", "Niva Bupa", "Tata AIG"].map((x) => <span key={x} className="chip !py-2 !px-4 !text-sm font-semibold">{x}</span>)}
          </div>
          <p className="text-xs text-faint mt-4">Fictional demonstration list — actual empanelment varies per hospital and is configured per-tenant in Hospital360 OS.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="rounded-2xl border-2 border-dashed border-warn/40 bg-warnbg p-6">
          <div className="flex items-center gap-2 mb-2"><Badge tone="warn">Demo configuration only</Badge><h3 className="font-display font-bold text-ink">PM-JAY / MJPJAY scheme module</h3></div>
          <p className="text-sm text-soft leading-relaxed max-w-3xl">Hospital360 OS includes a scheme-management section (scheme name, helpdesk, covered departments, document checklist, claim workflow) for hospitals empanelled under government schemes. This demo hospital is <strong>not</strong> claiming any real empanelment — the module is shown for architecture demonstration only.</p>
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            {[["Scheme profile", "Name, helpdesk & covered departments"], ["Document guidance", "Checklist for beneficiaries"], ["Claim workflow", "Pre-auth → treatment → claim → settle"]].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-white border border-line p-4"><p className="font-bold text-sm text-ink">{k}</p><p className="text-[11px] text-soft mt-1">{v}</p></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmergencyPage() {
  const { s } = useStore();
  return (
    <div>
      <div className="bg-[#7e1d12] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ffb4a8]"><Siren size={15} /> 24 × 7 · 365 days</p>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl mt-3">Emergency & Trauma</h1>
          <p className="text-white/75 mt-3 max-w-2xl">Resuscitation bay, trauma protocol and an on-call consultant — every minute, every day.</p>
          <div className="flex flex-wrap gap-3 mt-7">
            <a href={`tel:${s.settings.emergency}`} className="btn btn-lg !bg-white !text-[#7e1d12] hover:!bg-[#ffe9e4]"><Phone size={17} /> {s.settings.emergency}</a>
            <a href={`tel:${s.settings.ambulance}`} className="btn btn-lg !bg-white/12 hover:!bg-white/20 !text-white !border !border-white/25"><Siren size={16} /> Ambulance {s.settings.ambulance}</a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-4">
        {[["Chest pain / breathing difficulty", "Call immediately — do not drive yourself. Our cardiac pathway activates before you arrive."], ["Accident / major injury", "Note the time of injury. Keep the patient still; our trauma team prepares from your call."], ["Poisoning / overdose", "Carry the substance container if possible. Do not induce vomiting unless instructed."]].map(([k, v]) => (
          <div key={k} className="card p-6"><p className="font-display font-bold text-ink">{k}</p><p className="text-sm text-soft mt-2 leading-relaxed">{v}</p></div>
        ))}
      </div>
    </div>
  );
}

/* ═══ gallery / blog / camps / testimonials / faq / contact / about / legal ═══ */
export function GalleryPage() {
  const { s } = useStore();
  const [cat, setCat] = useState("");
  const cats = ["", ...Array.from(new Set(s.gallery.map((g) => g.cat)))];
  const list = s.gallery.filter((g) => !cat || g.cat === cat);
  return (
    <div>
      <Band crumb="A look inside" title="Gallery" />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex gap-2 flex-wrap mb-6">
          {cats.map((c) => <button key={c || "all"} onClick={() => setCat(c)} className={cx("chip cursor-pointer !py-2 !px-4", (!c && !cat) || cat === c ? "!bg-primary !text-white !border-primary" : "")}>{c || "All"}</button>)}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          <div className="sm:col-span-2 lg:row-span-2 rounded-2xl overflow-hidden border border-line relative group">
            <img src={HERO_IMG} alt="Reception atrium" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
            <span className="absolute bottom-3 left-3 bg-pine/75 text-white text-xs font-bold rounded-full px-3 py-1.5">Reception Atrium</span>
          </div>
          {list.map((g) => (
            <div key={g.id} className="rounded-2xl border border-line p-5 flex flex-col justify-between min-h-[160px] group overflow-hidden relative" style={{ background: `linear-gradient(140deg, hsl(${g.hue} 42% 94%), hsl(${g.hue} 48% 86%))` }}>
              <DIcon name={g.icon} size={28} className="group-hover:scale-110 transition-transform" />
              <div><p className="font-display font-bold text-ink">{g.title}</p><p className="text-[10px] font-bold uppercase tracking-wide mt-0.5" style={{ color: `hsl(${g.hue} 50% 34%)` }}>{g.cat}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BlogPage() {
  const { s } = useStore();
  return (
    <div>
      <Band crumb="Health Blog" title="Written by our doctors, not content farms" />
      <div className="max-w-7xl mx-auto px-4 py-10 grid sm:grid-cols-2 gap-5 stagger">
        {s.blogs.map((b) => (
          <Link key={b.id} to={`/blog/${b.slug}`} className="card card-hover p-6 flex flex-col">
            <div className="h-32 rounded-xl mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, hsl(${b.hue} 42% 92%), hsl(${b.hue} 48% 84%))` }}>
              <span className="font-display font-extrabold text-4xl" style={{ color: `hsl(${b.hue} 50% 34%)` }}>{b.tag.slice(0, 2)}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{b.tag} · {b.read} read</span>
            <h3 className="font-display font-bold text-xl text-ink mt-2 leading-snug">{b.title}</h3>
            <p className="text-sm text-soft mt-2 leading-relaxed">{b.excerpt}</p>
            <span className="mt-auto pt-4 text-xs text-faint">{b.author} · {fmtDate(b.date)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BlogDetailPage() {
  const { s } = useStore();
  const { slug } = useParams();
  const b = s.blogs.find((x) => x.slug === slug);
  if (!b) return <EmptyState title="Article not found" action={<Link to="/blog" className="btn btn-primary">Back to blog</Link>} />;
  const related = s.blogs.filter((x) => x.id !== b.id).slice(0, 2);
  return (
    <div>
      <Band crumb={b.tag} title={b.title} sub={`${b.author} · ${fmtDate(b.date)} · ${b.read} read`} />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <article className="anim-fade-up">
          {b.body.map((p, i) => <p key={i} className={cx("text-[16px] leading-[1.85] text-ink/85 mb-6", i === 0 && "text-lg font-medium text-ink")}>{p}</p>)}
        </article>
        <div className="card p-5 flex items-center gap-4 mt-8">
          <Avatar name={b.author} hue={b.hue} size={48} />
          <div><p className="font-display font-bold text-ink">{b.author}</p><p className="text-xs text-soft">{s.settings.name} · demo contributor</p></div>
          <Link to="/book" className="btn btn-primary btn-sm ml-auto">Consult</Link>
        </div>
        <div className="mt-10">
          <h3 className="font-display font-bold text-lg text-ink mb-3">Keep reading</h3>
          <div className="grid sm:grid-cols-2 gap-4">{related.map((r) => (
            <Link key={r.id} to={`/blog/${r.slug}`} className="card card-hover p-4"><span className="text-[10px] font-bold uppercase text-primary">{r.tag}</span><p className="font-display font-bold text-sm text-ink mt-1 leading-snug">{r.title}</p></Link>
          ))}</div>
        </div>
      </div>
    </div>
  );
}

export function CampsPage() {
  const { s } = useStore();
  return (
    <div>
      <Band crumb="Community" title="Health Camps" sub="Preventive care beyond the hospital walls — across Pusad and nearby talukas." />
      <div className="max-w-5xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-4 stagger">
        {s.camps.map((c) => (
          <div key={c.id} className="card card-hover p-6 flex flex-col">
            <Badge tone="primary" className="w-fit">{c.date}</Badge>
            <h3 className="font-display font-bold text-lg text-ink mt-3">{c.name}</h3>
            <p className="text-sm text-soft mt-1 flex items-center gap-1.5"><MapPin size={13} /> {c.place}</p>
            <p className="text-xs text-soft mt-3 leading-relaxed">{c.services}</p>
            <p className="mono text-[11px] text-faint mt-2">~{c.spots} spots</p>
            <a href={WA_LINK(s.settings.whatsapp, `Register me for ${c.name}`)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm mt-4 justify-center"><MessageCircle size={14} /> Register on WhatsApp</a>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TestimonialsPage() {
  const { s, a } = useStore();
  const [f, setF] = useState({ name: "", comment: "", overall: 5 });
  const [sent, setSent] = useState(false);
  const submit = () => {
    if (!f.name.trim() || !f.comment.trim()) return;
    a.addFeedback({ patient: f.name.trim(), service: f.overall, staff: f.overall, cleanliness: f.overall, waiting: f.overall, overall: f.overall, comment: f.comment.trim() });
    setSent(true);
  };
  return (
    <div>
      <Band crumb="Patient Voices" title="Testimonials" sub="Real feedback patterns from the hospital's own feedback module (demo entries)." />
      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-[1.4fr_1fr] gap-8">
        <div className="grid sm:grid-cols-2 gap-4 stagger h-fit">
          {s.feedback.map((x) => (
            <figure key={x.id} className="card p-5">
              <div className="flex gap-0.5 text-gold">{Array.from({ length: x.overall }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
              <blockquote className="text-sm text-soft leading-relaxed mt-3">“{x.comment}”</blockquote>
              <figcaption className="text-xs font-bold text-ink mt-3">{x.patient} <span className="text-faint font-normal">· {fmtDateShort(x.at)}</span></figcaption>
            </figure>
          ))}
        </div>
        <div className="card p-6 h-fit">
          <h3 className="font-display font-bold text-ink text-lg">Share your experience</h3>
          {sent ? (
            <p className="text-sm text-ok font-semibold mt-4 anim-tick">✓ Thank you! Your feedback is now visible in the owner dashboard.</p>
          ) : (
            <div className="space-y-4 mt-4">
              <Field label="Your name" req><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
              <Field label="Overall rating" req>
                <div className="flex gap-1.5">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setF({ ...f, overall: n })} aria-label={`${n} stars`} className={cx(n <= f.overall ? "text-gold" : "text-line")}><Star size={24} fill="currentColor" /></button>)}</div>
              </Field>
              <Field label="Your feedback" req><textarea className="textarea" rows={4} value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} /></Field>
              <button className="btn btn-primary w-full" onClick={submit} disabled={!f.name.trim() || !f.comment.trim()}><Send size={15} /> Submit feedback</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FaqPage() {
  const { s } = useStore();
  return (
    <div>
      <Band crumb="Help" title="Frequently Asked Questions" />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-3">
        {s.faqs.map((f) => (
          <details key={f.id} className="card p-5 group" open={f.id === "fq1"}>
            <summary className="font-display font-bold text-ink cursor-pointer list-none flex justify-between gap-4 items-center">{f.q}<ChevronRight size={17} className="text-faint group-open:rotate-90 transition-transform shrink-0" /></summary>
            <p className="text-sm text-soft leading-relaxed mt-3">{f.a}</p>
          </details>
        ))}
        <div className="rounded-2xl bg-tint border border-primary/20 p-6 text-center mt-6">
          <p className="font-display font-bold text-ink">Still have a question?</p>
          <p className="text-sm text-soft mt-1">WhatsApp us — a human replies during OPD hours.</p>
          <Link to="/contact" className="btn btn-primary mt-4">Contact us</Link>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const { s, toast } = useStore();
  const [f, setF] = useState({ name: "", mobile: "", msg: "" });
  return (
    <div>
      <Band crumb="Reach us" title="Contact" sub={`${s.settings.address}`} />
      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h3 className="font-display font-bold text-ink text-lg">Send a message</h3>
          <div className="space-y-4 mt-4">
            <Field label="Name" req><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label="Mobile" req><input className="input mono" value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value })} /></Field>
            <Field label="Message" req><textarea className="textarea" rows={4} value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} /></Field>
            <button className="btn btn-primary" onClick={() => { if (f.name && f.msg) { toast("Message received — our team will call you back (demo)", "ok"); setF({ name: "", mobile: "", msg: "" }); } else toast("Please fill name and message", "err"); }}><Send size={15} /> Send message</button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl h-52 dotgrid border border-line relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center"><MapPin size={34} className="text-primary mx-auto" /><p className="font-display font-bold text-ink mt-2">{s.settings.name}</p><p className="text-xs text-soft">{s.settings.city}, Maharashtra</p>
                <a className="btn btn-outline btn-sm mt-3" href={MAPS_LINK(s.settings.name + " " + s.settings.city)} target="_blank" rel="noreferrer">Open in Google Maps</a></div>
            </div>
          </div>
          <div className="card p-5 space-y-3">
            {[["Phone", s.settings.phone, Phone], ["Emergency (24×7)", s.settings.emergency, Siren], ["Email", s.settings.email, Mail], ["OPD Hours", s.settings.hours, Clock]].map(([k, v, I]: any) => (
              <p key={k} className="flex items-center gap-3 text-sm"><span className="w-9 h-9 rounded-lg bg-tint text-primary flex items-center justify-center shrink-0"><I size={16} /></span><span><span className="block text-[11px] font-bold uppercase text-soft">{k}</span><span className="font-semibold text-ink">{v}</span></span></p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AboutPage() {
  const { s } = useStore();
  return (
    <div>
      <Band crumb="Our story" title="About Aarogyam" sub={s.settings.tagline} />
      <div className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-2 gap-10 items-start">
        <div className="anim-fade-up">
          <SectionHead eyebrow="Since 2014" title="A hospital built like a system, run like a family" />
          <p className="text-soft leading-relaxed mt-5">Aarogyam began as a 10-bed clinic on MIDC Road, Pusad. Today it is a multispeciality hospital with 38+ beds, a modular OT, monitored ICU and a full diagnostic floor — yet every patient is still greeted by name at the front desk.</p>
          <p className="text-soft leading-relaxed mt-4">In 2025 the hospital moved its entire operation onto <strong className="text-ink">ITCYBER Hospital360 OS</strong>: one system connecting the website, tokens, prescriptions, pharmacy, lab, billing and management dashboards. Less paperwork, fewer errors, faster care.</p>
          <div className="grid grid-cols-3 gap-4 mt-7">
            {[["38+", "Beds"], ["12", "Departments"], ["2", "Modular OTs"]].map(([v, k]) => (
              <div key={k} className="card p-4 text-center"><p className="font-display font-extrabold text-2xl text-primary">{v}</p><p className="text-xs text-soft font-semibold">{k}</p></div>
            ))}
          </div>
        </div>
        <div className="space-y-4 anim-slide-left">
          <div className="rounded-2xl overflow-hidden border border-line"><img src={HERO_IMG} alt="Hospital interior" className="w-full h-64 object-cover" /></div>
          {[["Compassion first", "We explain diagnoses in the patient's language — Marathi, Hindi or English.", HeartHandshake], ["Clinical honesty", "No unnecessary tests. Every investigation is justified in the consultation note.", Award], ["Transparent billing", "Itemised estimates before admission; final bills match them.", ShieldCheck]].map(([k, v, I]: any) => (
            <div key={k} className="card p-5 flex gap-4"><span className="w-10 h-10 rounded-xl bg-tint text-primary flex items-center justify-center shrink-0"><I size={18} /></span><div><p className="font-display font-bold text-ink">{k}</p><p className="text-sm text-soft mt-1">{v}</p></div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div>
      <Band crumb="Legal" title="Privacy Policy" sub="How this demonstration handles information." />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-5 text-sm text-soft leading-relaxed anim-fade-up">
        <p><strong className="text-ink">Demo notice:</strong> This deployment contains only fictional records. No real patient data is collected, stored or transmitted.</p>
        <p><strong className="text-ink">Data collected in production:</strong> In a live deployment, Hospital360 OS collects the minimum information required for care — identity, contact, clinical notes, prescriptions and billing records — with role-based access controls.</p>
        <p><strong className="text-ink">Access control:</strong> Staff see only the modules their role requires. Clinical notes are restricted to treating teams; salary data is restricted to management and accounts.</p>
        <p><strong className="text-ink">Compliance:</strong> Production deployments must be reviewed against applicable Indian healthcare, privacy (DPDP Act), tax and medical record-retention obligations before go-live. This demo makes no compliance claims.</p>
        <p><strong className="text-ink">Your controls:</strong> Demo data lives in your browser's local storage and can be reset at any time from Settings → Reset demo data.</p>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div>
      <Band crumb="Legal" title="Terms of Use" />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-5 text-sm text-soft leading-relaxed anim-fade-up">
        <p>This website demonstrates <strong className="text-ink">ITCYBER Hospital360 OS</strong> using a fictional hospital, Aarogyam Multispeciality Hospital, Pusad. All names, records, prices and statistics are invented for demonstration.</p>
        <p>Appointments booked in this demo enter a simulated workflow — they are visible to the demo reception, doctor, pharmacy and billing modules, and are not connected to any real hospital.</p>
        <p>The AI assistant answers operational questions only and never provides diagnosis, prescriptions or emergency advice. In a medical emergency, call the nearest emergency number immediately.</p>
        <p>Use of this demo constitutes acceptance of these terms. For licensing Hospital360 OS for a real hospital, contact the ITCYBER team.</p>
      </div>
    </div>
  );
}

/* ═══ patient portal ═══ */
export function PortalPage() {
  const { s, a } = useStore();
  const [tab, setTab] = useState("appts");
  const me = s.user?.role === "patient" ? patOf(s, s.user.id) : undefined;
  if (!me) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="card p-8 text-center anim-pop">
          <span className="w-14 h-14 rounded-2xl bg-tint text-primary flex items-center justify-center mx-auto"><Stethoscope size={26} /></span>
          <h1 className="font-display font-extrabold text-2xl text-ink mt-4">Patient Portal</h1>
          <p className="text-sm text-soft mt-2">See your appointments, prescriptions, reports and bills — the same records your doctors see.</p>
          <button className="btn btn-primary w-full mt-6" onClick={() => a.login("patient")}>Continue as Rohan Deshmukh <DemoTag className="ml-2" /></button>
          <Link to="/login" className="btn btn-ghost w-full mt-2">Other sign-in options</Link>
          <p className="text-[11px] text-faint mt-4">Demo access — patients can only ever see their own records.</p>
        </div>
      </div>
    );
  }
  const myAppts = s.appointments.filter((x) => x.patientId === me.id);
  const myRx = s.prescriptions.filter((x) => x.patientId === me.id);
  const myLabs = s.labOrders.filter((x) => x.patientId === me.id && x.status === "Completed");
  const myInvs = s.invoices.filter((x) => x.patientId === me.id);
  const tabs = [
    { id: "appts", label: "Appointments", count: myAppts.length }, { id: "rx", label: "Prescriptions", count: myRx.length },
    { id: "labs", label: "Reports", count: myLabs.length }, { id: "bills", label: "Bills", count: myInvs.length }, { id: "profile", label: "Profile" },
  ];
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-6">
        <Avatar name={me.name} hue={160} size={56} />
        <div>
          <h1 className="font-display font-extrabold text-2xl text-ink">Namaste, {me.name.split(" ")[0]}</h1>
          <p className="mono text-xs text-soft">{me.uhid} · {me.blood} · allergies: {me.allergies}</p>
        </div>
        <button className="btn btn-ghost btn-sm ml-auto" onClick={() => a.logout()}>Sign out</button>
      </div>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-6">
        {tabs.map((tb) => <button key={tb.id} onClick={() => setTab(tb.id)} className={cx("chip !py-2 !px-4 cursor-pointer shrink-0", tab === tb.id && "!bg-primary !text-white !border-primary")}>{tb.label}{tb.count !== undefined && ` (${tb.count})`}</button>)}
      </div>
      {tab === "appts" && (
        <div className="space-y-3 anim-fade-up">
          {myAppts.map((x) => {
            const d = docOf(s, x.doctorId);
            return (
              <div key={x.id} className="card p-4 flex flex-wrap items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-tint text-primary font-display font-extrabold flex items-center justify-center">{x.token ?? "—"}</span>
                <div className="min-w-[180px]"><p className="font-bold text-sm text-ink">{d?.name} · {d?.specialty}</p><p className="text-xs text-soft">{fmtDate(x.date)} · {x.slot} · {x.reason}</p></div>
                <StatusBadge status={x.status} className="ml-auto" />
              </div>
            );
          })}
          {myAppts.length === 0 && <EmptyState title="No appointments yet" action={<Link to="/book" className="btn btn-primary">Book your first visit</Link>} />}
        </div>
      )}
      {tab === "rx" && (
        <div className="space-y-3 anim-fade-up">
          {myRx.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-center justify-between"><p className="font-bold text-sm text-ink mono">{r.no}</p><StatusBadge status={r.status} /></div>
              <p className="text-xs text-soft mt-1">{fmtDate(r.at)} · {docOf(s, r.doctorId)?.name}</p>
              <div className="mt-3 space-y-1.5">{r.items.map((it, i) => <p key={i} className="text-sm text-ink"><strong>{it.name}</strong> — {it.dose}, {it.frequency} × {it.duration} <span className="text-soft">({it.instructions})</span></p>)}</div>
              <p className="text-xs text-soft mt-3 border-t border-line pt-2.5">{r.advice}</p>
            </div>
          ))}
          {myRx.length === 0 && <EmptyState title="No prescriptions yet" />}
        </div>
      )}
      {tab === "labs" && (
        <div className="space-y-3 anim-fade-up">
          {myLabs.map((l) => (
            <div key={l.id} className="card p-5">
              <div className="flex justify-between items-center"><p className="font-bold text-sm text-ink">{l.test}</p><StatusBadge status={l.status} /></div>
              <div className="grid sm:grid-cols-2 gap-x-6 mt-3">{Object.entries(l.results ?? {}).map(([k, v]) => <p key={k} className="text-sm flex justify-between border-b border-line/60 py-1.5"><span className="text-soft">{k}</span><span className="font-semibold mono">{v}</span></p>)}</div>
            </div>
          ))}
          {myLabs.length === 0 && <EmptyState title="No completed reports yet" />}
        </div>
      )}
      {tab === "bills" && (
        <div className="space-y-3 anim-fade-up">
          {myInvs.map((i) => (
            <div key={i.id} className="card p-5">
              <div className="flex justify-between items-center"><p className="font-bold text-sm mono text-ink">{i.no}</p><StatusBadge status={i.status} /></div>
              <p className="text-xs text-soft mt-1">{i.items.length} charge(s) · {fmtDate(i.createdAt)}</p>
              <p className="mt-2 font-display font-extrabold text-xl text-ink">{inr(invTotal(s, i.id))} <span className="text-xs font-normal text-soft">· paid {inr(invPaid(s, i.id))}</span></p>
            </div>
          ))}
          {myInvs.length === 0 && <EmptyState title="No bills yet" />}
        </div>
      )}
      {tab === "profile" && (
        <div className="card p-6 anim-fade-up max-w-lg">
          {[["Full name", me.name], ["UHID", me.uhid], ["Date of birth", fmtDate(me.dob)], ["Gender", me.gender], ["Mobile", me.mobile], ["Address", me.address], ["Blood group", me.blood], ["Allergies", me.allergies], ["Known conditions", me.conditions]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2.5 border-b border-line/70 last:border-0 text-sm"><span className="text-soft">{k}</span><span className="font-semibold text-ink text-right">{v}</span></div>
          ))}
        </div>
      )}
      <div className="mt-8 flex gap-3">
        <Link to="/book" className="btn btn-primary"><CalendarDays size={15} /> Book next visit</Link>
        <a href={WA_LINK(s.settings.whatsapp, "Hello, I am " + me.name)} target="_blank" rel="noreferrer" className="btn btn-outline"><MessageCircle size={15} /> WhatsApp hospital</a>
      </div>
    </div>
  );
}
