"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

interface Partner {
  slug: string;
  name: string;
  fullName: string;
  website: string;
  specialty: string;
  category: string;
  logo: ReactNode;
}

const PARTNERS: Partner[] = [
  {
    slug: "angell",
    name: "Angell Technology",
    fullName: "Shenzhen Angell Technology Co., Ltd.",
    website: "https://en.szangell.com",
    specialty: "Digital Radiography (DR), Dynamic DR & X-Ray Systems",
    category: "Diagnostic Imaging & DR",
    logo: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 110 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet" aria-label="Angell Technology">
        <text x="0" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="800" fill="#0077C8">Angell<tspan fontSize="10.5" fontWeight="700" fill="#64748B" dx="3">Technology</tspan></text>
      </svg>
    ),
  },
  {
    slug: "david",
    name: "Ningbo David Medical",
    fullName: "Ningbo David Medical Device Co., Ltd.",
    website: "https://www.nbdavid.com",
    specialty: "Infant Incubators & Neonatal Intensive Care",
    category: "Neonatal & Pediatrics",
    logo: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 105 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet" aria-label="David Medical">
        <text x="0" y="15" fontFamily="system-ui, -apple-system, sans-serif" fontSize="14" fontWeight="900" fill="#005BAC" letterSpacing="0.8">DAVID</text>
        <text x="0" y="23" fontFamily="system-ui, -apple-system, sans-serif" fontSize="7.5" fontWeight="700" fill="#64748B" letterSpacing="1.2">MEDICAL</text>
      </svg>
    ),
  },
  {
    slug: "zoncare",
    name: "Zoncare Medical",
    fullName: "Wuhan Zoncare Bio-medical Electronics Co., Ltd.",
    website: "https://www.zoncareglobal.com",
    specialty: "Color Doppler, Ultrasound & Electrocardiographs",
    category: "Imaging & Cardiology",
    logo: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 95 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet" aria-label="Zoncare">
        <text x="0" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontSize="16" fontWeight="900" fill="#00967A" letterSpacing="0.5">ZONCARE</text>
      </svg>
    ),
  },
  {
    slug: "bpl",
    name: "BPL Medical Technologies",
    fullName: "BPL Medical Technologies Private Limited",
    website: "https://www.bplmedicaltechnologies.com",
    specialty: "Cardiology, Critical Care & Surgical Solutions",
    category: "Critical Care & Cardiology",
    logo: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 115 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet" aria-label="BPL Medical Technologies">
        <text x="0" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontSize="17" fontWeight="900" fill="#C41230" letterSpacing="0.8">BPL</text>
        <text x="40" y="12" fontFamily="system-ui, -apple-system, sans-serif" fontSize="9" fontWeight="800" fill="#0A1E3F" letterSpacing="0.4">MEDICAL</text>
        <text x="40" y="21" fontFamily="system-ui, -apple-system, sans-serif" fontSize="6.5" fontWeight="700" fill="#64748B" letterSpacing="0.6">TECHNOLOGIES</text>
      </svg>
    ),
  },
  {
    slug: "schiller",
    name: "Schiller AG",
    fullName: "Schiller AG Switzerland",
    website: "https://www.schiller.ch",
    specialty: "Cardiopulmonary Diagnostics, Defibrillation & ECG",
    category: "Cardiopulmonary Diagnostics",
    logo: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 95 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet" aria-label="Schiller">
        <text x="0" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontSize="16" fontWeight="900" fill="#002B49" letterSpacing="0.8">SCHILLER</text>
      </svg>
    ),
  },
  {
    slug: "creative",
    name: "Creative Medical",
    fullName: "Shenzhen Creative Industry Co., Ltd.",
    website: "https://www.creative-sz.com",
    specialty: "Patient Monitors, Pulse Oximeters & Capnography",
    category: "Patient Monitoring & Oximetry",
    logo: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 110 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet" aria-label="Creative Medical">
        <text x="0" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="800" fill="#0066B3">Creative<tspan fontSize="11" fontWeight="600" fill="#64748B" dx="3">Medical</tspan></text>
      </svg>
    ),
  },
  {
    slug: "yuwell",
    name: "Yuwell Medical",
    fullName: "Jiangsu Yuyue Medical Equipment & Supply Co., Ltd.",
    website: "https://www.yuwell.com/en",
    specialty: "Respiratory Support, Oxygen & Diagnostic Equipment",
    category: "Respiratory & Diagnostics",
    logo: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 75 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet" aria-label="Yuwell">
        <text x="0" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="800" fill="#E60012" letterSpacing="-0.5">yuwell</text>
      </svg>
    ),
  },
  {
    slug: "besic",
    name: "B&E Bio-Technology",
    fullName: "B&E Bio-Technology Co., Ltd.",
    website: "http://www.besic.com",
    specialty: "Clinical Chemistry, Electrolytes & Blood Gas Analysers",
    category: "Laboratory Diagnostics",
    logo: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 105 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet" aria-label="B&E Bio-Technology">
        <text x="0" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="900" fill="#0A2555">B&amp;E<tspan fontSize="10.5" fontWeight="700" fill="#64748B" dx="3">Bio-Tech</tspan></text>
      </svg>
    ),
  },
  {
    slug: "biolight",
    name: "Biolight",
    fullName: "Guangdong Biolight Meditech Co., Ltd.",
    website: "https://global.blt.com.cn",
    specialty: "Patient Monitoring, Hemodialysis & Critical Care",
    category: "Monitoring & Hemodialysis",
    logo: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 90 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet" aria-label="Biolight">
        <text x="0" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontSize="16" fontWeight="800" fill="#005BAC" letterSpacing="0.6">BIOLIGHT</text>
      </svg>
    ),
  },
  {
    slug: "dawei",
    name: "Dawei Medical",
    fullName: "Dawei Medical (Jiangsu) Co., Ltd.",
    website: "https://www.daweimedical.com",
    specialty: "Digital Ultrasound Systems & Color Doppler",
    category: "Diagnostic Ultrasound",
    logo: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet" aria-label="Dawei Medical">
        <text x="0" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="900" fill="#0B2545" letterSpacing="0.4">DAWEI<tspan fontSize="10.5" fontWeight="700" fill="#64748B" dx="3">Medical</tspan></text>
      </svg>
    ),
  },
];

export function PartnerStrip() {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasDragged = useRef(false);
  const isInteracting = useRef(false);
  const resumeTimeout = useRef<NodeJS.Timeout | null>(null);

  const scheduleResume = useCallback(() => {
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    resumeTimeout.current = setTimeout(() => {
      isInteracting.current = false;
    }, 1800);
  }, []);

  const pauseAutoScroll = useCallback(() => {
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    isInteracting.current = true;
  }, []);

  // Continuous auto-scrolling
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let animId: number;
    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = Math.min(32, time - lastTime);
      lastTime = time;

      if (!isInteracting.current && !isDragging.current && el) {
        el.scrollLeft += 0.045 * delta;
        const half = el.scrollWidth / 2;
        if (half > 0 && el.scrollLeft >= half) {
          el.scrollLeft -= half;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    };
  }, []);

  // Seamless infinite loop when scrolling in either direction
  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const half = el.scrollWidth / 2;
    if (half <= 0) return;

    if (el.scrollLeft >= half) {
      el.scrollLeft -= half;
    } else if (el.scrollLeft <= 0) {
      el.scrollLeft += half;
    }
  }, []);

  // Pointer / Mouse drag handlers
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.clientX;
    scrollLeftStart.current = trackRef.current?.scrollLeft || 0;
    pauseAutoScroll();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !trackRef.current) return;
    const dist = e.clientX - startX.current;
    if (Math.abs(dist) > 5) {
      hasDragged.current = true;
    }
    trackRef.current.scrollLeft = scrollLeftStart.current - dist;
  };

  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    scheduleResume();
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section
      id="partners"
      aria-labelledby="partners-heading"
      className="relative isolate overflow-hidden border-b border-hair bg-paper py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        {/* Section highlight header */}
        <div className="reveal flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-scarlet">
              <span className="h-2 w-2 rounded-full bg-scarlet animate-pulse" aria-hidden="true" />
              Direct Factory Partnerships
            </div>
            <h2
              id="partners-heading"
              className="font-display wdth-w mt-3 max-w-[20ch] text-[clamp(2.2rem,4.4vw,3.6rem)] font-bold leading-[1.04] tracking-[-.035em] text-navy text-balance"
            >
              Our International Partners<span className="text-scarlet">.</span>
            </h2>
          </div>
          <p className="max-w-[50ch] text-base leading-relaxed text-ink-soft">
            Direct collaboration with premier global medical manufacturers — guaranteeing genuine equipment, factory warranties, and certified biomedical technical support across Ethiopia.
          </p>
        </div>
      </div>

      {/* Interactive Marquee Carousel Track */}
      <div
        className="relative mt-8 py-3 sm:mt-12 lg:mt-16"
        onMouseEnter={pauseAutoScroll}
        onMouseLeave={scheduleResume}
      >
        <div
          ref={trackRef}
          onScroll={handleScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onTouchStart={pauseAutoScroll}
          onTouchEnd={scheduleResume}
          className="marquee-mask flex cursor-grab active:cursor-grabbing overflow-x-auto select-none py-3 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain touch-pan-x"
        >
          <div className="flex shrink-0 items-center gap-3 sm:gap-6 lg:gap-8 pr-3 sm:pr-6 lg:pr-8">
            {/* First loop */}
            {PARTNERS.map((partner) => (
              <a
                key={`p1-${partner.name}`}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                draggable={false}
                aria-label={`Visit official website of ${partner.name} (${partner.specialty}) - opens in a new tab`}
                className="group/card relative flex min-w-[155px] xs:min-w-[170px] flex-col justify-between rounded-2xl border border-white/10 bg-navy p-4 sm:p-5 lg:p-6 text-white shadow-[0_4px_20px_rgba(15,37,85,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-scarlet/40 hover:shadow-[0_18px_36px_rgba(15,37,85,0.18)] sm:min-w-[290px] lg:min-w-[340px]"
              >
                {/* Header row: Inset white logo plate & link indicator */}
                <div className="flex items-center justify-between gap-2 sm:gap-3 pointer-events-none">
                  <div className="flex items-center gap-2 sm:gap-2.5 rounded-xl bg-white px-2.5 py-1.5 shadow-sm transition-transform duration-300 group-hover/card:scale-105">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/partners/${partner.slug}.png`}
                      alt=""
                      aria-hidden="true"
                      width={22}
                      height={22}
                      draggable={false}
                      className="size-5 sm:size-5.5 object-contain pointer-events-none shrink-0"
                    />
                    <div className="shrink-0 [&>svg]:h-[18px] sm:[&>svg]:h-5 [&>svg]:w-auto max-w-[110px] xs:max-w-[125px] sm:max-w-none">
                      {partner.logo}
                    </div>
                  </div>
                  <span
                    aria-hidden="true"
                    className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white shadow-2xs transition-all duration-300 group-hover/card:bg-scarlet group-hover/card:scale-105"
                  >
                    <ArrowUpRight size={13} className="sm:hidden" />
                    <ArrowUpRight size={15} className="hidden sm:block" />
                  </span>
                </div>

                {/* Body: Full name and Specialty */}
                <div className="mt-3.5 sm:mt-5 pointer-events-none">
                  <h3 className="font-display text-[13.5px] sm:text-base lg:text-[17px] font-bold tracking-tight text-white transition-colors duration-300 truncate sm:whitespace-normal">
                    {partner.name}
                  </h3>
                  <p className="mt-1 line-clamp-1 sm:line-clamp-2 text-[10.5px] leading-relaxed sm:text-xs lg:text-[13px] text-slate-300">
                    {partner.specialty}
                  </p>
                </div>

                {/* Footer row: Category tag & link indicator */}
                <div className="mt-3.5 sm:mt-5 flex items-center justify-between border-t border-white/10 pt-2.5 sm:pt-3 text-[10px] sm:text-[11px] font-semibold pointer-events-none">
                  <span className="truncate rounded-md border border-white/10 bg-white/10 px-2 py-0.5 font-medium text-slate-200 max-w-[105px] sm:max-w-none text-[9.5px] sm:text-[11px]">
                    {partner.category}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 font-bold text-scarlet opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                    Visit website
                    <ArrowUpRight size={12} className="transition-transform group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
                  </span>
                </div>

                {/* Bottom active hover accent bar */}
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-[2.5px] w-0 bg-scarlet transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] group-hover/card:w-full"
                />
              </a>
            ))}

            {/* Seamless duplicate loop for infinite flow */}
            {PARTNERS.map((partner) => (
              <a
                key={`p2-${partner.name}`}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                draggable={false}
                aria-label={`Visit official website of ${partner.name} (${partner.specialty}) - opens in a new tab`}
                aria-hidden="true"
                tabIndex={-1}
                className="group/card relative flex min-w-[155px] xs:min-w-[170px] flex-col justify-between rounded-2xl border border-white/10 bg-navy p-4 sm:p-5 lg:p-6 text-white shadow-[0_4px_20px_rgba(15,37,85,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-scarlet/40 hover:shadow-[0_18px_36px_rgba(15,37,85,0.18)] sm:min-w-[290px] lg:min-w-[340px]"
              >
                {/* Header row: Inset white logo plate & link indicator */}
                <div className="flex items-center justify-between gap-2 sm:gap-3 pointer-events-none">
                  <div className="flex items-center gap-2 sm:gap-2.5 rounded-xl bg-white px-2.5 py-1.5 shadow-sm transition-transform duration-300 group-hover/card:scale-105">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/partners/${partner.slug}.png`}
                      alt=""
                      aria-hidden="true"
                      width={22}
                      height={22}
                      draggable={false}
                      className="size-5 sm:size-5.5 object-contain pointer-events-none shrink-0"
                    />
                    <div className="shrink-0 [&>svg]:h-[18px] sm:[&>svg]:h-5 [&>svg]:w-auto max-w-[110px] xs:max-w-[125px] sm:max-w-none">
                      {partner.logo}
                    </div>
                  </div>
                  <span
                    aria-hidden="true"
                    className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white shadow-2xs transition-all duration-300 group-hover/card:bg-scarlet group-hover/card:scale-105"
                  >
                    <ArrowUpRight size={13} className="sm:hidden" />
                    <ArrowUpRight size={15} className="hidden sm:block" />
                  </span>
                </div>

                <div className="mt-3.5 sm:mt-5 pointer-events-none">
                  <h3 className="font-display text-[13.5px] sm:text-base lg:text-[17px] font-bold tracking-tight text-white transition-colors duration-300 truncate sm:whitespace-normal">
                    {partner.name}
                  </h3>
                  <p className="mt-1 line-clamp-1 sm:line-clamp-2 text-[10.5px] leading-relaxed sm:text-xs lg:text-[13px] text-slate-300">
                    {partner.specialty}
                  </p>
                </div>

                <div className="mt-3.5 sm:mt-5 flex items-center justify-between border-t border-white/10 pt-2.5 sm:pt-3 text-[10px] sm:text-[11px] font-semibold pointer-events-none">
                  <span className="truncate rounded-md border border-white/10 bg-white/10 px-2 py-0.5 font-medium text-slate-200 max-w-[105px] sm:max-w-none text-[9.5px] sm:text-[11px]">
                    {partner.category}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 font-bold text-scarlet opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                    Visit website
                    <ArrowUpRight size={12} className="transition-transform group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
                  </span>
                </div>

                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-[2.5px] w-0 bg-scarlet transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] group-hover/card:w-full"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
