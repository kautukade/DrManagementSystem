import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { UserPlus, AlertTriangle, CalendarDays, Pill, FlaskConical, ScanLine, Receipt, BedDouble, ChevronLeft } from "lucide-react";
import { useStore, patOf, docOf, invTotal, invPaid } from "../../lib/store";
import { cx, fmtDate, fmtTime, inr, ageOf, timeAgo } from "../../lib/utils";
import { Avatar, Badge, DataTable, PageHead, StatusBadge, EmptyState, KV } from "../../components/ui";
import { RegisterPatientModal } from "./Reception";

export function PatientsPage() {
  const { s } = useStore();
  const nav = useNavigate();
  const [reg, setReg] = useState(false);
  return (
    <div className="anim-fade-up">
      <PageHead title="Patients" sub="Every patient record — appointments, prescriptions, reports and bills in one profile."
        actions={<button className="btn btn-primary btn-sm" onClick={() => setReg(true)}><UserPlus size={15} /> Register patient</button>} />
      <div className="card p-4">
        <DataTable
          cols={[
            { key: "uhid", label: "UHID", render: (p: any) => <span className="mono font-bold text-primary">{p.uhid}</span> },
            { key: "name", label: "Patient", render: (p: any) => <div className="flex items-center gap-2.5"><Avatar name={p.name} hue={200} size={32} /><span><span className="font-semibold text-ink block">{p.name}</span><span className="text-[10px] text-faint">{ageOf(p.dob)} · {p.gender} · {p.blood}</span></span></div> },
            { key: "mobile", label: "Mobile", render: (p: any) => <span className="mono text-xs">{p.mobile}</span> },
            { key: "allergies", label: "Allergies", render: (p: any) => p.allergies !== "None recorded" && p.allergies !== "None known" ? <Badge tone="danger"><AlertTriangle size={10} /> {p.allergies}</Badge> : <span className="text-xs text-faint">—</span> },
            { key: "visits", label: "Visits", render: (p: any) => <span className="mono">{s.appointments.filter((a) => a.patientId === p.id).length}</span> },
            { key: "created", label: "Registered", render: (p: any) => <span className="text-xs text-soft">{fmtDate(p.createdAt)}</span> },
          ]}
          rows={s.patients as any}
          searchable={(p: any) => `${p.name} ${p.uhid} ${p.mobile}`}
          onRow={(p: any) => nav(`/app/patients/${p.id}`)}
          pageSize={10}
        />
      </div>
      <RegisterPatientModal open={reg} onClose={() => setReg(false)} onDone={(id) => nav(`/app/patients/${id}`)} />
    </div>
  );
}

export function PatientProfilePage() {
  const { s } = useStore();
  const nav = useNavigate();
  const { id } = useParams();
  const p = patOf(s, id);
  const [tab, setTab] = useState("overview");
  if (!p) return <EmptyState title="Patient not found" action={<Link to="/app/patients" className="btn btn-primary">All patients</Link>} />;
  const appts = s.appointments.filter((x) => x.patientId === p.id);
  const rxs = s.prescriptions.filter((x) => x.patientId === p.id);
  const labs = s.labOrders.filter((x) => x.patientId === p.id);
  const rads = s.radiologyOrders.filter((x) => x.patientId === p.id);
  const invs = s.invoices.filter((x) => x.patientId === p.id);
  const adms = s.admissions.filter((x) => x.patientId === p.id);
  const vit = s.vitals.filter((x) => x.patientId === p.id);
  const notes = s.nursingNotes.filter((x) => x.patientId === p.id);
  const tabs = [
    { id: "overview", label: "Overview", icon: UserPlus }, { id: "visits", label: "Visits", icon: CalendarDays },
    { id: "rx", label: "Prescriptions", icon: Pill }, { id: "labs", label: "Lab Reports", icon: FlaskConical },
    { id: "rad", label: "Radiology", icon: ScanLine }, { id: "bills", label: "Bills", icon: Receipt }, { id: "ipd", label: "Admissions", icon: BedDouble },
  ];
  return (
    <div className="anim-fade-up">
      <button className="btn btn-ghost btn-sm mb-3" onClick={() => nav("/app/patients")}><ChevronLeft size={15} /> All patients</button>
      <div className="card p-5 flex flex-wrap items-center gap-5">
        <Avatar name={p.name} hue={200} size={64} />
        <div className="min-w-[200px]">
          <h1 className="font-display font-extrabold text-2xl text-ink">{p.name}</h1>
          <p className="mono text-xs text-soft">{p.uhid} · {ageOf(p.dob)} ({fmtDate(p.dob)}) · {p.gender} · {p.blood}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {p.allergies !== "None recorded" && p.allergies !== "None known" && <Badge tone="danger"><AlertTriangle size={11} /> Allergy: {p.allergies}</Badge>}
            {p.conditions !== "—" && <Badge tone="warn">{p.conditions}</Badge>}
            <Badge tone="neutral">{p.mobile}</Badge>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <Link to="/book" className="btn btn-outline btn-sm"><CalendarDays size={14} /> Book visit</Link>
          <Link to="/app/billing" className="btn btn-primary btn-sm"><Receipt size={14} /> Billing</Link>
        </div>
      </div>

      <div className="flex gap-1.5 mt-5 mb-4 overflow-x-auto no-scrollbar">
        {tabs.map((tb) => <button key={tb.id} onClick={() => setTab(tb.id)} className={cx("chip !py-2 !px-4 cursor-pointer shrink-0", tab === tb.id && "!bg-primary !text-white !border-primary")}><tb.icon size={13} /> {tb.label}</button>)}
      </div>

      {tab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="card p-5"><h3 className="font-display font-bold text-ink mb-2">Details</h3>
            <KV k="Address" v={p.address} /><KV k="Emergency contact" v={p.emergencyContact ?? "—"} /><KV k="Email" v={p.email ?? "—"} /><KV k="Registered" v={fmtDate(p.createdAt)} /><KV k="Notes" v={p.notes ?? "—"} />
          </div>
          <div className="card p-5"><h3 className="font-display font-bold text-ink mb-3">Vitals history</h3>
            {vit.length === 0 && <p className="text-sm text-soft">No vitals recorded.</p>}
            {vit.map((v) => (
              <div key={v.id} className="rounded-xl border border-line p-3 mb-2.5">
                <p className="text-[10px] font-bold uppercase text-faint">{fmtDate(v.at)} {fmtTime(v.at)} · {v.by}</p>
                <div className="flex flex-wrap gap-2 mt-1.5">{[["Temp", `${v.temp}°F`], ["BP", `${v.bpSys}/${v.bpDia}`], ["Pulse", v.pulse], ["SpO₂", `${v.spo2}%`], ...(v.sugar ? [["Sugar", v.sugar]] : [])].map(([k, val]: any) => <span key={k} className="chip mono">{k} <strong>{val}</strong></span>)}</div>
              </div>
            ))}
          </div>
          <div className="card p-5"><h3 className="font-display font-bold text-ink mb-3">Nursing notes</h3>
            {notes.length === 0 && <p className="text-sm text-soft">No notes.</p>}
            {notes.map((n) => <div key={n.id} className="border-l-2 border-primary pl-3 mb-3"><p className="text-sm text-soft leading-relaxed">{n.text}</p><p className="mono text-[10px] text-faint mt-1">{n.by} · {timeAgo(n.at)}</p></div>)}
          </div>
        </div>
      )}

      {tab === "visits" && (
        <div className="card p-4"><DataTable cols={[
          { key: "no", label: "Appt", render: (r: any) => <span className="mono font-semibold">{r.no}</span> },
          { key: "doc", label: "Doctor", render: (r: any) => docOf(s, r.doctorId)?.name },
          { key: "date", label: "Date", render: (r: any) => fmtDate(r.date) }, { key: "slot", label: "Slot" },
          { key: "token", label: "Token", render: (r: any) => <span className="mono font-bold">{r.token ?? "—"}</span> },
          { key: "reason", label: "Reason" }, { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
        ]} rows={appts as any} pageSize={8} empty="No visits yet" /></div>
      )}

      {tab === "rx" && (
        <div className="grid md:grid-cols-2 gap-4">
          {rxs.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex justify-between items-center"><p className="mono font-bold text-ink">{r.no}</p><StatusBadge status={r.status} /></div>
              <p className="text-[11px] text-soft mt-1">{fmtDate(r.at)} · {docOf(s, r.doctorId)?.name}</p>
              <div className="mt-3 space-y-1.5">{r.items.map((it, i) => <p key={i} className="text-sm"><strong className="text-ink">{it.name}</strong> <span className="text-soft">— {it.dose}, {it.frequency} × {it.duration} ({it.instructions})</span></p>)}</div>
              <p className="text-xs text-soft mt-3 pt-2.5 border-t border-line">{r.advice}</p>
            </div>
          ))}
          {rxs.length === 0 && <div className="md:col-span-2"><EmptyState title="No prescriptions yet" /></div>}
        </div>
      )}

      {tab === "labs" && (
        <div className="grid md:grid-cols-2 gap-4">
          {labs.map((l) => (
            <div key={l.id} className="card p-5">
              <div className="flex justify-between items-center"><p className="font-bold text-ink">{l.test} <span className="mono text-[10px] text-faint">{l.no}</span></p><StatusBadge status={l.status} /></div>
              <p className="text-[11px] text-soft mt-1">Ordered by {docOf(s, l.doctorId)?.name} · {fmtDate(l.at)}</p>
              {l.results ? <div className="mt-3">{Object.entries(l.results).map(([k, v]) => <p key={k} className="flex justify-between text-sm border-b border-line/60 py-1.5"><span className="text-soft">{k}</span><span className="mono font-semibold">{v}</span></p>)}</div> : <p className="text-xs text-faint mt-3">Awaiting sample / processing…</p>}
            </div>
          ))}
          {labs.length === 0 && <div className="md:col-span-2"><EmptyState title="No lab orders" /></div>}
        </div>
      )}

      {tab === "rad" && (
        <div className="grid md:grid-cols-2 gap-4">
          {rads.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex justify-between items-center"><p className="font-bold text-ink">{r.modality} — {r.study}</p><StatusBadge status={r.status} /></div>
              <p className="text-[11px] text-soft mt-1">{r.no} · {fmtDate(r.at)}</p>
              {r.report ? <p className="text-sm text-soft mt-3 leading-relaxed border-l-2 border-info pl-3">{r.report}</p> : <p className="text-xs text-faint mt-3">Report pending.</p>}
            </div>
          ))}
          {rads.length === 0 && <div className="md:col-span-2"><EmptyState title="No radiology studies" /></div>}
        </div>
      )}

      {tab === "bills" && (
        <div className="grid md:grid-cols-2 gap-4">
          {invs.map((i) => (
            <div key={i.id} className="card p-5">
              <div className="flex justify-between items-center"><p className="mono font-bold text-ink">{i.no}</p><StatusBadge status={i.status} /></div>
              <p className="text-[11px] text-soft mt-1">{fmtDate(i.createdAt)} · {i.items.length} charge(s)</p>
              <div className="mt-2.5">{i.items.map((it) => <p key={it.id} className="flex justify-between text-xs py-1 border-b border-line/50"><span className="text-soft">{it.desc}</span><span className="mono">{inr(it.amount)}</span></p>)}</div>
              <p className="mt-3 text-lg font-display font-extrabold text-ink">{inr(invTotal(s, i.id))} <span className="text-xs font-normal text-soft">· paid {inr(invPaid(s, i.id))}</span></p>
            </div>
          ))}
          {invs.length === 0 && <div className="md:col-span-2"><EmptyState title="No bills yet" /></div>}
        </div>
      )}

      {tab === "ipd" && (
        <div className="space-y-3">
          {adms.map((ad) => (
            <div key={ad.id} className="card p-5 flex flex-wrap items-center gap-4">
              <span className="w-11 h-11 rounded-xl bg-pine text-white font-display font-extrabold flex items-center justify-center text-sm">{s.beds.find((b) => b.id === ad.bedId)?.label ?? "—"}</span>
              <div className="min-w-[220px] flex-1"><p className="font-bold text-ink">{ad.no} · {ad.diagnosis}</p><p className="text-xs text-soft">{ad.ward} · admitted {fmtDate(ad.at)} · {docOf(s, ad.doctorId)?.name}</p></div>
              <StatusBadge status={ad.status} />
            </div>
          ))}
          {adms.length === 0 && <EmptyState title="No admissions" sub="Admissions from the IPD module appear here." />}
        </div>
      )}
    </div>
  );
}
