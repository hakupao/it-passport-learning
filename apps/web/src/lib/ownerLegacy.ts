// D-148 / D-217 H3 — the old activation link `<any page>?owner_key=<key>` on the static site.
//
// A static page cannot set the httpOnly owner cookie, so this inline script (first thing in the
// [locale] layout's <head>) forwards the key to the Worker's activation route (lib/ownerActivation.ts)
// and comes back to the same page without the param:
//   /ja/glossary?a=1&owner_key=K#x  →  /api/owner?key=K&next=%2Fja%2Fglossary%3Fa%3D1%23x
// `window.stop()` first: the rest of the page (deferred scripts such as the Web Analytics beacon,
// images, fonts) is not fetched with the key in the page URL. `location.replace`: the URL with the
// key does not stay in the session history (the 307 from /api/owner is not a history entry either).
// The key only goes to our own origin. Pages without `owner_key` do nothing (one URL parse).
// Under `next dev` the middleware handles `?owner_key=` before any page is served.

export const OWNER_LEGACY_REDIRECT_SCRIPT =
  '(function(){try{var u=new URL(location.href),k=u.searchParams.get("owner_key");if(k===null)return;' +
  'u.searchParams.delete("owner_key");if(window.stop)window.stop();' +
  'location.replace("/api/owner?key="+encodeURIComponent(k)+"&next="+encodeURIComponent(u.pathname+u.search+u.hash))' +
  "}catch(e){}})();";
