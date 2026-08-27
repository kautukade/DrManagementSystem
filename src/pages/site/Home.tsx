import React from "react";
import { Link } from "react-router-dom";
import {
  Search, CalendarDays, Siren, MessageCircle, Package, MapPin, ArrowRight, Phone, Star,
  ChevronRight, Ticket, Pill, Receipt, Repeat, Stethoscope, UserRound, Sparkles, Clock,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { useT } from "../../layouts/PublicLayout";
import { HERO_IMG } from "../../lib/data";
import { cx, WA_LINK, MAPS_LINK, fmtDateShort, WEEK } from "../../lib/utils";
import { ECG, Reveal, Counter, SectionHead, DemoTag, DIcon, Avatar } from "../../components/ui";
import { DoctorCard } from "./Directory";

export default function Home() {
  const { s } = useStore();
  const t = useT();
  const today = WEEK[new Date().getDay()];
  const h = new Date().getHours();
  const opdOpen = (h >= 9 && h < 14) || (h >= 17 && h < 21);
  const onDuty = s.doctors.filter((d) => d.days.includes(today.slice(0, 3)));
  const waiting = s.appointments.filter((a) => a.date === new Date().toISOString().slice(0, 10) && a.status === "Waiting");
  const nowServing = s.appointments.find((a) => a.date === new Date().toISOString().slice(0, 10) && a.status === "With Doctor");
  const nowServingPatient = s.patients.find((p) => p.id === nowServing?.patientId);

  const quick = [
    { icon: Search, title: "Find a Doctor", sub: "Search by specialty", to: "/doctors", tone: "text-primary bg-tint", span: "sm:col-span-2" },
    { icon: CalendarDays, title: "Book Appointment", sub: "Get a slot in 60 seconds", to: "/book", tone: "text-primary bg-tint", span: "sm:col-span-2" },
    { icon: Siren, title: "24×7 Emergency", sub: s.settings.emergency, href: `tel:${s.settings.emergency}`, tone: "text-danger bg-dangerbg", span: "" },
    { icon: MessageCircle, title: "WhatsApp Us", sub: "Reports & reminders", href: WA_LINK(s.settings.whatsapp, "Hello " + s.settings.name), tone: "text-ok bg-okbg", span: "" },
    { icon: Package, title: "Health Packages", sub: "From ₹999", to: "/packages", tone: "text-info bg-infobg", span: "" },
    { icon: MapPin, title: "Directions", sub: s.settings.city + ", Maharashtra", href: MAPS_LINK(s.settings.name + " " + s.settings.city), tone: "text-warn bg-warnbg", span: "" },
  ];

  return (
    <div>
      {/* ═══ hero — live hospital board ═══ */}
      <section className="relative overflow-hidden crossgrid">
        <div className="max-w-7xl mx-auto px-4 pt-10 pb-14 lg:pt-16 lg:pb-20 grid lg:grid-cols-[1.12fr_0.88fr] gap-10 lg:gap-14 items-center">
          <div className="anim-fade-up">
            <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.18em] text-primary">
              <span className="w-8 h-px bg-primary" /> Multispeciality Hospital · {s.settings.city}
            </p>
            <h1 className="font-display font-extrabold text-[2.6rem] leading-[1.04] sm:text-6xl text-ink mt-4">
              {t("heroH").split(",")[0]},<br />
              <span className="text-primary">{t("heroH").split(",").slice(1).join(",") || "Always With You."}</span>
            </h1>
            <p className="text-soft text-lg leading-relaxed mt-5 max-w-xl">{t("heroS")}</p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link to="/book" className="btn btn-primary btn-lg">{t("book")} <ArrowRight size={17} /></Link>
              <Link to="/doctors" className="btn btn-outline btn-lg"><Stethoscope size={17} /> Find a Doctor</Link>
            </div>
            <ECG className="w-full max-w-md h-10 text-primary/50 mt-8" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6 max-w-2xl">
              {[
                { v: s.doctors.length, suffix: "+", label: "Doctors" },
                { v: s.departments.length, suffix: "+", label: "Departments" },
                { v: 24, suffix: "×7", label: "Emergency" },
                { v: 10000, suffix: "+", label: "Patients Served" },
              ].map((x) => (
                <div key={x.label}>
                  <p className="font-display font-extrabold text-3xl text-ink"><Counter to={x.v} suffix={x.suffix} /></p>
                  <p className="text-xs font-semibold text-soft mt-0.5">{x.label} <DemoTag className="!text-[9px] !px-1.5 hidden sm:inline-flex" /></p>
                </div>
              ))}
            </div>
          </div>

          {/* live board */}
          <div className="relative anim-slide-left">
            <div className="rounded-2xl overflow-hidden border border-line shadow-2xl relative">
              <img src={HERO_IMG} alt={`${s.settings.name} reception atrium`} className="w-full h-[300px] sm:h-[380px] object-cover" loading="eager" />
              <div className="absolute inset-0 bg-gradient-to-t from-pine/80 via-pine/10 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                <span className="text-xs font-semibold bg-pine/70 backdrop-blur rounded-full px-3 py-1.5 flex items-center gap-2">
                  <span className={cx("w-2 h-2 rounded-full", opdOpen ? "bg-[#5ee6a8] live-dot text-[#5ee6a8]" : "bg-warn")} />
                  {opdOpen ? "OPD is open now" : "OPD closed — Emergency open 24×7"}
                </span>
                <Link to="/emergency" className="text-xs font-bold bg-[#c0392b]/90 rounded-full px-3 py-1.5 hover:bg-[#a93226] flex items-center gap-1.5"><Siren size={13} /> Emergency</Link>
              </div>
            </div>
            <div className="card -mt-10 relative mx-3 sm:mx-6 p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="font-display font-bold text-sm text-ink flex items-center gap-2"><Sparkles size={15} className="text-primary" /> Now at {s.settings.shortName}</p>
                <span className="mono text-[10px] text-faint uppercase">live · demo</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-pine text-white px-4 py-3">
                <span className="font-display font-extrabold text-4xl text-accent tabular-nums">{nowServing?.token ?? "—"}</span>
                <div className="text-xs leading-snug">
                  <p className="font-bold text-white/90">Now serving · Token {nowServing?.token ?? "—"}</p>
                  <p className="text-white/55">{nowServingPatient?.name} → {s.doctors.find((d) => d.id === nowServing?.doctorId)?.name ?? "—"}</p>
                </div>
                <Link to="/queue" className="ml-auto text-[10px] font-bold bg-white/10 hover:bg-white/20 rounded-lg px-2.5 py-1.5 whitespace-nowrap">Lobby TV →</Link>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="rounded-lg border border-line p-2.5 text-center">
                  <p className="font-display font-bold text-lg text-ink tabular-nums">{waiting.length}</p>
                  <p className="text-[10px] font-semibold text-soft uppercase tracking-wide">Waiting</p>
                </div>
                <div className="rounded-lg border border-line p-2.5 text-center">
                  <p className="font-display font-bold text-lg text-ink tabular-nums">{onDuty.length}</p>
                  <p className="text-[10px] font-semibold text-soft uppercase tracking-wide">Doctors today</p>
                </div>
                <div className="rounded-lg border border-line p-2.5 text-center">
                  <p className="font-display font-bold text-lg text-ink"><Clock size={15} className="inline" /></p>
                  <p className="text-[10px] font-semibold text-soft uppercase tracking-wide">{onDuty[0] ? `${onDuty[0].from}–${onDuty[0].to}` : "—"}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                {onDuty.slice(0, 3).map((d) => (
                  <Link key={d.id} to={`/doctors/${d.id}`} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-tint transition-colors group">
                    <Avatar name={d.name} hue={d.hue} size={28} />
                    <span className="text-xs font-semibold text-ink">{d.name}</span>
                    <span className="text-[10px] text-soft">{d.specialty}</span>
                    <span className="ml-auto text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">Book →</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* departments marquee */}
        <div className="border-y border-line bg-card overflow-hidden py-3">
          <div className="marquee gap-10">
            {[...s.departments, ...s.departments].map((d, i) => (
              <Link key={i} to={`/departments/${d.id}`} className="flex items-center gap-2 text-sm font-semibold text-soft hover:text-primary whitespace-nowrap">
                <DIcon name={d.icon} size={16} className="text-primary" /> {d.name} <span className="text-line">•</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ quick actions ═══ */}
      <section className="max-w-7xl mx-auto px-4 -mt-0 pt-12">
        <Reveal>
          <div className="grid sm:grid-cols-4 gap-3 stagger">
            {quick.map((q) => {
              const I = q.icon;
              const inner = (
                <>
                  <span className={cx("w-10 h-10 rounded-xl flex items-center justify-center", q.tone)}><I size={19} /></span>
                  <span className="font-display font-bold text-ink">{q.title}</span>
                  <span className="text-xs text-soft">{q.sub}</span>
                </>
              );
              const cls = cx("card card-hover p-4 flex flex-col items-start gap-2 text-left", q.span);
              return q.to ? <Link key={q.title} to={q.to} className={cls}>{inner}</Link>
                : <a key={q.title} href={q.href} target={q.href!.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={cls}>{inner}</a>;
            })}
          </div>
        </Reveal>
      </section>

      {/* ═══ care journey — the OS story ═══ */}
      <section className="max-w-7xl mx-auto px-4 pt-16">
        <Reveal>
          <SectionHead eyebrow="One connected system" title="Your visit flows through one system — not five registers"
            sub="Hospital360 OS runs the whole journey behind the scenes. This is the same live data our staff see right now." />
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-8 stagger">
          {[
            { icon: UserRound, label: "Register", sub: "Online or front desk" },
            { icon: Ticket, label: "Token", sub: "Live queue display" },
            { icon: Stethoscope, label: "Doctor", sub: "Digital consultation" },
            { icon: Pill, label: "Prescription", sub: "Straight to pharmacy" },
            { icon: Receipt, label: "Bill", sub: "Itemised & transparent" },
            { icon: Phone, label: "Payment", sub: "Cash · UPI · Card" },
            { icon: Repeat, label: "Follow-up", sub: "Auto reminders" },
          ].map((x, i) => (
            <Reveal key={x.label} delay={i * 60}>
              <div className="card card-hover p-4 h-full relative">
                <span className="mono text-[10px] text-faint absolute top-3 right-3">0{i + 1}</span>
                <span className="w-9 h-9 rounded-lg bg-tint text-primary flex items-center justify-center"><x.icon size={17} /></span>
                <p className="font-display font-bold text-sm text-ink mt-2.5">{x.label}</p>
                <p className="text-[11px] text-soft mt-0.5">{x.sub}</p>
                {i < 6 && <ChevronRight size={13} className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-faint z-10" />}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ departments ═══ */}
      <section className="max-w-7xl mx-auto px-4 pt-16">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <SectionHead eyebrow="Centres of care" title="12 departments under one roof" />
            <Link to="/departments" className="btn btn-outline btn-sm shrink-0">All departments <ArrowRight size={14} /></Link>
          </div>
        </Reveal>
        <div className="flex gap-3 overflow-x-auto no-scrollbar mt-7 pb-2 snap-x">
          {s.departments.map((d, i) => (
            <Reveal key={d.id} delay={i * 40} className="snap-start">
              <Link to={`/departments/${d.id}`} className="card card-hover p-5 w-[240px] shrink-0 flex flex-col gap-3 h-full">
                <span className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `hsl(${d.hue} 45% 93%)`, color: `hsl(${d.hue} 55% 32%)` }}>
                  <DIcon name={d.icon} size={21} />
                </span>
                <div>
                  <p className="font-display font-bold text-ink">{d.name}</p>
                  <p className="text-xs text-soft mt-1 leading-relaxed">{d.short}</p>
                </div>
                <span className="mt-auto text-xs font-bold text-primary flex items-center gap-1">{s.doctors.filter((x) => x.deptId === d.id).length} doctor(s) <ArrowRight size={12} /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ doctors ═══ */}
      <section className="bg-card border-y border-line mt-14">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <SectionHead eyebrow="Meet the team" title="Doctors who explain, not just prescribe" />
              <Link to="/doctors" className="btn btn-outline btn-sm shrink-0">View all {s.doctors.length} doctors</Link>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 stagger">
            {s.doctors.slice(0, 4).map((d) => <DoctorCard key={d.id} d={d} />)}
          </div>
        </div>
      </section>

      {/* ═══ packages ═══ */}
      <section className="max-w-7xl mx-auto px-4 pt-16">
        <Reveal><SectionHead eyebrow="Preventive care" title="Health packages, priced honestly" sub="Full-body checkups with same-day reports and a physician review of every result." /></Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 stagger">
          {s.packages.map((p) => (
            <div key={p.id} className={cx("card card-hover p-5 flex flex-col relative", p.popular && "border-primary ring-2 ring-primary/15")}>
              {p.popular && <span className="absolute -top-2.5 left-4 text-[10px] font-bold bg-primary text-white rounded-full px-2.5 py-0.5">MOST BOOKED</span>}
              <p className="font-display font-bold text-ink">{p.name}</p>
              <p className="text-xs text-soft">{p.forWho}</p>
              <p className="font-display font-extrabold text-3xl text-primary mt-3">₹{p.price.toLocaleString("en-IN")}</p>
              <ul className="mt-3 space-y-1.5 flex-1">
                {p.tests.slice(0, 5).map((x) => <li key={x} className="text-xs text-soft flex gap-2"><span className="text-ok font-bold">✓</span>{x}</li>)}
                {p.tests.length > 5 && <li className="text-[11px] text-faint">+ {p.tests.length - 5} more investigations</li>}
              </ul>
              <Link to="/book" className="btn btn-outline btn-sm mt-4 justify-center">Book package</Link>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ testimonials + camps ═══ */}
      <section className="bg-pine text-white mt-16 relative overflow-hidden">
        <ECG className="absolute top-6 left-0 w-full h-10 text-accent/20" />
        <div className="max-w-7xl mx-auto px-4 py-16 relative">
          <Reveal><SectionHead eyebrow="Patient voices" title="Trusted across Pusad & Vidarbha" light /></Reveal>
          <div className="grid md:grid-cols-3 gap-4 mt-8 stagger">
            {s.testimonials.slice(0, 3).map((x) => (
              <figure key={x.id} className="rounded-2xl bg-white/6 border border-white/10 p-5 hover:bg-white/10 transition-colors">
                <div className="flex gap-0.5 text-[#ffd08a]">{Array.from({ length: x.rating }).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}</div>
                <blockquote className="text-sm text-white/85 leading-relaxed mt-3">“{x.text}”</blockquote>
                <figcaption className="mt-4 text-xs font-bold text-white/70">{x.name} <span className="font-normal text-white/40">· {x.place}</span></figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-10 rounded-2xl border border-accent/30 bg-accent/10 p-5 flex flex-wrap items-center gap-4">
            <span className="w-10 h-10 rounded-xl bg-accent text-pine flex items-center justify-center"><Sparkles size={19} /></span>
            <div className="flex-1 min-w-[220px]">
              <p className="font-display font-bold">{s.camps[0]?.name}</p>
              <p className="text-xs text-white/60">{s.camps[0]?.place} · {s.camps[0]?.date}</p>
            </div>
            <a href={WA_LINK(s.settings.whatsapp, "I want to join the " + (s.camps[0]?.name ?? "health camp"))} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm"><MessageCircle size={14} /> Register on WhatsApp</a>
          </div>
        </div>
      </section>

      {/* ═══ blog + FAQ ═══ */}
      <section className="max-w-7xl mx-auto px-4 pt-16 grid lg:grid-cols-[1.5fr_1fr] gap-10">
        <div>
          <Reveal><SectionHead eyebrow="Health Blog" title="Advice from our own doctors" /></Reveal>
          <div className="grid sm:grid-cols-2 gap-4 mt-7">
            {s.blogs.slice(0, 4).map((b, i) => (
              <Reveal key={b.id} delay={i * 60}>
                <Link to={`/blog/${b.slug}`} className="card card-hover p-5 flex flex-col h-full">
                  <div className="h-24 rounded-xl mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, hsl(${b.hue} 42% 92%), hsl(${b.hue} 48% 84%))` }}>
                    <span className="font-display font-extrabold text-3xl" style={{ color: `hsl(${b.hue} 50% 34%)` }}>{b.tag.slice(0, 2)}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{b.tag} · {b.read} read</span>
                  <p className="font-display font-bold text-ink mt-1.5 leading-snug">{b.title}</p>
                  <p className="text-xs text-soft mt-2 line-clamp-2">{b.excerpt}</p>
                  <span className="mt-auto pt-3 text-[11px] text-faint">{b.author} · {fmtDateShort(b.date)}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
        <div>
          <Reveal><SectionHead eyebrow="FAQ" title="Good to know" /></Reveal>
          <div className="mt-7 space-y-2.5">
            {s.faqs.slice(0, 4).map((f) => (
              <details key={f.id} className="card p-4 group">
                <summary className="font-semibold text-sm text-ink cursor-pointer list-none flex justify-between items-center gap-3">
                  {f.q} <ChevronRight size={15} className="text-faint group-open:rotate-90 transition-transform shrink-0" />
                </summary>
                <p className="text-xs text-soft leading-relaxed mt-2.5">{f.a}</p>
              </details>
            ))}
            <Link to="/faq" className="btn btn-outline btn-sm w-full justify-center">All questions <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      {/* ═══ CTA band ═══ */}
      <section className="max-w-7xl mx-auto px-4 pt-16">
        <Reveal>
          <div className="rounded-3xl bg-primary text-white p-8 sm:p-12 relative overflow-hidden">
            <ECG className="absolute inset-x-0 bottom-4 h-12 text-white/15" />
            <div className="relative flex flex-wrap items-center gap-6 justify-between">
              <div className="max-w-xl">
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl leading-tight">Book your visit in under a minute.</h2>
                <p className="text-white/75 mt-3">Live slots, instant confirmation, and a token that moves — {s.settings.tagline}</p>
              </div>
              <div className="flex gap-3">
                <Link to="/book" className="btn btn-dark btn-lg !bg-pine hover:!bg-pine2">Book Appointment</Link>
                <a href={`tel:${s.settings.phone}`} className="btn btn-lg !bg-white/12 hover:!bg-white/20 !text-white !border-white/20 !border"><Phone size={16} /> {s.settings.phone}</a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
