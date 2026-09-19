import { z } from "zod";

const requiredText = (label: string, maximum: number) => z.string().trim()
  .min(1, `${label} is required.`)
  .max(maximum, `${label} is too long.`);

export const enquiryKinds = ["quotation", "partnership"] as const;
export type EnquiryKind = (typeof enquiryKinds)[number];

export const enquirySchema = z.object({
  kind: z.enum(enquiryKinds).default("quotation"),
  facility: requiredText("Hospital or organization", 200),
  contact: requiredText("Your name", 200),
  phone: requiredText("Phone number", 80),
  email: z.string().trim().max(254, "Email is too long.").refine(
    (value) => !value || z.email().safeParse(value).success,
    "Enter a valid email address or leave it empty.",
  ),
  equipment: requiredText("Equipment needed", 500),
  quantity: z.preprocess(
    (value) => value ?? "",
    z.union([z.literal(""), z.coerce.number().int().min(1).max(100_000)]).transform((value) => value === "" ? undefined : value),
  ),
  notes: z.string().trim().max(3000, "Notes are too long."),
  website: z.string().max(0).optional().default(""),
});

export type EnquiryInput = Omit<z.infer<typeof enquirySchema>, "website">;
