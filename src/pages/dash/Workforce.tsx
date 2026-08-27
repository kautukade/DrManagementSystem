import React, { useState } from "react";
import { Users, Clock, LogIn, LogOut, Plus, BadgeCheck, CalendarRange } from "lucide-react";
import { useStore } from "../../lib/store";
import type { Employee } from "../../lib/types";
import { cx, fmtDate, inr, todayISO, uid, WEEK } from "../../lib/utils";
import { Avatar, Badge, DataTable, Field, Modal, PageHead, StatCard, StatusBadge, SearchSelect } from "../../components/ui";

const SEES_SALARY = ["owner", "admin", "hr", "accountant"];

export function StaffPage() {
  const { s, a } = useStore();
  const [edit, setEdit] = useState<Employee | null>(null);
  const canSeeSalary = SEES_SALARY.includes(s.user?.role ?? "");
  const blank: Employee = { id: "", empId: `EMP-${114 + s.staff.length + 1}`, name: "", dept: "Nursing", designation: "", role: "nurse", phone: "", email: "", joined: todayISO(), shift: "Morning", type: "Full-time", salary: 20000, hue: 200 };
  return (
    <div className="anim-fade-up">
      <PageHead title="Staff Management" sub="11 departments, one roster. Sensitive fields are role-restricted in production (RLS)."
        actions={<button className="btn btn-primary btn-sm" onClick={() => setEdit({ ...blank, id: "e-" + uid() })}><Plus size={15} /> Add staff</button>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 stagger">
        <StatCard label="Total Staff" value={s.staff.length} icon={Users} />
        <StatCard label="Doctors" value={s.staff.filter((e) => e.dept === "Doctors").length} icon={Users} tone="info" />
        <StatCard label="Nursing" value={s.staff.filter((e) => e.dept === "Nursing").length} tone="ok" icon={Users} />
        <StatCard label="On Leave Today" value={s.attendance.filter((x) => x.date === todayISO() && x.status === "Leave").length} tone="warn" icon={CalendarRange} />
      </div>
      <div className="card p-4">
        <DataTable
          cols={[
            { key: "empId", label: "ID", render: (e: any) => <span className="mono font-bold text-primary">{e.empId}</span> },
            { key: "name", label: "Employee", render: (e: any) => <div className="flex items-center gap-2.5"><Avatar name={e.name} hue={e.hue} size={32} /><span><span className="font-semibold text-ink block">{e.name}</span><span className="text-[10px] text-faint">{e.designation}</span></span></div> },
            { key: "dept", label: "Department" },
            { key: "shift", label: "Shift", render: (e: any) => <Badge tone={e.shift === "Morning" ? "ok" : e.shift === "Evening" ? "info" : "pine"}>{e.shift}</Badge> },
            { key: "joined", label: "Joined", render: (e: any) => <span className="text-xs text-soft">{fmtDate(e.joined)}</span> },
            ...(canSeeSalary ? [{ key: "salary", label: "Salary", right: true, render: (e: any) => <span className="mono font-semibold">{inr(e.salary)}</span> }] : []),
            { key: "act", label: "", right: true, render: (e: any) => <button className="btn btn-outline btn-sm" onClick={(ev: any) => { ev.stopPropagation(); setEdit(e); }}>Edit</button> },
          ]}
          rows={s.staff as any}
          searchable={(e: any) => `${e.name} ${e.empId} ${e.dept} ${e.designation}`}
          pageSize={10}
        />
        {!canSeeSalary && <p className="text-[11px] text-faint mt-2">Salary column hidden for your role — visible to Owner, HR and Accounts only.</p>}
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.name ? `Edit — ${edit.name}` : "Add staff member"} wide
        footer={<><button className="btn btn-ghost" onClick={() => setEdit(null)}>Cancel</button>
          <button className="btn btn-primary" disabled={!edit?.name || !edit?.designation} onClick={() => { if (edit) a.saveEmployee(edit); setEdit(null); }}>Save record</button></>}>
        {edit && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name" req><input className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
            <Field label="Designation" req><input className="input" value={edit.designation} onChange={(e) => setEdit({ ...edit, designation: e.target.value })} /></Field>
            <Field label="Department"><select className="select" value={edit.dept} onChange={(e) => setEdit({ ...edit, dept: e.target.value })}>{["Doctors", "Nursing", "Reception", "Pharmacy", "Lab", "Radiology", "Accounts", "HR", "Housekeeping", "Security", "Ambulance", "Management"].map((d) => <option key={d}>{d}</option>)}</select></Field>
            <Field label="System role"><select className="select" value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value as any })}>{["doctor", "nurse", "receptionist", "pharmacist", "lab", "radiology", "accountant", "hr", "admin", "staff"].map((r) => <option key={r}>{r}</option>)}</select></Field>
            <Field label="Phone"><input className="input mono" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></Field>
            <Field label="Email"><input className="input" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></Field>
            <Field label="Shift"><select className="select" value={edit.shift} onChange={(e) => setEdit({ ...edit, shift: e.target.value as any })}><option>Morning</option><option>Evening</option><option>Night</option></select></Field>
            <Field label="Employment type"><select className="select" value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value as any })}><option>Full-time</option><option>Part-time</option><option>Contract</option></select></Field>
            {canSeeSalary && <Field label="Monthly salary ₹"><input type="number" className="input mono" value={String(edit.salary)} onChange={(e) => setEdit({ ...edit, salary: +e.target.value })} /></Field>}
          </div>
        )}
      </Modal>
    </div>
  );
}

export function AttendancePage() {
  const { s, a } = useStore();
  const meStaff = s.staff.find((e) => e.id === s.user?.id);
  const today = s.attendance.filter((x) => x.date === todayISO());
  const shifts = ["Morning", "Evening", "Night"];
  return (
    <div className="anim-fade-up">
      <PageHead title="Attendance & Shifts" sub="Clock in/out, live status and the weekly roster."
        actions={meStaff ? <button className="btn btn-primary btn-sm" onClick={() => a.clockToggle(meStaff.id)}><Clock size={15} /> {today.some((x) => x.empId === meStaff.id && !x.clockOut) ? "Clock out" : "Clock in"} ({meStaff.name.split(" ")[0]})</button> : undefined} />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5 stagger">
        {(["Present", "Late", "Absent", "Leave"] as const).map((st, i) => (
          <StatCard key={st} label={st + " today"} value={today.filter((x) => x.status === st).length} tone={(["ok", "warn", "danger", "info"] as const)[i]} icon={Users} />
        ))}
        <StatCard label="Not marked" value={s.staff.length - today.length} tone="neutral" icon={Clock} />
      </div>
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <div className="card p-4">
          <h3 className="font-display font-bold text-ink mb-3">Today — {fmtDate(todayISO())}</h3>
          <DataTable
            cols={[
              { key: "name", label: "Employee", render: (r: any) => { const e = s.staff.find((x) => x.id === r.empId); return <div className="flex items-center gap-2"><Avatar name={e?.name ?? "?"} hue={e?.hue ?? 200} size={28} /><span className="font-semibold text-ink">{e?.name}</span></div>; } },
              { key: "in", label: "Clock-in", render: (r: any) => <span className="mono text-xs">{r.clockIn ?? "—"}</span> },
              { key: "out", label: "Clock-out", render: (r: any) => <span className="mono text-xs">{r.clockOut ?? "—"}</span> },
              { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
            ]}
            rows={today as any}
            pageSize={9}
          />
        </div>
        <div className="card p-5 h-fit">
          <h3 className="font-display font-bold text-ink mb-3">Weekly shift roster</h3>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Shift</th>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <th key={d}>{d}</th>)}</tr></thead>
              <tbody>
                {shifts.map((sh, si) => (
                  <tr key={sh}>
                    <td className="font-bold text-ink">{sh}</td>
                    {[0, 1, 2, 3, 4, 5].map((d) => {
                      const team = s.staff.filter((e) => e.shift === sh && (e.dept === "Doctors" || e.dept === "Nursing" || e.dept === "Reception")).slice(0, 2);
                      const names = team.map((e) => e.name.split(" ").slice(-1)[0]).join(", ");
                      return <td key={d} className="text-[11px]">{d % 7 === 6 - si ? <span className="text-faint">light</span> : <span className="font-semibold text-soft">{names || "—"}</span>}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-faint mt-3">Roster is editable per employee in production — demo shows the auto-generated pattern.</p>
        </div>
      </div>
    </div>
  );
}

export function LeavesPage() {
  const { s, a } = useStore();
  const [show, setShow] = useState(false);
  const [f, setF] = useState({ empId: s.staff[0]?.id ?? "", from: todayISO(1), to: todayISO(2), reason: "" });
  const isMgr = ["owner", "admin", "hr"].includes(s.user?.role ?? "");
  return (
    <div className="anim-fade-up">
      <PageHead title="Leaves & Payroll" sub="Apply, approve and run payroll on attendance-linked calculations."
        actions={<button className="btn btn-primary btn-sm" onClick={() => setShow(true)}><Plus size={15} /> Apply for leave</button>} />
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-display font-bold text-ink mb-3">Leave requests</h3>
          {s.leaves.map((l) => {
            const e = s.staff.find((x) => x.id === l.empId);
            return (
              <div key={l.id} className="rounded-xl border border-line p-3.5 mb-2.5 flex items-center gap-3">
                <Avatar name={e?.name ?? "?"} hue={e?.hue ?? 200} size={34} />
                <div className="flex-1 min-w-0"><p className="text-sm font-bold text-ink">{e?.name}</p><p className="text-[11px] text-soft">{fmtDate(l.from)} → {fmtDate(l.to)} · {l.reason}</p></div>
                <StatusBadge status={l.status} />
                {isMgr && l.status === "Pending" && (
                  <div className="flex gap-1.5">
                    <button className="btn btn-primary btn-sm" onClick={() => a.decideLeave(l.id, "Approved")}><BadgeCheck size={13} /></button>
                    <button className="btn btn-outline btn-sm !text-danger" onClick={() => a.decideLeave(l.id, "Rejected")}>✕</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="card p-5">
          <h3 className="font-display font-bold text-ink mb-1">Payroll — this month <Badge tone="warn" className="ml-2">Demo calculation</Badge></h3>
          <p className="text-[11px] text-faint mb-3">Basic + HRA (20%) + allowance − deductions for absent/late days. Payslips export-ready.</p>
          <DataTable
            cols={[
              { key: "name", label: "Employee", render: (e: any) => <span className="font-semibold text-ink">{e.name}</span> },
              { key: "gross", label: "Gross", right: true, render: (e: any) => <span className="mono text-xs">{inr(e.salary * 1.25)}</span> },
              { key: "ded", label: "Deductions", right: true, render: (e: any) => { const abs = s.attendance.filter((x) => x.empId === e.id && (x.status === "Absent" || x.status === "Late")).length; return <span className="mono text-xs text-danger">−{inr(abs * e.salary / 30)}</span>; } },
              { key: "net", label: "Net", right: true, render: (e: any) => { const abs = s.attendance.filter((x) => x.empId === e.id && (x.status === "Absent" || x.status === "Late")).length; return <span className="mono font-bold text-ok">{inr(e.salary * 1.25 - abs * e.salary / 30)}</span>; } },
              { key: "st", label: "", render: () => <Badge tone="info">Draft</Badge> },
            ]}
            rows={s.staff.filter((e) => SEES_SALARY.includes(s.user?.role ?? "") ? true : e.id === s.user?.id) as any}
            pageSize={7}
          />
        </div>
      </div>
      <Modal open={show} onClose={() => setShow(false)} title="Apply for leave"
        footer={<><button className="btn btn-ghost" onClick={() => setShow(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={!f.reason.trim()} onClick={() => { a.applyLeave(f); setShow(false); setF({ empId: s.staff[0]?.id ?? "", from: todayISO(1), to: todayISO(2), reason: "" }); }}>Submit request</button></>}>
        <div className="space-y-4">
          <Field label="Employee" req><SearchSelect options={s.staff.map((e) => ({ id: e.id, label: e.name, sub: e.empId }))} value={f.empId} onChange={(id) => setF({ ...f, empId: id })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="From" req><input type="date" className="input" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></Field>
            <Field label="To" req><input type="date" className="input" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></Field>
          </div>
          <Field label="Reason" req><textarea className="textarea" rows={3} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  );
}
