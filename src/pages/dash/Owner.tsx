import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IndianRupee, Users, CalendarDays, BedDouble, Pill, AlertTriangle, ArrowRight, TrendingUp,
  Clock, Receipt, ShieldAlert, ChevronRight,
} from "lucide-react";
import { useStore, todayRevenue, lowStockMeds, expiringMeds, bedStats, invBalance, isToday } from "../../lib/store";
import { inr, cx, timeAgo, todayISO } from "../../lib/utils";
import { StatCard, Badge, ECG, PageHead, DemoTag } from "../../components/ui";
import { RevenueArea, Donut, HBars } from "../../components/charts";

export default function OwnerDashboard() {
  const { s } = useStore();
  const nav = useNavigate();
  const t = todayISO();

  const rev = todayRevenue(s);
  const yesterday = s.revenueHistory[s.revenueHistory.length - 1];
  const yesterdayTotal = yesterday.opd + yesterday.ipd + yesterday.pharmacy + yesterday.lab + yesterday.radiology;
  const apptsToday = s.appointments.filter((a) => a.date === t);
  const beds = bedStats(s);
  const phSales = s.invoices.flatMap((i) => i.items.filter((it) => it.cat === "Pharmacy" && isToday(it.at))).reduce((x, i) => x + i.amount, 0);
  const receivable = s.invoices.filter((i) => i.status !== "Paid").reduce((x, i) => x + invBalance(s, i.id), 0);
  const low = lowStockMeds(s);
  const exp60 = expiringMeds(s, 60);
  const followUps = s.consultations.filter((c) => c.followUp === t).length;

  const chartData = useMemo(() => {
    const hist = s.revenueHistory.map((d) => ({ label: new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), ...d }));
    const todays = s.payments.filter((p) => isToday(p.at));
    const bucket = { opd: 0, ipd: 0, pharmacy: 0, lab: 0, radiology: 0 };
    todays.forEach((p) => {
      const inv = s.invoices.find((i) => i.id === p.invoiceId);
      const total = inv?.items.reduce((x, i) => x + i.amount, 0) || 1;
      inv?.items.forEach((it) => {
        const share = (it.amount / total) * p.amount;
        if (it.cat === "Pharmacy") bucket.pharmacy += share;
        else if (it.cat === "Lab") bucket.lab += share;
        else if (it.cat === "Radiology") bucket.radiology += share;
        else if (it.cat === "Bed" || it.cat === "Nursing") bucket.ipd += share;
        else bucket.opd += share;
      });
    });
    return [...hist, { label: "Today", opd: Math.round(bucket.opd), ipd: Math.round(bucket.ipd), pharmacy: Math.round(bucket.pharmacy), lab: Math.round(bucket.lab), radiology: Math.round(bucket.radiology) }];
  }, [s]);

  const payMix = useMemo(() => {
    const m: Record<string, number> = {};
    s.payments.filter((p) => isToday(p.at)).forEach((p) => { m[p.method] = (m[p.method] ?? 0) + p.amount; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [s.payments]);

  const deptPerf = useMemo(() => s.departments.slice(0, 6).map((d) => {
    const list = s.appointments.filter((a) => a.deptId === d.id && a.date === t && a.status !== "Cancelled");
    return { name: d.name.split(" ")[0], value: list.reduce((x, a) => x + a.fee, 0) + list.length * 220, extra: list.length };
  }), [s, t]);

  const alerts = [
    { icon: ShieldAlert, tone: "text-warn bg-warnbg border-warn/30", text: `${low.length} medicines at or below minimum stock`, to: "/app/pharmacy?tab=alerts" },
    { icon: Clock, tone: "text-danger bg-dangerbg border-danger/30", text: `${exp60.length} medicines expiring within 60 days`, to: "/app/pharmacy?tab=alerts" },
    { icon: BedDouble, tone: "text-ok bg-okbg border-ok/30", text: `${beds.available} beds available right now (${beds.pct}% occupied)`, to: "/app/beds" },
    { icon: Receipt, tone: "text-info bg-infobg border-info/30", text: `${inr(receivable)} pending receivables across unpaid bills`, to: "/app/billing" },
    { icon: Users, tone: "text-primary bg-tint border-primary/30", text: `${followUps} follow-up patient(s) due today`, to: "/app/appointments" },
  ];

  const pipeline = [
    { label: "Booked", n: apptsToday.filter((a) => a.status === "Booked").length, tone: "bg-infobg text-info" },
    { label: "Waiting", n: apptsToday.filter((a) => a.status === "Waiting").length, tone: "bg-warnbg text-warn" },
    { label: "With Doctor", n: apptsToday.filter((a) => a.status === "With Doctor").length, tone: "bg-pine text-[#cfe8de]" },
    { label: "Completed", n: apptsToday.filter((a) => a.status === "Completed").length, tone: "bg-okbg text-ok" },
  ];

  return (
    <div className="anim-fade-up">
      {/* header */}
      <div className="rounded-2xl bg-pine text-white p-6 lg:p-7 relative overflow-hidden">
        <ECG className="absolute inset-x-0 bottom-2 h-10 text-accent/25" />
        <div className="relative flex flex-wrap items-center gap-6 justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Owner Dashboard · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
            <h1 className="font-display font-extrabold text-3xl mt-2">Namaste, {s.user?.name.split(" ")[0]} <DemoTag className="ml-2 !text-[10px]" /></h1>
            <div className="flex flex-wrap gap-2 mt-4">
              {pipeline.map((p) => (
                <span key={p.label} className={cx("rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-2", p.tone)}>{p.label} <span className="mono text-sm">{p.n}</span></span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/50">Today's revenue</p>
            <p className="font-display font-extrabold text-5xl text-[#7ee2c0] tabular-nums mt-1">{inr(rev)}</p>
            <p className={cx("text-xs font-semibold mt-1 flex items-center gap-1 justify-end", rev >= yesterdayTotal * 0.2 ? "text-[#7ee2c0]" : "text-[#ffd08a]")}>
              <TrendingUp size={13} /> yesterday closed at {inr(yesterdayTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* alerts rail */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mt-4 stagger">
        {alerts.map((al) => (
          <Link key={al.text} to={al.to} className={cx("rounded-xl border p-3 flex items-start gap-2.5 text-xs font-semibold leading-snug hover:-translate-y-0.5 transition-transform", al.tone)}>
            <al.icon size={15} className="shrink-0 mt-0.5" /> {al.text}
          </Link>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mt-4 stagger">
        <StatCard label="Patients Today" value={apptsToday.length} icon={Users} sub={`${apptsToday.filter((a) => a.type === "Walk-in").length} walk-ins`} onClick={() => nav("/app/reception")} />
        <StatCard label="Appointments" value={apptsToday.filter((a) => a.status !== "Cancelled").length} icon={CalendarDays} sub={`${apptsToday.filter((a) => a.status === "Completed").length} completed`} onClick={() => nav("/app/appointments")} tone="info" />
        <StatCard label="Bed Occupancy" value={`${beds.pct}%`} icon={BedDouble} sub={`${beds.occupied}/${beds.total} occupied`} onClick={() => nav("/app/beds")} tone="warn" />
        <StatCard label="Pharmacy Sales" value={inr(phSales)} icon={Pill} sub={`${s.pharmacyOrders.filter((o) => o.status !== "Dispensed").length} orders in queue`} onClick={() => nav("/app/pharmacy")} />
        <StatCard label="Pending Bills" value={inr(receivable)} icon={Receipt} sub={`${s.invoices.filter((i) => i.status !== "Paid").length} invoices open`} onClick={() => nav("/app/billing")} tone="danger" />
        <StatCard label="Admitted (IPD)" value={s.admissions.filter((x) => x.status === "Admitted").length} icon={AlertTriangle} sub={`${s.beds.filter((b) => b.ward === "ICU" && b.status === "Occupied").length} in ICU`} onClick={() => nav("/app/ipd")} tone="pine" />
      </div>

      {/* charts */}
      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-bold text-ink">Revenue — last 14 days by source</h3>
            <Badge tone="primary">OPD · IPD · Pharmacy · Lab · Radiology</Badge>
          </div>
          <RevenueArea data={chartData} height={270} />
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-display font-bold text-ink mb-1">Collections by method <span className="text-xs font-normal text-soft">(today)</span></h3>
            {payMix.length ? <Donut data={payMix} height={190} money /> : <p className="text-sm text-soft py-8 text-center">No payments yet today — record one from Billing.</p>}
          </div>
          <div className="card p-5">
            <h3 className="font-display font-bold text-ink mb-3">Department revenue today</h3>
            <HBars data={deptPerf} height={170} money />
          </div>
        </div>
      </div>

      {/* activity + quick actions */}
      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-ink">Live activity — every action is audit-logged</h3>
            <Link to="/app/audit" className="text-xs font-bold text-primary hover:underline">Full audit log →</Link>
          </div>
          <div className="space-y-1">
            {s.audit.slice(0, 8).map((e) => (
              <div key={e.id} className="flex items-start gap-3 py-2.5 border-b border-line/60 last:border-0">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink leading-snug"><strong>{e.action}</strong></p>
                  <p className="text-[11px] text-soft mt-0.5">{e.record}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge tone="neutral">{e.module}</Badge>
                  <p className="mono text-[10px] text-faint mt-1">{timeAgo(e.at)} · {e.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-display font-bold text-ink mb-3">Jump to a module</h3>
          <div className="grid grid-cols-2 gap-2">
            {[["/app/reception", "Reception", Users], ["/app/doctor", "Doctor Desk", CalendarDays], ["/app/pharmacy", "Pharmacy", Pill], ["/app/billing", "Billing", Receipt], ["/app/lab", "Laboratory", ShieldAlert], ["/app/beds", "Beds", BedDouble], ["/app/analytics", "Analytics", TrendingUp], ["/app/settings", "Settings", ChevronRight]].map(([to, label, I]: any) => (
              <Link key={to} to={to} className="rounded-xl border border-line p-3 flex flex-col gap-2 hover:border-primary hover:bg-tint transition-colors group">
                <I size={16} className="text-primary" />
                <span className="text-xs font-bold text-ink group-hover:text-primary">{label}</span>
              </Link>
            ))}
          </div>
          <Link to="/" className="btn btn-dark btn-sm w-full mt-3 justify-center">View public website <ArrowRight size={13} /></Link>
        </div>
      </div>
    </div>
  );
}
