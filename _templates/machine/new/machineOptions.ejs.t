---
to: src/lib/machines/<%= name %>/<%= name %>MachineOptions.ts
---
import { MachineOptions } from "xstate";
import { assign } from "@xstate/immer";
import { <%= Name %>Context } from "./<%= name %>Context";
import { <%= Name %>Events } from "./<%= name %>Events";

export enum Actions {}

export enum Activities {}

export enum Delays {}

export enum Guards {}

export enum Services {}

export const <%= name %>MachineOptions: Partial<MachineOptions<
  <%= Name %>Context,
  <%= Name %>Events
>> = {
  actions: {},
  activities: {},
  delays: {},
  guards: {},
  services: {},
}