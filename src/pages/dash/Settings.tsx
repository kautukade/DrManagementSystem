import React, { useState } from "react";
import { Building2, Palette, Stethoscope, Globe2, Receipt, Database, Plus, Trash2, RotateCcw, ShieldCheck } from "lucide-react";
import { useStore } from "../../lib/store";
import { cx, uid } from "../../lib/utils";
import { Badge, DataTable, Field, Modal, PageHead, DemoTag } from "../../components/ui";

const SWATCHES = ["#0c6b58", "#14537c", "#7c2d5a", "#8a5a12", "#374b8a", "#0f766e"];
const DEPT_ICONS = ["Stethoscope", "HeartPulse", "Bone", "Baby", "Flower2", "Slice", "Ear", "Eye", "Brain", "ScanLine", "Microscope", "Activity"];

export default function Settings() {
  const { s, a, reset, toast } = useStore();
  const [tab, setTab] = useState("profile");
  const [f, setF] = useState(s.settings);
  const [showDept, setShowDept] = useState(false);
  const [nd, setNd] = useState({ name: "", icon: "Stethoscope", short: "" });
  const [showDoc, setShowDoc] = useState(false);
  const [doc, setDoc] = useState({ name: "", deptId: s.departments[0]?.id ?? "", quals: "MBBS", specialty: "", years: "5", fee: "400", from: "09:00", to: "14:00" });
  const [confirmReset, setConfirmReset] = useState(false);

  const tabs = [
    { id: "profile", label: "Hospital Profile", icon: Building2 },
    { id: "brand", label: "Branding", icon: Palette },
    { id: "depts", label: "Departments", icon: Globe2 },
    { id: "doctors", label: "Doctors", icon: Stethoscope },
    { id: "web", label: "Website & CMS", icon: Globe2 },
    { id: "data", label: "Data & Security", icon: Database },
  ];

  return (
    <div className="anim-fade-up">
      <PageHead title="Settings & CMS" sub="One config object re-skins the whole platform — name, colors, doctors, departments — for any hospital client." />
      <div className="flex gap-1.5 mb-5 overflow-x-auto no-scrollbar">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} className={cx("chip !py-2 !px-4 cursor-pointer shrink-0", tab === tb.id && "!bg-primary !text-white !border-primary")}><tb.icon size={13} /> {tb.label}</button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="card p-6 max-w-3xl">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Hospital name"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label="Short name (logo)"><input className="input" value={f.shortName} onChange={(e) => setF({ ...f, shortName: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Tagline"><input className="input" value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} /></Field></div>
            <div className="sm:col-span-2"><Field label="Address"><input className="input" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field></div>
            <Field label="Phone"><input className="input mono" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
            <Field label="Emergency number"><input className="input mono" value={f.emergency} onChange={(e) => setF({ ...f, emergency: e.target.value })} /></Field>
            <Field label="Ambulance"><input className="input mono" value={f.ambulance} onChange={(e) => setF({ ...f, ambulance: e.target.value })} /></Field>
            <Field label="WhatsApp (with country code)"><input className="input mono" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} /></Field>
            <Field label="Email"><input className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Field label="OPD hours text"><input className="input" value={f.hours} onChange={(e) => setF({ ...f, hours: e.target.value })} /></Field>
          </div>
          <button className="btn btn-primary mt-5" onClick={() => a.saveSettings(f)}>Save hospital profile</button>
          <p className="text-[11px] text-faint mt-3 flex items-center gap-1.5"><ShieldCheck size={12} /> In production these values live in Supabase <span className="mono">hospitals</span> + <span className="mono">hospital_settings</span> tables, one row per tenant.</p>
        </div>
      )}

      {tab === "brand" && (
        <div className="card p-6 max-w-3xl">
          <h3 className="font-display font-bold text-ink mb-1">Primary color</h3>
          <p className="text-sm text-soft mb-4">Applied live across the entire platform — public site, dashboards, print documents.</p>
          <div className="flex flex-wrap items-center gap-3">
            {SWATCHES.map((c) => (
              <button key={c} onClick={() => a.saveSettings({ primaryColor: c })} aria-label={`Set color ${c}`}
                className={cx("w-12 h-12 rounded-xl border-4 transition-transform hover:scale-110", s.settings.primaryColor === c ? "border-ink" : "border-transparent")} style={{ background: c }} />
            ))}
            <label className="flex items-center gap-2 text-sm font-semibold text-soft cursor-pointer">
              Custom <input type="color" value={s.settings.primaryColor} onChange={(e) => a.saveSettings({ primaryColor: e.target.value })} className="w-12 h-12 rounded-xl cursor-pointer border border-line" />
            </label>
          </div>
          <div className="mt-6 rounded-2xl bg-paper border border-line p-5">
            <p className="label">Live preview</p>
            <div className="flex flex-wrap gap-2 items-center">
              <button className="btn btn-primary btn-sm">Primary button</button>
              <span className="chip !bg-primary !text-white !border-primary">Badge</span>
              <span className="font-display font-extrabold text-2xl" style={{ color: "var(--primary)" }}>Aa Display</span>
            </div>
          </div>
          <p className="text-[11px] text-faint mt-4">Multi-tenant ready: each hospital client gets its own logo, palette and favicon from the same codebase.</p>
        </div>
      )}

      {tab === "depts" && (
        <div className="card p-5 max-w-4xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display font-bold text-ink">Departments ({s.departments.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowDept(true)}><Plus size={14} /> Add department</button>
          </div>
          <DataTable
            cols={[
              { key: "name", label: "Department", render: (d: any) => <span className="font-semibold text-ink">{d.name}</span> },
              { key: "short", label: "Description" },
              { key: "docs", label: "Doctors", render: (d: any) => <Badge tone="primary">{s.doctors.filter((x) => x.deptId === d.id).length}</Badge> },
              { key: "act", label: "", right: true, render: (d: any) => <button className="btn btn-outline btn-sm !text-danger" onClick={(e: any) => { e.stopPropagation(); a.removeDepartment(d.id); }}><Trash2 size={13} /></button> },
            ]}
            rows={s.departments as any}
            searchable={(d: any) => d.name}
            pageSize={8}
          />
        </div>
      )}

      {tab === "doctors" && (
        <div className="card p-5 max-w-4xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display font-bold text-ink">Doctor directory ({s.doctors.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowDoc(true)}><Plus size={14} /> Add doctor</button>
          </div>
          <DataTable
            cols={[
              { key: "name", label: "Doctor", render: (d: any) => <div><p className="font-semibold text-ink">{d.name}</p><p className="text-[10px] text-faint">{d.quals}</p></div> },
              { key: "dept", label: "Department", render: (d: any) => s.departments.find((x) => x.id === d.deptId)?.name },
              { key: "opd", label: "OPD", render: (d: any) => <span className="mono text-xs">{d.from}–{d.to} · {d.days.length} days</span> },
              { key: "fee", label: "Fee", right: true, render: (d: any) => <span className="mono">₹{d.fee}</span> },
              { key: "act", label: "", right: true, render: (d: any) => <button className="btn btn-outline btn-sm !text-danger" onClick={(e: any) => { e.stopPropagation(); a.removeDoctor(d.id); }}><Trash2 size={13} /></button> },
            ]}
            rows={s.doctors as any}
            searchable={(d: any) => `${d.name} ${d.specialty}`}
            pageSize={8}
          />
        </div>
      )}

      {tab === "web" && (
        <div className="card p-6 max-w-3xl">
          <h3 className="font-display font-bold text-ink mb-4">Public website content <DemoTag className="ml-2" /></h3>
          <div className="space-y-4">
            <Field label="Homepage announcement banner"><input className="input" value={f.announcement} onChange={(e) => setF({ ...f, announcement: e.target.value })} /></Field>
            <Field label="Default language"><select className="select" value={f.lang} onChange={(e) => setF({ ...f, lang: e.target.value as any })}><option value="en">English</option><option value="hi">Hindi</option><option value="mr">Marathi</option></select></Field>
          </div>
          <button className="btn btn-primary mt-4" onClick={() => a.saveSettings({ announcement: f.announcement, lang: f.lang })}>Publish changes</button>
          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            {[["Blog posts", s.blogs.length, "/blog"], ["Health packages", s.packages.length, "/packages"], ["Health camps", s.camps.length, "/camps"], ["Testimonials", s.testimonials.length, "/testimonials"], ["FAQs", s.faqs.length, "/faq"], ["Gallery items", s.gallery.length, "/gallery"]].map(([k, n, to]: any) => (
              <div key={k} className="rounded-xl border border-line p-3.5 flex justify-between items-center"><span className="text-sm font-semibold text-ink">{k}</span><Badge tone="primary">{n} live</Badge></div>
            ))}
          </div>
          <p className="text-[11px] text-faint mt-4">These collections are CMS-managed (blog_posts, health_packages, health_camps… tables) — staff edit content without touching code.</p>
        </div>
      )}

      {tab === "data" && (
        <div className="max-w-3xl space-y-4">
          <div className="card p-6">
            <h3 className="font-display font-bold text-ink flex items-center gap-2"><ShieldCheck size={17} className="text-primary" /> Security architecture</h3>
            <ul className="mt-3 space-y-2 text-sm text-soft">
              {["Supabase Auth with role claims; service keys never ship to the browser", "Row Level Security on every table, scoped by hospital_id (multi-tenant isolation)", "Role → permission map drives both UI and policies", "Audit log for every sensitive action (see Insights → Audit Logs)", "Storage buckets private; signed URLs for reports and documents"].map((x) => <li key={x} className="flex gap-2.5"><span className="text-ok font-bold">✓</span>{x}</li>)}
            </ul>
            <p className="text-[11px] text-faint mt-4 border border-warn/30 bg-warnbg rounded-lg p-3">Production deployments require review against applicable Indian healthcare, privacy (DPDP), tax and record-retention obligations. No compliance is claimed by this demo.</p>
          </div>
          <div className="card p-6 border-danger/30">
            <h3 className="font-display font-bold text-danger">Demo data</h3>
            <p className="text-sm text-soft mt-1.5">Reset every module — patients, appointments, stock, bills — back to the factory demo state. Your browser's local copy is wiped.</p>
            <button className="btn btn-danger mt-4" onClick={() => setConfirmReset(true)}><RotateCcw size={15} /> Reset demo data</button>
          </div>
        </div>
      )}

      {/* add dept */}
      <Modal open={showDept} onClose={() => setShowDept(false)} title="Add department"
        footer={<><button className="btn btn-ghost" onClick={() => setShowDept(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={!nd.name.trim()} onClick={() => { a.saveDepartment({ id: "dep-" + uid(), name: nd.name.trim(), icon: nd.icon, short: nd.short || "New centre of care", desc: nd.short || "New centre of care", services: ["General OPD"], head: "", hue: Math.floor(Math.random() * 360) }); setShowDept(false); setNd({ name: "", icon: "Stethoscope", short: "" }); }}>Add department</button></>}>
        <div className="space-y-4">
          <Field label="Name" req><input className="input" value={nd.name} onChange={(e) => setNd({ ...nd, name: e.target.value })} placeholder="e.g. Dermatology" /></Field>
          <Field label="Short description"><input className="input" value={nd.short} onChange={(e) => setNd({ ...nd, short: e.target.value })} /></Field>
          <Field label="Icon"><select className="select" value={nd.icon} onChange={(e) => setNd({ ...nd, icon: e.target.value })}>{DEPT_ICONS.map((i) => <option key={i}>{i}</option>)}</select></Field>
        </div>
      </Modal>

      {/* add doctor */}
      <Modal open={showDoc} onClose={() => setShowDoc(false)} title="Add doctor" wide
        footer={<><button className="btn btn-ghost" onClick={() => setShowDoc(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={!doc.name.trim() || !doc.specialty.trim()} onClick={() => {
            a.saveDoctor({ id: "d-" + uid(), name: doc.name.startsWith("Dr") ? doc.name : `Dr. ${doc.name}`, deptId: doc.deptId, quals: doc.quals, specialty: doc.specialty, years: +doc.years || 5, fee: +doc.fee || 400, hue: Math.floor(Math.random() * 360), languages: ["English", "Hindi", "Marathi"], procedures: ["General OPD"], bio: "Consultant added via Hospital360 settings.", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], from: doc.from, to: doc.to, available: true });
            setShowDoc(false); setDoc({ name: "", deptId: s.departments[0]?.id ?? "", quals: "MBBS", specialty: "", years: "5", fee: "400", from: "09:00", to: "14:00" });
          }}>Add doctor</button></>}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name" req><input className="input" value={doc.name} onChange={(e) => setDoc({ ...doc, name: e.target.value })} placeholder="Dr. …" /></Field>
          <Field label="Qualifications"><input className="input" value={doc.quals} onChange={(e) => setDoc({ ...doc, quals: e.target.value })} /></Field>
          <Field label="Specialty" req><input className="input" value={doc.specialty} onChange={(e) => setDoc({ ...doc, specialty: e.target.value })} /></Field>
          <Field label="Department"><select className="select" value={doc.deptId} onChange={(e) => setDoc({ ...doc, deptId: e.target.value })}>{s.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
          <Field label="Experience (years)"><input type="number" className="input mono" value={doc.years} onChange={(e) => setDoc({ ...doc, years: e.target.value })} /></Field>
          <Field label="Consultation fee ₹"><input type="number" className="input mono" value={doc.fee} onChange={(e) => setDoc({ ...doc, fee: e.target.value })} /></Field>
          <Field label="OPD from"><input type="time" className="input mono" value={doc.from} onChange={(e) => setDoc({ ...doc, from: e.target.value })} /></Field>
          <Field label="OPD to"><input type="time" className="input mono" value={doc.to} onChange={(e) => setDoc({ ...doc, to: e.target.value })} /></Field>
        </div>
      </Modal>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset all demo data?"
        footer={<><button className="btn btn-ghost" onClick={() => setConfirmReset(false)}>Keep my data</button>
          <button className="btn btn-danger" onClick={() => { reset(); setConfirmReset(false); }}>Yes, reset everything</button></>}>
        <p className="text-sm text-soft leading-relaxed">Appointments, registrations, prescriptions, stock movements, invoices and payments will return to the original demo dataset. This cannot be undone.</p>
      </Modal>
    </div>
  );
}
