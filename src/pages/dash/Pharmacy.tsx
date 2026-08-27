import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Pill, Boxes, ShieldAlert, Truck, Plus, PackagePlus, CheckCheck, Printer } from "lucide-react";
import { useStore, patOf, docOf, lowStockMeds, expiringMeds, medOf } from "../../lib/store";
import { cx, inr, fmtDate, daysUntil, uid, todayISO } from "../../lib/utils";
import { Badge, DataTable, Field, Modal, PageHead, SearchSelect, StatCard, StatusBadge, EmptyState } from "../../components/ui";

const NEXT: Record<string, { label: string; to: string }> = {
  Received: { label: "Start preparing →", to: "Preparing" },
  Preparing: { label: "Mark ready →", to: "Ready" },
  Ready: { label: "Dispense ✓", to: "Dispensed" },
};

export default function Pharmacy() {
  const { s, a } = useStore();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "queue";
  const [stockFor, setStockFor] = useState<string | null>(null);
  const [stockQty, setStockQty] = useState("50");
  const [showNew, setShowNew] = useState(false);
  const [nm, setNm] = useState({ name: "", generic: "", category: "Antibiotic", price: "", mrp: "", stock: "", min: "20", rack: "", batch: "", expiry: todayISO(180) });
  const [showPur, setShowPur] = useState(false);
  const [pur, setPur] = useState({ supplierId: s.suppliers[0]?.id ?? "", invoiceNo: "", medId: "", qty: "", pp: "" });

  const open = s.pharmacyOrders.filter((o) => o.status !== "Dispensed");
  const low = lowStockMeds(s);
  const exp30 = expiringMeds(s, 30), exp60 = expiringMeds(s, 60), exp90 = expiringMeds(s, 90);

  const tabs = [
    { id: "queue", label: "Prescription Queue", icon: Pill, n: open.length },
    { id: "meds", label: "Medicines & Stock", icon: Boxes, n: s.medicines.length },
    { id: "alerts", label: "Stock Alerts", icon: ShieldAlert, n: low.length + exp60.length },
    { id: "purchase", label: "Purchases & Suppliers", icon: Truck, n: s.purchases.length },
  ];

  return (
    <div className="anim-fade-up">
      <PageHead title="Pharmacy" sub="Prescriptions flow straight from the doctor's desk — dispense updates stock and billing automatically."
        actions={<button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}><Plus size={15} /> New medicine</button>} />
      <div className="flex gap-1.5 mb-5 overflow-x-auto no-scrollbar">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setParams({ tab: tb.id })} className={cx("chip !py-2 !px-4 cursor-pointer shrink-0", tab === tb.id && "!bg-primary !text-white !border-primary")}>
            <tb.icon size={13} /> {tb.label} <span className="mono">({tb.n})</span>
          </button>
        ))}
      </div>

      {/* ═══ queue ═══ */}
      {tab === "queue" && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          {s.pharmacyOrders.slice(0, 12).map((o) => {
            const p = patOf(s, o.patientId);
            const steps = ["Received", "Preparing", "Ready", "Dispensed"];
            const idx = steps.indexOf(o.status);
            return (
              <div key={o.id} className={cx("card p-5 flex flex-col", o.status !== "Dispensed" && "border-primary/30")}>
                <div className="flex items-center justify-between">
                  <p className="mono font-extrabold text-ink">{o.no}</p>
                  <StatusBadge status={o.status} />
                </div>
                <p className="text-sm font-bold text-ink mt-2">{p?.name} <span className="mono text-[10px] text-faint font-normal">{p?.uhid}</span></p>
                <p className="text-[11px] text-soft">{docOf(s, o.doctorId)?.name} · {o.at.slice(11, 16)} · Rx {s.prescriptions.find((r) => r.id === o.prescriptionId)?.no}</p>
                <div className="mt-3 space-y-1.5 flex-1">
                  {o.items.map((it, i) => {
                    const m = medOf(s, it.medicineId);
                    const short = m && m.stock < it.qty;
                    return (
                      <p key={i} className="text-xs flex justify-between gap-2 rounded-lg bg-paper px-2.5 py-1.5">
                        <span className={cx("font-semibold", short && o.status !== "Dispensed" ? "text-danger" : "text-ink")}>{it.name} × {it.qty}</span>
                        <span className="text-faint shrink-0">{it.dose} · {it.frequency}{short && o.status !== "Dispensed" ? " · low stock!" : ""}</span>
                      </p>
                    );
                  })}
                </div>
                <p className="text-right text-xs font-bold text-ink mt-3">Value: <span className="mono text-primary">{inr(o.items.reduce((x, i) => x + i.qty * i.price, 0))}</span></p>
                <div className="flex items-center gap-1 mt-3">
                  {steps.map((st, i) => <span key={st} className={cx("h-1.5 flex-1 rounded-full", i <= idx ? "bg-primary" : "bg-line")} />)}
                </div>
                {o.status !== "Dispensed" ? (
                  <button className={cx("btn btn-sm w-full mt-3", o.status === "Ready" ? "btn-primary" : "btn-outline")} onClick={() => a.setPharmacyStatus(o.id, NEXT[o.status].to as any)}>
                    {o.status === "Ready" ? <><CheckCheck size={14} /> {NEXT[o.status].label}</> : NEXT[o.status].label}
                  </button>
                ) : (
                  <p className="text-[11px] text-ok font-bold mt-3 flex items-center gap-1.5"><CheckCheck size={13} /> Dispensed · stock updated · billed to patient</p>
                )}
              </div>
            );
          })}
          {s.pharmacyOrders.length === 0 && <div className="md:col-span-3"><EmptyState title="No prescriptions in queue" sub="When a doctor clicks “Send to Hospital Pharmacy”, the order lands here instantly." icon={Pill} /></div>}
        </div>
      )}

      {/* ═══ medicines ═══ */}
      {tab === "meds" && (
        <div className="card p-4">
          <DataTable
            cols={[
              { key: "name", label: "Medicine", render: (m: any) => <div><p className="font-bold text-ink">{m.name}</p><p className="text-[10px] text-faint">{m.generic} · {m.brand} · {m.category}</p></div> },
              { key: "batch", label: "Batch / Expiry", render: (m: any) => { const d = daysUntil(m.expiry); return <div><p className="mono text-xs">{m.batch}</p><Badge tone={d < 30 ? "danger" : d < 60 ? "warn" : "neutral"} className="mt-0.5">{d < 0 ? "EXPIRED" : `${d}d left`}</Badge></div>; } },
              { key: "price", label: "Price / MRP", right: true, render: (m: any) => <span className="mono text-xs">₹{m.price} <span className="text-faint">/ ₹{m.mrp}</span></span> },
              { key: "stock", label: "Stock", render: (m: any) => <span className={cx("mono font-extrabold text-sm", m.stock === 0 ? "text-danger" : m.stock <= m.min ? "text-warn" : "text-ink")}>{m.stock} <span className="text-[10px] font-normal text-faint">/ min {m.min}</span></span> },
              { key: "rack", label: "Rack", render: (m: any) => <span className="chip">{m.rack}</span> },
              { key: "act", label: "", right: true, render: (m: any) => <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); setStockFor(m.id); setStockQty("50"); }}><PackagePlus size={13} /> Add stock</button> },
            ]}
            rows={s.medicines as any}
            searchable={(m: any) => `${m.name} ${m.generic} ${m.brand} ${m.category} ${m.batch}`}
            pageSize={10}
          />
        </div>
      )}

      {/* ═══ alerts ═══ */}
      {tab === "alerts" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-display font-bold text-ink flex items-center gap-2 mb-3"><ShieldAlert size={16} className="text-warn" /> Low stock — reorder required ({low.length})</h3>
              {low.length === 0 ? <p className="text-sm text-soft">All medicines above minimum levels ✓</p> : low.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-line/60 last:border-0">
                  <div><p className="text-sm font-bold text-ink">{m.name}</p><p className="text-[11px] text-soft">{medOf(s, m.id)?.supplierId && s.suppliers.find((x) => x.id === m.supplierId)?.name} · rack {m.rack}</p></div>
                  <div className="text-right">
                    <p className="mono font-extrabold text-warn">{m.stock} <span className="font-normal text-faint">/ min {m.min}</span></p>
                    <Badge tone={m.stock === 0 ? "danger" : "warn"}>{m.stock === 0 ? "OUT OF STOCK" : "Reorder required"}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="card p-5">
              <h3 className="font-display font-bold text-ink flex items-center gap-2 mb-3"><PackagePlus size={16} className="text-danger" /> Expiry watch</h3>
              {[["Within 30 days", exp30, "danger"], ["Within 60 days", exp60, "warn"], ["Within 90 days", exp90, "info"]].map(([label, list, tone]: any) => (
                <div key={label} className="mb-3">
                  <div className="flex items-center justify-between"><p className="text-xs font-bold text-soft uppercase tracking-wide">{label}</p><Badge tone={tone}>{list.length} medicine(s)</Badge></div>
                  <div className="mt-1.5 space-y-1">{list.slice(0, 3).map((m: any) => <p key={m.id} className="text-xs text-soft">• {m.name} — <span className="mono">{fmtDate(m.expiry)} ({daysUntil(m.expiry)}d)</span> · batch {m.batch}</p>)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ purchases + suppliers ═══ */}
      {tab === "purchase" && (
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-ink">Purchase invoices</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowPur(true)}><Plus size={14} /> New purchase</button>
            </div>
            <div className="space-y-2.5">
              {s.purchases.map((pu) => (
                <div key={pu.id} className="rounded-xl border border-line p-3.5">
                  <div className="flex justify-between items-center"><p className="mono font-bold text-sm text-ink">{pu.no} · {pu.invoiceNo}</p><p className="mono font-bold text-primary">{inr(pu.total)}</p></div>
                  <p className="text-[11px] text-soft mt-0.5">{s.suppliers.find((x) => x.id === pu.supplierId)?.name} · {fmtDate(pu.date)}</p>
                  <p className="text-xs text-soft mt-1.5">{pu.items.map((i) => `${i.name} ×${i.qty}`).join(" · ")}</p>
                  <Badge tone="ok" className="mt-2">Stock updated ✓</Badge>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5 h-fit">
            <h3 className="font-display font-bold text-ink mb-3">Suppliers</h3>
            {s.suppliers.map((sp) => (
              <div key={sp.id} className="py-3 border-b border-line/60 last:border-0">
                <div className="flex justify-between"><p className="text-sm font-bold text-ink">{sp.name}</p>{sp.outstanding > 0 && <Badge tone="warn">Due {inr(sp.outstanding)}</Badge>}</div>
                <p className="text-[11px] text-soft mt-0.5">{sp.rep} · {sp.phone}</p>
                <p className="mono text-[10px] text-faint mt-0.5">GST: {sp.gst ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* modals */}
      <Modal open={!!stockFor} onClose={() => setStockFor(null)} title="Adjust stock"
        footer={<><button className="btn btn-ghost" onClick={() => setStockFor(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { a.addStock(stockFor!, +stockQty || 0); setStockFor(null); }} disabled={!+stockQty}>Add to stock</button></>}>
        <p className="text-sm text-soft mb-4">{medOf(s, stockFor ?? "")?.name} — current stock <strong className="mono text-ink">{medOf(s, stockFor ?? "")?.stock}</strong></p>
        <Field label="Quantity to add" req><input type="number" className="input mono" value={stockQty} onChange={(e) => setStockQty(e.target.value)} /></Field>
      </Modal>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Add medicine to database" wide
        footer={<><button className="btn btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={!nm.name || !nm.price} onClick={() => {
            a.setMedicine({ id: "m-" + uid(), name: nm.name, generic: nm.generic || nm.name, brand: nm.name.split(" ")[0], manufacturer: "—", category: nm.category, batch: nm.batch || "NEW01", expiry: nm.expiry, pp: Math.round(+nm.price * 0.7), price: +nm.price, mrp: +nm.mrp || +nm.price, gst: 12, stock: +nm.stock || 0, min: +nm.min || 20, rack: nm.rack || "A-01", supplierId: s.suppliers[0]?.id ?? "s1" });
            setShowNew(false); setNm({ name: "", generic: "", category: "Antibiotic", price: "", mrp: "", stock: "", min: "20", rack: "", batch: "", expiry: todayISO(180) });
          }}>Save medicine</button></>}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Medicine name + strength" req><input className="input" value={nm.name} onChange={(e) => setNm({ ...nm, name: e.target.value })} placeholder="e.g. Doxycycline 100mg" /></Field>
          <Field label="Generic name"><input className="input" value={nm.generic} onChange={(e) => setNm({ ...nm, generic: e.target.value })} /></Field>
          <Field label="Category"><select className="select" value={nm.category} onChange={(e) => setNm({ ...nm, category: e.target.value })}>{["Antibiotic", "Analgesic", "Antidiabetic", "Antihypertensive", "Gastro", "Respiratory", "Supplement", "Other"].map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Batch no"><input className="input mono" value={nm.batch} onChange={(e) => setNm({ ...nm, batch: e.target.value })} /></Field>
          <Field label="Expiry" req><input type="date" className="input" value={nm.expiry} onChange={(e) => setNm({ ...nm, expiry: e.target.value })} /></Field>
          <Field label="Rack"><input className="input mono" value={nm.rack} onChange={(e) => setNm({ ...nm, rack: e.target.value })} placeholder="A-01" /></Field>
          <Field label="Selling price ₹" req><input type="number" className="input mono" value={nm.price} onChange={(e) => setNm({ ...nm, price: e.target.value })} /></Field>
          <Field label="MRP ₹"><input type="number" className="input mono" value={nm.mrp} onChange={(e) => setNm({ ...nm, mrp: e.target.value })} /></Field>
          <Field label="Opening stock"><input type="number" className="input mono" value={nm.stock} onChange={(e) => setNm({ ...nm, stock: e.target.value })} /></Field>
          <Field label="Minimum stock"><input type="number" className="input mono" value={nm.min} onChange={(e) => setNm({ ...nm, min: e.target.value })} /></Field>
        </div>
      </Modal>

      <Modal open={showPur} onClose={() => setShowPur(false)} title="Record purchase invoice"
        footer={<><button className="btn btn-ghost" onClick={() => setShowPur(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={!pur.invoiceNo || !pur.medId || !+pur.qty || !+pur.pp} onClick={() => {
            a.addPurchase({ supplierId: pur.supplierId, invoiceNo: pur.invoiceNo, items: [{ medicineId: pur.medId, qty: +pur.qty, pp: +pur.pp }] });
            setShowPur(false); setPur({ supplierId: s.suppliers[0]?.id ?? "", invoiceNo: "", medId: "", qty: "", pp: "" });
          }}>Save — update stock</button></>}>
        <div className="space-y-4">
          <Field label="Supplier" req><SearchSelect options={s.suppliers.map((x) => ({ id: x.id, label: x.name }))} value={pur.supplierId} onChange={(id) => setPur({ ...pur, supplierId: id })} /></Field>
          <Field label="Invoice number" req><input className="input mono" value={pur.invoiceNo} onChange={(e) => setPur({ ...pur, invoiceNo: e.target.value })} placeholder="SP/8813" /></Field>
          <Field label="Medicine" req><SearchSelect placeholder="Select medicine…" options={s.medicines.map((m) => ({ id: m.id, label: m.name, sub: `stock ${m.stock}` }))} value={pur.medId} onChange={(id) => setPur({ ...pur, medId: id })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantity" req><input type="number" className="input mono" value={pur.qty} onChange={(e) => setPur({ ...pur, qty: e.target.value })} /></Field>
            <Field label="Purchase price ₹" req><input type="number" className="input mono" value={pur.pp} onChange={(e) => setPur({ ...pur, pp: e.target.value })} /></Field>
          </div>
          {+pur.qty > 0 && +pur.pp > 0 && <p className="rounded-lg bg-tint text-primary text-sm font-bold px-3.5 py-2.5">Invoice total: {inr(+pur.qty * +pur.pp)} — stock will increase on save</p>}
        </div>
      </Modal>
    </div>
  );
}
