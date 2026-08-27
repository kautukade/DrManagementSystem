import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AppState, Role, RxItem, PayMethod, ChargeCat, CurrentUser } from "./types";
import { seedState } from "./data";
import { nowISO, todayISO, uid, fmtTime } from "./utils";

const LS_KEY = "h360os-v3";

/* ───────────── selectors / derived helpers ───────────── */
export const docOf = (s: AppState, id?: string) => s.doctors.find((d) => d.id === id);
export const patOf = (s: AppState, id?: string) => s.patients.find((p) => p.id === id);
export const deptOf = (s: AppState, id?: string) => s.departments.find((d) => d.id === id);
export const bedOf = (s: AppState, id?: string) => s.beds.find((b) => b.id === id);
export const medOf = (s: AppState, id?: string) => s.medicines.find((m) => m.id === id);
export const invOf = (s: AppState, id?: string) => s.invoices.find((i) => i.id === id);

export const invTotal = (s: AppState, invId: string) => invOf(s, invId)?.items.reduce((a, i) => a + i.amount, 0) ?? 0;
export const invPaid = (s: AppState, invId: string) => s.payments.filter((p) => p.invoiceId === invId).reduce((a, p) => a + p.amount, 0);
export const invBalance = (s: AppState, invId: string) => Math.max(0, invTotal(s, invId) - invPaid(s, invId));

export const isToday = (iso: string) => (iso ?? "").slice(0, 10) === todayISO();
export const todayRevenue = (s: AppState) => s.payments.filter((p) => isToday(p.at)).reduce((a, p) => a + p.amount, 0);
export const todayPharmacySales = (s: AppState) =>
  s.payments.filter((p) => isToday(p.at)).length >= 0
    ? s.invoices.flatMap((i) => i.items.filter((it) => it.cat === "Pharmacy" && isToday(it.at))).reduce((a, i) => a + i.amount, 0)
    : 0;

export const lowStockMeds = (s: AppState) => s.medicines.filter((m) => m.stock <= m.min);
export const expiringMeds = (s: AppState, withinDays: number) => {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() + withinDays);
  return s.medicines.filter((m) => new Date(m.expiry) <= cutoff);
};
export const bedStats = (s: AppState) => {
  const occ = s.beds.filter((b) => b.status === "Occupied").length;
  return { total: s.beds.length, occupied: occ, available: s.beds.filter((b) => b.status === "Available").length, pct: Math.round((occ / s.beds.length) * 100) };
};
export const unreadCount = (s: AppState) => s.notices.filter((n) => !n.read).length;

export const ROLE_META: Record<Role, { label: string; home: string }> = {
  owner: { label: "Hospital Owner", home: "/app/owner" },
  admin: { label: "Administrator", home: "/app/owner" },
  receptionist: { label: "Receptionist", home: "/app/reception" },
  doctor: { label: "Doctor", home: "/app/doctor" },
  nurse: { label: "Nurse", home: "/app/nursing" },
  pharmacist: { label: "Pharmacist", home: "/app/pharmacy" },
  lab: { label: "Lab Technician", home: "/app/lab" },
  radiology: { label: "Radiology Tech", home: "/app/radiology" },
  accountant: { label: "Accountant", home: "/app/billing" },
  hr: { label: "HR Manager", home: "/app/staff" },
  patient: { label: "Patient", home: "/portal" },
};

/* ───────────── context ───────────── */
export interface Toast { id: string; msg: string; kind: "ok" | "err" | "info"; }

interface StoreCtx {
  s: AppState;
  a: ReturnType<typeof buildActions>;
  toasts: Toast[];
  toast: (msg: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: string) => void;
  reset: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function useStore(): StoreCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside provider");
  return v;
}

function loadInitial(): AppState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.v === 3) return parsed as AppState;
    }
  } catch { /* fresh seed */ }
  return seedState();
}

function buildActions(get: () => AppState, mutate: (fn: (d: AppState) => void) => void, toast: (m: string, k?: Toast["kind"]) => void) {
  const audit = (d: AppState, action: string, module: string, record: string) => {
    d.audit.unshift({ id: uid(), user: d.user?.name ?? "System", role: ROLE_META[d.user?.role ?? "admin"].label, action, module, record, at: nowISO() });
    d.audit = d.audit.slice(0, 120);
  };
  const notice = (d: AppState, kind: AppState["notices"][number]["kind"], title: string, body: string) => {
    d.notices.unshift({ id: uid(), kind, title, body, at: nowISO(), read: false });
    d.notices = d.notices.slice(0, 40);
  };
  const ensureInvoice = (d: AppState, patientId: string): string => {
    const open = d.invoices.find((i) => i.patientId === patientId && i.status !== "Paid" && isToday(i.createdAt));
    if (open) return open.id;
    d.invSeq += 1;
    const id = "inv-" + uid();
    d.invoices.unshift({ id, no: `INV-2026-${String(d.invSeq).padStart(4, "0")}`, patientId, items: [], status: "Unpaid", createdAt: nowISO(), dueDate: todayISO() });
    return id;
  };
  const addCharge = (d: AppState, patientId: string, desc: string, cat: ChargeCat, amount: number) => {
    const invId = ensureInvoice(d, patientId);
    const inv = d.invoices.find((i) => i.id === invId)!;
    inv.items.push({ id: uid(), desc, cat, amount, at: nowISO() });
    if (inv.status === "Paid") inv.status = "Unpaid";
    return invId;
  };

  return {
    /* ── auth ── */
    login(role: Role, name?: string) {
      const s = get();
      const persona: Record<string, CurrentUser> = {
        owner: { role: "owner", name: "Rajendra Aarogyam", id: "e13" },
        admin: { role: "admin", name: "Mangesh Aher", id: "e13" },
        receptionist: { role: "receptionist", name: "Sagar Kale", id: "e4" },
        doctor: { role: "doctor", name: s.doctors[0].name, id: s.doctors[0].id },
        nurse: { role: "nurse", name: "Anita Wankhede", id: "e3" },
        pharmacist: { role: "pharmacist", name: "Pooja Shinde", id: "e5" },
        lab: { role: "lab", name: "Ramesh Gavit", id: "e6" },
        radiology: { role: "radiology", name: "Kiran Pawar", id: "e7" },
        accountant: { role: "accountant", name: "Sneha Kulkarni", id: "e8" },
        hr: { role: "hr", name: "Vikas More", id: "e9" },
        patient: { role: "patient", name: "Rohan Deshmukh", id: "p1" },
      };
      const u = persona[role];
      mutate((d) => { d.user = { ...u, name: name ?? u.name }; });
      toast(`Signed in as ${u.name} · ${ROLE_META[role].label}`, "ok");
      return u;
    },
    logout() { mutate((d) => { d.user = null; }); },

    /* ── patients ── */
    registerPatient(data: Omit<AppState["patients"][number], "id" | "uhid" | "createdAt">): { id: string; uhid: string } | { error: string } {
      const s = get();
      if (!data.name.trim()) return { error: "Patient name is required" };
      if (!/^[6-9]\d{9}$/.test(data.mobile.replace(/\s/g, ""))) return { error: "Enter a valid 10-digit mobile number" };
      const dup = s.patients.find((p) => p.mobile === data.mobile);
      if (dup) return { error: `A patient with this mobile already exists — ${dup.name} (${dup.uhid}). Open their profile instead.` };
      const id = "p-" + uid();
      const uhid = `PT-2026-${String(Math.floor(Math.random() * 900) + 1253)}`;
      mutate((d) => {
        d.patients.unshift({ ...data, id, uhid, createdAt: nowISO() });
        audit(d, `Registered new patient ${uhid}`, "Patients", data.name);
        notice(d, "appointment", "New patient registered", `${data.name} · ${uhid}`);
      });
      return { id, uhid };
    },

    /* ── appointments & tokens ── */
    bookAppointment(x: { patientId: string; doctorId: string; date: string; slot: string; reason: string; type?: "Online" | "Walk-in" | "Follow-up" }): { id: string; no: string } | { error: string } {
      const s = get();
      const clash = s.appointments.find((a) => a.doctorId === x.doctorId && a.date === x.date && a.slot === x.slot && a.status !== "Cancelled");
      if (clash) return { error: "That slot was just taken. Please pick another time." };
      const doctor = docOf(s, x.doctorId)!;
      const id = "a-" + uid();
      const no = `A-${(s.apptSeq + 1)}`;
      mutate((d) => {
        d.apptSeq += 1;
        d.appointments.unshift({ id, no, patientId: x.patientId, doctorId: x.doctorId, deptId: doctor.deptId, date: x.date, slot: x.slot, reason: x.reason, status: "Booked", type: x.type ?? "Online", fee: doctor.fee, createdAt: nowISO() });
        audit(d, `Booked appointment ${no}`, "Appointments", `${patOf(d, x.patientId)?.name} → ${doctor.name}`);
        notice(d, "appointment", "New appointment booked", `${patOf(d, x.patientId)?.name} · ${doctor.name} · ${x.slot}`);
      });
      return { id, no };
    },

    checkIn(apptId: string): number | null {
      const s = get();
      const ap = s.appointments.find((a) => a.id === apptId);
      if (!ap) return null;
      const token = s.tokenSeq + 1;
      mutate((d) => {
        const a2 = d.appointments.find((a) => a.id === apptId)!;
        if (a2.token) { a2.status = "Waiting"; return; }
        d.tokenSeq += 1;
        a2.token = d.tokenSeq;
        a2.status = "Waiting";
        a2.type = a2.type;
        audit(d, `Checked in ${a2.no} (Token ${d.tokenSeq})`, "Appointments", `${patOf(d, a2.patientId)?.name} → ${docOf(d, a2.doctorId)?.name}`);
      });
      toast(ap.token ? `${ap.no} moved to waiting queue` : `Token ${token} issued for ${patOf(s, ap.patientId)?.name}`, "ok");
      return token;
    },

    walkIn(x: { patientId: string; doctorId: string; reason: string }): number {
      const s = get();
      const doctor = docOf(s, x.doctorId)!;
      const id = "a-" + uid();
      const no = `A-${s.apptSeq + 1}`;
      const token = s.tokenSeq + 1;
      mutate((d) => {
        d.apptSeq += 1;
        d.tokenSeq += 1;
        d.appointments.unshift({ id, no, patientId: x.patientId, doctorId: x.doctorId, deptId: doctor.deptId, date: todayISO(), slot: fmtTime(nowISO()), reason: x.reason, status: "Waiting", token: d.tokenSeq, type: "Walk-in", fee: doctor.fee, createdAt: nowISO() });
        audit(d, `Walk-in registered ${no} (Token ${d.tokenSeq})`, "Appointments", `${patOf(d, x.patientId)?.name} → ${doctor.name}`);
        notice(d, "appointment", "Walk-in patient", `${patOf(d, x.patientId)?.name} · Token ${d.tokenSeq}`);
      });
      toast(`Walk-in checked in — Token ${token}`, "ok");
      return token;
    },

    setApptStatus(apptId: string, status: AppState["appointments"][number]["status"]) {
      mutate((d) => {
        const a = d.appointments.find((x) => x.id === apptId);
        if (!a) return;
        a.status = status;
        audit(d, `Appointment ${a.no} → ${status}`, "Appointments", `${patOf(d, a.patientId)?.name}`);
      });
    },

    /* ── clinical ── */
    saveVitals(v: Omit<AppState["vitals"][number], "id">) {
      mutate((d) => {
        d.vitals.unshift({ ...v, id: uid() });
        audit(d, "Vitals recorded", "Nursing", patOf(d, v.patientId)?.name ?? "");
      });
      toast("Vitals saved", "ok");
    },

    completeConsultation(apptId: string, x: {
      complaint: string; symptoms: string; history: string; examination: string; diagnosis: string;
      advice: string; followUp?: string; internalNotes?: string;
      rxItems: RxItem[]; labs: string[];
    }): { rxId: string | null } {
      const s = get();
      const ap = s.appointments.find((a) => a.id === apptId)!;
      const doctor = docOf(s, ap.doctorId)!;
      const consId = "c-" + uid();
      const rxId = x.rxItems.length ? "rx-" + uid() : null;
      const rxNo = `RX-2026-${String(s.rxSeq + 1).padStart(4, "0")}`;
      mutate((d) => {
        const a = d.appointments.find((q) => q.id === apptId)!;
        a.status = "Completed";
        d.consultations.unshift({ id: consId, appointmentId: apptId, patientId: a.patientId, doctorId: a.doctorId, at: nowISO(), complaint: x.complaint, symptoms: x.symptoms, history: x.history, examination: x.examination, diagnosis: x.diagnosis, advice: x.advice, followUp: x.followUp, internalNotes: x.internalNotes });
        if (rxId) {
          d.rxSeq += 1;
          d.prescriptions.unshift({ id: rxId, no: rxNo, patientId: a.patientId, doctorId: a.doctorId, consultationId: consId, at: nowISO(), items: x.rxItems, advice: x.advice, followUp: x.followUp, status: "Active" });
        }
        x.labs.forEach((test) => {
          d.labOrders.unshift({ id: "lab-" + uid(), no: `LAB-0${Math.floor(Math.random() * 900) + 774}`, patientId: a.patientId, doctorId: a.doctorId, test, at: nowISO(), status: "Pending", priority: "Routine" });
        });
        if (doctor.fee > 0) addCharge(d, a.patientId, `Consultation — ${doctor.name}`, "Consultation", doctor.fee);
        audit(d, `Consultation completed${rxId ? ` · ${rxNo}` : ""}`, "OPD", `${patOf(d, a.patientId)?.name} · ${x.diagnosis}`);
        if (rxId) notice(d, "pharmacy", "Prescription ready", `${rxNo} · ${patOf(d, a.patientId)?.name} · ${x.rxItems.length} medicine(s)`);
        if (x.labs.length) notice(d, "lab", "Lab tests ordered", `${x.labs.join(", ")} · ${patOf(d, a.patientId)?.name}`);
      });
      toast(`Consultation saved${rxId ? ` · ${rxNo}` : ""}`, "ok");
      return { rxId };
    },

    sendToPharmacy(rxId: string): boolean {
      const s = get();
      const rx = s.prescriptions.find((r) => r.id === rxId);
      if (!rx) return false;
      if (s.pharmacyOrders.some((o) => o.prescriptionId === rxId && o.status !== "Dispensed")) {
        toast("Already in the pharmacy queue", "info");
        return false;
      }
      const no = `PH-${1024 + s.pharmacyOrders.length}`;
      mutate((d) => {
        d.pharmacyOrders.unshift({ id: "po-" + uid(), no, prescriptionId: rxId, patientId: rx.patientId, doctorId: rx.doctorId, at: nowISO(), items: rx.items, status: "Received", billAdded: false });
        audit(d, `Sent ${rx.no} to pharmacy (${no})`, "Pharmacy", patOf(d, rx.patientId)?.name ?? "");
        notice(d, "pharmacy", "New pharmacy order", `${no} · ${patOf(d, rx.patientId)?.name} · ${rx.items.length} items`);
      });
      toast(`${rx.no} sent to hospital pharmacy ✓`, "ok");
      return true;
    },

    setPharmacyStatus(orderId: string, status: AppState["pharmacyOrders"][number]["status"]): boolean {
      const s = get();
      const order = s.pharmacyOrders.find((o) => o.id === orderId);
      if (!order) return false;
      if (status === "Dispensed") {
        for (const it of order.items) {
          const m = medOf(s, it.medicineId);
          if (!m || m.stock < it.qty) { toast(`Out of stock: ${it.name} (need ${it.qty}, have ${m?.stock ?? 0})`, "err"); return false; }
        }
      }
      mutate((d) => {
        const o = d.pharmacyOrders.find((q) => q.id === orderId)!;
        o.status = status;
        if (status === "Dispensed") {
          o.items.forEach((it) => {
            const m = d.medicines.find((mm) => mm.id === it.medicineId);
            if (m) m.stock = Math.max(0, m.stock - it.qty);
          });
          if (!o.billAdded) {
            const rx = d.prescriptions.find((r) => r.id === o.prescriptionId);
            const amount = o.items.reduce((a, i) => a + i.qty * i.price, 0);
            addCharge(d, o.patientId, `Pharmacy — ${rx?.no ?? o.no} (${o.items.length} items)`, "Pharmacy", amount);
            o.billAdded = true;
          }
          const rx = d.prescriptions.find((r) => r.id === o.prescriptionId);
          if (rx) rx.status = "Dispensed";
          audit(d, `Dispensed ${o.no} — stock updated`, "Pharmacy", `${patOf(d, o.patientId)?.name} · ${o.items.length} items`);
          notice(d, "billing", "Pharmacy bill added", `${o.no} added to ${patOf(d, o.patientId)?.name}'s invoice`);
        } else {
          audit(d, `Pharmacy order ${o.no} → ${status}`, "Pharmacy", patOf(d, o.patientId)?.name ?? "");
        }
      });
      if (status === "Dispensed") toast("Medicines dispensed — stock auto-updated & billed ✓", "ok");
      return true;
    },

    addStock(medId: string, qty: number) {
      mutate((d) => {
        const m = d.medicines.find((x) => x.id === medId);
        if (m) { m.stock += qty; audit(d, `Stock adjusted +${qty} — ${m.name}`, "Inventory", `${m.name} → ${m.stock}`); }
      });
      toast("Stock updated", "ok");
    },

    addPurchase(x: { supplierId: string; invoiceNo: string; items: { medicineId: string; qty: number; pp: number }[] }) {
      const s = get();
      const no = `PUR-${2202 + s.purchases.length + 1}`;
      mutate((d) => {
        const items = x.items.map((it) => {
          const m = d.medicines.find((mm) => mm.id === it.medicineId)!;
          m.stock += it.qty;
          return { medicineId: it.medicineId, name: m.name, batch: m.batch, expiry: m.expiry, qty: it.qty, pp: it.pp };
        });
        const total = items.reduce((a, i) => a + i.qty * i.pp, 0);
        d.purchases.unshift({ id: uid(), no, supplierId: x.supplierId, invoiceNo: x.invoiceNo, date: todayISO(), items, total });
        const sup = d.suppliers.find((sp) => sp.id === x.supplierId);
        if (sup) sup.outstanding += total;
        audit(d, `Purchase ${no} received — stock updated`, "Purchases", `${sup?.name} · ₹${total.toLocaleString("en-IN")}`);
        notice(d, "stock", "Stock received", `${no} · ${items.length} items · ${sup?.name}`);
      });
      toast(`Purchase recorded — stock increased (${no})`, "ok");
    },

    /* ── billing ── */
    newInvoice(patientId: string): string {
      let id = "";
      mutate((d) => { id = ensureInvoice(d, patientId); });
      return id;
    },
    addChargeTo(invoiceId: string, desc: string, cat: ChargeCat, amount: number) {
      mutate((d) => {
        const inv = d.invoices.find((i) => i.id === invoiceId);
        if (!inv) return;
        inv.items.push({ id: uid(), desc, cat, amount, at: nowISO() });
        if (inv.status === "Paid") inv.status = "Unpaid";
        audit(d, `Charge added to ${inv.no} — ${desc}`, "Billing", `₹${amount.toLocaleString("en-IN")}`);
      });
      toast("Charge added to invoice", "ok");
    },
    recordPayment(invoiceId: string, amount: number, method: PayMethod, note?: string): string {
      const s = get();
      const receiptNo = `RCP-${5123 + s.payments.length + 1}`;
      mutate((d) => {
        const inv = d.invoices.find((i) => i.id === invoiceId)!;
        d.payments.unshift({ id: uid(), receiptNo, invoiceId, patientId: inv.patientId, amount, method, at: nowISO(), note });
        const paid = d.payments.filter((p) => p.invoiceId === invoiceId).reduce((a, p) => a + p.amount, 0);
        const total = inv.items.reduce((a, i) => a + i.amount, 0);
        inv.status = paid >= total ? "Paid" : "Partial";
        audit(d, `Payment ${receiptNo} ₹${amount.toLocaleString("en-IN")} (${method})`, "Billing", `${inv.no} · ${patOf(d, inv.patientId)?.name}`);
        notice(d, "billing", `Payment received — ${method}`, `${receiptNo} · ₹${amount.toLocaleString("en-IN")} · ${patOf(d, inv.patientId)?.name}`);
      });
      toast(`Payment of ₹${amount.toLocaleString("en-IN")} recorded (${method})`, "ok");
      return receiptNo;
    },

    /* ── IPD ── */
    admit(x: { patientId: string; doctorId: string; bedId: string; diagnosis: string; attendant: string; attendantPhone: string; deposit: number; insurance?: string; notes?: string }): { error?: string } {
      const s = get();
      const bed = bedOf(s, x.bedId);
      if (!bed || bed.status !== "Available") return { error: "Selected bed is not available" };
      const no = `IPD-0${414 + s.admissions.length + 1}`;
      mutate((d) => {
        const b = d.beds.find((bb) => bb.id === x.bedId)!;
        b.status = "Occupied"; b.patientId = x.patientId;
        d.admissions.unshift({ id: "adm-" + uid(), no, patientId: x.patientId, doctorId: x.doctorId, at: nowISO(), diagnosis: x.diagnosis, ward: bed.ward, bedId: bed.id, attendant: x.attendant, attendantPhone: x.attendantPhone, deposit: x.deposit, insurance: x.insurance ?? "Self-pay", status: "Admitted", notes: x.notes });
        audit(d, `Admitted ${no} — bed ${bed.label}`, "IPD", `${patOf(d, x.patientId)?.name} · ${bed.ward}`);
        notice(d, "bed", `Bed ${bed.label} occupied`, `${patOf(d, x.patientId)?.name} admitted · ${x.diagnosis}`);
      });
      toast(`Patient admitted — ${bed.ward} · Bed ${bed.label}`, "ok");
      return {};
    },
    discharge(admissionId: string) {
      const s = get();
      const adm = s.admissions.find((a) => a.id === admissionId);
      if (!adm) return;
      const bed = bedOf(s, adm.bedId);
      const days = Math.max(1, Math.round((Date.now() - new Date(adm.at).getTime()) / 86400e3));
      mutate((d) => {
        const a = d.admissions.find((q) => q.id === admissionId)!;
        a.status = "Discharged"; a.dischargeAt = nowISO();
        const b = d.beds.find((bb) => bb.id === a.bedId);
        if (b) { b.status = "Cleaning"; b.patientId = undefined; }
        if (b) addCharge(d, a.patientId, `Bed charges — ${b.ward} (${b.label}) × ${days} day(s)`, "Bed", b.rate * days);
        addCharge(d, a.patientId, `Nursing care × ${days} day(s)`, "Nursing", 300 * days);
        audit(d, `Discharged ${a.no} — final bill generated`, "IPD", `${patOf(d, a.patientId)?.name} · ${days} day(s)`);
        notice(d, "bed", `Bed ${b?.label} released for cleaning`, `${patOf(d, a.patientId)?.name} discharged`);
      });
      toast(`Discharged — ${days} day(s) of bed & nursing charges billed`, "ok");
    },
    setBedStatus(bedId: string, status: AppState["beds"][number]["status"]) {
      mutate((d) => {
        const b = d.beds.find((x) => x.id === bedId);
        if (b) { b.status = status; if (status !== "Occupied") b.patientId = undefined; }
      });
    },

    /* ── diagnostics ── */
    orderLab(patientId: string, doctorId: string, tests: string[]) {
      mutate((d) => {
        tests.forEach((test) => d.labOrders.unshift({ id: "lab-" + uid(), no: `LAB-0${Math.floor(Math.random() * 900) + 774}`, patientId, doctorId, test, at: nowISO(), status: "Pending", priority: "Routine" }));
        addCharge(d, patientId, tests.join(" + "), "Lab", tests.length * 650);
        notice(d, "lab", "Lab tests ordered", `${tests.join(", ")} · ${patOf(d, patientId)?.name}`);
        audit(d, `Ordered: ${tests.join(", ")}`, "Lab", patOf(d, patientId)?.name ?? "");
      });
      toast("Lab order sent & billed", "ok");
    },
    setLabStatus(orderId: string, status: AppState["labOrders"][number]["status"]) {
      mutate((d) => {
        const o = d.labOrders.find((x) => x.id === orderId);
        if (o) o.status = status;
      });
    },
    saveLabResult(orderId: string, results: Record<string, string>) {
      mutate((d) => {
        const o = d.labOrders.find((x) => x.id === orderId);
        if (!o) return;
        o.results = results; o.status = "Completed"; o.reportedAt = nowISO();
        audit(d, `Results entered for ${o.no}`, "Lab", `${o.test} · ${patOf(d, o.patientId)?.name}`);
        notice(d, "lab", "Lab report ready", `${o.test} · ${patOf(d, o.patientId)?.name} → sent to ${docOf(d, o.doctorId)?.name}`);
      });
      toast("Report completed — doctor notified", "ok");
    },
    orderRadiology(patientId: string, doctorId: string, modality: string, study: string) {
      mutate((d) => {
        d.radiologyOrders.unshift({ id: "rad-" + uid(), no: `RAD-0${343 + d.radiologyOrders.length + 1}`, patientId, doctorId, modality, study, at: nowISO(), status: "Requested" });
        addCharge(d, patientId, `${modality} — ${study}`, "Radiology", modality === "X-Ray" ? 700 : modality === "Ultrasound" ? 1200 : 3500);
        notice(d, "lab", "Radiology request", `${modality} · ${study} · ${patOf(d, patientId)?.name}`);
        audit(d, `Ordered ${modality} — ${study}`, "Radiology", patOf(d, patientId)?.name ?? "");
      });
      toast("Radiology request sent & billed", "ok");
    },
    setRadStatus(orderId: string, status: AppState["radiologyOrders"][number]["status"], report?: string) {
      mutate((d) => {
        const o = d.radiologyOrders.find((x) => x.id === orderId);
        if (!o) return;
        o.status = status;
        if (report) o.report = report;
        if (status === "Report Ready") {
          audit(d, `Report ready for ${o.no}`, "Radiology", `${o.study} · ${patOf(d, o.patientId)?.name}`);
          notice(d, "lab", "Radiology report ready", `${o.study} · ${patOf(d, o.patientId)?.name}`);
        }
      });
      if (status === "Report Ready") toast("Report published — doctor notified", "ok");
    },

    /* ── nursing ── */
    setMedTask(id: string, status: AppState["medTasks"][number]["status"]) {
      mutate((d) => {
        const t = d.medTasks.find((x) => x.id === id);
        if (t) { t.status = status; if (status === "Administered") audit(d, `Medication administered — ${t.medicine}`, "Nursing", patOf(d, t.patientId)?.name ?? ""); }
      });
      if (status === "Administered") toast("Medication recorded", "ok");
    },
    addNursingNote(patientId: string, text: string) {
      mutate((d) => {
        d.nursingNotes.unshift({ id: uid(), patientId, by: d.user?.name ?? "Nurse", at: nowISO(), text });
      });
      toast("Nursing note added", "ok");
    },

    /* ── HR ── */
    clockToggle(empId: string) {
      mutate((d) => {
        const e = d.staff.find((x) => x.id === empId);
        if (!e) return;
        const rec = d.attendance.find((r) => r.empId === empId && r.date === todayISO());
        const now = new Date();
        const hm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        if (!rec) {
          const late = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);
          d.attendance.unshift({ id: uid(), empId, date: todayISO(), status: late ? "Late" : "Present", clockIn: hm });
          audit(d, `Clock-in ${hm}`, "Attendance", e.name);
        } else if (!rec.clockOut) {
          rec.clockOut = hm;
          audit(d, `Clock-out ${hm}`, "Attendance", e.name);
        }
        e.clockedIn = !rec ? true : !e.clockedIn;
      });
    },
    applyLeave(x: { empId: string; from: string; to: string; reason: string }) {
      mutate((d) => {
        d.leaves.unshift({ id: uid(), ...x, status: "Pending" });
        notice(d, "hr", "Leave request", `${d.staff.find((e) => e.id === x.empId)?.name} · ${x.from} → ${x.to}`);
        audit(d, "Applied for leave", "HR", `${x.from} → ${x.to}`);
      });
      toast("Leave request submitted", "ok");
    },
    decideLeave(id: string, status: "Approved" | "Rejected") {
      mutate((d) => {
        const l = d.leaves.find((x) => x.id === id);
        if (l) { l.status = status; audit(d, `Leave ${status.toLowerCase()}`, "HR", d.staff.find((e) => e.id === l.empId)?.name ?? ""); }
      });
      toast(`Leave ${status.toLowerCase()}`, status === "Approved" ? "ok" : "info");
    },
    saveEmployee(e: AppState["staff"][number]) {
      mutate((d) => {
        const i = d.staff.findIndex((x) => x.id === e.id);
        if (i >= 0) { d.staff[i] = e; audit(d, `Updated staff ${e.empId}`, "HR", e.name); }
        else { d.staff.unshift(e); audit(d, `Added staff ${e.empId}`, "HR", e.name); }
      });
      toast("Staff record saved", "ok");
    },
    addExpense(x: { cat: string; desc: string; amount: number }) {
      mutate((d) => {
        d.expenses.unshift({ id: uid(), ...x, date: todayISO(), paid: false });
        audit(d, `Expense recorded — ${x.cat}`, "Accounts", `₹${x.amount.toLocaleString("en-IN")}`);
      });
      toast("Expense recorded", "ok");
    },

    /* ── masters / settings ── */
    saveDoctor(doc: AppState["doctors"][number]) {
      mutate((d) => {
        const i = d.doctors.findIndex((x) => x.id === doc.id);
        if (i >= 0) { d.doctors[i] = doc; audit(d, `Updated doctor ${doc.name}`, "Settings", doc.name); }
        else { d.doctors.unshift(doc); audit(d, `Added doctor ${doc.name}`, "Settings", doc.name); notice(d, "hr", "New doctor onboarded", `${doc.name} · ${doc.specialty}`); }
      });
      toast("Doctor saved", "ok");
    },
    removeDoctor(id: string) {
      mutate((d) => {
        const doc = d.doctors.find((x) => x.id === id);
        d.doctors = d.doctors.filter((x) => x.id !== id);
        audit(d, `Removed doctor ${doc?.name}`, "Settings", doc?.name ?? "");
      });
      toast("Doctor removed", "info");
    },
    saveDepartment(dep: AppState["departments"][number]) {
      mutate((d) => {
        const i = d.departments.findIndex((x) => x.id === dep.id);
        if (i >= 0) d.departments[i] = dep;
        else { d.departments.push(dep); audit(d, `Added department ${dep.name}`, "Settings", dep.name); }
      });
      toast("Department saved", "ok");
    },
    removeDepartment(id: string) {
      mutate((d) => { d.departments = d.departments.filter((x) => x.id !== id); });
    },
    saveSettings(patch: Partial<AppState["settings"]>) {
      mutate((d) => { d.settings = { ...d.settings, ...patch }; audit(d, "Hospital settings updated", "Settings", Object.keys(patch).join(", ")); });
      toast("Settings saved", "ok");
    },

    /* ── misc ── */
    markNoticesRead() { mutate((d) => { d.notices.forEach((n) => { n.read = true; }); }); },
    addFeedback(f: Omit<AppState["feedback"][number], "id" | "at">) {
      mutate((d) => { d.feedback.unshift({ ...f, id: uid(), at: nowISO() }); });
      toast("Thank you for your feedback!", "ok");
    },
    setMedicine(m: AppState["medicines"][number]) {
      mutate((d) => {
        const i = d.medicines.findIndex((x) => x.id === m.id);
        if (i >= 0) d.medicines[i] = m; else d.medicines.unshift(m);
      });
      toast("Medicine saved", "ok");
    },
    setInventoryQty(id: string, qty: number) {
      mutate((d) => { const it = d.inventory.find((x) => x.id === id); if (it) it.qty = qty; });
    },
    addSurgery(sur: AppState["surgeries"][number]) {
      mutate((d) => { d.surgeries.unshift(sur); audit(d, `Surgery scheduled — ${sur.procedure}`, "OT", patOf(d, sur.patientId)?.name ?? ""); });
      toast("Surgery scheduled", "ok");
    },
  };
}

/* ───────────── provider ───────────── */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<AppState>(loadInitial);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const ref = useRef(s);
  ref.current = s;

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch { /* storage full */ }
  }, [s]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", s.settings.primaryColor);
    root.style.setProperty("--primary-deep", `color-mix(in srgb, ${s.settings.primaryColor} 74%, #03211b)`);
  }, [s.settings.primaryColor]);

  const toast = (msg: string, kind: Toast["kind"] = "info") => {
    const id = uid();
    setToasts((t) => [...t, { id, msg, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  };
  const dismissToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  const mutate = (fn: (d: AppState) => void) => {
    setS((prev) => {
      const draft = structuredClone(prev);
      fn(draft);
      return draft;
    });
  };

  const a = useMemo(() => buildActions(() => ref.current, mutate, toast), []);
  const reset = () => {
    localStorage.removeItem(LS_KEY);
    setS(seedState());
    toast("Demo data reset to factory state", "info");
  };

  return <Ctx.Provider value={{ s, a, toasts, toast, dismissToast, reset }}>{children}</Ctx.Provider>;
}
