import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Stethoscope, Users, CheckCircle2, Repeat, BedDouble, ChevronLeft, Printer, Pill,
  FlaskConical, Plus, Trash2, Send, ClipboardList, AlertTriangle, Activity,
} from "lucide-react";
import { useStore, patOf, docOf } from "../../lib/store";
import type { RxItem } from "../../lib/types";
import { CONSULT_TEMPLATES, LAB_TEST_FIELDS } from "../../lib/data";
import { cx, inr, fmtDate, todayISO, ageOf } from "../../lib/utils";
import { Avatar, Badge, Field, Modal, PageHead, SearchSelect, StatCard, StatusBadge, EmptyState } from "../../components/ui";

export function DoctorDashboard() {
  const { s, a } = useStore();
  const nav = useNavigate();
  const me = docOf(s, s.user?.id) ?? s.doctors[0];
  const t = todayISO();
  const mine = s.appointments.filter((x) => x.doctorId === me.id && x.date === t).sort((x, y) => (x.token ?? 99) - (y.token ?? 99));
  const followUps = s.consultations.filter((c) => c.doctorId === me.id && c.followUp === t);
  const admitted = s.admissions.filter((x) => x.doctorId === me.id && x.status === "Admitted");

  const start = (id: string) => {
    const ap = s.appointments.find((x) => x.id === id)!;
    if (ap.status === "Waiting" || ap.status === "Checked In") a.setApptStatus(id, "With Doctor");
    nav(`/app/consult/${id}`);
  };

  return (
    <div className="anim-fade-up">
      <PageHead title={`${me.name}'s Desk`} sub={`${me.specialty} · OPD ${me.from}–${me.to} · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`} />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 stagger">
        <StatCard label="Today's Appointments" value={mine.length} icon={Stethoscope} />
        <StatCard label="Waiting" value={mine.filter((x) => x.status === "Waiting").length} icon={Users} tone="warn" />
        <StatCard label="Completed" value={mine.filter((x) => x.status === "Completed").length} icon={CheckCircle2} tone="ok" />
        <StatCard label="Follow-ups Due" value={followUps.length} icon={Repeat} tone="info" />
        <StatCard label="Admitted Patients" value={admitted.length} icon={BedDouble} tone="pine" />
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4 mt-5">
        <div className="card p-5">
          <h3 className="font-display font-bold text-ink mb-4">Today's queue <span className="text-xs font-normal text-soft">— in token order</span></h3>
          {mine.length === 0 ? <EmptyState title="No appointments today" sub="Your online bookings and reception check-ins appear here." icon={Stethoscope} /> : (
            <div className="space-y-2.5">
              {mine.map((x) => {
                const p = patOf(s, x.patientId);
                const active = x.status === "With Doctor";
                return (
                  <div key={x.id} className={cx("rounded-xl border p-3.5 flex items-center gap-3.5 transition-colors", active ? "border-primary bg-tint/60" : "border-line bg-white")}>
                    <span className={cx("w-11 h-11 rounded-xl font-display font-extrabold flex items-center justify-center text-lg shrink-0", x.status === "Waiting" ? "bg-warnbg text-warn" : active ? "bg-primary text-white" : "bg-paper text-soft")}>{x.token ?? "•"}</span>
                    <div className="min-w-0 flex-1">
                      <button onClick={() => nav(`/app/patients/${x.patientId}`)} className="font-bold text-sm text-ink hover:text-primary truncate block">{p?.name} <span className="text-faint font-normal mono text-[10px]">· {p ? ageOf(p.dob) : ""} · {p?.gender}</span></button>
                      <p className="text-xs text-soft truncate">{x.reason}</p>
                      <div className="flex gap-1.5 mt-1.5"><StatusBadge status={x.status} />{p?.allergies !== "None recorded" && p?.allergies !== "None known" && <Badge tone="danger"><AlertTriangle size={10} /> {p?.allergies}</Badge>}</div>
                    </div>
                    {(x.status === "Waiting" || x.status === "Checked In" || x.status === "With Doctor") ? (
                      <button className="btn btn-primary btn-sm shrink-0" onClick={() => start(x.id)}>{active ? "Continue →" : "Start consult"}</button>
                    ) : (
                      <button className="btn btn-outline btn-sm shrink-0" onClick={() => nav(`/app/patients/${x.patientId}`)}>View</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-display font-bold text-ink mb-3">Recent prescriptions</h3>
            {s.prescriptions.filter((r) => r.doctorId === me.id).slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-line/60 last:border-0">
                <div><p className="mono text-xs font-bold text-ink">{r.no}</p><p className="text-[11px] text-soft">{patOf(s, r.patientId)?.name} · {r.items.length} medicine(s)</p></div>
                <StatusBadge status={r.status} />
              </div>
            ))}
            {s.prescriptions.filter((r) => r.doctorId === me.id).length === 0 && <p className="text-sm text-soft">None yet.</p>}
          </div>
          <div className="card p-5">
            <h3 className="font-display font-bold text-ink mb-3">Awaiting reports</h3>
            {s.labOrders.filter((l) => l.doctorId === me.id && l.status !== "Completed").map((l) => (
              <div key={l.id} className="flex items-center justify-between py-2.5 border-b border-line/60 last:border-0">
                <div><p className="text-sm font-semibold text-ink">{l.test}</p><p className="text-[11px] text-soft">{patOf(s, l.patientId)?.name} · {l.no}</p></div>
                <StatusBadge status={l.status} />
              </div>
            ))}
            <Link to="/app/lab" className="text-xs font-bold text-primary hover:underline mt-2 inline-block">Open laboratory →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════ consultation + digital prescription ═══════ */
export function ConsultPage() {
  const { s, a, toast } = useStore();
  const nav = useNavigate();
  const { id } = useParams();
  const appt = s.appointments.find((x) => x.id === id);
  const me = docOf(s, s.user?.id) ?? s.doctors[0];
  const p = appt ? patOf(s, appt.patientId) : undefined;
  const [f, setF] = useState({ complaint: "", symptoms: "", history: "", examination: "", diagnosis: "", advice: "", followUp: "", internalNotes: "" });
  const [vitals, setVitals] = useState({ temp: "", bpSys: "", bpDia: "", pulse: "", spo2: "", sugar: "" });
  const [meds, setMeds] = useState<RxItem[]>([]);
  const [medId, setMedId] = useState("");
  const [labs, setLabs] = useState<string[]>([]);
  const [savedRx, setSavedRx] = useState<string | null>(null);
  const [showRx, setShowRx] = useState(false);
  const [pharmaSent, setPharmaSent] = useState(false);

  if (!appt || !p) return <EmptyState title="Appointment not found" action={<Link to="/app/doctor" className="btn btn-primary">Back to my desk</Link>} />;
  const completed = appt.status === "Completed";
  const lastVitals = s.vitals.filter((v) => v.patientId === p.id)[0];
  const pastRx = s.prescriptions.filter((r) => r.patientId === p.id).slice(0, 3);
  const doneLabs = s.labOrders.filter((l) => l.patientId === p.id && l.status === "Completed");
  const rx = s.prescriptions.find((r) => r.id === savedRx) ?? (completed ? s.prescriptions.find((r) => r.consultationId && s.consultations.find((c) => c.id === r.consultationId)?.appointmentId === appt.id) : undefined);

  const applyTemplate = (name: string) => {
    const t = CONSULT_TEMPLATES[name];
    setF((x) => ({ ...x, complaint: t.complaint, symptoms: t.symptoms, diagnosis: t.diagnosis, advice: t.advice }));
    const items: RxItem[] = t.meds.map((m) => {
      const med = s.medicines.find((x) => x.name === m.name);
      return { medicineId: med?.id ?? "", name: m.name, strength: med?.name.split(" ").pop() ?? "", dose: m.dose, frequency: m.frequency, duration: m.duration, route: "Oral", instructions: m.instructions, qty: 10, price: med?.price ?? 0 };
    });
    setMeds(items);
  };

  const addMed = () => {
    const med = s.medicines.find((m) => m.id === medId);
    if (!med) return;
    if (med.stock === 0) { toast("Out of stock — choose another medicine or add stock first", "err"); return; }
    setMeds((x) => [...x, { medicineId: med.id, name: med.name, strength: med.name.split(" ").pop() ?? "", dose: "1 tablet", frequency: "Twice daily", duration: "5 days", route: "Oral", instructions: "After food", qty: 10, price: med.price }]);
    setMedId("");
  };

  const save = () => {
    if (!f.diagnosis.trim()) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const { rxId } = a.completeConsultation(appt.id, { ...f, rxItems: meds, labs });
    setSavedRx(rxId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const rxTotal = meds.reduce((x, m) => x + m.qty * m.price, 0);

  return (
    <div className="anim-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <button className="btn btn-outline btn-sm" onClick={() => nav("/app/doctor")}><ChevronLeft size={15} /> Queue</button>
        <div>
          <h1 className="font-display font-bold text-xl text-ink">Consultation — {p.name} <span className="mono text-xs text-soft">({appt.no} · Token {appt.token ?? "—"})</span></h1>
          <p className="text-xs text-soft">{p.uhid} · {ageOf(p.dob)} · {p.gender} · {p.blood}</p>
        </div>
        <StatusBadge status={appt.status} className="ml-auto" />
      </div>

      {savedRx && (
        <div className="rounded-2xl border border-ok/30 bg-okbg p-5 mb-5 anim-pop flex flex-wrap items-center gap-4">
          <CheckCircle2 size={22} className="text-ok" />
          <div className="flex-1 min-w-[200px]">
            <p className="font-display font-bold text-ink">Consultation completed · {rx?.no ?? "no prescription"}</p>
            <p className="text-xs text-soft">Consultation fee added to the patient's bill{labs.length ? ` · ${labs.length} lab order(s) sent` : ""}.</p>
          </div>
          {rx && <>
            <button className="btn btn-dark btn-sm" onClick={() => setShowRx(true)}><Printer size={14} /> Print Rx</button>
            <button className="btn btn-primary btn-sm" onClick={() => { if (a.sendToPharmacy(rx.id)) setPharmaSent(true); }} disabled={pharmaSent || s.pharmacyOrders.some((o) => o.prescriptionId === rx.id)}><Send size={14} /> Send to Hospital Pharmacy</button>
          </>}
        </div>
      )}

      <div className="grid lg:grid-cols-[320px_1fr] gap-5">
        {/* patient summary */}
        <aside className="space-y-4 h-fit">
          <div className="card p-5">
            <div className="flex items-center gap-3"><Avatar name={p.name} hue={200} size={46} /><div><p className="font-display font-bold text-ink">{p.name}</p><p className="mono text-[11px] text-soft">{p.uhid}</p></div></div>
            <div className="mt-4 space-y-2 text-xs">
              {[["Reason", appt.reason], ["Allergies", p.allergies], ["Known conditions", p.conditions], ["Emergency contact", p.emergencyContact ?? "—"]].map(([k, v]) => (
                <p key={k} className={cx("rounded-lg px-3 py-2", k === "Allergies" && v !== "None recorded" && v !== "None known" ? "bg-dangerbg text-danger font-bold" : "bg-paper text-soft")}><span className="font-bold text-ink/70 uppercase text-[10px] tracking-wide block">{k}</span>{v}</p>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <h4 className="font-display font-bold text-sm text-ink flex items-center gap-2"><Activity size={14} className="text-primary" /> Latest vitals {lastVitals && <span className="text-[10px] text-faint font-normal">{fmtDate(lastVitals.at)}</span>}</h4>
            {lastVitals ? (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[["Temp", `${lastVitals.temp}°F`], ["BP", `${lastVitals.bpSys}/${lastVitals.bpDia}`], ["Pulse", `${lastVitals.pulse}`], ["SpO₂", `${lastVitals.spo2}%`], ["Sugar", lastVitals.sugar ?? "—"], ["RR", lastVitals.rr ?? "—"]].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-paper p-2 text-center"><p className="text-[9px] font-bold uppercase text-faint">{k}</p><p className="mono text-sm font-bold text-ink">{v}</p></div>
                ))}
              </div>
            ) : <p className="text-xs text-soft mt-2">No vitals recorded yet.</p>}
            <h4 className="font-display font-bold text-sm text-ink mt-5 mb-2">Record vitals now</h4>
            <div className="grid grid-cols-3 gap-2">
              {([["temp", "Temp °F"], ["bpSys", "Sys"], ["bpDia", "Dia"], ["pulse", "Pulse"], ["spo2", "SpO₂"], ["sugar", "Sugar"]] as const).map(([k, label]) => (
                <input key={k} value={vitals[k]} onChange={(e) => setVitals({ ...vitals, [k]: e.target.value })} placeholder={label} className="input !px-2 !py-1.5 !text-xs mono" inputMode="numeric" aria-label={label} />
              ))}
            </div>
            <button className="btn btn-outline btn-sm w-full mt-2.5" disabled={!vitals.temp || !vitals.pulse} onClick={() => a.saveVitals({ patientId: p.id, at: new Date().toISOString(), by: s.user?.name ?? me.name, temp: +vitals.temp, bpSys: +vitals.bpSys || 120, bpDia: +vitals.bpDia || 80, pulse: +vitals.pulse, spo2: +vitals.spo2 || 98, sugar: vitals.sugar ? +vitals.sugar : undefined })}>Save vitals</button>
          </div>
          <div className="card p-5">
            <h4 className="font-display font-bold text-sm text-ink mb-2">Past prescriptions</h4>
            {pastRx.length ? pastRx.map((r) => <p key={r.id} className="text-xs text-soft py-1.5 border-b border-line/60 last:border-0"><span className="mono font-bold text-ink">{r.no}</span> · {r.items.map((i) => i.name.split(" ")[0]).join(", ")}</p>) : <p className="text-xs text-soft">None on record.</p>}
            <h4 className="font-display font-bold text-sm text-ink mt-4 mb-2">Completed lab reports</h4>
            {doneLabs.length ? doneLabs.map((l) => <p key={l.id} className="text-xs text-soft py-1.5 border-b border-line/60 last:border-0"><span className="font-bold text-ink">{l.test}</span> · {Object.entries(l.results ?? {}).slice(0, 2).map(([k, v]) => `${k} ${v}`).join(" · ")}</p>) : <p className="text-xs text-soft">None yet.</p>}
          </div>
        </aside>

        {/* consultation form */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="font-display font-bold text-ink flex items-center gap-2"><ClipboardList size={17} className="text-primary" /> Consultation note</h3>
              <div className="flex gap-1.5 flex-wrap">
                {Object.keys(CONSULT_TEMPLATES).map((tp) => <button key={tp} onClick={() => applyTemplate(tp)} className="chip hover:!border-primary hover:!text-primary cursor-pointer">{tp}</button>)}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Chief complaint" req><input className="input" value={f.complaint} onChange={(e) => setF({ ...f, complaint: e.target.value })} disabled={completed} /></Field>
              <Field label="History of present illness"><input className="input" value={f.symptoms} onChange={(e) => setF({ ...f, symptoms: e.target.value })} disabled={completed} /></Field>
              <Field label="Past history / medications"><input className="input" value={f.history} onChange={(e) => setF({ ...f, history: e.target.value })} disabled={completed} /></Field>
              <Field label="Examination findings"><input className="input" value={f.examination} onChange={(e) => setF({ ...f, examination: e.target.value })} disabled={completed} /></Field>
              <div className="sm:col-span-2"><Field label="Diagnosis" req><input className={cx("input", !f.diagnosis && "border-warn")} value={f.diagnosis} onChange={(e) => setF({ ...f, diagnosis: e.target.value })} disabled={completed} /></Field></div>
              <div className="sm:col-span-2"><Field label="Advice"><textarea className="textarea" rows={2} value={f.advice} onChange={(e) => setF({ ...f, advice: e.target.value })} disabled={completed} /></Field></div>
              <Field label="Follow-up date"><input type="date" className="input" value={f.followUp} onChange={(e) => setF({ ...f, followUp: e.target.value })} disabled={completed} /></Field>
              <Field label="Internal notes (staff only)"><input className="input" value={f.internalNotes} onChange={(e) => setF({ ...f, internalNotes: e.target.value })} disabled={completed} placeholder="Not shown to patient" /></Field>
            </div>
          </div>

          {/* medicines */}
          <div className="card p-5">
            <h3 className="font-display font-bold text-ink flex items-center gap-2 mb-3"><Pill size={17} className="text-primary" /> Prescription (e-Rx)</h3>
            {!completed && (
              <div className="flex gap-2 mb-3">
                <div className="flex-1"><SearchSelect placeholder="Search medicine (live stock shown)…" options={s.medicines.map((m) => ({ id: m.id, label: m.name, sub: m.stock === 0 ? "OUT OF STOCK" : `stock ${m.stock} · ₹${m.price}` }))} value={medId} onChange={setMedId} /></div>
                <button className="btn btn-outline shrink-0" onClick={addMed} disabled={!medId}><Plus size={15} /> Add</button>
              </div>
            )}
            {meds.length === 0 ? <p className="text-sm text-soft">No medicines added — or apply a template above.</p> : (
              <div className="space-y-2.5">
                {meds.map((m, i) => (
                  <div key={i} className="rounded-xl border border-line p-3 anim-tick">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-ink flex-1">{m.name} <span className="text-faint font-normal">₹{m.price}/unit</span></p>
                      <p className="mono text-xs text-soft">{inr(m.qty * m.price)}</p>
                      {!completed && <button className="text-faint hover:text-danger" onClick={() => setMeds(meds.filter((_, j) => j !== i))} aria-label="Remove medicine"><Trash2 size={14} /></button>}
                    </div>
                    {!completed ? (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2.5">
                        {([["dose", "Dose"], ["frequency", "Frequency"], ["duration", "Duration"], ["route", "Route"], ["instructions", "Instructions"]] as const).map(([k, label]) => (
                          <input key={k} value={m[k]} onChange={(e) => setMeds(meds.map((x, j) => j === i ? { ...x, [k]: e.target.value } : x))} className="input !px-2 !py-1.5 !text-xs" placeholder={label} aria-label={label} />
                        ))}
                        <input type="number" value={m.qty} min={1} onChange={(e) => setMeds(meds.map((x, j) => j === i ? { ...x, qty: Math.max(1, +e.target.value) } : x))} className="input !px-2 !py-1.5 !text-xs mono sm:col-span-1" aria-label="Quantity" />
                      </div>
                    ) : (
                      <p className="text-xs text-soft mt-1">{m.dose} · {m.frequency} · {m.duration} · {m.instructions} · Qty {m.qty}</p>
                    )}
                  </div>
                ))}
                <p className="text-right text-sm font-bold text-ink">Estimated pharmacy value: <span className="mono text-primary">{inr(rxTotal)}</span></p>
              </div>
            )}
          </div>

          {/* investigations */}
          <div className="card p-5">
            <h3 className="font-display font-bold text-ink flex items-center gap-2 mb-3"><FlaskConical size={17} className="text-primary" /> Investigations to order</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(LAB_TEST_FIELDS).map((tst) => (
                <button key={tst} disabled={completed} onClick={() => setLabs(labs.includes(tst) ? labs.filter((x) => x !== tst) : [...labs, tst])}
                  className={cx("chip cursor-pointer !py-2 !px-3.5", labs.includes(tst) && "!bg-primary !text-white !border-primary")}>{tst}</button>
              ))}
            </div>
            <p className="text-[11px] text-faint mt-2.5">Selected tests are sent to the lab dashboard and auto-billed (₹650 per panel in demo).</p>
          </div>

          {!completed && (
            <button className="btn btn-primary btn-lg w-full" onClick={save} disabled={!f.diagnosis.trim()}>
              <CheckCircle2 size={18} /> Save consultation & complete visit
            </button>
          )}
        </div>
      </div>

      {/* printable Rx */}
      <Modal open={showRx} onClose={() => setShowRx(false)} title="Digital prescription" wide footer={<>
        <button className="btn btn-ghost" onClick={() => setShowRx(false)}>Close</button>
        <button className="btn btn-primary" onClick={() => window.print()}><Printer size={15} /> Print / Save PDF</button>
      </>}>
        {rx && (
          <div className="print-area bg-white p-6 rounded-xl border border-line">
            <div className="flex justify-between border-b-2 border-pine pb-4">
              <div>
                <p className="font-display font-extrabold text-xl text-pine">{s.settings.name}</p>
                <p className="text-[11px] text-soft">{s.settings.address}</p>
                <p className="text-[11px] text-soft">{s.settings.phone} · {s.settings.email}</p>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-ink">{me.name}</p>
                <p className="text-[11px] text-soft">{me.quals}</p>
                <p className="mono text-xs font-bold text-primary mt-1">{rx.no}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs py-3 border-b border-line">
              <p><span className="text-faint block">Patient</span><strong>{p.name} · {ageOf(p.dob)} / {p.gender}</strong></p>
              <p><span className="text-faint block">UHID</span><strong className="mono">{p.uhid}</strong></p>
              <p><span className="text-faint block">Date</span><strong>{fmtDate(rx.at)}</strong></p>
            </div>
            <p className="text-xs py-2"><span className="text-faint">Diagnosis: </span><strong>{f.diagnosis || s.consultations.find((c) => c.id === rx.consultationId)?.diagnosis}</strong></p>
            <p className="font-display font-bold text-lg text-primary">℞</p>
            <table className="w-full text-sm mt-1">
              <thead><tr className="text-left text-[10px] uppercase text-faint"><th className="py-1.5">#</th><th>Medicine</th><th>Dose</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead>
              <tbody>{rx.items.map((it, i) => (
                <tr key={i} className="border-t border-line/60"><td className="py-2 text-faint">{i + 1}</td><td className="font-semibold">{it.name}</td><td>{it.dose}</td><td>{it.frequency}</td><td>{it.duration}</td><td className="text-soft">{it.instructions}</td></tr>
              ))}</tbody>
            </table>
            <p className="text-xs mt-4"><span className="text-faint">Advice: </span>{rx.advice}{rx.followUp ? ` · Review on ${fmtDate(rx.followUp)}` : ""}</p>
            <div className="flex justify-between items-end mt-8 text-xs">
              <p className="text-faint">Generated by ITCYBER Hospital360 OS · demo document</p>
              <p className="font-bold text-ink border-t border-ink pt-1.5 px-6 text-right">Signature<br /><span className="font-normal text-faint">{me.name}</span></p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


