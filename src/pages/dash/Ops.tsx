import React, { useMemo, useState } from "react";
import { Boxes, Wrench, Truck, Star, BarChart3, ShieldAlert, Download, Plus, Minus } from "lucide-react";
import { useStore, invBalance } from "../../lib/store";
import { cx, inr, fmtDate, timeAgo, todayISO } from "../../lib/utils";
import { Badge, DataTable, Field, Modal, PageHead, StatCard, StatusBadge, EmptyState } from "../../components/ui";
import { Donut, HBars, RevenueArea, Spark } from "../../components/charts";

export function InventoryPage() {
  const { s, a } = useStore();
  return (
    <div className="anim-fade-up">
      <PageHead title="Hospital Inventory" sub="Consumables, PPE, linen and medical gas — beyond the pharmacy." />
      <div className="card p-4">
        <DataTable
          cols={[
            { key: "name", label: "Item", render: (r: any) => <div><p className="font-semibold text-ink">{r.name}</p><p className="text-[10px] text-faint">{r.cat} · {r.location}</p></div> },
            { key: "qty", label: "In stock", render: (r: any) => <span className={cx("mono font-bold", r.qty < r.min ? "text-danger" : "text-ink")}>{r.qty} {r.unit}</span> },
            { key: "min", label: "Minimum", render: (r: any) => <span className="mono text-xs text-soft">{r.min} {r.unit}</span> },
            { key: "st", label: "Status", render: (r: any) => <Badge tone={r.qty < r.min ? "danger" : "ok"}>{r.qty < r.min ? "Reorder" : "OK"}</Badge> },
            { key: "sup", label: "Supplier", render: (r: any) => <span className="text-xs text-soft">{r.supplier}</span> },
            { key: "adj", label: "Adjust", right: true, render: (r: any) => (
              <span className="inline-flex gap-1.5">
                <button className="btn btn-outline btn-sm !px-2" onClick={(e) => { e.stopPropagation(); a.setInventoryQty(r.id, Math.max(0, r.qty - 10)); }} aria-label="Decrease"><Minus size={13} /></button>
                <button className="btn btn-outline btn-sm !px-2" onClick={(e) => { e.stopPropagation(); a.setInventoryQty(r.id, r.qty + 10); }} aria-label="Increase"><Plus size={13} /></button>
              </span>
            ) },
          ]}
          rows={s.inventory as any}
          searchable={(r: any) => `${r.name} ${r.cat} ${r.supplier}`}
          pageSize={9}
        />
      </div>
    </div>
  );
}

export function AssetsPage() {
  const { s } = useStore();
  return (
    <div className="anim-fade-up">
      <PageHead title="Assets & AMC" sub="Biomedical equipment with warranty and maintenance-contract tracking." />
      <div className="card p-4">
        <DataTable
          cols={[
            { key: "name", label: "Asset", render: (r: any) => <div><p className="font-semibold text-ink">{r.name}</p><p className="mono text-[10px] text-faint">{r.serial}</p></div> },
            { key: "loc", label: "Location" },
            { key: "purchased", label: "Purchased", render: (r: any) => <span className="text-xs text-soft">{fmtDate(r.purchased)}</span> },
            { key: "warranty", label: "Warranty", render: (r: any) => <Badge tone={new Date(r.warrantyTill) < new Date() ? "neutral" : "ok"}>{new Date(r.warrantyTill) < new Date() ? "Expired" : `till ${fmtDate(r.warrantyTill)}`}</Badge> },
            { key: "amc", label: "AMC", render: (r: any) => <span className="text-xs">{r.amc}</span> },
            { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          ]}
          rows={s.assets as any}
          searchable={(r: any) => `${r.name} ${r.serial} ${r.location}`}
          pageSize={9}
        />
      </div>
    </div>
  );
}

export function AmbulancePage() {
  const { s } = useStore();
  return (
    <div className="anim-fade-up">
      <PageHead title="Ambulance Fleet" sub="Dispatch status, live trips and maintenance — 24×7." />
      <div className="grid md:grid-cols-3 gap-4 stagger">
        {s.ambulances.map((amb) => (
          <div key={amb.id} className="card card-hover p-5">
            <div className="flex items-center justify-between">
              <span className="w-11 h-11 rounded-xl bg-tint text-primary flex items-center justify-center"><Truck size={20} /></span>
              <StatusBadge status={amb.status} />
            </div>
            <p className="mono font-extrabold text-lg text-ink mt-3">{amb.no}</p>
            <p className="text-xs text-soft">Driver: {amb.driver}</p>
            {amb.status === "On Trip" && (
              <div className="mt-3 rounded-xl bg-infobg border border-info/25 p-3 text-xs text-info">
                <p className="font-bold">{amb.patient}</p>
                <p className="mt-1">{amb.from} → {amb.to}</p>
                <p className="mono mt-1 opacity-70">since {timeAgo(amb.since!)}</p>
              </div>
            )}
            {amb.status === "Available" && <p className="mt-3 text-xs text-ok font-semibold">Ready for dispatch · call {s.settings.ambulance}</p>}
            {amb.status === "Maintenance" && <p className="mt-3 text-xs text-faint">In workshop — back soon.</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeedbackPage() {
  const { s } = useStore();
  const avg = (k: "service" | "staff" | "cleanliness" | "waiting" | "overall") => (s.feedback.reduce((x, f) => x + f[k], 0) / s.feedback.length).toFixed(1);
  const bars: [string, string][] = [["Service", avg("service")], ["Staff behaviour", avg("staff")], ["Cleanliness", avg("cleanliness")], ["Waiting time", avg("waiting")], ["Overall", avg("overall")]];
  return (
    <div className="anim-fade-up">
      <PageHead title="Patient Feedback" sub="Aggregated from the public feedback form and portal." />
      <div className="grid lg:grid-cols-[300px_1fr] gap-4">
        <div className="card p-5 h-fit">
          <p className="font-display font-extrabold text-5xl text-primary">{avg("overall")}<span className="text-xl text-faint">/5</span></p>
          <p className="text-xs text-soft mt-1">{s.feedback.length} responses (demo)</p>
          <div className="mt-5 space-y-3">
            {bars.map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-soft">{k}</span><span className="mono font-bold text-ink">{v}</span></div>
                <div className="h-2 rounded-full bg-paper overflow-hidden"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${(+v / 5) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {s.feedback.map((f) => (
            <div key={f.id} className="card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-ink">{f.patient}</p>
                <div className="flex gap-0.5 text-gold">{Array.from({ length: f.overall }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}</div>
              </div>
              <p className="text-xs text-soft mt-2 leading-relaxed">“{f.comment}”</p>
              <p className="mono text-[10px] text-faint mt-2">{fmtDate(f.at)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const { s, toast } = useStore();
  const t = todayISO();
  const sourceData = useMemo(() => {
    const m: Record<string, number> = { OPD: 0, IPD: 0, Pharmacy: 0, Lab: 0, Radiology: 0, Procedures: 0 };
    s.revenueHistory.forEach((d) => { m.OPD += d.opd; m.IPD += d.ipd; m.Pharmacy += d.pharmacy; m.Lab += d.lab; m.Radiology += d.radiology; });
    m.Procedures = Math.round(m.OPD * 0.22);
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [s]);
  const chartData = useMemo(() => s.revenueHistory.map((d) => ({ label: new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), ...d })), [s]);
  const deptRows = s.departments.map((d) => {
    const appts = s.appointments.filter((x) => x.deptId === d.id);
    const rev = appts.reduce((x, a) => x + a.fee, 0) * 3.4 + appts.length * 450;
    return { id: d.id, name: d.name, patients: appts.length * 9 + 14, rev: Math.round(rev), appts: appts.length, trend: [3, 5, 4, 6, 7, 6, 8].map((x) => x + (d.hue % 5)) };
  }).sort((a, b) => b.rev - a.rev);
  const docRows = s.doctors.filter((d) => d.fee > 0).map((d) => {
    const appts = s.appointments.filter((x) => x.doctorId === d.id);
    return { id: d.id, name: d.name, appts: appts.length, seen: appts.filter((x) => x.status === "Completed").length, wait: `${12 + (d.years % 9)} min`, fu: s.consultations.filter((c) => c.doctorId === d.id && c.followUp === t).length };
  });
  return (
    <div className="anim-fade-up">
      <PageHead title="Analytics & Reports" sub="Department, doctor and revenue intelligence — demo figures, real architecture."
        actions={<button className="btn btn-outline btn-sm" onClick={() => toast("Report export queued — CSV/PDF connectors ship with the Supabase backend", "info")}><Download size={14} /> Export report</button>} />
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-display font-bold text-ink mb-2">Revenue trend by source — 14 days</h3>
          <RevenueArea data={chartData} height={250} />
        </div>
        <div className="card p-5">
          <h3 className="font-display font-bold text-ink mb-1">Revenue share</h3>
          <Donut data={sourceData} height={230} money />
        </div>
      </div>
      <div className="card p-5 mt-4">
        <h3 className="font-display font-bold text-ink mb-3">Department performance</h3>
        <HBars data={deptRows.slice(0, 8).map((d) => ({ name: d.name.split(" ")[0], value: d.rev, extra: d.appts * 4 }))} height={220} money />
        <div className="overflow-x-auto mt-4">
          <table className="tbl">
            <thead><tr><th>Department</th><th>Patients</th><th>Appointments</th><th>Revenue (demo)</th><th>Trend</th></tr></thead>
            <tbody>
              {deptRows.map((d) => (
                <tr key={d.id}><td className="font-semibold text-ink">{d.name}</td><td className="mono">{d.patients}</td><td className="mono">{d.appts}</td><td className="mono font-bold">{inr(d.rev)}</td><td className="w-28"><Spark data={d.trend} height={30} /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card p-5 mt-4">
        <h3 className="font-display font-bold text-ink mb-1">Doctor operations</h3>
        <p className="text-[11px] text-faint mb-3">Operational metrics only — never a measure of clinical quality.</p>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Doctor</th><th>Appointments</th><th>Patients seen</th><th>Avg. wait</th><th>Follow-ups today</th></tr></thead>
            <tbody>
              {docRows.map((d) => (
                <tr key={d.id}><td className="font-semibold text-ink">{d.name}</td><td className="mono">{d.appts}</td><td className="mono">{d.seen}</td><td className="mono">{d.wait}</td><td className="mono">{d.fu}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AuditPage() {
  const { s } = useStore();
  const [mod, setMod] = useState("");
  const mods = Array.from(new Set(s.audit.map((x) => x.module)));
  const rows = s.audit.filter((x) => !mod || x.module === mod);
  return (
    <div className="anim-fade-up">
      <PageHead title="Audit Logs" sub="Who did what, where and when — every sensitive action is tracked."
        actions={<select className="select !w-auto" value={mod} onChange={(e) => setMod(e.target.value)} aria-label="Filter module"><option value="">All modules</option>{mods.map((m) => <option key={m}>{m}</option>)}</select>} />
      <div className="card p-4">
        <DataTable
          cols={[
            { key: "at", label: "When", render: (r: any) => <span className="mono text-xs text-soft">{timeAgo(r.at)}</span> },
            { key: "user", label: "User", render: (r: any) => <div><p className="font-semibold text-ink">{r.user}</p><p className="text-[10px] text-faint">{r.role}</p></div> },
            { key: "action", label: "Action", render: (r: any) => <span className="text-ink">{r.action}</span> },
            { key: "record", label: "Record", render: (r: any) => <span className="text-xs text-soft">{r.record}</span> },
            { key: "module", label: "Module", render: (r: any) => <Badge tone="primary">{r.module}</Badge> },
          ]}
          rows={rows as any}
          searchable={(r: any) => `${r.user} ${r.action} ${r.module} ${r.record}`}
          pageSize={12}
        />
      </div>
    </div>
  );
}
