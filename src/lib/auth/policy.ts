export function hasAdminAccess(value: { user: { email: string }; session: { expiresAt: Date | string } } | null) {
  return !!value && new Date(value.session.expiresAt).getTime() > Date.now();
}
