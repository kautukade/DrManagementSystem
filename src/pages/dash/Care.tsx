import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BedDouble, Plus, FlaskConical, ScanLine, Syringe, HeartHandshake, LogOut, FileText } from "lucide-react";
import { useStore, patOf, docOf, bedOf } from "../../lib/store";
import { LAB_TEST_FIELDS } from "../../lib/data";
import { cx, fmtDate, fmtTime, inr, uid } from "../../lib/utils";
import { Avatar, Badge, Field, Modal, PageHead, SearchSelect, StatCard, StatusBadge, EmptyState, DataTable } from "../../components/ui";

const BED_TONES: Record<string, string> = {
  Available: "border-ok/40 bg-okbg text-ok", Occupied: "border-danger/30 bg-dangerbg text-danger",
  Reserved: "border-info/30 bg-infobg text-info", Cleaning: "border-warn/30 bg-warnbg text-warn", Maintenance: "border-line bg-paper text-faint",
};

/* ═══ IPD ═══ */
export function IpdPage() {
  const { s, a } = useStore();
  const [show, setShow] = useState(false);
  const [f, setF] = useState({ patientId: "", doctorId: "", bedId: "", diagnosis: "", attendant: "", attendantPhone: "", deposit: "", insurance: "", notes: "" });
  const [err, setErr] = useState("");
  const wards = Array.from(new Set(s.beds.map((b) => b.ward)));
  const [ward, setWard] = useState(wards[0]);
  const freeBeds = s.beds.filter((b) => b.ward === ward && b.status === "Available");

  return (
    <div className="anim-fade-up">
      <PageHead title="IPD — Admissions" sub="Admit, allocate beds, track attendants and discharge with an auto-generated final bill."
        actions={<button className="btn btn-primary btn-sm" onClick={() => setShow(true)}><Plus size={15} /> New admission</button>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 stagger">
        <StatCard label="Currently Admitted" value={s.admissions.filter((x) => x.status === "Admitted").length} icon={BedDouble} />
        <StatCard label="ICU Patients" value={s.admissions.filter((x) => x.status === "Admitted" && x.ward === "ICU").length} tone="danger" icon={BedDouble} />
        <StatCard label="Deposits Held" value={inr(s.admissions.filter((x) => x.status === "Admitted").reduce((t, x) => t + x.deposit, 0))} tone="info" icon={BedDouble} />
        <StatCard label="Discharged (all time)" value={s.admissions.filter((x) => x.status === "Discharged").length} tone="ok" icon={LogOut} />
      </div>
      <div className="space-y-3">
        {s.admissions.map((ad) => {
          const p = patOf(s, ad.patientId); const b = bedOf(s, ad.bedId);
          return (
            <div key={ad.id} className="card p-5 flex flex-wrap items-center gap-4">
              <span className="w-12 h-12 rounded-xl bg-pine text-white font-display font-extrabold flex items-center justify-center">{b?.label ?? "—"}</span>
              <div className="min-w-[240px] flex-1">
                <Link to={`/app/patients/${ad.patientId}`} className="font-bold text-ink hover:text-primary">{p?.name}</Link> <span className="mono text-[10px] text-faint">{ad.no}</span>
                <p className="text-xs text-soft mt-0.5">{ad.diagnosis} · {docOf(s, ad.doctorId)?.name}</p>
                <p className="text-[11px] text-faint mt-0.5">{ad.ward} · admitted {fmtDate(ad.at)} {fmtTime(ad.at)} · attendant {ad.attendant} · deposit {inr(ad.deposit)} · {ad.insurance}</p>
              </div>
              <StatusBadge status={ad.status} />
              {ad.status === "Admitted" && <button className="btn btn-outline btn-sm" onClick={() => a.discharge(ad.id)}><LogOut size={14} /> Discharge & bill</button>}
            </div>
          );
        })}
      </div>

      <Modal open={show} onClose={() => setShow(false)} title="New admission" wide
        footer={<><button className="btn btn-ghost" onClick={() => setShow(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={!f.patientId || !f.doctorId || !f.bedId || !f.diagnosis} onClick={() => {
            const res = a.admit({ ...f, deposit: +f.deposit || 0 });
            if (res.error) setErr(res.error); else { setShow(false); setErr(""); setF({ patientId: "", doctorId: "", bedId: "", diagnosis: "", attendant: "", attendantPhone: "", deposit: "", insurance: "", notes: "" }); }
          }}>Admit patient</button></>}>
        {err && <p className="rounded-lg bg-dangerbg text-danger text-sm font-semibold px-3.5 py-2.5 mb-4 anim-tick">{err}</p>}
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Patient" req><SearchSelect placeholder="Search patient…" options={s.patients.map((p) => ({ id: p.id, label: p.name, sub: p.uhid }))} value={f.patientId} onChange={(id) => setF({ ...f, patientId: id })} /></Field>
          <Field label="Primary doctor" req><SearchSelect placeholder="Select doctor…" options={s.doctors.filter((d) => d.fee > 0).map((d) => ({ id: d.id, label: d.name, sub: d.specialty }))} value={f.doctorId} onChange={(id) => setF({ ...f, doctorId: id })} /></Field>
          <Field label="Ward" req><select className="select" value={ward} onChange={(e) => { setWard(e.target.value); setF({ ...f, bedId: "" }); }}>{wards.map((w) => <option key={w}>{w}</option>)}</select></Field>
          <Field label={`Bed (available in ${ward})`} req>
            <select className="select" value={f.bedId} onChange={(e) => setF({ ...f, bedId: e.target.value })}>
              <option value="">Select bed…</option>
              {freeBeds.map((b) => <option key={b.id} value={b.id}>{b.label} — ₹{b.rate}/day</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2"><Field label="Diagnosis / reason" req><input className="input" value={f.diagnosis} onChange={(e) => setF({ ...f, diagnosis: e.target.value })} /></Field></div>
          <Field label="Attendant name"><input className="input" value={f.attendant} onChange={(e) => setF({ ...f, attendant: e.target.value })} placeholder="Relation" /></Field>
          <Field label="Attendant phone"><input className="input mono" value={f.attendantPhone} onChange={(e) => setF({ ...f, attendantPhone: e.target.value })} /></Field>
          <Field label="Deposit ₹"><input type="number" className="input mono" value={f.deposit} onChange={(e) => setF({ ...f, deposit: e.target.value })} /></Field>
          <Field label="Insurance / scheme"><input className="input" value={f.insurance} onChange={(e) => setF({ ...f, insurance: e.target.value })} placeholder="Self-pay" /></Field>
          <div className="sm:col-span-2"><Field label="Admission notes"><textarea className="textarea" rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field></div>
        </div>
        {freeBeds.length === 0 && <p className="text-xs text-danger font-semibold mt-3">No free beds in {ward} — check Bed Management for other wards.</p>}
      </Modal>
    </div>
  );
}

/* ═══ Beds ═══ */
export function BedsPage() {
  const { s, a } = useStore();
  const wards = Array.from(new Set(s.beds.map((b) => b.ward)));
  return (
    <div className="anim-fade-up">
      <PageHead title="Bed Management" sub="Live visual bed map — admissions, cleaning turnover and maintenance in one glance."
        actions={<div className="flex gap-2 flex-wrap">{Object.entries(BED_TONES).map(([k, v]) => <span key={k} className={cx("chip", v.split(" ").slice(0, 2).join(" "))}>{k}: {s.beds.filter((b) => b.status === k).length}</span>)}</div>} />
      <div className="space-y-6">
        {wards.map((w) => (
          <div key={w}>
            <div className="flex items-center gap-3 mb-2.5">
              <h3 className="font-display font-bold text-ink">{w}</h3>
              <span className="text-xs text-soft">₹{s.beds.find((b) => b.ward === w)?.rate}/day · {s.beds.filter((b) => b.ward === w && b.status === "Available").length} free</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-2.5">
              {s.beds.filter((b) => b.ward === w).map((b) => (
                <button key={b.id} onClick={() => {
                  if (b.status === "Cleaning") a.setBedStatus(b.id, "Available");
                  else if (b.status === "Available") a.setBedStatus(b.id, "Reserved");
                  else if (b.status === "Reserved") a.setBedStatus(b.id, "Available");
                  else if (b.status === "Maintenance") a.setBedStatus(b.id, "Available");
                }}
                  className={cx("rounded-xl border-2 p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-md", BED_TONES[b.status])}
                  title={b.status === "Occupied" ? patOf(s, b.patientId)?.name : `Click: ${b.status} → next state`}>
                  <p className="font-display font-extrabold text-lg tabular-nums">{b.label}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide">{b.status}</p>
                  {b.status === "Occupied" && <p className="text-[10px] font-semibold truncate mt-0.5">{patOf(s, b.patientId)?.name}</p>}
                  {b.status === "Cleaning" && <p className="text-[9px] mt-0.5">tap → Available</p>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ Nursing ═══ */
export function NursingPage() {
  const { s, a } = useStore();
  const admitted = s.admissions.filter((x) => x.status === "Admitted");
  const [sel, setSel] = useState(admitted[0]?.patientId ?? "");
  const [note, setNote] = useState("");
  const [vf, setVf] = useState({ temp: "", bpSys: "", bpDia: "", pulse: "", spo2: "" });
  const me = s.patients.find((p) => p.id === sel);
  return (
    <div className="anim-fade-up">
      <PageHead title="Nursing Station" sub="Medication schedules, vitals and doctor's orders for admitted patients." />
      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
        {admitted.map((ad) => {
          const p = patOf(s, ad.patientId); const b = bedOf(s, ad.bedId);
          return (
            <button key={ad.id} onClick={() => setSel(ad.patientId)} className={cx("chip !py-2.5 !px-4 cursor-pointer shrink-0", sel === ad.patientId && "!bg-primary !text-white !border-primary")}>
              <BedDouble size={13} /> {b?.label} · {p?.name}
            </button>
          );
        })}
        {admitted.length === 0 && <p className="text-sm text-soft">No admitted patients right now.</p>}
      </div>
      {me && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="card p-5 lg:col-span-2">
            <h3 className="font-display font-bold text-ink flex items-center gap-2 mb-3"><Syringe size={16} className="text-primary" /> Medication administration — {me.name}</h3>
            {s.medTasks.filter((t) => t.patientId === me.id).map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl border border-line p-3 mb-2.5">
                <div className="flex-1 min-w-0"><p className="text-sm font-bold text-ink">{t.medicine}</p><p className="text-[11px] text-soft">{t.dose} · {t.times}</p></div>
                <StatusBadge status={t.status} />
                {t.status !== "Administered" && (
                  <div className="flex gap-1.5">
                    <button className="btn btn-primary btn-sm" onClick={() => a.setMedTask(t.id, "Administered")}>Give</button>
                    <button className="btn btn-outline btn-sm" onClick={() => a.setMedTask(t.id, t.status === "Held" ? "Due" : "Held")}>{t.status === "Held" ? "Unhold" : "Hold"}</button>
                  </div>
                )}
              </div>
            ))}
            {s.medTasks.filter((t) => t.patientId === me.id).length === 0 && <p className="text-sm text-soft">No scheduled medications.</p>}
            <p className="text-[11px] text-faint mt-2 flex items-center gap-1.5"><HeartHandshake size={12} /> Administration records the nurse's action only — prescriptions always come from the doctor.</p>
          </div>
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-display font-bold text-sm text-ink mb-3">Record vitals</h3>
              <div className="grid grid-cols-2 gap-2">
                {([["temp", "Temp °F"], ["bpSys", "BP sys"], ["bpDia", "BP dia"], ["pulse", "Pulse"], ["spo2", "SpO₂ %"]] as const).map(([k, l]) => <input key={k} value={vf[k]} onChange={(e) => setVf({ ...vf, [k]: e.target.value })} placeholder={l} className="input !px-2.5 !py-2 !text-xs mono" inputMode="numeric" aria-label={l} />)}
              </div>
              <button className="btn btn-primary btn-sm w-full mt-2.5" disabled={!vf.temp || !vf.pulse} onClick={() => { a.saveVitals({ patientId: me.id, at: new Date().toISOString(), by: s.user?.name ?? "Nurse", temp: +vf.temp, bpSys: +vf.bpSys || 120, bpDia: +vf.bpDia || 80, pulse: +vf.pulse, spo2: +vf.spo2 || 98 }); setVf({ temp: "", bpSys: "", bpDia: "", pulse: "", spo2: "" }); }}>Save vitals</button>
            </div>
            <div className="card p-5">
              <h3 className="font-display font-bold text-sm text-ink mb-3">Nursing notes</h3>
              <textarea className="textarea" rows={3} placeholder="Observations, intake/output, patient response…" value={note} onChange={(e) => setNote(e.target.value)} />
              <button className="btn btn-outline btn-sm w-full mt-2" disabled={!note.trim()} onClick={() => { a.addNursingNote(me.id, note.trim()); setNote(""); }}>Add note</button>
              <div className="mt-3 space-y-2.5 max-h-56 overflow-y-auto">
                {s.nursingNotes.filter((n) => n.patientId === me.id).map((n) => (
                  <div key={n.id} className="border-l-2 border-primary pl-3"><p className="text-xs text-soft leading-relaxed">{n.text}</p><p className="mono text-[10px] text-faint mt-1">{n.by} · {fmtDate(n.at)} {fmtTime(n.at)}</p></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══ Lab ═══ */
export function LabPage() {
  const { s, a } = useStore();
  const [resultFor, setResultFor] = useState<string | null>(null);
  const [vals, setVals] = useState<Record<string, string>>({});
  const order = s.labOrders.find((l) => l.id === resultFor);
  const cols = (["Pending", "Sample Collected", "Processing", "Completed"] as const);
  return (
    <div className="anim-fade-up">
      <PageHead title="Laboratory" sub="Orders arrive straight from consultations — collect, process, publish. Doctors are notified the moment a report is ready." />
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cols.map((st) => (
          <div key={st}>
            <div className="flex items-center justify-between mb-2.5"><h3 className="font-display font-bold text-sm text-ink uppercase tracking-wide">{st}</h3><Badge tone={st === "Completed" ? "ok" : st === "Pending" ? "warn" : "info"}>{s.labOrders.filter((l) => l.status === st).length}</Badge></div>
            <div className="space-y-2.5">
              {s.labOrders.filter((l) => l.status === st).map((l) => (
                <div key={l.id} className="card p-4">
                  <p className="font-bold text-sm text-ink">{l.test} {l.priority === "Urgent" && <Badge tone="danger" className="ml-1">Urgent</Badge>}</p>
                  <p className="text-[11px] text-soft mt-0.5">{patOf(s, l.patientId)?.name} · {l.no}</p>
                  <p className="text-[10px] text-faint">by {docOf(s, l.doctorId)?.name} · {fmtTime(l.at)}</p>
                  {st === "Pending" && <button className="btn btn-outline btn-sm w-full mt-2.5" onClick={() => a.setLabStatus(l.id, "Sample Collected")}>Collect sample</button>}
                  {st === "Sample Collected" && <button className="btn btn-outline btn-sm w-full mt-2.5" onClick={() => a.setLabStatus(l.id, "Processing")}>Start processing</button>}
                  {st === "Processing" && <button className="btn btn-primary btn-sm w-full mt-2.5" onClick={() => { setResultFor(l.id); setVals({}); }}>Enter results</button>}
                  {st === "Completed" && l.results && (
                    <div className="mt-2">{Object.entries(l.results).slice(0, 3).map(([k, v]) => <p key={k} className="flex justify-between text-[11px] py-0.5 border-b border-line/50"><span className="text-soft">{k}</span><span className="mono font-semibold">{v}</span></p>)}</div>
                  )}
                </div>
              ))}
              {s.labOrders.filter((l) => l.status === st).length === 0 && <p className="text-xs text-faint border border-dashed border-line rounded-xl p-4 text-center">Empty</p>}
            </div>
          </div>
        ))}
      </div>
      <Modal open={!!order} onClose={() => setResultFor(null)} title={`Enter results — ${order?.test ?? ""}`}
        footer={<><button className="btn btn-ghost" onClick={() => setResultFor(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { if (order) a.saveLabResult(order.id, vals); setResultFor(null); }}>Publish report</button></>}>
        <p className="text-sm text-soft mb-4">{patOf(s, order?.patientId ?? "")?.name} · ordered by {docOf(s, order?.doctorId ?? "")?.name}. Reference ranges are printed on the final report.</p>
        <div className="space-y-3">
          {(LAB_TEST_FIELDS[order?.test ?? ""] ?? ["Result"]).map((fld) => (
            <Field key={fld} label={fld}><input className="input mono" value={vals[fld] ?? ""} onChange={(e) => setVals({ ...vals, [fld]: e.target.value })} placeholder="value + unit" /></Field>
          ))}
        </div>
      </Modal>
    </div>
  );
}

/* ═══ Radiology ═══ */
export function RadiologyPage() {
  const { s, a } = useStore();
  const [repFor, setRepFor] = useState<string | null>(null);
  const [txt, setTxt] = useState("");
  const order = s.radiologyOrders.find((r) => r.id === repFor);
  return (
    <div className="anim-fade-up">
      <PageHead title="Radiology" sub="X-Ray, ultrasound and advanced imaging with same-day digital reporting." />
      <div className="card p-4">
        <DataTable
          cols={[
            { key: "no", label: "Req No", render: (r: any) => <span className="mono font-bold">{r.no}</span> },
            { key: "study", label: "Study", render: (r: any) => <div><p className="font-semibold text-ink">{r.modality} — {r.study}</p><p className="text-[10px] text-faint">{patOf(s, r.patientId)?.name} · by {docOf(s, r.doctorId)?.name}</p></div> },
            { key: "at", label: "Requested", render: (r: any) => <span className="text-xs">{fmtDate(r.at)} {fmtTime(r.at)}</span> },
            { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
            {
              key: "act", label: "", right: true, render: (r: any) =>
                r.status === "Requested" ? <button className="btn btn-outline btn-sm" onClick={(e: any) => { e.stopPropagation(); a.setRadStatus(r.id, "Scheduled"); }}>Schedule</button>
                  : r.status === "Scheduled" ? <button className="btn btn-outline btn-sm" onClick={(e: any) => { e.stopPropagation(); a.setRadStatus(r.id, "In Progress"); }}>Start scan</button>
                    : r.status === "In Progress" ? <button className="btn btn-primary btn-sm" onClick={(e: any) => { e.stopPropagation(); setRepFor(r.id); setTxt(""); }}><FileText size={13} /> Write report</button>
                      : <span className="text-xs font-bold text-ok">Report ready ✓</span>,
            },
          ]}
          rows={s.radiologyOrders as any}
          searchable={(r: any) => `${r.no} ${r.study} ${r.modality} ${patOf(s, r.patientId)?.name}`}
          pageSize={8}
        />
      </div>
      <Modal open={!!order} onClose={() => setRepFor(null)} title={`Report — ${order?.modality} ${order?.study}`}
        footer={<><button className="btn btn-ghost" onClick={() => setRepFor(null)}>Cancel</button>
          <button className="btn btn-primary" disabled={!txt.trim()} onClick={() => { if (order) a.setRadStatus(order.id, "Report Ready", txt.trim()); setRepFor(null); }}>Publish report</button></>}>
        <p className="text-sm text-soft mb-3">{patOf(s, order?.patientId ?? "")?.name} · reporting consultant: Dr. Prakash Wagh</p>
        <textarea className="textarea" rows={6} value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Findings and impression…" />
      </Modal>
    </div>
  );
}

/* ═══ OT ═══ */
export function OtPage() {
  const { s, a } = useStore();
  const [show, setShow] = useState(false);
  const [f, setF] = useState({ patientId: "", procedure: "", surgeonId: "", assistant: "", anesthetist: "Dr. Mohit Bansal", ot: "OT-1", at: "" });
  return (
    <div className="anim-fade-up">
      <PageHead title="Operation Theatre" sub="Surgery scheduling with full team, room and status tracking."
        actions={<button className="btn btn-primary btn-sm" onClick={() => setShow(true)}><Plus size={15} /> Schedule surgery</button>} />
      <div className="grid md:grid-cols-2 gap-4">
        {s.surgeries.map((sur) => (
          <div key={sur.id} className="card p-5">
            <div className="flex justify-between items-start"><p className="font-display font-bold text-ink">{sur.procedure}</p><StatusBadge status={sur.status} /></div>
            <p className="text-sm text-soft mt-1">{patOf(s, sur.patientId)?.name} · <span className="mono text-xs">{fmtDate(sur.at)} {sur.at.length > 10 ? fmtTime(sur.at) : ""}</span></p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              {[["Surgeon", docOf(s, sur.surgeonId)?.name ?? "—"], ["Assistant", sur.assistant], ["Anaesthesia", sur.anesthetist], ["Room", sur.ot]].map(([k, v]) => (
                <p key={k} className="rounded-lg bg-paper px-2.5 py-2"><span className="block text-[9px] font-bold uppercase text-faint">{k}</span><strong className="text-ink">{v}</strong></p>
              ))}
            </div>
            {sur.notes && <p className="text-[11px] text-soft mt-2.5 border-t border-line pt-2">{sur.notes}</p>}
          </div>
        ))}
      </div>
      <Modal open={show} onClose={() => setShow(false)} title="Schedule surgery" wide
        footer={<><button className="btn btn-ghost" onClick={() => setShow(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={!f.patientId || !f.procedure || !f.surgeonId || !f.at} onClick={() => {
            a.addSurgery({ id: uid(), ...f, status: "Scheduled" }); setShow(false); setF({ patientId: "", procedure: "", surgeonId: "", assistant: "", anesthetist: "Dr. Mohit Bansal", ot: "OT-1", at: "" });
          }}>Schedule</button></>}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Patient" req><SearchSelect placeholder="Search patient…" options={s.patients.map((p) => ({ id: p.id, label: p.name, sub: p.uhid }))} value={f.patientId} onChange={(id) => setF({ ...f, patientId: id })} /></Field>
          <Field label="Procedure" req><input className="input" value={f.procedure} onChange={(e) => setF({ ...f, procedure: e.target.value })} placeholder="e.g. Hernia repair" /></Field>
          <Field label="Surgeon" req><SearchSelect placeholder="Select surgeon…" options={s.doctors.filter((d) => d.deptId === "dep6" || d.deptId === "dep3").map((d) => ({ id: d.id, label: d.name, sub: d.specialty }))} value={f.surgeonId} onChange={(id) => setF({ ...f, surgeonId: id })} /></Field>
          <Field label="OT room"><select className="select" value={f.ot} onChange={(e) => setF({ ...f, ot: e.target.value })}><option>OT-1</option><option>OT-2</option></select></Field>
          <Field label="Assistant"><input className="input" value={f.assistant} onChange={(e) => setF({ ...f, assistant: e.target.value })} /></Field>
          <Field label="Anaesthetist"><input className="input" value={f.anesthetist} onChange={(e) => setF({ ...f, anesthetist: e.target.value })} /></Field>
          <div className="sm:col-span-2"><Field label="Date & time" req><input type="datetime-local" className="input" value={f.at} onChange={(e) => setF({ ...f, at: e.target.value })} /></Field></div>
        </div>
      </Modal>
    </div>
  );
}
