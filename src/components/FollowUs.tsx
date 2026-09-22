"use client";

import { useEffect, useState } from "react";
import { LinkedInIcon } from "./LinkedInIcon";
import { site } from "@/lib/site";

/**
 * A quiet way to follow, parked in the corner.
 *
 * Deliberately restrained: it holds at reduced opacity, carries no badge or
 * pulse, and only widens to its label on hover or keyboard focus. It also
 * stays out of the way until the hero has been passed, so it never competes
 * with the opening screen.
 *
 * Desktop only. On a phone the call and WhatsApp bar already owns this corner,
 * and the footer carries the same link.
 */
export function FollowUs() {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={site.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Follow STEM MEDICA on LinkedIn"
      /* The resting opacity is only ever set by the branch below. Listing an
         opacity in the base string too would be a coin flip: Tailwind emits
         utilities in its own order, so the later rule wins regardless of the
         order they appear in this attribute. */
      className={`group/follow fixed bottom-6 right-6 z-40 hidden items-center gap-0 rounded-full border border-hair bg-white/85 py-2.5 pl-3 pr-3 text-navy shadow-[0_6px_24px_rgba(15,37,85,.14)] backdrop-blur-sm transition-[opacity,transform,gap,padding,background-color] duration-500 hover:gap-2.5 hover:bg-white hover:pr-5 hover:opacity-100 focus-visible:gap-2.5 focus-visible:pr-5 focus-visible:opacity-100 sm:flex ${
        past ? "pointer-events-auto translate-y-0 opacity-70" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <LinkedInIcon size={18} />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-[max-width] duration-500 group-hover/follow:max-w-[7rem] group-focus-visible/follow:max-w-[7rem]">
        Follow us
      </span>
    </a>
  );
}
