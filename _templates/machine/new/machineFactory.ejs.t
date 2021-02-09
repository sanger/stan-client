---
inject: true
to: src/lib/factories/machineFactory.ts
append: true
---

/**
 * Build a {@link <%= Name %>Machine}
 */
export function build<%= Name %>Machine(): <%= Name %>Machine {
  return create<%= Name %>Machine();
}