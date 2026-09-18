type Result<T = Record<string, unknown>> = { data: T | null; error: { status: number; message: string } | null };
async function post<T>(path: string, body: object = {}): Promise<Result<T>> {
  try {
    const response = await fetch(`/api/auth${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    return response.ok ? { data, error: null } : { data: null, error: { status: response.status, message: data.message || "Request failed" } };
  } catch { return { data: null, error: { status: 0, message: "Connection failed" } }; }
}
export const authClient = {
  signIn: { email: (body: { email: string; password: string }) => post("/sign-in/email", body) },
  signOut: () => post("/sign-out"),
};
