import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { FOOTER_GROUPS, MOBILE_NAV, PRIMARY_NAV } from "./navigation";

describe("free-first navigation", () => {
  test("Plans is absent from all three navigation collections", () => {
    const groups: ReadonlyArray<ReadonlyArray<{ to: string }>> = [
      PRIMARY_NAV,
      MOBILE_NAV,
      ...FOOTER_GROUPS.map((group) => group.links),
    ];
    for (const links of groups) {
      assert.equal(links.some((link) => link.to === "/pricing"), false);
    }
  });

  test("creator, client discovery and organization destinations remain available", () => {
    for (const destination of ["/creators", "/discover", "/organizations"]) {
      assert.equal(PRIMARY_NAV.some((link) => link.to === destination), true);
      assert.equal(MOBILE_NAV.some((link) => link.to === destination), true);
    }
  });
});