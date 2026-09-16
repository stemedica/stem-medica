/** Small, safe text format shared by the CMS preview and published articles. */
export function PostBody({ body }: { body: string }) {
  return <div className="space-y-6 break-words text-base leading-[1.85] text-ink-soft sm:text-lg">
    {body.split(/\r?\n\s*\r?\n/).filter(Boolean).map((block, index) => {
      const lines = block.trim().split(/\r?\n/);
      if (lines.length === 1 && /^#{2,3} /.test(lines[0])) {
        const Heading = lines[0].startsWith("### ") ? "h3" : "h2";
        return <Heading id={`section-${index}`} key={index} className={`font-display pt-4 font-semibold leading-snug text-navy ${Heading === "h3" ? "text-xl" : "text-2xl"}`}>{lines[0].replace(/^#{2,3} /, "")}</Heading>;
      }
      if (lines.every((line) => /^- /.test(line))) return <ul key={index} className="list-disc space-y-2 pl-6 marker:text-navy">{lines.map((line, i) => <li key={i}>{line.slice(2)}</li>)}</ul>;
      return <p key={index} className="whitespace-pre-wrap">{block}</p>;
    })}
  </div>;
}
