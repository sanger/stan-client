---
to: src/lib/machines/<%= name %>/sectioningOutcomeTypes.ts
---
import { <%= Name %>Events } from "./<%= name %>Events";
import { <%= Name %>Context } from "./<%= name %>Context";
import { <%= Name %>Schema } from "./<%= name %>States";
import { create<%= Name %>Machine } from "./<%= name %>Machine";
import { Interpreter } from "xstate";

type <%= Name %>MachineType = Interpreter<
  <%= Name %>Context,
  <%= Name %>Schema,
  <%= Name %>Events
>;

export default create<%= Name %>Machine;

export type {
  <%= Name %>MachineType,
  <%= Name %>Schema,
  <%= Name %>Context,
  <%= Name %>Events
};