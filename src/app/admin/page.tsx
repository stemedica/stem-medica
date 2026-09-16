import Link from "next/link";
import { ArrowRight, Package, Newspaper, FileText } from "lucide-react";
import { requireAdminPage } from "@/lib/auth/guard";
import { readCatalogue } from "@/lib/catalogue";
import { readPosts, formatDate } from "@/lib/post-store";
import { storageReady } from "@/lib/storage";

export default async function AdminPage() {
  await requireAdminPage();
  const [catalogueResult, postsResult] = await Promise.allSettled([readCatalogue(), readPosts()]);
  const catalogue = catalogueResult.status === "fulfilled" ? catalogueResult.value.catalogue : null;
  const posts = postsResult.status === "fulfilled" ? postsResult.value.posts : null;
  const available = storageReady();
  const stats = [
    { label: "Published products", count: catalogue?.products.filter((item) => item.published).length, href: "/admin/catalogue" },
    { label: "Categories", count: catalogue?.categories.length, href: "/admin/catalogue" },
    { label: "Published posts", count: posts?.filter((item) => item.published).length, href: "/admin/posts" },
    { label: "Draft posts", count: posts?.filter((item) => !item.published).length, href: "/admin/posts" },
  ];
  const workspaces = [
    { title: "Catalogue & categories", description: "Add equipment, organise categories and choose what appears on the website.", action: "Manage catalogue", href: "/admin/catalogue", icon: Package },
    { title: "Updates & blog", description: "Write articles, announce arrivals and publish company updates.", action: "Manage posts", href: "/admin/posts", icon: Newspaper },
  ];
  const recent = [...(posts ?? [])].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title)).slice(0, 4);
  return <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
    <header><p className="label text-steel">Your workspace</p><h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">Overview</h1></header>
    <section aria-labelledby="proforma-priority" className="mt-5 rounded-2xl bg-navy-deep p-5 text-white sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div className="max-w-xl"><div className="flex items-center gap-2 text-sm text-white/80"><FileText size={20} aria-hidden="true" /> Proformas</div><h2 id="proforma-priority" className="font-display mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Your next quotation starts here.</h2><p className="mt-3 text-sm leading-relaxed text-white/80">Create a proforma or continue a saved draft. Add equipment, enter your agreed prices and export a PDF.</p></div><Link href="/admin/proformas" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy-tint focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Open proforma builder <ArrowRight size={18} aria-hidden="true" /></Link></div>
      <p className="mt-5 border-t border-white/20 pt-4 text-xs leading-relaxed text-white/75">Manual pricing · Saved drafts available for 7 days</p>
    </section>
    {!available || !catalogue || !posts ? <div role="alert" className="mt-6 rounded-lg border border-hair bg-white p-4 text-sm leading-relaxed">{!available ? "Content storage is not configured. Connect storage before adding website content." : "Some content counts could not be loaded. Your saved content has not been changed."} <a href="/admin" className="inline-flex min-h-11 items-center font-medium text-navy underline underline-offset-4">Retry overview</a></div> : null}
    <section aria-label="Content overview" className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => <Link key={stat.label} href={stat.href} className="min-w-0 rounded-xl border border-hair bg-white p-4 transition-colors hover:border-navy/50 focus-visible:outline-2 focus-visible:outline-navy sm:p-5"><p className="text-xs leading-relaxed text-ink-soft sm:text-sm">{stat.label}</p><p className="mt-2 text-3xl font-semibold tabular-nums text-navy">{available && stat.count !== undefined ? stat.count : <span className="text-sm">Unavailable</span>}</p></Link>)}
    </section>
    <section aria-labelledby="workspaces" className="mt-8 sm:mt-10"><h2 id="workspaces" className="font-display text-xl font-semibold text-navy">Manage your website</h2><div className="mt-4 grid gap-3 lg:grid-cols-2">
      {workspaces.map(({ title, description, action, href, icon: Icon }) => <Link key={href} href={href} className="flex min-w-0 gap-4 rounded-xl border border-hair bg-white p-5 transition-colors hover:border-navy/50 focus-visible:outline-2 focus-visible:outline-navy lg:flex-col lg:p-6"><span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-navy-tint text-navy"><Icon size={22} aria-hidden="true" /></span><div className="flex min-w-0 flex-1 flex-col"><h3 className="font-display text-lg font-semibold text-navy">{title}</h3><p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{description}</p><span className="mt-4 inline-flex min-h-6 items-center gap-2 text-sm font-medium text-navy">{action}<ArrowRight size={16} aria-hidden="true" /></span></div></Link>)}
    </div></section>
    <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[1.6fr_1fr]">
      <section aria-labelledby="latest-posts"><div className="flex flex-wrap items-center justify-between gap-2"><h2 id="latest-posts" className="font-display text-xl font-semibold text-navy">Latest posts</h2><Link href="/admin/posts" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-navy">Manage posts <ArrowRight size={14} aria-hidden="true" /></Link></div><p className="mb-3 text-xs text-steel">Ordered by display date, including drafts.</p>
        <div className="divide-y divide-hair border-y border-hair">{recent.length ? recent.map((post) => <div key={post.id} className="flex min-w-0 items-start justify-between gap-3 py-4"><div className="min-w-0"><h3 className="break-words text-sm font-medium text-navy">{post.title}</h3><p className="mt-1 text-xs leading-relaxed text-steel">{post.kind} · {formatDate(post.date)}</p></div><span className="shrink-0 rounded-full bg-navy-tint px-2.5 py-1 text-xs text-navy">{post.published ? "Published" : "Draft"}</span></div>) : <div className="py-6 text-sm leading-relaxed text-ink-soft">{!available || !posts ? "Posts are unavailable right now." : "No posts yet. Start with a company introduction or your next equipment arrival."}</div>}</div>
      </section>
      <aside className="border-t border-hair pt-5 lg:border-t-0 lg:border-l lg:pl-8"><h2 className="font-display text-xl font-semibold text-navy">A few useful reminders</h2><ul className="mt-4 space-y-4 text-sm leading-relaxed text-ink-soft"><li><strong className="font-medium text-navy">You control publishing.</strong> Draft products and posts stay private until you publish and save them.</li><li><strong className="font-medium text-navy">Prices stay manual.</strong> Enter agreed prices in the proforma builder; catalogue items do not set prices.</li><li><strong className="font-medium text-navy">Proforma drafts last 7 days.</strong> Export a PDF for your own records before a saved draft expires.</li></ul></aside>
    </div>
  </main>;
}
