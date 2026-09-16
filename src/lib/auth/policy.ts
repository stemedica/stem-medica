export function approvedAdmin(email: string, allowlist = process.env.ADMIN_EMAILS ?? "") {
  return allowlist.split(",").map((entry) => entry.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());
}
export function hasAdminAccess(value: { user: { email: string; twoFactorEnabled?: boolean | null }; session: { mfaVerified?: boolean; expiresAt: Date | string } } | null, allowlist?: string) {
  return !!value && approvedAdmin(value.user.email, allowlist)
    && (value.user.twoFactorEnabled !== true || value.session.mfaVerified === true)
    && new Date(value.session.expiresAt).getTime() > Date.now();
}
