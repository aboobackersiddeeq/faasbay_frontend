/**
 * Scrolls to an element by id, accounting for the app's sticky header so the
 * target's own heading isn't left hidden underneath it. Waits a frame first
 * since callers typically trigger this right after a state update (e.g.
 * switching to the filtered catalog view) whose DOM hasn't committed yet.
 */
export function scrollToSection(ids: string | string[], extraOffset = 16) {
  const idList = Array.isArray(ids) ? ids : [ids];

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const target = idList.map((id) => document.getElementById(id)).find(Boolean);
      if (!target) return;

      const header = document.querySelector("header");
      const headerOffset = header instanceof HTMLElement ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset - extraOffset;

      window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
    });
  });
}
