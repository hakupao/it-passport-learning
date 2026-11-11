// H1-1 (D-217) — the owner flag moved from the server cookie read to the browser: useOwner() reads the
// readable hint cookie the middleware sets next to itp_owner. The parse is pinned here; the hook is
// null under SSR (and on the first client render, so hydration matches the server HTML).
import { describe, expect, it } from "vitest";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { hasOwnerHint, useOwner } from "../useOwner";

describe("hasOwnerHint (document.cookie parse)", () => {
  it("true only for itp_owner_hint=1", () => {
    expect(hasOwnerHint("itp_owner_hint=1")).toBe(true);
    expect(hasOwnerHint("a=b; itp_owner_hint=1; c=d")).toBe(true);
    expect(hasOwnerHint("a=b;itp_owner_hint=1")).toBe(true);
  });

  it("false for no cookie, another value, or a name that only contains / prefixes it", () => {
    expect(hasOwnerHint("")).toBe(false);
    expect(hasOwnerHint("itp_owner=abc")).toBe(false);
    expect(hasOwnerHint("itp_owner_hint=0")).toBe(false);
    expect(hasOwnerHint("itp_owner_hint=")).toBe(false);
    expect(hasOwnerHint("itp_owner_hint=11")).toBe(false);
    expect(hasOwnerHint("xitp_owner_hint=1")).toBe(false);
    expect(hasOwnerHint("itp_owner_hintx=1")).toBe(false);
  });
});

describe("useOwner (SSR)", () => {
  it("is null on the server (not settled yet)", () => {
    function Shows(): React.ReactElement {
      return h("b", null, String(useOwner()));
    }
    expect(renderToStaticMarkup(h(Shows))).toBe("<b>null</b>");
  });
});
