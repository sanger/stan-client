---
inject: true
to: src/lib/factories/machineFactory.ts
before: HYGEN MARKER
---
import create<%= Name %>Machine from "../machines/<%= name %>/<%= name %>Machine";
import { <%= Name %>Machine } from "../machines/<%= name %>/<%= name %>MachineTypes";