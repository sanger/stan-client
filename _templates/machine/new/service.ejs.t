---
to: src/lib/services/<%= name %>Service.ts
---
import { <%= Name %>Machine } from "../machines/<%= name %>/<%= name %>MachineTypes";
import { build<%= Name %>Machine } from "../factories/machineFactory";

export async function get<%= Name %>Machine(): Promise<<%= Name %>Machine> {
  return Promise.resolve(build<%= Name %>Machine());
}
