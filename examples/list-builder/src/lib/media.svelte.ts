/**
 * Reactive viewport helper. `viewport.isMobile` is true below the builder's
 * desktop breakpoint (1024px) and updates live as the window crosses it.
 *
 * Exposed as a getter on a singleton object rather than a bare `export let`
 * because a reassigned exported binding does not stay reactive across the
 * module boundary — reading through the getter does. The `matchMedia` calls
 * are guarded so the jsdom unit tests (no `matchMedia`) and any SSR context
 * fall back to `false` instead of throwing, and a single module-level
 * listener (live for the app's lifetime) keeps the value in sync.
 */
const MOBILE_QUERY = "(max-width: 1023px)";

const mql =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(MOBILE_QUERY)
    : null;

let mobile = $state(mql?.matches ?? false);

mql?.addEventListener("change", (e) => {
  mobile = e.matches;
});

export const viewport = {
  get isMobile(): boolean {
    return mobile;
  },
};
