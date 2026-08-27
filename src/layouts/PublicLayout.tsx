import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Phone, Siren, MessageCircle, Clock, MapPin, Menu, X, HeartPulse, ArrowRight } from "lucide-react";
import { useStore } from "../lib/store";
import { WA_LINK, MAPS_LINK, cx } from "../lib/utils";
import { ECG } from "../components/ui";

const I18N: Record<string, Record<string, string>> = {
  en: { book: "Book Appointment", doctors: "Doctors", departments: "Departments", services: "Services", packages: "Health Packages", about: "About", contact: "Contact", portal: "Patient Login", heroH: "Advanced Healthcare, Closer to You", heroS: "Multispeciality care backed by experienced doctors, modern facilities and compassionate support." },
  hi: { book: "अपॉइंटमेंट बुक करें", doctors: "डॉक्टर्स", departments: "विभाग", services: "सेवाएँ", packages: "हेल्थ पैकेज", about: "हमारे बारे में", contact: "संपर्क", portal: "मरीज़ लॉगिन", heroH: "उन्नत स्वास्थ्य सेवा, अब आपके करीब", heroS: "अनुभवी डॉक्टर, आधुनिक सुविधाएँ और सहानुभूतिपूर्ण सेवा — सब एक जगह।" },
  mr: { book: "अपॉइंटमेंट बुक करा", doctors: "डॉक्टर", departments: "विभाग", services: "सेवा", packages: "आरोग्य पॅकेज", about: "विषयी", contact: "संपर्क", portal: "रुग्ण लॉगिन", heroH: "प्रगत आरोग्यसेवा, आता तुमच्याजवळ", heroS: "अनुभवी डॉक्टर, अत्याधुनिक सुविधा आणि आपुलकीची सेवा — सर्व एकाच ठिकाणी." },
};

export function useT() {
  const { s } = useStore();
  const dict = I18N[s.settings.lang] ?? I18N.en;
  return (k: string) => dict[k] ?? I18N.en[k] ?? k;
}

function Logo({ light }: { light?: boolean }) {
  const { s } = useStore();
  return (
    <Link to="/" className="flex items-center gap-2.5 group" aria-label={s.settings.name + " — home"}>
      <span className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
        <HeartPulse size={22} strokeWidth={2} />
      </span>
      <span className="leading-tight">
        <span className={cx("block font-display font-bold text-[17px]", light ? "text-white" : "text-ink")}>{s.settings.shortName}</span>
        <span className={cx("block text-[10px] font-semibold tracking-[0.14em] uppercase", light ? "text-white/50" : "text-soft")}>Hospital360 OS</span>
      </span>
    </Link>
  );
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { s, a } = useStore();
  const t = useT();
  const loc = useLocation();
  const [menu, setMenu] = useState(false);
  useEffect(() => { setMenu(false); window.scrollTo({ top: 0 }); }, [loc.pathname]);

  const links = [
    { to: "/doctors", label: t("doctors") }, { to: "/departments", label: t("departments") },
    { to: "/services", label: t("services") }, { to: "/packages", label: t("packages") },
    { to: "/about", label: t("about") }, { to: "/contact", label: t("contact") },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      {/* emergency strip */}
      <div className="bg-pine text-white text-xs sm:text-[13px]">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
            <span className="flex items-center gap-2 font-semibold whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-[#ff6b5e] live-dot text-[#ff6b5e]" />
              <Siren size={14} className="text-[#ff8a7e]" /> 24×7 Emergency
              <a href={`tel:${s.settings.emergency}`} className="mono font-bold text-[#ffd08a] hover:underline">{s.settings.emergency}</a>
            </span>
            <a href={`tel:${s.settings.ambulance}`} className="hidden sm:flex items-center gap-1.5 whitespace-nowrap hover:text-white/80">
              Ambulance <span className="mono font-bold text-[#9fe3cd]">{s.settings.ambulance}</span>
            </a>
            <a href={WA_LINK(s.settings.whatsapp, "Hello, I need help regarding " + s.settings.name)} target="_blank" rel="noreferrer" className="hidden md:flex items-center gap-1.5 whitespace-nowrap hover:text-white/80">
              <MessageCircle size={13} /> WhatsApp
            </a>
          </div>
          <span className="hidden lg:flex items-center gap-1.5 text-white/70 whitespace-nowrap"><Clock size={13} /> {s.settings.hours}</span>
        </div>
      </div>

      {/* navbar */}
      <header className="sticky top-0 z-50 bg-card/92 backdrop-blur border-b border-line">
        <div className="max-w-7xl mx-auto px-4 h-[68px] flex items-center justify-between gap-4">
          <Logo />
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className={cx("px-3 py-2 rounded-lg text-sm font-semibold transition-colors", loc.pathname.startsWith(l.to) ? "text-primary bg-tint" : "text-soft hover:text-ink hover:bg-paper")}>{l.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <select value={s.settings.lang} onChange={(e) => a.saveSettings({ lang: e.target.value as "en" | "hi" | "mr" })} aria-label="Language"
              className="hidden sm:block text-xs font-bold border border-line rounded-lg px-1.5 py-1.5 bg-white text-soft cursor-pointer">
              <option value="en">EN</option><option value="hi">हिं</option><option value="mr">मर</option>
            </select>
            <Link to="/portal" className="hidden sm:inline-flex btn btn-outline btn-sm">{t("portal")}</Link>
            <Link to="/book" className="btn btn-primary btn-sm !px-4">{t("book")}</Link>
            <button className="lg:hidden btn btn-outline btn-sm !px-2.5" onClick={() => setMenu(!menu)} aria-label="Toggle menu" aria-expanded={menu}>
              {menu ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
        {menu && (
          <nav className="lg:hidden border-t border-line bg-card px-4 py-3 anim-fade-in" aria-label="Mobile">
            {links.map((l) => <Link key={l.to} to={l.to} className="block px-2 py-2.5 rounded-lg text-sm font-semibold text-ink hover:bg-tint">{l.label}</Link>)}
            <Link to="/portal" className="block px-2 py-2.5 rounded-lg text-sm font-semibold text-ink hover:bg-tint">{t("portal")}</Link>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* footer */}
      <footer className="bg-pine text-white mt-16">
        <ECG className="w-full h-8 text-accent/40" />
        <div className="max-w-7xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo light />
            <p className="text-white/65 text-sm mt-4 leading-relaxed max-w-sm">{s.settings.tagline}</p>
            <p className="mt-4 text-[11px] text-white/40 leading-relaxed border border-white/10 rounded-lg p-3">
              This is a demonstration deployment of <strong className="text-white/60">ITCYBER Hospital360 OS</strong> using fully fictional data for
              <strong className="text-white/60"> {s.settings.name}</strong>. No real patient information is stored or displayed.
            </p>
          </div>
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-[0.14em] text-white/50 mb-4">Quick Links</h4>
            {[["/doctors", "Our Doctors"], ["/departments", "Departments"], ["/packages", "Health Packages"], ["/book", "Book Appointment"], ["/emergency", "Emergency"], ["/blog", "Health Blog"], ["/faq", "FAQ"]].map(([to, label]) => (
              <Link key={to} to={to} className="block text-sm text-white/70 hover:text-white py-1.5">{label}</Link>
            ))}
          </div>
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-[0.14em] text-white/50 mb-4">Departments</h4>
            {s.departments.slice(0, 7).map((d) => (
              <Link key={d.id} to={`/departments/${d.id}`} className="block text-sm text-white/70 hover:text-white py-1.5">{d.name}</Link>
            ))}
          </div>
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-[0.14em] text-white/50 mb-4">Reach Us</h4>
            <p className="flex gap-2.5 text-sm text-white/70 leading-relaxed"><MapPin size={16} className="shrink-0 mt-0.5 text-accent" /> {s.settings.address}</p>
            <p className="flex gap-2.5 text-sm text-white/70 mt-3"><Phone size={16} className="shrink-0 mt-0.5 text-accent" /> {s.settings.phone}</p>
            <p className="flex gap-2.5 text-sm text-white/70 mt-3"><Siren size={16} className="shrink-0 mt-0.5 text-[#ff8a7e]" /> Emergency: {s.settings.emergency}</p>
            <p className="flex gap-2.5 text-sm text-white/70 mt-3"><Clock size={16} className="shrink-0 mt-0.5 text-accent" /> {s.settings.hours}</p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50 pb-20 lg:pb-4">
            <span>© 2026 {s.settings.name} · Powered by ITCYBER Hospital360 OS</span>
            <span className="flex gap-4">
              <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white">Terms</Link>
              <Link to="/login" className="hover:text-white">Staff Login</Link>
            </span>
          </div>
        </div>
      </footer>

      {/* mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-card border-t border-line shadow-[0_-8px_24px_-12px_rgba(12,43,37,0.25)] grid grid-cols-4">
        <a href={`tel:${s.settings.phone}`} className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold text-soft"><Phone size={17} className="text-primary" />Call</a>
        <a href={WA_LINK(s.settings.whatsapp, "Hello " + s.settings.name)} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold text-soft"><MessageCircle size={17} className="text-ok" />WhatsApp</a>
        <Link to="/book" className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold text-white bg-primary"><ArrowRight size={17} />Appointment</Link>
        <a href={MAPS_LINK(s.settings.name + " " + s.settings.city)} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold text-soft"><MapPin size={17} className="text-info" />Directions</a>
      </div>

      {/* floating WhatsApp (desktop) */}
      <a href={WA_LINK(s.settings.whatsapp, "Hello " + s.settings.name)} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"
        className="hidden lg:flex fixed bottom-6 right-6 z-40 w-13 h-13 p-3.5 rounded-full bg-[#1faa55] text-white shadow-xl hover:scale-110 transition-transform">
        <MessageCircle size={22} />
      </a>
    </div>
  );
}
