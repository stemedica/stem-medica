/**
 * "Update on what's to come, new order" from the client brief: arrivals,
 * incoming shipments and completed installations.
 *
 * Status and titles are structural; everything else is LOREM placeholder.
 * Design data only, nothing reads this at runtime beyond the v2 mockups.
 */
export type UpdateStatus = "Arrived" | "In transit" | "Installed" | "On order";

export type Update = {
  id: string;
  status: UpdateStatus;
  title: string;
  note: string;
  eta: string;
};

export const updates: Update[] = [
  { id: "u1", status: "Arrived", title: "Lorem ipsum dolor sit",
    note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", eta: "Sep 2026" },
  { id: "u2", status: "In transit", title: "Consectetur adipiscing elit",
    note: "Ut enim ad minim veniam, quis nostrud exercitation ullamco.", eta: "Oct 2026" },
  { id: "u3", status: "On order", title: "Sed do eiusmod tempor",
    note: "Duis aute irure dolor in reprehenderit in voluptate velit.", eta: "Nov 2026" },
  { id: "u4", status: "Installed", title: "Incididunt ut labore",
    note: "Excepteur sint occaecat cupidatat non proident, sunt in culpa.", eta: "Aug 2026" },
];

export const statusTone: Record<UpdateStatus, string> = {
  Arrived: "bg-navy text-white",
  "In transit": "bg-scarlet text-white",
  "On order": "bg-navy-tint text-navy",
  Installed: "bg-ink text-white",
};
