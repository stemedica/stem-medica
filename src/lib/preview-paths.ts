/** Database media references stay portable; only their public URL is mounted. */
export function publicMediaUrl(src: string) {
  return src.startsWith("/media/") ? `/test${src}` : src;
}
