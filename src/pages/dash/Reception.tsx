import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Ticket, MonitorPlay, Search, Stethoscope, Receipt, Siren, Phone } from "lucide-react";
import { useStore, docOf, patOf } from "../../lib/store";
import { cx, fmtTime, inr, todayISO, toneFor } from "../../lib/utils";
import { Avatar, Badge, DataTable, Field, Modal, PageHead, SearchSelect, StatCard, StatusBadge, EmptyState } from "../../components/ui";

/* ── shared patient registration modal ── */
export function RegisterPatientModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone?: (id: string, uhid: string) => void }) {
  const { a } = useStore();
  const [f, setF] = useState({ name: "", dob: "", gender: "Male" as "Male" | "Female" | "Other", mobile: "", email: "", address: "", emergencyContact: "", blood: "O+", allergies: "", conditions: "", notes: "" });
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ id: string; uhid: string } | null>(null);
  const submit = () => {
    const res = a.registerPatient({ name: f.name.trim(), dob: f.dob, gender: f.gender, mobile: f.mobile.trim(), email: f.email || undefined, address: f.address || "—", emergencyContact: f.emergencyContact || "—", blood: f.blood, allergies: f.allergies || "None recorded", conditions: f.conditions || "—", notes: f.notes || undefined });
    if ("error" in res) setErr(res.error);
    else { setDone(res); setErr(""); }
  };
  return (
    <Modal open={open} onClose={() => { onClose(); setDone(null); setErr(""); setF({ name: "", dob: "", gender: "Male", mobile: "", email: "", address: "", emergencyContact: "", blood: "O+", allergies: "", conditions: "", notes: "" }); }}
      title={done ? "Patient registered ✓" : "Register new patient"} wide
      footer={done ? <button className="btn btn-primary" onClick={() => { onDone?.(done.id, done.uhid); onClose(); setDone(null); }}>Open patient profile</button> : <>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit} disabled={!f.name || !f.dob || !f.mobile}>Save patient</button>
      </>}>
      {done ? (
        <div className="text-center py-6 anim-pop">
          <p className="text-sm text-soft">UHID generated — share it with the patient:</p>
          <p className="mono font-extrabold text-3xl text-primary mt-2">{done.uhid}</p>
          <p className="text-xs text-faint mt-3">Stored in the demo database · no real personal data leaves this browser.</p>
        </div>
      ) : (
        <>
          {err && <p className="rounded-lg bg-dangerbg text-danger text-sm font-semibold px-3.5 py-2.5 mb-4 anim-tick">{err}</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name" req><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Rohan Deshmukh" /></Field>
            <Field label="Date of birth / age" req><input type="date" className="input" value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} /></Field>
            <Field label="Gender" req><select className="select" value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value as any })}><option>Male</option><option>Female</option><option>Other</option></select></Field>
            <Field label="Mobile" req><input className="input mono" value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value })} placeholder="10-digit mobile" inputMode="numeric" /></Field>
            <Field label="Email (optional)"><input className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Field label="Blood group"><select className="select" value={f.blood} onChange={(e) => setF({ ...f, blood: e.target.value })}>{["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "Unknown"].map((b) => <option key={b}>{b}</option>)}</select></Field>
            <div className="sm:col-span-2"><Field label="Address"><input className="input" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field></div>
            <Field label="Emergency contact"><input className="input" value={f.emergencyContact} onChange={(e) => setF({ ...f, emergencyContact: e.target.value })} placeholder="Name — phone" /></Field>
            <Field label="Known allergies"><input className="input" value={f.allergies} onChange={(e) => setF({ ...f, allergies: e.target.value })} placeholder="e.g. Penicillin" /></Field>
            <Field label="Known conditions"><input className="input" value={f.conditions} onChange={(e) => setF({ ...f, conditions: e.target.value })} placeholder="e.g. Diabetes" /></Field>
            <Field label="Notes"><input className="input" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
          </div>
          <p className="text-[11px] text-faint mt-4">Patient ID is auto-generated (PT-2026-XXXXXX). Duplicate mobile numbers are blocked to avoid double records.</p>
        </>
      )}
    </Modal>
  );
}

export default function Reception() {
  const { s, a } = useStore();
  const nav = useNavigate();
  const t = todayISO();
  const [tab, setTab] = useState("queue");
  const [reg, setReg] = useState(false);
  const [walk, setWalk] = useState(false);
  const [wf, setWf] = useState({ patientId: "", doctorId: "", reason: "" });
  const [walkDone, setWalkDone] = useState<number | null>(null);
  const [searchQ, setSearchQ] = useState("");

  const today = useMemo(() => s.appointments.filter((x) => x.date === t).sort((x, y) => (x.token ?? 999) - (y.token ?? 999)), [s.appointments, t]);
  const waiting = today.filter((x) => x.status === "Waiting");
  const withDoc = today.filter((x) => x.status === "With Doctor");
  const nowServing = withDoc[withDoc.length - 1];

  const doWalkIn = () => {
    if (!wf.patientId || !wf.doctorId) return;
    const token = a.walkIn({ patientId: wf.patientId, doctorId: wf.doctorId, reason: wf.reason || "General consultation" });
    setWalkDone(token);
  };

  const found = searchQ.length >= 2 ? s.patients.filter((p) => (p.name + p.uhid + p.mobile).toLowerCase().includes(searchQ.toLowerCase())).slice(0, 6) : [];

  return (
    <div className="anim-fade-up">
      <PageHead title="Reception Desk" sub="Check-ins, tokens, walk-ins and registration — the front door of the hospital."
        actions={<>
          <Link to="/queue" className="btn btn-outline btn-sm"><MonitorPlay size={15} /> Lobby TV</Link>
          <button className="btn btn-outline btn-sm" onClick={() => setWalk(true)}><Ticket size={15} /> Walk-in</button>
          <button className="btn btn-primary btn-sm" onClick={() => setReg(true)}><UserPlus size={15} /> New patient</button>
        </>} />

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3 stagger">
        <StatCard label="Today's Appointments" value={today.length} icon={Stethoscope} />
        <StatCard label="Waiting" value={waiting.length} icon={Ticket} tone="warn" sub={waiting[0] ? `Next: Token ${waiting[0].token}` : "Queue clear"} />
        <StatCard label="With Doctor" value={withDoc.length} tone="pine" icon={Stethoscope} sub={nowServing ? `Token ${nowServing.token} in room` : "—"} />
        <StatCard label="Completed" value={today.filter((x) => x.status === "Completed").length} tone="ok" icon={Receipt} />
        <StatCard label="Walk-ins" value={today.filter((x) => x.type === "Walk-in").length} tone="info" icon={Siren} />
      </div>

      {/* patient quick search */}
      <div className="card p-4 mt-4 relative">
        <div className="flex items-center gap-2.5">
          <Search size={16} className="text-faint" />
          <input className="flex-1 bg-transparent outline-none text-sm" placeholder="Quick patient search — name, UHID or mobile…" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} aria-label="Search patients" />
        </div>
        {found.length > 0 && (
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2 anim-fade-in">
            {found.map((p) => (
              <button key={p.id} onClick={() => nav(`/app/patients/${p.id}`)} className="flex items-center gap-2.5 rounded-xl border border-line p-2.5 hover:border-primary hover:bg-tint text-left transition-colors">
                <Avatar name={p.name} hue={200} size={32} />
                <span className="min-w-0"><span className="block text-sm font-bold text-ink truncate">{p.name}</span><span className="mono text-[10px] text-soft">{p.uhid} · {p.mobile}</span></span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* tabs */}
      <div className="flex gap-1.5 mt-5 mb-4 overflow-x-auto no-scrollbar">
        {[["queue", "Live Queue"], ["board", "Token Board"], ["all", "All Appointments"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={cx("chip !py-2 !px-4 cursor-pointer", tab === id && "!bg-primary !text-white !border-primary")}>{label}</button>
        ))}
      </div>

      {tab === "queue" && (
        <div className="card p-4">
          {today.length === 0 ? <EmptyState title="No appointments today" sub="Bookings from the website and walk-ins appear here instantly." /> : (
            <div className="overflow-x-auto">
              <table className="tbl min-w-full">
                <thead><tr><th>Token</th><th>Patient</th><th>Doctor</th><th>Slot</th><th>Type</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                <tbody>
                  {today.map((x) => {
                    const p = patOf(s, x.patientId); const d = docOf(s, x.doctorId);
                    return (
                      <tr key={x.id}>
                        <td><span className={cx("mono font-extrabold text-sm w-9 h-9 rounded-lg inline-flex items-center justify-center", x.status === "Waiting" ? "bg-warnbg text-warn" : x.status === "With Doctor" ? "bg-pine text-white" : "bg-paper text-soft")}>{x.token ?? "—"}</span></td>
                        <td><button onClick={() => nav(`/app/patients/${x.patientId}`)} className="font-semibold text-ink hover:text-primary">{p?.name}</button><p className="mono text-[10px] text-faint">{p?.uhid}</p></td>
                        <td>{d?.name}<p className="text-[10px] text-faint">{d?.specialty}</p></td>
                        <td className="mono">{x.slot}</td>
                        <td><Badge tone={x.type === "Walk-in" ? "info" : "neutral"}>{x.type}</Badge></td>
                        <td><StatusBadge status={x.status} /></td>
                        <td className="text-right whitespace-nowrap">
                          {(x.status === "Booked") && <button className="btn btn-primary btn-sm" onClick={() => a.checkIn(x.id)}>Check-in → Token</button>}
                          {x.status === "Waiting" && <button className="btn btn-outline btn-sm" onClick={() => a.setApptStatus(x.id, "No Show")}>No-show</button>}
                          {(x.status === "Completed") && <button className="btn btn-ghost btn-sm" onClick={() => nav(`/app/patients/${x.patientId}`)}>Profile</button>}
                          {(x.status === "Booked") && <button className="btn btn-ghost btn-sm !text-danger" onClick={() => a.setApptStatus(x.id, "Cancelled")}>Cancel</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "board" && (
        <div className="grid lg:grid-cols-[300px_1fr] gap-4">
          <div className="card p-5 bg-pine text-white border-pine2">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Now serving</p>
            <p className="font-display font-extrabold text-7xl text-white mt-3 tabular-nums">{nowServing?.token ?? "—"}</p>
            <p className="text-sm text-white/70 mt-2">{nowServing ? `${patOf(s, nowServing.patientId)?.name} → ${docOf(s, nowServing.doctorId)?.name}` : "Waiting room clear"}</p>
            <Link to="/queue" className="btn btn-sm !bg-white/12 !text-white hover:!bg-white/20 mt-5 w-full justify-center"><MonitorPlay size={14} /> Open lobby display</Link>
          </div>
          <div className="card p-5">
            <p className="font-display font-bold text-ink mb-3">Waiting queue ({waiting.length})</p>
            {waiting.length === 0 ? <EmptyState title="Nobody waiting" sub="Check in booked patients to grow the queue." /> : (
              <div className="flex flex-wrap gap-2.5">
                {waiting.map((x) => (
                  <div key={x.id} className="rounded-xl border border-warn/30 bg-warnbg px-4 py-3 text-center min-w-[92px] anim-tick">
                    <p className="font-display font-extrabold text-2xl text-warn tabular-nums">{x.token}</p>
                    <p className="text-[11px] font-bold text-ink truncate max-w-[110px]">{patOf(s, x.patientId)?.name}</p>
                    <p className="text-[10px] text-soft">{docOf(s, x.doctorId)?.name.replace("Dr. ", "Dr ")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "all" && (
        <div className="card p-4">
          <DataTable
            cols={[
              { key: "no", label: "No", render: (r: any) => <span className="mono font-semibold">{r.no}</span> },
              { key: "p", label: "Patient", render: (r: any) => patOf(s, r.patientId)?.name },
              { key: "d", label: "Doctor", render: (r: any) => docOf(s, r.doctorId)?.name },
              { key: "date", label: "Date" }, { key: "slot", label: "Slot" },
              { key: "fee", label: "Fee", right: true, render: (r: any) => <span className="mono">{inr(r.fee)}</span> },
              { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
            ]}
            rows={s.appointments as any}
            searchable={(r: any) => `${r.no} ${patOf(s, r.patientId)?.name} ${docOf(s, r.doctorId)?.name} ${r.status}`}
            onRow={(r: any) => nav(`/app/patients/${r.patientId}`)}
            pageSize={10}
          />
        </div>
      )}

      {/* walk-in modal */}
      <Modal open={walk} onClose={() => { setWalk(false); setWalkDone(null); setWf({ patientId: "", doctorId: "", reason: "" }); }}
        title={walkDone ? "Walk-in checked in ✓" : "Register walk-in"}
        footer={walkDone ? <button className="btn btn-primary" onClick={() => { setWalk(false); setWalkDone(null); }}>Done</button> : <>
          <button className="btn btn-ghost" onClick={() => setWalk(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={!wf.patientId || !wf.doctorId} onClick={doWalkIn}>Issue token</button>
        </>}>
        {walkDone ? (
          <div className="text-center py-6 anim-pop">
            <p className="text-sm text-soft">Hand this token to the patient:</p>
            <p className="font-display font-extrabold text-7xl text-primary my-3">{walkDone}</p>
            <p className="text-xs text-faint">The lobby display and doctor's queue update instantly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Field label="Patient" req><SearchSelect placeholder="Search registered patient…" options={s.patients.map((p) => ({ id: p.id, label: p.name, sub: p.uhid }))} value={wf.patientId} onChange={(id) => setWf({ ...wf, patientId: id })} /></Field>
            <p className="text-[11px] text-faint -mt-2">Not registered yet? <button className="text-primary font-bold hover:underline" onClick={() => { setWalk(false); setReg(true); }}>Create the patient first</button> — then return here.</p>
            <Field label="Doctor" req><SearchSelect placeholder="Assign doctor…" options={s.doctors.filter((d) => d.fee > 0).map((d) => ({ id: d.id, label: d.name, sub: d.specialty }))} value={wf.doctorId} onChange={(id) => setWf({ ...wf, doctorId: id })} /></Field>
            <Field label="Reason"><input className="input" value={wf.reason} onChange={(e) => setWf({ ...wf, reason: e.target.value })} placeholder="Short complaint" /></Field>
          </div>
        )}
      </Modal>

      <RegisterPatientModal open={reg} onClose={() => setReg(false)} onDone={(id) => nav(`/app/patients/${id}`)} />
    </div>
  );
}
