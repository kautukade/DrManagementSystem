import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, MessageCircle, ShieldCheck, UserRound } from "lucide-react";
import { useStore } from "../../lib/store";
import { HERO_IMG } from "../../lib/data";
import { cx, fmtDateShort, todayISO, SLOT_TIMES, validPhone, WA_LINK } from "../../lib/utils";
import { Avatar, Badge, DIcon, Field } from "../../components/ui";

const STEPS = ["Department", "Doctor", "Date & Slot", "Patient Details", "Confirm"];

export default function BookAppointment() {
  const { s, a, toast } = useStore();
  const { doctorId } = useParams();
  const [step, setStep] = useState(doctorId ? 2 : 0);
  const [dept, setDept] = useState<string>(doctorId ? s.doctors.find((d) => d.id === doctorId)?.deptId ?? "" : "");
  const [docId, setDocId] = useState(doctorId ?? "");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [mode, setMode] = useState<"find" | "new">("find");
  const [mobile, setMobile] = useState("");
  const [foundId, setFoundId] = useState("");
  const [np, setNp] = useState({ name: "", dob: "", gender: "Male" as "Male" | "Female" | "Other", address: "" });
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ id: string; no: string } | null>(null);

  const doctor = s.doctors.find((d) => d.id === docId);
  const deptDoc = s.departments.find((d) => d.id === dept);
  const dates = useMemo(() => {
    if (!doctor) return [];
    const map: Record<string, string> = { Sun: "Sun", Mon: "Mon", Tue: "Tue", Wed: "Wed", Thu: "Thu", Fri: "Fri", Sat: "Sat" };
    const out: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      const wd = map[d.toLocaleDateString("en-US", { weekday: "short" })];
      if (doctor.days.includes(wd)) out.push(d.toISOString().slice(0, 10));
    }
    return out;
  }, [doctor]);

  const bookedSlots = useMemo(() =>
    s.appointments.filter((x) => x.doctorId === docId && x.date === date && x.status !== "Cancelled").map((x) => x.slot),
  [s.appointments, docId, date]);

  const slots = useMemo(() => {
    if (!doctor) return [];
    const inRange = (t: string) => t >= doctor.from && t < doctor.to;
    return SLOT_TIMES.filter(inRange);
  }, [doctor]);

  const findPatient = () => {
    const p = s.patients.find((x) => x.mobile === mobile.replace(/\s/g, ""));
    if (p) { setFoundId(p.id); setErr(""); toast(`Welcome back, ${p.name}!`, "ok"); }
    else { setFoundId(""); setErr("No record for this mobile — please register as a new patient below."); setMode("new"); }
  };

  const confirm = () => {
    setErr("");
    let patientId = foundId;
    if (mode === "new" || !patientId) {
      if (!np.name.trim() || !np.dob) { setErr("Please enter the patient's full name and date of birth."); return; }
      if (!validPhone(mobile)) { setErr("Enter a valid 10-digit mobile number (starting 6–9)."); return; }
      const res = a.registerPatient({ name: np.name.trim(), dob: np.dob, gender: np.gender, mobile: mobile.replace(/\s/g, ""), address: np.address || "—", blood: "—", allergies: "None recorded", conditions: "—" });
      if ("error" in res) { setErr(res.error); return; }
      patientId = res.id;
    }
    if (!reason.trim()) { setErr("Please tell us the reason for the visit — it helps the doctor prepare."); return; }
    const res = a.bookAppointment({ patientId, doctorId: docId, date, slot, reason: reason.trim() });
    if ("error" in res) { setErr(res.error); setStep(2); setSlot(""); return; }
    setDone(res);
  };

  if (done) {
    const p = s.patients.find((x) => x.id === (foundId || s.patients[0]?.id));
    return (
      <div className="max-w-2xl mx-auto px-4 py-14 anim-fade-up">
        <div className="card p-8 text-center">
          <span className="w-16 h-16 rounded-full bg-okbg text-ok flex items-center justify-center mx-auto anim-pop"><CheckCircle2 size={34} /></span>
          <h1 className="font-display font-extrabold text-3xl text-ink mt-5">Appointment confirmed</h1>
          <p className="text-soft mt-2">Your booking is live in the hospital system — reception can already see it.</p>
          <div className="rounded-2xl bg-paper border border-line p-5 mt-6 text-left space-y-2.5">
            {[["Booking No", done.no], ["Doctor", doctor?.name ?? ""], ["Department", deptDoc?.name ?? doctor?.specialty ?? ""], ["Date", fmtDateShort(date)], ["Time", slot], ["Consultation fee", `₹${doctor?.fee}`]].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm"><span className="text-soft">{k}</span><span className="font-bold text-ink mono">{v}</span></div>
            ))}
          </div>
          <p className="text-xs text-soft mt-4 leading-relaxed">Arrive 10 minutes early. Your token is issued at the reception check-in counter — watch the lobby display.</p>
          <div className="flex flex-wrap gap-2.5 justify-center mt-6">
            <a className="btn btn-primary" href={WA_LINK(s.settings.whatsapp, `Appointment ${done.no} confirmed for ${date} ${slot}`)} target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp confirmation</a>
            <Link to="/" className="btn btn-outline">Back to home</Link>
          </div>
          <p className="mt-5 text-[11px] text-faint flex items-center justify-center gap-1.5"><ShieldCheck size={13} /> Demo workflow — no real SMS/WhatsApp is sent{p ? ` · Patient: ${p.name}` : ""}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Online Booking</p>
          <h1 className="font-display font-extrabold text-3xl text-ink">Book an appointment</h1>
        </div>
        <Link to="/" className="btn btn-ghost btn-sm hidden sm:inline-flex"><ChevronLeft size={15} /> Home</Link>
      </div>
      {/* stepper */}
      <div className="flex gap-1.5 mt-6 mb-8 overflow-x-auto no-scrollbar">
        {STEPS.map((st, i) => (
          <div key={st} className="flex items-center gap-1.5 shrink-0">
            <span className={cx("w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border transition-colors",
              i < step ? "bg-ok text-white border-ok" : i === step ? "bg-primary text-white border-primary" : "bg-white text-soft border-line")}>
              {i < step ? "✓" : i + 1}
            </span>
            <span className={cx("text-xs font-semibold", i === step ? "text-ink" : "text-faint")}>{st}</span>
            {i < STEPS.length - 1 && <span className="w-6 h-px bg-line" />}
          </div>
        ))}
      </div>

      {err && <div className="mb-5 rounded-xl border border-danger/30 bg-dangerbg text-danger text-sm font-semibold px-4 py-3 anim-tick">{err}</div>}

      {step === 0 && (
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-3 anim-fade-up">
          {s.departments.filter((d) => s.doctors.some((x) => x.deptId === d.id)).map((d) => (
            <button key={d.id} onClick={() => { setDept(d.id); setDocId(""); setStep(1); }} className="card card-hover p-4 text-left">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `hsl(${d.hue} 45% 93%)`, color: `hsl(${d.hue} 55% 32%)` }}><DIcon name={d.icon} size={19} /></span>
              <p className="font-display font-bold text-sm text-ink mt-2.5">{d.name}</p>
              <p className="text-[11px] text-soft">{s.doctors.filter((x) => x.deptId === d.id).length} doctor(s)</p>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="anim-fade-up">
          <div className="flex items-center gap-3 mb-4">
            <button className="btn btn-outline btn-sm" onClick={() => (doctorId ? setStep(2) : setStep(0))}><ChevronLeft size={14} /> Back</button>
            <p className="text-sm text-soft">Choose a doctor in <strong className="text-ink">{deptDoc?.name ?? "the department"}</strong></p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {s.doctors.filter((d) => d.deptId === dept).map((d) => (
              <button key={d.id} onClick={() => { setDocId(d.id); setStep(2); }} className={cx("card card-hover p-4 text-left flex gap-3.5", docId === d.id && "border-primary ring-2 ring-primary/15")}>
                <Avatar name={d.name} hue={d.hue} size={46} />
                <div className="min-w-0">
                  <p className="font-display font-bold text-ink">{d.name}</p>
                  <p className="text-[11px] text-soft">{d.quals}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge tone="primary">{d.days[0]}–{d.days[d.days.length - 1]}</Badge>
                    <Badge tone="neutral">{d.from}–{d.to}</Badge>
                    <Badge tone="ok">₹{d.fee}</Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && doctor && (
        <div className="anim-fade-up grid lg:grid-cols-[1fr_280px] gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button className="btn btn-outline btn-sm" onClick={() => setStep(doctorId ? 2 : 1)}><ChevronLeft size={14} /> Back</button>
              <div className="flex items-center gap-2.5"><Avatar name={doctor.name} hue={doctor.hue} size={34} /><span className="font-display font-bold text-ink">{doctor.name}</span><span className="text-xs text-soft">{doctor.specialty}</span></div>
            </div>
            <p className="label">Pick a date <span className="normal-case font-normal text-faint">— OPD days only</span></p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {dates.map((d) => (
                <button key={d} onClick={() => { setDate(d); setSlot(""); }} className={cx("shrink-0 rounded-xl border px-4 py-2.5 text-center transition-all", date === d ? "bg-primary text-white border-primary shadow-md" : "bg-white border-line hover:border-primary")}>
                  <span className="block text-[10px] font-bold uppercase opacity-70">{new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" })}</span>
                  <span className="block text-sm font-bold mono">{d.slice(8)}</span>
                  <span className="block text-[10px] opacity-70">{new Date(d + "T00:00:00").toLocaleDateString("en-IN", { month: "short" })}</span>
                </button>
              ))}
              {dates.length === 0 && <p className="text-sm text-soft">This doctor has no OPD in the next 7 days.</p>}
            </div>
            <p className="label mt-6">Available slots <span className="normal-case font-normal text-faint">— grey slots are already booked</span></p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {slots.map((t) => {
                const taken = bookedSlots.includes(t) || t < new Date().toTimeString().slice(0, 5) && date === todayISO();
                return (
                  <button key={t} disabled={taken} onClick={() => setSlot(t)}
                    className={cx("rounded-lg border py-2.5 mono text-sm font-semibold transition-all", taken ? "bg-paper text-faint border-line line-through cursor-not-allowed" : slot === t ? "bg-primary text-white border-primary shadow-md" : "bg-white border-line hover:border-primary text-ink")}>
                    {t}
                  </button>
                );
              })}
            </div>
            <button className="btn btn-primary mt-6" disabled={!date || !slot} onClick={() => setStep(3)}>Continue <ChevronRight size={15} /></button>
          </div>
          <aside className="card p-4 h-fit hidden lg:block">
            <img src={HERO_IMG} alt="" className="rounded-xl h-32 w-full object-cover mb-3" />
            <p className="text-xs text-soft leading-relaxed">OPD consultation fee <strong className="text-ink">₹{doctor.fee}</strong> is payable at the counter or added to your bill. Languages: {doctor.languages.join(", ")}.</p>
          </aside>
        </div>
      )}

      {step === 3 && (
        <div className="anim-fade-up max-w-xl">
          <div className="flex items-center gap-3 mb-4">
            <button className="btn btn-outline btn-sm" onClick={() => setStep(2)}><ChevronLeft size={14} /> Back</button>
            <p className="font-display font-bold text-ink">Who is the patient?</p>
          </div>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setMode("find")} className={cx("chip !py-2 !px-4 cursor-pointer", mode === "find" && "!bg-primary !text-white !border-primary")}><UserRound size={13} /> Visited before</button>
            <button onClick={() => { setMode("new"); setFoundId(""); }} className={cx("chip !py-2 !px-4 cursor-pointer", mode === "new" && "!bg-primary !text-white !border-primary")}>New patient</button>
          </div>
          <div className="card p-5 space-y-4">
            <Field label="Mobile number" req>
              <div className="flex gap-2">
                <input className="input mono" placeholder="98220 11001" value={mobile} onChange={(e) => setMobile(e.target.value)} maxLength={11} inputMode="numeric" />
                <button className="btn btn-outline shrink-0" onClick={findPatient}>Find me</button>
              </div>
            </Field>
            {foundId && <p className="text-sm font-semibold text-ok anim-tick">✓ Found: {s.patients.find((p) => p.id === foundId)?.name} ({s.patients.find((p) => p.id === foundId)?.uhid})</p>}
            {(mode === "new" || (err && !foundId)) && (
              <div className="grid sm:grid-cols-2 gap-4 anim-fade-in">
                <Field label="Full name" req><input className="input" value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} placeholder="e.g. Rohan Deshmukh" /></Field>
                <Field label="Date of birth" req><input type="date" className="input" value={np.dob} onChange={(e) => setNp({ ...np, dob: e.target.value })} /></Field>
                <Field label="Gender" req>
                  <select className="select" value={np.gender} onChange={(e) => setNp({ ...np, gender: e.target.value as "Male" | "Female" | "Other" })}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </Field>
                <Field label="Address"><input className="input" value={np.address} onChange={(e) => setNp({ ...np, address: e.target.value })} placeholder="Area, town" /></Field>
              </div>
            )}
            <Field label="Reason for visit" req hint="A short description helps the doctor prepare for your visit.">
              <textarea className="textarea" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Knee pain since last week, worse on stairs" />
            </Field>
          </div>
          <button className="btn btn-primary btn-lg mt-5" onClick={() => setStep(4)} disabled={mode === "find" ? !foundId || !reason.trim() : !reason.trim()}>Review booking <ChevronRight size={16} /></button>
        </div>
      )}

      {step === 4 && doctor && (
        <div className="anim-fade-up max-w-xl">
          <div className="flex items-center gap-3 mb-4">
            <button className="btn btn-outline btn-sm" onClick={() => setStep(3)}><ChevronLeft size={14} /> Back</button>
            <p className="font-display font-bold text-ink">Confirm your appointment</p>
          </div>
          <div className="card p-5 space-y-3">
            {[[ "Patient", mode === "find" ? s.patients.find((p) => p.id === foundId)?.name ?? "" : np.name],
              ["Doctor", `${doctor.name} · ${doctor.specialty}`],
              ["Department", deptDoc?.name ?? ""],
              ["Date & time", `${fmtDateShort(date)} · ${slot}`],
              ["Reason", reason],
              ["Fee at counter", `₹${doctor.fee}`]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 text-sm border-b border-line/70 pb-2.5 last:border-0">
                <span className="text-soft">{k}</span><span className="font-bold text-ink text-right">{v}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-lg w-full mt-5" onClick={confirm}><CalendarDays size={17} /> Confirm appointment</button>
          <p className="text-[11px] text-faint text-center mt-3">By booking you agree to our demo terms. Cancellation is free at the counter.</p>
        </div>
      )}
    </div>
  );
}
