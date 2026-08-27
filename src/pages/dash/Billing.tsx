import React, { useMemo, useState } from "react";
import { Receipt, IndianRupee, Wallet, Printer, Plus, TrendingDown, Briefcase } from "lucide-react";
import { useStore, patOf, invTotal, invPaid, invBalance, isToday } from "../../lib/store";
import type { ChargeCat, PayMethod } from "../../lib/types";
import { cx, inr, fmtDate, fmtTime, todayISO } from "../../lib/utils";
import { Badge, DataTable, Drawer, Field, Modal, PageHead, StatCard, StatusBadge, EmptyState, SearchSelect } from "../../components/ui";
import { Donut } from "../../components/charts";

const CATS: ChargeCat[] = ["Consultation", "Procedure", "Bed", "Nursing", "Lab", "Radiology", "OT", "Pharmacy", "Other"];

export default function Billing({ accountsOnly }: { accountsOnly?: boolean }) {
  const { s, a } = useStore();
  const [tab, setTab] = useState(accountsOnly ? "accounts" : "invoices");
  const [openInv, setOpenInv] = useState<string | null>(null);
  const [pay, setPay] = useState(false);
  const [payF, setPayF] = useState({ amount: "", method: "UPI" as PayMethod, note: "" });
  const [charge, setCharge] = useState({ desc: "", cat: "Consultation" as ChargeCat, amount: "" });
  const [exp, setExp] = useState(false);
  const [expF, setExpF] = useState({ cat: "Supplies", desc: "", amount: "" });

  const inv = s.invoices.find((i) => i.id === openInv);
  const todaysPay = s.payments.filter((p) => isToday(p.at));
  const collections = todaysPay.reduce((x, p) => x + p.amount, 0);
  const byMethod = useMemo(() => {
    const m: Record<string, number> = {};
    todaysPay.forEach((p) => { m[p.method] = (m[p.method] ?? 0) + p.amount; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [todaysPay]);
  const receivable = s.invoices.filter((i) => i.status !== "Paid").reduce((x, i) => x + invBalance(s, i.id), 0);
  const monthExp = s.expenses.reduce((x, e) => x + e.amount, 0);
  const payables = s.suppliers.reduce((x, sp) => x + sp.outstanding, 0);

  return (
    <div className="anim-fade-up">
      <PageHead title={accountsOnly ? "Accounts & Expenses" : "Billing & Payments"} sub="Central billing engine — every consultation, scan, bed-day and tablet lands on one itemised invoice."
        actions={!accountsOnly && <button className="btn btn-primary btn-sm" onClick={() => setTab("accounts")}><Briefcase size={14} /> Accounts view</button>} />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 stagger">
        <StatCard label="Today's Collections" value={inr(collections)} icon={IndianRupee} sub={`${todaysPay.length} payment(s)`} />
        <StatCard label="Cash" value={inr(byMethod.find((x) => x.name === "Cash")?.value ?? 0)} icon={Wallet} tone="ok" />
        <StatCard label="UPI" value={inr(byMethod.find((x) => x.name === "UPI")?.value ?? 0)} tone="info" icon={Wallet} />
        <StatCard label="Card" value={inr(byMethod.find((x) => x.name === "Card")?.value ?? 0)} tone="pine" icon={Wallet} />
        <StatCard label="Outstanding" value={inr(receivable)} tone="danger" icon={Receipt} sub={`${s.invoices.filter((i) => i.status !== "Paid").length} open invoices`} />
      </div>

      {!accountsOnly && (
        <div className="flex gap-1.5 mt-5 mb-4">
          {[["invoices", "Invoices"], ["accounts", "Accounts & Expenses"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={cx("chip !py-2 !px-4 cursor-pointer", tab === id && "!bg-primary !text-white !border-primary")}>{label}</button>
          ))}
        </div>
      )}

      {tab === "invoices" && (
        <div className="card p-4 mt-0">
          <DataTable
            cols={[
              { key: "no", label: "Invoice", render: (r: any) => <span className="mono font-bold">{r.no}</span> },
              { key: "p", label: "Patient", render: (r: any) => <div><p className="font-semibold text-ink">{patOf(s, r.patientId)?.name}</p><p className="mono text-[10px] text-faint">{patOf(s, r.patientId)?.uhid}</p></div> },
              { key: "items", label: "Charges", render: (r: any) => <span className="text-xs text-soft">{r.items.length} item(s)</span> },
              { key: "total", label: "Total", right: true, render: (r: any) => <span className="mono font-bold">{inr(invTotal(s, r.id))}</span> },
              { key: "paid", label: "Paid", right: true, render: (r: any) => <span className="mono text-soft">{inr(invPaid(s, r.id))}</span> },
              { key: "bal", label: "Balance", right: true, render: (r: any) => <span className={cx("mono font-bold", invBalance(s, r.id) > 0 ? "text-danger" : "text-ok")}>{inr(invBalance(s, r.id))}</span> },
              { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
            ]}
            rows={s.invoices as any}
            searchable={(r: any) => `${r.no} ${patOf(s, r.patientId)?.name} ${r.status}`}
            onRow={(r: any) => { setOpenInv(r.id); setCharge({ desc: "", cat: "Consultation", amount: "" }); }}
            pageSize={9}
          />
        </div>
      )}

      {tab === "accounts" && (
        <div className="grid lg:grid-cols-3 gap-4 mt-0">
          <div className="card p-5">
            <h3 className="font-display font-bold text-ink mb-1">Payment mix today</h3>
            {byMethod.length ? <Donut data={byMethod} height={210} money /> : <p className="text-sm text-soft py-10 text-center">No payments yet today.</p>}
            <div className="mt-2 space-y-1.5">
              {["Cash", "UPI", "Card", "Insurance", "Credit"].map((mth) => {
                const v = byMethod.find((x) => x.name === mth)?.value ?? 0;
                return <div key={mth} className="flex justify-between text-xs"><span className="text-soft">{mth}</span><span className="mono font-bold text-ink">{inr(v)}</span></div>;
              })}
            </div>
          </div>
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-ink">Expenses <span className="text-xs font-normal text-soft">— month to date {inr(monthExp)}</span></h3>
              <button className="btn btn-outline btn-sm" onClick={() => setExp(true)}><Plus size={14} /> Record expense</button>
            </div>
            <div className="space-y-2">
              {s.expenses.map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-2.5">
                  <span className="w-8 h-8 rounded-lg bg-dangerbg text-danger flex items-center justify-center shrink-0"><TrendingDown size={15} /></span>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-ink truncate">{e.desc}</p><p className="text-[11px] text-soft">{e.cat} · {fmtDate(e.date)}</p></div>
                  <span className="mono font-bold text-sm text-ink">{inr(e.amount)}</span>
                  <Badge tone={e.paid ? "ok" : "warn"}>{e.paid ? "Paid" : "Due"}</Badge>
                </div>
              ))}
            </div>
            <h3 className="font-display font-bold text-ink mt-6 mb-2">Supplier payables</h3>
            {s.suppliers.filter((x) => x.outstanding > 0).map((sp) => (
              <div key={sp.id} className="flex justify-between text-sm py-2 border-b border-line/60 last:border-0"><span className="text-soft">{sp.name}</span><span className="mono font-bold text-warn">{inr(sp.outstanding)}</span></div>
            ))}
            <p className="text-right text-sm font-bold mt-2">Total payables: <span className="mono text-danger">{inr(payables)}</span></p>
          </div>
        </div>
      )}

      {/* invoice drawer */}
      <Drawer open={!!inv} onClose={() => setOpenInv(null)} title={inv ? <span className="mono">{inv.no}</span> : ""}
        footer={inv && invBalance(s, inv.id) > 0 ? <button className="btn btn-primary w-full" onClick={() => { setPayF({ amount: String(invBalance(s, inv.id)), method: "UPI", note: "" }); setPay(true); }}><IndianRupee size={15} /> Record payment — {inr(invBalance(s, inv.id))} due</button> : inv ? <p className="text-center text-sm font-bold text-ok py-1">Invoice fully paid ✓</p> : undefined}>
        {inv && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div><p className="font-display font-bold text-ink">{patOf(s, inv.patientId)?.name}</p><p className="mono text-[11px] text-soft">{patOf(s, inv.patientId)?.uhid} · created {fmtDate(inv.createdAt)}</p></div>
              <StatusBadge status={inv.status} />
            </div>
            <div className="print-area card !shadow-none p-4" id="invoice-print">
              <p className="font-display font-bold text-pine text-lg">{s.settings.name}</p>
              <p className="text-[10px] text-soft">{s.settings.address} · {s.settings.phone}</p>
              <table className="w-full mt-3 text-sm">
                <thead><tr className="text-left text-[10px] uppercase text-faint"><th className="pb-1.5">Charge</th><th>Category</th><th className="text-right">Amount</th></tr></thead>
                <tbody>
                  {inv.items.map((it) => (
                    <tr key={it.id} className="border-t border-line/60"><td className="py-2 pr-2 font-semibold text-ink">{it.desc}</td><td><Badge tone="neutral">{it.cat}</Badge></td><td className="mono text-right">{inr(it.amount)}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t-2 border-pine mt-2 pt-2 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-soft">Total</span><span className="mono font-bold">{inr(invTotal(s, inv.id))}</span></div>
                <div className="flex justify-between"><span className="text-soft">Paid</span><span className="mono text-ok">{inr(invPaid(s, inv.id))}</span></div>
                <div className="flex justify-between text-base"><span className="font-bold">Balance due</span><span className="mono font-extrabold text-danger">{inr(invBalance(s, inv.id))}</span></div>
              </div>
            </div>
            <div className="no-print">
              <h4 className="font-display font-bold text-sm text-ink mb-2">Add charge</h4>
              <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                <input className="input !text-sm" placeholder="Description…" value={charge.desc} onChange={(e) => setCharge({ ...charge, desc: e.target.value })} />
                <select className="select !w-auto !text-sm" value={charge.cat} onChange={(e) => setCharge({ ...charge, cat: e.target.value as ChargeCat })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
                <button className="btn btn-outline btn-sm" onClick={() => { if (charge.desc && +charge.amount > 0) { a.addChargeTo(inv.id, charge.desc, charge.cat, +charge.amount); setCharge({ desc: "", cat: "Consultation", amount: "" }); } }} disabled={!charge.desc || !+charge.amount}>Add</button>
                <input type="number" className="input !text-sm mono col-span-3" placeholder="Amount ₹" value={charge.amount} onChange={(e) => setCharge({ ...charge, amount: e.target.value })} />
              </div>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-ink mb-2">Payment history</h4>
              {s.payments.filter((p) => p.invoiceId === inv.id).map((p) => (
                <div key={p.id} className="flex justify-between items-center py-2 border-b border-line/60 last:border-0 text-sm">
                  <span><span className="mono font-bold">{p.receiptNo}</span> <Badge tone="neutral" className="ml-1">{p.method}</Badge><p className="text-[10px] text-faint">{fmtDate(p.at)} {fmtTime(p.at)}{p.note ? ` · ${p.note}` : ""}</p></span>
                  <span className="mono font-bold text-ok">+{inr(p.amount)}</span>
                </div>
              ))}
              {s.payments.filter((p) => p.invoiceId === inv.id).length === 0 && <p className="text-xs text-soft">No payments yet.</p>}
            </div>
            <button className="btn btn-outline btn-sm w-full no-print" onClick={() => window.print()}><Printer size={14} /> Print invoice</button>
          </div>
        )}
      </Drawer>

      {/* payment modal */}
      <Modal open={pay} onClose={() => setPay(false)} title="Record payment"
        footer={<><button className="btn btn-ghost" onClick={() => setPay(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={!+payF.amount || (inv ? +payF.amount > invBalance(s, inv.id) : true)} onClick={() => {
            if (inv) { a.recordPayment(inv.id, +payF.amount, payF.method, payF.note || undefined); setPay(false); if (+payF.amount >= invBalance(s, inv.id)) setOpenInv(null); }
          }}>Save payment</button></>}>
        {inv && (
          <div className="space-y-4">
            <p className="text-sm text-soft">Balance on <span className="mono font-bold text-ink">{inv.no}</span>: <strong className="mono text-danger">{inr(invBalance(s, inv.id))}</strong></p>
            <Field label="Amount ₹" req><input type="number" className="input mono" value={payF.amount} onChange={(e) => setPayF({ ...payF, amount: e.target.value })} /></Field>
            <Field label="Method" req>
              <div className="grid grid-cols-5 gap-1.5">
                {(["Cash", "UPI", "Card", "Insurance", "Credit"] as PayMethod[]).map((m) => (
                  <button key={m} onClick={() => setPayF({ ...payF, method: m })} className={cx("rounded-lg border py-2 text-xs font-bold transition-all", payF.method === m ? "bg-primary text-white border-primary" : "border-line text-soft hover:border-primary")}>{m}</button>
                ))}
              </div>
            </Field>
            <Field label="Note (optional)"><input className="input" value={payF.note} onChange={(e) => setPayF({ ...payF, note: e.target.value })} placeholder="e.g. partial — balance tomorrow" /></Field>
            <p className="text-[11px] text-faint">Split payments allowed — record multiple payments against one invoice. Receipt number auto-generated.</p>
          </div>
        )}
      </Modal>

      {/* expense modal */}
      <Modal open={exp} onClose={() => setExp(false)} title="Record expense"
        footer={<><button className="btn btn-ghost" onClick={() => setExp(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={!expF.desc || !+expF.amount} onClick={() => { a.addExpense({ cat: expF.cat, desc: expF.desc, amount: +expF.amount }); setExp(false); setExpF({ cat: "Supplies", desc: "", amount: "" }); }}>Save expense</button></>}>
        <div className="space-y-4">
          <Field label="Category" req><select className="select" value={expF.cat} onChange={(e) => setExpF({ ...expF, cat: e.target.value })}>{["Salary", "Electricity", "Supplies", "Maintenance", "Rent", "Ambulance", "Miscellaneous"].map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Description" req><input className="input" value={expF.desc} onChange={(e) => setExpF({ ...expF, desc: e.target.value })} /></Field>
          <Field label="Amount ₹" req><input type="number" className="input mono" value={expF.amount} onChange={(e) => setExpF({ ...expF, amount: e.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  );
}
