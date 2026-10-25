// Cloudinary serves any resize/format on the fly when the transformation is part of
// the URL, so product photos are requested at the size they are displayed at
// (and as AVIF/WebP where the browser supports it) instead of the full 1000px upload.
// URLs from any other host are returned untouched.

const UPLOAD_SEGMENT = "/image/upload/";

function isCloudinary(url: string | undefined): url is string {
  return typeof url === "string" && url.includes("res.cloudinary.com") && url.includes(UPLOAD_SEGMENT);
}

/** Image URL resized to `width` CSS pixels, auto format & quality. */
export function cldUrl(url: string | undefined, width: number): string {
  if (!isCloudinary(url)) return url || "";
  return url.replace(UPLOAD_SEGMENT, `${UPLOAD_SEGMENT}f_auto,q_auto,c_limit,w_${width}/`);
}

/** `srcSet` covering the given widths, or undefined for non-Cloudinary images. */
export function cldSrcSet(url: string | undefined, widths: number[]): string | undefined {
  if (!isCloudinary(url)) return undefined;
  return widths.map((w) => `${cldUrl(url, w)} ${w}w`).join(", ");
}
