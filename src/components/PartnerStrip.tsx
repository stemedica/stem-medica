import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

interface Partner {
  name: string;
  fullName: string;
  website: string;
  specialty: string;
  category: string;
  logo: ReactNode;
}

const PARTNERS: Partner[] = [
  {
    name: "Mindray",
    fullName: "Shenzhen Mindray Bio-Medical Electronics Co., Ltd.",
    website: "https://www.mindray.com",
    specialty: "Patient Monitoring, Ultrasound & Life Support",
    category: "Patient Monitoring & Ultrasound",
    logo: (
      <svg className="h-7 w-auto" viewBox="0 0 130 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Mindray logo">
        <text x="0" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="24" fontWeight="800" fill="#0A1E3F" letterSpacing="-0.5">mindra</text>
        <text x="96" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="24" fontWeight="800" fill="#0A1E3F" letterSpacing="-0.5">y</text>
        <circle cx="21" cy="6" r="3.2" fill="#E31B23" />
      </svg>
    ),
  },
  {
    name: "Ningbo David Medical",
    fullName: "Ningbo David Medical Device Co., Ltd.",
    website: "https://www.nbdavid.com",
    specialty: "Infant Incubators & Neonatal Intensive Care",
    category: "Neonatal & Pediatrics",
    logo: (
      <svg className="h-7 w-auto" viewBox="0 0 150 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Ningbo David Medical logo">
        <path d="M6 5C11 5 15 9 15 16C15 23 11 27 6 27H0V5H6ZM6 22C8.5 22 10.5 19.5 10.5 16C10.5 12.5 8.5 10 6 10H4.5V22H6Z" fill="#0066B3" />
        <path d="M3 2C7 0 11 1 13 3C10 5 6 4 3 2Z" fill="#00A0E9" />
        <text x="18" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="900" fill="#0066B3" letterSpacing="1">AVID</text>
        <text x="75" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="13" fontWeight="700" fill="#64748B">MEDICAL</text>
      </svg>
    ),
  },
  {
    name: "Zoncare Medical",
    fullName: "Wuhan Zoncare Bio-medical Electronics Co., Ltd.",
    website: "https://www.zoncareglobal.com",
    specialty: "Color Doppler, Ultrasound & Electrocardiographs",
    category: "Imaging & Cardiology",
    logo: (
      <svg className="h-7 w-auto" viewBox="0 0 140 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Zoncare logo">
        <rect x="0" y="6" width="20" height="20" rx="5" fill="#009579" />
        <path d="M10 9V23M3 16H17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <text x="26" y="23" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="800" fill="#0A1E3F" letterSpacing="-0.5">zoncare</text>
      </svg>
    ),
  },
  {
    name: "BPL Medical Technologies",
    fullName: "BPL Medical Technologies Private Limited",
    website: "https://www.bplmedicaltechnologies.com",
    specialty: "Cardiology, Critical Care & Surgical Solutions",
    category: "Critical Care & Cardiology",
    logo: (
      <svg className="h-7 w-auto" viewBox="0 0 155 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="BPL Medical Technologies logo">
        <rect x="0" y="4" width="46" height="24" rx="4" fill="#C41230" />
        <text x="6" y="22" fontFamily="system-ui, -apple-system, sans-serif" fontSize="17" fontWeight="900" fill="#FFFFFF" letterSpacing="1">BPL</text>
        <text x="52" y="16" fontFamily="system-ui, -apple-system, sans-serif" fontSize="13" fontWeight="800" fill="#0A1E3F">MEDICAL</text>
        <text x="52" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontSize="9" fontWeight="700" fill="#64748B" letterSpacing="0.5">TECHNOLOGIES</text>
      </svg>
    ),
  },
  {
    name: "Schiller AG",
    fullName: "Schiller AG Switzerland",
    website: "https://www.schiller.ch",
    specialty: "Cardiopulmonary Diagnostics, Defibrillation & ECG",
    category: "Cardiopulmonary Diagnostics",
    logo: (
      <svg className="h-7 w-auto" viewBox="0 0 140 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Schiller AG logo">
        <rect x="0" y="5" width="22" height="22" rx="3" fill="#D52B1E" />
        <path d="M11 9V19M6 14H16" stroke="white" strokeWidth="3" strokeLinecap="square" />
        <text x="28" y="23" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="900" fill="#002B49" letterSpacing="1">SCHILLER</text>
      </svg>
    ),
  },
  {
    name: "Creative Medical",
    fullName: "Shenzhen Creative Industry Co., Ltd.",
    website: "https://www.creative-sz.com",
    specialty: "Patient Monitors, Pulse Oximeters & Capnography",
    category: "Patient Monitoring & Oximetry",
    logo: (
      <svg className="h-7 w-auto" viewBox="0 0 155 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Creative Medical logo">
        <circle cx="12" cy="16" r="10" stroke="#0066B3" strokeWidth="2.5" fill="none" />
        <path d="M7 16H10L12 11L14 21L16 16H17" stroke="#F15A24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="28" y="22" fontFamily="system-ui, -apple-system, sans-serif" fontSize="17" fontWeight="800" fill="#0066B3">Creative</text>
        <text x="98" y="22" fontFamily="system-ui, -apple-system, sans-serif" fontSize="13" fontWeight="600" fill="#64748B">Medical</text>
      </svg>
    ),
  },
  {
    name: "Yuwell Medical",
    fullName: "Jiangsu Yuyue Medical Equipment & Supply Co., Ltd.",
    website: "https://www.yuwell.com/en",
    specialty: "Respiratory Support, Oxygen & Diagnostic Equipment",
    category: "Respiratory & Diagnostics",
    logo: (
      <svg className="h-7 w-auto" viewBox="0 0 130 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Yuwell logo">
        <rect x="0" y="4" width="24" height="24" rx="12" fill="#E60012" />
        <path d="M7 12L12 17L17 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="30" y="23" fontFamily="system-ui, -apple-system, sans-serif" fontSize="21" fontWeight="800" fill="#E60012" letterSpacing="-0.5">yuwell</text>
      </svg>
    ),
  },
  {
    name: "B&E Bio-Technology",
    fullName: "B&E Bio-Technology Co., Ltd.",
    website: "http://www.besic.com",
    specialty: "Clinical Chemistry, Electrolytes & Blood Gas Analysers",
    category: "Laboratory Diagnostics",
    logo: (
      <svg className="h-7 w-auto" viewBox="0 0 160 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="B&E Bio-Technology logo">
        <rect x="0" y="5" width="22" height="22" rx="4" fill="#0A2555" />
        <text x="3" y="21" fontFamily="system-ui, -apple-system, sans-serif" fontSize="12" fontWeight="900" fill="#FFFFFF">&amp;</text>
        <text x="28" y="22" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="900" fill="#0A2555" letterSpacing="0.5">B&amp;E</text>
        <text x="68" y="22" fontFamily="system-ui, -apple-system, sans-serif" fontSize="12" fontWeight="700" fill="#64748B">Bio-Technology</text>
      </svg>
    ),
  },
  {
    name: "Angell Technology",
    fullName: "Shenzhen Angell Technology Co., Ltd.",
    website: "https://en.szangell.com",
    specialty: "Digital Radiography (DR), Dynamic DR & X-Ray Systems",
    category: "Diagnostic Imaging & DR",
    logo: (
      <svg className="h-7 w-auto" viewBox="0 0 155 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Angell Technology logo">
        <path d="M2 20C6 10 16 6 22 6C20 12 16 18 10 21C6 23 3 22 2 20Z" fill="#0077C8" />
        <circle cx="8" cy="11" r="2.5" fill="#E31B23" />
        <text x="28" y="22" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="800" fill="#0077C8" letterSpacing="0.5">Angell</text>
        <text x="82" y="22" fontFamily="system-ui, -apple-system, sans-serif" fontSize="11" fontWeight="700" fill="#64748B">Technology</text>
      </svg>
    ),
  },
  {
    name: "Biolight",
    fullName: "Guangdong Biolight Meditech Co., Ltd.",
    website: "https://global.blt.com.cn",
    specialty: "Patient Monitoring, Hemodialysis & Critical Care",
    category: "Monitoring & Hemodialysis",
    logo: (
      <svg className="h-7 w-auto" viewBox="0 0 145 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Biolight logo">
        <rect x="0" y="5" width="22" height="22" rx="6" fill="#005BAC" />
        <path d="M5 16H17M11 10V22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <text x="28" y="22" fontFamily="system-ui, -apple-system, sans-serif" fontSize="19" fontWeight="800" fill="#005BAC" letterSpacing="0.5">BIOLIGHT</text>
      </svg>
    ),
  },
  {
    name: "Dawei Medical",
    fullName: "Dawei Medical (Jiangsu) Co., Ltd.",
    website: "https://www.daweimedical.com",
    specialty: "Digital Ultrasound Systems & Color Doppler",
    category: "Diagnostic Ultrasound",
    logo: (
      <svg className="h-7 w-auto" viewBox="0 0 155 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Dawei Medical logo">
        <rect x="0" y="5" width="24" height="22" rx="4" fill="#0080C6" />
        <path d="M4 16C8 9 16 9 20 16C16 23 8 23 4 16Z" fill="white" />
        <circle cx="12" cy="16" r="2.5" fill="#0080C6" />
        <text x="30" y="22" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="900" fill="#0B2545" letterSpacing="0.5">DAWEI</text>
        <text x="96" y="22" fontFamily="system-ui, -apple-system, sans-serif" fontSize="12" fontWeight="700" fill="#64748B">Medical</text>
      </svg>
    ),
  },
];

export function PartnerStrip() {
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
              className="font-display wdth-w mt-3 max-w-[20ch] text-[clamp(2.2rem,4.4vw,3.6rem)] font-semibold leading-[1.04] tracking-[-.035em] text-navy text-balance"
            >
              Our International Partners<span className="text-scarlet">.</span>
            </h2>
          </div>
          <p className="max-w-[50ch] text-base leading-relaxed text-ink-soft">
            Direct collaboration with premier global medical manufacturers — guaranteeing genuine equipment, factory warranties, and certified biomedical technical support across Ethiopia.
          </p>
        </div>
      </div>

      {/* Marquee Carousel Track */}
      <div className="marquee-mask relative mt-8 overflow-hidden py-3 sm:mt-12 lg:mt-16">
        <div className="animate-partner-marquee flex shrink-0 items-center gap-3 sm:gap-6 lg:gap-8">
          {/* First loop */}
          {PARTNERS.map((partner) => (
            <a
              key={`p1-${partner.name}`}
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit official website of ${partner.name} (${partner.specialty}) - opens in a new tab`}
              className="group/card relative flex min-w-[145px] xs:min-w-[160px] flex-col justify-between rounded-xl sm:rounded-2xl border border-hair bg-white p-3.5 sm:p-5 lg:p-6 shadow-[0_4px_16px_rgba(15,37,85,0.04)] transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-1.5 hover:border-scarlet/40 hover:shadow-[0_16px_36px_rgba(196,55,46,0.12)] sm:min-w-[280px] lg:min-w-[330px]"
            >
              {/* Header row: Logo & Click indicator */}
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                <div className="shrink-0 transition-transform duration-300 group-hover/card:scale-105 [&>svg]:h-5 sm:[&>svg]:h-7 [&>svg]:w-auto max-w-[100px] sm:max-w-none overflow-hidden">
                  {partner.logo}
                </div>
                <span
                  aria-hidden="true"
                  className="flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy transition-all duration-300 group-hover/card:bg-scarlet group-hover/card:text-white"
                >
                  <ArrowUpRight size={13} className="sm:hidden" />
                  <ArrowUpRight size={16} className="hidden sm:block" />
                </span>
              </div>

              {/* Body: Full name and Specialty */}
              <div className="mt-2.5 sm:mt-5">
                <h3 className="font-display text-[13px] sm:text-base lg:text-lg font-bold tracking-tight text-navy transition-colors duration-300 group-hover/card:text-scarlet truncate sm:whitespace-normal">
                  {partner.name}
                </h3>
                <p className="mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2 text-[10px] leading-snug sm:text-xs lg:text-[13px] text-ink-soft">
                  {partner.specialty}
                </p>
              </div>

              {/* Footer row: Category tag & link indicator */}
              <div className="mt-2.5 sm:mt-5 flex items-center justify-between border-t border-hair pt-2 sm:pt-3 text-[10px] sm:text-[11px] font-semibold text-steel">
                <span className="truncate rounded bg-paper px-1.5 py-0.5 text-navy max-w-[95px] sm:max-w-none text-[9px] sm:text-[11px]">
                  {partner.category}
                </span>
                <span className="hidden sm:inline text-scarlet opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                  Visit website →
                </span>
              </div>

              {/* Bottom active hover accent bar */}
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-0.5 w-0 bg-scarlet transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] group-hover/card:w-full"
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
              aria-label={`Visit official website of ${partner.name} (${partner.specialty}) - opens in a new tab`}
              aria-hidden="true"
              tabIndex={-1}
              className="group/card relative flex min-w-[145px] xs:min-w-[160px] flex-col justify-between rounded-xl sm:rounded-2xl border border-hair bg-white p-3.5 sm:p-5 lg:p-6 shadow-[0_4px_16px_rgba(15,37,85,0.04)] transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-1.5 hover:border-scarlet/40 hover:shadow-[0_16px_36px_rgba(196,55,46,0.12)] sm:min-w-[280px] lg:min-w-[330px]"
            >
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                <div className="shrink-0 transition-transform duration-300 group-hover/card:scale-105 [&>svg]:h-5 sm:[&>svg]:h-7 [&>svg]:w-auto max-w-[100px] sm:max-w-none overflow-hidden">
                  {partner.logo}
                </div>
                <span
                  aria-hidden="true"
                  className="flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy transition-all duration-300 group-hover/card:bg-scarlet group-hover/card:text-white"
                >
                  <ArrowUpRight size={13} className="sm:hidden" />
                  <ArrowUpRight size={16} className="hidden sm:block" />
                </span>
              </div>

              <div className="mt-2.5 sm:mt-5">
                <h3 className="font-display text-[13px] sm:text-base lg:text-lg font-bold tracking-tight text-navy transition-colors duration-300 group-hover/card:text-scarlet truncate sm:whitespace-normal">
                  {partner.name}
                </h3>
                <p className="mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2 text-[10px] leading-snug sm:text-xs lg:text-[13px] text-ink-soft">
                  {partner.specialty}
                </p>
              </div>

              <div className="mt-2.5 sm:mt-5 flex items-center justify-between border-t border-hair pt-2 sm:pt-3 text-[10px] sm:text-[11px] font-semibold text-steel">
                <span className="truncate rounded bg-paper px-1.5 py-0.5 text-navy max-w-[95px] sm:max-w-none text-[9px] sm:text-[11px]">
                  {partner.category}
                </span>
                <span className="hidden sm:inline text-scarlet opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                  Visit website →
                </span>
              </div>

              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-0.5 w-0 bg-scarlet transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] group-hover/card:w-full"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
