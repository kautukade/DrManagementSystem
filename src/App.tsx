import React, { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { StoreProvider, useStore, ROLE_META } from "./lib/store";
import { fmtDateShort, cx } from "./lib/utils";
import { ToastHost, ECG } from "./components/ui";
import PublicLayout from "./layouts/PublicLayout";
import AppLayout from "./layouts/AppLayout";

import Home from "./pages/site/Home";
import BookAppointment from "./pages/site/BookAppointment";
import {
  DoctorsPage, DoctorDetailPage, DepartmentsPage, DepartmentDetailPage, ServicesPage,
  FacilitiesPage, PackagesPage, InsurancePage, EmergencyPage, GalleryPage, BlogPage,
  BlogDetailPage, CampsPage, TestimonialsPage, FaqPage, ContactPage, AboutPage,
  PrivacyPage, TermsPage, PortalPage,
} from "./pages/site/Directory";
import Login from "./pages/Login";
import OwnerDashboard from "./pages/dash/Owner";
import Reception from "./pages/dash/Reception";
import { DoctorDashboard, ConsultPage } from "./pages/dash/Doctor";
import Pharmacy from "./pages/dash/Pharmacy";
import Billing from "./pages/dash/Billing";
import { PatientsPage, PatientProfilePage } from "./pages/dash/Patients";
import { IpdPage, BedsPage, NursingPage, LabPage, RadiologyPage, OtPage } from "./pages/dash/Care";
import { StaffPage, AttendancePage, LeavesPage } from "./pages/dash/Workforce";
import { InventoryPage, AssetsPage, AmbulancePage, FeedbackPage, AnalyticsPage, AuditPage } from "./pages/dash/Ops";
import Settings from "./pages/dash/Settings";

/* ── lobby TV queue display ── */
function QueueTV() {
  const { s } = useStore();
  const t = new Date().toISOString().slice(0, 10);
  const nowServing = s.appointments.filter((a) => a.date === t && a.status === "With Doctor").slice(-1)[0];
  const waiting = s.appointments.filter((a) => a.date === t && a.status === "Waiting").sort((a, b) => (a.token ?? 99) - (b.token ?? 99));
  const [clock, setClock] = React.useState(new Date());
  useEffect(() => { const i = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(i); }, []);
  return (
    <div className="min-h-screen bg-pine text-white flex flex-col p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center font-display font-extrabold">A</span>
          <div><p className="font-display font-bold text-xl">{s.settings.name}</p><p className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent">OPD Token Display · Demo</p></div>
        </div>
        <p className="mono text-2xl text-white/70">{clock.toLocaleTimeString("en-IN")}</p>
      </div>
      <div className="flex-1 grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center max-w-6xl mx-auto w-full">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent">Now serving</p>
          <p key={nowServing?.token ?? 0} className="font-display font-extrabold text-[9rem] lg:text-[12rem] leading-none text-white anim-pop">{nowServing?.token ?? "—"}</p>
          <p className="text-2xl text-white/80 font-display font-bold">{nowServing ? s.patients.find((p) => p.id === nowServing.patientId)?.name : "Waiting for next patient"}</p>
          <p className="text-white/50 mt-1">{nowServing ? s.doctors.find((d) => d.id === nowServing.doctorId)?.name : ""}</p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/50 mb-4">Waiting ({waiting.length})</p>
          <div className="grid grid-cols-2 gap-3">
            {waiting.slice(0, 8).map((w, i) => (
              <div key={w.id} className={cx("rounded-2xl border p-4 flex items-center gap-4", i === 0 ? "border-accent bg-accent/10" : "border-white/10 bg-white/4")}>
                <span className="font-display font-extrabold text-4xl text-accent tabular-nums">{w.token}</span>
                <div className="min-w-0"><p className="font-bold truncate">{s.patients.find((p) => p.id === w.patientId)?.name}</p><p className="text-xs text-white/50 truncate">{s.doctors.find((d) => d.id === w.doctorId)?.name}</p></div>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/40 mt-6">Pharmacy and billing counters update automatically · Powered by ITCYBER Hospital360 OS</p>
        </div>
      </div>
      <ECG className="w-full h-8 text-accent/30" />
    </div>
  );
}

function RoleHome() {
  const { s } = useStore();
  if (!s.user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_META[s.user.role].home} replace />;
}

function Guard({ children }: { children: React.ReactNode }) {
  const { s } = useStore();
  const loc = useLocation();
  if (!s.user) return <Navigate to="/login" replace state={{ from: loc }} />;
  if (s.user.role === "patient") return <Navigate to="/portal" replace />;
  return <>{children}</>;
}

function Shell() {
  const { s, toasts, dismissToast } = useStore();
  const loc = useLocation();
  useEffect(() => {
    document.title = loc.pathname.startsWith("/app") ? `Hospital360 OS — ${s.settings.shortName}` : `${s.settings.name} — ${s.settings.tagline}`;
    window.scrollTo({ top: 0 });
  }, [loc.pathname, s.settings.shortName, s.settings.name, s.settings.tagline]);

  return (
    <>
      <Routes>
        <Route path="/login" element={s.user && s.user.role !== "patient" ? <Navigate to={ROLE_META[s.user.role].home} replace /> : <Login />} />
        <Route path="/queue" element={<QueueTV />} />
        <Route path="/app" element={<Guard><RoleHome /></Guard>} />
        <Route path="/app/*" element={
          <Guard>
            <AppLayout>
              <Routes>
                <Route path="dash" element={<RoleHome />} />
                <Route path="owner" element={<OwnerDashboard />} />
                <Route path="reception" element={<Reception />} />
                <Route path="appointments" element={<Reception />} />
                <Route path="doctor" element={<DoctorDashboard />} />
                <Route path="consult/:id" element={<ConsultPage />} />
                <Route path="patients" element={<PatientsPage />} />
                <Route path="patients/:id" element={<PatientProfilePage />} />
                <Route path="ipd" element={<IpdPage />} />
                <Route path="beds" element={<BedsPage />} />
                <Route path="nursing" element={<NursingPage />} />
                <Route path="doctors" element={<Settings />} />
                <Route path="lab" element={<LabPage />} />
                <Route path="radiology" element={<RadiologyPage />} />
                <Route path="ot" element={<OtPage />} />
                <Route path="pharmacy" element={<Pharmacy />} />
                <Route path="billing" element={<Billing />} />
                <Route path="accounts" element={<Billing accountsOnly />} />
                <Route path="staff" element={<StaffPage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="leaves" element={<LeavesPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="assets" element={<AssetsPage />} />
                <Route path="ambulance" element={<AmbulancePage />} />
                <Route path="feedback" element={<FeedbackPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="audit" element={<AuditPage />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="dash" replace />} />
              </Routes>
            </AppLayout>
          </Guard>
        } />
        <Route path="/*" element={
          <PublicLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/book" element={<BookAppointment />} />
              <Route path="/book/:doctorId" element={<BookAppointment />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/doctors/:id" element={<DoctorDetailPage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/departments/:id" element={<DepartmentDetailPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/facilities" element={<FacilitiesPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/insurance" element={<InsurancePage />} />
              <Route path="/emergency" element={<EmergencyPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/camps" element={<CampsPage />} />
              <Route path="/testimonials" element={<TestimonialsPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/portal" element={<PortalPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PublicLayout>
        } />
      </Routes>
      <ToastHost toasts={toasts} dismiss={dismissToast} />
    </>
  );
}

function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <p className="font-display font-extrabold text-7xl text-primary">404</p>
      <p className="font-display font-bold text-xl text-ink mt-3">This ward doesn't exist</p>
      <p className="text-sm text-soft mt-2">The page you're looking for was moved or never admitted.</p>
      <Link to="/" className="btn btn-primary mt-6">Back to reception</Link>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </StoreProvider>
  );
}
